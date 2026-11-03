(function () {
  const host = document.getElementById("topbar");
  if (!host) return;

  const page = host.dataset.page;

  const tabs = [
    { id: "home",  label: "Home",  href: "Beranda.html" },
    { id: "games", label: "Games", href: "All%20Games.html" },
  ];

  host.className = "topbar";
  host.innerHTML = `
    <nav class="tabs">
      ${tabs.map(t =>
        `<a href="${t.href}" class="tab${t.id === page ? " active" : ""}">${t.label}</a>`
      ).join("")}
    </nav>
    <div class="top-right">
      <button class="icon-btn" id="searchBtn" type="button" aria-label="Cari">Cari</button>
      <button class="icon-btn" id="notifBtn" type="button" aria-label="Notifikasi">Notiv</button>
      <div class="avatar" id="avatarBtn"></div>
      <span class="clock" id="clock">--:--</span>
    </div>`;
})();