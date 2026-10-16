"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ScheduleItem } from "@nysc/shared";
import { api } from "@/lib/api";
import { formatScheduleTime } from "@/lib/schedule";
import { getDemoSchedule, isDemoChannel } from "@/lib/demo";

export default function ScheduleView({
  channelId,
  date,
}: {
  channelId: string;
  date: string;
}) {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    if (isDemoChannel(channelId)) {
      setItems(getDemoSchedule(channelId, date));
      setLoading(false);
      return () => { active = false; };
    }

    api.getSchedule(channelId, date)
      .then((result) => { if (active) setItems(result); })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load the schedule.");
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [channelId, date]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  if (loading) {
    return <p className="schedule-message" role="status">Loading this day’s programmes…</p>;
  }
  if (error) {
    return <p className="schedule-message schedule-message-error" role="alert">{error}</p>;
  }
  if (!items.length) {
    return <p className="schedule-message">No programmes scheduled for this day.</p>;
  }

  return (
    <ol className="schedule-list">
      {items.map((item) => {
        const start = new Date(item.startsAt).getTime();
        const end = new Date(item.endsAt).getTime();
        const live = now >= start && now < end;
        const past = now >= end;
        return (
          <li className={`schedule-item${live ? " schedule-item-live" : ""}${past ? " schedule-item-past" : ""}`} key={item.id}>
            <span className="schedule-time">
              <time dateTime={item.startsAt}>{formatScheduleTime(item.startsAt)}</time>
              <span aria-hidden="true">—</span>
              <time dateTime={item.endsAt}>{formatScheduleTime(item.endsAt)}</time>
            </span>
            <Link className="schedule-programme" href={`/channel/${channelId}?date=${date}#schedule`}>
              {item.previewImageUrl && (
                <img src={item.previewImageUrl} alt="" className="schedule-thumb" />
              )}
              <span className="schedule-programme-title">
                <strong>{item.title}</strong>
                {live && <span className="schedule-on-air"><i /> ON AIR</span>}
                {!live && !past && <span className="schedule-up-next">UP NEXT</span>}
              </span>
              {item.description && <span className="schedule-description">{item.description}</span>}
            </Link>
            <Link className="schedule-open" href={`/channel/${channelId}?date=${date}#schedule`} aria-label={`Open ${item.title} on channel`}>
              →
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
