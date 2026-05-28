import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, CheckCircle2, Download, Loader2 } from "lucide-react";
import { SignaturePad, type SignaturePadHandle } from "@/components/SignaturePad";
import { FilledAgreementDocument, type AgreementData } from "@/components/FilledAgreementDocument";

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

const LABELS: Record<string, string> = {
  instructor_name: "Instructor Full Name",
  assigned_course: "Assigned Course / Specialization",
  department_track: "Department / Track",
  onboarding_date: "Date of Onboarding",
  r1_initials: "R1 Initials",
  r2_initials: "R2 Initials",
  r3_initials: "R3 Initials",
  r4_initials: "R4 Initials",
  signature: "Signature",
  signed_date: "Signature Date",
};

const schema = z.object({
  instructor_name: z.string().trim().min(2, "Enter your full name").max(120, "Too long"),
  assigned_course: z.string().trim().min(2, "Enter the assigned course").max(120, "Too long"),
  department_track: z.string().trim().min(2, "Enter your department/track").max(120, "Too long"),
  onboarding_date: z.string().min(1, "Pick the onboarding date"),
  r1_initials: z.string().trim().min(2, "Add your initials (min 2)").max(6, "Initials too long"),
  r2_initials: z.string().trim().min(2, "Add your initials (min 2)").max(6, "Initials too long"),
  r3_initials: z.string().trim().min(2, "Add your initials (min 2)").max(6, "Initials too long"),
  r4_initials: z.string().trim().min(2, "Add your initials (min 2)").max(6, "Initials too long"),
  signature: z.string().min(50, "Please draw your signature").max(2_000_000, "Signature too large"),
  signed_date: z.string().min(1, "Pick the signature date"),
});

type FormState = Omit<AgreementData, "signature">;
type FieldErrors = Partial<Record<keyof AgreementData, string>>;

function friendlySupabaseError(err: { message?: string; code?: string } | null | undefined): string {
  if (!err) return "Unknown error";
  const msg = err.message ?? "";
  if (msg.includes("row-level security")) return "You aren't allowed to submit this — please sign in again.";
  if (msg.includes("duplicate key")) return "You've already submitted this agreement.";
  if (msg.includes("violates not-null")) return "A required field is missing.";
  if (msg.toLowerCase().includes("network") || msg.toLowerCase().includes("failed to fetch"))
    return "Network error — check your internet connection and try again.";
  return msg || "Could not save the agreement. Please try again.";
}

function AgreementPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const sigRef = useRef<SignaturePadHandle>(null);

  const [form, setForm] = useState<FormState>({
    instructor_name: "",
    assigned_course: "",
    department_track: "",
    onboarding_date: today,
    r1_initials: "",
    r2_initials: "",
    r3_initials: "",
    r4_initials: "",
    signed_date: today,
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState<AgreementData | null>(null);
  const [downloading, setDownloading] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setErrors({});

    const signature = sigRef.current?.toDataURL() ?? "";
    const parsed = schema.safeParse({ ...form, signature });

    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof AgreementData;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      const first = parsed.error.issues[0];
      const label = LABELS[String(first.path[0])] ?? "Field";
      toast.error(`${label}: ${first.message}`);
      return;
    }

    if (!user) {
      setSubmitError("Your session expired. Please sign in again.");
      toast.error("Session expired");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase
        .from("trainer_agreements")
        .insert({ ...parsed.data, user_id: user.id });

      if (error) {
        const friendly = friendlySupabaseError(error);
        setSubmitError(friendly);
        toast.error(friendly);
        return;
      }

      toast.success("Agreement submitted successfully!");
      setSubmitted(parsed.data);
    } catch (err: any) {
      const msg = err?.message ?? "Unexpected error";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const downloadPdf = async () => {
    if (!docRef.current || !submitted) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const pages = Array.from(docRef.current.children) as HTMLElement[];
      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], { scale: 2, backgroundColor: "#ffffff", useCORS: true });
        const img = canvas.toDataURL("image/jpeg", 0.92);
        const imgHeight = (canvas.height * pageWidth) / canvas.width;
        const h = Math.min(imgHeight, pageHeight);
        if (i > 0) pdf.addPage();
        pdf.addImage(img, "JPEG", 0, 0, pageWidth, h);
      }

      pdf.save(`DreamMore-Agreement-${submitted.instructor_name.replace(/\s+/g, "_") || "trainer"}.pdf`);
      toast.success("Document downloaded");
    } catch (err: any) {
      toast.error(`Could not generate PDF: ${err?.message ?? "unknown error"}`);
    } finally {
      setDownloading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header email={user.email} onSignOut={signOut} />
        <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-10">
          <div className="bg-card rounded-lg shadow-md p-8 border-t-4 border-primary text-center">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
            <h2 className="text-2xl font-bold text-[var(--navy)] mt-4">Welcome aboard, {submitted.instructor_name}!</h2>
            <p className="text-muted-foreground mt-2">
              Your Trainer Readiness Agreement has been submitted. Download a copy of the signed document below.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Button
                onClick={downloadPdf}
                disabled={downloading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {downloading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                Download Agreement (PDF)
              </Button>
              <Link to="/">
                <Button variant="outline">Back home</Button>
              </Link>
            </div>
          </div>

          {/* Preview the generated document */}
          <h3 className="text-sm font-semibold text-muted-foreground mt-10 mb-2">Document preview</h3>
          <div className="overflow-auto border border-border rounded-md bg-muted/40 p-4">
            <div style={{ transform: "scale(0.78)", transformOrigin: "top left", width: "fit-content" }}>
              <FilledAgreementDocument ref={docRef} data={submitted} />
            </div>
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
          <p className="opacity-90 text-sm mt-1">Fill in your details, initial each requirement, and sign below.</p>
        </div>

        {submitError && (
          <div className="bg-destructive/10 border-l-4 border-destructive text-destructive px-4 py-3 flex gap-2 items-start">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm"><strong>Submission failed.</strong> {submitError}</div>
          </div>
        )}

        <form onSubmit={submit} noValidate className="bg-card rounded-b-lg shadow-md p-6 space-y-8">
          <section>
            <h2 className="text-lg font-bold text-[var(--navy)] border-l-4 border-primary pl-3">1. Course Assignment</h2>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <FormField name="instructor_name" label="Instructor Full Name" value={form.instructor_name} onChange={set("instructor_name")} error={errors.instructor_name} />
              <FormField name="assigned_course" label="Assigned Course / Specialization" value={form.assigned_course} onChange={set("assigned_course")} error={errors.assigned_course} />
              <FormField name="department_track" label="Department / Track" value={form.department_track} onChange={set("department_track")} error={errors.department_track} />
              <FormField name="onboarding_date" label="Date of Onboarding" type="date" value={form.onboarding_date} onChange={set("onboarding_date")} error={errors.onboarding_date} />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--navy)] border-l-4 border-primary pl-3">2. Core Requirements Verification</h2>
            <p className="text-sm text-muted-foreground mt-1">Add your initials beside each requirement to confirm compliance.</p>
            <div className="mt-4 space-y-3">
              {reqs.map((r) => {
                const errKey = r.key as keyof AgreementData;
                const err = errors[errKey];
                return (
                  <div key={r.key} className={`flex gap-4 items-start border rounded-md p-4 ${err ? "border-destructive bg-destructive/5" : "border-border bg-muted/40"}`}>
                    <div className="bg-[var(--navy)] text-[var(--navy-foreground)] font-bold text-xs rounded px-2 py-1 shrink-0">{r.code}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-[var(--navy)]">{r.title}</div>
                      <p className="text-sm text-muted-foreground">{r.desc}</p>
                    </div>
                    <div className="w-28 shrink-0">
                      <Label className="text-xs">Initials</Label>
                      <Input
                        maxLength={6}
                        value={form[r.key as keyof FormState] as string}
                        onChange={set(r.key as keyof FormState)}
                        placeholder="ABC"
                        className={`uppercase ${err ? "border-destructive" : ""}`}
                      />
                      {err && <p className="text-xs text-destructive mt-1">{err}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--navy)] border-l-4 border-primary pl-3">3. Formal Agreement & Signature</h2>
            <div className="mt-4 space-y-4">
              <div>
                <Label className="text-sm">Instructor Signature</Label>
                <SignaturePad ref={sigRef} className="mt-1" />
                {errors.signature && <p className="text-xs text-destructive mt-1">{errors.signature}</p>}
              </div>
              <div className="sm:max-w-xs">
                <FormField name="signed_date" label="Date" type="date" value={form.signed_date} onChange={set("signed_date")} error={errors.signed_date} />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="submit" disabled={busy} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              {busy ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting…</> : "Submit Agreement"}
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

function FormField({
  name, label, value, onChange, type = "text", error,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <Label htmlFor={name} className="text-sm">{label}</Label>
      <Input
        id={name}
        type={type}
        value={value}
        onChange={onChange}
        maxLength={120}
        className={`mt-1 ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && <p id={`${name}-error`} className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
