import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DreamMore Academics — Trainer Onboarding" },
      { name: "description", content: "Sign in to complete your DreamMore trainer agreement." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (loading || roleLoading) return;
    if (!user) navigate({ to: "/auth", replace: true });
    else if (isAdmin) navigate({ to: "/admin", replace: true });
    else navigate({ to: "/agreement", replace: true });
  }, [user, loading, isAdmin, roleLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
      Loading…
    </div>
  );
}
