# Structural Design Dashboard

A formula reference for the SAMS structural design course (TU Delft, MSc Building Technology). Every formula from the Week 1–6 course material appears as a tile. Each tile gives the formula in LaTeX (rendered with [KaTeX](https://katex.org)), the meaning of every variable and its unit.

| Tab | Week |
|---|---|
| Structural Mechanics Basics | 1 |
| Materials Science | 2 |
| Steel | 3 |
| Timber | 4 |
| Concrete | 5 |
| Glass | 6 |

Inside each tab, tiles are grouped by sub-topic. The site only shows information; it is not a calculator.

## Running locally

There is no build step. Open `index.html` in a browser.

## Project structure

```
index.html            page shell, loads KaTeX from cdnjs
css/style.css         layout and light/dark theme
js/app.js             renders tabs → sub-topics → tiles
data/topics.js        the six topics
data/weekN-*.js       formula data, one file per week
scripts/validate.mjs  checks every LaTeX string compiles and every entry is complete
```

## Adding or editing a formula

Each entry in `data/weekN-*.js` looks like this:

```js
{
  id: "steel-tension-gross",
  topic: "steel",
  subtopic: "Tension members",
  name: "Tension resistance — gross section yield",
  latex: String.raw`N_{t,Rd} = \frac{A f_y}{\gamma_{m0}}`,
  variables: [
    { symbol: String.raw`A`, description: "Gross area", unit: String.raw`\text{mm}^2` },
    // ...
  ],
  notes: "Optional remark",
  source: { file: "Week 3 - Lecture Notes ...pdf", page: 6 },
}
```

Then run the validator (needs Node.js):

```bash
npm install
npm run validate
```

The validator also runs on GitHub Actions on every push. If it passes, the site is deployed to GitHub Pages.

> The course PDFs are not part of this repository.
