/* Technology card: Direct Liquid Cooling for AI racks (cold plates → manifolds → CDUs → facility water → dry coolers).
   Rev. 18: full-width illustration (1860 × 840) — magnified cold plate, AI rack with manifolds, CDU cut-away, technology and facility water loops,
   dry coolers, trim chiller and residual air, power and BESS, floor loading and the heat split; 12-step process flow. */
(function (g) {
  'use strict';
  var TC = g.TC, L = TC.lib, X = g.TCX, DB = g.DCDB, E = g.DCEngine, K = E.K, F = L.F, t = L.t;
  var EXTRA = {
    aipow: { eq: 'EL-13', more: ['EL-14', 'EL-23'], name: ['Power for AI racks', 'AI机柜供电'],
      how: ['AI racks take power through OEM power shelves or a rack busbar fed from overhead busway: a 135 kW rack needs several 63 A three-phase feeds per side (A and B). Busway rated per row and tap-off boxes matched to the rack keep the power path short and maintainable.', 'AI机柜通过OEM电源架或机柜母排取电，由上方插接母线供电：135 kW机柜每路（A、B）需多条三相63 A进线。按排选型的母线及与机柜匹配的插接箱使供电路径短且易于维护。'],
      om: [['Thermal scan of tap-offs at full GPU load.', '在GPU满载时对插接箱红外测温。'], ['Watch phase balance — GPU loads switch together.', '关注三相平衡——GPU负载同步变化。'], ['Plan busway capacity for the next GPU generation.', '母线容量按下一代GPU预留。']],
      basis: function (c) { var el = c.R.el; return [el.busways + ' busway runs × ' + el.bwA + ' A | high-density racks: ' + (el.rHd ? el.rHd[0] : '–'), el.busways + '条母线 × ' + el.bwA + ' A | 高密度机柜：' + (el.rHd ? el.rHd[1] : '–')]; }, calc: 'bwy' }
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

  function slab(x, y, w) {
    var s = L.R(x, y, w, 26, 'url(#tcConc)', ' stroke="#17153F" stroke-opacity=".3"') + L.R(x + 10, y + 26, 18, 20, '#B9BED2') + L.R(x + w - 28, y + 26, 18, 20, '#B9BED2');
    s += L.rack(x + w / 2 - 30, y - 92, 60, 92, { gpu: true });
    [x + 40, x + w - 40].forEach(function (ax) { s += '<path d="M' + ax + ' ' + (y - 62) + 'V' + (y - 8) + '" stroke="#E5534B" stroke-width="3"/>' + L.arrowHead(ax, y - 2, 'd', '#E5534B', 8); });
    return s;
  }
  /* ---------------------------------------------------------------- illustration (1860 × 840), Rev. 18
     row 1: cold plate (magnified) | AI rack with manifolds | CDU | power for AI racks + BESS
     row 2: facility water to dry coolers, trim chiller and residual air | floor loading and the heat split */
  function lq(c) {
    var R = c.R, hp = R.hdP, me = R.me, liq = hp.liq || .85, rackLiq = hp.kw * liq;
    return { hp: hp, me: me, liq: liq, perRack: rackLiq / (1020 * 3.9 * 10) * 60000, tcsFlow: R.cool.liquidKW / (1.02 * 3.9 * 10) * 3.6, fwsFlow: R.cool.liquidKW / (4.18 * 10) * 3.6,
      perGpu: hp.gpu ? hp.kw / hp.gpu : 0, amps: hp.kw * 1000 / (Math.sqrt(3) * (R.el.lvV || 400) * .95) };
  }
  function bubble(c, q) {
    var o = L.R(24, 48, 284, 340, '#fff', ' rx="18" stroke="#C9CDE0" stroke-width="1.5"');
    o += L.text(166, 104, [F(q.liq * 100) + ' % of the heat → liquid', F(q.liq * 100) + '%热量进入液体'], 'tc-lt', ' text-anchor="middle" style="font-size:14px"') + L.text(166, 124, ['≈ 1.5 L/min per kW at ΔT 10 K', '温差10 K时约1.5 L/min/kW'], 'tc-ls', ' text-anchor="middle" style="font-size:12.5px"');
    o += L.R(44, 318, 244, 16, '#2E7D4F', ' rx="3"') + L.R(106, 292, 120, 26, '#3A3F63', ' rx="3"') + L.text(166, 310, 'GPU', 'tc-lw', ' text-anchor="middle" style="font-size:13px"');
    o += L.R(92, 214, 148, 76, '#D9DDEA', ' rx="6" stroke="#17153F" stroke-opacity=".35"');
    for (var i = 0; i < 12; i++) o += L.R(100 + i * 11.4, 222, 6, 60, i % 2 ? '#7ADBEE' : '#4FC3E0', ' rx="2"');
    o += '<path d="M128 288c6-8-6-14 0-22M166 288c6-8-6-14 0-22M204 288c6-8-6-14 0-22" fill="none" stroke="#E5534B" stroke-width="2.4"/>';
    o += L.fl('gpu manifold', L.pipe('M36 232H92', 'tcs', 7) + L.pipe('M240 272H298', 'tcr', 7)) + L.tag(70, 206, '35 °C', 'tcs', null, 12) + L.tag(262, 300, '45 °C', 'tcr', null, 12);
    o += L.text(166, 358, [q.perGpu ? '≈ ' + F(q.perGpu, 1) + ' kW per GPU incl. CPU share' : 'micro-channel copper plate', q.perGpu ? '每颗GPU约' + F(q.perGpu, 1) + ' kW（含CPU分摊）' : '微通道铜冷板'], 'tc-ls', ' text-anchor="middle" style="font-size:12.5px;font-weight:700"');
    return L.hot('gpu', ['Cold plates', '冷板'], 24, 48, 284, 340, o + L.label(166, 80, '01', ['Cold plate (magnified)', '冷板（放大）'], null), ['micro-channel copper plates on every GPU and CPU', '每颗GPU与CPU上的微通道铜冷板']);
  }
  function rackCut(c, q) {
    var hp = q.hp, o = '', x = 340, y = 96, w = 196, h = 290;
    o += '<path d="M308 230L' + (x + 4) + ' 160M308 300L' + (x + 4) + ' 186" stroke="#9AA0BC" stroke-width="1.5" stroke-dasharray="4 3"/>';
    var r = L.R(x, y, w, h, '#2B2E4E', ' rx="6" stroke="#17153F"') + L.R(x + 8, y + 8, w - 16, 16, '#E39B1B', ' rx="2"') + L.text(x + w / 2, y + 20, ['power shelf', '电源架'], 'tc-ls', ' text-anchor="middle" style="font-size:10px;font-weight:800;fill:#17153F"');
    [y + 30, y + 56, y + 82, y + 176, y + 202, y + 228].forEach(function (ty, i) {
      r += L.R(x + 8, ty, w - 16, 22, '#353A62', ' rx="2"') + (i === 1 ? L.R(x + 6, ty - 2, w - 12, 26, 'none', ' rx="3" stroke="#F2A93B" stroke-width="2"') : '');
      for (var k = 0; k < 4; k++) r += L.R(x + 16 + k * 40, ty + 4, 30, 14, '#C7CCDD', ' rx="2"') + L.R(x + 20 + k * 40, ty + 8, 22, 6, k % 2 ? '#7ADBEE' : '#4FC3E0', ' rx="1"');
    });
    [y + 112, y + 132, y + 152].forEach(function (ty) { r += L.R(x + 8, ty, w - 16, 16, '#17153F', ' rx="2"'); for (var k = 0; k < 8; k++) r += '<circle cx="' + (x + 22 + k * 20) + '" cy="' + (ty + 8) + '" r="2.2" fill="#5BE0B0"/>'; });
    r += L.R(x + 8, y + h - 30, w - 16, 16, '#E39B1B', ' rx="2"');
    r += L.text(x + w / 2, y + 147, 'NVLink', 'tc-lw', ' text-anchor="middle" style="font-size:9.5px;opacity:.75"');
    o += L.hot('airack', ['AI rack', 'AI机柜'], x - 6, 46, w + 12, 344, r + L.label(x + w / 2, 70, '02', ['AI rack', 'AI机柜'], hp.kw + ' kW | ' + (hp.gpu || '–') + ' GPU'), [hp.en.split(' (')[0] + ' | peak ' + hp.kwPeak + ' kW | ≈ ' + F(hp.kg) + ' kg', hp.zh.split('（')[0] + ' | 峰值' + hp.kwPeak + ' kW | 约' + F(hp.kg) + ' kg']);
    /* rack manifolds just behind the rack, quick disconnects to every tray */
    var mf = L.R(544, y + 6, 10, h - 12, '#22B8D8', ' rx="5"') + L.R(560, y + 6, 10, h - 12, '#E86B5E', ' rx="5"');
    [y + 41, y + 67, y + 93, y + 187, y + 213, y + 239].forEach(function (ty) { mf += '<path d="M' + (x + w) + ' ' + ty + 'H544M' + (x + w) + ' ' + (ty + 5) + 'H560" stroke="#8E95AE" stroke-width="2"/><circle cx="549" cy="' + ty + '" r="3.6" fill="#fff" stroke="#0B7F99" stroke-width="1.5"/><circle cx="565" cy="' + (ty + 5) + '" r="3.6" fill="#fff" stroke="#B0302A" stroke-width="1.5"/>'; });
    o += L.hot('manifold', ['Manifolds & quick disconnects', '分液器与快接'], 538, 90, 40, 300, mf, [F(q.perRack) + ' L/min per rack | dripless quick disconnects', '每柜' + F(q.perRack) + ' L/min | 无滴漏快插接头']);
    o += L.text(440, 410, ['03 manifolds + quick disconnects behind the rack', '03 机柜后部分液器与快插接头'], 'tc-ls', ' text-anchor="middle" style="font-size:12px;font-weight:800;fill:#3F3CBB"');
    return o;
  }
  function cduCut(c, q) {
    var me = q.me, o = '', x = 752, y = 96, w = 210, h = 290;
    var s = L.cab(x, y, w, h, '#EFF1F8', { door: false, cap: '#0B6F88' }) + L.R(x + 12, y + 16, w - 24, 22, '#17153F', ' rx="3"') + '<path d="M' + (x + 20) + ' ' + (y + 31) + 'l12 -8 12 6 12 -10 12 8" stroke="#5BE0B0" stroke-width="1.6" fill="none"/>' + L.text(x + w - 18, y + 31, 'CDU', 'tc-lw', ' text-anchor="end" style="font-size:11px"');
    s += L.phe(x + 22, y + 66, 92, 112) + L.text(x + 68, y + 196, ['plate HX', '板换'], 'tc-ls', ' text-anchor="middle" style="font-size:11px;font-weight:800"');
    s += L.vessel(x + 140, y + 60, 44, 70, 'tcCyan') + L.text(x + 162, y + 146, ['expansion', '膨胀罐'], 'tc-ls', ' text-anchor="middle" style="font-size:10.5px;font-weight:700"');
    s += L.R(x + 140, y + 160, 44, 30, '#C9CDE0', ' rx="4" stroke="#8E95AE"') + L.text(x + 162, y + 180, ['filter', '过滤'], 'tc-ls', ' text-anchor="middle" style="font-size:10.5px;font-weight:700"');
    s += L.pump(x + 16, y + h - 14, .82) + L.pump(x + 104, y + h - 14, .82) + L.text(x + w / 2, y + h - 64, ['2 pumps (N+1)', '2台泵（N+1）'], 'tc-ls', ' text-anchor="middle" style="font-size:10.5px;font-weight:800"');
    o += L.hot('cdu', ['CDUs', 'CDU'], x - 6, 46, w + 12, 344, s + L.label(x + w / 2, 70, '04', ['CDU', 'CDU'], me.cduN ? (me.cduN + me.cduR) + ' × ' + F(me.cduSize) + ' kW' : '–'), ['separates the rack loop (TCS) from the facility water (FWS): plate HX, pumps, filtration, control', '隔离机柜环路（TCS）与设施水（FWS）：板换、水泵、过滤、控制']);
    /* technology loop: CDU ⇄ rack manifolds */
    o += L.fl('cdu manifold gpu', L.pipe('M' + x + ' 352H549V' + (y + 284), 'tcs', 6) + L.pipe('M565 ' + (y + 6) + 'V80H660V250H' + x, 'tcr', 6, true, true));
    o += L.fl('cdu manifold', L.tag(704, 352, ['TCS 35 °C', 'TCS 35 °C'], 'tcs', null, 12) + L.tag(660, 170, ['45 °C', '45 °C'], 'tcr', null, 12) + L.tag(608, 352, F(q.tcsFlow) + ' m³/h', 'tcs', null, 11.5));
    /* leak detection cable under the rack and the CDU */
    o += L.hot('leak', ['Leak detection', '漏水检测'], 334, 388, 640, 30, L.thin('M340 394H962', '#E3B505', 3, '7 4') + L.R(966, 386, 22, 16, '#3A3F63', ' rx="3"') + '<circle cx="977" cy="394" r="3" fill="#E3B505"/>', ['sensing cable under manifolds and CDUs alarms within seconds; the CDU can isolate the rack', '分液器及CDU下方感应线缆数秒内报警；CDU可隔离机柜']);
    o += L.hot('coolant', ['Coolant', '冷却液'], 980, 236, 120, 150, L.cylV(1000, 300, 52, 80, 'tcCyan') + L.R(1004, 326, 44, 22, '#fff', ' rx="3" opacity=".85"') + L.text(1026, 342, 'PG25', 'tc-lt', ' text-anchor="middle" style="font-size:11px"') + L.label(990, 270, 'B', ['Coolant', '冷却液'], 'PG25', 'start'), ['25 % propylene glycol or inhibited water, per the IT vendor; filtered and sampled', '按IT厂商规定采用25%丙二醇或缓蚀处理水；过滤并定期取样']);
    return o;
  }
  function power(c, q) {
    var R = c.R, el = R.el, hp = q.hp, o = '';
    o += L.banner(1240, 0, 600, ['⑤ POWER FOR AI RACKS | AI机柜供电', '⑤ AI机柜供电 | AI POWER'], ['busway A + B, BESS', 'A+B母线、储能'], null, 'tcZone3');
    var p = L.busway(1262, 92, 384, 6, 10) + L.R(1262, 116, 384, 6, '#3F8FD0', ' rx="2"');
    [1282, 1406, 1530].forEach(function (x) { p += L.rack(x, 150, 96, 232, { gpu: true, blink: x === 1406 }) + L.R(x + 6, 156, 84, 10, '#E39B1B', ' rx="2"') + '<path d="M' + (x + 30) + ' 112V150M' + (x + 66) + ' 122V150" stroke="#3A3F63" stroke-width="2"/>'; });
    o += L.hot('aipow', ['Power for AI racks', 'AI机柜供电'], 1254, 40, 400, 350, p + L.label(1454, 70, '05', ['Rack power', '机柜供电'], [(el.bwHdA || el.bwA) + ' A busway | A + B', (el.bwHdA || el.bwA) + ' A母线 | A+B']) + L.tag(1454, 140, ['≈ ' + F(q.amps) + ' A per rack at ' + (el.lvV || 400) + ' V', '每柜约' + F(q.amps) + ' A（' + (el.lvV || 400) + ' V）'], '#B8740B', null, 11.5),
      [hp.kw + ' kW per rack through OEM power shelves; several 63 A three-phase feeds per side (A and B)', '每柜' + hp.kw + ' kW经OEM电源架供电；每路（A、B）多条三相63 A进线']);
    var b = L.bessBox(1664, 300, 160, 70) + '<path d="M1814 300V104H1646" fill="none" stroke="#D58A12" stroke-width="3" stroke-dasharray="6 4"/>';
    o += L.hot('bess', ['BESS', '储能'], 1656, 40, 184, 350, (el.bess ? b : '<g opacity=".45">' + b + '</g>') + L.label(1748, 70, '06', ['BESS', '储能'], el.bess ? F(el.bess.mw, 1) + ' MW / ' + F(el.bess.mwh, 1) + ' MWh' : ['optional', '可选']) + L.text(1748, 210, ['absorbs GPU', '吸收GPU'], 'tc-ls', ' text-anchor="middle" style="font-size:12px;font-weight:700"') + L.text(1748, 228, ['load swings', '负荷波动'], 'tc-ls', ' text-anchor="middle" style="font-size:12px;font-weight:700"') +
      '<path d="M1690 270l14-24 12 16 12-30 12 22 12-12 12 18" fill="none" stroke="#E5534B" stroke-width="2.4"/>', ['synchronised training jobs swing tens of MW in seconds; the BESS smooths them for generators and PLN', '同步训练任务数秒内波动数十MW；储能为发电机及PLN平滑负荷']);
    return o;
  }
  function facility(c, q) {
    var R = c.R, me = q.me, o = '', cp = me.cp || { chws: 14, chwDT: 8 };
    o += L.banner(20, 426, 1220, ['③ FACILITY WATER (FWS) & HEAT REJECTION | 设施水与散热', '③ 设施水与散热 | FACILITY WATER'], ['warm water ≈ 32 → 42 °C to dry coolers — no chillers most of the year, no evaporation', '约32→42 °C温水至干冷器——全年多数时段无需冷机、不耗水蒸发'], null, 'tcZone2');
    o += L.ground(20, 806, 1220);
    /* facility water: CDU → dry coolers → pumps → CDU */
    o += L.fl('fws dry cdu', L.pipe('M962 200H1104V650H306V702', 'fwr', 6, true, true) + L.pipe('M546 650V702', 'fwr', 6, true, true));
    o += L.fl('fws dry cdu', L.pipe('M272 770H214', 'fws', 6) + L.pipe('M60 790H36V824H1126V150H962', 'fws', 6));
    o += L.fl('fws dry cdu', L.tag(700, 650, ['FWR ≈ 42 °C', '回水约42 °C'], 'fwr', null, 12) + L.tag(700, 824, ['FWS ≈ 32 °C', '供水约32 °C'], 'fws', null, 12) + L.tag(1126, 560, F(q.fwsFlow) + ' m³/h', 'fws', null, 11.5));
    o += L.hot('fws', ['FWS pumps', '设施水泵'], 30, 470, 210, 336, L.pump(52, 800, 1) + L.pump(140, 800, 1) + L.label(134, 486, '07', ['FWS pumps', '设施水泵'], ['N+1 | VFD', 'N+1 | 变频']), ['primary loop to the dry coolers | ' + F(q.fwsFlow) + ' m³/h at ΔT 10 K', '至干冷器的一次环路 | 温差10 K时' + F(q.fwsFlow) + ' m³/h']);
    var dc = L.dryCooler(272, 702, 230, 96, 4) + L.dryCooler(522, 702, 230, 96, 4);
    [268, 498, 518, 748].forEach(function (x) { dc += L.R(x, 708, 8, 86, '#9FE6F6', ' rx="2" opacity=".8"'); });
    o += L.hot('dry', ['Dry coolers', '干冷器'], 262, 470, 500, 336, dc + L.label(512, 486, '08', ['Dry coolers', '干冷器'], me.dcN ? [(me.dcN + me.dcR) + ' × ' + F(K.DC_KW) + ' kW | adiabatic pads', (me.dcN + me.dcR) + ' × ' + F(K.DC_KW) + ' kW | 绝热预冷'] : '–') + L.tag(512, 560, ['ambient up to ' + F(R.L.db, 1) + ' °C dry-bulb', '室外干球至' + F(R.L.db, 1) + ' °C'], '#5D6280', null, 12),
      ['fans and finned coils cool 42 °C water to ≈ 32 °C with outdoor air; pads pre-cool the air on the hottest hours', '风机与翅片盘管以室外空气将42 °C水冷却至约32 °C；最热时段湿帘预冷空气']);
    o += L.fl('trim resair', L.pipe('M1010 742H1150', 'chws', 5) + L.pipe('M1150 772H1010', 'chwr', 5, true, true)) + L.fl('trim fws', L.thin('M900 690V658', 'chws', 3, '4 4'));
    o += L.hot('trim', ['Trim chiller', '补冷冷机'], 780, 470, 236, 336, L.chiller(790, 690, 220, 100) + L.label(900, 486, '09', ['Trim chiller', '补冷冷机'], me.chN ? (me.chN + me.chR) + ' × ' + F(me.chSize) + ' kW' : ['residual air | hot days', '余热 | 高温日']), ['cools the residual-air loop and tops up the facility water on the hottest hours', '冷却余热风冷环路，并在最热时段为设施水补冷']);
    o += L.hot('resair', ['Residual-air cooling', '余热风冷'], 1140, 470, 100, 336, L.fanWall(1150, 600, 84, 198, 2, 4, true) + L.label(1192, 486, '10', ['Residual air', '余热风冷'], [F(R.cool.airKW / 1000, 1) + ' MW by air', '风冷' + F(R.cool.airKW / 1000, 1) + ' MW']), ['memory, drives, power supplies and network still need air: fan walls on chilled water', '内存、硬盘、电源及网络仍需风冷：冷冻水风墙']);
    return o;
  }
  function building(c, q) {
    var R = c.R, hp = q.hp, o = '';
    o += L.banner(1260, 426, 580, ['④ BUILDING & HEAT SPLIT | 建筑与热量分配', '④ 建筑与热量分配 | BUILDING'], null, null, 'tcZone5');
    o += L.hot('floor', ['Floor loading', '楼面荷载'], 1262, 470, 330, 340, slab(1280, 740, 300) + L.label(1430, 486, '11', ['Floor loading', '楼面荷载'], ['≥ ' + R.sp.floorLoad + ' kN/m² | ≈ ' + F(R.sp.heavyRack) + ' kg rack', '≥' + R.sp.floorLoad + ' kN/m² | 机柜约' + F(R.sp.heavyRack) + ' kg']), ['a full AI rack weighs ≈ ' + F(hp.kg) + ' kg on ' + hp.w + ' × ' + hp.d + ' mm', '满载AI机柜约' + F(hp.kg) + ' kg，占地' + hp.w + ' × ' + hp.d + ' mm']);
    var rows = [[['To liquid', '进入液体'], F(R.cool.liquidKW / 1000, 1) + ' MW'], [['To air', '进入空气'], F(R.cool.airKW / 1000, 1) + ' MW'], [['Liquid share', '液冷占比'], F(R.cool.liquidKW / Math.max(1, R.cool.liquidKW + R.cool.airKW) * 100) + ' %'], [['TCS flow', 'TCS流量'], F(q.tcsFlow) + ' m³/h'], [['Per rack', '每柜'], F(q.perRack) + ' L/min'], [['Annual PUE', '年均PUE'], F(R.eff.pue, 2)]];
    o += L.hot('flowT', ['Coolant flow', '冷却液流量'], 1604, 470, 236, 300, L.dbox(1608, 478, 228, ['Heat split', '热量分配'], rows, '#0B7F99'), ['click for the flow calculation', '点击查看流量计算']);
    return o;
  }
  function pfd(c) {
    var q = lq(c), o = '';
    o += L.banner(20, 0, 1200, ['① COLD PLATE → RACK → CDU (TCS LOOP) | 冷板 → 机柜 → CDU', '① 冷板 → 机柜 → CDU | TCS LOOP'], ['coolant ≈ 35 → 45 °C through cold plates, manifolds and the CDU', '冷却液约35→45 °C流经冷板、分液器及CDU'], null, 'tcZone');
    o += bubble(c, q) + rackCut(c, q) + cduCut(c, q) + power(c, q) + facility(c, q) + building(c, q);
    return '<svg class="tc-pfd tc-abs" viewBox="0 0 1860 840" role="img" aria-label="' + L.te(['Direct liquid cooling: cold plates, rack manifolds, CDU, facility water and dry coolers', '冷板液冷：冷板、机柜分液器、CDU、设施水及干冷器']) + '">' + o + '</svg>';
  }
  function steps(c) {
    var R = c.R, q = lq(c), hp = q.hp, me = q.me, el = R.el;
    return [
      { k: ['gpu'], t: ['Heat into the cold plates', '热量进入冷板'], d: ['Every GPU and CPU carries a micro-channel <b>cold plate</b>; coolant enters at ≈ 35 °C and leaves at ≈ 45 °C, taking <b>' + F(q.liq * 100) + ' %</b> of the rack heat at ≈ 1.5 L/min per kW.', '每颗GPU与CPU上装有微通道<b>冷板</b>；冷却液约35 °C进入、约45 °C流出，带走机柜<b>' + F(q.liq * 100) + '%</b>的热量，约1.5 L/min/kW。'] },
      { k: ['airack'], t: ['The AI rack', 'AI机柜'], d: [hp.en.split(' (')[0] + ': <b>' + hp.kw + ' kW</b> (peak ' + hp.kwPeak + ' kW), ' + (hp.gpu || '–') + ' GPUs, ≈ ' + F(hp.kg) + ' kg — ' + F(R.cap.hdR) + ' of them here. Air alone would need ≈ ' + F(hp.kw / (1.2 * 1.006 * 12) * 3600) + ' m³/h per rack.', hp.zh.split('（')[0] + '：<b>' + hp.kw + ' kW</b>（峰值' + hp.kwPeak + ' kW），' + (hp.gpu || '–') + '颗GPU，约' + F(hp.kg) + ' kg——本设计' + F(R.cap.hdR) + '个。若仅靠风冷，每柜约需' + F(hp.kw / (1.2 * 1.006 * 12) * 3600) + ' m³/h风量。'] },
      { k: ['manifold'], t: ['Manifolds & quick disconnects', '分液器与快插接头'], d: ['Rack manifolds behind the rack feed every tray through <b>dripless quick disconnects</b>: ≈ <b>' + F(q.perRack) + ' L/min</b> per rack at ΔT 10 K.', '机柜后部分液器经<b>无滴漏快插接头</b>向每个托盘供液：温差10 K时每柜约<b>' + F(q.perRack) + ' L/min</b>。'] },
      { k: ['cdu', 'coolant'], t: ['CDU', 'CDU'], d: ['<b>' + (me.cduN + me.cduR) + ' × ' + F(me.cduSize) + ' kW</b> CDUs pump the technology loop (TCS, ' + F(q.tcsFlow) + ' m³/h of PG25) and pass the heat through a plate heat exchanger to the facility water, with N+1 pumps, filtration and pressure control.', '<b>' + (me.cduN + me.cduR) + ' × ' + F(me.cduSize) + ' kW</b> CDU驱动技术冷却环路（TCS，PG25 ' + F(q.tcsFlow) + ' m³/h），经板式换热器将热量传给设施水，配N+1水泵、过滤及压力控制。'] },
      { k: ['leak'], t: ['Leak detection', '漏水检测'], d: ['Sensing cables under the manifolds and CDUs alarm within seconds; loops run at low pressure and the CDU can isolate a rack.', '分液器及CDU下方感应线缆数秒内报警；环路低压运行，CDU可隔离单个机柜。'] },
      { k: ['fws'], t: ['Facility water', '设施水'], d: ['Facility-water pumps carry <b>' + F(R.cool.liquidKW / 1000, 1) + ' MW</b> from the CDUs to the dry coolers: ≈ ' + F(q.fwsFlow) + ' m³/h at 32 → 42 °C.', '设施水泵将<b>' + F(R.cool.liquidKW / 1000, 1) + ' MW</b>从CDU送至干冷器：32→42 °C约' + F(q.fwsFlow) + ' m³/h。'] },
      { k: ['dry'], t: ['Dry coolers', '干冷器'], d: ['<b>' + (me.dcN + me.dcR) + ' × ' + F(K.DC_KW) + ' kW</b> dry coolers cool the water with outdoor air up to ' + F(R.L.db, 1) + ' °C: warm water needs <b>no chillers</b> most of the year and no evaporation; adiabatic pads help on the hottest hours.', '<b>' + (me.dcN + me.dcR) + ' × ' + F(K.DC_KW) + ' kW</b>干冷器以至' + F(R.L.db, 1) + ' °C的室外空气冷却温水：全年多数时段<b>无需冷机</b>、不耗水蒸发；最热时段湿帘预冷辅助。'] },
      { k: ['trim', 'resair'], t: ['Residual air + trim chiller', '余热风冷+补冷'], d: ['The ' + F((1 - q.liq) * 100) + ' % not caught by the cold plates — memory, drives, power supplies, network — still leaves by air: <b>' + F(R.cool.airKW / 1000, 1) + ' MW</b> through fan walls on chilled water from a small trim chiller, which also tops up the facility water on the hottest hours.', '冷板未带走的' + F((1 - q.liq) * 100) + '%（内存、硬盘、电源、网络）仍经空气排出：<b>' + F(R.cool.airKW / 1000, 1) + ' MW</b>由小型补冷冷机供冷的风墙带走，冷机在最热时段亦为设施水补冷。'] },
      { k: ['aipow'], t: ['Power for AI racks', 'AI机柜供电'], d: ['Each ' + hp.kw + ' kW rack draws ≈ <b>' + F(q.amps) + ' A</b> at ' + (el.lvV || 400) + ' V through OEM power shelves, fed from busway A and B (' + (el.bwHdA || el.bwA) + ' A per run).', '每个' + hp.kw + ' kW机柜在' + (el.lvV || 400) + ' V下约<b>' + F(q.amps) + ' A</b>，经OEM电源架由A、B母线（每条' + (el.bwHdA || el.bwA) + ' A）供电。'] },
      { k: ['bess'], t: ['BESS for load swings', '储能缓冲波动'], d: [el.bess ? 'A <b>' + F(el.bess.mw, 1) + ' MW / ' + F(el.bess.mwh, 1) + ' MWh</b> BESS absorbs the swings of synchronised training jobs so generators and the PLN connection see a smooth load.' : 'This design has no BESS; for large AI training loads a BESS of 10–25 % of IT power smooths the swings.', el.bess ? '<b>' + F(el.bess.mw, 1) + ' MW / ' + F(el.bess.mwh, 1) + ' MWh</b>储能吸收同步训练任务的负荷波动，使发电机及PLN接入看到平稳负荷。' : '本设计无储能；大型AI训练负载宜配置IT功率10–25%的储能平滑波动。'] },
      { k: ['floor'], t: ['Floor loading', '楼面荷载'], d: ['A full rack weighs ≈ <b>' + F(hp.kg) + ' kg</b> on ' + hp.w + ' × ' + hp.d + ' mm: the floor is designed for ≥ <b>' + R.sp.floorLoad + ' kN/m²</b>, and pipe routes need clear height.', '满载机柜约<b>' + F(hp.kg) + ' kg</b>，占地' + hp.w + ' × ' + hp.d + ' mm：楼面按≥<b>' + R.sp.floorLoad + ' kN/m²</b>设计，管路需足够净高。'] },
      { k: ['flowT'], t: ['Result', '结果'], d: ['<b>' + F(R.cool.liquidKW / 1000, 1) + ' MW</b> leave by liquid and ' + F(R.cool.airKW / 1000, 1) + ' MW by air; with warm water and few chiller hours the annual PUE is <b>' + F(R.eff.pue, 2) + '</b>.', '<b>' + F(R.cool.liquidKW / 1000, 1) + ' MW</b>由液体带走、' + F(R.cool.airKW / 1000, 1) + ' MW由空气带走；温水运行、冷机时间少，年均PUE <b>' + F(R.eff.pue, 2) + '</b>。'] }
    ];
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
      [['Weight', '重量'], '≈ ' + F(hp.kg) + ' kg', ['floor ≥ ' + R.sp.floorLoad + ' kN/m²', '楼面≥' + R.sp.floorLoad + ' kN/m²']], [['Footprint', '占地'], hp.w + ' × ' + hp.d, ['mm | ' + hp.u + 'U', 'mm | ' + hp.u + 'U']],
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
    steps: steps,
    basisOk: function (x) { return x.R.cool.liquidKW > 0; },
    /* the selected design has no liquid cooling: put its high-density racks on the nearest liquid-cooled platform (the proposal then selects direct liquid cooling) */
    fallFix: function (x) {
      var hp = x.R.hdP, best = DB.platforms.filter(function (q) { return q.cool === 'DLC' && !q.provisional; }).sort(function (a, b) { return Math.abs(a.kw - hp.kw) - Math.abs(b.kw - hp.kw); })[0];
      if (!best) return null;
      var chg = { hdPlat: best.id }; if (!(x.p.hdShare > 0)) chg.hdShare = 10;
      return { chg: chg, label: ['Make the selected design liquid-cooled: high-density racks on ' + best.en.split(' (')[0] + ' (' + best.kw + ' kW)', '将所选设计改为液冷：高密度机柜采用' + best.zh.split('（')[0] + '（' + best.kw + ' kW）'] };
    }, fallNote: ['The selected design has no liquid cooling; the card shows benchmark A08 (AI factory, Batam).', '所选设计无液冷；卡片显示基准A08（巴淡AI工厂）。'],
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
