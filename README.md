# tobiasschuerg.de

Personal website built with Hugo.

## Development

### Prerequisites
- [Hugo](https://gohugo.io/installation/) v0.148.1 or later

  Match the version pinned as `HUGO_VERSION` in
  `.github/workflows/hugo.yml`. Older releases will not build this site:
  it uses the flat `layouts/` scheme and the `build` front matter key
  (Hugo 0.146+) and `languages.en.disabled` in `hugo.toml`.

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

## Deployment

Pushing to `master` runs `.github/workflows/hugo.yml`, which builds the
site and deploys `public/` to GitHub Pages.
