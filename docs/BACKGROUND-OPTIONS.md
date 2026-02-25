# Hero background options — world-class first impression

The home / Builder hero background sets the tone before anyone types a word. This doc lays out all options so you can choose (or A/B test) what fits a world-class AI website builder.

---

## Current: Gold Fog (Vanta FOG)

**What it is:** Vanta.js fog effect with gold/amber highlights on dark base. Three.js/WebGL, mouse-reactive.

**Pros**
- Distinctive, premium feel; stands out from generic gradients.
- Motion and depth without being distracting.
- Aligns with “luxury / $50K” positioning.

**Cons**
- Depends on Three.js + Vanta (bundle size, GPU).
- Can feel “same” as other sites that use Vanta fog with different colors.
- On low-end devices, may drop frames or feel heavy.

**When to use:** When you want the product to feel premium and memorable from the first frame.

---

## Alternative 1: Vanta NET

**What it is:** Mesh of connected dots/nodes, optionally with spheres at vertices. Tech / data / “AI” vibe.

**Pros**
- Reads as “tech / AI / network” without saying it.
- Lighter than fog in some setups; still WebGL.

**Cons**
- Very common in SaaS/tech landings; less unique.
- Can feel cold or corporate if colors are wrong.

**Suggested palette:** Dark base (`#0a0812`), gold/amber nodes (`#e6a23c`) to keep brand warmth. Toggle in Builder: set `HERO_BACKGROUND = "net"` (see below).

---

## Alternative 2: CSS-only gradient (no WebGL)

**What it is:** Layered radial/conic gradients, optional subtle animation (e.g. slow shift of gradient position). No JS canvas.

**Pros**
- Zero extra JS; fast first paint; works everywhere.
- Easy to tune for brand (gold glow, cyan accent, etc.).
- No GPU dependency; great for performance and “world-class” Core Web Vitals.

**Cons**
- Less “wow” than 3D fog; can feel flat if overdone or underdone.

**When to use:** When you want maximum speed and reliability and are okay with a more restrained, editorial look.

---

## Alternative 3: Minimal flat dark

**What it is:** Solid or near-solid dark (`#04060e` / `#06080e`). Optional very subtle noise or grain.

**Pros**
- Fastest, cleanest. Puts 100% focus on headline and input.
- Used by many top product pages (linear, vercel, etc.).
- No motion = no distraction; feels “serious” and confident.

**Cons**
- Risk of feeling generic or “another dark SaaS” if the rest of the page doesn’t pop.

**When to use:** When you want the promise and CTA to carry the page and prefer a calm, confident tone.

---

## Other Vanta effects (available in the repo)

| Effect   | File                    | Vibe / use case                          |
|---------|-------------------------|------------------------------------------|
| Clouds  | `vanta.clouds.min.js`   | Softer, sky/cloud; less “tech”           |
| Clouds2 | `vanta.clouds2.min.js`| Variant of clouds                         |
| Waves   | `vanta.waves.min.js`   | Oceanic, flowing                         |
| Birds   | `vanta.birds.min.js`   | Organic, motion; can feel playful         |
| Dots    | `vanta.dots.min.js`    | Particle field                            |
| Globe   | `vanta.globe.min.js`    | 3D globe; “global / platform”             |
| Halo    | `vanta.halo.min.js`    | Glow / orb                                |
| Rings   | `vanta.rings.min.js`   | Concentric rings                          |
| Ripple  | `vanta.ripple.min.js`   | Water ripple                              |
| Topology| `vanta.topology.min.js`| Terrain-like mesh                         |
| Trunk   | `vanta.trunk.min.js`   | Branching structure                       |
| Cells   | `vanta.cells.min.js`   | Cellular / organic                       |

You can add any of these the same way as NET: dynamic import in `Builder.tsx` and a `HERO_BACKGROUND` option.

---

## How to switch the hero background today

In `src/io/surfaces/Builder.tsx`:

1. Find the constant **`HERO_BACKGROUND`** near the top (with other constants).
2. Set it to one of:
   - **`"fog"`** — Current gold fog (default).
   - **`"net"`** — Vanta NET with dark + gold.
   - **`"gradient"`** — CSS-only mesh-style gradient, no WebGL.
   - **`"minimal"`** — Flat dark, no effect.

No env vars required; change the constant and rebuild. For production you can later drive this from `NEXT_PUBLIC_HERO_BACKGROUND` if you want to A/B test or switch per environment.

---

## Recommendation for “world-class first”

- **If “world-class” = memorable and premium:** Keep **Gold Fog** or try **NET** with the same gold-on-dark palette; both support the “$50K” positioning.
- **If “world-class” = speed and confidence:** Use **gradient** or **minimal** so the first paint is instant and the headline/CTA own the page.
- **Best of both:** Use **gradient** or **minimal** by default for performance, and offer a “Premium” or “Pro” theme that enables fog for signed-in or high-DPR users (optional future step).

---

*Last updated: hero background switchable via `HERO_BACKGROUND` in Builder.tsx (fog | net | gradient | minimal).*
