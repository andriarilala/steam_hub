"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface ForumReply {
  id: string
  authorId: string
  authorName: string
  authorRole: string
  content: string
  timestamp: string
  likes: number
  replies?: ForumReply[]
}

export interface ForumThread {
  id: string
  title: string
  category: string
  authorId: string
  authorName: string
  authorRole: string
  authorAvatar?: string
  content: string
  timestamp: string
  views: number
  replies: ForumReply[]
  likes: number
  isPinned: boolean
  isSolved: boolean
  tags: string[]
}

export interface ForumCategory {
  id: string
  name: string
  description: string
  threadCount: number
  icon: string
}

interface ForumsContextType {
  threads: ForumThread[]
  categories: ForumCategory[]
  isLoading: boolean
  getThreadsByCategory: (categoryId: string) => ForumThread[]
  searchThreads: (query: string) => ForumThread[]
  createThread: (thread: Omit<ForumThread, "id" | "timestamp" | "views" | "likes">) => void
  addReply: (threadId: string, reply: Omit<ForumReply, "id" | "timestamp" | "likes">) => void
  likeThread: (threadId: string) => void
  markAsSolved: (threadId: string) => void
}

const ForumsContext = createContext<ForumsContextType | undefined>(undefined)

// Demo categories
const demoCategories: ForumCategory[] = [
  {
    id: "cat_1",
    name: "General Discussion",
    description: "General topics and announcements about PASS AVENIR",
    threadCount: 45,
    icon: "💬",
  },
  {
    id: "cat_2",
    name: "Sponsorship & Partnerships",
    description: "Discuss sponsorship opportunities and partnerships",
    threadCount: 28,
    icon: "🤝",
  },
  {
    id: "cat_3",
    name: "Career & Opportunities",
    description: "Job postings and career discussions",
    threadCount: 62,
    icon: "💼",
  },
  {
    id: "cat_4",
    name: "Technical Support",
    description: "Technical issues and troubleshooting",
    threadCount: 15,
    icon: "🛠️",
  },
  {
    id: "cat_5",
    name: "Networking & Events",
    description: "Event updates and networking opportunities",
    threadCount: 38,
    icon: "📅",
  },
  {
    id: "cat_6",
    name: "Resources & Learning",
    description: "Share resources and learning materials",
    threadCount: 31,
    icon: "📚",
  },
]

// Demo threads
function generateDemoThreads(): ForumThread[] {
  return [
    {
      id: "thread_1",
      title: "Excited to connect with innovators from across Africa!",
      category: "cat_1",
      authorId: "user_1",
      authorName: "Amara Diallo",
      authorRole: "Entrepreneur",
      content:
        "This is my first time at PASS AVENIR and I'm looking forward to meeting fellow innovators and tech enthusiasts. Any tips for first-timers?",
      timestamp: "2025-03-16T10:30:00Z",
      views: 156,
      replies: [
        {
          id: "reply_1",
          authorId: "user_2",
          authorName: "John Smith",
          authorRole: "Mentor",
          content: "Welcome! Make sure to attend the networking breakfast on Day 1. Great way to start!",
          timestamp: "2025-03-16T11:20:00Z",
          likes: 12,
        },
      ],
      likes: 24,
      isPinned: true,
      isSolved: false,
      tags: ["welcome", "networking", "first-time"],
    },
    {
      id: "thread_2",
      title: "Sponsorship opportunities for growing startups",
      category: "cat_2",
      authorId: "user_3",
      authorName: "Marie Dupont",
      authorRole: "Investor",
      content:
        "We're looking to sponsor innovative startups. What packages are available and what are the expectations?",
      timestamp: "2025-03-16T09:15:00Z",
      views: 234,
      replies: [
        {
          id: "reply_2",
          authorId: "user_4",
          authorName: "Kwame Asante",
          authorRole: "Event Organizer",
          content:
            "Great question! We have several sponsorship tiers. I'll send you details via email. Check your inbox soon!",
          timestamp: "2025-03-16T09:45:00Z",
          likes: 18,
        },
      ],
      likes: 32,
      isPinned: false,
      isSolved: true,
      tags: ["sponsorship", "investment", "startups"],
    },
    {
      id: "thread_3",
      title: "Job board: Hiring Software Engineers in Lagos",
      category: "cat_3",
      authorId: "user_5",
      authorName: "Samuel Okonkwo",
      authorRole: "HR Manager",
      content:
        "We're hiring 5 senior software engineers for our tech hub in Lagos. Interested candidates should reach out. Details available upon request.",
      timestamp: "2025-03-15T16:20:00Z",
      views: 312,
      replies: [
        {
          id: "reply_3",
          authorId: "user_6",
          authorName: "David Chen",
          authorRole: "Engineer",
          content:
            "Very interested! Can you share more about the tech stack and compensation range?",
          timestamp: "2025-03-15T17:00:00Z",
          likes: 8,
        },
      ],
      likes: 45,
      isPinned: false,
      isSolved: false,
      tags: ["hiring", "engineers", "lagos"],
    },
    {
      id: "thread_4",
      title: "Having trouble accessing the event schedule",
      category: "cat_4",
      authorId: "user_7",
      authorName: "Zainab Ahmed",
      authorRole: "Participant",
      content:
        "The agenda page keeps loading slowly for me. Is anyone else experiencing this? Using Chrome on Windows.",
      timestamp: "2025-03-16T08:45:00Z",
      views: 89,
      replies: [
        {
          id: "reply_4",
          authorId: "user_8",
          authorName: "Tech Support",
          authorRole: "Support Team",
          content:
            "Thanks for reporting! We've identified a caching issue. Try clearing your browser cache. Should be fixed within the hour.",
          timestamp: "2025-03-16T09:10:00Z",
          likes: 5,
        },
      ],
      likes: 6,
      isPinned: false,
      isSolved: true,
      tags: ["technical", "bug", "agenda"],
    },
  ]
}

export function ForumsProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setThreads(generateDemoThreads())
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  const getThreadsByCategory = (categoryId: string) => {
    return threads.filter((t) => t.category === categoryId)
  }

  const searchThreads = (query: string) => {
    const q = query.toLowerCase()
    return threads.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    )
  }

  const createThread = (thread: Omit<ForumThread, "id" | "timestamp" | "views" | "likes">) => {
    const newThread: ForumThread = {
      ...thread,
      id: `thread_${Date.now()}`,
      timestamp: new Date().toISOString(),
      views: 0,
      likes: 0,
    }
    setThreads([newThread, ...threads])
  }

  const addReply = (threadId: string, reply: Omit<ForumReply, "id" | "timestamp" | "likes">) => {
    setThreads(
      threads.map((t) =>
        t.id === threadId
          ? {
              ...t,
              replies: [
                ...t.replies,
                {
                  ...reply,
                  id: `reply_${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  likes: 0,
                },
              ],
            }
          : t
      )
    )
  }

  const likeThread = (threadId: string) => {
    setThreads(threads.map((t) => (t.id === threadId ? { ...t, likes: t.likes + 1 } : t)))
  }

  const markAsSolved = (threadId: string) => {
    setThreads(threads.map((t) => (t.id === threadId ? { ...t, isSolved: !t.isSolved } : t)))
  }

  return (
    <ForumsContext.Provider
      value={{
        threads,
        categories: demoCategories,
        isLoading,
        getThreadsByCategory,
        searchThreads,
        createThread,
        addReply,
        likeThread,
        markAsSolved,
      }}
    >
      {children}
    </ForumsContext.Provider>
  )
}

export function useForums() {
  const context = useContext(ForumsContext)
  if (context === undefined) {
    throw new Error("useForums must be used within ForumsProvider")
  }
  return context
}
