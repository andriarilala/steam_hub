"use client"

import { useLanguage } from "@/lib/language-context"
import { Globe } from "lucide-react"
import { useState } from "react"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: "en" as const, label: "English" },
    { code: "fr" as const, label: "Français" },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-sm border border-border hover:bg-muted transition-colors text-sm font-medium text-foreground"
        aria-label="Change language"
      >
        <Globe size={16} />
        <span className="hidden sm:inline">{language.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-sm shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                language === lang.code
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
