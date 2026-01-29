"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { CalendarExport } from "@/components/calendar-export"
import { Filter, Clock, MapPin, User } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import type { CalendarEvent } from "@/lib/calendar-export"

interface Session {
  id: string
  title: string
  description: string
  speakers: string[]
  time: string
  location: string
  theme: string
  audience: string[]
  expectedOutcomes: string[]
}

const sessions: Session[] = [
  {
    id: "1",
    title: "Opening Keynote: Africa's Digital Revolution",
    description:
      "A visionary perspective on how technology is reshaping Africa's future and creating unprecedented opportunities for young leaders.",
    speakers: ["Dr. Kwame Asenso-Boadi", "Tech Innovator & Investor"],
    time: "09:00 - 10:00",
    location: "Main Hall",
    theme: "technology",
    audience: ["youth", "companies", "institutions"],
    expectedOutcomes: [
      "Understand Africa's tech landscape",
      "Discover emerging opportunities",
      "Network with industry leaders",
    ],
  },
  {
    id: "2",
    title: "Pathways to Tech: From Bootcamp to Career",
    description:
      "Explore different routes into technology careers—from traditional degrees to bootcamps to self-taught paths. Hear from successful practitioners.",
    speakers: ["Amara Okonkwo", "Tech Career Coach"],
    time: "10:30 - 11:30",
    location: "Workshop Room A",
    theme: "technology",
    audience: ["youth"],
    expectedOutcomes: [
      "Learn multiple career entry points",
      "Discover skill-building resources",
      "Get personalized career guidance",
    ],
  },
  {
    id: "3",
    title: "Building Startups in Africa: Challenges & Opportunities",
    description:
      "Entrepreneurs discuss the realities of building tech startups on the continent, funding landscape, and lessons learned.",
    speakers: ["Chioma Adeleke", "Startup Founder", "Tunde Adeniyi", "Venture Capitalist"],
    time: "12:00 - 13:00",
    location: "Innovation Stage",
    theme: "innovation",
    audience: ["youth", "companies"],
    expectedOutcomes: ["Understand startup ecosystem", "Learn funding strategies", "Network with entrepreneurs"],
  },
  {
    id: "4",
    title: "Lunch & Networking",
    description: "Casual dining and structured networking sessions organized by interest areas.",
    speakers: [],
    time: "13:00 - 14:00",
    location: "Expo Hall",
    theme: "networking",
    audience: ["youth", "companies", "institutions"],
    expectedOutcomes: ["Build meaningful connections", "Meet mentors", "Explore opportunities"],
  },
  {
    id: "5",
    title: "Workshop: Personal Branding for Success",
    description:
      "Learn how to build your professional brand, create compelling resumes and portfolios, and stand out to employers.",
    speakers: ["Zainab Hassan", "Career Development Expert"],
    time: "14:30 - 15:30",
    location: "Workshop Room B",
    theme: "education",
    audience: ["youth"],
    expectedOutcomes: ["Create strong personal brand", "Build professional portfolio", "Improve interview skills"],
  },
  {
    id: "6",
    title: "Panel: Women in Leadership Across Africa",
    description:
      "Inspiring women leaders share their journeys, challenges, and advice for the next generation of female leaders.",
    speakers: ["Minister Fatima Diallo", "CEO Ama Mensah", "Entrepreneur Leah Kipchoge"],
    time: "15:45 - 16:45",
    location: "Main Hall",
    theme: "employment",
    audience: ["youth", "companies", "institutions"],
    expectedOutcomes: ["Get inspired by real stories", "Learn leadership principles", "Connect with female mentors"],
  },
  {
    id: "7",
    title: "Sponsor Spotlight: Global Opportunities",
    description:
      "Leading companies and institutions present exclusive opportunities—jobs, internships, scholarships, and programs.",
    speakers: ["Representatives from Google", "Microsoft", "African Development Bank"],
    time: "17:00 - 18:00",
    location: "Expo Hall",
    theme: "employment",
    audience: ["youth"],
    expectedOutcomes: ["Discover job openings", "Learn about internship programs", "Access scholarship information"],
  },
  {
    id: "8",
    title: "Networking Dinner & Closing Remarks",
    description:
      "Evening celebration with mentors, speakers, and participants. Final reflections and announcements for continued engagement.",
    speakers: [],
    time: "19:00 - 21:00",
    location: "Grand Ballroom",
    theme: "networking",
    audience: ["youth", "companies", "institutions"],
    expectedOutcomes: ["Celebrate collective success", "Plan next steps", "Join the year-round community"],
  },
]

const themes = ["all", "technology", "innovation", "education", "employment", "networking"]
const audiences = ["all", "youth", "companies", "institutions"]

export default function AgendaPage() {
  const { t, language } = useLanguage()
  const [selectedTheme, setSelectedTheme] = useState("all")
  const [selectedAudience, setSelectedAudience] = useState("all")

  const filteredSessions = sessions.filter((session) => {
    const themeMatch = selectedTheme === "all" || session.theme === selectedTheme
    const audienceMatch = selectedAudience === "all" || session.audience.includes(selectedAudience)
    return themeMatch && audienceMatch
  })

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
            {/* Theme Filter */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Filter size={18} className="text-secondary" />
                <label className="font-bold text-foreground">{t("agenda.filterTheme")}</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {themes.map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setSelectedTheme(theme)}
                    className={`px-4 py-2 rounded-sm font-medium transition-colors capitalize ${
                      selectedTheme === theme
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-foreground hover:bg-border"
                    }`}
                  >
                    {theme === "all" ? t("agenda.allThemes") : theme}
                  </button>
                ))}
              </div>
            </div>

            {/* Audience Filter */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <User size={18} className="text-secondary" />
                <label className="font-bold text-foreground">{t("agenda.filterAudience")}</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {audiences.map((audience) => (
                  <button
                    key={audience}
                    onClick={() => setSelectedAudience(audience)}
                    className={`px-4 py-2 rounded-sm font-medium transition-colors capitalize ${
                      selectedAudience === audience
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-foreground hover:bg-border"
                    }`}
                  >
                    {audience === "all" ? t("agenda.allAudiences") : audience}
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
          <div className="mb-8">
            <p className="text-foreground/70">
              {t("agenda.showing")
                .replace("{count}", filteredSessions.length.toString())
                .replace("{total}", sessions.length.toString())}
            </p>
          </div>

          {filteredSessions.length > 0 ? (
            <div className="space-y-6">
              {filteredSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-foreground/70">{t("agenda.noSessions")}</p>
            </div>
          )}
        </div>
      </section>

      {/* Calendar Export */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-primary/5 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">Add to Your Calendar</h3>
              <p className="text-foreground/70">Export all sessions and add them to your favorite calendar app</p>
            </div>
            <CalendarExport
              events={sessions.map((s) => ({
                id: s.id,
                title: s.title,
                description: s.description,
                startTime: new Date("2025-03-15 " + s.time.split(" - ")[0]),
                endTime: new Date("2025-03-15 " + s.time.split(" - ")[1]),
                location: s.location,
              }))}
              showLabel={true}
            />
          </div>
        </div>
      </section>

      {/* Logistics */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-foreground">{t("agenda.logistics")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border border-border rounded-sm">
              <h3 className="text-lg font-bold mb-4 text-foreground">{t("agenda.date")}</h3>
              <p className="text-foreground/70 whitespace-pre-line">{t("agenda.dateValue")}</p>
            </div>
            <div className="p-8 border border-border rounded-sm">
              <h3 className="text-lg font-bold mb-4 text-foreground">{t("agenda.venue")}</h3>
              <p className="text-foreground/70 whitespace-pre-line">{t("agenda.venueValue")}</p>
            </div>
            <div className="p-8 border border-border rounded-sm">
              <h3 className="text-lg font-bold mb-4 text-foreground">{t("agenda.bring")}</h3>
              <p className="text-foreground/70 whitespace-pre-line">{t("agenda.bringValue")}</p>
            </div>
          </div>
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
    technology: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    innovation: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    education: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    employment: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    networking: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  }

  return (
    <div className="border border-border rounded-sm p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4 justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${themeColors[session.theme]}`}>
              {session.theme}
            </span>
          </div>

          <h3 className="text-xl font-bold mb-2 text-foreground">{session.title}</h3>
          <p className="text-foreground/70 mb-4">{session.description}</p>

          <div className="flex flex-wrap gap-4 text-sm text-foreground/60 mb-4">
            <div className="flex items-center gap-1">
              <Clock size={16} className="text-secondary" />
              {session.time}
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={16} className="text-secondary" />
              {session.location}
            </div>
          </div>

          {session.speakers.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-bold text-foreground mb-1">{t("agenda.speakers")}</p>
              <p className="text-sm text-foreground/70">{session.speakers.join(", ")}</p>
            </div>
          )}

          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-border space-y-4">
              <div>
                <p className="text-sm font-bold text-foreground mb-2">{t("agenda.outcomes")}</p>
                <ul className="space-y-1">
                  {session.expectedOutcomes.map((outcome, idx) => (
                    <li key={idx} className="text-sm text-foreground/70 flex gap-2">
                      <span className="text-secondary">→</span> {outcome}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground mb-2">{t("agenda.for")}</p>
                <div className="flex flex-wrap gap-2">
                  {session.audience.map((aud) => (
                    <span key={aud} className="text-xs bg-muted text-foreground px-2 py-1 rounded capitalize">
                      {aud}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-secondary hover:text-primary font-bold transition-colors flex-shrink-0 whitespace-nowrap"
        >
          {isExpanded ? `${t("agenda.showLess")} ▲` : `${t("agenda.learnMore")} ▼`}
        </button>
      </div>
    </div>
  )
}
