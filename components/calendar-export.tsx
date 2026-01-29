"use client"

import { useState } from "react"
import { Calendar, Download, Copy, Check } from "lucide-react"
import {
  downloadICalendar,
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
  copyToClipboard,
  type CalendarEvent,
} from "@/lib/calendar-export"

interface CalendarExportProps {
  events: CalendarEvent[]
  showLabel?: boolean
}

export function CalendarExport({ events, showLabel = true }: CalendarExportProps) {
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleDownloadICS = () => {
    downloadICalendar(events)
    setIsOpen(false)
  }

  const handleCopyGoogleUrl = async () => {
    if (events.length === 0) return
    const url = generateGoogleCalendarUrl(events[0])
    try {
      await copyToClipboard(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert("Failed to copy link")
    }
  }

  const handleOpenGoogle = () => {
    if (events.length === 0) return
    const url = generateGoogleCalendarUrl(events[0])
    window.open(url, "_blank")
    setIsOpen(false)
  }

  const handleOpenOutlook = () => {
    if (events.length === 0) return
    const url = generateOutlookCalendarUrl(events[0])
    window.open(url, "_blank")
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        <Calendar className="w-5 h-5" />
        {showLabel && "Add to Calendar"}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 w-56">
          <div className="p-2 space-y-2">
            <button
              onClick={handleDownloadICS}
              className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-muted rounded-lg transition-colors text-foreground"
            >
              <Download className="w-4 h-4" />
              <div>
                <p className="font-medium text-sm">Download (.ics)</p>
                <p className="text-xs text-foreground/60">For all calendars</p>
              </div>
            </button>

            <div className="border-t border-border" />

            <button
              onClick={handleOpenGoogle}
              className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-muted rounded-lg transition-colors text-foreground"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <div>
                <p className="font-medium text-sm">Google Calendar</p>
                <p className="text-xs text-foreground/60">Open in browser</p>
              </div>
            </button>

            <button
              onClick={handleOpenOutlook}
              className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-muted rounded-lg transition-colors text-foreground"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.6 2H2.4C1.08 2 0 3.08 0 4.4v15.2C0 20.92 1.08 22 2.4 22h15.2c1.32 0 2.4-1.08 2.4-2.4V12.4L11.6 2z" />
                <path d="M24 13.4V4.2c0-.66-.54-1.2-1.2-1.2H13.6L24 13.4z" />
              </svg>
              <div>
                <p className="font-medium text-sm">Outlook Calendar</p>
                <p className="text-xs text-foreground/60">Open in browser</p>
              </div>
            </button>

            <div className="border-t border-border" />

            <button
              onClick={handleCopyGoogleUrl}
              className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-muted rounded-lg transition-colors text-foreground"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <div>
                <p className="font-medium text-sm">{copied ? "Copied!" : "Copy Link"}</p>
                <p className="text-xs text-foreground/60">Share with others</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
