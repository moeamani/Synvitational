// Turns the Vite build into a claude.ai artifact: the artifact host supplies
// <html>/<head>/<body>, so the page is just title + inline CSS + root + script.
import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';

const out = 'artifact';
mkdirSync(out, { recursive: true });
const css = readFileSync('dist/app.css', 'utf8');
const page = `<title>Synvitational</title>
<style>${css}</style>
<div id="root"></div>
<script src="app.js"></script>
`;
writeFileSync(`${out}/index.html`, page);
copyFileSync('dist/app.js', `${out}/app.js`);
console.log(`artifact/index.html ${(page.length / 1024).toFixed(0)} KB, app.js ${(readFileSync('dist/app.js').length / 1024).toFixed(0)} KB`);
