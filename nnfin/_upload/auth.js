(function () {
  "use strict";

  var SESSION_KEY = "nnfb_session";
  var TOKEN_KEY = "nnfb_token";
  var VISITOR_KEY = "nnfb_vid";

  function visitorId() {
    var id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = (crypto.randomUUID && crypto.randomUUID()) || ("v-" + Date.now() + "-" + Math.random().toString(16).slice(2));
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setSession(session, token) {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (session === null) localStorage.removeItem(TOKEN_KEY);
  }

  function toSession(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      taxId: user.tax_id || user.taxId || "",
      status: user.status || "",
      kyc: user.kyc || "",
      createdAt: user.created_at || user.createdAt
    };
  }

  function api(path, opts) {
    opts = opts || {};
    var headers = { "Content-Type": "application/json" };
    var token = getToken();
    if (token) headers.Authorization = "Bearer " + token;
    return fetch(path, {
      method: opts.method || "GET",
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) {
          var err = new Error((data && data.error) || "Anfrage fehlgeschlagen.");
          err.status = res.status;
          throw err;
        }
        return data;
      });
    }).catch(function (err) {
      if (err.status) throw err;
      throw new Error("Server nicht erreichbar. Bitte den NN Finanz Server starten (python3 server.py).");
    });
  }

  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function signup(data) {
    var name = (data.name || "").trim();
    var email = (data.email || "").trim().toLowerCase();
    var phone = (data.phone || "").trim();
    var password = data.password || "";
    var confirm = data.confirm || "";
    if (!name) return Promise.reject(new Error("Bitte geben Sie Ihren Namen ein."));
    if (!validEmail(email)) return Promise.reject(new Error("Bitte geben Sie eine gültige E-Mail-Adresse ein."));
    if (password.length < 8) return Promise.reject(new Error("Das Passwort muss mindestens 8 Zeichen haben."));
    if (password !== confirm) return Promise.reject(new Error("Die Passwörter stimmen nicht überein."));
    return api("/api/signup", {
      method: "POST",
      body: { name: name, email: email, phone: phone, password: password, confirm: confirm, visitorId: visitorId() }
    }).then(function (res) {
      setSession(toSession(res.user), res.token);
      return res.user;
    });
  }

  function login(data) {
    return api("/api/login", {
      method: "POST",
      body: {
        email: (data.email || "").trim().toLowerCase(),
        password: data.password || "",
        visitorId: visitorId()
      }
    }).then(function (res) {
      setSession(toSession(res.user), res.token);
      return res.user;
    });
  }

  function logout() {
    var token = getToken();
    if (token) {
      api("/api/logout", { method: "POST", body: { visitorId: visitorId(), path: location.pathname } }).catch(function () {});
    }
    setSession(null);
  }

  function refreshMe() {
    if (!getToken()) return Promise.resolve(getSession());
    return api("/api/me").then(function (res) {
      setSession(toSession(res.user), getToken());
      return getSession();
    }).catch(function (err) {
      if (err.status === 401) setSession(null);
      return getSession();
    });
  }

  function updateProfile(fields) {
    return api("/api/me", { method: "PATCH", body: Object.assign({ visitorId: visitorId() }, fields) }).then(function (res) {
      setSession(toSession(res.user), getToken());
      return res.user;
    });
  }

  function firstName(session) {
    return ((session && session.name) || "Konto").split(" ")[0];
  }

  function paintNav() {
    var session = getSession();
    var loginEl = document.querySelector("[data-auth='login']");
    var signupEl = document.querySelector("[data-auth='signup']");
    var accountEl = document.querySelector("[data-auth='account']");
    var logoutEl = document.querySelector("[data-auth='logout']");

    if (session) {
      if (loginEl) loginEl.hidden = true;
      if (signupEl) signupEl.hidden = true;
      if (accountEl) {
        accountEl.hidden = false;
        accountEl.textContent = firstName(session);
      }
      if (logoutEl) logoutEl.hidden = false;
    } else {
      if (loginEl) loginEl.hidden = false;
      if (signupEl) signupEl.hidden = false;
      if (accountEl) accountEl.hidden = true;
      if (logoutEl) logoutEl.hidden = true;
    }
  }

  function showError(form, message) {
    var box = form.querySelector("[data-auth-error]");
    if (!box) return;
    box.hidden = !message;
    box.textContent = message || "";
  }

  function bindForms() {
    var signupForm = document.querySelector("[data-auth-form='signup']");
    if (signupForm) {
      if (getSession()) {
        window.location.replace("app.html");
        return;
      }
      signupForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var btn = signupForm.querySelector("[type='submit']");
        showError(signupForm, "");
        if (btn) btn.disabled = true;
        signup({
          name: signupForm.name.value,
          email: signupForm.email.value,
          phone: signupForm.phone ? signupForm.phone.value : "",
          password: signupForm.password.value,
          confirm: signupForm.confirm.value
        }).then(function () {
          window.location.href = "app.html";
        }).catch(function (err) {
          showError(signupForm, err.message || "Konto konnte nicht erstellt werden.");
          if (btn) btn.disabled = false;
        });
      });
    }

    var loginForm = document.querySelector("[data-auth-form='login']");
    if (loginForm) {
      if (getSession()) {
        window.location.replace("app.html");
        return;
      }
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var btn = loginForm.querySelector("[type='submit']");
        showError(loginForm, "");
        if (btn) btn.disabled = true;
        login({
          email: loginForm.email.value,
          password: loginForm.password.value
        }).then(function () {
          window.location.href = "app.html";
        }).catch(function (err) {
          showError(loginForm, err.message || "Anmeldung nicht möglich.");
          if (btn) btn.disabled = false;
        });
      });
    }

    var accountRoot = document.querySelector("[data-auth-account]");
    if (accountRoot) {
      if (getSession()) window.location.replace("app.html");
      else window.location.replace("login.html");
      return;
    }
  }

  function bindLogout() {
    document.querySelectorAll("[data-auth='logout']").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        logout();
        window.location.href = "index.html";
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    refreshMe().then(function () {
      paintNav();
      bindLogout();
      bindForms();
    });
  });

  window.NNAuth = {
    getSession: getSession,
    getToken: getToken,
    visitorId: visitorId,
    logout: logout,
    paintNav: paintNav,
    signup: signup,
    login: login,
    updateProfile: updateProfile,
    api: api
  };
})();
