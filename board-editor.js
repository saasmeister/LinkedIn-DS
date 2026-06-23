/* Board editor — a small Canva-style direct-manipulation layer for the
   focused artboard in the Visual Board.

   What it does in edit mode:
     · click an element to select it (selection box + floating toolbar)
     · drag the body to move it (position:relative offset — never reflows siblings)
     · drag the corner handle to resize (uniform scale incl. font-size)
     · drag a palette item from the left rail onto the canvas to add it
     · delete / duplicate / bring-to-front / cycle brand colour
   It only mutates the artboard DOM; the controller persists artboard.innerHTML
   per variant and re-renders thumbnails. Coordinates are in true 1080×1350
   artboard space (pointer deltas are divided by the live preview scale). */
window.BoardEditor = (function () {
  var S = {
    frame: null, heroStage: null, selbox: null, eltbar: null, palette: null,
    onChange: function () {}, flash: function () {},
    art: null, scale: 1, sel: null, active: false,
  };

  /* ---------- palette: draggable elements (brand-aware) ---------- */
  var COLORS = ["var(--brand-primary)", "var(--accent)", "var(--fg)", "var(--muted)", "var(--soft)"];
  var LIB_KEY = "li-vds-board-lib-v1";
  function loadLib() { try { return JSON.parse(localStorage.getItem(LIB_KEY)) || []; } catch (e) { return []; } }
  function saveLib() { try { localStorage.setItem(LIB_KEY, JSON.stringify(LIB)); } catch (e) {} }
  var LIB = loadLib();
  var renderLib = function () {};
  var history = [], histIndex = -1, clip = null;   // undo/redo stack + copy buffer
  function snapshot() {
    if (!S.art) return;
    history = history.slice(0, histIndex + 1);
    history.push(S.art.innerHTML);
    if (history.length > 80) history.shift();
    histIndex = history.length - 1;
  }
  function commit() { snapshot(); S.onChange(); }
  function undo() { if (!S.art || histIndex <= 0) return; histIndex--; S.art.innerHTML = history[histIndex]; deselect(); S.onChange(); S.flash("Undo"); }
  function redo() { if (!S.art || histIndex >= history.length - 1) return; histIndex++; S.art.innerHTML = history[histIndex]; deselect(); S.onChange(); S.flash("Redo"); }
  function copySel() { if (S.sel) { clip = S.sel.outerHTML; S.flash("Copied"); } }
  function paste() {
    if (!clip || !S.art) return;
    var tmp = document.createElement("div"); tmp.innerHTML = clip;
    var node = tmp.firstElementChild; if (!node) return;
    node.style.position = "absolute";
    node.style.left = (parseFloat(node.style.left || 0) + 34) + "px";
    node.style.top = (parseFloat(node.style.top || 0) + 34) + "px";
    S.art.appendChild(node); select(node); commit(); S.flash("Pasted");
  }
  function el(tag, css, html) { var d = document.createElement(tag); d.style.cssText = css; if (html != null) d.innerHTML = html; return d; }

  // each factory returns a positioned element (absolute, sized in artboard px)
  var FACTORY = {
    heading: function () { return el("div", "position:absolute;font-family:var(--font-display);font-weight:700;font-size:78px;line-height:1.04;letter-spacing:-.02em;color:var(--fg);width:640px", "Your headline"); },
    sub: function () { return el("div", "position:absolute;font-weight:500;font-size:34px;line-height:1.3;color:var(--muted);width:560px", "One supporting line"); },
    eyebrow: function () { return el("div", "position:absolute;font-weight:700;font-size:22px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)", "EYEBROW"); },
    stat: function () { return el("div", "position:absolute;font-family:var(--font-display);font-weight:700;font-size:320px;line-height:.82;letter-spacing:-.05em;color:var(--fg)", "68%"); },
    quote: function () { return el("div", "position:absolute;font-family:var(--font-display);font-weight:700;font-size:200px;line-height:.6;color:var(--brand-primary)", "&ldquo;"); },
    arrow: function () { return el("div", "position:absolute;font-size:64px;font-weight:700;color:var(--fg)", "&rarr;"); },
    body: function () { return el("div", "position:absolute;font-weight:500;font-size:30px;line-height:1.45;color:var(--fg);width:560px", "A line of supporting copy that explains the point."); },
    avatar: function () { var d = el("div", "position:absolute;width:130px;height:130px;border-radius:50%;background:var(--soft)"); d.setAttribute("data-shape", "1"); return d; },
    rect: function () { var d = el("div", "position:absolute;width:340px;height:190px;border-radius:14px;background:var(--brand-primary)"); d.setAttribute("data-shape", "1"); return d; },
    circle: function () { var d = el("div", "position:absolute;width:230px;height:230px;border-radius:50%;background:var(--brand-primary)"); d.setAttribute("data-shape", "1"); return d; },
    pill: function () { var d = el("div", "position:absolute;width:280px;height:96px;border-radius:999px;background:var(--soft)"); d.setAttribute("data-shape", "1"); return d; },
    line: function () { var d = el("div", "position:absolute;width:340px;height:6px;border-radius:3px;background:var(--line)"); d.setAttribute("data-shape", "1"); return d; },
    donut: function () { var d = el("div", "position:absolute;width:360px;height:360px;border-radius:50%;background:conic-gradient(var(--brand-primary) 0 68%, var(--soft) 68% 100%)"); d.setAttribute("data-shape", "1"); return d; },
    bar: function () {
      var d = el("div", "position:absolute;width:520px;height:96px;border-radius:12px;overflow:hidden;display:flex");
      d.innerHTML = '<div style="width:68%;background:var(--brand-primary)"></div><div style="width:32%;background:var(--soft)"></div>';
      d.setAttribute("data-shape", "1"); return d;
    },
  };

  var GROUPS = [
    { name: "Text", items: [["heading", "Heading"], ["sub", "Subhead"], ["eyebrow", "Eyebrow"], ["body", "Body text"], ["stat", "Big stat"]] },
    { name: "Marks", items: [["quote", "&ldquo; Quote"], ["arrow", "&rarr; Swipe"], ["avatar", "Avatar"]] },
    { name: "Shapes", items: [["rect", "Rectangle"], ["circle", "Circle"], ["pill", "Pill"], ["line", "Divider"], ["donut", "Donut"], ["bar", "Split bar"]] },
  ];

  function buildPalette() {
    var p = S.palette; p.innerHTML = "";
    GROUPS.forEach(function (g) {
      var h = el("div", "", g.name); h.className = "grp"; p.appendChild(h);
      var grid = el("div"); grid.className = "palette";
      g.items.forEach(function (it) {
        var b = el("div", "", it[1]); b.className = "pitem"; b.setAttribute("draggable", "true");
        b.addEventListener("dragstart", function (e) { e.dataTransfer.setData("text/plain", "spec:" + it[0]); e.dataTransfer.effectAllowed = "copy"; });
        grid.appendChild(b);
      });
      p.appendChild(grid);
    });
    // image upload (multiple) → saved to a reusable library
    var up = el("label", "", '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg><span>Upload images / an icon set</span>');
    up.className = "pitem upload";
    var inp = el("input", "display:none"); inp.type = "file"; inp.accept = "image/*"; inp.multiple = true;
    inp.addEventListener("change", function (e) {
      var files = [].slice.call(e.target.files).filter(function (f) { return f.type.indexOf("image/") === 0; });
      if (!files.length) return; var pending = files.length;
      files.forEach(function (f) { var r = new FileReader(); r.onload = function () { LIB.push(r.result); if (--pending === 0) { saveLib(); renderLib(); S.flash(files.length + " added to your library — drag them onto the canvas"); } }; r.readAsDataURL(f); });
      e.target.value = "";
    });
    up.appendChild(inp);
    p.appendChild(up);

    // My library — reusable icon / illustration sets (persist across visuals)
    var libHead = el("div", "", "My library"); libHead.className = "grp"; p.appendChild(libHead);
    var libWrap = el("div", "display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px"); p.appendChild(libWrap);
    renderLib = function () {
      libWrap.innerHTML = "";
      if (!LIB.length) { libWrap.appendChild(el("div", "grid-column:1/-1;font-size:11px;color:#bcc0c4;padding:6px 2px;line-height:1.4", "Upload your icon / illustration sets above — they show up here to drag in, on every visual.")); return; }
      LIB.forEach(function (src, i) {
        var t = el("div", "position:relative;aspect-ratio:1;border:1px solid #e6e8eb;border-radius:9px;background:#fff center/contain no-repeat;background-image:url('" + src + "');cursor:grab");
        t.setAttribute("draggable", "true");
        t.addEventListener("dragstart", function (ev) { ev.dataTransfer.setData("text/plain", "img:" + i); ev.dataTransfer.effectAllowed = "copy"; });
        var x = el("button", "position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;border:none;background:#1f2328;color:#fff;font-size:11px;line-height:1;cursor:pointer", "&times;");
        x.title = "Remove from library";
        x.addEventListener("click", function (ev) { ev.preventDefault(); ev.stopPropagation(); LIB.splice(i, 1); saveLib(); renderLib(); });
        t.appendChild(x); libWrap.appendChild(t);
      });
    };
    renderLib();
    var hint = el("div", "font-size:11px;color:#9aa0a6;line-height:1.4;margin-top:12px;padding:0 2px", "Drag any item onto the canvas. Double-click text to edit it. Keep single & quote visuals visual-led — don't pile on text.");
    p.appendChild(hint);
  }

  /* ---------- geometry helpers ---------- */
  function artRect() { return S.art.getBoundingClientRect(); }       // rendered (scaled) rect
  function frameRect() { return S.frame.getBoundingClientRect(); }
  function toArt(clientX, clientY) { var r = artRect(); return { x: (clientX - r.left) / S.scale, y: (clientY - r.top) / S.scale }; }

  function placeSel() {
    if (!S.sel) { S.selbox.style.display = "none"; S.eltbar.style.display = "none"; return; }
    var er = S.sel.getBoundingClientRect(), fr = frameRect();
    var x = er.left - fr.left, y = er.top - fr.top;
    S.selbox.style.display = "block";
    S.selbox.style.left = x + "px"; S.selbox.style.top = y + "px";
    S.selbox.style.width = er.width + "px"; S.selbox.style.height = er.height + "px";
    S.eltbar.style.display = "flex";
    var bx = Math.max(0, Math.min(x, fr.width - 150));
    var by = y - 42; if (by < 0) by = y + er.height + 8;
    S.eltbar.style.left = bx + "px"; S.eltbar.style.top = by + "px";
  }

  function select(node) { S.sel = node; placeSel(); }
  function deselect() { S.sel = null; placeSel(); }

  /* ---------- element toolbar ---------- */
  function buildToolbar() {
    S.eltbar.innerHTML = "";
    function btn(title, svg, fn) { var b = el("button", "", svg); b.title = title; b.addEventListener("click", function (e) { e.stopPropagation(); fn(); }); S.eltbar.appendChild(b); }
    btn("Bring to front", '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>', function () {
      if (!S.sel) return; var max = 0; [].forEach.call(S.art.children, function (c) { max = Math.max(max, +c.style.zIndex || 0); }); S.sel.style.zIndex = max + 1; commit();
    });
    btn("Cycle colour", '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 3a9 9 0 0 0 0 18"></path></svg>', function () {
      if (!S.sel) return;
      var shape = S.sel.getAttribute("data-shape");
      var cur = +(S.sel.getAttribute("data-ci") || 0); cur = (cur + 1) % COLORS.length; S.sel.setAttribute("data-ci", cur);
      if (shape) S.sel.style.background = COLORS[cur]; else S.sel.style.color = COLORS[cur];
      commit();
    });
    btn("Duplicate", '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15V5a2 2 0 0 1 2-2h10"></path></svg>', function () {
      if (!S.sel) return; var c = S.sel.cloneNode(true);
      c.style.position = "absolute";
      c.style.left = (parseFloat(S.sel.style.left || 0) + 30) + "px";
      c.style.top = (parseFloat(S.sel.style.top || 0) + 30) + "px";
      S.art.appendChild(c); select(c); commit();
    });
    btn("Delete", '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6M14 11v6"></path></svg>', function () {
      if (!S.sel) return; var n = S.sel; S.sel = null; n.remove(); placeSel(); commit();
    });
  }

  /* ---------- pointer: select / move / resize ---------- */
  var drag = null;
  function onPointerDown(e) {
    if (!S.active || !S.art) return;
    // resize handle?
    if (e.target.classList && e.target.classList.contains("handle")) {
      if (!S.sel) return;
      var w = S.sel.offsetWidth, h = S.sel.offsetHeight;
      var fs = parseFloat(getComputedStyle(S.sel).fontSize) || 0;
      drag = { mode: "resize", sx: e.clientX, sy: e.clientY, w: w, h: h, fs: fs, hadH: !!S.sel.style.height };
      e.preventDefault(); return;
    }
    // ignore pointer drags while a text element is being edited inline
    if (e.target.getAttribute && e.target.getAttribute("contenteditable") === "true") return;
    // click inside artboard → select the SMALLEST element under the pointer
    // (so "68%", the re-hook and the headline are each grabbable on their own)
    var r = artRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    var node = e.target;
    if (!node || node === S.art || !S.art.contains(node)) { deselect(); return; }
    select(node);
    var bl = parseFloat(node.style.left), bt = parseFloat(node.style.top);
    var pos = getComputedStyle(node).position;
    drag = { mode: "move", sx: e.clientX, sy: e.clientY, bl: isNaN(bl) ? 0 : bl, bt: isNaN(bt) ? 0 : bt, pos: pos, moved: false };
    e.preventDefault();
  }
  function onPointerMove(e) {
    if (!drag) return;
    var dx = (e.clientX - drag.sx) / S.scale, dy = (e.clientY - drag.sy) / S.scale;
    if (drag.mode === "move") {
      if (!drag.moved && Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) < 3) return;
      drag.moved = true;
      if (drag.pos === "static") S.sel.style.position = "relative";
      S.sel.style.left = (drag.bl + dx) + "px";
      S.sel.style.top = (drag.bt + dy) + "px";
      placeSel();
    } else if (drag.mode === "resize") {
      var ratio = Math.max(0.15, (drag.w + dx) / drag.w);
      S.sel.style.width = Math.max(20, drag.w * ratio) + "px";
      if (drag.hadH || S.sel.getAttribute("data-shape")) S.sel.style.height = Math.max(8, drag.h * ratio) + "px";
      if (drag.fs) S.sel.style.fontSize = (drag.fs * ratio) + "px";
      placeSel();
    }
  }
  function onPointerUp() {
    if (drag && (drag.mode === "resize" || (drag.mode === "move" && drag.moved))) commit();
    drag = null;
  }

  /* ---------- drop from palette ---------- */
  function onDragOver(e) { if (S.active) { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; } }
  function onDrop(e) {
    if (!S.active || !S.art) return;
    var data = e.dataTransfer.getData("text/plain") || "";
    if (data.indexOf("img:") === 0) {                 // a library image
      var src = LIB[+data.slice(4)]; if (!src) return;
      e.preventDefault();
      var im = el("img", "position:absolute;width:300px;height:auto"); im.src = src;
      S.art.appendChild(im);
      var pp = toArt(e.clientX, e.clientY);
      im.style.left = Math.round(pp.x - 150) + "px"; im.style.top = Math.round(pp.y - 150) + "px";
      im.onload = function () { select(im); S.onChange(); };
      select(im); commit(); return;
    }
    if (data.indexOf("spec:") !== 0) return;
    e.preventDefault();
    var key = data.slice(5), make = FACTORY[key]; if (!make) return;
    var node = make();
    S.art.appendChild(node);
    var p = toArt(e.clientX, e.clientY);
    node.style.left = Math.round(p.x - node.offsetWidth / 2) + "px";
    node.style.top = Math.round(p.y - node.offsetHeight / 2) + "px";
    select(node); commit();
  }

  function onKey(e) {
    if (!S.active) return;
    var t = e.target.tagName;
    if (t === "INPUT" || t === "TEXTAREA") return;
    var editingText = S.sel && S.sel.getAttribute("contenteditable") === "true";
    if (e.metaKey || e.ctrlKey) {
      var k = (e.key || "").toLowerCase();
      if (editingText) return;                                  // let the browser handle text editing
      if (k === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
      if (k === "y") { e.preventDefault(); redo(); return; }    // Windows redo
      if (k === "c") { if (S.sel) copySel(); return; }
      if (k === "v") { if (clip) { e.preventDefault(); paste(); } return; }
      return;
    }
    if (!S.sel || editingText) return;
    if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); var n = S.sel; S.sel = null; n.remove(); placeSel(); commit(); }
    else if (e.key === "Escape") deselect();
  }

  /* double-click a text element to edit its copy in place */
  function onDbl(e) {
    if (!S.active || !S.art) return;
    var n = e.target;
    if (!n || n === S.art || !S.art.contains(n)) return;
    select(n);
    n.setAttribute("contenteditable", "true");
    n.style.cursor = "text";
    n.focus();
    var range = document.createRange(); range.selectNodeContents(n);
    var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    function end() {
      n.removeAttribute("contenteditable"); n.style.cursor = "";
      n.removeEventListener("blur", end);
      placeSel(); commit();
    }
    n.addEventListener("blur", end);
  }

  /* ---------- public ---------- */
  return {
    init: function (opts) {
      Object.assign(S, opts);
      buildPalette(); buildToolbar();
      S.heroStage.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      S.selbox.addEventListener("pointerdown", onPointerDown);
      S.heroStage.addEventListener("dragover", onDragOver);
      S.heroStage.addEventListener("drop", onDrop);
      S.heroStage.addEventListener("dblclick", onDbl);
      document.addEventListener("keydown", onKey);
      window.addEventListener("resize", function () { if (S.active) placeSel(); });
    },
    setActive: function (on) { S.active = on; if (!on) deselect(); },
    // called by the controller after each hero render
    setTarget: function (artEl, scale) { S.art = artEl; S.scale = scale; deselect(); history = [artEl.innerHTML]; histIndex = 0; },
    reposition: placeSel,
    deselect: deselect,
  };
})();
