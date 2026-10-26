// Validates the formula data: every LaTeX string must compile in KaTeX and every entry must be complete.
// Usage: node scripts/validate.mjs
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import katex from "katex";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const dataFiles = [...html.matchAll(/<script src="(data\/[^"]+\.js)"><\/script>/g)].map((m) => m[1]);

const context = { window: {} };
vm.createContext(context);
for (const file of dataFiles) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
}

const topics = context.window.TOPICS;
const formulas = context.window.FORMULAS;
const topicIds = new Set(topics.map((t) => t.id));
const errors = [];
const ids = new Set();

function checkTex(src, where, displayMode) {
  if (typeof src !== "string" || !src.trim()) {
    errors.push(`${where}: empty LaTeX`);
    return;
  }
  try {
    katex.renderToString(src, { throwOnError: true, strict: "error", displayMode });
  } catch (e) {
    errors.push(`${where}: ${e.message}`);
  }
}

for (const f of formulas) {
  const where = f.id || "(missing id)";
  if (!f.id) errors.push(`entry without id: ${f.name}`);
  else if (ids.has(f.id)) errors.push(`${where}: duplicate id`);
  ids.add(f.id);
  if (!topicIds.has(f.topic)) errors.push(`${where}: unknown topic "${f.topic}"`);
  for (const key of ["subtopic", "name"]) if (!f[key]) errors.push(`${where}: missing ${key}`);
  if (!f.source || !f.source.file || !f.source.page) errors.push(`${where}: missing source file/page`);
  checkTex(f.latex, `${where}.latex`, true);
  if (!Array.isArray(f.variables) || !f.variables.length) errors.push(`${where}: no variables`);
  (f.variables || []).forEach((v, i) => {
    checkTex(v.symbol, `${where}.variables[${i}].symbol`, false);
    checkTex(v.unit, `${where}.variables[${i}].unit`, false);
    if (!v.description) errors.push(`${where}.variables[${i}]: missing description`);
  });
}

for (const t of topics) {
  const n = formulas.filter((f) => f.topic === t.id).length;
  console.log(`Week ${t.week} ${t.title.padEnd(28)} ${String(n).padStart(4)} formulas`);
}
console.log(`Total ${formulas.length} formulas`);

if (errors.length) {
  console.error(`\n${errors.length} problem(s):`);
  errors.forEach((e) => console.error("  - " + e));
  process.exit(1);
}
console.log("All formulas valid.");
