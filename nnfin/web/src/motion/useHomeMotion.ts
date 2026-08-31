import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function wrapHeadingWords(heading: HTMLElement): void {
  const aria = (heading.textContent || "").replace(/\s+/g, " ").trim();
  if (aria) heading.setAttribute("aria-label", aria);
  const frag = document.createDocumentFragment();
  Array.from(heading.childNodes).forEach((node) => {
    if (node.nodeName === "BR") {
      frag.appendChild(document.createElement("br"));
      return;
    }
    const words = (node.textContent || "").trim().split(/\s+/).filter(Boolean);
    words.forEach((word, index) => {
      const span = document.createElement("span");
      span.className = "w";
      span.setAttribute("aria-hidden", "true");
      span.textContent = word;
      frag.appendChild(span);
      if (index < words.length - 1) frag.appendChild(document.createTextNode(" "));
    });
  });
  heading.replaceChildren(frag);
}

function showStatic(): void {
  document.documentElement.classList.remove("motion");
  document.querySelectorAll("[data-reveal],[data-hero],[data-hero-dash],[data-hero-line]").forEach((el) => {
    const node = el as HTMLElement;
    node.style.opacity = "1";
    node.style.transform = "none";
    node.style.filter = "none";
  });
}

export function useHomeMotion(): void {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) document.documentElement.classList.add("rm");

    const switchEl = document.getElementById("billSwitch");
    const onBill = (): void => {
      if (!switchEl) return;
      const yearly = switchEl.classList.toggle("yearly");
      switchEl.setAttribute("aria-checked", yearly ? "true" : "false");
      document.querySelectorAll("[data-price]").forEach((el) => {
        const node = el as HTMLElement;
        node.textContent = yearly ? node.getAttribute("data-y") : node.getAttribute("data-m");
      });
      document.querySelectorAll("[data-billed]").forEach((el) => {
        el.textContent = yearly ? "für Geschäftskunden" : "für Privatkunden";
      });
    };
    switchEl?.addEventListener("click", onBill);

    const accCleanup: Array<() => void> = [];
    document.querySelectorAll(".acc").forEach((acc) => {
      const head = acc.querySelector(".acc-head");
      const body = acc.querySelector(".acc-body") as HTMLElement | null;
      if (!head || !body) return;
      const setHeight = (): void => {
        body.style.maxHeight = acc.classList.contains("open") ? `${body.scrollHeight}px` : "0px";
      };
      const onClick = (): void => {
        const open = acc.classList.toggle("open");
        head.setAttribute("aria-expanded", open ? "true" : "false");
        setHeight();
      };
      head.addEventListener("click", onClick);
      setHeight();
      window.addEventListener("resize", setHeight);
      accCleanup.push(() => {
        head.removeEventListener("click", onClick);
        window.removeEventListener("resize", setHeight);
      });
    });

    const ktTabs = document.querySelectorAll(".kt-tab");
    const ktPanels = document.querySelectorAll(".kt-panel");
    const ktSet = (index: number): void => {
      ktTabs.forEach((tab, j) => {
        tab.classList.toggle("on", index === j);
        tab.setAttribute("aria-selected", index === j ? "true" : "false");
      });
      ktPanels.forEach((panel, j) => {
        panel.classList.toggle("on", index === j);
      });
    };
    const tabHandlers: Array<() => void> = [];
    ktTabs.forEach((tab, i) => {
      const onClick = (): void => {
        ktSet(i);
      };
      tab.addEventListener("click", onClick);
      tabHandlers.push(() => tab.removeEventListener("click", onClick));
    });

    if (reduced) {
      showStatic();
      return () => {
        switchEl?.removeEventListener("click", onBill);
        accCleanup.forEach((fn) => fn());
        tabHandlers.forEach((fn) => fn());
      };
    }

    document.documentElement.classList.add("motion");
    try {
      gsap.set("[data-hero]", { opacity: 0, y: 26 });
      gsap.set("[data-hero-line]", { yPercent: 112, filter: "blur(10px)" });
      gsap.set("[data-hero-dash]", { opacity: 0, y: 80 });
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to("[data-hero]", { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.15)
        .to(
          "[data-hero-line]",
          { yPercent: 0, filter: "blur(0px)", duration: 1.05, stagger: 0.14, ease: "power4.out" },
          0.3,
        )
        .to("[data-hero-dash]", { opacity: 1, y: 0, duration: 1.15, ease: "power3.out" }, 0.75);

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        if (el.matches(".bcard,.dcard,.pcard,.acc,.tstat,.tquote")) return;
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 86%", toggleActions: "play reverse play reverse" },
        });
      });

      document.querySelectorAll<HTMLElement>("h2.sec").forEach((heading) => {
        wrapHeadingWords(heading);
        const pinParent = heading.closest("#ktPin") as HTMLElement | null;
        gsap.fromTo(
          heading.querySelectorAll(".w"),
          { opacity: 0, y: 16, filter: "blur(8px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.045,
            scrollTrigger: {
              trigger: heading,
              start: "top 88%",
              toggleActions: "play reverse play reverse",
              pinnedContainer: pinParent || undefined,
            },
          },
        );
      });

      (
        [
          [".bento", ".bcard"],
          [".dgrid", ".dcard"],
          [".pcards", ".pcard"],
          [".faq", ".acc"],
        ] as const
      ).forEach(([gridSel, cardSel]) => {
        const grid = document.querySelector(gridSel);
        if (!grid) return;
        const cards = grid.querySelectorAll(cardSel);
        if (!cards.length) return;
        gsap.fromTo(
          cards,
          { opacity: 0, y: 34 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.09,
            scrollTrigger: { trigger: grid, start: "top 84%", toggleActions: "play reverse play reverse" },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>(".tstat").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, x: -48, y: 0 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play reverse play reverse" },
          },
        );
      });
      gsap.utils.toArray<HTMLElement>(".tquote").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, x: 48, y: 0 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play reverse play reverse" },
          },
        );
      });

      gsap.to("[data-hero-dash]", {
        yPercent: -9,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 },
      });
      gsap.to(".hero-chart-bg", {
        yPercent: 18,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 },
      });

      const scDash = document.querySelector(".showcase .dash");
      if (scDash) {
        gsap.fromTo(
          scDash,
          { y: 56 },
          {
            y: -56,
            ease: "none",
            scrollTrigger: { trigger: ".showcase", start: "top bottom", end: "bottom top", scrub: 0.8 },
          },
        );
      }

      ScrollTrigger.create({
        trigger: "#keytools",
        start: "top 15%",
        end: "+=1400",
        pin: "#ktPin",
        scrub: true,
        refreshPriority: 1,
        onUpdate: (self) => {
          const i = Math.min(2, Math.floor(self.progress * 3));
          ktSet(i);
        },
      });

      gsap.from(".dark", {
        yPercent: 6,
        borderRadius: "56px",
        ease: "none",
        scrollTrigger: { trigger: ".dark", start: "top 95%", end: "top 45%", scrub: true },
      });
    } catch {
      showStatic();
    }

    return () => {
      switchEl?.removeEventListener("click", onBill);
      accCleanup.forEach((fn) => fn());
      tabHandlers.forEach((fn) => fn());
      ScrollTrigger.getAll().forEach((t) => t.kill());
      document.documentElement.classList.remove("motion");
    };
  }, []);
}
