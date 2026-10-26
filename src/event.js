// The gathering itself. Guests' links carry only names, so everything here is
// baked into the page.
export const EVENT = {
  title: 'دورهمی سینتکس',
  kind: 'جلسه‌ی سازمانی و تیم‌سازی',
  weekday: 'پنجشنبه',
  day: '۷',
  month: 'آبان',
  monthNum: '۰۸',
  year: '۱۴۰۵',
  start: '۱۴:۰۰',
  end: '۱۸:۳۰',
  duration: 'چهار ساعت و نیم',
  venue: 'کافه باغ بارمان',
  venueEn: 'Baarman Garden Cafe',
  latinDate: '1405.08.07',
  // Thursday 29 Oct 2026, 14:00 to 18:30 Tehran time (UTC+03:30)
  calStart: '20261029T103000Z',
  calEnd: '20261029T150000Z',
};

export const dateLine = `${EVENT.weekday} ${EVENT.day} ${EVENT.month}`;
export const timeLine = `${EVENT.start} تا ${EVENT.end}`;

export function calendarUrl(guestName) {
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: EVENT.title,
    dates: `${EVENT.calStart}/${EVENT.calEnd}`,
    location: `${EVENT.venue} (${EVENT.venueEn})`,
    details: `${EVENT.kind}${guestName ? `\nدعوت‌نامه‌ی ${guestName}` : ''}`,
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

const FA_D = '۰۱۲۳۴۵۶۷۸۹';
export const fa = s => String(s).replace(/[0-9]/g, d => FA_D[d]);
export const pad2 = n => fa(String(n).padStart(2, '0'));
