import type { ContentSnapshot, UserSettings } from "@genchat/shared";
import { ContextStrip } from "./ContextStrip";
import { InputBar } from "./InputBar";
import { IconClose, IconDockLeft, IconDockRight, IconSettings } from "./Icons";
import { MessageBubble } from "./MessageBubble";
import { QuickActionChip } from "./QuickActionChip";
import { SettingsMenu } from "./SettingsMenu";
import { TermHighlight } from "./TermHighlight";
import type { Message } from "../types";

type ChatPanelProps = {
  context?: ContentSnapshot;
  messages: Message[];
  quickActions: readonly string[];
  settings: UserSettings;
  loading: boolean;
  settingsOpen: boolean;
  onClose: () => void;
  onDockFlip: () => void;
  onToggleSettings: () => void;
  onToggleEnabled: () => void;
  onToggleHighlights: () => void;
  onRotateTheme: () => void;
  onQuickAction: (label: string) => void;
  onSubmit: (message: string) => void;
};

export function ChatPanel(props: ChatPanelProps) {
  const {
    context,
    messages,
    quickActions,
    settings,
    loading,
    settingsOpen,
    onClose,
    onDockFlip,
    onToggleSettings,
    onToggleEnabled,
    onToggleHighlights,
    onRotateTheme,
    onQuickAction,
    onSubmit,
  } = props;

  return (
    <div className="genchat-panel-shell">
      <section className="genchat-panel" aria-label="GenChat panel">
        <div className="genchat-header">
          <div className="genchat-brand">
            <div className="genchat-brand-badge">G</div>
            <div>
              <div className="genchat-title">GenChat</div>
              <div className="genchat-subtitle">Context-aware GenLayer companion</div>
            </div>
          </div>
          <div className="genchat-header-actions">
            <button className="genchat-icon-button" type="button" onClick={onDockFlip} aria-label="Change dock side">
              {settings.dockSide === "right" ? <IconDockLeft size={16} /> : <IconDockRight size={16} />}
            </button>
            <button className="genchat-icon-button" type="button" onClick={onToggleSettings} aria-label="Open settings">
              <IconSettings size={16} />
            </button>
            <button className="genchat-icon-button" type="button" onClick={onClose} aria-label="Close GenChat">
              <IconClose size={16} />
            </button>
            {settingsOpen ? (
              <SettingsMenu
                settings={settings}
                onToggleEnabled={onToggleEnabled}
                onToggleHighlights={onToggleHighlights}
                onRotateTheme={onRotateTheme}
              />
            ) : null}
          </div>
        </div>
        <ContextStrip context={context} />
        {messages.length ? (
          <div className="genchat-messages">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {context?.detectedTerms?.length ? (
              <div>
                {context.detectedTerms.slice(0, 4).map((term) => (
                  <TermHighlight key={term.term} term={term.term} />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="genchat-empty">
            <div className="genchat-empty-title">I can help you understand this {context?.kind === "x" ? "post" : "page"}.</div>
            <div className="genchat-empty-copy">Ask for a summary, plain-language explanation, or quick context about the current section.</div>
          </div>
        )}
        <div className="genchat-quick-actions">
          {quickActions.map((action) => (
            <QuickActionChip key={action} label={action} onClick={() => onQuickAction(action)} disabled={loading} />
          ))}
        </div>
        <InputBar disabled={loading} onSubmit={onSubmit} />
      </section>
    </div>
  );
}
