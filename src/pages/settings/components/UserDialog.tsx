import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Save } from 'lucide-react';
import { User, CreateUserRequest, UserRole } from '@/types/settings';
import { UserRoleEnum, UserRoleLabels } from '@/constants/common';
import InputField from '@/shared/InputField';
import ConfirmationDialog from '@/shared/ConfirmationDialog';

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: User | null;
  onSave: (user: CreateUserRequest) => Promise<void>;
}

interface UserFormValues {
  fullName: string;
  email: string;
  type: UserRole;
  isActive: boolean;
}

const userValidationSchema = yup.object({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email('Please enter a valid email address').required('Email address is required'),
  type: yup.string().required('Role is required'),
  isActive: yup.boolean().required(),
});

const UserDialog: React.FC<UserDialogProps> = ({ isOpen, onClose, editingUser, onSave }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<UserFormValues | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const roleLabel = pendingValues ? UserRoleLabels[pendingValues.type] : '';

  const formik = useFormik<UserFormValues>({
    initialValues: {
      fullName: editingUser?.fullName || '',
      email: editingUser?.email || '',
      type: editingUser?.type || UserRoleEnum.practitioner,
      isActive: editingUser?.isActive ?? true,
    },
    validationSchema: userValidationSchema,
    onSubmit: async values => {
      // For edits, ask confirmation (same flow as table updates)
      if (editingUser) {
        setPendingValues(values);
        setConfirmOpen(true);
        return;
      }

      await onSave(values);
      onClose();
    },
  });

  useEffect(() => {
    if (editingUser) {
      formik.setValues({
        fullName: editingUser.fullName,
        email: editingUser.email,
        type: editingUser.type,
        isActive: editingUser.isActive,
      });
    } else {
      formik.resetForm({
        values: { fullName: '', email: '', type: UserRoleEnum.practitioner, isActive: true },
      });
    }
    setConfirmOpen(false);
    setPendingValues(null);
    setConfirmLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingUser, isOpen]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent aria-describedby="" className="max-h-[90vh] overflow-y-auto p-0 md:min-w-md">
          <DialogHeader className="border-b p-6">
            <DialogTitle className="text-primary">{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={formik.handleSubmit}>
            <div className="mb-4 space-y-4 px-6">
              <InputField id="fullName" placeholder="Enter full name" formik={formik} label="Full Name" />

              <InputField id="email" type="email" placeholder="email@example.com" formik={formik} label="Email Address" />

              <div className="space-y-2">
                <Label htmlFor="type">Role</Label>
                <Select
                  value={formik.values.type.toString()}
                  onValueChange={(value: string) => formik.setFieldValue('type', Number(value) as UserRole)}
                >
                  <SelectTrigger className="mt-1 h-11! w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRoleEnum.superAdmin.toString()}>{UserRoleLabels[UserRoleEnum.superAdmin]}</SelectItem>
                    <SelectItem value={UserRoleEnum.user.toString()}>{UserRoleLabels[UserRoleEnum.user]}</SelectItem>
                    <SelectItem value={UserRoleEnum.practitioner.toString()}>{UserRoleLabels[UserRoleEnum.practitioner]}</SelectItem>
                    <SelectItem value={UserRoleEnum.sme_reviewer.toString()}>{UserRoleLabels[UserRoleEnum.sme_reviewer]}</SelectItem>
                  </SelectContent>
                </Select>
                {formik.touched.type && formik.errors.type && <div className="mt-1 text-sm text-red-500">{formik.errors.type as any}</div>}
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Status</Label>
                  <p className="text-sm text-gray-600">
                    {editingUser
                      ? formik.values.isActive
                        ? 'User is currently active.'
                        : 'User is currently inactive.'
                      : 'Set user as active or inactive.'}
                  </p>
                </div>
                <Switch checked={formik.values.isActive} onCheckedChange={checked => formik.setFieldValue('isActive', checked)} />
              </div>
            </div>
            <DialogFooter className="border-t p-4">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-light text-primary border-0 font-semibold shadow-sm"
                disabled={formik.isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" />
                {editingUser ? 'Save Changes' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={confirmOpen}
        isLoading={confirmLoading}
        onOpenChange={open => {
          setConfirmOpen(open);
          if (!open) {
            setPendingValues(null);
            setConfirmLoading(false);
          }
        }}
        onConfirm={async () => {
          if (!pendingValues) return;
          try {
            setConfirmLoading(true);
            await onSave(pendingValues);
            setConfirmOpen(false);
            setPendingValues(null);
            onClose();
          } finally {
            setConfirmLoading(false);
          }
        }}
        title="Update User"
        description={`Are you sure you want to update this user${roleLabel ? ` (Role: ${roleLabel})` : ''}?`}
        confirmButtonText="Update"
      />
    </>
  );
};

export default UserDialog;
