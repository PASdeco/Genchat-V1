export type AppEnv = {
  AI?: {
    run: (model: string, input: Record<string, unknown>) => Promise<unknown>;
  };
  GENCHAT_PUBLIC_ORIGIN?: string;
  GENCHAT_SESSION_LIMIT?: string;
  GENCHAT_DAILY_LIMIT?: string;
  USE_FAKE_AI?: string;
};
