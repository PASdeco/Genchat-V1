import type { SectionSnapshot } from "@genchat/shared";

const HIGHLIGHT_SELECTOR = "[data-genchat-highlight='true']";
const POPOVER_ID = "genchat-highlight-popover";

function clearPopover() {
  document.getElementById(POPOVER_ID)?.remove();
}

export function clearHighlights(): void {
  clearPopover();
  document.querySelectorAll<HTMLElement>(HIGHLIGHT_SELECTOR).forEach((node) => {
    const parent = node.parentNode;
    if (!parent) return;
    parent.replaceChild(document.createTextNode(node.textContent || ""), node);
    parent.normalize();
  });
}

function showPopover(target: HTMLElement, definition: string): void {
  clearPopover();
  const rect = target.getBoundingClientRect();
  const popover = document.createElement("div");
  popover.id = POPOVER_ID;
  popover.className = "genchat-highlight-popover";
  popover.textContent = definition;
  popover.style.top = `${window.scrollY + rect.bottom + 8}px`;
  popover.style.left = `${window.scrollX + rect.left}px`;
  document.body.append(popover);
}

function highlightTextNode(textNode: Text, term: string, definition: string): boolean {
  const value = textNode.nodeValue || "";
  const index = value.toLowerCase().indexOf(term.toLowerCase());
  if (index < 0) return false;
  const span = document.createElement("span");
  span.dataset.genchatHighlight = "true";
  span.className = "genchat-inline-highlight";
  span.textContent = value.slice(index, index + term.length);
  span.addEventListener("mouseenter", () => showPopover(span, definition));
  span.addEventListener("mouseleave", () => clearPopover());
  const fragment = document.createDocumentFragment();
  fragment.append(value.slice(0, index), span, value.slice(index + term.length));
  textNode.parentNode?.replaceChild(fragment, textNode);
  return true;
}

export function applyHighlights(snapshot?: SectionSnapshot, enabled = true): void {
  clearHighlights();
  if (!enabled || !snapshot || snapshot.kind !== "docs") return;
  const scope = document.querySelector("main, article, [role='main']") || document.body;
  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const value = node.nodeValue?.trim() || "";
      if (value.length < 24) return NodeFilter.FILTER_REJECT;
      if ((node.parentElement?.closest(HIGHLIGHT_SELECTOR))) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const terms = snapshot.detectedTerms.slice(0, 4);
  let highlighted = 0;

  while (walker.nextNode() && highlighted < terms.length) {
    const currentNode = walker.currentNode as Text;
    const term = terms[highlighted];
    if (highlightTextNode(currentNode, term.term, term.definition)) {
      highlighted += 1;
    }
  }
}
