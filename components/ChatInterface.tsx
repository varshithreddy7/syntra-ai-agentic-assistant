"use client"
import { Doc, Id } from '@/convex/_generated/dataModel'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { ChatRequestBody, StreamMessageType } from '@/lib/types';
import { createSSEParser } from '@/lib/createSSEParser';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import MessageBubble from './MessageBubble';
import WelcomeMessage from './WelcomeMessage';

interface ChatInterfaceProps {
  chatId: Id<"chats">
  initialMessages: Doc<"messages">[];
}
function ChatInterface({ chatId, initialMessages }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Doc<"messages">[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [currentTool, setCurrentTool] = useState<{
    name: string;
    input: unknown;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatToolOutput = (output: unknown): string => {
    if (typeof output === "string") return output;
    return JSON.stringify(output, null, 2);
  }

  const formatTerminalOutput = (
    tool: string,
    input: unknown,
    output: unknown
  ) => {
    const terminalHtml = `<div class="bg-[#1e1e1e] text-white font-mono p-2 rounded-md my-2 overflow-x-auto whitespace-normal max-w-[600px]">
      <div class="flex items-center gap-1.5 border-b border-gray-700 pb-1">
        <span class="text-red-500">●</span>
        <span class="text-yellow-500">●</span>
        <span class="text-green-500">●</span>
        <span class="text-gray-400">●</span>
      </div>
      <div class="text-gray-400 mt-1">$ Input</div>
      <pre class="text-yellow-400 mt-0.5 whitespace-pre-wrap overflow-x-auto">${formatToolOutput(input)}</pre>
      <div class="text-gray-400 mt-2">$ Output</div>
      <pre class="text-green-400 mt-0.5 whitespace-pre-wrap overflow-x-auto">${formatToolOutput(output)}</pre>
    </div>`;

    return `---START---\n${terminalHtml}\n---END---`;
  }

  const processStream = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onChunk: (chunk: string) => Promise<void>
  ) => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await onChunk(new TextDecoder().decode(value));
      }
    } finally {
      reader.releaseLock();
    }
  }
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInputs = input.trim();
    if (!trimmedInputs || isLoading) return;

    setInput("");
    setStreamedResponse("");
    setCurrentTool(null);
    setLoading(true);

    //setting up optimistic message in the chatting btwn assitant and user
    const optimisticUserMessage: Doc<"messages"> = {
      _id: `temp_${Date.now()}`,
      chatId,
      content: trimmedInputs,
      role: "user",
      createdAt: Date.now(),
    } as Doc<"messages">;

    setMessages((prev) => [...prev, optimisticUserMessage]);

    //Track complete responses for saving to database
    let fullResponse = "";

    // Start streaming response
    try {
      const requestBody: ChatRequestBody = {
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        newMessage: trimmedInputs,
        chatId,
      };
      
      // Save user message to database and remove optimistic message
      const convex = getConvexClient();
      await convex.mutation(api.messages.store, {
        chatId,
        content: trimmedInputs,
        role: "user"
      });
      
      // Remove the optimistic user message and fetch real data
      const freshMessages = await convex.query(api.messages.list, { chatId });
      setMessages(freshMessages);

      // Intialising the SSE-server sent events connection
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error(await response.text());
      if (!response.body) throw new Error("No response body available");
      
      //----Handle the stream----
      // Create an SSE parser and stream reader
      const parser = createSSEParser();
      const reader = response.body.getReader();

      // Processing the stream chunks
      await processStream(reader, async (chunk) => {
        //parse SSE message from the chunk 
        const parsedMessages = parser.parse(chunk);
        
        // Handle each parsed message
        for (const message of parsedMessages) {
          switch (message.type) {
            case StreamMessageType.Token:
              if ("token" in message) {
                fullResponse += message.token;
                setStreamedResponse(fullResponse);
              }
              break;
            case StreamMessageType.ToolStart:
              if ("tool" in message) {
                setCurrentTool({
                  name: message.tool,
                  input: message.input,
                });
                fullResponse += formatTerminalOutput(
                  message.tool,
                  message.input,
                  "Processing..."
                );
                setStreamedResponse(fullResponse);
              }
              break;

            case StreamMessageType.ToolEnd:
              if ("tool" in message && currentTool) {
                const lastTerminalIndex = fullResponse.lastIndexOf(
                  '---START---'
                );
                if (lastTerminalIndex !== -1) {
                  fullResponse = fullResponse.substring(0, lastTerminalIndex) + formatTerminalOutput(
                    message.tool,
                    currentTool.input,
                    message.output
                  );
                  setStreamedResponse(fullResponse);
                }
                setCurrentTool(null);
              }
              break;

            case StreamMessageType.Error:
              if ("error" in message) {
                throw new Error(message.error);
              }
              break;

            case StreamMessageType.Done:
              // Save the complete message to the Database
              await convex.mutation(api.messages.store, {
                chatId,
                content: fullResponse,
                role: "assistant"
              });

              // Remove optimistic messages and fetch fresh data from database
              // This prevents duplicates when refreshing
              const updatedMessages = await convex.query(api.messages.list, { chatId });
              setMessages(updatedMessages);
              setStreamedResponse("");
              return;
          }
        }
      });

    } catch (error) {
      console.error("Error sending message", error);

      setMessages((prev) =>
        prev.filter((msg) => msg._id !== optimisticUserMessage._id)
      );
      setStreamedResponse(
        formatTerminalOutput(
          "error",
          "Failed to process message",
          error instanceof Error ? error.message : "Unknown error"
        )
      )
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className='flex flex-col h-[calc(100vh-theme(spacing.14))]'>
      {/* Messages */}
      <section className='flex-1 overflow-y-auto bg-gray-100 p-2 md:p-0'>
        <div className="max-w-4xl mx-auto p-4 space-y-3">
          {messages?.length === 0 && (
            <WelcomeMessage 
              onExampleClick={(example) => {
                setInput(example);
                // Auto-submit the example
                setTimeout(() => {
                  const form = document.querySelector('form');
                  if (form) form.requestSubmit();
                }, 100);
              }}
            />
          )}
          {/* Messages */}
          {messages?.map((message: Doc<"messages">) => (
            <MessageBubble
              key={message._id}
              content={message.content}
              isUser={message.role == "user"}
            />
          ))}
          {streamedResponse && <MessageBubble content={streamedResponse} isUser={false} />}

          {/*Loading Indicator */}
          {isLoading && !streamedResponse && (
            <div className='flex justify-start animate-in fade-in-0'>
              <div className='rounded-2xl px-4 py-3 bg-white text-gray-900 rounded-bl-none shadow-sm ring-1 ring-inset ring-gray-200 relative'>
                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1.5'>
                    {[0.3, 0.15, 0].map((delay, i) => (
                      <div key={i} className='h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce'
                        style={{ animationDelay: `-${delay}s` }}
                    />
                    ))}
                  </div>
                  <span className='text-sm text-gray-500'>Syntra is thinking...</span>
                </div>
                <div className='absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2'>
                  <div className='w-8 h-8 rounded-full border-2 bg-blue-600 border-white flex items-center justify-center shadow-sm'>
                    <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full'></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Last Message */}
          <div ref={messagesEndRef} />
        </div>
      </section>
      {/* For Inputs */}
      <footer className='border-t bg-white p-4'>
        <form onSubmit={handleSubmit} className='max-w-4xl mx-auto relative'>
          <div className='relative flex items-center'>
            <input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={messages?.length === 0 ? 'Ask me anything or try the examples above...' : 'Continue the conversation...'}
              className='flex-1 py-3 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 bg-gray-50 placeholder:text-gray-500'
              disabled={isLoading}
            />
            <Button
              type='submit'
              disabled={isLoading || !input.trim()}
              className={`absolute right-1.5 rounded-xl h-9 w-9 p-0
              flex items-center justify-center transition-all 
              ${input.trim()
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  : "bg-gray-100 text-gray-400"
                }`}
            >
              <ArrowRight />
            </Button>

          </div>
        </form>
      </footer>
    </main>
  )
}

export default ChatInterface