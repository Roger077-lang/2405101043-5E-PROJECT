const histBtn = document.createElement("button");
histBtn.className = "btn hist";
histBtn.type = "button";
histBtn.textContent = "\u2715";
histBtn.setAttribute("aria-label", "Hapus dari history");
histBtn.hidden = true;
favBtn.after(histBtn);

histBtn.addEventListener("click", () => {
  const id = Shelf.current();
  if (!id) return;
  Store.history.remove(id);
  Shelf.refresh();
});

const Riwayat = {
  ids: () => Store.history.ids(),
  showOnly: () =>
    Shelf.setView({
      name: "history",
      menuId: "history",
      label: "\u21BA History",
      filter: (id) => Store.history.ids().includes(id),
      order: () => Store.history.ids(),
      tag: (id) => "Dimainkan " + Store.history.ago(id),
      empty: "Belum ada history. Mainkan sebuah game dulu.",
    }),
  showAll: () => Shelf.setView(null),
};
