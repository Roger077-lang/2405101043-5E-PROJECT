const GameDialog = (() => {
  const PLAY_LABEL = "Play";
 
  let root, box, hero, art, logo, titleEl, tagEl, metaEl, descEl, playBtn, favBtn, closeBtn;
  let current = null;
  let lastFocus = null;
 
  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }
 
  /* Popup */
  function build() {
    root = el("div", "gd");
    root.setAttribute("aria-hidden", "true");
 
    box = el("div", "gd-box");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.tabIndex = -1;
 
    closeBtn = el("button", "gd-close", "\u2715");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Tutup");
 
    hero    = el("div", "gd-hero");
    art     = el("div", "gd-art");
    logo    = el("div", "gd-logo");
    logo.setAttribute("aria-hidden", "true");
    hero.appendChild(art);
    hero.appendChild(logo);
    titleEl = el("h2", "gd-title");
    tagEl   = el("p", "gd-tagline");
    metaEl  = el("div", "gd-meta");
    descEl  = el("p", "");
 
    playBtn = el("button", "gd-play");
    playBtn.type = "button";
    favBtn = el("button", "gd-fav");
    favBtn.type = "button";
 
    const actions = el("div", "gd-actions");
    actions.appendChild(playBtn);
    actions.appendChild(favBtn);
 
    const body = el("div", "gd-body");
    body.appendChild(titleEl);
    body.appendChild(tagEl);
    body.appendChild(metaEl);
    body.appendChild(descEl);
    body.appendChild(actions);
 
    box.appendChild(closeBtn);
    box.appendChild(hero);
    box.appendChild(body);
    root.appendChild(box);
    document.body.appendChild(root);
 
    titleEl.id = "gdTitle";
    box.setAttribute("aria-labelledby", "gdTitle");
 
    /* kontrol */
    closeBtn.addEventListener("click", close);
    root.addEventListener("click", e => { if (e.target === root) close(); });
    playBtn.addEventListener("click", play);
    favBtn.addEventListener("click", toggleFav);
 
    root.addEventListener("keydown", e => {
      e.stopPropagation();
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key === "Tab") {                                  // fokus berputar di dalam popup
        const items = [closeBtn, playBtn, favBtn].filter(b => !b.disabled);
        const i = items.indexOf(document.activeElement);
        const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1)
                                : (i === items.length - 1 ? 0 : i + 1);
        e.preventDefault();
        items[next].focus();
      }
    });
 
    ["wheel", "touchstart", "touchend"].forEach(type =>
      root.addEventListener(type, e => e.stopPropagation(), { passive: true })
    );
  }
 
  /* Isi Popup */
  function paintFav() {
    const on = Store.favorites.has(current.id);
    favBtn.textContent = on ? "\u2665" : "\u2661";
    favBtn.classList.toggle("on", on);
    favBtn.setAttribute("aria-pressed", on);
  }
 
  function fill(game) {
    art.textContent = "";
    art.style.backgroundImage = "";
    if (game.color) {
      art.style.setProperty("--c1", game.color[0]);
      art.style.setProperty("--c2", game.color[1]);
    }
    const image = game.bg || game.icon;
    if (image) art.style.backgroundImage = "url('" + image + "')";
    else art.textContent = game.letter || game.title.charAt(0);

    logo.textContent = "";
    logo.style.backgroundImage = "";
    if (game.color){
      logo.style.setProperty("--c1", game.color[0]);
      logo.style.setProperty("--c2", game.color[1]);
    }
    if (game.icon) logo.style.backgroundImage = "url('" + game.icon + "')";
    else logo.textContent = game.letter || game.title.charAt(0);
 
    titleEl.textContent = game.title;
    tagEl.textContent = game.tagline || "";
 
    const chips = [];
    chips.push(game.url ? el("span", "gd-chip ok", "Tersedia")
                        : el("span", "gd-chip soon", "Segera hadir"));
    if (game.genre) chips.push(el("span", "gd-chip", game.genre));
    if (Store.history.has(game.id)) {
      chips.push(el("span", "gd-chip", "Dimainkan " + Store.history.ago(game.id)));
    }
    metaEl.replaceChildren(...chips);
 
    const desc = game.desc || (game.url ? "" : "Game ini sedang dalam pengembangan.");
    descEl.textContent = desc;
    descEl.hidden = !desc;
 
    playBtn.textContent = game.url ? PLAY_LABEL : "Belum tersedia";
    playBtn.disabled = !game.url;
    paintFav();
  }
 
  /* Play */
  function play() {
    if (!current || !current.url) return;
    const id = current.id;
    close();
    if (typeof window.playGame === "function") {
      window.playGame(id);
    } else {
      location.href = "Beranda.html?game=" + encodeURIComponent(id) + "&play=1";
    }
  }
 
  function toggleFav() {
    if (!current) return;
    Store.favorites.toggle(current.id);
    paintFav();
    favBtn.classList.remove("pop");
    void favBtn.offsetWidth;
    favBtn.classList.add("pop");
    window.dispatchEvent(new CustomEvent("favorites-changed", { detail: { id: current.id } }));
  }
 
  /* Transisi */
  function open(id) {
    const game = GAMES.find(g => g.id === id);
    if (!game || document.body.classList.contains("playing")) return;
    if (!root) build();
 
    current = game;
    lastFocus = document.activeElement;
    fill(game);
    box.scrollTop = 0;
    root.classList.add("open");
    root.setAttribute("aria-hidden", "false");
    (playBtn.disabled ? favBtn : playBtn).focus();
  }
 
  function close() {
    if (!root || !root.classList.contains("open")) return;
    root.classList.remove("open");
    root.setAttribute("aria-hidden", "true");
    current = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
 
  return { open, close };
})();