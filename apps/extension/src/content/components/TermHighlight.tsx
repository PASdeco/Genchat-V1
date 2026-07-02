type TermHighlightProps = {
  term: string;
};

export function TermHighlight({ term }: TermHighlightProps) {
  return <span className="genchat-term-chip">{term}</span>;
}
