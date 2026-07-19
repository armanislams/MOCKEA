import admin from "../lib/firebase.config.js";
import User from "../model/user.js";

/**
 * Sends a push notification to specific users and cleans up stale/invalid FCM tokens.
 * @param {Array<string>|string} userIds - MongoDB User IDs to send notifications to.
 * @param {string} title - Notification title.
 * @param {string} body - Notification body.
 * @param {object} data - Optional key-value payload.
 */
export const sendPushNotification = async (userIds, title, body, data = {}) => {
  try {
    const ids = Array.isArray(userIds) ? userIds : [userIds];
    if (ids.length === 0) return;

    // Fetch users and extract unique tokens
    const users = await User.find({ _id: { $in: ids } }, "fcmTokens");
    const tokenUserMap = new Map(); // Map fcmToken -> User
    const allTokens = [];

    users.forEach((user) => {
      if (user.fcmTokens && user.fcmTokens.length > 0) {
        user.fcmTokens.forEach((token) => {
          if (token) {
            allTokens.push(token);
            tokenUserMap.set(token, user);
          }
        });
      }
    });

    if (allTokens.length === 0) {
      console.log(`[Push Notification] No registered FCM tokens for user IDs: ${ids.join(", ")}`);
      return;
    }

    const payload = {
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      tokens: [...new Set(allTokens)],
    };

    console.log(`[Push Notification] Sending to ${payload.tokens.length} devices...`);
    const response = await admin.messaging().sendEachForMulticast(payload);

    const tokensToRemove = [];

    response.responses.forEach((res, index) => {
      if (!res.success) {
        const token = payload.tokens[index];
        const error = res.error;
        console.error(`[Push Notification] Failure for token ${token}:`, error?.code);

        // Check if token is invalid/expired
        if (
          error &&
          (error.code === "messaging/registration-token-not-registered" ||
            error.code === "messaging/invalid-registration-token")
        ) {
          tokensToRemove.push(token);
        }
      }
    });

    // Cleanup invalid tokens from database
    if (tokensToRemove.length > 0) {
      console.log(`[Push Notification] Pruning ${tokensToRemove.length} stale FCM tokens...`);
      for (const token of tokensToRemove) {
        const user = tokenUserMap.get(token);
        if (user) {
          await User.updateOne(
            { _id: user._id },
            { $pull: { fcmTokens: token } }
          );
        }
      }
    }
  } catch (error) {
    console.error("[Push Notification] Global error sending notifications:", error);
  }
};
