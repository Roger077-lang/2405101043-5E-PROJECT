const isFav = (id) => Store.favorites.has(id);
const Favorit = {
  has: isFav,
  toggle: (id) => Store.favorites.toggle(id),
};