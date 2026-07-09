# 🎓 Squad Timetable

A fully offline, single-file HTML timetable tracker built for VIT Vellore students following the **FFCS (Fully Flexible Credit System)** scheduling format.

---

## What It Does

Opens in any browser — no internet, no app, no login required. It reads your device's local clock and tells you, in real time, what is happening right now across the whole group.

### Live Clock
The current time is displayed at the top of the page, synced directly to your phone or PC clock and updated every second.

### Real-Time Status
Each person gets a status card showing whether they are currently **in room** or **in class**, along with a countdown — either how long until their next class starts, or when their current class ends and they are free.

### Timetable View
Below the status cards, each person's full **Monday to Friday** timetable is laid out in the standard FFCS grid format:

| | AM Block | | PM Block |
|---|---|---|---|
| Theory Hours | 8 AM → 12:50 PM | **LUNCH** | 2 PM → 6:50 PM |
| Lab Hours | 8 AM → 1:20 PM | **LUNCH** | 2 PM → 7:20 PM |

Each row is a day. Each column is a time slot. The cell shows the theory slot code, the lab slot code, or both if they overlap. Unregistered slots are shown dimmed.

### Current Slot Highlight
The column matching the **current time** is highlighted across all timetables simultaneously:
- 🔴 **Red** — a class is scheduled at this slot
- 🟢 **Green** — this slot is free

Today's row is also highlighted in blue so it stands out from the rest of the week at a glance.

---

## Format Reference

The timetable follows the official VIT FFCS slot structure:

```
Theory Hours  │ 8:00  9:00  10:00  11:00  12:00  None │ LUNCH │ 2:00  3:00  4:00  5:00  6:00  None │
              │ ────  ────  ─────  ─────  ─────  ──── │       │ ────  ────  ────  ────  ────  ──── │
Lab Hours     │   8:00 AM–9:40 AM  │  9:51 AM–11:30 AM  │  11:40 AM–1:20 PM  │ LUNCH │  2:00 PM–3:40 PM  │  3:51 PM–5:30 PM  │  5:40 PM–7:20 PM  │
```

Theory slots run for 50 minutes. Lab slots run in 2-hour paired blocks. The "None" column at the end of each half carries lab slots only (no theory).

---

## How to Use

1. Download `vit_timetable_final.html`
2. Open it in any browser on your phone or PC
3. No setup, no installation, no network needed

Works on Chrome, Firefox, Safari, and Edge. Works offline after the first open.

---

## Technical Notes

- Pure HTML + CSS + vanilla JavaScript — zero dependencies
- All logic runs client-side; nothing is ever sent anywhere
- Time is sourced from `new Date()` — your device's local clock
- Refreshes the entire UI every second via `setInterval`
- Single file, fully self-contained — safe to share as an attachment
