"use client"

import type React from "react"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { Mail, MapPin, Phone, MessageSquare } from "lucide-react"

interface FormData {
  name: string
  email: string
  participantType: "youth" | "sponsor" | "partner" | "media" | "other"
  subject: string
  message: string
}

export default function ContactPage() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    participantType: "youth",
    subject: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        participantType: "youth",
        subject: "",
        message: "",
      })
      setSubmitted(false)
    }, 3000)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <HeroSection
        title={t("contact.title")}
        subtitle={t("contact.subtitle")}
        backgroundImage="/contact-support-communication.jpg"
      />

      {/* Quick Contact Options */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-foreground text-center">{t("contact.helpWith")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Mail,
                title: t("contact.email"),
                description: "hello@passavenir.com",
                subtext: t("contact.emailDesc"),
              },
              {
                icon: Phone,
                title: t("contact.phone"),
                description: "+234 (0) 800 000 1234",
                subtext: t("contact.phoneDesc"),
              },
              {
                icon: MessageSquare,
                title: t("contact.whatsapp"),
                description: "+234 700 000 5678",
                subtext: t("contact.whatsappDesc"),
              },
              {
                icon: MapPin,
                title: t("contact.visit"),
                description: "Accra, Ghana",
                subtext: t("contact.visitDesc"),
              },
            ].map((option, idx) => (
              <div
                key={idx}
                className="p-6 border border-border rounded-sm text-center hover:shadow-lg transition-shadow"
              >
                <option.icon className="w-8 h-8 text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2 text-foreground">{option.title}</h3>
                <p className="font-bold text-foreground mb-1">{option.description}</p>
                <p className="text-sm text-foreground/60">{option.subtext}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-foreground">{t("contact.sendMessage")}</h2>
          <p className="text-foreground/70 mb-12">{t("contact.fillForm")}</p>

          {submitted ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-sm p-8 text-center">
              <p className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">{t("contact.thankYou")}</p>
              <p className="text-green-700 dark:text-green-300">{t("contact.thankYouDesc")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">{t("contact.fullName")}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-border rounded-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder={t("contact.fullName")}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">{t("contact.email")}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-border rounded-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="your@email.com"
                />
              </div>

              {/* Participant Type */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">{t("contact.participantType")}</label>
                <select
                  name="participantType"
                  value={formData.participantType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option value="youth">Student / Young Professional</option>
                  <option value="sponsor">Company / Sponsor</option>
                  <option value="partner">Partner / Institution</option>
                  <option value="media">Media / Press</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">{t("contact.subject")}</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-border rounded-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder={t("contact.subject")}
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">{t("contact.message")}</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-border rounded-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                  placeholder={t("contact.message")}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground px-8 py-3 rounded-sm font-bold hover:opacity-90 transition-opacity text-lg"
              >
                {t("contact.sendBtn")}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-foreground text-center">{t("contact.faq")}</h2>

          <div className="space-y-6">
            {[
              {
                question: "When and where is PASS AVENIR 2025?",
                answer:
                  "PASS AVENIR 2025 takes place March 15-16, 2025 at the International Convention Center in Accra, Ghana. We also offer virtual participation for remote attendees.",
              },
              {
                question: "How do I register for the event?",
                answer:
                  "You can register on our website at passavenir.com. Registration is free for students and early-bird rates apply for professionals. Corporate packages are also available.",
              },
              {
                question: "What opportunities will be available at the event?",
                answer:
                  "We have 50+ companies and institutions showcasing jobs, internships, scholarships, mentorship programs, and partnership opportunities across tech, education, finance, and other sectors.",
              },
              {
                question: "Can I attend virtually?",
                answer:
                  "Yes! We offer hybrid participation. Virtual attendees can access live streams of keynotes, panels, and networking sessions. However, in-person attendance provides the full experience.",
              },
              {
                question: "How can my company become a sponsor?",
                answer:
                  "We offer four sponsorship packages: Institutional (€25K), Impact (€50K), Innovation (€100K), and Premium (€200K+). Contact our partnerships team at partnerships@passavenir.com for details.",
              },
              {
                question: "Is there a community after the event?",
                answer:
                  "All participants join our year-round community platform with exclusive content, networking groups, job postings, and mentorship opportunities. It's an ongoing ecosystem.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-background p-6 rounded-sm border border-border">
                <h3 className="text-lg font-bold text-foreground mb-3">{faq.question}</h3>
                <p className="text-foreground/70 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">{t("contact.follow")}</h2>
          <p className="text-lg text-primary-foreground/90 mb-8">{t("contact.followDesc")}</p>
          <div className="flex flex-wrap justify-center gap-4">
            {["Twitter", "LinkedIn", "Facebook", "Instagram", "YouTube"].map((platform) => (
              <a
                key={platform}
                href={`https://${platform.toLowerCase()}.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-secondary text-secondary-foreground px-8 py-3 rounded-sm font-bold hover:opacity-90 transition-opacity"
              >
                {platform}
              </a>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
