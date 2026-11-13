const favBtn = document.createElement("button");
favBtn.className = "btn fav";
favBtn.type = "button";
playBtn.after(favBtn);

function paintFav(id) {
  const on = isFav(id);
  favBtn.textContent = on ? "\u2665" : "\u2661";
  favBtn.classList.toggle("on", on);
  favBtn.setAttribute("aria-pressed", on);
  favBtn.setAttribute(
    "aria-label",
    on ? "Hapus dari favorit" : "Tambah ke favorit",
  );
}

function toggleFav() {
  const t = tiles[index];
  if (!t || isMenu(t)) return;
  Store.favorites.toggle(t.dataset.id);
  favBtn.classList.remove("pop");
  void favBtn.offsetWidth;
  favBtn.classList.add("pop");
  if (Shelf.view() === "favorites") Shelf.refresh();
  else paintFav(t.dataset.id);
}
favBtn.addEventListener("click", toggleFav);
window.addEventListener("favorites-changed", () => {
  if (Shelf.view() === "favorites") Shelf.refresh();
  else {
    const t = tiles[index];
    if (t && !isMenu(t)) paintFav(t.dataset.id);
  }
});

Object.assign(Favorit, {
  showOnly: () =>
    Shelf.setView({
      name: "favorites",
      menuId: "favorit",
      label: "\u2665 Favorit",
      filter: (id) => isFav(id),
      empty: "Belum ada game favorit. Pilih sebuah game lalu tekan \u2661.",
    }),
  showAll: () => Shelf.setView(null),
});
