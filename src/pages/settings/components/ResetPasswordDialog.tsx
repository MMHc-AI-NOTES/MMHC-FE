import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import InputField from '@/shared/InputField';
import SharedButton from '@/shared/GenericButton';
import { updateUserPassword } from '@/pages/settings/settingsApiCalls';

interface ResetPasswordDialogProps {
  userId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
  showPassword?: boolean;
  showConfirmPassword?: boolean;
}

const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({ userId, open, onOpenChange }) => {
  const formik = useFormik<ResetPasswordFormValues>({
    initialValues: {
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false,
    },
    validationSchema: Yup.object({
      password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
    }),
    onSubmit: async values => {
      const ok = await updateUserPassword({
        user_id: userId,
        password: values.password,
        password_confirmation: values.confirmPassword,
      });
      if (ok) onOpenChange(false);
    },
  });

  useEffect(() => {
    if (!open) formik.resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="" className="p-0 md:min-w-md">
        <DialogHeader className="border-b p-6">
          <DialogTitle className="text-primary">Reset Password</DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="p-6">
          <div className="space-y-4">
            <InputField
              id="password"
              type={formik.values.showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="••••••••"
              formik={formik}
              icon={
                <button
                  type="button"
                  onClick={() => formik.setFieldValue('showPassword', !formik.values.showPassword)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {formik.values.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <InputField
              id="confirmPassword"
              type={formik.values.showConfirmPassword ? 'text' : 'password'}
              label="Confirm password"
              placeholder="••••••••"
              formik={formik}
              icon={
                <button
                  type="button"
                  onClick={() => formik.setFieldValue('showConfirmPassword', !formik.values.showConfirmPassword)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {formik.values.showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={formik.isSubmitting}>
              Cancel
            </Button>
            <SharedButton type="submit" isLoading={formik.isSubmitting}>
              Update Password
            </SharedButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;
