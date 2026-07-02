import { z } from "zod";
import { CONTEXT_KINDS, DOCK_SIDES, THEME_MODES } from "./constants";

export const themeModeSchema = z.enum(THEME_MODES);
export const dockSideSchema = z.enum(DOCK_SIDES);
export const contextKindSchema = z.enum(CONTEXT_KINDS);

export const citationSchema = z.object({
  sourceType: z.enum(["page", "docs"]),
  sourceId: z.string().min(1),
  label: z.string().min(1).max(120),
  excerpt: z.string().min(1).max(240),
  url: z.string().url().optional(),
  chunkId: z.string().optional(),
});

export const detectedTermSchema = z.object({
  term: z.string().min(1).max(80),
  category: z.string().min(1).max(40),
  definition: z.string().min(1).max(280),
});

export const detectedContextSchema = z.object({
  kind: contextKindSchema,
  relevanceScore: z.number().min(0).max(1),
  label: z.string().min(1).max(120),
});

export const pageChunkSchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(120),
  text: z.string().min(1).max(480),
});

export const sectionSnapshotSchema = z.object({
  kind: z.literal("docs"),
  url: z.string().url(),
  title: z.string().min(1).max(180),
  pageType: z.string().min(1).max(60),
  activeHeading: z.string().min(1).max(160),
  activeSnippet: z.string().min(1).max(320),
  visibleHeadings: z.array(z.string().min(1).max(160)).max(6),
  detectedTerms: z.array(detectedTermSchema).max(12),
  pageChunks: z.array(pageChunkSchema).max(8),
});

export const tweetSnapshotSchema = z.object({
  kind: z.literal("x"),
  url: z.string().url(),
  tweetId: z.string().min(1).max(64),
  authorName: z.string().min(1).max(120),
  authorHandle: z.string().min(1).max(80),
  timestamp: z.string().min(1).max(120),
  tweetText: z.string().min(1).max(600),
  quotedTweetText: z.string().max(320).optional(),
  mediaAlt: z.array(z.string().min(1).max(160)).max(4),
  conversationHints: z.array(z.string().min(1).max(120)).max(4),
  detectedTerms: z.array(detectedTermSchema).max(12),
});

export const contentSnapshotSchema = z.discriminatedUnion("kind", [sectionSnapshotSchema, tweetSnapshotSchema]);

export const userSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  themeMode: themeModeSchema.default("system"),
  showHighlights: z.boolean().default(true),
  dockSide: dockSideSchema.default("right"),
  hasSeenIntro: z.boolean().default(false),
});

export const chatBootstrapRequestSchema = z.object({
  context: contentSnapshotSchema,
  trigger: z.enum(["open", "highlight", "quick_action"]),
});

export const chatTurnRequestSchema = z.object({
  sessionId: z.string().min(1).max(120),
  context: contentSnapshotSchema,
  userMessage: z.string().min(1).max(600),
  selectedQuickAction: z.string().max(80).optional(),
});

export const chatTurnResponseSchema = z.object({
  answerMarkdown: z.string().min(1).max(2400),
  citations: z.array(citationSchema).max(8),
  followUps: z.array(z.string().min(1).max(80)).max(4),
  relatedTerms: z.array(z.string().min(1).max(80)).max(6),
  confidence: z.enum(["high", "medium", "low"]),
});

export type Citation = z.infer<typeof citationSchema>;
export type DetectedContext = z.infer<typeof detectedContextSchema>;
export type DetectedTerm = z.infer<typeof detectedTermSchema>;
export type SectionSnapshot = z.infer<typeof sectionSnapshotSchema>;
export type TweetSnapshot = z.infer<typeof tweetSnapshotSchema>;
export type ContentSnapshot = z.infer<typeof contentSnapshotSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;
export type ChatBootstrapRequest = z.infer<typeof chatBootstrapRequestSchema>;
export type ChatTurnRequest = z.infer<typeof chatTurnRequestSchema>;
export type ChatTurnResponse = z.infer<typeof chatTurnResponseSchema>;
