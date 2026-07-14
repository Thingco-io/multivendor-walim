'use client';

import { useRouter } from 'next/navigation';
import { useContext, useEffect, useRef } from 'react';

import { SidebarContext } from '@/lib/context/global/sidebar.context';
import { ISidebarContextProps } from '@/lib/utils/interfaces';
import { DEFAULT_ROUTES } from '@/lib/utils/constants/routes';
import {
  getAccessToken,
  getStoredUser,
} from '@/lib/utils/methods/auth';
import CustomLoader from '@/lib/ui/useable-components/custom-progress-indicator';

export default function RootPage() {
  const router = useRouter();
  const redirected = useRef(false);

  const sidebar =
    useContext<ISidebarContextProps>(SidebarContext);

  useEffect(() => {
    if (redirected.current) return;

    redirected.current = true;

    sidebar?.setSelectedItem({
      screenName: 'Home',
    });

    const storedUser = getStoredUser();
    const accessToken = getAccessToken();

    const hasSession =
      !!accessToken ||
      !!storedUser?.token;

    if (
      hasSession &&
      storedUser?.userType &&
      DEFAULT_ROUTES[storedUser.userType]
    ) {
      router.replace(
        DEFAULT_ROUTES[storedUser.userType]
      );
      return;
    }

    router.replace('/authentication/login');
  }, [router, sidebar]);

  return <CustomLoader />;
}