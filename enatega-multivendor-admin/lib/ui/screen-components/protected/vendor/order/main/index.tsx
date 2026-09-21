import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSubscription } from '@apollo/client';
import Table from '@/lib/ui/useable-components/table';
import { useQueryGQL } from '@/lib/hooks/useQueryQL';
import OrderTableHeader from '../header/table-header';
import { IQueryResult } from '@/lib/utils/interfaces';
import { RestaurantLayoutContext } from '@/lib/context/restaurant/layout-restaurant.context';
import {
  GET_ORDER_BY_RESTAURANT,
  SUBSCRIPTION_PLACE_ORDER,
} from '@/lib/api/graphql';
import { ORDER_COLUMNS } from '@/lib/ui/useable-components/table/columns/order-vendor-columns';
import OrderTableSkeleton from '@/lib/ui/useable-components/custom-skeletons/orders.vendor.row.skeleton';
import {
  IExtendedOrder,
} from '@/lib/utils/interfaces';
import { IOrdersByRestaurantPaginatedResponse } from '@/lib/utils/interfaces/orders.interface';
import { TOrderRowData } from '@/lib/utils/types';
import { DataTableRowClickEvent } from 'primereact/datatable';
import OrderDetailModal from '@/lib/ui/useable-components/popup-menu/order-details-modal';
import AssignRiderDialog from '@/lib/ui/useable-components/assign-rider-dialog';
import { useTranslations } from 'next-intl';
import useDebounce from '@/lib/hooks/useDebounce';

export default function OrderVendorMain() {
  // Hooks
  const t = useTranslations();

  // States
  const [selectedData, setSelectedData] = useState<IExtendedOrder[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { restaurantLayoutContextData } = useContext(RestaurantLayoutContext);
  const { restaurantId } = restaurantLayoutContextData;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<IExtendedOrder | null>(null);
  // Order whose delivery the store is handing to a rider manually.
  const [assignOrder, setAssignOrder] = useState<IExtendedOrder | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, error, loading, refetch } = useQueryGQL(
    GET_ORDER_BY_RESTAURANT,
    {
      restaurant: restaurantId,
      page: currentPage,
      rows: rowsPerPage,
      search: debouncedSearch || undefined,
      orderStatus: selectedActions.length ? selectedActions : undefined,
    },
    {
      fetchPolicy: 'network-only',
      enabled: !!restaurantId,
    }
  ) as IQueryResult<IOrdersByRestaurantPaginatedResponse | undefined, undefined>;

  // New orders land on the backend's PLACE_ORDER channel as soon as a
  // customer checks out; refetch the list so the store sees it live instead
  // of only after a manual refresh.
  const { data: newOrderData } = useSubscription(SUBSCRIPTION_PLACE_ORDER, {
    variables: { restaurant: restaurantId },
    skip: !restaurantId,
  });

  const refetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!newOrderData) return;

    if (refetchTimeoutRef.current) {
      clearTimeout(refetchTimeoutRef.current);
    }
    refetchTimeoutRef.current = setTimeout(() => {
      refetch?.();
    }, 500);

    return () => {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
      }
    };
  }, [newOrderData, refetch]);

  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  };

  const handleRowClick = (event: DataTableRowClickEvent) => {
    const selectedOrder = event.data as IExtendedOrder;
    setSelectedRestaurant(selectedOrder);
    setIsModalOpen(true);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedActions]);

  const tableData = useMemo(() => {
    if (!data?.ordersByRestId?.orders) return [];

    return data.ordersByRestId.orders.map(
      (order: IExtendedOrder): IExtendedOrder => ({
        ...order,
        itemsTitle:
          order.items
            .map((item) => item.title)
            .join(', ')
            .slice(0, 15) + '...',
        OrderdeliveryAddress:
          order.deliveryAddress.deliveryAddress.toString().slice(0, 15) + '...',
        DateCreated: order.createdAt.toString().slice(0, 10),
      })
    );
  }, [data]);

  const displayData: TOrderRowData[] = useMemo(() => {
    if (loading) {
      return OrderTableSkeleton({ rowCount: 10 }); // Change as per your need, no rows state now
    }
    return tableData;
  }, [loading, tableData]);

  if (!restaurantId) {
    return null;
  }

  return (
    <div className="p-3">
      <OrderTableHeader
        selectedActions={selectedActions}
        setSelectedActions={setSelectedActions}
        onSearch={handleSearch}
      />
      <Table
        data={displayData as IExtendedOrder[]}
        setSelectedData={setSelectedData}
        selectedData={selectedData}
        columns={ORDER_COLUMNS(restaurantId ?? '', () => refetch?.())}
        loading={loading}
        handleRowClick={handleRowClick}
        moduleName="Restaurant-Order"
        totalRecords={data?.ordersByRestId?.totalCount ?? 0}
        currentPage={data?.ordersByRestId?.currentPage ?? currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={(page, rowCount) => {
          setCurrentPage(page);
          setRowsPerPage(rowCount);
        }}
      />
      <OrderDetailModal
        visible={isModalOpen}
        onHide={() => setIsModalOpen(false)}
        restaurantData={selectedRestaurant}
        onAssignRider={(order) => {
          setIsModalOpen(false);
          setAssignOrder(order);
        }}
      />
      <AssignRiderDialog
        visible={!!assignOrder}
        onHide={() => setAssignOrder(null)}
        orderId={assignOrder?._id ?? null}
        orderNumber={assignOrder?.orderId ?? null}
        storeId={restaurantId ?? null}
        assignedRiderName={assignOrder?.rider?.name ?? null}
        onAssigned={() => refetch?.()}
      />
      {error && (
        <p className="text-red-500">
          {t('Error')}: {error.message}
        </p>
      )}
    </div>
  );
}
