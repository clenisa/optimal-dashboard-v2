import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, TestTube } from "lucide-react"
import type { ThresholdControlProps } from './types'

export function ThresholdControl({ 
  threshold, 
  onThresholdChange, 
  useTestData, 
  onToggleTestData 
}: ThresholdControlProps) {
  
  const getThresholdColor = (value: number) => {
    if (value <= 20) return "text-green-600"
    if (value <= 40) return "text-yellow-600"
    return "text-red-600"
  }

  const getThresholdDescription = (value: number) => {
    if (value <= 20) return "Conservative - Low risk"
    if (value <= 40) return "Moderate - Balanced approach"
    return "Aggressive - Higher risk tolerance"
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Utilization Threshold
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Threshold: <span className={getThresholdColor(threshold)}>{threshold}%</span>
            </span>
            <Badge variant="outline" className="text-xs">
              {getThresholdDescription(threshold)}
            </Badge>
          </div>
          
          <Slider
            value={[threshold]}
            onValueChange={(value) => onThresholdChange(value[0])}
            max={100}
            min={10}
            step={5}
            className="w-full"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>10% (Conservative)</span>
            <span>50% (Moderate)</span>
            <span>100% (Maximum)</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <TestTube className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Data Source</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleTestData}
            className="text-xs"
          >
            {useTestData ? "Use Real Data" : "Use Test Data"}
          </Button>
        </div>
        
        {useTestData && (
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border">
            ⚠️ Currently using test data for demonstration purposes
          </div>
        )}
      </CardContent>
    </Card>
  )
}

