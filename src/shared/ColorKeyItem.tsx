interface ColorKeyItemProps {
  label: string;
  gradient: string;
}

export const ColorKeyItem = ({ label, gradient }: ColorKeyItemProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-[12px] w-[16px] rounded ${gradient}`} />
      <span className="text-xs text-gray-700">{label}</span>
    </div>
  );
};
