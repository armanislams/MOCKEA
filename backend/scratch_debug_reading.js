import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: 'g:/project/MOCKEA/backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI;

const QuestionsSchema = new mongoose.Schema({
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

const groupQuestions = (questions) => {
    const groups = [];
    let currentGridGroup = null;

    for (const q of questions) {
        if (q.type === 'matching-grid') {
            if (currentGridGroup) {
                currentGridGroup.questions.push(q);
            } else {
                currentGridGroup = {
                    type: 'matching-grid-group',
                    options: (q.options || []).filter(o => o && o.trim() !== ""),
                    questions: [q]
                };
                groups.push(currentGridGroup);
            }
        } else {
            currentGridGroup = null;
            groups.push({
                type: 'single',
                question: q
            });
        }
    }
    return groups;
};

const groupVisualsByQuestionGroups = (visualGroups, questionGroups, offset, questions) => {
    const grouped = [];
    const assignedVisuals = new Set();
    const sortedGroups = [...(questionGroups || [])].sort((a, b) => Number(a.fromQuestion) - Number(b.fromQuestion));

    for (const qg of sortedGroups) {
        const fromQ = Number(qg.fromQuestion);
        const toQ = Number(qg.toQuestion);
        const groupVisuals = [];

        for (let i = 0; i < visualGroups.length; i++) {
            if (assignedVisuals.has(i)) continue;

            const vg = visualGroups[i];
            const firstQ = vg.type === 'matching-grid-group' ? vg.questions[0] : vg.question;
            const firstQIdx = questions.findIndex(item => item.id === firstQ.id);
            const globalQNum = offset + firstQIdx + 1;

            if (globalQNum >= fromQ && globalQNum <= toQ) {
                groupVisuals.push(vg);
                assignedVisuals.add(i);
            }
        }

        if (groupVisuals.length > 0) {
            grouped.push({
                type: 'group',
                header: qg,
                visuals: groupVisuals
            });
        }
    }

    const ungroupedVisuals = [];
    for (let i = 0; i < visualGroups.length; i++) {
        if (!assignedVisuals.has(i)) {
            ungroupedVisuals.push(visualGroups[i]);
        }
    }

    if (ungroupedVisuals.length > 0) {
        grouped.push({
            type: 'ungrouped',
            visuals: ungroupedVisuals
        });
    }

    return grouped;
};

async function run() {
    await mongoose.connect(MONGODB_URI);
    const test = await MockTest.findOne({ title: /mock test 2/i }).populate('sections.reading');
    const sec = test.sections.reading[1]; // Section 2
    
    console.log("Section Title:", sec.title);
    
    const activeSectionOffset = 13; // Questions 1-13 in passage 1
    const groups = groupQuestions(sec.questions || []);
    const groupedItems = groupVisualsByQuestionGroups(groups, sec.questionGroups, activeSectionOffset, sec.questions || []);
    
    console.log("\n--- Grouped Items ---");
    groupedItems.forEach((gi, i) => {
        console.log(`Group ${i+1}: type=${gi.type}`);
        if (gi.type === 'group') {
            console.log(`  - Header: Q${gi.header.fromQuestion}-Q${gi.header.toQuestion}, rightSideQuestion=${gi.header.rightSideQuestion}`);
        }
        console.log(`  - Visuals count: ${gi.visuals.length}`);
    });
    
    // Simulate renderedInlineIds calculation
    const ids = new Set();
    const checkText = (text) => {
        if (!text) return;
        const matches = text.match(/___([\w-]+)___/g) || [];
        matches.forEach(m => {
            const matchKey = m.replace(/___/g, "").trim();
            const q = sec.questions?.find((item, idx) => {
                const questionNum = activeSectionOffset + idx + 1;
                const localIndex = idx + 1;
                return (
                    item.id === matchKey ||
                    questionNum.toString() === matchKey ||
                    localIndex.toString() === matchKey ||
                    item.id.replace(/^r/, "") === matchKey
                );
            });
            if (q) ids.add(q.id);
        });
    };
    checkText(sec.passage);
    sec.questionGroups?.forEach(g => {
        if (g.instructions && !/^\|.+\|$/m.test(g.instructions)) {
            checkText(g.instructions);
        }
    });
    
    console.log("\n--- Rendered Inline IDs ---");
    console.log(Array.from(ids));
    
    // Let's print out what is returned by the left pane filter
    console.log("\n--- Left Pane Filter Results ---");
    const leftPaneItems = groupedItems.filter(groupEntry => {
        if (groupEntry.type !== 'group') return false;
        const firstQ = groupEntry.visuals[0]?.type === 'matching-grid-group' 
            ? groupEntry.visuals[0].questions[0] 
            : groupEntry.visuals[0]?.question;
        if (!firstQ) return false;
        
        const qIdx = sec.questions.findIndex(item => item.id === firstQ.id);
        const qPassageIndex = getQuestionPassageIndex(firstQ, sec.questionGroups, qIdx);
        // showPassageTabs is false
        
        const isMatchingGrid = groupEntry.visuals?.some(vg => vg.type === 'matching-grid-group');
        const hasInlineInstructions = groupEntry.header?.instructions && 
                                      /___([\w-]+)___/.test(groupEntry.header.instructions) && 
                                      !/^\|.+\|$/m.test(groupEntry.header.instructions);
        const hasTable = groupEntry.header?.rightSideQuestion || (groupEntry.header?.instructions && 
                         /___([\w-]+)___/.test(groupEntry.header.instructions) && 
                         /^\|.+\|$/m.test(groupEntry.header.instructions));
        return isMatchingGrid || hasInlineInstructions || hasTable;
    });
    console.log("Left pane items count:", leftPaneItems.length);
    
    mongoose.connection.close();
}

const normalizePassageIndex = (value) => {
  if (value === undefined || value === null || value === "") return 0;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const getQuestionPassageIndex = (question, questionGroups = [], questionIndex) => {
  const directIndex = normalizePassageIndex(question?.passageIndex);
  const hasExplicitPassageIndex = question && Object.prototype.hasOwnProperty.call(question, 'passageIndex');
  if (hasExplicitPassageIndex) {
    return directIndex;
  }
  if (!Array.isArray(questionGroups) || questionGroups.length === 0 || questionIndex == null) {
    return 0;
  }
  const globalQNum = questionIndex + 1;
  const matchedGroup = questionGroups.find((group) => {
    const fromQuestion = normalizePassageIndex(group?.fromQuestion);
    const toQuestion = normalizePassageIndex(group?.toQuestion);
    const groupPassageIndex = normalizePassageIndex(group?.passageIndex);
    return (
      !Number.isNaN(fromQuestion) &&
      !Number.isNaN(toQuestion) &&
      !Number.isNaN(groupPassageIndex) &&
      globalQNum >= fromQuestion &&
      globalQNum <= toQuestion
    );
  });
  return matchedGroup ? normalizePassageIndex(matchedGroup.passageIndex) : 0;
};

run();
