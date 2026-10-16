"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { Channel } from "@nysc/shared";
import { api } from "@/lib/api";
import Player from "@/components/Player";
import ChatPanel from "@/components/ChatPanel";
import ScheduleView from "@/components/ScheduleView";
import { getLagosDate, isScheduleDate } from "@/lib/schedule";
import { getDemoChannel, isDemoChannel } from "@/lib/demo";

export default function ChannelPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [date, setDate] = useState(() => searchParams.get("date") ?? getLagosDate());
  const [channelError, setChannelError] = useState("");

  useEffect(() => {
    let active = true;
    setChannel(null);
    setChannelError("");

    if (isDemoChannel(id)) {
      const demoChannel = getDemoChannel(id);
      if (demoChannel) setChannel(demoChannel);
      else setChannelError("This demo channel does not exist.");
      return () => { active = false; };
    }

    api.getChannel(id)
      .then((result) => { if (active) setChannel(result); })
      .catch((error: unknown) => {
        if (active) setChannelError(error instanceof Error ? error.message : "Unable to load this channel.");
      });

    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    const queryDate = searchParams.get("date");
    setDate(queryDate && isScheduleDate(queryDate) ? queryDate : getLagosDate());
  }, [searchParams]);

  function changeDate(nextDate: string) {
    if (!nextDate) return;
    setDate(nextDate);
    router.replace(`/channel/${id}?date=${nextDate}#schedule`, { scroll: false });
  }

  useEffect(() => {
    if (channel && window.location.hash === "#schedule") {
      document.getElementById("schedule")?.scrollIntoView({ block: "start" });
    }
  }, [channel]);

  if (!channel) return <p role={channelError ? "alert" : undefined}>{channelError || "Loading…"}</p>;
  return (
    <>
      <div className="channel-page-heading">
        <div>
          <span className="eyebrow">{isDemoChannel(channel.id) ? "DEMO MEDIA PREVIEW" : channel.type === "tv" ? "LIVE TELEVISION" : "LIVE RADIO"}</span>
          <h1>{channel.name}</h1>
          {channel.description && <p>{channel.description}</p>}
        </div>
        {channel.isLive && <span className="live-badge channel-live-badge"><span /> LIVE</span>}
      </div>
      <Player channel={channel} />
      <section className="channel-schedule" id="schedule">
        <div className="channel-schedule-heading">
          <div>
            <span className="eyebrow">ON THIS CHANNEL</span>
            <h2>Programme schedule</h2>
          </div>
          <label className="schedule-date-picker">
            <span>Schedule date</span>
            <input type="date" value={date} onChange={(event) => changeDate(event.target.value)} />
          </label>
        </div>
        <ScheduleView channelId={id} date={date} />
      </section>
      <ChatPanel channelId={id} />
    </>
  );
}
