# Language Tutor

An AI-powered language learning application built with Next.js and Claude (Anthropic).

## Features

- 🌍 **Multiple Languages**: Learn German, French, Spanish, Italian, Portuguese, Japanese, Chinese, or Korean
- 🎯 **Adaptive Learning**: AI adjusts difficulty based on your skill level (A1-C2)
- ✅ **Instant Feedback**: Get corrections, explanations, and guidance in real-time
- 💬 **Interactive Chat**: Natural conversation-based learning experience
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 💾 **Local Persistence**: Your conversation history is saved locally

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI**: Vercel AI SDK with Claude Sonnet 4.5
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **State Management**: React hooks + localStorage

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Anthropic API key

### Installation

1. Ensure your `.env` file has your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_key_here
   ```

2. Install dependencies (if not already done):
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3300](http://localhost:3300) in your browser

### Running the CLI Version

The original CLI version is still available:

```bash
pnpm cli
```

## Usage

1. Select your target language from the dropdown
2. Start chatting with your AI tutor
3. Translate sentences provided by the tutor
4. Receive instant corrections and explanations
5. Progress through increasingly difficult challenges

## How It Works

The application uses Claude's AI to:

1. Provide sentences in English for you to translate
2. Analyze your translations for accuracy
3. Offer detailed corrections and explanations
4. Adapt to your skill level (A1-C2 framework)
5. Generate appropriately difficult next challenges

### Architecture

- **Frontend**: React components with Vercel AI SDK's `useChat` hook
- **Backend**: Next.js API routes with `streamText` and AI tools
- **AI Tool**: Structured feedback via the `provideCorrection` tool
- **Streaming**: Real-time responses for immediate feedback

## Project Structure

```
├── app/
│   ├── api/chat/route.ts    # Chat API endpoint
│   ├── page.tsx             # Main page
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/
│   ├── chat.tsx             # Main chat component
│   ├── chat-input.tsx       # Input field
│   ├── message.tsx          # Message display
│   └── correction-display.tsx  # Structured feedback
├── lib/
│   ├── types.ts             # TypeScript types & schemas
│   └── prompts.ts           # System prompts
└── index.ts                 # Original CLI version
```

## Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Run production server
- `pnpm lint` - Run Next.js linter
- `pnpm cli` - Run original CLI version

## Deployment

This application is ready to deploy to Vercel:

```bash
vercel
```

Or any other Next.js hosting platform.

## License

ISC
