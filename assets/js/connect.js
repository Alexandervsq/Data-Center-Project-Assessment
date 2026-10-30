/* Data Center Project Assessment — connected design model.
 * Shared by the Project Technology Simulation (assets/js/techcard.js) and the knowledge-document generators
 * (0. Source Scripts), so the website, the deck and the specification describe the same links.
 * A design change set { engineKey: value } is applied to a design-basis input before the proposal layer and the engine run,
 * so every connected system follows its rules. Pure functions, no DOM; runs in the browser and in Node. */
(function (g) {
  'use strict';
  var DB = g.DCDB, E = g.DCEngine, P = g.DCPropose;
  function F(x, d) { return isFinite(x) ? E.fmt(x, d || 0) : '–'; }
  /* connected design: the basis input + the user's design changes go through the proposal layer and the engine together,
     so every system follows its rules. '__auto__' returns a proposal key to its rule when the basis itself fixed it. */
  function applyChg(input, chg) {
    input.ov = input.ov || {};
    Object.keys(chg || {}).forEach(function (k) {
      var v = chg[k];
      if (v === '__auto__') { delete input[k]; input.ov[k] = false; return; }
      if (k === 'itMW') { input.sizing = 'mw'; input.itMW = v; return; }
      if (k === 'racks') { input.sizing = 'racks'; input.racks = v; return; }
      input[k] = v;
      if (P.AUTO.indexOf(k) >= 0) input.ov[k] = true;
    });
    return input;
  }
  /* results compared before / after a change (grouped by system) */
  function usd(v) { return v >= 1e9 ? 'USD ' + F(v / 1e9, 2) + ' B' : (v >= 1e6 ? 'USD ' + F(v / 1e6, 1) + ' M' : 'USD ' + F(v / 1e3, 0) + ' k'); }
  var MG = { P: ['Power path', '供电路径'], W: ['White space & IT', '白区与IT'], C: ['Cooling', '制冷'], F: ['Fire · security · monitoring', '消防·安防·监控'], B: ['Building, cost & schedule', '建筑、投资与工期'] };
  function metrics(x) {
    var R = x.R, p = x.p, el = R.el, hv = el.hv, me = R.me, sp = R.sp, c = R.cap, fs = R.fs, M = [];
    function m(g, id, l, v) { M.push({ g: g, id: id, l: l, v: v }); }
    m('P', 'md', ['Maximum demand', '最大需量'], F(el.mva, 1) + ' MVA · ' + F(el.demandKW) + ' kW');
    m('P', 'conn', ['PLN connection', 'PLN接入'], [hv.name + ' · ' + hv.circ + ' circuit(s)', hv.name + ' · ' + hv.circ + '回进线']);
    m('P', 'gis', ['HV substation', '高压变电站'], hv.gis ? hv.ur + ' kV GIS · ' + hv.ik + ' kA · ' + F(hv.busA) + ' A' : ['none (20 kV supply)', '无（20 kV供电）']);
    m('P', 'pcc', ['Fault level at the connection point · Isc/IL', '接入点短路水平 · Isc/IL'], F(hv.pccIk, 1) + ' kA · ' + F(hv.ssc) + ' MVA · ' + F(R.gimp ? R.gimp.scr : 0));
    m('P', 'ibt', ['EHV/HV transformers', '超高压/高压联络变压器'], hv.ibt ? hv.ibt.total + ' × ' + hv.ibt.mva + ' MVA ' + hv.ibt.ratio : '–');
    m('P', 'ht', ['HV/MV transformers', '高压/中压主变压器'], hv.ht ? hv.ht.total + ' × ' + hv.ht.mva + ' MVA ' + hv.ht.ratio + ' · uk ' + hv.ht.uk + ' %' : '–');
    m('P', 'mv', ['20 kV switchgear', '20 kV开关柜'], hv.mv.boards + ' × ' + F(hv.mv.busA) + ' A · ' + hv.mv.ik + ' kA');
    m('P', 'tx', ['MV/LV transformers', '中/低压变压器'], el.txTotal + ' × ' + F(el.txSize) + ' kVA (' + el.txLabel + ')');
    m('P', 'lv', ['LV main breaker · fault level', '低压主断路器 · 短路水平'], F(el.lv.acb) + ' A · ' + el.lv.icw + ' kA');
    m('P', 'gen', ['Generators', '发电机'], el.genTotal + ' × ' + F(el.genSize) + ' kWe (' + el.genLabel + ') · ' + (el.genV === 'MV' ? '20 kV' : '400 V'));
    m('P', 'fuel', ['Fuel storage', '燃油储存'], F(el.fuelL / 1000) + ' m³ · ' + el.tanks + ' × ' + el.tankSize + ' m³ · ' + p.fuelH + ' h');
    m('P', 'ups', ['UPS', 'UPS'], el.upsTotal + ' × ' + F(el.upsSize) + ' kW (' + el.upsLabel + ')');
    m('P', 'batt', ['Batteries', '蓄电池'], F(el.battKWh) + ' kWh · ' + p.upsMin + ' min · ' + (p.battery === 'LI' ? 'LFP' : 'VRLA'));
    m('P', 'bess', ['BESS', '储能'], el.bess ? F(el.bess.mw, 1) + ' MW / ' + F(el.bess.mwh, 1) + ' MWh' : '–');
    m('P', 'pq', ['Grid impact: harmonic TDD · AI voltage step', '电网影响：谐波TDD · AI电压阶跃'], R.gimp ? F(R.gimp.tdd, 1) + ' % / ' + F(R.gimp.tddLimit, 1) + ' % · ' + F(R.gimp.dvAi, 2) + ' %' + (R.gimp.ahf ? ' · AHF' : '') : '–');
    m('P', 'tar', ['PLN tariff', 'PLN电价'], 'Rp ' + F(p.tariffIDR, 1) + '/kWh · ' + (el.vclass === 'TT' ? 'I-4 TT' : 'TM'));
    m('W', 'it', ['IT load', 'IT负载'], F(c.itMW, 2) + ' MW');
    m('W', 'racks', ['Racks (standard + high-density)', '机柜（标准+高密度）'], F(c.racks) + ' (' + F(c.stdR) + ' + ' + F(c.hdR) + ')');
    m('W', 'dens', ['Rack density average / maximum', '机柜密度 平均/最大'], F(c.avgDens, 1) + ' / ' + F(c.maxDens, 0) + ' kW');
    m('W', 'rows', ['Rows · IT distribution', '列数 · IT配电'], el.rows + ' · ' + (el.useBusway ? el.busways + ' × ' + el.bwA + ' A' + (el.bwHdA && el.bwHdA !== el.bwA ? ' / ' + el.bwHdA + ' A' : '') : el.pdus + ' PDU'));
    m('W', 'rpdu', ['Rack PDUs', '机柜PDU'], F(el.rpdus));
    m('W', 'ws', ['White space · halls', '白区 · 机房'], F(sp.ws) + ' m² · ' + sp.halls);
    m('C', 'pue', ['PUE annual / design day', 'PUE 年均/设计日'], F(R.eff.pue, 2) + ' / ' + F(R.eff.puePeak, 2));
    m('C', 'cool', ['Cooling system', '制冷系统'], [R.cool.obj.en, R.cool.obj.zh]);
    m('C', 'cop', ['Chiller COP · free cooling', '冷机COP · 自然冷却'], me.model && me.model.cop ? F(me.model.cop, 2) + ' · ' + F(me.model.free * 100) + ' %' : '–');
    m('C', 'ch', ['Chillers', '冷水机组'], me.chN ? (me.chN + me.chR) + ' × ' + F(me.chSize) + ' kW · ' + F(me.chwLoad) + ' kW' : '–');
    m('C', 'ct', ['Cooling towers', '冷却塔'], me.ctN ? (me.ctN + me.ctR) + ' · ' + F(me.rejKW) + ' kW' : '–');
    m('C', 'tes', ['Thermal storage', '蓄冷'], me.tesM3 ? F(me.tesM3) + ' m³ · ' + F(me.tesS / 60) + ' min' : '–');
    m('C', 'term', ['Air terminals', '末端空调'], me.term ? (me.term.n + me.term.r) + ' × ' + (me.term.cap || me.term.size) + ' kW' : (me.cracN ? (me.cracN + me.cracR) + ' × ' + me.cracSize + ' kW' : (me.iecN ? (me.iecN + me.iecR) + ' × 400 kW' : '–')));
    m('C', 'cdu', ['CDUs · dry coolers', 'CDU · 干冷器'], me.cduN ? (me.cduN + me.cduR) + ' × ' + F(me.cduSize) + ' kW · ' + (me.dcN + me.dcR) : '–');
    m('C', 'water', ['WUE · make-up water', 'WUE · 补水量'], F(R.eff.wue, 2) + ' L/kWh · ' + F(me.waterDay) + ' m³/d');
    m('F', 'gas', ['Gas zones · agent', '气体分区 · 灭火剂'], fs.gasZones ? fs.gasZones + ' · ' + F(fs.agentKg) + ' kg' : ['pre-action sprinklers', '预作用喷淋']);
    m('F', 'asd', ['Aspirating detectors', '吸气式探测器'], F(fs.asd));
    m('F', 'cams', ['Cameras · access doors', '摄像机 · 门禁'], F(fs.cams) + ' · ' + F(fs.readers));
    m('F', 'pts', ['BMS points · EPMS meters', 'BMS点 · EPMS电表'], F(fs.bmsPts) + ' · ' + F(fs.meters));
    m('B', 'gfa', ['GFA · storeys', '建筑面积 · 层数'], F(sp.gfa) + ' m² · ' + p.floors);
    m('B', 'site', ['Site area · floor load', '用地 · 楼面荷载'], F(sp.siteNeed / 1e4, 2) + ' ha · ' + sp.floorLoad + ' kN/m²');
    m('B', 'capex', ['CAPEX (facility, PLN connection, contingency)', '投资（设施、PLN接入、不可预见）'], usd(R.capex.facility + R.capex.utility + R.capex.cont));
    m('B', 'util', ['PLN connection cost', 'PLN接入投资'], usd(R.capex.utility));
    m('B', 'en', ['Energy cost per year', '年电费'], usd(R.opex.energy));
    m('B', 'sch', ['Programme to ready-for-service', '至投产工期'], [R.sched.total + ' months', R.sched.total + '个月']);
    return M;
  }
  /* design parameters (each one is editable in a calculator of the simulation and listed in the knowledge documents): value now, rule value (AUTO), options or range */
  var DG = { S: ['Site & load', '场地与负载'], W: ['IT & white space', 'IT与白区'], P: ['Power path', '供电路径'], C: ['Cooling', '制冷'], B: ['Building', '建筑'], $: ['Energy & commercial', '能源与商务'] };
  function kOpts(list, unit) { return list.map(function (v) { return [v, F(v) + ' ' + unit]; }); }
  function designParams(x) {
    var R = x.R, p = x.p, pr = x.prop || {}, el = R.el, hv = el.hv, me = R.me, c = R.cap, K = E.K, yn = [[true, ['Yes', '是']], [false, ['No', '否']]];
    var plats = DB.platforms.map(function (q) { return [q.id, [q.en + ' · ' + q.kw + ' kW', q.zh + ' · ' + q.kw + ' kW']]; });
    var kvO = E.KV.map(function (o) { var a = hv.opts.filter(function (z) { return z.kv === o.kv; })[0] || {}; return [o.kv, [o.en + (a.rule ? ' — recommended' : (o.intl ? '' : (a.avail === 3 ? ' — planned' : (a.avail ? '' : ' — not in this grid')))), o.zh + (a.rule ? '——建议' : (o.intl ? '' : (a.avail === 3 ? '——规划中' : (a.avail ? '' : '——本电网无'))))]]; });
    return [
      { g: 'S', k: 'loc', l: ['Location (PLN system, climate, land)', '地点（PLN电网、气候、地价）'], o: DB.idLocs.map(function (L) { return [L.id, [L.en + ' · ' + L.provEn, L.zh + ' · ' + L.provZh]]; }), v: p.loc },
      { g: 'S', k: 'itMW', l: ['IT load', 'IT负载'], u: 'MW', min: 0.05, max: 3000, st: 0.05, v: c.itMW },
      { g: 'S', k: 'tier', l: ['Resilience (Uptime Tier)', '韧性等级（Uptime Tier）'], o: [[1, 'Tier I'], [2, 'Tier II'], [3, 'Tier III'], [4, 'Tier IV']], v: p.tier, r: pr.tier },
      { g: 'W', k: 'stdPlat', l: ['Standard IT platform', '标准IT平台'], o: plats, v: p.stdPlat, r: pr.stdPlat },
      { g: 'W', k: 'dens', l: ['Standard rack design load', '标准机柜设计功率'], u: 'kW', min: 1, max: 80, st: 0.5, v: c.sd, r: pr.dens },
      { g: 'W', k: 'hdPlat', l: ['High-density IT platform', '高密度IT平台'], o: plats, v: p.hdPlat, r: pr.hdPlat },
      { g: 'W', k: 'hdShare', l: ['High-density share of racks', '高密度机柜占比'], u: '%', min: 0, max: 100, st: 1, v: p.hdShare, r: pr.hdShare },
      { g: 'W', k: 'hdDens', l: ['High-density rack design load', '高密度机柜设计功率'], u: 'kW', min: 5, max: 400, st: 1, v: p.hdDens, r: pr.hdDens },
      { g: 'W', k: 'rackRow', l: ['Racks per row', '每列机柜数'], u: '', min: 4, max: 40, st: 1, v: el.rackRow, r: (p.rackW || 600) >= 800 ? 16 : 20 },
      { g: 'P', k: 'hvKV', l: ['PLN connection voltage', 'PLN接入电压'], o: kvO, v: hv.kv, r: hv.rule },
      { g: 'P', k: 'pkPUE', l: ['Design-day PUE (peak cooling)', '设计日PUE（峰值制冷）'], u: '', min: 1.03, max: 2.5, st: 0.01, v: +R.eff.puePeak.toFixed(2), r: +R.eff.pueRule.toFixed(2) },
      { g: 'P', k: 'mdKVA', l: ['Maximum demand', '最大需量'], u: 'kVA', min: 10, max: 5000000, st: 10, v: Math.round(el.demandKVA), r: Math.round(el.demandRule) },
      { g: 'P', k: 'ikPCC', l: ['Fault level at the connection point', '接入点短路电流'], u: 'kA', min: 5, max: 80, st: 0.5, v: hv.pccIk, r: hv.pccRule },
      { g: 'P', k: 'htMVA', l: ['HV/MV transformer rating', '高压/中压主变容量'], o: kOpts(E.HT_STD, 'MVA'), v: hv.ht ? hv.ht.mva : 60, r: hv.ht ? hv.ht.rule : null, off: !hv.ht },
      { g: 'P', k: 'txKVA', l: ['MV/LV transformer rating', '中/低压变压器容量'], o: kOpts([315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150], 'kVA'), v: el.txSize, r: el.txRule },
      { g: 'P', k: 'txLoad', l: ['Transformer loading limit', '变压器负载率上限'], u: '%', min: 50, max: 100, st: 1, v: Math.round(el.txLoad * 100), r: K.TX_LOAD * 100 },
      { g: 'P', k: 'genKW', l: ['Generator rating (continuous)', '发电机容量（持续功率）'], o: kOpts([300, 500, 800, 1000, 1250, 1500, 2000, 2500, 3000, 3500], 'kWe'), v: el.genSize, r: el.genRule },
      { g: 'P', k: 'genV', l: ['Generator voltage', '发电机电压'], o: [['LV', ['400 V sets with ATS', '400 V机组+ATS']], ['MV', ['20 kV paralleled plant', '20 kV并机电站']]], v: el.genV, r: el.demandKW > 6000 ? 'MV' : 'LV' },
      { g: 'P', k: 'fuelH', l: ['Fuel autonomy', '燃油自持时间'], u: 'h', min: 4, max: 120, st: 1, v: p.fuelH, r: pr.fuelH },
      { g: 'P', k: 'upsKW', l: ['UPS system rating', 'UPS单系统容量'], o: kOpts([300, 500, 800, 1000, 1200, 1500, 1600], 'kW'), v: el.upsSize, r: el.upsRule },
      { g: 'P', k: 'battery', l: ['Battery chemistry', '电池类型'], o: [['LI', ['Li-ion LFP', '磷酸铁锂']], ['VRLA', ['VRLA', '阀控铅酸']]], v: p.battery, r: pr.battery },
      { g: 'P', k: 'upsMin', l: ['UPS autonomy', 'UPS后备时间'], u: 'min', min: 1, max: 30, st: 1, v: p.upsMin, r: pr.upsMin },
      { g: 'P', k: 'eco', l: ['UPS eco-mode', 'UPS节能模式'], o: yn, v: !!p.eco, r: pr.eco },
      { g: 'P', k: 'bessOn', l: ['Battery energy storage (BESS)', '电池储能（BESS）'], o: yn, v: !!p.bessOn, r: pr.bessOn },
      { g: 'P', k: 'bessSh', l: ['BESS power share of IT', '储能功率占IT比例'], u: '%', min: 1, max: 60, st: 1, v: el.bess ? Math.round(el.bess.mw / c.itMW * 100) : 10, off: !p.bessOn },
      { g: 'P', k: 'bessH', l: ['BESS duration', '储能时长'], u: 'h', min: 0.5, max: 6, st: 0.5, v: p.bessH, r: pr.bessH, off: !p.bessOn },
      { g: 'P', k: 'ahf', l: ['Active harmonic filters on drives', '驱动负荷有源滤波器'], o: yn, v: !!(R.gimp && R.gimp.ahf), r: R.gimp ? R.gimp.ahfAuto : null },
      { g: 'P', k: 'aiSwing', l: ['AI load swing (share of AI load)', 'AI负荷波动（占AI负荷）'], u: '%', min: 0, max: 100, st: 5, v: R.gimp ? R.gimp.swing : 0, r: R.gimp && R.gimp.aiKW > 0 ? 50 : 0, off: !(R.gimp && R.gimp.aiKW > 0) },
      { g: 'C', k: 'cooling', l: ['Cooling system', '制冷系统'], o: DB.cooling.map(function (q) { return [q.id, [q.en, q.zh]]; }), v: p.cooling, r: pr.cooling },
      { g: 'C', k: 'chKW', l: ['Chiller size', '冷机单机容量'], o: kOpts([500, 1000, 1407, 2461, 3517], 'kW'), v: me.chSize || 1407, r: me.chRule, off: !me.chN },
      { g: 'C', k: 'chwDT', l: ['Chilled-water ΔT', '冷冻水温差'], u: 'K', min: 4, max: 14, st: 0.5, v: me.chwDT || K.CHW_DT, r: K.CHW_DT, off: !me.chN },
      { g: 'C', k: 'chws', l: ['Chilled-water supply temperature', '冷冻水供水温度'], u: '°C', min: 6, max: 24, st: 0.5, v: me.cp ? me.cp.chws : E.COOLDEF.chws, r: E.COOLDEF.chws, off: !me.chN },
      { g: 'C', k: 'airDT', l: ['Server air temperature rise', '服务器空气温升'], u: 'K', min: 6, max: 20, st: 1, v: me.cp ? me.cp.airDT : E.COOLDEF.airDT, r: E.COOLDEF.airDT },
      { g: 'C', k: 'twAppr', l: ['Cooling-tower approach', '冷却塔逼近度'], u: 'K', min: 2, max: 8, st: 0.5, v: me.cp ? me.cp.twAppr : E.COOLDEF.twAppr, r: E.COOLDEF.twAppr, off: !me.ctN },
      { g: 'C', k: 'tesS', l: ['Thermal-storage ride-through', '蓄冷后备时间'], u: 's', min: 60, max: 1800, st: 30, v: me.tesS || 600, r: p.tier >= 4 ? 900 : (p.tier >= 3 ? 600 : 300), off: !me.chN },
      { g: 'C', k: 'cduKW', l: ['CDU capacity', 'CDU容量'], o: kOpts([400, 800, 1000, 1500, 2000, 2500], 'kW'), v: me.cduSize || 800, r: me.cduRule, off: !me.cduN },
      { g: 'C', k: 'liqSh', l: ['Share of high-density rack heat to liquid', '高密度机柜热量液冷占比'], u: '%', min: 50, max: 100, st: 1, v: Math.round((p.liqSh > 0 ? p.liqSh / 100 : (R.hdP.liq || 0.8)) * 100), r: Math.round((R.hdP.liq || 0.8) * 100), off: R.cool.tech !== 'DLC' || !c.hdR },
      { g: 'C', k: 'coc', l: ['Cooling-tower cycles of concentration', '冷却塔浓缩倍数'], u: '', min: 2, max: 10, st: 0.5, v: p.coc > 1 ? p.coc : 5, r: 5, off: !(me.ctN || R.cool.airTech === 'IEC' || R.cool.liquidKW > 0) },
      { g: 'B', k: 'floors', l: ['Storeys', '层数'], u: '', min: 1, max: 8, st: 1, v: p.floors, r: pr.floors },
      { g: 'B', k: 'raised', l: ['Raised floor', '架空地板'], o: [['YES', ['Yes', '是']], ['NO', ['No', '否']]], v: R.sp.raised ? 'YES' : 'NO', r: pr.raised },
      { g: 'B', k: 'kdb', l: ['Site coverage (KDB)', '建筑密度（KDB）'], u: '%', min: 20, max: 90, st: 5, v: p.kdb, r: pr.kdb },
      { g: '$', k: 'tariffIDR', l: ['PLN tariff', 'PLN电价'], u: 'Rp/kWh', min: 500, max: 3000, st: 0.01, v: p.tariffIDR, r: pr.tariffIDR },
      { g: '$', k: 'targetOcc', l: ['Average utilisation', '平均利用率'], u: '%', min: 10, max: 100, st: 5, v: p.targetOcc, r: pr.targetOcc },
      { g: '$', k: 'renewable', l: ['Renewable energy share', '可再生能源占比'], u: '%', min: 0, max: 100, st: 5, v: p.renewable, r: pr.renewable }
    ];
  }

  /* what each design parameter drives — listed in the knowledge documents */
  var DRIVES = {
    loc: ['PLN system and available voltages, tariff, climate (PUE, WUE, cooling choice), seismic and flood design, land, water and staff costs', 'PLN电网及可用电压、电价、气候（PUE、WUE、制冷选择）、抗震及防洪设计、地价、水价及人工成本'],
    itMW: ['Racks, rows and white space; every power-chain rating (connection → transformers → switchgear → generators → UPS); cooling plant; fire zones, cameras, BMS points; building, site, CAPEX, OPEX and programme', '机柜、列数及白区；整个供电链额定值（接入→变压器→开关设备→发电机→UPS）；制冷站；消防分区、摄像机、BMS点位；建筑、用地、投资、运营成本及工期'],
    tier: ['Redundancy of transformers, generators, UPS, chillers and terminals; fuel and UPS autonomy; thermal storage; electrical losses (PUE); CAPEX factor; security layers', '变压器、发电机、UPS、冷机及末端冗余；燃油及UPS后备时间；蓄冷；电气损耗（PUE）；投资系数；安防层级'],
    stdPlat: ['Standard rack design load, cabinet size and weight, liquid share, floor load', '标准机柜设计功率、机柜尺寸及重量、液冷占比、楼面荷载'],
    dens: ['Number of racks, average density, cooling choice, row length, busway and rack PDUs, white space', '机柜数量、平均密度、制冷选择、列长度、母线及机柜PDU、白区'],
    hdPlat: ['High-density rack load, liquid share, CDUs, power shelves vs rack PDUs, floor load', '高密度机柜功率、液冷占比、CDU、电源架或机柜PDU、楼面荷载'],
    hdShare: ['Rack mix, average and maximum density, liquid heat, cooling choice, CDUs', '机柜构成、平均及最大密度、液冷热量、制冷选择、CDU'],
    hdDens: ['High-density rows and busway rating, liquid heat, CDUs, floor load', '高密度列及母线额定、液冷热量、CDU、楼面荷载'],
    rackRow: ['Rows, busway rating (A + B), containment pods', '列数、母线额定（A+B）、通道封闭单元'],
    hvKV: ['Circuits, GIS rating and busbar scheme, interbus and HV/MV transformers, 20 kV switchgear, tariff class, connection cost, lead time, substation area', '进线回路、GIS额定及接线、联络及高/中压变压器、20 kV开关柜、电价类别、接入投资、工期、变电站用地'],
    pkPUE: ['Maximum demand → connection, transformers, generators, fuel', '最大需量→接入、变压器、发电机、燃油'],
    mdKVA: ['Connection voltage, transformers, switchgear, generators, fuel, tariff class', '接入电压、变压器、开关设备、发电机、燃油、电价类别'],
    htMVA: ['Number of HV/MV transformers, split winding, impedance, 20 kV boards and their current and fault rating, neutral earthing resistors', '高/中压主变台数、分裂绕组、阻抗、20 kV开关柜段数及其电流与短路额定、中性点接地电阻'],
    ikPCC: ['GIS short-time rating, 20 kV fault level and board rating, short-circuit ratio, harmonic limits and voltage steps (grid impact)', 'GIS短时耐受电流、20 kV短路电流及开关柜额定、短路比、谐波限值及电压阶跃（电网影响）'],
    ahf: ['Harmonic current at the connection point (Grid Code TDD), active filters in the BOQ', '接入点谐波电流（电网规范TDD）、清单中的有源滤波器'],
    aiSwing: ['Voltage steps at the connection point, BESS / power-smoothing need, grid impact risks', '接入点电压阶跃、储能/功率平滑需求、电网影响风险'],
    chws: ['Chiller COP and free-cooling hours → cooling energy → PUE, maximum demand and every power-chain rating', '冷机COP及自然冷却时数→制冷能耗→PUE、最大需量及整条供电链额定'],
    airDT: ['Airflow, fan power and the number of fan walls / CRAH units → PUE and maximum demand', '风量、风机功率及风墙/精密空调台数→PUE及最大需量'],
    twAppr: ['Condenser-water temperature → chiller COP and tower fan power → PUE and maximum demand', '冷却水温度→冷机COP及冷却塔风机功率→PUE及最大需量'],
    txKVA: ['Number of MV/LV transformers, impedance, LV main breaker and fault level, LV line-ups, meters, transformer losses (annual PUE)', '中/低压变压器台数、阻抗、低压主断路器及短路水平、低压配电柜组数、电表、变压器损耗（年均PUE）'],
    txLoad: ['Number of MV/LV transformers', '中/低压变压器台数'],
    genKW: ['Number of generators, paralleling, yard area', '发电机台数、并机、场地面积'],
    genV: ['20 kV generator incomers or 400 V ATS, MV switchgear panels', '20 kV发电机进线或400 V ATS、中压开关柜面数'],
    fuelH: ['Fuel volume, tanks, refuelling, water storage', '燃油量、储罐、补油、储水'],
    upsKW: ['Number of UPS systems, module loading and losses (PUE, maximum demand), battery energy, meters', 'UPS台数、模块负载率及损耗（PUE、最大需量）、电池能量、电表'],
    battery: ['UPS autonomy rule, battery room criteria (NFPA 855 / IEC 62485-2), electrical room area', 'UPS后备时间规则、电池室要求（NFPA 855/IEC 62485-2）、电气房间面积'],
    upsMin: ['Battery energy', '电池能量'],
    eco: ['Electrical losses → PUE → demand and energy cost', '电气损耗→PUE→需量及电费'],
    bessOn: ['BESS power and energy, containers, yard, CAPEX, peak-shaving saving', '储能功率及能量、集装箱、场地、投资、削峰收益'],
    bessSh: ['BESS power, containers, CAPEX', '储能功率、集装箱、投资'],
    bessH: ['BESS energy, containers, CAPEX', '储能能量、集装箱、投资'],
    cooling: ['PUE and design-day PUE → maximum demand and the whole power chain; chillers, towers, dry coolers, CDUs; WUE and water; mechanical rooms; CAPEX factor', 'PUE及设计日PUE→最大需量及整个供电链；冷机、冷却塔、干冷器、CDU；WUE及用水；暖通机房；投资系数'],
    chKW: ['Number of chillers, cooling towers and pumps', '冷机、冷却塔及水泵台数'],
    chwDT: ['Chilled-water flow, header size, thermal-storage volume', '冷冻水流量、主干管管径、蓄冷容积'],
    tesS: ['Thermal-storage volume and tanks', '蓄冷容积及储罐'],
    cduKW: ['Number of CDUs and standby units', 'CDU及备用台数'],
    liqSh: ['Liquid / air heat split → CDUs, dry coolers, chillers, PUE', '液冷/风冷热量分配→CDU、干冷器、冷机、PUE'],
    coc: ['Make-up and blowdown water, WUE, water storage and cost', '补水及排污量、WUE、储水及水费'],
    floors: ['Footprint, site area, lifts', '占地面积、用地、货梯'],
    raised: ['Clear height, floor construction, air distribution', '净高、楼面构造、气流组织'],
    kdb: ['Land needed', '所需用地'],
    tariffIDR: ['Energy cost, OPEX, IRR', '电费、运营成本、IRR'],
    targetOcc: ['Annual energy, water, OPEX, revenue', '年能耗、用水、运营成本、收入'],
    renewable: ['REC cost, Scope-2 emissions', '绿证成本、范围二排放']
  };

  function resolve(input, chg) { return P.resolve(applyChg(JSON.parse(JSON.stringify(input)), chg || {})); }
  g.DCConnect = { applyChg: applyChg, resolve: resolve, metrics: metrics, params: designParams, MG: MG, DG: DG, DRIVES: DRIVES, usd: usd };
})(typeof window !== 'undefined' ? window : globalThis);
