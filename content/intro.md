# Multi-Agent Supervisor System

Welcome to the **Multi-Agent Supervisor System** - an intelligent AI orchestration architecture simply demonstrating the power of multiple specialized AI departments to provide comprehensive, real-time responses to complex queries. It is a demo project for the implementation of the Supervisor Pattern in LangGraph. [Multi-agent supervisor](https://langchain-ai.github.io/langgraph/tutorials/multi_agent/agent_supervisor/)

&nbsp;
## Project Overview

This system demonstrates AI interaction through a **supervisor-based multi-agent architecture** where different AI departments collaborate to solve user problems. Instead of relying on a single AI model, our system intelligently routes tasks to specialized departments, showcasing how different approaches can be combined for diverse query types. Rather than processing queries in a linear, sequential, single-threaded manner, our architecture orchestrates multiple agents working in parallel, each contributing their expertise to deliver comprehensive and accurate solutions.

### Key Features

- **Intelligent Task Assessment** - Automatically analyzes and decomposes complex queries
- **Specialized Departments** - Dedicated AI agents for different domains
- **Chain of Thought (CoT)** - Real-time transparency into AI reasoning and problem-solving process
- **Real-time Streaming** - Live thought process visualization
- **Dynamic Orchestration** - Supervisor coordinates multiple departments seamlessly
- **Conversation Persistence** - Maintains context across interactions
- **Modern UI** - Clean, responsive interface with real-time updates

&nbsp;
## System Architecture

&nbsp;
### Core Workflow

```
User Query → Assessment → Supervisor → Departments → Aggregation → Response
```

![System Architecture Flow Diagram](/graph_flow.png)

1. **Initializer Node** - Prepares the conversation state
2. **Assessment Node** - Analyzes user intent and decomposes tasks
3. **Supervisor Node** - Routes tasks to appropriate departments
4. **Department Nodes** - Execute specialized processing
5. **Aggregator Node** - Synthesizes department outputs
6. **Final Response Node** - Delivers comprehensive answer

&nbsp;
### Specialized Departments

&nbsp;
#### Web Department
**Purpose**: Real-time web search and data retrieval

**Capabilities**:
  - Current events and news
  - Weather information
  - Online research
  - Up-to-date factual data

**Tools**: Tavily search integration

&nbsp;
#### Math Department
**Purpose**: Mathematical computations and problem-solving

**Capabilities**:
  - Complex calculations
  - Algebraic problem solving
  - Statistical analysis
  - Step-by-step mathematical reasoning

**Tools**: Advanced calculator and symbolic math

&nbsp;
#### General Knowledge Department
**Purpose**: General inquiries and conversational AI

**Capabilities**:
  - General knowledge questions
  - Conversational responses
  - Creative writing
  - Explanations and tutorials

&nbsp;
## Thought Chain Processing

Experience AI thinking in real-time! Our system provides transparent insight into the problem-solving process:

- **Understanding** - How the AI interprets your question
- **Analysis** - Breaking down the problem components
- **Approach** - Strategy formulation
- **Working** - Step-by-step execution
- **Verification** - Result validation

&nbsp;
## Technology Stack

### Backend Infrastructure
- **Framework**: FastAPI with Python
- **AI Orchestration**: LangGraph state management
- **Language Models**: OpenAI GPT-4 variants
- **Persistence**: SQLite/PostgreSQL checkpointing
- **Streaming**: Server-Sent Events (SSE)

### Frontend Experience
- **Framework**: Next.js 15 with React 18
- **UI Components**: HeroUI + Ant Design
- **Styling**: Tailwind CSS
- **Real-time**: EventSource streaming


&nbsp;
## User Interface Features

### Main Chat Interface
- **Clean Design** - Minimalist, distraction-free interface
- **Real-time Streaming** - Watch AI thinking in real-time
- **Message History** - Persistent conversation context
- **Responsive Layout** - Works on desktop and mobile

### Thought Chain Visualization
- **Department Activity** - See which departments are working
- **Progress Tracking** - Real-time status updates
- **Transparent Process** - Understand AI decision-making
- **Interactive Sidebar** - Toggle thought chain visibility

### Advanced Controls
- **New Chat** - Start fresh conversations
- **Cancel Operations** - Stop processing anytime
- **Thread Management** - Organize conversation sessions

&nbsp;
## Testing Cases

Try these simple queries to see how different departments work together:

### Web + Math Combination

What's the current Bitcoin price and calculate how much $1000 would be worth if it doubles?

Find the weather in New York today and calculate the temperature difference from 32°F to Celsius.

### Web + General Knowledge

What's happening with ChatGPT lately and explain what AI language models are.

Find recent news about SpaceX and explain how rocket propulsion works.

### Math + General Knowledge

Calculate the area of a circle with radius 5 and explain why we use π in geometry.

Solve 15 × 23 and explain the multiplication algorithm.

### All Three Departments

What's the current price of Tesla stock, calculate the profit from buying 10 shares, and explain what stock trading means.

Find the latest iPhone price, calculate the monthly cost if paid over 12 months, and explain how phone financing works.

&nbsp;
## Project Roadmap

### Completed Features

- **Multiple ReAct Agents** - Specialized departments (Web, Math, General Knowledge) with ReAct reasoning
- **Persistence** - Conversation history and state management across sessions
- **Streaming** - Real-time character-by-character response streaming
- **Chain of Thought** - Transparent AI reasoning process visualization
- **Supervisor Mode** - Intelligent task routing and coordination between departments
- **Parallel Tasking** - Multiple departments working simultaneously on complex queries

### Planned Features

- **Human in the Loop** - User intervention and approval workflows for critical decisions
- **User System** - Multi-user support with authentication and personalization
- **Partially Streaming Structured Output** - Streaming responses with structured data (JSON, tables, etc.)
- **Enhanced Persistence** - Advanced conversation management and search capabilities
- **Time Travel** - Ability to revisit and modify previous conversation states
- **Prompts Management** - Dynamic prompt editing and version control system

&nbsp;
## Repository

- **Frontend**: [https://github.com/ZhizhaoYang/multi-agent-client](https://github.com/ZhizhaoYang/multi-agent-client)
- **Backend**: [https://github.com/ZhizhaoYang/multi-agent-server](https://github.com/ZhizhaoYang/multi-agent-server)

&nbsp;
&nbsp;