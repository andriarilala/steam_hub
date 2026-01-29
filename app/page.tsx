"use client"

import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { Footer } from "@/components/footer"
import { ArrowRight, Zap, Users, Briefcase } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export default function Home() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <HeroSection
        title={t("home.title")}
        subtitle={t("home.subtitle")}
        ctaText={t("home.cta")}
        ctaSecondaryText={t("home.ctaSecondary")}
        backgroundImage="/vibrant-african-event-crowd-youth-technology-futur.png"
      />

      {/* Key Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-foreground">{t("home.whyJoin")}</h2>
          <p className="text-center text-foreground/70 mb-16 max-w-2xl mx-auto">{t("home.whyJoinDesc")}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                titleKey: "home.connect",
                descKey: "home.connectDesc",
              },
              {
                icon: Zap,
                titleKey: "home.discover",
                descKey: "home.discoverDesc",
              },
              {
                icon: Briefcase,
                titleKey: "home.grow",
                descKey: "home.growDesc",
              },
              {
                icon: ArrowRight,
                titleKey: "home.lead",
                descKey: "home.leadDesc",
              },
            ].map((benefit, idx) => (
              <div key={idx} className="p-6 border border-border rounded-sm hover:shadow-lg transition-shadow">
                <benefit.icon className="w-8 h-8 text-secondary mb-4" />
                <h3 className="text-lg font-bold mb-2 text-foreground">{t(benefit.titleKey)}</h3>
                <p className="text-sm text-foreground/70">{t(benefit.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Info Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-foreground">{t("home.platform")}</h2>
              <p className="text-lg text-foreground/70 mb-6 leading-relaxed">{t("home.platformDesc")}</p>
              <ul className="space-y-4 mb-8">
                {["home.feature1", "home.feature2", "home.feature3", "home.feature4"].map((key, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-secondary-foreground text-sm font-bold">✓</span>
                    </div>
                    <span className="text-foreground">{t(key)}</span>
                  </li>
                ))}
              </ul>
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-sm font-bold hover:opacity-90 transition-opacity inline-flex items-center gap-2">
                {t("home.learnMore")} <ArrowRight size={20} />
              </button>
            </div>
            <div className="bg-muted rounded-sm overflow-hidden h-96">
              <img
                src="/professional-conference-speakers-stage.png"
                alt="PASS AVENIR Event"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-primary-foreground">{t("home.ready")}</h2>
          <p className="text-lg text-primary-foreground/90 mb-8">{t("home.readyDesc")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-secondary text-secondary-foreground px-8 py-3 rounded-sm font-bold hover:opacity-90 transition-opacity">
              {t("home.registerNow")}
            </button>
            <button className="border-2 border-primary-foreground text-primary-foreground px-8 py-3 rounded-sm font-bold hover:bg-primary-foreground/10 transition-colors">
              {t("home.exploreOpp")}
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
