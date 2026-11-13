const LABEL_PLAY = "Play";
const LABEL_OPEN = "Pergi";

const shelf = document.getElementById("shelf");
const heroBg = document.getElementById("heroBg");
const titleEl = document.getElementById("gameTitle");
const tagEl = document.getElementById("tagline");
const playBtn = document.getElementById("playBtn");

function makeTile(item, kind) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "tile" + (kind === "menu" ? " dark" : "");
  b.dataset.kind = kind;
  b.dataset.id = item.id;
  b.dataset.title = item.title;
  b.dataset.tagline = item.tagline || "";
  b.dataset.bg = item.bg || DEFAULT_BG;
  b.dataset.url = item.url || "";
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

const pinned = new Set();
const wantedId = new URLSearchParams(location.search).get("game");
if (wantedId) pinned.add(wantedId);

const allTiles = [
  ...MENUS.map((m) => makeTile(m, "menu")),
  ...GAMES.map((g) => makeTile(g, "game")),
];
allTiles.forEach((t) => {
  if (
    t.dataset.kind === "game" &&
    !HOME_GAMES.some((g) => g.id === t.dataset.id)
  )
    t.dataset.hidden = "1";
});

let view = null;
const isMenu = (t) => t.dataset.kind !== "game";

const backTile = makeTile(
  {
    id: "beranda",
    title: "Beranda",
    tagline: "Kembali ke daftar game",
    letter: "\u2190",
  },
  "menu",
);
backTile.dataset.kind = "back";
backTile.setAttribute("aria-label", "Kembali ke Beranda");
const modeLabel = document.createElement("p");
modeLabel.className = "mode-label";
modeLabel.hidden = true;
titleEl.before(modeLabel);

const homeTiles = () => {
  if (view) {
    let list = allTiles.filter((t) => !isMenu(t) && view.filter(t.dataset.id));
    if (view.order) {
      list = view
        .order()
        .map((id) => list.find((t) => t.dataset.id === id))
        .filter(Boolean);
    }
    return [backTile, ...list];
  }
  return allTiles.filter((t) =>
    isMenu(t) ? true : !t.dataset.hidden || pinned.has(t.dataset.id),
  );
};
allTiles.forEach((t) => shelf.appendChild(t));
shelf.appendChild(backTile);

let tiles = [];
let n = 0;
let index = 0;
const VISIBLE = 3;

/* Looping */
function layout() {
  const mobile = window.innerWidth <= 700;
  const BIG = mobile ? 84 : 130;
  const SMALL = mobile ? 54 : 84;
  const GAP = mobile ? 10 : 14;
  const PAD = mobile ? 12 : 20;
  const half = Math.floor(n / 2);

  [...allTiles, backTile].forEach((t) => {
    if (tiles.includes(t)) return;
    t.style.opacity = 0;
    t.style.visibility = "hidden";
    t.style.pointerEvents = "none";
    t.classList.remove("active");
  });

  tiles.forEach((tile, i) => {
    let d = i - index;
    d = ((((d + half) % n) + n) % n) - half;

    const abs = Math.abs(d);
    const size = d === 0 ? BIG : SMALL;

    let y = 0;
    if (d !== 0) {
      y =
        Math.sign(d) * (BIG / 2 + GAP + SMALL / 2 + (abs - 1) * (SMALL + GAP));
    }

    tile.style.width = size + "px";
    tile.style.height = size + "px";
    tile.style.left = PAD + (BIG - size) / 2 + "px";
    tile.style.top = `calc(50% + ${y}px - ${size / 2}px)`;
    tile.style.visibility = "visible";
    tile.style.opacity = abs > VISIBLE ? 0 : 1;
    tile.style.pointerEvents = abs > VISIBLE ? "none" : "auto";
    tile.style.zIndex = d === 0 ? 2 : 1;
    tile.classList.toggle("active", d === 0);
  });
}

function setMode(_mode, opt = {}) {
  tiles = homeTiles();
  n = tiles.length;
  if (opt.index !== undefined) index = Math.max(0, Math.min(opt.index, n - 1));
  else if (view) index = n > 1 ? 1 : 0;
  else
    index = Math.max(
      0,
      tiles.findIndex((t) =>
        opt.back ? t.dataset.id === opt.back : !isMenu(t),
      ),
    );

  const instant = opt.instant !== false;
  if (instant) shelf.classList.add("no-anim");
  layout();
  if (instant) {
    void shelf.offsetWidth;
    shelf.classList.remove("no-anim");
  }
  updateInfo();
}

function updateInfo() {
  const t = tiles[index];
  if (!t) return;
  const d = t.dataset;
  titleEl.textContent = d.title;
  heroBg.style.backgroundImage = `url('${d.bg}')`;

  if (t === backTile && n === 1) tagEl.textContent = view.empty;
  else if (view && view.tag && !isMenu(t)) tagEl.textContent = view.tag(d.id);
  else tagEl.textContent = d.tagline;

  modeLabel.hidden = !view;
  if (view) modeLabel.textContent = view.label;
  playBtn.textContent = isMenu(t) ? LABEL_OPEN : LABEL_PLAY;
  favBtn.hidden = isMenu(t);
  histBtn.hidden = !(view && view.name === "history" && !isMenu(t));
  if (moreBtn) moreBtn.hidden = isMenu(t);
  paintFav(d.id);
}

function go(step) {
  index = (((index + step) % n) + n) % n;
  layout();
  updateInfo();
}

function goTo(i) {
  if (i < 0) return;
  const half = Math.floor(n / 2);
  let d = i - index;
  d = ((((d + half) % n) + n) % n) - half;
  go(d);
}

function selectGame(id) {
  const tile = allTiles.find(
    (t) => t.dataset.kind === "game" && t.dataset.id === id,
  );
  if (!tile) return;
  pinned.add(id);
  const reset = view && !view.filter(id);
  if (reset && document.body.dataset.view) {
    location.href = "Beranda.html?game=" + encodeURIComponent(id);
    return;
  }
  if (reset) view = null;
  if (!reset && tiles.includes(tile)) goTo(tiles.indexOf(tile));
  else setMode("home", { index: homeTiles().indexOf(tile) });
}
window.selectGame = selectGame;

const Shelf = {
  setView(v) {
    const prev = view;
    view = v || null;
    setMode("home", {
      instant: true,
      back: !view && prev ? prev.menuId : undefined,
    });
  },
  setFilter(fn) {
    this.setView(
      fn
        ? {
            name: "custom",
            menuId: "",
            label: "Filter",
            filter: fn,
            empty: "Tidak ada game.",
          }
        : null,
    );
  },
  refresh(i, instant) {
    setMode("home", { index: i === undefined ? index : i, instant: !!instant });
  },
  view: () => (view ? view.name : "home"),
  select: selectGame,
  current: () => (tiles[index] ? tiles[index].dataset.id : null),
};
