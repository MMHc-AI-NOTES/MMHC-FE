import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff } from 'lucide-react';
import SharedButton from '@/shared/GenericButton';
import InputField from '@/shared/InputField';
import { resetPassword } from './authApiCalls';
import Logo from '@/images/logo.svg';

interface ResetPasswordFormValues {
  password: string;
  password_confirmation: string;
  showPassword?: boolean;
  showConfirmPassword?: boolean;
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const formik = useFormik<ResetPasswordFormValues>({
    initialValues: {
      password: '',
      password_confirmation: '',
      showPassword: false,
      showConfirmPassword: false,
    },
    validationSchema: Yup.object({
      password: Yup.string().min(8, 'Password must be at least 8 characters').required('New password is required'),
      password_confirmation: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    onSubmit: async values => {
      if (!token) return;
      const success = await resetPassword({
        token,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });
      if (success) navigate('/login');
    },
  });

  if (!token) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex items-center justify-center">
            <img src={Logo} alt="logo" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Invalid or missing reset link</h2>
          <p className="text-muted-foreground text-sm">This reset link is invalid or has expired. Please request a new one.</p>
          <Link to="/forgot-password" className="text-primary font-medium hover:underline">
            Request new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <img src={Logo} alt="logo" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">Reset password</h2>
          <p className="text-muted-foreground mt-2 text-sm">Enter your new password below</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
          <div className="bg-card space-y-4 rounded-lg border p-8 shadow-sm">
            <InputField
              id="password"
              type={formik.values.showPassword ? 'text' : 'password'}
              label="New password"
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
              id="password_confirmation"
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

            <SharedButton type="submit" className="w-full" isLoading={formik.isSubmitting}>
              Reset password
            </SharedButton>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Remember your password? </span>
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
