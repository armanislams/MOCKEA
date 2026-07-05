import Questions from "../model/questions.js";
import MockTest from "../model/mockTest.js";
import mongoose from "mongoose";

export const seedDatabase = async () => {
  let seededIELTS = false;
  let seededPTE = false;

  // 1. Create a seeded IELTS Mock Test
  const existingIELTS = await MockTest.findOne({ title: "[SEEDED] IELTS Master Prep Mock Test" });
  if (!existingIELTS) {
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
          correctAnswer: "N/A"
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
          correctAnswer: "N/A"
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
    seededIELTS = true;
  }

  // 2. Create a seeded PTE Mock Test
  const existingPTE = await MockTest.findOne({ title: "[SEEDED] PTE Academic Master Prep Mock Test" });
  if (!existingPTE) {
    // Create PTE Speaking Question Set
    const pteSpeakingSet = new Questions({
      testType: "speaking",
      examType: "PTE",
      title: "PTE Academic Speaking - Seeded Set",
      isMockOnly: true,
      forPlanType: "standard",
      questions: [
        {
          id: "pte-s1",
          type: "pte-read-aloud",
          question: "The transition from heavy print textbooks to electronic versions has significantly altered the educational landscape. Although digital formats provide obvious benefits regarding cost and convenience, concerns remain about their impact on comprehension.",
          correctAnswer: "N/A"
        },
        {
          id: "pte-s2",
          type: "pte-repeat-sentence",
          question: "Listen to the audio recording and repeat the sentence exactly as you hear it.",
          pteAudioTranscript: "Scientists are discovering new links between genes and diseases.",
          correctAnswer: "N/A"
        },
        {
          id: "pte-s3",
          type: "pte-describe-image",
          question: "Look at the image below. Describe the details shown in the diagram in your own words.",
          imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df",
          correctAnswer: "N/A"
        }
      ]
    });
    await pteSpeakingSet.save();

    // Create PTE Writing Question Set
    const pteWritingSet = new Questions({
      testType: "writing",
      examType: "PTE",
      title: "PTE Academic Writing - Seeded Set",
      isMockOnly: true,
      forPlanType: "standard",
      questions: [
        {
          id: "pte-w1",
          type: "pte-summarize-written-text",
          question: "Read the passage below and write a one-sentence summary of the passage in the box. You have 10 minutes to write your summary.\n\nSolar energy has grown rapidly as a source of clean electricity. Photovoltaic panels convert sunlight directly into power, reducing dependency on fossil fuels. Modern advances have lowered battery storage costs, solving the intermittency problem of solar power generation and making it a viable primary grid option.",
          correctAnswer: "N/A"
        },
        {
          id: "pte-w2",
          type: "pte-write-essay",
          question: "Many schools now offer online learning as an alternative to traditional classroom teaching. Write an essay discussing the advantages and disadvantages of this trend, giving your opinion.",
          correctAnswer: "N/A"
        }
      ]
    });
    await pteWritingSet.save();

    // Create PTE Reading Question Set
    const pteReadingSet = new Questions({
      testType: "reading",
      examType: "PTE",
      title: "PTE Academic Reading - Seeded Set",
      isMockOnly: true,
      forPlanType: "standard",
      questions: [
        {
          id: "pte-r1",
          type: "pte-reading-writing-fill-blanks",
          question: "Space exploration has always pushed the boundaries of human technology. In recent years, private companies have [blank-1] a major role in launching satellites. This shift has [blank-2] the cost of accessing space, allowing smaller nations and universities to conduct their own experiments.",
          correctAnswer: "played, reduced",
          pteDropdownOptions: [
            ["played", "ignored", "avoided", "rejected"],
            ["reduced", "increased", "multiplied", "stabilized"]
          ]
        },
        {
          id: "pte-r2",
          type: "pte-reorder-paragraphs",
          question: "Arrange the paragraphs below in the correct logical sequence.",
          correctAnswer: "B, A, D, C",
          options: [
            "A. This popularity led to the establishment of coffeehouses across Europe, which became hubs for intellectual discussions.",
            "B. Coffee was first discovered in the highlands of Ethiopia, where goat herders noticed its stimulating effects.",
            "C. Today, coffee is one of the most traded agricultural commodities in the world, enjoyed by millions daily.",
            "D. By the seventeenth century, the beverage had reached the Middle East and was introduced to European traders."
          ],
          pteParagraphsOrder: ["B", "A", "D", "C"]
        }
      ]
    });
    await pteReadingSet.save();

    // Create PTE Listening Question Set
    const pteListeningSet = new Questions({
      testType: "listening",
      examType: "PTE",
      title: "PTE Academic Listening - Seeded Set",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      isMockOnly: true,
      forPlanType: "standard",
      questions: [
        {
          id: "pte-l1",
          type: "pte-summarize-spoken-text",
          question: "You will hear a short lecture. Write a summary of 50-70 words based on what you heard.",
          pteAudioTranscript: "Decision-making skills are crucial for those in management positions, as they directly impact organizational productivity and employee morale.",
          correctAnswer: "N/A"
        },
        {
          id: "pte-l2",
          type: "pte-write-from-dictation",
          question: "You will hear a sentence. Type the sentence exactly as you hear it, checking your spelling.",
          pteAudioTranscript: "A list of valid sources must be included in the bibliography.",
          correctAnswer: "A list of valid sources must be included in the bibliography."
        }
      ]
    });
    await pteListeningSet.save();

    // Create structured Mock Test
    const pteMockTest = new MockTest({
      title: "[SEEDED] PTE Academic Master Prep Mock Test",
      description: "Full-length PTE academic practice test seeded by MOCKEA diagnostic database engines.",
      planType: "standard",
      examType: "PTE",
      isPublic: true,
      sections: {
        reading: [pteReadingSet._id],
        listening: [pteListeningSet._id],
        writing: [pteWritingSet._id],
        speaking: [pteSpeakingSet._id]
      },
      totalDuration: 120,
      structure: [
        {
          sectionName: "Speaking",
          questionSets: [pteSpeakingSet._id],
          duration: 30
        },
        {
          sectionName: "Writing",
          questionSets: [pteWritingSet._id],
          duration: 30
        },
        {
          sectionName: "Reading",
          questionSets: [pteReadingSet._id],
          duration: 30
        },
        {
          sectionName: "Listening",
          questionSets: [pteListeningSet._id],
          duration: 30
        }
      ]
    });
    await pteMockTest.save();
    seededPTE = true;
  }

  return {
    success: true,
    message: `Database seeding completed. IELTS Seeded: ${seededIELTS}, PTE Seeded: ${seededPTE}`
  };
};
