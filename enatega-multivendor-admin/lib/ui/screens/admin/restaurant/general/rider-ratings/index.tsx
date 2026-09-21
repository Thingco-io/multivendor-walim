'use client';

// Core
import { useContext } from 'react';

// Components
import HeaderText from '@/lib/ui/useable-components/header-text';
import RiderRatingsList from '@/lib/ui/screen-components/protected/shared/rider-ratings';

// Context
import { RestaurantLayoutContext } from '@/lib/context/restaurant/layout-restaurant.context';

import { useTranslations } from 'next-intl';

/**
 * Rider feedback for deliveries made from this store, so a store manager can
 * judge the quality of their delivery operation.
 */
export default function StoreRiderRatingsScreen() {
  // Hooks
  const t = useTranslations();

  // Context
  const { restaurantLayoutContextData } = useContext(RestaurantLayoutContext);
  const { restaurantId } = restaurantLayoutContextData;

  return (
    <div className="screen-container">
      <div className="sticky top-0 z-10 w-full flex-shrink-0 bg-white p-3 shadow-sm dark:bg-dark-950">
        <div className="flex w-full justify-between">
          <HeaderText className="heading" text={t('Rider Ratings')} />
        </div>
      </div>

      {restaurantId ? <RiderRatingsList storeId={restaurantId} /> : null}
    </div>
  );
}
