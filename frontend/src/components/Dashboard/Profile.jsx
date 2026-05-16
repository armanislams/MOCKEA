import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Loader from "../Loader/Loader";
import { 
    PiUserCircleFill, 
    PiEnvelopeSimpleFill, 
    PiCrownFill, 
    PiShieldCheckFill,
    PiCalendarBlankFill,
    PiIdentificationCardFill,
    PiPencilFill,
    PiSparkleFill,
    PiStarFill,
    PiLightningFill
} from "react-icons/pi";

const PLAN_CONFIG = {
    free: {
        name: "Free Tier",
        color: "bg-white/5 border-white/10 text-white/60",
        icon: null,
        benefits: [
            "Limited Daily Mock Tests",
            "Community Writing Support",
            "Standard Lab Access",
            "Basic Performance Tracking"
        ],
        buttonText: "Upgrade to Elite Tier",
        buttonColor: "btn-warning"
    },
    standard: {
        name: "Standard",
        color: "bg-indigo-500/20 border-indigo-500/40 text-indigo-300",
        icon: <PiStarFill />,
        benefits: [
            "10 Full Mock Tests Monthly",
            "AI Writing Feedback",
            "Extended Lab Access",
            "Advanced Analytics"
        ],
        buttonText: "Upgrade to Premium",
        buttonColor: "btn-primary"
    },
    premium: {
        name: "Premium Elite",
        color: "bg-amber-500/20 border-amber-500/40 text-amber-300",
        icon: <PiCrownFill />,
        benefits: [
            "Unlimited Full Mock Tests",
            "AI-Powered Writing Evaluation",
            "Speaking Lab Priority Access",
            "Detailed Growth Analytics"
        ],
        buttonText: "Plan Active",
        buttonColor: "btn-disabled"
    },
    admin: {
        name: "Administrator",
        color: "bg-red-500/20 border-red-500/40 text-red-300",
        icon: <PiLightningFill />,
        benefits: [
            "Full System Access",
            "User Management Rights",
            "Content Moderation",
            "System Performance Metrics"
        ],
        buttonText: "Admin Access",
        buttonColor: "btn-error"
    },
    instructor: {
        name: "Official Instructor",
        color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
        icon: <PiPencilFill />,
        benefits: [
            "Review All Student Submissions",
            "Grade Writing & Speaking Labs",
            "Professional Feedback Tools",
            "Manage Student Progress"
        ],
        buttonText: "Instructor Panel",
        buttonColor: "btn-success"
    }
};

const Profile = () => {
    const { user: authUser } = useAuth();
    const axiosSecure = useAxiosSecure();

    const { data: userData, isLoading } = useQuery({
        queryKey: ["user-profile", authUser?.email],
        queryFn: async () => {
            const { data } = await axiosSecure.get(`/user/${authUser?.email}`);
            return data?.user || null;
        },
        enabled: !!authUser?.email
    });

    if (isLoading) return <Loader />;

    const name = userData?.name || authUser?.displayName || authUser?.email?.split('@')[0] || 'Student';
    const rawPlan = (userData?.role === 'admin' ? 'admin' : (userData?.role === 'instructor' ? 'instructor' : (userData?.plan || 'free'))).toLowerCase();
    const config = PLAN_CONFIG[rawPlan] || PLAN_CONFIG.free;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-4xl mx-auto space-y-10 pb-20"
        >
            {/* --- DIGITAL ID CARD --- */}
            <motion.section 
                variants={item}
                className="relative overflow-hidden rounded-[3.5rem] bg-linear-to-br from-indigo-900 to-slate-900 p-12 text-white shadow-2xl"
            >
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-white/10 backdrop-blur-xl border-4 border-white/20 flex items-center justify-center text-6xl shadow-2xl">
                            {authUser?.photoURL ? (
                                <img src={authUser.photoURL} alt={name} className="w-full h-full object-cover rounded-[2.5rem]" />
                            ) : (
                                <PiUserCircleFill className="text-white/40" />
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-primary p-2 rounded-xl shadow-lg">
                            <PiPencilFill className="text-xs" />
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="text-center md:text-left space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border border-white/10">
                            <PiIdentificationCardFill /> Digital {userData?.role || 'Student'} ID
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tighter capitalize">{name}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                                <PiEnvelopeSimpleFill className="text-primary" /> {userData?.email || authUser?.email}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                                <PiCalendarBlankFill className="text-primary" /> Joined {new Date(userData?.createdAt || authUser?.metadata?.creationTime).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                    </div>

                    {/* Plan Badge */}
                    <div className="md:ml-auto text-center md:text-right">
                        <div className={`px-6 py-4 rounded-4xl border backdrop-blur-md shadow-xl ${config.color}`}>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Current Tier</div>
                            <div className="text-2xl font-black flex items-center justify-center md:justify-end gap-2">
                                {config.icon}
                                {config.name}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
            </motion.section>

            {/* --- ACCOUNT DETAILS --- */}
            <div className="grid gap-8 md:grid-cols-2">
                <motion.section variants={item} className="card bg-white border border-base-300 p-10 rounded-[3rem] shadow-sm">
                    <h2 className="text-xl font-black tracking-tight mb-8 flex items-center gap-3">
                        <PiShieldCheckFill className="text-primary text-2xl" />
                        Account Security
                    </h2>
                    <div className="space-y-6">
                        <div className="p-5 bg-base-100 rounded-3xl border border-base-200">
                            <div className="text-[10px] font-black uppercase tracking-widest text-base-content/40 mb-1">Auth Provider</div>
                            <div className="font-bold capitalize">{authUser?.providerData?.[0]?.providerId?.split('.')[0] || 'Firebase'}</div>
                        </div>
                        <div className="p-5 bg-base-100 rounded-3xl border border-base-200">
                            <div className="text-[10px] font-black uppercase tracking-widest text-base-content/40 mb-1">Account Status</div>
                            <div className="flex items-center gap-2 font-bold text-success">
                                <PiShieldCheckFill /> {userData?.isBanned ? 'Restricted' : 'Verified Security Status'}
                            </div>
                        </div>
                        <button className="btn btn-primary btn-block rounded-2xl h-14 font-black shadow-lg shadow-primary/10">
                            Update Profile
                        </button>
                    </div>
                </motion.section>

                <motion.section variants={item} className="card bg-white border border-base-300 p-10 rounded-[3rem] shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 text-primary/5 text-9xl">
                        <PiSparkleFill />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-xl font-black tracking-tight mb-8 flex items-center gap-3">
                            {config.icon || <PiCrownFill className="text-amber-500 text-2xl" />}
                            {config.name} Benefits
                        </h2>
                        <ul className="space-y-4 mb-10">
                            {config.benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-sm font-bold text-base-content/60">
                                    <PiShieldCheckFill className="text-success text-lg" />
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                        {rawPlan !== 'premium' && rawPlan !== 'admin' && (
                            <button className={`btn ${config.buttonColor} btn-block rounded-2xl h-14 font-black shadow-xl shadow-warning/20`}>
                                {config.buttonText}
                            </button>
                        )}
                    </div>
                </motion.section>
            </div>

            <motion.section variants={item} className="p-8 text-center bg-primary/5 rounded-[2.5rem] border border-primary/10">
                <p className="text-xs font-bold text-primary/60 italic leading-relaxed">
                    "Your MOCKEA profile is your official gateway to IELTS excellence. Keep your details updated to receive the most accurate performance insights."
                </p>
            </motion.section>
        </motion.div>
    );
};

export default Profile;
