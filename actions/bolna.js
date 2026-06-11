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

  const allowedSkills = Array.isArray(profile.technicalSkills)
    ? profile.technicalSkills.join(", ")
    : "None listed";

  const allowedProjects = Array.isArray(profile.projects)
    ? profile.projects.map(p => typeof p === 'object' ? p.title : p).join(", ")
    : "None listed";

  const systemGuardrails = `
[CRITICAL SYSTEM GUARDRAILS - MASTER INSTRUCTIONS]:
You are an expert technical recruiter and hiring manager conducting a live voice interview. Your behavior must strictly conform to these guardrails:
1. STRICT RESUME GROUNDING: Stay grounded strictly in the candidate's uploaded resume details and the generated interview blueprint. Do not ask about, discuss, or validate skills, tools, frameworks, or projects that are not present in the allowed list below.
2. ALLOWED RESUME CONTEXT:
   - Candidate Name: ${profile.candidateName || "Candidate"}
   - Target Role: ${blueprint.targetRole || "Software Engineer"}
   - Candidate Level: ${blueprint.candidateLevel || "Unknown Level"}
   - Allowed Skills/Technologies: ${allowedSkills}
   - Allowed Projects: ${allowedProjects}
3. CHALLENGE UNSUPPORTED CLAIMS: If the candidate claims knowledge, experience, or usage of a technology, tool, or skill NOT listed in the Allowed Skills/Technologies or Allowed Projects above (for example: they say "I know Docker" or "I know Kubernetes" when Docker/Kubernetes are not in the allowed list), you MUST challenge them immediately. You must respond with: "I don't see [Technology Name] mentioned in your resume. Could you explain where you've used it?"
4. DETECT TOPIC DRIFT: If the candidate drifts away from technical topics, tries to talk about casual personal topics, or says something out of scope like "I want to become a photographer", you must politely redirect them back to the resume context immediately. You must respond with: "That's interesting, however your resume primarily highlights Full Stack Development experience including React, Next.js, Node.js, and AI-powered applications. Let's focus on understanding your experience in those areas first." or "Let's return to discussing your experience relevant to the role."
5. VERIFY PROJECT OWNERSHIP: When discussing any project, verify their personal contribution and ownership. Ask questions like: "What specific parts did you personally implement?"
6. VERIFY TECHNICAL DEPTH: Do not accept high-level explanations. Challenge their technology choices and probe technical depth. For example, if they mention using caching or a backend choice, ask: "Why Redis instead of in-memory caching?" or probe why they made specific architectural choices.
7. PROFESSIONAL RECRUITER PERSONA: Maintain a professional, objective, recruiter/hiring manager tone. Do not behave like a friend, coach, therapist, or casual conversationalist. Be concise, professional, and interview-focused.
`;

  // Format context data keys for the Bolna AI agent.
  // Converting arrays of questions and project objects into clean string-based representations.
  const contextData = {
    candidate_name: profile.candidateName || "Candidate",
    candidate_level: blueprint.candidateLevel || "Unknown Level",
    target_role: `${blueprint.targetRole || "Software Engineer"}\n\n${systemGuardrails}`,
    intro_questions: `${Array.isArray(blueprint.introQuestions) ? blueprint.introQuestions.join("\n") : ""}\n\n${systemGuardrails}`,
    project_questions: `${Array.isArray(blueprint.projectQuestions) ? blueprint.projectQuestions.map((q, i) => `${i + 1}. ${q.question}${q.followUp ? ` (Follow-up: ${q.followUp})` : ""}`).join("\n") : ""}\n\n${systemGuardrails}`,
    technical_questions: `${Array.isArray(blueprint.technicalQuestions) ? blueprint.technicalQuestions.map((q, i) => `${i + 1}. ${q.question}${q.followUp ? ` (Follow-up: ${q.followUp})` : ""}`).join("\n") : ""}\n\n${systemGuardrails}`,
    behavioral_questions: `${Array.isArray(blueprint.behavioralQuestions) ? blueprint.behavioralQuestions.join("\n") : ""}\n\n${systemGuardrails}`
  };

  return {
    agentId,
    websocketHost: "ws://localhost:3001",
    contextData
  };
};
