import { useState } from "react";
import { publicPath } from "../shared/lib/publicPath";

type Status = "approved" | "pending";

type ProductTable = {
  title: string;
  rows: Array<[string, string, string, string, Status]>;
};

const TABLES: ProductTable[] = [
  {
    title: "Tagesgeld",
    rows: [
      [publicPath("assets/avatars/a1.png"), "Quenzia Flex", "täglich", "3,80 % p.a.", "approved"],
      [publicPath("assets/avatars/a2.png"), "Nordvia Spare", "täglich", "3,65 % p.a.", "approved"],
      [publicPath("assets/avatars/a3.png"), "Hallovar Mitglieder", "Kreditunion", "3,55 % p.a.", "approved"],
      [publicPath("assets/avatars/a4.png"), "Tresmo Easy", "NL", "3,40 % p.a.", "pending"],
      [publicPath("assets/avatars/a2.png"), "Giro Hausbank", "Vergleich", "0,01 % p.a.", "pending"],
    ],
  },
  {
    title: "Festgeld",
    rows: [
      [publicPath("assets/avatars/a3.png"), "Tresmo 36 Monate", "CD", "3,50 % p.a.", "approved"],
      [publicPath("assets/avatars/a1.png"), "Hallovar 24 Monate", "Kreditunion", "3,35 % p.a.", "approved"],
      [publicPath("assets/avatars/a4.png"), "Bravura 12 Monate", "CU", "3,20 % p.a.", "approved"],
      [publicPath("assets/avatars/a2.png"), "Quenzia 12 Monate", "Bank", "3,15 % p.a.", "approved"],
      [publicPath("assets/avatars/a3.png"), "Lumenix 6 Monate", "kurz", "2,95 % p.a.", "pending"],
    ],
  },
  {
    title: "ETF",
    rows: [
      [publicPath("assets/avatars/a4.png"), "Core World 60/40", "TER", "0,16 %", "approved"],
      [publicPath("assets/avatars/a2.png"), "Konservativ 20/80", "DE/AT", "0,18 %", "approved"],
      [publicPath("assets/avatars/a1.png"), "Ausgewogen 40/60", "DE/AT/NL", "0,20 %", "approved"],
      [publicPath("assets/avatars/a3.png"), "Nicht verfügbar", "UK", "—", "pending"],
      [publicPath("assets/avatars/a4.png"), "Nur ausgewählte Regionen", "Hinweis", "prüfen", "pending"],
    ],
  },
];

export function GrowthTable() {
  const [active, setActive] = useState(0);
  const table = TABLES[active] ?? TABLES[0];
  if (!table) {
    throw new Error("product tables missing");
  }

  return (
    <>
      <div className="gtabs" data-reveal role="tablist" aria-label="Produktarten">
        <button
          className={active === 0 ? "gtab on" : "gtab"}
          type="button"
          role="tab"
          aria-selected={active === 0}
          onClick={() => setActive(0)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M8 2v4M16 2v4M3 10h18" />
          </svg>
          Tagesgeld
        </button>
        <button
          className={active === 1 ? "gtab on" : "gtab"}
          type="button"
          role="tab"
          aria-selected={active === 1}
          onClick={() => setActive(1)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f6bf5" strokeWidth="2">
            <path d="M12 2l9 5-9 5-9-5z" />
            <path d="M3 12l9 5 9-5" />
          </svg>
          Festgeld
        </button>
        <button
          className={active === 2 ? "gtab on" : "gtab"}
          type="button"
          role="tab"
          aria-selected={active === 2}
          onClick={() => setActive(2)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          ETF
        </button>
      </div>
      <div className="analytics" data-reveal>
        <h4 id="gtTitle">{table.title}</h4>
        <table className="atable">
          <thead>
            <tr>
              <th>Thema</th>
              <th>Fokus</th>
              <th>Hinweis</th>
              <th>Stand</th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={`${table.title}-${row[1]}`}>
                <td className="who">
                  <img className="avatar" src={row[0]} alt={row[1]} />
                  {row[1]}
                </td>
                <td>{row[2]}</td>
                <td className="amt">{row[3]}</td>
                <td>
                  <span className={`status ${row[4]}`}>{row[4] === "approved" ? "Empfohlen" : "Gespräch"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
