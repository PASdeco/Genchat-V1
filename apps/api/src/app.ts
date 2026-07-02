import { FREE_TIER_GUARDS, QUICK_ACTIONS, chatBootstrapRequestSchema, chatTurnRequestSchema } from "@genchat/shared";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { generateAnswer } from "./ai";
import { assertUsageAvailable, consumeUsage } from "./limits";
import type { AppEnv } from "./types";

function parseRequestSize(headerValue: string | undefined): number {
  const size = Number(headerValue || "0");
  return Number.isFinite(size) ? size : 0;
}

export function createApp() {
  const app = new Hono<{ Bindings: AppEnv }>();

  app.use("*", async (c, next) => {
    const origin = c.req.header("origin");
    c.header("Access-Control-Allow-Origin", origin || c.env.GENCHAT_PUBLIC_ORIGIN || "*");
    c.header("Access-Control-Allow-Headers", "content-type");
    c.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    if (c.req.method === "OPTIONS") {
      return c.body(null, 204);
    }
    await next();
  });

  const healthPayload = (env: AppEnv) => ({
    ok: true,
    service: "genchat-api",
    mode: env.USE_FAKE_AI === "1" ? "fake-ai" : "workers-ai",
    limits: {
      session: Number(env.GENCHAT_SESSION_LIMIT || FREE_TIER_GUARDS.defaultSessionLimit),
      daily: Number(env.GENCHAT_DAILY_LIMIT || FREE_TIER_GUARDS.defaultDailyLimit),
    },
    routes: {
      health: "/api/v1/health",
      bootstrap: "/api/v1/chat/bootstrap",
      turn: "/api/v1/chat/turn",
    },
  });

  app.get("/", (c) => c.json(healthPayload(c.env)));
  app.get("/api", (c) => c.json(healthPayload(c.env)));

  app.get("/api/v1/health", (c) => c.json(healthPayload(c.env)));

  app.post("/api/v1/chat/bootstrap", async (c) => {
    if (parseRequestSize(c.req.header("content-length")) > FREE_TIER_GUARDS.maxRequestBytes) {
      return c.json({ error: "This page snapshot is too large for the testing backend." }, 413);
    }

    const payload = chatBootstrapRequestSchema.parse(await c.req.json());
    const quickActions = QUICK_ACTIONS[payload.context.kind];
    const message =
      payload.context.kind === "docs"
        ? `I can help explain this section on ${payload.context.activeHeading.toLowerCase()}.`
        : `I can help unpack what ${payload.context.authorHandle} is saying here.`;

    return c.json({ quickActions, message });
  });

  app.post("/api/v1/chat/turn", async (c) => {
    if (parseRequestSize(c.req.header("content-length")) > FREE_TIER_GUARDS.maxRequestBytes) {
      return c.json({ error: "This request is too large for the shared testing backend." }, 413);
    }

    const payload = chatTurnRequestSchema.parse(await c.req.json());
    const availability = assertUsageAvailable(c.env, payload.sessionId);
    if (!availability.ok) {
      return c.json({ error: availability.message }, 429);
    }

    consumeUsage(c.env, payload.sessionId);
    const result = await generateAnswer(c.env, payload);

    return streamSSE(c, async (stream) => {
      const chunks = result.answerMarkdown.match(/.{1,140}(\s|$)/g) ?? [result.answerMarkdown];
      for (const chunk of chunks) {
        await stream.writeSSE({
          event: "chunk",
          data: JSON.stringify({ text: chunk }),
        });
      }

      await stream.writeSSE({
        event: "done",
        data: JSON.stringify(result),
      });
    });
  });

  return app;
}
