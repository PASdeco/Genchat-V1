import { UI_LIMITS, type DetectedContext, type SectionSnapshot } from "@genchat/shared";
import { matchGlossaryTerms } from "@genchat/shared";

export type DocsSignalInput = {
  url: string;
  title: string;
  headings: string[];
  bodyText: string;
};

export function scoreDocsRelevance(input: DocsSignalInput): number {
  const haystack = `${input.url} ${input.title} ${input.headings.join(" ")} ${input.bodyText}`.toLowerCase();
  let score = 0;
  if (haystack.includes("genlayer")) score += 0.35;
  if (haystack.includes("intelligent contract")) score += 0.2;
  if (haystack.includes("validator")) score += 0.15;
  if (haystack.includes("optimistic democracy")) score += 0.2;
  if (haystack.includes("studionet")) score += 0.1;
  return Math.min(score, 1);
}

function getVisibleText(element: Element | null): string {
  return (element?.textContent || "").replace(/\s+/g, " ").trim();
}

function chooseActiveHeading(headings: HTMLElement[]): HTMLElement | null {
  if (!headings.length) return null;
  const viewportCenter = window.innerHeight / 2;
  return headings.reduce<HTMLElement | null>((best, candidate) => {
    const rect = candidate.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      return best;
    }
    const score = Math.abs(rect.top - viewportCenter);
    if (!best) return candidate;
    const bestScore = Math.abs(best.getBoundingClientRect().top - viewportCenter);
    return score < bestScore ? candidate : best;
  }, null) ?? headings[0];
}

function collectNearbyChunks(activeHeading: HTMLElement | null): SectionSnapshot["pageChunks"] {
  if (!activeHeading) return [];
  const chunks: SectionSnapshot["pageChunks"] = [];
  let node: Element | null = activeHeading;
  let index = 0;

  while (node && chunks.length < UI_LIMITS.maxPageChunks) {
    const text = getVisibleText(node);
    if (text.length > 40) {
      chunks.push({
        id: `chunk-${index}`,
        label: node.tagName.toLowerCase() === "p" ? `Paragraph ${chunks.length + 1}` : text.slice(0, 48),
        text: text.slice(0, UI_LIMITS.maxChunkLength),
      });
    }
    node = node.nextElementSibling;
    index += 1;
  }

  return chunks;
}

export function detectDocsContext(): { detected: DetectedContext; snapshot?: SectionSnapshot } {
  const headings = Array.from(document.querySelectorAll<HTMLElement>("h1, h2, h3"));
  const title = document.title || headings[0]?.textContent?.trim() || "Untitled page";
  const main = document.querySelector("main, article, [role='main']") || document.body;
  const bodyText = getVisibleText(main).slice(0, 2400);
  const relevanceScore = scoreDocsRelevance({
    url: window.location.href,
    title,
    headings: headings.map((heading) => heading.textContent?.trim() || ""),
    bodyText,
  });

  const activeHeading = chooseActiveHeading(headings);
  const activeSnippet =
    getVisibleText(activeHeading?.nextElementSibling || activeHeading?.parentElement || main).slice(0, UI_LIMITS.maxSnippetLength) ||
    bodyText.slice(0, UI_LIMITS.maxSnippetLength);

  const terms = matchGlossaryTerms(`${title} ${bodyText}`).map((entry) => ({
    term: entry.term,
    category: entry.category,
    definition: entry.definition,
  }));

  return {
    detected: {
      kind: "docs",
      relevanceScore,
      label: activeHeading?.textContent?.trim() || title,
    },
    snapshot:
      relevanceScore >= 0.35
        ? {
            kind: "docs",
            url: window.location.href,
            title: title.slice(0, 180),
            pageType: "docs",
            activeHeading: (activeHeading?.textContent?.trim() || title).slice(0, 160),
            activeSnippet,
            visibleHeadings: headings
              .map((heading) => heading.textContent?.trim() || "")
              .filter(Boolean)
              .slice(0, UI_LIMITS.maxVisibleHeadings),
            detectedTerms: terms.slice(0, 12),
            pageChunks: collectNearbyChunks(activeHeading).slice(0, UI_LIMITS.maxPageChunks),
          }
        : undefined,
  };
}
