"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { StatCards } from "@/components/dashboard/StatCards";
import { ExpenseCharts } from "@/components/dashboard/ExpenseCharts";
import { MonthCompare } from "@/components/dashboard/MonthCompare";
import { AccountCards } from "@/components/dashboard/AccountCards";
import { CalendarView } from "@/components/calendar/CalendarView";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionFormModal } from "@/components/transactions/TransactionFormModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { CategoryModal } from "@/components/categories/CategoryModal";
import { AccountModal } from "@/components/accounts/AccountModal";
import { DataService } from "@/lib/dataService";
import { Transaction, Category, Account, TransactionType, DEFAULT_CATEGORIES, DEFAULT_ACCOUNTS } from "@/types/database";
import { formatCurrency, formatThaiDate, formatThaiMonthYear, THAI_MONTHS_SHORT } from "@/lib/utils";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { exportTransactionsToCsv } from "@/lib/exportCsv";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import {
  LayoutDashboard, Calendar, ReceiptText, PiggyBank, Plus, Wallet,
  ChevronLeft, ChevronRight, User, CheckCircle2, AlertCircle,
  Download, ArrowRight, Settings, RotateCcw, Tag, CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = "dashboard" | "calendar" | "transactions" | "budget";

// ────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────
// Sidebar (Desktop only)
// ────────────────────────────────────────────────────────────
function Sidebar({ active, onChange, isOnline, onOpenAuth, onOpenCategories, onOpenAccounts, onAdd, user }: {
  active: TabType; onChange: (t: TabType) => void; isOnline: boolean; onOpenAuth: () => void;
  onOpenCategories: () => void; onOpenAccounts?: () => void; onAdd: () => void; user: any;
}) {
  const items: { id: TabType; icon: React.ReactNode; label: string }[] = [
    { id: "dashboard", icon: <LayoutDashboard className="w-5 h-5" />, label: "ภาพรวม (Dashboard)" },
    { id: "calendar", icon: <Calendar className="w-5 h-5" />, label: "ปฏิทินรายรับ-จ่าย" },
    { id: "transactions", icon: <ReceiptText className="w-5 h-5" />, label: "บันทึกรายการ" },
    { id: "budget", icon: <PiggyBank className="w-5 h-5" />, label: "ตั้งงบประมาณ" },
  ];
  return (
    <aside className="hidden md:flex flex-col w-[230px] min-h-0 shrink-0"
      style={{ background: "linear-gradient(160deg, #4F46E5 0%, #7C3AED 100%)" }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-white text-base tracking-tight">Money Planner</span>
      </div>

      {/* Main Add Button in Sidebar */}
      <div className="px-3 pt-4">
        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white text-indigo-600 font-bold text-sm shadow-md hover:bg-indigo-50 hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          บันทึกรายการใหม่
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1 px-3 pt-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full",
              active === item.id
                ? "bg-white/20 text-white shadow-xs font-semibold backdrop-blur-xs"
                : "text-indigo-100 hover:bg-white/15 hover:text-white"
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        {/* Categories Manager */}
        <button
          onClick={onOpenCategories}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-100 hover:bg-white/15 hover:text-white transition-all text-left w-full mt-2"
        >
          <Tag className="w-5 h-5" />
          จัดการหมวดหมู่
        </button>

        {/* Accounts Manager */}
        <button
          onClick={onOpenAccounts}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-100 hover:bg-white/15 hover:text-white transition-all text-left w-full"
        >
          <CreditCard className="w-5 h-5" />
          บัญชี & กระเป๋าเงิน
        </button>
      </nav>

      {/* Bottom: User status / Login */}
      <div className="px-3 pb-5 pt-3 border-t border-white/10 mt-2">
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/90 hover:bg-white/15 transition-colors w-full text-left"
        >
          <User className="w-5 h-5 text-indigo-200 shrink-0" />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold truncate text-white">
              {user?.email ? user.email.split("@")[0] : "เข้าสู่ระบบ (ซิงก์คลาวด์)"}
            </span>
            <span className="text-[10px] text-indigo-200">
              {user ? "เชื่อมต่อคลาวด์แล้ว" : "โหมดทดลองใช้งาน (Local)"}
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
}

function TopBar({
  activeTab, currentDate, onDateChange, onAdd, onOpenAuth, onOpenCategories, onOpenAccounts, isOnline, user,
}: {
  activeTab: TabType; currentDate: Date; onDateChange: (d: Date) => void;
  onAdd: () => void; onOpenAuth: () => void; onOpenCategories?: () => void; onOpenAccounts?: () => void;
  isOnline: boolean; user: any;
}) {
  const y = currentDate.getFullYear(), m = currentDate.getMonth();
  const tabTitles: Record<TabType, string> = {
    dashboard: "Money Planner",
    calendar: "ปฏิทินรายรับ-จ่าย",
    transactions: "บันทึกรายการ",
    budget: "ตั้งงบประมาณ",
  };
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 h-14 flex items-center px-4 sm:px-5 gap-2 sm:gap-4 shrink-0 shadow-sm">
      {/* Page Title */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {activeTab === "dashboard" && (
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm md:hidden shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
        )}
        <h1 className="font-bold text-indigo-600 text-base sm:text-lg tracking-tight truncate">{tabTitles[activeTab]}</h1>
      </div>

      {/* Month Picker (Responsive: visible on both desktop and mobile) */}
      <div className="flex items-center gap-0.5 sm:gap-1 border border-slate-200 rounded-xl px-1 sm:px-3 py-1 bg-white hover:border-indigo-300 transition-colors shrink-0">
        <button onClick={() => onDateChange(new Date(y, m - 1, 1))} className="text-slate-400 hover:text-indigo-600 transition-colors p-1" title="เดือนก่อนหน้า">
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <span className="px-1 sm:px-2 text-xs sm:text-sm font-bold text-slate-700 min-w-[85px] sm:min-w-[130px] text-center select-none">
          {formatThaiMonthYear(y, m)}
        </span>
        <button onClick={() => onDateChange(new Date(y, m + 1, 1))} className="text-slate-400 hover:text-indigo-600 transition-colors p-1" title="เดือนถัดไป">
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* ปุ่มเพิ่มรายการเด่นชัดบนแถบบน */}
      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all shrink-0"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span className="hidden sm:inline">เพิ่มรายการ</span>
      </button>

      {/* Accounts Trigger on mobile & desktop */}
      {onOpenAccounts && (
        <button
          onClick={onOpenAccounts}
          className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors shrink-0"
          title="จัดการบัญชี"
        >
          <CreditCard className="w-4 h-4" />
        </button>
      )}

      {/* Categories Trigger on mobile & desktop */}
      {onOpenCategories && (
        <button
          onClick={onOpenCategories}
          className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors shrink-0"
          title="จัดการหมวดหมู่"
        >
          <Tag className="w-4 h-4" />
        </button>
      )}

      {/* User Avatar / Login Button */}
      <button
        onClick={onOpenAuth}
        className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 shrink-0"
        title={user?.email || "เข้าสู่ระบบ"}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          {user?.email ? user.email[0].toUpperCase() : <User className="w-4 h-4" />}
        </div>
        <span className="hidden sm:inline text-xs font-semibold text-slate-700 max-w-[110px] truncate">
          {user?.email ? user.email.split("@")[0] : "เข้าสู่ระบบ"}
        </span>
      </button>
    </header>
  );
}


// ────────────────────────────────────────────────────────────
// BottomNav (Mobile only)
// ────────────────────────────────────────────────────────────
function BottomNav({ active, onChange, onAdd }: { active: TabType; onChange: (t: TabType) => void; onAdd: () => void }) {
  const items = [
    { id: "dashboard" as TabType, icon: <LayoutDashboard className="w-5 h-5" />, label: "ภาพรวม" },
    { id: "calendar" as TabType, icon: <Calendar className="w-5 h-5" />, label: "ปฏิทิน" },
    { id: "transactions" as TabType, icon: <ReceiptText className="w-5 h-5" />, label: "รายการ" },
    { id: "budget" as TabType, icon: <PiggyBank className="w-5 h-5" />, label: "งบ" },
  ];
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-black/[0.06] px-2 pb-safe">
      <div className="flex items-center justify-around">
        {items.slice(0, 2).map((item) => (
          <button key={item.id} onClick={() => onChange(item.id)}
            className={cn("flex flex-col items-center py-2 px-3 rounded-xl transition-colors select-none outline-none focus:outline-none", active === item.id ? "text-blue-600 font-semibold" : "text-slate-400")}>
            {item.icon}
            <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
          </button>
        ))}
        {/* Center FAB */}
        <button onClick={onAdd} className="relative -top-3 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all outline-none focus:outline-none">
          <Plus className="w-6 h-6" strokeWidth={2.5} />
        </button>
        {items.slice(2).map((item) => (
          <button key={item.id} onClick={() => onChange(item.id)}
            className={cn("flex flex-col items-center py-2 px-3 rounded-xl transition-colors select-none outline-none focus:outline-none", active === item.id ? "text-blue-600 font-semibold" : "text-slate-400")}>
            {item.icon}
            <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ────────────────────────────────────────────────────────────
// Budget View (inline - ไม่ต้องรอ subagent)
// ────────────────────────────────────────────────────────────
import { BudgetStorage } from "@/lib/budgetStorage";
import { CategoryBudget, SavingsGoal, GOAL_COLORS, GOAL_ICONS } from "@/types/budget";

function BudgetView({ transactions, categories, currentMonth }: {
  transactions: Transaction[]; categories: Category[]; currentMonth: Date;
}) {
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editBudget, setEditBudget] = useState<{ cat_id: string; value: string }>({ cat_id: "", value: "" });
  const [newGoal, setNewGoal] = useState({ name: "", targetAmount: "", currentAmount: "0", deadline: "", color: GOAL_COLORS[0], icon: GOAL_ICONS[0] });
  const [addAmounts, setAddAmounts] = useState<Record<string, string>>({});
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState("");

  useEffect(() => {
    setBudgets(BudgetStorage.getBudgets().budgets);
    setGoals(BudgetStorage.getGoals());
  }, []);

  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter((t) => t.type === "expense").forEach((t) => {
      map.set(t.category_id, (map.get(t.category_id) || 0) + Number(t.amount));
    });
    return map;
  }, [transactions]);

  const expenseCategories = categories.filter((c) => c.type === "expense");

  function saveBudget() {
    const limit = parseFloat(editBudget.value);
    if (!editBudget.cat_id || isNaN(limit) || limit < 0) return;
    BudgetStorage.setBudgetForCategory(editBudget.cat_id, limit);
    setBudgets(BudgetStorage.getBudgets().budgets);
    setShowBudgetModal(false);
    setEditBudget({ cat_id: "", value: "" });
  }

  function saveGoal() {
    const target = parseFloat(newGoal.targetAmount);
    const current = parseFloat(newGoal.currentAmount || "0");
    if (!newGoal.name || isNaN(target) || target <= 0) return;
    BudgetStorage.addGoal({ ...newGoal, targetAmount: target, currentAmount: current });
    setGoals(BudgetStorage.getGoals());
    setShowGoalModal(false);
    setNewGoal({ name: "", targetAmount: "", currentAmount: "0", deadline: "", color: GOAL_COLORS[0], icon: GOAL_ICONS[0] });
  }

  function handleAddGoalAmount(id: string) {
    const amt = parseFloat(addAmounts[id] || "0");
    if (isNaN(amt) || amt <= 0) return;
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    BudgetStorage.updateGoalAmount(id, goal.currentAmount + amt);
    setGoals(BudgetStorage.getGoals());
    setAddAmounts((prev) => ({ ...prev, [id]: "" }));
  }

  const budgetMap = new Map(budgets.map((b) => [b.category_id, b.monthly_limit]));

  return (
    <div className="space-y-6">
      {/* Section: งบประมาณรายหมวดหมู่ */}
      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-slate-900 text-base">งบประมาณรายเดือน</h2>
            <p className="text-xs text-slate-500 mt-0.5">{formatThaiMonthYear(currentMonth.getFullYear(), currentMonth.getMonth())}</p>
          </div>
          <button onClick={() => setShowBudgetModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <Settings className="w-3.5 h-3.5" /> แก้ไขงบ
          </button>
        </div>

        {budgets.length === 0 ? (
          <div className="text-center py-10">
            <PiggyBank className="w-10 h-10 text-slate-300 mx-auto mb-3 stroke-1" />
            <p className="text-sm text-slate-500 mb-1">ยังไม่ได้ตั้งงบประมาณ</p>
            <p className="text-xs text-slate-400 mb-4">ตั้งงบเพื่อควบคุมรายจ่ายแต่ละหมวดหมู่</p>
            <button onClick={() => setShowBudgetModal(true)} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm">
              + ตั้งงบประมาณ
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {budgets.map((b) => {
              const cat = categories.find((c) => c.id === b.category_id);
              if (!cat) return null;
              const spent = expenseByCategory.get(b.category_id) || 0;
              const pct = b.monthly_limit > 0 ? Math.min(Math.round((spent / b.monthly_limit) * 100), 100) : 0;
              const isWarn = pct >= 70 && pct < 90;
              const isOver = pct >= 90;
              const barColor = isOver ? "#EF4444" : isWarn ? "#F59E0B" : "#10B981";
              const status = isOver ? "เกินงบ!" : isWarn ? "ใกล้เต็ม" : "ปกติ";
              const statusColor = isOver ? "bg-rose-50 text-rose-500" : isWarn ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600";

              return (
                <div key={b.category_id} className="rounded-xl border border-black/[0.05] p-4 hover:border-slate-200 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg text-white flex items-center justify-center" style={{ backgroundColor: cat.color }}>
                        <CategoryIcon name={cat.icon} size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{cat.name}</p>
                        <p className="text-xs text-slate-400 tabular-nums">{formatCurrency(spent)} / {formatCurrency(b.monthly_limit)}</p>
                      </div>
                    </div>
                    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", statusColor)}>{status}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 text-right">{pct}% ของงบ</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section: Savings Goals */}
      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900 text-base">เป้าหมายการออม</h2>
          <button onClick={() => setShowGoalModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <Plus className="w-3.5 h-3.5" /> เพิ่มเป้าหมาย
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-10">
            <PiggyBank className="w-10 h-10 text-slate-300 mx-auto mb-3 stroke-1" />
            <p className="text-sm text-slate-500 mb-1">ยังไม่มีเป้าหมายการออม</p>
            <p className="text-xs text-slate-400">ตั้งเป้าหมายเพื่อสร้างแรงจูงใจในการออม</p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => {
              const pct =
                goal.targetAmount > 0
                  ? Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)
                  : 0;
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

              return (
                <div
                  key={goal.id}
                  className="rounded-xl border border-black/[0.05] p-4 hover:border-slate-200 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg text-white flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: goal.color }}
                      >
                        <CategoryIcon name={goal.icon} size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800">{goal.name}</p>
                          {goal.deadline && (
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              ถึง {formatThaiDate(goal.deadline, false)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 tabular-nums">
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                          {remaining > 0 && (
                            <span className="ml-2 text-slate-400 font-normal">
                              (ขาดอีก {formatCurrency(remaining)})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Right Controls: Deposit Button, Status & Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setDepositGoal(goal);
                          setDepositAmount("");
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold transition-colors shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> ออมเงิน
                      </button>


                      <button
                        onClick={() => {
                          if (confirm(`คุณต้องการลบเป้าหมาย "${goal.name}" ใช่หรือไม่?`)) {
                            BudgetStorage.deleteGoal(goal.id);
                            setGoals(BudgetStorage.getGoals());
                          }
                        }}
                        className="p-1 text-slate-300 hover:text-rose-500 rounded-lg transition-colors text-xs ml-1"
                        title="ลบเป้าหมาย"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar (Full Width, same as Budget) */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: goal.color }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 text-right">{pct}% สำเร็จแล้ว</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-black/[0.06] w-full max-w-md p-6 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">ตั้งงบประมาณรายหมวดหมู่</h3>
              <button onClick={() => setShowBudgetModal(false)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
            </div>
            <div className="overflow-y-auto space-y-3 flex-1">
              {expenseCategories.map((cat) => {
                const current = budgetMap.get(cat.id);
                return (
                  <div key={cat.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                    <div className="w-8 h-8 rounded-lg text-white flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color }}>
                      <CategoryIcon name={cat.icon} size={16} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 flex-1">{cat.name}</span>
                    <div className="flex items-center gap-1.5">
                      {editBudget.cat_id === cat.id ? (
                        <>
                          <input autoFocus type="number" placeholder="0" value={editBudget.value}
                            onChange={(e) => setEditBudget((p) => ({ ...p, value: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && saveBudget()}
                            className="w-24 px-2.5 py-1.5 rounded-lg border border-blue-500 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-right tabular-nums" />
                          <button onClick={saveBudget} className="px-2.5 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-semibold">บันทึก</button>
                          <button onClick={() => setEditBudget({ cat_id: "", value: "" })} className="text-slate-400 text-xs px-1">ยกเลิก</button>
                        </>
                      ) : (
                        <button onClick={() => setEditBudget({ cat_id: cat.id, value: current?.toString() || "" })}
                          className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors", current ? "border-slate-200 text-slate-700 hover:bg-slate-50" : "border-dashed border-slate-300 text-slate-400 hover:border-slate-400")}>
                          {current ? formatCurrency(current) : "+ ตั้งงบ"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-black/[0.06] w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900">เพิ่มเป้าหมายการออม</h3>
              <button onClick={() => setShowGoalModal(false)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">ชื่อเป้าหมาย</label>
                <input placeholder="เช่น ออมซื้อ iPhone, เที่ยวญี่ปุ่น" value={newGoal.name} onChange={(e) => setNewGoal((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">ยอดเป้าหมาย (บาท)</label>
                  <input type="number" placeholder="50,000" value={newGoal.targetAmount} onChange={(e) => setNewGoal((p) => ({ ...p, targetAmount: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">มีอยู่แล้ว (บาท)</label>
                  <input type="number" placeholder="0" value={newGoal.currentAmount} onChange={(e) => setNewGoal((p) => ({ ...p, currentAmount: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">วันครบกำหนด (ไม่บังคับ)</label>
                <input type="date" value={newGoal.deadline} onChange={(e) => setNewGoal((p) => ({ ...p, deadline: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">สี</label>
                <div className="flex gap-2 flex-wrap">
                  {GOAL_COLORS.map((c) => (
                    <button key={c} onClick={() => setNewGoal((p) => ({ ...p, color: c }))}
                      className={cn("w-7 h-7 rounded-full transition-transform hover:scale-110", newGoal.color === c && "ring-2 ring-offset-2 ring-blue-500")}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <button onClick={saveGoal} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-colors">
                บันทึกเป้าหมาย
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Money Modal */}
      {depositGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-black/[0.06] w-full max-w-sm p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg text-white flex items-center justify-center"
                  style={{ backgroundColor: depositGoal.color }}
                >
                  <CategoryIcon name={depositGoal.icon} size={14} />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">
                  ออมเงิน: {depositGoal.name}
                </h3>
              </div>
              <button
                onClick={() => setDepositGoal(null)}
                className="text-slate-400 hover:text-slate-700 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              ปัจจุบัน {formatCurrency(depositGoal.currentAmount)} / {formatCurrency(depositGoal.targetAmount)}
            </p>

            <div className="mb-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                จำนวนเงินที่ต้องการออมเพิ่ม
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  autoFocus
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const amt = parseFloat(depositAmount);
                      if (!isNaN(amt) && amt > 0) {
                        BudgetStorage.updateGoalAmount(depositGoal.id, depositGoal.currentAmount + amt);
                        setGoals(BudgetStorage.getGoals());
                        setDepositGoal(null);
                        setDepositAmount("");
                      }
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  ฿
                </span>
              </div>
            </div>

            {/* Quick chips: +100, +500, +1,000, +2,000 */}
            <div className="grid grid-cols-4 gap-1.5 mb-4">
              {[100, 500, 1000, 2000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    const cur = parseFloat(depositAmount) || 0;
                    setDepositAmount((cur + val).toString());
                  }}
                  className="py-1 text-center bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200/80 transition-colors"
                >
                  +{val.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDepositGoal(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  const amt = parseFloat(depositAmount);
                  if (isNaN(amt) || amt <= 0) return;
                  BudgetStorage.updateGoalAmount(depositGoal.id, depositGoal.currentAmount + amt);
                  setGoals(BudgetStorage.getGoals());
                  setDepositGoal(null);
                  setDepositAmount("");
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-500/20 transition-all"
              >
                ยืนยันการออม
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────
export default function HomePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formInitialDate, setFormInitialDate] = useState<string>();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isAccountsOpen, setIsAccountsOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [user, setUser] = useState<any>(null);

  const isOnline = isSupabaseConfigured();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [cats, txs, accs] = await Promise.all([
        DataService.getCategories(),
        DataService.getTransactions(),
        DataService.getAccounts(),
      ]);
      setCategories(cats);
      setTransactions(txs);
      setAccounts(accs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    if (isOnline) {
      try {
        const supabase = createClient();
        supabase.auth.getUser().then((res: any) => setUser(res?.data?.user || null));
        const { data: listener } = supabase.auth.onAuthStateChange((_e: any, session: any) => {
          setUser(session?.user || null);
          loadData();
        });
        return () => listener?.subscription?.unsubscribe();
      } catch { /* ignore */ }
    }
  }, [loadData, isOnline]);

  const y = currentDate.getFullYear(), m = currentDate.getMonth();

  // รายการเดือนปัจจุบัน
  const monthTx = useMemo(() =>
    transactions.filter((t) => {
      if (!t.transaction_date) return false;
      const parts = t.transaction_date.split("-");
      if (parts.length < 2) return false;
      const ty = parseInt(parts[0], 10);
      const tm = parseInt(parts[1], 10);
      return ty === y && tm - 1 === m;
    }), [transactions, y, m]);

  // รายการเดือนที่แล้ว (สำหรับเปรียบเทียบ)
  const prevMonthTx = useMemo(() => {
    const prev = new Date(y, m - 1, 1);
    const py = prev.getFullYear(), pm = prev.getMonth();
    return transactions.filter((t) => {
      if (!t.transaction_date) return false;
      const parts = t.transaction_date.split("-");
      if (parts.length < 2) return false;
      const ty = parseInt(parts[0], 10);
      const tm = parseInt(parts[1], 10);
      return ty === py && tm - 1 === pm;
    });
  }, [transactions, y, m]);

  const totalIncome = useMemo(() =>
    monthTx.filter((t) => t.type === "income").reduce((s, t) => s + (parseFloat(String(t.amount)) || 0), 0),
    [monthTx]
  );
  const totalExpense = useMemo(() =>
    monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + (parseFloat(String(t.amount)) || 0), 0),
    [monthTx]
  );
  const prevIncome = useMemo(() =>
    prevMonthTx.filter((t) => t.type === "income").reduce((s, t) => s + (parseFloat(String(t.amount)) || 0), 0),
    [prevMonthTx]
  );
  const prevExpense = useMemo(() =>
    prevMonthTx.filter((t) => t.type === "expense").reduce((s, t) => s + (parseFloat(String(t.amount)) || 0), 0),
    [prevMonthTx]
  );

  // 6-month data สำหรับ Area Chart
  const sixMonthData = useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(y, m - i, 1);
      const dy = d.getFullYear(), dm = d.getMonth();
      const monthTxs = transactions.filter((t) => {
        if (!t.transaction_date) return false;
        const [ty, tm2] = t.transaction_date.split("-").map(Number);
        return ty === dy && tm2 - 1 === dm;
      });
      result.push({
        month: THAI_MONTHS_SHORT[dm],
        income: monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + (parseFloat(String(t.amount)) || 0), 0),
        expense: monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + (parseFloat(String(t.amount)) || 0), 0),
      });
    }
    return result;
  }, [transactions, y, m]);

  const handleBatchSubmit = async (items: any[]) => {
    const savedTxs = await DataService.addMultipleTransactions(items);
    // ปรับมุมมองเดือนให้ตรงกับวันที่ทำรายการโดยอัตโนมัติ เพื่อให้ยอดเงินขึ้นทันที
    if (items.length > 0 && items[0].transaction_date) {
      const parts = items[0].transaction_date.split("-");
      if (parts.length >= 2) {
        const ty = parseInt(parts[0], 10);
        const tm = parseInt(parts[1], 10);
        if (!isNaN(ty) && !isNaN(tm)) {
          setCurrentDate(new Date(ty, tm - 1, 1));
        }
      }
    }
    // อัปเดตรายการลงในหน้าจอทันที เพื่อให้ยอดเงินและประวัติแสดงผลทันที
    if (savedTxs && savedTxs.length > 0) {
      setTransactions((prev) => {
        const savedIds = new Set(savedTxs.map((t) => t.id));
        return [...savedTxs, ...prev.filter((t) => !savedIds.has(t.id))];
      });
    }
    await loadData();
  };
  const handleDelete = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    await DataService.deleteTransaction(id);
    await loadData();
  };
  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsFormOpen(true);
  };
  const handleUpdateTransaction = async (id: string, item: any) => {
    const updated = await DataService.updateTransaction(id, item);
    if (updated) {
      setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
    await loadData();
    setEditingTransaction(null);
  };
  const handleAddForDate = (date: string) => {
    setEditingTransaction(null);
    setFormInitialDate(date);
    setIsFormOpen(true);
  };
  const openAdd = () => {
    setEditingTransaction(null);
    setFormInitialDate(new Date().toISOString().split("T")[0]);
    setIsFormOpen(true);
  };

  const tabLabel = { dashboard: "ภาพรวมการเงิน", calendar: "ปฏิทินรายรับ-จ่าย", transactions: "บันทึกรายการ & ประวัติ", budget: "งบประมาณ & เป้าหมาย" };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar
        activeTab={activeTab}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onAdd={openAdd}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCategories={() => setIsCategoriesOpen(true)}
        onOpenAccounts={() => setIsAccountsOpen(true)}
        isOnline={isOnline}
        user={user}
      />

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
        <Sidebar
          active={activeTab}
          onChange={setActiveTab}
          isOnline={isOnline}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenCategories={() => setIsCategoriesOpen(true)}
          onOpenAccounts={() => setIsAccountsOpen(true)}
          onAdd={openAdd}
          user={user}
        />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 flex flex-col">
          <div className={activeTab === "calendar" || activeTab === "transactions" ? "flex flex-col flex-1 px-3 sm:px-4 pt-3 sm:pt-4 pb-20 md:pb-4 min-h-0" : "max-w-5xl mx-auto w-full px-4 pt-5 pb-8 space-y-5"}>
            {/* Sub header for transactions tab */}
            {activeTab === "transactions" && (
              <div className="flex items-center justify-between mb-3 shrink-0 gap-2">
                {/* Month Navigation */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                  <button
                    onClick={() => setCurrentDate(new Date(y, m - 1, 1))}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                    title="เดือนก่อนหน้า"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 text-xs sm:text-sm font-bold text-slate-700 select-none">
                    {formatThaiMonthYear(y, m)}
                  </span>
                  <button
                    onClick={() => setCurrentDate(new Date(y, m + 1, 1))}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                    title="เดือนถัดไป"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => exportTransactionsToCsv(monthTx)}
                  disabled={monthTx.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>
            )}

            {/* Tab: Dashboard */}
            {activeTab === "dashboard" && (
              <div className="space-y-5">
                <StatCards totalIncome={totalIncome} totalExpense={totalExpense} netBalance={totalIncome - totalExpense} prevIncome={prevIncome} prevExpense={prevExpense} />
                <AccountCards
                  accounts={accounts}
                  allTransactions={transactions}
                  onOpenAccountsModal={() => setIsAccountsOpen(true)}
                />
                <MonthCompare currentTransactions={monthTx} prevTransactions={prevMonthTx} />
                <ExpenseCharts
                  transactions={monthTx}
                  allTransactions={transactions}
                  totalIncome={totalIncome}
                  totalExpense={totalExpense}
                  sixMonthData={sixMonthData}
                  currentDate={currentDate}
                />

                {/* Recent Transactions */}
                <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] mb-3">
                    <h3 className="font-semibold text-slate-900 text-sm">รายการล่าสุด</h3>
                    <button onClick={() => setActiveTab("transactions")} className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline">
                      ดูทั้งหมด ({monthTx.length}) <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {monthTx.slice(0, 5).length === 0 ? (
                      <p className="text-center py-8 text-xs text-slate-400">ยังไม่มีรายการ กดปุ่ม + เพื่อเริ่มบันทึก</p>
                    ) : monthTx.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="py-2.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: tx.category?.color || "#64748B" }}>
                          <CategoryIcon name={tx.category?.icon || "CircleDot"} size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-800 truncate">{tx.category?.name || "ไม่ระบุ"}</p>
                            {tx.account && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                <CategoryIcon name={tx.account.icon || "Wallet"} size={10} />
                                {tx.account.name}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate">{formatThaiDate(tx.transaction_date, false)}{tx.note ? ` • ${tx.note}` : ""}</p>
                        </div>
                        <span className={cn("font-bold text-sm tabular-nums", tx.type === "income" ? "text-emerald-600" : "text-rose-500")}>
                          {tx.type === "income" ? "+" : "-"}{formatCurrency(Number(tx.amount))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center py-2 text-xs text-slate-300 flex items-center justify-center gap-3">
                  <button onClick={() => { if (confirm("รีเซ็ตข้อมูลตัวอย่าง?")) DataService.resetToSampleData().then(loadData); }}
                    className="flex items-center gap-1 hover:text-slate-500 transition-colors">
                    <RotateCcw className="w-3 h-3" /> Reset Demo
                  </button>
                  <span>•</span>
                  <button onClick={() => setIsAuthOpen(true)} className="hover:text-slate-500 transition-colors">เชื่อมต่อ Supabase</button>
                </div>
              </div>
            )}

            {/* Tab: Calendar */}
            {activeTab === "calendar" && (
              <div className="flex-1 flex flex-col min-h-0">
                <CalendarView currentDate={currentDate} onDateChange={setCurrentDate} transactions={transactions}
                  categories={categories} onAddTransactionForDate={handleAddForDate} onDeleteTransaction={handleDelete} />
              </div>
            )}

            {/* Tab: Transactions */}
            {activeTab === "transactions" && (
              <div className="flex-1 flex flex-col min-h-0">
                <TransactionList
                  transactions={monthTx}
                  categories={categories}
                  accounts={accounts}
                  onDelete={handleDelete}
                  onEdit={handleEditTransaction}
                  onOpenNewModal={openAdd}
                />
              </div>
            )}

            {/* Tab: Budget */}
            {activeTab === "budget" && (
              <BudgetView transactions={monthTx} categories={categories} currentMonth={currentDate} />
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav active={activeTab} onChange={setActiveTab} onAdd={openAdd} />

      {/* Modals */}
      <TransactionFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
        }}
        categories={categories}
        accounts={accounts}
        initialDate={formInitialDate}
        editingTransaction={editingTransaction}
        onUpdateTransaction={handleUpdateTransaction}
        onSubmitBatch={handleBatchSubmit}
      />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} user={user} onAuthSuccess={loadData} />
      <CategoryModal
        isOpen={isCategoriesOpen}
        onClose={() => setIsCategoriesOpen(false)}
        categories={categories}
        onAddCategory={async (newCat) => {
          await DataService.addCategory(newCat);
          await loadData();
        }}
      />
      <AccountModal
        isOpen={isAccountsOpen}
        onClose={() => setIsAccountsOpen(false)}
        accounts={accounts}
        onAddAccount={async (newAcc) => {
          await DataService.addAccount(newAcc);
          await loadData();
        }}
        onDeleteAccount={async (id) => {
          await DataService.deleteAccount(id);
          await loadData();
        }}
      />
    </div>
  );
}
