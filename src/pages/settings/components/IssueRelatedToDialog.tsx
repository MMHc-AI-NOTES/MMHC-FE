import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IssueRelatedTo, NoteTypeLabelsForFields } from '@/store/slices/smeConfigSlice';

interface IssueRelatedToDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (issue: { field_id: string; display_name: string; note_type?: string }) => void;
  editingIssue?: IssueRelatedTo | null;
}

interface IssueRelatedToFormValues {
  field_id: string;
  display_name: string;
  note_type: string;
}

const validationSchema = yup.object({
  field_id: yup.string().required('Field ID is required'),
  display_name: yup.string().required('Display name is required'),
  note_type: yup.string().required('Template is required'),
});

const IssueRelatedToDialog: React.FC<IssueRelatedToDialogProps> = ({ isOpen, onClose, onSave, editingIssue }) => {
  const formik = useFormik<IssueRelatedToFormValues>({
    initialValues: editingIssue
      ? { field_id: editingIssue.fieldId, display_name: editingIssue.displayName, note_type: editingIssue.noteType ?? '' }
      : { field_id: '', display_name: '', note_type: '' },
    validationSchema,
    enableReinitialize: true,
    onSubmit: values => {
      onSave({
        field_id: values.field_id,
        display_name: values.display_name,
        ...(values.note_type ? { note_type: values.note_type } : {}),
      });
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent aria-describedby="">
        <DialogHeader>
          <DialogTitle>{editingIssue ? 'Edit Issue Related To' : 'Add Issue Related To'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="issue-related-field-id">Field ID *</Label>
            <Input
              id="issue-related-field-id"
              name="field_id"
              value={formik.values.field_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g., general purpose"
            />
            {formik.touched.field_id && formik.errors.field_id && <p className="mt-1 text-xs text-red-600">{formik.errors.field_id}</p>}
          </div>
          <div>
            <Label htmlFor="issue-related-display-name">Display Name *</Label>
            <Input
              id="issue-related-display-name"
              name="display_name"
              value={formik.values.display_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g., General"
            />
            {formik.touched.display_name && formik.errors.display_name && (
              <p className="mt-1 text-xs text-red-600">{formik.errors.display_name}</p>
            )}
          </div>
          <div>
            <Label htmlFor="issue-related-note-type">Template *</Label>
            <Select value={formik.values.note_type} onValueChange={value => formik.setFieldValue('note_type', value)}>
              <SelectTrigger id="issue-related-note-type" className="mt-1 w-full">
                <SelectValue placeholder="Select the template this field belongs to" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(NoteTypeLabelsForFields).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.submitCount > 0 && formik.errors.note_type && <p className="mt-1 text-xs text-red-600">{formik.errors.note_type}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-light text-primary border-0" disabled={formik.isSubmitting}>
              <Save className="h-4 w-4" />
              {formik.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IssueRelatedToDialog;
