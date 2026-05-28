import { COURSES } from "@/lib/agreement-options";

export function DocumentDetails() {
  return (
    <div className="space-y-8 text-sm leading-relaxed">
      <section>
        <div className="text-primary text-xs font-semibold tracking-widest">JOINING THE</div>
        <h2 className="text-2xl font-bold text-[var(--navy)] mt-1">DreamMore Academics Faculty</h2>
        <p className="italic text-muted-foreground">Shaping the Future of Digital Skills</p>
        <p className="mt-3">
          At DreamMore Academics, our ultimate goal is to build a practical, organized, and top-tier
          training department. We develop high-level digital skills, support student growth, and produce
          job-ready creative professionals. Real education comes from professionals who work in the
          industry — and we're excited to discuss how your expertise aligns with our vision.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-[var(--navy)] border-l-4 border-primary pl-3">
          What We Value
        </h3>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          {[
            { t: "🏆 Practical Mastery", b: ["Proven real-world capability", "Output over theory", "Strong portfolio"] },
            { t: "🎯 Teaching Impact", b: ["Explain clearly", "Student results matter", "Portfolio-led design"] },
            { t: "📚 Academic Respect", b: ["Degrees valued", "Practical teaching matters more", "Industry experience is key"] },
            { t: "🚀 Student Outcomes", b: ["Job-ready graduates", "Strong portfolio on completion", "High-quality delivery"] },
          ].map((c) => (
            <div key={c.t} className="bg-muted/50 rounded-md p-3">
              <div className="font-semibold text-[var(--navy)]">{c.t}</div>
              <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                {c.b.map((x) => <li key={x}>{x}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold text-[var(--navy)] border-l-4 border-primary pl-3">
          The 4 Core Teacher Requirements
        </h3>
        <div className="space-y-3 mt-3">
          {[
            { code: "R1", title: "Proven Practical Skill", b: ["Portfolio of real-world work", "Deep mastery in your field", "Applied expertise required"] },
            { code: "R2", title: "LMS Readiness", b: ["Record step-by-step video tutorials", "Write structured PDF guides", "Design cheat sheets"] },
            { code: "R3", title: "Engaging Delivery Style", b: ["Clear, encouraging communication", "High-energy classes", "Simplify complex topics"] },
            { code: "R4", title: "Basic Computer & Tech Literacy", b: ["Comfortable with digital tools", "Manage online classrooms", "Upload/organize LMS content"] },
          ].map((r) => (
            <div key={r.code} className="border-l-2 border-primary pl-3">
              <div className="flex items-center gap-2">
                <span className="bg-[var(--navy)] text-[var(--navy-foreground)] text-xs font-bold px-2 py-0.5 rounded">{r.code}</span>
                <span className="font-semibold text-[var(--navy)]">{r.title}</span>
              </div>
              <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                {r.b.map((x) => <li key={x}>{x}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold text-[var(--navy)] border-l-4 border-primary pl-3">
          Course Tracks
        </h3>
        <p className="text-muted-foreground mt-2">
          Every instructor is placed strategically where their practical mastery shines.
        </p>
        <div className="grid sm:grid-cols-2 gap-2 mt-3">
          <div className="bg-[var(--navy)] text-[var(--navy-foreground)] font-bold text-center py-2 rounded">COURSE TRACK A</div>
          <div className="bg-primary text-primary-foreground font-bold text-center py-2 rounded">COURSE TRACK B</div>
          {COURSES.map((c, i) => (
            <div
              key={c}
              className={`border border-border rounded px-3 py-2 ${i % 2 ? "bg-orange-50" : "bg-blue-50"}`}
            >
              {c}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold text-[var(--navy)] border-l-4 border-primary pl-3">
          Next Steps
        </h3>
        <ol className="list-decimal pl-5 mt-2 space-y-1">
          <li>Complete the Application Form tab</li>
          <li>Sign the Trainer Readiness Format</li>
          <li>An administrator reviews and counter-signs your agreement</li>
          <li>Once approved, your signed agreement becomes available to download</li>
        </ol>
      </section>
    </div>
  );
}
