'use client';

// Components
import HeaderText from '@/lib/ui/useable-components/header-text';
import RiderRatingsList from '@/lib/ui/screen-components/protected/shared/rider-ratings';

import { useTranslations } from 'next-intl';

/**
 * Platform-wide rider feedback. The Super Admin sees ratings and reviews for
 * every vendor's riders alongside the store and order they relate to.
 */
export default function SuperAdminRiderRatingsScreen() {
  // Hooks
  const t = useTranslations();

  return (
    <div className="screen-container">
      <div className="sticky top-0 z-10 w-full flex-shrink-0 bg-white p-3 shadow-sm dark:bg-dark-950">
        <div className="flex w-full justify-between">
          <HeaderText className="heading" text={t('Rider Ratings')} />
        </div>
      </div>

      <RiderRatingsList showVendorColumn />
    </div>
  );
}
