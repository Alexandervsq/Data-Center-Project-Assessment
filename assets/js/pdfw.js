/* DCPdf / DCSvg — a small vector writer for engineering drawings (no external library), one drawing API for two outputs:
   PDF (download / print) and SVG (shown directly in the website). Lines, polylines, polygons, rectangles, circles and arcs with line weights,
   colours and dashes; text with alignment and rotation. PDF text uses the standard Helvetica, Helvetica-Bold and Symbol fonts (WinAnsi) and
   Chinese through the non-embedded Adobe-GB1 font STSong-Light (UniGB-UCS2-H), which PDF viewers map to a system Chinese font — so no font
   file is shipped. Units are millimetres, origin top-left; every page can have its own sheet size (A3 … A0). */
(function (g) {
  'use strict';
  var K = 72 / 25.4;
  /* Helvetica / Helvetica-Bold advance widths (1/1000 em), characters 32–126 */
  var HV = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584];
  var HB = [278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584];
  /* WinAnsi characters beyond ASCII used in drawings: code and Helvetica width */
  var WIN = { '€': [128, 556], '…': [133, 1000], '‘': [145, 222], '’': [146, 222], '“': [147, 333], '”': [148, 333], '•': [149, 350], '–': [150, 556], '—': [151, 1000], '°': [176, 400], '±': [177, 584], '²': [178, 333], '³': [179, 333], 'µ': [181, 556], '·': [183, 278], '×': [215, 584], '÷': [247, 584], 'é': [233, 556], '½': [189, 834], '¼': [188, 834], '¾': [190, 834], '≡': [61, 584] };
  /* Symbol-font characters: code and width */
  var SYM = { 'Ω': [0x57, 768], '√': [0xD6, 549], '≤': [0xA3, 549], '≥': [0xB3, 549], 'Δ': [0x44, 612], 'π': [0x70, 549], 'Π': [0x50, 768], '≈': [0xBB, 549], '→': [0xAE, 987], '←': [0xAC, 987], '↔': [0xAB, 1042], '∞': [0xA5, 713], 'φ': [0x66, 521], 'Φ': [0x46, 763], '∑': [0xE5, 713], '∠': [0xD0, 768], '⌈': [0x5B, 333], '⌉': [0x5D, 333], 'α': [0x61, 631], 'β': [0x62, 549], 'λ': [0x6C, 549], 'σ': [0x73, 603], 'ω': [0x77, 686], '✗': [0xB4, 549] };
  function isCJK(c) { var u = c.charCodeAt(0); return (u >= 0x2E80 && u <= 0x9FFF) || (u >= 0xF900 && u <= 0xFAFF) || (u >= 0xFF00 && u <= 0xFFEF) || (u >= 0x3000 && u <= 0x303F); }
  /* split a string into runs: h = Helvetica (WinAnsi), s = Symbol, c = Chinese */
  function runs(str) {
    var out = [], cur = null;
    for (var i = 0; i < str.length; i++) {
      var ch = str.charAt(i), t = isCJK(ch) ? 'c' : (SYM[ch] ? 's' : 'h');
      if (t === 'h') { var u = ch.charCodeAt(0); if (!(u >= 32 && u <= 126) && !WIN[ch]) ch = u === 9 ? ' ' : '?'; }
      if (!cur || cur.t !== t) { cur = { t: t, s: '' }; out.push(cur); }
      cur.s += ch;
    }
    return out;
  }
  function runW(r, bold) {
    var w = 0, tb = bold ? HB : HV;
    for (var i = 0; i < r.s.length; i++) {
      var ch = r.s.charAt(i), u = ch.charCodeAt(0);
      if (r.t === 'c') w += 1000; else if (r.t === 's') w += SYM[ch][1]; else w += (u >= 32 && u <= 126) ? tb[u - 32] : (WIN[ch] ? WIN[ch][1] : 556);
    }
    return w / 1000;
  }
  function textW(str, h, b) { var w = 0; runs(String(str)).forEach(function (r) { w += runW(r, b); }); return w * (h || 2.5); }
  function lit(s) {   /* PDF literal string, WinAnsi */
    var o = '(';
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i), u = ch.charCodeAt(0);
      if (ch === '(' || ch === ')' || ch === '\\') o += '\\' + ch;
      else if (u >= 32 && u <= 126) o += ch;
      else { var c = WIN[ch] ? WIN[ch][0] : 63; o += '\\' + ('00' + c.toString(8)).slice(-3); }
    }
    return o + ')';
  }
  function symLit(s) { var o = '('; for (var i = 0; i < s.length; i++) o += '\\' + ('00' + SYM[s.charAt(i)][0].toString(8)).slice(-3); return o + ')'; }
  function hex16(s) { var o = '<'; for (var i = 0; i < s.length; i++) o += ('000' + s.charCodeAt(i).toString(16).toUpperCase()).slice(-4); return o + '>'; }
  function n(x) { return (Math.round(x * 100) / 100).toString(); }
  function rgb(c) {
    if (!c) return [0, 0, 0];
    if (c.charAt(0) === '#') { var h = c.length === 4 ? c.slice(1).split('').map(function (q) { return q + q; }).join('') : c.slice(1); return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255]; }
    return [0, 0, 0];
  }
  function utf16hex(s) { var o = '<FEFF'; for (var i = 0; i < s.length; i++) o += ('000' + s.charCodeAt(i).toString(16).toUpperCase()).slice(-4); return o + '>'; }

  /* ------------------------------------------------------------------ PDF */
  function create(opt) {
    opt = opt || {};
    var W0 = opt.w || 420, H0 = opt.h || 297, pages = [];
    function Page(w, h) { this.ops = []; this.W = w; this.H = h; }
    var P = Page.prototype;
    P.y = function (y) { return (this.H - y) * K; };
    P.style = function (o) {
      o = o || {};
      var c = rgb(o.c || '#000000');
      this.ops.push(n((o.w || 0.25) * K) + ' w', n(c[0]) + ' ' + n(c[1]) + ' ' + n(c[2]) + ' RG', (o.dash ? '[' + o.dash.map(function (d) { return n(d * K); }).join(' ') + '] 0 d' : '[] 0 d'), (o.cap === undefined ? 1 : o.cap) + ' J 1 j');
      if (o.fill) { var f = rgb(o.fill); this.ops.push(n(f[0]) + ' ' + n(f[1]) + ' ' + n(f[2]) + ' rg'); }
    };
    P.paint = function (o) { o = o || {}; this.ops.push(o.fill && o.stroke === false ? 'f' : (o.fill ? 'B' : 'S')); };
    P.line = function (x1, y1, x2, y2, o) { this.ops.push('q'); this.style(o); this.ops.push(n(x1 * K) + ' ' + n(this.y(y1)) + ' m ' + n(x2 * K) + ' ' + n(this.y(y2)) + ' l S', 'Q'); return this; };
    P.poly = function (pts, o) {
      o = o || {}; if (!pts.length) return this; this.ops.push('q'); this.style(o);
      var s = n(pts[0][0] * K) + ' ' + n(this.y(pts[0][1])) + ' m';
      for (var i = 1; i < pts.length; i++) s += ' ' + n(pts[i][0] * K) + ' ' + n(this.y(pts[i][1])) + ' l';
      if (o.close || o.fill) s += ' h'; this.ops.push(s); this.paint(o); this.ops.push('Q'); return this;
    };
    P.rect = function (x, y, w, h, o) { o = o || {}; this.ops.push('q'); this.style(o); this.ops.push(n(x * K) + ' ' + n(this.y(y + h)) + ' ' + n(w * K) + ' ' + n(h * K) + ' re'); this.paint(o); this.ops.push('Q'); return this; };
    P.arcPath = function (cx, cy, r, a0, a1) {   /* degrees, counter-clockwise on paper (y up) */
      var segs = Math.max(1, Math.ceil(Math.abs(a1 - a0) / 90)), da = (a1 - a0) / segs, s = '';
      for (var i = 0; i < segs; i++) {
        var t0 = (a0 + i * da) * Math.PI / 180, t1 = (a0 + (i + 1) * da) * Math.PI / 180, k = 4 / 3 * Math.tan((t1 - t0) / 4);
        var x0 = cx + r * Math.cos(t0), y0 = cy - r * Math.sin(t0), x3 = cx + r * Math.cos(t1), y3 = cy - r * Math.sin(t1);
        var x1 = x0 - k * r * Math.sin(t0), y1 = y0 - k * r * Math.cos(t0), x2 = x3 + k * r * Math.sin(t1), y2 = y3 + k * r * Math.cos(t1);
        if (i === 0) s += n(x0 * K) + ' ' + n(this.y(y0)) + ' m ';
        s += n(x1 * K) + ' ' + n(this.y(y1)) + ' ' + n(x2 * K) + ' ' + n(this.y(y2)) + ' ' + n(x3 * K) + ' ' + n(this.y(y3)) + ' c ';
      }
      return s;
    };
    P.circle = function (cx, cy, r, o) { o = o || {}; this.ops.push('q'); this.style(o); this.ops.push(this.arcPath(cx, cy, r, 0, 360) + 'h'); this.paint(o); this.ops.push('Q'); return this; };
    P.arc = function (cx, cy, r, a0, a1, o) { this.ops.push('q'); this.style(o); this.ops.push(this.arcPath(cx, cy, r, a0, a1)); this.ops.push('S', 'Q'); return this; };
    /* text: o.h = font size (mm), o.b = bold, o.c = colour, o.a = 'l' | 'c' | 'r', o.v = 'b' | 'm' | 't', o.rot = degrees counter-clockwise */
    P.textW = textW;
    P.text = function (x, y, str, o) {
      o = o || {}; str = String(str === undefined || str === null ? '' : str); if (!str) return this;
      var h = o.h || 2.5, sz = h * K, rs = runs(str), tw = 0; rs.forEach(function (r) { tw += runW(r, o.b); }); tw *= h;
      var dx = o.a === 'c' ? -tw / 2 : (o.a === 'r' ? -tw : 0), dy = o.v === 'm' ? 0.35 * h : (o.v === 't' ? 0.75 * h : 0);
      var rot = (o.rot || 0) * Math.PI / 180, cs = Math.cos(rot), sn = Math.sin(rot), c = rgb(o.c || '#000000');
      var bx = x + dx * cs + dy * sn, by = y - dx * sn + dy * cs;   /* rotate the alignment offset with the text */
      this.ops.push('BT', n(c[0]) + ' ' + n(c[1]) + ' ' + n(c[2]) + ' rg');
      var off = 0, self = this;
      rs.forEach(function (r) {
        var px = bx + off * cs, py = by - off * sn;
        self.ops.push(n(cs) + ' ' + n(sn) + ' ' + n(-sn) + ' ' + n(cs) + ' ' + n(px * K) + ' ' + n(self.y(py)) + ' Tm');
        if (r.t === 'c') self.ops.push('/F4 ' + n(sz) + ' Tf ' + hex16(r.s) + ' Tj');
        else if (r.t === 's') self.ops.push('/F3 ' + n(sz) + ' Tf ' + symLit(r.s) + ' Tj');
        else self.ops.push((o.b ? '/F2 ' : '/F1 ') + n(sz) + ' Tf ' + lit(r.s) + ' Tj');
        off += runW(r, o.b) * h;
      });
      this.ops.push('ET');
      return this;
    };
    function page(w, h) { var p = new Page(w || W0, h || H0); pages.push(p); return p; }
    function output() {
      var objs = [], off = [];
      function add(s) { objs.push(s); return objs.length; }
      var cat = add(''), pgs = add('');
      var f1 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
      var f2 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
      var f3 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Symbol >>');
      var fd = add('<< /Type /FontDescriptor /FontName /STSong-Light /Flags 6 /FontBBox [-25 -254 1000 880] /ItalicAngle 0 /Ascent 880 /Descent -120 /CapHeight 737 /StemV 58 >>');
      var cid = add('<< /Type /Font /Subtype /CIDFontType0 /BaseFont /STSong-Light /CIDSystemInfo << /Registry (Adobe) /Ordering (GB1) /Supplement 4 >> /FontDescriptor ' + fd + ' 0 R /DW 1000 /W [1 95 500] >>');
      var f4 = add('<< /Type /Font /Subtype /Type0 /BaseFont /STSong-Light /Encoding /UniGB-UCS2-H /DescendantFonts [' + cid + ' 0 R] >>');
      var res = '<< /Font << /F1 ' + f1 + ' 0 R /F2 ' + f2 + ' 0 R /F3 ' + f3 + ' 0 R /F4 ' + f4 + ' 0 R >> >>';
      var kids = [];
      pages.forEach(function (p) {
        var body = p.ops.join('\n'), cs = add('<< /Length ' + body.length + ' >>\nstream\n' + body + '\nendstream');
        kids.push(add('<< /Type /Page /Parent ' + pgs + ' 0 R /MediaBox [0 0 ' + n(p.W * K) + ' ' + n(p.H * K) + '] /Resources ' + res + ' /Contents ' + cs + ' 0 R >>'));
      });
      objs[cat - 1] = '<< /Type /Catalog /Pages ' + pgs + ' 0 R /PageMode /UseNone /ViewerPreferences << /DisplayDocTitle true >> >>';
      objs[pgs - 1] = '<< /Type /Pages /Kids [' + kids.map(function (k) { return k + ' 0 R'; }).join(' ') + '] /Count ' + kids.length + ' >>';
      var d = new Date(), ds = 'D:' + d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2) + ('0' + d.getHours()).slice(-2) + ('0' + d.getMinutes()).slice(-2) + '00';
      var info = add('<< /Title ' + utf16hex(opt.title || 'Single-line diagram') + ' /Author ' + utf16hex(opt.author || '') + ' /Subject ' + utf16hex(opt.subject || '') + ' /Creator (Data Center Project Assessment - DCSLD) /Producer (DCPdf) /CreationDate (' + ds + ') >>');
      var out = '%PDF-1.4\n';
      for (var i = 0; i < objs.length; i++) { off.push(out.length); out += (i + 1) + ' 0 obj\n' + objs[i] + '\nendobj\n'; }
      var xref = out.length;
      out += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n' + off.map(function (o) { return ('0000000000' + o).slice(-10) + ' 00000 n \n'; }).join('');
      out += 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root ' + cat + ' 0 R /Info ' + info + ' 0 R >>\nstartxref\n' + xref + '\n%%EOF\n';
      return out;
    }
    return { page: page, output: output, w: W0, h: H0, pages: pages, blob: function () { return new Blob([output()], { type: 'application/pdf' }); } };
  }

  /* ------------------------------------------------------------------ SVG (same drawing API; shown in the website) */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var FONT = "Helvetica, Arial, 'Microsoft YaHei', 'PingFang SC', 'Noto Sans CJK SC', 'Noto Sans SC', sans-serif";
  function createSvg(opt) {
    opt = opt || {};
    var pages = [];
    function SPage(w, h) { this.el = []; this.W = w; this.H = h; }
    var Q = SPage.prototype;
    function st(o, fillDefault) {
      o = o || {};
      var s = ' stroke="' + (o.stroke === false ? 'none' : (o.c || '#000000')) + '" stroke-width="' + n(o.w || 0.25) + '"';
      if (o.dash) s += ' stroke-dasharray="' + o.dash.map(n).join(' ') + '"';
      return s + ' fill="' + (o.fill || fillDefault || 'none') + '"';
    }
    Q.line = function (x1, y1, x2, y2, o) { this.el.push('<line x1="' + n(x1) + '" y1="' + n(y1) + '" x2="' + n(x2) + '" y2="' + n(y2) + '"' + st(o) + '/>'); return this; };
    Q.poly = function (pts, o) { o = o || {}; if (!pts.length) return this; var p = pts.map(function (q) { return n(q[0]) + ',' + n(q[1]); }).join(' '); this.el.push('<' + (o.close || o.fill ? 'polygon' : 'polyline') + ' points="' + p + '"' + st(o) + '/>'); return this; };
    Q.rect = function (x, y, w, h, o) { this.el.push('<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '"' + st(o) + '/>'); return this; };
    Q.circle = function (cx, cy, r, o) { this.el.push('<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(r) + '"' + st(o) + '/>'); return this; };
    Q.arc = function (cx, cy, r, a0, a1, o) {
      var t0 = a0 * Math.PI / 180, t1 = a1 * Math.PI / 180, x0 = cx + r * Math.cos(t0), y0 = cy - r * Math.sin(t0), x1 = cx + r * Math.cos(t1), y1 = cy - r * Math.sin(t1);
      this.el.push('<path d="M' + n(x0) + ' ' + n(y0) + ' A' + n(r) + ' ' + n(r) + ' 0 ' + (Math.abs(a1 - a0) > 180 ? 1 : 0) + ' ' + (a1 < a0 ? 1 : 0) + ' ' + n(x1) + ' ' + n(y1) + '"' + st(o) + '/>'); return this;
    };
    Q.textW = textW;
    Q.text = function (x, y, str, o) {
      o = o || {}; str = String(str === undefined || str === null ? '' : str); if (!str) return this;
      var h = o.h || 2.5, dy = o.v === 'm' ? 0.35 * h : (o.v === 't' ? 0.75 * h : 0), rot = o.rot || 0;
      var anc = o.a === 'c' ? 'middle' : (o.a === 'r' ? 'end' : 'start'), yy = y + dy;
      this.el.push('<text x="' + n(x) + '" y="' + n(yy) + '" font-size="' + n(h) + '"' + (o.b ? ' font-weight="700"' : '') + ' fill="' + (o.c || '#000000') + '" text-anchor="' + anc + '"' + (rot ? ' transform="rotate(' + n(-rot) + ' ' + n(x) + ' ' + n(y) + ')"' : '') + '>' + esc(str) + '</text>');
      return this;
    };
    function page(w, h) { var p = new SPage(w || 420, h || 297); pages.push(p); return p; }
    function svg(i) {
      var p = pages[i || 0];
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + n(p.W) + ' ' + n(p.H) + '" width="' + n(p.W) + 'mm" height="' + n(p.H) + 'mm" font-family="' + FONT + '" stroke-linecap="round" stroke-linejoin="round">' +
        (opt.title ? '<title>' + esc(opt.title) + '</title>' : '') + '<rect x="0" y="0" width="' + n(p.W) + '" height="' + n(p.H) + '" fill="#ffffff"/>' + p.el.join('') + '</svg>';
    }
    return { page: page, svg: svg, pages: pages };
  }
  g.DCPdf = { create: create, textW: textW };
  g.DCSvg = { create: createSvg };
  if (typeof module !== 'undefined' && module.exports) module.exports = { DCPdf: g.DCPdf, DCSvg: g.DCSvg };
})(typeof window !== 'undefined' ? window : globalThis);
