import Questions from "../model/questions.js"
import User from "../model/user.js";
import MockTest from "../model/mockTest.js";

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

        const filter = type 
            ? { testType: type.toLowerCase(), isLatest: { $ne: false } } 
            : { isLatest: { $ne: false } };
        
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

export const getQuestionById = async (req, res) => {
    try {
        const question = await Questions.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }
        return res.status(200).json({
            success: true,
            question
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching question",
            error: error.message
        });
    }
};

export const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const original = await Questions.findById(id);
        if (!original) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        // Detect structural modifications (different sub-question count, different question IDs, or changed correct answers)
        let isStructuralChange = false;
        
        if (updateData.questions) {
            if (updateData.questions.length !== original.questions.length) {
                isStructuralChange = true;
            } else {
                // Check if any sub-question ID or correct answer has changed
                for (let i = 0; i < updateData.questions.length; i++) {
                    const originalQ = original.questions[i];
                    const updatedQ = updateData.questions[i];
                    
                    if (originalQ.id !== updatedQ.id || originalQ.correctAnswer !== updatedQ.correctAnswer) {
                        isStructuralChange = true;
                        break;
                    }
                }
            }
        }

        if (isStructuralChange) {
            // --- STRUCTURAL CHANGE FLOW ---
            // 1. Deprecate the old document
            original.isLatest = false;
            await original.save();

            // 2. Clone the document and update parameters
            const clonedData = {
                ...original.toObject(),
                ...updateData,
                version: original.version + 1,
                isLatest: true,
                parentQuestionId: original.parentQuestionId || original._id
            };
            
            // Remove MongoDB identification fields so Mongoose creates a brand new document
            delete clonedData._id;
            delete clonedData.createdAt;
            delete clonedData.updatedAt;

            const newVersion = new Questions(clonedData);
            await newVersion.save();

            // 3. Update referencing Mock Tests to point to the new ID
            const testType = original.testType.toLowerCase(); // 'reading', 'listening', 'writing', 'speaking'
            const updateField = `sections.${testType}`;
            
            await MockTest.updateMany(
                { [updateField]: original._id },
                { $set: { [`${updateField}.$`]: newVersion._id } }
            );

            return res.status(200).json({
                success: true,
                message: "Structural edit detected. Spawned a new version to preserve historical integrity.",
                question: newVersion
            });
        } else {
            // --- MINOR/TEXTUAL CHANGE FLOW ---
            // Standard in-place update
            const updatedQuestion = await Questions.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
            return res.status(200).json({
                success: true,
                message: "Minor edit executed in-place.",
                question: updatedQuestion
            });
        }
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