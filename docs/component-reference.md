# Component Reference & Styling Notes

This document captures the primary UI components touched in the latest refresh, their critical props, and styling conventions that align them with the shared design system tokens.

## CreditsManager (`components/credits-manager.tsx`)
- **Props/Dependencies**: Driven entirely by `useCreditsManager`; no external props.
- **States**: Uses `SURFACE_TOKENS.elevated` for the balance card, `TYPOGRAPHY_TOKENS` for headings, and `LoadingSkeleton` to cover credit fetch delays.
- **Error Handling**: Alerts include `aria-live="assertive"` and a retry button calling the hook’s `reload()` helper—never fall back to `window.location.reload()`.
- **Success Messaging**: Routed through `Alert` with `aria-live="polite"`; fades automatically via hook timers.

## AIChatConsole (`components/ai-chat-console.tsx`)
- **Key Props**: Consumes the `useAiChatConsole` hook; no external props.
- **Layout**: Main container uses `SURFACE_TOKENS.primary` with rounded borders; provider header sticks while the message list scrolls.
- **Interactions**:
  - `AccessibleButton` wraps icon-only actions (voice toggle, send, history sheet button) to ensure aria labelling.
  - `Sheet` component drives the mobile chat history drawer; `Dialog` exposes pricing information.
  - `startNewConversation` clears the message buffer; `handleNewChat` focuses the input after resets.
- **Pricing Table**: `AIChatPricingTable` compares provider models, leveraging `SPACING_TOKENS.card` and recommendation copy derived from model metadata.

## TransactionManager (`components/transaction-manager.tsx`)
- **State Management**: Pagination and filter state kept locally; financial data fetched via `useFinancialData`.
- **Loading**: `LoadingSkeleton` replaces summary and table contents during API fetches while controls disable.
- **Accessibility**:
  - Pagination arrows gain `aria-label` annotations.
  - Status copy runs with `aria-live="polite"` to announce pagination and total count changes.
  - Errors render as destructive `Alert` blocks with retry hooks instead of static text.
- **Styling**: Cards inherit `SURFACE_TOKENS.primary` and `SPACING_TOKENS.card/compact` for consistent density.

## CategoryMatrix (`components/category-matrix.tsx`)
- **Sorting**: Column headers use `aria-sort` and `aria-pressed` to communicate current ordering.
- **Responsiveness**:
  - Desktop table sticks the `Category` column and adds gradient scroll indicators.
  - Mobile view renders per-category cards using `SPACING_TOKENS.compact`.
- **Error/Loading**: Both states share the standard `Alert` + `LoadingSkeleton` patterns with a retry path via `useFinancialData.reload`.

## VolumeControl (`components/volume-control.tsx`)
- **Behaviour**: Internal state tracks `volume`, `isMuted`, `selectedDevice`, and `isSettingsOpen`.
- **UI Elements**:
  - Dropdown trigger now references hover tokens rather than hard-coded hex values.
  - Settings modal (`Dialog`) surfaces device selection, presets, and keyboard shortcuts.
  - Global `Ctrl/⌘ + M` handler toggles mute; update logic is isolated in `applyVolume`/`toggleMute`.

## CSV Dropzones (`components/csv-parser/upload-zone.tsx`, `components/csv-combiner/dropzone.tsx`)
- **Keyboard Support**: Both respond to `Enter`/`Space` by triggering the hidden file input through refs; `role="button"` + `tabIndex=0` make them focusable.
- **ARIA**: Live regions announce status updates; `aria-busy` reflects validation state, and `aria-disabled` blocks interaction when limit reached.
- **Styling**: Dropzones now stretch to `w-full` and use shared focus rings for consistency with the design system tokens.
