"use client"

import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import EventCountdown from "@/components/event-countdown"

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navigation />

      {/* Hero / Header */}
      <section className="px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald-300/70 mb-4">
              Salon de découverte des métiers
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
              PASS AVENIR
            </h1>
            <p className="text-base sm:text-lg text-slate-200/80 max-w-2xl mx-auto">
              Une journée pour découvrir des métiers, rencontrer des professionnels et préparer ton avenir.
              Ateliers, stands, rencontres inspirantes… tout est réuni pour t’aider à clarifier ton projet
              professionnel.
            </p>
          </div>

          {/* Compte à rebours */}
          <EventCountdown />

          {/* Bouton principal */}
          <Link
            href="/participer"
            className="mt-4 inline-flex items-center justify-center px-8 py-3 rounded-md bg-emerald-500 text-slate-950 font-semibold text-sm sm:text-base shadow-lg hover:bg-emerald-400 transition-colors"
          >
            Participer / Acheter billet
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
