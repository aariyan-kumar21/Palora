/**
 * Palora Categories Slider & Data
 * Easily configurable category list and interactive horizontal slider
 */

// -----------------------------------------------------------------------------
// 1. Category Data (Client Editable)
// -----------------------------------------------------------------------------
const CATEGORIES = [
  { slug: "keychains", label: "Keychains", icon: "gift" },
  { slug: "home-decor", label: "Home decor", icon: "gift" },
  { slug: "birthdays", label: "Birthdays", icon: "cake" },
  { slug: "anniversaries", label: "Anniversaries", icon: "hearts" },
  { slug: "just-because", label: "Just because", icon: "flower" },
  { slug: "bouquets-flowers", label: "Bouquets & flowers", icon: "gift" },
  { slug: "crochet-items", label: "Crochet items", icon: "gift" },
  { slug: "designed-frames", label: "Designed frames", icon: "gift" },
  { slug: "letters-cards", label: "Letters and cards", icon: "gift" },
  { slug: "hampers", label: "Hampers", icon: "gift" },
  { slug: "festivals", label: "Festivals", icon: "lotus" }
];

// -----------------------------------------------------------------------------
// 2. Icon Definitions (Swappable line SVG icons)
// -----------------------------------------------------------------------------
const CATEGORY_ICONS = {
  cake: `
    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"></path>
    <path d="M4 16s2-1.5 4 0 4 0 4 0 2-1.5 4 0 4 0 4 0"></path>
    <path d="M2 21h20"></path>
    <path d="M7 8v3"></path>
    <path d="M12 8v3"></path>
    <path d="M17 8v3"></path>
    <circle cx="7" cy="4" r="1" fill="#FFF7F2"></circle>
    <circle cx="12" cy="4" r="1" fill="#FFF7F2"></circle>
    <circle cx="17" cy="4" r="1" fill="#FFF7F2"></circle>
  `,
  hearts: `
    <path d="M16.5 13.5c1.8-1.8 3.5-3.3 3.5-5.5a4 4 0 0 0-6.8-2.8L12 6.4l-1.2-1.2A4 4 0 0 0 4 8c0 2.2 1.7 3.7 3.5 5.5l4.5 4.5 1.5-1.5"></path>
    <path d="M12.5 18.5l4-4c1.5-1.5 2.5-2.8 2.5-4.5a3 3 0 0 0-5.1-2.1L13 8.8"></path>
  `,
  lotus: `
    <path d="M12 4c-1 3-2 6-2 9a4 4 0 0 0 4 0c0-3-1-6-2-9z"></path>
    <path d="M10 13c-2-2-5-3-7-1 0 4 3 6 7 6"></path>
    <path d="M14 13c2-2 5-3 7-1 0 4-3 6-7 6"></path>
    <path d="M6 18c2 2 4 2 6 2s4 0 6-2"></path>
  `,
  flower: `
    <circle cx="12" cy="12" r="2.5"></circle>
    <path d="M12 9.5a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 0 0 5z"></path>
    <path d="M14.38 10.27a2.5 2.5 0 0 0 4.76-1.55 2.5 2.5 0 0 0-4.76 1.55z"></path>
    <path d="M13.47 13.98a2.5 2.5 0 0 0 2.94 4.05 2.5 2.5 0 0 0-2.94-4.05z"></path>
    <path d="M10.53 13.98a2.5 2.5 0 0 0-2.94 4.05 2.5 2.5 0 0 0 2.94-4.05z"></path>
    <path d="M9.62 10.27a2.5 2.5 0 0 0-4.76-1.55 2.5 2.5 0 0 0 4.76 1.55z"></path>
  `,
  gift: `
    <rect x="3" y="8" width="18" height="4" rx="1"></rect>
    <path d="M12 8v13"></path>
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path>
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path>
  `
};

// -----------------------------------------------------------------------------
// 3. Render Category Cards
// -----------------------------------------------------------------------------
function renderCategoryCards() {
  const track = document.getElementById('categorySliderTrack');
  if (!track) return;

  const html = CATEGORIES.map((cat, index) => {
    const toneNum = (index % 5) + 1;
    const iconSvgContent = CATEGORY_ICONS[cat.icon] || CATEGORY_ICONS.gift;

    return `
      <a class="category-card category-card--tone-${toneNum}" href="#category-${cat.slug}" data-category="${cat.slug}" draggable="false">
        <svg class="category-card__watermark" width="68" height="68" viewBox="0 0 24 24" fill="none" stroke="#FFF7F2" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          ${iconSvgContent}
        </svg>
        <img class="category-card__img" src="assets/categories/${cat.slug}.jpg" alt="" loading="lazy" draggable="false" onerror="this.remove()">
        <div class="category-card__strip">
          <svg class="category-icon-svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#FFF7F2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            ${iconSvgContent}
          </svg>
          <span class="category-card__label">${cat.label}</span>
        </div>
      </a>
    `;
  }).join('');

  track.innerHTML = html;
}

// -----------------------------------------------------------------------------
// 4. Shared Generic Slider Function
// -----------------------------------------------------------------------------
/**
 * Generic horizontal slider initializer for both Category and Bestsellers sliders
 * @param {HTMLElement} rootEl - The outer slider container (.slider, .bestsellers__slider)
 * @param {Object} options - Configuration options { step: 3, cardSelector: '.category-card' }
 */
function initSlider(rootEl, options = {}) {
  if (!rootEl) return null;
  const track = rootEl.querySelector('.slider__track, .bestsellers__track') || rootEl.querySelector('[class*="track"]');
  const prevBtn = rootEl.querySelector('.slider__btn--prev, .bestseller-nav-btn--prev') || rootEl.querySelector('[class*="--prev"]');
  const nextBtn = rootEl.querySelector('.slider__btn--next, .bestseller-nav-btn--next') || rootEl.querySelector('[class*="--next"]');
  const step = options.step || 2;
  const cardSelector = options.cardSelector || ':scope > *';

  if (!track) return null;

  function updateButtons() {
    if (!prevBtn || !nextBtn) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    const sl = track.scrollLeft;
    const atStart = sl <= 2;
    const atEnd = sl >= maxScroll - 2;

    prevBtn.disabled = atStart;
    prevBtn.setAttribute('aria-disabled', atStart ? 'true' : 'false');

    nextBtn.disabled = atEnd;
    nextBtn.setAttribute('aria-disabled', atEnd ? 'true' : 'false');
  }

  let ticking = false;
  track.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateButtons();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateButtons, { passive: true });

  function getScrollAmount() {
    const card = cardSelector ? track.querySelector(cardSelector) : track.firstElementChild;
    const cardWidth = card ? card.getBoundingClientRect().width : 280;
    const gap = parseFloat(window.getComputedStyle(track).gap) || 12;
    return (cardWidth + gap) * step;
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      track.scrollBy({ left: -getScrollAmount(), behavior: isReduced ? 'auto' : 'smooth' });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      track.scrollBy({ left: getScrollAmount(), behavior: isReduced ? 'auto' : 'smooth' });
    });
  }

  let isPointerDown = false;
  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;
  let draggedPointerId = null;
  let dragThresholdPassed = false;

  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    isPointerDown = true;
    isDragging = false;
    dragThresholdPassed = false;
    startX = e.clientX;
    startScrollLeft = track.scrollLeft;
    draggedPointerId = e.pointerId;
  });

  window.addEventListener('pointermove', (e) => {
    if (!isPointerDown) return;
    const dx = e.clientX - startX;

    if (!isDragging && Math.abs(dx) > 5) {
      isDragging = true;
      dragThresholdPassed = true;
      track.classList.add('is-dragging');
      try {
        track.setPointerCapture(draggedPointerId);
      } catch (_) {}
    }

    if (isDragging) {
      track.scrollLeft = startScrollLeft - dx;
    }
  });

  function handlePointerUp() {
    if (!isPointerDown) return;
    isPointerDown = false;
    if (isDragging) {
      track.classList.remove('is-dragging');
      if (draggedPointerId !== null) {
        try {
          track.releasePointerCapture(draggedPointerId);
        } catch (_) {}
      }
      setTimeout(() => {
        isDragging = false;
        dragThresholdPassed = false;
      }, 50);
    }
    draggedPointerId = null;
  }

  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('pointercancel', handlePointerUp);

  // Capture phase click handler: suppress click if drag happened
  track.addEventListener('click', (e) => {
    if (isDragging || dragThresholdPassed) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (options.onCardClick) {
      options.onCardClick(e);
    }
  }, true);

  updateButtons();

  return {
    updateButtons,
    track
  };
}
window.initSlider = initSlider;

// -----------------------------------------------------------------------------
// 5. Category Slider Specific Setup
// -----------------------------------------------------------------------------
function initCategorySlider() {
  const slider = document.querySelector('.slider');
  if (!slider) return;

  initSlider(slider, {
    step: 3,
    cardSelector: '.category-card',
    onCardClick: (e) => {
      const card = e.target.closest('.category-card');
      if (card) {
        const slug = card.getAttribute('data-category');
        if (slug) {
          document.dispatchEvent(new CustomEvent('categoryselect', { detail: { slug } }));
        }
      }
    }
  });
}

// -----------------------------------------------------------------------------
// 6. Lifecycle Initialization
// -----------------------------------------------------------------------------
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    renderCategoryCards();
    initCategorySlider();
  });
} else {
  renderCategoryCards();
  initCategorySlider();
}
