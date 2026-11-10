/* DCDwg — AutoCAD drawing writer (DWG R2000 / AC1015, opened by AutoCAD 2000 … current and by other DWG-based CAD), no external library.
   Same page API as DCPdf / DCSvg (line, poly, rect, circle, arc, text; millimetres, origin top-left), so the single-line diagram is drawn once
   for three outputs. Every sheet becomes block definitions inserted in model space at 1:1 (mm):
     • the drawing of the sheet as one block (edit it with BEDIT),
     • the sheet frame with its zone marks as a block per sheet size,
     • the title block (ISO 7200) as a block whose variable fields are attributes (ATTEDIT / EATTEDIT; definition in BEDIT).
   Layers: DC-SLD, DC-SLD-TYPICAL (dashed), DC-SLD-FILL, DC-SLD-TEXT, DC-FRAME, DC-TITLE; colour 7, lineweights from the drawing.
   Text: TrueType Arial / Arial Bold (metric-compatible with the Helvetica widths used for the layout); Chinese drawings SimHei
   (simhei.ttf); characters outside ASCII as \U+ escapes. Tested by opening, auditing and plotting in AutoCAD 2021.
   Reference: Open Design Alliance, Open Design Specification for .dwg files v5.4.1 (R13–R15 file organisation, AcDb:Header, AcDb:Classes,
   AcDbObjects, object map). */
(function (g) {
  'use strict';
  var PDF = g.DCPdf || (typeof require === 'function' ? require('./pdfw.js').DCPdf : null);

  /* ------------------------------------------------------------------ CRC (DWG 16-bit, table of the CRC-16/ARC polynomial) */
  var CRCT = (function () { var t = []; for (var i = 0; i < 256; i++) { var c = i; for (var k = 0; k < 8; k++) c = (c & 1) ? (c >>> 1) ^ 0xA001 : c >>> 1; t.push(c); } return t; })();
  function crc16(seed, b, from, to) { var c = seed; for (var i = from || 0, n = to === undefined ? b.length : to; i < n; i++) c = (c >>> 8) ^ CRCT[(c ^ b[i]) & 0xFF]; return c & 0xFFFF; }

  /* ------------------------------------------------------------------ bit stream (most significant bit first, raw values little-endian) */
  function BW() { this.buf = new Uint8Array(256); this.bit = 0; }
  var W = BW.prototype;
  W.room = function (n) { var need = (this.bit + n + 7) >> 3; if (need > this.buf.length) { var nb = new Uint8Array(Math.max(need, this.buf.length * 2)); nb.set(this.buf); this.buf = nb; } };
  W.b = function (v) { this.room(1); if (v) this.buf[this.bit >> 3] |= 0x80 >> (this.bit & 7); this.bit++; };
  W.bits = function (v, n) { for (var i = n - 1; i >= 0; i--) this.b((v >>> i) & 1); };
  W.rc = function (v) { this.bits(v & 0xFF, 8); };
  W.rs = function (v) { v &= 0xFFFF; this.rc(v & 0xFF); this.rc(v >>> 8); };
  W.rl = function (v) { v = v >>> 0; this.rc(v & 0xFF); this.rc((v >>> 8) & 0xFF); this.rc((v >>> 16) & 0xFF); this.rc((v >>> 24) & 0xFF); };
  var DV = new DataView(new ArrayBuffer(8));
  W.rd = function (d) { DV.setFloat64(0, d, true); for (var i = 0; i < 8; i++) this.rc(DV.getUint8(i)); };
  W.bb = function (v) { this.bits(v, 2); };
  W.bs = function (v) { if (v === 0) this.bb(2); else if (v === 256) this.bb(3); else if (v > 0 && v < 256) { this.bb(1); this.rc(v); } else { this.bb(0); this.rs(v); } };
  W.bl = function (v) { if (v === 0) this.bb(2); else if (v > 0 && v < 256) { this.bb(1); this.rc(v); } else { this.bb(0); this.rl(v); } };
  W.bd = function (d) { if (d === 0 && 1 / d > 0) this.bb(2); else if (d === 1) this.bb(1); else { this.bb(0); this.rd(d); } };
  W.dd = function (d, def) { if (d === def) this.bb(0); else { this.bb(3); this.rd(d); } };
  W.p2 = function (x, y) { this.rd(x); this.rd(y); };
  W.p3 = function (x, y, z) { this.bd(x); this.bd(y); this.bd(z); };
  W.tv = function (s) { var a = enc(s); if (a.length) a.push(0); this.bs(a.length); for (var i = 0; i < a.length; i++) this.rc(a[i]); };   /* AutoCAD writes R2000 strings with the terminating NUL counted */
  W.h = function (code, v) { var a = []; v = v || 0; while (v > 0) { a.unshift(v & 0xFF); v = Math.floor(v / 256); } this.rc((code << 4) | a.length); for (var i = 0; i < a.length; i++) this.rc(a[i]); };
  W.bytes = function () { return this.buf.slice(0, (this.bit + 7) >> 3); };
  W.append = function (o) { for (var i = 0; i < o.bit; i++) this.b((o.buf[i >> 3] >> (7 - (i & 7))) & 1); };
  W.rlAt = function (pos, v) { var s = this.bit; this.bit = pos; this.rl(v); this.bit = s; };   /* the field was written as 0 */

  /* text: printable ASCII as is, everything else as \U+XXXX (AutoCAD's escape for characters outside the drawing code page) */
  function enc(s) {
    var out = []; s = String(s === undefined || s === null ? '' : s);
    for (var i = 0; i < s.length; i++) {
      var u = s.charCodeAt(i);
      if (u >= 32 && u <= 126) out.push(u);
      else if (u === 9) out.push(32);
      else { var hx = ('000' + u.toString(16).toUpperCase()).slice(-4), q = '\\U+' + hx; for (var k = 0; k < q.length; k++) out.push(q.charCodeAt(k)); }
    }
    return out;
  }

  /* ------------------------------------------------------------------ byte assembly helpers */
  function Bytes() { this.parts = []; this.len = 0; }
  Bytes.prototype.add = function (a) { var u = a instanceof Uint8Array ? a : new Uint8Array(a); this.parts.push(u); this.len += u.length; return this; };
  Bytes.prototype.out = function () { var o = new Uint8Array(this.len), p = 0; this.parts.forEach(function (u) { o.set(u, p); p += u.length; }); return o; };
  function le32(v) { v = v >>> 0; return [v & 0xFF, (v >>> 8) & 0xFF, (v >>> 16) & 0xFF, (v >>> 24) & 0xFF]; }
  function le16(v) { return [v & 0xFF, (v >>> 8) & 0xFF]; }
  function ms(n) { var a = []; while (n >= 0x8000) { a.push(n & 0xFF, ((n >>> 8) & 0x7F) | 0x80); n = n >>> 15; } a.push(n & 0xFF, (n >>> 8) & 0xFF); return a; }
  function mcU(n) { var a = []; while (n >= 0x80) { a.push((n & 0x7F) | 0x80); n = Math.floor(n / 128); } a.push(n); return a; }
  function mcS(n) { var neg = n < 0, a = []; n = Math.abs(n); while (n >= 0x40) { a.push((n & 0x7F) | 0x80); n = Math.floor(n / 128); } a.push(n | (neg ? 0x40 : 0)); return a; }
  var SN = {
    hs: [0xCF, 0x7B, 0x1F, 0x23, 0xFD, 0xDE, 0x38, 0xA9, 0x5F, 0x7C, 0x68, 0xB8, 0x4E, 0x6D, 0x33, 0x5F], he: [0x30, 0x84, 0xE0, 0xDC, 0x02, 0x21, 0xC7, 0x56, 0xA0, 0x83, 0x97, 0x47, 0xB1, 0x92, 0xCC, 0xA0],
    cs: [0x8D, 0xA1, 0xC4, 0xB8, 0xC4, 0xA9, 0xF8, 0xC5, 0xC0, 0xDC, 0xF4, 0x5F, 0xE7, 0xCF, 0xB6, 0x8A], ce: [0x72, 0x5E, 0x3B, 0x47, 0x3B, 0x56, 0x07, 0x3A, 0x3F, 0x23, 0x0B, 0xA0, 0x18, 0x30, 0x49, 0x75],
    fh: [0x95, 0xA0, 0x4E, 0x28, 0x99, 0x82, 0x1A, 0xE5, 0x5E, 0x41, 0xE0, 0x5F, 0x9D, 0x3A, 0x4D, 0x00],
    is: [0x1F, 0x25, 0x6D, 0x07, 0xD4, 0x36, 0x28, 0x28, 0x9D, 0x57, 0xCA, 0x3F, 0x9D, 0x44, 0x10, 0x2B], ie: [0xE0, 0xDA, 0x92, 0xF8, 0x2B, 0xC9, 0xD7, 0xD7, 0x62, 0xA8, 0x35, 0xC0, 0x62, 0xBB, 0xEF, 0xD4]
  };
  /* a section with sentinels: SN, RL size, data, RS CRC (seed 0xC0C1 over size + data), SN */
  function section(s0, data, s1) { var head = le32(data.length), body = new Uint8Array(4 + data.length); body.set(head, 0); body.set(data, 4); var c = crc16(0xC0C1, body); return new Bytes().add(s0).add(body).add(le16(c)).add(s1).out(); }

  /* ------------------------------------------------------------------ object types, lineweights */
  var T = { TEXT: 1, ATTRIB: 2, ATTDEF: 3, BLOCK: 4, ENDBLK: 5, SEQEND: 6, INSERT: 7, ARC: 17, CIRCLE: 18, LINE: 19, SOLID: 31, DICTIONARY: 42,
    BLOCK_CONTROL: 48, BLOCK_HEADER: 49, LAYER_CONTROL: 50, LAYER: 51, STYLE_CONTROL: 52, STYLE: 53, LTYPE_CONTROL: 56, LTYPE: 57, VIEW_CONTROL: 60,
    UCS_CONTROL: 62, VPORT_CONTROL: 64, VPORT: 65, APPID_CONTROL: 66, APPID: 67, DIMSTYLE_CONTROL: 68, DIMSTYLE: 69, VX_CONTROL: 70, MLINESTYLE: 73, LWPLINE: 77,
    DICTIONARYWDFLT: 500, PLACEHOLDER: 501, LAYOUT: 502 };
  var CLASSES = [['ACDBDICTIONARYWDFLT', 'AcDbDictionaryWithDefault'], ['ACDBPLACEHOLDER', 'AcDbPlaceHolder'], ['LAYOUT', 'AcDbLayout']];
  var LWV = [0, 0.05, 0.09, 0.13, 0.15, 0.18, 0.20, 0.25, 0.30, 0.35, 0.40, 0.50, 0.53, 0.60, 0.70, 0.80, 0.90, 1.00, 1.06, 1.20, 1.40, 1.58, 2.00, 2.11];
  var LW_BYLAYER = 29;
  function lwIndex(mm) { if (!(mm > 0)) return LW_BYLAYER; var best = 1, d = 1e9; for (var i = 1; i < LWV.length; i++) { var q = Math.abs(LWV[i] - mm); if (q < d) { d = q; best = i; } } return best; }
  function isPaper(c) { return !!c && /^#f{3}(f{3})?$/i.test(c); }

  /* ------------------------------------------------------------------ drawing pages (recorded primitives) */
  function create(opt) {
    opt = opt || {};
    var pages = [];
    function Page(w, h, name) { this.W = w; this.H = h; this.name = name || ''; this.items = []; this.grp = null; this.base = null; }
    var P = Page.prototype;
    /* group: null = the drawing, 'frame' = border and zones, 'title' = title block (base = its bottom-right corner, page coordinates) */
    P.group = function (gname, base) { this.grp = gname || null; if (gname === 'title' && base && !this.base) this.base = base; return this; };
    P.add = function (it) { it.g = this.grp; this.items.push(it); return this; };
    P.line = function (x1, y1, x2, y2, o) { o = o || {}; return this.add({ k: 'L', x1: x1, y1: y1, x2: x2, y2: y2, w: o.w || 0.25, dash: !!o.dash }); };
    P.poly = function (pts, o) { o = o || {}; if (!pts || !pts.length) return this; return this.add({ k: 'P', pts: pts.map(function (q) { return [q[0], q[1]]; }), close: !!(o.close || o.fill), fill: o.fill, stroke: o.stroke !== false, w: o.w || 0.25, dash: !!o.dash }); };
    P.rect = function (x, y, w, h, o) { o = o || {}; return this.add({ k: 'R', x: x, y: y, w: w, h: h, fill: o.fill, stroke: o.stroke !== false, lw: o.w || 0.25, dash: !!o.dash }); };
    P.circle = function (cx, cy, r, o) { o = o || {}; return this.add({ k: 'C', cx: cx, cy: cy, r: r, fill: o.fill, stroke: o.stroke !== false, w: o.w || 0.25 }); };
    P.arc = function (cx, cy, r, a0, a1, o) { o = o || {}; return this.add({ k: 'A', cx: cx, cy: cy, r: r, a0: a0, a1: a1, w: o.w || 0.25, dash: !!o.dash }); };
    P.textW = function (s, h, b) { return PDF.textW(s, h, b); };
    P.text = function (x, y, str, o) { o = o || {}; str = String(str === undefined || str === null ? '' : str); if (!str && !o.tag) return this; return this.add({ k: 'T', x: x, y: y, s: str, h: o.h || 2.5, a: o.a, v: o.v, b: !!o.b, rot: o.rot || 0, tag: o.tag, prompt: o.prompt }); };
    function page(w, h, name) { var p = new Page(w || 420, h || 297, name); pages.push(p); return p; }
    function output() { return writeDwg(pages, opt); }
    return { page: page, pages: pages, output: output, blob: function () { return new Blob([output()], { type: 'application/acad' }); } };
  }

  /* ------------------------------------------------------------------ geometry: page primitives → CAD entities (y up, block base at the origin) */
  var TXT_H = 0.716;   /* Arial cap height / em: TEXT height in AutoCAD is the cap height, so the widths equal the Helvetica layout widths */
  function clipOut(seg, m) {   /* parts of segment seg = [x1, y1, x2, y2] outside mask m (rect or circle); returns a list of segments */
    var x1 = seg[0], y1 = seg[1], dx = seg[2] - x1, dy = seg[3] - y1, t0, t1;
    if (m.r) {
      var fx = x1 - m.cx, fy = y1 - m.cy, a = dx * dx + dy * dy, b = 2 * (fx * dx + fy * dy), c = fx * fx + fy * fy - m.r * m.r, disc = b * b - 4 * a * c;
      if (a < 1e-12 || disc <= 0) return [seg]; var sq = Math.sqrt(disc); t0 = (-b - sq) / (2 * a); t1 = (-b + sq) / (2 * a);
    } else {
      t0 = 0; t1 = 1; var p = [-dx, dx, -dy, dy], q = [x1 - m.x0, m.x1 - x1, y1 - m.y0, m.y1 - y1];
      for (var i = 0; i < 4; i++) { if (Math.abs(p[i]) < 1e-12) { if (q[i] < 0) return [seg]; } else { var r = q[i] / p[i]; if (p[i] < 0) { if (r > t1) return [seg]; if (r > t0) t0 = r; } else { if (r < t0) return [seg]; if (r < t1) t1 = r; } } }
    }
    t0 = Math.max(0, t0); t1 = Math.min(1, t1); if (t1 <= t0) return [seg];
    var out = [], L = Math.sqrt(dx * dx + dy * dy);
    if (t0 * L > 1.2) out.push([x1, y1, x1 + dx * t0, y1 + dy * t0]);   /* pieces shorter than 1.2 mm left between masks (rows of labels) are dropped */
    if ((1 - t1) * L > 1.2) out.push([x1 + dx * t1, y1 + dy * t1, seg[2], seg[3]]);
    return out;
  }
  function entitiesOf(items, H, ox, oy, lay) {   /* ox, oy: block base in CAD coordinates */
    var ents = [], lines = [];
    function Y(y) { return H - y - oy; } function X(x) { return x - ox; }
    function mask(m) { lines.forEach(function (ln) { if (ln.dead) return; var parts = [ln.seg]; parts = parts.reduce(function (acc, s) { return acc.concat(clipOut(s, m)); }, []); if (parts.length === 1 && parts[0] === ln.seg) return; ln.dead = true; parts.forEach(function (s) { var n = { t: 'LINE', layer: ln.layer, lw: ln.lw, seg: s }; ents.push(n); lines.push(n); }); }); }
    function lwp(pts, closed, lw, layer, width, bulges) { ents.push({ t: 'LWPLINE', layer: layer, lw: lw, pts: pts, closed: closed, width: width || 0, bulges: bulges }); }
    function solid(pts, layer) { var a = pts[0], b = pts[1], c = pts[2], d = pts[3] || pts[2]; ents.push({ t: 'SOLID', layer: layer, lw: LW_BYLAYER, pts: [a, b, d, c] }); }
    items.forEach(function (it) {
      var dashL = it.dash ? lay.typ : lay.line;
      if (it.k === 'L') { var n = { t: 'LINE', layer: dashL, lw: lwIndex(it.w), seg: [X(it.x1), Y(it.y1), X(it.x2), Y(it.y2)] }; ents.push(n); lines.push(n); return; }
      if (it.k === 'P') {
        var pts = it.pts.map(function (q) { return [X(q[0]), Y(q[1])]; });
        if (it.fill && !isPaper(it.fill)) { if (pts.length === 4) solid(pts, lay.fill); else for (var i = 1; i + 1 < pts.length; i++) solid([pts[0], pts[i], pts[i + 1]], lay.fill); return; }
        if (it.fill && isPaper(it.fill)) { var bx = pts.map(function (q) { return q[0]; }), by = pts.map(function (q) { return q[1]; }); mask({ x0: Math.min.apply(null, bx), x1: Math.max.apply(null, bx), y0: Math.min.apply(null, by), y1: Math.max.apply(null, by) }); }
        if (it.stroke) { if (pts.length === 2 && !it.close) { var n2 = { t: 'LINE', layer: dashL, lw: lwIndex(it.w), seg: [pts[0][0], pts[0][1], pts[1][0], pts[1][1]] }; ents.push(n2); lines.push(n2); } else lwp(pts, it.close, lwIndex(it.w), dashL); }
        return;
      }
      if (it.k === 'R') {
        var x0 = X(it.x), x1 = X(it.x + it.w), y1 = Y(it.y), y0 = Y(it.y + it.h);
        if (it.fill && !isPaper(it.fill)) {   /* filled bar (busbar): a polyline with the bar thickness as width; otherwise a solid */
          var bw = x1 - x0, bh = y1 - y0;
          if (bw >= 3 * bh) lwp([[x0, (y0 + y1) / 2], [x1, (y0 + y1) / 2]], false, LW_BYLAYER, lay.fill, bh);
          else if (bh >= 3 * bw) lwp([[(x0 + x1) / 2, y0], [(x0 + x1) / 2, y1]], false, LW_BYLAYER, lay.fill, bw);
          else solid([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], lay.fill);
          return;
        }
        if (it.fill && isPaper(it.fill)) mask({ x0: x0, x1: x1, y0: y0, y1: y1 });
        if (it.stroke) lwp([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], true, lwIndex(it.lw), it.dash ? lay.typ : lay.line);
        return;
      }
      if (it.k === 'C') {
        var cx = X(it.cx), cy = Y(it.cy);
        if (it.fill && !isPaper(it.fill)) { lwp([[cx - it.r / 2, cy], [cx + it.r / 2, cy]], true, LW_BYLAYER, lay.fill, it.r, [1, 1]); return; }   /* filled dot: donut */
        if (it.fill && isPaper(it.fill)) mask({ cx: cx, cy: cy, r: it.r });
        if (it.stroke) ents.push({ t: 'CIRCLE', layer: lay.line, lw: lwIndex(it.w), cx: cx, cy: cy, r: it.r });
        return;
      }
      if (it.k === 'A') { var a0 = Math.min(it.a0, it.a1), a1 = Math.max(it.a0, it.a1); ents.push({ t: 'ARC', layer: it.dash ? lay.typ : lay.line, lw: lwIndex(it.w), cx: X(it.cx), cy: Y(it.cy), r: it.r, a0: a0 * Math.PI / 180, a1: a1 * Math.PI / 180 }); return; }
      if (it.k === 'T') {
        var h = it.h, tw = PDF.textW(it.s, h, it.b), dx = it.a === 'c' ? -tw / 2 : (it.a === 'r' ? -tw : 0), dy = it.v === 'm' ? 0.35 * h : (it.v === 't' ? 0.75 * h : 0);
        var rot = it.rot * Math.PI / 180, cs = Math.cos(rot), sn = Math.sin(rot), bx2 = it.x + dx * cs + dy * sn, by2 = it.y - dx * sn + dy * cs;
        var sx = X(bx2), sy = Y(by2), k = it.a === 'c' ? 0.5 : (it.a === 'r' ? 1 : 0);
        ents.push({ t: it.tag ? 'ATTDEF' : 'TEXT', layer: lay.text, lw: LW_BYLAYER, x: sx, y: sy, ax: sx + k * tw * cs, ay: sy + k * tw * sn, halign: it.a === 'c' ? 1 : (it.a === 'r' ? 2 : 0), h: TXT_H * h, rot: rot, s: it.s, bold: it.b, tag: it.tag, prompt: it.prompt || it.tag });
      }
    });
    return ents.filter(function (e) { return !e.dead; });
  }

  /* ------------------------------------------------------------------ the drawing database and the DWG file */
  function writeDwg(pages, opt) {
    var objs = {}, next = 1, list = [];
    function H() { return next++; }
    function add(o) { objs[o.h] = o; list.push(o); return o; }
    var zh = opt.lang === 'zh';
    /* handles */
    var hBlkC = H(), hLayC = H(), hStyC = H(), hLtC = H(), hViewC = H(), hUcsC = H(), hVpC = H(), hAppC = H(), hDimC = H(), hVxC = H();
    var hNod = H(), hDGroup = H(), hDMl = H(), hDLayout = H(), hDPlotSet = H(), hDPlotSty = H(), hPh = H(), hMl = H();
    var LAYERS = [['0', 7, 25, 'C'], ['DC-SLD', 7, 35, 'C'], ['DC-SLD-TYPICAL', 7, 35, 'D'], ['DC-SLD-FILL', 7, 25, 'C'], ['DC-SLD-TEXT', 7, 25, 'C'], ['DC-FRAME', 7, 50, 'C'], ['DC-TITLE', 7, 35, 'C']].map(function (l) { return { name: l[0], color: l[1], lw: l[2], lt: l[3], h: H() }; });
    var LY = {}; LAYERS.forEach(function (l) { LY[l.name] = l.h; });
    var hLtByBlock = H(), hLtByLayer = H(), hLtCont = H(), hLtDash = H();
    var STY = [['Standard', 'txt', ''], ['DC-SLD', zh ? 'simhei.ttf' : 'arial.ttf', ''], ['DC-SLD-BOLD', zh ? 'simhei.ttf' : 'arialbd.ttf', '']].map(function (s) { return { name: s[0], font: s[1], big: s[2], h: H() }; });
    var hStd = STY[0].h, hSty = STY[1].h, hStyB = STY[2].h;
    var hApp = H(), hDim = H(), hVp = H();
    var hBhModel = H(), hBhPaper = H(), hBlkModel = H(), hEndModel = H(), hBlkPaper = H(), hEndPaper = H(), hLayoutModel = H(), hLayoutPaper = H();

    /* blocks from the pages */
    var lay = { line: LY['DC-SLD'], typ: LY['DC-SLD-TYPICAL'], fill: LY['DC-SLD-FILL'], text: LY['DC-SLD-TEXT'] };
    var layF = { line: LY['DC-FRAME'], typ: LY['DC-FRAME'], fill: LY['DC-FRAME'], text: LY['DC-FRAME'] };
    var layT = { line: LY['DC-TITLE'], typ: LY['DC-TITLE'], fill: LY['DC-TITLE'], text: LY['DC-TITLE'] };
    var blocks = [], inserts = [], ox = 0, gap = 50, frames = {}, title = null, prefix = String(opt.block || 'DC-SLD').replace(/[^A-Za-z0-9_-]+/g, '-').slice(0, 60);
    function block(name, ents, hasAtt) { var b = { name: name, ents: ents, hasAtt: !!hasAtt, h: H(), hBlk: H(), hEnd: H(), inserts: [] }; blocks.push(b); return b; }
    var ext = [Infinity, Infinity, -Infinity, -Infinity];
    pages.forEach(function (pg, i) {
      var no = ('0' + (i + 1)).slice(-2), body = pg.items.filter(function (it) { return !it.g; }), fr = pg.items.filter(function (it) { return it.g === 'frame'; }), tb = pg.items.filter(function (it) { return it.g === 'title'; });
      var bContent = block(prefix + '-' + no, entitiesOf(body, pg.H, 0, 0, lay));
      inserts.push({ b: bContent, x: ox, y: 0 });
      if (fr.length) { var fk = Math.round(pg.W) + 'x' + Math.round(pg.H); if (!frames[fk]) frames[fk] = block('DC-FRAME-' + (pg.name || fk), entitiesOf(fr, pg.H, 0, 0, layF)); inserts.push({ b: frames[fk], x: ox, y: 0 }); }
      if (tb.length) {
        var base = pg.base || [pg.W - 10, pg.H - 10], bx = base[0], by = pg.H - base[1];
        var te = entitiesOf(tb, pg.H, bx, by, layT);
        if (!title) title = block('DC-TITLE-BLOCK', te, te.some(function (e) { return e.t === 'ATTDEF'; }));
        var vals = {}; te.forEach(function (e) { if (e.t === 'ATTDEF') vals[e.tag] = e.s; });
        inserts.push({ b: title, x: ox + bx, y: by, vals: vals });
      }
      ext = [Math.min(ext[0], ox), Math.min(ext[1], 0), Math.max(ext[2], ox + pg.W), Math.max(ext[3], pg.H)];
      ox += pg.W + gap;
    });
    if (!isFinite(ext[0])) ext = [0, 0, 420, 297];

    /* -------------------------------------------------------------- object serialisation */
    function out(o) {
      var d = new BW(), hs = new BW();
      d.bs(o.type); var rlPos = d.bit; d.rl(0); d.h(0, o.h); d.bs(0);
      var reac = o.reactors || [];
      if (o.ent) { d.b(0); d.bb(o.mode); d.bl(0); d.b(0); d.bs(o.color === undefined ? 256 : o.color); d.bd(1); d.bb(0); d.bb(0); d.bs(0); d.rc(o.lw === undefined ? LW_BYLAYER : o.lw); }
      else d.bl(reac.length);
      if (o.data) o.data(d);
      d.rlAt(rlPos, d.bit);
      if (o.ent) {
        if (o.mode === 0) hs.h(4, o.owner);
        hs.h(3, 0);
        hs.h(4, o.prev || 0); hs.h(4, o.next || 0);
        hs.h(5, o.layer || LY['0']);
      } else { hs.h(4, o.parent || 0); reac.forEach(function (r) { hs.h(4, r); }); hs.h(3, 0); }
      if (o.hnd) o.hnd(hs);
      d.append(hs);
      var data = d.bytes(), m = ms(data.length), all = new Uint8Array(m.length + data.length + 2); all.set(m, 0); all.set(data, m.length);
      var c = crc16(0xC0C1, all, 0, m.length + data.length); all[all.length - 2] = c & 0xFF; all[all.length - 1] = c >>> 8;
      return all;
    }
    function tableEntry(name, w) { w.tv(name); w.b(1); w.bs(0); w.b(0); }

    /* control objects */
    function control(h, type, entries, extraHard, n) { add({ h: h, type: type, data: function (w) { w.bl(n === undefined ? entries.length : n); if (type === T.DIMSTYLE_CONTROL) w.rc(0); }, hnd: function (w) { entries.forEach(function (e) { w.h(2, e); }); (extraHard || []).forEach(function (e) { w.h(3, e); }); } }); }
    var userBlocks = blocks.map(function (b) { return b.h; });
    control(hBlkC, T.BLOCK_CONTROL, userBlocks, [hBhModel, hBhPaper]);
    control(hLayC, T.LAYER_CONTROL, LAYERS.map(function (l) { return l.h; }));
    control(hStyC, T.STYLE_CONTROL, STY.map(function (s) { return s.h; }));
    control(hLtC, T.LTYPE_CONTROL, [hLtCont, hLtDash], [hLtByBlock, hLtByLayer]);
    control(hViewC, T.VIEW_CONTROL, []);
    control(hUcsC, T.UCS_CONTROL, []);
    control(hVpC, T.VPORT_CONTROL, [hVp]);
    control(hAppC, T.APPID_CONTROL, [hApp]);
    control(hDimC, T.DIMSTYLE_CONTROL, [hDim]);
    control(hVxC, T.VX_CONTROL, []);

    /* dictionaries */
    function dict(h, parent, names, items, type, def) {
      add({ h: h, type: type || T.DICTIONARY, parent: parent, reactors: parent ? [parent] : [], data: function (w) { w.bl(names.length); w.bs(1); w.rc(0); names.forEach(function (n) { w.tv(n); }); },
        hnd: function (w) { items.forEach(function (it) { w.h(2, it); }); if (def) w.h(5, def); } });
    }
    dict(hNod, 0, ['ACAD_GROUP', 'ACAD_LAYOUT', 'ACAD_MLINESTYLE', 'ACAD_PLOTSETTINGS', 'ACAD_PLOTSTYLENAME'], [hDGroup, hDLayout, hDMl, hDPlotSet, hDPlotSty]);
    dict(hDGroup, hNod, [], []);
    dict(hDLayout, hNod, ['Layout1', 'Model'], [hLayoutPaper, hLayoutModel]);
    dict(hDMl, hNod, ['Standard'], [hMl]);
    dict(hDPlotSet, hNod, [], []);
    dict(hDPlotSty, hNod, ['Normal'], [hPh], T.DICTIONARYWDFLT, hPh);
    add({ h: hPh, type: T.PLACEHOLDER, parent: hDPlotSty, reactors: [hDPlotSty] });
    add({ h: hMl, type: T.MLINESTYLE, parent: hDMl, reactors: [hDMl], data: function (w) { w.tv('Standard'); w.tv(''); w.bs(0); w.bs(256); w.bd(Math.PI / 2); w.bd(Math.PI / 2); w.rc(2); w.bd(0.5); w.bs(256); w.bs(32767); w.bd(-0.5); w.bs(256); w.bs(32767); } });

    /* layers, linetypes, text styles, appid, dimstyle, viewport */
    LAYERS.forEach(function (l) {
      add({ h: l.h, type: T.LAYER, parent: hLayC, data: function (w) { tableEntry(l.name, w); w.bs(16 | (lwIndex(l.lw / 100) << 5)); w.bs(l.color); },
        hnd: function (w) { w.h(5, 0); w.h(5, hPh); w.h(5, l.lt === 'D' ? hLtDash : hLtCont); } });
    });
    function ltype(h, name, desc, dashes) {
      add({ h: h, type: T.LTYPE, parent: hLtC, data: function (w) {
        tableEntry(name, w); w.tv(desc); w.bd(dashes.reduce(function (a, q) { return a + Math.abs(q); }, 0)); w.rc(65); w.rc(dashes.length);
        dashes.forEach(function (q) { w.bd(q); w.bs(0); w.rd(0); w.rd(0); w.bd(1); w.bd(0); w.bs(0); });
        for (var i = 0; i < 256; i++) w.rc(0);
      }, hnd: function (w) { w.h(5, 0); dashes.forEach(function () { w.h(5, 0); }); } });
    }
    ltype(hLtByBlock, 'ByBlock', '', []); ltype(hLtByLayer, 'ByLayer', '', []); ltype(hLtCont, 'Continuous', 'Solid line', []);
    ltype(hLtDash, 'DC_DASH', 'Typical connection __ __ __', [1.6, -1.0]);
    STY.forEach(function (s) { add({ h: s.h, type: T.STYLE, parent: hStyC, data: function (w) { tableEntry(s.name, w); w.b(0); w.b(0); w.bd(0); w.bd(1); w.bd(0); w.rc(0); w.bd(2.5); w.tv(s.font); w.tv(s.big); }, hnd: function (w) { w.h(5, 0); } }); });
    add({ h: hApp, type: T.APPID, parent: hAppC, data: function (w) { tableEntry('ACAD', w); w.rc(0); }, hnd: function (w) { w.h(5, 0); } });
    add({ h: hDim, type: T.DIMSTYLE, parent: hDimC, data: function (w) {
      tableEntry('ISO-25', w); w.tv(''); w.tv('');
      [1, 2.5, 0.625, 3.75, 1.25, 0, 0, 0, 0].forEach(function (v) { w.bd(v); });
      w.b(0); w.b(0); w.b(0); w.b(0); w.b(0); w.b(0); w.bs(1); w.bs(8); w.bs(0);
      [2.5, 2.5, 0, 0.0394, 1, 0, 1, 0.625, 0].forEach(function (v) { w.bd(v); });
      w.b(0); w.bs(3); w.b(1); w.b(0); w.b(0); w.b(0); w.bs(0); w.bs(0); w.bs(0);
      w.bs(0); w.bs(2); w.bs(2); w.bs(2); w.bs(3); w.bs(0); w.bs(0); w.bs(2); w.bs(44); w.bs(0); w.bs(0); w.b(0); w.b(0); w.bs(0); w.bs(8); w.bs(0); w.bs(0); w.b(0); w.bs(3);
      w.bs(-2); w.bs(-2); w.b(0);
    }, hnd: function (w) { w.h(5, 0); w.h(5, hStd); w.h(5, 0); w.h(5, 0); w.h(5, 0); w.h(5, 0); } });
    var vw = ext[2] - ext[0], vh = ext[3] - ext[1], vcx = (ext[0] + ext[2]) / 2, vcy = (ext[1] + ext[3]) / 2, vH = Math.max(vh, vw / 1.6) * 1.05;
    add({ h: hVp, type: T.VPORT, parent: hVpC, data: function (w) {
      tableEntry('*Active', w); w.bd(vH); w.bd(vH * 1.6); w.p2(vcx, vcy); w.p3(0, 0, 0); w.p3(0, 0, 1); w.bd(0); w.bd(50); w.bd(0); w.bd(0); w.b(0); w.b(0); w.b(0); w.b(1); w.rc(0);
      w.p2(0, 0); w.p2(1, 1); w.b(0); w.bs(1000); w.b(1); w.b(1); w.b(1); w.b(0); w.p2(10, 10); w.b(0); w.b(0); w.bs(0); w.bd(0); w.p2(0, 0); w.p2(10, 10);
      w.b(0); w.b(1); w.p3(0, 0, 0); w.p3(1, 0, 0); w.p3(0, 1, 0); w.bd(0); w.bs(0);
    }, hnd: function (w) { w.h(5, 0); w.h(5, 0); w.h(5, 0); } });

    /* layouts */
    function layout(h, name, tab, flag, bh, vp, paper) {
      add({ h: h, type: T.LAYOUT, parent: hDLayout, reactors: [hDLayout], data: function (w) {
        w.tv(''); w.tv('none_device'); w.bs(paper ? 688 : 1712); w.bd(7.5); w.bd(20); w.bd(7.5); w.bd(20); w.bd(420); w.bd(297); w.tv('ISO_A3_(420.00_x_297.00_MM)');
        w.bd(0); w.bd(0); w.bs(1); w.bs(paper ? 1 : 0); w.bs(paper ? 5 : 0); w.bd(0); w.bd(0); w.bd(0); w.bd(0); w.tv(''); w.bd(1); w.bd(1); w.tv(''); w.bs(paper ? 16 : 0); w.bd(1); w.bd(0); w.bd(0);
        w.tv(name); w.bl(tab); w.bs(flag); w.p3(0, 0, 0); w.p2(0, 0); w.p2(paper ? 420 : ext[2], paper ? 297 : ext[3]); w.p3(0, 0, 0); w.p3(1, 0, 0); w.p3(0, 1, 0); w.bd(0); w.bs(0);
        w.p3(paper ? 0 : ext[0], paper ? 0 : ext[1], 0); w.p3(paper ? 0 : ext[2], paper ? 0 : ext[3], 0);
      }, hnd: function (w) { w.h(4, bh); w.h(4, vp || 0); w.h(5, 0); w.h(5, 0); } });
    }
    layout(hLayoutModel, 'Model', 0, 1, hBhModel, hVp, false);
    layout(hLayoutPaper, 'Layout1', 1, 1, hBhPaper, 0, true);

    /* entities */
    function ent(o) { o.ent = true; o.h = o.h || H(); return add(o); }
    function chain(arr) { for (var i = 0; i < arr.length; i++) { arr[i].prev = i ? arr[i - 1].h : 0; arr[i].next = i + 1 < arr.length ? arr[i + 1].h : 0; } }
    function textData(e, w) {
      var f = 1 | 4 | 0x10 | 0x20, hasAl = e.halign !== 0;
      if (!hasAl) f |= 2 | 0x40; f |= 0x80; if (!e.rot) f |= 8;
      w.rc(f); w.p2(e.x, e.y); if (hasAl) { w.dd(e.ax, e.x); w.dd(e.ay, e.y); } w.b(1); w.b(1); if (!e.rot) { /* rotation 0 */ } else w.rd(e.rot);
      w.rd(e.h); w.tv(e.val !== undefined ? e.val : e.s); if (hasAl) w.bs(e.halign);
    }
    function geo(e, owner, mode) {
      var o = { owner: owner, mode: mode, layer: e.layer, lw: e.lw };
      if (e.t === 'LINE') { o.type = T.LINE; o.data = function (w) { var s = e.seg; w.b(1); w.rd(s[0]); w.dd(s[2], s[0]); w.rd(s[1]); w.dd(s[3], s[1]); w.b(1); w.b(1); }; }
      else if (e.t === 'CIRCLE') { o.type = T.CIRCLE; o.data = function (w) { w.p3(e.cx, e.cy, 0); w.bd(e.r); w.b(1); w.b(1); }; }
      else if (e.t === 'ARC') { o.type = T.ARC; o.data = function (w) { w.p3(e.cx, e.cy, 0); w.bd(e.r); w.b(1); w.b(1); w.bd(e.a0); w.bd(e.a1); }; }
      else if (e.t === 'SOLID') { o.type = T.SOLID; o.data = function (w) { w.b(1); w.bd(0); e.pts.forEach(function (q) { w.p2(q[0], q[1]); }); w.b(1); }; }
      else if (e.t === 'LWPLINE') {
        o.type = T.LWPLINE; o.data = function (w) {
          var fl = (e.closed ? 512 : 0) | (e.width ? 4 : 0) | (e.bulges ? 16 : 0); w.bs(fl); if (e.width) w.bd(e.width); w.bl(e.pts.length); if (e.bulges) w.bl(e.bulges.length);
          w.p2(e.pts[0][0], e.pts[0][1]); for (var i = 1; i < e.pts.length; i++) { w.dd(e.pts[i][0], e.pts[i - 1][0]); w.dd(e.pts[i][1], e.pts[i - 1][1]); }
          if (e.bulges) e.bulges.forEach(function (b) { w.bd(b); });
        };
      } else if (e.t === 'TEXT' || e.t === 'ATTDEF') {
        o.type = e.t === 'TEXT' ? T.TEXT : T.ATTDEF;
        o.data = function (w) { textData(e, w); if (e.t === 'ATTDEF') { w.tv(e.tag); w.bs(0); w.rc(0); w.tv(e.prompt || e.tag); } };
        o.hnd = function (w) { w.h(5, e.bold ? hStyB : hSty); };
      }
      return o;
    }
    function blockRecord(bh, name, hBlk, hEnd, ents, hasAtt, layoutH, insertHs) {
      /* BLOCK, the entities of the definition (owned by the block record), ENDBLK */
      ent({ h: hBlk, type: T.BLOCK, owner: bh, mode: 0, layer: LY['0'], data: function (w) { w.tv(name); } });
      var es = ents.map(function (e) { return ent(geo(e, bh, 0)); });
      chain(es);
      ent({ h: hEnd, type: T.ENDBLK, owner: bh, mode: 0, layer: LY['0'] });
      add({ h: bh, type: T.BLOCK_HEADER, parent: hBlkC, data: function (w) {
        tableEntry(name, w); w.b(0); w.b(hasAtt ? 1 : 0); w.b(0); w.b(0); w.b(0); w.p3(0, 0, 0); w.tv('');
        (insertHs || []).forEach(function () { w.rc(1); }); w.rc(0); w.tv(''); w.bl(0);
      }, hnd: function (w) {
        w.h(5, 0); w.h(3, hBlk); w.h(4, es.length ? es[0].h : 0); w.h(4, es.length ? es[es.length - 1].h : 0); w.h(3, hEnd);
        (insertHs || []).forEach(function (ih) { w.h(4, ih); }); w.h(5, layoutH || 0);
      } });
      return es;
    }
    /* model-space inserts (with attributes for the title block) */
    var msEnts = [];
    inserts.forEach(function (ins) {
      var o = ent({ type: T.INSERT, mode: 2, layer: LY['0'] }), atts = [];
      ins.b.inserts.push(o.h);
      if (ins.vals && ins.b === title) {
        title.ents.forEach(function (e) {
          if (e.t !== 'ATTDEF') return;
          var a = ent({ type: T.ATTRIB, mode: 0, owner: o.h, layer: e.layer, lw: LW_BYLAYER });
          var ae = { x: e.x + ins.x, y: e.y + ins.y, ax: e.ax + ins.x, ay: e.ay + ins.y, halign: e.halign, h: e.h, rot: e.rot, val: ins.vals[e.tag] !== undefined ? ins.vals[e.tag] : e.s };
          a.data = function (w) { textData(ae, w); w.tv(e.tag); w.bs(0); w.rc(0); };
          a.hnd = function (w) { w.h(5, e.bold ? hStyB : hSty); };
          atts.push(a);
        });
        chain(atts);
      }
      var seq = atts.length ? ent({ type: T.SEQEND, mode: 0, owner: o.h, layer: LY['0'] }) : null;
      o.data = function (w) { w.p3(ins.x, ins.y, 0); w.bb(3); w.bd(0); w.p3(0, 0, 1); w.b(atts.length ? 1 : 0); };
      o.hnd = function (w) { w.h(5, ins.b.h); if (atts.length) { w.h(4, atts[0].h); w.h(4, atts[atts.length - 1].h); w.h(3, seq.h); } };
      msEnts.push(o);
    });
    chain(msEnts);
    /* block records */
    blocks.forEach(function (b) { blockRecord(b.h, b.name, b.hBlk, b.hEnd, b.ents, b.hasAtt, 0, b.inserts); });
    (function () {
      ent({ h: hBlkModel, type: T.BLOCK, mode: 2, layer: LY['0'], data: function (w) { w.tv('*Model_Space'); } });   /* model / paper space markers: entity mode 2 / 1, no owner reference */
      ent({ h: hEndModel, type: T.ENDBLK, mode: 2, layer: LY['0'] });
      ent({ h: hBlkPaper, type: T.BLOCK, mode: 1, layer: LY['0'], data: function (w) { w.tv('*Paper_Space'); } });
      ent({ h: hEndPaper, type: T.ENDBLK, mode: 1, layer: LY['0'] });
      function bh(h, name, hBlk, hEnd, first, last, lh) {
        add({ h: h, type: T.BLOCK_HEADER, parent: hBlkC, data: function (w) { tableEntry(name, w); w.b(0); w.b(0); w.b(0); w.b(0); w.b(0); w.p3(0, 0, 0); w.tv(''); w.rc(0); w.tv(''); w.bl(0); },
          hnd: function (w) { w.h(5, 0); w.h(3, hBlk); w.h(4, first); w.h(4, last); w.h(3, hEnd); w.h(5, lh); } });
      }
      bh(hBhModel, '*Model_Space', hBlkModel, hEndModel, msEnts.length ? msEnts[0].h : 0, msEnts.length ? msEnts[msEnts.length - 1].h : 0, hLayoutModel);
      bh(hBhPaper, '*Paper_Space', hBlkPaper, hEndPaper, 0, 0, hLayoutPaper);
    })();

    /* -------------------------------------------------------------- header variables */
    var now = new Date(), loc = now.getTime() - now.getTimezoneOffset() * 60000, jd = 2440588 + Math.floor(loc / 86400000), jms = loc % 86400000;
    function guid() { var s = '', hx = '0123456789ABCDEF'; for (var i = 0; i < 32; i++) s += hx.charAt(Math.floor(Math.random() * 16)); return '{' + s.slice(0, 8) + '-' + s.slice(8, 12) + '-' + s.slice(12, 16) + '-' + s.slice(16, 20) + '-' + s.slice(20) + '}'; }
    function header() {
      var w = new BW(), i;
      w.bd(412148564080.0); w.bd(1); w.bd(1); w.bd(1); w.tv('m'); w.tv(''); w.tv(''); w.tv(''); w.bl(0); w.bl(0);
      w.h(5, 0);
      w.b(1); w.b(1);                                                   /* DIMASO DIMSHO */
      w.b(0); w.b(0); w.b(1); w.b(1); w.b(0); w.b(1); w.b(0);           /* PLINEGEN ORTHOMODE REGENMODE FILLMODE QTEXTMODE PSLTSCALE LIMCHECK */
      w.b(1); w.b(0); w.b(0); w.b(0);                                   /* USRTIMER SKPOLY ANGDIR SPLFRAME */
      w.b(0); w.b(1); w.b(1); w.b(0); w.b(1); w.b(0); w.b(0); w.bs(1);  /* MIRRTEXT WORLDVIEW TILEMODE PLIMCHECK VISRETAIN DISPSILH PELLIPSE PROXYGRAPHICS */
      [3020, 2, 4, 0, 0, 1, 0, 0, 0, 0, 0, 0, 8, 6, 6, 6, 6, 6, 6, 3, 70, 0, 64, 4, 0, 50].forEach(function (v) { w.bs(v); });   /* TREEDEPTH … TEXTQLTY */
      [1, 2.5, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 20, 1].forEach(function (v) { w.bd(v); });                 /* LTSCALE … CELTSCALE */
      w.tv('acad');
      w.bl(jd); w.bl(jms); w.bl(jd); w.bl(jms); w.bl(0); w.bl(0); w.bl(0); w.bl(0);
      w.bs(256);
      w.h(0, next);                                                     /* HANDSEED */
      w.h(5, LY['0']); w.h(5, hStd); w.h(5, hLtByLayer); w.h(5, hDim); w.h(5, hMl);
      w.bd(0);                                                          /* PSVPSCALE */
      /* paper space */
      w.p3(0, 0, 0); w.p3(1e20, 1e20, 1e20); w.p3(-1e20, -1e20, -1e20); w.p2(0, 0); w.p2(420, 297); w.bd(0); w.p3(0, 0, 0); w.p3(1, 0, 0); w.p3(0, 1, 0); w.h(5, 0);
      w.h(5, 0); w.bs(0); w.h(5, 0); for (i = 0; i < 6; i++) w.p3(0, 0, 0);
      /* model space */
      w.p3(0, 0, 0); w.p3(ext[0], ext[1], 0); w.p3(ext[2], ext[3], 0); w.p2(0, 0); w.p2(ext[2], ext[3]); w.bd(0); w.p3(0, 0, 0); w.p3(1, 0, 0); w.p3(0, 1, 0); w.h(5, 0);
      w.h(5, 0); w.bs(0); w.h(5, 0); for (i = 0; i < 6; i++) w.p3(0, 0, 0);
      w.tv(''); w.tv('');                                               /* DIMPOST DIMAPOST */
      [1, 2.5, 0.625, 3.75, 1.25, 0, 0, 0, 0].forEach(function (v) { w.bd(v); });
      w.b(0); w.b(0); w.b(0); w.b(0); w.b(0); w.b(0); w.bs(1); w.bs(8); w.bs(0);
      [2.5, 2.5, 0, 0.0394, 1, 0, 1, 0.625].forEach(function (v) { w.bd(v); });
      w.bd(0); w.b(0); w.bs(3); w.b(1); w.b(0); w.b(0); w.b(0);
      w.bs(0); w.bs(0); w.bs(0);
      [0, 2, 2, 2, 3, 0, 0, 2, 44, 0, 0].forEach(function (v) { w.bs(v); }); w.b(0); w.b(0); [0, 8, 0, 0].forEach(function (v) { w.bs(v); }); w.b(0); w.bs(3);
      w.h(5, hStd); w.h(5, 0); w.h(5, 0); w.h(5, 0); w.h(5, 0);
      w.bs(-2); w.bs(-2);
      [hBlkC, hLayC, hStyC, hLtC, hViewC, hUcsC, hVpC, hAppC, hDimC, hVxC].forEach(function (h) { w.h(3, h); });
      w.h(5, hDGroup); w.h(5, hDMl); w.h(3, hNod);
      w.bs(1); w.bs(70); w.tv(''); w.tv('');
      w.h(5, hDLayout); w.h(5, hDPlotSet); w.h(5, hDPlotSty);
      w.bl(LW_BYLAYER | 0x800 | 0x2000);                                /* CELWEIGHT ByLayer, LWDISPLAY on, EXTNAMES, colour-dependent plot styles */
      w.bs(4); w.bs(0); w.tv(guid()); w.tv(guid());                     /* INSUNITS mm, CEPSNTYPE */
      w.h(5, hBhPaper); w.h(5, hBhModel); w.h(5, hLtByLayer); w.h(5, hLtByBlock); w.h(5, hLtCont);
      w.bs(0); w.bs(0); w.bs(0); w.bs(0);
      return w.bytes();
    }
    function classes() { var w = new BW(); CLASSES.forEach(function (c, i) { w.bs(500 + i); w.bs(0); w.tv('ObjectDBX Classes'); w.tv(c[1]); w.tv(c[0]); w.b(0); w.bs(0x1F3); }); return w.bytes(); }

    /* -------------------------------------------------------------- file */
    var NREC = 5, hdrEnd = 0x15 + 4 + NREC * 9 + 2 + 16;
    var secH = section(SN.hs, header(), SN.he), secC = section(SN.cs, classes(), SN.ce);
    var addr = hdrEnd + secH.length + secC.length + 0x200, objStart = addr, body = new Bytes(), map = [];
    list.slice().sort(function (a, b) { return a.h - b.h; }).forEach(function (o) { var bts = out(o); map.push([o.h, addr]); body.add(bts); addr += bts.length; });
    var objBytes = body.out();
    /* object map: sections of ≤ 2032 bytes, offsets from the previous handle / address (reset in every section), big-endian size and CRC */
    var om = new Bytes(), cur = [], lastH = 0, lastA = 0;
    function flush() { var sz = 2 + cur.length, a = new Uint8Array(sz + 2); a[0] = sz >> 8; a[1] = sz & 0xFF; a.set(cur, 2); var c = crc16(0xC0C1, a, 0, sz); a[sz] = c >> 8; a[sz + 1] = c & 0xFF; om.add(a); cur = []; lastH = 0; lastA = 0; }
    map.forEach(function (m) { var e = mcU(m[0] - lastH).concat(mcS(m[1] - lastA)); if (cur.length + e.length > 2000) { flush(); e = mcU(m[0]).concat(mcS(m[1])); } cur = cur.concat(e); lastH = m[0]; lastA = m[1]; });
    flush(); flush();
    var omBytes = om.out(), omAddr = addr; addr += omBytes.length;
    /* object free space, template (MEASUREMENT metric), empty preview */
    var fsUnused = new Bytes().add(le32(0)).add(le32(list.length)).add(le32(jd)).add(le32(jms)).add(le32(objStart)).add([4]).add(le32(0x32)).add(le32(0)).add(le32(0x64)).add(le32(0)).add(le32(0x200)).add(le32(0)).add(le32(0xFFFFFFFF)).add(le32(0)).out();
    var tpl = new Uint8Array([0, 0, 1, 0]), tplAddr = addr; addr += tpl.length;
    var img = new Bytes().add(SN.is).add(le32(1)).add([0]).add(SN.ie).out(), imgAddr = addr; addr += img.length;
    /* file header */
    var fh = new Uint8Array(hdrEnd), sig = 'AC1015';
    for (var i = 0; i < 6; i++) fh[i] = sig.charCodeAt(i);
    fh[0x0B] = 15; fh[0x0C] = 1; fh.set(le32(imgAddr), 0x0D); fh[0x11] = 0x17; fh.set(le16(30), 0x13); fh.set(le32(NREC), 0x15);
    var recs = [[0, hdrEnd, secH.length], [1, hdrEnd + secH.length, secC.length], [2, omAddr, omBytes.length], [3, 0, 0], [4, tplAddr, tpl.length]], p = 0x19;
    recs.forEach(function (r) { fh[p] = r[0]; fh.set(le32(r[1]), p + 1); fh.set(le32(r[2]), p + 5); p += 9; });
    var hc = crc16(0, fh, 0, p) ^ 0x3CC4; fh[p] = hc & 0xFF; fh[p + 1] = hc >>> 8; fh.set(SN.fh, p + 2);
    return new Bytes().add(fh).add(secH).add(secC).add(new Uint8Array(0x200)).add(objBytes).add(omBytes).add(tpl).add(img).out();
  }

  g.DCDwg = { create: create, crc16: crc16 };
  if (typeof module !== 'undefined' && module.exports) module.exports = g.DCDwg;
})(typeof window !== 'undefined' ? window : globalThis);
