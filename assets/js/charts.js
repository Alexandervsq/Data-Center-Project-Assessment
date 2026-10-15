/* Minimal dependency-free SVG charts (donut, stacked bar, column/line, gantt, range bars). */
(function (g) {
  'use strict';
  var F = function (v, d) { return g.DCEngine.fmt(v, d); };
  function e(s) { return g.esc(s); }

  /* donut: items [{label, value, color}] */
  function donut(items, opt) {
    opt = opt || {};
    var size = opt.size || 220, r = size / 2 - 8, ir = r * (opt.hole || 0.58), cx = size / 2, cy = size / 2;
    var total = items.reduce(function (s, i) { return s + i.value; }, 0) || 1, a0 = -Math.PI / 2, out = '';
    items.forEach(function (it) {
      var a1 = a0 + it.value / total * Math.PI * 2, large = (a1 - a0) > Math.PI ? 1 : 0;
      var p = function (a, rr) { return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]; };
      var o0 = p(a0, r), o1 = p(a1, r), i1 = p(a1, ir), i0 = p(a0, ir);
      if (it.value > 0) out += '<path d="M' + o0 + 'A' + r + ',' + r + ' 0 ' + large + ' 1 ' + o1 + 'L' + i1 + 'A' + ir + ',' + ir + ' 0 ' + large + ' 0 ' + i0 + 'Z" fill="' + it.color + '"><title>' + e(it.label) + ': ' + F(it.value / total * 100, 1) + '%</title></path>';
      a0 = a1;
    });
    var center = opt.center ? '<text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" font-size="16" font-weight="700" fill="#17153f">' + e(opt.center) + '</text>' +
      '<text x="' + cx + '" y="' + (cy + 18) + '" text-anchor="middle" font-size="11" fill="#5d6280">' + e(opt.centerSub || '') + '</text>' : '';
    var legend = '<div class="legend">' + items.map(function (it) { return '<span><i style="background:' + it.color + '"></i>' + (it.html || e(it.label)) + ' · ' + F(it.value / total * 100, 0) + '%</span>'; }).join('') + '</div>';
    return '<svg class="chart" viewBox="0 0 ' + size + ' ' + size + '" style="max-width:' + size + 'px;margin:0 auto">' + out + center + '</svg>' + legend;
  }

  /* horizontal stacked bar: segs [{label, value, color}] */
  function stackBar(segs, opt) {
    opt = opt || {};
    var W = 600, H = opt.h || 34, total = segs.reduce(function (s, i) { return s + i.value; }, 0) || 1, x = 0, out = '';
    segs.forEach(function (s) {
      var w = s.value / total * W;
      out += '<rect x="' + x + '" y="0" width="' + Math.max(0, w) + '" height="' + H + '" fill="' + s.color + '"><title>' + e(s.label) + ': ' + F(s.value, opt.dec || 0) + '</title></rect>';
      if (w > 46) out += '<text x="' + (x + w / 2) + '" y="' + (H / 2 + 4) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">' + F(s.value / total * 100, 0) + '%</text>';
      x += w;
    });
    var legend = '<div class="legend">' + segs.map(function (s) { return '<span><i style="background:' + s.color + '"></i>' + (s.html || e(s.label)) + ' · ' + F(s.value, opt.dec || 0) + (opt.unit || '') + '</span>'; }).join('') + '</div>';
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" style="height:' + H + 'px;border-radius:8px">' + out + '</svg>' + legend;
  }

  /* columns for annual cash flow + cumulative line */
  function cashflow(rows, opt) {
    opt = opt || {};
    var W = 760, H = 270, pl = 54, pr = 14, pt = 24, pb = 34;
    var vals = rows.map(function (r) { return r.cf; }), cum = rows.map(function (r) { return r.cum; });
    var mx = Math.max.apply(null, vals.concat(cum).concat([0])), mn = Math.min.apply(null, vals.concat(cum).concat([0]));
    if (mx === mn) mx = mn + 1;
    var y = function (v) { return pt + (mx - v) / (mx - mn) * (H - pt - pb); };
    var bw = (W - pl - pr) / rows.length;
    var out = '';
    var ticks = 5;
    for (var k = 0; k <= ticks; k++) {
      var v = mn + (mx - mn) * k / ticks, yy = y(v);
      out += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + yy + '" y2="' + yy + '" stroke="#e3e5f2"/>';
      out += '<text x="' + (pl - 6) + '" y="' + (yy + 4) + '" text-anchor="end" font-size="10" fill="#5d6280">' + F(v / 1e6, 0) + '</text>';
    }
    out += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(0) + '" y2="' + y(0) + '" stroke="#9aa0c4"/>';
    rows.forEach(function (r, i) {
      var x = pl + i * bw + bw * 0.18, h = Math.abs(y(r.cf) - y(0));
      out += '<rect x="' + x + '" y="' + Math.min(y(r.cf), y(0)) + '" width="' + bw * 0.64 + '" height="' + h + '" rx="2" fill="' + (r.cf >= 0 ? '#0ea5c6' : '#f0544f') + '"><title>' + r.year + ': ' + F(r.cf / 1e6, 1) + ' M</title></rect>';
      if (rows.length <= 26 && (i % (rows.length > 14 ? 2 : 1) === 0)) out += '<text x="' + (pl + i * bw + bw / 2) + '" y="' + (H - pb + 14) + '" text-anchor="middle" font-size="9.5" fill="#5d6280">' + r.year + '</text>';
    });
    var path = rows.map(function (r, i) { return (i ? 'L' : 'M') + (pl + i * bw + bw / 2) + ',' + y(r.cum); }).join('');
    out += '<path d="' + path + '" fill="none" stroke="#3f3cbb" stroke-width="2.5"/>';
    rows.forEach(function (r, i) { out += '<circle cx="' + (pl + i * bw + bw / 2) + '" cy="' + y(r.cum) + '" r="2.6" fill="#3f3cbb"><title>Cum. ' + F(r.cum / 1e6, 1) + ' M</title></circle>'; });
    out += '<text x="' + 6 + '" y="11" font-size="10" font-weight="700" fill="#5d6280">' + e(opt.unit || 'M') + '</text>';
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '">' + out + '</svg>';
  }

  /* gantt: tasks [{label(html), s, d, c}] months */
  var GC = { plan: '#7c3aed', design: '#3f3cbb', permit: '#f2a93b', proc: '#0ea5c6', build: '#17153f', cx: '#16a34a', rfs: '#f0544f' };
  function gantt(tasks, total) {
    var W = 760, lw = 0, rowH = 30, H = tasks.length * rowH + 30, sc = (W - 20) / Math.max(total, 1);
    var out = '';
    for (var m = 0; m <= total; m += (total > 36 ? 6 : 3)) {
      var x = 10 + m * sc;
      out += '<line x1="' + x + '" x2="' + x + '" y1="0" y2="' + (H - 22) + '" stroke="#e3e5f2"/><text x="' + x + '" y="' + (H - 6) + '" text-anchor="middle" font-size="10" fill="#5d6280">M' + m + '</text>';
    }
    tasks.forEach(function (t, i) {
      var y = i * rowH + 6, x = 10 + t.s * sc, w = Math.max(t.d * sc, 6);
      out += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + (rowH - 10) + '" rx="5" fill="' + (GC[t.c] || '#3f3cbb') + '"><title>' + e(t.text) + ' — M' + t.s + ' → M' + (t.s + t.d) + '</title></rect>';
      var tw = String(t.text).split('').reduce(function (a, ch) { return a + (ch.charCodeAt(0) > 0x2e80 ? 11.5 : 6.4); }, 0);
      var pos = w >= tw + 16 ? 'in' : (x + w + 6 + tw <= W - 4 ? 'right' : 'left');
      out += '<text x="' + (pos === 'in' ? x + 8 : (pos === 'right' ? x + w + 6 : x - 6)) + '" y="' + (y + rowH / 2) + '"' + (pos === 'left' ? ' text-anchor="end"' : '') + ' font-size="11" fill="' + (pos === 'in' ? '#fff' : '#161936') + '" font-weight="600">' + e(t.text) + '</text>';
    });
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '">' + out + '</svg>';
  }

  /* horizontal range bars: rows [{label, a, b, color}] on [min,max] */
  function ranges(rows, min, max, unit) {
    var W = 760, lw = 200, rowH = 34, H = rows.length * rowH + 26, sc = (W - lw - 20) / (max - min), out = '';
    for (var v = min; v <= max; v += (max - min) / 6) {
      var x = lw + (v - min) * sc;
      out += '<line x1="' + x + '" x2="' + x + '" y1="0" y2="' + (H - 20) + '" stroke="#e3e5f2"/><text x="' + x + '" y="' + (H - 6) + '" text-anchor="middle" font-size="10" fill="#5d6280">' + F(v, 0) + (unit || '') + '</text>';
    }
    rows.forEach(function (r, i) {
      var y = i * rowH + 6, x = lw + (r.a - min) * sc, w = (r.b - r.a) * sc;
      out += '<text x="' + (lw - 10) + '" y="' + (y + 16) + '" text-anchor="end" font-size="11.5" fill="#161936" font-weight="600">' + e(r.label) + '</text>';
      out += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="22" rx="11" fill="' + r.color + '"/>';
      out += '<text x="' + (w > 70 ? x + w / 2 : x + w + 6) + '" y="' + (y + 15) + '" text-anchor="' + (w > 70 ? 'middle' : 'start') + '" font-size="10.5" font-weight="700" fill="' + (w > 70 ? '#fff' : '#161936') + '">' + F(r.a, 0) + '–' + F(r.b, 0) + (unit || '') + '</text>';
    });
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '">' + out + '</svg>';
  }

  g.Charts = { donut: donut, stackBar: stackBar, cashflow: cashflow, gantt: gantt, ranges: ranges, GC: GC };
})(window);
