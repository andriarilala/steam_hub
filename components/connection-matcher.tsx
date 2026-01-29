"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Heart, X, MapPin, Briefcase, Award, MessageCircle, UserCheck } from "lucide-react"

interface Connection {
  id: string
  name: string
  role: string
  company: string
  location: string
  image: string
  interests: string[]
  matchScore: number
  bio: string
}

const suggestedConnections: Connection[] = [
  {
    id: "1",
    name: "Amara Diallo",
    role: "Software Engineer",
    company: "Google Africa",
    location: "Accra, Ghana",
    image: "/placeholder.svg",
    interests: ["Tech", "Startup", "Mentorship"],
    matchScore: 95,
    bio: "Passionate about building scalable solutions for African markets. Open to mentoring junior developers.",
  },
  {
    id: "2",
    name: "Michael Okonkwo",
    role: "Talent Manager",
    company: "Accenture",
    location: "Lagos, Nigeria",
    image: "/placeholder.svg",
    interests: ["Recruitment", "Leadership", "Training"],
    matchScore: 88,
    bio: "Looking for talented individuals to join our growing team. Experienced in tech recruitment.",
  },
  {
    id: "3",
    name: "Fatima Razafy",
    role: "Entrepreneur",
    company: "SafariHub (Startup)",
    location: "Addis Ababa, Ethiopia",
    image: "/placeholder.svg",
    interests: ["Innovation", "Startup", "Networking"],
    matchScore: 82,
    bio: "Building the future of e-commerce in Africa. Always interested in strategic partnerships.",
  },
  {
    id: "4",
    name: "Dr. Kwesi Mensah",
    role: "Professor & Mentor",
    company: "Ashesi University",
    location: "Berekuso, Ghana",
    image: "/placeholder.svg",
    interests: ["Education", "Mentorship", "Research"],
    matchScore: 79,
    bio: "Professor of Computer Science dedicated to developing Africa's next generation of innovators.",
  },
]

export function ConnectionMatcher() {
  const { t } = useLanguage()
  const [connections, setConnections] = useState(suggestedConnections)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [liked, setLiked] = useState<string[]>([])

  if (connections.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground/70 mb-4">No more suggestions for today</p>
        <p className="text-sm text-foreground/60">Check back later for new connections</p>
      </div>
    )
  }

  const currentConnection = connections[currentIndex]

  const handleLike = () => {
    setLiked([...liked, currentConnection.id])
    setCurrentIndex(currentIndex + 1)
  }

  const handlePass = () => {
    setCurrentIndex(currentIndex + 1)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Connection Card */}
      <div className="bg-card rounded-lg border border-border overflow-hidden shadow-lg mb-6">
        {/* Profile Image */}
        <div className="w-full h-64 bg-gradient-to-br from-primary to-accent flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center text-white text-6xl">
            {currentConnection.name.charAt(0)}
          </div>
          <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-bold">
            {currentConnection.matchScore}% Match
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-foreground mb-2">{currentConnection.name}</h3>
            <div className="space-y-2 text-sm text-foreground/70">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>{currentConnection.role}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>{currentConnection.company}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{currentConnection.location}</span>
              </div>
            </div>
          </div>

          <p className="text-foreground/80 mb-4">{currentConnection.bio}</p>

          {/* Interests */}
          <div className="flex flex-wrap gap-2 mb-6">
            {currentConnection.interests.map((interest) => (
              <span key={interest} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                {interest}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handlePass}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-foreground/20 text-foreground px-4 py-3 rounded-lg hover:bg-foreground/5 transition-colors font-medium"
            >
              <X className="w-5 h-5" />
              Skip
            </button>
            <button
              onClick={handleLike}
              className="flex-1 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-4 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              <Heart className="w-5 h-5 fill-current" />
              Connect
            </button>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="text-center text-sm text-foreground/60">
        <span>
          {currentIndex + 1} of {suggestedConnections.length} suggestions
        </span>
      </div>
    </div>
  )
}
