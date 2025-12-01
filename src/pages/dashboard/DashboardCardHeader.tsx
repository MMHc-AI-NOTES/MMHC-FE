import { LucideIcon } from 'lucide-react';

interface HeaderProps {
  title: string;
  icon: LucideIcon;
  isIconBg?: boolean;
}

const DashboardCardHeader = ({ title, icon: Icon, isIconBg = false }: HeaderProps) => {
  return (
    <div className="text-primary flex items-center gap-2 text-xl font-semibold">
      {isIconBg ? (
        <div className="rounded-lg bg-green-50 p-2">
          <Icon />{' '}
        </div>
      ) : (
        <Icon />
      )}

      <p>{title}</p>
    </div>
  );
};

export default DashboardCardHeader;
