"use client";

import React, { useState, useEffect } from "react";
import { Account, Category, Transaction, TransactionType } from "@/types/database";
import { X, Plus, Trash2, Calendar, DollarSign, Tag, FileText, CheckCircle2, Pencil, Wallet, ChevronDown, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

export interface NewEntryItem {
  id: string;
  type: TransactionType;
  category_id: string;
  account_id: string;
  amount: string;
  note: string;
}

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  accounts?: Account[];
  initialDate?: string;
  editingTransaction?: Transaction | null;
  onUpdateTransaction?: (
    id: string,
    item: {
      type: TransactionType;
      category_id: string;
      account_id?: string;
      amount: number;
      transaction_date: string;
      note: string;
    }
  ) => Promise<void>;
  onSubmitBatch: (
    items: {
      type: TransactionType;
      category_id: string;
      account_id?: string;
      amount: number;
      transaction_date: string;
      note: string;
    }[]
  ) => Promise<void>;
}

export function TransactionFormModal({
  isOpen,
  onClose,
  categories,
  accounts = [],
  initialDate,
  editingTransaction,
  onUpdateTransaction,
  onSubmitBatch,
}: TransactionFormModalProps) {
  const [date, setDate] = useState<string>(
    initialDate || new Date().toISOString().split("T")[0]
  );

  const defaultAccountId = accounts[0]?.id || "acc-cash";

  const [items, setItems] = useState<NewEntryItem[]>([
    {
      id: "item-1",
      type: "expense",
      category_id: "",
      account_id: defaultAccountId,
      amount: "",
      note: "",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isEditing = Boolean(editingTransaction);

  useEffect(() => {
    if (editingTransaction) {
      setDate(editingTransaction.transaction_date);
      setItems([
        {
          id: "edit-item",
          type: editingTransaction.type,
          category_id: editingTransaction.category_id || (categories.find((c) => c.type === editingTransaction.type)?.id || ""),
          account_id: editingTransaction.account_id || defaultAccountId,
          amount: String(editingTransaction.amount),
          note: editingTransaction.note || "",
        },
      ]);
    } else if (initialDate) {
      setDate(initialDate);
      const defaultExp = categories.find((c) => c.type === "expense")?.id || categories[0]?.id || "";
      setItems([{ id: "item-1", type: "expense", category_id: defaultExp, account_id: defaultAccountId, amount: "", note: "" }]);
    }
  }, [editingTransaction, initialDate, categories, defaultAccountId]);

  useEffect(() => {
    if (!editingTransaction && categories.length > 0 && items[0]?.category_id === "") {
      const defaultExp = categories.find((c) => c.type === "expense")?.id || categories[0].id;
      setItems([{ id: "item-1", type: "expense", category_id: defaultExp, account_id: defaultAccountId, amount: "", note: "" }]);
    }
  }, [categories, editingTransaction, defaultAccountId]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const defaultExp = categories.find((c) => c.type === "expense")?.id || categories[0]?.id || "";
    setItems((prev) => [
      ...prev,
      {
        id: "item-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
        type: "expense",
        category_id: defaultExp,
        account_id: defaultAccountId,
        amount: "",
        note: "",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof NewEntryItem, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };

      // เมื่อเปลี่ยน type ให้ปรับ default category_id ให้ตรงกับประเภทใหม่
      if (field === "type") {
        const matchCat = categories.find((c) => c.type === value)?.id || "";
        copy[index].category_id = matchCat;
      }
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validate
    const payload = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const amt = parseFloat(it.amount);
      if (isNaN(amt) || amt <= 0) {
        setErrorMsg(`กรุณากรอกจำนวนเงินให้ถูกต้องในรายการที่ ${i + 1}`);
        return;
      }
      if (!it.category_id) {
        setErrorMsg(`กรุณาเลือกหมวดหมู่ในรายการที่ ${i + 1}`);
        return;
      }
      payload.push({
        type: it.type,
        category_id: it.category_id,
        account_id: it.account_id || defaultAccountId,
        amount: amt,
        transaction_date: date,
        note: it.note.trim(),
      });
    }

    try {
      setIsSubmitting(true);
      if (isEditing && editingTransaction && onUpdateTransaction) {
        await onUpdateTransaction(editingTransaction.id, payload[0]);
      } else {
        await onSubmitBatch(payload);
      }
      onClose();
      // Reset form
      const defaultExp = categories.find((c) => c.type === "expense")?.id || categories[0]?.id || "";
      setItems([{ id: "item-1", type: "expense", category_id: defaultExp, account_id: defaultAccountId, amount: "", note: "" }]);
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const formatDisplayDate = (dStr: string) => {
    if (!dStr) return "";
    const parts = dStr.split("-");
    if (parts.length === 3) {
      const d = parseInt(parts[2], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[0], 10) + 543;
      const monthNames = [
        "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
        "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
      ];
      return `${d} ${monthNames[m]} ${y}`;
    }
    return dStr;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-white">
          <div>
            <h3 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
              {isEditing ? (
                <>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <span>แก้ไขรายการ</span>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span>บันทึกรายการใหม่</span>
                </>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 ml-10">
              {isEditing ? "อัปเดตข้อมูลรายการของคุณ" : "บันทึกรายรับหรือรายจ่ายลงในระบบ"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {/* วันที่บันทึก */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">วันที่ทำรายการ</span>
                <span className="text-xs font-bold text-slate-700">{formatDisplayDate(date)}</span>
              </div>
            </div>
            <div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-2xs"
              />
            </div>
          </div>

          {/* รายการ Input Cards */}
          <div className="space-y-4">
            {items.map((item, index) => {
              const currentCategoryList = categories.filter((c) => c.type === item.type);
              const selectedCat = categories.find((c) => c.id === item.category_id);
              const selectedAcc = accounts.find((a) => a.id === (item.account_id || defaultAccountId));

              return (
                <div
                  key={item.id}
                  className="relative p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-4 transition-all"
                >
                  {/* แถบหัวรายการ (หากมีมากกว่า 1 รายการ) */}
                  {!isEditing && items.length > 1 && (
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70">
                      <span className="text-xs font-bold text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded-md">
                        รายการที่ {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-md hover:bg-rose-50 transition-colors flex items-center gap-1 text-xs"
                        title="ลบช่องนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">ลบรายการ</span>
                      </button>
                    </div>
                  )}

                  {/* สลับประเภท รายรับ / รายจ่าย */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/60 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleItemChange(index, "type", "expense")}
                      className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        item.type === "expense"
                          ? "bg-rose-500 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      <span>รายจ่าย</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleItemChange(index, "type", "income")}
                      className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        item.type === "income"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>รายรับ</span>
                    </button>
                  </div>

                  {/* จำนวนเงิน (Hero Input) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" /> จำนวนเงิน
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">บาท (THB)</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-base font-bold text-slate-400 pointer-events-none select-none">
                        ฿
                      </div>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        placeholder="0.00"
                        value={item.amount}
                        onChange={(e) => handleItemChange(index, "amount", e.target.value)}
                        required
                        autoFocus={index === 0 && !isEditing}
                        className={`w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-lg font-bold text-slate-800 placeholder:text-slate-300 bg-white transition-all focus:outline-none focus:ring-2 ${
                          item.type === "expense"
                            ? "focus:ring-rose-500/20 focus:border-rose-400"
                            : "focus:ring-emerald-500/20 focus:border-emerald-400"
                        }`}
                      />
                    </div>
                  </div>

                  {/* หมวดหมู่ & บัญชี/กระเป๋าเงิน (2-Column Grid) */}
                  <div className={accounts.length > 0 ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-3"}>
                    {/* หมวดหมู่ */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-slate-400" /> หมวดหมู่
                      </label>
                      <div className="relative">
                        <select
                          value={item.category_id}
                          onChange={(e) => handleItemChange(index, "category_id", e.target.value)}
                          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none transition-all cursor-pointer"
                        >
                          {currentCategoryList.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <div
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none w-6 h-6 rounded-md flex items-center justify-center transition-colors"
                          style={{
                            backgroundColor: selectedCat?.color ? `${selectedCat.color}18` : "#f1f5f9",
                            color: selectedCat?.color || "#64748b",
                          }}
                        >
                          <CategoryIcon
                            name={selectedCat?.icon || "CircleDot"}
                            size={14}
                          />
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* บัญชี / กระเป๋าเงิน */}
                    {accounts.length > 0 && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                          <Wallet className="w-3.5 h-3.5 text-slate-400" /> บัญชี / กระเป๋าเงิน
                        </label>
                        <div className="relative">
                          <select
                            value={item.account_id || defaultAccountId}
                            onChange={(e) => handleItemChange(index, "account_id", e.target.value)}
                            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none transition-all cursor-pointer"
                          >
                            {accounts.map((acc) => (
                              <option key={acc.id} value={acc.id}>
                                {acc.name}
                              </option>
                            ))}
                          </select>
                          <div
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none w-6 h-6 rounded-md flex items-center justify-center transition-colors"
                            style={{
                              backgroundColor: selectedAcc?.color ? `${selectedAcc.color}18` : "#ede9fe",
                              color: selectedAcc?.color || "#6366f1",
                            }}
                          >
                            <CategoryIcon
                              name={selectedAcc?.icon || "Banknote"}
                              size={14}
                            />
                          </div>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* บันทึกช่วยจำ */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" /> บันทึกช่วยจำ / รายละเอียด
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น ข้าวกลางวัน, กาแฟ, ค่าเดินทาง, เงินเดือน..."
                      value={item.note}
                      onChange={(e) => handleItemChange(index, "note", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            {!isEditing && (
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-slate-500" /> เพิ่มช่องกรอก
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 py-2.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99]"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting
                ? "กำลังบันทึก..."
                : isEditing
                ? "บันทึกการแก้ไข"
                : items.length > 1
                ? `บันทึกทั้งหมด (${items.length} รายการ)`
                : "บันทึกรายการ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
