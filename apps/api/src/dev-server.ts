import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { serve } from "@hono/node-server";
import { createApp } from "./app";
import type { AppEnv } from "./types";

function loadDevVars(): AppEnv {
  const envPath = resolve(process.cwd(), ".dev.vars");
  const vars: Record<string, string> = {};

  if (existsSync(envPath)) {
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const equalsIndex = trimmed.indexOf("=");
      if (equalsIndex < 0) continue;
      const key = trimmed.slice(0, equalsIndex).trim();
      const value = trimmed.slice(equalsIndex + 1).trim();
      vars[key] = value;
    }
  }

  return {
    GENCHAT_PUBLIC_ORIGIN: vars.GENCHAT_PUBLIC_ORIGIN || "http://localhost:3000",
    GENCHAT_SESSION_LIMIT: vars.GENCHAT_SESSION_LIMIT || "12",
    GENCHAT_DAILY_LIMIT: vars.GENCHAT_DAILY_LIMIT || "350",
    USE_FAKE_AI: vars.USE_FAKE_AI || "1",
  };
}

const env = loadDevVars();
const app = createApp();
const port = 8787;

serve(
  {
    port,
    fetch(request) {
      return app.fetch(request, env);
    },
  },
  (info) => {
    console.log(`GenChat mock API running at http://127.0.0.1:${info.port}`);
    console.log(`Mode: ${env.USE_FAKE_AI === "1" ? "fake-ai" : "workers-ai"}`);
  },
);
