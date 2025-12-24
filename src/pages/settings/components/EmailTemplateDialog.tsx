import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { EmailTemplate, AvailableVariable } from '@/types/settings';
import VariableInsertButton from './VariableInsertButton';
import AvailableVariablesSection from './AvailableVariablesSection';
import { Separator } from '@/components/ui/separator';
import InputField from '@/shared/InputField';

interface EmailTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingTemplate: EmailTemplate | null;
  availableVariables: AvailableVariable[];
  onSave: (template: { name: string; subject: string; body: string; isActive: boolean }) => void;
}

interface EmailTemplateFormValues {
  name: string;
  subject: string;
  body: string;
  isActive: boolean;
}

const emailTemplateValidationSchema = yup.object({
  name: yup.string().required('Template name is required'),
  subject: yup.string().required('Subject line is required'),
  body: yup.string().required('Email body is required'),
  isActive: yup.boolean().required(),
});

const EmailTemplateDialog: React.FC<EmailTemplateDialogProps> = ({ isOpen, onClose, editingTemplate, availableVariables, onSave }) => {
  const [isSubjectPopoverOpen, setIsSubjectPopoverOpen] = useState(false);
  const [isBodyPopoverOpen, setIsBodyPopoverOpen] = useState(false);

  const formik = useFormik<EmailTemplateFormValues>({
    initialValues: {
      name: editingTemplate?.name || '',
      subject: editingTemplate?.subject || '',
      body: editingTemplate?.body || '',
      isActive: editingTemplate?.isActive ?? true,
    },
    validationSchema: emailTemplateValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      await onSave(values);
      onClose();
    },
  });

  useEffect(() => {
    if (editingTemplate) {
      formik.setValues({
        name: editingTemplate.name,
        subject: editingTemplate.subject,
        body: editingTemplate.body,
        isActive: editingTemplate.isActive,
      });
    } else {
      formik.resetForm({
        values: { name: '', subject: '', body: '', isActive: true },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTemplate, isOpen]);

  const handleInsertVariable = (variable: string, field: 'subject' | 'body') => {
    if (field === 'subject') {
      formik.setFieldValue('subject', formik.values.subject + variable);
    } else {
      formik.setFieldValue('body', formik.values.body + variable);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent aria-describedby="" className="max-h-[90vh] overflow-y-auto p-0 md:min-w-2xl">
        <DialogHeader className="border-b p-6">
          <DialogTitle className="text-primary">{editingTemplate ? 'Edit Email Template' : 'New Email Template'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-4 space-y-4 px-6">
            <InputField id="name" placeholder="e.g., Note Failed Alert" formik={formik} label="Template Name" />

            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <div className="relative mt-1">
                <input
                  id="subject"
                  name="subject"
                  placeholder="e.g., Note #{{note_id}} - Action Required"
                  value={formik.values.subject}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-11 w-full rounded-md border bg-white px-3 py-2 pr-20 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                />
                <div className="absolute top-1/2 right-2 -translate-y-1/2">
                  <VariableInsertButton
                    field="subject"
                    isOpen={isSubjectPopoverOpen}
                    onOpenChange={setIsSubjectPopoverOpen}
                    onInsert={handleInsertVariable}
                    availableVariables={availableVariables}
                  />
                </div>
              </div>
              {formik.touched.subject && formik.errors.subject && <div className="mt-1 text-sm text-red-500">{formik.errors.subject}</div>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-body">Email Body</Label>
              <div className="relative mt-1">
                <Textarea
                  id="email-body"
                  name="body"
                  placeholder="Enter email body..."
                  value={formik.values.body}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="min-h-[200px] pr-20"
                />
                <div className="absolute top-2 right-2">
                  <VariableInsertButton
                    field="body"
                    isOpen={isBodyPopoverOpen}
                    onOpenChange={setIsBodyPopoverOpen}
                    onInsert={handleInsertVariable}
                    availableVariables={availableVariables}
                  />
                </div>
              </div>
              {formik.touched.body && formik.errors.body && <div className="mt-1 text-sm text-red-500">{formik.errors.body}</div>}
            </div>

            <AvailableVariablesSection variables={availableVariables} />
            <Separator className="my-4" />

            <div className="flex justify-between">
              <div className="space-y-2">
                <Label>Status</Label>
                <p className="text-xs text-gray-500">Set template as active or inactive</p>
              </div>
              <Switch checked={formik.values.isActive} onCheckedChange={checked => formik.setFieldValue('isActive', checked)} />
            </div>
          </div>
          <DialogFooter className="border-t p-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-light text-primary border-0 font-semibold shadow-sm"
              disabled={formik.isSubmitting}
            >
              {editingTemplate ? 'Save Changes' : 'Create Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmailTemplateDialog;
