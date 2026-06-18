import mongoose from 'mongoose';
import 'dotenv/config';
import Questions from './src/model/questions.js';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define MONGODB_URI in backend/.env");
  process.exit(1);
}

const seed = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully!");

    // Check if sample already exists
    const existing = await Questions.findOne({ title: "IELTS Listening — Airport Check-in Form (Sample)" });
    if (existing) {
      console.log("Sample already exists, skipping.");
      await mongoose.disconnect();
      return;
    }

    console.log("Creating inline listening sample...");
    const doc = await Questions.create({
      testType: "listening",
      examType: "IELTS",
      listeningPart: 1,
      title: "IELTS Listening — Airport Check-in Form (Sample)",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      instructions: "Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
      forPlanType: "free",
      isPublic: true,
      passage: `<h3>Airport Check-in Information</h3>

<p>Please complete the check-in form below with your travel details.</p>

<table>
<tr><td><strong>Passenger Name:</strong></td><td>___1___</td></tr>
<tr><td><strong>Flight Number:</strong></td><td>___2___</td></tr>
<tr><td><strong>Destination:</strong></td><td>___3___</td></tr>
<tr><td><strong>Departure Date:</strong></td><td>___4___</td></tr>
<tr><td><strong>Seat Preference:</strong></td><td>___5___</td></tr>
<tr><td><strong>Special Meal:</strong></td><td>___6___</td></tr>
<tr><td><strong>Baggage Type:</strong></td><td>___7___</td></tr>
<tr><td><strong>Extra Baggage (kg):</strong></td><td>___8___</td></tr>
<tr><td><strong>Contact Number:</strong></td><td>___9___</td></tr>
<tr><td><strong>Email Address:</strong></td><td>___10___</td></tr>
</table>`,
      questions: [
        { id: "l1",  type: "short-answer", question: "Passenger Name:",     correctAnswer: "David Thompson" },
        { id: "l2",  type: "short-answer", question: "Flight Number:",      correctAnswer: "BA 2490" },
        { id: "l3",  type: "short-answer", question: "Destination:",        correctAnswer: "Edinburgh" },
        { id: "l4",  type: "short-answer", question: "Departure Date:",     correctAnswer: "14th March" },
        { id: "l5",  type: "short-answer", question: "Seat Preference:",    correctAnswer: "window" },
        { id: "l6",  type: "short-answer", question: "Special Meal:",       correctAnswer: "vegetarian" },
        { id: "l7",  type: "short-answer", question: "Baggage Type:",       correctAnswer: "checked" },
        { id: "l8",  type: "short-answer", question: "Extra Baggage (kg):", correctAnswer: "8" },
        { id: "l9",  type: "short-answer", question: "Contact Number:",     correctAnswer: "07890123456" },
        { id: "l10", type: "short-answer", question: "Email Address:",      correctAnswer: "d.thompson@email.co.uk" },
      ],
      version: 1,
      isLatest: true,
    });

    console.log(`Created sample: ${doc.title} (${doc._id})`);
    await mongoose.disconnect();
    console.log("Done!");
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
};

seed();
