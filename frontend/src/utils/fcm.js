import { getMessaging, getToken } from "firebase/messaging";
import { app } from "../../firebase.config";

/**
 * Requests push notification permission and registers the FCM device token with the backend.
 * @param {object} axiosSecure - Secure axios client instance.
 */
export const registerPushNotifications = async (axiosSecure) => {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.log("This browser does not support desktop notifications.");
      return;
    }

    // 1. Request Browser Permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Push notification permission denied.");
      return;
    }

    console.log("Push notification permission granted.");

    // 2. Fetch FCM Token
    const messaging = getMessaging(app);
    const vapidKey = import.meta.env.VITE_VAPID_KEY || ""; // Optional VAPID Key

    const token = await getToken(messaging, vapidKey ? { vapidKey } : undefined);

    if (token) {
      console.log("FCM registration token acquired:", token);
      // 3. Register token with database via backend route
      await axiosSecure.patch("/user/fcm-token", { token });
      console.log("FCM registration token successfully synced with backend.");
      
      // Store token locally to prevent repeated syncs
      localStorage.setItem("fcmToken", token);
    } else {
      console.log("No registration token available. Request permission to generate one.");
    }
  } catch (error) {
    console.error("An error occurred while setting up FCM Push Notifications:", error);
  }
};

/**
 * Unregisters the FCM token from the backend when logging out.
 * @param {object} axiosSecure - Secure axios client instance.
 */
export const unregisterPushNotifications = async (axiosSecure) => {
  try {
    const token = localStorage.getItem("fcmToken");
    if (token) {
      await axiosSecure.delete("/user/fcm-token", { data: { token } });
      localStorage.removeItem("fcmToken");
      console.log("FCM registration token unregistered successfully.");
    }
  } catch (error) {
    console.error("Failed to unregister FCM token during logout:", error);
  }
};
