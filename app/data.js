// LehrerApp – static sample data (with local persistence)
const APP_STORAGE_KEYS = {
  materials: 'lehrerapp-materials',
  events: 'lehrerapp-events',
  webuntisUrl: 'lehrerapp-webuntis-ical-url',
  rosters: 'lehrerapp-rosters',
  classes: 'lehrerapp-classes',
  user: 'lehrerapp-user',
};

function readLocalJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const seedData = {
  user: {
    name: "Alberto Cabrera",
    initials: "AC",
    email: "alberto.cabrera@esg.nrw.schule",
    school: "Gesamtschule am Stadtpark",
    subjects: ["Informatik", "Mathematik"],
    role: "Lehrer",
    claudeConnected: true,
  },

  classColors: [
    "oklch(0.52 0.18 250)",
    "oklch(0.52 0.18 290)",
    "oklch(0.52 0.18 20)",
    "oklch(0.52 0.18 155)",
    "oklch(0.55 0.18 60)",
    "oklch(0.52 0.18 195)",
    "oklch(0.52 0.18 320)",
    "oklch(0.58 0.14 30)",
    "oklch(0.62 0.12 95)",
    "oklch(0.58 0.10 235)",
    "oklch(0.60 0.11 15)",
    "oklch(0.62 0.09 180)",
  ],

  classes: [
    { id: 1, name: "5c KS", students: 28, subject: "Klassenleitung", colorIdx: 0, room: "R 204", year: 5 },
    { id: 2, name: "IPA",    students: 26, subject: "Informatik",    colorIdx: 1, room: "R 204", year: null },
    { id: 3, name: "WP7",   students: 32, subject: "Wahlpflicht",   colorIdx: 2, room: "R 105", year: 7  },
    { id: 4, name: "8B",    students: 23, subject: "Mathematik",    colorIdx: 3, room: "R 301", year: 8  },
    { id: 5, name: "R1 Q2", students: 19, subject: "Informatik",    colorIdx: 4, room: "R 204", year: 12 },
    { id: 6, name: "5c P1 SA", students: 28, subject: "Sport",      colorIdx: 5, room: "Sporthalle A", year: 5 },
    { id: 7, name: "SP Q1", students: 21, subject: "Sport",         colorIdx: 6, room: "Sporthalle B", year: 11 },
  ],

  events: {
    "2026-04-27": [
      { id: 1,  start: "08:00", end: "09:30", title: "5c KS", classId: 1, room: "R 204",       topic: "Tabellenkalkulation – Einführung",    type: "lesson" },
      { id: 2,  start: "09:45", end: "10:30", title: "Frühstückspause",                          type: "break"  },
      { id: 3,  start: "11:50", end: "13:20", title: "WP7",   classId: 3, room: "R 105",       topic: "Sortieralgorithmen",                 type: "lesson" },
      { id: 4,  start: "14:00", end: "14:45", title: "Mittagspause",                             type: "break"  },
    ],
    "2026-04-28": [
      { id: 10, start: "08:00", end: "09:30", title: "8B",    classId: 4, room: "R 301",       topic: "Quadratische Gleichungen",            type: "lesson" },
      { id: 11, start: "09:45", end: "10:30", title: "Frühstückspause",                          type: "break"  },
      { id: 12, start: "10:35", end: "12:05", title: "IPA",   classId: 2, room: "R 204",       topic: "IPA Vorbereitung",                   type: "lesson" },
      { id: 13, start: "13:15", end: "14:45", title: "R1 Q2", classId: 5, room: "R 204",       topic: "SQL Grundlagen",                     type: "lesson" },
      { id: 14, start: "14:45", end: "15:30", title: "Mittagspause",                             type: "break"  },
    ],
    "2026-04-29": [
      { id: 20, start: "08:00", end: "09:30", title: "5c KS", classId: 1, room: "R 204",       topic: "Präsentation Ergebnisse",            type: "lesson" },
      { id: 21, start: "09:45", end: "10:30", title: "Frühstückspause",                          type: "break"  },
      { id: 22, start: "11:00", end: "12:30", title: "SP Q1", classId: 7, room: "Sporthalle A",topic: "Basketball – Grundlagen",            type: "lesson" },
      { id: 23, start: "14:00", end: "14:45", title: "Mittagspause",                             type: "break"  },
    ],
    "2026-04-30": [
      { id: 30, start: "08:00", end: "09:30", title: "WP7",   classId: 3, room: "R 105",       topic: "Schulwebsite Projekt",               type: "lesson" },
      { id: 31, start: "09:45", end: "10:30", title: "Frühstückspause",                          type: "break"  },
      { id: 32, start: "10:35", end: "11:20", title: "Aufsicht",                                 type: "duty"   },
      { id: 33, start: "13:15", end: "14:45", title: "5c KS", classId: 1, room: "R 204",       topic: "Klassenrat",                         type: "lesson" },
    ],
    "2026-05-01": [],
    "2026-05-04": [
      { id: 40, start: "08:00", end: "09:30", title: "5c KS", classId: 1, room: "R 204",       topic: "Jahresabschluss Vorbereitung",       type: "lesson" },
      { id: 41, start: "10:35", end: "12:05", title: "8B",    classId: 4, room: "R 301",       topic: "Funktionen und Graphen",             type: "lesson" },
      { id: 42, start: "09:45", end: "10:30", title: "Frühstückspause",                          type: "break"  },
    ],
    "2026-05-05": [
      { id: 50, start: "08:00", end: "09:30", title: "IPA",   classId: 2, room: "R 204",       topic: "Abschlusspräsentation",              type: "lesson" },
      { id: 51, start: "09:45", end: "10:30", title: "Frühstückspause",                          type: "break"  },
      { id: 52, start: "11:00", end: "12:30", title: "WP7",   classId: 3, room: "R 105",       topic: "Webdesign Grundlagen",               type: "lesson" },
    ],
    "2026-05-06": [
      { id: 60, start: "08:00", end: "09:30", title: "R1 Q2", classId: 5, room: "R 204",       topic: "Datenbankdesign",                    type: "lesson" },
      { id: 61, start: "09:45", end: "10:30", title: "Frühstückspause",                          type: "break"  },
      { id: 62, start: "11:50", end: "13:20", title: "8B",    classId: 4, room: "R 301",       topic: "Geometrie Wiederholung",             type: "lesson" },
    ],
  },

  materials: [
    { id: 1, title: "Einführung in Algorithmen",           type: "Arbeitsblatt",  classId: 3, subject: "Informatik",   date: "2026-04-15", tags: ["Algorithmen", "Einführung"], size: "245 KB" },
    { id: 2, title: "Tabellenkalkulation – Grundübungen", type: "Arbeitsblatt",  classId: 1, subject: "Informatik",   date: "2026-04-10", tags: ["Excel", "Tabellen"],         size: "318 KB" },
    { id: 3, title: "Tafelbild: Quadratische Gleichungen",type: "Tafelbild",     classId: 4, subject: "Mathematik",   date: "2026-04-08", tags: ["Gleichungen", "Algebra"],    size: "128 KB" },
    { id: 4, title: "Elternbrief Klassenfahrt 5c",        type: "Elternbrief",   classId: 1, subject: null,           date: "2026-03-20", tags: ["Klassenfahrt"],              size: "54 KB"  },
    { id: 5, title: "Differenzierung: Datenbankabfragen", type: "Differenzierung",classId: 5, subject: "Informatik",  date: "2026-04-01", tags: ["SQL", "Datenbanken"],        size: "189 KB" },
    { id: 6, title: "Quiz-App WP7 Informatik",            type: "App",           classId: 3, subject: "Informatik",   date: "2026-03-15", tags: ["Quiz", "Gamification"],      size: "2.4 MB" },
    { id: 7, title: "Lineare Gleichungssysteme",          type: "Arbeitsblatt",  classId: 4, subject: "Mathematik",   date: "2026-03-28", tags: ["Gleichungen"],               size: "276 KB" },
    { id: 8, title: "Basketball – Regelkunde",            type: "Arbeitsblatt",  classId: 7, subject: "Sport",         date: "2026-03-10", tags: ["Basketball", "Regeln"],      size: "198 KB" },
  ],

  holidays: [
    // NRW (offizielle Ferienordnung Schulministerium NRW)
    { name: "Weihnachtsferien 2025/26", start: "2025-12-22", end: "2026-01-06" },
    { name: "Osterferien 2026",         start: "2026-03-30", end: "2026-04-11" },
    { name: "Pfingstferien 2026",       start: "2026-05-26", end: "2026-05-26" },
    { name: "Sommerferien 2026",        start: "2026-07-20", end: "2026-09-01" },
    { name: "Herbstferien 2026",        start: "2026-10-17", end: "2026-10-31" },
    { name: "Weihnachtsferien 2026/27", start: "2026-12-23", end: "2027-01-06" },
    { name: "Osterferien 2027",         start: "2027-03-22", end: "2027-04-03" },
    { name: "Pfingstferien 2027",       start: "2027-05-18", end: "2027-05-18" },
    { name: "Sommerferien 2027",        start: "2027-07-19", end: "2027-08-31" },
    { name: "Herbstferien 2027",        start: "2027-10-23", end: "2027-11-06" },
    { name: "Weihnachtsferien 2027/28", start: "2027-12-24", end: "2028-01-08" },
  ],

  sequenzplan: [
    { classId: 1, months: [
      { m: "Sep", topic: "Tabellenkalkulation I",     done: true  },
      { m: "Okt", topic: "Präsentationen",             done: true  },
      { m: "Nov", topic: "Internet & Sicherheit",      done: true  },
      { m: "Dez", topic: "Weihnachtsprojekt",          done: true  },
      { m: "Jan", topic: "Programmieren – Grundlagen", done: true  },
      { m: "Feb", topic: "Scratch",                    done: true  },
      { m: "Mär", topic: "HTML Grundlagen",            done: true  },
      { m: "Apr", topic: "Tabellenkalkulation II",     done: false, current: true },
      { m: "Mai", topic: "Jahresarbeit",               done: false },
      { m: "Jun", topic: "Jahresabschluss",            done: false },
    ]},
    { classId: 3, months: [
      { m: "Sep", topic: "Algorithmen",                done: true  },
      { m: "Okt", topic: "Sortieren & Suchen",         done: true  },
      { m: "Nov", topic: "Python Einführung",          done: true  },
      { m: "Dez", topic: "Projekt: Spiel",             done: true  },
      { m: "Jan", topic: "Datenstrukturen",            done: true  },
      { m: "Feb", topic: "Objektorientierung",         done: true  },
      { m: "Mär", topic: "Datenbanken",                done: true  },
      { m: "Apr", topic: "Sortieralgorithmen",         done: false, current: true },
      { m: "Mai", topic: "Webentwicklung",             done: false },
      { m: "Jun", topic: "Abschlussprojekte",          done: false },
    ]},
    { classId: 4, months: [
      { m: "Sep", topic: "Terme und Gleichungen",      done: true  },
      { m: "Okt", topic: "Lineare Gleichungen",        done: true  },
      { m: "Nov", topic: "Statistik",                  done: true  },
      { m: "Dez", topic: "Geometrie",                  done: true  },
      { m: "Jan", topic: "Lineare Funktionen",         done: true  },
      { m: "Feb", topic: "Gleichungssysteme",          done: true  },
      { m: "Mär", topic: "Quadratische Gleichungen",   done: true  },
      { m: "Apr", topic: "Quadr. Gleichungen II",      done: false, current: true },
      { m: "Mai", topic: "Wahrscheinlichkeit",         done: false },
      { m: "Jun", topic: "Jahresabschluss",            done: false },
    ]},
  ],
};

seedData.materials = readLocalJSON(APP_STORAGE_KEYS.materials, seedData.materials);
seedData.events = readLocalJSON(APP_STORAGE_KEYS.events, seedData.events);
seedData.rosters = readLocalJSON(APP_STORAGE_KEYS.rosters, {});
seedData.classes = readLocalJSON(APP_STORAGE_KEYS.classes, seedData.classes);
seedData.user = readLocalJSON(APP_STORAGE_KEYS.user, seedData.user);
seedData.user.email = "alberto.cabrera@esg.nrw.schule";

window.AppData = seedData;

window.LocalStore = {
  saveMaterials(materials) {
    writeLocalJSON(APP_STORAGE_KEYS.materials, materials);
  },
  addMaterial(material) {
    window.AppData.materials = [material, ...window.AppData.materials];
    writeLocalJSON(APP_STORAGE_KEYS.materials, window.AppData.materials);
  },
  saveEvents(events) {
    window.AppData.events = events;
    writeLocalJSON(APP_STORAGE_KEYS.events, events);
  },
  addEvent(dateKey, event) {
    if (!window.AppData.events[dateKey]) window.AppData.events[dateKey] = [];
    window.AppData.events[dateKey].push(event);
    writeLocalJSON(APP_STORAGE_KEYS.events, window.AppData.events);
  },
  removeEvent(dateKey, eventId) {
    if (!window.AppData.events[dateKey]) return;
    window.AppData.events[dateKey] = window.AppData.events[dateKey].filter(e => e.id !== eventId);
    writeLocalJSON(APP_STORAGE_KEYS.events, window.AppData.events);
  },
  removeEventById(eventId) {
    Object.keys(window.AppData.events).forEach(k => {
      window.AppData.events[k] = (window.AppData.events[k] || []).filter(e => e.id !== eventId);
    });
    writeLocalJSON(APP_STORAGE_KEYS.events, window.AppData.events);
  },
  nextEventId() {
    const all = Object.values(window.AppData.events).flat();
    return Math.max(0, ...all.map(e => e.id || 0)) + 1;
  },
  saveWebUntisUrl(url) {
    localStorage.setItem(APP_STORAGE_KEYS.webuntisUrl, url);
  },
  loadWebUntisUrl() {
    return localStorage.getItem(APP_STORAGE_KEYS.webuntisUrl) || '';
  },
  saveRosters(rosters) {
    window.AppData.rosters = rosters;
    writeLocalJSON(APP_STORAGE_KEYS.rosters, rosters);
  },
  getRoster(classId) {
    const raw = window.AppData.rosters[String(classId)] || [];
    return raw.map((s, idx) => {
      if (typeof s === 'string') {
      return {
        id: Date.now() + idx,
        familienname: s,
        vorname: '',
        klasse: '',
        spitzname: '',
        geschlecht: '',
        besonderheiten: '',
      };
      }
      return s;
    });
  },
  addStudent(classId, studentName) {
    const k = String(classId);
    if (!window.AppData.rosters[k]) window.AppData.rosters[k] = [];
    const clean = (studentName || '').trim();
    if (!clean) return false;
    window.AppData.rosters[k].push({ id: Date.now() + Math.random(), name: clean });
    const cls = window.AppData.classes.find(c => c.id === classId);
    if (cls) cls.students = window.AppData.rosters[k].length;
    writeLocalJSON(APP_STORAGE_KEYS.rosters, window.AppData.rosters);
    return true;
  },
  addStudentRecord(classId, record) {
    const k = String(classId);
    if (!window.AppData.rosters[k]) window.AppData.rosters[k] = [];
    window.AppData.rosters[k].push({ id: Date.now() + Math.random(), ...record });
    const cls = window.AppData.classes.find(c => c.id === classId);
    if (cls) cls.students = window.AppData.rosters[k].length;
    writeLocalJSON(APP_STORAGE_KEYS.rosters, window.AppData.rosters);
    return true;
  },
  importStudents(classId, names) {
    const k = String(classId);
    const clean = (names || []).map(n => (n || '').trim()).filter(Boolean);
    window.AppData.rosters[k] = clean.map((name, i) => ({ id: Date.now() + i, name }));
    const cls = window.AppData.classes.find(c => c.id === classId);
    if (cls) cls.students = clean.length;
    writeLocalJSON(APP_STORAGE_KEYS.rosters, window.AppData.rosters);
    return clean.length;
  },
  importStudentRecords(classId, records) {
    const k = String(classId);
    const clean = (records || []).filter(Boolean).map((r, i) => ({
      id: Date.now() + i,
      familienname: (r.familienname || '').trim(),
      vorname: (r.vorname || '').trim(),
      klasse: (r.klasse || '').trim(),
      spitzname: (r.spitzname || '').trim(),
      geschlecht: (r.geschlecht || '').trim(),
      besonderheiten: (r.besonderheiten || '').trim(),
    })).filter(r => r.familienname || r.vorname);
    window.AppData.rosters[k] = clean;
    const cls = window.AppData.classes.find(c => c.id === classId);
    if (cls) cls.students = clean.length;
    writeLocalJSON(APP_STORAGE_KEYS.rosters, window.AppData.rosters);
    return clean.length;
  },
  updateStudentRecord(classId, studentId, patch) {
    const k = String(classId);
    const list = window.AppData.rosters[k] || [];
    window.AppData.rosters[k] = list.map(s => s.id === studentId ? { ...s, ...patch } : s);
    writeLocalJSON(APP_STORAGE_KEYS.rosters, window.AppData.rosters);
  },
  deleteStudentRecord(classId, studentId) {
    const k = String(classId);
    const list = window.AppData.rosters[k] || [];
    window.AppData.rosters[k] = list.filter(s => s.id !== studentId);
    const cls = window.AppData.classes.find(c => c.id === classId);
    if (cls) cls.students = window.AppData.rosters[k].length;
    writeLocalJSON(APP_STORAGE_KEYS.rosters, window.AppData.rosters);
  },
  saveClasses(classes) {
    window.AppData.classes = classes;
    writeLocalJSON(APP_STORAGE_KEYS.classes, classes);
  },
  getClasses() {
    return Array.isArray(window.AppData.classes) ? window.AppData.classes : [];
  },
  addClass(newClass) {
    const nextId = Math.max(0, ...window.AppData.classes.map(c => c.id || 0)) + 1;
    const classObj = { ...newClass, id: nextId };
    window.AppData.classes.push(classObj);
    writeLocalJSON(APP_STORAGE_KEYS.classes, window.AppData.classes);
    return classObj;
  },
  deleteClass(classId) {
    window.AppData.classes = window.AppData.classes.filter(c => c.id !== classId);
    Object.keys(window.AppData.events).forEach(k => {
      window.AppData.events[k] = (window.AppData.events[k] || []).filter(e => e.classId !== classId);
    });
    window.AppData.materials = window.AppData.materials.filter(m => m.classId !== classId);
    delete window.AppData.rosters[String(classId)];
    writeLocalJSON(APP_STORAGE_KEYS.classes, window.AppData.classes);
    writeLocalJSON(APP_STORAGE_KEYS.events, window.AppData.events);
    writeLocalJSON(APP_STORAGE_KEYS.materials, window.AppData.materials);
    writeLocalJSON(APP_STORAGE_KEYS.rosters, window.AppData.rosters);
  },
  saveUser(user) {
    window.AppData.user = { ...window.AppData.user, ...user };
    writeLocalJSON(APP_STORAGE_KEYS.user, window.AppData.user);
  },
};
