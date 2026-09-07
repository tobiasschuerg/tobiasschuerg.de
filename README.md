# tobiasschuerg.de

Personal website built with Hugo.

## Development

### Prerequisites
- [Hugo](https://gohugo.io/installation/) v0.165.0 or later

  Match the version pinned as `HUGO_VERSION` in
  `.github/workflows/hugo.yml`. Older releases will not build this site:
  it uses the flat `layouts/` scheme and the `build` front matter key
  (Hugo 0.146+), `languages.en.disabled`, and the `locale` / `label`
  language keys with `.Site.Language.Locale`, which replaced
  `languageCode` / `languageName` / `.Site.LanguageCode` in Hugo 0.158.

  On an older Hugo the build fails outright with
  `can't evaluate field Locale in type *langs.Language` — it does not
  degrade quietly.

### Local Development

```bash
hugo server
```

The site will be available at `http://localhost:1313`

### Building for Production

```bash
rm -rf public && hugo --gc --minify
```

The built site will be in the `public/` directory.

Hugo does not clean `public/` between builds, so remove it first —
otherwise pages deleted or no longer rendered will still appear there
and look live.

## Brand assets

The favicon and the Open Graph share card are generated from a single 16x16
pixel grid by `tools/gen_brand_assets.py`:

```bash
python tools/gen_brand_assets.py
```

It rewrites `static/favicon.svg`, `static/favicon.ico`,
`static/apple-touch-icon.png` and `static/og-image.png`. Edit the `MARK` grid
in the script rather than the generated files, and check the result at 16px —
that is the size a favicon actually has to work at.

The only requirement is Python with [Pillow](https://pypi.org/project/pillow/).
This is deliberately *not* part of the build: the outputs are committed, Hugo
just copies them out of `static/`, and CI never installs anything for it.

## Content notes

- Give every new page a `description` in its front matter. Without one it
  falls back to the site tagline, and that page ends up sharing a meta
  description with every other page.
- The `Stand:` date on the legal pages is generated from the file's last
  commit (`enableGitInfo`). Do not write one into the markdown. Set
  `hide_lastmod: true` to suppress it on a page that is not a dated document.

## Deployment

Pushing to `master` runs `.github/workflows/hugo.yml`, which builds the
site and deploys `public/` to GitHub Pages.

The checkout uses `fetch-depth: 0` because `enableGitInfo` needs real history
to date each page. With a shallow clone every page silently gets the same
date.
