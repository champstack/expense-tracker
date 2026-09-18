"use client";

import React, { useMemo } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from "recharts";
import { Transaction } from "@/types/database";
import { formatCurrency } from "@/lib/utils";
import { PieChart as PieIcon, BarChart3, TrendingUp } from "lucide-react";

interface ExpenseChartsProps {
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  sixMonthData?: { month: string; income: number; expense: number }[];
}

const CARD = "bg-white rounded-2xl border border-black/[0.06] shadow-sm p-5 flex flex-col";

export function ExpenseCharts({ transactions, totalIncome, totalExpense, sixMonthData }: ExpenseChartsProps) {
  // สัดส่วนรายจ่ายตามหมวดหมู่
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

  // รายรับ-รายจ่ายรายวัน
  const dailyData = useMemo(() => {
    const map = new Map<number, { day: number; income: number; expense: number }>();
    transactions.forEach((tx) => {
      if (!tx.transaction_date) return;
      const day = parseInt(tx.transaction_date.split("-")[2], 10);
      if (isNaN(day)) return;
      const cur = map.get(day) || { day, income: 0, expense: 0 };
      if (tx.type === "income") cur.income += Number(tx.amount);
      else cur.expense += Number(tx.amount);
      map.set(day, cur);
    });
    return Array.from(map.values()).sort((a, b) => a.day - b.day);
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Donut Chart */}
      <div className={CARD}>
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50"><PieIcon className="w-4 h-4 text-rose-500" /></div>
            <h3 className="font-semibold text-slate-800 text-sm">สัดส่วนรายจ่าย</h3>
          </div>
          <span className="text-xs text-slate-400">{categoryData.length} หมวดหมู่</span>
        </div>
        {categoryData.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-10">
            <PieIcon className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
            <p className="text-xs text-slate-400">ยังไม่มีข้อมูลรายจ่าย</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative w-40 h-40 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value">
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => [formatCurrency(Number(v)), "ยอดเงิน"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-400">รวมจ่าย</span>
                <span className="text-xs font-bold text-slate-700">{formatCurrency(totalExpense)}</span>
              </div>
            </div>
            <div className="flex-1 w-full space-y-2 overflow-y-auto max-h-44">
              {categoryData.map((cat, i) => {
                const pct = totalExpense > 0 ? Math.round((cat.value / totalExpense) * 100) : 0;
                return (
                  <div key={i} className="text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="font-medium text-slate-700 truncate max-w-[90px]">{cat.name}</span>
                      </div>
                      <span className="text-slate-600 font-semibold tabular-nums">{formatCurrency(cat.value)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Area Chart 6 เดือน หรือ Bar Chart รายวัน */}
      {sixMonthData && sixMonthData.length > 0 ? (
        <div className={CARD}>
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50"><TrendingUp className="w-4 h-4 text-indigo-500" /></div>
              <h3 className="font-semibold text-slate-800 text-sm">แนวโน้ม 6 เดือน</h3>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-400" />รับ</span>
              <span className="flex items-center gap-1 text-rose-500"><span className="w-2 h-2 rounded-full bg-rose-400" />จ่าย</span>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sixMonthData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                <Tooltip formatter={(v: any, name: any) => [formatCurrency(Number(v)), name === "income" ? "รายรับ" : "รายจ่าย"]} />
                <Area type="monotone" dataKey="income" name="income" stroke="#10B981" strokeWidth={2} fill="url(#incomeGrad)" dot={{ fill: "#10B981", r: 3 }} />
                <Area type="monotone" dataKey="expense" name="expense" stroke="#F43F5E" strokeWidth={2} fill="url(#expenseGrad)" dot={{ fill: "#F43F5E", r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className={CARD}>
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50"><BarChart3 className="w-4 h-4 text-indigo-500" /></div>
              <h3 className="font-semibold text-slate-800 text-sm">รายรับ-รายจ่ายรายวัน</h3>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-400" />รับ</span>
              <span className="flex items-center gap-1 text-rose-500"><span className="w-2 h-2 rounded-full bg-rose-400" />จ่าย</span>
            </div>
          </div>
          {dailyData.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-10">
              <BarChart3 className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
              <p className="text-xs text-slate-400">ไม่มีรายการในเดือนนี้</p>
            </div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }}
                    tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                  <Tooltip formatter={(v: any, name: any) => [formatCurrency(Number(v)), name === "income" ? "รายรับ" : "รายจ่าย"]}
                    labelFormatter={(l) => `วันที่ ${l}`} />
                  <Bar dataKey="income" name="income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={14} />
                  <Bar dataKey="expense" name="expense" fill="#F43F5E" radius={[4, 4, 0, 0]} maxBarSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
