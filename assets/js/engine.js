/* Data Center Project Assessment — calculation engine (v2, Indonesia)
 * Pure functions: assess(resolvedInput) -> result. No DOM access; runs in the browser and in Node.
 * The proposal layer (propose.js) fills every parameter the owner has not set manually,
 * then calls assess(). Coefficients are planning-stage rules of thumb (±25–30%).
 * Text is returned as [en, zh] pairs. Money inside the engine is USD. */
(function (g) {
  'use strict';
  var DB = g.DCDB;

  /* ----------------------------------------------------------- helpers */
  function find(arr, id) { if (!arr) return null; for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ceil(v) { return Math.ceil(v - 1e-9); }
  function pick(list, v) { for (var i = 0; i < list.length; i++) if (list[i] >= v) return list[i]; return list[list.length - 1]; }
  function num(v, d) { v = parseFloat(v); return isFinite(v) ? v : d; }
  function fmt(v, d) {
    if (v === null || v === undefined || !isFinite(v)) return '–';
    return Number(v).toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  }

  /* ------------------------------------------------- model coefficients */
  /* annualised mechanical (cooling) energy per unit of IT energy, by climate class */
  var MECH = {
    DX:   { TROP: 0.60, HIGH: 0.50, TDRY: 0.58 },
    ACCH: { TROP: 0.42, HIGH: 0.32, TDRY: 0.40 },
    WCCH: { TROP: 0.30, HIGH: 0.23, TDRY: 0.28 },
    IEC:  { TROP: 0.33, HIGH: 0.20, TDRY: 0.24 }
  };
  /* liquid loops (CDU pumps + warm-water heat rejection), per unit of liquid heat */
  var LIQ = { DLC: { TROP: 0.10, HIGH: 0.07, TDRY: 0.09 }, IMM: { TROP: 0.065, HIGH: 0.05, TDRY: 0.06 } };
  /* water usage effectiveness, L per kWh IT */
  var WUE = {
    DX: { TROP: 0.05, HIGH: 0.05, TDRY: 0.05 }, ACCH: { TROP: 0.05, HIGH: 0.05, TDRY: 0.05 },
    WCCH: { TROP: 1.90, HIGH: 1.50, TDRY: 2.00 }, IEC: { TROP: 1.00, HIGH: 0.60, TDRY: 0.80 },
    LIQ: { TROP: 0.35, HIGH: 0.20, TDRY: 0.35 }
  };
  var PEAK = { TROP: 1.2, HIGH: 1.35, TDRY: 1.3 };
  var ELEC = { 1: 0.060, 2: 0.065, 3: 0.070, 4: 0.085 };
  var TIER_CAPEX = { 1: 0.62, 2: 0.78, 3: 1.0, 4: 1.28 };
  var COOL_CAPEX = { DX: 0.95, ACCH: 0.97, WCCH: 1.0, IEC: 1.03, DLC: 1.08, IMM: 1.10 };
  var ID_CAPEX = 10.5;          /* USD M per MW IT, Tier III, Greater Jakarta, 10–30 MW (shell + MEP) */
  /* sizing constants shared with the technology-card calculators (assets/js/techcard.js reads DCEngine.K) */
  var K = {
    PF: 0.95,              /* facility power factor (kVA = kW / PF) */
    TX_LOAD: 0.85,         /* transformer loading limit */
    GEN_LOAD: 0.95,        /* generator loading limit (continuous rating) */
    UPS_LOAD: 0.9,         /* UPS module loading limit */
    UPS_LOSS: 0.05,        /* UPS losses + battery recharge, share of UPS load */
    FUEL_L_KWH: 0.27,      /* diesel consumption, L per kWh generated */
    BATT_AGE: 1.25,        /* battery end-of-life / ageing factor */
    BATT_EFF: 0.95,        /* inverter / DC efficiency for battery sizing */
    BW_V: 0.4, BW_F: 0.8,  /* busway: 400 V, 80 % loading */
    CHW_DT: 8,             /* chilled-water ΔT (K) used for thermal storage */
    TES_S: 600,            /* thermal storage ride-through (s) */
    CP_W: 4186,            /* water specific heat (J/kg·K) */
    RT_KW: 3.517,          /* 1 refrigeration ton = 3.517 kW */
    REJ: 1.18,             /* heat rejected at towers per kW of chilled-water load (incl. compressor heat) */
    AGENT_KG_M3: 0.592,    /* HFC-227ea at ≈ 7.5 % design concentration, 20 °C (NFPA 2001 flooding factor) */
    ASD_M2: 1500,          /* white space per aspirating detector */
    CDU_N_PER_R: 4,        /* one standby CDU per four duty units */
    DC_KW: 1500, CRAH_KW: 150, FANWALL_KW: 400, INROW_KW: 50, IEC_KW: 400, BESS_MWH_BOX: 5,
    MECH: MECH, LIQ: LIQ, WUE: WUE, PEAK: PEAK, ELEC: ELEC
  };
  var BESS_USD_KWH = 280;       /* installed LFP BESS incl. PCS, indicative 2026 */
  var BREAKDOWN = [
    ['EL', 'Electrical systems', '电气系统', 0.42], ['ME', 'Mechanical / cooling', '暖通/制冷', 0.20],
    ['CS', 'Civil, structural & architectural', '土建、结构与建筑', 0.18], ['FS', 'Fire protection & security', '消防与安防', 0.04],
    ['IT', 'IT infrastructure (racks, containment, cabling)', 'IT基础设施（机柜、封闭、布线）', 0.04], ['MC', 'BMS / EPMS / DCIM', 'BMS/EPMS/DCIM', 0.02],
    ['SW', 'Site works & external', '场地及室外工程', 0.04], ['SF', 'Design, PM, commissioning & fees', '设计、项目管理、调试及费用', 0.06]
  ];

  /* ------------------------------------------------- reference lookups */
  function loc(id) { return find(DB.idLocs, id) || find(DB.idLocs, 'JB-BKS'); }
  function plat(id) { return find(DB.platforms, id) || find(DB.platforms, 'GP-2U'); }
  function climAdj(tech, L) {
    var c = DB.idClimates[L.cls] || DB.idClimates.TROP;
    if (tech === 'DX' || tech === 'ACCH') return 1 + 0.02 * (L.db - c.dbRef);
    return 1 + 0.035 * (L.wb - c.wbRef);
  }
  function mechCoef(tech, L) { return (MECH[tech] || MECH.WCCH)[L.cls] * climAdj(tech, L); }
  function liqCoef(tech, L) { return (LIQ[tech] || LIQ.DLC)[L.cls] * climAdj('LIQ', L); }
  function wueCoef(tech, L) { return (WUE[tech] || WUE.WCCH)[L.cls] * (tech === 'DX' || tech === 'ACCH' ? 1 : climAdj('LIQ', L)); }

  /* ---------------------------------------------------- default input (owner-level) */
  function defaults() {
    return {
      name: 'New Data Center Project', loc: 'JB-BKS', type: 'COLO', crit: 'business', sizing: 'mw', itMW: 10, racks: 1000,
      siteArea: 0, gridMVA: 0, tariffIDR: 1207.6, fx: DB.idFx || 17900, startYear: new Date().getFullYear(), ov: {}
    };
  }

  /* ---------------------------------------------------- capacity (shared by matrix & assess) */
  function capacity(p) {
    var share = clamp(num(p.hdShare, 0), 0, 100) / 100;
    var sd = Math.max(0.5, num(p.dens, 10)), hd = share > 0 ? Math.max(sd, num(p.hdDens, 60)) : 0;
    var racks, hdR, stdR, itKW;
    if (p.sizing === 'racks') {
      racks = Math.max(1, Math.round(num(p.racks, 100)));
      hdR = Math.round(racks * share); stdR = racks - hdR; itKW = stdR * sd + hdR * hd;
    } else {
      itKW = Math.max(10, num(p.itMW, 1) * 1000);
      var avg = (1 - share) * sd + share * hd;
      racks = ceil(itKW / avg); hdR = Math.round(racks * share); stdR = racks - hdR;
    }
    return { itKW: itKW, itMW: itKW / 1000, racks: racks, stdR: stdR, hdR: hdR, sd: sd, hd: hd, avgDens: itKW / racks, maxDens: hdR > 0 ? hd : sd, share: share };
  }
  function liquidSplit(cool, cap, sp, hp, lsh) {
    var liq = 0;
    if (cool === 'DLC') liq = cap.hdR * cap.hd * (lsh > 0 ? lsh : (hp.cool === 'DLC' ? hp.liq : 0.8)) + (sp.cool === 'DLC' ? cap.stdR * cap.sd * sp.liq : 0);
    if (cool === 'IMM') liq = (cap.hdR * cap.hd + cap.stdR * cap.sd) * 0.95;
    if ((cool === 'DLC') && liq === 0) liq = cap.itKW * 0.75;
    return Math.min(liq, cap.itKW);
  }
  function airTechFor(cool, itMW, waterScarce) { return (cool === 'DLC' || cool === 'IMM') ? ((waterScarce || itMW < 5) ? 'ACCH' : 'WCCH') : cool; }
  /* equipment-based cooling energy (per design-day-average conditions) — used as a factor on the calibrated MECH coefficients,
     so the benchmark PUE stays unchanged at the default parameters while a change of chilled-water temperature, ΔT, server air ΔT
     or tower approach moves the PUE, the maximum demand and every rating that follows it */
  var COOLDEF = { chws: 14, chwDT: 8, airDT: 12, twAppr: 4 };
  function coolParams(p) {
    function v(k) { var x = num(p[k], 0); return x > 0 ? x : COOLDEF[k]; }
    return { chws: clamp(v('chws'), 6, 26), chwDT: clamp(v('chwDT'), 3, 16), airDT: clamp(v('airDT'), 6, 25), twAppr: clamp(v('twAppr'), 2, 10) };
  }
  function coolModel(tech, c, L, loadKW, airKW) {
    var wbA = L.wb - 3, dbA = L.db - 5, o = { chiller: 0, chwPump: 0, cwPump: 0, towerFan: 0, fans: 0, cop: 0, free: 0, cws: 0, tcond: 0 };
    o.fans = airKW / (1.2 * 1.006 * c.airDT) * 400 / 0.65 / 1000;            /* fan walls / CRAH: airflow × 400 Pa ÷ 0.65 */
    function tot() { o.total = o.chiller + o.chwPump + o.cwPump + o.towerFan + o.fans; return o; }
    if (tech === 'DX') { var te = 273.15 + 6, tc = 273.15 + dbA + 15; o.cop = clamp(0.33 * te / (tc - te), 2, 5); o.chiller = loadKW / o.cop; return tot(); }
    if (tech === 'IEC') { o.chiller = loadKW * 0.12 * (wbA > 22 ? 1.5 : 1); return tot(); }
    var tev = 273.15 + c.chws - 1.5;
    if (tech === 'ACCH') { o.tcond = dbA + 12; o.cop = clamp(0.38 * tev / Math.max(5, 273.15 + o.tcond - tev), 2, 7); }
    else {
      o.cws = wbA + c.twAppr; o.tcond = o.cws + 5.5 + 1.5; o.cop = clamp(0.5 * tev / Math.max(5, 273.15 + o.tcond - tev), 3, 12);
      o.free = clamp((c.chws - 1.5 - (wbA + c.twAppr + 1.5) + 4) / 8, 0, 1);       /* water-side economiser hours (σ ≈ 2 K) */
      o.cwPump = loadKW * K.REJ / (4.186 * 5.5) / 1000 * 200000 / 0.7 / 1000;
      o.towerFan = loadKW * K.REJ * 0.0095 * (4 / c.twAppr);
    }
    o.chiller = loadKW / o.cop * (1 - 0.8 * o.free);
    o.chwPump = loadKW / (4.186 * c.chwDT) / 1000 * 250000 / 0.7 / 1000;
    return tot();
  }
  function pueModel(cool, p, cap, L) {
    var sp = plat(p.stdPlat), hp = plat(p.hdPlat);
    var liquid = liquidSplit(cool, cap, sp, hp, num(p.liqSh, 0) / 100), air = cap.itKW - liquid;
    var airTech = airTechFor(cool, cap.itMW, p.waterScarce);
    var fAir = 1;
    if (air > 0) { var mA = coolModel(airTech, coolParams(p), L, air * 1.08, air).total, mD = coolModel(airTech, COOLDEF, L, air * 1.08, air).total; fAir = mD > 0 ? mA / mD : 1; }
    var mech = (air * mechCoef(airTech, L) * fAir + liquid * (cool === 'IMM' ? liqCoef('IMM', L) : (cool === 'DLC' ? liqCoef('DLC', L) : 0))) / cap.itKW;
    var elec = ELEC[clamp(Math.round(num(p.tier, 3)), 1, 4)] - (p.eco ? 0.025 : 0);
    var misc = cap.itMW >= 30 ? 0.010 : (cap.itMW >= 2 ? 0.015 : 0.02);
    /* overrides of the selected system's overheads (Project Technology Simulation) */
    if (cool === p.cooling) { if (num(p.mechOv, 0) > 0) mech = num(p.mechOv, 0); if (num(p.elecOv, 0) > 0) elec = num(p.elecOv, 0); if (num(p.miscOv, 0) > 0) misc = num(p.miscOv, 0); }
    /* evaporative make-up water scales with the cycles of concentration: CoC ÷ (CoC − 1), reference CoC 5 */
    var coc = num(p.coc, 0), cocF = coc > 1 ? (coc / (coc - 1)) / 1.25 : 1, evap = airTech === 'WCCH' || airTech === 'IEC';
    var wue = (air * wueCoef(airTech, L) * (evap ? cocF : 1) + liquid * wueCoef('LIQ', L) * cocF) / cap.itKW;
    return { liquid: liquid, air: air, airTech: airTech, mech: mech, elec: elec, misc: misc, pue: 1 + mech + elec + misc,
             puePeak: 1 + mech * (PEAK[L.cls] || 1.2) + elec + misc, wue: wue };
  }

  /* ---------------------------------------------------- cooling option evaluation */
  function coolLimit(id, cap, sp, hp) {
    /* effective rack-density limit of a cooling technology given the IT platforms */
    var anyDLC = sp.cool === 'DLC' || (cap.hdR > 0 && hp.cool === 'DLC');
    if (id === 'DLC' || id === 'IMM') return anyDLC ? 1000 : 0;
    var needsLiquid = cap.hdR > 0 && hp.cool === 'DLC';
    if (needsLiquid) return 0;
    var c = find(DB.cooling, id);
    if ((id === 'WCCH' || id === 'ACCH') && cap.hdR > 0 && hp.cool === 'RDHX') return Math.max(c.maxDens, 75);
    return c.maxDens;
  }
  function coolingMatrix(p) {
    var L = loc(p.loc), cap = capacity(p), fx = num(p.fx, 17900), tariff = num(p.tariffIDR, 1207.6) / fx;
    var sp0 = plat(p.stdPlat), hp0 = plat(p.hdPlat);
    return DB.cooling.map(function (c) {
      var m = pueModel(c.id, p, cap, L);
      var lim = coolLimit(c.id, cap, sp0, hp0);
      var feasible = cap.maxDens <= lim;
      var energyCost = cap.itKW * 0.85 * 8760 * m.pue * tariff;
      var unitInfo = null;
      if (c.id === 'DX') { var u = (cap.itKW * 1.07) <= 500 ? 50 : 100; unitInfo = { n: ceil(cap.itKW * 1.07 / u), size: u, en: 'DX CRAC units', zh: '直膨精密空调' }; }
      else if (c.id === 'IEC') unitInfo = { n: ceil(cap.itKW * 1.07 / 400), size: 400, en: 'IEC modules', zh: '间接蒸发模块' };
      else if (c.id === 'DLC' || c.id === 'IMM') unitInfo = { n: ceil(Math.max(m.liquid, 1) / (m.liquid >= 3000 ? 1500 : 800)), size: m.liquid >= 3000 ? 1500 : 800, en: 'CDUs', zh: 'CDU' };
      else { var tu = cap.itMW >= 2 ? 400 : 150; unitInfo = { n: ceil(m.air / tu), size: tu, en: tu === 400 ? 'Fan walls' : 'CRAH units', zh: tu === 400 ? '风墙' : '冷冻水精密空调' }; }
      return { id: c.id, en: c.en, zh: c.zh, feasible: feasible, limit: lim, maxDens: c.maxDens, pue: m.pue, wue: m.wue, mech: m.mech, airTech: m.airTech,
               energyCost: energyCost, water: cap.itKW * 0.85 * 24 * m.wue / 1000, capexF: COOL_CAPEX[c.id], units: unitInfo, maxMW: c.maxMW };
    });
  }

  function redundancy(tier, n, kind) {
    if (n <= 0 || tier === 1) return 0;
    if (tier === 4) { if (kind === 'ups' || kind === 'tx' || kind === 'gen') return n; return Math.max(2, ceil(n / 3)); }
    if (kind === 'tx' && tier === 2) return 0;
    if (kind === 'term') return Math.max(1, ceil(n * 0.2));
    if (kind === 'gen' || kind === 'ups') return Math.max(1, ceil(n / 8));
    return Math.max(1, ceil(n / 6));
  }
  function redLabel(n, r) { if (r === 0) return 'N'; if (r === n && n > 1) return '2N'; if (r === n && n === 1) return 'N+1 (2N)'; return r > 2 && r < n ? 'N+' + r + ' (N+1 per ' + Math.round(n / r) + ')' : 'N+' + r; }

  /* ---------------------------------------------------- PLN connection solution
     Voltage levels (IEC 60038 / SPLN 1) with the GIS rated voltage (IEC 62271-1/-203), planning capacity of one circuit,
     practical demand range of a dedicated connection and typical short-time withstand current.
     220 / 230 kV is not a PLN voltage — it is listed as the international equivalent (Vietnam 220 kV; Philippines,
     Thailand, Singapore 230 kV). */
  var KV = [
    { kv: 20, ur: 24, cap: 10, lo: 0, hi: 30, ik: 25, cls: 'TM', en: '20 kV (PLN TM)', zh: '20 kV（PLN中压）' },
    { kv: 70, ur: 72.5, cap: 60, lo: 10, hi: 60, ik: 31.5, cls: 'TT', en: '70 kV (PLN TT)', zh: '70 kV（PLN高压）' },
    { kv: 150, ur: 170, cap: 200, lo: 30, hi: 300, ik: 40, cls: 'TT', en: '150 kV (PLN TT)', zh: '150 kV（PLN高压）' },
    { kv: 230, ur: 245, cap: 400, lo: 100, hi: 600, ik: 50, cls: 'TT', intl: true, en: '220 / 230 kV (international)', zh: '220/230 kV（国际）' },
    { kv: 275, ur: 300, cap: 600, lo: 200, hi: 900, ik: 40, cls: 'TET', en: '275 kV (PLN TET)', zh: '275 kV（PLN超高压）' },
    { kv: 500, ur: 550, cap: 1800, lo: 500, hi: 3000, ik: 50, cls: 'TET', en: '500 kV (PLN TET)', zh: '500 kV（PLN超高压）' }
  ];
  /* transmission voltages by PLN system (planning view — confirm with PLN / RUPTL): 1 in service, 2 limited or legacy, 3 planned */
  var KV_GRID = { JAMALI: { 20: 1, 70: 2, 150: 1, 500: 1 }, SUM: { 20: 1, 70: 2, 150: 1, 275: 1, 500: 3 }, BTM: { 20: 1, 150: 1 },
                  KAL: { 20: 1, 70: 2, 150: 1, 275: 2 }, SULSEL: { 20: 1, 70: 2, 150: 1, 275: 1 }, SULUT: { 20: 1, 70: 1, 150: 1 },
                  NUSA: { 20: 1, 70: 2, 150: 2 }, MAL: { 20: 1, 70: 2, 150: 2 } };
  function kvLevel(kv) { for (var i = 0; i < KV.length; i++) if (KV[i].kv === kv) return KV[i]; return KV[2]; }
  function kvRule(mva, gid) {
    var av = KV_GRID[gid] || KV_GRID.JAMALI;
    if (mva <= 30) return 20;
    if (mva <= 300) return 150;
    if (av[500] === 1) return 500;
    if (av[275] && mva <= 900) return 275;
    return av[500] ? 500 : (av[275] ? 275 : 150);
  }
  function kvName(kv) { return kv === 230 ? '220/230 kV' : kv + ' kV'; }
  /* assessment of a voltage level for the demand and the PLN system: std = standard, opt = possible / strategic (with conditions), no = not practical */
  function connAssess(kv, mva, gid, av, hi) {
    var V = kvLevel(kv), a = V.intl ? 0 : (av[kv] || 0), circ = Math.max(hi ? 2 : 1, ceil(mva / V.cap) + (hi ? 1 : 0));
    function T(c, en, zh) { return { c: c, en: en, zh: zh }; }
    if (V.intl) return T('no', '220/230 kV is the international level (Vietnam 220 kV; Philippines, Thailand, Singapore 230 kV), not a PLN voltage — in Indonesia use 150, 275 or 500 kV.', '220/230 kV为国际电压等级（越南220 kV；菲律宾、泰国、新加坡230 kV），非PLN电压——在印尼采用150、275或500 kV。');
    if (!a) return T('no', kvName(kv) + ' is not available in this PLN system.', '本PLN电网无' + kvName(kv) + '电压等级。');
    var pl = a === 3 ? [' Planned in RUPTL — confirm the in-service date with PLN.', '该电压在RUPTL中为规划——须与PLN确认投运时间。'] : (a === 2 ? [' Limited / legacy network — confirm the nearest substation and spare capacity.', '有限/存量网络——须确认最近变电站及可用容量。'] : ['', '']);
    if (kv === 20) return mva <= 30 ? T('std', 'Standard up to 30 MVA (PLN TM, B-3 / I-3 tariff): ' + circ + ' dedicated 20 kV express feeders from PLN substations. A 20 kV distribution supply sees more outages and voltage dips than a 150 kV bay, so the generators start more often.', '30 MVA以内的标准方案（PLN中压，B-3/I-3电价）：由PLN变电站引出' + circ + '路20 kV专用馈线。20 kV配网的停电和电压暂降多于150 kV间隔，发电机启动更频繁。')
      : T('no', 'Above the 30 MVA PLN TM limit — ' + circ + ' feeders would be needed; connect at 150 kV.', '超过PLN中压30 MVA限值——需' + circ + '路馈线；应接入150 kV。');
    if (kv === 70) return mva <= 60 ? T('opt', 'Possible where a 70 kV network exists; PLN is not expanding 70 kV.' + pl[0], '如有70 kV网络可采用；PLN不再扩建70 kV。' + pl[1]) : T('no', 'Above the practical 70 kV range (≤ 60 MVA).', '超出70 kV适用范围（≤60 MVA）。');
    if (kv === 150) {
      if (mva < 30) return T('opt', 'Strategic option below 30 MVA, used by data-center campuses (e.g. STT GDC Jakarta: dedicated 150 kV substation from an 18 MW first building; Microsoft JKT02: 42 MVA at 150 kV): a 150 kV bay is more reliable than 20 kV feeders, leaves room for later phases and gives the I-4 TT tariff once ≥ 30,000 kVA is contracted (the minimum-bill rule is not binding at data-center load factors). Cost: GIS substation, ≈ 24 months of PLN works, ≈ 4,000 m² of land.', '30 MVA以下的战略方案，数据中心园区常用（如STT GDC雅加达园区：首栋18 MW即自建150 kV变电站；微软JKT02：150 kV、42 MVA）：150 kV间隔比20 kV馈线更可靠，便于后续分期，签约≥30,000 kVA即可适用I-4高压电价（数据中心负荷率高，最低电费规则不起作用）。代价：GIS变电站、PLN工程约24个月、用地约4,000 m²。');
      if (mva <= 300) return T('std', 'Standard 30–300 MVA: dedicated GIS substation with 150/20 kV transformers, PLN I-4 TT tariff.' + pl[0], '30–300 MVA的标准方案：自建GIS变电站及150/20 kV主变，PLN I-4高压电价。' + pl[1]);
      return T('opt', 'Above ≈ 300 MVA one 150 kV connection needs ' + circ + ' circuits — split the campus into several 150 kV substations fed from different PLN substations, or connect at EHV where available.' + pl[0], '约300 MVA以上单一150 kV接入需' + circ + '回线路——将园区拆分为由不同PLN变电站供电的多座150 kV变电站，或在具备条件时接入超高压。' + pl[1]);
    }
    if (kv === 275) return mva < 200 ? T('opt', 'Large for less than ≈ 200 MVA — only where PLN directs the connection to a 275 kV substation.' + pl[0], '约200 MVA以下偏大——仅在PLN指定接入275 kV变电站时采用。' + pl[1])
      : (mva <= 900 ? T(a === 1 ? 'std' : 'opt', 'Standard 200–900 MVA in Sumatra, Kalimantan and Sulawesi: GIS with 275/150 kV interbus transformers and a 150 kV campus network.' + pl[0], '苏门答腊、加里曼丹、苏拉威西200–900 MVA的标准方案：GIS及275/150 kV联络变压器，园区150 kV网络。' + pl[1])
        : T('opt', 'Above ≈ 900 MVA: several 275 kV connections, or 500 kV where available.' + pl[0], '约900 MVA以上：多回275 kV接入，或在具备条件时接入500 kV。' + pl[1]));
    return mva < 300 ? T('no', 'A 500 kV GITET is not justified below ≈ 300 MVA — PLN supplies such loads at 150 kV.', '约300 MVA以下不宜建500 kV超高压变电站——PLN以150 kV供电。')
      : T(a === 1 ? 'std' : 'opt', 'Standard from ≈ 300 MVA where a 500 kV line or GITET is near: 500 kV GIS (breaker-and-a-half) with 500/150 kV interbus transformers and a 150 kV campus network; the alternative is several 150 kV connections from different PLN substations.' + pl[0], '约300 MVA起、附近有500 kV线路或超高压变电站时的标准方案：500 kV GIS（一个半断路器）、500/150 kV联络变压器及园区150 kV网络；替代方案为由不同PLN变电站引出的多回150 kV接入。' + pl[1]);
  }
  /* HV/MV transformer ratings: PLN standard 30 / 60 MVA (SPLN T3.007-2:2016), customer substations up to ≈ 250 MVA;
     above ≈ 140 MVA a double-secondary (split-winding) unit feeds two 20 kV boards (each ≤ 4,000 A). Typical impedance ≥ IEC 60076-5 minimum. */
  var HT_STD = [20, 30, 45, 60, 80, 100, 120, 150, 200, 250];
  function htUk(sz) { return sz <= 40 ? 10 : (sz <= 63 ? 12.5 : (sz <= 100 ? 13.5 : 15)); }
  /* planning fault level at the connection point (network short-circuit power for power-quality and voltage-step checks); PLN gives the actual value on request (Grid Code CCA1 2) */
  function pccIkRule(kv, gid) { return kv === 500 ? 40 : (kv === 275 ? 20 : (kv === 230 ? 25 : (kv === 150 ? (gid === 'JAMALI' ? 25 : 15) : 10))); }
  function connection(mva, p, L) {
    var gid = L.grid, av = KV_GRID[gid] || {}, rule = kvRule(mva, gid);
    var kv = [20, 70, 150, 230, 275, 500].indexOf(Math.round(num(p.hvKV, 0))) >= 0 ? Math.round(num(p.hvKV, 0)) : rule, V = kvLevel(kv), hi = p.tier >= 3;
    var duty = Math.max(1, ceil(mva / V.cap)), circ = hi ? Math.max(2, duty + 1) : duty;
    var scheme = kv === 20 ? (hi ? ['Single busbar in two sections with bus coupler (two incomers)', '单母线分段+母联（双进线）'] : ['Single busbar', '单母线'])
      : kv <= 150 ? (hi ? ['Double busbar with bus coupler', '双母线+母联'] : ['Single busbar with bus section', '单母线分段'])
      : kv === 500 ? ['Breaker-and-a-half (PLN 500 kV practice)', '一个半断路器接线（PLN 500 kV惯例）'] : (hi ? ['Breaker-and-a-half or double busbar', '一个半断路器或双母线'] : ['Double busbar', '双母线']);
    /* equipment short-time rating (PLN practice) vs the network fault level at the connection point */
    var ik = (kv === 150 && gid === 'JAMALI' && mva > 150) ? 50 : (kv === 500 && gid === 'JAMALI' ? 63 : V.ik);
    var pccRule = pccIkRule(kv, gid), pccIk = num(p.ikPCC, 0) > 0 ? num(p.ikPCC, 0) : pccRule, ssc = 1.732 * kv * pccIk;
    if (pccIk > ik) ik = pick([25, 31.5, 40, 50, 63, 80], pccIk);                  /* switchgear short-time rating ≥ network fault level */
    var sscMax = 1.732 * kv * ik;
    var I = mva * 1000 / (1.732 * kv), busMin = kv === 20 ? 630 : (kv <= 150 ? 2000 : (kv === 500 ? 4000 : 3150));
    var busA = Math.max(busMin, pick([630, 1250, 2000, 2500, 3150, 4000, 5000], I * 1.2));
    /* HV / EHV transformers: one standby per four duty units (Tier III), 2N (Tier IV), one standby (Tier II) */
    function red(n) { return p.tier === 4 ? n : (p.tier === 3 ? Math.max(1, ceil(n / 4)) : (p.tier === 2 ? 1 : 0)); }
    var ibt = null, ht = null, ssc150 = sscMax;
    if (kv === 275 || kv === 500) {
      var im = kv === 500 ? 500 : 250, iN = ceil(mva / im); ibt = { mva: im, n: iN, r: red(iN), ratio: kv + '/150 kV', uk: 14 }; ibt.total = ibt.n + ibt.r;
      ssc150 = 1 / (1 / sscMax + (ibt.uk / 100) / (ibt.total * ibt.mva));
    }
    if (kv > 20) {
      var lowHV = ibt ? 150 : kv;
      var htRule = lowHV === 70 ? (mva <= 20 ? 20 : 30) : (lowHV === 230 ? (mva <= 150 ? 60 : 100) : (mva <= 25 ? 30 : (mva <= 150 ? 60 : (mva <= 400 ? 100 : 150))));
      var hm = num(p.htMVA, 0) > 0 ? num(p.htMVA, 0) : htRule, hN = ceil(mva / hm), split = hm > 140;
      ht = { mva: hm, rule: htRule, n: hN, r: red(hN), ratio: lowHV + '/20' + (split ? '/20' : '') + ' kV', hv: lowHV, uk: htUk(hm), split: split, onan: Math.round(hm * 0.7) };
      ht.total = ht.n + ht.r; ht.load = mva / (ht.total * hm) * 100; ht.loadOut = ht.total > 1 ? mva / ((ht.total - 1) * hm) * 100 : null;
    }
    /* 20 kV boards: one per HV/MV transformer (two per split-winding unit); fault level from the upstream short-circuit power and the transformer impedance (+5 % motor / UPS contribution) */
    var sb = ht ? (ht.split ? ht.mva / 2 : ht.mva) : mva, boards = ht ? ht.total * (ht.split ? 2 : 1) : 1, mvI = sb * 1000 / (1.732 * 20);
    var ik20 = ht ? sb / ((sb / ssc150 + ht.uk / 100) * 1.732 * 20) * 1.05 : 0;
    var mv = { kv: 20, ur: 24, i: mvI, busA: pick([630, 1250, 2000, 2500, 3150, 4000], Math.max(630, mvI * 1.05)), ik: ht ? Math.max(25, pick([25, 31.5, 40, 50], ik20)) : (mva > 10 ? 25 : 20), ikCalc: ik20, boards: boards, ssc150: ssc150, sb: sb };
    mv.gis = mv.busA > 2500;
    var fit = mva > V.hi ? 'over' : (mva < V.lo ? 'under' : 'ok'), asm = connAssess(kv, mva, gid, av, hi);
    var opts = KV.map(function (o) {
      return { kv: o.kv, ur: o.ur, en: o.en, zh: o.zh, lo: o.lo, hi: o.hi, cap: o.cap, intl: !!o.intl, avail: o.intl ? 0 : (av[o.kv] || 0), fit: mva > o.hi ? 'over' : (mva < o.lo ? 'under' : 'ok'),
               asm: connAssess(o.kv, mva, gid, av, hi), circ: hi ? Math.max(2, ceil(mva / o.cap) + 1) : ceil(mva / o.cap), rule: o.kv === rule, sel: o.kv === kv };
    });
    var lead = kv >= 275 || kv === 230 ? 36 : (kv >= 70 ? 24 : (mva > 2 ? 12 : 6));
    var cost = kv === 20 ? Math.max(0.3e6, 0.05e6 * mva) : (kv === 70 ? 3e6 + 0.09e6 * mva : (kv === 150 ? Math.max(6e6, 0.12e6 * mva) : (kv === 500 ? 35e6 + 0.07e6 * mva : 15e6 + 0.08e6 * mva)));
    var volt = kv === 20 ? (mva <= 2 ? ['LV/MV service (≤ 20 kV, PLN TM)', '低压/中压供电（≤20 kV，PLN中压）'] : ['MV 20 kV (PLN TM), ' + circ + ' dedicated feeders', '中压20 kV（PLN中压），' + circ + '路专用馈线'])
      : kv === 70 ? ['HV 70 kV (PLN TT) with on-site GIS substation', '高压70 kV（PLN高压），自建GIS变电站']
      : kv === 150 ? ['HV 150 kV (PLN TT) with on-site GIS substation', '高压150 kV（PLN高压），自建GIS变电站']
      : kv === 230 ? ['220/230 kV GIS substation (international practice, not a PLN voltage)', '220/230 kV GIS变电站（国际做法，非PLN电压等级）']
      : ['EHV ' + kv + ' kV (PLN TET) GIS substation with ' + kv + '/150 kV transformers', '超高压' + kv + ' kV（PLN超高压）GIS变电站，配' + kv + '/150 kV变压器'];
    return { kv: kv, rule: rule, name: kvName(kv), ur: V.ur, cls: V.cls, intl: !!V.intl, lo: V.lo, hi: V.hi, capC: V.cap, gis: kv >= 70, duty: duty, circ: circ, scheme: scheme, ik: ik, busA: busA,
             pccIk: pccIk, pccRule: pccRule, ssc: ssc, ibt: ibt, ht: ht, mv: mv, fit: fit, asm: asm, avail: V.intl ? 0 : (av[kv] || 0), opts: opts, lead: lead, cost: cost, volt: volt };
  }

  /* PLN grid impact (Grid Code Permen ESDM 20/2020, Lampiran I Jawa-Madura-Bali: CC 3 performance, CC 5.1 connection studies, Appendix 1) */
  var TDD_TBL = { lo: [5, 8, 12, 15, 20], mid: [2.5, 4, 6, 7.5, 10], hi: [2.5, 4, 4, 4, 4] };
  var THDV_LIM = { 20: [3, 5], 70: [3, 5], 150: [1.5, 2.5], 230: [1.5, 2.5], 275: [1, 1.5], 500: [1, 1.5] };
  var CLEAR_MS = { 500: 90, 275: 100, 230: 100, 150: 120, 70: 150 };
  var VRANGE = { 500: ['±5 %', '±5%'], 275: ['±5 %', '±5%'], 230: ['±5 %', '±5%'], 150: ['+5 % / −10 %', '+5%/−10%'], 70: ['+5 % / −10 %', '+5%/−10%'], 20: ['per PLN distribution code', '按PLN配电规范'] };
  /* Grid Code requirements at the connection point, the connection process and lessons on large data-center loads — shown by the simulation and the knowledge documents */
  var GRID_CODE = {
    limits: [[['Frequency (50 Hz)', '频率（50 Hz）'], ['49.0–51.0 Hz continuous; 47.5–49.0 and 51.0–51.5 Hz ≥ 90 min; 51.5–52.0 Hz ≥ 15 min; 47.0–47.5 Hz ≥ 6 s', '49.0–51.0 Hz连续运行；47.5–49.0及51.0–51.5 Hz≥90 min；51.5–52.0 Hz≥15 min；47.0–47.5 Hz≥6 s']],
      [['Voltage range', '电压范围'], ['500 / 275 kV ± 5 %; 150 / 66 kV + 5 % / − 10 % (maximum 550 / 300 / 170 / 72.5 kV)', '500/275 kV ±5%；150/66 kV +5%/−10%（最高550/300/170/72.5 kV）']],
      [['Voltage THD (individual / total)', '电压THD（单次/总）'], ['66 kV 3.0 / 5.0 %; 150 kV 1.5 / 2.5 %; 500 kV 1.0 / 1.5 %', '66 kV 3.0/5.0%；150 kV 1.5/2.5%；500 kV 1.0/1.5%']],
      [['Current TDD by Isc/IL (< 20 · 20–50 · 50–100 · 100–1,000 · > 1,000)', '电流TDD按Isc/IL（<20·20–50·50–100·100–1,000·>1,000）'], ['≤ 66 kV ' + TDD_TBL.lo.join(' · ') + ' %; 66–150 kV ' + TDD_TBL.mid.join(' · ') + ' %; above 150 kV 2.5 · 4.0 % (higher ratios taken as 20–50)', '≤66 kV ' + TDD_TBL.lo.join('·') + '%；66–150 kV ' + TDD_TBL.mid.join('·') + '%；150 kV以上2.5·4.0%（更高短路比按20–50取值）']],
      [['Flicker · voltage steps · unbalance', '闪变·电压阶跃·不平衡'], ['Pst 0.8 / Plt 0.6 at 66–500 kV (1.0 / 0.8 below 66 kV); steps ≤ 2 % repetitive, ≤ 3 % infrequent, ≤ 5 % motor-start dips; negative sequence ≤ 1 % (2 % short peaks)', '66–500 kV Pst 0.8/Plt 0.6（66 kV以下1.0/0.8）；阶跃重复≤2%、偶发≤3%、电机启动暂降≤5%；负序≤1%（短时峰值2%）']],
      [['Power factor', '功率因数'], ['0.9 lagging – 0.9 leading at the connection point (half-hourly)', '接入点滞后0.9至超前0.9（每半小时）']],
      [['Fault clearing (main protection)', '故障切除（主保护）'], ['500 kV ≤ 90 ms; 275 kV ≤ 100 ms; 150 kV ≤ 120 ms; 66 kV ≤ 150 ms; 20 kV OCR incoming ≤ 1 s, feeders ≤ 0.7 s; resistance-earthed ground-fault relays ≤ 50 % of the resistor time rating', '500 kV≤90 ms；275 kV≤100 ms；150 kV≤120 ms；66 kV≤150 ms；20 kV进线过流≤1 s、馈线≤0.7 s；电阻接地系统接地继电器≤电阻时间额定的50%']],
      [['Metering & telemetry', '计量与遥测'], ['power-quality meter at the connection point, AMR, disturbance recorder; WAMS / PMU for large connections; telecom back-up ≥ 8 h', '接入点电能质量表、AMR、故障录波；大型接入配WAMS/PMU；通信后备≥8 h']]],
    process: [[['1 · Connection request', '1 · 接入申请'], ['to PLN (distribution or transmission unit): load and phases, single-line diagram, site plan, schedule — PLN replies within 30 days', '向PLN（配电或输电单位）提交：负荷及分期、单线图、总图、计划——PLN 30天内答复']],
      [['2 · Grid impact study', '2 · 电网影响研究'], ['by the consumer (consultant) with PLN network data — ≈ 1–2 months at 20 kV, 3–6 months at 70–150 kV, 6–12 months at 275–500 kV', '由用户（咨询方）采用PLN电网数据编制——20 kV约1–2个月，70–150 kV约3–6个月，275–500 kV约6–12个月']],
      [['3 · PLN evaluation', '3 · PLN评估'], ['presentation to the PLN planner and system operator; corrections until accepted', '向PLN规划及调度部门汇报；修改至通过']],
      [['4 · Agreement & works', '4 · 协议与建设'], ['connection agreement (SPJBTL), substation and line works, protection settings, planning and operating data (CC 7)', '接入协议（SPJBTL）、变电站及线路工程、保护定值、规划及运行数据（CC 7）']],
      [['5 · Energisation', '5 · 送电'], ['commissioning tests, SLO certificate, phased energisation and power-quality measurement', '调试试验、SLO证书、分期送电及电能质量测试']]],
    nerc: [['NERC Incident Review (Jan 2025): ≈ 1,500 MW of voltage-sensitive data-center load transferred to UPS after a 230 kV line fault (July 2024)', 'NERC事件回顾（2025年1月）：一次230 kV线路故障后约1,500 MW电压敏感数据中心负荷转入UPS（2024年7月）'],
      ['NERC Level 2 alert (Sep 2025) and Level 3 Essential Actions (May 2026) on large computational loads: ride-through settings, staged re-transfer, load models for studies', 'NERC二级警示（2025年9月）及三级必要措施（2026年5月）：大型计算负荷的穿越设定、分级回切、研究用负荷模型'],
      ['ERCOT studies loads ≥ 75 MW as large loads; ride-through aligned with PRC-024 / PRC-029 and IEEE 2800 practice', 'ERCOT将≥75 MW负荷按大负荷研究；穿越要求参照PRC-024/PRC-029及IEEE 2800']]
  };
  function gridImpact(p, R) {
    var el = R.el, hv = el.hv, cap = R.cap, kv = hv.kv, S = el.mva, ssc = hv.ssc, scr = ssc / Math.max(S, 0.01);
    var row = scr < 20 ? 0 : (scr < 50 ? 1 : (scr < 100 ? 2 : (scr <= 1000 ? 3 : 4))), tbl = kv <= 66 ? TDD_TBL.lo : (kv <= 150 ? TDD_TBL.mid : TDD_TBL.hi);
    var tddLimit = tbl[row], upsShare = clamp(el.upsLoad / Math.max(el.demandKW, 1), 0, 1), drvShare = 0.8 * Math.max(0, 1 - upsShare - 0.02);   /* ≈ 80 % of the non-UPS load on variable-speed drives */
    var tddNo = upsShare * 3 + drvShare * 35, tddAhf = upsShare * 3 + drvShare * 5, ahfAuto = tddNo > tddLimit;
    var ahf = (p.ahf === true || p.ahf === 'YES') ? true : ((p.ahf === false || p.ahf === 'NO') ? false : ahfAuto);
    var tdd = ahf ? tddAhf : tddNo, thdLim = THDV_LIM[kv] || [1.5, 2.5], thdv = tdd * (S / ssc) * 5;
    var aiKW = (R.hdP && R.hdP.cat === 'AI') ? cap.hdR * cap.hd : 0, swing = num(p.aiSwing, -1) >= 0 ? num(p.aiSwing, 0) : (aiKW > 0 ? 50 : 0);
    var dvAi = 100 * (aiKW / 1000 * swing / 100 / K.PF) / ssc, lossMW = el.upsLoad / 1000, dvLoss = 100 * S / ssc;
    var llc = lossMW < 75 ? 'std' : (lossMW < 300 ? 'large' : 'vlarge'), pfEst = ahf ? 0.97 : 0.95;
    var studies = [
      ['Steady-state power flow (N-0 / N-1): voltages within the Grid Code range, line and transformer loading', '稳态潮流（N-0/N-1）：电压在电网规范范围内，线路及变压器负载'],
      ['Short circuit (IEC 60909): fault level at the connection point vs equipment ratings', '短路（IEC 60909）：接入点短路水平与设备额定值'],
      ['Frequency, transient and small-signal stability with a dynamic model of the UPS / IT load', '频率、暂态及小信号稳定（含UPS/IT负荷动态模型）'],
      ['Power quality: harmonics (THDv, TDD), flicker, unbalance, voltage steps', '电能质量：谐波（THDv、TDD）、闪变、不平衡、电压阶跃'],
      ['Loading / dispatching: phased energisation, ramping, reserves', '负荷/调度：分期送电、爬坡、备用'],
      ['Protection coordination with PLN (main and back-up, clearing time)', '与PLN的保护配合（主保护、后备保护、切除时间）']];
    if (kv > 20) studies.push(['Insulation coordination (IEC 60071) and substation earthing (IEEE 80)', '绝缘配合（IEC 60071）及变电站接地（IEEE 80）']);
    if (llc !== 'std' || aiKW > 0) studies.push(['Voltage ride-through and load-loss study (UPS input settings, staged re-transfer); EMT study of AI load oscillations', '电压穿越及失负荷研究（UPS输入设定、分级回切）；AI负荷振荡电磁暂态研究']);
    return { kv: kv, ssc: ssc, pccIk: hv.pccIk, scr: scr, tddLimit: tddLimit, tddNo: tddNo, tddAhf: tddAhf, tdd: tdd, ahf: ahf, ahfAuto: ahfAuto, thdv: thdv, thdLim: thdLim,
             aiKW: aiKW, swing: swing, dvAi: dvAi, lossMW: lossMW, dvLoss: dvLoss, llc: llc, pfEst: pfEst, pfReq: '0.9 lagging – 0.9 leading', q: S * Math.sin(Math.acos(pfEst)),
             clearMs: CLEAR_MS[kv] || null, blk2: 0.02 * ssc, blk3: 0.03 * ssc, vrange: VRANGE[kv] || VRANGE[150], studies: studies, months: kv === 20 ? '1–2' : (kv <= 150 ? '3–6' : '6–12'), reply: 30 };
  }

  /* ============================================================ ASSESS */
  function assess(p) {
    p = Object.assign({}, p);
    var L = loc(p.loc);
    p.tier = clamp(Math.round(num(p.tier, 3)), 1, 4); p.floors = clamp(Math.round(num(p.floors, 2)), 1, 8);
    p.phases = clamp(Math.round(num(p.phases, 1)), 1, 12); p.life = clamp(Math.round(num(p.life, 20)), 5, 40);
    ['fuelH', 'upsMin', 'renewable', 'targetPUE', 'siteArea', 'gridMVA', 'price', 'markup', 'tariffIDR', 'fx', 'landPrice', 'waterPrice', 'capexOverride',
     'wacc', 'tax', 'rampYears', 'targetOcc', 'contingency', 'itCostKW', 'staffCost', 'kdb', 'exitMult', 'bessMW', 'bessH', 'rackW', 'rackD', 'rackU', 'phaseInterval', 'startYear',
     /* engineering overrides (0 = follow the design rule) */
     'pkPUE', 'mdKVA', 'hvKV', 'htMVA', 'txKVA', 'txLoad', 'txUk', 'genKW', 'upsKW', 'tankM3', 'fuelQ', 'battAge', 'rackRow', 'chKW', 'chwDT', 'tesS', 'cduKW', 'bessSh',
     'chws', 'airDT', 'twAppr', 'ikPCC']
      .forEach(function (k) { p[k] = num(p[k], 0); });
    if (!p.fx) p.fx = DB.idFx || 17900;
    if (!p.kdb) p.kdb = 60;
    var tariff = p.tariffIDR / p.fx;  /* USD/kWh */
    var sp = plat(p.stdPlat), hp = plat(p.hdPlat);
    var R = { p: p, L: L, grid: DB.idGrids[L.grid], clim: DB.idClimates[L.cls], stdP: sp, hdP: hp, tariffUSD: tariff, risks: [] };

    /* ------------------------------------------------ capacity */
    var cap = capacity(p);
    var size = DB.sizeClasses.filter(function (s) { return cap.itMW <= s.max; })[0];
    var type = find(DB.dcTypes, p.type) || DB.dcTypes[1];
    var tier = DB.tiers[p.tier - 1];
    cap.size = size; cap.type = type; cap.tier = tier; cap.phaseMW = cap.itMW / p.phases;
    cap.gpus = cap.hdR * (hp.gpu || 0) + cap.stdR * (sp.gpu || 0);
    R.cap = cap;
    var itKW = cap.itKW, itMW = cap.itMW, racks = cap.racks, hdR = cap.hdR, stdR = cap.stdR, sd = cap.sd, hd = cap.hd, avgDens = cap.avgDens;

    /* ------------------------------------------------ cooling & efficiency */
    var cool = p.cooling || 'WCCH';
    var coolObj = find(DB.cooling, cool) || DB.cooling[2];
    var m = pueModel(cool, p, cap, L);
    var liquidKW = m.liquid, airKW = m.air, airTech = m.airTech;
    R.cool = { tech: cool, obj: coolObj, airTech: airTech, liquidKW: liquidKW, airKW: airKW, liquidShare: liquidKW / itKW };
    /* UPS losses follow the module loading and the operating mode: a rating other than the rule changes the electrical losses, the PUE and the maximum demand */
    var occF = clamp(num(p.targetOcc, 90), 10, 100) / 100, upsLoad0 = itKW + ((p.tier === 4 || avgDens >= 25) ? 0.06 * airKW : 0) + 0.025 * liquidKW;
    var upsRule0 = upsLoad0 <= 250 ? 300 : (upsLoad0 <= 1000 ? 500 : (upsLoad0 <= 6000 ? 1200 : 1600));
    function upsLossFrac(sz) { var n = ceil(upsLoad0 / (sz * K.UPS_LOAD)), x = clamp(upsLoad0 * occF / ((n + redundancy(p.tier, n, 'ups')) * sz), 0.05, 1); return (0.008 + 0.015 * x + 0.007 * x * x) / x; }
    var dUps = p.upsKW > 0 ? (upsLossFrac(p.upsKW) - upsLossFrac(upsRule0)) * upsLoad0 / itKW * (p.eco ? 0.3 : 1) : 0;
    if (dUps) { m.elec += dUps; m.pue += dUps; m.puePeak += dUps; }
    function pueAt(u) { u = clamp(u, 0.1, 1); return 1 + (m.mech + m.elec + m.misc) * (0.55 + 0.45 / u); }
    var puePk = p.pkPUE > 0 ? p.pkPUE : m.puePeak;
    R.eff = { pue: m.pue, puePeak: puePk, pueRule: m.puePeak, pue50: pueAt(0.5), mech: m.mech, elec: m.elec, misc: m.misc, wue: m.wue, pueAt: pueAt,
              gbGrade: m.pue <= 1.2 ? 1 : (m.pue <= 1.3 ? 2 : (m.pue <= 1.5 ? 3 : 0)) };

    /* ------------------------------------------------ electrical
       Every rating follows its design rule unless an engineering override is set (p.txKVA, p.genKW … > 0). */
    var mechUPS = ((p.tier === 4 || avgDens >= 25) ? 0.06 * airKW : 0) + 0.025 * liquidKW;
    var upsLoad = itKW + mechUPS;
    var demandRule = (itKW * puePk + K.UPS_LOSS * upsLoad + Math.max(50, 0.01 * itKW)) / K.PF;
    var demandKVA = p.mdKVA > 0 ? p.mdKVA : demandRule, demandKW = demandKVA * K.PF, mva = demandKVA / 1000;
    var hv = connection(mva, p, L), volt = hv.volt, vclass = hv.kv >= 70 ? 'TT' : 'TM';
    var feeds = p.tier >= 3 ? 2 : 1;
    var txLoad = p.txLoad > 0 ? p.txLoad / 100 : K.TX_LOAD;
    var txRule = demandKVA / txLoad <= 3150 ? pick([100, 160, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150], demandKVA / txLoad) : (demandKVA > 40000 ? 3150 : 2500);
    var txSize = p.txKVA > 0 ? p.txKVA : txRule;
    var txN = ceil(demandKVA / (txSize * txLoad)), txR = redundancy(p.tier, txN, 'tx'); if (p.tier === 3 && txN === 1) txR = 1;
    /* LV side of one transformer: full-load current → main ACB (IEC 60947-2), fault level → switchboard rating (IEC 61439-2) */
    var txUk = p.txUk > 0 ? p.txUk : (txSize <= 630 ? 4 : (txSize <= 1250 ? 5 : (txSize <= 2500 ? 6 : 7))), lvI = txSize * 1000 / (1.732 * 400), lvIk = lvI / (txUk / 100) / 1000;
    var lv = { i: lvI, acb: pick([630, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6300], lvI), ik: lvIk, icw: pick([50, 65, 80, 100], lvIk), uk: txUk };
    /* cast-resin transformer losses (no-load ≈ 0.12 %, full-load ≈ 0.9 % of rating): another rating or loading limit changes the annual PUE */
    function txLossKW(sz, ld) { var n = ceil(demandKVA / (sz * ld)), r = redundancy(p.tier, n, 'tx'); if (p.tier === 3 && n === 1) r = 1; var x = demandKVA * occF / ((n + r) * sz); return (n + r) * sz * (0.0012 + 0.009 * x * x); }
    function txRuleAt(ld) { return demandKVA / ld <= 3150 ? pick([100, 160, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150], demandKVA / ld) : (demandKVA > 40000 ? 3150 : 2500); }
    var dTx = (p.txKVA > 0 || p.txLoad > 0) ? (txLossKW(txSize, txLoad) - txLossKW(txRuleAt(K.TX_LOAD), K.TX_LOAD)) / itKW : 0;
    if (dTx) { m.elec += dTx; m.pue += dTx; R.eff.pue = m.pue; R.eff.elec = m.elec; R.eff.pue50 = pueAt(0.5); R.eff.gbGrade = m.pue <= 1.2 ? 1 : (m.pue <= 1.3 ? 2 : (m.pue <= 1.5 ? 3 : 0)); }
    var genRule = demandKW <= 1500 ? pick([300, 500, 800, 1000, 1250, 1500], demandKW / K.GEN_LOAD) : (demandKW <= 12000 ? 2000 : (demandKW <= 60000 ? 2500 : 3000));
    var genSize = p.genKW > 0 ? p.genKW : genRule;
    var genN = ceil(demandKW / (genSize * K.GEN_LOAD)), genR = redundancy(p.tier, genN, 'gen');
    /* generator voltage: LV sets with ATS on small sites, a 20 kV paralleled plant (MV alternators or step-up) above ≈ 6 MW */
    var genV = p.genV === 'LV' || p.genV === 'MV' ? p.genV : (demandKW > 6000 ? 'MV' : 'LV');
    var fuelQ = p.fuelQ > 0 ? p.fuelQ : K.FUEL_L_KWH;
    var fuelLph = demandKW * fuelQ, fuelL = fuelLph * p.fuelH;
    var tankRule = fuelL > 400000 ? 200 : (fuelL > 100000 ? 100 : (fuelL > 20000 ? 50 : 20));
    var tankSize = p.tankM3 > 0 ? p.tankM3 : tankRule;
    var tanks = Math.max(p.tier >= 3 ? 2 : 1, ceil(fuelL / 1000 / tankSize));
    var upsRule = upsLoad <= 250 ? 300 : (upsLoad <= 1000 ? 500 : (upsLoad <= 6000 ? 1200 : 1600));
    var upsSize = p.upsKW > 0 ? p.upsKW : upsRule;
    var upsN = ceil(upsLoad / (upsSize * K.UPS_LOAD)), upsR = redundancy(p.tier, upsN, 'ups');
    var battAge = p.battAge > 0 ? p.battAge : K.BATT_AGE;
    var battKWh = (upsN + upsR) * upsSize * (p.upsMin / 60) * battAge / K.BATT_EFF;
    var feedsPerRack = p.tier >= 2 ? 2 : 1;
    var stdW = p.rackW || sp.w || 600, stdD = p.rackD || sp.d || 1200;
    /* rows: racks per row (rule 20, or 16 for 800 mm racks), shortened where the row load would exceed a 2,500 A busway */
    var rackRow = p.rackRow > 0 ? Math.round(p.rackRow) : (stdW >= 800 ? 16 : 20);
    var BWL = [160, 250, 400, 630, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000], bwK = K.BW_V * 1.732 * K.BW_F, rowMax = 2500 * bwK;
    var nStd = Math.max(2, Math.min(rackRow, Math.floor(rowMax / Math.max(sd, 0.1)))), nHd = hdR > 0 ? Math.max(2, Math.min(rackRow, Math.floor(rowMax / Math.max(hd, 0.1)))) : 0;
    var rowsStd = stdR > 0 ? ceil(stdR / nStd) : 0, rowsHd = hdR > 0 ? ceil(hdR / nHd) : 0, rows = Math.max(1, rowsStd + rowsHd);
    var useBusway = itKW >= 1000 || avgDens >= 10;
    var bwA = pick(BWL, (stdR > 0 ? nStd * sd : nHd * hd) / bwK), bwHdA = hdR > 0 ? pick(BWL, nHd * hd / bwK) : 0;
    var busways = useBusway ? rows * (feedsPerRack === 2 ? 2 : 1) : 0;
    var pdus = useBusway ? 0 : ceil(itKW / 120) * (feedsPerRack === 2 ? 2 : 1);
    function rpduType(d, pl) {
      if (pl && pl.cat === 'AI' && pl.kw >= 100) return ['Rack power shelves / busbar (OEM-integrated)', '机架电源架/母排（OEM集成）', 0];
      if (pl && pl.id === 'OCP-ORV3') return ['OCP power shelves, 48 V busbar', 'OCP电源架，48 V母排', 0];
      if (d <= 7) return ['1-ph 32 A (7.4 kW)', '单相32 A（7.4 kW）', 1];
      if (d <= 22) return ['3-ph 32 A (22 kW)', '三相32 A（22 kW）', 1];
      if (d <= 43) return ['3-ph 63 A (43 kW)', '三相63 A（43 kW）', 1];
      var k = ceil(d / 43); return [k + ' × 3-ph 63 A per feed', '每路' + k + '条三相63 A', k];
    }
    var rStd = rpduType(sd, sp), rHd = hdR > 0 ? rpduType(hd, hp) : null;
    var rpdus = stdR * feedsPerRack * rStd[2] + (rHd ? hdR * feedsPerRack * rHd[2] : 0);
    var bess = null;
    if (p.bessOn && (p.bessMW > 0 || p.bessSh > 0)) {
      var bmw = p.bessSh > 0 ? Math.max(0.05, itMW * p.bessSh / 100) : p.bessMW, mwh = bmw * Math.max(0.25, p.bessH);
      bess = { mw: bmw, mwh: mwh, h: p.bessH, containers: ceil(mwh / K.BESS_MWH_BOX), area: ceil(mwh / K.BESS_MWH_BOX) * 40, capex: mwh * 1000 * BESS_USD_KWH };
    }
    R.el = { upsLoad: upsLoad, mechUPS: mechUPS, demandKW: demandKW, demandKVA: demandKVA, demandRule: demandRule, mva: mva, volt: volt, vclass: vclass, feeds: feeds, hv: hv,
             txSize: txSize, txRule: txRule, txLoad: txLoad, txN: txN, txR: txR, txTotal: txN + txR, lv: lv, genSize: genSize, genRule: genRule, genN: genN, genR: genR, genTotal: genN + genR, genV: genV,
             fuelQ: fuelQ, fuelLph: fuelLph, fuelL: fuelL, tankSize: tankSize, tankRule: tankRule, tanks: tanks, upsSize: upsSize, upsRule: upsRule, upsN: upsN, upsR: upsR, upsTotal: upsN + upsR,
             battAge: battAge, battKWh: battKWh, rows: rows, rackRow: rackRow, rowStd: nStd, rowHd: nHd, rowsStd: rowsStd, rowsHd: rowsHd, useBusway: useBusway, bwA: bwA, bwHdA: bwHdA, busways: busways,
             pdus: pdus, rpdus: rpdus, rStd: rStd, rHd: rHd,
             feedsPerRack: feedsPerRack, txLabel: redLabel(txN, txR), genLabel: redLabel(genN, genR), upsLabel: redLabel(upsN, upsR),
             gridOK: !(p.gridMVA > 0 && p.gridMVA < mva), bess: bess };

    /* ------------------------------------------------ mechanical */
    var greyHeat = itKW * (m.elec + m.misc * 0.5);
    var chwLoad = (airTech === 'DX' || airTech === 'IEC' ? 0 : airKW + greyHeat);
    var M = { chwLoad: chwLoad, totalHeat: itKW + greyHeat };
    M.tr = M.totalHeat / K.RT_KW;
    if (airTech === 'DX') { var crac = (airKW + greyHeat) <= 500 ? 50 : 100; M.cracSize = crac; M.cracN = ceil((airKW + greyHeat) / crac); M.cracR = redundancy(p.tier, M.cracN, 'term'); }
    else if (airTech === 'IEC') { M.iecN = ceil((airKW + greyHeat) / 400); M.iecR = redundancy(p.tier, M.iecN, 'plant'); }
    else {
      var chRule = airTech === 'WCCH' ? (chwLoad >= 20000 ? 3517 : (chwLoad >= 6000 ? 2461 : 1407)) : (chwLoad >= 3000 ? 1000 : 500);
      var chSize = p.chKW > 0 ? p.chKW : chRule;
      M.chSize = chSize; M.chRule = chRule; M.chN = Math.max(1, ceil(chwLoad / chSize)); M.chR = redundancy(p.tier, M.chN, 'plant'); M.chLabel = redLabel(M.chN, M.chR);
      if (airTech === 'WCCH') { M.ctN = M.chN; M.ctR = M.chR; M.rejKW = chwLoad * K.REJ; }
      M.pumps = (M.chN + M.chR) * (airTech === 'WCCH' ? 2 : 1);
      /* chilled-water ΔT sets the flow and pipe size; storage covers the chiller restart (5 / 10 / 15 min below Tier III / Tier III / Tier IV) */
      M.chwDT = p.chwDT > 0 ? p.chwDT : K.CHW_DT; M.tesS = p.tesS > 0 ? p.tesS : (p.tier >= 4 ? 900 : (p.tier >= 3 ? 600 : 300));
      M.chwFlow = chwLoad / (4.186 * M.chwDT); M.chwDN = pick([100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1200], Math.sqrt(4 * M.chwFlow / 1000 / (Math.PI * 2.4)) * 1000);
      M.tesM3 = (p.tier >= 3 || avgDens >= 15) ? chwLoad * M.tesS / (K.CP_W * M.chwDT) : 0;
      var airRackDens = (cool === 'DLC' || cool === 'IMM') ? sd : avgDens, term;
      if (airRackDens > 25) term = { en: 'In-row coolers (50 kW)', zh: '列间空调（50 kW）', size: 50, id: 'ME-10' };
      else if (itMW / Math.max(1, ceil(itMW / 4)) >= 2) term = { en: 'Fan walls (400 kW)', zh: '风墙（400 kW）', size: 400, id: 'ME-08' };
      else term = { en: 'CRAH units (150 kW)', zh: '冷冻水精密空调（150 kW）', size: 150, id: 'ME-07' };
      var termLoad = airKW;
      if (hdR > 0 && hp.cool === 'RDHX' && cool !== 'DLC' && cool !== 'IMM') { M.rdhx = hdR; termLoad = airKW - hdR * hd * 0.6; }
      /* terminal capacity scales with the server air ΔT (fixed airflow per unit) */
      var dtF = clamp(coolParams(p).airDT / COOLDEF.airDT, 0.5, 1.6); term.cap = Math.round(term.size * dtF);
      term.n = ceil(Math.max(termLoad, 1) / term.cap); term.r = redundancy(p.tier, term.n, 'term'); M.term = term;
    }
    if (liquidKW > 0) {
      var cduRule = liquidKW >= 3000 ? 1500 : 800, cduSize = p.cduKW > 0 ? p.cduKW : cduRule;
      M.cduSize = cduSize; M.cduRule = cduRule; M.cduN = ceil(liquidKW / cduSize); M.cduR = Math.max(1, ceil(M.cduN / K.CDU_N_PER_R));
      M.dcN = ceil(liquidKW * 1.05 / K.DC_KW); M.dcR = redundancy(p.tier, M.dcN, 'plant');
      if (cool === 'IMM') M.tanks = ceil(liquidKW / 100);
    }
    M.waterDay = itKW * (num(p.targetOcc, 90) / 100) * 24 * m.wue / 1000;
    M.waterStore = M.waterDay / 24 * Math.max(12, p.fuelH);
    M.cp = coolParams(p); M.model = coolModel(airTech, M.cp, L, chwLoad || (airKW + greyHeat), airKW);
    R.me = M;

    /* ------------------------------------------------ space */
    var stdArea = (stdW / 1000) * (stdD / 1000 + 1.2) * 1.8;
    var hdArea = ((hp.w || 600) / 1000) * ((hp.d || 1200) / 1000 + 1.2) * 1.8 * (hp.id === 'NV-KYBER' ? 1 : 1) + (liquidKW > 0 ? 0.8 : 0);
    var ws = stdR * stdArea + hdR * hdArea;
    var halls = Math.max(ceil(ws / 1500), ceil(itMW / (liquidKW > 0 ? 10 : 4)));
    var tierE = { 1: 0.6, 2: 0.8, 3: 1.0, 4: 1.6 }[p.tier];
    var elecRoom = itMW * (p.battery === 'LI' ? 200 : 280) * tierE + 80 + 60 * ceil(itMW / 10);
    var mechRoom = itMW * ({ DX: 10, ACCH: 30, WCCH: 90, IEC: 80, DLC: 100, IMM: 60 }[cool] || 90) + 40;
    var support = 400 + 40 * itMW;
    var gfa = (ws + elecRoom + mechRoom + support) * 1.15;
    var footprint = gfa / p.floors;
    var yard = (R.el.genTotal * 75) + (R.el.txTotal * 30) + (fuelL / 1000 / 2.5 * 1.5) + (bess ? bess.area : 0);
    if (airTech === 'WCCH') yard += M.rejKW * 0.025;
    if (airTech === 'ACCH') yard += chwLoad * 0.04;
    if (liquidKW > 0) yard += liquidKW * 1.05 * 0.05;
    var subst = hv.kv === 20 ? 150 : (hv.kv === 70 ? 2500 : (hv.kv === 150 ? (mva > 120 ? 8000 : 4000) : (hv.kv === 500 ? 15000 : 10000)));
    var siteNeed = Math.max(footprint / (clamp(p.kdb, 20, 90) / 100), (footprint + yard + subst) * 1.6);
    var raised = p.raised === 'YES' || (p.raised !== 'NO' && avgDens <= 10 && itMW < 30 && liquidKW === 0);
    var heavy = Math.max(hdR > 0 ? (hp.kg || 0) : 0, sp.kg || 0);
    var floorLoad = (heavy >= 1300 || cap.maxDens >= 40) ? 25 : ((heavy >= 1000 || avgDens >= 15) ? 20 : 15);
    R.sp = { stdArea: stdArea, hdArea: hdArea, rackArea: ws / racks, ws: ws, halls: halls, elecRoom: elecRoom, mechRoom: mechRoom, support: support, gfa: gfa,
             footprint: footprint, yard: yard, subst: subst, siteNeed: siteNeed, raised: raised, siteOK: !(p.siteArea > 0 && p.siteArea < siteNeed),
             clearH: raised ? '≥ 4.5 m + 0.6–1.0 m raised floor' : (liquidKW > 0 ? '≥ 6.0 m (overhead busway, trays, liquid piping)' : '≥ 5.5 m (overhead services)'),
             clearHzh: raised ? '≥4.5 m+0.6–1.0 m架空地板' : (liquidKW > 0 ? '≥6.0 m（上走线母线、桥架、液冷管道）' : '≥5.5 m（机电上走线）'),
             floorLoad: floorLoad, heavyRack: heavy };

    /* ------------------------------------------------ fire / security / monitoring */
    var bigHall = (p.type === 'HYPER' || p.type === 'WHOLE' || p.type === 'AI') && itMW >= 20;
    var vol = ws * 4.5;
    R.fs = {
      suppression: bigHall
        ? ['Pre-action (double-interlock) sprinklers in data halls (hyperscale practice) + aspirating smoke detection; clean-agent gas in MMR, electrical and battery rooms.', '数据机房采用预作用（双连锁）喷淋（超大规模常用做法）+吸气式烟雾探测；运营商交汇间、电气室及电池室采用洁净气体灭火。']
        : ['Clean-agent (FK-5-1-12 / HFC-227ea) or inert-gas (IG-541) total flooding in white space, MMR and electrical rooms, plus pre-action sprinklers where the AHJ requires.', '白区、运营商交汇间及电气室采用洁净气体（全氟己酮/七氟丙烷）或惰性气体（IG-541）全淹没灭火，并按消防主管部门要求增设预作用喷淋。'],
      gasZones: bigHall ? 0 : ceil(ws / 800), agentKg: bigHall ? 0 : vol * K.AGENT_KG_M3, vol: vol,
      asd: ceil(ws / K.ASD_M2) + ceil((elecRoom + mechRoom) / 2000),
      cams: Math.round(60 + 45 * Math.min(itMW, 200) + 15 * Math.max(0, itMW - 200) + 2 * racks / 10), readers: Math.round(30 + 6 * halls + 2 * Math.min(itMW, 200)),
      bmsPts: Math.round(400 + 450 * itMW), meters: Math.round(20 + R.el.txTotal * 12 + R.el.upsTotal * 4 + busways * 2), securityLayers: p.tier >= 3 ? 7 : 5
    };

    /* ------------------------------------------------ staffing */
    var facPosts, secPosts, nocPosts, mgmt;
    if (itMW < 0.5) { facPosts = 0.4; secPosts = 0.2; nocPosts = 0; mgmt = 1; }
    else if (itMW < 2) { facPosts = 1; secPosts = 1; nocPosts = 0; mgmt = 2; }
    else {
      facPosts = { 1: 1, 2: 1, 3: 2, 4: 3 }[p.tier] + Math.floor(itMW / 10); secPosts = (p.tier === 1 ? 1 : 2) + Math.floor(itMW / 20);
      nocPosts = 1 + Math.floor(itMW / 30); mgmt = 3 + itMW / 20 + (type.rev === 'lease' ? 2 : 0);
    }
    var fte = Math.max(2, Math.round((facPosts + secPosts + nocPosts) * 5.2 + mgmt));
    R.staff = { fac: facPosts * 5.2, sec: secPosts * 5.2, noc: nocPosts * 5.2, mgmt: mgmt, fte: fte };

    /* ------------------------------------------------ CAPEX */
    var scaleF = itMW < 1 ? 1.45 : (itMW < 5 ? 1.18 : (itMW < 20 ? 1.05 : (itMW < 50 ? 1.0 : (itMW < 100 ? 0.95 : (itMW < 300 ? 0.9 : 0.87)))));
    var base = p.capexOverride > 0 ? p.capexOverride : ID_CAPEX * (L.capexF || 1);
    var perMW = base * TIER_CAPEX[p.tier] * scaleF * (COOL_CAPEX[cool] || 1) * (p.prefab ? 1.03 : 1);
    var facility = itMW * perMW * 1e6;
    var utility = hv.cost;
    var landArea = p.siteArea > 0 ? p.siteArea : siteNeed;
    var land = landArea * p.landPrice;
    var cont = (facility + utility) * p.contingency / 100;
    var itHW = p.includeIT ? itKW * p.itCostKW : 0;
    var bessCapex = bess ? bess.capex : 0;
    var total = facility + utility + land + cont + itHW + bessCapex;
    var bd = BREAKDOWN.map(function (b) {
      var sh = b[3];
      if (cool === 'DLC' || cool === 'IMM') { if (b[0] === 'ME') sh += 0.04; if (b[0] === 'CS') sh -= 0.03; if (b[0] === 'EL') sh -= 0.01; }
      return { id: b[0], en: b[1], zh: b[2], share: sh, usd: facility * sh };
    });
    R.capex = { perMW: perMW, base: base, scaleF: scaleF, facility: facility, utility: utility, land: land, landArea: landArea, cont: cont,
                itHW: itHW, bess: bessCapex, total: total, breakdown: bd, perKW: (facility + utility + cont) / itKW };

    /* ------------------------------------------------ OPEX (stabilised) */
    var occ = clamp(num(p.targetOcc, 90), 10, 100) / 100;
    var energyMWh = itKW * occ * 8760 * pueAt(occ) / 1000;
    var recUSD = energyMWh * clamp(p.renewable, 0, 100) / 100 * (DB.idRec || 35000) / p.fx;
    var bessSave = 0;
    if (bess && vclass === 'TM') bessSave = bess.mw * 1000 * Math.min(bess.h, 5) * 365 * (1114.74 * 0.4 / p.fx) * 0.87;
    var opex = { energy: energyMWh * 1000 * tariff, maint: 0.012 * facility + (bess ? 0.015 * bessCapex : 0), staff: fte * p.staffCost, insurance: 0.0025 * facility,
                 water: M.waterDay * 365 * p.waterPrice, other: 0.0025 * facility, rec: recUSD, bessSave: -bessSave };
    opex.total = opex.energy + opex.maint + opex.staff + opex.insurance + opex.water + opex.other + opex.rec + opex.bessSave;
    opex.energyMWh = energyMWh;
    opex.co2t = energyMWh * (1 - clamp(p.renewable, 0, 100) / 100) * (DB.idGridEF || 0.79);
    R.opex = opex;

    R.gimp = gridImpact(p, R);
    R.sched = schedule(p, itMW, mva, cool, hv.lead);
    R.fin = finance(p, R, itKW, facility + bessCapex, utility, land, cont, itHW, pueAt, opex, tariff);
    R.reqs = requirements(p, R);
    R.risks = risks(p, R);
    R.standards = DB.standards.filter(function (s) { return s.r === 'INT' || s.r === 'ID' || s.r === 'US'; });
    R.boq = boq(p, R);
    R.similar = similar(p, itMW);
    return R;
  }

  /* ---------------------------------------------------------- finance */
  function finance(p, R, itKW, facility, utility, land, cont, itHW, pueAt, op, tariff) {
    /* Timeline aligned with the schedule: phase 1 is Ready-for-Service in year Y1 (≈ programme months / 12);
       land + utility at year 0, phase-1 cost spread over years 0…Y1-1 with rising weights 1:2:…:Y1;
       later phases are built one year before their capacity comes on line.
       Shared campus infrastructure (≈ 25% of facility cost when phased) is built with phase 1.
       The analysis covers p.life operating years after phase-1 RFS. */
    var P = p.phases, Y1 = clamp(Math.round(((R.sched && R.sched.total) || 12) / 12), 1, 6), years = Y1 - 1 + p.life, rows = [];
    var common = P > 1 ? 0.25 : 0, sh1 = common + (1 - common) / P, shN = (1 - common) / P, fcont = facility + cont, capexYear = {}, capYear = {};
    function addCap(y, v) { capexYear[y] = (capexYear[y] || 0) + v; }
    var iv = Math.max(1, Math.round(p.phaseInterval || 1)), wsum = Y1 * (Y1 + 1) / 2;
    addCap(0, utility + land);
    var ph1 = fcont * sh1 + itHW / P;
    for (var j = 0; j < Y1; j++) addCap(j, ph1 * (j + 1) / wsum); /* rising spend: design & deposits early, construction late */
    capYear[Y1] = itKW / P;
    for (var k = 1; k < P; k++) {
      var y = Y1 + k * iv;
      addCap(y - 1, fcont * shN + itHW / P);
      capYear[y] = (capYear[y] || 0) + itKW / P;
    }
    var occT = clamp(num(p.targetOcc, 90), 10, 100) / 100;
    var built = 0, cum = 0, npv = 0, cfs = [], dep = [], pvCost = 0, pvCostXE = 0, pvKWm = 0, pvLeaseAlt = 0, payback = null, r = p.wacc / 100;
    for (var t = 0; t <= years; t++) {
      built += capYear[t] || 0;
      var capex = capexYear[t] || 0;
      if (capex > 0) dep.push({ start: Math.max(t + 1, Y1), amt: (capex - (t === 0 ? land : 0)) / 15 });
      var absorbed = t < Y1 ? 0 : Math.min(1, (t - Y1 + 1) / Math.max(1, p.rampYears)) * occT * itKW;
      var used = Math.min(absorbed, built * occT), util = built > 0 ? used / built : 0;
      var energyMWh = used > 0 ? used * 8760 * pueAt(Math.max(util, 0.1)) / 1000 : 0;
      var energy = energyMWh * 1000 * tariff;
      var bShare = built / itKW;
      var fixed = built <= 0 ? (t === Y1 - 1 ? op.staff * 0.3 : 0) /* pre-opening team */
        : (op.maint + op.insurance + op.other + op.bessSave) * bShare + op.staff * (0.6 + 0.4 * bShare) + op.water * (used / (itKW * occT)) + op.rec * (used / (itKW * occT));
      var opexT = energy + fixed, rev = 0;
      if (p.revModel === 'lease') rev = used * p.price * 12 + energy * (1 + p.markup / 100) * 0.95;
      var ebitda = rev - opexT;
      var depT = dep.reduce(function (s, d) { return s + (t >= d.start && t < d.start + 15 ? d.amt : 0); }, 0);
      var taxT = p.revModel === 'lease' ? Math.max(0, (ebitda - depT) * p.tax / 100) : 0;
      var cf = ebitda - taxT - capex, df = Math.pow(1 + r, -t);
      npv += cf * df; cum += cf;
      if (payback === null && t >= Y1 && cum >= 0) payback = t;
      pvCost += (capex + opexT) * df; pvCostXE += (capex + opexT - energy) * df; pvKWm += used * 12 * df; pvLeaseAlt += (used * p.price * 12 + energy) * df;
      cfs.push(cf);
      rows.push({ t: t, year: p.startYear + t, built: built, used: used, util: util, capex: capex, rev: rev, energy: energy, opex: opexT, ebitda: ebitda, dep: depT, tax: taxT, cf: cf, cum: cum });
    }
    var last = rows[rows.length - 1];
    var tv = p.revModel === 'lease' ? Math.max(0, last.ebitda) * Math.max(0, p.exitMult) : 0;
    var cfsTV = cfs.slice(); cfsTV[cfsTV.length - 1] += tv;
    return { rows: rows, rfsT: Y1, npv: npv, npvTV: npv + tv * Math.pow(1 + r, -years), tv: tv, irr: irr(cfs), irrTV: irr(cfsTV), payback: payback,
             lcoc: pvKWm > 0 ? pvCostXE / pvKWm : 0, lcocAll: pvKWm > 0 ? pvCost / pvKWm : 0, tcoPV: pvCost, leaseAltPV: pvLeaseAlt };
  }
  function irr(cfs) {
    function f(rate) { var s = 0; for (var i = 0; i < cfs.length; i++) s += cfs[i] / Math.pow(1 + rate, i); return s; }
    var lo = -0.95, hi = 1.0, flo = f(lo), fhi = f(hi);
    if (flo * fhi > 0) return null;
    for (var i = 0; i < 200; i++) { var mid = (lo + hi) / 2, fm = f(mid); if (Math.abs(fm) < 1) return mid; if (flo * fm < 0) { hi = mid; fhi = fm; } else { lo = mid; flo = fm; } }
    return (lo + hi) / 2;
  }

  /* ---------------------------------------------------------- schedule */
  function schedule(p, itMW, mva, cool, lead) {
    var giant = itMW >= 200, big = itMW >= 30, med = itMW >= 5;
    var pre = giant ? 8 : (big ? 6 : (med ? 4 : 3)), permit = giant ? 15 : (big ? 12 : (med ? 9 : 6)), design = giant ? 10 : (big ? 9 : (med ? 7 : 5));
    var proc = giant ? 20 : (big ? 16 : (med ? 12 : 9)), cons = giant ? 22 : (big ? 20 : (med ? 15 : (itMW >= 1 ? 11 : 8)));
    if (p.prefab) cons = Math.round(cons * 0.75);
    var cx = big ? 4 : (med ? 3 : 2), util = lead || (mva > 300 ? 36 : (mva > 30 ? 24 : (mva > 2 ? 12 : 6)));
    var T = [];
    function add(en, zh, s, d, c) { T.push({ en: en, zh: zh, s: s, d: d, c: c }); return s + d; }
    var e1 = add('Feasibility, site selection & land', '可行性研究、选址及土地', 0, pre, 'plan');
    var e2 = add('Concept, schematic & detailed design', '概念、方案及详细设计', e1, design, 'design');
    add('Permits (OSS-RBA, PKKPR, AMDAL/UKL-UPL, PBG)', '许可（OSS-RBA、PKKPR、AMDAL/UKL-UPL、PBG）', e1 - 1, permit, 'permit');
    var uEnd = add('PLN connection agreement & energisation', 'PLN接入协议及送电', e1, util + Math.round(design / 2), 'permit');
    var pS = e1 + Math.round(design * 0.5), pEnd = add('Procurement of long-lead equipment', '长周期设备采购', pS, proc, 'proc');
    var cEnd = add('Construction & MEP installation', '施工及机电安装', e2 - 1, cons, 'build');
    var cxS = Math.max(cEnd - 1, pEnd, uEnd), cxEnd = add('Testing & commissioning (L1–L5)', '测试与调试（L1–L5）', cxS, cx, 'cx');
    add('Ready for Service — Phase 1', '第一期投产', cxEnd, 1, 'rfs');
    return { tasks: T, total: cxEnd + 1, rfsYear: p.startYear + Math.floor((cxEnd + 1) / 12) };
  }

  /* ------------------------------------------------------ requirements */
  function requirements(p, R) {
    var L = [], el = R.el, me = R.me, sp = R.sp, c = R.cap;
    function add(cat, en, zh) { L.push({ cat: cat, en: en, zh: zh }); }
    add('GEN', 'Design IT capacity ' + fmt(c.itMW, 2) + ' MW across ' + fmt(c.racks) + ' racks (avg ' + fmt(c.avgDens, 1) + ' kW/rack), delivered in ' + p.phases + ' phase(s) of ≈ ' + fmt(c.phaseMW, 1) + ' MW.',
        '设计IT容量' + fmt(c.itMW, 2) + ' MW，共' + fmt(c.racks) + '个机柜（平均' + fmt(c.avgDens, 1) + ' kW/柜），分' + p.phases + '期建设，每期约' + fmt(c.phaseMW, 1) + ' MW。');
    add('GEN', 'IT platforms: ' + fmt(c.stdR) + ' standard racks (' + R.stdP.en + ', ' + fmt(c.sd, 1) + ' kW)' + (c.hdR ? ' + ' + fmt(c.hdR) + ' high-density racks (' + R.hdP.en + ', ' + fmt(c.hd, 0) + ' kW).' : '.'),
        'IT平台：' + fmt(c.stdR) + '个标准机柜（' + R.stdP.zh + '，' + fmt(c.sd, 1) + ' kW）' + (c.hdR ? '+' + fmt(c.hdR) + '个高密度机柜（' + R.hdP.zh + '，' + fmt(c.hd, 0) + ' kW）。' : '。'));
    add('GEN', 'Target ' + c.tier.en + ' (≈ TIA-942 ' + c.tier.tia + ', SNI 8799 ' + c.tier.sni + ', EN 50600 ' + c.tier.en50600 + ').',
        '目标等级' + c.tier.zh + '（约对应TIA-942 ' + c.tier.tia + '、SNI 8799 ' + c.tier.sni + '、EN 50600 ' + c.tier.en50600 + '）。');
    var hv = el.hv;
    add('EL', 'PLN supply ≈ ' + fmt(el.mva, 1) + ' MVA maximum demand via ' + el.volt[0] + '; ' + hv.circ + ' incoming circuit(s)' + (p.tier >= 3 ? ' (N-1) from diverse substations.' : '.'),
        'PLN最大需量约' + fmt(el.mva, 1) + ' MVA，' + el.volt[1] + '；' + hv.circ + '回进线' + (p.tier >= 3 ? '（N-1），来自不同变电站。' : '。'));
    if (hv.kv > 20) add('EL', hv.name + ' GIS (Ur ' + hv.ur + ' kV, ' + hv.ik + ' kA, ' + fmt(hv.busA) + ' A, ' + hv.scheme[0].toLowerCase() + ')' + (hv.ibt ? '; ' + hv.ibt.total + ' × ' + hv.ibt.mva + ' MVA ' + hv.ibt.ratio + ' interbus transformers' : '') +
        '; ' + hv.ht.total + ' × ' + hv.ht.mva + ' MVA ' + hv.ht.ratio + ' transformers; ' + hv.mv.boards + ' × 24 kV switchboard(s) ' + fmt(hv.mv.busA) + ' A / ' + hv.mv.ik + ' kA. Substation scope and hand-over per the PLN connection agreement.',
        hv.name + ' GIS（Ur ' + hv.ur + ' kV，' + hv.ik + ' kA，' + fmt(hv.busA) + ' A，' + hv.scheme[1] + '）' + (hv.ibt ? '；' + hv.ibt.total + '台' + hv.ibt.mva + ' MVA ' + hv.ibt.ratio + '联络变压器' : '') +
        '；' + hv.ht.total + '台' + hv.ht.mva + ' MVA ' + hv.ht.ratio + '主变压器；' + hv.mv.boards + '段24 kV开关柜' + fmt(hv.mv.busA) + ' A/' + hv.mv.ik + ' kA。变电站范围及移交按PLN接入协议。');
    var gi = R.gimp;
    if (gi) add('EL', 'PLN connection studies (Grid Code CC 5.1 feasibility / grid impact study, ≈ ' + gi.months + ' months; PLN reply ≤ 30 days): fault level at the connection point ≈ ' + fmt(gi.pccIk, 1) + ' kA (' + fmt(gi.ssc, 0) + ' MVA, Isc/IL ≈ ' + fmt(gi.scr, 0) + '); harmonic current ≤ ' + fmt(gi.tddLimit, 1) + ' % TDD, voltage THD ≤ ' + gi.thdLim[1] + ' %; power factor ' + gi.pfReq + '; voltage steps ≤ 2 % repetitive / 3 % infrequent; flicker Pst ≤ ' + (gi.kv >= 66 ? '0.8' : '1.0') + (gi.clearMs ? '; protection clearing ≤ ' + gi.clearMs + ' ms' : '') + '.',
        'PLN接入研究（电网规范CC 5.1可行性/电网影响研究，约' + gi.months + '个月；PLN 30天内答复）：接入点短路电流约' + fmt(gi.pccIk, 1) + ' kA（' + fmt(gi.ssc, 0) + ' MVA，Isc/IL约' + fmt(gi.scr, 0) + '）；谐波电流TDD≤' + fmt(gi.tddLimit, 1) + '%，电压THD≤' + gi.thdLim[1] + '%；功率因数滞后0.9至超前0.9；电压阶跃重复≤2%、偶发≤3%；闪变Pst≤' + (gi.kv >= 66 ? '0.8' : '1.0') + (gi.clearMs ? '；保护切除≤' + gi.clearMs + ' ms' : '') + '。');
    add('EL', 'Generators: ' + el.genTotal + ' × ' + el.genSize + ' kWe (' + el.genLabel + '), continuous (COP/DCC) rating; on-site fuel ' + p.fuelH + ' h ≈ ' + fmt(el.fuelL / 1000, 0) + ' m³.',
        '发电机：' + el.genTotal + '台×' + el.genSize + ' kWe（' + el.genLabel + '），持续功率；现场储油' + p.fuelH + ' h，约' + fmt(el.fuelL / 1000, 0) + ' m³。');
    add('EL', 'UPS: ' + el.upsTotal + ' × ' + el.upsSize + ' kW (' + el.upsLabel + '), ' + p.upsMin + ' min with ' + (p.battery === 'LI' ? 'Li-ion (LFP)' : 'VRLA') + ' ≈ ' + fmt(el.battKWh, 0) + ' kWh.',
        'UPS：' + el.upsTotal + '台×' + el.upsSize + ' kW（' + el.upsLabel + '），后备' + p.upsMin + ' min，' + (p.battery === 'LI' ? '锂电（LFP）' : '阀控铅酸') + '约' + fmt(el.battKWh, 0) + ' kWh。');
    if (el.bess) add('EL', 'BESS: ' + fmt(el.bess.mw, 1) + ' MW / ' + fmt(el.bess.mwh, 1) + ' MWh LFP (' + el.bess.containers + ' containers) for load smoothing / peak shaving / grid support.',
        '储能：' + fmt(el.bess.mw, 1) + ' MW/' + fmt(el.bess.mwh, 1) + ' MWh磷酸铁锂（' + el.bess.containers + '个集装箱），用于负荷平抑/削峰/电网支撑。');
    add('EL', 'Transformers ' + el.txTotal + ' × ' + el.txSize + ' kVA (' + el.txLabel + '); IT distribution by ' + (el.useBusway ? el.busways + ' busway runs (' + el.bwA + ' A)' : el.pdus + ' floor PDUs') + '; ' + el.feedsPerRack + ' power feed(s) per rack.',
        '变压器' + el.txTotal + '台×' + el.txSize + ' kVA（' + el.txLabel + '）；IT配电采用' + (el.useBusway ? el.busways + '条插接母线（' + el.bwA + ' A）' : el.pdus + '台落地PDU') + '；每柜' + el.feedsPerRack + '路供电。');
    add('ME', 'Cooling: ' + R.cool.obj.en + '; total heat ≈ ' + fmt(me.totalHeat / 1000, 1) + ' MW (' + fmt(me.tr, 0) + ' RT); ' + fmt(R.cool.liquidShare * 100, 0) + '% of IT heat to liquid.',
        '制冷：' + R.cool.obj.zh + '；总散热量约' + fmt(me.totalHeat / 1000, 1) + ' MW（' + fmt(me.tr, 0) + '冷吨）；' + fmt(R.cool.liquidShare * 100, 0) + '%的IT热量由液冷带走。');
    if (me.chN) add('ME', 'Chillers ' + (me.chN + me.chR) + ' × ' + fmt(me.chSize, 0) + ' kW (' + me.chLabel + ')' + (me.ctN ? ', cooling towers ' + (me.ctN + me.ctR) + ' cells' : '') + (me.tesM3 ? ', thermal storage ≈ ' + fmt(me.tesM3, 0) + ' m³' : '') + '.',
        '冷水机组' + (me.chN + me.chR) + '台×' + fmt(me.chSize, 0) + ' kW（' + me.chLabel + '）' + (me.ctN ? '，冷却塔' + (me.ctN + me.ctR) + '格' : '') + (me.tesM3 ? '，蓄冷罐约' + fmt(me.tesM3, 0) + ' m³' : '') + '。');
    if (me.cduN) add('ME', 'Liquid cooling: ' + (me.cduN + me.cduR) + ' × ' + me.cduSize + ' kW CDUs, TCS 30–40 °C, ' + (me.dcN + me.dcR) + ' dry-cooler / tower units for the warm-water loop.',
        '液冷：' + (me.cduN + me.cduR) + '台×' + me.cduSize + ' kW CDU，TCS 30–40 °C，温水环路配' + (me.dcN + me.dcR) + '台干冷器/冷却塔。');
    add('ME', 'Server inlet 18–27 °C (ASHRAE); estimated annual PUE ' + fmt(R.eff.pue, 2) + ' (design-day ' + fmt(R.eff.puePeak, 2) + '); WUE ≈ ' + fmt(R.eff.wue, 2) + ' L/kWh.',
        '服务器进风18–27 °C（ASHRAE）；预计年均PUE ' + fmt(R.eff.pue, 2) + '（设计日' + fmt(R.eff.puePeak, 2) + '）；WUE约' + fmt(R.eff.wue, 2) + ' L/kWh。');
    add('CS', 'White space ≈ ' + fmt(sp.ws, 0) + ' m² in ' + sp.halls + ' hall(s); GFA ≈ ' + fmt(sp.gfa, 0) + ' m² on ' + p.floors + ' floor(s); site ≈ ' + fmt(sp.siteNeed / 10000, 2) + ' ha.',
        '白区约' + fmt(sp.ws, 0) + ' m²，' + sp.halls + '个机房；总建筑面积约' + fmt(sp.gfa, 0) + ' m²，' + p.floors + '层；用地约' + fmt(sp.siteNeed / 10000, 2) + '公顷。');
    add('CS', 'Floor live load ≥ ' + sp.floorLoad + ' kN/m² (heaviest rack ≈ ' + fmt(sp.heavyRack, 0) + ' kg); clear height ' + sp.clearH + '; seismic design to SNI 1726:2019 (' + p.seismic + ' hazard).',
        '楼面活荷载≥' + sp.floorLoad + ' kN/m²（最重机柜约' + fmt(sp.heavyRack, 0) + ' kg）；净高' + sp.clearHzh + '；按SNI 1726:2019抗震设计（' + ({ low: '低', med: '中', high: '高' }[p.seismic] || p.seismic) + '风险）。');
    add('FS', R.fs.suppression[0], R.fs.suppression[1]);
    add('SC', R.fs.securityLayers + '-layer physical security; ≈ ' + R.fs.cams + ' cameras (≥ 90-day retention), ≈ ' + R.fs.readers + ' access-controlled doors.',
        R.fs.securityLayers + '层物理安防；约' + R.fs.cams + '台摄像机（录像≥90天），约' + R.fs.readers + '个门禁门。');
    add('MC', 'BMS (≈ ' + fmt(R.fs.bmsPts) + ' points), EPMS (≈ ' + R.fs.meters + ' meters), DCIM with PUE/WUE dashboards (ISO/IEC 30134).',
        'BMS（约' + fmt(R.fs.bmsPts) + '点）、EPMS（约' + R.fs.meters + '块表计）、DCIM提供PUE/WUE仪表盘（ISO/IEC 30134）。');
    add('OPS', 'Operations ≈ ' + R.staff.fte + ' FTE for 24/7 coverage; licensing via OSS-RBA (KBLI 63102), PSE registration, PBG/SLF and environmental approval.',
        '运营约' + R.staff.fte + '人实现7×24覆盖；通过OSS-RBA办理许可（KBLI 63102）、PSE登记、PBG/SLF及环境审批。');
    return L;
  }

  /* ------------------------------------------------------------- risks */
  function risks(p, R) {
    var L = [], c = R.cap, coolObj = R.cool.obj;
    function add(lv, en, zh, men, mzh) { L.push({ lv: lv, en: en, zh: zh, m: [men, mzh] }); }
    var lim = coolLimit(R.cool.tech, c, R.stdP, R.hdP);
    if (c.maxDens > lim && lim > 0) add('H', 'Rack density ' + fmt(c.maxDens, 0) + ' kW exceeds the practical limit of ' + coolObj.en + ' (≈ ' + lim + ' kW/rack).', '机柜密度' + fmt(c.maxDens, 0) + ' kW超出' + coolObj.zh + '的实际上限（约' + lim + ' kW/柜）。', 'Adopt direct liquid cooling or rear-door heat exchangers for high-density racks.', '高密度机柜采用冷板液冷或背板换热。');
    if ((R.cool.tech === 'DLC' || R.cool.tech === 'IMM') && lim === 0) add('H', 'The selected IT platforms are air-cooled — ' + coolObj.en + ' needs liquid-ready servers.', '所选IT平台为风冷——' + coolObj.zh + '需要支持液冷的服务器。', 'Choose cold-plate (DLC-ready) platforms or an air-based cooling system.', '选择支持冷板液冷的平台或风冷系统。');
    if (c.hdR > 0 && R.hdP.cool === 'DLC' && R.cool.tech !== 'DLC' && R.cool.tech !== 'IMM') add('H', R.hdP.en + ' requires direct-to-chip liquid cooling, but the selected cooling is air-based.', R.hdP.zh + '需要冷板液冷，但所选制冷为风冷。', 'Select direct liquid cooling (CDU + warm-water loop).', '选择冷板液冷（CDU+温水环路）。');
    if (R.hdP.provisional && c.hdR > 0) add('M', R.hdP.en + ' specifications are provisional (roadmap product).', R.hdP.zh + '规格为暂定（路线图产品）。', 'Design power/cooling headroom and confirm with the vendor before freezing the BoD.', '预留电力/制冷余量，冻结设计依据前与厂商确认。');
    if (!R.sp.siteOK) add('H', 'Available site (' + fmt(p.siteArea / 10000, 2) + ' ha) is smaller than required (' + fmt(R.sp.siteNeed / 10000, 2) + ' ha).', '可用场地（' + fmt(p.siteArea / 10000, 2) + '公顷）小于需求（' + fmt(R.sp.siteNeed / 10000, 2) + '公顷）。', 'Increase storeys, move plant to roof, reduce phases or acquire adjacent land.', '增加层数、设备上屋面、减少分期或购置相邻土地。');
    if (!R.el.gridOK) add('H', 'PLN capacity offered (' + fmt(p.gridMVA, 1) + ' MVA) is below maximum demand (' + fmt(R.el.mva, 1) + ' MVA).', 'PLN可供容量（' + fmt(p.gridMVA, 1) + ' MVA）低于最大需量（' + fmt(R.el.mva, 1) + ' MVA）。', 'Negotiate staged capacity with PLN, phase the build, or add on-site generation / BESS.', '与PLN协商分期供电、分期建设或增设现场发电/储能。');
    if (p.tier >= 3 && p.fuelH < 12) add('H', 'Fuel autonomy below 12 h does not meet Uptime Tier III/IV.', '燃油自持低于12 h，不满足Uptime Tier III/IV。', 'Increase bulk storage to ≥ 12 h at N load.', '将储油提高至N负荷下≥12 h。');
    if (R.cool.tech === 'IEC' && R.L.cls === 'TROP') add('H', 'Indirect evaporative cooling performs poorly in lowland tropical climates (design wet-bulb ≈ ' + R.L.wb + ' °C).', '间接蒸发冷却在低地热带气候（设计湿球约' + R.L.wb + ' °C）下效果差。', 'Use water-cooled chillers with elevated chilled water, or liquid cooling.', '采用高温冷冻水的水冷冷机或液冷。');
    if (p.waterScarce && (R.cool.airTech === 'WCCH' || R.cool.tech === 'IEC')) add('H', 'Selected cooling uses significant water (WUE ≈ ' + fmt(R.eff.wue, 2) + ' L/kWh) at a water-constrained site.', '所选制冷耗水量大（WUE约' + fmt(R.eff.wue, 2) + ' L/kWh），而场地水源受限。', 'Prefer air-cooled chillers or closed-loop liquid cooling with dry coolers; secure recycled water.', '优先风冷冷机或闭式液冷+干冷器；落实再生水。');
    if (p.targetPUE > 0 && R.eff.pue > p.targetPUE + 0.02) add('M', 'Estimated PUE ' + fmt(R.eff.pue, 2) + ' is above the target ' + fmt(p.targetPUE, 2) + '.', '预计PUE ' + fmt(R.eff.pue, 2) + '高于目标' + fmt(p.targetPUE, 2) + '。', 'Raise supply temperatures, eco-mode UPS, liquid cooling or highland siting.', '提高供水/送风温度、UPS节能模式、液冷或高原选址。');
    if (c.type.id === 'AI') add('M', 'Synchronous GPU load swings (tens of % within seconds) stress UPS, generators and the PLN grid.', 'GPU同步负荷波动（数秒内数十个百分点）冲击UPS、发电机及PLN电网。', R.el.bess ? 'BESS included for smoothing; confirm ramp-rate limits with PLN.' : 'Add BESS / UPS buffering and agree ramp-rate limits with PLN.', R.el.bess ? '已配置储能平抑；与PLN确认爬坡率限值。' : '增设储能/UPS缓冲并与PLN约定爬坡率限值。');
    if (p.battery === 'LI' || R.el.bess) add('M', 'Lithium-ion batteries / BESS introduce thermal-runaway fire risk.', '锂电池/储能存在热失控火灾风险。', 'LFP chemistry, UL 9540A-tested systems, off-gas detection and NFPA 855 separation.', '采用磷酸铁锂、UL 9540A测试系统、逸出气体探测及NFPA 855间距。');
    var hv = R.el.hv, gEn = R.grid ? R.grid.en : '', gZh = R.grid ? R.grid.zh : '';
    if (hv.kv > 20) add('M', 'The ' + hv.name + ' connection needs a dedicated GIS substation' + (hv.ibt ? ' with ' + hv.ibt.ratio + ' interbus transformers' : '') + ' and ≈ ' + hv.lead + ' months of PLN works.', hv.name + '接入需专用GIS变电站' + (hv.ibt ? '及' + hv.ibt.ratio + '联络变压器' : '') + '，PLN工程约需' + hv.lead + '个月。', 'Start the PLN application (SLO, PJBTL) at feasibility; consider phased energisation.', '可研阶段即启动PLN申请（SLO、供电协议）；考虑分期送电。');
    if (hv.asm.c === 'no' && !hv.intl && hv.avail) add('H', hv.name + ': ' + hv.asm.en, hv.name + '：' + hv.asm.zh, 'Use the recommended ' + kvName(hv.rule) + ' connection.', '采用建议的' + kvName(hv.rule) + '接入。');
    else if (hv.asm.c === 'opt' && hv.kv !== hv.rule) add('L', hv.name + ' (instead of the rule ' + kvName(hv.rule) + '): ' + hv.asm.en, hv.name + '（规则值为' + kvName(hv.rule) + '）：' + hv.asm.zh, 'Confirm the choice with PLN in the connection evaluation request.', '在接入评估申请中与PLN确认该方案。');
    else if (hv.asm.c === 'opt' && hv.circ > 3) add('M', hv.asm.en, hv.asm.zh, 'Plan several substations / connection points with PLN (RUPTL).', '与PLN（RUPTL）规划多座变电站/接入点。');
    var gi = R.gimp;
    if (gi) {
      if (gi.tdd > gi.tddLimit) add('M', 'Estimated harmonic current distortion ' + fmt(gi.tdd, 1) + ' % TDD exceeds the Grid Code limit ' + fmt(gi.tddLimit, 1) + ' % at ' + hv.name + ' (Isc/IL ≈ ' + fmt(gi.scr, 0) + ').', '估算谐波电流畸变' + fmt(gi.tdd, 1) + '% TDD超出' + hv.name + '电网规范限值' + fmt(gi.tddLimit, 1) + '%（Isc/IL约' + fmt(gi.scr, 0) + '）。', 'Active harmonic filters on the drive loads (chillers, pumps, fans); confirm in the harmonic study.', '在驱动负荷（冷机、水泵、风机）上加装有源滤波器；以谐波研究确认。');
      if (gi.dvAi > 2) add('H', 'AI load swings (' + fmt(gi.swing, 0) + ' % of ' + fmt(gi.aiKW / 1000, 1) + ' MW) give ≈ ' + fmt(gi.dvAi, 1) + ' % voltage steps — above the 2 % Grid Code limit for repeated steps.', 'AI负荷波动（' + fmt(gi.aiKW / 1000, 1) + ' MW的' + fmt(gi.swing, 0) + '%）造成约' + fmt(gi.dvAi, 1) + '%电压阶跃——超过电网规范2%的重复阶跃限值。', 'BESS / UPS power smoothing, GPU power capping, or a stronger connection point.', '储能/UPS功率平滑、GPU功率封顶或更强的接入点。');
      if (gi.llc !== 'std') add(gi.llc === 'vlarge' ? 'H' : 'M', 'Voltage-sensitive load of ≈ ' + fmt(gi.lossMW, 0) + ' MW could transfer to UPS batteries during one grid fault (NERC 2025–2026 large-load alerts).', '约' + fmt(gi.lossMW, 0) + ' MW的电压敏感负荷可能在一次电网故障中同时转入UPS电池（NERC 2025–2026大负荷警示）。', 'Agree ride-through settings and staged re-transfer with PLN; include it in the grid impact study.', '与PLN约定穿越设定及分级回切；纳入电网影响研究。');
      if (gi.scr < 20) add(gi.scr < 10 ? 'H' : 'M', 'Low short-circuit ratio at ' + hv.name + ' (Isc/IL ≈ ' + fmt(gi.scr, 0) + '): losing the whole load at once would shift the voltage by ≈ ' + fmt(gi.dvLoss, 1) + ' %, and the strictest harmonic limits apply.', hv.name + '短路比偏低（Isc/IL约' + fmt(gi.scr, 0) + '）：全部负荷同时失去将使电压变化约' + fmt(gi.dvLoss, 1) + '%，并适用最严格的谐波限值。', 'Connect at a higher voltage or to a stronger PLN substation; re-transfer the load in blocks ≤ ' + fmt(gi.blk3, 0) + ' MVA; dynamic studies in the grid impact study.', '提高接入电压或接入更强的PLN变电站；负荷分块回切（每块≤' + fmt(gi.blk3, 0) + ' MVA）；在电网影响研究中开展动态研究。');
    }
    if (hv.intl) add('M', '220/230 kV is not a PLN transmission voltage (PLN uses 150, 275 and 500 kV).', '220/230 kV不是PLN输电电压等级（PLN采用150、275、500 kV）。', 'Applies to sites outside Indonesia; in Indonesia use 150, 275 or 500 kV.', '仅适用于印尼以外站点；印尼境内采用150、275或500 kV。');
    else if (!hv.avail) add('H', hv.name + ' is not available in the ' + gEn + '.', gZh + '无' + hv.name + '电压等级。', 'Use a voltage available in this PLN system (recommended ' + kvName(hv.rule) + ').', '采用该PLN电网现有电压等级（建议' + kvName(hv.rule) + '）。');
    else if (hv.avail === 3) add('M', hv.name + ' in the ' + gEn + ' is planned (RUPTL), not yet in service — timing risk.', gZh + '的' + hv.name + '为规划（RUPTL）尚未投运——存在时间风险。', 'Confirm the RUPTL schedule with PLN; phase the campus or connect early phases at a lower voltage.', '与PLN确认RUPTL进度；园区分期或早期以较低电压接入。');
    else if (hv.avail === 2) add('L', hv.name + ' is limited / legacy in the ' + gEn + '.', gZh + '的' + hv.name + '为有限/存量网络。', 'Confirm available capacity and the nearest substation with PLN.', '与PLN确认可用容量及最近变电站。');
    if (R.grid && R.grid.rel !== 'high') add('M', 'Grid reliability in ' + R.L.provEn + ' (' + R.grid.en + ') is lower than JAMALI.', R.L.provZh + '电网（' + R.grid.zh + '）可靠性低于JAMALI电网。', 'Longer fuel autonomy, generator run-hours budget and BESS for grid support.', '延长燃油自持、预留发电机运行小时并配置储能支撑电网。');
    if (c.itMW >= 5) add('M', 'Long-lead equipment (transformers, generators, MV switchgear) currently 12–24 months.', '长周期设备（变压器、发电机、中压开关柜）交期12–24个月。', 'Early procurement / reservation agreements and framework contracts.', '提前采购/产能预留及框架合同。');
    if (p.seismic === 'high') add('M', 'High seismic hazard at ' + R.L.en + '.', R.L.zh + '地震风险高。', 'Importance factor 1.5, seismic bracing of MEP and racks, base isolation option (SNI 1726:2019).', '重要性系数1.5，机电及机柜抗震支撑，可考虑隔震（SNI 1726:2019）。');
    if (p.flood !== 'low') add(p.flood === 'high' ? 'H' : 'M', 'Flood exposure at ' + R.L.en + '.', R.L.zh + '存在洪水风险。', 'Raise finished floor above the 100-year flood + freeboard, critical plant on upper levels, flood barriers.', '室内地坪高于百年一遇洪水位并留超高，关键设备上置，设防洪挡板。');
    if (p.phases >= 5) add('L', 'Many phases increase stranded capacity and tie-in risk to live systems.', '分期过多会增加搁浅容量及与在运系统接驳的风险。', 'Pre-install shared infrastructure with isolation points.', '预装共用基础设施并设隔离点。');
    if (p.renewable >= 50) add('L', 'RECs alone do not add new renewable capacity (additionality).', '仅靠绿证无法新增可再生能源容量（额外性）。', 'Combine PLN RECs with rooftop solar (PLTS Atap) and long-term PPAs as RUPTL allows.', '结合PLN绿证、屋顶光伏及RUPTL允许的长期购电协议。');
    if (R.fin && p.revModel === 'lease' && R.fin.irrTV !== null && R.fin.irrTV < p.wacc / 100) add('H', 'Project IRR (incl. exit value) ' + fmt(R.fin.irrTV * 100, 1) + '% is below the discount rate ' + p.wacc + '%.', '项目IRR（含终值）' + fmt(R.fin.irrTV * 100, 1) + '%低于折现率' + p.wacc + '%。', 'Review pricing, phasing, CAPEX and ramp-up assumptions.', '复核定价、分期、投资及爬坡假设。');
    if (!L.length) add('L', 'No critical risks identified at this planning level.', '在当前规划深度下未识别关键风险。', 'Validate with site surveys and utility studies.', '通过场地勘察及电网研究进行验证。');
    var order = { H: 0, M: 1, L: 2 };
    return L.sort(function (a, b) { return order[a.lv] - order[b.lv]; });
  }

  /* --------------------------------------------------------------- BOQ */
  function boq(p, R) {
    var B = [], el = R.el, me = R.me, sp = R.sp, c = R.cap;
    function add(id, qty, unit, rating, note, noteZh, unitZh) { var e = find(DB.equipment, id); B.push({ id: id, sys: e ? e.sys : '', en: e ? e.en : id, zh: e ? e.zh : id, qty: qty, unit: unit, unitZh: unitZh || unit, rating: rating || '', note: note || '', noteZh: noteZh || note || '' }); }
    var fr = el.feedsPerRack, sp0 = R.stdP, hp0 = R.hdP, integ = function (pl) { return !!(pl && ((pl.cat === 'AI' && pl.kw >= 100) || pl.id === 'OCP-ORV3')); }, rpN = function (r) { return r ? fr * r[2] : 0; };
    var taps = c.stdR * fr * Math.max(1, el.rStd[2]) + (c.hdR ? c.hdR * fr * (el.rHd && el.rHd[2] ? el.rHd[2] : ceil(c.hd / 43)) : 0);
    var hv = el.hv, mvB = hv.mv.boards;
    add('EL-01', mvB * (p.tier >= 3 ? 3 : 2) + el.txTotal + Math.max(1, ceil(el.txTotal * 0.2)) + (el.genV === 'MV' ? el.genTotal : 0), 'panels', '24 kV · ' + fmt(hv.mv.busA) + ' A · ' + hv.mv.ik + ' kA' + (hv.kv > 20 ? ' (from ' + hv.name + ' substation)' : ''),
      mvB + ' board(s): incomers + bus coupler, ' + el.txTotal + ' transformer feeders' + (el.genV === 'MV' ? ', ' + el.genTotal + ' generator incomers' : ''), mvB + '段：进线+母联，' + el.txTotal + '路变压器馈线' + (el.genV === 'MV' ? '，' + el.genTotal + '路发电机进线' : ''), '面');
    if (hv.kv > 20) {
      var bays = hv.circ + hv.ht.total + (hv.ibt ? hv.ibt.total * 2 : 0) + (p.tier >= 3 ? 2 : 1);
      add('EL-24', bays, 'bays', hv.ur + ' kV · ' + hv.ik + ' kA · ' + fmt(hv.busA) + ' A', hv.circ + ' line + ' + (hv.ibt ? hv.ibt.total + ' interbus (EHV + 150 kV) + ' : '') + hv.ht.total + ' transformer + coupler bays · ' + hv.scheme[0], hv.circ + '回线路+' + (hv.ibt ? hv.ibt.total + '个联络变间隔（超高压及150 kV）+' : '') + hv.ht.total + '个主变间隔+母联 · ' + hv.scheme[1], '个间隔');
      if (hv.ibt) add('EL-25', hv.ibt.total, 'no.', hv.ibt.mva + ' MVA ' + hv.ibt.ratio, 'Interbus transformers (single-phase banks)', '联络变压器（单相组）', '台');
      add('EL-25', hv.ht.total, 'no.', hv.ht.mva + ' MVA ' + hv.ht.ratio + ' · uk ' + hv.ht.uk + ' %', (hv.ht.split ? 'Split-winding, ' : '') + 'ONAN ' + hv.ht.onan + ' / ONAF ' + hv.ht.mva + ' MVA', (hv.ht.split ? '分裂绕组，' : '') + 'ONAN ' + hv.ht.onan + '/ONAF ' + hv.ht.mva + ' MVA', '台');
      add('EL-26', hv.ht.total, 'no.', '40 Ω · 300 A · 10 s', 'One per HV/MV transformer (20 kV neutral)', '每台主变一台（20 kV中性点）', '台');
    }
    add('EL-02', el.txTotal, 'no.', el.txSize + ' kVA', el.txLabel + ' · uk ' + el.lv.uk + ' %');
    add('EL-03', el.txTotal, 'line-ups', fmt(el.lv.acb) + ' A · ' + el.lv.icw + ' kA', 'One per transformer', '每台变压器一组', '组');
    add('EL-04', el.genTotal, 'no.', el.genSize + ' kWe', el.genLabel + ', COP/DCC · ' + (el.genV === 'MV' ? '20 kV paralleled plant' : '400 V'), el.genLabel + '，持续功率 · ' + (el.genV === 'MV' ? '20 kV并机' : '400 V'), '台');
    if (el.genTotal > 1) add('EL-05', Math.max(1, ceil(el.genTotal / 10)), 'systems', '', 'Redundant controllers');
    add('EL-06', el.tanks, 'tanks', el.tankSize + ' m³', fmt(el.fuelL / 1000, 0) + ' m³ total, ' + p.fuelH + ' h');
    add('EL-07', Math.max(2, Math.round(el.txTotal / 2)), 'no.', '1,600–3,200 A', 'Mechanical boards');
    add('EL-09', el.upsTotal, 'systems', el.upsSize + ' kW', el.upsLabel);
    add(p.battery === 'LI' ? 'EL-10' : 'EL-11', Math.round(el.battKWh), 'kWh', p.upsMin + ' min', 'EOL sizing');
    if (el.bess) add('EL-23', el.bess.containers, 'containers', fmt(el.bess.mw, 1) + ' MW / ' + fmt(el.bess.mwh, 1) + ' MWh', 'LFP, ' + el.bess.h + ' h');
    if (el.useBusway) add('EL-13', el.busways, 'runs', el.bwA + ' A' + (el.bwHdA && el.bwHdA !== el.bwA ? ' / HD ' + el.bwHdA + ' A' : ''), el.rows + ' rows × ' + fr + ' (A/B) · ≈ ' + fmt(taps, 0) + ' tap-off units (1 per rack per feed, more for HD racks)', el.rows + '排 × ' + fr + '（A/B）· 约' + fmt(taps, 0) + '个插接箱（每柜每路1个，高密度机柜更多）', '条');
    else add('EL-12', el.pdus, 'no.', '150 kVA', 'A/B pairs', 'A/B成对', '台');
    if (el.rpdus) add('EL-14', el.rpdus, 'no.', el.rStd[0] + (el.rHd && el.rHd[2] && el.rHd[0] !== el.rStd[0] ? ' · HD: ' + el.rHd[0] : ''),
      fmt(c.stdR, 0) + ' standard racks × ' + rpN(el.rStd) + (el.rStd[2] ? '' : ' (power shelves)') + (c.hdR ? ' + ' + fmt(c.hdR, 0) + ' HD racks × ' + rpN(el.rHd) + (el.rHd && !el.rHd[2] ? ' (OEM power shelves fed by busway tap-offs)' : '') : '') + ' — A + B feeds',
      fmt(c.stdR, 0) + '个标准机柜 × ' + rpN(el.rStd) + (el.rStd[2] ? '' : '（电源架）') + (c.hdR ? ' + ' + fmt(c.hdR, 0) + '个高密度机柜 × ' + rpN(el.rHd) + (el.rHd && !el.rHd[2] ? '（OEM电源架，由母线插接箱供电）' : '') : '') + '——A+B双路', '条');
    if (R.gimp && R.gimp.ahf) add('EL-17', Math.max(1, Math.round(el.txTotal / 2)), 'no.', '300 A', 'TDD est. ' + fmt(R.gimp.tddNo, 1) + ' % without filters vs Grid Code limit ' + fmt(R.gimp.tddLimit, 1) + ' %', '无滤波估算TDD ' + fmt(R.gimp.tddNo, 1) + '%，电网规范限值' + fmt(R.gimp.tddLimit, 1) + '%');
    add('EL-18', 1, 'lot', '≤ 1 Ω', 'Mesh-BN + TMGB/TGB');
    add('EL-19', 1, 'lot', 'LPL I/II', 'SPD Type 1+2/2/3');
    add('EL-21', Math.round(c.itKW), 'kW', 'Rack + portable', 'Rental for L4/L5');
    if (me.cracN) add('ME-09', me.cracN + me.cracR, 'no.', me.cracSize + ' kW', redLabel(me.cracN, me.cracR));
    if (me.chN && R.cool.airTech === 'WCCH') add('ME-01', me.chN + me.chR, 'no.', fmt(me.chSize, 0) + ' kW', me.chLabel);
    if (me.chN && R.cool.airTech === 'ACCH') add('ME-02', me.chN + me.chR, 'no.', fmt(me.chSize, 0) + ' kW', me.chLabel);
    if (me.ctN) add('ME-03', me.ctN + me.ctR, 'cells', fmt(me.rejKW / me.ctN, 0) + ' kW', redLabel(me.ctN, me.ctR));
    if (me.pumps) add('ME-04', me.pumps, 'no.', '', 'CHW' + (R.cool.airTech === 'WCCH' ? ' + CW' : ''));
    if (me.tesM3) add('ME-06', Math.max(1, ceil(me.tesM3 / 400)), 'tanks', fmt(me.tesM3, 0) + ' m³ total', '10 min');
    if (me.term) add(me.term.id, me.term.n + me.term.r, 'no.', (me.term.cap || me.term.size) + ' kW', redLabel(me.term.n, me.term.r) + (me.term.cap && me.term.cap !== me.term.size ? ' · server ΔT ' + fmt(me.cp.airDT, 0) + ' K' : ''), redLabel(me.term.n, me.term.r) + (me.term.cap && me.term.cap !== me.term.size ? ' · 服务器温差' + fmt(me.cp.airDT, 0) + ' K' : ''));
    if (me.rdhx) add('ME-11', me.rdhx, 'no.', '≈ ' + fmt(c.hd, 0) + ' kW racks', 'Rear-door HX on high-density racks');
    if (me.iecN) add('ME-14', me.iecN + me.iecR, 'modules', '400 kW', redLabel(me.iecN, me.iecR));
    if (me.cduN) add('ME-12', me.cduN + me.cduR, 'no.', me.cduSize + ' kW', redLabel(me.cduN, me.cduR));
    if (me.dcN) add('ME-15', me.dcN + me.dcR, 'no.', '1,500 kW', redLabel(me.dcN, me.dcR));
    if (me.tanks) add('ME-13', me.tanks, 'tanks', '100 kW', '');
    add('ME-16', 1, 'lot', '', 'Dual headers / ring');
    if (R.cool.airTech === 'WCCH') add('ME-17', 1, 'lot', '', 'CoC 4–6');
    add('ME-18', 1, 'lot', '+5–15 Pa', '');
    if (integ(sp0)) add('IT-01', c.stdR, 'positions', sp0.u + 'U ' + sp0.w + '×' + sp0.d + ' mm', 'Standard rack positions: ' + sp0.en + ', ' + fmt(c.sd, 1) + ' kW — racks arrive integrated with the IT (rack-level integration)', '标准机柜位：' + sp0.zh + '，' + fmt(c.sd, 1) + ' kW——机柜随IT整柜集成到货', '个机柜位');
    else add('IT-01', c.stdR, 'cabinets', p.rackU + 'U ' + p.rackW + '×' + p.rackD + ' mm', 'Standard racks: ' + sp0.en + ', ' + fmt(c.sd, 1) + ' kW — facility supply', '标准机柜：' + sp0.zh + '，' + fmt(c.sd, 1) + ' kW——设施供货', '个机柜');
    if (c.hdR) add('IT-01', c.hdR, integ(hp0) ? 'positions' : 'cabinets', hp0.u + 'U ' + hp0.w + '×' + hp0.d + ' mm',
      integ(hp0) ? 'High-density rack positions: integrated cabinet arrives with the IT system (' + fmt(c.hd, 0) + ' kW)' : 'High-density cabinets: ' + fmt(c.hd, 0) + ' kW — facility supply',
      integ(hp0) ? '高密度机柜位：集成机柜随IT系统到货（' + fmt(c.hd, 0) + ' kW）' : '高密度机柜：' + fmt(c.hd, 0) + ' kW——设施供货', integ(hp0) ? '个机柜位' : '个机柜');
    if (c.hdR && hp0.gpu) { var spr = hp0.spr || 1, nsys = Math.max(1, ceil(c.hdR * spr - 1e-9)), gps = Math.round(hp0.gpu / spr);
      add('IT-08', nsys, 'systems', hp0.en, gps + ' GPUs per system · ' + fmt(c.hdR * hp0.gpu, 0) + ' GPUs inside the ' + fmt(c.hdR, 0) + ' HD racks above — IT scope, reference (not additional racks)',
        '每系统' + gps + '颗GPU · 位于上述' + fmt(c.hdR, 0) + '个高密度机柜内，共' + fmt(c.hdR * hp0.gpu, 0) + '颗GPU——IT范围，仅供参考（非额外机柜）', '套'); }
    add('IT-02', Math.max(1, ceil(el.rows / 2)), 'pods', R.cool.tech === 'DLC' ? 'HAC' : 'HAC/CAC', '');
    add('IT-03', 1, 'lot', 'OS2 + OM4/OM5', 'MPO trunks');
    add('IT-10', p.tier >= 3 ? 2 : 1, 'rooms', '', p.tier >= 3 ? 'Diverse entries' : '');
    add('FP-01', 1, 'system', 'Addressable', '');
    add('FP-02', R.fs.asd, 'detectors', 'Class A', '');
    if (R.fs.gasZones) add('FP-03', R.fs.gasZones, 'zones', fmt(R.fs.agentKg, 0) + ' kg HFC-227ea eq.', '≤ 800 m² per zone');
    add('FP-05', Math.max(1, sp.halls), 'zones', 'Double interlock', '');
    add('FP-07', 1, 'lot', '± 1 m', '');
    if (p.battery === 'LI' || el.bess) add('FP-08', el.upsTotal + (el.bess ? el.bess.containers : 0), 'rooms/containers', '', 'NFPA 855');
    add('SC-01', R.fs.readers, 'doors', 'Card + biometric', '');
    add('SC-02', R.fs.cams, 'cameras', '4–8 MP', '90 days');
    add('SC-03', 1, 'lot', '≥ 2.4 m', '');
    add('SC-04', Math.max(1, sp.halls > 2 ? 2 : 1), 'no.', '', '');
    add('MC-01', R.fs.bmsPts, 'points', 'BACnet/IP', '');
    add('MC-02', R.fs.meters, 'meters', 'Class A / 0.5S', '');
    add('MC-03', 1, 'system', '', '');
    add('CS-01', Math.round(sp.gfa), 'm² GFA', sp.floorLoad + ' kN/m²', p.floors + ' floor(s)');
    if (sp.raised) add('CS-02', Math.round(sp.ws), 'm²', '600 × 600', '');
    add('CS-07', p.floors > 1 ? 1 : 0, 'lift', '≥ 3,000 kg', '');
    return B.filter(function (b) { return b.qty > 0; });
  }

  function similar(p, itMW) {
    if (!DB.references) return [];
    return DB.references.map(function (r) {
      var mw = r.kind === 'arch' ? (r.input.itMW || (r.input.racks || 0) * 0.009) : (r.mw || 0);
      var d = Math.abs(Math.log((mw || 0.1) / Math.max(itMW, 0.1))) + (r.type === p.type ? 0 : 0.8) + (r.kind === 'real' && r.country !== 'ID' ? 0.3 : 0);
      return { r: r, d: d };
    }).sort(function (a, b) { return a.d - b.d; }).slice(0, 4).map(function (x) { return x.r; });
  }

  g.DCEngine = { assess: assess, defaults: defaults, fmt: fmt, redLabel: redLabel, find: find, capacity: capacity, coolingMatrix: coolingMatrix,
                 loc: loc, plat: plat, redundancy: redundancy, ID_CAPEX: ID_CAPEX, BESS_USD_KWH: BESS_USD_KWH, K: K,
                 KV: KV, KV_GRID: KV_GRID, kvRule: kvRule, kvName: kvName, connection: connection, connAssess: connAssess, HT_STD: HT_STD, htUk: htUk,
                 COOLDEF: COOLDEF, coolParams: coolParams, coolModel: coolModel, gridImpact: gridImpact, GRID_CODE: GRID_CODE, TDD_TBL: TDD_TBL, THDV_LIM: THDV_LIM, CLEAR_MS: CLEAR_MS };
})(typeof window !== 'undefined' ? window : globalThis);
