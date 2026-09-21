import { ChangeEvent} from 'react';
import { IGlobalComponentProps } from './global.interface';

export interface ICustomInputSwitchComponentProps
  extends IGlobalComponentProps {
  loading?: boolean;
  isActive: boolean;
  label?: string;
  reverse?: boolean;
  disabled?: boolean;
  disabledTitle?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}
