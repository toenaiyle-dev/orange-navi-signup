import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Award, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DreamMore Academics — Faculty Onboarding" },
      { name: "description", content: "Join the DreamMore Academics faculty. Sign up and complete your trainer onboarding agreement." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="bg-[var(--navy)] text-[var(--navy-foreground)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">D</div>
            <span className="font-bold tracking-tight">DreamMore Academics</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link to="/auth"><Button variant="ghost" className="text-[var(--navy-foreground)] hover:bg-white/10 hover:text-[var(--navy-foreground)]">Sign in</Button></Link>
            <Link to="/auth"><Button className="bg-primary text-primary-foreground hover:bg-primary/90">Get started</Button></Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[var(--navy)] text-[var(--navy-foreground)] pb-20">
        <div className="mx-auto max-w-6xl px-6 pt-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded">
              Joining the Faculty
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight">
              Shaping the Future of <span className="text-primary">Digital Skills</span>
            </h1>
            <p className="mt-4 text-white/80 text-lg">
              Building a top-tier, organized, and practical learning environment.
              Sign up and complete your Trainer Readiness Agreement.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/auth">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">Sign up to begin</Button>
              </Link>
              <Link to="/agreement">
                <Button size="lg" variant="outline" className="border-white/30 text-[var(--navy-foreground)] bg-transparent hover:bg-white/10">Open form</Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Award, title: "Practical Mastery", color: "bg-primary" },
              { icon: Sparkles, title: "Teaching Impact", color: "bg-white text-[var(--navy)]" },
              { icon: Users, title: "Academic Respect", color: "bg-white text-[var(--navy)]" },
              { icon: CheckCircle2, title: "Student Outcomes", color: "bg-primary" },
            ].map((v, i) => (
              <div key={i} className={`${v.color} rounded-lg p-5 flex flex-col gap-2`}>
                <v.icon className="h-7 w-7" />
                <div className="font-bold">{v.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold text-[var(--navy)]">The 4 Core Teacher Requirements</h2>
        <p className="text-muted-foreground mt-2">Every DreamMore instructor must meet these four pillars.</p>
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          {[
            { tag: "R1", title: "Proven Practical Skill", desc: "Portfolio of real-world work and deep mastery in your field." },
            { tag: "R2", title: "LMS Readiness", desc: "Record tutorials, write PDF guides, and design cheat sheets." },
            { tag: "R3", title: "Engaging Delivery Style", desc: "Confident, high-energy classes that motivate students." },
            { tag: "R4", title: "Tech Literacy", desc: "Comfortable with digital tools and LMS backend management." },
          ].map((r) => (
            <div key={r.tag} className="bg-card border-l-4 border-primary rounded-md p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-[var(--navy)] text-[var(--navy-foreground)] font-bold rounded px-3 py-1 text-sm">{r.tag}</div>
                <div>
                  <h3 className="font-bold text-[var(--navy)]">{r.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-primary text-primary-foreground rounded-lg p-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-2xl font-bold">Ready to join the team?</h3>
            <p className="opacity-90">Sign up, then complete the Trainer Readiness Agreement.</p>
          </div>
          <Link to="/auth">
            <Button size="lg" className="bg-[var(--navy)] text-[var(--navy-foreground)] hover:bg-[var(--navy)]/90">Create account</Button>
          </Link>
        </div>
      </section>

      <footer className="bg-[var(--navy)] text-[var(--navy-foreground)]/70 text-center py-6 text-sm">
        DreamMore Academics | Right work at right time
      </footer>
    </div>
  );
}
