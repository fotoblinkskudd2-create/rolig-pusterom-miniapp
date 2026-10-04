// Smutthullet: web push på iOS krever at appen er på Hjem-skjerm og abonnementer
// forsvinner tilfeldig. Kalender-alarmer gjør ikke det. Vi lager .ics-filer med VALARM,
// brukeren legger dem i Apple Kalender én gang, og iOS varsler – helt uten server.
import { saveFile } from './store.js'

const pad = (n) => String(n).padStart(2, '0')
const stamp = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
const dateOnly = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
const esc = (s = '') => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (m) => '\\' + m)

/**
 * events: [{ uid, title, date (Date|string, heldagshendelse), description, url, alarmsDaysBefore: [3, 1] }]
 */
export function buildICS(events, calName = 'Vibe10') {
  const now = stamp(new Date())
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Vibe10//NO', 'CALSCALE:GREGORIAN', `X-WR-CALNAME:${esc(calName)}`]
  for (const e of events) {
    const d = new Date(e.date)
    const next = new Date(d); next.setDate(next.getDate() + 1)
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.uid}@vibe10`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${dateOnly(d)}`,
      `DTEND;VALUE=DATE:${dateOnly(next)}`,
      `SUMMARY:${esc(e.title)}`,
    )
    if (e.description) lines.push(`DESCRIPTION:${esc(e.description)}`)
    if (e.url) lines.push(`URL:${esc(e.url)}`)
    for (const days of e.alarmsDaysBefore ?? [1]) {
      // Heldagshendelse starter 00:00 lokal tid. -P{n-1}DT15H = kl 09:00 n dager før; PT9H = kl 09:00 samme dag.
      const trigger = days === 0 ? 'PT9H' : `-P${days - 1}DT15H`
      lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(e.title)}`, `TRIGGER:${trigger}`, 'END:VALARM')
    }
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export const downloadICS = (filename, events, calName) =>
  saveFile(filename.endsWith('.ics') ? filename : filename + '.ics', buildICS(events, calName), 'text/calendar')
