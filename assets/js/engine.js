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
  function liquidSplit(cool, cap, sp, hp) {
    var liq = 0;
    if (cool === 'DLC') liq = cap.hdR * cap.hd * (hp.cool === 'DLC' ? hp.liq : 0.8) + (sp.cool === 'DLC' ? cap.stdR * cap.sd * sp.liq : 0);
    if (cool === 'IMM') liq = (cap.hdR * cap.hd + cap.stdR * cap.sd) * 0.95;
    if ((cool === 'DLC') && liq === 0) liq = cap.itKW * 0.75;
    return Math.min(liq, cap.itKW);
  }
  function airTechFor(cool, itMW, waterScarce) { return (cool === 'DLC' || cool === 'IMM') ? ((waterScarce || itMW < 5) ? 'ACCH' : 'WCCH') : cool; }
  function pueModel(cool, p, cap, L) {
    var sp = plat(p.stdPlat), hp = plat(p.hdPlat);
    var liquid = liquidSplit(cool, cap, sp, hp), air = cap.itKW - liquid;
    var airTech = airTechFor(cool, cap.itMW, p.waterScarce);
    var mech = (air * mechCoef(airTech, L) + liquid * (cool === 'IMM' ? liqCoef('IMM', L) : (cool === 'DLC' ? liqCoef('DLC', L) : 0))) / cap.itKW;
    var elec = ELEC[clamp(Math.round(num(p.tier, 3)), 1, 4)] - (p.eco ? 0.025 : 0);
    var misc = cap.itMW >= 30 ? 0.010 : (cap.itMW >= 2 ? 0.015 : 0.02);
    var wue = (air * wueCoef(airTech, L) + liquid * wueCoef('LIQ', L)) / cap.itKW;
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

  /* ============================================================ ASSESS */
  function assess(p) {
    p = Object.assign({}, p);
    var L = loc(p.loc);
    p.tier = clamp(Math.round(num(p.tier, 3)), 1, 4); p.floors = clamp(Math.round(num(p.floors, 2)), 1, 8);
    p.phases = clamp(Math.round(num(p.phases, 1)), 1, 12); p.life = clamp(Math.round(num(p.life, 20)), 5, 40);
    ['fuelH', 'upsMin', 'renewable', 'targetPUE', 'siteArea', 'gridMVA', 'price', 'markup', 'tariffIDR', 'fx', 'landPrice', 'waterPrice', 'capexOverride',
     'wacc', 'tax', 'rampYears', 'targetOcc', 'contingency', 'itCostKW', 'staffCost', 'kdb', 'exitMult', 'bessMW', 'bessH', 'rackW', 'rackD', 'rackU', 'phaseInterval', 'startYear']
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
    function pueAt(u) { u = clamp(u, 0.1, 1); return 1 + (m.mech + m.elec + m.misc) * (0.55 + 0.45 / u); }
    R.eff = { pue: m.pue, puePeak: m.puePeak, pue50: pueAt(0.5), mech: m.mech, elec: m.elec, misc: m.misc, wue: m.wue, pueAt: pueAt,
              gbGrade: m.pue <= 1.2 ? 1 : (m.pue <= 1.3 ? 2 : (m.pue <= 1.5 ? 3 : 0)) };

    /* ------------------------------------------------ electrical */
    var mechUPS = ((p.tier === 4 || avgDens >= 25) ? 0.06 * airKW : 0) + 0.025 * liquidKW;
    var upsLoad = itKW + mechUPS;
    var demandKW = itKW * m.puePeak + K.UPS_LOSS * upsLoad + Math.max(50, 0.01 * itKW);
    var demandKVA = demandKW / K.PF, mva = demandKVA / 1000;
    var volt, vclass;
    if (mva <= 2) { volt = ['LV/MV service (≤ 20 kV, PLN TM)', '低压/中压供电（≤20 kV，PLN中压）']; vclass = 'TM'; }
    else if (mva <= 30) { volt = ['MV 20 kV (PLN TM), dedicated feeders', '中压20 kV（PLN中压），专用馈线']; vclass = 'TM'; }
    else if (mva <= 300) { volt = ['HV 150 kV (PLN TT) with on-site substation', '高压150 kV（PLN高压），自建变电站']; vclass = 'TT'; }
    else { volt = ['EHV 500 kV / multiple 150 kV substations', '超高压500 kV/多座150 kV变电站']; vclass = 'TT'; }
    var feeds = p.tier >= 3 ? 2 : 1;
    var txSize = demandKVA <= 1600 ? pick([500, 630, 800, 1000, 1250, 1600], demandKVA / 0.8) : (demandKVA > 40000 ? 3150 : 2500);
    var txN = ceil(demandKVA / (txSize * K.TX_LOAD)), txR = redundancy(p.tier, txN, 'tx'); if (p.tier === 3 && txN === 1) txR = 1;
    var genSize;
    if (demandKW <= 1500) genSize = pick([300, 500, 800, 1000, 1250, 1500], demandKW / 0.95);
    else if (demandKW <= 12000) genSize = 2000; else if (demandKW <= 60000) genSize = 2500; else genSize = 3000;
    var genN = ceil(demandKW / (genSize * K.GEN_LOAD)), genR = redundancy(p.tier, genN, 'gen');
    var fuelLph = demandKW * K.FUEL_L_KWH, fuelL = fuelLph * p.fuelH;
    var tankSize = fuelL > 400000 ? 200 : (fuelL > 100000 ? 100 : (fuelL > 20000 ? 50 : 20));
    var tanks = Math.max(p.tier >= 3 ? 2 : 1, ceil(fuelL / 1000 / tankSize));
    var upsSize = upsLoad <= 250 ? 300 : (upsLoad <= 1000 ? 500 : (upsLoad <= 6000 ? 1200 : 1600));
    var upsN = ceil(upsLoad / (upsSize * K.UPS_LOAD)), upsR = redundancy(p.tier, upsN, 'ups');
    var battKWh = (upsN + upsR) * upsSize * (p.upsMin / 60) * K.BATT_AGE / K.BATT_EFF;
    var feedsPerRack = p.tier >= 2 ? 2 : 1;
    var stdW = p.rackW || sp.w || 600, stdD = p.rackD || sp.d || 1200;
    var rows = ceil(racks / (stdW >= 800 ? 16 : 20));
    var useBusway = itKW >= 1000 || avgDens >= 10;
    var rowKW = itKW / rows;
    var bwA = pick([160, 250, 400, 630, 800, 1000, 1250, 1600], rowKW / (K.BW_V * 1.732 * K.BW_F));
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
    if (p.bessOn && p.bessMW > 0) {
      var mwh = p.bessMW * Math.max(0.25, p.bessH);
      bess = { mw: p.bessMW, mwh: mwh, h: p.bessH, containers: ceil(mwh / K.BESS_MWH_BOX), area: ceil(mwh / K.BESS_MWH_BOX) * 40, capex: mwh * 1000 * BESS_USD_KWH };
    }
    R.el = { upsLoad: upsLoad, mechUPS: mechUPS, demandKW: demandKW, demandKVA: demandKVA, mva: mva, volt: volt, vclass: vclass, feeds: feeds,
             txSize: txSize, txN: txN, txR: txR, txTotal: txN + txR, genSize: genSize, genN: genN, genR: genR, genTotal: genN + genR,
             fuelLph: fuelLph, fuelL: fuelL, tankSize: tankSize, tanks: tanks, upsSize: upsSize, upsN: upsN, upsR: upsR, upsTotal: upsN + upsR,
             battKWh: battKWh, rows: rows, useBusway: useBusway, bwA: bwA, busways: busways, pdus: pdus, rpdus: rpdus, rStd: rStd, rHd: rHd,
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
      var chSize = airTech === 'WCCH' ? (chwLoad >= 20000 ? 3517 : (chwLoad >= 6000 ? 2461 : 1407)) : (chwLoad >= 3000 ? 1000 : 500);
      M.chSize = chSize; M.chN = Math.max(1, ceil(chwLoad / chSize)); M.chR = redundancy(p.tier, M.chN, 'plant'); M.chLabel = redLabel(M.chN, M.chR);
      if (airTech === 'WCCH') { M.ctN = M.chN; M.ctR = M.chR; M.rejKW = chwLoad * K.REJ; }
      M.pumps = (M.chN + M.chR) * (airTech === 'WCCH' ? 2 : 1);
      M.tesM3 = (p.tier >= 3 || avgDens >= 15) ? chwLoad * K.TES_S / (K.CP_W * K.CHW_DT) : 0;
      var airRackDens = (cool === 'DLC' || cool === 'IMM') ? sd : avgDens, term;
      if (airRackDens > 25) term = { en: 'In-row coolers (50 kW)', zh: '列间空调（50 kW）', size: 50, id: 'ME-10' };
      else if (itMW / Math.max(1, ceil(itMW / 4)) >= 2) term = { en: 'Fan walls (400 kW)', zh: '风墙（400 kW）', size: 400, id: 'ME-08' };
      else term = { en: 'CRAH units (150 kW)', zh: '冷冻水精密空调（150 kW）', size: 150, id: 'ME-07' };
      var termLoad = airKW;
      if (hdR > 0 && hp.cool === 'RDHX' && cool !== 'DLC' && cool !== 'IMM') { M.rdhx = hdR; termLoad = airKW - hdR * hd * 0.6; }
      term.n = ceil(Math.max(termLoad, 1) / term.size); term.r = redundancy(p.tier, term.n, 'term'); M.term = term;
    }
    if (liquidKW > 0) {
      var cduSize = liquidKW >= 3000 ? 1500 : 800;
      M.cduSize = cduSize; M.cduN = ceil(liquidKW / cduSize); M.cduR = Math.max(1, ceil(M.cduN / K.CDU_N_PER_R));
      M.dcN = ceil(liquidKW * 1.05 / K.DC_KW); M.dcR = redundancy(p.tier, M.dcN, 'plant');
      if (cool === 'IMM') M.tanks = ceil(liquidKW / 100);
    }
    M.waterDay = itKW * (num(p.targetOcc, 90) / 100) * 24 * m.wue / 1000;
    M.waterStore = M.waterDay / 24 * Math.max(12, p.fuelH);
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
    var subst = mva > 30 ? (mva > 300 ? 15000 : (mva > 120 ? 8000 : 4000)) : 150;
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
    var utility = mva > 30 ? Math.max(6e6, 0.12e6 * mva) : Math.max(0.3e6, 0.05e6 * mva);
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

    R.sched = schedule(p, itMW, mva, cool);
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
  function schedule(p, itMW, mva, cool) {
    var giant = itMW >= 200, big = itMW >= 30, med = itMW >= 5;
    var pre = giant ? 8 : (big ? 6 : (med ? 4 : 3)), permit = giant ? 15 : (big ? 12 : (med ? 9 : 6)), design = giant ? 10 : (big ? 9 : (med ? 7 : 5));
    var proc = giant ? 20 : (big ? 16 : (med ? 12 : 9)), cons = giant ? 22 : (big ? 20 : (med ? 15 : (itMW >= 1 ? 11 : 8)));
    if (p.prefab) cons = Math.round(cons * 0.75);
    var cx = big ? 4 : (med ? 3 : 2), util = mva > 300 ? 36 : (mva > 30 ? 24 : (mva > 2 ? 12 : 6));
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
    add('EL', 'PLN supply ≈ ' + fmt(el.mva, 1) + ' MVA maximum demand via ' + el.volt[0] + '; ' + el.feeds + ' feed(s)' + (p.tier >= 3 ? ' from diverse substations recommended.' : '.'),
        'PLN最大需量约' + fmt(el.mva, 1) + ' MVA，' + el.volt[1] + '；' + el.feeds + '路进线' + (p.tier >= 3 ? '，建议来自不同变电站。' : '。'));
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
    if (R.el.mva > 30) add('M', 'HV connection > 30 MVA needs a dedicated 150 kV substation and 18–36 months of PLN works.', '超过30 MVA的高压接入需专用150 kV变电站及18–36个月电网工程。', 'Start the PLN application (SLO, PJBTL) at feasibility; consider phased energisation.', '可研阶段即启动PLN申请（SLO、供电协议）；考虑分期送电。');
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
    add('EL-01', 3 + el.txTotal + Math.max(1, ceil(el.txTotal * 0.2)), 'panels', el.vclass === 'TT' ? '24 kV (from 150 kV substation)' : '24 kV', el.feeds + ' incomer(s) + bus coupler');
    add('EL-02', el.txTotal, 'no.', el.txSize + ' kVA', el.txLabel);
    add('EL-03', el.txTotal, 'line-ups', '4,000 A', 'One per transformer');
    add('EL-04', el.genTotal, 'no.', el.genSize + ' kWe', el.genLabel + ', COP/DCC');
    if (el.genTotal > 1) add('EL-05', Math.max(1, ceil(el.genTotal / 10)), 'systems', '', 'Redundant controllers');
    add('EL-06', el.tanks, 'tanks', el.tankSize + ' m³', fmt(el.fuelL / 1000, 0) + ' m³ total, ' + p.fuelH + ' h');
    add('EL-07', Math.max(2, Math.round(el.txTotal / 2)), 'no.', '1,600–3,200 A', 'Mechanical boards');
    add('EL-09', el.upsTotal, 'systems', el.upsSize + ' kW', el.upsLabel);
    add(p.battery === 'LI' ? 'EL-10' : 'EL-11', Math.round(el.battKWh), 'kWh', p.upsMin + ' min', 'EOL sizing');
    if (el.bess) add('EL-23', el.bess.containers, 'containers', fmt(el.bess.mw, 1) + ' MW / ' + fmt(el.bess.mwh, 1) + ' MWh', 'LFP, ' + el.bess.h + ' h');
    if (el.useBusway) add('EL-13', el.busways, 'runs', el.bwA + ' A', el.rows + ' rows × ' + fr + ' (A/B) · ≈ ' + fmt(taps, 0) + ' tap-off units (1 per rack per feed, more for HD racks)', el.rows + '排 × ' + fr + '（A/B）· 约' + fmt(taps, 0) + '个插接箱（每柜每路1个，高密度机柜更多）', '条');
    else add('EL-12', el.pdus, 'no.', '150 kVA', 'A/B pairs', 'A/B成对', '台');
    if (el.rpdus) add('EL-14', el.rpdus, 'no.', el.rStd[0] + (el.rHd && el.rHd[2] && el.rHd[0] !== el.rStd[0] ? ' · HD: ' + el.rHd[0] : ''),
      fmt(c.stdR, 0) + ' standard racks × ' + rpN(el.rStd) + (el.rStd[2] ? '' : ' (power shelves)') + (c.hdR ? ' + ' + fmt(c.hdR, 0) + ' HD racks × ' + rpN(el.rHd) + (el.rHd && !el.rHd[2] ? ' (OEM power shelves fed by busway tap-offs)' : '') : '') + ' — A + B feeds',
      fmt(c.stdR, 0) + '个标准机柜 × ' + rpN(el.rStd) + (el.rStd[2] ? '' : '（电源架）') + (c.hdR ? ' + ' + fmt(c.hdR, 0) + '个高密度机柜 × ' + rpN(el.rHd) + (el.rHd && !el.rHd[2] ? '（OEM电源架，由母线插接箱供电）' : '') : '') + '——A+B双路', '条');
    add('EL-17', Math.max(1, Math.round(el.txTotal / 2)), 'no.', '300 A', 'Per harmonic study');
    add('EL-18', 1, 'lot', '≤ 1 Ω', 'Mesh-BN + TMGB/TGB');
    add('EL-19', 1, 'lot', 'LPL I/II', 'SPD Type 1+2/2/3');
    add('EL-21', Math.round(c.itKW), 'kW', 'Rack + portable', 'Rental for L4/L5');
    if (me.cracN) add('ME-09', me.cracN + me.cracR, 'no.', me.cracSize + ' kW', redLabel(me.cracN, me.cracR));
    if (me.chN && R.cool.airTech === 'WCCH') add('ME-01', me.chN + me.chR, 'no.', fmt(me.chSize, 0) + ' kW', me.chLabel);
    if (me.chN && R.cool.airTech === 'ACCH') add('ME-02', me.chN + me.chR, 'no.', fmt(me.chSize, 0) + ' kW', me.chLabel);
    if (me.ctN) add('ME-03', me.ctN + me.ctR, 'cells', fmt(me.rejKW / me.ctN, 0) + ' kW', redLabel(me.ctN, me.ctR));
    if (me.pumps) add('ME-04', me.pumps, 'no.', '', 'CHW' + (R.cool.airTech === 'WCCH' ? ' + CW' : ''));
    if (me.tesM3) add('ME-06', Math.max(1, ceil(me.tesM3 / 400)), 'tanks', fmt(me.tesM3, 0) + ' m³ total', '10 min');
    if (me.term) add(me.term.id, me.term.n + me.term.r, 'no.', me.term.size + ' kW', redLabel(me.term.n, me.term.r));
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
                 loc: loc, plat: plat, redundancy: redundancy, ID_CAPEX: ID_CAPEX, BESS_USD_KWH: BESS_USD_KWH, K: K };
})(typeof window !== 'undefined' ? window : globalThis);
