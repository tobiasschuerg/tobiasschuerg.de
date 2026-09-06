---
title: "Projekte"
# The section page has no content of its own — the cards live on the homepage.
build:
  render: never
  list: never
cascade:
  # Project pages are card data, not pages: never written to disk, but
  # still listed so the homepage query in layouts/home.html
  # (where .Site.RegularPages "Section" "projects") keeps finding them.
  build:
    render: never
    list: always
---
