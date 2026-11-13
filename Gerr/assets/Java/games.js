const DEFAULT_BG = "assets/Foto/Logo.jpeg";

const MENUS = [
  {
    id: "history",
    title: "History",
    tagline: "Lihat History anda",
    letter: "H",
  },
  {
    id: "favorit",
    title: "Favorit",
    tagline: "Game Favorit anda",
    letter: "F",
  },
];

const DEFAULT_GAMES = [
  {
    id: "last-dance",
    title: "Last Dance",
    tagline: "Berdansalah dengan indah",
    url: "assets/LastDance%20Web/index.html",
    icon: "assets/Foto/Logo%20LD.jpeg",
    bg: "assets/Foto/LastDanceBG.jpeg",
    color: ["#e8f3fb", "#ffffff"],
  },
  {
    id: "game-dua",
    title: "Game Dua",
    tagline: "COMING SOON",
    url: null,
    bg: "assets/Foto/BGclair.jpeg",
    letter: "B",
    color: ["#3da5ff", "#3da5ff"],
  },
  {
    id: "game-tiga",
    title: "Game Tiga",
    tagline: "COMING SOON",
    url: null,
    bg: "assets/Foto/BGdevil.jpg",
    letter: "C",
    color: ["#3da5ff", "#3da5ff"],
  },
  {
    id: "game-empat",
    title: "Game Empat",
    tagline: "COMING SOON",
    url: null,
    bg: "assets/Foto/BGgodofwar.jpg",
    letter: "D",
    color: ["#3da5ff", "#3da5ff"],
  },
  {
    id: "game-lima",
    title: "Game Lima",
    tagline: "COMING SOON",
    url: null,
    bg: "assets/Foto/BGsekiro.jpg",
    letter: "E",
    color: ["#3da5ff", "#3da5ff"],
  },
];

const GAMES_KEY = "gerr:games-config";
const ROLE_KEY = "gerr:role";

(function () {
  if (!sessionStorage.getItem(ROLE_KEY)) {
    location.replace("login.html");
  }
})();

const ALL_GAMES = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem(GAMES_KEY));
    if (Array.isArray(saved)) return saved;
  } catch (e) {}
  return DEFAULT_GAMES.map((g) => ({ ...g, show: true }));
})();
const GAMES = ALL_GAMES;
const HOME_GAMES = ALL_GAMES.filter((g) => g.show !== false);
