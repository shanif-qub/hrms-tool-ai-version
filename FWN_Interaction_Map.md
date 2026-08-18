# FWN — Interaction Map & Spec (v0.3)

One interaction grammar, applied to **every card on every screen** — person, leave, payslip, budget, the feed signals, the orbit spheres, KPI tiles, onboarding candidates, documents, charts, the clock, and the result cards that combinations produce. Learn it once; it works everywhere. The calendar is a *view surface*, not a token — but the leave requests it produces are tokens.

---

## 1. The three universal modes

| Mode | Gesture | Purpose | What happens |
|---|---|---|---|
| **1 · Long hover (or tap) → expand** | Rest the pointer ~450ms, or tap | *Understand — layer 1* | The card grows inline to reveal its key facts and primary action. (Replaces the old floating tooltip.) |
| **2 · Drag onto another token** | Pull the top-left handle, drop on any other card | *Relate* | Resolves to **Combine / Relate / Reject**. Hold over a target ~400ms for a live preview before committing. |
| **3 · Drag to Q (the Cue)** | Drop on the Cue bar | *Act / analyse* | A contextual report + suggested prompts. Drag a **stack** to ask about the whole set. |

Plus **peel → layer 2** via the top-right corner: the *deeper* raw-AI layer (sentiment, confidence, version history, anomaly reasoning) — distinct from the layer-1 expand.

A gesture (modes 2/3) always returns the source card to its origin. Only dropping on empty canvas **repositions** a free token (10px snap). In-flow cards (feed, KPI, lists) always snap back.

---

## 2. Corner geometry — projected tabs (reveal on hover)

**Left = handle the object · Right = handle its content.**

| Corner | Icon | Action |
|---|---|---|
| Top-left | grip | Move / start any drag gesture (only drag entry — body drag disabled) |
| Bottom-left | stack | Add/remove from a **stack**; shows the live count |
| Top-right | scan-eye | **Peel** to layer 2 (deeper raw AI metrics) |
| Bottom-right | × | Close = remove from view (re-add from the **+** menu) |

---

## 3. Feedback palette (unchanged from v0.2)

Animation: pickup-lift, merge (result scales from the drop point), ripple at the target, reject snap-back + shake. Sound (Web Audio, mute toggle in chrome): pickup, hover/preview, merge (resolves *up*), relate, confirm, reject (flat/down), close. Haptics encode AI confidence (firm / light / flutter). Combine/Relate spawn a **result card with a provenance seam** of its two parents' colours; the result is itself draggable to Q or onto more cards.

---

## 4. Stacking (mode-2's many-to-one)

- Add any cards to a stack via the **bottom-left tab** (or ⌘/Shift-click). A **Stack Tray** rises showing the stacked chips.
- **Combine into result** (2+): spawns a result card.
  - *All people* → an N-way **comparison matrix** (avg attendance/velocity, risk flag).
  - *Mixed types* → a **working-set** view across people, time and pay.
- **Ask Q about the stack** → set-level analysis with a workload chart for people-stacks.
- Stacking mirrors the FWN doc's Pinch-Cluster (form a tier/cohort) and Stacking (multi-perspective comparison).

---

## 5. Token × token matrix (Combine / Relate / Reject)

| A | B | Verdict | Outcome (dummy data) |
|---|---|---|---|
| Person | Person | Combine | Collaboration & comparison |
| Person | Leave | Combine | Leave detail / coverage check |
| Person | Payslip | Combine | Comp footprint vs band |
| Person | Document | Combine | Policy acknowledgment status |
| Person | Budget | Combine | Retention simulation (Friction Swipe) |
| Leave | Leave | Combine | Overlap & coverage gap |
| Leave | Payslip | Combine | Pay impact of leave |
| Leave | Document | Relate | Governing leave policy |
| Leave | Budget | Relate | Backfill cost estimate |
| Payslip | Payslip | Combine | Month-over-month delta |
| Payslip | Document | Relate | Applicable comp/tax policy |
| Payslip | Budget | Combine | Raise projection |
| Document | Document | Relate | Shared category & ack needs |
| Document | Budget / Budget | Budget | Reject (no shared op / one lever is enough) |
| Signal (cue) | Person/Leave/Payslip | Combine | The signal, in the record's context |
| KPI | Person | Combine | Who drives this metric |
| KPI | KPI | Relate | Metric correlation |
| Document | Onboarding | Combine | Assign policy to candidate |
| Onboarding | Person | Relate | Onboarding buddy match |
| anything | (unmapped) | Relate | Loose relation, or drag to Q |

Reject is first-class: elastic snap-back, damped flat sound, uncertain haptic, red ripple — never a silent dead-end.

---

## 6. Per-card layers (layer 1 expand · layer 2 peel)

| Card | Layer 1 (expand) | Layer 2 (peel) |
|---|---|---|
| Person | Dept, manager, attendance, velocity | Sentiment trend, emergency contact, flight-risk reasoning, ID export |
| Leave | Type, days, approve/decline | Coverage conflict, governing policy |
| Payslip | Comp breakdown bars | Anomaly reasoning / approve correction |
| Signal | Why Q surfaced it | Signal type, confidence, sources |
| KPI | One-line read | (drag-to-Q for breakdown) |
| Onboarding | Stage + assignable note | Device/policy status |
| Document | Summary | Version history, org ack %, retention |
| Sphere (orbit) | Domain summary + Open action | — |
| Clock | (the live widget) | This-week hours, avg in/out, regularizations |

---

## 7. Status

All cards follow the three modes + corner grammar; clipping fixed (result cards rebuilt on the universal frame). Calendar remains a view surface by design.

Deferred: direction-dependent combine meaning; touch long-press radial; real spatial pan/zoom; Q on a live model.

---

## 8. Layout & ambient system (v0.4)

- **Dynamic island (top):** the three old bars merge into one centered pill. Every nav item is an icon that expands to its label on hover; the active item stays labeled. Holds lens (My world / My team / The org), region nav, and utilities — all icon-first.
- **Q orb:** moved out of the wasted space above the Cue and docked at the **right of the Cue bar**. Moods with sound: idle (slow breath), listening (mic, fast bars), thinking (spin/shimmer), answering (pulse), alert (ember when anomalies exist).
- **Token shapes & colour by type:** person = soft card w/ circular avatar, leave = rect, payslip = rect + accent, KPI = pill, sphere = circle, signal = left-bar rect, document = soft, result = soft w/ seam, budget = capsule — each with a faint per-kind tint.
- **The Now feed:** live header with count + pulse, persona-aware filter chips, per-signal category dot and time.
- **Add menu:** nested — categories first, then searchable submenus for people and hidden tokens (no 100-item dumps).
- **Ambient & gestures:** drifting gradient mesh + pointer-reactive ripples in the background, subtle idle glow on canvas tokens, double-click to peel, consistent spring choreography.

---

## 9. My World redesign (v0.5)

Driven by employee/manager tester feedback on My World:
- **Balanced three-zone layout** — The Now feed (left), a properly **centered Life Sphere** hub, and a new **Today rail** (right). No more off-center orbit, far less emptiness.
- **Clearer sphere** — a central "You" hub with an animated gradient ring and a live work-progress arc, ringed by six evenly-spaced, high-contrast, distinctly-coloured domain nodes (Calendar, Leave, Pay, Documents, Growth, Requests) on flowing spokes; pending domains pulse. Tapping the centre asks Q to summarise your day.
- **Today rail features** — greeting, live clock with controls, a proactive **Q suggests** card, quick actions (apply leave, payslip, sign documents, ask Q), next-up from the calendar, and team presence.
- **Legibility** — glass made more opaque, stronger borders, white labels; result cards now spawn offset/staggered instead of overlapping the source.
- **Q orb** — restored glassy waveform with a visible spinning ring and stronger core, still docked right of the Cue bar.
- **Wow** — richer moving gradient mesh, vibrant auroras, hub ring, flowing spokes, hover lifts and press feedback.
- **Branding** — Qubryx logo and name replace Lumen Labs.

Other personas (manager, HR) inherit the global legibility/orb/brand/background changes but keep their existing canvases for now — to be redesigned in the same spirit next.

---

## 10. My World polish + Qubryx brand (v0.6)

- **Brand palette** woven through: Celtic Blue, Robin (primary accent), Majorelle, Russian Violet, Sea Salt, Night. New `brand-gradient` / `brand-text` utilities drive the hero accents.
- **Background** — slow flowing wavy gradient (mesh + sheen) with a real **water-ripple** (concentric rings) on clicking empty canvas only.
- **Side panels** — auto-height to the viewport (never into the island band), no horizontal scrollbar, vertical scrollbar only on hover; panel cards are now draggable tokens with the full corner grammar; overflow opens during a drag so cards can be pulled onto the canvas; cards snap back into their panel; free tokens snap back when dropped over a panel.
- **Hub** — one cohesive disc (gradient rim arc + integrated gradient initial), no longer "slapped on".
- **Q orb** — vivid brand-gradient body with a spinning ring and white animated waveform; clearly prominent, docked right of the Cue.
- **Legibility** — dragged / peeled / result cards become near-solid (Night) so overlaps stay readable; glass opacity raised.
- **Key info gradients** — gradient clock ring + prominent gradient time, gradient FAB, gradient greeting and badges.
- **Logo** — wrapped in a circular dark/brand-tinted card so it no longer feels clipped.
- **Rounding** — capsule buttons and consistent card radii throughout.
- **Accessibility** — lifted muted-text contrast for AA, bumped the smallest type, aria-labels on icon controls, visible focus rings, ≥24px hit targets.

Deferred: full cross-panel re-docking (cards currently snap back rather than re-home into the other panel); a formal end-to-end WCAG audit across all three personas.

---

## 11. My World refinements (v0.7)

1. **Panels** now span `top:76px → bottom:96px` (fixed top+bottom, inner `flex-1`), so they resize with the viewport and end level with the Q chatbar.
2. **Q orb** is a flowing wave (SVG sine) that undulates slowly at idle and speeds up while thinking/answering; alert tints the glow ember (no more dot).
3. **De-duplicated data** — the right-rail suggestion is now a distinct "leave will lapse" insight (not the Well-being signal), and the Handbook task was removed from Pending since the feed already surfaces it.
4. **Gradients** — buttons use a 2-colour brand gradient; text is solid (no gradient text).
5. **Clock** — cleaner 2-stop ring and a refined solid tabular timer.
6. **Contrast** — dark brand colours used as foreground were swapped for lighter variants (`--color-halo-text`, `--color-blue-text`).
7. **New ESS features + AI** — Pending/to-dos card, Recognition/Kudos card, a proactive Q insight; Q now answers reimbursement, leave-lapse, WFH draft, "summarise my actions", investment-declaration, learning, goals/1:1, and next-holiday intents, with matching prompt chips.
8. **My Team legend** (In / On leave / At risk) plus a detailed presence read when the card is dropped on Q.
9. **Drag-to-Q detail** — clock, agenda, team, quick-actions, pending and kudos cards each return rich, specific dummy detail when dropped on Q.

---

## 12. Panels, peel, fonts, calendar & documents (v0.8)

1. **Collapsible panels** — both side panels collapse to a slim vertical tray (icon + live/pending count + expand chevron); a collapse button sits in each header, and the canvas re-centres when either collapses (`panelLeft` / `panelRight` in the store).
2. **Peel everywhere** — every orbit node and every rail card now has a Layer-2 peel with raw AI stats (`NODE_DEEP` / `RAIL_DEEP`); documents keep their version-history peel.
3. **Typography** — Outfit for body, Gabarito for display, and a sparing Nexa accent tier on the wordmark and hub initial. Nexa is licensed, so it falls back to Gabarito when the face isn't installed.
4. **Orbit card-on-card** — dragging domain spheres together now yields real dummy outcomes (Calendar × Leave → best days to take leave; Leave × Pay → LWP impact; Growth × Pay → comp vs performance; policy relations; "raise a request"), with domain-coloured provenance.
5. **Calendar & Documents** — rounded/capsule buttons and cards to match My World; both gained an **Ask Q** pill, and Documents' search/actions were rounded. Calendar adds a **Suggest dates** Q action.
6. **Leave composer** — stepped 1·type / 2·duration & dates / 3·send layout with native **date-range pickers** (clamped to Jun–Sep 2026, dark color-scheme) that stay in sync with the ribbon/grid selection, plus a live balance check.

Deferred: calendar events aren't draggable tokens yet (they live in the SVG ribbon); making individual events draggable onto Q is a later pass.

---

## 13. Orbit anchoring + light-mode redesign (v0.9)

1. **Orbit stays put** — the central sphere now positions against a *stable* region computed from the panels' open widths, so collapsing or expanding either side panel no longer shifts it off-centre; the freed space simply opens up beside it.
2. **Light mode, rebuilt** — a proper "Daylight Continuum" theme rather than an inversion:
   - Colourful Big-Sur-style background (layered blue / lilac / mint / blush washes) with the flowing mesh and wave-sheen re-tuned to `multiply` blend and pastel brand hues so the motion reads on white.
   - Elite frosted-vibrancy cards: soft, layered macOS shadows (no dark glows), cool hairline borders, and the legibility "solid" card now stays light instead of turning dark.
   - AA-tuned palette: deeper Robin teal, rich-slate body text, and corrected muted greys; colourful per-card corner tints.
   - Theme-aware interaction states: white overlay hovers/fills and scrollbars remap to cool ink so nothing disappears against the light surface.

Everything reads from CSS variables + a light override layer, so both themes stay in sync as components evolve.

---

## 14. Light-mode cleanup (v0.10)

The v0.9 light theme used `multiply` blend on the background motion, which darkened the whole surface and muddied the card whites. Fixed by: switching the flowing mesh and wave-sheen to `normal` blend with light, low-opacity pastels (colour without darkening), lifting card whites (glass 0.76 / elevated 0.95) so cards read crisp, softening the hairline, and airier pastel washes in the base field. Result is a clean, bright macOS-style surface.

---

## 15. Logo, calendar detail, kudos delight (v0.11)

1. **Logo badge** — the wordmark's circle is now theme-aware via `.logo-badge`: a clean white→pale-blue disc with a soft shadow in light mode, the dark brand-tinted disc in dark mode, so the cube no longer sits on a muddy dark circle in light.
2. **Calendar Detail, redesigned** — weekday-aligned tiles (correct month offset) that actually carry content: day number, an event pill with icon and label, a "+N more" hint, today badge, weekend/selected states, hover tooltips with full event detail, and a visible colour legend under the grid. Clean in both themes.
3. **Leave types stay in full view** — removed the vertical scroll on the leave-type picker; all types show at once.
4. **Recognition, elevated** — promoted near the top of the rail and rebuilt: a featured kudo with avatar, a live kudos count, and tap-to-recognise teammate avatars that fire a delightful floating heart/sparkle burst and a warm toast. Still a full FWN token (drag / peel / combine).

---

## 16. Light mode, rebuilt + refined (v0.12–0.13)

Direction (agreed): warm pearlescent neutrals with cooler brand accents; one calm fluid-reflection gradient drifting BR⇄TL; true vibrancy with a rebuilt legible text ramp; hybrid elevation (vibrant cards, opaque chrome); dark mode gets the same gradient as a sibling.

- **Warm neutral base, cool accents** — warm off-white canvas (#FBFAF7) and a warm ink text ramp (charcoal / warm-gray secondary / AA-tuned tertiary); brand accents kept cool and deepened for contrast on white (Robin #0C8A97, Celtic #2F6BC0, Majorelle #5A36E0), with warm champagne + blush tertiaries reserved for the gradient.
- **One fluid-reflection gradient** — replaced the four competing blobs + sheen with a single soft gradient that drifts bottom-right ⇄ top-left on a slow 56s ease (`.aurora-drift`), like light on water. Warm-cool pastel blend in light (normal blend, no darkening); brand glows on screen-blend in dark — the two themes are now siblings.
- **True vibrancy, legible** — cards are genuinely translucent (≈0.70) with heavier blur + saturate so the drift shimmers through as living colour, while warm-ink text keeps everything crisp. Chrome and floating surfaces (island, Q panel, hub, dragged/peeled/result cards, popovers) sit at ≈0.92 opaque — the elevation hierarchy.
- **Shadows, not glows** — warm, in-between soft-yet-defined layered shadows with a specular top-edge highlight (the macOS "lit rim"); every colored glow is neutralised in light.
- **Warm interaction states** — hovers, fills, tints and scrollbars remap to warm ink so nothing disappears on the light surface.

**v0.13 correction** (first pass read too similar): the drift's violet lobe was washing the left half lavender and cards were still translucent enough to grey out. Fixed by (1) swapping the cool-violet lobe for a gentle blue and calming the whole drift (opacity .62, softer alphas) so the warm base dominates and no half looks purple; (2) lifting card opacity to ~0.84 so they read as crisp frosted white rather than grey; (3) dropping backdrop `saturate` from 165%→128% so the faint tint behind cards stops turning muddy.

---

## 17. Root-cause fix: the hidden blob layer (v0.14)

Why the last several light-mode passes "looked the same": Continuum was still rendering an **older three-blob aurora layer** (a purple lobe top-left, teal bottom-right, amber) *on top of* the new `.aurora-drift`. Every refinement I made to the drift/tokens was being masked by these unchanged blobs — they were the actual purple-left wash. Removed that layer entirely; the single calm fluid drift is now the real background.

Also: the drift motion was widened and sped up (56s → 40s, larger travel) so the slow BR⇄TL movement is actually perceptible (it still honours `prefers-reduced-motion`). And the two "dirty" glows were calmed in light — the coloured ring behind the centre hub drops to a faint blur, and the clock's radial fill loses its coloured drop-shadow.

---

## 18. Hub sphere, background, card language (v0.15)

- **The "square" hub bug** — the hub combined `rounded-full` with `.glass-elevated`, and `.glass-elevated`'s hard `border-radius: 20px` was winning over the utility, so the sphere rendered as a rounded square with a circle stuck inside. Rebuilt the hub on its own `.hub-disc` surface with an enforced circular radius: it's now a clean circular sphere, the progress arc is its rim (2-stop blue→teal), a soft top "lit" sheen (`.hub-fill`) gives it dimension, and the coloured halo behind it is a faint whisper in light.
- **Background restored** — the drift was over-corrected to near-invisible; brought it back to present-but-calm (balanced warm-cool: teal BR, gentle blue TL, champagne TR, blush BL) drifting slowly BR⇄TL.
- **Card language** — softer, closer macOS-style layered shadow (a tight contact shadow + one diffuse layer) instead of a single heavy drop; warm hairline + specular top edge retained for the "lit rim." Glows are gone from light; depth now comes from shadow + hairline.

---

## 19. Card design language: soft-float + identity (v0.16)

Committed the card system to a blend of Big-Sur softness and per-category identity:
- **Soft & floaty (2)** — 22px radius, a floatier layered soft shadow, retained vibrancy and specular top edge.
- **Expressive identity (3)** — every card now carries its category hue two ways: a thin rounded **accent spine** on the left edge, and a **gentle diagonal accent wash** across the surface, both keyed to the card's colour. The left feed maps per category (Wellbeing = teal, Approvals = amber, Payroll = purple, Documents = neutral); rail cards use their own tints (clock teal, Q insight purple, Pending amber, Recognition coral, etc.).
- Spine is inset from the corners so it never collides with the corner handles; orbit spheres and synth result cards are excluded (they aren't list cards).

---

## 20. Fluid background, calm audio+haptics, colour on screens (v0.17)

- **Wavy fluid background** — rebuilt as a 3-colour field (a→c gradient with a drifting centre colour **b**) given a real fluid texture by an SVG turbulence displacement. Colour b eases slowly top-left ⇄ bottom-right on a 28s cycle; the whole thing reads as slow-moving water and, with vibrant cards, shimmers through them. Themed: teal/periwinkle/champagne in light, blue/violet/teal on screen-blend in dark.
- **Soft ripple** — removed the sharp glow that flashed before the ripple; empty-canvas clicks now show only a gentle, low-opacity expanding ring.
- **Water-droplet click** — empty clicks play a soft, low pitch-drop droplet sound.
- **Calmer sound palette** — every cue is re-synthesised through a master low-pass with slow envelopes and low, warm frequencies: no high pitches, no buzzy sawtooth, nothing mechanical. Reject now settles softly downward instead of rasping.
- **Haptics paired to sound** — each cue fires a gentle matching vibration (softened so frequent cues like hover don't buzz).
- **Colour on the flat screens** — Documents now colour by status (amber = needs signing, teal = done) via the spine+wash; Calendar surfaces (ribbon, month context, composer, detail grid) and the Payroll cash-river carry accent washes, so light mode no longer looks drained on those views.

---

## 21. Avatars + fixes (v0.18)

- **Display pictures** — replaced initial-letter avatars everywhere in My World (hub, team presence, Recognition featured + give-kudos row, person tokens, add-menu search, overlays) with deterministic illustrated DiceBear avatars, themed with brand-pastel gradient backgrounds so they feel native. Each renders at runtime and falls back to the initial letter if the image can't load. Style/seed are centralised in `avatar.ts` + `<Avatar>` for easy swapping.
- **Calendar scrollbar** — the vertical scrollbar no longer shows permanently; it appears only on hover, and only if the content actually overflows (applied to the region wrapper too).
- **Light fluid** — the moving background is a touch more prominent (deeper pastels, full opacity).
- **Ripple** — the empty-click ripple now fades in from zero, removing the sharp contrast circle that flashed at the start.

Not done: research of shapes.co — the browser extension wasn't connected and this environment has no general web access, so I couldn't study it. Pending a connection or a summary of the features you liked.

---

## 22. Realistic avatars + interaction feedback audit (v0.19)

- **Avatars → realistic portraits** — dropped the illustration style; avatars are now realistic stock portrait photos, deterministic per person, loaded at runtime with the initial-letter fallback intact. Centralised in `avatar.ts` (swap the source in one line; can move to uploaded photos later).
- **Feedback audit — every gesture now has audio + a visible indicator:**
  - **Combine / Relate / Reject / drag-to-Q** — the pulse was a single thin ring that was easy to miss; it's now a soft flash + two layered rings + a small particle burst at the interaction point. Combine also got a gentle shimmer note so it clearly reads as "merged", and the result token now pops in with an emphatic spring entrance.
  - **Peel** (open the deeper AI layer) previously had no feedback at all — added a soft reveal tone + a burst at the card.
  - **Clock in / out / break, Apply-leave (Send), Acknowledge document** — sound is now emitted from the store action (so any caller gets it) and a burst fires at the exact button tapped, on top of the existing state change + toast.
  - **Approve / decline** (manager) now play a confirm / soft-reject tone.
  - Existing cues retained: pickup, hover-preview, close, empty-click droplet + ripple, kudos particle burst. All paired with gentle haptics.

---

## 23. My World feature build — Shapes-inspired (v0.20)

Built the full My World set drawn from the shapes.co research, in FWN terms.

Extensions to existing surfaces:
- **Policy Q&A with live data + citation** — asking Q about leave/vacation policy returns the written rule *and* the person's live balance in one answer, with a "Source: Employee Handbook v4.0 · Leave & Time Off" chip that jumps to Documents.
- **Charts-on-demand from Q** — "show my hours this month" / "my leave breakdown" render an inline chart (new worked-vs-expected bars and leave-by-type bars) plus a one-tap CSV download.
- **Worked-vs-expected hours** — the clock now shows this-period worked vs expected with a progress bar and a "timesheet due in N days" nudge; a matching Cue was added to The Now.
- **Who's-away, leave-aware** — team presence now shows richer states (In / Remote / On leave / At risk) with an expanded legend, instead of just in/out.
- **Proactive agent action** — the work-from-home answer now offers to *file* the request with Marcus (not just draft it), acting on confirmation.

New surfaces:
- **Employee Journey** — a personal timeline region (joined → shipped → transfer → promotion → comp revision → kudos milestone) as a peelable ribbon, reachable from a new orbit node.
- **Growth** — the Growth orbit node now opens a real region with a Q self-review summary (strengths, blind spots, a self-vs-manager perception-gap note) and goal progress, plus a "Prep 1:1 with Q" action.
- **Data-validation trust Cue** — a quiet Cue noting Q caught and corrected a role-title mismatch.
- **Sensitive-field masking** — payslip amount and profile contact now render as ••• with a click-to-reveal eye.

Not yet built (My Team / other personas) — deferred per your note.

---

## 24. My World fixes (v0.21)

1. **Orbit card hover** — expand now triggers only from the card's centre (pointer-position based), while the corner handles still appear on hover anywhere on the card. Moving toward a corner collapses the card so the close/stack buttons stay put; the centre shows a zoom-in cursor as a cue.
2. **Clock card** — the "This period" worked-vs-expected bar moved off the daily face into the clock's peel layer, so the face stays focused on clock-in/out.
3. **Q prompt picker** — the flat pool is now organised into labelled groups (Time & leave / Pay / Documents / Team & insights / Get organised) in both the Cue popover and the Q panel; no prompts removed.
4. **Persistent side panels** — the left feed and right rail now stay mounted across Calendar, Documents, Growth and Payroll, auto-collapsing to slim trays when you open one of those pages and expanding again on Home.
5. **Growth + Journey merged** — one Growth orbit node; its peel previews the recent Journey, and the Growth screen has Growth / Journey tabs (Growth default). Added two more journey milestones.

---

## 25. Role-based restructure + first My Team feature (v0.22)

Primary layers (My World / My Team / The Org) now each own a coherent world:

- **Per-persona home** — each primary has its own orbit dashboard of only its secondary layers: My World → Calendar / Leave / Pay / Documents / Growth / Requests; My Team → Approvals / Team / Availability / Insights / Reviews; The Org → Org / Payroll / Onboarding / Policies / Insights. The people-graph constellation is now the Team (manager) and Org (HR) secondary regions, not the home. Growth was also added to the My World top nav.
- **Role-scoped side panels in Now** — the left signal feed and the right rail are present for all three roles, with different data. The Now feed is filtered by persona (a manager never sees personal wellness/kudos cues; HR sees org-wide signals). New right rails: Manager (approvals queue, team presence, flight-risk, coverage, team pulse — no personal salary or kudos) and HR (payroll run, onboarding, policy compliance, org health). Panels persist and collapse across each role's secondary pages.
- **RBAC in the data** — cues carry a persona and are partitioned into employee / manager / HR sets; My Team data no longer bleeds into My World.
- **Alex's avatar** is now a male portrait.

My Team feature (first from Shapes):
- **Context-rich approvals** — each leave request's review layer now shows how many days of the same reason the person has booked in the last 12 months and how much this request adds on top.

Queued next for My Team: talent distribution map, team time-off heatmap, team analytics via Q ("who's a flight risk?"), 1:1/review-prep summary, manager directory, and workflow oversight with batch-nudge.

---

## 26. Free grid-snap dragging + detachable panels + My Team features (v0.23)

Interaction:
- **Invisible snap grid** — any card except the orbit nav spheres can be dragged by its move handle and dropped anywhere; it snaps to the nearest point on a 32px grid. A faint dot grid fades in only while dragging.
- **Detachable side-panel cards** — cards can be pulled out of the left feed or right rail into the main canvas (they float at a grid point); dragging one back over its panel re-docks it to its original slot. Works via a `floating` map in the store; floated cards render fixed and escape the panel's clip.
- **Overlap fix** — the manager "Team availability" card that collided with the right rail is gone; its mini heatmap now lives inside the rail's Coverage card, and the duplicate floating manager/HR metric cards were retired in favour of the role rails.

My Team (manager) features from Shapes:
- **Talent distribution map** — a performance × potential 2×2 in Insights.
- **Team time-off heatmap** — report × week leave clustering in Insights.
- **Manager directory** — direct / indirect / total report counts.
- **Team analytics via Q** — "can we afford 2 more engineers?" and "why is Sarah a flight risk?" (plus the existing attendance/comp/workload/availability intents).
- **1:1 / review prep** — Q briefs the manager on a report's strengths, watch-outs and perception gap.
- **Batch-nudge** — one action nudges all reports with overdue timesheets.

---

## 27. Vibe Studio, scalable My Team, and interaction polish (v0.24)

**Vibe Studio (manager & HR).** A floating "Build" launcher sits bottom-right. It opens a canvas where you describe a tool in plain language — or tap a predefined prompt — and a live mini-app is generated from your team's (dummy) data. Six starter tools: Flight-risk board, Comp vs performance, Coverage planner, 1:1 tracker, Bradford absence score, and Skills matrix. Each generated tool can be **sent to your Now view** (it appears as a card in the Team rail) and **removed** again; pinned tools are draggable onto the canvas like any other card. This mirrors Shapes' signature "describe-it-and-it-builds-it" idea and is the most differentiated surface in the product.

**Scalable My Team.** The single-ring constellation only reads well up to ~8 people, so My Team now auto-switches to a **Roster** grid past that threshold, with a Graph/Roster toggle to override. The roster scales to any size: status summary (in / on leave / at risk), department filters, and search, in a scrolling responsive grid. The dummy team was grown to 17 reports so the behaviour is visible. The home orbit is unaffected — it is fixed navigation, independent of team size. The Team-presence rail card leads with status counts and caps at six rows with a "view all" into the roster.

**Availability matrix.** Rebuilt wider — avatars per row, weekday + date headers, in-office / remote / leave / weekend states, and a per-day coverage row that flags dips in ember.

**Interaction fixes.** Top card handles in the side rails are no longer clipped (rail scroll padding). Dropping a card onto a panel now always docks and never accidentally merges with the card beneath it — panels are treated as organising zones, so merges only happen out on the open canvas. The My Team hub shows the team as an avatar cluster rather than a single portrait.

---

## 28. Typography & legibility pass (v0.25)

The type system now uses only **Gabarito** (display/headings), **Outfit** (all body and UI), and **Nexa** sparingly (the Qubryx wordmark only, falling back to Gabarito). IBM Plex Mono was removed entirely — the former "mono" role now renders in Outfit with tabular, lining figures (`tnum`/`lnum`), so numeric columns, clocks and currency still align cleanly without the cramped monospace look.

Sizes were lifted across the board for legibility: the smallest UI text now floors at 11px (was 8–9px), most secondary text sits at 12–13px, and `text-xs` body copy was raised to 13px. Micro uppercase labels got a touch more letter-spacing so they stay readable when small, headings got slightly tighter tracking on Gabarito, and body line-height was relaxed to 1.45.

---

## 29. Personalisation, legibility & the droplet (v0.26)

**Settings & personalisation.** A gear in the top chrome opens a Settings panel where you can choose a **wallpaper** that sits beneath the living gradient (None, Aurora, Dunes, Topographic, Mesh, Rainfall — all self-contained SVG, theme-aware, kept subtle so glass cards stay legible), pick your **avatar** (default plus six faces), and toggle **ambient motion**. Choices persist across sessions via local storage.

**Bigger secondary text.** The orbit node captions — the "Jul 22 / 3 to sign / 30d left" style sub-values — and the hub sub-line were scaled up (labels to 14px, values to 13px) and the node cards widened to fit.

**Key-value alignment.** Peeled cards laid parameter/value pairs out with a plain space-between that broke when a label wrapped (e.g. "Avg resolution" / "1.4 days"). All Stat blocks and inline metric rows now baseline-align, keep a gap so a long label can't collide with its value, and never let the value wrap.

**The droplet.** A drop of water is now a first-class element in the FWN language: tapping empty surface drops a droplet that falls, lands and rings out, and an ambient drizzle occasionally dimples the field like rain on still water. Both honour reduced motion.

---

## 30. Background rebuilt: wallpapers, ripple, decluttered island (v0.27)

**Layering fix.** The gradient field and its effects were accidentally painting above the cards (the haze) and, in light mode, fully covering the wallpaper. The root now isolates its stacking context, the wallpaper sits at `-z-10` and the fluid at `-z-5` — both firmly behind content. The light-mode fluid is now translucent, and the fluid steps back further whenever a wallpaper is active, so wallpapers read clearly in both themes.

**Click ripple, rebuilt.** The old droplet-fall/splash/multi-ring click effect and the ambient drizzle were removed entirely. Clicking empty surface now produces a single soft water ripple (plus the gentle drop tone) — nothing more.

**Wallpapers, redone.** Down to five, each tuned to read on light and dark and each subtly animated: Aurora (glowing, drifting ribbons), Waves (slow swaying bands), Rainfall (streaks actually fall now, with occasional ripples), and two warm Apple-style options — Dawn (peach/rose/amber) and Ember (amber/terracotta/gold). All animation honours the motion setting.

**Decluttered island.** Sound, appearance (light/dark) and plain mode moved out of the top bar into Settings, under a new System group alongside ambient motion. The island now carries just Settings and Reset in its utilities cluster.

---

## 31. Legibility, handles, sound, rain, action dock (v0.28)

1. **On-background text in light mode** — the greeting, role sub-line and orbit caption sit directly on the wallpaper, so they now use a dedicated high-contrast palette in light mode (deep navy title, slate sub) instead of the low-contrast brand gradient. Dark mode is unchanged.
2. **Orbit card handles** — peel/stack/close now stop the pointer event, not just the click, so tapping the peel handle shows the deeper layer instead of falling through to the card's tap (which was opening the page).
3. **Empty-click sound** — replaced the drawn-out droplet with a short, soft bubble pop.
4. **Rainfall** — slowed to about a fifth of its old speed, fewer streaks, lower opacity, and calmer ripples, so it reads as ambient rather than distracting.
5. **Action dock** — the Add (+) and Build buttons are now one capsule at the bottom-right, aligned to the Q bar, instead of two odd free-floating buttons.
6. **Insights cards** — cards no longer instruct impossible drags (dragging a person onto a chart when no person tokens are on that screen). Talent names are tappable to open a profile, and the analytics cards offer real actions (Ask Q, or jump to My Team where people can be compared). A fuller "token mobility" model — moving any card between Now and other screens so charts and people can be combined anywhere — is noted for a future pass.

---

## 32. Peel fix, capsule dock, and the Canvas (v0.29)

1. **Peel handle** — the real cause: cards navigate through framer's pointer-based `onTap`, which a React `stopPropagation` on the handle can't cancel. The tap handler now ignores any tap that lands on a corner handle (`data-handle`), so peel/stack/close behave correctly in every lens.
2. **Action dock** — the Add + Canvas cluster is now a true capsule (radius forced over the panel default). On My World, where there's no Canvas, the Add button floats on its own again.
3. **Canvas** (was "Build") — the small popup is replaced by a fullscreen three-panel workspace:
   - **Left** — history: the tools you've built (with Now/Insights markers) plus recent prompts, and a New canvas button.
   - **Centre** — a real conversation with Q and a larger multimodal composer (text, image, file, voice). Each generated tool renders live inline with **Send to Now**, **Send to Insights** and remove.
   - **Right** — suggested prompts and a Shapes-style **module catalogue** (People Directory, Time Off, Attendance, Workflows, Performance & Growth, People Analytics, Surveys, Skills & eSign) that seed prompts.
   Tools sent to Now land in the team rail; tools sent to Insights render at the top of the Insights view. Three new tool types were added — Workflow board (who's stuck), Pulse survey, and Org & span — so every module produces something real. This makes the canvas a conversational, multi-destination tool builder rather than a single popup.

---

## 33. Canvas polish, typed actions, token mobility, Qubryx One (v0.30)

1. **Canvas legibility** — the fullscreen Canvas is more opaque with stronger backdrop blur, and its text (Q replies, module descriptions, history, headers) is brighter.
2. **Typed prompt-to-action** — the Cue now understands action commands with parameters, separate from the suggestion list. World: "apply for leave on July 15" (parses the date, drafts the request, one tap to send), "book leave Aug 3–5", "clock in / clock out / take a break", "sign my documents", "show my payslip". Team: "approve Sarah's leave" (resolves the person and their pending request), "nudge overdue", "simulate a retention move for Sarah". Dates parse from "July 15", "15 Jul", ranges, and today/tomorrow.
3. **Token mobility** — persons and charts can now meet on one surface. Roster people gain a **Send to Now** pin; the Attendance / Compensation / Workload insight cards gain **Send to Now**. Everything sent lands on the Home surface as free, draggable tokens, and dropping a person onto a chart runs a real comparison (a new person×chart combination in the resolver, with the person's standing on that metric and an Ask-Q follow-up).
4. **Qubryx One login** — redesigned: an original orbital product mark (a single ring, central sphere and one orbiting node — "one workspace, everything in orbit"), the Qubryx One wordmark, a living aurora backdrop, glass card, SSO option, and a discreet "by Qubryx" lockup using the Qubryx logo.

---

## 34. Phase 1 — login, recognition, nudges, voice (v0.31)

**Premium two-panel login.** A large split card: the left panel is a feature carousel with original in-product visuals (the orbit, Q as copilot, Canvas building a board, My Team at a glance), auto-advancing every 5s with dot navigation, pause-on-hover and reduced-motion support; the right panel holds the Qubryx One sign-in (email/password, SSO, "explore a demo workspace"). Below ~880px the showcase collapses and the form centres. The original orbital Qubryx One mark anchors both panels.

**Grander Kudos.** A bespoke gradient "bloom" mark replaces the generic heart. Giving recognition is now a small composer — tap a teammate, pick a reason chip ("Above & beyond", "Clutch delivery"…), send — and the send fires a grand celebration: a blooming mark that scales and fades with ten radiating particles, plus a confirm ripple, sound and haptic.

**Received nudges.** A distinct `nudge` cue kind in The Now: it carries the nudger's avatar and reads "Marcus nudged you…", visually separate from system signals, with a one-tap resolve that plays a soft confirm ripple and opens the relevant surface. Nudges feel personal (from a human) rather than mechanical.

**Speech-to-text for Q.** The Cue and the Canvas composer mics now use the browser's Web Speech API. Speaking streams a live transcript into the input (the orb shows its listening state); the Cue auto-submits on completion. Where the browser has no speech support (e.g. Firefox), the mic explains it isn't available rather than failing silently. This pairs with the typed-action parser — say "apply for leave on July 15" and it flows straight to the action.

---

## 35. Voice fix + carousel polish (v0.32)

**Voice input fixed.** The mic was failing silently — the orb flashed to its listening state, the recognition immediately errored, and nothing surfaced. Both mics (the Cue and the Canvas composer) now run through one hardened hook that reports the actual reason: microphone blocked, no microphone, no speech, service unreachable, unsupported browser, or — most commonly when testing a build — a non-secure context. Web Speech only runs over https or on localhost; opened from a file or a plain-http LAN address it can't capture audio, and the app now says so instead of jerking back to idle.

**Login carousel redesigned.** Each slide now sits in a floating glass product frame (window chrome, soft drop shadow, a gentle bob) over a per-slide accent glow that recolours the panel. Added a kicker label above each headline, richer in-product visuals, smoother slide-and-lift transitions, and a segmented progress bar whose active segment fills across the slide's dwell time (static under reduced-motion).

---

## 36. Phase 0 + Phase 2 — authored entities, the publish loop, Q citations (v0.33)

**Phase 0 — entity backbone.** A single generic authored-entity model now underpins manager/HR content: each entity has a type (document to start, with goals/announcements/notes reserved), title, body, category, an audience (whole org / my team / one person), a status (draft → published → archived, never deleted), an author, a version, and acknowledgment tracking. A lightweight activity log records every create, edit, publish, archive and acknowledgment. Cross-lens materialization is formalised once: publishing evaluates the audience and, when it includes the signed-in employee, drops a signal into their The Now — reused by everything built on this backbone later.

**Phase 2 — the manager authoring loop.** A new Team/Org documents surface (manager and HR lenses) lets you create a document, write it, choose its type and audience, optionally require acknowledgment, then publish. Publishing does three things at once: it surfaces a personal cue in the target employees' My World ("New Handbook: … needs your acknowledgment"), it lists the document under "Shared with you" in their Documents, and it makes the document citable by Q. Editing bumps the version; re-publishing refreshes the signal; archiving retires it but keeps the record. The employee can acknowledge inline or straight from the cue, which updates the acknowledgment count the manager sees.

**Q citations.** Ask about a policy, the handbook, hybrid-work or coverage and Q now answers *from the published document* — quoting the source by title, author and version — and, if something still needs acknowledgment, offers a one-tap acknowledge. This closes the loop: a manager writes it, it lands in the employee's world, and Q speaks with the authored source rather than inventing an answer.

Next in Phase 2: approvals-as-inbox (batch, hold, delegate-while-away).

---

## 37. Team documents in My Team + approvals-as-inbox (v0.34)

**Documents reachable from My Team.** The authoring surface existed for HR but managers had no way in — the manager orbit gained a Documents sphere, so My Team can author and publish team-scoped documents (it shows the count of what you’ve shared). HR keeps its org-wide Policies sphere; both open the same authoring surface, scoped to what each can manage.

**Approvals-as-inbox.** The approvals queue is now a proper inbox:
- **Batch** — select individual requests or select-all, then approve or decline the selection in one action.
- **Hold** — park a request for later; it drops into an "On hold" section and can be resumed to the queue without a decision.
- **Delegate-while-away** — hand approvals to a chosen report; a banner explains that in-policy requests can auto-approve while you’re out, and turning it off restores normal flow.
Per-row approve / decline / hold remain for quick single decisions, alongside the availability matrix and overdue-nudge. SLA-breaching and conflicting requests are flagged inline.

---

## 38. Phase 3 — onboarding: product tour + new-joiner checklist (v0.35)

**First-run product tour.** A persona-aware coach overlay runs on first entry (gated by a localStorage flag) and can be replayed any time from Settings → "Replay product tour". It dims the workspace, spotlights the relevant area, and walks through the essentials with Back / Next / Skip and progress dots. Employees learn the hub, spheres, The Now and the Cue (with a "try 'apply for leave on Friday'" prompt); managers get Approvals-as-inbox and Canvas; HR gets Policies and the org read. Reduced-motion and the dim-to-dismiss are respected.

**New-joiner checklist in My World.** A "Getting started" card sits at the top of the employee rail with a progress ring, the assigned buddy, and a week-one checklist (profile, acknowledge the handbook, meet your buddy, payroll, first 1:1, security training). Ticking items updates the ring; the card retires itself once everything's done. "Ask Q to guide me" — and questions like "what should I do first?" — get a proactive next-step answer that deep-links to the right surface.

**HR/manager authoring.** The onboarding pipeline now runs off state: each candidate can be given a start buddy from a picker and an assigned plan, both recorded in the activity log. This is the same publish-and-materialize spirit as documents — assign a plan and the joiner's checklist is what shows up in their My World.

---

## 39. Phase 4 — goals, 1:1s and reviews (v0.36)

**Goals & OKRs.** Managers set a team goal, then cascade it — each report gets their own slice, and the parent shows a live roll-up of the team's progress. Employees see their goals in Growth with a status chip and nudge progress up or down; anything under 45% flips to "at risk". Q answers "how am I tracking?" from the real numbers, and "how is my team tracking?" with the roll-up and who's at risk.

**1:1 workspace.** Every 1:1 carries a shared agenda and action items that persist between meetings — tick them off or add new ones from either side. Employees see their next 1:1 with Marcus; managers get a card per report. "Talking points from Q" and "Prep with Q" draw on goals and recent signals so nobody walks in cold.

**Review cycles.** Employees write and submit a self-review (Q can draft a first pass from their goals); the status moves to "awaiting manager". Managers see the whole cycle — who's in, who's outstanding — nudge the stragglers, and write feedback that completes each review. Q summarises where the cycle stands.

All three live on one Growth surface — the employee's personal view and the manager's team view (goals / 1:1s / reviews tabs), reached from the Growth sphere in each lens.

---

## 40. Phase 5 — Canvas v2 + the My World Board view (v0.37)

**Canvas v2.** Tools you build are now durable and malleable: **rename** a tool inline, **duplicate** it to branch a variant, and **export** its data as CSV. **Multi-turn refinement** works — after a tool exists, a follow-up like "filter to Engineering" or "sort by risk" refines that tool (tagged "refined") instead of starting over. The composer accepts a **dropped file** (or the paperclip) and builds a fitting view from it. And the whole Canvas now **persists across sessions** — your tools, their names, and where you sent them (Now / Insights) survive a reload.

**My World Board view.** My World gains a second mode via a **Signal ⇄ Board** toggle. Signal is the familiar orbit; Board is a free canvas where you assemble your own cards. An "Add to board" palette drops in My hours, My leave, attendance or workload; cards are draggable, and dropping one on another compares them (the same token-mobility model, now for employees). The board's contents are saved for next time.

Deferred to a later pass: combining several tools into a single saved dashboard, image (PNG) export, and pixel-exact board position persistence (contents persist today; positions reflow on reload).

---

## 41. Fixes — visible Board toggle, comprehensive Send-to, clearer refine (v0.38)

**Signal ⇄ Board toggle now visible.** It was rendering at the exact same coordinates as the top chrome bar (both `top-3`, centered) and sat hidden behind it. Moved the toggle — and the board's "Add to board" palette — clearly below the top bar. Note it lives in **My World** (employee lens), since the board is the employee's personal canvas.

**Comprehensive "Send to…".** The two fixed buttons are replaced by a **Send to…** menu with clearly-labelled, independently-toggleable destinations: the current workspace's **Now** rail (named per lens — "My Team's Now" or "The Org's Now", resolving the ambiguity), **Insights**, and **Board** (a new real destination — the tool becomes a draggable card on the home board). The button shows which destinations a tool is currently in, and each can be toggled on or off.

**Clearer refinement.** "Filter to Engineering" (and similar follow-ups) refine the last tool you built rather than starting a new one. That was invisible before; now the tool card carries a visible "Refined · …" tag and Q states exactly what it applied, so the effect is legible.

---

## 42. Board view, redesigned — distinct mode, per-lens, uncluttered (v0.39)

**The switch.** Options considered: (a) keep a top toggle — rejected, it collided visually with the top chrome and crowded the centre; (b) fold it into the top nav row — rejected as cramped and easy to miss; (c) a bottom-left floating control — chosen. It sits out of the way, is always available in both views, and reads as a "mode" control rather than a page tab. Signal uses a waveform mark, Board a grid.

**Adding cards.** The wide centre "Add to board" bar is gone. In its place, a compact **"＋ Add card"** button at the top-left opens a small popover listing your cards (My hours, My leave, Attendance, Workload), each showing whether it's already on the board. Minimal footprint, off to the side, no competition with the centre.

**Board is now a different place.** Switching to Board hides the Now feed, the Today rail and the orbit entirely, and lays a faint dotted grid across the canvas — so it feels like stepping into a workspace of your own rather than a re-skinned home. The empty state is centred and calmer.

**Per-lens, non-bleeding.** Board cards are now scoped to the lens that created them. Your My World board no longer appears when you switch to Signal, or when you move to My Team or The Org — each lens keeps its own board, and Canvas tools sent to "Board" land on the board of whichever lens sent them.

---

## 43. Board grid — persistent positions, row-wise, snapping (v0.40)

The board's cards were laid out by recomputing coordinates on every render and holding drag positions in transient state, so any re-render — including returning from Signal — reset them. Rebuilt as an **ordered grid**: position now derives from card order, which already persists, so it survives view and lens switches. Cards fill **row-wise, four per row**; dragging **snaps** a card into the nearest slot and reorders (that new order is what persists); and when there are more cards than fit, the board **scrolls vertically**. New cards land at the end of the grid.

## 44. Phase 6 (part 1) — pulse surveys + agentic Q (v0.40)

**Pulse surveys.** Employees get a one-tap weekly pulse in My World (1–5, anonymous, re-tappable to change). Managers and HR see the other side in Insights: the current average, a six-week trend line, participation, and Q's read of the themes — with "Summarise with Q" for a spoken-language summary.

**Proactive / agentic Q.** Insights now opens with a "Q recommends" card for managers: it spots a report showing flight-risk signals and proposes concrete next steps — draft a retention plan, or prep the 1:1 — each a single tap that hands off to Q with the right context. This is Q moving from answering questions to suggesting the next action.

Still open for a Phase 6 part 2: compensation planning (budget-bounded, band-guarded, HR-routed) and coverage/delegation intelligence.

---

## 45. Boards in every lens, Q-placed cards, and RBAC (v0.41)

**A board per persona.** Signal ⇄ Board now exists in all three lenses, and each board is its own place. My World holds personal cards (your hours, your leave); My Team holds attendance, workload, compensation, retention; The Org holds the org-wide views. Contents are scoped to the lens that created them and never bleed across personas. The "Add card" palette and the empty-state copy are persona-specific.

**Ask Q to place a card.** You can now say "add my hours to my board" (My World) or "put attendance on the board" (My Team) and Q drops the right card onto the current lens's board and flips you into Board view. If you name a metric your role can't see, Q says so rather than adding it.

**The floating-cards bug is gone.** Cards sent from Canvas used to free-float over the Team/Org home because those lenses had no board surface. Now everything sent to a board — from Canvas, from Insights, or from Q — lands in that lens's board grid, in order, and nothing overlays the ambient home.

**RBAC, made explicit.**
- *Canvas (build tools with Q)* — managers and HR only. Employees have no Canvas entry point.
- *Board* — everyone, one per lens, persona-scoped.
- *Adding cards* — employees use the Add-card palette (personal info cards) and Q ("add my leave to my board"); managers/HR additionally use Canvas → Send to Board and Insights → Add to board.
- *Q* — everyone; card placement is role-checked, so an employee can't pull a team/org chart onto their board.

---

## 46. Phase 6 (part 2) — compensation planning + coverage intelligence (v0.42)

A new **Planning** sphere for managers and HR, with two tabs.

**Compensation planning.** Managers allocate raises to their reports against a **merit budget** — a running meter shows what's allocated and what's left, and the plan can't be routed while it's over budget. Each person shows their **pay band** (min–mid–max) with markers for current and projected salary; a raise that lands below the band minimum or above the ceiling is flagged, and anything above the ceiling is marked as needing HR sign-off. Crucially, raises **never apply directly** — "Route to HR" submits the whole thing as a **draft**, and HR sees it in their own Planning sphere with an Approve action. This encodes the real control: managers propose within guardrails, HR disposes.

**Coverage & delegation.** The second tab lists upcoming leave windows, who's away, and what's at risk while they're out. Each gets a **"Covered by"** assignment, unassigned windows show a **coverage gap** warning, and Q offers a suggested cover for each — or **auto-assigns** all of them from its suggestions, with the manager keeping the final say.

Q is wired in on both: "how should I plan compensation within budget?" and "who should cover the upcoming leave?" open the right tab with a grounded read.

**Roadmap status: Phases 0–6 are complete.** Entity backbone, document publishing, onboarding, goals/1:1s/reviews, Canvas v2, the per-lens Board, pulse surveys, agentic Q, and now compensation + coverage planning are all delivered and building clean.

---

## 47. Optional features — publish-to-team, employee bespoke cards, dashboards, PNG (v0.43)

**Push a Canvas tool to the team's My World.** The Canvas "Send to…" menu gains a destination — "Team's My World" (manager) / "Everyone's My World" (HR). Publishing a tool makes it available to your people: employees see it under "Shared with you" in their board's Add-card popover and can drop it onto their own board. This is the same publish/materialize pattern as documents, now for live tools — build once, share to everyone.

**Employee bespoke info cards.** My World's board gains two more personal cards — My goals (live from your goals, with per-goal progress) and My pay (recent net-pay trend) — joining hours and leave. And you can summon any of them by asking Q: "add my goals to my board" or "put my pay on my board." Role-scoped, so these stay personal to the employee.

**Combine tools into a dashboard.** In Canvas, select two or more tools (the small box on each) and "Combine into dashboard" bundles them into a single card that stacks all the views. The dashboard behaves like any other tool — rename it, send it to Now, Insights or the Board, or share it to the team.

**PNG export.** Alongside CSV, every Canvas tool (and dashboard) can now be exported as a PNG image for dropping into a deck or a message.

*On persisted drag positions:* this was superseded by the earlier board rework — the board is an ordered grid, so a card's position is its order, which already persists across sessions and view/lens switches. There's no separate free-position state left to lose.

---

## 48. Canvas overhaul, part 1 — structure, sessions, sharing, PNG (v0.44)

**Left is now conversation-first.** The left rail holds **New canvas**, a list of **Canvases** (your session history — the current one is highlighted, past ones are one click to reopen), and **Artifacts** (every tool you've built; click one to jump to it in the conversation). Building a tool no longer feels like it's being "moved" to a list — the artifact list is a table of contents, not the tool itself.

**New canvas works.** Starting a new canvas files the current conversation into history and gives you a clean slate; reopening a past canvas restores it. History persists across sessions.

**Right is prompts, and modules are now Recipes.** "Build a tool" lists the one-click tools. Below it, **Recipes** are genuinely different: each spins up a *set* of tools at once — "Retention war-room" builds flight-risk + comp-vs-performance + coverage together; "Quarter kickoff" builds a skills matrix, workflow board and pulse survey. Recipes compose; tools are singular.

**Combine is a proper checkbox**, now at the **top-right of each tool card** rather than buried in the action row. Tick two or more, then Combine into a dashboard.

**Dashboards fit on the board.** A combined dashboard card now spans two columns and grows in height with its contents (up to three rows), scrolling internally if needed — so you see the whole thing instead of a clipped tile, while staying true to the grid.

**Share to a specific person.** The Send-to menu gains "Share to a person…", which lists your team — send a tool to one teammate's My World, not just the whole team.

**PNG export is fixed.** Exports now neutralise the glass/backdrop-blur (which image capture can't see through) against a solid background, so the exported image matches the card instead of coming out washed out.

Still to come (part 2): a substantially expanded tool & widget library in Canvas — the main USP — with more primitives and building blocks.

---

## 49. Board masonry + leaner Canvas artifacts (v0.45)

**Dashboards no longer waste space.** The board is now a measured masonry: every card spans exactly the number of rows its content needs (an 8px row unit), so a two-view dashboard is only as tall as its two views — no forced three-row block. Reordering uses nearest-card hit-testing, which stays accurate now that cards vary in size. Dashboards still take two columns for legibility but grow to their true height.

**Canvas artifacts are compact.** The left rail's Artifacts list was a stack of full-width rows that read as clutter. It's now a tidy wrap of icon-chips — one per tool, with a dot when the tool is live somewhere (Now, Insights, Board or shared). Click a chip to jump to that tool in the conversation.

---

## 50. Canvas library expansion — item 6, part 1 (v0.46)

Seven new tools join the "Build a tool" list, each a real, data-backed view:
- **KPI tiles** — headcount, attrition, tenure and eNPS as headline stats.
- **Attrition trend** — voluntary attrition over the last eight months as a sparkline.
- **Headcount by team** — ranked horizontal bars.
- **Comp band ladder** — band ranges by level with how many people sit in each.
- **Engagement heatmap** — a team × week grid of engagement scores.
- **Recognition leaderboard** — top people by kudos points.
- **Hiring funnel** — applied → screened → interviewed → offered → hired.

All behave like the existing tools: rename, duplicate, refine, combine into a dashboard, export CSV/PNG, and send to Now / Insights / Board / a person. Canvas now offers sixteen building blocks plus the four recipes — a much more robust palette, which is the point since Canvas is the product's signature.

---

## 51. Canvas library — item 6, part 2: freeform widgets + smarter prompts (v0.47)

**Freeform composable widgets.** Beyond the ready-made tools, Canvas now has six primitives — **KPI, Gauge, Trend, Bars, Table, Timeline** — in a new "Widgets" section on the right. Click one to drop it in, or just describe it: "a gauge for goal completion", "a KPI for revenue", "a timeline of the launch". Q parses the shape and the metric you named and builds it (numbers are illustratively synthesised and stable per label).

**Per-widget config.** Every freeform widget carries a "Shape" row — switch the same metric between KPI, gauge, trend, bars, table or timeline with one tap; rename it to change the label. The card re-renders live.

**Typed prompts build the right tool.** Typing in the Canvas composer now recognises all sixteen tools, not just the original nine — "headcount by team", "engagement heatmap", "hiring funnel", "attrition trend" and the rest each build their tool instead of falling back to a generic reply.

**Ask Q to place the new tools on the board.** The board's Q command now covers the new tools too — "add headcount to my board", "put the hiring funnel on the board" — role-checked as before, and the board renders them at their natural size via the masonry layout.

## 52. Verified-restore checkpoint (v51)

**No behavioural change.** This round carried no feature or fix work. The codebase was restored from `qubryx_fwn_v50.zip` into a fresh sandbox, dependencies reinstalled, and both gates re-confirmed clean: `npx tsc --noEmit` reports no errors and `npm run build` completes successfully (only the standard >500 kB chunk-size advisory, which is informational and not an error). The Canvas library stands unchanged at 16 ready tools + 6 freeform widgets + 4 recipes, across the three lenses (My World / My Team / The Org).

This checkpoint exists to keep the version chain and the two docs in lockstep with the packaged zip, so the next substantive round starts from a known-good, reproducible baseline. Next: the user-driven polish & fine-tune pass across surfaces.

## 53. Focus queue, the Q brain, and a friction pass (v52)

**Focus — the Now, full screen (My Team & The Org).** A new region that turns everything on your desk into one prioritised, colour-coded queue: critical (coral), high (ember), medium (violet), low (teal), each card with a left priority rail. Items are derived live from state — pending approvals (one card each; SLA breach escalates to critical), flight risks, uncovered leave windows, outstanding self-reviews and the unallocated merit budget for managers; pooled payroll anomalies, routed comp plans, buddy-less joiners and retention watches for HR — plus the lens's live signals from The Now. Every card carries direct actions (Approve/Decline, Simulate, Auto-assign, Nudge…) that mutate real state, so completing one removes it from the queue; a session counter tracks what you've cleared. Every card is Q-native: an "Ask Q" chip sends a contextual question, and the header reminds you Q can act ("approve Sarah's leave"). Swipe a card right to clear it. Reach Focus from a pulsing orbit sphere on both homes (coral when something is critical), a top-nav pill, a "Focus" button in The Now's header, the `f` key, or just ask — "what needs my attention?".

**Q got a brain.** A new on-device NLU layer (`qbrain.ts`) runs before the legacy intent regexes — deterministic, zero-latency, no external model. It typo-corrects every message against a domain lexicon using restricted Damerau-Levenshtein distance ("aprove sarahs leev" → "approve sarah's leave", "waht needs my atention" → understood), fuzzy-matches people's names ("reject sarha" finds Sarah), and adds a table of higher-order intents: plain navigation ("take me to planning" — switching lens when the destination lives elsewhere), declining a named person's leave, auto-assigning coverage, nudging outstanding reviews, creating goals from a sentence ("create a goal to ship repository v2 by Aug 30" — title and due date extracted), lens switching by name, computed answers ("how many pending approvals", "who is on leave"), person lookups ("who is David?"), a lens-aware greeting, and **two-step chains** — "approve all pending and nudge the team" proposes a single "Run both steps" action that executes in order. Anything the brain isn't confident about falls through to the legacy brain untouched, so every existing phrase still works; analytical queries ("show team attendance trend") are explicitly protected from navigation hijack. Every action still lands as a confirm-button, never fired silently.

**UX friction pass.** Global keyboard layer: `/` or Ctrl/Cmd-K focuses the Cue from anywhere, `1·2·3` switch lenses, `Esc` walks back (overlay → Q → Canvas → home), `b` flips Signal ⇄ Board, `f` opens Focus — with a one-time discoverability toast on first launch. The Q panel autofocuses its input when opened. The Cue's placeholder now rotates lens-aware example phrases ("Try 'approve Sarah's leave'…"), teaching the natural-language range by osmosis. The Now gains a one-tap "Focus" shortcut for managers and HR. New Q suggestions cover the queue and the chain. All new surfaces respect reduced motion (swipe gestures disable, springs flatten) and carry aria labels; toasts already announce via `role="status"`.

**Honest caveats.** The Q brain is deterministic pattern intelligence, not a hosted LLM — it has no free-form generation; unrecognised phrasings fall back to guidance. Typo correction is conservative (first-letter anchored, distance ≤2) so unusual words pass through untouched. Focus swipe-to-clear only dismisses; committing actions stay on explicit buttons by design.

## 54. A grander front door, a tidier board palette, and a Canvas that reads your numbers (v53)

**Login, redesigned.** The left carousel's four scenes were rebuilt as richer, living artwork: the orbit now runs two counter-rotating rings with a breathing core and initialled people-nodes; the Q scene shows a live waveform in the intent bar, a typing indicator and a confirm chip; the Canvas scene draws animated bars (one ember outlier), a 75% gauge and a sparkline under a "your data" chip — echoing the new prompt-to-data feature; the team scene gained presence dots, an SLA pulse and a trend line. Slides sit in an upgraded frame: gradient ring border, specular top edge, tinted window dots and a gentle hover lift. The form matured too — leading icons in both fields, a show/hide password toggle, focus glow, "keep me signed in", an SSO key icon, a proper demo-workspace card ("Seeded people, live signals, Q ready to talk"), and a SOC 2 / MFA trust row.

**Board palette: everything is a toggle.** In Add card, items already on the board are no longer inert — hovering flips the check to a remove affordance and one tap takes the card off the board. Tools shared with you behave the same way, and each also carries a dismiss control that removes it from your list entirely (and off your board if it was there), with a toast noting the sharer can always reshare. Dismissals persist (`sharedHidden`, localStorage) and only affect your own list — the sharer's Canvas is untouched.

**Canvas understands data now.** The composer runs typo-correction first, then a new viz brain (`parseVizPrompt`). It infers shape from a much wider vocabulary (pie/donut/split → bars, progress/percent → gauge, roadmap/milestones → timeline, history/trajectory → trend…), and — the headline — extracts inline data: "bar chart design 12 engineering 18 product 9" builds labelled bars from those exact numbers; "trend 40, 52, 61, 58 for weekly output" plots your series; "gauge 75% for onboarding completion" sets the dial; "compare design vs engineering" builds a labelled comparison; "timeline of the migration: discovery, build, pilot, rollout" lays out your actual steps. Widgets rendered from your numbers carry a "your data" badge and show real values on bars and tables; reshaping a widget keeps its data. Multi-widget asks work too — "a KPI and a trend for attrition" builds both in one go. When a prompt contains numbers, the widget path takes priority over the ready-made templates so your data always wins.

**Honest caveats.** SVG micro-animations on the login slides run regardless of reduced-motion (matching the pre-existing orbit spin); data extraction is conservative — ambiguous prompts fall back to synthesised values rather than guessing wrong; labels parsed from terse prompts can be plain ("Design · Engineering · Product") and are one rename away in the card header.

## 55. Login polish, Focus relocated, clean landings, and strict per-lens scope (v54)

**Login fixes.** The primary "Sign in" CTA lost its harsh halo bloom for a soft, layered brand shadow that lifts subtly on hover. Carousel text no longer escapes its column — the copy block is width-constrained (`max-w-[34ch]`, `min-w-0`), titles wrap and scale with `clamp(20–26px)`, and the kicker truncates. The reduced-motion caveat is closed: every SMIL animation and CSS ring-spin in the four scenes (and the product mark) now checks `prefers-reduced-motion` and renders a still frame when motion is off, via a small gated `<A>` helper and `spin()` factory.

**Focus moved to the rail.** The Focus entry left the top navigation bar entirely. It now lives on the left rail and, crucially, stays reachable when that rail is collapsed: a dedicated Focus button sits beneath the Now toggle in the slim collapsed column (manager & HR only), pulsing coral when something critical is waiting. The orbit sphere, `f` key and Q intent still open it too.

**Clean landings.** Post-login the workspace opens with both side panels collapsed, so the orbit gets the full stage. Switching lenses lands on that same clean view for the corresponding home (My World / My Team / The Org), and the Reset button returns to it — collapsing panels, closing Q, clearing the board and forcing the Signal view. The app always launches on Signal rather than restoring a prior Board layout.

**Strict per-lens scope.** Suggested prompts are now lens-specific: My World shows only personal time/pay/growth prompts, My Team shows desk/people/insight prompts, The Org shows payroll/org-insight/planning prompts — no cross-lens bleed. Q no longer silently switches lenses to answer. A scope guard wraps the intent brain: if a question belongs to a different lens than the one you're in, Q says so plainly ("That lives in My Team… switch from the top bar, press 2, and ask again there") instead of jumping. Employee-side data boundaries tightened — team/org lookups ("why is Sarah a flight risk", "who is on leave", "approve all pending", "show comp distribution") are refused from My World rather than answered, while an employee still gets a personal to-do summary for "what needs my attention". Explicit "switch to my team" style commands remain the one sanctioned way to change lens.

**Honest caveats.** The demo still lets a single user explore all three lenses via the top bar; in a real deployment those tabs would appear only for the roles a person actually holds, and the guard's "switch from the top bar" wording already hedges with "if you have access". Board-view preference is no longer persisted across sessions (deliberate, to guarantee a clean landing) — it remains a one-tap `b` toggle within a session.

## 56. The premium pass — a full UX/UI/visual audit, and what it changed (v55)

A systematic code-level audit of the whole surface (I can't render in the build sandbox, so this pass audits tokens, states, and interaction code; screenshots remain the calibration loop for pure aesthetics). Verdict first: the foundation is genuinely strong — a disciplined token system (dark "deep water at dusk" + a warm light theme), AA-lifted text ramps, near-solid elevation tiers for legibility, hover-reveal scrollbars, a global focus-visible ring, reduced-motion kill-switch, tabular numerals, and living-background restraint. The audit therefore hunted the small frictions that separate good from premium.

**Found & fixed this round:**
1. **The app shell was unbranded** — the tab still read "My Google AI Studio App", with no favicon, no theme-color, no description. Now: proper title ("Qubryx One — your day, in orbit"), meta description, light/dark `theme-color` so the browser chrome matches the field, an inline-SVG orbit favicon in brand gradient, `viewport-fit=cover` for notched devices, and font preconnects for faster first paint.
2. **Every button showed an arrow cursor.** Tailwind v4's preflight sets `cursor: default` on buttons; nobody had restored it. Buttons, role=button, checkbox labels and summaries now show a pointer; disabled buttons show not-allowed.
3. **No press feedback.** A global `active` scale (0.97) now makes every button respond to touch/click instantly; motion-controlled elements are unaffected (inline transforms win), and `.no-press` opts out.
4. **The unbranded feel of "small things"** — text selection now tints lumen, input carets glow lumen, placeholders use the trace tone consistently, images can't be accidentally dragged/selected, mobile tap-highlight flash is gone, and display headings text-wrap balance.
5. **Hover-only affordances were invisible on touch.** A `@media (hover: none)` layer keeps reveals (shared-tool dismiss, token corner-tabs) visible at ~80% opacity on touch devices.
6. **The nav island could overflow on narrow screens** — it now scrolls horizontally within 96vw with a hidden scrollbar instead of spilling.
7. **Navigation had no motion.** Region and lens changes now replay the stage's spring enter (fade + 0.97 scale + 6px rise), so every transition feels intentional; verified the Cue/Q/chrome sit outside the keyed stage so typed text and chat survive navigation. Reduced-motion gets a plain fade.

**Audited and already strong (no change needed):** focus-visible ring on all interactives; toast placement + `role="status"`; Q panel autofocus and Esc path; panel-scroll hover reveal; light-theme white-overlay remaps; contrast ramps; empty states on board and Focus; keyboard layer from v52.

**Recommendations logged for future rounds (not done here):** sweep the ~60 icon-only buttons for missing aria-labels (many have visible text; a dozen genuinely need labels); consider `scroll-margin` anchoring when Q highlights a region element; a skeleton shimmer for Canvas tool creation (currently instant, so low value); haptics via `navigator.vibrate` on mobile confirms; and hiding lens tabs by held role for production RBAC (noted in v54).

## 57. Screenshot-calibrated: a scalable org graph and a real color language (v56)

First round driven by actual renders. Three fixes.

**The org graph now scales.** The old layout put every report on a single radius-capped ring — sixteen 210px cards fighting over ~1,900px of circumference, hence the pile-up of clipped names in the screenshot. `computeLayout` was rebuilt in two stages: (1) capacity-aware ring seeding — people distribute across up to five concentric rings, each ring accepting only what its Ramanujan-approximated circumference fits at ~one card width of arc spacing, with alternate rings angle-offset so cards interleave; (2) a deterministic collision-relaxation pass — overlapping card boxes push apart along their axis of least overlap over up to 40 iterations, everything clamps inside the viewport, and the centre card never moves. Links draw from final positions. Stress-tested at 5, 12, 16, 24 and 30 reports across viewports from 1100×620 to 1870×760: zero overlapping pairs, zero out-of-bounds, every person placed. (Roster view remains the automatic default past 8 people; the graph is now safe to choose deliberately at any size.)

**Color now means something.** The screenshots confirmed the complaint: Pay glowed ember for no reason, Documents screamed coral over routine signatures, doc cues were grey, payroll cues purple. One semantic hierarchy now governs every colored surface, matching Focus: **coral = act now / at risk · ember = due soon / needs your attention · halo = people & insight domains · lumen = operational domains & healthy state.** Two structural rules: accents are *state-driven*, not decorative (Approvals is ember only while something is pending, Payroll only while pay is pooled, Documents only while signatures wait — each relaxes to lumen when clear); and **coral + pulse is exclusive to the Focus aggregator**, so at most one sphere on a home can scream while domain spheres cap at ember. Applied to all three homes' orbit nodes (with new state flags: manager `planningDue`, HR `buddyDue`, comp-submitted), the Now feed's cue tints, flight-risk person cards (ember → coral, matching their Focus tier), and the constellation's risk links.

**Login, calibrated.** The subtitle no longer orphans ("Sign in — everything picks up where you left off."), and the showcase art grew to 196px with a tighter text gap to absorb the dead space visible under the copy block.

**Honest caveats.** The relaxation pass trades perfect ring symmetry for zero overlaps on crowded/short viewports — the constellation reads slightly organic rather than geometric at 16+, which suits the aesthetic. Very large teams (40+) on very small screens will still crowd; Roster remains the right tool there and stays the automatic default.

## 58. The galaxy org chart, one color truth, and pay behind an eye (v57)

**The org is a galaxy now, not a solar system.** The demo data gained a real hierarchy: Marcus (VP) keeps six directs — Alex, Sarah, David, Elena, Priya and Aisha — while Sarah (Principal Architect) leads a six-person Engineering pod, David leads a four-person Design pod, and Aisha (PM) leads the Data pair; team counts derive dynamically everywhere ("6 reports"). A new `computeOrgTree` lays this out as a tidy top-down chart: subtree widths computed bottom-up, leaf reports stacking into short columns (2–3 tall, escalating to 4 on narrow stages) so wide pods stay compact, lead blocks recursing as their own sub-trees, disconnected roots sitting side by side (the "some or no interconnections" case), and parent→child links drawn as cubic béziers from final positions. Overflow degrades in stages — stack escalation, then collision relaxation, then a clean flow grid as the never-overlap guarantee. Verified zero overlaps and zero out-of-bounds from 1870×760 down to 900×600. The HR Org graph uses the tree; My Team keeps the radial constellation (a single team genuinely is a solar system); Roster remains the automatic default past 8 people.

**One color truth, feed to orbit.** The reported mismatch (Documents blue in the feed, yellow in the orbit; Payroll yellow in the feed, cyan in the orbit) came from cues coloring by *kind* while spheres colored by *state*. Both now speak state: doc and nudge cues are asks → ember, matching the Documents sphere; and the Pay sphere itself now escalates to ember while the person's pay is pooled, mirroring the payroll cue — when the sign-off clears, both relax together. The Roster was the last holdout: "At risk" moved ember→coral (joining the person cards, risk links and Focus tier) and "On leave" moved coral→halo (a people-state, matching the constellation's on-leave dot — leave is not an emergency).

**Pay is confidential by default.** The orbit's Pay sphere no longer prints ₹1.45L — it shows ₹ •••• until revealed. A global `showPay` toggle (persisted) drives it, flipped from an eye button in the Pay sphere's deep panel ("Reveal amounts"), whose tax/percentile rows mask too; the sphere's hint explains the eye. Payslip cards already masked per-card via the existing `Masked` component, and the HR pay river's raw amounts now mask the same way.

**Login chip contained.** "Confirm → send to Marcus" overflowed its pill; the chip widened to 150 and the text is centre-anchored inside it, with the canvas-scene caption nudged down a size in the same sweep.

**Honest caveats.** The tree currently renders for the HR lens; a manager with skip-level teams would want the same view scoped to their subtree — logged as a follow-up. Flight-risk people outside Marcus's directs (Grace, now under Aisha) still appear in the manager's Focus queue — deliberate skip-level visibility for the demo, worth a policy decision later. `showPay` is one global toggle; per-surface auto-re-mask timers would be the production-grade version.

## 59. The Org grows up — audit, lineage, a real pay run, and HR-owned time (v58)

**The audit.** The Org already had strong bones: state-driven spheres, the Focus queue, the galaxy tree + roster, comp-plan approval, an onboarding pipeline with buddy assignment, org documents and analytics, and Q intents for its data. The gaps: the pay screen was decorative (a stream with dots); the org graph offered no way to trace who reports to whom at a glance; the add button ignored what screen you were on; leave-type creation leaked to managers while holidays, allotments and calendar publishing didn't exist at all; and HR couldn't add a person or a joiner from inside The Org.

**1 · Lineage on hover.** Hovering any card in the org graph now traces the chain of command: every connector from that person up through their lead, their manager, all the way to the root lights up lumen with a soft glow, the ancestors stay at full strength, and everyone off the path dims — so "who does Ivan ultimately roll up to" is answered by pointing. Links carry endpoint ids from the layout engine; the lineage set walks `managerId` upward with a cycle guard.

**2 · The river became a command center.** The Pay Run Command Center replaces the decorative stream: a stage rail (Calculated → Anomaly review → Approval → Release) that reflects real state; run totals — headcount, pay day, total net masked behind the global pay eye; the pooled anomaly as a proper coral action card with "Approve correction & release" and an Ask Q chip; a full register (every person, deterministic net, ready/pooled status, masked amounts); a real CSV export (downloads a file; exports MASKED unless amounts are revealed — confidentiality survives the export path); an approve-run button that stays blocked while an anomaly is open; and a history strip of released months.

**3 · The add button knows where it is.** On People (and home) it offers "Add a person to the org" — a proper form (name, role, department, reports-to picker limited to actual leads) whose new person lands in the tree and roster immediately. On Onboarding: "Add a joiner". On Payroll: "Record off-cycle payment" and "Export pay register". On Time & Holidays: "New leave type". Everywhere else HR gets a shortcut to Time & Holidays. Managers keep their leave/matrix options but **lost "New leave type" — that's HR-only now.**

**4 · HR owns time.** A new Time & Holidays region (sphere on The Org home, top-bar pill, Q navigation: "open holidays"): leave types with stepper-editable allotted days per year and an inline form to define new types; the 2026 holiday calendar grouped by kind — national, company, restricted — each addable, removable and badge-coloured (restricted = ember, matching its "choose-carefully" nature); and an announce action. Store gained `holidays` state plus `addHoliday / removeHoliday / setAllot / addPerson / addCandidate`.

**Recommendations logged, not built:** payroll needs a reconciliation view against the previous run (deltas per person); onboarding wants day-one checklists per joiner rather than a single progress bar; policies want a "nudge non-acknowledgers" bulk action; the employee calendar still reads its own seeded holiday list, so admin-added holidays broadcast via toast but don't yet render on My World's calendar (single-source-of-truth refactor is the clean fix); and exit/offboarding remains an empty region concept.

## 60. Phase A — AI explainability: "Why this?" behind every recommendation (v59)

First build responding to the external review, whose sharpest point was that the interaction *grammar* is the moat. Phase A adds explainability without forking anything — it enriches the structured reply shape Q already returns.

**What shipped.** `QMsg` gained an optional `rationale` scaffold — **why · why now · why not (worth noting) · confidence · evidence[]**. Optional means zero regressions: existing replies render unchanged. A new reusable `RationaleDisclosure` renders it as a quiet "Why this?" chevron beneath the reply, expanding to a labelled panel with a confidence dot in the semantic color language (lumen = high, ember = medium, coral = low) and a bulleted evidence list. It sits in both the Q panel and — via `indent={false}` — inside Focus cards.

**Where it's attached (recommendations only, never plain nav):** the flight-risk person lookup and the manager's flight-risk Focus card (evidence = the real attendance/velocity numbers; confidence derived from the actual attendance band, so Sarah at 71% reads "high" and a milder case reads "medium"); the retention-risk reply (score 0.78, attendance ↓22%, backfill cost); auto-assign coverage (the availability/skill/workload match logic, medium confidence because it's a suggestion); and the payroll-pooling reply (the safeguard, the mid-cycle tax-code trigger, human-sign-off caveat). Verified that navigation and other non-recommendation replies carry no rationale.

**The honesty rule, enforced in the data not the chrome:** confidence is computed from signal strength (attendance thresholds, score separation), never a fabricated number; every rationale's "why not / worth noting" states the limit ("a signal, not a verdict"; "I only suggest — never reassign silently"; "will not release on its own"). The confidence footer literally reads "based on the signals above, not a guarantee."

**Honest caveats.** Rationale is authored per-intent, so only the five recommendation classes above carry it today; extending to comp prioritization, review nudges and onboarding is a mechanical follow-up. The evidence strings are composed from live state where available and otherwise from the seeded scenario — genuine for the modelled data, illustrative beyond it.

## 61. Phase B — Discoverability: teach the grammar, don't shrink it (v60)

The review's stated "biggest risk" was discoverability — so many powerful interactions that users may never find them. The review proposed telemetry to measure adoption; we can't honestly ship a dashboard with no analytics backend, so this phase does the two things we *can* do honestly: real design-side levers now, and a clean, clearly-not-connected instrument for a real deployment later. Guiding principle from the review itself: the grammar is the moat, so we make it learnable rather than smaller.

**Lever 1 · Contextual, one-time hints.** Beyond the existing first-run keyboard tip (now also mentioning `?`), landing on the Board or Focus for the first time fires a single, dismissible hint naming the gesture that surface rewards ("drag to reorder, ⋯ to Send elsewhere, build in Canvas" / "work top-down, tap Why this?, swipe to clear"). Each keyed in localStorage so it never nags twice.

**Lever 2 · The gesture legend.** A new on-demand cheat-sheet (`GestureLegend`) names the whole vocabulary in one place — Ask Q, Peel, Stack, Combine, Send to, Expand, Signal/Board, Canvas, Board — each with a one-line definition and how to do it, plus the keyboard map. Reached three ways: the `?` key, a "Gestures" pill in the top bar, and the final tour step (now "See all gestures" instead of a dead-end "Start exploring"). It's a calm card, not a modal wall.

**Lever 3 · Verb-consistency audit.** Swept every surface for gesture-label drift. Finding: the grammar is already consistent where it counts — "Ask Q", "Stack", "Combine", "Send to" are uniform. "Add to board" (palette) and "Send to" (tool routing) are deliberately distinct gestures, so both stay. No forced renames — the consistency the review praised holds up.

**Lever 4 · Teaching empty states.** The empty Board no longer just describes itself — it offers "Build one in Canvas" and "See the gestures" as live buttons, turning a dead end into a lesson.

**The telemetry instrument (honest).** A new `telemetry.ts` taps the store's single dispatch choke-point: every interaction now calls `emit(actionType, 'lens:region')`. It does **not** transmit — events buffer in memory (dev-only console mirror, tagged `[telemetry:not-connected]`), and `connectTelemetry(sink)` is the one-line hook a real analytics service would call. `GRAMMAR_INTERACTIONS` tags the exact gestures the review wants funnel numbers for (peel, combine, stack, boardAdd, vibeCreate…), so "how many users ever Peel" is a trivial query once a sink exists. Verified: events buffer, the sink fires when connected, grammar tagging is correct.

**Honest caveats.** The hints and legend are the real, shippable discoverability work; the telemetry is wired but deliberately inert — no dashboard, no adoption numbers, because those require a backend and a real user base this environment doesn't have. The verb audit is a point-in-time pass; new surfaces should check their labels against the legend's canonical names.

## 62. Phase C — Universal search: type a name, get everything (v61)

The review wanted "Sarah" to surface everything without asking "what did you mean?". Q already resolved people for intents; this makes a *bare entity* a first-class query, as an extension of the NLU — no search index, no new engine.

**How it works.** A search pass sits early in `understand()` (right after the greeting), before any verb-intent. It fires only when the input is a bare noun — no actionable verb, no question word, ≤4 words — so "approve Sarah's leave" and "why is Sarah a flight risk" still route to their intents untouched (verified). A bare "Sarah", "handbook", "earned", or "Diwali" resolves to a profile.

**What it covers.** People (role, department, full reporting line to the root, direct-report count, attendance/velocity, status, pending leave) with a context-appropriate jump action — HR jumps to the org graph, a manager gets a retention-sim shortcut for at-risk reports; documents/policies (version, category, acknowledgment status, jump to Documents + citation); leave types (balance + plan/admin jump); holidays (date, kind, calendar jump).

**Lens scope holds (reuses v54 rules).** An employee searching a colleague is politely refused — My World only exposes your own record and your own manager; anyone else's attendance/pay/risk stays in My Team/The Org. Employees can still look up themselves, their manager, and all non-people entities (policies, leave types, holidays). Managers see reports + leads; HR sees everyone. So universal search never becomes a privacy backdoor.

**Discoverability.** The Cue's rotating placeholder now teaches it ("Search: type a name or policy"), and the employee fallback suggests it.

**Honest caveats.** "Universal" spans the domains we model — people, documents, leave types, holidays — not free-text over arbitrary content; a real deployment would back this with a search index. Matching is substring/first-name based (plus the existing fuzzy name tolerance), so very generic single words could match a document title loosely; the ≤4-word + no-verb gate keeps this rare. Extending coverage to teams, pay runs and onboarding candidates is a mechanical follow-up.

## 63. Phase D — Analytics & timeline reasoning: what moved, and by how much (v62)

The review wanted managers to reason over *time* — timeline, change detection, before/after — not just read current values. Done as a layer on the existing widget/NLU system, not a new subsystem. Delivered across the two planned rounds in one version.

**The snapshot model (data, not architecture).** `METRIC_SNAPSHOTS` seeds 7–8 period-labelled points for each key metric — attrition, headcount, tenure, engagement (org, monthly Dec→Jul) and attendance, pending approvals, flight-risk (team, weekly). Each series carries `goodDown` so Q knows whether a fall is good (attrition) or bad (attendance). A small framework-free `analytics.ts` computes period-to-period and span deltas (`computeDelta`, with a `back` of 1 for "vs last" or 3 for "this quarter"), ranks movers (`whatChanged`), and narrates them (`narrate`) with correct direction-of-good language.

**Change-detection intents (qbrain).** Manager/HR only, lens-scoped to team vs org metrics. "What changed this week / this quarter?" returns the top three movers as narrated bullets with the raw before→after numbers as evidence. "How is attrition trending?", "attendance trend", "headcount over the last quarter" narrate a single metric's delta ("Voluntary attrition is down 0.4pts since Apr, −36% — improving"), route to Insights, and pin the matching trend chart to the board. Every analytics reply carries a Phase-A rationale (why / evidence = the actual period readings / confidence from flatness). Verified: correct good/bad framing (attrition↓ improving, attendance↓ worth watching), quarter vs week spans, and no hijack of verbs or of the employee lens.

**Widget deltas & before/after (round 2).** The trend widget now renders a before→after summary under the sparkline — first value → last value with a ▲/▼ percent-over-period badge (lumen up / coral down) — so timeline reasoning is visible on the card, not just in prose. Canvas gained a metric-trend path: "trend attrition", "attendance over time", "engagement trend" build a trend widget seeded with the *real* snapshot series (labels + values), so the before/after badge and axis labels come from actual history. The KPI widget's existing period-over-period delta is unchanged. Analytics suggestions were added to the manager and HR Cue groups.

**Honest caveats.** The snapshots are seeded history (7–8 points), enough to reason over convincingly but not live-computed from a warehouse — a real deployment would populate `METRIC_SNAPSHOTS` from its data pipeline; the shapes and all the reasoning on top are production-ready. Change detection covers the seven modelled metrics; adding a metric is one array entry plus (optionally) one regex. "Why it moved" is deliberately not claimed — Q narrates *what* moved and flags where to look, and says so in the rationale.

## 64. Phase E — Memory: Q picks up where you left off (v63)

The final review phase. The review wanted Q to remember conversations so it "feels like a colleague." Built demo-grade and labelled exactly as that — device-local, not a server-backed profile.

**What it does.** A new `memory.ts` persists a small set of *threads* (what you were looking into) to localStorage, per lens. A conservative topic extractor records only real lines of inquiry — it skips greetings, bare nav ("show…", "open…"), and one-word turns, pulling a subject ("Sarah", "coverage", "attrition") from the phrasing. Revisiting the same topic bumps its count rather than duplicating.

**Where it surfaces.**
1. **Recall chip** — when Q opens on an empty log and a thread exists from a *prior* session (guarded to ≥60s old, so it never echoes the conversation you're mid-way through), a "Pick up where you left off — last time you were looking at Sarah's flight risk" chip appears above the suggestions; tapping it re-asks. Reuses the existing suggestion-chip language.
2. **Entity-scoped note in search** — searching a person you've looked into before appends "(You looked into Sarah before — flight risk.)" to the profile, tying Phase E to the Phase C search.

**Privacy honesty, built in.** Settings gained a "Clear Q's memory" control whose subtext states plainly that threads are stored only on this device. The module header and every doc reference say the same: this is device-local demo memory, not cross-device colleague-memory — that remains a backend concern. Nothing is transmitted.

**Verified:** topic extraction skips greetings/nav, threads store and dedup (revisit bumps count), the 60s recall guard works, entity lookup returns prior threads, and clear empties the store.

---

## The review response, complete (Phases A–E)

All five actionable review items are now shipped, each extending an existing subsystem rather than forking the architecture — the point the review itself landed on:
- **A · Explainability (v59)** — "Why this?" scaffold on recommendations.
- **B · Discoverability (v60)** — hints, gesture legend, teaching empty states, honest telemetry stub.
- **C · Universal search (v61)** — bare entity → profile, lens-scoped.
- **D · Analytics/timeline (v62)** — snapshot model, change detection, before/after widgets.
- **E · Memory (v63)** — device-local thread recall.

The two things the review asked for that can't be honestly built here — a live telemetry dashboard and cross-device memory — were addressed at the honest boundary: a wired-but-inert telemetry emit point, and device-local memory clearly labelled as such. Both are one integration away for a real deployment.

## 65. Backlog 1 — Calendar single source of truth (v64)

The honest caveat from v58 is closed: HR-added holidays used to broadcast via toast but never appear on My World's calendar, because the employee calendar read its own static seed list while `holidays` state lived separately.

**The fix.** A new `holidaysToEvents(holidays)` in data.ts is the single projection: it parses each holiday's "4 Aug"-style date against the visible month window, maps national/company → the `holiday` event kind and restricted → `rh` (choose-carefully), and skips anything outside the Jun–Sep window silently. The Calendar component now builds its event list from the static non-holiday events (birthdays, offsites, leave) **plus** `holidaysToEvents(w.holidays)` — so the live HR-managed list is the only source of holidays anywhere. Add a holiday in Time & Holidays and it lands on the employee calendar (grid, tooltip, month detail) immediately; remove one and it's gone.

**Q follows suit.** A new next-holiday intent reads live `holidays` state ("Your next holiday is Foundation Day on 4 Aug (company). There are 6 on the calendar, including 2 restricted days you choose from") instead of a hardcoded answer — so it reflects HR's edits too.

**Verified:** derivation projects company/national → holiday and restricted → RH, an HR-added Sep date appears, and out-of-window dates skip without error.

**Honest caveats.** The employee-home "week ahead" rail still uses its own small seed list for the next few days — cosmetic, and a mechanical follow-up to route through the same projection. The visible calendar window is Jun–Sep (demo scope); holidays outside it are stored and counted by Q but not drawn until the window widens.

## 66. Backlog 2 — Payroll reconciliation: run-over-run, with reasons (v65)

The Pay Run Command Center could show the current run but not answer "what changed since last month, and why" — the reconciliation gap. Now it does.

**A previous run to compare against.** A deterministic `prevNetFor` reconstructs last month's net per person so deltas are stable: three people show a merit increase (~8% up), two had a one-off bonus last month that isn't repeating (so they're down this run), one had a leave-without-pay deduction that reversed out, one is a new joiner with no prior run, and everyone else is unchanged. Each delta carries an inferred `reason`.

**The reconciliation tab.** The register section is now tabbed — Register / Reconcile (the tab badges the number of changed lines). Reconcile leads with a roll-up: Jun total → Jul total with the run-over-run delta (ember if pay rose, lumen if it fell), and "N lines changed · M steady". Below, only the movers, each showing its reason ("Merit increase applied this cycle", "One-off bonus last month, not repeating", "Leave-without-pay deduction reversed") and the before→after with a signed delta. New joiners are called out in their own tinted rows. All amounts obey the global pay-visibility eye — deltas mask too. A footer line drives the principle home: every delta traces to a reason, nothing changes silently.

**Q narrates it.** "Why did payroll change this month?" / "reconcile payroll" opens the view and summarises the movers by cause, with a Phase-A rationale (evidence = the grouped counts). Added to the payroll add-menu ("Reconcile vs last run") and HR suggestions.

**Honest caveats.** The previous run is reconstructed deterministically from the current one, not read from a stored prior run — a real deployment compares two actual persisted runs; the view and reason model are production-shaped. Reason inference here is rule-based over known cases; a real system would derive reasons from the pay components that actually changed (earnings, deductions, tax).

## 67. Backlog 3 — Per-joiner onboarding checklists (v66)

The onboarding pipeline showed a single arbitrary progress bar per candidate. It now runs on a real day-one checklist per joiner — progress is derived, not decorative.

**The model.** Each candidate carries a `checklist` of `OnbChecklistItem`s built from a standard `ONBOARD_TEMPLATE` (eight day-one items: offer & background, device, accounts/access, buddy, payroll & tax, handbook, first 1:1, security training). Every item names its `owner` — IT, People Team, Manager, or the Joiner — and `progress` is now computed from how many items are done, so there's no separate number to drift out of sync. Seeded joiners carry role and start date too (James · Backend · 4 Aug at 2/8; Liam · Design · 11 Aug at 4/8; Aisha · Data · 18 Aug at 7/8).

**The UI.** Each joiner is a card: avatar, role and start date, a "New" tag if untouched, a derived progress bar (done/total), then the checklist itself — tappable items that tick/untick with a strike-through and an owner tag colour-coded by who acts (IT lumen, People halo, Manager ember, Joiner mist). The buddy selector remains and now, when you assign a buddy, auto-ticks the "Start buddy assigned" item and recomputes progress. Toggling any item flows through a new `toggleJoinerTask` store action that flips it and recomputes the percentage.

**The rest follows the data.** The HR home Onboarding sphere shows the real pipeline count and a deep panel with the closest joiner and how many still need a buddy; Q's onboarding answer narrates live counts ("3 joiners in the pipeline; Aisha is furthest along at 90% of their day-one checklist. 0 still need a buddy."); and adding a joiner from the add-menu now seeds a fresh empty checklist.

**Honest caveats.** The checklist template is one standard list for everyone — a real system would vary it by role, location and employment type. Ticking items is a local state change; a production version would notify the owner and gate items on real signals (device MDM enrolment, e-sign completion) rather than a manual check. The joiner's own My World first-week checklist (the employee-side view) still reads its own task seed — unifying it with this HR-side list is the natural next step.

## 68. Backlog 4 — Policies: nudge every non-acknowledger (v67)

Published, ack-required documents showed how many had acknowledged but gave HR no way to chase the rest. Now there's a one-tap bulk nudge.

**The action.** A new `entityNudge` store action computes the expected audience for a published ack-required doc (org = everyone, team = the manager's reports, person = one), subtracts who's already in `ackedBy`, and nudges the remainder. If the current viewer is themselves a non-acker of a doc that targets them, their acknowledgment cue is re-surfaced in The Now; the action is logged to the activity feed ("Nudged 8 non-acknowledgers of …") and toasts the count. If everyone has acknowledged, it says so instead of sending an empty nudge.

**Where it appears.** In Org documents (`TeamDocs`), each published ack-required card now shows "N of M acknowledged" and, when anyone's pending, an ember "Nudge N pending" button. HR's add-menu gained "Nudge non-acknowledgers", and Q handles "remind those who haven't acknowledged" / "chase pending acknowledgements" / "who hasn't signed the handbook" — summarising how many docs need ack and roughly how many people are pending, with a "Nudge all N pending" action that fires the bulk nudge across every pending doc. Added to HR suggestions.

**Honest caveats.** Audience size is derived from the modelled org (org/team/person), not a real distribution list, and "nudge" here re-surfaces the in-app cue + logs the action rather than sending email/Slack — a real deployment wires those channels. One phrasing ("nudge everyone…") trips the lens-scope guard's team-keyword detection and gets redirected; the other phrasings and the button work, so it's a minor NLU edge, noted for a later scope-guard refinement.

## 69. Backlog 5 — Offboarding / exit region (v68)

The `exit` region existed as a type but rendered nothing. It's now a full HR surface — the dignified mirror of onboarding.

**The model.** A `Leaver` type and a standard `OFFBOARD_TEMPLATE` of eight exit steps, each with an owner (People Team, Manager, IT, Finance). The ordering encodes a clean exit: resignation acknowledged → knowledge transfer → reassign work → assets returned → exit interview → final settlement → **access revoked** → alumni record. Progress derives from completed items. Two leavers are seeded (Tomas, resigned, 29 Aug; Chloe, contract end, 12 Sep).

**The UI.** Each leaver is a card: avatar, role, last day, a reason badge (colour-coded — resigned ember, contract-end halo, retirement lumen, involuntary coral), a derived progress bar, and the exit checklist with owner tags. A safeguard enforces the ordering — the "Access & accounts revoked" item is locked (and warns) until knowledge transfer and asset return are done, so access never gets cut before handover. A "Start offboarding" control opens an inline form to move any active person into offboarding with a reason and last day, seeding a fresh checklist. An empty state covers the common case of no one leaving.

**Wired throughout.** New store state `leavers` with `toggleExitTask` and `startOffboarding`; an HR home Offboarding sphere (ember when anyone's leaving, with a deep panel showing the next exit and average progress); an "Exits" top-bar pill; a Q intent ("who is offboarding", "exit checklist") that narrates live counts and the next leaver; the add-menu and an HR suggestion.

**NLU fixes this required.** "Offboarding" was being typo-corrected to "onboarding" by `fuzzyFix` (one edit apart) — added it plus leaver/resignation to the lexicon so it's preserved. The HR onboard intent used a loose `/onboard/` that also matched "offboarding" — tightened with a negative lookbehind. And the generic `/(team|report|who)/` catch-all was shadowing "who is offboarding" — the exit intent now sits before it. All three onboarding/offboarding/team routings verified independent.

**Honest caveats.** The access-revocation lock is a sensible demo guard, not a real IAM integration; "start offboarding" adds a leaver record but doesn't remove the person from the org graph (they remain until their last day — arguably correct, but there's no scheduled transition). Reasons are a fixed set; a real system would capture notice period, rehire eligibility and more.

## 70. Backlog 6 — Production RBAC: lens-gating by role (v69) · backlog complete

The demo let one user switch all three lenses freely. Real deployments need lenses gated by the signed-in user's role. That structure is now in place.

**The model.** State carries `role` (employee / manager / hr) and a derived `availableLenses`, via `lensesFor`: an employee sees only My World; a manager sees My World + My Team; HR/Admin sees all three. The default demo user remains HR/Admin, so nothing about the existing experience changes unless a narrower role is selected — but the gating is now real, not cosmetic.

**Enforced everywhere lens changes can happen:**
- The top bar only renders the tabs the role permits.
- The `lens` reducer action refuses a switch to an unavailable lens (with a "not available for your role" toast), so the 1/2/3 keyboard shortcuts are safe automatically — pressing 3 as an employee does nothing but explain.
- The Q scope-guard is RBAC-aware: asking about something in a lens you *can* reach says "switch to it"; asking about a lens your role can't reach says "your role doesn't have access" instead of misdirecting you to a tab that isn't there.

**Demo affordance.** Settings gained a "Role & access" section with three role buttons (Employee / Manager / HR-Admin) so the gating can be previewed live; the choice persists. In production this binding comes from the identity provider, not a settings toggle — noted in the copy itself.

**Honest caveats.** This gates *lenses* (the three top-level scopes); finer-grained per-region or per-action permissions (e.g. a manager who can view comp but not edit it) are a deeper permission model layered on top. The role is device-local demo state; real RBAC is server-enforced and must never be bypassable from the client — the client gating here is UX, and a real backend would enforce the same rules on every request.

---

## Backlog complete

All six logged backlog items are shipped (v64–v69): calendar single source of truth, payroll reconciliation, per-joiner onboarding checklists, policy nudge-all, offboarding/exit region, and RBAC lens-gating. Combined with the five review phases (v59–v63), The Org lens and the cross-cutting systems are now substantially complete. Remaining ideas are all "real-deployment" concerns explicitly deferred with honest caveats: a telemetry sink, cross-device memory, a search index, live metric warehouse feeds, IAM/e-sign integrations, and server-enforced RBAC.

## 71. Visual paradigm — peel animation, closeable orbit, icon language (v70)

Three interaction/visual upgrades toward a reusable paradigm, not just an HRMS.

**1 · Real peel (Layer 2 only).** The peel now physically lifts the face from its top-right corner — the same corner the ScanEye control lives in — with a perspective rotateX/rotateZ + translate + shadow, revealing the raw-AI Layer 2 beneath it. Layer 1 (expand) stays an accordion by design, so "tell me more" (expand) and "show me the machinery" (peel) feel distinct. Reduced-motion / Plain mode falls back to a crossfade. Implemented in `TokenFrame`: deep layer establishes card height when `isPeeled`; the peeling face is an absolute overlay animated out via AnimatePresence.

**2 · Closeable orbit + persistent re-add.** Orbit nav spheres now honour the existing close (×) control (they render through `TokenFrame`, which already had it) and dispatch `hide(key)`; `HomeOrbit` filters `w.hidden` before layout so the constellation re-relaxes around the gap. Closed spheres persist per-user via a dedicated `q_closed_spheres` localStorage key (only sphere keys persist — transient token hides stay session-only, guarded by `SPHERE_KEYS`). The +Add menu's restore path is relabelled "Closed cards", shows each closed sphere with its concept icon and a friendly label, and re-adds via `unhide`. Regions stay reachable via Q and the top bar, so closing declutters without losing access; the centre hub is never closeable.

**3 · Visual token language (icon registry).** New `src/icons.tsx` is the canonical registry: one glyph + one size role + one semantic tint per concept (46 concepts). Size roles — hero (30px, orbit/empty states), card (20px, panel tokens / list rows), inline (14px, chips) — encode "the more spatial the context, the more the icon leads and text recedes." `ConceptIcon` binds glyph to the state tint, with a `tintOverride` so a person-at-risk keeps the person glyph in coral. Applied across all four tiers: orbit spheres are now icon-first (hero glyph on top, label + value beneath); the +Add restore rows, Calendar leave-type buttons, and TimeOffAdmin rows are icon-led (card size). This registry is the portable core — retargeting the paradigm at another domain means swapping CONCEPT entries; size roles and tint binding stay.

**Honest caveats.** Un-peel crossfades back rather than reverse-peeling (the peel-away on open is the delightful moment; a full reverse animation is a follow-up). The icon rollout covered orbit + the highest-traffic secondary rows; person/payslip faces keep their avatars (a person *is* their avatar) rather than a generic glyph. A full sweep of every remaining list on every secondary page is incremental follow-up work.

## 72. Orbit sphere layout — revert to horizontal, larger icons (v71)

Screenshot review of v70 showed the hero (icon-over-label-over-value) sphere layout read as crowded and boxy. Reverted to the original horizontal layout (icon chip left, label + value right) but with a larger icon: chip grown from w-8/h-8 to w-11/h-11 and the glyph from the old 16px to the registry `card` size (20px). Keeps the compact, elegant sphere while making icons more prominent as requested. Everything else from v70 (peel, closeable orbit + persistence, icon registry, secondary-page icons) unchanged.

## 73. Peel toggle, document viewer, calendar overhaul (v72)

Three review-driven improvements.

**1 · Peel icon toggles (show/hide-password metaphor).** The peel control now toggles peel/un-peel, stays visible while peeled (so it can close), and shows a struck-through eye (ScanEye + a diagonal line) when active — reading like a password reveal toggle. `w.peel(isPeeled ? null : id)`.

**2 · Document viewer + better cards + type icons.** New `DocumentViewer.tsx` overlay: focused reading pane with the category icon, metadata, a readable policy-styled body (synthesized from the summary; a real deployment renders the stored file), and Ask-Q / Download / Acknowledge actions. New `docView` state + `openDoc` action. Document cards reworked: a prominent category-tinted icon leads, cleaner header, and a "Read" button opens the viewer. Icon registry gained document-category concepts (Handbook→BookOpen, Policy→ShieldCheck, Benefits→HeartHandshake, Compliance→Scale, plus announcement/note/goal) and a `docConcept()` resolver.

**3 · Calendar overhaul (three fixes).**
- *Attendance markers*: new seeded `dayStatus(m,d)` (present/absent/leave/weekend/none, future→none) drives a status dot on detail-grid cells and a coloured ring under ribbon dots, with legends. Seeded leave/absent days take priority over the weekend pattern.
- *Layout decoupled*: replaced the single clipped scroll (calendar+context+composer scrolling together) with a two-column grid on ≥lg — calendar+context scroll independently on the left; the leave composer is a sticky right rail that never scrolls away. Stacks on narrow screens.
- *Leave flow*: a prominent balance card (selected type, days, and "after this" remaining with over-balance warning); half-day now offers a 1st-half (AM) / 2nd-half (PM) choice carried into the request; clearer step numbering and a summary line.

**Honest caveats.** Attendance history and the document body are seeded/synthesized for the POC — both map to real service reads in the enterprise product. Un-peel still crossfades (peel-away is the animated moment).

## 74. The Workspace — spatial notes, lists & to-dos (v73, Phase 1–2)

A third home view alongside Signal and Board, available to all three personas — a spatial canvas you author in.

**Mode & surface.** `homeView` gains `'workspace'`; the ModeSwitch is now three buttons (Signal / Board / Workspace) and the `b` key cycles all three. The Workspace surface is a dot-grid canvas where items are absolutely positioned, draggable anywhere via Motion drag, and **snap to a dense 24px invisible grid** (nearest point) on drop. Bring-to-front on interact via a z-counter. An empty state teaches the "+ Add" affordance.

**Data model.** One unifying `WorkspaceItem` (types.ts) with a `kind` discriminator (note / list / todo), carrying id, lens, owner, title, custom `color`, `pos{x,y}`, `z`, and kind-specific content. Plus `WsConnector` (for Phase 3). State: `wsItems`, `wsConnectors`, `wsZ`; reducer actions wsAdd/wsUpdate/wsMove/wsDelete/wsFront; **persisted per-user** to `q_wsitems` / `q_wsconn`. Items are lens-scoped so each persona has its own workspace.

**Every item:** color-coded by kind (note ember, list lumen, todo halo) with a custom-color picker (8 swatches + native color input), inline title rename, and delete. Full CRUD throughout.

**Note (rich text):** contentEditable with a formatting toolbar — bold, italic, highlight, bulleted/numbered lists, four font sizes, six font colors, and **5 fonts** (Inter + Work Sans sans, Lora + Playfair serif, JetBrains mono — added to the font import and as `ws-font-*` classes).

**List:** bulleted or numbered, with **nesting** (Tab / Shift-Tab to indent, up to 4 levels) and depth-varied sub-bullet markers (•/◦/▪ or 1./a.). Enter adds an item, Backspace on empty removes. CRUD per entry; no timer/complete (per spec).

**To-do:** entries with an optional **deadline date and/or timer** (minutes), mark done, **deprioritize (send to bottom)**, delete, edit, add. Each entry supports **sub-tasks** (bulleted or numbered, individually checkable) and shows a **per-entry progress bar** derived from sub-task completion.

**Honest caveats.** Persistence is device-local per user (enterprise = a real service). Phases 3–6 (FlowBoards/connectors, Q & app integration, Signal/panel routing per item, sharing, Canvas synergy for Team/Org) are the next milestones — the connector model and sharing fields are already stubbed in the type.

## 75. Workspace FlowBoards — connectors & grouping (v74, Phase 3)

Notes, lists and to-dos can now be linked into flowboards (mindmap / flowchart style), à la FigJam/Miro.

**Connecting.** Each card shows a connect handle (right edge, on hover); press and drag from it to another card to link them. A live dashed bezier follows the cursor; the target card highlights with a lumen ring; releasing over it creates the connector. Card dragging is disabled during a connect-drag so the two gestures never collide.

**Connectors.** Rendered as SVG bezier paths *beneath* the cards, meeting each card at its border (edge-point math, not center-to-center), with an arrow dot at the target and an optional mid-path label. Click a connector to open its inspector: rename (label), recolor (4 presets), or remove. A generous transparent hit-path makes thin lines easy to click.

**FlowBoards (soft grouping).** Connecting two items unifies their `flowboardId`; connecting across two existing boards merges them. Members show a small "board" badge and a tinted outline. Disconnecting or deleting recomputes membership as connected components (`recomputeFlowboards`), so a card linked to nothing becomes free again automatically — no orphaned groups. This keeps the flowboard a *soft* grouping (shared id + connectors), not a hard container, which sets up item 7's rule cleanly (a single item is portable; a whole board is not) for Phase 4.

**Store.** New actions wsConnect / wsDisconnect / wsConnUpdate; wsDelete now also recomputes flowboards. Connectors persist per-user (`q_wsconn`); flowboardId lives on the item so it persists too.

**Honest caveats.** Connectors are straight-ish beziers (no manual routing / waypoints yet). Sending a single item to Signal / the right panel, and the "whole board can't be sent" enforcement, land in Phase 4 along with drag-to-Q. Still device-local per user.

## 76. Workspace items → Q & Signal (v75, Phase 4)

Single workspace items are now portable: to Q for AI action-items, or to the Signal feed. A whole flowboard is not (item 7).

**Ask Q for actions (item 10).** Each card's ⋯ menu has "Ask Q for actions". Q extracts the item's text (`wsItemText` — strips note HTML, joins list/todo entries) and runs `wsActionItems`, a content scanner that detects app-relevant intents and proposes concrete next steps wired to real features: mentions of leave/PTO → open the leave planner (calendar); meeting/1:1/review → Growth; policy/document/sign → Documents; pay/comp/bonus → Payroll; deadline/due/urgent → suggests making a dated to-do. Q replies with the content summary + bulleted suggestions, the first actionable one bound to its nav action, plus a rationale. Empty items get an honest "still empty" note.

**Send to Signal (item 7).** The ⋯ menu's "Send to Signal" adds the item to the Signal home view as a pinned card (new `nowBoard` type `'ws'`), shown by the new `WsSignalPins` strip (top-right of the signal home): title, a kind-aware preview (note excerpt / first list items / todo done-count), an "Ask Q for actions" shortcut, open-in-workspace, and unpin. Board grid and NowBoard now exclude `'ws'` items so they only appear in Signal.

**Flowboard gating (item 7).** "Send to Signal" is disabled for any card that belongs to a flowboard, with an inline "detach to send a single card" hint — enforcing that a single item is portable but a whole board is not. `wsToSignal` also guards this in the reducer (belt and suspenders).

**Honest caveats.** "Right panel" from the original ask is realised as the Signal pin strip rather than a separate dock (the persona right-panel is context-specific); can split later if wanted. Q's action-items use keyword intent detection (deterministic, on-device) — accurate and explainable, but not a full LLM parse. Still device-local per user.

## 77. Workspace refinement — handles, infinite canvas, connectors, timers (v76)

Screenshot-driven overhaul of the workspace, addressing overlapping controls, no resize, clipped/broken connectors, erratic snapping, and weak timers.

**1 · Card chrome + corner-handle grammar.** Cards now use the same projected corner-tab grammar as tokens: top-left = move (drag via `useDragControls`, initiated from the handle only), top-right = close, bottom-right = resize, bottom-left = send/share menu. All are `-2.5` glass-elevated tabs revealed on hover — consistent with the established token pattern. Header decluttered (kind icon + title + color only; the crowded inline toolbar buttons no longer collide). Cards are now **resizable** (drag the resize handle; min 200×120; body scrolls when smaller than content; snaps size to grid on release).

**2 · Connectors reworked (Miro/FigJam-style).** Four **anchor points on every side** (top/right/bottom/left), visible on hover, no longer clipped (moved inside the card frame with proper offsets). Drag from any anchor to any card; the target auto-picks its nearest facing side. **One-to-many** works (multiple connectors per source; only exact duplicate pairs are blocked). Connectors are true side-aware beziers that leave each anchor perpendicular. **Arrowheads** are toggleable at either or both ends (per-connector `arrowStart`/`arrowEnd`, default end-arrow) via the inspector, alongside label + color + remove. Fixed the "can't add connector" bug — the connect gesture now tracks on the surface with live target-highlighting.

**3 · Infinite canvas + better snapping.** The surface is now a **pannable infinite canvas** — drag empty space (or the grid) to pan; a Recenter button returns to origin; the dot grid scrolls with the pan. Cards live in world coordinates. **Snapping** is now visible: while dragging, dashed lumen guide lines show the target grid position, and the card snaps to the 24px grid on drop (deterministic, no more erratic jumps).

**4 · To-do timers.** Adding a timer now shows a **prominent live countdown** (mm:ss) with play / pause / reset. It **ramps colour** healthy→due-soon→urgent (lumen→ember→coral) as time runs down and **pulses** with a glow in the final 20%. Deadlines render an urgency chip (Nd left / Due today / overdue) that colour-shifts and pulses when imminent or past.

**Honest caveats.** Zoom isn't in yet (pan only) — a natural follow-up. Timer state is per-entry in local state + persisted fields; it counts only while the card is mounted. Connector routing is side-aware bezier, not full orthogonal path-finding. Still device-local per user.

## 78. Workspace re-engineered — coordinate fix, uniform grammar, single-row toolbar (v77)

Senior-level rebuild fixing the root causes behind drag-fly-away, broken connectors, the connect error, and layout collisions.

**Root cause & fix.** The prior version mixed Motion's transform-based drag with absolute positioning *inside a pan-translated parent*, so `info.offset` (screen space) and the transformed world layer compounded — cards jumped far away and connector hit-tests missed. Rebuilt on a **single, explicit coordinate system**: cards are plain absolutely-positioned divs at `screen = world + pan`; all gestures (pan, drag, connect, resize) are **manual pointer handlers** sharing one `gesture` ref with pointer capture on the surface. Drag computes `snap(origin + (client − start))` in world coords — the card tracks the pointer 1:1, no drift. Verified the math end-to-end.

**Connectors fixed.** One SVG spanning the viewport, translated by `pan` to match card space exactly. Anchors, hit-testing, and paths all use world coords. The connect gesture no longer throws (guarded refs, capture on the surface). Four-sided anchors, one-to-many, side-aware beziers, arrowheads (either/both ends) and the label/color/remove inspector all retained and now reliable.

**Uniform corner grammar.** Every workspace card uses the token corner-tab pattern in fixed positions: **top-left = move, top-right = resize, bottom-left = send/share, bottom-right = CLOSE** — the close corner is now uniformly bottom-right across tokens and workspace cards. The whole header is also a drag zone (press-drag anywhere on it), with interactive bits marked `data-nodrag`.

**Single-row note toolbar.** Collapsed the wrapping two-row toolbar into **one row with nested dropdowns**: B / I / highlight inline, then Lists ▾, Size ▾, Colour ▾, Font ▾. No more overflow onto a second row.

**Layout fixes.** The Add control moved to a **floating pill at bottom-center** of the canvas — no longer colliding with the left Signal panel. Recenter sits beside it when panned.

**Honest caveats.** Zoom still pending (pan only). Timer counts while mounted. Connector routing is side-aware bezier, not orthogonal path-finding. Device-local per user.

## 79. Workspace — toolbar fix, light mode, FlowBoard sections, context-aware + (v78)

**1 · Note toolbar fixed + per-card light mode.** The dropdown toolbar regression is fixed: the root cause was contentEditable losing its selection when a toolbar control took focus. Now the note editor saves the selection Range on every key/mouse/input event and restores it before each `execCommand`, so bold/italic/highlight/lists/size/colour/font all apply to the intended text again. Added a per-card **light mode** toggle (Sun/Moon in the header) — flips that card to a light surface via a `ws-light` class overriding the theme vars, for accessibility/contrast. Persists per card.

**2 · FlowBoard sections (Figma-like).** Connecting two cards now draws a titled dashed **section** around the group that auto-fits its members (bounds recompute as cards move/resize). The section header offers **rename** (inline), **organize** (LayoutGrid — tidies members into a connection-ordered grid, roots first), and **close** (deletes the board and its cards). Dragging the section header **moves all members together**. Connecting an internal card to an external one pulls the external card into the board (existing flowboard-unification), and dragging a card in then connecting also works. **Confirmation modal** now guards deletion of both flowboards *and* individual cards (the card close handle routes through the same modal).
Judgment call: dropped the separate "scale" handle — the section auto-fits its members, so a manual scale added complexity without clear value; drag + organize + rename + close cover the real needs. Flagged for veto.

**3 · Context-aware global +.** The existing floating + (ContextualAdd) is now **mode-aware** on the home region, on top of its lens/region awareness: Workspace mode → New note / list / to-do (adds to the canvas); Board mode → Build a tool in Canvas + Shared with me; Signal mode → persona-appropriate quick actions (employee: apply leave / compare people; manager+hr: add leave for someone / availability matrix). Extends across all three personas. The in-canvas Add pill is kept as the ergonomic primary (it places at viewport center); the global + is the consistent secondary entry.

**Honest caveats.** Kept both the in-canvas Add pill and the context-aware + (not strictly one button — different placements, both useful; easy to collapse to one if preferred). Flowboard "scale" handle intentionally omitted. Light mode is per-card and persisted. Still device-local per user.

## 80. Workspace polish — universal +, working toolbar, flowboard handles, timer UX (v79)

Nine review fixes.

1. **Removed the in-canvas Add pill** (both here and Board earlier use the universal + now). Adding a card is exclusively via the context-aware + button; only a small Recenter utility remains on the canvas when panned. New cards stagger so they don't stack.
2. **Note toolbar fixed** — root cause was selection loss; now tracked via a global `selectionchange` listener with `styleWithCSS` on and selection restored before each `execCommand`. Dropdown caret arrows moved to the **right** of each group label and menus open right-aligned.
3. **Flowboard uses the four-handle grammar** (matching cards): TL drag · TR organize · BL close (confirm modal) · BR scale. Removed the header organize/close buttons; the title stays inline top-left with rename.
4. **Flowboard scale** added (BR handle grows the section padding so you can enlarge it after organizing). **Organize rewritten** as a hierarchical layered layout: roots first, columns by arrow direction/depth (longest-path layering), rows spaced by actual card size — no more overlap. Connectors always render above the section.
5. **Light mode**: header background lightens and the card title switches to a dark palette tone for readability.
6. **Timer/date UX**: replaced the broken number input with a **preset stepper** — off → 1,2,3,4,5,10,15,20,25,30,45,60,75(1h15)… up to 4h, with clear buttons; date has an inline clear too.
7. **Prominent countdown**: the running timer is now a large full-width readout (26px mono) that colour-ramps healthy→ember→coral, pulses and glows in the red phase, and plays a **subtle WebAudio double-beep** while urgent and at zero (silenced under reduced-motion).
8. **Board cards adopt the close handle** — dedicated top-right X replaced by the projected corner close tab (hover-revealed), consistent with the token/handle grammar across personas.
9. **Confirm modal is now full-screen** (fixed inset-0), fixing the partial overlay.

**Honest caveats.** Flowboard scale grows padding (visual room) rather than repositioning cards; organize moves cards. Timer sound uses WebAudio and needs a prior user interaction in some browsers to play. Board masonry cards keep grid-reorder drag (close handle added, full move/resize grammar not applicable to a reflowing grid). Device-local per user.

## 81. Workspace fixes + Signal clockwise pins + timer redesign (v80)

1. **Note toolbar finally fixed** — root cause was the card body's `overflow-auto` clipping the dropdown menus. Toolbar now sits in a `shrink-0` row outside the scroll; dropdown menus render at **`position:fixed`** coords from the button rect (escaping all clipping), and `runCmd` falls back to select-all when no range was saved so buttons work even before you click into the text.
2. **Light-mode title** — header now uses a saturated accent background in light mode and the title/icon switch to white for contrast.
3. **Anchor click vs drag** — clicking an empty anchor (quick tap, <300ms, no travel) opens a **mini-menu** to *add & connect* a note/list/to-do (with a close button); click-and-drag is the usual connector. New store action `wsAddConnected(fromId, side, kind)` creates the card off the chosen side (opposite-side connector, joins/creates the flowboard).
4. **Timer redesigned** — replaced the flat chip with an elegant **radial progress ring** (time centered), a status label (Counting down / Timer ready / finished), and pill Start/Pause/Reset controls; colour ramps healthy→ember→coral, glows and gently pulses in the red phase (keeps the red-phase sound).
5. **Signal pins reworked** — cards sent to Signal now fill the empty corners **clockwise from top-left** around the orbit (never under the right panel), each with corner handles (open-in-workspace / close) and a **live timer preview** for to-do cards (mini countdown that ticks and colour-shifts).
6. **Board**: removed the Add-card pill — board cards are now added from the universal **+** (persona palette moved there); fixed corner-handle clipping with grid padding.

**Honestly deferred.** Board still needs the full handle set (drag/scale/share beyond close) and the workspace snap-grid — that's a genuine architectural conversion of the masonry grid into a free snap-canvas (mirroring Workspace). I've done it right in Workspace and will port it to Board as a focused next step rather than rush it alongside these fixes and risk regressions. Timer sound needs a prior interaction in some browsers; pins cap at 6 slots.

## 82. Toolbar root-cause fix, Signal buffers, board menu + handles (v81)

1. **Note toolbar — two real root causes found.** (a) The card body's `overflow-auto` was clipping the dropdown menus so they never appeared; note cards now use `overflow-visible` and dropdowns render inline under each button. (b) The card's `onPointerDown` fired `wsFront` on every click, re-rendering mid-interaction; it now skips when the target is inside `[data-nodrag]` (the whole editor/toolbar). Combined with focus-preserving `onMouseDown` + a `selectionchange`-tracked range and a select-all fallback, the B/I/highlight/list/size/colour/font controls apply to the selection. (Still pending live browser confirmation.)
2. **Signal pins — side buffers.** Cards sent to Signal now respect a 72px left rail buffer and 72px right panel buffer, plus a reserved bottom band for the mode pills + Q bar, and fill the remaining space clockwise from top-left. Handles stay grammar-consistent (open top-left, close bottom-right).
3. **Board + menu fixed.** Home modes (signal / board / workspace) now get a mutually-exclusive menu — Signal options no longer leak into Board. The employee (My World) board no longer offers Canvas (they can't use it). The board menu now mirrors the old Add-card pill exactly: persona cards, plus shared tools for employees or Build-in-Canvas for manager/hr.
4. **Board cards — full handle grammar.** New `BoardCard` gives every board visualization the four-corner set: TL drag (reorder via dragControls), TR scale (taller), BL share (manager/hr tools → publishTool) or shorten, BR close. Matches the card/flowboard grammar.
5. **Flowboard close** moved to bottom-right (scale to bottom-left) for consistency with card grammar.

**Honestly still open — task 7:** the Board remains a masonry-reorder grid, not the Workspace's free snap-canvas. Giving it true free-position snapping is a full architectural conversion of a working component; deferred to a focused pass rather than rushed into this multi-file change. Board scale currently adjusts row-span (taller/shorter) rather than free 2D resize.

## 83. Board → free snap-canvas + audit (v82)

**Task 7 — Board is now a free snap-canvas, matching Workspace.** Replaced the masonry-reorder grid with the same gesture architecture as the Workspace: nowBoard items gained optional `pos`/`size`; new store actions `boardMove`/`boardResize`. `BoardGrid` is now a pannable surface (drag empty space to pan, dot grid scrolls, Recenter button) and `BoardCard` is free-positioned in world coords (`screen = world + pan`) with **snapping** (24px grid, dashed lumen guides while dragging) and the full **four-corner handle grammar**: TL drag, TR resize, BL share (manager/hr tools) / —, BR close. The dragged card raises z. Old persisted boards migrate cleanly — items without a stored position fall back to a staggered default, so nothing is lost. Applies across all three personas.

**Audit pass (fixes this round):**
- Removed dead grid machinery (masonry spans, ResizeObserver, dragSnapToOrigin, cardRefs) — the board no longer carries two layout systems.
- Restored `ModeSwitch` (accidentally in the replaced range) and confirmed a single definition.
- Removed unused imports: Workspace (`ArrowLeftRight`, `Hand`, `MoreHorizontal`), Continuum (`Plus`, `Milestone`, `Minimize2`).
- Board card z-index now elevates the actively dragged/resized card (was uniform, could render behind neighbours).
- Note card frame set to `overflow-visible` so the toolbar dropdowns can't be clipped by the card edge (the remaining suspect for the toolbar-dropdown bug), with the body re-rounded to preserve the visual.
- Verified coordinate math, snap clamps, and old-state migration with throwaway scripts. `boardReorder` remains in the store but is now unused by the UI (left in place deliberately; removing it would shift nothing and risks churn).

**Honest status.** The board canvas mirrors the workspace's proven system, so drag/snap/resize should feel identical. Board "share" uses `publishTool` (tools only, manager/hr). The note toolbar's underlying `execCommand` path is unchanged from v81 — the overflow-visible fix removes the last structural reason a dropdown wouldn't show, but live browser confirmation is still the real test.

## 84. Leave policy, money masking, drag-to-Q, cross-lens docs, board combine (v83)

1. **Leave policy rules (Calendar).** Defaults (would come from the Leave Policy doc): **Earned** — unlimited against balance; **Casual** — capped at 2 days at a time, beyond which the request auto-converts to **Earned** with an inline notice + a conversion note in the toast; **Sick** — unlimited against balance, but **>2 days requires a medical-document upload** (prescription/certificate); **Restricted** — the duration/date steps are replaced by a picker of pre-defined (regional) holidays. A **reason textbox (240-char limit)** is required for every type except Restricted. Submit gates on balance, reason, restricted-pick, and medical-doc as applicable.
2. **Money masking everywhere.** The existing `Masked` component now also respects the global pay-visibility toggle, and every value keeps its own inline eye to reveal/hide at will. Applied to the **My World pay token** and **personal payslips** (default hidden). (Aggregate/planning figures in manager/HR analytics remain shown; scope was personal pay + money.)
3. **Workspace notes draggable to Q.** Dragging a workspace card onto the Q bar now sends it to Q for action-items (reuses the shared dropzone; the card's drag sets the global dragging flag so the Q zone arms).
4. **Cross-lens document access fixed.** A document the current user can actually see is now fully interactable in that lens. Asking Q to summarize e.g. a team document from My World no longer returns the "different lens" refusal — a new early matcher answers from any visible document (org / team-you're-on / shared-with-you) before lens-specific matchers can claim it. Shared documents are readable by the employee.
5. **Board drag-to-Q + card-combine.** Dragging a board card onto the Q bar asks Q to analyze it; dropping one board card onto another triggers a **combined analysis** in Q (cross-reading both, offering to build a combined card). Board cards register as token dropzones; self-drops are excluded.

**Honest caveats.** Q's document summary and combined analysis are deterministic, template-driven responses (on-device), not a live LLM read. Casual→Earned conversion and the medical-doc requirement are enforced client-side. Money masking covers personal pay surfaces; incidental amounts inside analytics tuples (e.g. a reimbursement label) are not individually masked. Device-local per user.

## 85. Drag-to-Q fix, leave copy, mask default, token click-target, Phase 5 sharing (v84)

1. **Drag-to-Q now fires.** The `drop-ready` glow was only a CSS reaction to the dragging flag, not proof of a hit — so it lit up without the drop landing. Fix: TheCue now continuously re-registers its Q dropzone (fresh rect) every 200ms while a drag is in progress, and the Workspace hit-tests the Q zone *before* clearing the dragging flag. Board already hit-tested in the right order. Both workspace notes and board cards now drop onto Q reliably.
2. **Leave sub-messages trimmed to one line** — "Pick a pre-defined regional holiday.", "Casual is capped at 2 days — this will be submitted as Earned.", "Sick over 2 days needs a medical document."
3. **Money masked by default + working eye.** Root cause was the token-click issue below (the eye was unreachable). With `showPay` defaulting off and the eye now clickable, amounts start masked and reveal per-value on tap.
4. **Token click-target fixed.** Clicking anywhere on an orbit token used to open its region (pay/growth/documents), which also swallowed the mask eye. Removed the face-level activate: tapping a token now just expands it on hover/tap; only the **"Open {label}"** button inside the expanded card navigates. The mask eye (and any in-face control) is now reachable.
5. **Phase 5 — sharing.** Workspace cards can be shared with a teammate via the card's send/share menu → "Share with…" → pick a person. Shared cards carry `sharedWith`/`sharedBy`, show a **"shared · N" badge** in the header, log an activity entry, and toast confirmation. Re-tapping a selected person unshares; unsharing the last clears the flags.

**Honest caveats.** This is a single-user POC (one `ME_ID`), so sharing is demonstrated through the badge, activity, and toast — you can't sign in as the recipient to watch it arrive in their workspace. Q's responses remain deterministic/on-device. Money masking covers personal pay surfaces (token + payslips); aggregate analytics figures use the separate global reveal.

## 86. Phase 6 Canvas synergy + robust drag-to-Q (v85)

**Phase 6 — Canvas ⇄ Workspace synergy.**
- **Canvas → Workspace:** the Canvas "Send to…" menu gains a **Workspace** destination. It drops the tool onto your workspace canvas as a live **reference card** (new `tool` workspace kind) you can position, connect, and resize like any card; an "Edit in Canvas" button jumps back to the source. Adding the same tool twice is de-duplicated.
- **Workspace → Canvas:** a list or to-do card's send menu gains **"Turn into Canvas tool"**, which seeds a Canvas widget (a checklist) from the card's items and opens Canvas to refine it. Empty items are filtered out.
- New store actions: `wsAddTool(toolRef)`, `wsToCanvas(id)`; `WorkspaceItem` gained `kind:'tool'` + `toolRef`, rendered read-only via a new `ToolBody`.

**Drag-to-Q — root-cause fix (was failing repeatedly).** The earlier attempts relied on TheCue registering its drop zone at exactly the right moment; if that registration was stale or mis-timed, the drop silently missed even though the bar glowed (the glow is only a reaction to "a drag is happening", never proof of a hit). New approach removes the fragile dependency entirely: the Q bar now carries a stable DOM id (`q-cue-bar`), and a new `hitQBar(x,y)` helper tests the release point against **both** the registered zone **and** the bar's live DOM rect, with a forgiving 28px margin. Workspace notes and board cards both use it on drop. Because it reads the live rect at drop time, registration timing can no longer swallow the drop.

**Honest caveats.** Still a single-user POC; Q's generated analyses are deterministic/on-device. The drag-to-Q fix is logically verified and the live-DOM fallback makes it robust in principle, but I can't exercise a real pointer drag headlessly — a quick confirmation from a browser is the final check. Workspace tool-cards mirror the Canvas tool read-only; editing happens back in Canvas.

## 87. Masking-by-default, drag z-order, top-clip fix (v86)

1. **Money masking, properly by default.** Root cause: the global reveal (`showPay`) was persisted to localStorage, so once anyone tapped "Reveal amounts" it stayed revealed across every future session — which read as "not masked by default." Now `showPay` always starts `false` each session (no persistence), so pay is masked on load everywhere it uses `Masked`. Also made the inline eye reliable inside orbit tokens by marking the `Masked` control `data-handle` (so the token's tap-to-expand no longer swallows the eye click). Extended masking to the personal net-pay headline in the Growth view. Personal pay surfaces (My World pay token, payslips, growth net) are masked; org-level aggregates keep their existing global reveal.
2. **Dragged card now floats above the Q bar + input.** The home stage is a transformed `motion.div`, which traps its children in a stacking context beneath the fixed Q bar (z-50) — so a dragged card (z-100 *within* the stage) still rendered under Q. Fix: while `dragging`, the stage is promoted to `z-[60]`, lifting the in-flight card above the Q bar and the + button so drag-and-drop reads correctly. Drop still resolves by coordinate (`hitQBar`), so nothing about the drop logic changes.
3. **Top clipping removed.** The board and workspace surfaces used `overflow-hidden`, which clipped cards dragged above the surface's top edge (the "invisible top band"). Both surfaces are now `overflow-visible`; the pannable dot-grid still fills the surface bounds, but cards are no longer cut off at the top (or any edge).

**Honest caveats.** Session-only reveal means a page reload re-masks everything (intended). With `overflow-visible`, a card panned/dragged far can render over adjacent chrome mid-gesture — acceptable for an infinite canvas and consistent with the drag-over-Q affordance. Aggregate org money (planning budget, org net payroll, simulations) is intentionally left visible with its own reveal control rather than per-value masked.

## 88. Frictionless drag-to-Q, universal cards, Nows drag, light-mode + portal menus (v87)

1. **Frictionless drag-to-Q with two highlight states.** Replaced the tight overlap test with a graded proximity model (`qProximity`): a generous **150px region of influence** (the card only needs to *enter* it to be droppable) and a **46px release zone**. The Q bar shows a **subtle** dashed outline the instant you grab a card (`drop-ready`), then a **prominent** glowing, scaled outline once the card enters the release zone (`drop-release`); the hint switches "Drag here to ask Q" → "Release to ask Q." Dropping anywhere in the influence region lands it.
2. **Universal across screens.** The shared `TokenFrame` drag path (used by payroll payslips, documents, and the person/leave tokens across all three Nows) now uses the same graded proximity + two-state highlight, so drag-to-Q behaves identically everywhere — not just workspace/board.
3. **Nows cards draggable with snap.** Signal pins are now freely draggable on a 24px snap grid (a faint grid appears only while dragging), via window-level pointer listeners; they gained the four-corner handle grammar (TL drag, TR open, BR close) and inherit drag-to-Q. The orbit, side panels, and Focus are separate layers and stay stationary.
4. **Light-mode legibility.** Added light-mode overrides so the note toolbar, its dropdown menus, the timer (ring track, label, soft buttons), and the connected-card "board" badge all switch to light surfaces / legible text when a card is in light mode.
5. **Dropdowns escape clipping.** Note edit dropdowns now render in a **portal to `document.body`** at fixed coordinates computed from the trigger button, so they always show in full at the top layer regardless of card size or the card's overflow — and they carry the card's light/dark theme.

**Honest caveats.** Still a single-user POC; Q's generated analyses are deterministic/on-device. Drag-to-Q, the Nows pin drag, and the portal menus are logically verified and build+smoke clean, but real pointer interaction (drag landing, two-state glow, menu placement) is best confirmed in a browser. The portal menu closes on any outside pointer-down or window resize rather than repositioning live.

## 89. Q pull-in, panel-float persistence, highlight toggle, dropdown polish (v88)

1. **Q area of influence shrunk + pull-in animation.** Influence radius cut from 150px to **20px** (release 6px) — the card must nearly touch Q. On drop, a **ghost of the card flies into the Q bar and shrinks** (~380ms) before the answer appears; the real card was never moved, so it stays exactly where it was dragged from. Wired for workspace and board.
2. **Cards dragged out of side panels now persist on collapse.** Root cause: a floated card was `position:fixed` but still *owned by* the panel component, so collapsing the panel unmounted it. Two-part fix: floated tokens now **portal to `document.body`** (so they're not DOM-descendants of the panel), and the four side panels (Employee/Manager/HR Today, The Now) stay **mounted-but-hidden** when collapsed (visibility hidden + pointer-events none) instead of unmounting — preserving React ownership. The card's **close handle now docks it back** to its origin panel (rather than hiding it).
3. **Highlight toggles + active-state indicators.** Bold/Italic/Highlight buttons now light up (lumen) when the current selection has that formatting, tracked via `queryCommandState` + a background-color probe on `selectionchange`. Highlight re-click now clears it (`hiliteColor: transparent`).
4. **Font dropdown width fixed.** The portal menu is constrained to 168px (220px max) so it no longer sprawls.
5. **Card corner artifact fixed.** The note header now has rounded top corners (`rounded-t-[13px]`) matching the frame, so the square header no longer juts above the card's rounded corners.

**Honest caveats.** Single-user POC; Q analyses are deterministic/on-device. Panels kept mounted-when-collapsed still register their panel dropzone (harmless — docking there is valid). The pull-in ghost is a fixed-duration flourish, not physically tied to the answer's arrival. Highlight-off relies on `hiliteColor:transparent`, which clears the visible background in supported browsers. Real drag/animation feel is best confirmed in a browser.

## 90. Rect-based drag-to-Q, module screens, panel-float dock bug, leave cleanup (v89)

1. **Drag-to-Q now triggers on the card's edge, not the pointer.** The old test compared the *pointer* position to the Q bar; since you hold a card near its top, its bottom edge reached Q long before the pointer did — so nothing highlighted until the card's top border touched the bar. New `qProximityRect`/`hitQBarRect` inflate the Q bar by **24px in every direction** and test the **dragged card's rectangle** against it, so the moment the card's bottom border enters that 24px zone it highlights and becomes droppable. Applied to workspace cards, board cards, signal pins, and all token cards.
2. **Module screens (Payroll, Documents, …) now work.** Those use the shared token drag path, which now reads the card's live bounding rect (`ref.getBoundingClientRect()`), so the rect-based Q test works there too — previously the point-based test never engaged.
3. **Floated side-panel cards no longer snap back on reposition/Q-drop.** Root cause: collapsed panels kept their `panel` dropzone registered, so moving or dropping a floated card near that region read as "docked" and sent it home. Panel dropzones now register **only while the panel is expanded**, so repositioning a floated card in the main area (or dropping it on Q) keeps it floating; only its explicit close/dock handle returns it to the panel.
4. **Removed the redundant balance box** at the top of the Leave panel (it duplicated the per-type balances shown on the leave-type cards).

**Honest caveats.** Single-user POC; Q analyses are deterministic/on-device. Rect-based hit-testing reads live DOM rects at drag time, so it's robust to layout, but the drag feel is best confirmed in a browser. Dropping a floated card onto an expanded panel still docks it (intended).

## 91. Drag z-order, Canvas-free My World, toast placement, orbit-drag smoothness (v90)

1. **Dragged cards render ABOVE the Q bar now.** Tokens got `z-index: 9997` while dragging (was 30 when floating → under the Q bar's z-50). Combined with the stage elevating to z-60 during any drag, a card dragged toward Q in any screen (payroll, documents, orbit) rides above the bar instead of sliding under it.
2. **Notifications no longer overlap the menu.** Toasts moved from top-center (colliding with the floating menu island) to **top-center below the menu (76px)**, restyled to stand out — accent side-bar, icon chip, coloured glow ring, higher z.
3. **Orbit-token drag smoothness.** The drag handler was calling `setPreview`/`setQHover` on every animation frame, thrashing global re-renders. Now both only fire when their value actually changes (guarded by refs), removing the friction/jank when dragging orbit tokens to Q.
4. **Canvas fully removed from My World.** Every employee-reachable Canvas entry point is gated to manager/HR: the "Turn into Canvas tool" card action, the board empty-state "Build in Canvas" button, the board hint copy, and the gesture-legend Canvas row. (The action dock and tour were already gated.)
5. **Signal grid + snapping** retained for moving pins (subtle grid appears while dragging; positions snap to the 24px grid) — core elements (side panels + capsules, orbit + tokens, top menu, Q bar) stay fixed; only the extra pinned cards move.
6. **Rect-based drag-to-Q** (from v89) now reads live card rects everywhere, so module screens (Payroll/Documents) engage the highlight + drop.

**Honest caveats.** Single-user POC; Q analyses deterministic/on-device. #3 (restoring a dragged-out card to exact original width) — floated flow-cards dock back via the close/return handle and re-render into their grid slot at full width; if a specific card still misbehaves, it needs a concrete repro. Drag feel, z-order over Q, and toast placement are logic-correct and build-clean but best confirmed in a browser.

## 92. Drag friction root-cause, Plain mode regression, UI + accessibility audit (v91)

**Two root-cause bugs**
1. **Orbit-token drag friction.** `.node-lift` carried `transition: transform .2s`. Motion writes `transform` inline on *every* drag frame, so each frame was being animated over 200ms — the exact "friction at the start of the drag". Dragging cards now get an `is-dragging` class that disables the transition (and the hover lift).
2. **Plain mode regression (mine).** A `useMemo` sat *after* the `if (w.plain) return <PlainMode/>` early return, so enabling Plain mode rendered fewer hooks and React threw. The early return now runs after all hooks.

**Leave panel**
- **Distinct iconography per type** — Earned (Plane/lumen), Sick (Thermometer/coral), Casual (Coffee/ember), Restricted (Star/halo). One shared icon defeated the purpose.
- **Constant height** — the step stack has a stable min-height, so switching type no longer resizes the panel.
- **Restricted edge cases** — fixed-height scrolling list, a **quota readout** ("N of 2 left") that disables selection once exhausted, and a **search field once >6 holidays** exist (the 5–10 holiday case). Selected card's murky border replaced with a clear accent border + check.
- **Proximity grouping** — review summary + both buttons grouped tightly and divided from the form; full-width, larger targets.

**Calendar**
- Calendar and the month context card were in one scroll container; they're now **independent scroll regions**.
- New **"My leave · year"** tab listing the year's booked leave with status (approved / pending / taken) — previously not surfaced anywhere.

**Design grammar**
- Board cards and Signal pins had 3 handles; both now carry the full **four-corner grammar** (BL = share for shareable tools, otherwise Ask-Q). Tokens already had four.

**Accessibility & 4px grid**
- **696 font-size utilities** bumped one notch in a single pass; nothing below 11px remains (the tester's "fonts too small").
- Tertiary text colour lifted in **both** modes. Measured rather than assumed: `trace` on the dark ground is ≈6.4:1 (AA) — size, not contrast, was the real issue.
- **568 padding/gap/margin utilities snapped to the 4px grid** (6→8, 10→12, 14→16). Positional utilities, icon sizes and the 36 handle offsets were deliberately excluded so handle placement is unchanged. Larger padding also increases touch-target size.

**Honest caveats.** Single-user POC; Q analyses deterministic/on-device. The type and spacing sweeps are mechanical and build-clean, but a broad visual re-check in the browser is worth doing — a few dense spots may want manual tightening. RH quota currently reads the remaining `rh` balance directly; a real system would reconcile against holidays already taken this year.

## 93. Calendar layout rebuild, payroll self-service, asset register (v92)

1. **Ribbon view fixed (regression from v91).** Splitting the calendar and context into separate scroll regions left the left column without `min-w-0`. Grid children default to `min-width:auto`, so the wide ribbon expanded the `1fr` track and pushed the 360px composer clean off-screen — which is why the composer vanished and the ribbon ran past the viewport. Both the column and the context card now carry `min-w-0`.
2. **No-scroll calendar layout.** The composer no longer relies on a min-height plus page scrolling: it now fills its column exactly (`h-full flex flex-col`), so it keeps a constant height *and* fits. The header is fixed, the step stack is the only flexing region, and the **review + Send footer is pinned outside it** so the primary action is never scrolled out of reach.
3. **Payroll self-service.** New `PayslipLibrary` — every month's slip with a working **download** (generated client-side as a real file, so it works offline) and masked amounts. New `Reimbursements` — full claim history with status, plus a **claim flow** (description, category, amount, mandatory receipt) that writes to the store, logs activity and toasts.
4. **Asset register.** New `AssetsSection` under Documents listing everything allocated (name, serial, assigned date, condition) with a downloadable register — assets live with the rest of what's issued to you rather than in a separate silo.
5. **Q kept in step.** New matchers so Q answers on **reimbursements** ("N claims, M awaiting, ₹X"), **assets** (what's allocated, where the serials are) and **salary slips** (which months, where to download), each routing to the right region. Verified the routing for five phrasings.

**Honest caveats.** Single-user POC — downloads are generated client-side as plain-text statements, not real PDFs from a payroll engine, and claims stay device-local. Q's replies remain deterministic/on-device. Reimbursement approval has no manager-side queue yet; claims land as `submitted` and don't appear in the manager approvals list.

## 94. Stacked month ribbons + Assets promoted to a category (v93)

1. **Ribbon view no longer a lonely strip in a void.** The single horizontal wave left a large vertical gap above the context card. Ribbon view now renders **one compact wave per month, stacked** (Jun / Jul / Aug / Sep), each full-width and responsive (days laid out as a fraction of the month, so a whole month fits with no horizontal scroll). The stack fills the vertical space naturally and is far more readable — every month visible at once, each day still tappable to pick, with the same event dots, attendance rings, today pulse and selection highlight. New `MonthRibbon` sub-component; the old horizontal-scroll ribbon (drag-to-travel, edge chevrons) is retired.
2. **Assets promoted from "buried at the bottom" to a first-class category.** Added an **Assets tab** (with a live count badge) to the Documents filter row. Selecting it shows only the asset register; under "All" the assets still appear, but the category makes them directly reachable. The region header now reads "Documents, policies & assets" so the section is signposted. `AssetsSection` takes a `topLevel` prop to drop its top margin when it's the sole content.

**Honest caveats.** Single-user POC. The stacked ribbons use responsive SVG (`preserveAspectRatio: none` with non-scaling strokes), so dots stay round and lines crisp while the month stretches to the column width — worth an eyeball in the browser at very narrow widths. Assets remain a read-only register (download works, client-side); no check-in/return workflow yet.
