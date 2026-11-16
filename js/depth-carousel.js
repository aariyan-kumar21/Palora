/**
 * Palora 3D Depth Carousel for Categories
 * Renders and drives 11 categories in a 3D stage with auto-advance, drag/swipe, dots, and keyboard nav.
 */

(function () {
  const PALETTES = [
    "linear-gradient(135deg, #F6D3D9 0%, #E8A8B4 100%)",
    "linear-gradient(135deg, #F2CAD2 0%, #DF9EA9 100%)",
    "linear-gradient(135deg, #EFC1CB 0%, #D894A0 100%)",
    "linear-gradient(135deg, #EDB8C3 0%, #D08996 100%)",
    "linear-gradient(135deg, #EAAFB8 0%, #C87E8C 100%)"
  ];

  function initDepthCarousel(rootEl) {
    if (!rootEl) return;
    if (typeof CATEGORIES === "undefined" || !CATEGORIES.length) return;

    let activeIndex = 0;
    const total = CATEGORIES.length;
    let autoTimer = null;
    let resumeTimeout = null;
    let isUserPaused = false;
    let isHovered = false;
    let isFocused = false;
    let isDragging = false;
    let isIntersecting = true;
    let dragStartX = 0;
    let dragDeltaX = 0;
    let hasDragged = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Build markup inside rootEl if empty or stage not present
    let stage = rootEl.querySelector(".depth__stage");
    if (!stage) {
      rootEl.innerHTML = `
        <button type="button" class="depth__nav depth__nav--prev" aria-label="Previous category">
          ${icon("chevron-left", { size: 20 })}
        </button>
        <div class="depth__stage"></div>
        <button type="button" class="depth__nav depth__nav--next" aria-label="Next category">
          ${icon("chevron-right", { size: 20 })}
        </button>
        <div class="depth__controls">
          <div class="depth__dots" role="tablist" aria-label="Category slides"></div>
          <button type="button" class="depth__pause-btn" aria-label="Pause auto-advance" aria-pressed="false">
            ${icon("pause", { size: 18 })}
          </button>
        </div>
        <div class="depth__footer">
          <a class="link-arrow link-arrow--cream" href="catalogue.html">
            View all products
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
              <path d="M1 6h14M11 1.5 15.5 6 11 10.5"/>
            </svg>
          </a>
        </div>
        <div class="sr-only depth__announcer" aria-live="polite"></div>
      `;
      stage = rootEl.querySelector(".depth__stage");
    }

    const prevBtn = rootEl.querySelector(".depth__nav--prev");
    const nextBtn = rootEl.querySelector(".depth__nav--next");
    const dotsContainer = rootEl.querySelector(".depth__dots");
    const pauseBtn = rootEl.querySelector(".depth__pause-btn");
    const announcer = rootEl.querySelector(".depth__announcer");

    if (reducedMotion && pauseBtn) {
      pauseBtn.style.display = "none";
    }

    // Render cards
    stage.innerHTML = "";
    CATEGORIES.forEach((cat, idx) => {
      const count = typeof countInCategory === "function" ? countInCategory(cat.slug) : 0;
      const countText = count === 1 ? "1 PIECE" : `${count} PIECES`;
      const bgGrad = PALETTES[idx % PALETTES.length];
      const card = document.createElement("a");
      card.className = "depth-card";
      card.href = `catalogue.html?category=${encodeURIComponent(cat.slug)}`;
      card.setAttribute("aria-label", `${cat.label}, ${countText.toLowerCase()}`);
      card.dataset.index = idx;

      card.innerHTML = `
        <div class="depth-card__placeholder" style="background: ${bgGrad};">
          <div class="depth-card__faint-icon">
            ${icon(cat.icon || "gift", { size: 96, strokeWidth: 1.2 })}
          </div>
        </div>
        <img class="depth-card__img" src="assets/categories/${cat.slug}.jpg" alt="" loading="lazy" draggable="false" onerror="this.remove()">
        <div class="depth-card__overlay"></div>
        <div class="depth-card__content">
          <span class="depth-card__count">${countText}</span>
          <h3 class="depth-card__title">${cat.label}</h3>
          <span class="depth-card__explore">
            EXPLORE
            <svg width="18" height="10" viewBox="0 0 18 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M1 5h16M12 1l5 4-5 4"/>
            </svg>
          </span>
        </div>
      `;

      stage.appendChild(card);
    });

    const cards = Array.from(stage.querySelectorAll(".depth-card"));

    // Render dots
    if (dotsContainer) {
      dotsContainer.innerHTML = "";
      CATEGORIES.forEach((cat, idx) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "depth-dot";
        dot.setAttribute("aria-label", `Go to ${cat.label}`);
        dot.dataset.index = idx;
        dot.addEventListener("click", () => {
          goToIndex(idx, true);
        });
        dotsContainer.appendChild(dot);
      });
    }

    const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll(".depth-dot")) : [];

    function updateLayout() {
      cards.forEach((card, idx) => {
        // Compute circular offset d in range -5..5
        let d = (idx - activeIndex) % total;
        if (d > Math.floor(total / 2)) d -= total;
        if (d < -Math.floor(total / 2)) d += total;

        const abs = Math.abs(d);
        const tx = d * 230;
        const tz = -abs * 130;
        const ry = -d * 16;
        const scale = Math.max(0.2, 1 - abs * 0.06);

        let opacity = 0;
        if (abs === 0) opacity = 1;
        else if (abs === 1) opacity = 0.95;
        else if (abs === 2) opacity = 0.75;
        else if (abs === 3) opacity = 0.45;

        const brightness = Math.max(0.1, 1 - abs * 0.18);
        const zIndex = 100 - abs;

        card.style.transform = `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) scale(${scale})`;
        card.style.opacity = opacity;
        card.style.zIndex = zIndex;
        card.style.filter = `brightness(${brightness})`;
        card.style.pointerEvents = abs > 3 ? "none" : "auto";

        if (abs === 0) {
          card.classList.add("is-active");
          card.setAttribute("tabindex", "0");
        } else {
          card.classList.remove("is-active");
          card.setAttribute("tabindex", "-1");
        }
      });

      // Update dots
      dots.forEach((dot, idx) => {
        if (idx === activeIndex) {
          dot.classList.add("is-active");
          dot.setAttribute("aria-current", "true");
        } else {
          dot.classList.remove("is-active");
          dot.removeAttribute("aria-current");
        }
      });
    }

    function goToIndex(newIndex, isUserAction = false) {
      activeIndex = (newIndex + total) % total;
      updateLayout();

      if (isUserAction && announcer) {
        const currentCat = CATEGORIES[activeIndex];
        announcer.textContent = `${currentCat.label}, ${activeIndex + 1} of ${total}`;
      }

      if (isUserAction) {
        scheduleResume();
      }
    }

    // Auto advance timer
    function shouldAutoAdvance() {
      if (reducedMotion || isUserPaused || isHovered || isFocused || isDragging || !isIntersecting) {
        return false;
      }
      if (document.visibilityState === "hidden") {
        return false;
      }
      return true;
    }

    function startAutoAdvance() {
      stopAutoAdvance();
      if (reducedMotion) return;
      autoTimer = setInterval(() => {
        if (shouldAutoAdvance()) {
          goToIndex(activeIndex + 1, false);
        }
      }, 3500);
    }

    function stopAutoAdvance() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    function scheduleResume() {
      if (resumeTimeout) clearTimeout(resumeTimeout);
      if (isUserPaused) return;
      resumeTimeout = setTimeout(() => {
        startAutoAdvance();
      }, 3000);
    }

    // Nav buttons
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        goToIndex(activeIndex - 1, true);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        goToIndex(activeIndex + 1, true);
      });
    }

    // Pause button
    if (pauseBtn) {
      pauseBtn.addEventListener("click", () => {
        isUserPaused = !isUserPaused;
        pauseBtn.setAttribute("aria-pressed", isUserPaused ? "true" : "false");
        pauseBtn.setAttribute("aria-label", isUserPaused ? "Play auto-advance" : "Pause auto-advance");
        pauseBtn.innerHTML = isUserPaused ? icon("play", { size: 18 }) : icon("pause", { size: 18 });
        if (isUserPaused) {
          stopAutoAdvance();
        } else {
          startAutoAdvance();
        }
      });
    }

    // Keyboard navigation
    rootEl.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToIndex(activeIndex - 1, true);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToIndex(activeIndex + 1, true);
      } else if (e.key === "Home") {
        e.preventDefault();
        goToIndex(0, true);
      } else if (e.key === "End") {
        e.preventDefault();
        goToIndex(total - 1, true);
      }
    });

    // Card click: clicking non-active card centers it; clicking active card follows link
    cards.forEach((card) => {
      card.addEventListener("click", (e) => {
        if (hasDragged) {
          e.preventDefault();
          return;
        }
        const idx = parseInt(card.dataset.index, 10);
        if (idx !== activeIndex) {
          e.preventDefault();
          goToIndex(idx, true);
        }
      });
    });

    // Pointer Drag / Swipe on stage
    stage.addEventListener("pointerdown", (e) => {
      // Don't drag on right-click
      if (e.button !== 0) return;
      isDragging = true;
      hasDragged = false;
      dragStartX = e.clientX;
      dragDeltaX = 0;
      stage.setPointerCapture(e.pointerId);
      stopAutoAdvance();
    });

    stage.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      dragDeltaX = e.clientX - dragStartX;
      if (Math.abs(dragDeltaX) > 10) {
        hasDragged = true;
      }
      if (Math.abs(dragDeltaX) >= 90) {
        if (dragDeltaX > 0) {
          goToIndex(activeIndex - 1, true);
        } else {
          goToIndex(activeIndex + 1, true);
        }
        dragStartX = e.clientX;
        dragDeltaX = 0;
      }
    });

    function endDrag(e) {
      if (!isDragging) return;
      isDragging = false;
      try {
        stage.releasePointerCapture(e.pointerId);
      } catch (_) {}
      setTimeout(() => {
        hasDragged = false;
      }, 50);
      scheduleResume();
    }

    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);

    // Hover & focus pauses
    rootEl.addEventListener("mouseenter", () => {
      isHovered = true;
    });

    rootEl.addEventListener("mouseleave", () => {
      isHovered = false;
      scheduleResume();
    });

    rootEl.addEventListener("focusin", () => {
      isFocused = true;
    });

    rootEl.addEventListener("focusout", (e) => {
      if (!rootEl.contains(e.relatedTarget)) {
        isFocused = false;
        scheduleResume();
      }
    });

    // Page visibility
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        stopAutoAdvance();
      } else {
        startAutoAdvance();
      }
    });

    // IntersectionObserver (at least 40% visible)
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isIntersecting = entry.intersectionRatio >= 0.4;
          });
        },
        { threshold: [0, 0.4, 1] }
      );
      observer.observe(rootEl);
    }

    // Initial layout & start
    updateLayout();
    startAutoAdvance();
  }

  window.initDepthCarousel = initDepthCarousel;
})();
