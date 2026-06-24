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
  const { useState, useEffect } = React;
  const LS = "li-vds-brand-setup-v1";

  const FONTS = ["Inter", "Plus Jakarta Sans", "Space Grotesk", "Sora", "Manrope", "Figtree", "Outfit", "DM Sans"];
  const SIGS = [["underline", "Underline"], ["block", "Block"], ["bubble", "Bubble"], ["plain", "Plain"]];
  const DEFAULTS = {
    primary: "#0A66C2", secondary: "#16232B", accent: "#E7A33E",
    tint: 7, font: "Inter", signature: "underline",
    sourceType: "manual", figmaUrl: "", githubUrl: "", fileName: "",
  };
  const STEPS = ["Welcome", "Brand source", "Colours", "Type & signature", "Done"];

  function loadFont(font) {
    const id = "gf-" + font.replace(/\s+/g, "-");
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=" + font.replace(/\s+/g, "+") + ":wght@400;500;600;700;800&display=swap";
    document.head.appendChild(l);
  }
  function hexToRgb(hex) {
    const m = hex.replace("#", "");
    const n = m.length === 3 ? m.split("").map(c => c + c).join("") : m;
    const i = parseInt(n, 16);
    return [(i >> 16) & 255, (i >> 8) & 255, i & 255];
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
    if (s.sourceType === "figma" && s.figmaUrl) src = "Figma file: " + s.figmaUrl + "\n(Pull the brand colours, fonts and logo from this Figma file.)";
    else if (s.sourceType === "github" && s.githubUrl) src = "GitHub repo: " + s.githubUrl + "\n(Pull theme tokens / colours / fonts from this repo.)";
    else if (s.sourceType === "file" && s.fileName) src = "Figma file \u201c" + s.fileName + "\u201d is attached in this chat.\n(Read it and pull the brand colours, fonts and logo from it.)";
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
      try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(LS)) || {}); }
      catch (e) { return Object.assign({}, DEFAULTS); }
    });
    const [copied, setCopied] = useState("");

    useEffect(() => { loadFont(s.font); }, [s.font]);
    useEffect(() => {
      try { localStorage.setItem(LS, JSON.stringify(s)); } catch (e) {}
      let el = document.getElementById("brand-live");
      if (!el) { el = document.createElement("style"); el.id = "brand-live"; document.head.appendChild(el); }
      el.textContent = cssText(s);
    }, [s]);

    const set = (k, v) => setS(p => Object.assign({}, p, { [k]: v }));
    const light = lightTint(s.primary, s.tint);
    const copy = (key, text) => { navigator.clipboard && navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(""), 1700); };

    const sigStyle = s.signature === "underline" ? { boxShadow: `inset 0 -0.12em 0 ${s.accent}` }
      : s.signature === "block" ? { background: s.accent, color: "#fff", padding: "0 .12em" }
      : s.signature === "bubble" ? { border: `3px solid ${s.accent}`, borderRadius: "999px", padding: ".02em .35em" }
      : {};

    // ---- shared styles ----
    const shell = { minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: `'${s.font}', system-ui, sans-serif`, color: "#18181b" };
    const main = { flex: 1, display: "flex", gap: 44, alignItems: "flex-start", maxWidth: 1140, width: "100%", margin: "0 auto", padding: "36px 40px 0", boxSizing: "border-box" };
    const colLeft = { flex: "1 1 0", minWidth: 0 };
    const label = { display: "block", fontSize: 13, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "#6b7280", margin: "0 0 10px" };
    const h1 = { fontFamily: `'${s.font}', sans-serif`, fontWeight: 700, fontSize: 38, letterSpacing: "-.025em", margin: "0 0 14px", lineHeight: 1.08 };
    const sub = { fontSize: 17, lineHeight: 1.55, color: "#5a5a5a", margin: "0 0 28px", maxWidth: 560 };
    const colorInput = { width: 54, height: 40, border: "1px solid #d8dadd", borderRadius: 8, background: "#fff", padding: 2, cursor: "pointer" };
    const field = { width: "100%", padding: "13px 14px", fontSize: 15, border: "1px solid #d8dadd", borderRadius: 10, background: "#fff", boxSizing: "border-box", fontFamily: "inherit" };
    const btn = (primary) => ({ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", fontSize: 16, fontWeight: 700, borderRadius: 11, cursor: "pointer", border: primary ? "none" : "1px solid #d8dadd", background: primary ? s.primary : "#fff", color: primary ? "#fff" : "#3a3f45" });

    function Color({ k, name }) {
      return React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 } },
        React.createElement("input", { type: "color", value: s[k], onChange: e => set(k, e.target.value), style: colorInput }),
        React.createElement("div", null,
          React.createElement("div", { style: { fontWeight: 600, fontSize: 15 } }, name),
          React.createElement("div", { style: { fontSize: 13, color: "#8a9098", fontFamily: "monospace" } }, s[k])
        )
      );
    }
    function Preview() {
      const card = (bg, fg, kicker, kickerColor, title, body) =>
        React.createElement("div", { style: { flex: 1, aspectRatio: "4/5", borderRadius: 12, background: bg, color: fg, padding: 18, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "flex-end", boxShadow: "0 6px 22px rgba(0,0,0,.10)" } },
          React.createElement("div", { style: { fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: kickerColor } }, kicker),
          React.createElement("div", { style: { fontFamily: `'${s.font}', sans-serif`, fontWeight: 700, fontSize: 21, lineHeight: 1.1, marginTop: 7 } }, title, body));
      return React.createElement("div", { style: { display: "flex", gap: 12 } },
        card(s.primary, "#fff", "Loud", "rgba(255,255,255,.7)", "Cover headline", null),
        card(light, "#18181b", "Light", "#8a9098", "A point worth ", React.createElement("span", { style: sigStyle }, "saving")),
        card(s.secondary, "#fff", "Section", s.accent, "Chapter marker", null));
    }

    // ---- step bodies ----
    let body;
    if (step === 0) {
      body = React.createElement("div", { style: colLeft },
        React.createElement("div", { style: { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: s.primary, marginBottom: 18 } },
          React.createElement("span", { style: { width: 8, height: 8, borderRadius: "50%", background: s.primary } }), "LinkedIn Visual Design System"),
        React.createElement("h1", { style: h1 }, "Welcome — let's set up your brand first."),
        React.createElement("p", { style: sub }, "Five quick steps: point us at your Figma or GitHub (optional), then pick colours, font and your headline signature. A live preview shows your style as you go. Everything you set is yours and survives every update."),
        React.createElement("div", { style: { display: "flex", gap: 28, margin: "8px 0 32px", flexWrap: "wrap" } },
          [["1", "Source", "Figma, GitHub, a .fig file — or skip"], ["2", "Colours", "Loud, section & accent"], ["3", "Type", "Font + headline signature"], ["4", "Hand off", "One paste to the assistant"]].map(x =>
            React.createElement("div", { key: x[0], style: { flex: 1, minWidth: 150 } },
              React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 4 } }, x[0] + " · " + x[1]),
              React.createElement("div", { style: { fontSize: 13.5, color: "#8a9098", lineHeight: 1.45 } }, x[2])))));
    } else if (step === 1) {
      const opt = (val, title, desc) => React.createElement("button", { onClick: () => set("sourceType", val),
        style: { textAlign: "left", width: "100%", padding: "16px 18px", marginBottom: 12, borderRadius: 12, cursor: "pointer", background: "#fff", border: "1.5px solid " + (s.sourceType === val ? s.primary : "#d8dadd"), boxShadow: s.sourceType === val ? `0 0 0 3px ${lightTint(s.primary, 12)}` : "none" } },
        React.createElement("div", { style: { fontWeight: 700, fontSize: 16 } }, title),
        React.createElement("div", { style: { fontSize: 14, color: "#8a9098", marginTop: 3, lineHeight: 1.4 } }, desc));
      body = React.createElement("div", { style: colLeft },
        React.createElement("h1", { style: h1 }, "Where should your brand come from?"),
        React.createElement("p", { style: sub }, "If you have a Figma file or a GitHub repo, the assistant can pull your real colours, fonts and logo from it. No source? Just set it by hand in the next steps."),
        opt("figma", "Figma file", "Paste a share link — the assistant imports the brand from it."),
        s.sourceType === "figma" && React.createElement("input", { style: Object.assign({}, field, { marginBottom: 12 }), placeholder: "https://www.figma.com/file/…", value: s.figmaUrl, onChange: e => set("figmaUrl", e.target.value) }),
        opt("github", "GitHub repo", "Paste the repo URL — pulls theme tokens / colours / fonts."),
        s.sourceType === "github" && React.createElement("input", { style: Object.assign({}, field, { marginBottom: 12 }), placeholder: "https://github.com/owner/repo", value: s.githubUrl, onChange: e => set("githubUrl", e.target.value) }),
        opt("file", "Upload a .fig file", "Pick the file, then attach it in the chat so the assistant can read it."),
        s.sourceType === "file" && React.createElement("div", { style: { marginBottom: 12 } },
          React.createElement("label", { style: Object.assign({}, btn(false), { fontSize: 14, padding: "10px 18px" }) },
            "Choose .fig file",
            React.createElement("input", { type: "file", accept: ".fig", style: { display: "none" }, onChange: e => set("fileName", e.target.files[0] ? e.target.files[0].name : "") })),
          s.fileName && React.createElement("div", { style: { fontSize: 13.5, color: "#1f8a5b", fontWeight: 600, marginTop: 8 } }, "✓ " + s.fileName + " — remember to also attach it in the chat."),
          s.fileName && React.createElement("div", { style: { fontSize: 13, color: "#8a9098", marginTop: 4, lineHeight: 1.4 } }, "A page can't send the file itself, so drag it into the chat as well.")),
        opt("manual", "Set it manually", "No source — pick colours and type yourself."));
    } else if (step === 2) {
      body = React.createElement("div", { style: colLeft },
        React.createElement("h1", { style: h1 }, "Your colours"),
        React.createElement("p", { style: sub }, "Three roles drive every visual: a loud cover colour, a deep section colour, and an accent for highlights."),
        React.createElement(Color, { k: "primary", name: "Primary — loud canvas (cover / back)" }),
        React.createElement(Color, { k: "secondary", name: "Secondary — section canvas (chapters)" }),
        React.createElement(Color, { k: "accent", name: "Accent — highlight / mark" }),
        React.createElement("div", { style: { marginTop: 22 } },
          React.createElement("span", { style: label }, "Light-canvas tint · " + s.tint + "%"),
          React.createElement("input", { type: "range", min: 3, max: 16, value: s.tint, onChange: e => set("tint", +e.target.value), style: { width: "100%", accentColor: s.primary } })));
    } else if (step === 3) {
      body = React.createElement("div", { style: colLeft },
        React.createElement("h1", { style: h1 }, "Type & signature"),
        React.createElement("p", { style: sub }, "Pick the font everything is set in, and how a highlighted word looks in your headlines."),
        React.createElement("div", { style: { marginBottom: 24 } },
          React.createElement("span", { style: label }, "Font"),
          React.createElement("select", { value: s.font, onChange: e => set("font", e.target.value), style: Object.assign({}, field, { fontFamily: `'${s.font}', sans-serif` }) },
            FONTS.map(f => React.createElement("option", { key: f, value: f }, f)))),
        React.createElement("div", null,
          React.createElement("span", { style: label }, "Headline signature"),
          React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } },
            SIGS.map(([val, name]) => React.createElement("button", { key: val, onClick: () => set("signature", val),
              style: { flex: 1, minWidth: 84, padding: "11px 8px", fontSize: 14, fontWeight: 600, cursor: "pointer", borderRadius: 9, border: "1.5px solid " + (s.signature === val ? s.primary : "#d8dadd"), background: s.signature === val ? s.primary : "#fff", color: s.signature === val ? "#fff" : "#3a3f45" } }, name)))));
    } else {
      // Done — hand off
      body = React.createElement("div", { style: colLeft },
        React.createElement("h1", { style: h1 }, "You're set. Hand it to the assistant."),
        React.createElement("p", { style: sub }, "One paste does it: the message below tells the assistant your source and choices, so it imports your brand and writes the overrides for you. (A page can't post into the chat on its own.)"),
        React.createElement("button", { onClick: () => copy("msg", assistantMsg(s)), style: Object.assign({}, btn(true), { marginBottom: 16 }) }, copied === "msg" ? "Copied — now paste in chat ✓" : "Copy for the assistant"),
        React.createElement("details", { style: { marginTop: 6 } },
          React.createElement("summary", { style: { cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#6b7280" } }, "Or paste overrides/brand.css yourself"),
          React.createElement("div", { style: { background: "#16232b", borderRadius: 14, overflow: "hidden", marginTop: 12 } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,.1)" } },
              React.createElement("span", { style: { color: "#cfd3d8", fontSize: 13, fontWeight: 600, fontFamily: "monospace" } }, "overrides/brand.css"),
              React.createElement("button", { onClick: () => copy("css", cssText(s)), style: { background: s.primary, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" } }, copied === "css" ? "Copied ✓" : "Copy")),
            React.createElement("pre", { style: { margin: 0, padding: "16px 18px", color: "#e6edf3", fontSize: 12.5, lineHeight: 1.5, fontFamily: "monospace", whiteSpace: "pre-wrap", overflowX: "auto" } }, cssText(s)))));
    }

    const showPreview = step >= 2;

    return React.createElement("div", { style: shell },
      // stepper
      React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "center", padding: "26px 20px 6px", flexWrap: "wrap" } },
        STEPS.map((name, i) => React.createElement("div", { key: name, onClick: () => i <= step && setStep(i),
          style: { display: "flex", alignItems: "center", gap: 8, cursor: i <= step ? "pointer" : "default", opacity: i <= step ? 1 : .5 } },
          React.createElement("span", { style: { width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, background: i < step ? s.primary : i === step ? s.primary : "#e2e5e9", color: i <= step ? "#fff" : "#9aa0a6" } }, i < step ? "✓" : i + 1),
          React.createElement("span", { style: { fontSize: 13.5, fontWeight: 600, color: i === step ? "#18181b" : "#9aa0a6" } }, name),
          i < STEPS.length - 1 && React.createElement("span", { style: { width: 22, height: 2, background: "#e2e5e9", marginLeft: 4 } })))),

      React.createElement("div", { style: main },
        body,
        showPreview && React.createElement("div", { style: { flex: "0 0 440px", maxWidth: 440, position: "sticky", top: 20 } },
          React.createElement("span", { style: label }, "Live preview"),
          React.createElement(Preview))),

      // nav
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", maxWidth: 1140, width: "100%", margin: "0 auto", padding: "28px 40px 40px", boxSizing: "border-box" } },
        React.createElement("button", { onClick: () => setStep(Math.max(0, step - 1)), style: Object.assign({}, btn(false), { visibility: step === 0 ? "hidden" : "visible" }) }, "← Back"),
        step < STEPS.length - 1
          ? React.createElement("button", { onClick: () => setStep(step + 1), style: btn(true) }, step === 0 ? "Get started →" : "Next →")
          : React.createElement("a", { href: "Visual Board.html", style: Object.assign({}, btn(true), { textDecoration: "none" }) }, "Start making visuals →")));
  }

  window.Setup = Setup;
})();
