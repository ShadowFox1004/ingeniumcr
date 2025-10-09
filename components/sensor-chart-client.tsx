"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Activity, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SensorChartClientProps {
  chartData: any[]
  sensorNames: string[]
}

const sensorColors = [
  { color: "#3b82f6", name: "blue" },
  { color: "#10b981", name: "green" },
  { color: "#f59e0b", name: "amber" },
  { color: "#ef4444", name: "red" },
  { color: "#8b5cf6", name: "purple" },
  { color: "#ec4899", name: "pink" },
]

const CustomLegend = ({ sensorNames }: { sensorNames: string[] }) => {
  return (
    <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
      {sensorNames.slice(0, 6).map((name, index) => (
        <div
          key={name}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
        >
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sensorColors[index].color }} />
          <span className="text-sm font-medium text-foreground">{name}</span>
        </div>
      ))}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4">
        <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs text-muted-foreground">{entry.name}</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{entry.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export function SensorChartClient({ chartData, sensorNames }: SensorChartClientProps) {
  return (
    <Card className="p-6 bg-card/95 backdrop-blur-sm border-border shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Monitoreo de Sensores en Tiempo Real</h3>
            <p className="text-sm text-muted-foreground">Últimas 20 lecturas</p>
          </div>
        </div>
        <Badge variant="outline" className="flex items-center gap-1.5">
          <TrendingUp className="h-3 w-3" />
          <span>En vivo</span>
        </Badge>
      </div>

      <div className="h-80 mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              {sensorColors.map((sensor, index) => (
                <linearGradient key={sensor.name} id={`gradient-${sensor.name}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={sensor.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={sensor.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} tickLine={false} />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {sensorNames.slice(0, 6).map((name, index) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={sensorColors[index].color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <CustomLegend sensorNames={sensorNames} />
    </Card>
  )
}
