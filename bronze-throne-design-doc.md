# Bronze Age City-State: Game Design Document

## Vision & Pillars

A roguelike city-builder set in the Bronze Age, where the player manages a city-state from its founding settlement through (ideally) a thriving urban civilization. The core experience is building an increasingly complex "house of cards" — a fragile, interdependent system of resources, citizens, buildings, and diplomacy — while the game throws escalating crises and curveballs that threaten to topple it.

### Core Pillars

**Losing is Fun.** Inspired directly by Dwarf Fortress. The typical run lasts a few hours to a few days. Collapse is not failure — it's a dramatic, emergent story. Watching the cascade unfold, finding creative last-ditch measures, and the wacky improvisation that comes from desperation are all core to the experience. A skilled player can theoretically survive indefinitely, but practically, the plates multiply until most players eventually drop one.

**Organic Growth, Strategic Guidance.** The player does not place individual houses or micromanage citizen assignments. The player places key buildings ("nuclei") and the city grows organically around them, like a fungal colony spreading from nutrient sources. Player agency is in the pattern, the shape, the arrangement — not the individual cells.

**Compounding Systemic Pressure.** There is no single escalating threat. Pressure comes from multiple independent systems — environmental, political, military, economic, religious — that interact and compound. A drought causes a food shortage, which causes unrest, which the priesthood exploits, which weakens your response to raiders who smell blood. Each run produces a unique collapse story.

**Roguelike Variability.** Every run is different. Map terrain, available building pool, event deck composition, neighboring city-states, and local resource distribution are all randomized. Skilled players apply general principles and pattern recognition, but cannot fall back on memorized optimal builds.

### Key Inspirations

- **Dwarf Fortress** — systemic complexity, emergent narrative, "losing is fun"
- **Pharaoh / Caesar III** — Bronze/Ancient age city building, implicit production chains, isometric aesthetic
- **SimCity 3000** — substrate data layers (land value, crime, etc.), zone-based organic growth, building funding sliders
- **Banished** — survival pressure, resource scarcity, small-community feel, trade caravans
- **Crusader Kings / Stellaris** — event popup system with meaningful choices, some with hidden consequences
- **Age of Empires** — resource-driven RTS economy, building-based tech progression
- **Roguelike/Tableau-builder games** — run variability, building with the hand you're dealt, no single optimal strategy

---

## City Model: The Nucleus/Substrate System

### Overview

The city exists on a grid map (specific grid type TBD by implementation — hex, square, or offset square all work; isometric visual projection regardless). The player places **nucleus buildings** on the grid. The city's residential and minor commercial fabric — the "substrate" — grows organically in the influence zones of these nuclei based on their properties and interactions.

The player never places a house. Houses, market stalls, small workshops, and other minor structures emerge in areas where the substrate conditions support them. The player controls *what kind* of growth happens *where* by choosing which nuclei to place and how to arrange them.

### Nucleus Buildings

Every nucleus building has a defined profile:

- **Footprint**: Grid cells occupied by the building itself.
- **Substrate Emissions**: Which data layers it positively influences, at what strength, and at what radius.
- **Substrate Suppressions**: Which data layers it negatively affects in its radius.
- **Resource Consumption**: What resources it consumes per time-tick to operate.
- **Resource Production**: What resources it generates per time-tick (if any).
- **Citizen Attraction**: Which citizen tiers it draws to its vicinity, at what strength.
- **Operational Intensity Slider**: Adjustable from ~50% to ~120%, affecting all of the above proportionally (see Slider Mechanic below).
- **Prerequisites**: What buildings, citizen thresholds, or resources must exist before this building can be placed.
- **Build Cost**: One-time resource cost to construct.

### Substrate Data Layers

The substrate is composed of six overlapping heat-map layers across the city grid. Each cell has a value for each layer, driven by the combined radial emissions and suppressions of all nearby nuclei. These layers determine what grows where, who lives where, and how the city functions at a local level.

**Security** — Emitted by barracks, watchtowers, walls. Suppresses unrest, deters internal crime, determines district vulnerability during raids. Low-security areas are where riots start and where raiders penetrate.

**Prosperity** — Equivalent to SimCity's land value. Driven by proximity to markets, trade posts, palaces, and wealthy neighbors. High prosperity attracts merchants and elites, drives wealth generation. High-prosperity districts are also prime raid targets.

**Piety** — Emitted by temples, shrines, sacred groves. Attracts priests, boosts morale, provides passive event mitigation (the psychological comfort of religious institutions). Over-concentrated piety leads to priesthood political dominance.

**Industry** — Emitted by workshops, smelters, kilns, production buildings. Attracts craftsmen, drives production chain throughput. Industry suppresses prosperity in its radius — the tannery problem. Creates classic zoning tension.

**Sustenance** — Emitted by farms, granaries, fisheries, wells, pastures. Determines local food security and maximum population density. Districts far from sustenance cannot grow large.

**Culture** — Emitted by scribal schools, libraries, the palace, monuments. Drives the implicit unlock/progression system. High culture areas generate the advancement that makes higher-tier buildings available over time.

### Player Data Visualization

The player can toggle between these six layers as heat-map overlays on the city view, seeing the "data beneath the fungal colony." This is a core part of the city-building engagement loop — placing a building, toggling layers, watching the ripples, and deciding what to place next based on what the substrate shows you.

### Anti-Optimization Mechanisms

Several systems work together to prevent a single "solved" optimal build:

**Map Variability** — Each run generates different terrain: rivers, hills, coastline, forests, stone outcrops, mineral deposits. A layout that works on a river floodplain is wrong for a hilltop. Terrain features provide bonuses (river = sustenance boost) and constraints (can't build on cliffs).

**Nucleus Variability** — The pool of available buildings is partially randomized each run. You might get a Canal-Fed Granary instead of a standard one, or an Open-Air Shrine instead of a Stone Temple. Variants have different substrate profiles, creating different optimization puzzles each run.

**Stochastic Substrate Growth** — The organic growth isn't perfectly deterministic. When multiple citizen types are attracted to an area, the resulting mix has some randomness. The player guides but doesn't dictate — two identical nucleus layouts can develop slightly differently.

**Path Dependency** — Early placements constrain later ones. Demolishing and rebuilding is very costly (resources + time + disruption to established substrate). The city accumulates history, and adapting around suboptimal early decisions is part of the challenge.

---

## Resource Economy

### Five Resources

The economy tracks five distinct resources. This count is chosen deliberately: enough for meaningful trade-offs and distinct failure modes, few enough that the player can hold the entire system in their head. Each resource creates unique spending competitions and each has a distinct crisis mode when it runs short.

**Food** — Grain, livestock, fish, gathered produce — abstracted into a single resource. Feeds the entire population. Stockpiled with quantity tracking (you have X months of food reserves). The fundamental survival resource. Every citizen consumes food; more population = more consumption. Surpluses can be traded.

**Timber** — Wood from forests. The fast, cheap building material. Used for construction, fuel for kilns and smelters, and general infrastructure. Critically, timber *depletes* — forests don't regrow quickly (lumber camps have replanting, but consumption outpaces renewal at scale). Early-game backbone that becomes scarce mid-to-late game, forcing the transition to stone. This depletion arc mirrors real Bronze Age urbanization and creates natural environmental pressure.

**Stone** — Quarried rock and processed clay/brick. The slow, permanent building material. Doesn't deplete (quarries are effectively infinite) but extraction is labor-intensive and slow. Stone buildings are durable and fireproof. The mid-to-late game building material. Also used for walls, monuments, and temples.

**Bronze** — The strategic resource. Represents worked metal — weapons, tools, fittings, prestige objects. Production requires active metalworking capability (smelter + smithy) and, crucially, trade inputs: no single map should provide both copper and tin locally. This forces trade dependency, creating a critical vulnerability. Used for military equipment, advanced tools and buildings, and high-value trade goods.

**Wealth** — An abstraction of gold, luxury goods, trade profits, and accumulated value. Used for diplomacy (gifts, bribes), upper-tier citizen satisfaction, temple offerings and ceremonies, trade deals, and advanced construction. Generated by markets, trade, and prosperous districts. The "soft power" resource.

### Production Philosophy: Implicit Chains

Production chains are **capability-based**, not logistics-based. The player does not route supply lines between buildings. Instead, the system checks whether the necessary buildings exist, are operational, and are funded. If a smelter and a smithy are both active and you have trade-supplied tin and locally-mined copper, the system produces bronze at a rate determined by the weakest link.

The player's job is ensuring the right buildings exist, are placed well, are funded adequately via the slider, and that input resources are flowing into the city (via local gathering or trade). They are not micromanaging carts of ore between buildings.

Basic resources (Food, Timber, Stone) have explicit stockpile quantities — you have 450 units of food, 200 timber. Strategic and prestige resources (Bronze, Wealth) operate more as flow rates — you're producing X bronze per tick, consuming Y.

### Resource Tension Map

Each resource participates in multiple spending competitions, ensuring no resource is idle or redundant:

| Resource | Spending Competitions |
|---|---|
| Food | Population upkeep · Stockpile reserves for crisis · Trade export · Army rations · Ceremony offerings |
| Timber | Fast construction · Fuel for production buildings · Early defense (palisades) · Trade · Depleting forests (environmental cost) |
| Stone | Permanent construction · Walls and fortifications · Temples and monuments · Infrastructure |
| Bronze | Military equipment · Advanced building construction · Prestige goods · Trade commodity |
| Wealth | Diplomatic gifts/bribes · Upper-tier citizen satisfaction · Temple ceremonies · Trade deals · Advanced unlocks |

### Failure Cascades

Each resource has a distinct crisis character:

- **Food crisis** → Starvation, population loss, unrest, citizen tier collapse (elites flee, priests protest)
- **Timber depletion** → Can't build or repair, fuel shortage shutting down production, stuck in vulnerable state
- **Stone bottleneck** → Can't fortify, can't upgrade to permanent structures, stalled advancement
- **Bronze disruption** → Military weakness, technological stagnation, loss of prestige goods
- **Wealth shortage** → Diplomatic isolation, elite unrest, religious institutions falter, trade deals collapse

Crises compound: a drought hits food, forcing you to trade food reserves, costing wealth, weakening diplomacy, so you can't call on allies when raiders arrive.

---

## Citizen Tiers

### Six Tiers

Six population tiers, each with a clear role, cost, and player lever. Citizen tier populations are not directly controlled — they emerge from the buildings placed, the substrate conditions, and the resources available. The player influences them indirectly through building placement, operational sliders, and event choices.

**Laborers** — The foundation. They farm, quarry, haul materials, and perform basic construction. They need food and basic shelter (which emerges naturally in sustenance-rich areas). They appear wherever there's work and food. Cheap, numerous, essential. Player lever: building farms and basic resource infrastructure attracts more laborers.

**Craftsmen** — They staff workshops and run production chains. They need workshops to work in, better housing than laborers, and some comfort goods. They're attracted to areas with Industry substrate. No tannery = no leatherworkers. Player lever: placing production nucleus buildings attracts craftsmen to the area.

**Merchants** — They operate trade infrastructure, both internal market distribution and external caravans. They need market buildings, security, and access to luxury/comfort goods. They're attracted to high-Prosperity substrate. Player lever: building markets and trade posts, establishing trade routes.

**Priests** — They operate temples, perform ceremonies, generate morale and cultural cohesion, and provide passive event mitigation. They consume prestige resources (wealth for offerings). They're attracted to high-Piety substrate. Player lever: building temples (with the risk that over-investment grows the priesthood into a political power bloc that makes demands).

**Warriors** — Pure consumers. They eat food, use bronze equipment, and need barracks. They produce nothing economically and contribute nothing to the substrate except Security. They're a drain until a threat arrives, at which point they're existential. Player lever: building military infrastructure. Classic guns-vs-butter tension.

**Elites/Nobles** — They provide administrative capacity (governing a larger city), diplomatic capability, and unlock conditions for advanced buildings. They demand luxury goods, prime real estate (high Prosperity), and political influence. They're attracted to palaces and high-Prosperity/high-Culture areas. Player lever: building a palace and administrative buildings. Risk: they're expensive, politically volatile, and can destabilize the city with factional demands.

### Tier Interactions and Tensions

Advancing to higher tiers requires lower tiers as a foundation — you can't have craftsmen without laborers, can't have elites without a functioning economy beneath them. But higher-tier citizens are more demanding, more fragile, and introduce new political dynamics. Growth makes the city more capable AND more vulnerable — the house of cards grows taller.

The priesthood expansion dynamic is a key example: temples provide essential morale and cultural benefits, but over-building temples grows the priesthood disproportionately. A large priesthood demands political influence, more offerings, temple expansion — and dialing back temples later causes morale crashes. The player's early religious investments create long-term political consequences.

---

## The Operational Intensity Slider

### Mechanic

Every nucleus building has an operational intensity slider, adjustable by the player at any time. This controls how "hard" the building is running, scaling its resource consumption, resource production, substrate emissions, and citizen attraction proportionally.

### Range and Curve

The slider operates on a **diminishing-returns curve with a sweet spot**, not a linear scale:

- **50% intensity**: ~60% substrate effect, ~40% resource cost. Efficient but weak. "Skeleton crew."
- **100% intensity**: Full effect, full cost. The baseline.
- **120% intensity** (overclock): ~110% effect, ~150% cost. Expensive, possibly increases negative side effects (fire risk, worker injury, faster environmental degradation). "Running hot."

### Strategic Uses

- **Austerity mode**: During a food crisis, dial down non-essential buildings across the board. Accept weaker substrate effects to survive the winter.
- **Surge mode**: Raiders incoming — crank military buildings to 120%. Accept the resource burn because survival comes first.
- **Priesthood management**: Dial back temples to slow priesthood growth, accepting reduced morale.
- **Economic balancing**: A building consuming too much timber during a shortage can be throttled without demolishing it.
- **Optimization play**: Advanced players fine-tune individual building sliders for maximum efficiency — a deep, rewarding management layer.

---

## Escalation & Crisis System: The Event Deck

### Structure

The game's escalating pressure is driven by a **deck-based event system**, conceptually modeled as a deck of event cards that is shuffled at the start of each run.

**Deck Composition**: The initial deck contains early-game events (minor weather events, small trade opportunities, local disputes). As time progresses and/or the city reaches development thresholds, harder cards are shuffled into the deck — droughts, plagues, large raids, political crises, religious upheavals, trade disruptions.

**Draw Triggers**: Events are drawn on two axes:
- **Timer-based**: Events draw at a regular cadence that accelerates over time. Early game might be one event every few minutes of play; late game, events overlap and compound.
- **Threshold-based**: Certain events have hard prerequisites. A "Priesthood Demands Political Power" event can only fire if piety substrate exceeds a threshold. A "Bronze Shortage" event can only fire if you're actively producing bronze. Some events have negative prerequisites — they can only fire if you DON'T have walls, for example.

**Recycling**: Some event cards are one-shots (a unique diplomatic opportunity). Others can be recycled back into the deck up to X times per run (drought can happen more than once, raiders can return). Recycled cards may return in escalated variants.

### Player Interaction

Events present as **popup cards** (CK/Stellaris-style) with a description of the situation and 2-4 choices. The presentation and information transparency varies deliberately:

- **Transparent choices**: "Pay 200 Wealth to bribe the raiders" — explicit cost, clear outcome.
- **Partially transparent**: "Offer grain to the refugees (+food cost, unknown consequences)" — you know the cost but not the full ramification.
- **Opaque choices**: "The priests demand a grand ceremony. Agree / Refuse / Compromise" — you must read between the lines and judge based on your understanding of the game's systems.

This graduated transparency rewards system mastery. New players make gut calls on opaque choices; experienced players can predict likely outcomes based on their understanding of how the substrate and citizen systems work.

### Example Event Cards (Pattern-Setting, Not Exhaustive)

**Early Game:**
- *Wandering Herders*: A group of herders passes through. Offer them shelter (gain laborers, food cost) / Trade with them (gain food, cost wealth) / Ignore them.
- *Brush Fire*: A wildfire threatens timber reserves. Commit laborers to fight it (labor productivity loss) / Sacrifice the timber district (lose timber) / Controlled burn to create firebreak (lose some timber, protect the rest).
- *Good Harvest*: Surplus grain. Store it (food stockpile boost) / Feast to boost morale (food cost, happiness boost) / Trade the surplus (gain wealth).

**Mid Game:**
- *Trade Dispute*: A neighboring city-state accuses your merchants of cheating. Apologize and pay reparations (wealth cost, trade preserved) / Deny the accusations (risk trade disruption) / Send an envoy to negotiate (wealth cost, uncertain outcome).
- *Priesthood Ascendant* (requires high piety threshold): The temple hierarchy demands a seat on the ruling council. Grant it (priests gain political power, morale boost) / Refuse (morale hit, possible priest-led unrest) / Offer a compromise (build them a grand temple — stone cost, partially satisfies them).
- *Bronze Shortage*: Your tin supply is disrupted. Ration bronze production (military and industry weakened) / Seek alternative trade partners (wealth cost, uncertain timeline) / Raid the source of disruption (military commitment, diplomatic consequences).

**Late Game:**
- *Plague*: Disease sweeps the city. Quarantine affected districts (productivity loss, contains spread) / Pray for divine intervention (piety check — may or may not help) / Burn the affected district (extreme measure, stops plague, destroys buildings and kills citizens).
- *Foreign Empire*: A powerful foreign army is marching toward the region, sacking cities. Fortify and prepare (military + resource commitment) / Send tribute preemptively (massive wealth cost, might not work) / Evacuate civilians and prepare guerrilla defense (lose population, preserve military).
- *The Sea Peoples* (late-game escalation event): A massive, unstoppable migratory force is approaching. This is the Bronze Age Collapse. Every system you've built is tested simultaneously.

---

## Military & Defense

### Philosophy

Military conflict is **not** the core gameplay loop — city building is. Military exists as a pressure system that forces the player to divert resources from productive use, creating the guns-vs-butter tension. Actual combat is resolved abstractly, not through direct tactical control.

### Peacetime Military

The player's military decisions are made *before* threats arrive:
- **Building military infrastructure**: Barracks, watchtowers, walls, armories. These cost resources to build and maintain, and warriors consume food and bronze continuously.
- **Maintaining warriors**: Warriors are a pure economic drain during peacetime. The temptation to cut military spending during peace is strong — and is exactly the kind of decision that leads to entertaining collapse later.
- **Fortification placement**: Walls and towers are nucleus buildings with Security substrate emission. Their placement relative to the city's vulnerable points matters. A wall protecting your wealthy district leaves your granaries exposed.

### When Threats Arrive

Threats appear at the map edge. The player receives advance warning (scouts report movement) and then the threat arrives as an **event card sequence**:

1. **Identification**: "A raiding party of northern barbarians has been spotted approaching from the east. They appear to number approximately 200 warriors." The information quality depends on your scouting/intelligence capability.
2. **Interaction**: Event popup with options based on the threat type and your capabilities:
   - Offer tribute/bribe (wealth/food cost, they leave, might return)
   - Negotiate / submit to demands (variable costs, political consequences)
   - Stand and fight (triggers auto-resolve)
   - Attempt diplomacy — call on allies if you have them (requires prior diplomatic investment)
3. **Auto-Resolve (if combat occurs)**: The outcome is calculated based on your Security substrate average, total warrior population and equipment (bronze availability), wall/fortification quality, terrain advantages, and threat strength. The result is narrated — "The raiders breached the eastern wall but were repelled at the market district. Casualties: 40 warriors, 15 laborers. The granary district suffered significant damage." Damage is applied to the map — buildings destroyed, population lost, substrate disrupted.

### Stretch Goal: Tower Defense Mode

As a future expansion, combat could resolve via an optional tower defense sequence where the player watches (but doesn't directly control during the fight) their pre-placed towers, walls, and siege engines engage the attacking force. The strategic decisions remain the same (placement and funding happen before the attack), but the resolution is visual and tactical rather than purely narrative. This is a **stretch goal**, not core scope.

---

## Trade & Diplomacy (Stub — Stretch Goal for Full Implementation)

### Core Scope: Regional Trade

A **regional map screen** shows neighboring city-states with basic information: name, approximate strength, primary exports, disposition toward you (friendly/neutral/hostile).

**Recurring Trade Deals**: Click on a neighbor, propose an exchange (e.g., 10 Food/tick for 5 Bronze/tick). If they accept, the trade runs automatically until disrupted or canceled. Acceptance depends on their needs and your relationship.

**The Market Building**: A nucleus building that allows the player to buy and sell resources at **unfavorable rates** as an emergency pressure valve. Need bronze urgently? Buy it at the market for 3x the trade-deal rate. Dumping excess food? Sell it for a fraction of its trade value. The market is a deliberate inefficiency that provides flexibility — like AOE's market.

### Stretch Goal: Diplomatic Packages

Envoys can be sent to other city-states carrying specific diplomatic proposals: trade agreements, military alliances, non-aggression pacts, gifts to improve relations. Each envoy costs wealth and time, and the outcome depends on the target's disposition, your reputation, and the quality of your offer. This system is **deferred** — the implementing agent should design trade and the market first, and the diplomatic envoy system can be layered on once the core economy is functioning.

### Stretch Goal: Trade Caravans

Banished-style visiting traders who arrive at your trading post with a specific slate of goods. You negotiate a deal on the spot — buying what you need, selling what you can spare. This adds texture and event-like variety to the trade system but requires the core economy to be stable first.

---

## Run Structure

### Starting a Run

**Configuration**: Before starting, the player selects difficulty settings. Preset "experiences" offer curated combinations (see Difficulty section below). Advanced players can tweak individual settings.

**Map Generation**: The game generates a randomized terrain map with rivers, hills, forests, stone outcrops, coastline, and mineral deposits. Local resource availability is determined by terrain.

**Start Modes** (two variants):

*Blank Slate*: SimCity-style. The player sees the generated map and places their first building — a **Settler's Camp**. This is free and serves as the anchor point. It passively generates a slow trickle of food and timber representing the founding settlers foraging and gathering. Not enough to sustain a city, but enough to bootstrap — wait a short while and you can afford your first real building. The Settler's Camp emits a small Sustenance and Prosperity radius. Early-tier buildings (farm, lumber camp, clay pit) are very cheap (just a small amount of timber), ensuring the player can experiment and recover from early mistakes without immediately stalling out.

*Scattered Settlements*: The map starts with 2-3 pre-placed tiny villages, each functioning like a mini Settler's Camp with a small population and resource trickle. The player chooses where to focus development — build on an existing village, found a new center between them, or absorb them as the city grows outward. Different starting puzzle, same core mechanics.

**The Settler's Camp** can later be upgraded (into a market, town hall, or similar), kept as a legacy/monument (the centerpiece of a plaza, like Banished's wagon), or demolished if the space is needed. It has no ongoing cost and its trickle becomes irrelevant once real economy is established.

### Early Game Flow

The reverse economy of scale ensures the early game is forgiving. The first few buildings are dirt cheap. The settler's trickle covers initial costs. The event deck starts slow — early events are mild and often beneficial (trade opportunities, wandering settlers). The player has breathing room to explore the map, experiment with placement, and learn the substrate system without being punished for suboptimal early choices.

### Loss Conditions

There is **no hard loss trigger**. The game doesn't end when population hits zero or a specific event fires. Instead, the player can:
- **Concede**: Acknowledge the collapse and end the run, receiving a summary/score/narrative of their city's history.
- **Keep playing**: Even after catastrophic damage, if any population remains, the player can attempt to rebuild. This is usually futile but sometimes produces the most entertaining emergent stories.
- **Total collapse**: If population genuinely reaches zero, the run ends with a historical epitaph.

### Scoring / Run Summary

At the end of a run (however it ends), the player receives a narrative summary: peak population, greatest achievement, longest peace, most devastating crisis, cause of collapse. This reinforces the "each run is a story" roguelike feel. Scoring can be based on peak city metrics, survival duration, and difficulty settings.

---

## Unlock & Progression System

### Building-Based Tech Tree

Progression uses a **StarCraft-style implicit tech tree**: buildings unlock other buildings. There is no separate tech screen, no research points, no technology to "discover." You build a kiln, and that unlocks the potter's workshop. You build a potter's workshop AND a shrine, and ceremonial goods production becomes available.

This keeps cognitive load minimal — every unlock is immediately tangible and tied to a physical building the player placed. Discovery happens through play, not through studying a tree diagram.

### Tier Structure

Progression is organized into roughly **four development tiers**, gated by population thresholds AND the presence of specific prerequisite buildings:

**Tier 1 — Settlement**: The founding phase. Available from the start. Settler's Camp, farms, lumber camp, basic pasture, clay pit, well, simple shrine, palisade wall. Laborers only. Basic resource gathering, survival-focused.

**Tier 2 — Village**: Requires ~50 population and Tier 1 buildings. Unlocks workshops (potter, weaver, tanner), a market, stone quarry, proper granary, watchtower, basic barracks. Craftsmen and merchants begin to appear. Production chains activate. First real economic decisions.

**Tier 3 — Town**: Requires ~200 population and key Tier 2 buildings. Unlocks temples, bronze smithy, scribal school, stone walls, palace (small), trade post, specialized workshops. Priests, warriors, and early elites appear. Diplomacy becomes possible. The city starts attracting external attention (raids, trade interest).

**Tier 4 — City-State**: Requires ~500+ population and key Tier 3 buildings. Unlocks monumental architecture (great temple, grand palace, arena), advanced military (siege workshop, fortified gates), diplomatic buildings (embassy, treasury), cultural institutions (library, academy). Full elite population. Maximum capability, maximum complexity, maximum vulnerability.

These thresholds are approximate and subject to balancing. The implementing agent should treat them as starting points.

---

## Configurable Difficulty & Roguelike Settings

### Preset Experiences

Curated difficulty presets that combine settings into a specific, thematic experience. Names are evocative and set expectations:

- **Mediterranean Meditation**: Generous resources, slow event escalation, mild threats, forgiving climate. A relaxed, learning-friendly experience.
- **Anatolian Antics**: Standard resources, moderate escalation, varied threats. The "default" experience.
- **Mesopotamian Mayhem**: Scarce water/food, fast escalation, aggressive neighbors, environmental degradation. The challenge mode.
- **Aegean Apocalypse**: Extreme settings. Sea Peoples arrive early. Bronze trade is unreliable. Events overlap aggressively. For masochists and streamers.

### Granular Settings (Advanced)

Players can customize individual parameters. The full list of tweakable settings is an implementation-phase decision, but should include at minimum:

- **Event deck escalation speed**: How quickly harder cards are added.
- **Event draw frequency**: Base rate and acceleration curve.
- **Starting resources**: How much the Settler's Camp trickle provides.
- **Map resource density**: How abundant local resources are.
- **Threat frequency and intensity**: How often and how hard military threats hit.
- **Environmental degradation rate**: How fast forests deplete, soil exhausts.
- **Trade reliability**: How stable trade routes are, how often disruptions occur.
- **Citizen satisfaction sensitivity**: How demanding upper tiers are.
- **Building pool randomization**: How much the available building set varies per run (0% = always the same set, 100% = maximally randomized).

---

## Technical Recommendations

### Proof of Concept (Phase 1)

**Goal**: Validate the simulation — substrate propagation, resource flows, event system, population dynamics, building placement and interaction. Visual fidelity is secondary.

**Recommended Stack**: Browser-based, using HTML Canvas or **Pixi.js** for 2D grid rendering + vanilla TypeScript for simulation logic. Simple top-down or basic isometric view. Functional UI for sliders, event popups, data layer toggles. No 3D, no asset pipeline, no audio.

**What the PoC must prove:**
- Nucleus placement creates substrate heat maps that update in real time.
- Organic population growth responds to substrate conditions.
- The five-resource economy flows correctly with implicit production chains.
- The operational slider affects building behavior visibly.
- The event deck draws, presents choices, and applies consequences.
- Military threats arrive and auto-resolve based on city state.
- A run has a discernible arc from founding through growth through escalating pressure.

**What the PoC can skip:**
- Beautiful visuals, animations, particle effects.
- Audio and music.
- Full building roster (10-15 representative buildings across tiers is enough).
- Full event deck (15-20 events across difficulty levels to prove the pattern).
- Trade/diplomacy UI (can be simulated with placeholder mechanics).
- Save/load.
- The scattered settlements start mode (blank slate only for PoC).

### Full Implementation (Phase 2)

**Recommended Engine**: **Godot 4** (GDScript or C#). Strong 2D tilemap support, suitable for isometric rendering, open source, active community. The node-based architecture maps naturally onto the building/substrate system.

**Visual Target**: Isometric projection in the style of late-90s/early-2000s city builders (Pharaoh, Caesar III, SimCity 3000). Warm, earthy palette appropriate to the Bronze Age Mediterranean/Near Eastern setting. Clean, readable sprites with personality. Data layer overlays as translucent heat maps toggled over the base view.

**Simulation logic from the PoC should transfer directly** — the core systems are engine-agnostic. Phase 2 adds the rendering layer, full art pipeline, complete building and event content, audio, UI polish, save/load, and the full suite of configuration options.

---

## Scope Summary

### Core Scope (Must Have for Playable Game)

- Nucleus/substrate city model with six data layers
- Five-resource economy with implicit production chains
- Six citizen tiers with organic population dynamics
- Operational intensity slider on all buildings
- Deck-based event system with choice popups
- Military threats with event-card interaction and auto-resolve
- Basic regional trade (recurring deals + market building)
- Settler's Camp bootstrapping and blank-slate start mode
- Building-prerequisite progression across four tiers
- Map generation with terrain variability
- Building pool randomization per run
- Difficulty presets and basic granular settings
- Run summary/scoring
- Data layer visualization overlays

### Medium Stretch Goals

- Scattered Settlements start mode
- Diplomatic envoy system
- Trade caravan visitors
- Expanded event deck (50+ events)
- Full building roster (30+ nucleus building types with variants)
- Advanced difficulty customization

### Long-Term Stretch Goals

- Tower defense combat resolution mode
- Procedural narrative system (emergent stories from event sequences)
- Meta-progression across runs (unlocking new building variants, start modes, etc.)
- Multiplayer or shared-world features
- Modding support for custom buildings, events, and maps
