import { describe, expect, it, beforeEach } from "vitest";
import { createApp } from "./app";
import { resetUsageState } from "./limits";

const env = {
  USE_FAKE_AI: "1",
  GENCHAT_SESSION_LIMIT: "2",
  GENCHAT_DAILY_LIMIT: "3",
};

describe("genchat api", () => {
  beforeEach(() => {
    resetUsageState();
  });

  it("returns health", async () => {
    const app = createApp();
    const response = await app.request("http://example.com/api/v1/health", {}, env);
    expect(response.status).toBe(200);
  });

  it("returns bootstrap quick actions", async () => {
    const app = createApp();
    const response = await app.request(
      "http://example.com/api/v1/chat/bootstrap",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          trigger: "open",
          context: {
            kind: "docs",
            url: "https://docs.genlayer.com",
            title: "GenLayer",
            pageType: "docs",
            activeHeading: "Intelligent Contracts",
            activeSnippet: "Intro",
            visibleHeadings: ["Intro"],
            detectedTerms: [],
            pageChunks: [{ id: "1", label: "Intro", text: "Some useful GenLayer context." }],
          },
        }),
      },
      env,
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as { quickActions: string[] };
    expect(body.quickActions.length).toBeGreaterThan(0);
  });

  it("streams a response and enforces caps", async () => {
    const app = createApp();
    const requestBody = {
      sessionId: "page:https://docs.genlayer.com",
      userMessage: "Explain this",
      context: {
        kind: "docs",
        url: "https://docs.genlayer.com",
        title: "GenLayer",
        pageType: "docs",
        activeHeading: "Validators",
        activeSnippet: "Validators re-check outputs.",
        visibleHeadings: ["Validators"],
        detectedTerms: [],
        pageChunks: [{ id: "1", label: "Validators", text: "Validators re-check outputs." }],
      },
    };

    const first = await app.request(
      "http://example.com/api/v1/chat/turn",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(requestBody),
      },
      env,
    );
    expect(first.status).toBe(200);

    const second = await app.request(
      "http://example.com/api/v1/chat/turn",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(requestBody),
      },
      env,
    );
    expect(second.status).toBe(200);

    const third = await app.request(
      "http://example.com/api/v1/chat/turn",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(requestBody),
      },
      env,
    );
    expect(third.status).toBe(429);
  });
});
