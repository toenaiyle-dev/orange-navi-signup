import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/agreement")({
  head: () => ({ meta: [{ title: "Trainer Readiness Agreement — DreamMore" }] }),
  component: AgreementPage,
});

const reqs = [
  { key: "r1_initials", code: "R1", title: "Practical Skill", desc: "I confirm I possess practical, real-world mastery in my assigned course field and have a demonstrable portfolio." },
  { key: "r2_initials", code: "R2", title: "LMS Readiness", desc: "I confirm I am ready to record video tutorials, write PDF guides, and create cheat sheets for my assigned course." },
  { key: "r3_initials", code: "R3", title: "Delivery Style", desc: "I confirm I can deliver high-energy, engaging, and clearly structured lessons to students." },
  { key: "r4_initials", code: "R4", title: "Tech Literacy", desc: "I confirm I am comfortable using computers, managing digital classrooms, and uploading materials to the LMS." },
] as const;

const schema = z.object({
  instructor_name: z.string().trim().min(1).max(120),
  assigned_course: z.string().trim().min(1).max(120),
  department_track: z.string().trim().min(1).max(120),
  onboarding_date: z.string().min(1),
  r1_initials: z.string().trim().min(1).max(6),
  r2_initials: z.string().trim().min(1).max(6),
  r3_initials: z.string().trim().min(1).max(6),
  r4_initials: z.string().trim().min(1).max(6),
  signature: z.string().trim().min(2).max(120),
  signed_date: z.string().min(1),
});

function AgreementPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    instructor_name: "",
    assigned_course: "",
    department_track: "",
    onboarding_date: today,
    r1_initials: "",
    r2_initials: "",
    r3_initials: "",
    r4_initials: "",
    signature: "",
    signed_date: today,
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("trainer_agreements").insert({
      ...parsed.data,
      user_id: user.id,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Agreement submitted!");
    setDone(true);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header email={user.email} onSignOut={signOut} />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-md text-center bg-card rounded-lg shadow-md p-10 border-t-4 border-primary">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
            <h2 className="text-2xl font-bold text-[var(--navy)] mt-4">Welcome aboard!</h2>
            <p className="text-muted-foreground mt-2">
              Your Trainer Readiness Agreement was submitted successfully. The DreamMore team will reach out shortly.
            </p>
            <Link to="/"><Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">Back home</Button></Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header email={user.email} onSignOut={signOut} />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-10">
        <div className="bg-primary text-primary-foreground rounded-t-lg px-6 py-5">
          <h1 className="text-2xl font-bold">Trainer Engagement & Readiness Format</h1>
          <p className="opacity-90 text-sm mt-1">Please complete all sections below.</p>
        </div>

        <form onSubmit={submit} className="bg-card rounded-b-lg shadow-md p-6 space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold text-[var(--navy)] border-l-4 border-primary pl-3">1. Course Assignment</h2>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <Field label="Instructor Full Name" value={form.instructor_name} onChange={set("instructor_name")} />
              <Field label="Assigned Course / Specialization" value={form.assigned_course} onChange={set("assigned_course")} />
              <Field label="Department / Track" value={form.department_track} onChange={set("department_track")} />
              <Field label="Date of Onboarding" type="date" value={form.onboarding_date} onChange={set("onboarding_date")} />
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-bold text-[var(--navy)] border-l-4 border-primary pl-3">2. Core Requirements Verification</h2>
            <p className="text-sm text-muted-foreground mt-1">Initial next to each requirement to confirm compliance.</p>
            <div className="mt-4 space-y-3">
              {reqs.map((r) => (
                <div key={r.key} className="flex gap-4 items-start border border-border rounded-md p-4 bg-muted/40">
                  <div className="bg-[var(--navy)] text-[var(--navy-foreground)] font-bold text-xs rounded px-2 py-1 shrink-0">{r.code}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-[var(--navy)]">{r.title}</div>
                    <p className="text-sm text-muted-foreground">{r.desc}</p>
                  </div>
                  <div className="w-24 shrink-0">
                    <Label className="text-xs">Initials</Label>
                    <Input
                      maxLength={6}
                      value={form[r.key as keyof typeof form]}
                      onChange={set(r.key as keyof typeof form)}
                      placeholder="ABC"
                      className="uppercase"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-lg font-bold text-[var(--navy)] border-l-4 border-primary pl-3">3. Formal Agreement & Signature</h2>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <Field label="Instructor Signature (full name)" value={form.signature} onChange={set("signature")} />
              <Field label="Date" type="date" value={form.signed_date} onChange={set("signed_date")} />
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={busy} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              {busy ? "Submitting…" : "Submit Agreement"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

function Header({ email, onSignOut }: { email?: string; onSignOut: () => void }) {
  return (
    <header className="bg-[var(--navy)] text-[var(--navy-foreground)] py-4 px-6 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">D</div>
        <span className="font-bold">DreamMore Academics</span>
      </Link>
      <div className="flex items-center gap-3 text-sm">
        <span className="opacity-80 hidden sm:inline">{email}</span>
        <Button onClick={onSignOut} variant="outline" size="sm" className="border-white/30 bg-transparent text-[var(--navy-foreground)] hover:bg-white/10">
          Sign out
        </Button>
      </div>
    </header>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string }) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <Input type={type} value={value} onChange={onChange} required maxLength={120} className="mt-1" />
    </div>
  );
}
