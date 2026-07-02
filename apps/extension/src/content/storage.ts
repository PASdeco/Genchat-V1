import { STORAGE_KEYS, defaultUserSettings, userSettingsSchema, type UserSettings } from "@genchat/shared";
import type { SessionState } from "./types";

type SessionMap = Record<string, SessionState>;

export async function loadSettings(): Promise<UserSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.settings);
  const candidate = result[STORAGE_KEYS.settings] ?? defaultUserSettings;
  return userSettingsSchema.parse(candidate);
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.settings]: settings });
}

export async function loadSessions(): Promise<SessionMap> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.sessions);
  return (result[STORAGE_KEYS.sessions] ?? {}) as SessionMap;
}

export async function saveSession(key: string, session: SessionState): Promise<void> {
  const sessions = await loadSessions();
  sessions[key] = session;
  await chrome.storage.local.set({ [STORAGE_KEYS.sessions]: sessions });
}
