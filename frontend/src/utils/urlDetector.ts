/**
 * URL Detection Utility
 * Detects and extracts URLs from text with metadata for preview/summarization
 */

// Comprehensive URL regex pattern
const URL_REGEX = /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi;

// Stricter URL regex (requires http/https)
const STRICT_URL_REGEX = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi;

export interface DetectedUrl {
  url: string;
  startIndex: number;
  endIndex: number;
  isHttps: boolean;
  domain: string;
  path: string;
}

/**
 * Detect all URLs in a text string
 * @param text - Input text to scan for URLs
 * @param strict - If true, only matches URLs with http/https prefix
 * @returns Array of detected URLs with metadata
 */
export function detectUrls(text: string, strict = false): DetectedUrl[] {
  const regex = strict ? STRICT_URL_REGEX : URL_REGEX;
  const matches: DetectedUrl[] = [];
  let match;

  // Reset regex lastIndex for global matching
  regex.lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    const rawUrl = match[0];

    // Normalize URL - add https:// if missing
    let url = rawUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      const parsed = new URL(url);

      matches.push({
        url,
        startIndex: match.index,
        endIndex: match.index + rawUrl.length,
        isHttps: parsed.protocol === 'https:',
        domain: parsed.hostname,
        path: parsed.pathname + parsed.search,
      });
    } catch {
      // Invalid URL, skip
      continue;
    }
  }

  return matches;
}

/**
 * Check if text contains any URLs
 */
export function containsUrl(text: string): boolean {
  return URL_REGEX.test(text);
}

/**
 * Extract the first URL from text
 */
export function extractFirstUrl(text: string): DetectedUrl | null {
  const urls = detectUrls(text, false);
  return urls.length > 0 ? urls[0] : null;
}

/**
 * Check if text is a command to summarize a URL
 * Returns the URL if matched, null otherwise
 */
export function detectSummarizeCommand(text: string): string | null {
  // First check if text contains a URL
  const urls = detectUrls(text, true); // strict - require http/https
  if (urls.length === 0) return null;

  // Keywords that indicate summarization intent
  const summarizeKeywords = [
    'summarize', 'summary', 'summarise', 'tldr', 'tl;dr',
    'extract', 'info', 'information', 'key points',
    'what does', 'what\'s on', 'explain', 'browse',
    'read', 'fetch', 'get content', 'content from',
    'tell me about', 'overview', 'main points',
  ];

  const lowerText = text.toLowerCase();

  // Check if any summarize keyword is present
  const hasSummarizeIntent = summarizeKeywords.some(keyword =>
    lowerText.includes(keyword)
  );

  if (hasSummarizeIntent) {
    return urls[0].url;
  }

  // Also check structured patterns for backward compatibility
  const patterns = [
    /^summarize\s+(.+)$/i,
    /^summarize\s+this\s+page:\s*(.+)$/i,
    /^tldr\s+(.+)$/i,
    /^what\s+does\s+(.+)\s+say\??$/i,
    /^explain\s+(?:this\s+)?article:\s*(.+)$/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const urlMatch = detectUrls(match[1], false);
      if (urlMatch.length > 0) {
        return urlMatch[0].url;
      }
    }
  }

  return null;
}

/**
 * Check if text is a screenshot command
 * Returns the URL if matched, null otherwise
 */
export function detectScreenshotCommand(text: string): string | null {
  // First check if text contains a URL
  const urls = detectUrls(text, true); // strict - require http/https
  if (urls.length === 0) return null;

  // Keywords that indicate screenshot intent
  const screenshotKeywords = [
    'screenshot', 'capture', 'snap', 'image of',
    'picture of', 'photo of', 'show me', 'visual',
    'how does it look', 'what does it look like',
  ];

  const lowerText = text.toLowerCase();

  // Check if any screenshot keyword is present
  const hasScreenshotIntent = screenshotKeywords.some(keyword =>
    lowerText.includes(keyword)
  );

  if (hasScreenshotIntent) {
    return urls[0].url;
  }

  // Also check structured patterns for backward compatibility
  const patterns = [
    /^screenshot\s+(?:of\s+)?(.+)$/i,
    /^capture\s+(.+)$/i,
    /^take\s+(?:a\s+)?screenshot\s+(?:of\s+)?(.+)$/i,
    /^snap\s+(.+)$/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const urlMatch = detectUrls(match[1], false);
      if (urlMatch.length > 0) {
        return urlMatch[0].url;
      }
    }
  }

  return null;
}

/**
 * Check if text is a research command
 * Returns the topic if matched, null otherwise
 */
export function detectResearchCommand(text: string): string | null {
  const patterns = [
    /^research\s+(?:about\s+)?(.+)$/i,
    /^deep\s+dive\s+(?:on|into)\s+(.+)$/i,
    /^investigate\s+(.+)$/i,
    /^find\s+(?:information|info)\s+(?:about|on)\s+(.+)$/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Parse user input for web-related commands
 * Returns the command type and relevant data
 */
export interface WebCommand {
  type: 'summarize' | 'screenshot' | 'research' | 'url-paste' | 'none';
  url?: string;
  topic?: string;
  urls?: DetectedUrl[];
}

export function parseWebCommand(text: string): WebCommand {
  // Check for summarize command
  const summarizeUrl = detectSummarizeCommand(text);
  if (summarizeUrl) {
    return { type: 'summarize', url: summarizeUrl };
  }

  // Check for screenshot command
  const screenshotUrl = detectScreenshotCommand(text);
  if (screenshotUrl) {
    return { type: 'screenshot', url: screenshotUrl };
  }

  // Check for research command
  const researchTopic = detectResearchCommand(text);
  if (researchTopic) {
    return { type: 'research', topic: researchTopic };
  }

  // Check if just pasted a URL (no other text)
  const trimmed = text.trim();
  const urls = detectUrls(trimmed, false);
  if (urls.length === 1 && urls[0].url === trimmed) {
    return { type: 'url-paste', url: urls[0].url, urls };
  }

  // Check if text contains URLs (not a command, but has URLs)
  if (urls.length > 0) {
    return { type: 'none', urls };
  }

  return { type: 'none' };
}

/**
 * Get a human-readable domain name from URL
 */
export function getDomainName(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove www. prefix
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Truncate URL for display
 */
export function truncateUrl(url: string, maxLength = 50): string {
  if (url.length <= maxLength) return url;

  try {
    const parsed = new URL(url);
    const domain = parsed.hostname;
    const remaining = maxLength - domain.length - 5; // 5 for "..." and some path

    if (remaining > 10) {
      const path = parsed.pathname + parsed.search;
      return `${domain}${path.slice(0, remaining)}...`;
    }

    return `${domain.slice(0, maxLength - 3)}...`;
  } catch {
    return url.slice(0, maxLength - 3) + '...';
  }
}
