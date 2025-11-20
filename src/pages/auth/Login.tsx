import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff } from 'lucide-react';
import SharedButton from '@/shared/GenericButton';
import InputField from '@/shared/InputField';
import { handleSignIn } from './authApiCalls';

interface LoginFormValues {
  email: string;
  password: string;
  showPassword?: boolean;
}

const Login = () => {
  const navigate = useNavigate();

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
      showPassword: false,
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    }),
    onSubmit: async () => {
      const isSuccess = await handleSignIn();
      if (isSuccess) navigate('/dashboard');
    },
  });

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="bg-primary text-primary-foreground mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
            <span className="text-2xl font-bold">R</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-muted-foreground mt-2 text-sm">Sign in to your account to continue</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
          <div className="bg-card space-y-4 rounded-lg border p-8 shadow-sm">
            <InputField id="email" type="email" label="Email address" placeholder="john@example.com" formik={formik} />

            <InputField
              id="password"
              type={formik.values.showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="••••••••"
              formik={formik}
              labelExtraParams
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

            <SharedButton type="submit" className="w-full" isLoading={formik.isSubmitting}>
              Sign in
            </SharedButton>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
