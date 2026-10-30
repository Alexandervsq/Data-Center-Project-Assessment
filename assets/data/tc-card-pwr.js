/* Technology card: Critical Power Chain (utility → MV → transformers → LV/generators → UPS/batteries → busway → racks; BESS). */
(function (g) {
  'use strict';
  var TC = g.TC, L = TC.lib, X = g.TCX, DB = g.DCDB, E = g.DCEngine, K = E.K, F = L.F, t = L.t;
  var EXTRA = {
    harm: { eq: 'EL-17', no: 'B', calc: 'gimp', extra: function (c) { return X.gimpTable ? X.gimpTable(c) : ''; },
      how: ['Active harmonic filters inject opposite currents that cancel the harmonics of UPS rectifiers, drives and IT power supplies, and correct the power factor, so transformers and generators are not overloaded and PLN power-quality limits are met.', '有源滤波器注入反向电流，抵消UPS整流器、变频器及IT电源产生的谐波，并校正功率因数，避免变压器与发电机过载并满足PLN电能质量要求。'],
      om: [['Measure harmonics at commissioning and after major IT changes.', '调试时及IT大规模变更后测量谐波。'], ['Size filters from a harmonic study (IEEE 519 limits).', '依据谐波研究（IEEE 519限值）选型滤波器。'], ['Check filter fans and capacitors every year.', '每年检查滤波器风扇与电容。']] },
    ldb: { eq: 'EL-21', no: 'C',
      how: ['Resistive (and reactive) load banks simulate the IT load during commissioning, so generators, UPS, cooling and controls are proven at full load before any server arrives — commissioning levels L4–L5 and the integrated systems test (IST).', '电阻（及电抗）负载箱在调试期间模拟IT负载，使发电机、UPS、制冷及控制系统在服务器进场前完成满负荷验证——即L4–L5级调试及综合系统测试（IST）。'],
      om: [['Plan load-bank connection points in the electrical design.', '在电气设计中预留负载箱接入点。'], ['Annual generator load-bank test at ≥ 80 % load.', '每年以≥80%负载进行发电机负载箱测试。'], ['Rack-mounted heaters prove airflow and containment in the halls.', '机柜式加热器用于验证机房气流及通道封闭。']],
      basis: function (c) { return ['Load banks for ' + F(c.R.cap.itKW) + ' kW of IT (rental for L4/L5)', '负载箱' + F(c.R.cap.itKW) + ' kW（L4/L5租赁）']; } },
    cable: { eq: 'EL-15', more: ['EL-16', 'EL-22'], no: 'D',
      how: ['Medium-voltage XLPE cables run in duct banks from the PLN substation to the switchgear; LV cables and busbar trunking connect transformers, switchboards and UPS. The A and B paths follow separate routes, so one fire or excavation cannot cut both.', '中压XLPE电缆经排管从PLN变电站敷设至开关柜；低压电缆及母线槽连接变压器、配电柜与UPS。A、B路径分开敷设，一次火灾或开挖不会同时切断两路。'],
      om: [['Partial-discharge and VLF tests on MV cables at commissioning.', '调试时对中压电缆进行局部放电及超低频（VLF）试验。'], ['Fire-stop every penetration; keep A and B in separate fire compartments.', '封堵所有贯穿孔；A、B路分属不同防火分区。'], ['Thermal scan of terminations every year.', '每年对电缆终端红外测温。']] }
  };
  function U(k, o) { return Object.assign({}, X.U[k] || EXTRA[k], o || {}); }
  var DC = { card: 'DC', label: ['Data center facility', '数据中心设施'] };
  var UNITS = [
    U('grid', { id: 'grid', no: '01', rel: [['mva', ['PLN demand', 'PLN需量']], DC] }),
    U('mvsg', { id: 'mvsg', no: '02', rel: [['tx', ['Transformers', '变压器']], ['tier', ['Redundancy', '冗余']]] }),
    U('tx', { id: 'tx', no: '03', rel: [['lv', ['LV switchboard', '低压配电']], ['mva', ['PLN demand', 'PLN需量']]] }),
    U('lv', { id: 'lv', no: '04', rel: [['gen', ['Generators', '发电机']], ['ups', ['UPS', 'UPS']]] }),
    U('gen', { id: 'gen', no: '05', rel: [['fuel', ['Fuel autonomy', '燃油自持']], ['fuelsys', ['Fuel system', '燃油系统']]] }),
    U('bess', { id: 'bess', no: '06', rel: [['bessT', ['BESS sizing', '储能选型']], { card: 'DLC', label: ['Direct liquid cooling', '冷板液冷'] }] }),
    U('ups', { id: 'ups', no: '07', rel: [['batt', ['Battery autonomy', '电池后备']], ['tier', ['Redundancy', '冗余']]] }),
    U('batt', { id: 'battu', no: '08', rel: [['batt', ['Battery autonomy', '电池后备']], { card: 'FSM', label: ['Fire · security · monitoring', '消防·安防·监控'] }] }),
    U('bwy', { id: 'bwy', no: '09', rel: [['bwyT', ['Busway sizing', '母线选型']], ['rpdu', ['Rack PDUs', '机柜PDU']]] }),
    U('rpdu', { id: 'rpdu', no: '10', rel: [['bwyT', ['Rack power', '机柜供电']]] }),
    U('earth', { id: 'earth', no: '11' }),
    U('epms', { id: 'epms', no: '12', rel: [{ card: 'FSM', label: ['Monitoring', '监控'] }] }),
    U('fuel', { id: 'fuelsys', no: 'A', rel: [['fuel', ['Fuel autonomy', '燃油自持']]] }),
    U('harm', { id: 'harm', no: 'B' }), U('ldb', { id: 'ldb', no: 'C' }), U('cable', { id: 'cable', no: 'D' })
  ];
  var THEORY = [['tier', 'tier'], ['mva', 'mva'], ['gimp', 'gimp'], ['batt', 'batt'], ['fuel', 'fuel'], ['bwyT', 'bwy'], ['bessT', 'bess']];
  var FAQ = [
    [['Why do data centers need both UPS and generators?', '为什么数据中心既需要UPS又需要发电机？'], ['The UPS bridges seconds to minutes with batteries and conditions the power; generators then run for hours or days on stored diesel. A BESS can shave peaks and buffer AI load swings but does not replace either.', 'UPS用电池桥接数秒至数分钟并调理电能；随后由发电机依靠储存的柴油运行数小时乃至数天。储能可削峰并缓冲AI负荷波动，但不能替代二者。']],
    [['Why is 5 minutes of battery enough?', '为什么5分钟电池后备就够了？'], ['Generators start and carry the load in ≈ 10–15 s. Five minutes leaves time for several restart attempts and manual intervention. VRLA batteries are usually sized for 10–15 minutes because their capacity is less certain at end of life.', '发电机约10–15 s启动并带载。5分钟可容纳数次重启尝试及人工干预。阀控铅酸电池寿命末期容量不确定性更大，通常按10–15分钟配置。']],
    [['How much diesel is stored and how long can the site run?', '储存多少柴油？站点可运行多久？'], ['Typically 24–48 h at full load in Java, more on weaker grids. A 10 MW Tier III facility burns ≈ 4 m³ of diesel per hour at maximum demand, so 24 h needs ≈ 100 m³ — refuelling contracts extend this indefinitely.', '在爪哇通常为满载24–48 h，电网较弱地区更长。10 MW Tier III设施在最大需量下每小时约耗4 m³柴油，24 h约需100 m³——加油合同可使其无限延长。']],
    [['Can the PLN grid be relied on?', 'PLN电网可靠吗？'], ['The Java–Madura–Bali (JAMALI) system is large and reliable; Sumatra, Kalimantan and eastern Indonesia are weaker. Data centers still assume the grid can fail at any time — that is why Tier III/IV designs use two feeders, generators and UPS.', '爪哇-马都拉-巴厘（JAMALI）电网规模大且可靠；苏门答腊、加里曼丹及印尼东部较弱。数据中心仍假设电网随时可能失电——因此Tier III/IV设计采用双路进线、发电机及UPS。']],
    [['What is the difference between N+1 and 2N?', 'N+1与2N有何区别？'], ['N+1 adds one spare unit to a shared system (efficient, concurrently maintainable). 2N builds two complete, separate systems A and B, each able to carry the whole load — it survives faults anywhere in one system but costs more.', 'N+1在共用系统中增加一台备用（经济、可同时维护）。2N建设A、B两套完整独立系统，每套均可承担全部负荷——可承受任一系统中的任何故障，但成本更高。']],
    [['Is a BESS worth it for an AI data center?', 'AI数据中心值得配置储能吗？'], ['Often yes: training jobs make the load jump by tens of megawatts in seconds, which stresses generators and the PLN connection. A BESS of 10–25 % of IT power for 1–2 h smooths the swings and can earn its keep through peak shaving.', '通常值得：训练任务会使负荷在数秒内跳变数十兆瓦，冲击发电机及PLN接入。按IT功率10–25%、1–2 h配置的储能可平抑波动，并通过削峰收回成本。']],
    [['Why busway instead of cables to each rack?', '为什么用母线而不是逐柜敷设电缆？'], ['Busway runs once above each row; racks plug in tap-off boxes wherever needed, so densities can change without new cables. It is faster to install, easier to meter and frees floor and tray space.', '母线只需在每排上方敷设一次；机柜按需插接取电，密度变化时无需重新敷设电缆。安装更快、计量更方便，并节省地面与桥架空间。']]
  ];

  function band() {
    var s = L.R(0, 513, 1470, 107, 'url(#tcSoil)') + L.R(0, 513, 1470, 107, 'url(#tcEarth)');
    [544, 572].forEach(function (y, i) { s += L.pipe('M0 ' + y + 'H1470', i ? 'lv' : 'mv', 6, true, i === 1); });
    for (var x = 60; x < 1470; x += 180) s += '<path d="M' + x + ' 513V588" stroke="#B9874A" stroke-width="3"/><circle cx="' + x + '" cy="590" r="4" fill="#B9874A"/>';
    return s + L.text(735, 612, ['Underground: MV and LV cable duct banks on separate A / B routes · earthing grid with electrodes (≤ 1 Ω)', '地下：A/B分路由的中压及低压电缆排管 · 带接地极的接地网（≤1 Ω）'], 'tc-ls', ' text-anchor="middle" style="font-weight:700;fill:#5C4523"');
  }
  function pfd(c) {
    var R = c.R, el = R.el, cap = R.cap, p = c.p, o = '';
    o += L.ground(132, 232, 1330) + L.R(132, 242, 1330, 40, 'url(#tcSoil)', ' opacity=".5"') + L.R(0, 497, 1470, 16, 'url(#tcGround)') + band();
    o += '<path d="M24 112Q66 128 104 146M74 112Q94 124 120 146M50 96Q82 118 136 146" fill="none" stroke="#D58A12" stroke-width="1.6"/>';
    o += L.pipe('M168 205H200', 'mv', 7) + L.pipe('M322 205H350', 'mv', 7) + L.pipe('M534 205H570', 'lv', 7) + L.pipe('M725 205H690', 'gen', 7);
    o += L.pipe('M300 232V278H1048V236', 'mv', 4, true, true) + L.thin('M800 250V232', 'fuel', 3, '4 4');
    o += L.pipe('M630 140V112H1462V446H1418', 'lv', 7);
    o += L.pipe('M1262 470H1236', 'dc', 6, true, true) + L.pipe('M1270 404V388H1032', 'lv', 6);
    o += L.banner(140, 0, 1310, ['① UTILITY, TRANSFORMATION & BACK-UP · 市电、变压与备用', '① 市电、变压与备用 · UTILITY & BACK-UP'], ['two PLN feeders, transformers, generators and storage', '两路PLN进线、变压器、发电机及储能'], null, 'tcZone3');
    o += L.banner(560, 290, 900, ['② CRITICAL POWER · 关键供电', '② 关键供电 · CRITICAL POWER'], ['UPS + batteries → busway → rack PDUs, on A and B paths', 'UPS+电池 → 母线 → 机柜PDU，A、B双路'], null, 'tcZone');
    o += L.banner(130, 290, 410, ['③ PROTECTION · 保护与监控', '③ 保护与监控 · PROTECTION'], ['earthing · monitoring', '接地 · 监控'], null, 'tcZone5');
    /* row 1 */
    o += L.hot('grid', UNITS[0].name, 14, 38, 160, 200, L.pylon(50, 232, 150) + L.powerTx(80, 232, .92) + L.label(95, 60, '01', ['PLN grid', 'PLN电网'], el.hv.name + ' · ' + F(el.mva, 1) + ' MVA'));
    o += L.hot('mvsg', ['MV switchgear', '中压开关柜'], 194, 38, 140, 200, L.switchgear(200, 140, 5, 122, 92) + L.label(262, 60, '02', ['MV switchgear', '中压开关柜'], el.hv.kv > 20 ? ['GIS ' + el.hv.ur + ' kV · ' + el.hv.mv.boards + ' × 24 kV', 'GIS ' + el.hv.ur + ' kV · ' + el.hv.mv.boards + '段24 kV'] : [el.hv.circ + ' feeders · 24 kV', el.hv.circ + '路进线 · 24 kV']));
    o += L.hot('tx', ['Transformers', '变压器'], 344, 38, 196, 200, L.dryTx(350, 130, 86, 102) + L.dryTx(446, 130, 86, 102) + L.text(393, 126, 'A', 'tc-lt', ' text-anchor="middle"') + L.text(489, 126, 'B', 'tc-lt', ' text-anchor="middle"') + L.label(442, 60, '03', ['Transformers', '变压器'], el.txTotal + ' × ' + F(el.txSize) + ' kVA'));
    o += L.hot('lv', ['LV switchboard', '低压配电柜'], 562, 38, 150, 200, L.lvBoard(572, 140, 4, 118, 92) + L.label(628, 60, '04', ['LV + ATS', '低压+ATS'], [el.txTotal + ' line-ups', el.txTotal + '组']));
    o += L.hot('gen', ['Generators', '发电机'], 720, 38, 196, 200, L.genset(725, 160, 180, 72) + L.label(815, 60, '05', ['Generators', '发电机'], el.genTotal + ' × ' + F(el.genSize) + ' kWe'));
    var bx = L.bessBox(960, 172, 150, 60) + L.bessBox(1124, 172, 150, 60) + L.R(1288, 182, 44, 50, '#3A3F63', ' rx="3"') + L.text(1310, 212, 'PCS', 'tc-lw', ' text-anchor="middle"');
    o += L.hot('bess', ['BESS', '储能'], 952, 38, 390, 200, bx + L.label(1118, 60, '06', ['BESS (LFP)', '储能（LFP）'], el.bess ? F(el.bess.mw, 1) + ' MW / ' + F(el.bess.mwh, 1) + ' MWh' : ['optional · peak shaving', '可选 · 削峰']));
    o += L.hot('fuelsys', ['Fuel system', '燃油系统'], 726, 244, 200, 36, L.fuelTank(730, 250, 160, 24) + L.text(900, 266, ['A · fuel', 'A · 燃油'], 'tc-lc'));
    /* row 2 */
    o += L.hot('ups', ['UPS systems', 'UPS系统'], 1250, 330, 196, 170, L.upsCab(1262, 394, 4, 156, 104) + L.label(1340, 352, '07', ['UPS systems', 'UPS系统'], el.upsTotal + ' × ' + F(el.upsSize) + ' kW · ' + el.upsLabel));
    o += L.hot('battu', ['Batteries', '电池'], 1070, 330, 172, 170, L.battRack(1080, 404, 5, 154, 94, p.battery === 'LI') + L.label(1156, 352, '08', ['Batteries', '电池'], F(el.battKWh) + ' kWh · ' + p.upsMin + ' min'));
    var row = L.rackRow(640, 434, 9, 40, 64, { blink: true });
    o += L.hot('bwy', ['Busway', '母线'], 610, 330, 440, 98, L.busway(620, 388, 410, 9, 14) + L.label(720, 352, '09', ['Busway A + B', '母线A+B'], el.useBusway ? el.busways + ' × ' + el.bwA + ' A' : el.pdus + ' × PDU'));
    o += L.hot('rpdu', ['Rack PDUs', '机柜PDU'], 630, 430, 380, 70, row + L.label(946, 352, '10', ['Rack PDUs', '机柜PDU'], F(cap.racks) + ' × ' + F(cap.avgDens, 1) + ' kW'));
    var lp = L.building(160, 440, 120, 58, '#5D6280') + '<path d="M220 420V426M220 426L214 440M220 426L226 440" stroke="#5E6484" stroke-width="2.4"/><path d="M276 440V500" stroke="#B9874A" stroke-width="2.5"/>';
    o += L.hot('earth', ['Earthing & lightning', '接地与防雷'], 140, 330, 180, 170, lp + L.label(232, 352, '11', ['Earthing & SPD', '接地与浪涌'], ['≤ 1 Ω · LPL I/II', '≤1 Ω · 防雷I/II级']));
    o += L.hot('epms', ['EPMS', '电力监控'], 340, 330, 210, 170, L.nocWall(360, 404, 180, 94) + L.label(450, 352, '12', ['EPMS', '电力监控'], ['≈ ' + F(R.fs.meters) + ' meters', '约' + F(R.fs.meters) + '块电表']));
    return '<svg class="tc-pfd tc-abs" viewBox="0 0 1470 620" role="img" aria-label="' + L.te(['Critical power chain', '关键供电链']) + '">' + o + '</svg>';
  }
  function principleSvg() {
    var o = '<svg viewBox="0 0 340 196" role="img" aria-label="2N">';
    function chain(y, lab) {
      var s = L.R(6, y, 56, 30, '#E39B1B', ' rx="8"') + L.text(34, y + 20, lab, 'tc-lw', ' text-anchor="middle"');
      [['TX', 78], ['UPS', 142], ['PDU', 206]].forEach(function (b) { s += L.R(b[1], y, 50, 30, '#3F3CBB', ' rx="8"') + L.text(b[1] + 25, y + 20, b[0], 'tc-lw', ' text-anchor="middle"'); });
      return s + '<path d="M62 ' + (y + 15) + 'H78M128 ' + (y + 15) + 'H142M192 ' + (y + 15) + 'H206" stroke="#E8A93A" stroke-width="4"/>';
    }
    o += chain(26, 'A') + chain(124, 'B') + L.R(282, 66, 52, 66, '#17153F', ' rx="6"');
    for (var i = 0; i < 4; i++) o += L.R(288, 74 + i * 14, 40, 9, '#3A3F6E', ' rx="1"') + '<circle cx="322" cy="' + (78.5 + i * 14) + '" r="1.6" fill="#5BE0B0"/>';
    o += '<path d="M256 41H268V86H282M256 139H268V112H282" fill="none" stroke="#E8A93A" stroke-width="4"/>';
    return o + L.text(170, 92, ['dual-corded server', '双电源服务器'], 'tc-ls', ' text-anchor="middle" style="font-weight:700"') + '</svg>';
  }
  function right(c) {
    var R = c.R, el = R.el, p = c.p;
    return L.principle('tier', 'shield', ['Two paths to every rack', '每柜两条路径'], principleSvg(), ['Independent A and B paths feed every dual-corded server, so either path can be maintained — or fail — without stopping the IT.', '独立的A、B路径为每台双电源服务器供电，任一路维护或故障时IT均不中断。']) +
      L.chips([['fuelsys', 'drop', ['Fuel system', '燃油系统']], ['harm', 'wave', ['Harmonics', '谐波']], ['ldb', 'gauge', ['Load banks', '负载箱']], ['cable', 'plug', ['Cables', '电缆']]]) +
      L.kpis([['tier', F(R.cap.tier.avail, 3), '%', 'Tier ' + X.roman(p.tier), ['availability target', '可用性目标']],
        ['batt', String(p.upsMin), 'min', ['UPS autonomy', 'UPS后备'], X.bat(c)],
        ['fuel', String(p.fuelH), 'h', ['Fuel autonomy', '燃油自持'], [F(el.fuelL / 1000) + ' m³ diesel', '柴油' + F(el.fuelL / 1000) + ' m³']],
        ['mva', F(el.mva, 1), 'MVA', ['PLN demand', 'PLN需量'], [F(el.demandKW) + ' kW peak', '峰值' + F(el.demandKW) + ' kW']]]);
  }
  function bottom(c) {
    var R = c.R, el = R.el, cap = R.cap, h = '';
    h += L.tile(0, 'tier', 'shield', ['Redundancy here', '本设计冗余'], 'Tier ' + X.roman(c.p.tier), L.facts([
      [['Transformers', '变压器'], el.txTotal + ' × ' + F(el.txSize), [el.txLabel + ' · kVA', el.txLabel + ' · kVA']], [['Generators', '发电机'], el.genTotal + ' × ' + F(el.genSize), [el.genLabel + ' · kWe', el.genLabel + ' · kWe']],
      [['UPS', 'UPS'], el.upsTotal + ' × ' + F(el.upsSize), [el.upsLabel + ' · kW', el.upsLabel + ' · kW']], [['Feeds per rack', '每柜进线'], el.feedsPerRack === 2 ? 'A + B' : 'A', [R.el.feeds + ' PLN feeder(s)', R.el.feeds + '路PLN进线']]]));
    var it = cap.itKW / 1000, cool = cap.itKW * (R.eff.puePeak - 1) / 1000, other = el.demandKW / 1000 - it - cool;
    h += L.tile(1, 'mva', 'bolt', ['From IT to PLN', '从IT到PLN'], F(el.mva, 1) + ' MVA', L.miniBars([[['IT load', 'IT负载'], it, '#3F3CBB', 1], [['Cooling (design day)', '制冷（设计日）'], cool, '#0EA5C6', 1], [['UPS losses & other', 'UPS损耗及其他'], other, '#E39B1B', 1], [['Maximum demand', '最大需量'], el.demandKW / 1000, '#17153F', 1]], el.demandKW / 1000, ' MW') +
      L.note(['÷ PF ' + K.PF + ' → <b>' + F(el.mva, 1) + ' MVA</b> · ' + t(el.volt), '÷ 功率因数' + K.PF + ' → <b>' + F(el.mva, 1) + ' MVA</b> · ' + el.volt[1]]), '#FDF2DD');
    h += L.tile(2, 'batt', 'battery', ['LFP or VRLA', '锂电还是铅酸'], X.bat(c), L.mtable(['', 'LFP', 'VRLA'], [[['Design life', '设计寿命'], ['12–15 yr', '12–15年'], ['5–7 yr', '5–7年']], [['Footprint & weight', '占地与重量'], '≈ 1/3', '1'], [['Typical autonomy', '典型后备'], '5 min', '10–15 min'], [['Monitoring', '监测'], ['per module', '按模块'], ['per jar', '按单体']]].map(function (r) { return r.map(t); })) +
      L.note(['LFP: off-gas detection and NFPA 855 spacing.', '磷酸铁锂：逸出气体探测及NFPA 855间距。']));
    var rowKW = cap.itKW / el.rows;
    h += L.tile(3, 'bwyT', 'plug', ['Rack power', '机柜供电'], [F(cap.avgDens, 1) + ' kW avg', '平均' + F(cap.avgDens, 1) + ' kW'], L.facts([
      [['Standard rack', '标准机柜'], F(cap.sd, 1) + ' kW', el.rStd], [['High-density rack', '高密度机柜'], cap.hdR ? F(cap.hd) + ' kW' : '–', el.rHd || ['none', '无']],
      [['Per row', '每排'], F(rowKW) + ' kW', [el.bwA + ' A busway', el.bwA + ' A母线']], [['Rack PDUs', '机柜PDU'], F(el.rpdus), [el.feedsPerRack + ' per rack', '每柜' + el.feedsPerRack + '个']]]));
    h += L.tile(4, 'faq', 'chat', ['Client questions', '客户问题'], [FAQ.length + ' answers', FAQ.length + '个解答'], '<div class="tc-qs">' + FAQ.slice(0, 4).map(function (q) { return '<span>' + L.te(q[0]) + '</span>'; }).join('') + '</div>', '#E2F5FA');
    return h;
  }
  var card = {
    id: 'PWR', abbr: null, title: ['Critical Power Chain', '关键供电链'], short: ['Critical Power Chain', '关键供电链'], icon: 'bolt',
    blurb: ['PLN, transformers, generators, UPS, BESS, busway', 'PLN、变压器、发电机、UPS、储能、母线'], badge: ['Electrical power', '电气供电'], basis: 'A05', calc: X.CALC, units: UNITS, faq: FAQ,
    gloss: [['PCS', '功率变换系统', 'Power conversion system — the inverter of a BESS.', '储能系统的逆变器。'], ['XLPE', '交联聚乙烯', 'Cross-linked polyethylene cable insulation.', '交联聚乙烯电缆绝缘。'], ['VLF', '超低频', 'Very-low-frequency cable test.', '超低频电缆试验。'], ['LPL', '防雷等级', 'Lightning protection level (IEC 62305).', '防雷保护等级（IEC 62305）。']],
    sources: [['Uptime Institute Tier Standard: Topology', 'Uptime Institute等级标准：拓扑'], 'ANSI/TIA-942-C', 'IEC 62040-3', 'IEC 62271', 'ISO 8528', ['NFPA 855, UL 9540A', 'NFPA 855、UL 9540A'], ['PLN tariff adjustment Q4 2026', 'PLN 2026年第四季度电价'], ['Assessment engine (DCEngine.K constants)', '评估引擎（DCEngine.K常数）']],
    stage: function (c) {
      var R = c.R, el = R.el, p = c.p;
      card.tag = ['<b>' + F(el.mva, 1) + ' MVA</b> from PLN reaches every rack on two independent paths: transformers ' + el.txLabel + ', generators ' + el.genLabel + ' with <b>' + p.fuelH + ' h</b> fuel, UPS ' + el.upsLabel + ' with <b>' + p.upsMin + ' min</b> ' + (p.battery === 'LI' ? 'LFP' : 'VRLA') + '.',
        'PLN <b>' + F(el.mva, 1) + ' MVA</b>经两条独立路径到达每个机柜：变压器' + el.txLabel + '，发电机' + el.genLabel + '燃油<b>' + p.fuelH + ' h</b>，UPS ' + el.upsLabel + '后备<b>' + p.upsMin + ' min</b>' + (p.battery === 'LI' ? '磷酸铁锂' : '铅酸') + '。'];
      return L.header(card) + pfd(c) + right(c) + bottom(c) + L.footer(['Indicative planning values for the selected design basis; protection, coordination and arc-flash studies follow in detailed design.', '所选设计基准的规划参考值；保护、选择性配合及弧闪研究在详细设计阶段完成。'], [['basis', L.UI.basis], ['gloss', L.UI.gloss]]);
    },
    panels: function (c) {
      var P = UNITS.map(function (u) { return L.unitPanel(u, c); });
      THEORY.forEach(function (th, i) { P.push(L.theoryPanel(Object.assign({}, X.TH[th[1]], { id: th[0] }), 'T' + (i + 1), c)); });
      P.push(L.faqPanel(card));
      return P;
    }
  };
  /* theory ids that differ from the calculator keys share the calculator */
  card.calc = Object.assign({}, X.CALC, { bwyT: X.CALC.bwy, bessT: X.CALC.bess });
  TC.register(card);
})(window);
