"use client";
import { Category } from '@/types/database';
import { formatCurrency, cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

interface BudgetProgressCardProps {
  category: Category;
  spent: number;
  limit: number;
}

export function BudgetProgressCard({ category, spent, limit }: BudgetProgressCardProps) {
  if (limit <= 0) return null;

  const percentage = Math.min((spent / limit) * 100, 100);
  
  let statusColor = "bg-emerald-500";
  let statusText = "ปกติ";
  let statusTextClass = "text-emerald-600 bg-emerald-50";

  if (percentage >= 90) {
    statusColor = "bg-rose-500";
    statusText = "เกินงบ!";
    statusTextClass = "text-rose-600 bg-rose-50";
  } else if (percentage >= 70) {
    statusColor = "bg-amber-500";
    statusText = "ใกล้เต็ม";
    statusTextClass = "text-amber-600 bg-amber-50";
  }

  // @ts-ignore
  const IconComponent = LucideIcons[category.icon] || LucideIcons.HelpCircle;

  return (
    <div className="bg-white rounded-2xl border border-black/[0.05] shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: category.color || '#94a3b8' }}
          >
            <IconComponent size={20} />
          </div>
          <div>
            <h3 className="font-medium text-slate-900">{category.name}</h3>
            <div className="text-sm text-slate-500 mt-0.5">
              {formatCurrency(spent)} / {formatCurrency(limit)}
            </div>
          </div>
        </div>
        <div className={cn("px-2.5 py-1 text-xs font-medium rounded-full", statusTextClass)}>
          {statusText}
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-500 rounded-full", statusColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span>ใช้ไป {Math.round(percentage)}%</span>
          <span>คงเหลือ {formatCurrency(Math.max(limit - spent, 0))}</span>
        </div>
      </div>
    </div>
  );
}
