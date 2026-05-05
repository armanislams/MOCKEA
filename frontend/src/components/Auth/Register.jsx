import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Register = () => {
  const {register : registerUser}=useAuth()
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const axiosSecure = useAxiosSecure()
  const navigate = useNavigate()

  const password = watch("password");

  const onSubmit = (data) => {
    
    setIsLoading(true);

    registerUser(data.email,data.password).then(()=>{
      axiosSecure.post('/user/register',data)
      .then(()=>{
        toast.success('User Created Succesfully')
        setTimeout(() => {
          navigate('/')
          setIsLoading(false);
        }, 1000)
      })
      .catch(()=>{
        toast.error('User Creation Failed')
        setTimeout(() => {
          setIsLoading(false);
        }, 1000)
      })
    })
    .catch((err)=>{
      console.log(err);
      toast.error(err.message)
      setTimeout(() => {
        setIsLoading(false);
      }, 1000)
    })
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-200"
      >
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold mx-auto mb-4">
            ES
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create an Account</h2>
          <p className="text-gray-600">Join us to start your listening practice.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Full Name
            </label>
            <input 
              type="text" 
              placeholder="John Doe"
              className={`input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${errors.name ? 'input-error' : ''}`}
              {...register("name", { required: "Full Name is required" })}
            />
            {errors.name && <span className="text-red-500 text-xs mt-1 block font-semibold">{errors.name.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Email Address
            </label>
            <input 
              type="email" 
              placeholder="you@example.com"
              className={`input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${errors.email ? 'input-error' : ''}`}
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
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Password
            </label>
            <input 
              type="password" 
              placeholder="••••••••"
              className={`input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${errors.password ? 'input-error' : ''}`}
              {...register("password", { 
                required: "Password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" }
              })}
            />
            {errors.password && <span className="text-red-500 text-xs mt-1 block font-semibold">{errors.password.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Confirm Password
            </label>
            <input 
              type="password" 
              placeholder="••••••••"
              className={`input input-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${errors.confirmPassword ? 'input-error' : ''}`}
              {...register("confirmPassword", { 
                required: "Please confirm your password",
                validate: value => value === password || "Passwords do not match"
              })}
            />
            {errors.confirmPassword && <span className="text-red-500 text-xs mt-1 block font-semibold">{errors.confirmPassword.message}</span>}
          </div>

          <button 
            type="submit" 
            className="btn w-full bg-primary hover:bg-primary/90 text-white border-none text-lg font-bold mt-2"
            disabled={isLoading}
          >
            {isLoading ? <span className="loading loading-spinner loading-sm"></span> : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600 font-medium">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Sign in here
          </Link>
        </div>
        
      </motion.div>
    </div>
  );
};

export default Register;
