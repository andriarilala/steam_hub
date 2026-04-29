"use client"

import { Mail, Phone, Facebook } from "lucide-react"

export function Footer() {
  return (
    <footer className="text-white border-t border-white/10" style={{ backgroundColor: '#0E2A47' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo PASS AVENIR"
              className="h-8 w-auto"
            />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <a
                href="mailto:steamhubinitiative@gmail.com"
                className="text-white/80 hover:text-white transition-colors"
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
                className="text-white/80 hover:text-white transition-colors"
              >
                ww.facebook.com/SteamHub
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-4 flex justify-center">
          <p className="text-[10px] text-white/60">
            © {new Date().getFullYear()} PASS AVENIR. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
