/* Technology card: Direct Liquid Cooling for AI racks (cold plates → manifolds → CDUs → facility water → dry coolers). */
(function (g) {
  'use strict';
  var TC = g.TC, L = TC.lib, X = g.TCX, DB = g.DCDB, E = g.DCEngine, K = E.K, F = L.F, t = L.t;
  var EXTRA = {
    aipow: { eq: 'EL-13', more: ['EL-14', 'EL-23'], name: ['Power for AI racks', 'AI机柜供电'],
      how: ['AI racks take power through OEM power shelves or a rack busbar fed from overhead busway: a 135 kW rack needs several 63 A three-phase feeds per side (A and B). Busway rated per row and tap-off boxes matched to the rack keep the power path short and maintainable.', 'AI机柜通过OEM电源架或机柜母排取电，由上方插接母线供电：135 kW机柜每路（A、B）需多条三相63 A进线。按排选型的母线及与机柜匹配的插接箱使供电路径短且易于维护。'],
      om: [['Thermal scan of tap-offs at full GPU load.', '在GPU满载时对插接箱红外测温。'], ['Watch phase balance — GPU loads switch together.', '关注三相平衡——GPU负载同步变化。'], ['Plan busway capacity for the next GPU generation.', '母线容量按下一代GPU预留。']],
      basis: function (c) { var el = c.R.el; return [el.busways + ' busway runs × ' + el.bwA + ' A · high-density racks: ' + (el.rHd ? el.rHd[0] : '–'), el.busways + '条母线 × ' + el.bwA + ' A · 高密度机柜：' + (el.rHd ? el.rHd[1] : '–')]; }, calc: 'bwy' }
  };
  function U(k, o) { return Object.assign({}, X.U[k] || EXTRA[k], o || {}); }
  var CHW = { card: 'CHW', label: ['Chilled-water cooling', '冷冻水风冷'] }, PWR = { card: 'PWR', label: ['Critical power', '关键供电'] };
  var UNITS = [
    U('gpu', { id: 'gpu', no: '01', rel: [['flowT', ['Coolant flow', '冷却液流量']]] }),
    U('airack', { id: 'airack', no: '02', rel: [['floorT', ['Floor loading', '楼面荷载']], ['flowT', ['Coolant flow', '冷却液流量']], ['dens', ['Rack density', '机柜密度']]] }),
    U('manifold', { id: 'manifold', no: '03', rel: [['leak', ['Leak detection', '漏水检测']]] }),
    U('cdu', { id: 'cdu', no: '04', rel: [['cduT', ['CDU sizing', 'CDU选型']], ['coolant', ['Coolant', '冷却液']]] }),
    U('aipow', { id: 'aipow', no: '05', rel: [PWR] }),
    U('bess', { id: 'bess', no: '06', rel: [['bessT', ['BESS sizing', '储能选型']], PWR] }),
    U('fws', { id: 'fws', no: '07', rel: [['appr', ['Warm water', '温水']]] }),
    U('dry', { id: 'dry', no: '08', rel: [['appr', ['Warm water', '温水']], ['cduT', ['Heat rejection', '散热']]] }),
    U('chiller', { id: 'trim', no: '09', name: ['Trim chiller', '补冷冷机'], func: ['Removes the residual air-side heat and tops up the liquid loop on the hottest hours.', '承担风侧余热，并在最热时段为液冷环路补冷。'], rel: [CHW] }),
    U('crah', { id: 'resair', no: '10', name: ['Residual-air cooling', '余热风冷'],
      how: ['The 10–15 % of heat not captured by the cold plates (memory, drives, power supplies, network) still leaves by air; fan walls or rear-door coolers on chilled water remove it.', '冷板未带走的10–15%热量（内存、硬盘、电源、网络）仍需风冷；由冷冻水风墙或背板换热器带走。'], rel: [CHW] }),
    U('floor', { id: 'floor', no: '11', rel: [['floorT', ['Floor loading', '楼面荷载']]] }),
    U('leak', { id: 'leak', no: 'A' }), U('coolant', { id: 'coolant', no: 'B' })
  ];
  var THEORY = [['flowT', 'flow'], ['cduT', 'cdu'], ['appr', 'appr'], ['pue', 'pue'], ['floorT', 'floor'], ['bessT', 'bess'], ['dens', 'dens']];
  var FAQ = [
    [['Why can’t air cool a GB300 NVL72 rack?', '为什么风冷无法冷却GB300 NVL72机柜？'], ['At ≈ 135 kW a rack would need ≈ 33,000 m³/h of air at a 12 K rise — impossible through one cabinet. Cold plates move ≈ 85–90 % of the heat into liquid at ≈ 1.5 L/min per kW.', '约135 kW时，温升12 K需约33,000 m³/h风量——单个机柜无法实现。冷板将约85–90%热量转入液体，约1.5 L/min/kW。']],
    [['Do we still need chillers?', '还需要冷机吗？'], ['For the liquid loop often not: with W40–W45 coolant, dry coolers reject the heat most hours even at 34 °C ambient. The remaining 10–15 % of heat still leaves by air, so a smaller chilled-water system stays for residual air and the hottest hours.', '液冷环路通常不需要：采用W40–W45冷却液时，即使环境34 °C，干冷器在多数时间也能散热。其余10–15%热量仍需风冷，因此保留较小的冷冻水系统处理余热及最热时段。']],
    [['What happens if a cold plate leaks?', '冷板泄漏会怎样？'], ['Loops run at low pressure with dripless quick disconnects; leak-detection cables under manifolds and CDUs alarm within seconds and the CDU can isolate the rack. Negative-pressure loop designs also exist.', '环路低压运行并采用无滴漏快插接头；分液器及CDU下方的漏水检测线缆数秒内报警，CDU可隔离该机柜。也有负压环路设计。']],
    [['Which coolant is used?', '采用哪种冷却液？'], ['Usually 25 % propylene glycol (PG25) or treated water with inhibitors in the technology loop, as specified by the IT vendor; the facility loop is treated water.', '技术环路通常采用IT厂商规定的25%丙二醇（PG25）或添加缓蚀剂的处理水；设施环路为处理水。']],
    [['Can an existing data hall be converted?', '现有机房能否改造？'], ['Partly: in-row or rack-level CDUs connected to the chilled-water system can serve a few AI racks, but floor loading, power per row and pipe routes usually limit how many. New AI halls are designed for liquid from the start.', '部分可以：接入冷冻水系统的列间或机柜级CDU可服务少量AI机柜，但楼面荷载、每排电力及管路通常限制数量。新建AI机房应从一开始按液冷设计。']],
    [['How much power does a 50 MW AI factory draw from PLN?', '50 MW AI工厂从PLN取用多少电力？'], ['With an annual PUE ≈ 1.2 plus design-day peaks, ≈ 65–70 MVA — a 150 kV connection with an on-site substation. The assessment engine sizes it for any selected basis.', '年均PUE约1.2并计入设计日峰值，约65–70 MVA——需150 kV接入并自建变电站。评估引擎可针对任一基准计算。']],
    [['Why a BESS for AI training?', '为什么AI训练需要储能？'], ['Synchronised GPU jobs swing tens of megawatts within seconds; a BESS absorbs the swings so generators and the PLN connection see a smoother load.', '同步的GPU任务可在数秒内波动数十兆瓦；储能吸收波动，使发电机及PLN接入看到更平稳的负荷。']]
  ];

  function tray(x, y) {
    var s = L.shadow(x + 120, y + 64, 126, 5) + L.R(x, y, 240, 58, '#2B2E4E', ' rx="5"') + L.R(x + 6, y + 6, 228, 46, '#2E7D4F', ' rx="3"');
    for (var i = 0; i < 4; i++) {
      var px = x + 18 + i * 54;
      s += L.R(px, y + 12, 40, 30, '#C7CCDD', ' rx="3" stroke="#17153F" stroke-opacity=".35"');
      for (var k = 0; k < 5; k++) s += L.R(px + 4 + k * 7, y + 16, 4, 22, k % 2 ? '#7ADBEE' : '#4FC3E0', ' rx="1"');
    }
    s += '<path d="M' + (x - 14) + ' ' + (y + 20) + 'H' + (x + 6) + '" stroke="#22B8D8" stroke-width="5"/><path d="M' + (x - 14) + ' ' + (y + 38) + 'H' + (x + 6) + '" stroke="#E86B5E" stroke-width="5"/>';
    return s + L.R(x + 70, y + 58, 6, 14, '#5E6484') + L.R(x + 164, y + 58, 6, 14, '#5E6484');
  }
  function manifolds(x, y, h) {
    var s = L.R(x, y, 12, h, '#22B8D8', ' rx="6"') + L.R(x + 26, y, 12, h, '#E86B5E', ' rx="6"');
    for (var i = 0; i < 6; i++) { var yy = y + 10 + i * (h - 20) / 5; s += '<circle cx="' + (x + 6) + '" cy="' + yy + '" r="4" fill="#fff" stroke="#0B7F99" stroke-width="1.5"/><circle cx="' + (x + 32) + '" cy="' + yy + '" r="4" fill="#fff" stroke="#B0302A" stroke-width="1.5"/>'; }
    return s;
  }
  function slab(x, y, w) {
    var s = L.R(x, y, w, 26, 'url(#tcConc)', ' stroke="#17153F" stroke-opacity=".3"') + L.R(x + 10, y + 26, 18, 20, '#B9BED2') + L.R(x + w - 28, y + 26, 18, 20, '#B9BED2');
    s += L.rack(x + w / 2 - 30, y - 92, 60, 92, { gpu: true });
    [x + 40, x + w - 40].forEach(function (ax) { s += '<path d="M' + ax + ' ' + (y - 62) + 'V' + (y - 8) + '" stroke="#E5534B" stroke-width="3"/>' + L.arrowHead(ax, y - 2, 'd', '#E5534B', 8); });
    return s;
  }
  function pfd(c) {
    var R = c.R, me = R.me, el = R.el, hp = R.hdP, cap = R.cap, o = '';
    o += L.ground(132, 232, 1330) + L.R(132, 242, 1330, 40, 'url(#tcSoil)', ' opacity=".5"') + L.R(0, 497, 1470, 16, 'url(#tcGround)');
    o += L.waves(0, 512, 1470, 108, 'url(#tcWater)', 6, 140, 6, '#7FD0EA') + L.text(735, 590, ['Facility water loop ≈ 32–45 °C · closed loop · dry coolers need no evaporation', '设施水环路约32–45 °C · 闭式环路 · 干冷器无需蒸发耗水'], 'tc-lw', ' text-anchor="middle" style="font-size:12.5px"');
    /* technology loop */
    o += L.pipe('M727 120V100H606V110', 'tcs', 5) + L.pipe('M632 110V88H761V120', 'tcr', 5, true, true) + L.thin('M606 152H536', 'tcs', 3, '4 3') + L.thin('M632 196H536', 'tcr', 3, '4 3');
    /* facility loop */
    o += L.pipe('M751 232V262H1462V444H1454', 'fws', 6) + L.pipe('M1300 470H1262', 'fws', 6) + L.pipe('M1000 446H982V274H860V232', 'fwr', 6, true, true) + L.thin('M962 466H1000', 'fws', 3, '4 4');
    /* banners */
    o += L.banner(140, 0, 1310, ['① TECHNOLOGY COOLING SYSTEM (TCS) · 技术冷却环路', '① 技术冷却环路 · TCS'], ['coolant through cold plates, manifolds and CDUs', '冷却液流经冷板、分液器与CDU'], null, 'tcZone');
    o += L.banner(540, 290, 920, ['② FACILITY WATER SYSTEM (FWS) · 设施水系统', '② 设施水系统 · FWS'], ['warm water to dry coolers; residual air on chilled water', '温水至干冷器；余热经冷冻水'], null, 'tcZone2');
    o += L.banner(130, 290, 390, ['③ BUILDING · 建筑', '③ 建筑 · BUILDING'], ['weight & space', '荷载与空间'], null, 'tcZone5');
    /* row 1 */
    o += L.hot('gpu', ['Cold plates', '冷板'], 130, 38, 270, 200, tray(150, 160) + L.label(270, 60, '01', ['Cold plates', '冷板'], ['on every GPU and CPU', '覆盖每颗GPU与CPU']));
    o += L.hot('airack', ['AI rack', 'AI机柜'], 424, 38, 120, 200, L.rack(430, 96, 104, 136, { gpu: true, blink: true }) + L.label(482, 60, '02', ['AI rack', 'AI机柜'], hp.kw + ' kW · ' + (hp.gpu || '–') + ' GPU'));
    o += L.hot('manifold', ['Manifolds & QDs', '分液器与快接'], 560, 38, 130, 200, manifolds(600, 110, 120) + L.label(640, 60, '03', ['Manifolds & QDs', '分液器与快接'], ['dripless couplings', '无滴漏接头']));
    o += L.hot('cdu', ['CDUs', 'CDU'], 694, 38, 214, 200, L.cduCab(700, 120, 96, 112) + L.cduCab(806, 120, 96, 112) + L.label(801, 60, '04', ['CDUs', 'CDU'], me.cduN ? (me.cduN + me.cduR) + ' × ' + F(me.cduSize) + ' kW' : '–'));
    var pw = L.busway(950, 104, 270, 6, 12) + L.rack(970, 140, 66, 92, { gpu: true }) + L.rack(1056, 140, 66, 92, { gpu: true }) + L.rack(1142, 140, 66, 92, { gpu: true });
    o += L.hot('aipow', ['Power for AI racks', 'AI机柜供电'], 940, 38, 290, 200, pw + L.label(1085, 60, '05', ['Rack power', '机柜供电'], [el.bwA + ' A busway · A + B', el.bwA + ' A母线 · A+B']));
    o += L.hot('bess', ['BESS', '储能'], 1250, 38, 200, 200, L.bessBox(1262, 172, 180, 60) + L.label(1350, 60, '06', ['BESS', '储能'], el.bess ? F(el.bess.mw, 1) + ' MW / ' + F(el.bess.mwh, 1) + ' MWh' : ['optional', '可选']));
    /* row 2 */
    o += L.hot('fws', ['FWS pumps', '设施水泵'], 1290, 330, 166, 170, L.pump(1300, 498, 1) + L.pump(1380, 498, 1) + L.label(1372, 352, '07', ['FWS pumps', '设施水泵'], ['N+1 · VFD', 'N+1 · 变频']));
    o += L.hot('dry', ['Dry coolers', '干冷器'], 994, 330, 276, 170, L.dryCooler(1000, 420, 260, 78, 4) + L.label(1130, 352, '08', ['Dry coolers', '干冷器'], me.dcN ? (me.dcN + me.dcR) + ' × ' + F(K.DC_KW) + ' kW' : '–'));
    o += L.hot('trim', ['Trim chiller', '补冷冷机'], 754, 330, 214, 170, L.chiller(760, 420, 200, 78) + L.label(860, 352, '09', ['Trim chiller', '补冷冷机'], ['residual air · hot days', '余热 · 高温日']));
    o += L.hot('resair', ['Residual-air cooling', '余热风冷'], 550, 330, 190, 170, L.fanWall(560, 400, 100, 98, 2, 3, true) + L.label(640, 352, '10', ['Residual air', '余热风冷'], [F(R.cool.airKW) + ' kW by air', '风冷' + F(R.cool.airKW) + ' kW']));
    o += L.hot('floor', ['Floor loading', '楼面荷载'], 140, 330, 380, 170, slab(160, 470, 340) + L.label(330, 352, '11', ['Floor loading', '楼面荷载'], ['≥ ' + R.sp.floorLoad + ' kN/m² · ≈ ' + F(R.sp.heavyRack) + ' kg rack', '≥' + R.sp.floorLoad + ' kN/m² · 机柜约' + F(R.sp.heavyRack) + ' kg']));
    o += L.text(612, 236, ['35 °C →', '35 °C →'], 'tc-ls', ' style="font-weight:800;fill:#0B7F99"') + L.text(1100, 286, ['← 32 °C', '← 32 °C'], 'tc-ls', ' style="font-weight:800;fill:#0B7F99"');
    return '<svg class="tc-pfd tc-abs" viewBox="0 0 1470 620" role="img" aria-label="' + L.te(['Direct liquid cooling', '冷板式液冷']) + '">' + o + '</svg>';
  }
  function principleSvg(c) {
    var hp = c.R.hdP, o = '<svg viewBox="0 0 340 196" role="img" aria-label="cold plate">';
    o += L.R(30, 150, 280, 12, '#2E7D4F', ' rx="3"') + L.R(110, 128, 120, 22, '#3A3F63', ' rx="3"') + L.text(170, 143, 'GPU', 'tc-lw', ' text-anchor="middle"');
    o += L.R(96, 86, 148, 40, '#C7CCDD', ' rx="5" stroke="#17153F" stroke-opacity=".35"');
    for (var i = 0; i < 9; i++) o += L.R(104 + i * 15, 92, 7, 28, i % 2 ? '#7ADBEE' : '#4FC3E0', ' rx="2"');
    o += L.pipe('M20 98H96', 'tcs', 6) + L.pipe('M244 112H320', 'tcr', 6);
    o += L.text(52, 86, '35 °C', 'tc-ls', ' text-anchor="middle" style="font-weight:800;fill:#0B7F99"') + L.text(288, 100, '45 °C', 'tc-ls', ' text-anchor="middle" style="font-weight:800;fill:#B0302A"');
    o += L.text(170, 40, [F((hp.liq || .85) * 100) + ' % of the heat to liquid', F((hp.liq || .85) * 100) + '%热量进入液体'], 'tc-lt', ' text-anchor="middle" style="font-size:14px"') + L.text(170, 60, ['≈ 1.5 L/min per kW at ΔT 10 K', '温差10 K时约1.5 L/min/kW'], 'tc-ls', ' text-anchor="middle"');
    return o + L.text(170, 186, ['micro-channel cold plate', '微通道冷板'], 'tc-ls', ' text-anchor="middle" style="font-weight:700"') + '</svg>';
  }
  function right(c) {
    var R = c.R, hp = R.hdP;
    return L.principle('flowT', 'drop', ['Heat into liquid', '热量进入液体'], principleSvg(c), ['Coolant flows through micro-channels in a copper plate on each GPU; water carries ≈ 3,500 times more heat per volume than air.', '冷却液流经每颗GPU上铜冷板的微通道；单位体积水的携热能力约为空气的3,500倍。']) +
      L.chips([['leak', 'drop', ['Leak detection', '漏水检测']], ['coolant', 'flask', ['Coolant', '冷却液']], ['appr', 'therm', ['Warm water', '温水']], ['cduT', 'layers', ['CDU sizing', 'CDU选型']]]) +
      L.kpis([['airack', String(hp.kw), 'kW', ['Rack power', '机柜功率'], [hp.en.split(' (')[0], hp.zh.split('（')[0]]],
        ['flowT', F((hp.liq || .85) * 100), '%', ['Heat to liquid', '液冷占比'], ['cold plates', '冷板']],
        ['appr', 'W32–W45', '', ['Facility water', '设施水'], ['warm, chiller-less', '温水，可无冷机']],
        ['pue', F(R.eff.pue, 2), '', ['Annual PUE', '年均PUE'], [F(R.cool.liquidKW / 1000, 1) + ' MW to liquid', '液冷' + F(R.cool.liquidKW / 1000, 1) + ' MW']]]);
  }
  function bottom(c) {
    var R = c.R, hp = R.hdP, h = '';
    var ai = DB.platforms.filter(function (p) { return p.cat === 'AI'; }).sort(function (a, b) { return b.kw - a.kw; }).filter(function (p) { return p.kw <= 250; }).slice(0, 6), mx = ai.length ? ai[0].kw : 1;
    h += L.tile(0, 'airack', 'server', ['AI rack platforms', 'AI机柜平台'], ['kW per rack', '单柜kW'], L.miniBars(ai.map(function (p) { return [[p.en.split(' (')[0].replace('NVIDIA ', ''), p.zh.split('（')[0].replace('NVIDIA ', '')], p.kw, p.id === hp.id ? '#3F3CBB' : '#B9BCE6']; }), mx, ' kW'));
    var lq = hp.kw * (hp.liq || .85), parts = [[['To liquid', '进入液体'], lq, '#0EA5C6'], [['To air', '进入空气'], hp.kw - lq, '#E5806E']];
    h += L.tile(1, 'flowT', 'drop', ['Heat split per rack', '单柜热量分配'], hp.kw + ' kW', '<div style="display:flex;gap:12px;align-items:center">' + L.donut(parts, { center: String(hp.kw), unit: 'kW' }) + '<div style="display:grid;gap:5px;flex:1">' + L.legend(parts, 0, ' kW') + '</div></div>' + L.note(['Flow ≈ ' + F(lq / (1020 * 3.9 * 10) * 60000) + ' L/min per rack at ΔT 10 K.', '温差10 K时每柜约' + F(lq / (1020 * 3.9 * 10) * 60000) + ' L/min。']), '#E2F5FA');
    h += L.tile(2, 'floorT', 'building', ['Rack facts', '机柜参数'], [hp.en.split(' (')[0].replace('NVIDIA ', ''), hp.zh.split('（')[0]], L.facts([
      [['Weight', '重量'], '≈ ' + F(hp.kg) + ' kg', ['floor ≥ ' + R.sp.floorLoad + ' kN/m²', '楼面≥' + R.sp.floorLoad + ' kN/m²']], [['Footprint', '占地'], hp.w + ' × ' + hp.d, ['mm · ' + hp.u + 'U', 'mm · ' + hp.u + 'U']],
      [['Accelerators', '加速器'], String(hp.gpu || '–'), ['GPUs per rack', '每柜GPU']], [['Peak power', '峰值功率'], hp.kwPeak + ' kW', ['design ' + hp.kw + ' kW', '设计' + hp.kw + ' kW']]]));
    var refs = DB.references.filter(function (r) { return r.kind === 'real' && r.type === 'AI' && r.mw; }).sort(function (a, b) { return b.mw - a.mw; }).slice(0, 5), mxr = refs.length ? refs[0].mw : 1;
    h += L.tile(3, 'refsAI', 'pin', ['AI campuses', 'AI园区'], ['public data', '公开信息'], L.miniBars(refs.map(function (r) { return [[r.en.split(' — ')[0], r.zh.split('——')[0]], r.mw, '#2A2785']; }), mxr, ' MW') + L.note(['Announced capacity; Indonesian and regional projects in the reference database.', '公开宣布的容量；参考数据库中的印尼及区域项目。']), '#FCE9E7');
    h += L.tile(4, 'faq', 'chat', ['Client questions', '客户问题'], [FAQ.length + ' answers', FAQ.length + '个解答'], '<div class="tc-qs">' + FAQ.slice(0, 4).map(function (q) { return '<span>' + L.te(q[0]) + '</span>'; }).join('') + '</div>', '#E2F5FA');
    return h;
  }
  function refsPanel() {
    var rows = DB.references.filter(function (r) { return r.kind === 'real' && (r.type === 'AI' || r.type === 'HYPER'); }).sort(function (a, b) { return (b.mw || 0) - (a.mw || 0); }).map(function (r) {
      return ['<b>' + L.te([r.en, r.zh]) + '</b><br><span class="tc-src">' + L.te(r.loc) + '</span>', L.e(r.country), r.mw ? F(r.mw) + ' MW' : '–', L.te(r.facts[0]) + (r.src ? ' <a href="' + L.e(r.src) + '" target="_blank" rel="noopener">↗</a>' : '')];
    });
    return L.freePanel('refsAI', '★', ['AI and hyperscale campuses', 'AI及超大规模园区'], ['Public information from operators and trade press', '来自运营商及行业媒体的公开信息'], L.ptable([['Project', '项目'], ['Country', '国家'], ['Capacity', '容量'], ['Key fact', '要点']], rows), 'x');
  }
  var card = {
    id: 'DLC', abbr: 'DLC', title: ['Direct Liquid Cooling', '冷板式液冷'], short: ['Direct Liquid Cooling', '冷板液冷'], icon: 'drop',
    blurb: ['AI racks, cold plates, CDUs, warm-water heat rejection', 'AI机柜、冷板、CDU、温水散热'], badge: ['AI cooling', 'AI制冷'], basis: 'A08', units: UNITS, faq: FAQ,
    calc: Object.assign({}, X.CALC, { flowT: X.CALC.flow, cduT: X.CALC.cdu, floorT: X.CALC.floor, bessT: X.CALC.bess }),
    basisOk: function (x) { return x.R.cool.liquidKW > 0; }, fallNote: ['The selected design has no liquid cooling; the card shows benchmark A08 (AI factory, Batam).', '所选设计无液冷；卡片显示基准A08（巴淡AI工厂）。'],
    gloss: [['TCS / FWS', '技术冷却环路/设施水系统', 'Technology cooling system (rack side) / facility water system (plant side), per ASHRAE.', 'ASHRAE定义的技术冷却环路（机柜侧）/设施水系统（机房侧）。'], ['QD', '快插接头', 'Quick disconnect coupling (dripless).', '无滴漏快插接头。'], ['PG25', '25%丙二醇', 'Water with 25 % propylene glycol.', '含25%丙二醇的水溶液。'], ['NVLink', 'NVLink', 'NVIDIA high-speed GPU interconnect.', 'NVIDIA高速GPU互连。']],
    sources: [['ASHRAE TC 9.9 liquid cooling guidelines (W classes)', 'ASHRAE TC 9.9液冷指南（W等级）'], ['OCP Advanced Cooling Solutions — cold plate requirements', 'OCP先进冷却方案——冷板要求'], ['NVIDIA / HPE GB300 NVL72 documentation (platform data in the knowledge base)', 'NVIDIA/HPE GB300 NVL72资料（知识库平台数据）'], ['Assessment engine liquid model (LIQ coefficients, CDU and dry-cooler sizing)', '评估引擎液冷模型（LIQ系数、CDU及干冷器选型）']],
    stage: function (c) {
      var R = c.R, hp = R.hdP;
      card.tag = ['<b>' + F(R.cap.hdR) + '</b> × ' + hp.en.split(' (')[0] + ' racks at <b>' + hp.kw + ' kW</b>: cold plates move <b>' + F(R.cool.liquidKW / 1000, 1) + ' MW</b> into a warm-water loop, CDUs and dry coolers reject it — PUE <b>' + F(R.eff.pue, 2) + '</b>.',
        '<b>' + F(R.cap.hdR) + '</b>个' + hp.zh.split('（')[0] + '机柜（<b>' + hp.kw + ' kW</b>）：冷板将<b>' + F(R.cool.liquidKW / 1000, 1) + ' MW</b>热量送入温水环路，经CDU及干冷器排出——PUE <b>' + F(R.eff.pue, 2) + '</b>。'];
      return L.header(card) + pfd(c) + right(c) + bottom(c) + L.footer(['Indicative values for the selected design basis; coolant limits and flows follow the IT vendor’s specification.', '所选设计基准的参考值；冷却液限值与流量以IT厂商规范为准。'], [['basis', L.UI.basis], ['gloss', L.UI.gloss]]);
    },
    panels: function (c) {
      var P = UNITS.map(function (u) { return L.unitPanel(u, c); });
      THEORY.forEach(function (th, i) { P.push(L.theoryPanel(Object.assign({}, X.TH[th[1]], { id: th[0] }), 'T' + (i + 1), c)); });
      P.push(refsPanel()); P.push(L.faqPanel(card));
      return P;
    }
  };
  TC.register(card);
})(window);
