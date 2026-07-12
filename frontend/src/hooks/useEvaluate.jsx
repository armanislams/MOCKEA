import { useState } from "react";
import { toast } from "react-toastify";
import useAxiosSecure from "./useAxiosSecure";
import useAuth from "./useAuth";

export default function useEvaluate() {
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();
    
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);

    const evaluate = async (activeSet, answers, onSubmitGuest = null) => {
        if (!activeSet) return false;

        const totalQuestions = activeSet.questions?.length || 0;
        const answeredCount = activeSet.questions?.filter(q => {
            const ans = answers[q.id];
            if (typeof ans === 'string') {
                return ans.trim() !== "";
            }
            return ans !== undefined && ans !== null;
        }).length || 0;

        if (answeredCount < totalQuestions) {
            toast.error(`Please answer all ${totalQuestions} questions before submitting (${totalQuestions - answeredCount} remaining).`);
            return false;
        }

        // Guest mode — hand off to parent handler (only if not yet logged in)
        if (onSubmitGuest && !user?.email) {
            onSubmitGuest(answers);
            return false;
        }

        try {
            setSubmitting(true);
            const response = await axiosSecure.post("/questions/evaluate", {
                questionSetId: activeSet._id,
                answers,
            });

            if (response.data.success) {
                setResult(response.data);
                setSubmitted(true);
                toast.success("Assessment completed!");
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return true;
            }
            return false;
        } catch (error) {
            console.error("Evaluation error:", error);
            toast.error(error.response?.data?.message || "Evaluation failed");
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const resetEvaluation = () => {
        setSubmitted(false);
        setResult(null);
    };

    return {
        submitting,
        submitted,
        setSubmitted,
        result,
        setResult,
        evaluate,
        resetEvaluation
    };
}
