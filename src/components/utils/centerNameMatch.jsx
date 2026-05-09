// Shared utility to robustly match health center names across the app.
// Handles: extra/double spaces, leading/trailing whitespace,
// Arabic letter variants (أإآ→ا, ة→ه, ى→ي), and common prefixes.

export const normalizeCenterName = (name) => {
  if (!name) return '';
  return String(name)
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

// Strip common prefixes ("مركز صحي", "مركز") for fuzzy comparison.
export const stripCenterPrefix = (name) => {
  return normalizeCenterName(name)
    .replace(/^مركز\s*صحي\s*/, '')
    .replace(/^مركز\s*/, '')
    .trim();
};

// True when an employee's center name matches the target center name,
// tolerant to spacing and letter variants.
export const isSameCenter = (a, b) => {
  if (!a || !b) return false;
  const na = normalizeCenterName(a);
  const nb = normalizeCenterName(b);
  if (na === nb) return true;
  return stripCenterPrefix(a) === stripCenterPrefix(b);
};