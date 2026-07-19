// Custom Service Worker for handling background push notifications
self.addEventListener("push", function (event) {
  console.log("[Service Worker] Push message received.");

  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload = {
        notification: {
          title: "New Notification",
          body: event.data.text(),
        },
      };
    }
  }

  // Extract title and body from payload (Firebase wraps it in notification key)
  const title = payload.notification?.title || payload.title || "MOCKEA Update";
  const options = {
    body: payload.notification?.body || payload.body || "You have a new update.",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: payload.data || payload,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  console.log("[Service Worker] Notification clicked.");
  event.notification.close();

  // Navigate user to the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: "window" }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/dashboard");
      }
    })
  );
});
