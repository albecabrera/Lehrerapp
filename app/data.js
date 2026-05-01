// LehrerApp – static sample data
window.AppData = {
  user: {
    name: "Alberto Cabrera",
    initials: "AC",
    email: "a.cabrera@schule.de",
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
    { name: "Sommerferien",      start: "2026-07-13", end: "2026-08-25" },
    { name: "Herbstferien",      start: "2026-10-12", end: "2026-10-23" },
    { name: "Weihnachtsferien",  start: "2026-12-23", end: "2027-01-06" },
    { name: "Osterferien 2027",  start: "2027-04-07", end: "2027-04-18" },
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
