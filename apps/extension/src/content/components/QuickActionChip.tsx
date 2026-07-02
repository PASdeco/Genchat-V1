type QuickActionChipProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

export function QuickActionChip({ label, onClick, disabled }: QuickActionChipProps) {
  return (
    <button className="genchat-chip" type="button" onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
