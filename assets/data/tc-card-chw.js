/* Technology card: Chilled-Water Air Cooling (cooling towers → chillers → thermal storage → fan walls → contained aisles). */
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
    [['Why chilled water instead of DX precision units?', '为什么用冷冻水而不是直膨精密空调？'], ['Above ≈ 1 MW a central chilled-water plant is far more efficient and easier to maintain than hundreds of DX units with long refrigerant pipes, and it scales to large halls with fan walls. DX remains practical for small rooms and edge sites.', '约1 MW以上，集中冷冻水系统比数百台带长冷媒管的直膨机组效率高得多、更易维护，并可配合风墙扩展到大型机房。直膨仍适用于小机房及边缘站点。']],
    [['Why is free cooling rare in Indonesia?', '为什么印尼很少采用自然冷却？'], ['Lowland sites have a design wet-bulb of ≈ 27–28 °C all year, so towers cannot make water cold enough to replace the chillers. Highland sites (Bandung ≈ 23.5 °C) and warm-water liquid cooling change that.', '低地站点全年设计湿球约27–28 °C，冷却塔无法产生足以替代冷机的低温水。高原站点（万隆约23.5 °C）及温水液冷可改变这一点。']],
    [['How much water does a water-cooled data center use?', '水冷数据中心用水量多少？'], ['About 1.8–2.0 L per kWh of IT in the tropics: a 10 MW site at 85 % load needs ≈ 390 m³ per day. Air-cooled chillers or dry coolers use almost none but consume more electricity.', '热带地区约1.8–2.0 L/kWh IT：10 MW站点在85%负载时每日约需390 m³。风冷冷机或干冷器几乎不用水，但耗电更多。']],
    [['What happens to cooling during a power failure?', '断电时制冷会怎样？'], ['Chillers stop until the generators run and the compressors restart (2–5 min). Pumps and fan walls stay on UPS and circulate cold water from the thermal storage tank, so server inlet temperatures stay in range.', '冷机停止，直至发电机运行且压缩机重启（2–5分钟）。水泵与风墙由UPS供电，循环蓄冷罐中的冷水，使服务器进风温度保持在范围内。']],
    [['What supply air temperature should we design for?', '送风温度应按多少设计？'], ['ASHRAE recommends 18–27 °C at the server inlet; most new halls supply 22–25 °C with contained aisles. Higher supply and chilled-water temperatures cut chiller energy noticeably.', 'ASHRAE推荐服务器进风18–27 °C；多数新建封闭通道机房送风22–25 °C。提高送风及冷冻水温度可明显降低冷机能耗。']],
    [['Water-cooled or air-cooled chillers?', '水冷还是风冷冷机？'], ['Water-cooled plants reach a lower PUE (≈ 1.35–1.40 in Jakarta) but need towers, water treatment and make-up water; air-cooled plants (≈ 1.45–1.50) suit water-scarce sites and smaller projects. The decision matrix scores both for the selected basis.', '水冷系统PUE更低（雅加达约1.35–1.40），但需冷却塔、水处理及补水；风冷系统（约1.45–1.50）适合缺水站点及较小项目。决策矩阵针对所选基准对二者评分。']],
    [['Can air cooling handle AI racks?', '风冷能否满足AI机柜？'], ['Up to ≈ 25 kW per rack with containment and ≈ 40–75 kW with rear-door coolers. GPU racks of 100 kW and more need direct liquid cooling — see the liquid-cooling card.', '封闭通道下单柜约25 kW，背板换热约40–75 kW。100 kW以上GPU机柜需冷板液冷——见液冷卡片。']]
  ];

  function pfd(c) {
    var R = c.R, me = R.me, cap = R.cap, o = '';
    o += L.ground(132, 232, 1330) + L.R(132, 242, 1330, 40, 'url(#tcSoil)', ' opacity=".5"') + L.R(0, 497, 1470, 16, 'url(#tcGround)');
    o += L.waves(0, 512, 1470, 108, 'url(#tcWater)', 6, 140, 6, '#7FD0EA') + '<path d="M0 604' + new Array(14).join('q60 -10 120 0') + 'V620H0Z" fill="#C9C2A6" opacity=".9"/>';
    o += L.text(735, 590, ['Make-up water: PDAM mains or groundwater · rainwater harvesting · stored for ' + c.p.fuelH + ' h', '补水：市政供水（PDAM）或地下水 · 雨水收集 · 储存' + c.p.fuelH + ' h'], 'tc-lw', ' text-anchor="middle" style="font-size:12.5px"');
    /* condenser loop */
    o += L.pipe('M412 222H440', 'cws', 6) + L.pipe('M604 204H640', 'cws', 6) + L.pipe('M880 176H900V96H190V150', 'cwr', 6, true, true);
    /* chilled-water loop */
    o += L.pipe('M880 212H1210', 'chws', 7) + L.pipe('M1374 204H1462V438H1432', 'chws', 7) + L.pipe('M1330 392V266H906V232', 'chwr', 6, true, true) + L.thin('M1108 212V232', 'chws', 3, '4 4');
    o += L.pipe('M226 513V494', 'water', 5, true, true) + L.thin('M302 462H350', 'water', 3, '4 4');
    /* banners */
    o += L.banner(140, 0, 1310, ['① HEAT REJECTION & CHILLED-WATER PLANT · 散热与冷冻站', '① 散热与冷冻站 · CHILLED-WATER PLANT'], ['towers, pumps, chillers, economiser and thermal storage', '冷却塔、水泵、冷机、节能换热器及蓄冷'], null, 'tcZone2');
    o += L.banner(600, 290, 860, ['② WHITE SPACE AIR SIDE · 白区气流', '② 白区气流 · AIR SIDE'], ['cold air in, hot air contained and returned', '冷风送入，热风封闭回流'], null, 'tcZone');
    o += L.banner(130, 290, 450, ['③ WATER · 水系统', '③ 水系统 · WATER'], ['make-up & treatment', '补水与水处理'], null, 'tcZone5');
    /* row 1 */
    var tw = L.coolingTower(150, 170, 80, 62) + L.coolingTower(240, 170, 80, 62) + L.coolingTower(330, 170, 80, 62);
    o += L.hot('tower', ['Cooling towers', '冷却塔'], 144, 38, 272, 200, tw + L.label(280, 60, '01', ['Cooling towers', '冷却塔'], me.ctN ? [(me.ctN + me.ctR) + ' cells · ' + F(me.rejKW) + ' kW', (me.ctN + me.ctR) + '格 · ' + F(me.rejKW) + ' kW'] : ['air-cooled plant in this basis', '本基准为风冷系统']));
    o += L.hot('cwp', ['Condenser-water pumps', '冷却水泵'], 434, 38, 176, 200, L.pump(440, 232, 1) + L.pump(526, 232, 1) + L.label(520, 60, '02', ['CW pumps', '冷却水泵'], ['variable speed', '变频']));
    o += L.hot('chiller', ['Chillers', '冷水机组'], 634, 38, 252, 200, L.chiller(640, 150, 240, 82) + L.label(760, 60, '03', ['Chillers', '冷水机组'], me.chN ? (me.chN + me.chR) + ' × ' + F(me.chSize) + ' kW · ' + me.chLabel : '–'));
    o += L.hot('phe', ['Plate heat exchanger', '板式换热器'], 906, 38, 114, 200, L.phe(915, 168, 96, 64) + L.label(963, 60, '04', ['Plate HX', '板换'], ['economiser', '节能']));
    o += L.hot('tes', ['Thermal storage', '蓄冷罐'], 1052, 38, 120, 200, L.storageTank(1060, 120, 96, 112, '#0EA5C6') + L.label(1112, 60, '05', ['TES tank', '蓄冷罐'], me.tesM3 ? F(me.tesM3) + ' m³' : ['not required', '无需']));
    o += L.hot('chwp', ['Chilled-water pumps', '冷冻水泵'], 1204, 38, 176, 200, L.pump(1210, 232, 1) + L.pump(1296, 232, 1) + L.label(1290, 60, '06', ['CHW pumps', '冷冻水泵'], ['N+1 · VFD', 'N+1 · 变频']));
    o += L.text(1040, 206, ['14 °C →', '14 °C →'], 'tc-ls', ' style="font-weight:800;fill:#0B7F99"') + L.text(1160, 260, ['← 22 °C return', '← 22 °C回水'], 'tc-ls', ' style="font-weight:800;fill:#B0302A"');
    /* row 2: air side */
    var tn = me.term ? (me.term.id === 'ME-10' ? ['In-row coolers', '列间空调'] : me.term.id === 'ME-07' ? ['CRAH units', '精密空调'] : ['Fan walls', '风墙']) : ['Precision AC', '精密空调'];
    o += L.hot('crah', tn, 1300, 330, 150, 170, L.fanWall(1310, 392, 120, 106, 2, 3, true) + L.label(1370, 352, '07', tn, me.term ? (me.term.n + me.term.r) + ' × ' + me.term.size + ' kW' : '–'));
    var room = L.R(770, 384, 520, 113, '#F7F8FD', ' rx="4" stroke="#C9CDE0"') + '<path d="M770 398H1290M770 470H1290" stroke="#B9BED2" stroke-width="2"/>' + L.R(770, 470, 520, 27, '#E2F5FA', ' opacity=".7"');
    room += L.rack(860, 402, 62, 68) + L.rack(1068, 402, 62, 68) + L.containment(922, 400, 146, 70);
    room += L.air('M1300 486H790', false, 4) + L.air('M826 482V420', false, 4) + L.air('M1170 482V420', false, 4) + L.air('M995 462V404', true, 5) + L.air('M995 392H1300', true, 4);
    room += L.text(826, 414, ['cold 24 °C', '冷 24 °C'], 'tc-ls', ' text-anchor="middle" style="font-weight:800;fill:#0B7F99;font-size:11.5px"') + L.text(1170, 414, ['cold 24 °C', '冷 24 °C'], 'tc-ls', ' text-anchor="middle" style="font-weight:800;fill:#0B7F99;font-size:11.5px"') + L.text(995, 440, ['hot 36 °C', '热 36 °C'], 'tc-ls', ' text-anchor="middle" style="font-weight:800;fill:#B0302A;font-size:11.5px"');
    o += L.hot('aisle', ['Hot-aisle containment', '热通道封闭'], 764, 330, 532, 170, room + L.label(1000, 352, '08', ['Hot-aisle containment', '热通道封闭'], [F(cap.racks) + ' racks · ΔT ≈ 12 K', F(cap.racks) + '个机柜 · 温差约12 K']));
    var rd = L.rack(640, 410, 60, 88) + L.R(700, 414, 12, 80, '#0EA5C6', ' rx="2"') + '<path d="M702 420V488M706 420V488M710 420V488" stroke="#E2F5FA" stroke-width="1"/>' + L.pipe('M706 414V392H740', 'chws', 3, false) + L.air('M716 454H750', false, 3);
    o += L.hot('rdhx', ['Rear-door heat exchangers', '背板换热器'], 620, 330, 140, 170, rd + L.label(690, 352, '09', ['Rear-door HX', '背板换热'], me.rdhx ? [me.rdhx + ' doors', me.rdhx + '个'] : ['20–75 kW racks', '20–75 kW机柜']));
    o += L.hot('makeup', ['Make-up water', '补水'], 140, 330, 180, 170, L.tankBox(150, 432, 150, 62, 16, 'tcWater', .7) + L.label(228, 352, '10', ['Make-up water', '补水'], F(me.waterStore) + ' m³'));
    var wt = L.cylV(350, 450, 26, 46, 'tcWhite') + L.R(352, 466, 22, 26, '#E39B1B', ' opacity=".8"') + L.cylV(386, 450, 26, 46, 'tcWhite') + L.R(388, 466, 22, 26, '#7C3AED', ' opacity=".7"') + L.cylV(422, 450, 26, 46, 'tcWhite') + L.R(424, 466, 22, 26, '#16A34A', ' opacity=".7"') + L.R(460, 462, 50, 34, '#3A3F63', ' rx="3"') + L.R(466, 468, 20, 8, '#0EA5C6', ' rx="1"');
    o += L.hot('wtreat', ['Water treatment', '水处理'], 340, 330, 200, 170, wt + L.label(436, 352, '11', ['Water treatment', '水处理'], ['CoC 4–6 · Legionella', '浓缩4–6倍 · 军团菌']));
    return '<svg class="tc-pfd tc-abs" viewBox="0 0 1470 620" role="img" aria-label="' + L.te(['Chilled-water cooling', '冷冻水制冷']) + '">' + o + '</svg>';
  }
  function principleSvg() {
    var o = '<svg viewBox="0 0 340 196" role="img" aria-label="airflow">';
    o += L.R(10, 160, 320, 6, '#C9CDE0') + L.rack(90, 70, 50, 90) + L.rack(200, 70, 50, 90) + L.containment(140, 62, 60, 98);
    o += L.air('M20 150H80', false, 4) + L.air('M320 150H260', false, 4) + L.air('M170 140V70', true, 4) + L.air('M170 52H320', true, 3);
    o += L.text(48, 140, '24 °C', 'tc-ls', ' text-anchor="middle" style="font-weight:800;fill:#0B7F99"') + L.text(170, 110, '36 °C', 'tc-ls', ' text-anchor="middle" style="font-weight:800;fill:#B0302A"') + L.text(170, 186, ['Q = P ÷ (ρ · cp · ΔT)', 'Q = P ÷ (ρ · cp · ΔT)'], 'tc-lt', ' text-anchor="middle" style="font-size:13px"');
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
    basisOk: function (x) { return x.R.me.chN > 0; }, fallNote: ['The selected design has no chilled-water plant; the card shows benchmark A05.', '所选设计无冷冻水系统；卡片显示基准A05。'],
    gloss: [['CHW / CW', '冷冻水/冷却水', 'Chilled water / condenser water.', '冷冻水/冷却水。'], ['CoC', '浓缩倍数', 'Cycles of concentration in a cooling tower.', '冷却塔浓缩倍数。'], ['COP', '性能系数', 'Coefficient of performance: cooling output ÷ power input.', '制冷量与输入功率之比。'], ['RT', '冷吨', 'Refrigeration ton = 3.517 kW.', '冷吨 = 3.517 kW。'], ['PDAM', '市政供水公司', 'Perusahaan Daerah Air Minum — municipal water utility.', '印尼地方供水公司。']],
    sources: [['ASHRAE TC 9.9 Thermal Guidelines', 'ASHRAE TC 9.9温湿度指南'], 'AHRI 550/590', ['CTI and Legionella guidance (ASHRAE 188)', 'CTI及军团菌指南（ASHRAE 188）'], ['Climate data: knowledge base (design dry/wet-bulb per location)', '气候数据：知识库（各地点设计干/湿球）'], ['Assessment engine cooling model (MECH / WUE coefficients)', '评估引擎制冷模型（MECH/WUE系数）']],
    stage: function (c) {
      var R = c.R;
      card.tag = ['<b>' + F(R.cool.airKW) + ' kW</b> of server heat travels by air to fan walls, chillers and cooling towers: supply 24 °C, chilled water 14 → 22 °C, annual PUE <b>' + F(R.eff.pue, 2) + '</b>, WUE <b>' + F(R.eff.wue, 2) + '</b> L/kWh.',
        '<b>' + F(R.cool.airKW) + ' kW</b>服务器热量经空气传至风墙、冷机及冷却塔：送风24 °C，冷冻水14→22 °C，年均PUE <b>' + F(R.eff.pue, 2) + '</b>，WUE <b>' + F(R.eff.wue, 2) + '</b> L/kWh。'];
      return L.header(card) + pfd(c) + right(c) + bottom(c) + L.footer(['Indicative values for the selected design basis and its climate; plant selection follows load and climate studies.', '所选设计基准及其气候下的参考值；设备选型须依据负荷及气候研究。'], [['basis', L.UI.basis], ['gloss', L.UI.gloss]]);
    },
    panels: function (c) {
      var P = UNITS.map(function (u) { return L.unitPanel(u, c); });
      THEORY.forEach(function (th, i) { P.push(L.theoryPanel(Object.assign({}, X.TH[th[1]], { id: th[0] }), 'T' + (i + 1), c)); });
      P.push(L.faqPanel(card));
      return P;
    }
  };
  TC.register(card);
})(window);
