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

## Build

Kalameh is a licensed Fontiran typeface and is not in this repository. Put these files in `fonts/` first:

```
kalameh-light.woff  kalameh-regular.woff  kalameh-medium.woff
kalameh-bold.woff   kalameh-extrabold.woff  kalameh-black.woff
```

Then:

```
npm install
npm run dev      # local development
npm run build    # dist/ for any static host, artifact/ for claude.ai
```
