(function () {
  "use strict";

  var TOKEN_KEY = "nnfb_crm_token";
  var current = "home";
  var selectedId = null;
  var detailTab = "timeline";
  var statusFilter = "";
  var kycFilter = "";
  var typeFilter = "";
  var refreshTimer = null;
  var clockTimer = null;

  function token() { return localStorage.getItem(TOKEN_KEY); }
  function setToken(t) { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); }

  function api(path, opts) {
    opts = opts || {};
    var headers = { "Content-Type": "application/json" };
    if (token()) headers.Authorization = "Bearer " + token();
    return fetch(path, {
      method: opts.method || "GET",
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (res.status === 401) {
          setToken(null);
          showGate();
          throw new Error("Please sign in again.");
        }
        if (!res.ok) throw new Error((data && data.error) || "Something went wrong.");
        return data;
      });
    }).catch(function (err) {
      if (err && err.message && err.message !== "Failed to fetch") throw err;
      throw new Error("Server is not reachable. Start it with python3 server.py.");
    });
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function fmt(ts) {
    if (!ts) return "—";
    try {
      return new Date(ts).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch (e) { return ts; }
  }
  function fmtDur(sec) {
    sec = Number(sec) || 0;
    if (sec < 60) return sec + "s";
    if (sec < 3600) return Math.round(sec / 60) + "m";
    return (sec / 3600).toFixed(1) + "h";
  }
  var STATUS = { neu: "New", aktiv: "Active", beratung: "Advice", inaktiv: "Inactive" };
  var KYC = { offen: "Open", verifiziert: "Verified", abgelehnt: "Rejected" };
  function pill(status) {
    var s = status || "neu";
    return '<span class="pill ' + esc(s) + '">' + esc(STATUS[s] || KYC[s] || s) + "</span>";
  }
  function online(u) {
    return '<span class="dot' + (u.online ? " on" : "") + '"></span>' + (u.online ? "Live" : "Idle");
  }
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2200);
  }
  function eventLabel(e) {
    var map = { page_view: "Page", click: "Click", login: "Login", logout: "Logout", signup: "Sign-up", heartbeat: "Pulse", hidden: "Hidden", visible: "Visible", profile_update: "Profile", app_action: "Action", crm_edit: "CRM edit", crm_note: "Note", login_failed: "Failed login" };
    return map[e.type] || e.type;
  }
  function deviceLine(d) {
    if (!d) return "—";
    return (d.os || "—") + " · " + (d.browser || "—") + " · " + (d.device || "—");
  }
  function scoreRing(n) {
    n = Number(n) || 0;
    return '<div class="score" style="--p:' + n + '"><span>' + n + "</span></div>";
  }
  function bars(series) {
    var max = 1;
    (series || []).forEach(function (s) { if (s.n > max) max = s.n; });
    return '<div class="bars">' + (series || []).map(function (s) {
      var h = Math.max(6, Math.round((s.n / max) * 100));
      return '<i title="' + esc(s.day) + " · " + s.n + '" style="height:' + h + '%"></i>';
    }).join("") + "</div>";
  }
  function heatHtml(grid) {
    var days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    var max = 1;
    (grid || []).forEach(function (row) { (row || []).forEach(function (n) { if (n > max) max = n; }); });
    var html = "";
    days.forEach(function (d, i) {
      html += "<b>" + d + "</b>";
      (grid[i] || []).forEach(function (n) {
        var a = n ? (0.22 + 0.78 * (n / max)).toFixed(2) : "0.1";
        html += '<i style="--a:' + a + '" title="' + n + '"></i>';
      });
    });
    var hours = "<b></b>";
    for (var h = 0; h < 24; h += 1) hours += "<span>" + (h % 3 === 0 ? h : "") + "</span>";
    return '<div class="heat">' + html + '</div><div class="hours">' + hours + "</div>";
  }
  function funnelHtml(f) {
    f = f || {};
    var rows = [
      ["Sign-ups", f.signups || 0],
      ["Logins", f.logins || 0],
      ["Marketplace", f.marketplace || 0],
      ["Actions", f.actions || 0],
      ["Banking", f.banks || 0]
    ];
    var max = Math.max.apply(null, rows.map(function (r) { return r[1]; }).concat([1]));
    return '<div class="funnel">' + rows.map(function (r) {
      var w = Math.round((r[1] / max) * 100);
      return '<div class="funnel-row"><span>' + esc(r[0]) + '</span><div class="track"><span style="width:' + w + '%"></span></div><b>' + r[1] + "</b></div>";
    }).join("") + "</div>";
  }
  function mixHtml(mix) {
    mix = mix || [];
    var max = 1;
    mix.forEach(function (m) { if (m.n > max) max = m.n; });
    if (!mix.length) return '<p class="muted">No telemetry yet.</p>';
    return '<div class="mix">' + mix.map(function (m) {
      var w = Math.round((m.n / max) * 100);
      return '<div class="mix-row"><span>' + esc(eventLabel({ type: m.type })) + '</span><div class="track"><span style="width:' + w + '%"></span></div><b>' + m.n + "</b></div>";
    }).join("") + "</div>";
  }

  var gate = document.getElementById("gate");
  var app = document.getElementById("app");
  var viewEl = document.getElementById("view");
  var titleEl = document.getElementById("title");

  function showGate() {
    app.classList.remove("open");
    app.style.display = "none";
    gate.classList.add("open");
    gate.style.display = "flex";
    document.getElementById("signal").textContent = "STANDBY";
  }
  function showApp() {
    gate.classList.remove("open");
    gate.style.display = "none";
    app.classList.add("open");
    app.style.display = "flex";
    document.getElementById("signal").textContent = "LINK LIVE";
  }

  document.getElementById("admForm").addEventListener("submit", function (e) {
    e.preventDefault();
    e.stopPropagation();
    var err = document.getElementById("gateErr");
    var btn = document.getElementById("admGo");
    err.hidden = true;
    btn.disabled = true;
    btn.textContent = "Linking…";
    api("/api/admin/login", {
      method: "POST",
      body: {
        email: document.getElementById("admEmail").value.trim(),
        password: document.getElementById("admPass").value
      }
    }).then(function (res) {
      setToken(res.token);
      localStorage.setItem("nnfb_crm_who", res.admin.name + " · " + res.admin.email);
      document.getElementById("admEmail").value = "";
      document.getElementById("admPass").value = "";
      enter();
    }).catch(function (err2) {
      err.hidden = false;
      err.textContent = err2.message || "Could not sign in.";
    }).then(function () {
      btn.disabled = false;
      btn.textContent = "Enter lattice";
    });
    return false;
  });

  document.getElementById("admOut").onclick = function () {
    api("/api/admin/logout", { method: "POST" }).catch(function () {});
    setToken(null);
    document.getElementById("admEmail").value = "";
    document.getElementById("admPass").value = "";
    if (refreshTimer) clearInterval(refreshTimer);
    showGate();
  };
  document.querySelectorAll(".nav").forEach(function (btn) {
    btn.onclick = function () {
      selectedId = null;
      render(btn.getAttribute("data-view"));
    };
  });
  document.getElementById("globalQ").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      selectedId = null;
      render("clients", this.value);
    }
  });

  function tickClock() {
    var el = document.getElementById("clock");
    if (el) el.textContent = new Date().toISOString().slice(11, 19) + "Z";
  }

  function enter() {
    document.getElementById("admWho").textContent = localStorage.getItem("nnfb_crm_who") || "Staff";
    showApp();
    if (!clockTimer) clockTimer = setInterval(tickClock, 1000);
    tickClock();
    render("home");
  }

  function arm(fn, ms) {
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(fn, ms || 8000);
  }

  function render(name, extra) {
    current = name;
    if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
    document.querySelectorAll(".nav").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-view") === (name === "client" ? "clients" : name));
    });
    var titles = { home: "Lattice", clients: "Nodes", live: "Presence", feed: "Stream", intel: "Intel", client: "Dossier" };
    var kickers = { home: "Command surface", clients: "Client registry", live: "Active sessions", feed: "Event stream", intel: "Pattern deck", client: "Identity file" };
    titleEl.textContent = titles[name] || "CRM";
    document.getElementById("kicker").textContent = kickers[name] || "Command surface";
    if (name === "home") loadHome();
    else if (name === "clients") loadClients(extra || document.getElementById("globalQ").value);
    else if (name === "live") loadLive();
    else if (name === "feed") loadFeed();
    else if (name === "intel") loadIntel();
    else if (name === "client") loadClient(selectedId);
  }

  function kpi(label, val, hint) {
    return '<div class="kpi"><i>' + esc(label) + "</i><b>" + esc(val) + "</b>" + (hint ? "<em>" + esc(hint) + "</em>" : "") + "</div>";
  }

  function feedRow(e) {
    return '<div class="feed-item"><span class="muted">' + fmt(e.created_at) + '</span><div><b>' +
      esc(e.user_name || e.user_email || "Visitor") + '</b><span class="tag">' + esc(eventLabel(e)) + "</span>" +
      esc(e.label || e.path || "") + "</div></div>";
  }

  function clientsTable(list, rich) {
    if (!list || !list.length) return '<p class="muted">No clients yet.</p>';
    return '<table class="table"><thead><tr><th>Node</th><th>Contact</th><th>State</th><th>Last signal</th>' +
      (rich ? "<th>Score</th><th>Device</th>" : "<th></th>") + "</tr></thead><tbody>" +
      list.map(function (u) {
        return '<tr class="row" data-id="' + esc(u.id) + '"><td><b>' + esc(u.name) + "</b><div class='muted'>" + online(u) +
          "</div></td><td>" + esc(u.email) + "<div class='muted'>" + esc(u.phone || "—") + "</div></td><td>" + pill(u.status) + " " +
          pill(u.kyc) + "</td><td>" + fmt(u.last_seen_at || u.last_login_at) +
          (u.lastEvent ? '<div class="muted">' + esc(eventLabel(u.lastEvent)) + " · " + esc(u.lastEvent.label || u.lastEvent.path || "") + "</div>" : "") +
          "</td>" + (rich
            ? "<td><b>" + esc(u.score || 0) + "</b><div class='muted'>" + esc(u.events || 0) + " events</div></td><td class='muted'>" + esc(deviceLine(u.device)) + "</td>"
            : "<td class='muted'>" + esc(u.login_count || 0) + " logins</td>") + "</tr>";
      }).join("") + "</tbody></table>";
  }
  function bindRows() {
    viewEl.querySelectorAll("[data-id]").forEach(function (row) {
      row.onclick = function () {
        selectedId = row.getAttribute("data-id");
        render("client");
      };
    });
  }

  function loadHome() {
    api("/api/admin/overview").then(function (d) {
      viewEl.innerHTML =
        '<div class="kpis">' +
        kpi("Nodes", d.users, (d.verified || 0) + " verified") +
        kpi("Presence", d.online, "last 90s") +
        kpi("Logins", d.loginsToday, "today") +
        kpi("Sign-ups", d.signupsToday, "today") +
        kpi("Clicks", d.clicksToday, "today") +
        kpi("Failed", d.failedToday, "auth rejects") + "</div>" +
        '<div class="grid3"><div class="card"><div class="card-head"><h2>14-day telemetry</h2><span class="mono">' + esc(d.eventsToday) + " today</span></div>" +
        bars(d.series) + '</div><div class="card"><h2>Conversion lattice</h2>' + funnelHtml(d.funnel) +
        '</div><div class="card"><h2>Signal mix</h2>' + mixHtml(d.mix) + "</div></div>" +
        '<div class="grid2"><div class="card"><div class="card-head"><h2>Activity heatmap</h2><span class="mono">UTC · 14d</span></div>' +
        heatHtml(d.heatmap) + '</div><div class="card"><h2>Live stream</h2><div class="feed">' +
        (d.feed || []).map(feedRow).join("") + "</div></div></div>" +
        '<div class="card"><h2>Priority nodes</h2>' + clientsTable(d.priority, true) + "</div>";
      bindRows();
      arm(function () { if (current === "home") loadHome(); }, 10000);
    }).catch(showErr);
  }

  function loadClients(q) {
    var qs = "?q=" + encodeURIComponent(q || "");
    if (statusFilter) qs += "&status=" + encodeURIComponent(statusFilter);
    if (kycFilter) qs += "&kyc=" + encodeURIComponent(kycFilter);
    api("/api/admin/clients" + qs).then(function (d) {
      viewEl.innerHTML =
        '<div class="filters">' +
        ["", "neu", "aktiv", "beratung", "inaktiv"].map(function (s) {
          return '<button class="chip' + (statusFilter === s ? " on" : "") + '" data-st="' + s + '">' + (STATUS[s] || "All states") + "</button>";
        }).join("") +
        ["", "offen", "verifiziert", "abgelehnt"].map(function (s) {
          return '<button class="chip' + (kycFilter === s ? " on" : "") + '" data-kyc="' + s + '">' + (KYC[s] || "All KYC") + "</button>";
        }).join("") + "</div>" +
        '<div class="card">' + clientsTable(d.clients, true) + "</div>";
      viewEl.querySelectorAll("[data-st]").forEach(function (b) {
        b.onclick = function () { statusFilter = b.getAttribute("data-st"); loadClients(q); };
      });
      viewEl.querySelectorAll("[data-kyc]").forEach(function (b) {
        b.onclick = function () { kycFilter = b.getAttribute("data-kyc"); loadClients(q); };
      });
      bindRows();
    }).catch(showErr);
  }

  function loadLive() {
    api("/api/admin/live").then(function (d) {
      var nodes = d.live || [];
      var radar = '<div class="radar">' + nodes.map(function (u, i) {
        var ang = (i / Math.max(nodes.length, 1)) * Math.PI * 2 + 0.4;
        var r = 28 + (i % 4) * 12;
        var x = 50 + Math.cos(ang) * r;
        var y = 50 + Math.sin(ang) * r;
        return '<div class="blip" data-id="' + esc(u.id) + '" style="left:' + x + "%;top:" + y + '%"><span>' + esc(u.name) + "</span></div>";
      }).join("") + "</div>";
      viewEl.innerHTML =
        '<div class="kpis">' + kpi("Live nodes", nodes.length, "heartbeat < 90s") +
        kpi("Open sessions", nodes.reduce(function (n, u) { return n + (u.openSession ? 1 : 0); }, 0), "unterminated") +
        kpi("Avg score", nodes.length ? Math.round(nodes.reduce(function (n, u) { return n + (u.score || 0); }, 0) / nodes.length) : 0, "engagement") + "</div>" +
        '<div class="grid2"><div class="card"><h2>Presence field</h2>' + (nodes.length ? radar : '<p class="muted">Nobody is in the lattice right now.</p>') +
        '</div><div class="card"><h2>Active dossiers</h2>' +
        (nodes.length ? nodes.map(function (u) {
          return '<div class="feed-item row" data-id="' + esc(u.id) + '" style="cursor:pointer"><span class="muted">' + fmt(u.last_seen_at) +
            "</span><div><b>" + esc(u.name) + "</b>" + esc(deviceLine(u.device)) +
            (u.lastEvent ? '<div class="muted">' + esc(eventLabel(u.lastEvent)) + " · " + esc(u.lastEvent.label || u.lastEvent.path || "") + "</div>" : "") +
            '<div class="mono">' + esc(u.last_ip || "—") + "</div></div></div>";
        }).join("") : '<p class="muted">Waiting for a client heartbeat.</p>') + "</div></div>";
      bindRows();
      viewEl.querySelectorAll(".blip").forEach(function (b) {
        b.onclick = function () { selectedId = b.getAttribute("data-id"); render("client"); };
      });
      arm(function () { if (current === "live") loadLive(); }, 6000);
    }).catch(showErr);
  }

  function loadFeed() {
    var qs = "?limit=160";
    if (typeFilter) qs += "&type=" + encodeURIComponent(typeFilter);
    api("/api/admin/activity" + qs).then(function (d) {
      var types = ["", "page_view", "click", "login", "logout", "signup", "app_action", "login_failed", "heartbeat"];
      viewEl.innerHTML =
        '<div class="filters">' + types.map(function (t) {
          return '<button class="chip' + (typeFilter === t ? " on" : "") + '" data-ty="' + t + '">' + (t ? eventLabel({ type: t }) : "All signals") + "</button>";
        }).join("") + '</div><div class="card"><h2>Event stream</h2><div class="feed scroll">' +
        (d.events || []).map(feedRow).join("") + "</div></div>";
      viewEl.querySelectorAll("[data-ty]").forEach(function (b) {
        b.onclick = function () { typeFilter = b.getAttribute("data-ty"); loadFeed(); };
      });
      arm(function () { if (current === "feed") loadFeed(); }, 8000);
    }).catch(showErr);
  }

  function loadIntel() {
    api("/api/admin/intel").then(function (d) {
      viewEl.innerHTML =
        '<div class="grid2"><div class="card"><div class="card-head"><h2>Chronos heatmap</h2><span class="mono">14-day UTC</span></div>' +
        heatHtml(d.heatmap) + '</div><div class="card"><h2>Funnel</h2>' + funnelHtml(d.funnel) + bars(d.series) + "</div></div>" +
        '<div class="grid3"><div class="card"><h2>Signal mix</h2>' + mixHtml(d.mix) +
        '</div><div class="card"><h2>Surfaces</h2>' + topPages(d.topPages) +
        '</div><div class="card"><h2>Devices</h2>' + (d.devices || []).map(function (x) {
          return '<div class="mix-row"><span>' + esc(x.label) + "</span><div></div><b>" + x.n + "</b></div>";
        }).join("") + "</div></div>" +
        '<div class="grid2"><div class="card"><h2>Auth rejects</h2><div class="feed">' +
        ((d.failed || []).length ? d.failed.map(feedRow).join("") : '<p class="muted">No failed logins stored.</p>') +
        '</div></div><div class="card"><h2>Origin IPs</h2><table class="table"><thead><tr><th>IP</th><th>Nodes</th><th>Last</th></tr></thead><tbody>' +
        (d.ips || []).map(function (r) {
          return "<tr><td class='mono'>" + esc(r.ip) + "</td><td>" + r.n + "</td><td>" + fmt(r.last_at) + "</td></tr>";
        }).join("") + "</tbody></table></div></div>" +
        '<div class="card"><h2>Hot clicks</h2>' + topClicks(d.topClicks) + "</div>";
      arm(function () { if (current === "intel") loadIntel(); }, 12000);
    }).catch(showErr);
  }

  function topPages(list) {
    if (!list || !list.length) return '<p class="muted">No pages yet.</p>';
    return '<table class="table"><thead><tr><th>Surface</th><th>Views</th></tr></thead><tbody>' +
      list.map(function (p) {
        return "<tr><td><b>" + esc(p.title || p.path) + "</b><div class='muted'>" + esc(p.path) + "</div></td><td>" + p.views + "</td></tr>";
      }).join("") + "</tbody></table>";
  }
  function topClicks(list) {
    if (!list || !list.length) return '<p class="muted">No clicks yet.</p>';
    return '<table class="table"><thead><tr><th>Element</th><th>Page</th><th>Count</th><th>Last</th></tr></thead><tbody>' +
      list.map(function (c) {
        return "<tr><td><b>" + esc(c.label) + "</b></td><td>" + esc(c.path) + "</td><td>" + c.n + "</td><td>" + fmt(c.last_at) + "</td></tr>";
      }).join("") + "</tbody></table>";
  }

  function loadClient(id) {
    if (!id) return render("clients");
    api("/api/admin/clients/" + encodeURIComponent(id)).then(function (d) {
      var u = d.user;
      var st = d.stats || {};
      titleEl.textContent = u.name;
      viewEl.innerHTML =
        '<button class="back" id="goClients">← All nodes</button>' +
        '<div class="hero">' + scoreRing(u.score) +
        "<div><h3>" + esc(u.name) + "</h3><p class='muted'>" + esc(u.email) + " · " + esc(u.phone || "no phone") +
        "</p><p class='mono' style='margin-top:8px'>" + online(u) + " · " + esc(deviceLine(u.device)) +
        " · " + esc(u.last_ip || "no IP") + "</p></div>" +
        "<div>" + pill(u.status) + " " + pill(u.kyc) +
        '<div class="muted" style="margin-top:8px">Source ' + esc(u.source || "—") + "<br>Tags " + esc(u.tags || "—") + "</div></div></div>" +
        '<div class="statrow">' +
        [["Events", st.events], ["Clicks", st.clicks], ["Pages", st.pageViews], ["Logins", st.logins],
          ["Actions", st.actions], ["Days", st.activeDays], ["Avg session", fmtDur(st.avgSession)], ["Open", st.openSessions]
        ].map(function (x) {
          return "<div><i>" + x[0] + "</i><b>" + esc(x[1]) + "</b></div>";
        }).join("") + "</div>" +
        '<div class="dossier"><div class="card"><h2>Identity</h2>' +
        field("name", "Name", u.name) + field("email", "Email", u.email) + field("phone", "Phone", u.phone) +
        field("address", "Address", u.address) + field("tax_id", "Tax ID", u.tax_id) +
        '<div class="field"><label>Status</label><select id="f_status">' +
        ["neu", "aktiv", "beratung", "inaktiv"].map(function (s) {
          return '<option value="' + s + '"' + (u.status === s ? " selected" : "") + ">" + STATUS[s] + "</option>";
        }).join("") + "</select></div>" +
        '<div class="field"><label>KYC</label><select id="f_kyc">' +
        ["offen", "verifiziert", "abgelehnt"].map(function (s) {
          return '<option value="' + s + '"' + (u.kyc === s ? " selected" : "") + ">" + KYC[s] + "</option>";
        }).join("") + "</select></div>" +
        field("tags", "Tags", u.tags) +
        '<div class="field"><label>Internal notes</label><textarea id="f_notes">' + esc(u.notes) + "</textarea></div>" +
        '<div class="field"><label>Set new password (optional)</label><input id="f_password" type="password" placeholder="leave blank to keep current"></div>' +
        '<p class="muted">Created ' + fmt(u.created_at) + " · Last login " + fmt(u.last_login_at) + " · Logout " + fmt(u.last_logout_at) +
        "<br>Updated " + fmt(u.updated_at) + "<br>" + esc(u.last_user_agent || "") + "</p>" +
        '<div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-dark" id="saveClient">Commit identity</button></div></div>' +
        '<div><div class="tabs">' +
        [["timeline", "Timeline"], ["signals", "Signals"], ["clicks", "Clicks"], ["pages", "Pages"], ["sessions", "Sessions"], ["notes", "Notes"]].map(function (t) {
          return '<button class="' + (detailTab === t[0] ? "on" : "") + '" data-tab="' + t[0] + '">' + t[1] + "</button>";
        }).join("") + '</div><div class="card" id="detailPane"></div></div></div>';
      paintDetail(d);
      document.getElementById("goClients").onclick = function () { selectedId = null; render("clients"); };
      viewEl.querySelectorAll("[data-tab]").forEach(function (b) {
        b.onclick = function () {
          detailTab = b.getAttribute("data-tab");
          paintDetail(d);
          viewEl.querySelectorAll("[data-tab]").forEach(function (x) { x.classList.toggle("on", x === b); });
        };
      });
      document.getElementById("saveClient").onclick = function () { saveClient(id); };
    }).catch(showErr);
  }

  function field(id, label, val) {
    return '<div class="field"><label>' + label + '</label><input id="f_' + id + '" value="' + esc(val || "") + '"></div>';
  }

  function paintDetail(d) {
    var pane = document.getElementById("detailPane");
    if (!pane) return;
    if (detailTab === "timeline") {
      pane.innerHTML = "<h2>What this node did</h2><div class='feed'>" + (d.events || []).map(function (e) {
        return '<div class="feed-item"><span class="muted">' + fmt(e.created_at) + '</span><div><b>' + esc(eventLabel(e)) +
          "</b>" + esc(e.label || "") + (e.path ? '<div class="muted">' + esc(e.path) + (e.href ? " → " + esc(e.href) : "") + "</div>" : "") + "</div></div>";
      }).join("") + "</div>";
    } else if (detailTab === "signals") {
      pane.innerHTML = "<h2>Personal lattice</h2>" + heatHtml(d.heatmap) + '<div style="margin:16px 0">' + bars(d.series) + "</div>" +
        mixHtml(d.mix) + "<h2 style='margin-top:18px'>Origin IPs</h2><table class='table'><thead><tr><th>IP</th><th>Hits</th><th>Last</th></tr></thead><tbody>" +
        (d.ips || []).map(function (r) {
          return "<tr><td class='mono'>" + esc(r.ip) + "</td><td>" + r.n + "</td><td>" + fmt(r.last_at) + "</td></tr>";
        }).join("") + "</tbody></table>";
    } else if (detailTab === "clicks") {
      pane.innerHTML = "<h2>Top clicks</h2>" + topClicks(d.topClicks);
    } else if (detailTab === "pages") {
      pane.innerHTML = "<h2>Pages visited</h2>" + topPages(d.topPages);
    } else if (detailTab === "sessions") {
      pane.innerHTML = "<h2>Sessions</h2><table class='table'><thead><tr><th>Start</th><th>Span</th><th>IP</th><th>Device</th></tr></thead><tbody>" +
        (d.sessions || []).map(function (s) {
          return "<tr><td>" + fmt(s.created_at) + "</td><td>" + (s.ended_at ? fmtDur(s.seconds) + " · " + esc(s.logout_reason || "closed") : "<b>open</b> · " + fmtDur(s.seconds)) +
            "</td><td class='mono'>" + esc(s.ip || "") + "</td><td class='muted'>" + esc(deviceLine(s.device)) + "</td></tr>";
        }).join("") + "</tbody></table>";
    } else {
      pane.innerHTML = "<h2>Advisor notes</h2>" +
        '<div class="field"><textarea id="noteBody" placeholder="Add a note about this client…"></textarea></div>' +
        '<button class="btn btn-dark" id="addNote">Save note</button>' +
        '<div class="feed" style="margin-top:16px">' + (d.notes || []).map(function (n) {
          return '<div class="feed-item"><span class="muted">' + fmt(n.created_at) + "</span><div><b>" + esc(n.author) + "</b>" + esc(n.body) + "</div></div>";
        }).join("") + "</div>";
      var add = document.getElementById("addNote");
      if (add) add.onclick = function () {
        var body = document.getElementById("noteBody").value;
        api("/api/admin/clients/" + encodeURIComponent(d.user.id) + "/notes", { method: "POST", body: { body: body } }).then(function () {
          toast("Note saved");
          loadClient(d.user.id);
        }).catch(function (e) { toast(e.message); });
      };
    }
  }

  function saveClient(id) {
    var body = {
      name: val("f_name"),
      email: val("f_email"),
      phone: val("f_phone"),
      address: val("f_address"),
      tax_id: val("f_tax_id"),
      status: val("f_status"),
      kyc: val("f_kyc"),
      tags: val("f_tags"),
      notes: val("f_notes")
    };
    var pw = val("f_password");
    if (pw) body.password = pw;
    api("/api/admin/clients/" + encodeURIComponent(id), { method: "PATCH", body: body }).then(function () {
      toast("Identity committed");
      loadClient(id);
    }).catch(function (e) { toast(e.message); });
  }
  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value : "";
  }
  function showErr(e) {
    viewEl.innerHTML = '<div class="card"><p class="err" style="display:block">' + esc(e.message) + "</p></div>";
  }

  window.NNCRM = { enter: enter };

  document.getElementById("admEmail").value = "";
  document.getElementById("admPass").value = "";
  if (token()) {
    api("/api/admin/overview").then(function () {
      enter();
    }).catch(function () {
      setToken(null);
      showGate();
    });
  } else {
    showGate();
  }
})();
