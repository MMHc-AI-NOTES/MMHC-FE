import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bell, Info, Send } from 'lucide-react';
import { DeliveryChannel } from '@/types/settings';

interface DeliveryChannelsSectionProps {
  deliveryChannels: DeliveryChannel[];
  onToggle: (id: string) => void;
}

const DeliveryChannelsSection: React.FC<DeliveryChannelsSectionProps> = ({ deliveryChannels, onToggle }) => {
  const getChannelIcon = (iconName: string) => {
    switch (iconName) {
      case 'mail':
        return <Bell className="h-5 w-5" />;
      case 'message':
        return <Send className="h-5 w-5" />;
      case 'bell':
        return <Info className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <Card className="p-2">
      <CardContent className="p-6">
        <h3 className="text-primary mb-4 text-lg font-semibold">Delivery Channels</h3>
        <div className="space-y-4">
          {deliveryChannels.map(channel => (
            <div key={channel.id} className="flex items-center justify-between border-b-2 py-3 last:border-b-0">
              <div className="flex flex-1 items-center gap-3">
                {getChannelIcon(channel.icon)}
                <div>
                  <p className="font-medium text-gray-700">{channel.name}</p>
                  <p className="text-sm text-gray-400">{channel.description}</p>
                </div>
              </div>
              <Switch checked={channel.enabled} onCheckedChange={() => onToggle(channel.id)} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryChannelsSection;
