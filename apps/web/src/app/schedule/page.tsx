"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Channel, ScheduleItem } from "@nysc/shared";
import { api } from "@/lib/api";
import ScheduleView from "@/components/ScheduleView";
import { getLagosDate } from "@/lib/schedule";
import { DEMO_CHANNELS } from "@/lib/demo";

export default function SchedulePage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [date, setDate] = useState(() => getLagosDate());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
  }, []);

  return (
    <div className="schedule-page">
      <div className="schedule-page-heading">
        <div>
          <span className="eyebrow">PLAN YOUR LISTENING</span>
          <h1>Programme schedule</h1>
          <p>Browse what’s on across NYSC Radio &amp; TV.</p>
        </div>
        <label className="schedule-date-picker">
          <span>Schedule date</span>
          <input type="date" value={date} onChange={(event) => {
            if (event.target.value) setDate(event.target.value);
          }} />
        </label>
      </div>

      <div className="schedule-day-label">
        <span>{new Intl.DateTimeFormat("en-NG", {
          timeZone: "Africa/Lagos",
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(new Date(`${date}T12:00:00+01:00`))}</span>
        <span className="schedule-timezone">All times WAT · Africa/Lagos</span>
      </div>

      {error && <div className="notice notice-info" role="status">Demo schedule — sample programmes only, not a live broadcast schedule.</div>}
      {loading && <p className="schedule-message" role="status">Loading channels…</p>}
      {!loading && !error && !channels.length && (
        <div className="empty-state">
          <strong>No channels available</strong>
          <p>Channels will appear here when the service is connected.</p>
        </div>
      )}
      {channels.map((channel) => (
        <section className="schedule-channel" key={channel.id}>
          <div className="schedule-channel-heading">
            <div>
              <span className="channel-kind">{channel.type === "tv" ? "TELEVISION" : "RADIO"}</span>
              <h2><Link href={`/channel/${channel.id}?date=${date}#schedule`}>{channel.name}</Link></h2>
            </div>
            <Link className="schedule-channel-link" href={`/channel/${channel.id}?date=${date}#schedule`}>
              Open channel <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <ScheduleView channelId={channel.id} date={date} />
        </section>
      ))}
    </div>
  );
}
