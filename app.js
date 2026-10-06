/* Phoebe Glenn Portfolio interactions */

(function () {
  "use strict";

  var PROJECTS = [
    { id: "castle-ivar", nav: "Castle Ivar",    title: "Castle Ivar Editorial" },
    { id: "grlkid",      nav: "Grlkid 001",     title: "Grlkid 001 Editorial" },
    { id: "paper",       nav: "Paper Magazine", title: "Frost Children Are Spiraling Upward" },
    { id: "jrude",       nav: "Jrude",          title: "Jrude \u2018Save Me From Myself\u2019" },
    { id: "lorenzo",     nav: "Lorenzo",        title: "Lorenzo Editorial" },
    { id: "ifeelfree",   nav: "I Feel Free",    title: "\u2018I Feel Free\u2019 nvstalgicc" },
    { id: "misc",        nav: "Miscellaneous",  title: "Miscellaneous" }
  ];

  // Flat lightbox sequence, indices match data-lb attributes in the HTML.
  var ITEMS = [
    { src: "images/castle_ivar_1.0.jpg", p: 0 }, { src: "images/castle_ivar2.jpg", p: 0 },
    { src: "images/castle_ivar3.jpg", p: 0 },    { src: "images/castle_ivar4.jpg", p: 0 },
    { src: "images/grlkid2.jpg", p: 1 }, { src: "images/grlkid1.jpg", p: 1 },
    { src: "images/grlkid3.jpg", p: 1 }, { src: "images/grlkid7.jpg", p: 1 },
    { src: "images/paper1.jpg", p: 2 }, { src: "images/paper2.jpg", p: 2 },
    { src: "images/paper3.jpg", p: 2 },
    { src: "images/jrude1.jpg", p: 3 }, { src: "images/jrude2.jpg", p: 3 },
    { src: "images/jrude3.jpg", p: 3 },
    { src: "images/lorenxaud1.jpg", p: 4 }, { src: "images/lorenxaud2.jpg", p: 4 },
    { src: "images/lorenxaud4.jpg", p: 4 },
    { src: "images/iff1.jpg", p: 5 }, { src: "images/iff2.jpg", p: 5 },
    { src: "images/iff3.jpg", p: 5 },
    { src: "images/img_4114.jpg", p: 6 }, { src: "images/img_4115.jpg", p: 6 },
    { src: "images/img_4116.jpg", p: 6 }, { src: "images/img_4117.jpg", p: 6 },
    { src: "images/img_3878.jpg", p: 6 }, { src: "images/img_3883.jpg", p: 6 },
    { src: "images/img_3901.jpg", p: 6 }, { src: "images/img_3902.jpg", p: 6 },
    { src: "images/sat.jpg", p: 6 },      { src: "images/sway.jpg", p: 6 },
    { src: "images/dscf4036.jpg", p: 6 }, { src: "images/screenshot.jpg", p: 6 }
  ];

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- nav ---------- */

  var navLinks = document.getElementById("navLinks");
  var linkById = {};
  PROJECTS.forEach(function (proj) {
    var a = document.createElement("a");
    a.href = "#" + proj.id;
    a.textContent = proj.nav;
    a.setAttribute("data-nav", proj.id);
    navLinks.appendChild(a);
    linkById[proj.id] = a;
  });
  var contactLink = document.querySelector(".nav-contact");

  function setActive(id) {
    PROJECTS.forEach(function (proj) {
      linkById[proj.id].classList.toggle("active", proj.id === id);
    });
    contactLink.classList.toggle("active", id === "contact");
  }

  var observed = [];
  var heroEl = document.getElementById("top");
  if (heroEl) observed.push(heroEl);
  PROJECTS.forEach(function (proj) {
    var el = document.getElementById(proj.id);
    if (el) observed.push(el);
  });
  observed.push(document.getElementById("contact"));

  // Deterministic active-section detection: the section whose layout
  // center sits nearest the viewport center wins. Layout positions are
  // derived from each panel's own height (immune to sticky offsets),
  // so this stays stable while panels layer over each other.
  var sectionTops = [];
  function measureSections() {
    var acc = 0;
    sectionTops = observed.map(function (el) {
      var h = el.getBoundingClientRect().height;
      var item = { id: el.id, center: acc + h / 2 };
      acc += h;
      return item;
    });
  }
  var navTicking = false;
  function updateActive() {
    navTicking = false;
    var mid = (window.scrollY || window.pageYOffset) + window.innerHeight / 2;
    var best = null, bestDist = Infinity;
    sectionTops.forEach(function (s) {
      var d = Math.abs(s.center - mid);
      if (d < bestDist) { bestDist = d; best = s.id; }
    });
    if (best) setActive(best);
  }
  window.addEventListener("scroll", function () {
    if (!navTicking) { navTicking = true; requestAnimationFrame(updateActive); }
  }, { passive: true });
  window.addEventListener("resize", function () { measureSections(); updateActive(); });
  measureSections();
  updateActive();

  /* ---------- lightbox ---------- */

  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbProject = document.getElementById("lbProject");
  var lbCount = document.getElementById("lbCount");
  var lbNextWork = document.getElementById("lbNextWork");
  var lbNextTitle = document.getElementById("lbNextTitle");
  var current = 0;
  var lastFocus = null;

  function projectImageRange(p) {
    var idx = [];
    ITEMS.forEach(function (it, i) { if (it.p === p) idx.push(i); });
    return idx;
  }

  function render() {
    var item = ITEMS[current];
    var proj = PROJECTS[item.p];
    var range = projectImageRange(item.p);
    var pos = range.indexOf(current);

    lbImg.src = item.src;
    lbImg.alt = proj.title + ", image " + (pos + 1);
    lbProject.textContent = proj.title;
    lbCount.textContent = (pos + 1) + " / " + range.length;

    // On the last image of a project, bridge to the next work.
    if (pos === range.length - 1) {
      var nextProj = PROJECTS[(item.p + 1) % PROJECTS.length];
      lbNextTitle.textContent = nextProj.title;
      lbNextWork.hidden = false;
    } else {
      lbNextWork.hidden = true;
    }
  }

  function openLb(i) {
    current = ((i % ITEMS.length) + ITEMS.length) % ITEMS.length;
    lastFocus = document.activeElement;
    render();
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.getElementById("lbClose").focus();
  }

  function closeLb() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function step(d) {
    current = ((current + d) % ITEMS.length + ITEMS.length) % ITEMS.length;
    render();
  }

  document.querySelectorAll("[data-lb]").forEach(function (el) {
    el.addEventListener("click", function () {
      openLb(parseInt(el.getAttribute("data-lb"), 10));
    });
  });

  document.getElementById("lbClose").addEventListener("click", closeLb);
  document.getElementById("lbPrev").addEventListener("click", function () { step(-1); });
  document.getElementById("lbNext").addEventListener("click", function () { step(1); });

  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
  });

  /* ---------- custom star cursor (desktop pointers only) ---------- */

  if (window.matchMedia("(pointer: fine)").matches) {
    var cursor = document.getElementById("cursor");
    document.body.classList.add("star-cursor");
    var cx = -100, cy = -100, tx = -100, ty = -100, shown = false;

    document.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { shown = true; cursor.classList.add("on"); cx = tx; cy = ty; }
    });
    document.addEventListener("mouseleave", function () {
      shown = false; cursor.classList.remove("on");
    });

    document.addEventListener("mouseover", function (e) {
      if (e.target.closest("a, button")) cursor.classList.add("big");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest("a, button")) cursor.classList.remove("big");
    });

    (function loop() {
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      cursor.style.transform = "translate(" + cx + "px," + cy + "px)";
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- restrained parallax on hero thumbnails ---------- */

  var thumbs = Array.prototype.slice.call(document.querySelectorAll(".thumb"));
  var speeds = [0.06, 0.1, 0.14, 0.08, 0.12, 0.05];
  var ticking = false;

  function parallax() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    if (y > window.innerHeight * 1.5) return;
    thumbs.forEach(function (t, i) {
      t.style.translate = "0 " + Math.round(y * (speeds[i % speeds.length])) + "px";
    });
  }

  if (!reduceMotion && thumbs.length) {
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(parallax); }
    }, { passive: true });
  }
})();
