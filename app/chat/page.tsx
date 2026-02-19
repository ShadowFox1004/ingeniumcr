"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ContactsList } from "@/components/chat/contacts-list"
import { ChatWindow } from "@/components/chat/chat-window"
import { Button } from "@/components/ui/button"
import { MessageSquare, Users } from "lucide-react"
import { usePresence } from "@/hooks/use-presence"
import type { UserProfile } from "@/lib/types"

export default function ChatPage() {
  const [selectedContact, setSelectedContact] = useState<UserProfile | null>(null)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [isMobileView, setIsMobileView] = useState(false)
  const [showContacts, setShowContacts] = useState(true)
  const router = useRouter()

  // Initialize presence system for real-time status
  usePresence()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setCurrentUserId(user.id)
    }
    
    checkAuth()
    
    // Check screen size
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [router])

  const handleSelectContact = async (contact: UserProfile) => {
    setSelectedContact(contact)
    
    // Get or create conversation
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: contact.id })
      })
      
      if (response.ok) {
        const data = await response.json()
        setCurrentConversationId(data.conversationId)
      }
    } catch (error) {
      console.error('Error getting conversation:', error)
    }
    
    if (isMobileView) {
      setShowContacts(false)
    }
  }

  const handleBackToContacts = () => {
    setShowContacts(true)
    setSelectedContact(null)
    setCurrentConversationId(null)
  }

  const handleStartConversation = async (contactId: string) => {
    // Get or create conversation
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId })
      })
      
      if (response.ok) {
        const data = await response.json()
        setCurrentConversationId(data.conversationId)
        
        // Fetch contact details
        const contactsResponse = await fetch('/api/chat/contacts')
        if (contactsResponse.ok) {
          const contactsData = await contactsResponse.json()
          const contact = contactsData.contacts.find(
            (c: any) => c.contact_id === contactId
          )?.contact
          
          if (contact) {
            setSelectedContact(contact)
            if (isMobileView) {
              setShowContacts(false)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error starting conversation:', error)
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Chat</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            Mis contactos
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Contacts Panel */}
        <div 
          className={`${
            isMobileView 
              ? showContacts ? 'w-full' : 'hidden' 
              : 'w-80'
          } border-r flex-shrink-0`}
        >
          <ContactsList
            onSelectContact={handleSelectContact}
            selectedContactId={selectedContact?.id}
            onStartConversation={handleStartConversation}
            currentUserId={currentUserId}
            isMobile={isMobileView}
          />
        </div>

        {/* Chat Panel */}
        <div 
          className={`${
            isMobileView 
              ? showContacts ? 'hidden' : 'w-full' 
              : 'flex-1'
          }`}
        >
          <ChatWindow
            conversationId={currentConversationId}
            contact={selectedContact}
            currentUserId={currentUserId}
            onBack={isMobileView ? handleBackToContacts : undefined}
            isMobile={isMobileView}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t px-6 py-2 text-xs text-muted-foreground text-center bg-muted/30">
        Los mensajes se guardan por 60 días. Después de este período, se eliminarán automáticamente.
      </div>
    </div>
  )
}
