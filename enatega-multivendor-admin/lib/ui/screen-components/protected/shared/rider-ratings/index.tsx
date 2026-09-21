'use client';

// Core
import { useEffect, useState } from 'react';

// Prime React
import { DataView } from 'primereact/dataview';

// Components
import ProfileCard from '@/lib/ui/useable-components/Icon-Card';
import RatingsHeaderDataView from '@/lib/ui/screen-components/protected/restaurant/ratings/header/table-header';

// Hooks
import { useQueryGQL } from '@/lib/hooks/useQueryQL';
import useDebounce from '@/lib/hooks/useDebounce';
import { useTranslations } from 'next-intl';

// Interfaces
import { IQueryResult } from '@/lib/utils/interfaces';
import {
  IRiderReview,
  IRiderReviewsPaginatedResponse,
  IRiderStore,
} from '@/lib/utils/interfaces/rider.interface';

// GraphQL
import { GET_RIDER_REVIEWS_PAGINATED } from '@/lib/api/graphql';

interface IRiderRatingsListProps {
  /** Restricts the list to one rider — used on a rider's detail page. */
  riderId?: string;
  /**
   * Restricts the list to one vendor. Ignored for a signed-in vendor (the
   * server scopes to their own riders); it keeps the Vendor Dashboard scoped
   * when a super admin drills into a vendor.
   */
  vendorId?: string;
  /** Restricts the list to one store — supplied by the Store Dashboard. */
  storeId?: string;
  /** Kept for screens that already pass store data into this shared view. */
  stores?: IRiderStore[];
  /** Kept for screens that previously toggled a table-only vendor column. */
  showVendorColumn?: boolean;
}

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const timestamp = Number(value);
  const date = new Date(Number.isNaN(timestamp) ? value : timestamp);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Rider ratings and customer reviews.
 *
 * The server scopes the rows to the caller, so the same list backs the Vendor
 * Dashboard (own riders), the Store Dashboard (deliveries for that store) and
 * the Super Admin (every vendor).
 */
export default function RiderRatingsList({
  riderId,
  vendorId,
  storeId,
}: IRiderRatingsListProps) {
  // Hooks
  const t = useTranslations();

  // States
  const [searchValue, setSearchValue] = useState('');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const debouncedSearch = useDebounce(searchValue, 500);

  const ratingRange =
    selectedActions.length === 1 ? selectedActions[0] : undefined;
  const minRating =
    ratingRange === '1-2 stars'
      ? 1
      : ratingRange === '3-4 stars'
        ? 3
        : ratingRange === '5 stars'
          ? 5
          : undefined;
  const maxRating =
    ratingRange === '1-2 stars'
      ? 2
      : ratingRange === '3-4 stars'
        ? 4
        : ratingRange === '5 stars'
          ? 5
          : undefined;

  const { data, loading } = useQueryGQL(
    GET_RIDER_REVIEWS_PAGINATED,
    {
      page: currentPage,
      limit: rowsPerPage,
      search: debouncedSearch || undefined,
      riderId: riderId ?? undefined,
      vendorId: vendorId ?? undefined,
      storeId: storeId ?? undefined,
      minRating,
      maxRating,
    },
    { fetchPolicy: 'network-only' }
  ) as IQueryResult<IRiderReviewsPaginatedResponse | undefined, undefined>;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, ratingRange]);

  const itemTemplate = (review: IRiderReview) => (
    <div className="col-12 mb-2">
      <ProfileCard
        name={review.rider?.name ?? t('Rider')}
        orderedItems={review.restaurant?.name ?? ''}
        rating={review.rating}
        imageSrc={review.restaurant?.image ?? ''}
        comments={review.comments ?? undefined}
        reviewContent={review.description ?? ''}
        orderId={review.order?.orderId ?? ''}
        createdAt={formatDate(review.createdAt)}
      />
    </div>
  );

  const reviews = data?.riderReviewsPaginated?.data ?? [];

  return (
    <div className="p-3">
      <DataView
        value={reviews}
        itemTemplate={itemTemplate}
        paginator
        rows={rowsPerPage}
        layout="grid"
        totalRecords={data?.riderReviewsPaginated?.totalCount ?? 0}
        first={(currentPage - 1) * rowsPerPage}
        lazy
        loading={loading}
        emptyMessage={t('No records found')}
        onPage={(event) => {
          setCurrentPage(Math.floor(event.first / event.rows) + 1);
          setRowsPerPage(event.rows);
        }}
        header={
          <RatingsHeaderDataView
            setSelectedActions={setSelectedActions}
            selectedActions={selectedActions}
            onSearch={setSearchValue}
          />
        }
      />
    </div>
  );
}
