"use client";

import { Account, Category, DEFAULT_ACCOUNTS, DEFAULT_CATEGORIES, Transaction } from "@/types/database";
import { INITIAL_TRANSACTIONS } from "./mockData";
import { createClient, isSupabaseConfigured } from "./supabase/client";

const STORAGE_KEY_TX = "expense_tracker_transactions";
const STORAGE_KEY_CAT = "expense_tracker_categories";
const STORAGE_KEY_ACC = "expense_tracker_accounts";

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

  private static getStoredAccounts(): Account[] {
    if (typeof window === "undefined") return DEFAULT_ACCOUNTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ACC);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(STORAGE_KEY_ACC, JSON.stringify(DEFAULT_ACCOUNTS));
    } catch {
      // fallback
    }
    return DEFAULT_ACCOUNTS;
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

  static async getAccounts(): Promise<Account[]> {
    const user = await this.getCurrentUser();
    if (user && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("accounts")
          .select("*")
          .or(`user_id.eq.${user.id},is_default.eq.true,user_id.is.null`)
          .order("name");
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn("Supabase fetch accounts error, falling back to local:", err);
      }
    }
    return this.getStoredAccounts();
  }

  static async addAccount(acc: Omit<Account, "id">): Promise<Account> {
    const user = await this.getCurrentUser();
    if (user && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("accounts")
          .insert([{ ...acc, user_id: user.id }])
          .select("*")
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn("Supabase addAccount error:", err);
      }
    }

    const current = this.getStoredAccounts();
    const newAcc: Account = {
      ...acc,
      id: "acc-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    };
    const updated = [...current, newAcc];
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_ACC, JSON.stringify(updated));
    }
    return newAcc;
  }

  static async deleteAccount(id: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (user && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("accounts").delete().eq("id", id);
        if (!error) return true;
      } catch (err) {
        console.warn("Supabase deleteAccount error:", err);
      }
    }

    const current = this.getStoredAccounts();
    const updated = current.filter((a) => a.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_ACC, JSON.stringify(updated));
    }
    return true;
  }

  private static async resolveCategoryIdForSupabase(
    categoryId: string | undefined,
    type: string,
    supabase: any
  ): Promise<string | null> {
    if (!categoryId) return null;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
    if (isUUID) return categoryId;

    try {
      const localCat = DEFAULT_CATEGORIES.find((c) => c.id === categoryId);
      const targetName = localCat?.name;
      if (targetName) {
        const { data } = await supabase
          .from("categories")
          .select("id")
          .eq("name", targetName)
          .eq("type", type)
          .limit(1);
        if (data && data.length > 0) {
          return data[0].id;
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  static async getTransactions(): Promise<Transaction[]> {
    const user = await this.getCurrentUser();
    const categories = await this.getCategories();
    const accounts = await this.getAccounts();

    if (user && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("transactions")
          .select("*, category:categories(*)")
          .eq("user_id", user.id)
          .order("transaction_date", { ascending: false });
        if (!error && data) {
          const supabaseTxs: Transaction[] = data.map((tx: any) => ({
            ...tx,
            amount: parseFloat(String(tx.amount)) || 0,
            account: accounts.find((a) => a.id === tx.account_id) || DEFAULT_ACCOUNTS.find((a) => a.id === (tx.account_id || "acc-cash")),
            category: tx.category || categories.find((c) => c.id === tx.category_id) || DEFAULT_CATEGORIES.find((c) => c.id === tx.category_id),
          }));
          // Merge local fallback items to ensure no data loss
          const localTxs = this.getStoredTransactions().map((tx) => ({
            ...tx,
            amount: parseFloat(String(tx.amount)) || 0,
            account: tx.account || accounts.find((a) => a.id === (tx.account_id || "acc-cash")) || DEFAULT_ACCOUNTS.find((a) => a.id === (tx.account_id || "acc-cash")),
            category: tx.category || categories.find((c) => c.id === tx.category_id) || DEFAULT_CATEGORIES.find((c) => c.id === tx.category_id),
          }));
          const existingIds = new Set(supabaseTxs.map((t: any) => t.id));
          const uniqueLocal = localTxs.filter((t) => !existingIds.has(t.id));
          const merged = [...supabaseTxs, ...uniqueLocal];
          merged.sort((a, b) => (b.transaction_date || "").localeCompare(a.transaction_date || ""));
          return merged;
        }
      } catch (err) {
        console.warn("Supabase fetch transactions error, falling back to local:", err);
      }
    }

    // Guest / Demo mode uses LocalStorage
    const transactions = this.getStoredTransactions();
    const list = transactions.map((tx) => ({
      ...tx,
      amount: parseFloat(String(tx.amount)) || 0,
      category: tx.category || categories.find((c) => c.id === tx.category_id) || DEFAULT_CATEGORIES.find((c) => c.id === tx.category_id),
      account: tx.account || accounts.find((a) => a.id === (tx.account_id || "acc-cash")) || DEFAULT_ACCOUNTS.find((a) => a.id === (tx.account_id || "acc-cash")),
    }));
    list.sort((a, b) => (b.transaction_date || "").localeCompare(a.transaction_date || ""));
    return list;
  }

  static async addTransaction(tx: Omit<Transaction, "id" | "created_at">): Promise<Transaction> {
    const res = await this.addMultipleTransactions([tx]);
    return res[0];
  }

  static async updateTransaction(
    id: string,
    updates: Partial<Omit<Transaction, "id" | "created_at">>
  ): Promise<Transaction | null> {
    const user = await this.getCurrentUser();
    const categories = await this.getCategories();
    const accounts = await this.getAccounts();

    if (user && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { category, account, ...cleanUpdates } = updates as any;
        const { data, error } = await supabase
          .from("transactions")
          .update(cleanUpdates)
          .eq("id", id)
          .select("*, category:categories(*)")
          .single();
        if (!error && data) return data;
        if (error) console.warn("Supabase updateTransaction notice (saving locally):", error.message);
      } catch (err) {
        console.warn("Supabase update error:", err);
      }
    }

    const current = this.getStoredTransactions();
    let updatedTx: Transaction | null = null;
    const updatedList = current.map((tx) => {
      if (tx.id === id) {
        const targetAccId = updates.account_id !== undefined ? updates.account_id : (tx.account_id || "acc-cash");
        updatedTx = {
          ...tx,
          ...updates,
          amount: updates.amount !== undefined ? (parseFloat(String(updates.amount)) || 0) : tx.amount,
          category: categories.find((c) => c.id === (updates.category_id || tx.category_id)) || DEFAULT_CATEGORIES.find((c) => c.id === (updates.category_id || tx.category_id)),
          account: accounts.find((a) => a.id === targetAccId) || DEFAULT_ACCOUNTS.find((a) => a.id === targetAccId),
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
    const categories = await this.getCategories();
    const accounts = await this.getAccounts();
    let supabaseResult: Transaction[] | null = null;

    if (user && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const payload = await Promise.all(
          items.map(async (item) => {
            const { category, account, ...cleanItem } = item as any;
            const validCatId = await this.resolveCategoryIdForSupabase(
              cleanItem.category_id,
              cleanItem.type,
              supabase
            );
            return {
              ...cleanItem,
              category_id: validCatId,
              amount: parseFloat(String(cleanItem.amount)) || 0,
              user_id: user.id,
            };
          })
        );
        const { data, error } = await supabase
          .from("transactions")
          .insert(payload)
          .select("*, category:categories(*)");

        if (!error && data) {
          supabaseResult = data.map((tx: any) => ({
            ...tx,
            amount: parseFloat(String(tx.amount)) || 0,
            account: accounts.find((a) => a.id === tx.account_id) || DEFAULT_ACCOUNTS.find((a) => a.id === (tx.account_id || "acc-cash")),
            category: tx.category || categories.find((c) => c.id === tx.category_id) || DEFAULT_CATEGORIES.find((c) => c.id === tx.category_id),
          }));
        }
        if (error) {
          console.warn("Supabase addMultipleTransactions notice (saving locally):", error.message);
        }
      } catch (err) {
        console.warn("Supabase batch add error, saving locally:", err);
      }
    }

    const newTransactions: Transaction[] = items.map((item, index) => {
      const targetCatId = item.category_id;
      const targetAccId = item.account_id || "acc-cash";
      return {
        ...item,
        amount: parseFloat(String(item.amount)) || 0,
        account_id: targetAccId,
        id: "tx-" + Date.now() + "-" + index + "-" + Math.random().toString(36).substring(2, 6),
        created_at: new Date().toISOString(),
        category: categories.find((c) => c.id === targetCatId) || DEFAULT_CATEGORIES.find((c) => c.id === targetCatId),
        account: accounts.find((a) => a.id === targetAccId) || DEFAULT_ACCOUNTS.find((a) => a.id === targetAccId),
      };
    });

    const current = this.getStoredTransactions();
    const updated = [...newTransactions, ...current];
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(updated));
    }
    return supabaseResult || newTransactions;
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
      localStorage.setItem(STORAGE_KEY_ACC, JSON.stringify(DEFAULT_ACCOUNTS));
    }
  }
}
