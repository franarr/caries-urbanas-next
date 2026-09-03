'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getToken } from '@/lib/api-admin';
import { AdminHeader } from '@/components/admin/AdminHeader';
import './admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isLoginPage) {
      setAuthorized(true);
      return;
    }

    const token = getToken();
    if (!token) {
      router.replace('/admin/login');
    } else {
      setAuthorized(true);
    }
  }, [pathname, isLoginPage, router]);

  if (!authorized && !isLoginPage) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Verificando sesión...
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="admin-layout">
        {!isLoginPage && <AdminHeader />}
        {children}
      </div>
    </QueryClientProvider>
  );
}
