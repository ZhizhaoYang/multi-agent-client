'use client';

import { useEffect } from 'react';

// Simple component that registers the health ping service worker
export default function HealthPingWorker() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw-ping.js')
        .then(() => console.log('Health ping worker registered'))
        .catch(() => console.log('Health ping worker failed'));
    }
  }, []);

  return null; // Renders nothing
}