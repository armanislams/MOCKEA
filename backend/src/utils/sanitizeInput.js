/**
 * Sanitizes input strings against XSS, script injection, and programming code structures.
 * 
 * @param {string} input - The input string to sanitize
 * @returns {object} { isSafe: boolean, cleanInput: string, reason?: string }
 */
export const sanitizeChatInput = (input) => {
  if (typeof input !== "string") {
    return { isSafe: true, cleanInput: "" };
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return { isSafe: true, cleanInput: "" };
  }

  // 1. Basic HTML / Script tag checks
  const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  const htmlTagRegex = /<[^>]*>/g;
  const javascriptUriRegex = /javascript:/gi;
  const eventHandlerRegex = /on\w+\s*=/gi; // matches onerror=, onload=, onclick=, etc.

  if (scriptRegex.test(trimmed) || javascriptUriRegex.test(trimmed) || eventHandlerRegex.test(trimmed)) {
    return { 
      isSafe: false, 
      cleanInput: "", 
      reason: "Script injection pattern or HTML/JS tag detected." 
    };
  }

  // 2. Reject common programming structures to prevent raw code pushes
  const codeKeywords = [
    /\bfunction\s+\w+/i,
    /\bconst\s+\w+\s*=/i,
    /\blet\s+\w+\s*=/i,
    /\bimport\s+[\w\s{},*]+\s+from/i,
    /\brequire\s*\(/i,
    /\bdef\s+\w+\s*\(/i,
    /\bclass\s+\w+/i
  ];

  for (const regex of codeKeywords) {
    if (regex.test(trimmed)) {
      return { 
        isSafe: false, 
        cleanInput: "", 
        reason: "Programming language code block or system file pattern detected." 
      };
    }
  }

  // 3. Escape HTML special characters for ultimate front-end rendering safety
  const escaped = trimmed
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");

  return { isSafe: true, cleanInput: escaped };
};
