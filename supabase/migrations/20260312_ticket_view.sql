-- Create a view that joins maintenance_requests with profiles via user_id
-- This fixes the PostgREST join issue (requester_id -> auth.users, not profiles)

CREATE OR REPLACE VIEW public.maintenance_requests_with_requester AS
SELECT
  mr.*,
  p.full_name_th AS requester_name_th,
  p.full_name_en AS requester_name_en,
  p.student_id AS requester_student_id
FROM public.maintenance_requests mr
LEFT JOIN public.profiles p ON p.user_id = mr.requester_id;

-- Grant access
GRANT SELECT ON public.maintenance_requests_with_requester TO authenticated;
GRANT SELECT ON public.maintenance_requests_with_requester TO anon;

-- View inherits RLS from underlying tables via security_invoker
ALTER VIEW public.maintenance_requests_with_requester SET (security_invoker = true);
