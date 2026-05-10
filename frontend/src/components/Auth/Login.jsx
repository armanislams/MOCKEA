import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router';
import AuthLayout from './AuthLayout';
import SocialLoginButton from './SocialLoginButton';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const onSubmit = (data) => {
    setIsLoading(true);
    signIn(data.email, data.password)
      .then(() => {
        toast.success('Logged In Successfully');
        setTimeout(() => {
          navigate(from, { replace: true });
          setIsLoading(false);
        }, 500);
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.message);
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      });
  };

  const handleGoogleLogin = () => {
    toast.info('Google login integration coming soon');
  };

  const features = [
    {
      title: 'Full-length mock tests',
      description: 'Practice with realistic exam conditions'
    },
    {
      title: 'Instant band estimates',
      description: 'Know your score immediately'
    },
    {
      title: 'Detailed analytics',
      description: 'Track progress and identify weak areas'
    }
  ];

  return (
    <AuthLayout title="Welcome Back" subtitle="Please enter your details to sign in." features={features}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        {/* Social Login */}
        <SocialLoginButton provider="Google" onClick={handleGoogleLogin} isLoading={isLoading} />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500 font-medium">Or continue with email</span>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className={`w-full px-4 py-3 border-2 rounded-lg transition-colors focus:outline-none ${
              errors.email
                ? 'border-red-500 focus:border-red-500 focus:bg-red-50'
                : 'border-gray-200 focus:border-blue-600 focus:bg-blue-50'
            }`}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: 'Invalid email address'
              }
            })}
          />
          {errors.email && (
            <span className="text-red-500 text-xs mt-2 block font-semibold">{errors.email.message}</span>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-gray-700">Password</label>
            <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              Forgot password?
            </a>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            className={`w-full px-4 py-3 border-2 rounded-lg transition-colors focus:outline-none ${
              errors.password
                ? 'border-red-500 focus:border-red-500 focus:bg-red-50'
                : 'border-gray-200 focus:border-blue-600 focus:bg-blue-50'
            }`}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
          />
          {errors.password && (
            <span className="text-red-500 text-xs mt-2 block font-semibold">{errors.password.message}</span>
          )}
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition duration-200 ease-out transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>

        {/* Sign Up Link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 font-bold hover:text-blue-700 hover:underline">
            Sign up here
          </a>
        </div>

        {/* Footer Links */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-500 space-y-2">
          <p>
            <a href="#" className="hover:text-gray-700 hover:underline">
              Terms of Service
            </a>
            {' • '}
            <a href="#" className="hover:text-gray-700 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
