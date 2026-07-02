import {
  API_ROUTES,
  chatBootstrapRequestSchema,
  chatTurnRequestSchema,
  chatTurnResponseSchema,
  type ChatBootstrapRequest,
  type ChatTurnRequest,
  type ChatTurnResponse,
} from "@genchat/shared";

const API_BASE = import.meta.env.VITE_GENCHAT_API_BASE || "http://127.0.0.1:8787";

type RuntimeMessage =
  | { type: "genchat.bootstrap"; payload: ChatBootstrapRequest }
  | { type: "genchat.turn"; payload: ChatTurnRequest };

type RuntimeResponse =
  | { ok: true; data: unknown }
  | { ok: false; error: string };

async function handleBootstrap(payload: ChatBootstrapRequest) {
  const body = chatBootstrapRequestSchema.parse(payload);
  const response = await fetch(`${API_BASE}${API_ROUTES.bootstrap}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const fallback = await response.text().catch(() => "");
    throw new Error(fallback || "GenChat could not prepare this page yet.");
  }

  return (await response.json()) as { quickActions: string[]; message: string };
}

async function handleTurn(payload: ChatTurnRequest): Promise<ChatTurnResponse> {
  const body = chatTurnRequestSchema.parse(payload);
  const response = await fetch(`${API_BASE}${API_ROUTES.turn}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    const fallback = await response.text().catch(() => "");
    throw new Error(fallback || "GenChat is unavailable right now.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalPayload: ChatTurnResponse | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const rawEvent of events) {
      const lines = rawEvent.split("\n");
      const eventType = lines.find((line) => line.startsWith("event:"))?.replace("event:", "").trim();
      const data = lines
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.replace("data:", "").trim())
        .join("\n");

      if (!data) continue;

      if (eventType === "done") {
        finalPayload = chatTurnResponseSchema.parse(JSON.parse(data));
      }
    }
  }

  if (!finalPayload) {
    throw new Error("GenChat did not receive a complete response.");
  }

  return finalPayload;
}

chrome.runtime.onMessage.addListener((message: RuntimeMessage, _sender, sendResponse: (response: RuntimeResponse) => void) => {
  void (async () => {
    try {
      if (message.type === "genchat.bootstrap") {
        const data = await handleBootstrap(message.payload);
        sendResponse({ ok: true, data });
        return;
      }

      if (message.type === "genchat.turn") {
        const data = await handleTurn(message.payload);
        sendResponse({ ok: true, data });
        return;
      }

      sendResponse({ ok: false, error: "Unknown GenChat message." });
    } catch (error) {
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : "GenChat request failed.",
      });
    }
  })();

  return true;
});
