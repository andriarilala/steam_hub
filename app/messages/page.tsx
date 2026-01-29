"use client"

import React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { useMessaging } from "@/lib/messaging-context"
import { Search, Send, Paperclip, Smile, Phone, Video, Info, Menu, X } from "lucide-react"

export default function MessagesPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { conversations, currentConversation, selectConversation, sendMessage, searchConversations } = useMessaging()
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin")
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentConversation?.messages])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  const displayedConversations = searchQuery ? searchConversations(searchQuery) : conversations

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (messageInput.trim() && currentConversation) {
      sendMessage(currentConversation.id, messageInput)
      setMessageInput("")
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div
          className={`w-full md:w-80 bg-card border-r border-border flex flex-col transition-transform ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {displayedConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  selectConversation(conv.id)
                  setIsMobileOpen(false)
                }}
                className={`w-full p-4 border-b border-border text-left hover:bg-muted/50 transition-colors ${
                  currentConversation?.id === conv.id ? "bg-primary/5 border-l-4 border-l-primary" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                    {conv.participantName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-foreground truncate">{conv.participantName}</p>
                      {conv.unreadCount > 0 && (
                        <span className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground/60 truncate">{conv.participantRole}</p>
                    <p className={`text-xs mt-1 truncate ${conv.unreadCount > 0 ? "text-foreground font-medium" : "text-foreground/50"}`}>
                      {conv.lastMessage}
                    </p>
                    <p className="text-xs text-foreground/40 mt-1">{conv.lastMessageTime}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {currentConversation ? (
          <div className="hidden md:flex flex-1 flex-col">
            {/* Header */}
            <div className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {currentConversation.participantName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{currentConversation.participantName}</p>
                  <p className="text-xs text-foreground/60">{currentConversation.participantRole}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground/60 hover:text-foreground">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground/60 hover:text-foreground">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground/60 hover:text-foreground">
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {currentConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${msg.senderId === "me" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"} rounded-2xl px-4 py-2`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.senderId === "me" ? "text-primary-foreground/70" : "text-foreground/60"}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="h-20 border-t border-border bg-card px-6 py-3 flex items-center gap-3">
              <button
                type="button"
                className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground/60 hover:text-foreground"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-muted border border-border rounded-full px-4 py-2 text-sm text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground/60 hover:text-foreground"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="p-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-muted">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
              <p className="text-foreground/60">Select a conversation to start messaging</p>
            </div>
          </div>
        )}

        {/* Mobile Chat View */}
        {isMobileOpen && (
          <div className="absolute inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
          </div>
        )}
      </div>

      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <Footer />
    </main>
  )
}

const MessageSquare = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)
