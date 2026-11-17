/* Technology card: Chilled-Water Air Cooling (cooling towers → chillers → thermal storage → fan walls → contained aisles).
   Rev. 18: full-width illustration (1860 × 840) — what “chilled-water air cooling” means (the CRAH route), the air side and the chilled-water loop,
   the chiller plant with condenser water, towers, water and the cooling power; 12-step process flow; CRAC-or-CRAH comparison panel. */
(function (g) {
  'use strict';
  var TC = g.TC, L = TC.lib, X = g.TCX, DB = g.DCDB, E = g.DCEngine, K = E.K, F = L.F, t = L.t;
  var EXTRA = {
    pipes: { eq: 'ME-16', more: ['ME-04', 'ME-20'],
      how: ['Chilled-water and condenser-water headers run as rings or dual (A/B) mains with isolation valves, so any pipe section, pump or chiller can be isolated for maintenance while the rest keeps cooling — the hydraulic side of concurrent maintainability.', '冷冻水与冷却水干管采用环网或A/B双干管并设隔离阀，任一管段、水泵或冷机均可隔离维护而其余部分继续供冷——这是“可同时维护”在水系统上的体现。'],
      om: [['Exercise isolation valves twice a year.', '每年两次操作隔离阀。'], ['Inspect insulation and vapour barriers for condensation.', '检查保温及防潮层是否结露。'], ['Pressure-test and flush new sections before connecting them.', '新管段接入前进行试压与冲洗。']], calc: 'chw' }
  };
  function U(k, o) { return Object.assign({}, X.U[k] || EXTRA[k], o || {}); }
  var DLC = { card: 'DLC', label: ['Direct liquid cooling', '冷板液冷'] }, DC = { card: 'DC', label: ['Data center facility', '数据中心设施'] };
  var UNITS = [
    U('tower', { id: 'tower', no: '01', rel: [['wue', ['Water use', '用水']], ['wtreat', ['Water treatment', '水处理']]] }),
    U('pumps', { id: 'cwp', no: '02', name: ['Condenser-water pumps', '冷却水泵'], rel: [['vfd', ['VFDs', '变频器']]] }),
    U('chiller', { id: 'chiller', no: '03', rel: [['chw', ['Plant sizing', '冷站选型']], ['pue', ['PUE', 'PUE']]] }),
    U('phe', { id: 'phe', no: '04', rel: [['ashrae', ['Climate & envelope', '气候与温湿度']]] }),
    U('tes', { id: 'tes', no: '05', rel: [['tesT', ['Ride-through', '蓄冷后备']]] }),
    U('pumps', { id: 'chwp', no: '06', name: ['Chilled-water pumps', '冷冻水泵'], rel: [['pipes', ['Piping', '管路']]] }),
    U('crah', { id: 'crah', no: '07', rel: [['air', ['Heat & airflow', '热量与风量']]] }),
    U('aisle', { id: 'aisle', no: '08', rel: [['ashrae', ['ASHRAE envelope', 'ASHRAE范围']], DLC] }),
    U('rdhx', { id: 'rdhx', no: '09', rel: [DLC] }),
    U('makeup', { id: 'makeup', no: '10', rel: [['wue', ['Water use', '用水']]] }),
    U('wtreat', { id: 'wtreat', no: '11', rel: [['tower', ['Cooling towers', '冷却塔']]] }),
    U('vfd', { id: 'vfd', no: 'A' }), U('bms', { id: 'bms', no: 'B', rel: [{ card: 'FSM', label: ['Monitoring', '监控'] }] }), U('pipes', { id: 'pipes', no: 'C' })
  ];
  var THEORY = [['air', 'air'], ['chw', 'chw'], ['pue', 'pue'], ['wue', 'wue'], ['tesT', 'tes'], ['ashrae', 'ashrae']];
  var FAQ = [
    [['What does “chilled-water air cooling” mean — CRAC or CRAH?', '“冷冻水风冷”是什么意思——CRAC还是CRAH？'], ['The servers are cooled by air; the air is cooled by chilled-water coils in CRAH-type units (CRAH, fan walls, chilled-water in-row coolers, rear doors); the water is cooled by central chillers whose heat leaves through cooling towers or condenser fans. There is no compressor in the hall. A CRAC is the other family: a DX unit with its own compressor and an outdoor condenser, used for small rooms and edge sites.', '服务器由空气冷却；空气由CRAH类末端（CRAH、风墙、冷冻水列间空调、背板）中的冷冻水盘管冷却；冷冻水由集中冷机冷却，热量经冷却塔或冷凝风机排出。机房内没有压缩机。CRAC是另一类：自带压缩机及室外冷凝器的直膨机组，用于小机房及边缘站点。']],
    [['Why chilled water instead of DX precision units?', '为什么用冷冻水而不是直膨精密空调？'], ['Above ≈ 1 MW a central chilled-water plant is far more efficient and easier to maintain than hundreds of DX units with long refrigerant pipes, and it scales to large halls with fan walls. DX remains practical for small rooms and edge sites.', '约1 MW以上，集中冷冻水系统比数百台带长冷媒管的直膨机组效率高得多、更易维护，并可配合风墙扩展到大型机房。直膨仍适用于小机房及边缘站点。']],
    [['Why is free cooling rare in Indonesia?', '为什么印尼很少采用自然冷却？'], ['Lowland sites have a design wet-bulb of ≈ 27–28 °C all year, so towers cannot make water cold enough to replace the chillers. Highland sites (Bandung ≈ 23.5 °C) and warm-water liquid cooling change that.', '低地站点全年设计湿球约27–28 °C，冷却塔无法产生足以替代冷机的低温水。高原站点（万隆约23.5 °C）及温水液冷可改变这一点。']],
    [['How much water does a water-cooled data center use?', '水冷数据中心用水量多少？'], ['About 1.8–2.0 L per kWh of IT in the tropics: a 10 MW site at 85 % load needs ≈ 390 m³ per day. Air-cooled chillers or dry coolers use almost none but consume more electricity.', '热带地区约1.8–2.0 L/kWh IT：10 MW站点在85%负载时每日约需390 m³。风冷冷机或干冷器几乎不用水，但耗电更多。']],
    [['What happens to cooling during a power failure?', '断电时制冷会怎样？'], ['Chillers stop until the generators run and the compressors restart (2–5 min). Pumps and fan walls stay on UPS and circulate cold water from the thermal storage tank, so server inlet temperatures stay in range.', '冷机停止，直至发电机运行且压缩机重启（2–5分钟）。水泵与风墙由UPS供电，循环蓄冷罐中的冷水，使服务器进风温度保持在范围内。']],
    [['What supply air temperature should we design for?', '送风温度应按多少设计？'], ['ASHRAE recommends 18–27 °C at the server inlet; most new halls supply 22–25 °C with contained aisles. Higher supply and chilled-water temperatures cut chiller energy noticeably.', 'ASHRAE推荐服务器进风18–27 °C；多数新建封闭通道机房送风22–25 °C。提高送风及冷冻水温度可明显降低冷机能耗。']],
    [['Water-cooled or air-cooled chillers?', '水冷还是风冷冷机？'], ['Water-cooled plants reach a lower PUE (≈ 1.35–1.40 in Jakarta) but need towers, water treatment and make-up water; air-cooled plants (≈ 1.45–1.50) suit water-scarce sites and smaller projects. The decision matrix scores both for the selected basis.', '水冷系统PUE更低（雅加达约1.35–1.40），但需冷却塔、水处理及补水；风冷系统（约1.45–1.50）适合缺水站点及较小项目。决策矩阵针对所选基准对二者评分。']],
    [['Can air cooling handle AI racks?', '风冷能否满足AI机柜？'], ['Up to ≈ 25 kW per rack with containment and ≈ 40–75 kW with rear-door coolers. GPU racks of 100 kW and more need direct liquid cooling — see the liquid-cooling card.', '封闭通道下单柜约25 kW，背板换热约40–75 kW。100 kW以上GPU机柜需冷板液冷——见液冷卡片。']]
  ];

  /* ---------------------------------------------------------------- illustration (1860 × 840), Rev. 18
     row 0: what "chilled-water air cooling" means (air → CRAH coils → chillers → towers) | row 1: white space air side + chilled-water loop |
     row 2: chillers, condenser water, cooling towers, water, cooling power */
  function cw(c) {
    var R = c.R, me = R.me, cp = me.cp || { chws: 14, chwDT: 8, airDT: 12, twAppr: 4 }, model = me.model || {}, wet = R.cool.airTech !== 'ACCH';
    var tm = me.term, tn = tm ? (tm.id === 'ME-10' ? ['In-row coolers (CRAH type)', '列间空调（冷冻水型）'] : tm.id === 'ME-07' ? ['CRAH units', '冷冻水精密空调'] : ['Fan walls (CRAH type)', '风墙（冷冻水型）']) : ['CRAH units', '冷冻水精密空调'];
    var cws = model.cws || R.L.wb + cp.twAppr, airKW = R.cool.airKW;
    return { me: me, cp: cp, model: model, wet: wet, tn: tn, tm: tm, cws: cws, cwr: cws + 5.5, sup: 24, ret: 24 + cp.airDT, airflow: airKW / (1.2 * 1.006 * cp.airDT) * 3600, flow: (me.chwFlow || 0) * 3.6, evap: cp.chws - 4, cond: model.tcond || cws + 7 };
  }
  function chain(c, k) {
    var R = c.R, me = k.me, cp = k.cp, o = '';
    o += L.banner(20, 0, 1820, ['① WHAT “CHILLED-WATER AIR COOLING” MEANS | 冷冻水风冷的含义', '① 冷冻水风冷的含义 | WHAT IT MEANS'], ['air cools the servers → chilled water cools the air → chillers cool the water → ' + (k.wet ? 'towers' : 'condenser fans') + ' reject the heat', '空气冷却服务器 → 冷冻水冷却空气 → 冷机冷却冷冻水 → ' + (k.wet ? '冷却塔' : '冷凝风机') + '排出热量'], null, 'tcZone2');
    var B = [
      ['air', '#F08A7E', ['AIR cools the servers', '空气冷却服务器'], ['cold aisle in, contained hot aisle out', '冷通道进风，封闭热通道排风'], k.sup + ' → ' + F(k.ret) + ' °C'],
      ['cracrah', '#0EA5C6', ['CRAH coils: chilled WATER cools the air', 'CRAH盘管：冷冻水冷却空气'], ['no compressor in the hall — not a CRAC', '机房内无压缩机——不是CRAC'], F(cp.chws) + ' → ' + F(cp.chws + cp.chwDT) + ' °C'],
      ['chw', '#3F3CBB', ['CHILLERS cool the water', '冷机冷却冷冻水'], ['refrigerant cycle lifts the heat', '冷媒循环提升热量品位'], 'COP ' + F(k.model.cop, 1)],
      ['wue', k.wet ? '#4A6FD0' : '#5D6280', [k.wet ? 'TOWERS reject the heat outdoors' : 'CONDENSER FANS reject it outdoors', k.wet ? '冷却塔向室外排热' : '冷凝风机向室外排热'], k.wet ? ['by evaporation at the wet-bulb', '在湿球温度下蒸发散热'] : ['air-cooled: no towers, almost no water', '风冷：无冷却塔、几乎不耗水'], k.wet ? 'WB ' + F(R.L.wb, 1) + ' °C' : 'DB ' + F(R.L.db, 1) + ' °C']
    ], X0 = [20, 476, 932, 1388], W0 = [432, 432, 432, 452];
    B.forEach(function (b, i) {
      var x = X0[i], w = W0[i], s = L.R(x, 40, w, 78, '#fff', ' rx="14" stroke="' + b[1] + '" stroke-opacity=".55" stroke-width="1.6"') + L.R(x, 40, 8, 78, b[1], ' rx="4"');
      s += L.num(x + 30, 64, String(i + 1), 'tcZone2') + L.text(x + 50, 69, b[2], 'tc-lt', ' style="font-size:15px"') + L.text(x + 50, 91, b[3], 'tc-ls', ' style="font-size:12.5px"') + L.tag(x + w - 14, 104, b[4], b[1], 'end', 12.5);
      if (i < 3) s += '<path d="M' + (x + w + 2) + ' 79H' + (x + w + 16) + '" stroke="#3F3CBB" stroke-width="3"/>' + L.arrowHead(x + w + 22, 79, 'r', '#3F3CBB', 8);
      o += L.hot(b[0], b[2], x, 40, w, 78, s, i === 1 ? ['CRAH = air handler with a chilled-water coil; CRAC = DX unit with its own compressor. Click for the comparison.', 'CRAH = 带冷冻水盘管的空气处理机；CRAC = 自带压缩机的直膨机组。点击查看对比。'] : null);
    });
    return o;
  }
  function hall(c, k) {
    var R = c.R, me = k.me, cap = R.cap, o = '', tm = k.tm;
    o += L.banner(20, 132, 1820, ['② WHITE SPACE + CHILLED-WATER LOOP | 白区与冷冻水环路', '② 白区与冷冻水环路 | AIR SIDE + CHW LOOP'], ['CRAH units → cold aisle → racks → hot aisle → back to the coils | pumps, storage, economiser, headers', 'CRAH → 冷通道 → 机柜 → 热通道 → 回到盘管 | 水泵、蓄冷、节能换热器、干管'], null, 'tcZone');
    o += L.zbox(20, 168, 846, 298, '#F7F8FD', '#C9CDE0') + L.zbox(880, 168, 960, 298, '#F3FAFD', '#C4E6F0');
    o += L.R(36, 178, 672, 16, '#EEF0F8', ' rx="4"') + L.text(372, 190, ['return-air ceiling plenum', '回风吊顶静压箱'], 'tc-ls', ' text-anchor="middle" style="font-size:12px;fill:#8A90AE"') + L.R(30, 426, 836, 5, '#C9CDE0', ' rx="2"');
    /* chilled-water headers under the floor and along the plant room */
    o += L.fl('chwp pipes crah rdhx tes phe chiller', L.pipe('M1830 440H40', 'chws', 7) + L.pipe('M40 458H1830', 'chwr', 7, true, true));
    o += L.fl('crah chwp', L.pipe('M770 440V424', 'chws', 4, false) + L.pipe('M806 458V424', 'chwr', 4, false)) + L.fl('rdhx chwp', L.pipe('M122 440V418', 'chws', 3, false) + L.pipe('M108 458V418', 'chwr', 3, false));
    /* rear-door rack, aisles, pod */
    var rd = L.rack(52, 290, 58, 134) + L.R(110, 296, 12, 122, '#0EA5C6', ' rx="2"') + '<path d="M112 304V412M116 304V412M120 304V412" stroke="#E2F5FA" stroke-width="1"/>' + L.air('M124 352H150', false, 3);
    o += L.hot('rdhx', ['Rear-door heat exchangers', '背板换热器'], 34, 236, 112, 194, rd + L.label(38, 252, '09', ['Rear-door HX', '背板换热'], me.rdhx ? [me.rdhx + ' doors', me.rdhx + '个'] : ['20–75 kW racks', '20–75 kW机柜'], 'start'),
      ['a chilled-water coil in the rack door removes 20–75 kW right at the rack', '机柜后门的冷冻水盘管就地带走20–75 kW']);
    var pod = L.R(150, 270, 150, 154, '#E2F5FA', ' opacity=".8"') + L.R(540, 270, 184, 154, '#E2F5FA', ' opacity=".8"') + L.R(360, 262, 120, 162, '#FDE7E4', ' rx="3" stroke="#F08A7E" stroke-width="1.4"') + L.text(420, 416, ['contained hot aisle', '封闭热通道'], 'tc-ls', ' text-anchor="middle" style="font-size:11.5px;fill:#B0302A;font-weight:700"');
    pod += L.rack(300, 270, 60, 154, { blink: true }) + L.rack(480, 270, 60, 154);
    var air = L.air('M724 400H546', false, 5) + L.air('M156 400H294', false, 4) + L.air('M466 300V206H800V226', true, 5);
    o += L.hot('aisle', ['Hot-aisle containment', '热通道封闭'], 146, 236, 404, 194, pod + L.fl('aisle crah air', air + L.tag(222, 376, k.sup + ' °C', '#0B7F99') + L.tag(420, 330, F(k.ret) + ' °C', '#B0302A') + L.tag(632, 376, k.sup + ' °C', '#0B7F99') + L.tag(632, 206, F(k.airflow) + ' m³/h', '#B0302A', null, 12)) +
      L.label(292, 252, '08', ['Containment', '通道封闭'], [F(cap.racks) + ' racks | ΔT ' + k.cp.airDT + ' K', F(cap.racks) + '个机柜 | 温差' + k.cp.airDT + ' K'], 'start'),
      ['servers take ' + k.sup + ' °C and exhaust ' + F(k.ret) + ' °C; the hot aisle is closed so the streams never mix', '服务器吸入' + k.sup + ' °C、排出' + F(k.ret) + ' °C；热通道封闭，冷热气流不混合']);
    var fw = tm && tm.id === 'ME-10' ? L.crah(730, 232, 120, 192, true) : L.fanWall(730, 232, 120, 192, 2, 4, true);
    fw += '<path d="M738 228H842" stroke="#0EA5C6" stroke-width="3"/>';
    o += L.hot('crah', k.tn, 550, 222, 312, 208, fw + L.label(552, 252, '07', ['CRAH units', 'CRAH末端'], tm ? (tm.n + tm.r) + ' × ' + tm.cap + ' kW | ' + E.redLabel(tm.n, tm.r) : '–', 'start') + L.text(582, 286, k.tn, 'tc-ls', ' style="font-size:12px;font-weight:700;fill:#0B6F88"') + L.text(582, 303, ['chilled-water coil + EC fans', '冷冻水盘管 + EC风机'], 'tc-ls', ' style="font-size:12px"'),
      [t(k.tn) + ' | coil ' + F(k.cp.chws) + ' → ' + F(k.cp.chws + k.cp.chwDT) + ' °C | no compressor', t(k.tn) + ' | 盘管' + F(k.cp.chws) + '→' + F(k.cp.chws + k.cp.chwDT) + ' °C | 无压缩机']);
    /* plant-room side of the loop */
    var vfd = L.cab(894, 330, 56, 94, '#E9EBF4', { door: false, cap: '#0B6F88' }) + L.R(900, 342, 44, 18, '#17153F', ' rx="2"') + L.text(922, 355, 'Hz', 'tc-lw', ' text-anchor="middle" style="font-size:10px"');
    o += L.hot('vfd', ['Variable-speed drives', '变频器'], 884, 196, 120, 234, vfd + L.label(888, 214, 'A', ['VFDs', '变频器'], ['speed control', '调速'], 'start'), ['pumps and fans follow the load: power ∝ speed³', '水泵与风机随负荷调速：功率∝转速³']);
    var pp = '';
    [1012, 1090, 1168].forEach(function (x) { pp += L.pump(x, 424, 1) + L.pipe('M' + (x + 17) + ' 424V440', 'chws', 4, false); });
    o += L.hot('chwp', ['Chilled-water pumps', '冷冻水泵'], 1006, 196, 240, 234, pp + L.label(1126, 214, '06', ['CHW pumps', '冷冻水泵'], ['variable primary | N+1', '一次泵变流量 | N+1']), ['flow ' + F(k.flow) + ' m³/h | DN ' + (me.chwDN || '–') + ' | ' + (me.pumps || '–') + ' pumps in the plant', '流量' + F(k.flow) + ' m³/h | DN ' + (me.chwDN || '–') + ' | 全站' + (me.pumps || '–') + '台泵']);
    var ts = me.tesM3 ? L.storageTank(1272, 274, 96, 150, '#0EA5C6') : '<g opacity=".4">' + L.storageTank(1272, 274, 96, 150, '#0EA5C6') + '</g>';
    o += L.hot('tes', ['Thermal storage', '蓄冷罐'], 1262, 196, 128, 234, ts + L.pipe('M1300 424V440', 'chws', 4, false) + L.pipe('M1342 424V458', 'chwr', 4, false) + L.label(1320, 214, '05', ['TES tank', '蓄冷罐'], me.tesM3 ? [F(me.tesM3) + ' m³ | ' + F(me.tesS / 60) + ' min', F(me.tesM3) + ' m³ | ' + F(me.tesS / 60) + ' min'] : ['not required', '无需']),
      ['keeps the water cold while the chillers restart after a power failure', '断电后冷机重启期间保持冷冻水低温']);
    o += L.hot('phe', ['Plate heat exchanger', '板式换热器'], 1402, 196, 140, 234, L.phe(1414, 330, 116, 94) + L.pipe('M1440 424V440', 'chws', 4, false) + L.pipe('M1500 424V458', 'chwr', 4, false) + L.label(1472, 214, '04', ['Plate HX', '板换'], ['economiser ' + F((k.model.free || 0) * 100) + ' % of hours', '自然冷却' + F((k.model.free || 0) * 100) + '%时间']),
      ['when the wet-bulb is low, tower water cools the chilled water directly and the chillers rest', '湿球较低时，冷却水直接冷却冷冻水，冷机停机']);
    o += L.hot('bms', ['BMS', '楼宇自控'], 1556, 196, 140, 234, L.nocWall(1566, 330, 120, 86) + L.label(1626, 214, 'B', ['BMS', '楼宇自控'], ['≈ ' + F(R.fs.bmsPts) + ' points', '约' + F(R.fs.bmsPts) + '点']), ['sequences chillers, pumps and fans; holds the supply air at ' + k.sup + ' °C', '对冷机、水泵、风机进行群控；保持送风' + k.sup + ' °C']);
    var vv = '';
    [1734, 1790].forEach(function (x) { vv += '<path d="M' + (x - 9) + ' 431L' + (x + 9) + ' 449V431L' + (x - 9) + ' 449Z" fill="#17153F"/><path d="M' + (x - 9) + ' 449L' + (x + 9) + ' 467V449L' + (x - 9) + ' 467Z" fill="#17153F"/>'; });
    vv += '<path d="M1712 300H1812V412H1712Z" fill="none" stroke="#0EA5C6" stroke-width="5" stroke-dasharray="1 0"/><path d="M1722 310H1802V402H1722Z" fill="none" stroke="#E5806E" stroke-width="5"/>';
    o += L.hot('pipes', ['Chilled-water piping', '冷冻水管路'], 1706, 196, 132, 276, vv + L.label(1762, 214, 'C', ['Headers', '干管'], ['DN ' + (me.chwDN || '–') + ' | A/B ring', 'DN ' + (me.chwDN || '–') + ' | A/B环网']), ['ring or A/B headers with isolation valves: any section can be isolated while the rest keeps cooling', '环网或A/B干管设隔离阀：任一管段可隔离而其余继续供冷']);
    o += L.fl('chwp pipes crah', L.tag(1600, 440, 'CHWS ' + F(k.cp.chws) + ' °C', 'chws', null, 12) + L.tag(1040, 440, F(k.flow) + ' m³/h', 'chws', null, 12)) + L.fl('chwp pipes crah', L.tag(1200, 458, 'CHWR ' + F(k.cp.chws + k.cp.chwDT) + ' °C', 'chwr', null, 12));
    return o;
  }
  function plant(c, k) {
    var R = c.R, me = k.me, model = k.model, o = '', wet = k.wet, itKW = R.cap.itKW;
    o += L.banner(20, 484, 1820, ['③ CHILLER PLANT & HEAT REJECTION | 冷水机组与散热', '③ 冷水机组与散热 | CHILLER PLANT'], wet ? ['chillers move the heat into condenser water; towers evaporate it into the air', '冷机将热量转入冷却水；冷却塔蒸发散热'] : ['air-cooled chillers reject the heat with their own condenser fans', '风冷冷机以自带冷凝风机散热'], null, 'tcZone2');
    o += L.ground(20, 812, 1820);
    /* chilled-water risers from the evaporators to the headers */
    o += L.fl('chiller chwp pipes', L.pipe('M1416 745H1446V440', 'chws', 6) + L.pipe('M1468 458V766H1416', 'chwr', 6, true, true));
    var fade = function (s) { return wet ? s : '<g opacity=".32">' + s + '</g>'; };
    if (wet) {
      o += L.fl('cwp chiller tower', L.pipe('M440 798H1012V700H1036', 'cws', 6)) + L.fl('chiller tower cwp', L.pipe('M1040 668V604H478V720H460', 'cwr', 6, true, true));
      o += L.fl('cwp chiller tower', L.tag(660, 798, F(k.cws, 1) + ' °C', 'cws', null, 12)) + L.fl('chiller tower cwp', L.tag(780, 604, F(k.cwr, 1) + ' °C', 'cwr', null, 12));
      o += L.fl('makeup tower', L.thin('M492 760H462', 'water', 3, '4 4'));
    }
    var tw = L.coolingTower(40, 690, 96, 116, wet) + L.coolingTower(148, 690, 96, 116, wet) + L.coolingTower(256, 690, 96, 116, wet) + L.coolingTower(364, 690, 96, 116, wet);
    o += L.hot('tower', ['Cooling towers', '冷却塔'], 30, 520, 440, 292, fade(tw) + L.label(250, 540, '01', ['Cooling towers', '冷却塔'], wet ? [(me.ctN + me.ctR) + ' cells | ' + F(me.rejKW) + ' kW', (me.ctN + me.ctR) + '格 | ' + F(me.rejKW) + ' kW'] : ['not used in this design', '本设计未采用']) + (wet ? L.tag(250, 596, ['wet-bulb ' + F(R.L.wb, 1) + ' °C + approach ' + k.cp.twAppr + ' K', '湿球' + F(R.L.wb, 1) + ' °C + 逼近度' + k.cp.twAppr + ' K'], '#4A6FD0', null, 12) : L.text(250, 660, ['air-cooled chillers need no towers', '风冷冷机无需冷却塔'], 'tc-ls', ' text-anchor="middle" style="font-size:13px;font-weight:800"')),
      wet ? ['heat rejected ' + F(me.rejKW) + ' kW = IT heat + compressor work | ' + F(me.waterDay) + ' m³/day | WUE ' + F(R.eff.wue, 2), '排热' + F(me.rejKW) + ' kW = IT热量 + 压缩机功 | ' + F(me.waterDay) + ' m³/日 | WUE ' + F(R.eff.wue, 2)] : ['not used: the chillers are air-cooled', '未采用：冷机为风冷']);
    o += L.hot('makeup', ['Make-up water', '补水'], 480, 520, 150, 292, fade(L.tankBox(492, 724, 100, 64, 14, 'tcWater', .7)) + L.label(556, 540, '10', ['Make-up', '补水'], wet ? [F(me.waterStore) + ' m³', F(me.waterStore) + ' m³'] : [F(me.waterStore) + ' m³ | no towers', F(me.waterStore) + ' m³ | 无冷却塔']), ['replaces evaporation and blowdown | PDAM or groundwater', '补充蒸发与排污 | 市政或地下水']);
    var wt = L.cylV(640, 742, 24, 46, 'tcWhite') + L.R(642, 760, 20, 26, '#E39B1B', ' opacity=".8"') + L.cylV(670, 742, 24, 46, 'tcWhite') + L.R(672, 760, 20, 26, '#7C3AED', ' opacity=".7"') + L.cylV(700, 742, 24, 46, 'tcWhite') + L.R(702, 760, 20, 26, '#16A34A', ' opacity=".7"') + L.R(732, 750, 40, 38, '#3A3F63', ' rx="3"') + L.R(738, 756, 18, 8, '#0EA5C6', ' rx="1"');
    o += L.hot('wtreat', ['Water treatment', '水处理'], 634, 520, 150, 292, fade(wt) + L.label(708, 540, '11', ['Treatment', '水处理'], wet ? ['CoC 4–6 | Legionella', '浓缩4–6倍 | 军团菌'] : ['not needed (no towers)', '无需（无冷却塔）']), ['dosing, filtration and blowdown keep scale, corrosion and Legionella under control (ASHRAE 188)', '加药、过滤及排污控制结垢、腐蚀及军团菌（ASHRAE 188）']);
    o += L.hot('cwp', ['Condenser-water pumps', '冷却水泵'], 800, 520, 200, 292, fade(L.pump(830, 806, 1) + L.pump(914, 806, 1)) + L.label(900, 540, '02', ['CW pumps', '冷却水泵'], wet ? ['VFD | N+1', '变频 | N+1'] : ['not used in this design', '本设计未采用']), wet ? ['carry ' + F(me.rejKW) + ' kW to the towers at ' + F(k.cws, 1) + ' → ' + F(k.cwr, 1) + ' °C', '以' + F(k.cws, 1) + '→' + F(k.cwr, 1) + ' °C将' + F(me.rejKW) + ' kW送至冷却塔'] : ['not used: no condenser water', '未采用：无冷却水']);
    var ch = L.chiller(1036, 640, 380, 150) + (wet ? '' : '<g>' + [0, 1, 2, 3, 4].map(function (i) { return L.fan(1070 + i * 70, 630, 16, 1.2, true); }).join('') + '</g>');
    ch += L.tag(1250, 688, [(wet ? 'condenser' : 'condenser coil') + ' ≈ ' + F(k.cond) + ' °C', '冷凝器约' + F(k.cond) + ' °C'], wet ? 'cws' : '#5D6280', null, 11.5) + L.tag(1250, 748, ['evaporator ≈ ' + F(k.evap) + ' °C', '蒸发器约' + F(k.evap) + ' °C'], 'chws', null, 11.5) + L.tag(1206, 600, ['compressor', '压缩机'], '#3F3CBB', null, 11.5);
    o += L.hot('chiller', [wet ? 'Water-cooled chillers' : 'Air-cooled chillers', wet ? '水冷冷水机组' : '风冷冷水机组'], 1020, 520, 470, 292, ch + L.label(1226, 540, '03', [wet ? 'Chillers (water-cooled)' : 'Chillers (air-cooled)', wet ? '冷水机组（水冷）' : '冷水机组（风冷）'], [(me.chN + me.chR) + ' × ' + F(me.chSize) + ' kW | ' + me.chLabel + ' | COP ' + F(model.cop, 1), (me.chN + me.chR) + ' × ' + F(me.chSize) + ' kW | ' + me.chLabel + ' | COP ' + F(model.cop, 1)]),
      ['the refrigerant evaporates at ≈ ' + F(k.evap) + ' °C taking heat from the water and condenses at ≈ ' + F(k.cond) + ' °C', '冷媒约' + F(k.evap) + ' °C蒸发吸收冷冻水热量，约' + F(k.cond) + ' °C冷凝放热']);
    /* cooling power at full IT load */
    var rows = [[['Chillers', '冷水机组'], F(model.chiller) + ' kW'], [['Chilled-water pumps', '冷冻水泵'], F(model.chwPump) + ' kW']];
    if (wet) rows.push([['Condenser-water pumps', '冷却水泵'], F(model.cwPump) + ' kW'], [['Tower fans', '冷却塔风机'], F(model.towerFan) + ' kW']);
    rows.push([['CRAH fans', 'CRAH风机'], F(model.fans) + ' kW'], [['Total cooling power', '制冷总功率'], F(model.total) + ' kW'], [['per kW of IT', '每kW IT'], F(model.total / itKW, 3) + ' kW']);
    o += L.hot('pue', ['Cooling energy and PUE', '制冷能耗与PUE'], 1506, 520, 330, 292, L.dbox(1512, 530, 320, ['Cooling power at full IT load', '满载制冷功率'], rows, '#0B6F88') + L.text(1520, 730, ['Annual PUE ' + F(R.eff.pue, 2) + ' | design day ' + F(R.eff.puePeak, 2), '年均PUE ' + F(R.eff.pue, 2) + ' | 设计日' + F(R.eff.puePeak, 2)], 'tc-lt', ' style="font-size:14px"') + L.text(1520, 752, ['cooling is the largest overhead in the tropics', '热带地区制冷是最大附加能耗'], 'tc-ls', ' style="font-size:12.5px"'),
      ['click for the PUE breakdown', '点击查看PUE构成']);
    return o;
  }
  function pfd(c) {
    var k = cw(c);
    return '<svg class="tc-pfd tc-abs" viewBox="0 0 1860 840" role="img" aria-label="' + L.te(['Chilled-water air cooling: air side, chilled-water loop, chillers and heat rejection', '冷冻水风冷：风侧、冷冻水环路、冷机及散热']) + '">' + chain(c, k) + hall(c, k) + plant(c, k) + '</svg>';
  }
  function steps(c) {
    var R = c.R, k = cw(c), me = k.me, cp = k.cp, model = k.model, cap = R.cap, tm = k.tm, wet = k.wet;
    var s = [
      { k: ['air', 'aisle'], t: ['Servers heat the air', '服务器加热空气'], d: ['Servers draw <b>' + k.sup + ' °C</b> air from the cold aisle and exhaust it ' + cp.airDT + ' K warmer (' + F(k.ret) + ' °C) into the contained hot aisle: ' + F(R.cool.airKW) + ' kW need ≈ <b>' + F(k.airflow) + ' m³/h</b> of air (Q = P ÷ ρ·cp·ΔT).', '服务器从冷通道吸入<b>' + k.sup + ' °C</b>空气，温升' + cp.airDT + ' K（' + F(k.ret) + ' °C）排入封闭热通道：' + F(R.cool.airKW) + ' kW约需<b>' + F(k.airflow) + ' m³/h</b>风量（Q = P ÷ ρ·cp·ΔT）。'] },
      { k: ['crah', 'cracrah'], t: ['CRAH coils: water cools the air', 'CRAH盘管：水冷却空气'], d: ['<b>' + (tm ? (tm.n + tm.r) + ' × ' + tm.cap + ' kW ' : '') + t(k.tn) + '</b> pull the hot air over <b>chilled-water coils</b> and blow it back at ' + k.sup + ' °C. There is no compressor in the hall — that is the CRAH route, and it is what “chilled-water air cooling” means (a CRAC would have its own compressor).', '<b>' + (tm ? (tm.n + tm.r) + ' × ' + tm.cap + ' kW ' : '') + k.tn[1] + '</b>将热风吸过<b>冷冻水盘管</b>，以' + k.sup + ' °C送回。机房内没有压缩机——这就是CRAH方案，也就是“冷冻水风冷”的含义（CRAC则自带压缩机）。'] },
      { k: ['rdhx'], t: ['Rear doors for dense racks', '高密度机柜背板'], d: ['Racks of 20–75 kW get a <b>rear-door heat exchanger</b> on the same chilled water (' + (me.rdhx ? me.rdhx + ' doors here' : 'none needed here') + '); above that, direct liquid cooling takes over.', '20–75 kW机柜加装接入同一冷冻水的<b>背板换热器</b>（' + (me.rdhx ? '本设计' + me.rdhx + '个' : '本设计无需') + '）；更高密度则采用冷板液冷。'] },
      { k: ['chwp', 'vfd', 'pipes'], t: ['Pumps and headers', '水泵与干管'], d: ['Variable-speed pumps circulate <b>' + F(k.flow) + ' m³/h</b> through DN ' + (me.chwDN || '–') + ' headers: supply ' + F(cp.chws) + ' °C, return ' + F(cp.chws + cp.chwDT) + ' °C (ΔT ' + cp.chwDT + ' K). Ring or A/B headers with valves keep cooling during maintenance.', '变频水泵经DN ' + (me.chwDN || '–') + '干管循环<b>' + F(k.flow) + ' m³/h</b>：供水' + F(cp.chws) + ' °C，回水' + F(cp.chws + cp.chwDT) + ' °C（温差' + cp.chwDT + ' K）。环网或A/B干管及阀门使检修时仍可供冷。'] },
      { k: ['tes'], t: ['Thermal storage', '蓄冷'], d: [me.tesM3 ? 'A <b>' + F(me.tesM3) + ' m³</b> tank of chilled water keeps the coils cold for ≈ ' + F(me.tesS / 60) + ' min after a power failure, while the generators start and the chillers restart; pumps and fans stay on UPS.' : 'No thermal storage is needed for this design.', me.tesM3 ? '<b>' + F(me.tesM3) + ' m³</b>蓄冷罐在断电后约' + F(me.tesS / 60) + ' min内保持盘管低温，期间发电机启动、冷机重启；水泵与风机由UPS供电。' : '本设计无需蓄冷。'] },
      { k: ['chiller', 'chw'], t: ['Chillers lift the heat', '冷机提升热量'], d: ['<b>' + (me.chN + me.chR) + ' × ' + F(me.chSize) + ' kW</b> chillers (' + me.chLabel + '): the refrigerant evaporates at ≈ ' + F(k.evap) + ' °C taking the heat out of the water, the compressor raises it to ≈ ' + F(k.cond) + ' °C and the condenser gives it away — <b>COP ' + F(model.cop, 1) + '</b> (kW of cooling per kW of power).', '<b>' + (me.chN + me.chR) + ' × ' + F(me.chSize) + ' kW</b>冷机（' + me.chLabel + '）：冷媒约' + F(k.evap) + ' °C蒸发吸收冷冻水热量，压缩机将其提升至约' + F(k.cond) + ' °C，经冷凝器放出——<b>COP ' + F(model.cop, 1) + '</b>（每kW电力产生的冷量kW）。'] },
      { k: ['phe'], t: ['Economiser', '节能换热'], d: ['When the outdoor wet-bulb is low enough, the plate heat exchanger cools the chilled water straight from tower water and the chillers rest: ≈ <b>' + F((model.free || 0) * 100) + ' %</b> of hours here (wet-bulb ' + F(R.L.wb, 1) + ' °C); highland sites such as Bandung gain more.', '室外湿球足够低时，板式换热器直接以冷却水冷却冷冻水，冷机停机：本地约<b>' + F((model.free || 0) * 100) + '%</b>时间（湿球' + F(R.L.wb, 1) + ' °C）；万隆等高原站点更多。'] }
    ];
    if (wet) s.push(
      { k: ['cwp', 'chiller'], t: ['Condenser water', '冷却水'], d: ['Condenser-water pumps carry <b>' + F(me.rejKW) + ' kW</b> — the IT heat plus the compressor work — from the condensers to the towers at ' + F(k.cws, 1) + ' → ' + F(k.cwr, 1) + ' °C.', '冷却水泵将<b>' + F(me.rejKW) + ' kW</b>（IT热量加压缩机功）以' + F(k.cws, 1) + '→' + F(k.cwr, 1) + ' °C从冷凝器送至冷却塔。'] },
      { k: ['tower', 'wue'], t: ['Towers evaporate the heat', '冷却塔蒸发散热'], d: ['<b>' + (me.ctN + me.ctR) + ' tower cells</b> cool the water to ' + F(k.cws, 1) + ' °C — the wet-bulb ' + F(R.L.wb, 1) + ' °C plus the approach — by evaporating ≈ <b>' + F(me.waterDay) + ' m³/day</b> (WUE ' + F(R.eff.wue, 2) + ' L/kWh).', '<b>' + (me.ctN + me.ctR) + '格冷却塔</b>以蒸发方式将冷却水降至' + F(k.cws, 1) + ' °C（湿球' + F(R.L.wb, 1) + ' °C加逼近度），日蒸发约<b>' + F(me.waterDay) + ' m³</b>（WUE ' + F(R.eff.wue, 2) + ' L/kWh）。'] },
      { k: ['makeup', 'wtreat'], t: ['Make-up & treatment', '补水与水处理'], d: ['Make-up water (' + F(me.waterStore) + ' m³ stored) replaces evaporation and blowdown; dosing and filtration hold 4–6 cycles of concentration and keep Legionella under control (ASHRAE 188).', '补水（储存' + F(me.waterStore) + ' m³）补充蒸发与排污；加药及过滤维持4–6倍浓缩并控制军团菌（ASHRAE 188）。'] });
    else s.push({ k: ['chiller', 'wue'], t: ['Heat to outdoor air', '热量排至室外'], d: ['The chillers are air-cooled: their condenser fans reject the heat to ' + F(R.L.db, 1) + ' °C outdoor air — no towers, no condenser water and almost no water use (WUE ' + F(R.eff.wue, 2) + '), at a higher power draw than a water-cooled plant.', '冷机为风冷：冷凝风机向' + F(R.L.db, 1) + ' °C室外空气散热——无冷却塔、无冷却水、几乎不耗水（WUE ' + F(R.eff.wue, 2) + '），但能耗高于水冷系统。'] });
    s.push({ k: ['bms'], t: ['Controls', '控制'], d: ['The BMS (≈ ' + F(R.fs.bmsPts) + ' points) stages chillers, pumps and fans to the load and holds the supply air at ' + k.sup + ' °C; every alarm reaches the NOC.', 'BMS（约' + F(R.fs.bmsPts) + '点）按负荷对冷机、水泵、风机进行台数控制，保持送风' + k.sup + ' °C；所有报警上传NOC。'] },
      { k: ['pue'], t: ['Energy → PUE', '能耗 → PUE'], d: ['At full IT load the cooling system draws <b>' + F(model.total) + ' kW</b> (' + F(model.total / cap.itKW, 2) + ' kW per kW of IT); over the year that gives a PUE of <b>' + F(R.eff.pue, 2) + '</b>.', '满载时制冷系统耗电<b>' + F(model.total) + ' kW</b>（每kW IT ' + F(model.total / cap.itKW, 2) + ' kW）；全年PUE为<b>' + F(R.eff.pue, 2) + '</b>。'] });
    return s;
  }
  function principleSvg() {
    var o = '<svg viewBox="0 0 340 196" role="img" aria-label="airflow">';
    o += L.R(10, 160, 320, 6, '#C9CDE0') + L.rack(90, 70, 50, 90) + L.rack(200, 70, 50, 90) + L.containment(140, 62, 60, 98);
    o += L.air('M20 150H80', false, 4) + L.air('M320 150H260', false, 4) + L.air('M170 140V70', true, 4) + L.air('M170 52H320', true, 3);
    o += L.text(48, 140, '24 °C', 'tc-ls', ' text-anchor="middle" style="font-weight:800;fill:#0B7F99"') + L.text(170, 110, '36 °C', 'tc-ls', ' text-anchor="middle" style="font-weight:800;fill:#B0302A"') + L.text(170, 186, ['Q = P ÷ (ρ | cp | ΔT)', 'Q = P ÷ (ρ | cp | ΔT)'], 'tc-lt', ' text-anchor="middle" style="font-size:13px"');
    return o + '</svg>';
  }
  function right(c) {
    var R = c.R;
    return L.principle('air', 'fan', ['Heat leaves by air', '热量随气流排出'], principleSvg(), ['Servers draw 24 °C air from the cold aisle and exhaust it ≈ 12 K warmer; containment keeps the streams apart so coils see warm, efficient return air.', '服务器从冷通道吸入24 °C空气，排出温升约12 K；通道封闭使两股气流分离，盘管获得高温高效的回风。']) +
      L.chips([['vfd', 'gauge', ['VFDs', '变频器']], ['bms', 'monitor', ['BMS', '楼宇自控']], ['pipes', 'layers', ['Piping', '管路']], ['ashrae', 'therm', ['ASHRAE', '温湿度']]]) +
      L.kpis([['pue', F(R.eff.pue, 2), '', ['Annual PUE', '年均PUE'], ['cooling ' + F(R.eff.mech, 2) + ' × IT', '制冷 ' + F(R.eff.mech, 2) + ' × IT']],
        ['wue', F(R.eff.wue, 2), 'L/kWh', ['Water use (WUE)', '用水效率'], [F(R.me.waterDay) + ' m³/day', F(R.me.waterDay) + ' m³/日']],
        ['ashrae', '18–27', '°C', ['Server inlet', '服务器进风'], ['ASHRAE recommended', 'ASHRAE推荐']],
        ['chw', '14 → 22', '°C', ['Chilled water', '冷冻水'], ['ΔT ' + K.CHW_DT + ' K, elevated', '温差' + K.CHW_DT + ' K，高温冷冻水']]]);
  }
  function bottom(c) {
    var R = c.R, x = c.x, h = '';
    var rows = x.matrix.slice(0, 5).map(function (m) { return [[m.en.split(' (')[0].split(' + ')[0], m.zh.split('（')[0].split(' + ')[0]], F(m.pue, 2), m.feasible ? F(m.score, 2) : '✗']; }), cur = 0;
    x.matrix.slice(0, 5).forEach(function (m, i) { if (m.id === c.p.cooling) cur = i; });
    h += L.tile(0, 'chw', 'grid', ['Cooling decision', '制冷方案决策'], ['matrix score', '矩阵评分'], L.mtable([['Technology', '技术'], 'PUE', ['Score', '得分']], rows.map(function (r) { return [t(r[0]), r[1], r[2]]; }), cur) + L.note(['Weighted: efficiency, water, scale, CAPEX, maturity, IT fit.', '加权：能效、用水、规模、投资、成熟度、IT适配。']));
    var e = R.eff, parts = [[['IT', 'IT'], 1, '#3F3CBB'], [['Cooling', '制冷'], e.mech, '#0EA5C6'], [['Electrical', '电气'], e.elec, '#E39B1B'], [['Other', '其他'], e.misc, '#5D6280']];
    h += L.tile(1, 'pue', 'gauge', ['Energy per kWh IT', '每kWh IT能耗'], 'PUE ' + F(e.pue, 2), '<div style="display:flex;gap:12px;align-items:center">' + L.donut(parts, { center: F(e.pue, 2), unit: 'PUE' }) + '<div style="display:grid;gap:5px;flex:1">' + L.legend(parts, 3) + '</div></div>' + L.note(['Cooling is the largest overhead in the tropics.', '热带地区制冷是最大的附加能耗。']), '#E2F5FA');
    var heat = R.me.rejKW || R.cap.itKW * 1.1, occ = c.p.targetOcc / 100, ev = heat * occ * 0.036, mu = ev * 5 / 4, bd = ev / 4;
    h += L.tile(2, 'wue', 'drop', ['Water balance', '水量平衡'], ['per day, CoC 5', '每日，浓缩5倍'], L.miniBars([[['Evaporation', '蒸发'], ev, '#0EA5C6'], [['Blowdown', '排污'], bd, '#5D6280'], [['Make-up', '补水'], mu, '#1E8FC0']], mu, ' m³') + L.note(['Engine WUE ' + F(R.eff.wue, 2) + ' L/kWh → ' + F(R.me.waterDay) + ' m³/day.', '引擎WUE ' + F(R.eff.wue, 2) + ' L/kWh → ' + F(R.me.waterDay) + ' m³/日。']));
    var locs = ['JB-BKS', 'KR-BTM', 'JI-SBY', 'SU-MDN', 'JB-BDG'].map(function (id) { return E.loc(id); }), cur2 = R.L.id;
    if (locs.map(function (l) { return l.id; }).indexOf(cur2) < 0) locs[0] = R.L;
    h += L.tile(3, 'ashrae', 'therm', ['Design wet-bulb', '设计湿球温度'], ['towers follow it', '冷却塔随之变化'], L.miniBars(locs.map(function (l) { return [[l.en.split(' (')[0].split(' –')[0], l.zh.split('（')[0]], l.wb, l.id === cur2 ? '#3F3CBB' : '#B9BCE6', 1]; }), 30, ' °C') + L.note(['Lower wet-bulb → colder tower water → better COP.', '湿球越低 → 冷却水越冷 → COP越高。']), '#FDF2DD');
    h += L.tile(4, 'faq', 'chat', ['Client questions', '客户问题'], [FAQ.length + ' answers', FAQ.length + '个解答'], '<div class="tc-qs">' + FAQ.slice(0, 4).map(function (q) { return '<span>' + L.te(q[0]) + '</span>'; }).join('') + '</div>', '#E2F5FA');
    return h;
  }
  var card = {
    id: 'CHW', abbr: 'CHW', title: ['Chilled-Water Air Cooling', '冷冻水风冷系统'], short: ['Chilled-Water Cooling', '冷冻水风冷'], icon: 'snow',
    blurb: ['Towers, chillers, storage, fan walls, containment', '冷却塔、冷机、蓄冷、风墙、通道封闭'], badge: ['Cooling', '制冷'], basis: 'A05', calc: Object.assign({}, X.CALC, { tesT: X.CALC.tes }), units: UNITS, faq: FAQ,
    steps: steps,
    basisOk: function (x) { return x.R.me.chN > 0; }, fallNote: ['The selected design has no chilled-water plant; the card shows benchmark A05.', '所选设计无冷冻水系统；卡片显示基准A05。'],
    gloss: [['CHW / CW', '冷冻水/冷却水', 'Chilled water / condenser water.', '冷冻水/冷却水。'], ['CoC', '浓缩倍数', 'Cycles of concentration in a cooling tower.', '冷却塔浓缩倍数。'], ['COP', '性能系数', 'Coefficient of performance: cooling output ÷ power input.', '制冷量与输入功率之比。'], ['RT', '冷吨', 'Refrigeration ton = 3.517 kW.', '冷吨 = 3.517 kW。'], ['PDAM', '市政供水公司', 'Perusahaan Daerah Air Minum — municipal water utility.', '印尼地方供水公司。']],
    sources: [['ASHRAE TC 9.9 Thermal Guidelines', 'ASHRAE TC 9.9温湿度指南'], 'AHRI 550/590', ['CTI and Legionella guidance (ASHRAE 188)', 'CTI及军团菌指南（ASHRAE 188）'], ['Climate data: knowledge base (design dry/wet-bulb per location)', '气候数据：知识库（各地点设计干/湿球）'], ['Assessment engine cooling model (MECH / WUE coefficients)', '评估引擎制冷模型（MECH/WUE系数）']],
    stage: function (c) {
      var R = c.R;
      card.tag = ['The CRAH route: <b>air</b> cools the servers, <b>chilled-water coils</b> in CRAH-type units cool the air (no compressor in the hall), chillers cool the water — <b>' + F(R.cool.airKW) + ' kW</b> by air, chilled water ' + F((R.me.cp || {}).chws || 14) + ' → ' + F(((R.me.cp || {}).chws || 14) + ((R.me.cp || {}).chwDT || 8)) + ' °C, PUE <b>' + F(R.eff.pue, 2) + '</b>, WUE <b>' + F(R.eff.wue, 2) + '</b> L/kWh.',
        'CRAH方案：<b>空气</b>冷却服务器，CRAH类末端中的<b>冷冻水盘管</b>冷却空气（机房内无压缩机），冷机冷却冷冻水——风冷<b>' + F(R.cool.airKW) + ' kW</b>，冷冻水' + F((R.me.cp || {}).chws || 14) + '→' + F(((R.me.cp || {}).chws || 14) + ((R.me.cp || {}).chwDT || 8)) + ' °C，PUE <b>' + F(R.eff.pue, 2) + '</b>，WUE <b>' + F(R.eff.wue, 2) + '</b> L/kWh。'];
      return L.header(card) + pfd(c) + right(c) + bottom(c) + L.footer(['Indicative values for the selected design basis and its climate; plant selection follows load and climate studies.', '所选设计基准及其气候下的参考值；设备选型须依据负荷及气候研究。'], [['basis', L.UI.basis], ['gloss', L.UI.gloss]]);
    },
    panels: function (c) {
      var P = UNITS.map(function (u) { return L.unitPanel(u, c); });
      THEORY.forEach(function (th, i) { P.push(L.theoryPanel(Object.assign({}, X.TH[th[1]], { id: th[0] }), 'T' + (i + 1), c)); });
      if (X.TH.cracrah) P.push(L.theoryPanel(Object.assign({}, X.TH.cracrah, { id: 'cracrah' }), 'T' + (THEORY.length + 1), c));
      P.push(L.faqPanel(card));
      return P;
    }
  };
  TC.register(card);
})(window);
