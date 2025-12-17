interface ColorKeyItemProps {
  label: string;
  gradient: string;
}

export const ColorKeyItem = ({ label, gradient }: ColorKeyItemProps) => {
  return (
    <div className="flex gap-2">
      <div className={`mt-0.5 h-[12px] w-[16px] rounded ${gradient}`} />
      <span className="text-xs text-gray-700">{label}</span>
    </div>
  );
};
