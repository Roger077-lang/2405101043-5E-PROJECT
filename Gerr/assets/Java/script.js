const backgrounds = {
  1: "url('assets/Foto/Logo.jpeg')",
  2: "url('assets/Foto/LastDanceBG.jpeg')",
};

const shelf    = document.getElementById("shelf");
const heroBg   = document.getElementById("heroBg");
const titleEl  = document.getElementById("gameTitle");
const tagEl    = document.getElementById("tagline");


const tiles = [...shelf.querySelectorAll(".tile")];
const n = tiles.length;
const GAP = 14;
const PAD = 20;

let index = Math.max(0, tiles.findIndex(t => t.dataset.title === "Last Dance"));

const VISIBLE = 3;

/* Layout Daftar Game*/
function layout() {
  const mobile = window.innerWidth <= 700;
  const BIG = mobile ? 100 : 130;
  const SMALL = mobile ? 64 : 84;
  const GAP = 14;
  const half = Math.floor(n / 2);

  tiles.forEach((tile, i) => {
    let d = i - index;
    d = ((d + half) % n + n) % n - half;

    const abs = Math.abs(d);
    const size = d === 0 ? BIG : SMALL;


    let y = 0;
    if (d !== 0) {
      y = Math.sign(d) * (BIG / 2 + GAP + SMALL / 2 + (abs - 1) * (SMALL + GAP));
    }

    tile.style.width  = size + "px";
    tile.style.height = size + "px";
    tile.style.left   = PAD + (BIG - size) / 2 + "px";
    tile.style.top    = `calc(50% + ${y}px - ${size / 2}px)`;
    tile.style.opacity = abs > VISIBLE ? 0 : 1;
    tile.style.pointerEvents = abs > VISIBLE ? "none" : "auto";
    tile.style.zIndex = d === 0 ? 2 : 1;
    tile.classList.toggle("active", d === 0);
  });
}

/* Info Game */
function updateInfo() {
  const d = tiles[index].dataset;
  titleEl.textContent = d.title;
  tagEl.textContent   = d.tagline;
  heroBg.style.backgroundImage = backgrounds[d.bg] || backgrounds[1];
}

function go(step) {
  index = ((index + step) % n + n) % n;
  layout();
  updateInfo();
}

function goTo(i) {
  const half = Math.floor(n / 2);
  let d = i - index;
  d = ((d + half) % n + n) % n - half;
  go(d);
}

/* Kontrol */

tiles.forEach((t, i) => t.addEventListener("click", () => goTo(i)));


let locked = false;
window.addEventListener("wheel", e => {
  e.preventDefault();
  if (document.body.classList.contains("playing")) return;
  if (locked || Math.abs(e.deltaY) < 4) return;
  locked = true;
  go(e.deltaY > 0 ? 1 : -1);
  setTimeout(() => (locked = false), 220);
}, { passive: false });


document.addEventListener("keydown", e => {
  if (document.body.classList.contains("playing")) return;
  if (e.key === "ArrowDown" || e.key === "ArrowRight") go(1);
  if (e.key === "ArrowUp"   || e.key === "ArrowLeft")  go(-1);
});


let startY = null;
window.addEventListener("touchstart", e => { startY = e.touches[0].clientY; }, { passive: true });
window.addEventListener("touchend", e => {
  if (startY === null || document.body.classList.contains("playing")) { startY = null; return; }
  const dy = startY - e.changedTouches[0].clientY;
  if (Math.abs(dy) > 30) go(dy > 0 ? 1 : -1);
  startY = null;
});

window.addEventListener("resize", layout);


/* Mulai Game */
layout();
updateInfo();


/* Game */
const playBtn   = document.getElementById("playBtn");
const player    = document.getElementById("player");
const frame     = document.getElementById("gameFrame");
const loading   = document.getElementById("loading");
const loadText  = document.getElementById("loadingText");
const playerTtl = document.getElementById("playerTitle");
const gameMsg   = document.getElementById("gameMsg");
let loadTimer = null;

function openGame() {
  if (document.body.classList.contains("playing")) return;
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

playBtn.addEventListener("click", openGame);
document.getElementById("closeBtn").addEventListener("click", closeGame);

document.addEventListener("keydown", e => {
  if (e.key === "Enter") openGame();
  if (e.key === "Escape") closeGame();
});


window.addEventListener("message", e => { if (e.data === "close-game") closeGame(); });
