import type { UserSettings } from "@genchat/shared";

type SettingsMenuProps = {
  settings: UserSettings;
  onToggleEnabled: () => void;
  onToggleHighlights: () => void;
  onRotateTheme: () => void;
};

export function SettingsMenu({ settings, onToggleEnabled, onToggleHighlights, onRotateTheme }: SettingsMenuProps) {
  return (
    <div className="genchat-settings-menu">
      <div className="genchat-setting-row">
        <span>Auto-detect</span>
        <button className="genchat-switch" data-on={settings.enabled} type="button" onClick={onToggleEnabled} />
      </div>
      <div className="genchat-setting-row">
        <span>Highlights</span>
        <button className="genchat-switch" data-on={settings.showHighlights} type="button" onClick={onToggleHighlights} />
      </div>
      <div className="genchat-setting-row">
        <span>Theme</span>
        <button className="genchat-chip" type="button" onClick={onRotateTheme}>
          {settings.themeMode}
        </button>
      </div>
      <div className="genchat-status">About GenChat: testing build</div>
    </div>
  );
}
