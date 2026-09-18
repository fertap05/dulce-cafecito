self.addEventListener(
  "install",
  () => {
    self.skipWaiting();
  }
);

self.addEventListener(
  "activate",
  (event) => {
    event.waitUntil(
      self.clients.claim()
    );
  }
);
self.addEventListener("push", (event) => {
  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = {
        title: "Dulce Cafecito",
        body: event.data.text(),
      };
    }
  }

  const title =
    data.title || "Dulce Cafecito";

  const options = {
    body:
      data.body ||
      "You have a new notification.",

    icon:
      data.icon || "/favicon.ico",

    badge:
      data.badge || "/favicon.ico",

    data: {
      url:
        data.url ||
        "/admin/orders",
    },

    tag:
      data.tag ||
      "dulce-cafecito",

    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  );
});

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const targetPath =
      event.notification.data?.url ||
      "/admin/orders";

    const targetUrl =
      new URL(
        targetPath,
        self.location.origin
      ).href;

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then(
          async (clientList) => {
            for (
              const client of
              clientList
            ) {
              if (
                "navigate" in client
              ) {
                await client.navigate(
                  targetUrl
                );
              }

              if (
                "focus" in client
              ) {
                return client.focus();
              }
            }

            return clients.openWindow(
              targetUrl
            );
          }
        )
    );
  }
);