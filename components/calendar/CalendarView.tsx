"use client";

import React, { useState } from "react";
import { Transaction, Category } from "@/types/database";
import { formatCurrency, THAI_DAYS_SHORT } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

interface CalendarViewProps {
  currentDate: Date;
  onDateChange: (newDate: Date) => void;
  transactions: Transaction[];
  categories: Category[];
  onAddTransactionForDate: (dateString: string) => void;
  onDeleteTransaction: (id: string) => void;
}

export function CalendarView({
  currentDate,
  onDateChange,
  transactions,
  onAddTransactionForDate,
  onDeleteTransaction,
}: CalendarViewProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // จัดกลุ่มข้อมูลตามวัน
  const dayDataMap = new Map<number, { income: number; expense: number; items: Transaction[] }>();
  transactions.forEach((tx) => {
    if (!tx.transaction_date) return;
    const [txYear, txMonth, txDay] = tx.transaction_date.split("-").map(Number);
    if (txYear === year && txMonth - 1 === month) {
      const cur = dayDataMap.get(txDay) || { income: 0, expense: 0, items: [] };
      if (tx.type === "income") cur.income += Number(tx.amount);
      else cur.expense += Number(tx.amount);
      cur.items.push(tx);
      dayDataMap.set(txDay, cur);
    }
  });

  const formatShortAmount = (amount: number): string => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}k`;
    return amount.toString();
  };

  const realToday = new Date();
  const isCurrentMonthToday = realToday.getFullYear() === year && realToday.getMonth() === month;
  const todayDateNum = realToday.getDate();

  const selectedDayItems = selectedDay ? dayDataMap.get(selectedDay)?.items || [] : [];
  const selectedDaySummary = selectedDay ? dayDataMap.get(selectedDay) : null;
  const selectedDateString = selectedDay
    ? `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : "";

  const monthLabel = new Intl.DateTimeFormat("th-TH", {
    month: "long",
    year: "numeric",
  }).format(currentDate);

  return (
    <div className="flex flex-col gap-0 w-full h-full">
      {/* ─── Month Navigation ─── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => { onDateChange(new Date(year, month - 1, 1)); setSelectedDay(null); }}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 text-sm font-bold text-slate-800 min-w-[140px] text-center">
            {monthLabel}
          </span>
          <button
            onClick={() => { onDateChange(new Date(year, month + 1, 1)); setSelectedDay(null); }}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> รายรับ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> รายจ่าย
          </span>
        </div>
      </div>

      {/* ─── Main Calendar Card ─── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-slate-100">
          {THAI_DAYS_SHORT.map((dayName, idx) => (
            <div
              key={dayName}
              className={`py-2.5 text-center text-xs font-bold tracking-wide ${
                idx === 0 ? "text-rose-500" : "text-slate-500"
              }`}
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar Grid — fills remaining space */}
        <div className="grid grid-cols-7 flex-1" style={{ gridAutoRows: "1fr" }}>
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="border-b border-r border-slate-50 bg-slate-50/40" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayInfo = dayDataMap.get(dayNum);
            const isToday = isCurrentMonthToday && todayDateNum === dayNum;
            const isSelected = selectedDay === dayNum;
            const hasData = dayInfo && (dayInfo.income > 0 || dayInfo.expense > 0);
            // last row cells don't need bottom border
            const colIndex = (firstDayIndex + i) % 7;
            const isLastCol = colIndex === 6;

            return (
              <button
                key={`day-${dayNum}`}
                onClick={() => setSelectedDay(isSelected ? null : dayNum)}
                className={`relative p-2 text-left transition-all flex flex-col border-b border-r ${
                  isLastCol ? "border-r-0" : ""
                } ${
                  isSelected
                    ? "bg-indigo-50 border-indigo-200"
                    : isToday
                    ? "bg-blue-50/60"
                    : hasData
                    ? "hover:bg-slate-50"
                    : "hover:bg-slate-50/60"
                } border-slate-100`}
              >
                {/* Date number */}
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold mb-1 ${
                    isToday
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-400/30"
                      : isSelected
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-slate-700"
                  }`}
                >
                  {dayNum}
                </span>

                {/* Amounts */}
                {hasData && (
                  <div className="space-y-0.5 w-full">
                    {dayInfo!.income > 0 && (
                      <div className="text-[11px] font-semibold text-emerald-600 leading-tight truncate">
                        +{formatShortAmount(dayInfo!.income)}
                      </div>
                    )}
                    {dayInfo!.expense > 0 && (
                      <div className="text-[11px] font-semibold text-rose-500 leading-tight truncate">
                        -{formatShortAmount(dayInfo!.expense)}
                      </div>
                    )}
                  </div>
                )}

                {/* Dot indicator (mobile) */}
                {hasData && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-400 sm:hidden" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Selected Day Detail Panel ─── */}
      {selectedDay && (
        <div className="mt-4 bg-white rounded-2xl border border-indigo-100 shadow-sm p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">
                วันที่ {selectedDay} {monthLabel}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                รับ:{" "}
                <span className="text-emerald-600 font-semibold">
                  {formatCurrency(selectedDaySummary?.income || 0)}
                </span>{" "}
                · จ่าย:{" "}
                <span className="text-rose-500 font-semibold">
                  {formatCurrency(selectedDaySummary?.expense || 0)}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto">
            {selectedDayItems.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">ไม่มีรายการในวันนี้</p>
            ) : (
              selectedDayItems.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="p-1.5 rounded-lg text-white flex-shrink-0"
                      style={{ backgroundColor: tx.category?.color || "#64748B" }}
                    >
                      <CategoryIcon name={tx.category?.icon || "CircleDot"} size={14} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">{tx.category?.name || "ทั่วไป"}</p>
                      {tx.note && <p className="text-slate-400 text-[11px] truncate max-w-[180px]">{tx.note}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold tabular-nums ${tx.type === "income" ? "text-emerald-600" : "text-rose-500"}`}>
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(Number(tx.amount))}
                    </span>
                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
