import React, { useState, useMemo, useRef, useEffect } from "react";
import { Transaction, Category, Account } from "@/types/database";
import { formatCurrency, formatThaiDate, cn } from "@/lib/utils";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Search, Trash2, ArrowUpRight, ArrowDownLeft, SlidersHorizontal, ReceiptText, X, Pencil, Wallet, ChevronDown, Check, Layers } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  accounts?: Account[];
  onDelete: (id: string) => void;
  onEdit?: (tx: Transaction) => void;
  onOpenNewModal?: () => void;
}

export function TransactionList({
  transactions,
  categories,
  accounts = [],
  onDelete,
  onEdit,
}: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [isAccDropdownOpen, setIsAccDropdownOpen] = useState(false);
  const catDropdownRef = useRef<HTMLDivElement>(null);
  const accDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (catDropdownRef.current && !catDropdownRef.current.contains(event.target as Node)) {
        setIsCatDropdownOpen(false);
      }
      if (accDropdownRef.current && !accDropdownRef.current.contains(event.target as Node)) {
        setIsAccDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCategory = categories.find((c) => c.id === categoryFilter);
  const selectedAccount = accounts.find((a) => a.id === accountFilter);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type match
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;

      // Category match
      if (categoryFilter !== "all" && tx.category_id !== categoryFilter) return false;

      // Account match
      if (accountFilter !== "all" && (tx.account_id || "acc-cash") !== accountFilter) return false;

      // Search match (note, category name, or account name)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const noteMatch = tx.note?.toLowerCase().includes(query);
        const catMatch = tx.category?.name.toLowerCase().includes(query);
        const accMatch = tx.account?.name.toLowerCase().includes(query);
        if (!noteMatch && !catMatch && !accMatch) return false;
      }

      return true;
    });
  }, [transactions, typeFilter, categoryFilter, accountFilter, searchTerm]);

  const hasActiveFilters = typeFilter !== "all" || categoryFilter !== "all" || accountFilter !== "all" || searchTerm.trim().length > 0;

  return (
    <div className="rounded-2xl bg-white p-4 md:p-6 shadow-sm border border-slate-100 flex-1 flex flex-col min-h-0">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 shrink-0">
        <div>
          <h3 className="font-bold text-slate-800 text-base md:text-lg">ประวัติรายการ</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {transactions.length === 0
              ? "ยังไม่มีรายการในเดือนนี้"
              : hasActiveFilters
              ? `พบ ${filteredTransactions.length} จาก ${transactions.length} รายการ`
              : `ทั้งหมด ${transactions.length} รายการ`}
          </p>
        </div>

        {transactions.length > 0 && (
          <div className="flex items-center gap-2">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหารายการ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* ปุ่มสลับตัวกรอง */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors",
                showFilters || hasActiveFilters
                  ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>ตัวกรอง</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* แถบตัวกรองเพิ่มเติมเมื่อเปิด */}
      {showFilters && transactions.length > 0 && (
        <div className="mt-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex flex-wrap items-center gap-3 text-xs animate-in fade-in duration-150">
          {/* สลับประเภท */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">ประเภท:</span>
            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs">
              <button
                onClick={() => setTypeFilter("all")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all",
                  typeFilter === "all" ? "bg-slate-800 text-white font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
                )}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setTypeFilter("income")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all",
                  typeFilter === "income" ? "bg-emerald-600 text-white font-bold shadow-xs" : "text-slate-600 hover:text-emerald-700"
                )}
              >
                รายรับ
              </button>
              <button
                onClick={() => setTypeFilter("expense")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all",
                  typeFilter === "expense" ? "bg-rose-500 text-white font-bold shadow-xs" : "text-slate-600 hover:text-rose-700"
                )}
              >
                รายจ่าย
              </button>
            </div>
          </div>

          {/* หมวดหมู่ (Custom Dropdown) */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">หมวดหมู่:</span>
            <div className="relative" ref={catDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setIsCatDropdownOpen(!isCatDropdownOpen);
                  setIsAccDropdownOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 py-1.5 px-3 rounded-xl border bg-white text-xs font-semibold transition-all shadow-2xs",
                  categoryFilter !== "all"
                    ? "border-indigo-300 text-indigo-700 bg-indigo-50/50"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                )}
              >
                {selectedCategory ? (
                  <div
                    className="w-4 h-4 rounded-md flex items-center justify-center text-white shrink-0 shadow-2xs"
                    style={{ backgroundColor: selectedCategory.color || "#64748B" }}
                  >
                    <CategoryIcon name={selectedCategory.icon || "CircleDot"} size={10} />
                  </div>
                ) : (
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className="truncate max-w-[130px]">
                  {selectedCategory ? selectedCategory.name : "ทุกหมวดหมู่"}
                </span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
                    isCatDropdownOpen && "rotate-180"
                  )}
                />
              </button>

              {isCatDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-60 max-h-72 overflow-y-auto rounded-2xl bg-white p-1.5 shadow-2xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter("all");
                      setIsCatDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors text-left",
                      categoryFilter === "all"
                        ? "bg-indigo-50 text-indigo-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <span>ทุกหมวดหมู่</span>
                    </div>
                    {categoryFilter === "all" && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>

                  <div className="h-px bg-slate-100 my-1" />

                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCategoryFilter(c.id);
                        setIsCatDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors text-left",
                        categoryFilter === c.id
                          ? "bg-indigo-50 text-indigo-700 font-semibold"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                          style={{ backgroundColor: c.color || "#64748B" }}
                        >
                          <CategoryIcon name={c.icon || "CircleDot"} size={13} />
                        </div>
                        <span className="truncate">{c.name}</span>
                      </div>
                      {categoryFilter === c.id && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* บัญชี & กระเป๋าเงิน (Custom Dropdown) */}
          {accounts.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">บัญชี:</span>
              <div className="relative" ref={accDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsAccDropdownOpen(!isAccDropdownOpen);
                    setIsCatDropdownOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 py-1.5 px-3 rounded-xl border bg-white text-xs font-semibold transition-all shadow-2xs",
                    accountFilter !== "all"
                      ? "border-indigo-300 text-indigo-700 bg-indigo-50/50"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {selectedAccount ? (
                    <div
                      className="w-4 h-4 rounded-md flex items-center justify-center text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: selectedAccount.color || "#059669" }}
                    >
                      <CategoryIcon name={selectedAccount.icon || "Wallet"} size={10} />
                    </div>
                  ) : (
                    <Wallet className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span className="truncate max-w-[130px]">
                    {selectedAccount ? selectedAccount.name : "ทุกบัญชี"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
                      isAccDropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                {isAccDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1.5 w-60 max-h-72 overflow-y-auto rounded-2xl bg-white p-1.5 shadow-2xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountFilter("all");
                        setIsAccDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors text-left",
                        accountFilter === "all"
                          ? "bg-indigo-50 text-indigo-700 font-semibold"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                          <Wallet className="w-3.5 h-3.5" />
                        </div>
                        <span>ทุกบัญชี</span>
                      </div>
                      {accountFilter === "all" && <Check className="w-4 h-4 text-indigo-600" />}
                    </button>

                    <div className="h-px bg-slate-100 my-1" />

                    {accounts.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setAccountFilter(a.id);
                          setIsAccDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors text-left",
                          accountFilter === a.id
                            ? "bg-indigo-50 text-indigo-700 font-semibold"
                            : "text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                            style={{ backgroundColor: a.color || "#059669" }}
                          >
                            <CategoryIcon name={a.icon || "Wallet"} size={13} />
                          </div>
                          <span className="truncate">{a.name}</span>
                        </div>
                        {accountFilter === a.id && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <button
              onClick={() => {
                setTypeFilter("all");
                setCategoryFilter("all");
                setAccountFilter("all");
                setSearchTerm("");
              }}
              className="text-rose-500 hover:text-rose-600 hover:underline text-xs ml-auto font-semibold px-2 py-1"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>
      )}

      {/* รายการประวัติ */}
      <div className="mt-4 flex-1 flex flex-col min-h-0">
        {filteredTransactions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
            {transactions.length === 0 ? (
              // กรณีในเดือนนี้ไม่มีรายการเลย
              <div className="flex flex-col items-center max-w-xs animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-3 shadow-xs">
                  <ReceiptText className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 mb-1">
                  ยังไม่มีรายการในเดือนนี้
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  เริ่มบันทึกรายรับหรือรายจ่าย โดยแตะที่ปุ่ม <span className="font-bold text-blue-600">+</span> ด้านล่างหน้าจอ
                </p>
              </div>
            ) : (
              // กรณีค้นหาหรือกรองแล้วไม่พบ
              <div className="flex flex-col items-center max-w-xs animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
                  <Search className="w-7 h-7 stroke-[1.5]" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 mb-1">
                  ไม่พบรายการที่ตรงกับเงื่อนไข
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  ลองค้นหาด้วยคำอื่น หรือกดล้างตัวกรองเพื่อดูรายการทั้งหมด
                </p>
                <button
                  onClick={() => {
                    setTypeFilter("all");
                    setCategoryFilter("all");
                    setSearchTerm("");
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/60 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-3">
                {/* Category Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-xs"
                  style={{ backgroundColor: tx.category?.color || "#64748B" }}
                >
                  <CategoryIcon
                    name={tx.category?.icon || "CircleDot"}
                    size={18}
                    className="w-4 h-4 text-white"
                  />
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800 text-xs md:text-sm">
                      {tx.category?.name || "ไม่ระบุหมวดหมู่"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      • {formatThaiDate(tx.transaction_date, false)}
                    </span>
                    {tx.account && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                        <CategoryIcon name={tx.account.icon || "Wallet"} size={11} />
                        {tx.account.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs md:max-w-md">
                    {tx.note || (tx.type === "income" ? "รายรับทั่วไป" : "ค่าใช้จ่ายทั่วไป")}
                  </p>
                </div>
              </div>

              {/* Amount & Actions (จัดเรียงให้เท่ากันทุกแถว) */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="text-right min-w-[95px] sm:min-w-[125px] shrink-0">
                  <div
                    className={`font-bold text-xs md:text-sm tabular-nums flex items-center justify-end gap-1 ${
                      tx.type === "income" ? "text-emerald-600" : "text-rose-500"
                    }`}
                  >
                    {tx.type === "income" ? (
                      <ArrowUpRight className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                    ) : (
                      <ArrowDownLeft className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                    )}
                    <span className="tabular-nums">{formatCurrency(Number(tx.amount))}</span>
                  </div>
                </div>

                {/* ปุ่มแก้ไขและลบ - จัดวางในคอลัมน์ขนาดคงที่ให้เท่ากันทุกแถว */}
                <div className="flex items-center gap-0.5 shrink-0 w-14 justify-end">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="แก้ไขรายการ"
                    >
                      <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm("คุณต้องการลบรายการนี้ใช่หรือไม่?")) {
                        onDelete(tx.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    title="ลบรายการ"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
