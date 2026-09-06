# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal static site (tobiasschuerg.de) built with Hugo. No theme, no
Node/Go dependencies, no build pipeline beyond Hugo itself. There is no test
suite and no linter — verification means building the site and inspecting the
output.

The design is an 8-bit arcade treatment: Sweetie-16 palette on `#1a1c2c`,
Press Start 2P for display type and JetBrains Mono for body, project cards as
"cabinets" on a LEVEL SELECT screen.

## Commands

```bash
hugo server                            # dev server at http://localhost:1313
rm -rf public && hugo --gc --minify    # production build (same flags as CI)
```

**Always `rm -rf public` before a verification build.** Hugo does not clean the
output directory, so files from a previous build survive and will make deleted
or unrendered pages look like they still exist.

Useful checks after a build:

```bash
find public -name "*.html" | sort                      # what actually rendered
grep -o 'class="level cabinet' public/index.html | wc -l   # project cards (expect 6)
grep -rhoE 'https?://[a-z0-9.-]+' public --include="*.html" | sort -u
```

Keep the local Hugo version matching `HUGO_VERSION` in
`.github/workflows/hugo.yml` (currently 0.148.1).

## Architecture

### Project pages are data, not pages

The homepage is content-driven. `layouts/home.html` queries
`where .Site.RegularPages "Section" "projects"` and renders a card per result.
The files in `content/projects/*.md` have **no body** — they are structured
data only:

| Key | Purpose |
|---|---|
| `project_description` | `de` / `en` sub-keys |
| `accent` | `yellow`, `green`, `blue`, `orange`, `red`, `purple` → `.acc-*` class |
| `weight` | card order |
| `screenshot` | path to an image (optional — see below) |
| `links[].color` | `green`, `blue`, `purple` for the primary button |

Consequently `content/projects/_index.md` cascades `build` to them:

```yaml
build:
  render: never      # don't write a standalone page to disk
  list: always       # but keep them in .Site.RegularPages
```

`list: always` is load-bearing. Changing it to `local` or `never` silently
empties the homepage — the build still succeeds and reports no warning. If the
cards ever disappear, check this first.

`content/apps/_index.md` sets `render: never` *without* a cascade, so the
section page is suppressed while its policy/terms children still render.

Use `build:`, not `_build:` — the underscore form was deprecated in Hugo 0.145
and warns on every build.

### Screenshots are optional and must stay honest

Each card has a 140×280 slot. When `screenshot` is absent the card renders a
hatched "Screenshot folgt" placeholder. The repo ships no images. Do not
invent or substitute screenshots; add the file and set the front matter key.

### `[hidden]` needs the `!important` reset

`layouts/baseof.html` carries:

```css
[hidden] { display: none !important; }
```

This is not tidiness. `hidden` is only a user-agent style, so any author
`display` rule overrides it. Both full-screen overlays in `layouts/ueber.html`
(`.panic`, `.fx`) set `display: flex` — without the reset they render
permanently on page load. This shipped broken once. Any new overlay that sets
`display` and relies on the `hidden` attribute depends on this rule.

### The Über terminal

`layouts/ueber.html` is a self-contained interactive terminal, reached because
`content/about.de.md` sets `layout: "ueber"`. It holds its own markup, styles
and vanilla JS.

- `run(cmd)` is the dispatcher; it returns `[output, kind]` where kind is
  `res`, `err` or `art`, or the sentinels `__panic__` / `__clear__`.
- `ls`, `open` and `top` read a real project list serialised from Hugo via
  `{{ $items }}`. html/template converts the Go slice to a JS array literal in
  script context — do not wrap it in `jsonify`.
- Typed input is rendered with `textContent`, never `innerHTML`.
- Arrow up/down walk history; `rm -rf` opens the kernel panic; `claude` fires a
  canvas fireworks overlay.

### Styling lives in one file

All global CSS is a single inline `<style>` block in `layouts/baseof.html` —
no `assets/` pipeline, no SCSS, no external stylesheet. Page-specific styles
sit in their own `<style>` block inside the relevant layout.

Watch selector specificity when adding to `layouts/`. `.level-links a` (0,1,1)
once beat `.btn` (0,1,0) and silently stripped the buttons' colour and added
underlines; the button rules are now scoped as `.level-links a.btn`.

### Fonts are self-hosted — keep it that way

`static/fonts/` holds four WOFF2 files (~64 KB) declared as `@font-face` in
`baseof.html`. **Do not reintroduce Google Fonts.** Loading them from
`fonts.gstatic.com` sends every visitor's IP to Google, which LG München I
found an actionable DSGVO violation (3 O 17493/20), and `/datenschutz/`
currently states that no third-party requests happen.

The built site should make **zero external resource requests**; every
remaining `https://` URL in the output is an `<a href>`. The grep above
verifies this.

JetBrains Mono is the variable file — one download covers weights 400–700.
Both faces are SIL OFL 1.1 and the licence must stay at
`static/fonts/LICENSE.txt`.

### URLs under /apps/ are load-bearing

Each `content/apps/<app>/{policy,terms}.md` pins its own URL via explicit
`url:` front matter. These are linked from Play Store listings, so treat the
paths as a public contract — don't restructure or rename them.

### Bilingual scaffolding, German only in practice

The site is configured as multilingual but `[languages.en]` has
`disabled = true` in `hugo.toml`. The English config, menu and the `en` strings
in project front matter are intentionally kept for later.

`.Site.RegularPages` is **per-language**, so re-enabling English requires
translated `content/projects/*.en.md` files — otherwise the English homepage
renders an empty grid. `hugo.toml` carries a comment with the full checklist.
Menu URLs and card links are plain absolute paths (`/about/`), not
language-aware, so they would also need `relLangURL`.

## Testing the terminal JS

There is no test runner, but Node is available and the dispatcher can be
driven directly:

1. Build **unminified** to a temp directory: `hugo --quiet --destination <tmp>`.
   The minifier renames `run`, so testing the minified output fails.
2. Extract the last `<script>` block from `<tmp>/about/index.html`.
3. Append `globalThis.__run = run;` before the closing `}())`.
4. Stub `document`, `window.matchMedia`, `requestAnimationFrame`, and a canvas
   `getContext` returning no-ops; then call `__run('help')` and friends.

Capturing the input element's `keydown` handler this way also exercises the
history recall.

## Legal pages

`/impressum/` and `/datenschutz/` are linked from the footer.
`/datenschutz/` describes the *website*; the per-app policies under `/apps/`
are separate documents. If the site starts loading anything external, or sets
storage, `/datenschutz/` has to change with it.

## Deployment

Push to `master` triggers `.github/workflows/hugo.yml`, which builds and
deploys `./public` to GitHub Pages.

Two consequences worth knowing:

- The workflow passes `--baseURL "${{ steps.pages.outputs.base_url }}/"`, which
  **overrides** the `baseURL` in `hugo.toml`. That value comes from the custom
  domain configured in repo settings.
- Only the contents of `public/` are deployed, and Hugo only copies files from
  `static/`. That is why `CNAME` lives at `static/CNAME` — at the repo root it
  would never reach the artifact.
