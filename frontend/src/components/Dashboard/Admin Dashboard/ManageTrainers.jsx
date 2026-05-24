import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { 
    PiUserPlus, 
    PiTrash, 
    PiCards, 
    PiBriefcase, 
    PiEnvelope,
    PiSpinner,
    PiPlus,
    PiX
} from "react-icons/pi";
import { motion, AnimatePresence } from "framer-motion";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const ManageTrainers = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form inputs state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        specialty: "",
        experience: "",
        bio: "",
        imageUrl: "",
        rating: 5.0
    });

    // 1. Fetch data
    const { data: result = {}, isLoading } = useQuery({
        queryKey: ["trainers"],
        queryFn: async () => {
            const res = await axiosSecure.get("/trainers");
            return res.data;
        }
    });

    const trainers = result.trainers || [];

    // 2. Add Trainer Mutation
    const addMutation = useMutation({
        mutationFn: async (newTrainer) => {
            const res = await axiosSecure.post("/trainers/add", newTrainer);
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || "Trainer added successfully!");
            queryClient.invalidateQueries(["trainers"]);
            setIsModalOpen(false);
            // Reset form
            setFormData({
                name: "",
                email: "",
                specialty: "",
                experience: "",
                bio: "",
                imageUrl: "",
                rating: 5.0
            });
        },
        onError: (error) => {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to add trainer");
        }
    });

    // 3. Delete Trainer Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await axiosSecure.delete(`/trainers/${id}`);
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || "Trainer deleted successfully!");
            queryClient.invalidateQueries(["trainers"]);
        },
        onError: (error) => {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to delete trainer");
        }
    });

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "rating" ? Number(value) : value
        }));
    };

    const handleAddTrainerSubmit = (e) => {
        e.preventDefault();
        const { name, email, specialty, experience, bio } = formData;
        if (!name || !email || !specialty || !experience || !bio) {
            toast.error("Please fill in all required fields.");
            return;
        }
        addMutation.mutate(formData);
    };

    const handleDeleteClick = async (trainer) => {
        const result = await Swal.fire({
            title: "Delete Trainer?",
            text: `Are you sure you want to delete ${trainer.name}? This action cannot be undone.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#EF4444",
            cancelButtonColor: "#6B7280",
            confirmButtonText: "Yes, Delete",
            background: "#ffffff",
            customClass: {
                container: "z-[99999]",
                popup: "rounded-[2rem]",
                confirmButton: "rounded-xl px-8 py-3 font-bold",
                cancelButton: "rounded-xl px-8 py-3 font-bold"
            }
        });

        if (result.isConfirmed) {
            deleteMutation.mutate(trainer._id);
        }
    };

    return (
        <div className="space-y-10 pb-24 max-w-7xl mx-auto">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-800">
                        Manage <span className="text-primary italic">Trainers</span>
                    </h1>
                    <p className="text-xs font-bold text-base-content/30 uppercase tracking-widest mt-1">
                        Register, monitor, and configure MOCKEA educators
                    </p>
                </div>

                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary btn-lg rounded-2xl h-14 font-black shadow-xl shadow-primary/30 flex items-center gap-2 group"
                >
                    <PiPlus className="group-hover:rotate-90 transition-transform duration-300" />
                    ADD NEW TRAINER
                </button>
            </div>

            {/* Metrics summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-5 p-6 rounded-3xl bg-white border border-base-200 shadow-sm">
                    <div className="h-14 w-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-2xl shadow-inner">
                        <PiCards />
                    </div>
                    <div>
                        <div className="text-3xl font-black tracking-tighter text-slate-800">{trainers.length}</div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40">Total Educators</div>
                    </div>
                </div>

                <div className="flex items-center gap-5 p-6 rounded-3xl bg-white border border-base-200 shadow-sm">
                    <div className="h-14 w-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-2xl shadow-inner">
                        <PiBriefcase />
                    </div>
                    <div>
                        <div className="text-3xl font-black tracking-tighter text-slate-800">
                            {[...new Set(trainers.map(t => t.specialty))].length}
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40">Unique Specialties</div>
                    </div>
                </div>
            </div>

            {/* Trainers table list */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white rounded-[3rem] border border-base-200 shadow-sm">
                    <PiSpinner className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-sm font-black text-base-content/40 uppercase tracking-widest animate-pulse">Loading list...</p>
                </div>
            ) : trainers.length === 0 ? (
                <div className="card bg-white p-16 text-center border border-base-200 rounded-[3rem] shadow-sm space-y-4">
                    <div className="w-20 h-20 bg-base-100 text-base-content/20 rounded-full flex items-center justify-center mx-auto text-3xl">
                        <PiUserPlus />
                    </div>
                    <h3 className="text-2xl font-black text-slate-700">No Trainers Registered</h3>
                    <p className="text-base-content/50 max-w-sm mx-auto">Get started by creating your very first expert trainer using the add button!</p>
                </div>
            ) : (
                <div className="card bg-white rounded-[3rem] border border-base-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table table-lg w-full text-left">
                            <thead className="bg-base-50/50 border-b border-base-200 text-base-content/40 text-[10px] font-black uppercase tracking-widest">
                                <tr>
                                    <th>Educator</th>
                                    <th>Email</th>
                                    <th>Specialty</th>
                                    <th>Experience</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-100">
                                {trainers.map((t) => (
                                    <tr key={t._id} className="hover:bg-base-50/20 transition-colors font-medium">
                                        <td>
                                            <div className="flex items-center gap-4">
                                                <div className="avatar placeholder">
                                                    <div className="w-12 h-12 rounded-[1rem] bg-indigo-50 border border-indigo-100 text-primary flex items-center justify-center font-black text-lg shadow-inner">
                                                        {t.imageUrl ? (
                                                            <img src={t.imageUrl} alt={t.name} className="object-cover animate-fade-in" />
                                                        ) : (
                                                            <span>{t.name.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-extrabold text-slate-700 leading-snug">{t.name}</h4>
                                                    <div className="text-[10px] font-black text-amber-500 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                                                        ★ {t.rating?.toFixed(1) || "5.0"} Rating
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-sm font-semibold text-base-content/70">
                                            <span className="flex items-center gap-1.5"><PiEnvelope className="text-primary/40" /> {t.email}</span>
                                        </td>
                                        <td>
                                            <span className="badge badge-primary px-3 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest">
                                                {t.specialty}
                                            </span>
                                        </td>
                                        <td className="text-xs font-black text-base-content/40 uppercase tracking-widest">
                                            {t.experience}
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => handleDeleteClick(t)}
                                                className="btn btn-ghost btn-circle text-error hover:bg-error/10"
                                            >
                                                <PiTrash className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Slide-over Form Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[1050] flex items-center justify-end p-0 bg-black/60 backdrop-blur-xs">
                        {/* Backdrop close click area */}
                        <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />

                        {/* Modal Box */}
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "tween", duration: 0.35 }}
                            className="relative z-10 w-full max-w-xl h-full bg-white shadow-2xl flex flex-col justify-between p-10 overflow-y-auto"
                        >
                            <div className="space-y-8">
                                <div className="flex justify-between items-center border-b border-base-200 pb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800">Add New Trainer</h2>
                                        <p className="text-xs font-bold text-base-content/30 uppercase tracking-widest mt-1">Register a certified mentor</p>
                                    </div>
                                    <button 
                                        onClick={() => setIsModalOpen(false)}
                                        className="btn btn-circle btn-ghost"
                                    >
                                        <PiX className="w-6 h-6 text-base-content/60" />
                                    </button>
                                </div>

                                <form onSubmit={handleAddTrainerSubmit} className="space-y-5">
                                    {/* Name Input */}
                                    <div className="form-control">
                                        <label className="label text-xs font-black uppercase tracking-widest text-base-content/50">Full Name *</label>
                                        <input 
                                            type="text" 
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleFormChange}
                                            placeholder="Enter full name" 
                                            className="input input-bordered w-full rounded-2xl h-14 font-semibold"
                                        />
                                    </div>

                                    {/* Email Input */}
                                    <div className="form-control">
                                        <label className="label text-xs font-black uppercase tracking-widest text-base-content/50">Email Address *</label>
                                        <input 
                                            type="email" 
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleFormChange}
                                            placeholder="trainer@mockea.com" 
                                            className="input input-bordered w-full rounded-2xl h-14 font-semibold"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Specialty Input */}
                                        <div className="form-control">
                                            <label className="label text-xs font-black uppercase tracking-widest text-base-content/50">Specialty *</label>
                                            <input 
                                                type="text" 
                                                name="specialty"
                                                required
                                                value={formData.specialty}
                                                onChange={handleFormChange}
                                                placeholder="e.g. IELTS Writing Coach" 
                                                className="input input-bordered w-full rounded-2xl h-14 font-semibold"
                                            />
                                        </div>

                                        {/* Experience Input */}
                                        <div className="form-control">
                                            <label className="label text-xs font-black uppercase tracking-widest text-base-content/50">Experience *</label>
                                            <input 
                                                type="text" 
                                                name="experience"
                                                required
                                                value={formData.experience}
                                                onChange={handleFormChange}
                                                placeholder="e.g. 5+ Years" 
                                                className="input input-bordered w-full rounded-2xl h-14 font-semibold"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Image URL Input */}
                                        <div className="form-control">
                                            <label className="label text-xs font-black uppercase tracking-widest text-base-content/50">Avatar Image URL</label>
                                            <input 
                                                type="url" 
                                                name="imageUrl"
                                                value={formData.imageUrl}
                                                onChange={handleFormChange}
                                                placeholder="https://example.com/avatar.jpg" 
                                                className="input input-bordered w-full rounded-2xl h-14 font-semibold"
                                            />
                                        </div>

                                        {/* Rating Input */}
                                        <div className="form-control">
                                            <label className="label text-xs font-black uppercase tracking-widest text-base-content/50">Rating (1.0 - 5.0)</label>
                                            <input 
                                                type="number" 
                                                name="rating"
                                                step="0.1"
                                                min="1.0"
                                                max="5.0"
                                                value={formData.rating}
                                                onChange={handleFormChange}
                                                placeholder="5.0" 
                                                className="input input-bordered w-full rounded-2xl h-14 font-semibold"
                                            />
                                        </div>
                                    </div>

                                    {/* Bio Input */}
                                    <div className="form-control">
                                        <label className="label text-xs font-black uppercase tracking-widest text-base-content/50">Biography *</label>
                                        <textarea 
                                            name="bio"
                                            required
                                            value={formData.bio}
                                            onChange={handleFormChange}
                                            placeholder="Write a brief professional background bio..." 
                                            className="textarea textarea-bordered w-full rounded-2xl h-32 p-4 font-semibold font-sans resize-none"
                                        />
                                    </div>
                                </form>
                            </div>

                            {/* Submit Button Row */}
                            <div className="pt-6 border-t border-base-200 flex gap-4 mt-6">
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn btn-ghost flex-1 rounded-2xl h-14 font-bold"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleAddTrainerSubmit}
                                    disabled={addMutation.isLoading}
                                    className="btn btn-primary flex-1 rounded-2xl h-14 font-black shadow-xl"
                                >
                                    {addMutation.isLoading ? (
                                        <PiSpinner className="w-5 h-5 animate-spin" />
                                    ) : (
                                        "REGISTER TRAINER"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageTrainers;
