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
    const closeBtn = document.getElementById("drawerCloseBtn") || document.getElementById("closeDrawerBtn");

    if (!drawer) return;

    function openDrawer() {
      const btn = document.getElementById("mobileToggleBtn") || toggleBtn;
      if (btn) {
        btn.setAttribute("aria-expanded", "true");
        btn.classList.add("is-open");
      }

      if (overlay) {
        overlay.removeAttribute("hidden");
        overlay.removeAttribute("inert");
      }
      drawer.removeAttribute("hidden");
      drawer.removeAttribute("inert");
      void drawer.offsetHeight; // force reflow for smooth transition

      drawer.classList.add("is-open");
      if (overlay) overlay.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
      document.body.classList.add("drawer-open");

      // Set active drawer row matching current page
      drawer.querySelectorAll(".drawer-menu-row").forEach(function (row) {
        var target = row.getAttribute("data-drawer-link");
        if (target === page) {
          row.classList.add("is-active");
          row.setAttribute("aria-current", "page");
        } else {
          row.classList.remove("is-active");
          row.removeAttribute("aria-current");
        }
      });

      // Hide floating WA button while drawer is open
      const waBtn = document.getElementById("floatingWaBtn");
      if (waBtn) waBtn.classList.add("is-hidden-modal");

      const closeTarget = document.getElementById("drawerCloseBtn") || closeBtn;
      if (closeTarget) closeTarget.focus();
    }

    function closeDrawer() {
      drawer.classList.remove("is-open");
      if (overlay) overlay.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");

      const btn = document.getElementById("mobileToggleBtn") || toggleBtn;
      if (btn) {
        btn.setAttribute("aria-expanded", "false");
        btn.classList.remove("is-open");
        btn.focus();
      }
      document.body.classList.remove("drawer-open");

      var onTransitionEnd = function (e) {
        if (e && e.target !== drawer) return;
        drawer.removeEventListener("transitionend", onTransitionEnd);
        if (!drawer.classList.contains("is-open")) {
          drawer.setAttribute("hidden", "");
          drawer.setAttribute("inert", "");
          if (overlay) {
            overlay.setAttribute("hidden", "");
            overlay.setAttribute("inert", "");
          }
        }
      };
      drawer.addEventListener("transitionend", onTransitionEnd);
      setTimeout(onTransitionEnd, 460);

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

    // Search trigger button
    document.addEventListener("click", function (e) {
      const sBtn = e.target.closest("#searchBtn, .search-btn");
      if (sBtn) {
        e.preventDefault();
        const dialog = document.getElementById("searchDialog");
        if (dialog) {
          dialog.showModal();
          document.body.style.overflow = "hidden";
          const input = dialog.querySelector("#siteSearchInput");
          if (input) {
            input.value = "";
            setTimeout(() => input.focus(), 60);
          }
        }
      }
    });

    // Delegated click listener so hamburger always toggles even after header re-render
    document.addEventListener("click", function (e) {
      const btn = e.target.closest("#mobileToggleBtn, .mobile-toggle-btn");
      if (btn) {
        e.preventDefault();
        if (drawer.classList.contains("is-open") || btn.classList.contains("is-open")) {
          closeDrawer();
        } else {
          openDrawer();
        }
      }
    });

    document.addEventListener("click", function (e) {
      const cBtn = e.target.closest("#drawerCloseBtn, #closeDrawerBtn, .drawer-close-btn");
      if (cBtn) {
        e.preventDefault();
        closeDrawer();
      }
    });

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

    // Close drawer when any internal navigation link is clicked
    drawer.addEventListener("click", function (e) {
      const link = e.target.closest("a");
      if (link) {
        closeDrawer();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNav);
  } else {
    initNav();
  }
})();
