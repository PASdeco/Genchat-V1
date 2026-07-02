import type { DetectedContext, TweetSnapshot } from "@genchat/shared";
import { UI_LIMITS } from "@genchat/shared";
import { matchGlossaryTerms } from "@genchat/shared";

export type TweetSignalInput = {
  text: string;
  handle: string;
  viewportWeight: number;
};

export function scoreTweetRelevance(input: TweetSignalInput): number {
  const haystack = `${input.text} ${input.handle}`.toLowerCase();
  let score = 0;
  if (haystack.includes("genlayer")) score += 0.45;
  if (haystack.includes("intelligent contract")) score += 0.2;
  if (haystack.includes("validator")) score += 0.1;
  if (haystack.includes("optimistic democracy")) score += 0.15;
  if (haystack.includes("studionet")) score += 0.1;
  return Math.min(score + input.viewportWeight * 0.1, 1);
}

function getTweetArticles(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>("article"));
}

function getArticleText(article: HTMLElement): string {
  return (article.innerText || "").replace(/\s+/g, " ").trim();
}

function scoreArticle(article: HTMLElement): number {
  const rect = article.getBoundingClientRect();
  if (rect.bottom < 0 || rect.top > window.innerHeight) return Number.NEGATIVE_INFINITY;
  const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  const centerDistance = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);
  return visibleHeight - centerDistance * 0.25;
}

function getActiveArticle(): HTMLElement | null {
  const visibleArticles = getTweetArticles();
  return visibleArticles.reduce<HTMLElement | null>((best, article) => {
    if (!best) return article;
    return scoreArticle(article) > scoreArticle(best) ? article : best;
  }, null);
}

function extractHandle(article: HTMLElement): string {
  const handleNode = Array.from(article.querySelectorAll<HTMLElement>("span"))
    .map((node) => node.textContent?.trim() || "")
    .find((value) => value.startsWith("@"));
  return handleNode || "@unknown";
}

function extractTimestamp(article: HTMLElement): string {
  const time = article.querySelector("time");
  return time?.getAttribute("datetime") || time?.textContent?.trim() || "recent";
}

function extractTweetId(article: HTMLElement): string {
  const links = Array.from(article.querySelectorAll<HTMLAnchorElement>("a[href*='/status/']"));
  const href = links[0]?.href || window.location.href;
  return href.split("/status/")[1]?.split(/[/?]/)[0] || href;
}

export function detectXContext(): { detected: DetectedContext; snapshot?: TweetSnapshot } {
  const article = getActiveArticle();
  const text = article ? getArticleText(article).slice(0, UI_LIMITS.maxTweetTextLength) : "";
  const handle = article ? extractHandle(article) : "@unknown";
  const relevanceScore = article
    ? scoreTweetRelevance({
        text,
        handle,
        viewportWeight: 1,
      })
    : 0;

  const terms = matchGlossaryTerms(text).map((entry) => ({
    term: entry.term,
    category: entry.category,
    definition: entry.definition,
  }));

  return {
    detected: {
      kind: "x",
      relevanceScore,
      label: article ? `${handle} post` : "GenLayer post",
    },
    snapshot:
      article && relevanceScore >= 0.35
        ? {
            kind: "x",
            url: window.location.href,
            tweetId: extractTweetId(article),
            authorName: handle.replace("@", "") || "Unknown",
            authorHandle: handle,
            timestamp: extractTimestamp(article),
            tweetText: text,
            quotedTweetText: Array.from(article.querySelectorAll<HTMLElement>("div[dir='auto']"))
              .map((node) => (node.textContent || "").trim())
              .find((candidate) => candidate && candidate !== text)
              ?.slice(0, 320),
            mediaAlt: Array.from(article.querySelectorAll<HTMLImageElement>("img[alt]"))
              .map((image) => image.alt.trim())
              .filter(Boolean)
              .slice(0, 4),
            conversationHints: Array.from(article.querySelectorAll<HTMLElement>("a[role='link']"))
              .map((node) => node.textContent?.trim() || "")
              .filter((value) => value.startsWith("Reply") || value.startsWith("View"))
              .slice(0, 4),
            detectedTerms: terms.slice(0, 12),
          }
        : undefined,
  };
}
