/**
 * migrate-examType.js
 * 
 * One-time migration script to backfill all existing Questions and MockTests
 * that don't have an `examType` field with the default value "IELTS".
 * 
 * Run from the backend/ directory:
 *   node src/scripts/migrate-examType.js
 */

import mongoose from "mongoose";
import "dotenv/config";
import Questions from "../model/questions.js";
import MockTest from "../model/mockTest.js";

const run = async () => {
    const MongoDBUrl = process.env.MONGODB_URI;
    if (!MongoDBUrl) {
        console.error("❌  MONGODB_URI not set in environment.");
        process.exit(1);
    }

    try {
        await mongoose.connect(MongoDBUrl);
        console.log("✅  Connected to MongoDB");

        // --- Backfill Questions ---
        const questionsResult = await Questions.updateMany(
            {
                $or: [
                    { examType: { $exists: false } },
                    { examType: null }
                ]
            },
            { $set: { examType: "IELTS" } }
        );
        console.log(`✅  Questions updated: ${questionsResult.modifiedCount} documents set to examType: "IELTS"`);

        // --- Backfill MockTests ---
        const mockTestResult = await MockTest.updateMany(
            {
                $or: [
                    { examType: { $exists: false } },
                    { examType: null }
                ]
            },
            { $set: { examType: "IELTS" } }
        );
        console.log(`✅  MockTests updated: ${mockTestResult.modifiedCount} documents set to examType: "IELTS"`);

        console.log("\n🎉  Migration complete!");
    } catch (err) {
        console.error("❌  Migration failed:", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("🔌  Disconnected from MongoDB");
        process.exit(0);
    }
};

run();
