const CACHE = 'theos-art-static-v4'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

function isDocumentRequest(request) {
  return (
    request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html')
  )
}

/** Never cache-first hero media — uploads overwrite the same filenames. */
function isHeroMediaRequest(url) {
  return (
    url.pathname.startsWith('/hero/') ||
    url.pathname.startsWith('/videos/') ||
    url.pathname.includes('/hero/')
  )
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return

  if (isDocumentRequest(event.request) || isHeroMediaRequest(url)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (isHeroMediaRequest(url) && response.ok) {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {})
          }
          return response
        })
        .catch(() => caches.match(event.request))
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request).then((response) => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, copy))
        }
        return response
      })
      return cached || network
    })
  )
})
