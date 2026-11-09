# Technical Requirements Document (TRD): Handmade Gifting E-commerce Platform

## 1. System Overview
A purely client-side, mobile-first web application utilizing local state management for the cart and the WhatsApp API for checkout handoff. 

## 2. Technology Stack
*   **Frontend HTML:** Semantic HTML5. Must include `<meta name="viewport" content="width=device-width, initial-scale=1.0">` to ensure proper mobile scaling.
*   **Frontend CSS:** Vanilla CSS3. **Must employ a Mobile-First architecture using `min-width` media queries.** Flexbox and CSS Grid are mandatory for fluid responsiveness.
*   **Frontend JavaScript:** Vanilla JavaScript (ES6+) for DOM manipulation and state management.

## 3. Responsive Breakpoints & CSS Architecture
To ensure seamless viewing across all devices, the CSS must be structured with base styles applying to mobile, followed by the following explicit breakpoints:

*   **Base (Mobile Phones):** `0px` to `480px` (100% width blocks, 1-column grids, stacked flex-items, touch-friendly `padding`).
*   **Tablet (Landscape/Portrait):** `@media (min-width: 481px)` and `@media (min-width: 768px)` (Introduce 2-column grids, adjust hero layouts).
*   **Laptop (Small Screens):** `@media (min-width: 1024px)` (Introduce 3-to-4 column grids, expand navigation).
*   **Large Desktop:** `@media (min-width: 1200px)` (Max-width containers to prevent UI from stretching too wide, larger typography).

## 4. Touch & Accessibility Standards (Mobile Focus)
*   **Touch Targets:** All interactive elements (buttons, links, inputs, hamburger menu) must have a minimum interactive area of `44px by 44px` to accommodate finger tapping.
*   **Input Zoom Prevention:** CSS `font-size` for all `<input>` elements must be at least `16px` to prevent iOS Safari from auto-zooming when the user focuses on the personalization field.
*   **Fluid Typography:** Use `rem` and `em` units for font sizes and spacing to scale proportionally based on device settings.

## 5. Data Flow & UI Component Specs
*   **State Management:** `let cart = [];` manages selections.
*   **Checkout Trigger:** Iterate through `cart`, format string, `encodeURIComponent()`, and execute `window.open(url, '_blank')`.
*   **Cart UI (Responsive):** Use CSS `transform: translateX/Y` for smooth, hardware-accelerated animations when opening the cart modal/drawer on mobile devices.