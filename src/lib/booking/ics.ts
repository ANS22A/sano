/**
 * SANO LUNA — ICS Calendar File Generator
 *
 * Generates a standards-compliant RFC 5545 .ics file for calendar downloads.
 * No external APIs required.
 */

interface ICSEventParams {
  uid: string           // Unique event ID (booking number)
  summary: string       // Event title
  description: string   // Event description
  location: string      // Location string
  startDate: string     // 'YYYY-MM-DD'
  startTime: string     // 'HH:MM'
  endTime: string       // 'HH:MM'
  timezone?: string
}

function padded(n: number): string {
  return String(n).padStart(2, '0')
}

/** Format a date+time into ICS TZID format: YYYYMMDDTHHMMSS */
function formatICSDateTime(date: string, time: string): string {
  const [y, mo, d] = date.split('-')
  const [h, mi] = time.split(':')
  return `${y}${mo}${d}T${h}${mi}00`
}

/** Current timestamp in ICS format for DTSTAMP */
function nowICS(): string {
  const n = new Date()
  return (
    `${n.getUTCFullYear()}` +
    `${padded(n.getUTCMonth() + 1)}` +
    `${padded(n.getUTCDate())}T` +
    `${padded(n.getUTCHours())}` +
    `${padded(n.getUTCMinutes())}` +
    `${padded(n.getUTCSeconds())}Z`
  )
}

/** Escape special characters per RFC 5545 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

export function generateICSContent(params: ICSEventParams): string {
  const tz = params.timezone ?? 'Asia/Riyadh'
  const dtStart = formatICSDateTime(params.startDate, params.startTime)
  const dtEnd = formatICSDateTime(params.startDate, params.endTime)

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SANO LUNA//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    // VTIMEZONE block required for TZID references to be RFC 5545 compliant
    'BEGIN:VTIMEZONE',
    `TZID:${tz}`,
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0300',
    'TZOFFSETTO:+0300',
    'TZNAME:+03',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${params.uid}@sanoluna.com`,
    `DTSTAMP:${nowICS()}`,
    `DTSTART;TZID=${tz}:${dtStart}`,
    `DTEND;TZID=${tz}:${dtEnd}`,
    `SUMMARY:${escapeICS(params.summary)}`,
    `DESCRIPTION:${escapeICS(params.description)}`,
    `LOCATION:${escapeICS(params.location)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  // RFC 5545 requires lines > 75 chars to be folded with CRLF + SPACE
  const folded = lines.flatMap((line) => {
    if (line.length <= 75) return [line]
    const chunks: string[] = []
    chunks.push(line.slice(0, 75))
    let i = 75
    while (i < line.length) {
      chunks.push(' ' + line.slice(i, i + 74))
      i += 74
    }
    return chunks
  })

  return folded.join('\r\n')
}

/** Trigger download of an ICS file in the browser */
export function downloadICS(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
