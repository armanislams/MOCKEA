import Reading from "../model/reading.js";
import Questions from "../model/questions.js";

// Sample IELTS-like passage and questions
const sampleReadingData = {
  readingId: "001",
  passage: `The Industrial Revolution, beginning in Britain in the late 18th century, marked a dramatic transformation in human society. What started as a revolution in textile manufacturing quickly spread to other industries and across continents. The introduction of steam power, mechanization, and factory systems fundamentally changed how goods were produced and how people lived and worked.`,
  sections: [
    {
      title: "Paragraph A",
      content: `The Industrial Revolution, beginning in Britain in the late 18th century, marked a dramatic transformation in human society. What started as a revolution in textile manufacturing quickly spread to other industries and across continents.`,
    },
    {
      title: "Paragraph B",
      content: `The introduction of steam power, mechanization, and factory systems fundamentally changed how goods were produced and how people lived and worked. Factories replaced cottage industries, and workers moved from rural areas to rapidly growing urban centers.`,
    },
    {
      title: "Paragraph C",
      content: `The environmental impact of industrialization was significant and often overlooked by contemporaries. Coal consumption increased dramatically, leading to severe air pollution in industrial cities. Rivers became contaminated with chemical waste from factories, affecting both ecosystems and public health.`,
    },
  ],
  questions: [
    {
      id: "q1",
      type: "short-answer",
      question: "In which country did the Industrial Revolution begin?",
      correctAnswer: "Britain",
    },
    {
      id: "q2",
      type: "short-answer",
      question:
        "What was the primary industry that started the Industrial Revolution?",
      correctAnswer: "Textile manufacturing",
    },
    {
      id: "q3",
      type: "short-answer",
      question:
        "What was one significant environmental consequence of industrialization?",
      correctAnswer: "Air pollution",
    },
  ],
};

export const getReading = async (req, res) => {
    try {
        
        //sample data from server
        return res.status(200).json({
            success: true,
            message: "Reading fetched successfully",
            data: sampleReadingData
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching reading",
            error: error.message
        });
    }
};

export const submitReadingAnswers = async (req, res) => {
    try {
        const { email, readingId, answers } = req.body;
        
        if (!email || !readingId || !Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: "Please provide email, readingId, and answers"
            });
        }

        if (req.decoded_email && req.decoded_email !== email) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: email does not match token"
            });
        }

        const readingSet = await Questions.findOne({ readingId });
        if (!readingSet) {
            return res.status(404).json({
                success: false,
                message: "Reading set not found"
            });
        }

        if (answers.length !== readingSet.questions.length) {
            return res.status(400).json({
                success: false,
                message: "Please answer all questions before submitting"
            });
        }

        let correctCount = 0;

        const evaluatedAnswers = answers.map(answer => {
            const question = readingSet.questions.find(q => q.id === answer.questionId);
            
            if (!question) {
                return { ...answer, isCorrect: false };
            }

            const normalizedAnswer = String(answer.userAnswer || '').trim().toLowerCase();
            const normalizedCorrect = String(question.correctAnswer || '').trim().toLowerCase();
            const isCorrect = normalizedAnswer === normalizedCorrect;

            if (isCorrect) correctCount += 1;

            return {
                ...answer,
                isCorrect,
                correctAnswer: question.correctAnswer || null
            };
        });

        const score = Math.round((correctCount / answers.length) * 100);

        const readingRecord = new Reading({
            email,
            readingId,
            passage: readingSet.passage,
            sections: readingSet.sections,
            questions: readingSet.questions,
            answers: evaluatedAnswers,
            totalQuestions: answers.length,
            score,
            completedAt: new Date()
        });

        await readingRecord.save();

        return res.status(200).json({
            success: true,
            message: "Answers submitted successfully",
            score,
            totalQuestions: answers.length,
            correctAnswers: correctCount,
            evaluatedAnswers
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error submitting answers",
            error: error.message
        });
    }
};

export const getUserReadingHistory = async (req, res) => {
    try {
        const { email } = req.params;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please provide email"
            });
        }

        const readings = await Reading.find({ email }).sort({ completedAt: -1 });
        
        return res.status(200).json({
            success: true,
            message: "Reading history fetched successfully",
            readings
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching reading history",
            error: error.message
        });
    }
};
