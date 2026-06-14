import mongoose from 'mongoose';
import 'dotenv/config';
import MockTestResult from './src/model/mockTestResult.js';

const check = async () => {
    try {
        const url = process.env.MONGODB_URI;
        await mongoose.connect(url);
        
        const results = await MockTestResult.find({ status: 'completed' }).lean();
        console.log(`Found ${results.length} completed mock results:`);
        for (const r of results) {
            const speakingSec = r.sectionResults.find(s => s.sectionType === 'speaking');
            if (speakingSec && speakingSec.answers && speakingSec.answers.length > 0) {
                console.log(`\n========================================`);
                console.log(`Result ID: ${r._id} | Student ID: ${r.userId}`);
                console.log(`Speaking Answers count: ${speakingSec.answers.length}`);
                speakingSec.answers.forEach((ans, i) => {
                    console.log(`  Answer ${i+1}:`);
                    console.log(`    questionId: "${ans.questionId}"`);
                    console.log(`    userAnswer snippet: "${ans.userAnswer ? ans.userAnswer.substring(0, 150) : 'None'}"`);
                });
            }
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

check();
