/* Setup — the first-run onboarding wizard.
   A guided, stepped setup: brand identity → colours → spacing & shape →
   done. Left = the questions; right = a LIVE single visual that updates
   as you choose. Ends by generating the branch's overrides/*.css to save,
   then sends the user on to make visuals. */
(function () {
  const { useState, useEffect, useRef } = React;
  const h = React.createElement;
  const DS = window.LinkedInVisualDesignSystemTesting_727cb3;
  const KEY = "li-vds-setup-v1";
  const DONE_KEY = "li-vds-setup-done";

  const FONTS = ["Inter", "Plus Jakarta Sans", "Space Grotesk", "Sora", "Fraunces", "DM Sans"];
  const SWATCHES = ["#0A66C2", "#1F8A5B", "#C2410C", "#7C3AED", "#0F766E", "#BE123C", "#0B7285", "#16232B"];
  const SIGS = ["underline", "block", "bubble", "plain"];
  const STEPS = ["Welcome", "Identity", "Colours", "Spacing & shape", "Ready"];

  const DEFAULT = {
    font: "Inter", primary: "#0A66C2", secondary: "#16232B", accent: "#E7A33E", tint: 7,
    signature: "underline", name: "Your name", category: "Your category / function",
    logo: null, photo: null, margin: 72, radiusCard: 16, radiusCta: 18,
  };

  function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) return { ...DEFAULT, ...s }; } catch (e) {} return DEFAULT; }
  function loadFont(font) {
    const id = "su-font-" + font.replace(/\s+/g, "-"); if (document.getElementById(id)) return;
    const l = document.createElement("link"); l.id = id; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=" + font.replace(/\s+/g, "+") + ":ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap";
    document.head.appendChild(l);
  }
  // suggest a deep secondary derived from primary (for the section role)
  function deriveSecondary(hex) {
    const n = hex.replace("#", ""); const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
    const f = 0.26; const d = (x) => Math.round(x * f).toString(16).padStart(2, "0");
    return "#" + d(r) + d(g) + d(b);
  }

  function themeVars(b) {
    return {
      "--brand-primary": b.primary, "--brand-secondary": b.secondary, "--brand-accent": b.accent,
      "--brand-tint": b.tint + "%",
      "--brand-font": `'${b.font}', system-ui, sans-serif`, "--brand-font-display": `'${b.font}', system-ui, sans-serif`,
      "--margin": b.margin + "px", "--radius-card": b.radiusCard + "px", "--radius-cta": b.radiusCta + "px",
    };
  }

  /* ---------- the live preview visual ---------- */
  function PreviewVisual({ b }) {
    const { Canvas, Eyebrow, Headline, Mark, Subhead } = DS;
    if (!Canvas) return h("div", { style: { color: "#9aa0a6", fontSize: 13, padding: 40 } }, "Preview loads once the bundle is compiled — reload.");
    return h(Canvas, { role: "light" }, [
      // chrome with optional logo
      h("div", { key: "ch", style: { position: "absolute", top: "var(--margin)", left: "var(--margin)", right: "var(--margin)", display: "flex", justifyContent: "space-between", alignItems: "center" } }, [
        h("div", { key: "l", style: { display: "flex", alignItems: "center", gap: 16 } }, [
          b.logo ? h("img", { key: "lg", src: b.logo, style: { height: 48, maxWidth: 200, objectFit: "contain" } }) : null,
          h("span", { key: "nm", style: { fontWeight: 600, fontSize: 22, letterSpacing: ".06em", color: "var(--fg)" } }, b.name),
        ]),
        h("span", { key: "c", style: { fontWeight: 600, fontSize: 22, letterSpacing: ".06em", color: "var(--muted)" } }, b.category),
      ]),
      // center message
      h("div", { key: "mid", style: { position: "absolute", left: "var(--margin)", right: "var(--margin)", top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center" } }, [
        h(Eyebrow, { key: "e" }, "This is your style"),
        h(Headline, { key: "hh", size: "lg", style: { marginTop: 18 } }, ["Your headline, with an ", h(Mark, { key: "m", signature: b.signature }, "emphasis")]),
        h(Subhead, { key: "s", style: { marginTop: 24 } }, "Colours, font, spacing and shape — all set from your answers on the left."),
      ]),
      // footer profile lockup
      b.photo ? h("div", { key: "ft", style: { position: "absolute", left: "var(--margin)", right: "var(--margin)", bottom: "var(--margin)", display: "flex", alignItems: "center", gap: 20 } }, [
        h("img", { key: "p", src: b.photo, style: { width: 84, height: 84, borderRadius: "50%", objectFit: "cover", border: "1.5px solid var(--canvas-light-line)" } }),
        h("div", { key: "d", style: { display: "flex", flexDirection: "column" } }, [
          h("span", { key: "n", style: { fontWeight: 700, fontSize: 26, color: "var(--fg)" } }, b.name),
          h("span", { key: "r", style: { fontWeight: 500, fontSize: 20, color: "var(--muted)" } }, b.category),
        ]),
      ]) : null,
    ]);
  }

  function Stage({ b }) {
    const W = 432, s = W / 1080;
    return h("div", { style: { width: W, height: W * 1.25, borderRadius: 4, overflow: "hidden", boxShadow: "0 14px 50px rgba(0,0,0,.18)", background: "#fff", flex: "none" } },
      h("div", { style: { width: 1080, height: 1350, transform: `scale(${s})`, transformOrigin: "top left" } },
        h(PreviewVisual, { b })));
  }

  /* ---------- override-file generators ---------- */
  function brandCss(b) {
    return `:root {
  --brand-primary:   ${b.primary};
  --brand-secondary: ${b.secondary};
  --brand-accent:    ${b.accent};
  --brand-tint: ${b.tint}%;
  --brand-font:         '${b.font}', system-ui, sans-serif;
  --brand-font-display: '${b.font}', system-ui, sans-serif;
  --signature: ${b.signature};
}`;
  }
  function extrasCss(b) {
    return `:root {
  --margin: ${b.margin}px;
  --radius-card: ${b.radiusCard}px;
  --radius-cta: ${b.radiusCta}px;
}`;
  }

  /* =================== wizard =================== */
  function Setup() {
    const [b, setB] = useState(load);
    const [step, setStep] = useState(0);
    const [toast, setToast] = useState(null);
    const set = (patch) => setB((p) => { const n = { ...p, ...patch }; try { localStorage.setItem(KEY, JSON.stringify(n)); } catch (e) {} return n; });
    const flash = (m) => { setToast(m); clearTimeout(flash._t); flash._t = setTimeout(() => setToast(null), 2400); };
    useEffect(() => loadFont(b.font), [b.font]);
    // Apply brand vars to :root (not a nested div) so derived aliases
    // (--font-display, --canvas-light-bg color-mix, etc.) re-resolve correctly.
    useEffect(() => {
      const r = document.documentElement.style;
      const v = themeVars(b);
      Object.keys(v).forEach((k) => r.setProperty(k, v[k]));
    }, [b]);

    const onImg = (file, key) => { if (!file) return; const r = new FileReader(); r.onload = () => set({ [key]: r.result }); r.readAsDataURL(file); };
    const copy = (text, what) => { navigator.clipboard && navigator.clipboard.writeText(text); flash(what + " copied"); };
    const download = (text, filename) => {
      const blob = new Blob([text], { type: "text/css" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click();
      document.body.removeChild(a); setTimeout(() => URL.revokeObjectURL(url), 1000); flash(filename + " downloaded");
    };
    const finish = () => { localStorage.setItem(DONE_KEY, "1"); setStep(4); };

    const showPreview = step >= 1 && step <= 3;

    return h("div", { style: { minHeight: "100vh", background: "#f1f2f4", fontFamily: "system-ui,-apple-system,sans-serif", color: "#1f2328", display: "grid", gridTemplateColumns: showPreview ? "minmax(0,1fr) 520px" : "1fr" } }, [

      /* ---- left ---- */
      h("div", { key: "l", style: { padding: "30px 38px", overflowY: "auto", maxHeight: "100vh", maxWidth: showPreview ? "none" : 720, margin: showPreview ? 0 : "0 auto", width: "100%", boxSizing: "border-box" } }, [
        // progress rail
        h("div", { key: "rail", style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 26 } },
          STEPS.map((s, i) => h("div", { key: i, style: { display: "flex", alignItems: "center", gap: 8 } }, [
            h("div", { key: "d", style: { display: "flex", alignItems: "center", gap: 7 } }, [
              h("span", { key: "n", style: { width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: i < step ? "#1f8a5b" : i === step ? "#0A66C2" : "#e2e4e7", color: i <= step ? "#fff" : "#9aa0a6" } }, i < step ? "✓" : i + 1),
              h("span", { key: "l", style: { fontSize: 12.5, fontWeight: 600, color: i === step ? "#1f2328" : "#9aa0a6", whiteSpace: "nowrap" } }, s),
            ]),
            i < STEPS.length - 1 ? h("span", { key: "sep", style: { width: 18, height: 2, background: "#e2e4e7", borderRadius: 2 } }) : null,
          ]))),

        step === 0 ? Welcome({ onStart: () => setStep(1) }) : null,
        step === 1 ? StepIdentity({ b, set, onImg }) : null,
        step === 2 ? StepColours({ b, set }) : null,
        step === 3 ? StepSpacing({ b, set }) : null,
        step === 4 ? StepDone({ b, brandCss: brandCss(b), extrasCss: extrasCss(b), copy, download }) : null,

        // nav
        step > 0 && step < 4 ? h("div", { key: "nav", style: { display: "flex", gap: 10, marginTop: 26, marginBottom: 40 } }, [
          h("button", { key: "b", onClick: () => setStep(step - 1), style: ghost() }, "Back"),
          step < 3 ? h("button", { key: "n", onClick: () => setStep(step + 1), style: primary(b.primary) }, "Continue")
            : h("button", { key: "f", onClick: finish, style: primary(b.primary) }, "Finish setup"),
        ]) : null,
        step === 4 ? h("div", { key: "redo", style: { marginBottom: 40 } }, h("button", { onClick: () => setStep(1), style: ghost() }, "← Edit setup again")) : null,
      ]),

      /* ---- right preview ---- */
      showPreview ? h("div", { key: "r", style: { borderLeft: "1px solid #e2e4e7", padding: "30px 26px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, position: "sticky", top: 0, maxHeight: "100vh", overflowY: "auto", background: "#e9ebee" } }, [
        h("div", { key: "t", style: { alignSelf: "stretch", fontWeight: 700, fontSize: 14 } }, "Live preview · single visual"),
        h(Stage, { key: "s", b }),
        h("div", { key: "n", style: { fontSize: 12, color: "#8a9098", textAlign: "center", lineHeight: 1.5, maxWidth: 420 } }, "This is your style applied to a real visual. Carousels, infographics and quotes inherit the same brand."),
      ]) : null,

      toast ? h("div", { key: "toast", style: { position: "fixed", bottom: 26, left: "50%", transform: "translateX(-50%)", background: "#1f2328", color: "#fff", padding: "11px 18px", borderRadius: 11, fontSize: 13.5, fontWeight: 500, zIndex: 80 } }, toast) : null,
    ]);
  }

  /* ---------- steps ---------- */
  function Welcome({ onStart }) {
    return h("div", { key: "w", style: { paddingTop: 30, maxWidth: 560 } }, [
      h("div", { key: "t", style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 38, letterSpacing: "-.025em", lineHeight: 1.08 } }, "Let's set up your brand."),
      h("p", { key: "p", style: { fontSize: 16, color: "#5f6671", lineHeight: 1.55, margin: "16px 0 26px" } }, "A few quick steps and every visual you make will be unmistakably yours. You'll pick your font and colours, add a logo and photo, and fine-tune spacing — with a live preview the whole way. Takes about two minutes."),
      h("div", { key: "list", style: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 30 } },
        [["Identity", "Font, name, logo & profile photo"], ["Colours", "Primary, section & accent — with a smart suggestion"], ["Spacing & shape", "Margins and corner radii to taste"]].map((x, i) =>
          h("div", { key: i, style: { display: "flex", gap: 12, alignItems: "center" } }, [
            h("span", { key: "n", style: { width: 28, height: 28, borderRadius: "50%", background: "#eef4fc", color: "#0A66C2", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flex: "none" } }, i + 1),
            h("div", { key: "d" }, [h("div", { key: "t", style: { fontWeight: 700, fontSize: 14.5 } }, x[0]), h("div", { key: "s", style: { fontSize: 13, color: "#8a9098" } }, x[1])]),
          ]))),
      h("button", { key: "go", onClick: onStart, style: { ...primary("#0A66C2"), fontSize: 15, padding: "13px 26px" } }, "Begin setup →"),
    ]);
  }

  function StepIdentity({ b, set, onImg }) {
    return panel("Identity", "Your font and who you are. The font carries every headline and word.", [
      group("Font", h("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
        FONTS.map((f) => h("button", { key: f, onClick: () => set({ font: f }), style: { ...seg(b.font === f), fontFamily: `'${f}', sans-serif`, fontSize: 14 } }, f)))),
      row([
        group("Name (left of the bar)", textInput(b.name, (v) => set({ name: v }))),
        group("Category / function (right)", textInput(b.category, (v) => set({ category: v }))),
      ], "names"),
      row([
        group("Logo", uploader(b.logo, (f) => onImg(f, "logo"), () => set({ logo: null }), "Upload logo (PNG/SVG)")),
        group("Profile photo (footer)", uploader(b.photo, (f) => onImg(f, "photo"), () => set({ photo: null }), "Upload photo", true)),
      ], "uploads"),
      group("Headline signature", h("div", { style: { display: "flex", gap: 8 } },
        SIGS.map((s) => h("button", { key: s, onClick: () => set({ signature: s }), style: seg(b.signature === s) }, s)))),
    ]);
  }

  function StepColours({ b, set }) {
    const suggestion = deriveSecondary(b.primary);
    return panel("Colours", "One primary does most of the work. The section colour anchors chapter slides; the accent marks and highlights.", [
      group("Primary — your loud canvas (cover / back)", colorField(b.primary, (v) => set({ primary: v }))),
      group("Section — deep colour for chapter slides", h("div", null, [
        colorField(b.secondary, (v) => set({ secondary: v })),
        b.secondary.toLowerCase() !== suggestion.toLowerCase() ? h("button", { key: "sg", onClick: () => set({ secondary: suggestion }), style: { marginTop: 8, fontSize: 12.5, color: "#0A66C2", background: "#eef4fc", border: "1px solid #cfe0f5", borderRadius: 8, padding: "6px 11px", cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 7 } }, [h("span", { key: "d", style: { width: 14, height: 14, borderRadius: 3, background: suggestion } }), "Use a section colour derived from your primary"]) : null,
      ])),
      group("Accent — categorise / highlight", colorField(b.accent, (v) => set({ accent: v }))),
      group("Light canvas tint — " + b.tint + "% of primary", slider(3, 16, 1, b.tint, (v) => set({ tint: v }), "paler ← → bolder")),
      swatchPreview(b),
    ]);
  }

  function StepSpacing({ b, set }) {
    return panel("Spacing & shape", "Fine-tune the feel. The 24px safe band is fixed; everything else is yours to adjust.", [
      group("Content margin — " + b.margin + "px", slider(40, 120, 4, b.margin, (v) => set({ margin: v }), "tighter ← → roomier")),
      group("Card radius — " + b.radiusCard + "px", slider(0, 36, 2, b.radiusCard, (v) => set({ radiusCard: v }), "sharp ← → round")),
      group("CTA radius — " + b.radiusCta + "px", slider(0, 40, 2, b.radiusCta, (v) => set({ radiusCta: v }), "sharp ← → round")),
      h("div", { key: "shapes", style: { display: "flex", gap: 14, marginTop: 8 } }, [
        shapeChip(b.radiusCard, "card"), shapeChip(b.radiusCta, "cta"),
      ]),
    ]);
  }

  function StepDone({ b, brandCss, extrasCss, copy, download }) {
    return h("div", { key: "done", style: { maxWidth: 640 } }, [
      h("div", { key: "t", style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, letterSpacing: "-.02em" } }, "Your brand is ready. 🎉"),
      h("p", { key: "p", style: { fontSize: 15, color: "#5f6671", lineHeight: 1.55, margin: "12px 0 22px" } }, "Download these two files and drop them into your branch — they're yours and master updates never overwrite them. Then just open a chat and start making visuals; no setup needed there."),

      // download buttons — the primary action
      h("div", { key: "dl", style: { display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" } }, [
        h("button", { key: "b1", onClick: () => download(brandCss, "brand.css"), style: { ...primary(b.primary), display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14.5 } }, "↓ Download brand.css"),
        h("button", { key: "b2", onClick: () => download(extrasCss, "extras.css"), style: { ...ghost(), display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14.5 } }, "↓ Download extras.css"),
      ]),

      // where they go
      h("div", { key: "where", style: { fontSize: 13.5, color: "#3a3f45", background: "#f3f6fb", border: "1px solid #dde6f2", borderRadius: 11, padding: "14px 16px", marginBottom: 20, lineHeight: 1.6 } }, [
        h("div", { key: "h", style: { fontWeight: 700, marginBottom: 6 } }, "Where they go in your branch"),
        h("div", { key: "1", style: { fontFamily: "ui-monospace,monospace", fontSize: 12.5, color: "#5f6671" } }, "overrides/brand.css   ← replace the file there"),
        h("div", { key: "2", style: { fontFamily: "ui-monospace,monospace", fontSize: 12.5, color: "#5f6671" } }, "overrides/extras.css  ← replace the file there"),
        (b.logo || b.photo) ? h("div", { key: "3", style: { fontFamily: "ui-monospace,monospace", fontSize: 12.5, color: "#5f6671", marginTop: 4 } }, "client/assets/         ← save your logo / photo here") : null,
      ]),

      // collapsible: copy the raw CSS instead
      h("details", { key: "raw", style: { marginBottom: 18 } }, [
        h("summary", { key: "s", style: { fontSize: 13, color: "#6b7280", cursor: "pointer", fontWeight: 600, marginBottom: 12 } }, "Prefer to copy-paste instead? Show the CSS"),
        codeBlock("overrides/brand.css", brandCss, () => copy(brandCss, "brand.css")),
        codeBlock("overrides/extras.css", extrasCss, () => copy(extrasCss, "extras.css")),
      ]),

      h("p", { key: "next", style: { fontSize: 14, color: "#5f6671", lineHeight: 1.55, margin: "4px 0 0" } }, [
        h("b", { key: "b" }, "Working inside Claude? "), "Just copy the CSS above and paste it into the chat — say \u201csave this as my brand\u201d and the design system writes it to overrides/ for you. Then start making visuals.",
      ]),
    ]);
  }

  /* ---------- helpers ---------- */
  function panel(title, sub, children) {
    return h("div", { key: title, style: { maxWidth: 600 } }, [
      h("div", { key: "t", style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, letterSpacing: "-.02em" } }, title),
      h("p", { key: "s", style: { fontSize: 14.5, color: "#6b7280", lineHeight: 1.5, margin: "8px 0 22px" } }, sub),
      ...children,
    ]);
  }
  function group(label, control) { return h("div", { key: label, style: { marginBottom: 18 } }, [h("label", { key: "l", style: { display: "block", fontSize: 13, fontWeight: 600, color: "#3a3f45", marginBottom: 8 } }, label), control]); }
  function row(items, k) { return h("div", { key: k || "row", style: { display: "flex", gap: 16 } }, items.map((it, i) => h("div", { key: i, style: { flex: 1 } }, it))); }
  const inputBase = { width: "100%", boxSizing: "border-box", border: "1px solid #d8dadd", borderRadius: 9, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff", color: "#1f2328" };
  function textInput(v, on) { return h("input", { value: v, onChange: (e) => on(e.target.value), style: inputBase }); }
  function seg(on) { return { padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, textTransform: "capitalize", border: on ? "1px solid transparent" : "1px solid #d8dadd", background: on ? "#1f2328" : "#fff", color: on ? "#fff" : "#5f6671" }; }
  function primary(c) { return { padding: "11px 18px", borderRadius: 10, border: "none", background: c, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }; }
  function ghost() { return { padding: "11px 16px", borderRadius: 10, border: "1px solid #d8dadd", background: "#fff", color: "#5f6671", fontSize: 14, fontWeight: 600, cursor: "pointer" }; }
  function colorField(v, on) {
    return h("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } }, [
      ...SWATCHES.map((c) => h("button", { key: c, onClick: () => on(c), title: c, style: { width: 32, height: 32, borderRadius: 8, background: c, border: v.toLowerCase() === c.toLowerCase() ? "3px solid #1f2328" : "1px solid #d8dadd", cursor: "pointer" } })),
      h("label", { key: "custom", style: { display: "inline-flex", alignItems: "center", gap: 7, marginLeft: 4, fontSize: 12.5, color: "#6b7280", cursor: "pointer" } }, [
        h("input", { key: "i", type: "color", value: v, onChange: (e) => on(e.target.value), style: { width: 32, height: 32, border: "1px solid #d8dadd", borderRadius: 8, padding: 0, background: "none", cursor: "pointer" } }),
        h("span", { key: "hx", style: { fontFamily: "ui-monospace,monospace" } }, v),
      ]),
    ]);
  }
  function slider(min, max, stepv, val, on, hint) {
    return h("div", null, [
      h("input", { key: "s", type: "range", min, max, step: stepv, value: val, onChange: (e) => on(Number(e.target.value)), style: { width: "100%", accentColor: "#0A66C2" } }),
      hint ? h("div", { key: "h", style: { fontSize: 11.5, color: "#9aa0a6", display: "flex", justifyContent: "space-between", marginTop: 2 } }, hint.split(" ← → ").map((t, i) => h("span", { key: i }, t))) : null,
    ]);
  }
  function uploader(val, onFile, onClear, label, round) {
    const ref = React.createRef();
    return h("div", null, [
      val ? h("div", { key: "p", style: { display: "flex", alignItems: "center", gap: 10 } }, [
        h("img", { key: "i", src: val, style: { width: 52, height: 52, objectFit: round ? "cover" : "contain", borderRadius: round ? "50%" : 8, border: "1px solid #e0e2e5", background: "#fff" } }),
        h("button", { key: "c", onClick: onClear, style: { fontSize: 12.5, color: "#9aa0a6", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" } }, "remove"),
      ]) : h("button", { key: "u", onClick: () => ref.current && ref.current.click(), style: { width: "100%", padding: "13px", border: "2px dashed #cfd3d8", borderRadius: 10, background: "#fafbfc", color: "#6b7280", fontSize: 13, cursor: "pointer", fontWeight: 600 } }, label),
      h("input", { key: "in", ref, type: "file", accept: "image/*", onChange: (e) => onFile(e.target.files[0]), style: { display: "none" } }),
    ]);
  }
  function swatchPreview(b) {
    return h("div", { key: "sw", style: { display: "flex", gap: 0, borderRadius: 10, overflow: "hidden", border: "1px solid #e0e2e5", marginTop: 4 } },
      [["Loud", b.primary, "#fff"], ["Light", mix(b.primary, b.tint), "#1f2328"], ["Section", b.secondary, "#fff"], ["Accent", b.accent, "#1f2328"]].map((x, i) =>
        h("div", { key: i, style: { flex: 1, background: x[1], color: x[2], padding: "12px 10px", fontSize: 11.5, fontWeight: 700, textAlign: "center" } }, x[0])));
  }
  function mix(hex, pct) {
    const n = hex.replace("#", ""); const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
    const f = pct / 100, m = (x) => Math.round(x * f + 255 * (1 - f)).toString(16).padStart(2, "0");
    return "#" + m(r) + m(g) + m(b);
  }
  function shapeChip(radius, label) {
    return h("div", { key: label, style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 } }, [
      h("div", { key: "b", style: { width: 70, height: 50, background: "#eef4fc", border: "1.5px solid #0A66C2", borderRadius: radius } }),
      h("span", { key: "l", style: { fontSize: 11.5, color: "#9aa0a6", fontWeight: 600 } }, label + " · " + radius + "px"),
    ]);
  }
  function codeBlock(name, code, onCopy) {
    return h("div", { key: name, style: { marginBottom: 16 } }, [
      h("div", { key: "h", style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 } }, [
        h("span", { key: "n", style: { fontFamily: "ui-monospace,monospace", fontSize: 12.5, color: "#3a3f45", fontWeight: 600 } }, name),
        h("button", { key: "c", onClick: onCopy, style: { fontSize: 12, fontWeight: 600, color: "#0A66C2", background: "#eef4fc", border: "1px solid #cfe0f5", borderRadius: 7, padding: "4px 11px", cursor: "pointer" } }, "Copy"),
      ]),
      h("pre", { key: "p", style: { margin: 0, fontFamily: "ui-monospace,monospace", fontSize: 12, lineHeight: 1.55, color: "#cfe3ff", background: "#0f1419", borderRadius: 10, padding: "13px 15px", overflowX: "auto", whiteSpace: "pre" } }, code),
    ]);
  }

  window.Setup = Setup;
})();
