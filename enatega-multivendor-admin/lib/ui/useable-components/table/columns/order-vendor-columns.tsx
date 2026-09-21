import { IExtendedOrder } from '@/lib/utils/interfaces';
import { IDropdownSelectItem, IQueryResult } from '@/lib/utils/interfaces';
import { IRidersByStoreResponse } from '@/lib/utils/interfaces/rider.interface';

// Prime React
import { Tag } from 'primereact/tag';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';

// GraphQL
import { ASSIGN_ORDER_TO_RIDER, GET_RIDERS_BY_STORE, UPDATE_ORDER_STATUS } from '@/lib/api/graphql';

// Hooks
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useQueryGQL } from '@/lib/hooks/useQueryQL';
import useToast from '@/lib/hooks/useToast';
import { useTranslations } from 'next-intl';

// CSS — same inline-dropdown treatment used on the super-admin Dispatch table.
import classes from './order-vendor-columns.module.css';

const dateOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: true,
};

// Status templates
const valueTemplate = (option: IDropdownSelectItem) => (
  <div className="flex items-center justify-start gap-2 dark:text-white">
    <Tag severity={severityChecker(option?.code)} value={option?.label} rounded />
  </div>
);

const itemTemplate = (option: IDropdownSelectItem) => (
  <div
    className={`flex flex-row-reverse items-center justify-start gap-2 ${
      classes.dropDownItem
    } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <span>{option.label}</span>
  </div>
);

function severityChecker(status: string | undefined) {
  switch (status) {
    case 'PENDING':
      return 'danger';
    case 'ASSIGNED':
      return 'info';
    case 'ACCEPTED':
      return 'success';
    case 'CANCELLED':
      return 'danger';
    case 'PICKED':
      return 'contrast';
    case 'DELIVERED':
      return 'success';
  }
}

/**
 * Store / Vendor order table columns. Mirrors the super-admin Dispatch table
 * (inline Rider and Status dropdowns, same flow-based disabling) but scopes
 * both actions to a single store: riders come from `ridersByStore` and the
 * status mutation is the store-permissioned `updateOrderStatus`, so a store
 * can only see and move riders assigned to itself and can never touch
 * another store's order.
 */
export const ORDER_COLUMNS = (storeId: string, onChanged?: () => void) => {
  // Hooks
  const t = useTranslations();
  const { showToast } = useToast();

  // Status options — identical flow to Dispatch.
  const actionStatusOptions = [
    { label: t('PENDING'), code: 'PENDING' },
    { label: t('ACCEPTED'), code: 'ACCEPTED' },
    { label: t('ASSIGNED'), code: 'ASSIGNED' },
    { label: t('PICKED'), code: 'PICKED' },
    { label: t('DELIVERED'), code: 'DELIVERED' },
    { label: t('CANCELLED'), code: 'CANCELLED' },
  ];

  // States
  const [isStatusUpdating, setIsStatusUpdating] = useState({
    _id: '',
    bool: false,
  });
  const [isRiderAssigning, setIsRiderAssigning] = useState({
    _id: '',
    bool: false,
  });

  // Query — only riders this store is allowed to hand orders to.
  const { data: ridersData } = useQueryGQL(
    GET_RIDERS_BY_STORE,
    { storeId, onlyAvailable: false },
    { enabled: !!storeId, fetchPolicy: 'network-only' }
  ) as IQueryResult<IRidersByStoreResponse | undefined, undefined>;

  const riderOptions: IDropdownSelectItem[] = (ridersData?.ridersByStore ?? [])
    .filter((rider) => rider.isActive !== false)
    .map((rider) => ({
      label: `${rider.name}${rider.available ? '' : ` (${t('Unavailable')})`}`,
      code: rider._id,
      _id: rider._id,
    }));

  // Mutations
  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS, {
    onError: (error) => {
      showToast({
        type: 'error',
        title: t('Order Status'),
        message:
          error.graphQLErrors?.[0]?.message ??
          t('An error occured while updating the status'),
      });
    },
    onCompleted: () => {
      showToast({
        type: 'success',
        title: t('Order Status'),
        message: t('Order status has been updated successfully'),
      });
      onChanged?.();
    },
  });

  const [assignOrderToRider] = useMutation(ASSIGN_ORDER_TO_RIDER, {
    onError: (error) => {
      showToast({
        type: 'error',
        title: t('Assign Rider'),
        message:
          error.graphQLErrors?.[0]?.message ??
          t('An error occured while assigning the job to rider'),
      });
    },
    onCompleted: () => {
      showToast({
        type: 'success',
        title: t('Assign Rider'),
        message: t('Order assigned to rider'),
      });
      onChanged?.();
    },
  });

  // Handlers
  const handleStatusDropDownChange = async (
    e: DropdownChangeEvent,
    rowData: IExtendedOrder
  ) => {
    setIsStatusUpdating({ _id: rowData._id, bool: true });
    try {
      await updateOrderStatus({
        variables: { id: rowData._id, status: e.value.code },
      });
    } finally {
      setIsStatusUpdating({ _id: '', bool: false });
    }
  };

  const handleAssignRider = async (
    item: IDropdownSelectItem,
    rowData: IExtendedOrder
  ) => {
    if (!item.code) return;
    setIsRiderAssigning({ _id: rowData._id, bool: true });
    try {
      await assignOrderToRider({
        variables: { orderId: rowData._id, riderId: item.code },
      });
    } finally {
      setIsRiderAssigning({ _id: '', bool: false });
    }
  };

  return [
    {
      headerName: t('Order ID'),
      propertyName: 'orderId',
    },
    {
      propertyName: 'itemsTitle',
      headerName: t('Items'),
    },
    {
      headerName: t('Payment'),
      propertyName: 'paymentMethod',
    },
    {
      headerName: t('Assigned Rider'),
      propertyName: 'rider',
      body: (rowData: IExtendedOrder) => {
        const isDelivered = rowData.orderStatus === 'DELIVERED';

        // Delivered orders are final: no dropdown, just the rider's name.
        if (isDelivered) {
          return <span className="min-w-[150px]">{rowData.rider?.name ?? t('Pickup')}</span>;
        }

        if (rowData.isPickedUp) {
          return (
            <div onClick={(e) => e.stopPropagation()} className={classes.dropdownField}>
              <Dropdown
                options={[{ code: 'Pickup', label: t('Pickup') }]}
                value={{ code: 'Pickup', label: t('Pickup') }}
                dropdownIcon={() => <></>}
                disabled
                className="min-w-[160px]"
              />
            </div>
          );
        }

        // Already assigned: locked, since the server refuses to hand the
        // order to a different rider once one has it.
        if (rowData.rider) {
          const assigned: IDropdownSelectItem = {
            label: rowData.rider.name,
            code: rowData.rider._id,
          };
          return (
            <div onClick={(e) => e.stopPropagation()} className={classes.dropdownField}>
              <Dropdown
                options={[assigned]}
                value={assigned}
                disabled
                className="min-w-[160px]"
              />
            </div>
          );
        }

        return (
          <div onClick={(e) => e.stopPropagation()} className={classes.dropdownField}>
            <Dropdown
              options={riderOptions}
              loading={
                isRiderAssigning.bool && isRiderAssigning._id === rowData._id
              }
              value={null}
              placeholder={t('Select Rider')}
              onChange={(e: DropdownChangeEvent) =>
                handleAssignRider(e.value, rowData)
              }
              className="min-w-[160px]"
              panelClassName={classes.dropdownPanel}
            />
          </div>
        );
      },
    },
    {
      propertyName: 'orderStatus',
      headerName: t('Order Status'),
      body: (rowData: IExtendedOrder) => {
        const filteredOptions = rowData.isPickedUp
          ? actionStatusOptions.filter((status) =>
              ['PENDING', 'ACCEPTED', 'DELIVERED', 'CANCELLED'].includes(
                status.code
              )
            )
          : actionStatusOptions;

        const flowCodes = filteredOptions
          .filter((s) => s.code !== 'CANCELLED')
          .map((s) => s.code);
        const currentIndex = flowCodes.indexOf(rowData.orderStatus);

        const availableStatuses = filteredOptions.map((status) => {
          let disabled = false;

          if (status.code === 'CANCELLED') {
            if (
              rowData.orderStatus === 'DELIVERED' ||
              rowData.orderStatus === 'CANCELLED'
            ) {
              disabled = true;
            }
          } else {
            const statusIndex = flowCodes.indexOf(status.code);

            if (currentIndex !== -1 && statusIndex !== -1) {
              if (statusIndex < currentIndex) disabled = true;
              if (statusIndex > currentIndex + 1) disabled = true;
            } else {
              disabled = true;
            }

            if (status.code === 'ASSIGNED' && !rowData.rider) {
              disabled = true;
            }
          }

          return { ...status, disabled };
        });

        const currentStatus = availableStatuses.find(
          (status) => status.code === rowData?.orderStatus
        );

        const isDelivered = rowData.orderStatus === 'DELIVERED';

        // Delivered orders are final: show the status only, no dropdown.
        if (isDelivered) {
          return valueTemplate(
            currentStatus ?? { label: t('DELIVERED'), code: 'DELIVERED' }
          );
        }

        return (
          <div onClick={(e) => e.stopPropagation()} className={classes.dropdownField}>
            <Dropdown
              value={currentStatus}
              onChange={(e) => handleStatusDropDownChange(e, rowData)}
              options={availableStatuses}
              itemTemplate={itemTemplate}
              valueTemplate={valueTemplate}
              loading={
                isStatusUpdating.bool && isStatusUpdating._id === rowData._id
              }
              optionDisabled="disabled"
              className="min-w-[140px]"
              panelClassName={classes.dropdownPanel}
            />
          </div>
        );
      },
    },
    {
      headerName: t('Created At'),
      propertyName: 'DateCreated',
      body: (rowData: IExtendedOrder) => {
        const raw = rowData?.createdAt;
        const date = /^\d+$/.test(String(raw ?? '')) ? new Date(Number(raw)) : new Date(raw);
        const formatedDate = Number.isNaN(date.getTime())
          ? '-'
          : date.toLocaleDateString('en-US', dateOptions);
        return <span>{formatedDate}</span>;
      },
    },
    {
      headerName: t('Delivery Address'),
      propertyName: 'OrderdeliveryAddress',
    },
  ];
};
