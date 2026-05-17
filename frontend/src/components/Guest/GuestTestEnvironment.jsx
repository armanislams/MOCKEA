import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { PiLockFill, PiGoogleLogoBold, PiEnvelopeFill, PiLockKeyFill } from "react-icons/pi";
import useAxios from "../../hooks/useAxios";
import useAuth from "../../hooks/useAuth";
import Speaking from "../Dashboard/Student Dashboard/Speaking/Speaking";
import Listening from "../Dashboard/Student Dashboard/Listening/Listening";

// ─── Inline Auth Modal ────────────────────────────────────────────────────────
function InlineAuthModal({ onClose, onSuccess }) {
  const { signIn, register, signInGoogle } = useAuth();
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === "login") {
        await signIn(email, password);
      } else {
        await register(email, password);
      }
      toast.success("Logged in successfully.");
      onSuccess();
    } catch (err) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInGoogle();
      toast.success("Logged in! Submitting your response...");
      onSuccess();
    } catch (err) {
      toast.error(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2.5rem] p-10 max-w-md w-full mx-4 shadow-2xl"
      >
        {/* Icon + heading */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PiLockFill className="text-3xl text-primary" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Almost there!</h2>
          <p className="text-slate-500 text-sm mt-2">
            Log in or create a free account to submit your response.
          </p>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="btn btn-outline rounded-2xl w-full h-14 font-bold gap-3 mb-4"
        >
          <PiGoogleLogoBold className="text-xl" /> Continue with Google
        </button>

        <div className="divider text-xs text-slate-400 font-bold">OR</div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {["login", "register"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
                tab === t
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-base-200 text-slate-500"
              }`}
            >
              {t === "login" ? "Log In" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {tab === "register" && (
            <div className="relative">
              <PiEnvelopeFill className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Full Name"
                className="input input-bordered w-full pl-10 rounded-2xl"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="relative">
            <PiEnvelopeFill className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              placeholder="Email address"
              className="input input-bordered w-full pl-10 rounded-2xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <PiLockKeyFill className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              placeholder="Password"
              className="input input-bordered w-full pl-10 rounded-2xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost rounded-2xl flex-1 font-bold border border-base-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary rounded-2xl flex-1 font-black"
            >
              {loading ? <span className="loading loading-spinner" /> : tab === "login" ? "Log In & Submit" : "Register & Submit"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GuestTestEnvironment() {
  const { id } = useParams();
  const axiosPublic = useAxios();
  const { user } = useAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);
  // After login, we need to know the child should retry submit
  const [triggerSubmit, setTriggerSubmit] = useState(false);

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

  // After login succeeds: close modal, set flag to trigger submit
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Small delay to let auth state propagate
    setTimeout(() => setTriggerSubmit(true), 500);
  };

  // Once triggerSubmit is true and user is set, clear the flag
  // The Speaking/Listening component will now allow real submit since user?.email exists
  useEffect(() => {
    if (triggerSubmit && user?.email) {
      setTriggerSubmit(false);
      toast.info("You're logged in! Click 'End Session' / 'Finalize Assessment' to complete your submission.");
    }
  }, [triggerSubmit, user?.email]);

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
      {showAuthModal && (
        <InlineAuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Render the real Speaking or Listening component */}
      {test.testType === "speaking" ? (
        <Speaking preloadedSet={test} onSubmitGuest={handleGuestSubmit} />
      ) : (
        <Listening preloadedSet={test} onSubmitGuest={handleGuestSubmit} />
      )}
    </>
  );
}
