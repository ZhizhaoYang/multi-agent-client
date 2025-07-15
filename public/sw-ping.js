// Health ping service worker
// Pings the backend once when user visits to wake up cold starts

let API_BASE_URL = 'http://127.0.0.1:8000'; // Default fallback

console.log('Health ping service worker loaded');

// Listen for messages from the main app to get the correct API URL
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_API_URL') {
    API_BASE_URL = event.data.apiUrl;
    console.log(`API URL updated to: ${API_BASE_URL}`);
  }
});

// Setup single ping on activation
self.addEventListener('install', (event) => {
  console.log('Health ping worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Health ping worker activated');

  // Ping once when user visits the page
  event.waitUntil(
    pingBackend().then(() => self.clients.claim())
  );
});

async function pingBackend() {
  try {
    console.log(`Sending wake-up ping to: ${API_BASE_URL}/health/wake-up`);
    const response = await fetch(`${API_BASE_URL}/health/wake-up`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Backend wake-up ping successful:', data);
    } else {
      console.warn('Backend wake-up ping failed:', response.status);
    }
  } catch (error) {
    console.error('Backend wake-up ping error:', error);
  }
}
