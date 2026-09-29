# ScienceAtlas

An interactive 3D science explorer for students — orbit, explode, and click-to-inspect three atlases:

1. **Human Anatomy** — a stylized procedural figure with 7 toggleable systems (skeletal, muscular, cardiovascular, nervous, digestive, respiratory, urinary), 25 clickable organs and structures, and an explode slider that separates the systems in 3D.
2. **Animal Cell** — 13 clickable organelles inside a translucent membrane: nucleus, nucleolus, mitochondria, RER, SER, Golgi, ribosomes, lysosomes, vacuole, centrioles, cytoskeleton, membrane, and cytoplasm.
3. **Molecules** — six switchable ball-and-stick models with correct VSEPR geometry (bent H₂O at 104.5°, linear CO₂, tetrahedral CH₄ at 109.5°), an NaCl ionic lattice, and a simplified glucose ring. Click any atom for element info (name, atomic number, exam fact); the study card shows each molecule's bond type and molecular geometry.

Every study card carries a plain-English description plus a "🔑 Exam point" distilled from open textbook content (OpenStax Biology 2e and Chemistry 2e), so the app doubles as an exam-prep tool.

## Run it locally

No build step, no backend. From this folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Controls

- **Drag** to orbit, **scroll / pinch** to zoom
- **Click any structure** to open its study card (click empty space to close)
- **Explode slider** (bottom) separates the systems / organelles / atoms in 3D
- **Left panel**: toggle body systems, organelle layers, or switch molecules
- Mobile: the left panel collapses behind the ☰ button; the study card becomes a bottom sheet

## Tech

- Static HTML/CSS/JS, [Three.js 0.160.0](https://threejs.org/) via CDN import map (no build step)
- All geometry is procedural — no external model files
- Raycasting for click-to-inspect, hover highlighting, per-part explode vectors
- System toggles simply toggle group visibility; explode = `position = basePos + explodeDir × t × factor`

## Files

```
index.html          app shell (import map, panels, explode slider)
css/style.css       dark theme, responsive desktop/mobile
js/main.js          scene, controls, picking, panels, explode
js/anatomy.js       25-part procedural human figure, 7 systems
js/cell.js          13-organelle animal cell
js/molecules.js     6 switchable molecules/lattices
```

## Educational grounding

Study-card content is grounded in OpenStax Biology 2e (Ch. 4 cell structure; Ch. 34–41 organ systems) and OpenStax Chemistry 2e (Ch. 7 bonding & VSEPR molecular geometry; Ch. 10 solids; Ch. 2 atoms/ions).
