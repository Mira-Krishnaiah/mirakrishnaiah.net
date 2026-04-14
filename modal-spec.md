# modal-spec.md — Project Detail Modal

Implementation spec for the character-reveal modal replacing the existing `.detail-panel` bottom drawer for Calliope and Dynamene. Read CLAUDE.md first.

---

## What this replaces

The current `.detail-panel` is a bottom drawer with one image and a short paragraph. For Calliope and Dynamene only, replace this with the modal described below. All other projects keep the existing drawer — don't touch them.

The static thumbnail images on the workbench desk cards remain unchanged — they always show the labeled diagram only (`calliope-diagram.png`, `dynamene-diagram.png`). The multi-image gallery only exists inside the modal.

---

## Behavior overview

**Trigger:** clicking `.desk-item[data-project="calliope"]` or `[data-project="dynamene"]` dims the page and opens the modal centered in the viewport. Intercept the existing drawer open logic for these two items only.

**Entry animation:** modal scales in from ~95% + slight translate-up, backdrop fades in simultaneously. Duration ~280ms, ease-out.

**Close:** X button (top-right), clicking the backdrop, or Escape key. Exit reverses — scale down + fade.

**Scroll:** right column scrolls independently. Left column stays fixed within the modal frame.

---

## Layout

Modal centered in viewport. Max width 900px, max height 88vh. Two columns:

```
┌─────────────────────────────────────────────┐
│  [X]                                        │
│  ┌──────────────────┬──────────────────────┐│
│  │                  │  Title               ││
│  │   MAIN IMAGE     │  Subtitle · Status   ││
│  │   (crossfades)   │  Tagline             ││
│  │                  │                      ││
│  │  [thumb][thumb]  │  ▼ Section 1 (open)  ││
│  │                  │    body text         ││
│  │  annotation text │                      ││
│  │                  │  ▶ Section 2         ││
│  │                  │  ▶ Section 3         ││
│  │                  │  ▶ Section 4         ││
│  │                  │                      ││
│  │                  │  Links →             ││
│  └──────────────────┴──────────────────────┘│
└─────────────────────────────────────────────┘
```

**Left column (~42% width):**
- Main image area: `object-fit: contain`, centered, crossfades between images (~200ms)
- Thumbnail strip: small thumbnails below the main image, only visible when current section has >1 image. Clicking a thumbnail swaps the main image. Active thumbnail has a 1px `--sapphire` border. Thumbnails are ~48px tall, `object-fit: cover`, slight gap between them.
- Annotation text: below thumbnail strip (or below main image if no thumbnails), `--font-mono`, italic, 11px, `--ink3`
- Background: `var(--bg2)`

**Right column (~58% width):**
- Scrollable
- Top: title, subtitle, status badge, tagline
- Accordion sections
- Bottom: external links

---

## Accordion behavior

- One section open at a time
- Default: first section open
- When a section opens:
  1. Section body expands (~200ms height transition)
  2. Main image crossfades to that section's **first** image
  3. Thumbnail strip updates to show that section's images (hidden if only 1 image)
  4. Active thumbnail resets to the first one
  5. Annotation updates to that section's annotation
- Section headers: `--font-mono`, caps, small chevron (`▶` / `▼`), `--ink2`
- Section body: `--font-body`, `--ink2`, 14px, line-height 1.65

---

## Image files

All images go in `images/`. The workbench card thumbnails are unchanged and always use the diagram files.

### Dynamene images

| File | What it is |
|---|---|
| `dynamene-diagram.png` | Labeled full-robot overview — **workbench card only, also hero section** |
| `dynamene-arm.png` | Full arm assembly CAD |
| `dynamene-arm-shoulder.png` | Co-axial shoulder close-up |
| `dynamene-arm-labeled.png` | Labeled diagram: hex shaft, 4-bar sprocket, arm pivot |
| `dynamene-climber.png` | Hook assembly, side view |
| `dynamene-climber-top.png` | Hook assembly, front view — shows dual-hook geometry |
| `dynamene-collar.png` | Collar/green-roller assembly |
| `dynamene-competition.jpeg` | Competition photo — **confirm this is 2025 REEFSCAPE, not 2024** |

### Calliope images (still needed — see checklist)

| File | What it is |
|---|---|
| `calliope-diagram.png` | Labeled full-robot overview — **workbench card only, also hero section** |
| `calliope-hero.png` | Full robot, alternate angle or competition |
| `calliope-indexer.png` | Indexer + shooter CAD |
| `calliope-hood.png` | Hood mechanism — final version or iteration sequence |
| `calliope-competition.png` | Competition photo from SFR |

---

## Section definitions

### Dynamene sections

**Project header:**
- Title: `Dynamene · FRC Team 6418`
- Subtitle: `FRC 2025 · REEFSCAPE Season`
- Status: `◉ completed · 2025` (emerald)
- Tagline: `105 lbs · virtual 4-bar arm · co-axial power transmission · 2nd NorCal Invitational`
- Links: Technical Binder →, CAD →

**Section 1 — THE ARM**
```
images: [
  { src: 'dynamene-arm.png',          label: 'arm assembly' },
  { src: 'dynamene-arm-shoulder.png', label: 'shoulder detail' },
  { src: 'dynamene-arm-labeled.png',  label: 'power transmission' }
]
annotation: "hex shaft inside a SplineXL, same axis"
```
Body:

We needed horizontal reach outside frame perimeter to score coral reliably. The end effector had to stay at the same angle throughout its motion — a traditional 4-bar linkage property. We went virtual: instead of four physical bars, chain and belt maintain the orientation, which allowed full 360° rotation and cleaner packaging.

The hard part was power transmission. Three things needed independent control — arm rotation, end-effector orientation, and roller power — all transmitted from motors at the robot's base through a single pivot point. Our solution: a hex shaft running inside a SplineXL shaft, both on the same axis. The arm sprocket floats on bearings around the SplineXL. The 4-bar pulley attaches directly to the SplineXL. The roller pulleys attach to the hex shaft inside.

Switching from chains to belts was the unlock — no tensioning, far more flexibility as we iterated. Five major collar redesigns. By the final version we'd cut weight, reduced cantilevering, and could score reliably across all four reef levels. It won us the Creativity Award.

**Section 2 — THE CLIMBER**
```
images: [
  { src: 'dynamene-climber.png',     label: 'hook assembly' },
  { src: 'dynamene-climber-top.png', label: 'hook geometry' }
]
annotation: "didn't work until iteration 7. then it was our best mechanism"
```
Body:

This was the hardest thing I worked on all season, and we almost cut it entirely.

We came in 20 lbs over weight. The center of gravity sat right at the edge of the ramp — if we pulled the cage too far back, we'd tip. The elevator was so close to where the climber needed to pivot that we couldn't swing out without hitting something critical. Three brutal constraints with no obvious solution.

**Iterations 1–3:** the arm tore at the motor mount, only pulled down 4 inches, and tilted on every climb because the cage wasn't flush against the hooks. We calculated we'd need 20 lbs of ballast to fix it. We didn't have 20 lbs to spare. We took iteration 3 to our first competition anyway.

**Iterations 4–6 (post-competition):** pushed the climber forward, made the arm skinnier and shorter, added a 2-stage gearbox. Pulled down 9 inches instead of 4. Two pounds lighter. New problems: the cage slipped, the chain hit the elevator, alignment was finicky.

**Iterations 7–8:** shifted the hooks back 3.5 inches total, added a vertical bolt to the back hook, embedded magnets and silicone grip tape, added a side funnel to help with alignment. By iteration 8 we could climb in 8 seconds — even during imperfect alignments. It added 10 points + 1 Ranking Point to every match and made us a highly sought alliance partner.

Three testing sessions. Thirty-minute drives to get to a field with a cage. Every iteration had to count.

**Section 3 — RAMP + COLLAR**
```
images: [
  { src: 'dynamene-collar.png', label: 'collar assembly' }
]
annotation: "the point was for this to be unremarkable"
```
Body:

The ramp was our coral intake pathway — a stationary funnel guiding coral from the loading station into the collar. The collar was the end effector: rollers that grabbed and released coral at the arm's tip.

Both went through real iteration. The ramp got a curved polycarb cover to stop coral from bouncing out, asymmetric funnel pieces to guide coral in straight, and a passively-deploying flap (hinges + magnets) that extended at match start to widen the intake window. The collar's final version had the tubestock cut at angles so coral could pivot cleanly when scoring at L4 without catching on the front roller.

Neither of these is the interesting mechanism. That was the point. The arm and climber needed to be the hard problems — everything else needed to just work.

**Section 4 — RESULTS**
```
images: [
  { src: 'dynamene-competition.jpeg', label: 'NorCal Invitational' },
  { src: 'dynamene-diagram.png',      label: 'full robot' }
]
annotation: "2nd NorCal Invitational · Creativity Award · 48 avg pts/match"
```
Body:

2nd place at the Northern California Regional Invitational. Creativity Award for the virtual 4-bar arm. 12-second cycle times. 48-point average per match. The climber — which almost didn't exist — added a Ranking Point to nearly every match.

Fifteen people, two-car garage, four practice fields across the Bay Area, a robot that extended to nearly 7 feet. Building DYNAMENE taught me what managing real constraints actually looks like: not trying to do everything, making hard calls about what to cut, and pushing hard on the few things that matter.

---

### Calliope sections

**Project header:**
- Title: `Calliope · FRC Team 6418`
- Subtitle: `FRC 2024 · CRESCENDO Season`
- Status: `◉ completed · 2024` (emerald)
- Tagline: `122 lbs · under-bumper intake · dual-flywheel shooter · Engineering Excellence`
- Links: Technical Binder →, CAD →

**Section 1 — THE PIVOT**
```
images: [
  { src: 'calliope-diagram.png', label: 'full robot' }, 
  { src: 'calliope-pivot-1.png', label: 'initial design #1' },
  { src: 'calliope-pivot-2.png', label: 'initial design #2 -- fixed indexer' },
  { src: 'calliope-pivot-3.png', label: 'final design' }
]
annotation: "fit the whole robot in a '22 outback"
```
Body:

Coming out of kickoff we had arm concepts — 4-bar linkages, single-pivot arms, a fixed shooter with a complex intake. None of them fit. Everything was too tall, too complex, or too far beyond what a team that just learned Onshape could build reliably.

The one idea that kept surviving was an under-the-bumper intake. Pull notes in from below instead of reaching out. Keep everything inside frame perimeter. It was compact, it was simple, and it meant we could design a robot that fit in a Subaru for transport to practice fields — because we didn't have a field of our own.

We were a week into build season when we committed to the pivot. It was the right call.

**Section 2 — INDEXER + SHOOTER**
```
images: [
  { src: 'calliope-indexer.png', label: 'indexer + shooter' }
]
annotation: "first mechanisms I designed start to finish"
```
Body:

I took complete ownership of these two — the first mechanisms I'd ever designed entirely on my own. The indexer's job was simple: take a note from the intake, hold it at exactly the right position for the shooter. A beam-break sensor handled the stopping automatically. Drivers got haptic feedback the moment a note was detected. No guessing, no fumbling.

Designing both taught me that simplicity isn't about fewer parts — it's about making sure you can diagnose and fix things in two minutes between matches. Every plate, standoff, and roller was accessible. We never had a catastrophic failure because of it.

**Section 3 — THE HOOD**
```
images: [
  { src: 'calliope-hood.png', label: 'hood mechanism' }
]
annotation: "iteration 1 genuinely looked like a crustacean"
```
Body:

The hood redirected notes from the horizontal shooter downward into the amp. Six major iterations before it worked reliably.

**Iterations 1–3** established the concept but the plates bent, the angle was wrong, and notes kept stalling. **Iteration 4** fixed the flexing with polycarb and tubestock. **Iteration 5** added polycord across all four top rollers — no more stalling, no more notes stopping halfway through.

At our first competition (SFR) the hood worked — we never missed an amp shot — but alignment took several seconds each time because the hood width almost exactly matched the amp opening. Zero margin. **Iteration 6:** split the hood plates and connected them with tubestock, reducing the part that entered the amp by 4 inches. Alignment became fast enough to matter.

**Section 4 — RESULTS**
```
images: [
  { src: 'calliope-diagram.png',     label: 'full robot' }
  { src: 'calliope-competition.png', label: 'SFR competition' },
]
annotation: "first engineering award in team history"
```
Body:

Engineering Excellence award — first in team history. Playoffs for the first time in years. Never missed an amp shot throughout competition.

The less visible result: by the end of the season, I wasn't asking mentors what to do. I was driving the design process myself. CALLIOPE was built around doing a few things very well. It taught me that constraint is a design tool, not just a limitation — and that foundation is why DYNAMENE was possible.

---

## Implementation notes

### CSS

Add to main stylesheet. Prefix all new classes with `reveal-` to avoid collision with existing `.detail-panel` styles.

```css
.reveal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(26, 24, 20, 0.6);
  backdrop-filter: blur(3px);
  z-index: 100;
  opacity: 0;
  transition: opacity 280ms ease-out;
  pointer-events: none;
}
.reveal-backdrop.open { opacity: 1; pointer-events: all; }

.reveal-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -48%) scale(0.96);
  width: min(900px, 92vw);
  max-height: 88vh;
  background: var(--bg);
  border: 1px solid var(--rule);
  border-radius: 4px;
  z-index: 101;
  opacity: 0;
  pointer-events: none;
  transition: opacity 280ms ease-out, transform 280ms ease-out;
}
.reveal-modal.open {
  opacity: 1;
  pointer-events: all;
  transform: translate(-50%, -50%) scale(1);
}

.reveal-inner {
  display: grid;
  grid-template-columns: 42% 58%;
  max-height: calc(88vh - 44px);
  overflow: hidden;
}

/* Left: image panel */
.reveal-image-panel {
  background: var(--bg2);
  border-right: 1px solid var(--rule);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 20px 14px;
  gap: 10px;
  position: relative;
}

.reveal-image-wrap {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
}
.reveal-image-wrap img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  transition: opacity 200ms ease-out;
}
.reveal-image-wrap img.active { opacity: 1; }

/* Thumbnail strip */
.reveal-thumbs {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-shrink: 0;
}
.reveal-thumbs.hidden { display: none; }
.reveal-thumb {
  width: 44px;
  height: 36px;
  object-fit: cover;
  border-radius: 2px;
  border: 1px solid var(--rule);
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 150ms, border-color 150ms;
}
.reveal-thumb:hover { opacity: 0.9; }
.reveal-thumb.active {
  opacity: 1;
  border-color: var(--sapphire);
}

.reveal-annotation {
  font-family: var(--font-mono);
  font-style: italic;
  font-size: 11px;
  color: var(--ink3);
  text-align: center;
  flex-shrink: 0;
  transition: opacity 150ms;
}

/* Right: content panel */
.reveal-content-panel {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 24px 24px 20px;
  max-height: calc(88vh - 44px);
}

.reveal-title {
  font-family: var(--font-display);
  font-size: 22px;
  color: var(--ink);
  margin: 0 0 4px;
}
.reveal-subtitle {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink3);
  letter-spacing: 0.04em;
  margin: 0 0 8px;
}
.reveal-tagline {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--ink3);
  margin: 0 0 18px;
  line-height: 1.6;
}

.reveal-section { border-top: 1px solid var(--rule); }
.reveal-section:last-of-type { border-bottom: 1px solid var(--rule); }

.reveal-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 0;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--ink2);
  user-select: none;
}
.reveal-section-header:hover { color: var(--ink); }
.reveal-chevron { transition: transform 200ms ease-out; font-style: normal; }
.reveal-section.open .reveal-chevron { transform: rotate(90deg); }

.reveal-section-body {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--ink2);
  line-height: 1.65;
  max-height: 0;
  overflow: hidden;
  transition: max-height 220ms ease-out, padding-bottom 220ms ease-out;
}
.reveal-section.open .reveal-section-body {
  max-height: 800px;
  padding-bottom: 14px;
}
.reveal-section-body p { margin: 0 0 10px; }
.reveal-section-body p:last-child { margin-bottom: 0; }
.reveal-section-body strong { color: var(--ink); font-weight: 600; }

.reveal-links {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--rule);
  display: flex;
  gap: 20px;
  flex-shrink: 0;
}
.reveal-link {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--active);
  text-decoration: none;
  letter-spacing: 0.04em;
}
.reveal-link:hover { text-decoration: underline; }

/* Close button — sits above the two columns */
.reveal-close-row {
  display: flex;
  justify-content: flex-end;
  padding: 10px 12px 0;
  flex-shrink: 0;
}
.reveal-close {
  background: none;
  border: none;
  font-size: 15px;
  color: var(--ink3);
  cursor: pointer;
  padding: 2px 6px;
  line-height: 1;
}
.reveal-close:hover { color: var(--ink); }
```

### JS architecture

Add to the inline `<script>` at the bottom of `workbench.html`. Do not modify existing drawer logic — intercept only calliope and dynamene click events.

**Data structure:** `revealProjects` object keyed by `data-project` value. Each project:
```js
{
  title, subtitle, status, statusClass, tagline,
  links: [{ label, href }],
  sections: [
    {
      label,        // accordion header text, uppercase
      images: [
        { src, label }  // src relative to images/, label for thumbnail title attr
      ],
      annotation,   // text below image
      body          // HTML string — use <p> and <strong> only
    }
  ]
}
```

**On page load:** create `.reveal-backdrop` and `.reveal-modal` elements once, append to `body`. Do not recreate them on each open — populate them.

**Open flow:**
1. Detect click on `.desk-item[data-project]` where value exists in `revealProjects`
2. Call `openReveal(projectId)`:
   - Populate modal from project data
   - Preload all images for this project
   - Open section 0 by default (add `.open`, set first image `.active`, set first thumb `.active`)
   - Show/hide thumbnail strip based on image count
   - Add `.open` to backdrop and modal
   - `document.body.style.overflow = 'hidden'`

**Section open flow:**
1. Remove `.open` from all `.reveal-section` elements
2. Add `.open` to clicked section
3. Get that section's images array
4. Crossfade main image to `images[0]`
5. Rebuild thumbnail strip for this section (hide if `images.length <= 1`)
6. Set first thumb `.active`
7. Update annotation text

**Thumbnail click flow:**
1. Set clicked thumb `.active`, remove from others
2. Crossfade main image to corresponding image

**Close flow:**
1. Remove `.open` from modal and backdrop
2. `document.body.style.overflow = ''`
3. After 280ms transition: reset section state so next open starts at section 0

**Event listeners:**
- `.desk-item` clicks: check `data-project` in `revealProjects`, intercept if match
- `#reveal-close`: close
- `.reveal-backdrop`: close on click
- `document`: close on `Escape` keydown if modal is open

### HTML (rendered by JS, not hardcoded)

```html
<div class="reveal-backdrop" id="reveal-backdrop"></div>
<div class="reveal-modal" id="reveal-modal">
  <div class="reveal-close-row">
    <button class="reveal-close" id="reveal-close">✕</button>
  </div>
  <div class="reveal-inner">
    <div class="reveal-image-panel" id="reveal-image-panel">
      <div class="reveal-image-wrap" id="reveal-image-wrap">
        <!-- img tags injected per section, stacked, crossfade via .active -->
      </div>
      <div class="reveal-thumbs hidden" id="reveal-thumbs">
        <!-- thumb imgs injected when section has >1 image -->
      </div>
      <p class="reveal-annotation" id="reveal-annotation"></p>
    </div>
    <div class="reveal-content-panel" id="reveal-content-panel">
      <h2 class="reveal-title" id="reveal-title"></h2>
      <p class="reveal-subtitle" id="reveal-subtitle"></p>
      <!-- status badge injected here -->
      <p class="reveal-tagline" id="reveal-tagline"></p>
      <div id="reveal-sections">
        <!-- accordion sections injected here -->
      </div>
      <div class="reveal-links" id="reveal-links"></div>
    </div>
  </div>
</div>
```

---

## Checklist for Claude Code

**Before writing any code:**
- [ ] Confirm all Dynamene images exist in `images/`: `dynamene-diagram.png`, `dynamene-arm.png`, `dynamene-arm-shoulder.png`, `dynamene-arm-labeled.png`, `dynamene-climber.png`, `dynamene-climber-top.png`, `dynamene-collar.png`, `dynamene-competition.jpeg`
- [ ] Confirm Calliope images exist: `calliope-diagram.png`, `calliope-indexer.png`, `calliope-hood.png`, `calliope-competition.png`, `calliope-pivot-1.png`, `calliope-pivot-2.png`, `calliope-pivot-3.png`
- [ ] Confirm `dynamene-competition.jpeg` is from 2025 REEFSCAPE season, not 2024

**Implementation:**
- [ ] Add `.reveal-*` CSS to main stylesheet
- [ ] Build `revealProjects` data object with all section content and image arrays from this spec
- [ ] Create backdrop and modal elements on page load (once, reused)
- [ ] Intercept click events for `calliope` and `dynamene` desk items only
- [ ] Implement accordion: one section open at a time, image + thumbnails + annotation update on open
- [ ] Implement thumbnail strip: hidden when section has 1 image, visible when >1; clicking thumb crossfades main image
- [ ] Implement entry/exit animation (scale + opacity, 280ms)
- [ ] Implement close: X button, backdrop click, Escape key
- [ ] Reset to section 0 on close so next open is clean
- [ ] Test dark mode — all colors via CSS vars, nothing hardcoded
- [ ] Test existing drawer still works for all other projects
- [ ] Test that body scroll locks while modal is open
