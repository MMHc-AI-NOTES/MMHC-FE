import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { ErrorType } from '@/store/slices/smeConfigSlice';

interface ErrorTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (errorType: { name: string; display_name: string; points: number }) => void;
  editingErrorType: ErrorType | null;
}

interface ErrorTypeFormValues {
  name: string;
  display_name: string;
  points: number;
}

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  display_name: yup.string().required('Display name is required'),
  points: yup.number().required('Points is required').positive('Points must be positive').min(1, 'Points must be at least 1'),
});

const ErrorTypeDialog: React.FC<ErrorTypeDialogProps> = ({ isOpen, onClose, onSave, editingErrorType }) => {
  const formik = useFormik<ErrorTypeFormValues>({
    initialValues: editingErrorType
      ? {
          name: editingErrorType.name,
          display_name: editingErrorType.displayName,
          // Convert negative display value to positive for form (backend expects positive)
          points: editingErrorType.points < 0 ? Math.abs(editingErrorType.points) : editingErrorType.points,
        }
      : { name: '', display_name: '', points: 5 },
    validationSchema,
    enableReinitialize: true,
    onSubmit: values => {
      // Send positive value to backend (onSave will handle conversion if needed)
      onSave({ ...values, points: values.points });
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
          <DialogTitle>{editingErrorType ? 'Edit Error Type' : 'Add Error Type'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="error-type-name">Name *</Label>
            <Input
              id="error-type-name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g., critical pro"
            />
            {formik.touched.name && formik.errors.name && <p className="mt-1 text-xs text-red-600">{formik.errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="error-type-display-name">Display Name *</Label>
            <Input
              id="error-type-display-name"
              name="display_name"
              value={formik.values.display_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g., Critical (-25 pts)"
            />
            {formik.touched.display_name && formik.errors.display_name && (
              <p className="mt-1 text-xs text-red-600">{formik.errors.display_name}</p>
            )}
          </div>
          <div>
            <Label htmlFor="error-type-points">Points *</Label>
            <Input
              id="error-type-points"
              name="points"
              type="number"
              min="1"
              value={formik.values.points}
              onChange={formik.handleChange}
              onBlur={e => {
                const inputValue = e.target.value;
                if (inputValue === '' || parseFloat(inputValue) < 1) {
                  formik.setFieldValue('points', 5);
                }
                formik.handleBlur(e);
              }}
              placeholder="e.g., 25 (will display as -25)"
            />
            {formik.touched.points && formik.errors.points && <p className="mt-1 text-xs text-red-600">{formik.errors.points}</p>}
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

export default ErrorTypeDialog;
