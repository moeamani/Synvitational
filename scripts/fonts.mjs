// Kalameh is a licensed Fontiran face and this repo is public, so the font
// files are committed only encrypted (AES-256-GCM). The key lives in the
// FONT_KEY environment variable of the Vercel project.
//
//   node scripts/fonts.mjs          decrypt fonts/*.woff.enc → fonts/*.woff (needs FONT_KEY)
//   node scripts/fonts.mjs --seal   encrypt fonts/kalameh-*.woff → .enc     (needs FONT_KEY)
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';

const dir = 'fonts';
const key = process.env.FONT_KEY ? Buffer.from(process.env.FONT_KEY, 'hex') : null;

if (process.argv.includes('--seal')) {
  if (!key || key.length !== 32) throw new Error('FONT_KEY must be 64 hex characters');
  for (const f of readdirSync(dir).filter(n => /^kalameh-.*\.woff$/.test(n))) {
    const iv = randomBytes(12);
    const c = createCipheriv('aes-256-gcm', key, iv);
    const body = Buffer.concat([c.update(readFileSync(`${dir}/${f}`)), c.final()]);
    writeFileSync(`${dir}/${f}.enc`, Buffer.concat([iv, c.getAuthTag(), body]));
    console.log('sealed', f);
  }
} else {
  const sealed = readdirSync(dir).filter(n => n.endsWith('.woff.enc'));
  const missing = sealed.filter(n => !existsSync(`${dir}/${n.slice(0, -4)}`));
  if (!missing.length) process.exit(0);
  if (!key) {
    console.error(`fonts: ${missing.length} Kalameh files missing and FONT_KEY is not set. Add the .woff files to fonts/ or set FONT_KEY.`);
    process.exit(1);
  }
  for (const n of missing) {
    const raw = readFileSync(`${dir}/${n}`);
    const d = createDecipheriv('aes-256-gcm', key, raw.subarray(0, 12));
    d.setAuthTag(raw.subarray(12, 28));
    writeFileSync(`${dir}/${n.slice(0, -4)}`, Buffer.concat([d.update(raw.subarray(28)), d.final()]));
    console.log('fonts: unsealed', n.slice(0, -4));
  }
}
