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

  // --- Cart + checkout ---
  const cartCount = document.getElementById("cartCount");
  const toast = document.getElementById("toast");
  const modal = document.getElementById("checkoutModal");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalClose = document.getElementById("modalClose");
  const checkoutEmpty = document.getElementById("checkoutEmpty");
  const checkoutContent = document.getElementById("checkoutContent");
  const checkoutSuccess = document.getElementById("checkoutSuccess");
  const checkoutItems = document.getElementById("checkoutItems");
  const checkoutTotal = document.getElementById("checkoutTotal");
  const checkoutForm = document.getElementById("checkoutForm");
  const formError = document.getElementById("formError");
  const orderNumber = document.getElementById("orderNumber");
  const successClose = document.getElementById("successClose");

  const cart = []; // { title, price, emoji }
  let toastTimer;

  const formatPrice = (n) => n.toLocaleString("ar-EG") + " ج.م";
  const cartTotal = () => cart.reduce((sum, item) => sum + item.price, 0);

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
  };

  const bumpCount = () => {
    cartCount.textContent = String(cart.length);
    cartCount.classList.remove("is-bump");
    void cartCount.offsetWidth;
    cartCount.classList.add("is-bump");
  };

  const renderCart = () => {
    const isEmpty = cart.length === 0;
    checkoutEmpty.hidden = !isEmpty;
    checkoutContent.hidden = isEmpty;
    checkoutSuccess.hidden = true;
    if (isEmpty) return;
    checkoutItems.innerHTML = cart
      .map(
        (item, i) => `
      <div class="checkout-item">
        <span class="checkout-item__thumb">${item.emoji}</span>
        <div class="checkout-item__info">
          <strong>${item.title}</strong>
          <small>${formatPrice(item.price)}</small>
        </div>
        <button class="checkout-item__remove" data-index="${i}" aria-label="حذف من السلة">🗑️</button>
      </div>`
      )
      .join("");
    checkoutTotal.textContent = formatPrice(cartTotal());
  };

  const openModal = () => {
    renderCart();
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };
  const closeModal = () => {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  document.querySelectorAll(".add-to-cart").forEach((btn) =>
    btn.addEventListener("click", () => {
      const card = btn.closest(".course-card");
      const title = card.querySelector("h3").textContent.trim();
      const price = parseInt(card.querySelector(".price__now").textContent.replace(/[^0-9]/g, ""), 10);
      const emoji = card.querySelector(".course-card__emoji").textContent.trim();
      cart.push({ title, price, emoji });
      bumpCount();
      showToast("✅ اتضاف الكورس للسلة");
    })
  );

  document.getElementById("cartBtn").addEventListener("click", openModal);
  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", closeModal);
  successClose.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  checkoutItems.addEventListener("click", (e) => {
    const btn = e.target.closest(".checkout-item__remove");
    if (!btn) return;
    cart.splice(parseInt(btn.dataset.index, 10), 1);
    bumpCount();
    renderCart();
  });

  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("buyerName");
    const phone = document.getElementById("buyerPhone");
    const email = document.getElementById("buyerEmail");
    const nameOk = name.value.trim().length >= 3;
    const phoneOk = /^01[0-9]{9}$/.test(phone.value.trim());
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    name.classList.toggle("is-invalid", !nameOk);
    phone.classList.toggle("is-invalid", !phoneOk);
    email.classList.toggle("is-invalid", !emailOk);
    const valid = nameOk && phoneOk && emailOk;
    formError.classList.toggle("is-visible", !valid);
    if (!valid) return;
    orderNumber.textContent = "رقم الطلب: #ITQ-" + String(Math.floor(100000 + Math.random() * 900000));
    checkoutContent.hidden = true;
    checkoutSuccess.hidden = false;
    cart.length = 0;
    bumpCount();
    checkoutForm.reset();
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
