import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { NotificationType, DeliveryChannel, EmailTemplate } from '@/types/settings';
import NotificationTypesSection from './components/NotificationTypesSection';
import DeliveryChannelsSection from './components/DeliveryChannelsSection';
import EmailTemplatesSection from './components/EmailTemplatesSection';
import EmailTemplateDialog from './components/EmailTemplateDialog';
import { AVAILABLE_VARIABLES } from './constants';

interface NotificationsTabProps {
  // For future API integration
  onSaveSettings?: (settings: any) => Promise<void>;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({ onSaveSettings }) => {
  // Dummy data - will be replaced with API calls
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([
    { id: 'note_failed', name: 'Note Failed', description: 'When a note fails AI audit', enabled: true },
    { id: 'note_passed', name: 'Note Passed', description: 'When a note passes AI audit', enabled: true },
    {
      id: 'returned_to_practitioner',
      name: 'Returned to Practitioner',
      description: 'When a note is sent back for corrections',
      enabled: true,
    },
    { id: 'escalated_to_manager', name: 'Escalated to Manager', description: 'When a note requires manager review', enabled: true },
    { id: 'blacklisted', name: 'Blacklisted', description: 'When a note is blacklisted for critical issues', enabled: true },
    { id: 'system_alerts', name: 'System Alerts', description: 'Important system notifications and updates', enabled: true },
    { id: 'monthly_summary', name: 'Monthly Summary Reports', description: 'Monthly performance and compliance summaries', enabled: true },
  ]);

  const [deliveryChannels, setDeliveryChannels] = useState<DeliveryChannel[]>([
    { id: 'email', name: 'Email', description: 'Send notifications via email', icon: 'mail', enabled: true },
    { id: 'sms', name: 'SMS', description: 'Send urgent alerts via text message', icon: 'message', enabled: false },
    { id: 'in_app', name: 'In-app Alerts', description: 'Show notifications within the application', icon: 'bell', enabled: true },
  ]);

  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Note Failed Alert',
      subject: 'Note #{{note_id}} Failed AI Audit',
      body: 'Hi {{practitioner_name}},\n\nThis is a notification regarding Note #{{note_id}}.\n\nAI Score: {{ai_score}}\nIssues Found:\n{{issues_list}}\n\nDate: {{date}}',
      lastModified: 'Feb 10, 2025',
      isActive: true,
    },
    {
      id: '2',
      name: 'Note Passed Alert',
      subject: 'Note #{{note_id}} Passed - No Action Needed',
      body: 'Hi {{practitioner_name}},\n\nNote #{{note_id}} has passed the AI audit successfully.\n\nDate: {{date}}',
      lastModified: 'Feb 10, 2025',
      isActive: true,
    },
    {
      id: '3',
      name: 'Manager Escalation',
      subject: 'Note #{{note_id}} Escalated for Review',
      body: 'Hi,\n\nNote #{{note_id}} from {{practitioner_name}} has been escalated for manager review.\n\nDate: {{date}}',
      lastModified: 'Feb 9, 2025',
      isActive: true,
    },
  ]);

  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  const handleNotificationTypeToggle = (id: string) => {
    setNotificationTypes(prev => prev.map(type => (type.id === id ? { ...type, enabled: !type.enabled } : type)));
  };

  const handleDeliveryChannelToggle = (id: string) => {
    setDeliveryChannels(prev => prev.map(channel => (channel.id === id ? { ...channel, enabled: !channel.enabled } : channel)));
  };

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setIsTemplateDialogOpen(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsTemplateDialogOpen(true);
  };

  const handleSaveTemplate = (templateForm: { name: string; subject: string; body: string; isActive: boolean }) => {
    if (editingTemplate) {
      setEmailTemplates(prev =>
        prev.map(template =>
          template.id === editingTemplate.id
            ? {
                ...template,
                ...templateForm,
                lastModified: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              }
            : template,
        ),
      );
    } else {
      const newTemplate: EmailTemplate = {
        id: Date.now().toString(),
        ...templateForm,
        lastModified: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      setEmailTemplates(prev => [...prev, newTemplate]);
    }
    setEditingTemplate(null);
  };

  const handleSaveSettings = async () => {
    const settings = { notificationTypes, deliveryChannels, emailTemplates };
    if (onSaveSettings) {
      await onSaveSettings(settings);
    } else {
      // For now, just log - will be replaced with API call
      console.log('Saving settings:', settings);
    }
  };

  const handleCloseDialog = () => {
    setIsTemplateDialogOpen(false);
    setEditingTemplate(null);
  };

  return (
    <div className="space-y-6">
      <NotificationTypesSection notificationTypes={notificationTypes} onToggle={handleNotificationTypeToggle} />

      <DeliveryChannelsSection deliveryChannels={deliveryChannels} onToggle={handleDeliveryChannelToggle} />

      <EmailTemplatesSection
        emailTemplates={emailTemplates}
        availableVariables={AVAILABLE_VARIABLES}
        onAddTemplate={handleAddTemplate}
        onEditTemplate={handleEditTemplate}
      />

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} size="lg" className="bg-gradient-light text-primary border-0 font-semibold shadow-sm">
          <Save />
          Save Notification Settings
        </Button>
      </div>

      <EmailTemplateDialog
        isOpen={isTemplateDialogOpen}
        onClose={handleCloseDialog}
        editingTemplate={editingTemplate}
        availableVariables={AVAILABLE_VARIABLES}
        onSave={handleSaveTemplate}
      />
    </div>
  );
};

export default NotificationsTab;
