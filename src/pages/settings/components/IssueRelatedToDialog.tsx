import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { IssueRelatedTo } from '@/types/smeConfig';

interface IssueRelatedToDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (issue: IssueRelatedTo) => void;
  editingIssue: IssueRelatedTo | null;
}

const validationSchema = yup.object({
  id: yup.string().required('ID is required'),
  name: yup.string().required('Name is required'),
});

const IssueRelatedToDialog: React.FC<IssueRelatedToDialogProps> = ({ isOpen, onClose, onSave, editingIssue }) => {
  const formik = useFormik<IssueRelatedTo>({
    initialValues: editingIssue || { id: '', name: '' },
    validationSchema,
    enableReinitialize: true,
    onSubmit: values => {
      onSave(values);
      formik.resetForm();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingIssue ? 'Edit Issue Related To' : 'Add Issue Related To'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="issue-related-id">ID *</Label>
            <Input
              id="issue-related-id"
              name="id"
              value={formik.values.id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g., xyz-1"
            />
            {formik.touched.id && formik.errors.id && <p className="mt-1 text-xs text-red-600">{formik.errors.id}</p>}
          </div>
          <div>
            <Label htmlFor="issue-related-name">Name *</Label>
            <Input
              id="issue-related-name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g., Assessment & Therapeutic Intervention"
            />
            {formik.touched.name && formik.errors.name && <p className="mt-1 text-xs text-red-600">{formik.errors.name}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-light text-primary border-0">
              <Save className="h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IssueRelatedToDialog;
