import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Ban, UserCheck, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'View Notes Queue',
      icon: FileText,
      onClick: () => navigate('/notes-queue'),
      variant: 'default' as const,
    },
    {
      label: 'Blacklisted Notes',
      icon: Ban,
      onClick: () => navigate('/blacklisted-notes'),
      variant: 'outline' as const,
    },
    {
      label: 'Office Manager Review',
      icon: UserCheck,
      onClick: () => navigate('/manager-review'),
      variant: 'outline' as const,
    },
    {
      label: 'AI Logs & Feedback',
      icon: Bot,
      onClick: () => navigate('/ai-logs'),
      variant: 'outline' as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map(action => {
          const IconComponent = action.icon;
          return (
            <Button key={action.label} variant={action.variant} onClick={action.onClick} className="w-full justify-start">
              <IconComponent className="mr-2 h-4 w-4" />
              {action.label}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default QuickActions;
