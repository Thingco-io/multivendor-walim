// Core
import { useContext, useState } from 'react';

// Custom Components
import ActionMenu from '@/lib/ui/useable-components/action-menu';
import CustomInputSwitch from '../../custom-input-switch';

// Interfaces and Types
import { IActionMenuProps } from '@/lib/utils/interfaces/action-menu.interface';
import { IRiderResponse } from '@/lib/utils/interfaces/rider.interface';

// GraphQL
import { TOGGLE_RIDER_ACTIVE } from '@/lib/api/graphql';
import { useMutation } from '@apollo/client';
import { ToastContext } from '@/lib/context/global/toast.context';
import { useTranslations } from 'next-intl';
import { toTextCase } from '@/lib/utils/methods';

/**
 * Roster columns for the riders serving a vendor.
 *
 * Lists the riders the vendor owns plus any rider the super admin assigned to
 * one of its stores. Shows the stores each rider serves — the field that
 * decides which orders they are offered — and their delivery rating, and lets
 * the vendor activate or deactivate the riders it actually owns.
 */
export const VENDOR_RIDER_TABLE_COLUMNS = ({
  menuItems,
  vendorId,
}: {
  menuItems: IActionMenuProps<IRiderResponse>['items'];
  vendorId?: string | null;
}) => {
  // Hooks
  const t = useTranslations();
  const { showToast } = useContext(ToastContext);

  // States
  const [togglingId, setTogglingId] = useState('');

  const [mutateToggleActive, { loading }] = useMutation(TOGGLE_RIDER_ACTIVE, {
    refetchQueries: 'active',
    awaitRefetchQueries: true,
    onCompleted: () => {
      setTogglingId('');
      showToast({
        type: 'success',
        title: t('Rider Status'),
        message: t('Status Changed Successfully'),
      });
    },
    onError: () => {
      setTogglingId('');
      showToast({
        type: 'error',
        title: t('Rider Status'),
        message: t('Status Change Failed'),
      });
    },
  });

  const onToggleActive = async (rider: IRiderResponse) => {
    if (loading) return;
    setTogglingId(rider._id);
    await mutateToggleActive({
      variables: { id: rider._id, isActive: !rider.isActive },
    });
  };

  // Riders the super admin attached to one of this vendor's stores are listed
  // here but managed elsewhere, so they stay read-only.
  const isOwnRider = (rider: IRiderResponse) =>
    !!vendorId && rider.vendor?._id === vendorId;

  return [
    { headerName: t('Name'), propertyName: 'name' },
    { headerName: t('Username'), propertyName: 'username' },
    { headerName: t('Phone'), propertyName: 'phone' },
    {
      headerName: t('Assigned Stores'),
      propertyName: 'assignedStores',
      body: (rider: IRiderResponse) => {
        const stores = rider.assignedStores ?? [];
        if (!stores.length) {
          return (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {t('No stores assigned')}
            </span>
          );
        }
        return (
          <div className="flex max-w-[220px] flex-wrap gap-1">
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
      headerName: t('Vehicle Type'),
      propertyName: 'vehicleType',
      body: (rider: IRiderResponse) =>
        rider.vehicleType
          ? toTextCase(rider.vehicleType.replaceAll('_', ' '), 'title')
          : '-',
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
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {t('No ratings yet')}
          </span>
        ),
    },
    {
      headerName: t('Managed By'),
      propertyName: 'vendor',
      body: (rider: IRiderResponse) =>
        isOwnRider(rider) ? (
          <span className="dark:text-white">{t('You')}</span>
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {rider.vendor?.name || rider.vendor?.email || t('Platform')}
          </span>
        ),
    },
    {
      headerName: t('Active'),
      propertyName: 'isActive',
      body: (rider: IRiderResponse) =>
        isOwnRider(rider) ? (
          <CustomInputSwitch
            loading={rider._id === togglingId && loading}
            isActive={!!rider.isActive}
            onChange={() => onToggleActive(rider)}
          />
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {rider.isActive ? t('Active') : t('Inactive')}
          </span>
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
