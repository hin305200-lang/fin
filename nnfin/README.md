# NN-Finanzberatung

Local demo site for **NN-Finanzberatung GmbH** (Berlin): public pages in German, a client marketplace after login, and an English staff CRM.

This is a prototype. Products, partner banks, and Open-Banking links are simulated. Do not treat it as a live brokerage or production system.

## Run

Python 3.10+ is enough. There are no pip packages.

```bash
python3 server.py
```

Then open:

- Website: [http://127.0.0.1:4471/](http://127.0.0.1:4471/)
- CRM: [http://127.0.0.1:4471/crm.html](http://127.0.0.1:4471/crm.html)

Do not use `python3 -m http.server` — signup, login, tracking, and the CRM need `server.py`.

Staff login can be overridden with `NNFIN_ADMIN_EMAIL` and `NNFIN_ADMIN_PASSWORD`. Copy `.env.example` if you want a local file, or export the variables in your shell. Defaults in `server.py` are for local demo only; change them before any shared or public deploy.

SQLite is created at `data/nnfin.db` on first run. That file is gitignored.

## What’s in the repo

| Path | Role |
| --- | --- |
| `index.html` | Public site (German) |
| `login.html` / `signup.html` | Client auth |
| `app.html` | Logged-in marketplace |
| `crm.html` | Staff CRM (English) |
| `server.py` | HTTP + SQLite API |
| `assets/` | Avatars and animation libraries |

## GitHub

Do **not** drag the `nnfin` folder onto github.com. That folder contains `.git`, and GitHub’s upload page often goes white and never finishes.

**Option A — git (best)**

Create an empty repo on GitHub (no README), then:

```bash
cd /Users/thomas/Downloads/nnfin
git remote add origin https://github.com/YOUR_USER/nnfin.git
git push -u origin main
```

**Option B — website upload**

```bash
chmod +x scripts/pack-for-github.sh
./scripts/pack-for-github.sh
```

Then on GitHub: **Add file → Upload files**, and drop the folder `nnfin-github-upload` (next to `nnfin`, in Downloads).

If you turn on **GitHub Pages** (Settings → Pages → Deploy from branch `main`), the public site can show. Login, signup, and the CRM still need `python3 server.py` locally — GitHub Pages is static files only.
