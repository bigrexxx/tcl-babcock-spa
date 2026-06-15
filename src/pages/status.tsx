import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TclNav } from "@/components/tcl/TclNav";
import { TclFooter } from "@/components/tcl/TclFooter";
import { supabase } from "@/integrations/supabase/client";

type S = "pending" | "reviewing" | "accepted" | "rejected" | "not_found";

export default function StatusPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<S | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => { document.title = "Application Status — TCL Babcock"; }, []);

  const check = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setServerError(null);
    try {
      const { data: rows, error } = await supabase
        .from("applications")
        .select("status")
        .eq("email", email.trim().toLowerCase())
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) throw new Error(error.message);
      if (!rows || rows.length === 0) { setResult("not_found"); return; }
      setResult(rows[0].status as S);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TclNav variant="back" />
      <div className="page-wrap">
        <div className="status-card">
          <div className="eyebrow center">Application</div>
          <h1>Check your status</h1>
          <form onSubmit={check}>
            <input type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "0.8rem 1rem", background: "var(--navy-deep)", border: "1px solid var(--border-mid)", color: "var(--white)", borderRadius: 8 }} />
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Checking…" : "Check Status"}</button>
          </form>
          {serverError && <div className="field-error" style={{ marginTop: "1rem" }}>{serverError}</div>}
          {result === "not_found" && (
            <><div className="status-badge badge-pending">? Not found</div>
            <p style={{ color: "var(--muted)" }}>We couldn't find an application for that email address.</p></>
          )}
          {(result === "pending" || result === "reviewing") && (
            <><div className="status-badge badge-pending">⏳ {result === "reviewing" ? "Under review" : "Pending"}</div>
            <p style={{ color: "var(--muted)" }}>Your application is being reviewed. We'll email you within 7 days.</p></>
          )}
          {result === "accepted" && (
            <><div className="status-badge badge-approved">✓ Accepted</div>
            <p style={{ color: "var(--muted)" }}>Welcome to TCL Babcock! Check your email for onboarding details.</p></>
          )}
          {result === "rejected" && (
            <><div className="status-badge badge-rejected">✕ Not selected</div>
            <p style={{ color: "var(--muted)" }}>Unfortunately your application was not successful this cycle.</p></>
          )}
          <p style={{ marginTop: "2rem", color: "var(--muted)", fontSize: "0.82rem" }}>
            Haven't applied yet? <Link to="/register" style={{ color: "var(--cream)", textDecoration: "underline" }}>Start an application →</Link>
          </p>
        </div>
      </div>
      <TclFooter />
    </>
  );
}
