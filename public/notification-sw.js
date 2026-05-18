self.addEventListener('notificationclick', event => {
  event.notification.close()

  const fallbackUrl = new URL('/', self.location.origin).toString()
  const targetUrl = event.notification.data?.url || fallbackUrl

  event.waitUntil((async () => {
    const windowClients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    })

    for (const client of windowClients) {
      if ('focus' in client) {
        await client.focus()
        if ('navigate' in client) return client.navigate(targetUrl)
        return undefined
      }
    }

    if (self.clients.openWindow) return self.clients.openWindow(targetUrl)
    return undefined
  })())
})

self.addEventListener('push', event => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'WHATDIS?!', body: event.data.text() }
  }

  const title = payload.title || 'WHATDIS?!'
  const targetUrl = new URL(payload.url || payload.link || '/', self.location.origin).toString()
  const options = {
    body: payload.body || payload.message || undefined,
    icon: payload.icon || '/pwa-192x192.png',
    badge: payload.badge || '/pwa-192x192.png',
    tag: payload.tag || payload.key || undefined,
    data: { url: targetUrl },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})
