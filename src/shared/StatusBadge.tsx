interface StatusBadgeProps {
  status: 'pending';
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig = {
    pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
    completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
    'in-review': { label: 'In Review', className: 'bg-blue-100 text-blue-800' },
  };

  const config = statusConfig[status];

  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${config.className}`}>{config.label}</span>;
};
