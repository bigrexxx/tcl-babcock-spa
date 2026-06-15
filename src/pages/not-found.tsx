import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
      <div style={{ maxWidth: 420 }}>
        <h1 style={{ fontSize: "4rem", fontWeight: 800 }}>404</h1>
        <p style={{ color: "var(--muted)", margin: "1rem 0" }}>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary">Go home</Link>
      </div>
    </div>
  );
}
