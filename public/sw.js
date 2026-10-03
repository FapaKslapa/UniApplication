const CACHE_PREFIX = "uniorario-";
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const STATIC_PATTERN =
  /^\/(_next\/static\/|icons\/|favicon\.ico$|manifest\.webmanifest$)/;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isCacheable(request, url) {
  if (request.method !== "GET") return false;
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith("/api/")) return false;
  if (request.headers.has("authorization")) return false;
  return STATIC_PATTERN.test(url.pathname);
}

const MAX_ENTRIES = 80;

async function trimCache(cache) {
  const keys = await cache.keys();
  const excess = keys.length - MAX_ENTRIES;
  for (let i = 0; i < excess; i++) await cache.delete(keys[i]);
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      const varies = response.headers.get("Vary") || "";
      const isPrivate = /private|no-store/i.test(
        response.headers.get("Cache-Control") || "",
      );
      if (
        response.ok &&
        response.type === "basic" &&
        !isPrivate &&
        !response.headers.has("Set-Cookie") &&
        !varies.includes("*")
      ) {
        cache.put(request, response.clone()).then(() => trimCache(cache));
      }
      return response;
    })
    .catch(() => cached || Response.error());
  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (!isCacheable(event.request, url)) return;
  event.respondWith(staleWhileRevalidate(event.request));
});

function safeUrl(raw) {
  try {
    const url = new URL(raw, self.location.origin);
    return url.origin === self.location.origin ? url.href : "/";
  } catch {
    return "/";
  }
}

self.addEventListener("push", (event) => {
  const data = event.data
    ? event.data.json()
    : { title: "Aggiornamento Orario", body: "Controlla le novità nell'app." };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: {
        url: data.changes
          ? `/?changes=${btoa(JSON.stringify(data.changes))}`
          : data.url || "/",
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = safeUrl(event.notification.data?.url);
  event.waitUntil(clients.openWindow(target));
});
