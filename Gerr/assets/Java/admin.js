(function () {
  if (sessionStorage.getItem(ROLE_KEY) !== "admin") {
    location.replace("login.html");
    return;
  }

  const $ = (id) => document.getElementById(id);
  const grid = $("adminGrid");
  const countEl = $("adminCount");
  const msgEl = $("adminMsg");
  const saveBtn = $("saveBtn");

  let data = ALL_GAMES.map((g) => ({ ...g }));
  let saved = data.map((g) => ({ ...g }));
  let filter = "all";
  let dirty = false;
  let firstRender = true;
  let msgTimer = null;

  const isShown = (g) => g.show !== false;
  const visible = () =>
    data.filter((g) => filter === "all" || (filter === "on") === isShown(g));

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

  function makeCard(game, i, list) {
    const card = el(
      "div",
      "card" + (game.url ? "" : " soon") + (isShown(game) ? "" : " is-hidden"),
    );
    card.style.setProperty("--i", i);

    const link = el("div", "card-link");
    link.tabIndex = 0;
    link.setAttribute("role", "button");
    link.setAttribute("aria-label", "Edit " + game.title);
    link.addEventListener("click", () => openForm(game));
    link.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openForm(game);
      }
    });

    const art = el("div", "card-art");
    if (game.color) {
      art.style.setProperty("--c1", game.color[0]);
      art.style.setProperty("--c2", game.color[1]);
    }
    if (game.icon) art.style.backgroundImage = "url('" + game.icon + "')";
    else art.textContent = game.letter || game.title.charAt(0);
    if (!isShown(game))
      art.appendChild(el("span", "card-badge hide", "Disembunyikan"));
    else if (!game.url) art.appendChild(el("span", "card-badge", "Segera"));

    const body = el("div", "card-body");
    body.appendChild(el("div", "card-title", game.title));
    body.appendChild(el("div", "card-tag", game.tagline || ""));

    link.appendChild(art);
    link.appendChild(body);
    card.appendChild(link);

    const tools = el("div", "ad-tools");

    const sw = el("label", "ad-switch");
    const cb = el("input");
    cb.type = "checkbox";
    cb.checked = isShown(game);
    cb.addEventListener("change", () => {
      game.show = cb.checked;
      markDirty();
      render();
    });
    sw.appendChild(cb);
    sw.appendChild(el("span", "", "Tampil di beranda"));
    tools.appendChild(sw);

    const row = el("div", "ad-row");
    row.appendChild(
      mini("\u2190", "sq", "Geser lebih awal", () => move(game, -1), i === 0),
    );
    row.appendChild(
      mini(
        "\u2192",
        "sq",
        "Geser lebih akhir",
        () => move(game, 1),
        i === list.length - 1,
      ),
    );
    row.appendChild(mini("Edit", "", "Edit game", () => openForm(game)));
    row.appendChild(mini("Hapus", "danger", "Hapus game", () => remove(game)));
    tools.appendChild(row);

    card.appendChild(tools);
    return card;
  }

  function render() {
    const list = visible();
    countEl.textContent = list.length + " game";

    const counts = {
      all: data.length,
      on: data.filter(isShown).length,
      off: data.filter((g) => !isShown(g)).length,
    };

    if (!list.length) {
      grid.replaceChildren(
        el(
          "p",
          "games-empty",
          filter === "all"
            ? "Belum ada game. Tekan \u201CTambah Game\u201D untuk membuat yang pertama."
            : "Tidak ada game di filter ini.",
        ),
      );
    } else {
      grid.replaceChildren(...list.map((g, i) => makeCard(g, i, list)));
    }

    if (firstRender) {
      firstRender = false;
      setTimeout(() => grid.classList.add("static"), 900);
    }
  }

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
      data.push({
        id: "game-" + Date.now().toString(36),
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
