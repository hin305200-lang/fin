(function () {
  "use strict";
  if (/crm\.html/i.test(location.pathname)) return;

  var queue = [];
  var flushTimer = null;

  function visitorId() {
    return (window.NNAuth && window.NNAuth.visitorId && window.NNAuth.visitorId()) || localStorage.getItem("nnfb_vid");
  }

  function token() {
    return (window.NNAuth && window.NNAuth.getToken && window.NNAuth.getToken()) || localStorage.getItem("nnfb_token");
  }

  function enqueue(ev) {
    queue.push(Object.assign({
      path: location.pathname + location.hash,
      title: document.title
    }, ev));
    if (queue.length >= 8) flush();
    else if (!flushTimer) flushTimer = setTimeout(flush, 1200);
  }

  function flush() {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    if (!queue.length) return;
    var batch = queue.splice(0, 80);
    var headers = { "Content-Type": "application/json" };
    var t = token();
    if (t) headers.Authorization = "Bearer " + t;
    fetch("/api/events", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ visitorId: visitorId(), events: batch }),
      keepalive: true
    }).catch(function () {});
  }

  function labelFrom(el) {
    if (!el || el === document || el === document.body) return "";
    var t = (el.getAttribute && (el.getAttribute("aria-label") || el.getAttribute("data-view") || el.getAttribute("data-open"))) || "";
    if (!t) t = (el.innerText || el.textContent || el.getAttribute("href") || el.getAttribute("name") || "").replace(/\s+/g, " ").trim();
    return t.slice(0, 180);
  }

  function trackClick(e) {
    var el = e.target;
    if (!el) return;
    if (el.closest && el.closest("input[type='password'], input[type='email'], input[type='text'], textarea")) {
      var field = el.closest("input, textarea");
      enqueue({
        type: "click",
        label: "Feld: " + ((field && (field.getAttribute("name") || field.id)) || "input"),
        href: null,
        extra: { kind: "field" }
      });
      return;
    }
    var hit = el.closest ? (el.closest("a, button, [data-view], [data-open], [data-go], [data-acct], [data-connect], [data-pick]") || el) : el;
    var href = hit.getAttribute && hit.getAttribute("href");
    enqueue({
      type: "click",
      label: labelFrom(hit) || labelFrom(el) || hit.tagName,
      href: href || null,
      extra: { tag: (hit.tagName || "").toLowerCase() }
    });
  }

  function heartbeat() {
    var headers = { "Content-Type": "application/json" };
    var t = token();
    if (!t) return;
    headers.Authorization = "Bearer " + t;
    fetch("/api/heartbeat", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ visitorId: visitorId(), path: location.pathname }),
      keepalive: true
    }).catch(function () {});
  }

  function action(label, extra) {
    enqueue({ type: "app_action", label: label, extra: extra || null });
    flush();
  }

  document.addEventListener("click", trackClick, true);
  window.addEventListener("pagehide", flush);
  window.addEventListener("beforeunload", flush);
  document.addEventListener("visibilitychange", function () {
    enqueue({ type: document.hidden ? "hidden" : "visible", label: document.hidden ? "Tab im Hintergrund" : "Tab wieder aktiv" });
    flush();
  });

  enqueue({ type: "page_view", label: document.title });
  setInterval(heartbeat, 25000);
  setTimeout(flush, 400);

  window.NNTrack = { action: action, flush: flush };
})();
