export function parseTweetUrl(url: string): { tweetId: string | null; username: string | null } {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace("www.", "");

    if (hostname !== "twitter.com" && hostname !== "x.com") {
      return { tweetId: null, username: null };
    }

    const parts = urlObj.pathname.split("/").filter(Boolean);
    // Format: /{username}/status/{tweetId}
    if (parts.length >= 3 && parts[1] === "status") {
      return { tweetId: parts[2], username: parts[0] };
    }

    return { tweetId: null, username: parts[0] || null };
  } catch {
    return { tweetId: null, username: null };
  }
}

export function extractHashtags(content: string): string[] {
  const matches = content.match(/#\w+/g);
  return matches ? matches.map((m) => m.slice(1).toLowerCase()) : [];
}

export function detectPlatform(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    const platformMap: Record<string, string> = {
      "medium.com": "Medium",
      "dev.to": "Dev.to",
      "hashnode.dev": "Hashnode",
      "hashnode.com": "Hashnode",
      "mirror.xyz": "Mirror",
      "substack.com": "Substack",
      "wordpress.com": "WordPress",
      "ghost.org": "Ghost",
      "notion.so": "Notion",
      "github.com": "GitHub",
    };

    for (const [domain, platform] of Object.entries(platformMap)) {
      if (hostname.includes(domain)) return platform;
    }

    return hostname;
  } catch {
    return "Unknown";
  }
}
