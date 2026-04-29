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
              alt="Logo AERO EXPO"
              className="h-8 w-auto"
            />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <a
                href="mailto:contact@printeoagency.com"
                className="text-white/80 hover:text-white transition-colors"
              >
                contact@printeoagency.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>
                Infoline&nbsp;: +261 34 28 686 76
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Facebook className="w-4 h-4" />
              <a
                href="https://www.facebook.com/profile.php?id=61575252123938"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors"
              >
                AERO EXPO
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-4 flex justify-center">
          <p className="text-[10px] text-white/60">
            © {new Date().getFullYear()} AERO EXPO. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
