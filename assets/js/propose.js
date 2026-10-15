/* Data Center Project Assessment — proposal layer
 * resolve(input) proposes every design / commercial parameter from the owner's inputs
 * (location, type, capacity) using the reference databases and engineering rules, keeps any
 * value the owner has overridden (input.ov[key] = true), runs the engine and returns
 * { p, prop, why, matrix, tierStd, R }. Reasons are [en, zh] pairs. */
(function (g) {
  'use strict';
  var DB = g.DCDB, E = g.DCEngine, F = E.fmt;
  function find(arr, id) { return E.find(arr, id); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  var AUTO = ['crit', 'stdPlat', 'hdPlat', 'hdShare', 'dens', 'hdDens', 'cabinet', 'rackW', 'rackD', 'rackU', 'phases', 'phaseInterval', 'floors', 'raised', 'kdb',
              'seismic', 'flood', 'waterScarce', 'tier', 'fuelH', 'upsMin', 'battery', 'eco', 'bessOn', 'bessMW', 'bessH', 'cooling', 'targetPUE', 'renewable',
              'revModel', 'price', 'targetOcc', 'rampYears', 'tariffIDR', 'landPrice', 'waterPrice', 'capexOverride', 'contingency', 'staffCost', 'wacc', 'tax',
              'life', 'exitMult', 'markup', 'includeIT', 'itCostKW', 'prefab'];
  var CRIT = { mission: ['Mission-critical (finance, government, healthcare)', '关键任务（金融、政府、医疗）'], business: ['Business-critical (cloud, colocation, enterprise)', '业务关键（云、托管、企业）'],
               batch: ['Interruptible / batch (AI training, HPC, dev-test)', '可中断/批处理（AI训练、HPC、开发测试）'] };
  var TYPE_PRICE = { COLO: 165, WHOLE: 135, HYPER: 125, AI: 185, EDGE: 190, MOD: 150, ENT: 165, GOV: 165 };

  function resolve(input) {
    var p = Object.assign(E.defaults(), JSON.parse(JSON.stringify(input || {})));
    var ov = p.ov || {}; p.ov = ov;
    var prop = {}, why = {};
    function set(k, v, en, zh) { prop[k] = v; why[k] = [en, zh]; if (!ov[k] || p[k] === undefined || p[k] === null || p[k] === '') p[k] = v; }
    var L = E.loc(p.loc); p.loc = L.id;
    var grid = DB.idGrids[L.grid] || DB.idGrids.JAMALI;
    var type = find(DB.dcTypes, p.type) || DB.dcTypes[1];
    var mw0 = p.sizing === 'racks' ? Math.max(0.01, (+p.racks || 100) * 0.01) : Math.max(0.01, +p.itMW || 1);

    /* ---------------------------------------------- A. location-derived */
    set('seismic', L.seis, 'Planning hazard for ' + L.en + ' per the SNI 1726:2019 hazard maps — confirm with a site-specific seismic study.', '依据SNI 1726:2019地震区划图对' + L.zh + '的规划级判断——需场地专项地震研究确认。');
    set('flood', L.flood, 'Flood exposure of ' + L.en + ' from regional records — check BNPB/BMKG flood maps and site levels.', '根据区域记录判断' + L.zh + '的洪水风险——需核查BNPB/BMKG洪水图及场地标高。');
    set('waterScarce', !!L.scarce, L.scarce ? 'Raw-water supply at ' + L.en + ' is constrained — favour water-efficient cooling.' : 'No significant water constraint recorded for ' + L.en + '.', L.scarce ? L.zh + '原水供应受限——优先节水型制冷。' : L.zh + '无明显水资源制约记录。');
    set('landPrice', L.land, 'Indicative DC-suitable industrial land at ' + L.en + ' (2026); replace with a broker quote.', L.zh + '适合数据中心的工业用地参考价（2026）；请以中介报价替换。');
    set('waterPrice', L.water, 'Indicative PDAM / industrial-estate water tariff for ' + L.provEn + '.', L.provZh + 'PDAM/工业园区水价参考值。');
    var staff = Math.max(9000, Math.round(18000 * L.wage / 500) * 500);
    set('staffCost', staff, 'Blended loaded cost of 24/7 O&M staff = USD 18,000 × wage index ' + L.wage + ' (UMP 2026 ' + L.provEn + ' Rp' + F(L.ump) + '/month' + (L.umpApprox ? ', approx.' : '') + ').',
        '7×24运维人员综合成本=18,000美元×工资指数' + L.wage + '（' + L.provZh + ' 2026年UMP为每月' + F(L.ump) + '印尼盾' + (L.umpApprox ? '，近似值' : '') + '）。');

    /* ---------------------------------------------- B. criticality, IT platforms */
    var critP = p.type === 'GOV' ? 'mission' : (p.type === 'AI' ? 'batch' : 'business');
    set('crit', critP, 'Typical workload criticality for ' + type.en + '.', type.zh + '的典型业务关键程度。');
    var mix = DB.typeMix[p.type] || DB.typeMix.COLO;
    var hdId = mix.hd, share = mix.hdShare;
    if (p.type === 'AI' && mw0 < 5) hdId = 'NV-B300L';
    if (p.type === 'COLO' && mw0 >= 20) share = 15;
    if (p.type === 'HYPER' && mw0 >= 200) share = 20;
    set('stdPlat', mix.std, mix.why[0], mix.why[1]);
    set('hdPlat', hdId, mix.why[0] + (hdId === 'NV-B300L' ? ' Below 5 MW, liquid-cooled HGX B300 racks are more practical than full NVL72 rack-scale systems.' : ''),
        mix.why[1] + (hdId === 'NV-B300L' ? '5 MW以下采用液冷HGX B300机柜较整机架NVL72更实际。' : ''));
    set('hdShare', share, 'Share of high-density racks typical for the ' + type.en + ' type (reference practice 2025–2026).', type.zh + '高密度机柜占比（2025–2026参考实践）。');
    var sp = E.plat(p.stdPlat), hp = E.plat(p.hdPlat);
    set('dens', sp.kw, sp.en + ': design ' + sp.kw + ' kW/rack (peak ' + sp.kwPeak + ' kW). ' + sp.note[0], sp.zh + '：设计' + sp.kw + ' kW/柜（峰值' + sp.kwPeak + ' kW）。' + sp.note[1]);
    set('hdDens', hp.kw, hp.en + ': design ' + hp.kw + ' kW/rack (peak ' + hp.kwPeak + ' kW). ' + hp.note[0], hp.zh + '：设计' + hp.kw + ' kW/柜（峰值' + hp.kwPeak + ' kW）。' + hp.note[1]);
    var cabId = sp.id === 'OCP-ORV3' ? 'INTEGRATED' : 'VERTIV-VR';
    set('cabinet', cabId, cabId === 'INTEGRATED' ? 'OCP racks arrive integrated from the ODM.' : 'Static rating 1,360 kg covers ' + sp.en + ' (≈ ' + sp.kg + ' kg loaded); 600 mm for servers, 800 mm for network rows.',
        cabId === 'INTEGRATED' ? 'OCP机柜由ODM整柜集成供货。' : '1,360 kg静载满足' + sp.zh + '（满载约' + sp.kg + ' kg）；服务器用600 mm，网络列用800 mm。');
    var cab = find(DB.cabinets, p.cabinet) || DB.cabinets[1];
    var wOpt = cab.w.indexOf(sp.w) >= 0 ? sp.w : cab.w[0];
    var dOpt = cab.d.filter(function (d) { return d >= sp.d; })[0] || cab.d[cab.d.length - 1];
    var uOpt = cab.u.indexOf(sp.u) >= 0 ? sp.u : cab.u[cab.u.length - 1];
    set('rackW', wOpt, 'Width from ' + cab.brand + ' range ' + cab.w.join('/') + ' mm matching ' + sp.en + '.', '按' + cab.brand + '系列' + cab.w.join('/') + ' mm匹配' + sp.zh + '。');
    set('rackD', dOpt, 'Depth ≥ platform requirement (' + sp.d + ' mm) for modern servers and cable management.', '深度≥平台要求（' + sp.d + ' mm），满足现代服务器及理线。');
    set('rackU', uOpt, 'Height ' + uOpt + 'U — maximises IT per rack within lift / door clearances (≈ 2.3–2.5 m).', '高度' + uOpt + 'U——在货梯/门洞净高（约2.3–2.5 m）限制内最大化每柜IT容量。');
    var cap = E.capacity(p);

    /* ---------------------------------------------- C. building & phasing */
    var mw = cap.itMW;
    var ph = mw <= 3 ? 1 : (mw <= 20 ? 2 : (mw <= 60 ? 3 : (mw <= 200 ? 4 : Math.min(10, Math.ceil(mw / 80)))));
    set('phases', ph, 'Phasing matched to absorption: ≈ ' + F(mw / ph, 1) + ' MW per phase limits stranded capacity.', '按需求消化分期：每期约' + F(mw / ph, 1) + ' MW，减少搁浅容量。');
    set('phaseInterval', (p.type === 'AI' || p.type === 'HYPER') ? 1 : 2, 'Typical build cadence for this market segment.', '该细分市场典型建设节奏。');
    var fl = L.land >= 1000 ? 5 : (p.type === 'AI' ? (mw >= 10 ? 1 : 2) : (p.type === 'EDGE' || p.type === 'MOD' ? 1 : (p.type === 'COLO' ? 3 : 2)));
    set('floors', fl, L.land >= 1000 ? 'High land cost in ' + L.en + ' favours a multi-storey building.' : (p.type === 'AI' ? 'Heavy liquid-cooled racks (≈ 1.5 t) and large plant favour single-storey halls.' : 'Typical massing for this facility type.'),
        L.land >= 1000 ? L.zh + '地价高，宜采用多层建筑。' : (p.type === 'AI' ? '重型液冷机柜（约1.5吨）及大型设备宜采用单层机房。' : '该设施类型的典型体量。'));
    var liquidNeeded = cap.hdR > 0 && hp.cool === 'DLC';
    set('raised', (cap.avgDens <= 10 && !liquidNeeded && mw < 30) ? 'YES' : 'NO', (cap.avgDens <= 10 && !liquidNeeded) ? 'Low density: raised floor gives flexible under-floor air and cabling.' : 'High density / liquid: slab-on-grade with overhead busway, trays and piping (heavier racks, simpler liquid routing).',
        (cap.avgDens <= 10 && !liquidNeeded) ? '低密度：架空地板便于地板下送风及布线。' : '高密度/液冷：无架空地板，母线、桥架及管道上走线（承载更重、液冷管路更简单）。');
    set('kdb', 60, 'Typical building coverage (KDB) in Indonesian industrial estates; confirm in the KKPR / estate rules.', '印尼工业园区典型建筑密度（KDB）；以KKPR/园区规定为准。');

    set('renewable', ({ HYPER: 100, AI: 100, WHOLE: 100, COLO: 100 })[p.type] || 50,
        'PLN RECs cost only ≈ Rp35,000/MWh (≈ USD 2/MWh), so matching 100% of consumption is cheap; hyperscale and AI tenants require it. Combine with rooftop solar (PLTS Atap) and PPAs where RUPTL allows.',
        'PLN绿证仅约每MWh 35,000印尼盾（约2美元/MWh），100%匹配用电成本很低；超大规模及AI租户普遍要求。可结合屋顶光伏（PLTS Atap）及RUPTL允许的购电协议。');
    /* ---------------------------------------------- D. resilience & power */
    var t = p.crit === 'mission' ? (mw >= 2 ? 4 : 3) : (p.crit === 'batch' ? 3 : (mw < 0.5 ? 2 : 3));
    var tWhy = {
      4: ['Mission-critical workload ≥ 2 MW: fault tolerance (Tier IV ≈ SNI 8799 Strata IV, 2N with automatic failover) — the national data center (PDN Cikarang) precedent.', '≥2 MW关键任务业务：容错（Tier IV≈SNI 8799 Strata IV，2N自动切换）——参照国家数据中心（PDN芝加朗）。'],
      3: ['Concurrent maintainability (Tier III ≈ SNI 8799 Strata III, TIA-942 Rated-3) is the Indonesian market standard (Uptime-certified Tier III sites in Jakarta and Batam) and the recommended minimum for government data.', '可同时维护（Tier III≈SNI 8799 Strata III、TIA-942 Rated-3）是印尼市场标准（雅加达及巴淡的Uptime Tier III认证设施），也是政府数据的建议最低等级。'],
      2: ['Small site (< 0.5 MW): redundant components (Tier II) with resilience provided across sites is cost-effective.', '小型站点（<0.5 MW）：组件冗余（Tier II）并通过多站点实现韧性更经济。']
    }[t] || ['', ''];
    if (p.crit === 'batch') { tWhy = ['AI training / batch: Tier III-class facility protects a very large IT investment; the UPS scope may be reduced to network, storage and cooling (training jobs checkpoint and restart).', 'AI训练/批处理：Tier III级设施保护巨额IT投资；UPS范围可缩减至网络、存储及制冷（训练任务可断点续训）。']; }
    set('tier', t, tWhy[0], tWhy[1]);
    var fuel = { 1: 12, 2: 24, 3: 24, 4: 48 }[p.tier] + (grid.rel === 'med' ? 24 : (grid.rel === 'low' ? 48 : 0));
    set('fuelH', Math.min(96, fuel), 'Uptime requires ≥ 12 h at N load; TIA-942 references 72 h (Rated-3) / 96 h (Rated-4). Proposed for ' + grid.en + ' reliability and fuel logistics.',
        'Uptime要求N负荷下≥12 h；TIA-942参考72 h（Rated-3）/96 h（Rated-4）。按' + grid.zh + '可靠性及燃油物流提出。');
    set('battery', (mw >= 0.5 || p.tier >= 3) ? 'LI' : 'VRLA', (mw >= 0.5 || p.tier >= 3) ? 'LFP lithium-ion: ≈ 1/3 footprint & weight, 12–15 yr life, built-in BMS — standard for new Indonesian DCs; design to NFPA 855 / UL 9540A.' : 'Small site: VRLA lowest first cost; consider LFP for life-cycle value.',
        (mw >= 0.5 || p.tier >= 3) ? '磷酸铁锂：占地及重量约1/3、寿命12–15年、内置BMS——印尼新建数据中心标配；按NFPA 855/UL 9540A设计。' : '小型站点：铅酸初投资最低；从全寿命考虑可选磷酸铁锂。');
    var ups = p.battery === 'LI' ? (p.tier === 4 ? 10 : 5) : (p.tier === 4 ? 15 : 10);
    if (p.type === 'AI') ups = 5;
    set('upsMin', ups, 'Generators start and accept load in 10–15 s; ' + ups + ' min covers retries and transfer with ' + (p.battery === 'LI' ? 'Li-ion' : 'VRLA') + ' at end-of-life.',
        '发电机10–15 s内启动接带负荷；' + ups + ' min覆盖重试及切换（按' + (p.battery === 'LI' ? '锂电' : '铅酸') + '寿命末期）。');
    var eco = p.type === 'HYPER' || p.type === 'AI' || p.type === 'WHOLE';
    set('eco', eco, eco ? 'Hyperscale practice: eco-mode / energy-saver UPS (≈ 99%) cuts electrical losses.' : 'Double-conversion for maximum isolation in multi-tenant / enterprise sites.', eco ? '超大规模惯例：UPS节能模式（约99%）降低电气损耗。' : '多租户/企业站点采用双变换以获得最大隔离。');
    var bessOn = false, bessMW = 0, bessH = 2, bWhy = ['BESS not essential at this scale and grid; optional for peak shaving.', '在此规模及电网条件下储能非必需；可选用于削峰。'];
    if (p.type === 'AI') { bessOn = true; bessMW = Math.max(1, Math.round(0.15 * mw * 10) / 10); bessH = 1; bWhy = ['AI factory: BESS ≈ 15% of IT MW for 1 h buffers synchronous GPU load swings and protects the PLN connection (xAI Colossus precedent).', 'AI算力中心：按IT MW约15%、1 h配置储能，缓冲GPU同步负荷波动并保护PLN接入（参照xAI Colossus）。']; }
    else if (grid.rel !== 'high' && mw >= 5) { bessOn = true; bessMW = Math.round(0.1 * mw * 10) / 10; bessH = 2; bWhy = ['Weaker regional grid: BESS ≈ 10% of IT MW for 2 h supports voltage/frequency events and reduces generator starts.', '区域电网较弱：按IT MW约10%、2 h配置储能，支撑电压/频率事件并减少发电机启动。']; }
    else if (+p.renewable >= 30 && (p.type === 'HYPER' || p.type === 'WHOLE')) { bessOn = true; bessMW = Math.round(0.1 * mw * 10) / 10; bessH = 2; bWhy = ['Solar firming and WBP peak shaving with ≈ 10% of IT MW for 2 h.', '按IT MW约10%、2 h配置储能，用于光伏稳定及高峰削峰。']; }
    set('bessOn', bessOn, bWhy[0], bWhy[1]);
    set('bessMW', bessMW || Math.max(0.5, Math.round(0.1 * mw * 10) / 10), 'BESS power rating (MW).', '储能功率（MW）。');
    set('bessH', bessH, 'Duration at rated power (h); LFP containers ≈ 5 MWh each.', '额定功率持续时间（h）；每个LFP集装箱约5 MWh。');

    /* ---------------------------------------------- E. cooling decision matrix */
    var matrix = E.coolingMatrix(p);
    var feas = matrix.filter(function (c) { return c.feasible; });
    var minPue = Math.min.apply(null, (feas.length ? feas : matrix).map(function (c) { return c.pue; }));
    var W = { eff: 28, water: p.waterScarce ? 25 : 12, scale: 18, capex: 14, mat: 14, it: 14 };
    var anyDLC = sp.cool === 'DLC' || (cap.hdR > 0 && hp.cool === 'DLC');
    function itScore(id) { if (id === 'DLC') return anyDLC ? 5 : 0; if (id === 'IMM') return anyDLC ? 1.5 : 0; return liquidNeeded ? 0 : 5; }
    var MAT = { DX: 5, ACCH: 5, WCCH: 5, IEC: 2.5, DLC: 3.5, IMM: 2 };
    function scaleScore(id) {
      if (id === 'DX') return mw <= 0.5 ? 5 : (mw <= 1 ? 4 : (mw <= 2 ? 2 : 0.5));
      if (id === 'ACCH') return mw <= 0.5 ? 3 : (mw <= 5 ? 5 : (mw <= 20 ? 4 : (mw <= 50 ? 3 : 2)));
      if (id === 'WCCH') return mw <= 1 ? 1 : (mw <= 5 ? 3 : 5);
      if (id === 'IEC') return mw <= 1 ? 1 : (mw <= 2 ? 3 : 4);
      if (id === 'DLC') return liquidNeeded ? 5 : (mw >= 5 ? 3.5 : 2.5);
      return mw <= 20 ? 3 : 2;
    }
    matrix.forEach(function (c) {
      var s = { eff: clamp(5 - (c.pue - minPue) / 0.06, 0, 5), water: clamp(5 - c.wue * 2.2, 0, 5), scale: scaleScore(c.id), capex: clamp(5 - (c.capexF - 0.95) * 25, 0, 5), mat: MAT[c.id], it: itScore(c.id) };
      c.s = s;
      if (s.it === 0) c.feasible = false;
      c.score = c.feasible ? (s.eff * W.eff + s.water * W.water + s.scale * W.scale + s.capex * W.capex + s.mat * W.mat + s.it * W.it) / (W.eff + W.water + W.scale + W.capex + W.mat + W.it) : 0;
    });
    matrix.sort(function (a, b) { return b.score - a.score; });
    var best = matrix[0], second = matrix.filter(function (c) { return c.id !== best.id && c.feasible; })[0];
    var dx = find(matrix, 'DX'), crah = find(matrix, best.airTech === 'ACCH' ? 'ACCH' : 'WCCH');
    var cEn = 'For ' + F(mw, 1) + ' MW at ' + F(cap.avgDens, 1) + ' kW/rack average (max ' + F(cap.maxDens, 0) + ' kW) in ' + L.en + ' (design ' + L.db + ' °C DB / ' + L.wb + ' °C WB), ' + best.en + ' scores highest (' + F(best.score, 2) + '/5): estimated PUE ' + F(best.pue, 2) + ', WUE ' + F(best.wue, 2) + ' L/kWh.';
    var cZh = '对于' + L.zh + '（设计干球' + L.db + ' °C/湿球' + L.wb + ' °C）的' + F(mw, 1) + ' MW、平均' + F(cap.avgDens, 1) + ' kW/柜（最大' + F(cap.maxDens, 0) + ' kW）项目，' + best.zh + '得分最高（' + F(best.score, 2) + '/5）：预计PUE ' + F(best.pue, 2) + '，WUE ' + F(best.wue, 2) + ' L/kWh。';
    if (second) {
      var d = (second.energyCost - best.energyCost);
      cEn += ' Next best: ' + second.en + ' (PUE ' + F(second.pue, 2) + (d > 0 ? ', ≈ USD ' + F(d / 1e6, 2) + ' M/yr more energy' : '') + ').';
      cZh += '次优：' + second.zh + '（PUE ' + F(second.pue, 2) + (d > 0 ? '，每年电费多约' + F(d / 1e6, 2) + '百万美元' : '') + '）。';
    }
    if (dx && best.id !== 'DX' && mw > 0.6) {
      cEn += ' DX CRAC units would need ≈ ' + F(dx.units.n) + ' × ' + dx.units.size + ' kW self-contained units with roof condensers and long refrigerant runs (PUE ≈ ' + F(dx.pue, 2) + ') — practical only for small rooms (< ≈ 1 MW); a central chilled-water plant feeding CRAH units / fan walls (' + F(crah.units.n) + ' × ' + crah.units.size + ' kW) is far more efficient and maintainable at this scale.';
      cZh += '若采用直膨精密空调（CRAC），约需' + F(dx.units.n) + '台' + dx.units.size + ' kW一体机，配屋面冷凝器及长冷媒管（PUE约' + F(dx.pue, 2) + '）——仅适合小型机房（<约1 MW）；此规模下由中央冷冻水站供冷的精密空调/风墙（' + F(crah.units.n) + '台×' + crah.units.size + ' kW）效率更高、更易维护。';
    }
    if (best.id === 'DX') { cEn += ' At this small scale DX CRAC units avoid the cost and complexity of a chilled-water plant.'; cZh += '在此小规模下，直膨精密空调可避免冷冻水站的成本与复杂度。'; }
    if (cap.hdR > 0 && hp.cool === 'RDHX' && !liquidNeeded) { cEn += ' The ' + F(cap.hd, 0) + ' kW high-density racks (' + hp.en + ') are handled with rear-door heat exchangers on the chilled-water system.'; cZh += F(cap.hd, 0) + ' kW高密度机柜（' + hp.zh + '）采用接入冷冻水系统的背板换热器。'; }
    if (liquidNeeded) { cEn += ' Racks above ≈ 25–40 kW cannot be air-cooled efficiently; ' + hp.en + ' requires direct-to-chip liquid cooling (≈ ' + F((hp.liq || 0.8) * 100, 0) + '% of heat to liquid) with residual air handled by ' + (best.airTech === 'WCCH' ? 'water-cooled chillers + CRAH/fan walls' : 'air-cooled chillers + CRAH') + '.'; cZh += '约25–40 kW以上机柜无法高效风冷；' + hp.zh + '需冷板液冷（约' + F((hp.liq || 0.8) * 100, 0) + '%热量由液体带走），余热由' + (best.airTech === 'WCCH' ? '水冷冷机+精密空调/风墙' : '风冷冷机+精密空调') + '处理。'; }
    if (L.cls === 'TROP') { cEn += ' Lowland tropical wet-bulb (≈ ' + L.wb + ' °C) leaves almost no free-cooling hours, so evaporative/indirect evaporative systems lose their advantage.'; cZh += '低地热带湿球温度（约' + L.wb + ' °C）几乎没有自然冷却时数，蒸发/间接蒸发冷却失去优势。'; }
    if (p.waterScarce) { cEn += ' Water constraints at the site increase the weight of water use in the decision.'; cZh += '场地水资源受限，提高了用水指标在决策中的权重。'; }
    set('cooling', best.id, cEn, cZh);

    /* ---------------------------------------------- F. run engine, then efficiency & commercial */
    var lease = type.rev === 'lease';
    set('revModel', lease ? 'lease' : 'none', lease ? 'Lease business model for ' + type.en + '.' : 'Owner-occupied: total cost of ownership compared with leasing.', lease ? type.zh + '采用租赁模式。' : '自用：与租赁比较总拥有成本。');
    var hubF = L.id === 'KR-BTM' ? 0.95 : (L.hub === 'major' ? 1.0 : (L.hub === 'emerging' ? 0.9 : 0.85));
    set('price', Math.round((TYPE_PRICE[p.type] || 160) * hubF), 'Indicative monthly lease (USD per kW IT, excl. power) for ' + type.en + ' in ' + (L.hub === 'major' ? 'a major hub' : 'an emerging market') + '; calibrate with market data.',
        type.zh + '在' + (L.hub === 'major' ? '主要枢纽' : '新兴市场') + '的参考月租（美元/kW IT，不含电费）；请以市场数据校准。');
    set('targetOcc', p.type === 'COLO' ? 85 : 90, 'Stabilised utilisation typical for the segment.', '该细分市场典型稳定期利用率。');
    set('rampYears', ({ HYPER: 2, WHOLE: 2, AI: 2, COLO: 5, EDGE: 3, MOD: 3, ENT: 3, GOV: 3 })[p.type] || 4, 'Absorption period: pre-leased hyperscale/AI ≈ 2 years; retail colocation ≈ 4–5 years.', '消化期：预租超大规模/AI约2年；零售托管约4–5年。');
    set('capexOverride', 0, 'Regional benchmark USD ' + F(E.ID_CAPEX * L.capexF, 2) + ' M/MW (Greater Jakarta USD ' + E.ID_CAPEX + ' M/MW × logistics factor ' + L.capexF + ') for Tier III, before Tier, scale and cooling factors.',
        '地区基准' + F(E.ID_CAPEX * L.capexF, 2) + '百万美元/MW（大雅加达' + E.ID_CAPEX + '×物流系数' + L.capexF + '），Tier III，未计等级、规模及制冷系数。');
    set('contingency', 15, 'Feasibility-stage estimate (≈ AACE Class 4): 15% contingency.', '可研阶段估算（约AACE 4级）：不可预见费15%。');
    set('wacc', lease ? 10 : 8, lease ? 'Indicative USD project WACC for Indonesian DC developments.' : 'Owner / public-sector discount rate.', lease ? '印尼数据中心项目参考美元WACC。' : '业主/公共部门折现率。');
    set('tax', 22, 'Indonesian corporate income tax (PPh Badan) 22%; KEK / tax-holiday incentives may reduce it.', '印尼企业所得税22%；经济特区/免税期政策可降低。');
    set('life', 20, 'Facility analysis period (MEP renewal beyond year 15–20).', '设施分析期（15–20年后机电更新）。');
    set('exitMult', lease ? ((p.type === 'HYPER' || p.type === 'WHOLE' || p.type === 'AI') ? 12 : 10) : 0, 'Conservative exit value vs. regional DC transactions (often 15–25× EBITDA).', '相对区域数据中心交易（常为15–25倍EBITDA）的保守终值。');
    set('markup', 0, 'Electricity is passed through at cost (resale requires an IUPTL licence).', '电费按成本转嫁（转售电力需IUPTL许可）。');
    set('includeIT', false, 'Facility-only CAPEX; IT hardware is normally tenant- or separately-funded.', '仅计设施投资；IT硬件通常由租户或单独出资。');
    var itc = Math.round(((cap.stdR * cap.sd * (sp.cat === 'AI' ? 28000 : 12000)) + (cap.hdR * cap.hd * (hp.cat === 'AI' ? 28000 : 12000))) / cap.itKW / 500) * 500;
    set('itCostKW', itc, 'Weighted IT hardware cost (≈ USD 28k/kW AI GPU systems, ≈ 12k/kW general servers).', '加权IT硬件成本（AI GPU系统约2.8万美元/kW，通用服务器约1.2万美元/kW）。');
    set('prefab', p.type === 'EDGE' || p.type === 'MOD' || (p.type === 'AI' && mw >= 50), 'Prefabricated power skids / modules shorten schedules for this type and scale.', '预制电力撬块/模块可缩短该类型及规模项目的工期。');

    var R = E.assess(p);
    var vt = R.el.vclass === 'TT' ? DB.idTariffs[2] : DB.idTariffs[1];
    set('tariffIDR', vt.eff, 'PLN ' + vt.en + ': Rp' + F(vt.lwbp, 2) + '/kWh' + (vt.k > 1 ? ' LWBP, blended with WBP (K ≈ ' + vt.k + ') ≈ Rp' + F(vt.eff, 1) + '/kWh for a 24/7 load' : '') + ' (Q4 2026). Enter your contracted tariff.',
        'PLN ' + vt.zh + '：' + F(vt.lwbp, 2) + '印尼盾/kWh' + (vt.k > 1 ? '（低谷），与高峰（K≈' + vt.k + '）加权后24/7负荷约' + F(vt.eff, 1) + '印尼盾/kWh' : '') + '（2026年第四季度）。请输入合同电价。');
    var tp = Math.ceil(R.eff.pue * 20 - 1e-9) / 20;
    set('targetPUE', tp, 'Design target = estimated annual PUE ' + F(R.eff.pue, 2) + ' rounded up to 0.05. Benchmarks: Uptime global average ≈ 1.5; tropical air-cooled new builds 1.35–1.45; liquid-cooled AI 1.15–1.25; China GB 40879 grade 2 ≤ 1.30.',
        '设计目标=预计年均PUE ' + F(R.eff.pue, 2) + '向上取整至0.05。基准：Uptime全球平均约1.5；热带风冷新建1.35–1.45；液冷AI 1.15–1.25；中国GB 40879二级≤1.30。');
    R = E.assess(p);

    /* ---------------------------------------------- standards view of the resilience choice */
    var tr = DB.tiers[p.tier - 1];
    var tierStd = [
      ['Uptime Institute', tr.en, p.tier >= 3 ? 'Fuel ≥ 12 h at N load; continuous-rated generators; ' + (p.tier === 4 ? 'fault tolerance, compartmentalisation, continuous cooling.' : 'concurrent maintainability of every component and path.') : 'Fuel ≥ 12 h at N load.',
       p.tier >= 3 ? '燃油≥12 h（N负荷）；持续功率发电机；' + (p.tier === 4 ? '容错、分区隔离、连续制冷。' : '每个组件及路径可同时维护。') : '燃油≥12 h（N负荷）。'],
      ['ANSI/TIA-942-C', tr.tia, p.tier >= 3 ? 'Rated-' + p.tier + ': fuel guidance ' + (p.tier === 4 ? '96' : '72') + ' h; diverse entrance rooms & pathways.' : 'Single entrance room permitted.', p.tier >= 3 ? 'Rated-' + p.tier + '：燃油参考' + (p.tier === 4 ? '96' : '72') + ' h；分离进线间及路由。' : '允许单一进线间。'],
      ['SNI 8799 (Indonesia)', tr.sni, p.tier === 4 ? 'Dedicated facility, full 2N redundancy with automatic failover.' : (p.tier === 3 ? 'Dedicated building, N+1 core systems (recommended minimum for government data).' : 'Multi-use building permitted.'),
       p.tier === 4 ? '专用设施，完全2N冗余并自动切换。' : (p.tier === 3 ? '专用建筑，核心系统N+1（政府数据建议最低等级）。' : '允许多功能建筑。')],
      ['GB 50174 (China)', tr.gb, p.tier >= 3 ? 'Class A: generators run continuously without time limit; dual utility supply.' : 'Class B: generators may be rated for 500 h/year.', p.tier >= 3 ? 'A级：发电机组连续不限时运行；双重电源。' : 'B级：发电机组可按500 h/年选择。'],
      ['EN 50600 / ISO/IEC 22237', tr.en50600, 'Availability class ' + p.tier + '.', '可用性等级' + p.tier + '。']
    ];
    return { p: p, prop: prop, why: why, matrix: matrix, tierStd: tierStd, R: R, crit: CRIT };
  }

  g.DCPropose = { resolve: resolve, AUTO: AUTO, CRIT: CRIT };
})(typeof window !== 'undefined' ? window : globalThis);
