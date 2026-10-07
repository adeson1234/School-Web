self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const title = data.title || 'New Message!';
  const options = {
    body: data.body || 'You have a new message from BAHRADAR.',
    icon: data.icon || '/images/logo.png',
    vibrate: [200, 100, 200],
    data: { url: '/adminPages/adminDashboard.html' }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});