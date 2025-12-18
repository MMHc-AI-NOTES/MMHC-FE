import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  // ModelVersionLabels,
  // PromptAgentLabels,
  PractitionerRoleEnum,
  PractitionerRoleLabels,
  AuditModeEnum,
  AuditModeLabels,
} from '@/constants/common';
import { SessionMetadata, PractitionerDetails, AuditControls } from '@/types/noteSubmission';
import { Separator } from '@/components/ui/separator';

type AdvancedTab = 'session-metadata' | 'practitioner-details' | 'audit-controls';

interface AdvancedOptionsSectionProps {
  activeTab: AdvancedTab;
  setActiveTab: (tab: AdvancedTab) => void;
  sessionMetadata: SessionMetadata;
  setSessionMetadata: React.Dispatch<React.SetStateAction<SessionMetadata>>;
  practitionerDetails: PractitionerDetails;
  setPractitionerDetails: React.Dispatch<React.SetStateAction<PractitionerDetails>>;
  auditControls: AuditControls;
  setAuditControls: React.Dispatch<React.SetStateAction<AuditControls>>;
  selectedModelLabel: string;
  selectedAgentLabel: string;
}

const tabs: { id: AdvancedTab; label: string }[] = [
  { id: 'session-metadata', label: 'Session Metadata' },
  { id: 'practitioner-details', label: 'Practitioner Details' },
  { id: 'audit-controls', label: 'Audit Controls' },
];

const AdvancedOptionsSection: React.FC<AdvancedOptionsSectionProps> = ({
  activeTab,
  setActiveTab,
  sessionMetadata,
  setSessionMetadata,
  practitionerDetails,
  setPractitionerDetails,
  auditControls,
  setAuditControls,
  selectedModelLabel = 'Claude 3.5 Haiku v1',
  selectedAgentLabel = 'Prompt Agent',
}) => {
  return (
    <div className="rounded-xl bg-white py-6 shadow">
      <div className="px-6">
        <h3 className="text-primary mb-4 text-sm font-semibold">Advanced Options</h3>

        {/* Tab Navigation */}
        <div className="flex gap-1">
          {tabs.map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs ${activeTab === tab.id ? 'bg-primary hover:bg-primary font-semibold text-white' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
      <Separator className="mt-3 mb-4" />

      {/* Tab Content */}
      <div className="space-y-4 px-6">
        {activeTab === 'session-metadata' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="sessionLength" className="text-xs text-gray-600">
                Session Length (minutes)
              </Label>
              <Input
                id="sessionLength"
                placeholder="e.g., 60"
                value={sessionMetadata.sessionLength}
                onChange={e => setSessionMetadata(prev => ({ ...prev, sessionLength: e.target.value }))}
                className="bg-white"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="clientInitials" className="text-xs text-gray-600">
                Client Initials
              </Label>
              <Input
                id="clientInitials"
                placeholder="e.g., JD"
                value={sessionMetadata.clientInitials}
                onChange={e => setSessionMetadata(prev => ({ ...prev, clientInitials: e.target.value }))}
                className="bg-white"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="modelVersionDisplay" className="text-xs text-gray-600">
                Model Version
              </Label>
              <Input id="modelVersionDisplay" value={selectedModelLabel} disabled />
            </div>
            <div className="space-y-1">
              <Label htmlFor="promptAgentDisplay" className="text-xs text-gray-600">
                Prompt Agent
              </Label>
              <Input id="promptAgentDisplay" value={selectedAgentLabel} disabled />
            </div>
          </div>
        )}

        {activeTab === 'practitioner-details' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="practitionerName" className="text-xs text-gray-600">
                Practitioner Name
              </Label>
              <Input
                id="practitionerName"
                placeholder="e.g., Dr. Jane Smith"
                value={practitionerDetails.name}
                onChange={e => setPractitionerDetails(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="practitionerCredentials" className="text-xs text-gray-600">
                Practitioner Credentials
              </Label>
              <Input
                id="practitionerCredentials"
                placeholder="e.g., PhD, LCSW, LMFT"
                value={practitionerDetails.credentials}
                onChange={e => setPractitionerDetails(prev => ({ ...prev, credentials: e.target.value }))}
                className="bg-white"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="practitionerRole" className="text-xs text-gray-600">
                Practitioner Role
              </Label>
              <Select
                value={String(practitionerDetails.role)}
                onValueChange={value =>
                  setPractitionerDetails(prev => ({
                    ...prev,
                    role: Number(value) as typeof practitionerDetails.role,
                  }))
                }
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PractitionerRoleEnum).map(([key, value]) => (
                    <SelectItem key={key} value={String(value)}>
                      {PractitionerRoleLabels[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {activeTab === 'audit-controls' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="auditMode" className="text-xs text-gray-600">
                Audit Mode
              </Label>
              <Select
                value={String(auditControls.auditMode)}
                onValueChange={value =>
                  setAuditControls(prev => ({
                    ...prev,
                    auditMode: Number(value) as typeof auditControls.auditMode,
                  }))
                }
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select audit mode" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AuditModeEnum).map(([key, value]) => (
                    <SelectItem key={key} value={String(value)}>
                      {AuditModeLabels[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-md border bg-white px-3 py-2">
              <Label htmlFor="debugMode" className="text-sm text-gray-700">
                Enable Debug Mode
              </Label>
              <Switch
                id="debugMode"
                checked={auditControls.enableDebugMode}
                onCheckedChange={checked => setAuditControls(prev => ({ ...prev, enableDebugMode: checked }))}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border bg-white px-3 py-2">
              <Label htmlFor="tokenReport" className="text-sm text-gray-700">
                Include Token Usage Report
              </Label>
              <Switch
                id="tokenReport"
                checked={auditControls.includeTokenUsageReport}
                onCheckedChange={checked => setAuditControls(prev => ({ ...prev, includeTokenUsageReport: checked }))}
              />
            </div>
            <p className="text-xs text-gray-500">Debug tools are optional and do not affect scoring.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedOptionsSection;
