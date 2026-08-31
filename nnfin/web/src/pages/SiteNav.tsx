import { Link } from "react-router-dom";
import { useSessionNav } from "../features/auth/useSessionNav";
import { publicPath } from "../shared/lib/publicPath";

function Logo({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="4" fill="url(#lgm)" />
      <rect x="10" y="10" width="12" height="12" rx="4" fill="url(#lgm)" opacity=".55" />
    </svg>
  );
}

export function SiteNav() {
  const { signedIn, accountLabel, logout } = useSessionNav();

  return (
    <nav className="nav" aria-label="Main">
      <a className="nav-logo" href="#top" aria-label="NN-Finanzberatung Startseite">
        <Logo size={24} />
        NN Finanz
      </a>
      <div className="nav-links">
        <a href="#why">Marktplatz</a>
        <a href="#keytools">Produkte</a>
        <a href="#pricing">Starten</a>
        <a href="#impressum">Impressum</a>
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
      <button className="nav-cta" type="button" hidden={!signedIn} onClick={logout}>
        Abmelden
      </button>
    </nav>
  );
}
