export type SocialIconName =
  | "twitch"
  | "youtube"
  | "instagram"
  | "tiktok"
  | "discord"
  | "donate";

export function SocialIcon({
  name,
  size = 18
}: {
  name: SocialIconName;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  } as const;

  // Simple, clean glyphs (not official brand marks), styled by currentColor
  switch (name) {
    case "twitch":
      return (
        <svg {...common}>
          <path d="M5 4h16v10l-4 4h-4l-2 2H8v-2H5V4z" stroke="currentColor" strokeWidth="2" />
          <path d="M10 8v5M15 8v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <path d="M21 12s0-4-1-5-4-1-8-1-7 0-8 1-1 5-1 5 0 4 1 5 4 1 8 1 7 0 8-1 1-5 1-5z" stroke="currentColor" strokeWidth="2" />
          <path d="M11 10l4 2-4 2v-4z" fill="currentColor" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common}>
          <rect x="6" y="6" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="2" />
          <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" stroke="currentColor" strokeWidth="2" />
          <path d="M16.6 7.7h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common}>
          <path
            d="M14 5v9.2a3.8 3.8 0 1 1-3-3.7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M14 5c.7 2.4 2.3 4 4.7 4.3V12c-2 0-3.6-.8-4.7-2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "discord":
      return (
        <svg {...common}>
          <path
            d="M7 17c2.5 2 7.5 2 10 0l1-9c-2-1.5-4-2-6-2s-4 .5-6 2l1 9z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M10 13h.01M14 13h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case "donate":
      return (
        <svg {...common}>
          <path
            d="M12 21s-7-4.6-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.4-7 10-7 10z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M12 8v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M10 10h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}