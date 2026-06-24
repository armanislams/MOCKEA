import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { PiLockFill } from "react-icons/pi";
import useAxios from "../../hooks/useAxios";
import { useIsMobile } from "../../hooks/useIsMobile";
import MobileWarningModal from "../Common/MobileWarningModal";
import Speaking from "../Dashboard/Student Dashboard/Speaking/Speaking";
import Listening from "../Dashboard/Student Dashboard/Listening/Listening";
import Login from "../Auth/Login";
import Register from "../Auth/Register";

// ─── Inline Auth Modal ────────────────────────────────────────────────────────
function InlineAuthModal({ onClose, onSuccess }) {
  const [tab, setTab] = useState("login"); // "login" | "register"

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2.5rem] p-6 md:p-10 max-w-md w-full relative max-h-[95vh] overflow-y-auto shadow-2xl"
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 btn btn-circle btn-ghost btn-sm"
        >
          ✕
        </button>
        
        <div className="text-center mb-6 mt-2">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <PiLockFill className="text-2xl text-primary" />
          </div>
          <h2 className="text-xl font-black text-slate-800">
            {tab === "login" ? "Log in to Submit" : "Register to Submit"}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Please authenticate to save your test responses.
          </p>
        </div>

        {tab === "login" ? (
          <Login onSuccess={onSuccess} isModal={true} onToggleAuth={() => setTab("register")} />
        ) : (
          <Register onSuccess={onSuccess} isModal={true} onToggleAuth={() => setTab("login")} />
        )}
      </motion.div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GuestTestEnvironment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosPublic = useAxios();
  const isMobile = useIsMobile();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileWarningDismissed, setMobileWarningDismissed] = useState(!isMobile);

  // Fetch the public question set
  const { data: test, isLoading, error } = useQuery({
    queryKey: ["public-mock-test", id],
    queryFn: async () => {
      const res = await axiosPublic.get(`/public-mock-tests/${id}`);
      return res.data.test;
    },
    enabled: !!id,
  });

  // Called by Speaking/Listening when guest hits submit without being logged in
  const handleGuestSubmit = () => {
    setShowAuthModal(true);
  };

  // After login succeeds: close modal and prompt user to submit
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Small delay to let auth state propagate
    setTimeout(() => {
      toast.info("You're logged in! Click 'End Session' / 'Finalize Assessment' to complete your submission.");
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load test. Try again.
      </div>
    );
  }

  return (
    <>
      {isMobile && !mobileWarningDismissed && (
        <MobileWarningModal
          isOpen={true}
          onExit={() => navigate("/free-practice")}
          onProceed={() => setMobileWarningDismissed(true)}
        />
      )}

      {showAuthModal && (
        <InlineAuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Render the real Speaking or Listening component */}
      {(!isMobile || mobileWarningDismissed) && (
        test.testType === "speaking" ? (
          <Speaking preloadedSet={test} onSubmitGuest={handleGuestSubmit} />
        ) : (
          <Listening preloadedSet={test} onSubmitGuest={handleGuestSubmit} />
        )
      )}
    </>
  );
}
