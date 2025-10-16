import * as React from 'react'
import { Button, type ButtonProps } from '@/components/ui/button'

interface AccessibleButtonProps extends ButtonProps {
  ariaLabel: string
  ariaPressed?: boolean
  ariaExpanded?: boolean
}

export function AccessibleButton({
  ariaLabel,
  ariaPressed,
  ariaExpanded,
  children,
  ...props
}: AccessibleButtonProps) {
  return (
    <Button
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      {...props}
    >
      {children}
    </Button>
  )
}
