import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';

interface IssueDescriptionFormValues {
  key: string;
  description: string;
}

interface IssueDescriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { key: string; description: string }) => void;
  editingDescription: { key: string; description: string } | null;
}

const MAX_LENGTH = 250;

const validationSchema = yup.object({
  key: yup
    .string()
    .required('Key is required')
    .min(1, 'Key cannot be empty')
    .max(MAX_LENGTH, `Key must be ${MAX_LENGTH} characters or less`),
  description: yup
    .string()
    .required('Description is required')
    .min(1, 'Description cannot be empty')
    .max(MAX_LENGTH, `Description must be ${MAX_LENGTH} characters or less`),
});

const generateKeyFromDescription = (description: string): string => {
  const key = description
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return key.slice(0, MAX_LENGTH);
};

const IssueDescriptionDialog: React.FC<IssueDescriptionDialogProps> = ({ isOpen, onClose, onSave, editingDescription }) => {
  const formik = useFormik<IssueDescriptionFormValues>({
    initialValues: editingDescription || { key: '', description: '' },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      await onSave(values);
      formik.resetForm();
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
          <DialogTitle>{editingDescription ? 'Edit Issue Description' : 'Add Issue Description'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="issue-description-key">Key *</Label>
            <Input
              id="issue-description-key"
              name="key"
              value={formik.values.key}
              readOnly
              onBlur={formik.handleBlur}
              disabled
              placeholder="e.g., plan_generic_continuity_only_test"
              maxLength={MAX_LENGTH}
            />
            {formik.touched.key && formik.errors.key && <p className="mt-1 text-xs text-red-600">{formik.errors.key}</p>}
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <Label htmlFor="issue-description-description">Description *</Label>
              <span className="text-muted-foreground text-xs">{MAX_LENGTH - formik.values.description.length}/250</span>
            </div>
            <Textarea
              id="issue-description-description"
              name="description"
              value={formik.values.description}
              onChange={e => {
                const value = e.target.value.slice(0, MAX_LENGTH);
                formik.setFieldValue('description', value);
                const generatedKey = generateKeyFromDescription(value);
                formik.setFieldValue('key', generatedKey);
              }}
              onBlur={formik.handleBlur}
              placeholder="e.g., Plan is generic or continuity-only"
              rows={4}
              maxLength={MAX_LENGTH}
            />
            {formik.touched.description && formik.errors.description && (
              <p className="mt-1 text-xs text-red-600">{formik.errors.description}</p>
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

export default IssueDescriptionDialog;
