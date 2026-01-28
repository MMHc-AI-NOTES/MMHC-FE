import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, EyeOff, Loader2, MoreVertical } from 'lucide-react';
import { User } from '@/types/settings';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import InputField from '@/shared/InputField';
import SharedButton from '@/shared/GenericButton';
import { updateUserPassword } from '@/pages/settings/settingsApiCalls';

interface UserActionsDropdownProps {
  user: User;
  onEditUser: (user: User) => void;
  onResendInvite: (userId: string) => Promise<void>;
  disabled?: boolean;
}

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
  showPassword?: boolean;
  showConfirmPassword?: boolean;
}

const UserActionsDropdown: React.FC<UserActionsDropdownProps> = ({ user, onEditUser, onResendInvite, disabled }) => {
  const [resendLoading, setResendLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

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
        user_id: user.id,
        password: values.password,
        password_confirmation: values.confirmPassword,
      });
      if (ok) setResetOpen(false);
    },
  });

  useEffect(() => {
    if (!resetOpen) formik.resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetOpen]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={disabled || resendLoading || formik.isSubmitting}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 space-y-3">
          <DropdownMenuItem disabled={disabled} onClick={() => onEditUser(user)}>
            Edit User
          </DropdownMenuItem>
          <DropdownMenuItem disabled={disabled || formik.isSubmitting} onClick={() => setResetOpen(true)}>
            Reset Password
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={disabled || resendLoading || user.hasCompletedOnboarding}
            onClick={async () => {
              try {
                setResendLoading(true);
                await onResendInvite(String(user.id));
              } finally {
                setResendLoading(false);
              }
            }}
          >
            {resendLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {resendLoading ? 'Resending…' : 'Resend Invite'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
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
              <Button type="button" variant="outline" onClick={() => setResetOpen(false)} disabled={formik.isSubmitting}>
                Cancel
              </Button>
              <SharedButton type="submit" isLoading={formik.isSubmitting}>
                Update Password
              </SharedButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserActionsDropdown;
