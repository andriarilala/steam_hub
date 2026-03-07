"use client"

import { Mail, Phone, Facebook } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground border-t border-border/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo PASS AVENIR"
              className="h-12 w-auto"
            />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <a
                href="mailto:steamhubinitiative@gmail.com"
                className="hover:text-white transition-colors"
              >
                steamhubinitiative@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>
                Infoline&nbsp;: +261 38 57 53 87 / +261 34 97 59 468
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Facebook className="w-4 h-4" />
              <a
                href="https://www.facebook.com/profile.php?id=100081934650238"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                ww.facebook.com/SteamHub
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-6 flex justify-center">
          <p className="text-xs text-primary-foreground/70">
            © {new Date().getFullYear()} PASS AVENIR. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
