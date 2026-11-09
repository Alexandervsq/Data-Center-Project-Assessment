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
  function bwV(c) { var v = (c && c.R && c.R.el.lvV) || 400; return v >= 690 ? K.BW_V : v / 1000; }
  function rowMax(c) { return 2500 * bwV(c) * 1.732 * K.BW_F; }   /* row load of a 2,500 A busway at the LV system voltage */
  /* LV system voltage (IEC 60038): the largest economic MV/LV unit keeps the full-load current within a 5,000 A ACB / busbar frame */
  var LVV = [400, 415, 480, 690], LVL = { 400: '230/400 V', 415: '240/415 V', 480: '277/480 V', 690: '400/690 V' };
  var LVN = { 400: ['IEC 60038 / SNI standard; IT power supplies at 230 V', 'IEC 60038/SNI标准；IT电源230 V'], 415: ['IT power supplies at 240 V', 'IT电源240 V'], 480: ['IT power supplies at 277 V (North-American practice; 50 Hz equipment available)', 'IT电源277 V（北美惯例，有50 Hz设备）'],
    690: ['for motors and mechanical boards; the IT path needs 690/400 V transformers (≈ 1.2 % losses)', '用于电机及机械配电；IT路径需690/400 V变压器（损耗约1.2%）'] };
  var LVO = [[1, ['230/400 V — IEC 60038 / SNI standard', '230/400 V——IEC 60038/SNI标准']], [2, ['240/415 V', '240/415 V']], [3, ['277/480 V — 4,000 kVA units', '277/480 V——4,000 kVA单台']], [4, ['400/690 V — mechanical; IT via 690/400 V', '400/690 V——机械负荷；IT经690/400 V']]];
  function lvMax(vv) { return vv >= 690 ? 5000 : (vv >= 480 ? 4000 : 3150); }
  function txSize(kva, ld, vv) { var need = kva / (ld / 100), mx = lvMax(vv || 400), st = mx === 3150 ? 2500 : (mx === 4000 ? 3150 : 4000); return need <= mx ? pick(TX_STD.concat([4000, 5000]).filter(function (q) { return q <= mx; }), need) : (kva > 40000 ? mx : st); }
  function ukRule(s) { return s <= 630 ? 4 : (s <= 1250 ? 5 : (s <= 2500 ? 6 : 7)); }
  function genSize(d) { return d <= 1500 ? pick([300, 500, 800, 1000, 1250, 1500], d / K.GEN_LOAD) : (d <= 12000 ? 2000 : (d <= 60000 ? 2500 : 3000)); }
  function gridRel(c) { return (c.R.grid && c.R.grid.rel) || 'high'; }
  function chg(c, k) { var v = c.chg && c.chg[k]; return v !== undefined && v !== '__auto__' ? v : undefined; }
  /* maximum demand from the IT load, the design-day PUE and the UPS-fed share (same formula as the engine) */
  function demandFrom(it, pk, c) { var uf = c && c.R.cap.itKW > 0 ? c.R.el.upsLoad / c.R.cap.itKW : 1; return it * pk + K.UPS_LOSS * it * uf + Math.max(50, 0.01 * it); }
  function pkOf(v, c) { var e = c.R.eff.puePeak; return Math.abs(v.pk - +e.toFixed(2)) < 1e-9 ? e : v.pk; }
  function conn(mva, t, kv, hm, c) { return E.connection(mva, { tier: t, hvKV: kv, htMVA: hm, ikPCC: chg(c, 'ikPCC') }, c.R.L); }
  var KVO = E.KV.map(function (o) { return [o.kv, [o.en, o.zh]]; }), HMO = E.HT_STD.map(function (m) { return [m, m + ' MVA']; });
  /* select inputs carry numbers: index lists map them to the engine's text values */
  function idx(list, lab) { return { o: list.map(function (q, i) { return [i, lab(q)]; }), m: list.map(function (q, i) { return [i, q.id]; }), ids: list.map(function (q) { return q.id; }) }; }
  var LOC = idx(DB.idLocs, function (q) { return [q.en + ' | ' + q.provEn, q.zh + ' | ' + q.provZh]; }), COOL = idx(DB.cooling, function (q) { return [q.en, q.zh]; }),
      PLAT = idx(DB.platforms, function (q) { return [q.en + ' | ' + q.kw + ' kW', q.zh + ' | ' + q.kw + ' kW']; });
  var GSO = [300, 500, 800, 1000, 1250, 1500, 2000, 2500, 3000, 3500].map(function (x) { return [x, F(x) + ' kWe']; });
  function locOf(v, c) { return v.loc === undefined ? c.R.L : E.loc(LOC.ids[Math.round(v.loc)]); }
  /* connection assessment of the selected voltage (engine: standard / possible with conditions / not practical) */
  /* the selected redundancy in plain words: configuration, transformers and LV switchboards */
  function cfgTxt(k, ar, t) {
    var f = F(k.t), en = f + ' transformers, ' + f + ' LV switchboards', zh = f + '台变压器，' + f + '面低压总配电柜';
    if (ar === '2N') return ['2N: ' + F(k.b) + ' A/B pairs = ' + en, '2N：' + F(k.b) + '对A/B = ' + zh];
    if (ar === 'DR') return ['3N/2: ' + F(k.b) + ' groups of 3 = ' + en, '3N/2：' + F(k.b) + '组每组3台 = ' + zh];
    if (t < 3) return ['N (no reserve) = ' + en, 'N（无备用）= ' + zh];
    return k.b > 1 ? ['N+1: ' + F(k.b) + ' blocks of ' + (k.per - 1) + ' duty + 1 reserve = ' + en, 'N+1：' + F(k.b) + '个模块，每块' + (k.per - 1) + '用1备 = ' + zh] : ['N+1 = ' + en, 'N+1 = ' + zh];
  }
  function hmCheck(hm) { var i = hm * 1000 / (1.732 * 20), n = Math.ceil(i / 3150 - 0.05); return [['HV/MV unit check', '主变容量校核'], [F(hm) + ' MVA at 20 kV = ' + F(i) + ' A per unit, ' + n + ' sections of 3,150 A on one transformer', F(hm) + ' MVA在20 kV为' + F(i) + ' A/台，一台主变需' + n + '段3,150 A母线'], ['✗ not practical above ≈ 300 MVA: use 265 MVA units; 500 MVA belongs to the 500/150 kV interbus stage', '✗ 约300 MVA以上不可行：采用265 MVA；500 MVA属于500/150 kV联络变压器一级']]; }
  function asmTxt(h) { return h.asm.c === 'std' ? ['✓ standard solution', '✓ 标准方案'] : (h.asm.c === 'opt' ? ['△ possible — see conditions', '△ 可行——见条件'] : ['✗ not practical', '✗ 不可行']); }
  var LLC = { std: ['standard load (< 75 MW)', '常规负荷（<75 MW）'], large: ['large load 75–300 MW: ride-through study', '大负荷75–300 MW：穿越研究'], vlarge: ['very large load > 300 MW: dynamic and EMT studies', '超大负荷>300 MW：动态及电磁暂态研究'] };
  var B = {
    hu: ['HV/MV impedance uk: AUTO = max(typical for the rating — 10 % up to 40 MVA, 12.5 % up to 100 MVA, 13 % above — and the value that keeps the 20 kV fault level ≤ 80 % of the board rating); PLN 60 MVA units ≈ 12.5 %, large data-center units 14.5–24 % (BIC 120 MVA 14.5 %, Deltamas 150 MVA 24 %). A lower impedance raises the 20 kV fault level and the board rating (25 → 31.5 → 40 kA) and improves voltage regulation.', '主变短路阻抗uk：自动值=max（按容量的典型值——40 MVA以下10%、100 MVA以下12.5%、以上13%——与使20 kV短路电流≤开关柜额定90%的值）；PLN 60 MVA约12.5%，大型数据中心主变14.5–24%（BIC 120 MVA 14.5%，德尔塔马斯150 MVA 24%）。阻抗越低，20 kV短路电流及开关柜额定越高（25→31.5→40 kA），电压调整率越好。'],
    chv: ['Chiller supply voltage: large water-cooled centrifugal chillers (≥ 3,517 kW ≈ 1,000 TR, plants above ≈ 20 MW of cooling) are commonly MV — 6.6 kV motors with MV drives or soft starters fed by 20/6.6 kV transformers (N + 1); their compressors leave the LV system, so fewer MV/LV transformers, ACBs and LV feeders are needed. Smaller chillers stay on the LV system.', '冷机供电电压：大型水冷离心冷机（≥3,517 kW约1,000冷吨，制冷量约20 MW以上的冷站）通常采用中压——6.6 kV电机配中压变频或软启动，由20/6.6 kV变压器（N+1）供电；压缩机不再占用低压系统，中/低压变压器、框架断路器及低压馈线减少。较小冷机仍接低压系统。'],
    tariff: ['PLN tariff class follows the connection voltage (Q4 2026): 20 kV (TM) → B-3 / I-3, ≈ Rp' + F(DB.idTariffs[0].eff, 1) + '/kWh blended 24/7; 70 kV and above (TT / TET) → I-4, Rp' + F(DB.idTariffs[2].eff, 2) + '/kWh.',
      'PLN电价类别取决于接入电压（2026年第四季度）：20 kV（中压）→B-3/I-3，24/7加权约' + F(DB.idTariffs[0].eff, 1) + '印尼盾/kWh；70 kV及以上（高压/超高压）→I-4，' + F(DB.idTariffs[2].eff, 2) + '印尼盾/kWh。'],
    kv: ['Connection rule: ≤ 30 MVA at 20 kV (PLN TM), ≤ 300 MVA at 150 kV (TT); above that 500 kV in Java–Bali, 275 kV in Sumatra, Kalimantan and Sulawesi (≤ 900 MVA), otherwise several 150 kV substations. 220 / 230 kV is the international equivalent, not a PLN voltage.',
      '接入规则：≤30 MVA接入20 kV（PLN中压），≤300 MVA接入150 kV（高压）；更大时爪哇-巴厘接入500 kV，苏门答腊、加里曼丹、苏拉威西接入275 kV（≤900 MVA），否则采用多座150 kV变电站。220/230 kV为国际等级，非PLN电压。'],
    hm: ['IEC 60076 / SPLN T3.007-2:2016 power transformers: PLN standard 150/20 kV units are 30 and 60 MVA (ONAN/ONAF); customer substations use 30 MVA up to ≈ 25 MVA of demand, 60 MVA up to 150 MVA, 100 MVA up to 400 MVA, 150 MVA up to 800 MVA and 265 MVA split-winding units above (three 3,150 A sections per unit, as in the 1,050 MVA reference); above ≈ 300 MVA a 150/20 kV unit is not practical — 500 MVA is the 500/150 kV interbus stage; 70/20 kV 20–30 MVA; manufacturers build 20–250 MVA and more — any rating can be entered. Redundancy: PLN N-1 (RUPTL 2025–2034: normal loading ≤ 80 %, any one unit out ≤ 100 %) at every Tier — Uptime Tiers rely on the generators, not the utility.',
      'IEC 60076/SPLN T3.007-2:2016电力变压器：PLN标准150/20 kV主变为30及60 MVA（ONAN/ONAF）；用户变电站需量约25 MVA以内用30 MVA，150 MVA以内用60 MVA，400 MVA以内用100 MVA，更大时用150 MVA（100 MVA以上每台带两段20 kV母线）；70/20 kV为20–30 MVA；制造商可供20–250 MVA及以上——可输入任意容量。冗余：PLN N-1准则（RUPTL 2025–2034：正常负载率≤80%，任一台退出≤100%），各Tier相同——Uptime Tier以发电机而非市电为可靠电源。'],
    arch: ['MV/LV redundancy: block redundant N+1 — identical blocks (data halls / LV rooms) of N duty units + 1 reserve (catcher) unit, N = 2–6 chosen for the fewest units, written “10 × (5+1)” for ten blocks of five duty + one reserve (Tier III, the leanest; a block is never uneven such as 50 + 9); distributed redundant 3N/2 — any two of three carry the load (e.g. Schneider Electric RD101: six 2.5 MVA units per 9.36 MW hall); 2N (A / B, Tier IV). 4,000 kVA units at 400 V need 6,300 A ACBs and 100 kA switchboards.', '中/低压冗余：块冗余N+1——相同的块（数据机房/低压配电室），每块N台工作+1台备用（备用母线），N取2–6中台数最少者，10块记为“10 × (5+1)”（十块，每块五用一备；Tier III，最省；不采用50+9之类不均匀的分组）；分布式冗余3N/2——三台中任意两台可承担负荷（如施耐德RD101每个9.36 MW机房6台2.5 MVA）；2N（A/B，Tier IV）。400 V下4,000 kVA需6,300 A框架断路器及100 kA配电柜。'],
    ik: ['Planning fault level at the connection point (Grid Code: PLN states the actual value on request): 500 kV ≈ 40 kA, 275 kV ≈ 20 kA, 150 kV ≈ 25 kA in Java–Bali and ≈ 15 kA elsewhere, 20 kV ≈ 10 kA. The switchgear short-time rating must be at least this value.',
      '接入点规划短路电流（电网规范：实际值由PLN应要求提供）：500 kV约40 kA，275 kV约20 kA，150 kV爪哇-巴厘约25 kA、其他地区约15 kA，20 kV约10 kA。开关设备短时耐受电流不得低于该值。'],
    gs: ['Generator rule: up to 1.5 MW of demand one set size to the load (300–1,500 kWe); up to 12 MW 2,000 kWe sets; up to 60 MW 2,500 kWe; above 3,000 kWe (data-center continuous rating, ISO 8528-1).',
      '发电机规则：需量1.5 MW以内按负荷选单机（300–1,500 kWe）；12 MW以内2,000 kWe；60 MW以内2,500 kWe；以上3,000 kWe（数据中心持续功率，ISO 8528-1）。'],
    gv: ['Generators connect to the LV system with ATS up to ≈ 6 MW of demand; above that a 20 kV paralleled plant (MV alternators or step-up transformers) on the 20 kV board.', '需量约6 MW以内发电机接入低压系统（经ATS）；以上采用20 kV并机电站（中压发电机或升压变压器）接入20 kV母线。'],
    n: ['UPS systems = ⌈UPS load ÷ (rating × ' + K.UPS_LOAD + ')⌉ + Tier redundancy: Tier III per MV/LV block, each block with its own reserve — B × (N+1); 2N for Tier IV.', 'UPS系统数 = ⌈UPS负载 ÷（单系统容量 × ' + K.UPS_LOAD + '）⌉ + Tier冗余：Tier III按中/低压模块配置，每个模块自带一台备用——B × (N+1)；Tier IV为2N。'],
    txSize: ['IEC 60076-1 / -11 preferred ratings up to the largest economic unit for the LV voltage — 400 / 415 V: 3,150 kVA; 480 V: 4,000 kVA; 690 V: 5,000 kVA — a single unit for small loads, otherwise one step below the maximum (the maximum above 40 MVA), so each LV switchboard stays within a 5,000 A frame and ≤ 65–80 kA (IEC 60947-2, IEC 61439-2).',
      'IEC 60076-1/-11优选容量，最大为该低压电压的经济单台容量——400/415 V：3,150 kVA；480 V：4,000 kVA；690 V：5,000 kVA——小负荷单台，否则取低一级（40 MVA以上取最大值），使每段低压配电柜不超过5,000 A框架及65–80 kA（IEC 60947-2、IEC 61439-2）。'],
    lv: ['LV system voltage (IEC 60038, PUIL 2011): 230/400 V is the Indonesian standard. The load is distributed by each transformer\'s LV switchboard busbar; the number of transformers follows the total LV kVA ÷ (unit rating × loading), and the unit rating is limited by the LV current: 3,150 kVA at 400 / 415 V, 4,000 kVA at 480 V, 5,000 kVA at 690 V within a 5,000 A frame (6,300 A and 100 kA are the limits). A higher voltage gives fewer, larger units, but IT power supplies accept 200–277 V line-to-neutral — 690 V suits motors and mechanical boards (the IT path then needs 690/400 V transformers). Transformers are not paralleled on one LV busbar (fault level > 100 kA), so redundancy is arranged in blocks.',
      '低压系统电压（IEC 60038、PUIL 2011）：230/400 V为印尼标准。负荷由每台变压器的低压配电柜母线分配；变压器台数 = 低压总负荷 ÷（单台容量 × 负载率），单台容量受低压电流限制：400/415 V为3,150 kVA，480 V为4,000 kVA，690 V为5,000 kVA（5,000 A框架内；6,300 A及100 kA为极限）。电压越高台数越少、单台越大，但IT电源只接受200–277 V相电压——690 V适用于电机及机械配电（IT路径需690/400 V变压器）。变压器不在同一低压母线并联（短路电流超过100 kA），因此按模块配置冗余。'],
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
      ['occ', ['Average utilisation', '平均利用率'], '%', 10, 100, 5, function (c) { return c.p.targetOcc; }], ['tar', ['PLN tariff', 'PLN电价'], 'Rp/kWh', 500, 3000, .01, function (c) { return c.p.tariffIDR; }],
      ['cool', ['Cooling system', '制冷系统'], '', 0, COOL.ids.length - 1, 1, function (c) { return Math.max(0, COOL.ids.indexOf(c.p.cooling)); }, COOL.o],
      ['ren', ['Renewable energy share (RECs, PPA)', '可再生能源占比（绿证、PPA）'], '%', 0, 100, 5, function (c) { return c.p.renewable || 0; }]],
      a: { tar: { b: B.tariff, f: function (v, c) { var mva = demandFrom(v.it * 1000, 1 + v.mech * 1.3 + v.elec + v.misc, c) / K.PF / 1000, kv = chg(c, 'hvKV') || E.kvRule(mva, c.R.L.grid); return kv >= 70 ? DB.idTariffs[2].eff : DB.idTariffs[0].eff; } } },
      b: { it: { k: 'itMW' }, mech: { k: 'mechOv' }, elec: { k: 'elecOv' }, misc: { k: 'miscOv' }, occ: { k: 'targetOcc' }, tar: { k: 'tariffIDR' }, cool: { k: 'cooling', map: COOL.m }, ren: { k: 'renewable' } },
      f: function (v) {
        var pue = 1 + v.mech + v.elec + v.misc, itE = v.it * v.occ / 100 * 8760, fac = itE * pue, cost = fac * 1000 * v.tar;
        return [[['PUE', 'PUE'], '1 + ' + F(v.mech, 2) + ' + ' + F(v.elec, 3) + ' + ' + F(v.misc, 3), F(pue, 2)],
          [['IT energy per year', '年IT能耗'], F(v.it, 1) + ' MW × ' + F(v.occ) + ' % × 8,760 h', F(itE) + ' MWh'],
          [['Facility energy per year', '年设施总能耗'], F(itE) + ' × ' + F(pue, 2), F(fac) + ' MWh'],
          [['Overhead energy', '附加能耗'], F(fac) + ' − ' + F(itE), F(fac - itE) + ' MWh'],
          [['Electricity cost', '电费'], F(fac) + ' MWh × Rp ' + F(v.tar, 1) + '/kWh', rp(cost)],
          [['Scope-2 emissions (grid ' + DB.idGridEF + ' t/MWh, ' + F(v.ren) + ' % renewable)', '范围二排放（电网' + DB.idGridEF + ' t/MWh，可再生' + F(v.ren) + '%）'], F(fac) + ' × ' + DB.idGridEF + ' × (1 − ' + F(v.ren) + ' %)', F(fac * DB.idGridEF * (1 - v.ren / 100)) + ' tCO₂e'],
          [['Saving if PUE were 0.10 lower', 'PUE降低0.10可节省'], F(itE) + ' × 0.10 × Rp ' + F(v.tar, 1), rp(itE * 0.1 * 1000 * v.tar)]];
      } },
    tier: { i: [tierIn(), ['n', ['Duty units needed (N)', '所需工作单元（N）'], ['units', '台'], 1, 60, 1, function (c) { return c.R.el.upsN; }]],
      b: { tier: { k: 'tier' } },
      f: function (v) {
        var t = T(v), tr = DB.tiers[t - 1], r = E.redundancy(t, Math.round(v.n), 'ups'), dt = (1 - tr.avail / 100) * 8760;
        return [[['Availability target', '可用性目标'], tr.tia + ' | ' + tr.sni, F(tr.avail, 3) + ' %'],
          [['Downtime per year', '年停机时间'], '(1 − ' + F(tr.avail, 3) + ' %) × 8,760 h', F(dt, 1) + ' h (' + F(dt * 60) + ' min)'],
          [['Redundancy rule', '冗余规则'], tr.red, E.redLabel(Math.round(v.n), r, 'block')],
          [['Units installed', '安装台数'], F(v.n) + ' + ' + r, F(v.n + r)],
          [['Concurrently maintainable / fault tolerant', '可同时维护 / 容错'], tr.cm ? 'CM ✓' : 'CM ✗', (tr.ft ? 'FT ✓' : 'FT ✗')],
          [['PLN feeds | generator fuel (rule)', 'PLN进线 | 发电机燃油（规则）'], 'Uptime / TIA-942-C', (t >= 3 ? '2' : '1') + ' × PLN | ≥ ' + ({ 1: 12, 2: 24, 3: 24, 4: 48 })[t] + ' h']];
      } },
    dens: Object.assign({}, OLD.dens, {
      i: OLD.dens.i.concat([['spf', ['Standard IT platform', '标准IT平台'], '', 0, PLAT.ids.length - 1, 1, function (c) { return Math.max(0, PLAT.ids.indexOf(c.p.stdPlat)); }, PLAT.o],
        ['hpf', ['High-density IT platform', '高密度IT平台'], '', 0, PLAT.ids.length - 1, 1, function (c) { return Math.max(0, PLAT.ids.indexOf(c.p.hdPlat)); }, PLAT.o]]),
      b: { it: { k: 'itMW' }, sd: { k: 'dens' }, s: { k: 'hdShare' }, hd: { k: 'hdDens' }, spf: { k: 'stdPlat', map: PLAT.m }, hpf: { k: 'hdPlat', map: PLAT.m } },
      f: function (v, c) {
        var rows = OLD.dens.f(v, c), sp = DB.platforms[Math.round(v.spf)] || c.R.stdP, hp = DB.platforms[Math.round(v.hpf)] || c.R.hdP;
        rows.unshift([['IT platforms (standard / high-density)', 'IT平台（标准/高密度）'], [sp.en + ' / ' + hp.en, sp.zh + ' / ' + hp.zh], F(sp.kw) + ' / ' + F(hp.kw) + ' kW']);
        return rows;
      } }),
    /* PLN connection: demand → voltage level → circuits → GIS → transformation chain → 20 kV switchgear → MV/LV transformers */
    mva: { i: [['it', ['IT load', 'IT负载'], 'kW', 50, 1000000, 50, function (c) { return c.R.cap.itKW; }], ['pk', ['PUE on the design day', '设计日PUE'], '', 1.05, 2.5, .01, function (c) { return +c.R.eff.puePeak.toFixed(2); }], tierIn(),
      ['loc', ['Site location (PLN system, climate)', '场址（PLN电网、气候）'], '', 0, LOC.ids.length - 1, 1, function (c) { return Math.max(0, LOC.ids.indexOf(c.p.loc)); }, LOC.o],
      ['kv', ['PLN connection voltage', 'PLN接入电压'], '', 20, 500, 1, function (c) { return c.R.el.hv.kv; }, KVO],
      ['ik', ['Fault level at the connection point', '接入点短路电流'], 'kA', 5, 80, .5, function (c) { return c.R.el.hv.pccIk; }],
      ['hm', ['HV/MV transformer rating (e.g. 60 MVA = 60,000 kVA)', '高压/中压主变容量（如60 MVA=60,000 kVA）'], 'MVA', 10, 500, 1, function (c) { var h = c.R.el.hv; return h.ht ? h.ht.mva : E.connection(c.R.el.mva, { tier: c.p.tier, hvKV: 150 }, c.R.L).ht.rule; }],
      ['hu', ['HV/MV transformer impedance uk', '主变短路阻抗uk'], '%', 6, 30, .5, function (c) { var h = c.R.el.hv; return h.ht ? h.ht.uk : 12.5; }]],
      a: { kv: { b: B.kv, f: function (v, c) { return E.kvRule(mvaOf(v, c), locOf(v, c).grid); } },
        ik: { b: B.ik, f: function (v, c) { return E.connection(mvaOf(v, c), { tier: T(v), hvKV: v.kv }, locOf(v, c)).pccRule; } },
        hm: { b: B.hm, f: function (v, c) { var h = E.connection(mvaOf(v, c), { tier: T(v), hvKV: v.kv, ikPCC: v.ik }, locOf(v, c)); return h.ht ? h.ht.rule : 60; } },
        hu: { b: B.hu, f: function (v, c) { var h = E.connection(mvaOf(v, c), { tier: T(v), hvKV: v.kv, ikPCC: v.ik, htMVA: v.hm }, locOf(v, c)); return h.ht ? h.ht.ukRule : 12.5; } } },
      b: { it: { k: 'itMW', f: 0.001 }, pk: { k: 'pkPUE' }, tier: { k: 'tier' }, loc: { k: 'loc', map: LOC.m }, kv: { k: 'hvKV' }, ik: { k: 'ikPCC' }, hm: { k: 'htMVA' }, hu: { k: 'htUk' } },
      f: function (v, c) {
        var t = T(v), d = demandFrom(v.it, pkOf(v, c), c), md = chg(c, 'mdKVA'), kva = md ? +md : d / K.PF, mva = kva / 1000, Lc = locOf(v, c);
        var h = E.connection(mva, { tier: t, hvKV: v.kv, htMVA: v.hm, htUk: v.hu, ikPCC: v.ik }, Lc), gr = DB.idGrids[Lc.grid] || {};
        var ikB = (function () { var it = (h.mv.ikCalc || 0) + (c.R.el.hv.mv.ikGen || 0); if (!(it > h.mv.ik)) return h.mv.ik; var L = [25, 31.5, 40, 50, 63]; for (var q = 0; q < L.length; q++) if (L[q] >= it) return L[q]; return 63; })();
        var ld = (chg(c, 'txLoad') || K.TX_LOAD * 100) / 100, lvk = kva * (c.R.el.lvKVA || c.R.el.demandKVA) / Math.max(1, c.R.el.demandKVA), size = chg(c, 'txKVA') || txSize(lvk, ld * 100, c.R.el.lvV || 400), n = Math.ceil(lvk / (size * ld)), ar = c.R.el.txArch, tb = E.txBlocks(n, ar, t), r = tb.r;
        var steps = [[['Maximum demand', '最大需量'], [F(v.it) + ' × ' + F(v.pk, 2) + ' + UPS losses + building', F(v.it) + ' × ' + F(v.pk, 2) + ' + UPS损耗 + 建筑负荷'], F(d) + ' kW'],
          [['Apparent power', '视在功率'], md ? ['set manually (transformer panel)', '手动设定（变压器面板）'] : F(d) + ' ÷ ' + K.PF, F(kva) + ' kVA = ' + F(mva, 1) + ' MVA'],
          [['Recommended connection (' + gr.en + ')', '建议接入（' + gr.zh + '）'], [F(mva, 1) + ' MVA → connection rule', F(mva, 1) + ' MVA → 接入规则'], E.kvName(h.rule)],
          [['Selected connection: ' + h.name, '所选接入：' + h.name], [h.asm.en, h.asm.zh], asmTxt(h)],
          [['Incoming circuits' + (t >= 3 ? ' (N-1)' : ''), '进线回路' + (t >= 3 ? '（N-1）' : '')], '⌈' + F(mva, 1) + ' ÷ ' + F(h.capC) + ' MVA⌉' + (t >= 3 ? ' + 1' : ''), [h.circ + ' circuit(s) from ' + (t >= 3 ? '2 PLN substations' : '1 PLN substation'), h.circ + '回，来自' + (t >= 3 ? '2座PLN变电站' : '1座PLN变电站')]],
          [['Fault level at the connection point', '接入点短路水平'], '√3 × ' + h.kv + ' kV × ' + F(h.pccIk, 1) + ' kA', F(h.ssc) + ' MVA | Isc/IL ≈ ' + F(h.ssc / Math.max(mva, 0.01))]];
        if (h.gis) steps.push([['HV switchgear: ' + h.name + ' GIS, rated Ur ' + h.ur + ' kV (IEC 62271-203, Grid Code Table 3)', '高压开关设备：' + h.name + ' GIS，额定电压Ur ' + h.ur + ' kV（IEC 62271-203，电网规范表3）'], [h.scheme[0] + ' | 1.25 × max(' + F(h.pccIk, 1) + ' / ' + F(h.pccIk1, 1) + ' kA three- / single-phase) | load ' + F(mva * 1000 / (1.732 * h.kv)) + ' A', h.scheme[1] + ' | Ik ≥ ' + F(h.pccIk, 1) + ' kA | 负荷电流' + F(mva * 1000 / (1.732 * h.kv)) + ' A'], h.ik + ' kA | ' + F(h.busA) + ' A']);
        if (h.gis && h.bays) steps.push([['GIS bay ratings (IEC 62271-1, IEC 61869-2)', 'GIS间隔额定（IEC 62271-1、IEC 61869-2）'], ['line: 1.2 × ' + F(h.bays.iLine) + ' A (N-1) | transformer: 1.2 × rated current', '线路：1.2 × ' + F(h.bays.iLine) + ' A（N-1）| 主变：1.2 × 额定电流'],
          ['line bays ' + F(h.bays.lineA) + ' A, CT ' + h.bays.lineCT + ' | ' + (h.ibt ? 'IBT' : 'transformer') + ' bays ' + F(h.bays.txA) + ' A, CT ' + h.bays.txCT + (h.bays.diam ? ' | ' + h.bays.diam + ' diameters' : '') + (h.hvCable ? ' | ' + h.hvCable : ''), '线路间隔' + F(h.bays.lineA) + ' A，CT ' + h.bays.lineCT + ' | ' + (h.ibt ? '联络变' : '主变') + '间隔' + F(h.bays.txA) + ' A，CT ' + h.bays.txCT + (h.bays.diam ? ' | ' + h.bays.diam + '串' : '') + (h.hvCable ? ' | ' + h.hvCable : '')]]);
        if (h.ibt) steps.push([['EHV/HV interbus transformers', '超高压/高压联络变压器'], '⌈' + F(mva, 1) + ' ÷ ' + h.ibt.mva + '⌉ + ' + h.ibt.r + ' | uk ≈ ' + h.ibt.uk + ' %', h.ibt.total + ' × ' + h.ibt.mva + ' MVA ' + h.ibt.ratio]);
        if (h.ht) {
          steps.push([['HV/MV transformers (IEC 60076)', '高压/中压主变压器（IEC 60076）'], ['⌈' + F(mva, 1) + ' ÷ ' + h.ht.mva + '⌉ + ' + h.ht.r + ' — PLN N-1 (normal ≤ 80 %, one out ≤ 100 %) | uk ' + h.ht.uk + ' %' + (h.ht.uk !== h.ht.ukRule ? ' (set; rule ' + h.ht.ukRule + ' %)' : ' = max(typical, 20 kV fault ≤ 80 % of the board rating)'), '⌈' + F(mva, 1) + ' ÷ ' + h.ht.mva + '⌉ + ' + h.ht.r + '（正常≤80%，一台退出≤100%）· uk ' + h.ht.uk + '% = max（典型值，20 kV短路≤开关柜额定的80%）'],
            h.ht.total + ' × ' + h.ht.mva + ' MVA ' + h.ht.ratio + ' (' + h.ht.lab + ')' + (h.ht.split ? ' | windings ' + h.ht.w1 + ' + ' + h.ht.w2 + ' MVA, uk ' + h.ht.uk + ' / ' + h.ht.uk2 + ' %' : ' | ONAN ' + h.ht.onan + ' / ONAF ' + h.ht.mva) + (h.ht.loadOut ? ' | ' + F(h.ht.loadOut) + ' % one out' : '')]);
          if (h.ht.mva > 300) steps.push(hmCheck(h.ht.mva));
          steps.push([['20 kV fault level (IEC 60909)', '20 kV短路电流（IEC 60909）'], F(h.ht.mva) + ' MVA ÷ ((' + F(h.ht.mva) + ' ÷ ' + F(h.mv.ssc150) + ' + ' + F(h.ht.uk, 1) + ' %) × √3 × 20 kV) × 1.05' + (c.R.el.hv.mv.ikGen ? ' + MV generators ' + F(c.R.el.hv.mv.ikGen, 1) + ' kA (closed transition)' : ''), F(h.mv.ikCalc + (c.R.el.hv.mv.ikGen || 0), 1) + ' kA → ' + ikB + ' kA']);
        }
        steps.push([['20 kV switchgear (IEC 62271-200)', '20 kV开关柜（IEC 62271-200）'], F(h.mv.sb) + ' MVA ÷ (√3 × 20 kV) = ' + F(h.mv.i) + ' A', h.mv.boards + ' × 24 kV | ' + F(h.mv.busA) + ' A | ' + ikB + ' kA' + (h.mv.gis ? ' | GIS' : '')]);
        /* 20 kV distribution (engine rule): ≤ 24 feeders per section fed directly, otherwise building 20 kV boards (main-tie-main, whole blocks ≤ 10 transformer feeders, ≤ 20 MVA) */
        var nTx = tb.t, gMV = c.R.el.genV === 'MV' ? c.R.el.genTotal : 0, perSec = (nTx + gMV) / Math.max(1, h.mv.boards), kva1 = lvk / Math.max(1, nTx);
        if (h.ht && perSec > 24) { var kB = Math.max(1, Math.floor(Math.min(10 / Math.max(1, tb.per), 20000 / (Math.max(1, tb.per) * kva1)))), nB = Math.ceil(tb.b / kB);
          steps.push([['Building 20 kV boards (campus scale)', '楼宇20 kV开关柜（园区规模）'], ['(' + nTx + ' TX' + (gMV ? ' + ' + gMV + ' MV gen.' : '') + ') ÷ ' + h.mv.boards + ' sections = ' + F(perSec, 1) + ' > 24 per section → whole blocks of ' + tb.per + ' units, ' + kB + ' per board (≤ 10 feeders, ≤ 20 MVA)', '（' + nTx + '台变压器' + (gMV ? '+' + gMV + '台中压发电机' : '') + '）÷ ' + h.mv.boards + '段 = ' + F(perSec, 1) + ' > 24回/段 → 每套带' + kB + '个完整模块（每模块' + tb.per + '台；≤10回，≤20 MVA）'],
            [nB + ' boards (main-tie-main) = ' + 2 * nB + ' substation feeders of 1,250 A', nB + '套（双进线+分段）= ' + 2 * nB + '回1,250 A变电站馈线']]);
          var sMV = mva / h.mv.boards, sI = sMV * 1000 / (1.732 * 20), bdI = (lvk / 1000 / Math.max(1, nB)) * 1000 / (1.732 * 20);
          steps.push([['20 kV section → 1,250 A feeders', '20 kV母线段→1,250 A馈线'], [F(sMV, 1) + ' MVA per section = ' + F(sI) + ' A on a ' + F(h.mv.busA) + ' A incomer | ' + F(2 * nB / h.mv.boards, 1) + ' feeders of 1,250 A (43.3 MVA each) per section', '每段' + F(sMV, 1) + ' MVA = ' + F(sI) + ' A，进线' + F(h.mv.busA) + ' A | 每段' + F(2 * nB / h.mv.boards, 1) + '回1,250 A馈线（每回43.3 MVA）'], [F(bdI / 2) + ' A per feeder, ' + F(bdI) + ' A when its partner feeder is out', '每回' + F(bdI / 2) + ' A，对侧馈线退出时' + F(bdI) + ' A']]); }
        else steps.push([['20 kV feeders per section', '每段20 kV馈线'], ['(' + nTx + ' TX' + (gMV ? ' + ' + gMV + ' MV gen.' : '') + ') ÷ ' + h.mv.boards + ' section(s)', '（' + nTx + '台变压器' + (gMV ? '+' + gMV + '台中压发电机' : '') + '）÷ ' + h.mv.boards + '段'], [F(perSec, 1) + ' ≤ 24 → fed directly from the sections', F(perSec, 1) + ' ≤ 24 → 由母线段直接供电']]);
        steps.push([['MV/LV transformers (Tier ' + roman(t) + (c.R.el.chTx ? ', LV load — chillers on 6.6 kV' : '') + ')', '中/低压变压器（Tier ' + roman(t) + (c.R.el.chTx ? '，低压负荷——冷机采用6.6 kV' : '') + '）'], ['⌈' + F(lvk) + ' ÷ (' + F(size) + ' × ' + F(ld, 2) + ')⌉ = ' + n + ' duty, arranged as ' + tb.lab, '⌈' + F(lvk) + ' ÷ (' + F(size) + ' × ' + F(ld, 2) + ')⌉ = ' + n + '台工作，配置为' + tb.lab], F(tb.t) + ' × ' + F(size) + ' kVA = ' + tb.lab + (c.R.el.chTx ? ' + ' + c.R.el.chTx.total + ' × ' + F(c.R.el.chTx.kva) + ' kVA 20/6.6 kV' : '')]);
        steps.push([['PLN tariff | lead time | indicative cost', 'PLN电价 | 工期 | 参考投资'], h.kv >= 70 ? 'I-4 TT / TET' : 'B-3 / I-3 TM', 'Rp ' + F(h.kv >= 70 ? DB.idTariffs[2].eff : DB.idTariffs[0].eff, 1) + '/kWh | ≈ ' + h.lead + ' mo | ' + usd(h.cost)]);
        return steps;
      } },
    tx: { i: [['kva', ['Maximum demand', '最大需量'], 'kVA', 10, 1000000, 10, function (c) { return Math.round(c.R.el.demandKVA); }], tierIn(),
      ['lv', ['LV system voltage (IEC 60038)', '低压系统电压（IEC 60038）'], '', 1, 4, 1, function (c) { return Math.max(1, LVV.indexOf(c.R.el.lvV || 400) + 1); }, LVO],
      ['ld', ['Loading limit', '负载率上限'], '%', 50, 100, 1, function (c) { return Math.round(c.R.el.txLoad * 100); }],
      ['size', ['MV/LV transformer rating (20 kV / LV)', '中/低压变压器容量（20 kV/低压）'], 'kVA', 100, 6300, 5, function (c) { return c.R.el.txSize; }],
      ['hm', ['HV/MV transformer rating feeding the 20 kV boards (e.g. 60 MVA = 60,000 kVA)', '供20 kV母线的高压/中压主变容量（如60 MVA=60,000 kVA）'], 'MVA', 10, 500, 1, function (c) { var h = c.R.el.hv; return h.ht ? h.ht.mva : 60; }],
      ['uk', ['Impedance uk', '短路阻抗uk'], '%', 4, 8, .5, function (c) { return c.R.el.lv.uk; }],
      ['chv', ['Chillers on MV (6.6 kV)', '冷机采用中压（6.6 kV）'], '', 0, 1, 1, function (c) { return c.R.el.chV === 'MV' ? 1 : 0; }, [[0, ['No — chillers on the LV system', '否——冷机接低压系统']], [1, ['Yes — 6.6 kV via 20/6.6 kV transformers', '是——经20/6.6 kV变压器供6.6 kV']]]],
      ['arch', ['Redundancy configuration', '冗余配置'], '', 1, 3, 1, function (c) { return ({ N1: 1, DR: 2, '2N': 3 })[c.R.el.txArch] || 1; }, [[1, ['N+1 — one reserve transformer per block', 'N+1——每个模块一台备用变压器']], [2, ['3N/2 — any two of three carry the load', '3N/2——三台中任意两台可带全部负荷']], [3, ['2N — A / B', '2N——A/B']]]]],
      a: { lv: { b: B.lv, f: function () { return 1; } }, size: { b: B.txSize, f: function (v) { return txSize(v.kva, v.ld, LVV[Math.round(v.lv) - 1]); } }, uk: { b: B.uk, f: function (v) { return ukRule(v.size); } },
        hm: { b: B.hm, f: function (v, c) { var h = conn(v.kva / 1000, T(v), chg(c, 'hvKV'), 0, c); return h.ht ? h.ht.rule : 60; } },
        arch: { b: B.arch, f: function (v) { return T(v) >= 4 ? 3 : 1; } }, chv: { b: B.chv, f: function (v, c) { return c.R.el.chVRule === 'MV' ? 1 : 0; } } },
      b: { kva: { k: 'mdKVA' }, tier: { k: 'tier' }, lv: { k: 'lvV', map: [[1, 400], [2, 415], [3, 480], [4, 690]] }, ld: { k: 'txLoad' }, size: { k: 'txKVA' }, hm: { k: 'htMVA' }, uk: { k: 'txUk' }, arch: { k: 'txArch', map: [[1, 'N1'], [2, 'DR'], [3, '2N']] }, chv: { k: 'chV', map: [[0, 'LV'], [1, 'MV']] } },
      f: function (v, c) {
        var t = T(v), arch = ['N1', 'DR', '2N'][Math.round(v.arch) - 1] || 'N1', el0 = c.R.el, chOn = Math.round(v.chv) === 1 && el0.chKWe > 0, vv = LVV[Math.round(v.lv) - 1] || 400, mx = lvMax(vv);
        var chk = chOn ? v.kva * (el0.chKWe / 0.95) / Math.max(1, el0.demandKVA) : 0, lvk = Math.max(0.3 * v.kva, v.kva - chk), itShare = Math.min(1, el0.itKVA / Math.max(1, el0.demandKVA) * v.kva / Math.max(1, lvk));
        var cn = chOn ? Math.max(1, Math.ceil(chk / 8000)) : 0, cs = chOn ? pick([2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000], chk / (cn * 0.8)) : 0, cr = chOn ? (t >= 4 ? cn : (t >= 2 ? 1 : 0)) : 0;
        function count(sz, ar) { return E.txBlocks(Math.ceil(lvk / (sz * v.ld / 100)), ar, t); }
        function iOf(sz, u) { return sz * 1000 / (1.732 * u); }
        var k = count(v.size, arch), n = k.n, tot = k.t, duty = arch === 'N1' && t >= 3 && k.per > 1 ? k.b * (k.per - 1) : (arch === '2N' ? n : tot);
        var iFL = iOf(v.size, vv), acb = pick(ACB, iFL), ik = iFL / (v.uk / 100) / 1000, icw = pick([50, 65, 80, 100], ik), ld0 = lvk / (duty * v.size) * 100;
        var fail = arch === '2N' ? [['the other side carries the whole load', '另一侧承担全部负荷'], [F(Math.min(200, ld0 * 2)) + ' % of one side', '单侧' + F(Math.min(200, ld0 * 2)) + '%']]
          : (arch === 'DR' ? [['the two other units of the group share its load', '同组另两台分担其负荷'], [F(ld0 * 1.5) + ' %' + (ld0 * 1.5 > 100 ? ' ✗' : ' ✓'), F(ld0 * 1.5) + '%' + (ld0 * 1.5 > 100 ? ' ✗' : ' ✓')]]
          : (t >= 3 ? [['the block reserve (catcher) takes over the failed unit\'s switchboard through an interlocked tie', '模块备用变压器经联锁联络开关接管故障变压器的配电柜'], [F(ld0) + ' % — unchanged ✓', F(ld0) + '%——不变 ✓']] : [['no reserve below Tier III', 'Tier III以下无备用'], ['–', '–']]));
        var h = conn(v.kva / 1000, t, chg(c, 'hvKV'), v.hm, c), mp = E.mvPlan(c.R), db = c.R.el.mvdb, mv = c.R.el.hv.mv;
        var rows = [[['LV system', '低压系统'], [LVL[vv] + ' — ' + LVN[vv][0], LVL[vv] + '——' + LVN[vv][1]], ['largest economic unit ' + F(mx) + ' kVA (≤ 5,000 A)', '最大经济单台' + F(mx) + ' kVA（≤5,000 A）']],
          [['Chiller compressors on 6.6 kV (design day)', '6.6 kV冷机压缩机（设计日）'], el0.chKWe > 0 ? ['chilled-water load ÷ COP ' + F(el0.chCopD, 2) + ' = ' + F(el0.chKWe) + ' kW ÷ 0.95', '冷冻水负荷÷COP ' + F(el0.chCopD, 2) + ' = ' + F(el0.chKWe) + ' kW ÷ 0.95'] : ['no water-cooled chiller plant', '无水冷冷站'],
            chOn ? [F(chk) + ' kVA → ' + (cn + cr) + ' × ' + F(cs) + ' kVA 20/6.6 kV (' + cn + ' + ' + cr + ')', F(chk) + ' kVA→' + (cn + cr) + '×' + F(cs) + ' kVA 20/6.6 kV（' + cn + '+' + cr + '）'] : ['on the LV system (included below)', '接低压系统（计入下方）']],
          [['LV load', '低压负荷'], [(chOn ? 'maximum demand − 6.6 kV chillers' : 'maximum demand') + ' — IT through UPS ≈ ' + F(itShare * 100) + ' %, the rest cooling and building', (chOn ? '最大需量−6.6 kV冷机' : '最大需量') + '——IT经UPS约' + F(itShare * 100) + '%，其余为制冷及建筑'], F(lvk) + ' kVA'],
          [['How the load is distributed', '负荷如何分配'], ['each transformer feeds one LV main switchboard; its busbar distributes the load to UPS, mechanical and building feeders — loads are not assigned one per transformer', '每台变压器供一面低压总配电柜，其母线向UPS、机械及建筑馈线分配负荷——负荷并非按一台变压器一路分配'], ['1 main switchboard per transformer', '每台变压器1面总配电柜']],
          [['Duty transformers', '工作变压器'], '⌈' + F(lvk) + ' ÷ (' + F(v.size) + ' × ' + F(v.ld / 100, 2) + ')⌉', F(n)],
          [['Configuration', '配置'], (function () { var rl = t >= 4 ? '2N' : (t >= 3 ? 'N+1' : 'N'); return arch === (t >= 4 ? '2N' : 'N1') ? ['design criterion for Tier ' + roman(t) + ': ' + rl + ' — change it in “Redundancy configuration”', 'Tier ' + roman(t) + '设计准则：' + rl + '——可在“冗余配置”中修改'] : ['selected manually; the design criterion for Tier ' + roman(t) + ' is ' + rl, '手动选择；Tier ' + roman(t) + '设计准则为' + rl]; })(), cfgTxt(k, arch, t)],
          [['Installed', '安装'], F(tot) + ' × ' + F(v.size) + ' kVA', F(tot * v.size / 1000, 1) + ' MVA'],
          [['Loading of each duty unit', '每台工作变压器负载率'], F(lvk) + ' ÷ (' + F(duty) + ' × ' + F(v.size) + ')', F(ld0) + ' %'],
          [['On a transformer failure', '一台变压器故障时'], fail[0], fail[1]],
          [['LV main switchboard per transformer', '每台变压器的低压总配电柜'], F(v.size) + ' kVA ÷ (√3 × ' + vv + ' V) → IEC 60947-2 / 61439-2', iFL > 6300 ? [F(iFL) + ' A ✗ — above 6,300 A: a higher LV voltage or a smaller unit', F(iFL) + ' A ✗——超过6,300 A：提高低压电压或减小单台容量'] : [F(iFL) + ' A → ACB and busbar ' + F(acb) + ' A' + (iFL > 5000 ? ' (6,300 A frame)' : ''), F(iFL) + ' A → 框架断路器及母线' + F(acb) + ' A' + (iFL > 5000 ? '（6,300 A框架）' : '')]],
          [['LV fault level', '低压短路电流'], F(iFL) + ' A ÷ ' + F(v.uk, 1) + ' %', ik > 100 ? F(ik, 1) + ' kA ✗ (> 100 kA)' : F(ik, 1) + ' kA → ' + icw + ' kA switchboard']];
        var opts = [[2500, vv], [3150, vv], [4000, vv], [4000, 480], [5000, 690], [6300, 690]].filter(function (o, i, a) { return !(o[0] === v.size && o[1] === vv) && a.findIndex(function (q) { return q[0] === o[0] && q[1] === o[1]; }) === i; });
        opts.forEach(function (o) { var i1 = iOf(o[0], o[1]), ik1 = i1 / (ukRule(o[0]) / 100) / 1000, ok = i1 <= 5000 && ik1 <= 100, ko = count(o[0], arch);
          rows.push([['Option: ' + F(o[0]) + ' kVA at ' + LVL[o[1]], '方案：' + F(o[0]) + ' kVA，' + LVL[o[1]]], F(i1) + ' A | ' + F(ik1, 0) + ' kA ' + (ok ? '✓' : (i1 <= 6300 && ik1 <= 100 ? '△ 6,300 A frame' : '✗')),
            cfgTxt(ko, arch, t)]); });
        if (h.ht && v.hm > 300) rows.push(hmCheck(v.hm));
        rows.push([['PLN connection for this demand', '该需量对应的PLN接入'], F(v.kva / 1000, 1) + ' MVA → ' + h.name + (h.ht ? ' | ' + h.ht.total + ' × ' + h.ht.mva + ' MVA ' + h.ht.ratio + ' (' + h.ht.lab + ')' : ''), asmTxt(h)]);
        rows.push([['20 kV switchgear (design)', '20 kV开关柜（设计）'], [mv.boards + ' sections × ' + F(mv.busA) + ' A | ' + mv.ik + ' kA', mv.boards + '段 × ' + F(mv.busA) + ' A | ' + mv.ik + ' kA'], [mp.panels + ' panels: ' + mp.incomers + ' incomers, ' + mp.nF + ' feeders, ' + mp.spares + ' spares', mp.panels + '面：' + mp.incomers + '路进线、' + mp.nF + '回馈线、' + mp.spares + '面备用']]);
        rows.push(db ? [['Building 20 kV boards (design)', '楼宇20 kV开关柜（设计）'], [db.n + ' × (' + db.txPer + ' TX' + (db.genPer ? ' + ' + db.genPer + ' generators' : '') + '), 2 × 1,250 A incomers each', db.n + '套 ×（' + db.txPer + '台变压器' + (db.genPer ? '+' + db.genPer + '台发电机' : '') + '），每套2路1,250 A进线'], [db.panels + ' panels each', '每套' + db.panels + '面']]
          : [['Transformer feeders (design)', '变压器馈线（设计）'], ['on the 20 kV sections', '接于20 kV母线段'], [F(c.R.el.txTotal + (c.R.el.chTx ? c.R.el.chTx.total : 0)) + ' feeders', F(c.R.el.txTotal + (c.R.el.chTx ? c.R.el.chTx.total : 0)) + '回']]);
        return rows;
      } },
    fuel: { i: [['d', ['Maximum demand', '最大需量'], 'kW', 50, 1000000, 10, function (c) { return Math.round(c.R.el.demandKW); }], tierIn(),
      ['h', ['Fuel autonomy', '燃油自持'], 'h', 4, 120, 1, function (c) { return c.p.fuelH; }],
      ['q', ['Specific consumption', '比油耗'], 'L/kWh', .2, .35, .01, function (c) { return c.R.el.fuelQ; }],
      ['tank', ['Tank size', '储罐容量'], 'm³', 10, 200, 10, function (c) { return c.R.el.tankSize; }],
      ['gs', ['Generator rating (continuous)', '发电机容量（持续功率）'], 'kWe', 300, 3500, 1, function (c) { return c.R.el.genSize; }, GSO],
      ['gv', ['Generator voltage', '发电机电压'], '', 1, 2, 1, function (c) { return c.R.el.genV === 'MV' ? 2 : 1; }, [[1, ['LV sets with ATS', '低压机组+ATS']], [2, ['20 kV paralleled plant', '20 kV并机电站']]]]],
      a: { h: { b: B.fuelH, f: function (v, c) { var rel = gridRel(c); return Math.min(96, ({ 1: 12, 2: 24, 3: 24, 4: 48 })[T(v)] + (rel === 'med' ? 24 : (rel === 'low' ? 48 : 0))); } },
        tank: { b: B.tank, f: function (v) { var L = v.d * v.q * v.h; return L > 400000 ? 200 : (L > 100000 ? 100 : (L > 20000 ? 50 : 20)); } },
        gs: { b: B.gs, f: function (v) { return genSize(v.d); } }, gv: { b: B.gv, f: function (v) { return v.d > 6000 ? 2 : 1; } } },
      b: { d: { k: 'mdKVA', f: 1 / K.PF }, tier: { k: 'tier' }, h: { k: 'fuelH' }, q: { k: 'fuelQ' }, tank: { k: 'tankM3' }, gs: { k: 'genKW' }, gv: { k: 'genV', map: [[1, 'LV'], [2, 'MV']] } },
      f: function (v, c) {
        var t = T(v), lph = v.d * v.q, L = lph * v.h, tanks = Math.max(t >= 3 ? 2 : 1, Math.ceil(L / 1000 / v.tank)), trucks = Math.ceil(L / 16000);
        var gs = v.gs, gn = Math.ceil(v.d / (gs * K.GEN_LOAD)), gr = E.redundancy(t, gn, 'gen'), mv = Math.round(v.gv) === 2, gg = t === 3 && gr > 0 && c.R.el.genGrp > 1 ? c.R.el.genGrp : 1, gpg = gg > 1 ? Math.ceil(v.d / gg / (gs * K.GEN_LOAD)) : 0;
        if (gg > 1) { gn = gg * gpg; gr = gg; }
        return [[['Consumption at full load', '满载耗油'], F(v.d) + ' kW × ' + F(v.q, 2), F(lph) + ' L/h'],
          [['Fuel for the autonomy', '自持所需燃油'], F(lph) + ' × ' + F(v.h) + ' h', F(L / 1000, 1) + ' m³'],
          [['Bulk tanks', '主储油罐'], 'max(' + (t >= 3 ? 2 : 1) + ', ⌈' + F(L / 1000, 1) + ' ÷ ' + F(v.tank) + '⌉)', F(tanks) + ' × ' + F(v.tank) + ' m³'],
          [['Generators (continuous rating, ' + K.GEN_LOAD * 100 + ' %)', '发电机（持续功率，' + K.GEN_LOAD * 100 + '%）'], gg > 1 ? [gg + ' groups × (⌈' + F(v.d) + ' ÷ ' + gg + ' ÷ (' + F(gs) + ' × ' + K.GEN_LOAD + ')⌉ + 1 reserve); sets back each other only on a common bus', gg + '组 ×（⌈' + F(v.d) + ' ÷ ' + gg + ' ÷ (' + F(gs) + ' × ' + K.GEN_LOAD + ')⌉ + 1台备用）；机组仅在同一母线上互为备用'] : '⌈' + F(v.d) + ' ÷ (' + F(gs) + ' × ' + K.GEN_LOAD + ')⌉ + ' + gr, F(gn + gr) + ' × ' + F(gs) + ' kWe (' + (gg > 1 ? gg + ' × (' + gpg + '+1)' : E.redLabel(gn, gr, 'block')) + ')'],
          [['Generator voltage', '发电机电压'], v.d > 6000 ? ['> 6 MW: paralleled plant on the 20 kV board', '>6 MW：在20 kV母线并机'] : ['≤ 6 MW: 400 V sets with ATS', '≤6 MW：400 V机组+ATS'], mv ? ['20 kV paralleled plant', '20 kV并机电站'] : ['400 V (LV)', '400 V（低压）']],
          mv ? [['20 kV generator incomers', '20 kV发电机进线'], ['one breaker panel per set on the 20 kV board', '20 kV母线每台机组一面断路器柜'], [F(gn + gr) + ' panels', F(gn + gr) + '面']]
            : [['LV changeover', '低压切换'], ['one ATS per LV switchboard', '每段低压配电一台ATS'], [F(c.R.el.txTotal) + ' ATS', F(c.R.el.txTotal) + '台ATS']],
          [['Generator yard (≈ 75 m² per set)', '发电机场地（每台约75 m²）'], F(gn + gr) + ' × 75', F((gn + gr) * 75) + ' m²'],
          [['Refill by 16 kL tankers', '16 kL油罐车补油'], F(L / 1000, 1) + ' ÷ 16', [F(trucks) + ' trucks', F(trucks) + ' 车']]];
      } },
    batt: { i: [['kw', ['UPS system rating', 'UPS单系统容量'], 'kW', 100, 2000, 50, function (c) { return c.R.el.upsSize; }], ['n', ['Installed UPS systems', '安装UPS系统数'], ['units', '台'], 1, 4000, 1, function (c) { return c.R.el.upsTotal; }],
      ['chem', ['Battery chemistry', '电池类型'], '', 1, 2, 1, function (c) { return c.p.battery === 'VRLA' ? 2 : 1; }, [[1, ['Li-ion LFP', '磷酸铁锂']], [2, ['VRLA', '阀控铅酸']]]], tierIn(),
      ['m', ['Autonomy', '后备时间'], 'min', 1, 30, 1, function (c) { return c.p.upsMin; }], ['age', ['Ageing factor', '老化系数'], '', 1, 1.5, .05, function (c) { return c.R.el.battAge; }],
      ['eco', ['Operating mode', '运行模式'], '', 0, 1, 1, function (c) { return c.p.eco ? 1 : 0; }, [[0, ['Double conversion', '双变换']], [1, ['Eco-mode (high efficiency)', '节能模式（高效）']]]]],
      a: { m: { b: B.ups, f: function (v, c) { var li = Math.round(v.chem) !== 2, t = T(v); if (li && c.p.type === 'AI') return 5; return li ? (t === 4 ? 10 : 5) : (t === 4 ? 15 : 10); } },
        n: { b: B.n, f: function (v, c) { var ug = T(v) === 3 && c.R.el.upsGrp > 1 ? c.R.el.upsGrp : 1; if (ug > 1) return ug * Math.ceil(c.R.el.upsLoad / ug / (v.kw * K.UPS_LOAD)) + ug; var n = Math.ceil(c.R.el.upsLoad / (v.kw * K.UPS_LOAD)); return n + E.redundancy(T(v), n, 'ups'); } } },
      b: { kw: { k: 'upsKW' }, chem: { k: 'battery', map: [[1, 'LI'], [2, 'VRLA']] }, tier: { k: 'tier' }, m: { k: 'upsMin' }, age: { k: 'battAge' }, eco: { k: 'eco', map: [[0, false], [1, true]] } },
      f: function (v, c) {
        var li = Math.round(v.chem) !== 2, e1 = v.kw * v.m / 60, e2 = e1 * v.age / K.BATT_EFF, tot = e2 * v.n;
        var occ = (c.p.targetOcc || 90) / 100, ul = c.R.el.upsLoad, x = Math.min(1, Math.max(0.05, ul * occ / (v.n * v.kw))), eco = Math.round(v.eco) === 1, lf = (0.008 + 0.015 * x + 0.007 * x * x) / x * (eco ? 0.3 : 1);
        return [[['Energy at the inverter', '逆变器所需能量'], F(v.kw) + ' kW × ' + F(v.m) + ' ÷ 60', F(e1, 1) + ' kWh'],
          [['With ageing and DC losses', '计入老化及直流损耗'], F(e1, 1) + ' × ' + F(v.age, 2) + ' ÷ ' + K.BATT_EFF, F(e2, 1) + ' kWh'],
          [['Total battery energy', '电池总能量'], F(e2, 1) + ' × ' + F(v.n), F(tot) + ' kWh'],
          [['Bridging margin over generator start (15 s)', '相对发电机启动（15 s）的裕度'], F(v.m * 60) + ' s ÷ 15 s', '× ' + F(v.m * 60 / 15)],
          [['Battery room criteria', '电池室要求'], li ? 'NFPA 855 | UL 9540A' : 'IEC 62485-2', li ? ['off-gas detection, BMS, fire separation', '逸出气体探测、BMS、防火分隔'] : ['hydrogen ventilation, acid-resistant floor', '氢气通风、耐酸地面']],
          [['UPS loading at average utilisation', '平均利用率下UPS负载率'], F(ul) + ' kW × ' + F(occ * 100) + ' % ÷ (' + F(v.n) + ' × ' + F(v.kw) + ' kW)', F(x * 100) + ' %'],
          [['UPS losses at this loading (IEC 62040-3 curve)', '该负载率下UPS损耗（IEC 62040-3曲线）'], eco ? ['eco-mode ≈ 30 % of the double-conversion losses', '节能模式约为双变换损耗的30%'] : ['(0.8 % + 1.5 % | x + 0.7 % | x²) ÷ x', '(0.8% + 1.5%·x + 0.7%·x²) ÷ x'], F(lf * 100, 1) + ' % = ' + F(lf * ul * occ) + ' kW'],
          [['Electrical losses → PUE of the design', '电气损耗→设计PUE'], F(c.R.eff.elec, 3) + ' × IT', 'PUE ' + F(c.R.eff.pue, 3) + ' | ' + F(c.R.el.mva, 1) + ' MVA']];
      } },
    bwy: { i: [['nr', ['Racks per row', '每排机柜数'], '', 4, 40, 1, function (c) { return c.R.el.rackRow; }], ['rk', ['Rack design density', '机柜设计功率'], 'kW', 1, 400, 1, function (c) { return Math.round(c.R.cap.maxDens); }],
      ['row', ['IT load per row', '每排IT负载'], 'kW', 5, 8000, 5, function (c) { return Math.min(c.R.el.rackRow, Math.max(2, Math.floor(rowMax(c) / Math.max(1, Math.round(c.R.cap.maxDens))))) * Math.round(c.R.cap.maxDens); }]],
      a: { row: { b: B.row, f: function (v, c) { return Math.min(v.nr, Math.max(2, Math.floor(rowMax(c) / Math.max(1, v.rk)))) * v.rk; } } },
      b: { nr: { k: 'rackRow' }, rk: { k: function (c) { return c.R.cap.hdR > 0 && c.R.cap.hd >= c.R.cap.sd ? 'hdDens' : 'dens'; } } },
      f: function (v, c) {
        var bvv = bwV(c), RM = rowMax(c), nEff = Math.min(v.nr, Math.max(2, Math.floor(RM / Math.max(1, v.rk)))), I = v.row / (bvv * 1.732 * K.BW_F), bw = pick([160, 250, 400, 630, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000], I), Ir = v.rk / (bvv * 1.732 * K.BW_F);
        var rp2 = v.rk <= 7 ? '1-ph 32 A' : v.rk <= 22 ? '3-ph 32 A' : v.rk <= 43 ? '3-ph 63 A' : Math.ceil(v.rk / 43) + ' × 3-ph 63 A';
        return [[['Racks per row (≤ 2,500 A busway)', '每排机柜数（母线≤2,500 A）'], 'min(' + F(v.nr) + ', ⌊' + F(RM) + ' ÷ ' + F(v.rk) + '⌋)', nEff < v.nr ? [F(nEff) + ' — row shortened', F(nEff) + '——缩短该排'] : F(nEff)],
          [['Row current', '每排电流'], F(v.row) + ' ÷ (√3 × ' + bvv + ' × ' + K.BW_F + ')', F(I) + ' A'],
          [['Busway rating (each of A and B)', '母线额定（A、B各一）'], 'IEC 61439-6, next ≥ ' + F(I) + ' A', bw + ' A' + (I > 4000 ? ' — split the row' : '')],
          [['Rack current', '机柜电流'], F(v.rk) + ' ÷ (√3 × ' + bvv + ' × ' + K.BW_F + ')', F(Ir) + ' A'],
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
          [['Fire separation', '防火间距'], 'NFPA 855 | UL 9540A', ['≥ 3 m between units unless tests show no propagation', '单元间≥3 m（试验证明不蔓延者除外）']],
          [['Peak-shaving value', '削峰价值'], tt ? 'I-4 TT flat tariff' : 'TM peak / off-peak', tt ? ['none on a flat tariff', '统一电价下无削峰收益'] : ['yes — WBP peak window', '有——高峰时段']],
          [['Indicative CAPEX', '参考投资'], F(mwh * 1000) + ' kWh × USD ' + E.BESS_USD_KWH, usd(mwh * 1000 * E.BESS_USD_KWH)]];
      } },
    air: { i: [['nr', ['Air-cooled racks', '风冷机柜数'], '', 1, 200000, 1, function (c) { return Math.max(1, Math.round(c.R.cool.airKW / Math.max(1, c.R.cap.sd))); }], ['kw', ['Rack load', '机柜负载'], 'kW', 1, 80, .5, function (c) { return c.R.cap.sd; }],
      ['hall', ['Air-cooled heat in the hall', '机房风冷热负荷'], 'kW', 10, 5000000, 10, function (c) { return Math.max(1, Math.round(c.R.cool.airKW / Math.max(1, c.R.cap.sd))) * c.R.cap.sd; }],
      ['dt', ['Temperature rise across the servers', '服务器温升'], 'K', 6, 20, 1, function (c) { return c.R.me.cp ? c.R.me.cp.airDT : 12; }], tierIn()],
      a: { hall: { b: B.hall, f: function (v) { return v.nr * v.kw; } } },
      b: { kw: { k: 'dens' }, tier: { k: 'tier' }, dt: { k: 'airDT' } },
      f: function (v, c) {
        var q = v.kw / (1.2 * 1.006 * v.dt), qh = q * 3600, H = v.hall / (1.2 * 1.006 * v.dt) * 3600, cap = Math.round(K.FANWALL_KW * Math.min(1.6, Math.max(0.5, v.dt / 12)));
        var fw = Math.ceil(v.hall / cap), fr = E.redundancy(T(v), fw, 'term'), fan = v.hall / (1.2 * 1.006 * v.dt) * 400 / 0.65 / 1000;
        return [[['Airflow per rack', '单柜风量'], F(v.kw, 1) + ' ÷ (1.2 × 1.006 × ' + F(v.dt) + ')', F(q, 2) + ' m³/s'], [['Per hour', '每小时'], F(q, 2) + ' × 3,600', F(qh) + ' m³/h (' + F(qh * 0.5886) + ' CFM)'],
          [['Hall airflow', '机房总风量'], F(v.hall) + ' kW at ΔT ' + F(v.dt) + ' K', F(H) + ' m³/h'],
          [['Fan-wall capacity at this ΔT (fixed airflow)', '该温差下风墙能力（风量不变）'], K.FANWALL_KW + ' kW × ' + F(v.dt) + ' ÷ 12', F(cap) + ' kW'],
          [['Fan walls (Tier ' + roman(T(v)) + ')', '风墙（Tier ' + roman(T(v)) + '）'], '⌈' + F(v.hall) + ' ÷ ' + F(cap) + '⌉ + ' + fr, F(fw + fr) + ' (' + E.redLabel(fw, fr, 'term') + ')'],
          [['Fan power (400 Pa, efficiency 0.65)', '风机功率（400 Pa，效率0.65）'], F(H / 3600, 1) + ' m³/s × 400 Pa ÷ 0.65', F(fan) + ' kW'],
          [['Hot-aisle temperature (supply 24 °C, ASHRAE 18–27 °C)', '热通道温度（送风24 °C，ASHRAE 18–27 °C）'], '24 + ' + F(v.dt), F(24 + v.dt) + ' °C'],
          [['Effect on the design PUE', '对设计PUE的影响'], ['fans and chillers at this ΔT', '该温差下风机及冷机'], 'PUE ' + F(c.R.eff.pue, 3)]];
      } },
    chw: { i: [['q', ['Chilled-water load', '冷冻水负荷'], 'kW', 50, 5000000, 50, function (c) { return Math.round(c.R.me.chwLoad || c.R.cool.airKW); }], tierIn(),
      ['size', ['Chiller size', '单机容量'], 'kW', 300, 4000, 1, function (c) { return c.R.me.chSize || 1407; }], ['dt', ['Chilled-water ΔT', '冷冻水温差'], 'K', 4, 14, .5, function (c) { return c.R.me.chwDT || K.CHW_DT; }],
      ['tw', ['Chilled-water supply temperature', '冷冻水供水温度'], '°C', 6, 24, .5, function (c) { return c.R.me.cp ? c.R.me.cp.chws : E.COOLDEF.chws; }]],
      a: { size: { b: B.chSize, f: function (v, c) { var q = v.q; return c.R.cool.airTech === 'WCCH' ? (q >= 20000 ? 3517 : (q >= 6000 ? 2461 : 1407)) : (q >= 3000 ? 1000 : 500); } } },
      b: { tier: { k: 'tier' }, size: { k: 'chKW' }, dt: { k: 'chwDT' }, tw: { k: 'chws' } },
      f: function (v, c) {
        var t = T(v), n = Math.ceil(v.q / v.size), r = E.redundancy(t, n, 'plant'), fl = v.q / (4.186 * v.dt), dn = pick(DN, Math.sqrt(4 * fl / 1000 / (Math.PI * 2.4)) * 1000);
        var ac = c.R.cool.airTech === 'ACCH', cp0 = c.R.me.cp || E.COOLDEF, md = E.coolModel(ac ? 'ACCH' : 'WCCH', { chws: v.tw, chwDT: v.dt, airDT: cp0.airDT, twAppr: cp0.twAppr }, c.R.L, v.q, 0);
        return [[['Cooling capacity', '冷量'], F(v.q) + ' ÷ ' + K.RT_KW, F(v.q / K.RT_KW) + ' RT'], [['Duty chillers', '工作冷机'], '⌈' + F(v.q) + ' ÷ ' + F(v.size) + '⌉', F(n)],
          [['Installed (Tier ' + roman(t) + ')', '安装（Tier ' + roman(t) + '）'], E.redLabel(n, r), F(n + r) + ' × ' + F(v.size) + ' kW'], [['Chilled-water flow', '冷冻水流量'], F(v.q) + ' ÷ (4.186 × ' + F(v.dt, 1) + ')', F(fl) + ' L/s (' + F(fl * 3.6) + ' m³/h)'],
          [['Main header (≤ 2.4 m/s)', '主干管（≤2.4 m/s）'], '√(4 × ' + F(fl / 1000, 3) + ' ÷ (π × 2.4))', 'DN ' + dn],
          [['Heat at the cooling towers', '冷却塔散热量'], F(v.q) + ' × ' + K.REJ, F(v.q * K.REJ) + ' kW'],
          [['Chiller efficiency (average design-day conditions)', '冷机效率（设计日平均工况）'], [(ac ? 'air-cooled condensing ' : 'tower water ' + F(md.cws, 1) + ' °C → condensing ') + F(md.tcond, 1) + ' °C | evaporating ' + F(v.tw - 1.5, 1) + ' °C', (ac ? '风冷冷凝' : '冷却水' + F(md.cws, 1) + ' °C → 冷凝') + F(md.tcond, 1) + ' °C | 蒸发' + F(v.tw - 1.5, 1) + ' °C'], 'COP ' + F(md.cop, 2)],
          [['Chiller power', '冷机功率'], F(v.q) + ' ÷ ' + F(md.cop, 2) + (md.free > 0 ? ' × (1 − 0.8 × ' + F(md.free * 100) + ' % free cooling)' : ''), F(md.chiller) + ' kW'],
          [['Chilled-water pumps (250 kPa, efficiency 0.7)', '冷冻水泵（250 kPa，效率0.7）'], F(fl) + ' L/s × 250 kPa ÷ 0.7', F(md.chwPump) + ' kW'],
          [['Effect on the design PUE', '对设计PUE的影响'], ['cooling ' + F(c.R.eff.mech, 3) + ' × IT', '制冷 ' + F(c.R.eff.mech, 3) + ' × IT'], 'PUE ' + F(c.R.eff.pue, 3)]];
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
      ['heat', ['Heat to the towers', '冷却塔散热量'], 'kW', 0, 10000000, 50, function (c) { return Math.round(c.R.me.rejKW || c.R.cap.itKW * K.REJ); }], ['coc', ['Cycles of concentration', '浓缩倍数'], '', 2, 10, .5, function (c) { return c.p.coc > 1 ? c.p.coc : 5; }],
      ['ap', ['Cooling-tower approach', '冷却塔逼近度'], 'K', 2, 8, .5, function (c) { return c.R.me.cp ? c.R.me.cp.twAppr : E.COOLDEF.twAppr; }]],
      a: { heat: { b: B.heat, f: function (v, c) { return v.it * (c.R.me.rejKW ? c.R.me.rejKW / c.R.cap.itKW : K.REJ); } } },
      b: { it: { k: 'itMW', f: 0.001 }, occ: { k: 'targetOcc' }, coc: { k: 'coc' }, ap: { k: 'twAppr' } },
      f: function (v, c) {
        var rows = OLD.wue.f(v, c), wb = c.R.L.wb;
        rows.push([['Tower leaving water (design wet-bulb ' + wb + ' °C)', '冷却塔出水（设计湿球' + wb + ' °C）'], wb + ' + ' + F(v.ap, 1) + ' K', F(wb + v.ap, 1) + ' °C']);
        rows.push([['Tower fan power (≈ 0.95 % of heat × 4 ÷ approach)', '冷却塔风机功率（约0.95%×散热量×4÷逼近度）'], F(v.heat) + ' × 0.0095 × 4 ÷ ' + F(v.ap, 1), F(v.heat * 0.0095 * 4 / v.ap) + ' kW']);
        rows.push([['Effect on the design PUE', '对设计PUE的影响'], ['warmer tower water → higher chiller lift', '冷却水温升高→冷机压比增大'], 'PUE ' + F(c.R.eff.pue, 3)]);
        return rows;
      } },
    flow: Object.assign({}, OLD.flow, { i: [['kw', ['Rack power', '机柜功率'], 'kW', 10, 400, 1, function (c) { return c.R.cap.hd || c.R.hdP.kw; }], ['liq', ['Share to liquid', '液冷占比'], '%', 50, 100, 1, function (c) { return Math.round((c.p.liqSh > 0 ? c.p.liqSh / 100 : (c.R.hdP.liq || .85)) * 100); }],
      ['dt', ['Coolant temperature rise', '冷却液温升'], 'K', 4, 20, 1, function () { return 10; }]], b: { kw: { k: 'hdDens' }, liq: { k: 'liqSh' } } }),
    cdu: { i: [['q', ['Heat to liquid', '液冷热量'], 'kW', 100, 5000000, 100, function (c) { return Math.round(c.R.cool.liquidKW || 5000); }], ['size', ['CDU capacity', 'CDU容量'], 'kW', 200, 2500, 50, function (c) { return c.R.me.cduSize || 1500; }],
      ['dt', ['Facility-water ΔT', '设施水温差'], 'K', 4, 15, .5, function () { return 8; }]],
      a: { size: { b: B.cdu, f: function (v) { return v.q >= 3000 ? 1500 : 800; } } },
      b: { size: { k: 'cduKW' } },
      f: OLD.cdu.f },
    gimp: { i: [['ik', ['Fault level at the connection point', '接入点短路电流'], 'kA', 5, 80, .5, function (c) { return c.R.el.hv.pccIk; }],
      ['ahf', ['Active harmonic filters on drives', '驱动负荷有源滤波器'], '', 0, 2, 1, function (c) { return c.p.ahf === true ? 1 : (c.p.ahf === false ? 0 : 2); }, [[2, ['By the harmonic estimate (rule)', '按谐波估算（规则）']], [1, ['Yes', '是']], [0, ['No', '否']]]],
      ['sw', ['AI load swing (share of AI load)', 'AI负荷波动（占AI负荷）'], '%', 0, 100, 5, function (c) { return c.R.gimp ? c.R.gimp.swing : 0; }],
      ['vt', ['Drive front end (current distortion)', '变频驱动整流方式（电流畸变）'], '%', 5, 35, 1, function (c) { return c.R.gimp ? c.R.gimp.vt : 35; }, g.DCConnect.VFD_O],
      ['ut', ['UPS / IT front end (current distortion)', 'UPS/IT整流方式（电流畸变）'], '%', 2, 30, 1, function (c) { return c.R.gimp ? c.R.gimp.ut : 3; }, g.DCConnect.UPS_O],
      ['km', ['HV cable route length (each circuit)', '高压电缆路径长度（每回）'], 'km', 0, 60, .1, function (c) { return c.R.gimp ? c.R.gimp.km : 5; }]],
      a: { ik: { b: B.ik, f: function (v, c) { return c.R.el.hv.pccRule; } } },
      b: { ik: { k: 'ikPCC' }, ahf: { k: 'ahf', map: [[2, null], [1, true], [0, false]] }, sw: { k: 'aiSwing' }, vt: { k: 'vfdThd' }, ut: { k: 'upsThd' }, km: { k: 'hvKm' } },
      f: function (v, c) {
        var el = c.R.el, hv = el.hv, S = el.mva, kv = hv.kv, hv2 = Object.assign({}, hv, { pccIk: v.ik, ssc: 1.732 * kv * v.ik });
        var gi = E.gridImpact({ ahf: [false, true, undefined][Math.round(v.ahf)], aiSwing: v.sw, vfdThd: v.vt, upsThd: v.ut, hvKm: v.km }, Object.assign({}, c.R, { el: Object.assign({}, el, { hv: hv2 }) }));
        function ok(b) { return b ? ' ✓' : ' ✗'; }
        return [[['Short-circuit power at the connection point', '接入点短路容量'], '√3 × ' + kv + ' kV × ' + F(v.ik, 1) + ' kA', F(gi.ssc) + ' MVA'],
          [['Short-circuit ratio Isc/IL', '短路比Isc/IL'], F(gi.ssc) + ' ÷ ' + F(S, 1) + ' MVA', F(gi.scr) + (gi.scr < 20 ? ' — low' : '')],
          [['Harmonic current limit (Grid Code, ' + E.kvName(kv) + ')', '谐波电流限值（电网规范，' + E.kvName(kv) + '）'], ['TDD table by Isc/IL and voltage', '按Isc/IL及电压查TDD表'], '≤ ' + F(gi.tddLimit, 1) + ' % TDD'],
          [['Estimated harmonic current', '估算谐波电流'], ['UPS ' + F(gi.upsShare * 100) + ' % of demand × ' + F(gi.ut) + ' % + drives ' + F(gi.drvShare * 100) + ' % × ' + (gi.ahf ? F(Math.min(gi.vt, 5)) + ' % (active filters)' : F(gi.vt) + ' %'), 'UPS占需量' + F(gi.upsShare * 100) + '% × ' + F(gi.ut) + '% + 变频驱动' + F(gi.drvShare * 100) + '% × ' + (gi.ahf ? F(Math.min(gi.vt, 5)) + '%（有源滤波）' : F(gi.vt) + '%')],
            gi.still ? [F(gi.tdd, 1) + ' % ✗ → ' + (gi.upsFix ? 'AFE UPS or UPS input filters' : 'central active filtering or a stronger connection'), F(gi.tdd, 1) + '% ✗ → ' + (gi.upsFix ? '有源前端UPS或UPS输入滤波器' : '集中有源滤波或更强的接入点')] : F(gi.tdd, 1) + ' % ✓'],
          [['Voltage distortion THDv', '电压畸变THDv'], F(S, 1) + ' ÷ ' + F(gi.ssc) + ' × (' + F(gi.upsShare, 2) + ' × ' + F(gi.ut) + ' % × ' + E.hEff(gi.ut) + ' + ' + F(gi.drvShare, 2) + ' × ' + F(gi.ahf ? Math.min(gi.vt, 5) : gi.vt) + ' % × ' + E.hEff(gi.ahf ? Math.min(gi.vt, 5) : gi.vt) + ')', F(gi.thdv, 2) + ' % / ' + gi.thdLim[1] + ' %' + ok(gi.thdv <= gi.thdLim[1])],
          [['HV cable charging (U² ω C × length × circuits)', '高压电缆充电功率（U²ωC×长度×回路）'], kv > 20 ? kv + '² × 2π50 × ' + gi.cC + ' µF/km × ' + F(gi.km, 1) + ' km × ' + gi.circ : '–', kv > 20 ? F(gi.qc, 1) + ' MVAr | ' + F(gi.icKm * gi.km) + ' A per circuit' : ['20 kV: PLN feeder', '20 kV：PLN馈线']],
          [['Parallel resonance order h_r = √(Ssc ÷ Qc)', '并联谐振次数h_r = √(Ssc÷Qc)'], gi.qc > 0 ? '√(' + F(gi.ssc) + ' ÷ ' + F(gi.qc, 1) + ')' : '–', gi.qc > 0 ? (gi.hrNear.length ? ['h ≈ ' + F(gi.hr, 1) + ' ✗ near the ' + gi.hrNear.join(' / ') + 'th — frequency scan, detuned filters', 'h≈' + F(gi.hr, 1) + ' ✗ 接近' + gi.hrNear.join('/') + '次——频率扫描、调谐滤波器'] : 'h ≈ ' + F(gi.hr, 1) + ' ✓') : '–'],
          [['Power factor at 25 % load (early phase) with the cable charging', '25%负荷（初期）计入电缆充电的功率因数'], gi.qc > 0 ? 'P ' + F(gi.pL, 1) + ' MW, Q ' + F(gi.qL, 1) + ' − ' + F(gi.qc, 1) + ' MVAr' : '–', gi.qc > 0 ? (gi.reactor > 0 ? ['PF ' + F(gi.pfLight, 2) + ' leading ✗ → shunt reactor ≈ ' + F(gi.reactor, 1) + ' MVAr', '功率因数超前' + F(gi.pfLight, 2) + ' ✗→并联电抗器约' + F(gi.reactor, 1) + ' MVAr'] : ['PF ' + F(gi.pfLight, 2) + (gi.lead ? ' leading' : ' lagging') + ' ✓', '功率因数' + (gi.lead ? '超前' : '滞后') + F(gi.pfLight, 2) + ' ✓']) : '–'],
          [['Voltage step from the AI load swing', 'AI负荷波动引起的电压阶跃'], F(gi.aiKW / 1000, 1) + ' MW × ' + F(gi.swing) + ' % ÷ (' + K.PF + ' × ' + F(gi.ssc) + ' MVA)', F(gi.dvAi, 2) + ' % / 2 %' + ok(gi.dvAi <= 2)],
          [['Loss of the whole load (UPS to battery in a grid fault)', '全部负荷失去（电网故障时UPS转电池）'], F(S, 1) + ' ÷ ' + F(gi.ssc) + ' MVA', [F(gi.dvLoss, 1) + ' % | re-transfer in blocks ≤ ' + F(gi.blk3) + ' MVA (3 %)', F(gi.dvLoss, 1) + '% | 分块回切每块≤' + F(gi.blk3) + ' MVA（3%）']],
          [['Power factor at the connection point', '接入点功率因数'], ['Grid Code: 0.9 lagging – 0.9 leading', '电网规范：滞后0.9至超前0.9'], '≈ ' + F(gi.pfEst, 2) + ' | Q ≈ ' + F(gi.q, 1) + ' MVAr'],
          [['Fault clearing by PLN protection', 'PLN保护故障切除'], [E.kvName(kv) + ' main protection', E.kvName(kv) + '主保护'], gi.clearMs ? '≤ ' + gi.clearMs + ' ms' : ['20 kV: OCR incoming ≤ 1 s, feeders ≤ 0.7 s', '20 kV：进线过流≤1 s，馈线≤0.7 s']],
          [['Large-load class (NERC / ERCOT practice)', '大负荷类别（NERC/ERCOT惯例）'], F(gi.lossMW) + ' MW UPS-fed', LLC[gi.llc]],
          [['Connection studies and timeline', '接入研究与时间'], [gi.studies.length + ' studies (Grid Code CC 5.1)', gi.studies.length + '项研究（电网规范CC 5.1）'], ['≈ ' + gi.months + ' months | PLN reply ≤ 30 days', '约' + gi.months + '个月 | PLN 30天内答复']]];
      } },
    appr: OLD.appr,
    floor: { i: OLD.floor.i,
      f: function (v, c) {
        var rows = OLD.floor.f(v, c), need = v.kg >= 1300 ? 25 : (v.kg >= 1000 ? 20 : 15);
        rows.push([['Design live load for this rack (rule)', '该机柜对应设计活荷载（规则）'], 'SNI 1727:2020 + DC practice', '≥ ' + need + ' kN/m²']);
        return rows;
      } },
    space: Object.assign({}, OLD.space, {
      i: OLD.space.i.concat([['rf', ['Raised floor', '架空地板'], '', 0, 1, 1, function (c) { return c.R.sp.raised ? 1 : 0; }, [[1, ['Yes', '是']], [0, ['No (slab + overhead services)', '否（结构楼板+上走线）']]]]]),
      b: { racks: { k: 'racks' }, fl: { k: 'floors' }, kdb: { k: 'kdb' }, rf: { k: 'raised', map: [[1, 'YES'], [0, 'NO']] } },
      f: function (v, c) { var rows = OLD.space.f(v, c); rows.push([['Clear height', '净高'], Math.round(v.rf) ? ['raised floor', '架空地板'] : ['slab floor', '结构楼板'], [c.R.sp.clearH, c.R.sp.clearHzh]]); return rows; } }),
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
          [['Discharge time | hold time', '喷放时间 | 浸渍时间'], 'NFPA 2001 | door-fan test', '≤ 10 s | ≥ 10 min']];
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
