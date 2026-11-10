/* DCSLD — integrated single-line diagram (SLD) of every design (templates, user-modified designs, assessment projects and the live simulation).
   Sheet 1 is one drawing from the PLN connection through the EHV breaker-and-a-half GIS and interbus transformers, the HV GIS and HV/MV
   transformers and the 20 kV sections down to a typical building 20 kV board, a typical MV/LV block (LV system 400 / 415 / 480 / 690 V) with UPS,
   generators and the IT rack, and a typical 6.6 kV chiller board; sheet 2 is the equipment and rating schedule (feeders, cables, protection, BOQ).
   Drawing practice: black and white; graphical symbols IEC 60617; device numbers IEEE C37.2; lettering ISO 3098 / IEC 61082-1 (2.5 mm ratings and
   notes, 3.5 mm designations, 5 mm title) without down-scaling — the sheet size (ISO 216 A2 / A1 / A0) follows the drawing; one language at a time
   (the website language); zone frame and title block (ISO 5457 / ISO 7200); hops where conductors cross; dashed lines for typical (repeated)
   connections; text interrupts the lines it is written over. Output: SVG (website), PDF and DWG (export) through DCSvg / DCPdf / DCDwg — in the DWG
   each sheet is a block (BEDIT), the frame a block per sheet size and the title block a block with attributes. */
(function (g) {
  'use strict';
  var E = g.DCEngine, PDF = g.DCPdf, SVG = g.DCSvg, DWG = g.DCDwg;
  var INK = '#000000', PAPER = '#ffffff', H1 = 5, H2 = 3.5, H3 = 2.5, LH = 3.5, LANG = 'en';
  function T(en, zh) { return LANG === 'zh' && zh ? zh : en; }
  function F(x, d) { return E.fmt(x, d || 0); }
  function TW(s, h, b) { return PDF.textW(String(s), h || H3, b); }
  function pickN(list, v) { for (var i = 0; i < list.length; i++) if (list[i] >= v) return list[i]; return list[list.length - 1]; }
  var IR = [1250, 2000, 2500, 3150, 4000, 5000], CTP = [400, 600, 800, 1000, 1200, 1600, 2000, 2500, 3000, 4000, 5000];
  var X0 = 68, FS = 15, SEC_GAP = 14, DASH = [1.6, 1];   /* drawing starts right of the margin column (16 … 62); feeder spacing; gap between 20 kV sections */

  /* ------------------------------------------------------------------ drawing primitives (mm, y downwards) */
  function Sym(pg) { this.pg = pg; }
  var S = Sym.prototype;
  S.ln = function (x1, y1, x2, y2, w, dash) { this.pg.line(x1, y1, x2, y2, { c: INK, w: w || 0.35, dash: dash }); };
  /* text; o.k = knock-out (the text interrupts the lines under it) */
  S.t = function (x, y, s, h, o) {
    o = o || {}; if ((s === undefined || s === null || s === '') && !o.tag) return; h = h || H3; s = String(s === undefined || s === null ? '' : s);
    if (o.k) { var w = this.w(s, h, o.b), x0 = o.a === 'c' ? x - w / 2 : (o.a === 'r' ? x - w : x); this.pg.rect(x0 - 0.6, y - 0.82 * h, w + 1.2, 1.12 * h, { fill: PAPER, stroke: false }); }
    this.pg.text(x, y, s, { h: h, a: o.a, v: o.v, b: o.b, c: INK, rot: o.rot, tag: o.tag, prompt: o.prompt });   /* tag: attribute of the title block in the DWG */
  };
  S.w = function (s, h, b) { return this.pg.textW(String(s), h || H3, b); };
  /* wrap into lines no wider than w (words; Chinese and over-long words by character) */
  S.wrap = function (s, h, w, b) {
    var self = this, out = [], cur = '', toks = [];
    String(s).split(' ').forEach(function (word, i) { if (self.w(word, h, b) <= w) toks.push((i ? ' ' : '') + word); else { var piece = i ? ' ' : ''; for (var k = 0; k < word.length; k++) { if (self.w(piece + word.charAt(k), h, b) > w && piece.trim()) { toks.push(piece); piece = ''; } piece += word.charAt(k); } toks.push(piece); } });
    toks.forEach(function (tk) { var tr = cur ? cur + tk : tk.replace(/^ /, ''); if (cur && self.w(tr, h, b) > w) { out.push(cur); cur = tk.replace(/^ /, ''); } else cur = tr; });
    if (cur) out.push(cur);
    return out.length ? out : [''];
  };
  S.para = function (x, y, s, h, w, o) { var L = this.wrap(s, h, w, o && o.b), self = this; L.forEach(function (l, i) { self.t(x, y + i * LH * h / H3, l, h, o); }); return L.length; };
  S.dot = function (x, y) { this.pg.circle(x, y, 0.7, { c: INK, w: 0.2, fill: INK }); };
  S.gnd = function (x, y) { this.ln(x, y, x, y + 1.8); this.ln(x - 3, y + 1.8, x + 3, y + 1.8); this.ln(x - 2, y + 2.9, x + 2, y + 2.9); this.ln(x - 1, y + 4, x + 1, y + 4); };
  S.gndH = function (x, y, d) { var e = x + 1.8 * d; this.ln(x, y, e, y); this.ln(e, y - 3, e, y + 3); this.ln(e + 1.1 * d, y - 2, e + 1.1 * d, y + 2); this.ln(e + 2.2 * d, y - 1, e + 2.2 * d, y + 1); };
  /* switching devices (IEC 60617-7): 'cb' circuit breaker (× on the fixed contact), 'ds' disconnector (bar), 'wcb' withdrawable circuit breaker
     (plug-in contacts at both ends); length L (+ 6 for withdrawable) */
  S.sw = function (x, y, kind, L) {
    L = L || 12; var o = kind === 'wcb' ? 3 : 0, a = y + o + 0.3 * L, b = y + o + 0.7 * L, m = 0.11 * L;
    if (o) this.chev(x, y + 1.6, true);
    this.ln(x, y, x, a); this.ln(x, b, x, y + L + 2 * o);
    this.ln(x, b, x - 0.3 * L, a + 0.05 * L, 0.45);
    if (kind === 'ds') this.ln(x - m, a, x + m, a, 0.45);
    else { this.ln(x - m, a - m, x + m, a + m, 0.45); this.ln(x - m, a + m, x + m, a - m, 0.45); }
    if (o) this.chev(x, y + L + 2 * o - 1.6, false);
    return L + 2 * o;
  };
  S.chev = function (x, y, down) { var d = down ? 1 : -1; this.ln(x - 1.6, y - 1.1 * d, x, y); this.ln(x, y, x + 1.6, y - 1.1 * d); this.ln(x - 1.6, y + 0.4 * d, x, y + 1.5 * d); this.ln(x, y + 1.5 * d, x + 1.6, y + 0.4 * d); };
  /* horizontal circuit breaker, 12 mm (bus section) */
  S.cbH = function (x, y, open) { this.ln(x, y, x + 3.6, y); this.ln(x + 2.8, y - 0.8, x + 4.4, y + 0.8, 0.45); this.ln(x + 2.8, y + 0.8, x + 4.4, y - 0.8, 0.45); this.ln(x + 8.4, y, x + 3.9, open ? y - 3.2 : y - 0.5, 0.45); this.ln(x + 8.4, y, x + 12, y); };
  /* earthing switch on a side branch (d = +1 right, −1 left), 14.4 mm */
  S.es = function (x, y, d) { d = d || 1; this.ln(x, y, x + 3.5 * d, y); this.ln(x + 3.5 * d, y, x + 8.6 * d, y - 3, 0.45); this.ln(x + 9.4 * d, y - 1.4, x + 9.4 * d, y + 1.4, 0.45); this.ln(x + 9.4 * d, y, x + 10.4 * d, y); this.gndH(x + 10.4 * d, y, d); };
  /* current transformer: one circle per secondary core, threaded on the conductor */
  S.ct = function (x, y, n, r) { r = r || 1.3; var p = 2 * r + 0.3, h = p * n + 0.4; this.ln(x, y, x, y + h); for (var i = 0; i < n; i++) this.pg.circle(x, y + 0.2 + r + i * p, r, { c: INK, w: 0.3 }); return h; };
  /* voltage transformer on a side branch: two (three) interlaced windings */
  S.vt = function (x, y, d, three) { d = d || 1; var c1 = x + 7 * d; this.ln(x, y, c1 - 2.4 * d, y); this.pg.circle(c1, y, 2.4, { c: INK, w: 0.3 }); this.pg.circle(c1 + 3.4 * d, y, 2.4, { c: INK, w: 0.3 }); if (three) this.pg.circle(c1 + 1.7 * d, y + 2.8, 2.4, { c: INK, w: 0.3 }); };
  /* surge arrester (metal-oxide) on a side branch to earth, drop 13.4 mm */
  S.sa = function (x, y, d, off) { d = d || -1; var bx = x + (off || 7) * d; this.ln(x, y, bx, y); this.ln(bx, y, bx, y + 1.5); this.pg.rect(bx - 1.7, y + 1.5, 3.4, 7.5, { c: INK, w: 0.3 }); this.ln(bx, y + 2.4, bx, y + 7.2, 0.3); this.pg.poly([[bx - 0.9, y + 6.2], [bx, y + 7.8], [bx + 0.9, y + 6.2]], { c: INK, w: 0.2, fill: INK, close: true }); this.ln(bx, y + 9, bx, y + 9.4); this.gnd(bx, y + 9.4); };
  /* cable sealing end (termination), 3.6 mm */
  S.term = function (x, y) { this.pg.poly([[x - 2.2, y], [x + 2.2, y], [x, y + 3.6]], { c: INK, w: 0.35, close: true }); return 3.6; };
  S.arrowDn = function (x, y) { this.pg.poly([[x - 1.8, y - 3.4], [x, y], [x + 1.8, y - 3.4]], { c: INK, w: 0.3, fill: INK, close: true }); };
  S.arrowUp = function (x, y) { this.pg.poly([[x - 1.8, y + 3.6], [x, y], [x + 1.8, y + 3.6]], { c: INK, w: 0.35, close: true }); };
  S.fuse = function (x, y) { this.pg.rect(x - 1.2, y, 2.4, 7, { c: INK, w: 0.3 }); this.ln(x, y - 0.8, x, y + 7.8, 0.25); return 7; };
  S.cap = function (x, y) { this.ln(x, y, x, y + 2.5); this.ln(x - 3.5, y + 2.5, x + 3.5, y + 2.5, 0.6); this.ln(x - 3.5, y + 4.3, x + 3.5, y + 4.3, 0.6); this.ln(x, y + 4.3, x, y + 7); return 7; };
  S.res = function (x, y) { this.pg.rect(x - 1.5, y, 3, 8, { c: INK, w: 0.3 }); return 8; };
  S.rot = function (x, y, r, ch) { this.pg.circle(x, y + r, r, { c: INK, w: 0.4, fill: PAPER }); this.t(x, y + r + 0.15 * r, ch, H2 * r / 5, { a: 'c', b: true }); this.t(x, y + 1.72 * r, '~', H3, { a: 'c' }); return 2 * r; };
  S.gen = function (x, y, r) { return this.rot(x, y, r || 5, 'G'); };
  S.mot = function (x, y, r) { return this.rot(x, y, r || 4.5, 'M'); };
  S.coil = function (x, y) { for (var i = 0; i < 3; i++) this.pg.arc(x, y + 1.4 + i * 2.8, 1.4, 90, -90, { c: INK, w: 0.35 }); return 8.4; };
  S.bat = function (x, y) { for (var i = 0; i < 2; i++) { this.ln(x - 2.6, y + i * 1.8, x + 2.6, y + i * 1.8, 0.4); this.ln(x - 1.3, y + i * 1.8 + 0.8, x + 1.3, y + i * 1.8 + 0.8, 0.8); } return 3.4; };
  /* windings: 'Y' star, 'D' delta, 'Z' zig-zag, inside a transformer circle of radius r */
  S.wind = function (cx, cy, k, r) {
    var q = (r || 5) / 5;
    if (k === 'D') this.pg.poly([[cx, cy - 1.9 * q], [cx + 1.8 * q, cy + 1.2 * q], [cx - 1.8 * q, cy + 1.2 * q]], { c: INK, w: 0.3, close: true });
    else if (k === 'Z') { this.ln(cx - 1.4 * q, cy - 1.4 * q, cx + 1.4 * q, cy - 1.4 * q, 0.3); this.ln(cx + 1.4 * q, cy - 1.4 * q, cx - 1.4 * q, cy + 1.4 * q, 0.3); this.ln(cx - 1.4 * q, cy + 1.4 * q, cx + 1.4 * q, cy + 1.4 * q, 0.3); }
    else { this.ln(cx, cy, cx, cy - 2 * q, 0.3); this.ln(cx, cy, cx - 1.75 * q, cy + 1.05 * q, 0.3); this.ln(cx, cy, cx + 1.75 * q, cy + 1.05 * q, 0.3); }
  };
  /* two-winding transformer (IEC 60617-6, two circles), height 3.45 r */
  S.tr2 = function (x, y, wH, wL, oltc, r) {
    r = r || 5.5; var c1 = y + r, c2 = y + 2.45 * r;
    this.pg.circle(x, c1, r, { c: INK, w: 0.4 }); this.pg.circle(x, c2, r, { c: INK, w: 0.4 }); this.wind(x, c1 - 0.25 * r, wH || 'Y', r); this.wind(x, c2 + 0.2 * r, wL || 'D', r);
    if (oltc) { this.ln(x - 1.2 * r, c2 + 0.3 * r, x + 1.2 * r, c1 - 0.5 * r, 0.3); this.pg.poly([[x + 1.2 * r, c1 - 0.5 * r], [x + 0.85 * r, c1 - 0.42 * r], [x + 1.05 * r, c1 - 0.18 * r]], { c: INK, w: 0.2, fill: INK, close: true }); }
    return 3.45 * r;
  };
  /* three-winding / two-LV-winding transformer: HV on top, windings below at x ∓ 0.82 r, height 3.3 r */
  S.tr3 = function (x, y, w2, oltc, w3, r) {
    r = r || 5.5; var c1 = y + r, c2 = y + 2.3 * r;
    this.pg.circle(x, c1, r, { c: INK, w: 0.4 }); this.pg.circle(x - 0.82 * r, c2, r, { c: INK, w: 0.4 }); this.pg.circle(x + 0.82 * r, c2, r, { c: INK, w: 0.4 });
    this.wind(x, c1 - 0.25 * r, 'Y', r); this.wind(x - 0.9 * r, c2 + 0.2 * r, w2 || 'D', r); this.wind(x + 0.9 * r, c2 + 0.2 * r, w3 || w2 || 'D', r);
    if (oltc) { this.ln(x - 1.45 * r, c2 + 0.5 * r, x + 1.45 * r, c1 - 0.6 * r, 0.3); this.pg.poly([[x + 1.45 * r, c1 - 0.6 * r], [x + 1.1 * r, c1 - 0.52 * r], [x + 1.3 * r, c1 - 0.28 * r]], { c: INK, w: 0.2, fill: INK, close: true }); }
    return 3.3 * r;
  };
  S.bus = function (x1, x2, y, w) { this.pg.rect(x1, y - (w || 1.2) / 2, x2 - x1, w || 1.2, { c: INK, w: 0.1, fill: INK }); };
  /* protection relay (IEC 60617 measuring-relay box) with the device numbers (IEEE C37.2); returns the width */
  S.relay = function (x, y, codes) { var w = this.w(codes, H3) + 3; this.pg.rect(x, y, w, 5.6, { c: INK, w: 0.3, fill: PAPER }); this.t(x + w / 2, y + 3.9, codes, H3, { a: 'c' }); return w; };
  /* static UPS: rectifier (AC/DC) and inverter (DC/AC), 26 × 12 */
  S.ups = function (x, y) {
    var w = 26, h = 12, x0 = x - w / 2; this.pg.rect(x0, y, w, h, { c: INK, w: 0.4, fill: PAPER }); this.ln(x, y, x, y + h, 0.3);
    this.ln(x0, y + h, x, y, 0.25); this.ln(x, y + h, x0 + w, y, 0.25);
    this.t(x0 + 2.6, y + 4.4, '~', H3); this.t(x - 2.4, y + h - 1.4, '=', H3, { a: 'r' }); this.t(x + 2.4, y + 4.4, '=', H3); this.t(x0 + w - 2.4, y + h - 1.4, '~', H3, { a: 'r' });
    return h;
  };
  S.box = function (x, y, w, h, lab, sub) { this.pg.rect(x - w / 2, y, w, h, { c: INK, w: 0.4, fill: PAPER }); this.t(x, y + (sub ? h / 2 - 0.4 : h / 2 + 1.2), lab, H3, { a: 'c', b: true }); if (sub) this.t(x, y + h / 2 + 3.2, sub, H3, { a: 'c' }); return h; };
  /* vertical conductor with hops (semicircles) where it crosses another conductor or a busbar without connection */
  S.vline = function (x, y1, y2, hops, w, dash) {
    var a = Math.min(y1, y2), b = Math.max(y1, y2), self = this, cur = a;
    (hops || []).filter(function (h) { return h > a + 2 && h < b - 2; }).sort(function (p, q) { return p - q; }).forEach(function (h) { self.ln(x, cur, x, h - 2, w, dash); self.pg.arc(x, h, 2, 90, -90, { c: INK, w: w || 0.35 }); cur = h + 2; });
    this.ln(x, cur, x, b, w, dash);
  };

  /* ------------------------------------------------------------------ sheet frame (ISO 5457), title block (ISO 7200), notes, legend, schedules */
  function fit(s, str, h, w, b) { str = String(str); if (s.w(str, h, b) <= w) return str; while (str.length > 3 && s.w(str + '…', h, b) > w) str = str.slice(0, -1); return str + '…'; }
  /* groups for the DWG: 'frame' (border and zones, a block per sheet size) and 'title' (title block, a block whose variable fields are attributes) */
  function frame(pg, meta, no, total, title, W, H) {
    var s = new Sym(pg), grp = pg.group ? function (n, b) { pg.group(n, b); } : function () {}; if (meta.titles) meta.titles.push(title);
    grp('frame');
    pg.rect(5, 5, W - 10, H - 10, { c: INK, w: 0.35 }); pg.rect(10, 10, W - 20, H - 20, { c: INK, w: 0.7 });
    var nc = Math.max(4, Math.round((W - 20) / 50)), zw = (W - 20) / nc, nr = Math.max(4, Math.round((H - 20) / 50)), zh = (H - 20) / nr, LET = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    for (var i = 0; i < nc; i++) { var zx = 10 + i * zw; if (i) { s.ln(zx, 5, zx, 10, 0.25); s.ln(zx, H - 10, zx, H - 5, 0.25); } s.t(zx + zw / 2, 8.4, String(i + 1), H3, { a: 'c' }); s.t(zx + zw / 2, H - 6.6, String(i + 1), H3, { a: 'c' }); }
    for (var j = 0; j < nr; j++) { var zy = 10 + j * zh; if (j) { s.ln(5, zy, 10, zy, 0.25); s.ln(W - 10, zy, W - 5, zy, 0.25); } s.t(7.5, zy + zh / 2, LET.charAt(j), H3, { a: 'c', v: 'm' }); s.t(W - 7.5, zy + zh / 2, LET.charAt(j), H3, { a: 'c', v: 'm' }); }
    var X = W - 10 - 180, Y = H - 10 - 56, Wt = 180;
    grp('title', [X + Wt, Y + 56]);
    pg.rect(X, Y, Wt, 56, { c: INK, w: 0.7, fill: PAPER });
    [9, 19, 32, 44].forEach(function (d) { s.ln(X, Y + d, X + Wt, Y + d, 0.3); });
    s.ln(X + 118, Y + 44, X + 118, Y + 56, 0.3); s.ln(X + 146, Y + 44, X + 146, Y + 56, 0.3);
    s.t(X + 2.5, Y + 6.2, 'PT CCEPC INDONESIA', H2, { b: true }); s.t(X + Wt - 2.5, Y + 6.2, T('Data Center Project Assessment', '数据中心项目评估'), H3, { a: 'r' });
    s.t(X + 2.5, Y + 12.6, T('PROJECT', '项目'), H3); s.t(X + 25, Y + 16.4, fit(s, meta.project, H2, Wt - 28, true), H2, { b: true, tag: 'PROJECT', prompt: 'Project' });
    var tl = s.wrap(title, H3, Wt - 28, true);
    s.t(X + 2.5, Y + 22.6, T('TITLE', '图名'), H3);
    [tl[0], tl[1], tl.slice(2).join(' ')].forEach(function (l, i) { s.t(X + 25, Y + 23.4 + i * LH, l || '', H3, { b: true, tag: 'TITLE' + (i + 1), prompt: 'Title, line ' + (i + 1) }); });
    s.t(X + 2.5, Y + 36.2, fit(s, meta.basis, H3, Wt - 5), H3, { tag: 'BASIS', prompt: 'Design basis' }); s.t(X + 2.5, Y + 41.2, T('Status: FOR PLANNING — NOT FOR CONSTRUCTION', '状态：规划用图——不得用于施工'), H3, { b: true, tag: 'STATUS', prompt: 'Status' });
    s.t(X + 2.5, Y + 48, T('DWG No.', '图号'), H3); s.t(X + 2.5, Y + 53.6, meta.dwg + '-' + ('0' + no).slice(-2) + '  |  ' + meta.date + (meta.rev ? '  |  KB Rev. ' + meta.rev : ''), H3, { b: true, tag: 'DWG_NO', prompt: 'Drawing number | date | revision' });
    s.t(X + 120.5, Y + 48, T('SCALE', '比例'), H3); s.t(X + 120.5, Y + 53.6, 'NTS', H2, { b: true, tag: 'SCALE', prompt: 'Scale' });
    s.t(X + 148.5, Y + 48, T('SHEET', '张次'), H3); s.t(X + 148.5, Y + 53.6, no + ' / ' + total, H2, { b: true, tag: 'SHEET', prompt: 'Sheet' });
    grp(null);
    return s;
  }
  function notes(s, items, x, y, w) {
    s.t(x, y, T('NOTES', '说明'), H2, { b: true });
    var yy = y + 6;
    items.forEach(function (it, i) { var n = s.para(x + 5, yy, T(it[0], it[1]), H3, w - 5); s.t(x, yy, (i + 1) + '.', H3); yy += n * LH + 1.2; });
    return yy;
  }
  var LEG = [
    [function (s, X, Y) { s.sw(X, Y - 4.5, 'cb', 9); }, 'Circuit breaker', '断路器'],
    [function (s, X, Y) { s.sw(X, Y - 4.5, 'ds', 9); }, 'Disconnector', '隔离开关'],
    [function (s, X, Y) { s.sw(X, Y - 6, 'wcb', 6); }, 'Withdrawable breaker', '手车式断路器'],
    [function (s, X, Y) { s.es(X - 7, Y + 1, 1); }, 'Earthing switch', '接地开关'],
    [function (s, X, Y) { s.ln(X, Y - 4, X, Y + 4); s.ct(X, Y - 3, 2); }, 'Current transformer', '电流互感器'],
    [function (s, X, Y) { s.vt(X - 6, Y, 1); }, 'Voltage transformer', '电压互感器'],
    [function (s, X, Y) { s.ln(X, Y - 5, X, Y - 3.5); s.pg.rect(X - 1.7, Y - 3.5, 3.4, 7, { c: INK, w: 0.3 }); s.ln(X, Y - 2.6, X, Y + 1.6, 0.3); s.pg.poly([[X - 0.9, Y + 0.7], [X, Y + 2.3], [X + 0.9, Y + 0.7]], { c: INK, w: 0.2, fill: INK, close: true }); s.ln(X, Y + 3.5, X, Y + 5); }, 'Surge arrester', '避雷器'],
    [function (s, X, Y) { s.ln(X, Y - 4, X, Y - 1.8); s.term(X, Y - 1.8); s.ln(X, Y + 1.8, X, Y + 4); }, 'Cable termination', '电缆终端'],
    [function (s, X, Y) { s.tr2(X, Y - 4.3, 'D', 'Y', false, 2.6); }, 'Transformer', '变压器'],
    [function (s, X, Y) { s.pg.circle(X, Y, 2.8, { c: INK, w: 0.3 }); s.wind(X, Y, 'Z', 2.8); }, 'Earthing transformer', '接地变压器'],
    [function (s, X, Y) { s.res(X, Y - 4); }, 'Neutral earthing resistor', '中性点接地电阻'],
    [function (s, X, Y) { s.ln(X, Y - 5, X, Y - 4.2); s.coil(X, Y - 4.2); s.ln(X, Y + 4.2, X, Y + 5); }, 'Line trap', '阻波器'],
    [function (s, X, Y) { s.fuse(X, Y - 3.5); }, 'Fuse', '熔断器'],
    [function (s, X, Y) { s.gen(X, Y - 4, 4); }, 'Generator', '发电机'],
    [function (s, X, Y) { s.mot(X, Y - 4, 4); }, 'Motor', '电动机'],
    [function (s, X, Y) { s.cap(X, Y - 3.5); }, 'Capacitor bank', '电容器组'],
    [function (s, X, Y) { s.bat(X, Y - 1.6); }, 'Battery', '蓄电池'],
    [function (s, X, Y) { s.pg.rect(X - 5, Y - 3, 10, 6, { c: INK, w: 0.3 }); s.ln(X - 5, Y + 3, X + 5, Y - 3, 0.25); }, 'UPS (rectifier / inverter)', 'UPS（整流/逆变）'],
    [function (s, X, Y) { s.pg.rect(X - 4, Y - 2.8, 8, 5.6, { c: INK, w: 0.3 }); s.t(X, Y + 1, '51', H3, { a: 'c' }); }, 'Relay, IEEE C37.2 device no.', '保护继电器（IEEE C37.2编号）'],
    [function (s, X, Y) { s.ln(X - 4, Y, X + 4, Y, 1.2); s.vline(X, Y - 4.5, Y + 4.5, [Y]); }, 'Crossing, not connected', '交叉不连接'],
    [function (s, X, Y) { s.ln(X - 5, Y, X + 5, Y, 0.35, DASH); }, 'Typical connection', '典型连接'],
    [function (s, X, Y) { s.cbH(X - 6, Y, true); }, 'Normally open (N.O.)', '常开（N.O.）']];
  function legend(s, x, y, cols, cw) {
    s.t(x, y, T('LEGEND (IEC 60617)', '图例（IEC 60617）'), H2, { b: true });
    LEG.forEach(function (it, i) { var col = i % cols, row = Math.floor(i / cols), X = x + 6 + col * cw, Y = y + 10 + row * 12; it[0](s, X, Y); s.t(X + 9, Y + 1, fit(s, T(it[1], it[2]), H3, cw - 11), H3); });
  }
  function schedBox(s, x, y, w, title, rows, draw) {
    var wl = Math.min(w * 0.4, Math.max(26, Math.max.apply(null, rows.map(function (r) { return s.w(r[0], H3, true); })) + 3)), yy = y + 7;
    if (draw !== false) { s.pg.rect(x, y, w, 7, { c: INK, w: 0.4 }); s.t(x + 2, y + 4.9, fit(s, title, H3, w - 4, true), H3, { b: true }); }
    rows.forEach(function (r) {
      var lv = s.wrap(r[1], H3, w - wl - 4), ll = s.wrap(r[0], H3, wl - 3, true), n = Math.max(lv.length, ll.length), h = n * LH + 2.2;
      if (draw !== false) { ll.forEach(function (l, i) { s.t(x + 2, yy + 3.9 + i * LH, l, H3, { b: true }); }); lv.forEach(function (l, i) { s.t(x + wl + 1.5, yy + 3.9 + i * LH, l, H3); }); s.ln(x, yy + h, x + w, yy + h, 0.2); }
      yy += h;
    });
    if (draw !== false) { s.ln(x + wl, y + 7, x + wl, yy, 0.2); s.pg.rect(x, y, w, yy - y, { c: INK, w: 0.4 }); }
    return yy;
  }
  function drawRoutes(s, list) {
    var Hs = [];
    list.forEach(function (r) { for (var i = 1; i < r.length; i++) if (Math.abs(r[i][1] - r[i - 1][1]) < 0.01) Hs.push([Math.min(r[i][0], r[i - 1][0]), Math.max(r[i][0], r[i - 1][0]), r[i][1], r]); });
    list.forEach(function (r) {
      for (var i = 1; i < r.length; i++) {
        var a = r[i - 1], b = r[i];
        if (Math.abs(a[0] - b[0]) < 0.01) {
          var x = a[0], y0 = Math.min(a[1], b[1]), y1 = Math.max(a[1], b[1]);
          s.vline(x, y0, y1, Hs.filter(function (h) { return h[3] !== r && h[2] > y0 + 2.5 && h[2] < y1 - 2.5 && h[0] < x - 0.5 && h[1] > x + 0.5; }).map(function (h) { return h[2]; }), 0.35, DASH);
        } else s.ln(a[0], a[1], b[0], b[1], 0.35, DASH);
      }
    });
  }

  /* ------------------------------------------------------------------ design data and component ratings */
  function design(x, meta) {
    var R = x.R, p = x.p, el = R.el, hv = el.hv;
    return { R: R, p: p, el: el, hv: hv, gi: R.gimp || {}, meta: meta, kv: hv.kv, ehv: !!hv.ibt, ht: hv.ht, mv: hv.mv, lvV: el.lvV || 400, dbl: /Double busbar/.test(hv.scheme[0]), gd: E.gpuDist(R) };
  }
  var INS = { 24: 'LI 125 / AC 50 kV', 72.5: 'LI 325 / AC 140 kV', 170: 'LI 750 / AC 325 kV', 245: 'LI 1,050 / AC 460 kV', 300: 'LI 1,050 / SI 850 kV', 550: 'LI 1,550 / SI 1,175 kV' };
  function saOf(kv) { return kv >= 500 ? 'Ur 420–444 kV, In 20 kA' : (kv >= 275 ? 'Ur ≈ 240 kV, In 20 kA' : (kv >= 230 ? 'Ur ≈ 192 kV, In 10 kA' : (kv >= 150 ? 'Ur 150 kV, In 10 kA, Ures ≤ 416 kV' : (kv >= 70 ? 'Ur ≈ 60 kV, In 10 kA' : 'Ur 24 kV, In 10 kA')))); }
  function lvKV(v) { return String(v / 1000).replace(/0+$/, ''); }
  var NAME = { tx: ['MV/LV TX', '中/低压变'], gen: ['generator', '发电机'], ch: ['20/6.6 kV TX', '冷机变'], bess: ['BESS', '储能'], st: ['station TX', '站用变'], cap: ['capacitor', '电容器'], sp: ['spare', '备用'], db: ['building board', '楼宇开关柜'] };
  var CODE = { tx: 'TX', gen: 'G', ch: 'CT', bess: 'BS', st: 'ST', cap: 'C', sp: 'SP', db: 'DB' };
  var PROT = { tx: ['50/51, 50N/51N, temperature trip', '50/51、50N/51N、温度跳闸'], db: ['50/51, 50N/51N, 67', '50/51、50N/51N、67'], ch: ['50/51, 50N/51N, 87T ≥ 5 MVA', '50/51、50N/51N、≥5 MVA时87T'], gen: ['87G, 51V, 32, 40, 46, 27/59, 81, 25', '87G、51V、32、40、46、27/59、81、25'],
    st: ['50/51, 50N/51N', '50/51、50N/51N'], cap: ['50/51, 59, 27, 60 unbalance', '50/51、59、27、60不平衡'], bess: ['50/51, 67, 27/59, 81', '50/51、67、27/59、81'], sp: ['as a transformer feeder', '同变压器馈线'] };
  var UNIT = { 'no.': '台', panels: '面', bays: '间隔', banks: '组', sets: '套', lot: '项', set: '套', m: '米', km: '公里', systems: '套', tanks: '座', runs: '条', containers: '个', 'line-ups': '组' };
  function isSVG(f) { return f.k === 'cap' && f.l2 === 'SVG'; }
  function nameOf(f) { return isSVG(f) ? 'SVG' : T(NAME[f.k][0], NAME[f.k][1]); }
  function rating(f) { return f.k === 'db' ? F(f.a) + ' A' : (f.k === 'sp' ? '' : f.l1); }
  /* feeders of the shared 20 kV plan (DCEngine.mvPlan) on the sections; building boards: bus A and bus B from two different HV/MV transformers, the
     partners spread over all the others so that one transformer outage is shared by them (N-1) */
  function feederPlan(d) {
    var mp = E.mvPlan(d.R), nS = d.mv.boards, ht = d.ht, per = ht ? ht.sec : 1, nT = ht ? ht.total : 1, secs = [], rr = 0, capI = 0;
    for (var i = 0; i < nS; i++) secs.push({ i: i, groups: {}, n: 0 });
    function put(f, sx) { var sg = secs[sx].groups, key = f.k + '|' + f.l1 + '|' + f.l2; if (!sg[key]) sg[key] = { f: f, n: 0 }; sg[key].n++; secs[sx].n++; }
    mp.feeders.forEach(function (f) {
      var ci = f.k === 'cap' ? capI++ : 0;
      for (var q = 0; q < f.n; q++) {
        if (f.k === 'cap') put(f, Math.min(nS - 1, q * per + (per > 1 ? ci % per : 0)));
        else if (f.k === 'st') put(f, q ? Math.min(nS - 1, per) : 0);
        else if (f.k === 'db') { var m = Math.floor(q / 2), a = m % nS; put(f, q % 2 ? (nT > 1 ? (a + per * (1 + Math.floor(m / nS) % (nT - 1))) % nS : (a + 1) % nS) : a); }
        else { put(f, rr % nS); rr++; }
      }
    });
    var order = ['db', 'tx', 'gen', 'ch', 'bess', 'st', 'cap', 'sp'];
    secs.forEach(function (sc) { sc.groups = Object.keys(sc.groups).map(function (k) { return sc.groups[k]; }).sort(function (p, q) { return order.indexOf(p.f.k) - order.indexOf(q.f.k); }); });
    return { mp: mp, secs: secs };
  }
  function secItems(fp, indiv) {
    var cnt = {};
    return fp.secs.map(function (sc) {
      var items = [];
      sc.groups.forEach(function (gp) {
        var f = gp.f, cd = CODE[f.k];
        if (indiv) for (var q = 0; q < gp.n; q++) { cnt[cd] = (cnt[cd] || 0) + 1; items.push({ f: f, lab: [cd + cnt[cd], rating(f), nameOf(f)] }); }
        else items.push({ f: f, lab: [gp.n + ' ×', nameOf(f), rating(f)] });
      });
      return items;
    });
  }
  function hvRatings(d) {
    var hv = d.hv, ht = d.ht, ehv = d.ehv, kvH = ehv ? 150 : hv.kv;
    var ikH = ehv ? pickN([40, 50, 63], 1.25 * d.mv.ssc150 / (1.732 * 150)) : hv.ik, iIn = ehv ? hv.ibt.mva * 1000 / (1.732 * 150) : hv.bays.iLine;
    var lineA = ehv ? pickN(IR, 1.2 * iIn) : hv.bays.lineA, busA = ehv ? Math.max(lineA, pickN([2000, 2500, 3150, 4000, 5000], (hv.sect ? 0.9 : 1.2) * d.el.mva * 1000 / (1.732 * 150))) : hv.busA;
    var iT = ht.mva * 1000 / (1.732 * kvH), txA = ehv ? Math.max(2000, pickN(IR, 1.2 * iT)) : hv.bays.txA;
    return { kv: kvH, ik: ikH, lineA: lineA, busA: busA, txA: txA, lineCT: ehv ? pickN(CTP, 1.1 * iIn) + '/1 A' : hv.bays.lineCT, txCT: ehv ? pickN(CTP, 1.2 * iT) + '/1 A' : hv.bays.txCT, ur: ehv ? 170 : hv.ur };
  }
  function blk(el) { var b = el.txBlk || { b: 1, per: el.txTotal }; return el.txArch === '2N' ? T(b.b + ' A/B pairs (2N)', b.b + '对A/B（2N）') : (el.txArch === 'DR' ? T(b.b + ' groups of three (3N/2)', b.b + '组每组3台（3N/2）') : (el.txR ? T(b.b + ' blocks × (' + (b.per - 1) + ' duty + 1 reserve)', b.b + '个模块×（' + (b.per - 1) + '用1备）') : T('no reserve (N)', '无备用（N）'))); }

  /* ================================================================== layout of sheet 1 */
  var FB = { db: 33, bess: 33, gen: 36, cap: 38, tx: 38.7, ch: 38.7, st: 38.7, sp: 30 };
  function plan(d, indiv) {
    var el = d.el, hv = d.hv, ht = d.ht, db = el.mvdb, P = { hvOn: d.kv > 20, ehv: d.ehv, dbl: d.ehv || d.dbl }, fp = feederPlan(d), items = secItems(fp, indiv);
    var split = !!(ht && ht.split), nIBT = d.ehv ? hv.ibt.total : 0;
    P.fp = fp; P.mp = fp.mp; P.indiv = indiv; P.hvR = P.hvOn ? hvRatings(d) : null;
    P.typ = !!(ht && ht.total > 3);
    var shown = []; fp.secs.forEach(function (sc, k) { if (!P.typ || Math.floor(k / ht.sec) < 2) shown.push(k); });
    P.E0 = 42; P.yA = P.E0 + 50; P.yB = P.yA + 120; P.yTe = P.yB + 19;
    P.Hb = d.ehv ? P.yTe + 18.2 + 14 : 42; P.yb1 = P.Hb + 82; P.yb2 = P.yb1 + (P.dbl ? 10 : 0);
    P.yt = P.yb2 + 50; P.ly = P.yt + (split ? 18.15 : 18.975); P.yd = P.ly + 28;
    P.Mtop = P.hvOn ? P.yd + 6 : 56; P.y20 = P.Mtop + 30; P.Mbot = P.y20 + 58; P.D0 = P.Mbot + 32; P.yBb = P.D0 + 36;
    var x = X0 + 4; P.secs = [];
    shown.forEach(function (k) {
      var ni = ht ? 1 : Math.max(1, Math.floor(hv.circ / fp.secs.length) + (k < hv.circ % fp.secs.length ? 1 : 0)), it = items[k];
      var sc = { k: k, ni: ni, items: it, X: x, inc: [] };
      for (var q = 0; q < ni; q++) sc.inc.push(x + 9 + 22 * q);
      sc.xv = sc.inc[ni - 1] + 13; sc.fx = it.map(function (o, j) { return sc.xv + 20 + FS * j; });
      sc.w = (it.length ? sc.fx[it.length - 1] + 9 : sc.xv + 18) - x;
      P.secs.push(sc); x += sc.w + SEC_GAP;
    });
    P.mvR = x - SEC_GAP;
    P.tr = [];
    if (ht) for (var j = 0; j < ht.total; j++) {
      var ks = [], lead;
      for (var k = j * ht.sec; k < (j + 1) * ht.sec; k++) ks.push(k);
      var ss = P.secs.filter(function (q) { return ks.indexOf(q.k) >= 0; }), xt, prev = P.tr[P.tr.length - 1];
      if (ss.length) { var xs = ss.map(function (q) { return q.inc[0]; }); xt = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2; }
      else xt = prev.typ ? prev.x + 58 : Math.max(prev.x + 58, P.mvR + 40);
      var h1 = Math.ceil(ks.length / 2);
      lead = split ? [{ x: xt - 4.5, ks: ks.slice(0, h1), dir: -1 }, { x: xt + 4.5, ks: ks.slice(h1), dir: 1 }] : [{ x: xt, ks: ks, dir: -1 }];
      P.tr.push({ x: xt, ks: ks, leads: lead, typ: !ss.length });
    }
    if (P.hvOn) {
      var xtr = P.tr.map(function (q) { return q.x; }), xl = xtr[xtr.length - 1], nIn = d.ehv ? nIBT : hv.circ;
      P.coup = P.dbl ? xl + 44 : null; P.hvt = P.dbl ? [xl + 72, xl + 100] : [xl + 44];
      if (!d.ehv) {
        var gaps = []; for (var j2 = 0; j2 + 1 < xtr.length; j2++) if (xtr[j2 + 1] - xtr[j2] >= 56) gaps.push((xtr[j2] + xtr[j2 + 1]) / 2);
        var ins = [];
        if (gaps.length >= nIn) for (var i2 = 0; i2 < nIn; i2++) ins.push(gaps[Math.min(gaps.length - 1, Math.round((i2 + 0.5) * gaps.length / nIn - 0.5))]);
        else { ins = gaps.slice(); for (var m = 1; ins.length < nIn; m++) ins.unshift(xtr[0] - 46 * m); }
        P.hin = ins;
      } else {
        var nL = hv.bays.lineBays || hv.circ, nD = Math.max(hv.bays.diam || 0, Math.ceil((nL + nIBT) / 2)), Ls = [], Ts = [], pr = [];
        for (var a = 1; a <= nL; a++) Ls.push(['L', a]); for (var b2 = 1; b2 <= nIBT; b2++) Ts.push(['T', b2]);
        for (var k3 = 0; k3 < nD; k3++) { var up = null, lo = null, lft = nD - k3 - 1;
          if (Ls.length && Ts.length) { up = Ls.shift(); lo = Ts.shift(); } else if (Ls.length) { up = Ls.shift(); if (Ls.length > lft) lo = Ls.shift(); } else if (Ts.length) { lo = Ts.shift(); if (Ts.length > lft) up = Ts.shift(); }
          pr.push([up, lo]); }
        var off = 34, off2 = 66, others = xtr.concat(P.hvt, P.coup !== null ? [P.coup] : []), x0 = Math.min.apply(null, xtr) - 20, sp0 = 104;
        /* two interbus transformers on one diameter stand 64 mm apart so that their ratings stay legible; the next diameter moves accordingly */
        var dia = function (shift) { var xx = x0 + shift; return pr.map(function (q) {
          var e = [], both = q[0] && q[1] && q[0][0] === 'T' && q[1][0] === 'T', mx = off2;
          [[q[0], 0], [q[1], 1]].forEach(function (tt) { var f = tt[0]; if (!f) return; var exUp = f[0] === 'L', dx = both ? (tt[1] ? off : off + 64) : ((exUp && tt[1]) || (!exUp && !tt[1]) ? off2 : off); mx = Math.max(mx, dx); e.push({ f: f, lower: tt[1], tx: xx + dx, lead: xx + dx - 4.5 }); });
          var r = { x: xx, pr: q, ex: e, mx: mx }; xx += Math.max(sp0, mx + 38); return r; }); };
        var clash = function (Dx) { return Dx.some(function (q) { return q.ex.some(function (e) { return e.f[0] === 'T' && others.some(function (o) { return Math.abs(o - e.lead) < 14; }); }); }); };
        var shift = 0, D = dia(0);
        for (var itn = 0; itn < 20 && clash(D); itn++) { shift += 8; D = dia(shift); }
        P.dia = D; P.off = off; P.off2 = off2;
        var leads = []; D.forEach(function (q) { q.ex.forEach(function (e) { if (e.f[0] === 'T') leads.push({ n: e.f[1], x: e.lead }); }); });
        leads.sort(function (u, v) { return u.n - v.n; }); P.hin = leads.map(function (l) { return l.x; });
        P.eV = Math.max.apply(null, D.map(function (q) { return q.x + q.mx; })) + 44; P.eR = P.eV + 16;
        P.eL = Math.min(D[0].x, Math.min.apply(null, P.hin)) - Math.max(30, TW(hv.kv + ' kV ' + T('BUS A', 'A母线'), H2, true) + 8);
      }
      P.hbL = Math.min.apply(null, P.hin.concat(xtr)) - Math.max(30, TW(P.hvR.kv + ' kV ' + T(P.dbl ? 'BUS II' : 'BUS', P.dbl ? 'II母' : '母线'), H2, true) + 8);
      P.hbR = Math.max.apply(null, P.hvt.concat([xl], P.hin)) + 20;
      /* sectionalised double busbar (≥ 8 bays): two bus-section breakers, a coupler and two bus VTs per half */
      P.sect = !!hv.sect && P.dbl; P.hvt2 = []; P.coup2 = null;
      if (P.sect) {
        var xb = P.hin.concat(xtr, P.hvt, [P.coup]).sort(function (a0, b0) { return a0 - b0; }), midB = (P.hbL + P.hbR) / 2, xs0 = null;
        for (var g1 = 0; g1 + 1 < xb.length; g1++) if (xb[g1 + 1] - xb[g1] >= 30) { var cx0 = (xb[g1] + xb[g1 + 1]) / 2; if (xs0 === null || Math.abs(cx0 - midB) < Math.abs(xs0 - midB)) xs0 = cx0; }
        if (xs0 === null) P.sect = false; else {
          P.xsec = xs0;
          var below = xtr.filter(function (q) { return q < xs0 - 16; }), wid = 0;
          for (var g2 = 0; g2 + 1 < below.length; g2++) { var gw = below[g2 + 1] - below[g2]; if (gw >= (g2 === 0 ? 96 : 60) && gw > wid) { wid = gw; P.coup2 = g2 === 0 ? below[g2] + 44 : (below[g2] + below[g2 + 1]) / 2; } }
          if (P.coup2 === null && below.length) { var gLast = xs0 - below[below.length - 1]; if (gLast >= (below.length === 1 ? 72 : 44)) P.coup2 = below[below.length - 1] + (below.length === 1 ? 44 : gLast / 2); }
          var above = [P.hbL + 34].concat(P.hin.filter(function (q) { return q < xs0 - 10; }).sort(function (a0, b0) { return a0 - b0; }), [xs0 - 14]), wv = 0;
          for (var g3 = 0; g3 + 1 < above.length; g3++) { var lo0 = above[g3] + (g3 === 1 ? 44 : 0), gv = above[g3 + 1] - lo0; if (gv >= 72 && gv > wv) { wv = gv; var cv0 = (lo0 + above[g3 + 1]) / 2; P.hvt2 = [cv0 - 14, cv0 + 14]; } }
        }
      }
      var left = Math.min(P.hbL, P.eL !== undefined ? P.eL : P.hbL);
      if (left < X0) shiftAll(P, X0 - left);
    }
    if (db) { var tA = Math.ceil(db.txPer / 2), gA = Math.ceil(db.genPer / 2), nA = tA + gA + 1, nB = (db.txPer - tA) + (db.genPer - gA) + 1;
      P.bA = { x: X0, inX: X0 + 7, n: nA, t: tA, g: gA }; P.bA.X1 = X0 + 42 + (nA - 1) * FS;
      P.bB = { x: P.bA.X1 + 26, n: nB, t: db.txPer - tA, g: db.genPer - gA }; P.bB.inX = P.bB.x + 7; P.bB.X1 = P.bB.x + 42 + (nB - 1) * FS;
      P.bR = P.bB.X1 + 8; P.bTX1 = tA ? X0 + 42 + gA * FS : null; }
    var ncol = el.txArch === '2N' ? 2 : 3;
    P.lvX0 = db ? P.bR + 66 : X0; P.lvC = []; for (var c3 = 0; c3 < ncol; c3++) P.lvC.push(P.lvX0 + 58 + c3 * 140); P.lvR = P.lvC[ncol - 1] + 62;
    if (el.chTx) { var me = d.R.me, nch = Math.max(1, Math.round(((me.chN || 0) + (me.chR || 0)) / Math.max(1, el.chTx.total))); P.ch = { x: P.lvR + 30, n: Math.min(nch, 6), all: nch }; P.chR = P.ch.x + 26 + P.ch.n * FS + 4; }
    P.cw = Math.max.apply(null, [P.mvR, P.hbR || 0, P.eR || 0, P.lvR, P.bR || 0, P.chR || 0].concat(P.tr.map(function (t) { return t.x + (t.typ ? 28 : 46); })));
    P.Dbot = P.D0 + Math.max(124, db ? 104 : 0, P.ch ? 96 : 0);
    P.routes = routeList(d, P);
    return P;
  }
  function shiftAll(P, dx) {
    P.secs.forEach(function (sc) { sc.X += dx; sc.inc = sc.inc.map(function (v) { return v + dx; }); sc.xv += dx; sc.fx = sc.fx.map(function (v) { return v + dx; }); });
    P.mvR += dx; P.tr.forEach(function (t) { t.x += dx; t.leads.forEach(function (l) { l.x += dx; }); });
    if (P.hin) P.hin = P.hin.map(function (v) { return v + dx; }); if (P.coup !== null && P.coup !== undefined) P.coup += dx; if (P.coup2 !== null && P.coup2 !== undefined) P.coup2 += dx; if (P.hvt) P.hvt = P.hvt.map(function (v) { return v + dx; }); if (P.hvt2) P.hvt2 = P.hvt2.map(function (v) { return v + dx; });
    if (P.dia) P.dia.forEach(function (q) { q.x += dx; q.ex.forEach(function (e) { e.tx += dx; e.lead += dx; }); });
    ['hbL', 'hbR', 'eL', 'eR', 'eV', 'xsec'].forEach(function (k) { if (P[k] !== undefined) P[k] += dx; });
  }
  function routeList(d, P) {
    var R = [], lv = 0, db = d.el.mvdb, nS = d.mv.boards;
    function itemX(kind, k) { var sc = P.secs.filter(function (q) { return q.k === k; })[0]; if (!sc) return null; for (var j = 0; j < sc.items.length; j++) if (sc.items[j].f.k === kind) return sc.fx[j]; return null; }
    function first(kind) { for (var k = 0; k < nS; k++) { var x = itemX(kind, k); if (x !== null) return x; } return null; }
    function add(kind, x, tx) { if (x === null) return; var y = P.Mbot + 5 + 4 * (lv++); R.push([[x, P.y20 + FB[kind]], [x, y], [tx, y], [tx, P.D0 - 0.4]]); }
    if (db) {
      add('db', itemX('db', 0), P.bA.inX);
      add('db', itemX('db', d.ht ? (d.ht.total > 1 ? d.ht.sec % nS : 0) : 1 % nS), P.bB.inX);
      if (P.bTX1) R.push([[P.bTX1, P.yBb + FB.tx], [P.bTX1, P.yBb + 64], [P.lvX0 - 12, P.yBb + 64], [P.lvX0 - 12, P.D0 - 2], [P.lvC[0], P.D0 - 2], [P.lvC[0], P.D0 - 0.4]]);
    } else add('tx', first('tx'), P.lvC[0]);
    if (P.ch) add('ch', first('ch'), P.ch.x);
    return R;
  }
  function schedules(d, P) {
    var el = d.el, hv = d.hv, ht = d.ht, mv = d.mv, gi = d.gi, mp = P.mp, db = el.mvdb, out = [], lv = el.lv, R = P.hvR || {};
    if (P.hvOn) {
      out.push([T('PLN connection and GIS', 'PLN接入及GIS'), (hv.ibt ? [[hv.kv + ' kV GIS', T('breaker-and-a-half, ' + (hv.bays.diam || '') + ' diameters, ' + F(hv.busA) + ' A, ' + hv.ik + ' kA 1 s, ' + (INS[hv.ur] || ''), '一个半断路器，' + (hv.bays.diam || '') + '串，' + F(hv.busA) + ' A，' + hv.ik + ' kA 1 s，' + (INS[hv.ur] || ''))],
          [T(hv.kv + ' kV CT / VT', hv.kv + ' kV互感器'), T('5 cores TPY / TPX / 5P20 / 0.2S per breaker; CVT 0.2 / 3P', '每台断路器5绕组TPY/TPX/5P20/0.2S；CVT 0.2/3P')],
          [T('Interbus transformers', '联络变压器'), hv.ibt.total + ' × ' + F(hv.ibt.mva) + ' MVA ' + hv.ibt.ratio + T(' + Δ tertiary, uk ≈ ', ' + 三角形第三绕组，uk约') + hv.ibt.uk + ' %']] : [[T('PLN lines', 'PLN线路'), hv.name + ', ' + hv.circ + T(' circuits (N-1)', '回（N-1）') + (hv.hvCable ? ', ' + hv.hvCable : '')]])
        .concat(hv.ugc ? [[T('150 kV link', '150 kV联络'), T(hv.ugc.routes + ' cable routes, one energised and one standby; ' + hv.ugc.circ + ' circuit(s) per route, ' + hv.ugc.perPhase + ' × Cu ' + F(hv.ugc.mm2) + ' mm² per phase; each route carries the whole demand', hv.ugc.routes + '条电缆路径，一用一备；每条' + hv.ugc.circ + '回，每相' + hv.ugc.perPhase + '×' + F(hv.ugc.mm2) + ' mm²铜缆；每条路径可带全部负荷')]] : [])
        .concat([[R.kv + ' kV GIS', 'Ur ' + R.ur + ' kV, ' + T(P.sect ? 'double busbar, 2 couplers + 2 bus sections (N.O.)' : (P.dbl ? 'double busbar + coupler' : 'single busbar'), P.sect ? '双母线，2台母联+2台分段（常开）' : (P.dbl ? '双母线+母联' : '单母线')) + ', ' + F(R.busA) + ' A, ' + R.ik + ' kA 1 s, ' + (INS[R.ur] || '')],
          [T('Incoming bays', '进线间隔'), F(R.lineA) + ' A; CT ' + R.lineCT + ' 5P40 / 5P40 / 0.2S + 5P40 / 5P40 / 0.5; VT 0.5 / 3P; ' + saOf(R.kv)],
          [T('Transformer bays', '主变间隔'), F(R.txA) + ' A; CT ' + R.txCT + ' 5P30 × 2 + 0.2S']])]);
      out.push([T('HV/MV transformers and 20 kV earthing', '主变及20 kV接地'), [[T('Transformers', '主变压器'), ht.total + ' × ' + F(ht.mva) + (ht.split ? ' MVA, ' : ' MVA ONAF (' + F(ht.onan) + ' ONAN), ') + ht.ratio + ', ' + ht.vg + ', uk ' + ht.uk + (ht.uk2 ? ' / ' + ht.uk2 : '') + ' %' + (ht.split ? T(', LV windings ' + ht.w1 + ' + ' + ht.w2 + ' MVA', '，低压绕组' + ht.w1 + '+' + ht.w2 + ' MVA') : '')],
        [T('Tap changer / neutral', '调压/中性点'), T('OLTC ± 8 × 1.25 %; HV neutral solidly earthed (PLN)', '有载调压±8×1.25%；高压中性点直接接地（PLN）')], [T('Loading (PLN N-1)', '负载率（PLN N-1）'), T('normal ', '正常') + F(ht.load) + ' %' + (ht.loadOut ? T(', one out ', '，一台退出') + F(ht.loadOut) + ' %' : '')],
        [T('20 kV earthing', '20 kV接地'), T('zig-zag earthing TR + NGR 40 Ω, 300 A, 10 s per LV winding (' + ht.total * ht.wind + ')', '每个低压绕组Z型接地变+40 Ω、300 A、10 s电阻（' + ht.total * ht.wind + '套）')], [mp.dyn ? T('SVG (dynamic)', 'SVG动态补偿') : T('Capacitors', '电容器'), gi.capPerTx ? gi.capSteps + T(' per transformer', '（每台主变）') : T('not required (PF ≥ 0.95)', '不需要（功率因数≥0.95）')]]]);
    } else out.push([T('PLN 20 kV supply', 'PLN 20 kV供电'), [[T('Supply', '电源'), hv.circ + T(' PLN 20 kV feeders, ', '路PLN 20 kV馈线，') + T(hv.scheme[0], hv.scheme[1])], [T('Metering', '计量'), T('PLN kWh metering per incomer, CT / VT 0.2S', '每路进线PLN计量，CT/VT 0.2S')], [T('Fault level', '短路电流'), F(hv.pccIk, 1) + ' kA → ' + mv.ik + ' kA']]]);
    out.push([T('20 kV feeder schedule', '20 kV馈线表'), [[T('Incomers', '进线') + ' (' + mp.incomers + ')', F(mv.busA) + ' A VCB; CT 5P20 / 5P20 / 0.5 / 0.2S; 50/51, 51N, 67, 27/59, 81']].concat(mp.feeders.map(function (f) { return [nameOf(f) + (f.k === 'cap' ? ' ' + f.l1 : '') + ' (' + f.n + ')', F(f.a) + ' A VCB' + (f.cable ? '; ' + f.cable : '') + '; ' + (isSVG(f) ? '50/51, 50N/51N, 27/59' : T(PROT[f.k][0], PROT[f.k][1]))]; }))]);
    out.push([T('20 kV switchgear and distribution', '20 kV开关柜及配电'), [[T('Switchgear', '开关柜'), 'Ur 24 kV, ' + INS[24] + ', LSC2B-PM, IAC AFLR ' + mv.ik + ' kA 1 s (IEC 62271-200)'], [T('Sections', '母线段'), mv.boards + ' × ' + F(mv.busA) + ' A, ' + mv.ik + ' kA 3 s' + (ht ? T('; calculated ', '；计算') + F(mv.ikCalc, 1) + ' kA' : '') + T('; feeders 1,250 A or 630 A', '；馈线1,250 A或630 A')],
      [T('Bus sections', '分段'), mp.ties + T(' bus-section breakers, normally open, interlocked: the incomers do not run in parallel', '台分段断路器，常开，联锁：进线不并列运行')],
      [T('Panels', '面数'), mp.panels + ' (' + mp.incomers + T(' incomers, ', '路进线，') + mp.nF + T(' feeders, ', '回馈线，') + mp.spares + T(' spares', '面备用') + ')'], [T('Building boards', '楼宇开关柜'), db ? db.n + ' × (' + db.txPer + ' TX' + (db.genPer ? ' + ' + db.genPer + ' G' : '') + '), ' + F(db.busA) + ' A, ' + db.panels + T(' panels each; bus A and bus B from different HV/MV transformers', '面/套；A、B段取自不同主变') : T('not needed (≤ 24 feeders per section)', '不需要（每段≤24回）')],
      [T('Cables', '电缆'), T('XLPE 12/20 kV Cu, sized for current and ' + F(mp.ikC, 1) + ' kA × 0.5 s (IEC 60502-2, IEC 60949); screen ≥ 25 mm²', '交联聚乙烯12/20 kV铜芯，按电流及' + F(mp.ikC, 1) + ' kA×0.5 s选型（IEC 60502-2、IEC 60949）；屏蔽≥25 mm²')]]]);
    var gd = d.gd, lt = function (o) { return F(o.it, o.it < 100 ? 1 : 0) + ' MW IT, ' + (gd.ai ? F(o.hd, o.hd < 10 ? 1 : 0) + T(' GPU racks, ', '个GPU机柜，') + F(o.gpus) + T(' GPUs', '颗GPU') : F(o.racks, o.racks < 10 ? 1 : 0) + T(' racks', '个机柜')); }, gr = [];
    if (gd.ht) gr.push([T('HV/MV transformer', '主变压器') + ' (' + ht.total + ')', lt(gd.ht)]);
    gr.push([T('20 kV section', '20 kV母线段') + ' (' + mv.boards + ')', lt(gd.sec) + ', ' + F(gd.secI) + ' A']);
    if (gd.board) gr.push([T('Building board', '楼宇开关柜') + ' (' + db.n + ')', lt(gd.board) + T('; ' + F(gd.iFn) + ' A per 1,250 A feeder, ' + F(gd.iF) + ' A on one feeder', '；每回1,250 A馈线' + F(gd.iFn) + ' A，单回' + F(gd.iF) + ' A')]);
    gr.push([T('MV/LV block', '中/低压模块') + ' (' + ((el.txBlk && el.txBlk.b) || 1) + ')', lt(gd.blk)]);
    if (gd.ai) { gr.push([T('GPU rack', 'GPU机柜'), T(gd.plat.en, gd.plat.zh) + ': ' + F(gd.rackKW) + T(' kW design, ', ' kW设计，') + gd.peakKW + T(' kW peak, ', ' kW峰值，') + gd.gpuPerRack + ' GPU']);
      gr.push([T('Coincident peak', '同步峰值'), T('MV/LV duty loading ' + F(gd.ldTx) + ' % normal, ' + F(gd.ldPk) + ' % with all GPUs at peak', '中/低压工作变压器负载率正常' + F(gd.ldTx) + '%，GPU全部峰值时' + F(gd.ldPk) + '%')]);
      gr.push([T('GPU load swing', 'GPU负荷波动'), F(gd.swing) + ' % = ' + F(gd.swingMW) + ' MW; ' + T('voltage step ', '电压阶跃') + F(gd.dv, 1) + ' %' + (gd.dyn ? T('; SVG on the 20 kV sections', '；20 kV母线段配SVG') : '')]); }
    out.push([T('From 20 kV to the ' + (gd.ai ? 'GPU racks' : 'racks'), '从20 kV到' + (gd.ai ? 'GPU机柜' : '机柜')), gr]);
    out.push([T('MV/LV blocks and critical power', '中/低压模块及关键供电'), [[T('MV/LV transformers', '中/低压变压器'), el.txTotal + ' × ' + F(el.txSize) + ' kVA 20/' + lvKV(d.lvV) + ' kV Dyn11, uk ' + lv.uk + ' %, ' + blk(el)],
      [T('LV system', '低压系统'), d.lvV + ' V (IEC 60038); ' + T('one main switchboard per transformer, ', '每台变压器一面总配电柜，') + F(lv.i) + ' A → ACB ' + F(lv.acb) + ' A, ' + F(lv.ik, 1) + ' → ' + lv.icw + ' kA (IEC 61439-2, IEC 60947-2)' + (lv.over ? ' ✗' : '')],
      [T('UPS / batteries', 'UPS/电池'), el.upsTotal + ' × ' + F(el.upsSize) + ' kW (' + el.upsLabel + '), ' + F(el.battKWh) + ' kWh'], [T('Generators', '发电机'), el.genTotal + ' × ' + F(el.genSize) + ' kWe (' + el.genLabel + '), ' + (el.genV === 'MV' ? '20 kV' : d.lvV + ' V')],
      [T('Earthing', '接地'), T('TN-S; transformer neutral earthed at the main switchboard', 'TN-S；变压器中性点在总配电柜接地')]]]);
    out.push([T('Design basis', '设计依据'), [[T('IT load / Tier', 'IT负载/等级'), F(d.R.cap.itMW, 2) + ' MW, Tier ' + d.p.tier], [T('Maximum demand', '最大需量'), F(el.mva, 1) + ' MVA, PF ' + F(gi.pfEst || 0.95, 2)], [T('Fault level at PCC', '接入点短路电流'), F(hv.pccIk, 1) + ' kA ' + T('(planning value)', '（规划值）')],
      [T('Standards', '标准'), 'IEC 62271, 60076, 61869, 60099-4, 60909, 61439, 60364, 60502-2; PLN Grid Code; SNI / PUIL 2011']]]);
    return out;
  }
  var SHEETS = [[594, 420, 'A2'], [841, 594, 'A1'], [1189, 841, 'A0']];
  function sheetFor(P) {
    var need = P.Dbot + 6 + 92;
    for (var i = 0; i < SHEETS.length; i++) if (P.cw + 16 <= SHEETS[i][0] && need <= SHEETS[i][1]) return { W: SHEETS[i][0], H: SHEETS[i][1], name: SHEETS[i][2] };
    return { W: Math.max(1189, Math.ceil((P.cw + 16) / 10) * 10), H: Math.max(841, Math.ceil(need / 10) * 10), name: '' };
  }

  /* ================================================================== bands of sheet 1 */
  function drawMargin(s, d, P) {
    var hv = d.hv, ht = d.ht, mv = d.mv;
    function block(y, head, lines) { var n = s.para(16, y, head, H2, 46, { b: true }), yy = y + (n - 1) * 4.9 + 5; lines.forEach(function (l) { if (!l) return; yy += s.para(16, yy, l, H3, 46) * LH; }); }
    if (d.ehv) {
      block(P.yA + 9, hv.kv + ' kV GIS', [T('breaker-and-a-half', '一个半断路器接线'), 'Ur ' + hv.ur + ' kV, ' + F(hv.busA) + ' A', hv.ik + ' kA 1 s', INS[hv.ur] || '']);
      block(P.yTe + 1, T('INTERBUS TRANSFORMERS', '联络变压器'), [hv.ibt.total + ' × ' + F(hv.ibt.mva) + ' MVA', hv.ibt.ratio + ', OLTC']);
    }
    if (P.hvOn) {
      var R = P.hvR;
      block(P.yb1 - 34, R.kv + ' kV GIS', [T(P.sect ? 'double busbar, sectionalised' : (P.dbl ? 'double busbar' : 'single busbar'), P.sect ? '双母线分段' : (P.dbl ? '双母线' : '单母线')), 'Ur ' + R.ur + ' kV, ' + F(R.busA) + ' A', R.ik + ' kA 1 s', INS[R.ur] || '']);
      block(P.yt + 1, T('HV/MV TRANSFORMERS', '主变压器'), [ht.total + ' × ' + F(ht.mva) + ' MVA (' + ht.lab + ')', ht.ratio + ', ' + ht.vg, T('20 kV: earthing TR + NGR', '20 kV：接地变+电阻')]);
    }
    block(P.y20 - 24, T('20 kV SWITCHGEAR', '20 kV开关柜'), [T('metal-clad, withdrawable', '金属铠装、手车式'), 'Ur 24 kV, ' + F(mv.busA) + ' A', mv.ik + ' kA 3 s, IAC AFLR', T(mv.boards + ' sections', mv.boards + '段') + (P.typ ? T(', S1–S' + P.secs.length + ' shown', '，图示S1–S' + P.secs.length) : ''), T('bus sections N.O., interlocked', '分段常开、联锁'), T('≈ ' + F(d.gd.sec.it, 1) + ' MW IT per section', '每段约' + F(d.gd.sec.it, 1) + ' MW IT'), P.indiv ? '' : T('feeders: quantity, type, rating', '馈线：数量、类型、额定')]);
    block(P.D0 + 2, T('TYPICAL DISTRIBUTION', '典型配电'), [T('one of each kind; the quantity is in each title', '每类一套；数量见各标题')]);
  }
  function drawEHV(s, d, P) {
    var hv = d.hv, ib = hv.ibt, yA = P.yA, yB = P.yB, L = 10;
    s.bus(P.eL, P.eR, yA); s.bus(P.eL, P.eR, yB);
    s.t(P.eL + 1, yA - 2.6, hv.kv + ' kV ' + T('BUS A', 'A母线'), H2, { b: true }); s.t(P.eL + 1, yB + 6, hv.kv + ' kV ' + T('BUS B', 'B母线'), H2, { b: true });
    var xV = P.eV;
    [[yA, 1, 'A'], [yB, -1, 'B']].forEach(function (b) { var yy = b[0], dr = b[1];
      s.dot(xV, yy); s.ln(xV, yy, xV, yy + 2 * dr); s.sw(xV, dr > 0 ? yy + 2 : yy - 12, 'ds', L); s.ln(xV, yy + 12 * dr, xV, yy + 20 * dr); s.es(xV, yy + 16 * dr, -1); s.vt(xV, yy + 20 * dr, 1, true);
      s.t(xV + 8.7, yy + (dr > 0 ? 30 : -26), T('Bus VT ' + b[2], b[2] + '母PT'), H3, { a: 'c', b: true }); });
    P.dia.forEach(function (q, k) {
      var x = q.x, y = yA + 1, tees = [], lab = ['A', 'AB', 'B'];
      s.dot(x, yA); s.ln(x, yA, x, y);
      s.t(x, P.E0 + 4, T('DIAMETER ' + (k + 1), '第' + (k + 1) + '串'), H2, { a: 'c', b: true });
      for (var i = 0; i < 3; i++) {
        s.sw(x, y, 'ds', L); y += L; y += s.ct(x, y, 3, 1.3); s.es(x, y, -1);
        s.sw(x, y, 'cb', L); s.t(x + 3.5, y + 6.3, 'CB ' + lab[i] + (k + 1), H3, { b: true }); if (k === 0 && i === 0) s.t(x + 3.5, y + 9.8, F(hv.busA) + ' A, ' + hv.ik + ' kA', H3);
        y += L; s.es(x, y, -1); s.sw(x, y, 'ds', L); y += L;
        if (i < 2) { tees.push(y); s.dot(x, y); }
      }
      s.ln(x, y, x, yB); s.dot(x, yB);
      if (k === 0) { var rw = s.relay(x - 32, yA + 36, '87B 50BF'); s.ln(x - 32 + rw, yA + 38.8, x - 1.4, yA + 38.8, 0.25, [1, 0.8]); }
      [[q.pr[0], tees[0]], [q.pr[1], tees[1]]].forEach(function (tt) {
        var f = tt[0], ty = tt[1];
        if (!f) { s.ln(x, ty, x + 9, ty); s.t(x + 10.5, ty + 1, T('SPARE', '备用'), H3, { b: true }); return; }
        var e = q.ex.filter(function (z) { return z.f === f; })[0], tx = e.tx;
        s.ln(x, ty, tx, ty);
        if (f[0] === 'L') {
          s.sw(tx, ty - L, 'ds', L); s.es(tx, ty - L - 1.5, 1);
          s.vline(tx, yA - 24, ty - L, [yA]); s.es(tx, yA - 7, 1); s.vt(tx, yA - 15, 1); s.sa(tx, yA - 24, -1);
          s.ln(tx, yA - 27, tx, yA - 24); s.coil(tx, yA - 35.4); s.ln(tx, yA - 35.4, tx, yA - 37.6); s.arrowUp(tx, yA - 41.2);
          s.t(tx + 3.5, yA - 38.6, T('Line ' + f[1] + ' — PLN', 'PLN线路' + f[1]), H2, { b: true });
          if (f[1] === 1) { var w1 = s.relay(tx + 16, yA - 31, '87L 21 79'); s.t(tx + 18 + w1, yA - 27.4, T('HSES, CVT, line trap', '快速接地、CVT、阻波器'), H3); }
        } else {
          s.sw(tx, ty, 'ds', L); s.es(tx, ty + L + 1.5, 1);
          var yT = P.yTe; s.vline(tx, ty + L, yB + 6, [yB]); s.sa(tx, yB + 4, -1); s.vt(tx, yB + 4, 1);
          s.ct(tx, yB + 6, 3, 1.3); s.ln(tx, yB + 15.1, tx, yT);
          s.tr3(tx, yT, 'Y', true, 'D');
          var lx = tx - 4.5, ly = yT + 18.15;
          s.ln(lx, ly, lx, ly + 3); s.sa(lx, ly + 2, -1, 8); s.term(lx, ly + 3); s.ln(lx, ly + 6.6, lx, P.Hb + 8.5); s.t(lx - 2.5, ly + 19.5, T('UGC 150 kV', '150 kV电缆'), H3, { a: 'r' });
          var rx = tx + 4.5; s.ln(rx, ly, rx, ly + 7); s.vt(rx, ly + 5, 1); s.t(rx + 2, ly + 12.5, T('Δ tertiary', '第三绕组'), H3);
          s.t(tx + 11.5, yT + 4, 'IBT-' + f[1], H2, { b: true }); s.t(tx + 11.5, yT + 8, F(ib.mva) + ' MVA', H3); s.t(tx + 11.5, yT + 11.6, ib.ratio, H3); s.t(tx + 11.5, yT + 15.2, 'uk ≈ ' + ib.uk + ' %, OLTC', H3);
          if (f[1] === 1) s.relay(tx + 15, yB + 8, '87T 64REF');
        }
      });
    });
  }
  function drawHV(s, d, P) {
    var ht = d.ht, ehv = d.ehv, Hb = P.Hb, dbl = P.dbl, yb1 = P.yb1, yb2 = P.yb2, R = P.hvR, LB = 10;
    function hBus(y) { if (!P.sect) { s.bus(P.hbL, P.hbR, y); return; } s.bus(P.hbL, P.xsec - 7, y); s.bus(P.xsec + 7, P.hbR, y); s.ln(P.xsec - 7, y, P.xsec - 6, y); s.cbH(P.xsec - 6, y, true); s.ln(P.xsec + 6, y, P.xsec + 7, y); }
    hBus(yb1); if (dbl) hBus(yb2);
    if (P.sect) { s.t(P.xsec, yb1 - 4.6, 'N.O.', H3, { a: 'c' }); s.t(P.xsec, yb2 + 5.5, T('Bus section', '分段'), H3, { a: 'c', b: true }); }
    s.t(P.hbL + 1, yb1 - 2.6, R.kv + ' kV ' + T(dbl ? 'BUS I' : 'BUS', dbl ? 'I母' : '母线'), H2, { b: true });
    if (dbl) s.t(P.hbL + 1, yb2 + 6, R.kv + ' kV ' + T('BUS II', 'II母'), H2, { b: true });
    function risers(x, up) {
      if (up) {
        if (!dbl) { s.dot(x, yb1); s.ln(x, yb1, x, yb1 - 2); s.sw(x, yb1 - 12, 'ds', LB); return yb1 - 12; }
        s.dot(x - 3, yb1); s.ln(x - 3, yb1, x - 3, yb1 - 2); s.sw(x - 3, yb1 - 12, 'ds', LB);
        s.dot(x + 3, yb2); s.vline(x + 3, yb1 - 2, yb2, [yb1]); s.sw(x + 3, yb1 - 12, 'ds', LB);
        s.ln(x - 3, yb1 - 12, x + 3, yb1 - 12); return yb1 - 12;
      }
      if (!dbl) { s.dot(x, yb1); s.ln(x, yb1, x, yb1 + 2); s.sw(x, yb1 + 2, 'ds', LB); s.ln(x, yb1 + 12, x, yb1 + 14); return yb1 + 14; }
      s.dot(x - 3, yb1); s.vline(x - 3, yb1, yb2 + 2, [yb2]); s.sw(x - 3, yb2 + 2, 'ds', LB);
      s.dot(x + 3, yb2); s.ln(x + 3, yb2, x + 3, yb2 + 2); s.sw(x + 3, yb2 + 2, 'ds', LB);
      s.ln(x - 3, yb2 + 12, x + 3, yb2 + 12); s.ln(x, yb2 + 12, x, yb2 + 14); return yb2 + 14;
    }
    P.hin.forEach(function (x, i) {
      var y = risers(x, true);
      s.ln(x, y, x, y - 1); y -= 1; y -= 9.1; s.ct(x, y, 3); y -= LB; s.sw(x, y, 'cb', LB); var yCB = y; y -= 9.1; s.ct(x, y, 3);
      s.ln(x, y, x, y - 1.5); s.es(x, y - 0.8, 1); y -= 1.5; y -= LB; s.sw(x, y, 'ds', LB);
      if (!ehv) s.es(x, Hb + 26, 1);
      s.ln(x, y, x, Hb + 12.1); s.vt(x, Hb + 15.5, 1, true); s.sa(x, Hb + 13, -1); s.term(x, Hb + 8.5);
      if (ehv) s.t(x + 3.5, Hb + 6, T('from IBT-' + (i + 1), '来自联络变' + (i + 1)), H3, { b: true });
      else { s.ln(x, Hb + 7.5, x, Hb + 8.5); s.arrowDn(x, Hb + 7.5); s.t(x + 3.5, Hb + 5, T('Line ' + (i + 1) + ' — PLN', 'PLN线路' + (i + 1)), H2, { b: true }); }
      if (i === 0) { var rw = s.relay(x + 6, yCB + 2.2, ehv ? '87T 51' : '87L 21 67N'); s.t(x + 7.5 + rw, yCB + 6.1, 'CB ' + F(R.lineA) + ' A', H3); }
    });
    function vtBay(x, k, tag) {
      var yy = k ? yb2 : yb1, top = Hb + 42;
      s.dot(x, yy); if (k) s.vline(x, yb1 - 2, yb2, [yb1]); else s.ln(x, yb1, x, yb1 - 2);
      s.sw(x, yb1 - 12, 'ds', LB); s.ln(x, yb1 - 12, x, top); s.es(x, yb1 - 15, 1); s.vt(x, top + 4, 1, true); s.sa(x, top + 9, -1);
      s.t(x, top - 4, T('Bus VT' + (dbl ? (k ? ' II' : ' I') : '') + (tag || ''), (dbl ? (k ? 'II' : 'I') : '') + (tag || '') + '母PT'), H3, { a: 'c', b: true });
    }
    P.hvt.forEach(function (x, k) { vtBay(x, k, P.sect ? '-2' : ''); });
    P.hvt2.forEach(function (x, k) { vtBay(x, k, '-1'); });
    [P.coup, P.coup2].forEach(function (xc) {
      if (!dbl || xc === null || xc === undefined) return;
      var a = xc - 4, b = xc + 4;
      s.dot(a, yb1); s.vline(a, yb1, yb2 + 2, [yb2]); s.sw(a, yb2 + 2, 'ds', LB);
      var hc = s.ct(a, yb2 + 12, 2); s.sw(a, yb2 + 12 + hc, 'cb', LB); var yl = yb2 + 24 + hc;
      s.ln(a, yb2 + 22 + hc, a, yl); s.ln(a, yl, b, yl); s.ln(b, yl, b, yb2 + 12); s.sw(b, yb2 + 2, 'ds', LB); s.ln(b, yb2, b, yb2 + 2); s.dot(b, yb2);
      s.t(xc, yl + 5.5, T('Bus coupler', '母联'), H3, { a: 'c', b: true });
    });
    function earth(lx, ly, dir) { var ex = lx + 7 * dir; s.ln(lx, ly + 6, ex, ly + 6); s.pg.circle(ex, ly + 9.2, 2.8, { c: INK, w: 0.3 }); s.wind(ex, ly + 9.2, 'Z', 2.8); s.ln(ex, ly + 12, ex, ly + 12.6); s.res(ex, ly + 12.6); s.gnd(ex, ly + 20.6); }
    P.tr.forEach(function (t, j) {
      var x2 = t.x, y2 = risers(x2, false);
      s.sw(x2, y2, 'cb', LB); y2 += LB; y2 += s.ct(x2, y2, 3); s.sw(x2, y2, 'ds', LB); y2 += LB;
      s.ln(x2, y2, x2, P.yt); s.sa(x2, y2 + 1.2, -1, 9); s.es(x2, y2 + 2.6, 1);
      if (ht.split) s.tr3(x2, P.yt, 'D', true); else s.tr2(x2, P.yt, 'Y', 'D', true);
      t.leads.forEach(function (ld) { earth(ld.x, P.ly, ld.dir); });
      var lx0 = x2 + (ht.split ? 11 : 9), yt = P.yt;
      s.t(lx0, yt + 3.5, 'TR-' + (j + 1), H2, { b: true }); s.t(lx0, yt + 7.5, (ht.split ? ht.mva + ' / ' + ht.w1 + ' / ' + ht.w2 : F(ht.mva)) + ' MVA', H3); s.t(lx0, yt + 11.1, ht.ratio, H3); s.t(lx0, yt + 14.7, ht.vg + ', uk ' + ht.uk + (ht.uk2 ? ' / ' + ht.uk2 : '') + ' %', H3);
      if (j === 0) s.relay(x2 + 5, P.yb2 + 25, '87T 64REF 51/51N');
    });
  }
  function labLines(s, lab, w) { var out = []; lab.forEach(function (l, i) { if (!l) return; s.wrap(l, H3, w, i === 0).forEach(function (q) { out.push([q, i === 0]); }); }); return out; }
  function fdr(s, x, Y, f, lab) {
    s.sw(x, Y, 'wcb', 10); s.ct(x, Y + 16, 2, 1.2); s.ln(x, Y + 21.4, x, Y + 22.2);
    if (f.k === 'sp') s.ln(x, Y + 22.2, x, Y + 30, 0.35, [1.2, 0.8]);
    else {
      s.term(x, Y + 22.2); s.ln(x, Y + 25.8, x, Y + 27); var yy = Y + 27;
      if (f.k === 'gen') s.gen(x, yy, 4.5);
      else if (f.k === 'cap' && !isSVG(f)) { s.cap(x, yy); s.gnd(x, yy + 7); }
      else if (f.k === 'bess' || f.k === 'db' || isSVG(f)) { s.pg.rect(x - 5.5, yy, 11, 6, { c: INK, w: 0.4, fill: PAPER }); s.t(x, yy + 4.1, f.k === 'db' ? 'DB' : (isSVG(f) ? 'SVG' : 'BESS'), H3, { a: 'c', b: true }); }
      else s.tr2(x, yy, 'D', 'Y', false, 3.4);
    }
    labLines(s, lab, FS - 1.5).forEach(function (q, i) { s.t(x, Y + 44 + i * LH, q[0], H3, { a: 'c', b: q[1], k: true }); });
  }
  function inc(s, x, Y, meter) {
    s.ln(x, Y - 30, x, Y - 28); s.es(x, Y - 29, 1); s.sw(x, Y - 28, 'wcb', 10); s.ct(x, Y - 10, 3); s.ln(x, Y - 0.9, x, Y);
    if (meter) { s.ln(x + 1.3, Y - 5.5, x + 4, Y - 5.5, 0.25, [0.8, 0.5]); s.pg.rect(x + 4, Y - 8, 9, 5, { c: INK, w: 0.3, fill: PAPER }); s.t(x + 8.5, Y - 4.6, 'kWh', H3, { a: 'c' }); }
  }
  function busVT(s, xv, Y) { s.ln(xv, Y, xv, Y + 2.5); s.fuse(xv, Y + 2.5); s.ln(xv, Y + 9.5, xv, Y + 12); s.vt(xv, Y + 12, 1, true); s.sa(xv, Y + 5, -1, 6); s.t(xv + 8.7, Y + 22, 'VT', H3, { a: 'c', b: true }); }
  function drawMV(s, d, P) {
    var mv = d.mv, ht = d.ht, y20 = P.y20, pln = 0;
    P.secs.forEach(function (sc, idx) {
      var X = sc.X, w = sc.w, k = sc.k;
      s.bus(X, X + w, y20); s.t(X + w, y20 - 2.6, 'S' + (k + 1), H2, { a: 'r', b: true });
      sc.inc.forEach(function (x) {
        inc(s, x, y20, !ht); s.t(x + 3.5, y20 - 12, F(mv.busA) + ' A', H3, { k: true });
        if (!ht) { pln++; s.arrowDn(x, P.Mtop - 2); s.ln(x, P.Mtop - 2, x, P.Mtop); s.t(x, P.Mtop - 8, 'PLN ' + pln, H2, { a: 'c', b: true }); }
      });
      busVT(s, sc.xv, y20);
      sc.items.forEach(function (it, j) { fdr(s, sc.fx[j], y20, it.f, it.lab); });
      var nxt = P.secs[idx + 1];
      if (nxt && nxt.k === k + 1) { s.ln(X + w, y20, X + w + 1, y20); s.cbH(X + w + 1, y20, true); s.ln(X + w + 13, y20, nxt.X, y20); s.t(X + w + 7, y20 - 4.6, 'N.O.', H3, { a: 'c' }); }
      if (idx === 0) { var xl = sc.inc[sc.inc.length - 1]; s.relay(xl + 6, y20 - 22, '51 51N 67 27/59'); s.ln(xl + 1.3, y20 - 9, xl + 6, y20 - 19.2, 0.25, [1, 0.8]); }
    });
    if (!ht) return;
    var Hs = [], Vs = [];
    P.tr.forEach(function (t) {
      if (t.typ) {
        t.leads.forEach(function (ld) { s.ln(ld.x, P.ly, ld.x, P.yd); });
        s.pg.rect(t.x - 26, P.yd, 52, 24, { c: INK, w: 0.35, dash: DASH });
        s.t(t.x, P.yd + 6, 'S' + (t.ks[0] + 1) + '–S' + (t.ks[t.ks.length - 1] + 1), H2, { a: 'c', b: true }); s.t(t.x, P.yd + 11, T('20 kV sections', '20 kV母线段'), H3, { a: 'c' }); s.t(t.x, P.yd + 15, T('as TR-1 / TR-2', '同TR-1/TR-2'), H3, { a: 'c' }); s.t(t.x, P.yd + 19, ht.sec + ' × ' + F(mv.busA) + ' A', H3, { a: 'c' });
        return;
      }
      t.leads.forEach(function (ld, li) {
        var yd = P.yd + li * 4, xs = ld.ks.map(function (k) { var sc = P.secs.filter(function (q) { return q.k === k; })[0]; return sc ? sc.inc[0] : null; }).filter(function (v) { return v !== null; });
        Vs.push([ld.x, P.ly, yd]);
        var x0 = Math.min.apply(null, xs.concat([ld.x])), x1 = Math.max.apply(null, xs.concat([ld.x])); if (x1 > x0 + 0.5) Hs.push([x0, x1, yd]);
        xs.forEach(function (x) { Vs.push([x, yd, P.Mtop]); });
        if (xs.length > 1 || Math.abs(xs[0] - ld.x) > 1) s.dot(ld.x, yd);
      });
    });
    Vs.forEach(function (v) { s.vline(v[0], v[1], v[2], Hs.filter(function (h) { return h[2] > v[1] + 0.5 && h[2] < v[2] - 0.5 && h[0] < v[0] - 0.5 && h[1] > v[0] + 0.5; }).map(function (h) { return h[2]; })); });
    Hs.forEach(function (h) { s.ln(h[0], h[2], h[1], h[2]); });
  }
  function drawBoard(s, d, P) {
    var db = d.el.mvdb, el = d.el, mv = d.mv, yB = P.yBb, nT = 0, nG = 0, tx0 = P.bA.inX + 6, tw = P.bB.inX - 6 - tx0;
    s.t(tx0, P.D0 - 9.5, fit(s, T('TYPICAL BUILDING 20 kV BOARD — 1 OF ' + db.n, '典型楼宇20 kV开关柜——共' + db.n + '套之一'), H2, tw, true), H2, { b: true, k: true });
    s.para(tx0, P.D0 - 5, T(db.txPer + ' MV/LV TX' + (db.genPer ? ' + ' + db.genPer + ' generators' : '') + ', ' + F(db.busA) + ' A, ' + db.ik + ' kA; ≈ ' + F(d.gd.board.it, 1) + ' MW IT' + (d.gd.ai ? ' = ' + F(d.gd.board.hd) + ' GPU racks' : '') + '; bus A and bus B from different ' + (d.ht ? 'HV/MV transformers' : '20 kV sections'),
      db.txPer + '台中/低压变' + (db.genPer ? '+' + db.genPer + '台发电机' : '') + '，' + F(db.busA) + ' A，' + db.ik + ' kA；约' + F(d.gd.board.it, 1) + ' MW IT' + (d.gd.ai ? ' = ' + F(d.gd.board.hd) + '个GPU机柜' : '') + '；A、B段取自不同' + (d.ht ? '主变' : '20 kV母线段')), H3, tw, { k: true });
    [P.bA, P.bB].forEach(function (h, hi) {
      var X0b = h.x, X1 = h.X1;
      s.bus(X0b, X1, yB); s.t(X1, yB - 2.6, T('BUS ' + (hi ? 'B' : 'A'), (hi ? 'B' : 'A') + '段'), H2, { a: 'r', b: true });
      s.arrowDn(h.inX, P.D0 + 3); s.ln(h.inX, P.D0 + 3, h.inX, yB - 30); inc(s, h.inX, yB, false); s.t(h.inX + 3.5, yB - 12, F(db.busA) + ' A', H3, { k: true });
      busVT(s, X0b + 20, yB);
      var list = [], i;
      for (i = 0; i < h.g; i++) list.push({ f: { k: 'gen' }, lab: ['G' + (++nG), F(el.genSize) + ' kWe', T('generator', '发电机')] });
      for (i = 0; i < h.t; i++) list.push({ f: { k: 'tx' }, lab: ['TX' + (++nT), F(el.txSize) + ' kVA', T('MV/LV TX', '中/低压变')] });
      list.push({ f: { k: 'sp' }, lab: ['SP', '', T('spare', '备用')] });
      list.forEach(function (it, j) { fdr(s, X0b + 42 + j * FS, yB, it.f, it.lab); });
    });
    s.ln(P.bA.X1, yB, P.bA.X1 + 7, yB); s.cbH(P.bA.X1 + 7, yB, true); s.ln(P.bA.X1 + 19, yB, P.bB.x, yB); s.t(P.bA.X1 + 13, yB - 4.6, 'N.O.', H3, { a: 'c' });
    if (db.genPer) s.relay(P.bA.x + 36, yB + 60, '87G 51V 32 40 46 25');
  }
  function drawCh(s, d, P) {
    var el = d.el, ch = el.chTx, X = P.ch.x, D0 = P.D0, me = d.R.me, yb = D0 + 50, kwe = me.chN ? el.chKWe / me.chN : 0;
    s.t(X + 6, D0 - 9.5, T('TYPICAL 6.6 kV CHILLER BOARD — 1 OF ' + ch.total, '典型6.6 kV冷机配电——共' + ch.total + '套之一'), H2, { b: true, k: true });
    s.t(X + 6, D0 - 5, T(ch.total + ' × ' + F(ch.kva) + ' kVA (' + ch.n + ' + ' + ch.r + '); ' + ((me.chN || 0) + (me.chR || 0)) + ' chillers × ' + F(me.chSize) + ' kW cooling', ch.total + '×' + F(ch.kva) + ' kVA（' + ch.n + '+' + ch.r + '）；' + ((me.chN || 0) + (me.chR || 0)) + '台冷机×' + F(me.chSize) + ' kW制冷'), H3, { k: true });
    s.arrowDn(X, D0 + 3); s.term(X, D0 + 4.5); s.ln(X, D0 + 8.1, X, D0 + 10);
    s.tr2(X, D0 + 10, 'D', 'Y', false, 5); s.ln(X, D0 + 23.25, X - 9, D0 + 23.25, 0.3); s.res(X - 9, D0 + 23.25); s.gnd(X - 9, D0 + 31.25);
    s.t(X + 8, D0 + 15, 'CT-1', H2, { b: true }); s.t(X + 8, D0 + 19.5, F(ch.kva) + ' kVA', H3, { b: true }); s.t(X + 8, D0 + 23.1, '20/6.6 kV Dyn11', H3); s.t(X + 8, D0 + 26.7, T('NER 6.6 kV', '6.6 kV中性点电阻'), H3);
    s.ln(X, D0 + 27.25, X, D0 + 30); s.sw(X, D0 + 30, 'wcb', 10); s.ln(X, D0 + 46, X, yb);
    var xe = X + 26 + P.ch.n * FS; s.bus(X - 8, xe, yb); s.t(xe, yb - 2.6, '6.6 kV', H2, { a: 'r', b: true });
    for (var i = 0; i < P.ch.n; i++) { var fx = X + 22 + (i + 0.3) * FS; s.sw(fx, yb, 'wcb', 10); s.ct(fx, yb + 16, 2, 1.2); s.ln(fx, yb + 21.4, fx, yb + 23); s.mot(fx, yb + 23, 4); s.t(fx, yb + 36, 'CH' + (i + 1), H3, { a: 'c', b: true }); s.t(fx, yb + 39.5, F(kwe) + ' kW', H3, { a: 'c' }); }
    if (P.ch.all > P.ch.n) s.t(X + 22, yb + 45, T(P.ch.all + ' chillers per board (6 shown)', '每套' + P.ch.all + '台冷机（图示6台）'), H3);
  }
  function drawLV(s, d, P) {
    var el = d.el, p = d.p, arch = el.txArch, lv = el.lv, D0 = P.D0, vk = lvKV(d.lvV), X = P.lvC;
    var nbk = arch === 'N1' && el.txBlk && el.txBlk.per > 1 ? el.txBlk.per - 1 : 2;
    var cols = arch === '2N' ? ['A', 'B'] : (arch === 'DR' ? ['A', 'B', 'C'] : (el.txR ? ['1', 'R', String(nbk)] : ['1', '2', '3']));
    var upsPer = Math.max(1, Math.round(el.upsTotal / Math.max(1, el.txTotal - (arch === 'N1' ? el.txR : 0)))), msbA = pickN([1600, 2500, 3200, 4000, 5000, 6300], lv.acb), rackKW = d.R.cap ? d.R.cap.sd : 0;
    var tx0 = X[0] + 6;
    s.t(tx0, D0 - 9.5, T('TYPICAL MV/LV BLOCK — ' + el.txTotal + ' × ' + F(el.txSize) + ' kVA = ' + blk(el), '典型中/低压模块——' + el.txTotal + '×' + F(el.txSize) + ' kVA = ' + blk(el)), H2, { b: true, k: true });
    s.t(tx0, D0 - 5, T('LV system ' + d.lvV + ' V (IEC 60038): each transformer feeds one main switchboard; its busbar distributes the load to the outgoing feeders', '低压系统' + d.lvV + ' V（IEC 60038）：每台变压器供一面总配电柜，由其母线分配负荷至各出线'), H3, { k: true });
    var gdb = d.gd.blk; s.t(tx0, D0 - 1.4, d.gd.ai ? T('Each block ≈ ' + F(gdb.it, 1) + ' MW IT = ' + F(gdb.hd) + ' GPU racks (' + F(d.gd.rackKW) + ' kW) = ' + F(gdb.gpus) + ' GPUs', '每个模块约' + F(gdb.it, 1) + ' MW IT = ' + F(gdb.hd) + '个GPU机柜（' + F(d.gd.rackKW) + ' kW）= ' + F(gdb.gpus) + '颗GPU') : T('Each block ≈ ' + F(gdb.it, 1) + ' MW IT = ' + F(gdb.racks) + ' racks', '每个模块约' + F(gdb.it, 1) + ' MW IT = ' + F(gdb.racks) + '个机柜'), H3, { k: true });
    cols.forEach(function (lab, i) {
      var x = X[i], res = lab === 'R';
      s.arrowDn(x, D0 + 3); s.term(x, D0 + 4.5); s.ln(x, D0 + 8.1, x, D0 + 10);
      s.tr2(x, D0 + 10, 'D', 'Y', false, 5.5); s.ln(x, D0 + 24.6, x - 9, D0 + 24.6, 0.3); s.gnd(x - 9, D0 + 24.6);
      s.t(x + 9, D0 + 13, res ? T('TX R (reserve)', 'TX R（备用）') : 'TX ' + lab, H2, { b: true }); s.t(x + 9, D0 + 17.5, F(el.txSize) + ' kVA', H3, { b: true }); s.t(x + 9, D0 + 21.1, '20/' + vk + ' kV Dyn11', H3); s.t(x + 9, D0 + 24.7, 'uk ' + lv.uk + ' %', H3);
      s.ln(x, D0 + 29, x, D0 + 30); s.sw(x, D0 + 30, 'wcb', 10); s.ln(x, D0 + 46, x, D0 + 50); s.t(x + 4, D0 + 40, 'ACB ' + F(lv.acb) + ' A', H3);
      s.bus(x - 45, x + 45, D0 + 50); s.t(x - 45, D0 + 47.4, (res ? T('Reserve bus R', '备用母线R') : 'MSB ' + lab) + '  ' + F(msbA) + ' A, ' + lv.icw + ' kA', H3, { b: true });
      if (res) {
        [-1, 1].forEach(function (dr) { var e0 = x + 45 * dr, e1 = X[i + dr] - 45 * dr, mid = (e0 + e1) / 2; s.ln(Math.min(e0, e1), D0 + 50, mid - 6, D0 + 50); s.cbH(mid - 6, D0 + 50, true); s.ln(mid + 6, D0 + 50, Math.max(e0, e1), D0 + 50); s.t(mid, D0 + 45.4, 'N.O.', H3, { a: 'c' }); });
        s.para(x - 40, D0 + 57, T('Closes onto MSB 1 … MSB ' + nbk + ' when one of their transformers fails (interlocked ties). Block: ' + nbk + ' duty + 1 reserve; TX 2 … TX ' + Math.max(2, nbk - 1) + ' as TX 1.', '任一变压器故障时经联锁联络开关接至MSB 1…MSB ' + nbk + '。模块：' + nbk + '用1备；TX 2…TX ' + Math.max(2, nbk - 1) + '同TX 1。'), H3, 80, { k: true });
        return;
      }
      var xu = x - 26; s.ln(xu, D0 + 50, xu, D0 + 52); s.sw(xu, D0 + 52, 'cb', 10); s.ln(xu, D0 + 62, xu, D0 + 64);
      s.ups(xu, D0 + 64); s.t(xu + 14.5, D0 + 68.5, upsPer + ' × ' + F(el.upsSize) + ' kW', H3); s.t(xu + 14.5, D0 + 72, 'UPS', H3, { b: true });
      s.ln(xu - 13, D0 + 67, xu - 21, D0 + 67); s.ln(xu - 21, D0 + 67, xu - 21, D0 + 68); s.bat(xu - 21, D0 + 68); s.t(xu - 21, D0 + 76, (p.battery === 'LI' ? 'LFP ' : 'VRLA ') + p.upsMin + ' min', H3, { a: 'c' });
      s.ln(xu, D0 + 76, xu, D0 + 80); s.bus(xu - 13, xu + 13, D0 + 80, 0.9); s.t(xu - 14.5, D0 + 81, T('Critical bus ', '关键母线') + lab, H3, { a: 'r' });
      s.ln(xu, D0 + 80, xu, D0 + 84); s.box(xu, D0 + 84, 24, 8, el.useBusway ? T('Busway', '母线槽') : 'PDU'); s.t(xu + 13.5, D0 + 89.2, el.useBusway ? F(el.bwA) + ' A' : '', H3); s.ln(xu, D0 + 92, xu, D0 + 98);
      if (arch === 'DR' && i === 2) s.t(xu, D0 + 102, T('to rack pairs B-C, C-A', '至B-C、C-A机柜'), H3, { a: 'c' });
      var xm = x + 18; s.ln(xm, D0 + 50, xm, D0 + 52); s.sw(xm, D0 + 52, 'cb', 10); s.ln(xm, D0 + 62, xm, D0 + 66); s.box(xm, D0 + 66, 18, 9, 'MCC');
      s.para(xm - 13, D0 + 79, el.chV === 'MV' ? T('pumps, fans, towers', '水泵、风机、冷却塔') : T('chillers, pumps, fans', '冷机、水泵、风机'), H3, 26);
      if (el.genV !== 'MV') { var xg = x + 38; s.ln(xg, D0 + 50, xg, D0 + 52); s.sw(xg, D0 + 52, 'cb', 10); s.ln(xg, D0 + 62, xg, D0 + 66); s.gen(xg, D0 + 66, 5); s.t(xg + 7, D0 + 70, F(el.genSize) + ' kWe', H3); s.t(xg + 7, D0 + 73.6, d.lvV + ' V', H3); }
    });
    var ups = cols.filter(function (l) { return l !== 'R'; }), i0 = cols.indexOf(ups[0]), i1 = cols.indexOf(ups[1]), xa = X[i0] - 26, xb = X[i1] - 26, xR = (X[i0] + X[i1]) / 2 - 13, yr = D0 + 100;
    var gq = d.gd; s.pg.rect(xR - 22, yr, 44, 22, { c: INK, w: 0.4, fill: PAPER }); s.t(xR, yr + 5.5, gq.ai ? T('GPU rack', 'GPU机柜') : T('IT rack', 'IT机柜'), H3, { a: 'c', b: true }); s.t(xR, yr + 9.5, gq.ai ? F(gq.rackKW) + ' kW, ' + gq.gpuPerRack + ' GPU' : F(rackKW, 1) + ' kW' + (d.R.cap.hdR > 0 ? ' / HD ' + F(d.R.cap.hd) + ' kW' : ''), H3, { a: 'c' });
    s.t(xR, yr + 13.5, T('≈ ' + F(gq.ai ? gq.blk.hd : gq.blk.racks) + ' racks per block', '每模块约' + F(gq.ai ? gq.blk.hd : gq.blk.racks) + '个机柜'), H3, { a: 'c' }); s.t(xR, yr + 17.5, (el.feedsPerRack === 2 ? 'rPDU A + B' : 'rPDU') + ', ' + (el.feedsPerRack === 2 ? T('dual-corded', '双电源') : T('single-corded', '单电源')), H3, { a: 'c' });
    s.ln(xa, D0 + 98, xa, yr + 7); s.ln(xa, yr + 7, xR - 22, yr + 7); s.t(xa + 2.5, yr + 5.6, T('cord A', 'A路'), H3);
    if (el.feedsPerRack === 2) { s.ln(xb, D0 + 98, xb, yr + 15); s.ln(xb, yr + 15, xR + 22, yr + 15); s.t(xb - 2.5, yr + 13.6, T('cord B', 'B路'), H3, { a: 'r' }); }
  }

  function chainOf(d) { var hv = d.hv; return (d.ehv ? 'PLN ' + hv.kv + ' kV → 150 kV' : (d.kv > 20 ? 'PLN ' + hv.kv + ' kV' : 'PLN 20 kV')) + ' → 20 kV → ' + d.lvV + ' V'; }
  function layout(d) { var P = plan(d, true); if (P.cw + 16 > 841) P = plan(d, false); return P; }
  function sheetAll(doc, d, P, no, total) {
    var el = d.el, sh = sheetFor(P), W = sh.W, H = sh.H, chain = chainOf(d);
    var pg = doc.page(W, H, sh.name), s = frame(pg, d.meta, no, total, T('Integrated single-line diagram', '综合单线图') + ' — ' + chain, W, H);
    s.t(16, 24, T('INTEGRATED SINGLE-LINE DIAGRAM', '综合单线图') + '  |  ' + chain, H1, { b: true });
    s.t(16, 31, T(F(el.mva, 1) + ' MVA maximum demand, IT ' + F(d.R.cap.itMW, 1) + ' MW, Tier ' + d.p.tier + '; MV/LV ' + el.txTotal + ' × ' + F(el.txSize) + ' kVA = ' + blk(el) + '; equipment and rating schedule on sheet 2', '最大需量' + F(el.mva, 1) + ' MVA，IT ' + F(d.R.cap.itMW, 1) + ' MW，Tier ' + d.p.tier + '；中/低压' + el.txTotal + '×' + F(el.txSize) + ' kVA = ' + blk(el) + '；设备及额定参数见第2张'), H3);
    drawMargin(s, d, P);
    drawRoutes(s, P.routes);
    if (d.ehv) drawEHV(s, d, P);
    if (P.hvOn) drawHV(s, d, P);
    drawMV(s, d, P);
    if (el.mvdb) drawBoard(s, d, P);
    if (P.ch) drawCh(s, d, P);
    drawLV(s, d, P);
    var BT = H - 96, lgX = W - 10 - 180 - 8 - 4 * 56;
    notes(s, [['One drawing from the PLN connection to the IT rack. The building board, the MV/LV block and the chiller board are typical and repeat as stated in their titles; dashed lines are typical connections.', '从PLN接入到IT机柜的一张图。楼宇开关柜、中/低压模块及冷机配电为典型，按标题所述数量重复；虚线为典型连接。'],
      ['Redundancy: HV/MV PLN N-1 (20 kV bus sections normally open and interlocked, building boards fed from two HV/MV transformers); MV/LV ' + el.txLabel + '; UPS ' + el.upsLabel + '; generators ' + el.genLabel + '.', '冗余：主变PLN N-1（20 kV分段常开并联锁，楼宇开关柜取自两台主变）；中/低压' + el.txLabel + '；UPS ' + el.upsLabel + '；发电机' + el.genLabel + '。'],
      ['Symbols IEC 60617; protection device numbers IEEE C37.2; voltages IEC 60038; lettering ISO 3098 (2.5 / 3.5 / 5 mm).', '图形符号IEC 60617；保护装置编号IEEE C37.2；电压IEC 60038；字高ISO 3098（2.5/3.5/5 mm）。'],
      ['Planning drawing: ratings follow the design rules; confirm with the PLN connection study and the protection, earthing and cable studies. Feeders, cables and protection: sheet 2.', '规划用图：额定值按设计规则；须经PLN接入研究及保护、接地、电缆研究确认。馈线、电缆及保护见第2张。']], 16, BT + 6, lgX - 16 - 10);
    legend(s, lgX, BT + 6, 4, 56);
    return { W: W, H: H, name: sh.name };
  }

  /* ------------------------------------------------------------------ sheet 2: equipment and rating schedule */
  function sheetSchedule(doc, d, P, no, total) {
    var meas = new Sym({ textW: TW }), sch = schedules(d, P), el = d.el;
    var boq = d.R.boq.filter(function (b) { return /^EL-(0[1-9]|1[0-9]|2[0-8])$/.test(b.id) && ['EL-12', 'EL-14', 'EL-16', 'EL-18', 'EL-19', 'EL-20', 'EL-21', 'EL-22'].indexOf(b.id) < 0; }).slice(0, 26)
      .map(function (b) { return [b.id + ' ' + T(b.en, b.zh), F(b.qty) + ' ' + T(b.unit, b.unitZh && b.unitZh !== b.unit ? b.unitZh : (UNIT[b.unit] || b.unit)) + (b.rating ? ' — ' + b.rating : '')]; });
    var items = sch.concat([[T('Electrical equipment (bill of quantities)', '电气设备清单'), boq]]), lay = null;
    for (var i = 0; i < SHEETS.length && !lay; i++) {
      var W = SHEETS[i][0], H = SHEETS[i][1], cw = (W - 32 - 8) / 3, col = [40, 40, 40], pos = [];
      items.forEach(function (it) { var c = col.indexOf(Math.min.apply(null, col)), h = schedBox(meas, 0, 0, cw, it[0], it[1], false); pos.push([c, col[c]]); col[c] += h + 4; });
      if (Math.max.apply(null, col) <= H - 98 || i === SHEETS.length - 1) lay = { W: W, H: Math.max(H, Math.ceil((Math.max.apply(null, col) + 98) / 10) * 10), cw: cw, pos: pos, name: SHEETS[i][2] };
    }
    var pg = doc.page(lay.W, lay.H, lay.name), s = frame(pg, d.meta, no, total, T('Equipment and rating schedule (electrical)', '电气设备及额定参数表'), lay.W, lay.H);
    s.t(16, 24, T('EQUIPMENT AND RATING SCHEDULE', '设备及额定参数表') + '  |  ' + chainOf(d), H1, { b: true });
    s.t(16, 31, T('Ratings, feeders, cables and protection of the integrated single-line diagram (sheet 1); planning quantities from the assessment engine', '综合单线图（第1张）的额定值、馈线、电缆及保护；规划数量取自评估引擎'), H3);
    items.forEach(function (it, k) { schedBox(s, 16 + lay.pos[k][0] * (lay.cw + 4), lay.pos[k][1], lay.cw, it[0], it[1]); });
    notes(s, [['Standards: IEC 62271, IEC 60076, IEC 61869, IEC 60099-4, IEC 60909, IEC 60502-2, IEC 60949, IEC 61439, IEC 60947-2, IEC 60364, PLN Grid Code (Permen ESDM 20/2020), SPLN, SNI / PUIL 2011.', '标准：IEC 62271、IEC 60076、IEC 61869、IEC 60099-4、IEC 60909、IEC 60502-2、IEC 60949、IEC 61439、IEC 60947-2、IEC 60364、PLN电网规范、SPLN、SNI/PUIL 2011。'],
      ['Quantities and ratings are planning values (' + el.txTotal + ' MV/LV transformers, LV ' + d.lvV + ' V); confirm with the PLN connection study and the protection, earthing and cable studies.', '数量及额定为规划值（' + el.txTotal + '台中/低压变压器，低压' + d.lvV + ' V）；须经PLN接入研究及保护、接地、电缆研究确认。']], 16, lay.H - 90, lay.W - 32 - 196);
    return { W: lay.W, H: lay.H, name: lay.name };
  }

  /* ------------------------------------------------------------------ build: PDF (2 sheets) and SVG (website) */
  function setLang(opt) { LANG = (opt && opt.lang) || (g.I18N && g.I18N.lang ? g.I18N.lang() : 'en'); if (LANG !== 'zh') LANG = 'en'; }
  /* the name, drawing code and file name come from the design itself (category, IT load, Tier, voltages), not from the template it started from */
  function designOf(x, lead, lang) {
    setLang({ lang: lang }); var c = x.R.cap, el = x.R.el, it = c.itMW, tag = String(Math.round(it * 10) / 10), slug = String(c.type.en || 'Data-Center').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return { name: (lead ? lead + ' — ' : '') + T(c.type.en, c.type.zh) + ' — ' + F(it, it < 10 ? 1 : 0) + ' MW IT', code: c.type.id + '-' + tag + 'MW', file: 'SLD_' + slug + '_' + tag + 'MW_Tier-' + (['I', 'II', 'III', 'IV'][x.p.tier - 1] || x.p.tier) + '_' + el.hv.kv + 'kV_' + (el.lvV || 400) + 'V' };
  }
  function metaOf(x, opt) {
    var R = x.R, rev = (g.DCDB && g.DCDB.kbDocs && g.DCDB.kbDocs.rev) || '';
    return { project: opt.name || designOf(x, null, LANG).name, basis: (opt.basis ? opt.basis + ' | ' : '') + F(R.cap.itMW, 1) + ' MW IT | Tier ' + x.p.tier + ' | ' + R.el.hv.name + ' | ' + F(R.el.mva, 1) + ' MVA',
      dwg: 'DC-SLD-' + (opt.code || designOf(x, null, LANG).code), date: new Date().toISOString().slice(0, 10), rev: rev, titles: [] };
  }
  function build(x, opt) {
    opt = opt || {}; setLang(opt);
    var meta = metaOf(x, opt), d = design(x, meta), P = layout(d);
    var pdf = PDF.create({ w: 594, h: 420, title: T('Single-line diagram', '单线图') + ' — ' + meta.project, author: 'PT CCEPC Indonesia', subject: meta.basis });
    var r = sheetAll(pdf, d, P, 1, 2); sheetSchedule(pdf, d, P, 2, 2);
    pdf.titles = meta.titles; pdf.size = [r.W, r.H]; pdf.sheet = r.name; pdf.lang = LANG;
    return pdf;
  }
  /* AutoCAD drawing (DWG R2000): the same two sheets side by side in model space, 1:1 in millimetres */
  function buildDWG(x, opt) {
    opt = opt || {}; setLang(opt);
    var meta = metaOf(x, opt), d = design(x, meta), P = layout(d), doc = DWG.create({ lang: LANG, block: meta.dwg });
    sheetAll(doc, d, P, 1, 2); sheetSchedule(doc, d, P, 2, 2); doc.titles = meta.titles; doc.lang = LANG;
    return doc;
  }
  function buildSVG(x, opt) {
    opt = opt || {}; setLang(opt);
    var meta = metaOf(x, opt), d = design(x, meta), P = layout(d), doc = SVG.create({ title: T('Single-line diagram', '单线图') + ' — ' + meta.project });
    var r1 = sheetAll(doc, d, P, 1, 2), r2 = sheetSchedule(doc, d, P, 2, 2);
    var pages = [{ svg: doc.svg(0), w: r1.W, h: r1.H, name: r1.name, title: meta.titles[0] }, { svg: doc.svg(1), w: r2.W, h: r2.H, name: r2.name, title: meta.titles[1] }];
    return { pages: pages, svg: pages[0].svg, w: r1.W, h: r1.H, name: r1.name, title: meta.titles[0], lang: LANG };
  }

  /* ------------------------------------------------------------------ viewer (website): sheet tabs, zoom and pan, export as PDF; texts in the website language */
  function Lx(en, zh) { return g.I18N && g.I18N.lang && g.I18N.lang() === 'zh' ? zh : en; }
  function escH(v) { return String(v).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
  function fileName(opt, ext) { ext = '.' + (ext || 'pdf'); if (opt && opt.file) return opt.file.replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 120) + ext; return ('SLD_' + (opt.code || 'design') + '_' + (opt.name || '')).replace(/[^A-Za-z0-9._-]+/g, '_').replace(/_+/g, '_').replace(/_$/, '').slice(0, 90) + ext; }
  function save(blob, name) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000); }
  function downloadPDF(x, opt) { save(build(x, opt).blob(), fileName(opt, 'pdf')); }
  function downloadDWG(x, opt) { save(new Blob([buildDWG(x, opt).output()], { type: 'application/acad' }), fileName(opt, 'dwg')); }
  var IC = { dl: '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>', full: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>' };
  /* zoom: 100 % = sheet width fitted to the view; − / + step through this ladder, the percentage can be typed (10–1000 %), Ctrl + wheel zooms smoothly at the pointer */
  var ZOOM = [0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.5, 4, 5, 6, 8, 10], ZMIN = 0.1, ZMAX = 10;
  function sheetInfo(pg) { return (pg.name ? pg.name + ' ' : '') + Math.round(pg.w) + ' × ' + Math.round(pg.h) + ' mm'; }
  function viewerHTML(r, mode, pi) {
    var pg = r.pages[pi] || r.pages[0];
    return '<div class="sld-bar"><button type="button" class="sld-b pri" data-sld-pdf>' + IC.dl + escH(Lx('Export PDF', '导出PDF')) + '</button>' +
      (DWG ? '<button type="button" class="sld-b pri" data-sld-dwg title="' + escH(Lx('AutoCAD drawing (DWG 2000): each sheet is a block (BEDIT); the title block fields are attributes', 'AutoCAD图纸（DWG 2000）：每张图为一个块（BEDIT），图签字段为属性')) + '">' + IC.dl + escH(Lx('Export DWG', '导出DWG')) + '</button>' : '') +
      (r.pages.length > 1 ? '<span class="sld-tabs" role="tablist">' + r.pages.map(function (q, i) { return '<button type="button" role="tab" class="sld-b' + (i === pi ? ' on' : '') + '" aria-selected="' + (i === pi) + '" data-sld-pg="' + i + '">' + escH(i ? Lx('Sheet 2 · schedule', '第2张·设备表') : Lx('Sheet 1 · diagram', '第1张·单线图')) + '</button>'; }).join('') + '</span>' : '') +
      '<span class="sld-zoom"><button type="button" class="sld-b" data-sld-z="-1" aria-label="' + escH(Lx('Zoom out', '缩小')) + '">−</button><label class="sld-zl" title="' + escH(Lx('Type a zoom (10–1000 %) and press Enter; 100 % = sheet width fitted to the view', '输入缩放比例（10–1000%）后按回车；100% = 图纸宽度适应视图')) + '"><input type="number" inputmode="decimal" data-sld-zin min="10" max="1000" step="5" value="100" aria-label="' + escH(Lx('Zoom, %', '缩放，%')) + '"><span>%</span></label><button type="button" class="sld-b" data-sld-z="1" aria-label="' + escH(Lx('Zoom in', '放大')) + '">+</button><button type="button" class="sld-b" data-sld-z="0">' + escH(Lx('Fit', '适应宽度')) + '</button><button type="button" class="sld-b" data-sld-z="r" title="' + escH(Lx('Actual paper size', '实际图纸尺寸')) + '">1:1</button></span>' +
      (mode === 'page' ? '<button type="button" class="sld-b" data-sld-full>' + IC.full + escH(Lx('Full screen', '全屏')) + '</button>' : '') +
      '<span class="sld-info" data-sld-info>' + escH(sheetInfo(pg)) + '</span><span class="sld-sp"></span>' +
      (mode === 'modal' ? '<button type="button" class="sld-b" data-sldx>✕ ' + escH(Lx('Close', '关闭')) + '</button>' : '') + '</div>' +
      '<div class="sld-view" data-sld-view><div class="sld-canvas" data-sld-canvas>' + pg.svg + '</div></div>';
  }
  function setZoom(host, z, cx, cy) {
    var st = host.__sld, view = host.querySelector('[data-sld-view]'), cv0 = host.querySelector('[data-sld-canvas]'); if (!st || !view || !cv0) return;
    var fx = cx === undefined ? 0.5 : cx, fy = cy === undefined ? 0.5 : cy;
    var px = (view.scrollLeft + fx * view.clientWidth) / Math.max(1, cv0.offsetWidth), py = (view.scrollTop + fy * view.clientHeight) / Math.max(1, cv0.offsetHeight);
    z = Math.max(ZMIN, Math.min(ZMAX, z)); st.z = z; cv0.style.width = (z * 100) + '%';
    var zi = host.querySelector('[data-sld-zin]'); if (zi) zi.value = Math.round(z * 100);
    view.scrollLeft = px * cv0.offsetWidth - fx * view.clientWidth; view.scrollTop = py * cv0.offsetHeight - fy * view.clientHeight;
  }
  function showPage(host, pi) {
    var st = host.__sld, pg = st.r.pages[pi]; if (!pg) return; st.pg = pi;
    host.querySelector('[data-sld-canvas]').innerHTML = pg.svg; var inf = host.querySelector('[data-sld-info]'); if (inf) inf.textContent = sheetInfo(pg);
    Array.prototype.forEach.call(host.querySelectorAll('[data-sld-pg]'), function (b) { var on = +b.getAttribute('data-sld-pg') === pi; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); });
    setZoom(host, 1); var v = host.querySelector('[data-sld-view]'); if (v) { v.scrollLeft = 0; v.scrollTop = 0; }
  }
  function wire(host) {
    if (host.__wired) return; host.__wired = true;
    host.addEventListener('click', function (ev) {
      var t = ev.target.closest('button'); if (!t || !host.contains(t)) return; var st = host.__sld; if (!st) return;
      if (t.hasAttribute('data-sld-pdf')) { try { downloadPDF(st.x, st.opt); } catch (e) { console.error(e); } return; }
      if (t.hasAttribute('data-sld-dwg')) { try { downloadDWG(st.x, st.opt); } catch (e) { console.error(e); } return; }
      if (t.hasAttribute('data-sld-full')) { open(st.x, st.opt, st.pg); return; }
      if (t.hasAttribute('data-sld-pg')) { showPage(host, +t.getAttribute('data-sld-pg')); return; }
      if (t.hasAttribute('data-sld-z')) {
        var v = t.getAttribute('data-sld-z'), view = host.querySelector('[data-sld-view]');
        if (v === 'r') { var pg = st.r.pages[st.pg || 0]; setZoom(host, Math.max(0.25, pg.w * 96 / 25.4 / Math.max(1, view.clientWidth))); }
        else if (v === '0') setZoom(host, 1);
        else setZoom(host, stepZoom(st.z, +v));
      }
    });
    host.addEventListener('wheel', function (ev) {
      if (!ev.ctrlKey) return; var view = host.querySelector('[data-sld-view]'); if (!view || !view.contains(ev.target)) return; ev.preventDefault();
      var st = host.__sld, r = view.getBoundingClientRect(), nz = st.z * Math.pow(1.0015, -Math.max(-240, Math.min(240, ev.deltaY)));
      setZoom(host, nz, (ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height);
    }, { passive: false });
    function typed(inp) { var v = parseFloat(String(inp.value).replace(',', '.')); if (!isFinite(v) || v <= 0) { inp.value = Math.round(host.__sld.z * 100); return; } setZoom(host, v / 100); inp.value = Math.round(host.__sld.z * 100); }
    host.addEventListener('change', function (ev) { var inp = ev.target.closest && ev.target.closest('[data-sld-zin]'); if (inp && host.__sld) typed(inp); });
    host.addEventListener('keydown', function (ev) { var inp = ev.target.closest && ev.target.closest('[data-sld-zin]'); if (!inp || !host.__sld) return; if (ev.key === 'Enter') { ev.preventDefault(); typed(inp); inp.select(); } else if (ev.key === 'Escape') { inp.value = Math.round(host.__sld.z * 100); inp.blur(); } ev.stopPropagation(); });
    var drag = null;
    host.addEventListener('pointerdown', function (ev) { var view = ev.target.closest('[data-sld-view]'); if (!view || ev.button !== 0 || ev.pointerType === 'touch' || ev.target.closest('input, button')) return; drag = { v: view, x: ev.clientX, y: ev.clientY, l: view.scrollLeft, t: view.scrollTop }; view.classList.add('drag'); });
    window.addEventListener('pointermove', function (ev) { if (!drag) return; drag.v.scrollLeft = drag.l - (ev.clientX - drag.x); drag.v.scrollTop = drag.t - (ev.clientY - drag.y); });
    window.addEventListener('pointerup', function () { if (drag) { drag.v.classList.remove('drag'); drag = null; } });
  }
  function stepZoom(z, d) { var i; if (d > 0) { for (i = 0; i < ZOOM.length; i++) if (ZOOM[i] > z + 0.001) return ZOOM[i]; return ZOOM[ZOOM.length - 1]; } for (i = ZOOM.length - 1; i >= 0; i--) if (ZOOM[i] < z - 0.001) return ZOOM[i]; return ZOOM[0]; }
  /* live view (simulation): redraw the sheets of the changed design in place, keeping the sheet, zoom and scroll position */
  function update(host, x, opt) {
    var st = host.__sld, view = st && host.querySelector('[data-sld-view]'), cv0 = st && host.querySelector('[data-sld-canvas]');
    if (!st || !view || !cv0 || (opt && opt.lang) !== (st.opt && st.opt.lang)) return mount(host, x, opt, 'page');
    var r = buildSVG(x, opt || {}), pi = st.pg < r.pages.length ? st.pg : 0, sl = view.scrollLeft, stp = view.scrollTop;
    st.x = x; st.opt = opt || {}; st.r = r; st.pg = pi; cv0.innerHTML = r.pages[pi].svg;
    var inf = host.querySelector('[data-sld-info]'); if (inf) inf.textContent = sheetInfo(r.pages[pi]);
    view.scrollLeft = sl; view.scrollTop = stp;
    return r;
  }
  function mount(host, x, opt, mode) {
    opt = opt || {};
    var old = host.__sld, z = old ? old.z : 1, pi = old ? old.pg || 0 : 0, r = buildSVG(x, opt);
    if (pi >= r.pages.length) pi = 0;
    host.innerHTML = viewerHTML(r, mode || 'page', pi); host.__sld = { x: x, opt: opt, z: 1, pg: pi, r: r }; wire(host);
    if (z !== 1) setZoom(host, z);
    return r;
  }
  var MODAL = null;
  function escKey(ev) { if (ev.key === 'Escape') { ev.stopPropagation(); ev.preventDefault(); close(); } }
  function close() { if (!MODAL) return; MODAL.remove(); MODAL = null; document.removeEventListener('keydown', escKey, true); document.documentElement.classList.remove('sld-lock'); }
  function open(x, opt, pi) {
    close(); opt = opt || {}; pi = pi || 0;
    var d = document.createElement('div'), r = buildSVG(x, opt); d.className = 'sld-modal'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', Lx('Single-line diagram', '单线图'));
    d.innerHTML = '<div class="sld-box"><div class="sld-head"><b>' + escH(Lx('Single-line diagram', '单线图')) + '</b><span>' + escH(opt.name || '') + '</span></div><div class="sld-host">' + viewerHTML(r, 'modal', pi) + '</div></div>';
    var host = d.querySelector('.sld-host'); host.__sld = { x: x, opt: opt, z: 1, pg: pi, r: r }; wire(host);
    d.addEventListener('click', function (ev) { if (ev.target === d || ev.target.closest('[data-sldx]')) close(); });
    document.addEventListener('keydown', escKey, true); document.body.appendChild(d); MODAL = d; document.documentElement.classList.add('sld-lock');
    var b = d.querySelector('[data-sldx]'); if (b) b.focus();
  }
  g.DCSLD = { design: designOf, build: build, buildSVG: buildSVG, buildDWG: buildDWG, mount: mount, update: update, open: open, close: close, downloadPDF: downloadPDF, downloadDWG: downloadDWG, fileName: fileName };
  if (typeof module !== 'undefined' && module.exports) module.exports = g.DCSLD;
})(typeof window !== 'undefined' ? window : globalThis);
