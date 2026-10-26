# Synvitational

Personal invitations for Syntex's gathering: Thursday 7 Aban 1405, 14:00 to 18:30, Barman Cafe (کافه بارمان). An organization meeting followed by team building.

Each guest gets their own link. It opens on a sealed envelope with their name on it; they tap the gold seal, the flap opens, the card slides out, turns upright and comes alive in 3D. Everything is in Persian, set in Kalameh.

## The three card ideas

| | Idea | Reference | What happens |
|---|---|---|---|
| 01 | دو نیم‌کره (Domes) | DeepTech poster | The gold ^ and grey ˇ of the Syntex logo become two lit spheres; the guest's name sits in the gap between them. Custom GLSL rim shader with grain. |
| 02 | دعوتی! (Liquid gold) | Art Exhibition poster | Light paper card. The Syntex mark in polished 3D metal, gold over graphite. The headline is the guest's first name: «علی، دعوتی!» |
| 03 | لاین‌آپ (Lineup) | Summer Sonic poster | A festival bill. A gold ribbon tied in a figure eight; every guest is listed, and on each card its owner is the headliner. |

Scores in the panel follow the Awwwards jury weighting (design 40%, usability 30%, creativity 20%, content 10%).

## The panel

Open the page with no hash to get the panel:

- add guests one at a time or paste a list (one name per line)
- set the name each guest is called by (defaults to the first word)
- pick an idea and watch it live, envelope included
- copy one guest's link, or all links as `name: link` lines for a messenger

A guest link is the page address plus `#v1.<base64url JSON>`. The token carries the idea, the guest's position and the roster, so a guest's card needs no server read. Event details live in `src/event.js`.

## Stack

React 18, GSAP (envelope timeline), Framer Motion (card tilt, glare and text reveals), React Three Fiber + drei (the three 3D scenes, lit by a procedural studio with no HDR downloads). Vite builds one classic script with fonts and images inlined.

## Live

- Site and panel: https://synvitational.vercel.app
- A guest link looks like `https://synvitational.vercel.app/#v1.…`

The Vercel project `synvitational` (team lyzeapp) builds this repo on every push to `claude/bold-knuth-9uqyo8`.

## Fonts

Kalameh is a licensed Fontiran typeface and this repository is public, so the font files are committed only in encrypted form (`fonts/*.woff.enc`, AES-256-GCM). `scripts/fonts.mjs` unseals them before every build when the `FONT_KEY` environment variable is set; the Vercel project has it. Locally you can either set `FONT_KEY` or drop the plain `.woff` files into `fonts/`.

## Build

```
npm install
npm run dev              # local development
npm run build            # dist/, what Vercel serves
npm run build:artifact   # artifact/, the claude.ai version of the panel
```
