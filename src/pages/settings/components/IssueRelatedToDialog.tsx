import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { IssueRelatedTo } from '@/store/slices/smeConfigSlice';

interface IssueRelatedToDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (issue: { field_id: string; display_name: string }) => void;
  editingIssue: IssueRelatedTo | null;
}

interface IssueRelatedToFormValues {
  field_id: string;
  display_name: string;
}

const validationSchema = yup.object({
  field_id: yup.string().required('Field ID is required'),
  display_name: yup.string().required('Display name is required'),
});

const IssueRelatedToDialog: React.FC<IssueRelatedToDialogProps> = ({ isOpen, onClose, onSave, editingIssue }) => {
  const formik = useFormik<IssueRelatedToFormValues>({
    initialValues: editingIssue
      ? { field_id: editingIssue.fieldId, display_name: editingIssue.displayName }
      : { field_id: '', display_name: '' },
    validationSchema,
    enableReinitialize: true,
    onSubmit: values => {
      onSave(values);
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
