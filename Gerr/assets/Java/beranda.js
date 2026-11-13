
const moreBtn = document.querySelector(".btn.more");


if (moreBtn) {
  moreBtn.addEventListener("click", () => {
    const t = tiles[index];
    if (t && !isMenu(t) && typeof GameDialog !== "undefined")
      GameDialog.open(t.dataset.id);
  });
}

[...allTiles, backTile].forEach((t) =>
  t.addEventListener("click", () => goTo(tiles.indexOf(t))),
);

let locked = false;
window.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    if (isPlaying()) return;
    if (locked || Math.abs(e.deltaY) < 4) return;
    locked = true;
    setTimeout(() => (locked = false), 220);
    go(e.deltaY > 0 ? 1 : -1);
  },
  { passive: false },
);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (isPlaying()) closeGame();
    else if (document.body.dataset.view) leaveView();
    return;
  }
  if (isPlaying()) return;

  if (e.key === "ArrowDown") go(1);
  if (e.key === "ArrowUp") go(-1);

  if (e.key === "Enter") {
    if (e.target === favBtn || e.target === histBtn || e.target === moreBtn)
      return;
    if (e.target.closest && e.target.closest("#topbar")) return;
    e.preventDefault();
    if (!e.repeat) activate();
  }
});

let startY = null;
window.addEventListener(
  "touchstart",
  (e) => {
    startY = e.touches[0].clientY;
  },
  { passive: true },
);
window.addEventListener("touchend", (e) => {
  if (startY === null || isPlaying()) {
    startY = null;
    return;
  }
  const dy = startY - e.changedTouches[0].clientY;
  if (Math.abs(dy) > 30) go(dy > 0 ? 1 : -1);
  startY = null;
});

window.addEventListener("resize", layout);

function leaveView() {
  if (document.body.dataset.view) location.href = "Beranda.html";
  else Shelf.setView(null);
}

function activate() {
  const t = tiles[index];
  if (t === backTile) return leaveView();
  if (isMenu(t)) {
    location.href =
      t.dataset.id === "favorit" ? "Favorit.html" : "History.html";
    return;
  }
  openGame();
}

const wanted = new URLSearchParams(location.search).get("game");
const wantedIdx = homeTiles().findIndex(
  (t) => t.dataset.kind === "game" && t.dataset.id === wanted,
);
const firstGame = homeTiles().findIndex((t) => t.dataset.kind === "game");

setMode("home", {
  index: wantedIdx >= 0 ? wantedIdx : Math.max(0, firstGame),
  instant: true,
});

if (
  new URLSearchParams(location.search).get("play") === "1" &&
  wantedIdx >= 0 &&
  homeTiles()[wantedIdx].dataset.url
) {
  window.history.replaceState(null, "", location.pathname);
  openGame();
}

const startView = document.body.dataset.view;
if (startView === "favorites") Favorit.showOnly();
if (startView === "history") Riwayat.showOnly();
