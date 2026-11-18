/* Technology card: Data Center Facility (whole-system integration card).
   Rev. 18: full-width process illustration (1860 × 840) — power path, white space with the air path, network and safety, and the cooling plant drawn for
   the cooling technology of the design (water-cooled or air-cooled chilled water with CRAH-type units, DX with CRAC units, indirect evaporative, liquid
   cooling); value tags on every flow; a CRAC-or-CRAH explainer; a 12-step process flow. */
(function (g) {
  'use strict';
  var TC = g.TC, L = TC.lib, X = g.TCX, DB = g.DCDB, E = g.DCEngine, F = L.F, t = L.t;
  var EXTRA = {
    crac: { eq: 'ME-09', more: ['ME-07', 'ME-08', 'ME-10'],
      how: ['A CRAC (computer room air conditioner) is a self-contained direct-expansion (DX) unit: its own compressor, evaporator coil and expansion valve cool the room air, and a refrigerant circuit carries the heat to an outdoor air-cooled condenser (or a glycol dry cooler). No chilled-water plant is needed, which suits small rooms and edge sites; above ≈ 1–1.5 MW a central chilled-water plant with CRAH-type units is more efficient and easier to maintain.',
        'CRAC（机房精密空调）为自带压缩机的直膨（DX）机组：机内压缩机、蒸发盘管及膨胀阀冷却机房空气，冷媒回路将热量带到室外风冷冷凝器（或乙二醇干冷器）。无需冷冻水系统，适合小型机房及边缘站点；约1–1.5 MW以上，集中冷冻水系统配CRAH类末端效率更高、更易维护。'],
      key: [['Units = ⌈(air-side heat + losses) ÷ unit capacity⌉ + Tier redundancy', '台数 = ⌈（风侧热量 + 损耗）÷ 单机冷量⌉ + Tier冗余'], function (c) { var me = c.R.me; return me.cracN ? (me.cracN + me.cracR) + ' × ' + me.cracSize + ' kW (' + E.redLabel(me.cracN, me.cracR) + '), COP ≈ ' + F(me.model.cop, 1) : '–'; }],
      om: [['Leak-test the refrigerant circuits and log the charge (HFC phase-down under the Kigali Amendment).', '冷媒回路检漏并记录充注量（基加利修正案HFC削减）。'], ['Clean the outdoor condenser coils before the hot season.', '高温季节前清洗室外冷凝器盘管。'], ['Rotate duty and standby units weekly so every compressor runs.', '每周轮换主备机组，使每台压缩机都运行。']],
      basis: function (c) { var me = c.R.me; return me.cracN ? [(me.cracN + me.cracR) + ' × ' + me.cracSize + ' kW DX CRAC units for ' + F(c.R.cool.airKW) + ' kW of air-side heat', (me.cracN + me.cracR) + '台' + me.cracSize + ' kW直膨CRAC，风侧热量' + F(c.R.cool.airKW) + ' kW'] : null; },
      extra: function (c) { return L.cracCrah ? L.cracCrah(c) : ''; }, calc: 'air' },
    iec: { eq: 'ME-14', more: ['ME-09', 'ME-19'],
      how: ['Indirect evaporative coolers pass the hall air through a polymer or aluminium heat exchanger whose outside is cooled by outdoor air wetted with water sprays; the two air streams never mix. A small DX stage trims the supply temperature on hot, humid hours — in the tropics that is most of the year, so IEC rarely beats a chilled-water plant there.',
        '间接蒸发冷却机组让机房空气流经高分子或铝制换热器，换热器外侧由喷淋加湿的室外空气冷却，两股气流不混合。湿热时段由小型直膨段补冷——在热带地区几乎全年如此，因此IEC在当地很少优于冷冻水系统。'],
      key: [['Units = ⌈(air-side heat + losses) ÷ 400 kW⌉ + Tier redundancy', '台数 = ⌈（风侧热量 + 损耗）÷ 400 kW⌉ + Tier冗余'], function (c) { var me = c.R.me; return me.iecN ? (me.iecN + me.iecR) + ' × 400 kW' : '–'; }],
      om: [['Inspect and clean the heat-exchanger media; check the spray water quality.', '检查清洗换热芯体；检查喷淋水质。'], ['Test the DX trim stage before the hottest months.', '最热月份前测试直膨补冷段。']], calc: 'air' }
  };
  function U(k, o) { return Object.assign({}, X.U[k] || EXTRA[k], o || {}); }
  var PWR = { card: 'PWR', label: ['Critical power', '关键供电'] }, CHW = { card: 'CHW', label: ['Chilled-water cooling', '冷冻水风冷'] }, DLC = { card: 'DLC', label: ['Direct liquid cooling', '冷板液冷'] }, FSM = { card: 'FSM', label: ['Fire | security | monitoring', '消防·安防·监控'] };
  var CR = ['cracrah', ['CRAC or CRAH?', 'CRAC还是CRAH？']];
  var UNITS = [
    U('grid', { id: 'grid', no: '01', rel: [PWR, ['mva', ['From IT load to PLN demand', '从IT负载到PLN需量']]] }),
    U('mvsg', { id: 'mvsg', no: '02', rel: [PWR, ['tier', ['Redundancy', '冗余']]] }),
    U('tx', { id: 'tx', no: '03', rel: [PWR, ['tier', ['Redundancy', '冗余']]] }),
    U('lv', { id: 'lv', no: '04', rel: [PWR] }),
    U('gen', { id: 'gen', no: '05', rel: [PWR, ['fuel', ['Fuel', '燃油']]] }),
    U('ups', { id: 'ups', no: '06', more: ['EL-10', 'EL-11', 'EL-13', 'EL-14'], rel: [PWR, ['tier', ['Redundancy', '冗余']]] }),
    U('hall', { id: 'hall', no: '07', rel: [CHW, DLC, ['dens', ['Rack density', '机柜密度']]] }),
    U('crah', { id: 'crah', no: '08', rel: [CHW, CR], extra: function (c) { return L.cracCrah ? L.cracCrah(c) : ''; } }),
    U('crac', { id: 'crac', no: '08', rel: [CR] }),
    U('iec', { id: 'iec', no: '08', rel: [CR] }),
    U('mmr', { id: 'mmr', no: '09', rel: [['hall', ['White space', '白区']]] }),
    U('secsite', { id: 'secsite', no: '10', rel: [FSM] }),
    U('firezone', { id: 'firezone', no: '11', rel: [FSM] }),
    U('monzone', { id: 'monzone', no: '12', rel: [FSM] }),
    U('tower', { id: 'tower', no: '13', rel: [CHW] }),
    U('chiller', { id: 'chiller', no: '14', rel: [CHW, ['coolEff', ['Chiller efficiency', '冷机能效']], ['pue', ['PUE', 'PUE']], CR] }),
    U('pumps', { id: 'chwp', no: '15', name: ['Chilled-water pumps & storage', '冷冻水泵与蓄冷'], rel: [CHW, ['tes', ['Thermal storage', '蓄冷罐']]] }),
    U('tes', { id: 'tes', no: '15', rel: [CHW] }),
    U('cdu', { id: 'cdu', no: '14', rel: [DLC] }),
    U('dry', { id: 'dry', no: '13', rel: [DLC] }),
    U('fuel', { id: 'fuel', no: 'A', rel: [PWR, ['fuel', ['Fuel autonomy', '燃油自持']]] }),
    U('bldg', { id: 'bldg', no: 'B', rel: [['space', ['Space & site', '空间与场地']]] }),
    U('ops', { id: 'ops', no: 'C', rel: [['tier', ['Availability', '可用性']]] })
  ];
  var FAQ = [
    [['Does every data center use CRAC and CRAH units together?', '每个数据中心都同时使用CRAC和CRAH吗？'], ['No. They are alternatives for the same job. Small rooms and edge sites (≈ up to 1–1.5 MW) usually use DX CRAC units with outdoor condensers; larger halls use CRAH-type units (CRAH, fan walls, chilled-water in-row coolers) fed by a central chiller plant. A mix appears only for specific reasons — DX units for a few small rooms in a chilled-water building, or diverse back-up in small critical rooms. Standards set the temperatures and the redundancy, not the unit type.', '不是。二者是同一功能的不同方案。小型机房及边缘站点（约1–1.5 MW以内）通常采用带室外冷凝器的直膨CRAC；较大机房采用由集中冷站供冷的CRAH类末端（CRAH、风墙、冷冻水列间空调）。混用仅出于特定原因——冷冻水建筑中少数小房间采用直膨机组，或小型关键机房的多样化备用。标准规定的是温湿度与冗余，而非末端类型。']],
    [['What is the difference between Tier III and Tier IV?', 'Tier III与Tier IV有何区别？'], ['Tier III (99.982 %) lets any component be maintained without shutting down the IT (N+1 with two distribution paths). Tier IV (99.995 %) also survives any single failure automatically — typically 2N power and compartmentalised plant, at ≈ 25–30 % higher CAPEX in the assessment engine.', 'Tier III（99.982%）允许任一组件维护而不中断IT（N+1及两条配电路径）。Tier IV（99.995%）还可自动承受任何单点故障——通常为2N供电及分隔的设备区，评估引擎中投资约高25–30%。']],
    [['What PUE can a data center reach in Indonesia?', '在印尼数据中心PUE可以做到多少？'], ['With water-cooled chillers, containment and elevated water temperatures ≈ 1.35–1.45; with direct liquid cooling for AI racks ≈ 1.15–1.25. The humid climate (wet-bulb ≈ 27–28 °C) limits free cooling, so values below ≈ 1.3 need liquid cooling or a highland site.', '采用水冷冷机、通道封闭及提高水温约1.35–1.45；AI机柜采用冷板液冷约1.15–1.25。湿热气候（湿球约27–28 °C）限制自然冷却，低于约1.3需采用液冷或高原站点。']],
    [['How much land does a 10 MW data center need?', '10 MW数据中心需要多少用地？'], ['Roughly 0.5–1 ha for a multi-storey Tier III building with yards for generators, transformers and cooling; low-rise AI campuses need several times more. The engine estimates it from racks, plant rooms, yards and the site-coverage rule (KDB).', '多层Tier III建筑加发电机、变压器及冷却设备场地约需0.5–1 ha；低层AI园区需数倍用地。评估引擎根据机柜、设备房、室外场地及建筑密度（KDB）估算。']],
    [['How long does it take to build?', '建设需要多长时间？'], ['From feasibility to ready-for-service ≈ 2–3 years for 5–30 MW. The PLN high-voltage connection and long-lead equipment (transformers, generators, switchgear: 12–24 months) usually set the critical path.', '从可研到投产，5–30 MW约需2–3年。PLN高压接入及长周期设备（变压器、发电机、开关柜：12–24个月）通常决定关键路径。']],
    [['Why two power paths to every rack?', '为什么每个机柜需要两路供电？'], ['Dual-corded servers take power from an A and a B path, so one path can be maintained or fail without stopping the IT — the basis of Tier III and IV designs.', '双电源服务器分别从A、B两路取电，一路维护或故障时IT不中断——这是Tier III与IV设计的基础。']],
    [['Which permits are needed in Indonesia?', '在印尼需要哪些许可？'], ['OSS-RBA business licence (PP 28/2025, KBLI 63102), spatial conformity (KKPR), environmental approval (AMDAL or UKL-UPL), building approval PBG and certificate SLF, PLN connection with SLO, and PSE registration for the operator.', 'OSS-RBA经营许可（PP 28/2025，KBLI 63102）、空间用途符合性（KKPR）、环境审批（AMDAL或UKL-UPL）、建筑审批PBG及使用证书SLF、PLN接入及SLO，以及运营方PSE登记。']],
    [['Can the same building host AI racks later?', '同一建筑以后能否承载AI机柜？'], ['Only if it is prepared: floor load ≥ 20–25 kN/m², more clear height, space and pipe routes for CDUs and facility water, and more electrical capacity per hall. Retrofitting liquid cooling into a hall designed for 10 kW racks is expensive.', '只有预先考虑才行：楼面荷载≥20–25 kN/m²、更高净高、CDU及设施水的空间与管路，以及更大的单机房电力容量。将液冷改造进按10 kW机柜设计的机房代价高昂。']]
  ];

  /* the air-side unit and the cooling plant of the design */
  function coolOf(c) {
    var R = c.R, me = R.me, a = R.cool.airTech, liq = R.cool.tech === 'DLC' || R.cool.tech === 'IMM' ? R.cool.tech : null, cp = me.cp || { chws: 14, chwDT: 8, airDT: 12, twAppr: 4 }, tm = me.term;
    var o = { air: a, liq: liq, cp: cp, supply: 24, ret: 24 + cp.airDT };
    if (a === 'DX') { o.key = 'crac'; o.type = 'CRAC'; o.name = ['CRAC units (DX)', '直膨精密空调（CRAC）']; o.n = (me.cracN || 0) + (me.cracR || 0); o.size = me.cracSize; o.lab = me.cracN ? E.redLabel(me.cracN, me.cracR) : ''; o.what = ['DX: compressor and refrigerant inside each unit', '直膨：每台机内自带压缩机与冷媒']; }
    else if (a === 'IEC') { o.key = 'iec'; o.type = 'IEC'; o.name = ['Indirect evaporative units', '间接蒸发冷却机组']; o.n = (me.iecN || 0) + (me.iecR || 0); o.size = 400; o.lab = me.iecN ? E.redLabel(me.iecN, me.iecR) : ''; o.what = ['outdoor air + water spray through a heat exchanger', '室外空气及喷淋经换热器']; }
    else { o.key = 'crah'; o.type = 'CRAH'; o.name = tm && tm.id === 'ME-10' ? ['In-row coolers (CRAH type)', '列间空调（冷冻水型）'] : (tm && tm.id === 'ME-07' ? ['CRAH units', '冷冻水精密空调（CRAH）'] : ['Fan walls (CRAH type)', '风墙（冷冻水型CRAH）']); o.n = tm ? tm.n + tm.r : 0; o.size = tm ? tm.cap : 0; o.lab = tm ? E.redLabel(tm.n, tm.r) : ''; o.what = ['chilled-water coil + EC fans, no compressor', '冷冻水盘管 + EC风机，无压缩机']; }
    o.chwFlow = me.chwFlow ? me.chwFlow * 3.6 : 0;
    o.airflow = R.cool.airKW / (1.2 * 1.006 * cp.airDT) * 3600;
    return o;
  }
  function plantName(c) {
    var a = c.R.cool.airTech, liq = c.R.cool.tech;
    var base = { WCCH: ['water-cooled chillers + cooling towers → chilled water → CRAH-type units', '水冷冷机 + 冷却塔 → 冷冻水 → CRAH类末端'], ACCH: ['air-cooled chillers → chilled water → CRAH-type units', '风冷冷机 → 冷冻水 → CRAH类末端'],
      DX: ['DX CRAC units → refrigerant → outdoor condensers (no chilled-water plant)', '直膨CRAC → 冷媒 → 室外冷凝器（无冷冻水系统）'], IEC: ['indirect evaporative air handlers with DX trim (no chilled water)', '间接蒸发冷却空气处理机组 + 直膨补冷（无冷冻水）'] }[a] || ['chilled water', '冷冻水'];
    if (liq === 'DLC') return ['liquid: cold plates → CDUs → warm-water dry coolers | residual air: ' + t(base).split(' → ')[0], '液冷：冷板 → CDU → 温水干冷器 | 余热风冷：' + base[1].split(' → ')[0]];
    if (liq === 'IMM') return ['immersion tanks → CDUs → dry coolers | residual air: ' + t(base).split(' → ')[0], '浸没槽 → CDU → 干冷器 | 余热风冷：' + base[1].split(' → ')[0]];
    return base;
  }

  /* ---------------------------------------------------------------- illustration (1860 × 840)
     row 1: power path | row 2: network & safety (left), white space (right) | row 3: CRAC-or-CRAH explainer (left), cooling plant (right, under the hall) */
  function legend(x, y) {
    var rows = [['mv', ['MV 20 kV', '中压20 kV']], ['lv', ['LV ' + '400 V', '低压400 V']], ['gen', ['Generator', '发电机']], ['chws', ['Chilled water supply', '冷冻水供水']], ['chwr', ['Chilled water return', '冷冻水回水']], ['cws', ['Condenser water', '冷却水']], ['#52C3E2', ['Cold air', '冷风']], ['#F08A7E', ['Hot air', '热风']], ['data', ['Data / fibre', '数据/光纤']]];
    var s = L.R(x, y, 226, 30 + rows.length * 22, '#fff', ' rx="12" stroke="#D9DCEC"') + L.text(x + 14, y + 21, ['Line legend', '线型图例'], 'tc-lt', ' style="font-size:14px"');
    rows.forEach(function (r, i) { var yy = y + 42 + i * 22, col = L.PIPE && L.PIPE[r[0]] ? L.PIPE[r[0]] : (r[0].charAt(0) === '#' ? r[0] : '#5B57D6'); s += '<path d="M' + (x + 14) + ' ' + (yy - 4) + 'H' + (x + 52) + '" stroke="' + col + '" stroke-width="6" stroke-linecap="round"/>' + L.text(x + 62, yy, r[1], 'tc-ls', ' style="font-size:12.5px"'); });
    return s;
  }
  function powerRow(c) {
    var R = c.R, el = R.el, p = c.p, hv = el.hv, o = '', lvV = el.lvV || 400, li = p.battery === 'LI';
    o += L.ground(20, 282, 1580);
    o += L.banner(20, 0, 1820, ['① POWER PATH | 供电路径', '① 供电路径 | POWER PATH'], ['PLN → MV switchgear → transformers → LV + ATS ← generators → UPS → busway A + B → racks', 'PLN → 中压开关柜 → 变压器 → 低压+ATS ← 发电机 → UPS → A+B母线 → 机柜'], null, 'tcZone3') + (g.DCSLD ? L.sldBtn(1630, 3) : '');
    /* cable route under the equipment */
    o += L.fl('grid mvsg', L.pipe('M168 236H292', 'mv', 7)) + L.fl('mvsg tx', L.pipe('M462 236H532', 'mv', 7)) + L.fl('tx lv', L.pipe('M722 236H792', 'lv', 7)) + L.fl('gen lv', L.pipe('M1012 236H952', 'gen', 7, true, true));
    o += L.fl('lv ups', L.pipe('M872 270V276H1300V254', 'lv', 6)) + L.fl('ups hall', L.pipe('M1520 150H1560V330', 'lv', 7) + L.pipe('M1520 196H1584V330', '#3F8FD0', 7));
    o += L.fl('gen fuel', L.thin('M1100 268V250', 'fuel', 3, '4 4'));
    o += '<path d="M40 120Q86 136 128 160M96 120Q116 132 144 160M68 104Q100 126 156 160" fill="none" stroke="#D58A12" stroke-width="1.6"/>';
    /* equipment */
    var gr = L.pylon(70, 270, 176) + L.powerTx(108, 270, 1.02);
    o += L.hot('grid', ['PLN grid', 'PLN电网'], 20, 36, 160, 246, gr + L.label(100, 66, '01', ['PLN grid', 'PLN电网'], hv.name + ' | ' + hv.circ + ' ' + t(['circuit(s)', '回'])), [hv.name + ' | ' + F(el.mva, 1) + ' MVA | PCC ≈ ' + F(hv.pccIk, 1) + ' kA', hv.name + ' | ' + F(el.mva, 1) + ' MVA | 接入点约' + F(hv.pccIk, 1) + ' kA']);
    o += L.hot('mvsg', ['MV switchgear', '中压开关柜'], 290, 36, 174, 246, L.switchgear(300, 118, 5, 156, 134) + L.label(377, 66, '02', ['MV switchgear', '中压开关柜'], [hv.mv.boards + ' × 24 kV | ' + hv.mv.ik + ' kA', hv.mv.boards + '段24 kV | ' + hv.mv.ik + ' kA']), [hv.mv.boards + ' sections, bus sections normally open', hv.mv.boards + '段，分段常开']);
    o += L.hot('tx', ['MV/LV transformers', '中/低压变压器'], 530, 36, 194, 246, L.dryTx(540, 128, 84, 124) + L.dryTx(632, 128, 84, 124) + L.label(627, 66, '03', ['Transformers', '变压器'], el.txTotal + ' × ' + F(el.txSize) + ' kVA'), [el.txLabel + ' | cast resin | uk ' + el.lv.uk + ' %', el.txLabel + ' | 干式 | uk ' + el.lv.uk + ' %']);
    o += L.hot('lv', ['LV switchboards + ATS', '低压配电柜+ATS'], 790, 36, 164, 246, L.lvBoard(798, 118, 4, 148, 134) + L.label(872, 66, '04', ['LV + ATS', '低压+ATS'], [lvV + ' V | ' + F(el.lv.acb) + ' A', lvV + ' V | ' + F(el.lv.acb) + ' A']), [el.txTotal + ' line-ups | ' + el.lv.icw + ' kA | ATS PLN ↔ generator', el.txTotal + '组 | ' + el.lv.icw + ' kA | ATS市电↔发电机']);
    o += L.hot('gen', ['Generators', '发电机'], 1010, 36, 236, 212, L.genset(1018, 132, 220, 96) + L.label(1128, 66, '05', ['Generators', '发电机'], el.genTotal + ' × ' + F(el.genSize) + ' kWe'), [el.genLabel + ' | ' + c.p.fuelH + ' h fuel | start ≈ 10 s', el.genLabel + ' | 燃油' + c.p.fuelH + ' h | 启动约10 s']);
    o += L.hot('fuel', ['Fuel system', '燃油系统'], 1014, 246, 232, 34, L.fuelTank(1024, 248, 150, 24) + L.text(1182, 266, ['A | fuel', 'A | 燃油'], 'tc-lc'), [F(el.fuelL / 1000) + ' m³ in ' + el.tanks + ' tanks', F(el.fuelL / 1000) + ' m³，' + el.tanks + '个储罐']);
    o += L.hot('ups', ['UPS & batteries', 'UPS与电池'], 1290, 36, 236, 246, L.upsCab(1298, 118, 3, 110, 134) + L.battRack(1414, 128, 3, 104, 124, li) + L.label(1408, 66, '06', ['UPS & batteries', 'UPS与电池'], el.upsTotal + ' × ' + F(el.upsSize) + ' kW'), [el.upsLabel + ' | ' + F(el.battKWh) + ' kWh ' + (li ? 'Li-ion' : 'VRLA') + ' | ' + c.p.upsMin + ' min', el.upsLabel + ' | ' + F(el.battKWh) + ' kWh ' + (li ? '锂电' : '铅酸') + ' | ' + c.p.upsMin + ' min']);
    /* value tags on top of the drawing */
    o += L.fl('grid mvsg', L.tag(240, 214, hv.kv > 20 ? hv.name : '20 kV', 'mv') + L.tag(240, 262, F(el.mva, 1) + ' MVA', 'mv'));
    o += L.fl('mvsg tx', L.tag(497, 214, '20 kV', 'mv') + L.tag(497, 262, hv.mv.boards + ' × ' + F(hv.mv.busA) + ' A', 'mv'));
    o += L.fl('tx lv', L.tag(757, 214, lvV + ' V', 'lv') + L.tag(757, 262, F(el.lv.i) + ' A', 'lv'));
    o += L.fl('gen lv', L.tag(982, 214, ['back-up', '备用'], 'gen'));
    o += L.fl('ups hall', L.tag(1552, 250, 'A', 'lv') + L.tag(1594, 286, 'B', '#3F8FD0'));
    o += legend(1614, 44);
    return o;
  }
  function netRow(c) {
    var R = c.R, fs = R.fs, o = '';
    o += L.banner(20, 300, 990, ['② NETWORK & SAFETY | 网络与安全', '② 网络与安全 | NETWORK & SAFETY'], ['carriers | site security | fire | monitoring', '运营商 | 场地安防 | 消防 | 监控'], null, 'tcZone5');
    o += L.ground(20, 556, 990);
    var mmr = L.pylon(56, 548, 120) + '<ellipse cx="70" cy="444" rx="9" ry="13" fill="#E9EBF4" stroke="#5E6484" stroke-width="1.5"/>' + L.building(118, 468, 140, 80, '#3F3CBB') + L.R(146, 494, 22, 46, '#2B2E4E', ' rx="2"') + L.R(176, 494, 22, 46, '#2B2E4E', ' rx="2"') + L.R(206, 494, 22, 46, '#2B2E4E', ' rx="2"');
    o += L.fl('mmr hall', L.thin('M258 520H290V576H1062V556', 'data', 3, '3 4'));
    o += L.hot('mmr', ['Network & MMR', '网络与MMR'], 24, 336, 270, 220, mmr + L.label(160, 364, '09', ['Network & MMR', '网络与MMR'], ['2 diverse fibre routes', '两条不同光纤路由']), ['carrier-neutral meet-me room | diverse duct banks', '中立运营商接入间 | 多路由管群']);
    var sec = L.fence(318, 548, 180, 60) + L.building(420, 476, 70, 44, '#5D6280') + L.barrier(506, 548, 66) + L.camera(328, 452, .9, false) + L.bollards(588, 548, 3);
    o += L.hot('secsite', ['Site security', '场地安防'], 312, 336, 330, 220, sec + L.label(470, 364, '10', ['Site security', '场地安防'], [fs.securityLayers + ' layers | ' + F(fs.cams) + ' cameras', fs.securityLayers + '道防线 | ' + F(fs.cams) + '台摄像机']), ['fence → gate → building → mantrap → hall → rack', '围栏 → 大门 → 建筑 → 防尾随门 → 机房 → 机柜']);
    var fire = L.vesda(668, 444, 44, 100) + L.gasCyl(726, 456, 3) + L.firePanel(796, 456, 50, 92);
    o += L.hot('firezone', ['Fire detection & suppression', '火灾探测与灭火'], 660, 336, 196, 220, fire + L.label(760, 364, '11', ['Fire', '消防'], [fs.asd + ' VESDA | clean agent', fs.asd + '台VESDA | 洁净气体']), ['aspirating detection → alarm → clean agent / pre-action', '吸气式探测 → 报警 → 洁净气体/预作用']);
    o += L.hot('monzone', ['Monitoring (BMS | EPMS | DCIM)', '监控（BMS·EPMS·DCIM）'], 868, 336, 140, 220, L.nocWall(876, 444, 124, 100) + L.label(938, 364, '12', ['NOC', '运营中心'], ['24/7', '7×24']), ['≈ ' + F(fs.bmsPts + fs.meters) + ' monitored points', '约' + F(fs.bmsPts + fs.meters) + '个监控点']);
    return o;
  }
  /* the white space in section, mirrored: the air-side unit at the right end, right above the cooling plant */
  var UX = 1704, UY = 404, UW = 124, UH = 146;   /* air-side unit */
  function hallRow(c, co) {
    var R = c.R, el = R.el, cap = R.cap, o = '', liq = co.liq;
    o += L.banner(1030, 300, 810, ['③ WHITE SPACE | 白区', '③ 白区 | WHITE SPACE'], [t(co.name) + ' → cold aisle → racks → hot aisle', t(co.name) + ' → 冷通道 → 机柜 → 热通道'], null, 'tcZone');
    var room = L.zbox(1030, 336, 810, 236, '#F7F8FD', '#C9CDE0');
    room += L.R(1046, 344, 640, 16, '#EEF0F8', ' rx="4"') + L.text(1366, 356, ['return-air ceiling plenum', '回风吊顶静压箱'], 'tc-ls', ' text-anchor="middle" style="font-size:12px;fill:#8A90AE"');
    room += L.R(1040, 430, 176, 126, '#E2F5FA', ' opacity=".8"') + L.R(1480, 430, 224, 126, '#E2F5FA', ' opacity=".8"');
    room += L.R(1278, 420, 140, 136, '#FDE7E4', ' rx="3" stroke="#F08A7E" stroke-width="1.4"') + L.text(1348, 548, ['contained hot aisle', '封闭热通道'], 'tc-ls', ' text-anchor="middle" style="font-size:11.5px;fill:#B0302A;font-weight:700"');
    room += L.busway(1110, 394, 480, 9, 3) + L.R(1110, 420, 480, 5, '#3F8FD0', ' rx="2"');
    room += L.rack(1216, 430, 62, 126, { blink: true, gpu: !!liq }) + L.rack(1418, 430, 62, 126, { gpu: !!liq });
    var air = L.air('M' + UX + ' 532H1486', false, 5) + L.air('M1048 532H1210', false, 4) + L.air('M1348 512V370H' + (UX + 92) + 'V' + (UY - 4), true, 5);
    var lab = L.label(1046, 452, '07', ['White space', '白区'], [F(cap.racks) + ' racks', F(cap.racks) + '个机柜'], 'start') + L.text(1076, 486, [F(cap.avgDens, 1) + ' kW average', '平均' + F(cap.avgDens, 1) + ' kW'], 'tc-ls');
    o += L.hot('hall', ['White space', '白区'], 1034, 336, 664, 236, room + L.fl('hall ' + co.key, air) + L.fl('ups hall', L.pipe('M1560 336V394', 'lv', 6, false) + L.pipe('M1584 336V420', '#3F8FD0', 6, false)) +
      L.fl('hall ' + co.key, L.tag(1150, 510, co.supply + ' °C', '#0B7F99') + L.tag(1348, 470, F(co.ret) + ' °C', '#B0302A') + L.tag(1540, 510, co.supply + ' °C', '#0B7F99')) + lab,
      [F(cap.itMW, 1) + ' MW IT | busway ' + el.bwA + ' A A + B | airflow ' + F(co.airflow) + ' m³/h', F(cap.itMW, 1) + ' MW IT | 母线' + el.bwA + ' A A+B | 风量' + F(co.airflow) + ' m³/h']);
    if (liq) {   /* CDU in the hall: technology loop over the racks */
      var me = R.me, cdu = L.cduCab(1598, 446, 80, 110);
      var tcs = L.pipe('M1618 440V382H1240V430', 'tcs', 3, false) + L.pipe('M1440 382V430', 'tcs', 3, false) + L.pipe('M1646 440V388H1262V430', 'tcr', 3, false) + L.pipe('M1462 388V430', 'tcr', 3, false);
      o += L.fl('cdu hall', tcs + L.tag(1540, 470, ['TCS 35 → 45 °C', 'TCS 35→45 °C'], 'tcs', null, 12));
      o += L.hot('cdu', ['CDUs', 'CDU'], 1592, 430, 92, 140, cdu + L.num(1612, 466, '14') + L.tag(1638, 544, 'CDU', '#0B6F88', null, 12), [(me.cduN + me.cduR) + ' × ' + F(me.cduSize) + ' kW | coolant ≈ 35 → 45 °C to the cold plates', (me.cduN + me.cduR) + ' × ' + F(me.cduSize) + ' kW | 冷却液约35→45 °C至冷板']);
    }
    var term = co.key === 'crac' ? crac(UX, UY, UW, UH, true) : (co.key === 'iec' ? L.crah(UX, UY, UW, UH, true) : L.fanWall(UX, UY, UW, UH, 2, 4, true));
    o += L.hot(co.key, co.name, UX - 6, 336, UW + 12, 236, term + L.num(UX + 12, 350, '08') + L.text(UX + 30, 355, co.type, 'tc-lt', ' style="font-size:15px"') + L.tag(UX + UW / 2, UY + UH - 16, co.n ? co.n + ' × ' + F(co.size) + ' kW' : '–', '#17153F', null, 12),
      [t(co.name) + ' | ' + (co.n ? co.n + ' × ' + F(co.size) + ' kW ' + co.lab : '') + ' | ' + t(co.what), t(co.name) + ' | ' + (co.n ? co.n + '台 × ' + F(co.size) + ' kW ' + co.lab : '') + ' | ' + co.what[1]]);
    return o;
  }
  function crac(x, y, w, h, bare) {   /* DX unit: coil, compressor, refrigerant ports */
    var s = L.cab(x, y, w, h, '#EFF1F8', { door: false, cap: '#7C3AED' });
    s += L.R(x + 8, y + 12, w - 16, h * .32, 'url(#tcMesh)', ' rx="2" stroke="#B7BCD2"');
    s += '<circle cx="' + (x + w / 2) + '" cy="' + (y + h * .62) + '" r="' + (w * .2) + '" fill="#3A3F63"/><circle cx="' + (x + w / 2) + '" cy="' + (y + h * .62) + '" r="' + (w * .09) + '" fill="#7C3AED"/>';
    if (!bare) s += L.text(x + w / 2, y + h * .62 + w * .2 + 14, ['compressor', '压缩机'], 'tc-ls', ' text-anchor="middle" style="font-size:11px;font-weight:700"');
    return s;
  }
  /* cooling plant under the white space: risers go straight up into the air-side unit (x 1716 supply | 1740 return) */
  var RS = 1716, RR = 1740;
  function plantRow(c, co) {
    var R = c.R, me = R.me, cp = co.cp, o = '', a = co.air, liq = co.liq, L0 = R.L, model = me.model || {};
    var sub = { WCCH: ['towers → chillers → chilled water → CRAH-type units', '冷却塔 → 冷机 → 冷冻水 → CRAH类末端'], ACCH: ['air-cooled chillers → chilled water → CRAH-type units', '风冷冷机 → 冷冻水 → CRAH类末端'], DX: ['outdoor condensers ← refrigerant ← CRAC units', '室外冷凝器 ← 冷媒 ← CRAC'], IEC: ['indirect evaporative units → supply air to the hall', '间接蒸发冷却机组 → 送风至机房'] }[a] || ['chilled water', '冷冻水'];
    if (liq) sub = ['dry coolers → facility water → CDUs | trim chiller → CRAH', '干冷器 → 设施水 → CDU | 补冷冷机 → CRAH'];
    o += L.banner(840, 586, liq ? 740 : 840, ['④ COOLING PLANT | 冷源', '④ 冷源 | COOLING PLANT'], sub, null, 'tcZone2');
    o += L.ground(840, 812, 1000);
    var ub = UY + UH;   /* bottom of the air-side unit */
    function chwRisers(fromX) {
      return L.fl('chwp ' + co.key + ' chiller', L.pipe('M' + fromX + ' 742H' + RS + 'V' + ub, 'chws', 6) + L.pipe('M' + RR + ' ' + ub + 'V712H' + fromX, 'chwr', 6, true, true)) +
        L.fl('chwp ' + co.key, L.tag(RR + 12, 606, F(cp.chws) + ' °C', 'chws', 'start', 12.5) + L.tag(RR + 12, 634, F(cp.chws + cp.chwDT) + ' °C', 'chwr', 'start', 12.5) + L.tag(RR + 12, 662, F(co.chwFlow) + ' m³/h', 'chws', 'start', 12));
    }
    if (liq) {
      o += L.hot('dry', ['Dry coolers (warm water)', '干冷器（温水）'], 846, 620, 290, 192, L.dryCooler(858, 712, 266, 92, 4) + L.label(990, 640, '13', ['Dry coolers', '干冷器'], me.dcN ? (me.dcN + me.dcR) + ' × 1,500 kW' : '–'), ['facility water ≈ 32 → 42 °C, no chillers most hours', '设施水约32→42 °C，多数时段无需冷机']);
      o += L.fl('dry cdu', L.pipe('M1124 790H1618V556', 'fws', 6) + L.pipe('M1656 556V800H1124', 'fwr', 6, true, true) + L.tag(1300, 790, ['FWS 32 °C', '设施水32 °C'], 'fws', null, 12) + L.tag(1300, 812, ['42 °C', '42 °C'], 'fwr', null, 12));
      o += L.hot('chiller', ['Trim chiller (residual air)', '补冷冷机（余热）'], 1150, 620, 300, 168, L.chiller(1162, 668, 270, 92) + L.label(1300, 640, '15', ['Residual-air plant', '余热冷源'], me.chN ? (me.chN + me.chR) + ' × ' + F(me.chSize) + ' kW' : '–'), [F(R.cool.airKW) + ' kW by air (memory, drives, power supplies)', '风冷' + F(R.cool.airKW) + ' kW（内存、硬盘、电源）']);
      o += L.fl('chiller crah', L.pipe('M1432 726H' + RS + 'V' + ub, 'chws', 5) + L.pipe('M' + RR + ' ' + ub + 'V700H1432', 'chwr', 5, true, true) + L.tag(RR + 12, 620, F(cp.chws) + ' °C', 'chws', 'start', 12) + L.tag(RR + 12, 648, F(cp.chws + cp.chwDT) + ' °C', 'chwr', 'start', 12));
    } else if (a === 'DX') {
      var cond = L.dryCooler(858, 712, 200, 90, 3) + L.dryCooler(1078, 712, 200, 90, 3) + L.dryCooler(1298, 712, 200, 90, 3);
      o += L.hot('crac', ['Outdoor condensers (DX)', '室外冷凝器（直膨）'], 846, 620, 664, 192, cond + L.label(1178, 640, '13', ['Outdoor air-cooled condensers', '室外风冷冷凝器'], [co.n + ' refrigerant circuits, one per CRAC', co.n + '个冷媒回路，每台CRAC一个']), ['refrigerant condenses at ≈ ' + F((R.L.db || 34) + 12) + ' °C | COP ≈ ' + F(model.cop, 1), '冷媒冷凝约' + F((R.L.db || 34) + 12) + ' °C | COP约' + F(model.cop, 1)]);
      o += L.fl('crac', L.pipe('M1498 742H' + RS + 'V' + ub, '#7C3AED', 5) + L.pipe('M' + RR + ' ' + ub + 'V772H1498', '#B9A2F0', 4, true, true) + L.tag(RR + 12, 612, ['hot gas →', '排气 →'], '#7C3AED', 'start', 12) + L.tag(RR + 12, 640, ['← liquid', '← 液体'], '#8B6FD6', 'start', 12));
      o += L.text(1178, 834, ['No chilled-water plant: each CRAC carries its own compressor; refrigerant takes the heat to these condensers.', '无冷冻水系统：每台CRAC自带压缩机，冷媒将热量带到这些冷凝器。'], 'tc-ls', ' text-anchor="middle" style="font-size:12.5px;font-weight:700"');
    } else if (a === 'IEC') {
      var iec = L.crah(858, 668, 190, 136, true) + L.crah(1068, 668, 190, 136, true) + L.crah(1278, 668, 190, 136, true);
      o += L.hot('iec', co.name, 846, 620, 640, 192, iec + L.label(1164, 640, '13', co.name, co.n ? co.n + ' × 400 kW | ' + co.lab : '–'), ['outdoor air + spray water through a heat exchanger; DX trim on hot hours', '室外空气及喷淋经换热器；高温时段直膨补冷']);
      o += L.fl('iec hall', L.air('M1468 730H' + RS + 'V' + ub, false, 7) + L.air('M' + RR + ' ' + ub + 'V700H1468', true, 6));
    } else {
      var towers = a === 'WCCH';
      if (towers) {
        o += L.hot('tower', ['Cooling towers', '冷却塔'], 846, 620, 270, 192, L.coolingTower(858, 724, 76, 80, true) + L.coolingTower(944, 724, 76, 80, true) + L.coolingTower(1030, 724, 76, 80, true) + L.label(982, 640, '13', ['Cooling towers', '冷却塔'], [(me.ctN + me.ctR) + ' cells | WUE ' + F(R.eff.wue, 2), (me.ctN + me.ctR) + '格 | WUE ' + F(R.eff.wue, 2)]),
          ['wet-bulb ' + F(L0.wb, 1) + ' °C + approach ' + cp.twAppr + ' K | ' + F(me.waterDay) + ' m³/day water', '湿球' + F(L0.wb, 1) + ' °C + 逼近度' + cp.twAppr + ' K | 日用水' + F(me.waterDay) + ' m³']);
        o += L.fl('tower chiller', L.pipe('M1106 790H1150', 'cws', 6) + L.pipe('M1150 744H1106', 'cwr', 6, true, true));
        o += L.fl('tower chiller', L.tag(1128, 724, F((model.cws || L0.wb + 4) + 5.5, 1) + ' °C', 'cwr', null, 11.5) + L.tag(1128, 812, F(model.cws || L0.wb + 4, 1) + ' °C', 'cws', null, 11.5));
      } else o += L.text(982, 700, ['no cooling towers:', '无冷却塔：'], 'tc-ls', ' text-anchor="middle" style="font-weight:800"') + L.text(982, 722, ['the chillers reject heat', '冷机直接向'], 'tc-ls', ' text-anchor="middle"') + L.text(982, 742, ['to outdoor air', '室外空气散热'], 'tc-ls', ' text-anchor="middle"');
      var chl = L.chiller(1160, 690, 270, 108) + (towers ? '' : '<g>' + [0, 1, 2, 3].map(function (i) { return L.fan(1190 + i * 64, 684, 14, 1.2, true); }).join('') + '</g>');
      o += L.hot('chiller', [towers ? 'Water-cooled chillers' : 'Air-cooled chillers', towers ? '水冷冷水机组' : '风冷冷水机组'], 1146, 620, 300, 192, chl + L.label(1296, 640, '14', [towers ? 'Chillers (water-cooled)' : 'Chillers (air-cooled)', towers ? '冷水机组（水冷）' : '冷水机组（风冷）'], me.chN ? (me.chN + me.chR) + ' × ' + F(me.chSize) + ' kW' : '–'),
        [me.chLabel + ' | COP ≈ ' + F(model.cop, 1) + ' | economiser ≈ ' + F((model.free || 0) * 100) + ' % of hours', me.chLabel + ' | COP约' + F(model.cop, 1) + ' | 自然冷却约' + F((model.free || 0) * 100) + '%时间']);
      o += chwRisers(1430);
      var pumps = L.pump(1462, 806, .9) + L.pump(1540, 806, .9) + (me.tesM3 ? L.storageTank(1626, 676, 64, 128, '#0EA5C6') : '');
      o += L.hot('chwp', ['Chilled-water pumps & storage', '冷冻水泵与蓄冷'], 1452, 620, 248, 192, pumps + L.label(1574, 640, '15', ['CHW pumps & TES', '冷冻水泵与蓄冷'], me.tesM3 ? ['TES ' + F(me.tesM3) + ' m³', '蓄冷' + F(me.tesM3) + ' m³'] : ['N+1 | VFD', 'N+1 | 变频']),
        ['flow ' + F(co.chwFlow) + ' m³/h | DN ' + (me.chwDN || '–') + (me.tesM3 ? ' | ride-through ' + F(me.tesS / 60) + ' min' : ''), '流量' + F(co.chwFlow) + ' m³/h | DN ' + (me.chwDN || '–') + (me.tesM3 ? ' | 蓄冷后备' + F(me.tesS / 60) + ' min' : '')]);
    }
    return o;
  }
  /* CRAC or CRAH: the two families side by side, the one of this design ticked (opens the theory panel) */
  function explainer(c, co) {
    var x = 20, y = 590, w = 800, h = 246, o = L.R(x, y, w, h, '#fff', ' rx="16" stroke="#C9CDE0"') + L.text(x + 20, y + 28, ['CRAC or CRAH? — which unit cools the air in this design', 'CRAC还是CRAH？——本设计由哪种末端冷却空气'], 'tc-lt', ' style="font-size:16px"');
    function card(cx, kind, ttl, l1, l2, l3, used) {
      var cy = y + 42, s = L.R(cx, cy, 376, 132, used ? '#EEF0FF' : '#F7F8FB', ' rx="12" stroke="' + (used ? '#3F3CBB' : '#D9DCEC') + '" stroke-width="' + (used ? 2.5 : 1.2) + '"');
      if (kind === 'CRAH') s += L.fanWall(cx + 12, cy + 14, 58, 88, 1, 2, used) + '<path d="M' + (cx + 18) + ' ' + (cy + 114) + 'h46" stroke="#0EA5C6" stroke-width="5"/><path d="M' + (cx + 18) + ' ' + (cy + 123) + 'h46" stroke="#E5806E" stroke-width="5"/>';
      else s += crac(cx + 12, cy + 14, 58, 96) + '<path d="M' + (cx + 18) + ' ' + (cy + 122) + 'h46" stroke="#7C3AED" stroke-width="5" stroke-dasharray="7 4"/>';
      s += L.text(cx + 84, cy + 24, ttl, 'tc-lt', ' style="font-size:14px"') + L.text(cx + 84, cy + 47, l1, 'tc-ls', ' style="font-size:12.5px"') + L.text(cx + 84, cy + 67, l2, 'tc-ls', ' style="font-size:12.5px"') + L.text(cx + 84, cy + 87, l3, 'tc-ls', ' style="font-size:12.5px"');
      s += used ? L.tag(cx + 300, cy + 114, ['✓ this design', '✓ 本设计'], '#16A34A', null, 13) : L.text(cx + 364, cy + 120, ['not used here', '本设计未采用'], 'tc-ls', ' text-anchor="end" style="font-size:12px;fill:#8A90AE"');
      return s;
    }
    o += card(x + 14, 'CRAH', ['CRAH — computer room air handler', 'CRAH——机房空气处理机'], ['chilled-water coil + EC fans, no compressor', '冷冻水盘管 + EC风机，无压缩机'], ['cold comes from the central chiller plant', '冷量来自集中冷站'], ['fan walls and CW in-row units = same family', '风墙、冷冻水列间同属此类'], co.type === 'CRAH');
    o += card(x + 410, 'CRAC', ['CRAC — computer room air conditioner', 'CRAC——机房精密空调'], ['own compressor + refrigerant (DX)', '自带压缩机与冷媒（直膨）'], ['heat goes to an outdoor condenser', '热量排至室外冷凝器'], ['small rooms and edge sites ≤ ≈ 1.5 MW', '小机房、边缘站点≤约1.5 MW'], co.type === 'CRAC');
    var l1 = co.type === 'IEC' ? ['This design uses neither: indirect evaporative units cool the hall air through a heat exchanger.', '本设计二者均未采用：间接蒸发冷却机组经换热器冷却机房空气。'] : ['One family per hall: CRAC (DX) for small rooms and edge sites, CRAH-type on chilled water above ≈ 1–1.5 MW.', '每个机房只用一类：小机房及边缘站点用CRAC（直膨），约1–1.5 MW以上用冷冻水CRAH类末端。'];
    o += L.text(x + 20, y + 200, l1, 'tc-ls', ' style="font-size:12.5px;font-weight:700"') + L.text(x + 20, y + 219, ['Standards (ASHRAE TC 9.9, TIA-942-C, EN 50600-2-3, Uptime) set temperatures and redundancy — not the unit type.', '标准（ASHRAE TC 9.9、TIA-942-C、EN 50600-2-3、Uptime）规定温湿度与冗余，而非末端类型。'], 'tc-ls', ' style="font-size:12.5px"');
    o += L.text(x + w - 18, y + h - 8, ['Open the full comparison →', '打开完整对比 →'], 'tc-ls', ' text-anchor="end" style="font-size:12.5px;font-weight:800;fill:#3F3CBB"');
    return L.hot('cracrah', ['CRAC or CRAH?', 'CRAC还是CRAH？'], x, y, w, h, o, ['Open the comparison: definitions, standards, typical choices', '打开对比：定义、标准及典型选型']);
  }
  function pfd(c) {
    var co = coolOf(c);
    var o = powerRow(c) + netRow(c) + hallRow(c, co) + plantRow(c, co) + explainer(c, co);
    return '<svg class="tc-pfd tc-abs" viewBox="0 0 1860 840" role="img" aria-label="' + L.te(['Data center process flow: power, white space, cooling, network and safety', '数据中心流程：供电、白区、制冷、网络与安全']) + '">' + o + '</svg>';
  }
  /* process flow: 12 steps, each lights its equipment and flows */
  function steps(c) {
    var R = c.R, el = R.el, hv = el.hv, me = R.me, cap = R.cap, co = coolOf(c), cp = co.cp, model = me.model || {}, fs = R.fs, lvV = el.lvV || 400;
    var s = [
      { k: ['grid'], t: ['PLN supply', 'PLN供电'], d: ['PLN delivers <b>' + F(el.mva, 1) + ' MVA</b> at <b>' + hv.name + '</b> over ' + hv.circ + ' circuit(s): the IT load plus cooling on the design day, UPS losses and the building (' + F(el.demandKW) + ' kW at PUE ' + F(R.eff.puePeak, 2) + ').', 'PLN以<b>' + hv.name + '</b>经' + hv.circ + '回线路供电<b>' + F(el.mva, 1) + ' MVA</b>：设计日IT负载加制冷、UPS损耗及建筑（' + F(el.demandKW) + ' kW，PUE ' + F(R.eff.puePeak, 2) + '）。'] },
      { k: ['mvsg'], t: ['MV switchgear', '中压开关柜'], d: ['The 20 kV switchgear (' + hv.mv.boards + ' sections, ' + F(hv.mv.busA) + ' A, ' + hv.mv.ik + ' kA) splits the supply; bus sections stay normally open so a fault never takes both halves.', '20 kV开关柜（' + hv.mv.boards + '段，' + F(hv.mv.busA) + ' A，' + hv.mv.ik + ' kA）分配电力；分段常开，故障不会同时影响两半母线。'] },
      { k: ['tx'], t: ['Transformers', '变压器'], d: ['<b>' + el.txTotal + ' × ' + F(el.txSize) + ' kVA</b> cast-resin transformers step 20 kV down to ' + lvV + ' V, in identical blocks ' + el.txLabel + ' — one transformer can fail without losing a switchboard.', '<b>' + el.txTotal + ' × ' + F(el.txSize) + ' kVA</b>干式变压器将20 kV降至' + lvV + ' V，按相同模块' + el.txLabel + '配置——任一台故障不失去配电柜。'] },
      { k: ['lv'], t: ['LV switchboards + ATS', '低压配电+ATS'], d: ['Each transformer feeds one LV main switchboard (' + F(el.lv.acb) + ' A ACB, ' + el.lv.icw + ' kA); its automatic transfer switch chooses PLN or the generators.', '每台变压器供一面低压总柜（' + F(el.lv.acb) + ' A框架断路器，' + el.lv.icw + ' kA）；其自动转换开关在市电与发电机间切换。'] },
      { k: ['gen', 'fuel'], t: ['Generators take over', '发电机接管'], d: ['On a PLN outage <b>' + el.genTotal + ' × ' + F(el.genSize) + ' kWe</b> generators (' + el.genLabel + ') start in ≈ 10 s and take the load in ≈ 15 s; ' + F(el.fuelL / 1000) + ' m³ of diesel give ' + c.p.fuelH + ' h.', 'PLN停电时<b>' + el.genTotal + ' × ' + F(el.genSize) + ' kWe</b>发电机（' + el.genLabel + '）约10 s启动、约15 s带载；' + F(el.fuelL / 1000) + ' m³柴油可运行' + c.p.fuelH + ' h。'] },
      { k: ['ups'], t: ['UPS bridges the gap', 'UPS桥接断电'], d: ['<b>' + el.upsTotal + ' × ' + F(el.upsSize) + ' kW</b> UPS (' + el.upsLabel + ') with ' + F(el.battKWh) + ' kWh of batteries carry the IT for ' + c.p.upsMin + ' min — far longer than the generator start — on separate A and B paths.', '<b>' + el.upsTotal + ' × ' + F(el.upsSize) + ' kW</b> UPS（' + el.upsLabel + '）配' + F(el.battKWh) + ' kWh电池，A、B两路分别供电，可支撑IT ' + c.p.upsMin + ' min——远长于发电机启动时间。'] },
      { k: ['hall', 'ups'], t: ['Power to the racks', '电力到达机柜'], d: ['Busway A and B (' + el.bwA + ' A per row) feed <b>' + F(cap.racks) + ' racks</b> averaging ' + F(cap.avgDens, 1) + ' kW; dual-corded servers draw from both, so one path can be maintained.', 'A、B母线（每排' + el.bwA + ' A）向<b>' + F(cap.racks) + '个机柜</b>供电，平均' + F(cap.avgDens, 1) + ' kW；双电源服务器取自两路，一路可检修。'] },
      { k: ['hall', co.key], t: ['Heat leaves by air', '热量随空气排出'], d: ['Servers draw <b>' + co.supply + ' °C</b> air from the cold aisle and exhaust it ' + cp.airDT + ' K warmer (' + F(co.ret) + ' °C) into the contained hot aisle; ' + F(co.airflow) + ' m³/h return over the ceiling to the ' + co.type + ' units.', '服务器从冷通道吸入<b>' + co.supply + ' °C</b>空气，温升' + cp.airDT + ' K（' + F(co.ret) + ' °C）排入封闭热通道；' + F(co.airflow) + ' m³/h经吊顶回到' + co.type + '末端。'] }
    ];
    if (co.key === 'crac') {
      s.push({ k: ['crac'], t: ['CRAC units (DX)', 'CRAC（直膨）'], d: ['<b>' + co.n + ' × ' + co.size + ' kW</b> CRAC units (' + co.lab + ') cool the air with their own compressors; refrigerant carries the heat to outdoor condensers, COP ≈ ' + F(model.cop, 1) + '. No chilled-water plant.', '<b>' + co.n + ' × ' + co.size + ' kW</b> CRAC（' + co.lab + '）以自带压缩机冷却空气；冷媒将热量带到室外冷凝器，COP约' + F(model.cop, 1) + '。无冷冻水系统。'] });
    } else if (co.key === 'iec') {
      s.push({ k: ['iec'], t: ['Indirect evaporative units', '间接蒸发冷却'], d: ['<b>' + co.n + ' × 400 kW</b> IEC units cool the hall air through a heat exchanger wetted by outdoor air and water; a DX stage trims the hot, humid hours — most of the year in the tropics.', '<b>' + co.n + ' × 400 kW</b> IEC机组经室外空气及喷淋水湿润的换热器冷却机房空气；湿热时段由直膨段补冷——在热带几乎全年如此。'] });
    } else {
      s.push({ k: ['crah', 'chwp'], t: ['CRAH coils → chilled water', 'CRAH盘管 → 冷冻水'], d: ['<b>' + co.n + ' × ' + F(co.size) + ' kW</b> ' + t(co.name) + ' (' + co.lab + ') pass the air over chilled-water coils — no compressor in the hall. Water arrives at <b>' + F(cp.chws) + ' °C</b> and returns at ' + F(cp.chws + cp.chwDT) + ' °C, ' + F(co.chwFlow) + ' m³/h.', '<b>' + co.n + ' × ' + F(co.size) + ' kW</b> ' + co.name[1] + '（' + co.lab + '）让空气流过冷冻水盘管——机房内无压缩机。供水<b>' + F(cp.chws) + ' °C</b>，回水' + F(cp.chws + cp.chwDT) + ' °C，' + F(co.chwFlow) + ' m³/h。'] });
      if (co.liq) s.push({ k: ['cdu', 'hall'], t: ['Liquid to the cold plates', '液冷至冷板'], d: ['CDUs (' + (me.cduN + me.cduR) + ' × ' + F(me.cduSize) + ' kW) pump coolant at ≈ 35 → 45 °C through the cold plates of the GPU racks; ' + F(R.cool.liquidKW) + ' kW leave by liquid, only ' + F(R.cool.airKW) + ' kW by air.', 'CDU（' + (me.cduN + me.cduR) + ' × ' + F(me.cduSize) + ' kW）以约35→45 °C的冷却液流经GPU机柜冷板；' + F(R.cool.liquidKW) + ' kW由液体带走，仅' + F(R.cool.airKW) + ' kW由空气带走。'] });
      s.push({ k: ['chiller', 'chwp'], t: ['Chillers', '冷水机组'], d: [me.chN ? '<b>' + (me.chN + me.chR) + ' × ' + F(me.chSize) + ' kW</b> chillers (' + me.chLabel + ') take the heat from the chilled water at COP ≈ ' + F(model.cop, 1) + (me.tesM3 ? '; a ' + F(me.tesM3) + ' m³ storage tank keeps the water cold for ' + F(me.tesS / 60) + ' min while chillers restart after an outage.' : '.') : 'No chillers in this design.', me.chN ? '<b>' + (me.chN + me.chR) + ' × ' + F(me.chSize) + ' kW</b>冷水机组（' + me.chLabel + '）以COP约' + F(model.cop, 1) + '从冷冻水中取热' + (me.tesM3 ? '；' + F(me.tesM3) + ' m³蓄冷罐在断电后冷机重启期间保持冷水' + F(me.tesS / 60) + ' min。' : '。') : '本设计无冷水机组。'] });
      if (co.liq) s.push({ k: ['dry', 'cdu'], t: ['Warm-water heat rejection', '温水散热'], d: ['Dry coolers (' + (me.dcN + me.dcR) + ' units) reject the liquid heat with facility water at ≈ 32 → 42 °C — warm enough to need no chillers most of the year, and no evaporation.', '干冷器（' + (me.dcN + me.dcR) + '台）以约32→42 °C设施水排出液冷热量——温度足够高，全年多数时段无需冷机，且不耗水蒸发。'] });
      else if (co.air === 'WCCH') s.push({ k: ['tower', 'chiller'], t: ['Cooling towers', '冷却塔'], d: ['<b>' + (me.ctN + me.ctR) + '</b> tower cells reject ' + F(me.rejKW) + ' kW by evaporation: condenser water ' + F(model.cws || 0, 1) + ' → ' + F((model.cws || 0) + 5.5, 1) + ' °C at a wet-bulb of ' + F(R.L.wb, 1) + ' °C; ≈ ' + F(me.waterDay) + ' m³ of water per day (WUE ' + F(R.eff.wue, 2) + ').', '<b>' + (me.ctN + me.ctR) + '</b>格冷却塔以蒸发方式排出' + F(me.rejKW) + ' kW：湿球' + F(R.L.wb, 1) + ' °C下冷却水' + F(model.cws || 0, 1) + '→' + F((model.cws || 0) + 5.5, 1) + ' °C；日用水约' + F(me.waterDay) + ' m³（WUE ' + F(R.eff.wue, 2) + '）。'] });
      else s.push({ k: ['chiller'], t: ['Heat to outdoor air', '热量排至室外'], d: ['Air-cooled chillers reject the heat with their own condenser fans — no cooling towers and almost no water (WUE ' + F(R.eff.wue, 2) + '), at a higher energy use than water-cooled plants.', '风冷冷机以自带冷凝风机散热——无冷却塔、几乎不用水（WUE ' + F(R.eff.wue, 2) + '），但能耗高于水冷系统。'] });
    }
    s.push({ k: ['mmr', 'secsite', 'firezone', 'monzone'], t: ['Network, security, fire, NOC', '网络、安防、消防、NOC'], d: ['Two diverse fibre routes reach the meet-me room; ' + fs.securityLayers + ' security layers and ' + F(fs.cams) + ' cameras protect the site; aspirating detection and clean agent protect the rooms; the NOC watches ≈ ' + F(fs.bmsPts + fs.meters) + ' points 24/7.', '两条不同路由的光纤进入接入间；' + fs.securityLayers + '道防线及' + F(fs.cams) + '台摄像机保护场地；吸气式探测及洁净气体保护各房间；NOC全天候监视约' + F(fs.bmsPts + fs.meters) + '个点位。'] });
    return s;
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
        ['mva', F(R.el.mva, 1), 'MVA', ['PLN demand', 'PLN需量'], R.el.hv.kv > 20 ? [R.el.hv.name + ' connection', R.el.hv.name + '接入'] : [R.el.hv.circ + ' × 20 kV feeders', R.el.hv.circ + '路20 kV馈线']]]);
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
      L.note(['Site ≈ <b>' + F(sp.siteNeed / 1e4, 2) + ' ha</b> | ' + c.p.floors + ' storey(s) | floor ≥ ' + sp.floorLoad + ' kN/m²', '用地约<b>' + F(sp.siteNeed / 1e4, 2) + ' ha</b> | ' + c.p.floors + '层 | 楼面≥' + sp.floorLoad + ' kN/m²']));
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
      L.ptable([['Project', '项目'], ['Country', '国家'], ['Capacity', '容量'], ['Key fact', '要点']], rows) + '<div class="tc-rel"><a class="tc-ext" href="#assess/library" target="_blank" rel="noopener">' + L.te(['Open the reference library (new tab)', '打开参考项目库（新标签页）']) + ' ↗</a></div>', 'x');
  }
  var card = {
    id: 'DC', abbr: 'DC', title: ['Data Center Facility', '数据中心设施'], short: ['Data Center Facility', '数据中心设施'], icon: 'building',
    blurb: ['Whole system: power, white space, cooling, network, safety', '整体系统：供电、白区、制冷、网络、安全'], badge: ['Whole facility', '整体设施'], basis: 'A05', calc: X.CALC, units: UNITS, faq: FAQ,
    sources: [['Uptime Institute Tier Standard: Topology', 'Uptime Institute等级标准：拓扑'], 'ANSI/TIA-942-C', ['ASHRAE TC 9.9 thermal guidelines', 'ASHRAE TC 9.9温湿度指南'], ['EN 50600-2-3 environmental control', 'EN 50600-2-3环境控制'], ['SNI 8799 (BSN)', 'SNI 8799（BSN）'], ['Assessment engine and knowledge base of this website', '本网站评估引擎及知识库'], ['Operator announcements for reference projects', '参考项目运营商公告']],
    steps: steps,
    stage: function (c) {
      var R = c.R, co = coolOf(c);
      card.tag = ['A <b>' + F(R.cap.itMW, 1) + ' MW</b> IT facility in ' + R.L.en + ' turns <b>' + F(R.el.mva, 1) + ' MVA</b> of PLN power into always-on compute; the heat leaves through <b>' + co.type + '</b> units (' + t(co.what) + ') — PUE <b>' + F(R.eff.pue, 2) + '</b>.',
        '位于' + R.L.zh + '的<b>' + F(R.cap.itMW, 1) + ' MW</b> IT设施将<b>' + F(R.el.mva, 1) + ' MVA</b> PLN电力转化为不间断算力；热量经<b>' + co.type + '</b>末端（' + co.what[1] + '）排出——PUE <b>' + F(R.eff.pue, 2) + '</b>。'];
      return L.header(card) + pfd(c) + right(c) + bottom(c) +
        L.footer(['Indicative planning values for the selected design basis; detailed design follows site surveys, PLN studies and quotations.', '所选设计基准的规划参考值；详细设计须依据场地勘察、PLN研究及报价。'], [['basis', L.UI.basis], ['gloss', L.UI.gloss]]);
    },
    panels: function (c) {
      var P = UNITS.map(function (u) { return L.unitPanel(u, c); });
      ['pue', 'tier', 'dens', 'mva', 'gimp', 'space'].forEach(function (k, i) { P.push(L.theoryPanel(X.TH[k], 'T' + (i + 1), c)); });
      if (X.TH.cracrah) P.push(L.theoryPanel(Object.assign({}, X.TH.cracrah, { id: 'cracrah' }), 'T7', c));
      if (X.TH.coolEff) P.push(L.theoryPanel(Object.assign({}, X.TH.coolEff, { id: 'coolEff' }), 'T8', c));
      if (X.TH.instr) P.push(L.theoryPanel(Object.assign({}, X.TH.instr, { id: 'instr' }), 'T9', c));
      P.push(refsPanel(c)); P.push(L.faqPanel(card));
      return P;
    }
  };
  TC.register(card);
})(window);
