/* Visual Board — vanilla controller.
   Reads every <section class="visual"> from #source, renders a hero + a
   scrollable reel, and wires a per-visual ⋯ menu: PNG / HTML / approve.
   No build step, no React — add a visual by appending a <section class="visual">
   to the HTML and this picks it up on reload. */
(function () {
  function boot() {
    var source = document.getElementById("source");
    var reel = document.getElementById("reel");
    if (!source || !reel) { return requestAnimationFrame(boot); }
    init(source, reel);
  }
  function init(source, reel) {
  var APPROVED_KEY = "li-vds-board-approved-v1";
  var heroStage = document.getElementById("heroStage");
  var heroType = document.getElementById("heroType");
  var heroBadge = document.getElementById("heroBadge");
  var heroDots = document.getElementById("heroDots");
  var menu = document.getElementById("menu");
  var menuLabel = document.getElementById("menuLabel");
  var toast = document.getElementById("toast");
  var countEl = document.getElementById("count");
  var feedEl = document.getElementById("feed");

  var visuals = [].slice.call(source.querySelectorAll(".visual"));
  var activeIdx = 0;
  var menuIdx = null;
  var approved = load();

  function load() { try { return new Set(JSON.parse(localStorage.getItem(APPROVED_KEY) || "[]")); } catch (e) { return new Set(); } }
  function save() { try { localStorage.setItem(APPROVED_KEY, JSON.stringify([].slice.call(approved))); } catch (e) {} }
  function keyFor(i) { return visuals[i].getAttribute("data-label") || ("visual-" + i); }
  function slug(s) { return (s || "visual").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "visual"; }

  function flash(m) { toast.textContent = m; toast.style.display = "block"; clearTimeout(flash._t); flash._t = setTimeout(function () { toast.style.display = "none"; }, 2800); }

  /* clone an artboard and scale it into a fixed box */
  function mount(into, idx, scale) {
    into.innerHTML = "";
    var art = visuals[idx].querySelector(".artboard").cloneNode(true);
    var wrap = document.createElement("div");
    wrap.style.width = "1080px"; wrap.style.height = "1350px";
    wrap.style.transform = "scale(" + scale + ")"; wrap.style.transformOrigin = "top left";
    wrap.style.pointerEvents = "none";
    wrap.appendChild(art);
    into.appendChild(wrap);
  }

  function renderHero() {
    mount(heroStage, activeIdx, 497 / 1080);
    heroType.textContent = visuals[activeIdx].getAttribute("data-type") || "visual";
    heroBadge.style.display = approved.has(keyFor(activeIdx)) ? "inline-flex" : "none";
  }

  function renderReel() {
    reel.innerHTML = "";
    visuals.forEach(function (v, i) {
      var t = document.createElement("div");
      t.className = "thumb" + (i === activeIdx ? " active" : "");
      var frame = document.createElement("div"); frame.className = "tframe";
      mount(frame, i, 108 / 1080);
      var badge = document.createElement("span"); badge.className = "tbadge"; badge.textContent = "✓";
      badge.style.display = approved.has(keyFor(i)) ? "flex" : "none";
      frame.appendChild(badge);
      // ⋯ on the thumb
      var dots = document.createElement("button"); dots.className = "dots";
      dots.style.cssText = "position:absolute;top:5px;right:5px;width:27px;height:27px;background:rgba(255,255,255,.92)";
      dots.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>';
      dots.addEventListener("click", function (e) { e.stopPropagation(); openMenu(e.currentTarget, i); });
      frame.appendChild(dots);
      var lbl = document.createElement("div"); lbl.className = "lbl"; lbl.textContent = v.getAttribute("data-label") || ("Visual " + (i + 1));
      t.appendChild(frame); t.appendChild(lbl);
      t.addEventListener("click", function () { activeIdx = i; renderHero(); renderReel(); });
      reel.appendChild(t);
    });
    countEl.textContent = visuals.length + " visual" + (visuals.length === 1 ? "" : "s") + " · 1080 × 1350 · export PNG or HTML";
    feedEl.textContent = approved.size + " approved · feeding the system";
  }

  /* ---- menu ---- */
  function openMenu(anchor, idx) {
    menuIdx = idx;
    menuLabel.textContent = keyFor(idx);
    var ap = approved.has(keyFor(idx));
    var apBtn = menu.querySelector('[data-act="approve"]');
    apBtn.querySelector(".ml").textContent = ap ? "Remove from design system" : "Add to design system";
    apBtn.querySelector(".ms").textContent = ap ? "Approved variant" : "Client approved → system learns";
    var r = anchor.getBoundingClientRect();
    menu.style.display = "block";
    menu.style.left = Math.min(r.left, window.innerWidth - 280) + "px";
    menu.style.top = (r.bottom + 6) + "px";
  }
  function closeMenu() { menu.style.display = "none"; menuIdx = null; }
  document.addEventListener("click", closeMenu);
  menu.addEventListener("click", function (e) { e.stopPropagation(); });
  heroDots.addEventListener("click", function (e) { e.stopPropagation(); openMenu(e.currentTarget, activeIdx); });

  menu.querySelectorAll("button").forEach(function (b) {
    b.addEventListener("click", function () {
      var act = b.getAttribute("data-act");
      if (menuIdx == null) return;
      var i = menuIdx; closeMenu();
      if (act === "png") exportPng(i);
      else if (act === "html") exportHtml(i);
      else if (act === "approve") toggleApprove(i);
    });
  });

  function toggleApprove(i) {
    var k = keyFor(i);
    if (approved.has(k)) { approved.delete(k); flash("Removed from the design system"); }
    else { approved.add(k); flash("Added — the design system will learn from this variant"); }
    save(); renderHero(); renderReel();
  }

  /* ---- export ---- */
  function offscreen(i) {
    var holder = document.createElement("div");
    holder.style.cssText = "position:fixed;left:-99999px;top:0;opacity:0;pointer-events:none";
    var art = visuals[i].querySelector(".artboard").cloneNode(true);
    holder.appendChild(art);
    document.body.appendChild(holder);
    return { holder: holder, node: art };
  }
  function exportPng(i) {
    if (!window.htmlToImage) { flash("Export library not loaded"); return; }
    flash("Exporting PNG…");
    var o = offscreen(i);
    window.htmlToImage.toPng(o.node, { width: 1080, height: 1350, pixelRatio: 1, cacheBust: true })
      .then(function (url) { dl(url, slug(keyFor(i)) + ".png"); flash("Exported " + slug(keyFor(i)) + ".png"); })
      .catch(function (e) { console.error(e); flash("Export failed — try again"); })
      .then(function () { o.holder.remove(); });
  }
  function exportHtml(i) {
    var o = offscreen(i);
    var doc = buildDoc(o.node, keyFor(i));
    o.holder.remove();
    var url = URL.createObjectURL(new Blob([doc], { type: "text/html" }));
    dl(url, slug(keyFor(i)) + ".html");
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    flash("Exported " + slug(keyFor(i)) + ".html");
  }
  function dl(href, name) { var a = document.createElement("a"); a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }

  /* inline the resolved :root tokens + signature classes so the HTML is standalone */
  function buildDoc(node, label) {
    var vars = "", classes = "";
    function walk(sheet) {
      var rules; try { rules = sheet.cssRules; } catch (e) { return; }
      if (!rules) return;
      for (var i = 0; i < rules.length; i++) {
        var r = rules[i];
        if (r.styleSheet) walk(r.styleSheet);
        else if (r.selectorText === ":root") vars += r.style.cssText;
        else if (r.selectorText && /^\.(sig-|headline|artboard)/.test(r.selectorText)) classes += r.cssText + "\n";
      }
    }
    for (var s = 0; s < document.styleSheets.length; s++) walk(document.styleSheets[s]);
    vars += document.documentElement.style.cssText;
    return '<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8"><title>' + label + '</title>' +
      '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">' +
      '<style>:root{' + vars + '} html,body{margin:0} body{display:flex;align-items:center;justify-content:center;background:#e6e6e6;min-height:100vh}' + classes + '</style></head>' +
      '<body>' + node.outerHTML + '</body></html>';
  }

  if (!visuals.length) { countEl.textContent = "No visuals yet — add a <section class=\"visual\"> block"; return; }
  renderHero(); renderReel();
  }
  boot();
})();
