"use server";

import { currentUser } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const analyzeResume = async (text) => {
  const user = await currentUser();

  if (!user) throw new Error("Unauthorized");

  if (!text || text.trim().length === 0) {
    throw new Error("No resume text provided");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API configuration is missing. Please contact support.");
  }

  // Truncate to maximum 20,000 characters to prevent token overflow
  const truncatedText = text.substring(0, 20000);

  const genAi = new GoogleGenerativeAI(apiKey);
  const model = genAi.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    temperature: 0.2, // low temperature for precise structured extraction
  });

  const prompt = `You are an expert recruiter and technical assessor. Analyze the following resume text and generate a structured candidate profile.

RESUME TEXT:
${truncatedText}

Respond ONLY with a valid JSON object. Do not include any markdown styling, no backticks, no markdown blocks, no html, and no trailing notes.

Example format:
{
  "candidateName": "John Doe",
  "professionalSummary": "Experienced Full Stack Developer with 5+ years of experience...",
  "yearsExperience": "5",
  "technicalSkills": ["React", "Node.js", "PostgreSQL", "Tailwind CSS"],
  "softSkills": ["Leadership", "Communication", "Problem Solving"],
  "projects": [
    {
      "title": "E-Commerce Platform",
      "description": "Led development of a high-traffic retail store using Next.js..."
    }
  ],
  "education": [
    {
      "institution": "University of Technology",
      "degree": "Bachelor of Science in Computer Science",
      "year": "2020"
    }
  ],
  "certifications": ["AWS Certified Developer Associate"],
  "strengths": ["Strong frontend architecture", "Database design and optimization"],
  "interviewFocusAreas": ["System Design scalability", "Advanced React state management and optimization"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();

    // Clean markdown brackets
    const cleanJsonString = rawText
      .replace(/^```json|^```|```$/gm, "")
      .trim();

    const data = JSON.parse(cleanJsonString);

    // Validate and build structured response
    return {
      candidateName: data.candidateName || "Not Found",
      professionalSummary: data.professionalSummary || "No summary found.",
      yearsExperience: data.yearsExperience || "N/A",
      technicalSkills: Array.isArray(data.technicalSkills) ? data.technicalSkills : [],
      softSkills: Array.isArray(data.softSkills) ? data.softSkills : [],
      projects: Array.isArray(data.projects) ? data.projects : [],
      education: Array.isArray(data.education) ? data.education : [],
      certifications: Array.isArray(data.certifications) ? data.certifications : [],
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      interviewFocusAreas: Array.isArray(data.interviewFocusAreas) ? data.interviewFocusAreas : []
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze resume text. Please try again or check the format.");
  }
};
