/* DCSLD — integrated single-line diagram (SLD) of every design (templates, user-modified designs, assessment projects and the live simulation):
   one drawing from the PLN connection through the EHV breaker-and-a-half GIS and interbus transformers, the HV GIS and HV/MV transformers, the 20 kV
   sections and (campus scale) a typical building 20 kV board, down to a typical MV/LV block with UPS, generators and IT racks — every component rated
   (A, kV, kA, MVA, CT / VT ratios and classes, insulation levels, arresters) with bilingual schedules on the sheet. Drawing conventions follow the reference
   SLDs (150 kV 1,050 MVA data-center substation; 500 kV breaker-and-a-half GITET) and AutoCAD practice: ISO sheet (A2–A0 by content), zone frame,
   title block, EN / 中文 labels, colour by voltage, IEC 60617 symbols, hops at crossings. Output: SVG (shown in the website) and PDF (download, with
   the A3 equipment schedule as sheet 2) through DCSvg / DCPdf. */
(function (g) {
  'use strict';
  var E = g.DCEngine, PDF = g.DCPdf, SVG = g.DCSvg;
  var COL = { 500: '#C00000', 275: '#C00000', 230: '#0047AB', 150: '#0047AB', 70: '#00838F', 20: '#1B7F2A', 6.6: '#B35900', 0.4: '#6A1B9A', dc: '#37474F', k: '#111111', mut: '#555555' }, ZC = '#3A3F8F';
  function F(x, d) { return E.fmt(x, d || 0); }
  function pickN(list, v) { for (var i = 0; i < list.length; i++) if (list[i] >= v) return list[i]; return list[list.length - 1]; }
  function cv(kv) { return COL[kv] || COL.k; }
  function fmtN(x) { return String(Math.round(x * 10) / 10); }
  var IR = [1250, 2000, 2500, 3150, 4000, 5000], CTP = [400, 600, 800, 1000, 1200, 1600, 2000, 2500, 3000, 4000, 5000];

  /* ------------------------------------------------------------------ drawing primitives (vertical symbols, top → bottom) */
  function Sym(pg) { this.pg = pg; }
  var S = Sym.prototype;
  S.ln = function (x1, y1, x2, y2, c, w, dash) { this.pg.line(x1, y1, x2, y2, { c: c || COL.k, w: w || 0.3, dash: dash }); };
  S.t = function (x, y, s, h, o) { o = o || {}; this.pg.text(x, y, s, { h: h || 2, a: o.a, v: o.v, b: o.b, c: o.c || COL.k, rot: o.rot }); };
  /* text fitted to a width: the font shrinks (to 60 % at most) so the string stays inside w */
  S.tf = function (x, y, s, h, w, o) { var tw = this.pg.textW(s, h, o && o.b); if (tw > w) h = Math.max(h * w / tw, h * 0.6); this.t(x, y, s, h, o); };
  S.bi = function (x, y, en, zh, h, o) { o = o || {}; this.t(x, y, en, h || 2, o); if (zh) this.t(x, y + (h || 2) * 1.05, zh, (h || 2) * 0.92, { a: o.a, c: o.zc || ZC, v: o.v }); };
  S.gnd = function (x, y, c) { this.ln(x, y, x, y + 1.2, c); this.ln(x - 2, y + 1.2, x + 2, y + 1.2, c); this.ln(x - 1.3, y + 2, x + 1.3, y + 2, c); this.ln(x - 0.6, y + 2.8, x + 0.6, y + 2.8, c); };
  S.gndH = function (x, y, c) { this.ln(x, y, x + 1.2, y, c); this.ln(x + 1.2, y - 2, x + 1.2, y + 2, c); this.ln(x + 2, y - 1.3, x + 2, y + 1.3, c); this.ln(x + 2.8, y - 0.6, x + 2.8, y + 0.6, c); };
  S.dot = function (x, y, c) { this.pg.circle(x, y, 0.45, { c: c, w: 0.2, fill: c || COL.k }); };
  /* switching devices, scale k (default 1 → 9 mm, withdrawable 13 mm): 'cb' circuit breaker (× at the fixed contact), 'ds' disconnector (bar),
     'wcb' withdrawable breaker (plug-in contacts), 'lbs' load-break switch (circle) */
  S.sw = function (x, y, kind, c, k) {
    k = k || 1;
    var L = (kind === 'wcb' ? 13 : 9) * k, o = (kind === 'wcb' ? 2 : 0) * k, a = y + 2.5 * k + o, b = y + 6.5 * k + o;
    if (kind === 'wcb') this.chev(x, y + k, c, true, k);
    this.ln(x, y, x, a, c); this.ln(x, b, x, y + L, c);
    this.ln(x, b, x - 2.6 * k, a + 0.4 * k, c, 0.35);
    if (kind === 'ds') this.ln(x - 1.2 * k, a, x + 1.2 * k, a, c);
    else if (kind === 'lbs') this.pg.circle(x, a, 0.5 * k, { c: c, w: 0.25 });
    else { this.ln(x - 0.8 * k, a - 0.8 * k, x + 0.8 * k, a + 0.8 * k, c); this.ln(x - 0.8 * k, a + 0.8 * k, x + 0.8 * k, a - 0.8 * k, c); }
    if (kind === 'wcb') this.chev(x, y + L - k, c, false, k);
    return L;
  };
  S.chev = function (x, y, c, down, k) { k = k || 1; var d = (down ? 1 : -1) * k, w = 1.1 * k; this.ln(x - w, y - 0.8 * d, x, y, c); this.ln(x, y, x + w, y - 0.8 * d, c); this.ln(x - w, y + 0.2 * d, x, y + d, c); this.ln(x, y + d, x + w, y + 0.2 * d, c); };
  /* horizontal circuit breaker (7 mm), open = drawn normally open */
  S.cbH = function (x, y, c, open) { this.ln(x, y, x + 2, y, c); this.ln(x + 1.2, y - 0.8, x + 2.8, y + 0.8, c); this.ln(x + 1.2, y + 0.8, x + 2.8, y - 0.8, c); this.ln(x + 5.4, y, x + 2.3, open ? y - 2.2 : y - 0.4, c, 0.35); this.ln(x + 5.4, y, x + 7, y, c); };
  /* earthing switch on a side branch (dir +1 right, −1 left) */
  S.es = function (x, y, dir, c, tag) {
    var d = dir || 1; this.ln(x, y, x + 2.2 * d, y, c); this.ln(x + 2.2 * d, y, x + 5.2 * d, y - 2.1, c, 0.3); this.ln(x + 5.6 * d, y, x + 6.2 * d, y, c);
    if (d > 0) this.gndH(x + 6.2, y, c); else { this.ln(x - 6.2, y, x - 7.4, y, c); this.ln(x - 7.4, y - 2, x - 7.4, y + 2, c); this.ln(x - 8.2, y - 1.3, x - 8.2, y + 1.3, c); this.ln(x - 9, y - 0.6, x - 9, y + 0.6, c); }
    if (tag) this.t(x + (d > 0 ? 2.2 : -9.5), y - 2.6, tag, 1.4, { c: COL.mut });
  };
  /* current transformer: n cores as circles threaded on the conductor (radius r); returns the height */
  S.ct = function (x, y, n, c, r) { r = r || 1.05; var p = 2 * r + 0.1, h = p * n + 0.3; this.ln(x, y, x, y + h, c); for (var i = 0; i < n; i++) this.pg.circle(x, y + 0.15 + r + i * p, r, { c: c, w: 0.25 }); return h; };
  /* voltage transformer on a side branch: two (or three) interlaced windings */
  S.vt = function (x, y, dir, c, three) {
    var d = dir || 1, cx = x + 6 * d; this.ln(x, y, cx - 1.6 * d, y, c);
    this.pg.circle(cx, y, 1.6, { c: c, w: 0.25 }); this.pg.circle(cx + 2.2 * d, y, 1.6, { c: c, w: 0.25 }); if (three) this.pg.circle(cx + 1.1 * d, y + 1.9, 1.6, { c: c, w: 0.25 });
  };
  /* surge arrester on a side branch with earth (off = branch length) */
  S.sa = function (x, y, dir, c, off) {
    var d = dir || -1, bx = x + (off || 5) * d; this.ln(x, y, bx, y, c); this.ln(bx, y, bx, y + 1, c);
    this.pg.rect(bx - 1.1, y + 1, 2.2, 4.4, { c: c, w: 0.25 }); this.ln(bx, y + 1.6, bx, y + 4.2, c, 0.25);
    this.pg.poly([[bx - 0.7, y + 3.4], [bx, y + 4.6], [bx + 0.7, y + 3.4]], { c: c, w: 0.2, fill: c, close: true });
    this.gnd(bx, y + 5.4, c);
  };
  S.cable = function (x, y, c) { this.pg.poly([[x, y], [x + 1.4, y + 2.2], [x, y + 4.4], [x - 1.4, y + 2.2]], { c: c, w: 0.3, close: true }); return 4.4; };
  S.arrowUp = function (x, y, c) { this.pg.poly([[x - 1.4, y + 3], [x, y], [x + 1.4, y + 3]], { c: c, w: 0.3, close: true }); };
  S.arrowDn = function (x, y, c) { this.pg.poly([[x - 1.2, y - 2.4], [x, y], [x + 1.2, y - 2.4]], { c: c, w: 0.3, fill: c, close: true }); };
  S.fuse = function (x, y, c) { this.pg.rect(x - 0.9, y, 1.8, 4, { c: c, w: 0.25 }); this.ln(x, y - 0.6, x, y + 4.6, c, 0.2); return 4; };
  S.cap = function (x, y, c) { this.ln(x, y, x, y + 2, c); this.ln(x - 2.2, y + 2, x + 2.2, y + 2, c, 0.45); this.ln(x - 2.2, y + 3.1, x + 2.2, y + 3.1, c, 0.45); this.ln(x, y + 3.1, x, y + 5, c); return 5; };
  S.res = function (x, y, c) { this.pg.rect(x - 1, y, 2, 4.6, { c: c, w: 0.25 }); return 4.6; };
  S.gen = function (x, y, c, r) { r = r || 4; this.pg.circle(x, y + r, r, { c: c, w: 0.35 }); this.t(x, y + r + 0.15 * r, 'G', 0.62 * r, { a: 'c', b: true, c: c }); this.t(x, y + 1.62 * r, '~', 0.5 * r, { a: 'c', c: c }); return 2 * r; };
  S.box = function (x, y, w, h, lab, c, sub) { this.pg.rect(x - w / 2, y, w, h, { c: c, w: 0.35 }); this.t(x, y + h / 2 + (sub ? -0.6 : 0.7), lab, 2.2, { a: 'c', b: true, c: c }); if (sub) this.tf(x, y + h / 2 + 2.2, sub, 1.6, w - 1, { a: 'c', c: c }); return h; };
  S.bat = function (x, y, c) { for (var i = 0; i < 3; i++) { this.ln(x - 2, y + i * 1.6, x + 2, y + i * 1.6, c, 0.4); this.ln(x - 1, y + i * 1.6 + 0.7, x + 1, y + i * 1.6 + 0.7, c, 0.6); } return 4.4; };
  /* line trap: three half-turns on the conductor */
  S.coil = function (x, y, c, r) { r = r || 0.9; for (var i = 0; i < 3; i++) this.pg.arc(x, y + r + i * 2 * r, r, 90, -90, { c: c, w: 0.3 }); return 6 * r; };
  /* vertical conductor with hops (semicircles) where it crosses a busbar or conductor without connection */
  S.vline = function (x, y1, y2, c, hops, w) {
    var a = Math.min(y1, y2), b = Math.max(y1, y2), self = this, cur = a;
    (hops || []).filter(function (h) { return h > a + 1.6 && h < b - 1.6; }).sort(function (p, q) { return p - q; }).forEach(function (h) {
      self.ln(x, cur, x, h - 1.6, c, w); self.pg.arc(x, h, 1.6, 90, -90, { c: c, w: w || 0.3 }); cur = h + 1.6;
    });
    this.ln(x, cur, x, b, c, w);
  };
  /* windings: 'Y' (star with neutral), 'D' (delta), 'Z' (zig-zag) inside a circle */
  S.wind = function (cx, cy, k, c) {
    if (k === 'D') this.pg.poly([[cx, cy - 1.6], [cx + 1.5, cy + 1], [cx - 1.5, cy + 1]], { c: c, w: 0.25, close: true });
    else if (k === 'Z') { this.ln(cx - 1.2, cy - 1.2, cx + 1.2, cy - 1.2, c, 0.25); this.ln(cx + 1.2, cy - 1.2, cx - 1.2, cy + 1.2, c, 0.25); this.ln(cx - 1.2, cy + 1.2, cx + 1.2, cy + 1.2, c, 0.25); }
    else { this.ln(cx, cy, cx, cy - 1.7, c, 0.25); this.ln(cx, cy, cx - 1.5, cy + 0.9, c, 0.25); this.ln(cx, cy, cx + 1.5, cy + 0.9, c, 0.25); }
  };
  /* two-winding transformer (14 mm) */
  S.tr2 = function (x, y, cH, cL, wH, wL, oltc) {
    this.pg.circle(x, y + 4.2, 4.2, { c: cH, w: 0.35 }); this.pg.circle(x, y + 9.8, 4.2, { c: cL, w: 0.35 });
    this.wind(x, y + 3.6, wH || 'Y', cH); this.wind(x, y + 10.6, wL || 'D', cL);
    if (oltc) { this.ln(x - 5, y + 11, x + 5, y + 2.8, COL.k, 0.25); this.pg.poly([[x + 5, y + 2.8], [x + 3.6, y + 3.1], [x + 4.3, y + 4.2]], { c: COL.k, w: 0.2, fill: COL.k, close: true }); }
    return 14;
  };
  /* three-winding / dual-LV transformer: HV on top, two windings below left / right (leads at x ± 3.6, from y + 14.8) */
  S.tr3 = function (x, y, cH, cL, w2, oltc, cL2, w3) {
    this.pg.circle(x, y + 4.4, 4.4, { c: cH, w: 0.35 }); this.pg.circle(x - 3.6, y + 10.4, 4.4, { c: cL, w: 0.35 }); this.pg.circle(x + 3.6, y + 10.4, 4.4, { c: cL2 || cL, w: 0.35 });
    this.wind(x, y + 3.8, 'Y', cH); this.wind(x - 3.9, y + 11, w2 || 'D', cL); this.wind(x + 3.9, y + 11, w3 || w2 || 'D', cL2 || cL);
    if (oltc) { this.ln(x - 6.5, y + 12.5, x + 6.5, y + 1.8, COL.k, 0.25); this.pg.poly([[x + 6.5, y + 1.8], [x + 5.1, y + 2.1], [x + 5.8, y + 3.2]], { c: COL.k, w: 0.2, fill: COL.k, close: true }); }
    return 15;
  };
  S.bus = function (x1, x2, y, c, w) { this.pg.rect(x1, y - (w || 0.9) / 2, x2 - x1, w || 0.9, { c: c, w: 0.2, fill: c }); };

  /* ------------------------------------------------------------------ sheet frame (any size), title block, notes, legend, schedules */
  function frame(pg, meta, no, total, title, W, H) {
    var s = new Sym(pg); if (meta.titles) meta.titles.push(title);
    pg.rect(5, 5, W - 10, H - 10, { c: COL.k, w: 0.25 }); pg.rect(10, 10, W - 20, H - 20, { c: COL.k, w: 0.6 });
    var nc = Math.max(4, Math.round((W - 20) / 50)), zw = (W - 20) / nc, nr = Math.max(4, Math.round((H - 20) / 50)), zh = (H - 20) / nr, LET = 'ABCDEFGHJKLMNPQRSTUV';
    for (var i = 0; i < nc; i++) { var zx = 10 + i * zw; if (i) { s.ln(zx, 5, zx, 10, COL.k, 0.2); s.ln(zx, H - 10, zx, H - 5, COL.k, 0.2); } s.t(zx + zw / 2, 8.6, String(i + 1), 2.4, { a: 'c' }); s.t(zx + zw / 2, H - 6.4, String(i + 1), 2.4, { a: 'c' }); }
    for (var j = 0; j < nr; j++) { var zy = 10 + j * zh; if (j) { s.ln(5, zy, 10, zy, COL.k, 0.2); s.ln(W - 10, zy, W - 5, zy, COL.k, 0.2); } s.t(7.5, zy + zh / 2, LET.charAt(j), 2.4, { a: 'c', v: 'm' }); s.t(W - 7.5, zy + zh / 2, LET.charAt(j), 2.4, { a: 'c', v: 'm' }); }
    /* title block 150 × 46 bottom right */
    var X = W - 160, Y = H - 56, Wt = 150;
    pg.rect(X, Y, Wt, 46, { c: COL.k, w: 0.5 });
    [7, 15, 25, 33].forEach(function (d) { s.ln(X, Y + d, X + Wt, Y + d, COL.k, 0.2); });
    s.ln(X + 95, Y + 33, X + 95, Y + 46, COL.k, 0.2); s.ln(X + 120, Y + 33, X + 120, Y + 46, COL.k, 0.2);
    s.t(X + 2, Y + 4.6, 'PT CCEPC INDONESIA', 2.8, { b: true }); s.t(X + Wt - 2, Y + 4.6, 'Data Center Project Assessment | 数据中心项目评估', 1.8, { a: 'r', c: COL.mut });
    s.t(X + 2, Y + 10.3, 'PROJECT / 项目', 1.4, { c: COL.mut }); s.tf(X + 2, Y + 13.6, meta.project, 2.3, Wt - 4, { b: true });
    s.t(X + 2, Y + 18.2, 'TITLE / 图名', 1.4, { c: COL.mut }); s.tf(X + 2, Y + 21.6, title[0], 2.5, Wt - 4, { b: true }); s.tf(X + 2, Y + 24.2, title[1], 1.9, Wt - 4, { c: ZC });
    s.tf(X + 2, Y + 28.4, meta.basis, 1.8, Wt - 4); s.t(X + 2, Y + 31.3, 'Status: FOR PLANNING — NOT FOR CONSTRUCTION | 状态：规划用图——不得用于施工', 1.6, { c: '#B0302A' });
    s.t(X + 2, Y + 36.4, 'DWG No. / 图号', 1.4, { c: COL.mut }); s.t(X + 2, Y + 40, meta.dwg + '-' + ('0' + no).slice(-2), 2.4, { b: true }); s.t(X + 2, Y + 44.2, 'Generated ' + meta.date + (meta.rev ? ' | KB Rev. ' + meta.rev : ''), 1.5, { c: COL.mut });
    s.t(X + 97, Y + 36.4, 'SCALE / 比例', 1.4, { c: COL.mut }); s.t(X + 97, Y + 41.5, 'NTS', 2.6, { b: true });
    s.t(X + 122, Y + 36.4, 'SHEET / 张次', 1.4, { c: COL.mut }); s.t(X + 122, Y + 41.5, no + ' / ' + total, 2.6, { b: true });
    return s;
  }
  function notes(s, items, x, y, w) {
    s.t(x, y, 'NOTES / 说明', 2.2, { b: true });
    var yy = y + 4;
    items.forEach(function (it, i) {
      s.tf(x, yy, (i + 1) + '. ' + it[0], 1.6, w); yy += 2.4;
      if (it[1]) { s.tf(x + 3, yy, it[1], 1.5, w - 3, { c: ZC }); yy += 2.6; }
    });
    return yy;
  }
  function legend(s, x, y) {
    s.t(x, y, 'LEGEND / 图例', 2.2, { b: true });
    var c = COL.k, r = [
      [function (X, Y) { s.sw(X, Y - 3.4, 'cb', c, 0.75); }, 'Circuit breaker', '断路器'],
      [function (X, Y) { s.sw(X, Y - 3.4, 'ds', c, 0.75); }, 'Disconnector', '隔离开关'],
      [function (X, Y) { s.sw(X, Y - 3.9, 'wcb', c, 0.6); }, 'Withdrawable breaker', '手车式断路器'],
      [function (X, Y) { s.es(X - 4, Y + 1, 1, c); }, 'Earthing switch', '接地开关'],
      [function (X, Y) { s.ln(X, Y - 3, X, Y + 3, c); s.ct(X, Y - 2.3, 2, c); }, 'Current transformer', '电流互感器'],
      [function (X, Y) { s.vt(X - 4, Y, 1, c); }, 'Voltage transformer', '电压互感器'],
      [function (X, Y) { s.sa(X + 2, Y - 3, -1, c, 3); }, 'Surge arrester', '避雷器'],
      [function (X, Y) { s.ln(X, Y - 3.2, X, Y - 2.2, c); s.cable(X, Y - 2.2, c); s.ln(X, Y + 2.2, X, Y + 3.2, c); }, 'Cable termination', '电缆终端'],
      [function (X, Y) { s.pg.circle(X, Y - 1.5, 2, { c: c, w: 0.3 }); s.pg.circle(X, Y + 1.3, 2, { c: c, w: 0.3 }); }, 'Transformer', '变压器'],
      [function (X, Y) { s.pg.circle(X, Y, 2, { c: c, w: 0.3 }); s.wind(X, Y, 'Z', c); }, 'Earthing transformer', '接地变压器'],
      [function (X, Y) { s.res(X, Y - 2.3, c); }, 'Neutral earthing resistor', '中性点接地电阻'],
      [function (X, Y) { s.ln(X, Y - 3.6, X, Y - 2.7, c); s.coil(X, Y - 2.7, c); s.ln(X, Y + 2.7, X, Y + 3.6, c); }, 'Line trap', '阻波器'],
      [function (X, Y) { s.ln(X, Y - 3, X, Y - 2, c); s.fuse(X, Y - 2, c); s.ln(X, Y + 2, X, Y + 3, c); }, 'Fuse', '熔断器'],
      [function (X, Y) { s.gen(X, Y - 2.6, c, 2.6); }, 'Generator', '发电机'],
      [function (X, Y) { s.cap(X, Y - 2.5, c); }, 'Capacitor bank', '电容器组'],
      [function (X, Y) { s.ln(X - 3, Y, X + 3, Y, c, 0.5); s.vline(X, Y - 3.4, Y + 3.4, c, [Y]); }, 'Crossing, not connected', '交叉不连接'],
      [function (X, Y) { s.ln(X - 3, Y, X + 3, Y, c, 0.3, [1, 0.7]); }, 'Typical connection (repeated)', '典型连接（重复）'],
      [function (X, Y) { s.cbH(X - 3.5, Y, c, true); }, 'Normally open (N.O.)', '常开（N.O.）']];
    r.forEach(function (it, i) { var col = i % 3, row = Math.floor(i / 3), X = x + 3 + col * 30, Y = y + 6.6 + row * 7.2; it[0](X, Y); s.t(X + 6.6, Y - 0.3, it[1], 1.4); s.t(X + 6.6, Y + 1.8, it[2], 1.3, { c: ZC }); });
  }
  /* bilingual equipment schedule: rows [en, zh, rating]; returns the bottom y */
  function schedBox(s, x, y, w, title, rows, c, rh) {
    rh = rh || (rows.length > 7 ? 4.7 : 5.2);
    s.pg.rect(x, y, w, 5, { c: c || COL.k, w: 0.3, fill: '#EEF0FA' }); s.tf(x + 1.5, y + 3.5, title[0] + '  |  ' + title[1], 1.75, w - 3, { b: true, c: c || COL.k });
    var yy = y + 5, lw = 0;
    rows.forEach(function (r) { lw = Math.max(lw, s.pg.textW(r[0], 1.35, true)); });
    var rx = x + 1.5 + Math.min(w * 0.36, Math.max(22, lw + 2.5));
    rows.forEach(function (r) {
      s.tf(x + 1.5, yy + rh * 0.45, r[0], 1.35, rx - x - 2.5, { b: true }); s.tf(x + 1.5, yy + rh * 0.86, r[1], 1.25, rx - x - 2.5, { c: ZC });
      s.tf(rx, yy + rh * 0.62, r[2], 1.35, x + w - rx - 1.2); yy += rh; s.ln(x, yy, x + w, yy, '#C8CBE0', 0.12);
    });
    s.ln(rx - 1, y + 5, rx - 1, yy, '#C8CBE0', 0.12);
    s.pg.rect(x, y, w, yy - y, { c: c || COL.k, w: 0.3 });
    return yy;
  }
  function spread(n, x0, x1, maxSp) { var sp = n > 1 ? Math.min(maxSp, (x1 - x0) / (n - 1)) : 0, start = x0 + ((x1 - x0) - sp * (n - 1)) / 2; return { sp: sp, x: function (i) { return start + i * sp; } }; }
  function header(s, en, zh, c, W) { s.tf(15, 17, en, 3, (W || 420) - 30, { b: true, c: c }); s.tf(15, 20.6, zh, 2.1, (W || 420) - 30, { c: ZC }); }
  /* orthogonal routes (e.g. typical connections); vertical segments hop over the horizontal segments of the other routes */
  function routes(s, list, c, dash, w) {
    var hs = [];
    list.forEach(function (r, ri) { for (var i = 1; i < r.length; i++) if (r[i][1] === r[i - 1][1]) hs.push({ ri: ri, y: r[i][1], x0: Math.min(r[i][0], r[i - 1][0]), x1: Math.max(r[i][0], r[i - 1][0]) }); });
    list.forEach(function (r, ri) {
      for (var i = 1; i < r.length; i++) {
        var a = r[i - 1], b = r[i];
        if (a[1] === b[1]) { s.ln(a[0], a[1], b[0], b[1], c, w, dash); continue; }
        var hops = hs.filter(function (h) { return h.ri !== ri && a[0] > h.x0 + 0.5 && a[0] < h.x1 - 0.5; }).map(function (h) { return h.y; });
        if (dash) s.ln(a[0], a[1], b[0], b[1], c, w, dash); else s.vline(a[0], a[1], b[1], c, hops, w);
      }
    });
  }

  /* ------------------------------------------------------------------ design data and component ratings */
  function design(x, meta) {
    var R = x.R, p = x.p, el = R.el, hv = el.hv, gi = R.gimp || {};
    return { R: R, p: p, el: el, hv: hv, gi: gi, meta: meta, kv: hv.kv, ehv: !!hv.ibt, ht: hv.ht, mv: hv.mv,
      dbl: /Double busbar/.test(hv.scheme[0]), bah: /Breaker-and-a-half/.test(hv.scheme[0]) };
  }
  /* rated insulation levels, IEC 62271-1 (series I): lightning impulse / power-frequency (or switching impulse from 300 kV) */
  var INS = { 24: 'LI 125 kV / AC 50 kV', 72.5: 'LI 325 kV / AC 140 kV', 170: 'LI 750 kV / AC 325 kV', 245: 'LI 1,050 kV / AC 460 kV', 300: 'LI 1,050 kV / SI 850 kV', 550: 'LI 1,550 kV / SI 1,175 kV' };
  /* metal-oxide surge arresters, IEC 60099-4: Ur ≈ 0.8 Um on effectively earthed systems (reference 150 kV: 150 kV / Ures 416 kV), 24 kV on resistance-earthed 20 kV */
  function saOf(kv) { return kv >= 500 ? 'Ur 420–444 kV, In 20 kA' : (kv >= 275 ? 'Ur ≈ 240 kV, In 20 kA' : (kv >= 230 ? 'Ur ≈ 192 kV, In 10 kA' : (kv >= 150 ? 'Ur 150 kV, In 10 kA, Ures ≤ 416 kV' : (kv >= 70 ? 'Ur ≈ 60 kV, In 10 kA' : 'Ur 24 kV, In 10 kA')))); }
  function vtOf(kv) { return kv > 20 ? kv + '/√3 / 0.1/√3 / 0.1/√3 / 0.1 kV' : '20/√3 / 0.1/√3 / 0.1/3 kV'; }
  var PROT = { tx: '50/51, 50N/51N, TX temperature trip', db: '50/51, 50N/51N, 67 (paralleled generators)', ch: '50/51, 50N/51N, 87T ≥ 5 MVA', gen: '87G, 51V, 32, 40, 46, 27/59, 81, 25',
    st: '50/51, 50N/51N', cap: '50/51, 59, 27, 60 unbalance', bess: '50/51, 67, 27/59, 81', sp: 'equipped as a transformer feeder' };
  /* feeders of the shared 20 kV plan (DCEngine.mvPlan) placed on the sections: capacitor steps and station transformers on fixed sections, the two feeders
     of each building board on sections of different HV/MV transformers, the rest round-robin */
  function feederPlan(d) {
    var mp = E.mvPlan(d.R), nS = d.mv.boards, ht = d.ht, per = ht ? ht.sec : 1, secs = [], rr = 0, capI = 0;
    for (var i = 0; i < nS; i++) secs.push({ i: i, groups: {}, n: 0 });
    function put(f, sx) { var sg = secs[sx].groups, key = f.k + '|' + f.l1 + '|' + f.l2; if (!sg[key]) sg[key] = { f: f, n: 0 }; sg[key].n++; secs[sx].n++; }
    mp.feeders.forEach(function (f) {
      var ci = f.k === 'cap' ? capI++ : 0;
      for (var q = 0; q < f.n; q++) {
        if (f.k === 'cap') put(f, Math.min(nS - 1, q * per + (per > 1 ? ci % per : 0)));
        else if (f.k === 'st') put(f, q ? Math.min(nS - 1, per) : 0);
        else if (f.k === 'db') { var m = Math.floor(q / 2); put(f, q % 2 ? (m % nS + per) % nS : m % nS); }
        else { put(f, rr % nS); rr++; }
      }
    });
    var order = ['db', 'tx', 'gen', 'ch', 'bess', 'st', 'cap', 'sp'];
    secs.forEach(function (sc) { sc.groups = Object.keys(sc.groups).map(function (k) { return sc.groups[k]; }).sort(function (p, q) { return order.indexOf(p.f.k) - order.indexOf(q.f.k); }); });
    return { mp: mp, secs: secs };
  }

  /* ================================================================== integrated single-line diagram: PLN → EHV → HV → 20 kV → building board → LV */
  var CODE = { tx: 'TX', gen: 'G', ch: 'CH', bess: 'BS', st: 'ST', cap: 'C', sp: 'SP', db: 'DB' };
  var DESC = { tx: ['MV/LV transformer', '中/低压变压器'], gen: ['generator', '发电机'], ch: ['20/6.6 kV chiller transformer', '20/6.6 kV冷机变压器'], bess: ['BESS (PCS block)', '储能（PCS单元）'],
    st: ['station transformer', '站用变'], cap: ['capacitor step', '电容器（级）'], sp: ['spare, equipped', '备用（已配置）'], db: ['building 20 kV board feeder', '楼宇20 kV开关柜馈线'] };
  var SIZES = [[594, 420], [841, 594], [1189, 841]];
  function rating(f) { return f.k === 'db' ? F(f.a) + ' A' : (f.k === 'sp' ? '' : f.l1); }
  function secLayout(d, indiv) {
    var fp = feederPlan(d), secs = fp.secs, ht = d.ht, cnt = {}, out = [];
    secs.forEach(function (sc, k) {
      var ni = ht ? 1 : Math.floor(d.hv.circ / secs.length) + (k < d.hv.circ % secs.length ? 1 : 0), items = [];
      sc.groups.forEach(function (gp) {
        var f = gp.f, cd = CODE[f.k] || '?';
        if (indiv) for (var q = 0; q < gp.n; q++) { cnt[cd] = (cnt[cd] || 0) + 1; items.push({ f: f, lab: [cd + cnt[cd], rating(f)] }); }
        else items.push({ f: f, lab: ['× ' + gp.n, cd, rating(f)] });
      });
      out.push({ i: k, ni: ni, items: items, w: 26 + 11 * ni + 9 * Math.max(0, items.length - 1) });
    });
    return { secs: out, mp: fp.mp, indiv: indiv };
  }
  function plan(d) {
    var el = d.el, hv = d.hv, ht = d.ht, db = el.mvdb, P = { hvOn: d.kv > 20, ehv: d.ehv, dbl: d.ehv || d.dbl };
    var split = !!(ht && ht.split), nIBT = d.ehv ? hv.ibt.total : 0;
    /* vertical bands (mm from the top) */
    P.E0 = 26; P.yA = P.E0 + 28; P.yB = P.yA + 87; P.yTe = P.yB + 11;
    P.Hb = d.ehv ? P.E0 + 156 : 26; P.dyH = P.Hb - 25; P.yb1 = 96 + P.dyH; P.yb2 = P.yb1 + (P.dbl ? 7 : 0);
    P.yt = P.yb2 + 42.1; P.ly = P.yt + (split ? 14.8 : 14); P.yd = P.ly + 19;
    P.Mtop = P.hvOn ? P.yd + 3 : 38; P.y20 = P.Mtop + 20.5; P.Mbot = P.y20 + 33; P.D0 = P.Mbot + 22; P.Dbot = P.D0 + 138; P.S0 = P.Dbot + 8;
    var W = 841;   /* working width for the feeder layout decision (A1 usable width) */
    /* 20 kV sections: individual feeders where they fit the sheet, otherwise grouped (quantity × rating) */
    function mvW(L) { return L.secs.reduce(function (a, q) { return a + q.w; }, 0) + 8 * Math.max(0, L.secs.length - 1); }
    var L = secLayout(d, true), extra = P.hvOn ? 150 : 40;
    if (mvW(L) + extra > W - 32) L = secLayout(d, false);
    P.L = L;
    /* x positions */
    function place(x0) {
      var x = x0;
      L.secs.forEach(function (sc) { sc.X = x; sc.inc = []; for (var q = 0; q < sc.ni; q++) sc.inc.push(x + 5 + 11 * q); sc.xv = x + 5 + 11 * sc.ni + 1; sc.fx = sc.items.map(function (it, j) { return sc.xv + 13 + 9 * j; }); x += sc.w + 8; });
      P.mvR = x - 8;
      P.tr = [];
      if (ht) for (var j = 0; j < ht.total; j++) {
        var ks = []; for (var k = j * ht.sec; k < (j + 1) * ht.sec && k < L.secs.length; k++) ks.push(k);
        var xs = ks.map(function (k2) { return L.secs[k2].inc[0]; }), xt = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, h1 = Math.ceil(ks.length / 2);
        P.tr.push({ x: xt, ks: ks, leads: split ? [{ x: xt - 3.6, ks: ks.slice(0, h1), dir: -1 }, { x: xt + 3.6, ks: ks.slice(h1), dir: 1 }] : [{ x: xt, ks: ks, dir: -1 }] });
      }
    }
    place(16 + (P.hvOn ? 34 : 6));
    if (P.hvOn) {
      var xtr = P.tr.map(function (t) { return t.x; }), xl = xtr[xtr.length - 1], nIn = d.ehv ? nIBT : hv.circ;
      P.coup = P.dbl ? xl + 40 : null; P.hvt = P.dbl ? [xl + 62, xl + 84] : [xl + 40];
      if (!d.ehv) {
        var gaps = []; for (var j2 = 0; j2 + 1 < xtr.length; j2++) if (xtr[j2 + 1] - xtr[j2] >= 44) gaps.push((xtr[j2] + xtr[j2 + 1]) / 2);
        var ins = [];
        if (gaps.length >= nIn) for (var i2 = 0; i2 < nIn; i2++) ins.push(gaps[Math.min(gaps.length - 1, Math.round((i2 + 0.5) * gaps.length / nIn - 0.5))]);
        else { ins = gaps.slice(); for (var m = 1; ins.length < nIn; m++) ins.unshift(xtr[0] - 40 * m); }
        P.hin = ins;
        var left = Math.min.apply(null, ins.concat(xtr)) - 30;
        if (left < 16) { var sh = 16 - left; place(16 + (P.hvOn ? 34 : 6) + sh); P.hin = P.hin.map(function (v) { return v + sh; }); P.coup = P.coup !== null ? P.coup + sh : null; P.hvt = P.hvt.map(function (v) { return v + sh; }); xtr = P.tr.map(function (t) { return t.x; }); }
      }
      P.hbL = Math.min.apply(null, (P.hin || []).concat(xtr)) - 30; P.hbR = Math.max.apply(null, P.hvt.concat([xl])) + 16;
      if (d.ehv) {
        /* breaker-and-a-half diameters spread over the HV span; each interbus transformer drops straight into its 150 kV incomer bay */
        var nL = hv.circ, nD = Math.max(hv.bays.diam || 0, Math.ceil((nL + nIBT) / 2)), Ls = [], Ts = [], pr = [];
        for (var a = 1; a <= nL; a++) Ls.push(['L', a]); for (var b = 1; b <= nIBT; b++) Ts.push(['T', b]);
        for (var k3 = 0; k3 < nD; k3++) { var up = null, lo = null, lft = nD - k3 - 1;
          if (Ls.length && Ts.length) { up = Ls.shift(); lo = Ts.shift(); } else if (Ls.length) { up = Ls.shift(); if (Ls.length > lft) lo = Ls.shift(); } else if (Ts.length) { lo = Ts.shift(); if (Ts.length > lft) up = Ts.shift(); }
          pr.push([up, lo]); }
        var sp0 = Math.min(85, Math.max(66, (P.hbR - P.hbL - 120) / Math.max(1, nD - 1))), off = 26, off2 = 50, others = xtr.concat(P.hvt, P.coup !== null ? [P.coup] : []);
        function dia(shift) {
          var out = []; pr.forEach(function (q, k4) { var x = P.hbL + 40 + shift + k4 * sp0, e = [];
            [[q[0], 0], [q[1], 1]].forEach(function (tt) { var f = tt[0]; if (!f) return; var exUp = f[0] === 'L', tx = x + ((exUp && tt[1]) || (!exUp && !tt[1]) ? off2 : off); e.push({ f: f, lower: tt[1], tx: tx, lead: tx - 3.6 }); });
            out.push({ x: x, pr: q, ex: e }); });
          return out;
        }
        var shift = 0, D = dia(0);
        function clash(Dx) { return Dx.some(function (q) { return q.ex.some(function (e) { return e.f[0] === 'T' && others.some(function (o) { return Math.abs(o - e.lead) < 11; }); }); }); }
        for (var it = 0; it < 14 && clash(D); it++) { shift += 7; D = dia(shift); }
        P.dia = D; P.off = off; P.off2 = off2;
        var leads = []; D.forEach(function (q) { q.ex.forEach(function (e) { if (e.f[0] === 'T') leads.push({ n: e.f[1], x: e.lead }); }); });
        leads.sort(function (u, v) { return u.n - v.n; }); P.hin = leads.map(function (l) { return l.x; });
        var exR = Math.max.apply(null, D.map(function (q) { return q.x + off2 + 30; }));
        P.eL = Math.min(P.hbL, D[0].x - 34); P.eV = exR + 6; P.eR = P.eV + 12;
        P.hbL = Math.min(P.hbL, Math.min.apply(null, P.hin) - 30);
      }
    }
    /* downstream: typical building board and typical MV/LV block */
    var bx = 20, nbA = 0, nbB = 0;
    if (db) { var tA = Math.ceil(db.txPer / 2), gA = Math.ceil(db.genPer / 2); nbA = tA + gA + 1; nbB = (db.txPer - tA) + (db.genPer - gA) + 1;
      P.bA = { x: bx, n: nbA, t: tA, g: gA }; P.bB = { x: bx + 40 + (nbA - 1) * 10 + 22, n: nbB, t: db.txPer - tA, g: db.genPer - gA }; P.bR = P.bB.x + 40 + (nbB - 1) * 10; }
    var arch = el.txArch, ncol = arch === '2N' ? 2 : 3;
    P.lvX0 = db ? P.bR + 46 : 20; P.lvC = []; for (var c3 = 0; c3 < ncol; c3++) P.lvC.push(P.lvX0 + 45 + c3 * 112); P.lvR = P.lvC[ncol - 1] + 45;
    /* sheet, schedule placement and scale: the smallest ISO landscape sheet on which the drawing fits at ≥ 100 % (drawing scaled up to fill, ≤ 150 %), with the
       schedules either in a column on the right (narrow drawings) or in a row at the bottom (wide drawings); a wider sheet only if A0 is not wide enough */
    var cw = Math.max(P.mvR, P.hbR || 0, P.eR || 0, P.lvR, P.bR || 0) + 2 - 16, ch = P.Dbot - 26, pick = null;
    for (var si = 0; si < SIZES.length && !pick; si++) {
      var Ws = SIZES[si][0], Hs = SIZES[si][1], kb = Math.min((Ws - 32) / cw, (Hs - 26 - 120) / ch), kr = Math.min((Ws - 32 - 396) / cw, (Hs - 26 - 66) / ch);
      if (Math.max(kb, kr) >= 1) pick = { W: Ws, H: Hs, mode: kr >= kb ? 'right' : 'bottom', k: Math.max(kb, kr) };
    }
    if (!pick) pick = { W: Math.max(1189, Math.ceil((cw + 32) / 10) * 10), H: Math.max(841, Math.ceil((ch + 146) / 10) * 10), mode: 'bottom', k: 1 };
    var k = Math.min(1.5, pick.k), aw = pick.mode === 'right' ? pick.W - 32 - 396 : pick.W - 32;
    P.W = pick.W; P.H = pick.H; P.mode = pick.mode; P.k = k; P.ox = 16 + (aw - k * cw) / 2 - 16 * k; P.oy = 26 - 26 * k;
    return P;
  }
  /* scaled drawing: the same drawing calls, mapped x' = ox + k x, y' = oy + k y with line widths, dashes and text scaled alike */
  function Xform(pg, k, ox, oy) {
    var T = {};
    function X(x) { return ox + k * x; } function Y(y) { return oy + k * y; }
    function O(o) { var r = {}, q; o = o || {}; for (q in o) r[q] = o[q]; r.w = (o.w || 0.25) * k; if (o.dash) r.dash = o.dash.map(function (v) { return v * k; }); return r; }
    T.line = function (x1, y1, x2, y2, o) { pg.line(X(x1), Y(y1), X(x2), Y(y2), O(o)); return T; };
    T.poly = function (pts, o) { pg.poly(pts.map(function (p) { return [X(p[0]), Y(p[1])]; }), O(o)); return T; };
    T.rect = function (x, y, w, h, o) { pg.rect(X(x), Y(y), w * k, h * k, O(o)); return T; };
    T.circle = function (cx, cy, r, o) { pg.circle(X(cx), Y(cy), r * k, O(o)); return T; };
    T.arc = function (cx, cy, r, a0, a1, o) { pg.arc(X(cx), Y(cy), r * k, a0, a1, O(o)); return T; };
    T.text = function (x, y, str, o) { var r = {}, q; o = o || {}; for (q in o) r[q] = o[q]; r.h = (o.h || 2.5) * k; pg.text(X(x), Y(y), str, r); return T; };
    T.textW = function (str, h, b) { return pg.textW(str, h, b); };
    return T;
  }

  /* ---- EHV band: breaker-and-a-half diameters, lines up through bus A, interbus transformers down through bus B */
  function drawEHV(s, d, P) {
    var hv = d.hv, ib = hv.ibt, c = cv(hv.kv), c150 = cv(150), c70 = cv(70), K = 0.75, yA = P.yA, yB = P.yB;
    s.bus(P.eL, P.eR, yA, c, 1); s.bus(P.eL, P.eR, yB, c, 1);
    s.bi(P.eL + 1, yA - 3.6, hv.kv + ' kV BUS A  ' + F(hv.busA) + ' A', 'A母线', 1.9, { c: c, b: true }); s.bi(P.eL + 1, yB + 4.4, hv.kv + ' kV BUS B  ' + F(hv.busA) + ' A', 'B母线', 1.9, { c: c, b: true });
    var xV = P.eV;
    s.dot(xV, yA, c); s.ln(xV, yA, xV, yA + 1.5, c); s.sw(xV, yA + 1.5, 'ds', c, K); s.ln(xV, yA + 8.25, xV, yA + 13, c); s.es(xV, yA + 10.5, -1, c); s.vt(xV, yA + 13, 1, c, true); s.bi(xV + 7, yA + 19.5, 'Bus VT A', 'A母PT', 1.5, { a: 'c', c: c });
    s.dot(xV, yB, c); s.ln(xV, yB, xV, yB - 1.5, c); s.sw(xV, yB - 8.25, 'ds', c, K); s.ln(xV, yB - 8.25, xV, yB - 13, c); s.es(xV, yB - 10.5, -1, c); s.vt(xV, yB - 13, 1, c, true); s.bi(xV + 7, yB - 19.5, 'Bus VT B', 'B母PT', 1.5, { a: 'c', c: c });
    P.dia.forEach(function (q, k) {
      var x = q.x, y = yA + 0.6, tees = [], lab = ['A', 'AB', 'B'];
      s.dot(x, yA, c); s.ln(x, yA, x, y, c);
      s.bi(x, P.E0 + 1.5, 'DIAMETER ' + (k + 1), '第' + (k + 1) + '串', 1.9, { a: 'c', b: true, c: c });
      for (var i = 0; i < 3; i++) {
        s.sw(x, y, 'ds', c, K); y += 9 * K; y += s.ct(x, y, 5, c, 0.72); s.es(x, y, -1, c);
        s.sw(x, y, 'cb', c, K); s.t(x + 2.4, y + 4.4, 'CB ' + lab[i] + (k + 1), 1.4, { b: true, c: c }); if (k === 0 && i === 0) s.t(x + 2.4, y + 6.3, F(hv.busA) + ' A | ' + hv.ik + ' kA', 1.25, { c: c });
        y += 9 * K; s.es(x, y, -1, c); s.sw(x, y, 'ds', c, K); y += 9 * K;
        if (i < 2) { tees.push(y); s.dot(x, y, c); }
      }
      s.ln(x, y, x, yB, c); s.dot(x, yB, c);
      [[q.pr[0], tees[0], 0], [q.pr[1], tees[1], 1]].forEach(function (tt) {
        var f = tt[0], ty = tt[1], lower = tt[2];
        if (!f) { s.ln(x, ty, x + 7, ty, c); s.t(x + 8, ty + 0.6, 'SPARE', 1.4, { b: true, c: COL.mut }); s.t(x + 8, ty + 2.4, '备用', 1.3, { c: COL.mut }); return; }
        var exUp = f[0] === 'L', tx = x + ((exUp && lower) || (!exUp && !lower) ? P.off2 : P.off);
        s.ln(x, ty, tx, ty, c);
        if (exUp) {
          s.sw(tx, ty - 9 * K, 'ds', c, K); s.es(tx, ty - 9 * K - 1.2, 1, c);
          s.vline(tx, yA - 16, ty - 9 * K, c, [yA]);
          s.es(tx, yA - 4, 1, c); s.vt(tx, yA - 9.5, 1, c); s.sa(tx, yA - 14.5, -1, c);
          s.coil(tx, yA - 21.4, c); s.ln(tx, yA - 21.4, tx, yA - 23.2, c); s.arrowUp(tx, yA - 26.2, c);
          s.t(tx + 2.2, yA - 24, 'Line ' + f[1] + ' — PLN', 1.6, { b: true, c: c }); s.t(tx + 2.2, yA - 22.2, '线路' + f[1], 1.4, { c: ZC });
        } else {
          s.sw(tx, ty, 'ds', c, K); s.es(tx, ty + 9 * K + 1.2, 1, c);
          var yT = P.yTe; s.vline(tx, ty + 9 * K, yB + 4.6, c, [yB]); s.sa(tx, yB + 3, -1, c); s.vt(tx, yB + 3, 1, c);
          s.ct(tx, yB + 4.6, 3, c, 0.72); s.ln(tx, yB + 9.5, tx, yT, c);
          s.tr3(tx, yT, c, c150, 'Y', true, c70, 'D');
          var lx = tx - 3.6, ly = yT + 14.8;
          s.ln(lx, ly, lx, ly + 1.7, c150); s.sa(lx, ly + 1.2, -1, c150); s.cable(lx, ly + 1.7, c150);
          s.ln(lx, ly + 6.1, lx, P.Hb + 5, c150); s.t(lx - 1.6, ly + 12, 'UGC 150 kV', 1.25, { a: 'r', c: c150 });
          var rx = tx + 3.6; s.ln(rx, ly, rx, ly + 4, c70); s.vt(rx, ly + 2.7, 1, c70); s.t(rx + 4, ly + 7.4, 'Δ tertiary', 1.3, { c: c70 });
          s.t(tx + 9.5, yT + 3, 'IBT-' + f[1], 1.7, { b: true }); s.t(tx + 9.5, yT + 5.3, F(ib.mva) + ' MVA', 1.5); s.t(tx + 9.5, yT + 7.3, ib.ratio, 1.3); s.t(tx + 9.5, yT + 9.2, '联络变' + f[1], 1.3, { c: ZC });
        }
      });
    });
  }

  /* ---- HV band: 70 / 150 / 230 kV GIS (single / double busbar), incoming bays, bus VT, coupler, transformer bays and HV/MV transformers */
  function drawHV(s, d, P) {
    var hv = d.hv, ht = d.ht, ehv = d.ehv, kvH = ehv ? 150 : hv.kv, c = cv(kvH), cL = cv(20), dy = P.dyH, dbl = P.dbl, yb1 = P.yb1, yb2 = P.yb2;
    var ikH = ehv ? pickN([40, 50, 63], 1.25 * d.mv.ssc150 / (1.732 * 150)) : hv.ik, iIn = ehv ? hv.ibt.mva * 1000 / (1.732 * 150) : hv.bays.iLine;
    var lineA = ehv ? pickN(IR, 1.2 * iIn) : hv.bays.lineA, busA = ehv ? Math.max(lineA, pickN([2000, 2500, 3150, 4000, 5000], 1.2 * d.el.mva * 1000 / (1.732 * 150))) : hv.busA;
    var iT = ht.mva * 1000 / (1.732 * kvH), txA = ehv ? Math.max(2000, pickN(IR, 1.2 * iT)) : hv.bays.txA;
    P.hvR = { kv: kvH, ik: ikH, lineA: lineA, busA: busA, txA: txA, lineCT: ehv ? pickN(CTP, 1.1 * iIn) + '/1 A' : hv.bays.lineCT, txCT: ehv ? pickN(CTP, 1.2 * iT) + '/1 A' : hv.bays.txCT, ur: ehv ? 170 : hv.ur };
    s.bus(P.hbL, P.hbR, yb1, c, 0.9); if (dbl) s.bus(P.hbL, P.hbR, yb2, c, 0.9);
    s.bi(P.hbL + 1, yb1 - 3.4, kvH + ' kV ' + (dbl ? 'BUS I  ' : 'BUS  ') + F(busA) + ' A', dbl ? 'I母' : '母线', 1.8, { c: c, b: true });
    if (dbl) s.bi(P.hbL + 1, yb2 + 4.4, kvH + ' kV BUS II  ' + F(busA) + ' A', 'II母', 1.8, { c: c, b: true });
    s.t(P.hbR, yb1 - 3.4, (ehv ? '150 kV GIS (Ur 170 kV)' : hv.gisName) + ' | ' + ikH + ' kA 1 s', 1.6, { a: 'r', b: true, c: c });
    function risers(x, up) {
      if (up) {
        if (!dbl) { s.dot(x, yb1, c); s.ln(x, yb1, x, yb1 - 3, c); s.sw(x, yb1 - 12, 'ds', c); return yb1 - 12; }
        s.dot(x - 2.5, yb1, c); s.ln(x - 2.5, yb1, x - 2.5, yb1 - 3, c); s.sw(x - 2.5, yb1 - 12, 'ds', c);
        s.dot(x + 2.5, yb2, c); s.vline(x + 2.5, yb1 - 3, yb2, c, [yb1]); s.sw(x + 2.5, yb1 - 12, 'ds', c);
        s.ln(x - 2.5, yb1 - 12, x + 2.5, yb1 - 12, c); return yb1 - 12;
      }
      if (!dbl) { s.dot(x, yb1, c); s.ln(x, yb1, x, yb1 + 1, c); s.sw(x, yb1 + 1, 'ds', c); s.ln(x, yb1 + 10, x, yb1 + 12, c); return yb1 + 12; }
      s.dot(x - 2.5, yb1, c); s.vline(x - 2.5, yb1, yb2 + 1, c, [yb2]); s.sw(x - 2.5, yb2 + 1, 'ds', c);
      s.dot(x + 2.5, yb2, c); s.ln(x + 2.5, yb2, x + 2.5, yb2 + 1, c); s.sw(x + 2.5, yb2 + 1, 'ds', c);
      s.ln(x - 2.5, yb2 + 10, x + 2.5, yb2 + 10, c); s.ln(x, yb2 + 10, x, yb2 + 12, c); return yb2 + 12;
    }
    /* incoming bays: bus DS — CT — CB — CT — MES — line DS — HSES, VT, SA — cable termination */
    P.hin.forEach(function (x, i) {
      var y = risers(x, true);
      s.ln(x, y, x, y - 1, c); y -= 1; y -= 6.9; s.ct(x, y, 3, c); y -= 9; s.sw(x, y, 'cb', c); y -= 6.9; s.ct(x, y, 3, c);
      s.ln(x, y, x, y - 1, c); s.es(x, y - 0.5, 1, c); y -= 1; y -= 9; s.sw(x, y, 'ds', c);
      if (!ehv) s.es(x, y - 2.7, 1, c, 'HSES');
      s.ln(x, y, x, 34.4 + dy, c); s.vt(x, 40.5 + dy, 1, c, true); s.sa(x, 37 + dy, -1, c); s.cable(x, 30 + dy, c);
      if (i === 0) { s.t(x + 3, 70 + dy, 'CB ' + F(lineA) + ' A | ' + ikH + ' kA', 1.3, { c: c }); s.t(x + 3, 62.5 + dy, 'CT ' + P.hvR.lineCT, 1.25, { c: c }); }
      if (ehv) { s.t(x + 2.6, 27.8 + dy, 'IBT-' + (i + 1) + ' incomer', 1.45, { b: true, c: c }); }
      else { s.ln(x, 29 + dy, x, 30 + dy, c); s.arrowUp(x, 26 + dy, c); s.t(x + 2.4, 27.6 + dy, 'Line ' + (i + 1) + ' — PLN', 1.6, { b: true, c: c }); s.t(x + 2.4, 29.4 + dy, '线路' + (i + 1) + ' | ' + (hv.hvCable || ''), 1.25, { c: ZC }); }
    });
    /* busbar VT bays */
    P.hvt.forEach(function (x, k) {
      var yy = k ? yb2 : yb1, top = 52 + dy;
      s.dot(x, yy, c); if (k) s.vline(x, yb1 - 3, yb2, c, [yb1]); else s.ln(x, yb1, x, yb1 - 3, c);
      s.sw(x, yb1 - 12, 'ds', c); s.ln(x, yb1 - 12, x, top, c); s.es(x, yb1 - 14, 1, c);
      s.vt(x, top + 4, 1, c, true); s.sa(x, top + 9, -1, c);
      s.bi(x, top - 4, 'Bus VT' + (dbl ? (k ? ' II' : ' I') : ''), (dbl ? (k ? 'II' : 'I') : '') + '母PT', 1.6, { a: 'c', b: true, c: c });
    });
    if (dbl) {
      var xc = P.coup, a = xc - 3, b = xc + 3;
      s.dot(a, yb1, c); s.vline(a, yb1, yb2 + 1, c, [yb2]); s.sw(a, yb2 + 1, 'ds', c);
      var hc = s.ct(a, yb2 + 10, 3, c); s.sw(a, yb2 + 10 + hc, 'cb', c); var yl = yb2 + 19 + hc + 1.5;
      s.ln(a, yb2 + 19 + hc, a, yl, c); s.ln(a, yl, b, yl, c); s.ln(b, yl, b, yb2 + 10, c); s.sw(b, yb2 + 1, 'ds', c); s.ln(b, yb2, b, yb2 + 1, c); s.dot(b, yb2, c);
      s.bi(xc, yl + 4.5, 'Bus coupler', '母联', 1.6, { a: 'c', b: true, c: c });
    }
    /* transformer bays and HV/MV transformers; earthing transformer + NGR on every LV winding */
    function earth(lx, ly, dir) { var ex = lx + 5.5 * dir; s.ln(lx, ly + 5, ex, ly + 5, cL); s.pg.circle(ex, ly + 7.2, 2, { c: cL, w: 0.25 }); s.wind(ex, ly + 7.2, 'Z', cL); s.ln(ex, ly + 9.2, ex, ly + 9.4, cL); s.res(ex, ly + 9.4, cL); s.gnd(ex, ly + 14, cL); }
    P.tr.forEach(function (t, j) {
      var x2 = t.x, y2 = risers(x2, false);
      s.sw(x2, y2, 'cb', c); y2 += 9; y2 += s.ct(x2, y2, 4, c); s.sw(x2, y2, 'ds', c); y2 += 9;
      s.ln(x2, y2, x2, y2 + 3, c); s.sa(x2, y2 + 0.5, -1, c, 7); s.es(x2, y2 + 1.5, 1, c); y2 += 3;
      var yt = y2, lx0 = x2 + (ht.split ? 9 : 6.8);
      if (ht.split) s.tr3(x2, yt, c, cL, 'D', true); else s.tr2(x2, yt, c, cL, 'Y', 'D', true);
      t.leads.forEach(function (ld) { earth(ld.x, P.ly, ld.dir); });
      if (j === 0) { s.t(x2 + 3, y2 - 24, 'CB ' + F(txA) + ' A | ' + P.hvR.txCT, 1.25, { c: c }); }
      s.t(lx0, yt + 2.8, 'TR-' + (j + 1), 1.8, { b: true }); s.t(lx0, yt + 5.1, F(ht.mva) + ' MVA', 1.5); s.t(lx0, yt + 7.1, ht.ratio + ' ' + ht.vg, 1.25); s.t(lx0, yt + 9, 'uk ' + ht.uk + ' % | OLTC', 1.25); s.t(lx0, yt + 10.9, '主变' + (j + 1), 1.3, { c: ZC });
    });
  }

  /* ---- 20 kV band: sections, incomers from the transformer windings (or PLN feeders), bus VT, feeders, normally open bus sections */
  function fdr(s, x, Y, f, c, lab) {
    var cl = f.k === 'ch' ? cv(6.6) : cv(0.4);
    s.sw(x, Y, 'wcb', c, 0.7); s.ct(x, Y + 9.1, 2, c, 0.7); s.ln(x, Y + 12.4, x, Y + 13.2, c);
    if (f.k === 'sp') s.ln(x, Y + 13.2, x, Y + 18.5, c, 0.3, [0.8, 0.6]);
    else {
      s.pg.poly([[x, Y + 13.2], [x + 1, Y + 14.8], [x, Y + 16.4], [x - 1, Y + 14.8]], { c: c, w: 0.3, close: true }); s.ln(x, Y + 16.4, x, Y + 17.4, c);
      var yy = Y + 17.4;
      if (f.k === 'gen') s.gen(x, yy, c, 2.6);
      else if (f.k === 'cap') { s.cap(x, yy, c); s.gnd(x, yy + 5, c); }
      else if (f.k === 'bess' || f.k === 'db') { s.pg.rect(x - 3.6, yy, 7.2, 4.4, { c: c, w: 0.35 }); if (f.k === 'db') s.ln(x - 2.6, yy + 1.2, x + 2.6, yy + 1.2, c, 0.5); s.t(x, yy + 3.6, f.k === 'db' ? 'DB' : 'BESS', 1.25, { a: 'c', b: true, c: c }); }
      else { s.pg.circle(x, yy + 1.8, 1.8, { c: c, w: 0.3 }); s.pg.circle(x, yy + 4.4, 1.8, { c: cl, w: 0.3 }); }
    }
    s.t(x, Y + 28, lab[0], 1.45, { a: 'c', b: true }); if (lab[1]) s.t(x, Y + 29.9, lab[1], 1.15, { a: 'c' }); if (lab[2]) s.t(x, Y + 31.6, lab[2], 1.1, { a: 'c', c: COL.mut });
  }
  function inc(s, x, Y, c, meter) {
    s.ln(x, Y - 20.5, x, Y - 19.4, c); s.es(x, Y - 19.9, 1, c); s.sw(x, Y - 19.4, 'wcb', c, 0.8); s.ct(x, Y - 9, 3, c, 0.75); s.ln(x, Y - 3.75, x, Y, c);
    if (meter) { s.ln(x + 0.9, Y - 6, x + 2.6, Y - 6, c, 0.2, [0.6, 0.4]); s.pg.rect(x + 2.6, Y - 7.8, 5.4, 3.4, { c: c, w: 0.25 }); s.t(x + 5.3, Y - 5.5, 'kWh', 1.05, { a: 'c', c: c }); }
  }
  function busVT(s, xv, Y, c) { s.ln(xv, Y, xv, Y + 2, c); s.fuse(xv, Y + 2, c); s.ln(xv, Y + 6, xv, Y + 8.5, c); s.vt(xv, Y + 8.5, 1, c, true); s.sa(xv, Y + 3.5, -1, c, 3.6); s.t(xv + 7, Y + 14.6, 'VT', 1.2, { a: 'c', c: c }); }
  function drawMV(s, d, P) {
    var c = cv(20), mv = d.mv, ht = d.ht, L = P.L, y20 = P.y20, n = L.secs.length, pln = 0;
    L.secs.forEach(function (sc, k) {
      var X = sc.X, w = sc.w;
      s.bus(X, X + w, y20, c, 0.8); s.t(X + w - 1, y20 - 2, 'S' + (k + 1) + '  ' + F(mv.busA) + ' A', 1.45, { a: 'r', b: true, c: c });
      sc.inc.forEach(function (x, q) {
        inc(s, x, y20, c, !ht);
        if (!ht) { pln++; s.arrowDn(x, P.Mtop, c); s.ln(x, P.Mtop - 3, x, P.Mtop, c); s.t(x + 1.6, P.Mtop - 5.6, 'PLN ' + pln, 1.4, { b: true, c: c }); s.t(x + 1.6, P.Mtop - 3.9, '20 kV', 1.15, { c: c }); }
      });
      busVT(s, sc.xv, y20, c);
      sc.items.forEach(function (it, j) { fdr(s, sc.fx[j], y20, it.f, c, it.lab); });
      var tie = ht ? (ht.sec > 1 && k % ht.sec !== ht.sec - 1) : k < n - 1;
      if (tie && k < n - 1) { s.ln(X + w, y20, X + w + 0.5, y20, c); s.cbH(X + w + 0.5, y20, c, true); s.ln(X + w + 7.5, y20, X + w + 8, y20, c); s.t(X + w + 4, y20 - 2.6, 'N.O.', 1.15, { a: 'c', c: COL.mut }); }
    });
    s.t(P.mvR, P.Mbot + 1.5, '20 kV metal-clad switchgear Ur 24 kV | ' + F(mv.busA) + ' A | ' + mv.ik + ' kA 3 s | IAC AFLR' + (L.indiv ? '' : ' | feeders grouped: quantity × code (see the 20 kV feeder schedule)'), 1.5, { a: 'r', b: true, c: c });
    /* transformer windings → section incomers */
    if (ht) P.tr.forEach(function (t) {
      t.leads.forEach(function (ld, li) {
        var yd = P.yd + li * 3.5, xs = ld.ks.map(function (k) { return L.secs[k].inc[0]; });
        s.ln(ld.x, P.ly, ld.x, yd, c);
        var x0 = Math.min.apply(null, xs.concat([ld.x])), x1 = Math.max.apply(null, xs.concat([ld.x])); if (x1 > x0) s.ln(x0, yd, x1, yd, c);
        xs.forEach(function (x) { s.ln(x, yd, x, P.Mtop, c); });
        if (xs.length > 1 || Math.abs(xs[0] - ld.x) > 1) s.dot(ld.x, yd, c);
      });
    });
  }

  /* ---- typical building 20 kV board (campus scale) */
  function drawBoard(s, d, P) {
    var db = d.el.mvdb, el = d.el, c = cv(20), mv = d.mv, yB = P.D0 + 24, nT = 0, nG = 0;
    s.t(P.bA.x, P.D0 - 3.2, 'TYPICAL BUILDING 20 kV BOARD — 1 of ' + db.n + ' (' + db.blocks + ' block' + (db.blocks > 1 ? 's' : '') + ' each) | ' + F(db.busA) + ' A | ' + mv.ik + ' kA | ≤ ' + F(db.mva, 1) + ' MVA', 1.6, { b: true, c: c });
    s.t(P.bA.x, P.D0 - 1.3, 'fed by feeders A + B from 20 kV sections of different transformers (dashed) | 典型楼宇20 kV开关柜——共' + db.n + '套，双进线+分段', 1.35, { c: ZC });
    [P.bA, P.bB].forEach(function (h, hi) {
      var X0 = h.x, X1 = X0 + 40 + (h.n - 1) * 10;
      s.bus(X0, X1, yB, c, 0.8); s.t(X1, yB - 2, 'BUS ' + (hi ? 'B' : 'A'), 1.4, { a: 'r', b: true, c: c });
      inc(s, X0 + 5, yB, c, false); s.t(X0 + 7, yB - 15, '1,250 A', 1.2, { c: c });
      busVT(s, X0 + 17, yB, c);
      var list = [], i;
      for (i = 0; i < h.g; i++) list.push({ f: { k: 'gen' }, lab: ['G' + (++nG), F(el.genSize) + ' kWe'] });
      for (i = 0; i < h.t; i++) list.push({ f: { k: 'tx' }, lab: ['TX' + (++nT), F(el.txSize) + ' kVA'] });
      list.push({ f: { k: 'sp' }, lab: ['SP', ''] });
      list.forEach(function (it, j) { fdr(s, X0 + 32 + j * 10, yB, it.f, c, it.lab); if (!hi && it.lab[0] === 'TX1') P.bTX1 = X0 + 32 + j * 10; });
      h.inX = X0 + 5;
    });
    var xa = P.bA.x + 40 + (P.bA.n - 1) * 10; s.ln(xa, yB, xa + 4, yB, c); s.cbH(xa + 4, yB, c, true); s.ln(xa + 11, yB, P.bB.x, yB, c); s.t(xa + 7.5, yB - 2.6, 'N.O.', 1.15, { a: 'c', c: COL.mut });
    P.yBb = yB;
  }

  /* ---- typical MV/LV block and critical power path */
  function drawLV(s, d, P) {
    var el = d.el, p = d.p, c20 = cv(20), c4 = cv(0.4), cd = cv('dc'), arch = el.txArch, lv = el.lv, dy = P.D0 - 25;
    var nbk = arch === 'N1' && el.txBlk && el.txBlk.per > 1 ? el.txBlk.per - 1 : 2;
    var cols = arch === '2N' ? ['A', 'B'] : (arch === 'DR' ? ['A', 'B', 'C'] : ['1', 'R', String(nbk)]), X = P.lvC;
    var upsPer = Math.max(1, Math.round(el.upsTotal / Math.max(1, el.txTotal - (arch === 'N1' ? el.txR : 0)))), msbA = pickN([1600, 2500, 3200, 4000, 5000, 6300], lv.acb), rackKW = d.R.cap ? d.R.cap.sd : 0;
    var batt = (p.battery === 'LI' ? 'LFP ' : 'VRLA ') + p.upsMin + ' min';
    var blk = el.txBlk ? (arch === 'N1' ? el.txLabel + ' — block of ' + nbk + ' duty + 1 reserve' : (arch === 'DR' ? '3N/2 — groups of three' : '2N — A / B pairs')) : el.txLabel;
    var tX = Math.max(P.lvX0, (P.linkX || 0) + 5);
    s.t(tX, P.D0 - 3.2, 'TYPICAL MV/LV BLOCK — ' + el.txTotal + ' × ' + F(el.txSize) + ' kVA = ' + blk, 1.6, { b: true, c: c4 });
    s.t(tX, P.D0 - 1.3, '典型中/低压模块——' + el.txTotal + '×' + F(el.txSize) + ' kVA（' + el.txLabel + '）', 1.35, { c: ZC });
    cols.forEach(function (lab, i) {
      var x = X[i], res = lab === 'R';
      s.bi(x, 27 + dy + 1, res ? 'Reserve TX R (catcher)' : 'TX ' + lab, res ? '备用变压器R' : '变压器' + lab, 1.9, { a: 'c', b: true, c: c20 });
      s.arrowDn(x, 34 + dy, c20); s.ln(x, 34 + dy, x, 36 + dy, c20); s.sw(x, 36 + dy, 'wcb', c20); s.ln(x, 49 + dy, x, 50.5 + dy, c20); s.cable(x, 50.5 + dy, c20); s.ln(x, 54.9 + dy, x, 57 + dy, c20);
      s.tr2(x, 57 + dy, c20, c4, 'D', 'Y', false); s.ln(x, 67.6 + dy, x + 5.5, 67.6 + dy, c4, 0.2); s.gnd(x + 5.5, 67.6 + dy, c4);
      s.t(x + 9.5, 61.2 + dy, F(el.txSize) + ' kVA', 1.8, { b: true }); s.t(x + 9.5, 63.6 + dy, '20/0.4 kV Dyn11 | uk ' + lv.uk + ' %', 1.4); s.t(x + 9.5, 65.8 + dy, 'cast resin, IEC 60076-11', 1.3, { c: COL.mut });
      s.ln(x, 71 + dy, x, 74 + dy, c4); s.sw(x, 74 + dy, 'cb', c4); s.ln(x, 83 + dy, x, 86 + dy, c4); s.t(x + 2.6, 79.4 + dy, 'ACB ' + F(lv.acb) + ' A', 1.4, { c: c4 });
      s.bus(x - 34, x + 34, 86 + dy, c4, 0.8); s.t(x - 34, 82.4 + dy, (res ? 'Reserve bus R' : 'MSB ' + lab) + '  ' + F(msbA) + ' A | ' + lv.icw + ' kA', 1.4, { b: true, c: c4 }); s.t(x - 34, 84.3 + dy, res ? '备用母线R' : '低压总配电柜' + lab, 1.25, { c: ZC });
      if (res) {
        [-1, 1].forEach(function (dr) { var e0 = x + 34 * dr, e1 = X[i + dr] - 34 * dr, mid = (e0 + e1) / 2; s.ln(Math.min(e0, e1), 86 + dy, mid - 3.5, 86 + dy, c4); s.cbH(mid - 3.5, 86 + dy, c4, true); s.ln(mid + 3.5, 86 + dy, Math.max(e0, e1), 86 + dy, c4); s.t(mid, 83.2 + dy, 'tie N.O.', 1.25, { a: 'c', c: COL.mut }); });
        s.t(x, 92 + dy, 'closes onto MSB 1 … MSB ' + nbk + ' on loss of its transformer (interlocked)', 1.3, { a: 'c', c: c4 }); s.t(x, 93.9 + dy, '任一变压器失电时经联络开关转供（联锁）', 1.2, { a: 'c', c: ZC });
        s.t(x, 98 + dy, 'block: ' + nbk + ' duty + 1 reserve' + (nbk > 2 ? ' — TX 2 … TX ' + (nbk - 1) + ' as TX 1' : ''), 1.3, { a: 'c', b: true, c: c4 }); s.t(x, 99.9 + dy, '每模块' + nbk + '用1备', 1.2, { a: 'c', c: ZC });
        return;
      }
      var xu = x - 21; s.ln(xu, 86 + dy, xu, 88 + dy, c4); s.sw(xu, 88 + dy, 'cb', c4); s.ln(xu, 97 + dy, xu, 99 + dy, c4);
      s.box(xu, 99 + dy, 14, 9, 'UPS', cd, upsPer + ' × ' + F(el.upsSize) + ' kW'); s.ln(xu - 7, 103.5 + dy, xu - 10, 103.5 + dy, cd); s.bat(xu - 12, 101.6 + dy, cd); s.t(xu - 12, 109.6 + dy, batt, 1.25, { a: 'c', c: cd });
      s.ln(xu, 108 + dy, xu, 113 + dy, cd); s.bus(xu - 10, xu + 10, 113 + dy, cd, 0.6); s.t(xu + 11, 113.6 + dy, 'Critical bus ' + lab, 1.3, { c: cd }); s.t(xu + 11, 115.3 + dy, '关键母线' + lab, 1.2, { c: ZC });
      s.ln(xu, 113 + dy, xu, 117 + dy, cd); s.box(xu, 117 + dy, 17, 6.5, el.useBusway ? 'Busway' : 'PDU', cd, el.useBusway ? F(el.bwA) + ' A' : ''); s.ln(xu, 123.5 + dy, xu, 130 + dy, cd);
      if (arch === 'DR' && i === 2) s.t(xu, 133 + dy, 'to rack pairs B-C, C-A', 1.25, { a: 'c', c: cd });
      var xm = x + 6; s.ln(xm, 86 + dy, xm, 88 + dy, c4); s.sw(xm, 88 + dy, 'cb', c4); s.ln(xm, 97 + dy, xm, 100 + dy, c4); s.box(xm, 100 + dy, 13, 7, 'MCC', c4, 'mech.');
      s.t(xm, 110 + dy, el.chV === 'MV' ? 'pumps, fans, towers' : 'chillers, pumps, fans', 1.25, { a: 'c', c: c4 }); s.t(xm, 111.8 + dy, el.chV === 'MV' ? '水泵、风机、冷却塔' : '冷机、水泵、风机', 1.15, { a: 'c', c: ZC });
      if (el.genV !== 'MV') { var xg = x + 24; s.ln(xg, 86 + dy, xg, 88 + dy, c4); s.sw(xg, 88 + dy, 'cb', c4); s.ln(xg, 97 + dy, xg, 99 + dy, c4); s.gen(xg, 99 + dy, c4); s.t(xg + 5, 103 + dy, F(el.genSize) + ' kWe', 1.3, { c: c4 }); s.t(xg + 5, 104.8 + dy, '0.4 kV', 1.25, { c: c4 }); }
    });
    var ups = cols.filter(function (l) { return l !== 'R'; }), i0 = cols.indexOf(ups[0]), i1 = cols.indexOf(ups[1]);
    var xa = X[i0] - 21, xb = X[i1] - 21, xR = (X[i0] + X[i1]) / 2, yr = 140 + dy;
    s.pg.rect(xR - 10, yr, 20, 20, { c: cd, w: 0.4 }); s.t(xR, yr + 6.5, 'IT rack', 2, { a: 'c', b: true, c: cd }); s.tf(xR, yr + 9.8, F(rackKW, 1) + ' kW' + (d.R.cap.hdR > 0 ? ' | HD ' + F(d.R.cap.hd) + ' kW' : ''), 1.5, 19, { a: 'c', c: cd });
    s.t(xR, yr + 13, el.feedsPerRack === 2 ? 'rPDU A + B' : 'rPDU', 1.5, { a: 'c', c: cd }); s.t(xR, yr + 15.8, '机柜PDU', 1.3, { a: 'c', c: ZC });
    s.ln(xa, 130 + dy, xa, yr + 5, cd); s.ln(xa, yr + 5, xR - 10, yr + 5, cd); s.t(xa + 2, yr + 3.8, 'cord A', 1.35, { c: cd });
    if (el.feedsPerRack === 2) { s.ln(xb, 130 + dy, xb, yr + 15, cd); s.ln(xb, yr + 15, xR + 10, yr + 15, cd); s.t(xb - 2, yr + 13.8, 'cord B', 1.35, { a: 'r', c: cd }); }
  }

  /* ---- typical connections between the levels (dashed) */
  function drawLinks(s, d, P) {
    var c = cv(20), db = d.el.mvdb, L = P.L, dash = [1.4, 0.9], R = [];
    function itemX(kind, sec) { var sc = L.secs[sec]; if (!sc) return null; for (var j = 0; j < sc.items.length; j++) if (sc.items[j].f.k === kind) return sc.fx[j]; return null; }
    if (db) {
      var per = d.ht ? d.ht.sec : 1, sa = 0, sb = per % L.secs.length, xa = itemX('db', sa), xb = itemX('db', sb);
      if (xa !== null) R.push([[xa, P.Mbot - 0.5], [xa, P.Mbot + 4.5], [P.bA.inX, P.Mbot + 4.5], [P.bA.inX, P.D0 + 2.6]]);
      if (xb !== null) R.push([[xb, P.Mbot - 0.5], [xb, P.Mbot + 8.5], [P.bB.inX, P.Mbot + 8.5], [P.bB.inX, P.D0 + 2.6]]);
      if (P.bTX1) R.push([[P.bTX1, P.yBb + 32.5], [P.bTX1, P.yBb + 37], [P.lvX0 - 6, P.yBb + 37], [P.lvX0 - 6, P.D0 + 6], [P.lvC[0], P.D0 + 6], [P.lvC[0], P.D0 + 6.6]]);
    } else {
      var sx = 0, xt = null; for (var k = 0; k < L.secs.length && xt === null; k++) { xt = itemX('tx', k); sx = k; }
      if (xt !== null) R.push([[xt, P.Mbot - 0.5], [xt, P.D0 + 6], [P.lvC[0], P.D0 + 6], [P.lvC[0], P.D0 + 6.6]]);
      P.linkX = xt;
    }
    routes(s, R, c, dash, 0.3);
  }

  /* ---- schedules on the drawing */
  function drawSched(s, d, P) {
    var el = d.el, hv = d.hv, ht = d.ht, mv = d.mv, gi = d.gi, mp = P.L.mp, db = el.mvdb, boxes = [], c = COL.k;
    if (P.hvOn) {
      var R = P.hvR || {};
      boxes.push([['PLN connection and GIS', 'PLN接入及GIS'], (hv.ibt ? [['500 kV GIS', '500 kV GIS', hv.gisName.replace(/^500 kV GIS /, '') + ' | breaker-and-a-half | ' + (hv.bays.diam || '') + ' diameters | ' + F(hv.busA) + ' A | ' + hv.ik + ' kA'],
        ['500 kV CTs / VT', '500 kV互感器', '5 cores TPY / TPX / 5P20 / 0.2S | CVT 0.2 / 3P'], ['Interbus TX', '联络变', hv.ibt.total + ' × ' + F(hv.ibt.mva) + ' MVA ' + hv.ibt.ratio + ' + Δ tertiary, uk ≈ ' + hv.ibt.uk + ' %']] : [['PLN lines', 'PLN线路', hv.name + ' | ' + hv.circ + ' circuits (N-1) | ' + (hv.hvCable || '')]])
        .concat([[R.kv + ' kV GIS', R.kv + ' kV GIS', 'Ur ' + R.ur + ' kV | ' + (P.dbl ? 'double busbar + coupler' : 'single busbar') + ' | ' + F(R.busA) + ' A | ' + R.ik + ' kA 1 s'],
          ['Incoming bays', '进线间隔', F(R.lineA) + ' A | CT ' + R.lineCT + ' 5P40 / 5P40 / 0.2S + 0.5 | VT 0.5 / 3P | ' + saOf(R.kv)],
          ['Transformer bays', '主变间隔', F(R.txA) + ' A | CT ' + R.txCT + ' 5P30 × 3 + 0.2S'], ['Insulation', '绝缘水平', 'Ur ' + R.ur + ' kV: ' + (INS[R.ur] || '')]])]);
      boxes.push([['HV/MV transformers and earthing', '主变及接地'], [['Transformers', '主变压器', ht.total + ' × ' + F(ht.mva) + ' MVA ONAF (' + F(ht.onan) + ' ONAN)'], ['Ratio / vector', '变比/联结组', ht.ratio + ' | ' + ht.vg + ' | uk ' + ht.uk + ' %' + (ht.split ? ' per LV winding' : '')],
        ['OLTC / neutral', '有载调压/中性点', '± 8 × 1.25 % | HV neutral solidly earthed (PLN)'], ['Loading (PLN N-1)', '负载率', ht.lab + ' | normal ' + F(ht.load) + ' %' + (ht.loadOut ? ' | one out ' + F(ht.loadOut) + ' %' : '')],
        ['20 kV earthing', '20 kV接地', 'zig-zag TR + NGR 40 Ω | 300 A | 10 s per LV winding (' + ht.total * ht.wind + ')'], ['Capacitors', '电容器', gi.capPerTx ? gi.capSteps + ' per transformer' : 'not required (PF ≥ 0.95)']]]);
    } else boxes.push([['PLN 20 kV supply', 'PLN 20 kV供电'], [['Supply', '电源', hv.circ + ' × PLN 20 kV feeders | ' + hv.scheme[0]], ['Metering', '计量', 'PLN kWh metering per incomer (CT / VT 0.2S)'], ['Earthing', '接地', 'PLN 20 kV network earthing'], ['Fault level', '短路', F(hv.pccIk, 1) + ' kA → switchgear ' + mv.ik + ' kA']]]);
    var codes = mp.feeders.map(function (f) { return [CODE[f.k] + (f.k === 'cap' ? ' ' + f.l1 : '') + ' (×' + f.n + ')', DESC[f.k][1], DESC[f.k][0] + ' | ' + F(f.a) + ' A VCB' + (f.cable ? ' | ' + f.cable : '') + ' | ' + PROT[f.k]]; });
    boxes.push([['20 kV feeder schedule', '20 kV馈线表'], [['Incomers (×' + mp.incomers + ')', '进线', F(mv.busA) + ' A VCB | CT 5P20 / 0.5 / 0.2S | 50/51, 51N, 67, 27/59, 81']].concat(codes)]);
    boxes.push([['20 kV switchgear and distribution', '20 kV开关柜及配电'], [['Switchgear', '开关柜', 'Ur 24 kV | ' + INS[24] + ' | LSC2B-PM | IAC AFLR ' + mv.ik + ' kA 1 s'], ['Sections', '母线段', mv.boards + ' × ' + F(mv.busA) + ' A | ' + mv.ik + ' kA 3 s' + (ht ? ' | calc. ' + F(mv.ikCalc, 1) + ' kA' : '')],
      ['Bus sections', '分段', mp.ties ? mp.ties + ' × N.O., interlocked' : 'none'], ['Panels', '面数', mp.panels + ' (' + mp.incomers + ' incomers, ' + mp.nF + ' feeders, ' + mp.spares + ' spares)'],
      ['Building boards', '楼宇开关柜', db ? db.n + ' × (' + db.txPer + ' TX' + (db.genPer ? ' + ' + db.genPer + ' G' : '') + ') | ' + F(db.busA) + ' A | ' + db.panels + ' panels each' : 'not needed (≤ 24 feeders per section)'], ['Bus VT / SA', '母线PT/避雷器', vtOf(20) + ' | ' + saOf(20)]]]);
    var lv = el.lv;
    boxes.push([['MV/LV blocks and critical power', '中/低压模块及关键供电'], [['MV/LV transformers', '中/低压变压器', el.txTotal + ' × ' + F(el.txSize) + ' kVA | ' + el.txLabel + ' | Dyn11 | uk ' + lv.uk + ' %'], ['LV switchboards', '低压配电柜', 'ACB ' + F(lv.acb) + ' A | ' + F(lv.ik, 1) + ' kA → ' + lv.icw + ' kA (IEC 61439-2)' + (lv.over ? ' ✗' : '')],
      ['UPS / batteries', 'UPS/电池', el.upsTotal + ' × ' + F(el.upsSize) + ' kW | ' + el.upsLabel + ' | ' + F(el.battKWh) + ' kWh'], ['Generators', '发电机', el.genTotal + ' × ' + F(el.genSize) + ' kWe | ' + el.genLabel + ' | ' + (el.genV === 'MV' ? '20 kV' : '0.4 kV')],
      ['Distribution', '配电', (el.useBusway ? el.busways + ' busways ' + F(el.bwA) + ' A' : el.pdus + ' PDUs') + ' | ' + F(el.rpdus) + ' rack PDUs'], ['Earthing', '接地', 'TN-S | transformer neutral earthed at the MSB']]]);
    boxes.push([['Design basis', '设计依据'], [['IT load / Tier', 'IT负载/等级', F(d.R.cap.itMW, 2) + ' MW | Tier ' + d.p.tier], ['Demand / PF', '需量/功率因数', F(el.mva, 1) + ' MVA | PF ' + F(gi.pfEst || 0.95, 2)],
      ['Fault level PCC', '接入点短路', F(hv.pccIk, 1) + ' kA (planning)'], ['Reactive power', '无功', 'load ' + F(gi.qLoadF || 0, 1) + ' + TX ' + F((gi.qHT || 0) + (gi.qLV || 0), 1) + ' Mvar'], ['Standards', '标准', 'IEC 62271, 60076, 61869, 60099-4, 61439 | PLN Grid Code']]]);
    var n = boxes.length, gap = 3, maxRows = Math.max.apply(null, boxes.map(function (b) { return b[1].length; })), rh = maxRows > 8 ? 4.2 : (maxRows > 7 ? 4.6 : 5.2);
    if (P.mode === 'right') { var X0 = P.W - 16 - 390, yy = [28, 28]; boxes.forEach(function (b, i) { var col = i % 2; yy[col] = schedBox(s, X0 + col * 196, yy[col], 194, b[0], b[1], c, 5) + 4; }); }
    else { var bw = (P.W - 32 - gap * (n - 1)) / n; boxes.forEach(function (b, i) { schedBox(s, 16 + i * (bw + gap), P.H - 114, bw, b[0], b[1], c, rh); }); }
  }

  function sheetAll(doc, d, no, total) {
    var P = plan(d), el = d.el, hv = d.hv, chain = (d.ehv ? 'PLN ' + hv.kv + ' kV → 150 kV' : (d.kv > 20 ? 'PLN ' + hv.kv + ' kV' : 'PLN 20 kV')) + ' → 20 kV → 0.4 kV';
    var pg = doc.page(P.W, P.H), s0 = frame(pg, d.meta, no, total, ['Integrated single-line diagram — ' + chain, '综合单线图——' + chain], P.W, P.H), s = new Sym(Xform(pg, P.k, P.ox, P.oy));
    header(s0, 'INTEGRATED SINGLE-LINE DIAGRAM | ' + chain + ' | ' + F(el.mva, 1) + ' MVA | IT ' + F(d.R.cap.itMW, 1) + ' MW | Tier ' + d.p.tier + ' | ' + el.txTotal + ' × ' + F(el.txSize) + ' kVA ' + el.txLabel,
      '综合单线图｜' + chain + '｜' + F(el.mva, 1) + ' MVA｜IT ' + F(d.R.cap.itMW, 1) + ' MW｜Tier ' + d.p.tier, COL.k, P.W);
    if (d.ehv) drawEHV(s, d, P);
    if (P.hvOn) drawHV(s, d, P);
    drawMV(s, d, P);
    if (el.mvdb) drawBoard(s, d, P);
    drawLinks(s, d, P);
    drawLV(s, d, P);
    drawSched(s0, d, P);
    var nw = P.W - 160 - 100 - 26;
    notes(s0, [['One integrated drawing from the PLN connection to the IT rack; ' + (el.mvdb ? 'the building board and ' : '') + 'the MV/LV block are typical (repeated as listed), dashed lines show the typical connections', '从PLN接入到IT机柜的一张综合图；' + (el.mvdb ? '楼宇开关柜及' : '') + '中/低压模块为典型（按所列数量重复），虚线为典型连接'],
      ['Redundancy: HV/MV PLN N-1; MV/LV ' + el.txLabel + '; UPS ' + el.upsLabel + '; generators ' + el.genLabel + ' — every block / 20 kV bus carries its own reserve', '冗余：主变PLN N-1；中/低压' + el.txLabel + '；UPS ' + el.upsLabel + '；发电机' + el.genLabel + '——每个模块/20 kV母线自带备用'],
      ['Ratings are planning values from the design rules — confirm with the PLN connection study, the protection and earthing studies and the suppliers', '额定为按设计规则得出的规划值——须经PLN接入研究、保护及接地研究和供货商确认']], 16, P.H - 54, nw);
    legend(s0, P.W - 160 - 96, P.H - 56);
    return P;
  }

  /* ------------------------------------------------------------------ equipment and rating schedule (A3) */
  function sheetSchedule(doc, d, no, total) {
    var W = 420, H = 297, pg = doc.page(W, H), s = frame(pg, d.meta, no, total, ['Equipment and rating schedule (electrical)', '电气设备及额定参数表'], W, H), el = d.el, hv = d.hv, gi = d.gi;
    header(s, 'Design criteria and electrical equipment — from the assessment engine (planning quantities)', '设计准则及电气设备——取自评估引擎（规划数量）', COL.k, W);
    var crit = [['IT load / Tier', 'IT负载/等级', F(d.R.cap.itMW, 2) + ' MW | Tier ' + d.p.tier], ['Maximum demand / PF', '最大需量/功率因数', F(el.demandKVA / 1000, 1) + ' MVA | PF ' + F(gi.pfEst || 0.95, 2) + (gi.capPerTx ? ' (with capacitors)' : '')],
      ['PLN connection', 'PLN接入', hv.name + ' | ' + hv.circ + ' circuits | ' + hv.scheme[0]], ['Fault level PCC / GIS', '接入点/GIS短路', F(hv.pccIk, 1) + ' kA | ' + hv.ik + ' kA 1 s (peak ' + F(hv.ik * 2.5) + ' kA)'],
      ['HV/MV transformers', '主变', hv.ht ? hv.ht.total + ' × ' + hv.ht.mva + ' MVA ' + hv.ht.ratio + ' ' + hv.ht.vg + ', uk ' + hv.ht.uk + ' % (' + hv.ht.lab + ')' : 'n/a (20 kV supply)'],
      ['20 kV switchgear', '20 kV开关柜', hv.mv.boards + ' sections | ' + F(hv.mv.busA) + ' A | ' + hv.mv.ik + ' kA (calc. ' + F(hv.mv.ikCalc, 1) + ')' + (el.mvdb ? ' | ' + el.mvdb.n + ' building boards' : '')], ['MV/LV transformers', '中/低压变压器', el.txTotal + ' × ' + F(el.txSize) + ' kVA, uk ' + el.lv.uk + ' % (' + el.txLabel + ')'],
      ['LV switchboards', '低压配电柜', 'ACB ' + F(el.lv.acb) + ' A | ' + el.lv.icw + ' kA'], ['Generators', '发电机', el.genTotal + ' × ' + F(el.genSize) + ' kWe ' + (el.genV === 'MV' ? '20 kV' : '0.4 kV') + ' (' + el.genLabel + ')'],
      ['UPS / battery', 'UPS/电池', el.upsTotal + ' × ' + F(el.upsSize) + ' kW (' + el.upsLabel + ') | ' + F(el.battKWh) + ' kWh'], ['Reactive power', '无功', 'load ' + F(gi.qLoadF || 0, 1) + ' + transformers ' + F((gi.qHT || 0) + (gi.qLV || 0), 1) + ' Mvar' + (gi.capPerTx ? ' → capacitors ' + gi.capSteps + ' per HV/MV TX' : '')]];
    var y = 30; s.pg.rect(15, y - 4, 190, 4.6, { c: COL.k, w: 0.3, fill: '#E8EAF6' }); s.t(17, y - 0.8, 'Design criteria / 设计准则', 2, { b: true });
    crit.forEach(function (r) { s.t(17, y + 3.4, r[0], 1.7, { b: true }); s.t(17, y + 5.8, r[1], 1.5, { c: ZC }); s.tf(70, y + 4.4, r[2], 1.7, 133); s.ln(15, y + 7.2, 205, y + 7.2, '#BBBBBB', 0.15); y += 7.2; });
    var boq = d.R.boq.filter(function (b) { return /^EL-(0[1-9]|1[0-9]|2[0-8])$/.test(b.id) && ['EL-12', 'EL-14', 'EL-16', 'EL-18', 'EL-19', 'EL-20', 'EL-21', 'EL-22'].indexOf(b.id) < 0; });
    var X = 212; y = 30; s.pg.rect(X, y - 4, 193, 4.6, { c: COL.k, w: 0.3, fill: '#E8EAF6' }); s.t(X + 2, y - 0.8, 'Equipment (BOQ) / 设备清单', 2, { b: true }); s.t(X + 120, y - 0.8, 'Qty / Rating', 1.8, { b: true });
    boq.slice(0, 26).forEach(function (b) { s.tf(X + 2, y + 3.2, b.id + ' ' + b.en, 1.5, 116, { b: true }); s.tf(X + 2, y + 5.5, b.zh, 1.4, 116, { c: ZC }); s.t(X + 120, y + 3.2, F(b.qty) + ' ' + b.unit, 1.5, { b: true }); s.tf(X + 120, y + 5.5, String(b.rating), 1.35, 71); s.ln(X, y + 6.8, X + 193, y + 6.8, '#BBBBBB', 0.15); y += 6.8; });
    notes(s, [['Standards: IEC 62271-1 / -100 / -102 / -200 / -203, IEC 60076, IEC 61869-2 / -3 / -5, IEC 60099-4, IEC 60909, IEC 61439, PLN Grid Code (Permen ESDM 20/2020), SPLN', '标准：IEC 62271、IEC 60076、IEC 61869、IEC 60099-4、IEC 60909、IEC 61439、PLN电网规范、SPLN'],
      ['Quantities and ratings are planning values from the design rules; confirm with the PLN connection study, protection and earthing studies', '数量及额定为按设计规则得到的规划值；须经PLN接入研究、保护及接地研究确认']], 15, 234, 150);
    legend(s, 168, 234);
  }

  /* ------------------------------------------------------------------ build: PDF (integrated SLD + schedule) and SVG (integrated SLD, shown in the website) */
  function metaOf(x, opt) {
    var R = x.R, rev = (g.DCDB && g.DCDB.kbDocs && g.DCDB.kbDocs.rev) || '';
    return { project: opt.name || 'Data center design', basis: (opt.basis || '') + (opt.basis ? ' | ' : '') + F(R.cap.itMW, 1) + ' MW IT | Tier ' + x.p.tier + ' | ' + R.el.hv.name + ' | ' + F(R.el.mva, 1) + ' MVA',
      dwg: 'DC-SLD-' + (opt.code || 'X'), date: new Date().toISOString().slice(0, 10), rev: rev, titles: [] };
  }
  function build(x, opt) {
    opt = opt || {};
    var meta = metaOf(x, opt), d = design(x, meta);
    var pdf = PDF.create({ w: 420, h: 297, title: 'Single-line diagram — ' + meta.project, author: 'PT CCEPC Indonesia', subject: meta.basis });
    var P = sheetAll(pdf, d, 1, 2); sheetSchedule(pdf, d, 2, 2);
    pdf.titles = meta.titles; pdf.size = [P.W, P.H];
    return pdf;
  }
  function buildSVG(x, opt) {
    opt = opt || {};
    var meta = metaOf(x, opt), d = design(x, meta), doc = SVG.create({ title: 'Single-line diagram — ' + meta.project }), P = sheetAll(doc, d, 1, 2);
    return { svg: doc.svg(0), w: P.W, h: P.H, title: meta.titles[0] };
  }

  /* ------------------------------------------------------------------ browser viewer: the integrated SLD drawn as SVG (zoom, pan), PDF download */
  function Lx(en, zh) { return g.I18N && g.I18N.lang && g.I18N.lang() === 'zh' ? zh : en; }
  function escH(v) { return String(v).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
  function fileName(opt) { return ('SLD_' + (opt.code || 'design') + '_' + (opt.name || '')).replace(/[^A-Za-z0-9._-]+/g, '_').replace(/_+/g, '_').replace(/_$/, '').slice(0, 90) + '.pdf'; }
  function sizeName(w, h) { return w === 594 && h === 420 ? 'A2' : (w === 841 && h === 594 ? 'A1' : (w === 1189 && h === 841 ? 'A0' : Math.round(w) + ' × ' + Math.round(h) + ' mm')); }
  function downloadPDF(x, opt) {
    var blob = build(x, opt).blob(), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = fileName(opt); document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  var IC = { dl: '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
    full: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>' };
  var ZOOM = [1, 1.5, 2, 3, 4, 6, 8];
  function viewerHTML(r, modal) {
    return '<div class="sld-bar"><button type="button" class="sld-b pri" data-sld-pdf>' + IC.dl + escH(Lx('Download PDF', '下载PDF')) + '</button>' +
      '<span class="sld-zoom"><button type="button" class="sld-b" data-sld-z="-1" aria-label="' + escH(Lx('Zoom out', '缩小')) + '">−</button><b data-sld-zl>100%</b><button type="button" class="sld-b" data-sld-z="1" aria-label="' + escH(Lx('Zoom in', '放大')) + '">+</button><button type="button" class="sld-b" data-sld-z="0">' + escH(Lx('Fit', '适应宽度')) + '</button></span>' +
      (modal ? '' : '<button type="button" class="sld-b" data-sld-full>' + IC.full + escH(Lx('Full screen', '全屏')) + '</button>') +
      '<span class="sld-info">' + escH(Lx('Integrated SLD', '综合单线图')) + ' | ' + sizeName(r.w, r.h) + ' | ' + escH(Lx('PDF adds the equipment schedule (A3)', 'PDF另含设备表（A3）')) + '</span><span class="sld-sp"></span>' +
      (modal ? '<button type="button" class="sld-b" data-sldx>✕ ' + escH(Lx('Close', '关闭')) + '</button>' : '') + '</div>' +
      '<div class="sld-view" data-sld-view><div class="sld-canvas" data-sld-canvas>' + r.svg + '</div></div>' +
      '<div class="sld-note">' + escH(Lx('Drawn from the current design — every change redraws it. Drag to pan; Ctrl + wheel or + / − to zoom. Planning drawing, not for construction.', '按当前设计绘制——任何修改都会重新生成。拖动平移；Ctrl+滚轮或+/−缩放。规划用图，不得用于施工。')) + '</div>';
  }
  function setZoom(host, z, cx, cy) {
    var st = host.__sld, view = host.querySelector('[data-sld-view]'), cv0 = host.querySelector('[data-sld-canvas]'); if (!st || !view || !cv0) return;
    var old = st.z, fx = cx === undefined ? 0.5 : cx, fy = cy === undefined ? 0.5 : cy;
    var px = (view.scrollLeft + fx * view.clientWidth) / Math.max(1, cv0.offsetWidth), py = (view.scrollTop + fy * view.clientHeight) / Math.max(1, cv0.offsetHeight);
    st.z = z; cv0.style.width = (z * 100) + '%';
    var zl = host.querySelector('[data-sld-zl]'); if (zl) zl.textContent = Math.round(z * 100) + '%';
    if (old !== z) { view.scrollLeft = px * cv0.offsetWidth - fx * view.clientWidth; view.scrollTop = py * cv0.offsetHeight - fy * view.clientHeight; }
  }
  function wire(host) {
    if (host.__wired) return; host.__wired = true;
    host.addEventListener('click', function (ev) {
      var t = ev.target.closest('button'); if (!t || !host.contains(t)) return; var st = host.__sld; if (!st) return;
      if (t.hasAttribute('data-sld-pdf')) { try { downloadPDF(st.x, st.opt); } catch (e) { console.error(e); } return; }
      if (t.hasAttribute('data-sld-full')) { open(st.x, st.opt); return; }
      if (t.hasAttribute('data-sld-z')) { var dz = +t.getAttribute('data-sld-z'), i = ZOOM.indexOf(st.z); if (!dz) setZoom(host, 1); else setZoom(host, ZOOM[Math.max(0, Math.min(ZOOM.length - 1, (i < 0 ? 0 : i) + dz))]); }
    });
    host.addEventListener('wheel', function (ev) {
      if (!ev.ctrlKey) return; var view = host.querySelector('[data-sld-view]'); if (!view || !view.contains(ev.target)) return; ev.preventDefault();
      var st = host.__sld, i = ZOOM.indexOf(st.z), r = view.getBoundingClientRect(), nz = ZOOM[Math.max(0, Math.min(ZOOM.length - 1, (i < 0 ? 0 : i) + (ev.deltaY < 0 ? 1 : -1)))];
      setZoom(host, nz, (ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height);
    }, { passive: false });
    var drag = null;
    host.addEventListener('pointerdown', function (ev) { var view = ev.target.closest('[data-sld-view]'); if (!view || ev.button !== 0 || ev.pointerType === 'touch') return; drag = { v: view, x: ev.clientX, y: ev.clientY, l: view.scrollLeft, t: view.scrollTop }; view.classList.add('drag'); });
    window.addEventListener('pointermove', function (ev) { if (!drag) return; drag.v.scrollLeft = drag.l - (ev.clientX - drag.x); drag.v.scrollTop = drag.t - (ev.clientY - drag.y); });
    window.addEventListener('pointerup', function () { if (drag) { drag.v.classList.remove('drag'); drag = null; } });
  }
  /* inline viewer (assessment page, simulation): keeps the zoom when the design is redrawn */
  function mount(host, x, opt) {
    opt = opt || {};
    var z = host.__sld ? host.__sld.z : 1, r = buildSVG(x, opt);
    host.innerHTML = viewerHTML(r, false); host.__sld = { x: x, opt: opt, z: 1 }; wire(host);
    if (z !== 1) setZoom(host, z);
    return r;
  }
  var MODAL = null;
  function escKey(ev) { if (ev.key === 'Escape') { ev.stopPropagation(); ev.preventDefault(); close(); } }
  function close() { if (!MODAL) return; MODAL.remove(); MODAL = null; document.removeEventListener('keydown', escKey, true); document.documentElement.classList.remove('sld-lock'); }
  function open(x, opt) {
    close(); opt = opt || {};
    var d = document.createElement('div'), r = buildSVG(x, opt); d.className = 'sld-modal'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', Lx('Single-line diagram', '单线图'));
    d.innerHTML = '<div class="sld-box"><div class="sld-head"><b>' + escH(Lx('Single-line diagram', '单线图')) + '</b><span>' + escH(opt.name || '') + '</span></div><div class="sld-host">' + viewerHTML(r, true) + '</div></div>';
    var host = d.querySelector('.sld-host'); host.__sld = { x: x, opt: opt, z: 1 }; wire(host);
    d.addEventListener('click', function (ev) { if (ev.target === d || ev.target.closest('[data-sldx]')) close(); });
    document.addEventListener('keydown', escKey, true); document.body.appendChild(d); MODAL = d; document.documentElement.classList.add('sld-lock');
    var b = d.querySelector('[data-sldx]'); if (b) b.focus();
  }
  g.DCSLD = { build: build, buildSVG: buildSVG, mount: mount, open: open, close: close, downloadPDF: downloadPDF, fileName: fileName };
  if (typeof module !== 'undefined' && module.exports) module.exports = g.DCSLD;
})(typeof window !== 'undefined' ? window : globalThis);
