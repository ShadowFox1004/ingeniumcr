"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { Send, Bot } from "lucide-react";
import { Button } from "./ui/button";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
};

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    };

    setMessages((prev) => [...prev, userMessage]);
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
        throw new Error(
          errorData.error || `Error ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: data.response?.content || "No se pudo obtener una respuesta",
        role: "assistant",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        role: "assistant",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="flex flex-col h-full w-full bg-background">
    
    {/* Scrollable Messages */}
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full py-6 px-4">

        {messages.length === 0 && (
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
          {messages.map((message) => (
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

    {/* Input Section (NO fixed) */}
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