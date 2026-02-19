"use client"

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePresence() {
  const supabase = createClient()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const updateStatus = async (status: 'online' | 'offline') => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) return

        await fetch('/api/chat/status', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ status })
        })
      } catch (error) {
        console.error('Error updating status:', error)
      }
    }

    // Set user as online when component mounts
    updateStatus('online')

    // Update last_seen every 30 seconds
    intervalRef.current = setInterval(() => updateStatus('online'), 30000)

    // Set user as offline when component unmounts or page is hidden
    const handleOffline = () => updateStatus('offline')

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleOffline()
      } else {
        updateStatus('online')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleOffline)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleOffline)
      handleOffline()
    }
  }, [supabase])

  return null
}
