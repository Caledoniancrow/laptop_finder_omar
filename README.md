# Student Laptop Finder

SW302 User Interface Development, Assignment 2.

A five-page web app that helps students browse, search, filter, save and compare laptops. All laptop content is loaded from `data/laptops.json` with JavaScript, and all styling uses Tailwind CSS 4.

- Author: Omar Amgad
- Repository: https://github.com/Caledoniancrow/laptop_finder_omar

## Pages

- `index.html`: home page with category shortcuts, live statistics (number of laptops, lowest price, longest battery life, saved favorites) and the three laptops with the longest battery life.
- `laptops.html`: catalogue of 24 laptops with live search by name or brand, category, maximum price and minimum RAM filters, six sort options, a result count and loading skeletons.
- `details.html?id=7`: one laptop, chosen by the id in the URL, with every field, its description, a full specification table, and buttons to save it and add it to the comparison.
- `favorites.html`: saved laptops with remove, clear all, and the total and average price.
- `compare.html`: two to four favorites side by side, with the best value in each row highlighted.

## Install and build

You need Node.js with npm.

```bash
npm install
npm run build
```

`npm run build` runs `tailwindcss -i ./src/input.css -o ./dist/output.css`. While editing, `npm run watch` rebuilds the CSS on every save.

## Run

Open the folder in VS Code, start Live Server (Go Live) and open `index.html`. The pages must be served by a local server: `fetch()` and ES modules do not work on pages opened directly from the folder.

## Project structure

```text
laptop_finder_omar/
├─ index.html  laptops.html  details.html  favorites.html  compare.html
├─ src/
│  ├─ input.css
│  └─ js/  api.js  storage.js  ui.js  compare.js  header.js  theme-init.js
│          home-page.js  laptops-page.js  details-page.js  favorites-page.js  compare-page.js
├─ data/laptops.json
├─ dist/output.css
├─ assets/  images (laptop drawings, favicon) and fonts
├─ package.json
└─ README.md
```

## Technologies

- HTML5 with semantic landmarks and accessible tables and forms.
- JavaScript ES modules with no libraries: `fetch()` with `async`/`await` in `try`/`catch`, `map`, `filter`, `sort` and `reduce`, `URLSearchParams`, and `localStorage` with `JSON.stringify()` and `JSON.parse()`.
- Tailwind CSS 4 installed with npm, with the official plugins `@tailwindcss/forms` and `@tailwindcss/typography`.
- Two themes defined with `@theme` in `src/input.css`: Battery Saver Mode (light with green accents) and Performance Mode (dark with an orange accent). The choice is saved and restored on every page.

## Credits

- Font: Atkinson Hyperlegible Next, Copyright 2020-2024 The Atkinson Hyperlegible Next Project Authors, licensed under the SIL Open Font License 1.1 (`assets/fonts/OFL.txt`).
- The laptop drawings are original SVG illustrations made for this project.
- Prices and specifications are sample data for a course project, not live shop prices.
