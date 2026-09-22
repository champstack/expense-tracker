-- ==========================================================
-- สคริปต์อัปเดตและสร้างตารางฐานข้อมูลให้ครบทุกฟังก์ชัน (Supabase)
-- คัดลอกโค้ดนี้ไปรันที่หน้า: Supabase Dashboard -> SQL Editor
-- ==========================================================

-- 1. เพิ่มคอลัมน์ account_id ในตาราง transactions (ถ้ายังไม่มี)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'account_id'
    ) THEN 
        ALTER TABLE public.transactions ADD COLUMN account_id TEXT DEFAULT 'acc-cash';
    END IF;
END $$;

-- 2. สร้างตารางบัญชี / กระเป๋าเงิน (Accounts)
CREATE TABLE IF NOT EXISTS public.accounts (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('cash', 'bank', 'credit', 'e-wallet', 'other')) NOT NULL DEFAULT 'bank',
    icon TEXT DEFAULT 'Landmark',
    color TEXT DEFAULT '#059669',
    initial_balance NUMERIC(12, 2) DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view accounts" ON public.accounts;
    DROP POLICY IF EXISTS "Users can insert accounts" ON public.accounts;
    DROP POLICY IF EXISTS "Users can update accounts" ON public.accounts;
    DROP POLICY IF EXISTS "Users can delete accounts" ON public.accounts;
END $$;

CREATE POLICY "Users can view accounts"
    ON public.accounts FOR SELECT
    USING (auth.uid() = user_id OR is_default = TRUE OR user_id IS NULL);

CREATE POLICY "Users can insert accounts"
    ON public.accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update accounts"
    ON public.accounts FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete accounts"
    ON public.accounts FOR DELETE
    USING ((auth.uid() = user_id OR user_id IS NULL) AND is_default = FALSE);

-- ใส่บัญชีเริ่มต้นเข้าตาราง accounts (Default Accounts)
INSERT INTO public.accounts (id, name, type, icon, color, initial_balance, is_default)
VALUES
    ('acc-cash', 'เงินสด (Cash)', 'cash', 'Banknote', '#10B981', 0, TRUE),
    ('acc-kbank', 'ธนาคารกสิกรไทย (K-Bank)', 'bank', 'Landmark', '#059669', 0, TRUE),
    ('acc-scb', 'ธนาคารไทยพาณิชย์ (SCB)', 'bank', 'Building2', '#7C3AED', 0, TRUE),
    ('acc-wallet', 'TrueMoney Wallet', 'e-wallet', 'Smartphone', '#F97316', 0, TRUE)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color;

-- 3. สร้างตารางงบประมาณ (Budgets)
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL,
    monthly_limit NUMERIC(12, 2) NOT NULL CHECK (monthly_limit >= 0),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, category_id)
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can manage budgets" ON public.budgets;
END $$;

CREATE POLICY "Users can manage budgets"
    ON public.budgets FOR ALL
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 4. สร้างตารางเป้าหมายการออม (Savings Goals)
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    deadline DATE,
    color TEXT DEFAULT '#6366F1',
    icon TEXT DEFAULT 'PiggyBank',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can manage savings goals" ON public.savings_goals;
END $$;

CREATE POLICY "Users can manage savings goals"
    ON public.savings_goals FOR ALL
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
