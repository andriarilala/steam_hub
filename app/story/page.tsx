"use client"

import { useState } from "react"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { useLanguage } from "@/lib/language-context"
import { Play, X, ChevronLeft, ChevronRight, Quote } from "lucide-react"

const galleryItems = [
  {
    id: 1,
    type: "image",
    src: "/opening-ceremony-conference.jpg",
    caption: "Opening Ceremony - PASS AVENIR 2024",
  },
  {
    id: 2,
    type: "image",
    src: "/networking-professionals-conference.jpg",
    caption: "Networking sessions connecting talents with opportunities",
  },
  {
    id: 3,
    type: "image",
    src: "/women-leadership-panel.jpg",
    caption: "Women in Leadership Panel Discussion",
  },
  {
    id: 4,
    type: "image",
    src: "/startup-pitch-competition.jpg",
    caption: "Youth Startup Pitch Competition Finals",
  },
  {
    id: 5,
    type: "image",
    src: "/panel-discussion-technology.jpg",
    caption: "Technology & Innovation Panel",
  },
  {
    id: 6,
    type: "image",
    src: "/awards-ceremony-celebration.jpg",
    caption: "Awards Ceremony Celebration",
  },
]

const testimonials = [
  {
    quote: "PASS AVENIR changed my life. I found my first internship here and now I'm working at a global tech company.",
    author: "Amara Diallo",
    role: "Software Engineer, 24",
    country: "Senegal",
  },
  {
    quote: "As a recruiter, PASS AVENIR is the best place to find motivated and talented young Africans. The quality of participants is exceptional.",
    author: "Michael Okonkwo",
    role: "HR Director",
    country: "Nigeria",
  },
  {
    quote: "The connections I made at PASS AVENIR led to funding for my startup. This platform truly empowers African entrepreneurs.",
    author: "Fatima Razafy",
    role: "Startup Founder",
    country: "Madagascar",
  },
]

export default function StoryPage() {
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const openLightbox = (index: number) => setSelectedImage(index)
  const closeLightbox = () => setSelectedImage(null)
  const nextImage = () => setSelectedImage((prev) => (prev !== null ? (prev + 1) % galleryItems.length : null))
  const prevImage = () => setSelectedImage((prev) => (prev !== null ? (prev - 1 + galleryItems.length) % galleryItems.length : null))

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <HeroSection
        title={t("story.title")}
        subtitle={t("story.subtitle")}
        backgroundImage="/african-youth-conference-inspiration.png"
      />

      {/* Origin Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-foreground">{t("story.origin")}</h2>
          <div className="space-y-6 text-lg text-foreground/80 leading-relaxed">
            <p>{t("story.originP1")}</p>
            <p>{t("story.originP2")}</p>
            <p>{t("story.originP3")}</p>
          </div>
        </div>
      </section>

      {/* Social & Economic Context */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-foreground text-center">{t("story.context")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                numberKey: "60%",
                titleKey: "story.stat1Title",
                descKey: "story.stat1Desc",
              },
              {
                numberKey: "400M+",
                titleKey: "story.stat2Title",
                descKey: "story.stat2Desc",
              },
              {
                numberKey: "2025+",
                titleKey: "story.stat3Title",
                descKey: "story.stat3Desc",
              },
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-8 border border-border rounded-sm">
                <div className="text-5xl font-bold text-secondary mb-4">{stat.numberKey}</div>
                <h3 className="text-xl font-bold mb-2 text-foreground">{t(stat.titleKey)}</h3>
                <p className="text-foreground/70">{t(stat.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Long-term Vision */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">{t("story.vision")}</h2>
          <div className="space-y-6 text-lg leading-relaxed">
            <p>{t("story.visionP1")}</p>
            <p>{t("story.visionP2")}</p>
            <ul className="space-y-3 ml-6">
              {["story.visionItem1", "story.visionItem2", "story.visionItem3", "story.visionItem4"].map((item, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-secondary font-bold">•</span>
                  <span>{t(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Inspiration & Quotes */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-foreground text-center">{t("story.quotes")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                quoteKey: "story.quote1",
                authorKey: "story.quote1Author",
              },
              {
                quoteKey: "story.quote2",
                authorKey: "story.quote2Author",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-background p-8 rounded-sm border border-border">
                <p className="text-lg italic text-foreground/80 mb-4">"{t(item.quoteKey)}"</p>
                <p className="font-bold text-secondary">— {t(item.authorKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Narrative Gallery */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-foreground text-center">Our Journey in Pictures</h2>
          <p className="text-center text-foreground/70 mb-12 max-w-2xl mx-auto">
            Relive the moments that defined PASS AVENIR - from inspiring keynotes to life-changing connections
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => openLightbox(index)}
                className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer"
              >
                <Image
                  src={item.src || "/placeholder.svg"}
                  alt={item.caption}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center p-4">
                    <p className="text-sm font-medium">{item.caption}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Voices of PASS AVENIR</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-6 border border-primary-foreground/20">
                <Quote className="w-8 h-8 text-secondary mb-4" />
                <p className="text-primary-foreground/90 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold text-primary-foreground">{testimonial.author}</p>
                  <p className="text-sm text-primary-foreground/70">{testimonial.role}</p>
                  <p className="text-xs text-secondary">{testimonial.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <button
            onClick={prevImage}
            className="absolute left-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
          <div className="max-w-4xl max-h-[80vh] relative">
            <Image
              src={galleryItems[selectedImage].src || "/placeholder.svg"}
              alt={galleryItems[selectedImage].caption}
              width={1200}
              height={800}
              className="max-h-[80vh] w-auto object-contain"
            />
            <p className="text-white text-center mt-4">{galleryItems[selectedImage].caption}</p>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
