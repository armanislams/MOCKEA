import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { PiCheckCircle, PiArrowLeft } from "react-icons/pi";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import { convertMarkdownContentToHtml } from "../../../../utils/markdownUtils";
import { stripListeningExampleBlocks } from "../../../../utils/listeningPassage";

import { initialForm } from "./questionFormConstants";
import { useQuestionFormState, parseQuestionToState } from "../../../../hooks/useQuestionFormState";

import TestSectionPicker from "./TestSectionPicker";
import GeneralInfoCard from "./GeneralInfoCard";
import ListeningPartSelector from "./ListeningPartSelector";
import ListeningInlineGuide from "./ListeningInlineGuide";
import ContentEditorCard from "./ContentEditorCard";
import QuestionsBuilderCard from "./QuestionsBuilderCard";

export default function QuestionSetForm({ mode = "add", questionId }) {
    const axiosSecure = useAxiosSecure();

    if (mode === "edit") {
        const { data: fetchedQuestion, isLoading } = useQuery({
            queryKey: ["admin-question", questionId],
            queryFn: async () => {
                const res = await axiosSecure.get(`/questions/${questionId}`);
                return res.data.question;
            }
        });

        if (isLoading) {
            return (
                <div className="flex items-center justify-center min-h-[400px]">
                    <span className="loading loading-spinner loading-lg text-primary" />
                </div>
            );
        }

        if (!fetchedQuestion) {
            return <div className="text-center p-8 text-slate-500">Question set not found.</div>;
        }

        const parsedData = parseQuestionToState(fetchedQuestion);
        return (
            <QuestionSetFormContent 
                key={questionId} 
                mode="edit" 
                id={questionId} 
                initialData={parsedData} 
                fetchedQuestionTestType={fetchedQuestion.testType}
            />
        );
    }

    return <QuestionSetFormContent mode="add" initialData={initialForm()} />;
}

function QuestionSetFormContent({ mode, id, initialData, fetchedQuestionTestType }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const axiosSecure = useAxiosSecure();

    const [testType, setTestType] = useState(mode === "edit" ? fetchedQuestionTestType : "reading");
    const {
        formData,
        patch,
        handleAddQuestion,
        handleRemoveQuestion,
        updateQuestionField,
        handleAddOption,
        updateOption,
        handleAddPair,
        updatePair,
    } = useQuestionFormState(initialData);

    const isIeltsListening =
        testType === "listening" &&
        (formData.examType === "IELTS" || formData.examType === "BOTH");

    const mutation = useMutation({
        mutationFn: (data) => {
            if (mode === "edit") {
                return axiosSecure.put(`/questions/${id}`, data);
            } else {
                return axiosSecure.post("/questions/add", data);
            }
        },
        onSuccess: (res) => {
            toast.success(res.data.message || `Question set ${mode === "edit" ? "updated" : "saved"} successfully!`);
            queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
            if (mode === "edit") {
                navigate("/dashboard/admin/manage-questions");
            } else {
                // reset form in add mode
                patch(initialForm());
            }
        },
        onError: (err) => {
            const errorMsg = err.response?.data?.message || err.message || "Failed to save questions";
            toast.error(errorMsg);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = { ...formData, testType };

        if (testType === "reading") {
            const activePassages = (formData.passages || []).filter(p => p.title.trim() !== "" || p.content.trim() !== "");
            data.passages = activePassages;
            data.passage = activePassages.map((p, idx) => `
<section class="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 mb-8">
  <h2 class="text-3xl font-black text-primary mb-4">Reading Passage ${idx + 1}: ${p.title}</h2>
  <div class="space-y-4 text-slate-600">${convertMarkdownContentToHtml(p.content)}</div>
</section>
            `.trim()).join('\n\n');
        } else if (testType === "writing") {
            const task1HTML = `
<div class="p-6 bg-slate-50 rounded-2xl border border-slate-200">
  <h3 class="text-xl font-bold text-slate-800 mb-2">Task 1: Academic Report (Recommended: 20 minutes, minimum 150 words)</h3>
  <p class="mb-4 text-slate-700 leading-relaxed font-medium">${formData.task1Prompt.replace(/\n/g, "<br/>")}</p>
</div>`.trim();
            const task2HTML = `
<div class="p-6 bg-slate-50 rounded-2xl border border-slate-200 mt-6">
  <h3 class="text-xl font-bold text-slate-800 mb-2">Task 2: Opinion Essay (Recommended: 40 minutes, minimum 250 words)</h3>
  <p class="mb-4 text-slate-700 leading-relaxed font-semibold">${formData.task2Prompt.replace(/\n/g, "<br/>")}</p>
</div>`.trim();
            data.passage = `<div class="space-y-6">\n  ${task1HTML}\n\n  ${task2HTML}\n</div>`;
            data.images = formData.task1Image ? [formData.task1Image] : [];
            data.questions = [
                { id: "w1", type: "short-answer", question: "Task Responses:", correctAnswer: "[INSTRUCTOR REVIEW REQUIRED]" },
            ];
            // Clear reading-specific passages — they have a required title field in the schema
            data.passages = [];
        } else if (testType === "speaking") {
            data.speakingPart1Questions = formData.speakingPart1Questions.filter(q => q.trim() !== "");
            data.speakingPart3Questions = formData.speakingPart3Questions.filter(q => q.trim() !== "");
            data.questions = [
                { id: "s1", type: "short-answer", question: "Speaking Recording Response:", correctAnswer: "[INSTRUCTOR REVIEW REQUIRED]" },
            ];
            // Clear reading-specific passages — they have a required title field in the schema
            data.passages = [];
        } else if (
            testType === "listening" &&
            (formData.examType === "IELTS" || formData.examType === "BOTH")
        ) {
            if (formData.listeningPart === 1) {
                const cleanNotes = stripListeningExampleBlocks(formData.passage);
                // Compile example row + gapped notes into passage HTML
                const exampleHTML = `
<div class="mb-6 p-5 bg-indigo-50/50 border border-indigo-100 rounded-3xl">
  <div class="text-[9px] font-black uppercase tracking-widest text-primary mb-2">Example</div>
  <div class="flex items-center justify-between text-sm font-semibold text-slate-700">
    <span>${formData.exampleQuestion || "Destination:"}</span>
    <span class="px-3 py-1 bg-white border border-slate-200 rounded-xl font-bold text-slate-800">${formData.exampleAnswer || "Harbour City"}</span>
  </div>
</div>`.trim();
                data.passage = cleanNotes
                    ? `${exampleHTML}\n\n<div class="ielts-listening-notes space-y-4">${cleanNotes}</div>`
                    : exampleHTML;
            } else {
                const cleanNotes = stripListeningExampleBlocks(formData.passage);
                data.passage = cleanNotes
                    ? `<div class="ielts-listening-notes space-y-4">${cleanNotes}</div>`
                    : "";
            }
            // Clear reading-specific passages — they have a required title field in the schema
            data.passages = [];
        } else if (testType === "listening") {
            // PTE listening (examType is PTE) — no passages needed
            data.passages = [];
        }

        // Strip frontend-only fields that are not part of the DB schema
        delete data.task1Prompt;
        delete data.task1Image;
        delete data.task2Prompt;
        delete data.exampleQuestion;
        delete data.exampleAnswer;

        if (data.images) {
            data.images = data.images.filter(img => img && img.trim() !== "");
        }

        mutation.mutate(data);
    };

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
            <header className="flex flex-col gap-2 border-b border-base-300 pb-6 relative">
                {mode === "edit" && (
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/admin/manage-questions")}
                        className="btn btn-ghost btn-sm rounded-xl gap-2 self-start mb-2"
                    >
                        <PiArrowLeft /> Back to Question Bank
                    </button>
                )}
                <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">Admin Panel</p>
                <h1 className="text-3xl font-bold">{mode === "edit" ? "Edit Question Set" : "Add New Question Set"}</h1>
                <p className="text-base-content/60">
                    {mode === "edit" 
                        ? `Modify details of question set: ${formData.title || ""}` 
                        : "Create a standardized question set for any section — IELTS or PTE Academic."
                    }
                </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Test Section Selector */}
                <TestSectionPicker 
                    testType={testType} 
                    setTestType={setTestType} 
                    locked={mode === "edit"} 
                />

                {/* General Info */}
                <GeneralInfoCard 
                    formData={formData} 
                    patch={patch} 
                />

                {/* IELTS Listening Part Selector */}
                {testType === "listening" && (
                    <ListeningPartSelector 
                        value={formData.listeningPart} 
                        onChange={(part) => patch({ listeningPart: part })} 
                    />
                )}

                {/* Content Editor Card */}
                <ContentEditorCard 
                    testType={testType} 
                    isIeltsListening={isIeltsListening} 
                    formData={formData} 
                    patch={patch} 
                />

                {/* Listening Guide for Part 3 & 4 */}
                {testType === "listening" && isIeltsListening && (
                    <ListeningInlineGuide 
                        listeningPart={formData.listeningPart} 
                    />
                )}

                {/* Sub-Questions list builder */}
                <QuestionsBuilderCard 
                    testType={testType} 
                    formData={formData} 
                    handleAddQuestion={handleAddQuestion} 
                    handleRemoveQuestion={handleRemoveQuestion} 
                    updateQuestionField={updateQuestionField} 
                    handleAddOption={handleAddOption} 
                    updateOption={updateOption} 
                    handleAddPair={handleAddPair} 
                    updatePair={updatePair} 
                />

                {/* Submit button */}
                <div className="flex justify-end pt-8">
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg rounded-2xl px-12 gap-3 shadow-lg shadow-primary/20"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending
                            ? <span className="loading loading-spinner" />
                            : <PiCheckCircle className="w-6 h-6" />
                        }
                        {mode === "edit" ? "Update Question Set" : "Save Question Set"}
                    </button>
                </div>
            </form>
        </div>
    );
}
