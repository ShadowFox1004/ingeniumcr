"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { SensorReading } from "@/lib/types"

interface SensorReadingsChartProps {
  readings: SensorReading[]
  unit: string
}

export function SensorReadingsChart({ readings, unit }: SensorReadingsChartProps) {
  const chartData = readings
    .slice(0, 50)
    .reverse()
    .map((reading) => ({
      time: new Date(reading.timestamp).toLocaleTimeString("es-DO", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      value: reading.value,
      status: reading.status,
    }))

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="time" stroke="#888" style={{ fontSize: "12px" }} />
          <YAxis
            stroke="#888"
            style={{ fontSize: "12px" }}
            label={{ value: unit, angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: "8px",
            }}
          />
          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
