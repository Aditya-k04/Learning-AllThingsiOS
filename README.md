# Apple-RE — Learning

A unified, interactive course site built from my Obsidian notes. Seven courses —
Interaction Math, Swift, SwiftUI, SwiftUI Data Flow, Core Animation, Metal Shaders,
and Stack Decisions — 147 lessons with 27 interactive demos (drag sliders, watch the
math/animation respond).

Everything is static HTML/CSS/JS. No build step is needed to *serve* it.

## Structure

```
index.html            landing / course picker
<course>.html         one SPA page per course (sidebar + lessons)
assets/style.css      shared design system
assets/app.js         nav, routing, lazy demo + syntax-highlight mounting
assets/demos.js       the interactive demo library (22 demos)
```

## Local preview

Open `index.html` in a browser, or run a tiny server from this folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Regenerating after editing notes

The pages are generated from the `../Learning-*` vault folders by a build script.
When you edit notes (or want new interactive demos added), just ask Claude in Cowork
to "rebuild the learning site" — it re-runs the pipeline and rewrites these files,
then you re-commit and push.

## Deploy (GitHub Pages)

`git init` *inside this folder* so only the site is published (not the whole vault),
push to a repo, then enable Pages → Deploy from a branch → `main` / root.
