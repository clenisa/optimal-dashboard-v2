# Design System Reference

The dashboard now standardises styling primitives through a lightweight token module (`lib/design-tokens.ts`). This document explains how to apply those tokens and which supporting utilities keep the UI consistent.

## Surface Tokens (`SURFACE_TOKENS`)

| Token | Classes | Usage |
| --- | --- | --- |
| `primary` | `bg-card border-border/60` | Default card/container background. Pair with `border` and rounded corners. |
| `secondary` | `bg-muted/50 border-border/40` | Muted backgrounds for filters, secondary panels, or passive states. |
| `elevated` | `bg-card shadow-sm border-border/60` | Raised cards such as the Credits dashboard header or AI chat header. Always combine with `border`. |
| `interactive` | `hover:bg-accent hover:text-accent-foreground` | Base hover token for clickable surfaces; compose with button or menu classes. |

**Implementation Tips**
- Always append a base `border` or `rounded-*` class when applying surface tokens—they only encode color utilities.
- For sticky table cells, add a matching background (`bg-card`) to avoid transparency artefacts.

## Typography Tokens (`TYPOGRAPHY_TOKENS`)

| Token | Classes | Common Usage |
| --- | --- | --- |
| `heading` | `text-lg font-semibold tracking-tight` | Section titles inside cards or windows. |
| `subheading` | `text-sm font-medium text-muted-foreground` | Supporting copy, e.g., view selectors or metadata. |
| `body` | `text-sm text-foreground` | Default paragraph text. |
| `caption` | `text-xs text-muted-foreground` | Microcopy, helper text, pagination summaries. |

**Guidelines**
- Compose tokens with utility modifiers (e.g., `uppercase`, `tracking-wide`) for specific contexts.
- Use `caption` for aria-live status updates to keep the hierarchy consistent.

## Spacing Tokens (`SPACING_TOKENS`)

| Token | Classes | Notes |
| --- | --- | --- |
| `container` | `p-4 sm:p-6` | View-level padding (Transaction manager shell). |
| `card` | `p-3 sm:p-4` | Card content padding. Layer with custom `sm:p-6` when a denser layout is required. |
| `compact` | `p-2 sm:p-3` | Filter bars, compact toolbars, or nested containers. |
| `section` | `space-y-4` | Vertical rhythm inside cards or panels. Combine with responsive overrides as needed. |

## Loading Skeletons

`components/ui/loading-skeleton.tsx` centralises shimmer placeholders:
- `lines`: Number of skeleton rows (default `3`).
- `widths`: Optional array of width percentages per line (falls back to a repeating pattern).
- `lineClassName`: Override height or border radius (e.g., `h-8` for headline values).

Used by Credits, Transactions, Category Matrix, and AI chat history to prevent zero-value flashes.

## Applying Tokens in Practice

- **Credits Manager**: `SURFACE_TOKENS.elevated` for the balance card, `TYPOGRAPHY_TOKENS.caption` for status copy, `LoadingSkeleton` for numeric placeholders.
- **AI Chat Console**: Container uses `SURFACE_TOKENS.primary`; header uses `heading` typography; card/body spacing aligned with `SPACING_TOKENS.card`.
- **Category Matrix**: Table wrapper uses `section` spacing; mobile cards inherit `compact` padding and `heading` typography for titles.
- **Menu Bar**: Relies on `TYPOGRAPHY_TOKENS.caption` with explicit overrides (`text-foreground`) to keep top-level navigation legible.

Refer to `docs/component-reference.md` for component-specific examples tied to these tokens.***
