# Divine Melodies

Website for **Divine Melodies** — a group of Christian musicians from the Dallas–Fort Worth area, dedicated to evangelization through music and worship. Live at [divinemelodies.org](https://divinemelodies.org).

## Structure

```
index.html          Single-page site
css/styles.css      Styles (design tokens at the top)
js/main.js          Nav, scroll reveals, sound-wave animation, contact form + captcha
images/             Logo (SVG + PNG sizes), favicon, social share image
design/             Logo source and build script
CNAME               GitHub Pages custom domain
```

## Run locally

It's a static site — no build step.

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Logo

`images/dm-logo.svg` is generated from `design/logo-src.svg` with the Cinzel fonts embedded, so it renders identically everywhere. After editing the source, regenerate the SVG and all PNG variants (requires Google Chrome):

```bash
python design/build_logo.py
```

## Contact form

The form posts to [Formspree](https://formspree.io). Update the `action` URL on `#contactForm` in `index.html` to change where messages are delivered.

## Deployment

Hosted on GitHub Pages from the `main` branch root, with the custom domain set in `CNAME`.
