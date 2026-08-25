# NN-Finanzberatung

Local demo site for **NN-Finanzberatung GmbH** (Berlin): public pages in German and a client marketplace after login.

This is a prototype. Products, partner banks, and Open-Banking links are simulated. Do not treat it as a live brokerage or production system.

## Run

Python 3.10+ is enough. There are no pip packages.

```bash
python3 server.py
```

Then open [http://127.0.0.1:4471/](http://127.0.0.1:4471/).

Do not use `python3 -m http.server` — signup, login, and tracking need `server.py`.

Demo client login is `test@test.com` / `test123`. Override with `NNFIN_DEMO_EMAIL` and `NNFIN_DEMO_PASSWORD` if needed.

SQLite is created at `data/nnfin.db` on first run. That file is gitignored.

## What’s in the repo

| Path | Role |
| --- | --- |
| `index.html` | Public site (German) |
| `login.html` / `signup.html` | Client auth |
| `app.html` | Logged-in marketplace |
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

If you turn on **GitHub Pages** (Settings → Pages → Deploy from branch `main`), the public site can show at `https://YOUR_USER.github.io/REPO/nnfin/`. Login works there with the demo account `test` / `test123`. Signup also works in the browser. Full tracking still needs `python3 server.py` locally.
