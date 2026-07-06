import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import useAuth from "../../hooks/useAuth";
import useUserProfile from "../../hooks/useUserProfile";
import Loader from "../Loader/Loader";
import { motion } from "framer-motion";
import { PiBookOpenTextFill, PiGlobeHemisphereEastFill, PiArrowRightBold } from "react-icons/pi";

export default function ExamPreferenceRedirect() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const { userData, isLoading: profileLoading } = useUserProfile();
    const [selectedTrack, setSelectedTrack] = useState(null);

    useEffect(() => {
        if (authLoading) return;

        // If authenticated and profile loaded
        if (user) {
            if (!profileLoading && userData) {
                const preference = userData.targetExam || "IELTS";
                if (preference === "PTE") {
                    navigate("/pte", { replace: true });
                } else {
                    navigate("/ielts", { replace: true });
                }
            }
            return;
        }

        // If guest, check localStorage
        const storedPref = localStorage.getItem("prefetched_exam");
        if (storedPref) {
            if (storedPref === "PTE") {
                navigate("/pte", { replace: true });
            } else {
                navigate("/ielts", { replace: true });
            }
        }
    }, [user, authLoading, userData, profileLoading, navigate]);

    // Handle user selection as guest
    const handleSelectTrack = (track) => {
        localStorage.setItem("prefetched_exam", track);
        if (track === "PTE") {
            navigate("/pte");
        } else {
            navigate("/ielts");
        }
    };

    if (authLoading || (user && profileLoading)) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full filter blur-3xl -z-10" />

            <div className="w-full max-w-4xl text-center z-10 space-y-12">
                <div className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
                    >
                        <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">Welcome to MOCKEA</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight"
                    >
                        Choose Your Preparation Track
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto"
                    >
                        Select your target exam. We will customize your dashboard, mock tests, and practice rooms to match.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {/* IELTS Option */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        whileHover={{ scale: 1.03 }}
                        onClick={() => handleSelectTrack("IELTS")}
                        className="group cursor-pointer rounded-[2.5rem] border border-white/10 bg-white/5 p-10 flex flex-col justify-between text-left relative overflow-hidden transition-all hover:bg-white/[0.08] hover:border-red-500/30"
                    >
                        <div className="space-y-6 relative z-10">
                            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                                <PiBookOpenTextFill size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight text-white mb-2">IELTS Academic</h2>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Simulate complete IELTS general and academic mock exams. Master writing, speaking, listening, and reading with native examiner band scoring.
                                </p>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-sm font-bold text-red-400 group-hover:text-red-300">
                            Explore IELTS Prep <PiArrowRightBold size={16} className="group-hover:translate-x-2 transition-transform" />
                        </div>
                        <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-red-500/5 rounded-full filter blur-2xl group-hover:bg-red-500/10 transition-colors" />
                    </motion.div>

                    {/* PTE Option */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        whileHover={{ scale: 1.03 }}
                        onClick={() => handleSelectTrack("PTE")}
                        className="group cursor-pointer rounded-[2.5rem] border border-white/10 bg-white/5 p-10 flex flex-col justify-between text-left relative overflow-hidden transition-all hover:bg-white/[0.08] hover:border-blue-500/30"
                    >
                        <div className="space-y-6 relative z-10">
                            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                                <PiGlobeHemisphereEastFill size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight text-white mb-2">PTE Academic</h2>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Experience Pearson PTE Academic layouts. Practice Read Aloud, Describe Image, and Fill in the Blanks with instant automated scoring feedback.
                                </p>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-sm font-bold text-blue-400 group-hover:text-blue-300">
                            Explore PTE Prep <PiArrowRightBold size={16} className="group-hover:translate-x-2 transition-transform" />
                        </div>
                        <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-blue-500/5 rounded-full filter blur-2xl group-hover:bg-blue-500/10 transition-colors" />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
