"use client";
import { useEffect, useRef, useState } from "react";
import Hls, { Events, type ErrorData } from "hls.js";
import { chooseProfile, type Channel, type StreamProfile } from "@nysc/shared";
import type { DemoChannel } from "@/lib/demo";

const OPTIONS: (StreamProfile | "auto")[] = ["auto", "audio", "360p", "720p", "1080p"];

function getYouTubeVideoId(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    const id = parsed.hostname === "youtu.be"
      ? parsed.pathname.slice(1)
      : ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(parsed.hostname)
        ? parsed.pathname === "/watch"
          ? parsed.searchParams.get("v")
          : parsed.pathname.startsWith("/embed/")
            ? parsed.pathname.split("/")[2]
            : undefined
        : undefined;
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : undefined;
  } catch {
    return undefined;
  }
}

export default function Player({ channel }: { channel: Channel | DemoChannel }) {
  const ref = useRef<HTMLMediaElement | null>(null);
  const [override, setOverride] = useState<StreamProfile | "auto">("auto");
  const [mediaError, setMediaError] = useState("");
  const hint = typeof navigator !== "undefined" ? (navigator as any).connection?.effectiveType : undefined;
  const profile = chooseProfile(hint, override);
  const audioOnly = channel.type === "radio" || (profile === "audio" && Boolean(channel.audioUrl));
  const source = audioOnly
    ? channel.audioUrl || channel.hlsUrl || undefined
    : channel.videoUrl || channel.hlsUrl;
  const youtubeVideoId = source ? getYouTubeVideoId(source) : undefined;
  const hlsSource = source ? /\.m3u8(?:$|\?)/i.test(source) : false;

  useEffect(() => {
    const media = ref.current;
    if (!media || !source || youtubeVideoId) return;
    let hls: Hls | undefined;
    setMediaError("");

    if (hlsSource && Hls.isSupported()) {
      hls = new Hls({ capLevelToPlayerSize: true });
      hls.loadSource(source);
      hls.attachMedia(media);
      hls.on(Events.ERROR, (_event: Events.ERROR, data: ErrorData) => {
        if (data.fatal) {
          setMediaError("This stream is currently unavailable.");
          hls?.destroy();
        }
      });
    } else {
      media.src = source;
    }
    return () => hls?.destroy();
  }, [channel.id, source, hlsSource, audioOnly, youtubeVideoId]);

  return (
    <div className="player-panel">
      {"isDemo" in channel && channel.isDemo && (
        <p className="demo-media-note">
          Demo preview — this is not a live broadcast. Add your stream URL to replace it.
          {youtubeVideoId && <> Source: <a href={`https://www.youtube.com/watch?v=${youtubeVideoId}`} target="_blank" rel="noreferrer">watch on YouTube</a>.</>}
        </p>
      )}
      {youtubeVideoId && !("isDemo" in channel && channel.isDemo) && (
        <p className="demo-media-note">
          Video source: <a href={`https://www.youtube.com/watch?v=${youtubeVideoId}`} target="_blank" rel="noreferrer">watch on YouTube</a>.
        </p>
      )}
      {audioOnly ? (
        <div className="audio-player-card">
          <img src={channel.logoUrl || "/media/nysc-radio-artwork.svg"} alt="" />
          <audio
            ref={(node) => { ref.current = node; }}
            controls
            preload="metadata"
            onError={() => setMediaError("Audio preview could not be loaded.")}
          />
        </div>
      ) : youtubeVideoId ? (
        <iframe
          className="channel-video-frame"
          src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}`}
          title={`${channel.name} video preview`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <video
          ref={(node) => { ref.current = node; }}
          className="channel-video"
          controls
          playsInline
          preload="metadata"
          poster={channel.thumbnailUrl || channel.logoUrl}
          onError={() => setMediaError("Video preview could not be loaded.")}
        />
      )}
      {mediaError && <p className="player-error" role="alert">{mediaError}</p>}
      <label className="player-quality">
        Playback quality:{" "}
        <select value={override} onChange={(event) => setOverride(event.target.value as StreamProfile | "auto")}>
          {OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </select>
        {override === "auto" && ` (using ${profile})`}
      </label>
    </div>
  );
}
