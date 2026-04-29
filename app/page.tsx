"use client"

import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import EventCountdown from "@/components/event-countdown"

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col text-white relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-20"
        style={{ backgroundImage: "url('/background.png')" }}
      />
      <div className="absolute inset-0 backdrop-blur-[4px] bg-black/20 -z-10" />
      <Navigation />

      {/* Hero / Header */}
      <section className="px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-6">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-3">
          <div className="space-y-0.5 sm:space-y-1.5">
            <div className="flex justify-center">
              <Image
                src="/logo_plane.png"
                alt="Logo Salon Aero Expo 2026"
                width={600}
                height={300}
                className="drop-shadow-lg"
                priority
              />
            </div>
          </div>

          {/* Compte à rebours */}
          <div className="mt-8 sm:mt-10 flex-grow flex flex-col justify-center">
            <EventCountdown />
          </div>

          {/* Bouton principal */}
          <Link
            href="/participer"
            className="mt-6 sm:mt-8 mb-8 inline-flex items-center justify-center px-10 py-4 rounded-lg font-bold text-lg sm:text-xl text-white shadow-[0_0_20px_rgba(0,179,119,0.4)] hover:shadow-[0_0_30px_rgba(0,143,90,0.6)] transition-all duration-300 transform hover:scale-105"
            style={{ backgroundColor: '#00B377' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#008F5A'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00B377'}
          >
            Acheter mon billet
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
