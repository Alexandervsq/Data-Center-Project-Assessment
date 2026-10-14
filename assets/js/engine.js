/* Data Center Project Assessment — calculation engine
 * Pure functions: assess(input) -> result. No DOM access, so the same file
 * runs in the browser and in Node (used by the report/PPT generators and tests).
 * All coefficients are planning-stage rules of thumb (feasibility / concept
 * level, ±25–30%). Text is returned as [en, zh] pairs. */
(function (g) {
  'use strict';
  var DB = g.DCDB;

  /* ----------------------------------------------------------- helpers */
  function find(arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ceil(v) { return Math.ceil(v - 1e-9); }
  function pick(list, v) { for (var i = 0; i < list.length; i++) if (list[i] >= v) return list[i]; return list[list.length - 1]; }
  function num(v, d) { v = parseFloat(v); return isFinite(v) ? v : d; }

  /* ------------------------------------------------- model coefficients */
  /* annualised mechanical (cooling) energy per unit of IT energy */
  var MECH = {
    DX:   { TROP: 0.60, SUBT: 0.55, HOTD: 0.66, TEMP: 0.45, COLD: 0.36 },
    ACCH: { TROP: 0.42, SUBT: 0.36, HOTD: 0.44, TEMP: 0.25, COLD: 0.17 },
    WCCH: { TROP: 0.30, SUBT: 0.26, HOTD: 0.31, TEMP: 0.18, COLD: 0.12 },
    IEC:  { TROP: 0.33, SUBT: 0.22, HOTD: 0.16, TEMP: 0.10, COLD: 0.07 }
  };
  /* liquid loops (CDU pumps + warm-water heat rejection), per unit of liquid heat */
  var LIQ = {
    DLC: { TROP: 0.10, SUBT: 0.085, HOTD: 0.10, TEMP: 0.06, COLD: 0.05 },
    IMM: { TROP: 0.065, SUBT: 0.055, HOTD: 0.07, TEMP: 0.045, COLD: 0.04 }
  };
  /* water usage effectiveness, L per kWh IT */
  var WUE = {
    DX:   { TROP: 0.05, SUBT: 0.05, HOTD: 0.05, TEMP: 0.05, COLD: 0.05 },
    ACCH: { TROP: 0.05, SUBT: 0.05, HOTD: 0.05, TEMP: 0.05, COLD: 0.05 },
    WCCH: { TROP: 1.90, SUBT: 1.70, HOTD: 2.20, TEMP: 1.20, COLD: 0.80 },
    IEC:  { TROP: 1.00, SUBT: 0.70, HOTD: 0.90, TEMP: 0.40, COLD: 0.20 },
    LIQ:  { TROP: 0.35, SUBT: 0.30, HOTD: 0.45, TEMP: 0.10, COLD: 0.05 }
  };
  /* ratio of design-day (peak) to annual-average mechanical power */
  var PEAK = { TROP: 1.2, SUBT: 1.45, HOTD: 1.5, TEMP: 1.9, COLD: 2.3 };
  var ELEC = { 1: 0.060, 2: 0.065, 3: 0.070, 4: 0.085 };
  var TIER_CAPEX = { 1: 0.62, 2: 0.78, 3: 1.0, 4: 1.28 };
  var COOL_CAPEX = { DX: 0.95, ACCH: 0.97, WCCH: 1.0, IEC: 1.03, DLC: 1.08, IMM: 1.10 };
  var BREAKDOWN = [
    ['EL', 'Electrical systems', '电气系统', 0.42],
    ['ME', 'Mechanical / cooling', '暖通 / 制冷', 0.20],
    ['CS', 'Civil, structural & architectural', '土建、结构与建筑', 0.18],
    ['FS', 'Fire protection & security', '消防与安防', 0.04],
    ['IT', 'IT infrastructure (racks, containment, cabling)', 'IT基础设施（机柜、封闭、布线）', 0.04],
    ['MC', 'BMS / EPMS / DCIM', 'BMS / EPMS / DCIM', 0.02],
    ['SW', 'Site works & external', '场地及室外工程', 0.04],
    ['SF', 'Design, PM, commissioning & fees', '设计、项目管理、调试及费用', 0.06]
  ];

  /* ---------------------------------------------------- default input */
  function defaults(regionId) {
    var r = find(DB.regions, regionId || 'ID') || DB.regions[0];
    return {
      name: 'New Data Center Project', region: r.id, climate: r.climate, type: 'COLO', tier: 3,
      sizing: 'mw', itMW: 10, racks: 1000, dens: 10, hdShare: 0, hdDens: 60, rackW: 600, rackU: 48,
      cooling: 'AUTO', floors: 2, phases: 2, phaseInterval: 2, raised: 'AUTO',
      fuelH: 24, upsMin: 5, battery: 'LI', eco: false, renewable: 30, targetPUE: 1.45,
      waterScarce: false, seismic: 'med', flood: 'low', siteArea: 0, gridMVA: 0,
      revModel: 'lease', price: r.colo, markup: 0, tariff: r.tariff, landPrice: r.land, waterPrice: r.water,
      capexOverride: 0, wacc: r.wacc, tax: r.tax, life: 20, rampYears: 4, targetOcc: 90, exitMult: 10,
      contingency: 10, includeIT: false, itCostKW: 15000, prefab: false, staffCost: 30000, kdb: 60,
      startYear: new Date().getFullYear()
    };
  }

  /* ------------------------------------------------------- recommend */
  function recommendCooling(p, avgDens, maxDens, itMW, clim) {
    if (maxDens >= 40 || avgDens >= 35) return 'DLC';
    if (itMW < 0.6) return 'DX';
    if ((clim === 'TEMP' || clim === 'COLD' || clim === 'HOTD') && maxDens <= 20 && itMW >= 2) return 'IEC';
    if (p.waterScarce || itMW < 5) return 'ACCH';
    return 'WCCH';
  }

  function redundancy(tier, n, kind) {
    /* returns number of redundant units for a group of n duty units */
    if (n <= 0) return 0;
    if (tier === 1) return kind === 'gen' ? 0 : 0;
    if (tier === 4) {
      if (kind === 'ups' || kind === 'tx' || kind === 'gen') return n;          /* 2N */
      return Math.max(2, ceil(n / 3));                                           /* N+2 class */
    }
    if (kind === 'tx' && tier === 2) return 0;
    if (kind === 'term') return Math.max(1, ceil(n * 0.2));
    if (kind === 'gen' || kind === 'ups') return Math.max(1, ceil(n / 8));
    return Math.max(1, ceil(n / 6));
  }
  function redLabel(n, r) {
    if (r === 0) return 'N';
    if (r === n && n > 1) return '2N';
    if (r === n && n === 1) return 'N+1 (2N)';
    return 'N+' + r;
  }

  /* ============================================================ ASSESS */
  function assess(input) {
    var p = Object.assign(defaults(input && input.region), input || {});
    ['itMW', 'racks', 'dens', 'hdShare', 'hdDens', 'rackW', 'floors', 'phases', 'phaseInterval', 'fuelH', 'upsMin', 'renewable',
     'targetPUE', 'siteArea', 'gridMVA', 'price', 'markup', 'tariff', 'landPrice', 'waterPrice', 'capexOverride', 'wacc', 'tax',
     'life', 'rampYears', 'targetOcc', 'contingency', 'itCostKW', 'staffCost', 'kdb', 'tier', 'startYear', 'exitMult'].forEach(function (k) { p[k] = num(p[k], defaults(p.region)[k]); });
    p.tier = clamp(Math.round(p.tier), 1, 4);
    p.floors = clamp(Math.round(p.floors), 1, 8);
    p.phases = clamp(Math.round(p.phases), 1, 10);
    p.life = clamp(Math.round(p.life), 5, 40);

    var reg = find(DB.regions, p.region) || DB.regions[0];
    var clim = p.climate || reg.climate;
    var R = { p: p, reg: reg, clim: find(DB.climates, clim), risks: [], notes: [] };

    /* ------------------------------------------------ capacity */
    var share = clamp(p.hdShare, 0, 100) / 100;
    var sd = Math.max(0.5, p.dens), hd = share > 0 ? Math.max(sd, p.hdDens) : 0;
    var racks, hdR, stdR, itKW;
    if (p.sizing === 'racks') {
      racks = Math.max(1, Math.round(p.racks));
      hdR = Math.round(racks * share); stdR = racks - hdR;
      itKW = stdR * sd + hdR * hd;
    } else {
      itKW = Math.max(10, p.itMW * 1000);
      var avg = (1 - share) * sd + share * hd;
      racks = ceil(itKW / avg);
      hdR = Math.round(racks * share); stdR = racks - hdR;
    }
    var itMW = itKW / 1000;
    var avgDens = itKW / racks, maxDens = hdR > 0 ? hd : sd;
    var size = DB.sizeClasses.filter(function (s) { return itMW <= s.max; })[0];
    var type = find(DB.dcTypes, p.type) || DB.dcTypes[1];
    var tier = DB.tiers[p.tier - 1];
    R.cap = { itKW: itKW, itMW: itMW, racks: racks, stdR: stdR, hdR: hdR, sd: sd, hd: hd, avgDens: avgDens, maxDens: maxDens,
              size: size, type: type, tier: tier, phaseMW: itMW / p.phases };

    /* ------------------------------------------------ cooling choice */
    var rec = recommendCooling(p, avgDens, maxDens, itMW, clim);
    var cool = p.cooling === 'AUTO' ? rec : p.cooling;
    var coolObj = find(DB.cooling, cool);
    var liquidKW = 0;
    if (cool === 'DLC') liquidKW = hdR > 0 ? hdR * hd * 0.8 : itKW * 0.75;
    if (cool === 'IMM') liquidKW = hdR > 0 ? hdR * hd * 0.95 : itKW * 0.95;
    var airKW = itKW - liquidKW;
    /* air-side plant used for DX / chillers / residual air of liquid systems */
    var airTech = (cool === 'DLC' || cool === 'IMM') ? ((p.waterScarce || itMW < 5) ? 'ACCH' : 'WCCH') : cool;
    R.cool = { tech: cool, rec: rec, obj: coolObj, airTech: airTech, liquidKW: liquidKW, airKW: airKW,
               liquidShare: liquidKW / itKW };

    /* ------------------------------------------------ PUE / WUE */
    var mech = (airKW * MECH[airTech][clim] + liquidKW * (cool === 'IMM' ? LIQ.IMM[clim] : (cool === 'DLC' ? LIQ.DLC[clim] : 0))) / itKW;
    var elec = ELEC[p.tier] - (p.eco ? 0.025 : 0);
    var misc = itMW >= 30 ? 0.010 : (itMW >= 2 ? 0.015 : 0.02);
    var pue = 1 + mech + elec + misc;
    var puePeak = 1 + mech * PEAK[clim] + elec + misc;
    var wue = (airKW * WUE[airTech][clim] + liquidKW * WUE.LIQ[clim]) / itKW;
    function pueAt(u) { u = clamp(u, 0.1, 1); return 1 + (mech + elec + misc) * (0.55 + 0.45 / u); }
    R.eff = { pue: pue, puePeak: puePeak, pue50: pueAt(0.5), mech: mech, elec: elec, misc: misc, wue: wue, pueAt: pueAt,
              gbGrade: pue <= 1.2 ? 1 : (pue <= 1.3 ? 2 : (pue <= 1.5 ? 3 : 0)) };

    /* ------------------------------------------------ electrical */
    var mechUPS = ((p.tier === 4 || avgDens >= 25) ? 0.06 * airKW : 0) + 0.025 * liquidKW;
    var upsLoad = itKW + mechUPS;
    var demandKW = itKW * puePeak + 0.05 * upsLoad + Math.max(50, 0.01 * itKW);
    var demandKVA = demandKW / 0.95;
    var mva = demandKVA / 1000;
    var volt;
    if (mva <= 2) volt = ['LV or MV (≤ 20 kV) service', '低压或中压（≤20 kV）供电'];
    else if (mva <= 30) volt = ['MV 10–35 kV (e.g. PLN 20 kV TM)', '中压10–35 kV（如PLN 20 kV TM）'];
    else if (mva <= 120) volt = ['HV 66–150 kV with on-site substation', '高压66–150 kV，配自建变电站'];
    else volt = ['EHV 150–500 kV, dedicated substation(s)', '超高压150–500 kV，专用变电站'];
    var feeds = p.tier >= 3 ? 2 : 1;

    var txSize = demandKVA <= 1600 ? pick([500, 630, 800, 1000, 1250, 1600], demandKVA / 0.8) : (demandKVA > 40000 ? 3150 : 2500);
    var txN = ceil(demandKVA / (txSize * 0.85));
    var txR = redundancy(p.tier, txN, 'tx'); if (p.tier === 3 && txN === 1) txR = 1;

    var genSize;
    if (demandKW <= 1500) genSize = pick([300, 500, 800, 1000, 1250, 1500], demandKW / 0.95);
    else if (demandKW <= 12000) genSize = 2000; else if (demandKW <= 60000) genSize = 2500; else genSize = 3000;
    var genN = ceil(demandKW / (genSize * 0.95));
    var genR = redundancy(p.tier, genN, 'gen');
    var fuelLph = demandKW * 0.27;
    var fuelL = fuelLph * p.fuelH;
    var tankSize = fuelL > 400000 ? 200 : (fuelL > 100000 ? 100 : (fuelL > 20000 ? 50 : 20));
    var tanks = Math.max(p.tier >= 3 ? 2 : 1, ceil(fuelL / 1000 / tankSize));

    var upsSize = upsLoad <= 250 ? 300 : (upsLoad <= 1000 ? 500 : (upsLoad <= 6000 ? 1200 : 1600));
    var upsN = ceil(upsLoad / (upsSize * 0.9));
    var upsR = redundancy(p.tier, upsN, 'ups');
    var battKWh = (upsN + upsR) * upsSize * (p.upsMin / 60) * 1.25 / 0.95;
    var feedsPerRack = p.tier >= 3 ? 2 : (p.tier === 2 ? 2 : 1);
    var rows = ceil(racks / (p.rackW >= 800 ? 16 : 20));
    var useBusway = itKW >= 1000 || avgDens >= 10;
    var rowKW = itKW / rows;
    var bwA = pick([160, 250, 400, 630, 800, 1000, 1250, 1600], rowKW / (0.4 * 1.732 * 0.8));
    var busways = useBusway ? rows * (feedsPerRack === 2 ? 2 : 1) : 0;
    var pdus = useBusway ? 0 : ceil(itKW / 120) * (feedsPerRack === 2 ? 2 : 1);
    function rpduType(d) {
      if (d <= 7) return ['1-ph 32 A (7.4 kW)', '单相32 A（7.4 kW）', 1];
      if (d <= 22) return ['3-ph 32 A (22 kW)', '三相32 A（22 kW）', 1];
      if (d <= 43) return ['3-ph 63 A (43 kW)', '三相63 A（43 kW）', 1];
      var k = ceil(d / 43); return [k + ' × 3-ph 63 A per feed', '每路' + k + '条三相63 A', k];
    }
    var rStd = rpduType(sd), rHd = hdR > 0 ? rpduType(hd) : null;
    var rpdus = stdR * feedsPerRack * rStd[2] + (rHd ? hdR * feedsPerRack * rHd[2] : 0);
    R.el = { upsLoad: upsLoad, mechUPS: mechUPS, demandKW: demandKW, demandKVA: demandKVA, mva: mva, volt: volt, feeds: feeds,
             txSize: txSize, txN: txN, txR: txR, txTotal: txN + txR, genSize: genSize, genN: genN, genR: genR, genTotal: genN + genR,
             fuelLph: fuelLph, fuelL: fuelL, tankSize: tankSize, tanks: tanks, upsSize: upsSize, upsN: upsN, upsR: upsR, upsTotal: upsN + upsR,
             battKWh: battKWh, rows: rows, useBusway: useBusway, bwA: bwA, busways: busways, pdus: pdus, rpdus: rpdus, rStd: rStd, rHd: rHd,
             feedsPerRack: feedsPerRack, txLabel: redLabel(txN, txR), genLabel: redLabel(genN, genR), upsLabel: redLabel(upsN, upsR),
             gridOK: !(p.gridMVA > 0 && p.gridMVA < mva) };

    /* ------------------------------------------------ mechanical */
    var greyHeat = itKW * (elec + misc * 0.5);
    var chwLoad = (airTech === 'DX' || airTech === 'IEC' ? 0 : airKW + greyHeat);
    var M = { chwLoad: chwLoad, totalHeat: itKW + greyHeat, items: [] };
    M.tr = M.totalHeat / 3.517;
    if (airTech === 'DX') {
      var crac = (airKW + greyHeat) <= 500 ? 50 : 100;
      M.cracSize = crac; M.cracN = ceil((airKW + greyHeat) / crac); M.cracR = redundancy(p.tier, M.cracN, 'term');
    } else if (airTech === 'IEC') {
      M.iecN = ceil((airKW + greyHeat) / 400); M.iecR = redundancy(p.tier, M.iecN, 'plant');
    } else {
      var chSize = airTech === 'WCCH' ? (chwLoad >= 20000 ? 3517 : (chwLoad >= 6000 ? 2461 : 1407)) : (chwLoad >= 3000 ? 1000 : 500);
      M.chSize = chSize; M.chN = Math.max(1, ceil(chwLoad / chSize)); M.chR = redundancy(p.tier, M.chN, 'plant');
      M.chLabel = redLabel(M.chN, M.chR);
      if (airTech === 'WCCH') { M.ctN = M.chN; M.ctR = M.chR; M.rejKW = chwLoad * 1.18; }
      M.pumps = (M.chN + M.chR) * (airTech === 'WCCH' ? 2 : 1);
      M.tesM3 = (p.tier >= 3 || avgDens >= 15) ? chwLoad * 600 / (4186 * 8) : 0;
      /* air terminals for the air-cooled part of the white space */
      var airRackDens = hdR > 0 && cool !== 'DLC' && cool !== 'IMM' ? avgDens : sd;
      var term;
      if (airRackDens > 25 && cool !== 'DLC' && cool !== 'IMM') term = { en: 'In-row coolers (50 kW)', zh: '列间空调（50 kW）', size: 50, id: 'ME-10' };
      else if (itMW / Math.max(1, ceil(itMW / 4)) >= 2) term = { en: 'Fan walls (400 kW)', zh: '风墙（400 kW）', size: 400, id: 'ME-08' };
      else term = { en: 'CRAH units (150 kW)', zh: '冷冻水精密空调（150 kW）', size: 150, id: 'ME-07' };
      if (term) { term.n = ceil(airKW / term.size); term.r = redundancy(p.tier, term.n, 'term'); M.term = term; }
      if (clim !== 'TROP' && airTech === 'WCCH') M.phx = Math.max(1, ceil(M.chN / 2));
    }
    if (liquidKW > 0) {
      var cduSize = liquidKW >= 3000 ? 1500 : 800;
      M.cduSize = cduSize; M.cduN = ceil(liquidKW / cduSize); M.cduR = Math.max(1, ceil(M.cduN / 4));
      M.dcN = ceil(liquidKW * 1.05 / 1500); M.dcR = redundancy(p.tier, M.dcN, 'plant');
      if (cool === 'IMM') M.tanks = ceil(liquidKW / 100);
    }
    M.waterDay = itKW * (p.targetOcc / 100) * 24 * wue / 1000;
    M.waterStore = M.waterDay / 24 * Math.max(12, p.fuelH);
    R.me = M;

    /* ------------------------------------------------ space */
    var rackArea = (p.rackW / 1000) * 2.4 * 1.8 + (liquidKW > 0 ? 0.8 : 0);
    var ws = racks * rackArea;
    var halls = Math.max(ceil(ws / 1500), ceil(itMW / (liquidKW > 0 ? 10 : 4)));
    var tierE = { 1: 0.6, 2: 0.8, 3: 1.0, 4: 1.6 }[p.tier];
    var elecRoom = itMW * (p.battery === 'LI' ? 200 : 280) * tierE + 80 + 60 * ceil(itMW / 10);
    var mechRoomCoef = { DX: 10, ACCH: 30, WCCH: 90, IEC: 80, DLC: 100, IMM: 60 }[cool];
    var mechRoom = itMW * mechRoomCoef + 40;
    var support = 400 + 40 * itMW;
    var gfa = (ws + elecRoom + mechRoom + support) * 1.15;
    var footprint = gfa / p.floors;
    var yard = (R.el.genTotal * 75) + (R.el.txTotal * 30) + (fuelL / 1000 / 2.5 * 1.5);
    if (airTech === 'WCCH') yard += M.rejKW * 0.025;
    if (airTech === 'ACCH') yard += chwLoad * 0.04;
    if (liquidKW > 0) yard += liquidKW * 1.05 * 0.05;
    var subst = mva > 30 ? (mva > 120 ? 8000 : 4000) : 150;
    /* roads, parking, setbacks, landscaping and security stand-off ≈ +60% */
    var siteNeed = Math.max(footprint / (clamp(p.kdb, 20, 90) / 100), (footprint + yard + subst) * 1.6);
    var raised = p.raised === 'AUTO' ? (avgDens <= 10 && itMW < 30 && liquidKW === 0) : p.raised === 'YES';
    R.sp = { rackArea: rackArea, ws: ws, halls: halls, elecRoom: elecRoom, mechRoom: mechRoom, support: support, gfa: gfa,
             footprint: footprint, yard: yard, subst: subst, siteNeed: siteNeed, raised: raised,
             siteOK: !(p.siteArea > 0 && p.siteArea < siteNeed), wsPerMW: ws / itMW,
             clearH: raised ? '≥ 4.5 m slab-to-soffit + 0.6–1.0 m raised floor' : (liquidKW > 0 ? '≥ 6.0 m (overhead busway, trays, piping)' : '≥ 5.5 m (overhead services)'),
             floorLoad: maxDens >= 40 ? 25 : (avgDens >= 15 ? 20 : 15) };

    /* ------------------------------------------------ fire / security / monitoring */
    var bigHall = (p.type === 'HYPER' || p.type === 'WHOLE' || p.type === 'AI') && itMW >= 20;
    var vol = ws * 4.5;
    var gasZones = ceil(ws / 800);
    R.fs = {
      suppression: bigHall
        ? ['Pre-action (double-interlock) sprinklers in data halls (hyperscale practice) + ASD; clean-agent gas in MMR, electrical and battery rooms.', '数据机房采用预作用（双连锁）喷淋（超大规模常用做法）+极早期烟雾探测；运营商交汇间、电气室及电池室采用洁净气体灭火。']
        : ['Clean-agent (FK-5-1-12 / HFC-227ea) or inert-gas (IG-541) total flooding in white space, MMR and electrical rooms, plus pre-action sprinklers where the AHJ requires.', '白区、运营商交汇间及电气室采用洁净气体（全氟己酮/七氟丙烷）或惰性气体（IG-541）全淹没灭火，并按消防主管部门要求增设预作用喷淋。'],
      gasZones: bigHall ? 0 : gasZones, agentKg: bigHall ? 0 : vol * 0.592, vol: vol,
      asd: ceil(ws / 1500) + ceil((elecRoom + mechRoom) / 2000),
      cams: Math.round(60 + 45 * itMW + 2 * racks / 10), readers: Math.round(30 + 6 * halls + 2 * itMW),
      bmsPts: Math.round(400 + 450 * itMW), meters: Math.round(20 + R.el.txTotal * 12 + R.el.upsTotal * 4 + busways * 2),
      securityLayers: p.tier >= 3 ? 7 : 5
    };

    /* ------------------------------------------------ staffing */
    /* 24/7 posts need ≈ 5.2 FTE each (shift rota incl. leave & training) */
    var facPosts, secPosts, nocPosts, mgmt;
    if (itMW < 0.5) { facPosts = 0.4; secPosts = 0.2; nocPosts = 0; mgmt = 1; }          /* unmanned edge: roving techs + remote NOC */
    else if (itMW < 2) { facPosts = 1; secPosts = 1; nocPosts = 0; mgmt = 2; }          /* NOC shared with corporate / operator */
    else {
      facPosts = { 1: 1, 2: 1, 3: 2, 4: 3 }[p.tier] + Math.floor(itMW / 10);
      secPosts = (p.tier === 1 ? 1 : 2) + Math.floor(itMW / 20);
      nocPosts = 1 + Math.floor(itMW / 30);
      mgmt = 3 + itMW / 20 + (type.rev === 'lease' ? 2 : 0);
    }
    var fte = Math.max(2, Math.round((facPosts + secPosts + nocPosts) * 5.2 + mgmt));
    R.staff = { fac: facPosts * 5.2, sec: secPosts * 5.2, noc: nocPosts * 5.2, mgmt: mgmt, fte: fte };

    /* ------------------------------------------------ CAPEX */
    var scaleF = itMW < 1 ? 1.45 : (itMW < 5 ? 1.18 : (itMW < 20 ? 1.05 : (itMW < 50 ? 1.0 : (itMW < 100 ? 0.95 : 0.9))));
    var base = p.capexOverride > 0 ? p.capexOverride : reg.capex;
    var perMW = base * TIER_CAPEX[p.tier] * scaleF * COOL_CAPEX[cool] * (p.prefab ? 1.03 : 1);
    var facility = itMW * perMW * 1e6;
    var utility = mva > 30 ? Math.max(6e6, 0.12e6 * mva) : Math.max(0.3e6, 0.05e6 * mva);
    var landArea = p.siteArea > 0 ? Math.max(p.siteArea, 0) : siteNeed;
    var land = landArea * p.landPrice;
    var cont = (facility + utility) * p.contingency / 100;
    var itHW = p.includeIT ? itKW * p.itCostKW : 0;
    var total = facility + utility + land + cont + itHW;
    var bd = BREAKDOWN.map(function (b) {
      var sh = b[3];
      if (cool === 'DLC' || cool === 'IMM') { if (b[0] === 'ME') sh += 0.04; if (b[0] === 'CS') sh -= 0.03; if (b[0] === 'EL') sh -= 0.01; }
      return { id: b[0], en: b[1], zh: b[2], share: sh, usd: facility * sh };
    });
    R.capex = { perMW: perMW, base: base, scaleF: scaleF, facility: facility, utility: utility, land: land, landArea: landArea,
                cont: cont, itHW: itHW, total: total, breakdown: bd, perKW: (facility + utility + cont) / itKW };

    /* ------------------------------------------------ OPEX (stabilised) */
    var occ = clamp(p.targetOcc, 10, 100) / 100;
    var energyMWh = itKW * occ * 8760 * pueAt(occ) / 1000;
    var opex = {
      energy: energyMWh * 1000 * p.tariff,
      maint: 0.012 * facility,
      staff: fte * p.staffCost,
      insurance: 0.0025 * facility,
      water: M.waterDay * 365 * p.waterPrice,
      other: 0.0025 * facility
    };
    opex.total = opex.energy + opex.maint + opex.staff + opex.insurance + opex.water + opex.other;
    opex.energyMWh = energyMWh;
    opex.co2t = energyMWh * (1 - clamp(p.renewable, 0, 100) / 100) * gridEF(p.region);
    R.opex = opex;

    /* ------------------------------------------------ finance / cash flow */
    R.fin = finance(p, R, itKW, facility, utility, land, cont, itHW, pueAt, opex);

    /* ------------------------------------------------ schedule */
    R.sched = schedule(p, itMW, mva, cool);

    /* ------------------------------------------------ requirements, risks */
    R.reqs = requirements(p, R);
    R.risks = risks(p, R);
    R.standards = DB.standards.filter(function (s) { return s.r === 'INT' || reg.std.indexOf(s.r) >= 0; });
    R.boq = boq(p, R);
    R.similar = similar(p, itMW);
    return R;
  }

  function gridEF(region) {
    /* indicative grid emission factors, tCO2e/MWh */
    return { ID: 0.78, MY: 0.58, SG: 0.41, CN: 0.58, IN: 0.71, JP: 0.45, AU: 0.62, US: 0.37, EU: 0.25, ME: 0.50, NORD: 0.05 }[region] || 0.5;
  }

  /* ---------------------------------------------------------- finance */
  function finance(p, R, itKW, facility, utility, land, cont, itHW, pueAt, op) {
    var P = p.phases, years = p.life, rows = [];
    var sh1 = 0.35 + 0.65 / P, shN = 0.65 / P;
    var fcont = facility + cont;
    var capexYear = {}, capYear = {};
    for (var k = 0; k < P; k++) {
      var y = k * Math.max(1, Math.round(p.phaseInterval));
      capexYear[y] = (capexYear[y] || 0) + fcont * (k === 0 ? sh1 : shN) + (k === 0 ? utility + land : 0) + itHW / P;
      capYear[y + 1] = (capYear[y + 1] || 0) + itKW / P;
    }
    var occT = clamp(p.targetOcc, 10, 100) / 100;
    var built = 0, cum = 0, npv = 0, cfs = [], dep = [], pvCost = 0, pvCostXE = 0, pvKWm = 0, pvLeaseAlt = 0, payback = null;
    var r = p.wacc / 100;
    for (var t = 0; t <= years; t++) {
      built += capYear[t] || 0;
      var capex = capexYear[t] || 0;
      if (capex > 0) dep.push({ start: t + 1, amt: (capex - (t === 0 ? land : 0)) / 15 });
      var absorbed = t === 0 ? 0 : Math.min(1, t / Math.max(1, p.rampYears)) * occT * itKW;
      var used = Math.min(absorbed, built * occT);
      var util = built > 0 ? used / built : 0;
      var energy = used > 0 ? used * 8760 * pueAt(Math.max(util, 0.1)) * p.tariff : 0;
      var bShare = built / itKW;
      var fixed = t === 0 ? 0 : (op.maint + op.insurance + op.other) * bShare + op.staff * (0.6 + 0.4 * bShare) + op.water * (used / (itKW * occT));
      var opexT = energy + fixed;
      var rev = 0;
      /* lease revenue = space & power capacity fee + metered energy recovered from tenants (≈ 95% recovery) */
      if (p.revModel === 'lease') rev = used * p.price * 12 + energy * (1 + p.markup / 100) * 0.95;
      var ebitda = rev - opexT;
      var depT = dep.reduce(function (s, d) { return s + (t >= d.start && t < d.start + 15 ? d.amt : 0); }, 0);
      var taxT = p.revModel === 'lease' ? Math.max(0, (ebitda - depT) * p.tax / 100) : 0;
      var cf = ebitda - taxT - capex;
      var df = Math.pow(1 + r, -t);
      npv += cf * df; cum += cf;
      if (payback === null && t > 0 && cum >= 0) payback = t;
      pvCost += (capex + opexT) * df;
      pvCostXE += (capex + opexT - energy) * df;
      pvKWm += used * 12 * df;
      pvLeaseAlt += (used * p.price * 12 + energy) * df;
      cfs.push(cf);
      rows.push({ t: t, year: p.startYear + t, built: built, used: used, util: util, capex: capex, rev: rev, energy: energy, opex: opexT,
                  ebitda: ebitda, dep: depT, tax: taxT, cf: cf, cum: cum });
    }
    /* terminal (exit) value at end of horizon = final EBITDA × multiple */
    var last = rows[rows.length - 1];
    var tv = p.revModel === 'lease' ? Math.max(0, last.ebitda) * Math.max(0, p.exitMult) : 0;
    var cfsTV = cfs.slice(); cfsTV[cfsTV.length - 1] += tv;
    var npvTV = npv + tv * Math.pow(1 + r, -years);
    return { rows: rows, npv: npv, npvTV: npvTV, tv: tv, irr: irr(cfs), irrTV: irr(cfsTV), payback: payback,
             lcoc: pvKWm > 0 ? pvCostXE / pvKWm : 0, lcocAll: pvKWm > 0 ? pvCost / pvKWm : 0,
             tcoPV: pvCost, leaseAltPV: pvLeaseAlt };
  }
  function irr(cfs) {
    function f(rate) { var s = 0; for (var i = 0; i < cfs.length; i++) s += cfs[i] / Math.pow(1 + rate, i); return s; }
    var lo = -0.95, hi = 1.0, flo = f(lo), fhi = f(hi);
    if (flo * fhi > 0) return null;
    for (var i = 0; i < 200; i++) {
      var mid = (lo + hi) / 2, fm = f(mid);
      if (Math.abs(fm) < 1) return mid;
      if (flo * fm < 0) { hi = mid; fhi = fm; } else { lo = mid; flo = fm; }
    }
    return (lo + hi) / 2;
  }

  /* ---------------------------------------------------------- schedule */
  function schedule(p, itMW, mva, cool) {
    var big = itMW >= 30, med = itMW >= 5;
    var pre = big ? 6 : (med ? 4 : 3);
    var permit = big ? 12 : (med ? 9 : 6);
    var design = big ? 9 : (med ? 7 : 5);
    var proc = big ? 16 : (med ? 12 : 9);
    var cons = big ? 20 : (med ? 15 : (itMW >= 1 ? 11 : 8));
    if (p.prefab) cons = Math.round(cons * 0.75);
    var cx = big ? 4 : (med ? 3 : 2);
    var util = mva > 30 ? 24 : (mva > 2 ? 12 : 6);
    var T = [];
    function add(en, zh, s, d, c) { T.push({ en: en, zh: zh, s: s, d: d, c: c }); return s + d; }
    var e1 = add('Feasibility, site selection & land', '可行性研究、选址及土地', 0, pre, 'plan');
    var dS = e1;
    var e2 = add('Concept, schematic & detailed design', '概念、方案及详细设计', dS, design, 'design');
    add('Permits (environmental, building, spatial)', '许可（环境、建筑、空间规划）', e1 - 1, permit, 'permit');
    var uEnd = add('Utility power application & connection', '电网接入申请及送电', e1, util + Math.round(design / 2), 'permit');
    var pS = dS + Math.round(design * 0.5);
    var pEnd = add('Procurement of long-lead equipment', '长周期设备采购', pS, proc, 'proc');
    var cS = e2 - 1;
    var cEnd = add('Construction & MEP installation', '施工及机电安装', cS, cons, 'build');
    var cxS = Math.max(cEnd - 1, pEnd, uEnd);
    var cxEnd = add('Testing & commissioning (L1–L5)', '测试与调试（L1–L5）', cxS, cx, 'cx');
    add('Ready for Service — Phase 1', '第一期投产', cxEnd, 1, 'rfs');
    return { tasks: T, total: cxEnd + 1, rfsYear: p.startYear + Math.floor((cxEnd + 1) / 12) };
  }

  /* ------------------------------------------------------ requirements */
  function requirements(p, R) {
    var L = [];
    var t = p.tier, el = R.el, me = R.me, sp = R.sp;
    function add(cat, en, zh) { L.push({ cat: cat, en: en, zh: zh }); }
    add('GEN', 'Design IT capacity ' + fmt(R.cap.itMW, 2) + ' MW across ' + R.cap.racks + ' racks (avg ' + fmt(R.cap.avgDens, 1) + ' kW/rack), delivered in ' + p.phases + ' phase(s) of ≈ ' + fmt(R.cap.phaseMW, 1) + ' MW.',
        '设计IT容量' + fmt(R.cap.itMW, 2) + ' MW，共' + R.cap.racks + '个机柜（平均' + fmt(R.cap.avgDens, 1) + ' kW/柜），分' + p.phases + '期建设，每期约' + fmt(R.cap.phaseMW, 1) + ' MW。');
    add('GEN', 'Target ' + R.cap.tier.en + ' (≈ TIA-942 ' + R.cap.tier.tia + ', EN 50600 ' + R.cap.tier.en50600 + ', GB 50174 ' + R.cap.tier.gb + ', SNI 8799 ' + R.cap.tier.sni + ').',
        '目标等级' + R.cap.tier.zh + '（约对应TIA-942 ' + R.cap.tier.tia + '、EN 50600 ' + R.cap.tier.en50600 + '、GB 50174 ' + R.cap.tier.gb + '、SNI 8799 ' + R.cap.tier.sni + '）。');
    add('EL', 'Utility supply ≈ ' + fmt(el.mva, 1) + ' MVA maximum demand via ' + el.volt[0] + '; ' + el.feeds + ' feed(s)' + (t >= 3 ? ' from diverse substations recommended.' : '.'),
        '市电最大需量约' + fmt(el.mva, 1) + ' MVA，' + el.volt[1] + '；' + el.feeds + '路进线' + (t >= 3 ? '，建议来自不同变电站。' : '。'));
    add('EL', 'Generators: ' + el.genTotal + ' × ' + el.genSize + ' kWe (' + el.genLabel + '), continuous (COP/DCC) rating; on-site fuel ≥ ' + p.fuelH + ' h ≈ ' + fmt(el.fuelL / 1000, 0) + ' m³' + (p.fuelH < 12 && t >= 3 ? ' — below Uptime 12 h minimum!' : '.'),
        '发电机：' + el.genTotal + '台×' + el.genSize + ' kWe（' + el.genLabel + '），持续功率（COP/DCC）；现场储油≥' + p.fuelH + ' h，约' + fmt(el.fuelL / 1000, 0) + ' m³' + (p.fuelH < 12 && t >= 3 ? '——低于Uptime 12 h最低要求！' : '。'));
    add('EL', 'UPS: ' + el.upsTotal + ' × ' + el.upsSize + ' kW (' + el.upsLabel + '), ' + p.upsMin + ' min autonomy with ' + (p.battery === 'LI' ? 'Li-ion (LFP)' : 'VRLA') + ' batteries ≈ ' + fmt(el.battKWh, 0) + ' kWh installed.',
        'UPS：' + el.upsTotal + '台×' + el.upsSize + ' kW（' + el.upsLabel + '），后备' + p.upsMin + ' min，采用' + (p.battery === 'LI' ? '锂电（磷酸铁锂）' : '阀控铅酸') + '电池，装机约' + fmt(el.battKWh, 0) + ' kWh。');
    add('EL', 'Transformers: ' + el.txTotal + ' × ' + el.txSize + ' kVA (' + el.txLabel + '); IT distribution by ' + (el.useBusway ? (el.busways + ' overhead busway runs (' + el.bwA + ' A)') : (el.pdus + ' floor PDUs')) + '; ' + el.feedsPerRack + ' rPDU feed(s) per rack (' + el.rStd[0] + ').',
        '变压器：' + el.txTotal + '台×' + el.txSize + ' kVA（' + el.txLabel + '）；IT配电采用' + (el.useBusway ? (el.busways + '条上走线插接母线（' + el.bwA + ' A）') : (el.pdus + '台落地PDU')) + '；每柜' + el.feedsPerRack + '路rPDU（' + el.rStd[1] + '）。');
    var ct = R.cool.obj;
    add('ME', 'Cooling: ' + ct.en + (R.cool.tech !== R.cool.rec ? ' (engine recommends ' + find(DB.cooling, R.cool.rec).en + ')' : ' (recommended)') + '; total heat ≈ ' + fmt(me.totalHeat / 1000, 1) + ' MW (' + fmt(me.tr, 0) + ' RT).',
        '制冷：' + ct.zh + (R.cool.tech !== R.cool.rec ? '（系统推荐：' + find(DB.cooling, R.cool.rec).zh + '）' : '（推荐方案）') + '；总散热量约' + fmt(me.totalHeat / 1000, 1) + ' MW（' + fmt(me.tr, 0) + '冷吨）。');
    if (me.chN) add('ME', 'Chillers: ' + (me.chN + me.chR) + ' × ' + fmt(me.chSize, 0) + ' kW (' + me.chLabel + ')' + (me.ctN ? ', cooling towers ' + (me.ctN + me.ctR) + ' cells' : '') + (me.tesM3 ? ', thermal storage ≈ ' + fmt(me.tesM3, 0) + ' m³ (10 min ride-through)' : '') + '.',
        '冷水机组：' + (me.chN + me.chR) + '台×' + fmt(me.chSize, 0) + ' kW（' + me.chLabel + '）' + (me.ctN ? '，冷却塔' + (me.ctN + me.ctR) + '格' : '') + (me.tesM3 ? '，蓄冷罐约' + fmt(me.tesM3, 0) + ' m³（10 min穿越）' : '') + '。');
    if (me.cduN) add('ME', 'Liquid cooling: ' + (me.cduN + me.cduR) + ' × ' + me.cduSize + ' kW CDUs, TCS 30–40 °C (ASHRAE W32–W40), ' + (me.dcN + me.dcR) + ' adiabatic dry coolers / tower cells for the warm-water loop.',
        '液冷：' + (me.cduN + me.cduR) + '台×' + me.cduSize + ' kW CDU，TCS供液30–40 °C（ASHRAE W32–W40），温水环路配' + (me.dcN + me.dcR) + '台绝热干冷器/冷却塔单元。');
    add('ME', 'Server inlet 18–27 °C (ASHRAE recommended); estimated annual PUE ' + fmt(R.eff.pue, 2) + ' (design-day ' + fmt(R.eff.puePeak, 2) + '); WUE ≈ ' + fmt(R.eff.wue, 2) + ' L/kWh.',
        '服务器进风18–27 °C（ASHRAE推荐）；预计年均PUE ' + fmt(R.eff.pue, 2) + '（设计日' + fmt(R.eff.puePeak, 2) + '）；WUE约' + fmt(R.eff.wue, 2) + ' L/kWh。');
    add('CS', 'White space ≈ ' + fmt(sp.ws, 0) + ' m² in ' + sp.halls + ' data hall(s); GFA ≈ ' + fmt(sp.gfa, 0) + ' m² on ' + p.floors + ' floor(s); site ≈ ' + fmt(sp.siteNeed / 10000, 2) + ' ha required.',
        '白区约' + fmt(sp.ws, 0) + ' m²，' + sp.halls + '个数据机房；总建筑面积约' + fmt(sp.gfa, 0) + ' m²，' + p.floors + '层；需用地约' + fmt(sp.siteNeed / 10000, 2) + '公顷。');
    add('CS', 'Floor live load ≥ ' + sp.floorLoad + ' kN/m² in white space; clear height ' + sp.clearH + '; ' + (sp.raised ? 'raised access floor.' : 'slab-on-grade with overhead distribution.'),
        '白区楼面活荷载≥' + sp.floorLoad + ' kN/m²；净高' + sp.clearH.replace('slab-to-soffit', '板面至梁底').replace('raised floor', '架空地板').replace('overhead busway, trays, piping', '上走线母线、桥架、管道').replace('overhead services', '上走线机电') + '；' + (sp.raised ? '设防静电架空地板。' : '无架空地板，机电上走线。'));
    add('FS', R.fs.suppression[0], R.fs.suppression[1]);
    add('FS', 'Very early warning aspirating smoke detection (≈ ' + R.fs.asd + ' detectors), addressable fire alarm, water leak detection' + (p.battery === 'LI' ? ', Li-ion off-gas detection per NFPA 855.' : '.'),
        '极早期吸气式烟雾探测（约' + R.fs.asd + '台）、可寻址火灾报警、漏水检测' + (p.battery === 'LI' ? '，并按NFPA 855设置锂电池逸出气体探测。' : '。'));
    add('SC', R.fs.securityLayers + '-layer physical security: perimeter fence + PIDS, gatehouse & vehicle barriers, building entry, mantrap, data-hall MFA (card + biometric), cage/rack locks; ≈ ' + R.fs.cams + ' cameras, 90-day retention.',
        R.fs.securityLayers + '层物理安防：周界围栏+入侵探测、门卫及车辆拦阻、建筑入口、防尾随门、机房多因素认证（卡+生物识别）、笼位/机柜锁；约' + R.fs.cams + '台摄像机，录像保存90天。');
    add('MC', 'BMS (≈ ' + R.fs.bmsPts + ' points), EPMS (≈ ' + R.fs.meters + ' meters, Class A PQ at incomers), DCIM with PUE/WUE dashboards per ISO/IEC 30134.',
        'BMS（约' + R.fs.bmsPts + '点）、EPMS（约' + R.fs.meters + '块表计，进线A级电能质量）、DCIM按ISO/IEC 30134提供PUE/WUE仪表盘。');
    add('OPS', 'Operations: ≈ ' + R.staff.fte + ' FTE for 24/7 coverage (facility engineers, security, NOC, management).',
        '运营：约' + R.staff.fte + '名全职人员实现7×24覆盖（设施工程师、安保、NOC、管理）。');
    return L;
  }

  /* ------------------------------------------------------------- risks */
  function risks(p, R) {
    var L = [];
    function add(lv, en, zh, men, mzh) { L.push({ lv: lv, en: en, zh: zh, m: [men, mzh] }); }
    var c = R.cap, coolObj = R.cool.obj;
    if (c.maxDens > coolObj.maxDens) add('H', 'Rack density ' + fmt(c.maxDens, 0) + ' kW exceeds the practical limit of the selected cooling (' + coolObj.en + ', ≈ ' + coolObj.maxDens + ' kW/rack).', '机柜密度' + fmt(c.maxDens, 0) + ' kW超出所选制冷方式的实际上限（' + coolObj.zh + '，约' + coolObj.maxDens + ' kW/柜）。',
      'Adopt direct liquid cooling or rear-door heat exchangers for high-density racks.', '高密度机柜采用冷板液冷或背板热交换器。');
    if (!R.sp.siteOK) add('H', 'Available site (' + fmt(p.siteArea / 10000, 2) + ' ha) is smaller than required (' + fmt(R.sp.siteNeed / 10000, 2) + ' ha).', '可用场地（' + fmt(p.siteArea / 10000, 2) + '公顷）小于需求（' + fmt(R.sp.siteNeed / 10000, 2) + '公顷）。',
      'Increase storeys, move plant to roof, reduce phases or acquire adjacent land.', '增加层数、将设备移至屋面、减少分期或购置相邻土地。');
    if (!R.el.gridOK) add('H', 'Grid capacity available (' + fmt(p.gridMVA, 1) + ' MVA) is below maximum demand (' + fmt(R.el.mva, 1) + ' MVA).', '电网可用容量（' + fmt(p.gridMVA, 1) + ' MVA）低于最大需量（' + fmt(R.el.mva, 1) + ' MVA）。',
      'Negotiate staged capacity with the utility, phase the build, or add on-site generation / BESS.', '与电力公司协商分期供电、分期建设或增设现场发电/储能。');
    if (p.tier >= 3 && p.fuelH < 12) add('H', 'Fuel autonomy below 12 h does not meet Uptime Tier III/IV.', '燃油自持时间低于12 h，不满足Uptime Tier III/IV。', 'Increase bulk storage to ≥ 12 h at N load (24–48 h typical).', '将储油量提高至N负荷下≥12 h（通常24–48 h）。');
    if (R.cool.tech === 'IEC' && (p.climate || R.reg.climate) === 'TROP') add('H', 'Indirect evaporative cooling performs poorly in tropical humid climates (wet-bulb ≈ 28 °C).', '间接蒸发冷却在湿热气候（湿球约28 °C）下效果差。', 'Use water-cooled chillers with elevated chilled water, or liquid cooling.', '采用高温冷冻水的水冷冷机或液冷。');
    if (p.waterScarce && (R.cool.airTech === 'WCCH' || R.cool.tech === 'IEC')) add('H', 'Selected cooling consumes significant water (WUE ≈ ' + fmt(R.eff.wue, 2) + ' L/kWh) at a water-scarce site.', '所选制冷方式耗水量大（WUE约' + fmt(R.eff.wue, 2) + ' L/kWh），而场地缺水。', 'Prefer air-cooled chillers or closed-loop liquid cooling with dry coolers; use recycled water.', '优先选用风冷冷机或闭式液冷+干冷器；使用再生水。');
    if (p.targetPUE > 0 && R.eff.pue > p.targetPUE + 0.02) add('M', 'Estimated PUE ' + fmt(R.eff.pue, 2) + ' is above the target ' + fmt(p.targetPUE, 2) + '.', '预计PUE ' + fmt(R.eff.pue, 2) + '高于目标' + fmt(p.targetPUE, 2) + '。', 'Raise supply temperatures, add economisers, use eco-mode UPS, or adopt liquid cooling.', '提高供水/送风温度、增加自然冷却、UPS采用ECO模式或采用液冷。');
    if (p.region === 'CN' && R.eff.pue > 1.3) add('M', 'China policy for new large DCs and hub nodes typically requires PUE ≤ 1.25–1.30 (GB 40879 grade 2).', '中国对新建大型及枢纽数据中心通常要求PUE≤1.25–1.30（GB 40879二级）。', 'Improve cooling efficiency or relocate to a colder hub node.', '提升制冷效率或选址于更寒冷的枢纽节点。');
    if (p.region === 'SG' && R.eff.pue > 1.3) add('M', 'Singapore capacity allocation (DC-CFA) favours best-in-class PUE ≈ 1.25 or lower.', '新加坡容量分配（DC-CFA）倾向PUE约1.25及以下的最佳项目。', 'Target liquid cooling, high renewable share and SS 564 Platinum.', '采用液冷、高比例可再生能源并申请SS 564白金级。');
    if (c.type.id === 'AI') add('M', 'Synchronous GPU load swings (tens of % within seconds) can stress UPS, generators and the grid.', 'GPU同步负荷波动（数秒内变化数十个百分点）会对UPS、发电机及电网造成冲击。', 'Specify UPS/BESS buffering, generator transient performance (ISO 8528-5 G3) and utility studies.', '规定UPS/储能缓冲、发电机瞬态性能（ISO 8528-5 G3）并开展电网研究。');
    if (p.battery === 'LI') add('M', 'Li-ion batteries introduce thermal-runaway fire risk.', '锂电池存在热失控火灾风险。', 'Use LFP chemistry, UL 9540A-tested systems, off-gas detection and fire separation (NFPA 855).', '采用磷酸铁锂、通过UL 9540A测试的系统、逸出气体探测及防火分隔（NFPA 855）。');
    if (R.el.mva > 30) add('M', 'HV connection > 30 MVA usually needs a dedicated substation and 18–36 months of utility works.', '超过30 MVA的高压接入通常需要专用变电站及18–36个月的电网工程。', 'Start the utility application at feasibility stage; consider phased energisation.', '在可研阶段即启动电网申请；考虑分期送电。');
    if (R.cap.itMW >= 5) add('M', 'Long-lead equipment (transformers, generators, MV switchgear) currently 12–24 months.', '长周期设备（变压器、发电机、中压开关柜）目前交期为12–24个月。', 'Early procurement / reservation agreements and framework contracts.', '提前采购/产能预留协议及框架合同。');
    if (p.seismic === 'high') add('M', 'High seismic hazard.', '地震风险高。', 'Importance factor 1.5, seismic bracing of all MEP & racks, base-isolation option.', '重要性系数1.5，所有机电及机柜抗震支撑，可考虑隔震。');
    if (p.flood !== 'low') add(p.flood === 'high' ? 'H' : 'M', 'Flood exposure at site.', '场地存在洪水风险。', 'Raise finished floor above 100/500-year flood, locate critical plant on upper floors, flood barriers.', '室内地坪高于百年/五百年一遇洪水位，关键设备上置，设防洪挡板。');
    if (p.tier === 4 && R.el.feeds < 2) add('L', 'Tier IV with single utility feed (allowed by Uptime because generators are the primary source).', 'Tier IV仅单路市电（Uptime允许，因发电机为主电源）。', 'Second utility feed improves practical resilience.', '第二路市电可提升实际韧性。');
    if (p.phases >= 4) add('L', 'Many phases increase stranded capacity and tie-in risk to live systems.', '分期过多会增加搁浅容量及与在运系统接驳的风险。', 'Pre-install shared infrastructure (MV, piping headers) with isolation valves/breakers.', '预装共用基础设施（中压、管道总管）并设隔离阀/断路器。');
    if (p.renewable >= 50) add('L', 'High renewable target requires PPA / green tariff availability (e.g. PLN REC, corporate PPA).', '高可再生能源目标需要购电协议/绿电电价（如PLN绿证、企业购电协议）。', 'Engage utility and IPPs early; consider on-site solar for support loads.', '尽早与电力公司及独立发电商沟通；考虑屋面光伏供辅助负荷。');
    if (R.fin && p.revModel === 'lease' && R.fin.irrTV !== null && R.fin.irrTV < p.wacc / 100) add('H', 'Project IRR (incl. terminal value) ' + fmt(R.fin.irrTV * 100, 1) + '% is below the discount rate ' + p.wacc + '%.', '项目IRR（含终值）' + fmt(R.fin.irrTV * 100, 1) + '%低于折现率' + p.wacc + '%。', 'Review pricing, phasing, capex and ramp-up assumptions.', '复核定价、分期、投资及爬坡假设。');
    if (!L.length) add('L', 'No critical risks identified at this planning level.', '在当前规划深度下未识别关键风险。', 'Validate with site surveys and utility studies.', '通过场地勘察及电网研究进行验证。');
    var order = { H: 0, M: 1, L: 2 };
    return L.sort(function (a, b) { return order[a.lv] - order[b.lv]; });
  }

  /* --------------------------------------------------------------- BOQ */
  function boq(p, R) {
    var B = [], el = R.el, me = R.me, sp = R.sp, c = R.cap;
    function add(id, qty, unit, rating, note) {
      var e = find(DB.equipment, id);
      B.push({ id: id, sys: e ? e.sys : '', en: e ? e.en : id, zh: e ? e.zh : id, qty: qty, unit: unit, rating: rating || '', note: note || '' });
    }
    var mvPanels = 2 + 1 + el.txTotal + (el.genSize >= 2500 ? 0 : 0) + Math.max(1, ceil(el.txTotal * 0.2));
    add('EL-01', mvPanels, 'panels', el.volt[0].split(' (')[0], el.feeds + ' incomer(s) + bus coupler');
    add('EL-02', el.txTotal, 'no.', el.txSize + ' kVA', el.txLabel);
    add('EL-03', el.txTotal, 'line-ups', '4,000 A', 'One per transformer');
    add('EL-04', el.genTotal, 'no.', el.genSize + ' kWe', el.genLabel + ', COP/DCC');
    if (el.genTotal > 1) add('EL-05', Math.max(1, ceil(el.genTotal / 10)), 'systems', '', 'Redundant controllers');
    add('EL-06', el.tanks, 'tanks', el.tankSize + ' m³', fmt(el.fuelL / 1000, 0) + ' m³ total, ' + p.fuelH + ' h');
    add('EL-07', Math.max(2, Math.round(el.txTotal / 2)), 'no.', '1,600–3,200 A', 'Mechanical boards');
    add('EL-09', el.upsTotal, 'systems', el.upsSize + ' kW', el.upsLabel);
    add(p.battery === 'LI' ? 'EL-10' : 'EL-11', Math.round(el.battKWh), 'kWh', p.upsMin + ' min', 'EOL sizing');
    if (el.useBusway) add('EL-13', el.busways, 'runs', el.bwA + ' A', el.rows + ' rows');
    else add('EL-12', el.pdus, 'no.', '150 kVA', 'A/B pairs');
    add('EL-14', el.rpdus, 'no.', el.rStd[0], el.feedsPerRack + ' per rack');
    add('EL-17', Math.max(1, Math.round(el.txTotal / 2)), 'no.', '300 A', 'Per harmonic study');
    add('EL-18', 1, 'lot', '≤ 1 Ω', 'Mesh-BN + TMGB/TGB');
    add('EL-19', 1, 'lot', 'LPL I/II', 'SPD Type 1+2/2/3');
    add('EL-21', Math.round(c.itKW), 'kW', 'Rack + portable', 'Rental for L4/L5');
    if (me.cracN) add('ME-09', me.cracN + me.cracR, 'no.', me.cracSize + ' kW', redLabel(me.cracN, me.cracR));
    if (me.chN && R.cool.airTech === 'WCCH') add('ME-01', me.chN + me.chR, 'no.', fmt(me.chSize, 0) + ' kW', me.chLabel);
    if (me.chN && R.cool.airTech === 'ACCH') add('ME-02', me.chN + me.chR, 'no.', fmt(me.chSize, 0) + ' kW', me.chLabel);
    if (me.ctN) add('ME-03', me.ctN + me.ctR, 'cells', fmt(me.rejKW / me.ctN, 0) + ' kW', redLabel(me.ctN, me.ctR));
    if (me.pumps) add('ME-04', me.pumps, 'no.', '', 'CHW' + (R.cool.airTech === 'WCCH' ? ' + CW' : ''));
    if (me.phx) add('ME-05', me.phx, 'no.', '', 'Water-side economiser');
    if (me.tesM3) add('ME-06', Math.max(1, ceil(me.tesM3 / 400)), 'tanks', fmt(me.tesM3, 0) + ' m³ total', '10 min');
    if (me.term) add(me.term.id, me.term.n + me.term.r, 'no.', me.term.size + ' kW', redLabel(me.term.n, me.term.r));
    if (me.iecN) add('ME-14', me.iecN + me.iecR, 'modules', '400 kW', redLabel(me.iecN, me.iecR));
    if (me.cduN) add('ME-12', me.cduN + me.cduR, 'no.', me.cduSize + ' kW', 'N+' + me.cduR);
    if (me.dcN) add('ME-15', me.dcN + me.dcR, 'no.', '1,500 kW', redLabel(me.dcN, me.dcR));
    if (me.tanks) add('ME-13', me.tanks, 'tanks', '100 kW', '');
    add('ME-16', 1, 'lot', '', 'Dual headers / ring');
    if (R.cool.airTech === 'WCCH') add('ME-17', 1, 'lot', '', 'CoC 4–6');
    add('ME-18', 1, 'lot', '+5–15 Pa', '');
    add('IT-01', c.racks, 'no.', p.rackU + 'U ' + p.rackW + ' mm', c.hdR ? c.hdR + ' high-density' : '');
    add('IT-02', Math.max(1, ceil(el.rows / 2)), 'pods', R.cool.tech === 'DLC' ? 'HAC' : 'HAC/CAC', '');
    add('IT-03', 1, 'lot', 'OS2 + OM4/OM5', 'MPO trunks');
    add('IT-10', p.tier >= 3 ? 2 : 1, 'rooms', '', p.tier >= 3 ? 'Diverse entries' : '');
    add('FP-01', 1, 'system', 'Addressable', '');
    add('FP-02', R.fs.asd, 'detectors', 'Class A', '');
    if (R.fs.gasZones) add('FP-03', R.fs.gasZones, 'zones', fmt(R.fs.agentKg, 0) + ' kg HFC-227ea eq.', '≤ 800 m² per zone');
    add('FP-05', Math.max(1, sp.halls), 'zones', 'Double interlock', '');
    add('FP-07', 1, 'lot', '± 1 m', '');
    if (p.battery === 'LI') add('FP-08', el.upsTotal, 'rooms', '', 'NFPA 855');
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
      var mw = r.kind === 'arch' ? (r.input.itMW || 0) : (r.mw || 0);
      var d = Math.abs(Math.log((mw || 0.1) / Math.max(itMW, 0.1))) + (r.type === p.type ? 0 : 0.8);
      return { r: r, d: d };
    }).sort(function (a, b) { return a.d - b.d; }).slice(0, 4).map(function (x) { return x.r; });
  }

  function fmt(v, d) {
    if (v === null || v === undefined || !isFinite(v)) return '–';
    return Number(v).toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  }

  g.DCEngine = { assess: assess, defaults: defaults, fmt: fmt, redLabel: redLabel, find: find };
})(typeof window !== 'undefined' ? window : globalThis);
