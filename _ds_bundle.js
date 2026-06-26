/* @ds-bundle: {"format":3,"namespace":"LinkedInVisualDesignSystemTesting_727cb3","components":[{"name":"Cta","sourcePath":"components/content/Cta.jsx"},{"name":"InfoCard","sourcePath":"components/content/InfoCard.jsx"},{"name":"Chip","sourcePath":"components/content/InfoCard.jsx"},{"name":"Quote","sourcePath":"components/content/Quote.jsx"},{"name":"Avatar","sourcePath":"components/content/Quote.jsx"},{"name":"Attribution","sourcePath":"components/content/Quote.jsx"},{"name":"Stat","sourcePath":"components/content/Stat.jsx"},{"name":"StatBox","sourcePath":"components/content/Stat.jsx"},{"name":"StatRow","sourcePath":"components/content/Stat.jsx"},{"name":"BrowserMock","sourcePath":"components/illustration/BrowserMock.jsx"},{"name":"Canvas","sourcePath":"components/layout/Canvas.jsx"},{"name":"Chrome","sourcePath":"components/layout/Chrome.jsx"},{"name":"SwipeArrow","sourcePath":"components/layout/Chrome.jsx"},{"name":"FeedPost","sourcePath":"components/preview/FeedPost.jsx"},{"name":"Eyebrow","sourcePath":"components/text/Headline.jsx"},{"name":"Headline","sourcePath":"components/text/Headline.jsx"},{"name":"Mark","sourcePath":"components/text/Headline.jsx"},{"name":"Subhead","sourcePath":"components/text/Headline.jsx"}],"sourceHashes":{"app/board-editor.js":"908e5c6cb52d","app/visual-board.js":"565edc2657e0","components/content/Cta.jsx":"82e459098f48","components/content/InfoCard.jsx":"1c79ce656fe9","components/content/Quote.jsx":"26d86b908140","components/content/Stat.jsx":"3196afd21e95","components/icons/icon-kit.js":"d7ec43dee173","components/illustration/BrowserMock.jsx":"4ffefd5fb451","components/layout/Canvas.jsx":"c7884415425d","components/layout/Chrome.jsx":"cf4752729eb3","components/preview/FeedPost.jsx":"bd5556609d26","components/text/Headline.jsx":"0ab05c2c7576","tools/anti-slop/detect-antipatterns.js":"3249824c3202","tools/apply-update.cjs":"56bc0267b4f4","tools/check-update.cjs":"ca74da6397e7","ui_kits/setup/Setup.jsx":"f35a8d9cd90d","ui_kits/update-center/UpdateCenter.jsx":"c049b459323e","ui_kits/visual-library/VisualLibrary.jsx":"d8b82962af64","ui_kits/visual-library/sampleVisuals.jsx":"b246a3729833","uploads/Design system setup/doodle-kit.js":"5ce008ede3c4"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.LinkedInVisualDesignSystemTesting_727cb3 = window.LinkedInVisualDesignSystemTesting_727cb3 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// app/board-editor.js
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
    cpop: null,
    onChange: function () {},
    flash: function () {},
    art: null,
    scale: 1,
    sel: null,
    selected: [],
    marquee: null,
    olayer: null,
    active: false
  };

  /* ---------- palette: draggable elements (brand-aware) ---------- */
  // Design-system colour swatches offered in the picker. Brand entries stay theme-linked
  // (a var() string, so they re-colour with the brand); literals are fixed.
  var SWATCHES = [{
    label: "Primary",
    val: "var(--brand-primary)"
  }, {
    label: "Secondary",
    val: "var(--brand-secondary)"
  }, {
    label: "Accent",
    val: "var(--brand-accent)"
  }, {
    label: "Ink",
    val: "var(--fg)"
  }, {
    label: "Muted",
    val: "var(--muted)"
  }, {
    label: "Soft",
    val: "var(--soft)"
  }, {
    label: "White",
    val: "#FFFFFF"
  }, {
    label: "Ink 900",
    val: "#18181B"
  }];
  var CUSTOM_KEY = "li-vds-board-colors-v1";
  function loadCustom() {
    try {
      return JSON.parse(localStorage.getItem(CUSTOM_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  var CUSTOM = loadCustom();
  function saveCustom() {
    try {
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(CUSTOM));
    } catch (e) {}
  }

  /* ---------- magnetic 12-col grid (artboard = 1080×1350) ---------- */
  var MARGIN = 72,
    COLS = 12,
    GUTTER = 24;
  var COLW = (1080 - 2 * MARGIN - (COLS - 1) * GUTTER) / COLS; // = 56
  var ROWH = 78; // vertical rhythm
  var SNAP = 16; // snap threshold (artboard px)
  var GRID_KEY = "li-vds-board-grid-v1";
  var gridState = function () {
    try {
      return JSON.parse(localStorage.getItem(GRID_KEY)) || {};
    } catch (e) {
      return {};
    }
  }();
  var showGrid = gridState.grid !== false; // default ON
  var showMargin = gridState.margin !== false; // default ON
  function saveGrid() {
    try {
      localStorage.setItem(GRID_KEY, JSON.stringify({
        grid: showGrid,
        margin: showMargin
      }));
    } catch (e) {}
  }
  function xEdges() {
    var a = [];
    for (var i = 0; i < COLS; i++) {
      var s = MARGIN + i * (COLW + GUTTER);
      a.push(s);
      a.push(s + COLW);
    }
    return a;
  }
  function yLines() {
    var a = [];
    for (var y = MARGIN; y <= 1350 - MARGIN + 0.5; y += ROWH) a.push(Math.round(y));
    return a;
  }
  function snapTo(v, lines) {
    var best = v,
      bd = SNAP;
    for (var i = 0; i < lines.length; i++) {
      var d = Math.abs(v - lines[i]);
      if (d < bd) {
        bd = d;
        best = lines[i];
      }
    }
    return best;
  }
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
  var DS_LIB = []; // icons/illustrations already in the design system (auto-loaded from a manifest; read-only)
  /* Auto-detect the design system's own icon/illustration library. The board is a static
     file so it can't list a folder — instead it reads a small manifest the DS ships:
       assets/library-manifest.json  (or assets/icons/manifest.json)
     = a JSON array of paths (strings) or {"icons":[{name,src}, ...]}, paths relative to
     project root. Every visual then shows those icons in My library, ready to drag in —
     no re-upload. Absent (like a fresh system) → the section just shows the user's uploads. */
  function loadDSLibrary() {
    var bases = ["", "../", "../../"]; // app/ board, root, then the mirrored templates/visual-board/ copy
    var names = ["assets/library-manifest.json", "assets/icons/manifest.json"];
    var tries = [];
    bases.forEach(function (b) {
      names.forEach(function (n) {
        tries.push([b, b + n]);
      });
    });
    (function next(i) {
      if (i >= tries.length) return;
      var base = tries[i][0],
        url = tries[i][1];
      fetch(url, {
        cache: "no-store"
      }).then(function (r) {
        if (!r.ok) throw 0;
        return r.json();
      }).then(function (j) {
        var items = Array.isArray(j) ? j : j.icons || j.items || [];
        DS_LIB = items.map(function (it) {
          var src = typeof it === "string" ? it : it.src || it.path || "";
          var name = typeof it === "string" ? src.split("/").pop() : it.name || (it.src || "").split("/").pop();
          return {
            name: name,
            src: /^(https?:|data:|\/)/.test(src) ? src : base + src
          };
        }).filter(function (x) {
          return x.src;
        });
        renderLib();
      }).catch(function () {
        next(i + 1);
      });
    })(0);
  }
  var renderLib = function () {};

  /* ---------- the Icon Library (icon-kit.js) as a drag source ----------
     Icons drawn/imported in the Icon Library view live in window.IconKit (built-ins)
     + localStorage('icon-custom') (the user's own). They're rendered INLINE here so they
     recolour to the brand (var(--brand-primary)/var(--icon-ink)) and can be dragged onto
     the canvas. localStorage is shared across the app's views, so anything in the Icon
     Library shows up here automatically — no re-upload. */
  var KIT_LIB = []; // [{ name, svg, kind }]
  function ensureIconCss(base) {
    if (!document.getElementById("li-icon-css")) {
      var l = document.createElement("link");
      l.id = "li-icon-css";
      l.rel = "stylesheet";
      l.href = base + "components/icons/icon.css";
      document.head.appendChild(l);
    }
    // fallback ink colour so inline icons are never invisible if icon.css is slow/absent
    var ink = getComputedStyle(document.documentElement).getPropertyValue("--icon-ink").trim();
    if (!ink) document.documentElement.style.setProperty("--icon-ink", "#16232b");
  }
  function collectKit() {
    if (!window.IconKit) return;
    var entries = [],
      seen = {};
    (IconKit.markNames || []).forEach(function (n) {
      entries.push(["mark", n]);
    });
    try {
      (JSON.parse(localStorage.getItem("icon-custom")) || []).forEach(function (n) {
        entries.push(["mark", n]);
      });
    } catch (e) {}
    (IconKit.illNames || []).forEach(function (n) {
      entries.push(["ill", n]);
    });
    KIT_LIB = [];
    entries.forEach(function (p) {
      var key = p[0] + ":" + p[1];
      if (seen[key]) return;
      seen[key] = 1;
      var svg = p[0] === "ill" ? IconKit.ill(p[1]) : IconKit.mark(p[1]);
      if (svg && (svg.indexOf("<path") >= 0 || svg.indexOf("<circle") >= 0 || svg.indexOf("<rect") >= 0)) KIT_LIB.push({
        name: p[1],
        svg: svg,
        kind: p[0]
      });
    });
  }
  function loadIconKit() {
    var bases = ["", "../", "../../"];
    (function tryBase(i) {
      if (window.IconKit) {
        ensureIconCss(bases[Math.max(0, i - 1)] || "");
        collectKit();
        renderLib();
        return;
      }
      if (i >= bases.length) return;
      var s = document.createElement("script");
      s.src = bases[i] + "components/icons/icon-kit.js";
      s.onload = function () {
        ensureIconCss(bases[i]);
        collectKit();
        renderLib();
      };
      s.onerror = function () {
        tryBase(i + 1);
      };
      document.head.appendChild(s);
    })(0);
    // refresh when the user edits/adds icons in the Icon Library view
    window.addEventListener("icon-changed", function () {
      collectKit();
      renderLib();
    });
    window.addEventListener("storage", function (e) {
      if (e.key === "icon-custom" || e.key === "icon-overrides") {
        collectKit();
        renderLib();
      }
    });
  }
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

  /* board's OWN ui icons for palette items (Inter/Lucide-style line glyphs, not the client's icon set) */
  function ic(p) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  }
  var ICON = {
    heading: ic('<path d="M6 4v16M18 4v16M6 12h12"/>'),
    sub: ic('<line x1="4" y1="7" x2="20" y2="7" stroke-width="2.4"/><line x1="4" y1="13" x2="13" y2="13"/><line x1="4" y1="18" x2="10" y2="18"/>'),
    eyebrow: ic('<path d="M3.5 12.5 11 5l8 0 0 8-7.5 7.5z"/><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor"/>'),
    body: ic('<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="11" x2="20" y2="11"/><line x1="4" y1="16" x2="14" y2="16"/>'),
    stat: ic('<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>'),
    quote: ic('<path d="M9 7H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2v1a2 2 0 0 1-2 2M19 7h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2v1a2 2 0 0 1-2 2"/>'),
    arrow: ic('<circle cx="12" cy="12" r="9"/><path d="M9 12h6M13 9l3 3-3 3"/>'),
    avatar: ic('<circle cx="12" cy="9" r="3.2"/><path d="M5.5 19a6.5 6.5 0 0 1 13 0"/>'),
    rect: ic('<rect x="4" y="6" width="16" height="12" rx="2"/>'),
    circle: ic('<circle cx="12" cy="12" r="8"/>'),
    pill: ic('<rect x="3" y="8" width="18" height="8" rx="4"/>'),
    line: ic('<line x1="4" y1="12" x2="20" y2="12"/>'),
    donut: ic('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.1"/>'),
    bar: ic('<rect x="3" y="9" width="18" height="6" rx="2"/><line x1="13" y1="9" x2="13" y2="15"/>')
  };

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
    items: [["quote", "Quote"], ["arrow", "Swipe"], ["avatar", "Avatar"]]
  }, {
    name: "Shapes",
    items: [["rect", "Rectangle"], ["circle", "Circle"], ["pill", "Pill"], ["line", "Divider"], ["donut", "Donut"], ["bar", "Split bar"]]
  }];
  function buildPalette() {
    var p = S.palette;
    p.innerHTML = "";
    // magnetic-grid view toggles (snapping is always on; these only show/hide the guides)
    var gb = el("div");
    gb.className = "gridbar";
    function tog(label, on, svg, fn) {
      var b = el("div", "", svg + "<span>" + label + "</span>");
      b.className = "gridtog" + (on ? " on" : "");
      b.addEventListener("click", function () {
        var n = fn();
        b.classList.toggle("on", n);
      });
      return b;
    }
    gb.appendChild(tog("Grid", showGrid, '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>', function () {
      showGrid = !showGrid;
      saveGrid();
      applyOverlay();
      return showGrid;
    }));
    gb.appendChild(tog("Margins", showMargin, '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="1"/><rect x="7" y="7" width="10" height="10" rx="1" stroke-dasharray="2 2"/></svg>', function () {
      showMargin = !showMargin;
      saveGrid();
      applyOverlay();
      return showMargin;
    }));
    p.appendChild(gb);
    GROUPS.forEach(function (g) {
      var h = el("div", "", g.name);
      h.className = "grp";
      p.appendChild(h);
      var grid = el("div");
      grid.className = "palette";
      g.items.forEach(function (it) {
        var b = el("div", "", '<span class="ic">' + (ICON[it[0]] || "") + '</span><span class="lbl">' + it[1] + '</span>');
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

    // My library — upload sits at the TOP of this section, then DS icons + your uploads
    var libHead = el("div", "", "My library");
    libHead.className = "grp";
    p.appendChild(libHead);
    p.appendChild(up);
    var libWrap = el("div", "display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px");
    p.appendChild(libWrap);
    renderLib = function () {
      libWrap.innerHTML = "";
      // 1) icons already in the design system (auto-detected, not removable)
      if (DS_LIB.length) {
        libWrap.appendChild(el("div", "", "In this design system")).className = "libcap";
        DS_LIB.forEach(function (item, i) {
          var t = el("div", "background-image:url('" + item.src + "')");
          t.className = "libtile";
          t.title = item.name || "icon";
          t.setAttribute("draggable", "true");
          t.addEventListener("dragstart", function (ev) {
            ev.dataTransfer.setData("text/plain", "dsimg:" + i);
            ev.dataTransfer.effectAllowed = "copy";
          });
          libWrap.appendChild(t);
        });
      }
      // 2) icons from the Icon Library (icon-kit) — rendered inline so they wear the brand
      if (KIT_LIB.length) {
        libWrap.appendChild(el("div", "", "From the Icon Library")).className = "libcap";
        KIT_LIB.forEach(function (item, i) {
          var t = el("div", "");
          t.className = "libtile kit";
          t.title = item.name;
          t.innerHTML = item.svg;
          var sv = t.querySelector("svg");
          if (sv) sv.style.cssText = "width:100%;height:100%;display:block";
          t.setAttribute("draggable", "true");
          t.addEventListener("dragstart", function (ev) {
            ev.dataTransfer.setData("text/plain", "kit:" + i);
            ev.dataTransfer.effectAllowed = "copy";
          });
          libWrap.appendChild(t);
        });
      }
      // 3) the user's own uploads (removable)
      if (LIB.length) {
        if (DS_LIB.length || KIT_LIB.length) {
          libWrap.appendChild(el("div", "", "Your uploads")).className = "libcap";
        }
        LIB.forEach(function (src, i) {
          var t = el("div", "background-image:url('" + src + "')");
          t.className = "libtile";
          t.setAttribute("draggable", "true");
          t.addEventListener("dragstart", function (ev) {
            ev.dataTransfer.setData("text/plain", "img:" + i);
            ev.dataTransfer.effectAllowed = "copy";
          });
          var x = el("button", "", "&times;");
          x.className = "rm";
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
      }
      if (!DS_LIB.length && !KIT_LIB.length && !LIB.length) {
        libWrap.appendChild(el("div", "grid-column:1/-1;font-size:11px;color:#bcc0c4;padding:6px 2px;line-height:1.4", "Icons from the Icon Library show up here automatically. Upload your own sets above to add more — they appear on every visual to drag in."));
      }
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
    if (!S.selected.length) {
      S.selbox.style.display = "none";
      S.eltbar.style.display = "none";
      renderOutlines();
      return;
    }
    var fr = frameRect();
    // group bounding box (union of all selected rects)
    var minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    S.selected.forEach(function (n) {
      var r = n.getBoundingClientRect();
      minX = Math.min(minX, r.left);
      minY = Math.min(minY, r.top);
      maxX = Math.max(maxX, r.right);
      maxY = Math.max(maxY, r.bottom);
    });
    var x = minX - fr.left,
      y = minY - fr.top,
      w = maxX - minX,
      h = maxY - minY;
    var multi = S.selected.length > 1;
    S.selbox.style.display = "block";
    S.selbox.style.left = x + "px";
    S.selbox.style.top = y + "px";
    S.selbox.style.width = w + "px";
    S.selbox.style.height = h + "px";
    // hide resize handles for multi-selection, and when a single selection is too small on screen
    S.selbox.classList.toggle("multi", multi);
    S.selbox.classList.toggle("tiny", !multi && Math.min(w, h) < 44);
    S.eltbar.style.display = "flex";
    // the toolbar tracks the (group) selection everywhere — including off-canvas
    var bx = x;
    var by = y - 42;
    if (by < 0) by = y + h + 8;
    S.eltbar.style.left = bx + "px";
    S.eltbar.style.top = by + "px";
    renderOutlines();
  }
  function setSelection(list) {
    S.selected = (list || []).filter(function (n, i, a) {
      return n && a.indexOf(n) === i;
    });
    S.sel = S.selected[S.selected.length - 1] || null; // primary (resize/colour anchor)
    placeSel();
  }
  function select(node) {
    setSelection(node ? [node] : []);
  }
  function deselect() {
    setSelection([]);
    closeColorPopover();
  }
  // is `node` (or an ancestor up to the artboard) part of the current selection?
  function inSelection(node) {
    var n = node;
    while (n && n !== S.art) {
      if (S.selected.indexOf(n) >= 0) return true;
      n = n.parentElement;
    }
    return false;
  }
  // per-element outlines for multi-select (the selbox shows the group bounding box)
  function renderOutlines() {
    if (!S.olayer) return;
    S.olayer.innerHTML = "";
    if (S.selected.length < 2) return;
    var fr = frameRect();
    S.selected.forEach(function (n) {
      var r = n.getBoundingClientRect();
      S.olayer.appendChild(el("div", "position:absolute;left:" + (r.left - fr.left) + "px;top:" + (r.top - fr.top) + "px;width:" + r.width + "px;height:" + r.height + "px;outline:1.5px solid var(--brand-primary,#0A66C2);outline-offset:1px"));
    });
  }

  /* ---------- element toolbar ---------- */
  function buildToolbar() {
    S.eltbar.innerHTML = "";
    function btn(title, svg, fn) {
      var b = el("button", "", svg);
      b.title = title;
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        fn(b);
      });
      S.eltbar.appendChild(b);
      return b;
    }
    btn("Bring to front", '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>', function () {
      if (!S.selected.length) return;
      var max = 0;
      [].forEach.call(S.art.children, function (c) {
        max = Math.max(max, +c.style.zIndex || 0);
      });
      S.selected.forEach(function (n) {
        max += 1;
        n.style.zIndex = max;
      });
      commit();
    });
    btn("Colour", '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="10.5" r="2.5"></circle><circle cx="8.5" cy="7.5" r="2.5"></circle><circle cx="6.5" cy="12.5" r="2.5"></circle><path d="M12 2a10 10 0 1 0 0 20 2 2 0 0 0 1.5-3.3 2 2 0 0 1 1.5-3.3H17a5 5 0 0 0 5-5c0-4.4-4.5-8.4-10-8.4Z"></path></svg>', function (b) {
      openColorPopover(b);
    });
    btn("Duplicate", '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15V5a2 2 0 0 1 2-2h10"></path></svg>', function () {
      if (!S.selected.length) return;
      var clones = S.selected.map(function (n) {
        var c = n.cloneNode(true);
        c.style.position = "absolute";
        c.style.left = parseFloat(n.style.left || 0) + 30 + "px";
        c.style.top = parseFloat(n.style.top || 0) + 30 + "px";
        S.art.appendChild(c);
        return c;
      });
      setSelection(clones);
      commit();
    });
    btn("Delete", '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6M14 11v6"></path></svg>', function () {
      if (!S.selected.length) return;
      S.selected.forEach(function (n) {
        n.remove();
      });
      setSelection([]);
      commit();
    });
  }

  /* ---------- colour picker ---------- */
  function resolveColor(val) {
    var probe = el("span", "color:" + val);
    (S.art || document.body).appendChild(probe);
    var c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  }
  function applyColor(val) {
    if (!S.selected.length) return;
    S.selected.forEach(function (n) {
      if (n.getAttribute("data-shape")) n.style.background = val;else n.style.color = val;
    });
    commit();
  }
  function buildColorPopover() {
    var pop = S.cpop;
    pop.innerHTML = "";
    pop.appendChild(el("div", "", "Design-system colours")).className = "ct";
    var sw = el("div");
    sw.className = "sw";
    pop.appendChild(sw);
    SWATCHES.forEach(function (s) {
      var c = el("div", "background:" + s.val);
      c.className = "swatch";
      c.title = s.label;
      c.addEventListener("click", function (e) {
        e.stopPropagation();
        applyColor(s.val);
        closeColorPopover();
      });
      sw.appendChild(c);
    });
    pop.appendChild(el("div")).className = "seg";
    if (CUSTOM.length) {
      pop.appendChild(el("div", "", "Your colours")).className = "ct";
      var cs = el("div");
      cs.className = "sw";
      pop.appendChild(cs);
      CUSTOM.forEach(function (hex, i) {
        var c = el("div", "background:" + hex);
        c.className = "swatch";
        c.title = hex;
        c.addEventListener("click", function (e) {
          e.stopPropagation();
          applyColor(hex);
          closeColorPopover();
        });
        c.addEventListener("contextmenu", function (e) {
          e.preventDefault();
          CUSTOM.splice(i, 1);
          saveCustom();
          buildColorPopover();
        });
        cs.appendChild(c);
      });
      pop.appendChild(el("div")).className = "seg";
    }
    var row = el("div");
    row.className = "crow";
    var inp = el("input");
    inp.type = "color";
    inp.value = "#0A66C2";
    var add = el("button", "", "Add &amp; apply");
    add.className = "addc";
    add.addEventListener("click", function (e) {
      e.stopPropagation();
      var hex = inp.value.toUpperCase();
      if (CUSTOM.indexOf(hex) === -1) {
        CUSTOM.push(hex);
        saveCustom();
      }
      applyColor(hex);
      buildColorPopover();
      closeColorPopover();
    });
    row.appendChild(inp);
    row.appendChild(add);
    pop.appendChild(row);
    pop.appendChild(el("div", "font-size:10.5px;color:#aab0b6;margin-top:9px;line-height:1.35", "Custom colours are saved to your palette here. Right-click one to remove. To bake a colour into the design system itself, add it to overrides/brand.css."));
  }
  function openColorPopover(anchor) {
    if (!S.selected.length) return;
    buildColorPopover();
    S.cpop.style.display = "block";
    var r = anchor.getBoundingClientRect();
    var w = 216,
      x = Math.min(r.left, window.innerWidth - w - 10),
      y = r.bottom + 8;
    if (y + 240 > window.innerHeight) y = Math.max(10, r.top - 248);
    S.cpop.style.left = Math.max(10, x) + "px";
    S.cpop.style.top = y + "px";
  }
  function closeColorPopover() {
    if (S.cpop) S.cpop.style.display = "none";
  }

  /* ---------- magnetic grid overlay (drawn in the scaled artboard wrap) ---------- */
  function applyOverlay() {
    if (!S.art) return;
    var wrap = S.art.closest(".artscale");
    if (!wrap) return;
    var old = wrap.querySelector(":scope > .grid-overlay");
    if (old) old.remove();
    if (!S.active || !showGrid && !showMargin) return;
    var ov = el("div");
    ov.className = "grid-overlay";
    var html = "";
    if (showGrid) {
      for (var i = 0; i < COLS; i++) {
        var x = MARGIN + i * (COLW + GUTTER);
        html += '<div style="position:absolute;top:' + MARGIN + 'px;height:' + (1350 - 2 * MARGIN) + 'px;left:' + x + 'px;width:' + COLW + 'px;background:rgba(90,170,255,.12);border-left:1px solid rgba(90,170,255,.45);border-right:1px solid rgba(90,170,255,.45)"></div>';
      }
      yLines().forEach(function (y) {
        html += '<div style="position:absolute;left:' + MARGIN + 'px;right:' + MARGIN + 'px;top:' + y + 'px;height:1px;background:rgba(90,170,255,.3)"></div>';
      });
    }
    if (showMargin) {
      // the UNSAFE zone outside the content margin, filled red — drag into it = "in the red"
      var innerH = 1350 - 2 * MARGIN;
      html += '<div style="position:absolute;left:0;top:0;width:1080px;height:' + MARGIN + 'px;background:rgba(229,57,53,.24)"></div>';
      html += '<div style="position:absolute;left:0;bottom:0;width:1080px;height:' + MARGIN + 'px;background:rgba(229,57,53,.24)"></div>';
      html += '<div style="position:absolute;left:0;top:' + MARGIN + 'px;width:' + MARGIN + 'px;height:' + innerH + 'px;background:rgba(229,57,53,.24)"></div>';
      html += '<div style="position:absolute;right:0;top:' + MARGIN + 'px;width:' + MARGIN + 'px;height:' + innerH + 'px;background:rgba(229,57,53,.24)"></div>';
      html += '<div style="position:absolute;left:' + MARGIN + 'px;top:' + MARGIN + 'px;right:' + MARGIN + 'px;bottom:' + MARGIN + 'px;border:2px solid rgba(229,57,53,.9)"></div>';
    }
    ov.innerHTML = html;
    wrap.appendChild(ov);
  }

  /* ---------- pointer: select / move / resize ---------- */
  var drag = null;
  function onPointerDown(e) {
    if (!S.active || !S.art) return;
    closeColorPopover();
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
    var node = e.target;
    var onElement = node && node !== S.art && S.art.contains(node) && !(node.classList && node.classList.contains("grid-overlay"));
    if (!onElement) {
      // empty area → rubber-band marquee select (shift keeps the current selection)
      if (!e.shiftKey) setSelection([]);
      drag = {
        mode: "marquee",
        ox: e.clientX,
        oy: e.clientY,
        add: e.shiftKey,
        base: S.selected.slice()
      };
      updateMarquee(e);
      S.marquee.style.display = "block";
      e.preventDefault();
      return;
    }
    if (e.shiftKey) {
      // toggle this element in/out of the selection (no drag)
      var i = S.selected.indexOf(node);
      if (i >= 0) S.selected.splice(i, 1);else S.selected.push(node);
      setSelection(S.selected);
      e.preventDefault();
      return;
    }
    // plain click: keep the group if the element is already in it, else select just it
    if (!inSelection(node)) setSelection([node]);
    // start a group move (record each selected element's base position)
    var items = S.selected.map(function (n) {
      var bl = parseFloat(n.style.left),
        bt = parseFloat(n.style.top);
      return {
        n: n,
        bl: isNaN(bl) ? 0 : bl,
        bt: isNaN(bt) ? 0 : bt,
        pos: getComputedStyle(n).position
      };
    });
    drag = {
      mode: "move",
      sx: e.clientX,
      sy: e.clientY,
      items: items,
      moved: false
    };
    e.preventDefault();
  }
  function updateMarquee(e) {
    if (!S.marquee) return;
    var fr = frameRect();
    var x1 = Math.min(drag.ox, e.clientX),
      y1 = Math.min(drag.oy, e.clientY);
    var x2 = Math.max(drag.ox, e.clientX),
      y2 = Math.max(drag.oy, e.clientY);
    S.marquee.style.left = x1 - fr.left + "px";
    S.marquee.style.top = y1 - fr.top + "px";
    S.marquee.style.width = x2 - x1 + "px";
    S.marquee.style.height = y2 - y1 + "px";
  }
  function onPointerMove(e) {
    if (!drag) return;
    var dx = (e.clientX - drag.sx) / S.scale,
      dy = (e.clientY - drag.sy) / S.scale;
    if (drag.mode === "move") {
      if (!drag.moved && Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) < 3) return;
      drag.moved = true;
      var primary = drag.items[drag.items.length - 1] || drag.items[0];
      var pnx = primary.bl + dx,
        pny = primary.bt + dy;
      // magnetic only INSIDE the canvas; crossing the edge to park releases the snap.
      if (!e.altKey) {
        if (pnx >= 0 && pnx <= 1080) pnx = snapTo(pnx, xEdges());
        if (pny >= 0 && pny <= 1350) pny = snapTo(pny, yLines());
      }
      var sdx = pnx - primary.bl,
        sdy = pny - primary.bt; // snapped delta, applied to the whole group
      drag.items.forEach(function (it) {
        if (it.pos === "static") it.n.style.position = "relative";
        it.n.style.left = it.bl + sdx + "px";
        it.n.style.top = it.bt + sdy + "px";
      });
      placeSel();
    } else if (drag.mode === "marquee") {
      updateMarquee(e);
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
    if (drag && drag.mode === "marquee") {
      var mb = S.marquee.getBoundingClientRect();
      S.marquee.style.display = "none";
      var moved = mb.width > 4 || mb.height > 4;
      if (moved) {
        var hits = [].filter.call(S.art.children, function (c) {
          if (c.classList && c.classList.contains("grid-overlay")) return false;
          var r = c.getBoundingClientRect();
          return !(r.right < mb.left || r.left > mb.right || r.bottom < mb.top || r.top > mb.bottom);
        });
        setSelection(drag.add ? drag.base.concat(hits) : hits);
      }
      // a plain click on empty space (no drag) already cleared via setSelection([]) in pointerdown
      drag = null;
      return;
    }
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
    if (data.indexOf("dsimg:") === 0 || data.indexOf("img:") === 0) {
      // a library image (DS-provided or uploaded)
      var ds = data.indexOf("dsimg:") === 0;
      var src = ds ? (DS_LIB[+data.slice(6)] || {}).src : LIB[+data.slice(4)];
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
    if (data.indexOf("kit:") === 0) {
      // an icon from the Icon Library — inserted inline so it recolours to the brand
      var kit = KIT_LIB[+data.slice(4)];
      if (!kit) return;
      e.preventDefault();
      var wrap = el("div", "position:absolute;width:200px;height:200px");
      wrap.innerHTML = kit.svg;
      var sv2 = wrap.querySelector("svg");
      if (sv2) sv2.style.cssText = "width:100%;height:100%;display:block";
      wrap.setAttribute("data-shape", "icon");
      S.art.appendChild(wrap);
      var pk = toArt(e.clientX, e.clientY);
      wrap.style.left = Math.round(pk.x - 100) + "px";
      wrap.style.top = Math.round(pk.y - 100) + "px";
      select(wrap);
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
    if (!S.selected.length || editingText) return;
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      S.selected.forEach(function (n) {
        n.remove();
      });
      setSelection([]);
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
      // selection chrome created on the fly: a rubber-band marquee + a per-element outline layer
      S.marquee = el("div", "position:absolute;border:1px solid var(--brand-primary,#0A66C2);background:rgba(10,102,194,.10);z-index:45;display:none;pointer-events:none");
      S.olayer = el("div", "position:absolute;inset:0;pointer-events:none;z-index:39");
      if (S.frame) {
        S.frame.appendChild(S.olayer);
        S.frame.appendChild(S.marquee);
      }
      buildPalette();
      buildToolbar();
      loadDSLibrary();
      loadIconKit();
      S.heroStage.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      S.selbox.addEventListener("pointerdown", onPointerDown);
      // accept drops anywhere on the stage (card AND the pasteboard around it), so new
      // elements can be dropped outside the canvas too. Stage contains heroStage, so one
      // listener covers both; drops resolve to artboard coords (negative = off-canvas).
      var dropZone = S.frame && S.frame.parentNode || S.heroStage;
      dropZone.addEventListener("dragover", onDragOver);
      dropZone.addEventListener("drop", onDrop);
      S.heroStage.addEventListener("dblclick", onDbl);
      document.addEventListener("keydown", onKey);
      // clicking/dragging on the empty pasteboard (outside the card) marquee-selects (or clears)
      var stage = S.frame && S.frame.parentNode;
      if (stage) stage.addEventListener("pointerdown", function (e) {
        if (!S.active) return;
        if (S.heroStage.contains(e.target) || S.selbox.contains(e.target) || S.eltbar.contains(e.target) || S.cpop && S.cpop.contains(e.target)) return;
        if (!e.shiftKey) setSelection([]);
        drag = {
          mode: "marquee",
          ox: e.clientX,
          oy: e.clientY,
          add: e.shiftKey,
          base: S.selected.slice()
        };
        updateMarquee(e);
        S.marquee.style.display = "block";
      });
      document.addEventListener("click", function (e) {
        if (S.cpop && S.cpop.style.display === "block" && !S.cpop.contains(e.target) && !S.eltbar.contains(e.target)) closeColorPopover();
      });
      window.addEventListener("resize", function () {
        if (S.active) {
          placeSel();
          applyOverlay();
        }
      });
    },
    setActive: function (on) {
      S.active = on;
      if (!on) {
        deselect();
        closeColorPopover();
      }
      applyOverlay();
    },
    // called by the controller after each hero render
    setTarget: function (artEl, scale) {
      S.art = artEl;
      S.scale = scale;
      deselect();
      applyOverlay();
      history = [artEl.innerHTML];
      histIndex = 0;
    },
    reposition: placeSel,
    deselect: deselect
  };
}();
})(); } catch (e) { __ds_ns.__errors.push({ path: "app/board-editor.js", error: String((e && e.message) || e) }); }

// app/visual-board.js
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
   · "+ New visual" / "Iterate" copy a ready-made `/linkedin-visual` prompt to the
     clipboard; the user pastes it to the agent, which runs the brief then builds. */
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
      next.title = "Prepare an iterate prompt for the assistant";
      next.addEventListener("click", function () {
        prepareModal("iterate", v.label);
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
      nv.title = "Prepare a new-visual prompt for the assistant";
      nv.addEventListener("click", function () {
        prepareModal("new");
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

    /* ---- new visual / iterate → hand a ready-made prompt to the agent ----
       Agent-first: these buttons don't open a panel and don't fork a second
       assistant. They copy a standard `/linkedin-visual` prompt (with the rules
       baked in: ask the brief first, stay on the board, 3 variants) to the
       clipboard, so the user pastes it into the chat and the agent takes over. */
    function chatPrompt(text) {
      // The async Clipboard API is blocked in sandboxed previews, so try the legacy
      // execCommand path first (it works during a user-gesture click), then async,
      // then a fallback box the user can copy from manually.
      var ok = false;
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ok = document.execCommand("copy");
        ta.remove();
      } catch (e) {
        ok = false;
      }
      if (ok) {
        flash("Prompt copied — paste it to the assistant to continue");
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          flash("Prompt copied — paste it to the assistant to continue");
        }, function () {
          showPromptFallback(text);
        });
        return;
      }
      showPromptFallback(text);
    }
    // last resort: show the prompt in a selectable box so the user can copy it by hand
    function showPromptFallback(text) {
      var prev = document.getElementById("promptFallback");
      if (prev) prev.remove();
      var mac = navigator.platform && navigator.platform.indexOf("Mac") >= 0;
      var wrap = document.createElement("div");
      wrap.id = "promptFallback";
      wrap.style.cssText = "position:fixed;inset:0;background:rgba(20,24,28,.45);z-index:200;display:flex;align-items:center;justify-content:center";
      var box = document.createElement("div");
      box.style.cssText = "background:#fff;border-radius:14px;padding:20px;width:min(92vw,560px);box-shadow:0 16px 50px rgba(0,0,0,.3);font-family:'Inter',system-ui,sans-serif";
      box.innerHTML = '<div style="font-weight:700;font-size:15px;margin-bottom:4px">Copy this prompt, then paste it to the assistant</div><div style="font-size:13px;color:#6b7280;margin-bottom:10px">It\u2019s pre-selected \u2014 copy with ' + (mac ? "\u2318C" : "Ctrl+C") + ', then paste in the chat.</div>';
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.readOnly = true;
      ta.style.cssText = "width:100%;height:130px;border:1px solid #d8dadd;border-radius:10px;padding:11px;font:inherit;font-size:13px;line-height:1.5;resize:none;box-sizing:border-box;color:#1f2328";
      box.appendChild(ta);
      var row = document.createElement("div");
      row.style.cssText = "display:flex;justify-content:flex-end;margin-top:12px";
      var close = document.createElement("button");
      close.textContent = "Done";
      close.style.cssText = "padding:9px 18px;border:none;border-radius:9px;background:var(--brand-primary,#0A66C2);color:#fff;font-weight:700;cursor:pointer";
      close.addEventListener("click", function () {
        wrap.remove();
      });
      row.appendChild(close);
      box.appendChild(row);
      wrap.appendChild(box);
      document.body.appendChild(wrap);
      ta.focus();
      ta.select();
      wrap.addEventListener("click", function (e) {
        if (e.target === wrap) wrap.remove();
      });
    }
    function openBrief(msg) {
      flash(msg);
    } // legacy no-op nudge (kept for safety)

    /* ---- prepare-prompt modal (New visual / Iterate) ----
       A static artifact lives in an isolated preview frame; it cannot reach the
       chat input (cross-origin). So this modal PREPARES the prompt — paste your
       post + notes — and copies it; you paste once into the chat and attach any
       screenshots/drawings there. Agent-first: the AI still runs the brief. */
    function prepareModal(kind, label) {
      var prev = document.getElementById("prepModal");
      if (prev) prev.remove();
      var mac = navigator.platform && navigator.platform.indexOf("Mac") >= 0;
      var scrim = document.createElement("div");
      scrim.id = "prepModal";
      scrim.style.cssText = "position:fixed;inset:0;background:rgba(20,24,28,.45);z-index:200;display:flex;align-items:center;justify-content:center;font-family:'Inter',system-ui,sans-serif";
      var box = document.createElement("div");
      box.style.cssText = "background:#fff;border-radius:16px;padding:22px;width:min(94vw,580px);max-height:88vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,.32)";
      var title = kind === "iterate" ? "Iterate \u201c" + label + "\u201d" : "New visual";
      var lead = kind === "iterate" ? "Tell the assistant what to change. It'll add a new round of 3 variants to this visual." : "Paste your LinkedIn post and any direction. The assistant will ask the brief, then build 3 variants on the board.";
      box.innerHTML = '<div style="font-family:var(--font-display,inherit);font-weight:700;font-size:19px;letter-spacing:-.01em">' + title + '</div>' + '<div style="font-size:13.5px;color:#6b7280;margin:4px 0 16px;line-height:1.45">' + lead + '</div>';
      function field(labelText, ph, big) {
        var w = document.createElement("div");
        w.style.cssText = "margin-bottom:14px";
        w.innerHTML = '<div style="font-size:12px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:#6b7280;margin-bottom:6px">' + labelText + '</div>';
        var t = document.createElement("textarea");
        t.placeholder = ph;
        t.style.cssText = "width:100%;height:" + (big ? "120px" : "60px") + ";border:1px solid #d8dadd;border-radius:10px;padding:11px;font:inherit;font-size:14px;line-height:1.5;resize:vertical;box-sizing:border-box;color:#1f2328";
        w.appendChild(t);
        box.appendChild(w);
        return t;
      }
      var inA, inB;
      if (kind === "iterate") {
        inA = field("What should change?", "e.g. make variant B bolder, swap the metaphor to a ladder, tighten the headline\u2026", true);
      } else {
        inA = field("Your LinkedIn post", "Paste the post text here\u2026", true);
        inB = field("Direction / emphasize (optional)", "e.g. lean on the 68% stat; keep it punchy; audience = founders", false);
        box.appendChild(el2("div", "font-size:12.5px;color:#8a9098;margin:-4px 0 14px;line-height:1.45", "\uD83D\uDCCE Got screenshots, sketches or a brand reference? Paste/drag them straight into the chat after you paste this prompt."));
      }
      function el2(tag, css, html) {
        var d = document.createElement(tag);
        d.style.cssText = css;
        d.innerHTML = html;
        return d;
      }
      function buildPrompt() {
        if (kind === "iterate") {
          var ch = (inA.value || "").trim();
          return "/linkedin-visual\n\nIterate the visual \u201c" + label + "\u201d on the Visual Board." + (ch ? " What I want to change: " + ch + "." : " Ask me what I want to change first.") + " Add a NEW round of 3 genuinely different variants to that visual\u2019s existing <section> (keep the previous rounds). Stay on Visual Board.html \u2014 don\u2019t make a separate file.";
        }
        var post = (inA.value || "").trim(),
          notes = (inB.value || "").trim();
        return "/linkedin-visual\n\nI want a NEW visual on the Visual Board. Ask me the brief questions first (the type, the ONE thing readers should remember, the visual analogy, any references), then build 3 genuinely different variants as a new <section> on Visual Board.html \u2014 never a separate file." + (notes ? "\n\nDirection: " + notes : "") + (post ? "\n\nPOST:\n" + post : "");
      }
      var row = document.createElement("div");
      row.style.cssText = "display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:6px";
      var hint = el2("div", "font-size:12px;color:#aab0b6", "Copies the prompt \u2014 paste it in the chat (" + (mac ? "\u2318V" : "Ctrl+V") + ").");
      var btns = document.createElement("div");
      btns.style.cssText = "display:flex;gap:8px";
      var cancel = document.createElement("button");
      cancel.textContent = "Cancel";
      cancel.style.cssText = "padding:10px 16px;border:1px solid #d8dadd;border-radius:10px;background:#fff;font:inherit;font-weight:600;cursor:pointer;color:#5f6671";
      cancel.addEventListener("click", function () {
        scrim.remove();
      });
      var copy = document.createElement("button");
      copy.textContent = "Copy prompt";
      copy.style.cssText = "padding:10px 20px;border:none;border-radius:10px;background:var(--brand-primary,#0A66C2);color:#fff;font:inherit;font-weight:700;cursor:pointer";
      copy.addEventListener("click", function () {
        var ok = chatPrompt(buildPrompt());
        scrim.remove();
      });
      btns.appendChild(cancel);
      btns.appendChild(copy);
      row.appendChild(hint);
      row.appendChild(btns);
      box.appendChild(row);
      scrim.appendChild(box);
      document.body.appendChild(scrim);
      scrim.addEventListener("click", function (e) {
        if (e.target === scrim) scrim.remove();
      });
      setTimeout(function () {
        inA.focus();
      }, 30);
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
        cpop: document.getElementById("cpop"),
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "app/visual-board.js", error: String((e && e.message) || e) }); }

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

// components/icons/icon-kit.js
try { (() => {
/* ============================================================
   ICON KIT — MORE THAN SAID
   Reusable hand-drawn icon library for the LinkedIn visuals.
   Brand-agnostic engine + editor. Ships with an EMPTY icon set; populate per project.

   USAGE
     <link rel="stylesheet" href="icon.css">
     <script src="icon-kit.js"></script>
     <icon-mark name="rocket"></icon-mark>
     <icon-ill  name="research"></icon-ill>
     el.innerHTML = IconKit.mark('funnel');

   EDIT MODE (node editor)
     IconKit.capture(name)         -> [{ci,type,pts:[[x,y]..]}]  (anchor points)
     IconKit.setPoint(name,ci,pi,x,y)   move one anchor (persisted)
     IconKit.resetMark(name)            clear edits for one mark
     Edits live in localStorage('icon-overrides') and every live
     <icon-mark>/<icon-ill> re-renders on the 'icon-changed' event.

   Colour: line = var(--icon-ink) (defaults to --brand-secondary),
   accent = var(--brand-primary). Size with CSS width/height.
   ============================================================ */
(function (root) {
  function mul(a) {
    return function () {
      a |= 0;
      a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function f(n) {
    return Math.round(n * 10) / 10;
  }

  // ---- edit state (module scope, shared with Pen primitives) ----
  var STORE = {},
    OV = null,
    CIDX = 0,
    CAP = null,
    CAPTURE = false,
    CUSTOM = {};
  try {
    STORE = JSON.parse(root.localStorage.getItem('icon-overrides')) || {};
  } catch (e) {
    STORE = {};
  }
  try {
    (JSON.parse(root.localStorage.getItem('icon-custom')) || []).forEach(function (n) {
      CUSTOM[n] = true;
    });
  } catch (e) {}
  function NOOP() {}
  function persist() {
    try {
      root.localStorage.setItem('icon-overrides', JSON.stringify(STORE));
    } catch (e) {}
  }
  function persistCustom() {
    try {
      root.localStorage.setItem('icon-custom', JSON.stringify(Object.keys(CUSTOM)));
    } catch (e) {}
  }
  function ovGet(ci) {
    return OV ? OV[ci] : null;
  }
  function applyMoves(ci, pts) {
    var o = ovGet(ci);
    if (o) {
      for (var k in o) {
        if (k.charAt(0) !== '_') pts[+k] = [o[k][0], o[k][1]];
      }
    }
    return pts;
  }
  function cap(rec) {
    if (CAPTURE) CAP.push(rec);
  }
  // build an SVG path from anchors ([x,y] corner, or [x,y,hx,hy] with a symmetric bezier handle)
  function anchorPath(A, closed) {
    if (!A || !A.length) return '';
    function hx(a) {
      return a.length > 2 ? a[2] : 0;
    }
    function hy(a) {
      return a.length > 3 ? a[3] : 0;
    }
    var d = 'M' + f(A[0][0]) + ' ' + f(A[0][1]),
      n = A.length,
      segs = closed ? n : n - 1;
    for (var i = 0; i < segs; i++) {
      var a = A[i],
        b = A[(i + 1) % n];
      if (hx(a) || hy(a) || hx(b) || hy(b)) {
        d += ' C ' + f(a[0] + hx(a)) + ' ' + f(a[1] + hy(a)) + ' ' + f(b[0] - hx(b)) + ' ' + f(b[1] - hy(b)) + ' ' + f(b[0]) + ' ' + f(b[1]);
      } else d += ' L ' + f(b[0]) + ' ' + f(b[1]);
    }
    if (closed) d += ' Z';
    return d;
  }
  function profileOutline(A, baseW, profile, closed) {
    if (!A || A.length < 2) return '';
    function hx(a) {
      return a.length > 2 ? a[2] : 0;
    }
    function hy(a) {
      return a.length > 3 ? a[3] : 0;
    }
    var segEnd = closed ? A.length : A.length - 1,
      pts = [];
    for (var i = 0; i < segEnd; i++) {
      var a = A[i],
        b = A[(i + 1) % A.length];
      var c1x = a[0] + hx(a),
        c1y = a[1] + hy(a),
        c2x = b[0] - hx(b),
        c2y = b[1] - hy(b),
        sub = 14;
      for (var s2 = 0; s2 < sub; s2++) {
        var t = s2 / sub,
          mt = 1 - t;
        pts.push([mt * mt * mt * a[0] + 3 * mt * mt * t * c1x + 3 * mt * t * t * c2x + t * t * t * b[0], mt * mt * mt * a[1] + 3 * mt * mt * t * c1y + 3 * mt * t * t * c2y + t * t * t * b[1]]);
      }
    }
    if (!closed) pts.push([A[A.length - 1][0], A[A.length - 1][1]]);
    var n = pts.length,
      T = [0];
    for (var i = 1; i < n; i++) T[i] = T[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    var L = T[n - 1] || 1;
    for (var i = 0; i < n; i++) T[i] /= L;
    function wf(t) {
      var v;
      if (profile === 'bulge') v = Math.sin(Math.PI * t);else if (profile === 'taper') v = 1 - t;else if (profile === 'reverse') v = t;else if (profile === 'waist') v = Math.abs(2 * t - 1);else v = 1;
      return baseW * (0.14 + 0.95 * v);
    }
    function norm(i) {
      var a = pts[(i - 1 + n) % n],
        b = pts[(i + 1) % n];
      if (!closed) {
        a = pts[Math.max(0, i - 1)];
        b = pts[Math.min(n - 1, i + 1)];
      }
      var dx = b[0] - a[0],
        dy = b[1] - a[1],
        len = Math.hypot(dx, dy) || 1;
      return [-dy / len, dx / len];
    }
    var left = [],
      right = [];
    for (var i = 0; i < n; i++) {
      var hw = wf(T[i]) / 2,
        nb = norm(i);
      left.push([pts[i][0] + nb[0] * hw, pts[i][1] + nb[1] * hw]);
      right.push([pts[i][0] - nb[0] * hw, pts[i][1] - nb[1] * hw]);
    }
    if (closed) {
      var d1 = 'M' + f(left[0][0]) + ' ' + f(left[0][1]);
      for (var i = 1; i < n; i++) d1 += ' L ' + f(left[i][0]) + ' ' + f(left[i][1]);
      d1 += ' Z';
      var d2 = 'M' + f(right[0][0]) + ' ' + f(right[0][1]);
      for (var i = 1; i < n; i++) d2 += ' L ' + f(right[i][0]) + ' ' + f(right[i][1]);
      d2 += ' Z';
      return d1 + ' ' + d2;
    }
    var d = 'M' + f(left[0][0]) + ' ' + f(left[0][1]);
    for (var i = 1; i < n; i++) d += ' L ' + f(left[i][0]) + ' ' + f(left[i][1]);
    for (var i = n - 1; i >= 0; i--) d += ' L ' + f(right[i][0]) + ' ' + f(right[i][1]);
    d += ' Z';
    return d;
  }
  function Pen(seed) {
    var rng = mul(seed),
      els = [];
    function j(m) {
      return (rng() * 2 - 1) * m;
    }
    function smooth(pts, close) {
      var d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
      for (var i = 1; i < pts.length; i++) {
        var mx = (pts[i - 1][0] + pts[i][0]) / 2,
          my = (pts[i - 1][1] + pts[i][1]) / 2;
        d += ' Q ' + f(pts[i - 1][0]) + ' ' + f(pts[i - 1][1]) + ' ' + f(mx) + ' ' + f(my);
      }
      if (close) d += ' Z';else {
        var L = pts[pts.length - 1];
        d += ' L ' + f(L[0]) + ' ' + f(L[1]);
      }
      return d;
    }
    function edgy(P, close) {
      var d = 'M' + f(P[0][0]) + ' ' + f(P[0][1]),
        n = P.length;
      function seg(a, b) {
        var mx = (a[0] + b[0]) / 2,
          my = (a[1] + b[1]) / 2,
          nx = -(b[1] - a[1]),
          ny = b[0] - a[0],
          L = Math.hypot(nx, ny) || 1;
        var bow = j(Math.min(1.5, Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.02));
        d += ' Q ' + f(mx + nx / L * bow) + ' ' + f(my + ny / L * bow) + ' ' + f(b[0]) + ' ' + f(b[1]);
      }
      for (var i = 1; i < n; i++) seg(P[i - 1], P[i]);
      if (close) {
        seg(P[n - 1], P[0]);
        d += ' Z';
      }
      return d;
    }
    function line(x1, y1, x2, y2, o) {
      o = o || {};
      var ci = CIDX++;
      var P = applyMoves(ci, [[x1, y1], [x2, y2]]);
      cap({
        ci: ci,
        type: 'line',
        pts: [P[0].slice(), P[1].slice()],
        closed: false,
        sw: o.sw,
        coral: !!o.coral
      });
      var ov = ovGet(ci);
      if (ov && ov._a) {
        els.push({
          d: anchorPath(ov._a, !!ov._c),
          sw: o.sw,
          coral: o.coral,
          dash: o.dash,
          ci: ci
        });
        return;
      }
      x1 = P[0][0];
      y1 = P[0][1];
      x2 = P[1][0];
      y2 = P[1][1];
      var over = o.over || 0,
        ang = Math.atan2(y2 - y1, x2 - x1),
        dx = Math.cos(ang),
        dy = Math.sin(ang);
      x1 -= dx * over;
      y1 -= dy * over;
      x2 += dx * over;
      y2 += dy * over;
      var nx = -dy,
        ny = dx,
        len = Math.hypot(x2 - x1, y2 - y1),
        a = Math.min(1.6, len * 0.012 + 0.3);
      els.push({
        d: `M${f(x1)} ${f(y1)} C ${f(x1 + (x2 - x1) * 0.34 + nx * j(a))} ${f(y1 + (y2 - y1) * 0.34 + ny * j(a))} ${f(x1 + (x2 - x1) * 0.66 + nx * j(a))} ${f(y1 + (y2 - y1) * 0.66 + ny * j(a))} ${f(x2)} ${f(y2)}`,
        sw: o.sw,
        coral: o.coral,
        dash: o.dash,
        ci: ci
      });
    }
    function circle(cx, cy, r, o) {
      o = o || {};
      var ci = CIDX++;
      var P = applyMoves(ci, [[cx, cy], [cx + r, cy]]);
      cap({
        ci: ci,
        type: 'circle',
        pts: [P[0].slice(), P[1].slice()],
        closed: false,
        sw: o.sw,
        coral: !!o.coral
      });
      cx = P[0][0];
      cy = P[0][1];
      r = Math.hypot(P[1][0] - cx, P[1][1] - cy) || 0.001;
      var tilt = j(0.04),
        sq = 0.98 + j(0.03),
        segs = 28,
        pts = [];
      for (var i = 0; i < segs; i++) {
        var t = 6.283 * i / segs,
          rr = r * (1 + j(0.012)),
          x = Math.cos(t) * rr,
          y = Math.sin(t) * rr * sq;
        pts.push([cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt)]);
      }
      els.push({
        d: smooth(pts, true),
        sw: o.sw,
        coral: o.coral,
        fill: o.fill,
        inkfill: o.inkfill,
        ci: ci
      });
    }
    function poly(pts, close, o) {
      o = o || {};
      var ci = CIDX++;
      var A = applyMoves(ci, pts.map(function (p) {
        return [p[0], p[1]];
      }));
      cap({
        ci: ci,
        type: 'poly',
        pts: A.map(function (p) {
          return p.slice();
        }),
        closed: !!close,
        sw: o.sw,
        coral: !!o.coral,
        fill: !!(o.fill || o.inkfill),
        sharp: !!o.sharp
      });
      var ov = ovGet(ci);
      if (ov && ov._a) {
        els.push({
          d: anchorPath(ov._a, ov._c != null ? ov._c : !!close),
          sw: o.sw,
          coral: o.coral,
          fill: o.fill,
          inkfill: o.inkfill,
          ci: ci
        });
        return;
      }
      var jj = o.j == null ? 0.8 : o.j,
        P = A.map(p => [p[0] + j(jj), p[1] + j(jj)]);
      els.push({
        d: o.sharp ? edgy(P, close) : smooth(P, close),
        sw: o.sw,
        coral: o.coral,
        fill: o.fill,
        inkfill: o.inkfill,
        ci: ci
      });
    }
    function dot(cx, cy, r, o) {
      o = o || {};
      var ci = CIDX++;
      var P = applyMoves(ci, [[cx, cy], [cx + r, cy]]);
      cap({
        ci: ci,
        type: 'dot',
        pts: [P[0].slice(), P[1].slice()],
        closed: false,
        coral: !!o.coral
      });
      cx = P[0][0];
      cy = P[0][1];
      r = Math.hypot(P[1][0] - cx, P[1][1] - cy);
      els.push({
        dot: [cx, cy, r],
        coral: o.coral
      });
    }
    function arc(cx, cy, r, a0, a1, o) {
      o = o || {};
      var ci = CIDX++;
      var P = applyMoves(ci, [[cx, cy], [cx + r * Math.cos(a0), cy + r * Math.sin(a0)]]);
      cap({
        ci: ci,
        type: 'arc',
        pts: [P[0].slice(), P[1].slice()],
        closed: false,
        sw: o.sw,
        coral: !!o.coral
      });
      cx = P[0][0];
      cy = P[0][1];
      r = Math.hypot(P[1][0] - cx, P[1][1] - cy);
      var segs = Math.max(5, Math.round(Math.abs(a1 - a0) / 0.32)),
        pts = [];
      for (var i = 0; i <= segs; i++) {
        var t = a0 + (a1 - a0) * i / segs;
        pts.push([cx + Math.cos(t) * r * (1 + j(0.015)), cy + Math.sin(t) * r * (1 + j(0.015))]);
      }
      els.push({
        d: smooth(pts, false),
        sw: o.sw,
        coral: o.coral,
        ci: ci
      });
    }
    function star(cx, cy, r, o) {
      o = o || {};
      var pts = [],
        n = 5,
        rot = -Math.PI / 2 + j(0.04);
      for (var i = 0; i < n * 2; i++) {
        var rr = i % 2 ? r * 0.42 : r,
          a = rot + Math.PI * i / n;
        pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
      }
      poly(pts, true, {
        coral: o.coral,
        fill: o.fill,
        inkfill: o.inkfill,
        sw: o.sw || 2.5,
        j: 0.4,
        sharp: true
      });
    }
    function heart(cx, cy, s) {
      var ci = CIDX++;
      var P = applyMoves(ci, [[cx, cy], [cx, cy - s]]);
      cap({
        ci: ci,
        type: 'heart',
        pts: [P[0].slice(), P[1].slice()],
        closed: false,
        coral: true
      });
      cx = P[0][0];
      cy = P[0][1];
      s = Math.hypot(P[1][0] - cx, P[1][1] - cy);
      els.push({
        d: `M ${f(cx)} ${f(cy + s * 0.8)} C ${f(cx - s)} ${f(cy)} ${f(cx - s * 0.5)} ${f(cy - s * 0.72)} ${f(cx)} ${f(cy - s * 0.18)} C ${f(cx + s * 0.5)} ${f(cy - s * 0.72)} ${f(cx + s)} ${f(cy)} ${f(cx)} ${f(cy + s * 0.8)} Z`,
        coral: true,
        fill: true,
        sw: 1.5
      });
    }
    return {
      line,
      circle,
      poly,
      dot,
      arc,
      star,
      heart,
      els
    };
  }
  var OUT = 4.4,
    DET = 3.4,
    COR = 4;

  // ---- 100 sprinkle marks ----
  var ELEM = {}; // empty in the core build — add marks or create/import in the editor

  // ---- story illustrations ----
  var ILL = {};
  function svgFrom(els) {
    return '<svg viewBox="0 0 160 160">' + els.map(function (e) {
      var col = e.coral ? 'var(--brand-primary)' : 'var(--icon-ink)';
      if (e.dot) return '<circle cx="' + f(e.dot[0]) + '" cy="' + f(e.dot[1]) + '" r="' + e.dot[2] + '" fill="' + col + '"/>';
      if (e.xstroke !== undefined) {
        var sc = e.xstroke === 'none' ? 'none' : e.xstroke === 'coral' ? 'var(--brand-primary)' : 'var(--icon-ink)';
        var fc = !e.xfill || e.xfill === 'none' ? 'none' : e.xfill === 'coral' ? 'var(--brand-primary)' : 'var(--icon-ink)';
        return '<path d="' + e.d + '" fill="' + fc + '"' + (e.eo ? ' fill-rule="evenodd"' : '') + ' stroke="' + sc + '" stroke-width="' + (e.sw || OUT) + '" stroke-linecap="round" stroke-linejoin="round"/>';
      }
      if (e.fill || e.inkfill) {
        var fc = e.inkfill ? 'var(--icon-ink)' : col;
        return '<path d="' + e.d + '" fill="' + fc + '" stroke="' + fc + '" stroke-width="' + (e.sw || 2.5) + '" stroke-linejoin="round" stroke-linecap="round"/>';
      }
      var dash = e.dash ? ' stroke-dasharray="2 13"' : '';
      return '<path d="' + e.d + '" fill="none" stroke="' + col + '" stroke-width="' + (e.sw || OUT) + '" stroke-linecap="round" stroke-linejoin="round"' + dash + '/>';
    }).join('') + '</svg>';
  }
  function run(name, builder, seed) {
    OV = STORE[name] || null;
    CIDX = 0;
    CAPTURE = false;
    var p = Pen(seed);
    builder(p);
    if (OV) {
      p.els.forEach(function (el) {
        if (el.ci == null) return;
        var v = OV[el.ci];
        if (!v) return;
        if (v._sw != null) el.sw = v._sw;
        if (v._stroke != null || v._fill != null) {
          var bs = el.coral ? 'coral' : 'ink',
            bf = el.fill || el.inkfill ? el.inkfill ? 'ink' : el.coral ? 'coral' : 'ink' : 'none';
          el.xstroke = v._stroke != null ? v._stroke : el.fill || el.inkfill ? 'none' : bs;
          el.xfill = v._fill != null ? v._fill : bf;
          el.fill = false;
          el.inkfill = false;
        }
      });
    }
    var ex = OV && OV._extra;
    if (ex) {
      for (var i = 0; i < ex.length; i++) {
        var s = ex[i];
        if (s.profile && s.profile !== 'uniform') {
          p.els.push({
            d: profileOutline(s.pts, s.sw || OUT, s.profile, !!s.closed),
            xfill: s.stroke || 'ink',
            xstroke: 'none',
            sw: 0,
            eo: true
          });
        } else p.els.push({
          d: anchorPath(s.pts, !!s.closed),
          sw: s.sw || OUT,
          xstroke: s.stroke || (s.coral ? 'coral' : 'ink'),
          xfill: s.fill || 'none'
        });
      }
    }
    OV = null;
    return p.els;
  }
  function hash(s) {
    s = s || '';
    var h = 29;
    for (var i = 0; i < s.length; i++) h = h * 131 + s.charCodeAt(i) >>> 0;
    return h;
  }
  function seedFor(kind, name) {
    return hash((kind === 'ill' ? 'i' : 'm') + name);
  }
  var IconKit = {
    mark: function (name, o) {
      o = o || {};
      var b = ELEM[name] || (CUSTOM[name] ? NOOP : null);
      return b ? svgFrom(run(name, b, o.seed != null ? o.seed : seedFor('mark', name))) : '';
    },
    ill: function (name, o) {
      o = o || {};
      var b = ILL[name];
      return b ? svgFrom(run(name, b, o.seed != null ? o.seed : seedFor('ill', name))) : '';
    },
    markNames: Object.keys(ELEM),
    illNames: Object.keys(ILL),
    customNames: function () {
      return Object.keys(CUSTOM);
    },
    newCustom: function () {
      var n = 'custom-' + Date.now().toString(36);
      CUSTOM[n] = true;
      persistCustom();
      return n;
    },
    removeCustom: function (name) {
      delete CUSTOM[name];
      delete STORE[name];
      persistCustom();
      persist();
      emit();
    },
    // ---- editor API ----
    capture: function (name) {
      var kind = ILL[name] ? 'ill' : 'mark',
        b = ELEM[name] || ILL[name] || (CUSTOM[name] ? NOOP : null);
      if (!b) return [];
      OV = STORE[name] || null;
      CIDX = 0;
      CAPTURE = true;
      CAP = [];
      var p = Pen(seedFor(kind, name));
      b(p);
      CAPTURE = false;
      var out = CAP.map(function (rec) {
        var ov = OV && OV[rec.ci];
        if (ov && ov._a) {
          rec.anchors = ov._a.map(function (a) {
            return a.slice();
          });
          rec.closed = ov._c != null ? ov._c : rec.closed;
        }
        if (rec.type !== 'extra') {
          var bS = rec.coral ? 'coral' : 'ink',
            bF = rec.fill ? rec.coral ? 'coral' : 'ink' : 'none';
          rec.stroke = ov && ov._stroke != null ? ov._stroke : bS;
          rec.fill = ov && ov._fill != null ? ov._fill : bF;
          rec.sw = ov && ov._sw != null ? ov._sw : rec.sw;
        }
        return rec;
      });
      var ex = OV && OV._extra;
      if (ex) {
        ex.forEach(function (s, i) {
          out.push({
            ci: 'e' + i,
            type: 'extra',
            extra: true,
            anchors: s.pts.map(function (a) {
              return a.slice();
            }),
            pts: s.pts.map(function (a) {
              return [a[0], a[1]];
            }),
            closed: !!s.closed,
            sw: s.sw,
            stroke: s.stroke || (s.coral ? 'coral' : 'ink'),
            fill: s.fill || 'none',
            profile: s.profile || 'uniform'
          });
        });
      }
      CAP = null;
      OV = null;
      return out;
    },
    setPoint: function (name, ci, pi, x, y) {
      STORE[name] = STORE[name] || {};
      STORE[name][ci] = STORE[name][ci] || {};
      STORE[name][ci][pi] = [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
      persist();
      emit();
    },
    setAnchors: function (name, ci, anchors, closed) {
      var e = STORE[name] = STORE[name] || {};
      if (String(ci).charAt(0) === 'e') {
        var idx = +String(ci).slice(1);
        if (e._extra && e._extra[idx]) {
          e._extra[idx].pts = anchors;
          e._extra[idx].closed = !!closed;
        }
      } else {
        e[ci] = e[ci] || {};
        e[ci]._a = anchors;
        e[ci]._c = !!closed;
      }
      persist();
      emit();
    },
    addExtra: function (name, stroke) {
      var e = STORE[name] = STORE[name] || {};
      e._extra = e._extra || [];
      e._extra.push(stroke);
      persist();
      emit();
      return e._extra.length - 1;
    },
    removeExtra: function (name, idx) {
      var e = STORE[name];
      if (e && e._extra) {
        e._extra.splice(idx, 1);
        persist();
        emit();
      }
    },
    setExtraStyle: function (name, idx, style) {
      var e = STORE[name];
      if (e && e._extra && e._extra[idx]) {
        for (var k in style) {
          e._extra[idx][k] = style[k];
        }
        persist();
        emit();
      }
    },
    setStrokeStyle: function (name, ci, style) {
      var e = STORE[name] = STORE[name] || {};
      e[ci] = e[ci] || {};
      if (style.sw != null) e[ci]._sw = style.sw;
      if (style.stroke != null) e[ci]._stroke = style.stroke;
      if (style.fill != null) e[ci]._fill = style.fill;
      persist();
      emit();
    },
    getEdit: function (name) {
      return STORE[name] ? JSON.parse(JSON.stringify(STORE[name])) : null;
    },
    setEdit: function (name, obj) {
      if (obj == null) delete STORE[name];else STORE[name] = obj;
      persist();
      emit();
    },
    isEdited: function (name) {
      return !!STORE[name];
    },
    resetMark: function (name) {
      delete STORE[name];
      persist();
      emit();
    },
    resetAll: function () {
      STORE = {};
      persist();
      emit();
    }
  };
  root.IconKit = IconKit;
  function emit() {
    try {
      document.dispatchEvent(new CustomEvent('icon-changed'));
    } catch (e) {}
  }

  // ---- custom elements ----
  function define(tag, kind) {
    if (!root.customElements || customElements.get(tag)) return;
    customElements.define(tag, class extends HTMLElement {
      static get observedAttributes() {
        return ['name', 'seed'];
      }
      connectedCallback() {
        this._r();
        if (!this._h) {
          this._h = () => this._r();
          document.addEventListener('icon-changed', this._h);
        }
      }
      disconnectedCallback() {
        if (this._h) {
          document.removeEventListener('icon-changed', this._h);
          this._h = null;
        }
      }
      attributeChangedCallback() {
        if (this.isConnected) this._r();
      }
      _r() {
        var n = this.getAttribute('name');
        if (!n) return;
        var s = this.getAttribute('seed');
        this.innerHTML = IconKit[kind](n, s != null ? {
          seed: +s
        } : undefined);
      }
    });
  }
  define('icon-mark', 'mark');
  define('icon-ill', 'ill');
})(window);
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/icons/icon-kit.js", error: String((e && e.message) || e) }); }

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

// tools/anti-slop/detect-antipatterns.js
try { (() => {
/**
 * Anti-Pattern Browser Detector for Impeccable
 * Copyright (c) 2026 Paul Bakaus
 * SPDX-License-Identifier: Apache-2.0
 *
 * GENERATED -- do not edit. Source: cli/engine/browser/injected/index.mjs
 * Rebuild: node scripts/build-browser-detector.js
 *
 * Usage: <script src="detect-antipatterns-browser.js"></script>
 * Re-scan: window.impeccableScan()
 */
(function () {
  if (typeof window === 'undefined') return;
  // --- cli/engine/shared/constants.mjs ---
  // ─── Section 1: Constants ───────────────────────────────────────────────────

  const SAFE_TAGS = new Set(['blockquote', 'nav', 'a', 'input', 'textarea', 'select', 'pre', 'code', 'span', 'th', 'td', 'tr', 'li', 'label', 'button', 'hr', 'html', 'head', 'body', 'script', 'style', 'link', 'meta', 'title', 'br', 'img', 'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'g', 'defs', 'use']);

  // Per-check safe-tags override for the border (side-tab / border-accent)
  // rule. We intentionally re-allow <label> here because card-shaped clickable
  // labels (e.g. .checklist-item wrapping a checkbox + content) are one of the
  // canonical side-tab anti-pattern shapes and must be detected. The rule's
  // other preconditions (non-neutral color, width >= 2px on a single side,
  // radius > 0 or width >= 3, element size >= 20x20 in the browser path)
  // already filter out plain inline form labels so this does not introduce
  // false positives. See modern-color-borders.html for the test matrix.
  const BORDER_SAFE_TAGS = new Set([...SAFE_TAGS].filter(t => t !== 'label'));
  const OVERUSED_FONTS = new Set([
  // Older monoculture (still ubiquitous):
  'inter', 'roboto', 'open sans', 'lato', 'montserrat', 'arial', 'helvetica',
  // Newer monoculture (the Anthropic-skill / Vercel / GitHub default wave):
  'fraunces', 'instrument sans', 'instrument serif', 'geist', 'geist sans', 'geist mono', 'mona sans', 'plus jakarta sans', 'space grotesk', 'recoleta']);

  // Brand-associated fonts: don't flag these as "overused" on the brand's own domains.
  // Keys are font names, values are arrays of hostname suffixes where the font is allowed.
  const GOOGLE_DOMAINS = ['google.com', 'youtube.com', 'android.com', 'chromium.org', 'chrome.com', 'web.dev', 'gstatic.com', 'firebase.google.com'];
  const VERCEL_DOMAINS = ['vercel.com', 'nextjs.org', 'v0.app'];
  const GITHUB_DOMAINS = ['github.com', 'githubnext.com'];
  const BRAND_FONT_DOMAINS = {
    'roboto': GOOGLE_DOMAINS,
    'google sans': GOOGLE_DOMAINS,
    'product sans': GOOGLE_DOMAINS,
    'geist': VERCEL_DOMAINS,
    'geist sans': VERCEL_DOMAINS,
    'geist mono': VERCEL_DOMAINS,
    'mona sans': GITHUB_DOMAINS
  };
  function isBrandFontOnOwnDomain(font) {
    if (typeof location === 'undefined') return false;
    const allowed = BRAND_FONT_DOMAINS[font];
    if (!allowed) return false;
    const host = location.hostname.toLowerCase();
    return allowed.some(suffix => host === suffix || host.endsWith('.' + suffix));
  }
  const GENERIC_FONTS = new Set(['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded', '-apple-system', 'blinkmacsystemfont', 'segoe ui', 'inherit', 'initial', 'unset', 'revert']);

  // WCAG large text thresholds are defined in points: 18pt normal text and
  // 14pt bold text. Browsers expose font-size in CSS pixels at 96px per inch.
  const WCAG_LARGE_TEXT_PX = 18 * (96 / 72);
  const WCAG_LARGE_BOLD_TEXT_PX = 14 * (96 / 72);

  // Serif faces that show up in italic-display heroes. The rule also fires when
  // the primary face is unknown but the stack ends in the generic `serif` token,
  // which catches custom/private faces with a serif fallback.
  const KNOWN_SERIF_FONTS = new Set(['fraunces', 'recoleta', 'newsreader', 'playfair display', 'playfair', 'cormorant', 'cormorant garamond', 'garamond', 'eb garamond', 'tiempos', 'tiempos headline', 'tiempos text', 'lora', 'vollkorn', 'spectral', 'source serif pro', 'source serif 4', 'source serif', 'ibm plex serif', 'merriweather', 'libre caslon', 'libre baskerville', 'baskerville', 'georgia', 'times new roman', 'times', 'dm serif display', 'dm serif text', 'instrument serif', 'gt sectra', 'ogg', 'canela', 'freight display', 'freight text']);

  // --- cli/engine/registry/antipatterns.mjs ---
  const ANTIPATTERNS = [
  // ── AI slop: tells that something was AI-generated ──
  {
    id: 'side-tab',
    category: 'slop',
    name: 'Side-tab accent border',
    description: 'Thick colored border on one side of a card — the most recognizable tell of AI-generated UIs. Use a subtler accent or remove it entirely.',
    skillSection: 'Visual Details',
    skillGuideline: 'colored accent stripe'
  }, {
    id: 'border-accent-on-rounded',
    category: 'slop',
    name: 'Border accent on rounded element',
    description: 'Thick accent border on a rounded card — the border clashes with the rounded corners. Remove the border or the border-radius.',
    skillSection: 'Visual Details',
    skillGuideline: 'colored accent stripe'
  }, {
    id: 'overused-font',
    category: 'slop',
    name: 'Overused font',
    description: 'Inter, Roboto, Fraunces, Geist, Plus Jakarta Sans, and Space Grotesk are used on so many sites they no longer feel distinctive. Each new wave of AI-generated UIs converges on the same handful of faces. Choose a face that gives your interface personality.',
    skillSection: 'Typography',
    skillGuideline: 'overused fonts like Inter'
  }, {
    id: 'single-font',
    category: 'slop',
    name: 'Single font for everything',
    description: 'Only one font family is used for the entire page. Pair a distinctive display font with a refined body font to create typographic hierarchy.',
    skillSection: 'Typography',
    skillGuideline: 'only one font family for the entire page'
  }, {
    id: 'flat-type-hierarchy',
    category: 'slop',
    name: 'Flat type hierarchy',
    description: 'Font sizes are too close together — no clear visual hierarchy. Use fewer sizes with more contrast (aim for at least a 1.25 ratio between steps).',
    skillSection: 'Typography',
    skillGuideline: 'flat type hierarchy'
  }, {
    id: 'gradient-text',
    category: 'slop',
    name: 'Gradient text',
    description: 'Gradient text is decorative rather than meaningful — a common AI tell, especially on headings and metrics. Use solid colors for text.',
    skillSection: 'Color & Contrast',
    skillGuideline: 'gradient text for'
  }, {
    id: 'ai-color-palette',
    category: 'slop',
    name: 'AI color palette',
    description: 'Purple/violet gradients and cyan-on-dark are the most recognizable tells of AI-generated UIs. Choose a distinctive, intentional palette.',
    skillSection: 'Color & Contrast',
    skillGuideline: 'AI color palette'
  }, {
    id: 'cream-palette',
    category: 'slop',
    name: 'Cream / beige palette',
    description: 'A warm cream or beige page background has become the default "tasteful" AI surface, reached for by reflex. Choose a background that comes from a deliberate palette, not the safe warm off-white.',
    skillSection: 'Color & Contrast',
    skillGuideline: 'cream and beige as the default surface'
  }, {
    id: 'nested-cards',
    category: 'slop',
    name: 'Nested cards',
    description: 'Cards inside cards create visual noise and excessive depth. Flatten the hierarchy — use spacing, typography, and dividers instead of nesting containers.',
    skillSection: 'Layout & Space',
    skillGuideline: 'Nest cards inside cards'
  }, {
    id: 'monotonous-spacing',
    category: 'slop',
    name: 'Monotonous spacing',
    description: 'The same spacing value used everywhere — no rhythm, no variation. Use tight groupings for related items and generous separations between sections.',
    skillSection: 'Layout & Space',
    skillGuideline: 'same spacing everywhere'
  }, {
    id: 'bounce-easing',
    category: 'slop',
    name: 'Bounce or elastic easing',
    description: 'Bounce and elastic easing feel dated and tacky. Real objects decelerate smoothly — use exponential easing (ease-out-quart/quint/expo) instead.',
    skillSection: 'Motion',
    skillGuideline: 'bounce or elastic easing'
  }, {
    id: 'dark-glow',
    category: 'slop',
    name: 'Dark mode with glowing accents',
    description: 'Dark backgrounds with colored box-shadow glows are the default "cool" look of AI-generated UIs. Use subtle, purposeful lighting instead — or skip the dark theme entirely.',
    skillSection: 'Color & Contrast',
    skillGuideline: 'dark mode with glowing accents'
  }, {
    id: 'icon-tile-stack',
    category: 'slop',
    name: 'Icon tile stacked above heading',
    description: 'A small rounded-square icon container above a heading is the universal AI feature-card template — every generator outputs this exact shape. Try a side-by-side icon and heading, or let the icon sit in flow without its own container.',
    skillSection: 'Typography',
    skillGuideline: 'large icons with rounded corners above every heading'
  }, {
    id: 'italic-serif-display',
    category: 'slop',
    name: 'Italic serif display headline',
    description: 'Oversized italic serif (Fraunces, Recoleta, Playfair, Newsreader-italic) as the primary hero headline reads as taste in isolation but has become the universal AI-startup landing page hero. Set roman, or move to a non-serif display face. Editorial / magazine register may legitimately want this — judge by context.',
    skillSection: 'Typography',
    skillGuideline: 'oversized italic serif as the hero headline'
  }, {
    id: 'hero-eyebrow-chip',
    category: 'slop',
    name: 'Hero eyebrow / pill chip',
    description: 'A tiny uppercase letter-spaced label sitting immediately above an oversized hero headline — or the same shape rendered as a pill chip — is now the default AI SaaS hero. Drop the eyebrow, integrate the kicker into the headline, or run it as a navigation breadcrumb instead.',
    skillSection: 'Typography',
    skillGuideline: 'tiny uppercase tracked label above the hero headline'
  }, {
    id: 'repeated-section-kickers',
    category: 'slop',
    severity: 'advisory',
    name: 'Repeated section kicker labels',
    description: 'Repeating tiny uppercase tracked labels above section headings turns a brand page into AI editorial scaffolding. Replace them with stronger structure, artifacts, imagery, or a deliberate brand system.',
    skillSection: 'Typography',
    skillGuideline: 'repeated eyebrow or kicker labels as section scaffolding'
  }, {
    id: 'numbered-section-markers',
    category: 'slop',
    severity: 'advisory',
    name: 'Numbered section markers (01 / 02 / 03)',
    description: 'Numbered display markers as section labels (01, 02, 03) are the AI editorial scaffold one tier deeper than tracked eyebrow chips. If you find yourself reaching for them, choose a different section cadence.',
    skillSection: 'Layout & Space',
    skillGuideline: 'numbered section markers'
  }, {
    id: 'em-dash-overuse',
    category: 'slop',
    name: 'Em-dash overuse',
    description: 'More than two em-dashes (— or --) in body copy is an AI cadence tell. Use commas, colons, periods, or parentheses instead.',
    skillSection: 'Copy',
    skillGuideline: 'no em dashes'
  }, {
    id: 'marketing-buzzword',
    category: 'slop',
    name: 'Marketing buzzword',
    description: 'Generic SaaS phrases (streamline / empower / supercharge / world-class / enterprise-grade / next-generation / cutting-edge / etc) are instant AI tells. Pick a specific verb and noun that says what the product literally does.',
    skillSection: 'Copy',
    skillGuideline: 'marketing buzzwords'
  }, {
    id: 'aphoristic-cadence',
    category: 'slop',
    name: 'Aphoristic-cadence copy',
    description: 'Three or more sections landing on a short rebuttal sentence ("X. No Y." / "X. Just Y.") or a manufactured-contrast aphorism ("Not a feature. A platform.") reads as AI cadence, not voice. Once is fine; the pattern is the tell.',
    skillSection: 'Copy',
    skillGuideline: 'aphoristic cadence'
  }, {
    id: 'oversized-h1',
    category: 'slop',
    name: 'Oversized hero headline',
    description: 'A full-sentence headline set at display size ends up dominating the viewport, leaving no room for anything else above the fold. A punchy one- or two-word headline at that size is fine — the problem is a long headline blown up too large. Set long headlines smaller, or tighten the copy.',
    skillSection: 'Typography',
    skillGuideline: 'long headline set at display size'
  }, {
    id: 'extreme-negative-tracking',
    category: 'slop',
    name: 'Crushed letter spacing',
    description: 'Letter-spacing pulled tighter than the point where characters keep their own shapes costs legibility. Tighten display type optically, not destructively.',
    skillSection: 'Typography',
    skillGuideline: 'letter spacing crushed past legibility'
  }, {
    id: 'broken-image',
    category: 'quality',
    name: 'Broken or placeholder image',
    description: '<img> tags with empty src, missing src, or placeholder values ship as broken-image boxes. Use real images, generated assets, or remove the tag.',
    skillSection: 'Imagery',
    skillGuideline: 'broken image references'
  },
  // ── Quality: general design and accessibility issues ──
  {
    id: 'gray-on-color',
    category: 'quality',
    name: 'Gray text on colored background',
    description: 'Gray text looks washed out on colored backgrounds. Use a darker shade of the background color instead, or white/near-white for contrast.',
    skillSection: 'Color & Contrast',
    skillGuideline: 'gray text on colored backgrounds'
  }, {
    id: 'low-contrast',
    category: 'quality',
    name: 'Low contrast text',
    description: 'Text does not meet WCAG AA contrast requirements (4.5:1 for body, 3:1 for large text). Increase the contrast between text and background.'
  }, {
    id: 'layout-transition',
    category: 'quality',
    name: 'Layout property animation',
    description: 'Animating width, height, padding, or margin causes layout thrash and janky performance. Use transform and opacity instead, or grid-template-rows for height animations.',
    skillSection: 'Motion',
    skillGuideline: 'Animate layout properties'
  }, {
    id: 'line-length',
    category: 'quality',
    name: 'Line length too long',
    description: 'Text lines wider than ~80 characters are hard to read. The eye loses its place tracking back to the start of the next line. Add a max-width (65ch to 75ch) to text containers.',
    skillSection: 'Layout & Space',
    skillGuideline: 'wrap beyond ~80 characters'
  }, {
    id: 'cramped-padding',
    category: 'quality',
    name: 'Cramped padding',
    description: 'Text is too close to the edge of its container. Two shapes: (1) an element with its own text where the padding is too low for the font size, and (2) a wrapper with text-bearing children and near-zero padding against a visible boundary (border, outline, or non-transparent background) — children land flush against the boundary line. Add at least 8px (ideally 12–16px) of padding inside bordered, outlined, or colored containers.',
    skillSection: 'Layout & Space',
    skillGuideline: 'inside bordered or colored containers'
  }, {
    id: 'body-text-viewport-edge',
    category: 'quality',
    name: 'Body text touching viewport edge',
    description: 'Body paragraphs render flush against the left or right viewport edge with no container providing horizontal padding. Wrap content in a container with at least 16px (ideally 24-32px) of horizontal padding, or apply max-width with mx-auto.'
  }, {
    id: 'tight-leading',
    category: 'quality',
    name: 'Tight line height',
    description: 'Line height below 1.3x the font size makes multi-line text hard to read. Use 1.5 to 1.7 for body text so lines have room to breathe.'
  }, {
    id: 'skipped-heading',
    category: 'quality',
    name: 'Skipped heading level',
    description: 'Heading levels should not skip (e.g. h1 then h3 with no h2). Screen readers use heading hierarchy for navigation. Skipping levels breaks the document outline.'
  }, {
    id: 'justified-text',
    category: 'quality',
    name: 'Justified text',
    description: 'Justified text without hyphenation creates uneven word spacing ("rivers of white"). Use text-align: left for body text, or enable hyphens: auto if you must justify.'
  }, {
    id: 'tiny-text',
    category: 'quality',
    name: 'Tiny body text',
    description: 'Body text below 12px is hard to read, especially on high-DPI screens. Use at least 14px for body content, 16px is ideal.'
  }, {
    id: 'all-caps-body',
    category: 'quality',
    name: 'All-caps body text',
    description: 'Long passages in uppercase are hard to read. We recognize words by shape (ascenders and descenders), which all-caps removes. Reserve uppercase for short labels and headings.',
    skillSection: 'Typography',
    skillGuideline: 'long body passages in uppercase'
  }, {
    id: 'wide-tracking',
    category: 'quality',
    name: 'Wide letter spacing on body text',
    description: 'Letter spacing above 0.05em on body text disrupts natural character groupings and slows reading. Reserve wide tracking for short uppercase labels only.'
  }, {
    id: 'text-overflow',
    category: 'quality',
    name: 'Content overflowing its container',
    description: 'Content renders wider than its container, spilling out or forcing a horizontal scrollbar. Let text wrap, constrain widths, or give the region a deliberate scroll affordance.',
    skillSection: 'Layout & Space',
    skillGuideline: 'content wider than its container'
  }, {
    id: 'clipped-overflow-container',
    category: 'quality',
    name: 'Positioned child clipped by overflow container',
    description: 'A clipping container (overflow hidden or clip) wrapping an absolutely-positioned child cuts off tooltips, menus, and popovers that need to escape. Let the overflow be visible, or move the positioned layer out of the clip.',
    skillSection: 'Layout & Space',
    skillGuideline: 'overflow container clipping positioned children'
  }, {
    id: 'design-system-font',
    category: 'quality',
    name: 'Font outside DESIGN.md',
    description: 'A font is used that is not declared in DESIGN.md typography. Use the documented type system or update DESIGN.md if this is an intentional brand addition.',
    skillSection: 'Typography',
    skillGuideline: 'font family outside the project design system'
  }, {
    id: 'design-system-color',
    category: 'quality',
    severity: 'advisory',
    name: 'Color outside DESIGN.md',
    description: 'A literal color is outside the DESIGN.md palette and sidecar tonal ramps. This may be legitimate, but it should be an intentional design-system addition rather than drift.',
    skillSection: 'Color & Contrast',
    skillGuideline: 'literal color outside the project design system'
  }, {
    id: 'design-system-radius',
    category: 'quality',
    severity: 'advisory',
    name: 'Radius outside DESIGN.md',
    description: 'A border-radius value is outside the DESIGN.md rounded scale. Use a documented radius token or update the design system if the new shape is intentional.',
    skillSection: 'Visual Details',
    skillGuideline: 'border radius outside the project design system'
  },
  // ── Provider tells: opt-in via --gpt / --gemini (gated off by default) ──
  {
    id: 'gpt-thin-border-wide-shadow',
    category: 'slop',
    severity: 'advisory',
    gated: 'gpt',
    name: 'Hairline border with wide shadow',
    description: 'A hairline border paired with a wide, diffuse shadow is a recurring generated-UI signature. Commit to one — a defined edge or a soft elevation — rather than both at once.',
    skillSection: 'Visual Details',
    skillGuideline: 'hairline border plus wide diffuse shadow'
  }, {
    id: 'repeating-stripes-gradient',
    category: 'slop',
    severity: 'advisory',
    gated: 'gpt',
    name: 'Repeating-gradient stripes',
    description: 'Repeating-gradient stripes used as surface decoration are a recurring generated-UI signature. Reach for a deliberate texture or leave the surface plain.',
    skillSection: 'Visual Details',
    skillGuideline: 'repeating-gradient decorative stripes'
  }, {
    id: 'theater-slop-phrase',
    category: 'slop',
    severity: 'advisory',
    gated: 'gpt',
    name: 'Theater framing copy',
    description: 'Dismissing something as "theater" is a recurring generated-copy tic. Say plainly what the thing does or does not do.',
    skillSection: 'Copy',
    skillGuideline: 'theater framing copy'
  }, {
    id: 'image-hover-transform',
    category: 'slop',
    severity: 'advisory',
    gated: 'gemini',
    name: 'Image hover transform',
    description: 'Scaling or rotating an image on hover is a recurring generated-UI signature. Let imagery sit still, or use a subtler, purposeful interaction.',
    skillSection: 'Motion',
    skillGuideline: 'image scale or rotate on hover'
  }];

  // --- cli/engine/shared/color.mjs ---
  // ─── Section 2: Color Utilities ─────────────────────────────────────────────

  function isNeutralColor(color) {
    if (!color || color === 'transparent') return true;

    // rgb/rgba — use channel spread. Threshold 30 ≈ 11.7% of the 0–255 range.
    const rgb = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgb) {
      return Math.max(+rgb[1], +rgb[2], +rgb[3]) - Math.min(+rgb[1], +rgb[2], +rgb[3]) < 30;
    }

    // oklch()/lch() — chroma is the second numeric component.
    // oklch chroma is ~0–0.4 in sRGB gamut; >= 0.02 reads as tinted, not gray.
    // lch chroma is ~0–150; >= 3 reads as tinted. jsdom emits both formats
    // literally (it does NOT convert them to rgb).
    const oklch = color.match(/oklch\(\s*[\d.]+%?\s*([\d.-]+)/i);
    if (oklch) return parseFloat(oklch[1]) < 0.02;
    const lch = color.match(/lch\(\s*[\d.]+%?\s*([\d.-]+)/i);
    if (lch) return parseFloat(lch[1]) < 3;

    // oklab()/lab() — a and b are signed axes; chroma = sqrt(a² + b²).
    // oklab a/b are ~-0.4..0.4, threshold 0.02. lab a/b are ~-128..127, threshold 3.
    const oklab = color.match(/oklab\(\s*[\d.]+%?\s*([\d.-]+)\s+([\d.-]+)/i);
    if (oklab) {
      const a = parseFloat(oklab[1]),
        b = parseFloat(oklab[2]);
      return Math.hypot(a, b) < 0.02;
    }
    const lab = color.match(/lab\(\s*[\d.]+%?\s*([\d.-]+)\s+([\d.-]+)/i);
    if (lab) {
      const a = parseFloat(lab[1]),
        b = parseFloat(lab[2]);
      return Math.hypot(a, b) < 3;
    }

    // hsl/hsla — saturation is the second numeric component (percent).
    // Modern jsdom usually converts hsl() to rgb, but handle it directly for
    // safety across versions and for any engine that preserves the format.
    const hsl = color.match(/hsla?\(\s*[\d.-]+\s*,?\s*([\d.]+)%/i);
    if (hsl) return parseFloat(hsl[1]) < 10;

    // hwb(hue whiteness% blackness%) — a pixel is fully gray when
    // whiteness + blackness >= 100; chroma-like saturation = 1 - (w+b)/100.
    const hwb = color.match(/hwb\(\s*[\d.-]+\s+([\d.]+)%\s+([\d.]+)%/i);
    if (hwb) {
      const w = parseFloat(hwb[1]),
        b = parseFloat(hwb[2]);
      return 1 - Math.min(100, w + b) / 100 < 0.1;
    }

    // Unknown / unrecognized format — err on the side of DETECTING rather
    // than silently skipping. This is the opposite of the previous default,
    // which was the root cause of the oklch bug.
    return false;
  }
  function parseRgb(color) {
    if (!color || color === 'transparent') return null;
    const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!m) return null;
    return {
      r: +m[1],
      g: +m[2],
      b: +m[3],
      a: m[4] !== undefined ? +m[4] : 1
    };
  }
  function relativeLuminance({
    r,
    g,
    b
  }) {
    const [rs, gs, bs] = [r / 255, g / 255, b / 255].map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }
  function contrastRatio(c1, c2) {
    const l1 = relativeLuminance(c1);
    const l2 = relativeLuminance(c2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }
  function parseGradientColors(bgImage) {
    if (!bgImage || !bgImage.includes('gradient')) return [];
    const colors = [];
    for (const m of bgImage.matchAll(/rgba?\([^)]+\)/g)) {
      const c = parseRgb(m[0]);
      if (c) colors.push(c);
    }
    for (const m of bgImage.matchAll(/#([0-9a-f]{6}|[0-9a-f]{3})\b/gi)) {
      const h = m[1];
      if (h.length === 6) {
        colors.push({
          r: parseInt(h.slice(0, 2), 16),
          g: parseInt(h.slice(2, 4), 16),
          b: parseInt(h.slice(4, 6), 16),
          a: 1
        });
      } else {
        colors.push({
          r: parseInt(h[0] + h[0], 16),
          g: parseInt(h[1] + h[1], 16),
          b: parseInt(h[2] + h[2], 16),
          a: 1
        });
      }
    }
    return colors;
  }
  function hasChroma(c, threshold = 30) {
    if (!c) return false;
    return Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b) >= threshold;
  }
  function getHue(c) {
    if (!c) return 0;
    const r = c.r / 255,
      g = c.g / 255,
      b = c.b / 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    if (max === min) return 0;
    const d = max - min;
    let h;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;else if (max === g) h = ((b - r) / d + 2) / 6;else h = ((r - g) / d + 4) / 6;
    return Math.round(h * 360);
  }
  function colorToHex(c) {
    if (!c) return '?';
    return '#' + [c.r, c.g, c.b].map(v => v.toString(16).padStart(2, '0')).join('');
  }

  // --- cli/engine/rules/checks.mjs ---
  const DETECTOR_IS_BROWSER = typeof window !== 'undefined';

  // ─── Section 3: Pure Detection ──────────────────────────────────────────────

  function checkBorders(tag, widths, colors, radius) {
    if (BORDER_SAFE_TAGS.has(tag)) return [];
    const findings = [];
    const sides = ['Top', 'Right', 'Bottom', 'Left'];
    for (const side of sides) {
      const w = widths[side];
      if (w < 1 || isNeutralColor(colors[side])) continue;
      const otherSides = sides.filter(s => s !== side);
      const maxOther = Math.max(...otherSides.map(s => widths[s]));
      if (!(w >= 2 && (maxOther <= 1 || w >= maxOther * 2))) continue;
      const sn = side.toLowerCase();
      const isSide = side === 'Left' || side === 'Right';
      if (isSide) {
        if (radius > 0) findings.push({
          id: 'side-tab',
          snippet: `border-${sn}: ${w}px + border-radius: ${radius}px`
        });else if (w >= 3) findings.push({
          id: 'side-tab',
          snippet: `border-${sn}: ${w}px`
        });
      } else {
        if (radius > 0 && w >= 2) findings.push({
          id: 'border-accent-on-rounded',
          snippet: `border-${sn}: ${w}px + border-radius: ${radius}px`
        });
      }
    }
    return findings;
  }

  // Returns true if the given text is composed entirely of emoji characters
  // (plus whitespace / variation selectors). Emojis render as multicolor glyphs
  // regardless of CSS `color`, so contrast checks against the element's text
  // color are meaningless for these nodes.
  const EMOJI_CHAR_RE = /[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{FE0F}\u{200D}\u{1F3FB}-\u{1F3FF}]/u;
  const EMOJI_CHARS_GLOBAL = /[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{FE0F}\u{200D}\u{1F3FB}-\u{1F3FF}]/gu;
  function isEmojiOnlyText(text) {
    if (!text) return false;
    if (!EMOJI_CHAR_RE.test(text)) return false;
    return text.replace(EMOJI_CHARS_GLOBAL, '').trim() === '';
  }
  function checkColors(opts) {
    const {
      tag,
      textColor,
      bgColor,
      effectiveBg,
      effectiveBgStops,
      fontSize,
      fontWeight,
      hasDirectText,
      isEmojiOnly,
      bgClip,
      bgImage,
      classList
    } = opts;
    if (SAFE_TAGS.has(tag)) {
      // Exception for <a> and <button> elements styled as buttons. SAFE_TAGS
      // exists to suppress contrast noise on inline links and unstyled controls,
      // where the element has no own background and the contrast against the
      // ancestor surface is already the intended visual. When the element has
      // its own opaque background and direct text, it is a styled button — and
      // contrast on its own surface is a real, frequent bug worth flagging.
      const isStyledButton = (tag === 'a' || tag === 'button') && hasDirectText && bgColor && bgColor.a > 0.5;
      if (!isStyledButton) return [];
    }
    const findings = [];
    if (hasDirectText && textColor && !isEmojiOnly) {
      // Run background-dependent checks against either a solid bg or, if the
      // ancestor is a gradient, against every gradient stop (use the worst case).
      const bgs = effectiveBg ? [effectiveBg] : effectiveBgStops && effectiveBgStops.length ? effectiveBgStops : null;
      if (bgs) {
        // Gray on colored background — flag if every stop is chromatic
        const textLum = relativeLuminance(textColor);
        const isGray = !hasChroma(textColor, 20) && textLum > 0.05 && textLum < 0.85;
        if (isGray && bgs.every(b => hasChroma(b, 40))) {
          const bgLabel = effectiveBg ? colorToHex(effectiveBg) : `gradient(${bgs.map(colorToHex).join(', ')})`;
          findings.push({
            id: 'gray-on-color',
            snippet: `text ${colorToHex(textColor)} on bg ${bgLabel}`
          });
        }

        // Low contrast (WCAG AA) — worst case across all bg stops
        const ratios = bgs.map(b => contrastRatio(textColor, b));
        let worstIdx = 0;
        for (let i = 1; i < ratios.length; i++) if (ratios[i] < ratios[worstIdx]) worstIdx = i;
        const ratio = ratios[worstIdx];
        const isLargeText = fontSize >= WCAG_LARGE_TEXT_PX || fontSize >= WCAG_LARGE_BOLD_TEXT_PX && fontWeight >= 700;
        const threshold = isLargeText ? 3.0 : 4.5;
        if (ratio < threshold) {
          // Skip the false-positive class where text has alpha < 1 AND we
          // couldn't find an opaque ancestor (effectiveBg is null, we're
          // comparing against gradient-stop fallback). In jsdom mode the
          // detector can't resolve `var(--X)` color tokens, so a dark
          // section sitting between the text and the body's decorative
          // gradient is invisible to us — we end up measuring contrast
          // against the body's paper-grain noise instead of the real
          // local bg. Real low-contrast bugs use alpha=1 and have a
          // resolvable opaque ancestor; semi-transparent Tailwind tokens
          // like `text-paper/60` on `bg-ink` sections are the FP pattern.
          const isAlphaFallbackFP = !DETECTOR_IS_BROWSER && !effectiveBg && textColor.a != null && textColor.a < 1;
          if (!isAlphaFallbackFP) {
            findings.push({
              id: 'low-contrast',
              snippet: `${ratio.toFixed(1)}:1 (need ${threshold}:1) — text ${colorToHex(textColor)} on ${colorToHex(bgs[worstIdx])}`
            });
          }
        }
      }

      // AI palette: purple/violet on headings
      if (hasChroma(textColor, 50)) {
        const hue = getHue(textColor);
        if (hue >= 260 && hue <= 310 && (['h1', 'h2', 'h3'].includes(tag) || fontSize >= 20)) {
          findings.push({
            id: 'ai-color-palette',
            snippet: `Purple/violet text (${colorToHex(textColor)}) on heading`
          });
        }
      }
    }

    // Gradient text
    if (bgClip === 'text' && bgImage && bgImage.includes('gradient')) {
      findings.push({
        id: 'gradient-text',
        snippet: 'background-clip: text + gradient'
      });
    }

    // Tailwind class checks
    if (classList) {
      const classStr = typeof classList === 'string' ? classList : Array.from(classList).join(' ');
      const grayMatch = classStr.match(/\btext-(?:gray|slate|zinc|neutral|stone)-\d+\b/);
      const colorBgMatch = classStr.match(/\bbg-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+\b/);
      if (grayMatch && colorBgMatch) {
        findings.push({
          id: 'gray-on-color',
          snippet: `${grayMatch[0]} on ${colorBgMatch[0]}`
        });
      }
      if (/\bbg-clip-text\b/.test(classStr) && /\bbg-gradient-to-/.test(classStr)) {
        findings.push({
          id: 'gradient-text',
          snippet: 'bg-clip-text + bg-gradient (Tailwind)'
        });
      }
      const purpleText = classStr.match(/\btext-(?:purple|violet|indigo)-\d+\b/);
      if (purpleText && (['h1', 'h2', 'h3'].includes(tag) || /\btext-(?:[2-9]xl)\b/.test(classStr))) {
        findings.push({
          id: 'ai-color-palette',
          snippet: `${purpleText[0]} on heading`
        });
      }
      if (/\bfrom-(?:purple|violet|indigo)-\d+\b/.test(classStr) && /\bto-(?:purple|violet|indigo|blue|cyan|pink|fuchsia)-\d+\b/.test(classStr)) {
        findings.push({
          id: 'ai-color-palette',
          snippet: 'Purple/violet gradient (Tailwind)'
        });
      }
    }
    return findings;
  }
  function isCardLikeFromProps(hasShadow, hasBorder, hasRadius, hasBg) {
    if (!hasShadow && !hasBorder) return false;
    return hasRadius || hasBg;
  }
  const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

  // Pure check: given a heading and metrics about its previousElementSibling,
  // decide if the sibling is the canonical "icon-tile-stacked-above-heading" shape.
  //
  // Triggers when ALL of the following hold for the sibling:
  //   • size 32–128px on both axes (not too small, not a hero image)
  //   • aspect ratio 0.7–1.4 (squarish — excludes wide thumbnails / pill badges)
  //   • has a non-transparent background-color, background-image, OR a visible border
  //     (covers solid colors, white-with-border, gradients — anything that visually
  //      defines a tile)
  //   • border-radius < width/2 (excludes round avatars; rounded squares pass)
  //   • contains an <svg> or icon-class <i> element that's smaller than the tile
  //   • the tile sits above the heading (its bottom is above the heading's top)
  function checkIconTile(opts) {
    const {
      headingTag,
      headingText,
      headingTop,
      siblingTag,
      siblingWidth,
      siblingHeight,
      siblingBottom,
      siblingBgColor,
      siblingBgImage,
      siblingBorderWidth,
      siblingBorderRadius,
      hasIconChild,
      iconChildWidth
    } = opts;
    if (!HEADING_TAGS.has(headingTag)) return [];
    if (!siblingTag) return [];
    // Don't recurse into nested headings (e.g. h2 above h3 in a section header)
    if (HEADING_TAGS.has(siblingTag)) return [];

    // Size window: 32–128px on each axis
    if (!(siblingWidth >= 32 && siblingWidth <= 128)) return [];
    if (!(siblingHeight >= 32 && siblingHeight <= 128)) return [];

    // Squarish aspect ratio
    const ratio = siblingWidth / siblingHeight;
    if (ratio < 0.7 || ratio > 1.4) return [];

    // Must have something that visually defines the tile
    const bgVisible = siblingBgColor && siblingBgColor.a > 0.1 || siblingBgImage && siblingBgImage !== 'none' && siblingBgImage !== '';
    const borderVisible = siblingBorderWidth > 0;
    if (!bgVisible && !borderVisible) return [];

    // Exclude circles (avatars). Rounded squares pass.
    if (siblingBorderRadius >= siblingWidth / 2) return [];

    // Must contain an icon element smaller than the tile
    if (!hasIconChild) return [];
    if (iconChildWidth && iconChildWidth >= siblingWidth * 0.95) return [];

    // Vertical stacking: tile must end above where the heading starts.
    // (Allow the check to skip when both top/bottom are 0 — jsdom layout case.)
    if (headingTop && siblingBottom && siblingBottom > headingTop + 4) return [];
    const text = (headingText || '').trim().slice(0, 60);
    return [{
      id: 'icon-tile-stack',
      snippet: `${Math.round(siblingWidth)}x${Math.round(siblingHeight)}px icon tile above ${headingTag} "${text}"`
    }];
  }

  // Resolve the primary (non-generic) face from a font-family string and return
  // whether the resolved primary is serif. Two paths:
  //   1. Primary face is in KNOWN_SERIF_FONTS → serif.
  //   2. Primary face is unknown but the stack ends in the generic `serif`
  //      token → treat as serif. Authors who declare `font-family: 'X', serif`
  //      almost always have a serif primary; a sans declared with a serif
  //      fallback is a code smell, not the common case.
  // Returns { primary, isSerif } so the snippet can name the face.
  function resolveSerif(fontFamily) {
    if (!fontFamily) return {
      primary: null,
      isSerif: false
    };
    const tokens = fontFamily.split(',').map(f => f.trim().replace(/^['"]|['"]$/g, '').toLowerCase());
    const primary = tokens.find(f => f && !GENERIC_FONTS.has(f)) || null;
    if (!primary) return {
      primary: null,
      isSerif: false
    };
    if (KNOWN_SERIF_FONTS.has(primary)) return {
      primary,
      isSerif: true
    };
    if (tokens.includes('serif')) return {
      primary,
      isSerif: true
    };
    return {
      primary,
      isSerif: false
    };
  }
  function checkItalicSerif(opts) {
    const {
      tag,
      fontStyle,
      fontFamily,
      fontSize,
      headingText
    } = opts;
    if (fontStyle !== 'italic') return [];
    // Anchor the rule on hero-scale text. h1 is the canonical hero element;
    // h2 ≥ 48px catches the cases where the design demotes the visual hero
    // to an h2 but keeps the size.
    if (tag !== 'h1' && !(tag === 'h2' && fontSize >= 48)) return [];
    if (fontSize < 48) return [];
    const {
      primary,
      isSerif
    } = resolveSerif(fontFamily);
    if (!isSerif) return [];
    const text = (headingText || '').trim().slice(0, 60);
    return [{
      id: 'italic-serif-display',
      snippet: `italic serif ${tag} (${primary || 'serif'}) at ${Math.round(fontSize)}px "${text}"`
    }];
  }

  // Color saturation check. Returns true when the color has visible
  // chroma — i.e., it's an "accent color" rather than near-neutral.
  // Handles rgb()/rgba(), #hex, oklch(), and hsl(). var() refs are
  // expected to be pre-resolved by the caller.
  function isAccentColor(cssColor) {
    if (!cssColor) return false;
    const s = String(cssColor).trim();
    // rgb / rgba — direct channel-distance check.
    const rgbM = /rgba?\(\s*(\d+)\s*,?\s+|\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(s.replace(/rgba?\(\s*/, 'rgb(').replace(/,/g, ', '));
    const rgbStrict = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(s);
    if (rgbStrict) {
      const r = +rgbStrict[1],
        g = +rgbStrict[2],
        b = +rgbStrict[3];
      return Math.max(r, g, b) - Math.min(r, g, b) >= 40;
    }
    // #hex — 3, 4, 6, or 8 digit.
    const hexM = /^#([0-9a-f]{3,8})\b/i.exec(s);
    if (hexM) {
      let h = hexM[1];
      if (h.length === 3 || h.length === 4) h = h.split('').map(c => c + c).join('').slice(0, 6);else h = h.slice(0, 6);
      if (h.length === 6) {
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        return Math.max(r, g, b) - Math.min(r, g, b) >= 40;
      }
    }
    // oklch(L C H) — chroma C is what matters. Typical neutral grays
    // have C < 0.02; visible accents are 0.05+. CSS minification can
    // collapse spaces between L% and C ("oklch(43%.15 34)"), so we
    // extract all numbers and take the second rather than matching a
    // strict L-then-whitespace-then-C pattern.
    if (/^oklch\(/i.test(s)) {
      const nums = s.match(/\d*\.\d+|\d+/g);
      if (nums && nums.length >= 2) {
        const c = parseFloat(nums[1]);
        return !Number.isNaN(c) && c >= 0.05;
      }
    }
    // hsl(H, S%, L%) — saturation > 20% reads as accent.
    const hslM = /hsla?\(\s*[\d.]+\s*,\s*([\d.]+)%/i.exec(s);
    if (hslM) {
      const sat = parseFloat(hslM[1]);
      return !Number.isNaN(sat) && sat >= 20;
    }
    return false;
  }

  // Sibling-relationship rule. Anchor on a hero-scale h1, look at the
  // previousElementSibling, and gate on EITHER the classic tracked-
  // uppercase eyebrow OR the modern accent-colored bold eyebrow.
  function checkHeroEyebrow(opts) {
    const {
      headingTag,
      headingText,
      headingFontSize,
      siblingTag,
      siblingText,
      siblingTextTransform,
      siblingFontSize,
      siblingLetterSpacing,
      siblingFontWeight,
      siblingColor
    } = opts;
    if (headingTag !== 'h1') return [];
    // We previously gated on headingFontSize >= 48 to anchor "hero scale".
    // But modern hero h1s use clamp() / vw / var(--text-*), none of which
    // jsdom can resolve — the computed value comes back as "2em" or
    // "var(--text-9xl)" and parseFloat returns 2 or NaN. The gate fails
    // on virtually every Tailwind v4 / framework build. The other gates
    // (sibling text 2-60 chars, font-size ≤ 14px, accent-bold OR
    // tracked-caps) are tight enough to avoid false positives on non-
    // hero h1s — a tiny tan label directly above any h1 is the
    // antipattern regardless of how big the h1 ends up.
    if (!siblingTag) return [];
    // An h2 above an h1 is a different anti-pattern (heading hierarchy / dual
    // headings) — never an eyebrow.
    if (HEADING_TAGS.has(siblingTag)) return [];
    const text = (siblingText || '').trim();
    if (text.length < 2 || text.length > 60) return [];
    if (!(siblingFontSize > 0 && siblingFontSize <= 14)) return [];

    // Branch A: classic tracked-uppercase eyebrow.
    const isUppercased = siblingTextTransform === 'uppercase' || /[A-Z]/.test(text) && !/[a-z]/.test(text);
    const isClassicTracked = isUppercased && siblingLetterSpacing >= 1.6;

    // Branch B: modern accent-bold eyebrow — sentence case, low
    // tracking, but bold + accent-colored. The style choices changed;
    // the pattern is the same kicker-above-headline anti-pattern.
    const weight = Number(siblingFontWeight) || 400;
    const isAccentBold = weight >= 700 && isAccentColor(siblingColor || '');
    if (!isClassicTracked && !isAccentBold) return [];
    const headingTextSnippet = (headingText || '').trim().slice(0, 60);
    const eyebrowSnippet = text.slice(0, 40);
    const style = isClassicTracked ? 'tracked-caps' : 'accent-bold';
    return [{
      id: 'hero-eyebrow-chip',
      snippet: `eyebrow chip (${style}) "${eyebrowSnippet}" above ${headingTag} "${headingTextSnippet}"`
    }];
  }
  function checkRepeatedSectionKickers(opts) {
    const {
      candidates,
      minCount = 3
    } = opts;
    if (!Array.isArray(candidates) || candidates.length < minCount) return [];
    return candidates.map(candidate => ({
      id: 'repeated-section-kickers',
      snippet: `repeated section kicker "${candidate.kickerText}" before ${candidate.headingTag} "${candidate.headingText}" (${candidates.length} on page)`
    }));
  }
  const LAYOUT_TRANSITION_PROPS = new Set(['width', 'height', 'padding', 'margin', 'max-height', 'max-width', 'min-height', 'min-width', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left']);
  function checkMotion(opts) {
    const {
      tag,
      transitionProperty,
      animationName,
      timingFunctions,
      classList
    } = opts;
    if (SAFE_TAGS.has(tag)) return [];
    const findings = [];

    // --- Bounce/elastic easing ---
    if (animationName && animationName !== 'none' && /bounce|elastic|wobble|jiggle|spring/i.test(animationName)) {
      findings.push({
        id: 'bounce-easing',
        snippet: `animation: ${animationName}`
      });
    }
    if (classList && /\banimate-bounce\b/.test(classList)) {
      findings.push({
        id: 'bounce-easing',
        snippet: 'animate-bounce (Tailwind)'
      });
    }

    // Check timing functions for overshoot cubic-bezier (y values outside [0, 1])
    if (timingFunctions) {
      const bezierRe = /cubic-bezier\(\s*([\d.-]+)\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*\)/g;
      let m;
      while ((m = bezierRe.exec(timingFunctions)) !== null) {
        const y1 = parseFloat(m[2]),
          y2 = parseFloat(m[4]);
        if (y1 < -0.1 || y1 > 1.1 || y2 < -0.1 || y2 > 1.1) {
          findings.push({
            id: 'bounce-easing',
            snippet: `cubic-bezier(${m[1]}, ${m[2]}, ${m[3]}, ${m[4]})`
          });
          break;
        }
      }
    }

    // --- Layout property transition ---
    if (transitionProperty && transitionProperty !== 'all' && transitionProperty !== 'none') {
      const props = transitionProperty.split(',').map(p => p.trim().toLowerCase());
      const layoutFound = props.filter(p => LAYOUT_TRANSITION_PROPS.has(p));
      if (layoutFound.length > 0) {
        findings.push({
          id: 'layout-transition',
          snippet: `transition: ${layoutFound.join(', ')}`
        });
      }
    }
    return findings;
  }
  function checkGlow(opts) {
    const {
      boxShadow,
      effectiveBg
    } = opts;
    if (!boxShadow || boxShadow === 'none') return [];
    if (!effectiveBg) return [];

    // Only flag on dark backgrounds (luminance < 0.1)
    const bgLum = relativeLuminance(effectiveBg);
    if (bgLum >= 0.1) return [];

    // Split multiple shadows (commas not inside parentheses)
    const parts = boxShadow.split(/,(?![^(]*\))/);
    for (const shadow of parts) {
      const colorMatch = shadow.match(/rgba?\([^)]+\)/);
      if (!colorMatch) continue;
      const color = parseRgb(colorMatch[0]);
      if (!color || !hasChroma(color, 30)) continue;

      // Extract px values — in computed style: "color Xpx Ypx BLURpx [SPREADpx]"
      const afterColor = shadow.substring(shadow.indexOf(colorMatch[0]) + colorMatch[0].length);
      const beforeColor = shadow.substring(0, shadow.indexOf(colorMatch[0]));
      const pxVals = [...beforeColor.matchAll(/([\d.]+)px/g), ...afterColor.matchAll(/([\d.]+)px/g)].map(m => parseFloat(m[1]));

      // Third value is blur (offset-x, offset-y, blur, [spread])
      if (pxVals.length >= 3 && pxVals[2] > 4) {
        return [{
          id: 'dark-glow',
          snippet: `Colored glow (${colorToHex(color)}) on dark background`
        }];
      }
    }
    return [];
  }

  /**
   * Regex-on-HTML checks shared between browser and Node page-level detection.
   * These don't need DOM access, just the raw HTML string.
   */
  function checkHtmlPatterns(html) {
    const findings = [];

    // --- Color ---

    // AI color palette: purple/violet
    const purpleHexRe = /#(?:7c3aed|8b5cf6|a855f7|9333ea|7e22ce|6d28d9|6366f1|764ba2|667eea)\b/gi;
    if (purpleHexRe.test(html)) {
      const purpleTextRe = /(?:(?:^|;)\s*color\s*:\s*(?:.*?)(?:#(?:7c3aed|8b5cf6|a855f7|9333ea|7e22ce|6d28d9))|gradient.*?#(?:7c3aed|8b5cf6|a855f7|764ba2|667eea))/gi;
      if (purpleTextRe.test(html)) {
        findings.push({
          id: 'ai-color-palette',
          snippet: 'Purple/violet accent colors detected'
        });
      }
    }

    // Gradient text (background-clip: text + gradient)
    const gradientRe = /(?:-webkit-)?background-clip\s*:\s*text/gi;
    let gm;
    while ((gm = gradientRe.exec(html)) !== null) {
      const start = Math.max(0, gm.index - 200);
      const context = html.substring(start, gm.index + gm[0].length + 200);
      if (/gradient/i.test(context)) {
        findings.push({
          id: 'gradient-text',
          snippet: 'background-clip: text + gradient'
        });
        break;
      }
    }
    if (/\bbg-clip-text\b/.test(html) && /\bbg-gradient-to-/.test(html)) {
      findings.push({
        id: 'gradient-text',
        snippet: 'bg-clip-text + bg-gradient (Tailwind)'
      });
    }

    // --- Layout ---

    // Monotonous spacing
    const spacingValues = [];
    const spacingRe = /(?:padding|margin)(?:-(?:top|right|bottom|left))?\s*:\s*(\d+)px/gi;
    let sm;
    while ((sm = spacingRe.exec(html)) !== null) {
      const v = parseInt(sm[1], 10);
      if (v > 0 && v < 200) spacingValues.push(v);
    }
    const gapRe = /gap\s*:\s*(\d+)px/gi;
    while ((sm = gapRe.exec(html)) !== null) {
      spacingValues.push(parseInt(sm[1], 10));
    }
    const twSpaceRe = /\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap)-(\d+)\b/g;
    while ((sm = twSpaceRe.exec(html)) !== null) {
      spacingValues.push(parseInt(sm[1], 10) * 4);
    }
    const remSpacingRe = /(?:padding|margin)(?:-(?:top|right|bottom|left))?\s*:\s*([\d.]+)rem/gi;
    while ((sm = remSpacingRe.exec(html)) !== null) {
      const v = Math.round(parseFloat(sm[1]) * 16);
      if (v > 0 && v < 200) spacingValues.push(v);
    }
    const roundedSpacing = spacingValues.map(v => Math.round(v / 4) * 4);
    if (roundedSpacing.length >= 10) {
      const counts = {};
      for (const v of roundedSpacing) counts[v] = (counts[v] || 0) + 1;
      const maxCount = Math.max(...Object.values(counts));
      const dominantPct = maxCount / roundedSpacing.length;
      const unique = [...new Set(roundedSpacing)].filter(v => v > 0);
      if (dominantPct > 0.6 && unique.length <= 3) {
        const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
        findings.push({
          id: 'monotonous-spacing',
          snippet: `~${dominant}px used ${maxCount}/${roundedSpacing.length} times (${Math.round(dominantPct * 100)}%)`
        });
      }
    }

    // --- Motion ---

    // Bounce/elastic animation names
    const bounceRe = /animation(?:-name)?\s*:\s*([^;{}]*(?:bounce|elastic|wobble|jiggle|spring)[^;{}]*)/gi;
    const bounceMatch = bounceRe.exec(html);
    if (bounceMatch) {
      const animationToken = bounceMatch[1].split(/[,\s]+/).find(part => /bounce|elastic|wobble|jiggle|spring/i.test(part));
      findings.push({
        id: 'bounce-easing',
        snippet: `animation: ${animationToken || bounceMatch[1].trim()}`
      });
    }

    // Overshoot cubic-bezier
    const bezierRe = /cubic-bezier\(\s*([\d.-]+)\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*\)/g;
    let bm;
    while ((bm = bezierRe.exec(html)) !== null) {
      const y1 = parseFloat(bm[2]),
        y2 = parseFloat(bm[4]);
      if (y1 < -0.1 || y1 > 1.1 || y2 < -0.1 || y2 > 1.1) {
        findings.push({
          id: 'bounce-easing',
          snippet: `cubic-bezier(${bm[1]}, ${bm[2]}, ${bm[3]}, ${bm[4]})`
        });
        break;
      }
    }

    // Layout property transitions
    const transRe = /transition(?:-property)?\s*:\s*([^;{}]+)/gi;
    let tm;
    while ((tm = transRe.exec(html)) !== null) {
      const val = tm[1].toLowerCase();
      if (/\ball\b/.test(val)) continue;
      const found = val.match(/\b(?:(?:max|min)-)?(?:width|height)\b|\bpadding(?:-(?:top|right|bottom|left))?\b|\bmargin(?:-(?:top|right|bottom|left))?\b/gi);
      if (found) {
        findings.push({
          id: 'layout-transition',
          snippet: `transition: ${found.join(', ')}`
        });
        break;
      }
    }

    // --- Dark glow ---

    const darkBgRe = /background(?:-color)?\s*:\s*(?:#(?:0[0-9a-f]|1[0-9a-f]|2[0-3])[0-9a-f]{4}\b|#(?:0|1)[0-9a-f]{2}\b|rgb\(\s*(\d{1,2})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*\))/gi;
    const twDarkBg = /\bbg-(?:gray|slate|zinc|neutral|stone)-(?:9\d{2}|800)\b/;
    if (darkBgRe.test(html) || twDarkBg.test(html)) {
      const shadowRe = /box-shadow\s*:\s*([^;{}]+)/gi;
      let shm;
      while ((shm = shadowRe.exec(html)) !== null) {
        const val = shm[1];
        const colorMatch = val.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        if (!colorMatch) continue;
        const [r, g, b] = [+colorMatch[1], +colorMatch[2], +colorMatch[3]];
        if (Math.max(r, g, b) - Math.min(r, g, b) < 30) continue;
        const pxVals = [...val.matchAll(/(\d+)px|(?<![.\d])\b(0)\b(?![.\d])/g)].map(p => +(p[1] || p[2]));
        if (pxVals.length >= 3 && pxVals[2] > 4) {
          findings.push({
            id: 'dark-glow',
            snippet: `Colored glow (rgb(${r},${g},${b})) on dark page`
          });
          break;
        }
      }
    }

    // --- Provider tells (gated): repeating-gradient stripes (GPT) ---
    if (/repeating-(?:linear|radial|conic)-gradient\s*\(/i.test(html)) {
      findings.push({
        id: 'repeating-stripes-gradient',
        snippet: 'repeating-gradient decorative stripes'
      });
    }

    // --- Provider tells (gated): "X theater" framing copy (GPT) ---
    // Lives here (regex-on-HTML) rather than in the text-content analyzers so it
    // runs in the bundled browser path too, not just the CLI/static path.
    {
      const bodyText = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');
      const tm = /\b(\w+)\s+theater\b/i.exec(bodyText);
      if (tm) findings.push({
        id: 'theater-slop-phrase',
        snippet: `"${tm[0].trim()}"`
      });
    }

    // --- Provider tells (gated): image hover transform (Gemini) ---
    // A CSS `img...:hover { transform: ... }` rule, or a Tailwind hover:scale /
    // hover:rotate / hover:translate utility on an <img>. Each distinct
    // mechanism is its own finding.
    const imgHoverCss = /\bimg\b[^,{}]*:hover\b[^{}]*\{[^}]*\btransform\s*:\s*(?:scale|rotate|translate|matrix|skew)/i;
    if (imgHoverCss.test(html)) {
      findings.push({
        id: 'image-hover-transform',
        snippet: 'img:hover { transform } rule'
      });
    }
    const imgTagRe = /<img\b[^>]*\bclass\s*=\s*"([^"]*)"/gi;
    let im;
    while ((im = imgTagRe.exec(html)) !== null) {
      if (/\bhover:(?:scale|rotate|translate|skew)-/.test(im[1])) {
        findings.push({
          id: 'image-hover-transform',
          snippet: 'Tailwind hover transform on <img>'
        });
      }
    }
    return findings;
  }

  // ─── Section 4: resolveBackground (unified) ─────────────────────────────────

  // Read the element's own background color, computed-style first, with a
  // jsdom-friendly fallback that parses the inline `background:` shorthand
  // from the raw style attribute. jsdom (~v29) does not decompose the
  // shorthand into `backgroundColor`, so without this fallback the CLI silently
  // returns null for any element styled via `background: rgb(...)` or
  // `background: #abc`. Real browsers always decompose, so the fallback is
  // a no-op there.
  function readOwnBackgroundColor(el, computedStyle) {
    const bg = parseRgb(computedStyle.backgroundColor);
    if (DETECTOR_IS_BROWSER || bg && bg.a >= 0.1) return bg;
    const rawStyle = el.getAttribute?.('style') || '';
    const bgMatch = rawStyle.match(/background(?:-color)?\s*:\s*([^;]+)/i);
    const inlineBg = bgMatch ? bgMatch[1].trim() : '';
    if (!inlineBg) return bg;
    if (/gradient/i.test(inlineBg) || /url\s*\(/i.test(inlineBg)) return bg;
    const fromRgb = parseRgb(inlineBg);
    if (fromRgb) return fromRgb;
    const hexMatch = inlineBg.match(/#([0-9a-f]{6}|[0-9a-f]{3})\b/i);
    if (hexMatch) {
      const h = hexMatch[1];
      if (h.length === 6) {
        return {
          r: parseInt(h.slice(0, 2), 16),
          g: parseInt(h.slice(2, 4), 16),
          b: parseInt(h.slice(4, 6), 16),
          a: 1
        };
      }
      return {
        r: parseInt(h[0] + h[0], 16),
        g: parseInt(h[1] + h[1], 16),
        b: parseInt(h[2] + h[2], 16),
        a: 1
      };
    }
    return bg;
  }
  function resolveBackground(el, win, customPropMap) {
    let current = el;
    while (current && current.nodeType === 1) {
      const style = DETECTOR_IS_BROWSER ? getComputedStyle(current) : win.getComputedStyle(current);
      const bgImage = style.backgroundImage || '';
      const hasGradientOrUrl = bgImage && bgImage !== 'none' && (/gradient/i.test(bgImage) || /url\s*\(/i.test(bgImage));

      // Try the solid bg-color FIRST. If the element has both a solid color
      // and a gradient/url overlay (a common pattern: `background: var(--paper)
      // radial-gradient(...)` for paper-grain texture), the solid color is the
      // dominant visible surface for contrast purposes; the overlay is
      // decorative. The old behavior bailed on any gradient ancestor, which
      // caused massive false-positive contrast findings on grain-textured
      // body backgrounds.
      let bg = parseRgb(style.backgroundColor);
      if (!DETECTOR_IS_BROWSER && (!bg || bg.a < 0.1)) {
        // jsdom returns literal "var(--X)" / "oklch(...)" strings. Resolve
        // through customPropMap so Tailwind v4 color tokens become RGB.
        if (customPropMap) {
          bg = parseColorResolved(style.backgroundColor, customPropMap);
        }
        if (!bg || bg.a < 0.1) {
          // Inline-style fallback. jsdom doesn't decompose background
          // shorthand, so colors set via inline style are otherwise invisible.
          const rawStyle = current.getAttribute?.('style') || '';
          const bgMatch = rawStyle.match(/background(?:-color)?\s*:\s*([^;]+)/i);
          const inlineBg = bgMatch ? bgMatch[1].trim() : '';
          if (inlineBg && !/gradient/i.test(inlineBg) && !/url\s*\(/i.test(inlineBg)) {
            bg = parseColorResolved(inlineBg, customPropMap) || parseAnyColor(inlineBg);
          }
        }
      }
      if (bg && bg.a > 0.1) {
        if (DETECTOR_IS_BROWSER || bg.a >= 0.5) return bg;
      }
      // No solid bg-color at this level. If THIS level has a gradient/url
      // with no underlying solid color we can read:
      //   • on body/html: assume white. Body-level gradients are almost
      //     always decorative texture (paper grain, noise) on top of a
      //     solid bg-color the page set via `background: var(--paper)`
      //     shorthand — which jsdom can't decompose into bg-color. The
      //     downstream gradient-stops fallback path produces catastrophic
      //     false positives in this case (gradient noise stops have
      //     accidental browns/blacks that look like card backgrounds).
      //   • on other elements: bail to null and let the caller fall back
      //     to gradient stops (gradient buttons / hero sections are real
      //     bgs worth checking against).
      if (hasGradientOrUrl) {
        if (current.tagName === 'BODY' || current.tagName === 'HTML') {
          return {
            r: 255,
            g: 255,
            b: 255,
            a: 1
          };
        }
        return null;
      }
      current = current.parentElement;
    }
    return {
      r: 255,
      g: 255,
      b: 255
    };
  }

  // Walk parents looking for a gradient background and return its color stops.
  // Used as a fallback when resolveBackground() returns null because the
  // effective background is a gradient (no single solid color to compare against).
  function resolveGradientStops(el, win) {
    let current = el;
    while (current && current.nodeType === 1) {
      const style = DETECTOR_IS_BROWSER ? getComputedStyle(current) : win.getComputedStyle(current);
      const bgImage = style.backgroundImage || '';
      if (bgImage && bgImage !== 'none' && /gradient/i.test(bgImage)) {
        const stops = parseGradientColors(bgImage);
        if (stops.length > 0) return stops;
      }
      if (!DETECTOR_IS_BROWSER) {
        // jsdom doesn't decompose `background:` shorthand — peek at the raw inline style
        const rawStyle = current.getAttribute?.('style') || '';
        const bgMatch = rawStyle.match(/background(?:-image)?\s*:\s*([^;]+)/i);
        if (bgMatch && /gradient/i.test(bgMatch[1])) {
          const stops = parseGradientColors(bgMatch[1]);
          if (stops.length > 0) return stops;
        }
      }
      current = current.parentElement;
    }
    return null;
  }

  // Parse a single CSS length token to pixels. Accepts "12px", "50%", a
  // shorthand like "12px 4px" (uses the first value), or empty / null.
  // Returns the pixel value, or null when the input is unparseable.
  // Percentages convert against `widthPx` when one is supplied. Without a
  // usable width (jsdom returns "auto" for many real-world elements,
  // which parseFloat collapses to 0), fall back to the raw percentage
  // number so callers gating on `> 0` (border-accent-on-rounded,
  // isCardLike's hasRadius) still see a positive value, matching the
  // original parseFloat("50%") === 50 behavior.
  function parseRadiusToPx(value, widthPx) {
    if (!value || typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const first = trimmed.split(/\s+/)[0];
    const num = parseFloat(first);
    if (Number.isNaN(num)) return null;
    if (/%$/.test(first)) {
      if (widthPx && widthPx > 0) return num / 100 * widthPx;
      return num;
    }
    return num;
  }
  function resolveBorderRadiusPx(el, style, widthPx, win) {
    const fromComputed = parseRadiusToPx(style.borderRadius, widthPx);
    if (fromComputed !== null) return fromComputed;
    return 0;
  }

  // ─── Section 5: Element Adapters ────────────────────────────────────────────

  // Browser adapters — call getComputedStyle/getBoundingClientRect on live DOM

  function checkElementBordersDOM(el) {
    const tag = el.tagName.toLowerCase();
    if (BORDER_SAFE_TAGS.has(tag)) return [];
    const rect = el.getBoundingClientRect();
    if (rect.width < 20 || rect.height < 20) return [];
    const style = getComputedStyle(el);
    const sides = ['Top', 'Right', 'Bottom', 'Left'];
    const widths = {},
      colors = {};
    for (const s of sides) {
      widths[s] = parseFloat(style[`border${s}Width`]) || 0;
      colors[s] = style[`border${s}Color`] || '';
    }
    return checkBorders(tag, widths, colors, parseFloat(style.borderRadius) || 0);
  }
  function checkElementColorsDOM(el) {
    const tag = el.tagName.toLowerCase();
    // No early SAFE_TAGS bail here — checkColors() does its own gating that
    // includes the styled-button exception for <a> / <button> with their own
    // opaque background. Bailing here would prevent that exception from firing.
    const rect = el.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return [];
    const style = getComputedStyle(el);
    const directText = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('');
    const hasDirectText = directText.trim().length > 0;
    const effectiveBg = resolveBackground(el);
    return checkColors({
      tag,
      textColor: parseRgb(style.color),
      bgColor: readOwnBackgroundColor(el, style),
      effectiveBg,
      effectiveBgStops: effectiveBg ? null : resolveGradientStops(el),
      fontSize: parseFloat(style.fontSize) || 16,
      fontWeight: parseInt(style.fontWeight) || 400,
      hasDirectText,
      isEmojiOnly: isEmojiOnlyText(directText),
      bgClip: style.webkitBackgroundClip || style.backgroundClip || '',
      bgImage: style.backgroundImage || '',
      classList: el.getAttribute('class') || ''
    });
  }
  function checkElementIconTileDOM(el) {
    const tag = el.tagName.toLowerCase();
    if (!HEADING_TAGS.has(tag)) return [];
    const sibling = el.previousElementSibling;
    if (!sibling) return [];
    const sibRect = sibling.getBoundingClientRect();
    const headRect = el.getBoundingClientRect();
    const sibStyle = getComputedStyle(sibling);

    // The tile may either contain an <svg>/<i> icon child, OR the tile itself
    // may contain an emoji/symbol character directly as its only text content
    // (the "card-icon" pattern from many AI-generated demos).
    const iconChild = sibling.querySelector('svg, i[data-lucide], i[class*="fa-"], i[class*="icon"]');
    const iconRect = iconChild?.getBoundingClientRect();
    const sibDirectText = [...sibling.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('');
    const hasInlineEmojiIcon = sibling.children.length === 0 && isEmojiOnlyText(sibDirectText);
    return checkIconTile({
      headingTag: tag,
      headingText: el.textContent || '',
      headingTop: headRect.top,
      siblingTag: sibling.tagName.toLowerCase(),
      siblingWidth: sibRect.width,
      siblingHeight: sibRect.height,
      siblingBottom: sibRect.bottom,
      siblingBgColor: parseRgb(sibStyle.backgroundColor),
      siblingBgImage: sibStyle.backgroundImage || '',
      siblingBorderWidth: parseFloat(sibStyle.borderTopWidth) || 0,
      siblingBorderRadius: parseFloat(sibStyle.borderRadius) || 0,
      hasIconChild: !!iconChild || hasInlineEmojiIcon,
      iconChildWidth: iconRect?.width || 0
    });
  }
  function checkElementItalicSerifDOM(el) {
    const tag = el.tagName.toLowerCase();
    if (tag !== 'h1' && tag !== 'h2') return [];
    const style = getComputedStyle(el);
    return checkItalicSerif({
      tag,
      fontStyle: style.fontStyle || '',
      fontFamily: style.fontFamily || '',
      fontSize: parseFloat(style.fontSize) || 0,
      headingText: el.textContent || ''
    });
  }
  function checkElementHeroEyebrowDOM(el) {
    const tag = el.tagName.toLowerCase();
    if (tag !== 'h1') return [];
    const sibling = el.previousElementSibling;
    if (!sibling) return [];
    const headStyle = getComputedStyle(el);
    const sibStyle = getComputedStyle(sibling);
    return checkHeroEyebrow({
      headingTag: tag,
      headingText: el.textContent || '',
      headingFontSize: parseFloat(headStyle.fontSize) || 0,
      siblingTag: sibling.tagName.toLowerCase(),
      siblingText: sibling.textContent || '',
      siblingTextTransform: sibStyle.textTransform || '',
      siblingFontSize: parseFloat(sibStyle.fontSize) || 0,
      siblingLetterSpacing: parseFloat(sibStyle.letterSpacing) || 0,
      siblingFontWeight: sibStyle.fontWeight || '',
      siblingColor: sibStyle.color || ''
    });
  }

  // Build a map of CSS custom properties declared on :root / :host / html.
  // Used to resolve var(--X) refs that jsdom returns verbatim in
  // getComputedStyle. Tailwind v4 routes every utility class through
  // CSS vars (font-weight: var(--font-weight-bold), font-size:
  // var(--text-xs), letter-spacing: var(--tracking-widest)), so without
  // resolution every style-based check silently fails on Tailwind v4
  // builds — the values come back as literal "var(--font-weight-bold)"
  // strings and parseFloat returns NaN.
  function buildCustomPropMap(document) {
    const map = new Map();
    let sheets;
    try {
      sheets = Array.from(document.styleSheets || []);
    } catch {
      return map;
    }
    for (const sheet of sheets) {
      let rules;
      try {
        rules = Array.from(sheet.cssRules || []);
      } catch {
        continue;
      }
      for (const rule of rules) {
        // Style rules only (type 1). Walk @media / @supports if present.
        if (rule.type === 4 /* MEDIA_RULE */ || rule.type === 12 /* SUPPORTS_RULE */) {
          try {
            rules.push(...Array.from(rule.cssRules || []));
          } catch {/* ignore */}
          continue;
        }
        if (rule.type !== 1 /* STYLE_RULE */) continue;
        const sel = rule.selectorText || '';
        if (!/(^|,\s*)(:root|html|:host)\b/i.test(sel)) continue;
        const style = rule.style;
        if (!style) continue;
        for (let i = 0; i < style.length; i++) {
          const prop = style[i];
          if (!prop || !prop.startsWith('--')) continue;
          const val = style.getPropertyValue(prop).trim();
          if (val) map.set(prop, val);
        }
      }
    }
    return map;
  }

  // Resolve var(--X[, fallback]) refs in a computed-style value string.
  // Recurses up to 8 levels for chained refs (--a: var(--b)). Returns
  // the original string when no refs are present or the chain doesn't
  // resolve. Safe to call on already-resolved values.
  function resolveVarRefs(raw, customPropMap, depth = 0) {
    if (typeof raw !== 'string' || !raw.includes('var(')) return raw;
    if (depth > 8) return raw;
    return raw.replace(/var\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,\s*([^)]+))?\)/g, (_m, name, fallback) => {
      const v = customPropMap.get(name);
      if (v != null) return resolveVarRefs(v, customPropMap, depth + 1);
      return fallback ? resolveVarRefs(fallback.trim(), customPropMap, depth + 1) : _m;
    });
  }

  // OKLCH → sRGB conversion (Björn Ottosson's matrices). L in 0..1 (or %),
  // C in 0..~0.4 typical, H in degrees. Returns clamped {r,g,b,a:1} in 0..255.
  // Needed because jsdom doesn't compute oklch() values — getComputedStyle
  // returns the literal "oklch(...)" string. Without this, the entire
  // Tailwind v4 color palette (which is OKLCH-based) is invisible to the
  // detector's contrast / color checks.
  function oklchToRgb(L, C, H) {
    const hRad = H * Math.PI / 180;
    const a = C * Math.cos(hRad);
    const b = C * Math.sin(hRad);
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
    const lc = l_ * l_ * l_,
      mc = m_ * m_ * m_,
      sc = s_ * s_ * s_;
    const rLin = 4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc;
    const gLin = -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc;
    const bLin = -0.0041960863 * lc - 0.7034186147 * mc + 1.7076147010 * sc;
    const enc = x => {
      const c = Math.max(0, Math.min(1, x));
      return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    };
    return {
      r: Math.round(enc(rLin) * 255),
      g: Math.round(enc(gLin) * 255),
      b: Math.round(enc(bLin) * 255),
      a: 1
    };
  }

  // Extended color parser: rgb/rgba/hex/oklch. Returns null on no match.
  // Use this when the input might be any CSS color form; use plain parseRgb
  // when you only expect computed rgb() values from real browsers.
  function parseAnyColor(s) {
    if (!s || typeof s !== 'string') return null;
    const str = s.trim();
    if (str === 'transparent' || str === 'currentcolor' || str === 'inherit') return null;
    let m;
    m = str.match(/rgba?\(\s*(\d+(?:\.\d+)?)\s*,?\s*(\d+(?:\.\d+)?)\s*,?\s*(\d+(?:\.\d+)?)(?:\s*[,/]\s*([\d.]+))?\s*\)/);
    if (m) return {
      r: Math.round(+m[1]),
      g: Math.round(+m[2]),
      b: Math.round(+m[3]),
      a: m[4] !== undefined ? +m[4] : 1
    };
    m = str.match(/^#([0-9a-f]{3,8})$/i);
    if (m) {
      const h = m[1];
      if (h.length === 3 || h.length === 4) {
        return {
          r: parseInt(h[0] + h[0], 16),
          g: parseInt(h[1] + h[1], 16),
          b: parseInt(h[2] + h[2], 16),
          a: h.length === 4 ? parseInt(h[3] + h[3], 16) / 255 : 1
        };
      }
      if (h.length === 6 || h.length === 8) {
        return {
          r: parseInt(h.slice(0, 2), 16),
          g: parseInt(h.slice(2, 4), 16),
          b: parseInt(h.slice(4, 6), 16),
          a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1
        };
      }
    }
    // OKLCH parser. Tailwind v4's CSS minifier squishes the space after
    // `%` ("21.5%.02 50"), so the separator between L and C may be absent.
    // Match L (with optional %), then C and H separated permissively.
    m = str.match(/oklch\(\s*([\d.]+)(%?)\s*[\s,]*\s*([\d.]+)\s*[\s,]+\s*([-\d.]+)(?:deg)?(?:\s*\/\s*([\d.]+)(%)?)?\s*\)/i);
    if (m) {
      const Lnum = parseFloat(m[1]);
      const L = m[2] === '%' ? Lnum / 100 : Lnum;
      const rgb = oklchToRgb(L, parseFloat(m[3]), parseFloat(m[4]));
      if (m[5] !== undefined) {
        const alpha = parseFloat(m[5]);
        rgb.a = m[6] === '%' ? alpha / 100 : alpha;
      }
      return rgb;
    }
    return null;
  }

  // Resolve var() refs in a color string (via customPropMap), then parse.
  // Returns null on any failure. Used in jsdom-mode paths where
  // getComputedStyle returns literal "var(--X)" or "oklch(...)" strings.
  function parseColorResolved(str, customPropMap) {
    if (!str) return null;
    const resolved = customPropMap ? resolveVarRefs(str, customPropMap) : str;
    return parseAnyColor(resolved);
  }
  const REPEATED_KICKER_SKIP_SELECTOR = ['nav', 'form', 'table', 'thead', 'tbody', 'tfoot', 'figure', 'figcaption', 'ol', 'ul', 'li', '[role="navigation"]', '[aria-label*="breadcrumb" i]', '[class*="breadcrumb" i]', '[aria-hidden="true"]', '[data-impeccable-allow-kickers]'].join(',');
  const REPEATED_KICKER_CARD_CONTEXT_SELECTOR = ['article', 'button', 'a', 'li', '[role="listitem"]', '[role="option"]'].join(',');
  function cleanInlineText(el) {
    return [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').replace(/\s+/g, ' ').trim();
  }
  function isRepeatedKickerCardContext(heading, kicker) {
    const item = heading.closest?.(REPEATED_KICKER_CARD_CONTEXT_SELECTOR);
    return Boolean(item && (!item.contains || item.contains(kicker)));
  }
  function isRepeatedKickerCandidate(opts) {
    const {
      headingTag,
      headingText,
      headingFontSize,
      kickerTag,
      kickerText,
      kickerTextTransform,
      kickerFontSize,
      kickerLetterSpacing
    } = opts;
    if (!['h2', 'h3', 'h4'].includes(headingTag)) return false;
    if (!headingText || headingText.length < 3) return false;
    if (/^\/[\w-]+/i.test(headingText.replace(/^"|"$/g, '').trim())) return false;
    if (!(headingFontSize >= 20)) return false;
    if (!kickerTag || HEADING_TAGS.has(kickerTag)) return false;
    if (!['p', 'span', 'div', 'small'].includes(kickerTag)) return false;
    if (!kickerText || kickerText.length < 2 || kickerText.length > 34) return false;
    if (/^step\s*\d+/i.test(kickerText) || /^\d{1,2}$/.test(kickerText)) return false;
    const isUppercased = kickerTextTransform === 'uppercase' || /[A-Z]/.test(kickerText) && !/[a-z]/.test(kickerText);
    if (!isUppercased) return false;
    if (!(kickerFontSize > 0 && kickerFontSize <= 14)) return false;
    const minTrackedSpacing = Math.max(1, kickerFontSize * 0.08);
    if (!(kickerLetterSpacing >= minTrackedSpacing)) return false;
    return true;
  }
  function collectRepeatedSectionKickerCandidates(doc, getStyle, resolveLetterSpacing) {
    const candidates = [];
    for (const heading of doc.querySelectorAll('h2, h3, h4')) {
      if (heading.closest?.(REPEATED_KICKER_SKIP_SELECTOR)) continue;
      const kicker = heading.previousElementSibling;
      if (!kicker || kicker.closest?.(REPEATED_KICKER_SKIP_SELECTOR)) continue;
      if (isRepeatedKickerCardContext(heading, kicker)) continue;
      const headingStyle = getStyle(heading);
      const kickerStyle = getStyle(kicker);
      const headingText = (heading.textContent || '').replace(/\s+/g, ' ').trim();
      const kickerText = cleanInlineText(kicker) || (kicker.textContent || '').replace(/\s+/g, ' ').trim();
      const headingFontSize = resolveLetterSpacing(headingStyle.fontSize || '', 16) || parseFloat(headingStyle.fontSize) || 0;
      const kickerFontSize = resolveLetterSpacing(kickerStyle.fontSize || '', 16) || parseFloat(kickerStyle.fontSize) || 0;
      const kickerLetterSpacing = resolveLetterSpacing(kickerStyle.letterSpacing || '', kickerFontSize);
      if (!isRepeatedKickerCandidate({
        headingTag: heading.tagName.toLowerCase(),
        headingText,
        headingFontSize,
        kickerTag: kicker.tagName.toLowerCase(),
        kickerText,
        kickerTextTransform: kickerStyle.textTransform || '',
        kickerFontSize,
        kickerLetterSpacing
      })) {
        continue;
      }
      candidates.push({
        headingTag: heading.tagName.toLowerCase(),
        headingText: headingText.replace(/^"|"$/g, '').slice(0, 60),
        kickerText: kickerText.slice(0, 40)
      });
    }
    return candidates;
  }
  function checkRepeatedSectionKickersDOM() {
    const candidates = collectRepeatedSectionKickerCandidates(document, el => getComputedStyle(el), (value, fontSize) => resolveLengthPx(value, fontSize) || 0);
    return checkRepeatedSectionKickers({
      candidates
    });
  }
  function checkElementMotionDOM(el) {
    const tag = el.tagName.toLowerCase();
    if (SAFE_TAGS.has(tag)) return [];
    const style = getComputedStyle(el);
    return checkMotion({
      tag,
      transitionProperty: style.transitionProperty || '',
      animationName: style.animationName || '',
      timingFunctions: [style.animationTimingFunction, style.transitionTimingFunction].filter(Boolean).join(' '),
      classList: el.getAttribute('class') || ''
    });
  }
  function checkElementGlowDOM(el) {
    const tag = el.tagName.toLowerCase();
    const style = getComputedStyle(el);
    if (!style.boxShadow || style.boxShadow === 'none') return [];
    // Use parent's background — glow radiates outward, so the surrounding context matters
    // If resolveBackground returns null (gradient), try to infer from the gradient colors
    let parentBg = el.parentElement ? resolveBackground(el.parentElement) : resolveBackground(el);
    if (!parentBg) {
      // Gradient background — sample its colors to determine if it's dark
      let cur = el.parentElement;
      while (cur && cur.nodeType === 1) {
        const bgImage = getComputedStyle(cur).backgroundImage || '';
        const gradColors = parseGradientColors(bgImage);
        if (gradColors.length > 0) {
          // Average the gradient colors
          const avg = {
            r: 0,
            g: 0,
            b: 0
          };
          for (const c of gradColors) {
            avg.r += c.r;
            avg.g += c.g;
            avg.b += c.b;
          }
          avg.r = Math.round(avg.r / gradColors.length);
          avg.g = Math.round(avg.g / gradColors.length);
          avg.b = Math.round(avg.b / gradColors.length);
          parentBg = avg;
          break;
        }
        cur = cur.parentElement;
      }
    }
    return checkGlow({
      tag,
      boxShadow: style.boxShadow,
      effectiveBg: parentBg
    });
  }
  function checkElementAIPaletteDOM(el) {
    const style = getComputedStyle(el);
    const findings = [];

    // Check gradient backgrounds for purple/violet or cyan
    const bgImage = style.backgroundImage || '';
    const gradColors = parseGradientColors(bgImage);
    for (const c of gradColors) {
      if (hasChroma(c, 50)) {
        const hue = getHue(c);
        if (hue >= 260 && hue <= 310) {
          findings.push({
            id: 'ai-color-palette',
            snippet: 'Purple/violet gradient background'
          });
          break;
        }
        if (hue >= 160 && hue <= 200) {
          findings.push({
            id: 'ai-color-palette',
            snippet: 'Cyan gradient background'
          });
          break;
        }
      }
    }

    // Check for neon text (vivid cyan/purple color on dark background)
    const textColor = parseRgb(style.color);
    if (textColor && hasChroma(textColor, 80)) {
      const hue = getHue(textColor);
      const isAIPalette = hue >= 160 && hue <= 200 || hue >= 260 && hue <= 310;
      if (isAIPalette) {
        const parentBg = el.parentElement ? resolveBackground(el.parentElement) : null;
        // Also check gradient parents
        let effectiveBg = parentBg;
        if (!effectiveBg) {
          let cur = el.parentElement;
          while (cur && cur.nodeType === 1) {
            const gi = getComputedStyle(cur).backgroundImage || '';
            const gc = parseGradientColors(gi);
            if (gc.length > 0) {
              const avg = {
                r: 0,
                g: 0,
                b: 0
              };
              for (const c of gc) {
                avg.r += c.r;
                avg.g += c.g;
                avg.b += c.b;
              }
              avg.r = Math.round(avg.r / gc.length);
              avg.g = Math.round(avg.g / gc.length);
              avg.b = Math.round(avg.b / gc.length);
              effectiveBg = avg;
              break;
            }
            cur = cur.parentElement;
          }
        }
        if (effectiveBg && relativeLuminance(effectiveBg) < 0.1) {
          const label = hue >= 260 ? 'Purple/violet' : 'Cyan';
          findings.push({
            id: 'ai-color-palette',
            snippet: `${label} neon text on dark background`
          });
        }
      }
    }
    return findings;
  }
  const QUALITY_TEXT_TAGS = new Set(['p', 'li', 'td', 'th', 'dd', 'blockquote', 'figcaption']);

  // Resolve a CSS font-size value to pixels by walking up the parent chain.
  // Browsers resolve em/rem/% to px in getComputedStyle, but jsdom returns the
  // specified value verbatim — so for the Node path we walk parents ourselves.
  function resolveFontSizePx(el, win) {
    const chain = []; // raw font-size strings, leaf → root
    let cur = el;
    while (cur && cur.nodeType === 1) {
      const fs = (win ? win.getComputedStyle(cur) : getComputedStyle(cur)).fontSize;
      chain.push(fs || '');
      cur = cur.parentElement;
    }
    // Walk root → leaf, resolving each value relative to its parent context.
    let px = 16; // root default
    for (let i = chain.length - 1; i >= 0; i--) {
      const v = chain[i];
      if (!v || v === 'inherit') continue;
      const num = parseFloat(v);
      if (isNaN(num)) continue;
      if (v.endsWith('px')) px = num;else if (v.endsWith('rem')) px = num * 16;else if (v.endsWith('em')) px = num * px;else if (v.endsWith('%')) px = num / 100 * px;else px = num; // unitless — already resolved
    }
    return px;
  }

  // Resolve a CSS length value (line-height, letter-spacing, etc.) given a
  // known font-size context. Returns null for "normal" / unparseable values.
  function resolveLengthPx(value, fontSizePx) {
    if (!value || value === 'normal' || value === 'auto' || value === 'inherit') return null;
    const num = parseFloat(value);
    if (isNaN(num)) return null;
    if (value.endsWith('px')) return num;
    if (value.endsWith('rem')) return num * 16;
    if (value.endsWith('em')) return num * fontSizePx;
    if (value.endsWith('%')) return num / 100 * fontSizePx;
    // Unitless line-height = multiplier, return px equivalent
    return num * fontSizePx;
  }
  function cssColorIsTransparent(value) {
    if (!value) return true;
    const str = String(value).trim().toLowerCase();
    if (!str || str === 'transparent' || str === 'rgba(0, 0, 0, 0)') return true;
    const parsed = parseAnyColor(str);
    if (parsed) return (parsed.a ?? 1) <= 0.05;
    return /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0(?:\.0+)?\s*\)$/.test(str);
  }
  function colorsNearlyMatch(a, b) {
    const ca = parseAnyColor(a);
    const cb = parseAnyColor(b);
    if (!ca || !cb) return false;
    const alphaDelta = Math.abs((ca.a ?? 1) - (cb.a ?? 1));
    const channelDelta = Math.max(Math.abs(ca.r - cb.r), Math.abs(ca.g - cb.g), Math.abs(ca.b - cb.b));
    return alphaDelta <= 0.03 && channelDelta <= 3;
  }
  function getComputedStyleFor(win, el) {
    if (win && typeof win.getComputedStyle === 'function') {
      try {
        return win.getComputedStyle(el);
      } catch {}
    }
    if (typeof getComputedStyle === 'function') {
      try {
        return getComputedStyle(el);
      } catch {}
    }
    return null;
  }
  function hasVisibleBackgroundBoundary(style, el, win) {
    const bg = style?.backgroundColor || '';
    if (cssColorIsTransparent(bg)) return false;
    let parent = el?.parentElement || null;
    while (parent) {
      const parentStyle = getComputedStyleFor(win, parent);
      const parentBg = parentStyle?.backgroundColor || '';
      if (!cssColorIsTransparent(parentBg)) {
        return !colorsNearlyMatch(bg, parentBg);
      }
      parent = parent.parentElement;
    }
    return true;
  }
  const TEXT_EDGE_TAGS = new Set(['A', 'BUTTON', 'CODE', 'DD', 'DT', 'FIGCAPTION', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'P', 'PRE', 'SPAN', 'TD', 'TH']);
  function hasMeaningfulDirectText(node) {
    if (!node?.childNodes) return false;
    for (const child of node.childNodes) {
      if (child.nodeType === 3 && child.textContent.trim().length > 4) return true;
    }
    return false;
  }
  function textDescendantsFlushSides(el, rect) {
    const flush = {
      top: false,
      right: false,
      bottom: false,
      left: false
    };
    if (!rect || !el?.querySelectorAll) return flush;
    const TEXT_EDGE_THRESHOLD = 4;
    const candidates = el.querySelectorAll('a, button, code, dd, dt, figcaption, h1, h2, h3, h4, h5, h6, li, p, pre, span, td, th');
    for (const node of candidates) {
      if (!TEXT_EDGE_TAGS.has(node.tagName) || !hasMeaningfulDirectText(node)) continue;
      let nodeRect = null;
      try {
        nodeRect = node.getBoundingClientRect();
      } catch {}
      if (!nodeRect || nodeRect.width <= 0 || nodeRect.height <= 0) continue;
      if (nodeRect.bottom < rect.top || nodeRect.top > rect.bottom || nodeRect.right < rect.left || nodeRect.left > rect.right) continue;
      if (nodeRect.top - rect.top <= TEXT_EDGE_THRESHOLD) flush.top = true;
      if (rect.right - nodeRect.right <= TEXT_EDGE_THRESHOLD) flush.right = true;
      if (rect.bottom - nodeRect.bottom <= TEXT_EDGE_THRESHOLD) flush.bottom = true;
      if (nodeRect.left - rect.left <= TEXT_EDGE_THRESHOLD) flush.left = true;
    }
    return flush;
  }

  // Pure quality checks. Most run on computed CSS and DOM-only inputs (work in
  // jsdom and the browser). Two checks (line-length, cramped-padding) gate on
  // element rect dimensions, which jsdom can't compute — pass `rect: null` from
  // the Node adapter to skip those.
  //
  // Both adapters resolve font-size, line-height and letter-spacing to pixels
  // before calling this so the pure function only deals with numbers.
  function checkQuality(opts) {
    const {
      el,
      tag,
      style,
      hasDirectText,
      textLen,
      fontSize,
      lineHeightPx,
      letterSpacingPx,
      rect,
      lineMax = 80,
      viewportWidth = 0,
      win = null
    } = opts;
    const findings = [];
    // Skip browser extension injected elements
    const elId = el.id || '';
    if (elId.startsWith('claude-') || elId.startsWith('cic-')) return findings;

    // --- Line length too long --- (browser-only: needs rect.width)
    if (rect && hasDirectText && QUALITY_TEXT_TAGS.has(tag) && rect.width > 0 && textLen > lineMax) {
      const charsPerLine = rect.width / (fontSize * 0.5);
      if (charsPerLine > lineMax + 5) {
        findings.push({
          id: 'line-length',
          snippet: `~${Math.round(charsPerLine)} chars/line (aim for <${lineMax})`
        });
      }
    }

    // --- Cramped padding --- (browser-only: needs rect to skip small badges/labels)
    // Vertical and horizontal thresholds are independent because line-height
    // already provides built-in vertical breathing room (the line box is taller
    // than the cap height), but horizontal has no equivalent. Both scale with
    // font-size — bigger text demands proportionally more padding.
    //   vertical:   max(4px, fontSize × 0.3)
    //   horizontal: max(8px, fontSize × 0.5)
    const isInlineCode = tag === 'code' && !(el.closest && el.closest('pre'));
    if (!isInlineCode && rect && hasDirectText && textLen > 20 && rect.width > 100 && rect.height > 30) {
      const borders = {
        top: parseFloat(style.borderTopWidth) || 0,
        right: parseFloat(style.borderRightWidth) || 0,
        bottom: parseFloat(style.borderBottomWidth) || 0,
        left: parseFloat(style.borderLeftWidth) || 0
      };
      const borderCount = Object.values(borders).filter(w => w > 0).length;
      const hasBg = hasVisibleBackgroundBoundary(style, el, win);
      if (borderCount >= 2 || hasBg) {
        const vPads = [],
          hPads = [];
        if (hasBg || borders.top > 0) vPads.push(parseFloat(style.paddingTop) || 0);
        if (hasBg || borders.bottom > 0) vPads.push(parseFloat(style.paddingBottom) || 0);
        if (hasBg || borders.left > 0) hPads.push(parseFloat(style.paddingLeft) || 0);
        if (hasBg || borders.right > 0) hPads.push(parseFloat(style.paddingRight) || 0);
        const vMin = vPads.length ? Math.min(...vPads) : Infinity;
        const hMin = hPads.length ? Math.min(...hPads) : Infinity;
        const vThresh = Math.max(4, fontSize * 0.3);
        const hThresh = Math.max(8, fontSize * 0.5);

        // Emit at most one finding per element — pick whichever axis is worse.
        if (vMin < vThresh) {
          findings.push({
            id: 'cramped-padding',
            snippet: `${vMin}px vertical padding (need ≥${vThresh.toFixed(1)}px for ${fontSize}px text)`
          });
        } else if (hMin < hThresh) {
          findings.push({
            id: 'cramped-padding',
            snippet: `${hMin}px horizontal padding (need ≥${hThresh.toFixed(1)}px for ${fontSize}px text)`
          });
        }
      }
    }

    // --- Flush against a visible boundary ---
    // Fires when a container has a visible boundary (border, outline, OR a
    // non-transparent background) AND near-zero padding on the bounded
    // side(s) AND text-bearing children land flush against the boundary.
    //
    // Distinct from cramped-padding: that rule needs the element itself to
    // have direct text (hasDirectText). This rule targets the OPPOSITE
    // shape — a container with NO direct text, only children — which is
    // exactly what cramped-padding misses (a section wrapping a label +
    // list lands a free pass).
    //
    // The classic shape: agent writes `padding: 28px 0 0` shorthand on a
    // section that also has a border, zeroing horizontal padding so the
    // text-bearing children touch the side borders. Background and
    // outline count too: a colored card with zero padding has the same
    // visual failure mode.
    {
      const FLUSH_SKIP_TAGS = new Set(['HTML', 'BODY', 'MAIN', 'HEADER', 'FOOTER', 'NAV', 'ARTICLE', 'ASIDE', 'BUTTON', 'A', 'LABEL', 'SUMMARY', 'CODE', 'PRE', 'INPUT', 'TEXTAREA', 'SELECT', 'FORM', 'FIGURE', 'TABLE', 'TBODY', 'THEAD', 'TR', 'TD', 'TH']);
      const upperTag = tag ? tag.toUpperCase() : '';
      const elPosition = style.position || '';
      if (!FLUSH_SKIP_TAGS.has(upperTag) && !hasDirectText && !['fixed', 'absolute'].includes(elPosition) && el.children && el.children.length > 0) {
        const borderW = {
          top: parseFloat(style.borderTopWidth) || 0,
          right: parseFloat(style.borderRightWidth) || 0,
          bottom: parseFloat(style.borderBottomWidth) || 0,
          left: parseFloat(style.borderLeftWidth) || 0
        };
        const borderVisible = {
          top: borderW.top > 0 && !cssColorIsTransparent(style.borderTopColor),
          right: borderW.right > 0 && !cssColorIsTransparent(style.borderRightColor),
          bottom: borderW.bottom > 0 && !cssColorIsTransparent(style.borderBottomColor),
          left: borderW.left > 0 && !cssColorIsTransparent(style.borderLeftColor)
        };
        // Outline detection. jsdom decomposes `border` shorthand into
        // border{Top,…}Width/Color but does NOT decompose `outline` —
        // the longhands come back empty when the value was set via the
        // shorthand. Fall back to parsing `style.outline` ourselves.
        let outlineW = parseFloat(style.outlineWidth) || 0;
        let outlineStyleVal = style.outlineStyle || '';
        let outlineColorVal = style.outlineColor || '';
        if (!outlineW && style.outline) {
          const wMatch = style.outline.match(/(\d+(?:\.\d+)?)\s*px/);
          if (wMatch) outlineW = parseFloat(wMatch[1]) || 0;
          if (!outlineStyleVal) {
            outlineStyleVal = /\b(solid|dashed|dotted|double|groove|ridge|inset|outset)\b/.test(style.outline) ? 'solid' : '';
          }
          if (!outlineColorVal) {
            const cMatch = style.outline.match(/(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}|[a-zA-Z]+)\s*$/);
            if (cMatch) outlineColorVal = cMatch[1];
          }
        }
        const outlineVisible = outlineW > 0 && !cssColorIsTransparent(outlineColorVal) && outlineStyleVal && outlineStyleVal !== 'none';
        const bgVisible = hasVisibleBackgroundBoundary(style, el, win);
        const anyVisible = borderVisible.top || borderVisible.right || borderVisible.bottom || borderVisible.left || outlineVisible || bgVisible;
        if (anyVisible) {
          // Resolve padding to px (jsdom returns raw "1.5rem" etc., not the
          // computed px value; parseFloat would strip the unit and treat
          // 1.5rem as 1.5px, false-flagging legitimate insets).
          const pad = {
            top: resolveLengthPx(style.paddingTop, fontSize) ?? 0,
            right: resolveLengthPx(style.paddingRight, fontSize) ?? 0,
            bottom: resolveLengthPx(style.paddingBottom, fontSize) ?? 0,
            left: resolveLengthPx(style.paddingLeft, fontSize) ?? 0
          };
          const PAD_THRESHOLD = 2;
          // Children-insulate-this-side: a side is insulated if ANY direct
          // child has its own padding ≥ 4px on that side. Rationale: in
          // typical flow, only the first/last (or leftmost/rightmost)
          // children actually sit at the parent's edges. If even one of
          // them has its own padding, the visual flush is broken on that
          // side. Classic example: a column-flow card frame where the
          // top child (header) has padding-top:12 and the bottom child
          // (footer) has padding-bottom:8 — the parent's padding:0 doesn't
          // matter; nothing is actually flush. The `any-child-insulates`
          // heuristic accepts some false negatives (a card with one heavily
          // padded middle child won't flag) for far fewer false positives.
          const CHILD_INSULATE_THRESHOLD = 4;
          const childrenInsulate = {
            top: false,
            right: false,
            bottom: false,
            left: false
          };
          for (const child of el.children) {
            let childStyle = getComputedStyleFor(win, child);
            if (!childStyle) continue;
            const childPad = {
              top: resolveLengthPx(childStyle.paddingTop, fontSize) ?? 0,
              right: resolveLengthPx(childStyle.paddingRight, fontSize) ?? 0,
              bottom: resolveLengthPx(childStyle.paddingBottom, fontSize) ?? 0,
              left: resolveLengthPx(childStyle.paddingLeft, fontSize) ?? 0
            };
            const childMargin = {
              top: resolveLengthPx(childStyle.marginTop, fontSize) ?? 0,
              right: resolveLengthPx(childStyle.marginRight, fontSize) ?? 0,
              bottom: resolveLengthPx(childStyle.marginBottom, fontSize) ?? 0,
              left: resolveLengthPx(childStyle.marginLeft, fontSize) ?? 0
            };
            if (rect && typeof child.getBoundingClientRect === 'function') {
              try {
                const childRect = child.getBoundingClientRect();
                if (childRect && childRect.width > 0 && childRect.height > 0) {
                  if (childRect.top - rect.top >= CHILD_INSULATE_THRESHOLD) childrenInsulate.top = true;
                  if (rect.right - childRect.right >= CHILD_INSULATE_THRESHOLD) childrenInsulate.right = true;
                  if (rect.bottom - childRect.bottom >= CHILD_INSULATE_THRESHOLD) childrenInsulate.bottom = true;
                  if (childRect.left - rect.left >= CHILD_INSULATE_THRESHOLD) childrenInsulate.left = true;
                }
              } catch {}
            }
            for (const s of ['top', 'right', 'bottom', 'left']) {
              if (childPad[s] >= CHILD_INSULATE_THRESHOLD || childMargin[s] >= CHILD_INSULATE_THRESHOLD) {
                childrenInsulate[s] = true;
              }
            }
          }
          const textFlush = rect ? textDescendantsFlushSides(el, rect) : null;
          const fullBleedBgBand = rect && viewportWidth > 0 && rect.width >= viewportWidth * 0.94 && bgVisible && !outlineVisible;
          const flushSides = [];
          for (const side of ['top', 'right', 'bottom', 'left']) {
            const bgBoundsSide = bgVisible && !(fullBleedBgBand && (side === 'left' || side === 'right'));
            const sideBounded = borderVisible[side] || outlineVisible || bgBoundsSide;
            if (sideBounded && pad[side] <= PAD_THRESHOLD && !childrenInsulate[side] && (!textFlush || textFlush[side])) {
              flushSides.push(side);
            }
          }
          if (flushSides.length > 0) {
            // Confirm at least one direct child has substantial text content
            // (> 4 chars). Without this, the flush is harmless: e.g. an
            // image-only card.
            let hasTextChild = false;
            for (const child of el.children) {
              const childText = (child.textContent || '').trim();
              if (childText.length > 4) {
                hasTextChild = true;
                break;
              }
            }
            if (hasTextChild) {
              const cls = typeof el.className === 'string' && el.className.trim() ? el.className.trim().split(/\s+/)[0] : '';
              const boundaryParts = [];
              const borderSidesVisible = ['top', 'right', 'bottom', 'left'].filter(s => borderVisible[s]);
              if (borderSidesVisible.length === 4) boundaryParts.push('border');else if (borderSidesVisible.length > 0) boundaryParts.push(`border-${borderSidesVisible.join('/')}`);
              if (outlineVisible) boundaryParts.push('outline');
              if (bgVisible) boundaryParts.push('bg');
              const sidesLabel = flushSides.length === 4 ? 'all sides' : flushSides.join('/');
              const ident = cls ? `<${tag.toLowerCase()}> "${cls}"` : `<${tag.toLowerCase()}>`;
              findings.push({
                id: 'cramped-padding',
                snippet: `${ident}: children flush against ${boundaryParts.join('+')} on ${sidesLabel} (no inset)`
              });
            }
          }
        }
      }
    }

    // --- Body text touching viewport edge --- (browser-only: needs rect)
    // Catches the failure mode where the agent ships body paragraphs
    // with NO container providing horizontal padding — text bleeds
    // directly to the viewport edge. Different from cramped-padding,
    // which requires a colored/bordered container. Here the failure
    // is the absence of the container entirely.
    //
    // Gate aggressively to avoid false positives:
    //   - <p> or <li> only (body content; not headings, not nav, not
    //     wrappers)
    //   - text > 40 chars (paragraph-like, not a label)
    //   - rect.width > 50% of viewport (real body, not a pull-quote)
    //   - rect.left < 16 OR rect.right > viewport - 16 (actually
    //     touching the edge)
    //   - not inside <nav> or <header> (those legitimately bleed)
    //   - element itself has no background-color (intentional full-bleed
    //     sections set a bg-color and provide their own internal padding)
    if (rect && hasDirectText && textLen > 40 && ['P', 'LI'].includes(tag.toUpperCase()) && viewportWidth > 0) {
      const inNavHeader = el.closest && (el.closest('nav') || el.closest('header'));
      const hasOwnBg = style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent';
      const isPositioned = ['fixed', 'absolute'].includes(style.position || '');
      const widthRatio = rect.width / viewportWidth;
      const leftClose = rect.left < 16;
      const rightClose = rect.right > viewportWidth - 16;
      if (!inNavHeader && !hasOwnBg && !isPositioned && widthRatio > 0.5 && (leftClose || rightClose)) {
        const which = leftClose && rightClose ? `left ${Math.round(rect.left)}px / right ${Math.round(viewportWidth - rect.right)}px` : leftClose ? `left ${Math.round(rect.left)}px` : `right ${Math.round(viewportWidth - rect.right)}px`;
        findings.push({
          id: 'body-text-viewport-edge',
          snippet: `<${tag.toLowerCase()}> with ${textLen}-char body bleeds to viewport edge (${which})`
        });
      }
    }

    // --- Tight line height ---
    if (hasDirectText && textLen > 50 && !['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
      if (lineHeightPx != null && fontSize > 0) {
        const ratio = lineHeightPx / fontSize;
        if (ratio > 0 && ratio < 1.3) {
          findings.push({
            id: 'tight-leading',
            snippet: `line-height ${ratio.toFixed(2)}x (need >=1.3)`
          });
        }
      }
    }

    // --- Justified text (without hyphens) ---
    if (hasDirectText && style.textAlign === 'justify') {
      const hyphens = style.hyphens || style.webkitHyphens || '';
      if (hyphens !== 'auto') {
        findings.push({
          id: 'justified-text',
          snippet: 'text-align: justify without hyphens: auto'
        });
      }
    }

    // --- Tiny body text ---
    // Only flag actual body content, not UI labels (buttons, tabs, badges, captions, footer text, etc.)
    if (hasDirectText && textLen > 20 && fontSize < 12) {
      const skipTags = ['sub', 'sup', 'code', 'kbd', 'samp', 'var', 'caption', 'figcaption'];
      const inUIContext = el.closest && el.closest('button, a, label, summary, pre, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [role="option"], nav, footer, [aria-hidden="true"], [class*="badge" i], [class*="caption" i], [class*="chip" i], [class*="code" i], [class*="console" i], [class*="diff" i], [class*="label" i], [class*="meta" i], [class*="mock" i], [class*="pill" i], [class*="preview" i], [class*="tag" i], [class*="terminal" i], [class*="writes" i]');
      const isUppercase = style.textTransform === 'uppercase';
      if (!skipTags.includes(tag) && !inUIContext && !isUppercase) {
        findings.push({
          id: 'tiny-text',
          snippet: `${fontSize}px body text`
        });
      }
    }

    // --- All-caps body text ---
    if (hasDirectText && textLen > 30 && style.textTransform === 'uppercase') {
      if (!['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
        findings.push({
          id: 'all-caps-body',
          snippet: `text-transform: uppercase on ${textLen} chars of body text`
        });
      }
    }

    // --- Wide letter spacing on body text ---
    if (hasDirectText && textLen > 20 && style.textTransform !== 'uppercase') {
      if (letterSpacingPx != null && letterSpacingPx > 0 && fontSize > 0) {
        const trackingEm = letterSpacingPx / fontSize;
        if (trackingEm > 0.05) {
          findings.push({
            id: 'wide-tracking',
            snippet: `letter-spacing: ${trackingEm.toFixed(2)}em on body text`
          });
        }
      }
    }

    // --- Crushed letter spacing (mirror of wide-tracking) ---
    // Tracking pulled tighter than ~-0.05em crushes characters into each other.
    // Optical tightening that display type legitimately wants (around -0.02em)
    // stays well above this floor.
    if (hasDirectText && textLen > 20 && fontSize > 0) {
      if (letterSpacingPx != null && letterSpacingPx < 0) {
        const trackingEm = letterSpacingPx / fontSize;
        if (trackingEm <= -0.05) {
          const excerpt = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
          findings.push({
            id: 'extreme-negative-tracking',
            snippet: `letter-spacing: ${trackingEm.toFixed(2)}em — "${excerpt}"`
          });
        }
      }
    }
    return findings;
  }
  function checkElementQualityDOM(el) {
    const tag = el.tagName.toLowerCase();
    const style = getComputedStyle(el);
    const hasDirectText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 10);
    const textLen = el.textContent?.trim().length || 0;
    // Browser getComputedStyle resolves everything to px — direct parseFloat
    // works.
    const fontSize = parseFloat(style.fontSize) || 16;
    const lineHeightPx = resolveLengthPx(style.lineHeight, fontSize);
    const letterSpacingPx = resolveLengthPx(style.letterSpacing, fontSize);
    const rect = el.getBoundingClientRect();
    const lineMax = typeof window !== 'undefined' && window.__IMPECCABLE_CONFIG__?.lineLengthMax || 80;
    const viewportWidth = (typeof window !== 'undefined' ? window.innerWidth : 0) || 0;
    return checkQuality({
      el,
      tag,
      style,
      hasDirectText,
      textLen,
      fontSize,
      lineHeightPx,
      letterSpacingPx,
      rect,
      lineMax,
      viewportWidth,
      win: typeof window !== 'undefined' ? window : null
    });
  }

  // Pure page-level skipped-heading walk. Takes a Document so it works in both
  // the browser and jsdom.
  function checkPageQualityFromDoc(doc) {
    const findings = [];
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let prevLevel = 0;
    let prevText = '';
    for (const h of headings) {
      const level = parseInt(h.tagName[1]);
      const text = (h.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60);
      if (prevLevel > 0 && level > prevLevel + 1) {
        findings.push({
          id: 'skipped-heading',
          snippet: `<h${prevLevel}> "${prevText}" followed by <h${level}> "${text}" (missing h${prevLevel + 1})`
        });
      }
      prevLevel = level;
      prevText = text;
    }
    return findings;
  }

  // Browser adapter (returns the legacy { type, detail } shape used by the overlay loop)
  function checkPageQualityDOM() {
    return checkPageQualityFromDoc(document).map(f => ({
      type: f.id,
      detail: f.snippet
    }));
  }

  // Node adapters — take pre-extracted jsdom computed style

  // jsdom doesn't lay out OR resolve em/rem/% to px — so we pre-resolve every
  // CSS length the rule needs ourselves (walking the parent chain for
  // font-size inheritance), and pass `rect: null` to skip the two rules that
  // genuinely need element rects (line-length, cramped-padding).
  function checkElementQuality(el, style, tag, window) {
    const hasDirectText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 10);
    const textLen = el.textContent?.trim().length || 0;
    const fontSize = resolveFontSizePx(el, window);
    const lineHeightPx = resolveLengthPx(style.lineHeight, fontSize);
    const letterSpacingPx = resolveLengthPx(style.letterSpacing, fontSize);
    return checkQuality({
      el,
      tag,
      style,
      hasDirectText,
      textLen,
      fontSize,
      lineHeightPx,
      letterSpacingPx,
      rect: null,
      win: window
    });
  }
  function checkElementBorders(tag, style, overrides, resolvedRadius) {
    const sides = ['Top', 'Right', 'Bottom', 'Left'];
    const widths = {},
      colors = {};
    for (const s of sides) {
      widths[s] = parseFloat(style[`border${s}Width`]) || 0;
      colors[s] = style[`border${s}Color`] || '';
      // jsdom silently drops any border shorthand containing var(), leaving
      // both width and color empty on the computed style. When the detectHtml
      // pre-pass pulled a resolved value off the rule, use it to fill in the
      // missing side so the side-tab check can run. Real browsers resolve
      // var() natively, so this fallback is a no-op in the browser path.
      if (widths[s] === 0 && overrides && overrides[s]) {
        widths[s] = overrides[s].width;
        colors[s] = overrides[s].color;
      } else if (colors[s] && colors[s].startsWith('var(') && overrides && overrides[s]) {
        // Longhand case: jsdom kept the width but left the color as the
        // literal `var(...)` string. Substitute the resolved color.
        colors[s] = overrides[s].color;
      }
    }
    // resolvedRadius lets the caller pre-resolve the radius via
    // resolveBorderRadiusPx so the value survives jsdom 29.1.0's broken
    // shorthand serialization. Falls back to the computed value for tests
    // and browser callers that don't pre-resolve.
    const radius = resolvedRadius != null ? resolvedRadius : parseFloat(style.borderRadius) || 0;
    return checkBorders(tag, widths, colors, radius);
  }
  function checkElementColors(el, style, tag, window, customPropMap, hasAnchorInheritRule) {
    const directText = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('');
    const hasDirectText = directText.trim().length > 0;
    const effectiveBg = resolveBackground(el, window, customPropMap);
    // jsdom returns literal "var(--X)" / "oklch(...)" for color, so plain
    // parseRgb misses Tailwind-tokenized text colors. Resolve through the
    // customPropMap first; fall back to parseRgb for vanilla rgb() pages.
    let textColor = customPropMap ? parseColorResolved(style.color, customPropMap) : null;
    if (!textColor) textColor = parseRgb(style.color);

    // Anchor-inherit FP workaround: jsdom's UA stylesheet has `:link { color:
    // blue }` at high specificity. The page's `a { color: inherit }` rule
    // (Tailwind v4 preflight) loses to jsdom even though it WINS in real
    // browsers (Chrome's UA wraps :link in :where() — zero specificity).
    // When the page declares the inherit rule AND we see jsdom's default
    // link blue on an anchor, walk to the nearest non-anchor ancestor and
    // use its color instead.
    if (hasAnchorInheritRule && textColor && textColor.r === 0 && textColor.g === 0 && textColor.b === 238 && (tag === 'a' || el.closest?.('a'))) {
      let cur = el.parentElement;
      while (cur && cur.tagName !== 'HTML') {
        if (cur.tagName !== 'A') {
          const ps = window.getComputedStyle(cur);
          const inh = (customPropMap ? parseColorResolved(ps.color, customPropMap) : null) || parseRgb(ps.color);
          if (inh && !(inh.r === 0 && inh.g === 0 && inh.b === 238)) {
            textColor = inh;
            break;
          }
        }
        cur = cur.parentElement;
      }
    }
    return checkColors({
      tag,
      textColor,
      bgColor: readOwnBackgroundColor(el, style),
      effectiveBg,
      effectiveBgStops: effectiveBg ? null : resolveGradientStops(el, window),
      fontSize: parseFloat(style.fontSize) || 16,
      fontWeight: parseInt(style.fontWeight) || 400,
      hasDirectText,
      isEmojiOnly: isEmojiOnlyText(directText),
      bgClip: style.webkitBackgroundClip || style.backgroundClip || '',
      bgImage: style.backgroundImage || '',
      classList: el.getAttribute?.('class') || el.className || ''
    });
  }
  function checkElementIconTile(el, tag, window) {
    if (!HEADING_TAGS.has(tag)) return [];
    const sibling = el.previousElementSibling;
    if (!sibling) return [];
    const sibStyle = window.getComputedStyle(sibling);
    // jsdom doesn't lay out — read explicit pixel dimensions from CSS instead.
    const sibWidth = parseFloat(sibStyle.width) || 0;
    const sibHeight = parseFloat(sibStyle.height) || 0;
    const iconChild = sibling.querySelector('svg, i[data-lucide], i[class*="fa-"], i[class*="icon"]');
    let iconWidth = 0;
    if (iconChild) {
      const iconStyle = window.getComputedStyle(iconChild);
      iconWidth = parseFloat(iconStyle.width) || parseFloat(iconChild.getAttribute('width')) || 0;
    }
    // Or: tile contains an emoji/symbol character directly as its only content
    const sibDirectText = [...sibling.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('');
    const hasInlineEmojiIcon = sibling.children.length === 0 && isEmojiOnlyText(sibDirectText);
    return checkIconTile({
      headingTag: tag,
      headingText: el.textContent || '',
      headingTop: 0,
      // jsdom: no layout, skip vertical-stacking gate
      siblingTag: sibling.tagName.toLowerCase(),
      siblingWidth: sibWidth,
      siblingHeight: sibHeight,
      siblingBottom: 0,
      siblingBgColor: parseRgb(sibStyle.backgroundColor),
      siblingBgImage: sibStyle.backgroundImage || '',
      siblingBorderWidth: parseFloat(sibStyle.borderTopWidth) || 0,
      siblingBorderRadius: resolveBorderRadiusPx(sibling, sibStyle, sibWidth, window),
      hasIconChild: !!iconChild || hasInlineEmojiIcon,
      iconChildWidth: iconWidth
    });
  }
  function checkElementItalicSerif(el, style, tag) {
    if (tag !== 'h1' && tag !== 'h2') return [];
    return checkItalicSerif({
      tag,
      fontStyle: style.fontStyle || '',
      fontFamily: style.fontFamily || '',
      fontSize: parseFloat(style.fontSize) || 0,
      headingText: el.textContent || ''
    });
  }
  function checkElementHeroEyebrow(el, style, tag, window, customPropMap) {
    if (tag !== 'h1') return [];
    const sibling = el.previousElementSibling;
    if (!sibling) return [];
    const sibStyle = window.getComputedStyle(sibling);
    // Resolve Tailwind v4 CSS-variable wrappers (font-weight:var(--font-weight-bold)
    // etc.) before parsing. jsdom returns these verbatim from getComputedStyle;
    // without resolution every style-based gate fails silently on Tailwind v4 builds.
    const fontSizeRaw = customPropMap ? resolveVarRefs(sibStyle.fontSize, customPropMap) : sibStyle.fontSize;
    const fontWeightRaw = customPropMap ? resolveVarRefs(sibStyle.fontWeight, customPropMap) : sibStyle.fontWeight;
    const letterSpacingRaw = customPropMap ? resolveVarRefs(sibStyle.letterSpacing, customPropMap) : sibStyle.letterSpacing;
    const colorRaw = customPropMap ? resolveVarRefs(sibStyle.color, customPropMap) : sibStyle.color;
    const headingFontSizeRaw = customPropMap ? resolveVarRefs(style.fontSize, customPropMap) : style.fontSize;
    const siblingFontSize = parseFloat(fontSizeRaw) || 0;
    // resolveLengthPx returns null for 'normal' / 'auto'; coerce to 0 so the
    // gate falls through cleanly. jsdom returns letter-spacing verbatim
    // (e.g. '0.15em'), unlike real browsers, so this conversion is required.
    return checkHeroEyebrow({
      headingTag: tag,
      headingText: el.textContent || '',
      headingFontSize: parseFloat(headingFontSizeRaw) || 0,
      siblingTag: sibling.tagName.toLowerCase(),
      siblingText: sibling.textContent || '',
      siblingTextTransform: sibStyle.textTransform || '',
      siblingFontSize,
      siblingLetterSpacing: resolveLengthPx(letterSpacingRaw, siblingFontSize) || 0,
      siblingFontWeight: fontWeightRaw || '',
      siblingColor: colorRaw || ''
    });
  }
  function checkRepeatedSectionKickersFromDoc(doc, win) {
    const candidates = collectRepeatedSectionKickerCandidates(doc, el => win.getComputedStyle(el), (value, fontSize) => resolveLengthPx(value, fontSize) || 0);
    return checkRepeatedSectionKickers({
      candidates
    });
  }
  function checkElementMotion(tag, style) {
    return checkMotion({
      tag,
      transitionProperty: style.transitionProperty || '',
      animationName: style.animationName || '',
      timingFunctions: [style.animationTimingFunction, style.transitionTimingFunction].filter(Boolean).join(' '),
      classList: ''
    });
  }
  function checkElementGlow(tag, style, effectiveBg) {
    if (!style.boxShadow || style.boxShadow === 'none') return [];
    return checkGlow({
      tag,
      boxShadow: style.boxShadow,
      effectiveBg
    });
  }

  // ─── Section 6: Page-Level Checks ───────────────────────────────────────────

  // Browser page-level checks — use document/getComputedStyle globals

  function checkTypography() {
    const findings = [];

    // Walk actual text-bearing elements and tally font usage by *computed style*.
    // This is much more accurate than scanning CSS rules — it ignores rules that
    // exist in the stylesheet but apply to nothing (e.g. demo classes showing
    // anti-patterns), and counts what the user actually sees.
    const fontUsage = new Map(); // primary font name → count of elements
    let totalTextElements = 0;
    for (const el of document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, dd, blockquote, figcaption, a, button, label, span')) {
      // Skip impeccable's own elements
      if (el.closest && el.closest('.impeccable-overlay, .impeccable-label, .impeccable-banner, .impeccable-tooltip')) continue;
      // Only count elements that actually have visible direct text
      const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 0);
      if (!hasText) continue;
      const style = getComputedStyle(el);
      const ff = style.fontFamily;
      if (!ff) continue;
      const stack = ff.split(',').map(f => f.trim().replace(/^['"]|['"]$/g, '').toLowerCase());
      const primary = stack.find(f => f && !GENERIC_FONTS.has(f));
      if (!primary) continue;
      fontUsage.set(primary, (fontUsage.get(primary) || 0) + 1);
      totalTextElements++;
    }
    if (totalTextElements >= 20) {
      // A font is "primary" if it's used by at least 15% of text elements
      const PRIMARY_THRESHOLD = 0.15;
      for (const [font, count] of fontUsage) {
        const share = count / totalTextElements;
        if (share < PRIMARY_THRESHOLD) continue;
        if (!OVERUSED_FONTS.has(font)) continue;
        if (isBrandFontOnOwnDomain(font)) continue;
        findings.push({
          type: 'overused-font',
          detail: `Primary font: ${font} (${Math.round(share * 100)}% of text)`
        });
      }

      // Single-font check: only one distinct primary font across all text
      if (fontUsage.size === 1) {
        const only = [...fontUsage.keys()][0];
        findings.push({
          type: 'single-font',
          detail: `only font used is ${only}`
        });
      }
    }
    const sizes = new Set();
    for (const el of document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,li,td,th,label,button,div')) {
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs > 0 && fs < 200) sizes.add(Math.round(fs * 10) / 10);
    }
    if (sizes.size >= 3) {
      const sorted = [...sizes].sort((a, b) => a - b);
      const ratio = sorted[sorted.length - 1] / sorted[0];
      if (ratio < 2.0) {
        findings.push({
          type: 'flat-type-hierarchy',
          detail: `Sizes: ${sorted.map(s => s + 'px').join(', ')} (ratio ${ratio.toFixed(1)}:1)`
        });
      }
    }
    return findings;
  }
  function isCardLikeDOM(el) {
    const tag = el.tagName.toLowerCase();
    if (SAFE_TAGS.has(tag) || ['input', 'select', 'textarea', 'img', 'video', 'canvas', 'picture'].includes(tag)) return false;
    const style = getComputedStyle(el);
    const cls = el.getAttribute('class') || '';
    const hasShadow = style.boxShadow && style.boxShadow !== 'none' || /\bshadow(?:-sm|-md|-lg|-xl|-2xl)?\b/.test(cls);
    const hasBorder = /\bborder\b/.test(cls);
    const hasRadius = parseFloat(style.borderRadius) > 0 || /\brounded(?:-sm|-md|-lg|-xl|-2xl|-full)?\b/.test(cls);
    const hasBg = style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)' || /\bbg-(?:white|gray-\d+|slate-\d+)\b/.test(cls);
    return isCardLikeFromProps(hasShadow, hasBorder, hasRadius, hasBg);
  }
  function checkLayout() {
    const findings = [];
    const flaggedEls = new Set();
    for (const el of document.querySelectorAll('*')) {
      if (!isCardLikeDOM(el) || flaggedEls.has(el)) continue;
      const cls = el.getAttribute('class') || '';
      const style = getComputedStyle(el);
      if (style.position === 'absolute' || style.position === 'fixed') continue;
      if (/\b(?:dropdown|popover|tooltip|menu|modal|dialog)\b/i.test(cls)) continue;
      if ((el.textContent?.trim().length || 0) < 10) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 50 || rect.height < 30) continue;
      let parent = el.parentElement;
      while (parent) {
        if (isCardLikeDOM(parent)) {
          flaggedEls.add(el);
          break;
        }
        parent = parent.parentElement;
      }
    }
    for (const el of flaggedEls) {
      let isAncestor = false;
      for (const other of flaggedEls) {
        if (other !== el && el.contains(other)) {
          isAncestor = true;
          break;
        }
      }
      if (!isAncestor) findings.push({
        type: 'nested-cards',
        detail: 'Card inside card',
        el
      });
    }
    return findings;
  }

  // Node page-level checks — take document/window as parameters

  function checkPageTypography(doc, win) {
    const findings = [];
    const fonts = new Set();
    const overusedFound = new Set();
    for (const sheet of doc.styleSheets) {
      let rules;
      try {
        rules = sheet.cssRules || sheet.rules;
      } catch {
        continue;
      }
      if (!rules) continue;
      for (const rule of rules) {
        if (rule.type !== 1) continue;
        const ff = rule.style?.fontFamily;
        if (!ff) continue;
        const stack = ff.split(',').map(f => f.trim().replace(/^['"]|['"]$/g, '').toLowerCase());
        const primary = stack.find(f => f && !GENERIC_FONTS.has(f));
        if (primary) {
          fonts.add(primary);
          if (OVERUSED_FONTS.has(primary)) overusedFound.add(primary);
        }
      }
    }

    // Check Google Fonts links in HTML
    const html = doc.documentElement?.outerHTML || '';
    const gfRe = /fonts\.googleapis\.com\/css2?\?family=([^&"'\s]+)/gi;
    let m;
    while ((m = gfRe.exec(html)) !== null) {
      const families = m[1].split('|').map(f => f.split(':')[0].replace(/\+/g, ' ').toLowerCase());
      for (const f of families) {
        fonts.add(f);
        if (OVERUSED_FONTS.has(f)) overusedFound.add(f);
      }
    }

    // Also parse raw HTML/style content for font-family (jsdom may not expose all via CSSOM)
    const ffRe = /font-family\s*:\s*([^;}]+)/gi;
    let fm;
    while ((fm = ffRe.exec(html)) !== null) {
      for (const f of fm[1].split(',').map(f => f.trim().replace(/^['"]|['"]$/g, '').toLowerCase())) {
        if (f && !GENERIC_FONTS.has(f)) {
          fonts.add(f);
          if (OVERUSED_FONTS.has(f)) overusedFound.add(f);
        }
      }
    }
    for (const font of overusedFound) {
      findings.push({
        id: 'overused-font',
        snippet: `Primary font: ${font}`
      });
    }

    // Single font
    if (fonts.size === 1) {
      const els = doc.querySelectorAll('*');
      if (els.length >= 20) {
        findings.push({
          id: 'single-font',
          snippet: `only font used is ${[...fonts][0]}`
        });
      }
    }

    // Flat type hierarchy
    const sizes = new Set();
    const textEls = doc.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, li, td, th, label, button, div');
    for (const el of textEls) {
      const fontSize = parseFloat(win.getComputedStyle(el).fontSize);
      // Filter out sub-8px values (jsdom doesn't resolve relative units properly)
      if (fontSize >= 8 && fontSize < 200) sizes.add(Math.round(fontSize * 10) / 10);
    }
    if (sizes.size >= 3) {
      const sorted = [...sizes].sort((a, b) => a - b);
      const ratio = sorted[sorted.length - 1] / sorted[0];
      if (ratio < 2.0) {
        findings.push({
          id: 'flat-type-hierarchy',
          snippet: `Sizes: ${sorted.map(s => s + 'px').join(', ')} (ratio ${ratio.toFixed(1)}:1)`
        });
      }
    }
    return findings;
  }
  function isCardLike(el, win) {
    const tag = el.tagName.toLowerCase();
    if (SAFE_TAGS.has(tag) || ['input', 'select', 'textarea', 'img', 'video', 'canvas', 'picture'].includes(tag)) return false;
    const style = win.getComputedStyle(el);
    const rawStyle = el.getAttribute?.('style') || '';
    const cls = el.getAttribute?.('class') || '';
    const hasShadow = style.boxShadow && style.boxShadow !== 'none' || /\bshadow(?:-sm|-md|-lg|-xl|-2xl)?\b/.test(cls) || /box-shadow/i.test(rawStyle);
    const hasBorder = /\bborder\b/.test(cls);
    const widthPx = parseFloat(style.width) || 0;
    const hasRadius = resolveBorderRadiusPx(el, style, widthPx, win) > 0 || /\brounded(?:-sm|-md|-lg|-xl|-2xl|-full)?\b/.test(cls) || /border-radius/i.test(rawStyle);
    const hasBg = /\bbg-(?:white|gray-\d+|slate-\d+)\b/.test(cls) || /background(?:-color)?\s*:\s*(?!transparent)/i.test(rawStyle);
    return isCardLikeFromProps(hasShadow, hasBorder, hasRadius, hasBg);
  }
  function checkPageLayout(doc, win) {
    const findings = [];

    // Nested cards
    const allEls = doc.querySelectorAll('*');
    const flaggedEls = new Set();
    for (const el of allEls) {
      if (!isCardLike(el, win)) continue;
      if (flaggedEls.has(el)) continue;
      const tag = el.tagName.toLowerCase();
      const cls = el.getAttribute?.('class') || '';
      const rawStyle = el.getAttribute?.('style') || '';
      if (['pre', 'code'].includes(tag)) continue;
      if (/\b(?:absolute|fixed)\b/.test(cls) || /position\s*:\s*(?:absolute|fixed)/i.test(rawStyle)) continue;
      if ((el.textContent?.trim().length || 0) < 10) continue;
      if (/\b(?:dropdown|popover|tooltip|menu|modal|dialog)\b/i.test(cls)) continue;

      // Walk up to find card-like ancestor
      let parent = el.parentElement;
      while (parent) {
        if (isCardLike(parent, win)) {
          flaggedEls.add(el);
          break;
        }
        parent = parent.parentElement;
      }
    }

    // Only report innermost nested cards
    for (const el of flaggedEls) {
      let isAncestorOfFlagged = false;
      for (const other of flaggedEls) {
        if (other !== el && el.contains(other)) {
          isAncestorOfFlagged = true;
          break;
        }
      }
      if (!isAncestorOfFlagged) {
        findings.push({
          id: 'nested-cards',
          snippet: `Card inside card (${el.tagName.toLowerCase()})`
        });
      }
    }
    return findings;
  }

  // ─── Cream / beige palette (the default "tasteful" AI surface) ────────────────
  // A warm, lightly-tinted off-white page background — light, with R≥G≥B and a
  // small warm tint (not white, not a strong color). The current reflex surface.
  function isCreamColor(rgb) {
    if (!rgb) return false;
    const {
      r,
      g,
      b
    } = rgb;
    if (Math.min(r, g, b) < 209) return false; // must be light
    if (!(r >= g && g >= b)) return false; // warm ordering
    const warmth = r - b;
    return warmth >= 6 && warmth <= 48; // tinted, not white, not strong
  }

  // Tailwind background utilities that render as a warm off-white surface. The
  // static engine doesn't fetch Tailwind's CSS, so a `bg-amber-50` on <body>
  // resolves to nothing in computed style — catch it from the class list
  // instead. Candidate tokens map to their actual Tailwind hex and are still
  // filtered through isCreamColor, so neutral grays (stone) and over-saturated
  // shades drop out on their own.
  const TAILWIND_BG_HEX = {
    'bg-amber-50': '#fffbeb',
    'bg-amber-100': '#fef3c7',
    'bg-orange-50': '#fff7ed',
    'bg-orange-100': '#ffedd5',
    'bg-yellow-50': '#fefce8',
    'bg-stone-50': '#fafaf9',
    'bg-stone-100': '#f5f5f4',
    'bg-stone-200': '#e7e5e4'
  };
  function creamFromClassList(cls) {
    if (!cls) return null;
    // Arbitrary value: bg-[#f5f0e6] / bg-[rgb(245_240_230)] (underscores = spaces).
    const arb = cls.match(/\bbg-\[([^\]]+)\]/);
    if (arb && isCreamColor(parseAnyColor(arb[1].replace(/_/g, ' ')))) return `bg-[${arb[1]}]`;
    // Named warm-light utilities.
    for (const [tok, hex] of Object.entries(TAILWIND_BG_HEX)) {
      if (new RegExp(`(^|\\s)${tok}($|\\s)`).test(cls) && isCreamColor(parseAnyColor(hex))) return tok;
    }
    return null;
  }
  function checkCreamPalette(doc, win) {
    const findings = [];
    const body = doc.body || (doc.querySelector ? doc.querySelector('body') : null);
    if (!body) return findings;
    const html = doc.documentElement;
    const getCS = el => win ? win.getComputedStyle(el) : getComputedStyle(el);

    // 1. Computed background — covers inline / <style> / linked CSS, and Tailwind
    //    once it's actually rendered (browser path).
    let bg = readOwnBackgroundColor(body, getCS(body));
    if (!bg || bg.a === 0) {
      if (html) bg = readOwnBackgroundColor(html, getCS(html));
    }
    if (isCreamColor(bg)) {
      findings.push({
        id: 'cream-palette',
        snippet: `cream/beige page background rgb(${bg.r}, ${bg.g}, ${bg.b})`
      });
      return findings;
    }

    // 2. Tailwind class fallback — for the static path, where utility classes
    //    never resolve to computed CSS.
    for (const el of [body, html]) {
      const tok = creamFromClassList(el && el.getAttribute ? el.getAttribute('class') : '');
      if (tok) {
        findings.push({
          id: 'cream-palette',
          snippet: `cream/beige page background (Tailwind ${tok})`
        });
        break;
      }
    }
    return findings;
  }

  // ─── Oversized hero headline ────────────────────────────────────────────────
  // Fires when a *long* headline is set at display size and actually dominates
  // the viewport. A punchy one- or two-word headline at the same size is a
  // legitimate stylistic choice, and a large-but-contained two-line hero should
  // pass too — length and viewport share together are the tell.
  const OVERSIZED_H1_FONT_PX = 72;
  const OVERSIZED_H1_MIN_CHARS = 40;
  const OVERSIZED_H1_MIN_VIEWPORT_HEIGHT_RATIO = 0.28;
  const OVERSIZED_H1_MIN_VIEWPORT_AREA_RATIO = 0.25;
  function checkOversizedH1({
    tag,
    fontSize,
    headingText,
    rect = null,
    viewportWidth = 0,
    viewportHeight = 0
  }) {
    if (tag !== 'h1') return [];
    const textLen = headingText.length;
    if (fontSize >= OVERSIZED_H1_FONT_PX && textLen >= OVERSIZED_H1_MIN_CHARS) {
      let viewportDetail = '';
      if (rect && viewportWidth > 0 && viewportHeight > 0) {
        const heightRatio = rect.height / viewportHeight;
        const areaRatio = rect.width * rect.height / (viewportWidth * viewportHeight);
        const dominatesViewport = heightRatio >= OVERSIZED_H1_MIN_VIEWPORT_HEIGHT_RATIO || areaRatio >= OVERSIZED_H1_MIN_VIEWPORT_AREA_RATIO;
        if (!dominatesViewport) return [];
        viewportDetail = `, ${Math.round(heightRatio * 100)}vh`;
      }
      return [{
        id: 'oversized-h1',
        snippet: `${Math.round(fontSize)}px h1, ${textLen} chars${viewportDetail} "${headingText.slice(0, 60)}"`
      }];
    }
    return [];
  }
  function checkElementOversizedH1(el, style, tag, window) {
    if (tag !== 'h1') return [];
    const fontSize = resolveFontSizePx(el, window);
    const headingText = (el.textContent || '').trim().replace(/\s+/g, ' ');
    return checkOversizedH1({
      tag,
      fontSize,
      headingText
    });
  }
  function checkElementOversizedH1DOM(el) {
    const tag = el.tagName.toLowerCase();
    if (tag !== 'h1') return [];
    const style = getComputedStyle(el);
    const fontSize = parseFloat(style.fontSize) || 0;
    const headingText = (el.textContent || '').trim().replace(/\s+/g, ' ');
    const rect = el.getBoundingClientRect();
    const viewportWidth = (typeof window !== 'undefined' ? window.innerWidth : 0) || 0;
    const viewportHeight = (typeof window !== 'undefined' ? window.innerHeight : 0) || 0;
    return checkOversizedH1({
      tag,
      fontSize,
      headingText,
      rect,
      viewportWidth,
      viewportHeight
    });
  }

  // ─── GPT tell: hairline border + wide diffuse shadow (gated --gpt) ────────────
  const CSS_COLOR_TOKEN_RE = /(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\([^)]*\)|#[0-9a-fA-F]{3,8}\b|\b(?:black|white|transparent|currentcolor)\b/gi;
  function shadowLayerAlpha(layer) {
    CSS_COLOR_TOKEN_RE.lastIndex = 0;
    const match = CSS_COLOR_TOKEN_RE.exec(layer);
    if (!match) return 1;
    if (match[0].toLowerCase() === 'transparent') return 0;
    const parsed = parseAnyColor(match[0]);
    return parsed ? parsed.a ?? 1 : 1;
  }
  function shadowMaxBlurPx(boxShadow, {
    minAlpha = 0
  } = {}) {
    if (!boxShadow || boxShadow === 'none') return 0;
    let maxBlur = 0;
    // Split into layers on commas not inside parentheses (rgba(...) etc.).
    for (const layer of boxShadow.split(/,(?![^()]*\))/)) {
      if (shadowLayerAlpha(layer) < minAlpha) continue;
      // Strip colors and keywords (rgba()/hsl()/hex/named/inset/px), leaving the
      // ordered length tokens: offsetX offsetY blur [spread]. Static jsdom keeps
      // unitless zeros ("0 0 24px"); browsers normalize to px ("0px 0px 24px") —
      // both reduce to the same numbers here.
      const cleaned = layer.replace(CSS_COLOR_TOKEN_RE, ' ').replace(/\b[a-z]+\b/gi, ' ');
      const nums = [...cleaned.matchAll(/-?\d*\.?\d+/g)].map(m => parseFloat(m[0]));
      if (nums.length >= 3) maxBlur = Math.max(maxBlur, nums[2]);
    }
    return maxBlur;
  }
  function cssColorAlpha(value) {
    if (cssColorIsTransparent(value)) return 0;
    const parsed = parseAnyColor(value);
    return parsed ? parsed.a ?? 1 : 1;
  }
  function checkGptThinBorderWideShadow({
    borderWidths,
    borderColors,
    boxShadow
  }) {
    const visibleThinBorders = borderWidths.map((width, index) => ({
      width,
      alpha: cssColorAlpha(borderColors?.[index] || '')
    })).filter(({
      width,
      alpha
    }) => width > 0 && width <= 1.5 && alpha >= 0.28);
    const maxBorder = Math.max(0, ...visibleThinBorders.map(({
      width
    }) => width));
    const blur = shadowMaxBlurPx(boxShadow, {
      minAlpha: 0.12
    });
    if (visibleThinBorders.length >= 2 && blur >= 16) {
      return [{
        id: 'gpt-thin-border-wide-shadow',
        snippet: `${maxBorder}px border + ${Math.round(blur)}px shadow blur`
      }];
    }
    return [];
  }
  function borderWidthsFromStyle(style) {
    return [parseFloat(style.borderTopWidth) || 0, parseFloat(style.borderRightWidth) || 0, parseFloat(style.borderBottomWidth) || 0, parseFloat(style.borderLeftWidth) || 0];
  }
  function borderColorsFromStyle(style) {
    return [style.borderTopColor || '', style.borderRightColor || '', style.borderBottomColor || '', style.borderLeftColor || ''];
  }
  function checkElementGptBorderShadow(el, style) {
    return checkGptThinBorderWideShadow({
      borderWidths: borderWidthsFromStyle(style),
      borderColors: borderColorsFromStyle(style),
      boxShadow: style.boxShadow || ''
    });
  }
  function checkElementGptBorderShadowDOM(el) {
    const style = getComputedStyle(el);
    return checkGptThinBorderWideShadow({
      borderWidths: borderWidthsFromStyle(style),
      borderColors: borderColorsFromStyle(style),
      boxShadow: style.boxShadow || ''
    });
  }

  // ─── Clipped overflow container ───────────────────────────────────────────────
  // A clipping container (overflow hidden/clip, not a scroll region) wrapping an
  // absolutely/fixed-positioned descendant clips popovers/menus that must escape.
  function classSelector(el) {
    const cls = (el.getAttribute ? el.getAttribute('class') : el.className) || '';
    const tokens = String(cls).trim().split(/\s+/).filter(Boolean);
    const tag = el.tagName ? el.tagName.toLowerCase() : 'el';
    return tokens.length ? `${tag}.${tokens.join('.')}` : tag;
  }
  function positionedChildIsDecorative(child) {
    if (!child || typeof child.getAttribute !== 'function') return false;
    if (child.closest?.('[aria-hidden="true"]')) return true;
    const role = (child.getAttribute('role') || '').toLowerCase();
    if (role === 'none' || role === 'presentation') return true;
    const tag = child.tagName ? child.tagName.toLowerCase() : '';
    if (['img', 'svg', 'canvas', 'video'].includes(tag)) return true;
    const ident = `${child.getAttribute('class') || ''} ${child.getAttribute('id') || ''}`;
    if (/\b(art|bg|background|badge|blob|crop|decor|dot|glow|grain|image|mask|ornament|overlay|photo|scrim|shadow|shine|texture)\b/i.test(ident) && !positionedChildHasSubstantiveContent(child)) {
      return true;
    }
    return false;
  }
  const POSITIONED_CHILD_INTERACTIVE_SELECTOR = ['a[href]', 'button', 'input', 'select', 'summary', 'textarea', '[tabindex]:not([tabindex="-1"])', '[role="button"]', '[role="dialog"]', '[role="link"]', '[role="listbox"]', '[role="menu"]', '[role="menuitem"]', '[role="option"]', '[role="tooltip"]'].join(',');
  function positionedChildHasSubstantiveContent(child) {
    const text = (child.textContent || '').replace(/\s+/g, ' ').trim();
    if (text.length > 0) return true;
    if (typeof child.matches === 'function') {
      try {
        if (child.matches(POSITIONED_CHILD_INTERACTIVE_SELECTOR)) return true;
      } catch {}
    }
    if (typeof child.querySelector === 'function') {
      try {
        if (child.querySelector(POSITIONED_CHILD_INTERACTIVE_SELECTOR)) return true;
      } catch {}
    }
    return false;
  }
  function clippingContainerIsIntentionalViewport(el) {
    if (!el || typeof el.getAttribute !== 'function') return false;
    const roleDescription = (el.getAttribute('aria-roledescription') || '').toLowerCase();
    if (/\b(carousel|slider)\b/.test(roleDescription)) return true;
    const ident = `${el.getAttribute('class') || ''} ${el.getAttribute('id') || ''}`.toLowerCase();
    return /\b(carousel|comparison|compare|fisheye|marquee|preview|scroller|slider|slideshow|split|viewport)\b/.test(ident) || /\b(demo-area|demo-stage|demo-viewport)\b/.test(ident);
  }
  function elementRect(el) {
    if (!el || typeof el.getBoundingClientRect !== 'function') return null;
    try {
      const rect = el.getBoundingClientRect();
      if (!rect) return null;
      const values = [rect.top, rect.right, rect.bottom, rect.left, rect.width, rect.height];
      if (!values.every(Number.isFinite)) return null;
      if (rect.width <= 0 && rect.height <= 0) return null;
      return rect;
    } catch {
      return null;
    }
  }
  function positionedStyleImpliesEscape(style) {
    const values = [style.top, style.right, style.bottom, style.left, style.inset, style.insetBlock, style.insetInline, style.insetBlockStart, style.insetBlockEnd, style.insetInlineStart, style.insetInlineEnd].filter(Boolean).map(value => String(value).trim().toLowerCase());
    for (const value of values) {
      if (/(^|[\s(])-+(?:\d|\.)/.test(value)) return true;
      if (/(^|[\s(])100(?:\.0+)?%/.test(value)) return true;
    }
    return false;
  }
  function positionedChildEscapesClip(el, child, clipX, clipY) {
    const parentRect = elementRect(el);
    const childRect = elementRect(child);
    if (!parentRect || !childRect) return null;
    const threshold = 2;
    return Boolean(clipX && (childRect.left < parentRect.left - threshold || childRect.right > parentRect.right + threshold) || clipY && (childRect.top < parentRect.top - threshold || childRect.bottom > parentRect.bottom + threshold));
  }
  function checkClippedOverflow(el, style, getStyle) {
    const clips = v => v === 'hidden' || v === 'clip';
    const scrolls = v => v === 'auto' || v === 'scroll';
    const ox = style.overflowX || '',
      oy = style.overflowY || '',
      ov = style.overflow || '';
    const clipX = clips(ox) || clips(ov);
    const clipY = clips(oy) || clips(ov);
    const anyClip = clipX || clipY;
    const anyScroll = scrolls(ox) || scrolls(oy) || scrolls(ov);
    if (!anyClip || anyScroll) return [];
    if (clippingContainerIsIntentionalViewport(el)) return [];
    if (!el.querySelectorAll) return [];
    for (const child of el.querySelectorAll('*')) {
      const childStyle = getStyle(child);
      const pos = childStyle.position || '';
      if (pos === 'absolute' || pos === 'fixed') {
        if (positionedChildIsDecorative(child)) continue;
        const escapes = positionedChildEscapesClip(el, child, clipX, clipY);
        if (escapes === false) continue;
        if (escapes === null && !positionedStyleImpliesEscape(childStyle)) continue;
        return [{
          id: 'clipped-overflow-container',
          snippet: `${classSelector(el)} clips a positioned child`
        }];
      }
    }
    return [];
  }
  function checkElementClippedOverflow(el, style, tag, window) {
    return checkClippedOverflow(el, style, n => window.getComputedStyle(n));
  }
  function checkElementClippedOverflowDOM(el) {
    const style = getComputedStyle(el);
    return checkClippedOverflow(el, style, n => getComputedStyle(n));
  }

  // ─── Text overflow (browser-only: needs scrollWidth/clientWidth) ──────────────
  const TEXT_OVERFLOW_SKIP_TAGS = new Set(['pre', 'code', 'textarea', 'svg', 'canvas', 'select', 'option', 'marquee']);
  function metricLengthPx(value, fontSizePx = 16) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value !== 'string') return null;
    return resolveLengthPx(value, fontSizePx);
  }
  function firstMetricLengthPx(fontSizePx, ...values) {
    for (const value of values) {
      const parsed = metricLengthPx(value, fontSizePx);
      if (parsed !== null) return parsed;
    }
    return null;
  }
  function expandBoxShorthand(parts) {
    if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
    if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
    if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
    return [parts[0], parts[1], parts[2], parts[3]];
  }
  function clippedByInset(clipPath) {
    const match = String(clipPath || '').trim().toLowerCase().match(/^inset\s*\(([^)]*)\)$/);
    if (!match) return false;
    const beforeRound = match[1].split(/\s+round\s+/)[0].trim();
    if (!beforeRound) return false;
    const values = expandBoxShorthand(beforeRound.split(/\s+/).slice(0, 4));
    const percents = values.map(value => String(value).trim().match(/^(-?\d+(?:\.\d+)?)%$/));
    if (percents.some(match => !match)) return false;
    const [top, right, bottom, left] = percents.map(match => parseFloat(match[1]));
    return top + bottom >= 100 || left + right >= 100;
  }
  function clippedByRect(clip) {
    const match = String(clip || '').trim().toLowerCase().match(/^rect\s*\(([^)]*)\)$/);
    if (!match) return false;
    const values = match[1].split(/[,\s]+/).map(value => value.trim()).filter(Boolean);
    if (values.length !== 4) return false;
    const [top, right, bottom, left] = values.map(value => metricLengthPx(value, 16));
    if ([top, right, bottom, left].some(value => value === null)) return false;
    return bottom <= top || right <= left;
  }
  function isScreenReaderOnlyTextStyle(style, metrics = {}) {
    if (!style) return false;
    const overflowValues = [style.overflow, style.overflowX, style.overflowY].map(value => String(value || '').toLowerCase());
    const clipsOverflow = overflowValues.some(value => value === 'hidden' || value === 'clip');
    const fontSize = metricLengthPx(style.fontSize, 16) || 16;
    const width = firstMetricLengthPx(fontSize, metrics.width, metrics.clientWidth, style.width, style.inlineSize);
    const height = firstMetricLengthPx(fontSize, metrics.height, metrics.clientHeight, style.height, style.blockSize);
    const isTiny = width !== null && height !== null && width <= 2 && height <= 2;
    const isAbsolutelyHidden = String(style.position || '').toLowerCase() === 'absolute' && isTiny && clipsOverflow;
    const clipPath = String(style.clipPath || style.webkitClipPath || '').trim();
    const clip = String(style.clip || '').trim();
    return isAbsolutelyHidden || clippedByInset(clipPath) || clippedByRect(clip);
  }
  function isRenderedForBrowserRule(el) {
    for (let cur = el; cur && cur.nodeType === 1; cur = cur.parentElement) {
      if (cur.getAttribute?.('aria-hidden') === 'true') return false;
      const style = getComputedStyle(cur);
      const visibility = String(style.visibility || '').toLowerCase();
      if (style.display === 'none' || visibility === 'hidden' || visibility === 'collapse') return false;
      if ((parseFloat(style.opacity) || 0) <= 0.01) return false;
      if (String(style.contentVisibility || '').toLowerCase() === 'hidden') return false;
    }
    return true;
  }
  function checkElementTextOverflowDOM(el) {
    const tag = el.tagName.toLowerCase();
    if (TEXT_OVERFLOW_SKIP_TAGS.has(tag)) return [];
    if (!isRenderedForBrowserRule(el)) return [];
    // Only the element that actually owns overflowing text — not its ancestors,
    // which inherit a wider scrollWidth from the spilling descendant.
    const hasDirectText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 0);
    if (!hasDirectText) return [];
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
    if (isScreenReaderOnlyTextStyle(style, {
      width: rect?.width,
      height: rect?.height,
      clientWidth: el.clientWidth,
      clientHeight: el.clientHeight
    })) return [];
    const isScrollRegion = s => /(auto|scroll)/.test(s.overflowX || '') || /(auto|scroll)/.test(s.overflow || '');
    if (isScrollRegion(style)) return [];
    // A scrollable ancestor means this overflow is intentional and scrollable.
    for (let p = el.parentElement; p; p = p.parentElement) {
      if (isScrollRegion(getComputedStyle(p))) return [];
    }
    const delta = el.scrollWidth - el.clientWidth;
    if (el.clientWidth > 0 && delta >= 16) {
      return [{
        id: 'text-overflow',
        snippet: `${classSelector(el)} overflows its box by ${Math.round(delta)}px`
      }];
    }
    return [];
  }

  // --- cli/engine/browser/injected/index.mjs ---
  const IS_BROWSER = typeof window !== 'undefined';

  // ─── Section 7: Browser UI (IS_BROWSER only) ────────────────────────────────

  if (IS_BROWSER) {
    // Detect extension mode via the script tag's data attribute or the document element fallback.
    // currentScript is reliable for synchronously-executing scripts (which our IIFE is).
    const _myScript = document.currentScript;
    const EXTENSION_MODE = _myScript && _myScript.dataset.impeccableExtension === 'true' || document.documentElement.dataset.impeccableExtension === 'true';

    // Kinpaku gold — pinned to the site's brand token (see
    // site/styles/kinpaku-tokens.css --ks-kinpaku). Keep this in sync with
    // the picker's C.brand in skill/scripts/live-browser.js and the kit's
    // picker section in site/styles/kinpaku-kit.css.
    //
    // One color across both light and dark host pages. The outline is a
    // 2px gesture pointing at an element + a labeled tag — it's a marker,
    // not body text, so it doesn't need WCAG AA against the page. The
    // label text inside the gold tag is dark (LABEL_INK) which has ~16:1
    // against the leaf gold, so reading the rule name is solid in both
    // modes. Hover deepens the gold (preserves chroma — never drops it,
    // dropping chroma washes the gold into a sand/olive tone).
    const BRAND_COLOR = 'oklch(84% 0.19 80.46)';
    const BRAND_COLOR_HOVER = 'oklch(74% 0.18 80)';
    const LABEL_INK = 'oklch(4% 0.004 95)';
    const LABEL_BG = BRAND_COLOR;
    const OUTLINE_COLOR = BRAND_COLOR;

    // Inject hover styles via CSS (more reliable than JS event listeners)
    const styleEl = document.createElement('style');
    styleEl.textContent = `
    @keyframes impeccable-reveal {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .impeccable-overlay:not(.impeccable-banner) {
      pointer-events: none;
      outline: 2px solid ${OUTLINE_COLOR};
      border-radius: 4px;
      transition: outline-color 0.15s ease;
      animation: impeccable-reveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
      animation-play-state: paused;
      border-top-left-radius: 0;
    }
    .impeccable-overlay.impeccable-visible {
      animation-play-state: running;
    }
    .impeccable-overlay.impeccable-hover {
      outline-color: ${BRAND_COLOR_HOVER};
      z-index: 100001 !important;
    }
    .impeccable-overlay.impeccable-hover .impeccable-label {
      background: ${BRAND_COLOR_HOVER};
    }
    .impeccable-overlay.impeccable-spotlight {
      z-index: 100002 !important;
    }
    .impeccable-overlay.impeccable-spotlight-dimmed {
      opacity: 0.15 !important;
      animation: none !important;
      filter: blur(3px);
    }
    .impeccable-spotlight-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      backdrop-filter: blur(3px) brightness(0.6);
      -webkit-backdrop-filter: blur(3px) brightness(0.6);
      pointer-events: none;
      z-index: 99998;
      opacity: 0;
      outline: none !important;
      animation: none !important;
    }
    .impeccable-spotlight-backdrop.impeccable-visible {
      opacity: 1;
    }
    .impeccable-hidden .impeccable-overlay${EXTENSION_MODE ? '' : ':not(.impeccable-banner)'} {
      display: none !important;
    }
  `;
    (document.head || document.documentElement).appendChild(styleEl);

    // Spotlight backdrop element (created lazily on first use)
    let spotlightBackdrop = null;
    let spotlightTarget = null;
    function getSpotlightBackdrop() {
      if (!spotlightBackdrop) {
        spotlightBackdrop = document.createElement('div');
        spotlightBackdrop.className = 'impeccable-spotlight-backdrop';
        document.body.appendChild(spotlightBackdrop);
      }
      return spotlightBackdrop;
    }
    function updateSpotlightClipPath() {
      if (!spotlightBackdrop || !spotlightTarget) return;
      const r = spotlightTarget.getBoundingClientRect();
      // Match the overlay's outer edge: element rect + 4px (2px overlay offset + 2px outline width)
      const inset = 4;
      const radius = 6; // outline border-radius (4) + outline width (2)
      const x1 = r.left - inset;
      const y1 = r.top - inset;
      const x2 = r.right + inset;
      const y2 = r.bottom + inset;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Outer rect + rounded inner rect (evenodd creates a hole)
      const path = `M0 0H${vw}V${vh}H0Z M${x1 + radius} ${y1}H${x2 - radius}A${radius} ${radius} 0 0 1 ${x2} ${y1 + radius}V${y2 - radius}A${radius} ${radius} 0 0 1 ${x2 - radius} ${y2}H${x1 + radius}A${radius} ${radius} 0 0 1 ${x1} ${y2 - radius}V${y1 + radius}A${radius} ${radius} 0 0 1 ${x1 + radius} ${y1}Z`;
      spotlightBackdrop.style.clipPath = `path(evenodd, "${path}")`;
    }
    function showSpotlight(target) {
      if (!target || !target.getBoundingClientRect) return;
      // Respect the spotlightBlur setting: if disabled, don't show the backdrop
      if (window.__IMPECCABLE_CONFIG__?.spotlightBlur === false) {
        spotlightTarget = target;
        return;
      }
      spotlightTarget = target;
      const bd = getSpotlightBackdrop();
      updateSpotlightClipPath();
      bd.classList.add('impeccable-visible');
    }
    function hideSpotlight() {
      spotlightTarget = null;
      if (spotlightBackdrop) spotlightBackdrop.classList.remove('impeccable-visible');
    }
    function isInViewport(el) {
      const r = el.getBoundingClientRect();
      return r.top >= 0 && r.left >= 0 && r.bottom <= window.innerHeight && r.right <= window.innerWidth;
    }

    // Reposition spotlight on scroll/resize
    window.addEventListener('scroll', () => {
      if (spotlightTarget) updateSpotlightClipPath();
    }, {
      passive: true
    });
    window.addEventListener('resize', () => {
      if (spotlightTarget) updateSpotlightClipPath();
    });
    const overlays = [];
    const TYPE_LABELS = {};
    const RULE_CATEGORY = {};
    for (const ap of ANTIPATTERNS) {
      TYPE_LABELS[ap.id] = ap.name.toLowerCase();
      RULE_CATEGORY[ap.id] = ap.category || 'quality';
    }
    function isInFixedContext(el) {
      let p = el;
      while (p && p !== document.body) {
        if (getComputedStyle(p).position === 'fixed') return true;
        p = p.parentElement;
      }
      return false;
    }
    function positionOverlay(overlay) {
      const el = overlay._targetEl;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (overlay._isFixed) {
        // Viewport-relative coords for fixed targets
        overlay.style.top = `${rect.top - 2}px`;
        overlay.style.left = `${rect.left - 2}px`;
      } else {
        // Document-relative coords for normal targets
        overlay.style.top = `${rect.top + scrollY - 2}px`;
        overlay.style.left = `${rect.left + scrollX - 2}px`;
      }
      overlay.style.width = `${rect.width + 4}px`;
      overlay.style.height = `${rect.height + 4}px`;
    }
    function repositionOverlays() {
      for (const o of overlays) {
        if (!o._targetEl || o.classList.contains('impeccable-banner')) continue;
        // Skip overlays whose target is currently hidden (display: none on the overlay)
        if (o.style.display === 'none') continue;
        positionOverlay(o);
      }
    }
    let resizeRAF;
    const onResize = () => {
      cancelAnimationFrame(resizeRAF);
      resizeRAF = requestAnimationFrame(repositionOverlays);
    };
    window.addEventListener('resize', onResize);
    // Reposition on scroll too -- catches sticky/parallax shifts
    window.addEventListener('scroll', onResize, {
      passive: true
    });
    // Reposition when body resizes (lazy-loaded images, dynamic content, fonts loading)
    if (typeof ResizeObserver !== 'undefined') {
      const bodyResizeObserver = new ResizeObserver(onResize);
      bodyResizeObserver.observe(document.body);
    }

    // Track target element visibility via IntersectionObserver.
    // Uses a huge rootMargin so all *rendered* elements count as intersecting,
    // while display:none / closed <details> / hidden modals etc. do not.
    // This is event-driven -- no polling needed.
    let overlayIndex = 0;
    const visibilityObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const overlay = entry.target._impeccableOverlay;
        if (!overlay) continue;
        if (entry.isIntersecting) {
          overlay.style.display = '';
          positionOverlay(overlay);
          if (!overlay._revealed) {
            overlay._revealed = true;
            if (firstScanDone) {
              // Subsequent reveals (re-scans, scroll-into-view): instant, no animation
              overlay.style.animation = 'none';
            } else {
              // Initial scan: staggered cascade reveal
              overlay.style.animationDelay = `${Math.min((overlay._staggerIndex || 0) * 60, 600)}ms`;
            }
            requestAnimationFrame(() => {
              overlay.classList.add('impeccable-visible');
              if (overlay._checkLabel) overlay._checkLabel();
            });
          }
        } else {
          overlay.style.display = 'none';
        }
      }
    }, {
      rootMargin: '99999px'
    });
    function detachOverlay(overlay) {
      if (!overlay) return;
      if (typeof overlay._cleanup === 'function') {
        try {
          overlay._cleanup();
        } catch {/* best effort overlay teardown */}
      }
      if (overlay._targetEl && overlay._targetEl._impeccableOverlay === overlay) {
        visibilityObserver.unobserve(overlay._targetEl);
        delete overlay._targetEl._impeccableOverlay;
      }
      const idx = overlays.indexOf(overlay);
      if (idx >= 0) overlays.splice(idx, 1);
      overlay.remove();
    }

    // Reposition overlays after CSS transitions end (e.g. reveal animations).
    // Listens at document level so it catches transitions on ancestor elements
    // (the transform may be on a parent, not the flagged element itself).
    document.addEventListener('transitionend', e => {
      if (e.propertyName !== 'transform') return;
      for (const o of overlays) {
        if (!o._targetEl || o.classList.contains('impeccable-banner') || o.style.display === 'none') continue;
        if (e.target === o._targetEl || e.target.contains(o._targetEl)) {
          positionOverlay(o);
        }
      }
    });
    const highlight = function (el, findings) {
      if (el._impeccableOverlay) detachOverlay(el._impeccableOverlay);
      const hasSlop = findings.some(f => RULE_CATEGORY[f.type || f.id] === 'slop');
      const fixed = isInFixedContext(el);
      const rect = el.getBoundingClientRect();
      const outline = document.createElement('div');
      outline.className = 'impeccable-overlay';
      outline._targetEl = el;
      outline._isFixed = fixed;
      Object.assign(outline.style, {
        position: fixed ? 'fixed' : 'absolute',
        top: fixed ? `${rect.top - 2}px` : `${rect.top + scrollY - 2}px`,
        left: fixed ? `${rect.left - 2}px` : `${rect.left + scrollX - 2}px`,
        width: `${rect.width + 4}px`,
        height: `${rect.height + 4}px`,
        zIndex: '99999',
        boxSizing: 'border-box'
      });

      // Build per-finding label entries: ✦ prefix for slop
      const entries = findings.map(f => {
        const name = TYPE_LABELS[f.type || f.id] || f.type || f.id;
        const prefix = RULE_CATEGORY[f.type || f.id] === 'slop' ? '\u2726 ' : '';
        return {
          name: prefix + name,
          detail: f.detail || f.snippet
        };
      });
      const allText = entries.map(e => e.name).join(', ');
      const label = document.createElement('div');
      label.className = 'impeccable-label';
      Object.assign(label.style, {
        position: 'absolute',
        bottom: '100%',
        left: '-2px',
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        fontSize: '11px',
        fontWeight: '600',
        letterSpacing: '0.02em',
        color: LABEL_INK,
        lineHeight: '14px',
        background: LABEL_BG,
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '4px 4px 0 0'
      });
      const textSpan = document.createElement('span');
      textSpan.style.padding = '3px 8px';
      textSpan.textContent = allText;
      label.appendChild(textSpan);

      // State for cycling mode
      let cycleMode = false;
      let cycleIndex = 0;
      let isHovered = false;
      let prevBtn, nextBtn;
      function updateCycleText() {
        const e = entries[cycleIndex];
        textSpan.textContent = isHovered ? e.detail : e.name;
      }
      function enableCycleMode() {
        if (cycleMode || entries.length < 2) return;
        cycleMode = true;
        const btnStyle = {
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '11px',
          cursor: 'pointer',
          padding: '3px 4px',
          fontFamily: 'system-ui, sans-serif',
          lineHeight: '14px',
          pointerEvents: 'auto'
        };
        const navGroup = document.createElement('span');
        Object.assign(navGroup.style, {
          display: 'inline-flex',
          alignItems: 'center',
          flexShrink: '0'
        });
        prevBtn = document.createElement('button');
        prevBtn.textContent = '\u2039';
        Object.assign(prevBtn.style, btnStyle);
        prevBtn.style.paddingLeft = '6px';
        prevBtn.addEventListener('click', e => {
          e.stopPropagation();
          cycleIndex = (cycleIndex - 1 + entries.length) % entries.length;
          updateCycleText();
        });
        nextBtn = document.createElement('button');
        nextBtn.textContent = '\u203A';
        Object.assign(nextBtn.style, btnStyle);
        nextBtn.style.paddingRight = '2px';
        nextBtn.addEventListener('click', e => {
          e.stopPropagation();
          cycleIndex = (cycleIndex + 1) % entries.length;
          updateCycleText();
        });
        navGroup.appendChild(prevBtn);
        navGroup.appendChild(nextBtn);
        label.insertBefore(navGroup, textSpan);
        textSpan.style.padding = '3px 8px 3px 4px';
        updateCycleText();
      }
      outline.appendChild(label);

      // Start hidden; the IntersectionObserver will show it once the target is rendered
      outline.style.display = 'none';
      outline._staggerIndex = overlayIndex++;
      el._impeccableOverlay = outline;
      visibilityObserver.observe(el);

      // After first paint, check label width vs outline
      outline._checkLabel = () => {
        if (entries.length > 1 && label.offsetWidth > outline.offsetWidth) {
          enableCycleMode();
        }
      };

      // Hover: show detail text, darken
      const onMouseEnter = () => {
        isHovered = true;
        outline.classList.add('impeccable-hover');
        outline.style.outlineColor = BRAND_COLOR_HOVER;
        label.style.background = BRAND_COLOR_HOVER;
        if (cycleMode) {
          updateCycleText();
        } else {
          textSpan.textContent = entries.map(e => e.detail).join(' | ');
        }
      };
      const onMouseLeave = () => {
        isHovered = false;
        outline.classList.remove('impeccable-hover');
        outline.style.outlineColor = '';
        label.style.background = LABEL_BG;
        if (cycleMode) {
          updateCycleText();
        } else {
          textSpan.textContent = allText;
        }
      };
      el.addEventListener('mouseenter', onMouseEnter);
      el.addEventListener('mouseleave', onMouseLeave);
      outline._cleanup = () => {
        el.removeEventListener('mouseenter', onMouseEnter);
        el.removeEventListener('mouseleave', onMouseLeave);
      };
      document.body.appendChild(outline);
      overlays.push(outline);
    };
    const showPageBanner = function (findings) {
      if (!findings.length) return;
      const banner = document.createElement('div');
      banner.className = 'impeccable-overlay impeccable-banner';
      Object.assign(banner.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        zIndex: '100000',
        background: LABEL_BG,
        color: LABEL_INK,
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'auto',
        height: '36px',
        overflow: 'hidden',
        maxWidth: '100vw',
        transform: 'translateY(-100%)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      });
      requestAnimationFrame(() => requestAnimationFrame(() => {
        banner.style.transform = 'translateY(0)';
      }));

      // Scrollable findings area
      const scrollArea = document.createElement('div');
      Object.assign(scrollArea.style, {
        flex: '1',
        minWidth: '0',
        overflowX: 'auto',
        overflowY: 'hidden',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        padding: '0 12px',
        scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none'
      });
      for (const f of findings) {
        const prefix = RULE_CATEGORY[f.type] === 'slop' ? '\u2726 ' : '';
        const tag = document.createElement('span');
        tag.textContent = `${prefix}${TYPE_LABELS[f.type] || f.type}: ${f.detail}`;
        Object.assign(tag.style, {
          background: 'rgba(255,255,255,0.15)',
          padding: '2px 8px',
          borderRadius: '3px',
          fontSize: '12px',
          fontFamily: 'ui-monospace, monospace',
          whiteSpace: 'nowrap',
          flexShrink: '0',
          scrollSnapAlign: 'start'
        });
        scrollArea.appendChild(tag);
      }
      banner.appendChild(scrollArea);

      // Controls area (only in standalone mode, not extension)
      if (!EXTENSION_MODE) {
        const controls = document.createElement('div');
        Object.assign(controls.style, {
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          padding: '0 8px',
          flexShrink: '0'
        });

        // Toggle visibility button
        const toggle = document.createElement('button');
        toggle.textContent = '\u25C9'; // circle with dot (visible state)
        toggle.title = 'Toggle overlay visibility';
        Object.assign(toggle.style, {
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '16px',
          cursor: 'pointer',
          padding: '0 4px',
          opacity: '0.85',
          transition: 'opacity 0.15s'
        });
        let overlaysVisible = true;
        toggle.addEventListener('click', () => {
          overlaysVisible = !overlaysVisible;
          document.body.classList.toggle('impeccable-hidden', !overlaysVisible);
          toggle.textContent = overlaysVisible ? '\u25C9' : '\u25CB'; // filled vs empty circle
          toggle.style.opacity = overlaysVisible ? '0.85' : '0.5';
        });
        controls.appendChild(toggle);

        // Close button
        const close = document.createElement('button');
        close.textContent = '\u00d7';
        close.title = 'Dismiss banner';
        Object.assign(close.style, {
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '18px',
          cursor: 'pointer',
          padding: '0 4px'
        });
        close.addEventListener('click', () => banner.remove());
        controls.appendChild(close);
        banner.appendChild(controls);
      }
      document.body.appendChild(banner);
      overlays.push(banner);
    };

    // Heuristic for skipping CSS-in-JS hashed class names like "css-1a2b3c" or "_2x4hG_".
    // These change between builds and produce brittle, ugly selectors.
    function isLikelyHashedClass(c) {
      if (!c) return true;
      if (/^(css|sc|emotion|jsx|module)-[\w-]{4,}$/i.test(c)) return true;
      if (/^_[\w-]{5,}$/.test(c)) return true;
      if (/^[a-z0-9]{6,}$/i.test(c) && /\d/.test(c)) return true;
      return false;
    }
    function buildSelectorSegment(el) {
      const tag = el.tagName.toLowerCase();
      let sel = tag;
      if (el.classList && el.classList.length > 0) {
        const classes = [...el.classList].filter(c => !c.startsWith('impeccable-') && !isLikelyHashedClass(c)).slice(0, 2);
        if (classes.length > 0) {
          sel += '.' + classes.map(c => CSS.escape(c)).join('.');
        }
      }

      // Disambiguate among siblings only if the parent has multiple matches
      const parent = el.parentElement;
      if (parent) {
        try {
          const matching = parent.querySelectorAll(':scope > ' + sel);
          if (matching.length > 1) {
            const sameType = [...parent.children].filter(c => c.tagName === el.tagName);
            const idx = sameType.indexOf(el) + 1;
            sel += `:nth-of-type(${idx})`;
          }
        } catch {
          const idx = [...parent.children].indexOf(el) + 1;
          sel = `${tag}:nth-child(${idx})`;
        }
      }
      return sel;
    }
    function generateSelector(el) {
      if (el === document.body) return 'body';
      if (el === document.documentElement) return 'html';
      if (el.id) return '#' + CSS.escape(el.id);
      const parts = [];
      let current = el;
      let depth = 0;
      const MAX_DEPTH = 10;
      while (current && current !== document.body && current !== document.documentElement && depth < MAX_DEPTH) {
        parts.unshift(buildSelectorSegment(current));

        // Anchor on an ancestor's ID and stop walking up
        if (current.id) {
          parts[0] = '#' + CSS.escape(current.id);
          break;
        }

        // Stop as soon as the partial selector uniquely identifies the target
        const trySelector = parts.join(' > ');
        try {
          const matches = document.querySelectorAll(trySelector);
          if (matches.length === 1 && matches[0] === el) {
            return trySelector;
          }
        } catch {/* invalid selector — keep walking */}
        current = current.parentElement;
        depth++;
      }
      return parts.join(' > ');
    }
    function getDirectText(el) {
      return [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent || '').join('');
    }
    function getDirectTextRect(el) {
      const rects = [];
      for (const node of el.childNodes) {
        if (node.nodeType !== 3 || !(node.textContent || '').trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) {
          if (rect.width >= 1 && rect.height >= 1) rects.push(rect);
        }
        range.detach?.();
      }
      if (rects.length === 0) return null;
      const left = Math.min(...rects.map(r => r.left));
      const top = Math.min(...rects.map(r => r.top));
      const right = Math.max(...rects.map(r => r.right));
      const bottom = Math.max(...rects.map(r => r.bottom));
      return {
        left,
        top,
        right,
        bottom,
        width: right - left,
        height: bottom - top,
        x: left,
        y: top
      };
    }
    function collectVisualContrastReasons(el, style) {
      const reasons = new Set();
      const bgClip = style.webkitBackgroundClip || style.backgroundClip || '';
      const ownBgImage = style.backgroundImage || '';
      if (bgClip === 'text' && ownBgImage && ownBgImage !== 'none') {
        reasons.add('background-clip text');
      }
      if (style.textShadow && style.textShadow !== 'none') reasons.add('text shadow');
      let current = el;
      while (current && current.nodeType === 1) {
        const tag = current.tagName?.toLowerCase();
        const currentStyle = getComputedStyle(current);
        const bgImage = currentStyle.backgroundImage || '';
        const isDocumentSurface = tag === 'body' || tag === 'html';
        if (!isDocumentSurface && bgImage && bgImage !== 'none') {
          if (/url\s*\(/i.test(bgImage)) reasons.add('image background');
          if (/gradient/i.test(bgImage)) reasons.add('gradient background');
        }
        if (parseFloat(currentStyle.opacity) < 0.99) reasons.add('opacity stack');
        if (currentStyle.mixBlendMode && currentStyle.mixBlendMode !== 'normal') reasons.add('blend mode');
        if (currentStyle.filter && currentStyle.filter !== 'none') reasons.add('filter');
        if (currentStyle.backdropFilter && currentStyle.backdropFilter !== 'none') reasons.add('backdrop filter');
        const solidBg = parseRgb(currentStyle.backgroundColor);
        if (solidBg && solidBg.a >= 0.95 && (!bgImage || bgImage === 'none')) break;
        current = current.parentElement;
      }
      const sampleRect = getDirectTextRect(el) || el.getBoundingClientRect();
      if (sampleRect && document.elementsFromPoint) {
        const points = [[sampleRect.left + sampleRect.width / 2, sampleRect.top + sampleRect.height / 2], [sampleRect.left + Math.min(sampleRect.width - 1, Math.max(1, sampleRect.width * 0.25)), sampleRect.top + sampleRect.height / 2], [sampleRect.left + Math.min(sampleRect.width - 1, Math.max(1, sampleRect.width * 0.75)), sampleRect.top + sampleRect.height / 2]];
        for (const [x, y] of points) {
          if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) continue;
          const stack = document.elementsFromPoint(x, y);
          const selfIndex = stack.findIndex(node => node === el || el.contains(node) || node.contains?.(el));
          if (selfIndex < 0) continue;
          for (const node of stack.slice(selfIndex + 1)) {
            const nodeTag = node.tagName?.toLowerCase();
            if (nodeTag === 'img' || nodeTag === 'picture' || nodeTag === 'video' || nodeTag === 'canvas' || nodeTag === 'svg') {
              reasons.add(`${nodeTag} underlay`);
              break;
            }
          }
        }
      }
      return [...reasons];
    }
    function collectVisualContrastCandidates(options = {}) {
      const maxCandidates = Number.isFinite(options.maxCandidates) ? options.maxCandidates : 12;
      const candidates = [];
      for (const el of document.querySelectorAll('*')) {
        if (candidates.length >= maxCandidates) break;
        if (el.closest('.impeccable-overlay, .impeccable-label, .impeccable-banner, .impeccable-tooltip')) continue;
        if (el.closest('[id^="impeccable-live-"]')) continue;
        if (el === document.body || el === document.documentElement) continue;
        if (!isRenderedForBrowserRule(el)) continue;
        const tag = el.tagName.toLowerCase();
        const style = getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        const directText = getDirectText(el);
        const hasDirectText = directText.trim().length > 0;
        if (!hasDirectText || isEmojiOnlyText(directText)) continue;
        const bgColor = readOwnBackgroundColor(el, style);
        const isStyledButton = (tag === 'a' || tag === 'button') && bgColor && bgColor.a > 0.5;
        if (SAFE_TAGS.has(tag) && !isStyledButton) continue;
        const rect = getDirectTextRect(el) || el.getBoundingClientRect();
        if (!rect || rect.width < 4 || rect.height < 4) continue;
        const reasons = collectVisualContrastReasons(el, style);
        if (reasons.length === 0) continue;
        const textColor = parseRgb(style.color);
        const fontSize = parseFloat(style.fontSize) || 16;
        const fontWeight = parseInt(style.fontWeight) || 400;
        const isLargeText = fontSize >= WCAG_LARGE_TEXT_PX || fontSize >= WCAG_LARGE_BOLD_TEXT_PX && fontWeight >= 700;
        const threshold = isLargeText ? 3.0 : 4.5;
        const clip = {
          x: Math.max(0, Math.floor(rect.left + window.scrollX - 2)),
          y: Math.max(0, Math.floor(rect.top + window.scrollY - 2)),
          width: Math.max(1, Math.ceil(rect.width + 4)),
          height: Math.max(1, Math.ceil(rect.height + 4))
        };
        candidates.push({
          selector: generateSelector(el),
          tagName: tag,
          text: directText.trim().replace(/\s+/g, ' ').slice(0, 80),
          threshold,
          reasons,
          clip,
          textColor,
          preferRenderedForeground: !textColor || textColor.a < 0.99 || reasons.some(reason => reason === 'opacity stack' || reason === 'blend mode' || reason === 'filter' || reason === 'backdrop filter' || reason === 'background-clip text'),
          backgroundClipText: reasons.includes('background-clip text')
        });
      }
      return candidates;
    }
    const visualContrastImageCache = new Map();
    const visualContrastRasterCache = new WeakMap();
    function clampByte(value) {
      return Math.max(0, Math.min(255, Math.round(value)));
    }
    function blendRgba(fg, bg) {
      if (!fg) return bg || null;
      if (!bg || fg.a == null || fg.a >= 0.999) {
        return {
          r: clampByte(fg.r),
          g: clampByte(fg.g),
          b: clampByte(fg.b),
          a: fg.a == null ? 1 : fg.a
        };
      }
      const alpha = Math.max(0, Math.min(1, fg.a));
      return {
        r: clampByte(fg.r * alpha + bg.r * (1 - alpha)),
        g: clampByte(fg.g * alpha + bg.g * (1 - alpha)),
        b: clampByte(fg.b * alpha + bg.b * (1 - alpha)),
        a: 1
      };
    }
    function pickWorstContrastColor(textColor, colors) {
      const usable = (colors || []).filter(Boolean);
      if (!usable.length) return null;
      let worst = usable[0];
      let worstRatio = contrastRatio(textColor, worst);
      for (const color of usable.slice(1)) {
        const ratio = contrastRatio(textColor, color);
        if (ratio < worstRatio) {
          worst = color;
          worstRatio = ratio;
        }
      }
      return worst;
    }
    function firstCssUrl(value) {
      const match = String(value || '').match(/url\((?:"([^"]+)"|'([^']+)'|([^)]*))\)/i);
      if (!match) return '';
      return (match[1] || match[2] || match[3] || '').trim();
    }
    function getLayerValue(value, index = 0) {
      return String(value || '').split(',')[index]?.trim() || '';
    }
    function parsePositionToken(token, container, painted) {
      if (!token || token === 'center') return (container - painted) / 2;
      if (token === 'left' || token === 'top') return 0;
      if (token === 'right' || token === 'bottom') return container - painted;
      if (/%$/.test(token)) {
        const pct = parseFloat(token) / 100;
        return (container - painted) * pct;
      }
      if (/px$/.test(token)) return parseFloat(token) || 0;
      return (container - painted) / 2;
    }
    function parsePositionPair(positionValue) {
      const tokens = String(positionValue || '50% 50%').trim().split(/\s+/).filter(Boolean);
      const first = tokens[0] || '50%';
      if (tokens.length < 2) {
        if (first === 'top' || first === 'bottom') return ['50%', first];
        return [first, '50%'];
      }
      return [first, tokens[1] || '50%'];
    }
    function resolvePaintedImageRect(containerRect, image, sizeValue, positionValue) {
      const intrinsicWidth = image.naturalWidth || image.videoWidth || image.width || 1;
      const intrinsicHeight = image.naturalHeight || image.videoHeight || image.height || 1;
      let paintedWidth = intrinsicWidth;
      let paintedHeight = intrinsicHeight;
      const size = String(sizeValue || 'auto').trim();
      if (size === 'cover' || size === 'contain') {
        const scale = size === 'cover' ? Math.max(containerRect.width / intrinsicWidth, containerRect.height / intrinsicHeight) : Math.min(containerRect.width / intrinsicWidth, containerRect.height / intrinsicHeight);
        paintedWidth = intrinsicWidth * scale;
        paintedHeight = intrinsicHeight * scale;
      } else if (size && size !== 'auto') {
        const parts = size.split(/\s+/);
        const widthToken = parts[0];
        const heightToken = parts[1] || 'auto';
        if (/%$/.test(widthToken)) paintedWidth = containerRect.width * (parseFloat(widthToken) / 100);else if (/px$/.test(widthToken)) paintedWidth = parseFloat(widthToken) || paintedWidth;
        if (heightToken === 'auto') paintedHeight = paintedWidth * (intrinsicHeight / intrinsicWidth);else if (/%$/.test(heightToken)) paintedHeight = containerRect.height * (parseFloat(heightToken) / 100);else if (/px$/.test(heightToken)) paintedHeight = parseFloat(heightToken) || paintedHeight;
      }
      const [xToken, yToken] = parsePositionPair(positionValue);
      const positionX = parsePositionToken(xToken, containerRect.width, paintedWidth);
      const positionY = parsePositionToken(yToken, containerRect.height, paintedHeight);
      return {
        left: containerRect.left + positionX,
        top: containerRect.top + positionY,
        width: paintedWidth,
        height: paintedHeight,
        intrinsicWidth,
        intrinsicHeight
      };
    }
    function parseObjectPosition(positionValue) {
      return parsePositionPair(positionValue);
    }
    function resolveObjectImageRect(containerRect, image, style) {
      const intrinsicWidth = image.naturalWidth || image.videoWidth || image.width || 1;
      const intrinsicHeight = image.naturalHeight || image.videoHeight || image.height || 1;
      const fit = style.objectFit || 'fill';
      let paintedWidth = containerRect.width;
      let paintedHeight = containerRect.height;
      if (fit === 'contain' || fit === 'cover') {
        const scale = fit === 'cover' ? Math.max(containerRect.width / intrinsicWidth, containerRect.height / intrinsicHeight) : Math.min(containerRect.width / intrinsicWidth, containerRect.height / intrinsicHeight);
        paintedWidth = intrinsicWidth * scale;
        paintedHeight = intrinsicHeight * scale;
      } else if (fit === 'none') {
        paintedWidth = intrinsicWidth;
        paintedHeight = intrinsicHeight;
      } else if (fit === 'scale-down') {
        const containScale = Math.min(containerRect.width / intrinsicWidth, containerRect.height / intrinsicHeight, 1);
        paintedWidth = intrinsicWidth * containScale;
        paintedHeight = intrinsicHeight * containScale;
      }
      const [xToken, yToken] = parseObjectPosition(style.objectPosition);
      return {
        left: containerRect.left + parsePositionToken(xToken, containerRect.width, paintedWidth),
        top: containerRect.top + parsePositionToken(yToken, containerRect.height, paintedHeight),
        width: paintedWidth,
        height: paintedHeight,
        intrinsicWidth,
        intrinsicHeight
      };
    }
    function pointToImageSource(point, paintedRect) {
      if (point.x < paintedRect.left || point.y < paintedRect.top || point.x > paintedRect.left + paintedRect.width || point.y > paintedRect.top + paintedRect.height) {
        return null;
      }
      return {
        x: Math.max(0, Math.min(paintedRect.intrinsicWidth - 1, (point.x - paintedRect.left) / paintedRect.width * paintedRect.intrinsicWidth)),
        y: Math.max(0, Math.min(paintedRect.intrinsicHeight - 1, (point.y - paintedRect.top) / paintedRect.height * paintedRect.intrinsicHeight))
      };
    }
    async function loadVisualContrastImage(src) {
      if (!src) return null;
      if (visualContrastImageCache.has(src)) return visualContrastImageCache.get(src);
      const promise = new Promise(resolve => {
        const img = new Image();
        let settled = false;
        const finish = value => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve(value);
        };
        const timer = setTimeout(() => finish(null), 800);
        try {
          const absolute = new URL(src, location.href);
          if (absolute.origin !== location.origin && absolute.protocol !== 'data:' && absolute.protocol !== 'blob:') {
            img.crossOrigin = 'anonymous';
          }
        } catch {
          // Let the browser resolve unusual URLs itself.
        }
        img.onload = () => finish(img);
        img.onerror = () => finish(null);
        img.src = src;
      });
      visualContrastImageCache.set(src, promise);
      return promise;
    }
    function sampleDrawablePixel(drawable, sourcePoint) {
      if (visualContrastRasterCache.has(drawable)) {
        const cached = visualContrastRasterCache.get(drawable);
        if (!cached || !cached.ctx) return {
          status: 'unresolved',
          reason: cached?.reason || 'image sample failed'
        };
        try {
          const x = Math.max(0, Math.min(cached.width - 1, Math.floor(sourcePoint.x * cached.scaleX)));
          const y = Math.max(0, Math.min(cached.height - 1, Math.floor(sourcePoint.y * cached.scaleY)));
          const data = cached.ctx.getImageData(x, y, 1, 1).data;
          return {
            status: 'sampled',
            color: {
              r: data[0],
              g: data[1],
              b: data[2],
              a: data[3] / 255
            }
          };
        } catch (err) {
          return {
            status: 'unresolved',
            reason: /taint|cross-origin|Security/i.test(err?.message || '') ? 'tainted image' : 'image sample failed'
          };
        }
      }
      const canvas = document.createElement('canvas');
      const intrinsicWidth = drawable.naturalWidth || drawable.videoWidth || drawable.width || 1;
      const intrinsicHeight = drawable.naturalHeight || drawable.videoHeight || drawable.height || 1;
      const maxRasterSide = 640;
      const scale = Math.min(1, maxRasterSide / Math.max(intrinsicWidth, intrinsicHeight));
      canvas.width = Math.max(1, Math.round(intrinsicWidth * scale));
      canvas.height = Math.max(1, Math.round(intrinsicHeight * scale));
      const ctx = canvas.getContext('2d', {
        willReadFrequently: true
      });
      if (!ctx) return {
        status: 'unresolved',
        reason: 'canvas unavailable'
      };
      try {
        ctx.drawImage(drawable, 0, 0, canvas.width, canvas.height);
        const cached = {
          ctx,
          width: canvas.width,
          height: canvas.height,
          scaleX: canvas.width / intrinsicWidth,
          scaleY: canvas.height / intrinsicHeight
        };
        visualContrastRasterCache.set(drawable, cached);
        const x = Math.max(0, Math.min(cached.width - 1, Math.floor(sourcePoint.x * cached.scaleX)));
        const y = Math.max(0, Math.min(cached.height - 1, Math.floor(sourcePoint.y * cached.scaleY)));
        const data = ctx.getImageData(x, y, 1, 1).data;
        return {
          status: 'sampled',
          color: {
            r: data[0],
            g: data[1],
            b: data[2],
            a: data[3] / 255
          }
        };
      } catch (err) {
        const reason = /taint|cross-origin|Security/i.test(err?.message || '') ? 'tainted image' : 'image sample failed';
        visualContrastRasterCache.set(drawable, {
          ctx: null,
          reason
        });
        return {
          status: 'unresolved',
          reason
        };
      }
    }
    async function sampleCssBackground(el, style, point, textColor) {
      const rect = el.getBoundingClientRect();
      const bgImage = style.backgroundImage || '';
      if (bgImage && bgImage !== 'none') {
        if (/gradient/i.test(bgImage)) {
          const color = pickWorstContrastColor(textColor, parseGradientColors(bgImage));
          if (color) return {
            status: 'sampled',
            color,
            method: 'analytic-gradient'
          };
        }
        if (/url\s*\(/i.test(bgImage)) {
          const img = await loadVisualContrastImage(firstCssUrl(bgImage));
          if (!img) return {
            status: 'unresolved',
            reason: 'image unavailable'
          };
          const paintedRect = resolvePaintedImageRect(rect, img, getLayerValue(style.backgroundSize) || 'auto', getLayerValue(style.backgroundPosition) || '50% 50%');
          const sourcePoint = pointToImageSource(point, paintedRect);
          if (!sourcePoint) return {
            status: 'unresolved',
            reason: 'point outside background image'
          };
          const sample = sampleDrawablePixel(img, sourcePoint);
          if (sample.status === 'sampled') return {
            ...sample,
            method: 'canvas-background-image'
          };
          return sample;
        }
      }
      const bg = parseRgb(style.backgroundColor);
      if (bg && bg.a > 0.05) return {
        status: 'sampled',
        color: bg,
        method: 'solid-background'
      };
      return {
        status: 'unresolved',
        reason: 'no readable background'
      };
    }
    async function sampleImageElement(img, point) {
      const rect = img.getBoundingClientRect();
      const style = getComputedStyle(img);
      const paintedRect = resolveObjectImageRect(rect, img, style);
      const sourcePoint = pointToImageSource(point, paintedRect);
      if (!sourcePoint) return {
        status: 'unresolved',
        reason: 'point outside image'
      };
      const sample = sampleDrawablePixel(img, sourcePoint);
      if (sample.status === 'sampled') return {
        ...sample,
        method: 'canvas-img-underlay'
      };
      if (img.currentSrc || img.src) {
        const loaded = await loadVisualContrastImage(img.currentSrc || img.src);
        if (loaded) {
          const loadedRect = {
            ...paintedRect,
            intrinsicWidth: loaded.naturalWidth || loaded.width || paintedRect.intrinsicWidth,
            intrinsicHeight: loaded.naturalHeight || loaded.height || paintedRect.intrinsicHeight
          };
          const loadedPoint = pointToImageSource(point, loadedRect);
          if (loadedPoint) {
            const loadedSample = sampleDrawablePixel(loaded, loadedPoint);
            if (loadedSample.status === 'sampled') return {
              ...loadedSample,
              method: 'canvas-img-underlay'
            };
          }
        }
      }
      return sample;
    }
    function textSamplePoints(rect) {
      const insetX = Math.min(12, Math.max(1, rect.width * 0.12));
      const insetY = Math.min(8, Math.max(1, rect.height * 0.22));
      const xs = rect.width < 28 ? [rect.left + rect.width / 2] : [rect.left + insetX, rect.left + rect.width / 2, rect.right - insetX];
      const ys = rect.height < 22 ? [rect.top + rect.height / 2] : [rect.top + insetY, rect.top + rect.height / 2, rect.bottom - insetY];
      const points = [];
      for (const y of ys) {
        for (const x of xs) {
          if (x >= 0 && y >= 0 && x <= window.innerWidth && y <= window.innerHeight) points.push({
            x,
            y
          });
        }
      }
      return points;
    }
    async function sampleVisualBackgroundAtPoint(el, point, textColor, depth = 0) {
      if (depth > 8) {
        return {
          status: 'unresolved',
          reason: 'background stack too deep'
        };
      }
      const stack = typeof document.elementsFromPoint === 'function' ? document.elementsFromPoint(point.x, point.y) : [];
      const selfIndex = stack.findIndex(node => node === el || el.contains(node));
      const nodes = selfIndex >= 0 ? stack.slice(selfIndex) : [el, ...stack];
      const unresolved = [];
      for (const node of nodes) {
        if (!node || node.nodeType !== 1) continue;
        if (node.closest?.('.impeccable-overlay, .impeccable-label, .impeccable-banner, .impeccable-tooltip')) continue;
        const tag = node.tagName?.toLowerCase();
        if (tag === 'img') {
          const sample = await sampleImageElement(node, point);
          if (sample.status === 'sampled') return sample;
          unresolved.push(sample.reason);
          continue;
        }
        if (tag === 'canvas' || tag === 'video') {
          const rect = node.getBoundingClientRect();
          const sourcePoint = pointToImageSource(point, {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            intrinsicWidth: node.width || node.videoWidth || rect.width,
            intrinsicHeight: node.height || node.videoHeight || rect.height
          });
          if (sourcePoint) {
            const sample = sampleDrawablePixel(node, sourcePoint);
            if (sample.status === 'sampled') return {
              ...sample,
              method: `canvas-${tag}-underlay`
            };
            unresolved.push(sample.reason);
          }
          continue;
        }
        const style = getComputedStyle(node);
        const sample = await sampleCssBackground(node, style, point, textColor);
        if (sample.status === 'sampled') {
          if (!sample.color || sample.color.a == null || sample.color.a >= 0.95) return sample;
          const under = await sampleVisualBackgroundAtPoint(node.parentElement || document.body, point, textColor, depth + 1);
          if (under.status === 'sampled') {
            return {
              status: 'sampled',
              color: blendRgba(sample.color, under.color),
              method: `${sample.method}+alpha`
            };
          }
          return sample;
        }
        unresolved.push(sample.reason);
      }
      return {
        status: 'unresolved',
        reason: [...new Set(unresolved.filter(Boolean))].slice(0, 3).join(', ') || 'no readable visual background'
      };
    }
    async function analyzeVisualContrastCandidate(candidate) {
      let el;
      try {
        el = document.querySelector(candidate.selector);
      } catch {
        return {
          ...candidate,
          status: 'unresolved',
          confidence: 'none',
          reason: 'stale selector'
        };
      }
      if (!el) return {
        ...candidate,
        status: 'unresolved',
        confidence: 'none',
        reason: 'missing element'
      };
      if (!isRenderedForBrowserRule(el)) return {
        ...candidate,
        status: 'unresolved',
        confidence: 'none',
        reason: 'hidden element'
      };
      const blockingReason = (candidate.reasons || []).find(reason => reason === 'background-clip text' || reason === 'blend mode' || reason === 'filter' || reason === 'backdrop filter' || reason === 'opacity stack' || reason === 'text shadow');
      if (blockingReason) {
        return {
          ...candidate,
          status: 'unresolved',
          confidence: 'none',
          reason: `${blockingReason} needs screenshot pixels`
        };
      }
      const style = getComputedStyle(el);
      const textColor = parseRgb(style.color) || candidate.textColor;
      if (!textColor) return {
        ...candidate,
        status: 'unresolved',
        confidence: 'none',
        reason: 'unreadable text color'
      };
      const rect = getDirectTextRect(el) || el.getBoundingClientRect();
      if (!rect || rect.width < 4 || rect.height < 4) {
        return {
          ...candidate,
          status: 'unresolved',
          confidence: 'none',
          reason: 'missing text rect'
        };
      }
      const points = textSamplePoints(rect);
      if (points.length === 0) {
        return {
          ...candidate,
          status: 'unresolved',
          confidence: 'none',
          reason: 'text outside viewport'
        };
      }
      const ratios = [];
      const methods = new Set();
      const unresolved = [];
      for (const point of points) {
        const sample = await sampleVisualBackgroundAtPoint(el, point, textColor);
        if (sample.status !== 'sampled' || !sample.color) {
          unresolved.push(sample.reason);
          continue;
        }
        const fg = blendRgba(textColor, sample.color);
        ratios.push(contrastRatio(fg, sample.color));
        if (sample.method) methods.add(sample.method);
      }
      if (ratios.length < Math.min(3, points.length)) {
        return {
          ...candidate,
          status: 'unresolved',
          confidence: 'none',
          samples: ratios.length,
          reason: [...new Set(unresolved.filter(Boolean))].slice(0, 3).join(', ') || 'not enough readable samples'
        };
      }
      ratios.sort((a, b) => a - b);
      const pick = pct => ratios[Math.min(ratios.length - 1, Math.max(0, Math.floor(pct / 100 * ratios.length)))];
      const measuredRatio = pick(10);
      const medianRatio = pick(50);
      const status = measuredRatio < candidate.threshold ? 'fail' : 'pass';
      const method = [...methods].sort().join(', ') || 'browser-visual';
      const textLabel = candidate.text ? ` "${candidate.text}"` : '';
      const detail = `browser contrast ${measuredRatio.toFixed(1)}:1 median ${medianRatio.toFixed(1)}:1 (need ${candidate.threshold}:1) via ${method}${textLabel}`;
      return {
        ...candidate,
        status,
        confidence: method.includes('canvas-') ? 'high' : 'medium',
        method,
        ratio: measuredRatio,
        medianRatio,
        samples: ratios.length,
        finding: status === 'fail' ? {
          id: 'low-contrast',
          snippet: detail
        } : null
      };
    }
    function waitForVisualPaint() {
      return new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });
    }
    async function analyzeVisualContrast(options = {}) {
      const candidates = collectVisualContrastCandidates(options);
      const results = [];
      const shouldScrollOffscreen = options.scrollOffscreen === true;
      const restoreScroll = {
        x: window.scrollX,
        y: window.scrollY
      };
      for (const candidate of candidates) {
        if (shouldScrollOffscreen && (window.scrollX !== restoreScroll.x || window.scrollY !== restoreScroll.y)) {
          window.scrollTo(restoreScroll.x, restoreScroll.y);
          await waitForVisualPaint();
        }
        let result = await analyzeVisualContrastCandidate(candidate);
        if (shouldScrollOffscreen && result.status === 'unresolved' && result.reason === 'text outside viewport') {
          let el = null;
          try {
            el = document.querySelector(candidate.selector);
          } catch {
            el = null;
          }
          if (el && typeof el.scrollIntoView === 'function') {
            el.scrollIntoView({
              block: 'center',
              inline: 'nearest',
              behavior: 'instant'
            });
            await waitForVisualPaint();
            result = await analyzeVisualContrastCandidate(candidate);
          }
        }
        results.push(result);
      }
      if (shouldScrollOffscreen && (window.scrollX !== restoreScroll.x || window.scrollY !== restoreScroll.y)) {
        window.scrollTo(restoreScroll.x, restoreScroll.y);
      }
      return results;
    }
    function isElementHidden(el) {
      if (!el || el === document.body || el === document.documentElement) return false;
      if (typeof el.checkVisibility === 'function') return !el.checkVisibility({
        checkOpacity: false,
        checkVisibilityCSS: true
      });
      // Fallback: zero size or no offsetParent (covers display:none and detached subtrees)
      return el.offsetWidth === 0 && el.offsetHeight === 0;
    }
    function serializeFindings(allFindings) {
      return allFindings.map(({
        el,
        findings
      }) => ({
        selector: generateSelector(el),
        tagName: el.tagName?.toLowerCase() || 'unknown',
        rect: el !== document.body && el !== document.documentElement && el.getBoundingClientRect ? el.getBoundingClientRect().toJSON() : null,
        isPageLevel: el === document.body || el === document.documentElement,
        isHidden: isElementHidden(el),
        findings: findings.map(f => {
          const ap = ANTIPATTERNS.find(a => a.id === (f.type || f.id));
          return {
            type: f.type || f.id,
            category: ap ? ap.category : 'quality',
            severity: ap?.severity || 'warning',
            detail: f.detail || f.snippet,
            ignoreValue: f.ignoreValue || f.value || '',
            name: ap ? ap.name : f.type || f.id,
            description: ap ? ap.description : ''
          };
        })
      }));
    }
    const printSummary = function (allFindings) {
      if (allFindings.length === 0) {
        console.log('%c[impeccable] No anti-patterns found.', 'color: #22c55e; font-weight: bold');
        return;
      }
      console.group(`%c[impeccable] ${allFindings.length} anti-pattern${allFindings.length === 1 ? '' : 's'} found`, 'color: oklch(84% 0.19 80.46); font-weight: bold');
      for (const {
        el,
        findings
      } of allFindings) {
        for (const f of findings) {
          console.log(`%c${f.type || f.id}%c ${f.detail || f.snippet}`, 'color: oklch(84% 0.19 80.46); font-weight: bold', 'color: inherit', el);
        }
      }
      console.groupEnd();
    };
    function addBrowserFindings(groupMap, el, findings) {
      if (!findings || findings.length === 0) return;
      const existing = groupMap.get(el);
      if (existing) existing.push(...findings);else groupMap.set(el, [...findings]);
    }
    function browserFindingsFromMap(groupMap) {
      return [...groupMap.entries()].map(([el, findings]) => ({
        el,
        findings
      }));
    }
    const DESIGN_COLOR_TOLERANCE = 6;
    const DESIGN_RADIUS_TOLERANCE_PX = 0.5;
    const DESIGN_SKIP_TAGS = new Set(['head', 'title', 'meta', 'link', 'style', 'script', 'noscript', 'template', 'source']);
    function normalizeBrowserFontName(value) {
      return String(value || '').trim().replace(/^["']|["']$/g, '').replace(/\+/g, ' ').replace(/\s+/g, ' ').toLowerCase();
    }
    function browserPrimaryFont(stack) {
      if (!stack || /var\(/i.test(stack)) return '';
      return String(stack || '').split(',').map(normalizeBrowserFontName).find(font => font && !GENERIC_FONTS.has(font)) || '';
    }
    function browserDesignSystemConfig() {
      const raw = window.__IMPECCABLE_CONFIG__?.designSystem;
      if (!raw?.present) return null;
      const allowedFonts = new Set((raw.allowedFonts || []).map(normalizeBrowserFontName).filter(Boolean));
      const allowedColors = (raw.allowedColors || []).filter(color => color && Number.isFinite(color.r) && Number.isFinite(color.g) && Number.isFinite(color.b)).map(color => ({
        r: color.r,
        g: color.g,
        b: color.b
      }));
      const allowedRadii = (raw.allowedRadii || []).map(Number).filter(px => Number.isFinite(px));
      return {
        present: true,
        hasFonts: raw.hasFonts === true && allowedFonts.size > 0,
        allowedFonts,
        hasColors: raw.hasColors === true && allowedColors.length > 0,
        allowedColors,
        hasRadii: raw.hasRadii === true && allowedRadii.length > 0,
        allowedRadii,
        hasPillRadius: raw.hasPillRadius === true
      };
    }
    function browserColorsClose(a, b) {
      if (!a || !b) return false;
      return Math.max(Math.abs(a.r - b.r), Math.abs(a.g - b.g), Math.abs(a.b - b.b)) <= DESIGN_COLOR_TOLERANCE;
    }
    function isBrowserDesignColorAllowed(raw, designSystem) {
      if (!designSystem?.hasColors) return true;
      const text = String(raw || '').trim().toLowerCase();
      if (!text || text === 'transparent' || text === 'currentcolor' || text === 'inherit' || text === 'initial') return true;
      if (text.includes('var(')) return true;
      const parsed = parseAnyColor(text);
      if (!parsed) return true;
      if ((parsed.a ?? 1) <= 0.05) return true;
      return designSystem.allowedColors.some(color => browserColorsClose(parsed, color));
    }
    function isBrowserTransparentCss(value) {
      const text = String(value || '').trim().toLowerCase();
      if (!text || text === 'transparent') return true;
      const parsed = parseAnyColor(text);
      return parsed ? (parsed.a ?? 1) <= 0.05 : false;
    }
    function isBrowserDesignRadiusAllowed(raw, designSystem) {
      if (!designSystem?.hasRadii) return true;
      const text = String(raw || '').trim().toLowerCase();
      if (!text || text === '0' || text === 'none' || text === 'initial' || text === 'inherit') return true;
      if (text.includes('var(') || text.includes('%')) return true;
      const px = resolveLengthPx(text, 16);
      if (px == null || !Number.isFinite(px) || px <= DESIGN_RADIUS_TOLERANCE_PX) return true;
      if (designSystem.hasPillRadius && px >= 99) return true;
      return designSystem.allowedRadii.some(allowed => Math.abs(allowed - px) <= DESIGN_RADIUS_TOLERANCE_PX);
    }
    function browserRadiusTokens(value) {
      return String(value || '').replace(/\s*\/\s*/g, ' ').split(/\s+/).map(token => token.trim()).filter(Boolean);
    }
    function browserHasDirectText(el) {
      return [...(el.childNodes || [])].some(node => node.nodeType === 3 && node.textContent.trim().length > 0);
    }
    function browserSampleText(el) {
      const text = String(el.textContent || '').replace(/\s+/g, ' ').trim();
      return text ? ` "${text.slice(0, 40)}"` : '';
    }
    function shouldSkipDesignElement(el) {
      const tag = el.tagName?.toLowerCase?.() || '';
      return DESIGN_SKIP_TAGS.has(tag) || isElementHidden(el);
    }
    function checkElementDesignSystemDOM(el, designSystem, seen) {
      if (!designSystem?.present || shouldSkipDesignElement(el)) return [];
      const findings = [];
      const tag = el.tagName?.toLowerCase?.() || 'unknown';
      const style = getComputedStyle(el);
      if (designSystem.hasFonts && browserHasDirectText(el)) {
        const font = browserPrimaryFont(style.fontFamily || '');
        if (font && !designSystem.allowedFonts.has(font) && !seen.fonts.has(font)) {
          seen.fonts.add(font);
          findings.push({
            type: 'design-system-font',
            detail: `${tag}${browserSampleText(el)} uses ${font}; not declared in DESIGN.md typography`,
            ignoreValue: font
          });
        }
      }
      if (designSystem.hasColors) {
        const colorChecks = [];
        if (browserHasDirectText(el)) colorChecks.push(['text color', style.color]);
        if (!isBrowserTransparentCss(style.backgroundColor)) colorChecks.push(['background', style.backgroundColor]);
        for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
          if ((parseFloat(style[`border${side}Width`]) || 0) > 0) {
            colorChecks.push([`border-${side.toLowerCase()}`, style[`border${side}Color`]]);
          }
        }
        if ((parseFloat(style.outlineWidth) || 0) > 0) colorChecks.push(['outline', style.outlineColor]);
        for (const [kind, raw] of colorChecks) {
          const label = String(raw || '').trim().replace(/\s+/g, ' ');
          if (isBrowserDesignColorAllowed(label, designSystem)) continue;
          const key = `${kind}:${label}`;
          if (seen.colors.has(key)) continue;
          seen.colors.add(key);
          findings.push({
            type: 'design-system-color',
            detail: `${kind} ${label} on ${tag}${browserSampleText(el)} is outside DESIGN.md colors`,
            ignoreValue: label
          });
        }
      }
      if (designSystem.hasRadii) {
        for (const token of browserRadiusTokens(style.borderRadius || '')) {
          if (isBrowserDesignRadiusAllowed(token, designSystem)) continue;
          if (seen.radii.has(token)) continue;
          seen.radii.add(token);
          findings.push({
            type: 'design-system-radius',
            detail: `border-radius ${token} on ${tag}${browserSampleText(el)} is outside the DESIGN.md rounded scale`,
            ignoreValue: token
          });
        }
      }
      return findings;
    }
    function decodeBrowserGoogleFamily(value) {
      const family = String(value || '').split(':')[0].replace(/\+/g, ' ');
      try {
        return decodeURIComponent(family);
      } catch {
        return family;
      }
    }
    function checkBrowserDesignSystemSources(designSystem, seen) {
      if (!designSystem?.hasFonts) return [];
      const findings = [];
      for (const link of document.querySelectorAll('link[href*="fonts.googleapis.com/css"]')) {
        const href = link.getAttribute('href') || '';
        for (const match of href.matchAll(/[?&]family=([^&]+)/g)) {
          const display = decodeBrowserGoogleFamily(match[1]);
          const font = normalizeBrowserFontName(display);
          if (!font || designSystem.allowedFonts.has(font) || seen.fonts.has(font)) continue;
          seen.fonts.add(font);
          findings.push({
            type: 'design-system-font',
            detail: `Google Fonts: ${display} is not declared in DESIGN.md typography`,
            ignoreValue: display
          });
        }
      }
      return findings;
    }
    function collectBrowserFindings() {
      const groupMap = new Map();
      const _disabled = EXTENSION_MODE ? window.__IMPECCABLE_CONFIG__?.disabledRules || [] : [];
      const _ruleOk = id => !_disabled.length || !_disabled.includes(id);
      const designSystem = browserDesignSystemConfig();
      const designSeen = {
        fonts: new Set(),
        colors: new Set(),
        radii: new Set()
      };
      // Note: provider-gated rules (--gpt / --gemini) are NOT filtered here. In a
      // real browser env (detector page, live overlay, extension) running every
      // check is free, so we always surface them; the gating is purely a CLI
      // output concern, applied in the Node engines' detect* return paths.

      for (const el of document.querySelectorAll('*')) {
        // Skip impeccable's own elements and any descendants (overlays, labels, banner, nav buttons)
        if (el.closest('.impeccable-overlay, .impeccable-label, .impeccable-banner, .impeccable-tooltip')) continue;
        // Skip browser extension elements (Claude, etc.)
        const elId = el.id || '';
        if (elId.startsWith('claude-') || elId.startsWith('cic-')) continue;
        // Skip the impeccable live-mode overlay (highlight, tooltip, bar, picker, toast).
        // These are inspector chrome, not part of the user's design.
        if (el.closest('[id^="impeccable-live-"]')) continue;
        // Skip html/body -- page-level findings go in the banner, not a full-page overlay
        if (el === document.body || el === document.documentElement) continue;
        const findings = [...checkElementBordersDOM(el).map(f => ({
          type: f.id,
          detail: f.snippet
        })), ...checkElementColorsDOM(el).map(f => ({
          type: f.id,
          detail: f.snippet
        })), ...checkElementMotionDOM(el).map(f => ({
          type: f.id,
          detail: f.snippet
        })), ...checkElementGlowDOM(el).map(f => ({
          type: f.id,
          detail: f.snippet
        })), ...checkElementAIPaletteDOM(el).map(f => ({
          type: f.id,
          detail: f.snippet
        })), ...checkElementIconTileDOM(el).map(f => ({
          type: f.id,
          detail: f.snippet
        })), ...checkElementItalicSerifDOM(el).map(f => ({
          type: f.id,
          detail: f.snippet
        })), ...checkElementQualityDOM(el).map(f => ({
          type: f.id,
          detail: f.snippet
        })), ...checkElementOversizedH1DOM(el).map(f => ({
          type: f.id,
          detail: f.snippet
        })), ...checkElementClippedOverflowDOM(el).map(f => ({
          type: f.id,
          detail: f.snippet
        })), ...checkElementGptBorderShadowDOM(el).map(f => ({
          type: f.id,
          detail: f.snippet
        })), ...checkElementTextOverflowDOM(el).map(f => ({
          type: f.id,
          detail: f.snippet
        })), ...checkElementDesignSystemDOM(el, designSystem, designSeen)].filter(f => _ruleOk(f.type));
        addBrowserFindings(groupMap, el, findings);

        // Hero eyebrow: the offending element is the eyebrow above the heading,
        // not the heading itself — highlight the previous sibling instead.
        const eyebrowFindings = checkElementHeroEyebrowDOM(el).map(f => ({
          type: f.id,
          detail: f.snippet
        })).filter(f => _ruleOk(f.type));
        if (eyebrowFindings.length > 0 && el.previousElementSibling) {
          addBrowserFindings(groupMap, el.previousElementSibling, eyebrowFindings);
        }
      }
      const pageLevelFindings = [];
      const designSourceFindings = checkBrowserDesignSystemSources(designSystem, designSeen).filter(f => _ruleOk(f.type));
      if (designSourceFindings.length > 0) {
        pageLevelFindings.push(...designSourceFindings);
        addBrowserFindings(groupMap, document.body, designSourceFindings);
      }
      const typoFindings = checkTypography().filter(f => _ruleOk(f.type));
      if (typoFindings.length > 0) {
        pageLevelFindings.push(...typoFindings);
        addBrowserFindings(groupMap, document.body, typoFindings);
      }
      const sectionKickerFindings = checkRepeatedSectionKickersDOM().map(f => ({
        type: f.id,
        detail: f.snippet
      })).filter(f => _ruleOk(f.type));
      if (sectionKickerFindings.length > 0) {
        pageLevelFindings.push(...sectionKickerFindings);
        addBrowserFindings(groupMap, document.body, sectionKickerFindings);
      }
      const layoutFindings = checkLayout().filter(f => _ruleOk(f.type));
      for (const f of layoutFindings) {
        const el = f.el || document.body;
        addBrowserFindings(groupMap, el, [{
          type: f.type,
          detail: f.detail || f.snippet
        }]);
      }

      // Page-level quality checks (headings, etc.)
      const qualityFindings = checkPageQualityDOM().filter(f => _ruleOk(f.type));
      if (qualityFindings.length > 0) {
        pageLevelFindings.push(...qualityFindings);
        addBrowserFindings(groupMap, document.body, qualityFindings);
      }
      const creamFindings = checkCreamPalette(document).map(f => ({
        type: f.id,
        detail: f.snippet
      })).filter(f => _ruleOk(f.type));
      if (creamFindings.length > 0) {
        pageLevelFindings.push(...creamFindings);
        addBrowserFindings(groupMap, document.body, creamFindings);
      }

      // Regex-on-HTML checks (shared with Node)
      // Clone the document and strip impeccable-live overlay nodes before the
      // regex scan, so the inspector's own inline styles (transitions on top/
      // left/width/height, etc.) don't register as page anti-patterns.
      const docClone = document.documentElement.cloneNode(true);
      for (const node of docClone.querySelectorAll('[id^="impeccable-live-"]')) {
        node.remove();
      }
      const htmlPatternFindings = checkHtmlPatterns(docClone.outerHTML);
      if (htmlPatternFindings.length > 0) {
        const mapped = htmlPatternFindings.map(f => ({
          type: f.id,
          detail: f.snippet
        })).filter(f => _ruleOk(f.type));
        pageLevelFindings.push(...mapped);
        addBrowserFindings(groupMap, document.body, mapped);
      }
      return {
        groupMap,
        allFindings: browserFindingsFromMap(groupMap),
        pageLevelFindings
      };
    }
    function shouldRunVisualContrast(options = {}) {
      return options.visualContrast === true || window.__IMPECCABLE_CONFIG__?.visualContrast === true;
    }
    function visualContrastOptions(options = {}) {
      const config = window.__IMPECCABLE_CONFIG__ || {};
      const scrollOffscreen = typeof options.scrollOffscreen === 'boolean' ? options.scrollOffscreen : typeof options.visualContrastScrollOffscreen === 'boolean' ? options.visualContrastScrollOffscreen : typeof config.visualContrastScrollOffscreen === 'boolean' ? config.visualContrastScrollOffscreen : false;
      return {
        ...options,
        maxCandidates: Number.isFinite(options.visualContrastMaxCandidates) ? options.visualContrastMaxCandidates : Number.isFinite(options.maxCandidates) ? options.maxCandidates : Number.isFinite(config.visualContrastMaxCandidates) ? config.visualContrastMaxCandidates : undefined,
        scrollOffscreen
      };
    }
    let lastVisualContrastAnalyses = [];
    let lazyVisualContrastObserver = null;
    let lazyVisualContrastPending = new WeakMap();
    const lazyVisualContrastResolving = new WeakSet();
    let scanGeneration = 0;
    function rememberVisualContrastAnalysis(result) {
      if (!result?.selector) {
        lastVisualContrastAnalyses.push(result);
        return;
      }
      const idx = lastVisualContrastAnalyses.findIndex(item => item.selector === result.selector);
      if (idx >= 0) lastVisualContrastAnalyses[idx] = result;else lastVisualContrastAnalyses.push(result);
    }
    function disconnectLazyVisualContrastObserver() {
      if (lazyVisualContrastObserver) {
        lazyVisualContrastObserver.disconnect();
        lazyVisualContrastObserver = null;
      }
      lazyVisualContrastPending = new WeakMap();
    }
    function addVisualContrastResult(groupMap, result, options = {}) {
      if (result.status !== 'fail' || !result.finding || !result.selector) return false;
      let el = null;
      try {
        el = document.querySelector(result.selector);
      } catch {
        el = null;
      }
      if (!el) return false;
      const findingType = result.finding.type || result.finding.id || 'low-contrast';
      const existing = groupMap.get(el) || [];
      if (existing.some(f => (f.type || f.id) === findingType)) return false;
      addBrowserFindings(groupMap, el, [{
        type: findingType,
        detail: result.finding.detail || result.finding.snippet
      }]);
      if (options.decorate && el !== document.body && el !== document.documentElement) {
        highlight(el, groupMap.get(el) || []);
      }
      return true;
    }
    function scanResultMeta(options = {}) {
      const scanId = options.scanId;
      if (typeof scanId !== 'string' && typeof scanId !== 'number') return {};
      return {
        scanId: String(scanId)
      };
    }
    function postSerializedFindings(groupMap, options = {}) {
      if (!EXTENSION_MODE) return;
      const allFindings = browserFindingsFromMap(groupMap);
      window.postMessage({
        source: 'impeccable-results',
        findings: serializeFindings(allFindings),
        count: allFindings.length,
        ...scanResultMeta(options)
      }, '*');
    }
    function postExtensionError(err) {
      if (!EXTENSION_MODE) return;
      window.postMessage({
        source: 'impeccable-error',
        message: err?.message || String(err)
      }, '*');
    }
    function reportVisualContrastError(err, detail = {}) {
      window.dispatchEvent(new CustomEvent('impeccable-visual-contrast-error', {
        detail: {
          ...detail,
          message: err?.message || String(err)
        }
      }));
      if (EXTENSION_MODE) {
        postExtensionError(err);
      } else {
        console.warn('[impeccable] visual contrast scan failed', err);
      }
    }
    function scheduleLazyVisualContrast(groupMap, analyses, options = {}, runtime = {}) {
      disconnectLazyVisualContrastObserver();
      if (options.visualContrastLazy === false || options.scrollOffscreen !== false) return;
      if (typeof IntersectionObserver === 'undefined') return;
      const unresolved = (analyses || []).filter(result => result?.status === 'unresolved' && result.reason === 'text outside viewport' && result.selector);
      if (unresolved.length === 0) return;
      const generation = runtime.generation || scanGeneration;
      lazyVisualContrastObserver = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          const candidate = lazyVisualContrastPending.get(el);
          if (!candidate || lazyVisualContrastResolving.has(el)) continue;
          lazyVisualContrastObserver?.unobserve(el);
          lazyVisualContrastPending.delete(el);
          lazyVisualContrastResolving.add(el);
          waitForVisualPaint().then(() => analyzeVisualContrastCandidate(candidate)).then(result => {
            if (generation !== scanGeneration) return;
            rememberVisualContrastAnalysis(result);
            const added = addVisualContrastResult(groupMap, result, {
              decorate: true
            });
            if (added) {
              postSerializedFindings(groupMap, options);
              window.dispatchEvent(new CustomEvent('impeccable-visual-contrast-resolved', {
                detail: {
                  selector: result.selector,
                  status: result.status,
                  finding: result.finding || null
                }
              }));
            }
          }).catch(err => {
            reportVisualContrastError(err, {
              selector: candidate.selector
            });
          }).finally(() => {
            lazyVisualContrastResolving.delete(el);
          });
        }
      }, {
        threshold: 0.5
      });
      for (const candidate of unresolved) {
        let el = null;
        try {
          el = document.querySelector(candidate.selector);
        } catch {
          el = null;
        }
        if (!el) continue;
        lazyVisualContrastPending.set(el, candidate);
        lazyVisualContrastObserver.observe(el);
      }
    }
    async function addVisualContrastFindings(groupMap, options = {}, runtime = {}) {
      if (!shouldRunVisualContrast(options)) {
        lastVisualContrastAnalyses = [];
        disconnectLazyVisualContrastObserver();
        return [];
      }
      const resolvedOptions = visualContrastOptions(options);
      const analyses = await analyzeVisualContrast(resolvedOptions);
      if (runtime.generation && runtime.generation !== scanGeneration) return analyses;
      lastVisualContrastAnalyses = analyses;
      for (const result of analyses) {
        addVisualContrastResult(groupMap, result, {
          decorate: runtime.decorate
        });
      }
      if (runtime.decorate || runtime.scheduleLazy) scheduleLazyVisualContrast(groupMap, analyses, resolvedOptions, runtime);
      return analyses;
    }
    async function collectBrowserFindingsAsync(options = {}, runtime = {}) {
      const collected = collectBrowserFindings();
      await addVisualContrastFindings(collected.groupMap, options, runtime);
      return {
        ...collected,
        allFindings: browserFindingsFromMap(collected.groupMap),
        visualContrastAnalyses: lastVisualContrastAnalyses
      };
    }
    function clearOverlays() {
      scanGeneration += 1;
      disconnectLazyVisualContrastObserver();
      for (const o of [...overlays]) detachOverlay(o);
      overlays.length = 0;
      visibilityObserver.disconnect();
      overlayIndex = 0;
    }
    function renderBrowserFindings(collected, options = {}) {
      const {
        allFindings,
        pageLevelFindings
      } = collected;
      for (const {
        el,
        findings
      } of allFindings) {
        if (el === document.body || el === document.documentElement) continue;
        highlight(el, findings);
      }
      if (pageLevelFindings.length > 0) {
        showPageBanner(pageLevelFindings);
      }
      if (!EXTENSION_MODE) printSummary(allFindings);

      // In extension mode, post serialized results for the DevTools panel
      if (EXTENSION_MODE) {
        window.postMessage({
          source: 'impeccable-results',
          findings: serializeFindings(allFindings),
          count: allFindings.length,
          ...scanResultMeta(options)
        }, '*');
      }

      // After this scan completes, all subsequent reveals are instant (no stagger, no animation)
      setTimeout(() => {
        firstScanDone = true;
      }, 1000);
      return allFindings;
    }
    let firstScanDone = false;
    const scan = function (options = {}) {
      clearOverlays();
      const generation = scanGeneration;
      const collected = collectBrowserFindings();
      const allFindings = renderBrowserFindings(collected, options);
      if (shouldRunVisualContrast(options)) {
        addVisualContrastFindings(collected.groupMap, options, {
          decorate: true,
          generation
        }).then(() => {
          if (generation === scanGeneration) postSerializedFindings(collected.groupMap, options);
        }).catch(err => {
          reportVisualContrastError(err);
        });
      }
      return allFindings;
    };
    const scanAsync = async function (options = {}) {
      clearOverlays();
      const generation = scanGeneration;
      if (shouldRunVisualContrast(options)) {
        const collected = await collectBrowserFindingsAsync(options, {
          generation,
          scheduleLazy: true
        });
        if (generation !== scanGeneration) return [];
        return renderBrowserFindings(collected, options);
      }
      lastVisualContrastAnalyses = [];
      return renderBrowserFindings(collectBrowserFindings(), options);
    };
    const detect = function (options = {}) {
      lastVisualContrastAnalyses = [];
      const {
        allFindings
      } = collectBrowserFindings();
      return options.serialize === false ? allFindings : serializeFindings(allFindings);
    };
    const detectAsync = async function (options = {}) {
      if (shouldRunVisualContrast(options)) {
        const {
          allFindings
        } = await collectBrowserFindingsAsync(options);
        return options.serialize === false ? allFindings : serializeFindings(allFindings);
      }
      lastVisualContrastAnalyses = [];
      const {
        allFindings
      } = collectBrowserFindings();
      return options.serialize === false ? allFindings : serializeFindings(allFindings);
    };
    if (EXTENSION_MODE) {
      // Extension mode: listen for commands, don't auto-scan
      window.addEventListener('message', e => {
        if (e.source !== window || !e.data || e.data.source !== 'impeccable-command') return;
        if (e.data.action === 'scan') {
          if (e.data.config) window.__IMPECCABLE_CONFIG__ = e.data.config;
          try {
            scan(e.data.config || {});
          } catch (err) {
            postExtensionError(err);
          }
        }
        if (e.data.action === 'toggle-overlays') {
          const visible = !document.body.classList.contains('impeccable-hidden');
          document.body.classList.toggle('impeccable-hidden', visible);
          window.postMessage({
            source: 'impeccable-overlays-toggled',
            visible: !visible
          }, '*');
        }
        if (e.data.action === 'remove') {
          clearOverlays();
          styleEl.remove();
          if (spotlightBackdrop) {
            spotlightBackdrop.remove();
            spotlightBackdrop = null;
          }
          document.body.classList.remove('impeccable-hidden');
        }
        if (e.data.action === 'highlight') {
          try {
            const target = e.data.selector ? document.querySelector(e.data.selector) : null;
            if (target) {
              // Scroll first so positionOverlay reads the post-scroll rect
              if (!isInViewport(target) && target.scrollIntoView) {
                target.scrollIntoView({
                  behavior: 'instant',
                  block: 'center'
                });
              }
              for (const o of overlays) {
                if (o.classList.contains('impeccable-banner')) continue;
                const isMatch = o._targetEl === target;
                o.classList.toggle('impeccable-spotlight', isMatch);
                o.classList.toggle('impeccable-spotlight-dimmed', !isMatch);
                if (isMatch) {
                  // Force the matching overlay visible immediately, don't wait for IntersectionObserver
                  o.style.display = '';
                  o.style.animation = 'none';
                  o.classList.add('impeccable-visible');
                  o._revealed = true;
                  positionOverlay(o);
                }
              }
              showSpotlight(target);
            }
          } catch {/* invalid selector */}
        }
        if (e.data.action === 'unhighlight') {
          hideSpotlight();
          for (const o of overlays) {
            o.classList.remove('impeccable-spotlight');
            o.classList.remove('impeccable-spotlight-dimmed');
          }
        }
      });
      window.postMessage({
        source: 'impeccable-ready'
      }, '*');
    } else {
      if (window.__IMPECCABLE_CONFIG__?.autoScan !== false) {
        const runAutoScan = () => {
          try {
            scan();
          } catch (err) {
            console.warn('[impeccable] scan failed', err);
          }
        };
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => setTimeout(runAutoScan, 100));
        } else {
          setTimeout(runAutoScan, 100);
        }
      }
    }
    window.impeccableDetect = detect;
    window.impeccableDetectAsync = detectAsync;
    window.impeccableScan = scan;
    window.impeccableScanAsync = scanAsync;
    window.impeccableCollectVisualContrastCandidates = collectVisualContrastCandidates;
    window.impeccableAnalyzeVisualContrast = analyzeVisualContrast;
    window.impeccableGetLastVisualContrastAnalyses = () => lastVisualContrastAnalyses.slice();
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "tools/anti-slop/detect-antipatterns.js", error: String((e && e.message) || e) }); }

// tools/apply-update.cjs
try { (() => {
/* apply-update.cjs — install a master update into this branch.  (Node CommonJS; not bundled in the browser.)
 *
 * Copies master-owned files from a cloned master checkout into this repo,
 * honouring governance/ownership.json: it NEVER touches branch-owned paths
 * (overrides/**, client/**), skips ignored/generated files, and leaves the
 * branch's own .github/ workflow + secrets alone. Then it stamps the new
 * version into overrides/BRANCH.md.
 *
 * Usage:  node tools/apply-update.cjs --master-dir .ds-master
 *
 * Additive/overwrite only — it does not delete files master removed (rare;
 * review the changelog for MAJOR notes). Run check-update.cjs first.
 */
const {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  mkdirSync,
  copyFileSync
} = require("node:fs");
const {
  dirname,
  join,
  relative,
  sep
} = require("node:path");
function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}
const MASTER = arg("--master-dir") || ".ds-master";
const own = JSON.parse(readFileSync("governance/ownership.json", "utf8"));
const PROTECT = [...(own.branchOwned || []),
// overrides/**, client/**
...(own.ignored || []),
// uploads, scraps, _ds_* generated, master.lock, thumbnails, support.js
".git/**", ".github/**",
// the branch owns its own workflow + secrets wiring
"node_modules/**", ".ds-master/**"];
function globToRe(g) {
  const re = g.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*\/?/g, "\u0000").replace(/\*/g, "[^/]*").replace(/\u0000/g, ".*");
  return new RegExp("^" + re + "$");
}
const PROTECT_RE = PROTECT.map(globToRe);
const isProtected = p => PROTECT_RE.some(re => re.test(p));
function walk(dir, base, out) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    const rel = relative(base, abs).split(sep).join("/");
    if (rel === ".git" || rel.indexOf(".git/") === 0) continue;
    const st = statSync(abs);
    if (st.isDirectory()) walk(abs, base, out);else out.push(rel);
  }
}
const files = [];
walk(MASTER, MASTER, files);
let written = 0,
  skipped = 0;
for (const rel of files) {
  if (isProtected(rel)) {
    skipped++;
    continue;
  }
  mkdirSync(dirname(rel) || ".", {
    recursive: true
  });
  copyFileSync(join(MASTER, rel), rel);
  written++;
}
let newVersion = "unknown";
try {
  newVersion = JSON.parse(readFileSync(MASTER + "/update-manifest.json", "utf8")).version;
} catch (e) {}
try {
  let b = readFileSync("overrides/BRANCH.md", "utf8");
  b = b.replace(/based on master \*\*VERSION [\d.]+\*\*/i, "based on master **VERSION " + newVersion + "**").replace(/(\*\*Based on master:\*\* )[\d.]+/i, "$1" + newVersion);
  writeFileSync("overrides/BRANCH.md", b);
} catch (e) {}
console.log(JSON.stringify({
  applied: newVersion,
  written,
  skipped
}));
})(); } catch (e) { __ds_ns.__errors.push({ path: "tools/apply-update.cjs", error: String((e && e.message) || e) }); }

// tools/check-update.cjs
try { (() => {
/* check-update.cjs — is this branch behind master?  (Node CommonJS; not bundled in the browser.)
 *
 * Compares the version this branch was last built on (overrides/BRANCH.md
 * "Based on master: X.Y.Z", falling back to update-manifest.json) against the
 * master design system's published update-manifest.json.
 *
 * Usage:
 *   node tools/check-update.cjs --master-dir .ds-master   # compare vs a cloned master checkout
 *   node tools/check-update.cjs --master-url <raw url>     # compare vs a fetched manifest
 *
 * Exit codes:  0 = up to date   ·   10 = behind (update available)   ·   1 = error
 * Prints a one-line JSON status to stdout either way.
 */
const {
  readFileSync
} = require("node:fs");
function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}
function parseSemver(v) {
  const m = String(v || "").trim().match(/(\d+)\.(\d+)\.(\d+)/);
  return m ? [+m[1], +m[2], +m[3]] : null;
}
function cmp(a, b) {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}
function localVersion() {
  try {
    const t = readFileSync("overrides/BRANCH.md", "utf8");
    const m = t.match(/based on master[^\d]*(\d+\.\d+\.\d+)/i);
    if (m) return m[1];
  } catch (e) {}
  try {
    return JSON.parse(readFileSync("update-manifest.json", "utf8")).version;
  } catch (e) {}
  return "0.0.0";
}
async function masterManifest() {
  const dir = arg("--master-dir");
  if (dir) return JSON.parse(readFileSync(dir + "/update-manifest.json", "utf8"));
  const url = arg("--master-url");
  if (url) {
    const headers = {};
    if (process.env.DS_SYNC_TOKEN) headers.Authorization = "Bearer " + process.env.DS_SYNC_TOKEN;
    const r = await fetch(url, {
      headers
    });
    if (!r.ok) throw new Error("fetch " + url + " → " + r.status);
    return await r.json();
  }
  throw new Error("pass --master-dir <cloned master> or --master-url <manifest url>");
}
(async () => {
  try {
    const local = localVersion();
    const m = await masterManifest();
    const master = m.version;
    const lv = parseSemver(local),
      mv = parseSemver(master);
    if (!lv || !mv) throw new Error("unparseable version (local=" + local + ", master=" + master + ")");
    const behind = cmp(lv, mv) < 0;
    const latest = m.releases && m.releases[0] || {};
    console.log(JSON.stringify({
      local,
      master,
      behind,
      level: behind ? latest.level || "minor" : "none",
      summary: behind ? latest.summary || "" : "up to date"
    }));
    process.exit(behind ? 10 : 0);
  } catch (e) {
    console.log(JSON.stringify({
      error: String(e.message || e)
    }));
    process.exit(1);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "tools/check-update.cjs", error: String((e && e.message) || e) }); }

// ui_kits/setup/Setup.jsx
try { (() => {
/* Brand Settings — window.Setup
   ONE page: left = all brand options (colours, tint, font, signature, optional
   source + hand-off), right = a live LinkedIn FEED preview of how a visual will
   look. Choices persist to localStorage and inject a live brand layer so the
   preview (and the rest of the app) reflect them immediately. The page can't
   write overrides/brand.css itself — "Copy for the assistant" hands the agent a
   ready prompt; or paste the CSS yourself. */
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
    fileName: "",
    profileName: "Your Name",
    profileRole: "Founder · building in public",
    profileHandle: "yourname",
    profilePhoto: ""
  };
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
    const m = (hex || "#000").replace("#", "");
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
  function copyText(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;opacity:0;top:-9999px";
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand("copy");
      ta.remove();
      if (ok) return true;
    } catch (e) {}
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  }
  const h = React.createElement;
  function Setup() {
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
      copyText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1700);
    };
    const sig = color => s.signature === "underline" ? {
      boxShadow: `inset 0 -0.14em 0 ${color || s.accent}`
    } : s.signature === "block" ? {
      background: color || s.accent,
      color: "#fff",
      padding: "0 .14em",
      borderRadius: 3
    } : s.signature === "bubble" ? {
      border: `2.5px solid ${color || s.accent}`,
      borderRadius: "999px",
      padding: ".02em .4em"
    } : {};

    // ---- tokens / chrome styles (settings UI is neutral Inter; only the preview uses the brand font) ----
    const ui = "'Inter',system-ui,-apple-system,sans-serif";
    const label = {
      display: "block",
      fontSize: 11.5,
      fontWeight: 700,
      letterSpacing: ".05em",
      textTransform: "uppercase",
      color: "#9aa0a6",
      margin: "0 0 9px"
    };
    const card = {
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 14,
      padding: 18,
      marginBottom: 14,
      boxShadow: "0 1px 2px rgba(0,0,0,.04)"
    };
    const field = {
      width: "100%",
      padding: "11px 12px",
      fontSize: 14,
      border: "1px solid #d8dadd",
      borderRadius: 9,
      background: "#fff",
      boxSizing: "border-box",
      fontFamily: "inherit",
      color: "#1f2328"
    };
    function Color({
      k,
      name,
      role
    }) {
      return h("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 11
        }
      }, h("input", {
        type: "color",
        value: s[k],
        onChange: e => set(k, e.target.value),
        style: {
          width: 46,
          height: 38,
          border: "1px solid #d8dadd",
          borderRadius: 8,
          background: "#fff",
          padding: 2,
          cursor: "pointer",
          flex: "none"
        }
      }), h("div", {
        style: {
          minWidth: 0
        }
      }, h("div", {
        style: {
          fontWeight: 600,
          fontSize: 14
        }
      }, name), h("div", {
        style: {
          fontSize: 12.5,
          color: "#8a9098"
        }
      }, role)), h("div", {
        style: {
          marginLeft: "auto",
          fontSize: 12.5,
          color: "#8a9098",
          fontFamily: "monospace"
        }
      }, (s[k] || "").toUpperCase()));
    }

    // ---- the LIVE feed preview (right) ----
    function FeedVisual() {
      // a single-visual "loud" cover, recoloured live
      return h("div", {
        style: {
          aspectRatio: "4/5",
          background: s.primary,
          color: "#fff",
          padding: "30px 26px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: `'${s.font}', sans-serif`
        }
      }, h("div", {
        style: {
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,.72)"
        }
      }, "The hard truth"), h("div", null, h("div", {
        style: {
          fontWeight: 800,
          fontSize: 38,
          lineHeight: 1.05,
          letterSpacing: "-.02em"
        }
      }, "Most outreach dies on the ", h("span", {
        style: sig("#fff")
      }, "first line")), h("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 9,
          marginTop: 24
        }
      }, h("span", {
        style: {
          width: 30,
          height: 30,
          borderRadius: "50%",
          flex: "none",
          background: s.profilePhoto ? `center/cover url(${s.profilePhoto})` : "rgba(255,255,255,.25)"
        }
      }), h("span", {
        style: {
          fontSize: 14,
          fontWeight: 600,
          color: "rgba(255,255,255,.9)"
        }
      }, "@" + (s.profileHandle || "yourname")), h("span", {
        style: {
          marginLeft: "auto",
          fontSize: 22
        }
      }, "\u2192"))));
    }
    function MiniRole(bg, fg, kicker, kc) {
      return h("div", {
        style: {
          flex: 1,
          aspectRatio: "4/5",
          borderRadius: 8,
          background: bg,
          color: fg,
          padding: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          fontFamily: `'${s.font}', sans-serif`
        }
      }, h("div", {
        style: {
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: kc
        }
      }, kicker), h("div", {
        style: {
          fontWeight: 700,
          fontSize: 13,
          lineHeight: 1.08,
          marginTop: 4
        }
      }, "Headline"));
    }
    function Feed() {
      const act = txt => h("div", {
        style: {
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
          color: "#5f6671",
          padding: "9px 0"
        }
      }, txt);
      return h("div", null, h("span", {
        style: label
      }, "Live preview — in the feed"), h("div", {
        style: {
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,.08)",
          maxWidth: 380
        }
      },
      // post header
      h("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "13px 14px 10px"
        }
      }, h("span", {
        style: {
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "1px solid #e5e7eb",
          flex: "none",
          background: s.profilePhoto ? `center/cover url(${s.profilePhoto})` : light
        }
      }), h("div", {
        style: {
          lineHeight: 1.25
        }
      }, h("div", {
        style: {
          fontWeight: 700,
          fontSize: 14,
          color: "#111827"
        }
      }, s.profileName || "Your Name"), h("div", {
        style: {
          fontSize: 12,
          color: "#6b7280"
        }
      }, s.profileRole || "Founder · building in public"), h("div", {
        style: {
          fontSize: 12,
          color: "#6b7280"
        }
      }, "2h · \uD83C\uDF10")), h("span", {
        style: {
          marginLeft: "auto",
          color: s.primary,
          fontWeight: 700,
          fontSize: 13
        }
      }, "+ Follow")),
      // post text
      h("div", {
        style: {
          padding: "0 14px 12px",
          fontSize: 13.5,
          lineHeight: 1.5,
          color: "#1f2328"
        }
      }, "Spent years getting this wrong. Here's the one change that doubled my reply rate \uD83D\uDC47"),
      // the visual
      FeedVisual(),
      // action bar
      h("div", {
        style: {
          display: "flex",
          borderTop: "1px solid #eef0f2"
        }
      }, act("\uD83D\uDC4D Like"), act("\uD83D\uDCAC Comment"), act("\uD83D\uDD01 Repost"), act("\u27A4 Send"))),
      // three canvas roles
      h("div", {
        style: {
          marginTop: 16
        }
      }, h("span", {
        style: label
      }, "Your three canvases"), h("div", {
        style: {
          display: "flex",
          gap: 8,
          maxWidth: 380
        }
      }, MiniRole(s.primary, "#fff", "Loud", "rgba(255,255,255,.7)"), MiniRole(light, "#18181b", "Light", "#8a9098"), MiniRole(s.secondary, "#fff", "Section", s.accent))));
    }

    // ---- left controls ----
    const srcOpt = (val, name) => h("button", {
      onClick: () => set("sourceType", val),
      style: {
        flex: 1,
        minWidth: 70,
        padding: "8px 6px",
        fontSize: 12.5,
        fontWeight: 600,
        cursor: "pointer",
        borderRadius: 8,
        border: "1.5px solid " + (s.sourceType === val ? s.primary : "#d8dadd"),
        background: s.sourceType === val ? s.primary : "#fff",
        color: s.sourceType === val ? "#fff" : "#3a3f45",
        fontFamily: "inherit"
      }
    }, name);
    const left = h("div", {
      style: {
        flex: "1 1 0",
        minWidth: 0,
        maxWidth: 560
      }
    }, h("div", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 11.5,
        fontWeight: 700,
        letterSpacing: ".12em",
        textTransform: "uppercase",
        color: s.primary,
        marginBottom: 10
      }
    }, h("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: s.primary
      }
    }), "Brand settings"), h("h1", {
      style: {
        fontWeight: 800,
        fontSize: 28,
        letterSpacing: "-.02em",
        margin: "0 0 6px",
        color: "#111827"
      }
    }, "Your brand"), h("p", {
      style: {
        fontSize: 14.5,
        lineHeight: 1.5,
        color: "#6b7280",
        margin: "0 0 20px"
      }
    }, "Set it here or just tell the assistant in chat — everything updates live on the right, and persists across every visual."),
    // Profile (name · role · photo)
    h("div", {
      style: card
    }, h("span", {
      style: label
    }, "Your profile"), h("div", {
      style: {
        display: "flex",
        gap: 14,
        alignItems: "flex-start"
      }
    }, h("label", {
      style: {
        flex: "none",
        cursor: "pointer",
        textAlign: "center"
      }
    }, h("span", {
      style: {
        display: "block",
        width: 60,
        height: 60,
        borderRadius: "50%",
        border: "1px solid #d8dadd",
        background: s.profilePhoto ? `center/cover url(${s.profilePhoto})` : "#f1f2f4",
        marginBottom: 5
      }
    }, !s.profilePhoto && h("span", {
      style: {
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        color: "#b6bcc3"
      }
    }, "+")), h("span", {
      style: {
        fontSize: 11,
        color: s.primary,
        fontWeight: 600
      }
    }, s.profilePhoto ? "Change" : "Photo"), h("input", {
      type: "file",
      accept: "image/*",
      style: {
        display: "none"
      },
      onChange: e => {
        const f = e.target.files[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = () => set("profilePhoto", r.result);
        r.readAsDataURL(f);
      }
    })), h("div", {
      style: {
        flex: "1 1 0",
        minWidth: 0
      }
    }, h("input", {
      style: Object.assign({}, field, {
        marginBottom: 8
      }),
      placeholder: "Name",
      value: s.profileName,
      onChange: e => set("profileName", e.target.value)
    }), h("input", {
      style: Object.assign({}, field, {
        marginBottom: 8
      }),
      placeholder: "Role / function (e.g. Founder · SaaS)",
      value: s.profileRole,
      onChange: e => set("profileRole", e.target.value)
    }), h("input", {
      style: field,
      placeholder: "@handle",
      value: s.profileHandle,
      onChange: e => set("profileHandle", e.target.value.replace(/^@/, ""))
    }))), s.profilePhoto && h("button", {
      onClick: () => set("profilePhoto", ""),
      style: {
        marginTop: 10,
        fontSize: 12,
        fontWeight: 600,
        color: "#8a9098",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        fontFamily: "inherit"
      }
    }, "Remove photo")),
    // Colours
    h("div", {
      style: card
    }, h("span", {
      style: label
    }, "Colours"), h(Color, {
      k: "primary",
      name: "Primary",
      role: "Loud canvas — covers & backs"
    }), h(Color, {
      k: "secondary",
      name: "Secondary",
      role: "Section canvas — chapter markers"
    }), h(Color, {
      k: "accent",
      name: "Accent",
      role: "Highlight / signature mark"
    }), h("div", {
      style: {
        marginTop: 14
      }
    }, h("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 6
      }
    }, h("span", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: "#3a3f45"
      }
    }, "Light-canvas tint"), h("span", {
      style: {
        fontSize: 13,
        color: "#8a9098",
        fontFamily: "monospace"
      }
    }, s.tint + "%")), h("input", {
      type: "range",
      min: 3,
      max: 16,
      value: s.tint,
      onChange: e => set("tint", +e.target.value),
      style: {
        width: "100%",
        accentColor: s.primary
      }
    }))),
    // Type & signature
    h("div", {
      style: card
    }, h("span", {
      style: label
    }, "Type & signature"), h("select", {
      value: s.font,
      onChange: e => set("font", e.target.value),
      style: Object.assign({}, field, {
        fontFamily: `'${s.font}', sans-serif`,
        marginBottom: 14
      })
    }, FONTS.map(f => h("option", {
      key: f,
      value: f
    }, f))), h("div", {
      style: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap"
      }
    }, SIGS.map(([val, name]) => h("button", {
      key: val,
      onClick: () => set("signature", val),
      style: {
        flex: 1,
        minWidth: 78,
        padding: "9px 6px",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        borderRadius: 8,
        border: "1.5px solid " + (s.signature === val ? s.primary : "#d8dadd"),
        background: s.signature === val ? s.primary : "#fff",
        color: s.signature === val ? "#fff" : "#3a3f45",
        fontFamily: "inherit"
      }
    }, name)))),
    // Source (optional)
    h("div", {
      style: card
    }, h("span", {
      style: label
    }, "Start from an existing brand (optional)"), h("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 10
      }
    }, srcOpt("manual", "Manual"), srcOpt("figma", "Figma"), srcOpt("github", "GitHub"), srcOpt("file", ".fig file")), s.sourceType === "figma" && h("input", {
      style: field,
      placeholder: "https://www.figma.com/file/…",
      value: s.figmaUrl,
      onChange: e => set("figmaUrl", e.target.value)
    }), s.sourceType === "github" && h("input", {
      style: field,
      placeholder: "https://github.com/owner/repo",
      value: s.githubUrl,
      onChange: e => set("githubUrl", e.target.value)
    }), s.sourceType === "file" && h("label", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 14px",
        border: "1px solid #d8dadd",
        borderRadius: 9,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        color: "#3a3f45"
      }
    }, s.fileName ? "\u2713 " + s.fileName : "Choose .fig file", h("input", {
      type: "file",
      accept: ".fig",
      style: {
        display: "none"
      },
      onChange: e => set("fileName", e.target.files[0] ? e.target.files[0].name : "")
    })), (s.sourceType === "figma" || s.sourceType === "github" || s.sourceType === "file") && h("div", {
      style: {
        fontSize: 12,
        color: "#8a9098",
        marginTop: 8,
        lineHeight: 1.4
      }
    }, "The assistant imports it — paste/attach it in the chat with the hand-off below.")),
    // Hand-off
    h("div", {
      style: {
        display: "flex",
        gap: 10,
        alignItems: "center",
        flexWrap: "wrap"
      }
    }, h("button", {
      onClick: () => copy("msg", assistantMsg(s)),
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "12px 22px",
        fontSize: 15,
        fontWeight: 700,
        borderRadius: 11,
        cursor: "pointer",
        border: "none",
        background: s.primary,
        color: "#fff",
        fontFamily: "inherit"
      }
    }, copied === "msg" ? "Copied — paste in chat \u2713" : "Apply via the assistant"), h("button", {
      onClick: () => copy("css", cssText(s)),
      style: {
        padding: "12px 18px",
        fontSize: 14,
        fontWeight: 600,
        borderRadius: 11,
        cursor: "pointer",
        border: "1px solid #d8dadd",
        background: "#fff",
        color: "#5f6671",
        fontFamily: "inherit"
      }
    }, copied === "css" ? "Copied brand.css \u2713" : "Copy brand.css")));
    return h("div", {
      style: {
        minHeight: "100vh",
        fontFamily: ui,
        color: "#1f2328",
        background: "#f6f7f8"
      }
    }, h("div", {
      style: {
        display: "flex",
        gap: 40,
        alignItems: "flex-start",
        maxWidth: 1180,
        margin: "0 auto",
        padding: "34px 36px 60px",
        boxSizing: "border-box",
        flexWrap: "wrap"
      }
    }, left, h("div", {
      style: {
        flex: "0 0 380px",
        maxWidth: 380,
        position: "sticky",
        top: 28
      }
    }, Feed())));
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

// uploads/Design system setup/doodle-kit.js
try { (() => {
/* ============================================================
   DOODLE KIT — MORE THAN SAID
   Reusable hand-drawn doodle library for the LinkedIn visuals.
   Brand-agnostic engine + editor. Ships with an EMPTY icon set; populate per project.

   USAGE
     <link rel="stylesheet" href="doodle.css">
     <script src="doodle-kit.js"></script>
     <doodle-mark name="rocket"></doodle-mark>
     <doodle-ill  name="research"></doodle-ill>
     el.innerHTML = DoodleKit.mark('funnel');

   EDIT MODE (node editor)
     DoodleKit.capture(name)         -> [{ci,type,pts:[[x,y]..]}]  (anchor points)
     DoodleKit.setPoint(name,ci,pi,x,y)   move one anchor (persisted)
     DoodleKit.resetMark(name)            clear edits for one mark
     Edits live in localStorage('doodle-overrides') and every live
     <doodle-mark>/<doodle-ill> re-renders on the 'doodle-changed' event.

   Colour: line = var(--doodle-ink) (defaults to --brand-secondary),
   accent = var(--brand-primary). Size with CSS width/height.
   ============================================================ */
(function (root) {
  function mul(a) {
    return function () {
      a |= 0;
      a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function f(n) {
    return Math.round(n * 10) / 10;
  }

  // ---- edit state (module scope, shared with Pen primitives) ----
  var STORE = {},
    OV = null,
    CIDX = 0,
    CAP = null,
    CAPTURE = false,
    CUSTOM = {};
  try {
    STORE = JSON.parse(root.localStorage.getItem('doodle-overrides')) || {};
  } catch (e) {
    STORE = {};
  }
  try {
    (JSON.parse(root.localStorage.getItem('doodle-custom')) || []).forEach(function (n) {
      CUSTOM[n] = true;
    });
  } catch (e) {}
  function NOOP() {}
  function persist() {
    try {
      root.localStorage.setItem('doodle-overrides', JSON.stringify(STORE));
    } catch (e) {}
  }
  function persistCustom() {
    try {
      root.localStorage.setItem('doodle-custom', JSON.stringify(Object.keys(CUSTOM)));
    } catch (e) {}
  }
  function ovGet(ci) {
    return OV ? OV[ci] : null;
  }
  function applyMoves(ci, pts) {
    var o = ovGet(ci);
    if (o) {
      for (var k in o) {
        if (k.charAt(0) !== '_') pts[+k] = [o[k][0], o[k][1]];
      }
    }
    return pts;
  }
  function cap(rec) {
    if (CAPTURE) CAP.push(rec);
  }
  // build an SVG path from anchors ([x,y] corner, or [x,y,hx,hy] with a symmetric bezier handle)
  function anchorPath(A, closed) {
    if (!A || !A.length) return '';
    function hx(a) {
      return a.length > 2 ? a[2] : 0;
    }
    function hy(a) {
      return a.length > 3 ? a[3] : 0;
    }
    var d = 'M' + f(A[0][0]) + ' ' + f(A[0][1]),
      n = A.length,
      segs = closed ? n : n - 1;
    for (var i = 0; i < segs; i++) {
      var a = A[i],
        b = A[(i + 1) % n];
      if (hx(a) || hy(a) || hx(b) || hy(b)) {
        d += ' C ' + f(a[0] + hx(a)) + ' ' + f(a[1] + hy(a)) + ' ' + f(b[0] - hx(b)) + ' ' + f(b[1] - hy(b)) + ' ' + f(b[0]) + ' ' + f(b[1]);
      } else d += ' L ' + f(b[0]) + ' ' + f(b[1]);
    }
    if (closed) d += ' Z';
    return d;
  }
  function profileOutline(A, baseW, profile, closed) {
    if (!A || A.length < 2) return '';
    function hx(a) {
      return a.length > 2 ? a[2] : 0;
    }
    function hy(a) {
      return a.length > 3 ? a[3] : 0;
    }
    var segEnd = closed ? A.length : A.length - 1,
      pts = [];
    for (var i = 0; i < segEnd; i++) {
      var a = A[i],
        b = A[(i + 1) % A.length];
      var c1x = a[0] + hx(a),
        c1y = a[1] + hy(a),
        c2x = b[0] - hx(b),
        c2y = b[1] - hy(b),
        sub = 14;
      for (var s2 = 0; s2 < sub; s2++) {
        var t = s2 / sub,
          mt = 1 - t;
        pts.push([mt * mt * mt * a[0] + 3 * mt * mt * t * c1x + 3 * mt * t * t * c2x + t * t * t * b[0], mt * mt * mt * a[1] + 3 * mt * mt * t * c1y + 3 * mt * t * t * c2y + t * t * t * b[1]]);
      }
    }
    if (!closed) pts.push([A[A.length - 1][0], A[A.length - 1][1]]);
    var n = pts.length,
      T = [0];
    for (var i = 1; i < n; i++) T[i] = T[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    var L = T[n - 1] || 1;
    for (var i = 0; i < n; i++) T[i] /= L;
    function wf(t) {
      var v;
      if (profile === 'bulge') v = Math.sin(Math.PI * t);else if (profile === 'taper') v = 1 - t;else if (profile === 'reverse') v = t;else if (profile === 'waist') v = Math.abs(2 * t - 1);else v = 1;
      return baseW * (0.14 + 0.95 * v);
    }
    function norm(i) {
      var a = pts[(i - 1 + n) % n],
        b = pts[(i + 1) % n];
      if (!closed) {
        a = pts[Math.max(0, i - 1)];
        b = pts[Math.min(n - 1, i + 1)];
      }
      var dx = b[0] - a[0],
        dy = b[1] - a[1],
        len = Math.hypot(dx, dy) || 1;
      return [-dy / len, dx / len];
    }
    var left = [],
      right = [];
    for (var i = 0; i < n; i++) {
      var hw = wf(T[i]) / 2,
        nb = norm(i);
      left.push([pts[i][0] + nb[0] * hw, pts[i][1] + nb[1] * hw]);
      right.push([pts[i][0] - nb[0] * hw, pts[i][1] - nb[1] * hw]);
    }
    if (closed) {
      var d1 = 'M' + f(left[0][0]) + ' ' + f(left[0][1]);
      for (var i = 1; i < n; i++) d1 += ' L ' + f(left[i][0]) + ' ' + f(left[i][1]);
      d1 += ' Z';
      var d2 = 'M' + f(right[0][0]) + ' ' + f(right[0][1]);
      for (var i = 1; i < n; i++) d2 += ' L ' + f(right[i][0]) + ' ' + f(right[i][1]);
      d2 += ' Z';
      return d1 + ' ' + d2;
    }
    var d = 'M' + f(left[0][0]) + ' ' + f(left[0][1]);
    for (var i = 1; i < n; i++) d += ' L ' + f(left[i][0]) + ' ' + f(left[i][1]);
    for (var i = n - 1; i >= 0; i--) d += ' L ' + f(right[i][0]) + ' ' + f(right[i][1]);
    d += ' Z';
    return d;
  }
  function Pen(seed) {
    var rng = mul(seed),
      els = [];
    function j(m) {
      return (rng() * 2 - 1) * m;
    }
    function smooth(pts, close) {
      var d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
      for (var i = 1; i < pts.length; i++) {
        var mx = (pts[i - 1][0] + pts[i][0]) / 2,
          my = (pts[i - 1][1] + pts[i][1]) / 2;
        d += ' Q ' + f(pts[i - 1][0]) + ' ' + f(pts[i - 1][1]) + ' ' + f(mx) + ' ' + f(my);
      }
      if (close) d += ' Z';else {
        var L = pts[pts.length - 1];
        d += ' L ' + f(L[0]) + ' ' + f(L[1]);
      }
      return d;
    }
    function edgy(P, close) {
      var d = 'M' + f(P[0][0]) + ' ' + f(P[0][1]),
        n = P.length;
      function seg(a, b) {
        var mx = (a[0] + b[0]) / 2,
          my = (a[1] + b[1]) / 2,
          nx = -(b[1] - a[1]),
          ny = b[0] - a[0],
          L = Math.hypot(nx, ny) || 1;
        var bow = j(Math.min(1.5, Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.02));
        d += ' Q ' + f(mx + nx / L * bow) + ' ' + f(my + ny / L * bow) + ' ' + f(b[0]) + ' ' + f(b[1]);
      }
      for (var i = 1; i < n; i++) seg(P[i - 1], P[i]);
      if (close) {
        seg(P[n - 1], P[0]);
        d += ' Z';
      }
      return d;
    }
    function line(x1, y1, x2, y2, o) {
      o = o || {};
      var ci = CIDX++;
      var P = applyMoves(ci, [[x1, y1], [x2, y2]]);
      cap({
        ci: ci,
        type: 'line',
        pts: [P[0].slice(), P[1].slice()],
        closed: false,
        sw: o.sw,
        coral: !!o.coral
      });
      var ov = ovGet(ci);
      if (ov && ov._a) {
        els.push({
          d: anchorPath(ov._a, !!ov._c),
          sw: o.sw,
          coral: o.coral,
          dash: o.dash,
          ci: ci
        });
        return;
      }
      x1 = P[0][0];
      y1 = P[0][1];
      x2 = P[1][0];
      y2 = P[1][1];
      var over = o.over || 0,
        ang = Math.atan2(y2 - y1, x2 - x1),
        dx = Math.cos(ang),
        dy = Math.sin(ang);
      x1 -= dx * over;
      y1 -= dy * over;
      x2 += dx * over;
      y2 += dy * over;
      var nx = -dy,
        ny = dx,
        len = Math.hypot(x2 - x1, y2 - y1),
        a = Math.min(1.6, len * 0.012 + 0.3);
      els.push({
        d: `M${f(x1)} ${f(y1)} C ${f(x1 + (x2 - x1) * 0.34 + nx * j(a))} ${f(y1 + (y2 - y1) * 0.34 + ny * j(a))} ${f(x1 + (x2 - x1) * 0.66 + nx * j(a))} ${f(y1 + (y2 - y1) * 0.66 + ny * j(a))} ${f(x2)} ${f(y2)}`,
        sw: o.sw,
        coral: o.coral,
        dash: o.dash,
        ci: ci
      });
    }
    function circle(cx, cy, r, o) {
      o = o || {};
      var ci = CIDX++;
      var P = applyMoves(ci, [[cx, cy], [cx + r, cy]]);
      cap({
        ci: ci,
        type: 'circle',
        pts: [P[0].slice(), P[1].slice()],
        closed: false,
        sw: o.sw,
        coral: !!o.coral
      });
      cx = P[0][0];
      cy = P[0][1];
      r = Math.hypot(P[1][0] - cx, P[1][1] - cy) || 0.001;
      var tilt = j(0.04),
        sq = 0.98 + j(0.03),
        segs = 28,
        pts = [];
      for (var i = 0; i < segs; i++) {
        var t = 6.283 * i / segs,
          rr = r * (1 + j(0.012)),
          x = Math.cos(t) * rr,
          y = Math.sin(t) * rr * sq;
        pts.push([cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt)]);
      }
      els.push({
        d: smooth(pts, true),
        sw: o.sw,
        coral: o.coral,
        fill: o.fill,
        inkfill: o.inkfill,
        ci: ci
      });
    }
    function poly(pts, close, o) {
      o = o || {};
      var ci = CIDX++;
      var A = applyMoves(ci, pts.map(function (p) {
        return [p[0], p[1]];
      }));
      cap({
        ci: ci,
        type: 'poly',
        pts: A.map(function (p) {
          return p.slice();
        }),
        closed: !!close,
        sw: o.sw,
        coral: !!o.coral,
        fill: !!(o.fill || o.inkfill),
        sharp: !!o.sharp
      });
      var ov = ovGet(ci);
      if (ov && ov._a) {
        els.push({
          d: anchorPath(ov._a, ov._c != null ? ov._c : !!close),
          sw: o.sw,
          coral: o.coral,
          fill: o.fill,
          inkfill: o.inkfill,
          ci: ci
        });
        return;
      }
      var jj = o.j == null ? 0.8 : o.j,
        P = A.map(p => [p[0] + j(jj), p[1] + j(jj)]);
      els.push({
        d: o.sharp ? edgy(P, close) : smooth(P, close),
        sw: o.sw,
        coral: o.coral,
        fill: o.fill,
        inkfill: o.inkfill,
        ci: ci
      });
    }
    function dot(cx, cy, r, o) {
      o = o || {};
      var ci = CIDX++;
      var P = applyMoves(ci, [[cx, cy], [cx + r, cy]]);
      cap({
        ci: ci,
        type: 'dot',
        pts: [P[0].slice(), P[1].slice()],
        closed: false,
        coral: !!o.coral
      });
      cx = P[0][0];
      cy = P[0][1];
      r = Math.hypot(P[1][0] - cx, P[1][1] - cy);
      els.push({
        dot: [cx, cy, r],
        coral: o.coral
      });
    }
    function arc(cx, cy, r, a0, a1, o) {
      o = o || {};
      var ci = CIDX++;
      var P = applyMoves(ci, [[cx, cy], [cx + r * Math.cos(a0), cy + r * Math.sin(a0)]]);
      cap({
        ci: ci,
        type: 'arc',
        pts: [P[0].slice(), P[1].slice()],
        closed: false,
        sw: o.sw,
        coral: !!o.coral
      });
      cx = P[0][0];
      cy = P[0][1];
      r = Math.hypot(P[1][0] - cx, P[1][1] - cy);
      var segs = Math.max(5, Math.round(Math.abs(a1 - a0) / 0.32)),
        pts = [];
      for (var i = 0; i <= segs; i++) {
        var t = a0 + (a1 - a0) * i / segs;
        pts.push([cx + Math.cos(t) * r * (1 + j(0.015)), cy + Math.sin(t) * r * (1 + j(0.015))]);
      }
      els.push({
        d: smooth(pts, false),
        sw: o.sw,
        coral: o.coral,
        ci: ci
      });
    }
    function star(cx, cy, r, o) {
      o = o || {};
      var pts = [],
        n = 5,
        rot = -Math.PI / 2 + j(0.04);
      for (var i = 0; i < n * 2; i++) {
        var rr = i % 2 ? r * 0.42 : r,
          a = rot + Math.PI * i / n;
        pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
      }
      poly(pts, true, {
        coral: o.coral,
        fill: o.fill,
        inkfill: o.inkfill,
        sw: o.sw || 2.5,
        j: 0.4,
        sharp: true
      });
    }
    function heart(cx, cy, s) {
      var ci = CIDX++;
      var P = applyMoves(ci, [[cx, cy], [cx, cy - s]]);
      cap({
        ci: ci,
        type: 'heart',
        pts: [P[0].slice(), P[1].slice()],
        closed: false,
        coral: true
      });
      cx = P[0][0];
      cy = P[0][1];
      s = Math.hypot(P[1][0] - cx, P[1][1] - cy);
      els.push({
        d: `M ${f(cx)} ${f(cy + s * 0.8)} C ${f(cx - s)} ${f(cy)} ${f(cx - s * 0.5)} ${f(cy - s * 0.72)} ${f(cx)} ${f(cy - s * 0.18)} C ${f(cx + s * 0.5)} ${f(cy - s * 0.72)} ${f(cx + s)} ${f(cy)} ${f(cx)} ${f(cy + s * 0.8)} Z`,
        coral: true,
        fill: true,
        sw: 1.5
      });
    }
    return {
      line,
      circle,
      poly,
      dot,
      arc,
      star,
      heart,
      els
    };
  }
  var OUT = 4.4,
    DET = 3.4,
    COR = 4;

  // ---- 100 sprinkle marks ----
  var ELEM = {}; // empty in the core build — add marks or create/import in the editor

  // ---- story illustrations ----
  var ILL = {};
  function svgFrom(els) {
    return '<svg viewBox="0 0 160 160">' + els.map(function (e) {
      var col = e.coral ? 'var(--brand-primary)' : 'var(--doodle-ink)';
      if (e.dot) return '<circle cx="' + f(e.dot[0]) + '" cy="' + f(e.dot[1]) + '" r="' + e.dot[2] + '" fill="' + col + '"/>';
      if (e.xstroke !== undefined) {
        var sc = e.xstroke === 'none' ? 'none' : e.xstroke === 'coral' ? 'var(--brand-primary)' : 'var(--doodle-ink)';
        var fc = !e.xfill || e.xfill === 'none' ? 'none' : e.xfill === 'coral' ? 'var(--brand-primary)' : 'var(--doodle-ink)';
        return '<path d="' + e.d + '" fill="' + fc + '"' + (e.eo ? ' fill-rule="evenodd"' : '') + ' stroke="' + sc + '" stroke-width="' + (e.sw || OUT) + '" stroke-linecap="round" stroke-linejoin="round"/>';
      }
      if (e.fill || e.inkfill) {
        var fc = e.inkfill ? 'var(--doodle-ink)' : col;
        return '<path d="' + e.d + '" fill="' + fc + '" stroke="' + fc + '" stroke-width="' + (e.sw || 2.5) + '" stroke-linejoin="round" stroke-linecap="round"/>';
      }
      var dash = e.dash ? ' stroke-dasharray="2 13"' : '';
      return '<path d="' + e.d + '" fill="none" stroke="' + col + '" stroke-width="' + (e.sw || OUT) + '" stroke-linecap="round" stroke-linejoin="round"' + dash + '/>';
    }).join('') + '</svg>';
  }
  function run(name, builder, seed) {
    OV = STORE[name] || null;
    CIDX = 0;
    CAPTURE = false;
    var p = Pen(seed);
    builder(p);
    if (OV) {
      p.els.forEach(function (el) {
        if (el.ci == null) return;
        var v = OV[el.ci];
        if (!v) return;
        if (v._sw != null) el.sw = v._sw;
        if (v._stroke != null || v._fill != null) {
          var bs = el.coral ? 'coral' : 'ink',
            bf = el.fill || el.inkfill ? el.inkfill ? 'ink' : el.coral ? 'coral' : 'ink' : 'none';
          el.xstroke = v._stroke != null ? v._stroke : el.fill || el.inkfill ? 'none' : bs;
          el.xfill = v._fill != null ? v._fill : bf;
          el.fill = false;
          el.inkfill = false;
        }
      });
    }
    var ex = OV && OV._extra;
    if (ex) {
      for (var i = 0; i < ex.length; i++) {
        var s = ex[i];
        if (s.profile && s.profile !== 'uniform') {
          p.els.push({
            d: profileOutline(s.pts, s.sw || OUT, s.profile, !!s.closed),
            xfill: s.stroke || 'ink',
            xstroke: 'none',
            sw: 0,
            eo: true
          });
        } else p.els.push({
          d: anchorPath(s.pts, !!s.closed),
          sw: s.sw || OUT,
          xstroke: s.stroke || (s.coral ? 'coral' : 'ink'),
          xfill: s.fill || 'none'
        });
      }
    }
    OV = null;
    return p.els;
  }
  function hash(s) {
    s = s || '';
    var h = 29;
    for (var i = 0; i < s.length; i++) h = h * 131 + s.charCodeAt(i) >>> 0;
    return h;
  }
  function seedFor(kind, name) {
    return hash((kind === 'ill' ? 'i' : 'm') + name);
  }
  var DoodleKit = {
    mark: function (name, o) {
      o = o || {};
      var b = ELEM[name] || (CUSTOM[name] ? NOOP : null);
      return b ? svgFrom(run(name, b, o.seed != null ? o.seed : seedFor('mark', name))) : '';
    },
    ill: function (name, o) {
      o = o || {};
      var b = ILL[name];
      return b ? svgFrom(run(name, b, o.seed != null ? o.seed : seedFor('ill', name))) : '';
    },
    markNames: Object.keys(ELEM),
    illNames: Object.keys(ILL),
    customNames: function () {
      return Object.keys(CUSTOM);
    },
    newCustom: function () {
      var n = 'custom-' + Date.now().toString(36);
      CUSTOM[n] = true;
      persistCustom();
      return n;
    },
    removeCustom: function (name) {
      delete CUSTOM[name];
      delete STORE[name];
      persistCustom();
      persist();
      emit();
    },
    // ---- editor API ----
    capture: function (name) {
      var kind = ILL[name] ? 'ill' : 'mark',
        b = ELEM[name] || ILL[name] || (CUSTOM[name] ? NOOP : null);
      if (!b) return [];
      OV = STORE[name] || null;
      CIDX = 0;
      CAPTURE = true;
      CAP = [];
      var p = Pen(seedFor(kind, name));
      b(p);
      CAPTURE = false;
      var out = CAP.map(function (rec) {
        var ov = OV && OV[rec.ci];
        if (ov && ov._a) {
          rec.anchors = ov._a.map(function (a) {
            return a.slice();
          });
          rec.closed = ov._c != null ? ov._c : rec.closed;
        }
        if (rec.type !== 'extra') {
          var bS = rec.coral ? 'coral' : 'ink',
            bF = rec.fill ? rec.coral ? 'coral' : 'ink' : 'none';
          rec.stroke = ov && ov._stroke != null ? ov._stroke : bS;
          rec.fill = ov && ov._fill != null ? ov._fill : bF;
          rec.sw = ov && ov._sw != null ? ov._sw : rec.sw;
        }
        return rec;
      });
      var ex = OV && OV._extra;
      if (ex) {
        ex.forEach(function (s, i) {
          out.push({
            ci: 'e' + i,
            type: 'extra',
            extra: true,
            anchors: s.pts.map(function (a) {
              return a.slice();
            }),
            pts: s.pts.map(function (a) {
              return [a[0], a[1]];
            }),
            closed: !!s.closed,
            sw: s.sw,
            stroke: s.stroke || (s.coral ? 'coral' : 'ink'),
            fill: s.fill || 'none',
            profile: s.profile || 'uniform'
          });
        });
      }
      CAP = null;
      OV = null;
      return out;
    },
    setPoint: function (name, ci, pi, x, y) {
      STORE[name] = STORE[name] || {};
      STORE[name][ci] = STORE[name][ci] || {};
      STORE[name][ci][pi] = [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
      persist();
      emit();
    },
    setAnchors: function (name, ci, anchors, closed) {
      var e = STORE[name] = STORE[name] || {};
      if (String(ci).charAt(0) === 'e') {
        var idx = +String(ci).slice(1);
        if (e._extra && e._extra[idx]) {
          e._extra[idx].pts = anchors;
          e._extra[idx].closed = !!closed;
        }
      } else {
        e[ci] = e[ci] || {};
        e[ci]._a = anchors;
        e[ci]._c = !!closed;
      }
      persist();
      emit();
    },
    addExtra: function (name, stroke) {
      var e = STORE[name] = STORE[name] || {};
      e._extra = e._extra || [];
      e._extra.push(stroke);
      persist();
      emit();
      return e._extra.length - 1;
    },
    removeExtra: function (name, idx) {
      var e = STORE[name];
      if (e && e._extra) {
        e._extra.splice(idx, 1);
        persist();
        emit();
      }
    },
    setExtraStyle: function (name, idx, style) {
      var e = STORE[name];
      if (e && e._extra && e._extra[idx]) {
        for (var k in style) {
          e._extra[idx][k] = style[k];
        }
        persist();
        emit();
      }
    },
    setStrokeStyle: function (name, ci, style) {
      var e = STORE[name] = STORE[name] || {};
      e[ci] = e[ci] || {};
      if (style.sw != null) e[ci]._sw = style.sw;
      if (style.stroke != null) e[ci]._stroke = style.stroke;
      if (style.fill != null) e[ci]._fill = style.fill;
      persist();
      emit();
    },
    getEdit: function (name) {
      return STORE[name] ? JSON.parse(JSON.stringify(STORE[name])) : null;
    },
    setEdit: function (name, obj) {
      if (obj == null) delete STORE[name];else STORE[name] = obj;
      persist();
      emit();
    },
    isEdited: function (name) {
      return !!STORE[name];
    },
    resetMark: function (name) {
      delete STORE[name];
      persist();
      emit();
    },
    resetAll: function () {
      STORE = {};
      persist();
      emit();
    }
  };
  root.DoodleKit = DoodleKit;
  function emit() {
    try {
      document.dispatchEvent(new CustomEvent('doodle-changed'));
    } catch (e) {}
  }

  // ---- custom elements ----
  function define(tag, kind) {
    if (!root.customElements || customElements.get(tag)) return;
    customElements.define(tag, class extends HTMLElement {
      static get observedAttributes() {
        return ['name', 'seed'];
      }
      connectedCallback() {
        this._r();
        if (!this._h) {
          this._h = () => this._r();
          document.addEventListener('doodle-changed', this._h);
        }
      }
      disconnectedCallback() {
        if (this._h) {
          document.removeEventListener('doodle-changed', this._h);
          this._h = null;
        }
      }
      attributeChangedCallback() {
        if (this.isConnected) this._r();
      }
      _r() {
        var n = this.getAttribute('name');
        if (!n) return;
        var s = this.getAttribute('seed');
        this.innerHTML = DoodleKit[kind](n, s != null ? {
          seed: +s
        } : undefined);
      }
    });
  }
  define('doodle-mark', 'mark');
  define('doodle-ill', 'ill');
})(window);
})(); } catch (e) { __ds_ns.__errors.push({ path: "uploads/Design system setup/doodle-kit.js", error: String((e && e.message) || e) }); }

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
