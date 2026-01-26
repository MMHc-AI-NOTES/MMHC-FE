import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAppSelector } from '@/store/store';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import InputField from '@/shared/InputField';
import SharedButton from '@/shared/GenericButton';
import { Eye, EyeOff } from 'lucide-react';
import { updateProfile, updatePassword } from './profileApiCalls';

interface GeneralFormValues {
  fullName: string;
  email: string;
}

interface PasswordFormValues {
  currentPassword: string;
  password: string;
  confirmPassword: string;
  showCurrentPassword: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
}

const generalValidationSchema = yup.object({
  fullName: yup.string().min(2, 'Full name must be at least 2 characters').required('Full name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
});

const passwordValidationSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const Profile = () => {
  const user = useAppSelector(state => state.auth.user);
  const [activeTab, setActiveTab] = useState('general');

  const generalFormik = useFormik<GeneralFormValues>({
    initialValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
    },
    validationSchema: generalValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      if (user?.id) {
        await updateProfile(
          {
            fullName: values.fullName,
            email: values.email,
          },
          user.id,
        );
      }
    },
  });

  const passwordFormik = useFormik<PasswordFormValues>({
    initialValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
      showCurrentPassword: false,
      showPassword: false,
      showConfirmPassword: false,
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async values => {
      if (user?.id) {
        const success = await updatePassword({
          user_id: user.id,
          current_password: values.currentPassword,
          password: values.password,
          password_confirmation: values.confirmPassword,
        });
        if (success) {
          passwordFormik.resetForm();
        }
      }
    },
  });

  useEffect(() => {
    if (user) {
      generalFormik.setFieldValue('fullName', user.fullName);
      generalFormik.setFieldValue('email', user.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-2 text-sm">Manage your account settings and preferences</p>
      </div>

      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="general" className={activeTab === 'general' ? 'bg-gradient-light text-primary' : ''}>
              General
            </TabsTrigger>
            <TabsTrigger value="password" className={activeTab === 'password' ? 'bg-gradient-light text-primary' : ''}>
              Password
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <form onSubmit={generalFormik.handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <InputField id="fullName" type="text" label="Full Name" placeholder="Enter your full name" formik={generalFormik} />

                <InputField
                  id="email"
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  formik={generalFormik}
                  readOnly
                  disabled
                />
              </div>

              <div className="flex justify-end">
                <SharedButton type="submit" isLoading={generalFormik.isSubmitting}>
                  Save Changes
                </SharedButton>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="password">
            <form onSubmit={passwordFormik.handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <InputField
                  id="currentPassword"
                  type={passwordFormik.values.showCurrentPassword ? 'text' : 'password'}
                  label="Current Password"
                  placeholder="Enter current password"
                  formik={passwordFormik}
                  icon={
                    <button
                      type="button"
                      onClick={() => passwordFormik.setFieldValue('showCurrentPassword', !passwordFormik.values.showCurrentPassword)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {passwordFormik.values.showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />

                <div>
                  <InputField
                    id="password"
                    type={passwordFormik.values.showPassword ? 'text' : 'password'}
                    label="New Password"
                    placeholder="Enter new password"
                    formik={passwordFormik}
                    icon={
                      <button
                        type="button"
                        onClick={() => passwordFormik.setFieldValue('showPassword', !passwordFormik.values.showPassword)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {passwordFormik.values.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />
                  {!passwordFormik.errors.password && !passwordFormik.touched.password && (
                    <p className="text-muted-foreground mt-1 text-xs">Must be at least 8 characters</p>
                  )}
                </div>

                <InputField
                  id="confirmPassword"
                  type={passwordFormik.values.showConfirmPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  placeholder="Confirm new password"
                  formik={passwordFormik}
                  icon={
                    <button
                      type="button"
                      onClick={() => passwordFormik.setFieldValue('showConfirmPassword', !passwordFormik.values.showConfirmPassword)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {passwordFormik.values.showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
              </div>

              <div className="flex justify-end">
                <SharedButton type="submit" isLoading={passwordFormik.isSubmitting}>
                  Update Password
                </SharedButton>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Profile;
