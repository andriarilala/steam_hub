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
  const [selectedType, setSelectedType] = useState<"all" | "photo" | "video" | "article">("all")

  const filteredMedia = mediaItems.filter((item) => {
    const categoryMatch = selectedCategory === "all" || item.category === selectedCategory
    const typeMatch = selectedType === "all" || item.type === selectedType
    return categoryMatch && typeMatch
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
            {/* Type Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Filter size={18} className="text-secondary" />
                <label className="font-bold text-foreground">{t("media.mediaType")}</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {["all", "photo", "video", "article"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type as any)}
                    className={`px-4 py-2 rounded-sm font-medium transition-colors capitalize flex items-center gap-2 ${
                      selectedType === type
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-foreground hover:bg-border"
                    }`}
                  >
                    {type === "photo" && <ImageIcon size={16} />}
                    {type === "video" && <Video size={16} />}
                    {type === "article" && <FileText size={16} />}
                    {type === "all" ? "All Media" : type}
                  </button>
                ))}
              </div>
            </div>

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
                    className={`px-4 py-2 rounded-sm font-medium transition-colors capitalize ${
                      selectedCategory === cat
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-foreground hover:bg-border"
                    }`}
                  >
                    {cat === "all" ? "All Categories" : cat.replace("-", " ")}
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
              .replace("{total}", mediaItems.length.toString())}
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

      {/* Video Interviews Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-foreground text-center">Exclusive Interviews</h2>
          <p className="text-center text-foreground/70 mb-12 max-w-2xl mx-auto">
            Hear directly from speakers, sponsors, and participants about their experience at PASS AVENIR
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                name: "Dr. Kwame Asante",
                title: "Tech Entrepreneur & Keynote Speaker",
                topic: "Building Africa's Tech Future",
                duration: "12:45",
              },
              {
                name: "Amina Mohamed",
                title: "HR Director, Global Tech Corp",
                topic: "Recruiting Top African Talent",
                duration: "8:30",
              },
              {
                name: "Samuel Okonkwo",
                title: "Startup Founder & Pitch Winner",
                topic: "From PASS AVENIR to Series A Funding",
                duration: "15:20",
              },
              {
                name: "Dr. Fatima Diallo",
                title: "Education Minister, Senegal",
                topic: "Youth Development & Innovation",
                duration: "10:15",
              },
            ].map((interview, idx) => (
              <div key={idx} className="group border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all">
                <div className="relative aspect-video bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                  <button className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center group-hover:scale-110">
                    <Video className="w-8 h-8 text-white fill-white" />
                  </button>
                  <span className="absolute bottom-4 right-4 bg-black/60 text-white px-2 py-1 text-xs font-bold rounded">
                    {interview.duration}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-1">{interview.name}</h3>
                  <p className="text-sm text-secondary font-medium mb-3">{interview.title}</p>
                  <p className="text-foreground/70 mb-4">{interview.topic}</p>
                  <button className="text-primary font-medium text-sm flex items-center gap-2 hover:underline">
                    Watch Interview
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Press Kit Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-foreground text-center">{t("media.pressKit")}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {[
              {
                title: t("media.officialPress"),
                description: "Download our official statement about PASS AVENIR 2025 and key achievements",
                icon: "📄",
              },
              {
                title: t("media.brandAssets"),
                description: "Logos, banners, and brand guidelines for media coverage and promotion",
                icon: "🎨",
              },
              {
                title: t("media.speakerBios"),
                description: "High-resolution photos and biographies of all keynote speakers and panelists",
                icon: "👤",
              },
              {
                title: t("media.eventStats"),
                description: "Data and insights about attendance, engagement, and impact of the summit",
                icon: "📊",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-background p-8 rounded-sm border border-border">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold mb-2 text-foreground">{item.title}</h3>
                <p className="text-foreground/70 mb-6">{item.description}</p>
                <button className="bg-primary text-primary-foreground px-6 py-2 rounded-sm font-bold hover:opacity-90 transition-opacity">
                  Download
                </button>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-foreground/70 mb-6">Need custom assets for media coverage?</p>
            <button className="border-2 border-primary text-primary px-8 py-3 rounded-sm font-bold hover:bg-primary/5 transition-colors">
              {t("media.contactPress")}
            </button>
          </div>
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
