import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import useAuth from "../../hooks/useAuth";
import { useNavigate, useLocation, Link } from "react-router";
import SocialLoginButton from "./SocialLoginButton";
import { PiEye, PiEyeSlash } from "react-icons/pi";
import useAxios from "../../hooks/useAxios";

const Login = ({ onSuccess, isModal, onToggleAuth }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);
  const { signIn, setLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const axiosInstance = useAxios();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(`/user/verifyEmail/${data.email}`);
      if (res.data.success) {
        try {
          const result = await signIn(data.email, data.password);
          toast.success("Logged In Successfully");

          if (onSuccess) {
            onSuccess();
          } else {
            let role = null;
            try {
              const token = await result.user.getIdToken();
              const roleRes = await axiosInstance.get(`/user/${data.email}/role`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              role = roleRes.data?.role;
            } catch (err) {
              console.error("Error fetching user role on login:", err);
            }

            if (role === "admin" || role === "instructor") {
              const target = (from === "/" || from === "/dashboard") ? "/dashboard/profile" : from;
              navigate(target, { replace: true });
            } else {
              navigate(from, { replace: true });
            }
          }
        } catch (err) {
          setLoading(false);
          const message = err.message || "";
          const isInvalidCredential = message.includes("auth/invalid-credential") || message.includes("invalid-credential");
          toast.error(
            isInvalidCredential
              ? "Invalid Email or Password. Please Try Again"
              : "Something Went Wrong. Please Try Again"
          );
        }
      }
    } catch {
      toast.error("User Not Found. Please Register");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {!isModal && (
        <div className="mb-4">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600">Please enter your details to sign in.</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={isModal ? "space-y-4" : "space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200"}
      >
        {/* Social Login */}
        <SocialLoginButton onSuccess={onSuccess} />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500 font-medium">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className={`w-full px-4 py-2.5 border-2 rounded-lg transition-colors focus:outline-none ${
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
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-bold text-gray-700">
              Password
            </label>
            <Link
              to={"#"}
              onClick={() => toast.info("Coming Soon...")}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              placeholder="••••••••"
              className={`w-full px-4 py-2.5 border-2 rounded-lg transition-colors focus:outline-none ${
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
              onClick={() => setShow(!show)}
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
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition duration-200 ease-out transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>

        {/* Sign Up Link */}
        <div className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          {isModal ? (
            <button
              type="button"
              onClick={onToggleAuth}
              className="text-blue-600 font-bold hover:text-blue-700 hover:underline"
            >
              Sign up here
            </button>
          ) : (
            <Link
              to="/auth/register"
              className="text-blue-600 font-bold hover:text-blue-700 hover:underline"
            >
              Sign up here
            </Link>
          )}
        </div>

        {/* Footer Links */}
        {!isModal && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-center text-xs text-gray-500 space-y-2">
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
        )}
      </form>
    </div>
  );
};

export default Login;
