"use client"

import { useState } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useForums } from "@/lib/forums-context"
import { Search, Plus, Eye, MessageSquare, Heart, CheckCircle, Pin, TrendingUp } from "lucide-react"

export default function ForumsPage() {
  const { threads, categories, getThreadsByCategory, searchThreads } = useForums()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")

  let displayedThreads = searchQuery ? searchThreads(searchQuery) : threads

  if (selectedCategory !== "all") {
    displayedThreads = displayedThreads.filter((t) => t.category === selectedCategory)
  }

  // Sort threads
  if (sortBy === "popular") {
    displayedThreads = [...displayedThreads].sort((a, b) => b.likes - a.likes)
  } else if (sortBy === "most-viewed") {
    displayedThreads = [...displayedThreads].sort((a, b) => b.views - a.views)
  } else {
    displayedThreads = [...displayedThreads].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-border bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Community Forums</h1>
              <p className="text-foreground/70">Connect, discuss, and share knowledge with the PASS AVENIR community</p>
            </div>
            <Link
              href="#new-thread"
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              New Thread
            </Link>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg overflow-hidden sticky top-20">
              <div className="p-4 border-b border-border bg-muted">
                <h3 className="font-bold text-foreground">Categories</h3>
              </div>
              <div className="p-0">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full px-4 py-3 text-left font-medium transition-colors ${
                    selectedCategory === "all"
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  All Discussions
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full px-4 py-3 text-left border-t border-border transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cat.icon}</span>
                        <div>
                          <p className="font-medium">{cat.name}</p>
                          <p className="text-xs opacity-70">{cat.threadCount} threads</p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 bg-card border border-border rounded-lg p-6 space-y-4">
              <div>
                <p className="text-foreground/70 text-sm mb-2">Total Threads</p>
                <p className="text-3xl font-bold text-primary">{threads.length}</p>
              </div>
              <div>
                <p className="text-foreground/70 text-sm mb-2">Total Replies</p>
                <p className="text-3xl font-bold text-secondary">{threads.reduce((sum, t) => sum + t.replies.length, 0)}</p>
              </div>
            </div>
          </div>

          {/* Threads List */}
          <div className="lg:col-span-3 space-y-4">
            {/* Sort Options */}
            <div className="flex gap-3 mb-6">
              {[
                { value: "recent", label: "Recent" },
                { value: "popular", label: "Popular" },
                { value: "most-viewed", label: "Most Viewed" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    sortBy === option.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Threads */}
            {displayedThreads.map((thread) => (
              <div
                key={thread.id}
                className="bg-card border border-border rounded-lg hover:shadow-lg transition-all hover:border-primary/50 overflow-hidden group"
              >
                <Link href={`/forums/${thread.id}`} className="block p-6 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                        {thread.authorName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                            {thread.title}
                          </h3>
                          {thread.isPinned && <Pin className="w-4 h-4 text-secondary flex-shrink-0" />}
                          {thread.isSolved && (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-foreground/70 mb-2">
                          By <span className="font-medium">{thread.authorName}</span> • {thread.authorRole}
                        </p>
                        <p className="text-foreground/70 text-sm line-clamp-2 mb-3">{thread.content}</p>
                        <div className="flex flex-wrap gap-2">
                          {thread.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-foreground/70 flex-shrink-0">
                      <div className="text-center">
                        <Eye className="w-4 h-4 mx-auto mb-1 text-foreground/50" />
                        <span className="block text-xs">{thread.views}</span>
                      </div>
                      <div className="text-center">
                        <MessageSquare className="w-4 h-4 mx-auto mb-1 text-foreground/50" />
                        <span className="block text-xs">{thread.replies.length}</span>
                      </div>
                      <div className="text-center">
                        <Heart className="w-4 h-4 mx-auto mb-1 text-foreground/50" />
                        <span className="block text-xs">{thread.likes}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}

            {displayedThreads.length === 0 && (
              <div className="text-center py-12 text-foreground/60">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No threads found in this category</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
