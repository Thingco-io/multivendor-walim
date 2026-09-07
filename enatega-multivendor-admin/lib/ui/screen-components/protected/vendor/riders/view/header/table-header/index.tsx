// Custom Components
import CustomTextField from '@/lib/ui/useable-components/input-field';
import CustomDropdownComponent from '@/lib/ui/useable-components/custom-dropdown';

// Interfaces
import { IDropdownSelectItem } from '@/lib/utils/interfaces';
import { IRiderStore } from '@/lib/utils/interfaces/rider.interface';

import { useTranslations } from 'next-intl';

interface IVendorRidersTableHeaderProps {
  globalFilterValue: string;
  onGlobalFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  stores: IRiderStore[];
  selectedStore: IDropdownSelectItem | null;
  setSelectedStore: (name: string, value: IDropdownSelectItem | null) => void;
}

export default function VendorRidersTableHeader({
  globalFilterValue,
  onGlobalFilterChange,
  stores,
  selectedStore,
  setSelectedStore,
}: IVendorRidersTableHeaderProps) {
  // Hooks
  const t = useTranslations();

  return (
    <div className="mb-4 flex flex-col gap-6">
      <div className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center">
        <div className="w-60">
          <CustomTextField
            type="text"
            name="riderFilter"
            maxLength={35}
            showLabel={false}
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder={t('Keyword Search')}
          />
        </div>

        {/* Narrows the roster to the riders serving one store. */}
        <div className="w-60">
          <CustomDropdownComponent
            name="storeFilter"
            placeholder={t('All Stores')}
            showLabel={false}
            options={stores.map((store) => ({
              label: store.name,
              code: store._id,
            }))}
            selectedItem={selectedStore}
            setSelectedItem={setSelectedStore}
          />
        </div>
      </div>
    </div>
  );
}
