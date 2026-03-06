import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import SharedButton from '@/shared/GenericButton';
import InputField from '@/shared/InputField';
import { requestForgotPassword } from './authApiCalls';
import Logo from '@/images/logo.svg';

interface ForgotPasswordFormValues {
  email: string;
}

const ForgotPassword = () => {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const formik = useFormik<ForgotPasswordFormValues>({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
    }),
    onSubmit: async values => {
      const success = await requestForgotPassword(values.email);
      if (success) {
        setSubmittedEmail(values.email);
      }
    },
  });

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <img src={Logo} alt="logo" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">Forgot password</h2>
          <p className="text-muted-foreground mt-2 text-sm">Enter your email and we&apos;ll send you a link to reset your password.</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
          <div className="bg-card space-y-4 rounded-lg border p-8 shadow-sm">
            {submittedEmail && (
              <p className="mt-2 rounded-md bg-gray-200 p-3 text-center text-sm">
                A link has been sent to <span className="font-semibold">{submittedEmail}</span> <br /> Check your email for the reset link.
              </p>
            )}
            <InputField id="email" type="email" label="Email address" placeholder="john@example.com" formik={formik} />

            <SharedButton type="submit" className="w-full" isLoading={formik.isSubmitting}>
              Send reset link
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

export default ForgotPassword;
