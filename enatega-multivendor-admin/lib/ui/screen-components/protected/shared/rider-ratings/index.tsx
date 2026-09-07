'use client';

// Core
import { useEffect, useMemo, useState } from 'react';

// Prime React
import { Rating } from 'primereact/rating';

// Components
import Table from '@/lib/ui/useable-components/table';
import CustomTextField from '@/lib/ui/useable-components/input-field';
import CustomDropdownComponent from '@/lib/ui/useable-components/custom-dropdown';

// Hooks
import { useQueryGQL } from '@/lib/hooks/useQueryQL';
import useDebounce from '@/lib/hooks/useDebounce';
import { useTranslations } from 'next-intl';

// Interfaces
import { IDropdownSelectItem, IQueryResult } from '@/lib/utils/interfaces';
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
  /** Store filter dropdown; omit to hide it (Store Dashboard). */
  stores?: IRiderStore[];
  /** Show the vendor column — Super Admin only. */
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

const RATING_FILTERS: IDropdownSelectItem[] = [
  { label: '5 ★', code: '5' },
  { label: '4 ★', code: '4' },
  { label: '3 ★', code: '3' },
  { label: '2 ★', code: '2' },
  { label: '1 ★', code: '1' },
];

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
  stores,
  showVendorColumn = false,
}: IRiderRatingsListProps) {
  // Hooks
  const t = useTranslations();

  // States
  const [selectedRows, setSelectedRows] = useState<IRiderReview[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedStore, setSelectedStore] =
    useState<IDropdownSelectItem | null>(null);
  const [ratingFilter, setRatingFilter] = useState<IDropdownSelectItem | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const debouncedSearch = useDebounce(searchValue, 500);

  const { data, loading } = useQueryGQL(
    GET_RIDER_REVIEWS_PAGINATED,
    {
      page: currentPage,
      limit: rowsPerPage,
      search: debouncedSearch || undefined,
      riderId: riderId ?? undefined,
      vendorId: vendorId ?? undefined,
      storeId: storeId ?? selectedStore?.code ?? undefined,
      minRating: ratingFilter ? Number(ratingFilter.code) : undefined,
      maxRating: ratingFilter ? Number(ratingFilter.code) : undefined,
    },
    { fetchPolicy: 'network-only' }
  ) as IQueryResult<IRiderReviewsPaginatedResponse | undefined, undefined>;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedStore?.code, ratingFilter?.code]);

  const columns = useMemo(() => {
    const base = [
      {
        headerName: t('Rider'),
        propertyName: 'rider',
        body: (review: IRiderReview) => (
          <div className="flex flex-col">
            <span className="dark:text-white">{review.rider?.name ?? '-'}</span>
            {review.rider?.ratingCount ? (
              <span className="text-xs text-gray-400">
                ★ {Number(review.rider.ratingAverage ?? 0).toFixed(2)} (
                {review.rider.ratingCount})
              </span>
            ) : null}
          </div>
        ),
      },
      {
        headerName: t('Store'),
        propertyName: 'restaurant',
        body: (review: IRiderReview) => review.restaurant?.name ?? '-',
      },
      {
        headerName: t('Order ID'),
        propertyName: 'order',
        body: (review: IRiderReview) => review.order?.orderId ?? '-',
      },
      {
        headerName: t('Rating'),
        propertyName: 'rating',
        body: (review: IRiderReview) => (
          <Rating
            value={review.rating}
            readOnly
            cancel={false}
            className="flex"
            pt={{
              onIcon: { className: 'text-amber-500' },
              offIcon: { className: 'text-amber-500' },
            }}
          />
        ),
      },
      {
        headerName: t('Review'),
        propertyName: 'description',
        body: (review: IRiderReview) => (
          <div className="flex max-w-[280px] flex-col gap-1">
            <span className="break-words text-sm dark:text-gray-300">
              {review.description || '-'}
            </span>
            {review.comments ? (
              <span className="w-fit rounded-full border border-gray-300 px-2 py-[2px] text-xs dark:border-dark-600 dark:text-gray-300">
                {review.comments}
              </span>
            ) : null}
          </div>
        ),
      },
      {
        headerName: t('Date'),
        propertyName: 'createdAt',
        body: (review: IRiderReview) => (
          <span className="whitespace-nowrap">
            {formatDate(review.createdAt)}
          </span>
        ),
      },
    ];

    // Drop columns the caller already knows: the store on a Store Dashboard,
    // the rider on a rider's own detail page.
    return base.filter((column) => {
      if (storeId && column.propertyName === 'restaurant') return false;
      if (riderId && column.propertyName === 'rider') return false;
      return true;
    });
  }, [riderId, storeId, t, showVendorColumn]);

  return (
    <div className="p-3">
      <Table
        header={
          <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div className="w-60">
              <CustomTextField
                type="text"
                name="riderReviewFilter"
                maxLength={60}
                showLabel={false}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={t('Keyword Search')}
              />
            </div>

            {!storeId && stores?.length ? (
              <div className="w-56">
                <CustomDropdownComponent
                  name="storeFilter"
                  placeholder={t('All Stores')}
                  showLabel={false}
                  showClear
                  options={stores.map((store) => ({
                    label: store.name,
                    code: store._id,
                  }))}
                  selectedItem={selectedStore}
                  setSelectedItem={(
                    _name: string,
                    value: IDropdownSelectItem
                  ) => setSelectedStore(value)}
                />
              </div>
            ) : null}

            <div className="w-40">
              <CustomDropdownComponent
                name="ratingFilter"
                placeholder={t('Rating')}
                showLabel={false}
                showClear
                filter={false}
                options={RATING_FILTERS}
                selectedItem={ratingFilter}
                setSelectedItem={(_name: string, value: IDropdownSelectItem) =>
                  setRatingFilter(value)
                }
              />
            </div>
          </div>
        }
        data={data?.riderReviewsPaginated?.data ?? []}
        setSelectedData={setSelectedRows}
        selectedData={selectedRows}
        loading={loading}
        columns={columns}
        totalRecords={data?.riderReviewsPaginated?.totalCount ?? 0}
        currentPage={data?.riderReviewsPaginated?.currentPage ?? currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={(page, rowCount) => {
          setCurrentPage(page);
          setRowsPerPage(rowCount);
        }}
      />
    </div>
  );
}
