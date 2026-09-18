"use client";

import React from "react";
import { LayoutDashboard, Calendar, Plus, ReceiptText, PiggyBank } from "lucide-react";

export type TabType = 'dashboard' | 'calendar' | 'transactions' | 'budget';

export interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenNewTransaction: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onOpenNewTransaction }) => {
  const navItemsLeft = [
    { id: 'dashboard' as TabType, label: 'ภาพรวม', icon: LayoutDashboard },
    { id: 'calendar' as TabType, label: 'ปฏิทิน', icon: Calendar },
  ];
  
  const navItemsRight = [
    { id: 'transactions' as TabType, label: 'รายการ', icon: ReceiptText },
    { id: 'budget' as TabType, label: 'งบประมาณ', icon: PiggyBank },
  ];

  const renderItem = (item: { id: TabType, label: string, icon: React.ElementType }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => onTabChange(item.id)}
        className={`flex flex-col items-center justify-center w-full py-1 ${
          isActive ? "text-blue-600" : "text-slate-400"
        }`}
      >
        <Icon size={20} className={isActive ? "mb-1" : "mb-1"} />
        <span className="text-[10px] font-medium">{item.label}</span>
      </button>
    );
  };

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-black/[0.06] pb-safe">
      <div className="flex items-center justify-between px-2 h-16 relative">
        <div className="flex flex-1 justify-around">
          {navItemsLeft.map(renderItem)}
        </div>
        
        <div className="flex-shrink-0 relative w-16 flex justify-center">
          <button 
            onClick={onOpenNewTransaction}
            className="absolute -top-6 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 active:scale-95 transition-transform"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="flex flex-1 justify-around">
          {navItemsRight.map(renderItem)}
        </div>
      </div>
    </nav>
  );
};
