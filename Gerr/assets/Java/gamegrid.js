const GameGrid = (() => {
  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function mount(container, opts = {}) {
    const state = {
      filter: opts.filter || null,
      order: opts.order || null,
      tag: opts.tag || null,
      empty: opts.empty || "Belum ada game.",
      rerenderOnFav: !!opts.rerenderOnFav,
    };
    const paints = new Map();

    function makeCard(game, i) {
      const card = el("div", "card" + (game.url ? "" : " soon"));
      card.style.setProperty("--i", i);

      const link = el("a", "card-link");
      link.href = "Beranda.html?game=" + encodeURIComponent(game.id);
      link.addEventListener("click", (e) => {
        if (typeof GameDialog === "undefined") return;
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
        e.preventDefault();
        GameDialog.open(game.id);
      });

      const art = el("div", "card-art");
      if (game.color) {
        art.style.setProperty("--c1", game.color[0]);
        art.style.setProperty("--c2", game.color[1]);
      }
      if (game.bg) art.style.backgroundImage = "url('" + game.bg + "')";
      else art.textContent = game.letter || game.title.charAt(0);
      if (!game.url) art.appendChild(el("span", "card-badge", "Segera"));

      const body = el("div", "card-body");
      body.appendChild(el("div", "card-title", game.title));
      body.appendChild(
        el(
          "div",
          "card-tag",
          state.tag ? state.tag(game.id) : game.tagline || "",
        ),
      );

      link.appendChild(art);
      link.appendChild(body);
      card.appendChild(link);

      const fav = el("button", "card-fav");
      fav.type = "button";
      const paint = () => {
        const on = Store.favorites.has(game.id);
        fav.textContent = on ? "\u2665" : "\u2661";
        fav.classList.toggle("on", on);
        fav.setAttribute("aria-pressed", on);
        fav.setAttribute(
          "aria-label",
          (on ? "Hapus dari favorit: " : "Tambah ke favorit: ") + game.title,
        );
      };
      paint();
      paints.set(game.id, paint);
      fav.addEventListener("click", () => {
        Store.favorites.toggle(game.id);
        paint();
        fav.classList.remove("pop");
        void fav.offsetWidth;
        fav.classList.add("pop");
        if (state.rerenderOnFav) setTimeout(render, 220);
      });
      card.appendChild(fav);
      return card;
    }

    function render() {
      paints.clear();
      let list = GAMES.filter((g) => !state.filter || state.filter(g.id));
      if (state.order) {
        list = state
          .order()
          .map((id) => list.find((g) => g.id === id))
          .filter(Boolean);
      }
      if (!list.length) {
        container.replaceChildren(el("p", "games-empty", state.empty));
        return;
      }
      container.replaceChildren(...list.map(makeCard));
    }

    window.addEventListener("favorites-changed", () => {
      if (state.rerenderOnFav) render();
      else paints.forEach((paint) => paint());
    });

    render();

    return {
      setFilter(fn, extra = {}) {
        state.filter = fn || null;
        state.order = extra.order || null;
        state.tag = extra.tag || null;
        state.empty = extra.empty || "Belum ada game.";
        state.rerenderOnFav = !!extra.rerenderOnFav;
        render();
      },
      refresh: render,
    };
  }

  return { mount };
})();