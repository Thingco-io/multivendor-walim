'use client';

// Core
import { useMemo } from 'react';

// Prime React
import { Dialog } from 'primereact/dialog';
import { Rating } from 'primereact/rating';

// Hooks
import { useQueryGQL } from '@/lib/hooks/useQueryQL';
import { useTranslations } from 'next-intl';

// Interfaces
import { IQueryResult } from '@/lib/utils/interfaces';
import {
  IRiderRatingSummaryResponse,
  IRiderResponse,
  IRiderReviewsPaginatedResponse,
} from '@/lib/utils/interfaces/rider.interface';

// GraphQL
import {
  GET_RIDER_RATING_SUMMARY,
  GET_RIDER_REVIEWS_PAGINATED,
} from '@/lib/api/graphql';

interface IRiderRatingsDialogProps {
  rider: IRiderResponse | null;
  visible: boolean;
  onHide: () => void;
  /** Limits the feedback to one store — used by the Store Dashboard. */
  storeId?: string;
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
 * Ratings and customer reviews for a single rider.
 *
 * The server scopes the feedback to the caller, so the same dialog serves the
 * Vendor Dashboard (own riders), the Store Dashboard (own deliveries) and the
 * Super Admin (platform-wide).
 */
export default function RiderRatingsDialog({
  rider,
  visible,
  onHide,
  storeId,
}: IRiderRatingsDialogProps) {
  // Hooks
  const t = useTranslations();

  const { data: summaryData, loading: summaryLoading } = useQueryGQL(
    GET_RIDER_RATING_SUMMARY,
    { riderId: rider?._id, storeId },
    { enabled: !!rider?._id && visible, fetchPolicy: 'network-only' }
  ) as IQueryResult<IRiderRatingSummaryResponse | undefined, undefined>;

  const { data: reviewsData, loading: reviewsLoading } = useQueryGQL(
    GET_RIDER_REVIEWS_PAGINATED,
    { riderId: rider?._id, storeId, page: 1, limit: 50 },
    { enabled: !!rider?._id && visible, fetchPolicy: 'network-only' }
  ) as IQueryResult<IRiderReviewsPaginatedResponse | undefined, undefined>;

  const summary = summaryData?.riderRatingSummary;
  const reviews = reviewsData?.riderReviewsPaginated?.data ?? [];

  const breakdown = useMemo(() => {
    const total = summary?.total ?? 0;
    return (summary?.breakdown ?? []).map((row) => ({
      ...row,
      percentage: total ? Math.round((row.count / total) * 100) : 0,
    }));
  }, [summary]);

  if (!rider) return null;

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={`${t('Ratings & Reviews')} — ${rider.name}`}
      className="w-full max-w-screen-sm md:w-[90%] lg:w-[820px]"
      contentClassName="dark:bg-dark-900 dark:text-white"
      headerClassName="dark:bg-dark-900 dark:text-white"
    >
      <div className="space-y-6 p-1">
        {/* Average and star breakdown */}
        <div className="flex flex-col items-start justify-between gap-4 rounded-md border border-gray-300 bg-white p-4 shadow-sm dark:border-dark-600 dark:bg-dark-950 md:flex-row md:items-center">
          <div className="w-full md:w-1/3">
            <h1 className="text-4xl font-semibold text-gray-700 dark:text-gray-200">
              {Number(summary?.average ?? 0).toFixed(2)}
            </h1>
            <p className="mt-1 text-lg font-normal text-gray-500 dark:text-gray-400">
              {summary?.total ?? 0} {t('Reviews')}
            </p>
            <div className="mt-2">
              <Rating
                value={Math.round(summary?.average ?? 0)}
                readOnly
                cancel={false}
                className="flex"
                pt={{
                  onIcon: { className: 'text-amber-500' },
                  offIcon: { className: 'text-amber-500' },
                }}
              />
            </div>
          </div>

          <div className="w-full space-y-2 md:w-2/3">
            {breakdown.map(({ stars, percentage, count }) => (
              <div key={stars} className="flex items-center gap-3">
                <span className="w-6 text-right dark:text-gray-300">
                  {stars}
                </span>
                <div className="h-2 min-w-[40%] flex-1 rounded-full bg-gray-200 dark:bg-dark-600">
                  <div
                    className="h-2 rounded-full bg-amber-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-14 text-right text-sm text-gray-600 dark:text-gray-400">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Individual reviews */}
        <div className="space-y-3">
          {summaryLoading || reviewsLoading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('Loading')}...
            </p>
          ) : reviews.length ? (
            reviews.map((review) => (
              <div
                key={review._id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-dark-600 dark:bg-dark-950"
              >
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div>
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
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {review.restaurant?.name ?? '-'}
                      {review.order?.orderId
                        ? ` · ${t('Order ID')} ${review.order.orderId}`
                        : ''}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-gray-400">
                    {formatDate(review.createdAt)}
                  </span>
                </div>

                {review.description ? (
                  <p className="break-words text-sm text-gray-600 dark:text-gray-300">
                    {review.description}
                  </p>
                ) : null}

                {review.comments ? (
                  <div className="mt-2 w-fit rounded-full border border-gray-300 px-3 py-1 text-xs dark:border-dark-600 dark:text-gray-300">
                    {review.comments}
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="py-10 text-center">
              <div className="mb-3 text-4xl">📭</div>
              <p className="text-gray-600 dark:text-gray-400">
                {t('No ratings yet')}
              </p>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
