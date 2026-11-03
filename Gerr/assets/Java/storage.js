const Store = (() => {
  const PREFIX = "gerr:";
  const mem = {};

  function get(key, fallback) {
    if (key in mem) return mem[key];
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
    }

  function set(key, value) {
    mem[key] = value;
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (err) { /* tetap tersimpan selama halaman terbuka */ }
  }

  const favorites = {
    list:  () => get("favorites", []),
    has:   id => favorites.list().includes(id),
    count: () => favorites.list().length,
    toggle(id) {
      const list = favorites.list().slice();
      const i = list.indexOf(id);
      if (i >= 0) list.splice(i, 1); else list.push(id);
      set("favorites", list);
      return i < 0;
    },
  };

  try {
    const old = localStorage.getItem("gerr-favorit");
    if (old !== null) {
      if (typeof GAMES !== "undefined" && get("favorites", null) === null) {
        const titles = JSON.parse(old) || [];
        set("favorites", GAMES.filter(g => titles.includes(g.title)).map(g => g.id));
      }
      localStorage.removeItem("gerr-favorit");
    }
  } catch (err) { /* abaikan */ }

  return { get, set, favorites };
})();
