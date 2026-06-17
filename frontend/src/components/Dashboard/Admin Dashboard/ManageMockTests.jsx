import { useMutation } from "@tanstack/react-query";
import { 
    PiPlus,
    PiFiles,
    PiClock,
    PiTrophy
} from "react-icons/pi";
import { Link, useNavigate } from "react-router";
import useAdminQuery from "../../../hooks/useAdminQuery";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { DEFAULT_MOCK_TEST_DURATION_MINUTES } from "../../../constants";
import PageHeader from "../../Common/PageHeader";
import TableShell from "../../Common/TableShell";
import HoverActions from "../../Common/HoverActions";
import alerts from "../../../utils/alerts";

const ManageMockTests = () => {
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();

    const { data: tests = [], isLoading, isError, refetch } = useAdminQuery(
        ["admin-mock-tests"],
        "/mock-tests",
        "tests"
    );

    const deleteMutation = useMutation({
        mutationFn: (id) => axiosSecure.delete(`/mock-tests/${id}`),
        onSuccess: () => {
            alerts.success("Deleted!", "The mock test has been removed.");
            refetch();
        }
    });

    const handleDelete = async (id) => {
        const result = await alerts.confirmAction({
            title: "Are you sure?",
            text: "This action cannot be undone. All results associated with this test might be affected.",
            confirmText: "Yes, delete it!",
            danger: true
        });

        if (result.isConfirmed) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Manage Mock Tests"
                subtitle="View, edit, and manage all full-length IELTS mock tests."
                action={
                    <Link to="/dashboard/admin/create-mock-test" className="btn btn-primary rounded-2xl gap-2 font-bold">
                        <PiPlus /> Create Mock Test
                    </Link>
                }
            />

            <TableShell
                isLoading={isLoading}
                isError={isError}
                errorText="Failed to load mock tests"
                onRetry={refetch}
                empty={tests.length === 0}
                emptyTitle="No Mock Tests Yet"
                emptyText="Create your first full-length IELTS mock test to help students practice."
                emptyIcon={<PiFiles />}
                transparent={true}
                loadingText="Loading mock tests list..."
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {tests.map((test) => (
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
                                                    <PiClock className="text-primary" /> {test.totalDuration || DEFAULT_MOCK_TEST_DURATION_MINUTES} Mins
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

                                <HoverActions
                                    onEdit={() => {}} // Visual placeholder as edit route is not defined
                                    onDelete={() => handleDelete(test._id)}
                                    className="flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4"
                                />
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
                    ))}
                </div>
            </TableShell>
        </div>
    );
};

export default ManageMockTests;
