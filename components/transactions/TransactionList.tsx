"use client";

import React, { useState, useMemo } from "react";
import { Transaction, Category } from "@/types/database";
import { formatCurrency, formatThaiDate } from "@/lib/utils";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Search, Trash2, ArrowUpRight, ArrowDownLeft, SlidersHorizontal, ReceiptText, X, Pencil } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onDelete: (id: string) => void;
  onEdit?: (tx: Transaction) => void;
  onOpenNewModal?: () => void;
}

export function TransactionList({
  transactions,
  categories,
  onDelete,
  onEdit,
}: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type match
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;

      // Category match
      if (categoryFilter !== "all" && tx.category_id !== categoryFilter) return false;

      // Search match (note or category name)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const noteMatch = tx.note?.toLowerCase().includes(query);
        const catMatch = tx.category?.name.toLowerCase().includes(query);
        if (!noteMatch && !catMatch) return false;
      }

      return true;
    });
  }, [transactions, typeFilter, categoryFilter, searchTerm]);

  const hasActiveFilters = typeFilter !== "all" || categoryFilter !== "all" || searchTerm.trim().length > 0;

  return (
    <div className="rounded-2xl bg-white p-4 md:p-6 shadow-sm border border-slate-100 flex-1 flex flex-col min-h-0">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 shrink-0">
        <div>
          <h3 className="font-bold text-slate-800 text-base md:text-lg">ประวัติรายการ</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {transactions.length === 0
              ? "ยังไม่มีรายการในเดือนนี้"
              : hasActiveFilters
              ? `พบ ${filteredTransactions.length} จาก ${transactions.length} รายการ`
              : `ทั้งหมด ${transactions.length} รายการ`}
          </p>
        </div>

        {transactions.length > 0 && (
          <div className="flex items-center gap-2">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหารายการ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* ปุ่มสลับตัวกรอง */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                showFilters || typeFilter !== "all" || categoryFilter !== "all"
                  ? "bg-blue-50 border-blue-200 text-blue-600"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>ตัวกรอง</span>
            </button>
          </div>
        )}
      </div>

      {/* แถบตัวกรองเพิ่มเติมเมื่อเปิด */}
      {showFilters && transactions.length > 0 && (
        <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-wrap items-center gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">ประเภท:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-2.5 py-1 rounded-md ${
                  typeFilter === "all" ? "bg-slate-800 text-white font-semibold" : "text-slate-600"
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setTypeFilter("income")}
                className={`px-2.5 py-1 rounded-md ${
                  typeFilter === "income" ? "bg-emerald-600 text-white font-semibold" : "text-slate-600"
                }`}
              >
                รายรับ
              </button>
              <button
                onClick={() => setTypeFilter("expense")}
                className={`px-2.5 py-1 rounded-md ${
                  typeFilter === "expense" ? "bg-rose-500 text-white font-semibold" : "text-slate-600"
                }`}
              >
                รายจ่าย
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">หมวดหมู่:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1 px-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setTypeFilter("all");
                setCategoryFilter("all");
                setSearchTerm("");
              }}
              className="text-rose-500 hover:underline text-xs ml-auto font-medium"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>
      )}

      {/* รายการประวัติ */}
      <div className="mt-4 flex-1 flex flex-col min-h-0">
        {filteredTransactions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
            {transactions.length === 0 ? (
              // กรณีในเดือนนี้ไม่มีรายการเลย
              <div className="flex flex-col items-center max-w-xs animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-3 shadow-xs">
                  <ReceiptText className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 mb-1">
                  ยังไม่มีรายการในเดือนนี้
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  เริ่มบันทึกรายรับหรือรายจ่าย โดยแตะที่ปุ่ม <span className="font-bold text-blue-600">+</span> ด้านล่างหน้าจอ
                </p>
              </div>
            ) : (
              // กรณีค้นหาหรือกรองแล้วไม่พบ
              <div className="flex flex-col items-center max-w-xs animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
                  <Search className="w-7 h-7 stroke-[1.5]" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 mb-1">
                  ไม่พบรายการที่ตรงกับเงื่อนไข
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  ลองค้นหาด้วยคำอื่น หรือกดล้างตัวกรองเพื่อดูรายการทั้งหมด
                </p>
                <button
                  onClick={() => {
                    setTypeFilter("all");
                    setCategoryFilter("all");
                    setSearchTerm("");
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/60 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-3">
                {/* Category Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-xs"
                  style={{ backgroundColor: tx.category?.color || "#64748B" }}
                >
                  <CategoryIcon
                    name={tx.category?.icon || "CircleDot"}
                    size={18}
                    className="w-4 h-4 text-white"
                  />
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-xs md:text-sm">
                      {tx.category?.name || "ไม่ระบุหมวดหมู่"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      • {formatThaiDate(tx.transaction_date, false)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs md:max-w-md">
                    {tx.note || (tx.type === "income" ? "รายรับทั่วไป" : "ค่าใช้จ่ายทั่วไป")}
                  </p>
                </div>
              </div>

              {/* Amount & Delete Action */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div
                    className={`font-bold text-xs md:text-sm flex items-center justify-end gap-0.5 ${
                      tx.type === "income" ? "text-emerald-600" : "text-rose-500"
                    }`}
                  >
                    {tx.type === "income" ? (
                      <ArrowUpRight className="w-3.5 h-3.5 inline" />
                    ) : (
                      <ArrowDownLeft className="w-3.5 h-3.5 inline" />
                    )}
                    <span>{formatCurrency(Number(tx.amount))}</span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                      title="แก้ไขรายการ"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm("คุณต้องการลบรายการนี้ใช่หรือไม่?")) {
                        onDelete(tx.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                    title="ลบรายการ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
