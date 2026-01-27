import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Users, Zap, Columns3Cog } from 'lucide-react';
// import NotificationsTab from './NotificationsTab';
import UserManagementTab from './UserManagementTab';
import AIModelPromptTab from './AIModelPromptTab';
import SMEConfigTab from './SMEConfigTab';

type TabType = 'notifications' | 'user-management' | 'ai-model-prompt' | 'sme-config';

const SETTINGS_TAB_STORAGE_KEY = 'settings_active_tab';

const tabs = [
  // { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
  { id: 'user-management' as TabType, label: 'User Management', icon: Users },
  { id: 'ai-model-prompt' as TabType, label: 'AI Model & Prompt', icon: Zap },
  { id: 'sme-config' as TabType, label: 'SME Config', icon: Columns3Cog },
];

const Settings: React.FC = () => {
  // Initialize with persisted tab or default to 'notifications'
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window !== 'undefined') {
      const persistedTab = localStorage.getItem(SETTINGS_TAB_STORAGE_KEY) as TabType | null;
      if (persistedTab && tabs.some(tab => tab.id === persistedTab)) {
        return persistedTab;
      }
    }
    return 'notifications';
  });

  // Persist tab changes to localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_TAB_STORAGE_KEY, activeTab);
  }, [activeTab]);

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
        {/* {activeTab === 'notifications' && <NotificationsTab />} */}
        {activeTab === 'user-management' && <UserManagementTab />}
        {activeTab === 'ai-model-prompt' && <AIModelPromptTab />}
        {activeTab === 'sme-config' && <SMEConfigTab />}
      </div>
    </div>
  );
};

export default Settings;
