import Questions from "../model/questions.js"

export const getQuestions = async (req, res) => {
    try {
        const { type } = req.query;
        const filter = type ? { type: type.toLowerCase() } : {};
        
        const questions = await Questions.find(filter);
        return res.status(200).json({
            success: true,
            message: "Questions fetched successfully",
            questions
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching questions",
            error: error.message
        });
    }
};

export const postQuestion = async (req, res) => {
    try {
        const questionData = req.body;
        const newQuestion = new Questions(questionData);
        await newQuestion.save();
        return res.status(201).json({
            success: true,
            message: "Question created successfully",
            question: newQuestion
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error creating question",
            error: error.message
        });
    }
};

export const updateQuestion = async (req, res) => {
    try {
        const question = await Questions.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
        res.status(200).json({ success: true, question });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteQuestion = async (req, res) => {
    try {
        const question = await Questions.findByIdAndDelete(req.params.id);
        if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
        res.status(200).json({ success: true, message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const evaluateQuestions = async (req, res) => {
    try {
        const { questionSetId, answers } = req.body;
        const set = await Questions.findById(questionSetId);

        if (!set) return res.status(404).json({ success: false, message: 'Question set not found' });

        let correctCount = 0;
        const totalQuestions = set.questions.length;

        const evaluatedAnswers = set.questions.map(q => {
            const userAnswer = answers[q.id] || "";
            const isCorrect = q.correctAnswer.toLowerCase().trim() === userAnswer.toLowerCase().trim();
            if (isCorrect) correctCount++;
            
            return {
                questionId: q.id,
                userAnswer,
                correctAnswer: q.correctAnswer,
                isCorrect
            };
        });

        const score = Math.round((correctCount / totalQuestions) * 100);

        res.status(200).json({
            success: true,
            score,
            correctAnswers: correctCount,
            totalQuestions,
            evaluatedAnswers
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};