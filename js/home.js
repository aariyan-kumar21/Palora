/**
 * Palora Homepage Logic (Laptop View Only)
 * Initialises depth carousel, benefits bar sizing, and page-specific interactions.
 */

(function () {
  function updateBenefitsHeight() {
    const benefits = document.getElementById("benefits");
    if (benefits) {
      document.documentElement.style.setProperty("--benefits-h", `${benefits.offsetHeight}px`);
    }
  }

  function initHome() {
    updateBenefitsHeight();
    window.addEventListener("resize", updateBenefitsHeight, { passive: true });

    // Initialize 3D Depth Carousel for categories
    const depthEl = document.querySelector(".depth");
    if (depthEl && typeof initDepthCarousel === "function") {
      initDepthCarousel(depthEl);
    }

    // Ensure Bestsellers slider is mounted
    if (typeof mountBestsellersSection === "function") {
      mountBestsellersSection();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHome);
  } else {
    initHome();
  }
})();
