import { useCallback, useEffect, useRef, useState } from 'react';

// Guest list for the panel. Inside a claude.ai artifact it lives in the
// artifact's shared db (so it follows the owner across devices and Claude can
// read or seed it); anywhere else it falls back to this browser's storage.

const LS_KEY = 'synvitational.panel.v1';
const readLocal = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || null; } catch { return null; } };
const writeLocal = v => { try { localStorage.setItem(LS_KEY, JSON.stringify(v)); } catch { /* storage blocked */ } };
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const DEFAULT_CONCEPT = 'domes';

export function useStore() {
  const [state, setState] = useState(() => {
    const local = readLocal() || {};
    return {
      guests: local.guests || [],
      concept: local.concept || DEFAULT_CONCEPT,
      base: local.base || '',
      mode: 'local',
      canEdit: true,
      ready: false,
    };
  });
  const db = useRef(null);
  const settingsTimer = useRef(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let alive = true;
    const unsubs = [];
    const claude = window.claude;
    if (!claude || !claude.use) { setState(s => ({ ...s, ready: true })); return undefined; }
    claude.use('db').then(async handle => {
      if (!alive) return;
      if (!handle) { setState(s => ({ ...s, ready: true })); return; }
      db.current = handle;
      let canEdit = true;
      try {
        const user = await claude.use('user');
        if (user) canEdit = await user.canEdit();
      } catch { /* keep inputs; a refused write will tell */ }
      if (!alive) return;
      setState(s => ({ ...s, mode: 'db', canEdit }));
      unsubs.push(handle.collection('guests').orderBy('order').onSnapshot(
        snap => setState(s => ({ ...s, ready: true, guests: snap.docs.map(d => ({ id: d.id, ...d.data() })) })),
        () => setState(s => ({ ...s, ready: true })),
      ));
      unsubs.push(handle.doc('settings/main').onSnapshot(
        d => {
          if (!d.exists) return;
          const v = d.data();
          setState(s => ({ ...s, concept: v.concept || s.concept, base: typeof v.base === 'string' ? v.base : s.base }));
        },
        () => {},
      ));
    });
    return () => { alive = false; unsubs.forEach(u => u()); };
  }, []);

  useEffect(() => {
    if (state.mode === 'local') writeLocal({ guests: state.guests, concept: state.concept, base: state.base });
  }, [state.mode, state.guests, state.concept, state.base]);

  const addGuests = useCallback(async list => {
    const clean = list.map(n => n.replace(/\s+/g, ' ').trim()).filter(Boolean);
    if (!clean.length) return;
    const t = Date.now();
    if (db.current) {
      for (let k = 0; k < clean.length; k++) {
        await db.current.collection('guests').add({ name: clean[k], call: '', order: t + k });
      }
    } else {
      setState(s => ({ ...s, guests: [...s.guests, ...clean.map((name, k) => ({ id: newId(), name, call: '', order: t + k }))] }));
    }
  }, []);

  const updateGuest = useCallback(async (id, patch) => {
    if (db.current) await db.current.collection('guests').doc(id).update(patch);
    else setState(s => ({ ...s, guests: s.guests.map(g => (g.id === id ? { ...g, ...patch } : g)) }));
  }, []);

  const removeGuest = useCallback(async id => {
    if (db.current) await db.current.collection('guests').doc(id).delete();
    else setState(s => ({ ...s, guests: s.guests.filter(g => g.id !== id) }));
  }, []);

  // Concept and base link: applied at once, written to db after a short pause.
  const setSettings = useCallback(patch => {
    setState(s => ({ ...s, ...patch }));
    if (!db.current) return;
    clearTimeout(settingsTimer.current);
    settingsTimer.current = setTimeout(() => {
      const s = stateRef.current;
      db.current.doc('settings/main').set({ concept: s.concept, base: s.base }).catch(() => {});
    }, 500);
  }, []);

  return [state, { addGuests, updateGuest, removeGuest, setSettings }];
}
