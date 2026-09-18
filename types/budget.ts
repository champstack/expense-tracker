export interface CategoryBudget {
  category_id: string;
  monthly_limit: number;
  color?: string;
}

export interface BudgetSettings {
  budgets: CategoryBudget[];
  updatedAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string; // YYYY-MM-DD
  color: string;
  icon: string; // lucide icon name
  createdAt: string;
}

export const GOAL_COLORS = [
  "#6366F1", // indigo
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#EC4899", // pink
  "#06B6D4", // cyan
];

export const GOAL_ICONS = [
  "PiggyBank",
  "Plane",
  "Home",
  "Car",
  "GraduationCap",
  "Heart",
  "Laptop",
  "Star",
];
