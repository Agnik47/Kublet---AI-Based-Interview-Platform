"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, FileText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef(null);

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
    if (isLoading) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    if (isLoading) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (isLoading) return;
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    if (isLoading) return;
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    if (isLoading) return;
    setFile(null);
    setError(null);
    setExtractedText("");
    setIsPreviewOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!file || isLoading) return;

    setIsLoading(true);
    setError(null);
    setExtractedText("");
    setIsPreviewOpen(false);

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
      // Determine if error is an invalid PDF format error
      if (err.name === "InvalidPDFException" || err.message?.includes("Invalid PDF")) {
        setError("Invalid PDF format. The file is corrupt or is not a valid PDF document.");
      } else {
        setError("Parsing failure. An unexpected error occurred while extracting the text.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 md:px-0">
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
            disabled={isLoading}
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
                  disabled={isLoading}
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

          {/* Analyze Button */}
          {file && !extractedText && (
            <div className="w-full pt-2">
              <Button
                onClick={handleAnalyze}
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
                    <Sparkles size={16} />
                    Analyze Resume
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
        </CardContent>
      </Card>
    </div>
  );
}
