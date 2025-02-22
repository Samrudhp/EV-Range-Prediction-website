// src/components/ServiceWorkerRegistration.js
"use client";
import { useEffect } from 'react';

interface ServiceWorkerMessage {
  type: string;
  payload?: any;
}

const SW_URL = '/service-worker.js';

export function registerServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register(SW_URL);
        console.log('SW registered:', registration.scope);

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content is available
                  console.log('New content is available; please refresh.');
                } else {
                  // Content is cached for offline use
                  console.log('Content is cached for offline use.');
                }
              }
            });
          }
        });

        resolve();
      } catch (error) {
        console.error('SW registration failed:', error);
        reject(error);
      }
    });

    // Handle communication
    navigator.serviceWorker.addEventListener('message', (event: MessageEvent<ServiceWorkerMessage>) => {
      switch (event.data?.type) {
        case 'CACHE_UPDATED':
          console.log('Cache has been updated');
          break;
        case 'ERROR':
          console.error('Service worker error:', event.data?.payload);
          break;
        default:
          break;
      }
    });
  });
}

export async function unregisterServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.unregister();
    console.log('SW unregistered successfully');
  } catch (error) {
    console.error('SW unregistration failed:', error);
    throw error;
  }
}

export function ServiceWorkerRegistration(): null {
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        await registerServiceWorker();
      } catch (error) {
        if (mounted) {
          console.error('Failed to register service worker:', error);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      unregisterServiceWorker().catch(error => {
        console.error('Failed to unregister service worker:', error);
      });
    };
  }, []);

  return null;
}