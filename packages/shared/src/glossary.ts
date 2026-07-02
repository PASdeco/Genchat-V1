export type GlossaryEntry = {
  term: string;
  aliases: string[];
  category: "protocol" | "governance" | "contracts" | "network";
  definition: string;
};

export const glossaryEntries: GlossaryEntry[] = [
  {
    term: "GenLayer",
    aliases: ["genlayer"],
    category: "protocol",
    definition: "A protocol for intelligent contracts that can reason over richer inputs while still finalizing outcomes through network consensus.",
  },
  {
    term: "Intelligent Contract",
    aliases: ["intelligent contracts", "intelligent contract"],
    category: "contracts",
    definition: "A contract pattern that can reason over unstructured inputs instead of only deterministic state transitions.",
  },
  {
    term: "Optimistic Democracy",
    aliases: ["optimistic democracy"],
    category: "governance",
    definition: "GenLayer's consensus approach for validating reasoning-heavy or nondeterministic outputs.",
  },
  {
    term: "Validator",
    aliases: ["validators", "validator"],
    category: "network",
    definition: "A network participant that checks work and helps the system agree on accepted outcomes.",
  },
  {
    term: "StudioNet",
    aliases: ["studionet", "studio net"],
    category: "network",
    definition: "A GenLayer network environment used for building and testing applications.",
  },
  {
    term: "Governance",
    aliases: ["proposal", "governance", "governance proposal"],
    category: "governance",
    definition: "The process through which protocol changes, priorities, or decisions are proposed and discussed.",
  },
];

export function matchGlossaryTerms(text: string): GlossaryEntry[] {
  const haystack = text.toLowerCase();
  return glossaryEntries.filter((entry) =>
    [entry.term, ...entry.aliases].some((alias) => haystack.includes(alias.toLowerCase())),
  );
}
