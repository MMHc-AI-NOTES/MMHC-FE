import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { ErrorType } from '@/types/smeConfig';

interface ErrorTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (errorType: ErrorType) => void;
  editingErrorType: ErrorType | null;
}

const validationSchema = yup.object({
  value: yup.string().required('Value is required'),
  label: yup.string().required('Label is required'),
  points: yup.number().required('Points is required').negative('Points must be negative').max(-1, 'Points must be negative'),
});

const ErrorTypeDialog: React.FC<ErrorTypeDialogProps> = ({ isOpen, onClose, onSave, editingErrorType }) => {
  const formik = useFormik<ErrorType>({
    initialValues: editingErrorType || { value: '', label: '', points: -5 },
    validationSchema,
    enableReinitialize: true,
    onSubmit: values => {
      // Ensure points are always negative
      const points = values.points > 0 ? -values.points : values.points;
      onSave({ ...values, points });
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
          <DialogTitle>{editingErrorType ? 'Edit Error Type' : 'Add Error Type'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="error-type-value">Value *</Label>
            <Input
              id="error-type-value"
              name="value"
              value={formik.values.value}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g., critical"
            />
            {formik.touched.value && formik.errors.value && <p className="mt-1 text-xs text-red-600">{formik.errors.value}</p>}
          </div>
          <div>
            <Label htmlFor="error-type-label">Label *</Label>
            <Input
              id="error-type-label"
              name="label"
              value={formik.values.label}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g., Critical (-25 pts)"
            />
            {formik.touched.label && formik.errors.label && <p className="mt-1 text-xs text-red-600">{formik.errors.label}</p>}
          </div>
          <div>
            <Label htmlFor="error-type-points">Points *</Label>
            <Input
              id="error-type-points"
              name="points"
              type="number"
              value={formik.values.points}
              onChange={e => {
                const inputValue = e.target.value;
                // Allow empty string or just minus sign for user input
                if (inputValue === '' || inputValue === '-') {
                  formik.setFieldValue('points', inputValue);
                  return;
                }
                const numValue = parseFloat(inputValue);
                if (!isNaN(numValue)) {
                  // Automatically convert positive numbers to negative
                  const points = numValue > 0 ? -numValue : numValue;
                  formik.setFieldValue('points', points);
                }
              }}
              onBlur={e => {
                // Ensure points are negative on blur
                const inputValue = e.target.value;
                if (inputValue === '' || inputValue === '-') {
                  formik.setFieldValue('points', -5);
                } else {
                  const numValue = parseFloat(inputValue);
                  if (!isNaN(numValue)) {
                    const points = numValue > 0 ? -numValue : numValue === 0 ? -5 : numValue;
                    formik.setFieldValue('points', points);
                  }
                }
                formik.handleBlur(e);
              }}
              placeholder="e.g., -25"
            />
            {formik.touched.points && formik.errors.points && <p className="mt-1 text-xs text-red-600">{formik.errors.points}</p>}
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

export default ErrorTypeDialog;
