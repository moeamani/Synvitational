// A guest link is the page URL plus "#v1.<base64url JSON>".
// Only letters, digits and . _ - survive in an artifact link's hash, which
// base64url respects. The roster rides along so the lineup card can list
// everyone without any server read.

const enc = s => {
  let bin = '';
  new TextEncoder().encode(s).forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const dec = s => {
  let b = s.replace(/-/g, '+').replace(/_/g, '/');
  while (b.length % 4) b += '=';
  return new TextDecoder().decode(Uint8Array.from(atob(b), c => c.charCodeAt(0)));
};

export const firstName = n => (n || '').trim().split(/\s+/)[0] || '';
export const callOf = g => (g.call && g.call.trim()) || firstName(g.name);

export function makeToken({ concept, index, guests }) {
  const g = guests.map(x => (x.call && x.call.trim() && x.call.trim() !== firstName(x.name) ? [x.name, x.call.trim()] : x.name));
  return 'v1.' + enc(JSON.stringify({ c: concept, i: index, g }));
}

export function readToken(hash) {
  const h = (hash || '').replace(/^#/, '');
  if (!h.startsWith('v1.')) return null;
  try {
    const p = JSON.parse(dec(h.slice(3)));
    const guests = p.g.map(x => (Array.isArray(x) ? { name: x[0], call: x[1] } : { name: x, call: '' }));
    if (!guests.length) return null;
    return { concept: p.c, index: Math.min(Math.max(0, p.i | 0), guests.length - 1), guests };
  } catch {
    return null;
  }
}
