self.addEventListener('push', function(event) {
  let data = {
    title: 'Jharkhand Express',
    body: 'New article published!',
    icon: '/favicon-192.png',
    badge: '/favicon-192.png',
    url: '/'
  };

  if (event.data) {
    try {
      const json = event.data.json();
      data = {
        title: json.title || data.title,
        body: json.body || data.body,
        icon: json.icon || data.icon,
        badge: json.badge || data.badge,
        url: json.url || data.url
      };
    } catch (e) {
      // Non-JSON notification payload fallback
      try {
        const text = event.data.text();
        if (text) {
          data.body = text;
        }
      } catch (textErr) {
        console.error('Error reading push text payload:', textErr);
      }
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [100, 50, 100],
    data: {
      url: data.url
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : '/';
  const urlToOpen = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // 1. If an existing tab already has this exact article open, focus it
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // 2. Otherwise navigate an existing open Jharkhand Express window to the article and focus it
      for (const client of clientList) {
        if ('focus' in client && 'navigate' in client) {
          return client.navigate(urlToOpen).then(function(c) {
            return c ? c.focus() : null;
          });
        }
      }
      // 3. Otherwise open a new browser window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
