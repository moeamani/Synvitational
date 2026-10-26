import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Experience from './Experience.jsx';
import { Wordmark } from './bits.jsx';
import { useStore } from '../store.js';
import { CONCEPTS, WEIGHTS, scoreOf } from '../concepts.js';
import { makeToken, firstName } from '../token.js';
import { EVENT, dateLine, timeLine, fa, pad2 } from '../event.js';
import { siteBase } from '../site.js';

// Shown only in the preview until real names are added. Never stored.
const SAMPLE = ['سارا محمدی', 'امیرحسین نوری', 'مریم کریمی', 'علی رضایی', 'نگار صادقی', 'پویا شریفی', 'زهرا حسینی', 'کیان طاهری']
  .map((name, i) => ({ id: `sample-${i}`, name, call: '' }));


const score = c => fa(scoreOf(c).toFixed(1)).replace('.', '٫');

function Thumb({ id }) {
  return <span className={`thumb thumb--${id}`} aria-hidden="true"><i /><i /><i /><i /></span>;
}

function GuestRow({ g, i, active, canEdit, onSelect, onSave, onRemove, onCopy }) {
  const [name, setName] = useState(g.name);
  const [call, setCall] = useState(g.call || '');
  useEffect(() => { setName(g.name); }, [g.name]);
  useEffect(() => { setCall(g.call || ''); }, [g.call]);
  const commit = () => {
    const n = name.replace(/\s+/g, ' ').trim();
    const c = call.replace(/\s+/g, ' ').trim();
    if (!n) { setName(g.name); return; }
    if (n !== g.name || c !== (g.call || '')) onSave({ name: n, call: c });
  };
  const key = e => { if (e.key === 'Enter') e.currentTarget.blur(); };
  return (
    <li className={`gr${active ? ' is-active' : ''}`} onClick={onSelect}>
      <span className="gr-n">{pad2(i + 1)}</span>
      <div className="gr-fields">
        <input id={`gname-${g.id}`} aria-label="نام کامل" value={name} disabled={!canEdit}
          onChange={e => setName(e.target.value)} onBlur={commit} onKeyDown={key} onFocus={onSelect} />
        <input id={`gcall-${g.id}`} className="gr-call" aria-label="با چه اسمی صدایش کنیم" value={call} disabled={!canEdit}
          placeholder={`صدا زدن: ${firstName(name)}`} onChange={e => setCall(e.target.value)} onBlur={commit} onKeyDown={key} onFocus={onSelect} />
      </div>
      <div className="gr-act">
        <button type="button" className="chip" onClick={e => { e.stopPropagation(); onCopy(); }}>کپی لینک</button>
        {canEdit && <button type="button" className="chip chip--x" aria-label={`حذف ${g.name}`} onClick={e => { e.stopPropagation(); onRemove(); }}>×</button>}
      </div>
    </li>
  );
}

export default function Panel() {
  const [st, act] = useStore();
  const [sel, setSel] = useState(0);
  const [draft, setDraft] = useState('');
  const [bulk, setBulk] = useState('');
  const [toast, setToast] = useState('');
  const [manual, setManual] = useState('');
  const [phase, setPhase] = useState('closed');
  const [replay, setReplay] = useState(0);
  const toastTimer = useRef(null);

  const isSample = st.guests.length === 0;
  const roster = isSample ? SAMPLE : st.guests;
  const idx = Math.min(sel, roster.length - 1);
  const concept = CONCEPTS.find(c => c.id === st.concept) ? st.concept : CONCEPTS[0].id;
  const current = CONCEPTS.find(c => c.id === concept);
  const base = siteBase(st.base);
  const tokenFor = i => makeToken({ concept, index: i, guests: roster });
  const linkFor = i => `${base}#${tokenFor(i)}`;

  const flash = msg => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  };
  const copy = async (text, msg) => {
    try {
      await navigator.clipboard.writeText(text);
      setManual('');
      flash(msg);
    } catch {
      setManual(text);
    }
  };

  const add = e => {
    e.preventDefault();
    if (!draft.trim()) return;
    act.addGuests([draft]);
    setDraft('');
    setSel(st.guests.length);
  };
  const addBulk = () => {
    const list = bulk.split(/\n|،|,/);
    if (!list.some(s => s.trim())) return;
    act.addGuests(list);
    setBulk('');
  };
  const allLinks = () => roster.map((g, i) => `${g.name}: ${linkFor(i)}`).join('\n');
  const openFull = () => {
    try { sessionStorage.setItem('synv.fromPanel', '1'); } catch { /* fine */ }
    window.location.hash = tokenFor(idx);
  };

  return (
    <div className="pn">
      <header className="pn-head">
        <div className="pn-brand">
          <Wordmark className="pn-wm" />
          <span className="mono pn-eb">SYNVITATIONAL</span>
        </div>
        <h1>دعوت‌نامه‌های {EVENT.title}</h1>
        <p className="pn-facts">
          <span>{dateLine} {EVENT.year}</span><span>{timeLine}</span><span>{EVENT.venue}</span>
        </p>
      </header>

      <section className="pn-ideas" aria-labelledby="ideas-t">
        <div className="pn-sec">
          <span className="eyebrow gold">ایده‌ها</span>
          <h2 id="ideas-t">سه ایده برای کارت. یکی را انتخاب کن.</h2>
          <p>هر سه با پاکت شروع می‌شوند: مهمان روی مهر می‌زند، پاکت باز می‌شود و کارت بیرون می‌آید. امتیازها با معیارهای داوری Awwwards است.</p>
        </div>
        <div className="ideas">
          {CONCEPTS.map(c => (
            <button key={c.id} type="button" className={`idea${c.id === concept ? ' is-on' : ''}`} aria-pressed={c.id === concept}
              onClick={() => st.canEdit && act.setSettings({ concept: c.id })} disabled={!st.canEdit && c.id !== concept}>
              <Thumb id={c.id} />
              <span className="idea-body">
                <span className="idea-top"><span className="idea-num">{c.num}</span><span className="idea-score">{score(c)}</span></span>
                <b className="idea-name">{c.name}</b>
                <span className="idea-line">{c.line}</span>
                <span className="idea-ref mono">{c.ref}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <main className="pn-main">
        <section className="pn-stage" aria-label="پیش‌نمایش">
          <div className="pn-stage-bar">
            <span><b>{current.name}</b> برای <b>{roster[idx].name}</b>{isSample && <em className="tag">نمونه</em>}</span>
            <span className="pn-stage-act">
              <button type="button" className="chip" onClick={() => setReplay(r => r + 1)}>از اول</button>
              <button type="button" className="chip" onClick={openFull}>تمام‌صفحه</button>
              {!isSample && <button type="button" className="chip chip--gold" onClick={() => copy(linkFor(idx), 'لینک کپی شد')}>کپی لینک</button>}
            </span>
          </div>
          <div className="pn-preview">
            <Experience key={`${concept}-${idx}-${roster[idx].name}-${replay}`} concept={concept} guests={roster} index={idx} embedded onPhase={setPhase} />
            {phase === 'closed' && <span className="pn-preview-tip">پیش‌نمایش زنده است؛ روی مهر بزن.</span>}
          </div>
          <div className="jury">
            <div className="jury-total">
              <span className="eyebrow">امتیاز داوری</span>
              <b>{score(current)}</b>
              <span className="jury-of">از ۱۰</span>
            </div>
            <ul className="jury-bars">
              {WEIGHTS.map(([k, label, w]) => (
                <li key={k}>
                  <span>{label} <em>{fa(w * 100)}٪</em></span>
                  <i style={{ '--v': current.jury[k] / 10 }} />
                  <b>{fa(String(current.jury[k]).replace('.', '٫'))}</b>
                </li>
              ))}
            </ul>
            <p className="jury-note">{current.note}</p>
          </div>
        </section>

        <aside className="pn-guests" aria-labelledby="guests-t">
          <div className="pn-sec">
            <span className="eyebrow gold">مهمان‌ها</span>
            <h2 id="guests-t">{isSample ? 'اسم‌ها را اینجا بنویس' : `${fa(st.guests.length)} نفر`}</h2>
            {!st.canEdit && <p className="muted">این فهرست را فقط سازنده‌ی صفحه می‌تواند تغییر دهد.</p>}
          </div>
          {st.canEdit && (
            <>
              <form className="add" onSubmit={add}>
                <input id="add-name" value={draft} onChange={e => setDraft(e.target.value)} placeholder="نام و نام خانوادگی" autoComplete="off" />
                <button type="submit" className="btn btn--gold">افزودن</button>
              </form>
              <details className="bulk">
                <summary>چند اسم با هم</summary>
                <textarea id="bulk-names" rows={5} value={bulk} onChange={e => setBulk(e.target.value)} placeholder={'هر اسم در یک خط\nسارا محمدی\nعلی رضایی'} />
                <button type="button" className="btn" onClick={addBulk}>افزودن همه</button>
              </details>
            </>
          )}
          {isSample ? (
            <p className="empty">هنوز اسمی نیست. پیش‌نمایش با چند اسم نمونه کار می‌کند؛ اولین اسم را که بنویسی، کارت‌ها با اسم‌های واقعی ساخته می‌شوند.</p>
          ) : (
            <ol className="glist">
              {st.guests.map((g, i) => (
                <GuestRow key={g.id} g={g} i={i} active={i === idx} canEdit={st.canEdit}
                  onSelect={() => setSel(i)}
                  onSave={patch => act.updateGuest(g.id, patch)}
                  onRemove={() => { act.removeGuest(g.id); if (sel >= st.guests.length - 1) setSel(Math.max(0, st.guests.length - 2)); }}
                  onCopy={() => copy(linkFor(i), `لینک ${g.name} کپی شد`)} />
              ))}
            </ol>
          )}
          {!isSample && (
            <button type="button" className="btn btn--wide" onClick={() => copy(allLinks(), 'همه‌ی لینک‌ها کپی شد')}>کپی همه‌ی لینک‌ها</button>
          )}
          <label className="base" htmlFor="base-url">
            <span>آدرس صفحه‌ی دعوت</span>
            <input id="base-url" dir="ltr" value={st.base || ''} placeholder={siteBase('')} disabled={!st.canEdit}
              onChange={e => act.setSettings({ base: e.target.value.trim() })} />
            <small>لینک هر نفر همین آدرس است به‌علاوه‌ی یک کد اختصاصی. خالی بگذار تا لینک‌ها به نسخه‌ی اصلی روی Vercel بروند.</small>
          </label>
          {manual && (
            <div className="manual">
              <span>کپی خودکار کار نکرد. متن انتخاب شده است؛ خودت کپی کن.</span>
              <textarea id="manual-copy" readOnly value={manual} rows={4} autoFocus onFocus={e => e.target.select()} />
            </div>
          )}
          <p className="muted small">{st.mode === 'db' ? 'فهرست در خود صفحه ذخیره می‌شود و روی هر دستگاهی که بازش کنی همین است.' : 'فهرست فقط در همین مرورگر ذخیره می‌شود.'}</p>
        </aside>
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div key="toast" className="toast" role="status" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
