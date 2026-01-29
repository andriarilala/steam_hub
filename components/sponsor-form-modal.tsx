"use client"

import React from "react"

import { useState } from "react"
import { X, Send, Check, Building, Mail, Phone, User, Briefcase } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface SponsorFormModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SponsorFormModal({ isOpen, onClose }: SponsorFormModalProps) {
  const { t } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    jobTitle: "",
    sponsorshipInterest: "",
    budget: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setIsSuccess(true)

    // Reset after 3 seconds
    setTimeout(() => {
      setIsSuccess(false)
      setFormData({
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
        jobTitle: "",
        sponsorshipInterest: "",
        budget: "",
        message: "",
      })
      onClose()
    }, 3000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Become a Sponsor</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5 text-foreground/70" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Thank You!</h3>
              <p className="text-foreground/70">
                We've received your sponsorship inquiry. Our team will contact you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-foreground/70 mb-6">
                Interested in partnering with PASS AVENIR? Fill out this form and our sponsorship team will reach out to
                discuss opportunities.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Company Name *</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
                      placeholder="Your Company"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Contact Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
                      placeholder="Your Name"
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
                      placeholder="+1 234 567 890"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
                    placeholder="Marketing Director"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Sponsorship Interest *</label>
                <select
                  name="sponsorshipInterest"
                  value={formData.sponsorshipInterest}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
                >
                  <option value="">Select a package</option>
                  <option value="institutional">Institutional (€25K)</option>
                  <option value="impact">Impact (€50K)</option>
                  <option value="innovation">Innovation (€100K)</option>
                  <option value="premium">Premium (€200K+)</option>
                  <option value="custom">Custom Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Budget Range</label>
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
                >
                  <option value="">Select budget range</option>
                  <option value="25k-50k">€25,000 - €50,000</option>
                  <option value="50k-100k">€50,000 - €100,000</option>
                  <option value="100k-200k">€100,000 - €200,000</option>
                  <option value="200k+">€200,000+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm resize-none"
                  placeholder="Tell us about your sponsorship goals and how we can partner together..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Inquiry
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
