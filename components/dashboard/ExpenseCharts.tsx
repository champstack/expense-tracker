"use client";

import React, { useState, useMemo } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Transaction } from "@/types/database";
import { formatCurrency, formatThaiDate } from "@/lib/utils";
import { PieChart as PieIcon, TrendingUp, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpenseChartsProps {
  transactions: Transaction[];
  allTransactions?: Transaction[];
  totalIncome: number;
  totalExpense: number;
  sixMonthData?: { month: string; income: number; expense: number }[];
  currentDate?: Date;
}

const CARD = "bg-white rounded-2xl border border-black/[0.06] shadow-sm p-4 sm:p-5 flex flex-col";

export function ExpenseCharts({
  transactions,
  allTransactions,
  totalIncome,
  totalExpense,
  sixMonthData,
  currentDate = new Date(),
}: ExpenseChartsProps) {
  // Toggle ระหว่าง "week" (สัปดาห์) กับ "month" (เดือน)
  const [period, setPeriod] = useState<"week" | "month">("month");
  // Active hovered category for interactive Donut Chart & Legend
  const [hoveredCategory, setHoveredCategory] = useState<{ name: string; value: number; color: string } | null>(null);

  // สัดส่วนรายจ่ายตามหมวดหมู่ (สำหรับ Donut Chart)
  const categoryData = useMemo(() => {
    const map = new Map<string, { name: string; value: number; color: string }>();
    transactions.filter((t) => t.type === "expense").forEach((tx) => {
      const key = tx.category?.name || "อื่นๆ";
      const existing = map.get(key) || { name: key, value: 0, color: tx.category?.color || "#64748B" };
      existing.value += Number(tx.amount);
      map.set(key, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  }, [transactions]);

  // คำนวณข้อมูล 7 วันในสัปดาห์ (Monday to Sunday)
  const weekData = useMemo(() => {
    const curr = new Date(currentDate);
    const dayOfWeek = curr.getDay(); // 0 is Sun, 1 is Mon...
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const monday = new Date(curr);
    monday.setDate(curr.getDate() + diffToMonday);

    const THAI_DAYS = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];
    const data = [];

    const txSource = allTransactions && allTransactions.length > 0 ? allTransactions : transactions;

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const dayTxs = txSource.filter((t) => t.transaction_date === dateStr);
      const inc = dayTxs
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const exp = dayTxs
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      data.push({
        label: `${THAI_DAYS[i]} ${d.getDate()}`,
        dayName: THAI_DAYS[i],
        dayNum: d.getDate(),
        fullDate: dateStr,
        income: inc,
        expense: exp,
      });
    }
    return data;
  }, [currentDate, allTransactions, transactions]);

  // สรุปยอดรวมสำหรับมุมมองสัปดาห์
  const weekTotalIncome = useMemo(() => weekData.reduce((s, d) => s + d.income, 0), [weekData]);
  const weekTotalExpense = useMemo(() => weekData.reduce((s, d) => s + d.expense, 0), [weekData]);

  // สรุปยอดรวมสำหรับมุมมอง 6 เดือน
  const monthTotalIncome = useMemo(
    () => (sixMonthData || []).reduce((s, d) => s + d.income, 0),
    [sixMonthData]
  );
  const monthTotalExpense = useMemo(
    () => (sixMonthData || []).reduce((s, d) => s + d.expense, 0),
    [sixMonthData]
  );

  // ข้อความช่วงสัปดาห์
  const weekRangeText = useMemo(() => {
    if (weekData.length === 0) return "";
    return `${formatThaiDate(weekData[0].fullDate, false)} - ${formatThaiDate(weekData[6].fullDate, false)}`;
  }, [weekData]);

  // ข้อมูลรายเดือนแบบ normalized
  const monthData = useMemo(() => {
    return (sixMonthData || []).map((m) => ({
      label: m.month,
      income: m.income,
      expense: m.expense,
    }));
  }, [sixMonthData]);

  const activeChartData = period === "week" ? weekData : monthData;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Donut Chart: สัดส่วนรายจ่าย */}
      <div className={CARD}>
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-500">
              <PieIcon className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">สัดส่วนรายจ่าย</h3>
          </div>
          <span className="text-xs text-slate-400">{categoryData.length} หมวดหมู่</span>
        </div>
        {categoryData.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-10">
            <PieIcon className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
            <p className="text-xs text-slate-400">ยังไม่มีข้อมูลรายจ่ายในเดือนนี้</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Donut Chart with Interactive Center */}
            <div className="relative w-44 h-44 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={(_, index) => setHoveredCategory(categoryData[index])}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    {categoryData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.color}
                        stroke={hoveredCategory?.name === entry.name ? "#ffffff" : "none"}
                        strokeWidth={hoveredCategory?.name === entry.name ? 2 : 0}
                        className="cursor-pointer transition-all duration-150"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={() => null} />
                </PieChart>
              </ResponsiveContainer>
              {/* Dynamic Center Text — changes on hover without overlapping tooltip */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2 text-center transition-all duration-150">
                {hoveredCategory ? (
                  <>
                    <span
                      className="text-[11px] font-semibold truncate max-w-[85px] leading-tight"
                      style={{ color: hoveredCategory.color }}
                    >
                      {hoveredCategory.name}
                    </span>
                    <span className="text-xs font-bold text-slate-900 tabular-nums mt-0.5">
                      {formatCurrency(hoveredCategory.value)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {totalExpense > 0 ? Math.round((hoveredCategory.value / totalExpense) * 100) : 0}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] text-slate-400 font-medium">รวมจ่าย</span>
                    <span className="text-xs font-bold text-slate-800 tabular-nums leading-tight">
                      {formatCurrency(totalExpense)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Category Breakdown List — expanded height to show all categories */}
            <div className="flex-1 w-full space-y-2.5 overflow-y-auto max-h-[300px] pr-1.5">
              {categoryData.map((cat, i) => {
                const pct = totalExpense > 0 ? Math.round((cat.value / totalExpense) * 100) : 0;
                const isHovered = hoveredCategory?.name === cat.name;
                return (
                  <div
                    key={i}
                    className={`text-xs rounded-lg p-1 -mx-1 transition-colors cursor-pointer ${
                      isHovered ? "bg-slate-50" : "hover:bg-slate-50/70"
                    }`}
                    onMouseEnter={() => setHoveredCategory(cat)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform"
                          style={{
                            backgroundColor: cat.color,
                            transform: isHovered ? "scale(1.2)" : "scale(1)",
                          }}
                        />
                        <span className={`font-medium truncate ${isHovered ? "text-slate-900 font-semibold" : "text-slate-700"}`}>
                          {cat.name}
                        </span>
                      </div>
                      <span className="text-slate-700 font-semibold tabular-nums flex-shrink-0">
                        {formatCurrency(cat.value)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Trend Area Chart: รองรับสลับ "สัปดาห์" และ "เดือน" */}
      <div className={CARD}>
        {/* Header แถวบน: ชื่อหัวข้อ + ปุ่มสลับ [สัปดาห์ | เดือน] */}
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">
                {period === "week" ? "แนวโน้มรายสัปดาห์" : "แนวโน้ม 6 เดือน"}
              </h3>
            </div>
          </div>

          {/* ปุ่มสลับ สัปดาห์ / เดือน */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/50">
            <button
              type="button"
              onClick={() => setPeriod("week")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs transition-all",
                period === "week"
                  ? "bg-white text-indigo-600 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              )}
            >
              สัปดาห์
            </button>
            <button
              type="button"
              onClick={() => setPeriod("month")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs transition-all",
                period === "month"
                  ? "bg-white text-indigo-600 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              )}
            >
              เดือน
            </button>
          </div>
        </div>

        {/* แถบสรุปย่อ + Legend ด้านบนกราฟ */}
        <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-slate-50/80 border border-slate-100 mb-3">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {period === "week" ? weekRangeText : "ภาพรวม 6 เดือนย้อนหลัง"}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> รับ +{formatCurrency(period === "week" ? weekTotalIncome : monthTotalIncome)}
            </span>
            <span className="flex items-center gap-1 text-rose-500 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> จ่าย -{formatCurrency(period === "week" ? weekTotalExpense : monthTotalExpense)}
            </span>
          </div>
        </div>

        {/* กราฟ Area Chart */}
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={activeChartData}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94A3B8" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const inc = Number(payload.find((p) => p.dataKey === "income")?.value || 0);
                  const exp = Number(payload.find((p) => p.dataKey === "expense")?.value || 0);
                  const diff = inc - exp;
                  return (
                    <div className="bg-white/95 backdrop-blur-xs p-3 rounded-2xl shadow-xl border border-slate-100 text-xs space-y-1.5 min-w-[140px]">
                      <p className="font-bold text-slate-800 pb-1 border-b border-slate-100">
                        {period === "week" ? `วัน${label}` : label}
                      </p>
                      <div className="flex items-center justify-between gap-3 text-emerald-600 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> รายรับ
                        </span>
                        <span>+{formatCurrency(inc)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-rose-500 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> รายจ่าย
                        </span>
                        <span>-{formatCurrency(exp)}</span>
                      </div>
                      <div className="pt-1 border-t border-slate-100 flex items-center justify-between gap-3 text-slate-600 font-bold">
                        <span>คงเหลือ</span>
                        <span className={diff >= 0 ? "text-indigo-600" : "text-rose-600"}>
                          {diff >= 0 ? "+" : ""}{formatCurrency(diff)}
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                name="income"
                stroke="#10B981"
                strokeWidth={2.5}
                fill="url(#incomeGrad)"
                dot={{ fill: "#10B981", r: 3.5, strokeWidth: 1.5, stroke: "#fff" }}
                activeDot={{ r: 5, stroke: "#10B981", strokeWidth: 2, fill: "#fff" }}
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="expense"
                stroke="#F43F5E"
                strokeWidth={2.5}
                fill="url(#expenseGrad)"
                dot={{ fill: "#F43F5E", r: 3.5, strokeWidth: 1.5, stroke: "#fff" }}
                activeDot={{ r: 5, stroke: "#F43F5E", strokeWidth: 2, fill: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
