# Gentle Media — Pixel Street

A lightweight, pixel-art walking experience for showcasing Gentle Media client websites. It runs as a static site: no build step, backend, game engine, or image assets required.

## Run it

Open `index.html` in a browser, or serve this folder locally (recommended so browser iframe behavior matches hosting):

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

To publish with GitHub Pages, push the repository and choose **Settings → Pages → Deploy from a branch**, then select `main` and `/ (root)`.

## Add your clients

Edit [`data/sites.js`](data/sites.js). Each entry represents one storefront:

```js
{
  id: 'client-slug',
  name: 'Client Name',
  category: 'INDUSTRY OR SERVICE',
  url: 'https://client-website.com',
  description: 'A short introduction shown before the homepage.'
}
```

Use real homepage URLs in `url`. The first five entries appear on the block. Storefront previews use an iframe, but some sites block embedding; the **Visit Website** button opens the actual site in a new tab regardless.

## Controls

- Walk: `W A S D` or arrow keys
- Explore a nearby storefront: `E` or `Enter`
- Help: `?`
- Mobile: on-screen arrow pad

## Project structure

```text
index.html       Main page and dialogs
src/game.js      Canvas scene, movement, and storefront interaction
src/style.css    Responsive interface and pixel-game frame
data/sites.js    Client storefront list
```

The game draws the scene with a small canvas and geometric shapes, so the repository stays tiny and avoids downloadable art packs. The demo homepage URLs point to `example.com`; replace them before publishing.
