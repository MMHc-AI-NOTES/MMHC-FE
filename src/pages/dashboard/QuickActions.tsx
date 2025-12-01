import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      label: 'View Notes Queue',
      variant: 'default' as const,
    },
    {
      label: 'Practitioner Review Queue',
      variant: 'outline' as const,
    },
    {
      label: 'Blacklisted Notes',
      variant: 'outline' as const,
    },
    {
      label: 'Office Manager Review',
      variant: 'outline' as const,
    },
    {
      label: 'Model Versions & Drift History',
      variant: 'ghost' as const,
    },
    {
      label: 'AI Logs & Feedback',
      variant: 'ghost' as const,
    },
  ];

  return (
    <Card className="gap-2">
      <CardHeader>
        <CardTitle className="text-primary text-xl">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map(action => (
          <Button
            key={action.label}
            variant={action.variant}
            size="lg"
            className={`w-full justify-between rounded-lg text-sm font-medium transition-all ${
              action.variant === 'default'
                ? 'bg-primary-light text-primary hover:bg-primary-light/90 shadow-sm'
                : action.variant === 'outline'
                  ? 'border-primary border-2 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  : 'text-primary hover:bg-primary/10 hover:text-primary'
            }`}
          >
            <span>{action.label}</span>
            <ArrowRight className="text-primary h-4 w-4" />
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickActions;
