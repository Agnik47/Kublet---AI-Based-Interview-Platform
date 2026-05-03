"use client";

import {
  Code,
  CodeBlock,
  CodeHeader,
} from "@/components/animate-ui/components/animate/code";
import { Code2 } from "lucide-react";
import React from "react";

export const CodeDemo = ({ duration, delay, writing, cursor }) => {
  return (
    <Code
      key={`${duration}-${delay}-${writing}-${cursor}`}
      className="w-full sm:w-110 h-120 border-none"
      code={`import { KubletAI } from "@kublet/sdk";

const interviewer = new KubletAI({
  apiKey: process.env.KUBLET_API_KEY,
  role: "Senior Software Engineer"
});

export const startMockInterview = async (candidate) => {
  const session = await interviewer.initiate({
    candidateId: candidate.id,
    domain: "Frontend Architecture",
    difficulty: "Advanced"
  });

  interviewer.on("questionGenerated", (question) => {
    console.log("AI Co-pilot:", question.text);
    // e.g. "Design a real-time notification system."
  });

  const feedback = await session.complete({
    generateReport: true,
    assessments: ["System Design", "Communication", "Code Quality"]
  });

  return {
    score: feedback.overallScore,
    strengths: feedback.highlights,
    videoUrl: session.playbackUrl
  };
};`
      }
    >
      <CodeHeader icon={Code2} copyButton>
        mock-interview.ts
      </CodeHeader>

      <CodeBlock
        cursor={cursor}
        lang="jsx"
        writing={writing}
        duration={duration}
        delay={delay}
      />
    </Code>
  );
};