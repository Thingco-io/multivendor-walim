'use client';

import VendorOrdersHeader from '@/lib/ui/screen-components/protected/vendor/orders/header/screen-header';
import VendorOrdersMain from '@/lib/ui/screen-components/protected/vendor/orders/main';

/**
 * Orders section of the Vendor Dashboard — every order across the vendor's
 * stores. The Store Dashboard uses the store-scoped screen instead.
 */
const VendorOrdersScreen = () => {
  return (
    <div className="screen-container">
      <VendorOrdersHeader />
      <VendorOrdersMain />
    </div>
  );
};

export default VendorOrdersScreen;
