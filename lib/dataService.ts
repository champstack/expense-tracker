"use client";

import { Category, DEFAULT_CATEGORIES, Transaction } from "@/types/database";
import { INITIAL_TRANSACTIONS } from "./mockData";
import { createClient, isSupabaseConfigured } from "./supabase/client";

const STORAGE_KEY_TX = "expense_tracker_transactions";
const STORAGE_KEY_CAT = "expense_tracker_categories";

export class DataService {
  private static async getCurrentUser() {
    if (!isSupabaseConfigured()) return null;
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      return data?.user || null;
    } catch {
      return null;
    }
  }

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
    const user = await this.getCurrentUser();
    if (user && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .or(`user_id.eq.${user.id},is_default.eq.true,user_id.is.null`)
          .order("name");
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn("Supabase fetch categories error, falling back to local:", err);
      }
    }
    return this.getStoredCategories();
  }

  static async addCategory(cat: Omit<Category, "id">): Promise<Category> {
    const user = await this.getCurrentUser();
    if (user && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("categories")
          .insert([{ ...cat, user_id: user.id }])
          .select("*")
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn("Supabase addCategory error:", err);
      }
    }

    const current = this.getStoredCategories();
    const newCat: Category = {
      ...cat,
      id: "cat-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    };
    const updated = [...current, newCat];
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_CAT, JSON.stringify(updated));
    }
    return newCat;
  }

  static async getTransactions(): Promise<Transaction[]> {
    const user = await this.getCurrentUser();
    if (user && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("transactions")
          .select("*, category:categories(*)")
          .eq("user_id", user.id)
          .order("transaction_date", { ascending: false });
        if (!error && data) {
          return data;
        }
      } catch (err) {
        console.warn("Supabase fetch transactions error, falling back to local:", err);
      }
    }

    // Guest / Demo mode uses LocalStorage
    const categories = this.getStoredCategories();
    const transactions = this.getStoredTransactions();
    return transactions.map((tx) => ({
      ...tx,
      category: categories.find((c) => c.id === tx.category_id),
    }));
  }

  static async addTransaction(tx: Omit<Transaction, "id" | "created_at">): Promise<Transaction> {
    const user = await this.getCurrentUser();
    if (user && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { category, ...cleanTx } = tx as any;
        const payload = {
          ...cleanTx,
          user_id: user.id,
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

  static async updateTransaction(
    id: string,
    updates: Partial<Omit<Transaction, "id" | "created_at">>
  ): Promise<Transaction | null> {
    const user = await this.getCurrentUser();
    if (user && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { category, ...cleanUpdates } = updates as any;
        const { data, error } = await supabase
          .from("transactions")
          .update(cleanUpdates)
          .eq("id", id)
          .select("*, category:categories(*)")
          .single();
        if (!error && data) return data;
        if (error) console.error("Supabase updateTransaction error:", error);
      } catch (err) {
        console.warn("Supabase update error:", err);
      }
    }

    const categories = this.getStoredCategories();
    const current = this.getStoredTransactions();
    let updatedTx: Transaction | null = null;
    const updatedList = current.map((tx) => {
      if (tx.id === id) {
        updatedTx = {
          ...tx,
          ...updates,
          category: categories.find((c) => c.id === (updates.category_id || tx.category_id)),
        };
        return updatedTx;
      }
      return tx;
    });

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(updatedList));
    }
    return updatedTx;
  }

  static async addMultipleTransactions(
    items: Omit<Transaction, "id" | "created_at">[]
  ): Promise<Transaction[]> {
    if (items.length === 0) return [];

    const user = await this.getCurrentUser();
    if (user && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const payload = items.map((item) => {
          const { category, ...cleanItem } = item as any;
          return {
            ...cleanItem,
            user_id: user.id,
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
    const user = await this.getCurrentUser();
    if (user && isSupabaseConfigured()) {
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
