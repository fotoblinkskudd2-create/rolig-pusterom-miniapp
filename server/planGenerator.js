import { actionTemplates } from './data/planTemplates.js';

// Rule-based 3-step plan: tally how often each category showed up in the
// session's questions, then pull action templates from the top categories.
// No AI / external calls — purely deterministic given the session's answers.
export function generatePlanSteps(sessionQuestions) {
  const categoryCounts = {};
  for (const q of sessionQuestions) {
    categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
  }

  const rankedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category);

  const steps = [];
  const usedTexts = new Set();

  let round = 0;
  while (steps.length < 3 && round < 10) {
    for (const category of rankedCategories) {
      if (steps.length >= 3) break;
      const options = actionTemplates[category] || [];
      const pick = options[round % options.length];
      if (pick && !usedTexts.has(pick)) {
        usedTexts.add(pick);
        steps.push({ text: pick, done: false });
      }
    }
    round++;
  }

  return steps;
}
