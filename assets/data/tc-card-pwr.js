/* Technology card: Critical Power Chain (utility → MV → transformers → LV/generators → UPS/batteries → busway → racks; BESS).
   Rev. 18: full-width illustration (1860 × 840) — path A and path B to the dual-corded rack, the generator bus feeding both ATS, back-up and protection,
   and the PLN-outage sequence; 14-step process flow. */
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
    U('batt', { id: 'battu', no: '08', rel: [['batt', ['Battery autonomy', '电池后备']], { card: 'FSM', label: ['Fire | security | monitoring', '消防·安防·监控'] }] }),
    U('bwy', { id: 'bwy', no: '09', rel: [['bwyT', ['Busway sizing', '母线选型']], ['rpdu', ['Rack PDUs', '机柜PDU']]] }),
    U('rpdu', { id: 'rpdu', no: '10', rel: [['bwyT', ['Rack power', '机柜供电']]] }),
    U('earth', { id: 'earth', no: '11' }),
    U('epms', { id: 'epms', no: '12', rel: [{ card: 'FSM', label: ['Monitoring', '监控'] }] }),
    U('fuel', { id: 'fuelsys', no: 'A', rel: [['fuel', ['Fuel autonomy', '燃油自持']]] }),
    U('harm', { id: 'harm', no: 'B' }), U('ldb', { id: 'ldb', no: 'C' }), U('cable', { id: 'cable', no: 'D', rel: [['cbl', ['Cable rating (IEC 60287)', '电缆载流量（IEC 60287）']]] })
  ];
  var THEORY = [['tier', 'tier'], ['mva', 'mva'], ['gimp', 'gimp'], ['batt', 'batt'], ['fuel', 'fuel'], ['bwyT', 'bwy'], ['bessT', 'bess'], ['cbl', 'cbl']];
  var FAQ = [
    [['Why do data centers need both UPS and generators?', '为什么数据中心既需要UPS又需要发电机？'], ['The UPS bridges seconds to minutes with batteries and conditions the power; generators then run for hours or days on stored diesel. A BESS can shave peaks and buffer AI load swings but does not replace either.', 'UPS用电池桥接数秒至数分钟并调理电能；随后由发电机依靠储存的柴油运行数小时乃至数天。储能可削峰并缓冲AI负荷波动，但不能替代二者。']],
    [['Why is 5 minutes of battery enough?', '为什么5分钟电池后备就够了？'], ['Generators start and carry the load in ≈ 10–15 s. Five minutes leaves time for several restart attempts and manual intervention. VRLA batteries are usually sized for 10–15 minutes because their capacity is less certain at end of life.', '发电机约10–15 s启动并带载。5分钟可容纳数次重启尝试及人工干预。阀控铅酸电池寿命末期容量不确定性更大，通常按10–15分钟配置。']],
    [['How much diesel is stored and how long can the site run?', '储存多少柴油？站点可运行多久？'], ['Typically 24–48 h at full load in Java, more on weaker grids. A 10 MW Tier III facility burns ≈ 4 m³ of diesel per hour at maximum demand, so 24 h needs ≈ 100 m³ — refuelling contracts extend this indefinitely.', '在爪哇通常为满载24–48 h，电网较弱地区更长。10 MW Tier III设施在最大需量下每小时约耗4 m³柴油，24 h约需100 m³——加油合同可使其无限延长。']],
    [['Can the PLN grid be relied on?', 'PLN电网可靠吗？'], ['The Java–Madura–Bali (JAMALI) system is large and reliable; Sumatra, Kalimantan and eastern Indonesia are weaker. Data centers still assume the grid can fail at any time — that is why Tier III/IV designs use two feeders, generators and UPS.', '爪哇-马都拉-巴厘（JAMALI）电网规模大且可靠；苏门答腊、加里曼丹及印尼东部较弱。数据中心仍假设电网随时可能失电——因此Tier III/IV设计采用双路进线、发电机及UPS。']],
    [['What is the difference between N+1 and 2N?', 'N+1与2N有何区别？'], ['N+1 adds one spare unit to a shared system (efficient, concurrently maintainable). 2N builds two complete, separate systems A and B, each able to carry the whole load — it survives faults anywhere in one system but costs more.', 'N+1在共用系统中增加一台备用（经济、可同时维护）。2N建设A、B两套完整独立系统，每套均可承担全部负荷——可承受任一系统中的任何故障，但成本更高。']],
    [['Is a BESS worth it for an AI data center?', 'AI数据中心值得配置储能吗？'], ['Often yes: training jobs make the load jump by tens of megawatts in seconds, which stresses generators and the PLN connection. A BESS of 10–25 % of IT power for 1–2 h smooths the swings and can earn its keep through peak shaving.', '通常值得：训练任务会使负荷在数秒内跳变数十兆瓦，冲击发电机及PLN接入。按IT功率10–25%、1–2 h配置的储能可平抑波动，并通过削峰收回成本。']],
    [['Why busway instead of cables to each rack?', '为什么用母线而不是逐柜敷设电缆？'], ['Busway runs once above each row; racks plug in tap-off boxes wherever needed, so densities can change without new cables. It is faster to install, easier to meter and frees floor and tray space.', '母线只需在每排上方敷设一次；机柜按需插接取电，密度变化时无需重新敷设电缆。安装更快、计量更方便，并节省地面与桥架空间。']]
  ];

  /* ---------------------------------------------------------------- illustration (1860 × 840), Rev. 18
     row 1: path A and path B from PLN to the dual-corded rack, EPMS and harmonics | row 2: generators + fuel, BESS, load banks, earthing, cables |
     row 3: what happens in a PLN outage (0 s → 10 s → 15 s → hours → PLN back) */
  function noSmoke(s) { return s.replace(/<circle[^>]*opacity="0"><animate[\s\S]*?<\/circle>/g, ''); }
  var LANE = [{ id: 'A', y: 44, col: '#E8A93A', bg: '#FFF8EC', st: '#F1D9A8' }, { id: 'B', y: 232, col: '#3F8FD0', bg: '#EEF4FD', st: '#C4D7F2' }];
  var ATSX = 590;
  function laneBg(L1) {
    var y = L1.y, k = L1.id;
    return L.R(232, y, 1268, 176, L1.bg, ' rx="14" stroke="' + L1.st + '" stroke-width="1.5"') + L.R(232, y, 24, 176, L1.col, ' rx="12"') +
      '<text x="244" y="' + (y + 54) + '" transform="rotate(-90 244 ' + (y + 54) + ')" text-anchor="middle" style="font-size:13px;font-weight:900;fill:#fff;letter-spacing:.12em">' + L.te(['PATH ' + k, k + '路']) + '</text>';
  }
  function lane(c, L1, first) {
    var R = c.R, el = R.el, p = c.p, y = L1.y, cy = y + 108, li = p.battery === 'LI', o = '', k = L1.id;
    /* cables of this path */
    o += L.fl('mvsg tx', L.pipe('M390 ' + cy + 'H450', 'mv', 6)) + L.fl('tx lv', L.pipe('M532 ' + cy + 'H650', 'lv', 6)) + L.fl('lv ups', L.pipe('M770 ' + cy + 'H820', 'lv', 6));
    o += L.fl('ups bwy', L.pipe('M920 ' + (y + 72) + 'H1070', 'lv', 6)) + L.fl('battu ups o1 o4', L.pipe('M940 ' + (y + 132) + 'H920', 'dc', 5, true, true));
    var id = function (x, s) { return L.text(x, y + 30, s, 'tc-ls', ' text-anchor="middle" style="font-size:12px;font-weight:800;fill:' + (k === 'A' ? '#A86A08' : '#2C6CA8') + '"'); };
    var mv = L.switchgear(270, y + 58, 4, 120, 100), tx = L.dryTx(450, y + 64, 82, 94), lv = L.lvBoard(650, y + 58, 4, 120, 100), ups = L.upsCab(820, y + 58, 3, 100, 100), bat = L.battRack(940, y + 84, 3, 90, 74, li);
    var bw = L.busway(1070, y + 66, 220, 6, 16) + L.rackRow(1078, y + 112, 6, 32, 48);
    if (first) {
      mv += L.label(330, y + 30, '02', ['MV switchgear', '中压开关柜'], [el.hv.mv.boards + ' × 24 kV | ' + el.hv.mv.ik + ' kA', el.hv.mv.boards + '段24 kV | ' + el.hv.mv.ik + ' kA']);
      tx += L.label(491, y + 30, '03', ['Transformers', '变压器'], el.txTotal + ' × ' + F(el.txSize) + ' kVA');
      lv += L.label(710, y + 30, '04', ['LV + ATS', '低压+ATS'], [(el.lvV || 400) + ' V | ' + F(el.lv.acb) + ' A', (el.lvV || 400) + ' V | ' + F(el.lv.acb) + ' A']);
      ups += L.label(808, y + 30, '07', ['UPS', 'UPS'], el.upsTotal + ' × ' + F(el.upsSize) + ' kW', 'start');
      bat += L.label(946, y + 30, '08', ['Batteries', '电池'], F(el.battKWh) + ' kWh', 'start');
      bw += L.label(1180, y + 30, '09', ['Busway', '母线'], el.useBusway ? el.busways + ' × ' + el.bwA + ' A' : el.pdus + ' × PDU');
    } else { mv += id(330, 'MV-B'); tx += id(491, 'TX-B'); lv += id(710, 'LV-B'); ups += id(870, 'UPS-B'); bat += id(985, ['Batt-B', '电池B']); bw += id(1180, ['Busway B', 'B母线']); }
    o += L.hot('mvsg', ['MV switchgear', '中压开关柜'], 262, y + 4, 136, 168, mv, [el.hv.mv.boards + ' sections × ' + F(el.hv.mv.busA) + ' A | ' + el.hv.mv.ik + ' kA | bus sections N.O.', el.hv.mv.boards + '段 × ' + F(el.hv.mv.busA) + ' A | ' + el.hv.mv.ik + ' kA | 分段常开']);
    o += L.hot('tx', ['Transformers', '变压器'], 438, y + 4, 106, 168, tx, [el.txLabel + ' | ' + F(el.txSize) + ' kVA cast resin | uk ' + el.lv.uk + ' %', el.txLabel + ' | ' + F(el.txSize) + ' kVA干式 | uk ' + el.lv.uk + ' %']);
    o += L.hot('lv', ['LV switchboards + ATS', '低压配电柜+ATS'], 562, y + 4, 216, 168, lv + L.R(ATSX - 20, cy - 14, 40, 28, '#fff', ' rx="5" stroke="#17153F" stroke-width="1.6"') + L.text(ATSX, cy + 5, 'ATS', 'tc-lt', ' text-anchor="middle" style="font-size:12px"'),
      [F(el.lv.acb) + ' A ACB | ' + el.lv.icw + ' kA | ATS: PLN ↔ generators', F(el.lv.acb) + ' A框架断路器 | ' + el.lv.icw + ' kA | ATS：市电↔发电机']);
    o += L.hot('ups', ['UPS systems', 'UPS系统'], 806, y + 4, 124, 168, ups, [el.upsLabel + ' | double conversion' + (c.p.eco ? ' + eco mode' : ''), el.upsLabel + ' | 双变换' + (c.p.eco ? ' + 节能模式' : '')]);
    o += L.hot('battu', ['Batteries', '电池'], 932, y + 4, 106, 168, bat, [F(el.battKWh) + ' kWh ' + (li ? 'LFP' : 'VRLA') + ' | ' + p.upsMin + ' min at full load', F(el.battKWh) + ' kWh ' + (li ? '磷酸铁锂' : '铅酸') + ' | 满载' + p.upsMin + ' min']);
    o += L.hot('bwy', ['Busway', '母线'], 1060, y + 4, 240, 168, bw, [el.busways + ' runs × ' + el.bwA + ' A | tap-off boxes per rack', el.busways + '条 × ' + el.bwA + ' A | 每柜插接箱']);
    o += L.fl('mvsg tx', L.tag(420, cy - 22, '20 kV', 'mv', null, 11.5)) + L.fl('tx lv', L.tag(552, cy + 26, (el.lvV || 400) + ' V', 'lv', null, 11.5));
    return o;
  }
  function pfd(c) {
    var R = c.R, el = R.el, hv = el.hv, p = c.p, cap = R.cap, o = '', li = p.battery === 'LI';
    o += L.banner(20, 0, 1820, ['① A + B POWER PATHS | A+B双路供电', '① A+B双路供电 | A + B POWER PATHS'], ['PLN → 20 kV → transformers → LV + ATS → UPS → busway → rack, once for each path', 'PLN → 20 kV → 变压器 → 低压+ATS → UPS → 母线 → 机柜，每路各一套'], null, 'tcZone3') + (g.DCSLD ? L.sldBtn(1630, 3) : '');
    o += laneBg(LANE[0]) + laneBg(LANE[1]);
    /* generator riser to both ATS, BESS to MV-B (over the path backgrounds, under the equipment) */
    o += L.fl('gen lv o3 o5', L.pipe('M' + ATSX + ' 512V' + (LANE[0].y + 122), 'gen', 6, true, true));
    o += L.fl('bess mvsg', L.pipe('M305 570V' + (LANE[1].y + 158), el.bess ? 'mv' : '#B9BED2', 5, !!el.bess));
    /* PLN */
    var gr = L.pylon(64, 404, 250) + '<path d="M40 176Q90 200 130 236M96 172Q120 196 150 236" fill="none" stroke="#D58A12" stroke-width="1.6"/>';
    gr += hv.kv > 20 ? L.powerTx(98, 404, .95) + L.tag(150, 270, 'GIS ' + (hv.ur || hv.kv) + ' kV', 'mv', null, 11.5) : L.building(104, 330, 100, 70, '#5D6280') + L.text(154, 392, 'PLN', 'tc-lt', ' text-anchor="middle" style="font-size:13px"');
    o += L.fl('grid mvsg', L.pipe('M200 ' + (LANE[0].y + 108) + 'H270', 'mv', 7) + L.pipe('M200 ' + (LANE[1].y + 108) + 'H270', 'mv', 7) + L.pipe('M200 ' + (LANE[0].y + 108) + 'V' + (LANE[1].y + 108), 'mv', 7, false));
    o += L.hot('grid', ['PLN grid', 'PLN电网'], 20, 40, 206, 380, gr + L.label(118, 74, '01', ['PLN grid', 'PLN电网'], hv.name + ' | ' + hv.circ + ' ' + t(['circuits', '回'])) + L.tag(118, 116, F(el.mva, 1) + ' MVA', 'mv', null, 12.5),
      [t(el.volt) + ' | PCC ≈ ' + F(hv.pccIk, 1) + ' kA', el.volt[1] + ' | 接入点约' + F(hv.pccIk, 1) + ' kA']);
    /* the two paths */
    o += lane(c, LANE[0], true) + lane(c, LANE[1], false);
    /* bus coupler between MV-A and MV-B (normally open) */
    o += L.fl('mvsg', '<path d="M284 202V290" stroke="#D58A12" stroke-width="3" stroke-dasharray="6 4"/>' + L.R(275, 216, 18, 20, '#fff', ' stroke="#17153F" stroke-width="1.6"') + '<path d="M278 233L290 219" stroke="#17153F" stroke-width="1.6"/>' + L.text(300, 231, ['N.O. coupler', '常开母联'], 'tc-ls', ' style="font-size:11px;font-weight:800"'));
    /* the dual-corded rack where the paths meet */
    var rk = L.rack(1350, 112, 80, 226, { blink: true }) + L.R(1338, 120, 7, 208, '#E8A93A', ' rx="3"') + L.R(1435, 120, 7, 208, '#3F8FD0', ' rx="3"');
    rk += L.R(1352, 214, 76, 18, '#fff', ' rx="3" stroke="#17153F" stroke-width="1.2"') + L.R(1356, 218, 10, 10, '#E8A93A', ' rx="2"') + L.R(1414, 218, 10, 10, '#3F8FD0', ' rx="2"') + L.text(1390, 228, 'PSU A | B', 'tc-ls', ' text-anchor="middle" style="font-size:9.5px;font-weight:800"');
    o += L.fl('bwy rpdu', L.pipe('M1290 ' + (LANE[0].y + 70) + 'H1341V120', 'lv', 5) + L.pipe('M1290 ' + (LANE[1].y + 70) + 'H1312V364H1438V328', '#3F8FD0', 5));
    o += L.hot('rpdu', ['Rack PDUs', '机柜PDU'], 1320, 40, 140, 380, rk + L.label(1390, 74, '10', ['Rack PDUs', '机柜PDU'], [F(cap.racks) + ' × ' + F(cap.avgDens, 1) + ' kW', F(cap.racks) + ' × ' + F(cap.avgDens, 1) + ' kW']) + L.text(1390, 392, ['dual-corded server', '双电源服务器'], 'tc-ls', ' text-anchor="middle" style="font-size:12px;font-weight:800"'),
      [el.rpdus + ' rack PDUs | ' + el.feedsPerRack + ' per rack (A + B)', el.rpdus + '个机柜PDU | 每柜' + el.feedsPerRack + '个（A+B）']);
    /* EPMS and harmonics */
    o += L.hot('epms', ['EPMS', '电力监控'], 1520, 40, 320, 182, L.nocWall(1560, 116, 236, 92) + L.label(1680, 74, '12', ['EPMS', '电力监控'], ['≈ ' + F(R.fs.meters) + ' meters | 1 s logging', '约' + F(R.fs.meters) + '块电表 | 1 s记录']), ['every breaker, UPS and generator reports to the NOC', '每台断路器、UPS及发电机均上传NOC']);
    var hw = '<path d="M1662 330c8-34 14 30 22 0s14-30 22 0 14 30 22 0 14-30 22 0 14 30 22 0" fill="none" stroke="#E5534B" stroke-width="2.4"/><path d="M1662 380c12-26 22-26 34 0s22 26 34 0 22-26 34 0" fill="none" stroke="#16A34A" stroke-width="2.4"/>';
    hw += L.text(1806, 334, ['before', '滤波前'], 'tc-ls', ' style="font-size:11px;fill:#B0302A;font-weight:800"') + L.text(1806, 384, ['after', '滤波后'], 'tc-ls', ' style="font-size:11px;fill:#16A34A;font-weight:800"');
    o += L.hot('harm', ['Harmonic filters', '谐波滤波器'], 1520, 230, 320, 190, L.cab(1556, 300, 76, 104, '#E9EBF4', { door: false, cap: '#7C3AED' }) + L.R(1564, 312, 60, 16, '#17153F', ' rx="2"') + '<path d="M1568 324l8-8 8 6 8-8 8 8 8-6" stroke="#5BE0B0" stroke-width="1.6" fill="none"/>' + hw + L.label(1680, 262, 'B', ['Harmonic filters', '谐波滤波器'], ['IEEE 519 | THDi ≤ 5–8 %', 'IEEE 519 | THDi ≤ 5–8%']),
      ['active filters cancel the harmonics of UPS rectifiers and IT power supplies', '有源滤波器抵消UPS整流器及IT电源谐波']);
    /* row 2: back-up, storage, protection */
    o += L.banner(20, 430, 1820, ['② BACK-UP, STORAGE & PROTECTION | 备用、储能与保护', '② 备用、储能与保护 | BACK-UP & PROTECTION'], ['generators + fuel | BESS | load banks | earthing | cables', '发电机+燃油 | 储能 | 负载箱 | 接地 | 电缆'], null, 'tcZone4');
    o += L.ground(20, 622, 1820);
    var bs = L.bessBox(34, 562, 120, 56) + L.bessBox(164, 562, 120, 56) + L.R(292, 570, 26, 48, '#3A3F63', ' rx="3"') + L.text(305, 598, 'PCS', 'tc-lw', ' text-anchor="middle" style="font-size:9px"');
    o += L.hot('bess', ['BESS', '储能'], 24, 466, 304, 160, (el.bess ? bs : '<g opacity=".45">' + bs + '</g>') + L.label(176, 482, '06', ['BESS (LFP)', '储能（LFP）'], el.bess ? F(el.bess.mw, 1) + ' MW / ' + F(el.bess.mwh, 1) + ' MWh' : ['optional here | peak shaving', '本设计可选 | 削峰']),
      el.bess ? [el.bess.containers + ' containers | buffers AI load swings, peak shaving', el.bess.containers + '个集装箱 | 缓冲AI负荷波动、削峰'] : ['not required for this design; useful for AI swings and peak shaving', '本设计无需；可用于AI负荷波动及削峰']);
    var gs = '', gx = [354, 530, 706];
    gx.forEach(function (x, i) { gs += noSmoke(L.genset(x, 560, 150, 58)) + '<path d="M' + (x + 100) + ' 519V560" stroke="#B8740B" stroke-width="4"/>' + L.text(x + 100, 552, i === 2 ? 'G' + el.genTotal : 'G' + (i + 1), 'tc-ls', ' text-anchor="end" style="font-size:11px;font-weight:800" dx="-6"'); });
    gs += L.R(352, 512, 520, 7, '#B8740B', ' rx="3"') + L.text(696, 552, '…', 'tc-lt', ' text-anchor="middle"');
    o += L.hot('gen', ['Generators', '发电机'], 340, 466, 548, 160, gs + L.label(760, 482, '05', ['Generators', '发电机'], [el.genTotal + ' × ' + F(el.genSize) + ' kWe | ' + el.genLabel, el.genTotal + ' × ' + F(el.genSize) + ' kWe | ' + el.genLabel]),
      ['start ≈ 10 s, on load ≈ 15 s (ISO 8528-5, NFPA 110 Type 10) | paralleled on one bus', '约10 s启动、约15 s带载（ISO 8528-5，NFPA 110 10型）| 并机母线']);
    o += L.fl('fuelsys gen o5', L.thin('M912 600H850', 'fuel', 3, '4 4'));
    o += L.hot('fuelsys', ['Fuel system', '燃油系统'], 896, 466, 236, 160, L.fuelTank(912, 586, 150, 30) + L.cylV(1080, 560, 36, 54, 'tcWhite') + L.R(1082, 586, 32, 22, '#4A4F6A', ' opacity=".6"') + L.label(1012, 482, 'A', ['Fuel system', '燃油系统'], [F(el.fuelL / 1000) + ' m³ | ' + p.fuelH + ' h', F(el.fuelL / 1000) + ' m³ | ' + p.fuelH + ' h']),
      [el.tanks + ' bulk tanks + day tanks | ≈ ' + F(el.fuelLph) + ' L/h at full load', el.tanks + '个储罐 + 日用油箱 | 满载约' + F(el.fuelLph) + ' L/h']);
    o += L.fl('ldb gen', L.thin('M872 515H1150V590H1166', 'sig', 2.4, '6 5'));
    o += L.hot('ldb', ['Load banks', '负载箱'], 1146, 466, 210, 160, L.cab(1166, 554, 150, 62, '#E9EBF4', { door: false, cap: '#E39B1B' }) + L.R(1176, 566, 92, 40, 'url(#tcLouvre)', ' rx="2"') + L.fan(1292, 586, 16, 1, true) + L.label(1250, 482, 'C', ['Load banks', '负载箱'], ['commissioning L4–L5', '调试L4–L5']),
      ['simulate the IT load before servers arrive; yearly generator tests ≥ 80 %', '服务器进场前模拟IT负载；每年发电机≥80%负载测试']);
    var ea = L.building(1404, 562, 116, 56, '#5D6280') + '<path d="M1462 520V546M1462 520l-6 10M1462 520l6 10" stroke="#5E6484" stroke-width="2.4"/><path d="M1526 546V640" stroke="#B9874A" stroke-width="2.5"/>';
    [1420, 1470, 1526].forEach(function (x) { ea += '<path d="M' + x + ' 626V644" stroke="#B9874A" stroke-width="3"/><circle cx="' + x + '" cy="645" r="3.5" fill="#B9874A"/>'; });
    o += L.hot('earth', ['Earthing & lightning', '接地与防雷'], 1370, 466, 230, 182, ea + '<path d="M1420 630H1526" stroke="#B9874A" stroke-width="2"/>' + L.label(1484, 482, '11', ['Earthing & SPD', '接地与浪涌'], ['≤ 1 Ω | LPL I/II', '≤1 Ω | 防雷I/II级']), ['earthing grid, lightning protection (IEC 62305) and surge protection at every board', '接地网、防雷（IEC 62305）及各配电柜浪涌保护']);
    var dk = L.R(1632, 548, 196, 70, 'url(#tcConc)', ' rx="4" stroke="#17153F" stroke-opacity=".3"');
    for (var i = 0; i < 3; i++) for (var j = 0; j < 2; j++) { dk += '<circle cx="' + (1652 + i * 22) + '" cy="' + (568 + j * 28) + '" r="9" fill="#fff" stroke="#E8A93A" stroke-width="3"/><circle cx="' + (1764 + i * 22) + '" cy="' + (568 + j * 28) + '" r="9" fill="#fff" stroke="#3F8FD0" stroke-width="3"/>'; }
    dk += '<path d="M1730 552V614" stroke="#5E6484" stroke-width="2" stroke-dasharray="4 3"/>';
    o += L.hot('cable', ['Cables', '电缆'], 1616, 466, 224, 160, dk + L.label(1728, 482, 'D', ['Cables & duct banks', '电缆与排管'], ['A and B on separate routes', 'A、B分路由']), ['XLPE MV cables in duct banks; A and B never share a route or fire compartment', '中压XLPE电缆穿排管；A、B不共用路由或防火分区']);
    /* row 3: outage sequence */
    o += outage(c);
    return '<svg class="tc-pfd tc-abs" viewBox="0 0 1860 840" role="img" aria-label="' + L.te(['Critical power chain: two paths, back-up and the outage sequence', '关键供电链：双路、备用及停电过程']) + '">' + o + '</svg>';
  }
  function outage(c) {
    var p = c.p, el = c.R.el, o = '', y = 760, used = Math.max(1, Math.round(15 / (p.upsMin * 60) * 100));
    o += L.banner(20, 650, 1820, ['③ WHEN PLN FAILS | PLN停电时', '③ PLN停电时 | WHEN PLN FAILS'], ['the chain switches by itself — the IT never sees the break', '供电链自动切换——IT不会感知断电'], null, 'tcZone2');
    var seg = [[60, 300, '#D58A12', ['PLN', 'PLN'], 'o6'], [300, 820, '#9A6FD6', ['UPS batteries', 'UPS电池'], 'o1 o2'], [820, 1640, '#B8740B', ['generators (diesel)', '发电机（柴油）'], 'o3 o4 o5'], [1640, 1800, '#D58A12', ['PLN', 'PLN'], 'o6']];
    o += L.text(60, 704, ['source feeding the IT', '向IT供电的电源'], 'tc-ls', ' style="font-size:12px;font-weight:800;fill:#6A6EA0"');
    seg.forEach(function (s) { o += L.fl(s[4], L.R(s[0], 714, s[1] - s[0] - 4, 22, s[2], ' rx="6"') + L.text((s[0] + s[1]) / 2, 730, s[3], 'tc-lw', ' text-anchor="middle" style="font-size:12px"')); });
    o += '<path d="M60 ' + y + 'H1800" stroke="#17153F" stroke-width="2.2"/>' + L.arrowHead(1810, y, 'r', '#17153F', 9);
    var ev = [
      [300, 'o1', ['0 s — PLN lost', '0 s — PLN失电'], ['UPS → batteries, no break', 'UPS转电池，无中断']],
      [560, 'o2', ['≈ 10 s — generators start', '约10 s — 发电机启动'], [el.genTotal + ' sets reach speed', el.genTotal + '台达到额定转速']],
      [820, 'o3', ['≈ 15 s — ATS → generators', '约15 s — ATS转发电机'], ['UPS back on its input', 'UPS恢复输入供电']],
      [1080, 'o4', ['minutes — batteries recharge', '数分钟 — 电池再充电'], ['used ≈ ' + used + ' % of ' + p.upsMin + ' min', '仅用约' + used + '%（' + p.upsMin + ' min）']],
      [1360, 'o5', ['hours — on diesel', '数小时 — 柴油运行'], [F(el.fuelL / 1000) + ' m³ = ' + p.fuelH + ' h + refuelling', F(el.fuelL / 1000) + ' m³ = ' + p.fuelH + ' h + 补油']],
      [1640, 'o6', ['PLN back — retransfer', 'PLN恢复 — 回切'], ['after ≥ 5 min stable', '稳定≥5 min后']]
    ];
    ev.forEach(function (e, i) { o += L.fl(e[1], '<circle cx="' + e[0] + '" cy="' + y + '" r="13" fill="#fff" stroke="#3F3CBB" stroke-width="3"/>' + L.text(e[0], y + 5, String(i + 1), 'tc-lt', ' text-anchor="middle" style="font-size:13px"') + L.text(e[0], y + 34, e[2], 'tc-lt', ' text-anchor="middle" style="font-size:13.5px"') + L.text(e[0], y + 54, e[3], 'tc-ls', ' text-anchor="middle" style="font-size:12.5px"')); });
    o += L.text(60, y + 34, ['normal', '正常'], 'tc-ls', ' style="font-size:12.5px;font-weight:800"') + L.text(60, y + 54, ['on PLN', '市电供电'], 'tc-ls', ' style="font-size:12.5px"');
    return o;
  }
  function steps(c) {
    var R = c.R, el = R.el, hv = el.hv, p = c.p, li = p.battery === 'LI', lvV = el.lvV || 400, cap = R.cap, used = Math.max(1, Math.round(15 / (p.upsMin * 60) * 100));
    var s = [
      { k: ['grid'], t: ['PLN supply', 'PLN供电'], d: ['PLN delivers <b>' + F(el.mva, 1) + ' MVA</b> at ' + hv.name + ' over ' + hv.circ + ' circuit(s) — ' + t(el.volt) + '. Two incomers split the load onto path A and path B.', 'PLN经' + hv.circ + '回线路以' + hv.name + '供电<b>' + F(el.mva, 1) + ' MVA</b>——' + el.volt[1] + '。两路进线分别接入A路与B路。'] },
      { k: ['mvsg'], t: ['MV switchgear A | B', '中压开关柜A|B'], d: ['20 kV switchgear in ' + hv.mv.boards + ' sections (' + F(hv.mv.busA) + ' A, ' + hv.mv.ik + ' kA). The coupler between the sections is <b>normally open</b>, so a fault on one section never reaches the other path.', '20 kV开关柜共' + hv.mv.boards + '段（' + F(hv.mv.busA) + ' A，' + hv.mv.ik + ' kA）。分段母联<b>常开</b>，一段故障不会波及另一路。'] },
      { k: ['tx'], t: ['Transformers', '变压器'], d: ['<b>' + el.txTotal + ' × ' + F(el.txSize) + ' kVA</b> cast-resin transformers (' + el.txLabel + ') step 20 kV down to ' + lvV + ' V. Path A and path B come from different blocks, so each block can lose a transformer and still carry its load.', '<b>' + el.txTotal + ' × ' + F(el.txSize) + ' kVA</b>干式变压器（' + el.txLabel + '）将20 kV降至' + lvV + ' V。A、B两路取自不同模块，每个模块失去一台变压器仍可带载。'] },
      { k: ['lv'], t: ['LV switchboards + ATS', '低压配电+ATS'], d: ['Each LV main switchboard (' + F(el.lv.acb) + ' A ACB, ' + el.lv.icw + ' kA for 1 s) has an <b>automatic transfer switch</b> that chooses PLN or the generator bus.', '每面低压总柜（' + F(el.lv.acb) + ' A框架断路器，1 s ' + el.lv.icw + ' kA）配<b>自动转换开关</b>，在市电与发电机母线间选择电源。'] },
      { k: ['ups', 'battu'], t: ['UPS + batteries', 'UPS+电池'], d: ['<b>' + el.upsTotal + ' × ' + F(el.upsSize) + ' kW</b> UPS (' + el.upsLabel + ') convert AC → DC → AC so the IT sees clean power; ' + F(el.battKWh) + ' kWh of ' + (li ? 'LFP' : 'VRLA') + ' batteries on the DC bus hold the load for <b>' + p.upsMin + ' min</b>.', '<b>' + el.upsTotal + ' × ' + F(el.upsSize) + ' kW</b> UPS（' + el.upsLabel + '）经交流→直流→交流变换，为IT提供纯净电源；直流母线上' + F(el.battKWh) + ' kWh' + (li ? '磷酸铁锂' : '铅酸') + '电池可支撑<b>' + p.upsMin + ' min</b>。'] },
      { k: ['bwy', 'rpdu'], t: ['Busway → rack PDUs', '母线 → 机柜PDU'], d: ['Busway A and B (' + el.busways + ' runs × ' + el.bwA + ' A) run over the rows; tap-off boxes feed ' + el.rpdus + ' rack PDUs. Every server has <b>two power supplies</b>, one on A and one on B.', 'A、B母线（' + el.busways + '条 × ' + el.bwA + ' A）沿机柜排敷设，插接箱为' + el.rpdus + '个机柜PDU供电。每台服务器有<b>两个电源</b>，分别接A与B。'] },
      { k: ['o1', 'ups', 'battu'], t: ['0 s: PLN fails', '0 s：PLN停电'], d: ['PLN is lost. The UPS rectifiers stop and the batteries take over through the inverter <b>with no break</b> — the servers notice nothing.', 'PLN失电。UPS整流器停止，电池经逆变器<b>无间断</b>接管——服务器毫无感知。'] },
      { k: ['o2', 'gen'], t: ['≈ 10 s: generators start', '约10 s：发电机启动'], d: ['<b>' + el.genTotal + ' × ' + F(el.genSize) + ' kWe</b> generators (' + el.genLabel + ') start, reach rated speed and voltage and synchronise on the generator bus — ≈ 10 s (ISO 8528-5 G3, NFPA 110 Type 10).', '<b>' + el.genTotal + ' × ' + F(el.genSize) + ' kWe</b>发电机（' + el.genLabel + '）启动、达到额定转速及电压并在并机母线同步——约10 s（ISO 8528-5 G3，NFPA 110 10型）。'] },
      { k: ['o3', 'gen', 'lv'], t: ['≈ 15 s: ATS transfers', '约15 s：ATS切换'], d: ['The ATS of every LV switchboard moves to the generator bus; UPS rectifiers restart and ramp up gradually (walk-in) so the generators are not shocked; chillers and pumps restart in steps.', '各低压总柜ATS切至发电机母线；UPS整流器重启并缓慢加载（软启动），避免冲击发电机；冷机及水泵分步重启。'] },
      { k: ['o4', 'battu', 'ups'], t: ['Batteries recharge', '电池再充电'], d: ['The outage used only ≈ ' + used + ' % of the ' + p.upsMin + '-minute autonomy. The chargers refill the batteries — ' + (li ? 'LFP in ≈ 1–2 h' : 'VRLA in ≈ 6–10 h') + ' — ready for the next event.', '本次停电仅用约' + used + '%的' + p.upsMin + '分钟后备。充电器为电池补电——' + (li ? '磷酸铁锂约1–2 h' : '铅酸约6–10 h') + '——为下次事件做好准备。'] },
      { k: ['o5', 'gen', 'fuelsys'], t: ['Hours on diesel', '柴油运行数小时'], d: ['At full load the site burns ≈ ' + F(el.fuelLph) + ' L/h; the ' + F(el.fuelL / 1000) + ' m³ in ' + el.tanks + ' bulk tanks give <b>' + p.fuelH + ' h</b>, and refuelling contracts extend it as long as needed.', '满载耗油约' + F(el.fuelLph) + ' L/h；' + el.tanks + '个储罐共' + F(el.fuelL / 1000) + ' m³可运行<b>' + p.fuelH + ' h</b>，加油合同可按需延长。'] },
      { k: ['o6', 'grid', 'lv'], t: ['PLN returns', 'PLN恢复'], d: ['When PLN has been stable for ≥ 5 min the ATS returns the load to PLN, and the generators run unloaded ≈ 5 min to cool down before stopping.', 'PLN稳定≥5 min后，ATS将负载切回市电，发电机空载运行约5 min冷却后停机。'] },
      { k: ['bess', 'harm'], t: ['BESS & power quality', '储能与电能质量'], d: [el.bess ? 'A <b>' + F(el.bess.mw, 1) + ' MW / ' + F(el.bess.mwh, 1) + ' MWh</b> LFP BESS buffers synchronised GPU load swings and shaves peaks; active harmonic filters keep the current distortion within IEEE 519 at the PLN connection.' : 'No BESS is needed for this design (it is optional for peak shaving); active harmonic filters keep the current distortion within IEEE 519 at the PLN connection.', el.bess ? '<b>' + F(el.bess.mw, 1) + ' MW / ' + F(el.bess.mwh, 1) + ' MWh</b>磷酸铁锂储能缓冲GPU同步负荷波动并削峰；有源滤波器使PLN接入点电流畸变满足IEEE 519。' : '本设计无需储能（削峰可选）；有源滤波器使PLN接入点电流畸变满足IEEE 519。'] },
      { k: ['epms', 'earth', 'cable', 'ldb'], t: ['Protect, monitor, test', '保护、监控、测试'], d: ['≈ ' + F(R.fs.meters) + ' EPMS meters report every breaker, UPS and generator to the NOC; earthing ≤ 1 Ω, lightning and surge protection; A and B cables on separate routes; load banks prove the chain at full load before go-live.', '约' + F(R.fs.meters) + '块EPMS电表将每台断路器、UPS及发电机状态上传NOC；接地≤1 Ω，配防雷及浪涌保护；A、B电缆分路由；负载箱在投运前满载验证供电链。'] }
    ];
    return s;
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
      [['Transformers', '变压器'], el.txTotal + ' × ' + F(el.txSize), [el.txLabel + ' | kVA', el.txLabel + ' | kVA']], [['Generators', '发电机'], el.genTotal + ' × ' + F(el.genSize), [el.genLabel + ' | kWe', el.genLabel + ' | kWe']],
      [['UPS', 'UPS'], el.upsTotal + ' × ' + F(el.upsSize), [el.upsLabel + ' | kW', el.upsLabel + ' | kW']], [['Feeds per rack', '每柜进线'], el.feedsPerRack === 2 ? 'A + B' : 'A', [R.el.feeds + ' PLN feeder(s)', R.el.feeds + '路PLN进线']]]));
    var it = cap.itKW / 1000, cool = cap.itKW * (R.eff.puePeak - 1) / 1000, other = el.demandKW / 1000 - it - cool;
    h += L.tile(1, 'mva', 'bolt', ['From IT to PLN', '从IT到PLN'], F(el.mva, 1) + ' MVA', L.miniBars([[['IT load', 'IT负载'], it, '#3F3CBB', 1], [['Cooling (design day)', '制冷（设计日）'], cool, '#0EA5C6', 1], [['UPS losses & other', 'UPS损耗及其他'], other, '#E39B1B', 1], [['Maximum demand', '最大需量'], el.demandKW / 1000, '#17153F', 1]], el.demandKW / 1000, ' MW') +
      L.note(['÷ PF ' + K.PF + ' → <b>' + F(el.mva, 1) + ' MVA</b> | ' + t(el.volt), '÷ 功率因数' + K.PF + ' → <b>' + F(el.mva, 1) + ' MVA</b> | ' + el.volt[1]]), '#FDF2DD');
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
    steps: steps,
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
