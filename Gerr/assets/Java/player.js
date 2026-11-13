const closeBtn = document.getElementById("closeBtn");
const player = document.getElementById("player");
const frame = document.getElementById("gameFrame");
const loading = document.getElementById("loading");
const loadText = document.getElementById("loadingText");
const playerTtl = document.getElementById("playerTitle");
const gameMsg = document.getElementById("gameMsg");

function fitFrame() {
  const s = Math.min(1, innerWidth / 1600, (innerHeight - 53) / 720);
  player.style.setProperty("--fit", s);
}
window.addEventListener("resize", fitFrame);

const isPlaying = () => document.body.classList.contains("playing");

let loadTimer = null;

function openGame() {
  if (isPlaying()) return;
  const d = tiles[index].dataset;

  if (d.url) Store.history.add(d.id);

  document.body.classList.add("playing");
  player.classList.add("open");
  fitFrame();
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
  if (Shelf.view() === "history") Shelf.refresh(1, false);
}

playBtn.addEventListener("click", () => activate());
closeBtn.addEventListener("click", closeGame);

window.addEventListener("message", (e) => {
  if (e.data === "close-game") closeGame();
});

function playGame(id) {
  if (isPlaying()) return;
  selectGame(id);
  openGame();
}
window.playGame = playGame;
