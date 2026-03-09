"use client"

import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import EventCountdown from "@/components/event-countdown"

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navigation />

      {/* Hero / Header */}
      <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-3">
          <div className="space-y-0.5 sm:space-y-1.5">
            <div className="flex justify-center">
              <Image
                src="/passavenir.png"
                alt="Logo Pass Avenir"
                width={260}
                height={90}
                className="drop-shadow-lg"
                priority
              />
            </div>
            <p className="text-base sm:text-xl leading-snug sm:leading-snug text-slate-200/80 max-w-3xl mx-auto">
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
            Acheter mon billet
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
