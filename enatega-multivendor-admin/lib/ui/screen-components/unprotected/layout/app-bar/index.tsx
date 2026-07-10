/* eslint-disable @next/next/no-img-element */

'use client';

// Assets
import { useRouter } from 'next/navigation';
import WalimLogo from '@/lib/utils/assets/svgs/walim-logo';

// Styles
import classes from './app-bar.module.css';

const AppTopbar = () => {
  const router = useRouter();

  return (
    <div className={`${classes['layout-topbar']} dark:bg-dark-900`}>
      <div>
        <div
          onClick={() => router.push('/')}
          className="flex items-center gap-2 cursor-pointer "
        >
          <WalimLogo className="h-8 w-8" />
          <span className="text-lg font-bold tracking-[0.22em] text-gray-900 dark:text-white">
            WALIM
          </span>
        </div>
      </div>
    </div>
  );
};

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
