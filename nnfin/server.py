#!/usr/bin/env python3
"""NN Finanz backend: users, sessions, activity tracking, and CRM API."""
from __future__ import annotations

import hashlib
import json
import os
import re
import secrets
import sqlite3
import threading
import uuid
from datetime import datetime, timedelta, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(ROOT, "data")
DB_PATH = os.path.join(DATA_DIR, "nnfin.db")
PORT = int(os.environ.get("PORT", "4471"))
LOCK = threading.Lock()

ADMIN_EMAIL = os.environ.get("NNFIN_ADMIN_EMAIL", "admin305@myadmin.com")
ADMIN_PASSWORD = os.environ.get("NNFIN_ADMIN_PASSWORD", "admin305@mylove")
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
    email = ADMIN_EMAIL.strip().lower()
    salt, pw = hash_password(ADMIN_PASSWORD)
    DB.execute("DELETE FROM admins")
    DB.execute(
        "INSERT INTO admins (id, name, email, password_hash, salt, created_at) VALUES (?,?,?,?,?,?)",
        (new_id(), "Thomas", email, pw, salt, now()),
    )
    if not DB.execute("SELECT id FROM users WHERE email = ?", (DEMO_EMAIL,)).fetchone():
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


def parse_ts(ts: str | None) -> datetime | None:
    if not ts:
        return None
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except Exception:
        return None


def parse_ua(ua: str | None) -> dict:
    raw = ua or ""
    device, browser, os_name = "Desktop", "Unknown", "Unknown"
    if "iPhone" in raw:
        device = "iPhone"
    elif "iPad" in raw:
        device = "iPad"
    elif "Android" in raw and "Mobile" in raw:
        device = "Android"
    elif "Android" in raw:
        device = "Tablet"
    elif "Mobile" in raw:
        device = "Mobile"
    if "Edg/" in raw:
        browser = "Edge"
    elif "OPR/" in raw or "Opera" in raw:
        browser = "Opera"
    elif "Chrome/" in raw:
        browser = "Chrome"
    elif "Firefox/" in raw:
        browser = "Firefox"
    elif "Safari/" in raw and "Chrome" not in raw:
        browser = "Safari"
    if "Mac OS" in raw or "Macintosh" in raw:
        os_name = "macOS"
    elif "Windows" in raw:
        os_name = "Windows"
    elif "Android" in raw:
        os_name = "Android"
    elif "iPhone" in raw or "iPad" in raw:
        os_name = "iOS"
    elif "Linux" in raw:
        os_name = "Linux"
    return {"device": device, "browser": browser, "os": os_name, "raw": raw[:180]}


def engagement_score(user: dict, events_n: int = 0) -> int:
    score = 8
    seen = parse_ts(user.get("last_seen_at"))
    if seen:
        age = (datetime.now(timezone.utc) - seen).total_seconds()
        if age < ONLINE_SECS:
            score += 30
        elif age < 3600:
            score += 22
        elif age < 86400:
            score += 16
        elif age < 86400 * 7:
            score += 8
    score += min(24, int(user.get("login_count") or 0) * 2)
    score += min(22, events_n // 3)
    if user.get("kyc") == "verifiziert":
        score += 10
    elif user.get("kyc") == "abgelehnt":
        score -= 12
    if user.get("status") == "aktiv":
        score += 8
    elif user.get("status") == "beratung":
        score += 6
    elif user.get("status") == "inaktiv":
        score -= 14
    return max(0, min(99, score))


def event_heatmap(extra_sql: str = "", args: tuple = (), days: int = 14) -> list:
    rows = DB.execute(
        "SELECT created_at FROM events WHERE created_at >= date('now', ?) " + extra_sql,
        ("-%d days" % days,) + args,
    ).fetchall()
    grid = [[0] * 24 for _ in range(7)]
    for r in rows:
        dt = parse_ts(r["created_at"])
        if dt:
            grid[dt.weekday()][dt.hour] += 1
    return grid


def daily_series(extra_sql: str = "", args: tuple = (), days: int = 14) -> list:
    today = datetime.now(timezone.utc).date()
    out = []
    for i in range(days - 1, -1, -1):
        key = (today - timedelta(days=i)).isoformat()
        n = DB.execute(
            "SELECT COUNT(*) AS c FROM events WHERE substr(created_at,1,10) = ? " + extra_sql,
            (key,) + args,
        ).fetchone()["c"]
        out.append({"day": key, "n": n})
    return out


def type_mix(extra_sql: str = "", args: tuple = (), days: int = 14) -> list:
    rows = DB.execute(
        "SELECT type, COUNT(*) AS n FROM events WHERE created_at >= date('now', ?) "
        + extra_sql
        + " GROUP BY type ORDER BY n DESC",
        ("-%d days" % days,) + args,
    ).fetchall()
    return [dict(r) for r in rows]


def session_seconds(row) -> int:
    start = parse_ts(row["created_at"])
    end = parse_ts(row["ended_at"] or row["last_seen_at"] or row["created_at"])
    if not start or not end:
        return 0
    return max(0, int((end - start).total_seconds()))


def enrich_user(row) -> dict:
    u = public_user(row)
    events_n = DB.execute("SELECT COUNT(*) AS c FROM events WHERE user_id = ?", (u["id"],)).fetchone()["c"]
    u["events"] = events_n
    u["score"] = engagement_score(u, events_n)
    u["device"] = parse_ua(u.get("last_user_agent"))
    return u


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


def admin_by_credentials(email: str, password: str):
    email = (email or "").strip().lower()
    password = (password or "").strip()
    if not email or not password:
        return None
    admin = DB.execute("SELECT * FROM admins WHERE lower(email) = ?", (email,)).fetchone()
    if not admin or not check_password(password, admin["salt"], admin["password_hash"]):
        return None
    return admin


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

    def require_admin(self, token):
        sess = session_for(token, "admin")
        if not sess:
            raise PermissionError("Staff login required.")
        admin = DB.execute("SELECT * FROM admins WHERE id = ?", (sess["admin_id"],)).fetchone()
        if not admin:
            raise PermissionError("Staff login required.")
        return sess, admin

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

        if method == "POST" and path == "/api/admin/login":
            return self.admin_login(body, ip, user_agent)
        if method == "POST" and path == "/api/admin/logout":
            sess = session_for(token, "admin")
            if sess:
                DB.execute("UPDATE sessions SET ended_at = ?, logout_reason = ? WHERE id = ?", (now(), "logout", sess["id"]))
                DB.commit()
            return self.send_json(200, {"ok": True})
        if method == "GET" and path == "/api/admin/overview":
            self.require_admin(token)
            return self.send_json(200, self.overview())
        if method == "GET" and path == "/api/admin/clients":
            self.require_admin(token)
            return self.send_json(200, {"clients": self.list_clients(query)})
        if method == "GET" and path == "/api/admin/live":
            self.require_admin(token)
            return self.send_json(200, {"live": self.live()})
        if method == "GET" and path == "/api/admin/intel":
            self.require_admin(token)
            return self.send_json(200, self.intel())
        if method == "GET" and path == "/api/admin/activity":
            self.require_admin(token)
            return self.send_json(200, {"events": self.global_activity(query)})

        m = re.match(r"^/api/admin/clients/([^/]+)$", path)
        if m and method == "GET":
            self.require_admin(token)
            return self.send_json(200, self.client_detail(m.group(1)))
        if m and method == "PATCH":
            sess, admin = self.require_admin(token)
            return self.patch_client(m.group(1), body, admin, ip, user_agent)

        m = re.match(r"^/api/admin/clients/([^/]+)/events$", path)
        if m and method == "GET":
            self.require_admin(token)
            return self.send_json(200, {"events": self.user_events(m.group(1), query)})

        m = re.match(r"^/api/admin/clients/([^/]+)/sessions$", path)
        if m and method == "GET":
            self.require_admin(token)
            rows = DB.execute(
                "SELECT id, ip, user_agent, created_at, last_seen_at, ended_at, logout_reason FROM sessions WHERE user_id = ? AND kind = 'user' ORDER BY created_at DESC LIMIT 100",
                (m.group(1),),
            ).fetchall()
            return self.send_json(200, {"sessions": [dict(r) for r in rows]})

        m = re.match(r"^/api/admin/clients/([^/]+)/notes$", path)
        if m and method == "POST":
            sess, admin = self.require_admin(token)
            text = (body.get("body") or "").strip()
            if not text:
                raise ValueError("Note cannot be empty.")
            DB.execute(
                "INSERT INTO crm_notes (id, user_id, author, body, created_at) VALUES (?,?,?,?,?)",
                (new_id(), m.group(1), admin["name"], text, now()),
            )
            insert_event(m.group(1), None, sess["id"], "crm_note", "/crm.html", "CRM", "Notiz hinzugefügt", None, {"preview": text[:120]}, ip, user_agent)
            DB.commit()
            return self.send_json(200, {"ok": True})

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
        admin = admin_by_credentials(email, password)
        if admin:
            sid, token = self.open_session(None, admin["id"], "admin", ip, user_agent)
            DB.commit()
            return self.send_json(
                200,
                {
                    "kind": "staff",
                    "token": token,
                    "admin": {"id": admin["id"], "name": admin["name"], "email": admin["email"]},
                },
            )
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

    def admin_login(self, body, ip, user_agent):
        email = (body.get("email") or "").strip().lower()
        password = (body.get("password") or "").strip()
        admin = admin_by_credentials(email, password)
        if not admin:
            raise ValueError("Email or password is incorrect.")
        sid, token = self.open_session(None, admin["id"], "admin", ip, user_agent)
        DB.commit()
        return self.send_json(200, {"token": token, "admin": {"id": admin["id"], "name": admin["name"], "email": admin["email"]}})

    def overview(self):
        users = DB.execute("SELECT COUNT(*) AS c FROM users").fetchone()["c"]
        verified = DB.execute("SELECT COUNT(*) AS c FROM users WHERE kyc = 'verifiziert'").fetchone()["c"]
        logins_today = DB.execute("SELECT COUNT(*) AS c FROM events WHERE type = 'login' AND created_at >= date('now')").fetchone()["c"]
        signups_today = DB.execute("SELECT COUNT(*) AS c FROM events WHERE type = 'signup' AND created_at >= date('now')").fetchone()["c"]
        clicks_today = DB.execute("SELECT COUNT(*) AS c FROM events WHERE type = 'click' AND created_at >= date('now')").fetchone()["c"]
        failed_today = DB.execute("SELECT COUNT(*) AS c FROM events WHERE type = 'login_failed' AND created_at >= date('now')").fetchone()["c"]
        events_today = DB.execute("SELECT COUNT(*) AS c FROM events WHERE created_at >= date('now')").fetchone()["c"]
        visitors = DB.execute(
            "SELECT COUNT(DISTINCT visitor_id) AS c FROM events WHERE visitor_id IS NOT NULL AND visitor_id != '' AND created_at >= date('now', '-7 days')"
        ).fetchone()["c"]
        online = self.live()
        recent = DB.execute("SELECT * FROM users ORDER BY created_at DESC LIMIT 8").fetchall()
        watch = DB.execute("SELECT * FROM users ORDER BY COALESCE(last_seen_at, created_at) DESC LIMIT 40").fetchall()
        feed = DB.execute(
            """SELECT e.*, u.name AS user_name, u.email AS user_email
               FROM events e LEFT JOIN users u ON u.id = e.user_id
               ORDER BY e.created_at DESC LIMIT 24"""
        ).fetchall()
        by_status = {r["status"]: r["c"] for r in DB.execute("SELECT status, COUNT(*) AS c FROM users GROUP BY status")}
        by_kyc = {r["kyc"]: r["c"] for r in DB.execute("SELECT kyc, COUNT(*) AS c FROM users GROUP BY kyc")}
        return {
            "now": now(),
            "users": users,
            "verified": verified,
            "online": len(online),
            "onlineNodes": online[:12],
            "loginsToday": logins_today,
            "signupsToday": signups_today,
            "clicksToday": clicks_today,
            "failedToday": failed_today,
            "eventsToday": events_today,
            "visitors7d": visitors,
            "byStatus": by_status,
            "byKyc": by_kyc,
            "series": daily_series("", (), 14),
            "heatmap": event_heatmap("", (), 14),
            "mix": type_mix("", (), 14),
            "funnel": self.funnel(),
            "recentClients": [enrich_user(r) for r in recent],
            "priority": sorted([enrich_user(r) for r in watch], key=lambda x: x["score"], reverse=True)[:8],
            "feed": [dict(r) for r in feed],
        }

    def funnel(self):
        def n(sql, args=()):
            return DB.execute(sql, args).fetchone()["c"]
        return {
            "signups": n("SELECT COUNT(*) AS c FROM events WHERE type = 'signup'"),
            "logins": n("SELECT COUNT(*) AS c FROM events WHERE type = 'login'"),
            "marketplace": n("SELECT COUNT(*) AS c FROM events WHERE type = 'page_view' AND path LIKE ?", ("%app.html%",)),
            "actions": n("SELECT COUNT(*) AS c FROM events WHERE type = 'app_action'"),
            "banks": n(
                "SELECT COUNT(*) AS c FROM events WHERE type IN ('click','app_action') AND (label LIKE ? OR label LIKE ? OR label LIKE ?)",
                ("%Bank%", "%Giro%", "%Konto%"),
            ),
        }

    def intel(self):
        failed = DB.execute(
            """SELECT e.*, u.name AS user_name, u.email AS user_email
               FROM events e LEFT JOIN users u ON u.id = e.user_id
               WHERE e.type = 'login_failed' ORDER BY e.created_at DESC LIMIT 24"""
        ).fetchall()
        pages = DB.execute(
            """SELECT path, title, COUNT(*) AS views, MAX(created_at) AS last_at
               FROM events WHERE type = 'page_view' GROUP BY path, title ORDER BY views DESC LIMIT 10"""
        ).fetchall()
        clicks = DB.execute(
            """SELECT label, path, COUNT(*) AS n, MAX(created_at) AS last_at
               FROM events WHERE type = 'click' AND label IS NOT NULL AND label != ''
               GROUP BY label, path ORDER BY n DESC LIMIT 12"""
        ).fetchall()
        ips = DB.execute(
            """SELECT last_ip AS ip, COUNT(*) AS n, MAX(last_seen_at) AS last_at
               FROM users WHERE last_ip IS NOT NULL AND last_ip != '' GROUP BY last_ip ORDER BY n DESC LIMIT 8"""
        ).fetchall()
        devices = {}
        for r in DB.execute("SELECT last_user_agent FROM users WHERE last_user_agent IS NOT NULL AND last_user_agent != ''"):
            d = parse_ua(r["last_user_agent"])
            key = d["os"] + " · " + d["browser"]
            devices[key] = devices.get(key, 0) + 1
        device_list = [{"label": k, "n": v} for k, v in sorted(devices.items(), key=lambda x: -x[1])]
        return {
            "now": now(),
            "heatmap": event_heatmap("", (), 14),
            "series": daily_series("", (), 14),
            "mix": type_mix("", (), 30),
            "funnel": self.funnel(),
            "failed": [dict(r) for r in failed],
            "topPages": [dict(r) for r in pages],
            "topClicks": [dict(r) for r in clicks],
            "ips": [dict(r) for r in ips],
            "devices": device_list,
            "live": self.live(),
        }

    def list_clients(self, query):
        q = (query.get("q") or "").strip()
        status = (query.get("status") or "").strip()
        kyc = (query.get("kyc") or "").strip()
        sql = "SELECT * FROM users WHERE 1=1"
        args = []
        if q:
            sql += " AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR tags LIKE ? OR last_ip LIKE ?)"
            like = "%" + q + "%"
            args += [like, like, like, like, like]
        if status:
            sql += " AND status = ?"
            args.append(status)
        if kyc:
            sql += " AND kyc = ?"
            args.append(kyc)
        sql += " ORDER BY COALESCE(last_seen_at, created_at) DESC"
        rows = DB.execute(sql, args).fetchall()
        out = []
        for r in rows:
            item = enrich_user(r)
            item["openSessions"] = DB.execute(
                "SELECT COUNT(*) AS c FROM sessions WHERE user_id = ? AND kind = 'user' AND ended_at IS NULL",
                (r["id"],),
            ).fetchone()["c"]
            last = DB.execute(
                "SELECT type, path, label, created_at FROM events WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
                (r["id"],),
            ).fetchone()
            item["lastEvent"] = dict(last) if last else None
            out.append(item)
        return out

    def live(self):
        rows = DB.execute(
            """SELECT * FROM users WHERE last_seen_at IS NOT NULL ORDER BY last_seen_at DESC"""
        ).fetchall()
        out = []
        for r in rows:
            if not is_online(r["last_seen_at"]):
                continue
            item = enrich_user(r)
            last = DB.execute(
                "SELECT type, path, title, label, created_at FROM events WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
                (r["id"],),
            ).fetchone()
            item["lastEvent"] = dict(last) if last else None
            sess = DB.execute(
                "SELECT created_at, last_seen_at, ip FROM sessions WHERE user_id = ? AND kind = 'user' AND ended_at IS NULL ORDER BY last_seen_at DESC LIMIT 1",
                (r["id"],),
            ).fetchone()
            item["openSession"] = dict(sess) if sess else None
            out.append(item)
        return out

    def global_activity(self, query):
        limit = min(int(query.get("limit") or 80), 200)
        typ = (query.get("type") or "").strip()
        sql = """SELECT e.*, u.name AS user_name, u.email AS user_email
               FROM events e LEFT JOIN users u ON u.id = e.user_id WHERE 1=1"""
        args = []
        if typ:
            sql += " AND e.type = ?"
            args.append(typ)
        sql += " ORDER BY e.created_at DESC LIMIT ?"
        args.append(limit)
        return [dict(r) for r in DB.execute(sql, args).fetchall()]

    def user_events(self, user_id, query):
        typ = (query.get("type") or "").strip()
        sql = "SELECT * FROM events WHERE user_id = ?"
        args = [user_id]
        if typ:
            sql += " AND type = ?"
            args.append(typ)
        sql += " ORDER BY created_at DESC LIMIT 300"
        return [dict(r) for r in DB.execute(sql, args).fetchall()]

    def client_detail(self, user_id):
        user = DB.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            raise LookupError("Client not found.")
        u = enrich_user(user)
        uid = user["id"]
        stats = {
            "events": u["events"],
            "clicks": DB.execute("SELECT COUNT(*) AS c FROM events WHERE user_id = ? AND type = 'click'", (uid,)).fetchone()["c"],
            "pageViews": DB.execute("SELECT COUNT(*) AS c FROM events WHERE user_id = ? AND type = 'page_view'", (uid,)).fetchone()["c"],
            "logins": DB.execute("SELECT COUNT(*) AS c FROM events WHERE user_id = ? AND type = 'login'", (uid,)).fetchone()["c"],
            "logouts": DB.execute("SELECT COUNT(*) AS c FROM events WHERE user_id = ? AND type = 'logout'", (uid,)).fetchone()["c"],
            "actions": DB.execute("SELECT COUNT(*) AS c FROM events WHERE user_id = ? AND type = 'app_action'", (uid,)).fetchone()["c"],
            "failed": DB.execute("SELECT COUNT(*) AS c FROM events WHERE user_id = ? AND type = 'login_failed'", (uid,)).fetchone()["c"],
            "notes": DB.execute("SELECT COUNT(*) AS c FROM crm_notes WHERE user_id = ?", (uid,)).fetchone()["c"],
            "activeDays": DB.execute(
                "SELECT COUNT(DISTINCT substr(created_at,1,10)) AS c FROM events WHERE user_id = ?", (uid,)
            ).fetchone()["c"],
        }
        pages = DB.execute(
            """SELECT path, title, COUNT(*) AS views, MAX(created_at) AS last_at
               FROM events WHERE user_id = ? AND type = 'page_view' GROUP BY path, title
               ORDER BY views DESC LIMIT 12""",
            (uid,),
        ).fetchall()
        clicks = DB.execute(
            """SELECT label, path, COUNT(*) AS n, MAX(created_at) AS last_at
               FROM events WHERE user_id = ? AND type = 'click' AND label IS NOT NULL AND label != ''
               GROUP BY label, path ORDER BY n DESC LIMIT 16""",
            (uid,),
        ).fetchall()
        notes = DB.execute("SELECT * FROM crm_notes WHERE user_id = ? ORDER BY created_at DESC LIMIT 40", (uid,)).fetchall()
        sessions = DB.execute(
            "SELECT id, ip, user_agent, created_at, last_seen_at, ended_at, logout_reason FROM sessions WHERE user_id = ? AND kind = 'user' ORDER BY created_at DESC LIMIT 40",
            (uid,),
        ).fetchall()
        sess_list = []
        total_secs = 0
        for s in sessions:
            item = dict(s)
            item["seconds"] = session_seconds(s)
            item["device"] = parse_ua(s["user_agent"])
            total_secs += item["seconds"]
            sess_list.append(item)
        stats["sessions"] = len(sess_list)
        stats["avgSession"] = int(total_secs / len(sess_list)) if sess_list else 0
        stats["openSessions"] = DB.execute(
            "SELECT COUNT(*) AS c FROM sessions WHERE user_id = ? AND kind = 'user' AND ended_at IS NULL", (uid,)
        ).fetchone()["c"]
        ips = DB.execute(
            """SELECT ip, COUNT(*) AS n, MAX(created_at) AS last_at FROM events
               WHERE user_id = ? AND ip IS NOT NULL AND ip != '' GROUP BY ip ORDER BY n DESC LIMIT 8""",
            (uid,),
        ).fetchall()
        events = self.user_events(uid, {})
        return {
            "user": u,
            "stats": stats,
            "topPages": [dict(r) for r in pages],
            "topClicks": [dict(r) for r in clicks],
            "notes": [dict(r) for r in notes],
            "sessions": sess_list,
            "events": events[:120],
            "heatmap": event_heatmap(" AND user_id = ?", (uid,), 14),
            "series": daily_series(" AND user_id = ?", (uid,), 14),
            "mix": type_mix(" AND user_id = ?", (uid,), 30),
            "ips": [dict(r) for r in ips],
        }

    def patch_client(self, user_id, body, admin, ip, user_agent):
        user = DB.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            raise LookupError("Client not found.")
        allowed = ["name", "email", "phone", "address", "tax_id", "status", "kyc", "notes", "tags"]
        fields = {}
        for key in allowed:
            if key in body:
                val = (body.get(key) or "").strip() if isinstance(body.get(key), str) else body.get(key)
                if key == "email":
                    val = (val or "").lower()
                    if not valid_email(val):
                        raise ValueError("Invalid email.")
                    other = DB.execute("SELECT id FROM users WHERE email = ? AND id != ?", (val, user_id)).fetchone()
                    if other:
                        raise ValueError("This email is already in use.")
                fields[key] = val
        if body.get("password"):
            if len(body["password"]) < 8:
                raise ValueError("New password must be at least 8 characters.")
            salt, pw = hash_password(body["password"])
            fields["password_hash"] = pw
            fields["salt"] = salt
        if not fields:
            return self.send_json(200, {"user": public_user(user)})
        sets = ", ".join(k + " = ?" for k in fields)
        DB.execute("UPDATE users SET " + sets + ", updated_at = ? WHERE id = ?", list(fields.values()) + [now(), user_id])
        safe = {k: v for k, v in fields.items() if k not in ("password_hash", "salt")}
        if "password_hash" in fields:
            safe["passwordReset"] = True
        insert_event(user_id, None, None, "crm_edit", "/crm.html", "CRM", "Stammdaten geändert von " + admin["name"], None, safe, ip, user_agent)
        DB.commit()
        user = DB.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return self.send_json(200, {"user": public_user(user)})


def main():
    os.chdir(ROOT)
    httpd = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print("NN Finanz läuft auf http://127.0.0.1:%s/" % PORT)
    print("CRM:            http://127.0.0.1:%s/crm.html" % PORT)
    print("Staff email:    %s" % ADMIN_EMAIL)
    print("Override with NNFIN_ADMIN_EMAIL / NNFIN_ADMIN_PASSWORD if needed.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer beendet.")


if __name__ == "__main__":
    main()
