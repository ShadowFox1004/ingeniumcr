"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Droplets, Volume2, Wind, GaugeIcon, Activity, Thermometer } from "lucide-react"
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

function CircularGauge({ value, max, label, unit, color = "#10b981" }: any) {
  const percentage = (value / max) * 100
  const circumference = 2 * Math.PI * 50
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const getColor = () => {
    if (percentage < 40) return "#10b981"
    if (percentage < 70) return "#f59e0b"
    return "#ef4444"
  }

  const gaugeColor = getColor()

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full transform -rotate-90">
          <defs>
            <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gaugeColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor={gaugeColor} stopOpacity="1" />
            </linearGradient>
          </defs>
          <circle cx="80" cy="80" r="50" stroke="hsl(var(--muted))" strokeWidth="12" fill="none" opacity="0.15" />
          <circle
            cx="80"
            cy="80"
            r="50"
            stroke={`url(#gradient-${label})`}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out drop-shadow-lg"
            style={{ filter: `drop-shadow(0 0 8px ${gaugeColor}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-foreground leading-none">{value}</span>
          <span className="text-sm text-muted-foreground font-medium mt-1">{unit}</span>
        </div>
      </div>
      {label && <p className="text-sm text-muted-foreground mt-3 font-medium">{label}</p>}
    </div>
  )
}

function MetricCard({ icon, label, value, unit, color = "#10b981" }: any) {
  return (
    <div
      className="relative flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-card to-card/50 border-l-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden group"
      style={{ borderColor: color }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
        style={{ background: `linear-gradient(135deg, ${color}20 0%, transparent 100%)` }}
      />
      <div
        className="p-2.5 rounded-lg bg-gradient-to-br from-muted/80 to-muted/40 shadow-sm flex-shrink-0"
        style={{ boxShadow: `0 0 20px ${color}20` }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0 relative z-10">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5 truncate">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-foreground leading-none">{value}</span>
          <span className="text-xs text-muted-foreground font-medium">{unit}</span>
        </div>
      </div>
    </div>
  )
}

function MiniLineChart({ data, color = "#10b981", label }: any) {
  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <defs>
            <linearGradient id={`chartGradient-${label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} width={30} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            dot={false}
            animationDuration={1500}
            fill={`url(#chartGradient-${label})`}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
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
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div>
          <h2 className="text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Monitoreo de Sensores - Áreas de Producción
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Datos en tiempo real de todas las áreas industriales</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border-green-500/30">
          <Activity className="h-4 w-4 text-green-500 animate-pulse" />
          <span className="font-medium">{new Date().toLocaleTimeString("es-ES")}</span>
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-8 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm border-border/50 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Thermometer className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Área de Molienda A</h3>
            </div>
            <p className="text-sm text-muted-foreground">Índice de Calidad del Aire</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <CircularGauge value={12} max={100} label="" unit="" color="#10b981" />
            <div className="text-center">
              <div className="text-5xl font-bold text-green-500 drop-shadow-lg mb-2">Good</div>
              <div className="text-2xl text-muted-foreground font-semibold">Score: 12</div>
            </div>
          </div>
        </Card>

        <Card className="p-8 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm border-border/50 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Área de Molienda B</h3>
            </div>
            <p className="text-sm text-muted-foreground">Métricas ambientales en tiempo real</p>
          </div>

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
              label="Nivel Ruido"
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="mb-4">
            <h4 className="text-base font-semibold text-foreground">Área de Molienda A</h4>
            <p className="text-xs text-muted-foreground mt-1">Temperatura</p>
          </div>
          <CircularGauge value={temperature1.toFixed(1)} max={120} label="" unit="°F" />
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="mb-4">
            <h4 className="text-base font-semibold text-foreground">Área de Molienda A</h4>
            <p className="text-xs text-muted-foreground mt-1">Presión</p>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold text-foreground">446</span>
            <span className="text-base text-muted-foreground font-medium">ppm</span>
          </div>
          <div className="h-28">
            <MiniLineChart data={tempData1} color="#10b981" label="pressure1" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="mb-4">
            <h4 className="text-base font-semibold text-foreground">Área de Molienda B</h4>
            <p className="text-xs text-muted-foreground mt-1">Temperatura</p>
          </div>
          <CircularGauge value={temperature2.toFixed(1)} max={120} label="" unit="°F" />
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="mb-4">
            <h4 className="text-base font-semibold text-foreground">Área de Molienda B</h4>
            <p className="text-xs text-muted-foreground mt-1">Vibración</p>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold text-foreground">679</span>
            <span className="text-base text-muted-foreground font-medium">Hz</span>
          </div>
          <div className="h-28">
            <MiniLineChart data={tempData2} color="#10b981" label="vibration2" />
          </div>
        </Card>
      </div>
    </div>
  )
}
