export const API_ROUTES = {
  health: "/api/v1/health",
  bootstrap: "/api/v1/chat/bootstrap",
  turn: "/api/v1/chat/turn",
} as const;

export const STORAGE_KEYS = {
  settings: "genchat.settings",
  sessions: "genchat.sessions",
} as const;

export const THEME_MODES = ["light", "dark", "system"] as const;
export const DOCK_SIDES = ["left", "right"] as const;
export const CONTEXT_KINDS = ["docs", "x", "unknown"] as const;

export const UI_LIMITS = {
  maxVisibleHeadings: 6,
  maxPageChunks: 8,
  maxChunkLength: 420,
  maxSnippetLength: 280,
  maxTweetTextLength: 560,
  maxMessageLength: 600,
  maxSessionTurns: 12,
} as const;

export const FREE_TIER_GUARDS = {
  defaultSessionLimit: 12,
  defaultDailyLimit: 350,
  maxSnapshotCharacters: 4_500,
  maxOutputTokens: 360,
  maxRequestBytes: 18_000,
} as const;

export const QUICK_ACTIONS = {
  docs: ["Summarize this", "Explain simply", "What matters here?"],
  x: ["Summarize this post", "Why is this relevant?", "Give context"],
} as const;
