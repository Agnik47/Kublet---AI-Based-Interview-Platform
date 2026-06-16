"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Sparkles,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Brain,
  GraduationCap,
  Award,
  Briefcase,
  User,
  Clock,
  Target
} from "lucide-react";
import { analyzeResume } from "@/actions/resume";
import { generateInterviewBlueprint } from "@/actions/interviewBlueprint";
import { startBolnaSession } from "@/actions/bolna";
import { useRouter } from "next/navigation";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [blueprint, setBlueprint] = useState(null);
  const [isStartingInterview, setIsStartingInterview] = useState(false);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const handleStartInterview = async () => {
    if (!blueprint || isStartingInterview) return;

    setIsStartingInterview(true);
    setError(null);

    try {
      const sessionConfig = await startBolnaSession(profile, blueprint);
      
      // Save configuration to localStorage
      localStorage.setItem("bolnaSessionConfig", JSON.stringify(sessionConfig));
      
      // Redirect to the interview page
      router.push("/kublet-ai/interview");
    } catch (err) {
      console.error("Failed to start Bolna session:", err);
      setError(err.message || "Failed to start the AI Voice Interview. Please check your connection.");
    } finally {
      setIsStartingInterview(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const validateAndSetFile = (selectedFile) => {
    setError(null);
    setExtractedText("");
    setIsPreviewOpen(false);
    setProfile(null);
    setBlueprint(null);

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please select a PDF file only.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setFile(selectedFile);
  };

  const handleDrag = (e) => {
    if (isLoading || isAnalyzing || isGeneratingBlueprint) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    if (isLoading || isAnalyzing || isGeneratingBlueprint) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (isLoading || isAnalyzing || isGeneratingBlueprint) return;
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    if (isLoading || isAnalyzing || isGeneratingBlueprint) return;
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    if (isLoading || isAnalyzing || isGeneratingBlueprint) return;
    setFile(null);
    setError(null);
    setExtractedText("");
    setIsPreviewOpen(false);
    setProfile(null);
    setBlueprint(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleExtractText = async () => {
    if (!file || isLoading || isAnalyzing || isGeneratingBlueprint) return;

    setIsLoading(true);
    setError(null);
    setExtractedText("");
    setIsPreviewOpen(false);
    setProfile(null);
    setBlueprint(null);

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Dynamically load local pdfjs-dist
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      // Load PDF document
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      let text = "";

      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        text += pageText + "\n";
      }

      const trimmedText = text.trim();

      if (trimmedText.length === 0) {
        setError("Empty extraction. We couldn't find any selectable text in the PDF. Please check if it's a scanned file or image.");
      } else {
        setExtractedText(trimmedText);
        setIsPreviewOpen(true); // Open the preview on success
      }
    } catch (err) {
      console.error("PDF Parsing Error:", err);
      if (err.name === "InvalidPDFException" || err.message?.includes("Invalid PDF")) {
        setError("Invalid PDF format. The file is corrupt or is not a valid PDF document.");
      } else {
        setError("Parsing failure. An unexpected error occurred while extracting the text.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIAnalysis = async () => {
    if (!extractedText || isAnalyzing || isGeneratingBlueprint) return;

    setIsAnalyzing(true);
    setError(null);
    setProfile(null);
    setBlueprint(null);

    try {
      const result = await analyzeResume(extractedText);
      setProfile(result);
    } catch (err) {
      console.error("Analysis Error:", err);
      setError(err.message || "Failed to analyze the resume using Gemini. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateBlueprint = async () => {
    if (!profile || isGeneratingBlueprint) return;

    setIsGeneratingBlueprint(true);
    setError(null);
    setBlueprint(null);

    try {
      const result = await generateInterviewBlueprint(profile);
      setBlueprint(result);
    } catch (err) {
      console.error("Blueprint Error:", err);
      setError(err.message || "Failed to generate interview blueprint. Please try again.");
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-0 space-y-8 pb-12">
      <Card className="bg-[#0f0f11] border border-white/10 p-8 text-center relative overflow-hidden group hover:border-amber-400/20 transition-all duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none transition-transform duration-500 group-hover:scale-110" />

        <CardHeader className="flex flex-col items-center gap-2 pb-6">
          <CardTitle className="text-xl md:text-2xl font-serif font-semibold text-stone-100 flex items-center gap-2">
            Upload Your Resume
          </CardTitle>
          <CardDescription className="text-sm text-stone-400 max-w-md mx-auto">
            Upload your professional resume in PDF format (max {MAX_FILE_SIZE_MB}MB) to extract text and prepare your mock interview.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6">
          {/* File Input (Hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={isLoading || isAnalyzing || isGeneratingBlueprint}
            className="hidden"
          />

          {!file ? (
            /* Drag and Drop Zone */
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={handleButtonClick}
              className={`w-full py-10 px-6 rounded-2xl border border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center gap-4 ${
                isDragActive
                  ? "border-amber-400 bg-amber-400/5 scale-[0.99]"
                  : "border-white/10 hover:border-white/20 bg-white/2"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-stone-400 group-hover:text-amber-400 transition-colors duration-300">
                <Upload size={20} className={isDragActive ? "animate-bounce" : ""} />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-stone-200">
                  Drag & drop your resume here, or <span className="text-amber-400">browse</span>
                </p>
                <p className="text-xs text-stone-500">Supports PDF files up to {MAX_FILE_SIZE_MB}MB</p>
              </div>
            </div>
          ) : (
            /* Selected File State */
            <div className="w-full flex flex-col gap-4">
              <div className="w-full p-4 rounded-xl border border-amber-400/20 bg-amber-400/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-medium text-stone-200 truncate">{file.name}</p>
                    <p className="text-xs text-stone-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  type="button"
                  disabled={isLoading || isAnalyzing || isGeneratingBlueprint}
                  className="p-1.5 rounded-lg border border-white/5 bg-white/5 text-stone-400 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Upload Success Alert */}
              {!extractedText && !error && (
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium justify-center py-1">
                  <CheckCircle2 size={14} className="shrink-0" />
                  Resume selected successfully! Ready to extract.
                </div>
              )}
            </div>
          )}

          {/* Validation Error Alert */}
          {error && (
            <div className="w-full flex items-center gap-2 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 text-xs text-left">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Extract Button */}
          {file && !extractedText && (
            <div className="w-full pt-2">
              <Button
                onClick={handleExtractText}
                disabled={isLoading}
                variant="gold"
                className="w-full py-6 text-sm font-medium flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-black border-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Extracting Text...
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    Extract Resume Text
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Collapsible Preview Section */}
          {extractedText && (
            <div className="w-full mt-2 border border-emerald-500/20 bg-emerald-500/5 rounded-xl overflow-hidden text-left transition-all duration-300">
              {/* Header Toggle */}
              <button
                onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                type="button"
                className="w-full flex items-center justify-between p-4 hover:bg-emerald-500/10 transition-colors duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm">
                  <CheckCircle2 size={16} />
                  <span>Resume Extracted Successfully</span>
                </div>
                <span className="text-xs text-stone-400 font-mono">
                  {isPreviewOpen ? "Hide Preview ▲" : "Show Preview ▼"}
                </span>
              </button>

              {/* Collapsible Content */}
              {isPreviewOpen && (
                <div className="p-4 border-t border-emerald-500/10 font-mono text-xs text-stone-300 bg-black/40">
                  <p className="text-stone-500 mb-2 font-sans text-xs">
                    PREVIEW (First {Math.min(extractedText.length, 1200)} characters):
                  </p>
                  <div className="whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed hide-scrollbar select-text selection:bg-amber-400/20">
                    {extractedText.substring(0, 1200)}
                    {extractedText.length > 1200 && "..."}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Analysis Button */}
          {extractedText && !profile && (
            <div className="w-full pt-4 border-t border-white/5">
              <Button
                onClick={handleAIAnalysis}
                disabled={isAnalyzing}
                variant="gold"
                className="w-full py-6 text-sm font-medium flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-black border-none"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Analyzing Resume with Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Analyze Resume
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Candidate Profile UI */}
      {profile && (
        <section className="w-full bg-[#0f0f11] border border-emerald-500/20 rounded-2xl p-6 md:p-8 space-y-8 animate-fade-in text-left relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Header Section */}
          <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <User size={20} />
                </span>
                <h2 className="text-2xl md:text-3xl font-serif font-semibold text-stone-100">
                  {profile.candidateName}
                </h2>
              </div>
              <p className="text-sm text-stone-300 leading-relaxed font-light">
                {profile.professionalSummary}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-400/20 bg-amber-400/5 text-amber-400">
              <Clock size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {profile.yearsExperience} {parseInt(profile.yearsExperience) === 1 ? "Year" : "Years"} Exp
              </span>
            </div>
          </header>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Technical Skills */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-2">
                <Brain size={16} className="text-emerald-400" />
                Technical Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.technicalSkills.length > 0 ? (
                  profile.technicalSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-emerald-400/5 border border-emerald-500/20 text-emerald-300 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-stone-500">None extracted</span>
                )}
              </div>
            </div>

            {/* Soft Skills */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-2">
                <User size={16} className="text-amber-400" />
                Soft Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.softSkills.length > 0 ? (
                  profile.softSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-stone-500/10 border border-white/10 text-stone-300 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-stone-500">None extracted</span>
                )}
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="space-y-4 border-t border-white/5 pt-6">
            <h3 className="text-sm font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-2">
              <Briefcase size={16} className="text-emerald-400" />
              Key Projects
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.projects.length > 0 ? (
                profile.projects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-white/5 bg-white/2 hover:border-emerald-500/20 transition-all duration-300"
                  >
                    <h4 className="text-sm font-semibold text-stone-200">{proj.title}</h4>
                    <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                      {proj.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-xs text-stone-500">No projects listed</div>
              )}
            </div>
          </div>

          {/* Education & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-6">
            {/* Education */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap size={16} className="text-emerald-400" />
                Education
              </h3>
              <div className="space-y-3">
                {profile.education.length > 0 ? (
                  profile.education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-0.5 border-l-2 border-emerald-500/30 pl-4 py-1"
                    >
                      <h4 className="text-sm font-semibold text-stone-200">{edu.degree}</h4>
                      <p className="text-xs text-stone-400">
                        {edu.institution} {edu.year ? `• ${edu.year}` : ""}
                      </p>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-stone-500">No education history listed</span>
                )}
              </div>
            </div>

            {/* Certifications */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-2">
                <Award size={16} className="text-amber-400" />
                Certifications
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.certifications.length > 0 ? (
                  profile.certifications.map((cert, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md border border-white/5 bg-white/5 text-stone-300 text-xs font-mono"
                    >
                      {cert}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-stone-500">No certifications listed</span>
                )}
              </div>
            </div>
          </div>

          {/* Insights (Strengths & Interview Focus) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-6 pb-6">
            {/* Strengths */}
            <div className="space-y-3 p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/2">
              <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={16} />
                Key Strengths
              </h3>
              <ul className="space-y-2">
                {profile.strengths.length > 0 ? (
                  profile.strengths.map((str, idx) => (
                    <li key={idx} className="text-xs text-stone-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{str}</span>
                    </li>
                  ))
                ) : (
                  <span className="text-xs text-stone-500">No distinct strengths identified</span>
                )}
              </ul>
            </div>

            {/* Focus Areas */}
            <div className="space-y-3 p-4 rounded-xl border border-amber-500/10 bg-amber-500/2">
              <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Target size={16} />
                Interview Focus Areas
              </h3>
              <ul className="space-y-2">
                {profile.interviewFocusAreas.length > 0 ? (
                  profile.interviewFocusAreas.map((area, idx) => (
                    <li key={idx} className="text-xs text-stone-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{area}</span>
                    </li>
                  ))
                ) : (
                  <span className="text-xs text-stone-500 font-light">No distinct focus areas identified</span>
                )}
              </ul>
            </div>
          </div>

          {/* Action to Generate Blueprint */}
          {!blueprint && (
            <div className="pt-6 border-t border-white/10 flex justify-center">
              <Button
                onClick={handleGenerateBlueprint}
                disabled={isGeneratingBlueprint}
                variant="gold"
                className="w-full py-6 text-sm font-medium flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-black border-none"
              >
                {isGeneratingBlueprint ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating Interview Blueprint...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Interview Blueprint
                  </>
                )}
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Interview Blueprint UI */}
      {blueprint && (
        <section className="w-full bg-[#0f0f11] border border-amber-400/20 rounded-2xl p-6 md:p-8 space-y-8 animate-fade-in text-left relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  <Sparkles size={20} />
                </span>
                <h2 className="text-2xl md:text-3xl font-serif font-semibold text-stone-100">
                  Interview Blueprint
                </h2>
              </div>
              <p className="text-sm text-stone-400 font-light">
                Tailored interview preparation outline generated dynamically by AI for target screening.
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-2 shrink-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-400/20 bg-amber-400/5 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                Role: {blueprint.targetRole}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-stone-300 text-xs font-semibold uppercase tracking-wider">
                Level: {blueprint.candidateLevel}
              </div>
            </div>
          </header>

          {/* Section: Focus Areas */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Target size={16} />
              Evaluation Focus Areas
            </h3>
            <div className="flex flex-wrap gap-2">
              {blueprint.focusAreas.length > 0 ? (
                blueprint.focusAreas.map((area, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-medium"
                  >
                    {area}
                  </span>
                ))
              ) : (
                <span className="text-xs text-stone-500">None identified</span>
              )}
            </div>
          </div>

          {/* Introductory Questions */}
          <div className="space-y-4 border-t border-white/5 pt-6">
            <h3 className="text-sm font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-2">
              <User size={16} className="text-emerald-400" />
              Introductory / Fit Questions
            </h3>
            <ul className="space-y-3">
              {blueprint.introQuestions.length > 0 ? (
                blueprint.introQuestions.map((q, idx) => (
                  <li
                    key={idx}
                    className="p-4 rounded-xl border border-white/5 bg-white/2 text-sm text-stone-200 leading-relaxed font-light"
                  >
                    {q}
                  </li>
                ))
              ) : (
                <li className="text-xs text-stone-500 list-none">No questions generated</li>
              )}
            </ul>
          </div>

          {/* Project-Specific Questions */}
          <div className="space-y-4 border-t border-white/5 pt-6">
            <h3 className="text-sm font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-2">
              <Briefcase size={16} className="text-emerald-400" />
              Project Deep-Dive Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blueprint.projectQuestions.length > 0 ? (
                blueprint.projectQuestions.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-white/5 bg-white/2 space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Primary Question</span>
                      <p className="text-sm font-medium text-stone-200 mt-1">{item.question}</p>
                    </div>
                    {item.followUp && (
                      <div className="p-3 rounded-lg bg-black/40 border border-white/5 mt-2">
                        <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Follow-up Strategy</span>
                        <p className="text-xs text-stone-400 mt-1 leading-relaxed">{item.followUp}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-xs text-stone-500">No project deep-dive questions generated</div>
              )}
            </div>
          </div>

          {/* Technical Deep-Dive Questions */}
          <div className="space-y-4 border-t border-white/5 pt-6">
            <h3 className="text-sm font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-2">
              <Brain size={16} className="text-emerald-400" />
              Technical Competency Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blueprint.technicalQuestions.length > 0 ? (
                blueprint.technicalQuestions.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-white/5 bg-white/2 space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Technical Question</span>
                      <p className="text-sm font-medium text-stone-200 mt-1">{item.question}</p>
                    </div>
                    {item.followUp && (
                      <div className="p-3 rounded-lg bg-black/40 border border-white/5 mt-2">
                        <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Follow-up Strategy</span>
                        <p className="text-xs text-stone-400 mt-1 leading-relaxed">{item.followUp}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-xs text-stone-500">No technical competency questions generated</div>
              )}
            </div>
          </div>

          {/* Behavioral Questions */}
          <div className="space-y-4 border-t border-white/5 pt-6">
            <h3 className="text-sm font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-2">
              <User size={16} className="text-amber-400" />
              Behavioral & Situational Questions
            </h3>
            <ul className="space-y-3">
              {blueprint.behavioralQuestions.length > 0 ? (
                blueprint.behavioralQuestions.map((q, idx) => (
                  <li
                    key={idx}
                    className="p-4 rounded-xl border border-white/5 bg-white/2 text-sm text-stone-200 leading-relaxed font-light"
                  >
                    {q}
                  </li>
                ))
              ) : (
                <li className="text-xs text-stone-500 list-none font-light">No behavioral questions generated</li>
              )}
            </ul>
          </div>

          {/* Start AI Interview Action */}
          <div className="pt-6 border-t border-white/10 flex flex-col items-center gap-3">
            <Button
              onClick={handleStartInterview}
              disabled={isStartingInterview}
              variant="gold"
              className="w-full py-6 text-sm font-medium flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-black border-none cursor-pointer"
            >
              {isStartingInterview ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Initiating AI Voice Interview...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Start AI Interview
                </>
              )}
            </Button>
            <p className="text-xs text-stone-500 text-center">
              Requires microphone access. You will be redirected to the secure voice call room.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
