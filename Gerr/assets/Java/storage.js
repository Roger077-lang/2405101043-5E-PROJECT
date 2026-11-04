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

  // History
  const MAX_HISTORY = 20;
  const history = {
    list: () => get("history", []),
    ids:  () => history.list().map(e => e.id),
    has:  id => history.list().some(e => e.id === id),
    add(id) {
      const rest = history.list().filter(e => e.id !== id);
      rest.unshift({ id, t: Date.now() });
      set("history", rest.slice(0, MAX_HISTORY));
    },
    remove(id) { set("history", history.list().filter(e => e.id !== id)); },
    clear()    { set("history", []); },
    ago(id) {
      const e = history.list().find(x => x.id === id);
      if (!e) return "";
      const min = Math.floor(Math.max(0, Date.now() - e.t) / 60000);
      if (min < 1)  return "baru saja";
      if (min < 60) return min + " menit lalu";
      const jam = Math.floor(min / 60);
      if (jam < 24) return jam + " jam lalu";
      const hari = Math.floor(jam / 24);
      if (hari === 1) return "kemarin";
      if (hari < 7)   return hari + " hari lalu";
      return "pada " + new Date(e.t).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
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

  return { get, set, favorites, history };
})()