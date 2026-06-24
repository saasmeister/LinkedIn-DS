/* @ds-bundle: {"format":3,"namespace":"LinkedInVisualDesignSystemTesting_727cb3","components":[{"name":"Cta","sourcePath":"components/content/Cta.jsx"},{"name":"InfoCard","sourcePath":"components/content/InfoCard.jsx"},{"name":"Chip","sourcePath":"components/content/InfoCard.jsx"},{"name":"Quote","sourcePath":"components/content/Quote.jsx"},{"name":"Avatar","sourcePath":"components/content/Quote.jsx"},{"name":"Attribution","sourcePath":"components/content/Quote.jsx"},{"name":"Stat","sourcePath":"components/content/Stat.jsx"},{"name":"StatBox","sourcePath":"components/content/Stat.jsx"},{"name":"StatRow","sourcePath":"components/content/Stat.jsx"},{"name":"BrowserMock","sourcePath":"components/illustration/BrowserMock.jsx"},{"name":"Canvas","sourcePath":"components/layout/Canvas.jsx"},{"name":"Chrome","sourcePath":"components/layout/Chrome.jsx"},{"name":"SwipeArrow","sourcePath":"components/layout/Chrome.jsx"},{"name":"FeedPost","sourcePath":"components/preview/FeedPost.jsx"},{"name":"Eyebrow","sourcePath":"components/text/Headline.jsx"},{"name":"Headline","sourcePath":"components/text/Headline.jsx"},{"name":"Mark","sourcePath":"components/text/Headline.jsx"},{"name":"Subhead","sourcePath":"components/text/Headline.jsx"}],"sourceHashes":{"board-editor.js":"55d12d430a4b","components/content/Cta.jsx":"82e459098f48","components/content/InfoCard.jsx":"1c79ce656fe9","components/content/Quote.jsx":"26d86b908140","components/content/Stat.jsx":"3196afd21e95","components/illustration/BrowserMock.jsx":"4ffefd5fb451","components/layout/Canvas.jsx":"c7884415425d","components/layout/Chrome.jsx":"cf4752729eb3","components/preview/FeedPost.jsx":"bd5556609d26","components/text/Headline.jsx":"0ab05c2c7576","ui_kits/setup/Setup.jsx":"7b77dc00b0b1","ui_kits/update-center/UpdateCenter.jsx":"c049b459323e","ui_kits/visual-library/VisualLibrary.jsx":"d8b82962af64","ui_kits/visual-library/sampleVisuals.jsx":"b246a3729833","visual-board.js":"135f57cc37e7"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.LinkedInVisualDesignSystemTesting_727cb3 = window.LinkedInVisualDesignSystemTesting_727cb3 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// board-editor.js
try { (() => {
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
window.BoardEditor = function () {
  var S = {
    frame: null,
    heroStage: null,
    selbox: null,
    eltbar: null,
    palette: null,
    onChange: function () {},
    flash: function () {},
    art: null,
    scale: 1,
    sel: null,
    active: false
  };

  /* ---------- palette: draggable elements (brand-aware) ---------- */
  var COLORS = ["var(--brand-primary)", "var(--accent)", "var(--fg)", "var(--muted)", "var(--soft)"];
  var LIB_KEY = "li-vds-board-lib-v1";
  function loadLib() {
    try {
      return JSON.parse(localStorage.getItem(LIB_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function saveLib() {
    try {
      localStorage.setItem(LIB_KEY, JSON.stringify(LIB));
    } catch (e) {}
  }
  var LIB = loadLib();
  var renderLib = function () {};
  var history = [],
    histIndex = -1,
    clip = null; // undo/redo stack + copy buffer
  function snapshot() {
    if (!S.art) return;
    history = history.slice(0, histIndex + 1);
    history.push(S.art.innerHTML);
    if (history.length > 80) history.shift();
    histIndex = history.length - 1;
  }
  function commit() {
    snapshot();
    S.onChange();
  }
  function undo() {
    if (!S.art || histIndex <= 0) return;
    histIndex--;
    S.art.innerHTML = history[histIndex];
    deselect();
    S.onChange();
    S.flash("Undo");
  }
  function redo() {
    if (!S.art || histIndex >= history.length - 1) return;
    histIndex++;
    S.art.innerHTML = history[histIndex];
    deselect();
    S.onChange();
    S.flash("Redo");
  }
  function copySel() {
    if (S.sel) {
      clip = S.sel.outerHTML;
      S.flash("Copied");
    }
  }
  function paste() {
    if (!clip || !S.art) return;
    var tmp = document.createElement("div");
    tmp.innerHTML = clip;
    var node = tmp.firstElementChild;
    if (!node) return;
    node.style.position = "absolute";
    node.style.left = parseFloat(node.style.left || 0) + 34 + "px";
    node.style.top = parseFloat(node.style.top || 0) + 34 + "px";
    S.art.appendChild(node);
    select(node);
    commit();
    S.flash("Pasted");
  }
  function el(tag, css, html) {
    var d = document.createElement(tag);
    d.style.cssText = css;
    if (html != null) d.innerHTML = html;
    return d;
  }

  // each factory returns a positioned element (absolute, sized in artboard px)
  var FACTORY = {
    heading: function () {
      return el("div", "position:absolute;font-family:var(--font-display);font-weight:700;font-size:78px;line-height:1.04;letter-spacing:-.02em;color:var(--fg);width:640px", "Your headline");
    },
    sub: function () {
      return el("div", "position:absolute;font-weight:500;font-size:34px;line-height:1.3;color:var(--muted);width:560px", "One supporting line");
    },
    eyebrow: function () {
      return el("div", "position:absolute;font-weight:700;font-size:22px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)", "EYEBROW");
    },
    stat: function () {
      return el("div", "position:absolute;font-family:var(--font-display);font-weight:700;font-size:320px;line-height:.82;letter-spacing:-.05em;color:var(--fg)", "68%");
    },
    quote: function () {
      return el("div", "position:absolute;font-family:var(--font-display);font-weight:700;font-size:200px;line-height:.6;color:var(--brand-primary)", "&ldquo;");
    },
    arrow: function () {
      return el("div", "position:absolute;font-size:64px;font-weight:700;color:var(--fg)", "&rarr;");
    },
    body: function () {
      return el("div", "position:absolute;font-weight:500;font-size:30px;line-height:1.45;color:var(--fg);width:560px", "A line of supporting copy that explains the point.");
    },
    avatar: function () {
      var d = el("div", "position:absolute;width:130px;height:130px;border-radius:50%;background:var(--soft)");
      d.setAttribute("data-shape", "1");
      return d;
    },
    rect: function () {
      var d = el("div", "position:absolute;width:340px;height:190px;border-radius:14px;background:var(--brand-primary)");
      d.setAttribute("data-shape", "1");
      return d;
    },
    circle: function () {
      var d = el("div", "position:absolute;width:230px;height:230px;border-radius:50%;background:var(--brand-primary)");
      d.setAttribute("data-shape", "1");
      return d;
    },
    pill: function () {
      var d = el("div", "position:absolute;width:280px;height:96px;border-radius:999px;background:var(--soft)");
      d.setAttribute("data-shape", "1");
      return d;
    },
    line: function () {
      var d = el("div", "position:absolute;width:340px;height:6px;border-radius:3px;background:var(--line)");
      d.setAttribute("data-shape", "1");
      return d;
    },
    donut: function () {
      var d = el("div", "position:absolute;width:360px;height:360px;border-radius:50%;background:conic-gradient(var(--brand-primary) 0 68%, var(--soft) 68% 100%)");
      d.setAttribute("data-shape", "1");
      return d;
    },
    bar: function () {
      var d = el("div", "position:absolute;width:520px;height:96px;border-radius:12px;overflow:hidden;display:flex");
      d.innerHTML = '<div style="width:68%;background:var(--brand-primary)"></div><div style="width:32%;background:var(--soft)"></div>';
      d.setAttribute("data-shape", "1");
      return d;
    }
  };
  var GROUPS = [{
    name: "Text",
    items: [["heading", "Heading"], ["sub", "Subhead"], ["eyebrow", "Eyebrow"], ["body", "Body text"], ["stat", "Big stat"]]
  }, {
    name: "Marks",
    items: [["quote", "&ldquo; Quote"], ["arrow", "&rarr; Swipe"], ["avatar", "Avatar"]]
  }, {
    name: "Shapes",
    items: [["rect", "Rectangle"], ["circle", "Circle"], ["pill", "Pill"], ["line", "Divider"], ["donut", "Donut"], ["bar", "Split bar"]]
  }];
  function buildPalette() {
    var p = S.palette;
    p.innerHTML = "";
    GROUPS.forEach(function (g) {
      var h = el("div", "", g.name);
      h.className = "grp";
      p.appendChild(h);
      var grid = el("div");
      grid.className = "palette";
      g.items.forEach(function (it) {
        var b = el("div", "", it[1]);
        b.className = "pitem";
        b.setAttribute("draggable", "true");
        b.addEventListener("dragstart", function (e) {
          e.dataTransfer.setData("text/plain", "spec:" + it[0]);
          e.dataTransfer.effectAllowed = "copy";
        });
        grid.appendChild(b);
      });
      p.appendChild(grid);
    });
    // image upload (multiple) → saved to a reusable library
    var up = el("label", "", '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg><span>Upload images / an icon set</span>');
    up.className = "pitem upload";
    var inp = el("input", "display:none");
    inp.type = "file";
    inp.accept = "image/*";
    inp.multiple = true;
    inp.addEventListener("change", function (e) {
      var files = [].slice.call(e.target.files).filter(function (f) {
        return f.type.indexOf("image/") === 0;
      });
      if (!files.length) return;
      var pending = files.length;
      files.forEach(function (f) {
        var r = new FileReader();
        r.onload = function () {
          LIB.push(r.result);
          if (--pending === 0) {
            saveLib();
            renderLib();
            S.flash(files.length + " added to your library — drag them onto the canvas");
          }
        };
        r.readAsDataURL(f);
      });
      e.target.value = "";
    });
    up.appendChild(inp);
    p.appendChild(up);

    // My library — reusable icon / illustration sets (persist across visuals)
    var libHead = el("div", "", "My library");
    libHead.className = "grp";
    p.appendChild(libHead);
    var libWrap = el("div", "display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px");
    p.appendChild(libWrap);
    renderLib = function () {
      libWrap.innerHTML = "";
      if (!LIB.length) {
        libWrap.appendChild(el("div", "grid-column:1/-1;font-size:11px;color:#bcc0c4;padding:6px 2px;line-height:1.4", "Upload your icon / illustration sets above — they show up here to drag in, on every visual."));
        return;
      }
      LIB.forEach(function (src, i) {
        var t = el("div", "position:relative;aspect-ratio:1;border:1px solid #e6e8eb;border-radius:9px;background:#fff center/contain no-repeat;background-image:url('" + src + "');cursor:grab");
        t.setAttribute("draggable", "true");
        t.addEventListener("dragstart", function (ev) {
          ev.dataTransfer.setData("text/plain", "img:" + i);
          ev.dataTransfer.effectAllowed = "copy";
        });
        var x = el("button", "position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;border:none;background:#1f2328;color:#fff;font-size:11px;line-height:1;cursor:pointer", "&times;");
        x.title = "Remove from library";
        x.addEventListener("click", function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          LIB.splice(i, 1);
          saveLib();
          renderLib();
        });
        t.appendChild(x);
        libWrap.appendChild(t);
      });
    };
    renderLib();
    var hint = el("div", "font-size:11px;color:#9aa0a6;line-height:1.4;margin-top:12px;padding:0 2px", "Drag any item onto the canvas. Double-click text to edit it. Keep single & quote visuals visual-led — don't pile on text.");
    p.appendChild(hint);
  }

  /* ---------- geometry helpers ---------- */
  function artRect() {
    return S.art.getBoundingClientRect();
  } // rendered (scaled) rect
  function frameRect() {
    return S.frame.getBoundingClientRect();
  }
  function toArt(clientX, clientY) {
    var r = artRect();
    return {
      x: (clientX - r.left) / S.scale,
      y: (clientY - r.top) / S.scale
    };
  }
  function placeSel() {
    if (!S.sel) {
      S.selbox.style.display = "none";
      S.eltbar.style.display = "none";
      return;
    }
    var er = S.sel.getBoundingClientRect(),
      fr = frameRect();
    var x = er.left - fr.left,
      y = er.top - fr.top;
    S.selbox.style.display = "block";
    S.selbox.style.left = x + "px";
    S.selbox.style.top = y + "px";
    S.selbox.style.width = er.width + "px";
    S.selbox.style.height = er.height + "px";
    S.eltbar.style.display = "flex";
    var bx = Math.max(0, Math.min(x, fr.width - 150));
    var by = y - 42;
    if (by < 0) by = y + er.height + 8;
    S.eltbar.style.left = bx + "px";
    S.eltbar.style.top = by + "px";
  }
  function select(node) {
    S.sel = node;
    placeSel();
  }
  function deselect() {
    S.sel = null;
    placeSel();
  }

  /* ---------- element toolbar ---------- */
  function buildToolbar() {
    S.eltbar.innerHTML = "";
    function btn(title, svg, fn) {
      var b = el("button", "", svg);
      b.title = title;
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        fn();
      });
      S.eltbar.appendChild(b);
    }
    btn("Bring to front", '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>', function () {
      if (!S.sel) return;
      var max = 0;
      [].forEach.call(S.art.children, function (c) {
        max = Math.max(max, +c.style.zIndex || 0);
      });
      S.sel.style.zIndex = max + 1;
      commit();
    });
    btn("Cycle colour", '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 3a9 9 0 0 0 0 18"></path></svg>', function () {
      if (!S.sel) return;
      var shape = S.sel.getAttribute("data-shape");
      var cur = +(S.sel.getAttribute("data-ci") || 0);
      cur = (cur + 1) % COLORS.length;
      S.sel.setAttribute("data-ci", cur);
      if (shape) S.sel.style.background = COLORS[cur];else S.sel.style.color = COLORS[cur];
      commit();
    });
    btn("Duplicate", '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15V5a2 2 0 0 1 2-2h10"></path></svg>', function () {
      if (!S.sel) return;
      var c = S.sel.cloneNode(true);
      c.style.position = "absolute";
      c.style.left = parseFloat(S.sel.style.left || 0) + 30 + "px";
      c.style.top = parseFloat(S.sel.style.top || 0) + 30 + "px";
      S.art.appendChild(c);
      select(c);
      commit();
    });
    btn("Delete", '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6M14 11v6"></path></svg>', function () {
      if (!S.sel) return;
      var n = S.sel;
      S.sel = null;
      n.remove();
      placeSel();
      commit();
    });
  }

  /* ---------- pointer: select / move / resize ---------- */
  var drag = null;
  function onPointerDown(e) {
    if (!S.active || !S.art) return;
    // resize handle?
    if (e.target.classList && e.target.classList.contains("handle")) {
      if (!S.sel) return;
      var w = S.sel.offsetWidth,
        h = S.sel.offsetHeight;
      var fs = parseFloat(getComputedStyle(S.sel).fontSize) || 0;
      // which handle: br = uniform (scale incl. font), r = width-only, b = height-only
      var dir = e.target.classList.contains("r") ? "x" : e.target.classList.contains("b") ? "y" : "xy";
      drag = {
        mode: "resize",
        dir: dir,
        sx: e.clientX,
        sy: e.clientY,
        w: w,
        h: h,
        fs: fs,
        hadH: !!S.sel.style.height
      };
      e.preventDefault();
      return;
    }
    // ignore pointer drags while a text element is being edited inline
    if (e.target.getAttribute && e.target.getAttribute("contenteditable") === "true") return;
    // click inside artboard → select the SMALLEST element under the pointer
    // (so "68%", the re-hook and the headline are each grabbable on their own)
    var r = artRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    var node = e.target;
    if (!node || node === S.art || !S.art.contains(node)) {
      deselect();
      return;
    }
    select(node);
    var bl = parseFloat(node.style.left),
      bt = parseFloat(node.style.top);
    var pos = getComputedStyle(node).position;
    drag = {
      mode: "move",
      sx: e.clientX,
      sy: e.clientY,
      bl: isNaN(bl) ? 0 : bl,
      bt: isNaN(bt) ? 0 : bt,
      pos: pos,
      moved: false
    };
    e.preventDefault();
  }
  function onPointerMove(e) {
    if (!drag) return;
    var dx = (e.clientX - drag.sx) / S.scale,
      dy = (e.clientY - drag.sy) / S.scale;
    if (drag.mode === "move") {
      if (!drag.moved && Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) < 3) return;
      drag.moved = true;
      if (drag.pos === "static") S.sel.style.position = "relative";
      S.sel.style.left = drag.bl + dx + "px";
      S.sel.style.top = drag.bt + dy + "px";
      placeSel();
    } else if (drag.mode === "resize") {
      if (drag.dir === "x") {
        // width only — reflow text taller/shorter, font unchanged
        S.sel.style.width = Math.max(20, drag.w + dx) + "px";
      } else if (drag.dir === "y") {
        // height only
        S.sel.style.height = Math.max(8, drag.h + dy) + "px";
      } else {
        // corner — uniform scale incl. font-size
        var ratio = Math.max(0.15, (drag.w + dx) / drag.w);
        S.sel.style.width = Math.max(20, drag.w * ratio) + "px";
        if (drag.hadH || S.sel.getAttribute("data-shape")) S.sel.style.height = Math.max(8, drag.h * ratio) + "px";
        if (drag.fs) S.sel.style.fontSize = drag.fs * ratio + "px";
      }
      placeSel();
    }
  }
  function onPointerUp() {
    if (drag && (drag.mode === "resize" || drag.mode === "move" && drag.moved)) commit();
    drag = null;
  }

  /* ---------- drop from palette ---------- */
  function onDragOver(e) {
    if (S.active) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  }
  function onDrop(e) {
    if (!S.active || !S.art) return;
    var data = e.dataTransfer.getData("text/plain") || "";
    if (data.indexOf("img:") === 0) {
      // a library image
      var src = LIB[+data.slice(4)];
      if (!src) return;
      e.preventDefault();
      var im = el("img", "position:absolute;width:300px;height:auto");
      im.src = src;
      S.art.appendChild(im);
      var pp = toArt(e.clientX, e.clientY);
      im.style.left = Math.round(pp.x - 150) + "px";
      im.style.top = Math.round(pp.y - 150) + "px";
      im.onload = function () {
        select(im);
        S.onChange();
      };
      select(im);
      commit();
      return;
    }
    if (data.indexOf("spec:") !== 0) return;
    e.preventDefault();
    var key = data.slice(5),
      make = FACTORY[key];
    if (!make) return;
    var node = make();
    S.art.appendChild(node);
    var p = toArt(e.clientX, e.clientY);
    node.style.left = Math.round(p.x - node.offsetWidth / 2) + "px";
    node.style.top = Math.round(p.y - node.offsetHeight / 2) + "px";
    select(node);
    commit();
  }
  function onKey(e) {
    if (!S.active) return;
    var t = e.target.tagName;
    if (t === "INPUT" || t === "TEXTAREA") return;
    var editingText = S.sel && S.sel.getAttribute("contenteditable") === "true";
    if (e.metaKey || e.ctrlKey) {
      var k = (e.key || "").toLowerCase();
      if (editingText) return; // let the browser handle text editing
      if (k === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();else undo();
        return;
      }
      if (k === "y") {
        e.preventDefault();
        redo();
        return;
      } // Windows redo
      if (k === "c") {
        if (S.sel) copySel();
        return;
      }
      if (k === "v") {
        if (clip) {
          e.preventDefault();
          paste();
        }
        return;
      }
      return;
    }
    if (!S.sel || editingText) return;
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      var n = S.sel;
      S.sel = null;
      n.remove();
      placeSel();
      commit();
    } else if (e.key === "Escape") deselect();
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
    var range = document.createRange();
    range.selectNodeContents(n);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    function end() {
      n.removeAttribute("contenteditable");
      n.style.cursor = "";
      n.removeEventListener("blur", end);
      placeSel();
      commit();
    }
    n.addEventListener("blur", end);
  }

  /* ---------- public ---------- */
  return {
    init: function (opts) {
      Object.assign(S, opts);
      buildPalette();
      buildToolbar();
      S.heroStage.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      S.selbox.addEventListener("pointerdown", onPointerDown);
      S.heroStage.addEventListener("dragover", onDragOver);
      S.heroStage.addEventListener("drop", onDrop);
      S.heroStage.addEventListener("dblclick", onDbl);
      document.addEventListener("keydown", onKey);
      window.addEventListener("resize", function () {
        if (S.active) placeSel();
      });
    },
    setActive: function (on) {
      S.active = on;
      if (!on) deselect();
    },
    // called by the controller after each hero render
    setTarget: function (artEl, scale) {
      S.art = artEl;
      S.scale = scale;
      deselect();
      history = [artEl.innerHTML];
      histIndex = 0;
    },
    reposition: placeSel,
    deselect: deselect
  };
}();
})(); } catch (e) { __ds_ns.__errors.push({ path: "board-editor.js", error: String((e && e.message) || e) }); }

// components/content/Cta.jsx
try { (() => {
/**
 * Cta — the closing call-to-action block for a carousel back cover.
 * A bordered, soft-filled bar that holds the next step (DM / link / follow).
 */
function Cta({
  children = "DM me \u2018WORD\u2019 \u2192",
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: "560px",
      minHeight: "112px",
      padding: "0 var(--space-6)",
      border: "var(--line) solid var(--line)",
      borderRadius: "var(--radius-cta)",
      background: "var(--soft)",
      fontFamily: "var(--font-display)",
      fontWeight: "var(--fw-bold)",
      fontSize: "32px",
      letterSpacing: "var(--tr-tight)",
      color: "var(--fg)",
      boxSizing: "border-box",
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Cta });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Cta.jsx", error: String((e && e.message) || e) }); }

// components/content/InfoCard.jsx
try { (() => {
/**
 * InfoCard — one cell of an infographic. Category label + mini-heading +
 * body + ONE supporting element (passed as children: chips, a mini-chart,
 * a screenshot slot, an illustration). Set `emphasis` on the single card
 * per sheet that should stand out (thicker border).
 */
function InfoCard({
  label = "CATEGORY",
  heading,
  body,
  emphasis = false,
  number,
  children,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      border: `${emphasis ? "var(--line-strong)" : "var(--line)"} solid ${emphasis ? "var(--muted)" : "var(--line)"}`,
      borderRadius: "var(--radius-card)",
      background: "var(--bg)",
      padding: "var(--space-4) var(--space-4)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      boxSizing: "border-box",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)"
    }
  }, number != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 52,
      height: 52,
      flex: "none",
      borderRadius: "var(--radius-pill)",
      background: "var(--canvas-section-bg)",
      color: "var(--canvas-section-fg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-display)",
      fontWeight: "var(--fw-bold)",
      fontSize: "26px"
    }
  }, number) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: "var(--fw-bold)",
      fontSize: "var(--fz-label)",
      letterSpacing: "var(--tr-eyebrow)",
      color: "var(--muted)"
    }
  }, label)), heading ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: "var(--fw-bold)",
      fontSize: "28px",
      lineHeight: 1.15,
      color: "var(--fg)",
      letterSpacing: "var(--tr-tight)"
    }
  }, heading) : null, body ? /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--fz-body)",
      lineHeight: "var(--lh-body)",
      color: "var(--muted)",
      margin: 0
    }
  }, body) : null, children ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto",
      paddingTop: "var(--space-2)"
    }
  }, children) : null);
}

/** Chip — a pill tag for categorising / marking. */
function Chip({
  children,
  tone = "soft",
  style = {}
}) {
  const styles = {
    soft: {
      background: "var(--soft)",
      color: "var(--fg)",
      border: "var(--line) solid var(--line)"
    },
    accent: {
      background: "var(--accent-soft)",
      color: "var(--accent-fg)",
      border: "var(--line) solid var(--accent)"
    },
    solid: {
      background: "var(--canvas-section-bg)",
      color: "var(--canvas-section-fg)",
      border: "var(--line) solid transparent"
    }
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      height: 44,
      padding: "0 var(--space-3)",
      borderRadius: "var(--radius-pill)",
      fontFamily: "var(--font-body)",
      fontWeight: "var(--fw-semibold)",
      fontSize: "22px",
      whiteSpace: "nowrap",
      ...styles[tone],
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { InfoCard, Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/InfoCard.jsx", error: String((e && e.message) || e) }); }

// components/content/Quote.jsx
try { (() => {
/**
 * Quote — one pulled sentence, left-aligned, vertically centred, with
 * air left and right. Typography carries the visual. Pair with
 * <Attribution> underneath. No swipe arrow on a quote visual.
 */
function Quote({
  children,
  label = "QUOTE",
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: "var(--fw-bold)",
      fontSize: "150px",
      lineHeight: 0.6,
      color: "var(--soft)"
    }
  }, "\u201C"), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: "var(--fw-bold)",
      fontSize: "var(--fz-eyebrow)",
      letterSpacing: "var(--tr-eyebrow)",
      color: "var(--muted)",
      marginTop: "var(--space-2)"
    }
  }, label) : null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: "var(--fw-semibold)",
      fontSize: "var(--fz-quote)",
      lineHeight: "var(--lh-quote)",
      letterSpacing: "var(--tr-tight)",
      color: "var(--fg)",
      margin: "var(--space-3) 0 0",
      maxWidth: "820px",
      textWrap: "balance"
    }
  }, children));
}

/**
 * Avatar — round profile photo placeholder (drop a real <img> child to fill).
 */
function Avatar({
  src,
  size = 96,
  alt = "",
  style = {}
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      flex: "none",
      borderRadius: "var(--radius-pill)",
      overflow: "hidden",
      background: "var(--soft)",
      border: "var(--line) solid var(--line)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...style
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: alt,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : /*#__PURE__*/React.createElement("svg", {
    width: size * 0.55,
    height: size * 0.55,
    viewBox: "0 0 80 80",
    fill: "none",
    stroke: "var(--muted)",
    strokeWidth: "4"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "40",
    cy: "30",
    r: "15"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 72 C12 48 68 48 68 72",
    strokeLinecap: "round"
  })));
}

/**
 * Attribution — avatar + name + role beneath a quote (or testimonial).
 */
function Attribution({
  name = "Full name",
  role = "Role / company",
  src,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)",
      ...style
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    src: src,
    size: 96
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "4px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: "var(--fw-bold)",
      fontSize: "30px",
      color: "var(--fg)"
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: "var(--fw-medium)",
      fontSize: "24px",
      color: "var(--muted)"
    }
  }, role)));
}
Object.assign(__ds_scope, { Quote, Avatar, Attribution });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Quote.jsx", error: String((e && e.message) || e) }); }

// components/content/Stat.jsx
try { (() => {
/**
 * Stat — one big number with a caption. The hero number on a single or
 * a section result slide. Size "xl" is the 230px hero treatment.
 */
function Stat({
  value = "00%",
  caption,
  size = "lg",
  align = "center",
  style = {}
}) {
  const fz = size === "xl" ? "var(--fz-stat-xl)" : "var(--fz-stat)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: align === "center" ? "center" : "flex-start",
      gap: "var(--space-2)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: "var(--fw-bold)",
      fontSize: fz,
      lineHeight: 0.9,
      letterSpacing: "var(--tr-stat)",
      color: "var(--fg)"
    }
  }, value), caption ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: "var(--fw-medium)",
      fontSize: "var(--fz-subhead)",
      color: "var(--muted)",
      textAlign: align,
      maxWidth: "680px"
    }
  }, caption) : null);
}

/**
 * StatBox — a compact framed stat for the results row of a case-study
 * infographic. Renders in the section colour by default.
 */
function StatBox({
  value = "00",
  caption,
  tone = "section",
  style = {}
}) {
  const bg = tone === "section" ? "var(--canvas-section-bg)" : "var(--soft)";
  const fg = tone === "section" ? "var(--canvas-section-fg)" : "var(--fg)";
  const cap = tone === "section" ? "var(--canvas-section-muted)" : "var(--muted)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: bg,
      borderRadius: "var(--radius-card)",
      padding: "var(--space-4) var(--space-3)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--space-1)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: "var(--fw-bold)",
      fontSize: "52px",
      letterSpacing: "var(--tr-stat)",
      color: fg
    }
  }, value), caption ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fz-label)",
      fontWeight: "var(--fw-medium)",
      color: cap,
      textAlign: "center"
    }
  }, caption) : null);
}

/** StatRow — labelled row of StatBoxes (the case-study "RESULTS" rail). */
function StatRow({
  label = "RESULTS",
  children,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: style
  }, label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: "var(--fw-bold)",
      fontSize: "var(--fz-label)",
      letterSpacing: "var(--tr-eyebrow)",
      color: "var(--muted)"
    }
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-2)",
      marginTop: "var(--space-2)"
    }
  }, children));
}
Object.assign(__ds_scope, { Stat, StatBox, StatRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Stat.jsx", error: String((e && e.message) || e) }); }

// components/illustration/BrowserMock.jsx
try { (() => {
/**
 * BrowserMock — a mini browser / app window used to ILLUSTRATE a homepage,
 * landing page or screen inside a visual. The recurring "catalog of
 * homepages" pattern: window chrome (traffic-light dots + an address pill)
 * over a content area. Drop real children, or leave empty for an auto
 * skeleton (headline bar + lines + a CTA button).
 *
 * Set `emphasis` on the one window that should stand out (accent border +
 * accent CTA) — the "build this instead" card.
 */
function BrowserMock({
  title,
  // optional mini-heading shown over the content
  cta = "Get started",
  // skeleton CTA label; null to hide
  emphasis = false,
  tone = "light",
  // 'light' (white window) | 'section' (on dark canvas)
  children,
  style = {}
}) {
  const accent = emphasis ? "var(--accent)" : null;
  const winBg = tone === "section" ? "var(--canvas-section-soft)" : "#FFFFFF";
  const chromeBg = tone === "section" ? "color-mix(in srgb, #000 18%, var(--canvas-section-soft))" : "color-mix(in srgb, var(--brand-primary) 6%, #F2F2F2)";
  const skeleton = tone === "section" ? "color-mix(in srgb, #fff 16%, transparent)" : "color-mix(in srgb, var(--brand-primary) 12%, #E6E6E6)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: "var(--radius-card)",
      overflow: "hidden",
      background: winBg,
      border: `${emphasis ? "var(--line-strong)" : "var(--line)"} solid ${emphasis ? accent : "var(--line)"}`,
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)",
      padding: "16px 20px",
      background: chromeBg,
      borderBottom: `var(--line) solid ${emphasis ? accent : "var(--line)"}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      gap: 8
    }
  }, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 14,
      height: 14,
      borderRadius: "var(--radius-pill)",
      background: emphasis && i === 0 ? accent : skeleton
    }
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "var(--space-2)",
      flex: 1,
      height: 22,
      borderRadius: "var(--radius-pill)",
      background: skeleton
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-4)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      flex: 1
    }
  }, children != null ? children : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 22,
      height: 22,
      borderRadius: 6,
      background: skeleton
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 60,
      height: 12,
      borderRadius: 6,
      background: skeleton
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 80,
      height: 26,
      borderRadius: 8,
      background: skeleton
    }
  })), title ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: "var(--fw-bold)",
      fontSize: "34px",
      letterSpacing: "var(--tr-tight)",
      lineHeight: 1.1,
      color: tone === "section" ? "var(--canvas-section-fg)" : "var(--fg)",
      margin: "var(--space-2) 0 4px"
    }
  }, title) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      width: "85%",
      height: 12,
      borderRadius: 6,
      background: skeleton
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: "55%",
      height: 12,
      borderRadius: 6,
      background: skeleton,
      marginBottom: "var(--space-2)"
    }
  }), cta ? /*#__PURE__*/React.createElement("span", {
    style: {
      alignSelf: "flex-start",
      marginTop: "auto",
      padding: "12px 22px",
      borderRadius: "var(--radius-cta)",
      background: emphasis ? accent : skeleton,
      color: emphasis ? "#fff" : tone === "section" ? "var(--canvas-section-muted)" : "var(--muted)",
      fontFamily: "var(--font-body)",
      fontWeight: "var(--fw-bold)",
      fontSize: "20px"
    }
  }, cta) : null)));
}
Object.assign(__ds_scope, { BrowserMock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/illustration/BrowserMock.jsx", error: String((e && e.message) || e) }); }

// components/layout/Canvas.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Canvas — the 1080×1350 artboard for one LinkedIn visual.
 *
 * Sets the canvas ROLE (loud / light / section) and exposes generic
 * --fg / --bg / --muted / --line / --soft / --sig-color custom props
 * so every child primitive styles itself without knowing the role.
 *
 * Render at natural 1080×1350 and scale with the `scale` prop (or wrap
 * in your own transform) to fit a preview.
 */
function Canvas({
  role = "light",
  margin,
  // override the safe field; defaults per density
  density = "default",
  // 'default' (96px) | 'tight' (56px, infographics)
  scale,
  children,
  style = {},
  ...rest
}) {
  const roles = {
    loud: {
      "--bg": "var(--canvas-loud-bg)",
      "--fg": "var(--canvas-loud-fg)",
      "--muted": "var(--canvas-loud-muted)",
      "--line": "var(--canvas-loud-line)",
      "--soft": "color-mix(in srgb, #fff 14%, transparent)",
      "--sig-color": "var(--canvas-loud-fg)"
    },
    light: {
      "--bg": "var(--canvas-light-bg)",
      "--fg": "var(--canvas-light-fg)",
      "--muted": "var(--canvas-light-muted)",
      "--line": "var(--canvas-light-line)",
      "--soft": "var(--canvas-light-soft)",
      "--sig-color": "var(--brand-primary)"
    },
    section: {
      "--bg": "var(--canvas-section-bg)",
      "--fg": "var(--canvas-section-fg)",
      "--muted": "var(--canvas-section-muted)",
      "--line": "var(--canvas-section-line)",
      "--soft": "var(--canvas-section-soft)",
      "--sig-color": "var(--accent)"
    }
  };
  const pad = margin ?? (density === "tight" ? "var(--margin-tight)" : "var(--margin)");
  return /*#__PURE__*/React.createElement("div", _extends({
    "data-canvas": role,
    "data-screen-label": rest["data-screen-label"],
    style: {
      position: "relative",
      width: "var(--canvas-w)",
      height: "var(--canvas-h)",
      boxSizing: "border-box",
      padding: pad,
      overflow: "hidden",
      fontFamily: "var(--font-body)",
      background: "var(--bg)",
      color: "var(--fg)",
      ...(scale != null ? {
        transform: `scale(${scale})`,
        transformOrigin: "top left"
      } : {}),
      ...roles[role],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Canvas });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Canvas.jsx", error: String((e && e.message) || e) }); }

// components/layout/Chrome.jsx
try { (() => {
/**
 * Chrome — the identity bar. Name (or company) on the left, claimed
 * category / function on the right. Sits at the top OR bottom (deliver
 * both as variants). The swipe arrow (→) is ONLY valid on carousels.
 */
function Chrome({
  name = "Name",
  category = "Category / function",
  position = "top",
  // 'top' | 'bottom'
  swipe = false,
  // carousel only
  inset,
  // override side inset; defaults to the canvas margin
  style = {}
}) {
  const side = inset ?? "var(--margin)";
  const edge = position === "top" ? {
    top: side
  } : {
    bottom: side
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: side,
      right: side,
      ...edge,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "var(--space-4)",
      fontFamily: "var(--font-body)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--fw-semibold)",
      fontSize: "var(--fz-chrome)",
      letterSpacing: "var(--tr-chrome)",
      color: "var(--fg)"
    }
  }, name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--fw-semibold)",
      fontSize: "var(--fz-chrome)",
      letterSpacing: "var(--tr-chrome)",
      color: "var(--muted)"
    }
  }, category), swipe ? /*#__PURE__*/React.createElement(SwipeArrow, null) : null));
}

/**
 * SwipeArrow — the "there is more, keep swiping" cue. Carousels only;
 * never on single, quote or infographic.
 */
function SwipeArrow({
  size = 72,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: size,
      height: size,
      flex: "none",
      borderRadius: "var(--radius-pill)",
      border: "var(--line) solid var(--line)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--fg)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size * 0.46,
    height: size * 0.46,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "4",
    y1: "12",
    x2: "19",
    y2: "12"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "13 6 19 12 13 18"
  })));
}
Object.assign(__ds_scope, { Chrome, SwipeArrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Chrome.jsx", error: String((e && e.message) || e) }); }

// components/preview/FeedPost.jsx
try { (() => {
/* LinkedIn feed colours (the host UI, not the brand layer). */
const LI = {
  blue: "#0A66C2",
  text: "rgba(0,0,0,0.9)",
  sub: "rgba(0,0,0,0.6)",
  faint: "rgba(0,0,0,0.45)",
  line: "#E8E8E8",
  card: "#FFFFFF",
  feed: "#F4F2EE"
};
function Avatar({
  src,
  name = "",
  size = 48
}) {
  const initials = name.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      flex: "none",
      borderRadius: "50%",
      overflow: "hidden",
      background: src ? "#ddd" : LI.blue,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 600,
      fontSize: size * 0.38
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initials);
}
const InBadge = () => /*#__PURE__*/React.createElement("span", {
  style: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 18,
    height: 18,
    borderRadius: 3,
    background: LI.blue,
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1
  }
}, "in");
const Globe = () => /*#__PURE__*/React.createElement("svg", {
  width: "14",
  height: "14",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: LI.faint,
  strokeWidth: "2"
}, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "9"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"
}));
function PostHeader({
  author
}) {
  const a = author || {};
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      padding: "12px 16px 0"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    src: a.avatar,
    name: a.name || "Your Name"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      lineHeight: 1.3
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      fontSize: 15,
      color: LI.text
    }
  }, a.name || "Your Name"), /*#__PURE__*/React.createElement(InBadge, null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: LI.faint
    }
  }, "\xB7 1st")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: LI.sub,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: 360
    }
  }, a.headline || "Claimed category / function"), a.link ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: LI.blue,
      fontWeight: 600
    }
  }, a.link) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      fontSize: 13,
      color: LI.faint,
      marginTop: 1
    }
  }, /*#__PURE__*/React.createElement("span", null, a.time || "21h"), /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement(Globe, null))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      color: LI.faint
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "5",
    cy: "12",
    r: "2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "12",
    r: "2"
  })), /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "6",
    y1: "6",
    x2: "18",
    y2: "18"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "18",
    y1: "6",
    x2: "6",
    y2: "18"
  }))));
}
function PostText({
  text
}) {
  if (!text) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 16px 12px",
      fontSize: 15,
      lineHeight: 1.45,
      color: LI.text,
      whiteSpace: "pre-wrap"
    }
  }, text, text.length > 80 ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: LI.faint
    }
  }, " \u2026more") : null);
}
function ActionBar({
  likes = 23,
  comments = 4,
  reposts = 1
}) {
  const ico = d => /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "17",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: LI.sub,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, d);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: `1px solid ${LI.line}`,
      margin: "0 16px",
      padding: "6px 0 10px",
      display: "flex",
      alignItems: "center",
      gap: 20,
      color: LI.sub,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      height: 18,
      borderRadius: "50%",
      background: LI.blue,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 21h4V9H2v12zM22 10c0-1.1-.9-2-2-2h-6.3l.9-4.5c.1-.5 0-1-.3-1.4-.4-.4-.9-.6-1.4-.6L8 8v13h11c.8 0 1.5-.5 1.8-1.2l2-7c.1-.3.2-.5.2-.8v-2z"
  })))), likes), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, ico(/*#__PURE__*/React.createElement("path", {
    d: "M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 20l1.3-3.9A8.4 8.4 0 1 1 21 11.5z"
  })), comments), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, ico(/*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("polyline", {
    points: "17 1 21 5 17 9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 13v2a4 4 0 0 1-4 4H3"
  }))), reposts), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto"
    }
  }, ico(/*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
    x1: "22",
    y1: "2",
    x2: "11",
    y2: "13"
  }), /*#__PURE__*/React.createElement("polygon", {
    points: "22 2 15 22 11 13 2 9 22 2"
  })))));
}

/**
 * FeedPost — wraps a visual in the real LinkedIn feed post chrome so a user
 * can preview exactly how it lands in the timeline. Two modes:
 *  - "single"   : one full-bleed image/visual (pass `media`).
 *  - "carousel" : a document viewer with page-count pill, next arrow and
 *                 fullscreen icon (pass `pages` — an array of nodes).
 */
function FeedPost({
  mode = "single",
  author,
  text = "Update: 1 maand na lancering. Dit is wat er de afgelopen 7 dagen is gebeurd:",
  media,
  pages = [],
  docTitle = "Untitled",
  likes,
  comments,
  reposts,
  width = 540,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      background: LI.card,
      borderRadius: 10,
      border: `1px solid ${LI.line}`,
      boxShadow: "0 1px 3px rgba(0,0,0,.08)",
      fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      overflow: "hidden",
      ...style
    }
  }, /*#__PURE__*/React.createElement(PostHeader, {
    author: author
  }), /*#__PURE__*/React.createElement(PostText, {
    text: text
  }), mode === "carousel" ? /*#__PURE__*/React.createElement(CarouselViewer, {
    pages: pages,
    docTitle: docTitle
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#000",
      lineHeight: 0
    }
  }, media), /*#__PURE__*/React.createElement(ActionBar, {
    likes: likes,
    comments: comments,
    reposts: reposts
  }));
}
function CarouselViewer({
  pages,
  docTitle
}) {
  const count = pages.length || 1;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      background: "#000",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 12,
      left: 12,
      zIndex: 3,
      background: "rgba(0,0,0,.62)",
      color: "#fff",
      fontSize: 13,
      fontWeight: 500,
      padding: "5px 11px",
      borderRadius: 7,
      display: "flex",
      alignItems: "center",
      gap: 7,
      maxWidth: "78%"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, docTitle), /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .8
    }
  }, "\xB7"), /*#__PURE__*/React.createElement("span", {
    style: {
      whiteSpace: "nowrap",
      opacity: .9
    }
  }, count, " pages")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      padding: 0
    }
  }, pages.slice(0, 2).map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: "0 0 calc(100% - 56px)",
      aspectRatio: "4 / 5",
      overflow: "hidden",
      borderRadius: i === 0 ? 0 : 8,
      background: "#0b0b0b",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0
    }
  }, p)))), /*#__PURE__*/React.createElement("button", {
    style: {
      position: "absolute",
      top: "50%",
      right: 10,
      transform: "translateY(-50%)",
      zIndex: 3,
      width: 40,
      height: 40,
      borderRadius: "50%",
      border: "none",
      background: "rgba(0,0,0,.55)",
      color: "#fff",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "9 6 15 12 9 18"
  }))), /*#__PURE__*/React.createElement("button", {
    style: {
      position: "absolute",
      bottom: 12,
      right: 12,
      zIndex: 3,
      width: 34,
      height: 34,
      borderRadius: "50%",
      border: "none",
      background: "rgba(0,0,0,.55)",
      color: "#fff",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "15 3 21 3 21 9"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "9 21 3 21 3 15"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "21",
    y1: "3",
    x2: "14",
    y2: "10"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "21",
    x2: "10",
    y2: "14"
  }))));
}
Object.assign(__ds_scope, { FeedPost });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/preview/FeedPost.jsx", error: String((e && e.message) || e) }); }

// components/text/Headline.jsx
try { (() => {
/**
 * Eyebrow — the small all-caps kicker / category label above a headline.
 */
function Eyebrow({
  children,
  color,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontFamily: "var(--font-body)",
      fontWeight: "var(--fw-bold)",
      fontSize: "var(--fz-eyebrow)",
      letterSpacing: "var(--tr-eyebrow)",
      textTransform: "uppercase",
      color: color ?? "var(--muted)",
      ...style
    }
  }, children);
}

/**
 * Headline — the hero of every visual. Gets ONE fixed, recognisable
 * "signature" treatment, kept consistent across a whole series. Wrap the
 * emphasised words in <Mark> to carry the signature shape.
 */
function Headline({
  children,
  size = "md",
  // 'sm' | 'md' | 'lg'
  signature,
  // 'underline' | 'block' | 'bubble' | 'plain'; default reads --signature
  as: Tag = "h2",
  style = {}
}) {
  const sizes = {
    sm: "var(--fz-head-sm)",
    md: "var(--fz-head-md)",
    lg: "var(--fz-head-lg)"
  };
  return /*#__PURE__*/React.createElement(Tag, {
    "data-signature": signature,
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: "var(--fw-bold)",
      fontSize: sizes[size],
      lineHeight: "var(--lh-head)",
      letterSpacing: "var(--tr-tight)",
      color: "var(--fg)",
      margin: 0,
      textWrap: "balance",
      ...style
    }
  }, children);
}

/**
 * Mark — wraps the word(s) in a headline that carry the signature shape.
 * Resolves --signature (or the `signature` prop) to underline / block / bubble.
 */
function Mark({
  children,
  signature,
  style = {}
}) {
  const sig = signature; // when undefined, falls back to the CSS var via class
  const cls = sig === "block" ? "sig-block" : sig === "bubble" ? "sig-bubble" : sig === "plain" ? "" : "sig-underline";
  return /*#__PURE__*/React.createElement("span", {
    className: cls,
    style: style
  }, children);
}

/**
 * Subhead — the supporting line under the headline.
 */
function Subhead({
  children,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: "var(--fw-regular)",
      fontSize: "var(--fz-subhead)",
      lineHeight: "var(--lh-body)",
      color: "var(--muted)",
      margin: 0,
      maxWidth: "760px",
      textWrap: "pretty",
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Eyebrow, Headline, Mark, Subhead });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/text/Headline.jsx", error: String((e && e.message) || e) }); }

// ui_kits/setup/Setup.jsx
try { (() => {
/* Brand Setup wizard — window.Setup
   A first-run, multi-step wizard (loaded via Babel in START HERE.html).
   Walks a non-designer through: Welcome → Brand source (Figma / GitHub / file /
   manual) → Colours → Type & signature → Done. Produces the exact
   `overrides/brand.css` AND a one-click "Copy for the assistant" message that
   bundles the source + all choices, so the agent can import the Figma/GitHub
   brand and write the overrides. A page can't post into the chat itself —
   this makes handing it over a single paste. Choices persist to localStorage
   and inject a live brand layer so previews reflect them. */
(function () {
  const {
    useState,
    useEffect
  } = React;
  const LS = "li-vds-brand-setup-v1";
  const FONTS = ["Inter", "Plus Jakarta Sans", "Space Grotesk", "Sora", "Manrope", "Figtree", "Outfit", "DM Sans"];
  const SIGS = [["underline", "Underline"], ["block", "Block"], ["bubble", "Bubble"], ["plain", "Plain"]];
  const DEFAULTS = {
    primary: "#0A66C2",
    secondary: "#16232B",
    accent: "#E7A33E",
    tint: 7,
    font: "Inter",
    signature: "underline",
    sourceType: "manual",
    figmaUrl: "",
    githubUrl: "",
    fileName: ""
  };
  const STEPS = ["Welcome", "Brand source", "Colours", "Type & signature", "Done"];
  function loadFont(font) {
    const id = "gf-" + font.replace(/\s+/g, "-");
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id;
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=" + font.replace(/\s+/g, "+") + ":wght@400;500;600;700;800&display=swap";
    document.head.appendChild(l);
  }
  function hexToRgb(hex) {
    const m = hex.replace("#", "");
    const n = m.length === 3 ? m.split("").map(c => c + c).join("") : m;
    const i = parseInt(n, 16);
    return [i >> 16 & 255, i >> 8 & 255, i & 255];
  }
  function lightTint(hex, pct) {
    const [r, g, b] = hexToRgb(hex);
    const a = pct / 100;
    const mix = c => Math.round(c * a + 255 * (1 - a));
    return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
  }
  function cssText(s) {
    return `:root {
  /* ---- Colours -------------------------------------------- */
  --brand-primary:   ${s.primary};
  --brand-secondary: ${s.secondary};
  --brand-accent:    ${s.accent};
  --brand-tint: ${s.tint}%;

  /* ---- Type ----------------------------------------------- */
  /* Add this <link> to the page <head> too:
     <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${s.font.replace(/\s+/g, "+")}:wght@400;500;600;700;800&display=swap"> */
  --brand-font:         '${s.font}', system-ui, sans-serif;
  --brand-font-display: '${s.font}', system-ui, sans-serif;

  /* ---- Headline signature --------------------------------- */
  --signature: ${s.signature};
}`;
  }
  function assistantMsg(s) {
    let src = "No external source — use the values below.";
    if (s.sourceType === "figma" && s.figmaUrl) src = "Figma file: " + s.figmaUrl + "\n(Pull the brand colours, fonts and logo from this Figma file.)";else if (s.sourceType === "github" && s.githubUrl) src = "GitHub repo: " + s.githubUrl + "\n(Pull theme tokens / colours / fonts from this repo.)";else if (s.sourceType === "file" && s.fileName) src = "Figma file \u201c" + s.fileName + "\u201d is attached in this chat.\n(Read it and pull the brand colours, fonts and logo from it.)";
    return `Set up my brand for the LinkedIn Visual Design System.

SOURCE
${src}

MY CHOICES (use these, or override them with what you find in the source)
- Primary (loud canvas):   ${s.primary}
- Secondary (section):     ${s.secondary}
- Accent (highlight):      ${s.accent}
- Light tint:              ${s.tint}%
- Font:                    ${s.font}
- Headline signature:      ${s.signature}

Please write these into overrides/brand.css (load the font's <link> too) and confirm. Then I'll start making visuals.`;
  }
  function Setup() {
    const [step, setStep] = useState(0);
    const [s, setS] = useState(() => {
      try {
        return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(LS)) || {});
      } catch (e) {
        return Object.assign({}, DEFAULTS);
      }
    });
    const [copied, setCopied] = useState("");
    useEffect(() => {
      loadFont(s.font);
    }, [s.font]);
    useEffect(() => {
      try {
        localStorage.setItem(LS, JSON.stringify(s));
      } catch (e) {}
      let el = document.getElementById("brand-live");
      if (!el) {
        el = document.createElement("style");
        el.id = "brand-live";
        document.head.appendChild(el);
      }
      el.textContent = cssText(s);
    }, [s]);
    const set = (k, v) => setS(p => Object.assign({}, p, {
      [k]: v
    }));
    const light = lightTint(s.primary, s.tint);
    const copy = (key, text) => {
      navigator.clipboard && navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1700);
    };
    const sigStyle = s.signature === "underline" ? {
      boxShadow: `inset 0 -0.12em 0 ${s.accent}`
    } : s.signature === "block" ? {
      background: s.accent,
      color: "#fff",
      padding: "0 .12em"
    } : s.signature === "bubble" ? {
      border: `3px solid ${s.accent}`,
      borderRadius: "999px",
      padding: ".02em .35em"
    } : {};

    // ---- shared styles ----
    const shell = {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      fontFamily: `'${s.font}', system-ui, sans-serif`,
      color: "#18181b"
    };
    const main = {
      flex: 1,
      display: "flex",
      gap: 44,
      alignItems: "flex-start",
      maxWidth: 1140,
      width: "100%",
      margin: "0 auto",
      padding: "36px 40px 0",
      boxSizing: "border-box"
    };
    const colLeft = {
      flex: "1 1 0",
      minWidth: 0
    };
    const label = {
      display: "block",
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: ".04em",
      textTransform: "uppercase",
      color: "#6b7280",
      margin: "0 0 10px"
    };
    const h1 = {
      fontFamily: `'${s.font}', sans-serif`,
      fontWeight: 700,
      fontSize: 38,
      letterSpacing: "-.025em",
      margin: "0 0 14px",
      lineHeight: 1.08
    };
    const sub = {
      fontSize: 17,
      lineHeight: 1.55,
      color: "#5a5a5a",
      margin: "0 0 28px",
      maxWidth: 560
    };
    const colorInput = {
      width: 54,
      height: 40,
      border: "1px solid #d8dadd",
      borderRadius: 8,
      background: "#fff",
      padding: 2,
      cursor: "pointer"
    };
    const field = {
      width: "100%",
      padding: "13px 14px",
      fontSize: 15,
      border: "1px solid #d8dadd",
      borderRadius: 10,
      background: "#fff",
      boxSizing: "border-box",
      fontFamily: "inherit"
    };
    const btn = primary => ({
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "13px 26px",
      fontSize: 16,
      fontWeight: 700,
      borderRadius: 11,
      cursor: "pointer",
      border: primary ? "none" : "1px solid #d8dadd",
      background: primary ? s.primary : "#fff",
      color: primary ? "#fff" : "#3a3f45"
    });
    function Color({
      k,
      name
    }) {
      return React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12
        }
      }, React.createElement("input", {
        type: "color",
        value: s[k],
        onChange: e => set(k, e.target.value),
        style: colorInput
      }), React.createElement("div", null, React.createElement("div", {
        style: {
          fontWeight: 600,
          fontSize: 15
        }
      }, name), React.createElement("div", {
        style: {
          fontSize: 13,
          color: "#8a9098",
          fontFamily: "monospace"
        }
      }, s[k])));
    }
    function Preview() {
      const card = (bg, fg, kicker, kickerColor, title, body) => React.createElement("div", {
        style: {
          flex: 1,
          aspectRatio: "4/5",
          borderRadius: 12,
          background: bg,
          color: fg,
          padding: 18,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          boxShadow: "0 6px 22px rgba(0,0,0,.10)"
        }
      }, React.createElement("div", {
        style: {
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: kickerColor
        }
      }, kicker), React.createElement("div", {
        style: {
          fontFamily: `'${s.font}', sans-serif`,
          fontWeight: 700,
          fontSize: 21,
          lineHeight: 1.1,
          marginTop: 7
        }
      }, title, body));
      return React.createElement("div", {
        style: {
          display: "flex",
          gap: 12
        }
      }, card(s.primary, "#fff", "Loud", "rgba(255,255,255,.7)", "Cover headline", null), card(light, "#18181b", "Light", "#8a9098", "A point worth ", React.createElement("span", {
        style: sigStyle
      }, "saving")), card(s.secondary, "#fff", "Section", s.accent, "Chapter marker", null));
    }

    // ---- step bodies ----
    let body;
    if (step === 0) {
      body = React.createElement("div", {
        style: colLeft
      }, React.createElement("div", {
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: s.primary,
          marginBottom: 18
        }
      }, React.createElement("span", {
        style: {
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: s.primary
        }
      }), "LinkedIn Visual Design System"), React.createElement("h1", {
        style: h1
      }, "Welcome — let's set up your brand first."), React.createElement("p", {
        style: sub
      }, "Five quick steps: point us at your Figma or GitHub (optional), then pick colours, font and your headline signature. A live preview shows your style as you go. Everything you set is yours and survives every update."), React.createElement("div", {
        style: {
          display: "flex",
          gap: 28,
          margin: "8px 0 32px",
          flexWrap: "wrap"
        }
      }, [["1", "Source", "Figma, GitHub, a .fig file — or skip"], ["2", "Colours", "Loud, section & accent"], ["3", "Type", "Font + headline signature"], ["4", "Hand off", "One paste to the assistant"]].map(x => React.createElement("div", {
        key: x[0],
        style: {
          flex: 1,
          minWidth: 150
        }
      }, React.createElement("div", {
        style: {
          fontWeight: 700,
          fontSize: 14,
          marginBottom: 4
        }
      }, x[0] + " · " + x[1]), React.createElement("div", {
        style: {
          fontSize: 13.5,
          color: "#8a9098",
          lineHeight: 1.45
        }
      }, x[2])))));
    } else if (step === 1) {
      const opt = (val, title, desc) => React.createElement("button", {
        onClick: () => set("sourceType", val),
        style: {
          textAlign: "left",
          width: "100%",
          padding: "16px 18px",
          marginBottom: 12,
          borderRadius: 12,
          cursor: "pointer",
          background: "#fff",
          border: "1.5px solid " + (s.sourceType === val ? s.primary : "#d8dadd"),
          boxShadow: s.sourceType === val ? `0 0 0 3px ${lightTint(s.primary, 12)}` : "none"
        }
      }, React.createElement("div", {
        style: {
          fontWeight: 700,
          fontSize: 16
        }
      }, title), React.createElement("div", {
        style: {
          fontSize: 14,
          color: "#8a9098",
          marginTop: 3,
          lineHeight: 1.4
        }
      }, desc));
      body = React.createElement("div", {
        style: colLeft
      }, React.createElement("h1", {
        style: h1
      }, "Where should your brand come from?"), React.createElement("p", {
        style: sub
      }, "If you have a Figma file or a GitHub repo, the assistant can pull your real colours, fonts and logo from it. No source? Just set it by hand in the next steps."), opt("figma", "Figma file", "Paste a share link — the assistant imports the brand from it."), s.sourceType === "figma" && React.createElement("input", {
        style: Object.assign({}, field, {
          marginBottom: 12
        }),
        placeholder: "https://www.figma.com/file/…",
        value: s.figmaUrl,
        onChange: e => set("figmaUrl", e.target.value)
      }), opt("github", "GitHub repo", "Paste the repo URL — pulls theme tokens / colours / fonts."), s.sourceType === "github" && React.createElement("input", {
        style: Object.assign({}, field, {
          marginBottom: 12
        }),
        placeholder: "https://github.com/owner/repo",
        value: s.githubUrl,
        onChange: e => set("githubUrl", e.target.value)
      }), opt("file", "Upload a .fig file", "Pick the file, then attach it in the chat so the assistant can read it."), s.sourceType === "file" && React.createElement("div", {
        style: {
          marginBottom: 12
        }
      }, React.createElement("label", {
        style: Object.assign({}, btn(false), {
          fontSize: 14,
          padding: "10px 18px"
        })
      }, "Choose .fig file", React.createElement("input", {
        type: "file",
        accept: ".fig",
        style: {
          display: "none"
        },
        onChange: e => set("fileName", e.target.files[0] ? e.target.files[0].name : "")
      })), s.fileName && React.createElement("div", {
        style: {
          fontSize: 13.5,
          color: "#1f8a5b",
          fontWeight: 600,
          marginTop: 8
        }
      }, "✓ " + s.fileName + " — remember to also attach it in the chat."), s.fileName && React.createElement("div", {
        style: {
          fontSize: 13,
          color: "#8a9098",
          marginTop: 4,
          lineHeight: 1.4
        }
      }, "A page can't send the file itself, so drag it into the chat as well.")), opt("manual", "Set it manually", "No source — pick colours and type yourself."));
    } else if (step === 2) {
      body = React.createElement("div", {
        style: colLeft
      }, React.createElement("h1", {
        style: h1
      }, "Your colours"), React.createElement("p", {
        style: sub
      }, "Three roles drive every visual: a loud cover colour, a deep section colour, and an accent for highlights."), React.createElement(Color, {
        k: "primary",
        name: "Primary — loud canvas (cover / back)"
      }), React.createElement(Color, {
        k: "secondary",
        name: "Secondary — section canvas (chapters)"
      }), React.createElement(Color, {
        k: "accent",
        name: "Accent — highlight / mark"
      }), React.createElement("div", {
        style: {
          marginTop: 22
        }
      }, React.createElement("span", {
        style: label
      }, "Light-canvas tint · " + s.tint + "%"), React.createElement("input", {
        type: "range",
        min: 3,
        max: 16,
        value: s.tint,
        onChange: e => set("tint", +e.target.value),
        style: {
          width: "100%",
          accentColor: s.primary
        }
      })));
    } else if (step === 3) {
      body = React.createElement("div", {
        style: colLeft
      }, React.createElement("h1", {
        style: h1
      }, "Type & signature"), React.createElement("p", {
        style: sub
      }, "Pick the font everything is set in, and how a highlighted word looks in your headlines."), React.createElement("div", {
        style: {
          marginBottom: 24
        }
      }, React.createElement("span", {
        style: label
      }, "Font"), React.createElement("select", {
        value: s.font,
        onChange: e => set("font", e.target.value),
        style: Object.assign({}, field, {
          fontFamily: `'${s.font}', sans-serif`
        })
      }, FONTS.map(f => React.createElement("option", {
        key: f,
        value: f
      }, f)))), React.createElement("div", null, React.createElement("span", {
        style: label
      }, "Headline signature"), React.createElement("div", {
        style: {
          display: "flex",
          gap: 10,
          flexWrap: "wrap"
        }
      }, SIGS.map(([val, name]) => React.createElement("button", {
        key: val,
        onClick: () => set("signature", val),
        style: {
          flex: 1,
          minWidth: 84,
          padding: "11px 8px",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          borderRadius: 9,
          border: "1.5px solid " + (s.signature === val ? s.primary : "#d8dadd"),
          background: s.signature === val ? s.primary : "#fff",
          color: s.signature === val ? "#fff" : "#3a3f45"
        }
      }, name)))));
    } else {
      // Done — hand off
      body = React.createElement("div", {
        style: colLeft
      }, React.createElement("h1", {
        style: h1
      }, "You're set. Hand it to the assistant."), React.createElement("p", {
        style: sub
      }, "One paste does it: the message below tells the assistant your source and choices, so it imports your brand and writes the overrides for you. (A page can't post into the chat on its own.)"), React.createElement("button", {
        onClick: () => copy("msg", assistantMsg(s)),
        style: Object.assign({}, btn(true), {
          marginBottom: 16
        })
      }, copied === "msg" ? "Copied — now paste in chat ✓" : "Copy for the assistant"), React.createElement("details", {
        style: {
          marginTop: 6
        }
      }, React.createElement("summary", {
        style: {
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 600,
          color: "#6b7280"
        }
      }, "Or paste overrides/brand.css yourself"), React.createElement("div", {
        style: {
          background: "#16232b",
          borderRadius: 14,
          overflow: "hidden",
          marginTop: 12
        }
      }, React.createElement("div", {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,.1)"
        }
      }, React.createElement("span", {
        style: {
          color: "#cfd3d8",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "monospace"
        }
      }, "overrides/brand.css"), React.createElement("button", {
        onClick: () => copy("css", cssText(s)),
        style: {
          background: s.primary,
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "7px 14px",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer"
        }
      }, copied === "css" ? "Copied ✓" : "Copy")), React.createElement("pre", {
        style: {
          margin: 0,
          padding: "16px 18px",
          color: "#e6edf3",
          fontSize: 12.5,
          lineHeight: 1.5,
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          overflowX: "auto"
        }
      }, cssText(s)))));
    }
    const showPreview = step >= 2;
    return React.createElement("div", {
      style: shell
    },
    // stepper
    React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        justifyContent: "center",
        padding: "26px 20px 6px",
        flexWrap: "wrap"
      }
    }, STEPS.map((name, i) => React.createElement("div", {
      key: name,
      onClick: () => i <= step && setStep(i),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: i <= step ? "pointer" : "default",
        opacity: i <= step ? 1 : .5
      }
    }, React.createElement("span", {
      style: {
        width: 26,
        height: 26,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 700,
        background: i < step ? s.primary : i === step ? s.primary : "#e2e5e9",
        color: i <= step ? "#fff" : "#9aa0a6"
      }
    }, i < step ? "✓" : i + 1), React.createElement("span", {
      style: {
        fontSize: 13.5,
        fontWeight: 600,
        color: i === step ? "#18181b" : "#9aa0a6"
      }
    }, name), i < STEPS.length - 1 && React.createElement("span", {
      style: {
        width: 22,
        height: 2,
        background: "#e2e5e9",
        marginLeft: 4
      }
    })))), React.createElement("div", {
      style: main
    }, body, showPreview && React.createElement("div", {
      style: {
        flex: "0 0 440px",
        maxWidth: 440,
        position: "sticky",
        top: 20
      }
    }, React.createElement("span", {
      style: label
    }, "Live preview"), React.createElement(Preview))),
    // nav
    React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        maxWidth: 1140,
        width: "100%",
        margin: "0 auto",
        padding: "28px 40px 40px",
        boxSizing: "border-box"
      }
    }, React.createElement("button", {
      onClick: () => setStep(Math.max(0, step - 1)),
      style: Object.assign({}, btn(false), {
        visibility: step === 0 ? "hidden" : "visible"
      })
    }, "← Back"), step < STEPS.length - 1 ? React.createElement("button", {
      onClick: () => setStep(step + 1),
      style: btn(true)
    }, step === 0 ? "Get started →" : "Next →") : React.createElement("a", {
      href: "Visual Board.html",
      style: Object.assign({}, btn(true), {
        textDecoration: "none"
      })
    }, "Start making visuals →")));
  }
  window.Setup = Setup;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/setup/Setup.jsx", error: String((e && e.message) || e) }); }

// ui_kits/update-center/UpdateCenter.jsx
try { (() => {
/* Update Center — the branch's daily update check.
   Compares this branch's version to the published master manifest,
   auto-checks on load if it hasn't in 24h, shows any pending release
   (changelog + included templates/components), and applies ONLY after
   the user confirms. overrides/ and client/ are never touched. */
(function () {
  const {
    useState,
    useEffect,
    useCallback
  } = React;
  const h = React.createElement;
  const VKEY = "li-vds-branch-version";
  const CKEY = "li-vds-last-check";
  const DEMO_BRANCH = "0.9.0"; // demo default so the update flow is visible

  const semver = v => String(v).split(".").map(Number);
  const isBehind = (a, b) => {
    const x = semver(a),
      y = semver(b);
    for (let i = 0; i < 3; i++) {
      if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) < (y[i] || 0);
    }
    return false;
  };
  const fmt = ts => {
    if (!ts) return "never";
    const d = (Date.now() - ts) / 3600000;
    if (d < 1) return "just now";
    if (d < 24) return Math.floor(d) + "h ago";
    return Math.floor(d / 24) + "d ago";
  };
  function UpdateCenter() {
    const [branch, setBranch] = useState(() => localStorage.getItem(VKEY) || DEMO_BRANCH);
    const [master, setMaster] = useState(null);
    const [status, setStatus] = useState("idle"); // idle|checking|done|error
    const [lastCheck, setLastCheck] = useState(() => Number(localStorage.getItem(CKEY)) || 0);
    const [confirming, setConfirming] = useState(false);
    const [toast, setToast] = useState(null);
    const flash = m => {
      setToast(m);
      clearTimeout(flash._t);
      flash._t = setTimeout(() => setToast(null), 2600);
    };
    const check = useCallback(async () => {
      setStatus("checking");
      try {
        const res = await fetch("../../update-manifest.json", {
          cache: "no-store"
        });
        const m = await res.json();
        setMaster(m);
        setStatus("done");
        const now = Date.now();
        setLastCheck(now);
        localStorage.setItem(CKEY, String(now));
      } catch (e) {
        setStatus("error");
      }
    }, []);

    // daily auto-check: run on load if never checked or >24h ago
    useEffect(() => {
      const stale = !lastCheck || Date.now() - lastCheck > 24 * 3600000;
      if (stale) check();else check(); // always fetch latest on open; cadence note below reflects the 24h rule
    }, [check]);
    const behind = master && isBehind(branch, master.version);
    const pending = behind ? (master.releases || []).filter(r => isBehind(branch, r.version)).sort((a, b) => isBehind(a.version, b.version) ? -1 : 1) : [];
    const cadence = master ? master.checkCadenceHours || 24 : 24;
    const apply = () => {
      setConfirming(false);
      setBranch(master.version);
      localStorage.setItem(VKEY, master.version);
      flash("Update applied — your overrides & learned items are untouched.");
    };
    const resetDemo = () => {
      localStorage.setItem(VKEY, DEMO_BRANCH);
      setBranch(DEMO_BRANCH);
      flash("Demo reset — a pending update is available again.");
    };
    return h("div", {
      style: {
        minHeight: "100vh",
        background: "#f1f2f4",
        fontFamily: "system-ui,-apple-system,sans-serif",
        color: "#1f2328",
        padding: "32px 0"
      }
    }, [h("div", {
      key: "wrap",
      style: {
        maxWidth: 760,
        margin: "0 auto",
        padding: "0 24px"
      }
    }, [/* header */
    h("div", {
      key: "hd",
      style: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 20
      }
    }, [h("div", {
      key: "l"
    }, [h("div", {
      key: "t",
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 24,
        letterSpacing: "-.02em"
      }
    }, "Update Center"), h("div", {
      key: "s",
      style: {
        fontSize: 14,
        color: "#6b7280",
        marginTop: 3
      }
    }, "Your branch stays current with the master design system.")]), h("button", {
      key: "c",
      onClick: check,
      disabled: status === "checking",
      style: {
        padding: "9px 16px",
        borderRadius: 9,
        border: "1px solid #d8dadd",
        background: "#fff",
        color: "#1f2328",
        fontSize: 13.5,
        fontWeight: 600,
        cursor: "pointer"
      }
    }, status === "checking" ? "Checking…" : "Check now")]), /* version status card */
    h("div", {
      key: "ver",
      style: card()
    }, [h("div", {
      key: "row",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 20
      }
    }, [verBox("This branch", branch, "#1f2328"), h("div", {
      key: "ar",
      style: {
        color: "#c0c4c9",
        fontSize: 22
      }
    }, "→"), verBox("Master", master ? master.version : "…", behind ? "#0A66C2" : "#1f8a5b"), h("div", {
      key: "st",
      style: {
        marginLeft: "auto",
        textAlign: "right"
      }
    }, [h("div", {
      key: "b",
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "6px 12px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        background: behind ? "#eef4fc" : "#e7f6ee",
        color: behind ? "#1d4e85" : "#1f6b43"
      }
    }, behind ? "Update available" : status === "error" ? "Check failed" : "Up to date"), h("div", {
      key: "lc",
      style: {
        fontSize: 12,
        color: "#9aa0a6",
        marginTop: 6
      }
    }, "Last checked " + fmt(lastCheck) + " · auto-checks every " + cadence + "h")])])]), /* pending update */
    behind ? h("div", {
      key: "upd",
      style: {
        ...card(),
        borderColor: "#cfe0f5"
      }
    }, [h("div", {
      key: "h",
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14
      }
    }, [h("span", {
      key: "t",
      style: {
        fontWeight: 700,
        fontSize: 15
      }
    }, `What's in ${master.version}`), h("button", {
      key: "a",
      onClick: () => setConfirming(true),
      style: {
        padding: "10px 18px",
        borderRadius: 9,
        border: "none",
        background: "#0A66C2",
        color: "#fff",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer"
      }
    }, "Apply update")]), ...pending.map((r, i) => h("div", {
      key: i,
      style: {
        padding: "12px 0",
        borderTop: i ? "1px solid #f0f1f3" : "none"
      }
    }, [h("div", {
      key: "v",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 9,
        marginBottom: 6
      }
    }, [h("span", {
      key: "n",
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 14
      }
    }, r.version), h("span", {
      key: "lv",
      style: {
        fontSize: 10.5,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: ".06em",
        padding: "2px 7px",
        borderRadius: 5,
        background: r.level === "major" ? "#fde8e8" : "#eef4fc",
        color: r.level === "major" ? "#a12020" : "#1d4e85"
      }
    }, r.level)]), h("div", {
      key: "s",
      style: {
        fontSize: 13.5,
        color: "#3a3f45",
        lineHeight: 1.5,
        marginBottom: 8
      }
    }, r.summary), chipRow("New templates", r.templates, "#0A66C2"), chipRow("New / updated components", r.components, "#5f6671"), (r.notes || []).length ? h("ul", {
      key: "notes",
      style: {
        margin: "8px 0 0",
        paddingLeft: 18,
        fontSize: 12.5,
        color: "#6b7280",
        lineHeight: 1.6
      }
    }, r.notes.map((n, j) => h("li", {
      key: j
    }, n))) : null]))]) : h("div", {
      key: "ok",
      style: {
        ...card(),
        textAlign: "center",
        color: "#6b7280",
        fontSize: 14
      }
    }, "You're on the latest master. Nothing to apply."), /* enforcement / preflight */
    h("div", {
      key: "enf",
      style: card()
    }, [h("div", {
      key: "t",
      style: {
        fontWeight: 700,
        fontSize: 14,
        marginBottom: 4
      }
    }, "Ownership — what an update can & can't touch"), h("div", {
      key: "s",
      style: {
        fontSize: 12.5,
        color: "#9aa0a6",
        marginBottom: 12
      }
    }, "Enforced on push by tools/check-branch.mjs (CI / git pre-push)."), ownRow("Pushed by master", "principles · components · templates · token defaults · kits", "#1f6b43", "updated"), ownRow("Yours, kept", "overrides/ — colours, fonts, signature, extras", "#b45309", "never overwritten"), ownRow("Yours, kept", "client/ — promoted components, your templates, saved visuals", "#b45309", "never overwritten"), h("div", {
      key: "cmd",
      style: {
        marginTop: 12,
        fontFamily: "ui-monospace,monospace",
        fontSize: 12,
        background: "#0f1419",
        color: "#cfe3ff",
        borderRadius: 9,
        padding: "10px 13px"
      }
    }, "$ node tools/check-branch.mjs   # blocks a push that edits master files")]), h("div", {
      key: "demo",
      style: {
        textAlign: "center",
        marginTop: 14
      }
    }, h("button", {
      onClick: resetDemo,
      style: {
        background: "none",
        border: "none",
        color: "#9aa0a6",
        fontSize: 12,
        textDecoration: "underline",
        cursor: "pointer"
      }
    }, "↺ reset demo (put this branch behind again)"))]), /* confirm modal */
    confirming ? h("div", {
      key: "modal",
      onClick: () => setConfirming(false),
      style: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60
      }
    }, h("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: 440,
        background: "#fff",
        borderRadius: 16,
        padding: "24px 26px",
        boxShadow: "0 20px 60px rgba(0,0,0,.3)"
      }
    }, [h("div", {
      key: "t",
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 19,
        letterSpacing: "-.01em"
      }
    }, `Apply update to ${master.version}?`), h("p", {
      key: "p",
      style: {
        fontSize: 13.5,
        color: "#5f6671",
        lineHeight: 1.55,
        margin: "10px 0 16px"
      }
    }, "This pulls the master fundamentals — components, templates, principles, token defaults. "), h("div", {
      key: "keep",
      style: {
        background: "#e7f6ee",
        border: "1px solid #bce8cf",
        borderRadius: 10,
        padding: "11px 13px",
        fontSize: 13,
        color: "#1f6b43",
        lineHeight: 1.5,
        marginBottom: 18
      }
    }, "✓ Your overrides/ (brand) and client/ (learned variants) stay exactly as they are."), h("div", {
      key: "btns",
      style: {
        display: "flex",
        gap: 10,
        justifyContent: "flex-end"
      }
    }, [h("button", {
      key: "c",
      onClick: () => setConfirming(false),
      style: {
        padding: "10px 16px",
        borderRadius: 9,
        border: "1px solid #d8dadd",
        background: "#fff",
        fontSize: 13.5,
        fontWeight: 600,
        cursor: "pointer",
        color: "#5f6671"
      }
    }, "Not now"), h("button", {
      key: "a",
      onClick: apply,
      style: {
        padding: "10px 18px",
        borderRadius: 9,
        border: "none",
        background: "#0A66C2",
        color: "#fff",
        fontSize: 13.5,
        fontWeight: 700,
        cursor: "pointer"
      }
    }, "Apply update")])])) : null, toast ? h("div", {
      key: "toast",
      style: {
        position: "fixed",
        bottom: 26,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#1f2328",
        color: "#fff",
        padding: "11px 18px",
        borderRadius: 11,
        fontSize: 13.5,
        fontWeight: 500,
        zIndex: 80
      }
    }, toast) : null]);
  }
  function card() {
    return {
      background: "#fff",
      border: "1px solid #e6e8eb",
      borderRadius: 14,
      padding: "18px 20px",
      marginBottom: 16
    };
  }
  function verBox(label, v, color) {
    return h("div", {
      key: label,
      style: {
        textAlign: "center"
      }
    }, [h("div", {
      key: "l",
      style: {
        fontSize: 11.5,
        color: "#9aa0a6",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: ".06em",
        marginBottom: 4
      }
    }, label), h("div", {
      key: "v",
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 28,
        letterSpacing: "-.02em",
        color
      }
    }, v)]);
  }
  function chipRow(label, items, color) {
    if (!items || !items.length) return null;
    return h("div", {
      key: label,
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        alignItems: "center",
        marginBottom: 6
      }
    }, [h("span", {
      key: "l",
      style: {
        fontSize: 11.5,
        fontWeight: 700,
        color: "#9aa0a6",
        marginRight: 4
      }
    }, label + ":"), ...items.map((t, i) => h("span", {
      key: i,
      style: {
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: 999,
        background: "#f1f3f5",
        color,
        border: "1px solid #e6e8eb"
      }
    }, t))]);
  }
  function ownRow(tag, text, color, badge) {
    return h("div", {
      key: text,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "7px 0"
      }
    }, [h("span", {
      key: "d",
      style: {
        width: 9,
        height: 9,
        borderRadius: "50%",
        background: color,
        flex: "none"
      }
    }), h("span", {
      key: "t",
      style: {
        fontSize: 13,
        color: "#3a3f45",
        flex: 1
      }
    }, text), h("span", {
      key: "b",
      style: {
        fontSize: 11,
        fontWeight: 700,
        color
      }
    }, badge)]);
  }
  window.UpdateCenter = UpdateCenter;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/update-center/UpdateCenter.jsx", error: String((e && e.message) || e) }); }

// ui_kits/visual-library/VisualLibrary.jsx
try { (() => {
/* Visual Library — a Canva-style gallery for the design system.
   Hero visual + scrollable reel of all visuals. Each visual has a ⋯ menu:
   Download PNG · Download HTML · Add to design system (approve → learn).  */
(function () {
  const {
    useState,
    useEffect,
    useRef,
    useCallback
  } = React;
  const h = React.createElement;
  const APPROVED_KEY = "li-vds-approved-v1";

  /* ---- theme capture for faithful HTML export ------------------------- */
  function walk(sheet, cb) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch (e) {
      return;
    }
    if (!rules) return;
    for (const r of rules) {
      if (r.styleSheet) {
        walk(r.styleSheet, cb);
      } // @import
      else cb(r);
    }
  }
  function collectThemeCss() {
    let vars = "",
      classes = "";
    for (const sheet of document.styleSheets) {
      walk(sheet, r => {
        if (!r.selectorText) return;
        if (r.selectorText === ":root") vars += r.style.cssText;else if (/^\.(sig-|headline)/.test(r.selectorText)) classes += r.cssText + "\n";
      });
    }
    // include any runtime brand-layer overrides (Tweaks) set on <html>
    vars += document.documentElement.style.cssText;
    return {
      vars,
      classes
    };
  }
  function slug(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "visual";
  }
  function download(href, name) {
    const a = document.createElement("a");
    a.href = href;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  function buildHtmlDoc(node, label) {
    const {
      vars,
      classes
    } = collectThemeCss();
    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>${label}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>:root{${vars}} html,body{margin:0}
body{display:flex;align-items:center;justify-content:center;background:#e6e6e6;min-height:100vh}
${classes}</style></head>
<body>${node.outerHTML}</body></html>`;
  }

  /* ---- icons ---------------------------------------------------------- */
  const Dots = () => h("svg", {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, [h("circle", {
    key: 1,
    cx: 5,
    cy: 12,
    r: 2
  }), h("circle", {
    key: 2,
    cx: 12,
    cy: 12,
    r: 2
  }), h("circle", {
    key: 3,
    cx: 19,
    cy: 12,
    r: 2
  })]);
  const Check = p => h("svg", {
    width: p.s || 16,
    height: p.s || 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 3,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, h("polyline", {
    points: "20 6 9 17 4 12"
  }));
  function MenuItem({
    icon,
    label,
    sub,
    onClick,
    accent
  }) {
    const [hover, setHover] = useState(false);
    return h("button", {
      onClick,
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        textAlign: "left",
        padding: "11px 14px",
        border: "none",
        background: hover ? "#f3f4f6" : "transparent",
        cursor: "pointer",
        borderRadius: 10,
        font: "inherit",
        color: accent ? "var(--brand-primary)" : "#1f2328"
      }
    }, [h("span", {
      key: "i",
      style: {
        width: 20,
        display: "flex",
        justifyContent: "center",
        color: accent ? "var(--brand-primary)" : "#6b7280"
      }
    }, icon), h("span", {
      key: "t",
      style: {
        display: "flex",
        flexDirection: "column",
        lineHeight: 1.25
      }
    }, [h("span", {
      key: "l",
      style: {
        fontWeight: 600,
        fontSize: 14
      }
    }, label), sub ? h("span", {
      key: "s",
      style: {
        fontSize: 12,
        color: "#9aa0a6"
      }
    }, sub) : null])]);
  }
  function VisualLibrary({
    visuals
  }) {
    const [activeId, setActiveId] = useState(visuals[0].id);
    const [menu, setMenu] = useState(null); // {id, x, y}
    const [toast, setToast] = useState(null);
    const [busy, setBusy] = useState(false);
    const [exp, setExp] = useState(null); // {id, kind}
    const [approved, setApproved] = useState(() => {
      try {
        return new Set(JSON.parse(localStorage.getItem(APPROVED_KEY) || "[]"));
      } catch (e) {
        return new Set();
      }
    });
    const expRef = useRef(null);
    const byId = Object.fromEntries(visuals.map(v => [v.id, v]));
    const active = byId[activeId];
    const persist = set => {
      try {
        localStorage.setItem(APPROVED_KEY, JSON.stringify([...set]));
      } catch (e) {}
    };
    const flash = m => {
      setToast(m);
      clearTimeout(flash._t);
      flash._t = setTimeout(() => setToast(null), 2800);
    };
    const openMenu = (e, id) => {
      e.stopPropagation();
      const r = e.currentTarget.getBoundingClientRect();
      setMenu({
        id,
        x: Math.min(r.left, window.innerWidth - 280),
        y: r.bottom + 6
      });
    };

    // run export once the offscreen full-size node is mounted
    useEffect(() => {
      if (!exp) return;
      let cancelled = false;
      const run = async () => {
        setBusy(true);
        await new Promise(r => setTimeout(r, 80));
        const node = expRef.current && expRef.current.firstElementChild;
        const v = byId[exp.id];
        try {
          if (!node) throw new Error("no node");
          if (exp.kind === "png") {
            const url = await window.htmlToImage.toPng(node, {
              width: 1080,
              height: 1350,
              pixelRatio: 1,
              cacheBust: true
            });
            download(url, slug(v.label) + ".png");
            if (!cancelled) flash("Exported " + slug(v.label) + ".png");
          } else {
            const doc = buildHtmlDoc(node, v.label);
            const url = URL.createObjectURL(new Blob([doc], {
              type: "text/html"
            }));
            download(url, slug(v.label) + ".html");
            setTimeout(() => URL.revokeObjectURL(url), 4000);
            if (!cancelled) flash("Exported " + slug(v.label) + ".html");
          }
        } catch (err) {
          if (!cancelled) flash("Export failed — try again");
          console.error(err);
        }
        if (!cancelled) {
          setBusy(false);
          setExp(null);
        }
      };
      run();
      return () => {
        cancelled = true;
      };
    }, [exp]);
    const exportVisual = (id, kind) => {
      setMenu(null);
      setExp({
        id,
        kind
      });
    };
    const toggleApprove = id => {
      setMenu(null);
      setApproved(prev => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
          flash("Removed from the design system");
        } else {
          next.add(id);
          flash("Added — the design system will learn from this variant");
        }
        persist(next);
        return next;
      });
    };
    const menuFor = menu && byId[menu.id];
    return h("div", {
      style: {
        minHeight: "100vh",
        background: "#eceef0",
        fontFamily: "var(--font-body)"
      },
      onClick: () => setMenu(null)
    }, [/* header */
    h("header", {
      key: "hd",
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 32px",
        borderBottom: "1px solid #e0e2e5",
        background: "#fff"
      }
    }, [h("div", {
      key: "l"
    }, [h("div", {
      key: "t",
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 20,
        letterSpacing: "-.01em",
        color: "#1f2328"
      }
    }, "Visual Library"), h("div", {
      key: "s",
      style: {
        fontSize: 13,
        color: "#8a9098",
        marginTop: 2
      }
    }, visuals.length + " visuals · 1080 × 1350 · export PNG or HTML")]), h("div", {
      key: "r",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 13,
        color: "#5f6671"
      }
    }, [h("span", {
      key: "d",
      style: {
        width: 9,
        height: 9,
        borderRadius: "50%",
        background: "var(--brand-primary)"
      }
    }), h("span", {
      key: "t"
    }, approved.size + " approved · feeding the system")])]), /* hero */
    h("section", {
      key: "hero",
      style: {
        display: "flex",
        justifyContent: "center",
        padding: "40px 24px 28px"
      }
    }, h("div", {
      style: {
        position: "relative"
      }
    }, [
    // toolbar
    h("div", {
      key: "tb",
      style: {
        position: "absolute",
        top: -2,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transform: "translateY(-130%)"
      }
    }, [h("div", {
      key: "lbl",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, [h("span", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: ".08em",
        textTransform: "uppercase",
        color: "var(--brand-primary)"
      }
    }, active.type), approved.has(active.id) ? h("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 12,
        fontWeight: 600,
        color: "#1f8a5b",
        background: "#e7f6ee",
        padding: "3px 9px",
        borderRadius: 999
      }
    }, [h(Check, {
      key: "c",
      s: 13
    }), "In design system"]) : null]), h("div", {
      key: "act",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, [h("span", {
      key: "sz",
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#6b7280",
        background: "#fff",
        border: "1px solid #e0e2e5",
        borderRadius: 999,
        padding: "5px 12px"
      }
    }, "1080 × 1350 · PNG / HTML"), h("button", {
      key: "m",
      onClick: e => openMenu(e, active.id),
      style: btn()
    }, h(Dots))])]),
    // stage
    h("div", {
      key: "stage",
      style: {
        width: 1080 * 0.46,
        height: 1350 * 0.46,
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 12px 50px rgba(0,0,0,.16)",
        background: "#fff"
      }
    }, h("div", {
      style: {
        width: 1080,
        height: 1350,
        transform: "scale(0.46)",
        transformOrigin: "top left"
      }
    }, active.render()))])), /* reel */
    h("div", {
      key: "reelwrap",
      style: {
        borderTop: "1px solid #e0e2e5",
        background: "#fff",
        padding: "16px 0"
      }
    }, h("div", {
      style: {
        display: "flex",
        gap: 16,
        overflowX: "auto",
        padding: "4px 32px 10px"
      }
    }, visuals.map(v => h(Thumb, {
      key: v.id,
      v,
      active: v.id === activeId,
      approved: approved.has(v.id),
      onSelect: () => setActiveId(v.id),
      onMenu: e => openMenu(e, v.id)
    })))), /* offscreen full-size node for export */
    exp ? h("div", {
      key: "exp",
      "aria-hidden": "true",
      style: {
        position: "fixed",
        left: -99999,
        top: 0,
        pointerEvents: "none",
        opacity: 0
      }
    }, h("div", {
      ref: expRef
    }, byId[exp.id].render())) : null, /* popover menu */
    menuFor ? h("div", {
      key: "menu",
      onClick: e => e.stopPropagation(),
      style: {
        position: "fixed",
        left: menu.x,
        top: menu.y,
        width: 264,
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 10px 40px rgba(0,0,0,.18)",
        border: "1px solid #ebedf0",
        padding: 7,
        zIndex: 50
      }
    }, [h("div", {
      key: "h",
      style: {
        padding: "8px 12px 6px",
        fontSize: 12,
        color: "#9aa0a6",
        fontWeight: 600,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, menuFor.label), h(MenuItem, {
      key: "png",
      icon: imgIcon(),
      label: "Download as PNG",
      sub: "1080 × 1350 image",
      onClick: () => exportVisual(menuFor.id, "png")
    }), h(MenuItem, {
      key: "html",
      icon: codeIcon(),
      label: "Download as HTML",
      sub: "Standalone, editable file",
      onClick: () => exportVisual(menuFor.id, "html")
    }), h("div", {
      key: "sep",
      style: {
        height: 1,
        background: "#f0f1f3",
        margin: "6px 8px"
      }
    }), h(MenuItem, {
      key: "ds",
      icon: approved.has(menuFor.id) ? h(Check, {}) : plusIcon(),
      label: approved.has(menuFor.id) ? "Remove from design system" : "Add to design system",
      sub: approved.has(menuFor.id) ? "Approved variant" : "Client approved → system learns",
      accent: !approved.has(menuFor.id),
      onClick: () => toggleApprove(menuFor.id)
    })]) : null, busy ? h("div", {
      key: "busy",
      style: {
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,.4)",
        zIndex: 60,
        fontSize: 14,
        color: "#5f6671"
      }
    }, "Exporting…") : null, toast ? h("div", {
      key: "toast",
      style: {
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#1f2328",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 500,
        boxShadow: "0 8px 30px rgba(0,0,0,.25)",
        zIndex: 70
      }
    }, toast) : null]);
  }
  function Thumb({
    v,
    active,
    approved,
    onSelect,
    onMenu
  }) {
    const [hover, setHover] = useState(false);
    return h("div", {
      onClick: onSelect,
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      style: {
        flex: "none",
        width: 1080 * 0.1,
        cursor: "pointer",
        position: "relative"
      }
    }, [h("div", {
      key: "f",
      style: {
        width: 1080 * 0.1,
        height: 1350 * 0.1,
        borderRadius: 4,
        overflow: "hidden",
        background: "#fff",
        boxShadow: active ? "0 0 0 3px var(--brand-primary)" : "0 1px 4px rgba(0,0,0,.14)",
        transition: "box-shadow .12s"
      }
    }, h("div", {
      style: {
        width: 1080,
        height: 1350,
        transform: "scale(0.1)",
        transformOrigin: "top left",
        pointerEvents: "none"
      }
    }, v.render())), hover || active ? h("button", {
      key: "m",
      onClick: onMenu,
      style: {
        position: "absolute",
        top: 6,
        right: 6,
        ...btn(28),
        background: "rgba(255,255,255,.92)"
      }
    }, h(Dots)) : null, approved ? h("span", {
      key: "a",
      style: {
        position: "absolute",
        top: 6,
        left: 6,
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: "#1f8a5b",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, h(Check, {
      s: 13
    })) : null, h("div", {
      key: "l",
      style: {
        fontSize: 11,
        color: active ? "#1f2328" : "#8a9098",
        marginTop: 6,
        lineHeight: 1.3,
        fontWeight: active ? 600 : 400,
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical"
      }
    }, v.label)]);
  }
  function btn(size) {
    const s = size || 34;
    return {
      width: s,
      height: s,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 9,
      border: "1px solid #e0e2e5",
      background: "#fff",
      color: "#5f6671",
      cursor: "pointer",
      padding: 0
    };
  }
  const imgIcon = () => h("svg", {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, [h("rect", {
    key: 1,
    x: 3,
    y: 3,
    width: 18,
    height: 18,
    rx: 2
  }), h("circle", {
    key: 2,
    cx: 8.5,
    cy: 8.5,
    r: 1.5
  }), h("polyline", {
    key: 3,
    points: "21 15 16 10 5 21"
  })]);
  const codeIcon = () => h("svg", {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, [h("polyline", {
    key: 1,
    points: "16 18 22 12 16 6"
  }), h("polyline", {
    key: 2,
    points: "8 6 2 12 8 18"
  })]);
  const plusIcon = () => h("svg", {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.4,
    strokeLinecap: "round"
  }, [h("line", {
    key: 1,
    x1: 12,
    y1: 5,
    x2: 12,
    y2: 19
  }), h("line", {
    key: 2,
    x1: 5,
    y1: 12,
    x2: 19,
    y2: 12
  })]);
  window.VisualLibrary = VisualLibrary;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/visual-library/VisualLibrary.jsx", error: String((e && e.message) || e) }); }

// ui_kits/visual-library/sampleVisuals.jsx
try { (() => {
/* Sample LinkedIn visuals built from the design-system components.
   Each entry: { id, label, type, render() -> ReactNode (a 1080×1350 Canvas) }.
   The Visual Library renders these scaled, and exports them at true size. */
(function () {
  const DS = window.LinkedInVisualDesignSystemTesting_727cb3;
  const {
    Canvas,
    Chrome,
    Eyebrow,
    Headline,
    Mark,
    Subhead,
    Stat,
    StatBox,
    StatRow,
    Quote,
    Attribution,
    InfoCard,
    Chip,
    Cta,
    BrowserMock
  } = DS;
  const h = React.createElement;

  // shorthand for an absolutely-placed content block inside a Canvas
  const Block = (props, children) => h("div", {
    style: {
      position: "absolute",
      left: "var(--margin)",
      right: "var(--margin)",
      ...(props.style || {})
    }
  }, children);
  const VISUALS = [{
    id: "single-donut",
    label: "Most outreach fails on the first line",
    type: "Single",
    render: () => h(Canvas, {
      role: "light"
    }, [h(Chrome, {
      key: "c",
      name: "Your name",
      category: "Outreach",
      position: "top"
    }), Block({
      style: {
        top: "210px"
      }
    }, [h(Eyebrow, {
      key: "e"
    }, "The re-hook"), h(Headline, {
      key: "h",
      size: "lg",
      style: {
        marginTop: 18
      }
    }, ["Most outreach fails on the ", h(Mark, {
      key: "m"
    }, "first line")]), h(Subhead, {
      key: "s",
      style: {
        marginTop: 24
      }
    }, "One supporting line that adds the context the hook left out.")]), h("div", {
      key: "d",
      style: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: "190px",
        display: "flex",
        justifyContent: "center"
      }
    }, h("div", {
      style: {
        position: "relative",
        width: 520,
        height: 520,
        borderRadius: "50%",
        background: "conic-gradient(var(--brand-primary) 0 68%, var(--canvas-light-soft) 68% 100%)"
      }
    }, h("div", {
      style: {
        position: "absolute",
        inset: 120,
        borderRadius: "50%",
        background: "var(--canvas-light-bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }
    }, [h("span", {
      key: "n",
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 130,
        letterSpacing: "-.04em",
        lineHeight: .9,
        color: "var(--fg)"
      }
    }, "68%"), h("span", {
      key: "c",
      style: {
        fontWeight: 500,
        fontSize: 28,
        color: "var(--muted)",
        marginTop: 6
      }
    }, "never read past it")])))])
  }, {
    id: "catalog",
    label: "You're picking from a catalog of crap",
    type: "Infographic",
    render: () => h(Canvas, {
      role: "light",
      density: "tight"
    }, [h("div", {
      key: "bar",
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, [h("span", {
      key: "n",
      style: {
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: ".06em"
      }
    }, "Your name"), h("span", {
      key: "c",
      style: {
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: ".06em",
        color: "var(--muted)"
      }
    }, "Positioning · GTM")]), h("div", {
      key: "hd",
      style: {
        marginTop: 36
      }
    }, [h(Eyebrow, {
      key: "e"
    }, "Open five homepages in your space"), h(Headline, {
      key: "h",
      size: "md",
      style: {
        marginTop: 14
      }
    }, ["You're picking from a ", h(Mark, {
      key: "m"
    }, "catalog of crap")])]), h("div", {
      key: "grid",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 22,
        marginTop: 40
      }
    }, [h(BrowserMock, {
      key: 1,
      title: "Saves you time"
    }), h(BrowserMock, {
      key: 2,
      title: "AI-powered"
    }), h(BrowserMock, {
      key: 3,
      title: "Built for teams like yours"
    }), h(BrowserMock, {
      key: 4,
      title: "Enterprise-grade security"
    }), h(BrowserMock, {
      key: 5,
      title: "Seamless integration"
    }), h(BrowserMock, {
      key: 6,
      title: "What only you can claim",
      cta: "Write your own brief →",
      emphasis: true
    })])])
  }, {
    id: "quote-light",
    label: "The visual carries the save, not the caption",
    type: "Quote",
    render: () => h(Canvas, {
      role: "light"
    }, [h(Chrome, {
      key: "c",
      name: "Your name",
      category: "Content",
      position: "top"
    }), h("div", {
      key: "q",
      style: {
        position: "absolute",
        left: "var(--margin)",
        right: "150px",
        top: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }
    }, [h(Quote, {
      key: "qt",
      label: "QUOTE"
    }, "The visual carries the save, not the caption."), h(Attribution, {
      key: "a",
      name: "Full name",
      role: "Role · company",
      style: {
        marginTop: 70
      }
    })])])
  }, {
    id: "carousel-cover",
    label: "How I write cold DMs that get replies",
    type: "Carousel · cover",
    render: () => h(Canvas, {
      role: "loud"
    }, [Block({
      style: {
        top: "150px"
      }
    }, [h(Eyebrow, {
      key: "e"
    }, "A carousel about"), h(Headline, {
      key: "h",
      size: "lg",
      style: {
        marginTop: 18
      }
    }, "How I write cold DMs that get replies"), h(Subhead, {
      key: "s",
      style: {
        marginTop: 30,
        color: "var(--canvas-loud-muted)"
      }
    }, "The exact structure — swipe through.")]), h(Chrome, {
      key: "c",
      name: "Your name",
      category: "Outreach",
      position: "bottom",
      swipe: true
    })])
  }, {
    id: "section-result",
    label: "3.4× more replies",
    type: "Carousel · result",
    render: () => h(Canvas, {
      role: "section"
    }, [h(Chrome, {
      key: "c",
      name: "Your name",
      category: "Outreach",
      position: "top"
    }), h("div", {
      key: "r",
      style: {
        position: "absolute",
        left: "var(--margin)",
        right: "var(--margin)",
        top: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }
    }, [h(Eyebrow, {
      key: "e",
      color: "var(--accent)"
    }, "The result"), h(Stat, {
      key: "s",
      value: "3.4×",
      caption: "more replies than the template everyone copies.",
      align: "left",
      size: "xl",
      style: {
        marginTop: 10
      }
    })])])
  }, {
    id: "case-results",
    label: "0 → 10k followers in 90 days",
    type: "Infographic · case study",
    render: () => h(Canvas, {
      role: "light",
      density: "tight"
    }, [h("div", {
      key: "bar",
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, [h("span", {
      key: "n",
      style: {
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: ".06em"
      }
    }, "Your name"), h("span", {
      key: "c",
      style: {
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: ".06em",
        color: "var(--muted)"
      }
    }, "Case study")]), h(Headline, {
      key: "h",
      size: "sm",
      style: {
        marginTop: 44
      }
    }, ["From ", h(Mark, {
      key: "m"
    }, "0 to 10k"), " followers in 90 days"]), h("div", {
      key: "cards",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 22,
        marginTop: 36
      }
    }, [h(InfoCard, {
      key: 1,
      number: 1,
      label: "Audit",
      heading: "We mapped what already worked"
    }, h("div", {
      style: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap"
      }
    }, [h(Chip, {
      key: "a"
    }, "Top posts"), h(Chip, {
      key: "b"
    }, "Hooks")])), h(InfoCard, {
      key: 2,
      number: 2,
      label: "Format",
      heading: "Carousels became the engine",
      emphasis: true
    })]), h(StatRow, {
      key: "res",
      label: "RESULTS",
      style: {
        position: "absolute",
        left: "var(--margin-tight)",
        right: "var(--margin-tight)",
        bottom: "120px"
      }
    }, [h(StatBox, {
      key: 1,
      value: "10k",
      caption: "followers"
    }), h(StatBox, {
      key: 2,
      value: "90",
      caption: "days"
    }), h(StatBox, {
      key: 3,
      value: "5.2×",
      caption: "reach"
    })])])
  }];
  window.SAMPLE_VISUALS = VISUALS;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/visual-library/sampleVisuals.jsx", error: String((e && e.message) || e) }); }

// visual-board.js
try { (() => {
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
   · "+ New visual" / "Iterate" prompt the user back to the chat, where the
     assistant runs the brief questions before building 3 variants. */
(function () {
  function boot() {
    var source = document.getElementById("source");
    var reel = document.getElementById("reel");
    if (!source || !reel) {
      return requestAnimationFrame(boot);
    }
    init(source, reel);
  }
  function init(source, reel) {
    var APPROVED_KEY = "li-vds-board-approved-v1";
    var CHOSEN_KEY = "li-vds-board-chosen-v1";
    var EDITS_KEY = "li-vds-board-edits-v1";
    var SLIDES_KEY = "li-vds-board-slidepos-v1";
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
      if (!rounds.length) {
        var loose = [].slice.call(sec.querySelectorAll(".artboard"));
        if (loose.length) rounds = [loose];
      }
      return {
        el: sec,
        label: sec.getAttribute("data-label") || "Visual " + (vi + 1),
        type: sec.getAttribute("data-type") || "visual",
        rounds: rounds
      };
    }).filter(function (v) {
      return v.rounds.length;
    });
    var chosenStore = loadJSON(CHOSEN_KEY, {});
    var approved = new Set(loadJSON(APPROVED_KEY, []));
    var editsStore = loadJSON(EDITS_KEY, {}); // { "label#round#variant": editedInnerHTML }
    var slidePos = loadJSON(SLIDES_KEY, {}); // { "label#round#variant": currentSlideIndex } (carousels)
    var activeIdx = 0;
    var focus = {
      round: 0,
      variant: 0
    };
    var menuTarget = null;
    var editing = false;
    var heroArt = null,
      heroScale = 1,
      editorTarget = null;
    var zoom = 1; // 1 = fit-to-stage; user can zoom in/out

    function loadJSON(k, d) {
      try {
        var v = JSON.parse(localStorage.getItem(k));
        return v == null ? d : v;
      } catch (e) {
        return d;
      }
    }
    function saveJSON(k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch (e) {}
    }
    function slug(s) {
      return (s || "visual").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "visual";
    }
    function flash(m) {
      toast.textContent = m;
      toast.style.display = "block";
      clearTimeout(flash._t);
      flash._t = setTimeout(function () {
        toast.style.display = "none";
      }, 2800);
    }
    function letter(i) {
      return String.fromCharCode(65 + i);
    }
    function chosenOf(vi, ri) {
      var key = visuals[vi].label + "#" + ri;
      if (chosenStore[key] != null) return chosenStore[key];
      var arr = visuals[vi].rounds[ri];
      for (var i = 0; i < arr.length; i++) if (arr[i].hasAttribute("data-chosen")) return i;
      return 0;
    }
    function setChosen(vi, ri, varIdx) {
      chosenStore[visuals[vi].label + "#" + ri] = varIdx;
      saveJSON(CHOSEN_KEY, chosenStore);
    }
    function lastRound(vi) {
      return visuals[vi].rounds.length - 1;
    }
    function variantCount(vi) {
      return visuals[vi].rounds.reduce(function (n, r) {
        return n + r.length;
      }, 0);
    }
    function editKey(vi, ri, varIdx) {
      return visuals[vi].label + "#" + ri + "#" + varIdx;
    }

    /* ---- carousel helpers (a variant can be a multi-slide carousel) ---- */
    function slidesOf(node) {
      return [].slice.call(node.querySelectorAll(":scope > .cslide"));
    }
    function slideCount(vi, ri, varIdx) {
      return slidesOf(visuals[vi].rounds[ri][varIdx]).length;
    }
    function isCarousel(vi, ri, varIdx) {
      return slideCount(vi, ri, varIdx) > 1;
    }
    function curSlideOf(vi, ri, varIdx) {
      var n = slideCount(vi, ri, varIdx);
      return Math.max(0, Math.min(slidePos[editKey(vi, ri, varIdx)] || 0, Math.max(0, n - 1)));
    }
    function curSlide() {
      return curSlideOf(activeIdx, focus.round, focus.variant);
    }
    function gotoSlide(n) {
      slidePos[editKey(activeIdx, focus.round, focus.variant)] = n;
      saveJSON(SLIDES_KEY, slidePos);
      renderHero();
    }

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
      var clone = makeClone(vi, ri, varIdx);
      wrap.appendChild(clone);
      var cs = [].slice.call(clone.querySelectorAll(":scope > .cslide"));
      if (cs.length > 1) cs.forEach(function (el, idx) {
        el.style.display = idx === 0 ? "block" : "none";
      }); // thumb = slide 1
      into.appendChild(wrap);
    }

    /* ---- hero (responsive: fills the stage above the dock) ---- */
    function setZoomLabel(s) {
      var zp = document.getElementById("zoomPct");
      if (zp) zp.textContent = Math.round(s * 100) + "%";
    }
    function setHeroMeta(v, carousel, cur, n) {
      heroType.textContent = v.type;
      heroVer.innerHTML = "v<b>" + (focus.round + 1) + "</b> · variant <b>" + letter(focus.variant) + "</b>" + (carousel ? cur == null ? " · <b>" + n + "</b> slides" : " · slide <b>" + (cur + 1) + "/" + n + "</b>" : "");
      var isChosen = focus.variant === chosenOf(activeIdx, focus.round);
      heroChosen.style.display = "inline-flex";
      heroChosen.classList.toggle("is-chosen", isChosen);
      heroChosen.innerHTML = isChosen ? "★ Chosen" : "☆ Choose this variant";
      heroChosen.title = isChosen ? "This is the picked variant for v" + (focus.round + 1) : "Pick this variant as the winner for v" + (focus.round + 1);
      heroBadge.style.display = approved.has(v.label) ? "inline-flex" : "none";
    }
    function renderHero() {
      var v = visuals[activeIdx];
      var availH = stageEl.clientHeight - 92; // top padding/bar (-34) + bottom hint room
      var availW = stageEl.clientWidth - 48;
      var art = makeClone(activeIdx, focus.round, focus.variant);
      var slides = slidesOf(art);
      var carousel = slides.length > 1;

      // CAROUSEL (not editing) → show ALL slides side-by-side as a scrollable filmstrip
      if (carousel && !editing) {
        renderFilmstrip(v, art, slides, availH, availW);
        return;
      }

      // single visual — OR a carousel while editing (one slide at a time, so edits target it)
      var fit = Math.min(availW / 1080, availH / 1350); // scale that fits BOTH dimensions
      if (!(fit > 0)) fit = 0.3;
      var s = Math.max(0.04, fit * zoom);
      heroStage.className = "";
      heroStage.style.cssText = "";
      heroStage.style.width = Math.round(1080 * s) + "px";
      heroStage.style.height = Math.round(1350 * s) + "px";
      setZoomLabel(s);
      heroStage.innerHTML = "";
      var wrap = document.createElement("div");
      wrap.className = "artscale";
      wrap.style.cssText = "width:1080px;height:1350px;transform:scale(" + s + ");transform-origin:top left;" + (editing ? "" : "pointer-events:none");
      wrap.appendChild(art);
      heroStage.appendChild(wrap);
      heroArt = art;
      heroScale = s;
      var cur = carousel ? curSlide() : 0;
      if (carousel) slides.forEach(function (el, idx) {
        el.style.display = idx === cur ? "block" : "none";
      });
      editorTarget = carousel ? slides[cur] : art; // edits target the visible slide
      renderCarouselNav(carousel, cur, slides.length);
      if (editing && window.BoardEditor) BoardEditor.setTarget(editorTarget, s);
      setHeroMeta(v, carousel, cur, slides.length);
    }

    /* carousel review = a horizontal filmstrip of every slide (scroll / drag to pan) */
    function renderFilmstrip(v, art, slides, availH, availW) {
      var s = Math.max(0.04, availH / 1350 * zoom);
      var cardW = Math.round(1080 * s),
        cardH = Math.round(1350 * s);
      setZoomLabel(s);
      renderCarouselNav(false, 0, 0); // no per-slide arrows/dots in the strip
      heroStage.className = "filmstrip";
      heroStage.style.cssText = "position:relative;width:" + Math.round(availW) + "px;height:" + cardH + "px;overflow-x:auto;overflow-y:hidden;background:transparent;box-shadow:none;border-radius:0;cursor:grab;";
      heroStage.innerHTML = "";
      var strip = document.createElement("div");
      strip.style.cssText = "display:flex;gap:24px;align-items:flex-start;width:max-content;height:" + cardH + "px;padding:0 2px;";
      slides.forEach(function (sl, idx) {
        var card = document.createElement("div");
        card.style.cssText = "flex:none;width:" + cardW + "px;height:" + cardH + "px;border-radius:4px;overflow:hidden;box-shadow:0 6px 26px rgba(0,0,0,.14);background:#fff;position:relative;";
        var inner = document.createElement("div");
        inner.style.cssText = "width:1080px;height:1350px;transform:scale(" + s + ");transform-origin:top left;position:relative;pointer-events:none;";
        sl.style.display = "block";
        inner.appendChild(sl);
        card.appendChild(inner);
        var chip = document.createElement("div");
        chip.style.cssText = "position:absolute;top:7px;left:7px;background:rgba(31,35,40,.66);color:#fff;font:700 11px/1 system-ui,sans-serif;padding:4px 7px;border-radius:6px;";
        chip.textContent = idx + 1 + " / " + slides.length;
        card.appendChild(chip);
        strip.appendChild(card);
      });
      heroStage.appendChild(strip);
      heroArt = art;
      heroScale = s;
      editorTarget = null;
      enableDragScroll(heroStage);
      setHeroMeta(v, true, null, slides.length);
    }
    function enableDragScroll(el) {
      if (el._dragScroll) return;
      el._dragScroll = true;
      var down = false,
        sx = 0,
        sl = 0;
      el.addEventListener("pointerdown", function (e) {
        if (el.className !== "filmstrip") return;
        down = true;
        sx = e.clientX;
        sl = el.scrollLeft;
        el.style.cursor = "grabbing";
      });
      window.addEventListener("pointerup", function () {
        if (down) {
          down = false;
          if (el.className === "filmstrip") el.style.cursor = "grab";
        }
      });
      el.addEventListener("pointermove", function (e) {
        if (!down || el.className !== "filmstrip") return;
        el.scrollLeft = sl - (e.clientX - sx);
      });
    }

    /* carousel nav lives in .frame (OUTSIDE the scaled artboard, so always usable) */
    function renderCarouselNav(carousel, cur, n) {
      var frame = stageEl.querySelector(".frame");
      [].forEach.call(frame.querySelectorAll(".cnav,.cdots"), function (e) {
        e.remove();
      });
      if (!carousel) return;
      function arrow(dir, target) {
        var b = document.createElement("button");
        b.className = "cnav " + dir;
        b.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="' + (dir === "prev" ? "15 18 9 12 15 6" : "9 18 15 12 9 6") + '"></polyline></svg>';
        if (target < 0 || target > n - 1) b.setAttribute("disabled", "");else b.addEventListener("click", function (e) {
          e.stopPropagation();
          gotoSlide(target);
        });
        return b;
      }
      frame.appendChild(arrow("prev", cur - 1));
      frame.appendChild(arrow("next", cur + 1));
      var dots = document.createElement("div");
      dots.className = "cdots";
      for (var i = 0; i < n; i++) (function (idx) {
        var d = document.createElement("div");
        d.className = "cdot" + (idx === cur ? " on" : "");
        d.addEventListener("click", function (e) {
          e.stopPropagation();
          gotoSlide(idx);
        });
        dots.appendChild(d);
      })(i);
      frame.appendChild(dots);
    }

    /* ---- timeline (history of the active visual) ---- */
    function renderTimeline() {
      var v = visuals[activeIdx];
      timelineEl.innerHTML = "";
      tlsub.textContent = "“" + v.label + "” · " + v.rounds.length + " version" + (v.rounds.length === 1 ? "" : "s") + " · " + variantCount(activeIdx) + " variants";
      v.rounds.forEach(function (variants, ri) {
        if (ri > 0) timelineEl.appendChild(chev());
        var round = document.createElement("div");
        round.className = "round";
        var ch = chosenOf(activeIdx, ri);
        var head = document.createElement("div");
        head.className = "rh";
        head.innerHTML = '<span class="rv">v' + (ri + 1) + '</span><span class="rn">picked ' + letter(ch) + '</span>';
        round.appendChild(head);
        var vars = document.createElement("div");
        vars.className = "vars";
        variants.forEach(function (node, varIdx) {
          var cell = document.createElement("div");
          cell.className = "tlvar" + (varIdx === ch ? " chosen" : "") + (ri === focus.round && varIdx === focus.variant ? " focused" : "");
          mountThumb(cell, activeIdx, ri, varIdx, 58 / 1080);
          var ck = document.createElement("span");
          ck.className = "ck";
          ck.innerHTML = '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
          cell.appendChild(ck);
          var vk = document.createElement("span");
          vk.className = "vk";
          vk.textContent = letter(varIdx);
          cell.appendChild(vk);
          cell.addEventListener("click", function () {
            focus = {
              round: ri,
              variant: varIdx
            };
            renderHero();
            renderTimeline();
          });
          cell.addEventListener("contextmenu", function (e) {
            e.preventDefault();
            openMenu(cell, ri, varIdx);
          });
          vars.appendChild(cell);
        });
        round.appendChild(vars);
        timelineEl.appendChild(round);
      });
      timelineEl.appendChild(chev());
      var next = document.createElement("div");
      next.className = "round next";
      next.innerHTML = '<div class="plus"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></div><div class="nt">Iterate<br>3 new variants</div>';
      next.title = "Open the brief — tell the assistant what to change for the next round.";
      next.addEventListener("click", function () {
        openBrief("To iterate “" + v.label + "”: tell the assistant in the chat what to change — it'll build 3 fresh variants.");
      });
      timelineEl.appendChild(next);
    }
    function chev() {
      var a = document.createElement("div");
      a.className = "arrow";
      a.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
      return a;
    }

    /* ---- reel (one entry per visual) ---- */
    function renderReel() {
      reel.innerHTML = "";
      visuals.forEach(function (v, i) {
        var ri = lastRound(i),
          ch = chosenOf(i, ri);
        var t = document.createElement("div");
        var car = isCarousel(i, ri, ch);
        t.className = "thumb" + (i === activeIdx ? " active" : "") + (approved.has(v.label) ? " approved" : "") + (car ? " iscarousel" : "");
        var frame = document.createElement("div");
        frame.className = "tframe";
        mountThumb(frame, i, ri, ch, 96 / 1080);
        var cbadge = document.createElement("span");
        cbadge.className = "cbadge";
        if (isCarousel(i, ri, ch)) {
          var ns = slideCount(i, ri, ch);
          cbadge.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="14" height="14" rx="2"></rect><path d="M7 21h12a2 2 0 0 0 2-2V7"></path></svg><span>' + ns + '</span>';
          cbadge.title = ns + " slides · click, then swipe ‹ › on the canvas";
        } else {
          cbadge.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line></svg><span>' + variantCount(i) + '</span>';
          cbadge.title = variantCount(i) + " variants across " + v.rounds.length + " version" + (v.rounds.length === 1 ? "" : "s");
        }
        frame.appendChild(cbadge);
        var abadge = document.createElement("span");
        abadge.className = "abadge";
        abadge.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        frame.appendChild(abadge);
        var dots = document.createElement("button");
        dots.className = "dots";
        dots.style.cssText = "position:absolute;top:5px;right:5px;width:25px;height:25px;background:rgba(255,255,255,.92)";
        dots.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>';
        dots.addEventListener("click", function (e) {
          e.stopPropagation();
          activeIdx = i;
          focus = {
            round: ri,
            variant: ch
          };
          renderHero();
          renderTimeline();
          renderReel();
          openMenu(e.currentTarget, ri, ch);
        });
        frame.appendChild(dots);
        var lbl = document.createElement("div");
        lbl.className = "lbl";
        lbl.innerHTML = (car ? '<span class="kind">▤ Carousel · ' + slideCount(i, ri, ch) + ' slides</span>' : '') + v.label;
        t.appendChild(frame);
        t.appendChild(lbl);
        t.addEventListener("click", function () {
          activeIdx = i;
          var lr = lastRound(i);
          focus = {
            round: lr,
            variant: chosenOf(i, lr)
          };
          renderHero();
          renderTimeline();
          renderReel();
        });
        reel.appendChild(t);
      });
      // + New visual card
      var nv = document.createElement("div");
      nv.className = "newvis";
      nv.innerHTML = '<div class="nframe"><div class="plus"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></div></div><div class="nlbl">New visual</div>';
      nv.addEventListener("click", function () {
        openBrief("New visual: describe your post in the chat. The assistant will ask the brief questions, then build 3 variants.");
      });
      reel.appendChild(nv);
      countEl.textContent = visuals.length + " visual" + (visuals.length === 1 ? "" : "s") + " · 1080 × 1350 · export PNG or HTML";
      feedEl.textContent = approved.size + " approved · feeding the system";
    }

    /* ---- menu ---- */
    function openMenu(anchor, ri, varIdx) {
      menuTarget = {
        round: ri,
        variant: varIdx
      };
      var v = visuals[activeIdx];
      menuLabel.textContent = v.label + " · v" + (ri + 1) + " " + letter(varIdx);
      menu.querySelector('[data-act="choose"]').style.display = varIdx === chosenOf(activeIdx, ri) ? "none" : "flex";
      var ap = approved.has(v.label),
        apBtn = menu.querySelector('[data-act="approve"]');
      apBtn.querySelector(".ml").textContent = ap ? "Remove from design system" : "Add to design system";
      apBtn.querySelector(".ms").textContent = ap ? "Approved variant" : "Client approved → system learns";
      var r = anchor.getBoundingClientRect();
      menu.style.display = "block";
      menu.style.left = Math.min(r.left, window.innerWidth - 280) + "px";
      menu.style.top = Math.min(r.bottom + 6, window.innerHeight - 240) + "px";
    }
    function closeMenu() {
      menu.style.display = "none";
      menuTarget = null;
    }
    document.addEventListener("click", closeMenu);
    menu.addEventListener("click", function (e) {
      e.stopPropagation();
    });
    heroDots.addEventListener("click", function (e) {
      e.stopPropagation();
      openMenu(e.currentTarget, focus.round, focus.variant);
    });
    heroChosen.addEventListener("click", function (e) {
      e.stopPropagation();
      if (focus.variant === chosenOf(activeIdx, focus.round)) return; // already the winner
      setChosen(activeIdx, focus.round, focus.variant);
      flash("Picked variant " + letter(focus.variant) + " for v" + (focus.round + 1));
      renderHero();
      renderTimeline();
      renderReel();
    });
    menu.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        var act = b.getAttribute("data-act");
        if (!menuTarget) return;
        var ri = menuTarget.round,
          varIdx = menuTarget.variant;
        closeMenu();
        if (act === "png") exportPng(ri, varIdx);else if (act === "html") exportHtml(ri, varIdx);else if (act === "choose") {
          setChosen(activeIdx, ri, varIdx);
          flash("Picked variant " + letter(varIdx) + " for v" + (ri + 1));
          renderHero();
          renderTimeline();
          renderReel();
        } else if (act === "approve") toggleApprove();
      });
    });
    function toggleApprove() {
      var k = visuals[activeIdx].label;
      if (approved.has(k)) {
        approved.delete(k);
        flash("Removed from the design system");
      } else {
        approved.add(k);
        flash("Added — the design system will learn from this variant");
      }
      saveJSON(APPROVED_KEY, [].slice.call(approved));
      renderHero();
      renderReel();
    }

    /* ---- edit mode ---- */
    function persistEdit() {
      if (!heroArt) return;
      editsStore[editKey(activeIdx, focus.round, focus.variant)] = heroArt.innerHTML;
      saveJSON(EDITS_KEY, editsStore);
      renderTimeline();
      renderReel();
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
    document.getElementById("editToggle").addEventListener("click", function () {
      setEditing(!editing);
    });

    /* ---- zoom ---- */
    function setZoom(z) {
      zoom = Math.max(0.2, Math.min(4, z));
      renderHero();
      if (editing && window.BoardEditor) BoardEditor.reposition();
    }
    document.getElementById("zoomIn").addEventListener("click", function () {
      setZoom(zoom * 1.15);
    });
    document.getElementById("zoomOut").addEventListener("click", function () {
      setZoom(zoom / 1.15);
    });
    document.getElementById("zoomFit").addEventListener("click", function () {
      setZoom(1);
    });
    stageEl.addEventListener("wheel", function (e) {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom(zoom * (e.deltaY < 0 ? 1.08 : 0.93));
    }, {
      passive: false
    });

    /* ---- keyboard: arrow keys page a focused carousel left/right ---- */
    document.addEventListener("keydown", function (e) {
      if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
      if (e.target && e.target.getAttribute && e.target.getAttribute("contenteditable") === "true") return;
      if (!isCarousel(activeIdx, focus.round, focus.variant)) return;
      var n = slideCount(activeIdx, focus.round, focus.variant),
        cur = curSlide();
      if (e.key === "ArrowLeft" && cur > 0) {
        e.preventDefault();
        gotoSlide(cur - 1);
      } else if (e.key === "ArrowRight" && cur < n - 1) {
        e.preventDefault();
        gotoSlide(cur + 1);
      }
    });

    /* ---- new visual / iterate → back to the chat ----
       The brief lives in the conversation: the assistant asks the brief
       questions (post, type, the save-trigger, the analogy, references) and
       only then builds 3 variants. These buttons just nudge the user there. */
    function openBrief(msg) {
      flash(msg || "Describe your post in the chat — the assistant will ask the brief questions, then build 3 variants.");
    }

    /* ---- export ---- */
    function nameFor(ri, varIdx) {
      var base = slug(visuals[activeIdx].label) + "-v" + (ri + 1) + letter(varIdx).toLowerCase();
      if (isCarousel(activeIdx, ri, varIdx)) base += "-s" + ((slidePos[editKey(activeIdx, ri, varIdx)] || 0) + 1);
      return base;
    }
    function offscreen(vi, ri, varIdx) {
      var holder = document.createElement("div");
      holder.style.cssText = "position:fixed;left:-99999px;top:0;opacity:0;pointer-events:none";
      var art = makeClone(vi, ri, varIdx);
      var slides = slidesOf(art);
      if (slides.length > 1) {
        var c = Math.max(0, Math.min(slidePos[editKey(vi, ri, varIdx)] || 0, slides.length - 1));
        slides.forEach(function (el, idx) {
          el.style.display = idx === c ? "block" : "none";
        });
      } // export the current slide
      holder.appendChild(art);
      document.body.appendChild(holder);
      return {
        holder: holder,
        node: art
      };
    }
    function exportPng(ri, varIdx) {
      if (!window.htmlToImage) {
        flash("Export library not loaded");
        return;
      }
      flash("Exporting PNG…");
      var o = offscreen(activeIdx, ri, varIdx),
        nm = nameFor(ri, varIdx);
      window.htmlToImage.toPng(o.node, {
        width: 1080,
        height: 1350,
        pixelRatio: 1,
        cacheBust: true
      }).then(function (url) {
        dl(url, nm + ".png");
        flash("Exported " + nm + ".png");
      }).catch(function (e) {
        console.error(e);
        flash("Export failed — try again");
      }).then(function () {
        o.holder.remove();
      });
    }
    function exportHtml(ri, varIdx) {
      var o = offscreen(activeIdx, ri, varIdx),
        nm = nameFor(ri, varIdx);
      var doc = buildDoc(o.node, visuals[activeIdx].label);
      o.holder.remove();
      var url = URL.createObjectURL(new Blob([doc], {
        type: "text/html"
      }));
      dl(url, nm + ".html");
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 4000);
      flash("Exported " + nm + ".html");
    }
    function dl(href, name) {
      var a = document.createElement("a");
      a.href = href;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    function buildDoc(node, label) {
      var vars = "",
        classes = "";
      function walk(sheet) {
        var rules;
        try {
          rules = sheet.cssRules;
        } catch (e) {
          return;
        }
        if (!rules) return;
        for (var i = 0; i < rules.length; i++) {
          var r = rules[i];
          if (r.styleSheet) walk(r.styleSheet);else if (r.selectorText === ":root") vars += r.style.cssText;else if (r.selectorText && /^\.(sig-|headline|artboard)/.test(r.selectorText)) classes += r.cssText + "\n";
        }
      }
      for (var s = 0; s < document.styleSheets.length; s++) walk(document.styleSheets[s]);
      vars += document.documentElement.style.cssText;
      return '<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8"><title>' + label + '</title>' + '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">' + '<style>:root{' + vars + '} html,body{margin:0} body{display:flex;align-items:center;justify-content:center;background:#e6e6e6;min-height:100vh}' + classes + '</style></head>' + '<body>' + node.outerHTML + '</body></html>';
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
        flash: flash
      });
    }
    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(renderHero, 120);
    });
    if (!visuals.length) {
      countEl.textContent = "No visuals yet — add a <section class=\"visual\"> block";
      return;
    }
    var lr = lastRound(0);
    focus = {
      round: lr,
      variant: chosenOf(0, lr)
    };
    renderTimeline();
    renderReel();
    renderHero(); // hero LAST so it fits the final stage size
    requestAnimationFrame(renderHero); // re-fit after the dock has laid out
    if (window.ResizeObserver) {
      new ResizeObserver(function () {
        renderHero();
        if (editing && window.BoardEditor) BoardEditor.reposition();
      }).observe(stageEl);
    }
  }
  boot();
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "visual-board.js", error: String((e && e.message) || e) }); }

__ds_ns.Cta = __ds_scope.Cta;

__ds_ns.InfoCard = __ds_scope.InfoCard;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.Quote = __ds_scope.Quote;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Attribution = __ds_scope.Attribution;

__ds_ns.Stat = __ds_scope.Stat;

__ds_ns.StatBox = __ds_scope.StatBox;

__ds_ns.StatRow = __ds_scope.StatRow;

__ds_ns.BrowserMock = __ds_scope.BrowserMock;

__ds_ns.Canvas = __ds_scope.Canvas;

__ds_ns.Chrome = __ds_scope.Chrome;

__ds_ns.SwipeArrow = __ds_scope.SwipeArrow;

__ds_ns.FeedPost = __ds_scope.FeedPost;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.Headline = __ds_scope.Headline;

__ds_ns.Mark = __ds_scope.Mark;

__ds_ns.Subhead = __ds_scope.Subhead;

})();
