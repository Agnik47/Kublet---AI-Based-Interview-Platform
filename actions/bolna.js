"use server";

import { currentUser } from "@clerk/nextjs/server";

export const startBolnaSession = async (profile, blueprint) => {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!profile) {
    throw new Error("Candidate profile is required to start the interview.");
  }

  if (!blueprint) {
    throw new Error("Interview blueprint is required to start the interview.");
  }

  const agentId = process.env.BOLNA_AGENT_ID;
  if (!agentId) {
    throw new Error("Bolna Agent configuration is missing on the server.");
  }

  // Format context data keys for the Bolna AI agent.
  // Converting arrays of questions and project objects into clean string-based representations.
  const contextData = {
    candidate_name: profile.candidateName || "Candidate",
    candidate_level: blueprint.candidateLevel || "Unknown Level",
    target_role: blueprint.targetRole || "Software Engineer",
    intro_questions: Array.isArray(blueprint.introQuestions)
      ? blueprint.introQuestions.join("\n")
      : "",
    project_questions: Array.isArray(blueprint.projectQuestions)
      ? blueprint.projectQuestions.map((q, i) => `${i + 1}. ${q.question}${q.followUp ? ` (Follow-up: ${q.followUp})` : ""}`).join("\n")
      : "",
    technical_questions: Array.isArray(blueprint.technicalQuestions)
      ? blueprint.technicalQuestions.map((q, i) => `${i + 1}. ${q.question}${q.followUp ? ` (Follow-up: ${q.followUp})` : ""}`).join("\n")
      : "",
    behavioral_questions: Array.isArray(blueprint.behavioralQuestions)
      ? blueprint.behavioralQuestions.join("\n")
      : ""
  };

  return {
    agentId,
    websocketHost: "ws://localhost:3001",
    contextData
  };
};
