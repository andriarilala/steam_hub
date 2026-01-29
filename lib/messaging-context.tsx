"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  read: boolean
}

export interface Conversation {
  id: string
  participantId: string
  participantName: string
  participantRole: string
  participantAvatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  messages: Message[]
}

interface MessagingContextType {
  conversations: Conversation[]
  currentConversation: Conversation | null
  isLoading: boolean
  selectConversation: (conversationId: string) => void
  sendMessage: (conversationId: string, content: string) => void
  markAsRead: (conversationId: string) => void
  searchConversations: (query: string) => Conversation[]
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined)

// Demo conversations generator
function generateDemoConversations(): Conversation[] {
  return [
    {
      id: "conv_1",
      participantId: "user_1",
      participantName: "Kwame Asante",
      participantRole: "Event Organizer",
      participantAvatar: "/avatar-1.jpg",
      lastMessage: "Looking forward to seeing you at the summit!",
      lastMessageTime: "Today 2:30 PM",
      unreadCount: 2,
      messages: [
        {
          id: "msg_1",
          conversationId: "conv_1",
          senderId: "user_1",
          senderName: "Kwame Asante",
          content: "Hi! Thanks for sponsoring PASS AVENIR",
          timestamp: "Today 10:00 AM",
          read: true,
        },
        {
          id: "msg_2",
          conversationId: "conv_1",
          senderId: "me",
          senderName: "You",
          content: "Thanks for having us! Excited to participate",
          timestamp: "Today 10:15 AM",
          read: true,
        },
        {
          id: "msg_3",
          conversationId: "conv_1",
          senderId: "user_1",
          senderName: "Kwame Asante",
          content: "Looking forward to seeing you at the summit!",
          timestamp: "Today 2:30 PM",
          read: false,
        },
      ],
    },
    {
      id: "conv_2",
      participantId: "user_2",
      participantName: "Amina Mohammed",
      participantRole: "Recruiter",
      participantAvatar: "/avatar-2.jpg",
      lastMessage: "Can we schedule a meeting next week?",
      lastMessageTime: "Yesterday 4:45 PM",
      unreadCount: 0,
      messages: [
        {
          id: "msg_4",
          conversationId: "conv_2",
          senderId: "user_2",
          senderName: "Amina Mohammed",
          content: "Interested in learning more about your internship opportunities",
          timestamp: "Yesterday 2:00 PM",
          read: true,
        },
        {
          id: "msg_5",
          conversationId: "conv_2",
          senderId: "me",
          senderName: "You",
          content: "Sure! We have several positions available",
          timestamp: "Yesterday 3:15 PM",
          read: true,
        },
        {
          id: "msg_6",
          conversationId: "conv_2",
          senderId: "user_2",
          senderName: "Amina Mohammed",
          content: "Can we schedule a meeting next week?",
          timestamp: "Yesterday 4:45 PM",
          read: true,
        },
      ],
    },
    {
      id: "conv_3",
      participantId: "user_3",
      participantName: "Samuel Okonkwo",
      participantRole: "Mentor",
      participantAvatar: "/avatar-3.jpg",
      lastMessage: "Great progress on your project!",
      lastMessageTime: "2 days ago",
      unreadCount: 0,
      messages: [
        {
          id: "msg_7",
          conversationId: "conv_3",
          senderId: "me",
          senderName: "You",
          content: "Can you review my startup pitch?",
          timestamp: "2 days ago",
          read: true,
        },
        {
          id: "msg_8",
          conversationId: "conv_3",
          senderId: "user_3",
          senderName: "Samuel Okonkwo",
          content: "Great progress on your project!",
          timestamp: "2 days ago",
          read: true,
        },
      ],
    },
  ]
}

export function MessagingProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setConversations(generateDemoConversations())
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  const selectConversation = (conversationId: string) => {
    const conv = conversations.find((c) => c.id === conversationId)
    if (conv) {
      setCurrentConversation(conv)
      // Mark as read
      conv.unreadCount = 0
      conv.messages.forEach((m) => {
        if (m.senderId !== "me") m.read = true
      })
    }
  }

  const sendMessage = (conversationId: string, content: string) => {
    const convIndex = conversations.findIndex((c) => c.id === conversationId)
    if (convIndex !== -1) {
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        conversationId,
        senderId: "me",
        senderName: "You",
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: true,
      }

      const updatedConv = { ...conversations[convIndex] }
      updatedConv.messages.push(newMessage)
      updatedConv.lastMessage = content
      updatedConv.lastMessageTime = "now"

      const updated = [...conversations]
      updated[convIndex] = updatedConv
      setConversations(updated)
      setCurrentConversation(updatedConv)
    }
  }

  const markAsRead = (conversationId: string) => {
    const conv = conversations.find((c) => c.id === conversationId)
    if (conv) {
      conv.unreadCount = 0
      conv.messages.forEach((m) => {
        m.read = true
      })
    }
  }

  const searchConversations = (query: string) => {
    return conversations.filter((conv) =>
      conv.participantName.toLowerCase().includes(query.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(query.toLowerCase())
    )
  }

  return (
    <MessagingContext.Provider
      value={{
        conversations,
        currentConversation,
        isLoading,
        selectConversation,
        sendMessage,
        markAsRead,
        searchConversations,
      }}
    >
      {children}
    </MessagingContext.Provider>
  )
}

export function useMessaging() {
  const context = useContext(MessagingContext)
  if (context === undefined) {
    throw new Error("useMessaging must be used within MessagingProvider")
  }
  return context
}
