/**
 * Backend Health Ping Service Worker
 * Pings backend until it responds successfully, then stops
 */

// Environment Configuration
const ENVIRONMENTS = {
  'localhost:3000': {
    name: 'LOCAL',
    backendUrl: 'http://localhost:8000/health/ping',
    retryInterval: 30000
  },
  'multi-agent-client.onrender.com': {
    name: 'DEV',
    backendUrl: 'https://multi-agent-server-dev.onrender.com/health/ping',
    retryInterval: 30000
  },
  'multi-agent-chatbot-demo.vercel.app': {
    name: 'PROD',
    backendUrl: 'https://multi-agent-server.onrender.com/health/ping',
    retryInterval: 30000
  }
};

// Global state
let environment = null;
let retryTimer = null;

/**
 * Detect current environment based on hostname
 */
function detectEnvironment() {
  const { hostname, port } = self.location;
  const hostKey = port ? `${hostname}:${port}` : hostname;

  const config = ENVIRONMENTS[hostKey] || ENVIRONMENTS[hostname];

  if (!config) {
    console.warn(`Unknown environment: ${hostKey}, defaulting to LOCAL`);
    return {
      name: 'UNKNOWN',
      backendUrl: 'http://localhost:8000/health/ping',
      retryInterval: 30000
    };
  }

  return config;
}

/**
 * Ping backend and check for success response
 */
async function pingBackend() {
  try {
    const response = await fetch(environment.backendUrl, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' }
    });

    if (!response.ok) {
      console.log(`[${environment.name}] HTTP ${response.status} - retrying...`);
      return false;
    }

    const data = await response.json();

    if (data.success) {
      console.log(`[${environment.name}] Backend ready! Stopping pings.`);
      stopRetryTimer();
      return true;
    }

    console.log(`[${environment.name}] Backend not ready (success: false) - retrying...`);
    return false;

  } catch (error) {
    console.log(`[${environment.name}] Network error: ${error.message} - retrying...`);
    return false;
  }
}

/**
 * Start periodic ping attempts
 */
function startPinging() {
  pingBackend();

  if (!retryTimer) {
    retryTimer = setInterval(pingBackend, environment.retryInterval);
  }
}

/**
 * Stop the retry timer
 */
function stopRetryTimer() {
  if (retryTimer) {
    clearInterval(retryTimer);
    retryTimer = null;
    console.log(`[${environment.name}] Ping timer stopped`);
  }
}

// Service Worker Events
self.addEventListener('activate', () => {
  environment = detectEnvironment();
  console.log(`[${environment.name}] Health ping service worker activated`);

  startPinging();
  self.clients.claim();
});

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('fetch', () => {
  // Pass through all requests
});