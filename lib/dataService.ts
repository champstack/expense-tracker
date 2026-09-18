"use client";

import { Category, DEFAULT_CATEGORIES, Transaction } from "@/types/database";
import { INITIAL_TRANSACTIONS } from "./mockData";
import { createClient, isSupabaseConfigured } from "./supabase/client";

const STORAGE_KEY_TX = "expense_tracker_transactions";
const STORAGE_KEY_CAT = "expense_tracker_categories";

export class DataService {
  private static getStoredCategories(): Category[] {
    if (typeof window === "undefined") return DEFAULT_CATEGORIES;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CAT);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(STORAGE_KEY_CAT, JSON.stringify(DEFAULT_CATEGORIES));
    } catch {
      // fallback
    }
    return DEFAULT_CATEGORIES;
  }

  private static getStoredTransactions(): Transaction[] {
    if (typeof window === "undefined") return INITIAL_TRANSACTIONS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TX);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(INITIAL_TRANSACTIONS));
    } catch {
      // fallback
    }
    return INITIAL_TRANSACTIONS;
  }

  static async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("categories").select("*").order("name");
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn("Supabase fetch categories error, falling back to local:", err);
      }
    }
    return this.getStoredCategories();
  }

  static async getTransactions(): Promise<Transaction[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("transactions")
          .select("*, category:categories(*)")
          .order("transaction_date", { ascending: false });
        if (!error && data) {
          return data;
        }
      } catch (err) {
        console.warn("Supabase fetch transactions error, falling back to local:", err);
      }
    }

    const categories = this.getStoredCategories();
    const transactions = this.getStoredTransactions();
    return transactions.map((tx) => ({
      ...tx,
      category: categories.find((c) => c.id === tx.category_id),
    }));
  }

  static async addTransaction(tx: Omit<Transaction, "id" | "created_at">): Promise<Transaction> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const { category, ...cleanTx } = tx as any;
        const payload = {
          ...cleanTx,
          ...(user?.id ? { user_id: user.id } : {}),
        };
        const { data, error } = await supabase
          .from("transactions")
          .insert([payload])
          .select("*, category:categories(*)")
          .single();
        if (!error && data) return data;
        if (error) console.error("Supabase addTransaction error:", error);
      } catch (err) {
        console.warn("Supabase add error, saving locally:", err);
      }
    }

    const categories = this.getStoredCategories();
    const newTx: Transaction = {
      ...tx,
      id: "tx-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      created_at: new Date().toISOString(),
      category: categories.find((c) => c.id === tx.category_id),
    };

    const current = this.getStoredTransactions();
    const updated = [newTx, ...current];
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(updated));
    }
    return newTx;
  }

  static async addMultipleTransactions(
    items: Omit<Transaction, "id" | "created_at">[]
  ): Promise<Transaction[]> {
    if (items.length === 0) return [];

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const payload = items.map((item) => {
          const { category, ...cleanItem } = item as any;
          return {
            ...cleanItem,
            ...(user?.id ? { user_id: user.id } : {}),
          };
        });
        const { data, error } = await supabase
          .from("transactions")
          .insert(payload)
          .select("*, category:categories(*)");
        if (!error && data) return data;
        if (error) console.error("Supabase addMultipleTransactions error:", error);
      } catch (err) {
        console.warn("Supabase batch add error, saving locally:", err);
      }
    }

    const categories = this.getStoredCategories();
    const newTransactions: Transaction[] = items.map((item, index) => ({
      ...item,
      id: "tx-" + Date.now() + "-" + index + "-" + Math.random().toString(36).substring(2, 6),
      created_at: new Date().toISOString(),
      category: categories.find((c) => c.id === item.category_id),
    }));

    const current = this.getStoredTransactions();
    const updated = [...newTransactions, ...current];
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(updated));
    }
    return newTransactions;
  }

  static async deleteTransaction(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("transactions").delete().eq("id", id);
        if (!error) return true;
      } catch (err) {
        console.warn("Supabase delete error:", err);
      }
    }

    const current = this.getStoredTransactions();
    const updated = current.filter((t) => t.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(updated));
    }
    return true;
  }

  static async resetToSampleData(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(INITIAL_TRANSACTIONS));
      localStorage.setItem(STORAGE_KEY_CAT, JSON.stringify(DEFAULT_CATEGORIES));
    }
  }
}
