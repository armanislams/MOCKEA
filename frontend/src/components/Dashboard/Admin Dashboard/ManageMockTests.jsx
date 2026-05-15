import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { 
    PiTrash, 
    PiPencilSimple,
    PiPlus,
    PiFiles,
    PiClock,
    PiUsers,
    PiTrophy
} from "react-icons/pi";
import { Link, useNavigate } from "react-router";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const ManageMockTests = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: tests = [], isLoading } = useQuery({
        queryKey: ["admin-mock-tests"],
        queryFn: async () => {
            const res = await axiosSecure.get("/mock-tests");
            return res.data.tests ?? [];
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axiosSecure.delete(`/mock-tests/${id}`),
        onSuccess: () => {
            Swal.fire({
                title: "Deleted!",
                text: "The mock test has been removed.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
                background: "#ffffff",
                customClass: {
                    popup: "rounded-[2rem]"
                }
            });
            queryClient.invalidateQueries(["admin-mock-tests"]);
        }
    });

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone. All results associated with this test might be affected.",
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Manage Mock Tests</h1>
                    <p className="text-base-content/60">View, edit, and manage all full-length IELTS mock tests.</p>
                </div>
                <Link to="/dashboard/admin/create-mock-test" className="btn btn-primary rounded-2xl gap-2">
                    <PiPlus /> Create Mock Test
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isLoading ? (
                    [1, 2].map(i => <div key={i} className="h-64 bg-base-300 animate-pulse rounded-3xl" />)
                ) : (
                    tests.map((test) => (
                        <div key={test._id} className="card bg-white border border-base-300 shadow-sm p-8 hover:shadow-md transition-shadow group relative overflow-hidden">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <PiTrophy className="w-32 h-32" />
                            </div>

                            <div className="flex items-start justify-between relative z-10">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-2xl bg-primary/10 text-primary text-2xl">
                                            <PiFiles />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl">{test.title}</h3>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="flex items-center gap-1 text-xs font-semibold text-base-content/40 uppercase tracking-widest">
                                                    <PiClock className="text-primary" /> {test.totalDuration || 165} Mins
                                                </span>
                                                <span className={`badge badge-sm ${test.planType === 'premium' ? 'badge-accent' : 'badge-ghost'}`}>
                                                    {test.planType}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        {['Reading', 'Listening', 'Writing', 'Speaking'].map(module => (
                                            <div key={module} className="flex items-center gap-2 text-sm text-base-content/60 bg-base-100 p-3 rounded-xl border border-base-200">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                <span className="font-medium">{module}</span>
                                                <span className="ml-auto text-xs font-bold text-primary">
                                                    {test.sections?.[module.toLowerCase()]?.length || 0} Q
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                                    <button  className="btn btn-square btn-ghost btn-md text-primary bg-base-100 shadow-sm border-base-200">
                                        <PiPencilSimple className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(test._id)}
                                        className="btn btn-square btn-ghost btn-md text-error bg-base-100 shadow-sm border-base-200"
                                    >
                                        <PiTrash className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mt-8 flex items-center justify-between border-t border-base-100 pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-base-200 flex items-center justify-center text-[10px] font-bold text-base-content/40">
                                                U{i}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-xs text-base-content/40 font-medium">124 Students attempted</span>
                                </div>
                                <span className="text-[10px] text-base-content/40 font-bold uppercase tracking-tighter">
                                    Last Updated: {new Date(test.updatedAt || test.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {!isLoading && tests.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-base-300 rounded-[3rem] text-center space-y-4">
                    <div className="w-20 h-20 bg-base-100 rounded-full flex items-center justify-center text-3xl text-base-content/20">
                        <PiFiles />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">No Mock Tests Yet</h2>
                        <p className="text-base-content/50 max-w-xs mx-auto mt-1">Create your first full-length IELTS mock test to help students practice.</p>
                    </div>
                    <Link to="/dashboard/admin/create-mock-test" className="btn btn-primary rounded-2xl px-8">
                        Get Started
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ManageMockTests;
