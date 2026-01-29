"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { Target, Users, Zap, Globe } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export default function EventPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <HeroSection
        title={t("event.title")}
        subtitle={t("event.subtitle")}
        backgroundImage="/international-conference-delegates-networking.jpg"
      />

      {/* What is PASS AVENIR */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-foreground">{t("event.what")}</h2>
          <p className="text-lg text-foreground/80 leading-relaxed mb-8">{t("event.whatP1")}</p>
          <p className="text-lg text-foreground/80 leading-relaxed">{t("event.whatP2")}</p>
        </div>
      </section>

      {/* Event Goals */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-foreground text-center">{t("event.goals")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Target,
                titleKey: "event.goal1",
                descKey: "event.goal1Desc",
              },
              {
                icon: Globe,
                titleKey: "event.goal2",
                descKey: "event.goal2Desc",
              },
              {
                icon: Users,
                titleKey: "event.goal3",
                descKey: "event.goal3Desc",
              },
              {
                icon: Zap,
                titleKey: "event.goal4",
                descKey: "event.goal4Desc",
              },
            ].map((goal, idx) => (
              <div key={idx} className="p-8 border border-border rounded-sm hover:shadow-lg transition-shadow">
                <goal.icon className="w-8 h-8 text-secondary mb-4" />
                <h3 className="text-xl font-bold mb-2 text-foreground">{t(goal.titleKey)}</h3>
                <p className="text-foreground/70">{t(goal.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It Is For */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-foreground text-center">{t("event.for")}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {[
              {
                audienceKey: "event.forYouth",
                benefitsKeys: ["event.forYouth1", "event.forYouth2", "event.forYouth3", "event.forYouth4"],
              },
              {
                audienceKey: "event.forCompanies",
                benefitsKeys: [
                  "event.forCompanies1",
                  "event.forCompanies2",
                  "event.forCompanies3",
                  "event.forCompanies4",
                ],
              },
              {
                audienceKey: "event.forInstitutions",
                benefitsKeys: [
                  "event.forInstitutions1",
                  "event.forInstitutions2",
                  "event.forInstitutions3",
                  "event.forInstitutions4",
                ],
              },
              {
                audienceKey: "event.forMentors",
                benefitsKeys: ["event.forMentors1", "event.forMentors2", "event.forMentors3", "event.forMentors4"],
              },
            ].map((segment, idx) => (
              <div key={idx} className="bg-background p-6 rounded-sm border border-border">
                <h3 className="text-lg font-bold mb-4 text-foreground">{t(segment.audienceKey)}</h3>
                <ul className="space-y-3">
                  {segment.benefitsKeys.map((benefitKey, bidx) => (
                    <li key={bidx} className="flex gap-2 text-sm text-foreground/70">
                      <span className="text-secondary font-bold flex-shrink-0">→</span>
                      <span>{t(benefitKey)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Participants Gain */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">{t("event.gains")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">{t("event.gainsYouth")}</h3>
              <ul className="space-y-4">
                {[
                  "event.gainsYouth1",
                  "event.gainsYouth2",
                  "event.gainsYouth3",
                  "event.gainsYouth4",
                  "event.gainsYouth5",
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-secondary font-bold">✓</span>
                    <span>{t(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6">{t("event.gainsOrg")}</h3>
              <ul className="space-y-4">
                {["event.gainsOrg1", "event.gainsOrg2", "event.gainsOrg3", "event.gainsOrg4", "event.gainsOrg5"].map(
                  (item, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-secondary font-bold">✓</span>
                      <span>{t(item)}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Event Highlights */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-foreground text-center">{t("event.highlights")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { titleKey: "event.highlight1", descKey: "event.highlight1Desc" },
              { titleKey: "event.highlight2", descKey: "event.highlight2Desc" },
              { titleKey: "event.highlight3", descKey: "event.highlight3Desc" },
              { titleKey: "event.highlight4", descKey: "event.highlight4Desc" },
              { titleKey: "event.highlight5", descKey: "event.highlight5Desc" },
              { titleKey: "event.highlight6", descKey: "event.highlight6Desc" },
            ].map((highlight, idx) => (
              <div key={idx} className="bg-card p-8 rounded-sm border border-border">
                <h3 className="text-lg font-bold mb-2 text-foreground">{t(highlight.titleKey)}</h3>
                <p className="text-foreground/70">{t(highlight.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-secondary-foreground">{t("event.cta")}</h2>
          <p className="text-lg text-secondary-foreground/90 mb-8">{t("event.ctaDesc")}</p>
          <button className="bg-primary text-primary-foreground px-8 py-3 rounded-sm font-bold hover:opacity-90 transition-opacity inline-flex items-center gap-2">
            {t("event.ctaBtn")}
          </button>
        </div>
      </section>

      <Footer />
    </main>
  )
}
