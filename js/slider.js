/**
 * Palora Shared Horizontal Slider Logic
 * Used by horizontal card carousels (e.g. Bestselling Collection).
 */

function initSlider(trackEl, prevBtn, nextBtn) {
  if (!trackEl) return null;

  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let hasDragged = false;

  function updateButtons() {
    if (!prevBtn || !nextBtn) return;
    const maxScroll = trackEl.scrollWidth - trackEl.clientWidth - 2;
    prevBtn.disabled = trackEl.scrollLeft <= 4;
    nextBtn.disabled = trackEl.scrollLeft >= maxScroll;
  }

  function scrollByCard(direction) {
    const card = trackEl.querySelector(".product-card, .slider-card");
    const gap = 20;
    const cardWidth = card ? card.getBoundingClientRect().width : 300;
    const scrollAmount = (cardWidth + gap) * direction;
    trackEl.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => scrollByCard(-1));
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => scrollByCard(1));
  }

  // Pointer drag/swipe gestures
  trackEl.addEventListener("pointerdown", (e) => {
    isDown = true;
    hasDragged = false;
    startX = e.pageX - trackEl.offsetLeft;
    scrollLeft = trackEl.scrollLeft;
    trackEl.setPointerCapture(e.pointerId);
  });

  trackEl.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    const x = e.pageX - trackEl.offsetLeft;
    const walk = x - startX;
    if (Math.abs(walk) > 6) {
      hasDragged = true;
      trackEl.classList.add("is-dragging");
    }
    trackEl.scrollLeft = scrollLeft - walk;
  });

  function endDrag(e) {
    if (!isDown) return;
    isDown = false;
    setTimeout(() => {
      trackEl.classList.remove("is-dragging");
    }, 50);
    try {
      trackEl.releasePointerCapture(e.pointerId);
    } catch (_) {}
  }

  trackEl.addEventListener("pointerup", endDrag);
  trackEl.addEventListener("pointercancel", endDrag);

  // Prevent link click when dragged
  trackEl.addEventListener("click", (e) => {
    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  trackEl.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("resize", updateButtons, { passive: true });
  setTimeout(updateButtons, 100);

  return { updateButtons, scrollByCard };
}

window.initSlider = initSlider;
