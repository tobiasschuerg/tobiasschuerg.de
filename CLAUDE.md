# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal static site (tobiasschuerg.de) built with Hugo. No theme, no
Node/Go dependencies, no build pipeline beyond Hugo itself. There is no test
suite and no linter — verification means building the site and inspecting the
output.

Two things sit outside that. `tools/gen_brand_assets.py` draws the favicon and
the Open Graph card; it is run by hand, its outputs are committed, and CI never
touches it. `tools/term_test.mjs` and `tools/pizza_test.mjs` are the two
automated tests — for the Über terminal and the Pizzeria game — and need only
Node.

Hugo's own asset pipeline is used for exactly two files: `assets/js/terminal.js`
and `assets/js/pizza.js` are minified and fingerprinted into the build.
Everything else — all CSS included — is still inline in the templates.

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
grep -o '<lastmod>' public/sitemap.xml | wc -l         # must equal the <loc> count

# Every remote subresource — must print nothing. Bare URL greps no longer
# work: rel=canonical and og:image are absolute URLs to our own origin.
grep -rhoE '(src|srcset)=["'"'"']?https?://' public --include="*.html"
```

Keep the local Hugo version matching `HUGO_VERSION` in
`.github/workflows/hugo.yml` (currently 0.165.0). The floor is 0.158: the
language config uses `locale` / `label` and the templates use
`.Site.Language.Locale`, which replaced `languageCode` / `languageName` /
`.Site.LanguageCode`. An older binary fails the build with
`can't evaluate field Locale in type *langs.Language`.

A version bump is verified by building with both binaries and diffing the
output — anything beyond the `<meta name=generator>` string is a real change.

```bash
node tools/term_test.mjs               # the terminal dispatcher (Node only)
node tools/pizza_test.mjs              # the Pizzeria game (Node only)
python tools/gen_brand_assets.py       # rewrites the four icon files in static/
```

The last needs Python with Pillow; the tests need nothing.

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

### Brand assets come from one pixel grid

`tools/gen_brand_assets.py` draws all four of these from the single 16×16
`MARK` grid, so the icon is the same shape everywhere:

| File | Notes |
|---|---|
| `static/favicon.svg` | one `<rect>` per horizontal run, `shape-rendering: crispEdges` |
| `static/favicon.ico` | 16/32/48, each an independent nearest-neighbour render |
| `static/apple-touch-icon.png` | 180×180 (11× the grid, padded — keeps pixels square) |
| `static/og-image.png` | 1200×630 share card |

The mark is a pizza slice, pointing at the dough calculator. It was picked
over an arcade cabinet because **a favicon has to survive 16px** — the cabinet
was legible at 48px and mush in a tab. Judge any replacement at 16px, not
zoomed in.

Edit `MARK` and re-run; do not hand-edit the outputs. The ICO is assembled
byte by byte on purpose: letting Pillow resample one bitmap down to 16px
blurs a pixel-art mark.

The OG card is typeset in `static/fonts/*.woff2` — FreeType reads WOFF2
directly, so the card uses the same faces as the page. That makes the font
files a dependency of the generator as well as of the site.

The script is **not** part of the build. Its outputs are committed, Hugo just
copies them out of `static/`, and CI never installs Pillow.

### Head metadata is per-page

`layouts/baseof.html` computes `$title` and `$desc` once at the top of
`<head>` and reuses them for `<title>`, `<meta name=description>`, `og:title`
and `og:description`.

`$desc` is `.Description | default .Site.Params.description`, so **give every
new content file a `description` in its front matter**. The site tagline is
only a fallback; when it wins, that page ships the same meta description as
every other page, which is what this replaced.

Open Graph and `twitter:card` are written out by hand rather than via
`_internal/opengraph.html`: one image for the whole site, no article
metadata, nothing to configure.

### Dates on the legal pages come from git

`enableGitInfo = true` in `hugo.toml` makes `.Lastmod` the date of the last
commit that touched the file, through Hugo's default
`lastmod = [":git", "lastmod", "date", "publishDate"]` chain. `layouts/page.html`
renders it as `Stand: <time datetime="…">`.

Two consequences:

- The policies no longer carry a hand-written `Stand:` line in the markdown.
  Do not add one back — it would drift away from the real last edit, which is
  exactly the failure this removed.
- **Any commit touching a policy re-dates it.** A typo fix moves the date on a
  legal document. That is the intended trade, but it is a trade.

`hide_lastmod: true` opts a page out; `content/apps/delete.md` uses it because
it is an English stub, not a dated German legal document.

This is also what puts `<lastmod>` in `sitemap.xml`, and it is why the deploy
workflow needs a full clone — see *Deployment*.

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

`layouts/ueber.html` holds the markup and styles; the behaviour lives in
`assets/js/terminal.js`. The page is reached because `content/about.de.md` sets
`layout: "ueber"`.

- `run(cmd)` is the dispatcher; it returns `[output, kind]` where kind is
  `res`, `err` or `art`, or the sentinels `__panic__` / `__clear__`.
- Typed input is rendered with `textContent`, never `innerHTML`.
- Arrow up/down walk history; `rm -rf` opens the kernel panic; `claude` fires a
  canvas fireworks overlay.

**The JS is an external file on purpose.** It is loaded as

```go-html-template
{{ $js := resources.Get "js/terminal.js" | minify | fingerprint }}
<script src="{{ $js.RelPermalink }}" integrity="{{ $js.Data.Integrity }}" defer></script>
```

which is what allows `script-src 'self'` with no `'unsafe-inline'`. **Do not
move it back inline, and do not add an inline `<script>` to any layout** — the
CSP would block it, and loosening the CSP to accommodate it gives up the only
part of that policy with real teeth.

Hugo data reaches it as JSON in a data attribute, not as template syntax inside
the script:

```go-html-template
<div id="term-data" hidden data-terminal="{{ dict "projects" $items ... | jsonify }}"></div>
```

`ls`, `open` and `top` read that list, so they stay true to the real projects.
A `<div>` attribute rather than a `<script type="application/json">` island
keeps this out of Go's script-context escaping entirely; `jsonify` **is**
correct here, unlike in the old inline form.

### The Pizzeria game

`/pizzeria/` is a small arcade game: the ticket names a pizza, you drag the
right toppings onto the dough, bake, deliver — 60 seconds a shift.
`content/pizzeria.de.md` is an empty stub whose `layout: "pizzeria"` picks up
`layouts/pizzeria.html`; the behaviour lives in `assets/js/pizza.js` and is
loaded as an external, fingerprinted script for the same reason the terminal
is — an inline `<script>` would need `'unsafe-inline'` in `script-src`.

**The ticket names the pizza, not the recipe.** `MENU` in `pizza.js` holds
sixteen pizzas, four each at one to four toppings, and `makeOrder()` picks by
size: one topping until order 3, then two, three from 6, four from 9. Two
pizzas must never share a recipe — the cookbook could not tell them apart
either, and the player would be marked wrong for knowing the menu. The test
checks that.

The cookbook overlay (`#pg-book`, `K` or the button) is the only way to look a
recipe up, and it **covers the whole cabinet on purpose**: reading and topping
cannot happen at once, and the clock keeps running. That is the price, so
there is no extra penalty on top — don't add one.

Two more things about the layout:

- The eight toppings are defined **only** in `pizza.js`; the layout ships two
  empty bins (`#pg-bin-l`, `#pg-bin-r`) and the tiles are built at load, four
  per bin. That is also why the markup carries a visible `#pg-nojs` line,
  hidden once the script runs.
- Toppings are **dragged**, and the drag is built on Pointer Events, not the
  HTML5 drag-and-drop API — that API does not exist on touch, and the game has
  to work on a phone. Hence `touch-action: none` on `.pg-tile` (otherwise the
  page scrolls instead of the ingredient moving) and `pointer-events: none` on
  the floating `.pg-ghost` (otherwise it swallows the `pointerup` that has to
  reach the dough). The tile captures the pointer on `pointerdown`; the drop
  is a hit test against `#pg-stage`'s bounding box.
- Keys `1`–`8` put a topping on and take it off again. That is the only
  keyboard path — the tiles are `<div>`s, not buttons, because a button that
  does nothing when pressed is worse than no button.

And three traps carried over from the rest of the site:

- **The clock is a `requestAnimationFrame` loop and each step is capped at
  `MAX_FRAME` (250 ms).** A background tab freezes rAF and resumes with one
  enormous timestamp jump; without the cap that jump would swallow the whole
  shift. Capping it means switching tabs pauses the round instead.
- Start, game over and the cookbook all set `display: flex` and so depend on
  the `[hidden] { display: none !important }` reset in `baseof.html` — the
  same trap as the Über terminal's overlays.
- **No `localStorage`.** `/datenschutz/` promises the site stores nothing, so
  the record lives in a variable and dies with the page. Adding persistence
  means changing that document too.

The UI strings, the menu and `pizza.js` are German only — one more item on the
English checklist in `hugo.toml`. `content/pizzeria.en.md` is just the stub.

### Styling lives in one file

All global CSS is a single inline `<style>` block in `layouts/baseof.html` —
no SCSS, no external stylesheet. (`assets/` exists, but only for
`js/terminal.js` and `js/pizza.js`; no CSS goes through it.) This is why `style-src` still needs
`'unsafe-inline'` while `script-src` does not. Page-specific styles
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

The built site should make **zero external resource requests**. Absolute
`https://` URLs do now appear in the output — `rel=canonical` and `og:image`
point at our own origin — so the test is no longer "are there any URLs" but
"is anything *loaded* from elsewhere". The `src|srcset` grep under *Commands*
is the one that still means something; everything remote must be an `<a href>`.

JetBrains Mono is the variable file — one download covers weights 400–700.
Both faces are SIL OFL 1.1 and the licence must stay at
`static/fonts/LICENSE.txt`.

### The CSP is a privacy guard, not XSS hardening

`layouts/baseof.html` emits a `<meta http-equiv="Content-Security-Policy">`
whose real job is to make the promise in `/datenschutz/` enforceable: a Google
Font or an analytics snippet added later fails visibly instead of silently
contradicting the privacy policy.

Do not oversell it. The inline `<style>` block and the terminal's inline
`<script>` both need `'unsafe-inline'`, so it buys little against XSS. A
`<meta>` CSP also cannot carry `frame-ancestors` or `report-uri`; those need
real headers, which GitHub Pages cannot set.

It is wrapped in `{{ if hugo.IsProduction }}` **on purpose** — `connect-src
'none'` would kill the LiveReload websocket that `hugo server` injects. So it
is absent from the dev server and present in `hugo --gc --minify`. Verify it
by serving `public/` statically and watching the console, not via
`hugo server`.

### Headings and the pixel font

Every page has exactly one `<h1>`; on the home, Über and 404 screens it is the
`.screen-label` ("LEVEL SELECT", "CREDITS", "GAME OVER").

`.screen-label` sets `font-weight: 400` and that is load-bearing. Press Start
2P ships a single weight, so a heading inheriting the UA's `bold` makes the
browser synthesise one and smear the pixel grid.

Note that `.doc-title`, `.level-title` and `.doc-body h2/h3/h4` are all
headings in the pixel face **without** that reset, so they are being
synthetically emboldened today. That is pre-existing and consistent; fixing it
would change how those headings look, so it is a deliberate decision, not a
cleanup.

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

## Testing the page JS

```bash
node tools/term_test.mjs
node tools/pizza_test.mjs
```

Node only, no dependencies, no Hugo build. It reads `assets/js/terminal.js`
straight from source, stubs `document`, `window` and a canvas `getContext`, and
drives `run()` through `help`, `ls`, `open`, `top`, the error path and both
sentinels.

Two things it relies on:

- The source is an IIFE that exports nothing, so the test injects
  `globalThis.__run = run;` before the closing `}())`.
- It must run against `assets/`, never the built output — Hugo's minifier
  renames `run`.

`tools/pizza_test.mjs` works the same way for `assets/js/pizza.js`: it injects
an object exposing the rules (`makeOrder`, `check`, `scoreFor`), the menu, and a
handle on a running round, and — because the shift clock is a
`requestAnimationFrame` loop — it stubs `requestAnimationFrame` so it can
capture the callback and hand in frames itself. A whole 60-second shift
therefore plays out in milliseconds, including the oven, a correct delivery, a
botched one and the final whistle. What it cannot cover is the dragging itself;
that needs a real pointer in a real browser.

These two are the repo's only automated tests. Neither is wired into CI; run
the matching one after touching either file.

## Legal pages

`layouts/robots.txt` (enabled by `enableRobotsTXT`) points crawlers at the
sitemap. `/impressum/` and `/datenschutz/` are linked from the footer.
`/datenschutz/` describes the *website*; the per-app policies under `/apps/`
are separate documents. If the site starts loading anything external, or sets
storage, `/datenschutz/` has to change with it.

Their `Stand:` dates are generated, not written — see *Dates on the legal
pages come from git*.

## Deployment

Push to `master` triggers `.github/workflows/hugo.yml`, which builds and
deploys `./public` to GitHub Pages. The same workflow runs on `pull_request`
as a build-only check: `Setup Pages`, `Upload artifact` and the whole `deploy`
job are gated on `github.event_name != 'pull_request'`, so a PR can never
deploy. With `Setup Pages` skipped, `BASE_URL` is empty and
`${BASE_URL:+--baseURL "$BASE_URL/"}` expands to nothing, leaving the baseURL
from `hugo.toml`.

Three consequences worth knowing:

- The workflow passes `--baseURL "${{ steps.pages.outputs.base_url }}/"`, which
  **overrides** the `baseURL` in `hugo.toml`. That value comes from the custom
  domain configured in repo settings.
- Only the contents of `public/` are deployed, and Hugo only copies files from
  `static/`. That is why `CNAME` lives at `static/CNAME` — at the repo root it
  would never reach the artifact.
- `actions/checkout` runs with **`fetch-depth: 0`, and that is load-bearing.**
  `enableGitInfo` reads each file's last commit; the default shallow clone has
  only one commit, so every page would silently be stamped with the same date.
  The build still succeeds and warns about nothing. If the `Stand:` dates ever
  come out identical across all policies, check this first.
