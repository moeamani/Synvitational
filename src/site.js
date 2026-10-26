// Where guest links point. The Vercel production domain; on any other host
// (local dev, the claude.ai panel) links still go there.
export const SITE_URL = 'https://synvitational.vercel.app/';

export function siteBase(stored) {
  const pick = (stored && stored.trim()) || SITE_URL || `${window.location.origin}${window.location.pathname}`;
  return pick.replace(/#.*$/, '');
}
