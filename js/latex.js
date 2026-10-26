// Display formulas are rendered inline with \displaystyle so KaTeX can wrap long ones at
// relations/operators. \allowbreak is added after variant separators ("a; \qquad b", "a,\ b")
// and before parenthetical labels so lists of cases can wrap on narrow tiles.
window.wrappableFormula = function (src) {
  const breakable = src
    .replace(/\\qquad(?![a-zA-Z])/g, "\\qquad\\allowbreak ")
    .replace(/([,;])\s*\\(quad(?![a-zA-Z])|[ ;,])/g, "$1\\$2\\allowbreak ")
    .replace(/\\([ ;])(\s*\\text\{\()/g, "\\allowbreak\\$1$2");
  return "\\displaystyle " + breakable;
};
