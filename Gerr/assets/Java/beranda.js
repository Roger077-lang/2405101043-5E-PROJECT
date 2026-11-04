const LABEL_PLAY = "Play";
const LABEL_OPEN = "Pergi";

/* Elemen */
const shelf     = document.getElementById("shelf");
const heroBg    = document.getElementById("heroBg");
const titleEl   = document.getElementById("gameTitle");
const tagEl     = document.getElementById("tagline");
const playBtn   = document.getElementById("playBtn");
const closeBtn  = document.getElementById("closeBtn");
const player    = document.getElementById("player");
const frame     = document.getElementById("gameFrame");
const loading   = document.getElementById("loading");
const loadText  = document.getElementById("loadingText");
const playerTtl = document.getElementById("playerTitle");
const gameMsg   = document.getElementById("gameMsg");

// Tombol Favorit
const favBtn = document.createElement("button");
favBtn.className = "btn fav";
favBtn.type = "button";
playBtn.after(favBtn);

const modeLabel = document.createElement("p");
modeLabel.className = "mode-label";
modeLabel.textContent = "\u2665 Favorit";
modeLabel.hidden = true;
titleEl.before(modeLabel);

/* Kolom */
function makeTile(item, kind) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "tile" + (kind === "menu" ? " dark" : "");
  b.dataset.kind    = kind;
  b.dataset.id      = item.id;
  b.dataset.title   = item.title;
  b.dataset.tagline = item.tagline || "";
  b.dataset.bg      = item.bg || DEFAULT_BG;
  b.dataset.url     = item.url || "";
  b.setAttribute("aria-label", item.title);

  if (item.color) {
    b.style.setProperty("--c1", item.color[0]);
    b.style.setProperty("--c2", item.color[1]);
  }
  if (item.icon) {
    const img = document.createElement("img");
    img.src = item.icon;
    img.alt = item.title;
    img.draggable = false;
    b.appendChild(img);
  } else {
    b.textContent = item.letter || item.title.charAt(0);
  }
  return b;
}

const allTiles = [
  ...MENUS.map(m => makeTile(m, "menu")),
  ...GAMES.map(g => makeTile(g, "game")),
];
allTiles.forEach(t => shelf.appendChild(t));

const backTile = makeTile(
  { id: "beranda", title: "Beranda", tagline: "Kembali ke daftar game", letter: "\u2190" },
  "menu"
);
backTile.dataset.kind = "back";
backTile.setAttribute("aria-label", "Kembali ke Beranda");
shelf.appendChild(backTile);

const isMenu    = t => t.dataset.kind !== "game";
const isFavMenu = t => t.dataset.id === "favorit";

let tiles = [];
let n = 0;
let index = 0
let mode = "home";

const VISIBLE = 3;

/* Favorit */
const isFav = id => Store.favorites.has(id);

function toggleFav() {
  const t = tiles[index];
  if (!t || isMenu(t)) return;

  Store.favorites.toggle(t.dataset.id);

  favBtn.classList.remove("pop");
  void favBtn.offsetWidth;
  favBtn.classList.add("pop");

  if (mode === "favorites") setMode("favorites", { index, instant: false });
  else updateInfo();
}
favBtn.addEventListener("click", toggleFav);

/* Mode */
function setMode(newMode, opt = {}) {
  mode = newMode;

  if (mode === "favorites") {
    tiles = [backTile, ...allTiles.filter(t => !isMenu(t) && isFav(t.dataset.id))];
  } else {
    tiles = [...allTiles];
  }
  n = tiles.length;

  if (opt.index !== undefined) {
    index = Math.max(0, Math.min(opt.index, n - 1));
  } else if (mode === "favorites") {
    index = n > 1 ? 1 : 0;
  } else {
    index = Math.max(0, tiles.findIndex(isFavMenu));
  }

  const instant = opt.instant !== false;
  if (instant) shelf.classList.add("no-anim");
  layout();
  if (instant) { void shelf.offsetWidth; shelf.classList.remove("no-anim"); }

  updateInfo();
}

/* Looping */
function layout() {
  const mobile = window.innerWidth <= 700;
  const BIG   = mobile ? 84 : 130;
  const SMALL = mobile ? 54 : 84;
  const GAP   = mobile ? 10 : 14;
  const PAD   = mobile ? 12 : 20;
  const half  = Math.floor(n / 2);

  [...allTiles, backTile].forEach(t => {
    if (tiles.includes(t)) return;
    t.style.opacity = 0;
    t.style.visibility = "hidden";
    t.style.pointerEvents = "none";
    t.classList.remove("active");
  });

  tiles.forEach((tile, i) => {
    let d = i - index;
    d = ((d + half) % n + n) % n - half;

    const abs  = Math.abs(d);
    const size = d === 0 ? BIG : SMALL;

    let y = 0;
    if (d !== 0) {
      y = Math.sign(d) * (BIG / 2 + GAP + SMALL / 2 + (abs - 1) * (SMALL + GAP));
    }

    tile.style.width  = size + "px";
    tile.style.height = size + "px";
    tile.style.left   = PAD + (BIG - size) / 2 + "px";
    tile.style.top    = `calc(50% + ${y}px - ${size / 2}px)`;
    tile.style.visibility    = "visible";
    tile.style.opacity       = abs > VISIBLE ? 0 : 1;
    tile.style.pointerEvents = abs > VISIBLE ? "none" : "auto";
    tile.style.zIndex        = d === 0 ? 2 : 1;
    tile.classList.toggle("active", d === 0);
  });
}

/* Info Game */
function updateInfo() {
  const t = tiles[index];
  const d = t.dataset;

  titleEl.textContent = d.title;
  heroBg.style.backgroundImage = `url('${d.bg}')`;

  if (t === backTile && n === 1) {
    tagEl.textContent = "Belum ada game favorit. Pilih sebuah game lalu tekan \u2661.";
  } else {
    tagEl.textContent = d.tagline;
  }

  modeLabel.hidden = mode !== "favorites";
  playBtn.textContent = isMenu(t) ? LABEL_OPEN : LABEL_PLAY;

  favBtn.hidden = isMenu(t);
  const on = isFav(d.id);
  favBtn.textContent = on ? "\u2665" : "\u2661";
  favBtn.classList.toggle("on", on);
  favBtn.setAttribute("aria-pressed", on);
  favBtn.setAttribute("aria-label", on ? "Hapus dari favorit" : "Tambah ke favorit");
}

function go(step) {
  index = ((index + step) % n + n) % n;
  layout();
  updateInfo();
}

function goTo(i) {
  if (i < 0) return;
  const half = Math.floor(n / 2);
  let d = i - index;
  d = ((d + half) % n + n) % n - half;
  go(d);
}

/* Kontrol */
const isPlaying = () => document.body.classList.contains("playing");

[...allTiles, backTile].forEach(t =>
  t.addEventListener("click", () => goTo(tiles.indexOf(t)))
);

let locked = false;
window.addEventListener("wheel", e => {
  e.preventDefault();
  if (isPlaying()) return;
  if (locked || Math.abs(e.deltaY) < 4) return;
  locked = true;
  setTimeout(() => (locked = false), 220);
  go(e.deltaY > 0 ? 1 : -1);
}, { passive: false });

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (isPlaying()) closeGame();
    else if (mode === "favorites") setMode("home");
    return;
  }
  if (isPlaying()) return;

  if (e.key === "ArrowDown") go(1);
  if (e.key === "ArrowUp")  go(-1);

  if (e.key === "Enter") {
    if (e.target === favBtn) return;
    if (e.target.closest && e.target.closest("#topbar")) return;
    e.preventDefault();
    if (!e.repeat) activate();
  }
});

let startY = null;
window.addEventListener("touchstart", e => { startY = e.touches[0].clientY; }, { passive: true });
window.addEventListener("touchend", e => {
  if (startY === null || isPlaying()) { startY = null; return; }
  const dy = startY - e.changedTouches[0].clientY;
  if (Math.abs(dy) > 30) go(dy > 0 ? 1 : -1);
  startY = null;
});

window.addEventListener("resize", layout);

/* Tombol Transisi */
let loadTimer = null;

function activate() {
  const t = tiles[index];
  if (t === backTile)  { setMode("home"); return; }
  if (isFavMenu(t))    { setMode("favorites"); return; }
  openGame();
}

function openGame() {
  if (isPlaying()) return;
  const d = tiles[index].dataset;

  document.body.classList.add("playing");
  player.classList.add("open");
  player.setAttribute("aria-hidden", "false");
  playerTtl.textContent = d.title;
  loadText.textContent = "Memuat " + d.title + "...";
  loading.classList.remove("done");
  gameMsg.hidden = true;

  loadTimer = setTimeout(() => {
    if (d.url) {
      frame.src = d.url;
      frame.onload = () => frame.focus();
    } else {
      gameMsg.textContent = d.title + " belum tersedia.";
      gameMsg.hidden = false;
    }
    loading.classList.add("done");
  }, 1200);
}

function closeGame() {
  clearTimeout(loadTimer);
  frame.onload = null;
  frame.src = "about:blank";
  player.classList.remove("open");
  player.setAttribute("aria-hidden", "true");
  document.body.classList.remove("playing");
}

playBtn.addEventListener("click", activate);
closeBtn.addEventListener("click", closeGame);

window.addEventListener("message", e => { if (e.data === "close-game") closeGame(); });

/* Uji coba */
function selectGame(id) {
  const i = allTiles.findIndex(t => t.dataset.kind === "game" && t.dataset.id === id);
  if (i < 0) return;
  if (mode === "home") goTo(tiles.indexOf(allTiles[i]));
  else setMode("home", { index: i });
}
window.selectGame = selectGame;

/* PlaY */
const wanted     = new URLSearchParams(location.search).get("game");
const wantedIdx  = allTiles.findIndex(t => t.dataset.kind === "game" && t.dataset.id === wanted);
const firstGame  = allTiles.findIndex(t => t.dataset.kind === "game");

setMode("home", { index: wantedIdx >= 0 ? wantedIdx : Math.max(0, firstGame), instant: true });
