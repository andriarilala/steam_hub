"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { Download, FileText, Send, Check, X, Building, Mail, Phone, User } from "lucide-react"
import SponsorFormModal from "@/components/sponsor-form-modal" // Import SponsorFormModal

interface Partner {
  id: string
  name: string
  logo: string
  category: "tech" | "finance" | "education" | "ngo" | "government"
  tagline: string
  description: string
  opportunities: string[]
  impact: string
}

const partners: Partner[] = [
  {
    id: "1",
    name: "TechCorp Africa",
    logo: "TC",
    category: "tech",
    tagline: "Building Africa's Tech Future",
    description:
      "Leading technology company with operations across 15 African countries, dedicated to developing innovative solutions that drive digital transformation and create employment opportunities for young African talent.",
    opportunities: ["Graduate Programs", "Internships", "Tech Mentorship", "Innovation Challenges"],
    impact: "Empowering 50,000+ young technologists across Africa",
  },
  {
    id: "2",
    name: "Continental Bank",
    logo: "CB",
    category: "finance",
    tagline: "Financing Africa's Ambitions",
    description:
      "Premier financial institution providing capital, mentorship, and resources to promising African entrepreneurs and innovators. We believe in investing in people and ideas that will shape Africa's future.",
    opportunities: ["Startup Funding", "Internship Programs", "Leadership Training", "Scholarship Fund"],
    impact: "Invested $500M in African startups and talent development",
  },
  {
    id: "3",
    name: "African University Consortium",
    logo: "AUC",
    category: "education",
    tagline: "Elevating African Education",
    description:
      "Network of 50+ leading universities across Africa collaborating to provide world-class education and research opportunities. Committed to bridging the gap between academia and industry.",
    opportunities: ["Scholarships", "Research Positions", "Joint Programs", "Faculty Exchange"],
    impact: "Supporting 100,000+ students annually across the continent",
  },
  {
    id: "4",
    name: "Global Impact Foundation",
    logo: "GIF",
    category: "ngo",
    tagline: "Driving Sustainable Impact",
    description:
      "International NGO focused on sustainable development, social entrepreneurship, and youth empowerment. We work to create lasting positive change in communities across Africa.",
    opportunities: ["Fellowship Programs", "Social Enterprise Support", "Community Projects", "Advocacy Roles"],
    impact: "Impacted 500,000+ lives through development programs",
  },
  {
    id: "5",
    name: "Ministry of Innovation",
    logo: "MOI",
    category: "government",
    tagline: "Government's Technology & Innovation Hub",
    description:
      "National government agency driving digital transformation and innovation policy. Creating pathways for young talent to contribute to nation-building through technology and entrepreneurship.",
    opportunities: ["Policy Advisory Roles", "Government Internships", "National Programs", "Innovation Hubs"],
    impact: "Supporting national digital agenda and youth employment",
  },
  {
    id: "6",
    name: "Global Tech Solutions",
    logo: "GTS",
    category: "tech",
    tagline: "Your Gateway to Global Tech",
    description:
      "International technology consultancy with deep roots in Africa, connecting local talent with global opportunities. Specializing in upskilling, placement, and career development.",
    opportunities: ["Job Placements", "Technical Training", "International Exchanges", "Certifications"],
    impact: "Connected 10,000+ African tech professionals with global roles",
  },
]

const categories = [
  { id: "tech", label: "Technology", color: "bg-blue-100 dark:bg-blue-900" },
  { id: "finance", label: "Finance", color: "bg-emerald-100 dark:bg-emerald-900" },
  { id: "education", label: "Education", color: "bg-purple-100 dark:bg-purple-900" },
  { id: "ngo", label: "NGO & Non-profit", color: "bg-orange-100 dark:bg-orange-900" },
  { id: "government", label: "Government", color: "bg-red-100 dark:bg-red-900" },
]

export default function PartnersPage() {
  const { t } = useLanguage()
  const [showSponsorForm, setShowSponsorForm] = useState(false) // Declare showSponsorForm

  // Download functions - simulates downloading PDF/ZIP files
  const handleDownloadDeck = () => {
    // Create a simple text-based PDF simulation
    const content = `
PASS AVENIR - Partnership Prospectus 2025
==========================================

About PASS AVENIR
-----------------
PASS AVENIR is Africa's premier talent and opportunity summit, 
connecting 10,000+ young talents with leading institutions and companies.

Event Details
-------------
Date: March 15-16, 2025
Location: International Convention Center, Accra, Ghana
Expected Attendance: 10,000+ participants

Partnership Packages
--------------------

INSTITUTIONAL (€25,000)
- Dedicated profile page
- Logo in all materials
- Social media mentions
- 1 booth space (2x2m)
- Email access to participant database

IMPACT (€50,000)
- All Institutional benefits
- Premium profile with video
- Branded booth (2x2m)
- 15-minute speaking slot
- Newsletter feature
- Lead capture tools
- Post-event analytics

INNOVATION (€100,000)
- All Impact benefits
- Signature innovation showcase
- Premium booth (3x3m)
- Keynote or workshop slot
- VIP reception hosting
- Exclusive data access
- Year-round promotion

PREMIUM (€200,000+)
- Exclusive flagship partnership
- Flagship booth presence
- Custom brand integration
- Private mentorship events
- Strategic planning partnership
- Multi-year commitment benefits

Contact Us
----------
Email: sponsors@passavenir.com
Phone: +233 XX XXX XXXX
Website: www.passavenir.com
    `

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "PASS_AVENIR_Partnership_Prospectus_2025.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadBrandKit = () => {
    const content = `
PASS AVENIR - Brand Guidelines
==============================

Logo Usage
----------
- Primary logo: Full color on light backgrounds
- Reversed logo: White on dark backgrounds
- Minimum size: 40px height
- Clear space: Equal to the height of the 'P' in PASS

Colors
------
Primary: #1A1A2E (Deep Navy)
Secondary: #D4AF37 (Gold)
Accent: #16697A (Teal)
Background: #FAF9F6 (Cream)

Typography
----------
Headlines: Inter Bold
Body: Inter Regular
Accent: Inter Medium

Brand Assets Available
----------------------
- Logo files (PNG, SVG, EPS)
- Color palette
- Typography guidelines
- Social media templates
- Email signatures
- PowerPoint templates

For full brand assets, contact: brand@passavenir.com
    `

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "PASS_AVENIR_Brand_Guidelines.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadSchedule = () => {
    const content = `
PASS AVENIR 2025 - Event Schedule
=================================

DAY 1 - March 15, 2025
----------------------

08:00 - 09:00  Registration & Welcome Coffee
09:00 - 10:00  Opening Ceremony & Keynote
10:00 - 11:30  Panel: Africa's Digital Future
11:30 - 12:00  Coffee Break & Networking
12:00 - 13:00  Workshop Sessions (Multiple Tracks)
13:00 - 14:30  Lunch & Exhibition
14:30 - 16:00  Talent Showcase & Pitch Competition
16:00 - 17:30  Mentorship Sessions
17:30 - 19:00  Evening Networking Reception

DAY 2 - March 16, 2025
----------------------

08:30 - 09:00  Welcome Coffee
09:00 - 10:30  Keynote: Innovation in Africa
10:30 - 12:00  Career Fair & Company Booths
12:00 - 13:30  Lunch & Sponsor Presentations
13:30 - 15:00  Workshop Sessions (Multiple Tracks)
15:00 - 16:30  Startup Pitch Finals
16:30 - 17:00  Awards Ceremony
17:00 - 18:00  Closing Keynote
18:00 - 21:00  Closing Celebration & Networking

SPONSOR ACTIVATION OPPORTUNITIES
--------------------------------
- Branded coffee breaks
- Lunch presentations
- Workshop sponsorship
- Evening reception hosting
- Award sponsorship
- Booth activations
- Digital signage

For sponsorship inquiries: sponsors@passavenir.com
    `

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "PASS_AVENIR_Event_Schedule_2025.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <HeroSection
        title={t("partners.title")}
        subtitle={t("partners.subtitle")}
        backgroundImage="/vibrant-african-event-crowd-youth-technology-futur.png"
      />

      {/* Intro Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">{t("partners.expo")}</h2>
          <p className="text-lg text-foreground/80 leading-relaxed">{t("partners.expoDesc")}</p>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-foreground">{t("partners.featured")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {partners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        </div>
      </section>

      {/* Sponsor Packages section hidden for now
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-foreground text-center">{t("partners.packages")}</h2>
          <p className="text-center text-foreground/70 mb-12 max-w-2xl mx-auto">{t("partners.packagesDesc")}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: t("partners.institutional"),
                price: "€25K",
                benefits: [
                  "Dedicated profile page",
                  "Logo in materials",
                  "Social media mentions",
                  "1 booth space",
                  "Email access to participants",
                ],
              },
              {
                name: t("partners.impact"),
                price: "€50K",
                benefits: [
                  "Premium profile with video",
                  "Branded booth (2x2m)",
                  "Speaking slot (15 min)",
                  "Newsletter feature",
                  "Lead capture tools",
                  "Post-event analytics",
                ],
              },
              {
                name: t("partners.innovation"),
                price: "€100K",
                benefits: [
                  "Signature innovation showcase",
                  "Premium booth (3x3m)",
                  "Keynote or workshop slot",
                  "VIP reception hosting",
                  "Exclusive data access",
                  "Year-round promotion",
                ],
              },
              {
                name: t("partners.premium"),
                price: "€200K+",
                benefits: [
                  "Exclusive partnership",
                  "Flagship booth presence",
                  "Custom brand integration",
                  "Private mentorship events",
                  "Strategic planning partnership",
                  "Multi-year commitment benefits",
                ],
              },
            ].map((pkg, idx) => (
              <div
                key={idx}
                className="border border-border rounded-sm p-8 hover:shadow-lg transition-shadow flex flex-col"
              >
                <h3 className="text-xl font-bold mb-2 text-foreground">{pkg.name}</h3>
                <p className="text-2xl font-bold text-secondary mb-6">{pkg.price}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {pkg.benefits.map((benefit, bidx) => (
                    <li key={bidx} className="flex gap-2 text-sm text-foreground/70">
                      <span className="text-secondary font-bold">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <button className="bg-primary text-primary-foreground px-6 py-2 rounded-sm font-bold hover:opacity-90 transition-opacity w-full">
                  Learn More
                </button>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-foreground/70 mb-6">{t("partners.partnersReady")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleDownloadDeck} // Use handleDownloadDeck function
                className="bg-secondary text-secondary-foreground px-8 py-3 rounded-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                {t("partners.downloadDeck")}
              </button>
              <button
                onClick={() => setShowSponsorForm(true)} // Use setShowSponsorForm function
                className="border-2 border-primary text-primary px-8 py-3 rounded-sm font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {t("partners.contactSales")}
              </button>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Sponsor Contact Form Modal */}
      <SponsorFormModal isOpen={showSponsorForm} onClose={() => setShowSponsorForm(false)} />

      {/* Sponsor Resources section hidden for now
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-foreground text-center">Sponsor Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Partnership Prospectus</h3>
              <p className="text-sm text-foreground/70 mb-4">
                Complete overview of partnership opportunities, packages, and benefits for sponsors.
              </p>
              <button
                onClick={handleDownloadDeck} // Use handleDownloadDeck function
                className="text-primary font-medium text-sm flex items-center gap-2 hover:underline"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>

            <div className="border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Brand Guidelines</h3>
              <p className="text-sm text-foreground/70 mb-4">
                Official PASS AVENIR brand assets, logos, and usage guidelines for partners.
              </p>
              <button
                onClick={handleDownloadBrandKit} // Use handleDownloadBrandKit function
                className="text-secondary font-medium text-sm flex items-center gap-2 hover:underline"
              >
                <Download className="w-4 h-4" />
                Download ZIP
              </button>
            </div>

            <div className="border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Event Schedule</h3>
              <p className="text-sm text-foreground/70 mb-4">
                Detailed event agenda with sponsor activation opportunities and key moments.
              </p>
              <button
                onClick={handleDownloadSchedule} // Use handleDownloadSchedule function
                className="text-accent font-medium text-sm flex items-center gap-2 hover:underline"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Why Partner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-foreground text-center">{t("partners.why")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: t("partners.why1"),
                description: t("partners.why1Desc"),
              },
              {
                title: t("partners.why2"),
                description: t("partners.why2Desc"),
              },
              {
                title: t("partners.why3"),
                description: t("partners.why3Desc"),
              },
              {
                title: t("partners.why4"),
                description: t("partners.why4Desc"),
              },
              {
                title: t("partners.why5"),
                description: t("partners.why5Desc"),
              },
              {
                title: t("partners.why6"),
                description: t("partners.why6Desc"),
              },
            ].map((item, idx) => (
              <div key={idx} className="p-8 border border-border rounded-sm">
                <h3 className="text-lg font-bold mb-3 text-foreground">{item.title}</h3>
                <p className="text-foreground/70">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

interface PartnerCardProps {
  partner: Partner
}

function PartnerCard({ partner }: PartnerCardProps) {
  const categoryInfo = categories.find((cat) => cat.id === partner.category)

  return (
    <Link href={`/partners/${partner.id}`}>
      <div className="group cursor-pointer h-full border border-border rounded-sm overflow-hidden hover:shadow-lg transition-all hover:border-secondary">
        {/* Header */}
        <div className={`p-8 text-center ${categoryInfo?.color}`}>
          <div className="w-16 h-16 bg-primary rounded-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <span className="text-primary-foreground font-bold text-xl">{partner.logo}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">{categoryInfo?.label}</p>
          <h3 className="text-lg font-bold mb-1 text-foreground group-hover:text-secondary transition-colors">
            {partner.name}
          </h3>
          <p className="text-sm italic text-foreground/60 mb-4">{partner.tagline}</p>
          <p className="text-sm text-foreground/70 mb-6 line-clamp-3">{partner.description}</p>

          {/* Opportunities */}
          <div className="mb-6">
            <p className="text-xs font-bold text-foreground mb-2">Opportunities:</p>
            <div className="flex flex-wrap gap-2">
              {partner.opportunities.slice(0, 2).map((opp, idx) => (
                <span key={idx} className="text-xs bg-muted text-foreground px-2 py-1 rounded">
                  {opp}
                </span>
              ))}
              {partner.opportunities.length > 2 && (
                <span className="text-xs bg-muted text-foreground px-2 py-1 rounded">
                  +{partner.opportunities.length - 2} more
                </span>
              )}
            </div>
          </div>

          {/* Impact */}
          <p className="text-xs font-bold text-secondary">{partner.impact}</p>
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 bg-muted border-t border-border group-hover:bg-secondary/10 transition-colors">
          <p className="text-sm font-bold text-secondary">View Full Profile →</p>
        </div>
      </div>
    </Link>
  )
}
