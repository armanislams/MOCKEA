import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { 
    PiBookOpen, 
    PiEar, 
    PiPencilLine, 
    PiMicrophoneStage, 
    PiTrash, 
    PiPencilSimple,
    PiPlus
} from "react-icons/pi";
import { Link } from "react-router";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const ManageQuestions = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const { data: questions = [], isLoading } = useQuery({
        queryKey: ["admin-questions"],
        queryFn: async () => {
            const res = await axiosSecure.get("/questions");
            return res.data.questions ?? [];
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axiosSecure.delete(`/questions/${id}`),
        onSuccess: () => {
            Swal.fire({
                title: "Deleted!",
                text: "The question has been removed from the bank.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
                background: "#ffffff",
                customClass: {
                    popup: "rounded-[2rem]"
                }
            });
            queryClient.invalidateQueries(["admin-questions"]);
        }
    });

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This question will be permanently removed from the question bank.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#EF4444",
            cancelButtonColor: "#6B7280",
            confirmButtonText: "Yes, delete it!",
            background: "#ffffff",
            customClass: {
                popup: "rounded-[2rem]",
                confirmButton: "rounded-xl px-6 py-2.5 font-bold",
                cancelButton: "rounded-xl px-6 py-2.5 font-bold"
            }
        });

        if (result.isConfirmed) {
            deleteMutation.mutate(id);
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'reading': return <PiBookOpen className="text-blue-500" />;
            case 'listening': return <PiEar className="text-purple-500" />;
            case 'writing': return <PiPencilLine className="text-orange-500" />;
            case 'speaking': return <PiMicrophoneStage className="text-green-500" />;
            default: return <PiBookOpen />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Question Bank</h1>
                    <p className="text-base-content/60">Manage all IELTS questions across different sections.</p>
                </div>
                <Link to="/dashboard/admin/add-questions" className="btn btn-primary rounded-2xl gap-2">
                    <PiPlus /> Add Questions
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-48 bg-base-300 animate-pulse rounded-3xl" />)
                ) : (
                    questions.map((q) => (
                        <div key={q._id} className="card bg-white border border-base-300 shadow-sm p-6 hover:shadow-md transition-shadow group">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-2xl bg-base-100 text-2xl">
                                        {getIcon(q.testType)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold line-clamp-1">{q.title}</h3>
                                        <p className="text-xs uppercase tracking-widest text-base-content/50 font-semibold">{q.testType}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="btn btn-ghost btn-xs btn-circle text-primary"><PiPencilSimple /></button>
                                    <button 
                                        onClick={() => handleDelete(q._id)}
                                        className="btn btn-ghost btn-xs btn-circle text-error"
                                    >
                                        <PiTrash />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mt-6 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="badge badge-outline badge-sm">{q.questions?.length || 0} Questions</span>
                                    <span className={`badge badge-sm ${q.forPlanType === 'premium' ? 'badge-accent' : 'badge-ghost'}`}>{q.forPlanType}</span>
                                </div>
                                <span className="text-[10px] text-base-content/40">Created {new Date(q.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManageQuestions;
