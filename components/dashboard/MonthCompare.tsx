"use client";

import React, { useMemo } from "react";
import { Transaction } from "@/types/database";
import { formatCurrency, formatThaiDate } from "@/lib/utils";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { TrendingUp, TrendingDown, Minus, Award, Calendar } from "lucide-react";

interface MonthCompareProps {
  currentTransactions: Transaction[];
  prevTransactions: Transaction[];
}

export function MonthCompare({ currentTransactions, prevTransactions }: MonthCompareProps) {
  const stats = useMemo(() => {
    const currentExpense = currentTransactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Number(t.amount), 0);
    const prevExpense = prevTransactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Number(t.amount), 0);

    const expensePct =
      prevExpense > 0 ? Math.round(((currentExpense - prevExpense) / prevExpense) * 100) : null;

    // หมวดหมู่ใช้เงินมากสุด
    const catMap = new Map<string, { name: string; color: string; icon: string; amount: number }>();
    currentTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const key = t.category_id;
        const cur = catMap.get(key) || {
          name: t.category?.name || "อื่นๆ",
          color: t.category?.color || "#64748B",
          icon: t.category?.icon || "CircleDot",
          amount: 0,
        };
        cur.amount += Number(t.amount);
        catMap.set(key, cur);
      });
    const topCategory = Array.from(catMap.values()).sort((a, b) => b.amount - a.amount)[0] || null;

    // วันที่ใช้เงินมากสุด
    const dayMap = new Map<string, number>();
    currentTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const day = t.transaction_date || "";
        dayMap.set(day, (dayMap.get(day) || 0) + Number(t.amount));
      });
    let topDay = { date: "", amount: 0 };
    dayMap.forEach((amount, date) => {
      if (amount > topDay.amount) topDay = { date, amount };
    });

    return { currentExpense, prevExpense, expensePct, topCategory, topDay };
  }, [currentTransactions, prevTransactions]);

  const { expensePct, topCategory, topDay } = stats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* % เปลี่ยนแปลง */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-4 flex flex-col items-center text-center shadow-sm">
        <div className="mb-2">
          {expensePct === null ? (
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto">
              <Minus className="w-5 h-5 text-slate-400" />
            </div>
          ) : expensePct > 0 ? (
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center mx-auto">
              <TrendingUp className="w-5 h-5 text-rose-500" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto">
              <TrendingDown className="w-5 h-5 text-emerald-600" />
            </div>
          )}
        </div>
        <div className={`text-2xl font-bold tabular-nums ${
          expensePct === null ? "text-slate-400" : expensePct > 0 ? "text-rose-500" : "text-emerald-600"
        }`}>
          {expensePct === null ? "—" : expensePct > 0 ? `+${expensePct}%` : `${expensePct}%`}
        </div>
        <p className="text-xs text-slate-500 mt-1">รายจ่ายเทียบเดือนที่แล้ว</p>
        {expensePct !== null && (
          <p className="text-[11px] text-slate-400 mt-0.5">
            {expensePct > 0 ? "เพิ่มขึ้น" : "ลดลง"} {formatCurrency(Math.abs(stats.currentExpense - stats.prevExpense))}
          </p>
        )}
      </div>

      {/* หมวดหมู่ใช้มากสุด */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-4 flex flex-col items-center text-center shadow-sm">
        <div className="mb-2">
          {topCategory ? (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto text-white"
              style={{ backgroundColor: topCategory.color }}>
              <CategoryIcon name={topCategory.icon} size={20} />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto">
              <Award className="w-5 h-5 text-slate-400" />
            </div>
          )}
        </div>
        <div className="text-sm font-bold text-slate-800 truncate max-w-[120px]">
          {topCategory ? topCategory.name : "—"}
        </div>
        <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
          {topCategory ? formatCurrency(topCategory.amount) : "—"}
        </div>
        <p className="text-xs text-slate-500 mt-1">หมวดใช้เงินมากสุด</p>
      </div>

      {/* วันที่ใช้เงินมากสุด */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-4 flex flex-col items-center text-center shadow-sm">
        <div className="mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto">
            <Calendar className="w-5 h-5 text-indigo-500" />
          </div>
        </div>
        <div className="text-sm font-bold text-slate-800">
          {topDay.date ? formatThaiDate(topDay.date, false) : "—"}
        </div>
        <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
          {topDay.amount > 0 ? formatCurrency(topDay.amount) : "—"}
        </div>
        <p className="text-xs text-slate-500 mt-1">วันที่ใช้เงินมากสุด</p>
      </div>
    </div>
  );
}
