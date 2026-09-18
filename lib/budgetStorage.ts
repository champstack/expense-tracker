"use client";
import { BudgetSettings, SavingsGoal } from '@/types/budget';

const BUDGET_KEY = 'expense_tracker_budgets';
const GOALS_KEY = 'expense_tracker_goals';

export const BudgetStorage = {
  getBudgets(): BudgetSettings {
    if (typeof window === 'undefined') {
      return { budgets: [], updatedAt: new Date().toISOString() };
    }
    try {
      const data = localStorage.getItem(BUDGET_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Failed to parse budget settings", e);
    }
    return { budgets: [], updatedAt: new Date().toISOString() };
  },
  
  saveBudgets(settings: BudgetSettings): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(BUDGET_KEY, JSON.stringify(settings));
  },
  
  getGoals(): SavingsGoal[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(GOALS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Failed to parse goals", e);
    }
    return [];
  },
  
  saveGoals(goals: SavingsGoal[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  },
  
  addGoal(goal: Omit<SavingsGoal, 'id' | 'createdAt'>): SavingsGoal {
    const goals = this.getGoals();
    const newGoal: SavingsGoal = {
      ...goal,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    this.saveGoals([...goals, newGoal]);
    return newGoal;
  },
  
  updateGoalAmount(id: string, amount: number): void {
    const goals = this.getGoals();
    const updatedGoals = goals.map(g => {
      if (g.id === id) {
        return { ...g, currentAmount: g.currentAmount + amount };
      }
      return g;
    });
    this.saveGoals(updatedGoals);
  },
  
  deleteGoal(id: string): void {
    const goals = this.getGoals();
    this.saveGoals(goals.filter(g => g.id !== id));
  },

  setBudgetForCategory(category_id: string, monthly_limit: number): void {
    const current = this.getBudgets();
    const idx = current.budgets.findIndex((b) => b.category_id === category_id);
    if (idx >= 0) {
      current.budgets[idx].monthly_limit = monthly_limit;
    } else {
      current.budgets.push({ category_id, monthly_limit });
    }
    this.saveBudgets(current);
  },

  removeBudgetForCategory(category_id: string): void {
    const current = this.getBudgets();
    current.budgets = current.budgets.filter((b) => b.category_id !== category_id);
    this.saveBudgets(current);
  },
};
