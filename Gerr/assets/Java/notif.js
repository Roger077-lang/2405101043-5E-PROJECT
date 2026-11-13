const Notif = (() => {
  const KEY = "gerr:notifications";
  const SEEN_KEY = "gerr:notif-seen";
  const MAX = 30;

  const read = () => {
    try {
      const a = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(a) ? a : [];
    } catch (e) {
      return [];
    }
  };
  const seenAt = () => Number(localStorage.getItem(SEEN_KEY)) || 0;
  const unread = () => read().filter((n) => n.t > seenAt()).length;

  function add(items) {
    items = [].concat(items).filter(Boolean);
    if (!items.length) return;
    const now = Date.now();
    const cur = read();
    items.forEach((it, i) => cur.unshift({ id: now + "-" + i, t: now, ...it }));
    localStorage.setItem(KEY, JSON.stringify(cur.slice(0, MAX)));
    window.dispatchEvent(new Event("notifications-changed"));
  }

  function announceChanges(before, after) {
    const old = new Map(before.map((g) => [g.id, g]));
    const fields = ["title", "tagline", "url", "icon", "bg"];
    const out = [];
    after.forEach((g) => {
      const o = old.get(g.id);
      const base = { gameId: g.id, title: g.title };
      if (!o) {
        out.push({ ...base, type: "add", text: "Game baru: " + g.title });
        return;
      }
      if (fields.some((f) => (o[f] || "") !== (g[f] || ""))) {
        out.push({ ...base, type: "edit", text: g.title + " diperbarui" });
      }
      const was = o.show !== false;
      const now = g.show !== false;
      if (was !== now) {
        out.push({
          ...base,
          type: now ? "show" : "hide",
          text:
            g.title +
            (now ? " kini tampil di Beranda" : " disembunyikan dari Beranda"),
        });
      }
    });
    before.forEach((o) => {
      if (!after.some((g) => g.id === o.id)) {
        out.push({
          gameId: o.id,
          title: o.title,
          type: "del",
          text: o.title + " dihapus",
        });
      }
    });
    add(out);
  }

  const api = { add, announceChanges, list: read, unread };

  const btn = document.getElementById("notifBtn");
  if (!btn) return api;

  const badge = document.createElement("span");
  badge.className = "notif-badge";
  badge.hidden = true;
  btn.appendChild(badge);

  const root = document.createElement("div");
  root.className = "notif";
  root.setAttribute("aria-hidden", "true");
  const box = document.createElement("div");
  box.className = "search-box notif-box";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-label", "Notifikasi");
  box.tabIndex = -1;
  const head = document.createElement("div");
  head.className = "notif-head";
  const list = document.createElement("ul");
  list.className = "search-results";
  box.append(head, list);
  root.appendChild(box);
  document.body.appendChild(root);

  const isOpen = () => root.classList.contains("open");

  function paintBadge() {
    const n = unread();
    badge.hidden = n === 0;
    badge.textContent = n > 9 ? "9+" : n;
  }

  function ago(t) {
    const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
    if (s < 60) return "baru saja";
    if (s < 3600) return Math.floor(s / 60) + " menit lalu";
    if (s < 86400) return Math.floor(s / 3600) + " jam lalu";
    if (s < 172800) return "kemarin";
    return new Date(t).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  }

  function makeItem(n, since) {
    const game =
      typeof GAMES !== "undefined"
        ? GAMES.find((g) => g.id === n.gameId)
        : null;
    const li = document.createElement("li");
    li.className =
      "search-item notif-item" +
      (n.t > since ? " unread" : "") +
      (game ? " go" : "");

    const thumb = document.createElement("div");
    thumb.className = "search-thumb";
    const c = (game && game.color) || ["#444", "#888"];
    thumb.style.setProperty("--c1", c[0]);
    thumb.style.setProperty("--c2", c[1]);
    if (game && game.bg) {
      const img = document.createElement("img");
      img.src = game.bg;
      img.alt = "";
      img.draggable = false;
      thumb.appendChild(img);
    } else {
      thumb.textContent = (game && game.letter) || (n.title || "!").charAt(0);
    }

    const text = document.createElement("div");
    text.className = "search-text";
    const title = document.createElement("div");
    title.className = "search-title";
    title.textContent = n.text;
    const tag = document.createElement("div");
    tag.className = "search-tag";
    tag.textContent = "Pengumuman admin \u00b7 " + ago(n.t);
    text.append(title, tag);
    li.append(thumb, text);

    if (game) li.addEventListener("click", () => choose(game));
    return li;
  }

  function render(since) {
    const items = read();
    head.textContent = "Notifikasi";
    list.replaceChildren(
      ...(items.length
        ? items.map((n) => makeItem(n, since))
        : [
            Object.assign(document.createElement("li"), {
              className: "search-empty",
              textContent: "Belum ada pengumuman.",
            }),
          ]),
    );
  }

  function place() {
    const r = btn.getBoundingClientRect();
    const w = Math.min(360, innerWidth - 24);
    const left = Math.min(
      Math.max(12, r.left + r.width / 2 - w / 2),
      innerWidth - w - 12,
    );
    box.style.width = w + "px";
    box.style.left = left + "px";
    box.style.top = r.bottom + 10 + "px";
  }

  function open() {
    if (document.body.classList.contains("playing") || isOpen()) return;
    const since = seenAt();
    render(since);
    place();
    root.classList.add("open");
    root.setAttribute("aria-hidden", "false");
    box.focus({ preventScroll: true });
    localStorage.setItem(SEEN_KEY, Date.now());
    paintBadge();
  }

  function close() {
    root.classList.remove("open");
    root.setAttribute("aria-hidden", "true");
    btn.focus({ preventScroll: true });
  }

  function choose(game) {
    close();
    if (typeof window.selectGame === "function") window.selectGame(game.id);
    if (typeof GameDialog !== "undefined") GameDialog.open(game.id);
    else if (typeof window.selectGame !== "function") {
      location.href = "Beranda.html?game=" + encodeURIComponent(game.id);
    }
  }

  btn.addEventListener("click", () => (isOpen() ? close() : open()));
  root.addEventListener("click", (e) => {
    if (e.target === root) close();
  });
  root.addEventListener("keydown", (e) => {
    e.stopPropagation();
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  });
  ["wheel", "touchstart", "touchend"].forEach((type) =>
    root.addEventListener(type, (e) => e.stopPropagation(), { passive: true }),
  );
  window.addEventListener("resize", () => isOpen() && place());
  const refresh = () => {
    paintBadge();
    if (isOpen()) render(Infinity);
  };
  window.addEventListener("notifications-changed", refresh);
  window.addEventListener(
    "storage",
    (e) => (e.key === KEY || e.key === SEEN_KEY) && refresh(),
  );

  paintBadge();
  return api;
})();
