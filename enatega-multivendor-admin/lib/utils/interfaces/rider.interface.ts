// Interfaces
import { TSideBarFormPosition } from '../types/sidebar';
import { IGlobalComponentProps } from './global.interface';

export interface IRiderResponseZone {
  __typename: 'Zone';
  _id: string;
  title: string;
}

// Store a rider is assigned to. A rider only ever receives delivery
// opportunities from the stores listed here.
export interface IRiderStore {
  __typename?: 'RiderStore';
  _id: string;
  name: string;
  image?: string;
  address?: string;
  slug?: string;
}

export interface IRiderVendor {
  __typename?: 'RiderVendor';
  _id: string;
  name?: string;
  email?: string;
}

export interface IRiderResponse {
  __typename: 'Rider';
  _id: string;
  name: string;
  username: string;
  phone: string;
  available: boolean;
  isActive?: boolean;
  vehicleType: string;
  assigned: string[];
  zone: IRiderResponseZone | null;
  vendor?: IRiderVendor | null;
  assignedStores?: IRiderStore[];
  ratingAverage?: number;
  ratingCount?: number;
}

export interface ISingleRiderResponse {
  __typename: 'Rider';
  _id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  available: boolean;
  isActive?: boolean;
  assigned: string[];
  zone: IRiderResponseZone | null;
  vendor?: IRiderVendor | null;
  assignedStores?: IRiderStore[];
  ratingAverage?: number;
  ratingCount?: number;
  bussinessDetails: IBusinessDetails;
  licenseDetails: ILicenseDetails;
  vehicleDetails: IVehicleDetails;
}

export interface IBusinessDetails {
  bankName: string;
  accountName: string;
  accountCode: string;
  accountNumber: number;
  businessRegNo: number;
  companyRegNo: number;
  taxRate: number;
}

export interface ILicenseDetails {
  number: string;
  expiryDate: string; // ISO date string (e.g., "2024-12-31T00:00:00Z")
  image: string;
}

export interface IVehicleDetails {
  number: string;
  image: string;
}

// Define the structure of the query result object
export interface IRidersDataResponse {
  riders: IRiderResponse[];
}

export interface IRidersPaginatedDataResponse {
  ridersPaginated: {
    data: IRiderResponse[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface IRiderDetailDataResponse {
  rider: ISingleRiderResponse;
}

export interface IRidersHeaderComponentsProps extends IGlobalComponentProps {
  setIsAddRiderVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface IRidersMainComponentsProps extends IGlobalComponentProps {
  setIsAddRiderVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setRider: React.Dispatch<React.SetStateAction<IRiderResponse | null>>;
}

export interface IRidersAddFormComponentProps extends IGlobalComponentProps {
  position?: TSideBarFormPosition;
  isAddRiderVisible: boolean;
  onHide: () => void;
  rider: IRiderResponse | null;
}

export interface IRiderHeaderProps extends IGlobalComponentProps {
  setIsAddRiderVisible: (visible: boolean) => void;
}
export interface IRidersTableHeaderProps {
  globalFilterValue: string;
  onGlobalFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export interface IRiderReponse {
  _id: string;
  name: string;
  username: string;
  phone: string;
  available: boolean;
  zone: {
    _id: string;
    title: string;
    __typename: 'Zone';
  } | null;
  __typename: 'Rider';
}

export interface IRidersResponseGraphQL {
  riders: IRiderReponse[];
}

export interface IRiderDetailsProps {
  loading: boolean;
  rider: ISingleRiderResponse | undefined;
}


export interface IVendorRidersPaginatedResponse {
  vendorRidersPaginated: {
    data: IRiderResponse[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface IRidersByStoreResponse {
  ridersByStore: IRiderResponse[];
}

// Customer feedback for a delivery rider — kept separate from the
// restaurant/order review so rider performance is tracked on its own.
export interface IRiderReview {
  __typename?: 'RiderReview';
  _id: string;
  rating: number;
  description?: string | null;
  comments?: string | null;
  createdAt: string;
  rider: {
    _id: string;
    name: string;
    username?: string;
    ratingAverage?: number;
    ratingCount?: number;
  } | null;
  restaurant: { _id: string; name: string; image?: string | null } | null;
  order: { _id: string; orderId: string; deliveredAt?: string | null } | null;
}

export interface IRiderReviewsPaginatedResponse {
  riderReviewsPaginated: {
    data: IRiderReview[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface IRiderRatingSummaryResponse {
  riderRatingSummary: {
    riderId: string;
    total: number;
    average: number;
    breakdown: { stars: number; count: number }[];
  };
}
