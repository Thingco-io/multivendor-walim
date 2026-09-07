'use client';

// Core
import { useContext, useMemo } from 'react';

// Components
import HeaderText from '@/lib/ui/useable-components/header-text';
import RiderRatingsList from '@/lib/ui/screen-components/protected/shared/rider-ratings';

// Hooks
import { useQueryGQL } from '@/lib/hooks/useQueryQL';
import { useTranslations } from 'next-intl';

// Context
import { VendorLayoutContext } from '@/lib/context/vendor/layout-vendor.context';

// Interfaces
import {
  IQueryResult,
  IRestaurantsByOwnerResponseGraphQL,
} from '@/lib/utils/interfaces';
import { IRiderStore } from '@/lib/utils/interfaces/rider.interface';

// GraphQL
import { GET_RESTAURANTS_BY_OWNER } from '@/lib/api/graphql';

/**
 * Customer feedback for the vendor's own riders, filterable by store and star
 * rating. A vendor only ever sees ratings for riders belonging to them.
 */
export default function VendorRiderRatingsScreen() {
  // Hooks
  const t = useTranslations();

  // Context
  const {
    vendorLayoutContextData: { vendorId },
  } = useContext(VendorLayoutContext);

  const { data } = useQueryGQL(
    GET_RESTAURANTS_BY_OWNER,
    { id: vendorId },
    { enabled: !!vendorId, fetchPolicy: 'cache-and-network' }
  ) as IQueryResult<IRestaurantsByOwnerResponseGraphQL | undefined, undefined>;

  const stores: IRiderStore[] = useMemo(
    () =>
      (data?.restaurantByOwner?.restaurants ?? []).map((store) => ({
        _id: store._id,
        name: store.name,
      })),
    [data]
  );

  return (
    <div className="screen-container">
      <div className="sticky top-0 z-10 w-full flex-shrink-0 bg-white p-3 shadow-sm dark:bg-dark-950">
        <div className="flex w-full justify-between">
          <HeaderText className="heading" text={t('Rider Ratings')} />
        </div>
      </div>

      <RiderRatingsList stores={stores} vendorId={vendorId || undefined} />
    </div>
  );
}
