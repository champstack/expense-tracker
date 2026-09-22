"use client";

import React, { useMemo } from "react";
import { Account, Transaction } from "@/types/database";
import { formatCurrency } from "@/lib/utils";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Wallet, ArrowUpRight, ArrowDownLeft, Settings2 } from "lucide-react";

interface AccountCardsProps {
  accounts: Account[];
  allTransactions: Transaction[];
  onOpenAccountsModal: () => void;
}

export function AccountCards({
  accounts,
  allTransactions,
  onOpenAccountsModal,
}: AccountCardsProps) {
  // คำนวณยอดเงินคงเหลือของแต่ละบัญชีจาก transactions ทั้งหมด
  const accountBalances = useMemo(() => {
    const balances: Record<string, { income: number; expense: number; balance: number }> = {};

    accounts.forEach((acc) => {
      balances[acc.id] = {
        income: 0,
        expense: 0,
        balance: acc.initial_balance || 0,
      };
    });

    allTransactions.forEach((tx) => {
      const accId = tx.account_id || "acc-cash";
      if (!balances[accId]) {
        balances[accId] = { income: 0, expense: 0, balance: 0 };
      }
      const amt = parseFloat(String(tx.amount)) || 0;
      if (tx.type === "income") {
        balances[accId].income += amt;
        balances[accId].balance += amt;
      } else {
        balances[accId].expense += amt;
        balances[accId].balance -= amt;
      }
    });

    return balances;
  }, [accounts, allTransactions]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Wallet className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm md:text-base">
            บัญชี & กระเป๋าเงิน
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAccountsModal}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors p-1 rounded-lg hover:bg-indigo-50"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>จัดการบัญชี</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {accounts.map((acc) => {
          const stats = accountBalances[acc.id] || { balance: 0, income: 0, expense: 0 };
          const isNegative = stats.balance < 0;

          return (
            <div
              key={acc.id}
              className="p-3.5 rounded-2xl border border-slate-100 bg-white hover:border-indigo-100 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-600 truncate">{acc.name}</span>
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                  style={{ backgroundColor: acc.color || "#6366F1" }}
                >
                  <CategoryIcon name={acc.icon || "Wallet"} size={14} className="text-white" />
                </div>
              </div>

              <div>
                <p className="text-[11px] text-slate-400">ยอดคงเหลือ</p>
                <p
                  className={`text-sm sm:text-base font-bold tabular-nums truncate ${
                    isNegative ? "text-rose-600" : "text-slate-800"
                  }`}
                >
                  {formatCurrency(stats.balance)}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center text-emerald-600 font-medium">
                  +{formatCurrency(stats.income)}
                </span>
                <span className="flex items-center text-rose-500 font-medium">
                  -{formatCurrency(stats.expense)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
