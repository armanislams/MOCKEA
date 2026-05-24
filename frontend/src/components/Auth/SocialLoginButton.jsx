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
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm select-none"
      >
        {isSubmitting ? (
          <>
            <span className="loading loading-spinner loading-xs text-primary"></span>
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </motion.button>
    </div>
  );
};

export default SocialLoginButton;

