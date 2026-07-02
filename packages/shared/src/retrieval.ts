import { glossaryEntries } from "./glossary";

export type KnowledgeDoc = {
  id: string;
  title: string;
  body: string;
  tags: string[];
};

export const curatedKnowledgeBase: KnowledgeDoc[] = [
  {
    id: "docs-intelligent-contracts",
    title: "Intelligent Contracts Overview",
    body: "GenLayer's core idea is that intelligent contracts can reason over richer input sources and still produce outcomes that the network can validate. They are useful for semantic rules, policy interpretation, and workflows that depend on unstructured context.",
    tags: ["intelligent contracts", "contracts", "reasoning"],
  },
  {
    id: "docs-consensus",
    title: "Optimistic Democracy and Validation",
    body: "GenLayer describes Optimistic Democracy as the mechanism used to validate or challenge reasoning-heavy outputs. Validators re-check important work so the system can agree on accepted results.",
    tags: ["optimistic democracy", "validators", "consensus"],
  },
  {
    id: "docs-governance",
    title: "Governance Context",
    body: "Governance discussions often cover proposals, upgrades, incentives, and ecosystem coordination. GenChat should explain the current proposal in plain language and tie it back to the active page or post.",
    tags: ["governance", "proposal"],
  },
  {
    id: "docs-studionet",
    title: "StudioNet Testing Context",
    body: "StudioNet is used as a testing environment for developers building GenLayer apps. When a page mentions StudioNet, users often need help understanding whether the reference is about deployment, testing, or workflow setup.",
    tags: ["studionet", "testing", "network"],
  },
];

function scoreDocument(document: KnowledgeDoc, query: string): number {
  const haystack = `${document.title} ${document.body} ${document.tags.join(" ")}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .reduce((score, token) => score + (haystack.includes(token) ? 1 : 0), 0);
}

export function retrieveKnowledge(query: string, limit = 3): KnowledgeDoc[] {
  const glossaryBoosts = glossaryEntries.flatMap((entry) => [entry.term, ...entry.aliases]).join(" ");
  return curatedKnowledgeBase
    .map((document) => ({
      document,
      score: scoreDocument(document, `${query} ${glossaryBoosts}`),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.document);
}
