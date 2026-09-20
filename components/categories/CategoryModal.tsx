"use client";

import React, { useState } from "react";
import { Category, TransactionType } from "@/types/database";
import { X, Tag, Plus, Check } from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory?: (cat: Omit<Category, "id">) => Promise<void>;
}

const PRESET_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#10B981", "#06B6D4",
  "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#64748B"
];

const PRESET_ICONS = [
  "Utensils", "Car", "ShoppingBag", "Home", "HeartPulse", "Tv",
  "Banknote", "Briefcase", "Laptop", "TrendingUp", "Gift", "Coffee",
  "Sparkles", "Fuel", "Plane", "BookOpen", "Smartphone", "CircleDot"
];

export function CategoryModal({ isOpen, onClose, categories, onAddCategory }: CategoryModalProps) {
  const [activeTab, setActiveTab] = useState<TransactionType>("expense");
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState(PRESET_ICONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const currentList = categories.filter((c) => c.type === activeTab);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("กรุณากรอกชื่อหมวดหมู่");
      return;
    }
    setErrorMsg("");
    try {
      setIsSubmitting(true);
      if (onAddCategory) {
        await onAddCategory({
          name: name.trim(),
          type: activeTab,
          color,
          icon,
          is_default: false,
        });
      }
      setName("");
      setIsAdding(false);
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการบันทึกหมวดหมู่");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 p-6 max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-base md:text-lg flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-600" /> จัดการหมวดหมู่
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl my-3.5">
          <button
            type="button"
            onClick={() => { setActiveTab("expense"); setIsAdding(false); }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "expense"
                ? "bg-white text-rose-600 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            หมวดหมู่รายจ่าย ({categories.filter((c) => c.type === "expense").length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("income"); setIsAdding(false); }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "income"
                ? "bg-white text-emerald-600 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            หมวดหมู่รายรับ ({categories.filter((c) => c.type === "income").length})
          </button>
        </div>

        {/* Add Category Trigger / Form */}
        {isAdding ? (
          <form onSubmit={handleSave} className="mb-3.5 p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                เพิ่มหมวดหมู่{activeTab === "expense" ? "รายจ่าย" : "รายรับ"}ใหม่
              </span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ยกเลิก
              </button>
            </div>

            {errorMsg && <p className="text-xs text-rose-500 font-medium">{errorMsg}</p>}

            <div>
              <input
                type="text"
                placeholder="เช่น ค่ากาแฟ, ค่าผ่อนบ้าน, ค่าดูแลสัตว์เลี้ยง..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Colors */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1.5">เลือกสี</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${
                      color === c ? "ring-2 ring-offset-2 ring-indigo-600 scale-105" : ""
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Icons */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1.5">เลือกไอคอน</label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200/80">
                {PRESET_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      icon === ic ? "bg-indigo-100 text-indigo-600 ring-1 ring-indigo-500" : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    <CategoryIcon name={ic} size={16} />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "กำลังบันทึก..." : "+ บันทึกหมวดหมู่"}
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="mb-3 py-2 px-3 rounded-xl border border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 text-indigo-600 hover:text-indigo-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> + เพิ่มหมวดหมู่{activeTab === "expense" ? "รายจ่าย" : "รายรับ"}ใหม่
          </button>
        )}

        {/* List */}
        <div className="overflow-y-auto space-y-2 flex-1 pr-1">
          {currentList.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
                  style={{ backgroundColor: cat.color }}
                >
                  <CategoryIcon name={cat.icon} size={18} />
                </div>
                <div>
                  <p className="font-semibold text-xs text-slate-800">{cat.name}</p>
                  <span className="text-[10px] text-slate-400">
                    {cat.is_default ? "หมวดหมู่เริ่มต้น" : "หมวดหมู่กำหนดเอง"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
