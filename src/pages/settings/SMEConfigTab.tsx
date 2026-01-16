import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Link2, FileText } from 'lucide-react';
import { useAppSelector } from '@/store/store';
import { useDispatch } from 'react-redux';
import { setErrorTypes, setIssueRelatedTo, setIssueDescriptions } from '@/store/slices/smeConfigSlice';
import { fetchErrorTypes, fetchIssueRelatedTo, fetchIssueDescriptions } from './settingsApiCalls';
import ErrorTypesSection from './components/ErrorTypesSection';
import IssueRelatedToSection from './components/IssueRelatedToSection';
import IssueDescriptionsSection from './components/IssueDescriptionsSection';
import { Skeleton } from '@/components/ui/skeleton';

type SMETabType = 'error-types' | 'issue-related-to' | 'issue-descriptions';

const SME_TAB_STORAGE_KEY = 'sme_config_active_tab';

const smeTabs = [
  { id: 'error-types' as SMETabType, label: 'Error Types', icon: AlertCircle },
  { id: 'issue-related-to' as SMETabType, label: 'Issues Related To', icon: Link2 },
  { id: 'issue-descriptions' as SMETabType, label: 'Issue Descriptions', icon: FileText },
];

const SMEConfigTabSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-[56px] w-full rounded-md" />
        <Skeleton className="h-[56px] w-full rounded-md" />
        <Skeleton className="h-[56px] w-full rounded-md" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-48 rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
};

const SMEConfigTab: React.FC = () => {
  const dispatch = useDispatch();
  const { errorTypesLoaded, issueRelatedToLoaded, issueDescriptionsLoaded } = useAppSelector(state => state.smeConfig);
  const [activeTab, setActiveTab] = useState<SMETabType>(() => {
    if (typeof window !== 'undefined') {
      const persistedTab = localStorage.getItem(SME_TAB_STORAGE_KEY) as SMETabType | null;
      if (persistedTab && smeTabs.some(tab => tab.id === persistedTab)) {
        return persistedTab;
      }
    }
    return 'error-types';
  });
  const [loading, setLoading] = useState(true);

  // Persist tab changes to localStorage
  useEffect(() => {
    localStorage.setItem(SME_TAB_STORAGE_KEY, activeTab);
  }, [activeTab]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [errorTypes, issueRelatedTo, issueDescriptions] = await Promise.all([
          fetchErrorTypes(),
          fetchIssueRelatedTo(),
          fetchIssueDescriptions(),
        ]);

        dispatch(setErrorTypes(errorTypes));
        dispatch(setIssueRelatedTo(issueRelatedTo));
        dispatch(setIssueDescriptions(issueDescriptions));
      } catch (error) {
        console.error('Error loading SME config:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  if (loading && (!errorTypesLoaded || !issueRelatedToLoaded || !issueDescriptionsLoaded)) {
    return <SMEConfigTabSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Navigation Buttons */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {smeTabs.map(tab => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              variant={isActive ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 border-0 px-4 py-6 ${isActive ? 'bg-gradient-light text-primary' : 'bg-white'}`}
            >
              <IconComponent className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'error-types' && <ErrorTypesSection />}
        {activeTab === 'issue-related-to' && <IssueRelatedToSection />}
        {activeTab === 'issue-descriptions' && <IssueDescriptionsSection />}
      </div>
    </div>
  );
};

export default SMEConfigTab;
