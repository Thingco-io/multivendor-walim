'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { getAccessToken, getStoredUser } from '@/lib/utils/methods/auth';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const hasSession = !!getAccessToken() || !!getStoredUser()?.token;

    router.replace(hasSession ? '/home' : '/authentication/login');
  }, [router]);

 return <div>Loading...</div>;
}
