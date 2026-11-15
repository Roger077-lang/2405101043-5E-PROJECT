(function () {
  if (sessionStorage.getItem(ROLE_KEY) !== "admin") {
    location.replace("login.html");
    return;
  }

  const $ = (id) => document.getElementById(id);
  const grid = $("adminGrid");
  const countEl = $("adminCount");
  const msgEl = $("adminMsg");
  const saveBtn = el("button", "sl-save", "Simpan perubahan");
  saveBtn.type = "button";
  const listPanel = document.querySelector(".sl-list");
  const detail = $("slDetail");

  let data = ALL_GAMES.map((g) => ({ ...g }));
  let saved = data.map((g) => ({ ...g }));
  let filter = "all";
  let query = "";
  let selId = data.length ? data[0].id : null;
  let dirty = false;
  let firstRender = true;
  let msgTimer = null;

  const isShown = (g) => g.show !== false;
  const visible = () =>
    data.filter(
      (g) =>
        (filter === "all" || (filter === "on") === isShown(g)) &&
        g.title.toLowerCase().includes(query),
    );
  const cssUrl = (u) => "url(\"" + String(u).replace(/["\\]/g, "") + "\")";

  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function say(text, warn) {
    msgEl.textContent = text;
    msgEl.classList.toggle("warn", !!warn);
  }

  function markDirty() {
    dirty = true;
    saveBtn.classList.add("dirty");
  }

  function persist(note) {
    try {
      localStorage.setItem(GAMES_KEY, JSON.stringify(data));
    } catch (err) {
      say("Gagal menyimpan: penyimpanan browser penuh.", true);
      return false;
    }
    if (typeof Notif !== "undefined") Notif.announceChanges(saved, data);
    saved = data.map((g) => ({ ...g }));
    dirty = false;
    saveBtn.classList.remove("dirty");
    clearTimeout(msgTimer);
    msgTimer = setTimeout(() => {
      if (!dirty) say("");
    }, 2500);
    return true;
  }

  window.addEventListener("beforeunload", (e) => {
    if (!dirty) return;
    e.preventDefault();
    e.returnValue = "";
  });

  function move(game, dir) {
    const list = visible();
    const other = list[list.indexOf(game) + dir];
    if (!other) return;
    data.splice(data.indexOf(game), 1);
    const at = data.indexOf(other);
    data.splice(dir < 0 ? at : at + 1, 0, game);
    markDirty();
    render();
  }

  function remove(game) {
    if (!confirm("Hapus " + game.title + "?")) return;
    data.splice(data.indexOf(game), 1);
    markDirty();
    render();
  }

  function mini(label, className, title, onClick, disabled) {
    const b = el("button", "ad-mini " + className, label);
    b.type = "button";
    b.title = title;
    b.disabled = !!disabled;
    b.addEventListener("click", onClick);
    return b;
  }

  function paint(node, game, src) {
    if (game.color) {
      node.style.setProperty("--c1", game.color[0]);
      node.style.setProperty("--c2", game.color[1]);
    }
    if (src) node.style.backgroundImage = cssUrl(src);
    else node.textContent = game.letter || game.title.charAt(0);
  }

  function statusOf(g) {
    if (!isShown(g)) return ["Disembunyikan", "off"];
    if (!g.url) return ["Segera", "soon"];
    return ["Tampil", "on"];
  }

  function makeRow(game, i) {
    const [label, kind] = statusOf(game);
    const row = el("div", "sl-row " + kind + (game.id === selId ? " sel" : ""));
    row.style.setProperty("--i", i);
    row.tabIndex = 0;
    row.setAttribute("role", "option");
    row.setAttribute("aria-selected", game.id === selId);
    row.dataset.id = game.id;

    const th = el("div", "sl-thumb");
    paint(th, game, game.icon || game.bg);
    const txt = el("div", "sl-txt");
    txt.appendChild(el("div", "sl-name", game.title));
    txt.appendChild(el("div", "sl-sub", game.tagline || ""));
    row.append(th, txt, el("span", "sl-pill", label));

    const pick = () => {
      selId = game.id;
      render();
    };
    row.addEventListener("click", pick);
    row.addEventListener("dblclick", () => openForm(game));
    return row;
  }

  function renderDetail(list) {
    const g = data.find((x) => x.id === selId);
    if (!g) {
      listPanel.style.setProperty("--cv", "none");
      const acts0 = el("div", "sl-acts");
      acts0.appendChild(saveBtn);
      detail.replaceChildren(
        el("p", "games-empty", "Pilih game di daftar untuk melihat detailnya."),
        acts0,
      );
      return;
    }
    const idx = data.indexOf(g);
    const [label, kind] = statusOf(g);
    const bgSrc = g.bg || g.icon;
    listPanel.style.setProperty("--cv", bgSrc ? cssUrl(bgSrc) : "none");

    const disc = el("div", "sl-disc" + (isShown(g) ? "" : " dim"));
    paint(disc, g, g.bg || g.icon);
    disc.appendChild(el("span", "sl-hole"));

    const info = el("div", "sl-info");
    info.append(
      el("h2", "sl-title", g.title),
      el("p", "sl-tag", g.tagline || ""),
    );
    const score = el("div", "sl-score");
    const sc = el("div", "sl-score-txt");
    sc.append(el("small", "", "Status"), el("b", "", label));
    score.append(sc, el("span", "sl-rank " + kind, "#" + (idx + 1)));
    info.appendChild(score);

    const stats = el("div", "sl-stats");
    [
      ["#" + (idx + 1), "URUTAN", ""],
      [isShown(g) ? "ON" : "OFF", "BERANDA", isShown(g) ? "hot" : ""],
      [g.url ? "OK" : "\u2014", "LINK", ""],
    ].forEach(([v, k, c]) => {
      const s = el("div", "sl-stat");
      s.append(el("b", "sl-ring " + c, v), el("small", "", k));
      stats.appendChild(s);
    });
    info.appendChild(stats);

    const sw = el("label", "ad-switch");
    const cb = el("input");
    cb.type = "checkbox";
    cb.checked = isShown(g);
    cb.addEventListener("change", () => {
      g.show = cb.checked;
      markDirty();
      render();
    });
    sw.append(cb, el("span", "", "Tampil di beranda"));
    sw.classList.add("sl-sw");

    const pos = list.indexOf(g);
    const acts = el("div", "sl-acts");
    acts.append(
      mini("\u2190", "sq", "Geser lebih awal", () => move(g, -1), pos <= 0),
      mini("\u2192", "sq", "Geser lebih akhir", () => move(g, 1), pos === list.length - 1 || pos < 0),
      mini("Hapus", "danger", "Hapus game", () => remove(g)),
    );
    const edit = el("button", "sl-editbtn", "Edit");
    edit.type = "button";
    edit.addEventListener("click", () => openForm(g));
    info.append(edit, sw);
    acts.appendChild(saveBtn);

    detail.replaceChildren(disc, info, acts);
  }

  function render() {
    const list = visible();
    countEl.textContent = list.length + " game";
    if (!list.some((g) => g.id === selId)) selId = list.length ? list[0].id : null;

    if (!list.length) {
      grid.replaceChildren(
        el(
          "p",
          "games-empty",
          data.length
            ? "Tidak ada game yang cocok."
            : "Belum ada game. Tekan \u201CTambah Game\u201D untuk membuat yang pertama.",
        ),
      );
    } else {
      grid.replaceChildren(...list.map((g, i) => makeRow(g, i)));
      const cur = grid.querySelector(".sel");
      if (cur && !firstRender) cur.scrollIntoView({ block: "nearest" });
    }
    firstRender = false;
    renderDetail(list);
  }

  $("slSearch").addEventListener("input", (e) => {
    query = e.target.value.trim().toLowerCase();
    render();
  });

  grid.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const list = visible();
    const i = list.findIndex((g) => g.id === selId) + (e.key === "ArrowDown" ? 1 : -1);
    if (!list[i]) return;
    selId = list[i].id;
    render();
    const r = grid.querySelector(".sel");
    if (r) r.focus();
  });

  let formRoot = null,
    heading,
    form,
    errEl,
    submitBtn,
    editId = null;
  const f = {};

  function field(key, label, placeholder) {
    const wrap = el("label", "af-field");
    wrap.appendChild(el("span", "", label));
    const input = el("input", "af-input");
    input.type = "text";
    input.autocomplete = "off";
    if (placeholder) input.placeholder = placeholder;
    wrap.appendChild(input);
    f[key] = input;
    form.appendChild(wrap);
  }

  function buildForm() {
    formRoot = el("div", "gd");
    formRoot.setAttribute("aria-hidden", "true");
    const box = el("div", "gd-box af-box");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.tabIndex = -1;

    const close = el("button", "gd-close", "\u2715");
    close.type = "button";
    close.setAttribute("aria-label", "Tutup");
    close.addEventListener("click", closeForm);

    const body = el("div", "gd-body");
    heading = el("h2", "gd-title");
    body.appendChild(heading);

    form = el("form", "af-form");
    field("title", "Judul");
    field("tagline", "Tagline", "Deskripsi singkat");
    field(
      "url",
      "URL game (kosongkan = coming soon)",
      "assets/NamaGame/index.html",
    );
    field("icon", "Ikon (path gambar, opsional)", "assets/Foto/ikon.jpeg");
    field("bg", "Latar (path gambar, opsional)", "assets/Foto/bg.jpeg");

    errEl = el("p", "af-error");
    errEl.setAttribute("role", "alert");
    form.appendChild(errEl);

    const actions = el("div", "gd-actions");
    submitBtn = el("button", "gd-play");
    submitBtn.type = "submit";
    const cancel = el("button", "gd-fav", "Batal");
    cancel.type = "button";
    cancel.addEventListener("click", closeForm);
    actions.appendChild(submitBtn);
    actions.appendChild(cancel);
    form.appendChild(actions);
    form.addEventListener("submit", onSubmit);

    body.appendChild(form);
    box.appendChild(close);
    box.appendChild(body);
    formRoot.appendChild(box);
    document.body.appendChild(formRoot);

    formRoot.addEventListener("click", (e) => {
      if (e.target === formRoot) closeForm();
    });
    formRoot.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Escape") {
        e.preventDefault();
        closeForm();
      }
    });
  }

  function openForm(game) {
    if (!formRoot) buildForm();
    editId = game ? game.id : null;
    f.title.value = game ? game.title : "";
    f.tagline.value = game && game.tagline ? game.tagline : "";
    f.url.value = game && game.url ? game.url : "";
    f.icon.value = game && game.icon ? game.icon : "";
    f.bg.value = game && game.bg ? game.bg : "";
    heading.textContent = game ? "Edit Game" : "Tambah Game";
    submitBtn.textContent = game ? "Simpan Edit" : "Tambah Game";
    errEl.textContent = "";
    formRoot.classList.add("open");
    formRoot.setAttribute("aria-hidden", "false");
    f.title.focus();
  }

  function closeForm() {
    if (!formRoot) return;
    formRoot.classList.remove("open");
    formRoot.setAttribute("aria-hidden", "true");
  }

  function urlOk(u) {
    if (!u) return true;
    if (/[\u0000-\u001f\u007f]/.test(u)) return false;
    if (/^[a-z][a-z0-9+.\-]*:/i.test(u)) return /^https?:\/\//i.test(u);
    return u.indexOf("//") !== 0;
  }

  function onSubmit(e) {
    e.preventDefault();
    const title = f.title.value.trim();
    const url = f.url.value.trim();
    if (!title) {
      errEl.textContent = "Judul wajib diisi.";
      f.title.focus();
      return;
    }
    if (!urlOk(url)) {
      errEl.textContent =
        "URL game tidak valid. Gunakan http(s):// atau path seperti assets/NamaGame/index.html.";
      f.url.focus();
      return;
    }

    const v = {
      title,
      tagline: f.tagline.value.trim() || (url ? "" : "COMING SOON"),
      url: url || null,
      icon: f.icon.value.trim() || undefined,
      bg: f.bg.value.trim() || undefined,
    };

    if (editId) {
      const g = data.find((x) => x.id === editId);
      Object.assign(g, v);
      if (!v.icon) delete g.icon;
      if (!v.bg) delete g.bg;
    } else {
      const id = "game-" + Date.now().toString(36);
      selId = id;
      filter = "all";
      query = "";
      $("slSearch").value = "";
      data.push({
        id,
        letter: title.charAt(0).toUpperCase(),
        color: ["#3da5ff", "#3da5ff"],
        show: true,
        ...v,
      });
    }
    if (persist()) {
      closeForm();
      render();
    }
  }

  $("addBtn").addEventListener("click", () => openForm(null));
  saveBtn.addEventListener("click", () =>
    persist("Tersimpan. Beranda sudah diperbarui."),
  );

  $("resetBtn").addEventListener("click", () => {
    if (!confirm("Kembalikan daftar game ke default?")) return;
    localStorage.removeItem(GAMES_KEY);
    data = DEFAULT_GAMES.map((g) => ({ ...g, show: true }));
    saved = data.map((g) => ({ ...g }));
    dirty = false;
    saveBtn.classList.remove("dirty");
    if (typeof Notif !== "undefined")
      Notif.add({
        type: "reset",
        text: "Daftar game dikembalikan ke pengaturan awal",
      });
    render();
  });

  render();
})();
