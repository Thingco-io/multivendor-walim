'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { DEFAULT_ROUTES } from '@/lib/utils/constants/routes';
import { getAccessToken, getStoredUser } from '@/lib/utils/methods/auth';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    const user = getStoredUser();

    if (!token || !user) {
      router.replace('/authentication/login');
      return;
    }

    router.replace(DEFAULT_ROUTES[user.userType] ?? '/authentication/login');
  }, [router]);

  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        height: '100vh',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      
    </div>
  );
}
