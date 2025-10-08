"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { User, Lock } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/industrial-bg.jpg" alt="Industrial background" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo and Company Name */}
          <div className="flex flex-col items-center mb-6">
            <div className="mb-4">
              <Image src="/images/cr-logo.jpg" alt="CR Logo" width={80} height={80} />
            </div>
            <h2 className="text-sm text-gray-600 text-center font-medium">Central Romana Corporation, Ltd.</h2>
          </div>

          {/* Login Title */}
          <h1 className="text-3xl font-bold text-red-600 text-center mb-8">Login</h1>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500">
                <User className="h-5 w-5" />
              </div>
              <Input
                type="email"
                placeholder="Ingresar Usuario"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 h-12 border-gray-300 rounded-lg"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500">
                <Lock className="h-5 w-5" />
              </div>
              <Input
                type="password"
                placeholder="Ingresar Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 h-12 border-gray-300 rounded-lg"
              />
            </div>

            {/* Error Message */}
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 rounded-lg font-medium"
            >
              {isLoading ? "Ingresando..." : "Entrar"}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <a href="/auth/sign-up" className="text-sm text-blue-500 hover:text-blue-600 hover:underline">
              No tienes cuenta? Crear cuenta
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
