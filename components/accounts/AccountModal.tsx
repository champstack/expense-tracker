"use client";

import React, { useState } from "react";
import { Account, DEFAULT_ACCOUNTS } from "@/types/database";
import { X, Plus, Trash2, Wallet, Landmark, Building2, CreditCard, Smartphone, Banknote } from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
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

export function AccountModal({
  isOpen,
  onClose,
  accounts,
  onAddAccount,
  onDeleteAccount,
}: AccountModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<Account["type"]>("bank");
  const [icon, setIcon] = useState("Landmark");
  const [color, setColor] = useState("#059669");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

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
        initial_balance: 0,
        is_default: false,
      });
      setName("");
      setShowAddForm(false);
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการสร้างบัญชี");
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultAccounts = accounts.filter((a) => a.is_default);
  const customAccounts = accounts.filter((a) => !a.is_default);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">จัดการบัญชี / กระเป๋าเงิน</h3>
              <p className="text-xs text-slate-400">กำหนดแหล่งที่มาของเงิน (เงินสด, ธนาคาร, บัตร)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Add Account Toggle Button */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-600 text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              เพิ่มบัญชีใหม่
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 space-y-3.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900">เพิ่มบัญชีใหม่</span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  ยกเลิก
                </button>
              </div>

              {errorMsg && (
                <div className="text-xs text-rose-600 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200">
                  {errorMsg}
                </div>
              )}

              {/* ชื่อบัญชี */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อบัญชี / กระเป๋าเงิน</label>
                <input
                  type="text"
                  placeholder="เช่น บัญชีเงินเดือน กสิกร, บัตรเครดิต KTC..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  autoFocus
                />
              </div>

              {/* ประเภทบัญชี */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ประเภท</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="bank">ธนาคาร (Bank)</option>
                  <option value="cash">เงินสด (Cash)</option>
                  <option value="e-wallet">กระเป๋าเงินดิจิทัล (E-Wallet)</option>
                  <option value="credit">บัตรเครดิต (Credit Card)</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>

              {/* เลือกไอคอน */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">ไอคอน</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_ACCOUNT_ICONS.map((ic) => (
                    <button
                      type="button"
                      key={ic.name}
                      onClick={() => setIcon(ic.name)}
                      className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 text-xs ${
                        icon === ic.name
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs font-medium"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <CategoryIcon name={ic.name} size={14} />
                      <span>{ic.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* เลือกสี */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">สีประจำบัญชี</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_ACCOUNT_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        color === c ? "scale-110 border-indigo-600 ring-2 ring-indigo-200" : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "กำลังบันทึก..." : "บันทึกบัญชี"}
              </button>
            </form>
          )}

          {/* รายการบัญชีกำหนดเอง */}
          {customAccounts.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                บัญชีกำหนดเอง ({customAccounts.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {customAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 shadow-2xs transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: acc.color || "#64748B" }}
                      >
                        <CategoryIcon name={acc.icon || "Wallet"} size={16} className="text-white" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 truncate">{acc.name}</span>
                    </div>
                    {onDeleteAccount && (
                      <button
                        onClick={() => {
                          if (confirm(`ลบบัญชี "${acc.name}"?`)) {
                            onDeleteAccount(acc.id);
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                        title="ลบบัญชีนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* รายการบัญชีเริ่มต้น */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              บัญชีเริ่มต้น ({defaultAccounts.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {defaultAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50/50"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: acc.color || "#64748B" }}
                  >
                    <CategoryIcon name={acc.icon || "Wallet"} size={16} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 truncate">{acc.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
