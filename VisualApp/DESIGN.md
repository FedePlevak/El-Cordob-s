# Design System Document: The Fluid Logistician

## 1. Overview & Creative North Star
**Creative North Star: "The Administrative Kinetic"**
The objective of this design system is to transform dry administrative data into a living, breathing operational flow. We move away from the "static spreadsheet" look toward an **Editorial Logistics** experience. This means high-contrast typography, generous negative space, and a layout that feels mobile-native rather than desktop-shrunk.

The system breaks the "template" look by utilizing **Intentional Asymmetry**. Important status cards may overlap headers, and document previews are treated as hero images rather than small thumbnails. We prioritize "Glanceability"—the ability for a logistics manager to understand the health of their entire operation through color and scale in under three seconds.

---

## 2. Colors: The Operational Semaphore
Our palette is functional but sophisticated, utilizing tonal depth to avoid the "toy-like" appearance of standard bright colors.

### The "No-Line" Rule
**Explicit Instruction:** Traditional 1px borders are strictly prohibited for sectioning. Use background shifts (e.g., a `surface-container-low` section sitting on a `surface` background) to define boundaries. This creates a high-end, seamless feel that mimics modern OS interfaces.

### Semantic Tones (The Semaphore)
*   **Neutral/Pending:** Use `outline-variant` and `surface-container-high`. It should feel "quiet."
*   **Alerts/Observations:** Use `primary-fixed` (Yellow/Amber tones) to draw the eye without creating panic.
*   **Urgent/Overdue:** Use `tertiary` (#960010) and `tertiary-container` (#bc1c21). These are high-authority reds that demand immediate action.
*   **Validated/Ready:** Use `secondary` (#1b6d24) for a vibrant "Go" signal.
*   **In-Progress (Payments/Transits):** Use `primary` (#00488d). This blue represents movement and trust.
*   **Closed/Archived:** Use `on-secondary-fixed-variant` (#005312) for a deep, "settled" green.

### Glass & Gradient Rule
Main CTAs and critical progress bars should use a subtle linear gradient from `primary` to `primary-container`. For floating mobile action buttons, apply a **Glassmorphism** effect: use semi-transparent `surface-container-lowest` (80% opacity) with a 20px backdrop-blur to allow logistics data to peek through the navigation layer.

---

## 3. Typography: Editorial Authority
We use a dual-font strategy to balance character with extreme legibility.

*   **Display & Headlines (Manrope):** A geometric sans-serif that feels modern and authoritative. Use `headline-lg` for daily totals and `headline-sm` for section headers. The wider apertures of Manrope ensure numbers are easy to read at a glance.
*   **Body & Labels (Inter):** The gold standard for mobile legibility. Use `body-md` for logistics details and `label-sm` for metadata (timestamps, IDs). 
*   **Hierarchy:** Always use a 2-step jump in scale to define priority. If a title is `title-lg`, the supporting text should be `body-sm` to create a sophisticated, editorial contrast.

---

## 4. Elevation & Depth: Tonal Layering
Depth is achieved through "stacking" rather than traditional drop shadows.

*   **The Layering Principle:** 
    *   **Base:** `surface` (#f4faff)
    *   **Sectioning:** `surface-container-low` (#e6f6ff)
    *   **Interactive Cards:** `surface-container-lowest` (#ffffff)
*   **Ambient Shadows:** For floating elements (like a photo preview), use a `0px 12px 24px` blur with 6% opacity of the `on-surface` color. It should feel like a soft glow, not a dark smudge.
*   **The "Ghost Border":** If accessibility requires a stroke, use `outline-variant` at 15% opacity. Never use a 100% opaque border.
*   **Glassmorphism:** Navigation bars and sticky headers must use `surface-container-lowest` at 70% opacity with a heavy backdrop-blur. This keeps the user grounded in their current scroll position.

---

## 5. Components: Primatives for Logistics

### Buttons
*   **Primary:** Large (min-height: 56px), `xl` roundedness (0.75rem). Background: `primary` with a subtle gradient to `primary-container`. Text: `on-primary` in `title-sm`.
*   **Secondary:** Ghost-style using `surface-container-high` as a background. No border.

### Input Fields
*   **Mobile-First Fields:** Avoid floating labels that shrink too small. Use `label-md` clearly positioned *above* the input. 
*   **States:** On focus, the background shifts from `surface-container-low` to `surface-container-lowest` with a 2px `primary` "Ghost Border."

### The "Logistics Card"
*   **Rule:** Forbid divider lines. 
*   **Separation:** Use `spacing.4` (1.4rem) of vertical white space and subtle background shifts to separate content blocks. 
*   **Image/Doc Previews:** Documents should take up the full width of the card, using `xl` roundedness on the top corners and `none` on the bottom to "merge" with the data below.

### Status Chips
*   Pill-shaped (`full` roundedness). Use the Semaphore palette. Text should be `label-md` all-caps with 0.05em letter spacing for an "official" look.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use `surface-dim` for inactive or "settled" background states.
*   **Do** prioritize the photo of the "Proof of Delivery" by making it the largest element in a detail view.
*   **Do** use `spacing.20` for bottom padding on scrollable views to ensure the FAB (Floating Action Button) doesn't obscure content.

### Don't:
*   **Don't** use pure black (#000000) for text. Use `on-surface` (#001f2a) to maintain tonal harmony with the blue-tinted backgrounds.
*   **Don't** use 90-degree sharp corners. Everything must have at least `DEFAULT` (0.25rem) rounding to feel approachable.
*   **Don't** use "Alert" colors for non-critical decorative elements. If it's red, it *must* mean something is broken or overdue.

### Accessibility Note:
Ensure that when using the Semaphore colors (Red/Green), you also include a supporting icon or text label (e.g., an "X" or a "Check") to assist users with color-vision deficiency.