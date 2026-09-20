"use client";

import React, { useState, useEffect } from "react";
import { Category, Transaction, TransactionType } from "@/types/database";
import { X, Plus, Trash2, Calendar, DollarSign, Tag, FileText, CheckCircle2, Pencil } from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

export interface NewEntryItem {
  id: string;
  type: TransactionType;
  category_id: string;
  amount: string;
  note: string;
}

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialDate?: string;
  editingTransaction?: Transaction | null;
  onUpdateTransaction?: (
    id: string,
    item: {
      type: TransactionType;
      category_id: string;
      amount: number;
      transaction_date: string;
      note: string;
    }
  ) => Promise<void>;
  onSubmitBatch: (
    items: {
      type: TransactionType;
      category_id: string;
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
  initialDate,
  editingTransaction,
  onUpdateTransaction,
  onSubmitBatch,
}: TransactionFormModalProps) {
  const [date, setDate] = useState<string>(
    initialDate || new Date().toISOString().split("T")[0]
  );

  const [items, setItems] = useState<NewEntryItem[]>([
    {
      id: "item-1",
      type: "expense",
      category_id: "",
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
          amount: String(editingTransaction.amount),
          note: editingTransaction.note || "",
        },
      ]);
    } else if (initialDate) {
      setDate(initialDate);
      const defaultExp = categories.find((c) => c.type === "expense")?.id || categories[0]?.id || "";
      setItems([{ id: "item-1", type: "expense", category_id: defaultExp, amount: "", note: "" }]);
    }
  }, [editingTransaction, initialDate, categories]);

  useEffect(() => {
    if (!editingTransaction && categories.length > 0 && items[0]?.category_id === "") {
      const defaultExp = categories.find((c) => c.type === "expense")?.id || categories[0].id;
      setItems([{ id: "item-1", type: "expense", category_id: defaultExp, amount: "", note: "" }]);
    }
  }, [categories, editingTransaction]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const defaultExp = categories.find((c) => c.type === "expense")?.id || categories[0]?.id || "";
    setItems((prev) => [
      ...prev,
      {
        id: "item-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
        type: "expense",
        category_id: defaultExp,
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
      setItems([{ id: "item-1", type: "expense", category_id: defaultExp, amount: "", note: "" }]);
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-base md:text-lg flex items-center gap-2">
            {isEditing ? (
              <>
                <Pencil className="w-5 h-5 text-indigo-600" /> แก้ไขรายการ
              </>
            ) : (
              "รายการใหม่"
            )}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {/* วันที่บันทึก */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              <Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> วันที่
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            />
          </div>

          {/* รายการ Input Cards */}
          <div className="space-y-4">
            {items.map((item, index) => {
              const currentCategoryList = categories.filter((c) => c.type === item.type);
              const selectedCat = categories.find((c) => c.id === item.category_id);

              return (
                <div
                  key={item.id}
                  className="relative p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3.5 transition-all"
                >
                  {/* แถบหัวรายการ (หากมีมากกว่า 1 รายการ หรือไม่ใช่โหมดแก้ไข) */}
                  {!isEditing && (
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <span className="text-xs font-bold text-slate-500">
                        รายการที่ {index + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded-md hover:bg-rose-50 transition-colors"
                          title="ลบช่องนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* สลับประเภท รายรับ / รายจ่าย */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/60 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleItemChange(index, "type", "expense")}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        item.type === "expense"
                          ? "bg-rose-500 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      รายจ่าย
                    </button>
                    <button
                      type="button"
                      onClick={() => handleItemChange(index, "type", "income")}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        item.type === "income"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      รายรับ
                    </button>
                  </div>

                  {/* หมวดหมู่ & จำนวนเงิน */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* หมวดหมู่ */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        <Tag className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> หมวดหมู่
                      </label>
                      <div className="relative">
                        <select
                          value={item.category_id}
                          onChange={(e) => handleItemChange(index, "category_id", e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        >
                          {currentCategoryList.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                          <CategoryIcon
                            name={selectedCat?.icon || "CircleDot"}
                            size={16}
                            className="text-slate-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* จำนวนเงิน */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        <DollarSign className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> จำนวนเงิน (บาท)
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        placeholder="0.00"
                        value={item.amount}
                        onChange={(e) => handleItemChange(index, "amount", e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                      />
                    </div>
                  </div>

                  {/* บันทึกช่วยจำ */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      <FileText className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> บันทึกช่วยจำ / รายละเอียด
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น ข้าวกลางวัน, ค่าน้ำมัน, เงินโอน..."
                      value={item.note}
                      onChange={(e) => handleItemChange(index, "note", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            {!isEditing && (
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-slate-500" /> เพิ่มช่องกรอก
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting
                ? "กำลังบันทึก..."
                : isEditing
                ? "บันทึกการแก้ไข"
                : `บันทึกทั้งหมด (${items.length} รายการ)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
