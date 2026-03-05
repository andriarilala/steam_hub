"use client"

import type React from "react"
import { useLanguage } from "@/lib/language-context"
import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { ImageIcon, Video, FileText, Filter } from "lucide-react"

interface MediaItem {
  id: string
  title: string
  type: "photo" | "video" | "article"
  thumbnail: string
  date: string
  category: string
  description?: string
}

const mediaItems: MediaItem[] = [
  {
    id: "1",
    title: "Opening Ceremony Highlights",
    type: "video",
    thumbnail: "/opening-ceremony-conference.jpg",
    date: "March 16, 2025",
    category: "event",
    description: "Watch the inspiring opening ceremony with keynote from industry leaders",
  },
  {
    id: "2",
    title: "Networking at Its Best",
    type: "photo",
    thumbnail: "/networking-professionals-conference.jpg",
    date: "March 15, 2025",
    category: "behind-the-scenes",
  },
  {
    id: "3",
    title: "Tech Panel Discussion",
    type: "video",
    thumbnail: "/panel-discussion-technology.jpg",
    date: "March 15, 2025",
    category: "sessions",
  },
  {
    id: "4",
    title: "Women in Leadership Panel",
    type: "photo",
    thumbnail: "/women-leadership-panel.jpg",
    date: "March 15, 2025",
    category: "sessions",
  },
  {
    id: "5",
    title: "PASS AVENIR 2025 Aftermovie",
    type: "video",
    thumbnail: "/event-aftermovie-highlights.jpg",
    date: "March 20, 2025",
    category: "event",
  },
  {
    id: "6",
    title: "Sponsor Showcase Excellence",
    type: "photo",
    thumbnail: "/sponsor-booth-exhibition.jpg",
    date: "March 16, 2025",
    category: "sponsors",
  },
  {
    id: "7",
    title: "Youth Startup Pitch Challenge",
    type: "video",
    thumbnail: "/startup-pitch-competition.jpg",
    date: "March 16, 2025",
    category: "sessions",
  },
  {
    id: "8",
    title: "Closing Remarks & Awards",
    type: "photo",
    thumbnail: "/awards-ceremony-celebration.jpg",
    date: "March 16, 2025",
    category: "event",
  },
  {
    id: "9",
    title: "Press Release: Record Attendance",
    type: "article",
    thumbnail: "/press-release-news.jpg",
    date: "March 18, 2025",
    category: "press",
  },
]

const categories = ["all", "event", "sessions", "sponsors", "behind-the-scenes", "press"]

export default function MediaPage() {
  const { t } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState("all")

  const photosOnly = mediaItems.filter((item) => item.type === "photo")

  const filteredMedia = photosOnly.filter((item) => {
    return selectedCategory === "all" || item.category === selectedCategory
  })

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <HeroSection
        title={t("media.title")}
        subtitle={t("media.subtitle")}
        backgroundImage="/vibrant-african-event-crowd-youth-technology-futur.png"
      />

      {/* Intro */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">{t("media.intro")}</h2>
          <p className="text-lg text-foreground/80 leading-relaxed">{t("media.introDesc")}</p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-card sticky top-20 z-40 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6">


            {/* Category Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Filter size={18} className="text-secondary" />
                <label className="font-bold text-foreground">{t("media.category")}</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-sm font-medium transition-colors capitalize ${selectedCategory === cat
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-foreground hover:bg-border"
                      }`}
                  >
                    {cat === "all" ? t("media.allCategories") : cat.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Media Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <p className="text-foreground/70 mb-8">
            {t("media.showing")
              .replace("{count}", filteredMedia.length.toString())
              .replace("{total}", photosOnly.length.toString())}
          </p>

          {filteredMedia.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedia.map((item) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-foreground/70">{t("media.noMedia")}</p>
            </div>
          )}
        </div>
      </section>



      <Footer />
    </main>
  )
}

interface MediaCardProps {
  item: MediaItem
}

function MediaCard({ item }: MediaCardProps) {
  const icons: Record<string, React.ReactNode> = {
    photo: <ImageIcon className="w-8 h-8" />,
    video: <Video className="w-8 h-8" />,
    article: <FileText className="w-8 h-8" />,
  }

  return (
    <div className="group cursor-pointer border border-border rounded-sm overflow-hidden hover:shadow-lg transition-all hover:border-secondary">
      {/* Thumbnail */}
      <div className="relative w-full h-48 bg-muted overflow-hidden">
        <img
          src={item.thumbnail || "/placeholder.svg"}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="text-white text-4xl">{icons[item.type]}</div>
        </div>
        <span className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-sm text-xs font-bold capitalize">
          {item.type}
        </span>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-secondary transition-colors">
          {item.title}
        </h3>
        {item.description && <p className="text-sm text-foreground/70 mb-4">{item.description}</p>}
        <div className="flex items-center justify-between text-xs text-foreground/60">
          <span className="bg-muted px-2 py-1 rounded capitalize">{item.category.replace("-", " ")}</span>
          <span>{item.date}</span>
        </div>
      </div>
    </div>
  )
}
