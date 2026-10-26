import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import gsap from 'gsap';
import Card from './Cards.jsx';
import { fitSize, useFontsReady } from '../fit.js';
import { EVENT, calendarUrl } from '../event.js';

// Envelope → card. GSAP runs the physical sequence (seal, flap, slide, drop),
// Framer Motion handles the tilt and everything typographic on the card.

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function sealPath(r, bumps = 18, wob = 0.06) {
  let d = '';
  for (let i = 0; i <= 180; i++) {
    const a = (i / 180) * Math.PI * 2;
    const rr = r * (1 + wob * Math.sin(a * bumps) * 0.5 + wob * 0.5 * Math.sin(a * 7 + 1.3));
    d += `${i ? 'L' : 'M'}${(Math.cos(a) * rr).toFixed(2)} ${(Math.sin(a) * rr).toFixed(2)}`;
  }
  return d + 'Z';
}
const SEAL = sealPath(46);

function Envelope({ paper, ew, eh, guest, index, total, pocketRef, backRef, flapRef }) {
  const nameSize = fitSize(guest.name, ew * 0.7, ew * 0.064, 10, 700);
  const tipY = eh * 0.58;
  return (
    <>
      <div ref={backRef} className={`env env-back${paper ? ' is-paper' : ''}`} style={{ width: ew, height: eh }} />
      <div ref={pocketRef} className={`env env-pocket${paper ? ' is-paper' : ''}`} style={{ width: ew, height: eh }}>
        <svg viewBox={`0 0 ${ew} ${eh}`} width={ew} height={eh} aria-hidden="true">
          <path className="pk-side" d={`M0 0L${ew * 0.5} ${eh * 0.56}L0 ${eh}Z`} />
          <path className="pk-side" d={`M${ew} 0L${ew * 0.5} ${eh * 0.56}L${ew} ${eh}Z`} />
          <path className="pk-bottom" d={`M0 ${eh}L${ew * 0.5} ${eh * 0.47}L${ew} ${eh}Z`} />
        </svg>
        <div className="pk-text" style={{ top: eh * 0.725 }}>
          <span className="pk-for" style={{ fontSize: ew * 0.03 }}>برای</span>
          <b style={{ fontSize: nameSize }}>{guest.name}</b>
          <span className="pk-no mono" style={{ fontSize: ew * 0.021 }}>NO. {String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')} · {EVENT.latinDate}</span>
        </div>
      </div>
      <div ref={flapRef} className={`env env-flap${paper ? ' is-paper' : ''}`} style={{ width: ew, height: tipY }}>
        <svg viewBox={`0 0 ${ew} ${tipY}`} width={ew} height={tipY} aria-hidden="true">
          <path className="fl-face" d={`M0 0H${ew}L${ew * 0.5} ${tipY}Z`} />
          <path className="fl-edge" d={`M0 0L${ew * 0.5} ${tipY}L${ew} 0`} />
        </svg>
      </div>
    </>
  );
}

export default function Experience({ concept, guests, index, embedded = false, onPhase }) {
  const wrap = useRef(null);
  const floatRef = useRef(null);
  const shell = useRef(null);
  const back = useRef(null);
  const pocket = useRef(null);
  const flap = useRef(null);
  const seal = useRef(null);
  const idle = useRef(null);
  const tl = useRef(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [phase, setPhase] = useState('closed');
  const [run, setRun] = useState(0);
  useFontsReady();

  const guest = guests[index] || guests[0];
  const paper = concept === 'liquid';
  const footer = embedded ? 70 : 110;
  const cw = Math.round(Math.max(180, Math.min(460, box.w * 0.86, ((box.h - footer - 36) * 5) / 7)));
  const ch = Math.round((cw * 7) / 5);
  const ew = Math.round(ch * 0.68);
  const eh = Math.round(ew * 0.7);
  const inner = Math.min((ew * 0.9) / ch, (eh * 0.88) / cw);
  const anchorY = (box.h - footer) / 2 + (embedded ? 6 : 14);

  useLayoutEffect(() => {
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => { onPhase && onPhase(phase); }, [phase, onPhase]);

  // pointer → tilt, glare and the 3D scenes
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-1, 1], [7, -7]), { stiffness: 110, damping: 16 });
  const ry = useSpring(useTransform(px, [-1, 1], [-9, 9]), { stiffness: 110, damping: 16 });
  const gx = useTransform(px, [-1, 1], [15, 85]);
  const gy = useTransform(py, [-1, 1], [10, 90]);
  const glare = useMotionTemplate`radial-gradient(120% 90% at ${gx}% ${gy}%, rgba(255,250,235,.16), rgba(255,250,235,0) 45%)`;
  const onMove = e => {
    if (phase !== 'open' && phase !== 'reveal') return;
    const r = wrap.current.getBoundingClientRect();
    px.set(Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)));
    py.set(Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1)));
  };
  const onLeave = () => { px.set(0); py.set(0); };

  // Closed state, rebuilt on resize and on replay. Once open, a resize only
  // re-centres the card.
  const entered = useRef(-1);
  const isClosed = phase === 'closed';
  useLayoutEffect(() => {
    if (!box.w) return undefined;
    if (!isClosed) {
      if (phase === 'open') gsap.set(shell.current, { xPercent: -50, yPercent: -50, x: 0, y: 0, rotate: 0, scale: 1, zIndex: 6 });
      return undefined;
    }
    gsap.set(floatRef.current, { y: 0, rotate: 0 });
    gsap.set([back.current, pocket.current], { xPercent: -50, yPercent: -50, x: 0, y: 0, rotate: 0, opacity: 1 });
    gsap.set(flap.current, { xPercent: -50, x: 0, y: -eh / 2, rotate: 0, rotateX: 0, transformOrigin: '50% 0%', transformPerspective: 900, zIndex: 4, opacity: 1 });
    flap.current.classList.remove('is-open');
    gsap.set(seal.current, { xPercent: -50, yPercent: -50, x: 0, y: -eh / 2 + eh * 0.55, scale: 1, rotate: 0, opacity: 1 });
    gsap.set(shell.current, { xPercent: -50, yPercent: -50, x: 0, y: eh * 0.04, rotate: -90, scale: inner, zIndex: 2, opacity: 1 });
    let intro = null;
    if (!reduced()) {
      if (entered.current !== run) {
        entered.current = run;
        intro = gsap.from(floatRef.current, { y: 70, opacity: 0, rotate: -4, duration: 1.2, ease: 'expo.out' });
      }
      idle.current = gsap.to(floatRef.current, { y: -9, rotate: 0.6, duration: 2.3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: intro ? 1.2 : 0 });
    }
    return () => {
      intro && intro.progress(1).kill();
      idle.current && idle.current.kill();
    };
  }, [box.w, box.h, run, isClosed]); // eslint-disable-line react-hooks/exhaustive-deps

  const open = useCallback(() => {
    if (phase !== 'closed') return;
    idle.current && idle.current.kill();
    if (reduced()) {
      gsap.set([back.current, pocket.current, flap.current, seal.current], { opacity: 0 });
      gsap.set(shell.current, { y: 0, rotate: 0, scale: 1, zIndex: 6 });
      setPhase('open');
      return;
    }
    setPhase('opening');
    let flipped = false;
    const env = [back.current, pocket.current, flap.current];
    tl.current = gsap.timeline()
      .to(floatRef.current, { y: 0, rotate: 0, duration: 0.35, ease: 'power2.out' }, 0)
      .to(seal.current, { scale: 1.16, duration: 0.16, ease: 'power2.out' }, 0)
      .to(seal.current, { scale: 0, rotate: -140, opacity: 0, duration: 0.45, ease: 'back.in(2.4)' }, 0.16)
      .to(flap.current, {
        rotateX: 180, duration: 0.8, ease: 'power3.inOut',
        onUpdate() {
          if (!flipped && gsap.getProperty(flap.current, 'rotateX') > 90) {
            flipped = true;
            flap.current.classList.add('is-open');
            gsap.set(flap.current, { zIndex: 1 });
          }
        },
      }, 0.4)
      .to(shell.current, { y: -eh * 1.02, duration: 0.9, ease: 'power3.out' }, 1.0)
      .set(shell.current, { zIndex: 6 }, 1.75)
      .to(env, { y: `+=${box.h * 0.9}`, rotate: 7, opacity: 0, duration: 0.95, ease: 'power3.in' }, 1.7)
      .to(shell.current, { y: 0, rotate: 0, scale: 1, duration: 1.3, ease: 'expo.out' }, 1.95)
      .add(() => setPhase('reveal'), 2.15)
      .add(() => setPhase('open'), 3.4);
  }, [phase, eh, box.h]);

  const replay = () => {
    tl.current && tl.current.kill();
    px.set(0); py.set(0);
    setPhase('closed');
    setRun(r => r + 1);
  };

  const shown = phase === 'reveal' || phase === 'open';
  const ready = box.w > 0;

  return (
    <div ref={wrap} className={`xp${embedded ? ' xp--embedded' : ''}`} onPointerMove={onMove} onPointerLeave={onLeave}>
      {ready && (
        <div ref={floatRef} className="xp-anchor" style={{ top: anchorY }} onClick={open}>
          <Envelope paper={paper} ew={ew} eh={eh} guest={guest} index={index} total={guests.length}
            pocketRef={pocket} backRef={back} flapRef={flap} />
          <div ref={shell} className="card-shell" style={{ width: cw, height: ch }}>
            <motion.div className="card-tilt" style={{ rotateX: rx, rotateY: ry, transformPerspective: 1300 }}>
              <Card concept={concept} guests={guests} index={index} w={cw} shown={shown} pointer={{ x: px, y: py }} key={run} />
              <motion.div className="card-glare" style={{ background: glare }} />
            </motion.div>
          </div>
          <button ref={seal} className={`seal${paper ? ' is-paper' : ''}`} style={{ width: ew * 0.17, height: ew * 0.17 }}
            onClick={e => { e.stopPropagation(); open(); }} aria-label={`باز کردن دعوت‌نامه‌ی ${guest.name}`}>
            <svg viewBox="-50 -50 100 100" aria-hidden="true">
              <defs>
                <radialGradient id="sealg" cx="35%" cy="30%" r="80%">
                  <stop offset="0" stopColor="#f6dc86" /><stop offset=".45" stopColor="#ddb12a" /><stop offset="1" stopColor="#7c5f10" />
                </radialGradient>
              </defs>
              <path d={SEAL} fill="url(#sealg)" />
              <circle r="33" fill="none" stroke="#8a6a12" strokeWidth="1.4" opacity=".7" />
              <circle r="29" fill="none" stroke="#f3d27a" strokeWidth=".8" opacity=".5" />
              <path d="M0 -15L17 2L17 10L0 -7L-17 10L-17 2Z" fill="#6f540c" />
              <path d="M0 -17L17 0L17 2L0 -15L-17 2L-17 0Z" fill="#f8e3a0" opacity=".55" />
              <path d="M-9 17L0 26L9 17" fill="none" stroke="#6f540c" strokeWidth="4" />
            </svg>
          </button>
        </div>
      )}

      <AnimatePresence>
        {phase === 'closed' && ready && (
          <motion.p key="hint" className="xp-hint" style={{ top: anchorY + eh / 2 + 26 }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 1.1, duration: 0.8 } }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.25 } }}>
            روی مهر بزن تا باز شود
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'open' && (
          <motion.div key="foot" className="xp-foot" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
            <a className="btn btn--gold" href={calendarUrl(guest.name)} target="_blank" rel="noopener noreferrer">افزودن به تقویم</a>
            <button className="btn" type="button" onClick={replay}>یک بار دیگر باز کن</button>
            {!embedded && <span className="xp-no mono">NO. {String(index + 1).padStart(2, '0')}</span>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
