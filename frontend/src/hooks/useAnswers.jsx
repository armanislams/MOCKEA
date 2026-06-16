import { useState, useCallback } from "react";

export default function useAnswers(initial = {}) {
    const [answers, setAnswers] = useState(initial);

    const handleAnswerChange = useCallback((qId, val) => {
        setAnswers((prev) => ({ ...prev, [qId]: val }));
    }, []);

    const resetAnswers = useCallback(() => {
        setAnswers(initial);
    }, [initial]);

    return { answers, setAnswers, handleAnswerChange, resetAnswers };
}
