import type { ContentSnapshot, DetectedContext } from "@genchat/shared";
import { detectDocsContext } from "./docs";
import { detectXContext } from "./x";

export function detectCurrentContext(): { detected: DetectedContext; snapshot?: ContentSnapshot } {
  const host = window.location.hostname.toLowerCase();
  if (host.includes("x.com") || host.includes("twitter.com")) {
    return detectXContext();
  }
  return detectDocsContext();
}
