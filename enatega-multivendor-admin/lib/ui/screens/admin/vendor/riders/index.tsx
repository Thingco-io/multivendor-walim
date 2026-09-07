'use client';

// Core
import { useState } from 'react';

// Components
import VendorRiderAddForm from '@/lib/ui/screen-components/protected/vendor/riders/add-form';
import VendorRiderHeader from '@/lib/ui/screen-components/protected/vendor/riders/view/header/screen-header';
import VendorRidersMain from '@/lib/ui/screen-components/protected/vendor/riders/view/main';

// Interfaces and Types
import { IRiderResponse } from '@/lib/utils/interfaces/rider.interface';

export default function VendorRidersScreen() {
  // State
  const [isAddRiderVisible, setIsAddRiderVisible] = useState(false);
  const [rider, setRider] = useState<null | IRiderResponse>(null);

  return (
    <div className="screen-container">
      <VendorRiderHeader setIsAddRiderVisible={setIsAddRiderVisible} />

      <VendorRidersMain
        setIsAddRiderVisible={setIsAddRiderVisible}
        setRider={setRider}
      />

      <VendorRiderAddForm
        rider={rider}
        onHide={() => {
          setIsAddRiderVisible(false);
          setRider(null);
        }}
        isAddRiderVisible={isAddRiderVisible}
      />
    </div>
  );
}
