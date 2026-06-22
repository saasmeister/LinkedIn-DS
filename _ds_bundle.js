/* @ds-bundle: {"format":3,"namespace":"LinkedInVisualDesignSystem_a51278","components":[{"name":"Cta","sourcePath":"components/content/Cta.jsx"},{"name":"InfoCard","sourcePath":"components/content/InfoCard.jsx"},{"name":"Chip","sourcePath":"components/content/InfoCard.jsx"},{"name":"Quote","sourcePath":"components/content/Quote.jsx"},{"name":"Avatar","sourcePath":"components/content/Quote.jsx"},{"name":"Attribution","sourcePath":"components/content/Quote.jsx"},{"name":"Stat","sourcePath":"components/content/Stat.jsx"},{"name":"StatBox","sourcePath":"components/content/Stat.jsx"},{"name":"StatRow","sourcePath":"components/content/Stat.jsx"},{"name":"BrowserMock","sourcePath":"components/illustration/BrowserMock.jsx"},{"name":"Canvas","sourcePath":"components/layout/Canvas.jsx"},{"name":"Chrome","sourcePath":"components/layout/Chrome.jsx"},{"name":"SwipeArrow","sourcePath":"components/layout/Chrome.jsx"},{"name":"FeedPost","sourcePath":"components/preview/FeedPost.jsx"},{"name":"Eyebrow","sourcePath":"components/text/Headline.jsx"},{"name":"Headline","sourcePath":"components/text/Headline.jsx"},{"name":"Mark","sourcePath":"components/text/Headline.jsx"},{"name":"Subhead","sourcePath":"components/text/Headline.jsx"}],"sourceHashes":{"components/content/Cta.jsx":"82e459098f48","components/content/InfoCard.jsx":"1c79ce656fe9","components/content/Quote.jsx":"26d86b908140","components/content/Stat.jsx":"3196afd21e95","components/illustration/BrowserMock.jsx":"4ffefd5fb451","components/layout/Canvas.jsx":"c7884415425d","components/layout/Chrome.jsx":"cf4752729eb3","components/preview/FeedPost.jsx":"bd5556609d26","components/text/Headline.jsx":"0ab05c2c7576","tools/check-branch.mjs":"b1fe2693a22e","tools/check-update.mjs":"fbb7c8502467","ui_kits/brief-studio/BriefStudio.jsx":"121d92708d6e","ui_kits/setup/Setup.jsx":"1ca8fa5ca617","ui_kits/update-center/UpdateCenter.jsx":"c049b459323e","ui_kits/visual-library/VisualLibrary.jsx":"d8b82962af64","ui_kits/visual-library/sampleVisuals.jsx":"66e360f74fcb"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.LinkedInVisualDesignSystem_a51278 = window.LinkedInVisualDesignSystem_a51278 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

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

// tools/check-branch.mjs
try { (() => {
/**
 * check-branch.mjs — enforces the master <-> branch ownership contract.
 * Run with Node 18+:  node tools/check-branch.mjs   (validate)
 *                     node tools/check-branch.mjs --write-lock   (master owner: regenerate lock)
 *
 * Exits NON-ZERO on a violation, so it blocks a git pre-push hook / CI gate.
 * Enforces: (1) a branch must not edit/add/delete master-owned files (vs
 * governance/master.lock); (2) no client name leaks into a master file.
 *
 * NOTE: no top-level import/export or shebang on purpose — that keeps this
 * file out of the browser design-bundle. Dependencies load via dynamic import.
 */
async function main() {
  const {
    readFile,
    readdir,
    stat,
    writeFile
  } = await import("node:fs/promises");
  const {
    createHash
  } = await import("node:crypto");
  const {
    join,
    relative,
    sep
  } = await import("node:path");
  const ROOT = process.cwd();
  const OWNERSHIP = "governance/ownership.json";
  const LOCK = "governance/master.lock";
  const sha = s => createHash("sha256").update(s, "utf8").digest("hex");
  const toGlob = p => new RegExp("^" + p.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, "\u00a7\u00a7").replace(/\*/g, "[^/]*").replace(/\u00a7\u00a7/g, ".*") + "$");
  const match = (path, globs) => globs.some(g => toGlob(g).test(path));
  async function walk(dir, acc = []) {
    for (const name of await readdir(dir)) {
      if (name === ".git" || name === "node_modules") continue;
      const full = join(dir, name);
      const s = await stat(full);
      if (s.isDirectory()) await walk(full, acc);else acc.push(relative(ROOT, full).split(sep).join("/"));
    }
    return acc;
  }
  const own = JSON.parse(await readFile(join(ROOT, OWNERSHIP), "utf8"));
  const files = (await walk(ROOT)).filter(f => f !== LOCK);
  const isIgnored = f => match(f, own.ignored);
  const isBranch = f => match(f, own.branchOwned);
  const isMaster = f => !isIgnored(f) && !isBranch(f);
  if (process.argv.includes("--write-lock")) {
    const lock = {};
    for (const f of files) if (isMaster(f)) lock[f] = sha(await readFile(join(ROOT, f), "utf8"));
    await writeFile(join(ROOT, LOCK), JSON.stringify(lock, null, 0));
    console.log(`\u2713 wrote ${LOCK} (${Object.keys(lock).length} master files)`);
    return;
  }
  let lock = null;
  try {
    lock = JSON.parse(await readFile(join(ROOT, LOCK), "utf8"));
  } catch {}
  const violations = [];
  if (lock) {
    for (const f of files) {
      if (!isMaster(f)) continue;
      const cur = sha(await readFile(join(ROOT, f), "utf8"));
      if (!(f in lock)) violations.push(`NEW master-area file in branch: ${f}\n   -> move it to client/ or overrides/, or push it from master.`);else if (lock[f] !== cur) violations.push(`MASTER file edited in branch: ${f}\n   -> revert it; put your change in overrides/ or client/.`);
    }
    for (const f of Object.keys(lock)) {
      if (!files.includes(f)) violations.push(`MASTER file deleted in branch: ${f}\n   -> restore it; a branch cannot remove master files.`);
    }
  } else {
    console.log("\u2022 No lock found — running master-side checks only. Generate one with --write-lock.");
  }
  const deny = own.forbiddenInMaster && own.forbiddenInMaster.denyClientNames || [];
  if (deny.length) {
    for (const f of files) {
      if (!isMaster(f)) continue;
      const body = await readFile(join(ROOT, f), "utf8");
      for (const name of deny) if (body.includes(name)) violations.push(`Client name "${name}" found in master file: ${f}\n   -> client-specific values belong in overrides/ or client/.`);
    }
  }
  if (violations.length) {
    console.error(`\n\u2717 push blocked — ${violations.length} ownership violation(s):\n`);
    violations.forEach(v => console.error("  \u2022 " + v));
    console.error("\nSee GOVERNANCE.md. master ships fundamentals; the branch owns overrides/ + client/.\n");
    process.exit(1);
  }
  console.log("\u2713 ownership OK — master files untouched, no client data leaked. Safe to push.");
}
if (typeof process !== "undefined" && process.versions && process.versions.node) {
  main().catch(e => {
    console.error(e);
    process.exit(2);
  });
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "tools/check-branch.mjs", error: String((e && e.message) || e) }); }

// tools/check-update.mjs
try { (() => {
/**
 * check-update.mjs — is this branch behind master?
 * Run with Node 18+:  node tools/check-update.mjs [manifestUrl]
 *
 * Exits 10 (and prints what's pending) when the branch is behind master,
 * 0 when current — so a daily CI job can branch on the exit code.
 *
 * NOTE: no top-level import/export or shebang on purpose — keeps this file
 * out of the browser design-bundle. Dependencies load via dynamic import.
 */
async function main() {
  const {
    readFile
  } = await import("node:fs/promises");
  const semver = v => String(v).split(".").map(Number);
  const behind = (a, b) => {
    const x = semver(a),
      y = semver(b);
    for (let i = 0; i < 3; i++) {
      if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) < (y[i] || 0);
    }
    return false;
  };
  const branch = (await readFile("VERSION", "utf8")).trim();
  const local = JSON.parse(await readFile("update-manifest.json", "utf8"));
  const url = process.argv[2] || local.manifestUrl;
  let master = local; // fallback: local manifest (demo / offline)
  if (url && /^https?:/.test(url)) {
    try {
      master = await (await fetch(url)).json();
    } catch (e) {
      console.error("\u2022 could not fetch master manifest (" + e.message + ") — using local.");
    }
  }
  if (behind(branch, master.version)) {
    const pending = (master.releases || []).filter(r => behind(branch, r.version));
    console.log(`\u2b06 update available: ${branch} -> ${master.version}`);
    for (const r of pending) {
      console.log(`\n  ${r.version} (${r.level}) — ${r.summary}`);
      if (r.templates && r.templates.length) console.log("    templates: " + r.templates.join(", "));
      if (r.components && r.components.length) console.log("    components: " + r.components.join(", "));
    }
    console.log("\nReview the changelog, then apply (Update Center -> Apply, or pull master in your repo).");
    process.exit(10);
  }
  console.log(`\u2713 up to date (branch ${branch}, master ${master.version}).`);
}
if (typeof process !== "undefined" && process.versions && process.versions.node) {
  main().catch(e => {
    console.error(e);
    process.exit(2);
  });
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "tools/check-update.mjs", error: String((e && e.message) || e) }); }

// ui_kits/brief-studio/BriefStudio.jsx
try { (() => {
/* Brief Studio — the intake screen.
   Left: a fillable brief (type-first, post, titles, references, sketch,
   dynamic carousel steps, brand layer). Right: a LIVE LinkedIn feed preview
   built from the brief, with a senior-designer advice banner + critical
   pushback on the chosen type. Generates the filled brief text on demand. */
(function () {
  const {
    useState,
    useRef,
    useEffect,
    useCallback
  } = React;
  const DS = window.LinkedInVisualDesignSystem_a51278;
  const {
    Canvas,
    Chrome,
    Eyebrow,
    Headline,
    Mark,
    Subhead,
    Stat,
    Quote,
    Attribution,
    InfoCard,
    Chip
  } = DS;
  const FeedPost = DS.FeedPost;
  const KEY = "li-vds-brief-v1";
  const TYPES = [{
    id: "single",
    label: "Single",
    desc: "One message, one visual"
  }, {
    id: "carousel",
    label: "Carousel",
    desc: "A story over slides"
  }, {
    id: "infographic",
    label: "Infographic",
    desc: "A dense cheat-sheet"
  }, {
    id: "quote",
    label: "Quote",
    desc: "One pulled sentence"
  }];
  const SIGS = ["underline", "block", "bubble", "plain"];
  const FONTS = ["Inter", "Plus Jakarta Sans", "Space Grotesk", "Sora"];
  const SWATCHES = ["#0A66C2", "#1F8A5B", "#C2410C", "#7C3AED", "#0F766E", "#BE123C", "#16232B"];
  const DEFAULT_STEPS = () => [{
    role: "loud",
    label: "Cover",
    note: "The promise / hook"
  }, {
    role: "light",
    label: "Context",
    note: "Set up where this starts"
  }, {
    role: "section",
    label: "Problem",
    note: "The core tension"
  }, {
    role: "light",
    label: "Step 1",
    note: "First move"
  }, {
    role: "section",
    label: "Result",
    note: "Proof it worked"
  }, {
    role: "loud",
    label: "Back cover",
    note: "Your CTA"
  }];
  const ROLE_NEXT = {
    loud: "light",
    light: "section",
    section: "loud"
  };
  const DEFAULT = {
    type: "carousel",
    post: "",
    oneThing: "",
    heading: "",
    subheading: "",
    name: "Your name",
    category: "Your category / function",
    second: "derive",
    signature: "underline",
    primary: "#0A66C2",
    font: "Inter",
    quote: "",
    attrName: "",
    attrRole: "",
    steps: DEFAULT_STEPS()
  };
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s) return {
        ...DEFAULT,
        ...s
      };
    } catch (e) {}
    return DEFAULT;
  }

  /* ---------- senior-designer advice (lightweight heuristics) ---------- */
  function advise(b) {
    const out = [];
    const len = b.post.trim().length;
    const hasList = /(^|\n)\s*(\d+[\.\)]|[-•])/.test(b.post);
    const hasNumber = /\b\d+([.,]\d+)?\s?(%|x|×|k|m|\+)?\b/i.test(b.post);
    if (!len) out.push({
      t: "tip",
      m: "Paste the post (or the idea) first — the visual follows the post, never the reverse."
    });
    if (b.type === "carousel" && len > 0 && len < 220 && !hasList) out.push({
      t: "warn",
      m: "This reads short for a carousel. A single visual will likely hit harder — want me to switch it?"
    });
    if (b.type === "single" && hasList) out.push({
      t: "warn",
      m: "The post lists multiple points — an infographic or carousel carries them better than one single."
    });
    if (b.type === "infographic" && len > 0 && !hasList && !hasNumber) out.push({
      t: "warn",
      m: "An infographic needs structure (steps, a matrix, stats). I don't see distinct parts yet — what are the cells?"
    });
    if (b.type === "quote" && !b.quote.trim()) out.push({
      t: "tip",
      m: "Pull the exact sentence from the post, verbatim — that's what a quote visual lives on."
    });
    if (b.second === "derive" && !b.heading.trim()) out.push({
      t: "tip",
      m: "The heading should differ from the post's first line — I'll re-hook it, not repeat it."
    });
    if (hasNumber && b.type === "single") out.push({
      t: "good",
      m: "There's a number in here — one big stat could be the whole visual. Strong save-trigger."
    });
    if (!out.length) out.push({
      t: "good",
      m: "Brief looks coherent. I'll build it and then push back on anything that fights the layout."
    });
    return out;
  }

  /* ---------- live visual builder (form → DS components) ---------- */
  function themeStyle(b) {
    return {
      "--brand-primary": b.primary,
      "--brand-font": `'${b.font}', system-ui, sans-serif`,
      "--brand-font-display": `'${b.font}', system-ui, sans-serif`
    };
  }
  function loadFont(font) {
    const id = "bs-font-" + font.replace(/\s+/g, "-");
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id;
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=" + font.replace(/\s+/g, "+") + ":wght@400;500;600;700;800&display=swap";
    document.head.appendChild(l);
  }
  const Mk = (heading, sig) => {
    // wrap the last 1-2 words in a signature Mark
    const words = (heading || "").trim().split(" ");
    if (words.length < 2) return heading || "Your headline here";
    const head = words.slice(0, -2).join(" ");
    const tail = words.slice(-2).join(" ");
    return [head + " ", React.createElement(Mark, {
      key: "m",
      signature: sig
    }, tail)];
  };
  function buildSingle(b) {
    return React.createElement(Canvas, {
      role: "light"
    }, React.createElement(Chrome, {
      name: b.name,
      category: b.category,
      position: "top"
    }), React.createElement("div", {
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
    }, React.createElement(Eyebrow, null, b.oneThing || "The re-hook"), React.createElement(Headline, {
      size: "lg",
      style: {
        marginTop: 18
      }
    }, Mk(b.heading, b.signature)), b.subheading ? React.createElement(Subhead, {
      style: {
        marginTop: 24
      }
    }, b.subheading) : null));
  }
  function buildQuote(b) {
    return React.createElement(Canvas, {
      role: "light"
    }, React.createElement(Chrome, {
      name: b.name,
      category: b.category,
      position: "top"
    }), React.createElement("div", {
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
    }, React.createElement(Quote, {
      label: "QUOTE"
    }, b.quote || "Pull the exact sentence from your post."), React.createElement(Attribution, {
      name: b.attrName || b.name,
      role: b.attrRole || b.category,
      style: {
        marginTop: 70
      }
    })));
  }
  function buildInfographic(b) {
    return React.createElement(Canvas, {
      role: "light",
      density: "tight"
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, React.createElement("span", {
      style: {
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: ".06em"
      }
    }, b.name), React.createElement("span", {
      style: {
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: ".06em",
        color: "var(--muted)"
      }
    }, b.category)), React.createElement(Headline, {
      size: "sm",
      style: {
        marginTop: 44
      }
    }, Mk(b.heading, b.signature)), React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 22,
        marginTop: 36
      }
    }, React.createElement(InfoCard, {
      number: 1,
      label: "Step",
      heading: "Mini-heading"
    }, React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, React.createElement(Chip, null, "tag"))), React.createElement(InfoCard, {
      number: 2,
      label: "Step",
      heading: "Mini-heading",
      emphasis: true
    })));
  }
  function buildPage(b, step, i, total) {
    const isCover = i === 0,
      isBack = i === total - 1;
    return React.createElement(Canvas, {
      role: step.role
    }, React.createElement(Chrome, {
      name: b.name,
      category: b.category,
      position: isCover || isBack ? "bottom" : "top",
      swipe: !isBack
    }), React.createElement("div", {
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
    }, React.createElement(Eyebrow, {
      color: step.role === "section" ? "var(--accent)" : undefined
    }, step.label), React.createElement(Headline, {
      size: isCover ? "lg" : "md",
      style: {
        marginTop: 16
      }
    }, step.note || (isCover ? b.heading || "Cover headline" : "One idea"))));
  }
  function Fit({
    node,
    w
  }) {
    const s = w / 1080;
    return React.createElement("div", {
      style: {
        width: w,
        height: w * 1.25,
        overflow: "hidden"
      }
    }, React.createElement("div", {
      style: {
        width: 1080,
        height: 1350,
        transform: `scale(${s})`,
        transformOrigin: "top left"
      }
    }, node));
  }
  function Preview({
    b
  }) {
    useEffect(() => loadFont(b.font), [b.font]);
    if (!FeedPost) return React.createElement("div", {
      style: {
        padding: "40px 20px",
        textAlign: "center",
        color: "#9aa0a6",
        fontSize: 13,
        border: "1px dashed #cfd3d8",
        borderRadius: 12,
        background: "#fff"
      }
    }, "Preview loads once the design-system bundle is compiled — reload this page.");
    const theme = themeStyle(b);
    const author = {
      name: b.name,
      headline: b.category,
      time: "21h"
    };
    const W = 472;
    if (b.type === "carousel") {
      const pages = b.steps.map((st, i) => React.createElement("div", {
        key: i,
        style: theme
      }, Fit({
        node: buildPage(b, st, i, b.steps.length),
        w: W - 56
      })));
      return React.createElement(FeedPost, {
        mode: "carousel",
        width: W,
        author,
        docTitle: b.heading || "Your carousel",
        text: b.post || "Your post caption appears here.",
        pages
      });
    }
    const node = b.type === "quote" ? buildQuote(b) : b.type === "infographic" ? buildInfographic(b) : buildSingle(b);
    return React.createElement(FeedPost, {
      mode: "single",
      width: W,
      author,
      text: b.post || "Your post caption appears here.",
      media: React.createElement("div", {
        style: theme
      }, Fit({
        node,
        w: W
      }))
    });
  }

  /* ---------- brief text generator ---------- */
  function briefText(b) {
    const L = [];
    L.push("=== LINKEDIN VISUAL — BRIEF ===", "");
    L.push("POST OR IDEA → " + (b.post || "(empty)"), "");
    L.push("VISUAL TYPE → " + b.type, "");
    L.push("ONE THING → " + (b.oneThing || "(empty)"), "");
    L.push("IDENTITY BAR → " + b.name + " · " + b.category, "");
    L.push("SECOND HOOK → " + (b.second === "derive" ? "derive it for me" : b.heading || "(empty)"), "");
    L.push("SUBHEADING → " + (b.subheading || "(none)"), "");
    L.push("BRAND LAYER → primary " + b.primary + " · font " + b.font, "");
    L.push("SIGNATURE → " + b.signature, "");
    if (b.type === "carousel") {
      L.push("--- carousel pages ---");
      b.steps.forEach((s, i) => L.push(`  ${i + 1}. [${s.role}] ${s.label}${s.note ? " — " + s.note : ""}`));
    }
    if (b.type === "quote") {
      L.push("QUOTE → " + (b.quote || "(empty)"));
      L.push("ATTRIBUTION → " + b.attrName + " · " + b.attrRole);
    }
    L.push("", "=== END ===");
    return L.join("\n");
  }

  /* =================== UI =================== */
  function BriefStudio() {
    const [b, setB] = useState(load);
    const [refs, setRefs] = useState([]); // {url} reference images (not persisted)
    const [toast, setToast] = useState(null);
    const set = patch => setB(p => {
      const n = {
        ...p,
        ...patch
      };
      try {
        const {
          steps,
          ...rest
        } = n;
        localStorage.setItem(KEY, JSON.stringify(n));
      } catch (e) {}
      return n;
    });
    const flash = m => {
      setToast(m);
      clearTimeout(flash._t);
      flash._t = setTimeout(() => setToast(null), 2400);
    };
    const notes = advise(b);
    const onFiles = files => {
      [...files].filter(f => f.type.startsWith("image/")).forEach(f => {
        const r = new FileReader();
        r.onload = () => setRefs(p => [...p, {
          url: r.result,
          name: f.name
        }]);
        r.readAsDataURL(f);
      });
    };

    // carousel step ops
    const stepOp = (i, op, patch) => set({
      steps: (() => {
        const s = b.steps.slice();
        if (op === "del") s.splice(i, 1);else if (op === "up" && i > 0) {
          [s[i - 1], s[i]] = [s[i], s[i - 1]];
        } else if (op === "down" && i < s.length - 1) {
          [s[i + 1], s[i]] = [s[i], s[i + 1]];
        } else if (op === "role") s[i] = {
          ...s[i],
          role: ROLE_NEXT[s[i].role]
        };else if (op === "edit") s[i] = {
          ...s[i],
          ...patch
        };
        return s;
      })()
    });
    const addStep = () => set({
      steps: [...b.steps.slice(0, -1), {
        role: "light",
        label: "Step " + b.steps.length,
        note: ""
      }, b.steps[b.steps.length - 1]]
    });
    return React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) 520px",
        minHeight: "100vh",
        background: "#f1f2f4",
        fontFamily: "system-ui,-apple-system,sans-serif",
        color: "#1f2328"
      }
    }, [/* ---- left: the form ---- */
    React.createElement("div", {
      key: "form",
      style: {
        padding: "28px 34px",
        overflowY: "auto",
        maxHeight: "100vh"
      }
    }, [React.createElement("div", {
      key: "h",
      style: {
        marginBottom: 22
      }
    }, [React.createElement("div", {
      key: "t",
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 24,
        letterSpacing: "-.02em"
      }
    }, "Brief Studio"), React.createElement("div", {
      key: "s",
      style: {
        fontSize: 14,
        color: "#6b7280",
        marginTop: 3
      }
    }, "Fill the brief — I'll guide, push back, and build. You don't need to be a designer.")]), Section("1 · What type?", [React.createElement("div", {
      key: "g",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10
      }
    }, TYPES.map(t => React.createElement("button", {
      key: t.id,
      onClick: () => set({
        type: t.id
      }),
      style: typeCard(b.type === t.id)
    }, [React.createElement("span", {
      key: "l",
      style: {
        fontWeight: 700,
        fontSize: 15
      }
    }, t.label), React.createElement("span", {
      key: "d",
      style: {
        fontSize: 12.5,
        color: b.type === t.id ? "rgba(255,255,255,.85)" : "#8a9098"
      }
    }, t.desc)]))), React.createElement("div", {
      key: "hint",
      style: {
        fontSize: 12.5,
        color: "#8a9098",
        marginTop: 9
      }
    }, "Not sure? Paste the post below — the advice panel will tell you which type fits.")]), Section("2 · The post", [field("Post or idea (paste it all)", textarea(b.post, v => set({
      post: v
    }), "Paste the full LinkedIn post, or describe the idea…", 5)), field("The one thing to remember / save", input(b.oneThing, v => set({
      oneThing: v
    }), "e.g. cold DMs fail on the first line"))]), Section("3 · Heading & hook", [React.createElement("div", {
      key: "seg",
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 10
      }
    }, [["derive", "Derive the hook for me"], ["own", "I'll write it"]].map(([v, l]) => React.createElement("button", {
      key: v,
      onClick: () => set({
        second: v
      }),
      style: seg(b.second === v)
    }, l))), b.second === "own" ? field("Visual heading (differs from the post's first line)", input(b.heading, v => set({
      heading: v
    }), "Most outreach fails on the first line")) : null, field("Subheading (optional)", input(b.subheading, v => set({
      subheading: v
    }), "One supporting line that adds context")), field("Headline signature", React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, SIGS.map(s => React.createElement("button", {
      key: s,
      onClick: () => set({
        signature: s
      }),
      style: seg(b.signature === s)
    }, s))))]), Section("4 · Identity bar", [React.createElement("div", {
      key: "r",
      style: {
        display: "flex",
        gap: 12
      }
    }, [React.createElement("div", {
      key: "n",
      style: {
        flex: 1
      }
    }, field("Name (left)", input(b.name, v => set({
      name: v
    })))), React.createElement("div", {
      key: "c",
      style: {
        flex: 1
      }
    }, field("Category / function (right)", input(b.category, v => set({
      category: v
    }))))])]), b.type === "carousel" ? Section("5 · Carousel pages", [React.createElement("div", {
      key: "steps",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, b.steps.map((s, i) => React.createElement(StepRow, {
      key: i,
      s,
      i,
      total: b.steps.length,
      stepOp
    }))), React.createElement("button", {
      key: "add",
      onClick: addStep,
      style: addBtn()
    }, "+ Add a page"), React.createElement("div", {
      key: "h",
      style: {
        fontSize: 12.5,
        color: "#8a9098",
        marginTop: 8
      }
    }, "Click the colour dot to cycle a page's role: loud (cover) · light (step) · section (chapter marker).")]) : null, b.type === "quote" ? Section("5 · The quote", [field("Exact sentence (verbatim from the post)", textarea(b.quote, v => set({
      quote: v
    }), "The visual carries the save, not the caption.", 3)), React.createElement("div", {
      key: "r",
      style: {
        display: "flex",
        gap: 12
      }
    }, [React.createElement("div", {
      key: "n",
      style: {
        flex: 1
      }
    }, field("Attribution name", input(b.attrName, v => set({
      attrName: v
    }), b.name))), React.createElement("div", {
      key: "ro",
      style: {
        flex: 1
      }
    }, field("Attribution role", input(b.attrRole, v => set({
      attrRole: v
    }), b.category)))])]) : null, Section("6 · References & sketch", [React.createElement(Dropzone, {
      key: "dz",
      onFiles,
      refs,
      clear: () => setRefs([])
    }), React.createElement("div", {
      key: "sk",
      style: {
        marginTop: 12
      }
    }, [React.createElement("div", {
      key: "l",
      style: labelStyle()
    }, "Sketch how you picture it"), React.createElement(SketchPad, {
      key: "p"
    })])]), Section("7 · Brand layer", [field("Primary colour", React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap"
      }
    }, SWATCHES.map(c => React.createElement("button", {
      key: c,
      onClick: () => set({
        primary: c
      }),
      title: c,
      style: {
        width: 30,
        height: 30,
        borderRadius: 8,
        background: c,
        border: b.primary === c ? "3px solid #1f2328" : "1px solid #d8dadd",
        cursor: "pointer"
      }
    })))), field("Font", React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap"
      }
    }, FONTS.map(f => React.createElement("button", {
      key: f,
      onClick: () => set({
        font: f
      }),
      style: seg(b.font === f)
    }, f))))]), React.createElement("div", {
      key: "actions",
      style: {
        display: "flex",
        gap: 10,
        margin: "8px 0 40px"
      }
    }, [React.createElement("button", {
      key: "copy",
      onClick: () => {
        navigator.clipboard && navigator.clipboard.writeText(briefText(b));
        flash("Brief copied — paste it to start a build");
      },
      style: primaryBtn(b.primary)
    }, "Copy filled brief"), React.createElement("button", {
      key: "reset",
      onClick: () => {
        setB(DEFAULT);
        flash("Reset");
      },
      style: ghostBtn()
    }, "Reset")])]), /* ---- right: live preview ---- */
    React.createElement("div", {
      key: "prev",
      style: {
        borderLeft: "1px solid #e2e4e7",
        background: "#F4F2EE",
        padding: "24px 26px",
        overflowY: "auto",
        maxHeight: "100vh",
        position: "sticky",
        top: 0
      }
    }, [React.createElement("div", {
      key: "h",
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14
      }
    }, [React.createElement("span", {
      key: "t",
      style: {
        fontWeight: 700,
        fontSize: 14
      }
    }, "Preview · in the LinkedIn feed"), React.createElement("span", {
      key: "tag",
      style: {
        fontSize: 11.5,
        fontWeight: 600,
        color: "#6b7280",
        background: "#fff",
        border: "1px solid #e0e2e5",
        borderRadius: 999,
        padding: "3px 10px"
      }
    }, b.type)]), /* advice banner */
    React.createElement("div", {
      key: "adv",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 7,
        marginBottom: 16
      }
    }, notes.map((n, i) => React.createElement("div", {
      key: i,
      style: notice(n.t)
    }, [React.createElement("span", {
      key: "d",
      style: {
        fontWeight: 700,
        marginRight: 6
      }
    }, n.t === "warn" ? "Pushback:" : n.t === "good" ? "Good:" : "Tip:"), n.m]))), React.createElement(Preview, {
      key: "p",
      b
    }), React.createElement("div", {
      key: "note",
      style: {
        fontSize: 12,
        color: "#8a9098",
        marginTop: 12,
        lineHeight: 1.5
      }
    }, "Live mock from your brief. This is how the visual lands in the feed — single image or swipeable carousel.")]), toast ? React.createElement("div", {
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

  /* ---------- small UI helpers ---------- */
  function Section(title, children) {
    return React.createElement("section", {
      key: title,
      style: {
        marginBottom: 22,
        background: "#fff",
        border: "1px solid #e6e8eb",
        borderRadius: 14,
        padding: "16px 18px"
      }
    }, [React.createElement("div", {
      key: "t",
      style: {
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: ".02em",
        textTransform: "uppercase",
        color: "#9aa0a6",
        marginBottom: 12
      }
    }, title), ...[].concat(children)]);
  }
  function labelStyle() {
    return {
      fontSize: 13,
      fontWeight: 600,
      color: "#3a3f45",
      marginBottom: 6,
      display: "block"
    };
  }
  function field(label, control) {
    return React.createElement("div", {
      key: label,
      style: {
        marginBottom: 12
      }
    }, [React.createElement("label", {
      key: "l",
      style: labelStyle()
    }, label), React.cloneElement(control, {
      key: "ctrl"
    })]);
  }
  const inputBase = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d8dadd",
    borderRadius: 9,
    padding: "9px 11px",
    fontSize: 14,
    fontFamily: "inherit",
    color: "#1f2328",
    outline: "none",
    background: "#fff"
  };
  function input(val, onChange, ph) {
    return React.createElement("input", {
      value: val,
      placeholder: ph || "",
      onChange: e => onChange(e.target.value),
      style: inputBase
    });
  }
  function textarea(val, onChange, ph, rows) {
    return React.createElement("textarea", {
      value: val,
      placeholder: ph || "",
      rows: rows || 3,
      onChange: e => onChange(e.target.value),
      style: {
        ...inputBase,
        resize: "vertical",
        lineHeight: 1.5
      }
    });
  }
  function typeCard(on) {
    return {
      display: "flex",
      flexDirection: "column",
      gap: 3,
      alignItems: "flex-start",
      textAlign: "left",
      padding: "12px 14px",
      borderRadius: 11,
      cursor: "pointer",
      border: on ? "1px solid transparent" : "1px solid #d8dadd",
      background: on ? "#0A66C2" : "#fff",
      color: on ? "#fff" : "#1f2328"
    };
  }
  function seg(on) {
    return {
      padding: "7px 13px",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 600,
      textTransform: "capitalize",
      border: on ? "1px solid transparent" : "1px solid #d8dadd",
      background: on ? "#1f2328" : "#fff",
      color: on ? "#fff" : "#5f6671"
    };
  }
  function addBtn() {
    return {
      marginTop: 10,
      padding: "9px 14px",
      borderRadius: 9,
      border: "1px dashed #c4c8cd",
      background: "#fafbfc",
      color: "#5f6671",
      fontSize: 13.5,
      fontWeight: 600,
      cursor: "pointer",
      width: "100%"
    };
  }
  function primaryBtn(c) {
    return {
      padding: "11px 18px",
      borderRadius: 10,
      border: "none",
      background: c,
      color: "#fff",
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer"
    };
  }
  function ghostBtn() {
    return {
      padding: "11px 16px",
      borderRadius: 10,
      border: "1px solid #d8dadd",
      background: "#fff",
      color: "#5f6671",
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer"
    };
  }
  function notice(t) {
    const c = t === "warn" ? {
      bg: "#fff4e5",
      bd: "#ffd9a8",
      fg: "#8a5200"
    } : t === "good" ? {
      bg: "#e7f6ee",
      bd: "#bce8cf",
      fg: "#1f6b43"
    } : {
      bg: "#eef4fc",
      bd: "#cfe0f5",
      fg: "#1d4e85"
    };
    return {
      background: c.bg,
      border: "1px solid " + c.bd,
      color: c.fg,
      borderRadius: 10,
      padding: "9px 12px",
      fontSize: 12.8,
      lineHeight: 1.45
    };
  }
  function StepRow({
    s,
    i,
    total,
    stepOp
  }) {
    const dot = {
      loud: "#0A66C2",
      light: "#cdd9e8",
      section: "#16232B"
    }[s.role];
    return React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 9,
        background: "#fafbfc",
        border: "1px solid #e6e8eb",
        borderRadius: 10,
        padding: "7px 9px"
      }
    }, [React.createElement("button", {
      key: "role",
      onClick: () => stepOp(i, "role"),
      title: s.role,
      style: {
        width: 22,
        height: 22,
        flex: "none",
        borderRadius: "50%",
        background: dot,
        border: "1px solid rgba(0,0,0,.12)",
        cursor: "pointer"
      }
    }), React.createElement("span", {
      key: "n",
      style: {
        fontSize: 12,
        color: "#9aa0a6",
        width: 16,
        flex: "none",
        fontWeight: 700
      }
    }, i + 1), React.createElement("input", {
      key: "lab",
      value: s.label,
      onChange: e => stepOp(i, "edit", {
        label: e.target.value
      }),
      style: {
        width: 92,
        flex: "none",
        border: "1px solid #e0e2e5",
        borderRadius: 7,
        padding: "5px 7px",
        fontSize: 12.5,
        fontWeight: 600
      }
    }), React.createElement("input", {
      key: "note",
      value: s.note,
      placeholder: "what's on this page…",
      onChange: e => stepOp(i, "edit", {
        note: e.target.value
      }),
      style: {
        flex: 1,
        minWidth: 0,
        border: "1px solid #e0e2e5",
        borderRadius: 7,
        padding: "5px 7px",
        fontSize: 12.5
      }
    }), React.createElement("div", {
      key: "ops",
      style: {
        display: "flex",
        gap: 2
      }
    }, [miniBtn("↑", () => stepOp(i, "up"), i === 0), miniBtn("↓", () => stepOp(i, "down"), i === total - 1), miniBtn("✕", () => stepOp(i, "del"), total <= 2)])]);
  }
  function miniBtn(label, onClick, disabled) {
    return React.createElement("button", {
      key: label,
      onClick,
      disabled,
      style: {
        width: 24,
        height: 24,
        borderRadius: 6,
        border: "1px solid #e0e2e5",
        background: "#fff",
        color: disabled ? "#cbced2" : "#5f6671",
        cursor: disabled ? "default" : "pointer",
        fontSize: 12,
        lineHeight: 1,
        padding: 0
      }
    }, label);
  }
  function Dropzone({
    onFiles,
    refs,
    clear
  }) {
    const [over, setOver] = useState(false);
    const inp = useRef(null);
    return React.createElement("div", null, [React.createElement("div", {
      key: "dz",
      onClick: () => inp.current && inp.current.click(),
      onDragOver: e => {
        e.preventDefault();
        setOver(true);
      },
      onDragLeave: () => setOver(false),
      onDrop: e => {
        e.preventDefault();
        setOver(false);
        onFiles(e.dataTransfer.files);
      },
      style: {
        border: "2px dashed " + (over ? "#0A66C2" : "#cfd3d8"),
        borderRadius: 11,
        padding: "18px",
        textAlign: "center",
        cursor: "pointer",
        background: over ? "#eef4fc" : "#fafbfc",
        color: "#6b7280",
        fontSize: 13
      }
    }, [React.createElement("div", {
      key: "t",
      style: {
        fontWeight: 600
      }
    }, "Drop reference screenshots, or click to upload"), React.createElement("div", {
      key: "s",
      style: {
        fontSize: 12,
        marginTop: 3,
        color: "#9aa0a6"
      }
    }, "Examples you love, a competitor post, anything that shows what you're after"), React.createElement("input", {
      key: "i",
      ref: inp,
      type: "file",
      accept: "image/*",
      multiple: true,
      onChange: e => onFiles(e.target.files),
      style: {
        display: "none"
      }
    })]), refs.length ? React.createElement("div", {
      key: "thumbs",
      style: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginTop: 10,
        alignItems: "center"
      }
    }, [...refs.map((r, i) => React.createElement("img", {
      key: i,
      src: r.url,
      alt: r.name,
      style: {
        width: 56,
        height: 56,
        objectFit: "cover",
        borderRadius: 8,
        border: "1px solid #e0e2e5"
      }
    })), React.createElement("button", {
      key: "clr",
      onClick: clear,
      style: {
        fontSize: 12,
        color: "#9aa0a6",
        background: "none",
        border: "none",
        cursor: "pointer",
        textDecoration: "underline"
      }
    }, "clear")]) : null]);
  }
  function SketchPad() {
    const ref = useRef(null),
      drawing = useRef(false);
    const [color, setColor] = useState("#1f2328");
    useEffect(() => {
      const c = ref.current;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }, []);
    const pos = e => {
      const r = ref.current.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return {
        x: t.clientX - r.left,
        y: t.clientY - r.top
      };
    };
    const start = e => {
      drawing.current = true;
      const ctx = ref.current.getContext("2d");
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    };
    const move = e => {
      if (!drawing.current) return;
      e.preventDefault();
      const ctx = ref.current.getContext("2d");
      const p = pos(e);
      ctx.strokeStyle = color;
      ctx.lineWidth = color === "#fff" ? 18 : 3;
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };
    const end = () => {
      drawing.current = false;
    };
    const clear = () => {
      const c = ref.current,
        ctx = c.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, c.width, c.height);
    };
    return React.createElement("div", null, [React.createElement("canvas", {
      key: "c",
      ref,
      width: 468,
      height: 200,
      onMouseDown: start,
      onMouseMove: move,
      onMouseUp: end,
      onMouseLeave: end,
      onTouchStart: start,
      onTouchMove: move,
      onTouchEnd: end,
      style: {
        width: "100%",
        height: 200,
        border: "1px solid #d8dadd",
        borderRadius: 11,
        cursor: "crosshair",
        touchAction: "none",
        background: "#fff"
      }
    }), React.createElement("div", {
      key: "tools",
      style: {
        display: "flex",
        gap: 7,
        marginTop: 8,
        alignItems: "center"
      }
    }, [...["#1f2328", "#0A66C2", "#C2410C"].map(c => React.createElement("button", {
      key: c,
      onClick: () => setColor(c),
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: c,
        border: color === c ? "3px solid #9aa0a6" : "1px solid #d8dadd",
        cursor: "pointer"
      }
    })), React.createElement("button", {
      key: "erase",
      onClick: () => setColor("#fff"),
      style: {
        ...segMini(color === "#fff")
      }
    }, "Eraser"), React.createElement("button", {
      key: "clr",
      onClick: clear,
      style: segMini(false)
    }, "Clear")])]);
  }
  function segMini(on) {
    return {
      padding: "5px 11px",
      borderRadius: 7,
      fontSize: 12,
      fontWeight: 600,
      border: on ? "1px solid transparent" : "1px solid #d8dadd",
      background: on ? "#1f2328" : "#fff",
      color: on ? "#fff" : "#5f6671",
      cursor: "pointer"
    };
  }
  window.BriefStudio = BriefStudio;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/brief-studio/BriefStudio.jsx", error: String((e && e.message) || e) }); }

// ui_kits/setup/Setup.jsx
try { (() => {
/* Setup — the first-run onboarding wizard.
   A guided, stepped setup: brand identity → colours → spacing & shape →
   done. Left = the questions; right = a LIVE single visual that updates
   as you choose. Ends by generating the branch's overrides/*.css to save,
   then sends the user on to make visuals. */
(function () {
  const {
    useState,
    useEffect,
    useRef
  } = React;
  const h = React.createElement;
  const DS = window.LinkedInVisualDesignSystem_a51278;
  const KEY = "li-vds-setup-v1";
  const DONE_KEY = "li-vds-setup-done";
  const FONTS = ["Inter", "Plus Jakarta Sans", "Space Grotesk", "Sora", "Fraunces", "DM Sans"];
  const SWATCHES = ["#0A66C2", "#1F8A5B", "#C2410C", "#7C3AED", "#0F766E", "#BE123C", "#0B7285", "#16232B"];
  const SIGS = ["underline", "block", "bubble", "plain"];
  const STEPS = ["Welcome", "Identity", "Colours", "Spacing & shape", "Ready"];
  const DEFAULT = {
    font: "Inter",
    primary: "#0A66C2",
    secondary: "#16232B",
    accent: "#E7A33E",
    tint: 7,
    signature: "underline",
    name: "Your name",
    category: "Your category / function",
    logo: null,
    photo: null,
    margin: 72,
    radiusCard: 16,
    radiusCta: 18
  };
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s) return {
        ...DEFAULT,
        ...s
      };
    } catch (e) {}
    return DEFAULT;
  }
  function loadFont(font) {
    const id = "su-font-" + font.replace(/\s+/g, "-");
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id;
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=" + font.replace(/\s+/g, "+") + ":ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap";
    document.head.appendChild(l);
  }
  // suggest a deep secondary derived from primary (for the section role)
  function deriveSecondary(hex) {
    const n = hex.replace("#", "");
    const r = parseInt(n.slice(0, 2), 16),
      g = parseInt(n.slice(2, 4), 16),
      b = parseInt(n.slice(4, 6), 16);
    const f = 0.26;
    const d = x => Math.round(x * f).toString(16).padStart(2, "0");
    return "#" + d(r) + d(g) + d(b);
  }
  function themeVars(b) {
    return {
      "--brand-primary": b.primary,
      "--brand-secondary": b.secondary,
      "--brand-accent": b.accent,
      "--brand-tint": b.tint + "%",
      "--brand-font": `'${b.font}', system-ui, sans-serif`,
      "--brand-font-display": `'${b.font}', system-ui, sans-serif`,
      "--margin": b.margin + "px",
      "--radius-card": b.radiusCard + "px",
      "--radius-cta": b.radiusCta + "px"
    };
  }

  /* ---------- the live preview visual ---------- */
  function PreviewVisual({
    b
  }) {
    const {
      Canvas,
      Eyebrow,
      Headline,
      Mark,
      Subhead
    } = DS;
    if (!Canvas) return h("div", {
      style: {
        color: "#9aa0a6",
        fontSize: 13,
        padding: 40
      }
    }, "Preview loads once the bundle is compiled — reload.");
    return h(Canvas, {
      role: "light"
    }, [
    // chrome with optional logo
    h("div", {
      key: "ch",
      style: {
        position: "absolute",
        top: "var(--margin)",
        left: "var(--margin)",
        right: "var(--margin)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, [h("div", {
      key: "l",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 16
      }
    }, [b.logo ? h("img", {
      key: "lg",
      src: b.logo,
      style: {
        height: 48,
        maxWidth: 200,
        objectFit: "contain"
      }
    }) : null, h("span", {
      key: "nm",
      style: {
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: ".06em",
        color: "var(--fg)"
      }
    }, b.name)]), h("span", {
      key: "c",
      style: {
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: ".06em",
        color: "var(--muted)"
      }
    }, b.category)]),
    // center message
    h("div", {
      key: "mid",
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
      key: "e"
    }, "This is your style"), h(Headline, {
      key: "hh",
      size: "lg",
      style: {
        marginTop: 18
      }
    }, ["Your headline, with an ", h(Mark, {
      key: "m",
      signature: b.signature
    }, "emphasis")]), h(Subhead, {
      key: "s",
      style: {
        marginTop: 24
      }
    }, "Colours, font, spacing and shape — all set from your answers on the left.")]),
    // footer profile lockup
    b.photo ? h("div", {
      key: "ft",
      style: {
        position: "absolute",
        left: "var(--margin)",
        right: "var(--margin)",
        bottom: "var(--margin)",
        display: "flex",
        alignItems: "center",
        gap: 20
      }
    }, [h("img", {
      key: "p",
      src: b.photo,
      style: {
        width: 84,
        height: 84,
        borderRadius: "50%",
        objectFit: "cover",
        border: "1.5px solid var(--canvas-light-line)"
      }
    }), h("div", {
      key: "d",
      style: {
        display: "flex",
        flexDirection: "column"
      }
    }, [h("span", {
      key: "n",
      style: {
        fontWeight: 700,
        fontSize: 26,
        color: "var(--fg)"
      }
    }, b.name), h("span", {
      key: "r",
      style: {
        fontWeight: 500,
        fontSize: 20,
        color: "var(--muted)"
      }
    }, b.category)])]) : null]);
  }
  function Stage({
    b
  }) {
    const W = 432,
      s = W / 1080;
    return h("div", {
      style: {
        width: W,
        height: W * 1.25,
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 14px 50px rgba(0,0,0,.18)",
        background: "#fff",
        flex: "none"
      }
    }, h("div", {
      style: {
        width: 1080,
        height: 1350,
        transform: `scale(${s})`,
        transformOrigin: "top left"
      }
    }, h(PreviewVisual, {
      b
    })));
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
    const set = patch => setB(p => {
      const n = {
        ...p,
        ...patch
      };
      try {
        localStorage.setItem(KEY, JSON.stringify(n));
      } catch (e) {}
      return n;
    });
    const flash = m => {
      setToast(m);
      clearTimeout(flash._t);
      flash._t = setTimeout(() => setToast(null), 2400);
    };
    useEffect(() => loadFont(b.font), [b.font]);
    // Apply brand vars to :root (not a nested div) so derived aliases
    // (--font-display, --canvas-light-bg color-mix, etc.) re-resolve correctly.
    useEffect(() => {
      const r = document.documentElement.style;
      const v = themeVars(b);
      Object.keys(v).forEach(k => r.setProperty(k, v[k]));
    }, [b]);
    const onImg = (file, key) => {
      if (!file) return;
      const r = new FileReader();
      r.onload = () => set({
        [key]: r.result
      });
      r.readAsDataURL(file);
    };
    const copy = (text, what) => {
      navigator.clipboard && navigator.clipboard.writeText(text);
      flash(what + " copied");
    };
    const download = (text, filename) => {
      const blob = new Blob([text], {
        type: "text/css"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      flash(filename + " downloaded");
    };
    const finish = () => {
      localStorage.setItem(DONE_KEY, "1");
      setStep(4);
    };
    const showPreview = step >= 1 && step <= 3;
    return h("div", {
      style: {
        minHeight: "100vh",
        background: "#f1f2f4",
        fontFamily: "system-ui,-apple-system,sans-serif",
        color: "#1f2328",
        display: "grid",
        gridTemplateColumns: showPreview ? "minmax(0,1fr) 520px" : "1fr"
      }
    }, [/* ---- left ---- */
    h("div", {
      key: "l",
      style: {
        padding: "30px 38px",
        overflowY: "auto",
        maxHeight: "100vh",
        maxWidth: showPreview ? "none" : 720,
        margin: showPreview ? 0 : "0 auto",
        width: "100%",
        boxSizing: "border-box"
      }
    }, [
    // progress rail
    h("div", {
      key: "rail",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 26
      }
    }, STEPS.map((s, i) => h("div", {
      key: i,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, [h("div", {
      key: "d",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 7
      }
    }, [h("span", {
      key: "n",
      style: {
        width: 24,
        height: 24,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 700,
        background: i < step ? "#1f8a5b" : i === step ? "#0A66C2" : "#e2e4e7",
        color: i <= step ? "#fff" : "#9aa0a6"
      }
    }, i < step ? "✓" : i + 1), h("span", {
      key: "l",
      style: {
        fontSize: 12.5,
        fontWeight: 600,
        color: i === step ? "#1f2328" : "#9aa0a6",
        whiteSpace: "nowrap"
      }
    }, s)]), i < STEPS.length - 1 ? h("span", {
      key: "sep",
      style: {
        width: 18,
        height: 2,
        background: "#e2e4e7",
        borderRadius: 2
      }
    }) : null]))), step === 0 ? Welcome({
      onStart: () => setStep(1)
    }) : null, step === 1 ? StepIdentity({
      b,
      set,
      onImg
    }) : null, step === 2 ? StepColours({
      b,
      set
    }) : null, step === 3 ? StepSpacing({
      b,
      set
    }) : null, step === 4 ? StepDone({
      b,
      brandCss: brandCss(b),
      extrasCss: extrasCss(b),
      copy,
      download
    }) : null,
    // nav
    step > 0 && step < 4 ? h("div", {
      key: "nav",
      style: {
        display: "flex",
        gap: 10,
        marginTop: 26,
        marginBottom: 40
      }
    }, [h("button", {
      key: "b",
      onClick: () => setStep(step - 1),
      style: ghost()
    }, "Back"), step < 3 ? h("button", {
      key: "n",
      onClick: () => setStep(step + 1),
      style: primary(b.primary)
    }, "Continue") : h("button", {
      key: "f",
      onClick: finish,
      style: primary(b.primary)
    }, "Finish setup")]) : null, step === 4 ? h("div", {
      key: "redo",
      style: {
        marginBottom: 40
      }
    }, h("button", {
      onClick: () => setStep(1),
      style: ghost()
    }, "← Edit setup again")) : null]), /* ---- right preview ---- */
    showPreview ? h("div", {
      key: "r",
      style: {
        borderLeft: "1px solid #e2e4e7",
        padding: "30px 26px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        position: "sticky",
        top: 0,
        maxHeight: "100vh",
        overflowY: "auto",
        background: "#e9ebee"
      }
    }, [h("div", {
      key: "t",
      style: {
        alignSelf: "stretch",
        fontWeight: 700,
        fontSize: 14
      }
    }, "Live preview · single visual"), h(Stage, {
      key: "s",
      b
    }), h("div", {
      key: "n",
      style: {
        fontSize: 12,
        color: "#8a9098",
        textAlign: "center",
        lineHeight: 1.5,
        maxWidth: 420
      }
    }, "This is your style applied to a real visual. Carousels, infographics and quotes inherit the same brand.")]) : null, toast ? h("div", {
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

  /* ---------- steps ---------- */
  function Welcome({
    onStart
  }) {
    return h("div", {
      key: "w",
      style: {
        paddingTop: 30,
        maxWidth: 560
      }
    }, [h("div", {
      key: "t",
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 38,
        letterSpacing: "-.025em",
        lineHeight: 1.08
      }
    }, "Let's set up your brand."), h("p", {
      key: "p",
      style: {
        fontSize: 16,
        color: "#5f6671",
        lineHeight: 1.55,
        margin: "16px 0 26px"
      }
    }, "A few quick steps and every visual you make will be unmistakably yours. You'll pick your font and colours, add a logo and photo, and fine-tune spacing — with a live preview the whole way. Takes about two minutes."), h("div", {
      key: "list",
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginBottom: 30
      }
    }, [["Identity", "Font, name, logo & profile photo"], ["Colours", "Primary, section & accent — with a smart suggestion"], ["Spacing & shape", "Margins and corner radii to taste"]].map((x, i) => h("div", {
      key: i,
      style: {
        display: "flex",
        gap: 12,
        alignItems: "center"
      }
    }, [h("span", {
      key: "n",
      style: {
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: "#eef4fc",
        color: "#0A66C2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: 13,
        flex: "none"
      }
    }, i + 1), h("div", {
      key: "d"
    }, [h("div", {
      key: "t",
      style: {
        fontWeight: 700,
        fontSize: 14.5
      }
    }, x[0]), h("div", {
      key: "s",
      style: {
        fontSize: 13,
        color: "#8a9098"
      }
    }, x[1])])]))), h("button", {
      key: "go",
      onClick: onStart,
      style: {
        ...primary("#0A66C2"),
        fontSize: 15,
        padding: "13px 26px"
      }
    }, "Begin setup →")]);
  }
  function StepIdentity({
    b,
    set,
    onImg
  }) {
    return panel("Identity", "Your font and who you are. The font carries every headline and word.", [group("Font", h("div", {
      style: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap"
      }
    }, FONTS.map(f => h("button", {
      key: f,
      onClick: () => set({
        font: f
      }),
      style: {
        ...seg(b.font === f),
        fontFamily: `'${f}', sans-serif`,
        fontSize: 14
      }
    }, f)))), row([group("Name (left of the bar)", textInput(b.name, v => set({
      name: v
    }))), group("Category / function (right)", textInput(b.category, v => set({
      category: v
    })))], "names"), row([group("Logo", uploader(b.logo, f => onImg(f, "logo"), () => set({
      logo: null
    }), "Upload logo (PNG/SVG)")), group("Profile photo (footer)", uploader(b.photo, f => onImg(f, "photo"), () => set({
      photo: null
    }), "Upload photo", true))], "uploads"), group("Headline signature", h("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, SIGS.map(s => h("button", {
      key: s,
      onClick: () => set({
        signature: s
      }),
      style: seg(b.signature === s)
    }, s))))]);
  }
  function StepColours({
    b,
    set
  }) {
    const suggestion = deriveSecondary(b.primary);
    return panel("Colours", "One primary does most of the work. The section colour anchors chapter slides; the accent marks and highlights.", [group("Primary — your loud canvas (cover / back)", colorField(b.primary, v => set({
      primary: v
    }))), group("Section — deep colour for chapter slides", h("div", null, [colorField(b.secondary, v => set({
      secondary: v
    })), b.secondary.toLowerCase() !== suggestion.toLowerCase() ? h("button", {
      key: "sg",
      onClick: () => set({
        secondary: suggestion
      }),
      style: {
        marginTop: 8,
        fontSize: 12.5,
        color: "#0A66C2",
        background: "#eef4fc",
        border: "1px solid #cfe0f5",
        borderRadius: 8,
        padding: "6px 11px",
        cursor: "pointer",
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 7
      }
    }, [h("span", {
      key: "d",
      style: {
        width: 14,
        height: 14,
        borderRadius: 3,
        background: suggestion
      }
    }), "Use a section colour derived from your primary"]) : null])), group("Accent — categorise / highlight", colorField(b.accent, v => set({
      accent: v
    }))), group("Light canvas tint — " + b.tint + "% of primary", slider(3, 16, 1, b.tint, v => set({
      tint: v
    }), "paler ← → bolder")), swatchPreview(b)]);
  }
  function StepSpacing({
    b,
    set
  }) {
    return panel("Spacing & shape", "Fine-tune the feel. The 24px safe band is fixed; everything else is yours to adjust.", [group("Content margin — " + b.margin + "px", slider(40, 120, 4, b.margin, v => set({
      margin: v
    }), "tighter ← → roomier")), group("Card radius — " + b.radiusCard + "px", slider(0, 36, 2, b.radiusCard, v => set({
      radiusCard: v
    }), "sharp ← → round")), group("CTA radius — " + b.radiusCta + "px", slider(0, 40, 2, b.radiusCta, v => set({
      radiusCta: v
    }), "sharp ← → round")), h("div", {
      key: "shapes",
      style: {
        display: "flex",
        gap: 14,
        marginTop: 8
      }
    }, [shapeChip(b.radiusCard, "card"), shapeChip(b.radiusCta, "cta")])]);
  }
  function StepDone({
    b,
    brandCss,
    extrasCss,
    copy,
    download
  }) {
    return h("div", {
      key: "done",
      style: {
        maxWidth: 640
      }
    }, [h("div", {
      key: "t",
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 30,
        letterSpacing: "-.02em"
      }
    }, "Your brand is ready. 🎉"), h("p", {
      key: "p",
      style: {
        fontSize: 15,
        color: "#5f6671",
        lineHeight: 1.55,
        margin: "12px 0 22px"
      }
    }, "Download these two files and drop them into your branch — they're yours and master updates never overwrite them. Then just open a chat and start making visuals; no setup needed there."),
    // download buttons — the primary action
    h("div", {
      key: "dl",
      style: {
        display: "flex",
        gap: 10,
        marginBottom: 22,
        flexWrap: "wrap"
      }
    }, [h("button", {
      key: "b1",
      onClick: () => download(brandCss, "brand.css"),
      style: {
        ...primary(b.primary),
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 14.5
      }
    }, "↓ Download brand.css"), h("button", {
      key: "b2",
      onClick: () => download(extrasCss, "extras.css"),
      style: {
        ...ghost(),
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 14.5
      }
    }, "↓ Download extras.css")]),
    // where they go
    h("div", {
      key: "where",
      style: {
        fontSize: 13.5,
        color: "#3a3f45",
        background: "#f3f6fb",
        border: "1px solid #dde6f2",
        borderRadius: 11,
        padding: "14px 16px",
        marginBottom: 20,
        lineHeight: 1.6
      }
    }, [h("div", {
      key: "h",
      style: {
        fontWeight: 700,
        marginBottom: 6
      }
    }, "Where they go in your branch"), h("div", {
      key: "1",
      style: {
        fontFamily: "ui-monospace,monospace",
        fontSize: 12.5,
        color: "#5f6671"
      }
    }, "overrides/brand.css   ← replace the file there"), h("div", {
      key: "2",
      style: {
        fontFamily: "ui-monospace,monospace",
        fontSize: 12.5,
        color: "#5f6671"
      }
    }, "overrides/extras.css  ← replace the file there"), b.logo || b.photo ? h("div", {
      key: "3",
      style: {
        fontFamily: "ui-monospace,monospace",
        fontSize: 12.5,
        color: "#5f6671",
        marginTop: 4
      }
    }, "client/assets/         ← save your logo / photo here") : null]),
    // collapsible: copy the raw CSS instead
    h("details", {
      key: "raw",
      style: {
        marginBottom: 18
      }
    }, [h("summary", {
      key: "s",
      style: {
        fontSize: 13,
        color: "#6b7280",
        cursor: "pointer",
        fontWeight: 600,
        marginBottom: 12
      }
    }, "Prefer to copy-paste instead? Show the CSS"), codeBlock("overrides/brand.css", brandCss, () => copy(brandCss, "brand.css")), codeBlock("overrides/extras.css", extrasCss, () => copy(extrasCss, "extras.css"))]), h("p", {
      key: "next",
      style: {
        fontSize: 14,
        color: "#5f6671",
        lineHeight: 1.55,
        margin: "4px 0 0"
      }
    }, [h("b", {
      key: "b"
    }, "Working inside Claude? "), "Just copy the CSS above and paste it into the chat — say \u201csave this as my brand\u201d and the design system writes it to overrides/ for you. Then start making visuals."])]);
  }

  /* ---------- helpers ---------- */
  function panel(title, sub, children) {
    return h("div", {
      key: title,
      style: {
        maxWidth: 600
      }
    }, [h("div", {
      key: "t",
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 26,
        letterSpacing: "-.02em"
      }
    }, title), h("p", {
      key: "s",
      style: {
        fontSize: 14.5,
        color: "#6b7280",
        lineHeight: 1.5,
        margin: "8px 0 22px"
      }
    }, sub), ...children]);
  }
  function group(label, control) {
    return h("div", {
      key: label,
      style: {
        marginBottom: 18
      }
    }, [h("label", {
      key: "l",
      style: {
        display: "block",
        fontSize: 13,
        fontWeight: 600,
        color: "#3a3f45",
        marginBottom: 8
      }
    }, label), control]);
  }
  function row(items, k) {
    return h("div", {
      key: k || "row",
      style: {
        display: "flex",
        gap: 16
      }
    }, items.map((it, i) => h("div", {
      key: i,
      style: {
        flex: 1
      }
    }, it)));
  }
  const inputBase = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d8dadd",
    borderRadius: 9,
    padding: "10px 12px",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    background: "#fff",
    color: "#1f2328"
  };
  function textInput(v, on) {
    return h("input", {
      value: v,
      onChange: e => on(e.target.value),
      style: inputBase
    });
  }
  function seg(on) {
    return {
      padding: "8px 14px",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 600,
      textTransform: "capitalize",
      border: on ? "1px solid transparent" : "1px solid #d8dadd",
      background: on ? "#1f2328" : "#fff",
      color: on ? "#fff" : "#5f6671"
    };
  }
  function primary(c) {
    return {
      padding: "11px 18px",
      borderRadius: 10,
      border: "none",
      background: c,
      color: "#fff",
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer"
    };
  }
  function ghost() {
    return {
      padding: "11px 16px",
      borderRadius: 10,
      border: "1px solid #d8dadd",
      background: "#fff",
      color: "#5f6671",
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer"
    };
  }
  function colorField(v, on) {
    return h("div", {
      style: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap"
      }
    }, [...SWATCHES.map(c => h("button", {
      key: c,
      onClick: () => on(c),
      title: c,
      style: {
        width: 32,
        height: 32,
        borderRadius: 8,
        background: c,
        border: v.toLowerCase() === c.toLowerCase() ? "3px solid #1f2328" : "1px solid #d8dadd",
        cursor: "pointer"
      }
    })), h("label", {
      key: "custom",
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        marginLeft: 4,
        fontSize: 12.5,
        color: "#6b7280",
        cursor: "pointer"
      }
    }, [h("input", {
      key: "i",
      type: "color",
      value: v,
      onChange: e => on(e.target.value),
      style: {
        width: 32,
        height: 32,
        border: "1px solid #d8dadd",
        borderRadius: 8,
        padding: 0,
        background: "none",
        cursor: "pointer"
      }
    }), h("span", {
      key: "hx",
      style: {
        fontFamily: "ui-monospace,monospace"
      }
    }, v)])]);
  }
  function slider(min, max, stepv, val, on, hint) {
    return h("div", null, [h("input", {
      key: "s",
      type: "range",
      min,
      max,
      step: stepv,
      value: val,
      onChange: e => on(Number(e.target.value)),
      style: {
        width: "100%",
        accentColor: "#0A66C2"
      }
    }), hint ? h("div", {
      key: "h",
      style: {
        fontSize: 11.5,
        color: "#9aa0a6",
        display: "flex",
        justifyContent: "space-between",
        marginTop: 2
      }
    }, hint.split(" ← → ").map((t, i) => h("span", {
      key: i
    }, t))) : null]);
  }
  function uploader(val, onFile, onClear, label, round) {
    const ref = React.createRef();
    return h("div", null, [val ? h("div", {
      key: "p",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, [h("img", {
      key: "i",
      src: val,
      style: {
        width: 52,
        height: 52,
        objectFit: round ? "cover" : "contain",
        borderRadius: round ? "50%" : 8,
        border: "1px solid #e0e2e5",
        background: "#fff"
      }
    }), h("button", {
      key: "c",
      onClick: onClear,
      style: {
        fontSize: 12.5,
        color: "#9aa0a6",
        background: "none",
        border: "none",
        cursor: "pointer",
        textDecoration: "underline"
      }
    }, "remove")]) : h("button", {
      key: "u",
      onClick: () => ref.current && ref.current.click(),
      style: {
        width: "100%",
        padding: "13px",
        border: "2px dashed #cfd3d8",
        borderRadius: 10,
        background: "#fafbfc",
        color: "#6b7280",
        fontSize: 13,
        cursor: "pointer",
        fontWeight: 600
      }
    }, label), h("input", {
      key: "in",
      ref,
      type: "file",
      accept: "image/*",
      onChange: e => onFile(e.target.files[0]),
      style: {
        display: "none"
      }
    })]);
  }
  function swatchPreview(b) {
    return h("div", {
      key: "sw",
      style: {
        display: "flex",
        gap: 0,
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid #e0e2e5",
        marginTop: 4
      }
    }, [["Loud", b.primary, "#fff"], ["Light", mix(b.primary, b.tint), "#1f2328"], ["Section", b.secondary, "#fff"], ["Accent", b.accent, "#1f2328"]].map((x, i) => h("div", {
      key: i,
      style: {
        flex: 1,
        background: x[1],
        color: x[2],
        padding: "12px 10px",
        fontSize: 11.5,
        fontWeight: 700,
        textAlign: "center"
      }
    }, x[0])));
  }
  function mix(hex, pct) {
    const n = hex.replace("#", "");
    const r = parseInt(n.slice(0, 2), 16),
      g = parseInt(n.slice(2, 4), 16),
      b = parseInt(n.slice(4, 6), 16);
    const f = pct / 100,
      m = x => Math.round(x * f + 255 * (1 - f)).toString(16).padStart(2, "0");
    return "#" + m(r) + m(g) + m(b);
  }
  function shapeChip(radius, label) {
    return h("div", {
      key: label,
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6
      }
    }, [h("div", {
      key: "b",
      style: {
        width: 70,
        height: 50,
        background: "#eef4fc",
        border: "1.5px solid #0A66C2",
        borderRadius: radius
      }
    }), h("span", {
      key: "l",
      style: {
        fontSize: 11.5,
        color: "#9aa0a6",
        fontWeight: 600
      }
    }, label + " · " + radius + "px")]);
  }
  function codeBlock(name, code, onCopy) {
    return h("div", {
      key: name,
      style: {
        marginBottom: 16
      }
    }, [h("div", {
      key: "h",
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 6
      }
    }, [h("span", {
      key: "n",
      style: {
        fontFamily: "ui-monospace,monospace",
        fontSize: 12.5,
        color: "#3a3f45",
        fontWeight: 600
      }
    }, name), h("button", {
      key: "c",
      onClick: onCopy,
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: "#0A66C2",
        background: "#eef4fc",
        border: "1px solid #cfe0f5",
        borderRadius: 7,
        padding: "4px 11px",
        cursor: "pointer"
      }
    }, "Copy")]), h("pre", {
      key: "p",
      style: {
        margin: 0,
        fontFamily: "ui-monospace,monospace",
        fontSize: 12,
        lineHeight: 1.55,
        color: "#cfe3ff",
        background: "#0f1419",
        borderRadius: 10,
        padding: "13px 15px",
        overflowX: "auto",
        whiteSpace: "pre"
      }
    }, code)]);
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
  const DS = window.LinkedInVisualDesignSystem_a51278;
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
