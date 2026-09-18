"use client";

import React, { useState } from "react";
import { Category, TransactionType } from "@/types/database";
import { X, Tag, Plus } from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

export function CategoryModal({ isOpen, onClose, categories }: CategoryModalProps) {
  const [activeTab, setActiveTab] = useState<TransactionType>("expense");

  if (!isOpen) return null;

  const currentList = categories.filter((c) => c.type === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 p-6 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-base md:text-lg flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600" /> หมวดหมู่ทั้งหมด
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl my-4">
          <button
            type="button"
            onClick={() => setActiveTab("expense")}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "expense"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            หมวดหมู่รายจ่าย ({categories.filter((c) => c.type === "expense").length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("income")}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "income"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            หมวดหมู่รายรับ ({categories.filter((c) => c.type === "income").length})
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto space-y-2 flex-1 pr-1">
          {currentList.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: cat.color }}
                >
                  <CategoryIcon name={cat.icon} size={18} />
                </div>
                <div>
                  <p className="font-semibold text-xs text-slate-800">{cat.name}</p>
                  <span className="text-[10px] text-slate-400">
                    {cat.type === "income" ? "รายรับ" : "รายจ่าย"}
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
