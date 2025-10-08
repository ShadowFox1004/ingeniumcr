export const themes = {
  default: {
    name: "Azul Industrial",
    primary: "oklch(0.6 0.25 265)", // Blue
    ring: "oklch(0.6 0.25 265)",
    chart1: "oklch(0.6 0.25 265)",
    chart2: "oklch(0.65 0.25 165)",
    chart3: "oklch(0.7 0.25 45)",
    chart4: "oklch(0.6 0.25 15)",
    chart5: "oklch(0.65 0.25 305)",
  },
  red: {
    name: "Rojo Energía",
    primary: "oklch(0.6 0.25 25)", // Red
    ring: "oklch(0.6 0.25 25)",
    chart1: "oklch(0.6 0.25 25)",
    chart2: "oklch(0.65 0.25 45)",
    chart3: "oklch(0.7 0.25 65)",
    chart4: "oklch(0.6 0.25 305)",
    chart5: "oklch(0.65 0.25 345)",
  },
  green: {
    name: "Verde Naturaleza",
    primary: "oklch(0.6 0.25 145)", // Green
    ring: "oklch(0.6 0.25 145)",
    chart1: "oklch(0.6 0.25 145)",
    chart2: "oklch(0.65 0.25 165)",
    chart3: "oklch(0.7 0.25 185)",
    chart4: "oklch(0.6 0.25 125)",
    chart5: "oklch(0.65 0.25 105)",
  },
  purple: {
    name: "Púrpura Clásico",
    primary: "oklch(0.6 0.25 305)", // Purple
    ring: "oklch(0.6 0.25 305)",
    chart1: "oklch(0.6 0.25 305)",
    chart2: "oklch(0.65 0.25 285)",
    chart3: "oklch(0.7 0.25 265)",
    chart4: "oklch(0.6 0.25 325)",
    chart5: "oklch(0.65 0.25 345)",
  },
  orange: {
    name: "Naranja Cálido",
    primary: "oklch(0.65 0.25 55)", // Orange
    ring: "oklch(0.65 0.25 55)",
    chart1: "oklch(0.65 0.25 55)",
    chart2: "oklch(0.7 0.25 45)",
    chart3: "oklch(0.6 0.25 65)",
    chart4: "oklch(0.65 0.25 35)",
    chart5: "oklch(0.7 0.25 25)",
  },
  cyan: {
    name: "Cian Moderno",
    primary: "oklch(0.65 0.25 205)", // Cyan
    ring: "oklch(0.65 0.25 205)",
    chart1: "oklch(0.65 0.25 205)",
    chart2: "oklch(0.7 0.25 185)",
    chart3: "oklch(0.6 0.25 225)",
    chart4: "oklch(0.65 0.25 165)",
    chart5: "oklch(0.7 0.25 245)",
  },
} as const

export type ThemeKey = keyof typeof themes
