export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  organizer?: string
}

/**
 * Generates an iCalendar (.ics) file content for Google Calendar, Outlook, etc.
 */
export function generateICalendar(events: CalendarEvent[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PASS AVENIR//Event Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:PASS AVENIR 2025",
    "X-WR-TIMEZONE:UTC",
    "BEGIN:VTIMEZONE",
    "TZID:UTC",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:+0000",
    "TZOFFSETTO:+0000",
    "TZNAME:UTC",
    "END:STANDARD",
    "END:VTIMEZONE",
  ]

  events.forEach((event) => {
    const startDate = formatDate(event.startTime)
    const endDate = formatDate(event.endTime)
    const uid = `${event.id}@passavenir.event`
    const dtstamp = formatDate(new Date())

    lines.push("BEGIN:VEVENT")
    lines.push(`UID:${uid}`)
    lines.push(`DTSTAMP:${dtstamp}`)
    lines.push(`DTSTART;TZID=UTC:${startDate}`)
    lines.push(`DTEND;TZID=UTC:${endDate}`)
    lines.push(`SUMMARY:${escapeString(event.title)}`)

    if (event.description) {
      lines.push(`DESCRIPTION:${escapeString(event.description)}`)
    }

    if (event.location) {
      lines.push(`LOCATION:${escapeString(event.location)}`)
    }

    if (event.organizer) {
      lines.push(`ORGANIZER:CN=${escapeString(event.organizer)}`)
    }

    lines.push(`URL:https://passavenir.event/agenda`)
    lines.push("STATUS:CONFIRMED")
    lines.push("SEQUENCE:0")
    lines.push("END:VEVENT")
  })

  lines.push("END:VCALENDAR")

  return lines.join("\r\n")
}

/**
 * Generates a Google Calendar URL for adding events
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    details: event.description || "",
    location: event.location || "",
    dates: `${formatDateForGoogle(event.startTime)}/${formatDateForGoogle(event.endTime)}`,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Generates an Outlook/Microsoft Calendar URL
 */
export function generateOutlookCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.title,
    body: event.description || "",
    location: event.location || "",
    startdt: event.startTime.toISOString(),
    enddt: event.endTime.toISOString(),
  })

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

/**
 * Downloads an iCalendar file
 */
export function downloadICalendar(events: CalendarEvent[], filename = "pass-avenir-events.ics"): void {
  const icsContent = generateICalendar(events)
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

/**
 * Format date for iCalendar format (YYYYMMDDTHHMMSSZ)
 */
function formatDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  const hours = String(date.getUTCHours()).padStart(2, "0")
  const minutes = String(date.getUTCMinutes()).padStart(2, "0")
  const seconds = String(date.getUTCSeconds()).padStart(2, "0")

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

/**
 * Format date for Google Calendar (YYYYMMDDTHHMMSS/YYYYMMDDTHHMMSS)
 */
function formatDateForGoogle(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  const hours = String(date.getUTCHours()).padStart(2, "0")
  const minutes = String(date.getUTCMinutes()).padStart(2, "0")
  const seconds = String(date.getUTCSeconds()).padStart(2, "0")

  return `${year}${month}${day}T${hours}${minutes}${seconds}`
}

/**
 * Escape special characters for iCalendar format
 */
function escapeString(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
}

/**
 * Copy Google Calendar link to clipboard
 */
export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}
