import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';

interface IssueDescriptionFormValues {
  type: 'critical' | 'moderate' | 'minor';
  text: string;
}

interface IssueDescriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (type: 'critical' | 'moderate' | 'minor', text: string) => void;
  editingDescription: { type: 'critical' | 'moderate' | 'minor'; text: string; index?: number } | null;
}

const validationSchema = yup.object({
  type: yup.string().oneOf(['critical', 'moderate', 'minor'], 'Invalid error type').required('Error type is required'),
  text: yup.string().required('Description is required').min(1, 'Description cannot be empty'),
});

const IssueDescriptionDialog: React.FC<IssueDescriptionDialogProps> = ({ isOpen, onClose, onSave, editingDescription }) => {
  const formik = useFormik<IssueDescriptionFormValues>({
    initialValues: editingDescription || { type: 'critical', text: '' },
    validationSchema,
    enableReinitialize: true,
    onSubmit: values => {
      onSave(values.type, values.text);
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
            <Label htmlFor="issue-description-type">Error Type *</Label>
            <Select
              value={formik.values.type}
              onValueChange={value => formik.setFieldValue('type', value as 'critical' | 'moderate' | 'minor')}
            >
              <SelectTrigger id="issue-description-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
              </SelectContent>
            </Select>
            {formik.touched.type && formik.errors.type && <p className="mt-1 text-xs text-red-600">{formik.errors.type}</p>}
          </div>
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
