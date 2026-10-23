import { OWNER, showable, groupByYear, languageCounts, safeUrl } from './repos.js';

const EMAIL = 'i.canoztozlu@protonmail.com';
// GitHub linguist colours for the languages I use; others fall back to grey.
const LANG_COLORS = {
  'C++': '#f34b7d', C: '#555555', QML: '#44a51c', JavaScript: '#f1e05a', TypeScript: '#3178c6',
  HTML: '#e34c26', CSS: '#663399', Shell: '#89e051', PHP: '#4F5D95', Vue: '#41b883',
  Java: '#b07219', Python: '#3572A5',
};
const color = (lang) => LANG_COLORS[lang] || '#9aa59d';
const month = (iso) => new Date(iso).toLocaleString('en', { month: 'short', timeZone: 'UTC' });

function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children.filter((c) => c != null));
  return node;
}

async function loadRepos() {
  try {
    const res = await fetch(`https://api.github.com/users/${OWNER}/repos?per_page=100`);
    if (!res.ok) throw new Error(res.status);
    return { repos: await res.json(), live: true };
  } catch {
    // Unauthenticated API allows 60 requests/hour per visitor; fall back to the bundled copy.
    return { repos: await (await fetch('assets/repos.json')).json(), live: false };
  }
}

function repoItem(r) {
  const live = safeUrl(r.homepage);
  const lang = r.language && el('span', { className: 'lang' }, el('i', { style: `--c:${color(r.language)}` }), r.language);
  const stars = r.stargazers_count > 0 && el('span', { title: `${r.stargazers_count} stars` }, `★ ${r.stargazers_count}`);
  return el('li', { className: 'repo' },
    el('time', { dateTime: r.created_at.slice(0, 10) }, month(r.created_at)),
    el('div', {},
      el('h3', {}, el('a', { href: r.html_url }, r.name)),
      r.description && el('p', {}, r.description),
      el('p', { className: 'meta' }, lang || null, stars || null, live && el('a', { href: live }, 'Live site')),
    ),
  );
}

function renderTimeline(repos) {
  const now = new Date().getUTCFullYear();
  const groups = groupByYear(repos, 2024, now);
  let seenFirst = false;
  const sections = groups.map(({ year, repos }) => {
    if (!repos.length) {
      return el('section', { className: 'era gap', ariaLabel: `${year}` },
        el('h2', { className: 'year' }, String(year)),
        el('p', { className: 'entries lede' }, 'No public repositories this year.'));
    }
    const cls = seenFirst ? 'light' : 'mid';
    seenFirst = true;
    return el('section', { className: `era ${cls}` },
      el('h2', { className: 'year' }, String(year)),
      el('ol', { className: 'entries repos' }, ...repos.map(repoItem)));
  });
  document.getElementById('timeline').replaceChildren(...sections);
}

function renderNow(repos, live) {
  const counts = languageCounts(repos);
  const total = counts.reduce((s, [, n]) => s + n, 0);
  document.getElementById('now-summary').textContent =
    `${repos.length} public projects on GitHub, by main language` + (live ? '.' : ' (saved snapshot, GitHub was unreachable).');
  document.getElementById('langbar').replaceChildren(
    ...counts.map(([lang, n]) => el('span', { style: `--c:${color(lang)};flex:${n}`, title: `${lang}: ${n}` })));
  document.getElementById('langs').replaceChildren(
    ...counts.map(([lang, n]) => el('li', {}, el('i', { style: `--c:${color(lang)}` }), `${lang} `, el('span', {}, `${Math.round((n / total) * 100)}%`))));
}

document.getElementById('contact').addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  const subject = `Hello from ${data.get('name').trim()}`;
  location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(data.get('message'))}`;
});

const { repos, live } = await loadRepos();
const list = showable(repos);
renderTimeline(list);
renderNow(list, live);
