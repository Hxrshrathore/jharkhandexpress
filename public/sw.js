self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body || 'New article published!',
        icon: data.icon || '/Truth24x7logo.png',
        badge: '/Truth24x7logo.png',
        vibrate: [100, 50, 100],
        data: {
          url: data.url || '/'
        }
      };
      
      event.waitUntil(
        self.registration.showNotification(data.title || 'Truth24x7', options)
      );
    } catch (err) {
      console.error('Error parsing push data', err);
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
