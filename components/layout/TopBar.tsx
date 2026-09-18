"use client";

import React from "react";
import { Wallet, ChevronLeft, ChevronRight, User, Plus } from "lucide-react";

export interface TopBarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onOpenNewTransaction: () => void;
  onOpenAuth: () => void;
  isSupabaseOnline: boolean;
  user: any;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentDate,
  onDateChange,
  onOpenNewTransaction,
  onOpenAuth,
  isSupabaseOnline,
  user,
}) => {
  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  
  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const currentYear = currentDate.getFullYear() + 543;
  const currentMonthName = monthNames[currentDate.getMonth()];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-black/[0.06] px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
          <Wallet size={18} />
        </div>
        <span className="font-bold text-[#1D1D1F] text-lg hidden sm:block">FinTrack</span>
      </div>

      <div className="hidden sm:flex items-center gap-1 bg-black/[0.02] rounded-xl p-1">
        <button 
          onClick={handlePrevMonth}
          className="p-1.5 rounded-lg hover:bg-black/[0.04] transition-colors text-[#6E6E73] hover:text-[#1D1D1F]"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="px-3 text-sm font-medium text-[#1D1D1F] min-w-[120px] text-center">
          {currentMonthName} {currentYear}
        </span>
        <button 
          onClick={handleNextMonth}
          className="p-1.5 rounded-lg hover:bg-black/[0.04] transition-colors text-[#6E6E73] hover:text-[#1D1D1F]"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2">
          {isSupabaseOnline ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              เชื่อมต่อ
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Demo
            </span>
          )}
        </div>

        <button 
          onClick={onOpenAuth}
          className="w-9 h-9 rounded-xl hover:bg-black/[0.04] flex items-center justify-center text-[#6E6E73] transition-colors"
        >
          {user ? (
             <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold uppercase">
               {user.email ? user.email.charAt(0) : <User size={16} />}
             </div>
          ) : (
            <User size={20} />
          )}
        </button>

        <button 
          onClick={onOpenNewTransaction}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">+ บันทึก</span>
        </button>
      </div>
    </header>
  );
};
