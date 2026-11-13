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
    letter: "\u2665",
  },
];

const DEFAULT_GAMES = [
  {
    id: "last-dance",
    title: "Last Dance",
    tagline: "Berdansalah dengan indah",
    url: "assets/LastDance%20Web/index.html",
    icon: "assets/Foto/IconGame/Logo%20LD.png",
    bg: "assets/Foto/BGgame/LastDanceBG.jpeg",
    color: ["#e8f3fb", "#ffffff"],
  },
  {
    id: "game-dua",
    title: "Game Dua",
    tagline: "COMING SOON",
    url: null,
    icon: "assets/Foto/IconGame/djkpcyr-64df8104-6604-4744-aa66-add660aa728d.png",
    bg: "assets/Foto/BGgame/BGclair.jpeg",
    color: ["#000000", "#000000"],
  },
  {
    id: "game-tiga",
    title: "Game Tiga",
    tagline: "COMING SOON",
    url: null,
    icon: "assets/Foto/IconGame/DMC5_logo.webp",
    bg: "assets/Foto/BGgame/BGdevil.jpg",
    color: ["#000000", "#000000"],
  },
  {
    id: "game-empat",
    title: "Game Empat",
    tagline: "COMING SOON",
    url: null,
    icon: "assets/Foto/IconGame/ragnarok-1600291665.png",
    bg: "assets/Foto/BGgame/BGgodofwar.jpg",
    color: ["#000000", "#000000"],
  },
  {
    id: "game-lima",
    title: "Game Lima",
    tagline: "COMING SOON",
    url: null,
    icon: "assets/Foto/IconGame/ddwh3ph-92b34e9e-b5fb-4507-a8e1-1253c19b21b9.png",
    bg: "assets/Foto/BGgame/BGsekiro.jpg",
    color: ["#000000", "#000000"],
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
