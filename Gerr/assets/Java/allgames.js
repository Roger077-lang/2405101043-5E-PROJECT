(function () {
  const grid = document.getElementById("gamesGrid");
  if (!grid || typeof GAMES === "undefined") return;

  const chips   = [...document.querySelectorAll(".chip")];
  let filter = "all";                      // "all" atau "fav"

  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  /* Tampilan Kartu */
  function makeCard(game, i) {
    const card = el("div", "card" + (game.url ? "" : " soon"));
    card.style.setProperty("--i", i);

    const link = el("a", "card-link");
    link.href = "Beranda.html?game=" + encodeURIComponent(game.id);

    const art = el("div", "card-art");
    if (game.color) {
      art.style.setProperty("--c1", game.color[0]);
      art.style.setProperty("--c2", game.color[1]);
    }
    const image = game.icon;
    if (image) art.style.backgroundImage = "url('" + image + "')";
    else art.textContent = game.letter || game.title.charAt(0);
    if (!game.url) art.appendChild(el("span", "card-badge", "Segera"));

    const body = el("div", "card-body");
    body.appendChild(el("div", "card-title", game.title));
    body.appendChild(el("div", "card-tag", game.tagline || ""));

    link.appendChild(art);
    link.appendChild(body);
    card.appendChild(link);

    // tombol Favorit
    const fav = el("button", "card-fav");
    fav.type = "button";
    const paint = () => {
      const on = Store.favorites.has(game.id);
      fav.textContent = on ? "\u2665" : "\u2661";
      fav.classList.toggle("on", on);
      fav.setAttribute("aria-pressed", on);
      fav.setAttribute("aria-label", (on ? "Hapus dari favorit: " : "Tambah ke favorit: ") + game.title);
    };
    paint();
    fav.addEventListener("click", () => {
      Store.favorites.toggle(game.id);
      paint();
      fav.classList.remove("pop");
      void fav.offsetWidth;
      fav.classList.add("pop");
      if (filter === "fav") setTimeout(render, 220);
    });
    card.appendChild(fav);

    return card;
  }

  /* Tampilan Grid */
  function render() {
    const list = GAMES.filter(g => filter === "all" || Store.favorites.has(g.id));

    if (!list.length) {
      const msg = el("p", "games-empty",
        filter === "fav"
          ? "Belum ada game favorit. Tekan \u2661 pada sebuah game untuk menambahkannya."
          : "Belum ada game.");
      grid.replaceChildren(msg);
      return;
    }
    grid.replaceChildren(...list.map(makeCard));
  }

  chips.forEach(chip =>
    chip.addEventListener("click", () => {
      filter = chip.dataset.filter;
      chips.forEach(c => c.classList.toggle("active", c === chip));
      render();
    })
  );

  render();
})();
