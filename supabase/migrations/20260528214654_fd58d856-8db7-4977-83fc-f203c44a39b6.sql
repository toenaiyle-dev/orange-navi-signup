
CREATE TABLE public.trainer_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instructor_name TEXT NOT NULL,
  assigned_course TEXT NOT NULL,
  department_track TEXT NOT NULL,
  onboarding_date DATE NOT NULL,
  r1_initials TEXT NOT NULL,
  r2_initials TEXT NOT NULL,
  r3_initials TEXT NOT NULL,
  r4_initials TEXT NOT NULL,
  signature TEXT NOT NULL,
  signed_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trainer_agreements TO authenticated;
GRANT ALL ON public.trainer_agreements TO service_role;

ALTER TABLE public.trainer_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own agreements"
  ON public.trainer_agreements FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own agreements"
  ON public.trainer_agreements FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own agreements"
  ON public.trainer_agreements FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);
