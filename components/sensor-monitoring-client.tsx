"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { Droplets, Volume2, Wind, GaugeIcon, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SensorReading {
  id: string
  name: string
  value: number
  unit: string
  type: string
  created_at: string
}

interface SensorMonitoringClientProps {
  latestReadings: SensorReading[]
  chartData: any[]
}

// Circular gauge component
function CircularGauge({ value, max, label, unit, color = "#10b981" }: any) {
  const percentage = (value / max) * 100
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  // Determine color based on percentage
  const getColor = () => {
    if (percentage < 33) return "#10b981" // green
    if (percentage < 66) return "#f59e0b" // amber
    return "#ef4444" // red
  }

  const gaugeColor = getColor()

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle cx="64" cy="64" r="45" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" opacity="0.2" />
          {/* Progress circle */}
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke={gaugeColor}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-2">{label}</p>
    </div>
  )
}

// Metric card component
function MetricCard({ icon, label, value, unit, color = "#10b981" }: any) {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border-l-4 hover:bg-card/80 transition-colors"
      style={{ borderColor: color }}
    >
      <div className="p-3 rounded-lg bg-muted/50">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </div>
    </div>
  )
}

// Mini line chart component
function MiniLineChart({ data, color = "#10b981" }: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} animationDuration={1000} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function SensorMonitoringClient({ latestReadings, chartData }: SensorMonitoringClientProps) {
  // Group readings by area (simulated)
  const area1Readings = latestReadings.slice(0, 3)
  const area2Readings = latestReadings.slice(3, 6)

  // Get specific sensor values (simulated)
  const temperature1 = area1Readings[0]?.value || 71.6
  const temperature2 = area2Readings[0]?.value || 74.4
  const humidity = area1Readings[1]?.value || 40.2
  const pressure = area1Readings[2]?.value || 45.8
  const vibration = area2Readings[1]?.value || 0.3

  // Prepare data for mini charts
  const tempData1 = chartData.slice(0, 10).map((d) => ({ value: d.value }))
  const tempData2 = chartData.slice(10, 20).map((d) => ({ value: d.value }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Monitoreo de Sensores - Áreas de Producción</h2>
          <p className="text-sm text-muted-foreground">Datos en tiempo real de todas las áreas</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5">
          <Activity className="h-4 w-4 text-green-500 animate-pulse" />
          <span>{new Date().toLocaleTimeString("es-ES")}</span>
        </Badge>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Area 1 - Main Metrics */}
        <Card className="p-6 bg-card/95 backdrop-blur-sm border-border shadow-lg">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-foreground mb-1">Área de Molienda A</h3>
            <p className="text-sm text-muted-foreground">Índice de Calidad del Aire</p>
          </div>

          {/* Circular gauge for air quality */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <CircularGauge value={12} max={100} label="" unit="" color="#10b981" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-green-500">Good</span>
                <span className="text-lg text-muted-foreground">12</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Area 2 - Metrics Grid */}
        <Card className="p-6 bg-card/95 backdrop-blur-sm border-border shadow-lg">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-foreground mb-1">Área de Molienda B</h3>
            <p className="text-sm text-muted-foreground">Métricas ambientales</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              icon={<Droplets className="h-5 w-5 text-blue-500" />}
              label="Humedad"
              value={humidity.toFixed(1)}
              unit="%"
              color="#3b82f6"
            />
            <MetricCard
              icon={<Volume2 className="h-5 w-5 text-purple-500" />}
              label="Nivel de Ruido"
              value={pressure.toFixed(1)}
              unit="dB"
              color="#8b5cf6"
            />
            <MetricCard
              icon={<Wind className="h-5 w-5 text-cyan-500" />}
              label="PM 2.5"
              value={vibration.toFixed(1)}
              unit="µg/m³"
              color="#06b6d4"
            />
            <MetricCard
              icon={<GaugeIcon className="h-5 w-5 text-green-500" />}
              label="TVOC Index"
              value="100"
              unit=""
              color="#10b981"
            />
          </div>
        </Card>
      </div>

      {/* Bottom Grid - Temperature and Historical Data */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Temperature Gauge 1 */}
        <Card className="p-6 bg-card/95 backdrop-blur-sm border-border shadow-lg">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-foreground">Área de Molienda A</h4>
            <p className="text-xs text-muted-foreground">Temperatura</p>
          </div>
          <CircularGauge value={temperature1.toFixed(1)} max={120} label="" unit="°F" />
        </Card>

        {/* Historical Chart 1 */}
        <Card className="p-6 bg-card/95 backdrop-blur-sm border-border shadow-lg">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-foreground">Área de Molienda A</h4>
            <p className="text-xs text-muted-foreground">Presión</p>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-2xl font-bold text-foreground">446</span>
            <span className="text-sm text-muted-foreground mb-1">ppm</span>
          </div>
          <div className="h-24">
            <MiniLineChart data={tempData1} color="#10b981" />
          </div>
        </Card>

        {/* Temperature Gauge 2 */}
        <Card className="p-6 bg-card/95 backdrop-blur-sm border-border shadow-lg">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-foreground">Área de Molienda B</h4>
            <p className="text-xs text-muted-foreground">Temperatura</p>
          </div>
          <CircularGauge value={temperature2.toFixed(1)} max={120} label="" unit="°F" />
        </Card>

        {/* Historical Chart 2 */}
        <Card className="p-6 bg-card/95 backdrop-blur-sm border-border shadow-lg">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-foreground">Área de Molienda B</h4>
            <p className="text-xs text-muted-foreground">Vibración</p>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-2xl font-bold text-foreground">679</span>
            <span className="text-sm text-muted-foreground mb-1">Hz</span>
          </div>
          <div className="h-24">
            <MiniLineChart data={tempData2} color="#10b981" />
          </div>
        </Card>
      </div>
    </div>
  )
}
