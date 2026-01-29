"use client"

import React from "react"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { User, Mail, Building, MapPin, Link as LinkIcon, Edit2, Save, X } from "lucide-react"

export default function ProfilePage() {
  const { t } = useLanguage()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    fullName: "John Doe",
    email: "john@example.com",
    role: "Student",
    organization: "University of Ghana",
    location: "Accra, Ghana",
    bio: "Passionate about technology and innovation in Africa",
    linkedIn: "linkedin.com/in/johndoe",
    website: "johndoe.com",
    interests: ["Technology", "Entrepreneurship", "Mentorship"],
    image: "JD",
  })

  const [formData, setFormData] = useState(profile)
  const [newInterest, setNewInterest] = useState("")

  const handleSave = () => {
    setProfile(formData)
    setIsEditing(false)
  }

  const handleAddInterest = () => {
    if (newInterest.trim()) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest],
      })
      setNewInterest("")
    }
  }

  const handleRemoveInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((i) => i !== interest),
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-accent p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30">
                  {profile.image}
                </div>
                <div className="text-white">
                  <h1 className="text-3xl font-bold">{profile.fullName}</h1>
                  <p className="text-white/80">{profile.role}</p>
                  <p className="text-sm text-white/70">{profile.organization}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditing(!isEditing)
                  setFormData(profile)
                }}
                className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2 font-medium"
              >
                <Edit2 className="w-4 h-4" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {!isEditing ? (
              // View Mode
              <div className="space-y-8">
                {/* Bio */}
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-3">About</h2>
                  <p className="text-foreground/80">{profile.bio}</p>
                </div>

                {/* Contact Info */}
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-4">Contact Information</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <span className="text-foreground/80">{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="text-foreground/80">{profile.location}</span>
                    </div>
                    {profile.linkedIn && (
                      <div className="flex items-center gap-3">
                        <LinkIcon className="w-5 h-5 text-primary" />
                        <a href={`https://${profile.linkedIn}`} className="text-primary hover:underline">
                          {profile.linkedIn}
                        </a>
                      </div>
                    )}
                    {profile.website && (
                      <div className="flex items-center gap-3">
                        <LinkIcon className="w-5 h-5 text-primary" />
                        <a href={`https://${profile.website}`} className="text-primary hover:underline">
                          {profile.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-4">Interests</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <span key={interest} className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Role</label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Organization</label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">LinkedIn</label>
                    <input
                      type="text"
                      name="linkedIn"
                      value={formData.linkedIn}
                      onChange={handleInputChange}
                      className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Website</label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Interests Management */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-3">Interests</label>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddInterest()}
                      placeholder="Add an interest"
                      className="flex-1 border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={handleAddInterest}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.map((interest) => (
                      <div key={interest} className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                        {interest}
                        <button
                          onClick={() => handleRemoveInterest(interest)}
                          className="hover:text-primary-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  className="w-full bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-bold flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
