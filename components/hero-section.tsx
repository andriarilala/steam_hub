"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Play, Pause, Volume2, VolumeX, Calendar, MapPin, Users, ChevronDown } from "lucide-react"
import EventCountdown from "./event-countdown"

interface HeroSectionProps {
  title: string
  subtitle?: string
  ctaText?: string
  ctaSecondaryText?: string
  backgroundImage?: string
  backgroundVideo?: string
  showEventInfo?: boolean
}

export function HeroSection({
  title,
  subtitle,
  ctaText,
  ctaSecondaryText,
  backgroundImage,
  backgroundVideo,
  showEventInfo = true,
}: HeroSectionProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)



  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const togglePlay = () => {
    const video = document.getElementById("hero-video") as HTMLVideoElement
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    const video = document.getElementById("hero-video") as HTMLVideoElement
    if (video) {
      video.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight - 80,
      behavior: "smooth",
    })
  }

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Video or Image */}
      {backgroundVideo ? (
        <video
          id="hero-video"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onLoadedData={() => setIsLoaded(true)}
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      ) : backgroundImage ? (
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ) : null}



      {/* Animated particles/dots effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse" style={{ top: "20%", left: "10%" }} />
        <div
          className="absolute w-3 h-3 bg-white/10 rounded-full animate-pulse"
          style={{ top: "40%", left: "85%", animationDelay: "0.5s" }}
        />
        <div
          className="absolute w-2 h-2 bg-white/15 rounded-full animate-pulse"
          style={{ top: "70%", left: "20%", animationDelay: "1s" }}
        />
        <div
          className="absolute w-4 h-4 bg-white/10 rounded-full animate-pulse"
          style={{ top: "30%", left: "70%", animationDelay: "1.5s" }}
        />
        <div
          className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
          style={{ top: "80%", left: "60%", animationDelay: "2s" }}
        />
      </div>

      {/* Video Controls */}
      {backgroundVideo && (
        <div className="absolute bottom-24 right-6 z-20 flex gap-2">
          <button
            onClick={togglePlay}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
          </button>
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
          </button>
        </div>
      )}

      {/* Content */}
      <div
        className={`relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >

        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold text-white mb-6 leading-tight text-pretty tracking-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-6 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}

        {/* Countdown Timer */}
        {showEventInfo && (
          <div className="mb-10">
            <EventCountdown />
          </div>
        )}

        {/* CTAs */}
        {(ctaText || ctaSecondaryText) && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {ctaText && (
              <Link
                href="/register"
                className="bg-secondary text-secondary-foreground px-10 py-4 rounded-lg font-bold hover:opacity-90 transition-all text-lg shadow-lg hover:shadow-xl hover:scale-105"
              >
                {ctaText}
              </Link>
            )}
            {ctaSecondaryText && (
              <Link
                href="/partners"
                className="border-2 border-white text-white px-10 py-4 rounded-lg font-bold hover:bg-white/10 transition-all text-lg backdrop-blur-sm"
              >
                {ctaSecondaryText}
              </Link>
            )}
          </div>
        )}


      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce cursor-pointer"
        aria-label="Scroll to content"
      >
        <ChevronDown className="w-8 h-8 text-white/70" />
      </button>
    </section>
  )
}
