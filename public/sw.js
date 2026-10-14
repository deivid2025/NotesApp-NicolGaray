// Service Worker para Web Push Notifications
// Nicol Garay App — Deivid Uchiha

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Manejar clicks en notificaciones
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una ventana abierta, enfocarla
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      // Si no, abrir nueva
      if (self.clients.openWindow) {
        return self.clients.openWindow("/");
      }
    })
  );
});

// Manejar push events (notificaciones push del servidor)
self.addEventListener("push", (event) => {
  let data = { title: "NotesApp Deivid Uchiha", body: "Tienes tareas pendientes" };
  try {
    if (event.data) data = event.data.json();
  } catch {
    if (event.data) data = { title: "NotesApp", body: event.data.text() };
  }

  const options = {
    body: data.body,
    icon: data.icon || "/app-icon.png",
    badge: data.badge || "/app-icon.png",
    tag: data.tag || "task-reminder",
    data: { dateOfArrival: Date.now() },
    vibrate: [100, 50, 100],
    actions: [
      { action: "open", title: "Abrir" },
      { action: "close", title: "Cerrar" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
