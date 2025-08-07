import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { submitQuestion } from "@/lib/langgraph";
import { ChatRequestBody, SSE_DATA_PREFIX, SSE_LINE_DELIMITER, StreamMessage, StreamMessageType } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { NextResponse } from "next/server";
import { WritableStreamDefaultWriter } from "stream/web";

function sendSSEMessage(
  write: WritableStreamDefaultWriter<Uint8Array>,
  data: StreamMessage
) {
  const encoder = new TextEncoder();
  return write.write(
    encoder.encode(
      `${SSE_DATA_PREFIX}${JSON.stringify(data)}${SSE_LINE_DELIMITER}`
    )
  );
}
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }
    const body = (await req.json()) as ChatRequestBody;

    const { messages, newMessage, chatId } = body;

    const convex = getConvexClient();

    // Create stream with larger queue stratergy for better Performance
    const stream = new TransformStream({}, { highWaterMark: 1024 });
    const writer = stream.writable.getWriter();

    const response = new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      }
    });

    const startStream = async () => {
      try {
        // Stream will be implemented here

        // Send initial connection establishment message
        await sendSSEMessage(writer, { type: StreamMessageType.Connected });

        // User message is already saved in ChatInterface, no need to save again here

        //Converting messages to Langchain format 
        const langChainMessages = [
          ...messages.map((msg) =>
            msg.role === "user"
              ? new HumanMessage(msg.content)
              : new AIMessage(msg.content)
          ),
          new HumanMessage(newMessage),
        ];

        let fullResponse = "";
        
        try {
          // Creating event stream
          const eventStream = await submitQuestion(langChainMessages, chatId);

          // Process the events 
          for await (const event of eventStream) {
            // Console.log("Event:", event);

            if (event.event === "on_chat_model_stream") {
              const token = event.data.chunk;
              if (token) {
                // Access the text property from the AIMessageChunk
                const text = token.content.at(0)?.["text"];

                if (text) {
                  fullResponse += text; // Accumulate response
                  await sendSSEMessage(writer, {
                    type: StreamMessageType.Token,
                    token: text,
                  })
                }
              }
            } else if (event.event === "on_tool_start") {
              await sendSSEMessage(writer,{
                type: StreamMessageType.ToolStart,
                tool: event.name || "Unknown",
                input: event.data.input,
              })
            } else if (event.event === "on_tool_end") {
              await sendSSEMessage(writer, {
                type: StreamMessageType.ToolEnd,
                tool: event.name || "unknown",
                output: event.data.output,
              })
            }
          }
          
          // Assistant message will be saved in ChatInterface when StreamMessageType.Done is received
          
          // Send completion message
          await sendSSEMessage(writer, {type: StreamMessageType.Done})
        } catch (streamError) {
          console.error("Error in event stream:", {
            error: streamError,
            chatId,
            messageCount: langChainMessages.length,
            timestamp: new Date().toISOString()
          });
          
          // Save error response if we have partial content
          if (fullResponse.trim()) {
            try {
              await convex.mutation(api.messages.store, {
                chatId,
                content: fullResponse + "\n\n[Response interrupted due to error]",
                role: "assistant"
              });
            } catch (saveError) {
              console.error("Failed to save partial response:", saveError);
            }
          }
          
          await sendSSEMessage(writer, {
            type: StreamMessageType.Error,
            error: streamError instanceof Error 
              ? `Processing error: ${streamError.message}`
              : "Stream processing failed",
          });
        }
      } catch (error) {
        console.error("Critical error in stream:", {
          error,
          chatId,
          userId,
          timestamp: new Date().toISOString()
        });
        
        await sendSSEMessage(writer, {
          type: StreamMessageType.Error,
          error: error instanceof Error ? error.message : "Unknown error occurred",
        });
      } finally{
        try{
          await writer.close();
        } catch (closeError){
          console.error("Error closing writer", closeError);
        }
      }
    };
    startStream();

    return response;

  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({
      error: "Failed to process the chat"
    } as const, {
      status: 500
    })
  }
}