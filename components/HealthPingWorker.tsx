'use client';

import { useEffect } from 'react';

// Simple component that registers the health ping service worker
export default function HealthPingWorker() {
    useEffect(() => {
    // Get API URL from environment variable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log('NEXT_PUBLIC_API_URL:', apiUrl);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw-ping.js')
        .then((registration) => {
          console.log('Health ping worker registered');

          // Send API URL to service worker
          if (registration.active) {
            registration.active.postMessage({
              type: 'SET_API_URL',
              apiUrl: apiUrl
            });
          }

          // Also listen for when service worker becomes active
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated') {
                  newWorker.postMessage({
                    type: 'SET_API_URL',
                    apiUrl: apiUrl
                  });
                }
              });
            }
          });
        })
        .catch(() => console.log('Health ping worker failed'));
    }
  }, []);

  return null; // Renders nothing
}