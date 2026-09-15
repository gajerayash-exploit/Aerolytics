# Aerolytics — Stitch prompt for `/dashboard` (Mission Overview)

Screen 03 in the flow: **Landing (01) → Command Center access /login (02) → Dashboard /dashboard (03)** → Mission Digital Twin (04).

---

## How to use this with Stitch

1. **Attach reference images before pasting the prompt:**
   - `frontend/public/brand/Aerolytics.png`, the logo.
   - A screenshot of the landing page hero (the 3D terrain with the telemetry panel).
   - A screenshot of the login page (the glass access panel).

   These images carry the style better than words. Use a Stitch mode that accepts image input.
2. **Paste PART A (master prompt)** and generate a single desktop screen.
3. **If Stitch ignored or simplified something,** paste the matching prompt from PART B to fix one region at a time. Don't regenerate the whole screen.
4. **Generate the Agri and Rescue variants** with PART C after the Energy version looks right.
5. **Check the result against PART D** before exporting.
6. **Export HTML/Tailwind (or Figma)** and put it in `frontend/design/stitch-exports/03-dashboard/`. It will be converted into Next.js components, and the 3D viewport placeholder will be replaced with a real React Three Fiber scene.

---

## PART A: Master prompt (paste this whole block)

```
Design a single desktop web app screen (1440 × 900 px, dark theme only) called "Mission Overview" — the main dashboard of AEROLYTICS, an enterprise Drone-as-a-Service platform ("Drone Intelligence Engine"). Drones capture imagery, AI (YOLO models) detects problems, detections are placed on a geospatial 3D digital twin, and operators act on them. Three mission pillars: ENERGY (solar panel inspection), AGRI (crop disease), RESCUE (thermal search & rescue). This screen shows the ENERGY pillar. It must look like a military / aerospace drone operations command center — precise, dense, tactical, trustworthy — NOT a generic SaaS admin template. Match the attached reference screenshots (landing page and login page) exactly in colors, fonts, panel shapes and HUD style. Use the attached logo.

=== VISUAL SYSTEM (follow exactly) ===
Theme name: "Night Ops".
Colors:
- Page background #030814. Deeper viewport background #040B1C. Raised panel fill #06102A to #050D20 (subtle top-to-bottom), glass panels rgba(5,14,34,0.62) with 14px backdrop blur.
- Hairline borders: 1px rgba(120,170,255,0.16) (drawn as inset outlines). Dividers rgba(120,170,255,0.10).
- Primary / brand blue (from logo): #2F6FE0, hover #4C88F5. Used for primary buttons only.
- Tactical cyan accent: #5CE1FF — active states, scan lines, focus rings, selected nav, key numbers' underline glows.
- Amber #FFB547 — warnings AND anything simulated/estimated.
- Thermal red-orange #FF6A3D — critical alerts.
- Success green #7BE3A0. Agri green #9BE15D. Rescue orange #FF7A4D.
- Text: primary #FFFFFF / #E6ECF5, secondary #A9B8D0, muted #7F90AD, faint labels #62738F, disabled #53637D.
Typography (Google Fonts):
- Display / headings: "Saira", width 118–120% (semi-expanded), weight 700, ITALIC, UPPERCASE, tight line-height 0.95–1.0. Matches the italic techno wordmark in the logo.
- Body: "IBM Plex Sans" 400/500, 14–15px, line-height 1.55.
- All data, labels, coordinates, IDs, timestamps, badges, buttons: "IBM Plex Mono" 400/500; labels 10–11px UPPERCASE with letter-spacing 0.14–0.22em; numbers use tabular figures.
- Big KPI numbers: Saira, width 110%, weight 600, 40–44px, not italic.
Shapes:
- NO rounded corners anywhere (radius 0). Panels, buttons and cards use CHAMFERED corners: top-right and bottom-left corners cut at 45° (14–20px on panels, 12px on buttons), like clip-path polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px)).
- Small diamond markers (8px squares rotated 45°) as bullets and status dots, never circles.
- Very subtle horizontal scanline texture over the background (1px lines every 3px at 2% white).
- Icons: Lucide, stroke 1.5px, 16–20px, color #7F90AD, active #5CE1FF. No filled icons, no emoji, no illustrations of people.
Badges (mono, 10px, uppercase, letter-spacing 0.14em, height 22px, 8px side padding, 1px border, square):
- "SIMULATED" amber text on amber diagonal-stripe background (stripes rgba(255,181,71,0.18)/0.04, 135°).
- "MANIFEST" blue #7FB2FF on 8% blue fill.
- "EXIF" cyan #5CE1FF on 8% cyan fill.
- "LIVE GPS" green #7BE3A0 on 8% green fill.
Buttons: height 40px (48px for hero CTA), mono 12–13px uppercase letter-spacing 0.08em, chamfered. Primary = solid #2F6FE0 white text. Ghost = 8% blue fill + 1px rgba(120,170,255,0.28) outline, text #CFE0FF.

=== LAYOUT (1440 × 900, no page scroll; panels scroll internally) ===
1) LEFT RAIL — fixed, 76px wide, full height, background #030814, right hairline border.
   - Top: the Aerolytics quadcopter logo mark (blue gradient crosshair X), 36px, centered, 20px from top.
   - Vertical icon nav, 48×48 hit areas, 8px gap: Dashboard (layout-grid) ACTIVE, Missions (map), Live ops (radio-tower), Analytics (chart-line), Reports (file-text), Sites (map-pin), Fleet (a thin quadcopter outline icon; fallback lucide "fan"). Active item: cyan icon, 2px cyan bar on the left edge, 8% cyan background. Tooltip style: mono uppercase label in a chamfered dark chip.
   - Bottom: Settings (settings) and a square user avatar with initials "RK" in mono on #0A1B3D with a cyan hairline.

2) TOP BAR — height 64px, spans from rail to right edge, glass background, bottom hairline. Left→right:
   - Breadcrumb in mono 11px uppercase: "COMMAND CENTER / DASHBOARD" (last item white, others #62738F).
   - Center: PILLAR SWITCHER segmented control (3 segments, 132px each, height 40px, chamfered outer shape): "01 ENERGY" (active: white Saira italic uppercase text, 2px cyan top border, 10% cyan fill), "02 AGRI", "03 RESCUE" (inactive: #7F90AD). Each segment has a small diamond dot in its pillar color (cyan / #9BE15D / #FF7A4D).
   - Right cluster, 16px gaps: search field 220px ("Search missions, detections…" with a "⌘K" mono key hint); badge "SIMULATED · GOLDEN DEMO"; UTC clock mono "14:32:07 UTC"; bell icon with a small #FF6A3D count chip "6"; primary button "+ NEW INSPECTION".

3) CONTENT — padding 24px, 12-column grid, 16px gutters, three rows.

ROW 1 — PAGE HEADER + KPI TILES (height ≈ 190px)
   - Header line above tiles: kicker mono cyan "ENERGY · SOLAR INTELLIGENCE" with a blinking cyan diamond; H1 Saira italic uppercase 34px white "MISSION OVERVIEW"; right-aligned mono muted meta "SITE: RAJKOT SOLAR PARK · AO 22.3000° N 70.8000° E · LAST SYNC 14:31 UTC".
   - Four KPI tiles (3 columns each), chamfered panels, 20px padding. Each tile: mono uppercase label top-left, small provenance badge top-right, big number, a secondary line, and a tiny visualization at the bottom:
     a) "PANELS INSPECTED" — "2,184" + muted "/ 2,400" ; thin 3px progress bar 91% cyan with glow; secondary "+312 since last mission".
     b) "TOTAL DETECTIONS" — "37" ; 12-bar mini histogram (cyan bars, last bar brighter); secondary "Across 4 classes".
     c) "CRITICAL ALERTS" — "6" in #FF6A3D ; a row of 6 small red-orange diamonds; secondary "3 unassigned" in amber.
     d) "INSPECTION COVERAGE" — "91%" ; a thin circular gauge (2px ring, cyan arc 91%, tick marks every 10%); secondary "Lane 7 / 7 complete".
   - Tile badges: a) MANIFEST, b) SIMULATED, c) SIMULATED, d) MANIFEST.

ROW 2 — DIGITAL TWIN + PRIORITY ALERTS (height ≈ 390px)
   - LEFT (8 columns): panel "SITE DIGITAL TWIN".
     • Header row (44px): mono label "SITE DIGITAL TWIN" + badge "SIMULATED TELEMETRY"; right side: view toggle (3 chamfered ghost segments "3D" active, "TOP", "FOLLOW DRONE") and ghost button "OPEN MISSION TWIN →".
     • Viewport (fills the rest): a dark #040B1C scene that LOOKS LIKE the landing-page hero: a perspective wireframe terrain grid in dim blue (#2150B8 at 30–50% opacity) receding into fog, a rectangular survey area with cyan corner brackets, rows of small tilted solar panels (dark blue fills, cyan outlines), a dashed AMBER lawnmower flight path (7 parallel lanes joined by U-turns) floating above the ground, a small white wireframe quadcopter on the path with a cyan translucent scan cone projecting a rectangular footprint on the ground, and 6 detection markers: vertical glowing beams with a diamond at the top and concentric ground rings — 4 thermal red-orange (critical), 2 amber (warning). Each marker has a floating mono label chip like "CRACK 0.91", "HOTSPOT 0.87", "DUST 0.78", "COVER 0.72". Make this an image/illustration placeholder element with class "twin-viewport" (it will be replaced by a live 3D canvas).
     • Overlays inside the viewport: top-left glass layer panel with 4 checkbox rows (square checkboxes, cyan when on): "Terrain", "Flight path", "Detections", "Thermal overlay" (off). Bottom-left mono readout "CURSOR 22.30012° N 70.79945° E · ±APPROX." with amber "±APPROX." Bottom-right legend: red diamond "Critical", amber diamond "Warning", solid cyan line "Recorded path", dashed amber line "Simulated path". Right edge: vertical zoom control (+ / − / reset) chamfered.
   - RIGHT (4 columns): panel "PRIORITY ALERTS".
     • Header: mono label + count chip "6 CRITICAL"; tabs underneath (mono uppercase 11px): "ALL 37" active with cyan underline, "CRITICAL 6", "UNASSIGNED 3".
     • Scrollable list of 5 alert rows (72px each, 1px dividers). Each row: 3px left severity bar (red-orange or amber); 52×52 square thumbnail showing a cropped thermal-style image placeholder (dark purple→orange heat gradient with a thin cyan bounding box); middle column: Saira 15px uppercase class name + mono confidence ("CRACK · 0.91"), mono muted location "ROW 04 · PANEL 13 · 22.30010° N 70.80010° E"; right column: status chip ("NEW" cyan outline / "ASSIGNED" blue / "RESOLVED" green) and relative time mono "2 MIN AGO".
     • Rows: 1) CRACK 0.91 critical NEW; 2) HOTSPOT 0.87 critical NEW; 3) CRACK 0.83 critical ASSIGNED; 4) DUST 0.78 warning NEW; 5) COVER 0.72 warning RESOLVED.
     • Hover state on row 1: 6% cyan fill + cyan hairline; show a small "INSPECT →" mono link.
     • Footer link: "VIEW ALL DETECTIONS →".

ROW 3 — RECENT MISSIONS + CLASS BREAKDOWN + PIPELINE (height ≈ 220px)
   - LEFT (7 columns): panel "RECENT MISSIONS" with table (mono 12px, 40px rows, header row mono 10px uppercase #62738F, hairline row dividers, zebra NOT allowed):
     Columns: MISSION ID | SITE | PILLAR | DATE (UTC) | FRAMES | DETECTIONS | TELEMETRY | STATUS
     Rows:
     1) AER-EN-0142 | Rajkot Solar Park | ENERGY chip | 14 Sep 2026 14:05 | 486 | 6 / 37 | SIMULATED badge | "PROCESSING" with a thin 64% cyan progress bar
     2) AER-EN-0141 | Rajkot Solar Park | ENERGY | 12 Sep 2026 09:40 | 512 | 4 / 29 | MANIFEST badge | "COMPLETE" green diamond
     3) AER-AG-0057 | Kalawad Rd Farm Block B | AGRI chip (green) | 11 Sep 2026 07:15 | 340 | 2 / 18 | EXIF badge | COMPLETE
     4) AER-RS-0019 | Aji Dam Sector 3 | RESCUE chip (orange) | 09 Sep 2026 22:48 | 208 | 3 / 5 | MANIFEST | COMPLETE
     5) AER-EN-0139 | Rajkot Solar Park | ENERGY | 07 Sep 2026 10:02 | 498 | — | EXIF | "FAILED" red-orange diamond + "RETRY" link
     Selected row style: 8% cyan fill + 2px cyan left bar. Panel header right: ghost button "ALL MISSIONS →".
     Pillar chips: square, mono 10px uppercase, text in pillar color, 1px border in pillar color at 45%.
   - MIDDLE (2 columns): panel "DETECTIONS BY CLASS" — horizontal bars (8px tall, square ends), label left mono uppercase, value right: CRACK 12 (red-orange), DUST 14 (amber), HOTSPOT 6 (red-orange), COVER 5 (amber). Tiny footnote mono 10px: "MODEL: SOLAR_BEST.PT · DEMO".
   - RIGHT (3 columns): panel "PROCESSING PIPELINE" — a vertical 5-step stepper with diamond nodes connected by a 1px line: UPLOAD ✓ (cyan), TELEMETRY (label "MANIFEST FALLBACK" amber), INFERENCE (active, pulsing cyan diamond, "38 MS / FRAME"), NORMALIZE (pending, faint), GEO-MAP (pending, faint). Bottom mono line: "API · DEMO MODE" with amber diamond.

=== COPY & DATA RULES ===
- All numbers are SAMPLE DATA for a demo. Every panel that shows telemetry, positions, or detections carries a provenance badge (SIMULATED / MANIFEST / EXIF). Never show coordinates without "±APPROX." or a badge.
- Use "detections", "mission", "site", "AO" (area of operation), "lane", "frame" — operational vocabulary.
- Dates in "14 Sep 2026 14:05" UTC format. Coordinates to 5 decimals with ° N / ° E.

=== DO NOT ===
- No rounded corners, no pill shapes, no circular avatars, no soft drop shadows, no neumorphism.
- No light mode, no white cards, no purple/pink gradients, no rainbow charts, no gradient text.
- No Inter, Roboto, Poppins, Montserrat or Arial.
- No emoji, no 3D cartoon illustrations, no stock photos, no people photos, no generic "AI sparkle" icons.
- No lorem ipsum. No marketing hero on this screen. No fake company logos.
- Don't make it airy: this is a dense operator console with 16px gutters and compact rows.

=== OUTPUT ===
One high-fidelity desktop screen. Semantic HTML with Tailwind classes. Group regions with clear section names: LeftRail, TopBar, PillarSwitcher, KpiTile (x4), TwinPanel (twin-viewport), AlertsPanel, MissionsTable, ClassBreakdown, PipelinePanel. Put colors in a Tailwind theme: night-950 #030814, night-900 #040B1C, night-800 #06102A, brand #2F6FE0, cyan #5CE1FF, amber #FFB547, thermal #FF6A3D, ok #7BE3A0, agri #9BE15D, rescue #FF7A4D.
```

---

## PART B: Fix-up prompts (use only the one you need)

**B1. Colors or fonts drifted**
```
Fix the visual system only, keep the layout: background #030814, panels #06102A with 1px rgba(120,170,255,0.16) inset outlines, cyan accent #5CE1FF, amber #FFB547 for warnings and simulated data, thermal #FF6A3D for critical, primary buttons #2F6FE0. Headings must be Saira semi-expanded (width 120%) bold ITALIC UPPERCASE; all labels, numbers, IDs and badges IBM Plex Mono uppercase with 0.14–0.22em letter-spacing; body IBM Plex Sans. Remove every rounded corner — use 45° chamfered top-right and bottom-left corners instead.
```

**B2. Digital twin looks like a flat map or stock image**
```
Redraw only the SITE DIGITAL TWIN viewport as a dark 3D wireframe scene seen at a 35° perspective from above: dim blue grid terrain fading into fog at the horizon, cyan corner brackets marking a rectangular survey area, rows of small tilted solar panels with cyan outlines, a DASHED AMBER lawnmower flight path of 7 parallel lanes hovering above the ground, a small white wireframe quadcopter with a translucent cyan scan cone projecting a rectangle on the ground, and six detection markers made of vertical glowing beams topped with diamonds and concentric rings on the ground (4 red-orange, 2 amber) with mono label chips like "CRACK 0.91". Keep the layer panel, legend, zoom control and cursor readout overlays.
```

**B3. KPI tiles look like generic SaaS cards**
```
Restyle only the 4 KPI tiles: chamfered corners, no shadows, mono uppercase 10.5px labels in #62738F, provenance badge top-right, big numbers in Saira semi-expanded weight 600 at 42px with tabular figures, and a precise micro-visual at the bottom of each (3px glowing cyan progress bar / 12 thin cyan histogram bars / a row of red-orange diamonds / a 2px ring gauge with 10% tick marks). Critical count in #FF6A3D.
```

**B4. Alerts list is too sparse or missing thumbnails**
```
Make the PRIORITY ALERTS rows dense (72px): 3px severity bar at left, 52px square thermal-style thumbnail with a cyan bounding box, class name in Saira uppercase + mono confidence, mono location "ROW 04 · PANEL 13 · 22.30010° N 70.80010° E", and on the right a square status chip (NEW / ASSIGNED / RESOLVED) with mono relative time. Add tabs ALL 37 / CRITICAL 6 / UNASSIGNED 3 with a cyan underline on the active tab.
```

**B5. Pillar switcher or top bar is wrong**
```
Rebuild only the top bar (64px, glass background, bottom hairline): breadcrumb "COMMAND CENTER / DASHBOARD" in mono; centered 3-segment chamfered pillar switcher "01 ENERGY" (active, 2px cyan top border, 10% cyan fill, white Saira italic uppercase) / "02 AGRI" / "03 RESCUE" each with a small diamond in its pillar color; right side: search with ⌘K hint, amber striped badge "SIMULATED · GOLDEN DEMO", mono UTC clock, bell with red-orange count 6, primary chamfered button "+ NEW INSPECTION".
```

**B6. Loading and empty states (a second screen)**
```
Duplicate the dashboard and show its LOADING state: KPI numbers replaced by skeleton bars with a slow horizontal cyan scanline shimmer, twin viewport showing only the fogged wireframe grid with a centered mono label "SYNCING MISSION · 64%" and a thin cyan progress bar, alerts list with 5 skeleton rows, missions table with 5 skeleton rows. Keep every panel frame, header and badge.
```
```
Duplicate the dashboard and show the EMPTY state for a new organization: KPI tiles show "—", twin viewport shows the empty wireframe terrain with a centered chamfered panel "NO MISSIONS YET" + body "Upload drone imagery or run the Rajkot demo mission to see detections here." + primary button "+ NEW INSPECTION" + ghost button "RUN DEMO MISSION"; alerts panel shows "No alerts" with a faint diamond icon; missions table shows one muted row "No missions".
```

---

## PART C: Pillar variants (after Energy is approved)

**C1. Agri**
```
Create the AGRI version of this exact dashboard. Same layout and styling. Changes: pillar switcher "02 AGRI" active with #9BE15D accents replacing cyan where it marks the active pillar (keep cyan for focus/scan UI). Kicker "AGRI · CROP HEALTH". Site "KALAWAD RD FARM BLOCK B". KPI tiles: "FIELD AREA SCANNED 42.6 ha / 48 ha" (progress bar), "AFFECTED AREA 3.8 ha" in amber with small NDVI color strip (red→yellow→green), "DISEASE ZONES 5" in #FF6A3D, "MEAN NDVI-STYLE INDEX 0.62" with a thin gauge. Badges: EXIF, SIMULATED, SIMULATED, SIMULATED. Twin viewport: the same wireframe terrain but the survey area is a grid of square crop cells in NDVI-style false color (green healthy, yellow stressed, red diseased patches), dashed amber lawnmower path, wireframe quadcopter with scan cone, markers labeled "LEAF RUST 0.88", "LEAF BLIGHT 0.81", "BLAST 0.79", "BROWN SPOTS 0.74". Alerts: LEAF RUST 0.88, LEAF BLIGHT 0.81, BLAST 0.79, BROWN SPOTS 0.74, LEAF RUST 0.69 with locations "CELL C-14 · 0.42 ha". Class bars: LEAF RUST, LEAF BLIGHT, BLAST, BROWN SPOTS. Footnote "MODEL: AGRI_BEST.PT · DEMO". Layer panel: "Terrain", "Flight path", "Detections", "NDVI-style overlay" (on).
```

**C2. Rescue**
```
Create the RESCUE version of this exact dashboard. Same layout and styling, but the twin viewport uses a thermal night palette. Pillar switcher "03 RESCUE" active with #FF7A4D accents. Kicker "RESCUE · THERMAL SEARCH". Site "AJI DAM SECTOR 3". KPI tiles: "PERSONS DETECTED 6" in #FF6A3D, "PRIORITY TARGETS 4", "SEARCH AREA COVERED 1.9 km² / 2.4 km²" (progress bar), "TIME SINCE LAST SIGHTING 04:12" mono timer. Twin viewport: dark grey-violet wireframe terrain, outlined collapsed-structure boxes, dashed amber search path, wireframe quadcopter with scan cone, heat signatures drawn as bright white-orange glowing points with pulsing orange rings and labels "PERSON 0.93", "PERSON 0.88". Alerts rows use "PERSON · 0.93", "TARGET T-01 · 22.31004° N 70.81008° E", status chips "NEW / TEAM DISPATCHED / CONFIRMED". Class panel becomes "DETECTIONS BY TYPE": PERSON 6, VEHICLE (planned, disabled, faint). Footnote "MODEL: THERMAL_BEST.PT · DEMO". Layer panel: "Terrain", "Search path", "Heat signatures", "LWIR overlay" (on). Add a red-orange mono banner strip under the top bar: "ACTIVE RESPONSE · SIMULATED EXERCISE".
```

---

## PART D: Acceptance checklist (check before exporting)

- [ ] Background is near-black navy (#030814), not grey and not pure black.
- [ ] No rounded corners anywhere; panels and buttons are chamfered.
- [ ] Headings are italic, expanded and uppercase (Saira). Data text is monospace (IBM Plex Mono).
- [ ] The logo mark appears in the rail and matches the attached PNG.
- [ ] The pillar switcher is centered in the top bar and ENERGY is active.
- [ ] 4 KPI tiles, each with a provenance badge and a micro-visual.
- [ ] The twin viewport looks like the landing-page hero: wireframe terrain, dashed amber path, drone, beams with rings, label chips.
- [ ] 5 alert rows with thumbnails, severity bars and status chips.
- [ ] Missions table has the TELEMETRY column with SIMULATED / MANIFEST / EXIF badges.
- [ ] Every coordinate shows "±APPROX." or a badge; nothing claims to be real GPS.
- [ ] No emoji, no stock photos, no light surfaces, no purple gradients.
- [ ] Numbers use tabular figures and line up in the table.

---

## Reference notes

- **Brand logo:** `frontend/public/brand/Aerolytics.png` (transparent) and `.jpeg`.
- **Design canvas with screens 01 and 02:** https://claude.ai/code/artifact/75a4acc9-fa47-485e-a9c6-d773cbc3f172
- **Real model classes** (from `models/training/*/data.yaml`):
  - Solar: cover, crack, dust, normal
  - Agri: Blast, brownspots, leaf blight, leaf rust, others
  - Thermal: person
- **Golden Demo origin:** Rajkot, Gujarat, 22.3000° N 70.8000° E. The flight is a 7-lane lawnmower pattern (see `backend/telemetry.py`).
- **Sample data:** mission IDs, site names such as "Kalawad Rd Farm Block B" and "Aji Dam Sector 3", and every number above are demo values. Replace them with API data when the frontend is wired to the backend.
