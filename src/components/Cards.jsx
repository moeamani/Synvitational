import { Fragment } from 'react';
import { EVENT, fa, pad2, timeLine, dateLine } from '../event.js';
import { callOf } from '../token.js';
import { fitSize, measure } from '../fit.js';
import { Reveal, Fade, Grain, Wordmark, GL, Details, Sparkle, useExport } from './bits.jsx';
import DomesScene from '../scenes/DomesScene.jsx';
import LiquidScene from '../scenes/LiquidScene.jsx';
import LineupScene from '../scenes/LineupScene.jsx';

// Cards are 5:7, the classic invitation size. Every size is derived from the
// card width w, so the layout holds from a phone preview to a desktop.
const VIEW_H = 2 * 6 * Math.tan((35 / 2) * Math.PI / 180); // world units visible at z=0

function splitLines(name) {
  const words = name.trim().split(/\s+/);
  if (words.length <= 3) return words;
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(' '), words.slice(half).join(' ')];
}

// ۰۱ · Domes
function Domes({ guest, w, h, shown, pointer, instant }) {
  const lines = splitLines(guest.name);
  const block = w * 0.4;
  const size = Math.min(...lines.map(l => fitSize(l, w * 0.84, w * 0.2, 12, 900)), block / (lines.length * 1.04));
  const nameH = lines.length * size * 1.04;
  const gap = ((nameH + w * 0.4) / h) * VIEW_H;
  return (
    <>
      <GL><DomesScene shown={shown} pointer={pointer} gap={gap} instant={instant} /></GL>
      <Grain />
      <div className="c-top">
        <Reveal show={shown} delay={0.15} className="eyebrow gold">{EVENT.kind}</Reveal>
        <Fade show={shown} delay={0.2}><Wordmark className="c-wm" /></Fade>
      </div>
      <div className="d-name" style={{ fontSize: size, top: `calc(50% - ${nameH / 2}px)` }}>
        {lines.map((l, i) => <Reveal key={i} show={shown} delay={0.35 + i * 0.12}>{l}</Reveal>)}
      </div>
      <Reveal show={shown} delay={0.75} className="d-line" style={{ top: `calc(50% + ${nameH / 2 + w * 0.07}px)` }}>
        سینتکس بی تو یک حرف کم دارد.
      </Reveal>
      <div className="c-bottom">
        <Details show={shown} delay={0.95} />
      </div>
    </>
  );
}

// ۰۲ · Liquid gold, on paper
function Liquid({ guest, w, shown, pointer, instant }) {
  const call = callOf(guest);
  const l1 = `${call}،`;
  const headSize = fitSize(l1, w * 0.58, w * 0.205, w * 0.09, 900);
  return (
    <>
      <GL><LiquidScene shown={shown} pointer={pointer} instant={instant} /></GL>
      <Grain paper />
      <div className="c-top l-top">
        <Reveal show={shown} delay={0.1} className="l-tiny">{EVENT.title} · {EVENT.year}</Reveal>
        <Reveal show={shown} delay={0.15} className="l-tiny mono">SYNTEX.GROUP</Reveal>
      </div>
      <div className="l-head" style={{ fontSize: headSize }}>
        <Reveal show={shown} delay={0.3}>{l1}</Reveal>
        <Reveal show={shown} delay={0.42} style={{ fontSize: w * 0.205 }}>دعوتی!</Reveal>
      </div>
      <Fade show={shown} delay={0.6} className="l-arrow">
        <span aria-hidden="true">←</span>
        <b>یک بعدازظهر<br />با هم</b>
      </Fade>
      <div className="l-tags">
        <Reveal show={shown} delay={0.7} className="l-guest">مهمان: <b>{guest.name}</b></Reveal>
        <Reveal show={shown} delay={0.78} className="l-tag">جلسه‌ی سازمانی</Reveal>
        <Reveal show={shown} delay={0.86} className="l-tag">تیم‌سازی</Reveal>
      </div>
      <div className="l-date">
        <Reveal show={shown} delay={0.9} className="l-wd">{EVENT.weekday}</Reveal>
        <Reveal show={shown} delay={0.98} className="l-dm">{EVENT.day} {EVENT.month}</Reveal>
        <Reveal show={shown} delay={1.06} className="l-tm">{timeLine}</Reveal>
        <Reveal show={shown} delay={1.12} className="l-vn">{EVENT.venue} <span className="mono">{EVENT.venueEn.toUpperCase()}</span></Reveal>
      </div>
      <Fade show={shown} delay={1.1} className="l-body">
        <p>{guest.name} عزیز، {EVENT.weekday} دور هم جمع می‌شویم. اول جلسه‌ی سازمانی، بعد تیم‌سازی. بدون تو جمع‌مان کامل نیست.</p>
      </Fade>
      <svg className="l-diag" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M100 0L0 100" /></svg>
    </>
  );
}

// ۰۳ · Lineup: everyone on the bill, the guest as headliner
function Lineup({ guest, guests, index, w, shown, pointer, instant }) {
  const others = guests.filter((_, i) => i !== index).map(g => g.name);
  const nameSize = fitSize(guest.name, w * 0.84, w * 0.12, 10, 900);
  const joined = others.join('  |  ');
  const maxLines = 4;
  let lineSize = w * 0.034;
  if (joined) {
    const total = measure(joined, lineSize, 500);
    const capacity = w * 0.84 * maxLines * 0.92;
    if (total > capacity) lineSize = Math.max(w * 0.018, lineSize * (capacity / total));
  }
  return (
    <>
      <Fade show={shown} delay={0.1} className="u-num u-day">{pad2(7)}</Fade>
      <Fade show={shown} delay={0.25} className="u-num u-month">{EVENT.month}</Fade>
      <GL><LineupScene shown={shown} pointer={pointer} instant={instant} /></GL>
      <Grain />
      <div className="c-top">
        <Reveal show={shown} delay={0.2} className="u-time">{timeLine}</Reveal>
        <Fade show={shown} delay={0.2}><Wordmark className="c-wm" /></Fade>
      </div>
      <Fade show={shown} delay={0.5} className="u-vwrap"><span className="u-vertical mono">SYNTEX TEAM DAY · {EVENT.latinDate} · {EVENT.venueEn.toUpperCase()}</span></Fade>
      <Sparkle show={shown} delay={0.7} style={{ top: '13%', left: '14%', width: w * 0.07 }} />
      <Sparkle show={shown} delay={0.9} gold style={{ top: '46%', left: '76%', width: w * 0.05 }} />
      <Sparkle show={shown} delay={1.1} style={{ top: '60%', left: '9%', width: w * 0.04 }} />
      <div className="u-bill">
        <Reveal show={shown} delay={0.6} className="eyebrow gold">سرِ لاین‌آپ</Reveal>
        <Reveal show={shown} delay={0.7} className="u-head" style={{ fontSize: nameSize }}>{guest.name}</Reveal>
        {others.length > 0 && <Reveal show={shown} delay={0.8} className="u-with">و با حضور</Reveal>}
        {others.length > 0 && (
          <Fade show={shown} delay={0.9} className="u-names" style={{ fontSize: lineSize }}>
            {others.map((n, i) => (
              <Fragment key={i}><span>{n}</span>{i < others.length - 1 && <i aria-hidden="true">|</i>}{' '}</Fragment>
            ))}
          </Fade>
        )}
        <Reveal show={shown} delay={1.05} className="u-foot">{dateLine} {EVENT.year} · {EVENT.venue}</Reveal>
      </div>
    </>
  );
}

const MAP = { domes: Domes, liquid: Liquid, lineup: Lineup };

export default function Card({ concept, guests, index, w, shown, pointer }) {
  const instant = Boolean(useExport());
  const Comp = MAP[concept] || Domes;
  const h = Math.round((w * 7) / 5);
  const guest = guests[index] || guests[0];
  return (
    <div className={`card card--${concept in MAP ? concept : 'domes'}${instant ? ' card--export' : ''}`} style={{ width: w, height: h, '--w': `${w}px` }}>
      <Comp guest={guest} guests={guests} index={index} w={w} h={h} shown={shown} pointer={pointer} instant={instant} />
    </div>
  );
}

export { fa };
