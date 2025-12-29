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

  // Determine decimals based on step (e.g., step=0.01 -> 2 decimals)
  const getDecimalPlaces = (s: number) => {
    if (s <= 0) return 2;
    const places = Math.max(0, Math.ceil(-Math.log10(s)));
    return places;
  };

  const formatNumber = (num: number) => {
    if (valueFormatter) return valueFormatter(num);
    const decimals = getDecimalPlaces(step);
    return Number(num.toFixed(decimals)).toString();
  };

  // Generate a compact set of tick markers (max 5) to avoid overlap
  const generateSteps = () => {
    if (!showSteps) return null;

    const maxTicks = 5;
    const range = max - min;
    const possibleSteps = Math.floor(range / step) + 1;

    const ticks: number[] = [];
    if (possibleSteps <= maxTicks) {
      // show all discrete steps
      for (let i = min; i <= max; i += step) {
        // avoid floating point accumulation errors
        ticks.push(Number(i.toFixed(8)));
      }
    } else {
      // show evenly spaced ticks (min, 25%, 50%, 75%, max)
      for (let i = 0; i < maxTicks; i++) {
        const ratio = i / (maxTicks - 1);
        ticks.push(Number((min + ratio * range).toFixed(8)));
      }
    }

    return (
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        {ticks.map(t => (
          <span key={t} className="whitespace-nowrap">
            {formatNumber(t)}
          </span>
        ))}
      </div>
    );
  };

  const displayValue = formatNumber(value as number);

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
