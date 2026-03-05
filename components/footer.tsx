"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-primary text-primary-foreground border-t border-border/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="h-12 w-auto self-center"
                />
              </div>
            </div>
            <p className="text-sm text-primary-foreground/70">{t("footer.tagline")}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">{t("footer.platform")}</h4>
            <ul className="space-y-2 text-sm">
              {[
                { key: "nav.home", href: "/" },
                { key: "nav.story", href: "/story" },
                { key: "nav.event", href: "/event" },
                { key: "nav.agenda", href: "/agenda" },
              ].map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold mb-4">{t("footer.resources")}</h4>
            <ul className="space-y-2 text-sm">
              {[
                { key: "nav.partners", href: "/partners" },
                { key: "nav.community", href: "/community" },
                { key: "nav.media", href: "/media" },
              ].map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">{t("footer.connect")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:hello@passavenir.com"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  hello@passavenir.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/261328175438"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-primary-foreground/70">{t("footer.copyright")}</p>
          <div className="flex gap-4 text-sm mt-4 sm:mt-0">
            <Link
              href="/privacy"
              className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            >
              {t("footer.privacy")}
            </Link>
            <Link href="/terms" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
