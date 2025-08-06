import { ChatAnthropic } from "@langchain/anthropic";
import { ToolNode } from "@langchain/langgraph/prebuilt"
import wxflows from "@wxflows/sdk/langchain";
import { END, MemorySaver, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import SYSTEM_MESSAGE from "@/constants/systemMessage";
import { AIMessage, BaseMessage, HumanMessage, SystemMessage, ToolMessage, trimMessages } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts"
import { stat } from "fs";
import { exportTraceState } from "next/dist/trace";


// Trim the messages to manage converstational history
const trimmer = trimMessages({
  maxTokens: 10,
  strategy: "last",
  tokenCounter: (msgs) => msgs.length,
  includeSystem: true,
  allowPartial: false,
  startOn: "human"
})
const toolClient = new wxflows({
  endpoint: process.env.WXFLOWS_ENDPOINT || "",
  apikey: process.env.WXFLOWS_APIKEY,
})

const tools = await toolClient.lcTools;
const toolNode = new ToolNode(tools)
const initialisedModel = () => {
  const model = new ChatAnthropic({
    modelName: "claude-3-5-sonnet-20241022",
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    temperature: 0.7,
    maxTokens: 4096,
    streaming: true,
    clientOptions: {
      defaultHeaders: {
        "anthropic-beta": "prompt-caching-2024-07-31",
      }
    },
    callbacks: [{
      handleLLMStart: async () => {
        console.log("🤖 Starting LLM call")
      },
      handleLLMEnd: async (output) => {
        console.log("🤖 Ending LLM Call", output);
        const usage = output.llmOutput?.usage;
        if (usage) {

        }
      }
    }]
  }).bindTools(tools);

  return model;
}

function shouldContinue(state: typeof MessagesAnnotation.State) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;

  if (lastMessage.tool_calls?.length) {
    return "tools";
  }

  if (lastMessage.content && lastMessage._getType() === "tool") {
    return "agent";
  }

  return END;
}
const creatWorkflow = () => {
  const model = initialisedModel();

  const stateGraph = new StateGraph(MessagesAnnotation)
    .addNode(
      "agent",
      async (state) => {
        // Create system message content
        const systemContent = SYSTEM_MESSAGE;

        // Create the prompt template with system messages and messages placeholder
        const promptTemplate = ChatPromptTemplate.fromMessages([
          new SystemMessage(systemContent, {
            cache_control: { type: "ephemeral" },
          }),
          new MessagesPlaceholder("messages"),
        ]);

        // Trim messages to manage conversation history
        const trimmedMessages = await trimmer.invoke(state.messages);

        // Format prompts with the current messages
        const prompt = await promptTemplate.invoke({ messages: trimmedMessages });

        // Get response from the model
        const response = await model.invoke(prompt);
        return { messages: [...state.messages, response] };
      })
    .addEdge(START, "agent")
    .addNode("tools", toolNode)
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent")

  return stateGraph;
}

function addCachingHeaders(messages: BaseMessage[]): BaseMessage[]{
  //Rules of caching headers for turn-by-turn conversations
  //1. Cache the first SYSTEM message
  //2. Cache the LAST Message
  //3. Cache the second to last HUMAN message

  if (!messages.length) return messages;
  // Create a copy of messages to avoid mutation the original
  const cachedMessages = [...messages];

  // Helper to add cache control 
  const addCache = (message: BaseMessage)=>{
    // Only modify if content is a string, not already an array
    if (typeof message.content === "string") {
      message.content = [
        {
          type: "text",
          text: message.content,
          cache_control: { type:"ephemeral"},
        }
      ];
    }
  }

  // Cache the last message
  // console.log("Caching last message")
  addCache(cachedMessages.at(-1)!);

  // Find and cache the second-to-last human message
  let humanCount = 0;
  for(let i = cachedMessages.length-1; i>=0; i--){
    humanCount++;
    if(humanCount ===2 ){
      //console.log("chacing second to last human Message")
      addCache(cachedMessages[i]);
      break;
    }
  }
  return cachedMessages;
}
export async function submitQuestion(messages: BaseMessage[], chatId: string) {
  // Add caching Headers to message
  const cachedMessages = addCachingHeaders(messages);
  console.log("Messages:",cachedMessages);

  const workflow = creatWorkflow();

  // Create a check point to save the state of the conversation
  const checkpointer = new MemorySaver();
  const app = workflow.compile({ checkpointer });

  // Run the Graph and stream
  const stream = await app.streamEvents(
    {
      messages: cachedMessages,
    },
    {
      version: "v2",
      configurable: {
        thread_id: chatId,
      },
      streamMode: 'messages',
      runId: chatId,
    }
  );
  return stream;
}
