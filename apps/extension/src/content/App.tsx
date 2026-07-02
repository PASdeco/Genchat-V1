import { QUICK_ACTIONS, defaultUserSettings, type ChatTurnResponse, type ContentSnapshot, type DetectedContext, type UserSettings } from "@genchat/shared";
import { useEffect, useMemo, useRef, useState } from "react";
import { detectCurrentContext } from "./detectors";
import { applyHighlights, clearHighlights } from "./highlights";
import { fetchBootstrap, streamChatTurn } from "./services/api";
import { loadSessions, loadSettings, saveSession, saveSettings } from "./storage";
import type { Message, SessionState } from "./types";
import { ChatPanel } from "./components/ChatPanel";
import { TriggerBubble } from "./components/TriggerBubble";

function getPageSessionKey(): string {
  return `page:${window.location.origin}${window.location.pathname}`;
}

function nextMessage(role: Message["role"], content: string): Message {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
  };
}

function rotateTheme(mode: UserSettings["themeMode"]): UserSettings["themeMode"] {
  if (mode === "system") return "light";
  if (mode === "light") return "dark";
  return "system";
}

function resolveTheme(mode: UserSettings["themeMode"]): "light" | "dark" {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

export function App() {
  const [settings, setSettings] = useState<UserSettings>(defaultUserSettings);
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [detected, setDetected] = useState<DetectedContext>({ kind: "unknown", relevanceScore: 0, label: "GenChat" });
  const [context, setContext] = useState<ContentSnapshot | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [quickActions, setQuickActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const sessionIdRef = useRef(getPageSessionKey());

  const theme = useMemo(() => resolveTheme(settings.themeMode), [settings.themeMode]);

  useEffect(() => {
    loadSettings().then(setSettings).catch(() => setSettings(defaultUserSettings));
    loadSessions().then((sessions) => {
      const existing = sessions[getPageSessionKey()];
      if (existing) {
        sessionIdRef.current = existing.sessionId;
        setMessages(existing.messages);
        setQuickActions(existing.quickActions);
        setContext(existing.context);
        setDetected(existing.detected ?? { kind: "unknown", relevanceScore: 0, label: "GenChat" });
      }
    });
  }, []);

  useEffect(() => {
    const update = () => {
      if (!settings.enabled) {
        setDetected({ kind: "unknown", relevanceScore: 0, label: "GenChat" });
        setContext(undefined);
        clearHighlights();
        return;
      }

      const result = detectCurrentContext();
      setDetected(result.detected);
      setContext(result.snapshot);

      if (result.snapshot?.kind === "docs" && settings.showHighlights && !open) {
        applyHighlights(result.snapshot, true);
      } else {
        clearHighlights();
      }
    };

    update();
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      clearHighlights();
    };
  }, [open, settings.enabled, settings.showHighlights]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function persist(nextMessages: Message[], nextContext = context, nextDetected = detected, nextQuickActions = quickActions) {
    const session: SessionState = {
      sessionId: sessionIdRef.current,
      messages: nextMessages,
      quickActions: nextQuickActions,
      context: nextContext,
      detected: nextDetected,
    };
    await saveSession(getPageSessionKey(), session);
  }

  async function ensureBootstrap(currentContext: ContentSnapshot) {
    if (messages.length) return;
    const result = await fetchBootstrap({
      context: currentContext,
      trigger: "open",
    });
    const assistantMessage = nextMessage("assistant", result.message);
    setMessages([assistantMessage]);
    setQuickActions(result.quickActions);
    await persist([assistantMessage], currentContext, detected, result.quickActions);
  }

  async function handleOpen() {
    setOpen(true);
    if (!context) return;
    await ensureBootstrap(context);
  }

  async function handleSend(message: string, selectedQuickAction?: string) {
    if (!context) return;
    setLoading(true);
    setSettingsOpen(false);

    const userMessage = nextMessage("user", message);
    const assistantMessage = nextMessage("assistant", "");
    const optimistic = [...messages, userMessage, assistantMessage];
    setMessages(optimistic);

    await persist(optimistic, context, detected, quickActions);

    try {
      await streamChatTurn(
        {
          sessionId: sessionIdRef.current,
          context,
          userMessage: message,
          selectedQuickAction,
        },
        {
          onChunk(text) {
            setMessages((current) =>
              current.map((entry) => (entry.id === assistantMessage.id ? { ...entry, content: `${entry.content}${text}` } : entry)),
            );
          },
          onDone(result: ChatTurnResponse) {
            setMessages((current) => {
              const next = current.map((entry) =>
                entry.id === assistantMessage.id
                  ? { ...entry, content: result.answerMarkdown, citations: result.citations }
                  : entry,
              );
              void persist(next, context, detected, quickActions);
              return next;
            });
          },
        },
      );
    } catch (error) {
      setMessages((current) =>
        current.map((entry) =>
          entry.id === assistantMessage.id
            ? { ...entry, content: error instanceof Error ? error.message : "GenChat could not answer just now." }
            : entry,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateSettings(next: UserSettings) {
    setSettings(next);
    await saveSettings(next);
  }

  return (
    <div className="genchat-app" data-theme={theme} data-dock={settings.dockSide}>
      {open && context ? (
        <ChatPanel
          context={context}
          messages={messages}
          quickActions={quickActions.length ? quickActions : QUICK_ACTIONS[context.kind]}
          settings={settings}
          loading={loading}
          settingsOpen={settingsOpen}
          onClose={() => setOpen(false)}
          onDockFlip={() => void updateSettings({ ...settings, dockSide: settings.dockSide === "right" ? "left" : "right" })}
          onToggleSettings={() => setSettingsOpen((current) => !current)}
          onToggleEnabled={() => void updateSettings({ ...settings, enabled: !settings.enabled })}
          onToggleHighlights={() => void updateSettings({ ...settings, showHighlights: !settings.showHighlights })}
          onRotateTheme={() => void updateSettings({ ...settings, themeMode: rotateTheme(settings.themeMode) })}
          onQuickAction={(label) => void handleSend(label, label)}
          onSubmit={(message) => void handleSend(message)}
        />
      ) : detected.relevanceScore >= 0.35 && settings.enabled ? (
        <TriggerBubble label={detected.label} onClick={() => void handleOpen()} />
      ) : null}
    </div>
  );
}
