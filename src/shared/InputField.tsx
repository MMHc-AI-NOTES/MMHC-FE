import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NavigateLink } from './Link';
import { cn } from '@/lib/utils';
import { FormikProps } from 'formik';

const InputField: React.FC<InputFieldProps> = ({
  id,
  type = 'text',
  placeholder,
  formik,
  label,
  labelExtraParams,
  disabled,
  value,
  icon,
  variant = 'default',
  className = '',
  inputClassName = '',
  readOnly = false,
}) => {
  const errorMessage = formik?.errors[id];

  const getInputClasses = () => {
    switch (variant) {
      case 'underline':
        return 'border-0 border-b border-input rounded-none focus-visible:ring-0 focus-visible:border-primary';
      case 'unstyled':
        return 'border-none shadow-none px-0 py-0 focus-visible:ring-0';
      default:
        return 'rounded-xl';
    }
  };

  return (
    <div className={cn(className)}>
      <div className="flex items-center justify-between">
        {label ? (
          <Label htmlFor={id} className="mb-2 block">
            {label}
          </Label>
        ) : null}
        {labelExtraParams ? (
          <NavigateLink to="/forgot-password" className="mb-2">
            Forgot password?
          </NavigateLink>
        ) : null}
      </div>
      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          {...formik?.getFieldProps(id)}
          value={value || formik?.values[id] || ''}
          className={cn(getInputClasses(), 'w-full', inputClassName)}
          disabled={formik?.isSubmitting || disabled}
          readOnly={readOnly}
        />
        {icon && <div className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-500">{icon}</div>}
      </div>
      {formik?.touched[id] && typeof errorMessage === 'string' ? <div className="mt-1 text-sm text-red-500">{errorMessage}</div> : null}
    </div>
  );
};

export default InputField;

export interface InputFieldProps<T = any> {
  id: string;
  type?: string;
  placeholder?: string;
  formik: FormikProps<T>;
  label?: string;
  labelExtraParams?: boolean;
  disabled?: boolean;
  value?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'underline' | 'unstyled';
  className?: string;
  inputClassName?: string;
  readOnly?: boolean;
}
