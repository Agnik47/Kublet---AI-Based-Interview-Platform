/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { GrayTitle } from "@/components/reusables";
import { setAvailability } from "@/actions/dashboard";
import useFetch from "@/hooks/use-fetch";
import { Clock } from "lucide-react";

const formatTimeLabel = (value) => {
  if (!value) return "";
  const [hour, minute] = value.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = ((hour + 11) % 12) + 1;
  return `${displayHour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")} ${period}`;
};

const TIME_SLOTS = Array.from({ length: 48 }, (_, index) => {
  const hour = Math.floor(index / 2);
  const minute = (index % 2) * 30;
  const value = `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
  return {
    value,
    label: formatTimeLabel(value),
  };
});

const getMinimumEndTime = (start) => {
  if (!start) return null;
  const [hour, minute] = start.split(":").map(Number);
  const totalMinutes = hour * 60 + minute + 45;
  const endHour = Math.floor(totalMinutes / 60);
  const endMinute = totalMinutes % 60;
  if (endHour > 23) return null;
  return `${endHour.toString().padStart(2, "0")}:${endMinute
    .toString()
    .padStart(2, "0")}`;
};

export default function AvailabilitySection({ initial }) {
  const [startTime, setStartTime] = useState(
    initial?.startTime
      ? new Date(initial.startTime).toTimeString().slice(0, 5)
      : "",
  );
  const [endTime, setEndTime] = useState(
    initial?.endTime
      ? new Date(initial.endTime).toTimeString().slice(0, 5)
      : "",
  );
  const [saved, setSaved] = useState(false);
  const endTimeRef = useRef(null);

  const { data, loading, error, fn: saveFn } = useFetch(setAvailability);

  useEffect(() => {
    if (data?.success) {
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(t);
    }
  }, [data]);

  const toISO = (time) => {
    const [h, m] = time.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };

  const handleStartTimeSelect = (slotValue) => {
    setStartTime(slotValue);
    const minEnd = getMinimumEndTime(slotValue);
    if (minEnd && endTime && endTime < minEnd) {
      setEndTime(minEnd);
    }
    if (endTimeRef.current) {
      endTimeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleSave = () => {
    if (!startTime || !endTime) return;
    saveFn({ startTime: toISO(startTime), endTime: toISO(endTime) });
  };

  const hasWindow = startTime && endTime;
  const duration = hasWindow
    ? (() => {
        const [sh, sm] = startTime.split(":").map(Number);
        const [eh, em] = endTime.split(":").map(Number);
        const diff = eh * 60 + em - (sh * 60 + sm);
        if (diff <= 0) return null;
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`;
      })()
    : null;
  const minEndTime = startTime ? getMinimumEndTime(startTime) : null;

  return (
    <section className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8 grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col gap-7">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-lg mb-4">
              <Clock size={18} className="text-amber-400" />
            </span>
            <h2 className="font-serif text-xl tracking-tight">
              <GrayTitle>Daily availability window</GrayTitle>
            </h2>
            <p className="text-xs text-stone-500 font-light mt-1">
              Interviewees can book within this window every day.
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

        <div className="grid gap-4">
          <div className="rounded-3xl border border-white/10 bg-[#141417] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
              Current window
            </p>
            {initial ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-[#0f0f11] border border-white/10 p-4">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                    Start
                  </p>
                  <p className="mt-2 text-lg text-stone-100">
                    {new Date(initial.startTime).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#0f0f11] border border-white/10 p-4">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                    End
                  </p>
                  <p className="mt-2 text-lg text-stone-100">
                    {new Date(initial.endTime).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-stone-400">
                No availability window is set yet. Candidates cannot book you
                until you save a slot.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#141417] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
              What this does
            </p>
            <p className="mt-4 text-sm leading-6 text-stone-400">
              Your daily availability window is the time range that interviewees
              may book. Keep it updated to reflect your ideal working hours.
            </p>
            <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
              <p className="text-sm text-amber-200">Tip</p>
              <p className="mt-1 text-sm text-stone-300">
                Pick a window with at least 2 hours so candidates can choose a
                slot comfortably.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#141417] p-5 flex flex-col gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            Choose time slots
          </p>
          <p className="mt-2 text-sm text-stone-400">
            Tap the start and end time to define your daily booking window.
          </p>
        </div>

        <div className="grid gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500 mb-3">
              Start time
            </p>
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
              {TIME_SLOTS.map((slot) => {
                const active = slot.value === startTime;
                return (
                  <button
                    key={slot.value}
                    type="button"
                    onClick={() => handleStartTimeSelect(slot.value)}
                    className={`rounded-2xl border px-3 py-2 text-xs text-left transition-colors duration-200 ${
                      active
                        ? "border-amber-400/60 bg-amber-400/10 text-amber-100"
                        : "border-white/10 bg-[#0f0f11] text-stone-300 hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div ref={endTimeRef}>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500 mb-3">
              End time
            </p>
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
              {TIME_SLOTS.map((slot) => {
                const active = slot.value === endTime;
                const disabled =
                  startTime && minEndTime ? slot.value < minEndTime : false;
                return (
                  <button
                    key={slot.value}
                    type="button"
                    disabled={disabled}
                    onClick={() => setEndTime(slot.value)}
                    className={`rounded-2xl border px-3 py-2 text-xs text-left transition-colors duration-200 ${
                      active
                        ? "border-amber-400/60 bg-amber-400/10 text-amber-100"
                        : disabled
                          ? "border-white/10 bg-[#0f0f11] text-stone-600 cursor-not-allowed opacity-60"
                          : "border-white/10 bg-[#0f0f11] text-stone-300 hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {duration && (
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="outline"
                className="border-amber-400/20 bg-amber-400/5 text-amber-400"
              >
                {duration} window
              </Badge>
              <span className="text-xs text-stone-600">
                Interviewees see this as your open booking range.
              </span>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-400">{error?.message || error}</p>
          )}

          <Button
            variant="gold"
            disabled={!hasWindow || loading}
            onClick={handleSave}
            className="w-full"
          >
            {loading
              ? "Saving…"
              : saved
                ? "✓ Saved"
                : initial
                  ? "Update window"
                  : "Set availability"}
          </Button>
        </div>
      </div>
    </section>
  );
}
