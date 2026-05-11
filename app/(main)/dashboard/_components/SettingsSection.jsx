"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { GrayTitle } from "@/components/reusables";
import { updateProfile } from "@/actions/dashboard";
import useFetch from "@/hooks/use-fetch";
import { Settings, Check } from "lucide-react";
import { CATEGORIES, YEARS_OPTIONS } from "@/lib/data";

export default function SettingsSection({ initial }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    company: initial?.company || "",
    yearExp: initial?.yearExp || "",
    bio: initial?.bio || "",
    categories: initial?.categories || [],
  });
  const [saved, setSaved] = useState(false);

  const { data, loading, error, fn: saveFn } = useFetch(updateProfile);

  useEffect(() => {
    if (data?.success) {
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(t);
    }
  }, [data]);

  const toggleCategory = (val) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(val)
        ? prev.categories.filter((c) => c !== val)
        : [...prev.categories, val],
    }));
  };

  const handleSave = () => {
    if (
      !form.title.trim() ||
      !form.company.trim() ||
      !form.bio.trim() ||
      !form.categories.length
    )
      return;
    saveFn(form);
  };

  const isValid =
    form.title.trim() &&
    form.company.trim() &&
    form.yearExp &&
    form.bio.trim() &&
    form.categories.length > 0;

  return (
    <section className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8 flex flex-col gap-7">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-lg mb-4">
            <Settings size={18} className="text-amber-400" />
          </span>
          <h2 className="font-serif text-xl tracking-tight">
            <GrayTitle>Profile settings</GrayTitle>
          </h2>
          <p className="text-xs text-stone-500 font-light mt-1">
            Update your interviewer profile information.
          </p>
        </div>

        {initial && (
          <Badge
            variant="outline"
            className="shrink-0 border-green-500/20 bg-green-500/10 text-green-400"
          >
            Active
          </Badge>
        )}
      </div>

      <div className="h-px bg-white/5" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label className="text-stone-400 text-xs">Title</Label>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g. Senior Software Engineer"
              className="mt-2 bg-[#141417] border-white/10"
            />
          </div>

          <div>
            <Label className="text-stone-400 text-xs">Company</Label>
            <Input
              value={form.company}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, company: e.target.value }))
              }
              placeholder="e.g. Google"
              className="mt-2 bg-[#141417] border-white/10"
            />
          </div>

          <div>
            <Label className="text-stone-400 text-xs">
              Years of Experience
            </Label>
            <select
              value={form.yearExp}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, yearExp: e.target.value }))
              }
              className="mt-2 w-full rounded-lg border border-white/10 bg-[#141417] px-3 py-2 text-sm text-stone-100 focus:border-amber-400/60 focus:outline-none"
            >
              <option value="">Select experience</option>
              {YEARS_OPTIONS.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-stone-400 text-xs">Bio</Label>
            <Textarea
              value={form.bio}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bio: e.target.value }))
              }
              placeholder="Tell us about yourself..."
              rows={4}
              className="mt-2 bg-[#141417] border-white/10 resize-none"
            />
          </div>

          <div>
            <Label className="text-stone-400 text-xs mb-3 block">
              Interview Categories
            </Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const active = form.categories.includes(cat.value);
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => toggleCategory(cat.value)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors duration-200 ${
                      active
                        ? "border-amber-400/60 bg-amber-400/10 text-amber-100"
                        : "border-white/10 bg-[#0f0f11] text-stone-300 hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400">{error?.message || error}</p>
      )}

      {/* Save */}
      <Button
        variant="gold"
        disabled={!isValid || loading}
        onClick={handleSave}
        className="self-start"
      >
        {loading ? "Saving…" : saved ? "✓ Saved" : "Update profile"}
      </Button>
    </section>
  );
}
