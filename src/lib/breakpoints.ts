/**
 * Palora Responsive Breakpoint Constants
 * Mirrors documented constants in src/styles/tokens.css
 */
export const BREAKPOINTS = {
  /** Small phone: 320px - 479px */
  SMALL_PHONE_MIN: 320,
  /** Large phone: 480px - 767px */
  LARGE_PHONE_MIN: 480,
  /** Tablet: 768px - 1023px */
  TABLET_MIN: 768,
  /** Laptop: 1024px - 1919px (LOCKED) */
  LAPTOP_MIN: 1024,
  /** Large desktop: 1920px and up */
  LARGE_MIN: 1920,
  /** Max content width for 1920px+ screens */
  LARGE_CONTENT_MAX_WIDTH: 1680,
} as const;

export const MEDIA_QUERIES = {
  SMALL_PHONE: '(max-width: 479.98px)',
  PHONE: '(max-width: 767.98px)',
  TABLET_AND_BELOW: '(max-width: 1023.98px)',
  PHONE_LANDSCAPE: '(max-height: 500px) and (orientation: landscape)',
  LARGE_SCREEN: '(min-width: 1920px)',
  TOUCH_DEVICE: '(hover: none) and (pointer: coarse)',
} as const;
