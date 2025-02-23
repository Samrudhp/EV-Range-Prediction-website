import { Inter } from 'next/font/google';
import { AuthProvider } from "@/context/AuthContext";
import { DashboardProvider } from "@/context/DashboardContext";
import Sidebar from "@/components/Sidebar";
import ErrorBoundary from "@/components/ErrorBoundary";
import { registerServiceWorker } from "@/utils/serviceWorkerRegistration";
import './globals.css';
import  ServiceWorkerRegistration  from '@/components/ServiceWorkerRegistration';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true
});


// Import metadata and viewport from metadata.js
import { metadata, viewport } from './metadata';

// Export them for Next.js to use
export { metadata, viewport };

// Register service worker
if (process.env.NODE_ENV === 'production') {
  registerServiceWorker();
}

export const metadata = {
  title: 'EV Range Prediction',
  description: 'Predict your EV range accurately',
  icons: {
    icon: [
      {
        url: '/icon.png',
        sizes: '32x32',
        type: 'image/png'
      }
    ],
    shortcut: ['/icon.png'],
    apple: [
      {
        url: '/icon.png',
        sizes: '180x180',
        type: 'image/png'
      }
    ]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <ServiceWorkerRegistration /> 
        <ErrorBoundary>
          <AuthProvider>
            <DashboardProvider>
              <div className="flex h-screen">
                <Sidebar />
                <main className="flex-1 p-4 overflow-auto">{children}</main>
              </div>
            </DashboardProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
