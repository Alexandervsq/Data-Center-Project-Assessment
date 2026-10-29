/* Project Technology Simulation — illustrations for every unit and theory panel (inside views / schematics).
 * Registered with TC.setIllustrator(): a unit panel uses u.ill if present, otherwise the illustration for its unit key. */
(function (g) {
  'use strict';
  var TC = g.TC, L = TC.lib, X = g.TCX, DB = g.DCDB, E = g.DCEngine, K = E.K, F = L.F, t = L.t;
  var C = { ind: '#3F3CBB', indD: '#2A2785', cy: '#0EA5C6', cyD: '#0B7F99', am: '#E39B1B', amD: '#B8740B', co: '#E5534B', coD: '#B0302A', deep: '#17153F', sl: '#5D6280', gr: '#16A34A', vi: '#7C3AED', soil: '#B9874A' };
  function f1(v) { return Math.round(v * 10) / 10; }
  function svg(body, vb) { return L.illSvg(body, vb || '0 0 530 260'); }
  function ttl(s) { return L.text(14, 22, s, 'tc-lt'); }
  function tx(x, y, s, a, st) { return L.text(x, y, s, 'tc-ls', ' text-anchor="' + (a || 'start') + '"' + (st ? ' style="' + st + '"' : '')); }
  function txb(x, y, s, a, col, size) { return tx(x, y, s, a, 'font-weight:800;fill:' + (col || C.deep) + (size ? ';font-size:' + size + 'px' : '')); }
  function txw(x, y, s, a, size) { return L.text(x, y, s, 'tc-lw', ' text-anchor="' + (a || 'middle') + '"' + (size ? ' style="font-size:' + size + 'px"' : '')); }
  function bx(x, y, w, h, fill, lab, sub) {
    var s = L.R(x, y, w, h, fill, ' rx="9"');
    if (lab) s += txw(x + w / 2, y + h / 2 + (sub ? -2 : 5), lab, 'middle', 12.5);
    if (sub) s += txw(x + w / 2, y + h / 2 + 13, sub, 'middle', 10.5);
    return s;
  }
  function ln(d, col, w, dash) { return '<path d="' + d + '" fill="none" stroke="' + (col || C.sl) + '" stroke-width="' + (w || 2.2) + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + ' stroke-linecap="round" stroke-linejoin="round"/>'; }
  function pts(d) { var re = /([MLHV])\s*([-\d.]+)(?:[ ,]([-\d.]+))?/g, m, x = 0, y = 0, out = []; while ((m = re.exec(d))) { if (m[1] === 'M' || m[1] === 'L') { x = +m[2]; y = +m[3]; } else if (m[1] === 'H') x = +m[2]; else y = +m[2]; out.push([x, y]); } return out; }
  function head(d, col, s) {
    var p = pts(d), b = p[p.length - 1], a = p[p.length - 2] || [b[0] - 1, b[1]], ang = Math.atan2(b[1] - a[1], b[0] - a[0]); s = s || 8;
    var x1 = b[0] - s * Math.cos(ang) + s * .6 * Math.sin(ang), y1 = b[1] - s * Math.sin(ang) - s * .6 * Math.cos(ang), x2 = b[0] - s * Math.cos(ang) - s * .6 * Math.sin(ang), y2 = b[1] - s * Math.sin(ang) + s * .6 * Math.cos(ang);
    return '<polygon points="' + f1(b[0]) + ',' + f1(b[1]) + ' ' + f1(x1) + ',' + f1(y1) + ' ' + f1(x2) + ',' + f1(y2) + '" fill="' + (col || C.sl) + '"/>';
  }
  function ar(d, col, w) { return ln(d, col, w || 2.4) + head(d, col); }
  function co(x, y, x2, y2, lab, a) { return '<circle cx="' + x + '" cy="' + y + '" r="3" fill="' + C.deep + '"/>' + ln('M' + x + ' ' + y + 'L' + x2 + ' ' + y2, C.deep, 1.2) + tx(x2 + (a === 'end' ? -4 : 4), y2 + 4, lab, a || 'start', 'font-weight:700'); }
  function foot(s) { return L.text(265, 252, s, 'tc-ls', ' text-anchor="middle" style="font-weight:700;fill:#2A2785"'); }
  function brk(x, y) { return '<rect x="' + (x - 8) + '" y="' + (y - 8) + '" width="16" height="16" fill="#fff" stroke="' + C.deep + '" stroke-width="2"/>'; }
  function valve(x, y, vert) { return vert ? '<path d="M' + (x - 6) + ' ' + (y - 8) + 'L' + x + ' ' + y + 'L' + (x + 6) + ' ' + (y - 8) + 'ZM' + (x - 6) + ' ' + (y + 8) + 'L' + x + ' ' + y + 'L' + (x + 6) + ' ' + (y + 8) + 'Z" fill="' + C.deep + '"/>' : '<path d="M' + (x - 8) + ' ' + (y - 6) + 'L' + x + ' ' + y + 'L' + (x - 8) + ' ' + (y + 6) + 'ZM' + (x + 8) + ' ' + (y - 6) + 'L' + x + ' ' + y + 'L' + (x + 8) + ' ' + (y + 6) + 'Z" fill="' + C.deep + '"/>'; }
  function cube(x0, y0, w, h, lab) {
    var o = ln('M' + x0 + ' ' + (y0 + h) + 'H' + (x0 + w), C.sl, 1.5), bw = w / 4 - 14;
    [[100, 100], [90, 73], [80, 51], [70, 34]].forEach(function (b, i) {
      var bh = b[1] / 100 * (h - 20), x = x0 + 8 + i * (bw + 14);
      o += L.R(x, y0 + h - bh, bw, bh, i ? '#8F8CE0' : C.ind, ' rx="4"') + txb(x + bw / 2, y0 + h - bh - 5, b[1] + ' %', 'middle') + tx(x + bw / 2, y0 + h + 15, b[0] + ' %', 'middle');
    });
    return o + tx(x0 + w / 2, y0 + h + 32, lab, 'middle', 'font-weight:700');
  }
  function arch(o2) {
    var s = ttl(o2.title), n = o2.devices.length, w = 480 / n;
    o2.devices.forEach(function (d, i) { var x = 25 + i * w; s += bx(x, 196, w - 10, 34, i % 2 ? C.sl : '#4F5486', d) + ln('M' + (x + w / 2 - 5) + ' 196V176', C.sl, 1.6); });
    s += ln('M30 176H500', C.cyD, 3) + tx(500, 170, o2.bus || 'BACnet / Modbus / SNMP', 'end', 'font-weight:700;fill:#0B7F99');
    s += bx(150, 116, 230, 36, C.indD, o2.mid) + ln('M265 152V176', C.sl, 1.6);
    s += bx(150, 46, 230, 40, C.ind, o2.top, o2.topSub) + ar('M265 116V88', C.deep);
    if (o2.side) s += bx(400, 50, 110, 34, C.deep, o2.side) + ar('M380 66H398', C.deep);
    return svg(s + (o2.foot ? foot(o2.foot) : ''));
  }
  function wave(x0, y0, w, a, f) { var d = ''; for (var i = 0; i <= 60; i++) { var tt = i / 60 * Math.PI * 4, y = y0 - a * f(tt); d += (i ? 'L' : 'M') + f1(x0 + i / 60 * w) + ' ' + f1(y); } return d; }

  var IV = {
    /* ------------------------------------------------------------------ power */
    grid: function (c) {
      var el = c.R.el, tt = el.vclass === 'TT', s = ttl(['PLN supply: two feeders from different substations', 'PLN供电：来自不同变电站的两路馈线']);
      s += L.pylon(40, 236, 170) + L.powerTx(92, 124, .62) + L.powerTx(92, 232, .62);
      s += '<path d="M20 98Q60 100 106 70M64 98Q90 100 120 70M20 98Q70 140 106 178M64 98Q96 150 120 178" fill="none" stroke="#D58A12" stroke-width="1.4"/>';
      s += tx(154, 84, ['Substation 1', '变电站1'], 'start', 'font-weight:700') + tx(154, 192, ['Substation 2', '变电站2'], 'start', 'font-weight:700');
      s += L.pipe('M154 104H418', 'mv', 6) + L.pipe('M154 212H418', 'mv', 6);
      s += txb(286, 124, tt ? ['Line A · ' + el.hv.name, 'A线 · ' + el.hv.name] : ['Feeder A · 20 kV', 'A路馈线 · 20 kV'], 'middle', C.amD) + txb(286, 232, tt ? ['Line B · ' + el.hv.name, 'B线 · ' + el.hv.name] : ['Feeder B · 20 kV', 'B路馈线 · 20 kV'], 'middle', C.amD);
      s += L.switchgear(420, 80, 3, 96, 150) + txb(468, 70, tt ? ['On-site substation', '场内变电站'] : ['Site MV switchgear', '场地中压开关柜'], 'middle');
      return svg(s + foot([el.hv.name + ' · ' + F(el.mva, 1) + ' MVA · ' + el.hv.circ + ' circuit(s)' + (el.hv.gis ? ' · GIS ' + el.hv.ur + ' kV' : ''), el.hv.name + ' · ' + F(el.mva, 1) + ' MVA · ' + el.hv.circ + '回进线' + (el.hv.gis ? ' · GIS ' + el.hv.ur + ' kV' : '')]));
    },
    mvsg: function (c) {
      var s = ttl(['MV switchboard — single-line view', '中压开关柜——单线图']);
      s += ln('M110 40V100', C.am, 3) + brk(110, 66) + ln('M420 40V100', C.am, 3) + brk(420, 66);
      s += txb(122, 48, ['Incomer A', 'A路进线'], 'start', C.amD) + txb(432, 48, ['Incomer B', 'B路进线'], 'start', C.amD);
      s += ln('M50 100H250', C.am, 6) + ln('M280 100H480', C.am, 6) + ln('M250 100H258', C.am, 3) + brk(265, 100) + ln('M272 100H280', C.am, 3) + tx(265, 126, ['Bus coupler', '母联'], 'middle', 'font-weight:700');
      [80, 170, 360, 450].forEach(function (x) { s += ln('M' + x + ' 100V150', C.am, 3) + brk(x, 124) + '<circle cx="' + x + '" cy="164" r="10" fill="none" stroke="' + C.deep + '" stroke-width="2"/><circle cx="' + x + '" cy="178" r="10" fill="none" stroke="' + C.deep + '" stroke-width="2"/>' + tx(x, 204, 'TX', 'middle', 'font-weight:700'); });
      s += txb(125, 226, ['Bus section A', 'A段母线'], 'middle', C.ind) + txb(405, 226, ['Bus section B', 'B段母线'], 'middle', C.ind);
      return svg(s + foot([c.R.el.feeds + ' incomers · arc-resistant (IAC AFLR) · vacuum breakers', c.R.el.feeds + '路进线 · 内部燃弧分级（IAC AFLR）· 真空断路器']));
    },
    tx: function (c) {
      var el = c.R.el, pct = Math.min(1, el.demandKVA / (el.txTotal * el.txSize)), s = ttl(['Cast-resin dry-type transformer (cut-away)', '环氧树脂浇注干式变压器（剖视）']);
      s += L.dryTx(40, 40, 230, 190);
      s += co(100, 130, 300, 70, ['HV winding · 20 kV', '高压绕组 · 20 kV']) + co(170, 170, 300, 104, ['LV winding · 0.4 kV', '低压绕组 · 0.4 kV']) + co(240, 60, 300, 138, ['Terminals & busbar', '端子与母排']) + co(262, 214, 300, 172, ['Enclosure + PT100', '外壳 + PT100测温']);
      s += tx(300, 204, ['Normal loading per unit', '单台正常负载率'], 'start', 'font-weight:700') + L.R(300, 212, 200, 12, '#E6E8F3', ' rx="6"') + L.R(300, 212, 200 * pct, 12, C.am, ' rx="6"') + txb(505, 222, Math.round(pct * 100) + ' %', 'end');
      return svg(s + foot([el.txTotal + ' × ' + F(el.txSize) + ' kVA (' + el.txLabel + ')', el.txTotal + ' × ' + F(el.txSize) + ' kVA（' + el.txLabel + '）']));
    },
    lv: function () {
      var s = ttl(['LV main switchboard with automatic transfer', '带自动切换的低压主配电柜']);
      s += bx(16, 56, 112, 46, C.am, ['Transformer', '变压器'], '400 V') + bx(16, 156, 112, 46, C.ind, ['Generator', '发电机'], ['ready in 10–15 s', '10–15 s就绪']);
      s += ar('M128 79H158V112H186', C.am) + ar('M128 179H158V146H186', C.ind) + bx(188, 96, 92, 66, C.deep, 'ATS', ['auto transfer', '自动切换']);
      s += ln('M280 129H322', C.deep, 4) + ln('M322 66V196', C.am, 7);
      s += ar('M322 80H396', C.deep) + bx(398, 62, 116, 34, C.ind, ['UPS systems', 'UPS系统']) + ar('M322 129H396', C.deep) + bx(398, 112, 116, 34, C.cy, ['Cooling plant', '制冷设备']) + ar('M322 178H396', C.deep) + bx(398, 162, 116, 34, C.sl, ['Building services', '建筑设备']);
      return svg(s + foot(['PLN fails → generators take over in seconds; UPS batteries bridge the gap.', 'PLN失电→数秒内由发电机接管；期间由UPS电池过渡。']));
    },
    gen: function (c) {
      var el = c.R.el, s = ttl(['Diesel generator set (cut-away)', '柴油发电机组（剖视）']);
      s += L.R(30, 198, 470, 24, '#4E5576', ' rx="3"') + txw(265, 214, ['base fuel tank', '底座油箱'], 'middle', 11);
      s += L.R(60, 112, 200, 86, 'url(#tcSteel)', ' rx="6" stroke="#17153F" stroke-opacity=".35"');
      for (var i = 0; i < 6; i++) s += L.R(70 + i * 31, 98, 22, 16, '#9AA0BC', ' rx="2"');
      s += txb(160, 162, ['Diesel engine', '柴油发动机'], 'middle') + L.R(268, 122, 120, 70, 'url(#tcInd)', ' rx="30"') + txw(328, 162, ['Alternator', '发电机'], 'middle', 12.5);
      s += L.R(400, 92, 84, 106, 'url(#tcLouvre)', ' rx="4"') + L.fan(442, 145, 26, 1.4, true) + tx(442, 86, ['Radiator', '散热器'], 'middle', 'font-weight:700');
      s += ln('M110 98V58H72V44', '#5E6484', 8) + L.R(30, 30, 84, 18, '#5E6484', ' rx="9"') + tx(124, 44, ['Exhaust & silencer', '排气与消声器'], 'start', 'font-weight:700');
      s += L.R(300, 40, 84, 50, C.deep, ' rx="4"') + L.R(308, 48, 40, 14, C.cyD, ' rx="2"') + tx(342, 104, ['Controller', '控制器'], 'middle', 'font-weight:700');
      return svg(s + foot([el.genTotal + ' × ' + F(el.genSize) + ' kWe (' + el.genLabel + ') · continuous rating · ' + c.p.fuelH + ' h fuel', el.genTotal + ' × ' + F(el.genSize) + ' kWe（' + el.genLabel + '）· 持续功率 · 燃油' + c.p.fuelH + ' h']));
    },
    batt: function (c) {
      var s = ttl(['LFP battery: cell → module → rack', '磷酸铁锂电池：电芯→模组→电池柜']);
      s += L.R(30, 94, 46, 80, '#4F55A0', ' rx="6"') + L.R(38, 86, 10, 8, '#9AA0BC') + L.R(58, 86, 10, 8, '#9AA0BC') + tx(53, 194, ['Cell · 3.2 V', '电芯 · 3.2 V'], 'middle', 'font-weight:700');
      s += ar('M88 134H128', C.sl) + L.R(138, 80, 140, 104, '#3A3F63', ' rx="8"');
      for (var i = 0; i < 4; i++) for (var j = 0; j < 2; j++) s += L.R(148 + i * 32, 90 + j * 46, 26, 40, '#4F55A0', ' rx="4"');
      s += tx(208, 204, ['Module + cell monitoring', '模组 + 电芯监测'], 'middle', 'font-weight:700') + ar('M290 134H330', C.sl);
      s += L.battRack(340, 44, 1, 92, 172, true) + bx(442, 54, 76, 40, C.deep, 'BMS') + bx(442, 108, 76, 40, C.am, ['DC breaker', '直流断路器']) + tx(386, 234, ['Rack / string', '电池柜/组串'], 'middle', 'font-weight:700');
      return svg(s + foot([F(c.R.el.battKWh) + ' kWh ' + t(X.bat(c)) + ' for ' + c.p.upsMin + ' min in this basis', '本基准：' + F(c.R.el.battKWh) + ' kWh ' + X.bat(c)[1] + '，后备' + c.p.upsMin + ' min']));
    },
    bwy: function (c) {
      var el = c.R.el, s = ttl(['Overhead busway feeding a rack row (A + B)', '上走线母线为机柜列供电（A+B）']);
      s += L.R(40, 50, 450, 12, 'url(#tcAmber)', ' rx="3"') + L.R(40, 78, 450, 12, C.ind, ' rx="3"') + txb(36, 60, ['A', 'A'], 'end', C.amD) + txb(36, 88, ['B', 'B'], 'end', C.ind);
      for (var i = 0; i < 5; i++) {
        var x = 82 + i * 92;
        s += L.R(x - 14, 62, 16, 14, '#3A3F63', ' rx="2"') + L.R(x + 4, 90, 16, 14, '#3A3F63', ' rx="2"') + ln('M' + (x - 6) + ' 76V130', C.am, 2) + ln('M' + (x + 12) + ' 104V130', C.ind, 2) + L.rack(x - 22, 130, 46, 100);
      }
      return svg(s + foot([(el.useBusway ? el.busways + ' runs × ' + el.bwA + ' A' : el.pdus + ' PDUs') + ' · every rack fed from A and B', (el.useBusway ? el.busways + '条 × ' + el.bwA + ' A' : el.pdus + '台PDU') + ' · 每个机柜由A、B两路供电']));
    },
    rpdu: function (c) {
      var s = ttl(['Rack PDUs A and B feeding dual-corded servers', 'A、B路机柜PDU为双电源服务器供电']);
      s += L.R(150, 36, 230, 194, '#2B2E4E', ' rx="6"') + L.R(160, 44, 20, 178, C.am, ' rx="4"') + L.R(350, 44, 20, 178, C.ind, ' rx="4"') + L.R(161, 48, 18, 12, C.cyD, ' rx="2"');
      for (var i = 0; i < 6; i++) {
        var y = 54 + i * 28;
        s += L.R(192, y, 146, 22, '#3A3F6E', ' rx="2"') + L.R(316, y + 4, 8, 14, '#9AA0BC') + L.R(328, y + 4, 8, 14, '#9AA0BC');
        s += ln('M320 ' + (y + 18) + 'Q260 ' + (y + 28) + ' 180 ' + (y + 14), C.am, 1.6) + ln('M332 ' + (y + 18) + 'Q345 ' + (y + 24) + ' 350 ' + (y + 14), C.ind, 1.6);
      }
      s += tx(142, 70, ['PDU A (metered)', 'A路PDU（计量）'], 'end', 'font-weight:700;fill:#B8740B') + tx(388, 70, ['PDU B', 'B路PDU'], 'start', 'font-weight:700;fill:#3F3CBB') + tx(388, 150, ['dual power supplies', '双电源模块'], 'start');
      return svg(s + foot([F(c.R.el.rpdus) + ' rack PDUs · ' + c.R.el.rStd[0], F(c.R.el.rpdus) + '个机柜PDU · ' + c.R.el.rStd[1]]));
    },
    bess: function (c) {
      var b = c.R.el.bess, s = ttl(['BESS container: batteries, PCS and protection', '储能集装箱：电池、变流器与保护']);
      s += L.R(26, 58, 340, 156, '#F4F5FA', ' rx="6" stroke="#17153F" stroke-opacity=".4"') + L.battRack(40, 78, 5, 200, 118, true) + bx(254, 78, 96, 118, C.deep, 'PCS', ['inverter', '变流器']);
      s += L.smokeDet(90, 70) + L.smokeDet(190, 70) + L.R(366, 90, 24, 70, '#5E6484', ' rx="3"') + tx(378, 82, 'HVAC', 'middle', 'font-weight:700');
      s += L.pipe('M350 136H420', 'mv', 4) + L.powerTx(410, 214, .62) + tx(452, 232, ['MV transformer', '中压变压器'], 'middle', 'font-weight:700');
      s += tx(140, 234, ['LFP racks', 'LFP电池架'], 'middle', 'font-weight:700') + tx(140, 50, ['off-gas detection', '逸出气体探测'], 'middle');
      return svg(s + foot(b ? [F(b.mw, 1) + ' MW / ' + F(b.mwh, 1) + ' MWh · ' + b.containers + ' containers — buffers GPU swings, shaves PLN peaks', F(b.mw, 1) + ' MW / ' + F(b.mwh, 1) + ' MWh · ' + b.containers + '个集装箱——缓冲GPU波动、削减PLN峰值'] : ['Buffers GPU load swings and shaves PLN peaks; does not replace UPS or generators.', '缓冲GPU负荷波动并削减PLN峰值；不替代UPS或发电机。']));
    },
    fuel: function (c) {
      var el = c.R.el, s = ttl(['Fuel system: bulk storage to day tanks', '燃油系统：主储罐至日用油箱']);
      s += L.R(10, 150, 510, 92, 'url(#tcSoil)', ' opacity=".7"') + L.fuelTank(24, 166, 210, 42) + tx(130, 228, ['Bulk tank (underground)', '主储罐（地下）'], 'middle', 'font-weight:700');
      s += L.R(40, 124, 16, 26, '#5E6484', ' rx="2"') + tx(48, 118, ['tanker fill', '油车加注'], 'middle');
      s += L.pipe('M220 186V138H250', 'fuel', 4) + L.pump(250, 150, .62) + L.pump(310, 150, .62) + tx(290, 106, ['duplicate transfer pumps', '双套输油泵'], 'middle', 'font-weight:700');
      s += L.pipe('M356 120H380V82H396', 'fuel', 3) + L.pipe('M356 128H380V138H396', 'fuel', 3);
      s += L.R(396, 66, 28, 32, '#9AA0BC', ' rx="3"') + L.R(396, 122, 28, 32, '#9AA0BC', ' rx="3"') + bx(432, 62, 86, 40, C.ind, ['Gen-set 1', '机组1']) + bx(432, 118, 86, 40, C.ind, ['Gen-set 2', '机组2']) + tx(410, 58, ['day tanks', '日用油箱'], 'middle');
      s += '<circle cx="130" cy="158" r="5" fill="' + C.am + '"/>' + tx(140, 162, ['level · leak · water sensors', '液位·泄漏·水分传感器'], 'start');
      return svg(s + foot([el.tanks + ' × ' + el.tankSize + ' m³ · ' + F(el.fuelLph) + ' L/h at full load · ' + c.p.fuelH + ' h', el.tanks + ' × ' + el.tankSize + ' m³ · 满载' + F(el.fuelLph) + ' L/h · ' + c.p.fuelH + ' h']));
    },
    earth: function () {
      var s = ttl(['Earthing, bonding and lightning protection', '接地、等电位联结与防雷']);
      s += L.R(10, 206, 360, 40, 'url(#tcSoil)') + L.R(80, 86, 240, 120, '#F4F5FA', ' stroke="#17153F" stroke-opacity=".35"');
      [110, 200, 290].forEach(function (x) { s += ln('M' + x + ' 86V62', C.sl, 3) + '<circle cx="' + x + '" cy="60" r="3" fill="' + C.sl + '"/>'; });
      s += ln('M84 86V226', C.soil, 3) + ln('M316 86V226', C.soil, 3) + ln('M40 226H360', C.soil, 3);
      [40, 140, 260, 360].forEach(function (x) { s += ln('M' + x + ' 226V244', C.soil, 4); });
      s += L.rack(120, 136, 30, 66) + L.rack(156, 136, 30, 66) + L.R(226, 178, 50, 18, C.soil, ' rx="2"') + txw(251, 191, 'MET', 'middle', 11) + ln('M150 202V196H226', C.soil, 1.8) + ln('M251 196V226', C.soil, 2.5);
      s += bx(390, 56, 128, 34, C.am, ['SPD Type 1', '一级SPD'], ['main board', '总配电']) + ar('M454 90V104', C.sl) + bx(390, 106, 128, 34, '#E8A93A', ['SPD Type 2', '二级SPD'], ['sub-boards', '分配电']) + ar('M454 140V154', C.sl) + bx(390, 156, 128, 34, '#F2C46A', ['SPD Type 3', '三级SPD'], ['equipment', '设备端']);
      s += tx(200, 80, ['air terminals', '接闪器'], 'middle', 'font-weight:700') + tx(200, 240, ['ring electrode & earth rods', '环形接地体与接地棒'], 'middle', 'font-weight:700;fill:#5C4523');
      s += txb(454, 214, ['Earth ≤ 1 Ω', '接地电阻≤1 Ω'], 'middle', C.indD) + tx(454, 232, ['very high lightning density', '雷暴密度极高'], 'middle');
      return svg(s);
    },
    epms: function (c) { return arch({ title: ['EPMS: from meters to dashboards', '电力监控：从电表到仪表盘'], devices: [['MV', '中压'], ['TX', '变压器'], ['LV', '低压'], ['UPS', 'UPS'], ['Busway', '母线']], bus: 'Modbus · IEC 61850', mid: ['Gateways · time-synchronised', '网关 · 时钟同步'], top: ['EPMS server', '电力监控服务器'], topSub: ['PUE · waveforms · events', 'PUE · 波形 · 事件'], side: ['NOC', 'NOC'], foot: ['≈ ' + F(c.R.fs.meters) + ' meters in this basis', '本基准约' + F(c.R.fs.meters) + '块电表'] }); },
    harm: function () {
      var s = ttl(['Active harmonic filter', '有源谐波滤波器']), fD = function (x) { return Math.sin(x) + .32 * Math.sin(5 * x) + .2 * Math.sin(7 * x); }, fF = function (x) { return -(.32 * Math.sin(5 * x) + .2 * Math.sin(7 * x)); };
      [[20, fD, C.co, ['Load current (distorted)', '负载电流（畸变）']], [190, fF, C.vi, ['Filter injects', '滤波器注入']], [360, Math.sin, C.cyD, ['Supply current (clean)', '电源电流（纯净）']]].forEach(function (p) {
        s += ln('M' + p[0] + ' 130H' + (p[0] + 150), '#C9CDE0', 1) + ln(wave(p[0], 130, 150, 42, p[1]), p[2], 2.6) + tx(p[0] + 75, 200, p[3], 'middle', 'font-weight:700');
      });
      s += txb(178, 136, '+', 'middle', C.deep, 22) + txb(348, 136, '=', 'middle', C.deep, 22);
      return svg(s + foot(['Keeps THDi within IEEE 519 limits and the power factor near 1.', '使THDi满足IEEE 519限值，功率因数接近1。']));
    },
    ldb: function () {
      var s = ttl(['Load-bank testing before the IT arrives', 'IT进场前的负载箱测试']);
      s += L.lvBoard(26, 70, 3, 90, 150) + L.pipe('M116 150H196', 'lv', 6) + L.R(196, 78, 160, 132, '#E9EBF4', ' rx="6" stroke="#17153F" stroke-opacity=".35"');
      for (var i = 0; i < 5; i++) s += ln('M212 ' + (100 + i * 20) + 'l12 -8 12 8 12 -8 12 8 12 -8 12 8 12 -8', C.co, 2);
      s += L.fan(326, 144, 18, 1.2, true) + ln('M226 70c6 -10 -6 -16 0 -26M262 70c6 -10 -6 -16 0 -26M298 70c6 -10 -6 -16 0 -26', C.co, 2) + tx(276, 230, ['Resistive load bank', '电阻负载箱'], 'middle', 'font-weight:700');
      s += bx(380, 64, 138, 34, C.ind, ['L4 · functional tests', 'L4 · 功能测试']) + bx(380, 110, 138, 34, C.indD, ['L5 · integrated test', 'L5 · 综合测试']) + bx(380, 156, 138, 34, C.am, ['Yearly gen-set ≥ 80 %', '年度机组测试≥80%']);
      return svg(s + foot(['Proves generators, UPS, cooling and controls at full load before go-live.', '在投运前以满负荷验证发电机、UPS、制冷及控制系统。']));
    },
    cable: function () {
      var s = ttl(['Duct banks: A and B on separate routes', '排管：A、B路径分开敷设']);
      s += L.R(10, 60, 510, 180, 'url(#tcSoil)');
      [[50, ['Route A', 'A路'], C.am], [310, ['Route B', 'B路'], C.ind]].forEach(function (b) {
        s += L.R(b[0], 118, 170, 96, 'url(#tcConc)', ' rx="4" stroke="#17153F" stroke-opacity=".3"') + txb(b[0] + 85, 108, b[1], 'middle', b[2]);
        for (var i = 0; i < 3; i++) for (var j = 0; j < 2; j++) { var cx = b[0] + 32 + i * 53, cy = 144 + j * 44; s += '<circle cx="' + cx + '" cy="' + cy + '" r="16" fill="#fff" stroke="#9AA0BC" stroke-width="2"/>'; if (i < 2) s += '<circle cx="' + (cx - 5) + '" cy="' + (cy + 3) + '" r="5" fill="' + b[2] + '"/><circle cx="' + (cx + 5) + '" cy="' + (cy + 3) + '" r="5" fill="' + b[2] + '"/><circle cx="' + cx + '" cy="' + (cy - 5) + '" r="5" fill="' + b[2] + '"/>'; }
      });
      s += ar('M236 166H300', C.sl) + ar('M296 166H232', C.sl) + tx(266, 156, ['apart', '分开'], 'middle', 'font-weight:700');
      return svg(s + foot(['XLPE MV cables; spare conduits; partial-discharge and VLF tests at commissioning.', 'XLPE中压电缆；预留管孔；调试时局放及VLF试验。']));
    },
    /* ------------------------------------------------------------------ cooling */
    tower: function (c) {
      var me = c.R.me, wb = c.R.L.wb, s = ttl(['Induced-draft cooling tower (section)', '机械引风冷却塔（剖面）']);
      s += '<path d="M90 232L110 70H370L390 232Z" fill="#EEF0F7" stroke="#17153F" stroke-opacity=".35"/>' + L.R(190, 42, 100, 28, 'url(#tcSteel)', ' rx="3"') + L.rotor(240, 42, 46, 2.2, '#5E6484', 3, .3);
      s += tx(300, 52, ['warm, moist air out', '湿热空气排出'], 'start', 'font-weight:700;fill:#5D6280') + L.R(116, 76, 248, 12, 'url(#tcGrid)', ' stroke="#9AA0BC"');
      s += ln('M104 102H376', C.co, 5);
      for (var i = 0; i < 7; i++) s += '<path d="M' + (130 + i * 36) + ' 104l-6 10h12z" fill="' + C.co + '"/>';
      s += L.bubbles(122, 112, 236, 18, 10, 4, '#7FD0EA', .9, true, 1.5, 2.5) + L.R(120, 130, 240, 60, 'url(#tcGrid)', ' stroke="#9AA0BC"');
      s += L.R(92, 192, 26, 34, 'url(#tcLouvre)') + L.R(362, 192, 26, 34, 'url(#tcLouvre)') + L.air('M24 210H88', false, 4) + L.air('M456 210H394', false, 4) + L.R(96, 226, 288, 12, 'url(#tcWater)');
      s += co(370, 102, 400, 102, ['Hot water in · 37 °C', '热水进 · 37 °C']) + co(360, 82, 400, 74, ['Drift eliminators', '收水器']) + co(350, 160, 400, 160, ['Fill', '填料']) + co(380, 230, 400, 222, ['Basin · 32 °C', '集水盘 · 32 °C']) + tx(24, 198, ['air in · WB ' + wb + ' °C', '进风 · 湿球 ' + wb + ' °C'], 'start', 'font-weight:700;fill:#0B7F99');
      return svg(s + foot(me.ctN ? ['≈ 1.5 L evaporated per kWh of heat · ' + (me.ctN + me.ctR) + ' cells in this basis', '每kWh热量约蒸发1.5 L · 本基准' + (me.ctN + me.ctR) + '格'] : ['≈ 1.5 L evaporated per kWh of heat rejected', '每散热1 kWh约蒸发1.5 L']));
    },
    pumps: function (c) {
      var s = ttl(['Variable-speed pumps follow the cube law', '变频水泵遵循立方定律']);
      s += L.pump(26, 206, 2.1, C.cy) + bx(40, 52, 70, 34, C.deep, 'VFD') + ln('M75 86V100H128V132', C.deep, 2);
      s += cube(250, 50, 260, 150, ['speed → power', '转速 → 功率']);
      return svg(s + foot([(c.R.me.pumps || '–') + ' pumps in this basis · 80 % speed needs ≈ 51 % power', '本基准' + (c.R.me.pumps || '–') + '台水泵 · 80%转速约需51%功率']));
    },
    phe: function () {
      var s = ttl(['Plate heat exchanger (economiser)', '板式换热器（节能器）']);
      s += L.R(150, 54, 18, 162, '#3A3F63', ' rx="2"') + L.R(362, 54, 18, 162, '#3A3F63', ' rx="2"') + L.R(140, 48, 250, 8, '#5E6484', ' rx="3"');
      for (var i = 0; i < 16; i++) s += L.R(172 + i * 11.6, 64, 8, 146, i % 2 ? '#F2B3A7' : '#9ADDEF', ' rx="2"');
      s += ar('M40 84H148', C.co) + ar('M384 188H492', C.co) + ar('M492 84H384', C.cy) + ar('M148 188H40', C.cy);
      s += tx(40, 76, ['warm in 22 °C', '暖侧进 22 °C'], 'start', 'font-weight:700;fill:#B0302A') + tx(492, 206, ['out 16 °C', '出 16 °C'], 'end', 'font-weight:700;fill:#B0302A') + tx(492, 76, ['cool in 14 °C', '冷侧进 14 °C'], 'end', 'font-weight:700;fill:#0B7F99') + tx(40, 206, ['out 20 °C', '出 20 °C'], 'start', 'font-weight:700;fill:#0B7F99');
      return svg(s + foot(['Counter-flow plates, approach ≈ 1–2 K — for warm-water loops or highland sites.', '逆流板片，趋近温度约1–2 K——适用于温水环路或高原站点。']));
    },
    tes: function (c) {
      var me = c.R.me, s = ttl(['Stratified chilled-water storage', '分层蓄冷罐']);
      s += '<defs><linearGradient id="tcTesG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6C3B8"/><stop offset=".45" stop-color="#F6C3B8"/><stop offset=".55" stop-color="#9ADDEF"/><stop offset="1" stop-color="#4FC3E0"/></linearGradient></defs>';
      s += L.R(180, 40, 170, 196, 'url(#tcTesG)', ' rx="14" stroke="#17153F" stroke-opacity=".35"') + ln('M196 60H334', C.deep, 3) + ln('M196 216H334', C.deep, 3) + L.R(180, 124, 170, 12, '#fff', ' opacity=".55"');
      s += ar('M50 66H178', C.co) + tx(50, 58, ['warm return 22 °C', '回水 22 °C'], 'start', 'font-weight:700;fill:#B0302A') + ar('M178 208H50', C.cy) + tx(50, 228, ['cold supply 14 °C', '供水 14 °C'], 'start', 'font-weight:700;fill:#0B7F99');
      s += tx(360, 134, ['thermocline', '温跃层'], 'start', 'font-weight:700') + '<circle cx="466" cy="68" r="30" fill="#fff" stroke="' + C.ind + '" stroke-width="3"/>' + ln('M466 68V48M466 68L480 78', C.deep, 3) + tx(520, 118, [K.TES_S / 60 + ' min ride-through', '后备' + K.TES_S / 60 + '分钟'], 'end', 'font-weight:800');
      return svg(s + foot(me.tesM3 ? [F(me.tesM3) + ' m³ in this basis while chillers restart', '本基准' + F(me.tesM3) + ' m³，覆盖冷机重启时间'] : ['Not required in this basis.', '本基准无需配置。']));
    },
    crah: function (c) {
      var me = c.R.me, s = ttl(['Fan wall: filter → coil → EC fans', '风墙：过滤器→盘管→EC风机']);
      s += L.R(150, 54, 140, 178, '#EEF0F8', ' rx="6" stroke="#17153F" stroke-opacity=".35"') + L.R(160, 66, 20, 154, 'url(#tcMesh)') + L.R(194, 66, 24, 154, C.cy, ' rx="2"');
      for (var i = 0; i < 10; i++) s += ln('M194 ' + (74 + i * 15) + 'H218', '#E2F5FA', 1.2);
      s += L.fan(256, 94, 20, 1.3, true) + L.fan(256, 143, 20, 1.3, false) + L.fan(256, 192, 20, 1.3, false);
      s += L.air('M30 143H148', true, 5) + tx(30, 131, ['hot return 36 °C', '热回风 36 °C'], 'start', 'font-weight:700;fill:#B0302A') + L.air('M292 143H500', false, 6) + tx(310, 129, ['supply to cold aisle 24 °C', '送至冷通道 24 °C'], 'start', 'font-weight:700;fill:#0B7F99');
      s += tx(172, 48, ['filter', '过滤器'], 'end', 'font-weight:700') + tx(206, 48, ['CHW coil', '冷冻水盘管'], 'middle', 'font-weight:700') + tx(240, 48, ['EC fans', 'EC风机'], 'start', 'font-weight:700');
      return svg(s + (me.term ? foot([(me.term.n + me.term.r) + ' × ' + me.term.en + ' in this basis', '本基准' + (me.term.n + me.term.r) + ' × ' + me.term.zh]) : ''));
    },
    rdhx: function () {
      var s = ttl(['Rear-door heat exchanger (side view)', '背板换热器（侧视）']);
      s += L.R(20, 230, 490, 6, '#C9CDE0') + L.R(150, 40, 180, 190, '#2B2E4E', ' rx="4"');
      for (var i = 0; i < 8; i++) s += L.R(160, 50 + i * 22, 160, 16, '#3A3F6E', ' rx="2"');
      s += L.R(330, 40, 22, 190, C.cy, ' rx="3"');
      for (var j = 0; j < 12; j++) s += ln('M330 ' + (48 + j * 15) + 'H352', '#E2F5FA', 1.2);
      s += L.air('M30 134H148', false, 5) + L.air('M190 134H326', true, 5) + L.air('M354 134H500', false, 5);
      s += tx(30, 120, ['inlet 24 °C', '进风 24 °C'], 'start', 'font-weight:700;fill:#0B7F99') + tx(258, 120, ['hot 36 °C', '热风 36 °C'], 'middle', 'font-weight:700;fill:#fff') + tx(500, 120, ['out ≈ room temp.', '出风≈室温'], 'end', 'font-weight:700;fill:#0B7F99');
      s += L.pipe('M341 40V24H480', 'chwr', 4, false) + L.pipe('M341 230V248H480', 'chws', 4, false) + tx(30, 254, ['water ≥ 18 °C (above dew point)', '水温≥18 °C（高于露点）'], 'start', 'font-weight:700');
      return svg(s);
    },
    wtreat: function () {
      var s = ttl(['Condenser-water treatment', '冷却水处理']);
      s += L.tankBox(30, 150, 190, 70, 16, 'tcWater', .7) + tx(125, 132, ['tower basin', '冷却塔集水盘'], 'middle', 'font-weight:700');
      s += L.cylV(250, 116, 30, 60, 'tcWhite') + L.R(252, 136, 26, 38, C.am, ' opacity=".8"') + L.cylV(300, 116, 30, 60, 'tcWhite') + L.R(302, 136, 26, 38, C.vi, ' opacity=".7"');
      s += tx(265, 104, ['inhibitor', '缓蚀剂'], 'middle', 'font-weight:700') + tx(315, 196, ['biocide', '杀菌剂'], 'middle', 'font-weight:700') + ln('M265 180V196H200V160', C.am, 2, '4 3') + ln('M315 178V188H210V162', C.vi, 2, '4 3');
      s += bx(360, 56, 150, 44, C.deep, ['Conductivity control', '电导率控制'], 'CoC 4–6') + L.vessel(410, 128, 42, 86, 'tcSteel') + tx(431, 236, ['side-stream filter', '旁滤器'], 'middle', 'font-weight:700');
      s += ln('M220 210H250V236', C.sl, 3) + valve(250, 226, true) + tx(262, 232, ['blowdown', '排污'], 'start', 'font-weight:700');
      return svg(s + foot(['Monthly Legionella sampling; closed loops use inhibitor and corrosion coupons.', '每月军团菌取样；闭式环路使用缓蚀剂及腐蚀挂片。']));
    },
    makeup: function (c) {
      var me = c.R.me, s = ttl(['Make-up water: sources to storage', '补水：水源至储水']);
      s += bx(16, 50, 128, 34, C.cy, ['PDAM mains', '市政供水']) + bx(16, 100, 128, 34, '#1E8FC0', ['Groundwater well', '地下水井']) + bx(16, 150, 128, 34, C.sl, ['Rainwater', '雨水收集']);
      s += ar('M144 67H210', C.cy) + ar('M144 117H210', C.cy) + ar('M144 167H210', C.cy) + L.storageTank(214, 80, 96, 132, C.cy) + tx(262, 236, ['storage tanks', '储水箱'], 'middle', 'font-weight:700');
      s += L.pump(320, 214, .7) + ar('M372 196H400', C.cy) + L.coolingTower(410, 136, 92, 78, false) + tx(456, 236, ['towers', '冷却塔'], 'middle', 'font-weight:700');
      return svg(s + foot([F(me.waterStore) + ' m³ stored · ' + F(me.waterDay) + ' m³/day · ' + c.p.fuelH + ' h autonomy', '储水' + F(me.waterStore) + ' m³ · 每日' + F(me.waterDay) + ' m³ · 自持' + c.p.fuelH + ' h']));
    },
    vfd: function () {
      var s = ttl(['Variable frequency drives: speed sets the power', '变频器：转速决定功率']);
      s += L.R(40, 50, 120, 170, '#E9EBF4', ' rx="6" stroke="#17153F" stroke-opacity=".35"') + L.R(56, 66, 88, 30, C.deep, ' rx="3"') + txw(100, 86, '48.0 Hz', 'middle', 12) + L.fan(100, 160, 32, 1.1, true);
      s += cube(230, 50, 270, 150, ['fan & pump speed → power', '风机水泵转速 → 功率']);
      return svg(s);
    },
    bms: function (c) { return arch({ title: ['BMS: field devices to the operators', 'BMS：从现场设备到值班人员'], devices: [['Chillers', '冷机'], ['Pumps', '水泵'], ['Fan walls', '风墙'], ['Valves', '阀门'], ['Sensors', '传感器']], bus: 'BACnet/IP', mid: ['DDC controllers (redundant)', 'DDC控制器（冗余）'], top: ['BMS servers', 'BMS服务器'], topSub: ['sequences · alarms · trends', '运行逻辑 · 报警 · 趋势'], side: ['NOC', 'NOC'], foot: ['≈ ' + F(c.R.fs.bmsPts) + ' BMS points in this basis', '本基准约' + F(c.R.fs.bmsPts) + '个BMS点位'] }); },
    pipes: function () {
      var s = ttl(['Ring header with isolation valves', '带隔离阀的环形干管']);
      s += ln('M110 60H430V210H110Z', C.cy, 8) + ln('M430 100V170', '#C9CDE0', 9) + tx(430, 232, ['section isolated for maintenance', '管段隔离维护'], 'middle', 'font-weight:700');
      s += bx(16, 76, 76, 32, C.ind, 'CH-1') + bx(16, 122, 76, 32, C.ind, 'CH-2') + bx(16, 168, 76, 32, C.ind, 'CH-3') + ln('M92 92H110M92 138H110M92 184H110', C.cy, 4);
      [[200, 60], [330, 60], [200, 210], [330, 210]].forEach(function (v) { s += valve(v[0], v[1]); });
      s += valve(430, 96, true) + valve(430, 174, true) + bx(160, 100, 220, 70, '#F4F5FB', '', '') + tx(270, 132, ['fan walls / CDUs', '风墙/CDU'], 'middle', 'font-weight:700') + tx(270, 152, ['fed from both directions', '双向供水'], 'middle');
      return svg(s + foot(['Any pipe section, pump or chiller can be isolated while the rest keeps cooling.', '任一管段、水泵或冷机均可隔离，其余部分继续供冷。']));
    },
    /* ------------------------------------------------------------------ liquid cooling */
    airack: function (c) {
      var hp = c.R.hdP, s = ttl([hp.en.split(' (')[0] + ' — rack anatomy', hp.zh.split('（')[0] + '——机柜构成']), y = 36;
      s += L.R(170, 30, 150, 208, '#1A1C33', ' rx="6"') + ln('M164 40V230', '#22B8D8', 4) + ln('M326 40V230', '#E86B5E', 4);
      function blk(n, h, col) { for (var i = 0; i < n; i++) { s += L.R(180, y, 130, h - 2, col, ' rx="1.5"'); y += h; } }
      blk(2, 7, C.am); var y1 = y; blk(9, 8, '#3A3F6E'); var y2 = y; blk(4, 8, C.indD); var y3 = y; blk(8, 8, '#3A3F6E'); blk(2, 7, C.am);
      s += co(310, 40, 340, 44, ['Power shelves', '电源架']) + co(310, (y1 + y2) / 2, 340, y1 + 20, ['Compute trays (cold plates)', '计算托盘（冷板）']) + co(310, (y2 + y3) / 2, 340, (y2 + y3) / 2 + 4, ['NVLink switch trays', 'NVLink交换托盘']) + co(326, 196, 340, 210, ['Supply / return manifolds', '供/回分液器']);
      return svg(s + foot([hp.kw + ' kW · ≈ ' + F(hp.kg) + ' kg · ' + hp.w + ' × ' + hp.d + ' mm · ' + (hp.gpu || '–') + ' GPUs', hp.kw + ' kW · 约' + F(hp.kg) + ' kg · ' + hp.w + ' × ' + hp.d + ' mm · ' + (hp.gpu || '–') + '颗GPU']));
    },
    manifold: function () {
      var s = ttl(['Rack manifold and dripless quick disconnects', '机柜分液器与无滴漏快插接头']);
      s += L.R(110, 36, 14, 200, '#22B8D8', ' rx="7"') + L.R(146, 36, 14, 200, '#E86B5E', ' rx="7"');
      for (var i = 0; i < 6; i++) {
        var y = 52 + i * 32;
        s += L.R(220, y - 10, 170, 22, '#3A3F6E', ' rx="2"') + '<circle cx="117" cy="' + y + '" r="5" fill="#fff" stroke="#0B7F99" stroke-width="2"/><circle cx="153" cy="' + (y + 6) + '" r="5" fill="#fff" stroke="#B0302A" stroke-width="2"/>';
        s += ln('M122 ' + y + 'H220', '#22B8D8', 2) + ln('M158 ' + (y + 6) + 'H220', '#E86B5E', 2);
      }
      s += '<circle cx="455" cy="120" r="58" fill="#fff" stroke="' + C.ind + '" stroke-width="2.5"/>' + L.R(412, 110, 40, 20, '#9AA0BC', ' rx="4"') + L.R(452, 106, 46, 28, '#5E6484', ' rx="6"') + L.R(446, 114, 12, 12, '#22B8D8', ' rx="2"') + tx(455, 198, ['QD halves seal', '快接断开时'], 'middle', 'font-weight:700') + tx(455, 214, ['on disconnect', '两侧自动密封'], 'middle', 'font-weight:700');
      s += tx(112, 252, ['supply', '供液'], 'end', 'font-weight:700;fill:#0B7F99') + tx(158, 252, ['return', '回液'], 'start', 'font-weight:700;fill:#B0302A');
      return svg(s);
    },
    fws: function (c) {
      var me = c.R.me, s = ttl(['Facility water loop: CDUs → pumps → dry coolers', '设施水环路：CDU→水泵→干冷器']);
      s += L.cduCab(20, 90, 64, 100) + L.cduCab(94, 90, 64, 100) + L.pump(196, 198, .8) + L.dryCooler(320, 120, 190, 60, 3);
      s += L.pipe('M158 120H190V96H330V120', 'fwr', 5) + L.pipe('M330 190V214H120V190', 'fws', 5) + valve(250, 96) + valve(250, 214);
      s += tx(260, 84, ['warm return ≈ 45 °C', '回水约45 °C'], 'middle', 'font-weight:700;fill:#B0302A') + tx(260, 236, ['supply ≈ 35–40 °C', '供水约35–40 °C'], 'middle', 'font-weight:700;fill:#0B7F99');
      return svg(s + foot(me.cduN ? [(me.cduN + me.cduR) + ' CDUs · ' + (me.dcN + me.dcR) + ' dry coolers in this basis', '本基准' + (me.cduN + me.cduR) + '台CDU · ' + (me.dcN + me.dcR) + '台干冷器'] : ['closed loop · no evaporation with dry coolers', '闭式环路 · 干冷器无蒸发']));
    },
    dry: function (c) {
      var db = c.R.L.db, s = ttl(['Adiabatic dry cooler (section)', '绝热干冷器（剖面）']);
      s += '<path d="M150 210L250 70M380 210L280 70" stroke="' + C.cy + '" stroke-width="14" stroke-linecap="round"/>';
      for (var i = 0; i < 9; i++) s += ln('M' + (157 + i * 11) + ' ' + (200 - i * 15.5) + 'l8 4M' + (373 - i * 11) + ' ' + (200 - i * 15.5) + 'l-8 4', '#E2F5FA', 1.4);
      s += L.R(140, 210, 250, 10, '#5E6484', ' rx="2"') + '<ellipse cx="225" cy="52" rx="44" ry="9" fill="#3A3F63"/><ellipse cx="305" cy="52" rx="44" ry="9" fill="#3A3F63"/>' + L.rotor(225, 52, 36, 1.4, '#9AA0BC', 3, .25) + L.rotor(305, 52, 36, 1.4, '#9AA0BC', 3, .25);
      s += L.R(90, 90, 18, 120, 'url(#tcMesh)') + L.R(422, 90, 18, 120, 'url(#tcMesh)') + L.air('M20 150H86', false, 4) + L.air('M510 150H444', false, 4) + ar('M245 40V12', C.co) + ar('M285 40V12', C.co);
      s += tx(20, 138, ['air ' + db + ' °C', '空气 ' + db + ' °C'], 'start', 'font-weight:700;fill:#0B7F99') + tx(300, 20, ['warm air out', '热风排出'], 'start', 'font-weight:700;fill:#B0302A') + tx(99, 228, ['adiabatic pads', '绝热湿帘'], 'middle', 'font-weight:700') + tx(265, 246, ['finned coils (V)', '翅片盘管（V形）'], 'middle', 'font-weight:700');
      return svg(s);
    },
    leak: function () {
      var s = ttl(['Leak detection under liquid-cooling equipment', '液冷设备下方的漏水检测']);
      s += L.cduCab(50, 60, 76, 132) + L.R(170, 52, 70, 140, '#2B2E4E', ' rx="4"') + L.R(246, 52, 70, 140, '#2B2E4E', ' rx="4"') + L.R(36, 196, 300, 12, '#DDE0EC', ' rx="3"');
      s += ln('M36 214H336', C.am, 3, '3 3') + '<path d="M254 194c4 -8 8 -12 8 -16a8 8 0 0 0 -16 0c0 4 4 8 8 16z" fill="#2F8FD0"/>' + tx(186, 236, ['sensing cable in the drip tray', '接水盘内的感应线缆'], 'middle', 'font-weight:700');
      s += bx(370, 70, 144, 74, C.deep, ['LEAK at 23.4 m', '漏水位置 23.4 m'], ['zone 2 · alarm to BMS', '2区 · 报警至BMS']) + ar('M336 214H360V146', C.am);
      return svg(s + foot(['Detects within seconds and locates the leak along the cable.', '数秒内报警并沿线缆定位漏点。']));
    },
    coolant: function () {
      var s = ttl(['Technology-loop coolant management', '技术环路冷却液管理']);
      s += L.cduCab(30, 70, 80, 130) + L.vessel(150, 90, 40, 90, 'tcSteel') + L.cylV(220, 70, 40, 60, 'tcWhite') + L.R(300, 70, 60, 130, '#2B2E4E', ' rx="4"');
      s += L.pipe('M110 100H150', 'tcs', 4, false) + L.pipe('M190 100H300', 'tcs', 4) + L.pipe('M300 180H110', 'tcr', 4, true, true) + ln('M240 130V150', C.sl, 2) + valve(240, 150, true) + L.R(234, 160, 12, 22, '#E2F5FA', ' rx="3" stroke="#0B7F99"');
      s += tx(170, 84, ['filter 25–50 µm', '过滤25–50 µm'], 'middle', 'font-weight:700') + tx(240, 62, ['expansion tank', '膨胀罐'], 'middle', 'font-weight:700') + tx(240, 200, ['sampling port', '取样口'], 'middle', 'font-weight:700');
      [['PG25 / inhibited water', 'PG25或缓蚀处理水'], ['pH & conductivity', 'pH与电导率'], ['glycol %', '乙二醇浓度'], ['particles & bacteria', '颗粒物与细菌']].forEach(function (p, i) { s += '<circle cx="384" cy="' + (88 + i * 28) + '" r="4" fill="' + C.ind + '"/>' + tx(394, 92 + i * 28, p, 'start', 'font-weight:700'); });
      return svg(s);
    },
    floor: function (c) {
      var sp = c.R.sp, hp = c.R.hdP, area = (hp.w || 600) * (hp.d || 1200) / 1e6, kg = sp.heavyRack || hp.kg || 1000, p1 = kg * 9.81 / 1000 / area, s = ttl(['Rack weight and floor loading', '机柜重量与楼面荷载']);
      s += L.R(30, 190, 470, 30, 'url(#tcConc)', ' stroke="#17153F" stroke-opacity=".3"') + L.R(60, 220, 22, 30, '#B9BED2') + L.R(448, 220, 22, 30, '#B9BED2') + L.rack(150, 60, 80, 130, { gpu: true });
      [165, 190, 215].forEach(function (x) { s += ar('M' + x + ' 24V54', C.co); });
      s += tx(260, 92, ['≈ ' + F(kg) + ' kg on ' + F(area, 2) + ' m²', '约' + F(kg) + ' kg，占地' + F(area, 2) + ' m²'], 'start', 'font-weight:800') + tx(260, 122, ['≈ ' + F(p1, 1) + ' kN/m² under the rack', '机柜下方约' + F(p1, 1) + ' kN/m²'], 'start', 'font-weight:700') + tx(260, 152, ['design live load ≥ ' + sp.floorLoad + ' kN/m²', '设计活荷载≥' + sp.floorLoad + ' kN/m²'], 'start', 'font-weight:700;fill:#2A2785');
      return svg(s + foot(['Check the whole delivery route: dock, freight lift, ramps.', '核查全部运输路线：卸货平台、货梯、坡道。']));
    },
    aipow: function (c) {
      var s = ttl(['Power path to an AI rack', 'AI机柜供电路径']);
      s += L.R(30, 46, 470, 12, 'url(#tcAmber)', ' rx="3"') + L.R(30, 70, 470, 12, C.ind, ' rx="3"') + txb(26, 56, 'A', 'end', C.amD) + txb(26, 80, 'B', 'end', C.ind);
      s += L.R(200, 58, 18, 16, '#3A3F63') + L.R(240, 82, 18, 16, '#3A3F63') + ln('M209 74V112', C.am, 3) + ln('M249 98V112', C.ind, 3);
      s += L.R(170, 110, 120, 124, '#1A1C33', ' rx="6"') + L.R(180, 118, 100, 14, C.am, ' rx="2"') + L.R(180, 136, 100, 14, C.am, ' rx="2"');
      for (var i = 0; i < 5; i++) s += L.R(180, 156 + i * 14, 100, 11, '#3A3F6E', ' rx="1.5"');
      s += ln('M286 124V226', C.am, 4) + co(280, 126, 320, 124, ['power shelves (AC → DC)', '电源架（交流→直流）']) + co(286, 200, 320, 200, ['DC busbar to the trays', '直流母排至托盘']);
      return svg(s + foot([c.R.el.bwA + ' A busway per row · A + B · tap-offs sized for the rack', '每排' + c.R.el.bwA + ' A母线 · A+B · 插接箱按机柜选型']));
    },
    /* ------------------------------------------------------------------ building, network, operations */
    hall: function () {
      var s = ttl(['Data hall plan (contained hot aisles)', '数据机房平面（热通道封闭）']);
      s += L.R(20, 36, 490, 206, '#F7F8FD', ' rx="4" stroke="#17153F" stroke-opacity=".35"') + L.R(26, 46, 18, 186, C.cyD, ' rx="3"') + tx(54, 238, ['fan walls', '风墙'], 'start', 'font-weight:700');
      [70, 150].forEach(function (y) {
        s += L.R(70, y - 18, 340, 16, 'rgba(14,165,198,.15)') + L.R(70, y, 340, 14, '#2B2E4E') + L.R(70, y + 14, 340, 24, 'rgba(229,83,75,.18)', ' stroke="#E5534B" stroke-dasharray="4 3"') + L.R(70, y + 38, 340, 14, '#2B2E4E') + ln('M70 ' + (y + 26) + 'H410', C.am, 2, '6 4');
        s += tx(240, y + 30, ['hot aisle (contained)', '热通道（封闭）'], 'middle', 'font-weight:700;fill:#B0302A');
      });
      s += tx(240, 62, ['cold aisle', '冷通道'], 'middle', 'font-weight:700;fill:#0B7F99') + L.R(430, 46, 72, 60, '#ECECFB', ' stroke="#3F3CBB"') + txb(466, 80, 'MMR', 'middle', C.ind);
      return svg(s);
    },
    mmr: function () {
      var s = ttl(['Diverse carrier entry to the meet-me room', '运营商多路由进入运营商交汇间']);
      s += L.R(150, 40, 360, 200, '#F7F8FD', ' rx="4" stroke="#17153F" stroke-opacity=".35"') + bx(10, 46, 110, 34, C.cy, ['Carrier 1', '运营商1']) + bx(10, 196, 110, 34, C.cy, ['Carrier 2', '运营商2']);
      s += ln('M120 63H170', C.ind, 3, '5 4') + ln('M120 213H170', C.ind, 3, '5 4') + bx(160, 50, 84, 34, '#5D6280', ['Entrance A', '进线间A']) + bx(160, 192, 84, 34, '#5D6280', ['Entrance B', '进线间B']);
      s += ar('M244 67H272V112H288', C.ind) + ar('M244 209H272V164H288', C.ind) + bx(290, 104, 110, 66, C.ind, 'MMR', ['cross-connects', '交叉连接']) + ar('M400 137H420', C.ind) + bx(422, 104, 80, 66, C.indD, 'MDA', ['→ halls', '→ 机房']);
      return svg(s + foot(['≥ 2 diverse routes kept well apart; carrier-neutral cross-connects.', '≥2条不同路由且充分分开；运营商中立的交叉连接。']));
    },
    bldg: function (c) {
      var sp = c.R.sp, s = ttl(['Building section', '建筑剖面']);
      s += L.R(10, 222, 510, 8, '#C9CDE0') + L.R(60, 70, 300, 152, '#F4F5FA', ' stroke="#17153F" stroke-opacity=".35"') + ln('M60 120H360M60 172H360', '#B9BED2', 2);
      s += tx(210, 100, ['Data halls · level 2', '数据机房 · 2层'], 'middle', 'font-weight:700') + tx(210, 152, ['Data halls · level 1', '数据机房 · 1层'], 'middle', 'font-weight:700') + tx(210, 204, ['Electrical rooms · UPS · batteries · dock', '电气室 · UPS · 电池 · 卸货区'], 'middle', 'font-weight:700');
      s += L.coolingTower(90, 44, 50, 26, false) + L.coolingTower(150, 44, 50, 26, false) + L.chiller(230, 46, 100, 24) + tx(338, 64, ['roof plant', '屋面设备'], 'start', 'font-weight:700');
      s += L.genset(380, 176, 120, 46) + L.powerTx(400, 222, .45) + tx(450, 160, ['yards', '室外场地'], 'middle', 'font-weight:700');
      return svg(s + foot([F(sp.gfa) + ' m² GFA · ' + c.p.floors + ' storey(s) · floor ≥ ' + sp.floorLoad + ' kN/m² · clear height ' + sp.clearH, '建筑面积' + F(sp.gfa) + ' m² · ' + c.p.floors + '层 · 楼面≥' + sp.floorLoad + ' kN/m² · 净高' + sp.clearHzh]));
    },
    ops: function () {
      var s = ttl(['Commissioning levels L1–L5', '调试等级L1–L5']), cols = ['#B9BCE6', '#8F8CE0', '#6E6BE0', '#3F3CBB', '#2A2785'];
      var nm = [['Factory tests', '工厂测试'], ['Delivery & install', '到货与安装'], ['Start-up', '启动调试'], ['Functional tests', '功能测试'], ['Integrated test', '综合测试']];
      DB.cxLevels.slice(0, 5).forEach(function (lv, i) {
        var x = 20 + i * 100, h = 60 + i * 32, y = 236 - h;
        s += L.R(x, y, 94, h, cols[i], ' rx="6"') + txw(x + 47, y + 24, lv[0], 'middle', 15) + txw(x + 47, y + 44, nm[i], 'middle', 10.5);
      });
      return svg(s + tx(20, 48, ['Each level must pass before the next one starts.', '每一级通过后方可进入下一级。'], 'start', 'font-weight:700'));
    },
    fence: function () {
      var s = ttl(['Perimeter: fence, intrusion detection, cameras', '周界：围栏、入侵探测与摄像机']);
      s += L.R(10, 200, 510, 30, '#E7E1D3') + L.fence(20, 200, 440, 110) + L.R(470, 70, 6, 130, '#5E6484') + L.camera(476, 76, 1.3, true);
      [['Z1', 90], ['Z2', 240], ['Z3', 390]].forEach(function (z) { s += bx(z[1] - 18, 214, 36, 18, C.co, z[0]); });
      s += tx(240, 72, ['anti-climb mesh · sensor cable on the fence', '防攀爬网 · 围栏感应线缆'], 'middle', 'font-weight:700');
      return svg(s + foot(['Every alarm zone is verified on video before guards respond.', '每个报警防区先经视频确认再由保安响应。']));
    },
    gate: function () {
      var s = ttl(['Vehicle entrance: guardhouse, barrier, bollards', '车辆入口：门卫室、道闸、防撞柱']);
      s += L.R(10, 210, 510, 20, '#D5D8E6') + L.building(30, 140, 120, 70, '#5D6280') + L.barrier(180, 210, 170) + L.bollards(380, 210, 7);
      s += tx(90, 236, ['guardhouse · ID check', '门卫室 · 身份核验'], 'middle', 'font-weight:700') + tx(270, 236, ['barrier', '道闸'], 'middle', 'font-weight:700') + tx(430, 236, ['crash-rated bollards', '防冲撞柱'], 'middle', 'font-weight:700');
      return svg(s + foot(['Crash rating per ASTM F2656 / IWA 14; delivery bookings and vehicle search.', '防冲撞等级按ASTM F2656/IWA 14；送货预约及车辆检查。']));
    },
    mantrap: function () {
      var s = ttl(['Mantrap sequence', '防尾随门工作顺序']), st = [['Badge + biometric', '刷卡+生物识别'], ['Door 1 locks', '1号门锁闭'], ['One person verified', '确认仅一人'], ['Door 2 opens', '2号门开启']];
      s += L.R(150, 46, 230, 90, '#F7F8FD', ' stroke="#17153F" stroke-opacity=".35"') + L.R(146, 66, 8, 50, C.co) + L.R(376, 66, 8, 50, C.gr) + '<circle cx="265" cy="80" r="11" fill="' + C.ind + '"/>' + L.R(254, 92, 22, 32, C.ind, ' rx="8"') + L.reader(120, 72);
      st.forEach(function (x, i) { s += bx(14 + i * 128, 160, 118, 56, i === 3 ? C.gr : C.ind, String(i + 1), x) ; if (i < 3) s += ar('M' + (132 + i * 128) + ' 188H' + (140 + i * 128), C.sl); });
      return svg(s + foot(['Every entry is logged and linked to video.', '每次进入均记录并联动视频。']));
    },
    access: function (c) {
      var s = ttl(['Two-factor access control', '双因素门禁']);
      s += L.R(30, 50, 90, 180, '#E9EBF4', ' rx="3" stroke="#5E6484" stroke-width="2"') + '<g transform="translate(132,100) scale(2)">' + L.reader(0, 0) + '</g>';
      s += ar('M172 120H218', C.sl) + bx(220, 100, 120, 42, C.deep, ['Door controller', '门禁控制器']) + ar('M340 121H378', C.sl) + bx(380, 100, 130, 42, C.ind, ['Access server', '门禁服务器'], ['rights · logs', '权限 · 日志']);
      s += bx(380, 170, 130, 36, C.sl, ['CCTV event link', '视频联动']) + ln('M445 142V170', C.sl, 2);
      s += tx(165, 210, ['card + fingerprint / PIN', '卡+指纹/密码'], 'middle', 'font-weight:700');
      return svg(s + foot(['≈ ' + F(c.R.fs.readers) + ' controlled doors · least privilege · two-person rule for critical rooms', '约' + F(c.R.fs.readers) + '个门禁点 · 最小授权 · 关键房间双人规则']));
    },
    cctv: function (c) {
      var n = c.R.fs.cams, tb = n * 4 * 86400 / 8 / 1e6 * 90 * 1.25, s = ttl(['Camera coverage and recording', '摄像机覆盖与录像']);
      s += L.R(30, 46, 310, 180, '#F7F8FD', ' rx="4" stroke="#17153F" stroke-opacity=".35"') + L.R(30, 120, 310, 30, '#ECEEF7');
      [[38, 54, 1], [332, 54, 1], [38, 218, 1], [332, 218, 1], [185, 136, 0]].forEach(function (p) {
        var a0 = p[2] ? Math.atan2(136 - p[1], 185 - p[0]) : 0, cone = function (a, sp, r) { return '<path d="M' + p[0] + ' ' + p[1] + 'L' + f1(p[0] + r * Math.cos(a - sp)) + ' ' + f1(p[1] + r * Math.sin(a - sp)) + 'A' + r + ' ' + r + ' 0 0 1 ' + f1(p[0] + r * Math.cos(a + sp)) + ' ' + f1(p[1] + r * Math.sin(a + sp)) + 'Z" fill="#5BD0E8" opacity=".18"/>'; };
        s += p[2] ? cone(a0, .42, 150) : cone(Math.PI / 2, .5, 70) + cone(-Math.PI / 2, .5, 70);
        s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="6" fill="' + C.deep + '"/>';
      });
      s += L.R(390, 50, 120, 176, '#2B2E4E', ' rx="4"');
      for (var i = 0; i < 8; i++) s += L.R(400, 60 + i * 20, 100, 14, '#3A3F6E', ' rx="2"') + '<circle cx="490" cy="' + (67 + i * 20) + '" r="2" fill="#5BE0B0"/>';
      s += tx(450, 42, ['recorders', '录像机'], 'middle', 'font-weight:700');
      return svg(s + foot(['≈ ' + F(n) + ' cameras × 4 Mbps × 90 days ≈ ' + F(tb) + ' TB incl. RAID', '约' + F(n) + '台 × 4 Mbps × 90天 ≈ ' + F(tb) + ' TB（含RAID）']));
    },
    preact: function () {
      var s = ttl(['Pre-action sprinkler: double interlock', '预作用喷淋：双重连锁']);
      [[['1 · Normal: pipes hold air', '1 · 平时：管内为空气'], '#C9CDE0', false], [['2 · Alarm: valve opens, pipes fill', '2 · 报警：阀开启，管道充水'], '#2F8FD0', false], [['3 · Head opens: water only there', '3 · 喷头开启：仅该处出水'], '#2F8FD0', true]].forEach(function (st, i) {
        var y = 52 + i * 68;
        s += ln('M30 ' + y + 'H270', st[1], 6) + L.R(290, y - 20, 230, 40, i === 2 ? C.co : (i ? C.ind : C.sl), ' rx="8"') + L.text(405, y + 4, st[0], 'tc-lw', ' text-anchor="middle" style="font-size:11px"');
        for (var k = 0; k < 5; k++) { var x = 50 + k * 52; s += L.R(x - 1.5, y, 3, 8, '#8E95AE') + ln('M' + (x - 5) + ' ' + (y + 10) + 'h10', '#8E95AE', 2); }
        if (st[2]) s += L.bubbles(146, y + 12, 16, 40, 6, 9, '#2F8FD0', .9, true, 1.5, 2.5);
      });
      return svg(s + foot(['A damaged head alone does not flood the hall.', '仅喷头损坏不会导致机房进水。']));
    },
    fap: function () {
      var s = ttl(['Fire alarm: cause-and-effect matrix', '火灾报警：联动矩阵']);
      [['Smoke detectors', '感烟探测器'], ['Aspirating (ASD)', '吸气式探测'], ['Manual call points', '手动报警按钮'], ['Gas / sprinkler status', '气体/喷淋状态']].forEach(function (x, i) { s += bx(10, 44 + i * 46, 140, 36, C.sl, x) + ar('M150 ' + (62 + i * 46) + 'H200', C.sl); });
      s += L.firePanel(204, 70, 100, 140) + tx(254, 228, ['fire alarm panel', '火灾报警控制器'], 'middle', 'font-weight:700');
      [['Release gas (after delay)', '释放气体（延时）'], ['Close dampers', '关闭风阀'], ['Stop air handlers', '停空调机组'], ['Release doors', '释放门禁'], ['Alarm to NOC & Damkar', '报警至NOC及消防']].forEach(function (x, i) { s += ar('M304 ' + (140) + 'L' + 360 + ' ' + (52 + i * 40), C.co, 1.6) + bx(362, 36 + i * 40, 156, 32, i ? C.coD : C.co, x); });
      return svg(s);
    },
    liion: function () {
      var s = ttl(['Lithium-ion thermal runaway: detect early', '锂电热失控：尽早探测']), st = [['Abuse', '滥用'], ['heat · overcharge', '过热·过充'], '#F2C46A'], st2 = [['Off-gas', '气体逸出'], ['detect · isolate', '探测·隔离'], '#E39B1B'], st3 = [['Smoke', '冒烟'], ['ASD alarm', '吸气式报警'], '#E5534B'], st4 = [['Fire', '起火'], ['suppression', '灭火'], '#8E1F1A'];
      [st, st2, st3, st4].forEach(function (x, i) { s += bx(14 + i * 128, 70, 116, 70, x[2], x[0], x[1]); if (i < 3) s += ar('M' + (130 + i * 128) + ' 105H' + (140 + i * 128), C.sl); });
      s += ar('M72 180H458', C.sl) + tx(265, 172, ['minutes', '数分钟'], 'middle', 'font-weight:700') + bx(140, 196, 250, 34, C.gr, ['Best point to act: off-gas detection', '最佳处置时机：逸出气体探测']);
      return svg(s + foot(['Separation and suppression per NFPA 855 and UL 9540A test data.', '间距与灭火依据NFPA 855及UL 9540A试验数据。']));
    },
    firepump: function () {
      var s = ttl(['Fire water: reservoir and pumps', '消防水：水池与水泵']);
      s += L.tankBox(20, 120, 160, 100, 16, 'tcWater', .8) + tx(100, 240, ['fire-water reservoir', '消防水池'], 'middle', 'font-weight:700');
      s += L.pump(210, 220, .9, '#C93A33') + L.pump(300, 220, .9, '#C93A33') + L.pump(390, 220, .6, '#C93A33') + tx(243, 240, ['electric', '电动泵'], 'middle', 'font-weight:700') + tx(333, 240, ['diesel', '柴油泵'], 'middle', 'font-weight:700') + tx(412, 240, ['jockey', '稳压泵'], 'middle', 'font-weight:700');
      s += L.pipe('M180 150H500', 'fire', 6) + ln('M226 176V150M316 176V150M402 192V150', '#C93A33', 4) + bx(420, 70, 96, 36, C.co, ['Hydrants', '消火栓']) + bx(310, 70, 100, 36, C.coD, ['Sprinklers', '喷淋系统']) + ln('M468 106V150M360 106V150', '#C93A33', 4);
      return svg(s);
    },
    dcim: function (c) { return arch({ title: ['DCIM: one model of assets, space, power and cooling', 'DCIM：资产、空间、电力与制冷的统一模型'], devices: [['BMS', 'BMS'], ['EPMS', 'EPMS'], ['Rack PDUs', '机柜PDU'], ['Sensors', '传感器'], ['Assets', '资产']], bus: 'BACnet · Modbus · SNMP · API', mid: ['Integration & data model', '集成与数据模型'], top: ['DCIM', 'DCIM'], topSub: ['capacity · PUE · change planning', '容量 · PUE · 变更规划'], side: ['NOC', 'NOC'], foot: ['≈ ' + F(c.R.fs.bmsPts) + ' BMS points · ≈ ' + F(c.R.fs.meters) + ' meters · ' + F(c.R.cap.racks) + ' racks', '约' + F(c.R.fs.bmsPts) + '个BMS点 · 约' + F(c.R.fs.meters) + '块电表 · ' + F(c.R.cap.racks) + '个机柜'] }); },
    noc: function (c) {
      var s = ttl(['24/7 network & operations centre', '7×24网络运营中心']) + L.nocWall(130, 40, 270, 190);
      [['BMS', 30, 70], ['EPMS', 30, 130], ['DCIM', 30, 190], [['Fire', '消防'], 430, 70], [['Security', '安防'], 430, 130], [['Leaks', '漏水'], 430, 190]].forEach(function (x) { s += bx(x[1], x[2] - 18, 76, 30, x[1] < 100 ? C.ind : C.co, x[0]) + ln(x[1] < 100 ? 'M106 ' + (x[2] - 3) + 'H130' : 'M400 ' + (x[2] - 3) + 'H430', C.sl, 2); });
      return svg(s + foot([c.R.staff.fte + ' FTE in 24/7 shifts · emergency procedures (EOP) for every alarm', '7×24轮班共' + c.R.staff.fte + '人 · 每类报警均有应急程序（EOP）']));
    },
    firezone: function () {
      var s = ttl(['Fire protection chain', '消防链条']), st = [[['Detect', '探测'], ['aspirating + point', '吸气式+点型'], C.am], [['Decide', '判断'], ['fire alarm panel', '火灾报警控制器'], C.co], [['Suppress', '灭火'], ['gas or pre-action', '气体或预作用'], C.coD], [['Notify', '通知'], ['NOC · Damkar', 'NOC · 消防局'], C.ind]];
      st.forEach(function (x, i) { s += bx(14 + i * 128, 90, 116, 76, x[2], x[0], x[1]); if (i < 3) s += ar('M' + (130 + i * 128) + ' 128H' + (140 + i * 128), C.sl); });
      return svg(s + foot(['Lithium-ion rooms add off-gas detection; leak detection protects liquid-cooled halls.', '锂电池室增设逸出气体探测；漏水检测保护液冷机房。']));
    }
  };
  /* aliases and theory visuals */
  IV.secsite = function (c) { return X.IV.layers(c); };
  IV.monzone = IV.dcim; IV.trim = function () { return X.IV.chiller(); }; IV.resair = IV.crah; IV.battu = IV.batt; IV.fuelsys = IV.fuel; IV.cwp = IV.pumps; IV.chwp = IV.pumps;
  IV.ups = function () { return X.IV.ups(); }; IV.chiller = function () { return X.IV.chiller(); }; IV.aisle = function () { return X.IV.aisle(); }; IV.gpu = function () { return X.IV.coldplate(); };
  IV.cdu = function () { return X.IV.cdu(); }; IV.vesda = function () { return X.IV.vesda(); }; IV.agent = function () { return X.IV.agent(); };
  function mvaChain(c) {
    var el = c.R.el, it = c.R.cap.itKW, cool = it * (c.R.eff.puePeak - 1), oth = el.demandKW - it - cool, mx = el.demandKVA, s = ttl(['From IT load to the PLN connection', '从IT负载到PLN接入']);
    [[['IT load', 'IT负载'], it, C.ind], [['+ cooling (design day)', '+ 制冷（设计日）'], cool, C.cy], [['+ UPS losses & building', '+ UPS损耗及建筑'], oth, C.am], [['= maximum demand (kW)', '= 最大需量（kW）'], el.demandKW, C.deep], [['÷ PF ' + K.PF + ' → kVA', '÷ 功率因数' + K.PF + ' → kVA'], el.demandKVA, C.indD]].forEach(function (b, i) {
      var y = 44 + i * 38, w = Math.max(4, b[1] / mx * 250);
      s += tx(14, y + 16, b[0], 'start', 'font-weight:700') + L.R(196, y, w, 22, b[2], ' rx="5"') + txb(200 + w, y + 16, F(b[1]), 'start');
    });
    return svg(s + foot([F(el.mva, 1) + ' MVA · ' + t(el.volt), F(el.mva, 1) + ' MVA · ' + el.volt[1]]));
  }
  function spaceBars(c) {
    var sp = c.R.sp, mx = Math.max(sp.ws, sp.elecRoom, sp.mechRoom, sp.support), s = ttl(['Where the floor area goes', '建筑面积构成']);
    [[['White space', '白区'], sp.ws, C.ind], [['Electrical rooms', '电气房间'], sp.elecRoom, C.am], [['Mechanical rooms', '暖通机房'], sp.mechRoom, C.cy], [['Support areas', '辅助区'], sp.support, C.sl]].forEach(function (b, i) {
      var y = 50 + i * 40, w = Math.max(4, b[1] / mx * 300);
      s += tx(14, y + 16, b[0], 'start', 'font-weight:700') + L.R(160, y, w, 24, b[2], ' rx="5"') + txb(164 + w, y + 17, F(b[1]) + ' m²', 'start');
    });
    return svg(s + foot([F(sp.gfa) + ' m² GFA · site ≈ ' + F(sp.siteNeed / 1e4, 2) + ' ha', '建筑面积' + F(sp.gfa) + ' m² · 用地约' + F(sp.siteNeed / 1e4, 2) + ' ha']));
  }
  function apprLadder(c) {
    var db = c.R.L.db, fws = db + 7, tcs = fws + 3, sc = function (v) { return 230 - (v - 15) * 5.2; }, s = ttl(['Temperature ladder: outdoor air to the chips', '温度阶梯：从室外空气到芯片']);
    s += ln('M60 ' + sc(15) + 'V' + sc(50), C.sl, 2);
    [17, 27, 32, 40, 45].forEach(function (w) { s += ln('M56 ' + sc(w) + 'H64', C.sl, 2) + tx(52, sc(w) + 4, 'W' + w, 'end', 'font-weight:700'); });
    [[['Outdoor dry-bulb', '室外干球'], db, C.cy], [['Facility water (+7 K)', '设施水（+7 K）'], fws, C.ind], [['Rack supply (+3 K)', '至机柜供液（+3 K）'], tcs, C.co]].forEach(function (p, i) {
      var y = sc(p[1]), x = 120 + i * 130;
      s += L.R(x, y, 110, 230 - y, p[2], ' rx="6" opacity=".85"') + txw(x + 55, y + 22, F(p[1], 1) + ' °C', 'middle', 15) + tx(x + 55, 248, p[0], 'middle', 'font-weight:700');
    });
    return svg(s);
  }
  var THV = { mva: mvaChain, space: spaceBars, appr: apprLadder, wue: IV.tower, tes: IV.tes, bwy: IV.bwy, bess: IV.bess, cctv: IV.cctv, points: IV.bms, floor: IV.floor, liion: IV.liion, chw: IV.chiller, flow: IV.gpu, cdu: IV.cdu };
  Object.keys(THV).forEach(function (k) { if (X.TH[k] && !X.TH[k].visual) X.TH[k].visual = THV[k]; });
  Object.keys(X.U).forEach(function (k) { X.U[k].k = k; });
  function generic(u, c) {
    var q = u.eq ? E.find(DB.equipment, u.eq) : null, s = ttl(u.name || (q ? [q.en, q.zh] : u.id));
    s += '<g transform="translate(205,50) scale(5)">' + L.IC.grid + '</g>';
    return svg(s + (q ? foot(q.ty) : ''));
  }
  TC.setIllustrator(function (u, c) { var fn = IV[u.k] || IV[u.id]; try { return fn ? fn(c, u) : generic(u, c); } catch (err) { if (g.console) console.warn("tc-ill", u.id, err); return generic(u, c); } });
  X.IV2 = IV;
})(window);
