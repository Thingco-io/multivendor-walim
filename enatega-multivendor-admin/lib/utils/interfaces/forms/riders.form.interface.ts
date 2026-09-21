import { IDropdownSelectItem } from '../global.interface';

export interface IRiderForm {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
  zone: IDropdownSelectItem | null;
  phone: number | null;
  vehicleType: IDropdownSelectItem | null;
  // Vendor that owns the rider. Only the super admin picks this — an empty
  // `code` means a platform rider with no vendor.
  vendor?: IDropdownSelectItem | null;
  // Vendor-managed riders: the stores this rider may serve.
  assignedStores?: IDropdownSelectItem[];
}

export interface IRiderErrors {
  name: string[];
  username: string[];
  password: string[];
  confirmPassword: string[];
  zone: string[];
  phone: string[];
  vehicleType: string[];
  vendor?: string[];
  assignedStores?: string[];
}
