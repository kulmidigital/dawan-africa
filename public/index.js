// Custom service worker script for Dawan Africa PWA
// This file will be imported by the generated service worker

// Custom cache name for our app
const CACHE_NAME = 'dawan-africa-v1'

// Add custom fetch handler for specific routes
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // For navigation requests (HTML pages), try the network first, then fall back to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html') || caches.match(event.request)
      }),
    )
    return
  }

  // For image requests, try the cache first, then fall back to network
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(event.request)
            .then((response) => {
              // Clone the response to cache it and return it
              const clonedResponse = response.clone()
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clonedResponse)
              })
              return response
            })
            .catch(() => {
              // If both cache and network fail, return a fallback image
              return caches.match('/logo.png') || fetch('/logo.png')
            })
        )
      }),
    )
    return
  }
})

// Add event listener for handling app installation
self.addEventListener('install', (event) => {
  console.log('Dawan Africa PWA: Service worker installing...')
  // Pre-cache important assets
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Dawan Africa PWA: Caching essential files')
      return cache.addAll(['/', '/offline.html', '/logo.png', '/favicon.png', '/manifest.json'])
    }),
  )
})

// Clean up old caches when a new service worker is activated
self.addEventListener('activate', (event) => {
  console.log('Dawan Africa PWA: Service worker activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('Dawan Africa PWA: Deleting old cache:', name)
            return caches.delete(name)
          }),
      )
    }),
  )
})

// Optional: Add push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/logo.png',
      badge: '/favicon.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || '1',
      },
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Dawan Africa PWA: Notification click received.')
  event.notification.close()
  event.waitUntil(clients.openWindow('/'))
})
