import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff } from 'lucide-react';
import SharedButton from '@/shared/GenericButton';
import InputField from '@/shared/InputField';
import Logo from '@/images/logo.svg';
import { fetchMe, onboardInvitedUser } from './authApiCalls';
import { setLocalStorageItem } from '@/utils/storage';

interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  showPassword?: boolean;
  showConfirmPassword?: boolean;
}

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [inviteToken, setInviteToken] = useState<string>('');
  const [prefillLoading, setPrefillLoading] = useState(true);

  const formik = useFormik<SignupFormValues>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false,
    },
    validationSchema: Yup.object({
      name: Yup.string().min(2, 'Name must be at least 2 characters').required('Full name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
    }),
    onSubmit: async values => {
      const isSuccess = await onboardInvitedUser({
        email: values.email,
        password: values.password,
        password_confirmation: values.confirmPassword,
        token: inviteToken,
      });
      if (isSuccess) navigate('/dashboard');
    },
  });

  // Extract token from URL, store it, then prefill user via /me
  useEffect(() => {
    const run = async () => {
      const token = new URLSearchParams(location.search).get('token') || '';
      setInviteToken(token);

      if (token) {
        setLocalStorageItem('authentication_token', token);
        const me = await fetchMe();
        if (me) {
          formik.setFieldValue('name', me.fullName, false);
          formik.setFieldValue('email', me.email, false);
        }
      }

      setPrefillLoading(false);
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <img src={Logo} alt="logo" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">Create an account</h2>
          <p className="text-muted-foreground mt-2 text-sm">Get started with your free account</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
          <div className="bg-card space-y-4 rounded-lg border p-8 shadow-sm">
            <InputField
              id="name"
              type="text"
              label="Full name"
              placeholder="John Doe"
              formik={formik}
              readOnly={true}
              disabled={prefillLoading}
            />

            <InputField
              id="email"
              type="email"
              label="Email address"
              placeholder="john@example.com"
              formik={formik}
              readOnly={true}
              disabled={prefillLoading}
            />

            <div>
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
              {!formik.errors.password && !formik.touched.password && (
                <p className="text-muted-foreground mt-1 text-xs">Must be at least 8 characters with uppercase, lowercase, and number</p>
              )}
            </div>

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

            <SharedButton type="submit" className="w-full" isLoading={formik.isSubmitting}>
              Create account
            </SharedButton>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
