import { Navigate } from "react-router";
import useAuth from "../hooks/useAuth";
import useUserProfile from "../hooks/useUserProfile";
import Loader from "../components/Loader/Loader";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiBookOpenTextBold, PiGlobeHemisphereEastBold } from "react-icons/pi";
import { toast } from "react-toastify";

export default function TrackGuard({ children, expectedTrack }) {
    const { user, loading: authLoading } = useAuth();
    const { userData, isLoading: profileLoading } = useUserProfile();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [selectedTrack, setSelectedTrack] = useState(null);

    const mutation = useMutation({
        mutationFn: async (targetExam) => {
            const { data } = await axiosSecure.patch(`/user/${userData?._id}/exam-preference`, { targetExam });
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["user-profile", user?.email] });
            toast.success(`Exam preference set to ${data?.user?.targetExam}!`);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to save exam preference");
        }
    });

    if (authLoading || (user && profileLoading)) {
        return <Loader />;
    }

    if (user && userData) {
        // If logged-in user doesn't have targetExam preference set
        if (!userData.targetExam) {
            return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-slate-900 border border-white/10 rounded-[3rem] p-8 sm:p-10 max-w-2xl w-full text-white text-center space-y-8 shadow-2xl relative overflow-hidden"
                    >
                        <div className="space-y-3">
                            <h2 className="text-3xl font-black tracking-tight">Set Your Exam Target</h2>
                            <p className="text-slate-400 text-sm max-w-md mx-auto">
                                To unlock practice sessions and mock tests, please select your primary preparation track. You can change this later in your profile settings.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                            {/* IELTS Option */}
                            <div 
                                onClick={() => setSelectedTrack("IELTS")}
                                className={`cursor-pointer rounded-3xl border p-6 text-left flex flex-col justify-between transition-all ${
                                    selectedTrack === "IELTS"
                                        ? "bg-red-500/10 border-red-500 text-red-400 shadow-lg shadow-red-500/5"
                                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                                }`}
                            >
                                <div className="space-y-4">
                                    <PiBookOpenTextBold size={28} className={selectedTrack === "IELTS" ? "text-red-400" : "text-slate-400"} />
                                    <div>
                                        <h3 className="font-black text-lg text-white">IELTS Prep</h3>
                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                            Prepare for General and Academic IELTS with full scorecards.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* PTE Option */}
                            <div 
                                onClick={() => setSelectedTrack("PTE")}
                                className={`cursor-pointer rounded-3xl border p-6 text-left flex flex-col justify-between transition-all ${
                                    selectedTrack === "PTE"
                                        ? "bg-blue-500/10 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/5"
                                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                                }`}
                            >
                                <div className="space-y-4">
                                    <PiGlobeHemisphereEastBold size={28} className={selectedTrack === "PTE" ? "text-blue-400" : "text-slate-400"} />
                                    <div>
                                        <h3 className="font-black text-lg text-white">PTE Prep</h3>
                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                            Master Pearson PTE Academic layouts with AI grading.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button 
                            disabled={!selectedTrack || mutation.isPending}
                            onClick={() => mutation.mutate(selectedTrack)}
                            className="btn btn-primary rounded-2xl w-full h-14 font-black shadow-lg shadow-primary/20 disabled:bg-white/10 disabled:text-white/30"
                        >
                            {mutation.isPending ? (
                                <span className="loading loading-spinner"></span>
                            ) : (
                                "Confirm Selection"
                            )}
                        </button>

                        <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-primary/5 rounded-full filter blur-3xl -z-10" />
                    </motion.div>
                </div>
            );
        }

        const isStudent = userData.role !== "admin" && userData.role !== "instructor";
        if (isStudent) {
            const preference = userData.targetExam || "IELTS";
            if (preference !== expectedTrack) {
                return <Navigate to={preference === "PTE" ? "/pte" : "/ielts"} replace />;
            }
        }
    } else {
        // For guest, update local storage preference to match the visited path
        localStorage.setItem("prefetched_exam", expectedTrack);
    }

    return children;
}
