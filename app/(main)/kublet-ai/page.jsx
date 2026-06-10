import React from "react";
import PageHeader from "@/components/reusables";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Upload } from "lucide-react";
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
        <Card className="w-full max-w-2xl bg-[#0f0f11] border border-white/10 p-8 text-center relative overflow-hidden group hover:border-amber-400/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none transition-transform duration-500 group-hover:scale-110" />
          
          <CardHeader className="flex flex-col items-center gap-4 pb-2">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mb-2 relative group-hover:scale-105 transition-transform duration-300">
              <Upload size={28} className="relative z-10" />
              <Sparkles size={16} className="absolute -top-1 -right-1 text-amber-300 animate-pulse" />
            </div>
            <CardTitle className="text-xl md:text-2xl font-serif font-semibold text-stone-100">
              Resume Upload Coming Next
            </CardTitle>
            <CardDescription className="text-sm text-stone-400 max-w-md mx-auto">
              We are building an intelligent system that analyzes your resume to tailor and generate highly custom, adaptive mock interview questions.
            </CardDescription>
          </CardHeader>

          <CardContent className="mt-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-stone-300 text-xs font-medium uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Feature In Development
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default KubletAiPage;
