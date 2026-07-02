type IconProps = {
  size?: number;
};

function SvgIcon({ children, size = 16 }: React.PropsWithChildren<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export function IconMessageCircle({ size }: IconProps) {
  return (
    <SvgIcon size={size}>
      <path d="M7 10h10" />
      <path d="M7 14h6" />
      <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-4-.98L3 21l1.23-4.53A8.5 8.5 0 1 1 21 11.5Z" />
    </SvgIcon>
  );
}

export function IconArrowUp({ size }: IconProps) {
  return (
    <SvgIcon size={size}>
      <path d="m12 19 0-14" />
      <path d="m7 10 5-5 5 5" />
    </SvgIcon>
  );
}

export function IconClose({ size }: IconProps) {
  return (
    <SvgIcon size={size}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </SvgIcon>
  );
}

export function IconSettings({ size }: IconProps) {
  return (
    <SvgIcon size={size}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 1-2 0 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 1 0-2 1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 1 2 0 1.65 1.65 0 0 0 1 .6 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.25.31.48.67.6 1 .17.55.17 1.45 0 2-.12.33-.35.69-.6 1Z" />
    </SvgIcon>
  );
}

export function IconDockLeft({ size }: IconProps) {
  return (
    <SvgIcon size={size}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M9 5v14" />
    </SvgIcon>
  );
}

export function IconDockRight({ size }: IconProps) {
  return (
    <SvgIcon size={size}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M15 5v14" />
    </SvgIcon>
  );
}
