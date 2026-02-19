"use client"

import { useState, useEffect } from "react"
import { Search, UserPlus, MoreVertical, Phone, Video, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { UserContact, UserProfile } from "@/lib/types"

interface ContactsListProps {
  onSelectContact: (contact: UserProfile) => void
  selectedContactId?: string
  onStartConversation: (contactId: string) => Promise<void>
  currentUserId: string
  isMobile: boolean
}

export function ContactsList({
  onSelectContact,
  onStartConversation,
  selectedContactId,
  currentUserId,
  isMobile,
}: ContactsListProps) {
  const [contacts, setContacts] = useState<UserContact[]>([])
  const [allAvailableUsers, setAllAvailableUsers] = useState<UserProfile[]>([])
  const [filteredAvailableUsers, setFilteredAvailableUsers] = useState<UserProfile[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addSearchQuery, setAddSearchQuery] = useState("")

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/chat/contacts')
      if (response.ok) {
        const data = await response.json()
        setContacts(data.contacts || [])
        setAllAvailableUsers(data.availableUsers || [])
        setFilteredAvailableUsers(data.availableUsers || [])
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      // Show all available users when search is empty
      setFilteredAvailableUsers(allAvailableUsers)
      return
    }
    
    setIsSearching(true)
    
    try {
      // First try to filter from already loaded users
      const localFiltered = allAvailableUsers.filter(user =>
        user.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        user.username?.toLowerCase().includes(query.toLowerCase())
      )
      
      if (localFiltered.length > 0) {
        setFilteredAvailableUsers(localFiltered)
      } else {
        // If no local results, search via API
        const response = await fetch(`/api/chat/contacts?search=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          setFilteredAvailableUsers(data.availableUsers || [])
        }
      }
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const addContact = async (userId: string) => {
    try {
      const response = await fetch('/api/chat/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: userId })
      })
      
      if (response.ok) {
        await fetchContacts()
        setAddSearchQuery("")
        setShowAddDialog(false)
      }
    } catch (error) {
      console.error('Error adding contact:', error)
    }
  }

  const removeContact = async (contactId: string) => {
    try {
      const response = await fetch(`/api/chat/contacts?id=${contactId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchContacts()
      }
    } catch (error) {
      console.error('Error removing contact:', error)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  useEffect(() => {
    // When dialog opens, show all available users
    if (showAddDialog) {
      setFilteredAvailableUsers(allAvailableUsers)
    }
  }, [showAddDialog, allAvailableUsers])

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchUsers(addSearchQuery)
    }, 300)
    return () => clearTimeout(timeout)
  }, [addSearchQuery])

  const filteredContacts = contacts.filter(contact => 
    contact.contact?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.contact?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getInitials = (name: string | null | undefined) => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background border-r">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Contactos</h2>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Agregar Contacto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuarios..."
                    value={addSearchQuery}
                    onChange={(e) => setAddSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : filteredAvailableUsers.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        {addSearchQuery ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
                      </p>
                    ) : (
                      filteredAvailableUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.full_name || user.username}</p>
                              <p className="text-sm text-muted-foreground">@{user.username}</p>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => addContact(user.id)}>
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contactos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Contacts List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No tienes contactos</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddDialog(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Agregar contacto
              </Button>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => contact.contact && onSelectContact(contact.contact)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedContactId === contact.contact_id 
                    ? 'bg-primary/10 border-primary' 
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={contact.contact?.avatar_url || undefined} />
                      <AvatarFallback>
                        {getInitials(contact.contact?.full_name || contact.contact?.username)}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(contact.contact?.status)}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {contact.contact?.full_name || contact.contact?.username}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      @{contact.contact?.username}
                    </p>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        if (contact.contact) {
                          onStartConversation(contact.contact.id)
                        }
                      }}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Enviar mensaje
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        removeContact(contact.id)
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
