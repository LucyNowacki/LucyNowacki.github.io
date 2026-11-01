# Gridder 2

A separate Phaser 4.2.1 edition of Lucy's educational Gridder. Paint closed loops,
discover features of functions, and survive family-specific land monsters and
hungry neon leeches and a pool shark. Source:
`subsites/gridder-v2/`; Nikola destination: `/gridder-v2/`.

## Speech removed

At Lucy's request on 28 October 2026, the game no longer offers narration,
ChatGPT sessions, spoken maths clues or desktop voice following. The local
preview is a static server and provides no voice or model-chat endpoints.
Gridder's visual expressions, blinking, crab walk, maths explanations, music
and game sound effects remain.

The preceding app and server are preserved in
`backups/gridder-v2/before-remove-speech-20261028T164935Z/`.

## Play locally

From `/home/lucy/Documents/web10`:

```sh
python tools/gridder-v2/preview.py
```

Open <http://127.0.0.1:8767/gridder-v2/>. The same preview serves the original
lesson link. Stop it with Ctrl+C. Everything needed by the game is local;
opening `index.html` directly with `file://` does not support audio/asset loading.

Choose **Start game**, use the arrows or hold the direction buttons, and press
Escape to pause. Controls retain the original speed, four node-resolution
sliders, centre pause, difficulty, hints, practice mode and sound toggle.
Gridder starts at **270 px/s**; the speed slider remains adjustable.
Clear-water pools remove internal grid edges. Follow their shores: Gridder
and land monsters use the remaining paths, and water cannot be captured.
Leeches swim in the pools. Escape their flashing warning ring before the
lunge, or Gridder is dragged underwater for one life. Uncheck **Monsters, sharks and leeches** for safe practice.
**Float** opens the live mathematical mission in a movable, resizable window;
drag its title, resize an edge/corner, double-click the title to expand/restore,
or pin it while scrolling. Focus its title and use arrows to move, Shift+arrows
to resize. **Dock** returns the same live maths to the page.

The arcade layout shows the current objective above the grid and a live level
strip above the game. Repeated minima, maxima and inflections are numbered from
left to right. The mathematical clue stays expanded above the board. The right
panel displays **Mathematics for this level**: the actual function and derivative
formulas, three reasoning steps, interpretation, real domain/branch and grid
task. Completing a level adds its full worked solution and substitutions.
Function, level and normal-anchor changes refresh the same live explanation.
**Choose your challenge**
opens the family, subfamily, function and difficulty pickers. The six movement
sliders stay exposed, with **Half in / Half out** arranged side by side.

The canvas fills its available width at the grid's natural 3:2 cell proportions,
eliminating blank bands. The page scrolls when needed rather than shrinking the
playing field to fit the browser height. Desktop controls scroll independently
in a sticky console. Its width grows proportionally with the game window;
`panel-layout.js` fits its height to the actual visible space below the header
on resize, scrolling and header changes. Narrow layouts stack the expanded
mathematics before movement settings below the game.

Gridder 2 now uses the dark plum arcade palette, with lilac controls, teal
maths clues and a dark canvas. Lighter actor outlines keep both spiders and
all capture phases visible. The complete prior light arcade is saved in
`backups/gridder-v2/light-arcade-20261019T115006Z/` (28 verified files).

**Visual style** switches between Neon plum and Plain plum without resetting
the game. Each function has its own neon palette, stable across its levels.
Curves and the internal lattice glow; the playable border stays crisp and unlit.
Discovered derivatives, second derivatives, inverse branches and normals have
travelling neon highlights over their bright cores and broad halos. Revealed
minima, maxima and inflections have expanding light rings. The mathematical
positions remain fixed and undiscovered curve portions stay masked.
Pausing unfinished play freezes the animation. Completed discoveries keep
animating while the page is visible, including after returning from another
tab or chat. Reduced-motion settings and Plain plum keep the highlights steady.
Captured areas remain translucent. The six movement sliders return focus to
the board on pointer release; after keyboard adjustments, press Enter.

Gridder reacts to nearby threats with wide eyes, raised brows and a frightened
mouth, then relaxes after escape. His moving face and pushing strain retain the
shared game clock. Both spiders have articulated legs, moving ivory teeth,
and branching neon red veins carrying visible blood during a capture.

Black pursues horizontally first and white vertically first. The centipede
chooses the greater remaining screen distance at grid junctions and pursues
more quickly. Its head catches Gridder; its trailing body is safe to cross.
All three stop for four active seconds to eat a remnant. Spider meals add
30% size and 2% speed. Centipede meals add two segments to its initial six
trailing segments and 2% speed. Each blood meal adds 15% size to the attacker, animated gradually through
the two-second drinking phase and retained afterwards. Earned
growth carries between levels and resets when restarting a function.
Capture still lasts 250/2000/650/900 ms for bite, swell, decay and scatter.
Gameplay motion, flow, expressions and feeding pause with the simulation.

## Monsters for each function family

The selected **family** determines a stable trio across all its subfamilies,
representative functions and levels:

| Family | Compact monsters | Segmented monster |
|---|---|---|
| Algebraic | Obsidian spider · Crystal beetle | Jade centipede |
| Transcendental | Ember scorpion · Prism mantis | Volt wyrm |
| Structural and behavioural | Mirror crab · Thorn crawler | Lantern millipede |

The silhouettes have animated claws, shells, stingers, forearms or body rings,
with distinct neon colours, teeth and the existing blood/feeding effects.
The Ember scorpion strikes with its articulated tail: its stinger contacts
Gridder during the catch and blood flows along the tail during draining.
The existing collision rules, capture timings and life cost are retained.
Long bodies follow the recorded grid route through every corner, grow after
remnant meals, and remain safe to cross behind the biting head.
The selected family takes precedence when a function belongs to several groups.
The three chase roles retain their direction preferences when routes tie.
With pools present, they choose shortest available routes around the water.
All mathematical objectives remain unchanged.
`monster-roster.js` supplies identities and colours; `actors.js` draws them.
The challenge picker lists the current trio; capture/feeding messages use its
names. Focused checks: `test-family-monsters.cjs` and `test-family-monsters.py`
under `tools/gridder-v2/`, with evidence in `family-monster-evidence/`.

## Liquid gaps in the grid

Each function and objective receives a deterministic arrangement of connected,
hole-free pools. Guided requests two to four, Explorer three to five and
Challenge four to six where the protected mathematics leaves space.
Twelve shape families include corners, L and T shapes, steps and rectangles,
with rotations and reflections. The planner rewards diversity, preferring
larger shapes before small fallback pools.
Their shorelines remain walkable and a full dry cell separates adjacent pools
and the outer border. Placement balances clearance from the mathematics,
spacing and useful detours; it is a greedy design heuristic, not a proof of
globally optimal placement.

The entire current target, its hidden parts, the displayed original function
and previously revealed points are protected. Protection uses the catalogue's
continuous finite branches and analytic critical points, not drawing samples.
Every accepted arrangement checks dry-grid connectivity and retains all four
edges of every target rectangle. Pools remain fixed during play; a new
objective or normal anchor recalculates the arrangement.

Ocean-blue water shows a sandy, rocky bottom through moving refraction, with
recessed walls, depth shading, caustic light and restrained surface reflections.
WebGL uses persistent local fragment shaders; Canvas uses cached seabed textures
with animated strip refraction. Both use the actual cell-union mask, including
transparent dry notches, and remain below the lattice and mathematics.
Water moves on the initial board and after completion, freezes on an unfinished
game's pause, and stays still when reduced motion is requested.

Small two-cell pools hold one leech, three/four-cell pools hold two, and pools
of five or more cells hold three. Their patrol starts, swim phases and first
attack windows are staggered. They follow adjacent occupied cells without
crossing dry cutouts. At a nearby shore each warns for 600 ms before
lunging; moving away cancels its attack. A catch takes exactly one life and
shows a 650 ms drag, two seconds of visible blood flow, then sinking and
resurrection. The leech grows 15% thicker after drinking. Land monsters
retain their existing capture sequence. Pause freezes the encounter and
reduced motion steadies decorative light and wiggles.

Sources: `grid-gaps.js`, `gap-navigation.js`, `liquid-gaps.js`, `ocean-water.js`,
`pool-leeches.js` and `leech-actors.js`, with controller, chase and renderer
integration. Focused checks under `tools/gridder-v2/`:
`test-grid-gaps.cjs`, `test-gap-navigation.cjs`, `test-pool-leeches.cjs`,
`test-leech-controller.cjs` and `test-varied-pools-leeches.py`.
The earlier `test-liquid-gaps.py` and `test-ocean-water.py` retain evidence
for preceding water implementations. See
`docs/chebby/agents/gridder-team/VARIED-POOLS-LEECHES.md` for current evidence
and scope.

## Shark, eggs and visiting insects

The largest available pool also holds one shark. Its warning lasts 900 ms,
leaving time to move away from the shore. A catch uses the underwater bite and
drain sequence and costs one life. Blood flows into that pool and gradually
changes its clear blue hue toward red, preserving its visible seabed. The stain
persists for that board; other pools stay blue.

A centipede is large enough to breed after two remnant meals (ten body segments)
or when its body scale reaches 1.3 from drinking. It can lay a clutch of one or
two eggs on a legal dry node every 30 seconds. Accepted clutches hatch exactly
ten active seconds later into differently coloured centipedes. Offspring follow
the same edge routes and head-only contact rules. Birth capacity is reserved at
laying time, up to twelve permanent/hatched creatures, so accepted eggs always
hatch on time.

Every sixty active seconds a species not already present enters at a distant
border. Up to three visiting insects remain for three minutes each, maintaining
variety without unbounded growth. The active timer excludes pause, capture,
resurrection, completed levels and practice mode. It carries between levels of
the current function. Eggs and visitors belong to their current board; restarting
the function resets the ecology clock and all creatures.

Sources: `creature-ecology.js`, `core/gridder-chase.js`, `monster-roster.js`,
`pool-leeches.js`, the controller and water/creature renderers. Regression evidence
and boundaries are recorded in `docs/chebby/agents/gridder-team/ECOSYSTEM.md`.
The preceding 54-file app is preserved at
`backups/gridder-v2/before-ecology-20261028T172911Z/gridder-v2.tar.gz`.

## Chebby as Gridder

The decorative face in the top-left header is three times its previous size:
144 × 108 CSS pixels on desktop and 120 × 90 on narrow screens.

Gridder now uses Chebby's original axolotl head, face and gills, with his
existing movement, threat, relief and capture reactions. A visual-only bootstrap
loads the original face painter and supplies natural blinking. During a bite and draining,
his face uses the atlas's round O-mouth and widened eyes instead of the resting
smile. Decay keeps the open mouth with tired eyelids. These cached capture
expressions use cached face artwork and restore the resting face afterwards.

Six jointed legs step independently during actual travel, alongside his original
animated gill fans. Gridder is 25% larger than the previous version.
The added legs are now 25% shorter and thinner; their phase follows distance
travelled, with smooth starts and a short settling motion on ordinary stops.
Each cycle now covers 120 reference pixels, giving about 2.25 cycles per second
at the starting 270px/s outside slow node boxes.
Pause and capture immediately stop the walking gait.
His size and the insects' sizes follow the board's plot width, including
earned growth. Collision distances, remains and the centipede's corner-following
body use the same scale.
His eyes and mouth lead in the direction of movement. Brief node waits of at
most 90ms keep that facing while the movement key remains held, with the gait
phase frozen; this avoids a flash of the upright pose at every ordinary node.
He returns upright on release, pause, long centre waits and border stops. Holding against the border
does not animate a false walk.
The header portrait uses the same original neutral face instead of the old
round smiley icon.

On the game board, smaller native-colour pupils look in the actual direction of
travel, with the head rotation accounted for. They centre when Gridder stops,
look toward a nearby threat and contract further during an insect attack. Eye
reactions use the pause-aware game clock. The header portrait keeps its original
eyes. This is a presentation change; movement and collision geometry are unchanged.


The pre-change app is saved in
`backups/gridder-v2/before-chebby-gridder-20261020T082613Z/gridder-v2.tar.gz`.
The version before crab walking is saved in
`backups/gridder-v2/before-crab-walk-20261020T092708Z/gridder-v2.tar.gz`.
The 40-file version before articulated legs, proportional sizing and new audio
is saved in `backups/gridder-v2/before-scale-sound-20261020T110927Z/gridder-v2.tar.gz`.
Provenance, architecture and acceptance limits:
`docs/chebby/agents/gridder-team/CHEBBY-GRIDDER.md`.

The complete pre-creature app is backed up in
`backups/gridder-v2/before-creature-animations-20261019T195554Z/`.

## Sound and music

**Start game** enables browser audio. **Sound effects** controls soft walking
steps, the bite and flowing-drain sounds, and a completion chime whenever a
closed loop fills rectangles. Filling several at once makes a richer flourish.
Blocked movement and centre waits have no walking loop.

**Music · Boléro** plays a synthesized arrangement of Ravel's opening theme:
a 60-second loop at 72 BPM in 3/4, with flute, pizzicato accompaniment and
the characteristic two-bar snare rhythm. This is an excerpt arrangement;
the complete orchestral work is not included. Score sources and transcription
details are in `audio/bolero-provenance.json`; all PCM is synthesized locally.
The music toggle, **Music volume** slider (0–100%, initially 30%) and separate
**Sound effects** toggle sit directly beneath the Start and movement controls.
Music pauses during capture, resurrection, game pause and hidden-page
states. Restart resets the tune. Sound effects and music can be switched
independently; the original resurrection voices remain.

## Backup before the arcade layout

The complete previous app, test tools, routing reference and team handover are
saved in `backups/gridder-v2/before-arcade-20261019T113706Z/`. Its archive contains
67 files, all read back and checked against `manifest.json`; `SHA256SUMS` records
the archive checksum. Extract into a separate folder to review or restore the
old app. Preserve unrelated current changes when consulting the saved `conf.py`.

## Preserved game and mathematics

- Three families, 15 subfamilies, 34 functions and 187 ordered objectives,
  including extrema, inflections, first/second derivatives, restricted inverses
  and normals with the vertical-normal case.
- Exact closed-cell targets, 3:2 screen cells, continuous movement, 1/16 taps,
  buffered turns, partial painting and complete enclosed-region fills.
- Seven lives, three starting pursuers, swept collisions, protection, four capture phases,
  24 persistent pieces, pushing, 40 ms snags, four-second feeding, growth,
  resurrection and final Game Over. Paint and earned growth carry as before.
- Local phase sounds, scraping/chewing, completion chimes and the original
  resurrection duet/devil announcement, with cancellation on pause/mute/reset.
- HTML controls, readouts and MathJax clues/solutions. The new desktop layout
  places the expanded maths alongside the field; narrow layouts stack it below.

The complete pre-restoration dark app is retained in
`backups/gridder-v2/before-maths-restoration-20261019T154046Z/` (28 verified files).

The original game and derivative lesson in `files/interactive/derivative/`, and
the ODE subsite, remain separate. The protected-source manifest checks all 68
files against their pre-implementation hashes. No original source was rewritten.

## Architecture and dependencies

`core/math.js`, `gridder-math.js`, `gridder-catalogue.js` and `worked.js` are
byte-identical copies of the original independent mathematical modules.
`controller.js` keeps the original simulation rules and exposes snapshots;
Phaser owns the frame clock and keyboard routing. `renderer.js` and `actors.js`
draw persistent native graphics objects. Mathematical target tests use analytic
domains/critical points, independently of the display curve samples.

`app.js` selects WebGL with Canvas fallback. Geometry uses the model's CSS-pixel
layout, including fractional container sizes, so drawing and contact agree.
The existing sound engine uses Phaser's shared AudioContext and output bus.
Core adaptations expose defensive capture trajectories, select the shared
audio context, correct fractional pursuit, and add the centipede and its trail. HTML and MathJax stay outside the canvas.
`case-maths.js` adds pure teaching text from the catalogue's mathematical rules;
it distinguishes stationary candidates, classification tests and inflection
criteria, restricted inverses, and live normals including the vertical case.
Point-target coordinates remain for the unlocked worked solution.

Phaser is pinned to **4.2.1**, from the
[official release](https://github.com/phaserjs/phaser/releases/tag/v4.2.1),
with its MIT licence. MathJax is copied from the existing lesson with its
licence. `DEPENDENCIES.json` records origins and hashes. The original voice assets remain; `audio/angel-voices.json` retains its
provenance. Resurrection uses a generated transparent 4 × 2 angel sprite atlas
(`assets/resurrection-angel-sprites.png`), with two characters and four wing poses
each. Frame changes and gentle hovering use the pause-aware game clock; the
original duration and music remain. Artwork prompts are recorded in
`tools/gridder-v2/ANGEL-ART-PROMPTS.md`; the original static artwork is retained. No package installation or runtime CDN is required.

The established local vendor route is retained. `render-capabilities.js` uses
Phaser 4's object-scoped Mask filter in WebGL and GeometryMask in Canvas for
the same captured-cell reveal geometry. Its cached mask updates only when the
reveal/layout changes. `visual-theme.js` supplies presentation presets without
changing gameplay or mathematics. The complete verified pre-migration app,
tools and team records are in
`backups/gridder-v2/before-phaser4-20261019T174208Z/` (80 files). Detailed changes,
acceptance evidence and rollback instructions are in
`docs/chebby/agents/gridder-team/PHASER4-MIGRATION.md`.

## Verification

```sh
node tools/gridder-v2/run-core.cjs
node tools/gridder-v2/run-controller.cjs
node tools/gridder-v2/phaser4-parity.cjs --math-only
node tools/gridder-v2/test-creature-chase.cjs
node tools/gridder-v2/test-creature-controller.cjs
node tools/gridder-v2/test-fang-containment.cjs
node tools/gridder-v2/test-sprite-scale.cjs
node tools/gridder-v2/test-arcade-audio.cjs
node tools/gridder-v2/test-smooth-gait.cjs
node tools/gridder-v2/test-avatar-cache.cjs
/home/lucy/anaconda3/envs/lucy/bin/python tools/gridder-v2/test-walk-performance.py
/home/lucy/anaconda3/envs/lucy/bin/python tools/gridder-v2/test-bolero-gait.py
/home/lucy/anaconda3/envs/lucy/bin/python tools/gridder-v2/test-scale-audio.py
/home/lucy/anaconda3/envs/lucy/bin/python tools/gridder-v2/test-crab-walk.py
/home/lucy/anaconda3/envs/lucy/bin/python tools/gridder-v2/test-creature-animations.py
/home/lucy/anaconda3/envs/lucy/bin/python tools/gridder-v2/test-browser.py
/home/lucy/anaconda3/envs/lucy/bin/python tools/gridder-v2/test-scenes.py
/home/lucy/anaconda3/envs/lucy/bin/python tools/gridder-v2/test-live.py
/home/lucy/anaconda3/envs/lucy/bin/python tools/gridder-v2/test-phaser4-acceptance.py --full
/home/lucy/anaconda3/envs/lucy/bin/python tools/gridder-v2/benchmark-browser.py
/home/lucy/anaconda3/envs/lucy/bin/python tools/gridder-v2/build.py
```

Browser scripts use the existing Playwright installation and system Chrome in
isolated temporary profiles. They write evidence to `/tmp/gridder-v2-qa`.
Core/controller tests cover all 187 levels through keyboard walks. Browser
acceptance covers WebGL and Canvas, six viewport sizes, rendered objective
types, capture/remains/angels, maths-window interactions, real audio buffers
and trusted input with the unmodified live clock. Eight paired scene checks
verify temporal changes in gait, chewing, sweeping, sweat and capture effects,
as well as unchanged pixels when the same paused state is redrawn. The historical actor-byte preservation test applies to the earlier palette-only
tranche. The authorized character redesign is checked by the creature suites;
full pre-migration gameplay parity is historical, while --math-only retains
the exact original mathematical baseline.
The restored-maths checks cover all 187 lessons, including 1,584 actual MathJax
expressions. A single live page is resized through six window dimensions to
check proportional sidebar width, available height and mobile stacking.
Scene fixtures deliberately prepare states for visual inspection; they do not
claim natural completion.
`test-scale-audio.py` is the current focused acceptance for the six-leg avatar,
25% size increase, proportional creature sizing and added audio; the earlier
Chebby/crab suites retain historical crop/size assertions. It writes
`tools/gridder-v2/scale-audio-evidence/` and checks actual native WebGL/Canvas
pixels, controller actions and WebAudio sources. See
`docs/chebby/agents/gridder-team/SCALE-AUDIO.md` for the scope and limits.
The later `test-bolero-gait.py` suite covers the shorter, smoother legs, Boléro,
visible music volume and the 270px/s default. Its evidence is kept separately in
`tools/gridder-v2/bolero-gait-evidence/`; older audio-duration/gait assertions
describe the preceding versions.
`test-walk-performance.py` compares the saved Boléro version against the
optimized walking/rendering pipeline. It measures CPU work, layout reads,
texture uploads and gait behavior; it does not certify hardware GPU frame rate.

The comparison measures CPU model advance plus SVG/Phaser command construction
at an equal 800×500 board size. It does **not** measure whole-frame FPS, GPU
completion, physical input latency or hardware acceleration.

The isolated Nikola build copies and hash-verifies this app into
`/tmp/gridder-v2-nikola/output/gridder-v2/`; it never rebuilds the site's existing
`output/` or `cache/`. The source route is registered in `conf.py`. No deployment
has been performed. Details and limits are recorded in
`tools/gridder-v2/REQUIREMENTS.md` and
`docs/chebby/agents/gridder-team/IMPLEMENTATION.md`.

Earlier speech-specific suites and evidence describe the archived implementation;
they are not current acceptance checks after speech removal.

Chrome 155 with software WebGL and forced Canvas were exercised. Firefox,
Safari/WebKit, physical touch devices, GPU-specific behaviour, screen readers
and actual loudspeaker output still need acceptance on those devices.
