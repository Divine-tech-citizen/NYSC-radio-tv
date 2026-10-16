"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import type { Channel } from "@nysc/shared";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface MediaFields {
  logoUrl: string;
  hlsUrl: string;
  audioUrl: string;
  videoUrl: string;
  thumbnailUrl: string;
}

const EMPTY_MEDIA: MediaFields = {
  logoUrl: "",
  hlsUrl: "",
  audioUrl: "",
  videoUrl: "",
  thumbnailUrl: "",
};

function mediaFields(channel: Channel): MediaFields {
  return {
    logoUrl: channel.logoUrl ?? "",
    hlsUrl: channel.hlsUrl ?? "",
    audioUrl: channel.audioUrl ?? "",
    videoUrl: channel.videoUrl ?? "",
    thumbnailUrl: channel.thumbnailUrl ?? "",
  };
}

export default function ChannelMediaAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelId, setChannelId] = useState("");
  const [fields, setFields] = useState<MediaFields>(EMPTY_MEDIA);
  const [adminVerified, setAdminVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!user) return;

    let active = true;
    setLoading(true);
    setAdminVerified(null);
    setError("");
    user.getIdTokenResult(true)
      .then((token) => {
        if (!active) return;
        const authorized = token.claims.admin === true;
        setAdminVerified(authorized);
        if (!authorized) {
          setChannels([]);
          return;
        }
        return api.getChannels();
      })
      .then((result) => {
        if (!active || !result) return;
        setChannels(result);
        if (result.length) {
          setChannelId(result[0].id);
          setFields(mediaFields(result[0]));
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setAdminVerified(false);
          setError(loadError instanceof Error ? loadError.message : "Unable to load channels.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [user]);

  function selectChannel(id: string) {
    setChannelId(id);
    const channel = channels.find((entry) => entry.id === id);
    setFields(channel ? mediaFields(channel) : EMPTY_MEDIA);
    setError("");
    setNotice("");
  }

  function updateField(field: keyof MediaFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
    setNotice("");
  }

  async function saveMedia(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!channelId || !user) return;

    setSaving(true);
    setError("");
    setNotice("");
    try {
      const updated = await api.updateChannelMedia(channelId, {
        logoUrl: fields.logoUrl.trim() || null,
        hlsUrl: fields.hlsUrl.trim() || null,
        audioUrl: fields.audioUrl.trim() || null,
        videoUrl: fields.videoUrl.trim() || null,
        thumbnailUrl: fields.thumbnailUrl.trim() || null,
      });
      setChannels((current) => current.map((channel) => channel.id === updated.id ? updated : channel));
      setFields(mediaFields(updated));
      setNotice("Channel media settings saved.");
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save channel media.");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) {
    return <p className="schedule-message" role="status">Checking your sign-in…</p>;
  }

  if (!user) {
    return (
      <section className="admin-page">
        <span className="eyebrow">CHANNEL MANAGEMENT</span>
        <h1>Channel media</h1>
        <p className="admin-page-intro">Sign in to edit channel media URLs.</p>
        <p className="admin-notice"><Link href="/login">Go to sign in →</Link></p>
      </section>
    );
  }

  if (adminVerified === null) {
    return <p className="schedule-message" role="status">Checking administrator access…</p>;
  }

  if (!adminVerified) {
    return (
      <section className="admin-page">
        <span className="eyebrow">CHANNEL MANAGEMENT</span>
        <h1>Channel media</h1>
        <p className="admin-notice admin-notice-error" role="alert">
          {error || "Admin access is required. Your Firebase account must have the custom claim admin: true."}
        </p>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <span className="eyebrow">CHANNEL MANAGEMENT</span>
      <h1>Channel media</h1>
      <p className="admin-page-intro">
        Add URLs for live HLS streams, audio, direct video previews, logos and thumbnails.
        The API verifies your Firebase administrator claim before saving.
      </p>

      {error && <p className="admin-notice admin-notice-error" role="alert">{error}</p>}
      {notice && <p className="admin-notice" role="status">{notice}</p>}
      {loading && <p className="schedule-message" role="status">Loading channels…</p>}
      {!loading && !error && channels.length === 0 && (
        <p className="admin-notice">No channels are available to edit.</p>
      )}

      {!loading && channels.length > 0 && (
        <form className="admin-form" onSubmit={saveMedia}>
          <label>
            Channel
            <select value={channelId} onChange={(event) => selectChannel(event.target.value)}>
              {channels.map((channel) => (
                <option value={channel.id} key={channel.id}>{channel.name} ({channel.type})</option>
              ))}
            </select>
          </label>
          <label>
            HLS stream URL (.m3u8)
            <input type="text" inputMode="url" maxLength={2048} value={fields.hlsUrl} onChange={(event) => updateField("hlsUrl", event.target.value)} placeholder="https://example.com/live/playlist.m3u8" />
          </label>
          <label>
            Direct video preview URL (MP4 or YouTube)
            <input type="text" inputMode="url" maxLength={2048} value={fields.videoUrl} onChange={(event) => updateField("videoUrl", event.target.value)} placeholder="https://example.com/preview.mp4" />
          </label>
          <label>
            Audio stream URL
            <input type="text" inputMode="url" maxLength={2048} value={fields.audioUrl} onChange={(event) => updateField("audioUrl", event.target.value)} placeholder="https://example.com/radio/stream.mp3" />
          </label>
          <label>
            Channel logo URL
            <input type="text" inputMode="url" maxLength={2048} value={fields.logoUrl} onChange={(event) => updateField("logoUrl", event.target.value)} placeholder="https://example.com/images/channel-logo.png" />
          </label>
          <label>
            Thumbnail / poster URL
            <input type="text" inputMode="url" maxLength={2048} value={fields.thumbnailUrl} onChange={(event) => updateField("thumbnailUrl", event.target.value)} placeholder="https://example.com/images/programme.jpg" />
          </label>
          <button type="submit" disabled={saving || !channelId}>
            {saving ? "Saving…" : "Save media URLs"}
          </button>
        </form>
      )}
    </section>
  );
}
