import type { ChatTurnResponse, ContentSnapshot, DetectedContext } from "@genchat/shared";

export type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  citations?: ChatTurnResponse["citations"];
};

export type SessionState = {
  sessionId: string;
  messages: Message[];
  quickActions: string[];
  context?: ContentSnapshot;
  detected?: DetectedContext;
};
