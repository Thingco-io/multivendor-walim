'use client';

// Core
import { useContext, useEffect, useMemo, useState } from 'react';

// Prime React
import { DataTableRowClickEvent } from 'primereact/datatable';

// Components
import Table from '@/lib/ui/useable-components/table';
import VendorOrdersTableHeader from '../header/table-header';
import OrderDetailModal from '@/lib/ui/useable-components/popup-menu/order-details-modal';
import AssignRiderDialog from '@/lib/ui/useable-components/assign-rider-dialog';
import OrderTableSkeleton from '@/lib/ui/useable-components/custom-skeletons/orders.vendor.row.skeleton';
import { VENDOR_ORDER_COLUMNS } from '@/lib/ui/useable-components/table/columns/vendor-orders-columns';

// Hooks
import { useQueryGQL } from '@/lib/hooks/useQueryQL';
import useDebounce from '@/lib/hooks/useDebounce';
import { useTranslations } from 'next-intl';

// Context
import { VendorLayoutContext } from '@/lib/context/vendor/layout-vendor.context';

// Interfaces
import {
  IDropdownSelectItem,
  IExtendedOrder,
  IQueryResult,
  IRestaurantsByOwnerResponseGraphQL,
} from '@/lib/utils/interfaces';
import { IVendorOrdersPaginatedResponse } from '@/lib/utils/interfaces/orders/order-vendor.interface';
import { IActionMenuItem } from '@/lib/utils/interfaces/action-menu.interface';
import { IRiderStore } from '@/lib/utils/interfaces/rider.interface';
import { TOrderRowData } from '@/lib/utils/types';

// GraphQL
import {
  GET_RESTAURANTS_BY_OWNER,
  GET_VENDOR_ORDERS,
} from '@/lib/api/graphql';

/**
 * Orders across every store the vendor operates.
 *
 * Beyond monitoring, this is where an order still waiting for a rider can be
 * handed to one manually — useful when nobody has self-accepted or the store
 * wants a specific rider on the delivery.
 */
export default function VendorOrdersMain() {
  // Hooks
  const t = useTranslations();

  // Context
  const {
    vendorLayoutContextData: { vendorId },
  } = useContext(VendorLayoutContext);

  // States
  const [selectedData, setSelectedData] = useState<IExtendedOrder[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] =
    useState<IDropdownSelectItem | null>(null);
  const [assignmentFilter, setAssignmentFilter] =
    useState<IDropdownSelectItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [detailOrder, setDetailOrder] = useState<IExtendedOrder | null>(null);
  const [assignOrder, setAssignOrder] = useState<IExtendedOrder | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Queries
  const { data: storesData } = useQueryGQL(
    GET_RESTAURANTS_BY_OWNER,
    { id: vendorId },
    { enabled: !!vendorId, fetchPolicy: 'cache-and-network' }
  ) as IQueryResult<IRestaurantsByOwnerResponseGraphQL | undefined, undefined>;

  const stores: IRiderStore[] = useMemo(
    () =>
      (storesData?.restaurantByOwner?.restaurants ?? []).map((store) => ({
        _id: store._id,
        name: store.name,
      })),
    [storesData]
  );

  const { data, error, loading, refetch } = useQueryGQL(
    GET_VENDOR_ORDERS,
    {
      page: currentPage,
      limit: rowsPerPage,
      search: debouncedSearch || undefined,
      // Ignored for a signed-in vendor (the server uses their own stores), but
      // keeps results scoped when a super admin drills into a vendor.
      vendorId: vendorId || undefined,
      restaurantId: selectedStore?.code || undefined,
      orderStatus: selectedActions.length ? selectedActions : undefined,
      riderAssigned:
        assignmentFilter?.code === 'ASSIGNED'
          ? true
          : assignmentFilter?.code === 'UNASSIGNED'
            ? false
            : undefined,
    },
    { fetchPolicy: 'network-only' }
  ) as IQueryResult<IVendorOrdersPaginatedResponse | undefined, undefined>;

  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearch,
    selectedActions,
    selectedStore?.code,
    assignmentFilter?.code,
  ]);

  const handleRowClick = (event: DataTableRowClickEvent) => {
    setDetailOrder(event.data as IExtendedOrder);
  };

  const menuItems: IActionMenuItem<IExtendedOrder>[] = [
    {
      label: t('View Details'),
      command: (order?: IExtendedOrder) => {
        if (order) setDetailOrder(order);
      },
    },
    {
      label: t('Assign Rider'),
      command: (order?: IExtendedOrder) => {
        if (order) setAssignOrder(order);
      },
    },
  ];

  const tableData = useMemo(() => {
    const orders = data?.vendorOrdersPaginated?.orders ?? [];
    return orders.map((order) => ({
      ...order,
      itemsTitle:
        order.items
          ?.map((item) => item.title)
          .join(', ')
          .slice(0, 15) + '...',
      OrderdeliveryAddress:
        order.deliveryAddress?.deliveryAddress?.toString().slice(0, 25) ?? '',
      DateCreated: order.createdAt?.toString().slice(0, 10) ?? '',
    }));
  }, [data]);

  const displayData: TOrderRowData[] = useMemo(() => {
    if (loading) return OrderTableSkeleton({ rowCount: 10 });
    return tableData;
  }, [loading, tableData]);

  return (
    <div className="p-3">
      <VendorOrdersTableHeader
        selectedActions={selectedActions}
        setSelectedActions={setSelectedActions}
        onSearch={setSearchTerm}
        stores={stores}
        selectedStore={selectedStore}
        setSelectedStore={setSelectedStore}
        assignmentFilter={assignmentFilter}
        setAssignmentFilter={setAssignmentFilter}
      />

      <Table
        data={displayData as IExtendedOrder[]}
        setSelectedData={setSelectedData}
        selectedData={selectedData}
        columns={VENDOR_ORDER_COLUMNS({ menuItems })}
        loading={loading}
        handleRowClick={handleRowClick}
        moduleName="Vendor-Order"
        totalRecords={data?.vendorOrdersPaginated?.totalCount ?? 0}
        currentPage={data?.vendorOrdersPaginated?.currentPage ?? currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={(page, rowCount) => {
          setCurrentPage(page);
          setRowsPerPage(rowCount);
        }}
      />

      <OrderDetailModal
        visible={!!detailOrder}
        onHide={() => setDetailOrder(null)}
        restaurantData={detailOrder}
        onAssignRider={(order) => {
          setDetailOrder(null);
          setAssignOrder(order);
        }}
      />

      <AssignRiderDialog
        visible={!!assignOrder}
        onHide={() => setAssignOrder(null)}
        orderId={assignOrder?._id ?? null}
        orderNumber={assignOrder?.orderId ?? null}
        storeId={assignOrder?.restaurant?._id ?? null}
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
