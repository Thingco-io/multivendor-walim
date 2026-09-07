import { IExtendedOrder } from '@/lib/utils/interfaces';
import { useTranslations } from 'next-intl';
const dateOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: true,
};

export const ORDER_COLUMNS = () => {
  // Hooks
  const t = useTranslations();
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
      headerName: t('Order Status'),
      propertyName: 'orderStatus',
    },
    {
      headerName: t('Created At'),
      propertyName: 'DateCreated',
      body: (rowData: IExtendedOrder) => {
        const formatedDate = new Date(
          Number(rowData?.createdAt)
        ).toLocaleDateString('en-US', dateOptions);
        return <span>{formatedDate}</span>;
      },
    },
    {
      headerName: t('Delivery Address'),
      propertyName: 'OrderdeliveryAddress',
    },
    {
      // Delivery visibility: shows at a glance which orders are still waiting
      // for a rider so the store can assign one.
      headerName: t('Assigned Rider'),
      propertyName: 'rider',
      body: (rowData: IExtendedOrder) =>
        rowData.rider ? (
          <span className="dark:text-white">{rowData.rider.name}</span>
        ) : (
          <span className="rounded-full bg-amber-100 px-2 py-[2px] text-xs text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            {t('Unassigned')}
          </span>
        ),
    },
  ];
};
