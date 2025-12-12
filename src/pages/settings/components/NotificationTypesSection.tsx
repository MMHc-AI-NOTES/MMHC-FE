import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { NotificationType } from '@/types/settings';

interface NotificationTypesSectionProps {
  notificationTypes: NotificationType[];
  onToggle: (id: string) => void;
}

const NotificationTypesSection: React.FC<NotificationTypesSectionProps> = ({ notificationTypes, onToggle }) => {
  return (
    <Card className="p-2">
      <CardContent className="p-6">
        <h3 className="text-primary mb-4 text-lg font-semibold">Notification Types</h3>
        <div className="space-y-4">
          {notificationTypes.map(type => (
            <div key={type.id} className="flex items-center justify-between border-b-2 py-3 last:border-b-0">
              <div className="flex-1">
                <p className="font-medium text-gray-700">{type.name}</p>
                <p className="text-sm text-gray-400">{type.description}</p>
              </div>
              <Switch checked={type.enabled} onCheckedChange={() => onToggle(type.id)} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationTypesSection;
