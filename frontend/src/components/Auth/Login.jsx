import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = (data) => {
    setIsLoading(true);
    // TODO: Implement actual login logic with Firebase/Backend here
    console.log("Login Data:", data);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Login clicked (Logic pending)');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-bc-navy flex items-center justify-center text-white text-lg font-bold mx-auto mb-4">
            ES
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Please enter your details to sign in.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Email Address
            </label>
            <input 
              type="email" 
              placeholder="you@example.com"
              className={`input input-bordered w-full focus:outline-none focus:border-[#0028a1] focus:ring-1 focus:ring-[#0028a1] ${errors.email ? 'input-error' : ''}`}
              {...register("email", { 
                required: "Email is required", 
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Invalid email address"
                }
              })}
            />
            {errors.email && <span className="text-red-500 text-xs mt-1 block font-semibold">{errors.email.message}</span>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-bold text-gray-700">
                Password
              </label>
              <a href="#" className="text-sm font-semibold text-[#0028a1] hover:underline">
                Forgot password?
              </a>
            </div>
            <input 
              type="password" 
              placeholder="••••••••"
              className={`input input-bordered w-full focus:outline-none focus:border-[#0028a1] focus:ring-1 focus:ring-[#0028a1] ${errors.password ? 'input-error' : ''}`}
              {...register("password", { 
                required: "Password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" }
              })}
            />
            {errors.password && <span className="text-red-500 text-xs mt-1 block font-semibold">{errors.password.message}</span>}
          </div>

          <button 
            type="submit" 
            className="btn w-full bg-[#0028a1] hover:bg-[#001f7a] text-white border-none text-lg font-bold"
            disabled={isLoading}
          >
            {isLoading ? <span className="loading loading-spinner loading-sm"></span> : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600 font-medium">
          Don't have an account?{' '}
          <a href="/register" className="text-[#0028a1] font-bold hover:underline">
            Sign up here
          </a>
        </div>
        
      </div>
    </div>
  );
};

export default Login;
