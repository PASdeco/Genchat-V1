import type { ContentSnapshot } from "@genchat/shared";

type ContextStripProps = {
  context?: ContentSnapshot;
};

export function ContextStrip({ context }: ContextStripProps) {
  if (!context) return null;

  const label = context.kind === "docs" ? `Reading: ${context.activeHeading}` : `Reading: ${context.authorHandle}`;
  const text = context.kind === "docs" ? context.activeSnippet : context.tweetText;

  return (
    <div className="genchat-context">
      <span className="genchat-context-chip">{label}</span>
      <p>{text}</p>
    </div>
  );
}
