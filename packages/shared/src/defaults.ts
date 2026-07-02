import type { UserSettings } from "./schemas";

export const defaultUserSettings: UserSettings = {
  enabled: true,
  themeMode: "system",
  showHighlights: true,
  dockSide: "right",
  hasSeenIntro: false,
};
