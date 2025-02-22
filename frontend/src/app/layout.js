"use client";
import { Inter } from 'next/font/google';
import { AuthProvider } from "@/context/AuthContext";
import { DashboardProvider } from "@/context/DashboardContext";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer"; // Changed to default import
import './globals.css';
import 'leaflet/dist/leaflet.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'EV Range Prediction',
  description: 'EV Range Prediction and Route Optimization',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <DashboardProvider>
            <div className="flex h-screen">
              <Sidebar />
              <main className="flex-1 p-4 overflow-auto">{children}</main>
              <Footer />
            </div>
          </DashboardProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
