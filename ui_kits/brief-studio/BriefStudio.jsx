/* Brief Studio — the intake screen.
   Left: a fillable brief (type-first, post, titles, references, sketch,
   dynamic carousel steps, brand layer). Right: a LIVE LinkedIn feed preview
   built from the brief, with a senior-designer advice banner + critical
   pushback on the chosen type. Generates the filled brief text on demand. */
(function () {
  const { useState, useRef, useEffect, useCallback } = React;
  const DS = window.LinkedInVisualDesignSystemTesting_727cb3;
  const { Canvas, Chrome, Eyebrow, Headline, Mark, Subhead, Stat, Quote, Attribution, InfoCard, Chip } = DS;
  const FeedPost = DS.FeedPost;
  const KEY = "li-vds-brief-v1";

  const TYPES = [
    { id: "single", label: "Single", desc: "One message, one visual" },
    { id: "carousel", label: "Carousel", desc: "A story over slides" },
    { id: "infographic", label: "Infographic", desc: "A dense cheat-sheet" },
    { id: "quote", label: "Quote", desc: "One pulled sentence" },
  ];
  const SIGS = ["underline", "block", "bubble", "plain"];
  const FONTS = ["Inter", "Plus Jakarta Sans", "Space Grotesk", "Sora"];
  const SWATCHES = ["#0A66C2", "#1F8A5B", "#C2410C", "#7C3AED", "#0F766E", "#BE123C", "#16232B"];
  const DEFAULT_STEPS = () => [
    { role: "loud", label: "Cover", note: "The promise / hook" },
    { role: "light", label: "Context", note: "Set up where this starts" },
    { role: "section", label: "Problem", note: "The core tension" },
    { role: "light", label: "Step 1", note: "First move" },
    { role: "section", label: "Result", note: "Proof it worked" },
    { role: "loud", label: "Back cover", note: "Your CTA" },
  ];
  const ROLE_NEXT = { loud: "light", light: "section", section: "loud" };

  const DEFAULT = {
    type: "carousel", post: "", oneThing: "", heading: "", subheading: "",
    name: "Your name", category: "Your category / function",
    second: "derive", signature: "underline", primary: "#0A66C2", font: "Inter",
    quote: "", attrName: "", attrRole: "",
    steps: DEFAULT_STEPS(),
  };

  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) return { ...DEFAULT, ...s }; } catch (e) {}
    return DEFAULT;
  }

  /* ---------- senior-designer advice (lightweight heuristics) ---------- */
  function advise(b) {
    const out = [];
    const len = b.post.trim().length;
    const hasList = /(^|\n)\s*(\d+[\.\)]|[-•])/.test(b.post);
    const hasNumber = /\b\d+([.,]\d+)?\s?(%|x|×|k|m|\+)?\b/i.test(b.post);
    if (!len) out.push({ t: "tip", m: "Paste the post (or the idea) first — the visual follows the post, never the reverse." });
    if (b.type === "carousel" && len > 0 && len < 220 && !hasList)
      out.push({ t: "warn", m: "This reads short for a carousel. A single visual will likely hit harder — want me to switch it?" });
    if (b.type === "single" && hasList)
      out.push({ t: "warn", m: "The post lists multiple points — an infographic or carousel carries them better than one single." });
    if (b.type === "infographic" && len > 0 && !hasList && !hasNumber)
      out.push({ t: "warn", m: "An infographic needs structure (steps, a matrix, stats). I don't see distinct parts yet — what are the cells?" });
    if (b.type === "quote" && !b.quote.trim())
      out.push({ t: "tip", m: "Pull the exact sentence from the post, verbatim — that's what a quote visual lives on." });
    if (b.second === "derive" && !b.heading.trim())
      out.push({ t: "tip", m: "The heading should differ from the post's first line — I'll re-hook it, not repeat it." });
    if (hasNumber && b.type === "single")
      out.push({ t: "good", m: "There's a number in here — one big stat could be the whole visual. Strong save-trigger." });
    if (!out.length) out.push({ t: "good", m: "Brief looks coherent. I'll build it and then push back on anything that fights the layout." });
    return out;
  }

  /* ---------- live visual builder (form → DS components) ---------- */
  function themeStyle(b) {
    return { "--brand-primary": b.primary, "--brand-font": `'${b.font}', system-ui, sans-serif`, "--brand-font-display": `'${b.font}', system-ui, sans-serif` };
  }
  function loadFont(font) {
    const id = "bs-font-" + font.replace(/\s+/g, "-");
    if (document.getElementById(id)) return;
    const l = document.createElement("link"); l.id = id; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=" + font.replace(/\s+/g, "+") + ":wght@400;500;600;700;800&display=swap";
    document.head.appendChild(l);
  }
  const Mk = (heading, sig) => {
    // wrap the last 1-2 words in a signature Mark
    const words = (heading || "").trim().split(" ");
    if (words.length < 2) return heading || "Your headline here";
    const head = words.slice(0, -2).join(" ");
    const tail = words.slice(-2).join(" ");
    return [head + " ", React.createElement(Mark, { key: "m", signature: sig }, tail)];
  };

  function buildSingle(b) {
    return React.createElement(Canvas, { role: "light" },
      React.createElement(Chrome, { name: b.name, category: b.category, position: "top" }),
      React.createElement("div", { style: { position: "absolute", left: "var(--margin)", right: "var(--margin)", top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center" } },
        React.createElement(Eyebrow, null, b.oneThing || "The re-hook"),
        React.createElement(Headline, { size: "lg", style: { marginTop: 18 } }, Mk(b.heading, b.signature)),
        b.subheading ? React.createElement(Subhead, { style: { marginTop: 24 } }, b.subheading) : null));
  }
  function buildQuote(b) {
    return React.createElement(Canvas, { role: "light" },
      React.createElement(Chrome, { name: b.name, category: b.category, position: "top" }),
      React.createElement("div", { style: { position: "absolute", left: "var(--margin)", right: "150px", top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center" } },
        React.createElement(Quote, { label: "QUOTE" }, b.quote || "Pull the exact sentence from your post."),
        React.createElement(Attribution, { name: b.attrName || b.name, role: b.attrRole || b.category, style: { marginTop: 70 } })));
  }
  function buildInfographic(b) {
    return React.createElement(Canvas, { role: "light", density: "tight" },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
        React.createElement("span", { style: { fontWeight: 600, fontSize: 22, letterSpacing: ".06em" } }, b.name),
        React.createElement("span", { style: { fontWeight: 600, fontSize: 22, letterSpacing: ".06em", color: "var(--muted)" } }, b.category)),
      React.createElement(Headline, { size: "sm", style: { marginTop: 44 } }, Mk(b.heading, b.signature)),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginTop: 36 } },
        React.createElement(InfoCard, { number: 1, label: "Step", heading: "Mini-heading" }, React.createElement("div", { style: { display: "flex", gap: 10 } }, React.createElement(Chip, null, "tag"))),
        React.createElement(InfoCard, { number: 2, label: "Step", heading: "Mini-heading", emphasis: true })));
  }
  function buildPage(b, step, i, total) {
    const isCover = i === 0, isBack = i === total - 1;
    return React.createElement(Canvas, { role: step.role },
      React.createElement(Chrome, { name: b.name, category: b.category, position: isCover || isBack ? "bottom" : "top", swipe: !isBack }),
      React.createElement("div", { style: { position: "absolute", left: "var(--margin)", right: "var(--margin)", top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center" } },
        React.createElement(Eyebrow, { color: step.role === "section" ? "var(--accent)" : undefined }, step.label),
        React.createElement(Headline, { size: isCover ? "lg" : "md", style: { marginTop: 16 } }, step.note || (isCover ? (b.heading || "Cover headline") : "One idea")) ));
  }

  function Fit({ node, w }) {
    const s = w / 1080;
    return React.createElement("div", { style: { width: w, height: w * 1.25, overflow: "hidden" } },
      React.createElement("div", { style: { width: 1080, height: 1350, transform: `scale(${s})`, transformOrigin: "top left" } }, node));
  }

  function Preview({ b }) {
    useEffect(() => loadFont(b.font), [b.font]);
    if (!FeedPost) return React.createElement("div", { style: { padding: "40px 20px", textAlign: "center", color: "#9aa0a6", fontSize: 13, border: "1px dashed #cfd3d8", borderRadius: 12, background: "#fff" } }, "Preview loads once the design-system bundle is compiled — reload this page.");
    const theme = themeStyle(b);
    const author = { name: b.name, headline: b.category, time: "21h" };
    const W = 472;
    if (b.type === "carousel") {
      const pages = b.steps.map((st, i) => React.createElement("div", { key: i, style: theme }, Fit({ node: buildPage(b, st, i, b.steps.length), w: W - 56 })));
      return React.createElement(FeedPost, { mode: "carousel", width: W, author, docTitle: b.heading || "Your carousel", text: b.post || "Your post caption appears here.", pages });
    }
    const node = b.type === "quote" ? buildQuote(b) : b.type === "infographic" ? buildInfographic(b) : buildSingle(b);
    return React.createElement(FeedPost, { mode: "single", width: W, author, text: b.post || "Your post caption appears here.", media: React.createElement("div", { style: theme }, Fit({ node, w: W })) });
  }

  /* ---------- brief text generator ---------- */
  function briefText(b) {
    const L = [];
    L.push("=== LINKEDIN VISUAL — BRIEF ===", "");
    L.push("POST OR IDEA → " + (b.post || "(empty)"), "");
    L.push("VISUAL TYPE → " + b.type, "");
    L.push("ONE THING → " + (b.oneThing || "(empty)"), "");
    L.push("IDENTITY BAR → " + b.name + " · " + b.category, "");
    L.push("SECOND HOOK → " + (b.second === "derive" ? "derive it for me" : (b.heading || "(empty)")), "");
    L.push("SUBHEADING → " + (b.subheading || "(none)"), "");
    L.push("BRAND LAYER → primary " + b.primary + " · font " + b.font, "");
    L.push("SIGNATURE → " + b.signature, "");
    if (b.type === "carousel") {
      L.push("--- carousel pages ---");
      b.steps.forEach((s, i) => L.push(`  ${i + 1}. [${s.role}] ${s.label}${s.note ? " — " + s.note : ""}`));
    }
    if (b.type === "quote") { L.push("QUOTE → " + (b.quote || "(empty)")); L.push("ATTRIBUTION → " + b.attrName + " · " + b.attrRole); }
    L.push("", "=== END ===");
    return L.join("\n");
  }

  /* =================== UI =================== */
  function BriefStudio() {
    const [b, setB] = useState(load);
    const [refs, setRefs] = useState([]);     // {url} reference images (not persisted)
    const [toast, setToast] = useState(null);
    const set = (patch) => setB((p) => { const n = { ...p, ...patch }; try { const { steps, ...rest } = n; localStorage.setItem(KEY, JSON.stringify(n)); } catch (e) {} return n; });
    const flash = (m) => { setToast(m); clearTimeout(flash._t); flash._t = setTimeout(() => setToast(null), 2400); };
    const notes = advise(b);

    const onFiles = (files) => {
      [...files].filter((f) => f.type.startsWith("image/")).forEach((f) => {
        const r = new FileReader(); r.onload = () => setRefs((p) => [...p, { url: r.result, name: f.name }]); r.readAsDataURL(f);
      });
    };

    // carousel step ops
    const stepOp = (i, op, patch) => set({ steps: (() => {
      const s = b.steps.slice();
      if (op === "del") s.splice(i, 1);
      else if (op === "up" && i > 0) { [s[i - 1], s[i]] = [s[i], s[i - 1]]; }
      else if (op === "down" && i < s.length - 1) { [s[i + 1], s[i]] = [s[i], s[i + 1]]; }
      else if (op === "role") s[i] = { ...s[i], role: ROLE_NEXT[s[i].role] };
      else if (op === "edit") s[i] = { ...s[i], ...patch };
      return s;
    })() });
    const addStep = () => set({ steps: [...b.steps.slice(0, -1), { role: "light", label: "Step " + b.steps.length, note: "" }, b.steps[b.steps.length - 1]] });

    return React.createElement("div", { style: { display: "grid", gridTemplateColumns: "minmax(0,1fr) 520px", minHeight: "100vh", background: "#f1f2f4", fontFamily: "system-ui,-apple-system,sans-serif", color: "#1f2328" } }, [
      /* ---- left: the form ---- */
      React.createElement("div", { key: "form", style: { padding: "28px 34px", overflowY: "auto", maxHeight: "100vh" } }, [
        React.createElement("div", { key: "h", style: { marginBottom: 22 } }, [
          React.createElement("div", { key: "t", style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, letterSpacing: "-.02em" } }, "Brief Studio"),
          React.createElement("div", { key: "s", style: { fontSize: 14, color: "#6b7280", marginTop: 3 } }, "Fill the brief — I'll guide, push back, and build. You don't need to be a designer."),
        ]),

        Section("1 · What type?", [
          React.createElement("div", { key: "g", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
            TYPES.map((t) => React.createElement("button", {
              key: t.id, onClick: () => set({ type: t.id }),
              style: typeCard(b.type === t.id),
            }, [
              React.createElement("span", { key: "l", style: { fontWeight: 700, fontSize: 15 } }, t.label),
              React.createElement("span", { key: "d", style: { fontSize: 12.5, color: b.type === t.id ? "rgba(255,255,255,.85)" : "#8a9098" } }, t.desc),
            ]))),
          React.createElement("div", { key: "hint", style: { fontSize: 12.5, color: "#8a9098", marginTop: 9 } }, "Not sure? Paste the post below — the advice panel will tell you which type fits."),
        ]),

        Section("2 · The post", [
          field("Post or idea (paste it all)", textarea(b.post, (v) => set({ post: v }), "Paste the full LinkedIn post, or describe the idea…", 5)),
          field("The one thing to remember / save", input(b.oneThing, (v) => set({ oneThing: v }), "e.g. cold DMs fail on the first line")),
        ]),

        Section("3 · Heading & hook", [
          React.createElement("div", { key: "seg", style: { display: "flex", gap: 8, marginBottom: 10 } },
            [["derive", "Derive the hook for me"], ["own", "I'll write it"]].map(([v, l]) =>
              React.createElement("button", { key: v, onClick: () => set({ second: v }), style: seg(b.second === v) }, l))),
          b.second === "own" ? field("Visual heading (differs from the post's first line)", input(b.heading, (v) => set({ heading: v }), "Most outreach fails on the first line")) : null,
          field("Subheading (optional)", input(b.subheading, (v) => set({ subheading: v }), "One supporting line that adds context")),
          field("Headline signature", React.createElement("div", { style: { display: "flex", gap: 8 } },
            SIGS.map((s) => React.createElement("button", { key: s, onClick: () => set({ signature: s }), style: seg(b.signature === s) }, s)))),
        ]),

        Section("4 · Identity bar", [
          React.createElement("div", { key: "r", style: { display: "flex", gap: 12 } }, [
            React.createElement("div", { key: "n", style: { flex: 1 } }, field("Name (left)", input(b.name, (v) => set({ name: v })))),
            React.createElement("div", { key: "c", style: { flex: 1 } }, field("Category / function (right)", input(b.category, (v) => set({ category: v })))),
          ]),
        ]),

        b.type === "carousel" ? Section("5 · Carousel pages", [
          React.createElement("div", { key: "steps", style: { display: "flex", flexDirection: "column", gap: 8 } },
            b.steps.map((s, i) => React.createElement(StepRow, { key: i, s, i, total: b.steps.length, stepOp }))),
          React.createElement("button", { key: "add", onClick: addStep, style: addBtn() }, "+ Add a page"),
          React.createElement("div", { key: "h", style: { fontSize: 12.5, color: "#8a9098", marginTop: 8 } }, "Click the colour dot to cycle a page's role: loud (cover) · light (step) · section (chapter marker)."),
        ]) : null,

        b.type === "quote" ? Section("5 · The quote", [
          field("Exact sentence (verbatim from the post)", textarea(b.quote, (v) => set({ quote: v }), "The visual carries the save, not the caption.", 3)),
          React.createElement("div", { key: "r", style: { display: "flex", gap: 12 } }, [
            React.createElement("div", { key: "n", style: { flex: 1 } }, field("Attribution name", input(b.attrName, (v) => set({ attrName: v }), b.name))),
            React.createElement("div", { key: "ro", style: { flex: 1 } }, field("Attribution role", input(b.attrRole, (v) => set({ attrRole: v }), b.category))),
          ]),
        ]) : null,

        Section("6 · References & sketch", [
          React.createElement(Dropzone, { key: "dz", onFiles, refs, clear: () => setRefs([]) }),
          React.createElement("div", { key: "sk", style: { marginTop: 12 } }, [
            React.createElement("div", { key: "l", style: labelStyle() }, "Sketch how you picture it"),
            React.createElement(SketchPad, { key: "p" }),
          ]),
        ]),

        Section("7 · Brand layer", [
          field("Primary colour", React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
            SWATCHES.map((c) => React.createElement("button", { key: c, onClick: () => set({ primary: c }), title: c,
              style: { width: 30, height: 30, borderRadius: 8, background: c, border: b.primary === c ? "3px solid #1f2328" : "1px solid #d8dadd", cursor: "pointer" } })))),
          field("Font", React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
            FONTS.map((f) => React.createElement("button", { key: f, onClick: () => set({ font: f }), style: seg(b.font === f) }, f)))),
        ]),

        React.createElement("div", { key: "actions", style: { display: "flex", gap: 10, margin: "8px 0 40px" } }, [
          React.createElement("button", { key: "copy", onClick: () => { navigator.clipboard && navigator.clipboard.writeText(briefText(b)); flash("Brief copied — paste it to start a build"); }, style: primaryBtn(b.primary) }, "Copy filled brief"),
          React.createElement("button", { key: "reset", onClick: () => { setB(DEFAULT); flash("Reset"); }, style: ghostBtn() }, "Reset"),
        ]),
      ]),

      /* ---- right: live preview ---- */
      React.createElement("div", { key: "prev", style: { borderLeft: "1px solid #e2e4e7", background: "#F4F2EE", padding: "24px 26px", overflowY: "auto", maxHeight: "100vh", position: "sticky", top: 0 } }, [
        React.createElement("div", { key: "h", style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 } }, [
          React.createElement("span", { key: "t", style: { fontWeight: 700, fontSize: 14 } }, "Preview · in the LinkedIn feed"),
          React.createElement("span", { key: "tag", style: { fontSize: 11.5, fontWeight: 600, color: "#6b7280", background: "#fff", border: "1px solid #e0e2e5", borderRadius: 999, padding: "3px 10px" } }, b.type),
        ]),
        /* advice banner */
        React.createElement("div", { key: "adv", style: { display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 } },
          notes.map((n, i) => React.createElement("div", { key: i, style: notice(n.t) }, [
            React.createElement("span", { key: "d", style: { fontWeight: 700, marginRight: 6 } }, n.t === "warn" ? "Pushback:" : n.t === "good" ? "Good:" : "Tip:"),
            n.m,
          ]))),
        React.createElement(Preview, { key: "p", b }),
        React.createElement("div", { key: "note", style: { fontSize: 12, color: "#8a9098", marginTop: 12, lineHeight: 1.5 } }, "Live mock from your brief. This is how the visual lands in the feed — single image or swipeable carousel."),
      ]),

      toast ? React.createElement("div", { key: "toast", style: { position: "fixed", bottom: 26, left: "50%", transform: "translateX(-50%)", background: "#1f2328", color: "#fff", padding: "11px 18px", borderRadius: 11, fontSize: 13.5, fontWeight: 500, zIndex: 80 } }, toast) : null,
    ]);
  }

  /* ---------- small UI helpers ---------- */
  function Section(title, children) {
    return React.createElement("section", { key: title, style: { marginBottom: 22, background: "#fff", border: "1px solid #e6e8eb", borderRadius: 14, padding: "16px 18px" } }, [
      React.createElement("div", { key: "t", style: { fontWeight: 700, fontSize: 13, letterSpacing: ".02em", textTransform: "uppercase", color: "#9aa0a6", marginBottom: 12 } }, title),
      ...[].concat(children),
    ]);
  }
  function labelStyle() { return { fontSize: 13, fontWeight: 600, color: "#3a3f45", marginBottom: 6, display: "block" }; }
  function field(label, control) {
    return React.createElement("div", { key: label, style: { marginBottom: 12 } }, [
      React.createElement("label", { key: "l", style: labelStyle() }, label),
      React.cloneElement(control, { key: "ctrl" }),
    ]);
  }
  const inputBase = { width: "100%", boxSizing: "border-box", border: "1px solid #d8dadd", borderRadius: 9, padding: "9px 11px", fontSize: 14, fontFamily: "inherit", color: "#1f2328", outline: "none", background: "#fff" };
  function input(val, onChange, ph) { return React.createElement("input", { value: val, placeholder: ph || "", onChange: (e) => onChange(e.target.value), style: inputBase }); }
  function textarea(val, onChange, ph, rows) { return React.createElement("textarea", { value: val, placeholder: ph || "", rows: rows || 3, onChange: (e) => onChange(e.target.value), style: { ...inputBase, resize: "vertical", lineHeight: 1.5 } }); }
  function typeCard(on) { return { display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-start", textAlign: "left", padding: "12px 14px", borderRadius: 11, cursor: "pointer", border: on ? "1px solid transparent" : "1px solid #d8dadd", background: on ? "#0A66C2" : "#fff", color: on ? "#fff" : "#1f2328" }; }
  function seg(on) { return { padding: "7px 13px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, textTransform: "capitalize", border: on ? "1px solid transparent" : "1px solid #d8dadd", background: on ? "#1f2328" : "#fff", color: on ? "#fff" : "#5f6671" }; }
  function addBtn() { return { marginTop: 10, padding: "9px 14px", borderRadius: 9, border: "1px dashed #c4c8cd", background: "#fafbfc", color: "#5f6671", fontSize: 13.5, fontWeight: 600, cursor: "pointer", width: "100%" }; }
  function primaryBtn(c) { return { padding: "11px 18px", borderRadius: 10, border: "none", background: c, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }; }
  function ghostBtn() { return { padding: "11px 16px", borderRadius: 10, border: "1px solid #d8dadd", background: "#fff", color: "#5f6671", fontSize: 14, fontWeight: 600, cursor: "pointer" }; }
  function notice(t) {
    const c = t === "warn" ? { bg: "#fff4e5", bd: "#ffd9a8", fg: "#8a5200" } : t === "good" ? { bg: "#e7f6ee", bd: "#bce8cf", fg: "#1f6b43" } : { bg: "#eef4fc", bd: "#cfe0f5", fg: "#1d4e85" };
    return { background: c.bg, border: "1px solid " + c.bd, color: c.fg, borderRadius: 10, padding: "9px 12px", fontSize: 12.8, lineHeight: 1.45 };
  }

  function StepRow({ s, i, total, stepOp }) {
    const dot = { loud: "#0A66C2", light: "#cdd9e8", section: "#16232B" }[s.role];
    return React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 9, background: "#fafbfc", border: "1px solid #e6e8eb", borderRadius: 10, padding: "7px 9px" } }, [
      React.createElement("button", { key: "role", onClick: () => stepOp(i, "role"), title: s.role, style: { width: 22, height: 22, flex: "none", borderRadius: "50%", background: dot, border: "1px solid rgba(0,0,0,.12)", cursor: "pointer" } }),
      React.createElement("span", { key: "n", style: { fontSize: 12, color: "#9aa0a6", width: 16, flex: "none", fontWeight: 700 } }, i + 1),
      React.createElement("input", { key: "lab", value: s.label, onChange: (e) => stepOp(i, "edit", { label: e.target.value }), style: { width: 92, flex: "none", border: "1px solid #e0e2e5", borderRadius: 7, padding: "5px 7px", fontSize: 12.5, fontWeight: 600 } }),
      React.createElement("input", { key: "note", value: s.note, placeholder: "what's on this page…", onChange: (e) => stepOp(i, "edit", { note: e.target.value }), style: { flex: 1, minWidth: 0, border: "1px solid #e0e2e5", borderRadius: 7, padding: "5px 7px", fontSize: 12.5 } }),
      React.createElement("div", { key: "ops", style: { display: "flex", gap: 2 } }, [
        miniBtn("↑", () => stepOp(i, "up"), i === 0),
        miniBtn("↓", () => stepOp(i, "down"), i === total - 1),
        miniBtn("✕", () => stepOp(i, "del"), total <= 2),
      ]),
    ]);
  }
  function miniBtn(label, onClick, disabled) {
    return React.createElement("button", { key: label, onClick, disabled, style: { width: 24, height: 24, borderRadius: 6, border: "1px solid #e0e2e5", background: "#fff", color: disabled ? "#cbced2" : "#5f6671", cursor: disabled ? "default" : "pointer", fontSize: 12, lineHeight: 1, padding: 0 } }, label);
  }

  function Dropzone({ onFiles, refs, clear }) {
    const [over, setOver] = useState(false);
    const inp = useRef(null);
    return React.createElement("div", null, [
      React.createElement("div", {
        key: "dz",
        onClick: () => inp.current && inp.current.click(),
        onDragOver: (e) => { e.preventDefault(); setOver(true); },
        onDragLeave: () => setOver(false),
        onDrop: (e) => { e.preventDefault(); setOver(false); onFiles(e.dataTransfer.files); },
        style: { border: "2px dashed " + (over ? "#0A66C2" : "#cfd3d8"), borderRadius: 11, padding: "18px", textAlign: "center", cursor: "pointer", background: over ? "#eef4fc" : "#fafbfc", color: "#6b7280", fontSize: 13 },
      }, [
        React.createElement("div", { key: "t", style: { fontWeight: 600 } }, "Drop reference screenshots, or click to upload"),
        React.createElement("div", { key: "s", style: { fontSize: 12, marginTop: 3, color: "#9aa0a6" } }, "Examples you love, a competitor post, anything that shows what you're after"),
        React.createElement("input", { key: "i", ref: inp, type: "file", accept: "image/*", multiple: true, onChange: (e) => onFiles(e.target.files), style: { display: "none" } }),
      ]),
      refs.length ? React.createElement("div", { key: "thumbs", style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10, alignItems: "center" } }, [
        ...refs.map((r, i) => React.createElement("img", { key: i, src: r.url, alt: r.name, style: { width: 56, height: 56, objectFit: "cover", borderRadius: 8, border: "1px solid #e0e2e5" } })),
        React.createElement("button", { key: "clr", onClick: clear, style: { fontSize: 12, color: "#9aa0a6", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" } }, "clear"),
      ]) : null,
    ]);
  }

  function SketchPad() {
    const ref = useRef(null), drawing = useRef(false);
    const [color, setColor] = useState("#1f2328");
    useEffect(() => {
      const c = ref.current; const ctx = c.getContext("2d");
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
    }, []);
    const pos = (e) => { const r = ref.current.getBoundingClientRect(); const t = e.touches ? e.touches[0] : e; return { x: (t.clientX - r.left), y: (t.clientY - r.top) }; };
    const start = (e) => { drawing.current = true; const ctx = ref.current.getContext("2d"); const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
    const move = (e) => { if (!drawing.current) return; e.preventDefault(); const ctx = ref.current.getContext("2d"); const p = pos(e); ctx.strokeStyle = color; ctx.lineWidth = color === "#fff" ? 18 : 3; ctx.lineTo(p.x, p.y); ctx.stroke(); };
    const end = () => { drawing.current = false; };
    const clear = () => { const c = ref.current, ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); };
    return React.createElement("div", null, [
      React.createElement("canvas", { key: "c", ref, width: 468, height: 200,
        onMouseDown: start, onMouseMove: move, onMouseUp: end, onMouseLeave: end,
        onTouchStart: start, onTouchMove: move, onTouchEnd: end,
        style: { width: "100%", height: 200, border: "1px solid #d8dadd", borderRadius: 11, cursor: "crosshair", touchAction: "none", background: "#fff" } }),
      React.createElement("div", { key: "tools", style: { display: "flex", gap: 7, marginTop: 8, alignItems: "center" } }, [
        ...["#1f2328", "#0A66C2", "#C2410C"].map((c) => React.createElement("button", { key: c, onClick: () => setColor(c), style: { width: 22, height: 22, borderRadius: "50%", background: c, border: color === c ? "3px solid #9aa0a6" : "1px solid #d8dadd", cursor: "pointer" } })),
        React.createElement("button", { key: "erase", onClick: () => setColor("#fff"), style: { ...segMini(color === "#fff") } }, "Eraser"),
        React.createElement("button", { key: "clr", onClick: clear, style: segMini(false) }, "Clear"),
      ]),
    ]);
  }
  function segMini(on) { return { padding: "5px 11px", borderRadius: 7, fontSize: 12, fontWeight: 600, border: on ? "1px solid transparent" : "1px solid #d8dadd", background: on ? "#1f2328" : "#fff", color: on ? "#fff" : "#5f6671", cursor: "pointer" }; }

  window.BriefStudio = BriefStudio;
})();
