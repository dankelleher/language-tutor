# Windfall Integration Testing Notes

## Setup
- Used `@ai-sdk/openai` (Vercel AI SDK) with `createOpenAI()` pointed at Windfall
- Must use `.chat()` method — Windfall only supports `/v1/chat/completions`, not `/v1/responses`

## Findings

**Windfall is not a drop-in replacement for apps using structured output (tool calls / JSON mode).** Plain chat completions work fine, but structured output features are stripped by the proxy.

1. **`/v1/responses` not supported** — Modern OpenAI SDKs default to the [Responses API](https://developers.openai.com/blog/responses-api) (`/v1/responses`), OpenAI's successor to Chat Completions ([migration guide](https://developers.openai.com/api/docs/guides/migrate-to-responses)). Had to force `.chat()` for the classic `/v1/chat/completions` endpoint
2. **Tool definitions not forwarded** — `streamObject` sends tools to get structured JSON; Windfall strips these, so Claude returns plain markdown instead of JSON
3. **`response_format` not supported** — `{ type: "json_object" }` is also ignored by the proxy
4. **`model: "auto"` (DeepSeek V3) incompatible with structured output** — returns garbled/truncated responses when tools are requested
5. **Explicit JSON instructions in prompt do work** — curl with "respond only in JSON" in the system message returns valid JSON, but Claude wraps it in ```json code fences

## What Works
- Plain text chat completions — no issues
- Model routing (`anthropic/claude-sonnet-4-6` resolved correctly to Bedrock)
- Streaming
- Energy endpoint (`/v1/energy`)

## Suggestion
Supporting `response_format: { type: "json_object" }` and/or forwarding tool definitions to the backend model would make Windfall work as a true drop-in replacement for apps using the Vercel AI SDK's structured output features.

## Feedback
hello@ecofrontiers.xyz
