import { LucideIcon } from 'lucide-react';

interface HeaderProps {
  title: string;
  icon: LucideIcon;
}

const DashboardCardHeader = ({ title, icon: Icon }: HeaderProps) => {
  return (
    <div className="text-primary flex items-center gap-2 text-xl font-semibold">
      <Icon />
      <p>{title}</p>
    </div>
  );
};

export default DashboardCardHeader;
