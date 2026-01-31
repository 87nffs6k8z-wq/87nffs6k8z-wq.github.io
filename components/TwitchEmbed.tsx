"use client";

import { useEffect, useId, useRef } from "react";

declare global {
  interface Window {
    Twitch?: any;
  }
}

export function TwitchEmbed({
  channel,
  parents,
  height = 400
}: {
  channel: string;
  parents: readonly string[];
  height?: number;
}) {
  const containerId = useId().replace(/:/g, ""); // make it DOM-safe
  const created = useRef(false);

  useEffect(() => {
    if (created.current) return;
    created.current = true;

    // Load Twitch embed script once
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-twitch-embed="true"]'
    );

    const loadScript = () =>
      new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://embed.twitch.tv/embed/v1.js";
        s.async = true;
        s.dataset.twitchEmbed = "true";
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Failed to load Twitch embed script"));
        document.body.appendChild(s);
      });

    const init = () => {
      if (!window.Twitch?.Embed) return;

      // Create embed
      new window.Twitch.Embed(containerId, {
        width: "100%",
        height: String(height),
        channel,
        layout: "video",
        parent: Array.from(parents) // must be array of domains (no protocol, no path)
      });
    };

    (existing ? Promise.resolve() : loadScript())
      .then(() => init())
      .catch(() => {
        // no-op; you can show a fallback button if you want
      });
  }, [channel, parents, containerId, height]);

  return (
    <div
      id={containerId}
      style={{
        width: "100%",
        height,
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,.08)",
        background: "rgba(0,0,0,.2)"
      }}
    />
  );
}