export type ChannelType = "tv" | "radio";
export type StreamProfile = "audio" | "144p" | "360p" | "720p" | "1080p";

export interface Channel {
  id: string;
  slug: string;
  name: string;
  type: ChannelType;
  description?: string;
  logoUrl?: string;
  hlsUrl: string;        // ABR master playlist (.m3u8)
  audioUrl?: string;     // AAC-HE radio / audio-only fallback
  videoUrl?: string;     // Optional MP4 or YouTube URL for a preview
  thumbnailUrl?: string; // Optional small image / poster used in programme lists
  isLive: boolean;
}

export interface ScheduleItem {
  id: string;
  channelId: string;
  title: string;
  description?: string;
  startsAt: string; // ISO
  endsAt: string;   // ISO
  // Optional preview assets for a scheduled programme
  previewImageUrl?: string;
  previewAudioUrl?: string;
  previewVideoUrl?: string;
}

export interface ChatMessage {
  id: string;
  uid: string;
  displayName: string;
  text: string;
  createdAt: number; // epoch ms
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  stateCode?: string; // NYSC call-up / state code
  role: "member" | "admin";
}
