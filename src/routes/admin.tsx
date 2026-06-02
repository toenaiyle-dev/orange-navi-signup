import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { SignaturePad, type SignaturePadHandle } from "@/components/SignaturePad";
import { CheckCircle2, Clock, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import logoUrl from "@/assets/dreammore-logo.svg";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Dream-More Digital" }] }),
  component: AdminPage,
});

type Row = {
  id: string;
  user_id: string;
  instructor_name: string;
  assigned_course: string;
  department_track: string;
  onboarding_date: string;
  signature: string;
  signed_date: string;
  status: string;
  admin_signature: string | null;
  admin_signed_date: string | null;
  created_at: string;
};

function AdminPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [rows, setRows] = useState<Row[]>([]);
  const [fetching, setFetching] = useState(true);
  const [tab, setTab] = useState<"pending" | "approved">("pending");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const refresh = useCallback(async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from("trainer_agreements")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as Row[] | null) ?? []);
    setFetching(false);
  }, []);

  useEffect(() => {
    if (!roleLoading && isAdmin) refresh();
  }, [isAdmin, roleLoading, refresh]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold text-[var(--navy)]">Admin access required</h1>
        <p className="text-muted-foreground max-w-md">
          You're signed in but not an administrator. Ask an existing admin to grant you the role.
        </p>
        <Link to="/agreement"><Button variant="outline">Back to your agreement</Button></Link>
      </div>
    );
  }

  const pending = rows.filter((r) => r.status === "pending");
  const approved = rows.filter((r) => r.status === "approved");
  const visible = tab === "pending" ? pending : approved;

  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: "/" }); };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-[var(--navy)] text-[var(--navy-foreground)] py-4 px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoUrl} alt="Dream-More Digital" className="h-9 w-9 bg-white rounded-md p-1" />
          <span className="font-bold">Dream-More Digital — Admin</span>
        </Link>
        <Button onClick={signOut} variant="outline" size="sm" className="border-white/30 bg-transparent text-[var(--navy-foreground)] hover:bg-white/10">
          Sign out
        </Button>
      </header>

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-bold text-[var(--navy)]">Trainer Agreements</h1>
        <p className="text-muted-foreground text-sm">Review submissions, counter-sign, and approve.</p>

        <div className="mt-6 flex gap-2 border-b border-border">
          {(["pending", "approved"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px ${
                tab === t ? "border-primary text-[var(--navy)]" : "border-transparent text-muted-foreground"
              }`}
            >
              {t} ({t === "pending" ? pending.length : approved.length})
            </button>
          ))}
        </div>

        {fetching ? (
          <div className="text-center py-12 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline mr-2" /> Loading…</div>
        ) : visible.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No {tab} agreements.</div>
        ) : (
          <div className="space-y-4 mt-6">
            {visible.map((row) => (
              <AgreementCard key={row.id} row={row} onChanged={refresh} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function AgreementCard({ row, onChanged }: { row: Row; onChanged: () => void }) {
  const sigRef = useRef<SignaturePadHandle>(null);
  const [busy, setBusy] = useState(false);
  const [showSign, setShowSign] = useState(false);

  const approve = async () => {
    const adminSig = sigRef.current?.toDataURL();
    if (!adminSig) { toast.error("Please draw your signature first"); return; }
    setBusy(true);
    const { error } = await supabase
      .from("trainer_agreements")
      .update({
        status: "approved",
        admin_signature: adminSig,
        admin_signed_date: new Date().toISOString().slice(0, 10),
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Approved ${row.instructor_name}`);
    onChanged();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[var(--navy)]">{row.instructor_name}</h3>
            {row.status === "approved" ? (
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                <CheckCircle2 className="h-3 w-3" /> Approved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                <Clock className="h-3 w-3" /> Pending
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {row.assigned_course} · {row.department_track} · Onboarding {row.onboarding_date}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">Submitted {new Date(row.created_at).toLocaleString()}</div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Trainer signature ({row.signed_date})</div>
          <div className="border border-border rounded bg-white p-2 h-24 flex items-center justify-center">
            {row.signature ? <img src={row.signature} alt="Trainer signature" className="max-h-full" /> : <span className="text-muted-foreground text-xs">No signature</span>}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Admin signature {row.admin_signed_date ? `(${row.admin_signed_date})` : ""}</div>
          <div className="border border-border rounded bg-white p-2 h-24 flex items-center justify-center">
            {row.admin_signature ? <img src={row.admin_signature} alt="Admin signature" className="max-h-full" /> : <span className="text-muted-foreground text-xs">Not signed yet</span>}
          </div>
        </div>
      </div>

      {row.status === "pending" && (
        <div className="mt-4">
          {!showSign ? (
            <Button onClick={() => setShowSign(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Sign & Approve
            </Button>
          ) : (
            <div className="space-y-3">
              <SignaturePad ref={sigRef} />
              <div className="flex gap-2">
                <Button onClick={approve} disabled={busy} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {busy ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Approving…</> : "Confirm Approval"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowSign(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
