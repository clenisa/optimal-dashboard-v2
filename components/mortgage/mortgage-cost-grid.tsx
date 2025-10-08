"use client"

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { MortgageCostField } from '@/lib/mortgage/types'

interface MortgageCostGridProps {
  includeTaxesAndCosts: boolean
  onIncludeTaxesAndCostsChange: (next: boolean) => void
  fields: MortgageCostField[]
}

export function MortgageCostGrid({
  includeTaxesAndCosts,
  onIncludeTaxesAndCostsChange,
  fields,
}: MortgageCostGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 p-3">
        <Checkbox
          id="includeTaxesAndCosts"
          checked={includeTaxesAndCosts}
          onCheckedChange={(checked) => onIncludeTaxesAndCostsChange(Boolean(checked))}
        />
        <Label htmlFor="includeTaxesAndCosts" className="text-sm font-medium text-foreground">
          Include Taxes & Costs Below
        </Label>
      </div>

      {includeTaxesAndCosts && (
        <div className="space-y-4 rounded-lg border border-border/60 bg-card/70 p-4 shadow-sm">
          {fields.map((field) => (
            <div key={field.inputId} className="grid grid-cols-1 gap-2 md:grid-cols-3 md:items-end">
              <div className="space-y-2">
                <Label htmlFor={field.inputId} className="text-sm text-muted-foreground">
                  {field.label}
                </Label>
                <Input
                  id={field.inputId}
                  type="number"
                  step="0.01"
                  value={field.value}
                  onChange={(event) => field.onValueChange(Number(event.target.value))}
                />
              </div>
              <Select
                value={field.type}
                onValueChange={(value) => field.onTypeChange(value as typeof field.type)}
              >
                <SelectTrigger id={field.selectId}>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">%</SelectItem>
                  <SelectItem value="dollar">$</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
