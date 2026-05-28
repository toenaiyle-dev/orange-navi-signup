import { forwardRef } from "react";
import logoUrl from "@/assets/dreammore-logo.svg";

export type AgreementData = {
  instructor_name: string;
  assigned_course: string;
  department_track: string;
  onboarding_date: string;
  r1_initials: string;
  r2_initials: string;
  r3_initials: string;
  r4_initials: string;
  signature: string; // data URL of signature image
  signed_date: string;
  admin_signature?: string | null;
  admin_signed_date?: string | null;
};

const REQS = [
  { code: "R1 — Practical Skill", text: "I confirm I possess practical, real-world mastery in my assigned course field and have a demonstrable portfolio." },
  { code: "R2 — LMS Readiness", text: "I confirm I am ready to record video tutorials, write PDF guides, and create cheat sheets for my assigned course." },
  { code: "R3 — Delivery Style", text: "I confirm I can deliver high-energy, engaging, and clearly structured lessons to students." },
  { code: "R4 — Tech Literacy", text: "I confirm I am comfortable using computers, managing digital classrooms, and uploading materials to the LMS." },
];

const navy = "#1a2a52";
const orange = "#ea7a2c";

function Page({ children, n }: { children: React.ReactNode; n: number }) {
  return (
    <div
      style={{
        width: "794px", // ~A4 width @ 96dpi
        minHeight: "1123px",
        padding: "48px 56px",
        background: "#ffffff",
        color: "#1f2937",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "12px",
        lineHeight: 1.5,
        position: "relative",
        boxSizing: "border-box",
        pageBreakAfter: "always",
      }}
    >
      {/* Header bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 34, height: 34, background: orange, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, borderRadius: 4 }}>D</div>
        <div style={{ fontWeight: 700, color: navy, fontSize: 14 }}>DreamMore</div>
      </div>
      {children}
      <div style={{ position: "absolute", left: 56, right: 56, bottom: 24, display: "flex", justifyContent: "space-between", borderTop: `1px solid ${orange}`, paddingTop: 8, fontSize: 10, color: "#6b7280" }}>
        <span>DreamMore Academics | Right work at right time</span>
        <span>Page {n}</span>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>{label}</div>
      <div style={{ borderBottom: `1.5px solid ${navy}`, padding: "4px 2px", minHeight: 22, color: navy, fontWeight: 600 }}>{value || "—"}</div>
    </div>
  );
}

export const FilledAgreementDocument = forwardRef<HTMLDivElement, { data: AgreementData }>(
  function FilledAgreementDocument({ data }, ref) {
    return (
      <div ref={ref} style={{ background: "#fff" }}>
        {/* PAGE 1 */}
        <Page n={1}>
          <div style={{ color: orange, fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>JOINING THE</div>
          <h1 style={{ color: navy, fontSize: 32, margin: "4px 0 6px", lineHeight: 1.15 }}>DreamMore Academics Faculty</h1>
          <div style={{ fontStyle: "italic", color: "#6b7280", marginBottom: 18 }}>Shaping the Future of Digital Skills</div>
          <div style={{ color: navy, fontWeight: 600, marginBottom: 24 }}>Building a top-tier, organized, and practical learning environment</div>

          <h2 style={{ color: navy, fontSize: 18, borderLeft: `4px solid ${orange}`, paddingLeft: 10 }}>Welcome to Our Team</h2>
          <p style={{ fontStyle: "italic", color: "#374151" }}>Thank you for taking the time to meet with us today.</p>
          <p>
            At DreamMore Academics, our ultimate goal is to build a practical, organized, and top-tier training department.
            We are dedicated to developing high-level digital skills, supporting student growth, and producing job-ready
            creative professionals. We believe that real education comes from professionals who work in the industry — and
            that is why we are excited to discuss how your expertise aligns with our vision.
          </p>

          <h3 style={{ color: navy, marginTop: 18 }}>What We Value</h3>
          <div style={{ color: orange, fontWeight: 700 }}>Skills Over Certificates</div>
          <p style={{ marginTop: 4 }}>Real-world capability always comes first. We value what you can build, create, and demonstrate.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
            {[
              { t: "🏆 Practical Mastery", b: ["Proven real-world capability", "Demonstrated output over theory", "Strong field portfolio required"], bg: "#f0f4fa" },
              { t: "🎯 Teaching Impact", b: ["Ability to explain clearly", "Student results over credentials", "Portfolio-led course design"], bg: "#fff8f0" },
              { t: "📚 Academic Respect", b: ["Degrees are valued", "Practical teaching matters more", "Industry experience is key"], bg: "#fff8f0" },
              { t: "🚀 Student Outcomes", b: ["Job-ready graduates", "Strong portfolio on completion", "High-quality course delivery"], bg: "#f0f4fa" },
            ].map((c, i) => (
              <div key={i} style={{ background: c.bg, padding: 12, borderRadius: 6 }}>
                <div style={{ fontWeight: 700, color: navy, marginBottom: 6 }}>{c.t}</div>
                <ul style={{ paddingLeft: 16, margin: 0 }}>{c.b.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            ))}
          </div>
        </Page>

        {/* PAGE 2 */}
        <Page n={2}>
          <h2 style={{ color: navy, fontSize: 20, borderLeft: `4px solid ${orange}`, paddingLeft: 10 }}>The 4 Core Teacher Requirements</h2>
          <p style={{ fontStyle: "italic", color: "#6b7280" }}>Every DreamMore instructor must meet these four pillars</p>

          {[
            { code: "R1", title: "Proven Practical Skill", bullets: ["Show a portfolio of real-world work and past projects", "Demonstrate deep mastery in your specialized field", "Theory alone is not sufficient — applied expertise is required"] },
            { code: "R2", title: "LMS Readiness", bullets: ["Record step-by-step video tutorials for course modules", "Write clear, structured PDF guides for each lesson", "Design quick-reference cheat sheets for students"] },
            { code: "R3", title: "Engaging Delivery Style", bullets: ["Confident, clear, and encouraging communication style", "High-energy classes that keep students motivated", "Ability to hold attention and simplify complex topics"] },
            { code: "R4", title: "Basic Computer & Tech Literacy", bullets: ["Comfortable navigating computers and digital tools", "Manage online or hybrid classroom environments", "Upload and organize materials in the LMS backend"] },
          ].map((r) => (
            <div key={r.code} style={{ display: "flex", gap: 10, marginTop: 10, borderLeft: `3px solid ${orange}`, paddingLeft: 10 }}>
              <div style={{ background: navy, color: "#fff", padding: "3px 8px", borderRadius: 4, fontWeight: 700, height: 22 }}>{r.code}</div>
              <div>
                <div style={{ fontWeight: 700, color: navy }}>{r.title}</div>
                <ul style={{ paddingLeft: 16, margin: "4px 0" }}>{r.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
              </div>
            </div>
          ))}

          <h3 style={{ color: navy, marginTop: 22 }}>Our Team & Course Alignment</h3>
          <div style={{ fontStyle: "italic", color: "#6b7280" }}>Driving Excellence Across 18+ Specialized Fields</div>
          <p>
            Every instructor is placed strategically where their practical mastery shines. Our structure pairs you with our
            Curriculum Coordinator and Content Developers, while our Design Team builds beautiful visual templates for your
            course materials.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
            <div style={{ background: navy, color: "#fff", padding: 8, fontWeight: 700, textAlign: "center" }}>COURSE TRACK A</div>
            <div style={{ background: orange, color: "#fff", padding: 8, fontWeight: 700, textAlign: "center" }}>COURSE TRACK B</div>
            {["Video Editing", "Graphics Design", "Cinematography", "Web Development", "Robotics", "Mobile Design", "Tech Maintenance", "Digital Marketing", "Motion Graphics", "Photography"].map((c, i) => (
              <div key={c} style={{ border: "1px solid #e5e7eb", padding: 8, background: i % 2 ? "#fff8f0" : "#f0f4fa" }}>{c}</div>
            ))}
          </div>
        </Page>

        {/* PAGE 3 */}
        <Page n={3}>
          <h2 style={{ color: navy, fontSize: 20, borderLeft: `4px solid ${orange}`, paddingLeft: 10 }}>Next Steps & Onboarding</h2>
          <p style={{ fontStyle: "italic", color: "#6b7280" }}>Finalizing Our Partnership</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
            {[
              ["STEP 1", "Complete Module Outline Draft"],
              ["STEP 2", "Review & Sign Trainer Readiness Format"],
              ["STEP 3", "Schedule LMS Video Recording Trial Run"],
            ].map(([s, t]) => (
              <div key={s} style={{ border: `1px solid ${orange}`, padding: 10, borderRadius: 4 }}>
                <div style={{ color: orange, fontWeight: 700 }}>{s}</div>
                <div style={{ color: navy, fontWeight: 600 }}>{t}</div>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 14 }}>
            To maintain clear administrative accountability, we never leave instructor onboardings open-ended. The final step
            is to review our standard onboarding format, confirm that you meet our 4 core requirements, and sign the
            agreement. This establishes our partnership and allows us to schedule your initial LMS recording trial.
          </p>

          <h2 style={{ color: navy, fontSize: 20, marginTop: 18, borderLeft: `4px solid ${orange}`, paddingLeft: 10 }}>
            Trainer Engagement & Readiness Format
          </h2>
          <p style={{ fontStyle: "italic", color: "#6b7280" }}>Completed by instructor</p>

          <h3 style={{ color: navy, marginTop: 12 }}>1. Course Assignment</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Instructor Full Name" value={data.instructor_name} />
            <Field label="Assigned Course / Specialization" value={data.assigned_course} />
            <Field label="Department / Track" value={data.department_track} />
            <Field label="Date of Onboarding" value={data.onboarding_date} />
          </div>

          <h3 style={{ color: navy, marginTop: 12 }}>2. Core Requirements Verification Checklist</h3>
          <p style={{ fontStyle: "italic", color: "#6b7280", marginTop: 0 }}>Initialed by instructor to confirm compliance.</p>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 6 }}>
            <thead>
              <tr style={{ background: navy, color: "#fff" }}>
                <th style={{ padding: 6, textAlign: "left", width: "22%" }}>REQ.</th>
                <th style={{ padding: 6, textAlign: "left" }}>REQUIREMENT DESCRIPTION</th>
                <th style={{ padding: 6, textAlign: "center", width: "18%" }}>INITIALS</th>
              </tr>
            </thead>
            <tbody>
              {REQS.map((r, i) => (
                <tr key={r.code} style={{ background: i % 2 ? "#fff8f0" : "#fff" }}>
                  <td style={{ padding: 6, border: "1px solid #e5e7eb", fontWeight: 700, color: navy }}>{r.code}</td>
                  <td style={{ padding: 6, border: "1px solid #e5e7eb" }}>{r.text}</td>
                  <td style={{ padding: 6, border: "1px solid #e5e7eb", textAlign: "center", color: orange, fontWeight: 700, textTransform: "uppercase" }}>
                    {[data.r1_initials, data.r2_initials, data.r3_initials, data.r4_initials][i]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Page>

        {/* PAGE 4 */}
        <Page n={4}>
          <h2 style={{ color: navy, fontSize: 20, borderLeft: `4px solid ${orange}`, paddingLeft: 10 }}>3. Formal Agreement & Signature</h2>
          <p style={{ marginTop: 8 }}>
            By signing below, I confirm that the information provided is accurate and that I commit to meeting the four core
            requirements outlined above as a DreamMore Academics instructor.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, marginTop: 24 }}>
            <div>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Instructor Signature</div>
              <div style={{ border: `1.5px solid ${navy}`, height: 110, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
                {data.signature ? (
                  <img src={data.signature} alt="Signature" crossOrigin="anonymous" style={{ maxHeight: "100%", maxWidth: "100%" }} />
                ) : null}
              </div>
              <div style={{ fontWeight: 700, color: navy, marginTop: 6 }}>{data.instructor_name}</div>
              <div style={{ marginTop: 10 }}>
                <span style={{ color: "#6b7280" }}>Date: </span>
                <span style={{ borderBottom: `1.5px solid ${navy}`, padding: "0 30px", fontWeight: 600, color: navy }}>{data.signed_date}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Authorized by (DreamMore)</div>
              <div style={{ border: `1.5px solid ${navy}`, height: 110, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
                {data.admin_signature ? (
                  <img src={data.admin_signature} alt="Admin signature" crossOrigin="anonymous" style={{ maxHeight: "100%", maxWidth: "100%" }} />
                ) : null}
              </div>
              <div style={{ fontWeight: 700, color: navy, marginTop: 6 }}>DreamMore Administrator</div>
              <div style={{ marginTop: 10 }}>
                <span style={{ color: "#6b7280" }}>Date: </span>
                <span style={{ borderBottom: `1.5px solid ${navy}`, padding: "0 30px", fontWeight: 600, color: navy }}>{data.admin_signed_date || ""}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 50, textAlign: "center", color: navy, fontWeight: 700, fontSize: 14 }}>
            Thank you and welcome to the DreamMore Team! — Right work at right time
          </div>
        </Page>
      </div>
    );
  }
);
