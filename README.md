# 🤖 Syntra AI - Advanced Agentic Assistant

> *An intelligent AI assistant powered by Claude 3.5 Sonnet with real-time tool integration and streaming capabilities*

![Syntra AI Banner](https://img.shields.io/badge/AI-Powered-blue) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-Latest-blue) ![Convex](https://img.shields.io/badge/Database-Convex-purple)

## 🌟 Project Overview

Syntra AI is a sophisticated conversational AI assistant that I developed to demonstrate advanced AI integration patterns and modern web development practices. Unlike traditional chatbots, Syntra is an **agentic system** that can reason, plan, and execute complex tasks using multiple specialized tools in real-time.

The system leverages Claude 3.5 Sonnet's advanced reasoning capabilities combined with IBM's WXFlows tool ecosystem to provide users with access to live data from Wikipedia, YouTube, Google Books, mathematical calculations, currency conversion, and more. Every interaction is powered by intelligent agent workflows that determine when and how to use these tools effectively.

### 🎯 Key Achievements

- **Real-time Streaming**: Implemented Server-Sent Events (SSE) for token-by-token response streaming
- **Agentic Architecture**: Built using LangGraph for complex multi-step reasoning and tool orchestration  
- **Tool Integration**: Seamlessly integrated 7+ external APIs through GraphQL interfaces
- **Performance Optimization**: Implemented prompt caching and message trimming for efficient conversations
- **Production Ready**: Full authentication, error handling, and scalable database architecture

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router and Server Components
- **React 19** - Latest React features with concurrent rendering
- **TypeScript** - Full type safety across the application
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **Radix UI** - Accessible component primitives
- **Shadcn/UI** - Modern component library built on Radix

### Backend & AI
- **Next.js API Routes** - Serverless API endpoints
- **Convex** - Real-time database with live queries and mutations
- **Claude 3.5 Sonnet** - Advanced language model via Anthropic API
- **LangChain** - AI application framework for complex workflows
- **LangGraph** - Agent orchestration and state management
- **IBM WXFlows SDK** - Tool integration platform (Beta)

### Authentication & Deployment
- **Clerk** - Complete authentication solution
- **Vercel** - Deployment and hosting platform
- **PNPM** - Fast, disk space efficient package manager

### Tools & APIs Integrated
- **Wikipedia API** - Real-time information retrieval
- **YouTube Transcript API** - Video content extraction
- **Google Books API** - Book and publication search
- **Wolfram Alpha** - Mathematical computations
- **Exchange Rate API** - Currency conversion
- **Custom GraphQL APIs** - Customer data and comments

## 🛠️ Installation & Setup

### Prerequisites

Before setting up the project, ensure you have:

- **Node.js 18+** installed on your system
- **PNPM** package manager (`npm install -g pnpm`)
- API keys for the following services:
  - Anthropic (Claude API)
  - Clerk (Authentication)
  - Convex (Database)
  - IBM WXFlows (Tools)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/syntra-ai-agent-assistant.git
cd syntra-ai-agent-assistant
```

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# Anthropic API Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Convex Database
NEXT_PUBLIC_CONVEX_URL=your_convex_url
CONVEX_DEPLOY_KEY=your_convex_deploy_key

# IBM WXFlows
WXFLOWS_ENDPOINT=your_wxflows_endpoint
WXFLOWS_APIKEY=your_wxflows_api_key
```

### Step 4: Database Setup (Convex)

1. Install Convex CLI globally:
   ```bash
   pnpm install -g convex
   ```

2. Initialize Convex in your project:
   ```bash
   convex dev
   ```

3. Follow the prompts to connect your project to Convex cloud

### Step 5: Authentication Setup (Clerk)

1. Create a Clerk application at [clerk.dev](https://clerk.dev)
2. Configure your authentication settings
3. Add your domain to the allowed origins
4. Copy the API keys to your `.env.local` file

### Step 6: Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application running!

## 🏗️ Project Architecture

### Directory Structure

```
syntra-ai-agent-assistant/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── chat/stream/   # SSE streaming endpoint
│   ├── dashboard/         # Protected dashboard pages
│   │   └── chat/[id]/    # Dynamic chat pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── ChatInterface.tsx # Main chat component
│   ├── MessageBubble.tsx # Message rendering
│   └── Sidebar.tsx       # Navigation sidebar
├── convex/               # Database schema & functions
│   ├── schema.ts         # Database schema definition
│   ├── chats.ts          # Chat-related database functions
│   └── messages.ts       # Message-related database functions
├── lib/                  # Utility functions
│   ├── langgraph.ts      # AI agent workflow
│   ├── types.ts          # TypeScript definitions
│   └── utils.ts          # Helper functions
├── wxflows/              # Tool configurations
│   ├── wikipedia/        # Wikipedia tool config
│   ├── youtube_transcript/ # YouTube tool config
│   └── math/             # Math tool config
└── constants/
    └── systemMessage.ts  # AI system prompts
```

### Core Components

#### 1. **Agent Workflow (`lib/langgraph.ts`)**
Implements a sophisticated AI agent using LangGraph that:
- Manages conversation state and memory
- Decides when to use tools based on user queries
- Handles tool execution and result integration
- Implements prompt caching for performance

#### 2. **Streaming Chat Interface (`components/ChatInterface.tsx`)**
Real-time chat component featuring:
- Server-Sent Events for live response streaming
- Optimistic UI updates for better UX
- Tool execution progress visualization
- Message persistence with Convex

#### 3. **Tool Integration (`wxflows/`)**
GraphQL-based tool system supporting:
- Dynamic tool discovery and registration
- Structured input/output handling
- Error recovery and retry mechanisms
- Custom tool result formatting

## 🔥 Key Features

### 🧠 **Intelligent Agent System**
- **Multi-step Reasoning**: Uses LangGraph to break down complex queries into actionable steps
- **Tool Selection**: Automatically determines which tools to use based on user intent
- **Context Awareness**: Maintains conversation context across tool interactions
- **Error Recovery**: Gracefully handles tool failures with fallback strategies

### ⚡ **Real-time Performance**
- **Streaming Responses**: Token-by-token streaming for immediate feedback
- **Optimistic Updates**: Instant UI updates before server confirmation
- **Prompt Caching**: Efficient memory usage with Anthropic's caching system
- **Connection Management**: Robust SSE connection handling with reconnection

### 🎨 **Modern User Experience**
- **Responsive Design**: Seamless experience across desktop and mobile
- **Dark/Light Themes**: Adaptive UI based on system preferences
- **Terminal Visualization**: Tool execution shown in terminal-style interfaces
- **Example Prompts**: Guided onboarding with interactive examples

### 🔐 **Enterprise-Ready Security**
- **Authentication**: Complete user management with Clerk
- **Data Isolation**: User-scoped data access and permissions
- **API Security**: Protected endpoints with proper authorization
- **Input Validation**: Comprehensive input sanitization

## 🚀 Deployment

### Production Deployment on Vercel

1. **Connect to Vercel**:
   ```bash
   vercel --prod
   ```

2. **Configure Environment Variables** in Vercel dashboard

3. **Deploy Convex Functions**:
   ```bash
   convex deploy --prod
   ```

4. **Update Authentication URLs** in Clerk dashboard

### Environment-Specific Configuration

The application automatically adapts to different environments:
- **Development**: Local APIs and debug logging
- **Preview**: Staging environment with test data
- **Production**: Optimized builds with performance monitoring

## 🎯 Use Cases

**For End Users:**
- Research assistance with real-time Wikipedia data
- YouTube video analysis and summarization
- Mathematical calculations and unit conversions
- Book recommendations and searches
- Current events and news analysis
- Currency conversion for travel planning

**For Developers:**
- Reference implementation for LangGraph agents
- Example of modern Next.js architecture
- Real-time streaming patterns with SSE
- Tool integration best practices
- Production-ready authentication setup

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with proper TypeScript types
4. Test thoroughly across different scenarios
5. Submit a pull request with detailed description

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- **Anthropic** for Claude 3.5 Sonnet API
- **IBM** for WXFlows tool integration platform
- **Vercel** for Next.js framework and deployment
- **Convex** for real-time database infrastructure
- **Clerk** for authentication services

---

**Built with ❤️ by [Your Name]**

*Showcasing modern AI application development with production-ready architecture and real-world tool integration.*
