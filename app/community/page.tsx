"use client"

import type React from "react"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { Users, MessageCircle, Briefcase, Award, Lock, Globe } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface CommunityMember {
  id: string
  name: string
  role: string
  category: "youth" | "mentor" | "expert" | "company"
  bio: string
  expertise: string[]
  location: string
  connections: number
}

interface ExclusiveContent {
  id: string
  titleKey: string
  type: "webinar" | "guide" | "toolkit" | "challenge"
  descriptionKey: string
  date?: string
  author: string
}

const members: CommunityMember[] = [
  {
    id: "1",
    name: "Zainab Hassan",
    role: "Product Manager @ TechCorp",
    category: "mentor",
    bio: "7 years in tech leadership. Passionate about mentoring the next generation of African tech leaders.",
    expertise: ["Product Management", "Career Development", "Startups"],
    location: "Lagos, Nigeria",
    connections: 342,
  },
  {
    id: "2",
    name: "Kwame Mensah",
    role: "Computer Science Student",
    category: "youth",
    bio: "Aspiring software engineer interested in AI and machine learning. Building my first startup.",
    expertise: ["Python", "Machine Learning", "Web Development"],
    location: "Accra, Ghana",
    connections: 89,
  },
  {
    id: "3",
    name: "Dr. Amara Okonkwo",
    role: "Research Scientist",
    category: "expert",
    bio: "PhD in Computer Science. Leading research on AI applications for African challenges.",
    expertise: ["AI Research", "Data Science", "Academic Leadership"],
    location: "Nairobi, Kenya",
    connections: 567,
  },
  {
    id: "4",
    name: "Continental Bank HR Team",
    role: "Talent Acquisition",
    category: "company",
    bio: "Recruiting top talent across Africa. Offering internships, graduate programs, and leadership roles.",
    expertise: ["Recruitment", "Career Development", "Leadership Training"],
    location: "Johannesburg, South Africa",
    connections: 1200,
  },
  {
    id: "5",
    name: "Ama Boateng",
    role: "Entrepreneur & Investor",
    category: "mentor",
    bio: "Founded and scaled 3 tech startups. Now investing in early-stage African founders.",
    expertise: ["Entrepreneurship", "Fundraising", "Business Strategy"],
    location: "Accra, Ghana",
    connections: 456,
  },
  {
    id: "6",
    name: "Chioma Adeyemi",
    role: "Full Stack Developer",
    category: "youth",
    bio: "Recent bootcamp graduate working on freelance projects. Open to collaborations and mentorship.",
    expertise: ["React", "Node.js", "DevOps"],
    location: "Lagos, Nigeria",
    connections: 134,
  },
]

export default function CommunityPage() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "content" | "groups">("overview")
  const [selectedCategory, setSelectedCategory] = useState<"all" | "youth" | "mentor" | "expert" | "company">("all")

  const filteredMembers = selectedCategory === "all" ? members : members.filter((m) => m.category === selectedCategory)

  const exclusiveContent: ExclusiveContent[] = [
    {
      id: "1",
      titleKey: "community.content1Title",
      type: "guide",
      descriptionKey: "community.content1Desc",
      author: "Kwame Asenso-Boadi",
    },
    {
      id: "2",
      titleKey: "community.content2Title",
      type: "webinar",
      descriptionKey: "community.content2Desc",
      date: "March 20, 2025 - 8:00 PM CAT",
      author: "Ama Boateng",
    },
    {
      id: "3",
      titleKey: "community.content3Title",
      type: "toolkit",
      descriptionKey: "community.content3Desc",
      author: "TechCorp Africa Research",
    },
    {
      id: "4",
      titleKey: "community.content4Title",
      type: "challenge",
      descriptionKey: "community.content4Desc",
      author: "Community Team",
    },
  ]

  const benefits = [
    { icon: Users, titleKey: "community.benefit1", descKey: "community.benefit1Desc" },
    { icon: MessageCircle, titleKey: "community.benefit2", descKey: "community.benefit2Desc" },
    { icon: Briefcase, titleKey: "community.benefit3", descKey: "community.benefit3Desc" },
    { icon: Award, titleKey: "community.benefit4", descKey: "community.benefit4Desc" },
    { icon: Globe, titleKey: "community.benefit5", descKey: "community.benefit5Desc" },
    { icon: Lock, titleKey: "community.benefit6", descKey: "community.benefit6Desc" },
  ]

  const groups = [
    { nameKey: "community.group1", descKey: "community.group1Desc", members: "2,340" },
    { nameKey: "community.group2", descKey: "community.group2Desc", members: "1,890" },
    { nameKey: "community.group3", descKey: "community.group3Desc", members: "1,250" },
    { nameKey: "community.group4", descKey: "community.group4Desc", members: "980" },
    { nameKey: "community.group5", descKey: "community.group5Desc", members: "1,560" },
    { nameKey: "community.group6", descKey: "community.group6Desc", members: "850" },
  ]

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <HeroSection
        title={t("community.title")}
        subtitle={t("community.subtitle")}
        backgroundImage="/vibrant-african-event-crowd-youth-technology-futur.png"
      />

      {/* Intro Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">{t("community.intro")}</h2>
          <p className="text-lg text-foreground/80 leading-relaxed">{t("community.introDesc")}</p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-foreground text-center">{t("community.benefits")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="p-8 border border-border rounded-sm hover:shadow-lg transition-shadow">
                <benefit.icon className="w-8 h-8 text-secondary mb-4" />
                <h3 className="text-lg font-bold mb-2 text-foreground">{t(benefit.titleKey)}</h3>
                <p className="text-foreground/70">{t(benefit.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-card sticky top-20 z-40 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 border-b border-border pb-4">
            {[
              { id: "overview" as const, labelKey: "community.tabOverview" },
              { id: "members" as const, labelKey: "community.tabMembers" },
              { id: "content" as const, labelKey: "community.tabContent" },
              { id: "groups" as const, labelKey: "community.tabGroups" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 font-bold transition-colors ${
                  activeTab === tab.id
                    ? "text-secondary border-b-2 border-secondary"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          {/* Members Tab */}
          {activeTab === "members" && (
            <div>
              <h2 className="text-3xl font-bold mb-8 text-foreground">{t("community.members")}</h2>

              {/* Filter */}
              <div className="mb-8 flex flex-wrap gap-2">
                {[
                  { id: "all", labelKey: "community.allMembers" },
                  { id: "youth", labelKey: "community.filterYouth" },
                  { id: "mentor", labelKey: "community.filterMentor" },
                  { id: "expert", labelKey: "community.filterExpert" },
                  { id: "company", labelKey: "community.filterCompany" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`px-4 py-2 rounded-sm font-medium transition-colors capitalize ${
                      selectedCategory === cat.id
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-foreground hover:bg-border"
                    }`}
                  >
                    {t(cat.labelKey)}
                  </button>
                ))}
              </div>

              {/* Members Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="border border-border rounded-sm p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-secondary-foreground font-bold text-lg">{member.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground">{member.name}</h3>
                        <p className="text-sm text-foreground/70">{member.role}</p>
                      </div>
                    </div>

                    <p className="text-sm text-foreground/70 mb-4">{member.bio}</p>

                    <div className="mb-4">
                      <p className="text-xs font-bold text-foreground mb-2">{t("community.expertise")}</p>
                      <div className="flex flex-wrap gap-1">
                        {member.expertise.slice(0, 2).map((skill, idx) => (
                          <span key={idx} className="text-xs bg-muted text-foreground px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-foreground/60 mb-4 pb-4 border-t border-border pt-4">
                      <span>{member.location}</span>
                      <span>
                        {member.connections} {t("community.connections")}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 bg-primary text-primary-foreground px-3 py-2 rounded-sm font-bold text-sm hover:opacity-90 transition-opacity">
                        {t("community.connect")}
                      </button>
                      <button className="flex-1 border border-primary text-primary px-3 py-2 rounded-sm font-bold text-sm hover:bg-primary/5 transition-colors">
                        {t("community.message")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exclusive Content Tab */}
          {activeTab === "content" && (
            <div>
              <h2 className="text-3xl font-bold mb-8 text-foreground">{t("community.content")}</h2>
              <div className="space-y-6">
                {exclusiveContent.map((content) => {
                  const icons: Record<string, React.ReactNode> = {
                    webinar: <Award className="w-6 h-6" />,
                    guide: <MessageCircle className="w-6 h-6" />,
                    toolkit: <Briefcase className="w-6 h-6" />,
                    challenge: <Users className="w-6 h-6" />,
                  }

                  return (
                    <div
                      key={content.id}
                      className="border border-border rounded-sm p-8 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-secondary/20 rounded-sm flex items-center justify-center flex-shrink-0 text-secondary">
                          {icons[content.type]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-bold text-foreground mb-1">{t(content.titleKey)}</h3>
                              <p className="text-sm text-foreground/60">
                                {t(`community.type.${content.type}`)}
                                {content.date && ` • ${content.date}`}
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded capitalize">
                              {t(`community.type.${content.type}`)}
                            </span>
                          </div>
                          <p className="text-foreground/70 mt-4 mb-4">{t(content.descriptionKey)}</p>
                          <p className="text-sm font-bold text-foreground">
                            {t("community.by")} {content.author}
                          </p>
                        </div>
                      </div>
                      <button className="bg-primary text-primary-foreground px-6 py-2 rounded-sm font-bold hover:opacity-90 transition-opacity">
                        {t("community.accessContent")}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Interest Groups Tab */}
          {activeTab === "groups" && (
            <div>
              <h2 className="text-3xl font-bold mb-8 text-foreground">{t("community.groups")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groups.map((group, idx) => (
                  <div key={idx} className="border border-border rounded-sm p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-bold text-foreground mb-2">{t(group.nameKey)}</h3>
                    <p className="text-sm text-secondary font-bold mb-3">
                      {group.members} {t("community.membersCount")}
                    </p>
                    <p className="text-foreground/70 mb-6">{t(group.descKey)}</p>
                    <button className="w-full bg-secondary text-secondary-foreground px-6 py-2 rounded-sm font-bold hover:opacity-90 transition-opacity">
                      {t("community.joinGroup")}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-bold mb-8 text-foreground">{t("community.stats")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { number: "8,500+", labelKey: "community.stat1" },
                    { number: "50+", labelKey: "community.stat2" },
                    { number: "200+", labelKey: "community.stat3" },
                    { number: "10K+", labelKey: "community.stat4" },
                  ].map((stat, idx) => (
                    <div key={idx} className="border border-border rounded-sm p-8 text-center">
                      <p className="text-4xl font-bold text-secondary mb-2">{stat.number}</p>
                      <p className="text-foreground/70">{t(stat.labelKey)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6 text-foreground">{t("community.howWorks")}</h2>
                <div className="space-y-6">
                  {[
                    { step: 1, titleKey: "community.step1", descKey: "community.step1Desc" },
                    { step: 2, titleKey: "community.step2", descKey: "community.step2Desc" },
                    { step: 3, titleKey: "community.step3", descKey: "community.step3Desc" },
                    { step: 4, titleKey: "community.step4", descKey: "community.step4Desc" },
                    { step: 5, titleKey: "community.step5", descKey: "community.step5Desc" },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-6 items-start">
                      <div className="w-12 h-12 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground mb-2">{t(item.titleKey)}</h3>
                        <p className="text-foreground/70">{t(item.descKey)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Community Image */}
              <div className="mt-12">
                <img
                  src="/diverse-african-professionals-networking-at-confer.jpg"
                  alt="PASS AVENIR Community"
                  className="w-full h-80 object-cover rounded-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-primary-foreground">{t("community.ctaTitle")}</h2>
          <p className="text-lg text-primary-foreground/90 mb-8">{t("community.ctaDesc")}</p>
          <button className="bg-secondary text-secondary-foreground px-8 py-3 rounded-sm font-bold hover:opacity-90 transition-opacity">
            {t("community.ctaBtn")}
          </button>
        </div>
      </section>

      <Footer />
    </main>
  )
}
