import {
  chatBootstrapRequestSchema,
  chatTurnRequestSchema,
  chatTurnResponseSchema,
  type ChatBootstrapRequest,
  type ChatTurnRequest,
  type ChatTurnResponse,
} from "@genchat/shared";

type RuntimeResponse<T> = { ok: true; data: T } | { ok: false; error: string };

async function sendRuntimeMessage<T>(message: { type: string; payload: unknown }): Promise<T> {
  const response = (await chrome.runtime.sendMessage(message)) as RuntimeResponse<T>;
  if (!response.ok) {
    throw new Error(response.error || "GenChat request failed.");
  }
  return response.data;
}

export async function fetchBootstrap(payload: ChatBootstrapRequest): Promise<{ quickActions: string[]; message: string }> {
  const body = chatBootstrapRequestSchema.parse(payload);
  return await sendRuntimeMessage<{ quickActions: string[]; message: string }>({
    type: "genchat.bootstrap",
    payload: body,
  });
}

export async function streamChatTurn(
  payload: ChatTurnRequest,
  handlers: {
    onChunk: (text: string) => void;
    onDone: (result: ChatTurnResponse) => void;
  },
): Promise<void> {
  const body = chatTurnRequestSchema.parse(payload);
  const result = chatTurnResponseSchema.parse(
    await sendRuntimeMessage<ChatTurnResponse>({
      type: "genchat.turn",
      payload: body,
    }),
  );

  const chunks = result.answerMarkdown.match(/.{1,140}(\s|$)/g) ?? [result.answerMarkdown];
  for (const chunk of chunks) {
    handlers.onChunk(chunk);
    await new Promise((resolve) => window.setTimeout(resolve, 16));
  }

  handlers.onDone(result);
}
