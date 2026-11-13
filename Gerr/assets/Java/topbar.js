(function () {
  const host = document.getElementById("topbar");
  if (!host) return;

  const page = host.dataset.page;

  const tabs = [
    { id: "home", label: "Home", href: "Beranda.html" },
    { id: "games", label: "Games", href: "All%20Games.html" },
  ];

  host.className = "topbar";
  host.innerHTML = `

    <nav class="tabs">
      ${tabs
        .map(
          (t) =>
            `<a href="${t.href}" class="tab${t.id === page ? " active" : ""}">${t.label}</a>`,
        )
        .join("")}
    </nav>
    <div class="top-right">
      ${host.dataset.search === "off" ? "" : '<button class="icon-btn" id="searchBtn" type="button" aria-label="Cari">Cari</button>'}
      <button class="icon-btn" id="notifBtn" type="button" aria-label="Notifikasi">Notiv</button>
      <div class="avatar" id="avatarBtn"></div>
      <span class="clock" id="clock">--:--</span>
    </div>`;

  const av = document.getElementById("avatarBtn");
  const right = host.querySelector(".top-right");
  if (!av || !host) return;

  const role = sessionStorage.getItem("gerr:role");
  const name = role === "admin" ? "Admin" : "Guest";

  let pic = null;
  try {
    pic = JSON.parse(sessionStorage.getItem("gerr:avatar"));
  } catch (e) {}
  if (!pic || (!pic.img && !pic.text)) {
    pic = role === "admin" ? { img: "assets/Foto/LogoH.png" } : { text: "G" };
  }
  if (pic.img) {
    const img = document.createElement("img");
    img.src = pic.img;
    img.alt = "";
    av.appendChild(img);
    av.classList.add("has-img");
  } else {
    av.textContent = pic.text;
    av.classList.add("letter");
  }

  const menu = document.createElement("div");
  menu.className = "user-menu";
  menu.hidden = true;
  menu.innerHTML =
    `<p class="um-label">Masuk sebagai</p>
     <p class="um-name">${name}</p>` +
    (role === "admin"
      ? `<a class="um-btn" href="admin.html">Panel Admin</a>`
      : "") +
    `<button type="button" class="um-btn um-out">Logout</button>`;
  host.appendChild(menu);

  av.style.cursor = "pointer";
  av.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
  });
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target)) menu.hidden = true;
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") menu.hidden = true;
  });

  menu.querySelector(".um-out").addEventListener("click", () => {
    sessionStorage.removeItem("gerr:role");
    sessionStorage.removeItem("gerr:avatar");
    location.href = "login.html";
  });
})();
