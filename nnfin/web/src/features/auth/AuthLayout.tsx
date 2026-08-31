import { publicPath } from "../../shared/lib/publicPath";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useSessionNav } from "./useSessionNav";
import "../../shared/styles/auth.css";

function Logo({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="4" fill="url(#lgm)" />
      <rect x="10" y="10" width="12" height="12" rx="4" fill="url(#lgm)" opacity=".55" />
    </svg>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  const { signedIn, accountLabel, logout } = useSessionNav();

  return (
    <div className="auth-shell">
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <linearGradient id="lgm" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4f6bf5" />
            <stop offset="1" stopColor="#22b8d4" />
          </linearGradient>
        </defs>
      </svg>
      <nav className="nav" aria-label="Hauptnavigation">
        <Link className="nav-logo" to="/" aria-label="NN-Finanzberatung Startseite">
          <Logo size={24} />
          NN Finanz
        </Link>
        <div className="nav-links">
          <Link to="/#why">Leistungen</Link>
          <Link to="/#keytools">Beratung</Link>
        </div>
        <Link className="nav-login" to="/login" hidden={signedIn}>
          Anmelden
        </Link>
        <a className="nav-login" href={publicPath("app.html")} hidden={!signedIn}>
          {accountLabel}
        </a>
        <Link className="nav-cta" to="/signup" hidden={signedIn}>
          Konto eröffnen
        </Link>
        <button
          className="nav-cta"
          type="button"
          hidden={!signedIn}
          onClick={() => {
            logout();
            window.location.href = publicPath("");
          }}
        >
          Abmelden
        </button>
      </nav>
      {children}
    </div>
  );
}
