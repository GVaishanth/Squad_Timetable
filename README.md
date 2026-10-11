# 🎓 Squad Timetable

A live timetable tracker for VIT Vellore students on the **FFCS (Fully Flexible Credit System)** — now rebuilt as a modern **React + Vite + Tailwind** app with **in-browser editing**. No backend, no login, works offline once loaded.

Live site: `https://<your-username>.github.io/Squad_Timetable/`

---

## What it does

### 🟢 Squad Pulse
A live strip at the top showing **who's free vs in class right now**, with counts and per-member avatars (hover to see where someone is and when they're free).

### ⏰ Live clock + status cards
Each member gets a card showing their real-time status, synced to the device clock and updated every second:

- 📚 **In Class** — room number pill + course code, plus a "Free at" time
- 🏠 **In Room** — with next class time, room and course
- 🍽️ **Lunch** · 😴 **Before class** · 🏖️ **Weekend**

Double-click a name to reveal their nickname (and back again).

### 🗓️ Timetable grids
Each member's full **Mon–Fri** timetable in the standard FFCS grid. The **current time column** is highlighted across all tables (🔴 red = class, 🟢 green = free), today's row is tinted, and a glowing **time needle** sweeps across the tables in real time.

### ✏️ Edit mode (new!)
Hit the **Edit** button (top-left, gold Mjölnir) — no code needed:

- **Click any timetable cell** to add/change/remove the theory or lab class there (course name + room)
- **🧬 One-click lab mirroring** — labs span 2-hour blocks across two columns; one button fills both halves
- **Edit members** (name, emoji, accent colour) or **add/remove members** entirely
- Everything **saves automatically** to the browser (localStorage) and applies instantly
- **⋯ menu → Export/Import** to back up or share timetables as JSON, **Reset** to restore the original data

### ⚡ Lightweight by design
- The Bifröst background paints its streaks once; only the light pulses animate (30 fps, paused when the tab is hidden)
- Border beams are GPU-rotated layers — no per-frame repaints — and pause when scrolled off-screen
- **Lite mode** (⋯ menu) freezes all animations while keeping the look. It switches on automatically on low-power devices, with Data Saver / reduced motion, or if the page detects a low frame rate
- The OCR engine is only downloaded when you actually import a timetable photo

### 📷 Import timetable from image (new!)
Adding a member? Hit **Upload timetable image** inside ➕ Add member:

- Drop a **VTOP / FFCS timetable screenshot** (or paste a screenshot with Ctrl+V) — slots, course names and room numbers are read automatically with on-device OCR
- Or switch to **📋 Paste text** and paste copied timetable rows instead
- Pick **🌅 Morning / 🌆 Evening batch** — this decides the 1/2 suffix for any slot read without one (bare “A” → A1 or A2)
- **Review every row** before creating: fix misreads, delete junk rows, add rows by hand — what you see is what gets saved

The OCR engine + English data (~16 MB) ship with the site and load lazily only when you import, so the site stays fully offline. If the local files are ever missing, it falls back to CDN automatically.

---

## Run it locally

Requires Node.js 20+ (22 LTS recommended).

```bash
npm install   # first time only
npm run dev   # dev server with hot reload
npm run build # production build → ./dist
```

## Deploy

The site deploys to **GitHub Pages** automatically with GitHub Actions.

1. Create a new repository on GitHub (e.g. `Squad_Timetable`) and push this project to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/Squad_Timetable.git
   git push -u origin main
   ```
2. On GitHub open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Open the **Actions** tab — the *Deploy to GitHub Pages* workflow builds the app and publishes `./dist`. Re-run it once if the first run started before step 2.
4. Your site is live at `https://<your-username>.github.io/<repo-name>/`.

Every push to `main` redeploys. The URL base path is set automatically from the repository name (`BASE_PATH` in the workflow → `base` in `vite.config.js`), so you can name the repo anything — including `<your-username>.github.io` for a root site.

> Don't commit `node_modules/`, `dist/` or `public/ocr/` — they're generated (`npm install` / `npm run build` recreate them) and are already in `.gitignore`.

---

## Project structure

```
├── index.html                  # Vite entry HTML
├── src/
│   ├── main.jsx                # React entry
│   ├── App.jsx                 # Layout + modal/editor state
│   ├── index.css               # Tailwind + needle/scrollbar/modal styles
│   ├── hooks.js                # useNow clock + usePeople persisted store
│   ├── fx.js                   # Full / Lite effects mode (auto-detect + toggle)
│   ├── lib/ffcs.js             # FFCS time model + status engine (pure logic)
│   ├── lib/ocr.js              # On-device OCR wrapper (tesseract.js, self-hosted)
│   ├── lib/parseTimetable.js   # OCR/pasted text → timetable rows
│   ├── data/defaultPeople.js   # Original squad data (restored on Reset)
│   └── components/
│       ├── Header.jsx          # Title, clock, edit toggle, backup menu
│       ├── StatusCards.jsx     # SquadPulse strip + profile cards
│       ├── Timetable.jsx       # FFCS grid + live time needle
│       ├── Editors.jsx         # Cell editor + member editor modals
│       ├── ImportTimetable.jsx # Photo/text → review → new member wizard
│       ├── ErrorPopup.jsx      # Friendly error dialogs
│       ├── Icons.jsx           # Asgard icon set (Mjölnir + gold rune icons)
│       ├── BifrostBackground.jsx # Bifröst light-streak canvas (static + pulse layers)
│       └── BifrostRunner.jsx   # GPU-rotated beam circling each panel border
├── public/                     # Favicons + web manifest (copied as-is)
├── scripts/
│   └── setup-ocr-assets.mjs    # Stages OCR engine + language data (postinstall/prebuild)
└── .github/workflows/static.yml # Build + deploy to GitHub Pages
```

## Data model

Each member looks like this (also the shape of exported JSON):

```json
{
  "id": "vaishanth",
  "name": "Vaishanth",
  "nickname": "Playboy",
  "emoji": "🐺",
  "accent": "#e91e8c",
  "registered": {
    "MON": {
      "theory": { "A2": { "n": "BACSE202 - Data Structures", "r": "PRP472" } },
      "lab": { "L5": { "n": "BACSE202 - DS Lab", "r": "PRP347" } }
    }
  }
}
```

Slot codes follow the official VIT FFCS structure (see `src/lib/ffcs.js` for the full time model).

## FFCS format reference

```
Theory Hours  │ 8:00  9:00  10:00  11:00  12:00  None │ LUNCH │ 2:00  3:00  4:00  5:00  6:00  None │
              │ ────  ────  ─────  ─────  ─────  ──── │       │ ────  ────  ────  ────  ────  ──── │
Lab Hours     │   8:00 AM–9:40 AM  │  9:51 AM–11:30 AM  │  11:40 AM–1:20 PM  │ LUNCH │  2:00 PM–3:40 PM  │  3:51 PM–5:30 PM  │  5:40 PM–7:20 PM  │
```

Theory slots run 50 minutes; lab slots run in 2-hour paired blocks. The "None" column at the end of each half carries lab slots only.
