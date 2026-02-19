"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Lock, Mail } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    try {
      // Use current origin for redirect (works for both local and production)
      const redirectUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : 'https://ingeniumcrdash.vercel.app'

      // Create user with metadata
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${redirectUrl}/auth/callback`,
          data: {
            full_name: email.split('@')[0],
          }
        },
      })
      
      if (signUpError) throw signUpError
      
      if (data.user) {
        // Create user profile in user_profiles table
        try {
          const profileResponse = await fetch('/api/chat/create-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: data.user.id,
              username: email.split('@')[0],
              fullName: email.split('@')[0],
              email: email,
            }),
          })

          if (!profileResponse.ok) {
            const profileError = await profileResponse.json()
            console.error('❌ Error creating user profile:', profileError)
          } else {
            console.log('✅ User profile created successfully')
          }
        } catch (profileError) {
          console.error('❌ Network error creating profile:', profileError)
        }

        // Send custom verification email using our endpoint
        const username = email.split('@')[0]
        
        try {
          console.log('📧 Enviando email de verificación:', { email, username, userId: data.user.id })
          
          const verificationResponse = await fetch('/api/email/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              username,
              userId: data.user.id,
            }),
          })

          console.log('📧 Response status:', verificationResponse.status)

          if (!verificationResponse.ok) {
            let errorData
            try {
              errorData = await verificationResponse.json()
              console.error('📧 Error response:', errorData)
            } catch {
              errorData = { error: `HTTP ${verificationResponse.status}` }
              console.error('📧 No JSON response, status:', verificationResponse.status)
            }
            console.error('📧 Error sending verification email:', errorData)
            // Continue anyway - user is created
          } else {
            const successData = await verificationResponse.json()
            console.log('📧 Email enviado exitosamente:', successData)
          }
        } catch (fetchError) {
          console.error('📧 Network error sending verification:', fetchError)
          // Continue - user was created even if email fails
        }
      }
      
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al crear cuenta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/industrial-bg.png" alt="Industrial background" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Sign Up Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo and Company Name */}
          <div className="flex flex-col items-center mb-6">
            <div className="mb-4">
              <Image src="/images/cr-logo.jpg" alt="CR Logo" width={80} height={80} />
            </div>
            <h2 className="text-sm text-gray-600 text-center font-medium">Central Romana Corporation, Ltd.</h2>
          </div>

          {/* Sign Up Title */}
          <h1 className="text-3xl font-bold text-red-600 text-center mb-8">Crear Cuenta</h1>

          {/* Sign Up Form */}
          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Email Input */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500">
                <Mail className="h-5 w-5" />
              </div>
              <Input
                type="email"
                placeholder="Correo Electrónico"
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
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 h-12 border-gray-300 rounded-lg"
              />
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500">
                <Lock className="h-5 w-5" />
              </div>
              <Input
                type="password"
                placeholder="Confirmar Contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-blue-500 hover:text-blue-600 hover:underline">
              Ya tienes cuenta? Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
