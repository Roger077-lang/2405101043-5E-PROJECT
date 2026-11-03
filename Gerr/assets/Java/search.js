(function () {
  const searchBtn = document.getElementById("searchBtn");
  if (!searchBtn || typeof GAMES === "undefined") return;

  /* Panel */
  const root = document.createElement("div");
  root.className = "search";
  root.setAttribute("aria-hidden", "true");

  const box = document.createElement("div");
  box.className = "search-box";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-label", "Pencarian game");

  const input = document.createElement("input");
  input.className = "search-input";
  input.type = "search";
  input.placeholder = "Cari game...";
  input.autocomplete = "off";
  input.setAttribute("aria-label", "Cari game");

  const list = document.createElement("ul");
  list.className = "search-results";
  list.setAttribute("role", "listbox");

  box.appendChild(input);
  box.appendChild(list);
  root.appendChild(box);
  document.body.appendChild(root);

  /* Pencocokan */
  const norm = s => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  function rank(query) {
    if (!query) return GAMES.slice();
    const words = query.split(/\s+/).filter(Boolean);
    return GAMES
      .map(g => {
        const title = norm(g.title);
        const hay = title + " " + norm(g.tagline);
        if (!words.every(w => hay.includes(w))) return null;
        let score = 1;
        if (title.includes(query))   score = 2;
        if (title.startsWith(query)) score = 3;
        return { g, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .map(r => r.g);
  }

  /* Hasil */
  let results = [];
  let active = 0;

  function makeTitle(game, query) {
    const wrap = document.createElement("div");
    wrap.className = "search-title";
    const t = game.title;
    const i = query && norm(t).length === t.length ? norm(t).indexOf(query) : -1;
    if (i < 0) {
      wrap.textContent = t;
    } else {
      const mark = document.createElement("mark");
      mark.textContent = t.slice(i, i + query.length);
      wrap.appendChild(document.createTextNode(t.slice(0, i)));
      wrap.appendChild(mark);
      wrap.appendChild(document.createTextNode(t.slice(i + query.length)));
    }
    return wrap;
  }

  function makeItem(game, i, query) {
    const li = document.createElement("li");
    li.className = "search-item";
    li.setAttribute("role", "option");

    const thumb = document.createElement("div");
    thumb.className = "search-thumb";
    if (game.color) {
      thumb.style.setProperty("--c1", game.color[0]);
      thumb.style.setProperty("--c2", game.color[1]);
    }
    if (game.icon) {
      const img = document.createElement("img");
      img.src = game.icon;
      img.alt = "";
      img.draggable = false;
      thumb.appendChild(img);
    } else {
      thumb.textContent = game.letter || game.title.charAt(0);
    }

    const text = document.createElement("div");
    text.className = "search-text";
    const tag = document.createElement("div");
    tag.className = "search-tag";
    tag.textContent = game.tagline || "";
    text.appendChild(makeTitle(game, query));
    text.appendChild(tag);

    li.appendChild(thumb);
    li.appendChild(text);

    if (typeof Store !== "undefined" && Store.favorites.has(game.id)) {
      const heart = document.createElement("span");
      heart.className = "search-heart";
      heart.textContent = "\u2665";
      heart.setAttribute("aria-label", "Favorit");
      li.appendChild(heart);
    }

    li.addEventListener("mouseenter", () => setActive(i, false));
    li.addEventListener("click", () => choose(game));
    return li;
  }

  function setActive(i, scroll) {
    if (!results.length) return;
    active = (i + results.length) % results.length;
    [...list.children].forEach((li, k) => li.classList.toggle("active", k === active));
    if (scroll !== false && list.children[active].scrollIntoView) {
      list.children[active].scrollIntoView({ block: "nearest" });
    }
  }

  function render() {
    const query = norm(input.value).trim();
    results = rank(query);
    active = 0;

    const items = [];
    if (!results.length) {
      const li = document.createElement("li");
      li.className = "search-empty";
      li.textContent = query
        ? "Tidak ada game untuk \u201C" + input.value.trim() + "\u201D"
        : "Belum ada game.";
      items.push(li);
    } else {
      results.forEach((g, i) => items.push(makeItem(g, i, query)));
    }
    list.replaceChildren(...items);
    setActive(0, false);
  }

  /* Opsi */
  const isOpen = () => root.classList.contains("open");

  function open() {
    if (document.body.classList.contains("playing") || isOpen()) return;
    root.classList.add("open");
    root.setAttribute("aria-hidden", "false");
    input.value = "";
    render();
    input.focus();
  }

  function close() {
    root.classList.remove("open");
    root.setAttribute("aria-hidden", "true");
    searchBtn.focus({ preventScroll: true });
  }

  function choose(game) {
    close();
    if (typeof window.selectGame === "function") {
      window.selectGame(game.id);
    } else {
      location.href = "Beranda.html?game=" + encodeURIComponent(game.id);
    }
  }

  /* Kontrol */
  searchBtn.addEventListener("click", open);
  input.addEventListener("input", render);

  root.addEventListener("click", e => { if (e.target === root) close(); });

  root.addEventListener("keydown", e => {
    e.stopPropagation();
    if (e.key === "Escape")    { e.preventDefault(); close(); }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive(active - 1); }
    if (e.key === "Enter")     { e.preventDefault(); if (results[active]) choose(results[active]); }
  });

  ["wheel", "touchstart", "touchend"].forEach(type =>
    root.addEventListener(type, e => e.stopPropagation(), { passive: true })
  );

  document.addEventListener("keydown", e => {
    if (isOpen()) return;
    const typing = /^(INPUT|TEXTAREA)$/.test((e.target.tagName || ""));
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open(); }
    else if (e.key === "/" && !typing) { e.preventDefault(); open(); }
  });
})();