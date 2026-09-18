"use client";

import React from "react";
import { formatThaiMonthYear, THAI_MONTHS } from "@/lib/utils";
import {
  Wallet,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  User,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  ListOrdered,
  Layers,
} from "lucide-react";

interface NavbarProps {
  currentDate: Date;
  onDateChange: (d: Date) => void;
  activeTab: "dashboard" | "calendar" | "transactions";
  onTabChange: (tab: "dashboard" | "calendar" | "transactions") => void;
  onOpenNewTransaction: () => void;
  onOpenAuth: () => void;
  onOpenCategories: () => void;
  isSupabaseOnline: boolean;
  user: any;
}

export function Navbar({
  currentDate,
  onDateChange,
  activeTab,
  onTabChange,
  onOpenNewTransaction,
  onOpenAuth,
  onOpenCategories,
  isSupabaseOnline,
  user,
}: NavbarProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    onDateChange(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    onDateChange(new Date(year, month + 1, 1));
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-black/[0.06] shadow-none">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-sm md:text-base leading-tight">
              ระบบบันทึกรายรับ-รายจ่าย
            </h1>
            <p className="text-[11px] text-slate-400">ภาพรวมการเงินประจำเดือน</p>
          </div>
        </div>

        {/* Month Selector in Desktop / Center */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-100/70 border border-slate-200/70 rounded-xl p-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-600 hover:text-slate-900"
            title="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 text-xs md:text-sm font-semibold text-slate-700 min-w-[130px] text-center">
            {formatThaiMonthYear(year, month)}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-600 hover:text-slate-900"
            title="เดือนถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Actions & Connection status */}
        <div className="flex items-center gap-2">
          {/* Status Badge (สไตล์เดียวกับ Mockup ที่มี 'เชื่อมต่อ Google Sheets แล้ว' หรือ 'Supabase') */}
          <button
            onClick={onOpenAuth}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              isSupabaseOnline
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {isSupabaseOnline ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>เชื่อมต่อ Supabase แล้ว</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>โหมดจำลอง (Demo)</span>
              </>
            )}
          </button>

          {/* Quick Categories */}
          <button
            onClick={onOpenCategories}
            className="hidden sm:flex p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="หมวดหมู่ทั้งหมด"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* User Profile / Auth */}
          <button
            onClick={onOpenAuth}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title={user ? user.email : "เข้าสู่ระบบ"}
          >
            <User className="w-4 h-4" />
          </button>

          {/* Primary Action: "+ บันทึกรายการใหม่" */}
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">บันทึกรายการใหม่</span>
            <span className="sm:hidden">บันทึก</span>
          </button>
        </div>
      </div>

      {/* Desktop Navigation Tabs */}
      <div className="hidden sm:block border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-2">
          <button
            onClick={() => onTabChange("dashboard")}
            className={`py-2.5 px-4 text-xs md:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "dashboard"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            ภาพรวม (Dashboard)
          </button>
          <button
            onClick={() => onTabChange("calendar")}
            className={`py-2.5 px-4 text-xs md:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "calendar"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            ปฏิทินรายรับ-จ่าย
          </button>
          <button
            onClick={() => onTabChange("transactions")}
            className={`py-2.5 px-4 text-xs md:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "transactions"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            บันทึกรายการ & ประวัติ
          </button>
        </div>
      </div>
    </header>
  );
}
