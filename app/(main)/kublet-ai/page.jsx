import React from "react";
import PageHeader from "@/components/reusables";
import ResumeUpload from "./_components/ResumeUpload";
import { getCurrentUser } from "@/actions/user";
import { redirect } from "next/navigation";

const KubletAiPage = async () => {
  const dbUser = await getCurrentUser();
  if (!dbUser) redirect("/");

  if (dbUser.role === "INTERVIEWER") {
    redirect("/dashboard");
  }

  return (
    <main className="w-full min-h-screen bg-black">
      <PageHeader
        label="Kublet AI"
        gray="Kublet"
        gold="AI"
        description="AI-powered adaptive mock interviews"
      />

      <div className="max-w-6xl mx-auto px-8 xl:px-0 py-16 flex flex-col items-center justify-center">
        <ResumeUpload />
      </div>
    </main>
  );
};

export default KubletAiPage;
