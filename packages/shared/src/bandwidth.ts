import type { StreamProfile } from "./types";

/** Maps a connection hint (web effectiveType / RN cellularGeneration) to a stream profile. */
export function chooseProfile(
  hint: string | null | undefined,
  override: StreamProfile | "auto" = "auto"
): StreamProfile {
  if (override !== "auto") return override;
  switch ((hint ?? "").toLowerCase()) {
    case "slow-2g":
    case "2g": return "audio";   // 2G / EDGE: audio-only
    case "3g": return "360p";
    case "4g": return "720p";
    case "5g":
    case "wifi":
    case "ethernet": return "1080p";
    default: return "360p";      // unknown: safe middle ground
  }
}
