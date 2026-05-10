import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { toast } from 'react-toastify';
import AuthLayout from './AuthLayout';
import SocialLoginButton from './SocialLoginButton';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

const Register = () => {
  const { register: registerUser } = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
   const location = useLocation();
   const from = location.state?.from?.pathname || "/";

  const password = watch('password');

  const onSubmit = (data) => {
    if (!agreeToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);

    registerUser(data.email, data.password)
      .then(() => {
        axiosSecure
          .post('/user/register', data)
          .then(() => {
            toast.success('User Created Successfully');
            setTimeout(() => {
             navigate(from, { replace: true });
              setIsLoading(false);
            }, 1000);
          })
          .catch(() => {
            toast.error('User Creation Failed');
            setTimeout(() => {
              setIsLoading(false);
            }, 1000);
          });
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.message);
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      });
  };

  const handleGoogleSignUp = () => {
    toast.info('Google signup integration coming soon');
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
    <AuthLayout title="Create an Account" subtitle="Join us to start your listening practice." features={features}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        {/* Social Login */}
        <SocialLoginButton provider="Google" onClick={handleGoogleSignUp} isLoading={isLoading} />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500 font-medium">Or sign up with email</span>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            className={`w-full px-4 py-3 border-2 rounded-lg transition-colors focus:outline-none ${
              errors.name
                ? 'border-red-500 focus:border-red-500 focus:bg-red-50'
                : 'border-gray-200 focus:border-blue-600 focus:bg-blue-50'
            }`}
            {...register('name', { required: 'Full Name is required' })}
          />
          {errors.name && (
            <span className="text-red-500 text-xs mt-2 block font-semibold">{errors.name.message}</span>
          )}
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
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Password
          </label>
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
          <PasswordStrengthIndicator password={password} />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className={`w-full px-4 py-3 border-2 rounded-lg transition-colors focus:outline-none ${
              errors.confirmPassword
                ? 'border-red-500 focus:border-red-500 focus:bg-red-50'
                : 'border-gray-200 focus:border-blue-600 focus:bg-blue-50'
            }`}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match'
            })}
          />
          {errors.confirmPassword && (
            <span className="text-red-500 text-xs mt-2 block font-semibold">{errors.confirmPassword.message}</span>
          )}
        </div>

        {/* Terms Agreement */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
          />
          <label className="text-sm text-gray-600 cursor-pointer">
            I agree to the{' '}
            <a href="#" className="text-blue-600 font-semibold hover:underline">
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 font-semibold hover:underline">
              Privacy Policy
            </a>
          </label>
        </div>

        {/* Sign Up Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition duration-200 ease-out transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>

        {/* Sign In Link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 hover:underline">
            Sign in here
          </Link>
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

export default Register;
