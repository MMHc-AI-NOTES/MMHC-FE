import { ReactNode } from 'react';

// Helper to determine text color based on gradient class
const getTextColor = (gradientClass: string): string => {
  // Light gradients need dark text, dark gradients need white text
  if (gradientClass.includes('review-cycle-1')) return 'text-cycle-1';

  if (gradientClass.includes('review-cycle-2')) return 'text-cycle-2';

  if (gradientClass.includes('review-cycle-3')) return 'text-cycle-3';

  if (
    gradientClass.includes('not-reviewed') ||
    gradientClass.includes('not-needed') ||
    gradientClass.includes('neutral') ||
    gradientClass.includes('blue') ||
    gradientClass.includes('indigo') ||
    gradientClass.includes('slate') ||
    gradientClass.includes('gray')
  ) {
    return 'text-gradient-light';
  }
  return 'text-gradient-dark';
};

interface GradientBadgeProps {
  label: string;
  gradient: string; // Now accepts CSS class name instead of gradient string
  icon?: ReactNode;
  className?: string;
  title?: string;
}

export const GradientBadge = ({ label, gradient, icon, className = '', title }: GradientBadgeProps) => {
  const textColor = getTextColor(gradient);
  return (
    <span
      title={title}
      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold tracking-widest ${gradient} ${textColor} ${className}`}
    >
      {icon && <span className="mr-2 flex-shrink-0 [&>svg]:!size-4">{icon}</span>}
      <span className="truncate">{label}</span>
    </span>
  );
};
