import { IconMessageCircle } from "./Icons";

type TriggerBubbleProps = {
  label?: string;
  onClick: () => void;
};

export function TriggerBubble({ label, onClick }: TriggerBubbleProps) {
  return (
    <div className="genchat-trigger-row">
      {label ? <div className="genchat-trigger-label">{label}</div> : null}
      <button className="genchat-trigger" type="button" onClick={onClick} aria-label="Open GenChat">
        <IconMessageCircle size={20} />
      </button>
    </div>
  );
}
