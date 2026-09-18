import { Category, DEFAULT_CATEGORIES, Transaction } from "@/types/database";

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth(); // 0-indexed

function getDateString(day: number): string {
  const d = new Date(currentYear, currentMonth, day);
  return d.toISOString().split("T")[0];
}

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    type: "income",
    amount: 50000,
    category_id: "cat-salary",
    transaction_date: getDateString(1),
    note: "เงินเดือนประจำเดือน",
    created_at: new Date(currentYear, currentMonth, 1, 9, 0).toISOString(),
  },
  {
    id: "tx-2",
    type: "income",
    amount: 2000,
    category_id: "cat-freelance",
    transaction_date: getDateString(18),
    note: "ค่าออกแบบกราฟิกพิเศษ",
    created_at: new Date(currentYear, currentMonth, 18, 14, 0).toISOString(),
  },
  {
    id: "tx-3",
    type: "expense",
    amount: 6500,
    category_id: "cat-housing",
    transaction_date: getDateString(5),
    note: "ค่าห้องพัก + ค่าน้ำไฟ",
    created_at: new Date(currentYear, currentMonth, 5, 10, 30).toISOString(),
  },
  {
    id: "tx-4",
    type: "expense",
    amount: 1200,
    category_id: "cat-travel",
    transaction_date: getDateString(8),
    note: "เติมน้ำมันรถยนต์",
    created_at: new Date(currentYear, currentMonth, 8, 11, 0).toISOString(),
  },
  {
    id: "tx-5",
    type: "expense",
    amount: 3000,
    category_id: "cat-shopping",
    transaction_date: getDateString(10),
    note: "ซื้อของใช้เข้าบ้าน ซูเปอร์มาร์เก็ต",
    created_at: new Date(currentYear, currentMonth, 10, 16, 15).toISOString(),
  },
  {
    id: "tx-6",
    type: "expense",
    amount: 500,
    category_id: "cat-entertainment",
    transaction_date: getDateString(15),
    note: "ดูหนัง Netflix + ของว่าง",
    created_at: new Date(currentYear, currentMonth, 15, 20, 0).toISOString(),
  },
  {
    id: "tx-7",
    type: "expense",
    amount: 200,
    category_id: "cat-food",
    transaction_date: getDateString(18),
    note: "ทานข้าวที่ทำงาน",
    created_at: new Date(currentYear, currentMonth, 18, 12, 30).toISOString(),
  },
  {
    id: "tx-8",
    type: "expense",
    amount: 1400,
    category_id: "cat-food",
    transaction_date: getDateString(18),
    note: "ทานบุฟเฟ่ต์กับครอบครัว",
    created_at: new Date(currentYear, currentMonth, 18, 19, 0).toISOString(),
  },
  {
    id: "tx-9",
    type: "expense",
    amount: 800,
    category_id: "cat-health",
    transaction_date: getDateString(10),
    note: "ค่ายาและวิตามิน",
    created_at: new Date(currentYear, currentMonth, 10, 17, 0).toISOString(),
  },
];
