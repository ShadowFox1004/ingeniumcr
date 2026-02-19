"use client"

import { useState, useEffect, useRef, FormEvent } from "react"
import { Send, Paperclip, MoreVertical, Phone, Video, ArrowLeft, Check, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import type { Message, UserProfile } from "@/lib/types"

interface ChatWindowProps {
  conversationId: string | null
  contact: UserProfile | null
  currentUserId: string
  onBack?: () => void
  isMobile?: boolean
}

export function ChatWindow({ 
  conversationId, 
  contact, 
  currentUserId,
  onBack,
  isMobile 
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // Debug logging - only log when important props change
  useEffect(() => {
    console.log('🔍 ChatWindow state changed:', { 
      conversationId, 
      contactId: contact?.id, 
      currentUserId,
      hasContact: !!contact,
      hasConversationId: !!conversationId 
    })
  }, [conversationId, contact?.id, currentUserId])

  const fetchMessages = async () => {
    if (!conversationId) return
    
    try {
      const response = await fetch(`/api/chat/messages?conversationId=${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault()
    
    console.log('🔍 sendMessage called:', { 
      inputMessage: inputMessage.trim(), 
      conversationId, 
      isSending,
      canSend: !!(inputMessage.trim() && conversationId && !isSending)
    })
    
    if (!inputMessage.trim() || !conversationId || isSending) return

    setIsSending(true)
    
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content: inputMessage.trim()
        })
      })

      if (response.ok) {
        setInputMessage('')
        await fetchMessages()
      } else {
        const errorData = await response.json()
        console.error('❌ Error sending message:', errorData)
      }
    } catch (error) {
      console.error('❌ Network error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  // Polling for new messages
  useEffect(() => {
    if (!conversationId) return
    
    fetchMessages()
    
    // Poll every 3 seconds
    pollingRef.current = setInterval(fetchMessages, 3000)
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [conversationId])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const getInitials = (name: string | null) => {
    if (!name) return "?"
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      default: return 'bg-gray-400'
    }
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    
    // Adjust for local timezone
    const localDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000))
    const localNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
    
    const isToday = localDate.toDateString() === localNow.toDateString()
    
    if (isToday) {
      return localDate.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      })
    }
    
    return localDate.toLocaleDateString('es-ES', { 
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = []
    
    messages.forEach((message) => {
      const date = new Date(message.created_at)
      // Adjust for local timezone
      const localDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000))
      const dateString = localDate.toDateString()
      
      const existingGroup = groups.find(g => g.date === dateString)
      
      if (existingGroup) {
        existingGroup.messages.push(message)
      } else {
        groups.push({ date: dateString, messages: [message] })
      }
    })
    
    return groups
  }

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-muted/30">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Send className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground">
            Selecciona un contacto para chatear
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Elige un contacto de la lista para iniciar una conversación
          </p>
        </div>
      </div>
    )
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-3">
          {isMobile && onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={contact.avatar_url || undefined} />
              <AvatarFallback>{getInitials(contact.full_name || contact.username)}</AvatarFallback>
            </Avatar>
            <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(contact.status)}`} />
          </div>
          
          <div>
            <h3 className="font-medium">
              {contact.full_name || contact.username}
            </h3>
            <p className="text-sm text-muted-foreground">
              {contact.status === 'online' ? 'En línea' : 
               contact.status === 'away' ? 'Ausente' : 'Desconectado'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Ver perfil</DropdownMenuItem>
              <DropdownMenuItem>Silenciar</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Bloquear</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Send className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Inicia la conversación</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Envía un mensaje a {contact.full_name || contact.username}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {messageGroups.map((group, groupIndex) => (
              <div key={group.date} className="space-y-4">
                {/* Date separator */}
                <div className="flex items-center justify-center">
                  <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {(() => {
                      const date = new Date(group.date)
                      // Adjust for local timezone
                      const localDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000))
                      return localDate.toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })
                    })()}
                  </span>
                </div>
                
                {/* Messages in this group */}
                <div className="space-y-3">
                  {group.messages.map((message, index) => {
                    const isOwn = message.sender_id === currentUserId
                    const showAvatar = !isOwn && (
                      index === 0 || 
                      group.messages[index - 1]?.sender_id !== message.sender_id
                    )
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-end gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isOwn && showAvatar && (
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarImage src={message.sender?.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {getInitials(message.sender?.full_name || message.sender?.username)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isOwn 
                                ? 'bg-primary text-primary-foreground rounded-br-none' 
                                : 'bg-muted rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-xs opacity-70">
                                {formatMessageTime(message.created_at)}
                              </span>
                              {isOwn && (
                                <span className="opacity-70">
                                  {message.status === 'read' ? (
                                    <CheckCheck className="h-3 w-3" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t bg-background">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1"
            disabled={!conversationId || isSending}
          />
          
          <Button 
            type="submit" 
            size="icon"
            disabled={!inputMessage.trim() || !conversationId || isSending}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  )
}
