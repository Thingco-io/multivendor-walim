'use client';

// Core
import React, { useRef, useState } from 'react';

// Prime React
import { Checkbox } from 'primereact/checkbox';
import { OverlayPanel } from 'primereact/overlaypanel';

// Components
import CustomTextField from '@/lib/ui/useable-components/input-field';
import CustomDropdownComponent from '@/lib/ui/useable-components/custom-dropdown';
import TextIconClickable from '@/lib/ui/useable-components/text-icon-clickable';

// Icons
import { faAdd } from '@fortawesome/free-solid-svg-icons';

// Interfaces
import { IDropdownSelectItem } from '@/lib/utils/interfaces';
import { IMenuItem } from '@/lib/utils/interfaces/orders/order-vendor.interface';
import { IRiderStore } from '@/lib/utils/interfaces/rider.interface';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

interface IVendorOrdersTableHeaderProps {
  selectedActions: string[];
  setSelectedActions: React.Dispatch<React.SetStateAction<string[]>>;
  onSearch: (searchTerm: string) => void;
  stores: IRiderStore[];
  selectedStore: IDropdownSelectItem | null;
  setSelectedStore: (value: IDropdownSelectItem | null) => void;
  assignmentFilter: IDropdownSelectItem | null;
  setAssignmentFilter: (value: IDropdownSelectItem | null) => void;
}

/**
 * Filters for the Vendor Orders section: free-text search, order status, the
 * store the order came from, and whether a rider has taken it — the last one
 * being how the team finds orders still waiting for a rider.
 */
const VendorOrdersTableHeader: React.FC<IVendorOrdersTableHeaderProps> = ({
  selectedActions,
  setSelectedActions,
  onSearch,
  stores,
  selectedStore,
  setSelectedStore,
  assignmentFilter,
  setAssignmentFilter,
}) => {
  // Hooks
  const t = useTranslations();
  const { theme } = useTheme();

  // States
  const [searchValue, setSearchValue] = useState<string>('');
  const overlayPanelRef = useRef<OverlayPanel>(null);

  const toggleAction = (action: string) => {
    setSelectedActions((prevActions: string[]) =>
      prevActions.includes(action)
        ? prevActions.filter((a: string) => a !== action)
        : [...prevActions, action]
    );
  };

  const menuItems: IMenuItem[] = [
    { label: t('PENDING'), value: 'PENDING' },
    { label: t('ACCEPTED'), value: 'ACCEPTED' },
    { label: t('ASSIGNED'), value: 'ASSIGNED' },
    { label: t('PICKED'), value: 'PICKED' },
    { label: t('DELIVERED'), value: 'DELIVERED' },
    { label: t('CANCELLED'), value: 'CANCELLED' },
  ];

  const assignmentOptions: IDropdownSelectItem[] = [
    { label: t('Unassigned'), code: 'UNASSIGNED' },
    { label: t('Assigned'), code: 'ASSIGNED' },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  return (
    <div className="mb-4 flex flex-col gap-6">
      <div className="flex flex-col items-start gap-3 lg:flex-row lg:items-center">
        <CustomTextField
          type="text"
          name="vendorOrderFilter"
          maxLength={35}
          className="w-64"
          showLabel={false}
          placeholder={t('Keyword Search')}
          value={searchValue}
          onChange={handleSearch}
        />

        <div className="w-56">
          <CustomDropdownComponent
            name="storeFilter"
            placeholder={t('All Stores')}
            showLabel={false}
            showClear
            options={stores.map((store) => ({
              label: store.name,
              code: store._id,
            }))}
            selectedItem={selectedStore}
            setSelectedItem={(_name: string, value: IDropdownSelectItem) =>
              setSelectedStore(value)
            }
          />
        </div>

        <div className="w-56">
          <CustomDropdownComponent
            name="assignmentFilter"
            placeholder={t('Rider Assignment')}
            showLabel={false}
            showClear
            filter={false}
            options={assignmentOptions}
            selectedItem={assignmentFilter}
            setSelectedItem={(_name: string, value: IDropdownSelectItem) =>
              setAssignmentFilter(value)
            }
          />
        </div>

        <TextIconClickable
          className="w-44 rounded border border-dotted border-[#E4E4E7] text-black dark:border-dark-600 dark:text-white"
          icon={faAdd}
          iconStyles={theme === 'dark' ? { color: 'white' } : { color: 'black' }}
          title={t('Orders Status')}
          onClick={(e) => overlayPanelRef.current?.toggle(e)}
        />

        <OverlayPanel ref={overlayPanelRef} dismissable>
          <div className="w-60">
            <div className="border-b border-t py-1">
              {menuItems.map((item) => (
                <div
                  key={item.value}
                  className="my-2 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <Checkbox
                      inputId={`vendor-order-${item.value}`}
                      checked={selectedActions.includes(item.value)}
                      onChange={() => toggleAction(item.value)}
                    />
                    <label
                      htmlFor={`vendor-order-${item.value}`}
                      className="ml-2 text-sm"
                    >
                      {item.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <p
              className="mt-3 cursor-pointer text-center text-sm"
              onClick={() => setSelectedActions([])}
            >
              {t('Clear filters')}
            </p>
          </div>
        </OverlayPanel>
      </div>
    </div>
  );
};

export default VendorOrdersTableHeader;
