import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: './.env' });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("MONGODB_URI not found");
    process.exit(1);
}

const QuestionItemSchema = new mongoose.Schema({
    id: String,
    type: String,
    question: String,
    correctAnswer: String,
    options: [String],
    matchingPairs: [{ key: String, value: String }],
    imageUrl: String,
    passageIndex: Number,
    info: String
}, { _id: false });

const QuestionsSchema = new mongoose.Schema({
    testType: String,
    examType: String,
    listeningPart: Number,
    title: String,
    passage: String,
    passages: [{ title: String, content: String }],
    questionGroups: [{
        title: String,
        instructions: String,
        fromQuestion: Number,
        toQuestion: Number,
        passageIndex: Number,
        linkUrl: String,
        rightSideQuestion: Boolean
    }],
    questions: [QuestionItemSchema]
});

const Questions = mongoose.model('Questions', QuestionsSchema);

const mockTestSchema = new mongoose.Schema({
    title: String,
    sections: {
        reading: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Questions' }],
        listening: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Questions' }]
    }
});

const MockTest = mongoose.model('MockTest', mockTestSchema);

async function run() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const tests = await MockTest.find({ title: /mock test 2/i }).populate('sections.reading');
    if (tests.length === 0) {
        console.log("No mock test found with title matching 'Mock Test 2'");
        mongoose.connection.close();
        return;
    }

    const test = tests[0];
    console.log("Mock Test Title:", test.title);
    const readingSections = test.sections.reading;
    console.log("Number of reading sections:", readingSections.length);

    readingSections.forEach((sec, idx) => {
        console.log(`\n--- Reading Section ${idx + 1}: ${sec.title} ---`);
        console.log("Has Passage Content:", !!sec.passage);
        console.log("Passage Length:", sec.passage ? sec.passage.length : 0);
        console.log("Passages array size:", sec.passages ? sec.passages.length : 0);
        console.log("Questions count:", sec.questions?.length);
        console.log("Question Groups:", JSON.stringify(sec.questionGroups, null, 2));
        console.log("Questions detail (first 3):", JSON.stringify(sec.questions?.slice(0, 3).map(q => ({ id: q.id, type: q.type, question: q.question })), null, 2));
    });

    mongoose.connection.close();
}

run().catch(console.error);
