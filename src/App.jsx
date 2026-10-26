import { useEffect, useState } from 'react';
import Panel from './components/Panel.jsx';
import Experience from './components/Experience.jsx';
import { readToken, callOf } from './token.js';
import { EVENT } from './event.js';

function GuestView({ token }) {
  let fromPanel = false;
  try { fromPanel = sessionStorage.getItem('synv.fromPanel') === '1'; } catch { /* fine */ }
  const guest = token.guests[token.index];
  useEffect(() => { document.title = `${callOf(guest)}، دعوتی! · ${EVENT.title}`; }, [guest]);
  return (
    <div className={`gv gv--${token.concept}`}>
      <div className="gv-frame" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="gv-top">
        <span className="mono">SYNVITATIONAL · {EVENT.latinDate}</span>
        {fromPanel
          ? <button type="button" className="chip" onClick={() => { window.location.hash = ''; }}>بازگشت به پنل</button>
          : <span>دعوت‌نامه‌ی شخصی</span>}
      </div>
      <Experience concept={token.concept} guests={token.guests} index={token.index} />
    </div>
  );
}

export default function App() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const f = () => setHash(window.location.hash);
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  const token = readToken(hash);
  return token ? <GuestView key={hash} token={token} /> : <Panel />;
}
