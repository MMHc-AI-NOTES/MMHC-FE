import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Users, Zap } from 'lucide-react';
import NotificationsTab from './NotificationsTab';
import UserManagementTab from './UserManagementTab';
import AIModelPromptTab from './AIModelPromptTab';

type TabType = 'notifications' | 'user-management' | 'ai-model-prompt';

const tabs = [
  { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
  { id: 'user-management' as TabType, label: 'User Management', icon: Users },
  { id: 'ai-model-prompt' as TabType, label: 'AI Model & Prompt', icon: Zap },
];

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('notifications');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-card mx-[-1rem] mt-[-1rem] flex gap-2 overflow-auto border-b px-4">
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => setActiveTab(tab.id)}
              className={`text-md flex items-center gap-2 rounded-none border-b-2 px-4 py-6 ${
                isActive
                  ? 'border-primary-light text-primary'
                  : 'hover:text-primary hover:border-primary-light border-transparent text-gray-500'
              }`}
            >
              <IconComponent className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'user-management' && <UserManagementTab />}
        {activeTab === 'ai-model-prompt' && <AIModelPromptTab />}
      </div>
    </div>
  );
};

export default Settings;
