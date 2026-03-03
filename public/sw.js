self.addEventListener("push", (event) => {
  const data = event.data
    ? event.data.json()
    : { title: "Aggiornamento Orario", body: "Controlla le novità nell'app." };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      data: {
        url: data.changes
          ? `/?changes=${btoa(JSON.stringify(data.changes))}`
          : "/",
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
