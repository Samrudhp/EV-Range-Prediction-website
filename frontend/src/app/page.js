"use client";
import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import DashboardStats from "@/components/DashboardStats";
import MapComponent from "@/components/MapComponent";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/DashboardContext";

// Loading component
const LoadingSkeleton = () => (
  <div className="p-4">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

export default function Page() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { stats, loading: dashboardLoading, error } = useDashboard();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading dashboard: {error.message}
      </div>
    );
  }

  if (authLoading || dashboardLoading) {
    return <LoadingSkeleton />;
  }

  if (!user) return null;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Suspense fallback={<div className="h-64 bg-gray-100 rounded animate-pulse" />}>
          <DashboardStats stats={stats} />
        </Suspense>
        <Suspense fallback={<div className="h-64 bg-gray-100 rounded animate-pulse" />}>
          <MapComponent />
        </Suspense>
      </div>
    </div>
  );
}
