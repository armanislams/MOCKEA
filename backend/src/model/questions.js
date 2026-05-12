import mongoose from 'mongoose'

const QuestionItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["short-answer", "multiple-choice", "true-false"],
      default: "short-answer",
    },
    question: {
      type: String,
      required: true,
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      default: [],
    }
  },
  { _id: false },
);

const QuestionsSchema = new mongoose.Schema(
  {
    readingId: {
      type: String,
      required: true,
    },
    passageTitle: {
      type: String,
      required: true,
    },
    passage: {
      type: String,
      required: true,
    },
    sections: [
      {
        title: {
          type: String,
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
      },
    ],
    questions: [QuestionItemSchema],
    forPlanType: {
      type: String,
      default: "free",
    },
  },
  { timestamps: true },
);

const Questions = mongoose.model('Questions', QuestionsSchema)
export default Questions