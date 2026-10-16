import type { Channel, ScheduleItem } from "@nysc/shared";

export interface DemoChannel extends Channel {
  isDemo: true;
  videoUrl?: string;
}

export const DEMO_CHANNELS: DemoChannel[] = [
  {
    id: "demo-tv",
    slug: "nysc-tv-preview",
    name: "NYSC TV Preview",
    type: "tv",
    description: "A video related to youth service, shared from Channels Television. This is not a live NYSC broadcast.",
    logoUrl: "/media/nysc-tv-artwork.svg",
    hlsUrl: "",
    videoUrl: "https://www.youtube.com/watch?v=L5-YIWd4JWc",
    isLive: false,
    isDemo: true,
  },
  {
    id: "demo-radio",
    slug: "nysc-radio-preview",
    name: "NYSC Radio Preview",
    type: "radio",
    description: "Play a short original audio tone sample. Replace it with your radio stream URL when ready.",
    logoUrl: "/media/nysc-radio-artwork.svg",
    hlsUrl: "",
    audioUrl: "/media/nysc-radio-preview.wav",
    isLive: false,
    isDemo: true,
  },
];

export function getDemoChannel(id: string): DemoChannel | undefined {
  return DEMO_CHANNELS.find((channel) => channel.id === id);
}

export function isDemoChannel(id: string): boolean {
  return id.startsWith("demo-");
}

export function getDemoSchedule(channelId: string, date: string): ScheduleItem[] {
  const channel = getDemoChannel(channelId);
  if (!channel) return [];

  const programmes = channel.type === "tv"
    ? [
      ["06:00", "Morning Assembly", "A sample start to the NYSC broadcast day.", 120],
      ["08:00", "Service Across Nigeria", "Stories and updates from communities.", 180],
      ["11:00", "The Community Hour", "Conversations from corps members and partners.", 180],
      ["14:00", "Afternoon Update", "A sample bulletin and service announcements.", 120],
      ["16:00", "Culture & Connection", "Music and features from across Nigeria.", 180],
      ["19:00", "Evening Reflection", "A quiet close to the broadcast day.", 60],
    ]
    : [
      ["06:00", "Good Morning, NYSC", "An original short audio preview for the demo station.", 120],
      ["08:00", "Service News", "Community updates and announcements.", 180],
      ["11:00", "The Midday Mix", "Music selected for corps members on the move.", 180],
      ["14:00", "Corps Connect", "Stories and conversations from across Nigeria.", 120],
      ["16:00", "Evening Drive", "A sample soundtrack for the journey home.", 180],
      ["19:00", "Lights Out", "The final programme in this sample schedule.", 60],
    ];

  return programmes.map(([time, title, description, duration], index) => {
    const startsAt = new Date(`${date}T${time}:00+01:00`);
    const endsAt = new Date(startsAt.getTime() + Number(duration) * 60_000);
    return {
      id: `${channelId}-${date}-${index}`,
      channelId,
      title: String(title),
      description: String(description),
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      // include a small preview image for demo programmes (use channel artwork when available)
      previewImageUrl: channel.logoUrl ?? (channel.type === "tv" ? "/media/nysc-tv-artwork.svg" : "/media/nysc-radio-artwork.svg"),
    };
  });
}
