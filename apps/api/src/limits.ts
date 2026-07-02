import { FREE_TIER_GUARDS } from "@genchat/shared";

const dailyUsage = new Map<string, number>();
const sessionUsage = new Map<string, number>();

function dayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function getUsageState(env: { GENCHAT_SESSION_LIMIT?: string; GENCHAT_DAILY_LIMIT?: string }, sessionId: string) {
  const today = dayKey();
  const dailyKey = `${today}`;
  const sessionKey = `${today}:${sessionId}`;
  return {
    dailyKey,
    sessionKey,
    sessionLimit: Number(env.GENCHAT_SESSION_LIMIT || FREE_TIER_GUARDS.defaultSessionLimit),
    dailyLimit: Number(env.GENCHAT_DAILY_LIMIT || FREE_TIER_GUARDS.defaultDailyLimit),
  };
}

export function assertUsageAvailable(
  env: { GENCHAT_SESSION_LIMIT?: string; GENCHAT_DAILY_LIMIT?: string },
  sessionId: string,
): { ok: true } | { ok: false; message: string } {
  const { dailyKey, sessionKey, sessionLimit, dailyLimit } = getUsageState(env, sessionId);
  const dailyCount = dailyUsage.get(dailyKey) ?? 0;
  const sessionCount = sessionUsage.get(sessionKey) ?? 0;

  if (dailyCount >= dailyLimit) {
    return { ok: false, message: "GenChat has reached its shared testing capacity for today." };
  }

  if (sessionCount >= sessionLimit) {
    return { ok: false, message: "This page has reached the GenChat testing turn limit." };
  }

  return { ok: true };
}

export function consumeUsage(
  env: { GENCHAT_SESSION_LIMIT?: string; GENCHAT_DAILY_LIMIT?: string },
  sessionId: string,
): void {
  const { dailyKey, sessionKey } = getUsageState(env, sessionId);
  dailyUsage.set(dailyKey, (dailyUsage.get(dailyKey) ?? 0) + 1);
  sessionUsage.set(sessionKey, (sessionUsage.get(sessionKey) ?? 0) + 1);
}

export function resetUsageState(): void {
  dailyUsage.clear();
  sessionUsage.clear();
}
