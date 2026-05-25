import Questions from "../model/questions.js"
import User from "../model/user.js";

export const getQuestions = async (req, res) => {
    try {
        const { type } = req.query;
        
        // Fetch student targeted exam track to dynamically segment available modules
        const email = req.decoded_email;
        let examPreference = "IELTS";
        let userRole = "student";

        if (email) {
            const userObj = await User.findOne({ email });
            if (userObj && userObj.targetExam) {
                examPreference = userObj.targetExam;
            }
            if (userObj && userObj.role) {
                userRole = userObj.role;
            }
        }

        const filter = type ? { testType: type.toLowerCase() } : {};
        
        // Admins see ALL questions regardless of examType
        // Students see only questions matching their exam preference,
        // OR questions that don't have examType set yet (legacy backwards compat)
        if (userRole !== "admin") {
            if (examPreference === "IELTS") {
                filter.$or = [
                    { examType: { $in: ["IELTS", "BOTH"] } },
                    { examType: { $exists: false } },
                    { examType: null }
                ];
            } else if (examPreference === "PTE") {
                filter.$or = [
                    { examType: { $in: ["PTE", "BOTH"] } },
                    { examType: { $exists: false } },
                    { examType: null }
                ];
            }
            // BOTH: no filter — student sees everything
        }
        
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
        const question = await Questions.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
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