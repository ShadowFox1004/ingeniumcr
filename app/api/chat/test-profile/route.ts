import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId, username } = await request.json()
    
    console.log('🧪 Test create-profile received:', { userId, username })
    console.log('🧪 Environment variables:', {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
    })

    return NextResponse.json({
      success: true,
      message: 'Test endpoint working',
      received: { userId, username },
      env: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
      }
    })

  } catch (error) {
    console.error('🧪 Test endpoint error:', error)
    return NextResponse.json(
      { error: 'Test endpoint failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
