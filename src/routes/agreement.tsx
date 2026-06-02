import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { AlertCircle, CheckCircle2, Clock, Download, Loader2 } from "lucide-react";
import { SignaturePad, type SignaturePadHandle } from "@/components/SignaturePad";
import { FilledAgreementDocument, type AgreementData } from "@/components/FilledAgreementDocument";
import { DocumentDetails } from "@/components/DocumentDetails";
import { Checkbox } from "@/components/ui/checkbox";
import { TRACKS, COURSES, COURSES_BY_TRACK } from "@/lib/agreement-options";
import logoUrl from "@/assets/dreammore-logo.svg";

export const Route = createFileRoute("/agreement")({
  head: () => ({ meta: [{ title: "Trainer Readiness Agreement — Dream-More Digital" }] }),
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
  r1_initials: "Requirement R1",
  r2_initials: "Requirement R2",
  r3_initials: "Requirement R3",
  r4_initials: "Requirement R4",
  signature: "Signature",
  signed_date: "Signature Date",
};

const tickMsg = "Please tick to confirm";
const schema = z.object({
  instructor_name: z.string().trim().min(2, "Enter your full name").max(120, "Too long"),
  department_track: z.enum(["Track A", "Track B"], { message: "Pick Track A or Track B" }),
  assigned_course: z.enum(COURSES as unknown as [string, ...string[]], { message: "Pick a course from the list" }),
  onboarding_date: z.string().min(1, "Pick the onboarding date"),
  r1_initials: z.literal("Confirmed", { message: tickMsg }),
  r2_initials: z.literal("Confirmed", { message: tickMsg }),
  r3_initials: z.literal("Confirmed", { message: tickMsg }),
  r4_initials: z.literal("Confirmed", { message: tickMsg }),
  signature: z.string().min(50, "Please draw your signature").max(2_000_000, "Signature too large"),
  signed_date: z.string().min(1, "Pick the signature date"),
}).refine(
  (d) => (COURSES_BY_TRACK as Record<string, readonly string[]>)[d.department_track]?.includes(d.assigned_course),
  { message: "Selected course does not belong to the chosen track", path: ["assigned_course"] },
);

type FormState = Omit<AgreementData, "signature" | "admin_signature" | "admin_signed_date">;
type FieldErrors = Partial<Record<keyof AgreementData, string>>;
type AgreementRow = AgreementData & { id: string; status: string; admin_signature: string | null; admin_signed_date: string | null };

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
  const { isAdmin, loading: roleLoading } = useUserRole();
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
  const [existing, setExisting] = useState<AgreementRow | null>(null);
  const [fetching, setFetching] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [tab, setTab] = useState<"details" | "form">("details");
  const docRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!roleLoading && isAdmin) navigate({ to: "/admin" });
  }, [isAdmin, roleLoading, navigate]);

  const refresh = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    const { data } = await supabase
      .from("trainer_agreements")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setExisting((data as AgreementRow | null) ?? null);
    setFetching(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const set = <K extends keyof FormState,>(k: K) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const setTrack = (v: string) => {
    setForm((f) => ({ ...f, department_track: v, assigned_course: "" }));
    setErrors((er) => ({ ...er, department_track: undefined, assigned_course: undefined }));
  };

  const toggleReq = (key: keyof FormState) => (checked: boolean) => {
    setForm((f) => ({ ...f, [key]: checked ? "Confirmed" : "" }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const goToForm = () => {
    setTab("form");
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  };

  const handleTabChange = (v: string) => {
    setTab(v as "details" | "form");
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
    if (!user) { toast.error("Session expired"); return; }

    setBusy(true);
    try {
      const { error } = await supabase
        .from("trainer_agreements")
        .insert({ ...parsed.data, user_id: user.id, status: "pending" });

      if (error) {
        const friendly = friendlySupabaseError(error);
        setSubmitError(friendly);
        toast.error(friendly);
        return;
      }
      toast.success("Agreement submitted — awaiting admin approval");
      await refresh();
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
    if (!docRef.current || !existing) return;
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
      pdf.save(`Dream-More Digital-Agreement-${existing.instructor_name.replace(/\s+/g, "_") || "trainer"}.pdf`);
      toast.success("Document downloaded");
    } catch (err: any) {
      toast.error(`Could not generate PDF: ${err?.message ?? "unknown error"}`);
    } finally {
      setDownloading(false);
    }
  };

  if (loading || !user || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
      </div>
    );
  }

  // Pending state
  if (existing && existing.status === "pending") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header email={user.email} onSignOut={signOut} />
        <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-10">
          <div className="bg-card rounded-lg shadow-md p-8 border-t-4 border-primary text-center">
            <Clock className="h-16 w-16 text-primary mx-auto" />
            <h2 className="text-2xl font-bold text-[var(--navy)] mt-4">Awaiting admin approval</h2>
            <p className="text-muted-foreground mt-2">
              Thanks, {existing.instructor_name}. Your agreement was submitted on{" "}
              {existing.signed_date}. An administrator will review and counter-sign it shortly.
              You'll be able to download the signed PDF here once approved.
            </p>
            <Button variant="outline" onClick={refresh} className="mt-6">
              Check status
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Approved state
  if (existing && existing.status === "approved") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header email={user.email} onSignOut={signOut} />
        <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-10">
          <div className="bg-card rounded-lg shadow-md p-8 border-t-4 border-primary text-center">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
            <h2 className="text-2xl font-bold text-[var(--navy)] mt-4">Approved — welcome aboard, {existing.instructor_name}!</h2>
            <p className="text-muted-foreground mt-2">Your agreement has been signed by Dream-More Digital administration.</p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Button onClick={downloadPdf} disabled={downloading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {downloading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                Download Agreement (PDF)
              </Button>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-muted-foreground mt-10 mb-2">Document preview</h3>
          <div className="overflow-auto border border-border rounded-md bg-muted/40 p-4">
            <div style={{ transform: "scale(0.78)", transformOrigin: "top left", width: "fit-content" }}>
              <FilledAgreementDocument ref={docRef} data={existing} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // No agreement yet — tabs view
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header email={user.email} onSignOut={signOut} />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-10">
        <div className="bg-primary text-primary-foreground rounded-t-lg px-6 py-5">
          <h1 className="text-2xl font-bold">Trainer Onboarding</h1>
          <p className="opacity-90 text-sm mt-1">Read the document, then complete the application form.</p>
        </div>

        <div className="bg-card rounded-b-lg shadow-md p-6">
          <Tabs value={tab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="details">1. Document Details</TabsTrigger>
              <TabsTrigger value="form">2. Application Form</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6">
              <DocumentDetails />
              <div className="flex justify-end mt-6">
                <Button onClick={goToForm} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Continue to Application Form →
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="form" className="mt-6">
              {submitError && (
                <div className="bg-destructive/10 border-l-4 border-destructive text-destructive px-4 py-3 flex gap-2 items-start mb-4">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="text-sm"><strong>Submission failed.</strong> {submitError}</div>
                </div>
              )}

              <form onSubmit={submit} noValidate className="space-y-8">
                <section>
                  <h2 className="text-lg font-bold text-[var(--navy)] border-l-4 border-primary pl-3">1. Course Assignment</h2>
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <TextField name="instructor_name" label="Instructor Full Name" value={form.instructor_name} onChange={(e) => set("instructor_name")(e.target.value)} error={errors.instructor_name} />

                    <TextField name="onboarding_date" label="Date of Onboarding" type="date" value={form.onboarding_date} onChange={(e) => set("onboarding_date")(e.target.value)} error={errors.onboarding_date} />

                    <div>
                      <Label className="text-sm">Department / Track</Label>
                      <Select value={form.department_track} onValueChange={setTrack}>
                        <SelectTrigger className={`mt-1 ${errors.department_track ? "border-destructive" : ""}`}>
                          <SelectValue placeholder="Select a track first" />
                        </SelectTrigger>
                        <SelectContent>
                          {TRACKS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {errors.department_track && <p className="text-xs text-destructive mt-1">{errors.department_track}</p>}
                    </div>

                    <div>
                      <Label className="text-sm">Assigned Course / Specialization</Label>
                      <Select
                        value={form.assigned_course}
                        onValueChange={set("assigned_course")}
                        disabled={!form.department_track}
                      >
                        <SelectTrigger className={`mt-1 ${errors.assigned_course ? "border-destructive" : ""}`}>
                          <SelectValue placeholder={form.department_track ? "Select a course" : "Pick a track first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {(form.department_track
                            ? (COURSES_BY_TRACK as Record<string, readonly string[]>)[form.department_track] ?? []
                            : []
                          ).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {errors.assigned_course && <p className="text-xs text-destructive mt-1">{errors.assigned_course}</p>}
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-bold text-[var(--navy)] border-l-4 border-primary pl-3">2. Core Requirements Verification</h2>
                  <p className="text-sm text-muted-foreground mt-1">Tick each requirement to confirm you meet it.</p>
                  <div className="mt-4 space-y-3">
                    {reqs.map((r) => {
                      const errKey = r.key as keyof AgreementData;
                      const err = errors[errKey];
                      const checked = form[r.key as keyof FormState] === "Confirmed";
                      return (
                        <label
                          key={r.key}
                          htmlFor={r.key}
                          className={`flex gap-4 items-start border rounded-md p-4 cursor-pointer transition-colors ${
                            err ? "border-destructive bg-destructive/5"
                            : checked ? "border-primary bg-primary/5"
                            : "border-border bg-muted/40 hover:bg-muted"
                          }`}
                        >
                          <div className="bg-[var(--navy)] text-[var(--navy-foreground)] font-bold text-xs rounded px-2 py-1 shrink-0">{r.code}</div>
                          <div className="flex-1">
                            <div className="font-semibold text-[var(--navy)]">{r.title}</div>
                            <p className="text-sm text-muted-foreground">{r.desc}</p>
                            {err && <p className="text-xs text-destructive mt-1">{err}</p>}
                          </div>
                          <Checkbox
                            id={r.key}
                            checked={checked}
                            onCheckedChange={(v) => toggleReq(r.key as keyof FormState)(v === true)}
                            className="mt-1 h-5 w-5"
                          />
                        </label>
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
                      <TextField name="signed_date" label="Date" type="date" value={form.signed_date} onChange={(e) => set("signed_date")(e.target.value)} error={errors.signed_date} />
                    </div>
                  </div>
                </section>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button type="submit" disabled={busy} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {busy ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting…</> : "Submit for Admin Approval"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function Header({ email, onSignOut }: { email?: string; onSignOut: () => void }) {
  return (
    <header className="bg-[var(--navy)] text-[var(--navy-foreground)] py-4 px-6 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/95 p-1 shadow-sm">
          <img src={logoUrl} alt="Dream-More Digital" className="h-full w-full object-contain" />
        </div>
        <span className="font-bold tracking-tight">Dream-More Digital Academics</span>
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

function TextField({
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
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
