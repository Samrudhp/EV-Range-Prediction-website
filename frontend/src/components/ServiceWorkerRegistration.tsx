'use client';
import { useEffect, useState } from 'react';
import { registerServiceWorker, unregisterServiceWorker } from '@/utils/serviceWorkerRegistration';

interface ServiceWorkerMessage {
  type: string;
  payload?: any;
}

// Change to default export
export default function ServiceWorkerRegistration() {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const initServiceWorker = async () => {
      try {
        await registerServiceWorker();
        
        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', 
          (event: MessageEvent<ServiceWorkerMessage>) => {
            if (!mounted) return;

            switch (event.data?.type) {
              case 'CACHE_UPDATED':
                console.log('Cache has been updated');
                break;
              case 'ERROR':
                console.error('Service worker error:', event.data?.payload);
                setError(new Error(event.data?.payload));
                break;
              default:
                break;
            }
          }
        );

      } catch (err) {
        if (mounted) {
          console.error('Service Worker registration failed:', err);
          setError(err instanceof Error ? err : new Error('Failed to register Service Worker'));
        }
      }
    };

    // Initialize service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      initServiceWorker();
    }

    return () => {
      mounted = false;
      unregisterServiceWorker().catch(err => {
        console.error('Service Worker unregistration failed:', err);
      });
    };
  }, []);

  // In development, show errors to help with debugging
  if (error && process.env.NODE_ENV === 'development') {
    console.warn('ServiceWorker Error:', error.message);
  }

  return null;
}