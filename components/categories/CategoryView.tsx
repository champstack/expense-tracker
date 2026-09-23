"use client";

import React, { useState } from "react";
import { Category, TransactionType } from "@/types/database";
import { Tag, Plus, Check, Trash2, Search, ArrowDownCircle, ArrowUpCircle, Layers, X } from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { cn } from "@/lib/utils";

interface CategoryViewProps {
  categories: Category[];
  onAddCategory?: (cat: Omit<Category, "id">) => Promise<void>;
  onDeleteCategory?: (id: string) => Promise<void>;
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

export function CategoryView({ categories, onAddCategory, onDeleteCategory }: CategoryViewProps) {
  const [selectedTab, setSelectedTab] = useState<"expense" | "income" | "all">("expense");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  // Add Form State
  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState(PRESET_ICONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const expenseCount = categories.filter((c) => c.type === "expense").length;
  const incomeCount = categories.filter((c) => c.type === "income").length;

  const filteredCategories = categories.filter((cat) => {
    const matchesTab = selectedTab === "all" || cat.type === selectedTab;
    const matchesSearch = !searchQuery.trim() || cat.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesTab && matchesSearch;
  });

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
          type,
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

  const handleDelete = async (id: string, catName: string) => {
    if (!onDeleteCategory) return;
    if (confirm(`คุณต้องการลบหมวดหมู่ "${catName}" หรือไม่?`)) {
      await onDeleteCategory(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">จัดการหมวดหมู่</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              สร้างและปรับแต่งหมวดหมู่สำหรับจัดกลุ่มรายรับและรายจ่ายของคุณ
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setType(selectedTab === "income" ? "income" : "expense");
            setIsAdding(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm hover:shadow transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          เพิ่มหมวดหมู่ใหม่
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div 
          onClick={() => setSelectedTab("expense")}
          className={cn(
            "p-4 rounded-xl border bg-white cursor-pointer transition-all flex items-center justify-between",
            selectedTab === "expense" ? "border-rose-400 ring-2 ring-rose-500/10 shadow-xs" : "border-slate-200/80 hover:border-slate-300"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">หมวดหมู่รายจ่าย</p>
              <p className="text-xl font-bold text-slate-800">{expenseCount}</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">รายจ่าย</span>
        </div>

        <div 
          onClick={() => setSelectedTab("income")}
          className={cn(
            "p-4 rounded-xl border bg-white cursor-pointer transition-all flex items-center justify-between",
            selectedTab === "income" ? "border-emerald-400 ring-2 ring-emerald-500/10 shadow-xs" : "border-slate-200/80 hover:border-slate-300"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">หมวดหมู่รายรับ</p>
              <p className="text-xl font-bold text-slate-800">{incomeCount}</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">รายรับ</span>
        </div>

        <div 
          onClick={() => setSelectedTab("all")}
          className={cn(
            "p-4 rounded-xl border bg-white cursor-pointer transition-all flex items-center justify-between",
            selectedTab === "all" ? "border-indigo-400 ring-2 ring-indigo-500/10 shadow-xs" : "border-slate-200/80 hover:border-slate-300"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">ทั้งหมด</p>
              <p className="text-xl font-bold text-slate-800">{categories.length}</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">ทั้งหมด</span>
        </div>
      </div>

      {/* Add New Category Popup Modal */}
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
                  เพิ่มหมวดหมู่ใหม่
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

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">ประเภทหมวดหมู่</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setType("expense")}
                      className={cn(
                        "py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                        type === "expense"
                          ? "bg-white text-rose-600 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      )}
                    >
                      <ArrowDownCircle className="w-4 h-4" />
                      รายจ่าย
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("income")}
                      className={cn(
                        "py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                        type === "income"
                          ? "bg-white text-emerald-600 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      )}
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                      รายรับ
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">ชื่อหมวดหมู่</label>
                  <input
                    type="text"
                    placeholder="เช่น ค่ากาแฟ, ท่องเที่ยว..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">เลือกโทนสี</label>
                <div className="flex flex-wrap gap-2.5">
                  {PRESET_COLORS.map((c) => (
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
                <label className="block text-xs font-bold text-slate-600 mb-1.5">เลือกไอคอนสัญลักษณ์</label>
                <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 max-h-36 overflow-y-auto">
                  {PRESET_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                        icon === ic
                          ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/30"
                          : "text-slate-600 hover:bg-white hover:shadow-2xs"
                      )}
                    >
                      <CategoryIcon name={ic} size={20} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
                  style={{ backgroundColor: color }}
                >
                  <CategoryIcon name={icon} size={22} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">ตัวอย่างหมวดหมู่</p>
                  <p className="text-sm font-bold text-slate-800">{name.trim() || "ชื่อหมวดหมู่ของคุณ"}</p>
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
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกหมวดหมู่นี้"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Control Bar: Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setSelectedTab("expense")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
              selectedTab === "expense"
                ? "bg-white text-rose-600 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            รายจ่าย ({expenseCount})
          </button>
          <button
            onClick={() => setSelectedTab("income")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
              selectedTab === "income"
                ? "bg-white text-emerald-600 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            รายรับ ({incomeCount})
          </button>
          <button
            onClick={() => setSelectedTab("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              selectedTab === "all"
                ? "bg-white text-indigo-600 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            ทั้งหมด ({categories.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาหมวดหมู่..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="group relative bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0 transition-transform group-hover:scale-105"
                style={{ backgroundColor: cat.color }}
              >
                <CategoryIcon name={cat.icon} size={20} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-800 truncate">{cat.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                      cat.type === "expense" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                    )}
                  >
                    {cat.type === "expense" ? "รายจ่าย" : "รายรับ"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {cat.is_default ? "ค่าเริ่มต้น" : "กำหนดเอง"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions for custom categories */}
            {!cat.is_default && onDeleteCategory && (
              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shrink-0"
                title="ลบหมวดหมู่นี้"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/60 p-8">
          <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold text-sm">ไม่พบหมวดหมู่ที่ตรงกับการค้นหา</p>
          <p className="text-slate-400 text-xs mt-1">ลองเปลี่ยนคำค้นหา หรือกดปุ่ม "เพิ่มหมวดหมู่ใหม่"</p>
        </div>
      )}
    </div>
  );
}
