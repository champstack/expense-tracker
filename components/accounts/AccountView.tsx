"use client";

import React, { useState, useMemo } from "react";
import { Account, Transaction } from "@/types/database";
import { CreditCard, Plus, Trash2, Wallet, Landmark, Building2, Smartphone, Banknote, Check, X } from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { formatCurrency, cn } from "@/lib/utils";

interface AccountViewProps {
  accounts: Account[];
  allTransactions?: Transaction[];
  onAddAccount?: (account: Omit<Account, "id">) => Promise<void>;
  onDeleteAccount?: (id: string) => Promise<void>;
}

const PRESET_ACCOUNT_ICONS = [
  { name: "Banknote", label: "เงินสด" },
  { name: "Landmark", label: "ธนาคาร 1" },
  { name: "Building2", label: "ธนาคาร 2" },
  { name: "Smartphone", label: "กระเป๋าเงินดิจิทัล" },
  { name: "CreditCard", label: "บัตรเครดิต" },
  { name: "Wallet", label: "กระเป๋าสตางค์" },
];

const PRESET_ACCOUNT_COLORS = [
  "#10B981", // Emerald
  "#059669", // Dark Green
  "#7C3AED", // SCB Purple
  "#3B82F6", // Blue
  "#F97316", // Orange (TrueMoney)
  "#EF4444", // Red
  "#6366F1", // Indigo
  "#06B6D4", // Cyan
  "#64748B", // Slate
];

const ACCOUNT_TYPE_LABELS: Record<Account["type"], string> = {
  cash: "เงินสด",
  bank: "บัญชีธนาคาร",
  credit: "บัตรเครดิต",
  "e-wallet": "กระเป๋าเงินดิจิทัล",
  other: "อื่นๆ",
};

export function AccountView({
  accounts,
  allTransactions = [],
  onAddAccount,
  onDeleteAccount,
}: AccountViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<Account["type"]>("bank");
  const [icon, setIcon] = useState("Landmark");
  const [color, setColor] = useState("#059669");
  const [initialBalance, setInitialBalance] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Calculate balance for each account
  const accountBalances = useMemo(() => {
    const balances: Record<string, number> = {};
    accounts.forEach((acc) => {
      balances[acc.id] = Number(acc.initial_balance || 0);
    });

    allTransactions.forEach((tx) => {
      const accId = tx.account_id || "acc-cash";
      if (balances[accId] === undefined) {
        balances[accId] = 0;
      }
      const amt = parseFloat(String(tx.amount)) || 0;
      if (tx.type === "income") {
        balances[accId] += amt;
      } else {
        balances[accId] -= amt;
      }
    });

    return balances;
  }, [accounts, allTransactions]);

  const totalBalance = useMemo(() => {
    return Object.values(accountBalances).reduce((sum, b) => sum + b, 0);
  }, [accountBalances]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("กรุณาระบุชื่อบัญชีหรือกระเป๋าเงิน");
      return;
    }
    if (!onAddAccount) return;

    try {
      setIsSubmitting(true);
      setErrorMsg("");
      await onAddAccount({
        name: name.trim(),
        type,
        icon,
        color,
        initial_balance: parseFloat(initialBalance) || 0,
        is_default: false,
      });
      setName("");
      setInitialBalance("0");
      setIsAdding(false);
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการบันทึกบัญชี");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, accName: string) => {
    if (!onDeleteAccount) return;
    if (confirm(`คุณต้องการลบบัญชี "${accName}" ใช่หรือไม่? รายการธุรกรรมที่ผูกกับบัญชีนี้จะไม่ถูกลบ`)) {
      await onDeleteAccount(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">บัญชี & กระเป๋าเงิน</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              จัดการกระเป๋าเงิน บัญชีธนาคาร และบัตรเครดิต พร้อมติดตามยอดคงเหลือ
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm hover:shadow transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          เพิ่มบัญชีใหม่
        </button>
      </div>

      {/* Total Assets Summary Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs sm:text-sm text-indigo-200 font-medium">ยอดเงินรวมทุกบัญชี (Total Assets)</p>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
            ฿{formatCurrency(totalBalance)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-xs text-xs font-semibold">
            ทั้งหมด {accounts.length} บัญชี
          </span>
        </div>
      </div>

      {/* Add New Account Popup Modal */}
      {isAdding && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsAdding(false)}
        >
          <div 
            className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 p-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  +
                </div>
                <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                  เพิ่มบัญชีหรือกระเป๋าเงินใหม่
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">ชื่อบัญชี / ธนาคาร</label>
                  <input
                    type="text"
                    placeholder="เช่น กสิกรไทย, SCB, เงินสด..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">ประเภทบัญชี</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as Account["type"])}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="bank">บัญชีธนาคาร (Bank Account)</option>
                    <option value="cash">เงินสด (Cash)</option>
                    <option value="credit">บัตรเครดิต (Credit Card)</option>
                    <option value="e-wallet">กระเป๋าเงินดิจิทัล (E-Wallet)</option>
                    <option value="other">อื่นๆ (Other)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">ยอดเงินเริ่มต้น (บาท)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="w-full sm:w-64 px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Colors */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">เลือกโทนสีประจำบัญชี</label>
                <div className="flex flex-wrap gap-2.5">
                  {PRESET_ACCOUNT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        "w-8 h-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center shadow-2xs",
                        color === c ? "ring-2 ring-offset-2 ring-indigo-600 scale-105" : ""
                      )}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icons */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">เลือกไอคอน</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_ACCOUNT_ICONS.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setIcon(item.name)}
                      className={cn(
                        "px-3 py-2 rounded-xl border flex items-center gap-2 text-xs font-medium transition-all",
                        icon === item.name
                          ? "border-indigo-600 bg-indigo-50 text-indigo-600 ring-1 ring-indigo-600"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <CategoryIcon name={item.name} size={16} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกบัญชีนี้"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const balance = accountBalances[acc.id] ?? Number(acc.initial_balance || 0);
          return (
            <div
              key={acc.id}
              className="group relative bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0"
                    style={{ backgroundColor: acc.color }}
                  >
                    <CategoryIcon name={acc.icon} size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">{acc.name}</h4>
                    <span className="inline-block text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md mt-0.5">
                      {ACCOUNT_TYPE_LABELS[acc.type] || "ทั่วไป"}
                    </span>
                  </div>
                </div>

                {!acc.is_default && onDeleteAccount && (
                  <button
                    onClick={() => handleDelete(acc.id, acc.name)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="ลบบัญชีนี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-xs text-slate-400 font-medium">ยอดเงินคงเหลือ</span>
                <span className={cn("text-lg font-bold tabular-nums", balance < 0 ? "text-rose-600" : "text-slate-800")}>
                  ฿{formatCurrency(balance)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
