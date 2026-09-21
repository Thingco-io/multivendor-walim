import { ICustomInputSwitchComponentProps } from '@/lib/utils/interfaces';
import CustomLoader from '../custom-progress-indicator';

export default function CustomInputSwitch({
  loading,
  isActive,
  label,
  onChange,
  reverse = false,
  disabled = false,
  disabledTitle,
  className
}: ICustomInputSwitchComponentProps) {
  return loading ? (
    <div className="ml-4">
      <CustomLoader size="14.7px" />
    </div>
  ) : (
    <label
      title={disabled ? disabledTitle : undefined}
      className={`ml-2 flex flex-shrink-0 items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <div className="relative">
        <div
          className={`flex items-center gap-2 ${reverse && 'flex-row-reverse'}`}
        >
          <label
            className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <input
              type="checkbox"
              className="peer sr-only"
              checked={isActive}
              disabled={disabled}
              onChange={onChange}
            />
            <div className="peer h-4 w-8 rounded-full bg-gray-300 peer-checked:bg-primary-color peer-focus:outline-none peer-disabled:opacity-40 dark:bg-gray-700"></div>
            <div className="absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-gray-50 transition-transform peer-checked:translate-x-4 peer-disabled:opacity-40"></div>
          </label>
          {label && <span className="ml-2">{label}</span>}
        </div>
      </div>
    </label>
  );
}
