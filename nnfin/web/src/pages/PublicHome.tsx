import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useHomeMotion } from "../motion/useHomeMotion";
import { safeUrl } from "../shared/lib/safeUrl";
import { publicPath } from "../shared/lib/publicPath";
import { GrowthTable } from "./GrowthTable";
import { SiteNav } from "./SiteNav";

function cssVars(vars: Record<`--${string}`, string>): CSSProperties {
  return vars as CSSProperties;
}

export function PublicHome() {
  useHomeMotion();

  return (
    <>
      {/* logo mark: overlapping rounded diamonds, blue→cyan gradient */}
      <svg width="0" height="0" style={{position: "absolute"}} aria-hidden="true">
        <defs>
          <linearGradient id="lgm" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4f6bf5" />
            <stop offset="1" stopColor="#22b8d4" />
          </linearGradient>
        </defs>
      </svg>
      <SiteNav />
      {/* ============ HERO ============ */}
      <section className="hero" id="top">
        <svg className="hero-chart-bg" viewBox="0 0 460 560" fill="none" aria-hidden="true">
          <g stroke="#e4e4ec" strokeWidth="1">
            <line x1="40" y1="0" x2="40" y2="560" />
            <line x1="140" y1="0" x2="140" y2="560" />
            <line x1="240" y1="0" x2="240" y2="560" />
            <line x1="340" y1="0" x2="340" y2="560" />
            <line x1="0" y1="80" x2="460" y2="80" />
            <line x1="0" y1="180" x2="460" y2="180" />
            <line x1="0" y1="280" x2="460" y2="280" />
            <line x1="0" y1="380" x2="460" y2="380" />
            <line x1="0" y1="480" x2="460" y2="480" />
          </g>
          <g fill="#c9cad4" fontFamily="Inter,sans-serif" fontSize="12" fontWeight="500">
            <text x="0" y="84">
              70K
            </text>
            <text x="0" y="184">
              60K
            </text>
            <text x="0" y="284">
              50K
            </text>
            <text x="0" y="384">
              40K
            </text>
            <text x="0" y="484">
              30K
            </text>
            <text x="360" y="84">
              100K
            </text>
            <text x="370" y="184">
              20K
            </text>
          </g>
        </svg>
        <div className="wrap">
          <div className="hero-badge" data-hero>
            <span className="badge">
              <span className="dot">
              </span>
              Eine Plattform · viele Partnerbanken
            </span>
          </div>
          <h1 aria-label="Mehr Zins f\u00fcr Ihr Cash, ohne Bankhopping">
            <span className="line">
              <span data-hero-line>
                Mehr Zins für Ihr Cash,
              </span>
            </span>
            <span className="line">
              <span data-hero-line>
                ohne Bankhopping
              </span>
            </span>
          </h1>
          <p className="hero-sub" data-hero>
            NN Finanz verbindet Sparer und konservative Anleger mit Partnerbanken und Kreditgenossenschaften — Tagesgeld, Festgeld und einfache ETF-Portfolios, ohne bei jeder Bank selbst ein Konto zu eröffnen.
          </p>
          <div data-hero>
            <Link className="btn btn-dark btn-glow" to="/signup">
              Konto eröffnen
            </Link>
          </div>
          <p className="hero-micro" data-hero>
            Bereits Mandant?
            <Link to="/login" style={{fontWeight: "600", color: "var(--ink)"}}>
              Anmelden
            </Link>
          </p>
          <div className="hero-dash" data-hero-dash>
            <div className="dash" aria-label="Marktplatz-\u00dcbersicht">
              <aside className="dash-side">
                <div className="dash-brand">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="12" height="12" rx="4" fill="url(#lgm)" />
                    <rect x="10" y="10" width="12" height="12" rx="4" fill="url(#lgm)" opacity=".55" />
                  </svg>
                  NN Finanz
                </div>
                <div className="dash-nav active">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="9" rx="1.5" />
                    <rect x="14" y="3" width="7" height="5" rx="1.5" />
                    <rect x="14" y="11" width="7" height="10" rx="1.5" />
                    <rect x="3" y="15" width="7" height="6" rx="1.5" />
                  </svg>
                  Übersicht
                </div>
                <div className="dash-nav">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                  Konten
                </div>
                <div className="dash-nav">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 21h18M5 21V8l7-5 7 5v13" />
                    <path d="M9 21v-8h6v8" />
                  </svg>
                  Banken
                </div>
                <div className="dash-nav">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.7 12.4a2 2 0 002 1.6h9.4a2 2 0 002-1.6L23 6H6" />
                  </svg>
                  Marktplatz
                </div>
                <div className="dash-nav">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                  Tagesgeld
                </div>
                <div className="dash-nav">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M8 2v4M16 2v4M3 10h18" />
                  </svg>
                  Festgeld
                </div>
                <div className="dash-nav">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 17l5-6 4 4 6-8 3 4" />
                    <path d="M3 21h18" />
                  </svg>
                  ETF-Portfolios
                </div>
                <div className="dash-nav">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 21h18M5 21V8l7-5 7 5v13" />
                  </svg>
                  Partner
                </div>
                <div className="dash-side-foot">
                  <div className="dash-nav">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3M12 17h.01" />
                    </svg>
                    Hilfe
                  </div>
                  <div className="dash-nav">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                    Einstellungen
                  </div>
                </div>
              </aside>
              <div className="dash-main">
                <div className="dash-head">
                  <h4>
                    Übersicht
                  </h4>
                  <div className="icons">
                    <span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 18v-6a9 9 0 0118 0v6" />
                        <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
                      </svg>
                    </span>
                    <span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" />
                      </svg>
                    </span>
                  </div>
                  <div className="dash-user">
                    <img className="avatar" src={publicPath("assets/avatars/a1.png")} alt="Anna Keller" />
                    <div>
                      <b>
                        Anna Keller
                      </b>
                      <i>
                        Mandantenkonto
                      </i>
                    </div>
                  </div>
                </div>
                <div className="dash-balance">
                  <div>
                    <div className="lbl">
                      Gesamtvermögen
                    </div>
                    <div className="amt">
                      48.920,15 €
                    </div>
                  </div>
                  <p className="note">
                    HSBC · Deutsche Bank · N26 · DKB —
                    <b>
                      ein Login
                    </b>
                  </p>
                  <svg width="150" height="56" viewBox="0 0 150 56" fill="none" aria-hidden="true">
                    <path d="M2 46 C20 44 28 30 44 32 S72 44 88 30 S124 8 148 12" stroke="#16a34a" strokeWidth="2.4" strokeLinecap="round" />
                    <path d="M2 46 C20 44 28 30 44 32 S72 44 88 30 S124 8 148 12 V56 H2 Z" fill="url(#gg1)" opacity=".18" />
                    <defs>
                      <linearGradient id="gg1" x1="0" y1="0" x2="0" y2="1">
                        <stop stopColor="#16a34a" />
                        <stop offset="1" stopColor="#16a34a" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="stat-row">
                  <div className="stat-card">
                    <div className="lbl">
                      Tagesgeld
                    </div>
                    <div className="val">
                      3,80 %
                    </div>
                    <div className="delta up">
                      Quenzia Direkt
                      <em>
                        p.a.
                      </em>
                    </div>
                    <svg width="100%" height="26" viewBox="0 0 120 26" preserveAspectRatio="none">
                      <path d="M2 18 C20 20 34 10 52 12 S88 6 118 7" stroke="#16a34a" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="stat-card">
                    <div className="lbl">
                      Festgeld 24M
                    </div>
                    <div className="val">
                      3,35 %
                    </div>
                    <div className="delta up">
                      Hallovar
                      <em>
                        Kreditunion
                      </em>
                    </div>
                    <svg width="100%" height="26" viewBox="0 0 120 26" preserveAspectRatio="none">
                      <path d="M2 18 C20 20 34 10 52 12 S88 6 118 7" stroke="#16a34a" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="stat-card">
                    <div className="lbl">
                      ETF konservativ
                    </div>
                    <div className="val">
                      0,18 %
                    </div>
                    <div className="delta up">
                      TER
                      <em>
                        Kyndal 20/80
                      </em>
                    </div>
                    <svg width="100%" height="26" viewBox="0 0 120 26" preserveAspectRatio="none">
                      <path d="M2 9 C24 7 34 15 54 13 S90 21 118 19" stroke="#ef4444" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
                <div className="pipe">
                  <div className="pipe-head">
                    <b>
                      Zins vs. Girokonto
                    </b>
                    <div className="pipe-tabs">
                      <span>
                        1W
                      </span>
                      <span className="on">
                        1M
                      </span>
                      <span>
                        6M
                      </span>
                      <span>
                        1J
                      </span>
                    </div>
                    <span className="pipe-filter">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                      </svg>
                      Filter
                    </span>
                  </div>
                  <div className="pipe-chart">
                    <svg viewBox="0 0 640 200" preserveAspectRatio="none" aria-hidden="true">
                      <defs>
                        <linearGradient id="pg1" x1="0" y1="0" x2="0" y2="1">
                          <stop stopColor="#4f6bf5" stopOpacity=".22" />
                          <stop offset="1" stopColor="#4f6bf5" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="pg2" x1="0" y1="0" x2="0" y2="1">
                          <stop stopColor="#ef4444" stopOpacity=".16" />
                          <stop offset="1" stopColor="#ef4444" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <g stroke="#eeeef3">
                        <line x1="30" y1="30" x2="640" y2="30" />
                        <line x1="30" y1="80" x2="640" y2="80" />
                        <line x1="30" y1="130" x2="640" y2="130" />
                        <line x1="30" y1="175" x2="640" y2="175" />
                      </g>
                      <g fill="#b7bac5" fontFamily="Inter,sans-serif" fontSize="10" fontWeight="500">
                        <text x="0" y="34">
                          1K
                        </text>
                        <text x="0" y="84">
                          500
                        </text>
                        <text x="0" y="134">
                          250
                        </text>
                        <text x="0" y="179">
                          100
                        </text>
                        <text x="0" y="198">
                          0
                        </text>
                        <text x="40" y="198">
                          Jan
                        </text>
                        <text x="140" y="198">
                          Feb
                        </text>
                        <text x="240" y="198">
                          Mar
                        </text>
                        <text x="340" y="198">
                          Apr
                        </text>
                        <text x="440" y="198">
                          May
                        </text>
                        <text x="540" y="198">
                          Jun
                        </text>
                      </g>
                      <path d="M40 150 C90 140 120 110 170 116 S260 70 310 78 S400 46 450 60 S560 40 620 30 V180 H40 Z" fill="url(#pg1)" />
                      <path d="M40 150 C90 140 120 110 170 116 S260 70 310 78 S400 46 450 60 S560 40 620 30" stroke="#4f6bf5" strokeWidth="2.6" fill="none" strokeLinecap="round" />
                      <path d="M40 168 C100 164 140 150 190 152 S280 128 330 134 S420 112 470 120 S570 104 620 96 V180 H40 Z" fill="url(#pg2)" />
                      <path d="M40 168 C100 164 140 150 190 152 S280 128 330 134 S420 112 470 120 S570 104 620 96" stroke="#ef4444" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                      <line x1="352" y1="20" x2="352" y2="180" stroke="#c9cad4" strokeDasharray="4 4" />
                      <circle cx="352" cy="72" r="4.5" fill="#4f6bf5" stroke="#fff" strokeWidth="2" />
                      <circle cx="352" cy="131" r="4" fill="#ef4444" stroke="#fff" strokeWidth="2" />
                    </svg>
                    <div className="pipe-tip">
                      <b>
                        Apr 2025
                      </b>
                      <span className="r">
                        Marktplatz 3,41 %
                      </span>
                      <br />
                      <span className="s">
                        Giro 0,01 %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ============ SOCIAL PROOF ============ */}
      <section className="social">
        <div className="wrap">
          <p data-reveal>
            Ein Marktplatz —
            <strong>
              Tagesgeld, Festgeld & ETF-Portfolios
            </strong>
          </p>
        </div>
        <div className="marquee" data-reveal aria-hidden="true">
          <div className="marquee-track">
            <span className="mlogo">
              <span className="ml" style={{background: "#DB0011"}}>
                HS
              </span>
              HSBC
            </span>
            <span className="mlogo">
              <span className="ml" style={{background: "#0018A8"}}>
                DB
              </span>
              Deutsche Bank
            </span>
            <span className="mlogo">
              <span className="ml" style={{background: "#FFD200", color: "#111"}}>
                C
              </span>
              Commerzbank
            </span>
            <span className="mlogo">
              <span className="ml" style={{background: "#FF6200"}}>
                IN
              </span>
              ING
            </span>
            <span className="mlogo">
              <span className="ml" style={{background: "#191919"}}>
                N
              </span>
              N26
            </span>
            <span className="mlogo">
              <span className="ml" style={{background: "#00ADEF"}}>
                DK
              </span>
              DKB
            </span>
            <span className="mlogo">
              <span className="ml" style={{background: "#E30613"}}>
                S
              </span>
              Sparkasse
            </span>
            <span className="mlogo">
              <span className="ml" style={{background: "#EC0000"}}>
                SA
              </span>
              Santander
            </span>
            <span className="mlogo">
              <span className="ml" style={{background: "#00AEEF"}}>
                BA
              </span>
              Barclays
            </span>
            <span className="mlogo">
              <span className="ml" style={{background: "#00915A"}}>
                BN
              </span>
              BNP Paribas
            </span>
            <span className="mlogo">
              <span className="ml" style={{background: "#DB0011"}}>
                HS
              </span>
              HSBC
            </span>
            <span className="mlogo">
              <span className="ml" style={{background: "#0018A8"}}>
                DB
              </span>
              Deutsche Bank
            </span>
            <span className="mlogo">
              <span className="ml" style={{background: "#FFD200", color: "#111"}}>
                C
              </span>
              Commerzbank
            </span>
            <span className="mlogo">
              <span className="ml" style={{background: "#FF6200"}}>
                IN
              </span>
              ING
            </span>
            <span className="mlogo">
              <span className="ml" style={{background: "#191919"}}>
                N
              </span>
              N26
            </span>
            <span className="mlogo">
              <span className="ml" style={{background: "#00ADEF"}}>
                DK
              </span>
              DKB
            </span>
            <span className="mlogo">
              <span className="ml" style={{background: "#E30613"}}>
                S
              </span>
              Sparkasse
            </span>
            <span className="mlogo">
              <span className="ml" style={{background: "#EC0000"}}>
                SA
              </span>
              Santander
            </span>
            <span className="mlogo">
              <span className="ml" style={{background: "#00AEEF"}}>
                BA
              </span>
              Barclays
            </span>
            <span className="mlogo">
              <span className="ml" style={{background: "#00915A"}}>
                BN
              </span>
              BNP Paribas
            </span>
          </div>
        </div>
      </section>
      {/* ============ WHY ============ */}
      <section className="why" id="why">
        <div className="wrap">
          <div className="sec-head">
            <span className="badge" data-reveal>
              Marktplatz
            </span>
            <h2 className="sec" data-reveal>
              Warum Sparer eine Plattform wollen
            </h2>
            <p className="sub" data-reveal>
              Die besten Zinsen liegen selten bei der Hausbank. Wir holen Partnerbanken und Kreditgenossenschaften in eine Übersicht.
            </p>
          </div>
          <div className="bento">
            <div className="bcard" data-reveal>
              <div className="mock">
                <div className="taskrow">
                  <div className="tt">
                    <div>
                      <b>
                        Quenzia Tagesgeld 3,80 %
                      </b>
                      <i>
                        täglich verfügbar
                      </i>
                    </div>
                  </div>
                  <div className="astack">
                    <img className="avatar" src={publicPath("assets/avatars/a2.png")} alt="" />
                    <img className="avatar" src={publicPath("assets/avatars/a3.png")} alt="" />
                    <img className="avatar" src={publicPath("assets/avatars/a4.png")} alt="" />
                  </div>
                </div>
                <div className="taskrow">
                  <div className="tt">
                    <div>
                      <b>
                        Hallovar Festgeld 24M
                      </b>
                      <i>
                        3,35 % p.a.
                      </i>
                    </div>
                  </div>
                  <div className="astack">
                    <img className="avatar" src={publicPath("assets/avatars/a3.png")} alt="" />
                    <img className="avatar" src={publicPath("assets/avatars/a1.png")} alt="" />
                  </div>
                </div>
                <div className="taskrow">
                  <div className="tt">
                    <div>
                      <b>
                        Kyndal ETF 20/80
                      </b>
                      <i>
                        TER 0,18 %
                      </i>
                    </div>
                  </div>
                  <div className="astack">
                    <img className="avatar" src={publicPath("assets/avatars/a4.png")} alt="" />
                    <img className="avatar" src={publicPath("assets/avatars/a2.png")} alt="" />
                    <img className="avatar" src={publicPath("assets/avatars/a1.png")} alt="" />
                  </div>
                </div>
              </div>
              <h3>
                Vergleich statt Recherche
              </h3>
              <p>
                Konditionen von Banken und Kreditunions nebeneinander — ohne bei jedem Institut selbst ein Konto zu eröffnen.
              </p>
            </div>
            <div className="bcard" data-reveal>
              <div className="mock">
                <div className="bars">
                  <div className="bar">
                    <span style={{width: "42%", background: "var(--blue)"}}>
                    </span>
                  </div>
                  <div className="bar">
                    <span style={{width: "78%", background: "var(--pink)"}}>
                    </span>
                  </div>
                  <div className="bar">
                    <span style={{width: "22%", background: "var(--cyan)"}}>
                    </span>
                  </div>
                </div>
                <div className="blegend">
                  <i style={cssVars({ "--c": "var(--blue)" })}>
                    Tagesgeld
                  </i>
                  <i style={cssVars({ "--c": "var(--pink)" })}>
                    Festgeld
                  </i>
                  <i style={cssVars({ "--c": "var(--cyan)" })}>
                    ETF
                  </i>
                </div>
              </div>
              <h3>
                Cash dort, wo es arbeitet
              </h3>
              <p>
                Hochverzinstes Tagesgeld für Flexibilität, Festgeld für höhere Zinsen, ETF-Portfolios für einfachen, günstigen Aufbau.
              </p>
            </div>
            <div className="bcard" data-reveal>
              <div className="mock">
                <div className="mini-stats">
                  <div className="mini-stat">
                    <div className="lbl">
                      Partner
                    </div>
                    <div className="val">
                      7+
                    </div>
                    <div className="delta up" style={{color: "var(--green)"}}>
                      Banken & Unions
                    </div>
                  </div>
                  <div className="mini-stat">
                    <div className="lbl">
                      Einlagenschutz
                    </div>
                    <div className="val">
                      100k
                    </div>
                    <div className="delta up" style={{color: "var(--green)"}}>
                      je Institut
                    </div>
                  </div>
                  <div className="mini-stat">
                    <div className="lbl">
                      ETF TER ab
                    </div>
                    <div className="val">
                      0,16%
                    </div>
                    <div className="delta up" style={{color: "var(--green)"}}>
                      ausgewählte Regionen
                    </div>
                  </div>
                  <div className="mini-stat">
                    <div className="lbl">
                      Ein Login
                    </div>
                    <div className="val">
                      1
                    </div>
                    <div className="delta up" style={{color: "var(--green)"}}>
                      ganzer Marktplatz
                    </div>
                  </div>
                </div>
              </div>
              <h3>
                Ohne Bankhopping
              </h3>
              <p>
                Ein Konto bei NN Finanz statt Recherche, Formulare und App-Wildwuchs bei jeder einzelnen Bank.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* ============ KEY TOOLS ============ */}
      <section className="keytools" id="keytools">
        <div className="wrap">
          <div className="kt-grid" id="ktPin">
            <div className="kt-left">
              <span className="badge" style={{alignSelf: "flex-start"}}>
                Drei Produkte
              </span>
              <h2 className="sec">
                Alles, was Ihr Cash
                <br />
                brauchen kann
              </h2>
              <div className="kt-tabs" role="tablist" aria-label="Produkte">
                <button className="kt-tab on" role="tab" aria-selected="true" data-kt="0">
                  Tagesgeld
                </button>
                <button className="kt-tab" role="tab" aria-selected="false" data-kt="1">
                  Festgeld
                </button>
                <button className="kt-tab" role="tab" aria-selected="false" data-kt="2">
                  ETF-Portfolios
                </button>
              </div>
            </div>
            <div className="kt-right">
              <div className="kt-panel on" data-kp="0">
                <div className="mock-card">
                  <div className="greet">
                    <b>
                      Guten Tag
                    </b>
                    <div className="gicons">
                      <span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 18v-6a9 9 0 0118 0v6" />
                          <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
                        </svg>
                      </span>
                      <span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" />
                        </svg>
                      </span>
                    </div>
                  </div>
                  <div className="dash-balance" style={{boxShadow: "none"}}>
                    <div>
                      <div className="lbl">
                        Gesamtvermögen
                      </div>
                      <div className="amt">
                        48.920,15 €
                      </div>
                    </div>
                    <p className="note">
                      HSBC · Deutsche Bank · N26 · DKB —
                      <b>
                        ein Login
                      </b>
                    </p>
                    <svg width="130" height="50" viewBox="0 0 150 56" fill="none">
                      <path d="M2 46 C20 44 28 30 44 32 S72 44 88 30 S124 8 148 12" stroke="#16a34a" strokeWidth="2.4" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
                <div className="cap">
                  <b>
                    Tagesgeld
                  </b>
                  <p>
                    Hochverzinste, täglich verfügbare Einlagen bei Partnerbanken — für Cash, das flexibel bleiben soll.
                  </p>
                </div>
              </div>
              <div className="kt-panel" data-kp="1">
                <div className="mock-card">
                  <b style={{fontSize: "14.5px", display: "block", marginBottom: "14px"}}>
                    Festgeld im Vergleich
                  </b>
                  <table className="deals-table">
                    <thead>
                      <tr>
                        <th>
                          Partner
                        </th>
                        <th>
                          Laufzeit
                        </th>
                        <th>
                          Stand
                        </th>
                        <th>
                          Zins
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          Quenzia
                        </td>
                        <td className="amt">
                          12 Monate
                        </td>
                        <td>
                          <span className="stage prop">
                            Festgeld
                          </span>
                        </td>
                        <td>
                          <div className="prob">
                            <div className="pbar">
                              <i className="f">
                              </i>
                              <i className="f">
                              </i>
                              <i className="f">
                              </i>
                              <i>
                              </i>
                              <i>
                              </i>
                            </div>
                            <span>
                              3,15%
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          Hallovar
                        </td>
                        <td className="amt">
                          24 Monate
                        </td>
                        <td>
                          <span className="stage neg">
                            Kreditunion
                          </span>
                        </td>
                        <td>
                          <div className="prob">
                            <div className="pbar">
                              <i className="f">
                              </i>
                              <i className="f">
                              </i>
                              <i className="f">
                              </i>
                              <i className="f">
                              </i>
                              <i className="f">
                              </i>
                            </div>
                            <span>
                              3,35%
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          Tresmo
                        </td>
                        <td className="amt">
                          36 Monate
                        </td>
                        <td>
                          <span className="stage disc">
                            Bank
                          </span>
                        </td>
                        <td>
                          <div className="prob">
                            <div className="pbar">
                              <i className="f">
                              </i>
                              <i className="f">
                              </i>
                              <i className="f">
                              </i>
                              <i className="f">
                              </i>
                              <i>
                              </i>
                            </div>
                            <span>
                              3,50%
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          Lumenix
                        </td>
                        <td className="amt">
                          6 Monate
                        </td>
                        <td>
                          <span className="stage won">
                            kurz
                          </span>
                        </td>
                        <td>
                          <div className="prob">
                            <div className="pbar">
                              <i className="f">
                              </i>
                              <i className="f">
                              </i>
                              <i>
                              </i>
                              <i>
                              </i>
                              <i>
                              </i>
                            </div>
                            <span>
                              2,95%
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          Bravura
                        </td>
                        <td className="amt">
                          12 Monate
                        </td>
                        <td>
                          <span className="stage neg">
                            CU
                          </span>
                        </td>
                        <td>
                          <div className="prob">
                            <div className="pbar">
                              <i className="f">
                              </i>
                              <i className="f">
                              </i>
                              <i className="f">
                              </i>
                              <i>
                              </i>
                              <i>
                              </i>
                            </div>
                            <span>
                              3,20%
                            </span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="cap">
                  <b>
                    Festgeld / CDs
                  </b>
                  <p>
                    Laufzeiten festzurren, Zins sichern. Certificates of Deposit und Festgeld von Partnern — in einer Liste statt zehn Anträgen.
                  </p>
                </div>
              </div>
              <div className="kt-panel" data-kp="2">
                <div className="mock-card">
                  <div className="kan-legend">
                    <span>
                      <i className="kdot" style={{background: "var(--blue)"}}>
                      </i>
                      Geregelt
                      <b>
                        Basis
                      </b>
                    </span>
                    <span>
                      <i className="kdot" style={{background: "var(--indigo)"}}>
                      </i>
                      Im Gespräch
                      <b>
                        nächster Schritt
                      </b>
                    </span>
                    <span>
                      <i className="kdot" style={{background: "var(--pink)"}}>
                      </i>
                      Offen
                      <b>
                        prüfen
                      </b>
                    </span>
                  </div>
                  <div className="kan-grid">
                    <div className="kcard">
                      <b>
                        Konservativ 20/80
                      </b>
                      <div className="amt">
                        0,18 %
                        <i>
                          TER
                        </i>
                      </div>
                      <p>
                        Kapitalerhalt mit leichtem Wachstum
                      </p>
                      <div className="kfoot">
                        <img className="avatar" src={publicPath("assets/avatars/a2.png")} alt="" />
                        <span>
                          DE/AT
                        </span>
                      </div>
                    </div>
                    <div className="kcard lift">
                      <b>
                        Ausgewogen 40/60
                      </b>
                      <div className="amt">
                        0,20 %
                        <i>
                          TER
                        </i>
                      </div>
                      <p>
                        Ruhiger Aufbau ohne Einzeltitel
                      </p>
                      <div className="kfoot">
                        <img className="avatar" src={publicPath("assets/avatars/a3.png")} alt="" />
                        <span>
                          DE/AT/NL
                        </span>
                      </div>
                    </div>
                    <div className="kcard">
                      <b>
                        Core World 60/40
                      </b>
                      <div className="amt">
                        0,16 %
                        <i>
                          TER
                        </i>
                      </div>
                      <p>
                        Breiter Weltmarkt, niedrige Kosten
                      </p>
                      <div className="kfoot">
                        <img className="avatar" src={publicPath("assets/avatars/a4.png")} alt="" />
                        <span>
                          DE/AT
                        </span>
                      </div>
                    </div>
                    <div className="kcard">
                      <b>
                        Anleihen-Anteil
                      </b>
                      <div className="amt">
                        80 %
                        <i>
                          konservativ
                        </i>
                      </div>
                      <p>
                        Für vorsichtige Anleger
                      </p>
                      <div className="kfoot">
                        <img className="avatar" src={publicPath("assets/avatars/a1.png")} alt="" />
                        <span>
                          ETF
                        </span>
                      </div>
                    </div>
                    <div className="kcard">
                      <b>
                        Aktien-Anteil
                      </b>
                      <div className="amt">
                        20 %
                        <i>
                          global
                        </i>
                      </div>
                      <p>
                        Ohne Einzelaktien-Recherche
                      </p>
                      <div className="kfoot">
                        <img className="avatar" src={publicPath("assets/avatars/a2.png")} alt="" />
                        <span>
                          ETF
                        </span>
                      </div>
                    </div>
                    <div className="kcard ghost">
                      Portfolio wählen
                    </div>
                  </div>
                </div>
                <div className="cap">
                  <b>
                    ETF-Portfolios
                  </b>
                  <p>
                    In ausgewählten Regionen: einfache, günstige ETF-Mischungen — ohne selbst Fonds zu vergleichen oder Depots bei mehreren Brokern zu eröffnen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ============ DARK PANEL ============ */}
      <section className="dark">
        <div className="wrap">
          <div className="sec-head">
            <span className="badge" data-reveal style={{background: "var(--darkcard)", borderColor: "var(--darkline)", color: "#d7d7de"}}>
              ✦ Die Plattform
            </span>
            <h2 className="sec" data-reveal>
              Was in NN Finanz steckt
            </h2>
            <p className="sub" data-reveal>
              Ein Marktplatz für Sparer: Partnerbanken, Kreditgenossenschaften und einfache ETF-Portfolios — ein Login.
            </p>
          </div>
          <div className="dgrid">
            <div className="dcard" data-reveal>
              <div className="icn">
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="7" y="7" width="10" height="10" rx="2" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
                </svg>
              </div>
              <h3>
                Hochzins-Tagesgeld
              </h3>
              <p>
                Täglich verfügbares Cash bei Partnerbanken, die mehr zahlen als das Girokonto.
              </p>
            </div>
            <div className="dcard" data-reveal>
              <div className="icn">
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="6" cy="6" r="2.6" />
                  <circle cx="6" cy="18" r="2.6" />
                  <circle cx="18" cy="12" r="2.6" />
                  <path d="M8.3 7.3l7.4 3.4M8.3 16.7l7.4-3.4" />
                </svg>
              </div>
              <h3>
                Festgeld & CDs
              </h3>
              <p>
                Laufzeiten von 6 bis 36 Monaten — Zins sichern, ohne bei jeder Bank einen Antrag zu stellen.
              </p>
            </div>
            <div className="dcard" data-reveal>
              <div className="icn">
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 12h4l2-7 2 14 2-7h2" />
                </svg>
              </div>
              <h3>
                Partnernetzwerk
              </h3>
              <p>
                Banken und Kreditgenossenschaften in einem Marktplatz statt App-Wildwuchs.
              </p>
            </div>
            <div className="dcard" data-reveal>
              <div className="icn">
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M3 17l5-6 4 4 6-8 3 4" />
                  <path d="M3 21h18" />
                </svg>
              </div>
              <h3>
                ETF-Portfolios
              </h3>
              <p>
                Konservative Mischungen mit niedriger TER — in ausgewählten Regionen, ohne Fonds-Recherche.
              </p>
            </div>
            <div className="dcard" data-reveal>
              <div className="icn">
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="5" cy="12" r="2.4" />
                  <circle cx="19" cy="6" r="2.4" />
                  <circle cx="19" cy="18" r="2.4" />
                  <path d="M7.2 10.8l9.6-3.6M7.2 13.2l9.6 3.6" />
                </svg>
              </div>
              <h3>
                Einlagensicherung
              </h3>
              <p>
                Bankeinlagen i. d. R. bis 100.000 € je Institut und Kunde — wir zeigen, wo Ihr Cash liegt.
              </p>
            </div>
            <div className="dcard" data-reveal>
              <div className="icn">
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <h3>
                Ein Login
              </h3>
              <p>
                Vergleichen, einzahlen, verteilen. Kein manuelles Eröffnen bei jeder einzelnen Bank.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* ============ GROWTH GEAR ============ */}
      <section className="growth">
        <div className="wrap">
          <div className="sec-head">
            <span className="badge" data-reveal>
              Marktplatz
            </span>
            <h2 className="sec" data-reveal>
              Konditionen auf einen Blick
            </h2>
            <p className="sub" data-reveal>
              Tagesgeld, Festgeld und ETF-Kosten vergleichen — dann mit einem Konto eröffnen.
            </p>
          </div>
          <GrowthTable />
        </div>
      </section>
      {/* ============ TESTIMONIALS ============ */}
      <section className="testi">
        <div className="wrap">
          <div className="sec-head">
            <span className="badge" data-reveal>
              Das Haus
            </span>
            <h2 className="sec" data-reveal>
              Ein Berliner Büro,
              <br />
              zwei Geschäftsführer
            </h2>
          </div>
          <div className="tgrid">
            <div className="tstat pink" data-reveal>
              <div className="num">
                2007
              </div>
              <div className="cap">
                gegründet in Berlin
              </div>
            </div>
            <div className="tquote" data-reveal>
              <p>
                „Eine Plattform, viele Partnerbanken — so holen Sparer mehr aus ihrem Cash, ohne bei jedem Institut neu anzufangen.“
              </p>
              <div className="who">
                <img className="avatar" src={publicPath("assets/avatars/a3.png")} alt="Torsten Marschner" />
                <div>
                  <b>
                    Torsten Marschner
                  </b>
                  <i>
                    Geschäftsführer
                  </i>
                </div>
              </div>
            </div>
          </div>
          <div className="tgrid2">
            <div className="tstat white" data-reveal>
              <div className="num">
                2
              </div>
              <div className="cap">
                Geschäftsführer seit der Gründung
              </div>
            </div>
            <div className="tstat blue" data-reveal>
              <div className="num">
                HRB
              </div>
              <div className="cap">
                106379 B · Charlottenburg
              </div>
            </div>
            <div className="tquote stand" data-reveal>
              <p>
                „Tagesgeld für Flexibilität, Festgeld für den Zins, ETF nur wo es passt — und alles in einem Login.“
              </p>
              <div className="who">
                <img className="avatar" src={publicPath("assets/avatars/a5.png")} alt="Norbert Naujoks" />
                <div>
                  <b>
                    Norbert Naujoks
                  </b>
                  <i>
                    Geschäftsführer
                  </i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ============ PRICING ============ */}
      <section className="pricing" id="pricing">
        <div className="wrap">
          <div className="sec-head">
            <span className="badge" data-reveal>
              Erstgespräch
            </span>
            <h2 className="sec" data-reveal>
              So starten wir
            </h2>
            <div className="ptoggle" data-reveal>
              <span>
                Privat
              </span>
              <button className="switch" id="billSwitch" role="switch" aria-checked="false" aria-label="Zwischen Privat und Gewerbe wechseln">
              </button>
              <span>
                Gewerbe
                <span className="save">
                  bAV
                </span>
              </span>
            </div>
          </div>
          <div className="pcards">
            <div className="pcard" data-reveal>
              <h3>
                Kennenlernen
              </h3>
              <p className="pdesc">
                Unverbindliches Erstgespräch — vor Ort in Lichtenrade oder telefonisch.
              </p>
              <div className="price">
                <span data-price data-m="0" data-y="0">
                  0
                </span>
                €
                <i>
                  / Gespräch
                </i>
              </div>
              <div className="billed" data-billed>
                für Privatkunden
              </div>
              <Link className="btn btn-outline" to="/signup">
                Konto eröffnen
              </Link>
              <div className="get">
                Das bekommen Sie:
              </div>
              <div className="pfeat">
                Marktplatz-Zugang für Tagesgeld & Festgeld
              </div>
              <div className="pfeat">
                Vergleich über Partnerbanken
              </div>
              <div className="pfeat">
                Ein Login statt vieler Konten
              </div>
            </div>
            <div className="pcard feat" data-reveal>
              <h3>
                Ganzheitliche Beratung
              </h3>
              <p className="pdesc">
                Vollzugriff auf den Marktplatz: Tagesgeld, Festgeld und ETF-Portfolios in ausgewählten Regionen.
              </p>
              <div className="price">
                nach
                <i>
                  Vereinbarung
                </i>
              </div>
              <div className="billed" data-billed>
                für Privatkunden
              </div>
              <Link className="btn btn-dark" to="/signup">
                Konto erstellen
              </Link>
              <div className="get">
                Das bekommen Sie:
              </div>
              <div className="pfeat">
                Alle Partnerbanken und Kreditunions
              </div>
              <div className="pfeat">
                ETF-Portfolios wo verfügbar
              </div>
              <div className="pfeat">
                Depot-Übersicht mit Ø-Zins
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ============ FAQ ============ */}
      <section className="faq">
        <div className="wrap">
          <div className="faq-grid">
            <div className="faq-left">
              <span className="badge" data-reveal>
                FAQ
              </span>
              <h2 className="sec" data-reveal>
                Häufige Fragen
              </h2>
              <p className="sub" data-reveal>
                Kurz und klar — bevor Sie anrufen.
              </p>
            </div>
            <div>
              <div className="acc open" data-reveal>
                <button className="acc-head" aria-expanded="true">
                  Was ist NN Finanz?
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <div className="acc-body">
                  <p>
                    Ein Fintech-Marktplatz: Wir verbinden Sie mit Partnerbanken und Kreditgenossenschaften für Tagesgeld, Festgeld und — in manchen Regionen — einfache ETF-Portfolios. Ein Login statt Konten bei jeder Bank.
                  </p>
                </div>
              </div>
              <div className="acc" data-reveal>
                <button className="acc-head" aria-expanded="false">
                  Sind meine Einlagen geschützt?
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <div className="acc-body">
                  <p>
                    Bankeinlagen unterliegen in der EU in der Regel der gesetzlichen Einlagensicherung bis 100.000 € je Kunde und Institut. ETF-Portfolios sind Sondervermögen und schwanken mit dem Markt. Konditionen auf der Plattform sind illustrativ.
                  </p>
                </div>
              </div>
              <div className="acc" data-reveal>
                <button className="acc-head" aria-expanded="false">
                  Wie starte ich?
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <div className="acc-body">
                  <p>
                    Konto eröffnen, anmelden, einzahlen und Produkte im Marktplatz eröffnen. Die NN-Finanzberatung GmbH in Berlin-Lichtenrade bleibt der Betreiber — Impressum und Handelsregister finden Sie unten.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ============ SHOWCASE ============ */}
      <section className="showcase">
        <div className="wrap">
          <div data-reveal>
            <div className="dash" aria-label="Marktplatz-\u00dcbersicht">
              <aside className="dash-side">
                <div className="dash-brand">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="12" height="12" rx="4" fill="url(#lgm)" />
                    <rect x="10" y="10" width="12" height="12" rx="4" fill="url(#lgm)" opacity=".55" />
                  </svg>
                  NN Finanz
                </div>
                <div className="dash-nav active">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="9" rx="1.5" />
                    <rect x="14" y="3" width="7" height="5" rx="1.5" />
                    <rect x="14" y="11" width="7" height="10" rx="1.5" />
                    <rect x="3" y="15" width="7" height="6" rx="1.5" />
                  </svg>
                  Übersicht
                </div>
                <div className="dash-nav">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                  Konten
                </div>
                <div className="dash-nav">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 21h18M5 21V8l7-5 7 5v13" />
                    <path d="M9 21v-8h6v8" />
                  </svg>
                  Banken
                </div>
                <div className="dash-nav">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.7 12.4a2 2 0 002 1.6h9.4a2 2 0 002-1.6L23 6H6" />
                  </svg>
                  Marktplatz
                </div>
                <div className="dash-nav">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                  Tagesgeld
                </div>
                <div className="dash-nav">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M8 2v4M16 2v4M3 10h18" />
                  </svg>
                  Festgeld
                </div>
                <div className="dash-nav">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 17l5-6 4 4 6-8 3 4" />
                    <path d="M3 21h18" />
                  </svg>
                  ETF-Portfolios
                </div>
                <div className="dash-nav">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 21h18M5 21V8l7-5 7 5v13" />
                  </svg>
                  Partner
                </div>
                <div className="dash-side-foot">
                  <div className="dash-nav">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3M12 17h.01" />
                    </svg>
                    Hilfe
                  </div>
                  <div className="dash-nav">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                    Einstellungen
                  </div>
                </div>
              </aside>
              <div className="dash-main">
                <div className="dash-head">
                  <h4>
                    Übersicht
                  </h4>
                  <div className="icons">
                    <span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 18v-6a9 9 0 0118 0v6" />
                        <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
                      </svg>
                    </span>
                    <span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" />
                      </svg>
                    </span>
                  </div>
                  <div className="dash-user">
                    <img className="avatar" src={publicPath("assets/avatars/a1.png")} alt="Anna Keller" />
                    <div>
                      <b>
                        Anna Keller
                      </b>
                      <i>
                        Mandantenkonto
                      </i>
                    </div>
                  </div>
                </div>
                <div className="dash-balance">
                  <div>
                    <div className="lbl">
                      Gesamtvermögen
                    </div>
                    <div className="amt">
                      48.920,15 €
                    </div>
                  </div>
                  <p className="note">
                    HSBC · Deutsche Bank · N26 · DKB —
                    <b>
                      ein Login
                    </b>
                  </p>
                  <svg width="150" height="56" viewBox="0 0 150 56" fill="none" aria-hidden="true">
                    <path d="M2 46 C20 44 28 30 44 32 S72 44 88 30 S124 8 148 12" stroke="#16a34a" strokeWidth="2.4" strokeLinecap="round" />
                    <path d="M2 46 C20 44 28 30 44 32 S72 44 88 30 S124 8 148 12 V56 H2 Z" fill="url(#gg2)" opacity=".18" />
                    <defs>
                      <linearGradient id="gg2" x1="0" y1="0" x2="0" y2="1">
                        <stop stopColor="#16a34a" />
                        <stop offset="1" stopColor="#16a34a" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="stat-row">
                  <div className="stat-card">
                    <div className="lbl">
                      Tagesgeld
                    </div>
                    <div className="val">
                      3,80 %
                    </div>
                    <div className="delta up">
                      Quenzia Direkt
                      <em>
                        p.a.
                      </em>
                    </div>
                    <svg width="100%" height="26" viewBox="0 0 120 26" preserveAspectRatio="none">
                      <path d="M2 18 C20 20 34 10 52 12 S88 6 118 7" stroke="#16a34a" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="stat-card">
                    <div className="lbl">
                      Festgeld 24M
                    </div>
                    <div className="val">
                      3,35 %
                    </div>
                    <div className="delta up">
                      Hallovar
                      <em>
                        Kreditunion
                      </em>
                    </div>
                    <svg width="100%" height="26" viewBox="0 0 120 26" preserveAspectRatio="none">
                      <path d="M2 18 C20 20 34 10 52 12 S88 6 118 7" stroke="#16a34a" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="stat-card">
                    <div className="lbl">
                      ETF konservativ
                    </div>
                    <div className="val">
                      0,18 %
                    </div>
                    <div className="delta up">
                      TER
                      <em>
                        Kyndal 20/80
                      </em>
                    </div>
                    <svg width="100%" height="26" viewBox="0 0 120 26" preserveAspectRatio="none">
                      <path d="M2 9 C24 7 34 15 54 13 S90 21 118 19" stroke="#ef4444" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
                <div className="pipe">
                  <div className="pipe-head">
                    <b>
                      Zins vs. Girokonto
                    </b>
                    <div className="pipe-tabs">
                      <span>
                        1W
                      </span>
                      <span className="on">
                        1M
                      </span>
                      <span>
                        6M
                      </span>
                      <span>
                        1J
                      </span>
                    </div>
                    <span className="pipe-filter">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                      </svg>
                      Filter
                    </span>
                  </div>
                  <div className="pipe-chart" style={{minHeight: "220px"}}>
                    <svg viewBox="0 0 640 200" preserveAspectRatio="none" aria-hidden="true">
                      <g stroke="#eeeef3">
                        <line x1="30" y1="30" x2="640" y2="30" />
                        <line x1="30" y1="80" x2="640" y2="80" />
                        <line x1="30" y1="130" x2="640" y2="130" />
                        <line x1="30" y1="175" x2="640" y2="175" />
                      </g>
                      <g fill="#b7bac5" fontFamily="Inter,sans-serif" fontSize="10" fontWeight="500">
                        <text x="0" y="34">
                          1K
                        </text>
                        <text x="0" y="84">
                          500
                        </text>
                        <text x="0" y="134">
                          250
                        </text>
                        <text x="0" y="179">
                          100
                        </text>
                        <text x="0" y="198">
                          0
                        </text>
                        <text x="40" y="198">
                          Jan
                        </text>
                        <text x="140" y="198">
                          Feb
                        </text>
                        <text x="240" y="198">
                          Mar
                        </text>
                        <text x="340" y="198">
                          Apr
                        </text>
                        <text x="440" y="198">
                          May
                        </text>
                        <text x="540" y="198">
                          Jun
                        </text>
                      </g>
                      <path d="M40 150 C90 140 120 110 170 116 S260 70 310 78 S400 46 450 60 S560 40 620 30 V180 H40 Z" fill="url(#pg1)" />
                      <path d="M40 150 C90 140 120 110 170 116 S260 70 310 78 S400 46 450 60 S560 40 620 30" stroke="#4f6bf5" strokeWidth="2.6" fill="none" strokeLinecap="round" />
                      <path d="M40 168 C100 164 140 150 190 152 S280 128 330 134 S420 112 470 120 S570 104 620 96 V180 H40 Z" fill="url(#pg2)" />
                      <path d="M40 168 C100 164 140 150 190 152 S280 128 330 134 S420 112 470 120 S570 104 620 96" stroke="#ef4444" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                      <line x1="352" y1="20" x2="352" y2="180" stroke="#c9cad4" strokeDasharray="4 4" />
                      <circle cx="352" cy="72" r="4.5" fill="#4f6bf5" stroke="#fff" strokeWidth="2" />
                      <circle cx="352" cy="131" r="4" fill="#ef4444" stroke="#fff" strokeWidth="2" />
                    </svg>
                    <div className="pipe-tip">
                      <b>
                        Apr 2025
                      </b>
                      <span className="r">
                        Marktplatz 3,41 %
                      </span>
                      <br />
                      <span className="s">
                        Giro 0,01 %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ============ FINAL CTA ============ */}
      <section className="cta" id="cta">
        <div className="wrap">
          <svg className="mark" data-reveal width="52" height="52" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2" y="2" width="12" height="12" rx="4" fill="url(#lgm)" />
            <rect x="10" y="10" width="12" height="12" rx="4" fill="url(#lgm)" opacity=".55" />
          </svg>
          <h2 data-reveal>
            Bereit für mehr Zins — eine Plattform.
          </h2>
          <p data-reveal>
            Konto eröffnen, vergleichen, anlegen. Ohne Bankhopping.
          </p>
          <div data-reveal>
            <Link className="btn btn-dark btn-glow" to="/signup">
              Konto eröffnen
            </Link>
          </div>
        </div>
      </section>
      {/* ============ IMPRESSUM ============ */}
      <section className="legal" id="impressum">
        <div className="wrap">
          <span className="badge" data-reveal>
            Angaben gemäß § 5 DDG
          </span>
          <h2 className="sec" data-reveal>
            Impressum
          </h2>
          <p className="sub" data-reveal>
            Verbindliche Unternehmensdaten aus dem Handelsregister.
          </p>
          <dl data-reveal>
            <dt>
              Firma
            </dt>
            <dd>
              NN-Finanzberatung GmbH
            </dd>
            <dt>
              Anschrift
            </dt>
            <dd>
              Spirdingseestraße 41, 12307 Berlin (Lichtenrade)
            </dd>
            <dt>
              Telefon
            </dt>
            <dd>
              <a href="tel:+4915215729944">
                +4915215729944
              </a>
            </dd>
            <dt>
              Geschäftsführung
            </dt>
            <dd>
              Torsten Marschner, Norbert Naujoks
            </dd>
            <dt>
              Registergericht
            </dt>
            <dd>
              Amtsgericht Charlottenburg (Berlin)
            </dd>
            <dt>
              Registernummer
            </dt>
            <dd>
              HRB 106379 B
            </dd>
            <dt>
              Stammkapital
            </dt>
            <dd>
              25.000,00 EUR
            </dd>
            <dt>
              Gegenstand
            </dt>
            <dd>
              Finanzberatung und Versicherungsvermittlung als Mehrfachagent
            </dd>
            <dt>
              LEI
            </dt>
            <dd>
              391200OOYTULGP1W7K86
            </dd>
            <dt>
              Status
            </dt>
            <dd>
              Aktiv · gegründet am 6. März 2007
            </dd>
          </dl>
          <p data-reveal style={{marginTop: "22px"}}>
            Für rechtlich verbindliche Auskünfte (z. B. Due Diligence) empfehlen wir einen aktuellen Handelsregisterauszug beim Amtsgericht Charlottenburg. Eine Vermittlerregister-Nummer der IHK lag uns bei Erstellung dieser Seite nicht vor.
          </p>
        </div>
      </section>
      <section className="legal" id="datenschutz">
        <div className="wrap">
          <span className="badge" data-reveal>
            Datenschutz
          </span>
          <h2 className="sec" data-reveal>
            Datenschutzerklärung
          </h2>
          <p data-reveal>
            Verantwortlich für die Datenverarbeitung auf dieser Website ist die NN-Finanzberatung GmbH, Spirdingseestraße 41, 12307 Berlin, Telefon
            <a href="tel:+4915215729944">
              +4915215729944
            </a>
            .
          </p>
          <p data-reveal>
            Diese Seite ist eine statische Unternehmensdarstellung. Es werden keine Kontaktformulare, Tracking-Cookies oder Analysewerkzeuge von uns eingesetzt. Beim Aufruf überträgt Ihr Browser technisch erforderliche Daten (z. B. IP-Adresse, Zeitpunkt, aufgerufene Datei) an den Server, der die Seite ausliefert. Diese Daten dienen dem Betrieb und der Sicherheit, nicht der Werbung.
          </p>
          <p data-reveal>
            Die Schriftart Inter wird von dieser Website ausgeliefert (kein Google-Fonts-Aufruf). Es werden keine Schriftanfragen an Google Ireland Limited gesendet.
          </p>
          <p data-reveal>
            Wenn Sie uns anrufen, verarbeiten wir die Angaben, die für die Beratung erforderlich sind. Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch sowie das Recht, sich bei einer Aufsichtsbehörde zu beschweren (in Berlin: Berliner Beauftragte für Datenschutz und Informationsfreiheit).
          </p>
        </div>
      </section>
      {/* ============ FOOTER ============ */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand" data-reveal>
              <a className="nav-logo" href="#top" style={{fontSize: "19px"}}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="12" height="12" rx="4" fill="url(#lgm)" />
                  <rect x="10" y="10" width="12" height="12" rx="4" fill="url(#lgm)" opacity=".55" />
                </svg>
                NN Finanz
              </a>
              <p>
                Marktplatz für Tagesgeld, Festgeld und ETF-Portfolios — Partnerbanken in einem Login. NN-Finanzberatung GmbH, Berlin.
              </p>
              <div className="socials">
                <a href="tel:+4915215729944" aria-label="Telefon +4915215729944">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 9.9a16 16 0 006 6l1.5-1.3a2 2 0 012.1-.4c.8.3 1.7.5 2.6.6a2 2 0 011.8 2.1z" />
                  </svg>
                </a>
                <a href={safeUrl("https://maps.google.com/?q=Spirdingseestraße+41+12307+Berlin")} aria-label="Adresse auf der Karte">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" />
                    <circle cx="12" cy="9" r="2.2" />
                  </svg>
                </a>
                <a href="#impressum" aria-label="Impressum">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 11v6M12 8h.01" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="foot-col" data-reveal>
              <h5>
                Büro
              </h5>
              <a href="#why">
                Leistungen
              </a>
              <a href="#keytools">
                Beratung
              </a>
              <a href="#pricing">
                Erstgespräch
              </a>
              <a href="#impressum">
                Impressum
              </a>
            </div>
            <div className="foot-col" data-reveal>
              <h5>
                Themen
              </h5>
              <a href="#keytools">
                Tagesgeld
              </a>
              <a href="#keytools">
                Festgeld
              </a>
              <a href="#keytools">
                ETF
              </a>
            </div>
            <div className="foot-col" data-reveal>
              <h5>
                Rechtliches
              </h5>
              <a href="#impressum">
                Impressum
              </a>
              <a href="#datenschutz">
                Datenschutz
              </a>
            </div>
          </div>
        </div>
        <div className="foot-bar">
          © 2026 NN-Finanzberatung GmbH · HRB 106379 B · Berlin
        </div>
      </footer>
    </>
  );
}
