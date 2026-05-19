import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";

const SocialLoginButton = ({ onSuccess }) => {
  const { signInGoogle, setLoading } = useAuth();
  const axiosInstance = useAxios();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = location?.state?.from?.pathname || location?.state || "/";

  const handleGoogle = async () => {
    setIsSubmitting(true);
    try {
      const result = await signInGoogle();
      
      let userExists = false;
      try {
        const checkRes = await axiosInstance.get(`/user/verifyEmail/${result.user.email}`);
        if (checkRes.data.success) {
          userExists = true;
        }
      } catch {
        // If user not found (404), userExists remains false and we register them
      }

      if (!userExists) {
        const userInfo = {
          email: result.user.email,
          name: result.user.displayName || result.user.email.split("@")[0],
        };
        try {
          // Send registration request to MongoDB via "/user/auth/register"
          await axiosInstance.post("/user/auth/register", userInfo);
        } catch (error) {
          console.warn("MongoDB registration sync issue:", error.message);
        }
      }

      toast.success("Logged In Successfully");
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Navigate to destination
        navigate(redirectTo, { replace: true });
      }

    } catch (error) {
      if(error.message == 'Firebase: Error (auth/popup-closed-by-user).'){
        toast.error("Google Login Cancelled by User");
      }else{
        toast.error("Failed to login with Google");
      }
    } finally {
      setLoading(false)
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <motion.button
        type="button"
        onClick={handleGoogle}
        disabled={isSubmitting}
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.99 }}
        className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm select-none"
      >
        {isSubmitting ? (
          <>
            <span className="loading loading-spinner loading-xs text-primary"></span>
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <svg
              aria-hidden="true"
              className="w-5 h-5 shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.5 24c0-1.61-.15-3.16-.42-4.69H24v8.89h12.66c-.55 2.87-2.17 5.3-4.61 6.94l7.16 5.55C43.34 36.5 46.5 30.82 46.5 24z"
              />
              <path
                fill="#FBBC05"
                d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 38.5c-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48c6.48 0 11.93-2.13 15.89-5.81l-7.16-5.55c-2.44 1.64-5.57 2.87-8.73 2.87z"
              />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </motion.button>
    </div>
  );
};

export default SocialLoginButton;

