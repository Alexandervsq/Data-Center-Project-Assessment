/* Technology card: Data Center Facility (whole-system integration card). */
(function (g) {
  'use strict';
  var TC = g.TC, L = TC.lib, X = g.TCX, DB = g.DCDB, F = L.F, t = L.t;
  function U(k, o) { return Object.assign({}, X.U[k], o || {}); }
  var PWR = { card: 'PWR', label: ['Critical power', '关键供电'] }, CHW = { card: 'CHW', label: ['Chilled-water cooling', '冷冻水风冷'] }, DLC = { card: 'DLC', label: ['Direct liquid cooling', '冷板液冷'] }, FSM = { card: 'FSM', label: ['Fire · security · monitoring', '消防·安防·监控'] };
  var UNITS = [
    U('grid', { id: 'grid', no: '01', rel: [PWR, ['mva', ['From IT load to PLN demand', '从IT负载到PLN需量']]] }),
    U('tx', { id: 'tx', no: '02', name: ['MV switchgear & transformers', '中压开关柜与变压器'], more: ['EL-01', 'EL-15'], rel: [PWR, ['tier', ['Redundancy', '冗余']]] }),
    U('lv', { id: 'lv', no: '03', rel: [PWR] }),
    U('gen', { id: 'gen', no: '04', rel: [PWR, ['fuel', ['Fuel', '燃油']]] }),
    U('ups', { id: 'ups', no: '05', more: ['EL-10', 'EL-11', 'EL-13', 'EL-14'], rel: [PWR, ['tier', ['Redundancy', '冗余']]] }),
    U('secsite', { id: 'secsite', no: '06', rel: [FSM] }),
    U('hall', { id: 'hall', no: '07', rel: [CHW, DLC, ['dens', ['Rack density', '机柜密度']]] }),
    U('crah', { id: 'crah', no: '08', rel: [CHW] }),
    U('chiller', { id: 'chiller', no: '09', rel: [CHW, ['pue', ['PUE', 'PUE']]] }),
    U('tower', { id: 'tower', no: '10', rel: [CHW] }),
    U('mmr', { id: 'mmr', no: '11', rel: [['hall', ['White space', '白区']]] }),
    U('fuel', { id: 'fuel', no: 'A', rel: [PWR, ['fuel', ['Fuel autonomy', '燃油自持']]] }),
    U('firezone', { id: 'firezone', no: 'B', rel: [FSM] }),
    U('monzone', { id: 'monzone', no: 'C', rel: [FSM] }),
    U('bldg', { id: 'bldg', no: 'D', rel: [['space', ['Space & site', '空间与场地']]] }),
    U('ops', { id: 'ops', no: 'E', rel: [['tier', ['Availability', '可用性']]] })
  ];
  var FAQ = [
    [['What is the difference between Tier III and Tier IV?', 'Tier III与Tier IV有何区别？'], ['Tier III (99.982 %) lets any component be maintained without shutting down the IT (N+1 with two distribution paths). Tier IV (99.995 %) also survives any single failure automatically — typically 2N power and compartmentalised plant, at ≈ 25–30 % higher CAPEX in the assessment engine.', 'Tier III（99.982%）允许任一组件维护而不中断IT（N+1及两条配电路径）。Tier IV（99.995%）还可自动承受任何单点故障——通常为2N供电及分隔的设备区，评估引擎中投资约高25–30%。']],
    [['What PUE can a data center reach in Indonesia?', '在印尼数据中心PUE可以做到多少？'], ['With water-cooled chillers, containment and elevated water temperatures ≈ 1.35–1.45; with direct liquid cooling for AI racks ≈ 1.15–1.25. The humid climate (wet-bulb ≈ 27–28 °C) limits free cooling, so values below ≈ 1.3 need liquid cooling or a highland site.', '采用水冷冷机、通道封闭及提高水温约1.35–1.45；AI机柜采用冷板液冷约1.15–1.25。湿热气候（湿球约27–28 °C）限制自然冷却，低于约1.3需采用液冷或高原站点。']],
    [['How much land does a 10 MW data center need?', '10 MW数据中心需要多少用地？'], ['Roughly 0.5–1 ha for a multi-storey Tier III building with yards for generators, transformers and cooling; low-rise AI campuses need several times more. The engine estimates it from racks, plant rooms, yards and the site-coverage rule (KDB).', '多层Tier III建筑加发电机、变压器及冷却设备场地约需0.5–1 ha；低层AI园区需数倍用地。评估引擎根据机柜、设备房、室外场地及建筑密度（KDB）估算。']],
    [['How long does it take to build?', '建设需要多长时间？'], ['From feasibility to ready-for-service ≈ 2–3 years for 5–30 MW. The PLN high-voltage connection and long-lead equipment (transformers, generators, switchgear: 12–24 months) usually set the critical path.', '从可研到投产，5–30 MW约需2–3年。PLN高压接入及长周期设备（变压器、发电机、开关柜：12–24个月）通常决定关键路径。']],
    [['Why two power paths to every rack?', '为什么每个机柜需要两路供电？'], ['Dual-corded servers take power from an A and a B path, so one path can be maintained or fail without stopping the IT — the basis of Tier III and IV designs.', '双电源服务器分别从A、B两路取电，一路维护或故障时IT不中断——这是Tier III与IV设计的基础。']],
    [['Which permits are needed in Indonesia?', '在印尼需要哪些许可？'], ['OSS-RBA business licence (PP 28/2025, KBLI 63102), spatial conformity (KKPR), environmental approval (AMDAL or UKL-UPL), building approval PBG and certificate SLF, PLN connection with SLO, and PSE registration for the operator.', 'OSS-RBA经营许可（PP 28/2025，KBLI 63102）、空间用途符合性（KKPR）、环境审批（AMDAL或UKL-UPL）、建筑审批PBG及使用证书SLF、PLN接入及SLO，以及运营方PSE登记。']],
    [['Can the same building host AI racks later?', '同一建筑以后能否承载AI机柜？'], ['Only if it is prepared: floor load ≥ 20–25 kN/m², more clear height, space and pipe routes for CDUs and facility water, and more electrical capacity per hall. Retrofitting liquid cooling into a hall designed for 10 kW racks is expensive.', '只有预先考虑才行：楼面荷载≥20–25 kN/m²、更高净高、CDU及设施水的空间与管路，以及更大的单机房电力容量。将液冷改造进按10 kW机柜设计的机房代价高昂。']]
  ];

  function band() {
    var s = L.R(0, 513, 1470, 107, 'url(#tcDuct)');
    [538, 566, 594].forEach(function (y, i) { s += '<path d="M0 ' + y + 'H1470" stroke="#3A3780" stroke-width="7" stroke-linecap="round"/><path class="tc-flow' + (i === 1 ? ' tc-slow' : '') + '" d="M0 ' + y + 'H1470" stroke="#7CE3F6" stroke-width="2" stroke-dasharray="6 26"/>'; });
    return s + L.text(735, 610, ['Underground: diverse fibre duct banks to the carriers · earthing grid', '地下：通往运营商的多路由光纤管群 · 接地网'], 'tc-lw', ' text-anchor="middle" style="font-size:12.5px;opacity:.9"');
  }
  function pfd(c) {
    var R = c.R, el = R.el, me = R.me, cap = R.cap, o = '';
    o += L.ground(132, 232, 1330) + L.R(132, 242, 1330, 40, 'url(#tcSoil)', ' opacity=".5"') + L.R(0, 497, 1470, 16, 'url(#tcGround)') + band();
    /* power lines (cable trench) */
    o += L.pipe('M165 205H190', 'mv', 6) + L.pipe('M286 200H300', 'mv', 6) + L.pipe('M378 205H420', 'lv', 6) + L.pipe('M590 205H520', 'gen', 6);
    o += L.pipe('M505 232V277H806V232', 'lv', 5) + L.pipe('M990 205H1010V266H1462V390H1440', 'lv', 6);
    o += '<path d="M22 112Q62 126 101 146M74 112Q92 124 117 146M48 96Q80 118 133 146" fill="none" stroke="#D58A12" stroke-width="1.6"/>';
    o += L.thin('M666 250V232', 'fuel', 3, '4 4');
    /* cooling */
    o += L.pipe('M850 470H920', 'chws', 6) + L.pipe('M920 432H850', 'chwr', 6) + L.pipe('M660 446H604', 'cwr', 6, true, true) + L.pipe('M604 484H660', 'cws', 6, true, true);
    o += L.air('M1002 484H1062', false, 4) + L.air('M1062 414H1004', true, 4);
    o += L.thin('M232 513V498', 'data', 3, '3 4') + L.thin('M1246 513V498', 'data', 3, '3 4');
    /* banners */
    o += L.banner(140, 0, 1310, ['① POWER PATH · 供电路径', '① 供电路径 · POWER PATH'], ['PLN → transformers → generators → UPS: two independent paths to every rack', 'PLN → 变压器 → 发电机 → UPS：每个机柜两条独立路径'], null, 'tcZone3');
    o += L.banner(1030, 290, 430, ['② WHITE SPACE · 白区', '② 白区 · WHITE SPACE'], ['racks · busway · containment', '机柜·母线·封闭'], null, 'tcZone');
    o += L.banner(410, 290, 600, ['③ COOLING · 制冷', '③ 制冷 · COOLING'], ['heat from the racks to the outdoor air', '将机柜热量排至室外'], null, 'tcZone2');
    o += L.banner(10, 290, 380, ['④ NETWORK · 网络', '④ 网络 · NETWORK'], ['carriers', '运营商'], null, 'tcZone5');
    /* row 1 */
    var g1 = L.pylon(48, 232, 150) + L.powerTx(78, 232, .9);
    o += L.hot('grid', UNITS[0].name, 14, 38, 160, 200, g1 + L.label(95, 60, '01', ['PLN grid', 'PLN电网'], el.vclass === 'TT' ? ['150 kV · ' + F(el.mva, 1) + ' MVA', '150 kV · ' + F(el.mva, 1) + ' MVA'] : ['20 kV · ' + F(el.mva, 1) + ' MVA', '20 kV · ' + F(el.mva, 1) + ' MVA']));
    o += L.hot('tx', UNITS[1].name, 184, 38, 200, 200, L.switchgear(190, 150, 4, 96, 82) + L.dryTx(300, 140, 78, 92) + L.label(280, 60, '02', ['MV & transformers', '中压与变压器'], el.txTotal + ' × ' + F(el.txSize) + ' kVA'));
    o += L.hot('lv', ['LV switchboards', '低压配电柜'], 388, 38, 176, 200, L.lvBoard(420, 150, 4, 100, 82) + L.label(474, 60, '03', ['LV switchboards', '低压配电'], [el.txTotal + ' line-ups', el.txTotal + '组']));
    o += L.hot('gen', ['Generators', '发电机'], 584, 38, 184, 200, L.genset(590, 160, 170, 72) + L.label(675, 60, '04', ['Generators', '发电机'], el.genTotal + ' × ' + F(el.genSize) + ' kWe · ' + c.p.fuelH + ' h'));
    o += L.hot('ups', ['UPS & batteries', 'UPS与电池'], 796, 38, 200, 200, L.upsCab(800, 130, 3, 96, 102) + L.battRack(906, 140, 3, 84, 92, c.p.battery === 'LI') + L.label(895, 60, '05', ['UPS & batteries', 'UPS与电池'], el.upsTotal + ' × ' + F(el.upsSize) + ' kW · ' + c.p.upsMin + ' min'));
    var sec = L.fence(1046, 232, 150, 44) + L.building(1206, 186, 72, 46, '#5D6280') + L.barrier(1290, 232, 64) + L.camera(1232, 150, 1, false) + L.bollards(1380, 232, 4) + L.camera(1060, 172, .9, false, false);
    o += L.hot('secsite', UNITS[5].name, 1040, 38, 420, 200, sec + L.label(1222, 60, '06', ['Site security', '场地安防'], [R.fs.securityLayers + ' layers · ' + F(R.fs.cams) + ' cameras', R.fs.securityLayers + '道防线 · ' + F(R.fs.cams) + '台摄像机']));
    o += L.hot('fuel', UNITS[11].name, 596, 244, 150, 36, L.fuelTank(600, 250, 132, 24) + L.text(748, 266, ['A · fuel', 'A · 燃油'], 'tc-lc'));
    /* row 2 */
    var hall = L.R(1046, 380, 400, 117, '#F7F8FD', ' rx="4" stroke="#C9CDE0"') + L.busway(1060, 386, 372, 9, 12) + L.R(1066, 424, 360, 9, 'url(#tcGlass)', ' rx="2" stroke="#7FC6DA"') + L.rackRow(1068, 434, 9, 36, 62, { blink: true });
    o += L.hot('hall', UNITS[6].name, 1040, 330, 412, 170, hall + L.label(1246, 352, '07', ['White space', '白区'], [F(cap.racks) + ' racks · ' + F(cap.avgDens, 1) + ' kW avg', F(cap.racks) + '个机柜 · 平均' + F(cap.avgDens, 1) + ' kW']));
    var tn = me.term ? (me.term.id === 'ME-10' ? ['In-row coolers', '列间空调'] : me.term.id === 'ME-07' ? ['CRAH units', '精密空调'] : ['Fan walls', '风墙']) : ['Precision AC', '精密空调'];
    o += L.hot('crah', tn, 880, 330, 160, 170, L.fanWall(920, 398, 80, 98, 2, 3, true) + L.label(960, 352, '08', tn, me.term ? (me.term.n + me.term.r) + ' × ' + me.term.size + ' kW' : (me.cracN ? (me.cracN + me.cracR) + ' × ' + me.cracSize + ' kW' : '–')));
    o += L.hot('chiller', ['Chillers', '冷水机组'], 650, 330, 214, 170, L.chiller(660, 418, 190, 80) + L.label(755, 352, '09', ['Chillers', '冷水机组'], me.chN ? (me.chN + me.chR) + ' × ' + F(me.chSize) + ' kW' : ['DX · no chillers', '直膨 · 无冷机']));
    o += L.hot('tower', ['Cooling towers', '冷却塔'], 420, 330, 190, 170, L.coolingTower(430, 442, 76, 56) + L.coolingTower(520, 442, 76, 56) + L.label(513, 352, '10', ['Cooling towers', '冷却塔'], me.ctN ? [(me.ctN + me.ctR) + ' cells · WUE ' + F(R.eff.wue, 2), (me.ctN + me.ctR) + '格 · WUE ' + F(R.eff.wue, 2)] : ['air / dry heat rejection', '风冷/干式散热']));
    var mmr = L.pylon(72, 498, 112) + '<ellipse cx="86" cy="408" rx="9" ry="13" fill="#E9EBF4" stroke="#5E6484" stroke-width="1.5"/>' + L.building(170, 440, 120, 58, '#3F3CBB') + L.R(196, 462, 18, 30, '#2B2E4E', ' rx="2"') + L.R(218, 462, 18, 30, '#2B2E4E', ' rx="2"');
    o += L.hot('mmr', UNITS[10].name, 30, 330, 290, 170, mmr + L.label(232, 352, '11', ['Network & MMR', '网络与MMR'], ['2 diverse fibre routes', '两条不同光纤路由']));
    o += L.text(1400, 372, ['A + B', 'A + B'], 'tc-ls', ' style="font-weight:800;fill:#B8740B"');
    return '<svg class="tc-pfd tc-abs" viewBox="0 0 1470 620" role="img" aria-label="' + L.te(['Data center process overview', '数据中心系统总览']) + '">' + o + '</svg>';
  }
  function principleSvg(c) {
    var e = c.R.eff, tot = 1 + e.mech + e.elec + e.misc, sc = 210 / tot, x = 110, o = '<svg viewBox="0 0 340 186" role="img" aria-label="PUE">';
    o += L.R(10, 26, 76, 40, '#E39B1B', ' rx="10"') + L.text(48, 51, 'PLN', 'tc-lw', ' text-anchor="middle" style="font-size:14px"') + L.arrowHead(106, 46, 'r', '#E39B1B', 9) + '<path d="M86 46H98" stroke="#E39B1B" stroke-width="4"/>';
    [[1, '#3F3CBB'], [e.mech, '#0EA5C6'], [e.elec, '#E39B1B'], [e.misc, '#5D6280']].forEach(function (p) { o += L.R(x, 28, p[0] * sc, 36, p[1]); x += p[0] * sc; });
    o += L.text(110 + 105 * (1 / tot) * 2 / 2, 51, 'IT 1.00', 'tc-lw', ' text-anchor="middle"') + L.text(326, 82, 'PUE ' + F(e.pue, 2), 'tc-lt', ' text-anchor="end" style="font-size:14px"');
    o += L.rack(28, 100, 46, 70, { blink: true }) + '<path d="M84 128c10-8 20 8 30 0s20 8 30 0s20 8 30 0" fill="none" stroke="#E5534B" stroke-width="3"/>' + L.arrowHead(186, 128, 'r', '#E5534B', 8);
    o += '<circle cx="222" cy="130" r="24" fill="#E2F5FA"/>' + '<g transform="translate(206,114) scale(1.35)">' + L.IC.snow + '</g>' + '<path d="M250 130H286" stroke="#0EA5C6" stroke-width="3" stroke-dasharray="5 4"/>' + L.arrowHead(296, 130, 'r', '#0EA5C6', 8);
    o += L.text(52, 184, ['IT → heat', 'IT → 热量'], 'tc-ls', ' text-anchor="middle" style="font-weight:700"') + L.text(222, 172, ['cooling', '制冷'], 'tc-ls', ' text-anchor="middle" style="font-weight:700"') + L.text(306, 152, ['outdoor', '室外'], 'tc-ls', ' text-anchor="middle" style="font-weight:700"');
    return o + '</svg>';
  }
  function right(c) {
    var R = c.R, roman = X.roman(c.p.tier);
    return L.principle('pue', 'gauge', ['Energy in, heat out', '能量输入，热量输出'], principleSvg(c), ['Every watt that reaches the IT becomes heat; cooling and losses decide how much more the facility draws — the PUE.', '到达IT的每一瓦都会变成热量；制冷与损耗决定设施需额外消耗多少电能——即PUE。']) +
      L.chips([['firezone', 'fire', ['Fire', '消防']], ['monzone', 'monitor', ['Monitoring', '监控']], ['bldg', 'building', ['Building', '建筑']], ['ops', 'clock', ['Operations', '运维']]]) +
      L.kpis([['pue', F(R.eff.pue, 2), '', ['Annual PUE', '年均PUE'], ['facility ÷ IT energy', '设施能耗÷IT能耗']],
        ['tier', F(R.cap.tier.avail, 3), '%', 'Tier ' + roman, ['availability target', '可用性目标']],
        ['dens', F(R.cap.avgDens, 1), 'kW', ['Average rack', '平均机柜'], [F(R.cap.racks) + ' racks', F(R.cap.racks) + '个机柜']],
        ['mva', F(R.el.mva, 1), 'MVA', ['PLN demand', 'PLN需量'], R.el.vclass === 'TT' ? ['150 kV connection', '150 kV接入'] : ['20 kV feeders', '20 kV馈线']]]);
  }
  function bottom(c) {
    var R = c.R, e = R.eff, sp = R.sp, h = '';
    h += L.tile(0, 'pue', 'gauge', ['Energy split', '能耗构成'], ['per kWh of IT', '每kWh IT'],
      L.miniBars([[['IT equipment', 'IT设备'], 1, '#3F3CBB', 2], [['Cooling', '制冷'], e.mech, '#0EA5C6', 3], [['Electrical losses', '电气损耗'], e.elec, '#E39B1B', 3], [['Lighting & other', '照明及其他'], e.misc, '#5D6280', 3]], 1, ' kWh') +
      L.note(['Total = PUE <b>' + F(e.pue, 2) + '</b>; a tropical wet-bulb of ≈ 28 °C limits free cooling.', '合计 = PUE <b>' + F(e.pue, 2) + '</b>；热带湿球约28 °C，自然冷却受限。']));
    h += L.tile(1, 'tier', 'shield', ['Tier & availability', '等级与可用性'], 'Tier ' + X.roman(c.p.tier),
      L.mtable([['Tier', '等级'], ['Red.', '冗余'], ['Avail.', '可用性'], ['Down/yr', '年停机']], DB.tiers.map(function (x) { return [X.roman(x.n), x.red, x.avail + ' %', x.down[0] + ' ' + x.down[1]]; }), c.p.tier - 1) +
      L.note(['Cross-referenced to TIA-942 and SNI 8799.', '与TIA-942及SNI 8799对照。']));
    var mx = Math.max(sp.ws, sp.elecRoom, sp.mechRoom, sp.support);
    h += L.tile(2, 'space', 'building', ['Building areas', '建筑面积'], [F(sp.gfa) + ' m² GFA', '总' + F(sp.gfa) + ' m²'],
      L.miniBars([[['White space', '白区'], sp.ws, '#3F3CBB'], [['Electrical rooms', '电气房间'], sp.elecRoom, '#E39B1B'], [['Mechanical', '暖通机房'], sp.mechRoom, '#0EA5C6'], [['Support', '辅助区'], sp.support, '#5D6280']], mx, ' m²') +
      L.note(['Site ≈ <b>' + F(sp.siteNeed / 1e4, 2) + ' ha</b> · ' + c.p.floors + ' storey(s) · floor ≥ ' + sp.floorLoad + ' kN/m²', '用地约<b>' + F(sp.siteNeed / 1e4, 2) + ' ha</b> · ' + c.p.floors + '层 · 楼面≥' + sp.floorLoad + ' kN/m²']));
    var refs = DB.references.filter(function (r) { return r.kind === 'real' && r.country === 'ID' && r.mw; }).sort(function (a, b) { return b.mw - a.mw; }).slice(0, 5), mxr = refs.length ? refs[0].mw : 1;
    h += L.tile(3, 'refs', 'pin', ['Projects in Indonesia', '印尼项目'], ['public data', '公开信息'],
      L.miniBars(refs.map(function (r) { return [[r.en.split(' — ')[0], r.zh.split('——')[0]], r.mw, '#2A2785']; }), mxr, ' MW') + L.note(['Announced campus capacity (MW IT); ' + DB.references.filter(function (r) { return r.kind === 'real'; }).length + ' real projects in the database.', '公开宣布的园区容量（MW IT）；数据库共' + DB.references.filter(function (r) { return r.kind === 'real'; }).length + '个真实项目。']), '#FCE9E7');
    h += L.tile(4, 'faq', 'chat', ['Client questions', '客户问题'], [FAQ.length + ' answers', FAQ.length + '个解答'], '<div class="tc-qs">' + FAQ.slice(0, 4).map(function (q) { return '<span>' + L.te(q[0]) + '</span>'; }).join('') + '</div>', '#E2F5FA');
    return h;
  }
  function refsPanel(c) {
    var rows = DB.references.filter(function (r) { return r.kind === 'real'; }).sort(function (a, b) { return (a.country === 'ID' ? 0 : 1) - (b.country === 'ID' ? 0 : 1) || (b.mw || 0) - (a.mw || 0); }).map(function (r) {
      return ['<b>' + L.te([r.en, r.zh]) + '</b><br><span class="tc-src">' + L.te(r.loc) + '</span>', L.e(r.country), r.mw ? F(r.mw) + ' MW' : '–', L.te(r.facts[0]) + (r.src ? ' <a href="' + L.e(r.src) + '" target="_blank" rel="noopener">↗</a>' : '')];
    });
    return L.freePanel('refs', '★', ['Reference projects', '参考项目'], ['Public information from operators and trade press', '来自运营商及行业媒体的公开信息'],
      L.ptable([['Project', '项目'], ['Country', '国家'], ['Capacity', '容量'], ['Key fact', '要点']], rows) + '<div class="tc-rel"><button type="button" class="tc-ext" data-goassess>' + L.te(['Model a project in the assessment', '在项目评估中建模']) + ' →</button></div>', 'x');
  }
  var card = {
    id: 'DC', abbr: 'DC', title: ['Data Center Facility', '数据中心设施'], short: ['Data Center Facility', '数据中心设施'], icon: 'building',
    blurb: ['Whole system: power, white space, cooling, network, safety', '整体系统：供电、白区、制冷、网络、安全'], badge: ['Whole facility', '整体设施'], basis: 'A05', calc: X.CALC, units: UNITS, faq: FAQ,
    sources: [['Uptime Institute Tier Standard: Topology', 'Uptime Institute等级标准：拓扑'], 'ANSI/TIA-942-C', ['ASHRAE TC 9.9 thermal guidelines', 'ASHRAE TC 9.9温湿度指南'], ['SNI 8799 (BSN)', 'SNI 8799（BSN）'], ['Assessment engine and knowledge base of this website', '本网站评估引擎及知识库'], ['Operator announcements for reference projects', '参考项目运营商公告']],
    stage: function (c) {
      var R = c.R;
      card.tag = ['A <b>' + F(R.cap.itMW, 1) + ' MW</b> IT facility in ' + R.L.en + ' turns <b>' + F(R.el.mva, 1) + ' MVA</b> of PLN power into always-on compute: redundant power, precision cooling, layered security — PUE <b>' + F(R.eff.pue, 2) + '</b>.',
        '位于' + R.L.zh + '的<b>' + F(R.cap.itMW, 1) + ' MW</b> IT设施将<b>' + F(R.el.mva, 1) + ' MVA</b> PLN电力转化为不间断算力：冗余供电、精密制冷、分层安防——PUE <b>' + F(R.eff.pue, 2) + '</b>。'];
      return L.header(card) + pfd(c) + right(c) + bottom(c) +
        L.footer(['Indicative planning values for the selected design basis; detailed design follows site surveys, PLN studies and quotations.', '所选设计基准的规划参考值；详细设计须依据场地勘察、PLN研究及报价。'], [['basis', L.UI.basis], ['gloss', L.UI.gloss]]);
    },
    panels: function (c) {
      var P = UNITS.map(function (u) { return L.unitPanel(u, c); });
      ['pue', 'tier', 'dens', 'mva', 'space'].forEach(function (k, i) { P.push(L.theoryPanel(X.TH[k], 'T' + (i + 1), c)); });
      P.push(refsPanel(c)); P.push(L.faqPanel(card));
      return P;
    }
  };
  TC.register(card);
})(window);
