(function () {
  const container = document.getElementById("gamesGrid");
  if (!container || typeof GameGrid === "undefined") return;

  const grid = GameGrid.mount(container);
  const chips = [...document.querySelectorAll(".chip")];

  const views = {
    all: () => grid.setFilter(null),
    fav: () =>
      grid.setFilter((id) => Favorit.has(id), {
        rerenderOnFav: true,
        empty:
          "Belum ada game favorit. Tekan \u2661 pada sebuah game untuk menambahkannya.",
      }),
    hist: () =>
      grid.setFilter((id) => Store.history.ids().includes(id), {
        order: () => Store.history.ids(),
        tag: (id) => "Dimainkan " + Store.history.ago(id),
        empty: "Belum ada history. Mainkan sebuah game dulu.",
      }),
  };

  function show(name) {
    (views[name] || views.all)();
    chips.forEach((c) =>
      c.classList.toggle("active", c.dataset.filter === name),
    );
  }

  chips.forEach((chip) =>
    chip.addEventListener("click", () => show(chip.dataset.filter)),
  );
  show(document.body.dataset.filter || "all");
})();
