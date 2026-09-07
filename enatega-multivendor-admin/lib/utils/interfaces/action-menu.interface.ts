import { IGlobalComponentProps } from './global.interface';

export interface IActionMenuItem<T> extends IGlobalComponentProps {
  label: string;
  command?: (data?: T) => void;
  // Hides the entry for rows it does not apply to — e.g. a rider a vendor can
  // see but not manage. Omitted means always shown.
  isVisible?: (data: T) => boolean;
}

export interface IActionMenuProps<T> extends IGlobalComponentProps {
  items?: IActionMenuItem<T>[];
  data: T;
  isOpen?: boolean;
  onToggle?: () => void;
}
