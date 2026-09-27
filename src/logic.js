// QVAC Interview Question Bank Generator — core logic.
// Given a job role, generates 5 realistic interview questions. The count
// requirement (exactly 5) is enforced deterministically, not left to the
// model's prompt-following alone.

import { completion } from "@qvac/sdk";

function looksUnusable(text) {
  if (!text || text.trim().length < 3) return true;
  const bad = [
    "i cannot", "i can't", "as an ai", "i'm not able", "i do not have",
    "i'm sorry", "i am sorry", "please provide more", "please try again",
    "i'd be happy to help", "could you provide", "can you provide",
  ];
  const lower = text.toLowerCase();
  return bad.some((phrase) => lower.includes(phrase));
}

function parseQuestions(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const questions = [];
  for (const line of lines) {
    const match = line.match(/^(?:\d+[.)]|-|\*)\s*(.+)$/);
    if (match) {
      let q = match[1].trim().replace(/^["“]|["”]$/g, "").trim();
      if (q.length > 2) questions.push(q);
    }
  }
  if (questions.length === 0) {
    const bySentence = text.split(/(?<=\?)\s+/).map((s) => s.trim()).filter((s) => s.length > 5);
    questions.push(...bySentence);
  }
  return questions;
}

const GENERIC_FILLERS = (role) => [
  `Tell me about a time you had to solve a difficult problem in a previous ${role} role.`,
  `What do you think are the most important skills for a ${role} to have, and why?`,
  `Describe a project you're proud of that's relevant to this ${role} position.`,
  `How do you prioritize your work when you have multiple competing deadlines as a ${role}?`,
  `What's a mistake you made in a ${role}-related task, and what did you learn from it?`,
];

export async function generate(modelId, role) {
  const run = completion({
    modelId,
    history: [
      {
        role: "system",
        content:
          "You generate realistic interview questions that hiring managers actually ask for a given job role. Given the role, write 5 specific, realistic interview questions for it — mix of behavioral and role-specific technical/practical questions. " +
          "Reply as a numbered list 1-5, one question per line, nothing else.",
      },
      { role: "user", content: "Role: registered nurse in an ICU" },
      {
        role: "assistant",
        content:
          "1. Tell me about a time you had to make a quick clinical decision under pressure — what happened?\n" +
          "2. How do you prioritize care when you have multiple critical patients at once?\n" +
          "3. Describe a situation where you disagreed with a physician's plan — how did you handle it?\n" +
          "4. What's your approach to communicating with a patient's family during a difficult update?\n" +
          "5. How do you stay current with ICU protocols and best practices?",
      },
      { role: "user", content: `Role: ${role}` },
    ],
    stream: true,
    completionOpts: { temperature: 0.7, maxTokens: 400 },
  });

  let text = "";
  for await (const token of run.tokenStream) text += token;
  text = text.trim();

  let questions = looksUnusable(text) ? [] : parseQuestions(text);

  const fillers = GENERIC_FILLERS(role);
  let fillerIdx = 0;
  while (questions.length < 5 && fillerIdx < fillers.length) {
    const candidate = fillers[fillerIdx++];
    if (!questions.includes(candidate)) questions.push(candidate);
  }
  if (questions.length > 5) questions = questions.slice(0, 5);

  return { questions };
}
