"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { CATEGORY_LABEL } from "@/lib/data";
import { generateInterviewQuestions } from "@/actions/aiQuestions";
import useFetch from "@/hooks/use-fetch";

import React from "react";

const AIQuestionsPanel = ({ categories }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const {
    data,
    loading,
    error,
    fn: generateFn,
  } = useFetch(generateInterviewQuestions);

  const questions = data?.questions ?? [];

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      {/* category buttons */}
      {categories ? (
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                generateFn({ category: cat });
              }}
              type="button"
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                selectedCategory === cat
                  ? "border-amber-400/40 text-amber-400 bg-amber-400/10"
                  : "border-white/10 text-stone-500 hover:text-stone-300"
              }`}
            >
              {CATEGORY_LABEL[cat] ?? cat}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-10">
          <Loader2 size={18} className="text-stone-600 animate-spin" />
        </div>
      )}

      <Button
        variant="gold" 
        size="sm"
        disabled={loading || !selectedCategory}
        onClick={() => generateFn({ category: selectedCategory })}
        className="self-start gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={13} className="animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Sparkles size={13} />
            Generate questions
          </>
        )}
      </Button>
      {error && (
        <p className="text-xs text-red-400">{error?.message || error}</p>
      )}

      {/* Questions list */}
      {questions.length > 0 ? (
        <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1">
          {questions.map((q, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/8 bg-[#141417] p-4 flex flex-col gap-2"
            >
              <p className="text-sm text-stone-200 font-medium leading-snug">
                {i + 1}. {q.question}
              </p>
              <div className="h-px bg-white/5" />
              <p className="text-xs text-stone-500 font-light leading-relaxed">
                <span className="text-amber-400/70 font-medium">Answer: </span>
                {q.answer}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex  flex-col items-center justify-center gap-2 h-full">
          <span className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
            <Sparkles size={16} className="text-amber-400" />
          </span>
          <p className="text-xs text-center text-stone-600">
            Select a category and generate role-specific questions for this
            session.
          </p>
        </div>
      )}
    </div>
  );
};

export default AIQuestionsPanel;
