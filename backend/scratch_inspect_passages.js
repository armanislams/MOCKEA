import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: 'g:/project/MOCKEA/backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI;

const QuestionsSchema = new mongoose.Schema({
    title: String,
    passage: String,
    passages: [{ title: String, content: String }],
    questions: [new mongoose.Schema({ id: String, type: String, question: String }, { _id: false })]
});

const Questions = mongoose.model('Questions', QuestionsSchema);

const mockTestSchema = new mongoose.Schema({
    title: String,
    sections: {
        reading: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Questions' }]
    }
});

const MockTest = mongoose.model('MockTest', mockTestSchema);

async function run() {
    await mongoose.connect(MONGODB_URI);
    const test = await MockTest.findOne({ title: /mock test 2/i }).populate('sections.reading');
    
    test.sections.reading.forEach((sec, idx) => {
        console.log(`\n=== Section ${idx + 1} ===`);
        console.log("Title:", sec.title);
        console.log("data.passage length:", sec.passage ? sec.passage.length : 0);
        console.log("data.passages length:", sec.passages ? sec.passages.length : 0);
        if (sec.passages && sec.passages.length > 0) {
            sec.passages.forEach((p, pIdx) => {
                console.log(`  - Passage ${pIdx + 1} title:`, p.title);
                console.log(`  - Passage ${pIdx + 1} content length:`, p.content ? p.content.length : 0);
                console.log(`  - Passage ${pIdx + 1} content sample:`, p.content ? p.content.substring(0, 100) : "empty");
            });
        }
    });
    
    mongoose.connection.close();
}
run();
