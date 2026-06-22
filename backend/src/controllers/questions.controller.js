import Questions from "../model/questions.js"
import User from "../model/user.js";
import MockTest from "../model/mockTest.js";
import { v2 as cloudinary } from 'cloudinary';
import { cache } from '../utils/cache.js';

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

const cleanAnswer = (str) => {
    if (!str) return "";
    return str.toLowerCase().trim()
        .replace(/^[a-z]\s*[\.\-\)]\s+/, "")
        .replace(/^[a-z]\s*[\.\-\)]\s*$/, "")
        .replace(/\s+/g, " ")
        .trim();
};

const getLetterPrefix = (str) => {
    if (!str) return "";
    const match = str.trim().match(/^([a-z])\s*[\.\-\)]\s*/i);
    return match ? match[1].toLowerCase() : "";
};

const isAnswerMatching = (correct, user) => {
    if (!correct || !user) return false;
    const correctStr = correct.toLowerCase().trim();
    const userStr = user.toLowerCase().trim();
    if (correctStr === userStr) return true;
    
    const correctClean = cleanAnswer(correct);
    const userClean = cleanAnswer(user);
    if (correctClean && userClean && correctClean === userClean) return true;
    
    const correctLetter = getLetterPrefix(correct);
    const userLetter = getLetterPrefix(user);
    if (correctLetter && correctLetter === userStr) return true;
    if (userLetter && userLetter === correctStr) return true;
    return false;
};

const getCloudinaryPublicId = (url) => {
    try {
        const parts = url.split('/upload/');
        if (parts.length < 2) return null;
        
        let pathAfterUpload = parts[1];
        if (pathAfterUpload.startsWith('v')) {
            const nextSlashIndex = pathAfterUpload.indexOf('/');
            if (nextSlashIndex !== -1) {
                pathAfterUpload = pathAfterUpload.substring(nextSlashIndex + 1);
            }
        }
        
        const dotIndex = pathAfterUpload.lastIndexOf('.');
        if (dotIndex !== -1) {
            pathAfterUpload = pathAfterUpload.substring(0, dotIndex);
        }
        
        return pathAfterUpload;
    } catch (e) {
        console.error("Error parsing Cloudinary URL", e);
        return null;
    }
};

const clearMockTestCacheForQuestion = async (questionId) => {
    try {
        const mockTests = await MockTest.find({
            $or: [
                { 'sections.reading': questionId },
                { 'sections.listening': questionId },
                { 'sections.writing': questionId },
                { 'sections.speaking': questionId }
            ]
        });
        
        for (const test of mockTests) {
            await cache.del(`mocktest:${test._id}`);
            console.log(`Cleared cache for mocktest:${test._id} due to question update`);
        }
    } catch (err) {
        console.error("Failed to clear mock test cache:", err);
    }
};

export const getQuestions = async (req, res) => {
    try {
        const { type } = req.query;
        
        // Fetch student targeted exam track to dynamically segment available modules
        const email = req.decoded_email;
        let examPreference = "IELTS";
        let userRole = "student";

        let userPlan = "free";

        if (email) {
            const userObj = await User.findOne({ email });
            if (userObj) {
                if (userObj.targetExam) {
                    examPreference = userObj.targetExam;
                }
                if (userObj.role) {
                    userRole = userObj.role;
                }
                if (userObj.plan) {
                    userPlan = userObj.plan;
                }
            }
        }

        const filter = type 
            ? { testType: type.toLowerCase(), isLatest: { $ne: false } } 
            : { isLatest: { $ne: false } };
        
        // Admins and Instructors see ALL questions regardless of plan & examType
        // Students see only questions matching their exam preference & tier limits
        if (userRole !== "admin" && userRole !== "instructor") {
            filter.isMockOnly = { $ne: true };
            
            const andConditions = [];

            // 1. Exam preference segment
            if (examPreference === "IELTS") {
                andConditions.push({
                    $or: [
                        { examType: { $in: ["IELTS", "BOTH"] } },
                        { examType: { $exists: false } },
                        { examType: null }
                    ]
                });
            } else if (examPreference === "PTE") {
                andConditions.push({
                    $or: [
                        { examType: { $in: ["PTE", "BOTH"] } },
                        { examType: { $exists: false } },
                        { examType: null }
                    ]
                });
            }

            // 2. Subscription Plan/Tier Gating
            const allowedPlans = ["free"];
            if (userPlan === "standard") {
                allowedPlans.push("standard");
            } else if (userPlan === "premium") {
                allowedPlans.push("standard", "premium");
            }

            andConditions.push({
                $or: [
                    { forPlanType: { $in: allowedPlans } },
                    { forPlanType: { $exists: false } },
                    { forPlanType: null }
                ]
            });

            if (andConditions.length > 0) {
                filter.$and = andConditions;
            }
        }
        // Check if user is free plan to block writing/speaking or limit listening/reading to 2 random questions
        if (userRole !== "admin" && userRole !== "instructor" && userPlan === "free") {
            if (type && ['writing', 'speaking'].includes(type.toLowerCase())) {
                return res.status(200).json({
                    success: true,
                    message: `${type} questions are locked on the Free tier. Please upgrade.`,
                    questions: []
                });
            }
        }

        let questions = await Questions.find(filter);

        if (userRole !== "admin" && userRole !== "instructor" && userPlan === "free") {
            // Fisher-Yates shuffle for uniform distribution
            for (let i = questions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [questions[i], questions[j]] = [questions[j], questions[i]];
            }
            questions = questions.slice(0, 2);
        }

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
        const { id } = req.params;
        const cacheKey = `question:${id}`;

        let question = await cache.get(cacheKey);

        if (!question) {
            question = await Questions.findById(id);
            if (!question) {
                return res.status(404).json({ success: false, message: 'Question not found' });
            }
            await cache.set(cacheKey, question, 3600); // Cache for 1 hour
        }

        // Enforce plan-tier checks on individual question sets
        const email = req.decoded_email;
        let userRole = "student";
        let userPlan = "free";

        if (email) {
            const userObj = await User.findOne({ email });
            if (userObj) {
                userRole = userObj.role || "student";
                userPlan = userObj.plan || "free";
            }
        }

        if (userRole !== "admin" && userRole !== "instructor" && userPlan === "free") {
            if (['writing', 'speaking'].includes(question.testType.toLowerCase())) {
                return res.status(403).json({ 
                    success: false, 
                    message: "Access Denied: This practice module is locked on the Free tier. Please upgrade." 
                });
            }
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

            await cache.del(`question:${original._id}`);
            await clearMockTestCacheForQuestion(original._id);
            return res.status(200).json({
                success: true,
                message: "Structural edit detected. Spawned a new version to preserve historical integrity.",
                question: newVersion
            });
        } else {
            // --- MINOR/TEXTUAL CHANGE FLOW ---
            // Standard in-place update
            const updatedQuestion = await Questions.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
            await cache.del(`question:${id}`);
            await clearMockTestCacheForQuestion(id);
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
        const { id } = req.params;
        const question = await Questions.findById(id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        // If the question has an audioUrl on Cloudinary, delete it
        if (question.audioUrl && question.audioUrl.includes("res.cloudinary.com")) {
            const publicId = getCloudinaryPublicId(question.audioUrl);
            if (publicId) {
                console.log(`Deleting Cloudinary audio with public ID: ${publicId}`);
                try {
                    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
                    console.log(`Successfully deleted Cloudinary asset: ${publicId}`);
                } catch (cloudinaryErr) {
                    console.error("Failed to delete asset from Cloudinary:", cloudinaryErr.message);
                }
            }
        }

        await Questions.findByIdAndDelete(id);
        await cache.del(`question:${id}`);
        await clearMockTestCacheForQuestion(id);
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
            const isCorrect = isAnswerMatching(q.correctAnswer, userAnswer);
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