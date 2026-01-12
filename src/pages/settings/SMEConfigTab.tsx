import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Link2, FileText } from 'lucide-react';
import {
  getStoredErrorTypes,
  getStoredIssueRelatedTo,
  getStoredIssueDescriptions,
  type ErrorType,
  type IssueRelatedTo,
  type IssueDescriptions,
} from '@/types/smeConfig';
import { showToast } from '@/lib/toast';
import ErrorTypesSection from './components/ErrorTypesSection';
import IssueRelatedToSection from './components/IssueRelatedToSection';
import IssueDescriptionsSection from './components/IssueDescriptionsSection';
// import { fetchSMEErrorTypes, fetchSMEIssueRelatedTo, fetchSMEIssueDescriptions } from './settingsApiCalls';

type SMETabType = 'error-types' | 'issue-related-to' | 'issue-descriptions';

const SME_TAB_STORAGE_KEY = 'sme_config_active_tab';

const smeTabs = [
  { id: 'error-types' as SMETabType, label: 'Error Types', icon: AlertCircle },
  { id: 'issue-related-to' as SMETabType, label: 'Issues Related To', icon: Link2 },
  { id: 'issue-descriptions' as SMETabType, label: 'Issue Descriptions', icon: FileText },
];

const SMEConfigTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SMETabType>(() => {
    if (typeof window !== 'undefined') {
      const persistedTab = localStorage.getItem(SME_TAB_STORAGE_KEY) as SMETabType | null;
      if (persistedTab && smeTabs.some(tab => tab.id === persistedTab)) {
        return persistedTab;
      }
    }
    return 'error-types';
  });

  const [errorTypes, setErrorTypes] = useState<ErrorType[]>([]);
  const [issueRelatedTo, setIssueRelatedTo] = useState<IssueRelatedTo[]>([]);
  const [issueDescriptions, setIssueDescriptions] = useState<IssueDescriptions>({
    critical: [],
    moderate: [],
    minor: [],
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
        // TODO: Uncomment when APIs are ready
        // const [errorTypesData, issueRelatedToData, issueDescriptionsData] = await Promise.all([
        //   fetchSMEErrorTypes(),
        //   fetchSMEIssueRelatedTo(),
        //   fetchSMEIssueDescriptions(),
        // ]);
        // setErrorTypes(errorTypesData);
        // setIssueRelatedTo(issueRelatedToData);
        // setIssueDescriptions(issueDescriptionsData);

        // Using localStorage for now
        setErrorTypes(getStoredErrorTypes());
        setIssueRelatedTo(getStoredIssueRelatedTo());
        setIssueDescriptions(getStoredIssueDescriptions());
      } catch (error) {
        console.error('Error loading SME config:', error);
        showToast.error('Failed to load SME configuration');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="py-8 text-center text-gray-500">Loading...</div>;
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
        {activeTab === 'error-types' && <ErrorTypesSection errorTypes={errorTypes} onUpdate={setErrorTypes} />}
        {activeTab === 'issue-related-to' && <IssueRelatedToSection issueRelatedTo={issueRelatedTo} onUpdate={setIssueRelatedTo} />}
        {activeTab === 'issue-descriptions' && (
          <IssueDescriptionsSection issueDescriptions={issueDescriptions} onUpdate={setIssueDescriptions} />
        )}
      </div>
    </div>
  );
};

export default SMEConfigTab;
