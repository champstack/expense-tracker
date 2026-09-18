"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardsProps {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  prevIncome?: number;
  prevExpense?: number;
}

function PctBadge({ current, prev, inverse = false }: { current: number; prev?: number; inverse?: boolean }) {
  if (!prev || prev === 0) return null;
  const pct = Math.round(((current - prev) / prev) * 100);
  if (pct === 0) return null;
  const isGood = inverse ? pct < 0 : pct > 0;
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold bg-black/20 text-white/90 rounded-full px-2 py-0.5 mt-1">
      {pct > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {pct > 0 ? `+${pct}%` : `${pct}%`}
    </span>
  );
}

export function StatCards({ totalIncome, totalExpense, netBalance, prevIncome, prevExpense }: StatCardsProps) {
  const isPositive = netBalance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* รายรับรวม — Green */}
      <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-transform"
        style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-100 uppercase tracking-widest mb-1">รายรับรวม</p>
            <h3 className="text-3xl font-bold tabular-nums leading-tight">
              {formatCurrency(totalIncome)}
            </h3>
            <PctBadge current={totalIncome} prev={prevIncome} />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <ArrowUpRight className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* รายจ่ายรวม — Pink/Rose */}
      <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg shadow-pink-500/20 hover:-translate-y-0.5 transition-transform"
        style={{ background: "linear-gradient(135deg, #F43F5E 0%, #E11D48 50%, #C026D3 100%)" }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-rose-100 uppercase tracking-widest mb-1">รายจ่ายรวม</p>
            <h3 className="text-3xl font-bold tabular-nums leading-tight">
              {formatCurrency(totalExpense)}
            </h3>
            <PctBadge current={totalExpense} prev={prevExpense} inverse />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <ArrowDownLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* คงเหลือสุทธิ — Indigo/Purple */}
      <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 transition-transform"
        style={{ background: isPositive ? "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" : "linear-gradient(135deg, #F43F5E 0%, #9F1239 100%)" }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-indigo-100 uppercase tracking-widest mb-1">คงเหลือสุทธิ</p>
            <h3 className="text-3xl font-bold tabular-nums leading-tight">
              {formatCurrency(netBalance)}
            </h3>
            {totalIncome > 0 && (
              <span className="text-[11px] text-white/70 mt-1 block">
                ใช้ไป {Math.round((totalExpense / totalIncome) * 100)}% ของรายรับ
              </span>
            )}
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
      </div>
    </div>
  );
}
