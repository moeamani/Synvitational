import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { EVENT, dateLine, timeLine } from '../event.js';
import wordmarkUrl from '../assets/syntex-wordmark.png';

const EASE = [0.16, 1, 0.3, 1];

// Masked line reveal: the line rises out of its own box.
export function Reveal({ show, delay = 0, className = '', style, children, as: Tag = 'div' }) {
  return (
    <Tag className={`rv ${className}`} style={style}>
      <motion.span
        className="rv-in"
        initial={false}
        animate={show ? { y: '0%', opacity: 1, filter: 'blur(0px)' } : { y: '108%', opacity: 0, filter: 'blur(8px)' }}
        transition={{ duration: show ? 1 : 0.2, delay: show ? delay : 0, ease: EASE }}
      >
        {children}
      </motion.span>
    </Tag>
  );
}

export function Fade({ show, delay = 0, className = '', style, children }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={false}
      animate={show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
      transition={{ duration: show ? 1.1 : 0.2, delay: show ? delay : 0, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function Grain({ paper = false }) {
  return <div className={`grain${paper ? ' grain--paper' : ''}`} aria-hidden="true" />;
}

export function Wordmark({ ink = false, className = '' }) {
  if (ink) {
    return <span className={`wm wm--ink ${className}`} role="img" aria-label="Syntex" style={{ WebkitMaskImage: `url(${wordmarkUrl})`, maskImage: `url(${wordmarkUrl})` }} />;
  }
  return <img className={`wm ${className}`} src={wordmarkUrl} alt="Syntex" />;
}

export function GL({ children, camera = { position: [0, 0, 6], fov: 35 } }) {
  return (
    <div className="gl" aria-hidden="true">
      <Canvas dpr={[1, 1.75]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} camera={camera} resize={{ offsetSize: true }}>
        {children}
      </Canvas>
    </div>
  );
}

export function Details({ show, delay = 0.7 }) {
  const cols = [
    ['روز', dateLine, EVENT.year, false],
    ['ساعت', timeLine, '۴٫۵ ساعت', false],
    ['کجا', EVENT.venue, EVENT.venueEn, true],
  ];
  return (
    <div className="details">
      {cols.map(([label, value, sub, mono], i) => (
        <motion.div
          key={label}
          className="det"
          initial={false}
          animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.9, delay: show ? delay + i * 0.09 : 0, ease: EASE }}
        >
          <span className="det-l">{label}</span>
          <b className="det-v">{value}</b>
          <span className={`det-s${mono ? ' mono' : ''}`}>{sub}</span>
        </motion.div>
      ))}
    </div>
  );
}

export function Sparkle({ className = '', style, show, delay = 0, gold = false }) {
  return (
    <motion.svg
      viewBox="-50 -50 100 100"
      className={`spark ${className}`}
      style={style}
      initial={false}
      animate={show ? { opacity: [0, 1, 0.55, 1], scale: [0.2, 1.1, 0.9, 1], rotate: [0, 45, 30, 45] } : { opacity: 0, scale: 0.2 }}
      transition={{ duration: 1.6, delay: show ? delay : 0, ease: EASE }}
      aria-hidden="true"
    >
      <path d="M0 -48 C3 -10 10 -3 48 0 C10 3 3 10 0 48 C-3 10 -10 3 -48 0 C-10 -3 -3 -10 0 -48Z"
        fill="none" stroke={gold ? 'var(--gold)' : 'var(--text)'} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </motion.svg>
  );
}
