'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoadingProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingProfile && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoadingProfile, router]);

  if (isLoadingProfile) {
    return (
      <div className="flex h-screen">
        <div className="w-64 border-r p-4">
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full mb-2" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-12 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
