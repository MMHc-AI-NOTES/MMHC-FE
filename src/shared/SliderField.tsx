import React, { useMemo, useEffect, useRef } from 'react';
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

  // Generate a compact set of tick markers to avoid overlap
  const generateSteps = () => {
    if (!showSteps) return null;

    const maxTicks = 11; // Increased to 11 to accommodate common cases like 0-1 with step 0.1
    const range = max - min;
    const possibleSteps = Math.floor(range / step) + 1;

    const ticks: number[] = [];
    if (possibleSteps <= maxTicks) {
      // show all discrete steps
      let current = min;
      while (current <= max + step / 1000) {
        // avoid floating point accumulation errors
        const rounded = Number(current.toFixed(8));
        if (rounded <= max) {
          ticks.push(rounded);
        }
        current += step;
      }
      // Ensure max is always included
      if (ticks.length === 0 || ticks[ticks.length - 1] < max) {
        ticks.push(max);
      }
    } else {
      // show evenly spaced ticks, but round to nearest step value
      for (let i = 0; i < maxTicks; i++) {
        const ratio = i / (maxTicks - 1);
        const rawValue = min + ratio * range;
        // Round to nearest step value
        const roundedValue = Math.round(rawValue / step) * step;
        // Clamp to min/max bounds
        const clampedValue = Math.max(min, Math.min(max, roundedValue));
        ticks.push(Number(clampedValue.toFixed(8)));
      }
    }

    // Remove duplicates and sort
    const uniqueTicks = Array.from(new Set(ticks)).sort((a, b) => a - b);

    return (
      <div className="mt-2 flex justify-between px-1 text-xs text-gray-500">
        {uniqueTicks.map(t => (
          <span key={t} className="whitespace-nowrap">
            {formatNumber(t)}
          </span>
        ))}
      </div>
    );
  };

  // Ensure value is within bounds and properly rounded to step
  // Use useMemo to ensure consistent calculation
  const finalValue = useMemo(() => {
    const numValue = value as number;
    if (isNaN(numValue) || numValue === null || numValue === undefined) {
      return min;
    }
    const clampedValue = Math.max(min, Math.min(max, numValue));
    // Round to nearest step with proper handling of floating point
    const roundedValue = Math.round(clampedValue / step) * step;
    // Ensure we don't exceed bounds due to rounding
    const boundedValue = Math.max(min, Math.min(max, roundedValue));
    return Number(boundedValue.toFixed(getDecimalPlaces(step)));
  }, [value, min, max, step]);

  // Use the rounded value for display to ensure consistency
  const displayValue = formatNumber(finalValue);

  // Sync formik value to rounded value if they don't match (but avoid infinite loops)
  const isUpdatingRef = useRef(false);
  const lastSyncedValueRef = useRef<number | null>(null);

  useEffect(() => {
    if (isUpdatingRef.current) {
      isUpdatingRef.current = false;
      return;
    }

    const currentValue = value as number;
    const tolerance = step / 10000; // Very small tolerance to account for floating point errors

    // Only sync if value changed and doesn't match rounded value, and we haven't synced this value before
    if (lastSyncedValueRef.current !== currentValue && Math.abs(currentValue - finalValue) > tolerance) {
      isUpdatingRef.current = true;
      lastSyncedValueRef.current = finalValue;
      formik.setFieldValue(id, finalValue, false);
    }
  }, [id, value, finalValue, step, formik]);

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
        value={[finalValue]}
        onValueChange={newValue => {
          const rounded = Math.round(newValue[0] / step) * step;
          const clamped = Math.max(min, Math.min(max, rounded));
          const normalizedValue = Number(clamped.toFixed(getDecimalPlaces(step)));
          formik.setFieldValue(id, normalizedValue);
        }}
        className="w-full"
      />

      {generateSteps()}

      {formik.touched[id] && typeof errorMessage === 'string' && <div className="mt-1 text-sm text-red-500">{errorMessage}</div>}
    </div>
  );
};

export default SliderField;
