/* Project Proposal Report — one document model, three outputs:
 *   html (print → PDF), docx (docx.js, lazy-loaded), xlsx (ExcelJS, lazy-loaded).
 * build(x, opt) where x = DCPropose.resolve(...) and opt = { money(usd), cur, lang } */
(function (g) {
  'use strict';
  var DB = g.DCDB, E = g.DCEngine, F = E.fmt;
  function T(en, zh) { return g.Lt(en, zh); }
  function TP(pair) { return pair ? T(pair[0], pair[1]) : ''; }
  function esc(s) { return g.esc(s); }
  function find(arr, id) { return E.find(arr, id); }

  /* ------------------------------------------------------------ chart SVGs (standalone) */
  var FONT = "font-family=\"Segoe UI, 'Microsoft YaHei', Arial, sans-serif\"";
  function svgBars(items, opt) {
    opt = opt || {};
    var W = 760, lw = 290, rowH = 30, H = items.length * rowH + 20, mx = Math.max.apply(null, items.map(function (i) { return i.v; })) || 1, s = '';
    items.forEach(function (it, i) {
      var y = i * rowH + 8, w = (W - lw - 110) * it.v / mx;
      s += '<text x="' + (lw - 10) + '" y="' + (y + 15) + '" text-anchor="end" font-size="12" fill="#161936">' + esc(it.label) + '</text>';
      s += '<rect x="' + lw + '" y="' + y + '" width="' + Math.max(w, 1) + '" height="20" rx="4" fill="' + (it.color || '#3f3cbb') + '"/>';
      s += '<text x="' + (lw + w + 8) + '" y="' + (y + 15) + '" font-size="11.5" font-weight="700" fill="#161936">' + esc(it.text) + '</text>';
    });
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" ' + FONT + '>' + s + '</svg>';
  }
  function svgWrap(svg) { /* make Charts.* output standalone (namespace + font) */
    return svg.replace('<svg class="chart"', '<svg xmlns="http://www.w3.org/2000/svg" ' + FONT).replace(/style="[^"]*"/, '');
  }

  /* ------------------------------------------------------------ document model */
  function build(x, opt) {
    var p = x.p, R = x.R, L = R.L, c = R.cap, el = R.el, me = R.me, sp = R.sp, cx = R.capex, op = R.opex, f = R.fin;
    var money = opt.money, cur = opt.cur;
    var B = [];
    function h1(t) { B.push({ t: 'h1', text: t }); }
    function h2(t) { B.push({ t: 'h2', text: t }); }
    function para(t) { B.push({ t: 'p', text: t }); }
    function bullets(a) { B.push({ t: 'bullets', items: a }); }
    function table(head, rows, widths, num) { B.push({ t: 'table', head: head, rows: rows, widths: widths, num: num || [] }); }
    function kv(rows) { B.push({ t: 'kv', rows: rows }); }
    function chart(svg, w, h, cap) { B.push({ t: 'chart', svg: svg, w: w, h: h, cap: cap }); }
    var tierName = c.tier.en.split(' — ')[0];
    var hdTxt = c.hdR ? T(R.hdP.en, R.hdP.zh) : '–';
    var ovKeys = Object.keys(p.ov || {}).filter(function (k) { return p.ov[k]; });

    /* cover */
    B.push({ t: 'cover', title: T('DATA CENTER PROJECT PROPOSAL', '数据中心项目建议书'), sub: T('Planning & Feasibility Assessment Report', '规划与可行性评估报告'), name: p.name,
      meta: [[T('Location', '地点'), T(L.en + ', ' + L.provEn + ', Indonesia', L.zh + '，' + L.provZh + '，印度尼西亚')], [T('Facility type', '设施类型'), T(c.type.en, c.type.zh)],
             [T('Design IT capacity', '设计IT容量'), F(c.itMW, 2) + ' MW · ' + F(c.racks) + ' ' + T('racks', '个机柜')], [T('Resilience', '韧性等级'), T(c.tier.en, c.tier.zh)],
             [T('Report date', '报告日期'), new Date().toISOString().slice(0, 10)], [T('Estimate class', '估算等级'), T('Feasibility / AACE Class 4 (±25–30%)', '可行性/AACE 4级（±25–30%）')]] });

    /* executive summary */
    h1(T('Executive Summary', '执行摘要'));
    para(T('This proposal assesses a data center of ' + F(c.itMW, 2) + ' MW design IT load (' + c.type.en + ') at ' + L.en + ' (' + L.provEn + '). Parameters not fixed by the owner were proposed from the reference database (Indonesian regional data, IT platform catalogue, reference projects) and engineering standards (Uptime, TIA-942-C, SNI 8799, ASHRAE, NFPA, IEC).',
      '本建议书评估位于' + L.provZh + L.zh + '、设计IT负载' + F(c.itMW, 2) + ' MW的数据中心（' + c.type.zh + '）。业主未确定的参数依据参考数据库（印尼地区数据、IT平台目录、参考项目）及工程标准（Uptime、TIA-942-C、SNI 8799、ASHRAE、NFPA、IEC）提出。'));
    kv([
      [T('IT capacity / racks', 'IT容量/机柜'), F(c.itMW, 2) + ' MW · ' + F(c.racks) + ' ' + T('racks', '柜') + ' · ' + T('avg ', '平均') + F(c.avgDens, 1) + ' kW'],
      [T('IT platforms', 'IT平台'), T(R.stdP.en, R.stdP.zh) + (c.hdR ? ' + ' + F(c.hdR) + ' × ' + hdTxt : '') + (c.gpus ? ' (≈ ' + F(c.gpus) + ' GPUs)' : '')],
      [T('Resilience', '韧性等级'), T(c.tier.en, c.tier.zh) + ' · ' + c.tier.avail + '%'],
      [T('Cooling', '制冷'), T(R.cool.obj.en, R.cool.obj.zh) + ' · PUE ' + F(R.eff.pue, 2) + ' · WUE ' + F(R.eff.wue, 2) + ' L/kWh'],
      [T('PLN demand', 'PLN需量'), F(el.mva, 1) + ' MVA · ' + T(el.volt[0], el.volt[1])],
      [T('Backup power', '备用电源'), el.genTotal + ' × ' + F(el.genSize) + ' kWe (' + el.genLabel + ') · ' + p.fuelH + ' h ' + T('fuel', '燃油') + ' · UPS ' + el.upsTotal + ' × ' + F(el.upsSize) + ' kW, ' + p.upsMin + ' min' + (el.bess ? ' · BESS ' + F(el.bess.mw, 1) + ' MW/' + F(el.bess.mwh, 1) + ' MWh' : '')],
      [T('Building / site', '建筑/场地'), F(sp.gfa) + ' m² GFA · ' + p.floors + ' ' + T('storey(s)', '层') + ' · ' + F(sp.siteNeed / 10000, 2) + ' ha'],
      [T('Total CAPEX', '总投资'), money(cx.total) + ' (' + money(cx.perMW * 1e6, 2) + '/MW ' + T('facility', '设施') + ')'],
      [T('OPEX (stabilised)', '运营成本（稳定期）'), money(op.total) + T('/yr', '/年')],
      p.revModel === 'lease' ? [T('Project IRR (with exit)', '项目IRR（含终值）'), (f.irrTV === null ? '–' : F(f.irrTV * 100, 1) + '%') + ' · NPV ' + money(f.npvTV) + ' @ ' + p.wacc + '%'] : [T('Cost of ownership', '拥有成本'), money(f.lcocAll, 0) + '/kW·' + T('month', '月')],
      [T('Schedule to RFS (phase 1)', '至第一期投产'), R.sched.total + ' ' + T('months', '个月') + ' (≈ ' + R.sched.rfsYear + ')']
    ]);
    h2(T('Key recommendations', '主要建议'));
    bullets([
      (p.ov && p.ov.tier && x.prop.tier !== p.tier
        ? T('Adopt ' + tierName + ' (owner selection; the assessment proposed Tier ' + ['I', 'II', 'III', 'IV'][x.prop.tier - 1] + ' — ', '采用' + tierName + '（业主选择；评估建议为Tier ' + ['I', 'II', 'III', 'IV'][x.prop.tier - 1] + '——') + TP(x.why.tier) + T(')', '）')
        : T('Adopt ' + tierName + ': ', '采用' + tierName + '：') + TP(x.why.tier)),
      T('IT platform: ', 'IT平台：') + T(R.stdP.en, R.stdP.zh) + (c.hdR ? ' + ' + hdTxt : '') + T('. ', '。') + TP(x.why.hdPlat),
      T('Cooling: ', '制冷：') + T(R.cool.obj.en, R.cool.obj.zh) + ' — ' + T('see the decision matrix in Section 5.', '见第5节决策矩阵。'),
      T('Power: PLN ', '电力：PLN ') + F(el.mva, 1) + ' MVA ' + T('with ', '，') + el.feeds + T(' feed(s); generators ', '路进线；发电机') + el.genLabel + T(' with ', '，储油') + p.fuelH + ' h' + T(' fuel; ', '；') + (p.battery === 'LI' ? 'LFP' : 'VRLA') + ' UPS ' + p.upsMin + ' min' + (el.bess ? T('; BESS ', '；储能') + F(el.bess.mw, 1) + ' MW' : '') + '.',
      T('Sustainability: target PUE ', '可持续：目标PUE ') + F(p.targetPUE, 2) + T(', renewable share ', '，可再生能源占比') + p.renewable + '% ' + T('(PLN REC + rooftop solar).', '（PLN绿证+屋顶光伏）。')
    ]);
    h2(T('Principal risks', '主要风险'));
    table([T('Level', '等级'), T('Risk', '风险'), T('Mitigation', '应对措施')], R.risks.filter(function (r) { return r.lv !== 'L'; }).slice(0, 6).map(function (r) { return [r.lv, T(r.en, r.zh), TP(r.m)]; }), [8, 50, 42]);

    /* 1 definition */
    B.push({ t: 'pb' });
    h1(T('1. Project Definition & Owner Requirements', '1. 项目定义与业主要求'));
    para(T('Values marked “Owner” were entered by the owner; “Proposed” were derived by the assessment from references and standards; “Manual” are owner overrides of a proposal.', '“业主”为业主输入值；“建议”为评估依据参考及标准推导的值；“手动”为业主对建议值的修改。'));
    var defs = [
      ['name', 'Project name', '项目名称'], ['loc', 'Location', '地点'], ['type', 'Facility type', '设施类型'], ['crit', 'Workload criticality', '业务关键程度'], ['itMW', 'Design IT load (MW)', '设计IT负载（MW）'],
      ['stdPlat', 'Standard rack platform', '标准机柜平台'], ['dens', 'Standard rack density (kW)', '标准机柜功率（kW）'], ['hdPlat', 'High-density platform', '高密度平台'], ['hdShare', 'High-density racks (%)', '高密度机柜占比（%）'], ['hdDens', 'High-density rack (kW)', '高密度机柜功率（kW）'],
      ['cabinet', 'Cabinet', '机柜品牌'], ['rackW', 'Rack width (mm)', '机柜宽度（mm）'], ['rackD', 'Rack depth (mm)', '机柜深度（mm）'], ['rackU', 'Rack height (U)', '机柜高度（U）'],
      ['tier', 'Tier', '等级'], ['fuelH', 'Fuel autonomy (h)', '燃油自持（h）'], ['upsMin', 'UPS autonomy (min)', 'UPS后备（min）'], ['battery', 'Battery technology', '电池技术'], ['bessOn', 'BESS', '储能'],
      ['cooling', 'Cooling technology', '制冷技术'], ['targetPUE', 'Target PUE', '目标PUE'], ['renewable', 'Renewable share (%)', '可再生能源（%）'], ['tariffIDR', 'Electricity tariff (Rp/kWh)', '电价（印尼盾/kWh）'],
      ['price', 'Lease price (USD/kW·month)', '租价（美元/kW·月）'], ['phases', 'Phases', '分期'], ['floors', 'Storeys', '层数'], ['siteArea', 'Available site (m²)', '可用场地（m²）']
    ];
    function valOf(k) {
      var v = p[k];
      if (k === 'loc') return T(L.en + ' (' + L.provEn + ')', L.zh + '（' + L.provZh + '）');
      if (k === 'type') return T(c.type.en, c.type.zh);
      if (k === 'crit') return TP(x.crit[p.crit]);
      if (k === 'stdPlat' || k === 'hdPlat') { var pl = find(DB.platforms, v); return pl ? T(pl.en, pl.zh) : v; }
      if (k === 'cabinet') { var cb = find(DB.cabinets, v); return cb ? T(cb.en, cb.zh) : v; }
      if (k === 'cooling') { var co = find(DB.cooling, v); return co ? T(co.en, co.zh) : v; }
      if (k === 'tier') return 'Tier ' + ['I', 'II', 'III', 'IV'][v - 1];
      if (k === 'battery') return v === 'LI' ? 'Li-ion (LFP)' : 'VRLA';
      if (k === 'bessOn') return v ? F(p.bessMW, 1) + ' MW × ' + p.bessH + ' h' : T('Not included', '不配置');
      if (k === 'itMW') return F(c.itMW, 2);
      if (k === 'seismic' || k === 'flood') return T({ low: 'Low', med: 'Medium', high: 'High' }[v] || v, { low: '低', med: '中', high: '高' }[v] || v);
      if (k === 'raised') return v === 'YES' ? T('Raised access floor', '架空地板') : T('Slab + overhead distribution', '无地板上走线');
      if (k === 'revModel') return v === 'lease' ? T('Lease / colocation', '租赁/托管') : T('Owner-occupied (TCO)', '自用（TCO）');
      if (typeof v === 'boolean') return v ? T('Yes', '是') : T('No', '否');
      if (typeof v === 'number') return F(v, Math.abs(v) < 10 && v % 1 ? 2 : 0);
      return v === undefined || v === '' ? '–' : String(v);
    }
    function srcOf(k) { if (['name', 'loc', 'type', 'itMW', 'siteArea'].indexOf(k) >= 0) return T('Owner', '业主'); return p.ov && p.ov[k] ? T('Manual', '手动') : T('Proposed', '建议'); }
    table([T('Parameter', '参数'), T('Value', '取值'), T('Source', '来源')], defs.map(function (d) { return [T(d[1], d[2]), valOf(d[0]), srcOf(d[0])]; }), [38, 47, 15]);

    /* 2 site */
    h1(T('2. Site & Regional Assessment', '2. 场地与区域评估'));
    kv([
      [T('Province / location', '省份/地点'), T(L.provEn + ' — ' + L.en, L.provZh + '——' + L.zh)], [T('Island / PLN system', '岛屿/PLN电网'), T(L.island + ' · ' + R.grid.en, L.island + ' · ' + R.grid.zh)],
      [T('Climate', '气候'), T(R.clim.en, R.clim.zh) + ' · ' + L.db + ' °C DB / ' + L.wb + ' °C WB · ' + F(L.elev) + ' m'],
      [T('Seismic / flood (planning)', '地震/洪水（规划级）'), T(({ low: 'Low', med: 'Medium', high: 'High' }[p.seismic]) + ' / ' + ({ low: 'Low', med: 'Medium', high: 'High' }[p.flood]), ({ low: '低', med: '中', high: '高' }[p.seismic]) + '/' + ({ low: '低', med: '中', high: '高' }[p.flood]))],
      [T('DC market status', '数据中心市场'), T({ major: 'Major hub', emerging: 'Emerging hub', none: 'No established hub' }[L.hub], { major: '主要枢纽', emerging: '新兴枢纽', none: '尚无成熟枢纽' }[L.hub])],
      [T('Land / water / wages', '土地/水/工资'), 'USD ' + F(p.landPrice) + '/m² · USD ' + F(p.waterPrice, 2) + '/m³ · UMP 2026 Rp' + F(L.ump) + (L.umpApprox ? ' (≈)' : '')],
      [T('Construction logistics factor', '施工物流系数'), F(L.capexF, 2) + ' × ' + T('Greater Jakarta', '大雅加达')],
      [T('Site area required / available', '所需/可用用地'), F(sp.siteNeed) + ' m² / ' + (p.siteArea > 0 ? F(p.siteArea) + ' m² — ' + (sp.siteOK ? T('sufficient', '充足') : T('insufficient', '不足')) : T('not specified', '未提供'))]
    ]);
    if (L.note) para(TP(L.note));
    para(TP(R.grid.d));

    /* 3 IT */
    h1(T('3. Capacity & IT Platforms', '3. 容量与IT平台'));
    var plRows = [[T('Standard racks', '标准机柜'), T(R.stdP.en, R.stdP.zh), R.stdP.vendor, F(c.stdR), F(c.sd, 1) + ' / ' + F(R.stdP.kwPeak), R.stdP.cool, p.rackW + '×' + p.rackD + ' · ' + p.rackU + 'U', F(R.stdP.kg)]];
    if (c.hdR) plRows.push([T('High-density racks', '高密度机柜'), T(R.hdP.en, R.hdP.zh), R.hdP.vendor, F(c.hdR), F(c.hd, 0) + ' / ' + F(R.hdP.kwPeak), R.hdP.cool, R.hdP.w + '×' + R.hdP.d + ' · ' + R.hdP.u + 'U', F(R.hdP.kg)]);
    table([T('Group', '分组'), T('Platform', '平台'), T('Vendors', '厂商'), T('Racks', '数量'), T('kW design / peak', 'kW设计/峰值'), T('Cooling', '冷却'), T('W×D mm · U', '宽×深mm·U'), T('kg', 'kg')], plRows, [11, 22, 20, 7, 11, 8, 13, 8]);
    bullets([TP(R.stdP.note)].concat(c.hdR ? [TP(R.hdP.note)] : []).concat([T('Cabinet: ', '机柜：') + TP([find(DB.cabinets, p.cabinet).en, find(DB.cabinets, p.cabinet).zh]) + ' — ' + TP(find(DB.cabinets, p.cabinet).note)]));
    para(T('Total ', '共') + F(c.racks) + T(' racks, average ', '个机柜，平均') + F(c.avgDens, 1) + T(' kW/rack; ', ' kW/柜；') + (c.gpus ? '≈ ' + F(c.gpus) + T(' GPUs/accelerators; ', '颗GPU/加速器；') : '') + p.phases + T(' phase(s) of ≈ ', '期，每期约') + F(c.phaseMW, 1) + ' MW.');

    /* 4 power */
    h1(T('4. Resilience, Power & Energy Storage', '4. 韧性、供电与储能'));
    para((p.ov && p.ov.tier && x.prop.tier !== p.tier ? T('Owner selection: ' + tierName + ' (assessment proposal: Tier ' + ['I', 'II', 'III', 'IV'][x.prop.tier - 1] + '). Basis of the proposal: ', '业主选择：' + tierName + '（评估建议：Tier ' + ['I', 'II', 'III', 'IV'][x.prop.tier - 1] + '）。建议依据：') : '') + TP(x.why.tier));
    table([T('Standard', '标准'), T('Level', '等级'), T('Key requirements for this level', '该等级主要要求')], x.tierStd.map(function (r) { return [r[0], r[1], T(r[2], r[3])]; }), [24, 20, 56]);
    kv([
      [T('Maximum demand', '最大需量'), F(el.demandKW) + ' kW · ' + F(el.mva, 1) + ' MVA · ' + T(el.volt[0], el.volt[1])], [T('Utility feeds', '市电进线'), el.feeds],
      [T('Transformers', '变压器'), el.txTotal + ' × ' + F(el.txSize) + ' kVA (' + el.txLabel + ')'], [T('Generators', '发电机'), el.genTotal + ' × ' + F(el.genSize) + ' kWe (' + el.genLabel + '), COP/DCC'],
      [T('Fuel storage', '储油'), F(el.fuelL / 1000) + ' m³ (' + p.fuelH + ' h) — ' + TP(x.why.fuelH)], [T('UPS', 'UPS'), el.upsTotal + ' × ' + F(el.upsSize) + ' kW (' + el.upsLabel + ') — ' + TP(x.why.upsMin)],
      [T('Batteries', '电池'), F(el.battKWh) + ' kWh ' + (p.battery === 'LI' ? 'Li-ion LFP' : 'VRLA') + ' — ' + TP(x.why.battery)],
      [T('IT distribution', 'IT配电'), el.useBusway ? el.busways + T(' busway runs × ', '条母线×') + el.bwA + ' A' : el.pdus + ' × 150 kVA PDU'],
      [T('BESS', '储能'), el.bess ? F(el.bess.mw, 1) + ' MW / ' + F(el.bess.mwh, 1) + ' MWh, ' + el.bess.containers + T(' containers — ', '个集装箱——') + TP(x.why.bessOn) : T('Not included — ', '不配置——') + TP(x.why.bessOn)]
    ]);

    /* 5 cooling */
    h1(T('5. Cooling & Sustainability', '5. 制冷与可持续'));
    h2(T('Cooling decision matrix', '制冷决策矩阵'));
    table([T('Technology', '技术'), T('Feasible', '可行'), 'PUE', 'WUE', T('Energy/yr', '年电费'), T('Eff.', '能效'), T('Water', '用水'), T('Scale', '规模'), T('CAPEX', '投资'), T('Maturity', '成熟度'), T('IT fit', 'IT适配'), T('Score', '得分')],
      x.matrix.map(function (m) { return [T(m.en, m.zh), m.feasible ? '✓' : '✗', F(m.pue, 2), F(m.wue, 2), money(m.energyCost), F(m.s.eff, 1), F(m.s.water, 1), F(m.s.scale, 1), F(m.s.capex, 1), F(m.s.mat, 1), F(m.s.it, 1), m.feasible ? F(m.score, 2) : '–']; }),
      [26, 6, 6, 6, 11, 6, 6, 6, 6, 7, 6, 8]);
    para(TP(x.why.cooling));
    var plant = [[T('Total heat', '总散热'), F(me.totalHeat) + ' kW · ' + F(me.tr) + ' RT'], [T('Air / liquid heat', '风冷/液冷热量'), F(R.cool.airKW) + ' / ' + F(R.cool.liquidKW) + ' kW']];
    if (me.chN) plant.push([T('Chillers', '冷水机组'), (me.chN + me.chR) + ' × ' + F(me.chSize) + ' kW (' + me.chLabel + ')']);
    if (me.ctN) plant.push([T('Cooling towers', '冷却塔'), (me.ctN + me.ctR) + T(' cells', '格')]);
    if (me.term) plant.push([T('Air terminals', '空气末端'), T(me.term.en, me.term.zh) + ' × ' + (me.term.n + me.term.r)]);
    if (me.rdhx) plant.push([T('Rear-door heat exchangers', '背板换热器'), me.rdhx]);
    if (me.cracN) plant.push([T('DX CRAC units', '直膨精密空调'), (me.cracN + me.cracR) + ' × ' + me.cracSize + ' kW']);
    if (me.iecN) plant.push([T('IEC modules', '间接蒸发模块'), (me.iecN + me.iecR) + ' × 400 kW']);
    if (me.cduN) plant.push([T('CDUs', 'CDU'), (me.cduN + me.cduR) + ' × ' + me.cduSize + ' kW']);
    if (me.dcN) plant.push([T('Warm-water heat rejection', '温水散热'), (me.dcN + me.dcR) + ' × 1,500 kW']);
    if (me.tesM3) plant.push([T('Thermal storage', '蓄冷'), F(me.tesM3) + ' m³']);
    plant.push([T('Water use', '用水'), F(me.waterDay) + ' m³/' + T('day', '日') + ' · WUE ' + F(R.eff.wue, 2) + ' L/kWh']);
    plant.push([T('PUE (annual / design day)', 'PUE（年均/设计日）'), F(R.eff.pue, 2) + ' / ' + F(R.eff.puePeak, 2) + ' — ' + T('target ', '目标') + F(p.targetPUE, 2)]);
    plant.push([T('Renewables & carbon', '可再生能源与碳排放'), p.renewable + '% · ' + F(op.co2t) + ' tCO₂e/' + T('yr', '年') + ' — ' + TP(x.why.renewable)]);
    kv(plant);
    chart(svgBars([{ label: 'IT', v: 1, text: '1.00', color: '#a5b4fc' }, { label: T('Cooling', '制冷'), v: R.eff.mech, text: F(R.eff.mech, 3), color: '#0ea5c6' }, { label: T('Electrical losses', '电气损耗'), v: R.eff.elec, text: F(R.eff.elec, 3), color: '#f2a93b' }, { label: T('Lighting & other', '照明及其他'), v: R.eff.misc, text: F(R.eff.misc, 3), color: '#7c3aed' }]), 760, 140, T('PUE components (per unit of IT energy)', 'PUE构成（每单位IT能耗）'));

    /* 6 space */
    h1(T('6. Space, Building & Site', '6. 空间、建筑与场地'));
    kv([[T('White space', '白区'), F(sp.ws) + ' m² · ' + sp.halls + T(' hall(s)', '个机房')], [T('Electrical rooms', '电气房间'), F(sp.elecRoom) + ' m²'], [T('Mechanical rooms', '暖通机房'), F(sp.mechRoom) + ' m²'],
        [T('Support areas', '支持区'), F(sp.support) + ' m²'], [T('Gross floor area', '总建筑面积'), F(sp.gfa) + ' m² (' + F(sp.gfa / c.itMW) + ' m²/MW)'], [T('Footprint', '占地'), F(sp.footprint) + ' m² · ' + p.floors + T(' storey(s)', '层')],
        [T('External yards / substation', '室外场地/变电站'), F(sp.yard) + ' / ' + F(sp.subst) + ' m²'], [T('Site area required', '所需用地'), F(sp.siteNeed) + ' m² (' + F(sp.siteNeed / 10000, 2) + ' ha)'],
        [T('Floor live load / clear height', '楼面活荷载/净高'), sp.floorLoad + ' kN/m² · ' + T(sp.clearH, sp.clearHzh)], [T('White-space floor', '白区地面'), sp.raised ? T('Raised access floor', '防静电架空地板') : T('Slab-on-grade, overhead distribution', '无架空地板，上走线')]]);

    /* 7 fire */
    h1(T('7. Fire Protection, Security & Monitoring', '7. 消防、安防与监控'));
    kv([[T('Suppression', '灭火'), TP(R.fs.suppression)], [T('Aspirating smoke detectors', '吸气式烟雾探测器'), R.fs.asd], [T('Gas zones', '气体灭火分区'), R.fs.gasZones || '–'],
        [T('Security layers / cameras / doors', '安防层级/摄像机/门禁'), R.fs.securityLayers + ' / ' + F(R.fs.cams) + ' / ' + F(R.fs.readers)], [T('BMS points / EPMS meters', 'BMS点位/EPMS表计'), F(R.fs.bmsPts) + ' / ' + F(R.fs.meters)]]);

    /* 8 BOQ */
    h1(T('8. Major & Secondary Equipment List', '8. 主要及次要设备清单'));
    table([T('Ref.', '编号'), T('Equipment', '设备'), T('Qty', '数量'), T('Unit', '单位'), T('Rating', '规格'), T('Note', '备注')], R.boq.map(function (b) { return [b.id, T(b.en, b.zh), F(b.qty), b.unit, b.rating, b.note]; }), [8, 36, 9, 10, 20, 17], [2]);

    /* 9 cost */
    B.push({ t: 'pb' });
    h1(T('9. Cost Estimate & Financial Analysis', '9. 投资估算与财务分析'));
    para(T('Amounts in ', '金额单位：') + cur + T(' (engine in USD; exchange rate Rp' + F(p.fx) + '/USD).', '（引擎以美元计算；汇率' + F(p.fx) + '印尼盾/美元）。'));
    var capRows = cx.breakdown.map(function (b) { return [T(b.en, b.zh), money(b.usd), F(b.share * 100, 0) + '%']; });
    capRows.push([T('Facility subtotal', '设施小计'), money(cx.facility), '100%'], [T('Utility connection & substation', '电网接入及变电站'), money(cx.utility), ''], [T('Land', '土地') + ' (' + F(cx.landArea) + ' m²)', money(cx.land), ''],
      [T('Contingency', '不可预见费') + ' (' + p.contingency + '%)', money(cx.cont), '']);
    if (cx.bess) capRows.push([T('BESS', '储能'), money(cx.bess), '']);
    if (cx.itHW) capRows.push([T('IT hardware', 'IT硬件'), money(cx.itHW), '']);
    capRows.push([T('TOTAL CAPEX', '总投资'), money(cx.total), '']);
    table([T('CAPEX item', '投资项目'), cur, '%'], capRows, [60, 25, 15], [1, 2]);
    chart(svgBars(cx.breakdown.map(function (b, i) { return { label: T(b.en.replace(/ \(.*\)/, ''), b.zh.replace(/（.*）/, '')), v: b.usd, text: money(b.usd), color: ['#e39b1b', '#0ea5c6', '#b45309', '#f0544f', '#3f3cbb', '#16a34a', '#8b8fbf', '#7c3aed'][i] }; })), 760, 260, T('Facility CAPEX by system', '按系统划分的设施投资'));
    var opRows = [[T('Energy', '电费') + ' (' + F(op.energyMWh) + ' MWh)', money(op.energy)], [T('Maintenance', '维护'), money(op.maint)], [T('Staff', '人员') + ' (' + R.staff.fte + ' FTE)', money(op.staff)],
      [T('Insurance & property', '保险及物业'), money(op.insurance)], [T('Water', '水'), money(op.water)], [T('Renewable certificates (REC)', '绿证'), money(op.rec)], [T('Other G&A', '其他管理费'), money(op.other)]];
    if (op.bessSave) opRows.push([T('BESS peak-shaving saving', '储能削峰节省'), money(op.bessSave)]);
    opRows.push([T('TOTAL OPEX / year', '年运营成本合计'), money(op.total)]);
    table([T('OPEX item (stabilised year)', '运营成本（稳定年）'), cur], opRows, [65, 35], [1]);
    if (p.revModel === 'lease') kv([[T('IRR without / with exit value', 'IRR（不含/含终值）'), (f.irr === null ? '–' : F(f.irr * 100, 1) + '%') + ' / ' + (f.irrTV === null ? '–' : F(f.irrTV * 100, 1) + '%')], [T('NPV @ ', '净现值@') + p.wacc + '%', money(f.npvTV)],
      [T('Payback', '回收期'), f.payback ? f.payback + T(' years', '年') : '–'], [T('Levelised cost (excl. power)', '平准化成本（不含电）'), money(f.lcoc, 0) + '/kW·' + T('month', '月')], [T('Lease price', '租价'), money(p.price, 0) + '/kW·' + T('month', '月')]]);
    else kv([[T('TCO present value', '总拥有成本现值'), money(f.tcoPV)], [T('Cost of ownership', '拥有成本'), money(f.lcocAll, 0) + '/kW·' + T('month', '月')], [T('Equivalent lease (PV)', '等效租赁（现值）'), money(f.leaseAltPV)]]);
    chart(svgWrap(g.Charts.cashflow(f.rows.map(function (r) { return { year: r.year, cf: r.cf * (opt.fx || 1), cum: r.cum * (opt.fx || 1) }; }), { unit: cur + ' M' })), 760, 270, T('Annual cash flow (bars) and cumulative (line)', '年度现金流（柱）与累计（线）'));
    table([T('Year', '年份'), T('Used kW', '使用kW'), 'CAPEX', T('Revenue', '收入'), 'OPEX', 'EBITDA', T('Cash flow', '现金流'), T('Cumulative', '累计')],
      f.rows.map(function (r) { return [r.year, F(r.used), money(r.capex), money(r.rev), money(r.opex), money(r.ebitda), money(r.cf), money(r.cum)]; }), [8, 10, 13, 13, 13, 13, 15, 15], [1, 2, 3, 4, 5, 6, 7]);

    /* 10 schedule */
    h1(T('10. Schedule & Organisation', '10. 进度与组织'));
    chart(svgWrap(g.Charts.gantt(R.sched.tasks.map(function (t) { return { text: T(t.en, t.zh), s: t.s, d: t.d, c: t.c }; }), R.sched.total)), 760, R.sched.tasks.length * 30 + 30, T('Indicative programme to Ready-for-Service', '至投产的参考进度'));
    table([T('Activity', '活动'), T('Start (month)', '开始（月）'), T('Duration (months)', '工期（月）')], R.sched.tasks.map(function (t) { return [T(t.en, t.zh), 'M' + t.s, t.d]; }), [60, 20, 20]);
    kv([[T('Operations staff', '运营人员'), R.staff.fte + ' FTE'], [T('Facility engineers / security / NOC / management', '设施工程师/安保/NOC/管理'), F(R.staff.fac) + ' / ' + F(R.staff.sec) + ' / ' + F(R.staff.noc) + ' / ' + F(R.staff.mgmt)]]);

    /* 11 risks */
    h1(T('11. Risk Register', '11. 风险登记册'));
    table([T('Level', '等级'), T('Risk', '风险'), T('Mitigation', '应对措施')], R.risks.map(function (r) { return [r.lv, T(r.en, r.zh), TP(r.m)]; }), [8, 50, 42]);

    /* 12 regulatory */
    h1(T('12. Regulatory, Permits & Standards', '12. 法规、许可与标准'));
    bullets([
      T('Business licensing through OSS-RBA (PP 28/2025); KBLI 2025 code 63102 for data center / hosting / colocation; NIB and standard certificate.', '通过OSS-RBA办理经营许可（PP 28/2025）；数据中心/托管采用KBLI 2025代码63102；取得NIB及标准证书。'),
      T('Spatial conformity (KKPR / PKKPR), environmental approval (AMDAL or UKL-UPL per PP 22/2021), building approval PBG and SLF (PP 16/2021).', '空间用途符合性（KKPR/PKKPR）、环境审批（按PP 22/2021办理AMDAL或UKL-UPL）、建筑审批PBG及SLF（PP 16/2021）。'),
      T('PSE registration (Permenkomdigi 5/2025) and personal-data protection (UU 27/2022); sector rules such as POJK 11/2022 for bank workloads.', 'PSE登记（Permenkomdigi 5/2025）及个人数据保护（UU 27/2022）；行业规定如银行业务适用POJK 11/2022。'),
      T('PLN connection agreement, SLO certificate for installations, captive-power / IUPTLS where on-site generation exceeds limits; K3 electrical safety (Permenaker 12/2015).', 'PLN接入协议、电气装置SLO证书、现场发电超限时的自备电力许可（IUPTLS）；电气K3安全（Permenaker 12/2015）。'),
      T('Design to SNI 8799 / Uptime ' + tierName + ', SNI 1726:2019 seismic, PUIL 2011, Permen PU 26/2008 fire safety; green building (Permen PUPR 21/2021, GREENSHIP).', '按SNI 8799/Uptime ' + tierName + '、SNI 1726:2019抗震、PUIL 2011、Permen PU 26/2008消防设计；绿色建筑（Permen PUPR 21/2021、GREENSHIP）。')
    ]);
    table([T('Code / standard', '规范/标准'), T('Scope', '范围')], R.standards.filter(function (s) { return s.r === 'ID'; }).concat(R.standards.filter(function (s) { return s.r === 'INT'; }).slice(0, 14)).map(function (s) { return [s.c, T(s.en, s.zh)]; }), [38, 62]);

    /* 13 basis */
    h1(T('13. Basis of Estimate & Parameter Register', '13. 估算依据与参数登记'));
    para(T('Every parameter below was proposed by the assessment; where the owner changed it, the value used differs from the proposal.', '以下参数均由评估提出；若业主修改，则采用值与建议值不同。'));
    var reg = [], LBL = {}; defs.forEach(function (d) { LBL[d[0]] = [d[1], d[2]]; });
    [['hdShare', 'High-density racks (%)', '高密度机柜占比（%）'], ['phaseInterval', 'Years between phases', '分期间隔（年）'], ['raised', 'White-space floor', '白区地面'], ['kdb', 'Max. site coverage KDB (%)', '最大建筑密度KDB（%）'],
     ['seismic', 'Seismic hazard', '地震风险'], ['flood', 'Flood exposure', '洪水风险'], ['waterScarce', 'Water-constrained site', '水资源受限'], ['eco', 'UPS eco-mode', 'UPS节能模式'], ['bessMW', 'BESS power (MW)', '储能功率（MW）'], ['bessH', 'BESS duration (h)', '储能时长（h）'],
     ['revModel', 'Business case', '商业模式'], ['targetOcc', 'Stabilised utilisation (%)', '稳定期利用率（%）'], ['rampYears', 'Years to stabilise', '达到稳定年数'], ['landPrice', 'Land price (USD/m²)', '土地价格（美元/m²）'], ['waterPrice', 'Water price (USD/m³)', '水价（美元/m³）'],
     ['capexOverride', 'CAPEX benchmark override (USD M/MW)', '单位投资覆盖（百万美元/MW）'], ['contingency', 'Contingency (%)', '不可预见费（%）'], ['staffCost', 'Staff cost (USD/FTE·yr)', '人员成本（美元/人·年）'], ['wacc', 'Discount rate / WACC (%)', '折现率/WACC（%）'], ['tax', 'Corporate tax (%)', '企业所得税（%）'],
     ['life', 'Operating years analysed', '分析运营年数'], ['exitMult', 'Exit value (× EBITDA)', '终值（×EBITDA）'], ['markup', 'Power resale markup (%)', '电费转售加价（%）'], ['includeIT', 'Include IT hardware', '包含IT硬件'], ['itCostKW', 'IT hardware (USD/kW)', 'IT硬件（美元/kW）'], ['prefab', 'Prefabricated / modular', '预制/模块化']]
      .forEach(function (d) { if (!LBL[d[0]]) LBL[d[0]] = [d[1], d[2]]; });
    g.DCPropose.AUTO.forEach(function (k) { if (x.why[k]) reg.push([LBL[k] ? T(LBL[k][0], LBL[k][1]) : k, valOf(k), (p.ov && p.ov[k] ? T('Manual (proposed: ', '手动（建议：') + fmtProp(k, x.prop[k]) + ')' : T('Proposed', '建议')), TP(x.why[k])]); });
    table([T('Parameter', '参数'), T('Used', '采用值'), T('Status', '状态'), T('Basis', '依据')], reg, [18, 18, 16, 48]);
    para(T('Limitations: planning-stage indications for early decision-making. Final design must follow site surveys, PLN studies, local codes, the Authority Having Jurisdiction and certified designers. Real-project facts are from public sources and may change.',
      '局限：用于早期决策的规划阶段参考。最终设计须依据场地勘察、PLN研究、当地规范、主管部门要求及具资质的设计单位。真实项目信息来自公开来源，可能变化。'));
    return B;
    function fmtProp(k, v) { var keep = p[k]; p[k] = v; var s = valOf(k); p[k] = keep; return s; }
  }

  /* ------------------------------------------------------------ HTML (print / PDF) */
  function toHTML(blocks, title) {
    var css = '@page{size:A4;margin:16mm 14mm}body{font-family:"Segoe UI","Microsoft YaHei",Arial,sans-serif;color:#161936;font-size:10.5pt;line-height:1.45;margin:0}' +
      '.bar{position:sticky;top:0;background:#17153f;color:#fff;padding:10px 16px;display:flex;gap:10px;align-items:center;font-size:13px}.bar button{background:#0ea5c6;color:#04202a;border:0;border-radius:6px;padding:7px 14px;font-weight:700;cursor:pointer}' +
      '.doc{max-width:190mm;margin:0 auto;padding:10mm 0}h1{font-size:16pt;color:#2a2785;border-bottom:2px solid #0ea5c6;padding-bottom:4px;margin:22px 0 10px;break-after:avoid}h2{font-size:12.5pt;color:#3f3cbb;margin:14px 0 6px;break-after:avoid}' +
      'p{margin:6px 0}ul{margin:6px 0 6px 18px;padding:0}li{margin:3px 0}table{width:100%;border-collapse:collapse;margin:8px 0;font-size:9pt;break-inside:auto}th{background:#2a2785;color:#fff;text-align:left;padding:5px 6px;font-weight:600}' +
      'td{border-bottom:1px solid #d9dcec;padding:4px 6px;vertical-align:top}tr:nth-child(even) td{background:#f5f6fc}td.n{text-align:right;white-space:nowrap}table.kv td:first-child{width:36%;color:#5d6280}table.kv td:last-child{font-weight:600}' +
      '.cover{min-height:250mm;display:flex;flex-direction:column;justify-content:center;background:linear-gradient(135deg,#17153f,#2a2785 60%,#3f3cbb);color:#fff;padding:24mm 16mm;border-radius:6px;break-after:page}' +
      '.cover .k{color:#9fe6f6;letter-spacing:.12em;font-size:11pt;font-weight:700}.cover h1{color:#fff;border:0;font-size:26pt;margin:8px 0}.cover h2{color:#cdf4fc;font-weight:500}.cover .nm{font-size:18pt;font-weight:700;margin:18px 0}.cover table td{color:#fff;border-color:rgba(255,255,255,.2);background:transparent!important}.cover table td:first-child{color:#9fe6f6}' +
      '.chart{margin:8px 0;text-align:center}.chart svg{max-width:100%;height:auto}.cap{font-size:9pt;color:#5d6280;text-align:center}.pb{break-after:page}@media print{.bar{display:none}.doc{padding:0}}';
    var html = '<!DOCTYPE html><html lang="' + (g.I18N.lang() === 'zh' ? 'zh-CN' : 'en') + '"><head><meta charset="utf-8"><title>' + esc(title) + '</title><style>' + css + '</style></head><body>' +
      '<div class="bar"><b>' + esc(title) + '</b><span style="flex:1"></span><button onclick="window.print()">' + esc(T('Print / Save as PDF', '打印/另存为PDF')) + '</button></div><div class="doc">';
    blocks.forEach(function (b) {
      if (b.t === 'cover') html += '<div class="cover"><div class="k">' + esc(b.title) + '</div><h1>' + esc(b.sub) + '</h1><div class="nm">' + esc(b.name) + '</div><table>' + b.meta.map(function (m) { return '<tr><td>' + esc(m[0]) + '</td><td>' + esc(m[1]) + '</td></tr>'; }).join('') + '</table></div>';
      else if (b.t === 'h1') html += '<h1>' + esc(b.text) + '</h1>';
      else if (b.t === 'h2') html += '<h2>' + esc(b.text) + '</h2>';
      else if (b.t === 'p') html += '<p>' + esc(b.text) + '</p>';
      else if (b.t === 'bullets') html += '<ul>' + b.items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>';
      else if (b.t === 'kv') html += '<table class="kv">' + b.rows.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td></tr>'; }).join('') + '</table>';
      else if (b.t === 'table') html += '<table><thead><tr>' + b.head.map(function (h, i) { return '<th' + (b.widths ? ' style="width:' + b.widths[i] + '%"' : '') + '>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        b.rows.map(function (r) { return '<tr>' + r.map(function (cell, i) { return '<td' + (b.num.indexOf(i) >= 0 ? ' class="n"' : '') + '>' + esc(cell) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
      else if (b.t === 'chart') html += '<div class="chart">' + b.svg + (b.cap ? '<div class="cap">' + esc(b.cap) + '</div>' : '') + '</div>';
      else if (b.t === 'pb') html += '<div class="pb"></div>';
    });
    return html + '</div></body></html>';
  }

  /* ------------------------------------------------------------ helpers: libs & images */
  var libs = {};
  function loadLib(name, src, globalName) {
    if (g[globalName]) return Promise.resolve(g[globalName]);
    if (libs[name]) return libs[name];
    function attempt(n) {
      return new Promise(function (res, rej) {
        var s = document.createElement('script'); s.src = src;
        s.onload = function () { g[globalName] ? res(g[globalName]) : rej(new Error(globalName + ' not defined by ' + src)); };
        s.onerror = function () { s.remove(); rej(new Error('Cannot load ' + src)); };
        document.head.appendChild(s);
      }).catch(function (e) { if (n > 0) return attempt(n - 1); throw e; });
    }
    /* failures are not cached, so the user can simply click export again */
    libs[name] = attempt(1).catch(function (e) { delete libs[name]; throw e; });
    return libs[name];
  }
  function svgToPng(svg, w, h) {
    return new Promise(function (res) {
      var scale = 2, img = new Image(), url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
      img.onload = function () {
        var cv = document.createElement('canvas'); cv.width = w * scale; cv.height = h * scale;
        var ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(url);
        cv.toBlob(function (b) { b.arrayBuffer().then(function (ab) { res(new Uint8Array(ab)); }); }, 'image/png');
      };
      img.onerror = function () { URL.revokeObjectURL(url); res(null); };
      img.src = url;
    });
  }
  function saveBlob(blob, name) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500); }

  /* ------------------------------------------------------------ DOCX */
  function toDocx(blocks, fileName) {
    return loadLib('docx', 'assets/vendor/docx.iife.js', 'docx').then(function (d) {
      var FONT_ = { ascii: 'Calibri', hAnsi: 'Calibri', eastAsia: 'Microsoft YaHei', cs: 'Calibri' };
      var CW = 9746, bord = { style: d.BorderStyle.SINGLE, size: 4, color: 'D9DCEC' }, borders = { top: bord, bottom: bord, left: bord, right: bord };
      function run(t, o) { o = o || {}; return new d.TextRun({ text: String(t), font: FONT_, size: o.size || 20, bold: o.bold, color: o.color || '161936' }); }
      function cell(t, w, o) { o = o || {}; return new d.TableCell({ borders: borders, width: { size: w, type: d.WidthType.DXA }, shading: o.fill ? { fill: o.fill, type: d.ShadingType.CLEAR, color: 'auto' } : undefined,
        margins: { top: 40, bottom: 40, left: 80, right: 80 }, children: [new d.Paragraph({ alignment: o.right ? d.AlignmentType.RIGHT : undefined, children: [run(t, { size: 17, bold: o.bold, color: o.color })] })] }); }
      function tbl(head, rows, widthsPct, num) {
        var ws = widthsPct ? widthsPct.map(function (pc) { return Math.round(CW * pc / 100); }) : head.map(function () { return Math.floor(CW / head.length); });
        var diff = CW - ws.reduce(function (a, b) { return a + b; }, 0); ws[ws.length - 1] += diff;
        var trs = [];
        if (head) trs.push(new d.TableRow({ tableHeader: true, children: head.map(function (h, i) { return cell(h, ws[i], { fill: '2A2785', color: 'FFFFFF', bold: true }); }) }));
        rows.forEach(function (r, ri) { trs.push(new d.TableRow({ cantSplit: true, children: r.map(function (c, i) { return cell(c, ws[i], { fill: ri % 2 ? 'F5F6FC' : undefined, right: num && num.indexOf(i) >= 0 }); }) })); });
        return new d.Table({ width: { size: CW, type: d.WidthType.DXA }, columnWidths: ws, layout: d.TableLayoutType.FIXED, rows: trs });
      }
      var imgs = blocks.filter(function (b) { return b.t === 'chart'; }).map(function (b) { return svgToPng(b.svg, b.w, b.h).then(function (png) { b.png = png; }); });
      return Promise.all(imgs).then(function () {
        var ch = [];
        blocks.forEach(function (b) {
          if (b.t === 'cover') {
            ch.push(new d.Paragraph({ spacing: { before: 1800, after: 120 }, children: [run(b.title, { size: 24, bold: true, color: '0E7490' })] }));
            ch.push(new d.Paragraph({ spacing: { after: 300 }, children: [run(b.sub, { size: 44, bold: true, color: '2A2785' })] }));
            ch.push(new d.Paragraph({ spacing: { after: 400 }, children: [run(b.name, { size: 32, bold: true })] }));
            ch.push(tbl(null, b.meta, [35, 65]));
            ch.push(new d.Paragraph({ children: [new d.PageBreak()] }));
          } else if (b.t === 'h1') ch.push(new d.Paragraph({ heading: d.HeadingLevel.HEADING_1, children: [new d.TextRun({ text: b.text, font: FONT_ })] }));
          else if (b.t === 'h2') ch.push(new d.Paragraph({ heading: d.HeadingLevel.HEADING_2, children: [new d.TextRun({ text: b.text, font: FONT_ })] }));
          else if (b.t === 'p') ch.push(new d.Paragraph({ spacing: { after: 100 }, children: [run(b.text)] }));
          else if (b.t === 'bullets') b.items.forEach(function (i) { ch.push(new d.Paragraph({ numbering: { reference: 'bul', level: 0 }, spacing: { after: 60 }, children: [run(i)] })); });
          else if (b.t === 'kv') { ch.push(tbl(null, b.rows, [36, 64])); ch.push(new d.Paragraph({ children: [] })); }
          else if (b.t === 'table') { ch.push(tbl(b.head, b.rows, b.widths, b.num)); ch.push(new d.Paragraph({ children: [] })); }
          else if (b.t === 'chart' && b.png) {
            var w = 620, h = Math.round(620 * b.h / b.w);
            ch.push(new d.Paragraph({ alignment: d.AlignmentType.CENTER, children: [new d.ImageRun({ type: 'png', data: b.png, transformation: { width: w, height: h } })] }));
            if (b.cap) ch.push(new d.Paragraph({ alignment: d.AlignmentType.CENTER, spacing: { after: 160 }, children: [run(b.cap, { size: 16, color: '5D6280' })] }));
          } else if (b.t === 'pb') ch.push(new d.Paragraph({ children: [new d.PageBreak()] }));
        });
        var doc = new d.Document({
          creator: 'Data Center Project Assessment', title: fileName,
          styles: { default: { document: { run: { font: FONT_, size: 20 } } }, paragraphStyles: [
            { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 30, bold: true, color: '2A2785', font: FONT_ }, paragraph: { spacing: { before: 300, after: 140 }, keepNext: true, keepLines: true, outlineLevel: 0 } },
            { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, color: '3F3CBB', font: FONT_ }, paragraph: { spacing: { before: 200, after: 100 }, keepNext: true, keepLines: true, outlineLevel: 1 } }] },
          numbering: { config: [{ reference: 'bul', levels: [{ level: 0, format: d.LevelFormat.BULLET, text: '•', alignment: d.AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] }] },
          sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1080, right: 1080 } } },
            footers: { default: new d.Footer({ children: [new d.Paragraph({ alignment: d.AlignmentType.CENTER, children: [new d.TextRun({ text: fileName + '  |  ', font: FONT_, size: 15, color: '5D6280' }), new d.TextRun({ children: [d.PageNumber.CURRENT], font: FONT_, size: 15, color: '5D6280' })] })] }) },
            children: ch }]
        });
        return d.Packer.toBlob(doc).then(function (blob) { saveBlob(blob, fileName + '.docx'); });
      });
    });
  }

  /* ------------------------------------------------------------ XLSX */
  function toXlsx(x, opt, fileName) {
    return loadLib('exceljs', 'assets/vendor/exceljs.min.js', 'ExcelJS').then(function (Ex) {
      var wb = new Ex.Workbook(); wb.creator = 'Data Center Project Assessment'; wb.created = new Date();
      var blocks = build(x, opt), sheetN = 0, ws = null, row = 1;
      var usedNames = {};
      function sheetTitle(name) {
        var t = String(name).replace(/[\\\/\?\*\[\]:]/g, ' ').replace(/\s+/g, ' ').trim();
        if (t.length > 31) { t = t.slice(0, 31); var sp = t.lastIndexOf(' '); if (sp > 12) t = t.slice(0, sp); t = t.replace(/[\s,&、，·—-]+$/, ''); }
        var base = t, k = 2; while (usedNames[t.toLowerCase()]) { t = base.slice(0, 28) + ' ' + k++; } usedNames[t.toLowerCase()] = 1; return t;
      }
      function newSheet(name) { sheetN++; ws = wb.addWorksheet(sheetTitle(name) || ('Sheet' + sheetN)); ws.columns = [{ width: 34 }, { width: 46 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 12 }]; row = 1; }
      function head(cells) { var r = ws.getRow(row++); cells.forEach(function (c, i) { var cl = r.getCell(i + 1); cl.value = c; cl.font = { bold: true, color: { argb: 'FFFFFFFF' } }; cl.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2A2785' } }; cl.alignment = { vertical: 'middle', wrapText: true }; }); }
      function line(cells, bold) { var r = ws.getRow(row++); cells.forEach(function (c, i) { var cl = r.getCell(i + 1); cl.value = c; cl.alignment = { vertical: 'top', wrapText: true }; if (bold) cl.font = { bold: true }; }); }
      newSheet(T('Summary', '摘要'));
      blocks.forEach(function (b) {
        if (b.t === 'cover') { var r1 = ws.getRow(row++); r1.getCell(1).value = b.title; r1.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF0E7490' } }; line([b.sub], true); line([b.name], true); b.meta.forEach(function (m) { line(m); }); row++; }
        else if (b.t === 'h1') { newSheet(b.text.replace(/^\d+\.\s*/, '')); var r = ws.getRow(row++); r.getCell(1).value = b.text; r.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF2A2785' } }; row++; }
        else if (b.t === 'h2') { row++; line([b.text], true); }
        else if (b.t === 'p') { var rp = ws.getRow(row++); rp.getCell(1).value = b.text; ws.mergeCells(rp.number, 1, rp.number, 6); rp.getCell(1).alignment = { wrapText: true, vertical: 'top' }; rp.height = Math.min(160, 15 * Math.ceil(b.text.length / 120)); }
        else if (b.t === 'bullets') b.items.forEach(function (i) { var rb = ws.getRow(row++); rb.getCell(1).value = '• ' + i; ws.mergeCells(rb.number, 1, rb.number, 6); rb.getCell(1).alignment = { wrapText: true, vertical: 'top' }; rb.height = Math.min(120, 15 * Math.ceil(i.length / 120)); });
        else if (b.t === 'kv') { b.rows.forEach(function (r) { line(r); ws.getRow(row - 1).getCell(1).font = { color: { argb: 'FF5D6280' } }; }); row++; }
        else if (b.t === 'table') { head(b.head); b.rows.forEach(function (r) { line(r); }); row++; }
      });
      /* numeric cash-flow sheet for further analysis (USD) */
      var cfws = wb.addWorksheet(T('Cash flow USD', '现金流（美元）'));
      cfws.columns = ['Year', 'Built kW', 'Used kW', 'CAPEX', 'Revenue', 'Energy', 'OPEX', 'EBITDA', 'Tax', 'Cash flow', 'Cumulative'].map(function (h) { return { header: h, width: 15 }; });
      cfws.getRow(1).eachCell(function (c) { c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2A2785' } }; });
      x.R.fin.rows.forEach(function (r) { cfws.addRow([r.year, Math.round(r.built), Math.round(r.used), Math.round(r.capex), Math.round(r.rev), Math.round(r.energy), Math.round(r.opex), Math.round(r.ebitda), Math.round(r.tax), Math.round(r.cf), Math.round(r.cum)]); });
      for (var col = 4; col <= 11; col++) cfws.getColumn(col).numFmt = '#,##0';
      var last = cfws.rowCount; cfws.addRow([]);
      var npvRow = cfws.addRow(['NPV @ WACC', '', '', '', '', '', '', '', '', { formula: 'NPV(' + (x.p.wacc / 100) + ',J3:J' + last + ')+J2' }]); npvRow.getCell(1).font = { bold: true };
      var irrRow = cfws.addRow(['IRR (no exit)', '', '', '', '', '', '', '', '', { formula: 'IRR(J2:J' + last + ')' }]); irrRow.getCell(1).font = { bold: true }; irrRow.getCell(10).numFmt = '0.0%';
      /* BOQ & parameters numeric */
      return wb.xlsx.writeBuffer().then(function (buf) { saveBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fileName + '.xlsx'); });
    });
  }

  g.DCReport = {
    build: build, toHTML: toHTML,
    openPrint: function (x, opt, title) { var w = window.open('', '_blank'); if (!w) return false; w.document.open(); w.document.write(toHTML(build(x, opt), title)); w.document.close(); setTimeout(function () { try { w.focus(); w.print(); } catch (e) { } }, 600); return true; },
    docx: function (x, opt, name) { return toDocx(build(x, opt), name); },
    xlsx: function (x, opt, name) { return toXlsx(x, opt, name); }
  };
})(window);
