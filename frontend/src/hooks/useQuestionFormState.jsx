import { useState, useCallback } from "react";
import { makeQuestion, initialForm } from "../components/Dashboard/Admin Dashboard/QuestionForm/questionFormConstants";
import { stripListeningExampleBlocks } from "../utils/listeningPassage";

// Parser logic to reverse-engineer database HTML wrappers back into editable form state
export function parseQuestionToState(fetchedQuestion) {
    if (!fetchedQuestion) return null;
    
    let task1Prompt = "";
    let task1Image = "";
    let task2Prompt = "";
    
    if (fetchedQuestion.testType === "writing" && fetchedQuestion.passage) {
        // Try to extract Task 1 & Task 2 prompts from the HTML
        const task1Match = fetchedQuestion.passage.match(/Task 1: Academic Report.*?<\/h3>\s*<p.*?>(.*?)<\/p>/s);
        const task2Match = fetchedQuestion.passage.match(/Task 2: Opinion Essay.*?<\/h3>\s*<p.*?>(.*?)<\/p>/s);
        
        task1Prompt = task1Match ? task1Match[1].replace(/<br\s*\/?>/g, "\n") : "";
        task2Prompt = task2Match ? task2Match[1].replace(/<br\s*\/?>/g, "\n") : "";
        task1Image = fetchedQuestion.images?.[0] || "";
    }

    let exampleQuestion = "Destination:";
    let exampleAnswer = "Harbour City";
    let cleanPassage = fetchedQuestion.passage || "";

    if (fetchedQuestion.testType === "listening" && fetchedQuestion.passage) {
        let tempPassage = fetchedQuestion.passage;

        // Extract example label and answer if present
        const eqMatch = tempPassage.match(/<span>([^<]+)<\/span>\s*<span[^>]*>\s*([^<]+)\s*<\/span>/s);
        exampleQuestion = eqMatch ? eqMatch[1].trim() : "Destination:";
        exampleAnswer = eqMatch ? eqMatch[2].trim() : "Harbour City";

        // Strip any saved example blocks before restoring the editable notes content
        tempPassage = stripListeningExampleBlocks(tempPassage);

        // Strip the ielts-listening-notes div wrapper if present
        tempPassage = tempPassage.replace(/<div class=["']ielts-listening-notes[^"']*["'][^>]*>/, "");
        
        // Strip the trailing closing div if it exists
        tempPassage = tempPassage.replace(/<\/div>\s*$/, "");

        cleanPassage = tempPassage.trim();
    }

    let passages = [{ title: "", content: "" }];
    if (fetchedQuestion.passages && fetchedQuestion.passages.length > 0) {
        passages = fetchedQuestion.passages.map(p => ({ title: p.title || "", content: p.content || "" }));
    } else if (fetchedQuestion.testType === "reading") {
        passages = [{ title: fetchedQuestion.title || "Passage 1", content: fetchedQuestion.passage || "" }];
    }

    const questionGroups = (fetchedQuestion.questionGroups && fetchedQuestion.questionGroups.length > 0)
        ? fetchedQuestion.questionGroups.map(g => ({
            title: g.title || "",
            instructions: g.instructions || "",
            fromQuestion: g.fromQuestion || 1,
            toQuestion: g.toQuestion || 1,
            passageIndex: g.passageIndex || 0,
        }))
        : [{ title: "", instructions: "", fromQuestion: 1, toQuestion: 13, passageIndex: 0 }];

    return {
        title: fetchedQuestion.title || "",
        instructions: fetchedQuestion.instructions || "",
        passage: cleanPassage,
        passages,
        questionGroups,
        audioUrl: fetchedQuestion.audioUrl || "",
        speakingPrompt: fetchedQuestion.speakingPrompt || "",
        speakingPart1Questions: fetchedQuestion.speakingPart1Questions?.length ? fetchedQuestion.speakingPart1Questions : [""],
        speakingPart3Questions: fetchedQuestion.speakingPart3Questions?.length ? fetchedQuestion.speakingPart3Questions : [""],
        images: fetchedQuestion.images?.filter(img => img && img.trim() !== "") || [],
        task1Prompt,
        task1Image,
        task2Prompt,
        exampleQuestion,
        exampleAnswer,
        examType: fetchedQuestion.examType || "IELTS",
        listeningPart: fetchedQuestion.listeningPart || 1,
        forPlanType: fetchedQuestion.forPlanType || "free",
        isPublic: fetchedQuestion.isPublic || false,
        isMockOnly: fetchedQuestion.isMockOnly || false,
        questions: fetchedQuestion.questions?.length ? fetchedQuestion.questions.map(q => ({
            id: q.id || (Date.now().toString() + Math.random().toString(36).slice(2)),
            type: q.type || "short-answer",
            question: q.question || "",
            correctAnswer: q.correctAnswer || "",
            options: q.options || ["", ""],
            matchingPairs: q.matchingPairs || [{ key: "", value: "" }],
            imageUrl: q.imageUrl || "",
            passageIndex: q.passageIndex || 0
        })) : [makeQuestion()],
    };
}

export function useQuestionFormState(initialData = initialForm()) {
    const [formData, setFormData] = useState(initialData);

    const patch = useCallback((updates) => {
        setFormData((prev) => ({ ...prev, ...updates }));
    }, []);

    const patchQuestion = useCallback((id, updates) => {
        setFormData((prev) => ({
            ...prev,
            questions: prev.questions.map((q) =>
                q.id === id ? { ...q, ...updates } : q
            ),
        }));
    }, []);

    const handleAddQuestion = useCallback(() => {
        setFormData((prev) => ({
            ...prev,
            questions: [...prev.questions, makeQuestion()],
        }));
    }, []);

    const handleRemoveQuestion = useCallback((id) => {
        setFormData((prev) => ({
            ...prev,
            questions: prev.questions.filter((q) => q.id !== id),
        }));
    }, []);

    const updateQuestionField = useCallback((id, field, value) => {
        // Auto-populate default options when type changes to true-false or yes-no
        if (field === "type") {
            let updates = { [field]: value };
            if (value === "true-false") {
                updates.options = ["True", "False", "Not Given"];
            } else if (value === "yes-no") {
                updates.options = ["Yes", "No", "Not Given"];
            }
            patchQuestion(id, updates);
        } else {
            patchQuestion(id, { [field]: value });
        }
    }, [patchQuestion]);

    const handleAddOption = useCallback((qId) => {
        setFormData((prev) => {
            const targetQuestion = prev.questions.find((q) => q.id === qId);
            if (!targetQuestion) return prev;
            return {
                ...prev,
                questions: prev.questions.map((q) =>
                    q.id === qId ? { ...q, options: [...q.options, ""] } : q
                ),
            };
        });
    }, []);

    const updateOption = useCallback((qId, idx, value) => {
        setFormData((prev) => {
            const targetQuestion = prev.questions.find((q) => q.id === qId);
            if (!targetQuestion) return prev;
            const opts = [...targetQuestion.options];
            opts[idx] = value;
            return {
                ...prev,
                questions: prev.questions.map((q) =>
                    q.id === qId ? { ...q, options: opts } : q
                ),
            };
        });
    }, []);

    const handleAddPair = useCallback((qId) => {
        setFormData((prev) => {
            const targetQuestion = prev.questions.find((q) => q.id === qId);
            if (!targetQuestion) return prev;
            return {
                ...prev,
                questions: prev.questions.map((q) =>
                    q.id === qId
                        ? {
                              ...q,
                              matchingPairs: [
                                  ...(q.matchingPairs || []),
                                  { key: "", value: "" },
                              ],
                          }
                        : q
                ),
            };
        });
    }, []);

    const updatePair = useCallback((qId, idx, field, value) => {
        setFormData((prev) => {
            const targetQuestion = prev.questions.find((q) => q.id === qId);
            if (!targetQuestion) return prev;
            const pairs = targetQuestion.matchingPairs.map((p, i) =>
                i === idx ? { ...p, [field]: value } : p
            );
            return {
                ...prev,
                questions: prev.questions.map((q) =>
                    q.id === qId ? { ...q, matchingPairs: pairs } : q
                ),
            };
        });
    }, []);

    return {
        formData,
        setFormData,
        patch,
        patchQuestion,
        handleAddQuestion,
        handleRemoveQuestion,
        updateQuestionField,
        handleAddOption,
        updateOption,
        handleAddPair,
        updatePair,
    };
}
