import Questions from "../model/questions.js";
import MockTest from "../model/mockTest.js";
import mongoose from "mongoose";

export const seedDatabase = async () => {
  // 1. Create a seeded IELTS Mock Test
  const existingIELTS = await MockTest.findOne({ title: "[SEEDED] IELTS Master Prep Mock Test" });
  if (existingIELTS) {
    return { success: true, message: "Database already seeded with IELTS test." };
  }

  // Create IELTS Reading Question Set
  const readingSet = new Questions({
    testType: "reading",
    examType: "IELTS",
    title: "Seeded IELTS Reading Passage 1: The History of Tea",
    passage: "Tea has a long and storied history dating back to ancient China...",
    passages: [
      {
        title: "The History of Tea",
        content: "Tea has a long and storied history dating back to ancient China. According to legend, Shennong discovered tea when leaves fell into his boiling water..."
      }
    ],
    questionGroups: [
      {
        title: "Questions 1-3",
        instructions: "Choose the correct letter, A, B, C or D.",
        fromQuestion: 1,
        toQuestion: 3
      }
    ],
    questions: [
      {
        id: "r1",
        type: "multiple-choice",
        question: "Who is credited with discovering tea in legend?",
        correctAnswer: "Shennong",
        options: ["Shennong", "Laozi", "Confucius", "Qin Shi Huang"]
      },
      {
        id: "r2",
        type: "true-false",
        question: "Tea was originally discovered in ancient Japan.",
        correctAnswer: "FALSE",
        options: ["TRUE", "FALSE", "NOT GIVEN"]
      }
    ],
    forPlanType: "standard",
    isMockOnly: true
  });
  await readingSet.save();

  // Create IELTS Listening Question Set
  const listeningSet = new Questions({
    testType: "listening",
    examType: "IELTS",
    listeningPart: 1,
    title: "Seeded IELTS Listening Part 1: Hotel Booking Inquiry",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    instructions: "Complete the table below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER.",
    questions: [
      {
        id: "l1",
        type: "short-answer",
        question: "Name of hotel is the Grand __________ Hotel.",
        correctAnswer: "Palace"
      },
      {
        id: "l2",
        type: "short-answer",
        question: "Room price per night is __________ dollars.",
        correctAnswer: "120"
      }
    ],
    forPlanType: "standard",
    isMockOnly: true
  });
  await listeningSet.save();

  // Create IELTS Writing Question Set
  const writingSet = new Questions({
    testType: "writing",
    examType: "IELTS",
    title: "Seeded IELTS Writing Task 1: Academic Line Graph",
    passage: "The chart below shows the number of visitors to three different museums from 2000 to 2015.",
    questions: [
      {
        id: "w1",
        type: "short-answer",
        question: "Write an essay describing the details shown in the museum visitor chart.",
        correctAnswer: ""
      }
    ],
    forPlanType: "standard",
    isMockOnly: true
  });
  await writingSet.save();

  // Create IELTS Speaking Question Set
  const speakingSet = new Questions({
    testType: "speaking",
    examType: "IELTS",
    title: "Seeded IELTS Speaking Part 2: A Memorable Journey",
    speakingPrompt: "Describe a memorable journey you went on. You should say: where you went, how you travelled, who you went with, and explain why it was memorable.",
    speakingPart3Questions: [
      "Why do people like to travel to foreign countries?",
      "Do you think tourism has a positive or negative impact on local cultures?"
    ],
    questions: [
      {
        id: "s1",
        type: "pte-retell-lecture", // generic voice slot
        question: "Record your response for the journey prompt.",
        correctAnswer: ""
      }
    ],
    forPlanType: "standard",
    isMockOnly: true
  });
  await speakingSet.save();

  // Create structured Mock Test
  const mockTest = new MockTest({
    title: "[SEEDED] IELTS Master Prep Mock Test",
    description: "Full-length IELTS academic practice test seeded by MOCKEA diagnostic database engines.",
    planType: "standard",
    examType: "IELTS",
    isPublic: true,
    sections: {
      reading: [readingSet._id],
      listening: [listeningSet._id],
      writing: [writingSet._id],
      speaking: [speakingSet._id]
    },
    totalDuration: 140,
    structure: [
      {
        sectionName: "Listening",
        questionSets: [listeningSet._id],
        duration: 30
      },
      {
        sectionName: "Reading",
        questionSets: [readingSet._id],
        duration: 60
      },
      {
        sectionName: "Writing",
        questionSets: [writingSet._id],
        duration: 40
      },
      {
        sectionName: "Speaking",
        questionSets: [speakingSet._id],
        duration: 10
      }
    ]
  });
  await mockTest.save();

  return {
    success: true,
    message: "IELTS Mock Test and associated IELTS Questions successfully seeded."
  };
};
