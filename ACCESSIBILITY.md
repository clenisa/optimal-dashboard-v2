# Accessibility Playbook

The refresh introduces a set of reusable patterns to improve keyboard, screen-reader, and low-vision support across the dashboard. Follow the guidance below when extending the UI.

## Core Utilities

- **`AccessibleButton`** (`components/ui/accessible-button.tsx`) wraps the base button and enforces `aria-label`, `aria-pressed`, and `aria-expanded` where applicable. Use it for icon-only buttons (send, microphone, history toggle, pricing dialog).
- **`LoadingSkeleton`** provides visual placeholders without relying on text; pair with `aria-live` messaging so assistive tech announces completion.
- **Design Tokens** keep contrast ratios consistent—`SURFACE_TOKENS` always use theme-aware colors.

## Interaction Patterns

### Menu Bar
- Top-level items adopt `role="menubar"` with `role="menuitem"` buttons.
- Arrow keys cycle between menus; `Escape` collapses the active menu.
- When a submenu opens, focus moves into the first item and `aria-sort`/`aria-pressed` semantics reflect active states.

### AI Chat Console
- Primary input field exposes `aria-label="Message input"` and disables itself when providers/credits are unavailable.
- Voice toggle communicates status (`ariaLabel` changes with mute state) and global shortcuts (`Ctrl/⌘ + M`) are advertised in the settings dialog.
- History sheet uses Radix `Sheet`; when opened on mobile, focus is trapped until the sheet closes.

### CSV Dropzones
- Both single and multi-file dropzones expose `role="button"` plus `tabIndex=0`.
- Hidden file inputs are triggered via keyboard `Enter`/`Space` and referenced through React refs.
- Status updates (“Validating files…”, “No CSV selected”) are surfaced through `aria-live="polite"` regions. Apply `aria-busy` while processing.

### Transaction Manager & Category Matrix
- Pagination buttons announce their action with `aria-label`.
- Sorting controls include `aria-sort` and `aria-pressed` to expose the current ordering to screen readers.
- Loading states use skeletons instead of blank tables; `aria-live="polite"` on summary copy announces record counts once loaded.

### Alerts & Errors
- `Alert` components already ship with `role="alert"`. Augment them with `aria-live="assertive"` for destructive messages and provide inline retry buttons that call hook-level reload helpers.

## Testing Checklist

- Navigate primary flows (menu bar, AI chat, CSV upload) using only the keyboard.
- Run an automated pass with [axe DevTools](https://www.deque.com/axe/devtools/) focusing on landmarks, color contrast, and interactive roles.
- Verify announcements in VoiceOver/NVDA for:
  - Opening/closing menus and sheets
  - Toggling voice input
  - Upload status changes
  - Table sorting updates
- Screen zoom at 200% should keep layout intact thanks to tokenised spacing and flex-wrap adjustments (menu bar, control clusters).

Keep this document updated whenever you introduce new input methods, focus traps, or ARIA attributes.***
