"use server";

import { currentUser } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateInterviewBlueprint = async (profile) => {
  const user = await currentUser();

  if (!user) throw new Error("Unauthorized");

  if (!profile) {
    throw new Error("No candidate profile provided");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API configuration is missing. Please contact support.");
  }

  const genAi = new GoogleGenerativeAI(apiKey);
  const model = genAi.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    temperature: 0.3,
  });

  const prompt = `You are a Principal Software Engineer and Elite Technical Recruiter. Your task is to design a highly specific and challenging Interview Blueprint for a candidate based on their structured profile.

CANDIDATE PROFILE:
${JSON.stringify(profile, null, 2)}

Design a recruiter-style interview plan. Questions must prioritize the candidate's actual projects and claimed skills listed in their profile. Avoid generic questions. Craft realistic, resume-specific scenario questions.

Respond ONLY with a valid JSON object. Do not include markdown formatting, backticks (e.g. \`\`\`json), or comments.

Expected JSON schema:
{
  "candidateLevel": "Junior / Mid / Senior / Lead",
  "targetRole": "Frontend / Backend / Full Stack / Mobile / DevOps Engineer, etc.",
  "introQuestions": [
    "A resume-specific introductory question asking them to pitch their relevant experience."
  ],
  "projectQuestions": [
    {
      "question": "A tough project-specific question focused on technology choices or technical challenges in their projects (e.g., 'In project X, why did you choose Stream instead of WebRTC?').",
      "followUp": "A corresponding follow-up probing technical trade-offs or constraints (e.g., 'If Stream becomes too expensive, what alternatives would you consider?')."
    }
  ],
  "technicalQuestions": [
    {
      "question": "A deep-dive technical question testing depth on one of their core listed skills.",
      "followUp": "A follow-up digging into edge cases, optimization, or under-the-hood behavior of that technology."
    }
  ],
  "behavioralQuestions": [
    "A behavioral question customized to their project experience or level (e.g., handling scale, leading teams, or debugging critical issues)."
  ],
  "followUpStrategies": [
    "General advice/strategies for the interviewer on how to evaluate the candidate's responses for this specific profile."
  ],
  "focusAreas": [
    "Key areas of focus based on their strengths or potential gaps in experience (e.g., 'Distributed caching', 'State management overhead')."
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();

    // Clean JSON formatting
    const cleanJson = rawText
      .replace(/^```json|^```|```$/gm, "")
      .trim();

    const data = JSON.parse(cleanJson);

    // Schema mapping and validation
    return {
      candidateLevel: data.candidateLevel || "Senior",
      targetRole: data.targetRole || "Software Engineer",
      introQuestions: Array.isArray(data.introQuestions) ? data.introQuestions : [],
      projectQuestions: Array.isArray(data.projectQuestions) ? data.projectQuestions : [],
      technicalQuestions: Array.isArray(data.technicalQuestions) ? data.technicalQuestions : [],
      behavioralQuestions: Array.isArray(data.behavioralQuestions) ? data.behavioralQuestions : [],
      followUpStrategies: Array.isArray(data.followUpStrategies) ? data.followUpStrategies : [],
      focusAreas: Array.isArray(data.focusAreas) ? data.focusAreas : []
    };
  } catch (error) {
    console.error("Gemini Blueprint Generation Error:", error);
    throw new Error("Failed to generate interview blueprint. Please try again.");
  }
};
