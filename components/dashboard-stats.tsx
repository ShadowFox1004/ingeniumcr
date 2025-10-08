import type React from "react"
import { Card } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"

interface DashboardStatsProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description: string
  trend: "up" | "down" | "neutral"
}

export function DashboardStats({ title, value, icon, description, trend }: DashboardStatsProps) {
  const trendIcon = {
    up: <ArrowUp className="h-4 w-4 text-green-500" />,
    down: <ArrowDown className="h-4 w-4 text-red-500" />,
    neutral: <Minus className="h-4 w-4 text-muted-foreground" />,
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="p-2 bg-secondary rounded-lg text-secondary-foreground">{icon}</div>
          {trendIcon[trend]}
        </div>
      </div>
    </Card>
  )
}
