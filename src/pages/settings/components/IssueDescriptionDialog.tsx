import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';

interface IssueDescriptionFormValues {
  text: string;
}

interface IssueDescriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  editingDescription: { text: string; index?: number } | null;
}

const validationSchema = yup.object({
  text: yup.string().required('Description is required').min(1, 'Description cannot be empty'),
});

const IssueDescriptionDialog: React.FC<IssueDescriptionDialogProps> = ({ isOpen, onClose, onSave, editingDescription }) => {
  const formik = useFormik<IssueDescriptionFormValues>({
    initialValues: editingDescription || { text: '' },
    validationSchema,
    enableReinitialize: true,
    onSubmit: values => {
      onSave(values.text);
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
          <DialogTitle>{editingDescription ? 'Edit Issue Description' : 'Add Issue Description'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="issue-description-text">Description *</Label>
            <Textarea
              id="issue-description-text"
              name="text"
              value={formik.values.text}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter issue description"
              rows={4}
            />
            {formik.touched.text && formik.errors.text && <p className="mt-1 text-xs text-red-600">{formik.errors.text}</p>}
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

export default IssueDescriptionDialog;
