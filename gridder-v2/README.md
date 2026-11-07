# Gridder 2

On phones and tablets, water uses the masked animated texture renderer to avoid
a reported mobile shader artifact. Desktop WebGL keeps the procedural ocean
shader. Both paths follow the same container shapes and game clock.
Phones and tablets also use Phaser's Canvas renderer for reliable discovered
solution curves and GeometryMask clipping. Desktop rendering remains automatic.

A separate Phaser 4.2.1 edition of Lucy's educational Gridder. Paint closed loops,
discover features of functions, and survive family-specific land monsters and
hungry neon leeches and a pool shark. Source:
`subsites/gridder-v2/`; Nikola destination: `/gridder-v2/`.

## MAGA crawler — 7 November 2026

A distinct armored segmented creature starts with four abdomen balls bearing
red M, A, G, A lettering and jointed walking legs. Every consumed remnant and
every kill of Gridder adds two more balls, continuing the MAGA letter cycle.
It follows the existing grid
edges and unfolds its tail along travelled corners. It appears in the third
slot on level 2 of each function, after the opening folklore trio, and also
belongs to the wider monster roster. Its hatchlings inherit the same anatomy.

## Character voices and electric explosion — 7 November 2026

The witch says "convergy theraphy" three times in a louder, mocking female
voice, with rising pitch across her shock attack; an explosion sounds when
Gridder scatters. The house's two "rotten egg" calls use a female voice, while
Boruta says "I am a Polish devil" in a deep male voice. Locally synthesized
voice clips are embedded for file
loading and seek to their saved position after pause. Existing smoke,
plasma, movement and resurrection timing remain in place.

## Attack smoke and speech — 7 November 2026

Gridder emits rising smoke while the witch shocks him or Boruta burns him.
The witch's broom bears red "TERF" lettering, and her plasma attack has sharp
electrical sparks and crackles. The hen-leg house says "rotten egg" twice
during its attack. The local two-call voice clip is embedded for reliable
direct-file loading and follows the same pause, mute and resume controls as
the attack sounds. Capture timing and resurrection remain in place.

## Witch plasma shocks — 7 November 2026

The witch directs multiple violet electrical filaments towards Gridder, with
branching paths, pale cores and purple halos. Their movement follows the
capture clock, including paused and reduced-motion rendering. Contact rules,
capture timing, sound and resurrection follow the existing folklore attack.

## Fire, electricity and rotten eggs — 6 November 2026

Boruta catches Gridder with a stream of fire, the broom witch strikes with
electricity, and the hen-leg house launches rotten eggs that break into green
splats. Each has a distinct Gridder reaction and procedural sound. These
replace their draining capture visuals while retaining grid-edge pursuit,
contact detection, one lost life, pause and the angel resurrection sequence.
The opening trio and all other creatures keep their existing behavior. Details
and verification: `docs/chebby/agents/gridder-team/FOLKLORE-ATTACKS.md`.

## Folklore visitors and lightning eggs — 6 November 2026

Five additional species bring the roster to **44**: a witch riding a broom,
a hopping house on **one** articulated hen's leg, **Diabeł Boruta**, a sheet
ghost and a wisp ghost. Their logical positions still follow the grid edges.
The witch has hinged knees, the house bends its knee and plants its three-toed
foot before hopping, and the ghosts have jointed arms and distinct floating
silhouettes. Boruta has a Polish nobleman-devil silhouette: crimson coat, gold
sash, fur-trimmed cap, horns, curled moustache, boots, pointed tail and a sabre.
His two walking legs and two arms bend at their joints as he travels along the
edges. This replaces his earlier six-legged artwork. The earlier 39 identities
remain available.

The five folklore creatures use a tilted overhead camera with projected 3D
forms, shaded surfaces and ground shadows. Turning changes the visible roof,
wall and body faces while height stays upright in the camera. Articulated limbs
keep their lengths in 3D; their screen lengths change with perspective. Grid
positions, edge travel and contact rules continue to use the same game models.

The broom witch has a hooked hat, visible face and hair, a seated body, hands
gripping the shaft, bent boots and a broad bound straw bundle. **Level 1 of
every function starts with the broom witch, hen-leg house and Diabeł Boruta
together**, including Restart and continuing to the next function. These are
three full-sized grid-edge monsters; Boruta uses his own normal pursuer body
and health. From level 2, the usual seeded newcomer and two family monsters
return, including the family centipede. Egg laying and hatching keep their
existing active-time clocks. See `OPENING-FOLKLORE.md` in the team records.

**Lightning eggs** give Gridder **3× movement speed for five seconds of active
play**, with a cyan/lime neon trail and a small remaining-time badge beside the
weapon controls. Running into a monster during the boost defeats it, including
contact with a centipede's body. Keep moving to ram: the fading trail itself
does not cause damage. Another lightning egg refreshes the boost to five
seconds. It does not add rounds, upgrade the gun or add bombs.

The temporary boost affects Gridder's movement only. Hatching, bomb fuses,
monster movement and weapon timing keep their own clocks. Pause, Settings,
capture/resurrection, completed levels and enemies-off practice freeze active
time. Death or changing/restarting the level clears the temporary effect.
The first egg remains ammunition; later seeded rewards preserve the existing
bomb outcomes and choose lightning for approximately one quarter of the
remaining ammunition outcomes.

Feature and acceptance record:
`docs/chebby/agents/gridder-team/FOLKLORE-SPEED-BOOST.md`.

## Spider-like monsters and planted bombs — 6 November 2026

The original nine species and thirty additions remain in the roster. The thirty
new Halloween/fantasy creatures now use low, contorted bodies with long,
clawed, jointed limbs. Alternating support groups keep feet planted while other
legs lift and step; movement drives the gait. Skeletons, vampires, mummies,
werewolves, witches, ghosts and the other species retain distinct features.
The monsters still follow the grid edges, with the existing population limits.

Some eggs carry a bomb symbol. Collecting one stores a bomb. Normal eggs add
three rounds and advance the double-damage/machine-gun upgrades. The first egg
introduces ammunition; later rewards use a separate seeded selection with
roughly one quarter bombs.

**Shift** switches between **gun** and **bomb**. The touch weapon switch performs
the same action. **Space** or the main action button uses the selected weapon:
shoot in gun mode, or **Plant** one bomb in bomb mode. Switching consumes nothing
and clears held firing. Planting is always one action per press, even when the
machine gun upgrade is available.

A bomb stays exactly where Gridder plants it. Its **three-second countdown**
uses active play time, independent of speed or slow frames. Detonation produces
a loud layered blast, expanding fire, metallic shrapnel, smoke and a shockwave.
The circular blast deals three damage to nearby land and pool monsters within
1.5 times the smaller cell dimension (including body contact). Gridder and
painted areas are safe. Pause, Settings, capture, angels, completed levels and
practice freeze the countdown and block planting.

Bomb inventory and weapon selection carry through lives and Next within the
function; function restart/change resets them. Planted charges carry through
capture/resurrection but are cleared on Next. The mode and action buttons share
the existing control margin, preserving the plotted field.

## Settings page — 6 November 2026

Open **Settings** from the header or game controls; in the touch/fullscreen
arena it is in the **Game** menu. Music, volume, sound effects, visual style,
function/difficulty, hints, monsters and movement/node tuning share one page.
The original speed slider is also a shortcut below the board. It moves into
Settings while open and returns afterward, retaining its value and listeners.
Opening pauses play. **Back to game**, Escape and browser Back return without
reloading or resetting the board/ammo; choose **Start game** to resume.
Function/difficulty changes keep their existing restart behavior, explained
beside those controls. Settings remain for the current loaded game session.

## Eggs and shooter upgrades — 6 November 2026

Every 10 seconds of active monster play, one randomly selected living monster
outside the water containers lays an egg on a legal grid node. Sharks and
leeches in containers do not lay eggs. After 10 more active seconds, an
uncollected egg hatches into a smaller creature of the same kind/species.
Laying and hatching use elapsed active play time independently of Gridder
speed or the capped movement frame budget, including on slow frames.
Hatchlings use the same movement speed as the original monsters of their
kind and difficulty, including the ordinary speed setting and resize scaling.
Their smaller size and one-hit health remain.

Each normal egg **adds 3 rounds**. The second normal egg upgrades bullets to
**double damage**; the third normal egg unlocks a **machine gun**. Further normal eggs keep adding
ammunition. The pickup count stays separate from the remaining round count.
Turn by moving, then press **Space** or **Fire** to shoot. With the machine gun,
hold Space or the touch Fire button for automatic fire; every shot uses one round.
Gridder holds the shooter centrally with **both hands**; the weapon and armed
face keep the same direction while stopped. Hatchlings have one health point,
adult centipedes three, and other adults two, including sharks and leeches.
Ordinary bullets deal one damage point; upgraded bullets deal two. Pink-white
projectiles and a pink gun band show double damage; a gold band marks automatic fire.
A bullet hits the first creature it reaches and is spent even if it misses.
Damage lasts for that creature's lifetime on the current board.
Each shot has a sharp report, a quieter flying-bullet whoosh, and a monster
impact sound. A fatal hit adds an explosion. The Sound effects switch controls
these sounds; pausing stops them and misses make no monster-impact sound.

Unused rounds and collected-egg upgrades survive a life loss and carry between
levels within the current function. Restarting or changing function clears them; a new level
clears travelling bullets and starts its new creature population. Timers pause
with the game, capture, resurrection, completed objectives and enemies-off
practice. The active ecology clock carries between levels. To keep the board
bounded while preserving the ten-second rhythm, the oldest hatchlings depart
when space is needed. Existing minute visitors retain their separate limit.

Feature records: `docs/chebby/agents/gridder-team/EGGS-SHOOTER.md` and
`docs/chebby/agents/gridder-team/UPGRADE-PLAYLIST.md`.
Local changes only; public deployment is separate.

## Expanded challenge catalogue — 3 November 2026

The chooser contains **102 functions** (three times the previous 34), in four
families and 16 subfamilies, with **615 levels**. The 52 new smooth examples add
polynomials through degree eight, rational curves, exponential/logarithmic
composites, faster trigonometric waves and hyperbolic functions.

Choose **Discontinuities and special functions → Explore special examples**
for 16 additional studies: absolute value, sign, unit step, floor, ceiling,
fractional part, distance to the nearest integer, triangle wave, a jump between
lines, a removable hole, a reciprocal pole, sinc, two oscillatory examples,
Dirichlet and Thomae. Each starts with exploration and then offers applicable
Next level challenges: minima, maxima, first and second derivatives,
singularities, discontinuities and differentiability. There are 74 follow-on
challenges, making 90 study levels in addition to 525 smooth-function levels.
Targets use explicit segments and filled/open markers; they cover the stated finite depiction;
no lines are drawn across jumps or between isolated samples. The maths panel
explains the full definition, continuity and derivative applicability. Window
extrema are distinguished from local extrema. Missing derivatives are explained
without inventing a derivative curve; fractional part has no maximum, and the
reciprocal across its pole has no finite global extrema. Vertical location
markers identify inputs, not extra values of the function.

Dirichlet uses constructed rational/irrational examples. Thomae uses all 181
reduced fractions in [0,1] with denominator at most 24, plus 24 constructed
irrational examples at height zero. Neither classifies floating-point inputs
as rational or claims its finite dots depict a dense infinite graph. Nonlinear
exploration polylines and unresolved oscillations are labelled explicitly.
New smooth critical coordinates are numerical approximations obtained from
bounded root isolation or explicit formulas, not interval-certified bounds.

Checks: `test-expanded-catalogue.cjs`, `test-exploration-levels.cjs`,
`test-gridder-catalogue.cjs`, `test-gridder-all-levels.cjs` and
`test-expanded-catalogue-browser.py` under `tools/gridder-v2/`. Study progression
also has `test-study-progression.cjs` and `test-study-progression-browser.py`.
The latter exercises native WebGL and phone-width Canvas Next/replay flows.
The original 34 definitions and their 187 objectives retain their previous
boards, targets and pool placement. This expansion is local; public deployment
is separate.

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
Gridder starts at **280 px/s** at the reference board size. Incoming vertical
travel uses **2×** resolution; incoming horizontal and both outgoing halves use
**1×**, with a **10 ms** centre pause. These are the starting values on a fresh
page, including when a browser restores older form inputs. The speed scales
with the board as the window, orientation or fullscreen size changes; the
sliders remain adjustable.
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
**Settings → Challenge**
opens the family, subfamily, function and difficulty pickers. The six movement
sliders stay exposed, with **Half in / Half out** arranged side by side.

Ordinary page layouts retain 3:2 cell proportions. On touch devices, full-screen
mode and short landscape windows use a viewport-sized dark arena. The grid
maximizes its fitted area inside safe margins, with cell width/height bounded
between 0.6 and 2.2 to avoid extreme stretching. The 88 × 44 px arrows have 8 px
pair gaps: left/right in the left margin and up/down in the right. Start, Next
and Maths live in a compact Game menu; opening it pauses play. Lives sits in
the header. After a final defeat or completing every level, the main button
becomes **Play again**. It starts the same function and difficulty from level1
with seven lives and cleared discoveries, captures and creature timers, retaining
fullscreen. Intermediate levels continue through **Next level** as before. Grid coordinates and objectives are preserved; bodies stay round.
Gridder uses the same screen velocity on both axes, scaled with the board,
and both incoming node halves default to 2× slowdown (outgoing halves 1×).
Enemy grid pacing remains unchanged. On phone-sized touch screens (short viewport
side below 600 CSS px), fullscreen uses a separate fit: landscape fills the
usable height and anchors the grid near the top-left; portrait fills the usable
width. The opposite cell-aspect limit may relax to preserve that priority.
An 18 px breathing frame keeps the ordinary walking face clear of the screen
edge. Coordinate numbers and x/y titles are hidden in this mode, with axes,
functions, discoveries and mathematical coordinates retained. Landscape puts
mission/formula/lives/Game/Exit/status in a right rail and Left/Right in the
44 px strip below the grid; portrait puts the information and controls below
the full-width plot. Tablet and ordinary page arrangements are retained.
Game actions open over paused play, with an upward-opening menu in portrait.
Leaving phone fullscreen restores coordinate labels and the prior arrangement.
The Maths explainer pauses play and opens over the arena. Desktop controls scroll independently in a sticky console. Its width grows proportionally with the game window;
`panel-layout.js` fits its height to the actual visible space below the header
on resize, scrolling and header changes. Narrow layouts stack the expanded
mathematics beside the game; configuration is on the Settings page.

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

The shark is drawn from above, with both pectoral fins and eyes visible, a
central dorsal fin and an articulated rear body. Its tail beats sideways and
the dorsal fin flexes with the supplied game clock. Pause freezes the motion;
reduced motion uses a still pose. The whole silhouette stays within the same
pool-safe fit while swimming. During an attack its head and open, toothed jaws
reach out over the shore, close around Gridder and pull him into the pool.
The attack head follows Lucy's reference photo: a broad gray snout, pale lower
jaw and continuous pink upper/lower gums surround one dark mouth. Seven larger
upper teeth and six smaller lower teeth have broad triangular bases rooted in
those curved gums. The upper arch stays steady while the lower U-shaped jaw
opens with a projected hinge angle and closes toward it.
The first 120 ms reach the stationary victim; both sprites then follow one
shared path for the rest of the existing 650 ms drag. The shark then visibly
opens and closes its toothed jaws three times. From 1550 to 2400 ms, Gridder
moves into a fixed mouth: his original artwork is progressively clipped at
the lips, rather than fading beside the shark. He is completely swallowed
before a brief belly pulse. Pausing freezes the bite and swallowing motion;
the existing one-life cost, total capture duration and pool-local blood timing
are retained.

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

Gridder walks with the six original blue-purple tentacles coming from his
head. Their original artwork bends at articulated joints in a staggered crab
gait. Step phase follows actual distance,
with one cycle per 56 reference pixels (about 43% quicker than the previous
80-pixel stride), smooth starts and a short settling
motion on ordinary stops. Pause and capture immediately stop the gait;
reduced-motion mode keeps a static pose. Each tentacle has a longer eased
pushing stroke and a quicker curled recovery, with a small delay between the
two joints. Six staggered phases and stronger bends animate the original
artwork while the player's movement speed stays unchanged.
His size and the insects' sizes follow the board's plot width, including
earned growth. Collision distances, remains and the centipede's corner-following
body use the same scale.
His whole sprite turns with travel as before: right −90°, left +90°, up 180°
and down 0°. The pupils follow actual travel within that rotated face, while
the tentacle lean eases into a turn. Brief node waits of at most 90ms preserve the travel pose while the
movement key remains held, with step phase frozen. Release, long centre waits
and border stops return the sprite upright and settle the tentacles. Holding against the border does not animate
a false walk.
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

**Music · 3-melody cycle** plays complete written melody forms in order:
Boléro (**14:10**), **Szła dzieweczka do laseczka** (**1:00**) and
**O mój rozmarynie** (**0:25**), then repeats the **15:35** cycle.
Boléro follows 340 bars at 72 BPM, including both themes, final modulation
and coda. Szła includes its written repeats and alternate endings; Rozmarynie
includes all ten notated bars. Melody, arranged harmony, bass and percussion
provide more layers. These are reduced synthesized arrangements, rather than
orchestral recordings or every sung verse. Score provenance is in
`audio/bolero-provenance.json` and `audio/folk-medley-provenance.json`.
Playback generates two sequential four-second buffers at most, preserving
musical position across pause/mute without allocating a full-cycle PCM buffer.
The music toggle, **Music volume** slider (0–100%, initially 30%) and separate
**Sound effects** toggle are on the **Settings** page. The speed slider replaces
their former position beneath the game controls.
Music pauses during capture, resurrection, game pause and hidden-page
states. Restart resets the tune. Sound effects and music can be switched
independently; the original resurrection voices remain.

During resurrection, the angels animate while Gridder, monsters, eggs and
bullets wait. When the angels disappear, the same level resumes automatically
with captured areas, remaining lives and ammunition intact, plus two seconds
of safety. Movement needs a fresh input so a key or finger held during the
animation cannot cause a delayed move. Explicit Pause, Escape or leaving the
page still pauses the game until you choose Start again. The angel duet also
pauses: after returning from Settings or another pause, Start resumes its
remaining audio at the saved resurrection position. Sound effects controls
the voice. A completed phrase is not replayed during the brief visual tail.

## Backup before the arcade layout

The complete previous app, test tools, routing reference and team handover are
saved in `backups/gridder-v2/before-arcade-20261019T113706Z/`. Its archive contains
67 files, all read back and checked against `manifest.json`; `SHA256SUMS` records
the archive checksum. Extract into a separate folder to review or restore the
old app. Preserve unrelated current changes when consulting the saved `conf.py`.

## Preserved game and mathematics

- Four families, 16 subfamilies, 102 functions and 615 ordered objectives,
  including extrema, inflections, first/second derivatives, restricted inverses
  and normals with the vertical-normal case, plus finite-model exploration
  and supported special-function follow-on levels.
- Exact closed-cell targets, continuous movement, 1/16 taps,
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
/home/lucy/anaconda3/envs/lucy/bin/python tools/gridder-v2/test-jointed-gait.py --stage after --root /tmp/gridder-reviewed-snapshot/gridder-v2
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
`test-swimming-gait.py` is the focused faster-tentacle and top-view-shark
acceptance. It compares immutable snapshots, measuring actual keyboard-driven
cadence, power/recovery strokes and six original-art lobes, as well as paired
shark anatomy, tail/back-fin pixel motion, capture and pool-local staining.
Reports are in `tools/gridder-v2/swimming-gait-evidence/`.
`test-shark-lunge.py` checks the screenshot movement defaults and proportional
speed through resize/fullscreen, plus native shoreline reach, visible teeth,
grip, drag and pause. Prepared capture poses and controller lifecycle checks
are distinguished in `tools/gridder-v2/shark-lunge-evidence/`.
`test-shark-consume.cjs` and `test-shark-consume.py` check three jaw closures,
the fixed mouth and original-art swallowing boundary, disappearance, the belly
pulse and the preserved capture lifecycle. Native stills and a timed prepared
preview are in `tools/gridder-v2/shark-consume-evidence/`.
`test-shark-jaws.cjs` and `test-shark-jaws.py` verify the drawn upper/lower
arches, tooth roots and triangles, lower-jaw movement and preserved swallowing.
Native head previews are in `tools/gridder-v2/shark-jaws-evidence/`.
`test-jointed-gait.py` retains focused avatar acceptance. It compares
immutable before/after snapshots in native Phaser WebGL and Canvas, including
four-direction poses, articulation of the six original tentacles, bounded
joint motion, rest/pause/capture, reduced motion and repeated-pose texture
uploads. Prepared pose checks and live held-key checks are reported separately
in `tools/gridder-v2/jointed-gait-evidence/`. Phone checks are browser emulation;
they do not verify physical touch hardware or hardware GPU performance.

`test-scale-audio.py` records the earlier six-leg avatar,
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
