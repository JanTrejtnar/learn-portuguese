/** Denní připomínka jako kalendářní událost (.ics). Bez serveru a bez oprávnění k notifikacím. */

const pad = (n: number) => String(n).padStart(2, '0');

export const isValidTime = (t: string): boolean => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

/** `time` = 'HH:MM' (místní čas, „plovoucí“ bez časového pásma). */
export const buildReminderIcs = (time: string, url: string, now: Date): string => {
  const t = isValidTime(time) ? time : '19:00';
  const [h, m] = t.split(':').map(Number) as [number, number];
  const d = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
  const end = `${pad(Math.floor((h * 60 + m + 15) / 60) % 24)}${pad((h * 60 + m + 15) % 60)}00`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Portuglove//Pripominka//CS',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:portuglove-denni-pripominka@${new URL(url, 'https://example.invalid').host}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${d}T${pad(h)}${pad(m)}00`,
    `DTEND:${d}T${end}`,
    'RRULE:FREQ=DAILY',
    `SUMMARY:${esc('Portuglove: čas na portugalštinu')}`,
    `DESCRIPTION:${esc(`Pár minut denně stačí. Otevři aplikaci: ${url}`)}`,
    `URL:${url}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc('Portuglove')}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n') + '\r\n';
};
