"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const run = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        setError("El enlace de recuperación no es válido o expiró")
      }
    }

    run()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess("Contraseña actualizada. Ya puedes iniciar sesión.")

      setTimeout(() => {
        router.push("/login")
        router.refresh()
      }, 800)
    } catch {
      setError("Error al actualizar la contraseña")
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

          <h1 className="text-2xl font-bold text-red-600 text-center mb-6">Restablecer contraseña</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 border-gray-300 rounded-lg"
            />
            <Input
              type="password"
              placeholder="Confirmar nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? "Actualizando..." : "Actualizar contraseña"}
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
