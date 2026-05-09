/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { GrayTitle } from "@/components/reusables";
import { requestWithdrawal } from "@/actions/dashboard";
import useFetch from "@/hooks/use-fetch";
import { CircleCheck, TrendingUp, Wallet } from "lucide-react";
import { formatDate } from "@/lib/helpers";

const PAYMENT_METHODS = [
  { value: "PAYPAL", label: "PayPal", placeholder: "your@paypal.com" },
  {
    value: "BANK",
    label: "Bank Transfer",
    placeholder: "Account / routing info",
  },
  { value: "UPI", label: "UPI", placeholder: "your@upi" },
];

const PLATFORM_FEE = 0.2;

export default function EarningsSection({ stats, history }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [method, setMethod] = useState("PAYPAL");
  const [detail, setDetail] = useState("");

  const { data, loading, error, fn: withdrawFn } = useFetch(requestWithdrawal);

  const balance = (stats?.creditBalance ?? 0) * 5;
  const totalEarnedDollars = (stats?.totalEarned ?? 0) * 5;
  const feeAmount = (balance * PLATFORM_FEE).toFixed(2);
  const netAmount = (balance * (1 - PLATFORM_FEE)).toFixed(2);
  const selectedMethod = PAYMENT_METHODS.find((m) => m.value === method);
  const isValid = detail.trim().length > 0;

  useEffect(() => {
    if (data?.success) {
      setDone(true);
      setTimeout(() => {
        setOpen(false);
        setTimeout(() => {
          setDone(false);
          setDetail("");
          setMethod("PAYPAL");
        }, 300);
      }, 2000);
    }
  }, [data]);

  const handleOpenChange = (val) => {
    if (!val && !loading) {
      setOpen(false);
      if (!done) {
        setDetail("");
        setMethod("PAYPAL");
      }
    }
  };

  return (
    <section className="flex flex-col gap-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Credit balance",
            value: stats?.creditBalance ?? 0,
            unit: "credits",
            gold: true,
            icon: <Wallet size={16} className="text-amber-400" />,
            dollarValue: balance,
          },
          {
            label: "Total earned",
            value: stats?.totalEarned ?? 0,
            unit: "credits",
            gold: false,
            icon: <TrendingUp size={16} className="text-stone-400" />,
            dollarValue: totalEarnedDollars,
          },
          {
            label: "Sessions done",
            value: stats?.completedSessions ?? 0,
            unit: "completed",
            gold: false,
            icon: <CircleCheck size={16} className="text-stone-400" />,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[#0f0f11] border border-white/10 rounded-2xl p-6 flex flex-col gap-2"
          >
            <span className="text-lg">{stat.icon}</span>
            <p
              className={`font-serif text-4xl leading-none tracking-tight ${
                stat.gold
                  ? "bg-linear-to-br from-amber-300 to-amber-500 bg-clip-text text-transparent"
                  : "bg-linear-to-br from-stone-100 to-stone-400 bg-clip-text text-transparent"
              }`}
            >
              {stat.value}
            </p>
            <p className="text-xs text-stone-600">{stat.unit}</p>

            <p className="text-xs text-stone-500">
              {stat.label}{" "}
              {stat.dollarValue !== undefined
                ? `($${stat?.dollarValue?.toFixed(2)})`
                : ""}
            </p>
          </div>
        ))}
      </div>

      {/* Withdrawal trigger card */}
      <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl tracking-tight">
            <GrayTitle>Withdraw earnings</GrayTitle>
          </h2>
          <p className="text-xs text-stone-500 font-light mt-1">
            20% platform fee applies. Processed within 2–3 business days.
          </p>
        </div>
        <Button
          variant="gold"
          disabled={balance <= 0}
          onClick={() => setOpen(true)}
          className="shrink-0"
        >
          Request withdrawal
        </Button>
      </div>

      {/* Withdrawal history */}
      <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-stone-500 tracking-widest uppercase">
              Withdrawal history
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Review your payouts and processing status.
            </p>
          </div>
          <Badge variant="outline" className="border-white/10 text-stone-400">
            {history?.length ?? 0} entries
          </Badge>
        </div>

        {history?.length > 0 ? (
          <div className="mt-6 flex flex-col gap-3">
            {history.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-3 rounded-3xl border border-white/8 bg-[#141417] p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm text-stone-100">
                    {p.credits} credits → ${p.netAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-stone-500">
                    {p.paymentMethod} · {formatDate(p.createdAt)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    p.status === "PROCESSED"
                      ? "border-green-500/20 bg-green-500/10 text-green-400"
                      : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                  }
                >
                  {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-white/10 bg-[#141417] p-8 text-center">
            <p className="text-sm text-stone-400">
              No withdrawal history yet. Request a payout once you have
              completed sessions.
            </p>
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="bg-[#0f0f11] border border-white/10 text-stone-100 max-w-md">
          {done ? (
            <div className="py-8 text-center flex flex-col items-center gap-4">
              <span className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-2xl">
                ✓
              </span>
              <p className="font-serif text-xl">
                <GrayTitle>Request submitted</GrayTitle>
              </p>
              <p className="text-xs text-stone-500 font-light">
                We&apos;ll process your withdrawal within 2–3 business days.
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl tracking-tight">
                  <GrayTitle>Request withdrawal</GrayTitle>
                </DialogTitle>
                <DialogDescription className="text-stone-500 text-xs font-light">
                  Your full balance of{" "}
                  <span className="text-amber-400">{balance} credits</span> will
                  be withdrawn.
                </DialogDescription>
              </DialogHeader>

              <Separator className="bg-white/5" />

              <div className="flex flex-col gap-5 py-2">
                {/* Fee breakdown */}
                <div className="rounded-xl bg-[#141417] border border-white/8 p-4 flex flex-col gap-2">
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>Balance (1 Cr = $5)</span>
                    <span className="text-green-400">${balance}</span>
                  </div>
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>Platform fee (20%)</span>
                    <span className="text-red-400">− ${feeAmount}</span>
                  </div>
                  <Separator className="bg-white/8 my-1" />
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-stone-300">You receive</span>
                    <span className="text-amber-400">${netAmount}</span>
                  </div>
                </div>

                {/* Payment method — Tabs */}
                <div className="flex flex-col gap-2">
                  <Label className="text-stone-400 text-xs">
                    Payment method
                  </Label>
                  <Tabs
                    value={method}
                    onValueChange={(val) => {
                      setMethod(val);
                      setDetail("");
                    }}
                  >
                    <TabsList className="bg-[#141417] border border-white/10 w-full">
                      {PAYMENT_METHODS.map((m) => (
                        <TabsTrigger
                          key={m.value}
                          value={m.value}
                          className="flex-1 text-xs"
                        >
                          {m.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                {/* Payment detail */}
                <div className="flex flex-col gap-2">
                  <Label className="text-stone-400 text-xs">
                    {selectedMethod?.label} details
                  </Label>
                  <Input
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    placeholder={selectedMethod?.placeholder}
                    className="bg-[#141417] border-white/10 text-stone-100"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-400">
                    {error?.message || error}
                  </p>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="gold"
                  disabled={!isValid || loading}
                  onClick={() =>
                    withdrawFn({
                      credits: stats?.creditBalance,
                      paymentMethod: method,
                      paymentDetail: detail,
                    })
                  }
                >
                  {loading ? "Submitting…" : "Confirm withdrawal"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
