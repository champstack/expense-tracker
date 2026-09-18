"use client";

import { useState, useEffect } from 'react';
import { Transaction, Category } from '@/types/database';
import { SavingsGoal } from '@/types/budget';
import { BudgetStorage } from '@/lib/budgetStorage';
import { BudgetProgressCard } from './BudgetProgressCard';
import { formatCurrency, cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { PiggyBank, Plus, X, Pencil } from 'lucide-react';

interface BudgetViewProps {
  transactions: Transaction[];
  categories: Category[];
  currentMonth: Date;
}

const PRESET_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const PRESET_ICONS = ['PiggyBank', 'Plane', 'Home', 'Car', 'GraduationCap', 'Heart'];

export function BudgetView({ transactions, categories, currentMonth }: BudgetViewProps) {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetForm, setBudgetForm] = useState<{category_id: string, monthly_limit: string}>({ category_id: '', monthly_limit: '' });
  
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({ name: '', targetAmount: '', deadline: '', color: PRESET_COLORS[0], icon: PRESET_ICONS[0] });

  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false);
  const [addMoneyForm, setAddMoneyForm] = useState({ id: '', amount: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const settings = BudgetStorage.getBudgets();
    setBudgets(settings.budgets);
    setGoals(BudgetStorage.getGoals());
  };

  const calculateSpent = (categoryId: string) => {
    return transactions
      .filter(t => t.category_id === categoryId && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleSaveBudget = () => {
    if (!budgetForm.category_id || !budgetForm.monthly_limit) return;
    
    const newBudgets = [...budgets];
    const existingIndex = newBudgets.findIndex(b => b.category_id === budgetForm.category_id);
    
    if (existingIndex >= 0) {
      newBudgets[existingIndex].monthly_limit = Number(budgetForm.monthly_limit);
    } else {
      newBudgets.push({
        category_id: budgetForm.category_id,
        monthly_limit: Number(budgetForm.monthly_limit)
      });
    }
    
    BudgetStorage.saveBudgets({ budgets: newBudgets, updatedAt: new Date().toISOString() });
    loadData();
    setIsBudgetModalOpen(false);
    setBudgetForm({ category_id: '', monthly_limit: '' });
  };

  const handleSaveGoal = () => {
    if (!goalForm.name || !goalForm.targetAmount) return;
    
    BudgetStorage.addGoal({
      name: goalForm.name,
      targetAmount: Number(goalForm.targetAmount),
      currentAmount: 0,
      deadline: goalForm.deadline || undefined,
      color: goalForm.color,
      icon: goalForm.icon
    });
    
    loadData();
    setIsGoalModalOpen(false);
    setGoalForm({ name: '', targetAmount: '', deadline: '', color: PRESET_COLORS[0], icon: PRESET_ICONS[0] });
  };

  const handleAddMoney = () => {
    if (!addMoneyForm.id || !addMoneyForm.amount) return;
    BudgetStorage.updateGoalAmount(addMoneyForm.id, Number(addMoneyForm.amount));
    loadData();
    setIsAddMoneyModalOpen(false);
    setAddMoneyForm({ id: '', amount: '' });
  };

  const activeBudgets = budgets.filter(b => b.monthly_limit > 0);
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="space-y-8 pb-20">
      {/* Section 1: งบประมาณ */}
      <section>
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-lg font-bold text-slate-900">งบประมาณรายเดือน</h2>
          <button 
            onClick={() => setIsBudgetModalOpen(true)}
            className="text-sm font-medium text-indigo-600 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-full"
          >
            <Pencil size={14} /> แก้ไขงบ
          </button>
        </div>
        
        <div className="px-4 flex flex-col gap-3">
          {activeBudgets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-black/[0.05] p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-3">
                <PiggyBank size={32} />
              </div>
              <h3 className="text-slate-900 font-medium mb-1">ยังไม่ได้ตั้งงบประมาณ</h3>
              <p className="text-sm text-slate-500 mb-4">ควบคุมค่าใช้จ่ายได้ดีขึ้นด้วยการตั้งงบประมาณ</p>
              <button 
                onClick={() => setIsBudgetModalOpen(true)}
                className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-2"
              >
                <Plus size={16} /> ตั้งงบประมาณ
              </button>
            </div>
          ) : (
            activeBudgets.map(budget => {
              const category = categories.find(c => c.id === budget.category_id);
              if (!category) return null;
              const spent = calculateSpent(category.id);
              return (
                <BudgetProgressCard 
                  key={category.id} 
                  category={category} 
                  spent={spent} 
                  limit={budget.monthly_limit} 
                />
              );
            })
          )}
        </div>
      </section>

      {/* Section 2: เป้าหมายการออม */}
      <section>
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-lg font-bold text-slate-900">เป้าหมายการออม</h2>
          <button 
            onClick={() => setIsGoalModalOpen(true)}
            className="text-sm font-medium text-indigo-600 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-full"
          >
            <Plus size={16} /> เพิ่มเป้าหมาย
          </button>
        </div>

        <div className="px-4 flex flex-col gap-4">
          {goals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-black/[0.05] p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-3">
                <PiggyBank size={32} />
              </div>
              <h3 className="text-slate-900 font-medium mb-1">ยังไม่มีเป้าหมาย</h3>
              <p className="text-sm text-slate-500 mb-4">สร้างเป้าหมายการออมเพื่ออนาคต</p>
            </div>
          ) : (
            goals.map(goal => {
              // @ts-ignore
              const IconComponent = LucideIcons[goal.icon] || LucideIcons.PiggyBank;
              const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              return (
                <div key={goal.id} className="bg-white rounded-2xl border border-black/[0.05] p-4 flex flex-col gap-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                        style={{ backgroundColor: goal.color }}
                      >
                        <IconComponent size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{goal.name}</h3>
                        {goal.deadline && (
                          <div className="text-xs text-slate-500 mt-1">
                            ครบกำหนด: {new Date(goal.deadline).toLocaleDateString('th-TH')}
                          </div>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setAddMoneyForm({ id: goal.id, amount: '' });
                        setIsAddMoneyModalOpen(true);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} /> ออมเพิ่ม
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-end">
                      <div className="text-2xl font-bold text-slate-900">
                        {formatCurrency(goal.currentAmount)}
                      </div>
                      <div className="text-sm text-slate-500">
                        / {formatCurrency(goal.targetAmount)}
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500 rounded-full"
                        style={{ width: `${percentage}%`, backgroundColor: goal.color }}
                      />
                    </div>
                    <div className="text-right text-xs text-slate-500 font-medium">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Budget Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">ตั้งงบประมาณรายเดือน</h3>
              <button onClick={() => setIsBudgetModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">หมวดหมู่</label>
                <select 
                  className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white text-slate-900 border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={budgetForm.category_id}
                  onChange={(e) => setBudgetForm({...budgetForm, category_id: e.target.value})}
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {expenseCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">งบประมาณ (บาท)</label>
                <input 
                  type="number" 
                  className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white text-slate-900 border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="0.00"
                  value={budgetForm.monthly_limit}
                  onChange={(e) => setBudgetForm({...budgetForm, monthly_limit: e.target.value})}
                />
              </div>
              <button 
                onClick={handleSaveBudget}
                className="w-full bg-indigo-600 text-white font-semibold rounded-xl py-3.5 hover:bg-indigo-700 transition-colors mt-2"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in-95 my-8">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-bold text-lg text-slate-900">เพิ่มเป้าหมายการออม</h3>
              <button onClick={() => setIsGoalModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อเป้าหมาย</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white text-slate-900 border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="เช่น ออมเที่ยวญี่ปุ่น, ซื้อโทรศัพท์ใหม่"
                  value={goalForm.name}
                  onChange={(e) => setGoalForm({...goalForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">เป้าหมาย (บาท)</label>
                <input 
                  type="number" 
                  className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white text-slate-900 border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="0.00"
                  value={goalForm.targetAmount}
                  onChange={(e) => setGoalForm({...goalForm, targetAmount: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">วันที่ต้องการบรรลุเป้าหมาย (ไม่บังคับ)</label>
                <input 
                  type="date" 
                  className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white text-slate-900 border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={goalForm.deadline}
                  onChange={(e) => setGoalForm({...goalForm, deadline: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">สี</label>
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map(color => (
                    <button 
                      key={color}
                      onClick={() => setGoalForm({...goalForm, color})}
                      className={cn(
                        "w-10 h-10 rounded-full transition-transform",
                        goalForm.color === color ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : ""
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 mt-4">ไอคอน</label>
                <div className="flex flex-wrap gap-3">
                  {PRESET_ICONS.map(iconName => {
                    // @ts-ignore
                    const IconComp = LucideIcons[iconName] || LucideIcons.HelpCircle;
                    const isSelected = goalForm.icon === iconName;
                    return (
                      <button 
                        key={iconName}
                        onClick={() => setGoalForm({...goalForm, icon: iconName})}
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                          isSelected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                      >
                        <IconComp size={24} />
                      </button>
                    )
                  })}
                </div>
              </div>

              <button 
                onClick={handleSaveGoal}
                className="w-full bg-slate-900 text-white font-semibold rounded-xl py-3.5 hover:bg-slate-800 transition-colors mt-6"
              >
                บันทึกเป้าหมาย
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Money Modal */}
      {isAddMoneyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-xl animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">เพิ่มเงินออม</h3>
              <button onClick={() => setIsAddMoneyModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">จำนวนเงิน (บาท)</label>
                <input 
                  type="number" 
                  className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white text-slate-900 border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-xl font-bold"
                  placeholder="0.00"
                  value={addMoneyForm.amount}
                  onChange={(e) => setAddMoneyForm({...addMoneyForm, amount: e.target.value})}
                  autoFocus
                />
              </div>
              <button 
                onClick={handleAddMoney}
                className="w-full bg-emerald-500 text-white font-semibold rounded-xl py-3.5 hover:bg-emerald-600 transition-colors mt-2"
              >
                ยืนยันการออม
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
