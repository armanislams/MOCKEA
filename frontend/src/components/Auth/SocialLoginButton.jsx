import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";
import { FaGoogle } from "react-icons/fa6";

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
          <FaGoogle className="" size={20} />
          <span>Continue with Google</span>
          </>
        )}
      </motion.button>
    </div>
  );
};

export default SocialLoginButton;

