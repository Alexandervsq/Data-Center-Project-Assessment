/* Technology cards — JavaScript port of the CCEPC "technology card" format (tclib.py).
 * One 1920 × 1080 infographic slide per technology, scaled to the page; every drawn unit, chip, KPI and tile is an
 * invisible hotspot that opens a detail panel inside the website (illustration, how it works, formula, step-by-step
 * calculator, design parameters, requirements, standards, O&M, FAQ, glossary).
 * Content is bound to the knowledge base: unit panels read DCDB.equipment, numbers come from the assessment engine
 * (DCEngine / DCPropose) for a selectable design basis, calculators use DCEngine.K.
 * Text pairs are [English, 简体中文] and follow the site language (I18N). */
(function (g) {
  'use strict';
  var DB = g.DCDB, E = g.DCEngine, P = g.DCPropose;

  /* ============================================================== text & numbers */
  function lang() { return g.I18N ? g.I18N.lang() : 'en'; }
  function t(x) { return Array.isArray(x) ? (lang() === 'zh' && x[1] ? String(x[1]) : String(x[0])) : (x === undefined || x === null ? '' : String(x)); }
  function o(x) { return Array.isArray(x) ? (lang() === 'zh' ? String(x[0]) : String(x[1] || x[0])) : t(x); }   /* the other language */
  function e(s) { return String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function te(x) { return e(t(x)); }
  function F(x, d) { return isFinite(x) ? E.fmt(x, d || 0) : '–'; }
  function f1(v) { return Math.round(v * 10) / 10; }
  function tw(s, px, bold) {
    s = String(s).replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/g, 'x');
    var w = 0;
    for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); w += c > 0x2e80 ? px : (c === 32 ? px * .3 : (c >= 65 && c <= 90 || c >= 48 && c <= 57 ? px * .64 : px * .54)); }
    return w * (bold ? 1.05 : 1);
  }
  function ord(i) { return (i < 10 ? '0' : '') + i; }

  /* ============================================================== gradients & patterns (ids prefixed tc) */
  var OUT = '#17153F';
  var DEFS = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    '<linearGradient id="tcSteel" x1="0" x2="1"><stop offset="0" stop-color="#8E95AE"/><stop offset=".35" stop-color="#F1F2F8"/><stop offset=".7" stop-color="#B9BED2"/><stop offset="1" stop-color="#7A819C"/></linearGradient>' +
    '<linearGradient id="tcSteelH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9DA3BA"/><stop offset=".3" stop-color="#F3F4F9"/><stop offset=".75" stop-color="#C0C5D6"/><stop offset="1" stop-color="#848BA5"/></linearGradient>' +
    '<linearGradient id="tcWhite" x1="0" x2="1"><stop offset="0" stop-color="#B9BED1"/><stop offset=".35" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#E4E6F0"/><stop offset="1" stop-color="#A9AFC6"/></linearGradient>' +
    '<linearGradient id="tcWhiteH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C6CADB"/><stop offset=".3" stop-color="#FFFFFF"/><stop offset=".75" stop-color="#DFE2EE"/><stop offset="1" stop-color="#A3A9C1"/></linearGradient>' +
    '<linearGradient id="tcInd" x1="0" x2="1"><stop offset="0" stop-color="#211E6E"/><stop offset=".33" stop-color="#6E6BE0"/><stop offset=".7" stop-color="#3F3CBB"/><stop offset="1" stop-color="#1D1A62"/></linearGradient>' +
    '<linearGradient id="tcCyan" x1="0" x2="1"><stop offset="0" stop-color="#086A80"/><stop offset=".33" stop-color="#5BD0E8"/><stop offset=".7" stop-color="#0EA5C6"/><stop offset="1" stop-color="#075E72"/></linearGradient>' +
    '<linearGradient id="tcCyanH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#086A80"/><stop offset=".3" stop-color="#5BD0E8"/><stop offset=".75" stop-color="#0EA5C6"/><stop offset="1" stop-color="#075E72"/></linearGradient>' +
    '<linearGradient id="tcNavy" x1="0" x2="1"><stop offset="0" stop-color="#14123A"/><stop offset=".35" stop-color="#4C4A86"/><stop offset=".7" stop-color="#2A2766"/><stop offset="1" stop-color="#110F32"/></linearGradient>' +
    '<linearGradient id="tcAmber" x1="0" x2="1"><stop offset="0" stop-color="#9A5F06"/><stop offset=".35" stop-color="#F6C46A"/><stop offset=".7" stop-color="#E39B1B"/><stop offset="1" stop-color="#8A5506"/></linearGradient>' +
    '<linearGradient id="tcRed" x1="0" x2="1"><stop offset="0" stop-color="#8E1F1A"/><stop offset=".35" stop-color="#F08A84"/><stop offset=".7" stop-color="#D2423B"/><stop offset="1" stop-color="#7E1B17"/></linearGradient>' +
    '<linearGradient id="tcRack" x1="0" x2="1"><stop offset="0" stop-color="#1A1C33"/><stop offset=".5" stop-color="#2B2E4E"/><stop offset="1" stop-color="#191A30"/></linearGradient>' +
    '<linearGradient id="tcResin" x1="0" x2="1"><stop offset="0" stop-color="#4A3A20"/><stop offset=".35" stop-color="#B98A3E"/><stop offset=".7" stop-color="#8A6326"/><stop offset="1" stop-color="#3F3119"/></linearGradient>' +
    '<linearGradient id="tcConc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ECEEF5"/><stop offset="1" stop-color="#CDD1E0"/></linearGradient>' +
    '<linearGradient id="tcWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3FB2D8"/><stop offset=".55" stop-color="#1A7FAE"/><stop offset="1" stop-color="#154E80"/></linearGradient>' +
    '<linearGradient id="tcCold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9EEF8"/><stop offset="1" stop-color="#6CCDE6"/></linearGradient>' +
    '<linearGradient id="tcHot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBD6CF"/><stop offset="1" stop-color="#EE8B7C"/></linearGradient>' +
    '<linearGradient id="tcGlass" x1="0" x2="1"><stop offset="0" stop-color="#BFE7F2" stop-opacity=".75"/><stop offset=".5" stop-color="#F2FBFE" stop-opacity=".55"/><stop offset="1" stop-color="#A5DAEA" stop-opacity=".75"/></linearGradient>' +
    '<linearGradient id="tcGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDE0EC"/><stop offset="1" stop-color="#C9CDDE"/></linearGradient>' +
    '<linearGradient id="tcSoil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7E1D3"/><stop offset="1" stop-color="#D5CCB6"/></linearGradient>' +
    '<linearGradient id="tcDuct" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2C2A62"/><stop offset="1" stop-color="#1A1846"/></linearGradient>' +
    '<linearGradient id="tcZone" x1="0" x2="1"><stop offset="0" stop-color="#2A2785"/><stop offset="1" stop-color="#3F3CBB"/></linearGradient>' +
    '<linearGradient id="tcZone2" x1="0" x2="1"><stop offset="0" stop-color="#0B6F88"/><stop offset="1" stop-color="#0EA5C6"/></linearGradient>' +
    '<linearGradient id="tcZone3" x1="0" x2="1"><stop offset="0" stop-color="#A9650A"/><stop offset="1" stop-color="#E39B1B"/></linearGradient>' +
    '<linearGradient id="tcZone4" x1="0" x2="1"><stop offset="0" stop-color="#B0302A"/><stop offset="1" stop-color="#E5534B"/></linearGradient>' +
    '<linearGradient id="tcZone5" x1="0" x2="1"><stop offset="0" stop-color="#363A5E"/><stop offset="1" stop-color="#5D6280"/></linearGradient>' +
    '<radialGradient id="tcGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE3A3"/><stop offset="1" stop-color="#FFB547" stop-opacity="0"/></radialGradient>' +
    '<pattern id="tcGrid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="#C9CDE0" stroke-width=".6"/></pattern>' +
    '<pattern id="tcMesh" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 0L8 8M8 0L0 8" stroke="#8D93AE" stroke-width=".7"/></pattern>' +
    '<pattern id="tcLouvre" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#DADDEA"/><path d="M0 4H6" stroke="#9EA4BE" stroke-width="1.2"/></pattern>' +
    '<pattern id="tcEarth" width="26" height="14" patternUnits="userSpaceOnUse"><path d="M0 7H26M13 0V14" stroke="#B9874A" stroke-width="1.2" opacity=".55"/></pattern>' +
    '</defs></svg>';

  /* ============================================================== drawing primitives */
  function G(x, y, body) { return '<g transform="translate(' + x + ',' + y + ')">' + body + '</g>'; }
  function shadow(cx, cy, rx, ry) { return '<ellipse cx="' + f1(cx) + '" cy="' + f1(cy) + '" rx="' + f1(rx) + '" ry="' + f1(ry || 5) + '" fill="' + OUT + '" opacity=".12"/>'; }
  function R_(x, y, w, h, fill, extra) { return '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  function text(x, y, s, cls, extra) { return '<text x="' + f1(x) + '" y="' + f1(y) + '" class="' + (cls || 'tc-ls') + '"' + (extra || '') + '>' + te(s) + '</text>'; }

  function vessel(x, y, w, h, fill, legs) {
    var ry = Math.min(w * .34, h / 3), s = shadow(x + w / 2, y + h + 5, w * .62);
    if (legs !== false) [x + w * .16, x + w * .74].forEach(function (lx) { s += R_(lx, y + h - ry * .5, w * .1, ry * .5 + 5, '#4E5576'); });
    s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + f1(w / 2) + '" ry="' + f1(ry) + '" fill="url(#' + (fill || 'tcCyan') + ')" stroke="' + OUT + '" stroke-opacity=".3"/>';
    s += R_(x + w * .2, y + ry * .7, w * .08, h - ry * 1.4, '#fff', ' rx="' + f1(w * .04) + '" opacity=".28"');
    return s;
  }
  function cylV(x, y, w, h, fill, top, water) {
    var ry = w * .13, s = shadow(x + w / 2, y + h + 4, w * .6);
    s += '<ellipse cx="' + f1(x + w / 2) + '" cy="' + f1(y + h) + '" rx="' + f1(w / 2) + '" ry="' + f1(ry) + '" fill="url(#' + (fill || 'tcWhite') + ')" stroke="' + OUT + '" stroke-opacity=".28"/>';
    s += R_(x, y, w, h, 'url(#' + (fill || 'tcWhite') + ')') + '<path d="M' + x + ' ' + y + 'V' + (y + h) + 'M' + (x + w) + ' ' + y + 'V' + (y + h) + '" stroke="' + OUT + '" stroke-opacity=".28"/>';
    s += '<ellipse cx="' + f1(x + w / 2) + '" cy="' + f1(y) + '" rx="' + f1(w / 2) + '" ry="' + f1(ry) + '" fill="' + (top || '#F4F5FA') + '" stroke="' + OUT + '" stroke-opacity=".28"/>';
    if (water) s += '<ellipse cx="' + f1(x + w / 2) + '" cy="' + f1(y + ry * .25) + '" rx="' + f1(w / 2 - 3) + '" ry="' + f1(ry - 2) + '" fill="url(#' + water + ')"/>';
    return s;
  }
  function storageTank(x, y, w, h, band) {
    var s = cylV(x, y, w, h, 'tcWhite');
    s += '<path d="M' + x + ' ' + y + 'Q' + f1(x + w / 2) + ' ' + f1(y - w * .3) + ' ' + (x + w) + ' ' + y + 'Z" fill="#DDE0EC" stroke="' + OUT + '" stroke-opacity=".28"/>';
    s += R_(x, y + h * .55, w, 6, band || '#0EA5C6', ' opacity=".85"');
    var lx = x + w * .8; s += '<path d="M' + f1(lx) + ' ' + (y - 2) + 'V' + (y + h) + 'M' + f1(lx + 7) + ' ' + (y - 2) + 'V' + (y + h) + '" stroke="#5E6484" stroke-width="1.2"/>';
    for (var yy = y + 4; yy < y + h; yy += 8) s += '<path d="M' + f1(lx) + ' ' + f1(yy) + 'h7" stroke="#5E6484" stroke-width="1"/>';
    return s;
  }
  function cylH(x, y, w, h, body, cap) {
    var q = h * .2;
    return R_(x + q, y, w - 2 * q, h, 'url(#' + (body || 'tcWhiteH') + ')', ' stroke="' + OUT + '" stroke-opacity=".22"') +
      '<ellipse cx="' + f1(x + q) + '" cy="' + f1(y + h / 2) + '" rx="' + f1(q + 1) + '" ry="' + f1(h / 2) + '" fill="' + (cap || '#3F3CBB') + '"/>' +
      '<ellipse cx="' + f1(x + w - q) + '" cy="' + f1(y + h / 2) + '" rx="' + f1(q + 1) + '" ry="' + f1(h / 2) + '" fill="' + (cap || '#3F3CBB') + '"/>';
  }
  function pump(x, y, s, col, motor) {
    col = col || '#0EA5C6'; motor = motor || '#3A3F6E';
    var o = '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')">' + shadow(36, 2, 38, 4) + R_(0, -6, 74, 6, '#4E5576', ' rx="1.5"');
    o += '<circle cx="17" cy="-22" r="15" fill="' + col + '" stroke="' + OUT + '" stroke-opacity=".35"/><circle cx="17" cy="-22" r="6" fill="#fff" opacity=".35"/>';
    o += R_(10, -49, 11, 14, col) + R_(7, -52, 17, 4, OUT, ' rx="1" opacity=".55"') + R_(31, -27, 8, 10, '#8E95AE') + R_(38, -35, 34, 27, motor, ' rx="5"');
    for (var i = 0; i < 5; i++) o += '<path d="M' + (44 + i * 6) + ' -33v23" stroke="#fff" stroke-opacity=".2" stroke-width="2"/>';
    return o + '</g>';
  }
  function tankBox(x, y, w, h, d, water, level) {
    d = d || 18; level = level || .74; var dy = d * .55, s = shadow(x + w / 2 + d / 2, y + h + 4, w * .58 + d / 2);
    s += '<polygon points="' + (x + w) + ',' + y + ' ' + (x + w + d) + ',' + f1(y - dy) + ' ' + (x + w + d) + ',' + f1(y + h - dy) + ' ' + (x + w) + ',' + (y + h) + '" fill="#C2C7D8" stroke="' + OUT + '" stroke-opacity=".28"/>';
    s += '<polygon points="' + x + ',' + y + ' ' + (x + d) + ',' + f1(y - dy) + ' ' + (x + w + d) + ',' + f1(y - dy) + ' ' + (x + w) + ',' + y + '" fill="#F2F3F9" stroke="' + OUT + '" stroke-opacity=".28"/>';
    s += R_(x, y, w, h, 'url(#tcConc)', ' stroke="' + OUT + '" stroke-opacity=".32"');
    s += R_(x + 5, y + h * (1 - level), w - 10, h * level - 5, 'url(#' + (water || 'tcWater') + ')', ' rx="3"');
    s += '<path d="M' + (x + 5) + ' ' + f1(y + h * (1 - level) + 1);
    for (var i = 0; i < 4; i++) s += 'q' + f1((w - 10) / 8) + ' -3 ' + f1((w - 10) / 4) + ' 0';
    return s + '" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.5"/>';
  }
  function building(x, y, w, h, roof, body) {
    var s = shadow(x + w / 2, y + h + 3, w * .58, 4) + R_(x, y, w, h, body || '#F4F5FA', ' stroke="' + OUT + '" stroke-opacity=".28"');
    s += '<path d="M' + (x - 4) + ' ' + y + 'L' + f1(x + w / 2) + ' ' + f1(y - h * .3) + 'L' + (x + w + 4) + ' ' + y + 'Z" fill="' + (roof || '#3F3CBB') + '"/>';
    for (var i = 0; i < Math.max(1, Math.floor(w / 22)); i++) s += R_(x + 7 + i * 22, y + h * .3, 11, h * .28, '#A9DDEE', ' rx="1.5"');
    return s;
  }
  function city(x, y, s) {
    var o = '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')">';
    [[0, 56, 26, '#2A2766'], [30, 84, 30, '#17153F'], [64, 44, 22, '#3F3CBB'], [90, 70, 28, '#2A2766'], [122, 38, 24, '#4F5486']].forEach(function (b) {
      o += R_(b[0], -b[1], b[2], b[1], b[3]);
      for (var wy = -b[1] + 8; wy < -6; wy += 11) for (var wx = b[0] + 5; wx < b[0] + b[2] - 6; wx += 8) o += R_(wx, wy, 4, 5, '#BFEFFF', ' opacity=".75"');
    });
    return o + shadow(74, 2, 80, 4) + '</g>';
  }
  function bubbles(x, y, w, h, n, seed, col, op, down, r0, r1) {
    var rnd = mulberry(seed || 3), s = '', a = down ? y : y + h, b = down ? y + h : y;
    for (var i = 0; i < (n || 10); i++) {
      var cx = x + rnd() * w, rr = (r0 || 1.5) + rnd() * ((r1 || 3.4) - (r0 || 1.5)), dur = 2.2 + rnd() * 2, beg = rnd() * dur;
      s += '<circle cx="' + f1(cx) + '" cy="' + a + '" r="' + f1(rr) + '" fill="' + (col || '#fff') + '" opacity="0"><animate attributeName="cy" from="' + f1(a) + '" to="' + f1(b) + '" dur="' + dur.toFixed(2) + 's" begin="-' + beg.toFixed(2) + 's" repeatCount="indefinite"/>' +
        '<animate attributeName="opacity" values="0;' + (op || .75) + ';' + (op || .75) + ';0" keyTimes="0;.15;.8;1" dur="' + dur.toFixed(2) + 's" begin="-' + beg.toFixed(2) + 's" repeatCount="indefinite"/></circle>';
    }
    return s;
  }
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var r = Math.imul(a ^ a >>> 15, 1 | a); r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r; return ((r ^ r >>> 14) >>> 0) / 4294967296; }; }
  function rotor(cx, cy, r, dur, col, w, squash) {
    return '<g transform="translate(' + cx + ',' + cy + ') scale(1,' + (squash || 1) + ')"><g><path d="M' + (-r) + ' 0H' + r + 'M0 ' + (-r) + 'V' + r + '" stroke="' + (col || OUT) + '" stroke-width="' + (w || 4) + '" stroke-linecap="round"/>' +
      '<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="' + (dur || 4) + 's" repeatCount="indefinite"/></g></g>';
  }
  function fan(cx, cy, r, dur, animate) {
    var s = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#2D3154" stroke="#8E95AE" stroke-width="1.5"/>';
    var blades = '<path d="M0 0L' + f1(r * .9) + ' ' + f1(-r * .25) + 'A' + f1(r * .9) + ' ' + f1(r * .9) + ' 0 0 1 ' + f1(r * .55) + ' ' + f1(r * .55) + 'Z" fill="#9AA0BC"/>';
    var b3 = blades + '<g transform="rotate(120)">' + blades + '</g><g transform="rotate(240)">' + blades + '</g>';
    s += '<g transform="translate(' + cx + ',' + cy + ')"><g>' + b3 + (animate ? '<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="' + (dur || 1.6) + 's" repeatCount="indefinite"/>' : '') + '</g></g>';
    return s + '<circle cx="' + cx + '" cy="' + cy + '" r="' + f1(r * .18) + '" fill="#17153F"/>';
  }
  function waves(x, y, w, h, fill, amp, per, dur, crest, topOp) {
    amp = amp || 6; per = per || 120; dur = dur || 5;
    var n = Math.floor(w / per) + 4, d = 'M' + (x - per * 2) + ' ' + y;
    for (var i = 0; i < n; i++) d += 'q' + per / 4 + ' ' + (-amp) + ' ' + per / 2 + ' 0t' + per / 2 + ' 0';
    d += 'V' + (y + h) + 'H' + (x - per * 2) + 'Z';
    var cid = 'tccl' + Math.round(x) + '_' + Math.round(y) + '_' + Math.round(w);
    return '<g><clipPath id="' + cid + '"><rect x="' + x + '" y="' + (y - amp - 4) + '" width="' + w + '" height="' + (h + amp + 4) + '"/></clipPath><g clip-path="url(#' + cid + ')">' +
      R_(x, y + 2, w, h - 2, fill || 'url(#tcWater)') +
      '<path d="' + d + '" fill="' + (crest || '#7FD0EA') + '" opacity="' + (topOp || .9) + '"><animateTransform attributeName="transform" type="translate" from="0 0" to="' + per + ' 0" dur="' + dur + 's" repeatCount="indefinite"/></path>' +
      '<path d="' + d + '" fill="' + (fill || 'url(#tcWater)') + '" transform="translate(0 4)"><animateTransform attributeName="transform" type="translate" from="' + per / 2 + ' 5" to="' + (-per / 2) + ' 5" dur="' + (dur * 1.4) + 's" repeatCount="indefinite"/></path></g></g>';
  }
  var PIPE = { mv: '#D58A12', lv: '#E8A93A', gen: '#B8740B', dc: '#9A6FD6', fuel: '#4A4F6A', chws: '#0EA5C6', chwr: '#E5806E', cws: '#4A6FD0', cwr: '#D9776A',
               fws: '#1E8FC0', fwr: '#E08A5A', tcs: '#22B8D8', tcr: '#E86B5E', air: '#9AA3C7', data: '#5B57D6', fire: '#C93A33', water: '#2F8FD0', sig: '#7C7FA6', gas: '#B9BFD3' };
  function pipe(d, kind, w, flow, slow) {
    w = w || 7; var c = PIPE[kind] || kind;
    var s = '<path d="' + d + '" fill="none" stroke="#3A3F63" stroke-opacity=".42" stroke-width="' + (w + 3) + '" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"/>';
    if (flow !== false) s += '<path class="tc-flow' + (slow ? ' tc-slow' : '') + '" d="' + d + '" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="' + Math.max(2, w - 4) + '" stroke-dasharray="4 14" stroke-linecap="round" stroke-linejoin="round"/>';
    return s;
  }
  function thin(d, kind, w, dash) { return '<path class="tc-flow tc-slow" d="' + d + '" fill="none" stroke="' + (PIPE[kind] || kind) + '" stroke-width="' + (w || 2.4) + '" stroke-dasharray="' + (dash || '5 5') + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function air(d, hot, w) {
    var c = hot ? '#F08A7E' : '#52C3E2';
    return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-opacity=".28" stroke-width="' + ((w || 5) + 8) + '" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path class="tc-flow tc-slow" d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + (w || 5) + '" stroke-dasharray="12 8" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  function arrowHead(x, y, dir, col, s) {
    s = s || 9; var pts = { r: [x, y, x - s, y - s * .7, x - s, y + s * .7], l: [x, y, x + s, y - s * .7, x + s, y + s * .7], u: [x, y, x - s * .7, y + s, x + s * .7, y + s], d: [x, y, x - s * .7, y - s, x + s * .7, y - s] }[dir];
    return '<polygon points="' + pts.map(f1).join(' ').replace(/(\S+) (\S+) /g, '$1,$2 ').replace(/(\S+) (\S+)$/, '$1,$2') + '" fill="' + col + '"/>';
  }
  function banner(x, y, w, title, sub, sx, fill) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="30" rx="15" fill="url(#' + (fill || 'tcZone') + ')"/>' +
      '<text x="' + (x + 20) + '" y="' + (y + 20.5) + '" class="tc-zn">' + te(title) + (sub ? '<tspan class="tc-zn2" dx="18">' + te(sub) + '</tspan>' : '') + '</text>';
  }
  function label(cx, y, no, name, sub, anchor, zone) {
    var est = tw(t(name), 15.5, true) + 34, bx = anchor === 'start' ? cx : cx - est / 2;
    var s = '<circle cx="' + f1(bx + 12) + '" cy="' + (y - 5) + '" r="12.5" fill="url(#' + (zone || 'tcZone') + ')"/><text x="' + f1(bx + 12) + '" y="' + (y - .5) + '" text-anchor="middle" class="tc-ln">' + e(no) + '</text>';
    s += text(bx + 30, y, name, 'tc-lt');
    if (sub) s += text(bx + 30, y + 17, sub, 'tc-ls');
    return s;
  }
  function labelSpan(cx, name, anchor) { var est = tw(t(name), 15.5, true) + 34, x0 = anchor === 'start' ? cx : cx - est / 2; return [x0, x0 + est]; }
  function hot(key, name, x, y, w, h, body) {
    return '<g class="tc-hot" data-tco="' + key + '" tabindex="0" role="button" aria-label="' + te(name) + '"><rect x="' + Math.round(x) + '" y="' + Math.round(y) + '" width="' + Math.round(w) + '" height="' + Math.round(h) + '" fill="none" pointer-events="all"/>' + body + '</g>';
  }
  function unit(key, name, x, y, body, wh, lab, zone) {
    var sp = labelSpan(lab[0], lab[3], lab[5]), X0 = Math.min(x, sp[0]) - 4;
    return hot(key, name, X0, lab[1] - 22, Math.max(x + wh[0], sp[1]) - X0 + 8, y + wh[1] - lab[1] + 26, G(x, y, body) + label(lab[0], lab[1], lab[2], lab[3], lab[4], lab[5], zone));
  }

  /* ---------------------------------------------------------------- data-center equipment (local coordinates) */
  function cab(x, y, w, h, fill, o) {
    o = o || {}; var s = shadow(x + w / 2, y + h + 3, w * .6, 4);
    s += R_(x, y, w, h, fill || '#E8EAF3', ' rx="2.5" stroke="' + OUT + '" stroke-opacity=".35"');
    s += R_(x, y, w, 5, o.cap || '#3A3F63', ' rx="2"');
    if (o.door !== false) s += '<path d="M' + f1(x + w / 2) + ' ' + (y + 7) + 'V' + (y + h - 3) + '" stroke="' + OUT + '" stroke-opacity=".18"/>';
    return s;
  }
  function switchgear(x, y, n, w, h) {
    var s = '', cw = w / n;
    for (var i = 0; i < n; i++) {
      var cx = x + i * cw;
      s += cab(cx, y, cw - 2, h, '#E9EBF4', { door: false });
      s += R_(cx + 5, y + 10, cw - 12, h * .28, '#F7F8FC', ' rx="2" stroke="#B7BCD2"');
      s += '<circle cx="' + f1(cx + 9) + '" cy="' + f1(y + h * .48) + '" r="2.4" fill="' + (i % 2 ? '#16A34A' : '#E5534B') + '"/><circle cx="' + f1(cx + 16) + '" cy="' + f1(y + h * .48) + '" r="2.4" fill="#16A34A"/>';
      s += R_(cx + 5, y + h * .58, cw - 12, h * .34, '#DCDFEB', ' rx="2" stroke="#B7BCD2"') + R_(cx + cw - 10, y + h * .66, 3, 12, '#5E6484');
    }
    return s + '<path d="M' + (x + 4) + ' ' + (y + 15) + 'H' + (x + w - 6) + '" stroke="#D58A12" stroke-width="2.5"/>';
  }
  function lvBoard(x, y, n, w, h) {
    var s = '', cw = w / n;
    for (var i = 0; i < n; i++) {
      var cx = x + i * cw; s += cab(cx, y, cw - 2, h, '#EDEFF6', { door: false });
      for (var r = 0; r < 4; r++) for (var c = 0; c < 2; c++) s += R_(cx + 5 + c * ((cw - 12) / 2), y + 10 + r * (h - 16) / 4, (cw - 16) / 2, (h - 24) / 4, '#3A3F63', ' rx="1.5" opacity="' + (r === 0 ? .9 : .55) + '"');
    }
    return s;
  }
  function dryTx(x, y, w, h) {
    var s = shadow(x + w / 2, y + h + 4, w * .6, 5) + R_(x, y, w, h, 'url(#tcLouvre)', ' rx="3" stroke="' + OUT + '" stroke-opacity=".35"');
    s += R_(x + 8, y + 12, w - 16, h - 20, '#F3F4FA', ' rx="2" stroke="#B9BED2"');
    var cw = (w - 28) / 3;
    for (var i = 0; i < 3; i++) {
      var cx = x + 12 + i * (cw + 2);
      s += R_(cx, y + 22, cw, h - 40, 'url(#tcResin)', ' rx="' + f1(cw / 2.4) + '"') + R_(cx + cw * .35, y + 16, cw * .3, 8, '#7A819C');
    }
    return s + R_(x + 6, y + h - 8, w - 12, 6, '#4E5576', ' rx="1.5"');
  }
  function powerTx(x, y, s) {
    var o = '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')">' + shadow(46, 2, 52, 5);
    o += R_(10, -62, 72, 58, 'url(#tcSteel)', ' rx="4" stroke="' + OUT + '" stroke-opacity=".35"');
    for (var i = 0; i < 6; i++) o += R_(-2 + (i < 3 ? 0 : 88), -56 + (i % 3) * 16, 8, 14, '#9AA1B9', ' stroke="#6E7593" stroke-width=".8"');
    o += cylH(18, -84, 56, 14, 'tcSteelH', '#7A819C');
    [28, 46, 64].forEach(function (bx) { for (var k = 0; k < 4; k++) o += '<ellipse cx="' + bx + '" cy="' + (-68 - k * 6) + '" rx="' + (5 - k * .5) + '" ry="2.6" fill="#B07A47"/>'; o += R_(bx - 1.2, -96, 2.4, 6, '#5E6484'); });
    return o + R_(4, -6, 84, 6, '#4E5576', ' rx="1.5"') + '</g>';
  }
  function pylon(x, y, h) {
    var s = '<g stroke="#5E6484" stroke-width="1.6" fill="none">';
    s += '<path d="M' + (x - 16) + ' ' + y + 'L' + (x - 4) + ' ' + (y - h) + 'M' + (x + 16) + ' ' + y + 'L' + (x + 4) + ' ' + (y - h) + '"/>';
    for (var i = 0; i < 6; i++) { var y1 = y - i * h / 6, y2 = y - (i + 1) * h / 6, a = 16 - 12 * i / 6, b = 16 - 12 * (i + 1) / 6; s += '<path d="M' + f1(x - a) + ' ' + f1(y1) + 'L' + f1(x + b) + ' ' + f1(y2) + 'M' + f1(x + a) + ' ' + f1(y1) + 'L' + f1(x - b) + ' ' + f1(y2) + '"/>'; }
    s += '<path d="M' + (x - 26) + ' ' + (y - h * .8) + 'H' + (x + 26) + 'M' + (x - 20) + ' ' + (y - h * .62) + 'H' + (x + 20) + '"/></g>';
    return s;
  }
  function genset(x, y, w, h) {
    var s = shadow(x + w / 2, y + h + 4, w * .58, 5) + R_(x, y, w, h, 'url(#tcWhiteH)', ' rx="4" stroke="' + OUT + '" stroke-opacity=".35"');
    s += R_(x, y + h * .62, w, 7, '#E39B1B', ' opacity=".9"');
    for (var i = 0; i < 4; i++) s += R_(x + 10 + i * (w - 60) / 4, y + 10, (w - 70) / 4, h * .44, 'url(#tcLouvre)', ' rx="2"');
    s += R_(x + w - 42, y + 8, 34, h - 18, '#3A3F63', ' rx="3"') + fan(x + w - 25, y + h * .42, 12, 1.2, true);
    s += R_(x + 18, y - 34, 9, 36, '#5E6484') + R_(x + 15, y - 38, 15, 6, '#3A3F63', ' rx="1.5"');
    s += bubbles(x + 8, y - 80, 26, 44, 4, 7, '#9AA0BC', .5, false, 4, 8);
    return s + R_(x + 4, y + h - 2, w - 8, 6, '#4E5576', ' rx="1.5"');
  }
  function fuelTank(x, y, w, h) {
    var s = shadow(x + w / 2, y + h + 4, w * .55, 4) + cylH(x, y, w, h, 'tcSteelH', '#5E6484');
    s += R_(x + w * .2, y + h - 2, 8, 8, '#4E5576') + R_(x + w * .72, y + h - 2, 8, 8, '#4E5576');
    return s + R_(x + w * .45, y - 6, 8, 7, '#3A3F63');
  }
  function upsCab(x, y, n, w, h) {
    var s = '', cw = w / n;
    for (var i = 0; i < n; i++) {
      var cx = x + i * cw; s += cab(cx, y, cw - 2, h, '#F4F5FA', { door: false, cap: '#2A2785' });
      if (i === 0) s += R_(cx + 5, y + 11, cw - 12, 14, '#0B6F88', ' rx="2"') + '<path d="M' + (cx + 8) + ' ' + (y + 21) + 'l5 -5 5 3 6 -6" stroke="#9FE6F6" stroke-width="1.6" fill="none"/>';
      for (var r = 0; r < 5; r++) s += R_(cx + 5, y + 30 + r * (h - 38) / 5, cw - 12, (h - 46) / 5, '#DCDFEB', ' rx="1.5" stroke="#B7BCD2" stroke-width=".8"') + '<circle cx="' + f1(cx + cw - 11) + '" cy="' + f1(y + 35 + r * (h - 38) / 5) + '" r="1.8" fill="#16A34A"/>';
    }
    return s;
  }
  function battRack(x, y, n, w, h, lfp) {
    var s = '', cw = w / n;
    for (var i = 0; i < n; i++) {
      var cx = x + i * cw; s += cab(cx, y, cw - 2, h, '#3A3F63', { door: false, cap: '#17153F' });
      var m = 7; for (var r = 0; r < m; r++) s += R_(cx + 4, y + 9 + r * (h - 14) / m, cw - 10, (h - 14) / m - 3, lfp === false ? '#6E7593' : '#4F55A0', ' rx="1.5"') + R_(cx + cw - 12, y + 12 + r * (h - 14) / m, 3, 3, '#5BE0B0');
    }
    return s;
  }
  function bessBox(x, y, w, h) {
    var s = shadow(x + w / 2, y + h + 4, w * .58, 5) + R_(x, y, w, h, 'url(#tcWhiteH)', ' rx="3" stroke="' + OUT + '" stroke-opacity=".35"');
    for (var i = 1; i < 6; i++) s += '<path d="M' + f1(x + i * w / 6) + ' ' + (y + 4) + 'V' + (y + h - 4) + '" stroke="#B7BCD2"/>';
    s += R_(x, y + h * .2, w, 6, '#0EA5C6', ' opacity=".85"') + R_(x + w - 4, y + h * .3, 12, h * .45, '#5E6484', ' rx="2"');
    return s + text(x + w / 2, y + h * .72, 'BESS · LFP', 'tc-lc', ' text-anchor="middle" style="fill:#2A2785;font-size:12px"');
  }
  function busway(x, y, w, taps, drop) {
    var s = R_(x, y, w, 9, 'url(#tcAmber)', ' rx="2" stroke="' + OUT + '" stroke-opacity=".35"');
    for (var i = 0; i < taps; i++) { var tx = x + 14 + i * (w - 28) / Math.max(1, taps - 1); s += R_(tx - 7, y + 9, 14, 12, '#3A3F63', ' rx="1.5"') + '<path d="M' + f1(tx) + ' ' + (y + 21) + 'V' + (y + 21 + (drop || 18)) + '" stroke="#3A3F63" stroke-width="2"/>'; }
    return s;
  }
  function rack(x, y, w, h, o) {
    o = o || {}; var s = shadow(x + w / 2, y + h + 3, w * .62, 4) + R_(x, y, w, h, 'url(#tcRack)', ' rx="3" stroke="' + OUT + '" stroke-opacity=".5"');
    s += R_(x + 3, y + 4, w - 6, h - 8, '#2E3254', ' rx="1.5"');
    var u = o.gpu ? 9 : 6, n = Math.floor((h - 12) / (u + 2));
    for (var i = 0; i < n; i++) {
      var yy = y + 6 + i * (u + 2);
      s += R_(x + 5, yy, w - 10, u, o.gpu ? (i % 5 === 2 ? '#3D4378' : '#3A3F6E') : (i % 4 === 3 ? '#353A62' : '#3B4070'), ' rx="1"');
      s += '<circle cx="' + f1(x + w - 9) + '" cy="' + f1(yy + u / 2) + '" r="1.3" fill="' + (i % 3 ? '#5BE0B0' : '#5BD0E8') + '"' + (o.blink && i === 2 ? '><animate attributeName="opacity" values="1;.2;1" dur="1.4s" repeatCount="indefinite"/></circle>' : '/>');
    }
    if (o.gpu) s += '<path d="M' + (x + w + 1) + ' ' + (y + 8) + 'V' + (y + h - 8) + '" stroke="#22B8D8" stroke-width="3"/><path d="M' + (x - 1) + ' ' + (y + 8) + 'V' + (y + h - 8) + '" stroke="#E86B5E" stroke-width="3"/>';
    return s;
  }
  function rackRow(x, y, n, w, h, o) { var s = ''; for (var i = 0; i < n; i++) s += rack(x + i * (w + 3), y, w, h, Object.assign({}, o, { blink: o && o.blink && i === 1 })); return s; }
  function containment(x, y, w, h) {
    return R_(x, y, w, h, 'url(#tcGlass)', ' rx="3" stroke="#7FC6DA" stroke-width="1.2"') + '<path d="M' + x + ' ' + (y + h) + 'H' + (x + w) + '" stroke="#7FC6DA" stroke-width="2"/>';
  }
  function crah(x, y, w, h, anim) {
    var s = cab(x, y, w, h, '#EFF1F8', { door: false, cap: '#0B6F88' });
    s += R_(x + 6, y + 10, w - 12, h * .42, 'url(#tcMesh)', ' rx="2" stroke="#B7BCD2"');
    var r = Math.min(w / 4.4, 12); s += fan(x + w * .3, y + h * .72, r, 1.4, anim) + fan(x + w * .7, y + h * .72, r, 1.4, false);
    return s;
  }
  function fanWall(x, y, w, h, nx, ny, anim) {
    var s = cab(x, y, w, h, '#E9EBF4', { door: false, cap: '#0B6F88' }), r = Math.min((w - 10) / nx, (h - 12) / ny) / 2 - 2;
    for (var i = 0; i < nx; i++) for (var j = 0; j < ny; j++) s += fan(x + 5 + (i + .5) * (w - 10) / nx, y + 8 + (j + .5) * (h - 12) / ny, r, 1.3, anim && i === 0 && j === 0);
    return s;
  }
  function chiller(x, y, w, h) {
    var s = shadow(x + w / 2, y + h + 4, w * .58, 5) + R_(x, y + h - 8, w, 8, '#4E5576', ' rx="2"');
    s += cylH(x + 4, y + h * .52, w - 30, h * .36, 'tcWhiteH', '#0EA5C6') + cylH(x + 4, y + h * .14, w - 30, h * .34, 'tcWhiteH', '#3F3CBB');
    s += R_(x + w * .3, y - h * .16, w * .3, h * .3, 'url(#tcSteel)', ' rx="8" stroke="' + OUT + '" stroke-opacity=".3"') + '<circle cx="' + f1(x + w * .45) + '" cy="' + f1(y - h * .01) + '" r="' + f1(h * .1) + '" fill="#3F3CBB" opacity=".75"/>';
    return s + R_(x + w - 24, y + h * .14, 20, h * .74, '#E9EBF4', ' rx="2" stroke="#B7BCD2"') + R_(x + w - 20, y + h * .2, 12, 9, '#0B6F88', ' rx="1"');
  }
  function coolingTower(x, y, w, h, anim) {
    var s = shadow(x + w / 2, y + h + 4, w * .6, 5);
    s += '<path d="M' + x + ' ' + (y + h) + 'L' + (x + 6) + ' ' + y + 'H' + (x + w - 6) + 'L' + (x + w) + ' ' + (y + h) + 'Z" fill="#E7E9F2" stroke="' + OUT + '" stroke-opacity=".35"/>';
    s += R_(x + 4, y + h * .6, w - 8, h * .36, 'url(#tcLouvre)', ' rx="2"') + R_(x + 2, y + h - 6, w - 4, 6, 'url(#tcWater)');
    s += cylV(x + w * .2, y - 18, w * .6, 18, 'tcSteel', '#3A3F63') + rotor(x + w / 2, y - 18, w * .26, 2.2, '#9AA0BC', 3, .3);
    if (anim !== false) s += bubbles(x + w * .2, y - 70, w * .6, 48, 6, 11, '#E3E7F2', .7, false, 5, 10);
    return s;
  }
  function dryCooler(x, y, w, h, nf) {
    var s = shadow(x + w / 2, y + h + 4, w * .58, 5) + R_(x, y, w, h, '#ECEEF6', ' rx="3" stroke="' + OUT + '" stroke-opacity=".35"');
    s += '<path d="M' + (x + 6) + ' ' + (y + h - 6);
    for (var i = 0; i < 8; i++) s += 'L' + f1(x + 6 + (i + .5) * (w - 12) / 8) + ' ' + (i % 2 ? y + h - 6 : y + 10);
    s += '" stroke="#0EA5C6" stroke-width="2" fill="none"/>';
    for (var j = 0; j < (nf || 3); j++) { var fx = x + (j + .5) * w / (nf || 3); s += '<ellipse cx="' + f1(fx) + '" cy="' + y + '" rx="' + f1(w / (nf || 3) / 2 - 4) + '" ry="5" fill="#3A3F63"/>' + (j === 0 ? rotor(fx, y, w / (nf || 3) / 2 - 7, 1.6, '#9AA0BC', 2.5, .25) : ''); }
    return s;
  }
  function cduCab(x, y, w, h) {
    var s = cab(x, y, w, h, '#EFF1F8', { door: false, cap: '#0B6F88' });
    for (var i = 0; i < 7; i++) s += R_(x + 8 + i * 4, y + 14, 2.4, h * .4, '#7A819C');
    s += '<circle cx="' + f1(x + w * .68) + '" cy="' + f1(y + h * .33) + '" r="' + f1(w * .16) + '" fill="#0EA5C6" stroke="' + OUT + '" stroke-opacity=".3"/><circle cx="' + f1(x + w * .68) + '" cy="' + f1(y + h * .33) + '" r="' + f1(w * .06) + '" fill="#fff" opacity=".5"/>';
    s += R_(x + 8, y + h * .62, w - 16, 12, '#0B6F88', ' rx="2"') + '<path d="M' + (x + 12) + ' ' + f1(y + h * .62 + 8) + 'l5 -4 5 2 6 -5" stroke="#9FE6F6" stroke-width="1.5" fill="none"/>';
    return s + R_(x + w * .25, y - 8, 7, 9, '#22B8D8') + R_(x + w * .6, y - 8, 7, 9, '#E86B5E');
  }
  function phe(x, y, w, h) {
    var s = shadow(x + w / 2, y + h + 3, w * .6, 4) + R_(x, y, 8, h, '#3A3F63', ' rx="1.5"') + R_(x + w - 8, y, 8, h, '#3A3F63', ' rx="1.5"');
    for (var i = 0; i < Math.floor((w - 18) / 3.4); i++) s += R_(x + 10 + i * 3.4, y + 6, 2.2, h - 12, i % 2 ? '#B9BED2' : '#E3E6F0');
    return s + R_(x - 4, y + 3, w + 8, 4, '#5E6484', ' rx="2"');
  }
  function gasCyl(x, y, n, col) {
    var s = '';
    for (var i = 0; i < n; i++) { var cx = x + i * 20; s += shadow(cx + 8, y + 92, 10, 3) + R_(cx, y, 16, 90, 'url(#' + (col || 'tcRed') + ')', ' rx="8" stroke="' + OUT + '" stroke-opacity=".3"') + R_(cx + 4, y - 9, 8, 10, '#5E6484', ' rx="1.5"'); }
    return s + '<path d="M' + (x + 8) + ' ' + (y - 12) + 'H' + (x + (n - 1) * 20 + 8) + '" stroke="#5E6484" stroke-width="3"/>';
  }
  function camera(x, y, s, flip, cone) {
    var o = '<g transform="translate(' + x + ',' + y + ') scale(' + (flip ? -(s || 1) : (s || 1)) + ',' + (s || 1) + ')">';
    if (cone !== false) o += '<path d="M14 2L80 -18V40Z" fill="#5BD0E8" opacity=".14"/>';
    o += R_(-6, -10, 4, 14, '#5E6484') + R_(-6, -10, 12, 4, '#5E6484') + R_(0, -6, 18, 11, '#F2F3F9', ' rx="3" stroke="' + OUT + '" stroke-opacity=".4"') + '<circle cx="17" cy="-.5" r="3" fill="#17153F"/>';
    return o + '</g>';
  }
  function fence(x, y, w, h) {
    var s = R_(x, y - h, w, h, 'url(#tcMesh)', ' opacity=".9"');
    for (var px = x; px <= x + w; px += 30) s += R_(px - 1.5, y - h - 6, 3, h + 6, '#5E6484');
    return s + '<path d="M' + x + ' ' + (y - h - 6) + 'H' + (x + w) + '" stroke="#5E6484" stroke-width="1.4" stroke-dasharray="3 3"/><path d="M' + x + ' ' + (y - 3) + 'H' + (x + w) + '" stroke="#E5534B" stroke-width="1.5" stroke-dasharray="1 5"/>';
  }
  function bollards(x, y, n) { var s = ''; for (var i = 0; i < n; i++) s += R_(x + i * 16, y - 26, 9, 26, '#5E6484', ' rx="4"') + R_(x + i * 16, y - 20, 9, 4, '#E39B1B'); return s; }
  function barrier(x, y, w) {
    var s = R_(x, y - 30, 12, 30, '#3A3F63', ' rx="2"') + R_(x + 10, y - 26, w, 6, '#fff', ' stroke="#5E6484" stroke-width=".8"');
    for (var i = 0; i < w; i += 16) s += R_(x + 12 + i, y - 26, 8, 6, '#E5534B');
    return s;
  }
  function mantrap(x, y, h) {
    var s = '';
    for (var i = 0; i < 2; i++) { var cx = x + i * 40; s += shadow(cx + 16, y + 2, 18, 3) + R_(cx, y - h, 32, h, 'url(#tcGlass)', ' rx="15" stroke="#7FC6DA" stroke-width="1.4"') + R_(cx + 14, y - h + 10, 4, h - 20, '#7FC6DA', ' opacity=".6"'); }
    return s;
  }
  function reader(x, y) {
    return R_(x, y, 16, 24, '#3A3F63', ' rx="3"') + R_(x + 3, y + 3, 10, 7, '#0EA5C6', ' rx="1"') + '<path d="M' + (x + 4) + ' ' + (y + 18) + 'a4 4 0 0 1 8 0M' + (x + 6) + ' ' + (y + 18) + 'a2 2 0 0 1 4 0" stroke="#9FE6F6" stroke-width="1" fill="none"/>';
  }
  function nocWall(x, y, w, h) {
    var s = shadow(x + w / 2, y + h + 4, w * .6, 4), cw = (w - 8) / 4, ch = (h * .62 - 8) / 2;
    s += R_(x, y, w, h * .62, '#17153F', ' rx="3"');
    for (var i = 0; i < 4; i++) for (var j = 0; j < 2; j++) {
      var sx = x + 4 + i * cw, sy = y + 4 + j * ch;
      s += R_(sx + 1, sy + 1, cw - 2, ch - 2, (i + j) % 3 ? '#232A63' : '#1B3E62', ' rx="1.5"');
      s += '<path d="M' + f1(sx + 4) + ' ' + f1(sy + ch - 6) + 'l' + f1(cw * .2) + ' ' + (-(i + 2) * 2) + 'l' + f1(cw * .2) + ' ' + ((j + 1) * 3) + 'l' + f1(cw * .25) + ' ' + (-(i + j + 2) * 2) + '" stroke="' + ((i + j) % 2 ? '#5BD0E8' : '#5BE0B0') + '" stroke-width="1.4" fill="none"/>';
    }
    s += R_(x + w * .12, y + h * .78, w * .76, 8, '#5E6484', ' rx="2"');
    for (var k = 0; k < 3; k++) s += R_(x + w * .2 + k * w * .22, y + h * .64, w * .14, h * .13, '#2A2766', ' rx="1.5"');
    return s + R_(x + w * .18, y + h * .86, 4, h * .14, '#5E6484') + R_(x + w * .8, y + h * .86, 4, h * .14, '#5E6484');
  }
  function firePanel(x, y, w, h) {
    return cab(x, y, w, h, '#D2423B', { door: false, cap: '#8E1F1A' }) + R_(x + 6, y + 10, w - 12, h * .3, '#17153F', ' rx="2"') + R_(x + 9, y + 14, w - 18, 3, '#5BE0B0') +
      [0, 1, 2, 3].map(function (i) { return '<circle cx="' + f1(x + 9 + i * (w - 18) / 3) + '" cy="' + f1(y + h * .58) + '" r="2.5" fill="' + (i === 0 ? '#FFE3A3' : '#fff') + '" opacity=".9"/>'; }).join('');
  }
  function smokeDet(x, y) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="9" ry="3.5" fill="#F4F5FA" stroke="#8E95AE"/><circle cx="' + x + '" cy="' + (y + 1) + '" r="1.6" fill="#E5534B"/>'; }
  function sprinklers(x, y, w, n) {
    var s = '<path d="M' + x + ' ' + y + 'H' + (x + w) + '" stroke="#C93A33" stroke-width="5" stroke-linecap="round"/>';
    for (var i = 0; i < n; i++) { var sx = x + 18 + i * (w - 36) / Math.max(1, n - 1); s += R_(sx - 1.5, y, 3, 8, '#8E95AE') + '<path d="M' + (sx - 5) + ' ' + (y + 10) + 'h10" stroke="#8E95AE" stroke-width="2"/>'; }
    return s;
  }
  function vesda(x, y, w, h) {
    return cab(x, y, w, h, '#F4F5FA', { door: false, cap: '#B0302A' }) + R_(x + 5, y + 10, w - 10, 10, '#17153F', ' rx="1.5"') +
      [0, 1, 2, 3].map(function (i) { return R_(x + 6 + i * (w - 12) / 4, y + h - 18 - i * 3, (w - 12) / 4 - 2, 8 + i * 3, ['#16A34A', '#E39B1B', '#E5534B', '#8E1F1A'][i], ' rx="1"'); }).join('');
  }
  function fibreBand(x, y, w, h) {
    var s = R_(x, y, w, h, 'url(#tcSoil)', ' opacity=".55"');
    [0.3, 0.62].forEach(function (k, i) {
      var yy = y + h * k;
      s += '<path d="M' + x + ' ' + f1(yy) + 'H' + (x + w) + '" stroke="#2C2A62" stroke-width="7" stroke-linecap="round"/>' +
        '<path class="tc-flow' + (i ? ' tc-slow' : '') + '" d="M' + x + ' ' + f1(yy) + 'H' + (x + w) + '" stroke="#7CE3F6" stroke-width="2" stroke-dasharray="6 26"/>';
    });
    return s;
  }
  function ground(x, y, w) { return R_(x, y, w, 10, 'url(#tcGround)', ' rx="3"'); }

  /* ============================================================== icons (24 × 24) */
  var IC = {
    bolt: '<path d="M13 2L5 14h6l-1 8 8-12h-6z" fill="#E39B1B"/>',
    snow: '<path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9" stroke="#0EA5C6" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="12" r="2.6" fill="#17153F"/>',
    server: '<rect x="4" y="3" width="16" height="7" rx="1.5" fill="#3F3CBB"/><rect x="4" y="14" width="16" height="7" rx="1.5" fill="#17153F"/><circle cx="8" cy="6.5" r="1.2" fill="#5BE0B0"/><circle cx="8" cy="17.5" r="1.2" fill="#5BD0E8"/>',
    fire: '<path d="M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-2 2-2 4-2 5-1-1-2-2-2-4-3 3-6 6-6 9a7 7 0 0 0 7 7z" fill="#E5534B"/><path d="M12 22a3 3 0 0 0 3-3c0-2-2-3-2-5-1 1-4 3-4 5a3 3 0 0 0 3 3z" fill="#FFE3A3"/>',
    shield: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z" fill="#3F3CBB"/><path d="M8.5 12l2.5 2.5 4.5-5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>',
    monitor: '<rect x="3" y="4" width="18" height="12" rx="2" fill="#17153F"/><path d="M6 13l3-4 3 2 4-5 2 3" stroke="#5BD0E8" stroke-width="1.8" fill="none"/><path d="M9 20h6M12 16v4" stroke="#3F3CBB" stroke-width="2"/>',
    gauge: '<path d="M4 16a8 8 0 1 1 16 0" fill="none" stroke="#0EA5C6" stroke-width="2.4" stroke-linecap="round"/><path d="M12 16l4-6" stroke="#17153F" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="16" r="2" fill="#17153F"/>',
    battery: '<rect x="3" y="7" width="16" height="10" rx="2" fill="none" stroke="#17153F" stroke-width="2"/><rect x="19" y="10" width="2.5" height="4" rx="1" fill="#17153F"/><rect x="5.5" y="9.5" width="8" height="5" rx="1" fill="#16A34A"/>',
    plug: '<path d="M8 3v5M16 3v5" stroke="#17153F" stroke-width="2.2" stroke-linecap="round"/><path d="M6 8h12v3a6 6 0 0 1-12 0z" fill="#E39B1B"/><path d="M12 17v4" stroke="#17153F" stroke-width="2.2"/>',
    fan: '<circle cx="12" cy="12" r="9" fill="none" stroke="#17153F" stroke-width="2"/><path d="M12 12c0-4 2-6 4-5s-1 5-4 5zM12 12c-4 0-6-2-5-4s5 1 5 4zM12 12c0 4-2 6-4 5s1-5 4-5zM12 12c4 0 6 2 5 4s-5-1-5-4z" fill="#0EA5C6"/>',
    drop: '<path d="M12 3c3.5 4.6 6 8 6 11a6 6 0 0 1-12 0c0-3 2.5-6.4 6-11z" fill="#0EA5C6"/><path d="M9 14a3 3 0 0 0 3 3" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
    therm: '<path d="M10 4a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z" fill="none" stroke="#17153F" stroke-width="2"/><circle cx="12" cy="17" r="2.4" fill="#E5534B"/><path d="M12 8v8" stroke="#E5534B" stroke-width="2"/>',
    tower: '<path d="M5 21l2-12h10l2 12z" fill="#0EA5C6"/><rect x="8" y="5" width="8" height="4" rx="1" fill="#17153F"/><path d="M9 3c1 1 1 1 0 2M15 3c1 1 1 1 0 2" stroke="#9AA0BC" stroke-width="1.6" fill="none"/>',
    clock: '<circle cx="12" cy="12" r="9" fill="none" stroke="#3F3CBB" stroke-width="2.4"/><path d="M12 7v5l3 2" stroke="#17153F" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    cycle: '<path d="M20 12a8 8 0 0 1-14 5M4 12a8 8 0 0 1 14-5" fill="none" stroke="#3F3CBB" stroke-width="2.4" stroke-linecap="round"/><path d="M18 3v4h-4M6 21v-4h4" fill="none" stroke="#17153F" stroke-width="2.2" stroke-linecap="round"/>',
    balance: '<path d="M3 7h18M3 12h12M3 17h7" stroke="#3F3CBB" stroke-width="3" stroke-linecap="round"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z" fill="#3F3CBB"/><path d="M3 12l9 5 9-5M3 16l9 5 9-5" fill="none" stroke="#17153F" stroke-width="2"/>',
    pin: '<path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z" fill="#E5534B"/><circle cx="12" cy="10" r="2.6" fill="#fff"/>',
    chat: '<path d="M4 5h16v10H9l-5 4z" fill="#0EA5C6"/><path d="M8 9h8M8 12h5" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>',
    law: '<path d="M6 3h9l4 4v14H6z" fill="#ECECFB" stroke="#17153F" stroke-width="1.6"/><path d="M9 11h7M9 14h7M9 17h5" stroke="#3F3CBB" stroke-width="2" stroke-linecap="round"/>',
    network: '<circle cx="12" cy="5" r="2.6" fill="#3F3CBB"/><circle cx="5" cy="18" r="2.6" fill="#0EA5C6"/><circle cx="19" cy="18" r="2.6" fill="#0EA5C6"/><path d="M12 7.5v4M12 11.5L5 15.5M12 11.5l7 4" stroke="#17153F" stroke-width="1.8"/>',
    camera: '<rect x="3" y="8" width="13" height="8" rx="2" fill="#17153F"/><path d="M16 10l5-2v8l-5-2z" fill="#3F3CBB"/><circle cx="8" cy="12" r="2" fill="#5BD0E8"/>',
    key: '<circle cx="8" cy="12" r="4.5" fill="none" stroke="#17153F" stroke-width="2.2"/><path d="M12.5 12H21M18 12v3M21 12v2" stroke="#3F3CBB" stroke-width="2.2" stroke-linecap="round"/>',
    leaf: '<path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15z" fill="#16A34A"/><path d="M5 19l9-9" stroke="#fff" stroke-width="1.6"/>',
    grid: '<rect x="3" y="3" width="8" height="8" rx="2" fill="#3F3CBB"/><rect x="13" y="3" width="8" height="8" rx="2" fill="#0EA5C6"/><rect x="3" y="13" width="8" height="8" rx="2" fill="#17153F"/><rect x="13" y="13" width="8" height="8" rx="2" fill="#E39B1B"/>',
    earth: '<path d="M12 3v9M5 12h14M7.5 15.5h9M10 19h4" stroke="#17153F" stroke-width="2.2" stroke-linecap="round"/>',
    wave: '<path d="M2 10c3-3 5 3 8 0s5 3 8 0 3 0 4 0M2 16c3-3 5 3 8 0s5 3 8 0 3 0 4 0" fill="none" stroke="#0EA5C6" stroke-width="2.2" stroke-linecap="round"/>',
    money: '<rect x="3" y="6" width="18" height="12" rx="2" fill="#3F3CBB"/><circle cx="12" cy="12" r="3" fill="#fff"/>',
    flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" fill="none" stroke="#17153F" stroke-width="2"/><path d="M7 16h10l1.5 3H5.5z" fill="#0EA5C6"/>',
    bell: '<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4z" fill="#E5534B"/><path d="M10 21h4" stroke="#17153F" stroke-width="2"/>',
    building: '<rect x="5" y="3" width="14" height="18" rx="1.5" fill="#3F3CBB"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" stroke="#fff" stroke-width="1.8"/>'
  };
  function svgIcon(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (IC[n] || IC.grid) + '</svg>'; }
  function icon(n, bg) { return '<i style="background:' + (bg || '#ECECFB') + '">' + svgIcon(n) + '</i>'; }

  /* ============================================================== slide furniture */
  var LOGO = 'assets/img/ccepc_logo_strip.png';
  var UI = {
    eyebrow: ['Project Technology Simulation · Data Center', '项目技术模拟 · 数据中心'], org: ['PT CCEPC Indonesia · Data Center', 'PT CCEPC Indonesia · 数据中心业务'],
    click: ['Click any part for details', '点击任意部分查看详情'], basis: ['Design basis', '设计基准'], gloss: ['Abbreviations & sources', '缩写与来源'],
    how: ['How it works', '工作原理'], forBasis: ['In this design basis', '本设计基准中'], ratings: ['Typical ratings', '典型规格'],
    params: ['Design parameters (TPG excerpt)', '设计参数（TPG摘录）'], req: ['Key technical requirements', '主要技术要求'], stds: ['Applicable standards', '适用标准'],
    tests: ['Inspection & testing', '检验与试验'], om: ['Operation, maintenance & common issues', '运行、维护与常见问题'], see: ['See also', '另见'],
    calc: ['Step-by-step calculation', '分步计算'], calcHint: ['Change any input — linked AUTO inputs follow their code / standard rule and every step recalculates. Editing an AUTO value makes it MANUAL; ↺ restores the rule.', '修改任一输入——联动的“自动”参数按规范/标准规则调整，每一步即时重算。修改“自动”值即转为“手动”；↺恢复规则值。'],
    auto: ['AUTO', '自动'], manual: ['MANUAL', '手动'], basisB: ['BASIS', '基准'], applyRule: ['Apply the rule again', '重新按规则取值'],
    theory: ['Short theory & calculation', '原理简述与计算'], fullSpec: ['Full specification & TPG', '完整技术规范及TPG'], relEq: ['Related equipment', '相关设备'],
    desc: ['Description', '描述'], unit: ['Unit', '单位'], req2: ['Required', '要求值'], faq: ['Frequently asked questions', '常见问题'], faqSub: ['Short answers for owners and clients', '面向业主与客户的简要解答'],
    prev: ['Previous', '上一个'], next: ['Next', '下一个'], close: ['Close', '关闭'], openCard: ['Open simulation', '打开模拟'], note: ['Results are design checks for explanation, not detailed design.', '计算结果用于讲解与校核，并非详细设计。']
  };
  function langSwitch() { return '<button type="button" class="tc-lang" data-lang-btn aria-label="Language / 语言"><b class="' + (lang() === 'en' ? 'on' : '') + '">EN</b><b class="' + (lang() === 'zh' ? 'on' : '') + '">中文</b></button>'; }
  function header(card) {
    return '<header class="tc-hdr tc-abs"><div class="tc-logo"><img src="' + LOGO + '" alt="MINMETALS · MCC · CCEPC"></div>' +
      '<div class="tc-ttl"><div class="tc-eyebrow">' + te(UI.eyebrow) + '</div><h1 class="tc-h1">' + te(card.title) + (card.abbr ? ' <b>(' + e(card.abbr) + ')</b>' : '') + '<small>' + te(o(card.title)) + '</small></h1>' +
      '<div class="tc-tag">' + t(card.tag) + '</div></div>' +
      '<div class="tc-hdr-r"><span class="tc-badge">' + te(card.badge) + '</span><span class="tc-org">' + te(UI.org) + '</span>' + langSwitch() + '</div></header><div class="tc-ribbon tc-abs"></div>';
  }
  function footer(note, links) {
    return '<div class="tc-foot tc-abs"><span>' + te(note) + '</span><span class="tc-sp"></span>' + links.map(function (l) { return '<a data-tco="' + l[0] + '" tabindex="0" role="button">' + te(l[1]) + '</a>'; }).join('') + '<span>' + te(UI.click) + '</span></div>';
  }
  function principle(key, ic, title, svg, caption) {
    return '<div class="tc-panel tc-tile tc-abs" data-tco="' + key + '" tabindex="0" role="button" style="left:1515px;top:150px;width:370px;height:300px;padding:16px 16px 10px;display:grid;gap:6px;align-content:start">' +
      '<div class="tc-ph">' + icon(ic) + te(title) + '<em>' + te(o(title)) + '</em></div>' + svg.replace('<svg ', '<svg style="height:180px;width:100%" ') +
      '<div style="font-size:13px;color:#4A4F72;line-height:1.4">' + t(caption) + '</div></div>';
  }
  function chips(list) {
    return '<div class="tc-panel tc-abs" style="left:1515px;top:462px;width:370px;height:94px;padding:8px 10px"><div class="tc-chips">' +
      list.map(function (c) { return '<div class="tc-chip tc-tile" data-tco="' + c[0] + '" tabindex="0" role="button">' + svgIcon(c[1]) + te(c[2]) + '</div>'; }).join('') + '</div></div>';
  }
  function kpis(list) {
    return list.map(function (k, i) {
      var v = t(k[1]), fs = v.length > 8 ? 21 : 26;
      return '<div class="tc-panel tc-tile tc-kpi tc-abs" data-tco="' + k[0] + '" tabindex="0" role="button" style="left:' + (1515 + (i % 2) * 190) + 'px;top:' + (568 + Math.floor(i / 2) * 106) + 'px;width:180px;height:98px">' +
        '<div class="v" style="font-size:' + fs + 'px">' + e(v) + '<small>' + te(k[2]) + '</small></div><div class="k">' + te(k[3]) + '</div><div class="d">' + te(k[4]) + '</div></div>';
    }).join('');
  }
  var TILE_X = [40, 411, 782, 1153, 1524];
  function tile(i, key, ic, title, em, body, bg) {
    return '<div class="tc-panel tc-tile tc-bt tc-abs" data-tco="' + key + '" tabindex="0" role="button" style="left:' + TILE_X[i] + 'px;top:792px;width:356px;height:236px">' +
      '<div class="tc-ph">' + icon(ic, bg) + te(title) + '<em>' + te(em) + '</em></div>' + body + '</div>';
  }
  function miniBars(rows, vmax, unitTxt) {
    return '<div class="tc-mini">' + rows.map(function (r) {
      return '<div><span>' + te(r[0]) + '</span><span class="tc-bar2"><span style="width:' + Math.max(3, Math.min(100, r[1] / vmax * 100)).toFixed(0) + '%;background:' + r[2] + '"></span></span><b>' + (r[4] !== undefined ? te(r[4]) : F(r[1], r[3] || 0) + (unitTxt || '')) + '</b></div>';
    }).join('') + '</div>';
  }
  function donut(parts, o2) {
    o2 = o2 || {}; var r = o2.r || 52, w = o2.w || 20, size = o2.size || 122, tot = parts.reduce(function (a, p) { return a + p[1]; }, 0), c = 2 * Math.PI * r, off = 0;
    var s = '<svg viewBox="0 0 130 130" style="width:' + size + 'px;height:' + size + 'px;flex:none"><circle cx="65" cy="65" r="' + r + '" fill="none" stroke="#E6E8F3" stroke-width="' + w + '"/>';
    parts.forEach(function (p) { var L = c * p[1] / (tot || 1); s += '<circle cx="65" cy="65" r="' + r + '" fill="none" stroke="' + p[2] + '" stroke-width="' + w + '" stroke-dasharray="' + L.toFixed(2) + ' ' + (c - L).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" transform="rotate(-90 65 65)"/>'; off += L; });
    return s + '<text x="65" y="63" text-anchor="middle" style="font:800 21px var(--tc-f);fill:#17153F">' + e(o2.center !== undefined ? o2.center : F(tot, o2.d || 0)) + '</text><text x="65" y="81" text-anchor="middle" style="font:600 11px var(--tc-f);fill:#5D6280">' + te(o2.unit || '') + '</text></svg>';
  }
  function legend(parts, d, unitTxt) {
    return parts.map(function (p) { return '<div style="display:flex;gap:6px;align-items:center;font-size:12.5px"><span style="width:10px;height:10px;border-radius:3px;background:' + p[2] + ';flex:none"></span>' + te(p[0]) + '<b style="margin-left:auto">' + (p[3] !== undefined ? te(p[3]) : F(p[1], d || 0) + (unitTxt || '')) + '</b></div>'; }).join('');
  }
  function facts(list) {
    return '<div class="tc-g22">' + list.map(function (f) { return '<div class="tc-fact"><div class="a">' + te(f[0]) + '</div><div class="b">' + te(f[1]) + '</div><div class="c">' + te(f[2]) + '</div></div>'; }).join('') + '</div>';
  }
  function mtable(head, rows, curIdx) {
    return '<table class="tc-mtab"><thead><tr>' + head.map(function (h, i) { return '<th' + (i ? ' style="text-align:right"' : '') + '>' + te(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r, ri) { return '<tr' + (ri === curIdx ? ' class="cur"' : '') + '>' + r.map(function (c, i) { return '<td' + (i ? ' class="n"' : '') + '>' + te(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
  }
  function note(x) { return '<div class="tc-note">' + t(x) + '</div>'; }

  /* ============================================================== panels */
  function mdHead(no, title, sub) {
    return '<div class="tc-mh"><span class="no">' + e(no) + '</span><div class="tx"><h2>' + te(title) + '</h2><p>' + te(sub) + '</p></div>' +
      '<nav>' + langSwitch() + '<button type="button" data-nav="-1" aria-label="' + te(UI.prev) + '">←</button><button type="button" data-nav="1" aria-label="' + te(UI.next) + '">→</button><button type="button" data-x aria-label="' + te(UI.close) + '">✕</button></nav></div>';
  }
  function article(id, group, title, inner) { return { id: id, g: group, title: title, html: '<article class="tc-md" data-md="' + id + '" role="dialog" aria-modal="true" aria-label="' + te(title) + '">' + inner + '</article>' }; }
  function freePanel(id, no, title, sub, body, group) { return article(id, group || 'x', title, mdHead(no, title, sub) + '<div class="tc-mb">' + body + '</div>'); }
  function ptable(head, rows) {
    return '<div class="tc-tbl"><table class="tc-t">' + (head ? '<thead><tr>' + head.map(function (h) { return '<th>' + te(h) + '</th>'; }).join('') + '</tr></thead>' : '') + '<tbody>' +
      rows.map(function (r) { return '<tr' + (r.cur ? ' class="cur"' : '') + '>' + r.map(function (c, i) { return '<td' + (i === r.length - 1 && r.length > 1 ? ' class="v"' : '') + '>' + t(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  function calcBox(key) { return '<section class="tc-calc" data-c="' + key + '"><div class="ct"><h3>' + te(UI.calc) + '</h3><span>' + te(UI.calcHint) + '</span></div><div class="tc-cg"><div class="tc-cin"></div><ol class="tc-steps"></ol></div></section>'; }
  function related(items) {
    if (!items || !items.length) return '';
    return '<div class="tc-rel"><span>' + te(UI.see) + '</span>' + items.map(function (r) {
      if (r.card) return '<button type="button" class="tc-ext" data-card="' + r.card + '">' + te(UI.openCard) + ': ' + te(r.label) + ' →</button>';
      if (r.eq) return '<a class="tc-ext" href="#equip/' + r.eq + '" target="_blank" rel="noopener">' + te(r.label) + ' ↗</a>';
      return '<button type="button" data-tco="' + r[0] + '">' + te(r[1]) + ' →</button>';
    }).join('') + '</div>';
  }
  var ILL = null;
  function setIllustrator(fn) { ILL = fn; }
  function illSvg(body, vb) { return '<svg viewBox="' + vb + '" role="img" aria-hidden="true">' + body + '</svg>'; }
  function eqOf(id) { return E.find(DB.equipment, id); }
  function sysOf(id) { return E.find(DB.systems, id) || {}; }
  /* unit panel bound to the equipment knowledge base */
  function unitPanel(u, ctx) {
    var q = u.eq ? eqOf(u.eq) : null, name = u.name || (q ? [q.en, q.zh] : u.id);
    var sub = [o(name)]; if (q) sub.push(q.id + ' · ' + t([sysOf(q.sys).en, sysOf(q.sys).zh]));
    var lead = u.func || (q ? q.fn : '');
    var right = '<div style="display:grid;gap:14px"><p class="tc-lead">' + t(lead) + '</p>';
    if (u.how) right += '<div><h3>' + te(UI.how) + '</h3><p>' + t(u.how) + '</p></div>';
    if (u.key) right += '<div class="tc-key"><span class="f">' + t(u.key[0]) + '</span><span class="e">' + t(typeof u.key[1] === 'function' ? u.key[1](ctx) : u.key[1]) + '</span></div>';
    if (u.basis) { var b = u.basis(ctx); if (b) right += '<div class="tc-basisbox"><b>' + te(UI.forBasis) + ' (' + e(ctx.name) + '):</b> ' + t(b) + '</div>'; }
    right += '</div>';
    var ill = u.ill ? u.ill(ctx) : (ILL ? ILL(u, ctx) : '');
    var body = '<div class="tc-hero"><div class="tc-ill">' + ill + '</div>' + right + '</div>';
    if (u.calc) body += calcBox(u.calc);
    if (q) {
      var rows = q.tpg.filter(function (r) { return !r.g; }).slice(0, u.tpgN || 12).map(function (r) { return [t([r[0], r[1]]), e(r[2]), e(r[3])]; });
      var left = '<div><h3>' + te(UI.params) + '</h3>' + ptable([UI.desc, UI.unit, UI.req2], rows) +
        '<div class="tc-rel" style="margin-top:10px"><a class="tc-ext" href="#equip/' + q.id + '" target="_blank" rel="noopener" title="' + te(['Opens in a new tab', '在新标签页打开']) + '">' + te(UI.fullSpec) + ' · ' + q.id + ' ↗</a></div></div>';
      var rt = '<div style="display:grid;gap:16px;align-content:start"><div><h3>' + te(UI.ratings) + '</h3><p>' + t(q.ty) + '</p></div>' +
        '<div><h3>' + te(UI.req) + '</h3><ul class="tc-li">' + q.s.map(function (c) { return '<li>' + te(c) + '</li>'; }).join('') + '</ul></div>' +
        '<div><h3>' + te(UI.stds) + '</h3><div class="tc-stds">' + q.std.map(function (s) { return '<span>' + e(s) + '</span>'; }).join('') + '</div></div>';
      if (u.more && u.more.length) rt += '<div><h3>' + te(UI.relEq) + '</h3><div class="tc-rel">' + u.more.map(function (id) { var m = eqOf(id); return m ? '<a class="tc-ext" href="#equip/' + id + '" target="_blank" rel="noopener">' + id + ' · ' + te([m.en, m.zh]) + ' ↗</a>' : ''; }).join('') + '</div></div>';
      body += '<div class="tc-g2">' + left + rt + '</div></div>';
    }
    if (u.extra) body += u.extra(ctx);
    var om = (u.om || []).map(function (x) { return '<li>' + t(x) + '</li>'; }).join('');
    var tests = q && q.t ? q.t.map(function (x) { return '<li>' + te(x) + '</li>'; }).join('') : '';
    if (om || tests) body += '<div class="tc-g2">' + (om ? '<div><h3>' + te(UI.om) + '</h3><ul class="tc-li">' + om + '</ul></div>' : '<div></div>') + (tests ? '<div><h3>' + te(UI.tests) + '</h3><ul class="tc-li">' + tests + '</ul></div>' : '<div></div>') + '</div>';
    body += related(u.rel);
    return article(u.id, 'u', name, mdHead(u.no, name, sub.join(' · ')) + '<div class="tc-mb">' + body + '</div>');
  }
  function theoryPanel(th, no, ctx) {
    var body = '<div class="tc-hero"><div style="display:grid;gap:14px"><p class="tc-lead">' + t(th.body) + '</p>';
    if (th.formula) body += '<div class="tc-formula">' + t(th.formula) + '</div>';
    if (th.ex) body += '<p>' + t(typeof th.ex === 'function' ? th.ex(ctx) : th.ex) + '</p>';
    body += '</div>' + (th.visual ? '<div class="tc-ill">' + th.visual(ctx) + '</div>' : '<div></div>') + '</div>';
    if (th.table) body += th.table(ctx);
    if (th.calc !== false) body += calcBox(th.id);
    body += related(th.rel);
    return freePanel(th.id, no, th.title, UI.theory, body, 't');
  }
  function faqPanel(card) {
    return freePanel('faq', '?', UI.faq, UI.faqSub, '<div class="tc-qa">' + card.faq.map(function (q) { return '<details><summary>' + te(q[0]) + '</summary><p>' + t(q[1]) + '</p></details>'; }).join('') + '</div>', 'x');
  }
  function glossPanel(card, textAll) {
    var list = DB.glossary.concat(card.gloss || []), used = [];
    list.forEach(function (gl) {
      var keys = String(gl[0]).split(/\s*[\/,]\s*|\s+\(/).map(function (k) { return k.replace(/\)$/, '').trim(); }).filter(function (k) { return k.length > 1; });
      var hit = keys.some(function (k) {
        var cs = /[A-Z].*[A-Z0-9]/.test(k);
        try { return new RegExp('(^|[^A-Za-z0-9])' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![A-Za-z])', cs ? '' : 'i').test(textAll); } catch (x) { return false; }
      });
      if (hit) used.push(gl);
    });
    used.sort(function (a, b) { return a[0].toLowerCase() < b[0].toLowerCase() ? -1 : 1; });
    var body = '<div class="tc-gl">' + used.map(function (gl) { return '<div><b>' + e(gl[0]) + '</b><span>' + (lang() === 'zh' ? e(gl[1]) + ' — ' + e(gl[3]) : e(gl[2])) + '</span></div>'; }).join('') + '</div>';
    var codes = {}; (card.units || []).forEach(function (u) { var q = u.eq && eqOf(u.eq); if (q) q.std.forEach(function (s) { codes[s.replace(/[:\s]\d{4}.*$/, '').trim()] = 1; }); });
    var stds = DB.standards.filter(function (s) { var c = s.c.replace(/[:\s]\d{4}.*$/, '').trim(); return Object.keys(codes).some(function (k) { return k && (c.indexOf(k) === 0 || k.indexOf(c) === 0); }); });
    if (stds.length) body += '<div><h3>' + te(UI.stds) + '</h3>' + ptable(null, stds.map(function (s) { return [e(s.c), te([s.en, s.zh])]; })) + '</div>';
    body += '<div class="tc-src"><b>' + te(['Sources:', '来源：']) + '</b> ' + (card.sources || []).map(te).join(' · ') + '</div>';
    return freePanel('gloss', 'Aa', UI.gloss, ['Terms, standards and sources used in this simulation', '本模拟使用的术语、标准与来源'], body, 'x');
  }
  function basisPanel(card, ctx) {
    var R = ctx.R, p = ctx.p, c = R.cap;
    var rows = [[['Basis', '基准'], e(ctx.name)], [['Location', '地点'], te([R.L.en + ', ' + R.L.provEn, R.L.zh + '，' + R.L.provZh])], [['Facility type', '设施类型'], te([c.type.en, c.type.zh])],
      [['Design IT load', '设计IT负载'], F(c.itMW, 2) + ' MW · ' + F(c.racks) + ' ' + te(['racks', '个机柜']) + ' · ' + F(c.avgDens, 1) + ' kW/' + te(['rack', '柜'])], [['Resilience', '韧性等级'], te([c.tier.en, c.tier.zh])],
      [['Cooling', '制冷'], te([R.cool.obj.en, R.cool.obj.zh]) + ' · PUE ' + F(R.eff.pue, 2)], [['PLN demand', 'PLN需量'], F(R.el.mva, 1) + ' MVA · ' + te(R.el.volt)],
      [['Backup', '备用电源'], R.el.genTotal + ' × ' + F(R.el.genSize) + ' kWe (' + R.el.genLabel + ') · ' + p.fuelH + ' h · UPS ' + R.el.upsTotal + ' × ' + F(R.el.upsSize) + ' kW, ' + p.upsMin + ' min ' + (p.battery === 'LI' ? 'LFP' : 'VRLA')]];
    var body = '<p class="tc-lead">' + te(['The numbers in this simulation are computed by the assessment engine for the design basis selected above the slide. Choose another benchmark, or a project from your workspace, to simulate that design.', '本模拟中的数值由评估引擎针对幻灯片上方所选的设计基准计算得出。选择其他基准或工作区中的项目，即可模拟该设计。']) + '</p>' +
      ptable(null, rows.map(function (r) { return [te(r[0]), r[1]]; })) + '<div class="tc-rel"><a class="tc-ext" href="#assess" target="_blank" rel="noopener">' + te(['Open Project Assessment (new tab)', '打开项目评估（新标签页）']) + ' ↗</a></div>';
    return freePanel('basis', 'B', UI.basis, [ctx.name, ctx.name], body, 'x');
  }

  /* ============================================================== viewer */
  var CARDS = [], ST = { card: null, open: null, focus: false, userRot: null, basis: {} };
  try { var sv = JSON.parse(localStorage.getItem('dcpa_tc')); if (sv) { ST.basis = sv.basis || {}; ST.card = sv.card || null; } } catch (x) { }
  function save() { try { localStorage.setItem('dcpa_tc', JSON.stringify({ basis: ST.basis, card: ST.card })); } catch (x) { } }
  var VIEW = null, CTX = null, PANELS = [], CUR_CARD = null;
  var mm = function (q) { return !!(g.matchMedia && g.matchMedia(q).matches); };
  var TOUCH = mm('(pointer: coarse)') || (navigator.maxTouchPoints > 0 && mm('(hover: none)'));
  var IN_APP = /; wv\)|Lark|Feishu|MicroMessenger|WhatsApp|FBAN|FBAV|Instagram|Line\/|KAKAOTALK|Telegram/i.test(navigator.userAgent);
  var STILL = mm('(prefers-reduced-motion: reduce)');

  function register(card) { CARDS.push(card); }
  function cardById(id) { return CARDS.filter(function (c) { return c.id === id; })[0] || CARDS[0]; }
  function archList() { return DB.references.filter(function (r) { return r.kind === 'arch'; }); }
  function basisInput(card, key) {
    if (key === 'ACTIVE' && g.DCApp && g.DCApp.activeInput && g.DCApp.activeInput()) return { input: g.DCApp.activeInput(), name: t(['Active project', '当前项目']) + ': ' + g.DCApp.activeName() };
    var r = E.find(DB.references, key) || E.find(DB.references, card.basis);
    return { input: r.input, name: r.id + ' · ' + t([r.en, r.zh]) };
  }
  function buildCtx(card) {
    var key = ST.basis[card.id] || card.basis, bi = basisInput(card, key), x = P.resolve(JSON.parse(JSON.stringify(bi.input))), fell = false;
    if (card.basisOk && !card.basisOk(x)) { fell = true; var r = E.find(DB.references, card.basis); bi = { input: r.input, name: r.id + ' · ' + t([r.en, r.zh]) }; x = P.resolve(JSON.parse(JSON.stringify(r.input))); }
    return { x: x, R: x.R, p: x.p, name: bi.name, key: key, fell: fell, card: card, K: E.K, F: F, t: t };
  }
  function basisSelect(card) {
    var cur = ST.basis[card.id] || card.basis;
    var opts = archList().map(function (r) { return '<option value="' + r.id + '"' + (r.id === cur ? ' selected' : '') + '>' + e(r.id + ' · ' + t([r.en, r.zh])) + '</option>'; }).join('');
    if (g.DCApp && g.DCApp.activeName && g.DCApp.activeName()) opts = '<option value="ACTIVE"' + (cur === 'ACTIVE' ? ' selected' : '') + '>' + e(t(['Active project', '当前项目']) + ': ' + g.DCApp.activeName()) + '</option>' + opts;
    return '<select data-basis aria-label="' + te(UI.basis) + '">' + opts + '</select>';
  }
  var BTN_EXPAND = '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
  var BTN_ROT = '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/></svg>';
  var BTN_X = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function render() {
    if (!VIEW || !CARDS.length) return;
    var card = cardById(ST.card || CARDS[0].id); ST.card = card.id; CUR_CARD = card;
    CTX = buildCtx(card);
    var stage = card.stage(CTX, LIB);
    PANELS = card.panels(CTX, LIB);
    var textAll = stage.replace(/<[^>]+>/g, ' ') + ' ' + PANELS.map(function (p) { return p.html.replace(/<[^>]+>/g, ' '); }).join(' ');
    PANELS.push(basisPanel(card, CTX)); PANELS.push(glossPanel(card, textAll));
    var sel = '<div class="tc-sel" role="tablist">' + CARDS.map(function (c) {
      return '<button type="button" class="tc-cardbtn' + (c.id === card.id ? ' on' : '') + '" data-card="' + c.id + '" role="tab" aria-selected="' + (c.id === card.id) + '"><i>' + svgIcon(c.icon) + '</i><span><b>' + te(c.short || c.title) + '</b><span>' + te(c.blurb) + '</span></span></button>';
    }).join('') + '</div>';
    var bar = '<div class="tc-bar"><span>' + te(UI.basis) + ':</span>' + basisSelect(card) + (CTX.fell ? '<span style="color:#B0302A">' + te(card.fallNote || ['The selected design does not use this technology; the card shows its benchmark.', '所选设计未采用该技术；卡片显示其基准设计。']) + '</span>' : '') +
      '<span class="tc-sp"></span><button type="button" class="tc-btn" data-expand>' + BTN_EXPAND + te(['Expand', '放大']) + ' <small style="color:#8387A6">(F)</small></button></div>';
    if (!VIEW.querySelector('.tc-wrap')) VIEW.innerHTML = '<div class="tc-head"></div><div class="tc-wrap"><div class="tc-bg"></div><main class="tc-stage"></main><div class="tc-ctl" hidden></div><div class="tc-ov" hidden></div></div><div class="tc-hint"></div>';
    VIEW.querySelector('.tc-head').innerHTML = '<div class="tc-top"><div class="tc-intro"><h2 class="sec">' + te(['Project Technology Simulation', '项目技术模拟']) + '</h2><div class="sec-sub" style="margin-bottom:0">' +
      te(['Interactive one-slide simulations of data center systems, driven by the knowledge base and the assessment engine. Choose a system and a design basis, then click any part of the slide for the detailed panel; ← → move between panels, Esc closes, F expands.', '以一页交互幻灯片模拟数据中心各系统，由知识库与评估引擎驱动。选择系统与设计基准后，点击幻灯片任意部分查看详细面板；← → 切换面板，Esc关闭，F放大。']) + '</div></div></div>' + sel + bar;
    var wrapEl = VIEW.querySelector('.tc-wrap'), stEl = VIEW.querySelector('.tc-stage');
    wrapEl.classList.toggle('tc-focus', !!ST.focus);
    stEl.setAttribute('aria-label', t(card.title)); stEl.innerHTML = stage; stEl.__s = null;
    VIEW.querySelector('.tc-ctl').innerHTML = '<button type="button" data-unexpand title="' + te(UI.close) + '">' + BTN_X + '</button><button type="button" data-rot title="' + te(['Rotate view', '旋转视图']) + '">' + BTN_ROT + '</button>';
    VIEW.querySelector('.tc-hint').textContent = t(['Figures are indicative planning values computed for the selected design basis; equipment panels read the specification & TPG library (links open in a new tab).', '数值为针对所选设计基准计算的规划参考值；设备面板读取技术规范及TPG库（链接在新标签页打开）。']);
    if (!DEFS_ADDED) { document.body.insertAdjacentHTML('beforeend', DEFS); DEFS_ADDED = true; }
    if (ST.focus) document.documentElement.style.overflow = 'hidden';
    fit(); motion();
    if (ST.open) openPanel(ST.open, true); else syncHash();
  }
  var DEFS_ADDED = false;

  function fit() {
    if (!VIEW) return;
    var wrap = VIEW.querySelector('.tc-wrap'), st = VIEW.querySelector('.tc-stage'), ctl = VIEW.querySelector('.tc-ctl'); if (!wrap) return;
    var root = document.documentElement, vw = root.clientWidth || g.innerWidth, vh = root.clientHeight || g.innerHeight, W, H, rot = false, place = '';
    if (ST.focus) {
      rot = ST.userRot === 'on' ? vh > vw : ST.userRot === 'off' ? false : (TOUCH && vh > vw && vw < 700);
      W = rot ? vh : vw; H = rot ? vw : vh;
      wrap.style.width = W + 'px'; wrap.style.height = H + 'px'; wrap.style.transform = rot ? 'translate(' + vw + 'px,0) rotate(90deg)' : 'none';
    } else {
      wrap.style.transform = 'none'; wrap.style.width = '';
      W = wrap.clientWidth || VIEW.clientWidth || 800;
      var hdr = document.querySelector('header'), hh = hdr && g.getComputedStyle(hdr).position === 'sticky' ? hdr.getBoundingClientRect().height : 0;
      H = Math.min(W * 1080 / 1920, Math.max(240, vh - hh - 28)); wrap.style.height = Math.round(H) + 'px';
    }
    var s = Math.min(W / 1920, H / 1080), gx = (W - 1920 * s) / 2, gy = (H - 1080 * s) / 2;
    if (ST.focus) {
      if (gx >= 46) place = 'side'; else if (gy >= 50) place = 'bottom'; else { s = Math.min((W - 92) / 1920, H / 1080); gx = (W - 1920 * s) / 2; gy = (H - 1080 * s) / 2; place = 'side'; }
      ctl.hidden = false; ctl.setAttribute('data-place', place);
      ctl.style.right = (place === 'side' ? Math.max(4, (gx - 38) / 2) : 12) + 'px'; ctl.style.bottom = place === 'bottom' ? Math.max(6, (gy - 38) / 2) + 'px' : '';
      ctl.querySelector('[data-rot]').hidden = !(TOUCH && (vh > vw || rot));
    } else ctl.hidden = true;
    st.style.setProperty('--s', s); st.style.setProperty('--x', gx + 'px'); st.style.setProperty('--y', gy + 'px');
    /* Chromium caches the raster scale of SVG text when it is first laid out; when the stage scale changes the text
       would paint at the old scale. Re-lay-out the slide's SVGs whenever the scale changes. */
    if (st.__s !== s) {
      st.__s = s;
      var list = svgs(st);
      list.forEach(function (el) { el.style.display = 'none'; });
      void st.offsetWidth;
      list.forEach(function (el) { el.style.display = ''; });
    }
  }
  function refit() { fit(); setTimeout(fit, 150); setTimeout(fit, 500); }

  /* motion: pause the slide when hidden or while a panel covers it; touch devices step motion at ≈ 12 frames/s */
  var visible = false, lite = TOUCH && !STILL, t0 = Date.now(), holdUntil = 0, ticker = null;
  function svgs(scope) { return scope ? Array.prototype.slice.call(scope.querySelectorAll('svg')) : []; }
  function pauseSvgs(list, on) { list.forEach(function (s) { try { on ? s.pauseAnimations() : s.unpauseAnimations(); } catch (x) { } }); }
  function motion() {
    if (!VIEW) return;
    var st = VIEW.querySelector('.tc-stage'), ov = VIEW.querySelector('.tc-ov'), panelOpen = !!ST.open;
    VIEW.classList.add('tcv'); VIEW.classList.toggle('tc-lite', lite);
    var stop = STILL || lite || !visible || panelOpen;
    pauseSvgs(svgs(st), stop); VIEW.classList.toggle('tc-still', stop && !lite);
    if (ov) pauseSvgs(svgs(ov), STILL || lite || !visible);
    if (lite && visible && !ticker) ticker = setInterval(step12, 85);
    if ((!lite || !visible) && ticker) { clearInterval(ticker); ticker = null; }
  }
  function step12() {
    if (document.hidden || Date.now() < holdUntil || !VIEW) return;
    var box = ST.open ? VIEW.querySelector('.tc-ov') : VIEW.querySelector('.tc-stage'), tt = (Date.now() - t0) / 1000;
    svgs(box).forEach(function (s) { try { s.setCurrentTime(tt); } catch (x) { } });
    if (document.getAnimations) document.getAnimations().forEach(function (an) { var el = an.effect && an.effect.target; if (el && el.classList && el.classList.contains('tc-flow') && box && box.contains(el)) { try { an.currentTime = tt * 1000; } catch (x) { } } });
  }
  if (lite) ['touchstart', 'touchmove', 'pointerdown', 'wheel'].forEach(function (n) { document.addEventListener(n, function () { holdUntil = Date.now() + 1200; }, { passive: true, capture: true }); });

  /* panels & calculators */
  function panelIdx(id) { for (var i = 0; i < PANELS.length; i++) if (PANELS[i].id === id) return i; return -1; }
  var lastFocus = null;
  function openPanel(id, quiet) {
    var i = panelIdx(id); if (i < 0) { ST.open = null; syncHash(); return; }
    var ov = VIEW.querySelector('.tc-ov'); if (!ST.open || quiet) lastFocus = document.activeElement;
    ov.innerHTML = PANELS[i].html; ov.hidden = false; ov.scrollTop = 0; ST.open = id;
    if (!ST.focus) document.documentElement.style.overflow = 'hidden';
    calc(id); motion(); syncHash();
    var b = ov.querySelector('[data-x]'); if (b) try { b.focus({ preventScroll: true }); } catch (x) { }
  }
  function closePanel() {
    var ov = VIEW && VIEW.querySelector('.tc-ov'); if (!ov) return;
    ov.hidden = true; ov.innerHTML = ''; ST.open = null;
    if (!ST.focus) document.documentElement.style.overflow = '';
    motion(); syncHash();
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) try { lastFocus.focus({ preventScroll: true }); } catch (x) { }
  }
  function stepPanel(d) {
    var i = panelIdx(ST.open); if (i < 0) return;
    var grp = PANELS[i].g, list = PANELS.filter(function (p) { return p.g === grp; }), j = list.map(function (p) { return p.id; }).indexOf(ST.open);
    openPanel(list[(j + d + list.length) % list.length].id);
  }
  /* calculators with linked inputs: a source change recalculates every AUTO input from its rule
     (codes & standards / engine design rules); editing an AUTO input makes it MANUAL, ↺ restores the rule.
     An AUTO input whose design-basis value differs from its rule starts as BASIS. */
  function calc(id) {
    var ov = VIEW.querySelector('.tc-ov'); if (!ov) return;
    Array.prototype.forEach.call(ov.querySelectorAll('.tc-calc'), function (box) {
      var key = box.getAttribute('data-c'), C = CUR_CARD.calc && CUR_CARD.calc[key]; if (!C) { box.remove(); return; }
      var A = C.a || {}, man = {}, cin = box.querySelector('.tc-cin'), ol = box.querySelector('.tc-steps');
      function snap(p, x) { x = Math.round(x / p[5]) * p[5]; return +x.toFixed(6); }
      function dflt(p) { return snap(p, typeof p[6] === 'function' ? p[6](CTX) : p[6]); }
      var v0 = {}; C.i.forEach(function (p) { v0[p[0]] = dflt(p); });
      C.i.forEach(function (p) { var r = A[p[0]]; if (!r) return; var x; try { x = snap(p, r.f(v0, CTX)); } catch (e) { return; } if (Math.abs(x - v0[p[0]]) > 1e-9) man[p[0]] = 'basis'; });
      cin.innerHTML = C.i.map(function (p) {
        var val = v0[p[0]], lab = te(p[1]), un = te(p[2]), r = A[p[0]], ctl;
        if (p[7]) ctl = '<span class="r o"><select data-k="' + p[0] + '" aria-label="' + lab + '">' + p[7].map(function (o) { return '<option value="' + o[0] + '"' + (+o[0] === val ? ' selected' : '') + '>' + te(o[1]) + '</option>'; }).join('') + '</select></span>';
        else ctl = '<span class="r"><input type="range" min="' + p[3] + '" max="' + Math.max(p[4], val) + '" step="' + p[5] + '" value="' + val + '" data-k="' + p[0] + '" aria-label="' + lab + '">' +
          '<input type="number" min="' + p[3] + '" step="' + p[5] + '" value="' + val + '" data-k="' + p[0] + '" aria-label="' + lab + '"></span>';
        return '<label class="' + (r ? 'lk' : '') + '"><span class="lh"><span>' + lab + (un ? ' <small>(' + un + ')</small>' : '') + '</span>' + (r ? '<span class="tc-bd" data-bd="' + p[0] + '"></span>' : '') + '</span>' + ctl +
          (r ? '<span class="tc-why" title="' + te(r.b) + '">' + te(r.b) + '</span>' : '') + '</label>';
      }).join('');
      function setDom(p, x) {
        Array.prototype.forEach.call(cin.querySelectorAll('[data-k="' + p[0] + '"]'), function (el) { if (el.type === 'range' && +el.max < x) el.max = x; el.value = x; });
      }
      function read() {
        var v = {};
        C.i.forEach(function (p) { var el = cin.querySelector('select[data-k="' + p[0] + '"], input[type=number][data-k="' + p[0] + '"]'), x = parseFloat(String(el.value).replace(',', '.')); v[p[0]] = isFinite(x) ? x : dflt(p); });
        return v;
      }
      function propagate(v) {
        for (var pass = 0; pass < 4; pass++) {
          var changed = false;
          C.i.forEach(function (p) {
            var r = A[p[0]]; if (!r || man[p[0]]) return;
            var x; try { x = snap(p, r.f(v, CTX)); } catch (e) { return; }
            if (isFinite(x) && x !== v[p[0]]) { v[p[0]] = x; setDom(p, x); changed = true; }
          });
          if (!changed) break;
        }
      }
      function badges() {
        Object.keys(A).forEach(function (k) {
          var bd = cin.querySelector('[data-bd="' + k + '"]'); if (!bd) return;
          var m = man[k], lab = m === 'basis' ? UI.basisB : (m ? UI.manual : UI.auto);
          bd.innerHTML = '<b class="' + (m === 'basis' ? 'bs' : (m ? 'mn' : 'au')) + '">' + te(lab) + '</b>' + (m ? '<button type="button" class="tc-rst" data-rst="' + k + '" title="' + te(UI.applyRule) + '">↺</button>' : '');
          bd.parentNode.parentNode.classList.toggle('isman', !!m);
        });
      }
      function run() {
        var v = read(); propagate(v); badges();
        var rows; try { rows = C.f(v, CTX); } catch (err) { rows = [[['Error', '错误'], String(err), '–']]; }
        ol.innerHTML = rows.map(function (r) { return '<li><span class="t">' + te(r[0]) + '</span><span class="f">' + te(r[1]) + '</span><span class="r">' + te(r[2]) + '</span></li>'; }).join('');
      }
      function onEdit(ev) {
        var k = ev.target.getAttribute('data-k'); if (!k) return;
        Array.prototype.forEach.call(cin.querySelectorAll('[data-k="' + k + '"]'), function (x) { if (x !== ev.target) x.value = ev.target.value; });
        if (A[k]) man[k] = 'man';
        run();
      }
      cin.addEventListener('input', onEdit);
      cin.addEventListener('change', function (ev) { if (ev.target.tagName === 'SELECT') onEdit(ev); });
      cin.addEventListener('click', function (ev) { var b = ev.target.closest('[data-rst]'); if (!b) return; ev.preventDefault(); delete man[b.getAttribute('data-rst')]; run(); });
      run();
    });
  }

  /* focus (expanded) mode */
  function setFocus(on) {
    if (ST.focus === on) return;
    ST.focus = on;
    var wrap = VIEW.querySelector('.tc-wrap'); wrap.classList.toggle('tc-focus', on);
    document.documentElement.style.overflow = on || ST.open ? 'hidden' : '';
    if (!on) { wrap.style.width = ''; wrap.style.height = ''; wrap.style.transform = ''; }
    var canFs = !TOUCH && !IN_APP && !!(wrap.requestFullscreen || wrap.webkitRequestFullscreen) && document.fullscreenEnabled !== false;
    ST.fsWanted = on && canFs;
    if (on && canFs) { try { var rq = (wrap.requestFullscreen || wrap.webkitRequestFullscreen).call(wrap); if (rq && rq.catch) rq.catch(function () { }); } catch (x) { } }
    if (!on && (document.fullscreenElement || document.webkitFullscreenElement)) { var xf = document.exitFullscreen || document.webkitExitFullscreen; try { var pr = xf.call(document); if (pr && pr.catch) pr.catch(function () { }); } catch (x) { } }
    refit();
    if (on && TOUCH) toast(vhGtVw() ? ['Turn your phone sideways to read the card. Tap any part for details.', '横置手机阅读卡片，点击任意部分查看详情。'] : null);
  }
  function vhGtVw() { var r = document.documentElement; return (r.clientHeight || g.innerHeight) > (r.clientWidth || g.innerWidth); }
  function toast(msg) {
    if (!msg) return; var wrap = VIEW.querySelector('.tc-wrap'), d = document.createElement('div'); d.className = 'tc-toast'; d.textContent = t(msg); wrap.appendChild(d);
    setTimeout(function () { d.style.opacity = 0; setTimeout(function () { d.remove(); }, 700); }, 5000);
  }
  document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement && ST.focus && VIEW && !(ST.ignoreFsUntil > Date.now())) setFocus(false); else refit();
  });
  g.addEventListener('resize', function () { if (visible) refit(); });
  g.addEventListener('orientationchange', function () { if (visible) refit(); });

  /* routing */
  function syncHash() {
    if (!visible) return;
    var h = '#sim/' + ST.card + (ST.open ? '/' + ST.open : '');
    if (location.hash !== h) try { history.replaceState(null, '', h); } catch (x) { }
  }
  function route(parts) {
    parts = parts || [];
    if (parts[0] && cardById(parts[0]).id === parts[0]) ST.card = parts[0];
    ST.open = parts[1] || null;
  }

  /* events */
  function bind(el) {
    if (el.__tc) return; el.__tc = true;
    el.addEventListener('click', function (ev) {
      var tg = ev.target;
      if (tg.closest('[data-lang-btn]')) { var nl = lang() === 'en' ? 'zh' : 'en'; if (g.DCApp && g.DCApp.setLang) g.DCApp.setLang(nl); else { g.I18N.set(nl); render(); } return; }
      var cb = tg.closest('[data-card]'); if (cb) { var cid = cb.getAttribute('data-card'); if (ST.open) closePanel(); ST.card = cid; ST.open = null; save(); render(); return; }
      if (tg.closest('[data-expand]')) { setFocus(true); return; }
      if (tg.closest('[data-unexpand]')) { setFocus(false); return; }
      if (tg.closest('[data-rot]')) { ST.userRot = (ST.userRot === 'on' || (ST.userRot === null && TOUCH && vhGtVw())) ? 'off' : 'on'; fit(); return; }
      var eqb = tg.closest('[data-eqlink]'); if (eqb) { var id = eqb.getAttribute('data-eqlink'); closePanel(); if (ST.focus) setFocus(false); if (g.DCApp && g.DCApp.openEquipment) g.DCApp.openEquipment(id); return; }
      if (tg.closest('[data-goassess]')) { closePanel(); if (ST.focus) setFocus(false); if (g.DCApp) g.DCApp.show('assess'); return; }
      var op = tg.closest('[data-tco]'); if (op) { ev.preventDefault(); openPanel(op.getAttribute('data-tco')); return; }
      if (tg.closest('[data-x]')) { closePanel(); return; }
      var nv = tg.closest('[data-nav]'); if (nv) { stepPanel(+nv.getAttribute('data-nav')); return; }
      if (tg.classList && tg.classList.contains('tc-ov')) closePanel();
    });
    el.addEventListener('change', function (ev) {
      if (ev.target.matches('[data-basis]')) { ST.basis[ST.card] = ev.target.value; save(); render(); }
    });
    if (g.ResizeObserver) try { new ResizeObserver(function () { if (visible && !ST.focus) fit(); }).observe(el); } catch (x) { }
  }
  document.addEventListener('keydown', function (ev) {
    if (!visible || !VIEW) return;
    var tag = ev.target && ev.target.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') { if (ev.key === 'Escape' && ST.open) closePanel(); return; }
    if (ST.open) {
      if (ev.key === 'Escape') { ev.preventDefault(); closePanel(); }
      else if (ev.key === 'ArrowRight') { ev.preventDefault(); stepPanel(1); }
      else if (ev.key === 'ArrowLeft') { ev.preventDefault(); stepPanel(-1); }
      return;
    }
    if (ev.key === 'Escape' && ST.focus) { setFocus(false); return; }
    var hotEl = ev.target.closest && ev.target.closest('[data-tco]');
    if (hotEl && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); openPanel(hotEl.getAttribute('data-tco')); return; }
    if ((ev.key === 'f' || ev.key === 'F') && !ev.ctrlKey && !ev.metaKey && !ev.altKey) { setFocus(!ST.focus); }
  });

  function mount(el) { VIEW = el; el.classList.add('tcv'); bind(el); render(); }
  function onShow(on) {
    visible = !!on;
    if (!VIEW) return;
    if (!on) { if (ST.open) closePanel(); if (ST.focus) setFocus(false); }
    motion(); if (on) { refit(); syncHash(); }
  }

  var LIB = {
    t: t, o: o, e: e, te: te, F: F, tw: tw, ord: ord, G: G, R: R_, text: text, shadow: shadow, vessel: vessel, cylV: cylV, storageTank: storageTank, cylH: cylH, pump: pump, tankBox: tankBox,
    building: building, city: city, bubbles: bubbles, rotor: rotor, fan: fan, waves: waves, pipe: pipe, thin: thin, air: air, arrowHead: arrowHead, banner: banner, label: label, labelSpan: labelSpan,
    hot: hot, unit: unit, cab: cab, switchgear: switchgear, lvBoard: lvBoard, dryTx: dryTx, powerTx: powerTx, pylon: pylon, genset: genset, fuelTank: fuelTank, upsCab: upsCab, battRack: battRack,
    bessBox: bessBox, busway: busway, rack: rack, rackRow: rackRow, containment: containment, crah: crah, fanWall: fanWall, chiller: chiller, coolingTower: coolingTower, dryCooler: dryCooler,
    cduCab: cduCab, phe: phe, gasCyl: gasCyl, camera: camera, fence: fence, bollards: bollards, barrier: barrier, mantrap: mantrap, reader: reader, nocWall: nocWall, firePanel: firePanel,
    smokeDet: smokeDet, sprinklers: sprinklers, vesda: vesda, fibreBand: fibreBand, ground: ground, svgIcon: svgIcon, icon: icon, IC: IC,
    header: header, footer: footer, principle: principle, chips: chips, kpis: kpis, tile: tile, miniBars: miniBars, donut: donut, legend: legend, facts: facts, mtable: mtable, note: note,
    unitPanel: unitPanel, theoryPanel: theoryPanel, freePanel: freePanel, faqPanel: faqPanel, ptable: ptable, illSvg: illSvg, related: related, eq: eqOf, UI: UI, PIPE: PIPE, mulberry: mulberry
  };
  g.TC = { setIllustrator: setIllustrator, register: register, mount: mount, render: render, route: route, onShow: onShow, cards: CARDS, lib: LIB, state: ST,
           panelIds: function () { return PANELS.map(function (p) { return p.id; }); }, open: function (id) { openPanel(id); }, close: function () { closePanel(); } };
})(window);
