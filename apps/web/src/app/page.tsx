"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Channel } from "@nysc/shared";
import { api } from "@/lib/api";
import ChannelCard from "@/components/ChannelCard";
import { DEMO_CHANNELS, isDemoChannel } from "@/lib/demo";

export default function Home() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "tv" | "radio">("all");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api.getChannels()
      .then((result) => { if (active) setChannels(result); })
      .catch((loadError: unknown) => {
        if (active) {
          setChannels(DEMO_CHANNELS);
          setError(loadError instanceof Error ? loadError.message : "The API is unavailable.");
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reloadKey]);

  const filteredChannels = useMemo(() => {
    const search = query.trim().toLowerCase();
    return channels.filter((channel) =>
      (filter === "all" || channel.type === filter)
      && (!search || channel.name.toLowerCase().includes(search)
        || channel.description?.toLowerCase().includes(search))
    );
  }, [channels, filter, query]);
  const featured = channels.find((channel) => channel.isLive && channel.type === "tv")
    ?? channels.find((channel) => channel.type === "tv")
    ?? channels[0];
  const liveChannels = channels.filter((channel) => channel.isLive).slice(0, 4);

  return (
    <div className="discover-page">
      <div className="mobile-heading">
        <span className="eyebrow">WELCOME TO NYSC RADIO &amp; TV</span>
        <h1>Stories that bring us together.</h1>
      </div>

      <div className="discover-toolbar">
        <div className="back-forward" aria-hidden="true"><span>‹</span><span>›</span></div>
        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Search channels..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search channels"
          />
          <kbd>⌘ K</kbd>
        </label>
        <Link className="toolbar-profile" href="/login" aria-label="Open account">
          <span className="profile-avatar">N</span>
          <span><strong>Welcome</strong><small>NYSC community</small></span>
        </Link>
      </div>

      <section className="featured-panel" aria-label="Featured channel">
        <div className="featured-texture" aria-hidden="true">
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
          <span className="sound-wave"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></span>
        </div>
        <div className="featured-content">
          <div className="featured-kicker"><span className="on-air-dot" /> NYSC ORIGINALS <span className="kicker-divider">/</span> {featured && isDemoChannel(featured.id) ? "DEMO PREVIEW" : "ON AIR"}</div>
          <h1>{featured?.name ?? "Your voice. Your station."}</h1>
          <p>{featured?.description ?? "Tune in for the latest stories, music, and conversations from the NYSC community."}</p>
          <div className="featured-actions">
            {featured
              ? <Link className="button-primary" href={`/channel/${featured.id}`}><span aria-hidden="true">▶</span> {isDemoChannel(featured.id) ? "Play preview" : "Tune in now"}</Link>
              : <Link className="button-primary" href="/schedule">Explore the schedule <span aria-hidden="true">→</span></Link>}
            <span className="featured-caption">{featured && isDemoChannel(featured.id) ? "Sample media · not a live broadcast" : featured?.isLive ? "Broadcasting live now" : "Discover what’s on"}</span>
          </div>
        </div>
        <div className="featured-aside featured-logo-aside">
          <div className="featured-logo-frame">
            <Image
              className="featured-logo"
              src="/nysc-emblem.png"
              alt="National Youth Service Corps emblem"
              width={164}
              height={223}
              priority
            />
          </div>
          <span className="broadcast-label">SERVICE · HUMILITY · COMMUNITY</span>
        </div>
        <span className="featured-index">01 <i /> 04</span>
      </section>

      <section className="channels-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FIND YOUR FREQUENCY</span>
            <h2>Explore channels</h2>
          </div>
          <div className="filter-tabs" role="group" aria-label="Filter channels">
            {(["all", "tv", "radio"] as const).map((option) => (
              <button
                className={filter === option ? "filter-tab filter-tab-active" : "filter-tab"}
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                aria-pressed={filter === option}
              >
                {option === "all" ? "All channels" : option === "tv" ? "Television" : "Radio"}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="notice notice-info" role="status">
            <span><strong>Demo mode.</strong> The API isn’t connected, so sample channels are shown.</span>
            <button type="button" onClick={() => setReloadKey((key) => key + 1)}>Try again</button>
          </div>
        )}
        {loading ? (
          <div className="channel-grid" aria-label="Loading channels">
            {[1, 2, 3].map((item) => <div className="channel-skeleton" key={item}><span /><i /><b /></div>)}
          </div>
        ) : filteredChannels.length ? (
          <div className="channel-grid">
            {filteredChannels.map((channel) => <ChannelCard key={channel.id} channel={channel} />)}
          </div>
        ) : !error ? (
          <div className="empty-state">
            <span aria-hidden="true">⌕</span>
            <strong>{query ? "No channels match your search" : "Channels are coming soon"}</strong>
            <p>{query ? "Try a different name or switch the channel filter." : "Check back soon for live radio and television."}</p>
          </div>
        ) : null}
      </section>

      <section className="lower-panels">
        <Link className="schedule-promo" href="/schedule">
          <span className="promo-icon">▦</span>
          <span className="promo-copy"><small>WHAT'S ON</small><strong>See the full schedule</strong><span>Find your next favourite programme.</span></span>
          <span className="promo-arrow" aria-hidden="true">↗</span>
        </Link>
        <div className="live-panel">
          <div className="live-panel-heading"><span className="on-air-dot" /> {error ? "SAMPLE PREVIEWS" : "LIVE NOW"}</div>
          {liveChannels.length ? liveChannels.map((channel) => (
            <Link className="live-row" href={`/channel/${channel.id}`} key={channel.id}>
              <span className={`live-avatar live-avatar-${channel.type}`}>{channel.type === "tv" ? "▶" : "♫"}</span>
              <span><strong>{channel.name}</strong><small>{channel.type === "tv" ? "Television" : "Radio"}</small></span>
              <span className="live-row-arrow" aria-hidden="true">→</span>
            </Link>
          )) : <p className="live-empty">{loading ? "Finding live channels…" : "No channels are live right now."}</p>}
        </div>
      </section>
      <footer className="page-footer"><span>NYSC Radio &amp; TV</span><span>Serving with purpose · Connecting our community</span></footer>
    </div>
  );
}
