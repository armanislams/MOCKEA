import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    PiBookOpen, 
    PiEar, 
    PiPencilLine, 
    PiMicrophoneStage, 
    PiPlus,
    PiCheckCircle,
    PiInfo,
    PiSquaresFour,
    PiList,
    PiFunnel,
    PiMagnifyingGlass
} from "react-icons/pi";
import { Link, useNavigate } from "react-router";
import useAdminQuery from "../../../hooks/useAdminQuery";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import PageHeader from "../../Common/PageHeader";
import TableShell from "../../Common/TableShell";
import AdminModal from "../../Common/AdminModal";
import HoverActions from "../../Common/HoverActions";
import alerts from "../../../utils/alerts";

const ManageQuestions = () => {
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [viewMode, setViewMode] = useState("grid"); // "grid" or "table"
    const [filterType, setFilterType] = useState("all");
    const [filterPlan, setFilterPlan] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const { data: questions = [], isLoading, isError, refetch } = useAdminQuery(
        ["admin-questions"],
        "/questions",
        "questions"
    );

    const uniqueTypes = useMemo(() => {
        const types = [...new Set(questions.map((q) => q.testType).filter(Boolean))];
        return ["all", ...types];
    }, [questions]);

    const filteredQuestions = useMemo(() => {
        return questions.filter((q) => {
            const matchesType = filterType === "all" || q.testType === filterType;
            const matchesPlan = filterPlan === "all" || q.forPlanType === filterPlan;
            const matchesStatus = filterStatus === "all" ||
                (filterStatus === "active" ? q.isActive !== false : q.isActive === false);
            let matchesSearch = true;
            if (searchQuery) {
                try {
                    const regex = new RegExp(searchQuery, "i");
                    matchesSearch = regex.test(q.title || "");
                } catch (e) {
                    matchesSearch = q.title?.toLowerCase().includes(searchQuery.toLowerCase());
                }
            }
            return matchesType && matchesPlan && matchesStatus && matchesSearch;
        });
    }, [questions, filterType, filterPlan, filterStatus, searchQuery]);

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, isActive }) => axiosSecure.put(`/questions/${id}`, { isActive }),
        onSuccess: () => {
            alerts.success("Status Updated", "The question set status has been updated.");
            queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
            queryClient.invalidateQueries({ queryKey: ["admin-questions-for-bundle"] });
            refetch();
        },
        onError: (err) => {
            alerts.error("Error", err.response?.data?.message || "Failed to update status.");
        }
    });

    const handleToggleStatus = (id, currentStatus) => {
        toggleStatusMutation.mutate({ id, isActive: !currentStatus });
    };

    const deleteMutation = useMutation({
        mutationFn: (id) => axiosSecure.delete(`/questions/${id}`),
        onSuccess: () => {
            alerts.success("Deleted!", "The question has been removed from the bank.");
            queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
            queryClient.invalidateQueries({ queryKey: ["admin-questions-for-bundle"] });
            refetch();
        }
    });

    const handleDelete = async (id) => {
        const result = await alerts.confirmDelete("question");

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

    const handleShowTitleIfClipped = (e, title) => {
        const el = e.currentTarget;
        if (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight) {
            el.setAttribute("title", title);
        } else {
            el.removeAttribute("title");
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Question Bank"
                subtitle="Manage all IELTS questions across different sections."
                action={
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search questions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-700 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm w-40 sm:w-56"
                            />
                            <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
                        </div>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="btn btn-outline border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 shadow-sm flex items-center gap-2 bg-white h-auto min-h-0"
                            >
                                <PiFunnel className="text-sm" />
                                <span>Filter</span>
                                {(filterType !== "all" || filterPlan !== "all" || filterStatus !== "all") && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                            </button>
                            {isFilterOpen && (
                                <>
                                    {/* Backdrop to capture outside clicks and close the panel */}
                                    <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setIsFilterOpen(false)} 
                                    />
                                    <div
                                        className="absolute right-0 z-20 p-4 shadow-xl bg-white border border-slate-100 rounded-2xl w-60 mt-2 space-y-3.5"
                                    >
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Module Type</label>
                                            <select
                                                value={filterType}
                                                onChange={(e) => setFilterType(e.target.value)}
                                                className="select select-bordered select-sm rounded-xl w-full text-xs font-bold text-slate-700 bg-white"
                                            >
                                                {uniqueTypes.map((type) => (
                                                    <option key={type} value={type}>
                                                        {type === "all" ? "All Types" : type}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Plan Tier</label>
                                            <select
                                                value={filterPlan}
                                                onChange={(e) => setFilterPlan(e.target.value)}
                                                className="select select-bordered select-sm rounded-xl w-full text-xs font-bold text-slate-700 bg-white"
                                            >
                                                <option value="all">All Plans</option>
                                                <option value="free">Free</option>
                                                <option value="standard">Standard</option>
                                                <option value="premium">Premium</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Active Status</label>
                                            <select
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value)}
                                                className="select select-bordered select-sm rounded-xl w-full text-xs font-bold text-slate-700 bg-white"
                                            >
                                                <option value="all">All Status</option>
                                                <option value="active">Active Only</option>
                                                <option value="disabled">Disabled Only</option>
                                            </select>
                                        </div>
                                        {(filterType !== "all" || filterPlan !== "all" || filterStatus !== "all") && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFilterType("all");
                                                    setFilterPlan("all");
                                                    setFilterStatus("all");
                                                }}
                                                className="btn btn-xs btn-ghost text-red-500 hover:bg-red-50 rounded-lg w-full font-bold mt-1"
                                            >
                                                Clear Filters
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="join bg-base-100 border border-base-300 rounded-2xl p-0.5 shadow-sm">
                            <button 
                                onClick={() => setViewMode("grid")}
                                className={`btn btn-sm btn-ghost join-item rounded-xl gap-1.5 ${viewMode === "grid" ? "bg-primary text-white hover:bg-primary/95" : "text-base-content/70"}`}
                            >
                                <PiSquaresFour className="text-lg" /> Grid
                            </button>
                            <button 
                                onClick={() => setViewMode("table")}
                                className={`btn btn-sm btn-ghost join-item rounded-xl gap-1.5 ${viewMode === "table" ? "bg-primary text-white hover:bg-primary/95" : "text-base-content/70"}`}
                            >
                                <PiList className="text-lg" /> Table
                            </button>
                        </div>
                        <Link to="/dashboard/admin/add-questions" className="btn btn-primary rounded-2xl gap-2 font-bold">
                            <PiPlus /> Add Questions
                        </Link>
                    </div>
                }
            />

            <TableShell
                isLoading={isLoading}
                isError={isError}
                errorText="Failed to load questions"
                onRetry={refetch}
                empty={filteredQuestions.length === 0}
                emptyTitle="No Question Sets Found"
                emptyText="There are no question sets in the bank at this time."
                transparent={viewMode === "grid"}
            >
                {viewMode === "table" ? (
                    <div className="overflow-x-auto p-4">
                        <table className="table table-md w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-base-200 text-slate-500 text-xs font-black uppercase tracking-wider">
                                    <th className="py-4 pl-6 rounded-l-2xl">Question Set</th>
                                    <th className="py-4">Section</th>
                                    <th className="py-4">Exam</th>
                                    <th className="py-4">Questions</th>
                                    <th className="py-4">Plan Type</th>
                                    <th className="py-4">Status</th>
                                    <th className="py-4">Guest Access</th>
                                    <th className="py-4">Version</th>
                                    <th className="py-4">Created Date</th>
                                    <th className="py-4 pr-6 text-right rounded-r-2xl">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-100">
                                {filteredQuestions.map((q) => (
                                    <tr key={q._id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="py-4 pl-6 font-bold text-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-base-100 text-lg">
                                                    {getIcon(q.testType)}
                                                </div>
                                                <span 
                                                    className="line-clamp-1 max-w-[200px]" 
                                                    onMouseEnter={(e) => handleShowTitleIfClipped(e, q.title)}
                                                >
                                                    {q.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className="capitalize text-xs font-bold text-slate-600">{q.testType}</span>
                                        </td>
                                        <td className="py-4">
                                            <span className={`badge badge-sm font-bold border-none ${
                                                q.examType === 'IELTS' ? 'bg-blue-50 text-blue-700' :
                                                q.examType === 'PTE' ? 'bg-green-50 text-green-700' :
                                                'bg-amber-50 text-amber-700'
                                            }`}>{q.examType || 'IELTS'}</span>
                                        </td>
                                        <td className="py-4 font-bold text-slate-600">
                                            {q.questions?.length || 0} Qs
                                        </td>
                                        <td className="py-4">
                                            <span className={`badge badge-sm font-black border-none uppercase text-[9px] px-2.5 ${
                                                q.forPlanType === 'premium' ? 'bg-accent/15 text-accent-content' : 'bg-base-200 text-base-content/60'
                                            }`}>{q.forPlanType}</span>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="toggle toggle-xs toggle-primary animate-none cursor-pointer"
                                                    checked={q.isActive !== false}
                                                    onChange={() => handleToggleStatus(q._id, q.isActive !== false)}
                                                    title="Toggle Active Status"
                                                />
                                                <span className={`badge badge-xs font-bold border-none ${
                                                    q.isActive !== false ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                                }`}>
                                                    {q.isActive !== false ? 'Active' : 'Disabled'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className={`badge badge-sm font-semibold border-none text-xs ${
                                                q.isPublic ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                            }`}>{q.isPublic ? "Allowed" : "Restricted"}</span>
                                        </td>
                                        <td className="py-4 font-bold text-slate-500">
                                            V{q.version || 1}
                                        </td>
                                        <td className="py-4 text-xs text-base-content/50">
                                            {new Date(q.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 pr-6 text-right">
                                            <HoverActions
                                                onView={() => setSelectedQuestion(q)}
                                                onEdit={() => navigate(`/dashboard/admin/edit-questions/${q._id}`)}
                                                onDelete={() => handleDelete(q._id)}
                                                viewTooltip="See Questions"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredQuestions.map((q) => (
                            <div key={q._id} className="card bg-white border border-base-300 shadow-sm p-6 hover:shadow-md transition-shadow group relative">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-2xl bg-base-100 text-2xl">
                                            {getIcon(q.testType)}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 
                                                className="font-bold text-sm leading-snug line-clamp-2"
                                                onMouseEnter={(e) => handleShowTitleIfClipped(e, q.title)}
                                            >
                                                {q.title}
                                            </h3>
                                            <p className="text-xs uppercase tracking-widest text-base-content/50 font-semibold">{q.testType}</p>
                                        </div>
                                    </div>
                                    <HoverActions
                                        onEdit={() => navigate(`/dashboard/admin/edit-questions/${q._id}`)}
                                        onDelete={() => handleDelete(q._id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    />
                                </div>
                                
                                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-base-200 pt-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="badge badge-outline badge-xs px-2 font-semibold">{q.questions?.length || 0} Qs</span>
                                            <span className={`badge badge-xs px-2 font-bold ${q.forPlanType === 'premium' ? 'badge-accent' : 'badge-ghost'}`}>{q.forPlanType}</span>
                                            <span 
                                                onClick={() => handleToggleStatus(q._id, q.isActive !== false)}
                                                className={`badge badge-xs font-bold cursor-pointer select-none transition-all hover:scale-105 active:scale-95 ${
                                                    q.isActive !== false ? 'badge-success text-white' : 'bg-red-50 text-red-700 border-none'
                                                }`}
                                                title="Click to toggle status"
                                            >
                                                {q.isActive !== false ? 'Active' : 'Disabled'}
                                            </span>
                                        </div>
                                        <span className="text-[9px] text-base-content/40">Created {new Date(q.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedQuestion(q)}
                                        className="btn btn-primary btn-sm rounded-xl gap-1 font-bold shadow-sm hover:shadow transition-all text-xs px-3"
                                    >
                                        <PiSquaresFour className="text-sm" /> See Qs
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </TableShell>

            {/* Questions Preview Modal */}
            <AdminModal
                isOpen={!!selectedQuestion}
                onClose={() => setSelectedQuestion(null)}
                title={selectedQuestion?.title || ""}
                subtitle={selectedQuestion ? `Previewing Question Set V${selectedQuestion.version || 1}` : ""}
                maxWidth="max-w-4xl"
                footer={
                    selectedQuestion && (
                        <>
                            <button 
                                onClick={() => setSelectedQuestion(null)}
                                className="btn btn-ghost rounded-2xl px-6 font-bold"
                            >
                                Close
                            </button>
                            <button 
                                onClick={() => {
                                    setSelectedQuestion(null);
                                    navigate(`/dashboard/admin/edit-questions/${selectedQuestion._id}`);
                                }}
                                className="btn btn-primary rounded-2xl gap-2 px-6 font-bold"
                            >
                                Edit Question Set
                            </button>
                        </>
                    )
                }
            >
                {selectedQuestion && (
                    <div className="space-y-6">
                        <div className="flex flex-wrap gap-2 pb-4 border-b border-base-200">
                            <span className="badge badge-sm font-semibold capitalize bg-slate-100 text-slate-700 border-none px-2.5 py-3">
                                Type: {selectedQuestion.testType}
                            </span>
                            <span className="badge badge-sm font-semibold bg-indigo-50 text-indigo-700 border-none px-2.5 py-3">
                                Exam: {selectedQuestion.examType || "IELTS"}
                            </span>
                            <span className={`badge badge-sm font-bold border-none px-2.5 py-3 ${
                                selectedQuestion.forPlanType === 'premium' 
                                    ? 'bg-accent/15 text-accent-content' 
                                    : 'bg-base-200 text-base-content/75'
                            }`}>
                                Plan: {selectedQuestion.forPlanType}
                            </span>
                            <span className={`badge badge-sm font-bold border-none px-2.5 py-3 ${
                                selectedQuestion.isPublic 
                                    ? 'bg-green-50 text-green-700' 
                                    : 'bg-red-50 text-red-700'
                            }`}>
                                {selectedQuestion.isPublic ? "Guest Practice Allowed" : "Registered Users Only"}
                            </span>
                        </div>

                        {/* Modal Body */}
                        <div className="space-y-6 pt-2">
                            {/* Global Instructions */}
                            {selectedQuestion.instructions && (
                                <div className="bg-slate-50 border-l-4 border-primary p-4 rounded-r-2xl text-sm italic text-slate-700">
                                    <span className="font-bold not-italic block text-xs uppercase tracking-wider text-primary mb-1">Global Instructions</span>
                                    {selectedQuestion.instructions}
                                </div>
                            )}

                            {/* Section Material based on testType */}
                            {selectedQuestion.testType === "reading" && selectedQuestion.passage && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-base-content/50">Reading Passage</h3>
                                    <div 
                                        className="prose max-w-none max-h-80 overflow-y-auto bg-slate-50 border border-slate-200/60 p-6 rounded-2xl text-sm font-serif leading-relaxed text-slate-800 shadow-inner"
                                        dangerouslySetInnerHTML={{ __html: selectedQuestion.passage }} 
                                    />
                                </div>
                            )}

                            {selectedQuestion.testType === "listening" && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-base-content/50">Listening Test Content</h3>
                                    {selectedQuestion.audioUrl ? (
                                        <div className="bg-indigo-50/40 border border-indigo-100/60 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl shrink-0">
                                                    <PiEar />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-slate-800">Audio Track Player</div>
                                                    <a href={selectedQuestion.audioUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline line-clamp-1 break-all">{selectedQuestion.audioUrl}</a>
                                                </div>
                                            </div>
                                            <audio src={selectedQuestion.audioUrl} controls className="w-full md:max-w-md" />
                                        </div>
                                    ) : (
                                        <div className="text-sm text-error bg-error/10 p-3 rounded-xl font-semibold">No audio URL specified.</div>
                                    )}
                                    
                                    {selectedQuestion.passage && (
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">Gapped Notes Context</h4>
                                            <div 
                                                className="prose max-w-none max-h-60 overflow-y-auto bg-slate-50 border border-slate-200/60 p-6 rounded-2xl text-sm font-serif shadow-inner"
                                                dangerouslySetInnerHTML={{ __html: selectedQuestion.passage }} 
                                            />
                                        </div>
                                    )}

                                    {selectedQuestion.images && selectedQuestion.images.length > 0 && selectedQuestion.images.some(img => img) && (
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">Reference Images (Map / Diagram)</h4>
                                            <div className="flex flex-wrap gap-4">
                                                {selectedQuestion.images.map((img, i) => img && (
                                                    <div key={i} className="border border-base-300 rounded-2xl p-2 bg-white max-w-sm">
                                                        <img src={img} alt={`Reference map/diagram ${i+1}`} className="rounded-xl max-h-48 object-contain" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedQuestion.testType === "writing" && selectedQuestion.passage && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-base-content/50">Writing Prompts</h3>
                                    <div 
                                        className="prose max-w-none max-h-96 overflow-y-auto bg-slate-50 border border-slate-200/60 p-6 rounded-2xl text-sm text-slate-800 shadow-inner"
                                        dangerouslySetInnerHTML={{ __html: selectedQuestion.passage }} 
                                    />
                                    {selectedQuestion.images && selectedQuestion.images.length > 0 && selectedQuestion.images.some(img => img) && (
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">Task 1 Diagrams</h4>
                                            <div className="flex flex-wrap gap-4">
                                                {selectedQuestion.images.map((img, i) => img && (
                                                    <div key={i} className="border border-base-300 rounded-2xl p-2 bg-white max-w-sm">
                                                        <img src={img} alt={`Writing task diagram ${i+1}`} className="rounded-xl max-h-48 object-contain" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedQuestion.testType === "speaking" && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-base-content/50">Speaking Outline</h3>
                                    {selectedQuestion.speakingPrompt && (
                                        <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl">
                                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Part 2 Cue Card Prompt</h4>
                                            <p className="text-sm whitespace-pre-line text-slate-800 font-medium leading-relaxed">{selectedQuestion.speakingPrompt}</p>
                                        </div>
                                    )}
                                    {selectedQuestion.speakingPart1Questions && selectedQuestion.speakingPart1Questions.length > 0 && selectedQuestion.speakingPart1Questions.some(q => q.trim()) && (
                                        <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl">
                                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">Part 1 Introduction Questions</h4>
                                            <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-800 font-medium">
                                                {selectedQuestion.speakingPart1Questions.map((item, idx) => item && (
                                                    <li key={idx} className="leading-relaxed">{item}</li>
                                                ))}
                                            </ol>
                                        </div>
                                    )}
                                    {selectedQuestion.speakingPart3Questions && selectedQuestion.speakingPart3Questions.length > 0 && selectedQuestion.speakingPart3Questions.some(q => q.trim()) && (
                                        <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl">
                                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">Part 3 Discussion Questions</h4>
                                            <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-800 font-medium">
                                                {selectedQuestion.speakingPart3Questions.map((item, idx) => item && (
                                                    <li key={idx} className="leading-relaxed">{item}</li>
                                                ))}
                                            </ol>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Sub-Questions list */}
                            {selectedQuestion.testType !== "speaking" && selectedQuestion.testType !== "writing" && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-base-content/50">
                                        Sub-Questions ({selectedQuestion.questions?.length || 0})
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedQuestion.questions && selectedQuestion.questions.length > 0 ? (
                                            selectedQuestion.questions.map((subQ, idx) => (
                                                <div key={subQ.id || idx} className="p-5 bg-white border border-base-200 rounded-2xl shadow-sm hover:border-base-300 transition-colors">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1 space-y-3">
                                                            <div className="font-semibold text-slate-800 text-sm">{subQ.question || "(No question text)"}</div>
                                                            
                                                            {/* MCQ Options */}
                                                            {subQ.options && subQ.options.length > 0 && subQ.options.some(opt => opt) && (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-1">
                                                                    {subQ.options.map((opt, optIdx) => opt && (
                                                                        <div key={optIdx} className="text-xs bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-slate-600 flex items-center gap-2">
                                                                            <span className="font-bold text-primary">{String.fromCharCode(65 + optIdx)}.</span>
                                                                            <span>{opt}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Matching pairs */}
                                                            {subQ.matchingPairs && subQ.matchingPairs.length > 0 && subQ.matchingPairs.some(p => p.key || p.value) && (
                                                                <div className="space-y-1.5 pl-1">
                                                                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Matching Items</div>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                        {subQ.matchingPairs.map((pair, pairIdx) => (pair.key || pair.value) && (
                                                                            <div key={pairIdx} className="text-xs bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-slate-600 flex items-center justify-between">
                                                                                <span>{pair.key}</span>
                                                                                <span className="text-primary font-bold">⇄</span>
                                                                                <span>{pair.value}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Sub-question diagram/map */}
                                                            {subQ.imageUrl && (
                                                                <div className="border border-base-300 rounded-xl p-2 bg-white max-w-xs mt-2">
                                                                    <img src={subQ.imageUrl} alt={`Question diagram`} className="rounded-lg max-h-32 object-contain" />
                                                                </div>
                                                            )}

                                                            {/* Correct Answer */}
                                                            <div className="flex items-center gap-2 text-xs text-success bg-success/10 w-fit px-3 py-1.5 rounded-xl font-bold">
                                                                <PiCheckCircle className="text-sm shrink-0" />
                                                                <span>Correct Answer:</span>
                                                                <span className="underline decoration-wavy">{subQ.correctAnswer || "(None)"}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-base-content/40 italic p-4 text-center">No sub-questions found.</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Speaking/Writing instructions */}
                            {(selectedQuestion.testType === "speaking" || selectedQuestion.testType === "writing") && (
                                <div className="alert bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 p-4">
                                    <PiInfo className="text-amber-600 text-lg shrink-0 mt-0.5" />
                                    <div className="text-xs text-amber-800">
                                        <div className="font-bold">Evaluation Mode: Manual Instructor Evaluation</div>
                                        <div>Students submit complete essays or spoken audio files for this module. These submissions are routed to the Instructor Dashboard for review and manual grading.</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </AdminModal>
        </div>
    );
};

export default ManageQuestions;
