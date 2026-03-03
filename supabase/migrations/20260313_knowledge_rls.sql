-- Add RLS policies for documents and document_sections tables
-- These tables had RLS enabled but NO policies → blocked all operations

-- Documents: admin can do everything, authenticated can read
CREATE POLICY "Admin full access to documents" ON public.documents
  FOR ALL TO authenticated
  USING (public.is_admin());

CREATE POLICY "Authenticated can read documents" ON public.documents
  FOR SELECT TO authenticated
  USING (true);

-- Document sections: admin can do everything, authenticated can read
CREATE POLICY "Admin full access to document_sections" ON public.document_sections
  FOR ALL TO authenticated
  USING (public.is_admin());

CREATE POLICY "Authenticated can read document_sections" ON public.document_sections
  FOR SELECT TO authenticated
  USING (true);
