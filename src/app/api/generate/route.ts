import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createGroq } from "@ai-sdk/groq";
import { headers } from "next/headers";
import { buildUserPrompt, type Spec } from "@json-render/core";
import { minuteRateLimit, dailyRateLimit } from "../../../lib/rate-limit";
import { playgroundCatalog as catalog } from "../../../lib/render/catalog";

export const maxDuration = 30;

const SYSTEM_PROMPT = catalog.prompt({
  customRules: [
    "NEVER use viewport height classes (min-h-screen, h-screen) - the UI renders inside a fixed-size container.",
    "NEVER use page background colors (bg-gray-50) - the container has its own background.",
    "For forms or small UIs: use Card as root with maxWidth:'sm' or 'md' and centered:true.",
    "For content-heavy UIs (blogs, dashboards, product listings): use Stack or Grid as root. Use Grid with 2-3 columns for card layouts.",
    "Wrap each repeated item in a Card for visual separation and structure.",
    "Use realistic, professional sample data. Include 3-5 items with varied content. Never leave state arrays empty.",
    'For form inputs (Input, Textarea, Select), always include checks for validation (e.g. required, email, minLength). Always pair checks with a $bindState expression on the value prop (e.g. { "$bindState": "/path" }).',
  ],
});

const MAX_PROMPT_LENGTH = +process.env.MAX_PROMPT_LENGTH!;
const API_KEY = process.env.API_KEY;
const LLM_PROVIDER = process.env.LLM_PROVIDER;
const LLM_PROVIDER_BASE_URL = process.env.LLM_PROVIDER_BASE_URL;
const LLM_MODEL = process.env.LLM_MODEL;
const LLM_MODEL_TEMPERATURE = +process.env.LLM_MODEL_TEMPERATURE! || 0.7;

type PromptContextTurn = {
  role: "user" | "assistant";
  text: string;
};

type GenerateContext = {
  previousSpec?: Spec | null;
  history?: PromptContextTurn[];
};

function createModel() {
  switch (LLM_PROVIDER) {
    case "openai":
      const openaiClient = createOpenAI({
        apiKey: API_KEY,
        baseURL: LLM_PROVIDER_BASE_URL,
      });
      return openaiClient.chat(LLM_MODEL as string);
    case "openrouter":
      const openrouterClient = createOpenRouter({ apiKey: API_KEY });
      return openrouterClient(LLM_MODEL as string);
    case "kimi":
      const kimiClient = createOpenAI({
        apiKey: API_KEY,
        baseURL: LLM_PROVIDER_BASE_URL,
      });
      return kimiClient.chat(LLM_MODEL as string);
    case "groq":
      const groqClient = createGroq({
        apiKey: API_KEY,
        baseURL: LLM_PROVIDER_BASE_URL,
      });
      return groqClient(LLM_MODEL as string);
    default:
      throw new Error(`Unsupported LLM provider: ${LLM_PROVIDER}`);
  }
}

export async function POST(req: Request) {
  if (!process.env.API_KEY || !LLM_PROVIDER || !LLM_MODEL) {
    return new Response(
      JSON.stringify({
        error: "API key not configured",
        message:
          "Please set your API key, LLM provider, and LLM model in the environment variables.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  // Get client IP for rate limiting
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "anonymous";

  // Check rate limits (minute and daily)
  const [minuteResult, dailyResult] = await Promise.all([
    minuteRateLimit.limit(ip),
    dailyRateLimit.limit(ip),
  ]);

  if (!minuteResult.success || !dailyResult.success) {
    const isMinuteLimit = !minuteResult.success;
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded",
        message: isMinuteLimit
          ? "Too many requests. Please wait a moment before trying again."
          : "Daily limit reached. Please try again tomorrow.",
      }),
      {
        status: 429,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const { prompt, context } = (await req.json()) as {
    prompt: string;
    context?: GenerateContext;
  };
  const model = createModel();

  const userPrompt = buildUserPrompt({
    prompt,
    currentSpec: context?.previousSpec,
    maxPromptLength: MAX_PROMPT_LENGTH,
  });

  const result = streamText({
    model,
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
    temperature: LLM_MODEL_TEMPERATURE,
  });

  // Stream the text, then append token usage metadata at the end
  const encoder = new TextEncoder();
  const textStream = result.textStream;

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of textStream) {
        controller.enqueue(encoder.encode(chunk));
      }
      // Append usage metadata after stream completes
      try {
        const usage = await result.usage;
        const meta = JSON.stringify({
          __meta: "usage",
          promptTokens: usage.inputTokens,
          completionTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
        });
        controller.enqueue(encoder.encode(`\n${meta}\n`));
      } catch {
        // Usage not available — skip silently
        controller.close();
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
