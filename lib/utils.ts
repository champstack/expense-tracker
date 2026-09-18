import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace("THB", "฿")
    .trim();
}

export const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

export const THAI_DAYS_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

export function formatThaiDate(dateString: string | Date, withYear = true): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const day = date.getDate();
  const month = THAI_MONTHS_SHORT[date.getMonth()];
  const thaiYear = date.getFullYear() + 543;
  return withYear ? `${day} ${month} ${thaiYear}` : `${day} ${month}`;
}

export function formatThaiMonthYear(year: number, monthIndex: number): string {
  const thaiYear = year + 543;
  return `${THAI_MONTHS[monthIndex]} ${thaiYear}`;
}
