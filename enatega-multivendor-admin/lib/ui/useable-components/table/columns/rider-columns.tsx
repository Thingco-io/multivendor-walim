// Core
import { useContext, useState } from 'react';

// Custom Components
import ActionMenu from '@/lib/ui/useable-components/action-menu';
import CustomInputSwitch from '../../custom-input-switch';

// Interfaces and Types
import { IActionMenuProps } from '@/lib/utils/interfaces/action-menu.interface';
import { IRiderResponse } from '@/lib/utils/interfaces/rider.interface';

// GraphQL
import { TOGGLE_RIDER } from '@/lib/api/graphql';
import { useMutation } from '@apollo/client';
import { ToastContext } from '@/lib/context/global/toast.context';
import { useTranslations } from 'next-intl';
import { toTextCase } from '@/lib/utils/methods';
// import { toTextCase } from '@/lib/utils/methods';

export const RIDER_TABLE_COLUMNS = ({
  menuItems,
}: {
  menuItems: IActionMenuProps<IRiderResponse>['items'];
}) => {
  // Hooks
  const t = useTranslations();

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRider, setSelectedRider] = useState<{
    id: string;
    isActive: boolean;
  }>({ id: '', isActive: false });

  const { showToast } = useContext(ToastContext);

  // GraphQL mutation hook
  const [mutateToggle, { loading }] = useMutation(TOGGLE_RIDER, {
    refetchQueries: 'active',
    awaitRefetchQueries: true,
    onCompleted: () => {
      setIsLoading(false);
      showToast({
        type: 'success',
        title: t('Banner Status'),
        message: t('Status Changed Successfully'),
      });
    },
    onError: () => {
      setIsLoading(false);
      showToast({
        type: 'error',
        title: t('Banner Status'),
        message: t('Status Change Failed'),
      });
    },
  });

  // Handle availability toggle
  const onHandleBannerStatusChange = async (isActive: boolean, id: string) => {
    try {
      setIsLoading(true);
      setSelectedRider({ id, isActive });
      await mutateToggle({ variables: { id } });
    } catch (error) {
      showToast({
        type: 'error',
        title: t('Banner Status'),
        message: t('Something went wrong'),
      });
    } finally {
      setSelectedRider({ id: '', isActive: false });
      setIsLoading(false);
    }
  };

  return [
    { headerName: t('Name'), propertyName: 'name' },
    { headerName: t('Username'), propertyName: 'username' },
    { headerName: t('Phone'), propertyName: 'phone' },
    {
      headerName: t('Zone'),
      propertyName: 'zone',
      body: (rider: IRiderResponse) => rider.zone?.title ?? '-',
    },
    {
      // Which vendor owns this rider — platform riders show as unbranded.
      headerName: t('Vendor'),
      propertyName: 'vendor',
      body: (rider: IRiderResponse) =>
        rider.vendor?.name || rider.vendor?.email || (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {t('Platform')}
          </span>
        ),
    },
    {
      // Stores this rider serves — the field that decides which orders they
      // are offered.
      headerName: t('Assigned Stores'),
      propertyName: 'assignedStores',
      body: (rider: IRiderResponse) => {
        const stores = rider.assignedStores ?? [];
        if (!stores.length) {
          return (
            <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
          );
        }
        return (
          <div className="flex max-w-[200px] flex-wrap gap-1">
            {stores.map((store) => (
              <span
                key={store._id}
                className="rounded-full border border-gray-300 px-2 py-[2px] text-xs dark:border-dark-600 dark:text-white"
              >
                {store.name}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      headerName: t('Rating'),
      propertyName: 'ratingAverage',
      body: (rider: IRiderResponse) =>
        rider.ratingCount ? (
          <span className="whitespace-nowrap dark:text-white">
            ★ {Number(rider.ratingAverage ?? 0).toFixed(2)}{' '}
            <span className="text-xs text-gray-400">({rider.ratingCount})</span>
          </span>
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
        ),
    },
    {
      headerName: t('Vehicle Type'),
      propertyName: 'vehicleType',
      body: (rider: IRiderResponse) =>
        rider.vehicleType
          ? toTextCase(rider.vehicleType.replaceAll('_', ' '), 'title')
          : '-',
    },
    {
      headerName: t('Available'),
      propertyName: 'available',
      body: (rider: IRiderResponse) => (
        <CustomInputSwitch
          loading={rider._id === selectedRider.id && (loading || isLoading)}
          isActive={rider.available}
          onChange={async () => {
            if (loading || isLoading) return;
            await onHandleBannerStatusChange(!rider.available, rider._id);
          }}
        />
      ),
    },
    {
      propertyName: 'actions',
      body: (rider: IRiderResponse) => (
        <ActionMenu items={menuItems} data={rider} />
      ),
    },
  ];
};
