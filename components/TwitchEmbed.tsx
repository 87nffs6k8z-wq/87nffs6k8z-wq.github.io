"use client";

import { useEffect, useMemo, useState } from "react";

export function TwitchEmbed({
  channel,
  parentDomains
}: {
  channel: string;
  parentDomains?: string[];
}) {
  const [host, setHost] = useState<string | null>(null);

  useEffect(() => {
    setHost(window.location.hostname);
  }, []);

  const src = useMemo(() => {
    const parents = (parentDomains && parentDomains.length > 0)
      ? parentDomains
      : (host ? [host] : []);

    if (parents.length === 0) return null;

    const params = new URLSearchParams({ channel });

    // Twitch requires one or more parent= params
    parents.forEach((p) => params.append("parent", p));

    return `https://player.twitch.tv/?${params.toString()}`;
  }, [channel, host, parentDomains]);

  if (!src) {
    return (
      <div style={{ height: 400, borderRadius: 14, border: "1px solid rgba(255,255,255,.08)" }} />
    );
  }

  return (
    <iframe
      title="Twitch stream"
      src={src}
      height="400"
      width="100%"
      allowFullScreen
      style={{ border: 0, borderRadius: 14, background: "rgba(0,0,0,.2)" }}
    />
  );
}