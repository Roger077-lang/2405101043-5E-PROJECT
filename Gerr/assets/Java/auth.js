if (document.body.classList.contains("page-login"))
  (function () {
    const ADMIN_PASSWORD = "roger010724";
    const KEY = "gerr:role";
    const AVATAR_KEY = "gerr:avatar";
    const users = [...document.querySelectorAll(".user[data-role]")];
    const pw = document.getElementById("pw"),
      pass = document.getElementById("pass"),
      err = document.getElementById("err");
    const usersBox = document.getElementById("users");
    const count = users.length;
    const half = Math.floor(count / 2);
    let cur = Math.max(
      0,
      users.findIndex((u) => u.classList.contains("sel")),
    );
    let prevOff = [];

    function layout() {
      users.forEach((u, k) => {
        const off = ((((k - cur + half) % count) + count) % count) - half;
        const abs = Math.abs(off);
        const wrap = prevOff[k] !== undefined && Math.abs(off - prevOff[k]) > 1;
        if (wrap) u.classList.add("jump");
        u.style.setProperty("--off", off);
        u.style.setProperty("--s", Math.max(0.45, 1 - 0.28 * abs));
        u.style.setProperty("--o", abs > 2 ? 0 : 1 - 0.4 * abs);
        u.style.zIndex = 10 - abs;
        u.style.pointerEvents = abs > 2 ? "none" : "auto";
        if (wrap) {
          void u.offsetWidth;
          u.classList.remove("jump");
        }
        prevOff[k] = off;
      });
    }

    function pick(i) {
      cur = ((i % count) + count) % count;
      users.forEach((u, k) => u.classList.toggle("sel", k === cur));
      layout();
      const admin = users[cur].dataset.role === "admin";
      pw.classList.toggle("on", admin);
      err.textContent = "";
      pass.blur();
    }

    function saveAvatar(user) {
      const av = user.querySelector(".av");
      const img = av && av.querySelector("img");
      const data = img
        ? { img: img.getAttribute("src") }
        : { text: av ? av.textContent.trim() : "" };
      sessionStorage.setItem(AVATAR_KEY, JSON.stringify(data));
    }

    function enter() {
      const role = users[cur].dataset.role;
      if (role === "guest") {
        sessionStorage.setItem(KEY, "guest");
        saveAvatar(users[cur]);
        location.href = "Beranda.html";
        return;
      }
      if (role !== "admin") return;
      if (document.activeElement !== pass) {
        pass.focus();
        return;
      }
      if (pass.value === ADMIN_PASSWORD) {
        sessionStorage.setItem(KEY, "admin");
        saveAvatar(users[cur]);
        location.href = "admin.html";
      } else {
        pass.select();
      }
    }

    users.forEach((u, k) =>
      u.addEventListener("click", () => {
        if (k === cur && u.dataset.role === "guest") enter();
        else pick(k);
      }),
    );

    let touchX = null;
    usersBox.addEventListener(
      "touchstart",
      (e) => (touchX = e.touches[0].clientX),
      { passive: true },
    );
    usersBox.addEventListener("touchend", (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 40) pick(cur + (dx < 0 ? 1 : -1));
    });
    pick(cur);
    pw.addEventListener("submit", (e) => {
      e.preventDefault();
      enter();
    });
    document.addEventListener("keydown", (e) => {
      if (e.target === pass) {
        if (e.key === "Escape")
          return pick(users.findIndex((u) => u.dataset.role === "guest"));
        if (pass.value !== "" || !e.key.startsWith("Arrow")) return;
        e.preventDefault();
      }
      if (e.key === "ArrowRight") pick(cur + 1);
      if (e.key === "ArrowLeft") pick(cur - 1);
      if (e.key === "Enter") {
        e.preventDefault();
        enter();
      }
    });
    const clock = document.getElementById("clock");
    (function t() {
      clock.textContent = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
      setTimeout(t, 10000);
    })();
    sessionStorage.removeItem(KEY);
    sessionStorage.removeItem(AVATAR_KEY);
  })();

if (document.body.classList.contains("page-admin"))
  (function () {
    if (sessionStorage.getItem(ROLE_KEY) !== "admin")
      location.replace("login.html");
    let data = ALL_GAMES.map((g) => ({ ...g })),
      editId = null;
    const $ = (id) => document.getElementById(id),
      list = $("list"),
      esc = (s) =>
        String(s ?? "").replace(
          /[&<>"]/g,
          (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
        );
    let saved = data.map((g) => ({ ...g }));
    function persist(note) {
      localStorage.setItem(GAMES_KEY, JSON.stringify(data));
      if (typeof Notif !== "undefined") Notif.announceChanges(saved, data);
      saved = data.map((g) => ({ ...g }));
      $("msg").textContent = note || "Tersimpan.";
      setTimeout(() => ($("msg").textContent = ""), 2000);
    }
    function render() {
      if (!data.length) {
        list.innerHTML = '<p class="empty">Belum ada game.</p>';
        return;
      }
      list.innerHTML = data
        .map(
          (g, i) => `<div class="row" data-i="${i}">
      <div class="ic">${g.icon ? `<img src="${esc(g.icon)}" alt="">` : esc(g.letter || g.title[0])}</div>
      <div class="meta"><b>${esc(g.title)}</b><span>${esc(g.tagline) || "-"} &middot; ${g.url ? "Bisa dimainkan" : "Coming soon"}</span></div>
      <label class="tog"><input type="checkbox" data-a="show" ${g.show !== false ? "checked" : ""}>Tampil di beranda</label>
      <div class="acts"><button data-a="up" title="Naik">&uarr;</button><button data-a="down" title="Turun">&darr;</button><button data-a="edit">Edit</button><button class="del" data-a="del">Hapus</button></div>
    </div>`,
        )
        .join("");
    }
    list.addEventListener("click", (e) => {
      const b = e.target.closest("[data-a]");
      if (!b) return;
      const i = +b.closest(".row").dataset.i,
        a = b.dataset.a;
      if (a === "show") {
        data[i].show = b.checked;
        return;
      }
      if (a === "up" && i > 0) {
        [data[i - 1], data[i]] = [data[i], data[i - 1]];
      }
      if (a === "down" && i < data.length - 1) {
        [data[i + 1], data[i]] = [data[i], data[i + 1]];
      }
      if (a === "del" && confirm("Hapus " + data[i].title + "?")) {
        data.splice(i, 1);
      }
      if (a === "edit") {
        const g = data[i];
        editId = g.id;
        $("f-title").value = g.title;
        $("f-tag").value = g.tagline || "";
        $("f-url").value = g.url || "";
        $("f-icon").value = g.icon || "";
        $("f-bg").value = g.bg || "";
        $("ftitle").textContent = "Edit game";
        $("fbtn").textContent = "Simpan edit";
        $("fcancel").hidden = false;
        $("f-title").focus();
        return;
      }
      render();
    });
    $("save").onclick = () => persist("Tersimpan. Beranda sudah diperbarui.");
    $("reset").onclick = () => {
      if (confirm("Kembalikan daftar game ke default?")) {
        localStorage.removeItem(GAMES_KEY);
        data = DEFAULT_GAMES.map((g) => ({ ...g, show: true }));
        saved = data.map((g) => ({ ...g }));
        if (typeof Notif !== "undefined")
          Notif.add({
            type: "reset",
            text: "Daftar game dikembalikan ke pengaturan awal",
          });
        render();
      }
    };
    function clearForm() {
      editId = null;
      $("form").reset();
      $("ftitle").textContent = "Tambah game baru";
      $("fbtn").textContent = "Tambah game";
      $("fcancel").hidden = true;
    }
    $("fcancel").onclick = clearForm;
    $("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const v = {
        title: $("f-title").value.trim(),
        tagline: $("f-tag").value.trim() || "COMING SOON",
        url: $("f-url").value.trim() || null,
        icon: $("f-icon").value.trim() || undefined,
        bg: $("f-bg").value.trim() || undefined,
      };
      if (!v.title) return;
      if (editId) {
        const g = data.find((x) => x.id === editId);
        Object.assign(g, v);
        if (!v.icon) delete g.icon;
        if (!v.bg) delete g.bg;
      } else
        data.push({
          id: "game-" + Date.now().toString(36),
          letter: v.title[0].toUpperCase(),
          color: ["#3da5ff", "#3da5ff"],
          show: true,
          ...v,
        });
      clearForm();
      persist();
      render();
    });
    $("out").onclick = () => {
      sessionStorage.removeItem(ROLE_KEY);
      location.href = "login.html";
    };
    render();
  })();
