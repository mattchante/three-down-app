const SUFFIXES = new Set(["Jr.", "Jr", "II", "III", "IV", "Sr.", "Sr"]);

export function splitPlayerName(fullName: string): { first: string; last: string } {
  const parts = fullName.split(" ");
  if (parts.length === 1) return { first: parts[0], last: "" };
  if (parts.length >= 3 && (parts[parts.length - 2] === "St." || parts[parts.length - 2] === "St")) {
    return {
      first: parts.slice(0, -2).join(" "),
      last: parts.slice(-2).join(" "),
    };
  }
  if (SUFFIXES.has(parts[parts.length - 1])) {
    return {
      first: parts[0],
      last: parts.slice(1).join(" "),
    };
  }
  return {
    first: parts[0],
    last: parts.slice(1).join(" "),
  };
}
