// Interfaces
import { IRiderDetailsProps } from '@/lib/utils/interfaces';

// PrimeReact Components
import { Skeleton } from 'primereact/skeleton';

// Localization
import { useTranslations } from 'next-intl';

const PersonalDetails = ({ loading, rider }: IRiderDetailsProps) => {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-2 border rounded-lg overflow-hidden">
      <header className="bg-[#F4F4F5] dark:bg-dark-900 px-6 py-3 border-b-[1px] text-lg font-medium">
        {t('rider_information')}
      </header>

      {/* columns */}
      <div className="grid grid-cols-2 py-5 px-6">
        {/* left-column */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <span className="text-xs">{t('full_name')}</span>
            <span className="font-medium">
              {loading ? <Skeleton height="1.5rem" /> : (rider?.name ?? '-')}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs">{t('Email')}</span>
            <span className="font-medium">
              {loading ? <Skeleton height="1.5rem" /> : (rider?.email ?? '-')}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs">{t('Zone')}</span>
            <span className="font-medium ">
              {loading ? (
                <Skeleton height="1.5rem" />
              ) : (
                (rider?.zone?.title ?? '-')
              )}
            </span>
          </div>
        </div>

        {/* right-column */}
        <div className="flex pl-5 flex-col gap-5">
          <div className="flex flex-col gap-1">
            <span className="text-xs">{t('Phone')}</span>
            <span className="font-medium">
              {loading ? <Skeleton height="1.5rem" /> : (rider?.phone ?? '-')}
            </span>
          </div>
          {/* Owning vendor — platform riders have none. */}
          <div className="flex flex-col gap-1">
            <span className="text-xs">{t('Vendor')}</span>
            <span className="font-medium">
              {loading ? (
                <Skeleton height="1.5rem" />
              ) : (
                (rider?.vendor?.name ?? rider?.vendor?.email ?? t('Platform'))
              )}
            </span>
          </div>
          {/* Stores this rider serves; drives which orders they are offered. */}
          <div className="flex flex-col gap-1">
            <span className="text-xs">{t('Assigned Stores')}</span>
            {loading ? (
              <Skeleton height="1.5rem" />
            ) : rider?.assignedStores?.length ? (
              <div className="flex flex-wrap gap-1">
                {rider.assignedStores.map((store) => (
                  <span
                    key={store._id}
                    className="rounded-full border border-gray-300 px-2 py-[2px] text-xs dark:border-dark-600"
                  >
                    {store.name}
                  </span>
                ))}
              </div>
            ) : (
              <span className="font-medium">-</span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs">{t('Rating')}</span>
            <span className="font-medium">
              {loading ? (
                <Skeleton height="1.5rem" />
              ) : rider?.ratingCount ? (
                `★ ${Number(rider.ratingAverage ?? 0).toFixed(2)} (${rider.ratingCount})`
              ) : (
                t('No ratings yet')
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails;
