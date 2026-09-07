'use client';

// Core
import { useContext, useEffect, useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';

// Interface and Types
import {
  IRiderResponse,
  IVendorRidersPaginatedResponse,
  IRiderStore,
} from '@/lib/utils/interfaces/rider.interface';
import {
  IDropdownSelectItem,
  IQueryResult,
  IRestaurantsByOwnerResponseGraphQL,
} from '@/lib/utils/interfaces';
import { IActionMenuItem } from '@/lib/utils/interfaces/action-menu.interface';

// UI Components
import VendorRidersTableHeader from '../header/table-header';
import CustomDialog from '@/lib/ui/useable-components/delete-dialog';
import Table from '@/lib/ui/useable-components/table';
import { VENDOR_RIDER_TABLE_COLUMNS } from '@/lib/ui/useable-components/table/columns/vendor-rider-columns';
import RiderRatingsDialog from '../../rider-ratings-dialog';

// Hooks
import { useQueryGQL } from '@/lib/hooks/useQueryQL';
import useToast from '@/lib/hooks/useToast';
import useDebounce from '@/lib/hooks/useDebounce';
import { useTranslations } from 'next-intl';

// Context
import { VendorLayoutContext } from '@/lib/context/vendor/layout-vendor.context';

// GraphQL
import {
  DELETE_RIDER,
  GET_RESTAURANTS_BY_OWNER,
  GET_VENDOR_RIDERS_PAGINATED,
} from '@/lib/api/graphql';

interface IVendorRidersMainProps {
  setIsAddRiderVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setRider: React.Dispatch<React.SetStateAction<IRiderResponse | null>>;
}

export default function VendorRidersMain({
  setIsAddRiderVisible,
  setRider,
}: IVendorRidersMainProps) {
  // Hooks
  const t = useTranslations();
  const { showToast } = useToast();

  // Context
  const {
    vendorLayoutContextData: { vendorId },
  } = useContext(VendorLayoutContext);

  // State
  const [deleteId, setDeleteId] = useState('');
  const [ratingsRider, setRatingsRider] = useState<IRiderResponse | null>(null);
  const [selectedRiders, setSelectedRiders] = useState<IRiderResponse[]>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [selectedStore, setSelectedStore] =
    useState<IDropdownSelectItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const debouncedSearch = useDebounce(globalFilterValue, 500);

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

  const { data, loading } = useQueryGQL(
    GET_VENDOR_RIDERS_PAGINATED,
    {
      page: currentPage,
      limit: rowsPerPage,
      search: debouncedSearch || undefined,
      storeId: selectedStore?.code || undefined,
      // Ignored for a signed-in vendor (the server uses their own id), but
      // keeps the list scoped when a super admin drills into a vendor.
      vendorId: vendorId || undefined,
    },
    { fetchPolicy: 'network-only' }
  ) as IQueryResult<IVendorRidersPaginatedResponse | undefined, undefined>;

  // Mutation
  const [mutateDelete, { loading: mutationLoading }] = useMutation(
    DELETE_RIDER,
    { refetchQueries: 'active', awaitRefetchQueries: true }
  );

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilterValue(e.target.value);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedStore?.code]);

  // The roster also lists riders the super admin attached to one of this
  // vendor's stores. Those belong to the platform (or another vendor), so they
  // are visible and assignable but not editable from here.
  const isOwnRider = (rider: IRiderResponse) =>
    !!vendorId && rider.vendor?._id === vendorId;

  const menuItems: IActionMenuItem<IRiderResponse>[] = [
    {
      label: t('Ratings & Reviews'),
      command: (rider?: IRiderResponse) => {
        if (rider) setRatingsRider(rider);
      },
    },
    {
      label: t('Edit'),
      isVisible: isOwnRider,
      command: (rider?: IRiderResponse) => {
        if (rider) {
          setIsAddRiderVisible(true);
          setRider(rider);
        }
      },
    },
    {
      label: t('Delete'),
      isVisible: isOwnRider,
      command: (rider?: IRiderResponse) => {
        if (rider) setDeleteId(rider._id);
      },
    },
  ];

  return (
    <div className="p-3">
      <Table
        header={
          <VendorRidersTableHeader
            globalFilterValue={globalFilterValue}
            onGlobalFilterChange={onGlobalFilterChange}
            stores={stores}
            selectedStore={selectedStore}
            setSelectedStore={(_name, value) => setSelectedStore(value)}
          />
        }
        data={data?.vendorRidersPaginated?.data || []}
        setSelectedData={setSelectedRiders}
        selectedData={selectedRiders}
        loading={loading}
        columns={VENDOR_RIDER_TABLE_COLUMNS({ menuItems, vendorId })}
        totalRecords={data?.vendorRidersPaginated?.totalCount ?? 0}
        currentPage={data?.vendorRidersPaginated?.currentPage ?? currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={(page, rowCount) => {
          setCurrentPage(page);
          setRowsPerPage(rowCount);
        }}
      />

      <RiderRatingsDialog
        rider={ratingsRider}
        visible={!!ratingsRider}
        onHide={() => setRatingsRider(null)}
      />

      <CustomDialog
        loading={mutationLoading}
        visible={!!deleteId}
        onHide={() => setDeleteId('')}
        onConfirm={() => {
          mutateDelete({
            variables: { id: deleteId },
            onCompleted: () => {
              showToast({
                type: 'success',
                title: t('Success'),
                message: t('Rider Deleted'),
                duration: 3000,
              });
              setDeleteId('');
            },
          });
        }}
        message={t('Are you sure you want to delete this item?')}
      />
    </div>
  );
}
