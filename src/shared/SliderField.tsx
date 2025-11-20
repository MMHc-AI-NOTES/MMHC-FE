import React from 'react';
import { FormikProps } from 'formik';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface SliderFieldProps<T = any> {
  id: string;
  formik: FormikProps<T>;
  label: string;
  min: number;
  max: number;
  step: number;
  showSteps?: boolean;
  className?: string;
  valueFormatter?: (value: number) => string;
}

const SliderField: React.FC<SliderFieldProps> = ({
  id,
  formik,
  label,
  min,
  max,
  step,
  showSteps = true,
  className = '',
  valueFormatter,
}) => {
  const value = formik.values[id] as number;
  const errorMessage = formik.errors[id];

  // Format number to one decimal place
  const formatToOneDecimal = (num: number): string => {
    return Number(num.toFixed(1)).toString();
  };

  // Generate step markers
  const generateSteps = () => {
    if (!showSteps) return null;

    const steps = [];
    for (let i = min; i <= max; i += step) {
      steps.push(i);
    }

    return (
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        {steps.map(stepValue => (
          <span key={stepValue}>{formatToOneDecimal(stepValue)}</span>
        ))}
      </div>
    );
  };

  const displayValue = valueFormatter ? valueFormatter(value) : formatToOneDecimal(value);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <span className="rounded bg-gray-100 px-2 py-1 text-sm font-medium">{displayValue}</span>
      </div>

      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={newValue => formik.setFieldValue(id, newValue[0])}
        className="w-full"
      />

      {generateSteps()}

      {formik.touched[id] && typeof errorMessage === 'string' && <div className="mt-1 text-sm text-red-500">{errorMessage}</div>}
    </div>
  );
};

export default SliderField;
