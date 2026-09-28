-- ==========================================================
-- แก้ไข RLS Policies สำหรับ transactions, categories, accounts
-- ให้รัน script นี้ใน Supabase Dashboard → SQL Editor
-- ==========================================================

-- =========================================================
-- ตาราง transactions
-- =========================================================
DROP POLICY IF EXISTS "Users can view transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete transactions" ON public.transactions;

-- SELECT: เห็นเฉพาะของตัวเอง
CREATE POLICY "Users can view transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT: เพิ่มได้เฉพาะของตัวเอง (user_id ต้องตรงกับ auth.uid())
CREATE POLICY "Users can insert transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: แก้ไขได้เฉพาะของตัวเอง
CREATE POLICY "Users can update transactions"
    ON public.transactions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- DELETE: ลบได้เฉพาะของตัวเอง
CREATE POLICY "Users can delete transactions"
    ON public.transactions FOR DELETE
    USING (auth.uid() = user_id);

-- =========================================================
-- ตาราง categories
-- =========================================================
DROP POLICY IF EXISTS "Users can view their own categories or default categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON public.categories;

-- SELECT: เห็น default categories (is_default=true หรือ user_id IS NULL) + ของตัวเอง
CREATE POLICY "Users can view their own categories or default categories"
    ON public.categories FOR SELECT
    USING (is_default = TRUE OR user_id IS NULL OR auth.uid() = user_id);

-- INSERT: เพิ่มหมวดหมู่ของตัวเอง
CREATE POLICY "Users can insert their own categories"
    ON public.categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: แก้ไขเฉพาะของตัวเอง
CREATE POLICY "Users can update their own categories"
    ON public.categories FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- DELETE: ลบได้เฉพาะของตัวเอง และไม่ใช่ default
CREATE POLICY "Users can delete their own categories"
    ON public.categories FOR DELETE
    USING (auth.uid() = user_id AND is_default = FALSE);

-- =========================================================
-- ตาราง accounts
-- =========================================================
DROP POLICY IF EXISTS "Users can view accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can insert accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can update accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can delete accounts" ON public.accounts;

-- SELECT: เห็น default accounts + ของตัวเอง
CREATE POLICY "Users can view accounts"
    ON public.accounts FOR SELECT
    USING (is_default = TRUE OR user_id IS NULL OR auth.uid() = user_id);

-- INSERT: เพิ่มบัญชีของตัวเอง
CREATE POLICY "Users can insert accounts"
    ON public.accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: แก้ไขเฉพาะของตัวเอง
CREATE POLICY "Users can update accounts"
    ON public.accounts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- DELETE: ลบได้เฉพาะของตัวเอง และไม่ใช่ default
CREATE POLICY "Users can delete accounts"
    ON public.accounts FOR DELETE
    USING (auth.uid() = user_id AND is_default = FALSE);

-- =========================================================
-- ตรวจสอบ column category_id ใน transactions
-- (เดิม schema ทำเป็น NOT NULL → เปลี่ยนให้เป็น NULLABLE)
-- =========================================================
ALTER TABLE public.transactions
    ALTER COLUMN category_id DROP NOT NULL;

-- ตรวจสอบ account_id column (เผื่อยังไม่มี)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'account_id'
    ) THEN
        ALTER TABLE public.transactions ADD COLUMN account_id TEXT DEFAULT 'acc-cash';
    END IF;
END $$;

-- =========================================================
-- ตรวจสอบ budgets
-- =========================================================
DROP POLICY IF EXISTS "Users can manage their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can manage budgets" ON public.budgets;

CREATE POLICY "Users can manage budgets"
    ON public.budgets FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- เสร็จสิ้น
-- =========================================================
SELECT 'RLS Policies updated successfully!' AS status;
