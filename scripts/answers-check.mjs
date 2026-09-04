function normalizeCollege(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[.',]/g, "")
    .replace(/\s+/g, " ")
    .replace(/^the\s+/, "")
    .replace(/^(university of|univ of|u of|college of)\s+/, "")
    .replace(/\s+(university|univ|college)$/, "")
    .trim();
}

function parseJerseyNumber(input) {
  const trimmed = input.trim();
  if (!/^\d{1,2}$/.test(trimmed)) return null;
  return Number.parseInt(trimmed, 10);
}

function parseDraftYear(input) {
  const trimmed = input.trim();
  if (!/^\d{4}$/.test(trimmed)) return null;
  return Number.parseInt(trimmed, 10);
}

function matches(input, accepted) {
  const normalized = normalizeCollege(input);
  return accepted.some((alias) => normalizeCollege(alias) === normalized);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(parseJerseyNumber("08") === 8, "08 -> 8");
assert(parseJerseyNumber("8") === 8, "8 -> 8");
assert(parseJerseyNumber(" 18 ") === 18, "trim jersey");
assert(parseJerseyNumber("eighteen") === null, "reject jersey text");
assert(parseJerseyNumber("180") === null, "reject 3-digit jersey");
assert(parseDraftYear("2020") === 2020, "year");
assert(parseDraftYear("20") === null, "reject short year");
assert(parseDraftYear(" 2018 ") === 2018, "trim year");

const lsu = ["LSU", "Louisiana State", "Louisiana State University"];
assert(matches("lsu", lsu), "lsu");
assert(matches("Louisiana State", lsu), "louisiana state");
assert(matches("Louisiana State University", lsu), "lsu long");
assert(matches("alabama", lsu) === false, "reject wrong college");

const usc = ["USC", "Southern California", "Southern Cal", "University of Southern California"];
assert(matches("usc", usc), "usc");
assert(matches("Southern California", usc), "southern cal");
assert(matches("University of Southern California", usc), "usc long");

const oleMiss = ["Ole Miss", "Mississippi", "University of Mississippi"];
assert(matches("ole miss", oleMiss), "ole miss");
assert(matches("Mississippi", oleMiss), "mississippi");
assert(matches("University of Mississippi", oleMiss), "ole miss long");

const georgia = ["Georgia", "University of Georgia", "UGA"];
assert(matches("University of Georgia", georgia), "uga phrasing");
assert(matches("uga", georgia), "uga");
assert(matches("Georgia Tech", georgia) === false, "do not accept Georgia Tech for Georgia");

console.log("answers ok");
