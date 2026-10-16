import Link from "next/link";
import type { Channel } from "@nysc/shared";
import { isDemoChannel } from "@/lib/demo";

export default function ChannelCard({ channel }: { channel: Channel }) {
  const artworkUrl = channel.thumbnailUrl || channel.logoUrl;

  return (
    <Link className="channel-card" href={`/channel/${channel.id}`}>
      <div className={`channel-art channel-art-${channel.type}`}>
        {artworkUrl
          ? <img src={artworkUrl} alt="" />
          : <span aria-hidden="true">{channel.type === "tv" ? "▶" : "♫"}</span>}
        {channel.isLive
          ? <span className="live-badge"><span /> LIVE</span>
          : isDemoChannel(channel.id) && <span className="demo-badge">DEMO</span>}
      </div>
      <div className="channel-card-copy">
        <div className="channel-card-heading">
          <strong>{channel.name}</strong>
          <span className="card-arrow" aria-hidden="true">↗</span>
        </div>
        <span className="channel-kind">{channel.type === "tv" ? "Television" : "Radio"}{isDemoChannel(channel.id) ? " · Sample preview" : ""}</span>
        {channel.description && <p>{channel.description}</p>}
      </div>
    </Link>
  );
}
