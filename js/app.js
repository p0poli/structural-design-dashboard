(function () {
  "use strict";

  const topics = window.TOPICS;
  const formulas = window.FORMULAS;
  const tabsEl = document.getElementById("tabs");
  const contentEl = document.getElementById("content");

  function tex(src) {
    const span = document.createElement("span");
    katex.render(src, span, { throwOnError: false, strict: false });
    return span;
  }

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function buildTile(f) {
    const tile = el("article", "tile");
    tile.id = f.id;
    tile.appendChild(el("h3", "tile-name", f.name));

    const formula = el("div", "tile-formula");
    formula.appendChild(tex(window.wrappableFormula(f.latex)));
    tile.appendChild(formula);

    if (f.variables && f.variables.length) {
      const table = el("table", "vars");
      const head = table.createTHead().insertRow();
      ["Symbol", "Meaning", "Unit"].forEach((h) => head.appendChild(el("th", null, h)));
      const body = table.createTBody();
      f.variables.forEach((v) => {
        const row = body.insertRow();
        row.insertCell().appendChild(tex(v.symbol));
        row.insertCell().textContent = v.description;
        row.insertCell().appendChild(tex(v.unit));
      });
      tile.appendChild(table);
    }

    if (f.notes) tile.appendChild(el("p", "tile-notes", f.notes));
    return tile;
  }

  function renderTopic(topicId) {
    const topic = topics.find((t) => t.id === topicId) || topics[0];
    document.documentElement.dataset.topic = topic.id;

    tabsEl.querySelectorAll("[role=tab]").forEach((tab) => {
      const active = tab.dataset.topic === topic.id;
      tab.setAttribute("aria-selected", active);
      tab.tabIndex = active ? 0 : -1;
      if (active) tabsEl.scrollLeft = tab.offsetLeft - tabsEl.offsetLeft - (tabsEl.clientWidth - tab.offsetWidth) / 2;
    });

    contentEl.replaceChildren();
    const items = formulas.filter((f) => f.topic === topic.id);

    const intro = el("div", "topic-intro");
    intro.appendChild(el("h2", null, `Week ${topic.week} — ${topic.title}`));
    intro.appendChild(el("p", "count", `${items.length} formulas`));
    contentEl.appendChild(intro);

    // Group by subtopic, preserving first-appearance order from the data file.
    const groups = new Map();
    items.forEach((f) => {
      if (!groups.has(f.subtopic)) groups.set(f.subtopic, []);
      groups.get(f.subtopic).push(f);
    });

    groups.forEach((list, name) => {
      const section = el("section", "subtopic");
      section.appendChild(el("h2", "subtopic-title", name));
      const grid = el("div", "grid");
      list.forEach((f) => grid.appendChild(buildTile(f)));
      section.appendChild(grid);
      contentEl.appendChild(section);
    });
  }

  topics.forEach((t) => {
    const tab = el("a", "tab");
    tab.href = `#${t.id}`;
    tab.dataset.topic = t.id;
    tab.setAttribute("role", "tab");
    tab.appendChild(el("span", "tab-week", `Week ${t.week}`));
    tab.appendChild(el("span", "tab-title", t.title));
    tabsEl.appendChild(tab);
  });

  function fromHash() {
    renderTopic(location.hash.slice(1));
  }
  window.addEventListener("hashchange", () => {
    fromHash();
    window.scrollTo(0, 0);
  });
  fromHash();
})();
