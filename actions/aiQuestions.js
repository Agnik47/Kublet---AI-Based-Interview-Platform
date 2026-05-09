"use server";

import { currentUser } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const CATEGORY_PROMPTS = {
  FRONTEND: "React, JavaScript, CSS, performance, accessibility, browser APIs",
  BACKEND:
    "Node.js, REST APIs, databases, authentication, caching, scalability",
  FULLSTACK:
    "full-stack architecture, API design, state management, deployment",
  DSA: "data structures, algorithms, time complexity, problem solving",
  SYSTEM_DESIGN:
    "distributed systems, scalability, databases, microservices, caching",
  BEHAVIORAL:
    "leadership, teamwork, conflict resolution, career growth, STAR method",
  DEVOPS: "CI/CD, Docker, Kubernetes, cloud infrastructure, monitoring",
  MOBILE:
    "React Native, iOS/Android, performance, offline support, app lifecycle",
  AI_ML:
    "Machine learning, deep learning, neural networks, NLP, model training",
};

export const generateInterviewQuestions = async ({ category }) => {
  const user = await currentUser();

  if (!user) throw new Error("Unauthorized");

  if (!category || !CATEGORY_PROMPTS[category])
    throw new Error("Invalid category");

  const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAi.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    temperature: 0.7,
  });

  const prompt = `You are an expert technical interviewer. Generate 6 interview questions for a ${category} role covering: ${CATEGORY_PROMPTS[category]}.

For each question, provide a concise but complete answer (2-4 sentences) that an interviewer can use to evaluate responses.

Respond ONLY with a valid JSON array. No markdown, no backticks, no explanation. Example format:
[{"question": "...", "answer": "..."}, {"question": "...", "answer": "..."}]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const clean = text.replace(/^```json|^```|```$/gm, "").trim();
  const questions = JSON.parse(clean);

  return { questions };
};
