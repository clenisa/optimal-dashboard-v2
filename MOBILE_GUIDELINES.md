# Mobile & Responsive Guidelines

Optimal Dashboard V2 maintains a desktop-first metaphor but now includes targeted mobile enhancements for key workflows. Use the following guidelines when extending responsive behaviour.

## Global Principles

- **Wrap, don’t truncate**: Header and menu controls rely on `flex-wrap` and `gap` utilities instead of fixed widths. Avoid `space-x-*` on control rows that need to collapse on smaller screens.
- **Tokenised spacing**: Leverage `SPACING_TOKENS.container/card/compact` to maintain comfortable padding across breakpoints without ad-hoc `p-*` values.
- **Sticky essentials**: For data tables, keep identifying columns sticky (`position: sticky`) and ensure backgrounds match the underlying surface token.

## Component Highlights

### AI Chat Console
- Mobile history access shifts into a left-side `Sheet`; avoid reintroducing conditional renders that remove the component entirely.
- Header action group orders: History (mobile-only), Pricing dialog, New Chat. Buttons wrap gracefully at `sm` breakpoint—respect the existing order when adding new actions.
- Message list padding is governed by `SPACING_TOKENS.card`; adjust that token if global spacing changes are required.

### Category Matrix
- Desktop: Table sits inside a `relative` wrapper with gradient scroll indicators and a sticky first column.
- Mobile: Falls back to card layout (`md:hidden`) with per-period breakdowns. When adding new metrics, update both table and card representations in lockstep.
- Sorting: `aria-sort` and `aria-pressed` states must stay in sync across breakpoints.

### CSV Dropzones
- Containers now stretch to `w-full` and use tokens for padding. When embedding inside grids, keep them inside a `gap-*` wrapper rather than hard-coded margins.
- Limit messaging and file count copy (`{fileCount}/{limit}`) should wrap, not shrink—prefer `text-sm` / `text-xs` combos.

### Menu Bar
- Right-side controls adopt `flex-wrap` to prevent overlap. When adding items, prefer icon-only buttons with `AccessibleButton` to preserve space.
- Avoid reintroducing custom fonts; rely on typography tokens and default system fonts for clarity at smaller sizes.

## Testing Checklist

- **Viewport widths**: Validate at `375px`, `768px`, `1024px`, and `1280px`.
- **Touch targets**: Ensure interactive elements maintain 44px minimum tap height (`Button` variants already comply).
- **Landscape orientation**: Mobile cards (Category Matrix) and CSV dropzones should remain legible when width exceeds height.
- **System UI**: Inspect overlay components (Sheet, Dialog) to ensure scroll locking works and close buttons remain accessible.

Document any additional responsive patterns here as new apps are introduced to the desktop shell.***
