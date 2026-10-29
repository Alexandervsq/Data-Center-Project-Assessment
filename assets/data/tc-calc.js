/* Project Technology Simulation — linked calculators.
 * Each calculator: i = inputs [key, label, unit, min, max, step, default(ctx), options?],
 *                  a = linked (AUTO) inputs { key: { f(values, ctx) -> value, b: [en, zh] basis } },
 *                  b = inputs bound to the facility design { key: { k: engine parameter (or fn(ctx)), f: scale to the engine unit, map: select values } },
 *                  f(values, ctx) -> steps [[label, formula, result]].
 * A bound input belongs to the whole facility: applying a change re-runs the proposal layer and the engine, so every
 * connected system on every card is re-sized (techcard.js keeps one change set per design basis). Inside a calculator,
 * every AUTO input that depends on a source input follows its rule (codes & standards or the engine's design rules).
 * Editing an AUTO input makes it MANUAL; ↺ restores the rule. The rules match assets/js/engine.js and propose.js, so the
 * simulation and the Project Assessment give the same answers for the same design. */
(function (g) {
  'use strict';
  var X = g.TCX, OLD = Object.assign({}, g.TCX.CALC), L = g.TC.lib, E = g.DCEngine, DB = g.DCDB, K = E.K, F = L.F, roman = X.roman, rp = X.rp, usd = X.usd;
  function pick(list, x) { for (var i = 0; i < list.length; i++) if (list[i] >= x - 1e-9) return list[i]; return list[list.length - 1]; }
  function tierIn() { return ['tier', ['Tier', '等级'], '', 1, 4, 1, function (c) { return c.p.tier; }, [[1, 'Tier I'], [2, 'Tier II'], [3, 'Tier III'], [4, 'Tier IV']]]; }
  function T(v) { return Math.min(4, Math.max(1, Math.round(v.tier))); }
  var TX_STD = [100, 160, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150];
  var ACB = [630, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6300];
  var DN = [100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1200];
  var ROW_MAX = 2500 * K.BW_V * 1.732 * K.BW_F;   /* row load of a 2,500 A busway */
  function txSize(kva, ld) { var need = kva / (ld / 100); return need <= 3150 ? pick(TX_STD, need) : (kva > 40000 ? 3150 : 2500); }
  function ukRule(s) { return s <= 630 ? 4 : (s <= 1250 ? 5 : (s <= 2500 ? 6 : 7)); }
  function genSize(d) { return d <= 1500 ? pick([300, 500, 800, 1000, 1250, 1500], d / K.GEN_LOAD) : (d <= 12000 ? 2000 : (d <= 60000 ? 2500 : 3000)); }
  function gridRel(c) { return (c.R.grid && c.R.grid.rel) || 'high'; }
  function chg(c, k) { var v = c.chg && c.chg[k]; return v !== undefined && v !== '__auto__' ? v : undefined; }
  /* maximum demand from the IT load, the design-day PUE and the UPS-fed share (same formula as the engine) */
  function demandFrom(it, pk, c) { var uf = c && c.R.cap.itKW > 0 ? c.R.el.upsLoad / c.R.cap.itKW : 1; return it * pk + K.UPS_LOSS * it * uf + Math.max(50, 0.01 * it); }
  function pkOf(v, c) { var e = c.R.eff.puePeak; return Math.abs(v.pk - +e.toFixed(2)) < 1e-9 ? e : v.pk; }
  function conn(mva, t, kv, hm, c) { return E.connection(mva, { tier: t, hvKV: kv, htMVA: hm }, c.R.L); }
  var KVO = E.KV.map(function (o) { return [o.kv, [o.en, o.zh]]; });
  function fitTxt(h) {
    if (h.intl) return ['✗ not a PLN voltage (international)', '✗ 非PLN电压等级（国际）'];
    if (!h.avail) return ['✗ not available in this PLN system', '✗ 本PLN电网无此电压'];
    if (h.fit === 'over') return ['✗ demand above the practical range', '✗ 需量超出适用范围'];
    if (h.fit === 'under') return ['△ oversized for this demand', '△ 对该需量偏大'];
    if (h.avail === 3) return ['△ planned (RUPTL), not yet in service', '△ 规划中（RUPTL），尚未投运'];
    if (h.avail === 2) return ['✓ limited / legacy network', '✓ 有限/存量网络'];
    return ['✓ suitable', '✓ 适用'];
  }
  var B = {
    tariff: ['PLN tariff class follows the connection voltage (Q4 2026): 20 kV (TM) → B-3 / I-3, ≈ Rp' + F(DB.idTariffs[0].eff, 1) + '/kWh blended 24/7; 70 kV and above (TT / TET) → I-4, Rp' + F(DB.idTariffs[2].eff, 2) + '/kWh.',
      'PLN电价类别取决于接入电压（2026年第四季度）：20 kV（中压）→B-3/I-3，24/7加权约' + F(DB.idTariffs[0].eff, 1) + '印尼盾/kWh；70 kV及以上（高压/超高压）→I-4，' + F(DB.idTariffs[2].eff, 2) + '印尼盾/kWh。'],
    kv: ['Connection rule: ≤ 30 MVA at 20 kV (PLN TM), ≤ 300 MVA at 150 kV (TT); above that 500 kV in Java–Bali, 275 kV in Sumatra, Kalimantan and Sulawesi (≤ 900 MVA), otherwise several 150 kV substations. 220 / 230 kV is the international equivalent, not a PLN voltage.',
      '接入规则：≤30 MVA接入20 kV（PLN中压），≤300 MVA接入150 kV（高压）；更大时爪哇-巴厘接入500 kV，苏门答腊、加里曼丹、苏拉威西接入275 kV（≤900 MVA），否则采用多座150 kV变电站。220/230 kV为国际等级，非PLN电压。'],
    hm: ['IEC 60076 power transformers: 150/20 kV units of 30 MVA (≤ 25 MVA demand), 60 MVA (≤ 150 MVA) or 100 MVA; 70/20 kV 20–30 MVA; one standby per four duty units (Tier III), 2N (Tier IV).',
      'IEC 60076电力变压器：150/20 kV单台30 MVA（需量≤25 MVA）、60 MVA（≤150 MVA）或100 MVA；70/20 kV为20–30 MVA；每4台工作配1台备用（Tier III），Tier IV为2N。'],
    txSize: ['IEC 60076-1 / -11 preferred ratings: a single unit up to 3,150 kVA for small loads, otherwise 2,500 kVA blocks (3,150 kVA above 40 MVA) so each 400 V switchboard stays within a 4,000–5,000 A ACB and ≤ 65 kA (IEC 61439-2).',
      'IEC 60076-1/-11优选容量：小负荷单台不超过3,150 kVA，否则采用2,500 kVA单元（40 MVA以上采用3,150 kVA），使每段400 V配电柜不超过4,000–5,000 A框架断路器及≤65 kA（IEC 61439-2）。'],
    uk: ['IEC 60076-5 Table 1 short-circuit impedance: 4 % up to 630 kVA, 5 % to 1,250 kVA, 6 % to 2,500 kVA, 7 % above — limits the LV fault level.', 'IEC 60076-5表1短路阻抗：630 kVA及以下4%，至1,250 kVA为5%，至2,500 kVA为6%，以上7%——用于限制低压短路水平。'],
    fuelH: ['Uptime Tier Standard: ≥ 12 h at N load; TIA-942-C guidance 72 h (Rated-3) / 96 h (Rated-4). Rule: 12 / 24 / 24 / 48 h for Tier I–IV, +24 h on medium and +48 h on low-reliability PLN grids (max 96 h).',
      'Uptime等级标准：N负荷下≥12 h；TIA-942-C参考72 h（Rated-3）/96 h（Rated-4）。规则：Tier I–IV分别12/24/24/48 h，中等可靠性电网+24 h、低可靠性电网+48 h（最多96 h）。'],
    tank: ['Standard bulk tank sizes (UL 142 / UL 2085): 20 m³ for small sites, 50 / 100 / 200 m³ as the fuel volume grows; Tier III+ keeps at least two tanks so one can be cleaned or repaired (NFPA 110, concurrent maintainability).',
      '标准主储罐规格（UL 142/UL 2085）：小型站点20 m³，随燃油量增加采用50/100/200 m³；Tier III及以上至少两个储罐，以便其中一个清洗或维修（NFPA 110，可同时维护）。'],
    ups: ['Generators start and accept load in 10–15 s; rule: LFP 5 min (Tier IV 10 min), VRLA 10 min (Tier IV 15 min), sized at end of life (IEEE 485 / IEEE 1184 ageing factor 1.25).',
      '发电机10–15 s启动接带负荷；规则：磷酸铁锂5 min（Tier IV 10 min），铅酸10 min（Tier IV 15 min），按寿命末期计算（IEEE 485/IEEE 1184老化系数1.25）。'],
    row: ['Row load = racks per row × rack design density, with the row shortened where it would exceed a 2,500 A busway; busway A and busway B must each carry the whole row (2N distribution, IEC 61439-6).',
      '每排负载=每排机柜数×机柜设计功率，超过2,500 A母线时缩短该排；A、B两路母线均须各自承担整排负载（2N配电，IEC 61439-6）。'],
    bessSh: ['Proposal rule: AI GPU-swing buffer ≈ 15 % of IT MW; grid support on weaker grids or solar firming / peak shaving ≈ 10 % of IT MW.', '建议规则：AI GPU负荷波动缓冲约为IT MW的15%；弱电网支撑或光伏稳定/削峰约为10%。'],
    bessH: ['Proposal rule: 1 h for GPU buffering, 2 h for grid support and peak shaving (PLN WBP peak window); LFP containers ≈ ' + K.BESS_MWH_BOX + ' MWh each.', '建议规则：GPU缓冲1 h，电网支撑及削峰2 h（PLN高峰时段）；每个LFP集装箱约' + K.BESS_MWH_BOX + ' MWh。'],
    hall: ['Air-cooled heat = number of air-cooled racks × rack load (all IT power becomes heat).', '风冷热负荷=风冷机柜数量×单柜负载（IT电能全部转化为热量）。'],
    chSize: ['Standard chiller frames rated to AHRI 550/590: water-cooled 1,407 / 2,461 / 3,517 kW (400 / 700 / 1,000 RT) as the plant grows; air-cooled 500 / 1,000 kW — limits the number of units.', '按AHRI 550/590额定的标准冷机机型：水冷随规模采用1,407/2,461/3,517 kW（400/700/1,000 RT）；风冷500/1,000 kW——以控制台数。'],
    tes: ['Storage covers the chiller restart: 5 min below Tier III, 10 min Tier III, 15 min Tier IV (continuous cooling required by the Uptime Tier IV standard).', '蓄冷覆盖冷机重启时间：Tier III以下5 min，Tier III 10 min，Tier IV 15 min（Uptime Tier IV要求连续制冷）。'],
    heat: ['Heat at the cooling towers = IT load × chilled-water share of the heat × ' + K.REJ + ' (compressor work added to the heat removed).', '冷却塔散热量=IT负载×冷冻水承担的热量比例×' + K.REJ + '（计入压缩机功耗）。'],
    cdu: ['CDU frame: ≈ 800 kW units for smaller liquid loads, ≈ 1,500 kW units from 3 MW of liquid heat; standby 1 per ' + K.CDU_N_PER_R + ' duty (N+1 groups).', 'CDU机型：液冷热量较小时约800 kW，3 MW以上采用约1,500 kW；每' + K.CDU_N_PER_R + '台工作配1台备用（N+1分组）。'],
    vol: ['Protected volume = room area × height including raised-floor and ceiling voids (NFPA 2001 / ISO 14520 total flooding).', '保护容积=房间面积×高度（含架空地板及吊顶空间）（NFPA 2001/ISO 14520全淹没）。'],
    cc: ['NFPA 2001 / ISO 14520: minimum design concentration = extinguishing concentration × 1.2 (Class A) or × 1.35 (Class C, energised electrical); HFC-227ea ≈ 5.8 %, FK-5-1-12 ≈ 3.5 %.', 'NFPA 2001/ISO 14520：最小设计浓度=灭火浓度×1.2（A类）或×1.35（C类，带电电气）；七氟丙烷约5.8%，全氟己酮约3.5%。'],
    mb: ['Typical bit rate at 25 fps, medium scene activity (IEC 62676-4 planning): 1080p 4 / 2 Mbps, 4 MP 6 / 3 Mbps, 4K 12 / 6 Mbps for H.264 / H.265.', '25 fps、中等场景活动下的典型码率（IEC 62676-4规划）：H.264/H.265分别为1080p 4/2 Mbps、4 MP 6/3 Mbps、4K 12/6 Mbps。'],
    scale: ['Scaled with the IT load from the design basis (same topology and Tier).', '按IT负载由设计基准等比例换算（拓扑及等级相同）。'],
    floor: ['Design live load rule (SNI 1727:2020 with data-centre practice): 25 kN/m² for racks ≥ 1,300 kg, 20 kN/m² for ≥ 1,000 kg, otherwise 15 kN/m².', '设计活荷载规则（SNI 1727:2020及数据中心惯例）：机柜≥1,300 kg取25 kN/m²，≥1,000 kg取20 kN/m²，其余15 kN/m²。']
  };
  var BESS_ON = function () { return { bessOn: true }; };

  var CALC = {
    pue: { i: [['it', ['IT load', 'IT负载'], 'MW', .1, 1000, .1, function (c) { return c.R.cap.itMW; }], ['mech', ['Cooling overhead', '制冷附加'], ['× IT', '× IT'], 0, 1, .01, function (c) { return +c.R.eff.mech.toFixed(2); }],
      ['elec', ['Electrical losses', '电气损耗'], ['× IT', '× IT'], 0, .2, .005, function (c) { return c.R.eff.elec; }], ['misc', ['Lighting & other', '照明及其他'], ['× IT', '× IT'], 0, .1, .005, function (c) { return c.R.eff.misc; }],
      ['occ', ['Average utilisation', '平均利用率'], '%', 10, 100, 5, function (c) { return c.p.targetOcc; }], ['tar', ['PLN tariff', 'PLN电价'], 'Rp/kWh', 500, 3000, .01, function (c) { return c.p.tariffIDR; }]],
      a: { tar: { b: B.tariff, f: function (v, c) { var mva = demandFrom(v.it * 1000, 1 + v.mech * 1.3 + v.elec + v.misc, c) / K.PF / 1000, kv = chg(c, 'hvKV') || E.kvRule(mva, c.R.L.grid); return kv >= 70 ? DB.idTariffs[2].eff : DB.idTariffs[0].eff; } } },
      b: { it: { k: 'itMW' }, mech: { k: 'mechOv' }, elec: { k: 'elecOv' }, misc: { k: 'miscOv' }, occ: { k: 'targetOcc' }, tar: { k: 'tariffIDR' } },
      f: function (v) {
        var pue = 1 + v.mech + v.elec + v.misc, itE = v.it * v.occ / 100 * 8760, fac = itE * pue, cost = fac * 1000 * v.tar;
        return [[['PUE', 'PUE'], '1 + ' + F(v.mech, 2) + ' + ' + F(v.elec, 3) + ' + ' + F(v.misc, 3), F(pue, 2)],
          [['IT energy per year', '年IT能耗'], F(v.it, 1) + ' MW × ' + F(v.occ) + ' % × 8,760 h', F(itE) + ' MWh'],
          [['Facility energy per year', '年设施总能耗'], F(itE) + ' × ' + F(pue, 2), F(fac) + ' MWh'],
          [['Overhead energy', '附加能耗'], F(fac) + ' − ' + F(itE), F(fac - itE) + ' MWh'],
          [['Electricity cost', '电费'], F(fac) + ' MWh × Rp ' + F(v.tar, 1) + '/kWh', rp(cost)],
          [['Scope-2 emissions (grid ' + DB.idGridEF + ' t/MWh)', '范围二排放（电网' + DB.idGridEF + ' t/MWh）'], F(fac) + ' × ' + DB.idGridEF, F(fac * DB.idGridEF) + ' tCO₂e'],
          [['Saving if PUE were 0.10 lower', 'PUE降低0.10可节省'], F(itE) + ' × 0.10 × Rp ' + F(v.tar, 1), rp(itE * 0.1 * 1000 * v.tar)]];
      } },
    tier: { i: [tierIn(), ['n', ['Duty units needed (N)', '所需工作单元（N）'], ['units', '台'], 1, 60, 1, function (c) { return c.R.el.upsN; }]],
      b: { tier: { k: 'tier' } },
      f: function (v) {
        var t = T(v), tr = DB.tiers[t - 1], r = E.redundancy(t, Math.round(v.n), 'ups'), dt = (1 - tr.avail / 100) * 8760;
        return [[['Availability target', '可用性目标'], tr.tia + ' · ' + tr.sni, F(tr.avail, 3) + ' %'],
          [['Downtime per year', '年停机时间'], '(1 − ' + F(tr.avail, 3) + ' %) × 8,760 h', F(dt, 1) + ' h (' + F(dt * 60) + ' min)'],
          [['Redundancy rule', '冗余规则'], tr.red, E.redLabel(Math.round(v.n), r)],
          [['Units installed', '安装台数'], F(v.n) + ' + ' + r, F(v.n + r)],
          [['Concurrently maintainable / fault tolerant', '可同时维护 / 容错'], tr.cm ? 'CM ✓' : 'CM ✗', (tr.ft ? 'FT ✓' : 'FT ✗')],
          [['PLN feeds · generator fuel (rule)', 'PLN进线 · 发电机燃油（规则）'], 'Uptime / TIA-942-C', (t >= 3 ? '2' : '1') + ' × PLN · ≥ ' + ({ 1: 12, 2: 24, 3: 24, 4: 48 })[t] + ' h']];
      } },
    dens: Object.assign({}, OLD.dens, { b: { it: { k: 'itMW' }, sd: { k: 'dens' }, s: { k: 'hdShare' }, hd: { k: 'hdDens' } } }),
    /* PLN connection: demand → voltage level → circuits → GIS → transformation chain → 20 kV switchgear → MV/LV transformers */
    mva: { i: [['it', ['IT load', 'IT负载'], 'kW', 50, 1000000, 50, function (c) { return c.R.cap.itKW; }], ['pk', ['PUE on the design day', '设计日PUE'], '', 1.05, 2.5, .01, function (c) { return +c.R.eff.puePeak.toFixed(2); }], tierIn(),
      ['kv', ['PLN connection voltage', 'PLN接入电压'], '', 20, 500, 1, function (c) { return c.R.el.hv.kv; }, KVO],
      ['hm', ['HV/MV transformer rating', '高压/中压主变容量'], 'MVA', 20, 150, 1, function (c) { return c.R.el.hv.ht ? c.R.el.hv.ht.mva : 60; }, [[20, '20 MVA'], [30, '30 MVA'], [60, '60 MVA'], [100, '100 MVA'], [150, '150 MVA']]]],
      a: { kv: { b: B.kv, f: function (v, c) { return E.kvRule(mvaOf(v, c), c.R.L.grid); } },
        hm: { b: B.hm, f: function (v, c) { var h = conn(mvaOf(v, c), T(v), v.kv, 0, c); return h.ht ? h.ht.rule : 60; } } },
      b: { it: { k: 'itMW', f: 0.001 }, pk: { k: 'pkPUE' }, tier: { k: 'tier' }, kv: { k: 'hvKV' }, hm: { k: 'htMVA' } },
      f: function (v, c) {
        var t = T(v), d = demandFrom(v.it, pkOf(v, c), c), md = chg(c, 'mdKVA'), kva = md ? +md : d / K.PF, mva = kva / 1000, h = conn(mva, t, v.kv, v.hm, c), gr = c.R.grid || {};
        var ld = (chg(c, 'txLoad') || K.TX_LOAD * 100) / 100, size = chg(c, 'txKVA') || txSize(kva, ld * 100), n = Math.ceil(kva / (size * ld)), r = E.redundancy(t, n, 'tx'); if (t === 3 && n === 1) r = 1;
        var steps = [[['Maximum demand', '最大需量'], [F(v.it) + ' × ' + F(v.pk, 2) + ' + UPS losses + building', F(v.it) + ' × ' + F(v.pk, 2) + ' + UPS损耗 + 建筑负荷'], F(d) + ' kW'],
          [['Apparent power', '视在功率'], md ? ['set manually (MV switchgear panel)', '手动设定（中压开关柜面板）'] : F(d) + ' ÷ ' + K.PF, F(kva) + ' kVA = ' + F(mva, 1) + ' MVA'],
          [['Recommended connection (' + gr.en + ')', '建议接入（' + gr.zh + '）'], [F(mva, 1) + ' MVA → connection rule', F(mva, 1) + ' MVA → 接入规则'], E.kvName(h.rule)],
          [['Selected connection', '所选接入'], [h.name + ' · practical ' + F(h.lo) + '–' + F(h.hi) + ' MVA', h.name + ' · 适用' + F(h.lo) + '–' + F(h.hi) + ' MVA'], fitTxt(h)],
          [['Incoming circuits' + (t >= 3 ? ' (N-1)' : ''), '进线回路' + (t >= 3 ? '（N-1）' : '')], '⌈' + F(mva, 1) + ' ÷ ' + F(h.capC) + ' MVA⌉' + (t >= 3 ? ' + 1' : ''), [h.circ + ' circuit(s) from ' + (t >= 3 ? '2 PLN substations' : '1 PLN substation'), h.circ + '回，来自' + (t >= 3 ? '2座PLN变电站' : '1座PLN变电站')]]];
        if (h.gis) steps.push([['HV switchgear (IEC 62271-203)', '高压开关设备（IEC 62271-203）'], h.scheme, 'GIS ' + h.ur + ' kV · ' + h.ik + ' kA · ' + F(h.busA) + ' A']);
        if (h.ibt) steps.push([['EHV/HV interbus transformers', '超高压/高压联络变压器'], '⌈' + F(mva, 1) + ' ÷ ' + h.ibt.mva + '⌉ + ' + h.ibt.r, h.ibt.total + ' × ' + h.ibt.mva + ' MVA ' + h.ibt.ratio]);
        if (h.ht) steps.push([['HV/MV transformers (IEC 60076)', '高压/中压主变压器（IEC 60076）'], '⌈' + F(mva, 1) + ' ÷ ' + h.ht.mva + '⌉ + ' + h.ht.r + ' · uk ≈ ' + h.ht.uk + ' %', h.ht.total + ' × ' + h.ht.mva + ' MVA ' + h.ht.ratio + (h.ht.loadOut ? ' · ' + F(h.ht.loadOut) + ' % one out' : '')]);
        steps.push([['20 kV switchgear (IEC 62271-200)', '20 kV开关柜（IEC 62271-200）'], (h.ht ? F(h.ht.mva) : F(mva, 1)) + ' MVA ÷ (√3 × 20 kV) = ' + F(h.mv.i) + ' A', h.mv.boards + ' × 24 kV · ' + F(h.mv.busA) + ' A · ' + h.mv.ik + ' kA' + (h.mv.gis ? ' · GIS' : '')]);
        steps.push([['MV/LV transformers (Tier ' + roman(t) + ')', '中/低压变压器（Tier ' + roman(t) + '）'], '⌈' + F(kva) + ' ÷ (' + F(size) + ' × ' + F(ld, 2) + ')⌉ + ' + r, F(n + r) + ' × ' + F(size) + ' kVA']);
        steps.push([['PLN tariff · lead time · indicative cost', 'PLN电价 · 工期 · 参考投资'], h.kv >= 70 ? 'I-4 TT / TET' : 'B-3 / I-3 TM', 'Rp ' + F(h.kv >= 70 ? DB.idTariffs[2].eff : DB.idTariffs[0].eff, 1) + '/kWh · ≈ ' + h.lead + ' mo · ' + usd(h.cost)]);
        return steps;
      } },
    tx: { i: [['kva', ['Maximum demand', '最大需量'], 'kVA', 10, 1000000, 10, function (c) { return Math.round(c.R.el.demandKVA); }], tierIn(),
      ['ld', ['Loading limit', '负载率上限'], '%', 50, 100, 1, function (c) { return Math.round(c.R.el.txLoad * 100); }],
      ['size', ['Transformer rating', '变压器容量'], 'kVA', 100, 3150, 5, function (c) { return c.R.el.txSize; }],
      ['uk', ['Impedance uk', '短路阻抗uk'], '%', 4, 8, .5, function (c) { return c.R.el.lv.uk; }]],
      a: { size: { b: B.txSize, f: function (v) { return txSize(v.kva, v.ld); } }, uk: { b: B.uk, f: function (v) { return ukRule(v.size); } } },
      b: { kva: { k: 'mdKVA' }, tier: { k: 'tier' }, ld: { k: 'txLoad' }, size: { k: 'txKVA' }, uk: { k: 'txUk' } },
      f: function (v, c) {
        var t = T(v), n = Math.ceil(v.kva / (v.size * v.ld / 100)), r = E.redundancy(t, n, 'tx'); if (t === 3 && n === 1) r = 1;
        var tot = n + r, iFL = v.size * 1000 / (1.732 * 400), acb = pick(ACB, iFL), ik = iFL / (v.uk / 100) / 1000, icw = pick([50, 65, 80, 100], ik);
        var fail = tot > 1 ? v.kva / ((tot - 1) * v.size) * 100 : null, h = conn(v.kva / 1000, t, chg(c, 'hvKV'), chg(c, 'htMVA'), c);
        return [[['Duty transformers', '工作变压器'], '⌈' + F(v.kva) + ' ÷ (' + F(v.size) + ' × ' + F(v.ld / 100, 2) + ')⌉', F(n)],
          [['Redundancy (Tier ' + roman(t) + ')', '冗余（Tier ' + roman(t) + '）'], E.redLabel(n, r), '+' + F(r)],
          [['Installed', '安装台数'], F(n) + ' + ' + F(r), F(tot) + ' × ' + F(v.size) + ' kVA'],
          [['Normal loading per unit', '正常时单台负载率'], F(v.kva) + ' ÷ (' + F(tot) + ' × ' + F(v.size) + ')', F(v.kva / (tot * v.size) * 100) + ' %'],
          [['Loading with one unit out', '一台退出时负载率'], fail === null ? '–' : F(v.kva) + ' ÷ (' + F(tot - 1) + ' × ' + F(v.size) + ')', fail === null ? ['no standby', '无备用'] : F(fail) + ' %' + (fail <= 100 ? ' ✓' : ' ✗')],
          [['LV full-load current → main ACB', '低压满载电流→主框架断路器'], F(v.size) + ' kVA ÷ (√3 × 400 V) → IEC 60947-2', F(iFL) + ' A → ' + F(acb) + ' A'],
          [['LV fault level → switchboard rating', '低压短路电流→配电柜额定'], F(iFL) + ' A ÷ ' + F(v.uk, 1) + ' % → IEC 61439-2', F(ik, 1) + ' kA → ' + icw + ' kA'],
          [['PLN connection for this demand', '该需量对应的PLN接入'], F(v.kva / 1000, 1) + ' MVA → ' + h.name + (h.ht ? ' · ' + h.ht.total + ' × ' + h.ht.mva + ' MVA ' + h.ht.ratio : ''), fitTxt(h)],
          [['MV switchgear', '中压开关设备'], [F(tot) + ' TX feeders + ' + (t >= 3 ? '2 incomers + bus coupler per board' : '1 incomer'), F(tot) + '路变压器馈线 + ' + (t >= 3 ? '每段2路进线 + 母联' : '1路进线')], h.mv.boards + ' × 24 kV · ' + F(h.mv.busA) + ' A · ' + h.mv.ik + ' kA' + (h.gis ? ' + ' + h.ur + ' kV GIS' : '')]];
      } },
    fuel: { i: [['d', ['Maximum demand', '最大需量'], 'kW', 50, 1000000, 10, function (c) { return Math.round(c.R.el.demandKW); }], tierIn(),
      ['h', ['Fuel autonomy', '燃油自持'], 'h', 4, 120, 1, function (c) { return c.p.fuelH; }],
      ['q', ['Specific consumption', '比油耗'], 'L/kWh', .2, .35, .01, function (c) { return c.R.el.fuelQ; }],
      ['tank', ['Tank size', '储罐容量'], 'm³', 10, 200, 10, function (c) { return c.R.el.tankSize; }]],
      a: { h: { b: B.fuelH, f: function (v, c) { var rel = gridRel(c); return Math.min(96, ({ 1: 12, 2: 24, 3: 24, 4: 48 })[T(v)] + (rel === 'med' ? 24 : (rel === 'low' ? 48 : 0))); } },
        tank: { b: B.tank, f: function (v) { var L = v.d * v.q * v.h; return L > 400000 ? 200 : (L > 100000 ? 100 : (L > 20000 ? 50 : 20)); } } },
      b: { d: { k: 'mdKVA', f: 1 / K.PF }, tier: { k: 'tier' }, h: { k: 'fuelH' }, q: { k: 'fuelQ' }, tank: { k: 'tankM3' } },
      f: function (v, c) {
        var t = T(v), lph = v.d * v.q, L = lph * v.h, tanks = Math.max(t >= 3 ? 2 : 1, Math.ceil(L / 1000 / v.tank)), trucks = Math.ceil(L / 16000);
        var gs = +(chg(c, 'genKW') || genSize(v.d)), gn = Math.ceil(v.d / (gs * K.GEN_LOAD)), gr = E.redundancy(t, gn, 'gen'), gv = chg(c, 'genV') || (v.d > 6000 ? 'MV' : 'LV');
        return [[['Consumption at full load', '满载耗油'], F(v.d) + ' kW × ' + F(v.q, 2), F(lph) + ' L/h'],
          [['Fuel for the autonomy', '自持所需燃油'], F(lph) + ' × ' + F(v.h) + ' h', F(L / 1000, 1) + ' m³'],
          [['Bulk tanks', '主储油罐'], 'max(' + (t >= 3 ? 2 : 1) + ', ⌈' + F(L / 1000, 1) + ' ÷ ' + F(v.tank) + '⌉)', F(tanks) + ' × ' + F(v.tank) + ' m³'],
          [['Generators (continuous rating, ' + K.GEN_LOAD * 100 + ' %)', '发电机（持续功率，' + K.GEN_LOAD * 100 + '%）'], '⌈' + F(v.d) + ' ÷ (' + F(gs) + ' × ' + K.GEN_LOAD + ')⌉ + ' + gr, F(gn + gr) + ' × ' + F(gs) + ' kWe (' + E.redLabel(gn, gr) + ')'],
          [['Generator voltage', '发电机电压'], v.d > 6000 ? ['> 6 MW: paralleled plant on the 20 kV board', '>6 MW：在20 kV母线并机'] : ['≤ 6 MW: 400 V sets with ATS', '≤6 MW：400 V机组+ATS'], gv === 'MV' ? ['20 kV paralleled plant', '20 kV并机电站'] : ['400 V (LV)', '400 V（低压）']],
          [['Refill by 16 kL tankers', '16 kL油罐车补油'], F(L / 1000, 1) + ' ÷ 16', [F(trucks) + ' trucks', F(trucks) + ' 车']]];
      } },
    batt: { i: [['kw', ['UPS system rating', 'UPS单系统容量'], 'kW', 100, 2000, 50, function (c) { return c.R.el.upsSize; }], ['n', ['Installed UPS systems', '安装UPS系统数'], ['units', '台'], 1, 4000, 1, function (c) { return c.R.el.upsTotal; }],
      ['chem', ['Battery chemistry', '电池类型'], '', 1, 2, 1, function (c) { return c.p.battery === 'VRLA' ? 2 : 1; }, [[1, ['Li-ion LFP', '磷酸铁锂']], [2, ['VRLA', '阀控铅酸']]]], tierIn(),
      ['m', ['Autonomy', '后备时间'], 'min', 1, 30, 1, function (c) { return c.p.upsMin; }], ['age', ['Ageing factor', '老化系数'], '', 1, 1.5, .05, function (c) { return c.R.el.battAge; }]],
      a: { m: { b: B.ups, f: function (v, c) { var li = Math.round(v.chem) !== 2, t = T(v); if (li && c.p.type === 'AI') return 5; return li ? (t === 4 ? 10 : 5) : (t === 4 ? 15 : 10); } } },
      b: { kw: { k: 'upsKW' }, chem: { k: 'battery', map: [[1, 'LI'], [2, 'VRLA']] }, tier: { k: 'tier' }, m: { k: 'upsMin' }, age: { k: 'battAge' } },
      f: function (v) {
        var li = Math.round(v.chem) !== 2, e1 = v.kw * v.m / 60, e2 = e1 * v.age / K.BATT_EFF, tot = e2 * v.n;
        return [[['Energy at the inverter', '逆变器所需能量'], F(v.kw) + ' kW × ' + F(v.m) + ' ÷ 60', F(e1, 1) + ' kWh'],
          [['With ageing and DC losses', '计入老化及直流损耗'], F(e1, 1) + ' × ' + F(v.age, 2) + ' ÷ ' + K.BATT_EFF, F(e2, 1) + ' kWh'],
          [['Total battery energy', '电池总能量'], F(e2, 1) + ' × ' + F(v.n), F(tot) + ' kWh'],
          [['Bridging margin over generator start (15 s)', '相对发电机启动（15 s）的裕度'], F(v.m * 60) + ' s ÷ 15 s', '× ' + F(v.m * 60 / 15)],
          [['Battery room criteria', '电池室要求'], li ? 'NFPA 855 · UL 9540A' : 'IEC 62485-2', li ? ['off-gas detection, BMS, fire separation', '逸出气体探测、BMS、防火分隔'] : ['hydrogen ventilation, acid-resistant floor', '氢气通风、耐酸地面']]];
      } },
    bwy: { i: [['nr', ['Racks per row', '每排机柜数'], '', 4, 40, 1, function (c) { return c.R.el.rackRow; }], ['rk', ['Rack design density', '机柜设计功率'], 'kW', 1, 400, 1, function (c) { return Math.round(c.R.cap.maxDens); }],
      ['row', ['IT load per row', '每排IT负载'], 'kW', 5, 8000, 5, function (c) { return Math.min(c.R.el.rackRow, Math.max(2, Math.floor(ROW_MAX / Math.max(1, Math.round(c.R.cap.maxDens))))) * Math.round(c.R.cap.maxDens); }]],
      a: { row: { b: B.row, f: function (v) { return Math.min(v.nr, Math.max(2, Math.floor(ROW_MAX / Math.max(1, v.rk)))) * v.rk; } } },
      b: { nr: { k: 'rackRow' }, rk: { k: function (c) { return c.R.cap.hdR > 0 && c.R.cap.hd >= c.R.cap.sd ? 'hdDens' : 'dens'; } } },
      f: function (v) {
        var nEff = Math.min(v.nr, Math.max(2, Math.floor(ROW_MAX / Math.max(1, v.rk)))), I = v.row / (K.BW_V * 1.732 * K.BW_F), bw = pick([160, 250, 400, 630, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000], I), Ir = v.rk / (K.BW_V * 1.732 * K.BW_F);
        var rp2 = v.rk <= 7 ? '1-ph 32 A' : v.rk <= 22 ? '3-ph 32 A' : v.rk <= 43 ? '3-ph 63 A' : Math.ceil(v.rk / 43) + ' × 3-ph 63 A';
        return [[['Racks per row (≤ 2,500 A busway)', '每排机柜数（母线≤2,500 A）'], 'min(' + F(v.nr) + ', ⌊' + F(ROW_MAX) + ' ÷ ' + F(v.rk) + '⌋)', nEff < v.nr ? [F(nEff) + ' — row shortened', F(nEff) + '——缩短该排'] : F(nEff)],
          [['Row current', '每排电流'], F(v.row) + ' ÷ (√3 × ' + K.BW_V + ' × ' + K.BW_F + ')', F(I) + ' A'],
          [['Busway rating (each of A and B)', '母线额定（A、B各一）'], 'IEC 61439-6, next ≥ ' + F(I) + ' A', bw + ' A' + (I > 4000 ? ' — split the row' : '')],
          [['Rack current', '机柜电流'], F(v.rk) + ' ÷ (√3 × ' + K.BW_V + ' × ' + K.BW_F + ')', F(Ir) + ' A'],
          [['Rack feed per side (IEC 60309 tap-off)', '每路机柜进线（IEC 60309插接）'], F(v.rk) + ' kW', rp2]];
      } },
    bess: { i: [['on', ['BESS included', '配置储能'], '', 0, 1, 1, function (c) { return c.p.bessOn ? 1 : 0; }, [[1, ['Yes', '是']], [0, ['No', '否']]]],
      ['it', ['IT load', 'IT负载'], 'MW', .1, 3000, .1, function (c) { return c.R.cap.itMW; }],
      ['mode', ['Main purpose', '主要用途'], '', 1, 3, 1, function (c) { return c.p.type === 'AI' ? 1 : (gridRel(c) !== 'high' ? 2 : 3); }, [[1, ['GPU load buffer (AI)', 'GPU负荷缓冲（AI）']], [2, ['Weak-grid support', '弱电网支撑']], [3, ['Peak shaving / solar firming', '削峰/光伏稳定']]]],
      ['sh', ['BESS power share', '储能功率占比'], '% IT', 1, 60, 1, function (c) { return c.R.el.bess ? Math.round(c.R.el.bess.mw / c.R.cap.itMW * 100) : (c.p.type === 'AI' ? 15 : 10); }],
      ['h', ['Duration', '时长'], 'h', .5, 6, .5, function (c) { return c.R.el.bess ? c.R.el.bess.h : (c.p.type === 'AI' ? 1 : 2); }]],
      a: { sh: { b: B.bessSh, f: function (v) { return Math.round(v.mode) === 1 ? 15 : 10; } }, h: { b: B.bessH, f: function (v) { return Math.round(v.mode) === 1 ? 1 : 2; } } },
      b: { on: { k: 'bessOn', map: [[1, true], [0, false]] }, it: { k: 'itMW' }, sh: { k: 'bessSh', also: BESS_ON }, h: { k: 'bessH', also: BESS_ON } },
      f: function (v, c) {
        var mw = v.it * v.sh / 100, mwh = mw * v.h, box = Math.ceil(mwh / K.BESS_MWH_BOX), tt = c.R.el.vclass === 'TT';
        return [[['BESS power', '储能功率'], F(v.it, 1) + ' × ' + F(v.sh) + ' %', Math.round(v.on) ? F(mw, 1) + ' MW' : [F(mw, 1) + ' MW (not in the design)', F(mw, 1) + ' MW（未纳入设计）']], [['Energy', '能量'], F(mw, 1) + ' × ' + F(v.h, 1) + ' h', F(mwh, 1) + ' MWh'],
          [['Containers', '集装箱数'], '⌈' + F(mwh, 1) + ' ÷ ' + K.BESS_MWH_BOX + '⌉', F(box)], [['Yard area (≈ 40 m² each)', '场地面积（每个约40 m²）'], F(box) + ' × 40', F(box * 40) + ' m²'],
          [['Fire separation', '防火间距'], 'NFPA 855 · UL 9540A', ['≥ 3 m between units unless tests show no propagation', '单元间≥3 m（试验证明不蔓延者除外）']],
          [['Peak-shaving value', '削峰价值'], tt ? 'I-4 TT flat tariff' : 'TM peak / off-peak', tt ? ['none on a flat tariff', '统一电价下无削峰收益'] : ['yes — WBP peak window', '有——高峰时段']],
          [['Indicative CAPEX', '参考投资'], F(mwh * 1000) + ' kWh × USD ' + E.BESS_USD_KWH, usd(mwh * 1000 * E.BESS_USD_KWH)]];
      } },
    air: { i: [['nr', ['Air-cooled racks', '风冷机柜数'], '', 1, 200000, 1, function (c) { return Math.max(1, Math.round(c.R.cool.airKW / Math.max(1, c.R.cap.sd))); }], ['kw', ['Rack load', '机柜负载'], 'kW', 1, 80, .5, function (c) { return c.R.cap.sd; }],
      ['hall', ['Air-cooled heat in the hall', '机房风冷热负荷'], 'kW', 10, 5000000, 10, function (c) { return Math.max(1, Math.round(c.R.cool.airKW / Math.max(1, c.R.cap.sd))) * c.R.cap.sd; }],
      ['dt', ['Temperature rise across the servers', '服务器温升'], 'K', 6, 20, 1, function () { return 12; }], tierIn()],
      a: { hall: { b: B.hall, f: function (v) { return v.nr * v.kw; } } },
      b: { kw: { k: 'dens' }, tier: { k: 'tier' } },
      f: function (v) {
        var q = v.kw / (1.2 * 1.006 * v.dt), qh = q * 3600, H = v.hall / (1.2 * 1.006 * v.dt) * 3600, fw = Math.ceil(v.hall / K.FANWALL_KW), fr = E.redundancy(T(v), fw, 'term');
        return [[['Airflow per rack', '单柜风量'], F(v.kw, 1) + ' ÷ (1.2 × 1.006 × ' + F(v.dt) + ')', F(q, 2) + ' m³/s'], [['Per hour', '每小时'], F(q, 2) + ' × 3,600', F(qh) + ' m³/h (' + F(qh * 0.5886) + ' CFM)'],
          [['Hall airflow', '机房总风量'], F(v.hall) + ' kW at ΔT ' + F(v.dt) + ' K', F(H) + ' m³/h'],
          [['Fan walls of ' + K.FANWALL_KW + ' kW (Tier ' + roman(T(v)) + ')', K.FANWALL_KW + ' kW风墙（Tier ' + roman(T(v)) + '）'], '⌈' + F(v.hall) + ' ÷ ' + K.FANWALL_KW + '⌉ + ' + fr, F(fw + fr) + ' (' + E.redLabel(fw, fr) + ')'],
          [['Hot-aisle temperature (supply 24 °C, ASHRAE 18–27 °C)', '热通道温度（送风24 °C，ASHRAE 18–27 °C）'], '24 + ' + F(v.dt), F(24 + v.dt) + ' °C']];
      } },
    chw: { i: [['q', ['Chilled-water load', '冷冻水负荷'], 'kW', 50, 5000000, 50, function (c) { return Math.round(c.R.me.chwLoad || c.R.cool.airKW); }], tierIn(),
      ['size', ['Chiller size', '单机容量'], 'kW', 300, 4000, 1, function (c) { return c.R.me.chSize || 1407; }], ['dt', ['Chilled-water ΔT', '冷冻水温差'], 'K', 4, 14, .5, function (c) { return c.R.me.chwDT || K.CHW_DT; }]],
      a: { size: { b: B.chSize, f: function (v, c) { var q = v.q; return c.R.cool.airTech === 'WCCH' ? (q >= 20000 ? 3517 : (q >= 6000 ? 2461 : 1407)) : (q >= 3000 ? 1000 : 500); } } },
      b: { tier: { k: 'tier' }, size: { k: 'chKW' }, dt: { k: 'chwDT' } },
      f: function (v) {
        var t = T(v), n = Math.ceil(v.q / v.size), r = E.redundancy(t, n, 'plant'), fl = v.q / (4.186 * v.dt), dn = pick(DN, Math.sqrt(4 * fl / 1000 / (Math.PI * 2.4)) * 1000);
        return [[['Cooling capacity', '冷量'], F(v.q) + ' ÷ ' + K.RT_KW, F(v.q / K.RT_KW) + ' RT'], [['Duty chillers', '工作冷机'], '⌈' + F(v.q) + ' ÷ ' + F(v.size) + '⌉', F(n)],
          [['Installed (Tier ' + roman(t) + ')', '安装（Tier ' + roman(t) + '）'], E.redLabel(n, r), F(n + r) + ' × ' + F(v.size) + ' kW'], [['Chilled-water flow', '冷冻水流量'], F(v.q) + ' ÷ (4.186 × ' + F(v.dt, 1) + ')', F(fl) + ' L/s (' + F(fl * 3.6) + ' m³/h)'],
          [['Main header (≤ 2.4 m/s)', '主干管（≤2.4 m/s）'], '√(4 × ' + F(fl / 1000, 3) + ' ÷ (π × 2.4))', 'DN ' + dn],
          [['Heat at the cooling towers', '冷却塔散热量'], F(v.q) + ' × ' + K.REJ, F(v.q * K.REJ) + ' kW']];
      } },
    tes: { i: [['q', ['Chilled-water load', '冷冻水负荷'], 'kW', 50, 5000000, 50, function (c) { return Math.round(c.R.me.chwLoad || c.R.cool.airKW); }], tierIn(),
      ['s', ['Ride-through time', '后备时间'], 's', 60, 1800, 30, function (c) { return c.R.me.tesS || K.TES_S; }], ['dt', ['Usable ΔT', '可用温差'], 'K', 4, 14, .5, function (c) { return c.R.me.chwDT || K.CHW_DT; }]],
      a: { s: { b: B.tes, f: function (v) { var t = T(v); return t >= 4 ? 900 : (t >= 3 ? 600 : 300); } } },
      b: { tier: { k: 'tier' }, s: { k: 'tesS' }, dt: { k: 'chwDT' } },
      f: function (v) {
        var kj = v.q * v.s, m3 = kj / (4.186 * v.dt) / 1000, d = Math.pow(m3 / (Math.PI / 4 * 1.5), 1 / 3);
        return [[['Cooling energy to store', '需储存冷量'], F(v.q) + ' kW × ' + F(v.s) + ' s', F(kj / 3600) + ' kWh'], [['Water volume', '水量'], F(kj) + ' kJ ÷ (4.186 × ' + F(v.dt, 1) + ') ÷ 1,000', F(m3) + ' m³'],
          [['Tank diameter (height = 1.5 × D)', '储罐直径（高 = 1.5 × D）'], '∛(' + F(m3) + ' ÷ (π/4 × 1.5))', F(d, 1) + ' m'], [['Tanks for concurrent maintenance', '可同时维护所需储罐'], 'Tier ' + roman(T(v)), T(v) >= 3 ? ['2 × 50 % (or valved bypass)', '2×50%（或带阀旁通）'] : ['1', '1']]];
      } },
    wue: { i: [['it', ['IT load', 'IT负载'], 'kW', 50, 5000000, 50, function (c) { return c.R.cap.itKW; }], ['occ', ['Average utilisation', '平均利用率'], '%', 10, 100, 5, function (c) { return c.p.targetOcc; }],
      ['heat', ['Heat to the towers', '冷却塔散热量'], 'kW', 0, 10000000, 50, function (c) { return Math.round(c.R.me.rejKW || c.R.cap.itKW * K.REJ); }], ['coc', ['Cycles of concentration', '浓缩倍数'], '', 2, 10, .5, function (c) { return c.p.coc > 1 ? c.p.coc : 5; }]],
      a: { heat: { b: B.heat, f: function (v, c) { return v.it * (c.R.me.rejKW ? c.R.me.rejKW / c.R.cap.itKW : K.REJ); } } },
      b: { it: { k: 'itMW', f: 0.001 }, occ: { k: 'targetOcc' }, coc: { k: 'coc' } },
      f: OLD.wue.f },
    flow: Object.assign({}, OLD.flow, { i: [['kw', ['Rack power', '机柜功率'], 'kW', 10, 400, 1, function (c) { return c.R.cap.hd || c.R.hdP.kw; }], ['liq', ['Share to liquid', '液冷占比'], '%', 50, 100, 1, function (c) { return Math.round((c.p.liqSh > 0 ? c.p.liqSh / 100 : (c.R.hdP.liq || .85)) * 100); }],
      ['dt', ['Coolant temperature rise', '冷却液温升'], 'K', 4, 20, 1, function () { return 10; }]], b: { kw: { k: 'hdDens' }, liq: { k: 'liqSh' } } }),
    cdu: { i: [['q', ['Heat to liquid', '液冷热量'], 'kW', 100, 5000000, 100, function (c) { return Math.round(c.R.cool.liquidKW || 5000); }], ['size', ['CDU capacity', 'CDU容量'], 'kW', 200, 2500, 50, function (c) { return c.R.me.cduSize || 1500; }],
      ['dt', ['Facility-water ΔT', '设施水温差'], 'K', 4, 15, .5, function () { return 8; }]],
      a: { size: { b: B.cdu, f: function (v) { return v.q >= 3000 ? 1500 : 800; } } },
      b: { size: { k: 'cduKW' } },
      f: OLD.cdu.f },
    appr: OLD.appr,
    floor: { i: OLD.floor.i,
      f: function (v, c) {
        var rows = OLD.floor.f(v, c), need = v.kg >= 1300 ? 25 : (v.kg >= 1000 ? 20 : 15);
        rows.push([['Design live load for this rack (rule)', '该机柜对应设计活荷载（规则）'], 'SNI 1727:2020 + DC practice', '≥ ' + need + ' kN/m²']);
        return rows;
      } },
    space: Object.assign({}, OLD.space, { b: { racks: { k: 'racks' }, fl: { k: 'floors' }, kdb: { k: 'kdb' } } }),
    agent: { i: [['a', ['Room area', '房间面积'], 'm²', 10, 2000, 1, function (c) { return Math.round(Math.min(800, c.R.sp.ws / Math.max(1, c.R.fs.gasZones || 1))); }], ['ht', ['Height incl. floor & ceiling voids', '高度（含地板及吊顶空间）'], 'm', 2.5, 8, .1, function () { return 4.5; }],
      ['v', ['Protected volume', '保护容积'], 'm³', 25, 20000, .1, function (c) { return Math.round(Math.min(800, c.R.sp.ws / Math.max(1, c.R.fs.gasZones || 1))) * 4.5; }],
      ['ag', ['Agent', '灭火剂'], '', 1, 2, 1, function () { return 1; }, [[1, ['HFC-227ea', '七氟丙烷']], [2, ['FK-5-1-12', '全氟己酮']]]],
      ['hz', ['Hazard class', '火灾类别'], '', 1, 2, 1, function () { return 1; }, [[1, ['Class A (surface)', 'A类（表面火）']], [2, ['Class C (energised)', 'C类（带电）']]]],
      ['cc', ['Design concentration', '设计浓度'], '%', 3, 10, .1, function () { return 7; }], ['tt', ['Minimum room temperature', '最低室温'], '°C', 10, 30, 1, function () { return 20; }]],
      a: { v: { b: B.vol, f: function (v) { return v.a * v.ht; } }, cc: { b: B.cc, f: function (v) { var ext = Math.round(v.ag) === 2 ? 3.5 : 5.8, sf = Math.round(v.hz) === 2 ? 1.35 : 1.2; return Math.ceil(ext * sf * 10 - 1e-9) / 10; } } },
      f: function (v) {
        var hfc = Math.round(v.ag) !== 2, S = hfc ? 0.1269 + 0.000513 * v.tt : 0.0664 + 0.000274 * v.tt, W = v.v / S * v.cc / (100 - v.cc), noael = hfc ? 9.0 : 10.0;
        return [[['Specific vapour volume S', '比容S'], hfc ? '0.1269 + 0.000513 × ' + F(v.tt) : '0.0664 + 0.000274 × ' + F(v.tt), F(S, 4) + ' m³/kg'],
          [['Agent quantity', '灭火剂用量'], F(v.v) + ' ÷ ' + F(S, 4) + ' × ' + F(v.cc, 1) + ' ÷ (100 − ' + F(v.cc, 1) + ')', F(W) + ' kg'],
          [['Flooding factor', '充装系数'], F(W) + ' ÷ ' + F(v.v), F(W / v.v, 3) + ' kg/m³'],
          [['Safety: concentration ≤ NOAEL', '安全：浓度≤NOAEL'], F(v.cc, 1) + ' % vs ' + F(noael, 1) + ' %', v.cc <= noael ? ['✓ normally occupied space allowed', '✓ 可用于经常有人场所'] : ['✗ exceeds NOAEL — evacuate / redesign', '✗ 超过NOAEL——须撤离或重新设计']],
          [['Discharge time · hold time', '喷放时间 · 浸渍时间'], 'NFPA 2001 · door-fan test', '≤ 10 s · ≥ 10 min']];
      } },
    asd: { i: OLD.asd.i,
      f: function (v, c) {
        var rows = OLD.asd.f(v, c), holes = Math.ceil(v.ws / 83.6);
        rows.splice(3, 0, [['Sampling holes (9.1 m spacing, NFPA 72)', '采样孔（间距9.1 m，NFPA 72）'], '⌈' + F(v.ws) + ' ÷ 83.6⌉', F(holes)]);
        return rows;
      } },
    cctv: { i: [['n', ['Cameras', '摄像机数量'], '', 10, 50000, 1, function (c) { return c.R.fs.cams; }],
      ['res', ['Resolution', '分辨率'], '', 1, 3, 1, function () { return 2; }, [[1, '1080p'], [2, '4 MP'], [3, '4K']]],
      ['cod', ['Codec', '编码'], '', 1, 2, 1, function () { return 2; }, [[1, 'H.264'], [2, 'H.265']]],
      ['mb', ['Bit rate per camera', '单路码率'], 'Mbps', .5, 16, .5, function () { return 3; }], ['d', ['Retention', '保存天数'], ['days', '天'], 30, 365, 1, function () { return 90; }]],
      a: { mb: { b: B.mb, f: function (v) { return ({ 1: [4, 2], 2: [6, 3], 3: [12, 6] })[Math.round(v.res)][Math.round(v.cod) - 1]; } } },
      f: OLD.cctv.f },
    points: { i: [['it', ['IT load', 'IT负载'], 'MW', .1, 3000, .1, function (c) { return c.R.cap.itMW; }], ['tx', ['Transformers', '变压器'], '', 1, 5000, 1, function (c) { return c.R.el.txTotal; }],
      ['ups', ['UPS systems', 'UPS系统'], '', 1, 5000, 1, function (c) { return c.R.el.upsTotal; }], ['bw', ['Busway runs', '母线条数'], '', 0, 50000, 1, function (c) { return c.R.el.busways; }]],
      a: { tx: { b: B.scale, f: function (v, c) { return Math.max(1, Math.round(c.R.el.txTotal * v.it / c.R.cap.itMW)); } },
        ups: { b: B.scale, f: function (v, c) { return Math.max(1, Math.round(c.R.el.upsTotal * v.it / c.R.cap.itMW)); } },
        bw: { b: B.scale, f: function (v, c) { return Math.round(c.R.el.busways * v.it / c.R.cap.itMW); } } },
      b: { it: { k: 'itMW' } },
      f: OLD.points.f }
  };
  function mvaOf(v, c) { var md = chg(c, 'mdKVA'); return md ? md / 1000 : demandFrom(v.it, pkOf(v, c), c) / K.PF / 1000; }
  Object.keys(CALC).forEach(function (k) { X.CALC[k] = CALC[k]; });
  X.LINKS = B;
})(window);
