import type React from "react"
import { Card } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"

interface DashboardStatsProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description: string
  trend: "up" | "down" | "neutral"
  color?: "blue" | "red" | "orange" | "green"
}

export function DashboardStats({ title, value, icon, description, trend, color = "blue" }: DashboardStatsProps) {
  const colorVariants = {
    blue: {
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
      icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      border: "border-blue-500/20",
      shadow: "shadow-blue-500/10",
    },
    red: {
      gradient: "from-red-500/10 via-red-500/5 to-transparent",
      icon: "bg-red-500/10 text-red-600 dark:text-red-400",
      border: "border-red-500/20",
      shadow: "shadow-red-500/10",
    },
    orange: {
      gradient: "from-orange-500/10 via-orange-500/5 to-transparent",
      icon: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
      border: "border-orange-500/20",
      shadow: "shadow-orange-500/10",
    },
    green: {
      gradient: "from-green-500/10 via-green-500/5 to-transparent",
      icon: "bg-green-500/10 text-green-600 dark:text-green-400",
      border: "border-green-500/20",
      shadow: "shadow-green-500/10",
    },
  }

  const trendIcon = {
    up: <ArrowUp className="h-4 w-4 text-green-500" />,
    down: <ArrowDown className="h-4 w-4 text-red-500" />,
    neutral: <Minus className="h-4 w-4 text-muted-foreground" />,
  }

  const variant = colorVariants[color]

  return (
    <Card
      className={`relative overflow-hidden p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:border-border transition-all duration-300 hover:shadow-xl ${variant.shadow} group`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${variant.gradient} opacity-50`} />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-bold text-foreground tracking-tight">{value}</p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground font-medium">{description}</p>
            {trendIcon[trend]}
          </div>
        </div>
        <div
          className={`p-3 rounded-xl ${variant.icon} shadow-lg transition-transform duration-300 group-hover:scale-110`}
        >
          {icon}
        </div>
      </div>
    </Card>
  )
}
