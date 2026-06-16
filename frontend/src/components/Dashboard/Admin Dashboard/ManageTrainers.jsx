import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import useAdminQuery from "../../../hooks/useAdminQuery";
import useFormModal from "../../../hooks/useFormModal";
import PageHeader from "../../Common/PageHeader";
import TableShell from "../../Common/TableShell";
import StatCard from "../../Common/StatCard";
import AdminModal from "../../Common/AdminModal";
import HoverActions from "../../Common/HoverActions";

const ManageTrainers = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const initialFormState = {
        name: "",
        email: "",
        specialty: "",
        experience: "",
        bio: "",
        imageUrl: "",
        rating: 5.0
    };

    const { isOpen: isModalOpen, formData, openModal, closeModal, handleChange } = useFormModal(initialFormState);

    // 1. Fetch data
    const { data: result = {}, isLoading } = useAdminQuery(
        ["trainers"],
        "/trainers"
    );

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
            closeModal();
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

    const handleAddTrainerSubmit = (e) => {
        e.preventDefault();
        const { name, email, specialty, experience, bio, rating } = formData;
        if (!name || !email || !specialty || !experience || !bio) {
            toast.error("Please fill in all required fields.");
            return;
        }
        addMutation.mutate({
            ...formData,
            rating: Number(rating)
        });
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
            <PageHeader
                preTitle="Administration"
                title={<span>Manage <span className="text-primary italic">Trainers</span></span>}
                subtitle="Register, monitor, and configure MOCKEA educators"
                icon={<PiUserPlus className="text-primary text-2xl" />}
                action={
                    <button 
                        onClick={() => openModal()}
                        className="btn btn-primary btn-lg rounded-2xl h-14 font-black shadow-xl shadow-primary/30 flex items-center gap-2 group cursor-pointer"
                    >
                        <PiPlus className="group-hover:rotate-90 transition-transform duration-300" />
                        ADD NEW TRAINER
                    </button>
                }
            />

            {/* Metrics summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard
                    icon={<PiCards />}
                    value={trainers.length}
                    label="Total Educators"
                    color="blue"
                />
                <StatCard
                    icon={<PiBriefcase />}
                    value={[...new Set(trainers.map(t => t.specialty))].length}
                    label="Unique Specialties"
                    color="purple"
                />
            </div>

            {/* Trainers table list */}
            <TableShell
                isLoading={isLoading}
                empty={trainers.length === 0}
                emptyTitle="No Trainers Registered"
                emptyText="Get started by creating your very first expert trainer using the add button!"
                emptyIcon={<PiUserPlus />}
                loadingText="Loading trainers list..."
            >
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
                                        <HoverActions
                                            onDelete={() => handleDeleteClick(t)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TableShell>

            {/* Slide-over Form Modal */}
            <AdminModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title="Add New Trainer"
                subtitle="Register a certified mentor"
                slideOver={true}
                footer={
                    <>
                        <button 
                            onClick={closeModal}
                            className="btn btn-ghost flex-1 rounded-2xl h-14 font-bold"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleAddTrainerSubmit}
                            disabled={addMutation.isPending}
                            className="btn btn-primary flex-1 rounded-2xl h-14 font-black shadow-xl"
                        >
                            {addMutation.isPending ? (
                                <PiSpinner className="w-5 h-5 animate-spin" />
                            ) : (
                                "REGISTER TRAINER"
                            )}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleAddTrainerSubmit} className="space-y-5">
                    {/* Name Input */}
                    <div className="form-control">
                        <label className="label text-xs font-black uppercase tracking-widest text-base-content/50">Full Name *</label>
                        <input 
                            type="text" 
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
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
                            onChange={handleChange}
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
                                onChange={handleChange}
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
                                onChange={handleChange}
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
                                onChange={handleChange}
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
                                onChange={handleChange}
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
                            onChange={handleChange}
                            placeholder="Write a brief professional background bio..." 
                            className="textarea textarea-bordered w-full rounded-2xl h-32 p-4 font-semibold font-sans resize-none"
                        />
                    </div>
                </form>
            </AdminModal>
        </div>
    );
};

export default ManageTrainers;
