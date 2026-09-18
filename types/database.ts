export type TransactionType = "income" | "expense";

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  is_default?: boolean;
  created_at?: string;
}

export interface Transaction {
  id: string;
  user_id?: string;
  category_id: string;
  type: TransactionType;
  amount: number;
  transaction_date: string; // YYYY-MM-DD
  note?: string;
  created_at?: string;
  // joined fields
  category?: Category;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  categoryExpenses: {
    categoryName: string;
    color: string;
    icon: string;
    amount: number;
    percentage: number;
  }[];
  dailyBreakdown: {
    date: string;
    day: number;
    income: number;
    expense: number;
  }[];
}

export const DEFAULT_CATEGORIES: Category[] = [
  // Expenses
  { id: "cat-food", name: "อาหารและเครื่องดื่ม", type: "expense", icon: "Utensils", color: "#EF4444" },
  { id: "cat-travel", name: "การเดินทาง", type: "expense", icon: "Car", color: "#F97316" },
  { id: "cat-shopping", name: "ช้อปปิ้ง", type: "expense", icon: "ShoppingBag", color: "#EC4899" },
  { id: "cat-housing", name: "ที่พัก/ค่าน้ำไฟ", type: "expense", icon: "Home", color: "#8B5CF6" },
  { id: "cat-health", name: "สุขภาพและยา", type: "expense", icon: "HeartPulse", color: "#14B8A6" },
  { id: "cat-entertainment", name: "บันเทิง/พักผ่อน", type: "expense", icon: "Tv", color: "#6366F1" },
  { id: "cat-other-exp", name: "รายจ่ายอื่นๆ", type: "expense", icon: "MoreHorizontal", color: "#64748B" },

  // Incomes
  { id: "cat-salary", name: "เงินเดือนประจำ", type: "income", icon: "Banknote", color: "#10B981" },
  { id: "cat-business", name: "ธุรกิจส่วนตัว/ค้าขาย", type: "income", icon: "Briefcase", color: "#059669" },
  { id: "cat-freelance", name: "งานพิเศษ/ฟรีแลนซ์", type: "income", icon: "Laptop", color: "#0D9488" },
  { id: "cat-investment", name: "ลงทุน/ปันผล", type: "income", icon: "TrendingUp", color: "#0284C7" },
  { id: "cat-other-inc", name: "รายรับอื่นๆ", type: "income", icon: "Gift", color: "#16A34A" },
];
