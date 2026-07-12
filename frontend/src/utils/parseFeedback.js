/**
 * Parse a feedback string that may be JSON (with criteria/comments) or plain text.
 * @param {string} feedbackStr
 * @returns {{ criteria: object | null, comments: string }}
 */
export const parseFeedback = (feedbackStr) => {
  if (!feedbackStr) return { criteria: null, comments: "", isTwoTasks: false, task1: null, task2: null };
  const trimmed = feedbackStr.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && (parsed.task1 || parsed.task2)) {
        return {
          isTwoTasks: true,
          task1: parsed.task1 || null,
          task2: parsed.task2 || null,
          comments: parsed.comments || "",
          criteria: null
        };
      }
      if (parsed && (parsed.criteria || parsed.comments !== undefined)) {
        return {
          isTwoTasks: false,
          criteria: parsed.criteria || null,
          comments: parsed.comments || "",
          task1: null,
          task2: null
        };
      }
    } catch {
      // Not JSON — fall through
    }
  }
  return { criteria: null, comments: feedbackStr, isTwoTasks: false, task1: null, task2: null };
};

