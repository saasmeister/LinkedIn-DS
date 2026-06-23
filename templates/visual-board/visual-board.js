/* Visual Board — vanilla controller.

   Data model (in the HTML, under #source):
     <section class="visual">            ONE visual = one reel entry
       <div class="round"> A  B[chosen]  C </div>   an iteration = 3 variants
       <div class="round"> A[chosen]  B  C </div>    the next iteration
     </section>

   · The REEL shows one thumb per <section> — its latest chosen variant —
     with a badge counting every variant in the visual's history.
   · The CANVAS shows the focused variant big, plus a TIMELINE of all rounds
     so you can iterate further (pick a variant → it becomes the round's chosen).
   No build step, no React — append a <div class="round"> of three variants and
   this picks it up on reload. */
(function () {
  function boot() {
    var source = document.getElementById("source");
    var reel = document.getElementById("reel");
    if (!source || !reel) { return requestAnimationFrame(boot); }
    init(source, reel);
  }

  function init(source, reel) {
  var APPROVED_KEY = "li-vds-board-approved-v1";
  var CHOSEN_KEY = "li-vds-board-chosen-v1";
  var heroStage = document.getElementById("heroStage");
  var heroType = document.getElementById("heroType");
  var heroVer = document.getElementById("heroVer");
  var heroChosen = document.getElementById("heroChosen");
  var heroBadge = document.getElementById("heroBadge");
  var heroDots = document.getElementById("heroDots");
  var timelineEl = document.getElementById("timeline");
  var tlsub = document.getElementById("tlsub");
  var menu = document.getElementById("menu");
  var menuLabel = document.getElementById("menuLabel");
  var toast = document.getElementById("toast");
  var countEl = document.getElementById("count");
  var feedEl = document.getElementById("feed");

  /* ---- build the model ---- */
  var visuals = [].slice.call(source.querySelectorAll(".visual")).map(function (sec, vi) {
    var rounds = [].slice.call(sec.querySelectorAll(".round")).map(function (rd) {
      return [].slice.call(rd.querySelectorAll(".artboard"));
    });
    if (!rounds.length) { // fallback: loose artboards = one round
      var loose = [].slice.call(sec.querySelectorAll(".artboard"));
      if (loose.length) rounds = [loose];
    }
    return {
      el: sec,
      label: sec.getAttribute("data-label") || ("Visual " + (vi + 1)),
      type: sec.getAttribute("data-type") || "visual",
      rounds: rounds
    };
  }).filter(function (v) { return v.rounds.length; });

  var chosenStore = loadJSON(CHOSEN_KEY, {});   // { "label#round": variantIdx }
  var approved = new Set(loadJSON(APPROVED_KEY, []));
  var activeIdx = 0;
  var focus = { round: 0, variant: 0 };         // which artboard is in the hero
  var menuTarget = null;                        // {round, variant} for the menu

  function loadJSON(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function saveJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function slug(s) { return (s || "visual").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "visual"; }
  function flash(m) { toast.textContent = m; toast.style.display = "block"; clearTimeout(flash._t); flash._t = setTimeout(function () { toast.style.display = "none"; }, 2800); }

  /* chosen variant index for a given visual + round (store overrides the data-chosen attr) */
  function chosenOf(vi, ri) {
    var key = visuals[vi].label + "#" + ri;
    if (chosenStore[key] != null) return chosenStore[key];
    var arr = visuals[vi].rounds[ri];
    for (var i = 0; i < arr.length; i++) if (arr[i].hasAttribute("data-chosen")) return i;
    return 0;
  }
  function setChosen(vi, ri, varIdx) { chosenStore[visuals[vi].label + "#" + ri] = varIdx; saveJSON(CHOSEN_KEY, chosenStore); }
  function lastRound(vi) { return visuals[vi].rounds.length - 1; }
  function variantCount(vi) { return visuals[vi].rounds.reduce(function (n, r) { return n + r.length; }, 0); }
  function artboardAt(vi, ri, varIdx) { return visuals[vi].rounds[ri][varIdx]; }

  /* clone an artboard and scale it into a fixed box */
  function mount(into, node, scale) {
    into.innerHTML = "";
    var art = node.cloneNode(true);
    var wrap = document.createElement("div");
    wrap.style.width = "1080px"; wrap.style.height = "1350px";
    wrap.style.transform = "scale(" + scale + ")"; wrap.style.transformOrigin = "top left";
    wrap.style.pointerEvents = "none";
    wrap.appendChild(art);
    into.appendChild(wrap);
  }

  /* ---- hero ---- */
  function renderHero() {
    var v = visuals[activeIdx];
    var node = artboardAt(activeIdx, focus.round, focus.variant);
    mount(heroStage, node, 497 / 1080);
    heroType.textContent = v.type;
    heroVer.innerHTML = "v<b>" + (focus.round + 1) + "</b> · variant <b>" + letter(focus.variant) + "</b>";
    var isChosen = focus.variant === chosenOf(activeIdx, focus.round);
    heroChosen.style.display = isChosen ? "inline-flex" : "none";
    heroBadge.style.display = approved.has(v.label) ? "inline-flex" : "none";
  }
  function letter(i) { return String.fromCharCode(65 + i); }

  /* ---- timeline (history of the active visual) ---- */
  function renderTimeline() {
    var v = visuals[activeIdx];
    timelineEl.innerHTML = "";
    tlsub.textContent = "“" + v.label + "” · " + v.rounds.length + " version" + (v.rounds.length === 1 ? "" : "s") + " · " + variantCount(activeIdx) + " variants";
    v.rounds.forEach(function (variants, ri) {
      if (ri > 0) {
        var arr = document.createElement("div"); arr.className = "arrow";
        arr.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        timelineEl.appendChild(arr);
      }
      var round = document.createElement("div"); round.className = "round";
      var ch = chosenOf(activeIdx, ri);
      var head = document.createElement("div"); head.className = "rh";
      head.innerHTML = '<span class="rv">v' + (ri + 1) + '</span><span class="rn">picked ' + letter(ch) + '</span>';
      round.appendChild(head);
      var vars = document.createElement("div"); vars.className = "vars";
      variants.forEach(function (node, varIdx) {
        var cell = document.createElement("div");
        cell.className = "tlvar" + (varIdx === ch ? " chosen" : "") + ((ri === focus.round && varIdx === focus.variant) ? " focused" : "");
        mount(cell, node, 62 / 1080);
        var ck = document.createElement("span"); ck.className = "ck";
        ck.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        cell.appendChild(ck);
        var vk = document.createElement("span"); vk.className = "vk"; vk.textContent = letter(varIdx);
        cell.appendChild(vk);
        cell.addEventListener("click", function (e) {
          focus = { round: ri, variant: varIdx };
          renderHero(); renderTimeline();
        });
        cell.addEventListener("contextmenu", function (e) { e.preventDefault(); openMenu(cell, ri, varIdx); });
        vars.appendChild(cell);
      });
      round.appendChild(vars);
      timelineEl.appendChild(round);
    });
    // "next iteration" affordance
    var arr2 = document.createElement("div"); arr2.className = "arrow";
    arr2.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
    timelineEl.appendChild(arr2);
    var next = document.createElement("div"); next.className = "round next";
    next.innerHTML = '<div class="plus"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></div><div class="nt">Iterate<br>3 new variants</div>';
    next.title = "Ask the assistant for the next round — three fresh variants off the chosen one.";
    timelineEl.appendChild(next);
  }

  /* ---- reel (one entry per visual) ---- */
  function renderReel() {
    reel.innerHTML = "";
    visuals.forEach(function (v, i) {
      var ri = lastRound(i), ch = chosenOf(i, ri);
      var t = document.createElement("div");
      t.className = "thumb" + (i === activeIdx ? " active" : "") + (approved.has(v.label) ? " approved" : "");
      var frame = document.createElement("div"); frame.className = "tframe";
      mount(frame, artboardAt(i, ri, ch), 108 / 1080);
      // count badge — variants in this visual's history
      var cbadge = document.createElement("span"); cbadge.className = "cbadge";
      cbadge.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line></svg><span>' + variantCount(i) + '</span>';
      cbadge.title = variantCount(i) + " variants across " + v.rounds.length + " version" + (v.rounds.length === 1 ? "" : "s");
      frame.appendChild(cbadge);
      var abadge = document.createElement("span"); abadge.className = "abadge";
      abadge.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      frame.appendChild(abadge);
      // ⋯ on the thumb → opens menu on the visual's chosen variant
      var dots = document.createElement("button"); dots.className = "dots";
      dots.style.cssText = "position:absolute;top:5px;right:5px;width:27px;height:27px;background:rgba(255,255,255,.92)";
      dots.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>';
      dots.addEventListener("click", function (e) { e.stopPropagation(); activeIdx = i; focus = { round: ri, variant: ch }; renderHero(); renderTimeline(); renderReel(); openMenu(e.currentTarget, ri, ch); });
      frame.appendChild(dots);
      var lbl = document.createElement("div"); lbl.className = "lbl"; lbl.textContent = v.label;
      t.appendChild(frame); t.appendChild(lbl);
      t.addEventListener("click", function () { activeIdx = i; var lr = lastRound(i); focus = { round: lr, variant: chosenOf(i, lr) }; renderHero(); renderTimeline(); renderReel(); });
      reel.appendChild(t);
    });
    countEl.textContent = visuals.length + " visual" + (visuals.length === 1 ? "" : "s") + " · 1080 × 1350 · export PNG or HTML";
    feedEl.textContent = approved.size + " approved · feeding the system";
  }

  /* ---- menu ---- */
  function openMenu(anchor, ri, varIdx) {
    menuTarget = { round: ri, variant: varIdx };
    var v = visuals[activeIdx];
    menuLabel.textContent = v.label + " · v" + (ri + 1) + " " + letter(varIdx);
    var isChosen = varIdx === chosenOf(activeIdx, ri);
    var chBtn = menu.querySelector('[data-act="choose"]');
    chBtn.style.display = isChosen ? "none" : "flex";
    var ap = approved.has(v.label);
    var apBtn = menu.querySelector('[data-act="approve"]');
    apBtn.querySelector(".ml").textContent = ap ? "Remove from design system" : "Add to design system";
    apBtn.querySelector(".ms").textContent = ap ? "Approved variant" : "Client approved → system learns";
    var r = anchor.getBoundingClientRect();
    menu.style.display = "block";
    menu.style.left = Math.min(r.left, window.innerWidth - 280) + "px";
    menu.style.top = Math.min(r.bottom + 6, window.innerHeight - 240) + "px";
  }
  function closeMenu() { menu.style.display = "none"; menuTarget = null; }
  document.addEventListener("click", closeMenu);
  menu.addEventListener("click", function (e) { e.stopPropagation(); });
  heroDots.addEventListener("click", function (e) { e.stopPropagation(); openMenu(e.currentTarget, focus.round, focus.variant); });

  menu.querySelectorAll("button").forEach(function (b) {
    b.addEventListener("click", function () {
      var act = b.getAttribute("data-act");
      if (!menuTarget) return;
      var ri = menuTarget.round, varIdx = menuTarget.variant; closeMenu();
      if (act === "png") exportPng(ri, varIdx);
      else if (act === "html") exportHtml(ri, varIdx);
      else if (act === "choose") chooseVariant(ri, varIdx);
      else if (act === "approve") toggleApprove();
    });
  });

  function chooseVariant(ri, varIdx) {
    setChosen(activeIdx, ri, varIdx);
    flash("Picked variant " + letter(varIdx) + " for v" + (ri + 1));
    renderHero(); renderTimeline(); renderReel();
  }
  function toggleApprove() {
    var k = visuals[activeIdx].label;
    if (approved.has(k)) { approved.delete(k); flash("Removed from the design system"); }
    else { approved.add(k); flash("Added — the design system will learn from this variant"); }
    saveJSON(APPROVED_KEY, [].slice.call(approved));
    renderHero(); renderReel();
  }

  /* ---- export (the focused / targeted variant) ---- */
  function nameFor(ri, varIdx) { return slug(visuals[activeIdx].label) + "-v" + (ri + 1) + letter(varIdx).toLowerCase(); }
  function offscreen(node) {
    var holder = document.createElement("div");
    holder.style.cssText = "position:fixed;left:-99999px;top:0;opacity:0;pointer-events:none";
    var art = node.cloneNode(true);
    holder.appendChild(art);
    document.body.appendChild(holder);
    return { holder: holder, node: art };
  }
  function exportPng(ri, varIdx) {
    if (!window.htmlToImage) { flash("Export library not loaded"); return; }
    flash("Exporting PNG…");
    var o = offscreen(artboardAt(activeIdx, ri, varIdx)), nm = nameFor(ri, varIdx);
    window.htmlToImage.toPng(o.node, { width: 1080, height: 1350, pixelRatio: 1, cacheBust: true })
      .then(function (url) { dl(url, nm + ".png"); flash("Exported " + nm + ".png"); })
      .catch(function (e) { console.error(e); flash("Export failed — try again"); })
      .then(function () { o.holder.remove(); });
  }
  function exportHtml(ri, varIdx) {
    var o = offscreen(artboardAt(activeIdx, ri, varIdx)), nm = nameFor(ri, varIdx);
    var doc = buildDoc(o.node, visuals[activeIdx].label);
    o.holder.remove();
    var url = URL.createObjectURL(new Blob([doc], { type: "text/html" }));
    dl(url, nm + ".html");
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    flash("Exported " + nm + ".html");
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
  var lr = lastRound(0); focus = { round: lr, variant: chosenOf(0, lr) };
  renderHero(); renderTimeline(); renderReel();
  }
  boot();
})();
