import { site } from "@/content/site";
import { Card } from "@/components/Card";

function YouTubeEmbed({ id }: { id: string }) {
  const isPlaylist = id.startsWith("PL");
  const src = isPlaylist
    ? `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(id)}`
    : `https://www.youtube.com/embed/${encodeURIComponent(id)}`;

  return (
    <div style={{ position: "relative", paddingTop: "56.25%" }}>
      <iframe
        title="YouTube highlights"
        src={src}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          border: 0,
          borderRadius: 14,
          background: "rgba(0,0,0,.2)"
        }}
      />
    </div>
  );
}

export function Highlights() {
  if (!site.embeds.youtubePlaylistOrVideo) {
    return (
      <Card>
        <p className="p">
          Add a YouTube playlist ID (starts with <strong style={{ color: "var(--text)" }}>PL</strong>) or a video ID in{" "}
          <strong style={{ color: "var(--text)" }}>src/content/site.ts</strong> to enable the highlights embed.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <YouTubeEmbed id={site.embeds.youtubePlaylistOrVideo} />
    </Card>
  );
}