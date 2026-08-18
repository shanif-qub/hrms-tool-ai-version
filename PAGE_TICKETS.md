# Qubryx One — Page Tickets

One ticket per page/screen. Each lists the page description and every component on it — name, description, and the full set of pages that component appears on (so shared components can be built once and referenced across tickets).


## Pre-Auth

### Ticket 01 — Login

**Route:** `/login`  
**Access:** Public

**Page description:** The app's only unauthenticated screen — a fully mocked login gate. A two-pane layout pairs an auto-advancing product showcase on the left with a sign-in form on the right. All three entry paths (form submit, SSO, demo) log in identically; there is no real credential validation.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Showcase Carousel | An auto-advancing 4-slide product showcase with animated inline-SVG illustrations. | Login |
| Sign-in form | Email/password fields, an SSO button, and a one-click demo-workspace entry. | Login |

---


## Employee - My World

### Ticket 02 — Employee · Home (Signal)

**Route:** `/app/employee`  
**Access:** Employee

**Page description:** The default landing screen for the employee persona — an ambient three-zone overview of the day: a live signal feed on the left, a central identity hub ringed by domain shortcuts (Calendar, Leave, Pay, Documents, Growth, Requests), and a personalized action rail on the right.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Life Sphere Hub | The central identity disc ringed by domain-shortcut nodes on curved spokes. | Employee · Home (Signal), Manager · Home, HR · Home |
| Today Rail | The persona-specific right-hand action rail — collapsible to an icon capsule. | Employee · Home (Signal), Manager · Home, HR · Home |
| Recognition Card | A kudos-sending widget with a reason picker and a confetti-burst animation. | Employee · Home (Signal) |
| Pulse Card | A 1-5 weekly rating input for the team pulse survey. | Employee · Home (Signal) |
| Onboarding Card | A circular progress ring plus checklist for a new joiner's first tasks; disappears once complete. | Employee · Home (Signal) |
| Token Card / Token Frame | The core draggable, three-layer data card — face (always visible), Layer 1 expand (long-hover/tap), Layer 2 peel (top-right corner, deeper AI detail). Every record in the app renders through this one primitive. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets, Employee · Calendar, Manager · Team, Manager · Approvals, HR · Org / People, HR · Payroll, Manager · Focus, HR · Focus |
| Corner Grammar | Four hover-revealed handles on every Token Card: top-left move (only drag entry), bottom-left stack (multi-select), top-right peel (toggle Layer 2), bottom-right close (hide). | Employee · Documents & Assets, Manager · Team, Employee · Home (Signal), Manager · Home, HR · Home |
| Q Orb | Animated glowing orb representing Q's mood (idle/listen/think/answer/alert), docked at the right end of the Cue bar. | Employee · Home (Signal), Manager · Home, HR · Home |
| The Cue | The bottom-center command bar — type or speak to Q; the app's one and only drag-to-Q drop target. | Employee · Home (Signal), Employee · Home (Board), Employee · Home (Workspace), Employee · Calendar, Manager · Home, HR · Home |
| Q Panel | The slide-in chat sidebar — full conversation log with rich response rendering (charts, CSV downloads, rationale, source citations, action buttons). | Employee · Home (Signal), Manager · Home, HR · Home |
| Clock Widget | Live attendance clock — circular progress ring against an 8-hour goal, with clock-in/out and break controls. | Employee · Home (Signal) |
| Contextual Add ("+") | The floating add menu whose contents change with persona, region, and home-view mode — the most context-sensitive component in the app. | Employee · Home (Signal), Employee · Home (Board), Employee · Home (Workspace), Manager · Home, HR · Home |
| Group Panel / Stack Tray | Floating tray that rises when one or more tokens are stacked — combine into a comparison, or ask Q about the whole set. | Employee · Documents & Assets, Manager · Team |
| Toasts | Top-center, auto-dismiss (3.2s) notification stack — ok / warn / info tones. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets |
| Wallpaper + Fluid Field | Selectable animated ambient background sitting beneath every screen — pure SVG/CSS, no canvas. | Employee · Home (Signal), Manager · Home, HR · Home, Overlay · Settings |
| Pulse Layer | A transient full-screen flash/ring/particle burst fired on every combine, relate, reject, and peel. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets |
| Sound + Haptics | Procedural Web Audio effects paired 1:1 with vibration feedback for every gesture. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets |
| Concept Icon + registry | One glyph and one semantic tint bound to each of ~46 named concepts — the single source of truth for icon usage app-wide. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets, Overlay · Document Viewer |

---

### Ticket 03 — Employee · Home (Board)

**Route:** `/app/employee (homeView=board)`  
**Access:** Employee

**Page description:** A personal free-form pinboard swapped in for the Signal view via a bottom-left mode switch — assemble pinned data and tool cards on a dotted canvas, scoped privately to this persona.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Board quick-add palette | Persona-scoped list of quick-add data/tool cards for Board view. | Employee · Home (Board) |
| Token Card / Token Frame | The core draggable, three-layer data card — face (always visible), Layer 1 expand (long-hover/tap), Layer 2 peel (top-right corner, deeper AI detail). Every record in the app renders through this one primitive. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets, Employee · Calendar, Manager · Team, Manager · Approvals, HR · Org / People, HR · Payroll, Manager · Focus, HR · Focus |
| Contextual Add ("+") | The floating add menu whose contents change with persona, region, and home-view mode — the most context-sensitive component in the app. | Employee · Home (Signal), Employee · Home (Board), Employee · Home (Workspace), Manager · Home, HR · Home |
| The Cue | The bottom-center command bar — type or speak to Q; the app's one and only drag-to-Q drop target. | Employee · Home (Signal), Employee · Home (Board), Employee · Home (Workspace), Employee · Calendar, Manager · Home, HR · Home |
| Wallpaper + Fluid Field | Selectable animated ambient background sitting beneath every screen — pure SVG/CSS, no canvas. | Employee · Home (Signal), Manager · Home, HR · Home, Overlay · Settings |
| Drop-zone registry | Framework-free registry powering drag-target hit-testing and Q-bar proximity detection. | Employee · Home (Workspace), Employee · Home (Board), Employee · Documents & Assets, Manager · Team |

---

### Ticket 04 — Employee · Home (Workspace)

**Route:** `/app/employee (homeView=workspace)`  
**Access:** Employee

**Page description:** An infinite, pannable canvas of notes, checklists, and lists with connector lines — the third of three interchangeable home modes, structurally shared across all personas.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Workspace note/list/todo cards | Free-position cards (note, checklist, or bulleted list) on the infinite canvas. | Employee · Home (Workspace) |
| FlowBoard connectors | Labeled arrows linking Workspace cards; connected clusters auto-group into a FlowBoard. | Employee · Home (Workspace) |
| Contextual Add ("+") | The floating add menu whose contents change with persona, region, and home-view mode — the most context-sensitive component in the app. | Employee · Home (Signal), Employee · Home (Board), Employee · Home (Workspace), Manager · Home, HR · Home |
| The Cue | The bottom-center command bar — type or speak to Q; the app's one and only drag-to-Q drop target. | Employee · Home (Signal), Employee · Home (Board), Employee · Home (Workspace), Employee · Calendar, Manager · Home, HR · Home |
| Drop-zone registry | Framework-free registry powering drag-target hit-testing and Q-bar proximity detection. | Employee · Home (Workspace), Employee · Home (Board), Employee · Documents & Assets, Manager · Team |

---

### Ticket 05 — Employee · Calendar

**Route:** `/app/employee/calendar`  
**Access:** Employee

**Page description:** The org/personal calendar and self-service leave-application surface — a visual day-track view paired with a guided, multi-step leave-request wizard and built-in policy rules (auto-conversion, quota checks, conditional document upload).

**Components:**

| Name | Description | Used in |
|---|---|---|
| Month Ribbon | A stacked, per-month SVG sine-wave day-track calendar view. | Employee · Calendar |
| Detail Grid | A conventional 7-column month grid view (alternate to the Ribbon). | Employee · Calendar |
| Leave Composer | The 5-step guided leave-application wizard (type, duration, dates, reason, conditional doc upload). | Employee · Calendar |
| Token Card / Token Frame | The core draggable, three-layer data card — face (always visible), Layer 1 expand (long-hover/tap), Layer 2 peel (top-right corner, deeper AI detail). Every record in the app renders through this one primitive. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets, Employee · Calendar, Manager · Team, Manager · Approvals, HR · Org / People, HR · Payroll, Manager · Focus, HR · Focus |
| The Cue | The bottom-center command bar — type or speak to Q; the app's one and only drag-to-Q drop target. | Employee · Home (Signal), Employee · Home (Board), Employee · Home (Workspace), Employee · Calendar, Manager · Home, HR · Home |

---

### Ticket 06 — Employee · Documents & Assets

**Route:** `/app/employee/documents`  
**Access:** Employee

**Page description:** The employee-facing library of company policies and announcements, with search, category filters, and acknowledgment tracking, plus a read-only register of allocated IT assets.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Token Card / Token Frame | The core draggable, three-layer data card — face (always visible), Layer 1 expand (long-hover/tap), Layer 2 peel (top-right corner, deeper AI detail). Every record in the app renders through this one primitive. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets, Employee · Calendar, Manager · Team, Manager · Approvals, HR · Org / People, HR · Payroll, Manager · Focus, HR · Focus |
| Corner Grammar | Four hover-revealed handles on every Token Card: top-left move (only drag entry), bottom-left stack (multi-select), top-right peel (toggle Layer 2), bottom-right close (hide). | Employee · Documents & Assets, Manager · Team, Employee · Home (Signal), Manager · Home, HR · Home |
| Concept Icon + registry | One glyph and one semantic tint bound to each of ~46 named concepts — the single source of truth for icon usage app-wide. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets, Overlay · Document Viewer |
| Group Panel / Stack Tray | Floating tray that rises when one or more tokens are stacked — combine into a comparison, or ask Q about the whole set. | Employee · Documents & Assets, Manager · Team |
| Assets Section | A read-only grid of IT assets allocated to the employee, with a downloadable register. | Employee · Documents & Assets |
| downloadTextFile utility | A client-side Blob-based text/CSV file download helper, currently duplicated three times. | Employee · Payroll, Employee · Documents & Assets, HR · Payroll |
| Toasts | Top-center, auto-dismiss (3.2s) notification stack — ok / warn / info tones. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets |
| Pulse Layer | A transient full-screen flash/ring/particle burst fired on every combine, relate, reject, and peel. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets |
| Sound + Haptics | Procedural Web Audio effects paired 1:1 with vibration feedback for every gesture. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets |
| Drop-zone registry | Framework-free registry powering drag-target hit-testing and Q-bar proximity detection. | Employee · Home (Workspace), Employee · Home (Board), Employee · Documents & Assets, Manager · Team |
| Synthesized (result card) | The combine/relate output card, built on Token Card, with a gradient 'provenance seam' blending its two parents' tint colors. | Employee · Documents & Assets, Manager · Team, Employee · Home (Signal) |
| Segmented Tabs / Filter Chip | A pill-shaped tab switcher or toggle chip with an active-segment highlight. | Manager · Planning, HR · Planning, Employee · Growth, Manager · Growth, HR · Payroll, Employee · Documents & Assets |

---

### Ticket 07 — Employee · Payroll

**Route:** `/app/employee/payroll`  
**Access:** Employee

**Page description:** The personal pay area — download past payslips (amounts masked by default) and submit or track expense-reimbursement claims.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Payslip Library | A list of past payslips with masked amounts and a per-slip download. | Employee · Payroll |
| Reimbursements | An expense-claim form plus a status-tracked claim history. | Employee · Payroll |
| Masked | Obscures a sensitive numeric value (pay, phone) behind bullet characters with a click-to-reveal eye toggle. | Employee · Payroll, HR · Payroll |
| downloadTextFile utility | A client-side Blob-based text/CSV file download helper, currently duplicated three times. | Employee · Payroll, Employee · Documents & Assets, HR · Payroll |

---

### Ticket 08 — Employee · Growth

**Route:** `/app/employee/growth`  
**Access:** Employee

**Page description:** The personal career and performance hub — a Q-generated self-review summary, live goal tracking with a progress stepper, 1:1 prep, and a Journey tab showing a career-history timeline.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Self-review summary card | A Q-generated strengths / blind-spots / perception-gap summary. | Employee · Growth |
| Goal Row | A goal's title, status pill, progress stepper, and due-date caption. | Employee · Growth, Manager · Growth |
| Progress Bar | A spring-animated fill bar used for goals, checklists, and comp bands. | HR · Offboarding / Exits, Employee · Growth, Manager · Growth, Manager · Planning, HR · Planning, HR · Onboarding |
| 1:1 Card | A shared meeting agenda plus a checkable action-item list. | Employee · Growth, Manager · Growth |
| Journey Timeline / Journey Mini | A vertical career-history timeline, in full and 3-item-preview variants. | Employee · Growth |
| Chart primitives | A small hand-rolled chart library — grouped bars, mini progress lists, an SVG line/area trend, a radial gauge, heatmaps, stacked bars. | Employee · Growth, Manager · Insights / Analytics, HR · Insights / Analytics, Manager · Focus, HR · Focus, Employee · Payroll, Overlay · Retention Simulator |
| Checklist Row | A checkbox-square row with a strikethrough label and an owner tag. | HR · Offboarding / Exits, Employee · Growth, Manager · Growth, Overlay · Plain Mode |
| Status Badge | A status-tinted pill (draft / published / archived, or review status). | Manager · Documents, HR · Policies, Employee · Growth, Manager · Growth |
| Kind-Meta lookup helper | A typed {label, icon, color} lookup-table pattern, currently reimplemented separately per feature. | HR · Time & Holidays, HR · Offboarding / Exits, Employee · Growth, Manager · Focus, HR · Focus |

---


## Manager - My Team

### Ticket 09 — Manager · Home

**Route:** `/app/manager`  
**Access:** Manager

**Page description:** The manager persona's landing screen — the same three interchangeable home modes as Employee, with a team-focused action rail (pinned Canvas apps, an approvals summary, team presence, a flight-risk attention card, and a coverage heat-strip).

**Components:**

| Name | Description | Used in |
|---|---|---|
| Life Sphere Hub | The central identity disc ringed by domain-shortcut nodes on curved spokes. | Employee · Home (Signal), Manager · Home, HR · Home |
| Today Rail | The persona-specific right-hand action rail — collapsible to an icon capsule. | Employee · Home (Signal), Manager · Home, HR · Home |
| Token Card / Token Frame | The core draggable, three-layer data card — face (always visible), Layer 1 expand (long-hover/tap), Layer 2 peel (top-right corner, deeper AI detail). Every record in the app renders through this one primitive. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets, Employee · Calendar, Manager · Team, Manager · Approvals, HR · Org / People, HR · Payroll, Manager · Focus, HR · Focus |
| Corner Grammar | Four hover-revealed handles on every Token Card: top-left move (only drag entry), bottom-left stack (multi-select), top-right peel (toggle Layer 2), bottom-right close (hide). | Employee · Documents & Assets, Manager · Team, Employee · Home (Signal), Manager · Home, HR · Home |
| Q Orb | Animated glowing orb representing Q's mood (idle/listen/think/answer/alert), docked at the right end of the Cue bar. | Employee · Home (Signal), Manager · Home, HR · Home |
| The Cue | The bottom-center command bar — type or speak to Q; the app's one and only drag-to-Q drop target. | Employee · Home (Signal), Employee · Home (Board), Employee · Home (Workspace), Employee · Calendar, Manager · Home, HR · Home |
| Q Panel | The slide-in chat sidebar — full conversation log with rich response rendering (charts, CSV downloads, rationale, source citations, action buttons). | Employee · Home (Signal), Manager · Home, HR · Home |
| Contextual Add ("+") | The floating add menu whose contents change with persona, region, and home-view mode — the most context-sensitive component in the app. | Employee · Home (Signal), Employee · Home (Board), Employee · Home (Workspace), Manager · Home, HR · Home |
| Toasts | Top-center, auto-dismiss (3.2s) notification stack — ok / warn / info tones. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets |
| Wallpaper + Fluid Field | Selectable animated ambient background sitting beneath every screen — pure SVG/CSS, no canvas. | Employee · Home (Signal), Manager · Home, HR · Home, Overlay · Settings |
| Pulse Layer | A transient full-screen flash/ring/particle burst fired on every combine, relate, reject, and peel. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets |
| Sound + Haptics | Procedural Web Audio effects paired 1:1 with vibration feedback for every gesture. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets |
| Avatar | Seeded circular profile photo with a graceful fallback to a colored initial if the image fails to load. | Manager · Team, HR · Org / People, HR · Onboarding, Employee · Home (Signal), Manager · Home, HR · Home |
| Rationale Disclosure | A reusable 'Why this?' collapsible attached to any Q recommendation — why / why-now / worth noting / evidence, with a confidence dot. | Manager · Focus, HR · Focus, Employee · Home (Signal), Manager · Home, HR · Home |

---

### Ticket 10 — Manager · Team

**Route:** `/app/manager/team`  
**Access:** Manager

**Page description:** The direct-report roster — a radial team graph for small teams, automatically switching to a searchable, filterable grid once the team grows past roughly eight people.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Roster grid | A searchable, department-filterable grid of person cards. | Manager · Team, HR · Org / People |
| Constellation / Org Tree graph | A radial (manager) or hierarchical (HR) relationship graph of people. | Manager · Team, HR · Org / People |
| Stat Pill | A colored-dot count pill summarizing one status category at a glance — non-interactive. | Manager · Team, HR · Time & Holidays, Manager · Focus, HR · Focus, HR · Payroll, HR · Org / People |
| Avatar | Seeded circular profile photo with a graceful fallback to a colored initial if the image fails to load. | Manager · Team, HR · Org / People, HR · Onboarding, Employee · Home (Signal), Manager · Home, HR · Home |
| Token Card / Token Frame | The core draggable, three-layer data card — face (always visible), Layer 1 expand (long-hover/tap), Layer 2 peel (top-right corner, deeper AI detail). Every record in the app renders through this one primitive. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets, Employee · Calendar, Manager · Team, Manager · Approvals, HR · Org / People, HR · Payroll, Manager · Focus, HR · Focus |
| Corner Grammar | Four hover-revealed handles on every Token Card: top-left move (only drag entry), bottom-left stack (multi-select), top-right peel (toggle Layer 2), bottom-right close (hide). | Employee · Documents & Assets, Manager · Team, Employee · Home (Signal), Manager · Home, HR · Home |
| Group Panel / Stack Tray | Floating tray that rises when one or more tokens are stacked — combine into a comparison, or ask Q about the whole set. | Employee · Documents & Assets, Manager · Team |
| Drop-zone registry | Framework-free registry powering drag-target hit-testing and Q-bar proximity detection. | Employee · Home (Workspace), Employee · Home (Board), Employee · Documents & Assets, Manager · Team |
| Synthesized (result card) | The combine/relate output card, built on Token Card, with a gradient 'provenance seam' blending its two parents' tint colors. | Employee · Documents & Assets, Manager · Team, Employee · Home (Signal) |

---

### Ticket 11 — Manager · Approvals

**Route:** `/app/manager/approvals`  
**Access:** Manager

**Page description:** The leave-approval inbox — batch select/approve/decline, a separate Hold queue for parking decisions, and delegate-while-away coverage with an auto-approve-in-policy toggle.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Approvals inbox rows | Batch-selectable leave-request rows with approve / decline / hold actions. | Manager · Approvals |
| Delegate-while-away control | A toggle to auto-approve in-policy requests while the manager is away. | Manager · Approvals |
| Token Card / Token Frame | The core draggable, three-layer data card — face (always visible), Layer 1 expand (long-hover/tap), Layer 2 peel (top-right corner, deeper AI detail). Every record in the app renders through this one primitive. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets, Employee · Calendar, Manager · Team, Manager · Approvals, HR · Org / People, HR · Payroll, Manager · Focus, HR · Focus |

---

### Ticket 12 — Manager · Insights / Analytics

**Route:** `/app/manager/analytics`  
**Access:** Manager

**Page description:** Team-level analytics — a talent 2x2 grid, a team time-off heatmap, and free-text trend/change-detection queries answered by Q.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Talent 2x2 grid | A performance x potential quadrant grid of clickable person chips. | Manager · Insights / Analytics, HR · Insights / Analytics |
| Time-off heatmap | A team x week color-intensity absence grid. | Manager · Insights / Analytics, HR · Insights / Analytics |
| Chart primitives | A small hand-rolled chart library — grouped bars, mini progress lists, an SVG line/area trend, a radial gauge, heatmaps, stacked bars. | Employee · Growth, Manager · Insights / Analytics, HR · Insights / Analytics, Manager · Focus, HR · Focus, Employee · Payroll, Overlay · Retention Simulator |

---

### Ticket 13 — Manager · Growth

**Route:** `/app/manager/growth`  
**Access:** Manager

**Page description:** The manager's team-wide counterpart to Growth — create and cascade team goals with roll-up progress, review every direct report's 1:1, and oversee the review cycle (nudge outstanding, leave feedback).

**Components:**

| Name | Description | Used in |
|---|---|---|
| Goal Row | A goal's title, status pill, progress stepper, and due-date caption. | Employee · Growth, Manager · Growth |
| Progress Bar | A spring-animated fill bar used for goals, checklists, and comp bands. | HR · Offboarding / Exits, Employee · Growth, Manager · Growth, Manager · Planning, HR · Planning, HR · Onboarding |
| 1:1 Card | A shared meeting agenda plus a checkable action-item list. | Employee · Growth, Manager · Growth |
| Status Badge | A status-tinted pill (draft / published / archived, or review status). | Manager · Documents, HR · Policies, Employee · Growth, Manager · Growth |
| Segmented Tabs / Filter Chip | A pill-shaped tab switcher or toggle chip with an active-segment highlight. | Manager · Planning, HR · Planning, Employee · Growth, Manager · Growth, HR · Payroll, Employee · Documents & Assets |
| Chart primitives | A small hand-rolled chart library — grouped bars, mini progress lists, an SVG line/area trend, a radial gauge, heatmaps, stacked bars. | Employee · Growth, Manager · Insights / Analytics, HR · Insights / Analytics, Manager · Focus, HR · Focus, Employee · Payroll, Overlay · Retention Simulator |

---

### Ticket 14 — Manager · Documents

**Route:** `/app/manager/documents`  
**Access:** Manager

**Page description:** The authoring surface for team-scoped policies and announcements — the write-side counterpart to the employee Documents page, with draft/publish/archive lifecycle and an activity log.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Entity editor panel | A title / body / type / audience / require-ack authoring form for documents and announcements. | Manager · Documents, HR · Policies |
| Activity log | A chronological list of the last few authoring actions. | Manager · Documents, HR · Policies |
| Status Badge | A status-tinted pill (draft / published / archived, or review status). | Manager · Documents, HR · Policies, Employee · Growth, Manager · Growth |
| Segmented Tabs / Filter Chip | A pill-shaped tab switcher or toggle chip with an active-segment highlight. | Manager · Planning, HR · Planning, Employee · Growth, Manager · Growth, HR · Payroll, Employee · Documents & Assets |

---

### Ticket 15 — Manager · Planning

**Route:** `/app/manager/planning`  
**Access:** Manager

**Page description:** Workforce planning, tabbed — allocate merit-budget raises against a live meter with band-range visuals, and assign backup coverage for upcoming leave windows.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Band-Range Visual | A dual-dot visual of current vs. projected salary within a min-max band. | Manager · Planning, HR · Planning |
| Coverage Gap Card | An avatar plus 'covered by' dropdown and a Q-suggested one-click accept. | Manager · Planning, HR · Planning |
| Segmented Tabs / Filter Chip | A pill-shaped tab switcher or toggle chip with an active-segment highlight. | Manager · Planning, HR · Planning, Employee · Growth, Manager · Growth, HR · Payroll, Employee · Documents & Assets |
| Range Track | A dual-dot visualization of a value's position within a min-max band. | Manager · Planning, HR · Planning |

---

### Ticket 16 — Manager · Focus

**Route:** `/app/manager/focus`  
**Access:** Manager

**Page description:** A full-screen, priority-sorted action queue synthesizing every open task across the app (approvals, flight risk, coverage gaps, outstanding reviews, unallocated budget, live signals) into one swipeable list.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Synthesized task list | The Focus queue's priority-sorted aggregator, merging six-plus live data slices into one list. | Manager · Focus, HR · Focus |
| Priority Card | A colored-left-accent-bar card for anything urgency-ranked — icon+kicker header, title, detail, action row. | Manager · Focus, HR · Focus, HR · Payroll |
| Swipe Card | A drag-to-dismiss card wrapper (swipe right to clear), with an elastic threshold. | Manager · Focus, HR · Focus |
| Rationale Disclosure | A reusable 'Why this?' collapsible attached to any Q recommendation — why / why-now / worth noting / evidence, with a confidence dot. | Manager · Focus, HR · Focus, Employee · Home (Signal), Manager · Home, HR · Home |
| Stat Pill | A colored-dot count pill summarizing one status category at a glance — non-interactive. | Manager · Team, HR · Time & Holidays, Manager · Focus, HR · Focus, HR · Payroll, HR · Org / People |
| Kind-Meta lookup helper | A typed {label, icon, color} lookup-table pattern, currently reimplemented separately per feature. | HR · Time & Holidays, HR · Offboarding / Exits, Employee · Growth, Manager · Focus, HR · Focus |

---


## HR - The Org

### Ticket 17 — HR · Home

**Route:** `/app/hr`  
**Access:** HR / Admin

**Page description:** The HR/Admin landing screen — the same three home modes, with an org-wide action rail (current payroll-run status, onboarding pipeline preview, policy-acknowledgment compliance percentage, and an org-health signal card).

**Components:**

| Name | Description | Used in |
|---|---|---|
| Life Sphere Hub | The central identity disc ringed by domain-shortcut nodes on curved spokes. | Employee · Home (Signal), Manager · Home, HR · Home |
| Today Rail | The persona-specific right-hand action rail — collapsible to an icon capsule. | Employee · Home (Signal), Manager · Home, HR · Home |
| Token Card / Token Frame | The core draggable, three-layer data card — face (always visible), Layer 1 expand (long-hover/tap), Layer 2 peel (top-right corner, deeper AI detail). Every record in the app renders through this one primitive. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets, Employee · Calendar, Manager · Team, Manager · Approvals, HR · Org / People, HR · Payroll, Manager · Focus, HR · Focus |
| Corner Grammar | Four hover-revealed handles on every Token Card: top-left move (only drag entry), bottom-left stack (multi-select), top-right peel (toggle Layer 2), bottom-right close (hide). | Employee · Documents & Assets, Manager · Team, Employee · Home (Signal), Manager · Home, HR · Home |
| Q Orb | Animated glowing orb representing Q's mood (idle/listen/think/answer/alert), docked at the right end of the Cue bar. | Employee · Home (Signal), Manager · Home, HR · Home |
| The Cue | The bottom-center command bar — type or speak to Q; the app's one and only drag-to-Q drop target. | Employee · Home (Signal), Employee · Home (Board), Employee · Home (Workspace), Employee · Calendar, Manager · Home, HR · Home |
| Q Panel | The slide-in chat sidebar — full conversation log with rich response rendering (charts, CSV downloads, rationale, source citations, action buttons). | Employee · Home (Signal), Manager · Home, HR · Home |
| Contextual Add ("+") | The floating add menu whose contents change with persona, region, and home-view mode — the most context-sensitive component in the app. | Employee · Home (Signal), Employee · Home (Board), Employee · Home (Workspace), Manager · Home, HR · Home |
| Toasts | Top-center, auto-dismiss (3.2s) notification stack — ok / warn / info tones. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets |
| Wallpaper + Fluid Field | Selectable animated ambient background sitting beneath every screen — pure SVG/CSS, no canvas. | Employee · Home (Signal), Manager · Home, HR · Home, Overlay · Settings |
| Pulse Layer | A transient full-screen flash/ring/particle burst fired on every combine, relate, reject, and peel. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets |
| Sound + Haptics | Procedural Web Audio effects paired 1:1 with vibration feedback for every gesture. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets |
| Stat Pill | A colored-dot count pill summarizing one status category at a glance — non-interactive. | Manager · Team, HR · Time & Holidays, Manager · Focus, HR · Focus, HR · Payroll, HR · Org / People |

---

### Ticket 18 — HR · Org / People

**Route:** `/app/hr/people`  
**Access:** HR / Admin

**Page description:** The company-wide directory — a multi-root hierarchical org chart with automatic leaf-stacking and curved parent/child links, falling back to a plain roster grid at scale.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Constellation / Org Tree graph | A radial (manager) or hierarchical (HR) relationship graph of people. | Manager · Team, HR · Org / People |
| Roster grid | A searchable, department-filterable grid of person cards. | Manager · Team, HR · Org / People |
| Avatar | Seeded circular profile photo with a graceful fallback to a colored initial if the image fails to load. | Manager · Team, HR · Org / People, HR · Onboarding, Employee · Home (Signal), Manager · Home, HR · Home |
| Stat Pill | A colored-dot count pill summarizing one status category at a glance — non-interactive. | Manager · Team, HR · Time & Holidays, Manager · Focus, HR · Focus, HR · Payroll, HR · Org / People |
| Token Card / Token Frame | The core draggable, three-layer data card — face (always visible), Layer 1 expand (long-hover/tap), Layer 2 peel (top-right corner, deeper AI detail). Every record in the app renders through this one primitive. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets, Employee · Calendar, Manager · Team, Manager · Approvals, HR · Org / People, HR · Payroll, Manager · Focus, HR · Focus |

---

### Ticket 19 — HR · Payroll

**Route:** `/app/hr/payroll`  
**Access:** HR / Admin

**Page description:** The Pay Run Command Center — manage the current org-wide payroll run via a 4-stage progress tracker, an anomaly queue requiring human sign-off, and tabbed Register/Reconcile views with CSV export.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Stage Tracker | A numbered-circle progress rail for a multi-step process — done / current / future, connected by a line. | HR · Payroll |
| Anomaly Queue | Per-payslip cards flagged for required human sign-off before release. | HR · Payroll |
| Register list / Reconcile list | A full payslip listing, and a month-over-month delta view with named reasons. | HR · Payroll |
| Masked | Obscures a sensitive numeric value (pay, phone) behind bullet characters with a click-to-reveal eye toggle. | Employee · Payroll, HR · Payroll |
| Priority Card | A colored-left-accent-bar card for anything urgency-ranked — icon+kicker header, title, detail, action row. | Manager · Focus, HR · Focus, HR · Payroll |
| Segmented Tabs / Filter Chip | A pill-shaped tab switcher or toggle chip with an active-segment highlight. | Manager · Planning, HR · Planning, Employee · Growth, Manager · Growth, HR · Payroll, Employee · Documents & Assets |
| downloadTextFile utility | A client-side Blob-based text/CSV file download helper, currently duplicated three times. | Employee · Payroll, Employee · Documents & Assets, HR · Payroll |
| Stat Pill | A colored-dot count pill summarizing one status category at a glance — non-interactive. | Manager · Team, HR · Time & Holidays, Manager · Focus, HR · Focus, HR · Payroll, HR · Org / People |

---

### Ticket 20 — HR · Onboarding

**Route:** `/app/hr/onboarding`  
**Access:** HR / Admin

**Page description:** Manage incoming joiners — a per-candidate, 8-item checklist card with buddy assignment and live progress.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Per-candidate Checklist Card | An 8-item, owner-tagged onboarding checklist with buddy assignment and live progress. | HR · Onboarding |
| Progress Bar | A spring-animated fill bar used for goals, checklists, and comp bands. | HR · Offboarding / Exits, Employee · Growth, Manager · Growth, Manager · Planning, HR · Planning, HR · Onboarding |
| Avatar | Seeded circular profile photo with a graceful fallback to a colored initial if the image fails to load. | Manager · Team, HR · Org / People, HR · Onboarding, Employee · Home (Signal), Manager · Home, HR · Home |

---

### Ticket 21 — HR · Offboarding / Exits

**Route:** `/app/hr/exit`  
**Access:** HR / Admin

**Page description:** Manage departures — the structural mirror of Onboarding: a start-offboarding intake form and an 8-step exit checklist, with a hard-locked access-revoke step.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Start-offboarding form | A person / reason / last-day intake form that seeds the exit checklist. | HR · Offboarding / Exits |
| Checklist Row | A checkbox-square row with a strikethrough label and an owner tag. | HR · Offboarding / Exits, Employee · Growth, Manager · Growth, Overlay · Plain Mode |
| Progress Bar | A spring-animated fill bar used for goals, checklists, and comp bands. | HR · Offboarding / Exits, Employee · Growth, Manager · Growth, Manager · Planning, HR · Planning, HR · Onboarding |
| Access-revoke lock logic | A business rule that locks the 'revoke access' step until knowledge-transfer and asset-return are both done. | HR · Offboarding / Exits |
| Kind-Meta lookup helper | A typed {label, icon, color} lookup-table pattern, currently reimplemented separately per feature. | HR · Time & Holidays, HR · Offboarding / Exits, Employee · Growth, Manager · Focus, HR · Focus |

---

### Ticket 22 — HR · Policies

**Route:** `/app/hr/documents`  
**Access:** HR / Admin

**Page description:** HR's org-wide policy authoring surface — the same editor as Manager Documents, running with an added 'whole org' audience option and bulk nudge-non-acknowledgers action.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Entity editor panel | A title / body / type / audience / require-ack authoring form for documents and announcements. | Manager · Documents, HR · Policies |
| Activity log | A chronological list of the last few authoring actions. | Manager · Documents, HR · Policies |
| Status Badge | A status-tinted pill (draft / published / archived, or review status). | Manager · Documents, HR · Policies, Employee · Growth, Manager · Growth |
| Segmented Tabs / Filter Chip | A pill-shaped tab switcher or toggle chip with an active-segment highlight. | Manager · Planning, HR · Planning, Employee · Growth, Manager · Growth, HR · Payroll, Employee · Documents & Assets |

---

### Ticket 23 — HR · Time & Holidays

**Route:** `/app/hr/timeadmin`  
**Access:** HR / Admin

**Page description:** Org-wide leave-policy administration — leave-type allotment steppers and full holiday-calendar CRUD (national / company / restricted), with an 'announce changes' broadcast.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Leave-type stepper list | A list of leave types with a +/- annual-allotment stepper. | HR · Time & Holidays |
| Holiday CRUD list | Add/remove rows for the org holiday calendar (national / company / restricted). | HR · Time & Holidays |
| Stat Pill | A colored-dot count pill summarizing one status category at a glance — non-interactive. | Manager · Team, HR · Time & Holidays, Manager · Focus, HR · Focus, HR · Payroll, HR · Org / People |
| Kind-Meta lookup helper | A typed {label, icon, color} lookup-table pattern, currently reimplemented separately per feature. | HR · Time & Holidays, HR · Offboarding / Exits, Employee · Growth, Manager · Focus, HR · Focus |

---

### Ticket 24 — HR · Planning

**Route:** `/app/hr/planning`  
**Access:** HR / Admin

**Page description:** The same Planning component used by Manager; HR reviews and approves compensation plans once a manager has submitted them, rather than editing raises directly.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Band-Range Visual | A dual-dot visual of current vs. projected salary within a min-max band. | Manager · Planning, HR · Planning |
| Coverage Gap Card | An avatar plus 'covered by' dropdown and a Q-suggested one-click accept. | Manager · Planning, HR · Planning |
| Segmented Tabs / Filter Chip | A pill-shaped tab switcher or toggle chip with an active-segment highlight. | Manager · Planning, HR · Planning, Employee · Growth, Manager · Growth, HR · Payroll, Employee · Documents & Assets |
| Range Track | A dual-dot visualization of a value's position within a min-max band. | Manager · Planning, HR · Planning |

---

### Ticket 25 — HR · Insights / Analytics

**Route:** `/app/hr/analytics`  
**Access:** HR / Admin

**Page description:** Org-wide analytics, mirroring the Manager Insights page at company scale.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Talent 2x2 grid | A performance x potential quadrant grid of clickable person chips. | Manager · Insights / Analytics, HR · Insights / Analytics |
| Time-off heatmap | A team x week color-intensity absence grid. | Manager · Insights / Analytics, HR · Insights / Analytics |
| Chart primitives | A small hand-rolled chart library — grouped bars, mini progress lists, an SVG line/area trend, a radial gauge, heatmaps, stacked bars. | Employee · Growth, Manager · Insights / Analytics, HR · Insights / Analytics, Manager · Focus, HR · Focus, Employee · Payroll, Overlay · Retention Simulator |

---

### Ticket 26 — HR · Focus

**Route:** `/app/hr/focus`  
**Access:** HR / Admin

**Page description:** An HR-flavored priority queue — pooled/anomalous payslips, a submitted comp plan awaiting approval, near-complete onboarding candidates with no buddy assigned, and org-wide flight-risk people.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Synthesized task list | The Focus queue's priority-sorted aggregator, merging six-plus live data slices into one list. | Manager · Focus, HR · Focus |
| Priority Card | A colored-left-accent-bar card for anything urgency-ranked — icon+kicker header, title, detail, action row. | Manager · Focus, HR · Focus, HR · Payroll |
| Swipe Card | A drag-to-dismiss card wrapper (swipe right to clear), with an elastic threshold. | Manager · Focus, HR · Focus |
| Rationale Disclosure | A reusable 'Why this?' collapsible attached to any Q recommendation — why / why-now / worth noting / evidence, with a confidence dot. | Manager · Focus, HR · Focus, Employee · Home (Signal), Manager · Home, HR · Home |
| Stat Pill | A colored-dot count pill summarizing one status category at a glance — non-interactive. | Manager · Team, HR · Time & Holidays, Manager · Focus, HR · Focus, HR · Payroll, HR · Org / People |

---


## Cross-Persona Overlays

### Ticket 27 — Overlay · Settings

**Route:** `overlay = settings`  
**Access:** All personas

**Page description:** The personalization and preview overlay — wallpaper picker, avatar picker, a live Role & Access preview (the only place persona/lens access is actually granted), and system toggles (theme, sound, ambient motion, Plain mode).

**Components:**

| Name | Description | Used in |
|---|---|---|
| Modal shell | The shared dialog chrome — scrim, glass card, icon+title+close header, scrollable body — reused by every overlay. | Overlay · Settings, Overlay · Add Person, Overlay · Add Leave Type, Overlay · Add Leave, Overlay · Team Availability Matrix, Overlay · Document Viewer |
| Wallpaper + Fluid Field | Selectable animated ambient background sitting beneath every screen — pure SVG/CSS, no canvas. | Employee · Home (Signal), Manager · Home, HR · Home, Overlay · Settings |

---

### Ticket 28 — Overlay · Team Availability Matrix

**Route:** `overlay = matrix`  
**Access:** Manager / HR

**Page description:** A read-only overlay showing a 14-day x teammate availability grid (in-office / remote / on-leave / weekend), with a per-day coverage-dip indicator.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Modal shell | The shared dialog chrome — scrim, glass card, icon+title+close header, scrollable body — reused by every overlay. | Overlay · Settings, Overlay · Add Person, Overlay · Add Leave Type, Overlay · Add Leave, Overlay · Team Availability Matrix, Overlay · Document Viewer |
| Availability grid | A 14-day x teammate in/remote/leave/weekend grid with a daily coverage-dip row. | Overlay · Team Availability Matrix |

---

### Ticket 29 — Overlay · Add Person

**Route:** `overlay = addPerson`  
**Access:** HR

**Page description:** A small overlay form to add a new person to the org, immediately visible in the org graph and roster.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Modal shell | The shared dialog chrome — scrim, glass card, icon+title+close header, scrollable body — reused by every overlay. | Overlay · Settings, Overlay · Add Person, Overlay · Add Leave Type, Overlay · Add Leave, Overlay · Team Availability Matrix, Overlay · Document Viewer |
| Person / Leave-Type / Duration forms | Simple field forms powering the Add Person, Add Leave Type, and Add Leave overlays. | Overlay · Add Person, Overlay · Add Leave Type, Overlay · Add Leave |

---

### Ticket 30 — Overlay · Add Leave Type

**Route:** `overlay = addType`  
**Access:** HR

**Page description:** A small overlay form to define a new leave type and its annual allotment.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Modal shell | The shared dialog chrome — scrim, glass card, icon+title+close header, scrollable body — reused by every overlay. | Overlay · Settings, Overlay · Add Person, Overlay · Add Leave Type, Overlay · Add Leave, Overlay · Team Availability Matrix, Overlay · Document Viewer |
| Person / Leave-Type / Duration forms | Simple field forms powering the Add Person, Add Leave Type, and Add Leave overlays. | Overlay · Add Person, Overlay · Add Leave Type, Overlay · Add Leave |

---

### Ticket 31 — Overlay · Add Leave

**Route:** `overlay = addLeave`  
**Access:** Manager / HR

**Page description:** A two-step overlay wizard (pick a person, then type/mode/dates) for logging leave on behalf of a report.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Modal shell | The shared dialog chrome — scrim, glass card, icon+title+close header, scrollable body — reused by every overlay. | Overlay · Settings, Overlay · Add Person, Overlay · Add Leave Type, Overlay · Add Leave, Overlay · Team Availability Matrix, Overlay · Document Viewer |
| 2-step Add Leave wizard | A person-picker step followed by a type/date step. | Overlay · Add Leave |
| Person / Leave-Type / Duration forms | Simple field forms powering the Add Person, Add Leave Type, and Add Leave overlays. | Overlay · Add Person, Overlay · Add Leave Type, Overlay · Add Leave |

---

### Ticket 32 — Overlay · Document Viewer

**Route:** `docView (global id)`  
**Access:** All personas

**Page description:** A global, full-text reading overlay for any single document, triggered from anywhere by setting one shared id rather than mounting a per-card modal.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Modal shell | The shared dialog chrome — scrim, glass card, icon+title+close header, scrollable body — reused by every overlay. | Overlay · Settings, Overlay · Add Person, Overlay · Add Leave Type, Overlay · Add Leave, Overlay · Team Availability Matrix, Overlay · Document Viewer |
| Concept Icon + registry | One glyph and one semantic tint bound to each of ~46 named concepts — the single source of truth for icon usage app-wide. | Employee · Home (Signal), Manager · Home, HR · Home, Employee · Documents & Assets, Overlay · Document Viewer |

---

### Ticket 33 — Overlay · Canvas (Vibe Studio)

**Route:** `vibeOpen = true`  
**Access:** Manager / HR

**Page description:** A chat-driven, no-code BI/dashboard builder — describe a metric or report in plain language (or pick a template) and get a live mini-app generated from the team's data, with rename/duplicate/export/refine/share actions.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Canvas history rail | A list of previously built Canvas tools, click to reload into the chat thread. | Overlay · Canvas (Vibe Studio) |
| Chat thread with generated app cards | The conversational interface where Q builds a live widget inline. | Overlay · Canvas (Vibe Studio) |
| Widget templates (17) + generic primitives | Pre-built (flight-risk, comp-vs-perf, coverage, etc.) and freeform (kpi/gauge/trend/bars/table/timeline) generators. | Overlay · Canvas (Vibe Studio) |
| Recipes rail | One-click bundles that build several Canvas tools in a single action. | Overlay · Canvas (Vibe Studio) |
| Chart primitives | A small hand-rolled chart library — grouped bars, mini progress lists, an SVG line/area trend, a radial gauge, heatmaps, stacked bars. | Employee · Growth, Manager · Insights / Analytics, HR · Insights / Analytics, Manager · Focus, HR · Focus, Employee · Payroll, Overlay · Retention Simulator |

---

### Ticket 34 — Overlay · Retention Simulator

**Route:** `sim != null`  
**Access:** Manager / HR

**Page description:** A what-if modal for modeling a retention intervention (bonus, high-visibility project, or promotion) against a flight-risk person, with a live before/after risk gauge.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Modal shell | The shared dialog chrome — scrim, glass card, icon+title+close header, scrollable body — reused by every overlay. | Overlay · Settings, Overlay · Add Person, Overlay · Add Leave Type, Overlay · Add Leave, Overlay · Team Availability Matrix, Overlay · Document Viewer |
| Lever chip picker | A 3-option intervention picker (bonus / project / promotion). | Overlay · Retention Simulator |
| RetentionGauge | An SVG radial gauge visualizing before/after flight-risk score. | Overlay · Retention Simulator |
| Chart primitives | A small hand-rolled chart library — grouped bars, mini progress lists, an SVG line/area trend, a radial gauge, heatmaps, stacked bars. | Employee · Growth, Manager · Insights / Analytics, HR · Insights / Analytics, Manager · Focus, HR · Focus, Employee · Payroll, Overlay · Retention Simulator |

---

### Ticket 35 — Overlay · Gesture Legend

**Route:** `showLegend = true`  
**Access:** All personas

**Page description:** An on-demand cheat-sheet naming the app's full gesture vocabulary plus the keyboard shortcut map.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Modal shell | The shared dialog chrome — scrim, glass card, icon+title+close header, scrollable body — reused by every overlay. | Overlay · Settings, Overlay · Add Person, Overlay · Add Leave Type, Overlay · Add Leave, Overlay · Team Availability Matrix, Overlay · Document Viewer |
| Gesture cheat-sheet grid | A card grid naming each gesture, its definition, and how to trigger it. | Overlay · Gesture Legend |

---

### Ticket 36 — Overlay · Product Tour

**Route:** `showTour = true`  
**Access:** All personas

**Page description:** A persona-aware, spotlight-and-card first-run coach-mark sequence (4-5 steps), replayable anytime from Settings.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Spotlight overlay / Step card | A coach-mark spotlight ring paired with a step-by-step instructional card. | Overlay · Product Tour |

---

### Ticket 37 — Overlay · Plain Mode

**Route:** `plain = true`  
**Access:** All personas

**Page description:** A complete accessibility fallback — the entire spatial, gesture-driven UI is replaced with one flat, scrollable page of plain sections and ordinary buttons operating on the exact same underlying data.

**Components:**

| Name | Description | Used in |
|---|---|---|
| Flat accessible layout | Plain scrollable sections with ordinary buttons, replacing the spatial canvas entirely. | Overlay · Plain Mode |
| Checklist Row | A checkbox-square row with a strikethrough label and an owner tag. | HR · Offboarding / Exits, Employee · Growth, Manager · Growth, Overlay · Plain Mode |
| Masked | Obscures a sensitive numeric value (pay, phone) behind bullet characters with a click-to-reveal eye toggle. | Employee · Payroll, HR · Payroll |

---
