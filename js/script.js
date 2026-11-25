// ===== إتقان — interactions =====
(function () {
  "use strict";

  // Verification snapshot mode: ?snap renders everything in its final state.
  const SNAP = location.search.includes("snap");
  if (SNAP) {
    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("is-visible");
      el.style.transition = "none";
    });
    document.querySelectorAll(".stat__num").forEach((el) => {
      const decimals = parseInt(el.dataset.decimal || "0", 10);
      el.textContent = parseFloat(el.dataset.count).toFixed(decimals) + (el.dataset.suffix || "");
    });
  }

  // --- Sticky header state ---
  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // --- Mobile menu ---
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");
  menuToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll(".nav__link").forEach((link) =>
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      menuToggle.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    })
  );

  // --- Active nav link on scroll ---
  const sections = ["courses", "features", "pricing", "testimonials", "faq"];
  const navLinks = [...document.querySelectorAll(".nav__link")];
  const markActive = () => {
    const pos = window.scrollY + 120;
    let current = "";
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= pos) current = id;
    }
    navLinks.forEach((l) =>
      l.classList.toggle("is-active", l.getAttribute("href") === "#" + current)
    );
  };
  window.addEventListener("scroll", markActive, { passive: true });

  // --- Course filters ---
  const filters = document.getElementById("filters");
  const cards = [...document.querySelectorAll(".course-card")];
  filters.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter");
    if (!btn) return;
    filters.querySelectorAll(".filter").forEach((f) => f.classList.remove("is-active"));
    btn.classList.add("is-active");
    const cat = btn.dataset.filter;
    cards.forEach((card) => {
      const show = cat === "all" || card.dataset.category === cat;
      card.classList.toggle("is-hidden", !show);
      if (show) {
        card.style.animation = "none";
        void card.offsetWidth; // restart animation
        card.style.animation = "cardIn 0.4s ease";
      }
    });
  });

  // --- Cart counter + toast ---
  const cartCount = document.getElementById("cartCount");
  const toast = document.getElementById("toast");
  let count = 0;
  let toastTimer;
  document.querySelectorAll(".add-to-cart").forEach((btn) =>
    btn.addEventListener("click", () => {
      count += 1;
      cartCount.textContent = String(count);
      cartCount.classList.remove("is-bump");
      void cartCount.offsetWidth;
      cartCount.classList.add("is-bump");
      toast.classList.add("is-visible");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
    })
  );
  document.getElementById("cartBtn").addEventListener("click", () => {
    toast.textContent = count > 0 ? `🛒 في السلة ${count} كورس` : "🛒 السلة فاضية لسه";
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("is-visible");
      toast.textContent = "✅ اتضاف الكورس للسلة";
    }, 1800);
  });

  // --- Scroll reveal ---
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  // --- Animated counters ---
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimal || "0", 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll(".stat__num").forEach((el) => counterObserver.observe(el));
})();

// card entrance animation (used by the filter)
const style = document.createElement("style");
style.textContent = "@keyframes cardIn { from { opacity: 0; transform: translateY(14px) scale(0.98); } to { opacity: 1; transform: none; } }";
document.head.appendChild(style);
