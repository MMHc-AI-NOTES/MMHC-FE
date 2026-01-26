import { useState, useRef, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAppSelector } from '@/store/store';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import InputField from '@/shared/InputField';
import SharedButton from '@/shared/GenericButton';
import { Camera, Eye, EyeOff } from 'lucide-react';
import { updateProfile, updatePassword } from './profileApiCalls';
import { cn } from '@/lib/utils';

interface GeneralFormValues {
  fullName: string;
  email: string;
  profilePicture: File | null;
  profilePicturePreview: string | null;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generalFormik = useFormik<GeneralFormValues>({
    initialValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      profilePicture: null,
      profilePicturePreview: (user as any)?.profilePicture || null,
    },
    validationSchema: generalValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      const success = await updateProfile({
        fullName: values.fullName,
        profilePicture: values.profilePicture || undefined,
      });
      if (success) {
        generalFormik.setFieldValue('profilePicture', null);
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
      const success = await updatePassword({
        currentPassword: values.currentPassword,
        password: values.password,
        password_confirmation: values.confirmPassword,
      });
      if (success) {
        passwordFormik.resetForm();
      }
    },
  });

  useEffect(() => {
    if (user) {
      generalFormik.setFieldValue('fullName', user.fullName);
      generalFormik.setFieldValue('email', user.email);
      generalFormik.setFieldValue('profilePicturePreview', (user as any).profilePicture || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        generalFormik.setFieldError('profilePicture', 'Please select a valid image file (JPEG, JPG, PNG, or WEBP)');
        return;
      }

      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        generalFormik.setFieldError('profilePicture', 'Image size must be less than 5MB');
        return;
      }

      generalFormik.setFieldValue('profilePicture', file);
      generalFormik.setFieldError('profilePicture', undefined);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        generalFormik.setFieldValue('profilePicturePreview', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const avatarSrc = generalFormik.values.profilePicturePreview || (user as any)?.profilePicture;
  const avatarFallback = (user?.fullName?.match(/\b\w/g)?.slice(0, 2).join('') ?? user?.email?.slice(0, 2) ?? 'U').toUpperCase();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-2 text-sm">Manage your account settings and preferences</p>
      </div>

      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <form onSubmit={generalFormik.handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
                    {avatarSrc && <AvatarImage src={avatarSrc} alt={user?.fullName || 'User'} />}
                    <AvatarFallback className="bg-primary-light text-primary text-2xl">{avatarFallback}</AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className={cn(
                      'bg-primary text-primary-foreground hover:bg-primary/90 absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-colors',
                    )}
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                {generalFormik.errors.profilePicture && <div className="text-sm text-red-500">{generalFormik.errors.profilePicture}</div>}
                <p className="text-muted-foreground text-center text-sm">Click on the avatar to upload a new profile picture</p>
                <p className="text-muted-foreground text-center text-xs">Supported formats: JPEG, JPG, PNG, WEBP (Max 5MB)</p>
              </div>

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
