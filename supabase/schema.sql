-- ==========================================
-- ระบบบันทึกรายรับ-รายจ่าย (Expense Tracker)
-- Supabase PostgreSQL Schema & RLS Policies
-- ==========================================

-- 1. สร้างตารางหมวดหมู่ (Categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    icon TEXT DEFAULT 'CircleDot',
    color TEXT DEFAULT '#64748B',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. สร้างตารางรายการบันทึก (Transactions)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. เพิ่ม Index เพื่อเพิ่มความเร็วในการสืบค้นข้อมูล
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_user ON public.categories(user_id);

-- 4. เปิดใช้งาน Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 5. Policies สำหรับตาราง categories
CREATE POLICY "Users can view their own categories or default categories"
    ON public.categories FOR SELECT
    USING (auth.uid() = user_id OR is_default = TRUE OR user_id IS NULL);

CREATE POLICY "Users can insert their own categories"
    ON public.categories FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own categories"
    ON public.categories FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own categories"
    ON public.categories FOR DELETE
    USING ((auth.uid() = user_id OR user_id IS NULL) AND is_default = FALSE);

-- 6. Policies สำหรับตาราง transactions
CREATE POLICY "Users can view transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update transactions"
    ON public.transactions FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete transactions"
    ON public.transactions FOR DELETE
    USING (auth.uid() = user_id OR user_id IS NULL);

-- 7. ตารางงบประมาณ (Budgets)
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    monthly_limit NUMERIC(12, 2) NOT NULL CHECK (monthly_limit >= 0),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own budgets"
    ON public.budgets FOR ALL
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 8. ตารางเป้าหมายการออม (Savings Goals)
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
CREATE POLICY "Users can manage their own savings goals"
    ON public.savings_goals FOR ALL
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 9. ข้อมูลหมวดหมู่เริ่มต้น (Default Categories)
INSERT INTO public.categories (name, type, icon, color, is_default)
VALUES
    -- รายจ่าย (Expense)
    ('อาหารและเครื่องดื่ม', 'expense', 'Utensils', '#EF4444', TRUE),
    ('การเดินทาง', 'expense', 'Car', '#F97316', TRUE),
    ('ช้อปปิ้ง', 'expense', 'ShoppingBag', '#EC4899', TRUE),
    ('ที่พัก/ค่าน้ำไฟ', 'expense', 'Home', '#8B5CF6', TRUE),
    ('สุขภาพและยา', 'expense', 'HeartPulse', '#14B8A6', TRUE),
    ('บันเทิง/พักผ่อน', 'expense', 'Tv', '#6366F1', TRUE),
    ('รายจ่ายอื่นๆ', 'expense', 'MoreHorizontal', '#64748B', TRUE),
    -- รายรับ (Income)
    ('เงินเดือนประจำ', 'income', 'Banknote', '#10B981', TRUE),
    ('ธุรกิจส่วนตัว/ค้าขาย', 'income', 'Briefcase', '#059669', TRUE),
    ('งานพิเศษ/ฟรีแลนซ์', 'income', 'Laptop', '#0D9488', TRUE),
    ('ลงทุน/ปันผล', 'income', 'TrendingUp', '#0284C7', TRUE),
    ('รายรับอื่นๆ', 'income', 'Gift', '#16A34A', TRUE)
ON CONFLICT DO NOTHING;

