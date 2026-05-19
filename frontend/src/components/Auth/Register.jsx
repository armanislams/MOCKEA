import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";
import SocialLoginButton from "./SocialLoginButton";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { PiEye, PiEyeSlash } from "react-icons/pi";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const Register = () => {
  const { register: registerUser, setLoading } = useAuth();
  const [show, isShow] = useState(false);
  const [show2, isShow2] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const axiosInstance = useAxiosSecure();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const password = watch("password");

  const onSubmit = (data) => {
    if (!agreeToTerms) {
      toast.error("Please agree to the Terms of Service and Privacy Policy");
      return;
    }
    setIsLoading(true);
    try {
      axiosInstance.get(`/user/verifyEmail/${data.email}`).then((res) => {
        if (res.data.success) {
          toast.error("Email Already in Use. Please Login");
          setIsLoading(false);
          return;
        }
        registerUser(data.email, data.password)
          .then(() => {
            axiosInstance
              .post("/user/auth/register", data)
              .then(() => {
                toast.success("User Created Successfully");
                navigate(from, { replace: true });
              })
              .catch(() => {
                setLoading(false);
                toast.error("User Creation Failed");
              });
          })
          .catch((err) => {
            console.log(err.message);
            setLoading(false);
            toast.error(
              err.message == "Firebase: Error (auth/email-already-in-use)."
                ? "Email Already in Use. Please Login"
                : "Something Went Wrong. Please Try Again",
            );
          });
      });
    } catch (error) {
      console.log(error);
      toast.error("Something Went Wrong. Please Try Again");
    }
  };



  return (
    <div className="mb-8">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
        Create an Account
      </h2>
      <p className="text-gray-600">Join us to start your listening practice.</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-200"
      >
        {/* Social Login */}
        <SocialLoginButton/>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500 font-medium">
              Or sign up with email
            </span>
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
                ? "border-red-500 focus:border-red-500 focus:bg-red-50"
                : "border-gray-200 focus:border-blue-600 focus:bg-blue-50"
            }`}
            {...register("name", { required: "Full Name is required" })}
          />
          {errors.name && (
            <span className="text-red-500 text-xs mt-2 block font-semibold">
              {errors.name.message}
            </span>
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
                ? "border-red-500 focus:border-red-500 focus:bg-red-50"
                : "border-gray-200 focus:border-blue-600 focus:bg-blue-50"
            }`}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && (
            <span className="text-red-500 text-xs mt-2 block font-semibold">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              placeholder="••••••••"
              className={`w-full px-4 py-3 border-2 rounded-lg transition-colors focus:outline-none pr-12 ${
                errors.password
                  ? "border-red-500 focus:border-red-500 focus:bg-red-50"
                  : "border-gray-200 focus:border-blue-600 focus:bg-blue-50"
              }`}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            <button
              type="button"
              onClick={() => isShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
            >
              {show ? (
                <PiEyeSlash className="w-5 h-5" />
              ) : (
                <PiEye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <span className="text-red-500 text-xs mt-2 block font-semibold">
              {errors.password.message}
            </span>
          )}
          <PasswordStrengthIndicator password={password} />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={show2 ? "text" : "password"}
              placeholder="••••••••"
              className={`w-full px-4 py-3 border-2 rounded-lg transition-colors focus:outline-none pr-12 ${
                errors.confirmPassword
                  ? "border-red-500 focus:border-red-500 focus:bg-red-50"
                  : "border-gray-200 focus:border-blue-600 focus:bg-blue-50"
              }`}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
            />
            <button
              type="button"
              onClick={() => isShow2(!show2)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
            >
              {show2 ? (
                <PiEyeSlash className="w-5 h-5" />
              ) : (
                <PiEye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="text-red-500 text-xs mt-2 block font-semibold">
              {errors.confirmPassword.message}
            </span>
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
            I agree to the{" "}
            <a href="#" className="text-blue-600 font-semibold hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
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
            "Create Account"
          )}
        </button>

        {/* Sign In Link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="text-blue-600 font-bold hover:text-blue-700 hover:underline"
          >
            Sign in here
          </Link>
        </div>

        {/* Footer Links */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-500 space-y-2">
          <p>
            <a href="#" className="hover:text-gray-700 hover:underline">
              Terms of Service
            </a>
            {" • "}
            <a href="#" className="hover:text-gray-700 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
