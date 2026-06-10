"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
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
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
            Upload your professional resume in PDF format (max {MAX_FILE_SIZE_MB}MB) to customize your adaptive mock interview.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6">
          {/* File Input (Hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
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
                  className="p-1.5 rounded-lg border border-white/5 bg-white/5 text-stone-400 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Upload Success Alert */}
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium justify-center py-1">
                <CheckCircle2 size={14} className="shrink-0" />
                Resume uploaded successfully! Ready for analysis.
              </div>
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
          <div className="w-full pt-2">
            <Button
              disabled
              variant="gold"
              className="w-full py-6 text-sm font-medium flex items-center justify-center gap-2 opacity-60 cursor-not-allowed select-none bg-amber-400 hover:bg-amber-400 text-black border-none"
            >
              <Sparkles size={16} />
              Coming in Next Feature
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
