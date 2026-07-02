import { describe, expect, it } from "vitest";
import { scoreDocsRelevance } from "./docs";
import { scoreTweetRelevance } from "./x";

describe("context scoring", () => {
  it("scores docs relevance for GenLayer pages", () => {
    const score = scoreDocsRelevance({
      url: "https://docs.genlayer.com/intro",
      title: "GenLayer Intelligent Contracts",
      headings: ["Overview", "Validators"],
      bodyText: "GenLayer explains how intelligent contracts and validators work.",
    });

    expect(score).toBeGreaterThan(0.35);
  });

  it("scores x posts relevance for GenLayer posts", () => {
    const score = scoreTweetRelevance({
      text: "GenLayer validators are discussing Optimistic Democracy today.",
      handle: "@genlayer",
      viewportWeight: 1,
    });

    expect(score).toBeGreaterThan(0.35);
  });
});
