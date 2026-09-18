"use client";
import { Transaction, DEFAULT_CATEGORIES } from '@/types/database';

export function exportTransactionsToCsv(
  transactions: Transaction[],
  filename?: string
): void {
  if (typeof window === 'undefined') return;

  const now = new Date();
  const defaultFilename = `รายการ_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.csv`;
  const exportName = filename || defaultFilename;

  const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน', 'บันทึก'];
  
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const t of transactions) {
    const date = t.transaction_date;
    const type = t.type === 'income' ? 'รายรับ' : 'รายจ่าย';
    
    // Find category name
    const categoryObj = t.category || DEFAULT_CATEGORIES.find(c => c.id === t.category_id);
    const categoryName = categoryObj ? categoryObj.name : t.category_id;
    
    const amount = t.amount;
    const note = t.note ? `"${t.note.replace(/"/g, '""')}"` : '';

    csvRows.push(`${date},${type},${categoryName},${amount},${note}`);
  }

  const csvContent = '\uFEFF' + csvRows.join('\n'); // BOM for Excel
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', exportName);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
