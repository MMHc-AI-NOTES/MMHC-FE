import React, { useEffect } from 'react';
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
import InputField from '@/shared/InputField';

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: User | null;
  onSave: (user: CreateUserRequest) => Promise<void>;
}

interface UserFormValues {
  fullName: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
}

const userValidationSchema = yup.object({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email('Please enter a valid email address').required('Email address is required'),
  role: yup.string().required('Role is required'),
  status: yup.string().oneOf(['active', 'inactive']).required(),
});

const UserDialog: React.FC<UserDialogProps> = ({ isOpen, onClose, editingUser, onSave }) => {
  const formik = useFormik<UserFormValues>({
    initialValues: {
      fullName: editingUser?.fullName || '',
      email: editingUser?.email || '',
      role: editingUser?.role || 'Practitioner',
      status: editingUser?.status || 'active',
    },
    validationSchema: userValidationSchema,
    onSubmit: async values => {
      await onSave(values);
      onClose();
    },
  });

  useEffect(() => {
    if (editingUser) {
      formik.setValues({
        fullName: editingUser.fullName,
        email: editingUser.email,
        role: editingUser.role,
        status: editingUser.status,
      });
    } else {
      formik.resetForm({
        values: { fullName: '', email: '', role: 'Practitioner', status: 'active' },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingUser, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent aria-describedby="" className="max-h-[90vh] overflow-y-auto p-0 md:min-w-md">
        <DialogHeader className="border-b p-6">
          <DialogTitle className="text-primary">{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit}>
          <div className="space-y-4 px-6">
            <InputField id="fullName" placeholder="Enter full name" formik={formik} label="Full Name" />

            <InputField id="email" type="email" placeholder="email@example.com" formik={formik} label="Email Address" />

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formik.values.role} onValueChange={(value: UserRole) => formik.setFieldValue('role', value)}>
                <SelectTrigger className="mt-1 h-11! w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Super Admin">Super Admin</SelectItem>
                  <SelectItem value="Practitioner">Practitioner</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                </SelectContent>
              </Select>
              {formik.touched.role && formik.errors.role && <div className="mt-1 text-sm text-red-500">{formik.errors.role}</div>}
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <div>
                <Label>Status</Label>
                <p className="text-sm text-gray-600">Set user as active or inactive</p>
              </div>
              <Switch
                checked={formik.values.status === 'active'}
                onCheckedChange={checked => formik.setFieldValue('status', checked ? 'active' : 'inactive')}
              />
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
  );
};

export default UserDialog;
