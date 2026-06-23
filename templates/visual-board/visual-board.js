/* Visual Board — vanilla controller.

   Data model (in the HTML, under #source):
     <section class="visual">            ONE visual = one reel entry
       <div class="round"> A  B[chosen]  C </div>   an iteration = 3 variants
       <div class="round"> A[chosen]  B  C </div>    the next iteration
     </section>

   · REEL = one thumb per <section> (its latest chosen variant) + count badge.
   · CANVAS = focused variant big (fills remaining height); BOTTOM DOCK pins the
     iteration timeline + reel so the visual never gets squeezed.
   · EDIT mode (board-editor.js) = Canva-style drag / resize / drop on the hero;
     edits persist per variant and the assistant can iterate over them.
   · "+ New visual" / "Iterate" open the Brief Studio slide-over. */
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
  var EDITS_KEY = "li-vds-board-edits-v1";
  var heroStage = document.getElementById("heroStage");
  var stageEl = document.getElementById("stage");
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
    if (!rounds.length) { var loose = [].slice.call(sec.querySelectorAll(".artboard")); if (loose.length) rounds = [loose]; }
    return { el: sec, label: sec.getAttribute("data-label") || ("Visual " + (vi + 1)), type: sec.getAttribute("data-type") || "visual", rounds: rounds };
  }).filter(function (v) { return v.rounds.length; });

  var chosenStore = loadJSON(CHOSEN_KEY, {});
  var approved = new Set(loadJSON(APPROVED_KEY, []));
  var editsStore = loadJSON(EDITS_KEY, {});       // { "label#round#variant": editedInnerHTML }
  var activeIdx = 0;
  var focus = { round: 0, variant: 0 };
  var menuTarget = null;
  var editing = false;
  var heroArt = null, heroScale = 1;
  var zoom = 1;   // 1 = fit-to-stage; user can zoom in/out

  function loadJSON(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function saveJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function slug(s) { return (s || "visual").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "visual"; }
  function flash(m) { toast.textContent = m; toast.style.display = "block"; clearTimeout(flash._t); flash._t = setTimeout(function () { toast.style.display = "none"; }, 2800); }
  function letter(i) { return String.fromCharCode(65 + i); }

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
  function editKey(vi, ri, varIdx) { return visuals[vi].label + "#" + ri + "#" + varIdx; }

  /* fresh artboard clone with any persisted edits applied */
  function makeClone(vi, ri, varIdx) {
    var src = visuals[vi].rounds[ri][varIdx];
    var c = src.cloneNode(true);
    var ed = editsStore[editKey(vi, ri, varIdx)];
    if (ed != null) c.innerHTML = ed;
    return c;
  }
  /* scaled, non-interactive mount for thumbnails */
  function mountThumb(into, vi, ri, varIdx, scale) {
    into.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.style.cssText = "width:1080px;height:1350px;transform:scale(" + scale + ");transform-origin:top left;pointer-events:none";
    wrap.appendChild(makeClone(vi, ri, varIdx));
    into.appendChild(wrap);
  }

  /* ---- hero (responsive: fills the stage above the dock) ---- */
  function renderHero() {
    var v = visuals[activeIdx];
    var availH = stageEl.clientHeight - 92;     // top padding/bar (-34) + bottom hint room
    var availW = stageEl.clientWidth - 48;
    var fit = Math.min(availW / 1080, availH / 1350); // scale that fits BOTH dimensions
    if (!(fit > 0)) fit = 0.3;
    var s = Math.max(0.04, fit * zoom);
    var w = 1080 * s, h = 1350 * s;
    heroStage.style.width = Math.round(w) + "px"; heroStage.style.height = Math.round(h) + "px";
    var zp = document.getElementById("zoomPct"); if (zp) zp.textContent = Math.round(s * 100) + "%";
    heroStage.innerHTML = "";
    var art = makeClone(activeIdx, focus.round, focus.variant);
    var wrap = document.createElement("div");
    wrap.className = "artscale";
    wrap.style.cssText = "width:1080px;height:1350px;transform:scale(" + s + ");transform-origin:top left;" + (editing ? "" : "pointer-events:none");
    wrap.appendChild(art);
    heroStage.appendChild(wrap);
    heroArt = art; heroScale = s;
    if (editing && window.BoardEditor) BoardEditor.setTarget(art, s);

    heroType.textContent = v.type;
    heroVer.innerHTML = "v<b>" + (focus.round + 1) + "</b> · variant <b>" + letter(focus.variant) + "</b>";
    heroChosen.style.display = focus.variant === chosenOf(activeIdx, focus.round) ? "inline-flex" : "none";
    heroBadge.style.display = approved.has(v.label) ? "inline-flex" : "none";
  }

  /* ---- timeline (history of the active visual) ---- */
  function renderTimeline() {
    var v = visuals[activeIdx];
    timelineEl.innerHTML = "";
    tlsub.textContent = "“" + v.label + "” · " + v.rounds.length + " version" + (v.rounds.length === 1 ? "" : "s") + " · " + variantCount(activeIdx) + " variants";
    v.rounds.forEach(function (variants, ri) {
      if (ri > 0) timelineEl.appendChild(chev());
      var round = document.createElement("div"); round.className = "round";
      var ch = chosenOf(activeIdx, ri);
      var head = document.createElement("div"); head.className = "rh";
      head.innerHTML = '<span class="rv">v' + (ri + 1) + '</span><span class="rn">picked ' + letter(ch) + '</span>';
      round.appendChild(head);
      var vars = document.createElement("div"); vars.className = "vars";
      variants.forEach(function (node, varIdx) {
        var cell = document.createElement("div");
        cell.className = "tlvar" + (varIdx === ch ? " chosen" : "") + ((ri === focus.round && varIdx === focus.variant) ? " focused" : "");
        mountThumb(cell, activeIdx, ri, varIdx, 58 / 1080);
        var ck = document.createElement("span"); ck.className = "ck";
        ck.innerHTML = '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        cell.appendChild(ck);
        var vk = document.createElement("span"); vk.className = "vk"; vk.textContent = letter(varIdx);
        cell.appendChild(vk);
        cell.addEventListener("click", function () { focus = { round: ri, variant: varIdx }; renderHero(); renderTimeline(); });
        cell.addEventListener("contextmenu", function (e) { e.preventDefault(); openMenu(cell, ri, varIdx); });
        vars.appendChild(cell);
      });
      round.appendChild(vars);
      timelineEl.appendChild(round);
    });
    timelineEl.appendChild(chev());
    var next = document.createElement("div"); next.className = "round next";
    next.innerHTML = '<div class="plus"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></div><div class="nt">Iterate<br>3 new variants</div>';
    next.title = "Open the brief — tell the assistant what to change for the next round.";
    next.addEventListener("click", function () { openBrief("Iterate “" + v.label + "” — what should change?"); });
    timelineEl.appendChild(next);
  }
  function chev() { var a = document.createElement("div"); a.className = "arrow"; a.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>'; return a; }

  /* ---- reel (one entry per visual) ---- */
  function renderReel() {
    reel.innerHTML = "";
    visuals.forEach(function (v, i) {
      var ri = lastRound(i), ch = chosenOf(i, ri);
      var t = document.createElement("div");
      t.className = "thumb" + (i === activeIdx ? " active" : "") + (approved.has(v.label) ? " approved" : "");
      var frame = document.createElement("div"); frame.className = "tframe";
      mountThumb(frame, i, ri, ch, 96 / 1080);
      var cbadge = document.createElement("span"); cbadge.className = "cbadge";
      cbadge.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line></svg><span>' + variantCount(i) + '</span>';
      cbadge.title = variantCount(i) + " variants across " + v.rounds.length + " version" + (v.rounds.length === 1 ? "" : "s");
      frame.appendChild(cbadge);
      var abadge = document.createElement("span"); abadge.className = "abadge";
      abadge.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      frame.appendChild(abadge);
      var dots = document.createElement("button"); dots.className = "dots";
      dots.style.cssText = "position:absolute;top:5px;right:5px;width:25px;height:25px;background:rgba(255,255,255,.92)";
      dots.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>';
      dots.addEventListener("click", function (e) { e.stopPropagation(); activeIdx = i; focus = { round: ri, variant: ch }; renderHero(); renderTimeline(); renderReel(); openMenu(e.currentTarget, ri, ch); });
      frame.appendChild(dots);
      var lbl = document.createElement("div"); lbl.className = "lbl"; lbl.textContent = v.label;
      t.appendChild(frame); t.appendChild(lbl);
      t.addEventListener("click", function () { activeIdx = i; var lr = lastRound(i); focus = { round: lr, variant: chosenOf(i, lr) }; renderHero(); renderTimeline(); renderReel(); });
      reel.appendChild(t);
    });
    // + New visual card
    var nv = document.createElement("div"); nv.className = "newvis";
    nv.innerHTML = '<div class="nframe"><div class="plus"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></div></div><div class="nlbl">New visual</div>';
    nv.addEventListener("click", function () { openBrief("New visual — fill the brief"); });
    reel.appendChild(nv);

    countEl.textContent = visuals.length + " visual" + (visuals.length === 1 ? "" : "s") + " · 1080 × 1350 · export PNG or HTML";
    feedEl.textContent = approved.size + " approved · feeding the system";
  }

  /* ---- menu ---- */
  function openMenu(anchor, ri, varIdx) {
    menuTarget = { round: ri, variant: varIdx };
    var v = visuals[activeIdx];
    menuLabel.textContent = v.label + " · v" + (ri + 1) + " " + letter(varIdx);
    menu.querySelector('[data-act="choose"]').style.display = varIdx === chosenOf(activeIdx, ri) ? "none" : "flex";
    var ap = approved.has(v.label), apBtn = menu.querySelector('[data-act="approve"]');
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
      var act = b.getAttribute("data-act"); if (!menuTarget) return;
      var ri = menuTarget.round, varIdx = menuTarget.variant; closeMenu();
      if (act === "png") exportPng(ri, varIdx);
      else if (act === "html") exportHtml(ri, varIdx);
      else if (act === "choose") { setChosen(activeIdx, ri, varIdx); flash("Picked variant " + letter(varIdx) + " for v" + (ri + 1)); renderHero(); renderTimeline(); renderReel(); }
      else if (act === "approve") toggleApprove();
    });
  });
  function toggleApprove() {
    var k = visuals[activeIdx].label;
    if (approved.has(k)) { approved.delete(k); flash("Removed from the design system"); }
    else { approved.add(k); flash("Added — the design system will learn from this variant"); }
    saveJSON(APPROVED_KEY, [].slice.call(approved)); renderHero(); renderReel();
  }

  /* ---- edit mode ---- */
  function persistEdit() {
    if (!heroArt) return;
    editsStore[editKey(activeIdx, focus.round, focus.variant)] = heroArt.innerHTML;
    saveJSON(EDITS_KEY, editsStore);
    renderTimeline(); renderReel();
    if (window.BoardEditor) BoardEditor.reposition();
  }
  function setEditing(on) {
    editing = on;
    document.body.classList.toggle("editing", on);
    var railEl = document.getElementById("rail");
    railEl.style.minWidth = on ? "236px" : "0px";
    railEl.style.width = on ? "236px" : "0px";
    document.getElementById("editToggleLabel").textContent = on ? "Done" : "Edit";
    if (window.BoardEditor) BoardEditor.setActive(on);
    renderHero();
    if (on) flash("Edit mode — drag, resize, drop elements. Changes save to this variant.");
  }
  document.getElementById("editToggle").addEventListener("click", function () { setEditing(!editing); });

  /* ---- zoom ---- */
  function setZoom(z) { zoom = Math.max(0.2, Math.min(4, z)); renderHero(); if (editing && window.BoardEditor) BoardEditor.reposition(); }
  document.getElementById("zoomIn").addEventListener("click", function () { setZoom(zoom * 1.15); });
  document.getElementById("zoomOut").addEventListener("click", function () { setZoom(zoom / 1.15); });
  document.getElementById("zoomFit").addEventListener("click", function () { setZoom(1); });
  stageEl.addEventListener("wheel", function (e) { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); setZoom(zoom * (e.deltaY < 0 ? 1.08 : 0.93)); }, { passive: false });

  /* ---- Brief Studio slide-over ---- */
  function openBrief(title) {
    document.getElementById("briefTitle").textContent = title || "New visual — fill the brief";
    var f = document.getElementById("briefFrame");
    if (!f.getAttribute("src")) f.setAttribute("src", f.getAttribute("data-src"));
    document.getElementById("briefScrim").classList.add("on");
  }
  function closeBrief() { document.getElementById("briefScrim").classList.remove("on"); }
  document.getElementById("briefScrim").addEventListener("click", closeBrief);
  document.getElementById("briefClose").addEventListener("click", closeBrief);

  /* ---- export ---- */
  function nameFor(ri, varIdx) { return slug(visuals[activeIdx].label) + "-v" + (ri + 1) + letter(varIdx).toLowerCase(); }
  function offscreen(vi, ri, varIdx) {
    var holder = document.createElement("div");
    holder.style.cssText = "position:fixed;left:-99999px;top:0;opacity:0;pointer-events:none";
    var art = makeClone(vi, ri, varIdx);
    holder.appendChild(art); document.body.appendChild(holder);
    return { holder: holder, node: art };
  }
  function exportPng(ri, varIdx) {
    if (!window.htmlToImage) { flash("Export library not loaded"); return; }
    flash("Exporting PNG…");
    var o = offscreen(activeIdx, ri, varIdx), nm = nameFor(ri, varIdx);
    window.htmlToImage.toPng(o.node, { width: 1080, height: 1350, pixelRatio: 1, cacheBust: true })
      .then(function (url) { dl(url, nm + ".png"); flash("Exported " + nm + ".png"); })
      .catch(function (e) { console.error(e); flash("Export failed — try again"); })
      .then(function () { o.holder.remove(); });
  }
  function exportHtml(ri, varIdx) {
    var o = offscreen(activeIdx, ri, varIdx), nm = nameFor(ri, varIdx);
    var doc = buildDoc(o.node, visuals[activeIdx].label); o.holder.remove();
    var url = URL.createObjectURL(new Blob([doc], { type: "text/html" }));
    dl(url, nm + ".html"); setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    flash("Exported " + nm + ".html");
  }
  function dl(href, name) { var a = document.createElement("a"); a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
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

  /* ---- editor wiring + resize ---- */
  if (window.BoardEditor) {
    BoardEditor.init({
      frame: stageEl.querySelector(".frame"),
      heroStage: heroStage,
      selbox: document.getElementById("selbox"),
      eltbar: document.getElementById("eltbar"),
      palette: document.getElementById("palette"),
      onChange: persistEdit,
      flash: flash,
    });
  }
  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(renderHero, 120); });

  if (!visuals.length) { countEl.textContent = "No visuals yet — add a <section class=\"visual\"> block"; return; }
  var lr = lastRound(0); focus = { round: lr, variant: chosenOf(0, lr) };
  renderTimeline(); renderReel(); renderHero();           // hero LAST so it fits the final stage size
  requestAnimationFrame(renderHero);                       // re-fit after the dock has laid out
  if (window.ResizeObserver) { new ResizeObserver(function () { renderHero(); if (editing && window.BoardEditor) BoardEditor.reposition(); }).observe(stageEl); }
  }
  boot();
})();
