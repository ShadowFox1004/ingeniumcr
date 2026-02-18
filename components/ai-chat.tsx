"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { Send, Bot, Plus, MessageSquare, Trash2, Edit2, Search, Download, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: number;
};

type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = 'ai-chat-history';
const MAX_CHATS = 50;

export function AIChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Load chats from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedChats = JSON.parse(stored);
        setChats(parsedChats);
        
        // Set current chat to the most recent one or create new
        if (parsedChats.length > 0) {
          const mostRecent = parsedChats.sort((a: Chat, b: Chat) => b.updatedAt - a.updatedAt)[0];
          setCurrentChatId(mostRecent.id);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
      } catch (error) {
        console.error('Error saving chat history:', error);
        // If storage is full, remove oldest chats
        if (chats.length > MAX_CHATS) {
          const trimmedChats = chats.slice(-MAX_CHATS);
          setChats(trimmedChats);
        }
      }
    }
  }, [chats]);

  const currentChat = chats.find(chat => chat.id === currentChatId) || {
    id: Date.now().toString(),
    title: 'Nueva conversación',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'Nueva conversación',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setShowHistory(false);
  };

  const generateChatTitle = (firstMessage: string): string => {
    // Generate a title from the first user message (max 50 chars)
    const cleaned = firstMessage.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    return cleaned.length > 50 ? cleaned.substring(0, 47) + '...' : cleaned || 'Sin título';
  };

  const updateChatTitle = (chatId: string, newTitle: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, title: newTitle.trim() || 'Sin título', updatedAt: Date.now() }
        : chat
    ));
    setEditingChatId(null);
    setEditingTitle('');
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId);
      setCurrentChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
    }
  };

  const exportChats = () => {
    const dataStr = JSON.stringify(chats, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `ai-chat-history-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importChats = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedChats = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedChats)) {
          setChats(prev => [...importedChats, ...prev].slice(0, MAX_CHATS));
        }
      } catch (error) {
        console.error('Error importing chats:', error);
      }
    };
    reader.readAsText(file);
  };

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: Date.now()
    };

    // Update or create chat with new message
    let updatedChat: Chat;
    if (currentChatId && chats.find(chat => chat.id === currentChatId)) {
      updatedChat = {
        ...currentChat,
        messages: [...currentChat.messages, userMessage],
        updatedAt: Date.now()
      };
      
      // Generate title from first message if it's a new chat
      if (currentChat.messages.length === 0) {
        updatedChat.title = generateChatTitle(input);
      }
      
      setChats(prev => prev.map(chat => 
        chat.id === currentChatId ? updatedChat : chat
      ));
    } else {
      // Create new chat
      updatedChat = {
        id: Date.now().toString(),
        title: generateChatTitle(input),
        messages: [userMessage],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setChats(prev => [updatedChat, ...prev]);
      setCurrentChatId(updatedChat.id);
    }

    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: input }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error data:", errorData);
 
        throw new Error(
          errorData?.details ||
          errorData?.error ||
          `Error ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response?.content || "No se pudo obtener una respuesta",
        role: "assistant",
        timestamp: Date.now()
      };

      // Update chat with assistant response
      setChats(prev => prev.map(chat => 
        chat.id === (currentChatId || updatedChat.id) 
          ? { ...chat, messages: [...chat.messages, assistantMessage], updatedAt: Date.now() }
          : chat
      ));
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: `Error: ${
          error instanceof Error
            ? error.message
            : 'Error desconocido'
        }`,
        role: "assistant",
        timestamp: Date.now()
      };
      
      // Update chat with error message
      setChats(prev => prev.map(chat => 
        chat.id === (currentChatId || updatedChat.id) 
          ? { ...chat, messages: [...chat.messages, errorMessage], updatedAt: Date.now() }
          : chat
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background">
      
      {/* Header with controls */}
      <div className="border-b bg-background shrink-0 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={createNewChat}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nueva conversación
            </Button>
            
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Historial ({chats.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Historial de conversaciones</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Search and controls */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar conversaciones..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button size="sm" variant="outline" onClick={exportChats}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <label>
                      <Button size="sm" variant="outline" asChild>
                        <span>
                          <Upload className="h-4 w-4" />
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept=".json"
                        onChange={importChats}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  {/* Chat list */}
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {filteredChats.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          {searchQuery ? 'No se encontraron conversaciones' : 'No hay conversaciones guardadas'}
                        </p>
                      ) : (
                        filteredChats.map((chat) => (
                          <Card
                            key={chat.id}
                            className={`cursor-pointer transition-colors ${
                              currentChatId === chat.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                            }`}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div
                                  className="flex-1 min-w-0"
                                  onClick={() => {
                                    setCurrentChatId(chat.id);
                                    setShowHistory(false);
                                  }}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    {editingChatId === chat.id ? (
                                      <Input
                                        value={editingTitle}
                                        onChange={(e) => setEditingTitle(e.target.value)}
                                        onBlur={() => updateChatTitle(chat.id, editingTitle)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            updateChatTitle(chat.id, editingTitle);
                                          }
                                          if (e.key === 'Escape') {
                                            setEditingChatId(null);
                                            setEditingTitle('');
                                          }
                                        }}
                                        className="h-6 text-sm"
                                        autoFocus
                                      />
                                    ) : (
                                      <h3 className="font-medium text-sm truncate">{chat.title}</h3>
                                    )}
                                    <Badge variant="secondary" className="text-xs">
                                      {chat.messages.length}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(chat.updatedAt).toLocaleDateString('es-ES', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                  {chat.messages[0] && (
                                    <p className="text-xs text-muted-foreground mt-1 truncate">
                                      {chat.messages[0].content}
                                    </p>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingChatId(chat.id);
                                      setEditingTitle(chat.title);
                                    }}
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteChat(chat.id);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {currentChat.title}
          </div>
        </div>
      </div>

      {/* Scrollable Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full py-6 px-4">

          {currentChat.messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">
                ¿En qué puedo ayudarte hoy?
              </h2>
              <p className="text-muted-foreground max-w-md">
                Pregúntame lo que necesites sobre las maquinarias, alertas o mantenimiento.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {currentChat.messages.map((message) => (
              <div
                key={message.id}
                className={`group w-full ${
                  message.role === "user" ? "bg-muted/50" : "bg-background"
                }`}
              >
                <div className="max-w-3xl mx-auto px-4 py-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {message.role === "user" ? (
                        <span className="text-sm font-medium">TU</span>
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="prose prose-sm max-w-none text-foreground">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="w-full bg-background">
                <div className="max-w-3xl mx-auto px-4 py-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Input Section */}
      <div className="border-t bg-background shrink-0">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto w-full py-4 px-4"
        >
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Envía un mensaje"
              className="w-full p-4 pr-14 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-base bg-background"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg"
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Enviar</span>
            </Button>
          </div>

          <p className="mt-2 text-xs text-center text-muted-foreground">
            El asistente puede cometer errores. Verifica la información importante.
          </p>
        </form>
      </div>

    </div>
  );
}
