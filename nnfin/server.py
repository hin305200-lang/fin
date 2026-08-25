#!/usr/bin/env python3
"""NN Finanz backend: users, sessions, and activity tracking."""
from __future__ import annotations

import hashlib
import json
import os
import re
import secrets
import sqlite3
import threading
import uuid
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(ROOT, "data")
DB_PATH = os.path.join(DATA_DIR, "nnfin.db")
PORT = int(os.environ.get("PORT", "4471"))
LOCK = threading.Lock()

DEMO_EMAIL = os.environ.get("NNFIN_DEMO_EMAIL", "test@test.com")
DEMO_PASSWORD = os.environ.get("NNFIN_DEMO_PASSWORD", "test123")
ONLINE_SECS = 90


def now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def new_id() -> str:
    return str(uuid.uuid4())


def hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), 120000)
    return salt, digest.hex()


def check_password(password: str, salt: str, expected: str) -> bool:
    _, got = hash_password(password, salt)
    return secrets.compare_digest(got, expected)


def connect() -> sqlite3.Connection:
    os.makedirs(DATA_DIR, exist_ok=True)
    con = sqlite3.connect(DB_PATH, check_same_thread=False)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    con.execute("PRAGMA journal_mode = WAL")
    return con


DB = connect()


def init_db() -> None:
    DB.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT DEFAULT '',
          address TEXT DEFAULT '',
          tax_id TEXT DEFAULT '',
          status TEXT DEFAULT 'neu',
          kyc TEXT DEFAULT 'offen',
          notes TEXT DEFAULT '',
          tags TEXT DEFAULT '',
          source TEXT DEFAULT 'website',
          password_hash TEXT NOT NULL,
          salt TEXT NOT NULL,
          visitor_id TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          last_login_at TEXT,
          last_logout_at TEXT,
          last_seen_at TEXT,
          last_ip TEXT,
          last_user_agent TEXT,
          login_count INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          admin_id TEXT,
          token TEXT NOT NULL UNIQUE,
          kind TEXT NOT NULL,
          ip TEXT,
          user_agent TEXT,
          created_at TEXT NOT NULL,
          last_seen_at TEXT NOT NULL,
          ended_at TEXT,
          logout_reason TEXT
        );
        CREATE TABLE IF NOT EXISTS events (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          visitor_id TEXT,
          session_id TEXT,
          type TEXT NOT NULL,
          path TEXT,
          title TEXT,
          label TEXT,
          href TEXT,
          extra TEXT,
          ip TEXT,
          user_agent TEXT,
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS admins (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          salt TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS crm_notes (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          author TEXT NOT NULL,
          body TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id, created_at);
        CREATE INDEX IF NOT EXISTS idx_events_visitor ON events(visitor_id, created_at);
        CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id, created_at);
        """
    )
    DB.commit()
    seed()


def seed() -> None:
    DB.execute("DELETE FROM admins")
    salt, pw = hash_password(DEMO_PASSWORD)
    existing = DB.execute("SELECT id FROM users WHERE email = ?", (DEMO_EMAIL,)).fetchone()
    if existing:
        DB.execute(
            "UPDATE users SET password_hash = ?, salt = ? WHERE email = ?",
            (pw, salt, DEMO_EMAIL),
        )
    if not existing:
        salt, pw = hash_password(DEMO_PASSWORD)
        uid = "demo-test-user"
        created = "2026-01-15T10:00:00.000Z"
        DB.execute(
            """INSERT INTO users (id, name, email, phone, address, tax_id, status, kyc, notes, tags, source,
               password_hash, salt, created_at, updated_at, last_login_at, last_seen_at, login_count)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                uid, "Mark", DEMO_EMAIL, "+4915215729944",
                "Linienstraße 48, 10119 Berlin", "12 345 678 901",
                "aktiv", "verifiziert", "Demo-Mandant für Plattformtests.", "demo,vip",
                "seed", pw, salt, created, now(), now(), now(), 12,
            ),
        )
        samples = [
            ("page_view", "/", "NN Finanz", "Startseite", None, "2026-08-18T08:12:00.000Z"),
            ("click", "/", "NN Finanz", "Anmelden", "/login.html", "2026-08-18T08:12:14.000Z"),
            ("page_view", "/login.html", "Anmelden", "Login geöffnet", None, "2026-08-18T08:12:20.000Z"),
            ("login", "/login.html", "Anmelden", "Login erfolgreich", None, "2026-08-18T08:12:44.000Z"),
            ("page_view", "/app.html", "Marktplatz", "Übersicht", None, "2026-08-18T08:13:02.000Z"),
            ("click", "/app.html", "Marktplatz", "Banken", None, "2026-08-18T08:14:11.000Z"),
            ("click", "/app.html", "Marktplatz", "HSBC Premier Giro", None, "2026-08-18T09:02:00.000Z"),
            ("app_action", "/app.html", "Marktplatz", "Konto geöffnet: HSBC", None, "2026-08-18T09:02:18.000Z"),
            ("page_view", "/app.html", "Marktplatz", "Tagesgeld", None, "2026-08-19T11:20:00.000Z"),
            ("click", "/app.html", "Marktplatz", "Quenzia Direkt", None, "2026-08-19T11:21:08.000Z"),
            ("app_action", "/app.html", "Marktplatz", "Tagesgeld eröffnet", None, "2026-08-19T11:22:40.000Z"),
            ("page_view", "/app.html", "Marktplatz", "ETF-Portfolios", None, "2026-08-20T16:40:00.000Z"),
            ("click", "/app.html", "Marktplatz", "Lumenix Global", None, "2026-08-20T16:41:12.000Z"),
            ("heartbeat", "/app.html", "Marktplatz", "Session aktiv", None, "2026-08-21T07:55:00.000Z"),
            ("page_view", "/app.html", "Marktplatz", "Profil & Sicherheit", None, "2026-08-22T19:08:00.000Z"),
            ("profile_update", "/app.html", "Profil", "Profil gespeichert", None, "2026-08-22T19:09:22.000Z"),
            ("login", "/login.html", "Anmelden", "Login erfolgreich", None, "2026-08-24T08:10:00.000Z"),
            ("page_view", "/app.html", "Marktplatz", "Übersicht", None, "2026-08-24T08:10:20.000Z"),
            ("click", "/app.html", "Marktplatz", "Umsätze", None, "2026-08-24T08:11:03.000Z"),
            ("page_view", "/", "NN Finanz", "Startseite", None, "2026-08-25T06:40:00.000Z"),
        ]
        for typ, path, title, label, href, created in samples:
            DB.execute(
                """INSERT INTO events (id, user_id, visitor_id, session_id, type, path, title, label, href, extra, ip, user_agent, created_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (new_id(), uid, "seed-visitor", None, typ, path, title, label, href, None,
                 "127.0.0.1", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36", created),
            )
    pad_demo_telemetry()
    DB.commit()


def pad_demo_telemetry() -> None:
    demo = DB.execute("SELECT id FROM users WHERE email = ?", (DEMO_EMAIL,)).fetchone()
    if not demo:
        return
    uid = demo["id"]
    n = DB.execute("SELECT COUNT(*) AS c FROM events WHERE user_id = ? AND created_at = ?", (uid, "2026-08-19T11:20:00.000Z")).fetchone()["c"]
    if n:
        return
    extra = [
        ("page_view", "/app.html", "Marktplatz", "Tagesgeld", None, "2026-08-19T11:20:00.000Z"),
        ("click", "/app.html", "Marktplatz", "Quenzia Direkt", None, "2026-08-19T11:21:08.000Z"),
        ("app_action", "/app.html", "Marktplatz", "Tagesgeld eröffnet", None, "2026-08-19T11:22:40.000Z"),
        ("page_view", "/app.html", "Marktplatz", "ETF-Portfolios", None, "2026-08-20T16:40:00.000Z"),
        ("click", "/app.html", "Marktplatz", "Lumenix Global", None, "2026-08-20T16:41:12.000Z"),
        ("heartbeat", "/app.html", "Marktplatz", "Session aktiv", None, "2026-08-21T07:55:00.000Z"),
        ("page_view", "/app.html", "Marktplatz", "Profil & Sicherheit", None, "2026-08-22T19:08:00.000Z"),
        ("profile_update", "/app.html", "Profil", "Profil gespeichert", None, "2026-08-22T19:09:22.000Z"),
        ("login", "/login.html", "Anmelden", "Login erfolgreich", None, "2026-08-24T08:10:00.000Z"),
        ("page_view", "/app.html", "Marktplatz", "Übersicht", None, "2026-08-24T08:10:20.000Z"),
        ("click", "/app.html", "Marktplatz", "Umsätze", None, "2026-08-24T08:11:03.000Z"),
        ("page_view", "/", "NN Finanz", "Startseite", None, "2026-08-25T06:40:00.000Z"),
    ]
    ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    for typ, path, title, label, href, created in extra:
        DB.execute(
            """INSERT INTO events (id, user_id, visitor_id, session_id, type, path, title, label, href, extra, ip, user_agent, created_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (new_id(), uid, "seed-visitor", None, typ, path, title, label, href, None, "127.0.0.1", ua, created),
        )


def row_to_dict(row: sqlite3.Row | None) -> dict | None:
    return dict(row) if row else None


def public_user(row) -> dict:
    u = dict(row)
    u.pop("password_hash", None)
    u.pop("salt", None)
    u["online"] = is_online(u.get("last_seen_at"))
    return u


def is_online(ts: str | None) -> bool:
    if not ts:
        return False
    try:
        t = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        return (datetime.now(timezone.utc) - t).total_seconds() < ONLINE_SECS
    except Exception:
        return False


def read_json(handler) -> dict:
    length = int(handler.headers.get("Content-Length") or 0)
    if length <= 0:
        return {}
    raw = handler.rfile.read(length)
    try:
        data = json.loads(raw.decode("utf-8") or "{}")
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def bearer(handler) -> str | None:
    h = handler.headers.get("Authorization") or ""
    if h.lower().startswith("bearer "):
        return h[7:].strip()
    return None


def session_for(token: str | None, kind: str):
    if not token:
        return None
    return DB.execute(
        "SELECT * FROM sessions WHERE token = ? AND kind = ? AND ended_at IS NULL",
        (token, kind),
    ).fetchone()


def client_ip(handler) -> str:
    return (handler.headers.get("X-Forwarded-For") or handler.client_address[0] or "").split(",")[0].strip()


def ua(handler) -> str:
    return (handler.headers.get("User-Agent") or "")[:400]


def valid_email(email: str) -> bool:
    return bool(re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email or ""))


def insert_event(user_id, visitor_id, session_id, typ, path, title, label, href, extra, ip, user_agent):
    extra_s = json.dumps(extra, ensure_ascii=False) if extra else None
    DB.execute(
        """INSERT INTO events (id, user_id, visitor_id, session_id, type, path, title, label, href, extra, ip, user_agent, created_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (new_id(), user_id, visitor_id, session_id, typ, path, title, label, href, extra_s, ip, user_agent, now()),
    )


def touch_user(user_id: str, ip: str, user_agent: str) -> None:
    DB.execute(
        "UPDATE users SET last_seen_at = ?, last_ip = ?, last_user_agent = ?, updated_at = ? WHERE id = ?",
        (now(), ip, user_agent, now(), user_id),
    )


init_db()


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):
        sys_stderr = __import__("sys").stderr
        sys_stderr.write("[nnfin] " + (fmt % args) + "\n")

    def send_json(self, code: int, payload) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def error_json(self, code: int, message: str) -> None:
        self.send_json(code, {"error": message})

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/data/") or parsed.path.endswith(".py") or parsed.path.endswith(".db"):
            return self.error_json(403, "Forbidden")
        if self.path.startswith("/api/"):
            return self.dispatch("GET")
        return SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        if self.path.startswith("/api/"):
            return self.dispatch("POST")
        return self.error_json(404, "Nicht gefunden")

    def do_PATCH(self):
        if self.path.startswith("/api/"):
            return self.dispatch("PATCH")
        return self.error_json(404, "Nicht gefunden")

    def dispatch(self, method: str) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        query = {k: v[0] for k, v in parse_qs(parsed.query).items()}
        body = read_json(self) if method in ("POST", "PATCH") else {}
        ip, user_agent = client_ip(self), ua(self)
        token = bearer(self)
        with LOCK:
            try:
                self.route(method, path, query, body, token, ip, user_agent)
            except ValueError as e:
                self.error_json(400, str(e))
            except PermissionError as e:
                self.error_json(401, str(e) or "Bitte anmelden.")
            except LookupError as e:
                self.error_json(404, str(e) or "Nicht gefunden")
            except Exception as e:
                self.error_json(500, "Serverfehler: " + str(e))

    def require_user(self, token):
        sess = session_for(token, "user")
        if not sess:
            raise PermissionError("Bitte anmelden.")
        user = DB.execute("SELECT * FROM users WHERE id = ?", (sess["user_id"],)).fetchone()
        if not user:
            raise PermissionError("Bitte anmelden.")
        return sess, user

    def route(self, method, path, query, body, token, ip, user_agent):
        if method == "GET" and path == "/api/health":
            n = DB.execute("SELECT COUNT(*) AS c FROM users").fetchone()["c"]
            return self.send_json(200, {"ok": True, "users": n})

        if method == "POST" and path == "/api/signup":
            return self.signup(body, ip, user_agent)
        if method == "POST" and path == "/api/login":
            return self.login(body, ip, user_agent)
        if method == "POST" and path == "/api/logout":
            return self.logout(token, body, ip, user_agent)
        if method == "GET" and path == "/api/me":
            sess, user = self.require_user(token)
            touch_user(user["id"], ip, user_agent)
            DB.execute("UPDATE sessions SET last_seen_at = ? WHERE id = ?", (now(), sess["id"]))
            DB.commit()
            return self.send_json(200, {"user": public_user(user), "sessionId": sess["id"]})
        if method == "PATCH" and path == "/api/me":
            return self.patch_me(token, body, ip, user_agent)
        if method == "POST" and path == "/api/events":
            return self.ingest_events(token, body, ip, user_agent)
        if method == "POST" and path == "/api/heartbeat":
            return self.heartbeat(token, body, ip, user_agent)

        raise LookupError("Nicht gefunden")

    def signup(self, body, ip, user_agent):
        name = (body.get("name") or "").strip()
        email = (body.get("email") or "").strip().lower()
        phone = (body.get("phone") or "").strip()
        password = body.get("password") or ""
        confirm = body.get("confirm") or ""
        visitor_id = (body.get("visitorId") or "")[:80]
        if not name:
            raise ValueError("Bitte geben Sie Ihren Namen ein.")
        if not valid_email(email):
            raise ValueError("Bitte geben Sie eine gültige E-Mail-Adresse ein.")
        if len(password) < 8:
            raise ValueError("Das Passwort muss mindestens 8 Zeichen haben.")
        if password != confirm:
            raise ValueError("Die Passwörter stimmen nicht überein.")
        if DB.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone():
            raise ValueError("Für diese E-Mail existiert bereits ein Konto. Bitte anmelden.")
        uid = new_id()
        salt, pw = hash_password(password)
        ts = now()
        DB.execute(
            """INSERT INTO users (id, name, email, phone, status, kyc, source, password_hash, salt, visitor_id,
               created_at, updated_at, last_login_at, last_seen_at, last_ip, last_user_agent, login_count)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (uid, name, email, phone, "neu", "offen", "signup", pw, salt, visitor_id or None,
             ts, ts, ts, ts, ip, user_agent, 1),
        )
        if visitor_id:
            DB.execute("UPDATE events SET user_id = COALESCE(user_id, ?) WHERE visitor_id = ?", (uid, visitor_id))
        sid, token = self.open_session(uid, None, "user", ip, user_agent)
        insert_event(uid, visitor_id, sid, "signup", "/signup.html", "Registrieren", "Konto erstellt", None, {"name": name, "email": email}, ip, user_agent)
        insert_event(uid, visitor_id, sid, "login", "/signup.html", "Registrieren", "Automatisch angemeldet nach Registrierung", None, None, ip, user_agent)
        DB.commit()
        user = DB.execute("SELECT * FROM users WHERE id = ?", (uid,)).fetchone()
        return self.send_json(200, {"token": token, "sessionId": sid, "user": public_user(user)})

    def login(self, body, ip, user_agent):
        email = (body.get("email") or "").strip().lower()
        password = (body.get("password") or "").strip()
        visitor_id = (body.get("visitorId") or "")[:80]
        demo_email = DEMO_EMAIL.strip().lower()
        if email in ("test", "test@", demo_email):
            email = demo_email
        if email == demo_email and password in ("test", "test123", DEMO_PASSWORD):
            password = DEMO_PASSWORD
        user = DB.execute("SELECT * FROM users WHERE lower(email) = ?", (email,)).fetchone()
        if not user or not check_password(password, user["salt"], user["password_hash"]):
            insert_event(user["id"] if user else None, visitor_id, None, "login_failed", "/login.html", "Anmelden", email or "unbekannt", None, None, ip, user_agent)
            DB.commit()
            raise ValueError("E-Mail oder Passwort ist falsch.")
        DB.execute(
            """UPDATE users SET last_login_at = ?, last_seen_at = ?, last_ip = ?, last_user_agent = ?,
               login_count = login_count + 1, visitor_id = COALESCE(visitor_id, ?), updated_at = ? WHERE id = ?""",
            (now(), now(), ip, user_agent, visitor_id or None, now(), user["id"]),
        )
        if visitor_id:
            DB.execute("UPDATE events SET user_id = COALESCE(user_id, ?) WHERE visitor_id = ?", (user["id"], visitor_id))
        sid, token = self.open_session(user["id"], None, "user", ip, user_agent)
        insert_event(user["id"], visitor_id, sid, "login", "/login.html", "Anmelden", "Login erfolgreich", None, None, ip, user_agent)
        DB.commit()
        user = DB.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()
        return self.send_json(200, {"token": token, "sessionId": sid, "user": public_user(user)})

    def logout(self, token, body, ip, user_agent):
        sess = session_for(token, "user")
        if sess:
            DB.execute("UPDATE sessions SET ended_at = ?, logout_reason = ? WHERE id = ?", (now(), "logout", sess["id"]))
            DB.execute("UPDATE users SET last_logout_at = ?, updated_at = ? WHERE id = ?", (now(), now(), sess["user_id"]))
            insert_event(sess["user_id"], body.get("visitorId"), sess["id"], "logout", body.get("path") or "/", "Abmelden", "Logout", None, None, ip, user_agent)
            DB.commit()
        return self.send_json(200, {"ok": True})

    def open_session(self, user_id, admin_id, kind, ip, user_agent):
        sid, token = new_id(), secrets.token_hex(32)
        ts = now()
        DB.execute(
            """INSERT INTO sessions (id, user_id, admin_id, token, kind, ip, user_agent, created_at, last_seen_at)
               VALUES (?,?,?,?,?,?,?,?,?)""",
            (sid, user_id, admin_id, token, kind, ip, user_agent, ts, ts),
        )
        return sid, token

    def patch_me(self, token, body, ip, user_agent):
        sess, user = self.require_user(token)
        fields = {}
        for key in ("name", "phone", "address", "tax_id"):
            if key in body or (key == "tax_id" and "taxId" in body):
                val = body.get(key, body.get("taxId", ""))
                fields[key] = (val or "").strip()
        if not fields:
            return self.send_json(200, {"user": public_user(user)})
        sets = ", ".join(k + " = ?" for k in fields)
        DB.execute("UPDATE users SET " + sets + ", updated_at = ? WHERE id = ?", list(fields.values()) + [now(), user["id"]])
        insert_event(user["id"], body.get("visitorId"), sess["id"], "profile_update", "/app.html", "Profil", "Profil gespeichert", None, fields, ip, user_agent)
        touch_user(user["id"], ip, user_agent)
        DB.commit()
        user = DB.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()
        return self.send_json(200, {"user": public_user(user)})

    def ingest_events(self, token, body, ip, user_agent):
        sess = session_for(token, "user")
        user_id = sess["user_id"] if sess else None
        visitor_id = (body.get("visitorId") or "")[:80] or None
        items = body.get("events") or []
        if not isinstance(items, list):
            raise ValueError("Ungültige Events.")
        for item in items[:80]:
            if not isinstance(item, dict):
                continue
            typ = (item.get("type") or "click")[:40]
            if typ in ("login", "logout", "signup"):
                continue
            insert_event(
                user_id, visitor_id, sess["id"] if sess else None, typ,
                (item.get("path") or "")[:300], (item.get("title") or "")[:200],
                (item.get("label") or "")[:240], (item.get("href") or "")[:400] or None,
                item.get("extra") if isinstance(item.get("extra"), dict) else None,
                ip, user_agent,
            )
        if user_id:
            touch_user(user_id, ip, user_agent)
            if sess:
                DB.execute("UPDATE sessions SET last_seen_at = ? WHERE id = ?", (now(), sess["id"]))
        DB.commit()
        return self.send_json(200, {"ok": True, "accepted": min(len(items), 80)})

    def heartbeat(self, token, body, ip, user_agent):
        sess = session_for(token, "user")
        if sess:
            touch_user(sess["user_id"], ip, user_agent)
            DB.execute("UPDATE sessions SET last_seen_at = ? WHERE id = ?", (now(), sess["id"]))
            DB.commit()
        return self.send_json(200, {"ok": True})


def main():
    os.chdir(ROOT)
    httpd = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print("NN Finanz läuft auf http://127.0.0.1:%s/" % PORT)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer beendet.")


if __name__ == "__main__":
    main()
