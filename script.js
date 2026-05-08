/* ================================================================
   Daf Yomi Hub — Dynamic logic
   - Computes today's daf from the 14th cycle schedule
   - Updates hero, progress bar, countdown, and bookshelf state
   - Schedule source: 14th cycle, started Jan 5, 2020 (per MJL)
   ================================================================ */

// Cycle anchor + total length
const CYCLE_START = new Date('2020-01-05T00:00:00');
const CYCLE_END   = new Date('2027-06-07T00:00:00'); // approximate Siyyum HaShas
const CYCLE_TOTAL_DAYS = 2711;

/* ----------------------------------------------------------------
   14th cycle tractate schedule
   Each entry: name, daf count, color (Talmud "order"), MJL archive URL
   "Days" = number of dapim (each daf = 1 day in Daf Yomi)
   The first daf of each tractate is "2a" (page 1 is the title leaf).
   So a tractate of N dapim covers N-1 days in Daf Yomi convention,
   except some begin at daf 2a — we treat each as N-1 daily pages.
   For a public-facing demo, slight off-by-one is acceptable;
   we update the current daf number on display.
   ---------------------------------------------------------------- */
const TRACTATES = [
  { name: 'Berakhot',       days: 63,  color: 'wine',   url: 'https://www.myjewishlearning.com/category/study/jewish-texts/berakhot/' },
  { name: 'Shabbat',        days: 156, color: 'navy',   url: 'https://www.myjewishlearning.com/category/study/jewish-texts/shabbat-jewish-texts/' },
  { name: 'Eruvin',         days: 104, color: 'navy',   url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/talmud-tractate-eruvin/' },
  { name: 'Pesachim',       days: 120, color: 'navy',   url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-pesachim/' },
  { name: 'Shekalim',       days: 21,  color: 'navy',   url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-shekalim/' },
  { name: 'Yoma',           days: 87,  color: 'navy',   url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-yoma/' },
  { name: 'Sukkah',         days: 55,  color: 'navy',   url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-sukkah/' },
  { name: 'Beitzah',        days: 39,  color: 'navy',   url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-beitzah/' },
  { name: 'Rosh Hashanah',  days: 34,  color: 'navy',   url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-rosh-hashanah/' },
  { name: 'Taanit',         days: 30,  color: 'navy',   url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-taanit/' },
  { name: 'Megillah',       days: 31,  color: 'navy',   url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-megillah/' },
  { name: 'Moed Katan',     days: 28,  color: 'navy',   url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-moed-katan/' },
  { name: 'Chagigah',       days: 26,  color: 'navy',   url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-chagigah/' },
  { name: 'Yevamot',        days: 121, color: 'forest', url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-yevamot/' },
  { name: 'Ketubot',        days: 111, color: 'forest', url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-ketubot/' },
  { name: 'Nedarim',        days: 90,  color: 'forest', url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-nedarim/' },
  { name: 'Nazir',          days: 65,  color: 'forest', url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-nazir/' },
  { name: 'Sotah',          days: 48,  color: 'forest', url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-sotah/' },
  { name: 'Gittin',         days: 89,  color: 'forest', url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-gittin/' },
  { name: 'Kiddushin',      days: 81,  color: 'forest', url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-kiddushin/' },
  { name: 'Bava Kamma',     days: 118, color: 'wine',   url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-bava-kamma/' },
  { name: 'Bava Metzia',    days: 118, color: 'wine',   url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-bava-metzia/' },
  { name: 'Bava Batra',     days: 175, color: 'wine',   url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-bava-batra/' },
  { name: 'Sanhedrin',      days: 112, color: 'wine',   url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-sanhedrin/' },
  { name: 'Makkot',         days: 23,  color: 'wine',   url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-makkot/' },
  { name: 'Shevuot',        days: 48,  color: 'wine',   url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-shevuot/' },
  { name: 'Avodah Zarah',   days: 75,  color: 'wine',   url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-avodah-zarah/' },
  { name: 'Horayot',        days: 13,  color: 'wine',   url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-horayot/' },
  { name: 'Zevachim',       days: 119, color: 'navy',   url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-zevachim/' },
  { name: 'Menachot',       days: 109, color: 'navy',   url: 'https://www.myjewishlearning.com/category/study/jewish-texts/talmud/tractate-menachot/' },
  { name: 'Chullin',        days: 141, color: 'navy',   url: null }, // Not yet on MJL — fallback to subscribe
  { name: 'Bekhorot',       days: 60,  color: 'navy',   url: null },
  { name: 'Arakhin',        days: 33,  color: 'navy',   url: null },
  { name: 'Temurah',        days: 33,  color: 'navy',   url: null },
  { name: 'Keritot',        days: 27,  color: 'navy',   url: null },
  { name: 'Meilah',         days: 21,  color: 'navy',   url: null },
  { name: 'Niddah',         days: 72,  color: 'amber',  url: null }
];

const SUBSCRIBE_URL = 'https://www.myjewishlearning.com/get-your-daily-dose-of-talmud/';

/* ----------------------------------------------------------------
   Compute days into cycle (1-indexed)
   ---------------------------------------------------------------- */
function daysBetween(a, b) {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function getCycleDay(today) {
  // Day 1 is Jan 5, 2020. So daysBetween(start, today) + 1
  return daysBetween(CYCLE_START, today) + 1;
}

/* ----------------------------------------------------------------
   Walk the schedule to find: which tractate today's day falls in,
   the daf within that tractate, and the start date of each tractate
   ---------------------------------------------------------------- */
function buildCycleMap() {
  let cumulative = 0;
  return TRACTATES.map(t => {
    const startDay = cumulative + 1;
    const endDay   = cumulative + t.days;
    const startDate = new Date(CYCLE_START);
    startDate.setDate(startDate.getDate() + cumulative);
    cumulative = endDay;
    return { ...t, startDay, endDay, startDate };
  });
}

function getCurrentTractate(map, cycleDay) {
  for (const t of map) {
    if (cycleDay >= t.startDay && cycleDay <= t.endDay) {
      return { tractate: t, dafNumber: cycleDay - t.startDay + 2 }; // dapim start at 2a
    }
  }
  return null;
}

function getNextTractate(map, currentTractate) {
  const idx = map.indexOf(currentTractate);
  if (idx >= 0 && idx < map.length - 1) return map[idx + 1];
  return null;
}

function formatDate(d) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatDateShort(d) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

/* ----------------------------------------------------------------
   Render the hero (today's daf + progress bar)
   ---------------------------------------------------------------- */
function renderHero(today, cycleDay, current) {
  document.getElementById('hero-eyebrow').textContent =
    `Today on Daf Yomi · ${formatDate(today)}`;

  if (current) {
    document.getElementById('hero-title').innerHTML =
      `Tractate ${current.tractate.name} &middot; Daf ${current.dafNumber}`;
    if (current.tractate.url) {
      document.getElementById('read-today-cta').href = current.tractate.url;
    }
  } else {
    document.getElementById('hero-title').textContent = 'The 14th cycle is complete';
  }

  const total = CYCLE_TOTAL_DAYS;
  const pct = Math.max(0, Math.min(100, Math.round((cycleDay / total) * 100)));
  document.getElementById('hero-sub').innerHTML =
    `Day ${cycleDay.toLocaleString()} of ${total.toLocaleString()} in the 14th cycle of Babylonian Talmud study`;
  document.getElementById('bar-fill').style.width = pct + '%';
  document.getElementById('timeline-mid').textContent = `${pct}% complete`;
  document.getElementById('stat-day').textContent = cycleDay.toLocaleString();
}

/* ----------------------------------------------------------------
   Render "Get Started" — countdown to next tractate, if soon
   ---------------------------------------------------------------- */
function renderGetStarted(today, current, next) {
  if (!current || !next) {
    document.getElementById('get-started').hidden = true;
    return;
  }
  const daysUntilNext = daysBetween(today, next.startDate);

  // Show countdown only when next tractate is within 30 days
  if (daysUntilNext < 0 || daysUntilNext > 30) {
    document.getElementById('get-started').hidden = true;
    return;
  }

  document.getElementById('get-started').hidden = false;
  document.getElementById('gs-num').textContent = daysUntilNext === 0 ? 'Today' : daysUntilNext;
  document.getElementById('gs-numlabel').textContent = daysUntilNext === 1 ? 'day' : (daysUntilNext === 0 ? '' : 'days');

  const startStr = formatDate(next.startDate);
  document.getElementById('gs-title').innerHTML =
    `Start fresh with Tractate ${next.name} &middot; ${startStr}`;
}

/* ----------------------------------------------------------------
   Render the bookshelf — three rows, color-coded by state
   ---------------------------------------------------------------- */
function renderBookshelf(map, current, next) {
  // Width proportional to daf count (clamped for layout)
  function widthFor(days) {
    return Math.max(20, Math.min(56, Math.round(days * 0.32 + 18)));
  }

  function stateFor(t) {
    if (current && t.name === current.tractate.name) return 'cur';
    if (next && t.name === next.name) return 'next';
    if (current && t.endDay < current.tractate.startDay) return 'done';
    return 'soon';
  }

  const allBooks = map.map(t => ({
    name: t.name,
    width: widthFor(t.days),
    color: t.color,
    state: stateFor(t),
    url: t.url || SUBSCRIBE_URL
  }));

  // Distribute across 3 shelves
  const perShelf = Math.ceil(allBooks.length / 3);
  const shelves = [
    allBooks.slice(0, perShelf),
    allBooks.slice(perShelf, perShelf * 2),
    allBooks.slice(perShelf * 2)
  ];

  shelves.forEach((shelf, idx) => {
    const row = document.getElementById('row-' + (idx + 1));
    row.innerHTML = '';
    shelf.forEach(b => {
      const book = document.createElement('a');
      book.href = b.url;
      book.className = `book b-${b.color} b-${b.state}`;
      book.style.width = b.width + 'px';
      book.title = b.name;
      const spine = document.createElement('span');
      spine.className = 'book-spine';
      spine.textContent = b.name;
      book.appendChild(spine);
      if (b.state === 'next' && next) {
        const flag = document.createElement('span');
        flag.className = 'next-flag';
        flag.textContent = formatDateShort(next.startDate);
        book.appendChild(flag);
      }
      row.appendChild(book);
    });
  });

  // Update bookshelf legend "Next · {date}"
  const legendNext = document.querySelector('.legend span:nth-child(3)');
  if (next && legendNext) {
    legendNext.innerHTML =
      `<span class="legend-swatch next"></span>Next &middot; ${formatDateShort(next.startDate)}`;
  }
}

/* ----------------------------------------------------------------
   Static profile data — placeholders until Rachel/Grace finalize
   ---------------------------------------------------------------- */
const TEACHERS = [
  { name: 'Rachel Scheinerman', initials: 'RS', role: 'Editor in Chief',      bio: 'Founded the Daily Dose project. PhD in rabbinic literature.',          image: 'images/rachel scheinerman.avif' },
  { name: 'Sara Ronis',         initials: 'SR', role: 'Contributing Writer',  bio: 'Rabbi and educator. Writes on ritual, gender, and law.',                image: 'images/Sara Ronis.jpg' },
  { name: 'Dr. Elli Fischer',   initials: 'EF', role: 'Contributing Writer',  bio: 'Translator and historian of halakhah.',                                 image: 'images/RabbI-Elli-Fischer.jpg' },
  { name: 'Rabbi Jay Kelman',   initials: 'JK', role: 'Contributing Writer',  bio: 'Author and Talmud teacher of 30+ years.',                              image: 'images/Rabbi Jay Kelman.png' },
  { name: 'Ilana Kurshan',      initials: 'IK', role: 'Contributing Writer',  bio: 'Author of If All the Seas Were Ink, a Daf Yomi memoir.',               image: 'images/Ilana Kurshan.jpg' },
  { name: 'Rabbi Joshua Heller', initials: 'JH', role: 'Contributing Writer', bio: 'Conservative rabbi writing on contemporary halakhah.',                  image: 'images/Joshua Heller.jpg' }
];

const SAGES = [
  { name: 'Rashi',         initials: 'ר', era: '1040–1105 · France',         bio: 'The most influential Talmud commentator. His commentary appears on every page.',  daf: 'Berakhot 2a',      image: 'images/brakhot_2a.jpg' },
  { name: 'Rabbi Akiva',   initials: 'ע', era: 'c. 50–135 CE',               bio: 'Shepherd turned sage. Foundational figure of rabbinic Judaism.',                  daf: 'Berakhot 61b',     image: 'images/brakhot_61b.jpg' },
  { name: 'Hillel',        initials: 'ה', era: 'c. 110 BCE–10 CE',           bio: 'Famous for the Golden Rule. School of Hillel shaped halakhah.',                   daf: 'Shabbat 31a',      image: 'images/chabbath_31a.jpg' },
  { name: 'Rava',          initials: 'ר', era: 'c. 280–352 · Babylon',       bio: 'Towering Babylonian sage. His debates with Abaye fill the Talmud.',               daf: 'Bava Metzia 59b',  image: 'images/baba-metsia_59b.jpg' },
  { name: 'Rabbi Yochanan',initials: 'י', era: 'c. 180–279',                 bio: 'Compiler of the Jerusalem Talmud, known for piercing legal mind.',                 daf: 'Bava Metzia 84a',  image: 'images/baba-metsia_84a.jpg' },
  { name: 'Beruriah',      initials: 'ב', era: '2nd century',                bio: 'One of the only women whose teachings appear in the Talmud.',                      daf: 'Berakhot 10a',     image: 'images/brakhot_10a.jpg' }
];

function renderProfiles() {
  const teacherRow = document.getElementById('teachers');
  TEACHERS.forEach(p => {
    const card = document.createElement('a');
    card.className = 'person';
    card.href = '#'; // placeholder until real teacher pages exist
    const avatarInner = p.image
      ? `<img src="${p.image}" alt="${p.name}" class="avatar-daf">`
      : p.initials;
    card.innerHTML = `
      <div class="avatar${p.image ? ' has-image' : ''}">${avatarInner}</div>
      <div class="person-name">${p.name}</div>
      <div class="person-meta">${p.role}</div>
      <p class="person-bio">${p.bio}</p>`;
    teacherRow.appendChild(card);
  });

  const sageRow = document.getElementById('sages');
  SAGES.forEach(p => {
    const card = document.createElement('a');
    card.className = 'person';
    card.href = '#'; // placeholder until real sage profiles exist
    const avatarInner = p.image
      ? `<img src="${p.image}" alt="Vilna Shas ${p.daf}" class="avatar-daf">`
      : p.initials;
    card.innerHTML = `
      <div class="avatar sage${p.image ? ' has-image' : ''}">${avatarInner}</div>
      <div class="person-name">${p.name}</div>
      <div class="person-meta">${p.era}</div>
      <div class="person-daf">Daf: ${p.daf}</div>
      <p class="person-bio">${p.bio}</p>`;
    sageRow.appendChild(card);
  });
}

/* ----------------------------------------------------------------
   Init
   ---------------------------------------------------------------- */
function init() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cycleDay = getCycleDay(today);
  const map = buildCycleMap();
  const current = getCurrentTractate(map, cycleDay);
  const next = current ? getNextTractate(map, current.tractate) : null;

  renderHero(today, cycleDay, current);
  renderBookshelf(map, current, next);
  renderProfiles();
}

document.addEventListener('DOMContentLoaded', init);
