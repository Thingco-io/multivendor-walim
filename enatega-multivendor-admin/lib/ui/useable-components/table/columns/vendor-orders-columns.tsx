// Interfaces
import { IExtendedOrder } from '@/lib/utils/interfaces';

// Components
import ActionMenu from '@/lib/ui/useable-components/action-menu';
import { IActionMenuProps } from '@/lib/utils/interfaces/action-menu.interface';

import { useTranslations } from 'next-intl';

const dateOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hour12: true,
};

const formatDate = (value?: string | number | null) => {
  if (!value) return '-';
  const timestamp = Number(value);
  const date = new Date(Number.isNaN(timestamp) ? String(value) : timestamp);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', dateOptions);
};

/**
 * Order columns for the Vendor / Store Orders section.
 *
 * Surfaces the delivery side of an order — which store it came from, its
 * delivery status and whether a rider has taken it — so the team can spot
 * unassigned orders at a glance and act on them.
 */
export const VENDOR_ORDER_COLUMNS = ({
  menuItems,
  showStore = true,
}: {
  menuItems: IActionMenuProps<IExtendedOrder>['items'];
  showStore?: boolean;
}) => {
  // Hooks
  const t = useTranslations();

  const columns = [
    { headerName: t('Order ID'), propertyName: 'orderId' },
    {
      headerName: t('Customer'),
      propertyName: 'user',
      body: (order: IExtendedOrder) => (
        <div className="flex flex-col">
          <span className="dark:text-white">{order.user?.name ?? '-'}</span>
          <span className="text-xs text-gray-400">
            {order.user?.phone ?? ''}
          </span>
        </div>
      ),
    },
    {
      headerName: t('Store'),
      propertyName: 'restaurant',
      body: (order: IExtendedOrder) => order.restaurant?.name ?? '-',
    },
    { headerName: t('Order Status'), propertyName: 'orderStatus' },
    {
      headerName: t('Assigned Rider'),
      propertyName: 'rider',
      body: (order: IExtendedOrder) =>
        order.rider ? (
          <div className="flex flex-col">
            <span className="dark:text-white">{order.rider.name}</span>
            <span className="text-xs text-gray-400">
              {order.rider.phone ?? ''}
            </span>
          </div>
        ) : (
          <span className="rounded-full bg-amber-100 px-2 py-[2px] text-xs text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            {t('Unassigned')}
          </span>
        ),
    },
    {
      headerName: t('Delivery Address'),
      propertyName: 'OrderdeliveryAddress',
      body: (order: IExtendedOrder) =>
        order.deliveryAddress?.deliveryAddress ?? '-',
    },
    {
      headerName: t('Total'),
      propertyName: 'orderAmount',
      body: (order: IExtendedOrder) => (order.orderAmount ?? 0).toFixed(2),
    },
    {
      headerName: t('Created At'),
      propertyName: 'DateCreated',
      body: (order: IExtendedOrder) => (
        <span className="whitespace-nowrap">{formatDate(order.createdAt)}</span>
      ),
    },
    {
      propertyName: 'actions',
      body: (order: IExtendedOrder) => (
        <ActionMenu items={menuItems} data={order} />
      ),
    },
  ];

  return showStore
    ? columns
    : columns.filter((column) => column.propertyName !== 'restaurant');
};
