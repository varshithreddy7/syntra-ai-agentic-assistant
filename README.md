<div align="center">

<img src="/public/logo.png" alt="Syntra AI Logo" width="100" height="100" style="border-radius: 20px;" />

# Syntra AI — Agentic Assistant

### *A production-grade conversational AI system powered by Claude 3.5 Sonnet, LangGraph, and IBM WXFlows*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Convex](https://img.shields.io/badge/Convex-Realtime_DB-EF5B2B?style=for-the-badge)](https://convex.dev/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk)](https://clerk.dev/)
[![Anthropic](https://img.shields.io/badge/Claude_3.5_Sonnet-Anthropic-D97757?style=for-the-badge)](https://anthropic.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Agent_Orchestration-1C3C3C?style=for-the-badge)](https://langchain-ai.github.io/langgraph/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

**[Live Demo](https://syntra-ai.vercel.app)** · **[Report a Bug](https://github.com/varshithreddy7/syntra-ai-agent-assistant/issues)** · **[Request Feature](https://github.com/varshithreddy7/syntra-ai-agent-assistant/issues)**

</div>

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [Key Technical Achievements](#-key-technical-achievements)
- [System Architecture](#️-system-architecture)
- [Tech Stack](#-tech-stack)
- [Feature Breakdown](#-feature-breakdown)
- [Core Data Flow](#-core-data-flow)
- [LangGraph Agent Design](#-langgraph-agent-design)
- [SSE Streaming Pipeline](#-sse-streaming-pipeline)
- [WXFlows Tool Integration](#-wxflows-tool-integration)
- [Database Schema](#️-database-schema)
- [Authentication & Security](#-authentication--security)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Author](#-author)

---

## 🌟 Project Overview

**Syntra AI** is a **production-ready, full-stack agentic AI assistant** that goes far beyond a traditional chatbot. It implements a fully autonomous **AI agent** capable of reasoning through complex multi-step problems and executing real-world tasks by dynamically invoking external tools — all delivered through a seamless, real-time streaming interface.

The project demonstrates mastery across the complete modern AI application stack:

> **Agent Design** → **Real-time Streaming** → **Tool Orchestration** → **Persistent Storage** → **Secure Authentication** → **Production Deployment**

Unlike simple LLM wrappers, Syntra's agent can:
- **Decide autonomously** which tools to call (and in what order) to answer a question
- **Stream responses token-by-token** while showing intermediate tool execution states
- **Maintain session memory** across a conversation thread using a stateful graph
- **Cache prompt prefixes** to reduce API costs and improve latency using Anthropic's prompt caching API

This project was built to demonstrate **industry-level AI engineering practices** — not just AI API calls, but the full engineering discipline around building reliable, scalable, and user-facing AI systems.

---

## 🏆 Key Technical Achievements

| Achievement | Technology / Pattern Used |
|---|---|
| ✅ Token-by-token real-time streaming | Server-Sent Events (SSE) + TransformStream |
| ✅ Autonomous multi-step tool orchestration | LangGraph `StateGraph` with conditional edges |
| ✅ Per-conversation memory with checkpointing | LangGraph `MemorySaver` keyed by `chatId` |
| ✅ Prompt caching for cost & latency optimization | Anthropic `prompt-caching-2024-07-31` beta |
| ✅ Live real-time database sync | Convex reactive queries |
| ✅ Secure, isolated user data | Clerk JWT + Convex auth guards |
| ✅ Tool invocation visualization | Terminal-style HTML rendering mid-stream |
| ✅ Optimistic UI updates | Temporary message state before DB confirmation |
| ✅ Graceful error recovery | Partial response saving + SSE error propagation |
| ✅ Full DX with TypeScript | End-to-end type safety from DB schema to UI |
| ✅ SEO-complete metadata | Full Open Graph, Twitter Card, robots configuration |
| ✅ Responsive, accessible layout | Mobile hamburger nav, Radix UI primitives |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                            │
│                                                                     │
│  ┌──────────────┐    ┌─────────────────┐    ┌───────────────────┐  │
│  │  Landing     │    │    Dashboard    │    │   Chat Page       │  │
│  │  page.tsx    │    │    page.tsx     │    │  [chatId]/page.tsx │  │
│  └──────┬───────┘    └────────┬────────┘    └────────┬──────────┘  │
│         │                     │                      │             │
│         └─────────────────────┴──────────────────────┘             │
│                               │                                     │
│                    ┌──────────▼────────────┐                       │
│                    │    ChatInterface.tsx   │                       │
│                    │  (SSE stream consumer) │                       │
│                    └──────────┬────────────┘                       │
│                               │                                     │
│              ╔════════════════╪════════════════════╗               │
│              ║  ConvexClientProvider (React Context)║               │
│              ║  ClerkProvider + ConvexReactClient   ║               │
│              ╚════════════════╪════════════════════╝               │
└──────────────────────────────┼──────────────────────────────────────┘
                                │  HTTP POST + SSE stream
                ┌───────────────▼────────────────────────────────────┐
                │          Next.js API Route (Edge Runtime)           │
                │          /api/chat/stream/route.ts                  │
                │                                                     │
                │  1. Clerk auth() guard                              │
                │  2. Build LangChain message array                   │
                │  3. Open TransformStream (SSE response)             │
                │  4. Call submitQuestion() → LangGraph               │
                │  5. Pipe on_chat_model_stream events as SSE tokens  │
                │  6. Pipe on_tool_start/end events                   │
                │  7. Send Done signal                                │
                └───────────┬────────────────────────────────────────┘
                            │
              ┌─────────────▼──────────────────────────────────────┐
              │              LangGraph Agent (lib/langgraph.ts)     │
              │                                                     │
              │  ┌──────────────────────────────────────────────┐  │
              │  │           StateGraph (MessagesAnnotation)     │  │
              │  │                                              │  │
              │  │   START ──► [agent node] ──► shouldContinue  │  │
              │  │                  ▲               │            │  │
              │  │                  │          tool_calls?       │  │
              │  │                  │           YES │  NO        │  │
              │  │           [tools node]◄──────────┘   └──► END │  │
              │  └──────────────────────────────────────────────┘  │
              │                                                     │
              │  Model: claude-3-5-sonnet         Checkpointer: MemorySaver │
              │  Caching: Anthropic ephemeral     Trimmer: last 10 msgs     │
              └─────────────┬──────────────────────────────────────┘
                            │  GraphQL over HTTPS
              ┌─────────────▼────────────────────────────────────┐
              │              IBM WXFlows Tool Platform            │
              │                                                   │
              │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
              │  │Wikipedia │ │ YouTube  │ │  Google Books    │ │
              │  └──────────┘ └──────────┘ └──────────────────┘ │
              │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
              │  │  Math    │ │ Exchange │ │  Customer Data   │ │
              │  │(Wolfram) │ │  Rates   │ │   (curl API)     │ │
              │  └──────────┘ └──────────┘ └──────────────────┘ │
              └──────────────────────────────────────────────────┘

              ┌────────────────────────────────────────────────────┐
              │              Convex Serverless Database            │
              │                                                    │
              │   chats table              messages table          │
              │   ├── title                ├── chatId (FK)         │
              │   ├── userId (Clerk)       ├── content             │
              │   └── createdAt           ├── role (user│assistant)│
              │                           └── createdAt            │
              └────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 15.3.3 | React framework with App Router & Server Components |
| **React** | 19.0.0 | UI library with concurrent rendering |
| **TypeScript** | 5.x | Static typing across the entire codebase |
| **Tailwind CSS** | 4.x | Utility-first styling with custom design tokens |
| **Radix UI** | Latest | Accessible, unstyled component primitives |
| **Shadcn/UI** | n/a | Pre-built components (Button, Avatar) on top of Radix |
| **Lucide React** | 0.511 | Icon library |
| **tw-animate-css** | 1.3.2 | Animation utilities |

### Backend & AI
| Technology | Version | Purpose |
|---|---|---|
| **Next.js API Routes** | 15.3.3 | Serverless API endpoint for streaming |
| **LangGraph** | 0.4.0 | Agent state graph orchestration |
| **LangChain** | 0.3.30 | Base AI tooling, message types, prompt templates |
| **@langchain/anthropic** | 0.3.25 | Claude model integration |
| **@langchain/core** | 0.3.66 | Core primitives (trimMessages, BaseMessage, etc.) |
| **@wxflows/sdk** | 2.0.0-beta.1 | IBM WXFlows tool loading for LangChain |
| **Convex** | 1.24.3 | Serverless real-time database + backend functions |

### Auth & Infrastructure
| Technology | Purpose |
|---|---|
| **Clerk** | Complete authentication (email, OAuth, JWT) |
| **Convex + Clerk** | `ConvexProviderWithClerk` for JWT-secured DB access |
| **Vercel** | Production deployment & edge functions |
| **PNPM** | Fast, disk-efficient package manager |

---

## ✨ Feature Breakdown

### 🧠 Autonomous Agent System
Syntra's core is a **LangGraph `StateGraph`** — not a simple chain. The agent enters a decision loop:
1. The **agent node** calls Claude with the full prompt + tool schemas
2. `shouldContinue()` inspects the response — if Claude requested tool calls, route to the **tools node**
3. The **tools node** runs the WXFlows GraphQL calls and appends tool results to the message state
4. The graph loops back to the agent node, giving Claude the tool results
5. This continues until Claude produces a final response with no tool calls → `END`

This design allows **multi-step reasoning**: Claude can call Wikipedia, then use those results to call another tool, then synthesize a final answer — all autonomously.

### ⚡ Real-time Token Streaming
Every response streams token-by-token using **Server-Sent Events (SSE)**:
- A `TransformStream` is created on the server and bound to the HTTP response
- LangGraph's `streamEvents()` API emits `on_chat_model_stream` events
- Each token is encoded and pushed to the SSE stream instantly
- The client-side `createSSEParser` buffers and deserializes chunks
- React state updates per-token, giving a "typing" effect in the UI

### 🔧 Tool Execution Visualization
When the agent invokes a tool, the user sees it happen in real-time:
- `on_tool_start` event → renders a terminal-style HTML block with the tool input and `"Processing..."` placeholder
- `on_tool_end` event → replaces the placeholder with the actual tool output
- All rendered inside `MessageBubble` using scoped `dangerouslySetInnerHTML` with XSS escaping

### 💾 Persistent Chat History
- Every conversation is a `chat` document in Convex, scoped to the authenticated user via Clerk's `identity.subject`
- Messages are persisted after both user input and AI response completion
- Optimistic UI updates show the user's message instantly while Convex write completes in the background
- Convex reactive queries automatically update the sidebar chat list in real-time

### 🗺️ Smart Prompt Management
- **Message trimming** (`trimMessages`) keeps the last 10 messages in context, always preserving the system prompt — prevents context window overflow
- **Prompt caching** (`addCachingHeaders`) marks the last message and second-to-last human message with Anthropic's `cache_control: {type: "ephemeral"}` — reduces API costs on repeated turns

### 📱 Responsive UI
- Mobile: collapsible sidebar with `NavigationProvider` context managing open/close state, hamburger menu in the Header
- Desktop: fixed sidebar (272px) + fluid content column
- Chat route shows a skeleton pulse loader (`loading.tsx`) via Next.js Suspense

---

## 🔄 Core Data Flow

### Sending a Message (Complete Trace)

```
User types → form submit → handleSubmit()
  │
  ├── 1. Create optimistic user message (temp ID) → append to local state
  │
  ├── 2. convex.mutation(api.messages.store, { role: "user" })
  │         → Convex validates identity.subject matches chatId owner
  │
  ├── 3. convex.query(api.messages.list) → refresh messages from DB
  │
  ├── 4. fetch("POST /api/chat/stream", { messages, newMessage, chatId })
  │
  │   [SERVER: /api/chat/stream/route.ts]
  │   ├── auth() → validate Clerk JWT → get userId
  │   ├── Build LangChain message array (HumanMessage / AIMessage)
  │   ├── Open TransformStream + send SSE response headers immediately
  │   ├── startStream() (async, non-blocking)
  │   │     └── submitQuestion(langChainMessages, chatId)
  │   │           └── LangGraph workflow.compile({ checkpointer })
  │   │                 .streamEvents({ thread_id: chatId, version: "v2" })
  │   │
  │   └── Response returned to client (SSE channel open)
  │
  ├── 5. Client reads SSE stream via ReadableStream reader
  │       createSSEParser().parse(chunk) → StreamMessage[]
  │
  │   Per message type:
  │   ├── Connected    → handshake (no UI change)
  │   ├── Token        → fullResponse += token; setStreamedResponse(fullResponse)
  │   ├── ToolStart    → append terminal block with "Processing..." to fullResponse
  │   ├── ToolEnd      → replace "Processing..." in last ---START--- block with actual output
  │   ├── Error        → show error in terminal block
  │   └── Done         → convex.mutation(api.messages.store, { role: "assistant", content: fullResponse })
  │                       → convex.query(api.messages.list) → set final messages
  │                       → setStreamedResponse("") → clear streaming buffer
  │
  └── 6. UI shows persisted messages; sidebar ChatRow shows TimeAgo timestamp
```

---

## 🤖 LangGraph Agent Design

The agent in `lib/langgraph.ts` implements the **ReAct (Reason + Act)** paradigm using LangGraph's low-level graph API.

```typescript
// Conditional routing — the heart of the agent loop
function shouldContinue(state: typeof MessagesAnnotation.State) {
  const lastMessage = state.messages.at(-1) as AIMessage;

  if (lastMessage.tool_calls?.length) return "tools";   // → invoke tools
  if (lastMessage._getType() === "tool") return "agent"; // → let Claude process results
  return END;                                            // → done
}

// Graph topology
StateGraph(MessagesAnnotation)
  .addNode("agent", agentNode)     // Claude reasoning step
  .addNode("tools", toolNode)      // WXFlows tool execution
  .addEdge(START, "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent")       // Tool results always go back to agent
```

### Prompt Caching Strategy
```
Messages in conversation: [sys, h1, a1, h2, a2, h3, ...]
                                              ↑   ↑
                                cache_control applied here (last + 2nd-to-last human)
```
This ensures Claude's computation for stable prefixes is reused across API calls — significantly reducing cost and latency on long conversations. The system message itself also uses `cache_control: { type: "ephemeral" }`.

---

## 📡 SSE Streaming Pipeline

### Server Side (`/api/chat/stream/route.ts`)
```
TransformStream (highWaterMark: 1024)
  ↓ writer
  SSE format: "data: {json}\n\n"
  Headers: Content-Type: text/event-stream | Connection: keep-alive | X-Accel-Buffering: no
```

### Message Protocol (`lib/types.ts`)
```typescript
enum StreamMessageType {
  Token     = "token",       // { token: string }
  ToolStart = "tool_start",  // { tool: string, input: unknown }
  ToolEnd   = "tool_end",    // { tool: string, output: unknown }
  Connected = "connected",   // {} — handshake
  Done      = "done",        // {} — stream complete
  Error     = "error",       // { error: string }
}
```

### Client Side (`lib/createSSEParser.tsx`)
```
ReadableStream chunks (Uint8Array)
  → TextDecoder → string chunks
  → buffer + chunk → split by "\n"
  → filter lines starting with "data: "
  → strip prefix → JSON.parse → validate type
  → StreamMessage[]
```
The parser maintains a buffer for incomplete lines split across chunks, making it robust against network fragmentation.

---

## 🔌 WXFlows Tool Integration

IBM WXFlows provides a unified GraphQL interface over multiple external APIs. All 7 tools are declared as GraphQL-materializable queries in `wxflows/tools.graphql`.

### Tool Definitions

```graphql
# Wikipedia — current events & factual lookup
wikipediaTool: TC_GraphQL
  @materializer(query: "tc_graphql_tool", arguments: [
    { name: "name", const: "wikipedia" }
    { name: "description", const: "Retrieve information from Wikipedia." }
    { name: "fields", const: "search|page" }
  ])

# YouTube Transcript — extract video captions
youtube_transcript: TC_GraphQL
  @materializer(query: "tc_graphql_tool", arguments: [
    { name: "name", const: "youtube_transcript" }
    { name: "fields", const: "transcript" }
  ])

# Math — Wolfram Alpha for computations
math: TC_GraphQL
  @materializer(query: "tc_graphql_tool", arguments: [
    { name: "name", const: "math" }
    { name: "fields", const: "wolframAlpha" }
  ])
# ... + google_books, exchange, curl_comments, customer_data
```

### How Tools Load
```typescript
// lib/langgraph.ts
const toolClient = new wxflows({ endpoint, apikey });
const tools = await toolClient.lcTools;  // → LangChain-compatible StructuredTool[]
const toolNode = new ToolNode(tools);    // → LangGraph tool execution node
```

The model is bound to tools via `.bindTools(tools)`, which injects the tool schemas into the Claude API call. Claude then generates structured `tool_calls` when it decides to use a tool.

### Tool Usage Examples (from System Prompt)
```graphql
# Wikipedia search
{ "query": "query SearchWiki($q: String!) { search(q: $q) }", "variables": "{\"q\": \"your search\"}" }

# YouTube transcript
{ "query": "{ transcript(videoUrl: $videoUrl, langCode: $langCode) { title captions { text } } }", "variables": "{\"videoUrl\": \"https://www.youtube.com/watch?v=ID\"}" }

# Currency exchange
{ "query": "{ exchangeRates(from: $from, to: $to, amount: $amount) }", "variables": "{\"from\": \"USD\", \"to\": \"EUR\", \"amount\": 100}" }
```

---

## 🗄️ Database Schema

Convex uses a schema-first approach with full TypeScript inference across queries and mutations.

```typescript
// convex/schema.ts
export default defineSchema({
  chats: defineTable({
    title:     v.string(),   // Chat title (set to "New Chat" or timestamped)
    userId:    v.string(),   // Clerk identity.subject — user-scoped isolation
    createdAt: v.number(),   // Unix timestamp
  }).index("by_user", ["userId"]),  // Enables O(log n) user-specific queries

  messages: defineTable({
    chatId:    v.id("chats"),                              // FK → chats table
    content:   v.string(),                                 // Full message text
    role:      v.union(v.literal("user"), v.literal("assistant")),
    createdAt: v.number(),
  }).index("by_chart", ["chatId"]),  // Enables O(log n) per-chat message fetch
});
```

### Database Functions

| Function | Type | Description |
|---|---|---|
| `chats.createChat` | Mutation | Creates a new chat, validates Clerk identity |
| `chats.deleteChat` | Mutation | Deletes chat + all its messages (cascading) |
| `chats.listChats` | Query | Lists all chats for the authenticated user, ordered newest-first |
| `messages.list` | Query | Lists all messages for a chatId, ordered ascending |
| `messages.store` | Mutation | Stores a message with escape-sequence sanitization |
| `messages.getLastMessage` | Query | Fetches the latest message for sidebar preview + timestamp |

---

## 🔐 Authentication & Security

### Authentication Flow
```
User visits site
  → Clerk ClerkProvider wraps the tree
  → middleware.ts (clerkMiddleware) runs on every request
  → Signed-out users land on public landing page
  → Sign-in via Clerk modal (email/password or OAuth)
  → JWT issued by Clerk
  → ConvexProviderWithClerk passes JWT to Convex client
  → Convex validates JWT on every mutation/query via auth.config.ts domain check
```

### Data Isolation
- Every Convex mutation checks `ctx.auth.getUserIdentity()` before any DB operation
- `deleteChat` additionally validates `chat.userId === identity.subject` to prevent IDOR attacks
- Server-side `ChatPage` uses `auth()` from `@clerk/nextjs/server` — unauthenticated requests are redirected server-side (no client-side flash)

### API Security
- The `/api/chat/stream` endpoint validates `auth()` on every request — returns `401` if no valid Clerk session exists
- Environment variables hold all secrets (Anthropic key, WXFlows API key) — never exposed to the client bundle

---

## 📁 Project Structure

```
syntra-ai-agent-assistant/
│
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout — Convex provider, full SEO metadata
│   ├── page.tsx                      # Public landing page — hero, auth buttons, features
│   ├── globals.css                   # Tailwind v4 theme — light/dark CSS vars (oklch)
│   │
│   ├── api/
│   │   └── chat/
│   │       └── stream/
│   │           └── route.ts          # ★ Core SSE streaming API endpoint
│   │
│   └── dashboard/
│       ├── layout.tsx                # Dashboard shell — NavigationProvider, Sidebar, Header
│       ├── page.tsx                  # Dashboard home — stats cards, new chat CTA
│       └── chat/
│           └── [chatId]/
│               ├── page.tsx          # Server Component — fetch initial messages, auth guard
│               └── loading.tsx       # Suspense fallback — animated skeleton
│
├── components/
│   ├── ChatInterface.tsx             # ★ Main chat component — input, SSE consumer, state
│   ├── MessageBubble.tsx             # Per-message renderer — markdown + HTML tool output
│   ├── WelcomeMessage.tsx            # Onboarding — capability cards + example prompts
│   ├── Sidebar.tsx                   # Chat history list — create/delete, mobile overlay
│   ├── ChatRow.tsx                   # Individual chat item — title, TimeAgo timestamp
│   ├── Header.tsx                    # Top bar — hamburger, back button, Clerk UserButton
│   ├── ConvexClientProvider.tsx      # Clerk + Convex React provider bridge
│   ├── DynamicFavicon.tsx            # Headless component — dynamic title + favicon
│   └── ui/
│       ├── button.tsx                # Shadcn Button (cva variants)
│       └── avatar.tsx                # Shadcn Avatar with fallback
│
├── lib/
│   ├── langgraph.ts                  # ★ LangGraph agent — StateGraph, tools, trimmer, caching
│   ├── types.ts                      # SSE protocol types + ChatRequestBody interface
│   ├── createSSEParser.tsx           # Stateful SSE chunk buffer + parser
│   ├── convex.tsx                    # ConvexHttpClient factory (server-side)
│   ├── NavigationProvider.tsx        # Mobile sidebar open/close context
│   ├── useDocumentTitle.ts           # Hook + util for dynamic document.title / favicon
│   └── utils.ts                      # cn() — tailwind-merge + clsx
│
├── convex/
│   ├── schema.ts                     # DB schema — chats + messages tables with indexes
│   ├── chats.ts                      # createChat, deleteChat, listChats
│   ├── messages.ts                   # list, send, store, getLastMessage
│   └── auth.config.ts                # Clerk → Convex auth domain binding
│
├── constants/
│   └── systemMessage.ts             # Claude's system prompt — tool instructions + rules
│
├── wxflows/
│   ├── index.graphql                 # Master SDL entry — imports all tool schemas
│   ├── tools.graphql                 # Tool registrations via @materializer directives
│   ├── wikipedia/                    # Wikipedia GraphQL schema + API config
│   ├── google_books/                 # Google Books schema + API config
│   ├── youtube_transcript/           # YouTube Transcript schema + API config
│   ├── math/                         # Wolfram Alpha schema + API config
│   ├── exchange/                     # Currency Exchange schema + API config
│   ├── curl/                         # Comments dummy API schema
│   └── curl-01/                      # Customer data API schema
│
├── public/                           # Static assets
│   └── logo.png                      # App logo (favicon + OG image)
│
├── middleware.ts                     # Clerk auth middleware — applied to all routes
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript compiler config
└── package.json                      # Dependencies + scripts
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed and configured:

- **Node.js 18+** — [Download](https://nodejs.org/)
- **PNPM** — `npm install -g pnpm`
- A **Clerk** account — [clerk.dev](https://clerk.dev)
- A **Convex** account — [convex.dev](https://convex.dev)
- An **Anthropic** API key — [console.anthropic.com](https://console.anthropic.com)
- An **IBM WXFlows** account + endpoint — [wxflows.io](https://wxflows.io)

### Step 1 — Clone the Repository

```bash
git clone https://github.com/varshithreddy7/syntra-ai-agent-assistant.git
cd syntra-ai-agent-assistant
```

### Step 2 — Install Dependencies

```bash
pnpm install
```

### Step 3 — Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# ─── Clerk Authentication ───────────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://your-clerk-domain.clerk.accounts.dev

# ─── Convex Database ────────────────────────────────────────────────────────
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=dev:your-deployment-name

# ─── Anthropic (Claude) ─────────────────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20240620

# ─── IBM WXFlows ────────────────────────────────────────────────────────────
WXFLOWS_ENDPOINT=https://your-org.us-east-a.ibm.stepzen.net/api/your-api/__graphql
WXFLOWS_APIKEY=your-org::region.net+1000::your-api-key-hash
```

### Step 4 — Set Up Convex

```bash
# Install Convex CLI
pnpm install -g convex

# Initialize and connect to your Convex project
npx convex dev
```
Follow the prompts to link to your Convex project. This will auto-generate types in `convex/_generated/`.

### Step 5 — Set Up IBM WXFlows

```bash
# Install WXFlows CLI
npm install -g @wxflows/cli

# Deploy your tool configuration
wxflows deploy
```

### Step 6 — Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** You'll need to run `npx convex dev` in a separate terminal to keep the Convex backend in sync during development.

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk publishable key (safe for client) |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key (server-side only) |
| `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` | ✅ | Clerk frontend API URL (used by Convex auth) |
| `NEXT_PUBLIC_CONVEX_URL` | ✅ | Convex deployment URL |
| `CONVEX_DEPLOYMENT` | ✅ | Convex deployment identifier |
| `ANTHROPIC_API_KEY` | ✅ | Anthropic API key for Claude |
| `ANTHROPIC_MODEL` | ⬜ | Claude model name (default: `claude-3-5-sonnet-20240620`) |
| `WXFLOWS_ENDPOINT` | ✅ | IBM WXFlows GraphQL endpoint URL |
| `WXFLOWS_APIKEY` | ✅ | IBM WXFlows API key |

> ⚠️ **Security Notice:** Never commit `.env.local` to version control. It is already listed in `.gitignore`.

---

## 📦 Deployment

### Deploy to Vercel

1. **Push to GitHub** — Connect your repository to Vercel

2. **Set Environment Variables** in the Vercel dashboard (Settings → Environment Variables) — all variables from `.env.local`

3. **Deploy Convex to Production:**
   ```bash
   npx convex deploy --prod
   ```

4. **Update Clerk Allowed Origins** in the Clerk dashboard to include your Vercel production URL

5. **Vercel auto-deploys** on every push to `main`

### Production Checklist
- [ ] All environment variables configured in Vercel
- [ ] `NEXT_PUBLIC_CONVEX_URL` points to production deployment (not dev)
- [ ] Clerk production instance created and keys updated
- [ ] WXFlows endpoint is production-grade
- [ ] Anthropic API key has sufficient credits and rate limits

---

## 🎯 Use Cases

**For end users:**
- Real-time research with live Wikipedia data (current events, policies, news)
- YouTube video analysis — get transcripts without watching the full video
- Mathematical computations and unit conversions via Wolfram Alpha
- Currency conversion for travel and financial planning
- Book discovery and research via Google Books
- Quick customer data lookups (for business demos)

**For developers (as a reference implementation):**
- Production-grade LangGraph agent architecture with proper state management
- SSE streaming best practices in Next.js 15 App Router
- Convex + Clerk integration patterns for real-time authenticated apps
- IBM WXFlows GraphQL tool integration patterns
- Optimistic UI updates with Convex mutations
- Anthropic prompt caching implementation

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add new feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request with a detailed description

**Coding standards:**
- Full TypeScript — no `any` types
- Follow existing component structure
- Add proper error handling
- Test across chat scenarios

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

<div align="center">

**Varshith Reddy**

*Full-Stack AI Engineer | Specializing in Agentic Systems & Real-time Applications*

[![GitHub](https://img.shields.io/badge/GitHub-varshithreddy7-181717?style=for-the-badge&logo=github)](https://github.com/varshithreddy7)

</div>

---

<div align="center">

### 🌟 Built to demonstrate production-grade AI engineering

*Syntra AI is not just a chatbot — it's a full agentic system showcasing the complete stack required to build, deploy, and operate intelligent AI assistants at scale.*

**Next.js 15 · TypeScript · LangGraph · Claude 3.5 · WXFlows · Convex · Clerk · SSE Streaming**

---

*If this project helped you, please ⭐ the repository!*

</div>
