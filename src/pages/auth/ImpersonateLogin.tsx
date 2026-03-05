import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff } from 'lucide-react';
import SharedButton from '@/shared/GenericButton';
import InputField from '@/shared/InputField';
import { handleImpersonateSignIn } from './authApiCalls';
import Logo from '@/images/logo.svg';

interface ImpersonateLoginFormValues {
  email: string;
  password: string;
  targetUserEmail: string;
  showPassword?: boolean;
}

const ImpersonateLogin = () => {
  const navigate = useNavigate();

  const formik = useFormik<ImpersonateLoginFormValues>({
    initialValues: {
      email: '',
      password: '',
      targetUserEmail: '',
      showPassword: false,
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
      targetUserEmail: Yup.string().email('Invalid email address').required('Impersonate email is required'),
    }),
    onSubmit: async values => {
      const isSuccess = await handleImpersonateSignIn(values.email, values.password, values.targetUserEmail);
      if (isSuccess) navigate('/dashboard');
    },
  });

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <img src={Logo} alt="logo" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">Impersonate Login</h2>
          <p className="text-muted-foreground mt-2 text-sm">Sign in as another user using your credentials</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
          <div className="bg-card space-y-4 rounded-lg border p-8 shadow-sm">
            <InputField id="email" type="email" label="Your email address" placeholder="admin@example.com" formik={formik} />

            <InputField
              id="password"
              type={formik.values.showPassword ? 'text' : 'password'}
              label="Your password"
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
              id="targetUserEmail"
              type="email"
              label="Impersonate email"
              placeholder="user-to-impersonate@example.com"
              formik={formik}
            />

            <SharedButton type="submit" className="w-full" isLoading={formik.isSubmitting}>
              Impersonate Login
            </SharedButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImpersonateLogin;
