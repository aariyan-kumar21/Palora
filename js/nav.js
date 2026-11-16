/**
 * Palora Navigation & Drawer Management
 */

(function () {
  function initNav() {
    const header = document.getElementById("site-header") || document.getElementById("header");
    const page = document.body.getAttribute("data-page") || "home";

    // 1. Scroll listener for header transparency
    function updateHeaderOnScroll() {
      if (!header) return;
      if (page === "home") {
        if (window.scrollY > 40) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      } else {
        header.classList.add("scrolled");
      }
    }

    window.addEventListener("scroll", updateHeaderOnScroll, { passive: true });
    updateHeaderOnScroll();

    // 2. Set active nav link matching body[data-page]
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      let isActive = false;
      if (page === "home" && (href === "index.html" || href === "/" || href === "./" || href === "")) {
        isActive = true;
      } else if (page === "catalogue" && href.includes("catalogue.html")) {
        isActive = true;
      } else if (page === "story" && href.includes("story.html")) {
        isActive = true;
      } else if (page === "help" && href.includes("help.html")) {
        isActive = true;
      } else if (page === "privacy" && href.includes("privacy.html")) {
        isActive = true;
      }

      if (isActive) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      }
    });

    // 3. Hamburger drawer handling
    const toggleBtn = document.getElementById("mobileToggleBtn");
    const drawer = document.getElementById("mobileDrawer");
    const overlay = document.getElementById("mobileDrawerOverlay");
    const closeBtn = document.getElementById("closeDrawerBtn");

    if (!drawer) return;

    function openDrawer() {
      drawer.classList.add("is-open");
      if (overlay) overlay.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
      if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "true");
      document.body.classList.add("drawer-open");

      // Hide floating WA button while drawer is open
      const waBtn = document.getElementById("floatingWaBtn");
      if (waBtn) waBtn.classList.add("is-hidden-modal");

      // Focus first actionable item or close button
      if (closeBtn) closeBtn.focus();
    }

    function closeDrawer() {
      drawer.classList.remove("is-open");
      if (overlay) overlay.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      if (toggleBtn) {
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.focus();
      }
      document.body.classList.remove("drawer-open");

      // Restore floating WA button if other modals not open
      const waBtn = document.getElementById("floatingWaBtn");
      if (waBtn) {
        const anyModalOpen =
          document.querySelector(".cart-modal.is-open") ||
          document.querySelector(".saved-panel.is-open") ||
          document.querySelector("dialog[open]");
        if (!anyModalOpen) {
          waBtn.classList.remove("is-hidden-modal");
        }
      }
    }

    if (toggleBtn) {
      toggleBtn.addEventListener("click", function (e) {
        e.preventDefault();
        if (drawer.classList.contains("is-open")) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) {
        e.preventDefault();
        closeDrawer();
      });
    }

    if (overlay) {
      overlay.addEventListener("click", closeDrawer);
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) {
        closeDrawer();
      }
    });

    // Focus trap in drawer
    drawer.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || !drawer.classList.contains("is-open")) return;
      const focusables = drawer.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    // Close drawer on internal link click (especially anchor jumps)
    drawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeDrawer();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNav);
  } else {
    initNav();
  }
})();
