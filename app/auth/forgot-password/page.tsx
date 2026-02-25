"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError((data as any)?.error || "No se pudo enviar el correo de recuperación")
        return
      }

      setSuccess("Si el correo existe, te enviamos un enlace para restablecer tu contraseña")
    } catch {
      setError("Error de red al enviar el correo de recuperación")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <Image src="/images/industrial-bg.png" alt="Industrial background" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="mb-4">
              <Image src="/images/cr-logo.jpg" alt="CR Logo" width={80} height={80} />
            </div>
            <h2 className="text-sm text-gray-600 text-center font-medium">Central Romana Corporation, Ltd.</h2>
          </div>

          <h1 className="text-2xl font-bold text-red-600 text-center mb-6">Recuperar contraseña</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 border-gray-300 rounded-lg"
            />

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            {success && <p className="text-sm text-green-700 text-center">{success}</p>}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 rounded-lg font-medium"
            >
              {isLoading ? "Enviando..." : "Enviar enlace"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-blue-500 hover:text-blue-600 hover:underline">
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
