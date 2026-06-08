export const normalizePassageIndex = (value) => {
  if (value === undefined || value === null || value === "") return 0;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const getQuestionPassageIndex = (question, questionGroups = [], questionIndex) => {
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
