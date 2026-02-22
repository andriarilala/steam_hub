"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { CalendarExport } from "@/components/calendar-export"
import { Filter, Clock, MapPin, User } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface Session {
  id: string
  title: string
  description: string
  date?: string
  time?: string
  location?: string
  theme?: string
  type?: string
  audience?: string[]
  speakers?: string[]
  expectedOutcomes?: string[]
}

export default function AgendaPage() {
  const { t } = useLanguage()
  const [selectedTheme, setSelectedTheme] = useState("all")
  const [selectedAudience, setSelectedAudience] = useState("all")
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .catch(() => setSessions([]))
  }, [])

  const filteredSessions = sessions.filter((session) => {
    const themeValue = session.theme ?? session.type ?? ""
    const themeMatch =
      selectedTheme === "all" || themeValue === selectedTheme

    const audienceMatch =
      selectedAudience === "all" ||
      (session.audience?.includes(selectedAudience) ?? false)

    return themeMatch && audienceMatch
  })

  const themes = [
    "all",
    ...Array.from(
      new Set(
        sessions
          .map((s) => s.theme ?? s.type)
          .filter((v): v is string => Boolean(v))
      )
    ),
  ]

  const audiences = ["all", "youth", "companies", "institutions"]

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <HeroSection
        title={t("agenda.title")}
        subtitle={t("agenda.subtitle")}
        backgroundImage="/vibrant-african-event-crowd-youth-technology-futur.png"
      />

      {/* Filters */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-card sticky top-20 z-40 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Theme */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Filter size={18} className="text-secondary" />
                <label className="font-bold text-foreground">
                  {t("agenda.filterTheme")}
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                {themes.map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setSelectedTheme(theme)}
                    className={`px-4 py-2 rounded-sm font-medium transition-colors capitalize ${selectedTheme === theme
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-foreground hover:bg-border"
                      }`}
                  >
                    {theme === "all"
                      ? t("agenda.allThemes")
                      : theme}
                  </button>
                ))}
              </div>
            </div>

            {/* Audience */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <User size={18} className="text-secondary" />
                <label className="font-bold text-foreground">
                  {t("agenda.filterAudience")}
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                {audiences.map((audience) => (
                  <button
                    key={audience}
                    onClick={() => setSelectedAudience(audience)}
                    className={`px-4 py-2 rounded-sm font-medium transition-colors capitalize ${selectedAudience === audience
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-foreground hover:bg-border"
                      }`}
                  >
                    {audience === "all"
                      ? t("agenda.allAudiences")
                      : audience}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Sessions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          {filteredSessions.length > 0 ? (
            <div className="space-y-6">
              {filteredSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-foreground/70">
                {t("agenda.noSessions")}
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

interface SessionCardProps {
  session: Session
}

function SessionCard({ session }: SessionCardProps) {
  const { t } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)

  const themeColors: Record<string, string> = {
    technology: "bg-blue-100 text-blue-800",
    innovation: "bg-purple-100 text-purple-800",
    education: "bg-green-100 text-green-800",
    employment: "bg-amber-100 text-amber-800",
    networking: "bg-pink-100 text-pink-800",
  }

  const themeKey = session.theme ?? session.type ?? ""
  const themeClass =
    themeColors[themeKey] ?? "bg-muted text-foreground"

  return (
    <div className="border border-border rounded-sm p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col lg:flex-row justify-between gap-4">

        <div className="flex-1">
          {themeKey && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${themeClass}`}
            >
              {themeKey}
            </span>
          )}

          <h3 className="text-xl font-bold mt-3 mb-2 text-foreground">
            {session.title}
          </h3>

          <p className="text-foreground/70 mb-4">
            {session.description}
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-foreground/60 mb-4">
            {session.date && (
              <div className="flex items-center gap-1">
                <Clock size={16} />
                {new Date(session.date).toLocaleString()}
              </div>
            )}

            {session.location && (
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                {session.location}
              </div>
            )}
          </div>

          {isExpanded && session.expectedOutcomes?.length ? (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm font-bold mb-2">
                {t("agenda.outcomes")}
              </p>
              {session.expectedOutcomes.map((outcome, i) => (
                <p key={i} className="text-sm text-foreground/70">
                  → {outcome}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-secondary hover:text-primary font-bold"
        >
          {isExpanded
            ? `${t("agenda.showLess")} ▲`
            : `${t("agenda.learnMore")} ▼`}
        </button>
      </div>
    </div>
  )
}