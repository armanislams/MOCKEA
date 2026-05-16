import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import { 
    PiCheckCircleFill, 
    PiClockFill, 
    PiGraduationCapFill, 
    PiArrowRightBold,
    PiNotePencilFill,
    PiMicrophoneStageFill,
    PiTrendUpBold,
    PiLightningFill
} from "react-icons/pi";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

export const InstructorHome = () => {
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // 1. Fetch Instructor Analytics
    const { data: analytics, isLoading: loadingAnalytics } = useQuery({
        queryKey: ["instructor-analytics"],
        queryFn: async () => {
            const { data } = await axiosSecure.get("/analytics/instructor");
            return data.analytics;
        }
    });

    // 2. Fetch Pending Submissions (Labs)
    const { data: pendingLabs = [], isLoading: loadingLabs } = useQuery({
        queryKey: ["pending-labs"],
        queryFn: async () => {
            const { data } = await axiosSecure.get("/submissions?status=pending");
            return data.submissions ?? [];
        }
    });

    // 3. Lock Mutation
    const lockMutation = useMutation({
        mutationFn: (id) => axiosSecure.patch(`/submissions/lock/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(["pending-labs"]);
            navigate("/dashboard/instructor/grade-submissions");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to proceed with review");
        }
    });

    const handleProceed = (id) => {
        lockMutation.mutate(id);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-10 p-2"
        >
            {/* Hero Section */}
            <motion.div variants={itemVariants} className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-10 lg:p-16 text-white border border-white/10 shadow-2xl">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/20 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-blue-500/10 blur-[80px] rounded-full" />
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="space-y-6 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary-content text-[10px] font-black uppercase tracking-[0.2em]">
                            <PiLightningFill className="text-primary" /> Instructor Elite Dashboard
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none">
                            Welcome back, <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-emerald-400">
                                Academic Expert
                            </span>
                        </h1>
                        <p className="text-lg text-slate-400 font-medium leading-relaxed">
                            Your expertise is shaping future leaders. Check your recent performance and pending evaluations below.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-8 bg-white/5 border border-white/10 rounded-4xl backdrop-blur-xl flex flex-col items-center justify-center text-center">
                            <span className="text-4xl font-black text-white">{analytics?.totalReviews || 0}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-2">Total Evaluated</span>
                        </div>
                        <div className="p-8 bg-primary/10 border border-primary/20 rounded-4xl backdrop-blur-xl flex flex-col items-center justify-center text-center">
                            <span className="text-4xl font-black text-primary">{analytics?.globalPending || 0}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary/60 mt-2">Tasks Waiting</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Writing Focus", value: analytics?.practiceReviews || 0, icon: PiNotePencilFill, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Mock Test Mastery", value: analytics?.mockReviews || 0, icon: PiGraduationCapFill, color: "text-purple-500", bg: "bg-purple-50" },
                    { label: "Quality Rating", value: "98%", icon: PiCheckCircleFill, color: "text-emerald-500", bg: "bg-emerald-50" }
                ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        variants={itemVariants}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                                <stat.icon />
                            </div>
                            <PiTrendUpBold className="text-emerald-500 text-xl" />
                        </div>
                        <div className="mt-6">
                            <h4 className="text-4xl font-black text-slate-800">{stat.value}</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Action Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Pending Tasks */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-2xl font-black tracking-tight text-slate-800">Pending <span className="text-primary italic">Evaluations</span></h3>
                        <span className="px-4 py-1 rounded-full bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            {pendingLabs.length} Items
                        </span>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {pendingLabs.length === 0 ? (
                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center space-y-4">
                                <PiCheckCircleFill className="text-6xl text-emerald-500/20" />
                                <h4 className="text-xl font-black text-slate-400 uppercase tracking-widest">Inbox Zero!</h4>
                                <p className="text-slate-400 font-medium">All submissions are currently reviewed.</p>
                            </div>
                        ) : (
                            pendingLabs.map((sub) => {
                                const isLocked = sub.lockedBy && new Date(sub.lockExpiresAt) > new Date();
                                const currentUserEmail = user?.email || localStorage.getItem('user_email');
                                const isLockedByMe = sub.lockedByEmail === currentUserEmail;

                                return (
                                    <div key={sub._id} className="group relative bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-3xl text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                    {sub.testType === 'writing' ? <PiNotePencilFill /> : <PiMicrophoneStageFill />}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-xl text-slate-800 tracking-tight">{sub.userName}</h4>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{sub.testType} Lab</span>
                                                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-300">
                                                            <PiClockFill /> {new Date(sub.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {isLocked && !isLockedByMe ? (
                                                    <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600">
                                                        <PiClockFill className="text-xl animate-pulse" />
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black uppercase tracking-widest">Locked by</span>
                                                            <span className="text-xs font-bold leading-none">{sub?.lockedByName || sub?.lockedByEmail?.split('@')[0]}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleProceed(sub._id)}
                                                        disabled={lockMutation.isPending}
                                                        className="btn btn-primary btn-lg rounded-2xl px-10 font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 group-hover:scale-105 transition-all"
                                                    >
                                                        {lockMutation.isPending ? <span className="loading loading-spinner" /> : "Proceed"}
                                                        <PiArrowRightBold />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6 flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Skill:</span>
                                            <span className="px-3 py-1 rounded-lg bg-slate-100 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                                {sub.title}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </motion.div>

                {/* Side Stats */}
                <motion.div variants={itemVariants} className="space-y-8">
                    <div className="bg-slate-50 rounded-[3rem] p-10 space-y-8">
                        <h4 className="text-xl font-black text-slate-800 tracking-tight">Recent <span className="text-primary italic">Activity</span></h4>
                        
                        <div className="space-y-6">
                            {analytics?.recentActivity?.length > 0 ? (
                                analytics.recentActivity.map((activity, idx) => (
                                    <div key={idx} className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                                            <PiCheckCircleFill />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-700 leading-tight">
                                                Evaluated <span className="text-primary">{activity.studentName}'s</span> {activity.testType} submission
                                            </p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
                                                {new Date(activity.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs font-medium text-slate-400 italic">No recent evaluations found.</p>
                            )}
                        </div>

                        <button 
                            onClick={() => navigate("/dashboard/grade-submissions")}
                            className="btn btn-ghost btn-block rounded-2xl bg-white border border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all py-8"
                        >
                            View All Evaluations
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-primary to-blue-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-primary/30">
                        <PiGraduationCapFill className="text-5xl opacity-30 mb-6" />
                        <h4 className="text-2xl font-black tracking-tight leading-tight">Your Impact is Growing</h4>
                        <p className="text-sm font-medium opacity-80 mt-4 leading-relaxed">
                            You've helped over 150 students this month reach their desired band scores. Keep up the great work!
                        </p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};