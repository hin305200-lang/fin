const MIN_CREDIT = 1000;
const MIN_BALANCE = 2500;
const PAGE_WIDTH_PX = 794;
const PAGE_HEIGHT_PX = 1123;

const ONES = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];
const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

function chunkToWords(n) {
  if (n < 20) return ONES[n];
  if (n < 100) {
    return `${TENS[Math.floor(n / 10)]}${n % 10 ? "-" + ONES[n % 10] : ""}`;
  }
  const rest = n % 100;
  return `${ONES[Math.floor(n / 100)]} hundred${rest ? " " + chunkToWords(rest) : ""}`;
}

function numberToWords(value) {
  const amount = Math.round(Number(value));
  if (!Number.isFinite(amount) || amount < 0) return "amount to be inserted";
  if (amount === 0) return "zero euros";
  const scales = ["", " thousand", " million", " billion"];
  let n = amount;
  let parts = [];
  let scale = 0;
  while (n > 0 && scale < scales.length) {
    const chunk = n % 1000;
    if (chunk) parts.unshift(chunkToWords(chunk) + scales[scale]);
    n = Math.floor(n / 1000);
    scale += 1;
  }
  return `${parts.join(" ")} euros`;
}

function parseAmount(raw) {
  const cleaned = String(raw).replace(/[^\d.]/g, "");
  return Number(cleaned || 0);
}

function formatAmount(value) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatLongDate(date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function makeAgreementNo(date) {
  const serial = `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
  return `KFX-CR-${serial}`;
}

class SignaturePad {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.drawing = false;
    this.empty = true;
    this.last = null;
    this.resize();
    canvas.addEventListener("pointerdown", (e) => this.start(e));
    canvas.addEventListener("pointermove", (e) => this.move(e));
    window.addEventListener("pointerup", () => this.end());
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    const data = this.empty ? null : this.canvas.toDataURL();
    const ratio = Math.max(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    this.canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.strokeStyle = "#1b2a4a";
    this.ctx.lineWidth = 2.1;
    if (data) {
      const img = new Image();
      img.onload = () => this.ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = data;
    }
  }

  point(e) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  start(e) {
    e.preventDefault();
    this.canvas.setPointerCapture(e.pointerId);
    this.drawing = true;
    this.last = this.point(e);
  }

  move(e) {
    if (!this.drawing) return;
    const next = this.point(e);
    this.ctx.beginPath();
    this.ctx.moveTo(this.last.x, this.last.y);
    this.ctx.lineTo(next.x, next.y);
    this.ctx.stroke();
    this.last = next;
    this.empty = false;
  }

  end() {
    this.drawing = false;
    this.last = null;
  }

  clear() {
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);
    this.empty = true;
  }

  toDataURL() {
    if (this.empty) return "";
    return this.canvas.toDataURL("image/png");
  }
}

function $(id) {
  return document.getElementById(id);
}

function showToast(message) {
  const toast = $("toast");
  toast.hidden = false;
  toast.textContent = message;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.hidden = true;
  }, 3200);
}

function renderTypedSignature(preview, name, pad) {
  preview.textContent = pad.empty ? name : "";
}

function signatureSource(pad, typedName) {
  if (!pad.empty) return { type: "draw", data: pad.toDataURL() };
  if (typedName.trim()) return { type: "typed", data: typedName.trim() };
  return null;
}

function paintTypedSignature(name) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 260;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1b2a4a";
  ctx.font = "92px 'Great Vibes', cursive";
  ctx.textBaseline = "middle";
  ctx.fillText(name, 24, 140);
  return canvas.toDataURL("image/png");
}

function syncLiveFields() {
  document.querySelectorAll("[data-for]").forEach((el) => {
    const source = $(el.dataset.for);
    const value = source && source.value.trim();
    if (value) {
      el.textContent = value;
      return;
    }
    if (el.classList.contains("sig-entity")) {
      el.textContent = el.dataset.for === "clientName" ? "Pieter Willem" : "KaraFX";
      return;
    }
    if (el.dataset.for === "accountManager") {
      el.textContent = "Thomas Anderson";
      return;
    }
    if (el.classList.contains("live")) {
      el.textContent = "[Name of Broker / Cooperation Partner]";
    }
  });
}

function updateAmountWords() {
  $("amountWords").textContent = numberToWords(parseAmount($("amount").value));
  $("balanceWords").textContent = numberToWords(parseAmount($("balance").value));
}

function currentDate() {
  return new Date();
}

function waitForImages(root) {
  return Promise.all(
    [...root.querySelectorAll("img")].map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );
}

function replaceInputs(root) {
  root.querySelectorAll("input").forEach((input) => {
    const text = document.createElement(input.classList.contains("wide") ? "div" : "span");
    text.className = input.className || "blank";
    text.textContent = input.value || " ";
    input.replaceWith(text);
  });
}

function createPdfSheet(isFirst) {
  const sheet = document.createElement("div");
  sheet.className = "paper pdf-sheet";
  if (!isFirst) {
    const head = document.createElement("div");
    head.className = "pdf-runhead";
    head.innerHTML =
      '<img src="assets/logo.png" alt="KaraFX"><span>Trading Account Credit Request · Confidential</span>';
    sheet.appendChild(head);
  }
  return sheet;
}

function groupedPdfBlocks(clone) {
  const groups = [];
  const opening = document.createElement("div");
  const children = [...clone.children];
  while (children.length) {
    const el = children[0];
    if (
      el.id === "particulars" ||
      el.id === "s1" ||
      el.id === "execution" ||
      el.classList.contains("clause") ||
      el.tagName === "FOOTER"
    ) {
      break;
    }
    opening.appendChild(children.shift());
  }
  if (opening.childElementCount) groups.push(opening);
  children.forEach((child) => groups.push(child));
  return groups;
}

function paginateClone(clone) {
  const host = document.createElement("div");
  host.id = "pdf-host";
  host.style.cssText = `position:fixed;left:-16000px;top:0;width:${PAGE_WIDTH_PX}px;`;
  document.body.appendChild(host);

  const measure = createPdfSheet(true);
  measure.style.minHeight = "0";
  host.appendChild(measure);
  groupedPdfBlocks(clone).forEach((block) => measure.appendChild(block));

  const usable = PAGE_HEIGHT_PX - 130;
  const pages = [];
  let sheet = createPdfSheet(true);
  let used = 0;

  const flush = () => {
    if (!sheet.childElementCount) return;
    pages.push(sheet);
    sheet = createPdfSheet(false);
    used = 48;
  };

  [...measure.children].forEach((block) => {
    const height = Math.ceil(block.getBoundingClientRect().height);
    if (used > 80 && used + height > usable) flush();
    sheet.appendChild(block);
    used += height + 6;
  });
  flush();
  measure.remove();
  pages.forEach((page) => host.appendChild(page));
  return { host, pages };
}

async function makePdf() {
  if (typeof html2canvas === "undefined" || !window.jspdf) {
    showToast("The PDF library could not be loaded. Check your connection and try again.");
    return;
  }

  const buttons = [$("downloadBtn"), $("downloadBtnBottom")].filter(Boolean);
  buttons.forEach((button) => {
    button.disabled = true;
    button.textContent = "Preparing PDF…";
  });

  let host;
  try {
    await document.fonts.ready;
    const clone = $("document").cloneNode(true);
    clone.querySelectorAll(".no-export").forEach((el) => el.remove());
    clone.querySelectorAll(".sig-pad-wrap, canvas").forEach((el) => el.remove());
    replaceInputs(clone);
    clone.querySelectorAll(".sig-image").forEach((img) => {
      img.removeAttribute("hidden");
      img.style.display = "block";
    });
    clone.querySelectorAll("[hidden]").forEach((el) => {
      if (!el.classList.contains("stamp") && !el.classList.contains("sig-image")) el.remove();
    });

    const paginated = paginateClone(clone);
    host = paginated.host;
    await waitForImages(host);

    const pdf = new window.jspdf.jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < paginated.pages.length; i += 1) {
      const canvas = await html2canvas(paginated.pages[i], {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: PAGE_WIDTH_PX,
        windowWidth: PAGE_WIDTH_PX,
      });
      const img = canvas.toDataURL("image/jpeg", 0.97);
      if (i > 0) pdf.addPage();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      if (imgHeight > pageHeight) {
        const fit = pageHeight / imgHeight;
        const fittedWidth = imgWidth * fit;
        pdf.addImage(img, "JPEG", (pageWidth - fittedWidth) / 2, 0, fittedWidth, pageHeight, undefined, "FAST");
      } else {
        pdf.addImage(img, "JPEG", 0, 0, imgWidth, imgHeight, undefined, "FAST");
      }
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(107, 107, 107);
      pdf.text(
        `KaraFX — Confidential   ${i + 1} / ${paginated.pages.length}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: "center" }
      );
    }

    const client = $("clientName").value.trim() || "Client";
    const safeClient = client.replace(/[^\w\- ]+/g, "").replace(/\s+/g, "_");
    pdf.save(`KaraFX_Credit_Request_${safeClient}.pdf`);
    showToast(`Signed PDF downloaded (${paginated.pages.length} pages).`);
  } catch (error) {
    console.error(error);
    showToast("PDF download failed. You can use Print instead.");
  } finally {
    if (host) host.remove();
    buttons.forEach((button) => {
      button.disabled = false;
      button.textContent = "Download PDF";
    });
  }
}

async function executeAgreement(clientPad) {
  const clientName = $("clientName").value.trim();
  const clientSignatory = $("clientSignatory").value.trim();
  const amount = parseAmount($("amount").value);
  const balance = parseAmount($("balance").value);

  if (!clientName) {
    showToast("Please complete the Client name.");
    return;
  }
  if (balance < MIN_BALANCE) {
    showToast("The trading account balance must be at least EUR 2,500.00 to request credit.");
    return;
  }
  if (amount < MIN_CREDIT) {
    showToast("The credit to add must be at least EUR 1,000.00.");
    return;
  }
  if (!clientSignatory) {
    showToast("Please enter the Client signatory name.");
    return;
  }
  if (!$("agree").checked) {
    showToast("Please confirm that you have read the credit request.");
    return;
  }

  const clientSig = signatureSource(clientPad, clientSignatory);
  if (!clientSig) {
    showToast("Please draw a signature or keep the typed name.");
    return;
  }

  await document.fonts.ready;
  const clientSrc =
    clientSig.type === "draw" ? clientSig.data : paintTypedSignature(clientSignatory);

  $("clientSigImage").src = clientSrc;
  $("clientSigImage").hidden = false;
  $("executedStamp").hidden = false;
  $("executedWhen").textContent = formatLongDate(currentDate());
  $("statusPill").textContent = "Executed";
  $("statusPill").classList.add("done");
  $("downloadBtn").disabled = false;
  $("downloadPanel").hidden = false;
  $("executeBar").hidden = true;
  document.body.classList.add("executed");
  showToast("Credit request executed. You can download the signed PDF.");
}

function init() {
  const today = currentDate();
  $("agreementDate").value = formatLongDate(today);
  $("issueDate").textContent = formatLongDate(today);
  $("clientSignDate").value = formatLongDate(today);
  $("agreementNo").textContent = makeAgreementNo(today);
  $("footRef").textContent = $("agreementNo").textContent;

  const clientPad = new SignaturePad($("clientPad"));
  renderTypedSignature($("clientTypedPreview"), $("clientSignatory").value, clientPad);

  document.querySelectorAll("[data-clear]").forEach((btn) => {
    btn.addEventListener("click", () => {
      clientPad.clear();
      $("clientTypedPreview").textContent = $("clientSignatory").value;
    });
  });

  ["amount", "balance"].forEach((id) => {
    $(id).addEventListener("input", updateAmountWords);
    $(id).addEventListener("blur", () => {
      const value = parseAmount($(id).value);
      if (value) $(id).value = formatAmount(value);
      updateAmountWords();
    });
  });

  ["managerName", "clientName", "accountManager", "brokerName"].forEach((id) => {
    if ($(id)) $(id).addEventListener("input", syncLiveFields);
  });

  $("clientSignatory").addEventListener("input", () => {
    renderTypedSignature($("clientTypedPreview"), $("clientSignatory").value, clientPad);
  });
  $("clientPad").addEventListener("pointerdown", () => {
    $("clientTypedPreview").textContent = "";
  });

  $("executeBtn").addEventListener("click", () => executeAgreement(clientPad));
  $("downloadBtn").addEventListener("click", makePdf);
  $("downloadBtnBottom").addEventListener("click", makePdf);
  $("printBtn").addEventListener("click", () => window.print());

  const tocLinks = [...document.querySelectorAll(".toc a")];
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        tocLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-30% 0px -60% 0px", threshold: 0.1 }
  );
  tocLinks.forEach((link) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) observer.observe(target);
  });

  syncLiveFields();
  updateAmountWords();
}

document.addEventListener("DOMContentLoaded", init);
