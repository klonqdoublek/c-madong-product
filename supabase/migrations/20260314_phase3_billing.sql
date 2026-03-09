-- ============================================================================
-- Phase 3: Billing & Utilities
-- Tables: bills, bill_items
-- ============================================================================

-- Bill status type
DO $$ BEGIN
  CREATE TYPE bill_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Bill item category type
DO $$ BEGIN
  CREATE TYPE bill_category AS ENUM ('room', 'electricity', 'water', 'deposit', 'fine', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- bills table
-- ============================================================================
CREATE TABLE IF NOT EXISTS bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id),
  room_id UUID REFERENCES rooms(id),
  bed_id UUID REFERENCES beds(id),
  billing_month INT NOT NULL CHECK (billing_month BETWEEN 1 AND 12),
  billing_year INT NOT NULL CHECK (billing_year > 2000),
  billing_round INT NOT NULL DEFAULT 1,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  status bill_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  paid_at TIMESTAMPTZ,
  paid_by UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- bill_items table
-- ============================================================================
CREATE TABLE IF NOT EXISTS bill_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  category bill_category NOT NULL DEFAULT 'other',
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_bills_student_id ON bills(student_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_billing_period ON bills(billing_year, billing_month);
CREATE INDEX IF NOT EXISTS idx_bills_building_id ON bills(building_id);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id);

-- ============================================================================
-- Trigger: auto-update total_amount when bill_items change
-- ============================================================================
CREATE OR REPLACE FUNCTION update_bill_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE bills
  SET total_amount = COALESCE((
    SELECT SUM(amount) FROM bill_items WHERE bill_id = COALESCE(NEW.bill_id, OLD.bill_id)
  ), 0),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.bill_id, OLD.bill_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_bill_total ON bill_items;
CREATE TRIGGER trg_update_bill_total
AFTER INSERT OR UPDATE OR DELETE ON bill_items
FOR EACH ROW EXECUTE FUNCTION update_bill_total();

-- ============================================================================
-- Function: mark overdue bills (called manually or via cron)
-- ============================================================================
CREATE OR REPLACE FUNCTION mark_overdue_bills()
RETURNS INT AS $$
DECLARE
  affected INT;
BEGIN
  UPDATE bills
  SET status = 'overdue', updated_at = NOW()
  WHERE status = 'pending' AND due_date < CURRENT_DATE;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Trigger: auto-update updated_at on bills
-- ============================================================================
CREATE OR REPLACE FUNCTION update_bills_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bills_updated_at ON bills;
CREATE TRIGGER trg_bills_updated_at
BEFORE UPDATE ON bills
FOR EACH ROW EXECUTE FUNCTION update_bills_updated_at();

-- ============================================================================
-- RLS Policies
-- ============================================================================
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;

-- Helper: check if user has finance/admin role (avoids RLS recursion on profiles)
CREATE OR REPLACE FUNCTION is_finance_or_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = p_user_id
      AND is_active = TRUE
      AND role IN ('super_admin', 'head', 'finance')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bills: students can read their own
CREATE POLICY bills_student_select ON bills
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- Bills: finance/admin can read all
CREATE POLICY bills_admin_select ON bills
  FOR SELECT TO authenticated
  USING (is_finance_or_admin(auth.uid()));

-- Bills: finance/admin can insert
CREATE POLICY bills_admin_insert ON bills
  FOR INSERT TO authenticated
  WITH CHECK (is_finance_or_admin(auth.uid()));

-- Bills: finance/admin can update
CREATE POLICY bills_admin_update ON bills
  FOR UPDATE TO authenticated
  USING (is_finance_or_admin(auth.uid()));

-- Bills: finance/admin can delete
CREATE POLICY bills_admin_delete ON bills
  FOR DELETE TO authenticated
  USING (is_finance_or_admin(auth.uid()));

-- Bill items: students can read items for their own bills
CREATE POLICY bill_items_student_select ON bill_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM bills WHERE bills.id = bill_items.bill_id AND bills.student_id = auth.uid()
  ));

-- Bill items: finance/admin can read all
CREATE POLICY bill_items_admin_select ON bill_items
  FOR SELECT TO authenticated
  USING (is_finance_or_admin(auth.uid()));

-- Bill items: finance/admin can insert
CREATE POLICY bill_items_admin_insert ON bill_items
  FOR INSERT TO authenticated
  WITH CHECK (is_finance_or_admin(auth.uid()));

-- Bill items: finance/admin can update
CREATE POLICY bill_items_admin_update ON bill_items
  FOR UPDATE TO authenticated
  USING (is_finance_or_admin(auth.uid()));

-- Bill items: finance/admin can delete
CREATE POLICY bill_items_admin_delete ON bill_items
  FOR DELETE TO authenticated
  USING (is_finance_or_admin(auth.uid()));
