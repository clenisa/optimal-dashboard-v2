// Surface tokens to replace inconsistent background + border pairings.
export const SURFACE_TOKENS = {
  primary: 'bg-card border-border/60',
  secondary: 'bg-muted/50 border-border/40',
  elevated: 'bg-card shadow-sm border-border/60',
  interactive: 'hover:bg-accent hover:text-accent-foreground',
}

// Typography scale to normalize headings and body copy hierarchy.
export const TYPOGRAPHY_TOKENS = {
  heading: 'text-lg font-semibold tracking-tight',
  subheading: 'text-sm font-medium text-muted-foreground',
  body: 'text-sm text-foreground',
  caption: 'text-xs text-muted-foreground',
}

// Spacing scale to harmonize container padding and gaps.
export const SPACING_TOKENS = {
  container: 'p-4 sm:p-6',
  card: 'p-3 sm:p-4',
  compact: 'p-2 sm:p-3',
  section: 'space-y-4',
}
