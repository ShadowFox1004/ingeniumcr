"use client"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/industrial-bg.png" alt="Industrial background" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Success Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo and Company Name */}
          <div className="flex flex-col items-center mb-6">
            <div className="mb-4">
              <Image src="/images/cr-logo.jpg" alt="CR Logo" width={80} height={80} />
            </div>
            <h2 className="text-sm text-gray-600 text-center font-medium">Central Romana Corporation, Ltd.</h2>
          </div>

          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">¡Cuenta Creada!</h1>
          <p className="text-gray-600 text-center mb-8">
            Por favor revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión.
          </p>

          {/* Back to Login Button */}
          <Link href="/login">
            <Button className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">
              Volver al Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
