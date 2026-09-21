'use client';

// Core
import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';

// Prime React
import { Dialog } from 'primereact/dialog';

// Components
import CustomButton from '@/lib/ui/useable-components/button';
import CustomDropdownComponent from '@/lib/ui/useable-components/custom-dropdown';

// Hooks
import { useQueryGQL } from '@/lib/hooks/useQueryQL';
import useToast from '@/lib/hooks/useToast';
import { useTranslations } from 'next-intl';

// Interfaces
import { IDropdownSelectItem, IQueryResult } from '@/lib/utils/interfaces';
import { IRidersByStoreResponse } from '@/lib/utils/interfaces/rider.interface';

// GraphQL
import { ASSIGN_ORDER_TO_RIDER, GET_RIDERS_BY_STORE } from '@/lib/api/graphql';

interface IAssignRiderDialogProps {
  visible: boolean;
  onHide: () => void;
  orderId: string | null;
  orderNumber?: string | null;
  storeId: string | null;
  /** Rider already on the order, if any — assignment is then blocked. */
  assignedRiderName?: string | null;
  onAssigned?: () => void;
}

/**
 * Manual rider assignment for a delivery order.
 *
 * Only riders assigned to the store that received the order are offered, which
 * mirrors the server-side rule — a store can never hand an order to a rider
 * that does not serve it. Once an order is assigned (here or by a rider
 * accepting it first) it is locked and no longer available to anyone else.
 */
export default function AssignRiderDialog({
  visible,
  onHide,
  orderId,
  orderNumber,
  storeId,
  assignedRiderName,
  onAssigned,
}: IAssignRiderDialogProps) {
  // Hooks
  const t = useTranslations();
  const { showToast } = useToast();

  // State
  const [selectedRider, setSelectedRider] =
    useState<IDropdownSelectItem | null>(null);

  useEffect(() => {
    if (visible) setSelectedRider(null);
  }, [visible, orderId]);

  // Query — the store's eligible riders.
  const { data, loading } = useQueryGQL(
    GET_RIDERS_BY_STORE,
    { storeId, onlyAvailable: false },
    { enabled: !!storeId && visible, fetchPolicy: 'network-only' }
  ) as IQueryResult<IRidersByStoreResponse | undefined, undefined>;

  const riderOptions: IDropdownSelectItem[] = useMemo(
    () =>
      (data?.ridersByStore ?? [])
        .filter((rider) => rider.isActive !== false)
        .map((rider) => ({
          label: `${rider.name}${rider.available ? '' : ` (${t('Unavailable')})`}`,
          code: rider._id,
        })),
    [data, t]
  );

  const [mutateAssign, { loading: assigning }] = useMutation(
    ASSIGN_ORDER_TO_RIDER,
    { refetchQueries: 'active', awaitRefetchQueries: true }
  );

  const onAssign = () => {
    if (!orderId || !selectedRider?.code) return;
    mutateAssign({
      variables: { orderId, riderId: selectedRider.code },
      onCompleted: () => {
        showToast({
          type: 'success',
          title: t('Assign Rider'),
          message: t('Order assigned to rider'),
          duration: 3000,
        });
        onAssigned?.();
        onHide();
      },
      onError: (error) => {
        showToast({
          type: 'error',
          title: t('Assign Rider'),
          message:
            error.graphQLErrors?.[0]?.message ?? t('ActionFailedTryAgain'),
          duration: 4000,
        });
      },
    });
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={
        orderNumber ? `${t('Assign Rider')} — #${orderNumber}` : t('Assign Rider')
      }
      className="w-full max-w-screen-sm md:w-[480px]"
      contentClassName="dark:bg-dark-900 dark:text-white"
      headerClassName="dark:bg-dark-900 dark:text-white"
    >
      <div className="space-y-4 p-1">
        {assignedRiderName ? (
          <p className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm dark:border-dark-600 dark:bg-dark-950 dark:text-gray-300">
            {t('This order is already assigned to')}{' '}
            <strong>{assignedRiderName}</strong>.
          </p>
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('Only riders assigned to this store can take this order')}
            </p>

            <CustomDropdownComponent
              name="rider"
              placeholder={t('Select Rider')}
              showLabel={true}
              isLoading={loading}
              options={riderOptions}
              selectedItem={selectedRider}
              setSelectedItem={(_name, value) =>
                setSelectedRider(value as IDropdownSelectItem)
              }
            />

            {!loading && !riderOptions.length && (
              <p className="text-sm text-red-500">
                {t('No riders are assigned to this store yet')}
              </p>
            )}

            <div className="flex justify-end">
              <CustomButton
                className="h-10 w-fit border border-gray-300 bg-black px-8 text-white dark:border-dark-600"
                label={t('Assign Rider')}
                loading={assigning}
                disabled={!selectedRider?.code || assigning}
                onClick={onAssign}
              />
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
