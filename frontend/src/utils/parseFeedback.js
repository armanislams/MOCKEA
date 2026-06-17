/**
 * Parse a feedback string that may be JSON (with criteria/comments) or plain text.
 * @param {string} feedbackStr
 * @returns {{ criteria: object | null, comments: string }}
 */
export const parseFeedback = (feedbackStr) => {
  if (!feedbackStr) return { criteria: null, comments: "" };
  const trimmed = feedbackStr.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && (parsed.criteria || parsed.comments !== undefined)) {
        return {
          criteria: parsed.criteria || null,
          comments: parsed.comments || "",
        };
      }
    } catch {
      // Not JSON — fall through
    }
  }
  return { criteria: null, comments: feedbackStr };
};
