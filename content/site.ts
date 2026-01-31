export const site = {
    brand: {
      name: "G Corp",
      shortName: "G Corp",
      tagline: "Futuristic gains. Precision entertainment.",
      subtagline:
        "",
      // Core palette (edit freely)
      colors: {
        bg: "#070A12",
        panel: "#0C1224",
        text: "#EAF0FF",
        muted: "#A8B3D6",
        primary: "#4DE1C1", // neon mint
        secondary: "#5B8CFF", // electric blue
        accent: "#F7C948" // gold (financial vibe)
      }
    },
  
    links: {
      primaryCta: { label: "Watch Live", href: "https://www.twitch.tv/itsgazpacho" },
      secondaryCta: { label: "Highlights", href: "#highlights" },
  
      // Link buttons grid
      socials: [
        { label: "Twitch", href: "https://www.twitch.tv/itsgazpacho", icon: "twitch" },
        { label: "YouTube", href: "https://www.youtube.com/@itsgazpacho", icon: "youtube" },
        { label: "TikTok", href: "https://www.tiktok.com/@itsgazpacho1", icon: "tiktok" },
        { label: "Discord", href: "https://discord.com/invite/acsztFJVwB", icon: "discord" },
        { label: "Instagram", href: "https://instagram.com/gzpch_", icon: "instagram" },
        { label: "Donate", href: "https://streamelements.com/itsgazpacho/tip", icon: "donate" }
      ]
    },
  
    embeds: {
      // Leave empty string "" to hide sections automatically
      twitchChannel: "itsgazpacho", // e.g. "myChannelName"
      youtubePlaylistOrVideo: "PLT-GAle3uJjJIQv7Y8ZyKfsPQhjxLJwHt", // e.g. "PLxxxx" OR "dQw4w9WgXcQ"
      twitchParents: [
        "Y87nffs6k8z-wq.github.io"
      ]
    },
  
    contact: {
      email: "business@g-corp.example",
      blurb:
        "For partnerships, sponsorships, or corporate negotiations, contact the division below."
    },
  
    seo: {
      title: "G Corp Streamer Portal",
      description:
        "A futuristic corporate-themed streamer landing page. Built with static Next.js and deployed on GitHub Pages."
    },
    
  } as const;
  
  export type SiteConfig = typeof site;