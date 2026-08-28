(function () {
  "use strict";

  var session = window.NNAuth && window.NNAuth.getSession();
  if (!session) {
    window.location.replace("login.html");
    return;
  }

  var B = window.NNBanks;
  var STORE = "nnfb_book_" + session.id;
  var TITLES = {
    overview: "Übersicht",
    accounts: "Konten",
    banks: "Banken",
    activity: "Umsätze",
    market: "Marktplatz",
    savings: "Tagesgeld",
    cds: "Festgeld",
    etf: "ETF-Portfolios",
    account: "Profil & Sicherheit",
    acct: "Konto"
  };

  var PARTNERS = [
    { id: "quenzia", name: "Quenzia Direkt", country: "Deutschland", kind: "Bank", shield: "EdB bis 100.000 €" },
    { id: "nordvia", name: "Nordvia Bank", country: "Schweden", kind: "Bank", shield: "Einlagensicherung SE" },
    { id: "hallovar", name: "Hallovar Kreditunion", country: "Österreich", kind: "Kreditgenossenschaft", shield: "Einlagensicherung AT" },
    { id: "tresmo", name: "Tresmo Bank", country: "Niederlande", kind: "Bank", shield: "DGS bis 100.000 €" },
    { id: "kyndal", name: "Kyndal Wealth", country: "Deutschland", kind: "Depotbank", shield: "Sondervermögen / ETF" },
    { id: "lumenix", name: "Lumenix Sparkasse Partner", country: "Italien", kind: "Bank", shield: "FITD bis 100.000 €" },
    { id: "bravura", name: "Bravura Credit Union", country: "Frankreich", kind: "Kreditgenossenschaft", shield: "FGDR bis 100.000 €" }
  ];

  var PRODUCTS = [
    { id: "q-flex", partner: "quenzia", type: "savings", name: "Tagesgeld Flex", rate: 3.8, min: 1, notice: "täglich verfügbar", region: "EU" },
    { id: "n-save", partner: "nordvia", type: "savings", name: "Nordvia Spare", rate: 3.65, min: 1, notice: "täglich verfügbar", region: "EU" },
    { id: "h-cash", partner: "hallovar", type: "savings", name: "Mitglieder-Tagesgeld", rate: 3.55, min: 500, notice: "täglich verfügbar", region: "AT/DE" },
    { id: "t-easy", partner: "tresmo", type: "savings", name: "Easy Savings", rate: 3.4, min: 1, notice: "täglich verfügbar", region: "EU" },
    { id: "q-cd12", partner: "quenzia", type: "cd", name: "Festgeld 12 Monate", rate: 3.15, min: 2500, term: 12, region: "EU" },
    { id: "h-cd24", partner: "hallovar", type: "cd", name: "Festgeld 24 Monate", rate: 3.35, min: 2500, term: 24, region: "AT/DE" },
    { id: "t-cd36", partner: "tresmo", type: "cd", name: "Festgeld 36 Monate", rate: 3.5, min: 5000, term: 36, region: "EU" },
    { id: "l-cd6", partner: "lumenix", type: "cd", name: "Festgeld 6 Monate", rate: 2.95, min: 1000, term: 6, region: "IT/DE" },
    { id: "b-cd12", partner: "bravura", type: "cd", name: "Festgeld 12 Monate", rate: 3.2, min: 2500, term: 12, region: "FR/DE" },
    { id: "k-cons", partner: "kyndal", type: "etf", name: "Konservativ 20/80", ter: 0.18, stocks: 20, bonds: 80, region: "DE/AT/NL", goal: "Kapitalerhalt mit leichtem Wachstum" },
    { id: "k-bal", partner: "kyndal", type: "etf", name: "Ausgewogen 40/60", ter: 0.2, stocks: 40, bonds: 60, region: "DE/AT/NL", goal: "Ruhiger Aufbau ohne Einzeltitel" },
    { id: "k-core", partner: "kyndal", type: "etf", name: "Core World 60/40", ter: 0.16, stocks: 60, bonds: 40, region: "DE/AT", goal: "Breiter Weltmarkt, niedrige Kosten" }
  ];

  function partner(id) { return PARTNERS.find(function (p) { return p.id === id; }); }
  function product(id) { return PRODUCTS.find(function (p) { return p.id === id; }); }
  function typeLabel(t) { return t === "savings" ? "Tagesgeld" : t === "cd" ? "Festgeld" : "ETF"; }
  function pill(t) { return '<span class="pill ' + (t === "savings" ? "save" : t === "cd" ? "cd" : "etf") + '">' + typeLabel(t) + "</span>"; }
  function eur(n) {
    return (Number(n) || 0).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  }
  function pct(n) { return Number(n).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " %"; }
  function initials(name) {
    return (name || "NN").split(" ").filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
  }
  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
    } catch (e) { return iso; }
  }
  function uid(prefix) { return (prefix || "id") + "-" + Date.now() + "-" + Math.floor(Math.random() * 9999); }

  function isDemoUser() {
    return session.id === "demo-test-user";
  }

  function defaultProfile() {
    return {
      address: "",
      taxId: "",
      kyc: "verified",
      twoFa: true,
      notifyEmail: true,
      notifyPush: false
    };
  }

  function demoBook() {
    return {
      v: 2,
      cash: 4220.15,
      defaultAccountId: "acc-hsbc-checking",
      linkedBanks: ["hsbc", "deutsche", "n26", "dkb", "commerzbank"],
      profile: defaultProfile(),
      revealed: {},
      accounts: [
        { id: "acc-hsbc-checking", bankId: "hsbc", type: "checking", name: "HSBC Premier Giro", nickname: "Hauptkonto", iban: B.fakeIban("hsbc", 1), bic: "TUBDDEDDXXX", currency: "EUR", balance: 12450.2, rate: 0, status: "active", openedAt: "2024-06-12T09:00:00.000Z", lastSync: "2026-08-25T08:12:00.000Z" },
        { id: "acc-hsbc-savings", bankId: "hsbc", type: "savings", name: "HSBC Premier Savings", nickname: "HSBC Reserve", iban: B.fakeIban("hsbc", 2), bic: "TUBDDEDDXXX", currency: "EUR", balance: 8200, rate: 2.15, status: "active", openedAt: "2025-01-08T09:00:00.000Z", lastSync: "2026-08-25T08:12:00.000Z" },
        { id: "acc-deutsche-checking", bankId: "deutsche", type: "checking", name: "Deutsche Bank Giro", nickname: "DB Giro", iban: B.fakeIban("deutsche", 1), bic: "DEUTDEFFXXX", currency: "EUR", balance: 3280.4, rate: 0, status: "active", openedAt: "2022-03-01T09:00:00.000Z", lastSync: "2026-08-25T07:40:00.000Z" },
        { id: "acc-n26-checking", bankId: "n26", type: "checking", name: "N26 Standard", nickname: "Alltag", iban: B.fakeIban("n26", 1), bic: "NTSBDEB1XXX", currency: "EUR", balance: 1105.22, rate: 0, status: "active", openedAt: "2023-11-20T09:00:00.000Z", lastSync: "2026-08-25T08:01:00.000Z" },
        { id: "acc-dkb-card", bankId: "dkb", type: "card", name: "DKB Visa Debit", nickname: "Reisekarte", iban: B.fakeIban("dkb", 2), bic: "BYLADEM1001", currency: "EUR", balance: 890.12, rate: 0, status: "active", openedAt: "2021-09-04T09:00:00.000Z", lastSync: "2026-08-24T22:10:00.000Z" },
        { id: "acc-cbk-savings", bankId: "commerzbank", type: "savings", name: "Commerzbank Extra", nickname: "CBK Extra", iban: B.fakeIban("commerzbank", 2), bic: "COBADEFFXXX", currency: "EUR", balance: 6000, rate: 1.9, status: "active", openedAt: "2025-09-15T09:00:00.000Z", lastSync: "2026-08-25T06:55:00.000Z" }
      ],
      holdings: [
        { id: "d1", productId: "q-flex", amount: 18500, openedAt: "2026-02-04T09:00:00.000Z" },
        { id: "d2", productId: "h-cd24", amount: 15200, openedAt: "2026-03-12T09:00:00.000Z" },
        { id: "d3", productId: "k-cons", amount: 11000, openedAt: "2026-04-01T09:00:00.000Z" }
      ],
      transactions: [
        { id: "t1", at: "2026-08-21T08:02:00.000Z", accountId: "acc-hsbc-checking", title: "Gehalt Horizon Media GmbH", amount: 4200, category: "einkommen" },
        { id: "t2", at: "2026-08-19T11:14:00.000Z", accountId: "wallet", title: "Anlage Quenzia Tagesgeld Flex", amount: -2500, category: "anlage" },
        { id: "t3", at: "2026-08-18T18:22:00.000Z", accountId: "acc-n26-checking", title: "REWE Berlin-Mitte", amount: -64.12, category: "einkauf" },
        { id: "t4", at: "2026-08-15T09:00:00.000Z", accountId: "acc-hsbc-savings", title: "Zinsen HSBC Premier Savings", amount: 14.68, category: "zinsen" },
        { id: "t5", at: "2026-08-12T07:30:00.000Z", accountId: "acc-deutsche-checking", title: "Miete Spree Wohnen", amount: -1450, category: "wohnen" },
        { id: "t6", at: "2026-08-10T16:40:00.000Z", accountId: "acc-n26-checking", title: "Trade Republic Sparplan", amount: -200, category: "anlage" },
        { id: "t7", at: "2026-08-08T21:05:00.000Z", accountId: "acc-dkb-card", title: "Lufthansa · FRA-LHR", amount: -289, category: "reise" },
        { id: "t8", at: "2026-08-04T10:12:00.000Z", accountId: "acc-hsbc-checking", title: "Übertrag → NN Finanz", amount: -1500, category: "transfer" },
        { id: "t9", at: "2026-08-04T10:12:30.000Z", accountId: "wallet", title: "Eingang von HSBC Premier Giro", amount: 1500, category: "transfer" },
        { id: "t10", at: "2026-07-30T12:00:00.000Z", accountId: "acc-cbk-savings", title: "Zinsen Commerzbank Extra", amount: 9.5, category: "zinsen" }
      ]
    };
  }

  function normalizeBook(raw) {
    var book = raw && typeof raw === "object" ? raw : {};
    if (!Array.isArray(book.holdings)) book.holdings = [];
    if (typeof book.cash !== "number") book.cash = 0;
    if (!book.profile) book.profile = defaultProfile();
    if (!Array.isArray(book.accounts)) book.accounts = [];
    if (!Array.isArray(book.transactions)) book.transactions = [];
    if (!Array.isArray(book.linkedBanks)) book.linkedBanks = [];
    if (!book.revealed) book.revealed = {};
    book.v = 2;
    return book;
  }

  function emptyBook() {
    return normalizeBook({
      v: 2,
      cash: 0,
      holdings: [],
      accounts: [],
      transactions: [],
      linkedBanks: [],
      profile: {
        address: "",
        taxId: "",
        kyc: "open",
        twoFa: false,
        notifyEmail: true,
        notifyPush: false
      }
    });
  }

  function loadBook() {
    try {
      var raw = localStorage.getItem(STORE);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (isDemoUser() && parsed.v !== 2) {
          var demo = demoBook();
          localStorage.setItem(STORE, JSON.stringify(demo));
          return demo;
        }
        if (!isDemoUser() && parsed.v !== 2) {
          var fresh = emptyBook();
          localStorage.setItem(STORE, JSON.stringify(fresh));
          return fresh;
        }
        return normalizeBook(parsed);
      }
    } catch (e) {}
    if (isDemoUser()) {
      var demo = demoBook();
      localStorage.setItem(STORE, JSON.stringify(demo));
      return demo;
    }
    var empty = emptyBook();
    localStorage.setItem(STORE, JSON.stringify(empty));
    return empty;
  }
  function saveBook() { localStorage.setItem(STORE, JSON.stringify(book)); }
  var book = loadBook();

  function walletAccount() {
    return {
      id: "wallet",
      bankId: "nnfinanz",
      type: "wallet",
      name: "NN Finanz Verrechnung",
      nickname: "Verrechnungskonto",
      iban: B.fakeIban("nnfinanz", 1),
      bic: "NNFBDEBBXXX",
      currency: "EUR",
      balance: book.cash,
      rate: 0,
      status: "active",
      locked: true,
      openedAt: session.createdAt || "2026-01-15T10:00:00.000Z",
      lastSync: new Date().toISOString()
    };
  }
  function accounts() { return [walletAccount()].concat(book.accounts); }
  function findAccount(id) { return accounts().find(function (a) { return a.id === id; }); }
  function bankCash() {
    return book.accounts.reduce(function (s, a) { return s + (Number(a.balance) || 0); }, 0);
  }
  function holdingValue() {
    return book.holdings.reduce(function (s, h) { return s + h.amount; }, 0);
  }
  function total() { return book.cash + bankCash() + holdingValue(); }
  function blendedRate() {
    var w = holdingValue();
    if (!w) return 0;
    return book.holdings.reduce(function (s, h) {
      var p = product(h.productId);
      var r = p && p.rate ? p.rate : (p && p.type === "etf" ? 3.2 : 0);
      return s + (h.amount / w) * r;
    }, 0);
  }
  function linkedBankObjs() {
    return book.linkedBanks.map(B.get).filter(Boolean);
  }
  function maskIban(iban) {
    var clean = (iban || "").replace(/\s/g, "");
    if (clean.length < 8) return "••••";
    return clean.slice(0, 4) + " •••• •••• " + clean.slice(-4);
  }
  function showIban(acc) {
    return book.revealed[acc.id] ? acc.iban : maskIban(acc.iban);
  }
  function addTx(tx) {
    book.transactions.unshift({
      id: uid("tx"),
      at: new Date().toISOString(),
      accountId: tx.accountId,
      title: tx.title,
      amount: tx.amount,
      category: tx.category || "sonstiges"
    });
  }
  function setBalance(accId, next) {
    if (accId === "wallet") {
      book.cash = next;
      return;
    }
    var acc = book.accounts.find(function (a) { return a.id === accId; });
    if (acc) acc.balance = next;
  }
  function catLabel(c) {
    return ({ einkommen: "Einkommen", anlage: "Anlage", einkauf: "Einkauf", zinsen: "Zinsen", wohnen: "Wohnen", reise: "Reise", transfer: "Übertrag", einzahlung: "Einzahlung", sonstiges: "Umsatz" })[c] || "Umsatz";
  }

  var viewEl = document.getElementById("view");
  var titleEl = document.getElementById("pageTitle");
  var current = "overview";
  var extra = null;
  var bankQuery = "";

  document.getElementById("userName").textContent = session.name;
  document.getElementById("userAvatar").textContent = initials(session.name);

  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2400);
  }

  function closeModal() {
    var m = document.querySelector(".modal-bg");
    if (m) m.remove();
  }

  function openModal(html, onReady, wide) {
    closeModal();
    var wrap = document.createElement("div");
    wrap.className = "modal-bg";
    wrap.innerHTML = '<div class="modal' + (wide ? " wide" : "") + '">' + html + "</div>";
    wrap.addEventListener("click", function (e) { if (e.target === wrap) closeModal(); });
    document.body.appendChild(wrap);
    if (onReady) onReady(wrap.querySelector(".modal"));
  }

  function contactAdvisor(title, body) {
    openModal(
      "<h3>" + title + "</h3>" +
      "<p>" + body + "</p>" +
      "<p>NN-Finanzberatung GmbH<br>+4915215729944</p>" +
      '<div class="actions"><button class="btn btn-dark" id="advOk">Schließen</button></div>',
      function (modal) {
        modal.querySelector("#advOk").onclick = closeModal;
      }
    );
  }

  function depositFlow() {
    if (!isDemoUser()) {
      contactAdvisor("Einzahlen", "Um Guthaben einzuzahlen, wenden Sie sich bitte an Ihren Kundenberater.");
      return;
    }
    var opts = accounts().map(function (a) {
      return '<option value="' + a.id + '">' + a.nickname + " · " + eur(a.balance) + "</option>";
    }).join("");
    openModal(
      "<h3>Einzahlen</h3><p>Simuliertes Guthaben — wählen Sie das Zielkonto.</p>" +
      '<div class="field"><label for="depTo">Konto</label><select id="depTo">' + opts + "</select></div>" +
      '<div class="field"><label for="depAmt">Betrag in €</label><input id="depAmt" type="number" min="100" step="100" value="2500"></div>' +
      '<div class="actions"><button class="btn btn-dark" id="depGo">Guthaben hinzufügen</button><button class="btn btn-outline" id="depNo">Abbrechen</button></div>',
      function (modal) {
        modal.querySelector("#depNo").onclick = closeModal;
        modal.querySelector("#depGo").onclick = function () {
          var n = Number(modal.querySelector("#depAmt").value);
          var to = modal.querySelector("#depTo").value;
          if (!n || n < 100) return toast("Mindestbetrag 100 €");
          var acc = findAccount(to);
          setBalance(to, acc.balance + n);
          addTx({ accountId: to, title: "Einzahlung (simuliert)", amount: n, category: "einzahlung" });
          saveBook();
          closeModal();
          toast("Eingezahlt: " + eur(n));
          if (window.NNTrack) window.NNTrack.action("Einzahlung " + eur(n));
          render(current, extra);
        };
      }
    );
  }

  function transferFlow(presetFrom) {
    var opts = accounts().map(function (a) {
      return '<option value="' + a.id + '">' + (B.get(a.bankId) || {}).name + " · " + a.nickname + "</option>";
    }).join("");
    openModal(
      "<h3>Überweisen</h3><p>Zwischen Ihren verbundenen Konten — in der Demo sofort gebucht.</p>" +
      '<div class="field"><label for="trFrom">Von</label><select id="trFrom">' + opts + "</select></div>" +
      '<div class="field"><label for="trTo">Nach</label><select id="trTo">' + opts + "</select></div>" +
      '<div class="field"><label for="trAmt">Betrag in €</label><input id="trAmt" type="number" min="1" step="10" value="250"></div>' +
      '<div class="field"><label for="trNote">Verwendungszweck</label><input id="trNote" value="Übertrag eigenes Konto"></div>' +
      '<div class="actions"><button class="btn btn-dark" id="trGo">Jetzt überweisen</button><button class="btn btn-outline" id="trNo">Abbrechen</button></div>',
      function (modal) {
        if (presetFrom) modal.querySelector("#trFrom").value = presetFrom;
        var toSel = modal.querySelector("#trTo");
        if (presetFrom && toSel.options.length > 1) {
          toSel.value = presetFrom === "wallet" ? (book.accounts[0] && book.accounts[0].id) || "wallet" : "wallet";
        }
        modal.querySelector("#trNo").onclick = closeModal;
        modal.querySelector("#trGo").onclick = function () {
          var from = modal.querySelector("#trFrom").value;
          var to = modal.querySelector("#trTo").value;
          var n = Number(modal.querySelector("#trAmt").value);
          var note = modal.querySelector("#trNote").value || "Übertrag";
          if (from === to) return toast("Bitte zwei verschiedene Konten wählen.");
          if (!n || n <= 0) return toast("Bitte einen Betrag eingeben.");
          var src = findAccount(from);
          var dst = findAccount(to);
          if (n > src.balance) return toast("Nicht genug Guthaben auf dem Ausgangskonto.");
          setBalance(from, src.balance - n);
          setBalance(to, dst.balance + n);
          addTx({ accountId: from, title: note + " → " + dst.nickname, amount: -n, category: "transfer" });
          addTx({ accountId: to, title: note + " ← " + src.nickname, amount: n, category: "transfer" });
          saveBook();
          closeModal();
          toast("Überwiesen: " + eur(n));
          if (window.NNTrack) window.NNTrack.action("Überweisung " + eur(n));
          render(current, extra);
        };
      }
    );
  }

  function bankAdvisor(bankId) {
    var chosen = B.get(bankId);
    var name = chosen && chosen.name ? chosen.name : "diese Bank";
    if (window.NNTrack) window.NNTrack.action("Kundenberater: Bank " + name);
    contactAdvisor("Bank verbinden", "Um " + name + " zu verbinden, wenden Sie sich bitte an Ihren Kundenberater.");
  }

  function connectBankFlow(preselect) {
    if (window.NNTrack) window.NNTrack.action("Bank verbinden geöffnet");
    if (!isDemoUser() && preselect) {
      bankAdvisor(preselect);
      return;
    }
    var step = preselect ? 2 : 1;
    var picked = preselect || null;
    var q = "";

    function paint(modal) {
      if (step === 1) {
        var list = B.connectable.filter(function (b) {
          return book.linkedBanks.indexOf(b.id) < 0 &&
            (!q || (b.name + " " + b.country + " " + b.kind).toLowerCase().indexOf(q.toLowerCase()) >= 0);
        });
        var intro = isDemoUser()
          ? "Simuliertes Open Banking — keine echte Anmeldung bei der Bank."
          : "Wählen Sie Ihre Bank. Die Verbindung richtet Ihr Kundenberater ein.";
        modal.innerHTML = "<h3>Bank verbinden</h3><p>" + intro + "</p>" +
          '<div class="field"><input id="bkSearch" placeholder="Bank suchen — HSBC, Deutsche Bank, N26…" value="' + q + '"></div>' +
          '<div class="connect-grid">' + list.map(function (b) {
            return '<button class="bank-tile" type="button" data-pick="' + b.id + '">' + B.logo(b.id, 40) + "<b>" + b.name + "</b><i>" + b.country + "</i></button>";
          }).join("") + (list.length ? "" : '<p class="empty-inline">Keine Treffer oder bereits verbunden.</p>') + "</div>" +
          '<div class="actions"><button class="btn btn-outline" id="bkNo">Abbrechen</button></div>';
        modal.querySelector("#bkNo").onclick = closeModal;
        var search = modal.querySelector("#bkSearch");
        search.focus();
        search.oninput = function () { q = search.value; paint(modal); };
        modal.querySelectorAll("[data-pick]").forEach(function (btn) {
          btn.onclick = function () {
            picked = btn.getAttribute("data-pick");
            if (!isDemoUser()) {
              closeModal();
              bankAdvisor(picked);
              return;
            }
            step = 2;
            paint(modal);
          };
        });
        return;
      }

      var bank = B.get(picked);
      if (step === 2) {
        modal.innerHTML = "<h3>" + B.logo(bank.id, 36) + " Anmeldung bei " + bank.name + "</h3>" +
          "<p>Demo-Zugang. Beliebige PIN reicht — es wird kein echtes Bank-Login ausgeführt.</p>" +
          '<div class="field"><label>Online-Banking Nutzer</label><input id="bkUser" value="' + session.email + '"></div>' +
          '<div class="field"><label>PIN / Passwort</label><div class="pw-wrap"><input id="bkPin" type="password" value=""><button type="button" class="pw-toggle" aria-label="Passwort anzeigen" aria-pressed="false"><svg class="pw-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg><svg class="pw-eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.7 10.7A3 3 0 0 0 13.3 13.3"/><path d="M9.9 5.1A11 11 0 0 1 12 5c6.4 0 10 7 10 7a18.5 18.5 0 0 1-2.2 3.2"/><path d="M6.1 6.1C3.8 7.9 2 12 2 12s3.6 7 10 7a10.8 10.8 0 0 0 4.4-.9"/></svg></button></div></div>' +
          '<div class="actions"><button class="btn btn-dark" id="bkNext">Konten laden</button><button class="btn btn-outline" id="bkBack">Zurück</button></div>';
        modal.querySelector("#bkBack").onclick = function () { step = 1; paint(modal); };
        if (window.NNAuth && window.NNAuth.bindPasswordToggles) window.NNAuth.bindPasswordToggles(modal);
        modal.querySelector("#bkNext").onclick = function () {
          var pin = modal.querySelector("#bkPin").value;
          if (!pin || pin.length < 4) return toast("PIN muss mindestens 4 Zeichen haben.");
          step = 3;
          paint(modal);
        };
        return;
      }

      var templates = bank.templates || [];
      modal.innerHTML = "<h3>Konten importieren</h3><p>" + bank.name + " hat " + templates.length + " Konto" + (templates.length === 1 ? "" : "nten") + " gefunden.</p>" +
        templates.map(function (t, i) {
          return '<label class="check-row"><input type="checkbox" data-type="' + t.type + '" checked>' +
            B.logo(bank.id, 28) + '<span><b>' + t.name + "</b><i>" + B.typeLabel(t.type) + (t.rate ? " · " + pct(t.rate) + " p.a." : "") + "</i></span></label>";
        }).join("") +
        '<div class="actions"><button class="btn btn-dark" id="bkGo">Verbinden</button><button class="btn btn-outline" id="bkBack">Zurück</button></div>';
      modal.querySelector("#bkBack").onclick = function () { step = 2; paint(modal); };
      modal.querySelector("#bkGo").onclick = function () {
        if (!isDemoUser()) {
          closeModal();
          bankAdvisor(bank.id);
          return;
        }
        var types = Array.prototype.slice.call(modal.querySelectorAll("input[data-type]:checked")).map(function (el) { return el.getAttribute("data-type"); });
        if (!types.length) return toast("Bitte mindestens ein Konto wählen.");
        var created = B.makeAccounts(bank.id, types);
        book.accounts = book.accounts.concat(created);
        if (book.linkedBanks.indexOf(bank.id) < 0) book.linkedBanks.push(bank.id);
        created.forEach(function (a) {
          addTx({ accountId: a.id, title: "Konto verbunden · " + bank.name, amount: 0, category: "sonstiges" });
        });
        saveBook();
        closeModal();
        toast(bank.name + " verbunden");
        if (window.NNTrack) window.NNTrack.action("Bank verbunden: " + bank.name);
        render("banks");
      };
    }

    openModal("", paint, true);
  }

  function unlinkBank(bankId) {
    var bank = B.get(bankId);
    openModal(
      "<h3>" + bank.name + " trennen</h3><p>Alle importierten Konten dieser Bank werden aus der Plattform entfernt. Umsätze bleiben in der Historie.</p>" +
      '<div class="actions"><button class="btn btn-danger" id="ulGo">Bank trennen</button><button class="btn btn-outline" id="ulNo">Abbrechen</button></div>',
      function (modal) {
        modal.querySelector("#ulNo").onclick = closeModal;
        modal.querySelector("#ulGo").onclick = function () {
          book.accounts = book.accounts.filter(function (a) { return a.bankId !== bankId; });
          book.linkedBanks = book.linkedBanks.filter(function (id) { return id !== bankId; });
          if (book.defaultAccountId && !findAccount(book.defaultAccountId)) book.defaultAccountId = "wallet";
          saveBook();
          closeModal();
          toast(bank.name + " getrennt");
          render("banks");
        };
      }
    );
  }

  function openProduct(prodId) {
    var p = product(prodId);
    var par = partner(p.partner);
    var rateLine = p.rate ? pct(p.rate) + " p.a." : "TER " + pct(p.ter);
    openModal(
      "<h3>" + p.name + "</h3><p>" + B.logo(par.id, 28) + " " + par.name + " · " + rateLine + "<br>Verfügbar auf Verrechnung: " + eur(book.cash) + "</p>" +
      '<div class="field"><label for="openAmt">Betrag in €</label><input id="openAmt" type="number" min="' + p.min + '" step="100" value="' + Math.min(Math.max(p.min, 2500), Math.floor(book.cash) || p.min) + '"></div>' +
      '<div class="actions"><button class="btn btn-dark" id="openGo">Eröffnen</button><button class="btn btn-outline" id="openNo">Abbrechen</button></div>',
      function (modal) {
        modal.querySelector("#openNo").onclick = closeModal;
        modal.querySelector("#openGo").onclick = function () {
          var n = Number(modal.querySelector("#openAmt").value);
          if (!n || n < p.min) return toast("Mindestanlage " + eur(p.min));
          if (n > book.cash) return toast("Nicht genug Verrechnungsguthaben. Bitte einzahlen oder überweisen.");
          book.cash -= n;
          book.holdings.push({ id: uid("h"), productId: p.id, amount: n, openedAt: new Date().toISOString() });
          addTx({ accountId: "wallet", title: "Anlage " + p.name, amount: -n, category: "anlage" });
          saveBook();
          closeModal();
          toast("Eröffnet bei " + par.name);
          render(current, extra);
        };
      }
    );
  }

  function productCard(p) {
    var par = partner(p.partner);
    var big = p.rate ? pct(p.rate) : pct(p.ter) + " TER";
    var meta = p.type === "etf"
      ? p.stocks + " % Aktien · " + p.bonds + " % Anleihen · " + p.region
      : (p.notice || (p.term + " Monate Laufzeit")) + " · ab " + eur(p.min);
    return '<article class="card prod">' +
      '<div class="prod-top">' + B.logo(par.id, 36) + pill(p.type) + "</div>" +
      "<h3>" + p.name + "</h3>" +
      '<div class="who">' + par.name + " · " + par.country + "</div>" +
      '<div class="big">' + big + "</div>" +
      '<p class="meta">' + meta + "</p>" +
      '<button class="btn btn-dark btn-sm" data-open="' + p.id + '">Anlegen</button>' +
      "</article>";
  }

  function productTable(list) {
    return '<div class="card table-wrap"><table class="list"><thead><tr><th>Produkt</th><th>Partner</th><th>Art</th><th>Zins / Kosten</th><th></th></tr></thead><tbody>' +
      list.map(function (p) {
        var par = partner(p.partner);
        var rate = p.rate ? pct(p.rate) + " p.a." : "TER " + pct(p.ter);
        return "<tr><td><b>" + p.name + "</b></td><td class='bank-cell'>" + B.logo(par.id, 24) + par.name + "</td><td>" + pill(p.type) + "</td><td class='rate'>" + rate + "</td><td><button class='btn btn-outline btn-sm' data-open='" + p.id + "'>Anlegen</button></td></tr>";
      }).join("") +
      "</tbody></table></div>";
  }

  function holdingsBlock() {
    if (!book.holdings.length) {
      return '<div class="card empty"><b>Noch keine Anlagen</b>Zahlen Sie ein und eröffnen Sie Tagesgeld, Festgeld oder ein ETF-Portfolio — alles über eine Plattform.</div>';
    }
    return '<div class="card table-wrap"><table class="list"><thead><tr><th>Anlage</th><th>Partner</th><th>Betrag</th><th>Ertrag p.a.*</th></tr></thead><tbody>' +
      book.holdings.map(function (h) {
        var p = product(h.productId);
        var par = partner(p.partner);
        var r = p.rate || 3.2;
        return "<tr><td><b>" + p.name + "</b> " + pill(p.type) + "</td><td class='bank-cell'>" + B.logo(par.id, 24) + par.name + "</td><td class='amt'>" + eur(h.amount) + "</td><td class='rate'>" + eur(h.amount * r / 100) + "</td></tr>";
      }).join("") +
      "</tbody></table></div>";
  }

  function allocationBars() {
    var by = { savings: 0, cd: 0, etf: 0, cash: book.cash + bankCash() };
    book.holdings.forEach(function (h) {
      var p = product(h.productId);
      by[p.type] += h.amount;
    });
    var t = total() || 1;
    var rows = [
      ["Liquidität", by.cash, "var(--cyan)"],
      ["Tagesgeld", by.savings, "var(--blue)"],
      ["Festgeld", by.cd, "var(--indigo)"],
      ["ETF", by.etf, "var(--pink)"]
    ];
    return '<div class="bars">' + rows.map(function (r) {
      var pctW = Math.round((r[1] / t) * 100);
      return '<div class="bar-row"><span>' + r[0] + '</span><div class="bar"><i style="width:' + pctW + "%;background:" + r[2] + '"></i></div><b>' + pctW + " %</b></div>";
    }).join("") + "</div>";
  }

  function bankStrip() {
    var banks = [{ id: "nnfinanz" }].concat(linkedBankObjs());
    return '<div class="bank-strip">' + banks.map(function (b) {
      return '<button class="bank-chip" type="button" data-go="banks" title="' + (B.get(b.id).name) + '">' + B.logo(b.id, 32) + "<span>" + B.get(b.id).name + "</span></button>";
    }).join("") +
      '<button class="bank-chip add" type="button" data-connect>+</button></div>';
  }

  function accountCard(a, compact) {
    var bank = B.get(a.bankId);
    var def = book.defaultAccountId === a.id ? '<span class="pill save">Standard</span>' : "";
    return '<article class="card acct-card" data-acct="' + a.id + '">' +
      '<div class="acct-head">' + B.logo(a.bankId, 40) +
      '<div><b>' + (a.nickname || a.name) + "</b><i>" + bank.name + " · " + B.typeLabel(a.type) + "</i></div>" + def + "</div>" +
      '<div class="acct-bal">' + eur(a.balance) + "</div>" +
      '<div class="acct-iban">' + showIban(a) + (a.rate ? " · " + pct(a.rate) + " p.a." : "") + "</div>" +
      (compact ? "" : '<div class="acct-actions"><button class="btn btn-outline btn-sm" data-acct="' + a.id + '">Öffnen</button></div>') +
      "</article>";
  }

  function txRows(list, limit) {
    var rows = (list || []).slice(0, limit || 50);
    if (!rows.length) return '<div class="card empty"><b>Keine Umsätze</b>Einzahlungen, Überweisungen und Anlagen erscheinen hier.</div>';
    return '<div class="card tx-list">' + rows.map(function (t) {
      var acc = findAccount(t.accountId) || { nickname: "Konto", bankId: "nnfinanz" };
      var pos = t.amount > 0;
      var zero = t.amount === 0;
      return '<div class="tx-row">' + B.logo(acc.bankId, 32) +
        '<div class="tx-main"><b>' + t.title + "</b><i>" + fmtDate(t.at) + " · " + (acc.nickname || acc.name) + " · " + catLabel(t.category) + "</i></div>" +
        '<b class="tx-amt ' + (zero ? "" : pos ? "pos" : "neg") + '">' + (zero ? "—" : (pos ? "+" : "") + eur(t.amount)) + "</b></div>";
    }).join("") + "</div>";
  }

  function viewOverview() {
    var topSave = PRODUCTS.filter(function (p) { return p.type === "savings"; }).sort(function (a, b) { return b.rate - a.rate; })[0];
    var topCd = PRODUCTS.filter(function (p) { return p.type === "cd"; }).sort(function (a, b) { return b.rate - a.rate; })[0];
    return bankStrip() +
      '<div class="hero-row">' +
      '<div class="card balance"><div class="lbl">Nettovermögen</div><div class="amt">' + eur(total()) + "</div>" +
      '<p class="note">Banken ' + eur(bankCash()) + " · Verrechnung " + eur(book.cash) + " · Anlagen " + eur(holdingValue()) + (holdingValue() ? ' · Ø-Zins <b>' + pct(blendedRate()) + " p.a.</b>" : "") + "</p>" +
      '<div class="actions"><button class="btn btn-dark" id="doDeposit">Einzahlen</button><button class="btn btn-outline" id="doTransfer">Überweisen</button><button class="btn btn-outline" data-go="market">Marktplatz</button></div></div>' +
      '<div class="card"><div class="lbl" style="font-size:12px;color:var(--mut);font-weight:500;margin-bottom:10px">Allokation</div>' +
      allocationBars() +
      "</div></div>" +
      '<div class="stats">' +
      '<div class="card stat"><div class="lbl">Verbundene Banken</div><div class="val">' + book.linkedBanks.length + '</div><div class="delta">' + book.accounts.length + " Konten aktiv</div></div>" +
      '<div class="card stat"><div class="lbl">Bestes Tagesgeld</div><div class="val">' + pct(topSave.rate) + '</div><div class="delta">' + partner(topSave.partner).name + "</div></div>" +
      '<div class="card stat"><div class="lbl">KYC</div><div class="val">' + (isDemoUser() || (book.profile && book.profile.kyc === "verified") ? "OK" : "Offen") + '</div><div class="delta">' + (isDemoUser() || (book.profile && book.profile.kyc === "verified") ? "Identität verifiziert" : "Noch nicht abgeschlossen") + "</div></div>" +
      "</div>" +
      '<div class="section-h"><div><h2>Ihre Konten</h2><p>Hausbanken und Neobanken in einer Übersicht.</p></div><button class="btn btn-outline btn-sm" data-go="accounts">Alle Konten</button></div>' +
      '<div class="acct-grid">' + accounts().slice(0, 4).map(function (a) { return accountCard(a, true); }).join("") + "</div>" +
      '<div class="section-h"><div><h2>Letzte Umsätze</h2><p>Über alle verbundenen Institute.</p></div><button class="btn btn-outline btn-sm" data-go="activity">Alle Umsätze</button></div>' +
      txRows(book.transactions, 6) +
      '<div class="section-h"><div><h2>Marktplatz-Anlagen</h2><p>Tagesgeld, Festgeld und ETF über Partner.</p></div></div>' +
      holdingsBlock() +
      '<p class="disclaimer">Demo-Plattform: Bankverbindungen, Kontostände und Umsätze sind simuliert. Keine echte Open-Banking-Anbindung, keine Anlageberatung. Einlagen bei Banken i. d. R. bis 100.000 € je Institut und Kunde gesetzlich gesichert.</p>';
  }

  function viewAccounts() {
    return '<div class="section-h"><div><h2>Alle Konten</h2><p>' + accounts().length + " Konten bei " + (book.linkedBanks.length + 1) + " Instituten.</p></div>" +
      '<div class="actions" style="margin:0"><button class="btn btn-dark btn-sm" id="doDeposit">Einzahlen</button><button class="btn btn-outline btn-sm" id="doTransfer">Überweisen</button><button class="btn btn-outline btn-sm" data-connect>Bank verbinden</button></div></div>' +
      '<div class="acct-grid">' + accounts().map(function (a) { return accountCard(a, false); }).join("") + "</div>";
  }

  function viewAcct(id) {
    var a = findAccount(id);
    if (!a) return '<div class="card empty"><b>Konto nicht gefunden</b></div>';
    var bank = B.get(a.bankId);
    var txs = book.transactions.filter(function (t) { return t.accountId === a.id; });
    return '<button class="back-link" data-go="accounts">← Alle Konten</button>' +
      '<div class="hero-row">' +
      '<div class="card balance">' +
      '<div class="acct-head">' + B.logo(a.bankId, 48) + "<div><div class='lbl'>" + bank.name + "</div><div class='amt' style='font-size:28px'>" + (a.nickname || a.name) + "</div></div></div>" +
      '<p class="note" style="margin-top:16px">Saldo <b style="color:var(--ink);font-size:22px">' + eur(a.balance) + "</b>" + (a.rate ? " · " + pct(a.rate) + " p.a." : "") + "</p>" +
      '<div class="iban-box"><span>' + showIban(a) + '</span><button class="btn btn-outline btn-sm" data-reveal="' + a.id + '">' + (book.revealed[a.id] ? "Verbergen" : "Anzeigen") + '</button><button class="btn btn-outline btn-sm" data-copy="' + a.id + '">IBAN kopieren</button></div>' +
      '<div class="actions"><button class="btn btn-dark" data-transfer="' + a.id + '">Überweisen</button>' +
      (a.locked ? "" : '<button class="btn btn-outline" data-default="' + a.id + '">Als Standard</button><button class="btn btn-outline" data-rename="' + a.id + '">Umbenennen</button>') +
      "</div></div>" +
      '<div class="card"><div class="lbl" style="font-size:12px;color:var(--mut);font-weight:500;margin-bottom:8px">Details</div>' +
      '<table class="list"><tbody>' +
      "<tr><td>Institut</td><td class='amt'>" + bank.name + "</td></tr>" +
      "<tr><td>Produkt</td><td class='amt'>" + a.name + "</td></tr>" +
      "<tr><td>Art</td><td class='amt'>" + B.typeLabel(a.type) + "</td></tr>" +
      "<tr><td>BIC</td><td class='amt'>" + a.bic + "</td></tr>" +
      "<tr><td>Währung</td><td class='amt'>" + a.currency + "</td></tr>" +
      "<tr><td>Status</td><td class='amt'><span class='status-dot'></span>Aktiv</td></tr>" +
      "<tr><td>Eröffnet</td><td class='amt'>" + fmtDate(a.openedAt) + "</td></tr>" +
      "<tr><td>Letzter Sync</td><td class='amt'>" + fmtDate(a.lastSync) + "</td></tr>" +
      "<tr><td>Sicherung</td><td class='amt'>" + bank.shield + "</td></tr>" +
      "</tbody></table></div></div>" +
      '<div class="section-h"><div><h2>Umsätze</h2><p>Nur dieses Konto.</p></div></div>' +
      txRows(txs, 40);
  }

  function viewBanks() {
    var q = bankQuery;
    var linked = linkedBankObjs();
    var available = B.connectable.filter(function (b) {
      return book.linkedBanks.indexOf(b.id) < 0 &&
        (!q || (b.name + " " + b.country + " " + b.kind).toLowerCase().indexOf(q.toLowerCase()) >= 0);
    });
    return '<div class="section-h"><div><h2>Verbundene Banken</h2><p>Konten verwalten, synchronisieren oder trennen.</p></div><button class="btn btn-dark btn-sm" data-connect>Bank verbinden</button></div>' +
      (linked.length ? '<div class="bank-manage">' + linked.map(function (b) {
        var accs = book.accounts.filter(function (a) { return a.bankId === b.id; });
        var sum = accs.reduce(function (s, a) { return s + a.balance; }, 0);
        return '<article class="card bank-row">' + B.logo(b.id, 48) +
          '<div class="bank-copy"><b>' + b.name + "</b><i>" + b.kind + " · " + b.country + " · " + b.shield + "</i>" +
          '<div class="mini-accs">' + accs.map(function (a) { return '<button class="mini-acc" data-acct="' + a.id + '">' + a.nickname + " · " + eur(a.balance) + "</button>"; }).join("") + "</div></div>" +
          '<div class="bank-side"><div class="amt">' + eur(sum) + "</div>" +
          '<div class="acct-actions"><button class="btn btn-outline btn-sm" data-sync="' + b.id + '">Sync</button><button class="btn btn-outline btn-sm" data-unlink="' + b.id + '">Trennen</button></div></div></article>';
      }).join("") + "</div>" : '<div class="card empty"><b>Noch keine Bank verbunden</b>Verbinden Sie HSBC, Deutsche Bank, N26 und weitere Institute.</div>') +
      '<div class="section-h"><div><h2>Institute hinzufügen</h2><p>' +
      (isDemoUser()
        ? "HSBC, Deutsche Bank, Sparkasse, Neobanken — Demo-Logos und simulierte Konten."
        : "Wählen Sie Ihre Bank. Die Verbindung richtet Ihr Kundenberater ein.") +
      "</p></div></div>" +
      '<div class="field search-field"><input id="bankFilter" placeholder="Bank suchen…" value="' + q + '"></div>' +
      '<div class="connect-grid page">' + available.map(function (b) {
        return '<button class="bank-tile" type="button" data-pick="' + b.id + '">' + B.logo(b.id, 44) + "<b>" + b.name + "</b><i>" + b.kind + " · " + b.country + "</i></button>";
      }).join("") + "</div>";
  }

  function viewActivity() {
    return '<div class="section-h"><div><h2>Umsätze</h2><p>Alle Bewegungen über verbundene Banken und die Plattform.</p></div></div>' +
      '<div class="filters" style="margin-bottom:16px"><button class="chip on" data-tx="all">Alle</button>' +
      accounts().map(function (a) { return '<button class="chip" data-tx="' + a.id + '">' + a.nickname + "</button>"; }).join("") +
      "</div>" +
      '<div id="txWrap">' + txRows(book.transactions, 80) + "</div>";
  }

  function viewAccount() {
    var p = book.profile;
    return '<div class="hero-row">' +
      '<div class="card"><div class="lbl">Profil</div>' +
      '<div class="profile-head">' + '<div class="avatar lg">' + initials(session.name) + "</div><div><b>" + session.name + "</b><i>" + session.email + '</i><span class="kyc">Identität verifiziert</span></div></div>' +
      '<div class="field"><label>Adresse</label><input id="pfAddr" value="' + (p.address || "") + '"></div>' +
      '<div class="field"><label>Steuer-ID</label><input id="pfTax" value="' + (p.taxId || "") + '"></div>' +
      '<div class="field"><label>Telefon</label><input id="pfPhone" value="' + (session.phone || "") + '"></div>' +
      '<div class="actions"><button class="btn btn-dark" id="pfSave">Speichern</button></div></div>' +
      '<div class="card"><div class="lbl">Sicherheit &amp; Banken</div>' +
      '<table class="list" style="margin-top:8px"><tbody>' +
      "<tr><td>KYC-Status</td><td class='amt'>Verifiziert</td></tr>" +
      "<tr><td>Zwei-Faktor</td><td class='amt'>" + (p.twoFa ? "Aktiv" : "Aus") + "</td></tr>" +
      "<tr><td>Verbundene Banken</td><td class='amt'>" + book.linkedBanks.length + "</td></tr>" +
      "<tr><td>Konten</td><td class='amt'>" + accounts().length + "</td></tr>" +
      "<tr><td>Nettovermögen</td><td class='amt'>" + eur(total()) + "</td></tr>" +
      "</tbody></table>" +
      '<label class="check-row tight"><input type="checkbox" id="pf2fa" ' + (p.twoFa ? "checked" : "") + ">Zwei-Faktor-Authentifizierung (Demo)</label>" +
      '<label class="check-row tight"><input type="checkbox" id="pfMail" ' + (p.notifyEmail ? "checked" : "") + ">E-Mail bei Überweisungen</label>" +
      '<div class="actions" style="margin-top:14px"><button class="btn btn-outline" data-go="banks">Banken verwalten</button><button class="btn btn-outline" data-auth="logout">Abmelden</button></div></div></div>' +
      '<p class="disclaimer">Angaben nur lokal in diesem Browser. NN-Finanzberatung GmbH ist der Demo-Betreiber — keine echte Kontoführung bei HSBC oder anderen Instituten.</p>';
  }

  function renameAccount(id) {
    var a = findAccount(id);
    if (!a || a.locked) return;
    openModal(
      "<h3>Konto umbenennen</h3>" +
      '<div class="field"><label>Anzeigename</label><input id="rnName" value="' + a.nickname + '"></div>' +
      '<div class="actions"><button class="btn btn-dark" id="rnGo">Speichern</button><button class="btn btn-outline" id="rnNo">Abbrechen</button></div>',
      function (modal) {
        modal.querySelector("#rnNo").onclick = closeModal;
        modal.querySelector("#rnGo").onclick = function () {
          var name = modal.querySelector("#rnName").value.trim();
          if (!name) return toast("Bitte einen Namen eingeben.");
          var real = book.accounts.find(function (x) { return x.id === id; });
          if (real) real.nickname = name;
          saveBook();
          closeModal();
          render("acct", id);
        };
      }
    );
  }

  function bindView() {
    var dep = document.getElementById("doDeposit");
    if (dep) dep.onclick = depositFlow;
    var tr = document.getElementById("doTransfer");
    if (tr) tr.onclick = function () { transferFlow(); };
    var pf = document.getElementById("pfSave");
    if (pf) pf.onclick = function () {
      book.profile.address = document.getElementById("pfAddr").value;
      book.profile.taxId = document.getElementById("pfTax").value;
      book.profile.twoFa = document.getElementById("pf2fa").checked;
      book.profile.notifyEmail = document.getElementById("pfMail").checked;
      saveBook();
      if (window.NNAuth && window.NNAuth.updateProfile) {
        window.NNAuth.updateProfile({
          phone: document.getElementById("pfPhone").value,
          address: book.profile.address,
          taxId: book.profile.taxId
        }).then(function () {
          session.phone = document.getElementById("pfPhone").value;
          toast("Profil gespeichert");
        }).catch(function (err) { toast(err.message || "Profil lokal gespeichert"); });
      } else {
        toast("Profil gespeichert");
      }
      if (window.NNTrack) window.NNTrack.action("Profil gespeichert");
    };
    var filter = document.getElementById("bankFilter");
    if (filter) {
      filter.oninput = function () {
        bankQuery = filter.value;
        render("banks");
        var el = document.getElementById("bankFilter");
        if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
      };
    }
    viewEl.querySelectorAll("[data-open]").forEach(function (btn) {
      btn.onclick = function () { openProduct(btn.getAttribute("data-open")); };
    });
    viewEl.querySelectorAll("[data-go]").forEach(function (btn) {
      btn.onclick = function () { render(btn.getAttribute("data-go")); };
    });
    viewEl.querySelectorAll("[data-filter]").forEach(function (btn) {
      btn.onclick = function () {
        var f = btn.getAttribute("data-filter");
        render("market", f === "cds" ? "cd" : f);
      };
    });
    viewEl.querySelectorAll("[data-connect]").forEach(function (btn) {
      btn.onclick = function () { connectBankFlow(); };
    });
    viewEl.querySelectorAll("[data-pick]").forEach(function (btn) {
      btn.onclick = function () { connectBankFlow(btn.getAttribute("data-pick")); };
    });
    viewEl.querySelectorAll("[data-unlink]").forEach(function (btn) {
      btn.onclick = function (e) { e.stopPropagation(); unlinkBank(btn.getAttribute("data-unlink")); };
    });
    viewEl.querySelectorAll("[data-sync]").forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        var id = btn.getAttribute("data-sync");
        book.accounts.forEach(function (a) { if (a.bankId === id) a.lastSync = new Date().toISOString(); });
        saveBook();
        toast((B.get(id) || {}).name + " synchronisiert");
        render("banks");
      };
    });
    viewEl.querySelectorAll("[data-acct]").forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        render("acct", btn.getAttribute("data-acct"));
      };
    });
    viewEl.querySelectorAll("[data-reveal]").forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute("data-reveal");
        book.revealed[id] = !book.revealed[id];
        saveBook();
        render("acct", id);
      };
    });
    viewEl.querySelectorAll("[data-copy]").forEach(function (btn) {
      btn.onclick = function () {
        var acc = findAccount(btn.getAttribute("data-copy"));
        if (!acc) return;
        if (navigator.clipboard) navigator.clipboard.writeText(acc.iban.replace(/\s/g, ""));
        toast("IBAN kopiert");
      };
    });
    viewEl.querySelectorAll("[data-default]").forEach(function (btn) {
      btn.onclick = function () {
        book.defaultAccountId = btn.getAttribute("data-default");
        saveBook();
        toast("Standardkonto gesetzt");
        render("acct", book.defaultAccountId);
      };
    });
    viewEl.querySelectorAll("[data-rename]").forEach(function (btn) {
      btn.onclick = function () { renameAccount(btn.getAttribute("data-rename")); };
    });
    viewEl.querySelectorAll("[data-transfer]").forEach(function (btn) {
      btn.onclick = function () { transferFlow(btn.getAttribute("data-transfer")); };
    });
    viewEl.querySelectorAll("[data-tx]").forEach(function (btn) {
      btn.onclick = function () {
        viewEl.querySelectorAll("[data-tx]").forEach(function (c) { c.classList.remove("on"); });
        btn.classList.add("on");
        var id = btn.getAttribute("data-tx");
        var list = id === "all" ? book.transactions : book.transactions.filter(function (t) { return t.accountId === id; });
        document.getElementById("txWrap").innerHTML = txRows(list, 80);
      };
    });
    viewEl.querySelectorAll("[data-auth='logout']").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        window.NNAuth.logout();
        window.location.href = "index.html";
      });
    });
  }

  function render(name, arg) {
    current = name;
    extra = arg || null;
    titleEl.textContent = name === "acct" && extra && findAccount(extra)
      ? (findAccount(extra).nickname || "Konto")
      : (TITLES[name] || "Übersicht");
    document.querySelectorAll(".nav-item").forEach(function (btn) {
      if (!btn.getAttribute("data-view")) return;
      var v = btn.getAttribute("data-view");
      btn.classList.toggle("on", v === name || (name === "acct" && v === "accounts"));
    });
    if (name === "overview") viewEl.innerHTML = viewOverview();
    else if (name === "accounts") viewEl.innerHTML = viewAccounts();
    else if (name === "acct") viewEl.innerHTML = viewAcct(extra);
    else if (name === "banks") viewEl.innerHTML = viewBanks();
    else if (name === "activity") viewEl.innerHTML = viewActivity();
    else if (name === "market") viewEl.innerHTML = viewMarket(extra || "all");
    else if (name === "savings") viewEl.innerHTML = '<div class="section-h"><div><h2>Hochverzinstes Tagesgeld</h2><p>Täglich verfügbar, Zinsen vergleichen, eine Plattform.</p></div></div>' + productTable(PRODUCTS.filter(function (p) { return p.type === "savings"; }));
    else if (name === "cds") viewEl.innerHTML = '<div class="section-h"><div><h2>Festgeld / CDs</h2><p>Laufzeiten von 6 bis 36 Monaten bei Partnerbanken und Kreditunions.</p></div></div>' + productTable(PRODUCTS.filter(function (p) { return p.type === "cd"; }));
    else if (name === "etf") viewEl.innerHTML = '<div class="section-h"><div><h2>Einfache ETF-Portfolios</h2><p>Nur in ausgewählten Regionen. Günstig, breit gestreut, ohne Einzeltitel-Recherche.</p></div></div><div class="grid3">' + PRODUCTS.filter(function (p) { return p.type === "etf"; }).map(productCard).join("") + "</div>";
    else if (name === "account") viewEl.innerHTML = viewAccount();
    bindView();
    if (window.NNTrack && window.NNTrack.view) window.NNTrack.view(TITLES[name] || name);
  }

  function viewMarket(filter) {
    var list = PRODUCTS.filter(function (p) { return !filter || filter === "all" || p.type === filter; });
    return '<div class="filters">' +
      '<button class="chip' + (!filter || filter === "all" ? " on" : "") + '" data-filter="all">Alle</button>' +
      '<button class="chip' + (filter === "savings" ? " on" : "") + '" data-filter="savings">Tagesgeld</button>' +
      '<button class="chip' + (filter === "cd" ? " on" : "") + '" data-filter="cds">Festgeld</button>' +
      '<button class="chip' + (filter === "etf" ? " on" : "") + '" data-filter="etf">ETF</button>' +
      "</div>" +
      '<div class="grid3">' + list.map(productCard).join("") + "</div>" +
      '<p class="disclaimer">Vergleichen und eröffnen Sie, ohne bei jeder Bank einzeln ein Konto zu beantragen. ETF-Portfolios sind nicht in allen Regionen verfügbar.</p>';
  }

  document.querySelectorAll(".nav-item[data-view]").forEach(function (btn) {
    btn.addEventListener("click", function () { render(btn.getAttribute("data-view")); });
  });
  var qt = document.getElementById("quickTransfer");
  if (qt) qt.onclick = function () { transferFlow(); };

  render("overview");
})();
