export const OWNER = 'Contraill';
// This repo is the 2023 entry itself; the profile README repo isn't a project.
const SKIP = new Set([OWNER.toLowerCase(), 'programming-adventure']);

export const showable = (repos) =>
  repos.filter((r) => !r.fork && !r.archived && !SKIP.has(r.name.toLowerCase()));

// Every year in [from, to] appears, empty ones included, so gaps stay visible.
export function groupByYear(repos, from, to) {
  const years = [];
  for (let y = from; y <= to; y++) years.push({ year: y, repos: [] });
  for (const r of repos) {
    const y = new Date(r.created_at).getUTCFullYear();
    if (y >= from && y <= to) years[y - from].repos.push(r);
  }
  for (const g of years) g.repos.sort((a, b) => a.created_at.localeCompare(b.created_at));
  return years;
}

export function languageCounts(repos) {
  const counts = new Map();
  for (const r of repos) if (r.language) counts.set(r.language, (counts.get(r.language) || 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]);
}

export const safeUrl = (u) => (/^https?:\/\//i.test(u || '') ? u : null);
