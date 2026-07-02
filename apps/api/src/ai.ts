import { FREE_TIER_GUARDS, buildGroundingBundle, type ChatTurnRequest, type ChatTurnResponse, type Citation } from "@genchat/shared";
import type { AppEnv } from "./types";

const DEFAULT_MODEL = "@cf/qwen/qwen3-30b-a3b-fp8";

function buildFallbackAnswer(input: ChatTurnRequest, citations: Citation[]): string {
  const opening =
    input.context.kind === "docs"
      ? `This section is mainly about ${input.context.activeHeading.toLowerCase()}.`
      : `This post is mainly saying: ${input.context.tweetText.slice(0, 160)}${input.context.tweetText.length > 160 ? "..." : ""}`;

  const evidence = citations
    .slice(0, 2)
    .map((citation) => `- ${citation.label}: ${citation.excerpt}`)
    .join("\n");

  return `${opening}\n\n${evidence || "- The current page supplied only limited evidence."}\n\nIf you want, I can simplify it further or connect it to the bigger GenLayer picture.`;
}

export async function generateAnswer(env: AppEnv, input: ChatTurnRequest): Promise<ChatTurnResponse> {
  const bundle = buildGroundingBundle(input);
  const fallback = buildFallbackAnswer(input, bundle.citations);

  let answerMarkdown = fallback;

  if (env.AI && env.USE_FAKE_AI !== "1") {
    const aiResponse = await env.AI.run(DEFAULT_MODEL, {
      messages: [
        { role: "system", content: bundle.system },
        { role: "user", content: bundle.user },
      ],
      max_tokens: FREE_TIER_GUARDS.maxOutputTokens,
      temperature: 0.2,
    } as Record<string, unknown>);

    const maybeText = (aiResponse as { response?: string; result?: { response?: string } }).response
      ?? (aiResponse as { result?: { response?: string } }).result?.response;

    if (maybeText && typeof maybeText === "string") {
      answerMarkdown = maybeText.slice(0, 2200);
    }
  }

  return {
    answerMarkdown,
    citations: bundle.citations.slice(0, 5),
    followUps:
      input.context.kind === "docs"
        ? ["Explain simply", "Why this matters", "Give an example"]
        : ["Summarize the thread", "Why this matters", "Connect this to GenLayer"],
    relatedTerms: bundle.relatedTerms.slice(0, 6),
    confidence: bundle.citations.length >= 3 ? "high" : bundle.citations.length >= 2 ? "medium" : "low",
  };
}
