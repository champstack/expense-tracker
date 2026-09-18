"use client";

import React from "react";
import { LayoutDashboard, Calendar, ReceiptText, PiggyBank } from "lucide-react";

export type TabType = 'dashboard' | 'calendar' | 'transactions' | 'budget';

export interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard' as TabType, label: 'ภาพรวม', icon: LayoutDashboard },
    { id: 'calendar' as TabType, label: 'ปฏิทิน', icon: Calendar },
    { id: 'transactions' as TabType, label: 'รายการ', icon: ReceiptText },
    { id: 'budget' as TabType, label: 'งบประมาณ', icon: PiggyBank },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[220px] fixed left-0 top-[57px] bottom-0 bg-white border-r border-black/[0.06] p-4">
      <nav className="flex flex-col gap-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                isActive 
                  ? "bg-blue-50 text-blue-600 font-semibold" 
                  : "text-slate-500 hover:bg-black/[0.04] hover:text-slate-800"
              }`}
            >
              <Icon size={18} className={isActive ? "text-blue-600" : ""} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-3">
        <p className="text-xs text-slate-400">FinTrack v1.0</p>
      </div>
    </aside>
  );
};
