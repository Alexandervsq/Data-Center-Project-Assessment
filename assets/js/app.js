/* Data Center Project Assessment — application (views, form, report, libraries) */
(function () {
  'use strict';
  var DB = window.DCDB, E = window.DCEngine, F = E.fmt, C = window.Charts;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------ icons (lucide paths) */
  var IP = {
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    snow: '<path d="M2 12h20M12 2v20m-8-6 4-4-4-4m16 8-4-4 4-4M8 4l4 4 4-4M8 20l4-4 4 4"/>',
    server: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01M6 18h.01"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    print: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    link: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    play: '<path d="m5 3 14 9-14 9z"/>',
    map: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    coins: '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18M7 6h1v4M16.71 13.88l.7.71-2.82 2.82"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'
  };
  function ic(n, st) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' + (st ? ' style="' + st + '"' : '') + '>' + (IP[n] || '') + '</svg>'; }
  var SYS_IC = { EL: 'bolt', ME: 'snow', IT: 'server', FP: 'flame', SC: 'shield', MC: 'monitor', CS: 'building' };

  /* ------------------------------------------------------------ state */
  var LS_PROJ = 'dcpa_projects', LS_INPUT = 'dcpa_input';
  var S = {
    view: 'home', rtab: 'sum', input: null, R: null, cur: 'USD', fx: { USD: 1, IDR: 16300, CNY: 7.1 },
    ref: { q: '', kind: 'all', type: 'all' }, eq: { sel: 'EL-01', q: '', sys: 'all' }, std: { r: 'all', a: 'all', q: '' }, gl: { q: '' }
  };
  try { S.input = JSON.parse(localStorage.getItem(LS_INPUT)); } catch (e) { S.input = null; }
  if (!S.input || !S.input.region) S.input = E.defaults('ID');
  try { var cu = JSON.parse(localStorage.getItem('dcpa_cur')); if (cu && cu.cur) { S.cur = cu.cur; S.fx = Object.assign(S.fx, cu.fx || {}); } } catch (e) { }

  function persist() { try { localStorage.setItem(LS_INPUT, JSON.stringify(S.input)); localStorage.setItem('dcpa_cur', JSON.stringify({ cur: S.cur, fx: S.fx })); } catch (e) { } }
  function projects() { try { return JSON.parse(localStorage.getItem(LS_PROJ)) || []; } catch (e) { return []; } }
  function setProjects(list) { try { localStorage.setItem(LS_PROJ, JSON.stringify(list)); } catch (e) { toast(Lt('Browser storage unavailable', '浏览器存储不可用')); } }

  function toast(msg) {
    var t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2200);
  }
  function money(usd, dec) {
    var v = usd * (S.fx[S.cur] || 1), a = Math.abs(v), sfx = '';
    if (a >= 1e12) { v /= 1e12; sfx = ' T'; } else if (a >= 1e9) { v /= 1e9; sfx = ' B'; } else if (a >= 1e6) { v /= 1e6; sfx = ' M'; } else if (a >= 1e4) { v /= 1e3; sfx = ' k'; }
    return S.cur + ' ' + F(v, dec === undefined ? (sfx ? 1 : 0) : dec) + sfx;
  }
  function pct(v, d) { return v === null || v === undefined ? '–' : F(v * 100, d === undefined ? 1 : d) + '%'; }
  function sysColor(id) { var s = DB.systems.filter(function (x) { return x.id === id; })[0]; return s ? s.color : '#3f3cbb'; }
  function download(name, text, type) {
    var blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }
  function csv(rows) { return '﻿' + rows.map(function (r) { return r.map(function (c) { c = String(c === undefined || c === null ? '' : c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(','); }).join('\r\n'); }

  /* ------------------------------------------------------------ header */
  var TABS = [
    ['home', 'home', 'Overview', '概览'], ['assess', 'gauge', 'Assessment', '项目评估'], ['refs', 'building', 'Reference Projects', '参考项目'],
    ['equip', 'cpu', 'Equipment & TPG', '设备与TPG'], ['know', 'book', 'Knowledge Base', '知识库'], ['std', 'scale', 'Standards', '规范标准'],
    ['gloss', 'list', 'Glossary', '术语表'], ['about', 'info', 'About', '关于']
  ];
  function renderHeader() {
    $('#brandTitle').innerHTML = Li('Data Center Project Assessment', '数据中心项目评估');
    $('#brandSub').innerHTML = Li('Planning · Feasibility · Technical requirements · Equipment TPG', '规划·可行性·技术要求·设备TPG');
    $('#langs').innerHTML = I18N.switcher();
    $('#tabs').innerHTML = TABS.map(function (t) { return '<button class="tab' + (S.view === t[0] ? ' on' : '') + '" data-view="' + t[0] + '">' + ic(t[1]) + '<span>' + Li(t[2], t[3]) + '</span></button>'; }).join('');
    document.documentElement.lang = I18N.lang() === 'zh' ? 'zh-CN' : 'en';
    $('#footer').innerHTML = Li('Data Center Project Assessment — planning-stage indications (±25–30%). Verify with site studies, utilities and qualified consultants.', '数据中心项目评估——规划阶段参考（±25–30%），须经场地研究、电力部门及专业顾问核实。') +
      ' · <a href="https://github.com/Alexandervsq/Data-Center-Project-Assessment" target="_blank" rel="noopener">GitHub</a>';
  }
  function show(view) {
    if (!document.getElementById('view-' + view)) view = 'home';
    S.view = view;
    $$('.view').forEach(function (v) { v.classList.toggle('on', v.id === 'view-' + view); });
    $$('.tab').forEach(function (b) { b.classList.toggle('on', b.dataset.view === view); });
    $('#tabs').classList.remove('open');
    if (location.hash !== '#' + view) history.replaceState(null, '', '#' + view);
    window.scrollTo({ top: 0 });
  }

  /* ================================================================ HOME */
  function renderHome() {
    var nEq = DB.equipment.length, nTpg = DB.equipment.reduce(function (s, e) { return s + e.tpg.filter(function (r) { return !r.g; }).length; }, 0);
    var nArch = DB.references.filter(function (r) { return r.kind === 'arch'; }).length, nReal = DB.references.length - nArch;
    var feats = [
      ['gauge', '#3f3cbb', 'Assess', '评估', 'Enter capacity, racks, Tier, location and commercial assumptions — get requirements, systems, equipment quantities, space, cost, schedule and risks instantly.', '输入容量、机柜、等级、地点及商业假设——即时获得要求、系统、设备数量、空间、投资、进度与风险。', 'assess'],
      ['building', '#0ea5c6', 'Compare with references', '对标参考项目', nArch + ' benchmark reference designs with full feasibility data and ' + nReal + ' real-world public projects.', nArch + '个带完整可研数据的基准参考设计，以及' + nReal + '个真实公开项目。', 'refs'],
      ['cpu', '#f0544f', 'Specify equipment', '设备规格', nEq + ' major & secondary equipment items with specification clauses and ' + nTpg + ' TPG parameters.', nEq + '项主要及次要设备，含技术条款及' + nTpg + '项TPG参数。', 'equip'],
      ['book', '#16a34a', 'Learn the fundamentals', '学习基础知识', 'Tiers, spaces, power and cooling chains, lifecycle and commissioning — explained bilingually.', '等级、功能区、供电与制冷链、生命周期及调试——中英双语讲解。', 'know']
    ];
    var html = '<div class="hero">' + heroArt() +
      '<h1>' + (I18N.lang() === 'zh' ? '科学规划数据中心项目' : 'Plan a data center with confidence' + (I18N.lang() === 'bi' ? '<span class="zh">科学规划数据中心项目</span>' : '')) + '</h1>' +
      '<p>' + L('An interactive planning & feasibility assessment for data center owners and developers. Describe the facility you want — capacity, racks, resilience, location — and the tool derives every system and requirement you need, benchmarked against reference projects.',
        '面向数据中心业主与开发商的交互式规划与可行性评估工具。描述您想要的设施——容量、机柜、韧性、地点——工具将推导所需的全部系统与要求，并与参考项目对标。') + '</p>' +
      '<div class="kpis">' + [[nEq, 'equipment types', '设备类型'], [nTpg, 'TPG parameters', 'TPG参数'], [DB.references.length, 'reference projects', '参考项目'], [DB.standards.length, 'codes & standards', '规范标准'], [DB.glossary.length, 'glossary terms', '术语']].map(function (k) {
        return '<div class="kpi"><b>' + k[0] + '</b><span>' + Li(k[1], k[2]) + '</span></div>'; }).join('') + '</div>' +
      '<div class="row"><button class="btn cyan" data-go="assess">' + ic('play') + Li('Start an assessment', '开始评估') + '</button><button class="btn ghost" data-go="refs">' + ic('building') + Li('Browse reference projects', '浏览参考项目') + '</button></div></div>';
    html += '<div class="grid g4">' + feats.map(function (f) {
      return '<div class="card feature" style="cursor:pointer" data-go="' + f[6] + '"><div class="ficon" style="background:' + f[1] + '">' + ic(f[0]) + '</div><div><h3>' + L(f[2], f[3]) + '</h3><div class="small muted">' + L(f[4], f[5]) + '</div></div></div>';
    }).join('') + '</div>';
    html += '<div class="grid g2"><div class="card"><h3>' + L('How the assessment works', '评估如何进行') + '</h3><div class="steps">' + [
      ['Define the project: location, type, capacity (MW or racks), rack density and Tier.', '定义项目：地点、类型、容量（MW或机柜数）、机柜密度及等级。'],
      ['The engine sizes power (utility, transformers, generators, UPS, batteries), cooling (chillers, CRAH, CDU), space and site.', '引擎计算电力（市电、变压器、发电机、UPS、电池）、制冷（冷机、精密空调、CDU）、空间及场地。'],
      ['It estimates PUE, WUE, CAPEX, OPEX, cash flow, IRR/NPV or TCO, schedule and staffing.', '估算PUE、WUE、投资、运营成本、现金流、IRR/NPV或TCO、进度及人员。'],
      ['It flags risks, lists applicable standards and the equipment list with links to TPG requirements.', '识别风险，列出适用标准及设备清单，并链接至TPG要求。'],
      ['Save scenarios, compare against reference projects, print or export the report.', '保存方案，与参考项目对比，打印或导出报告。']
    ].map(function (s) { return '<div class="step"><div>' + L(s[0], s[1]) + '</div></div>'; }).join('') + '</div></div>' +
      '<div class="card"><h3>' + L('Companion knowledge documents', '配套知识文件') + '</h3><p class="small muted" style="margin-bottom:12px">' + L('The same knowledge base is available as a bilingual presentation and a bilingual technical specification with TPG schedules.', '同一知识库亦提供中英双语演示文稿及含TPG表的中英双语技术规范书。') + '</p>' +
      '<div class="grid" style="gap:10px">' +
      '<a class="btn ghost" href="downloads/Data%20Center%20Knowledge%20Base%20(EN-ZH).pptx" download>' + ic('download') + Li('Knowledge Base deck (PPTX)', '知识库演示文稿（PPTX）') + '</a>' +
      '<a class="btn ghost" href="downloads/Data%20Center%20Technical%20Specification%20%26%20TPG%20(EN-ZH).docx" download>' + ic('download') + Li('Technical Specification & TPG (DOCX)', '技术规范书及TPG（DOCX）') + '</a></div>' +
      '<hr class="sep"><h4>' + L('Scope of assessment', '评估范围') + '</h4><div class="row">' +
      [['Technical', '技术', 'ind'], ['Site & permits', '场地与许可', 'cyan'], ['Cost & finance', '投资与财务', 'amber'], ['Schedule', '进度', 'green'], ['Risk', '风险', 'coral'], ['Sustainability', '可持续', 'green'], ['Operations', '运营', 'ind']].map(function (c) { return '<span class="chip ' + c[2] + '">' + Li(c[0], c[1]) + '</span>'; }).join('') + '</div></div></div>';
    $('#view-home').innerHTML = html;
  }
  function heroArt() {
    var s = '<svg class="hero-art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">';
    for (var i = 0; i < 6; i++) {
      var x = 70 + i * 56;
      s += '<rect x="' + x + '" y="40" width="46" height="220" rx="4" fill="rgba(255,255,255,.06)" stroke="rgba(159,230,246,.35)"/>';
      for (var u = 0; u < 12; u++) {
        var y = 50 + u * 17.5, c = ((i * 7 + u * 3) % 11 === 0) ? '#f0544f' : (((i + u) % 5 === 0) ? '#f2a93b' : '#22d3ee');
        s += '<rect x="' + (x + 5) + '" y="' + y + '" width="36" height="13" rx="2" fill="rgba(13,11,43,.55)"/><circle cx="' + (x + 35) + '" cy="' + (y + 6.5) + '" r="2.2" fill="' + c + '"/>';
      }
    }
    return s + '</svg>';
  }

  /* ============================================================ ASSESSMENT */
  var SEV = ['low', 'Low', '低'], SEM = ['med', 'Medium', '中'], SEH = ['high', 'High', '高'];
  var STEPS = [
    { n: 1, en: 'Project & site', zh: '项目与场地', open: true, f: [
      { k: 'name', t: 'text', en: 'Project name', zh: '项目名称', full: 1 },
      { k: 'region', t: 'select', en: 'Country / region (sets benchmarks)', zh: '国家/地区（决定基准值）', full: 1, opts: function () { return DB.regions.map(function (r) { return [r.id, r.en, r.zh]; }); }, change: applyRegion },
      { k: 'climate', t: 'select', en: 'Climate zone', zh: '气候区', full: 1, opts: function () { return DB.climates.map(function (c) { return [c.id, c.en, c.zh]; }); } },
      { k: 'type', t: 'select', en: 'Data center type / business model', zh: '数据中心类型/商业模式', full: 1, opts: function () { return DB.dcTypes.map(function (t) { return [t.id, t.en, t.zh]; }); }, change: applyType },
      { k: 'siteArea', t: 'num', en: 'Available site area (m²)', zh: '可用场地面积（m²）', step: 500, hint: ['0 = not yet defined', '0=尚未确定'] },
      { k: 'kdb', t: 'num', en: 'Max. site coverage (%)', zh: '最大建筑密度（%）', step: 5 },
      { k: 'gridMVA', t: 'num', en: 'Grid capacity offered (MVA)', zh: '电网可供容量（MVA）', step: 1, hint: ['0 = unknown', '0=未知'] },
      { k: 'floors', t: 'num', en: 'Building storeys', zh: '建筑层数', step: 1, min: 1, max: 8 },
      { k: 'seismic', t: 'seg', en: 'Seismic hazard', zh: '地震风险', opts: [SEV, SEM, SEH] },
      { k: 'flood', t: 'seg', en: 'Flood exposure', zh: '洪水风险', opts: [SEV, SEM, SEH] },
      { k: 'waterScarce', t: 'chk', en: 'Water-scarce site (avoid evaporative cooling)', zh: '缺水场地（避免蒸发冷却）', full: 1 }
    ] },
    { n: 2, en: 'Capacity & racks', zh: '容量与机柜', open: true, f: [
      { k: 'sizing', t: 'seg', en: 'Size the project by', zh: '规模确定方式', full: 1, opts: [['mw', 'IT load (MW)', 'IT负载（MW）'], ['racks', 'Rack count', '机柜数量']] },
      { k: 'itMW', t: 'num', en: 'Design IT load (MW)', zh: '设计IT负载（MW）', step: 0.1, show: function (p) { return p.sizing !== 'racks'; } },
      { k: 'racks', t: 'num', en: 'Number of racks', zh: '机柜数量', step: 10, show: function (p) { return p.sizing === 'racks'; } },
      { k: 'dens', t: 'num', en: 'Standard rack density (kW/rack)', zh: '标准机柜功率（kW/柜）', step: 0.5 },
      { k: 'hdShare', t: 'num', en: 'High-density / AI racks (% of racks)', zh: '高密度/AI机柜占比（%）', step: 5, min: 0, max: 100 },
      { k: 'hdDens', t: 'num', en: 'High-density rack load (kW/rack)', zh: '高密度机柜功率（kW/柜）', step: 5, show: function (p) { return +p.hdShare > 0; } },
      { k: 'rackW', t: 'seg', en: 'Rack width', zh: '机柜宽度', opts: [[600, '600 mm'], [800, '800 mm']] },
      { k: 'rackU', t: 'select', en: 'Rack height', zh: '机柜高度', opts: function () { return [[42, '42U'], [45, '45U'], [48, '48U'], [52, '52U']]; } },
      { k: 'phases', t: 'num', en: 'Construction phases', zh: '建设分期数', step: 1, min: 1, max: 10 },
      { k: 'phaseInterval', t: 'num', en: 'Years between phases', zh: '分期间隔（年）', step: 1, show: function (p) { return +p.phases > 1; } },
      { k: 'raised', t: 'seg', en: 'White-space floor', zh: '白区地面形式', full: 1, opts: [['AUTO', 'Auto', '自动'], ['YES', 'Raised floor', '架空地板'], ['NO', 'Slab + overhead', '无地板上走线']] }
    ] },
    { n: 3, en: 'Resilience & power', zh: '韧性与供电', f: [
      { k: 'tier', t: 'tier', full: 1 },
      { k: 'fuelH', t: 'select', en: 'Generator fuel autonomy', zh: '发电机燃油自持', opts: function () { return [[8, '8 h'], [12, '12 h'], [24, '24 h'], [48, '48 h'], [72, '72 h']]; } },
      { k: 'upsMin', t: 'select', en: 'UPS battery autonomy', zh: 'UPS电池后备', opts: function () { return [[5, '5 min'], [10, '10 min'], [15, '15 min']]; } },
      { k: 'battery', t: 'seg', en: 'Battery technology', zh: '电池技术', full: 1, opts: [['LI', 'Li-ion (LFP)', '锂电（磷酸铁锂）'], ['VRLA', 'VRLA lead-acid', '阀控铅酸']] },
      { k: 'eco', t: 'chk', en: 'UPS eco-mode / ESS enabled', zh: 'UPS启用ECO/节能模式', full: 1 }
    ] },
    { n: 4, en: 'Cooling & sustainability', zh: '制冷与可持续', f: [
      { k: 'cooling', t: 'select', en: 'Cooling technology', zh: '制冷技术', full: 1, opts: function () { return [['AUTO', 'Automatic recommendation', '自动推荐']].concat(DB.cooling.map(function (c) { return [c.id, c.en, c.zh]; })); } },
      { k: 'targetPUE', t: 'num', en: 'Target annual PUE', zh: '目标年均PUE', step: 0.01 },
      { k: 'renewable', t: 'num', en: 'Renewable energy share (%)', zh: '可再生能源占比（%）', step: 5, min: 0, max: 100 }
    ] },
    { n: 5, en: 'Commercial & financial', zh: '商业与财务', f: [
      { k: 'revModel', t: 'seg', en: 'Business case', zh: '商业模式', full: 1, opts: [['lease', 'Lease / colocation', '租赁/托管'], ['none', 'Owner-occupied (TCO)', '自用（TCO）']] },
      { k: 'price', t: 'num', en: 'Lease price (USD/kW/month, excl. power)', zh: '租赁价格（美元/kW·月，不含电）', step: 5, show: function (p) { return p.revModel === 'lease'; } },
      { k: 'targetOcc', t: 'num', en: 'Stabilised utilisation (%)', zh: '稳定期利用率（%）', step: 5 },
      { k: 'rampYears', t: 'num', en: 'Years to stabilise', zh: '达到稳定年数', step: 1 },
      { k: 'tariff', t: 'num', en: 'Electricity tariff (USD/kWh)', zh: '电价（美元/kWh）', step: 0.005 },
      { k: 'landPrice', t: 'num', en: 'Land price (USD/m²)', zh: '土地价格（美元/m²）', step: 10 },
      { k: 'waterPrice', t: 'num', en: 'Water price (USD/m³)', zh: '水价（美元/m³）', step: 0.1 },
      { k: 'capexOverride', t: 'num', en: 'CAPEX override (USD M/MW)', zh: '单位投资覆盖（百万美元/MW）', step: 0.1, hint: ['0 = regional benchmark', '0=采用地区基准'] },
      { k: 'contingency', t: 'num', en: 'Contingency (%)', zh: '不可预见费（%）', step: 1 },
      { k: 'staffCost', t: 'num', en: 'Staff cost (USD/FTE/yr)', zh: '人员成本（美元/人·年）', step: 1000 },
      { k: 'wacc', t: 'num', en: 'Discount rate / WACC (%)', zh: '折现率/WACC（%）', step: 0.5 },
      { k: 'tax', t: 'num', en: 'Corporate tax (%)', zh: '企业所得税（%）', step: 1 },
      { k: 'life', t: 'num', en: 'Analysis period (years)', zh: '分析期（年）', step: 1 },
      { k: 'exitMult', t: 'num', en: 'Exit value (× final EBITDA)', zh: '终值（×末年EBITDA）', step: 0.5, show: function (p) { return p.revModel === 'lease'; } },
      { k: 'markup', t: 'num', en: 'Power resale markup (%)', zh: '电费转售加价（%）', step: 1, show: function (p) { return p.revModel === 'lease'; } },
      { k: 'startYear', t: 'num', en: 'Project start year', zh: '项目启动年份', step: 1 },
      { k: 'prefab', t: 'chk', en: 'Prefabricated / modular construction', zh: '预制/模块化建造', full: 1 },
      { k: 'includeIT', t: 'chk', en: 'Include IT hardware in CAPEX', zh: '投资中包含IT硬件', full: 1 },
      { k: 'itCostKW', t: 'num', en: 'IT hardware (USD/kW IT)', zh: 'IT硬件（美元/kW IT）', step: 500, show: function (p) { return !!p.includeIT; } }
    ] }
  ];
  var TYPE_PRICE = { COLO: 1.1, WHOLE: 0.9, HYPER: 0.85, AI: 1.2, EDGE: 1.35, ENT: 1, GOV: 1, MOD: 1 };
  var TYPE_DENS = { ENT: [8, 0, 60], COLO: [10, 0, 60], WHOLE: [15, 0, 60], HYPER: [17, 0, 60], AI: [20, 85, 130], EDGE: [8, 0, 40], GOV: [10, 0, 60], MOD: [12, 0, 60] };
  function regionOf(p) { return DB.regions.filter(function (r) { return r.id === p.region; })[0] || DB.regions[0]; }
  function applyRegion(p) {
    var r = regionOf(p);
    p.climate = r.climate; p.tariff = r.tariff; p.landPrice = r.land; p.waterPrice = r.water; p.wacc = r.wacc; p.tax = r.tax;
    p.price = Math.round(r.colo * (TYPE_PRICE[p.type] || 1));
  }
  function applyType(p) {
    var t = DB.dcTypes.filter(function (x) { return x.id === p.type; })[0];
    var d = TYPE_DENS[p.type] || [10, 0, 60];
    p.dens = d[0]; p.hdShare = d[1]; p.hdDens = d[2];
    p.revModel = t && t.rev === 'lease' ? 'lease' : 'none';
    p.price = Math.round(regionOf(p).colo * (TYPE_PRICE[p.type] || 1));
    if (p.type === 'AI') { p.rackW = 800; p.cooling = 'AUTO'; }
    if (p.type === 'EDGE' || p.type === 'MOD') p.prefab = true;
    if (t && p.sizing !== 'racks') p.itMW = Math.max(t.mw[0], Math.min(t.mw[1], p.itMW));
  }

  function fieldHTML(f, p) {
    var hid = f.show && !f.show(p) ? ' hidden' : '';
    var lab = f.en ? '<label for="in-' + f.k + '">' + L(f.en, f.zh) + '</label>' : '';
    var hint = f.hint ? '<div class="hint">' + Li(f.hint[0], f.hint[1]) + '</div>' : '';
    var v = p[f.k], html = '';
    if (f.t === 'text') html = '<input type="text" id="in-' + f.k + '" data-k="' + f.k + '" value="' + esc(v) + '">';
    else if (f.t === 'num') html = '<input type="number" id="in-' + f.k + '" data-k="' + f.k + '" value="' + esc(v) + '" step="' + (f.step || 1) + '"' + (f.min !== undefined ? ' min="' + f.min + '"' : '') + (f.max !== undefined ? ' max="' + f.max + '"' : '') + '>';
    else if (f.t === 'select') html = '<select id="in-' + f.k + '" data-k="' + f.k + '">' + f.opts().map(function (o) { return '<option value="' + o[0] + '"' + (String(o[0]) === String(v) ? ' selected' : '') + '>' + esc(o[2] ? Lt(o[1], o[2]) : o[1]) + '</option>'; }).join('') + '</select>';
    else if (f.t === 'seg') html = '<div class="seg" data-k="' + f.k + '">' + f.opts.map(function (o) { return '<button type="button" data-v="' + o[0] + '" class="' + (String(o[0]) === String(v) ? 'on' : '') + '">' + (o[2] ? Li(o[1], o[2]) : esc(o[1])) + '</button>'; }).join('') + '</div>';
    else if (f.t === 'chk') return '<div class="f full' + hid + '"><label class="chk" style="text-transform:none;letter-spacing:0;font-weight:600;color:var(--ink);font-size:.86rem"><input type="checkbox" data-k="' + f.k + '"' + (v ? ' checked' : '') + '> <span>' + Li(f.en, f.zh) + '</span></label></div>';
    else if (f.t === 'tier') return '<div class="f full"><label>' + L('Resilience target (Uptime Tier)', '韧性目标（Uptime等级）') + '</label><div class="tiers">' + DB.tiers.map(function (t) {
        return '<button type="button" class="tierbtn' + (+p.tier === t.n ? ' on' : '') + '" data-tier="' + t.n + '"><b>' + ['I', 'II', 'III', 'IV'][t.n - 1] + '</b><span>' + t.red + ' · ' + t.avail + '%</span></button>'; }).join('') +
        '</div><div class="hint">' + Lp(DB.tiers[p.tier - 1].d, false) + '</div></div>';
    return '<div class="f' + (f.full ? ' full' : '') + hid + '">' + lab + html + hint + '</div>';
  }
  function renderForm() {
    var p = S.input, list = projects();
    var html = '<div class="card" style="padding:14px"><div class="row" style="gap:8px">' +
      '<select id="projSel" class="fsel" style="flex:1;min-width:150px"><option value="">' + esc(Lt('Saved assessments…', '已保存的评估…')) + '</option>' + list.map(function (x, i) { return '<option value="' + i + '">' + esc(x.name) + '</option>'; }).join('') + '</select>' +
      '<button class="btn small ghost" id="btnLoad" title="Load">' + ic('upload') + Li('Load', '载入') + '</button><button class="btn small ghost" id="btnDel">' + Li('Delete', '删除') + '</button></div>' +
      '<div class="form-actions" style="margin:10px 0 0"><button class="btn small" id="btnSave">' + ic('save') + Li('Save', '保存') + '</button>' +
      '<button class="btn small ghost" id="btnReset">' + ic('reset') + Li('Reset', '重置') + '</button>' +
      '<button class="btn small ghost" id="btnExport">' + ic('download') + 'JSON</button>' +
      '<label class="btn small ghost" style="cursor:pointer">' + ic('upload') + Li('Import', '导入') + '<input type="file" id="fileImport" accept=".json" hidden></label></div></div>';
    STEPS.forEach(function (st) {
      html += '<details class="stepbox"' + (st.open ? ' open' : '') + ' data-step="' + st.n + '"><summary><span class="n">' + st.n + '</span><span>' + Li(st.en, st.zh) + '</span><span class="tw">›</span></summary><div class="fields">' +
        st.f.map(function (f) { return fieldHTML(f, p); }).join('') + '</div></details>';
    });
    $('#formCol').innerHTML = html;
  }
  var timer = null;
  var DEP = ['sizing', 'hdShare', 'phases', 'revModel', 'includeIT', 'region', 'type', 'tier'];
  function onInput(k, v, rerenderForm) {
    var f = null; STEPS.forEach(function (st) { st.f.forEach(function (x) { if (x.k === k) f = x; }); });
    if (f && f.t === 'num') v = v === '' ? 0 : parseFloat(v);
    if (k === 'rackW' || k === 'rackU' || k === 'fuelH' || k === 'upsMin') v = parseFloat(v);
    S.input[k] = v;
    if (f && f.change) { f.change(S.input); rerenderForm = true; }
    persist();
    if (rerenderForm) { var open = $$('details.stepbox').map(function (d) { return d.open; }); renderForm(); $$('details.stepbox').forEach(function (d, i) { d.open = open[i]; }); }
    clearTimeout(timer); timer = setTimeout(runReport, 120);
  }
  function bindForm() {
    var col = $('#formCol');
    col.addEventListener('input', function (ev) { var t = ev.target; if (t.dataset && t.dataset.k && t.type !== 'checkbox' && t.tagName !== 'SELECT') onInput(t.dataset.k, t.value, false); });
    col.addEventListener('change', function (ev) {
      var t = ev.target;
      if (t.id === 'fileImport') return importJSON(t.files[0]);
      if (t.dataset && t.dataset.k) {
        if (t.type === 'checkbox') onInput(t.dataset.k, t.checked, true);
        else if (t.tagName === 'SELECT') onInput(t.dataset.k, t.value, true);
        else onInput(t.dataset.k, t.value, DEP.indexOf(t.dataset.k) >= 0);
      }
    });
    col.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b) return;
      if (b.dataset.tier) { S.input.tier = +b.dataset.tier; if (S.input.tier >= 3 && S.input.fuelH < 12) S.input.fuelH = 24; onInput('tier', S.input.tier, true); return; }
      var seg = b.closest('.seg'); if (seg && b.dataset.v !== undefined) { var v = b.dataset.v; if (seg.dataset.k === 'rackW') v = +v; onInput(seg.dataset.k, v, true); return; }
      if (b.id === 'btnSave') { var list = projects(), name = S.input.name || 'Untitled'; var i = list.findIndex(function (x) { return x.name === name; });
        var item = { name: name, saved: new Date().toISOString(), input: JSON.parse(JSON.stringify(S.input)) }; if (i >= 0) list[i] = item; else list.push(item); setProjects(list); renderForm(); toast(Lt('Saved: ', '已保存：') + name); }
      if (b.id === 'btnLoad') { var idx = $('#projSel').value; if (idx === '') return; var pr = projects()[+idx]; if (pr) { S.input = Object.assign(E.defaults(pr.input.region), pr.input); persist(); renderForm(); runReport(); toast(Lt('Loaded: ', '已载入：') + pr.name); } }
      if (b.id === 'btnDel') { var id2 = $('#projSel').value; if (id2 === '') return; var l2 = projects(); var nm = l2[+id2].name; l2.splice(+id2, 1); setProjects(l2); renderForm(); toast(Lt('Deleted: ', '已删除：') + nm); }
      if (b.id === 'btnReset') { S.input = E.defaults('ID'); applyRegion(S.input); persist(); renderForm(); runReport(); }
      if (b.id === 'btnExport') download((S.input.name || 'assessment').replace(/[^\w\-]+/g, '_') + '.json', JSON.stringify({ app: 'Data Center Project Assessment', version: 1, input: S.input }, null, 2), 'application/json');
    });
  }
  function importJSON(file) {
    if (!file) return;
    var rd = new FileReader();
    rd.onload = function () { try { var o = JSON.parse(rd.result); var inp = o.input || o; if (!inp.region) throw new Error('bad'); S.input = Object.assign(E.defaults(inp.region), inp); persist(); renderForm(); runReport(); toast(Lt('Imported', '已导入')); } catch (e) { toast(Lt('Invalid file', '文件无效')); } };
    rd.readAsText(file);
  }
  function loadInput(inp, jump) {
    S.input = Object.assign(E.defaults(inp.region), JSON.parse(JSON.stringify(inp)));
    persist(); renderForm(); runReport();
    if (jump) { S.rtab = 'sum'; show('assess'); }
  }

  function renderAssessShell() {
    $('#view-assess').innerHTML = '<h2 class="sec">' + Li('Project assessment', '项目评估') + '</h2><div class="sec-sub">' +
      Li('Describe the data center you want; results update instantly. Indicative planning values (±25–30%).', '描述您想要的数据中心，结果即时更新。规划阶段参考值（±25–30%）。') + '</div>' +
      '<div class="assess"><div class="form-col" id="formCol"></div><div id="reportCol"></div></div>';
    renderForm(); bindForm();
    $('#reportCol').addEventListener('click', function (ev) {
      var t = ev.target.closest('[data-rtab]'); if (t) { S.rtab = t.dataset.rtab; $$('.rtab').forEach(function (b) { b.classList.toggle('on', b.dataset.rtab === S.rtab); }); $$('.rpanel').forEach(function (p) { p.classList.toggle('hidden', p.dataset.panel !== S.rtab); }); return; }
      var a = ev.target.closest('[data-act]'); if (!a) return;
      if (a.dataset.act === 'print') { window.print(); }
      if (a.dataset.act === 'csv') exportBOQ();
      if (a.dataset.act === 'fincsv') exportFin();
      if (a.dataset.act === 'eq') { S.eq.sel = a.dataset.id; renderEquip(); show('equip'); }
      if (a.dataset.act === 'ref') openRef(a.dataset.id);
    });
    $('#reportCol').addEventListener('change', function (ev) {
      if (ev.target.id === 'curSel') { S.cur = ev.target.value; persist(); runReport(); }
      if (ev.target.id === 'fxIn') { S.fx[S.cur] = parseFloat(ev.target.value) || S.fx[S.cur]; persist(); runReport(); }
    });
  }

  /* ------------------------------------------------------------ report */
  var RTABS = [['sum', 'Summary', '摘要'], ['req', 'Requirements', '要求'], ['el', 'Power', '电力'], ['me', 'Cooling', '制冷'], ['sp', 'Space & site', '空间与场地'],
               ['fs', 'Fire · security · monitoring', '消防·安防·监控'], ['boq', 'Equipment list', '设备清单'], ['fin', 'Cost & finance', '投资与财务'],
               ['sch', 'Schedule & staffing', '进度与人员'], ['risk', 'Risks', '风险'], ['std', 'Standards', '标准']];
  function runReport() {
    var R;
    try { R = E.assess(S.input); } catch (e) { console.error(e); $('#reportCol').innerHTML = '<div class="card">' + esc(Lt('Calculation error — check inputs.', '计算错误——请检查输入。')) + '</div>'; return; }
    S.R = R;
    var p = R.p, c = R.cap;
    var head = '<div class="report-head"><div class="row"><div><h3>' + esc(p.name || 'Untitled') + '</h3><div class="small" style="color:#c8cbff">' + Li(R.reg.en, R.reg.zh) + ' · ' + Li(c.type.en, c.type.zh) + '</div></div><span class="spacer"></span>' +
      '<div class="row no-print" style="gap:6px"><select id="curSel" class="fsel" style="padding:5px 8px">' + ['USD', 'IDR', 'CNY'].map(function (k) { return '<option' + (S.cur === k ? ' selected' : '') + '>' + k + '</option>'; }).join('') + '</select>' +
      (S.cur !== 'USD' ? '<input id="fxIn" class="fsel" style="width:90px;padding:5px 8px" type="number" value="' + S.fx[S.cur] + '" title="' + esc(Lt('Exchange rate per USD', '每美元汇率')) + '">' : '') +
      '<button class="btn small cyan" data-act="print">' + ic('print') + Li('Print / PDF', '打印/PDF') + '</button></div></div>' +
      '<div class="chips"><span class="chip">' + Li(c.size.en, c.size.zh) + '</span><span class="chip">' + esc(c.tier.en.split(' — ')[0]) + ' · ' + c.tier.avail + '%</span><span class="chip">' + F(c.itMW, 2) + ' MW IT</span><span class="chip">' + F(c.racks) + ' ' + Li('racks', '机柜') + '</span><span class="chip">PUE ' + F(R.eff.pue, 2) + '</span><span class="chip">' + Li(R.cool.obj.en, R.cool.obj.zh) + '</span></div></div>';
    var tabs = '<div class="rtabs no-print">' + RTABS.map(function (t) { return '<button class="rtab' + (S.rtab === t[0] ? ' on' : '') + '" data-rtab="' + t[0] + '">' + Li(t[1], t[2]) + '</button>'; }).join('') + '</div>';
    var panels = { sum: pSummary, req: pReq, el: pPower, me: pCooling, sp: pSpace, fs: pFS, boq: pBOQ, fin: pFin, sch: pSched, risk: pRisk, std: pStd };
    var body = RTABS.map(function (t) { return '<div class="rpanel' + (S.rtab === t[0] ? '' : ' hidden') + '" data-panel="' + t[0] + '">' + panels[t[0]](R) + '</div>'; }).join('');
    $('#reportCol').innerHTML = head + tabs + body;
  }
  function tile(val, unit, en, zh, sub, color) {
    return '<div class="tile" style="--c:' + (color || '#3f3cbb') + '"><div class="lbl">' + L(en, zh) + '</div><b>' + val + (unit ? '<span class="u">' + unit + '</span>' : '') + '</b>' + (sub ? '<div class="sub">' + sub + '</div>' : '') + '</div>';
  }
  function kv(rows) { return '<div class="tblw"><table class="t kv"><tbody>' + rows.map(function (r) { return '<tr><td>' + L(r[0], r[1]) + '</td><td>' + r[2] + '</td></tr>'; }).join('') + '</tbody></table></div>'; }
  function panelTitle(en, zh, extra) { return '<div class="row" style="margin:4px 0 10px"><h3 style="margin:0">' + Li(en, zh) + '</h3><span class="spacer"></span>' + (extra || '') + '</div>'; }

  function pSummary(R) {
    var c = R.cap, f = R.fin, p = R.p;
    var finTile = p.revModel === 'lease'
      ? tile(pct(f.irrTV), '', 'Project IRR (with exit)', '项目IRR（含终值）', Li('without exit ', '不含终值 ') + pct(f.irr) + ' · NPV ' + money(f.npvTV), f.irrTV !== null && f.irrTV >= p.wacc / 100 ? '#16a34a' : '#f0544f')
      : tile(money(f.lcocAll, 0), '/kW·mo', 'Cost of ownership', '拥有成本', Li('vs. lease ≈ ', '对比租赁约 ') + money(p.price + R.eff.pue * 730 * p.tariff, 0) + '/kW·mo', '#7c3aed');
    var html = '<div class="tiles">' +
      tile(F(c.itMW, 2), 'MW', 'IT capacity', 'IT容量', F(c.racks) + ' ' + Li('racks · avg ', '机柜·平均 ') + F(c.avgDens, 1) + ' kW', '#3f3cbb') +
      tile(c.tier.en.split(' — ')[0], '', 'Resilience', '韧性等级', c.tier.avail + '% · ' + c.tier.down[0] + ' ' + c.tier.down[1] + Li('/yr', '/年'), '#17153f') +
      tile(F(R.eff.pue, 2), '', 'Annual PUE (est.)', '年均PUE（估算）', Li('design day ', '设计日 ') + F(R.eff.puePeak, 2) + (R.eff.gbGrade ? ' · GB 40879 ' + Li('grade ', '') + R.eff.gbGrade + Li('', '级') : ''), '#0ea5c6') +
      tile(F(R.el.mva, 1), 'MVA', 'Utility demand', '市电需量', Li(R.el.volt[0], R.el.volt[1]), '#f2a93b') +
      tile(money(R.capex.total), '', 'Total CAPEX', '总投资', money(R.capex.perMW * 1e6, 1) + '/MW ' + Li('facility', '设施'), '#f0544f') +
      tile(money(R.opex.total), Li('/yr', '/年'), 'OPEX (stabilised)', '运营成本（稳定期）', Li('energy ', '电费 ') + Math.round(R.opex.energy / R.opex.total * 100) + '%', '#7c3aed') +
      finTile +
      tile(R.sched.total, Li('months', '个月'), 'To Ready-for-Service', '至投产', 'RFS ≈ ' + R.sched.rfsYear, '#16a34a') +
      tile(F(R.sp.siteNeed / 10000, 2), 'ha', 'Site required', '所需用地', F(R.sp.gfa) + ' m² GFA', '#b45309') +
      tile(F(R.eff.wue, 2), 'L/kWh', 'Water use (WUE)', '用水（WUE）', F(R.me.waterDay) + ' m³/' + Li('day', '日'), '#0b7f99') +
      tile(R.staff.fte, 'FTE', 'Operations staff', '运营人员', '24/7', '#5d6280') +
      tile(F(R.opex.co2t / 1000, 1), 'kt CO₂e', 'Annual emissions', '年排放', Li('renewable ', '可再生 ') + p.renewable + '%', '#16a34a') + '</div>';
    var reqs = R.reqs.filter(function (r) { return ['GEN', 'EL', 'ME'].indexOf(r.cat) >= 0; }).slice(0, 7);
    html += '<div class="grid g2"><div class="card">' + panelTitle('Key requirements', '关键要求') + reqs.map(reqRow).join('') +
      '<div style="margin-top:8px"><button class="btn small ghost" data-rtab="req">' + Li('All requirements →', '全部要求 →') + '</button></div></div>';
    html += '<div class="card">' + panelTitle('Top risks', '主要风险') + R.risks.slice(0, 5).map(riskRow).join('') + '<div style="margin-top:8px"><button class="btn small ghost" data-rtab="risk">' + Li('Risk register →', '风险登记册 →') + '</button></div></div></div>';
    html += '<div class="card">' + panelTitle('Classification', '分类') + '<div class="tblw"><table class="t"><thead><tr><th>' + Li('Scheme', '体系') + '</th><th>' + Li('Equivalent level', '对应等级') + '</th></tr></thead><tbody>' +
      [['Uptime Institute', c.tier.en], ['ANSI/TIA-942-C', c.tier.tia], ['EN 50600 / ISO/IEC 22237', c.tier.en50600], ['GB 50174 (China)', c.tier.gb], ['SNI 8799 (Indonesia)', c.tier.sni], ['BICSI 002', c.tier.bicsi], [Lt('Size class', '规模等级'), Lt(c.size.en, c.size.zh) + ' (' + c.size.racks + ' ' + Lt('racks', '机柜') + ')'], [Lt('Facility type', '设施类型'), Lt(c.type.en, c.type.zh)]].map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td><b>' + esc(r[1]) + '</b></td></tr>'; }).join('') + '</tbody></table></div></div>';
    html += '<div class="card">' + panelTitle('Similar reference projects', '相似参考项目') + '<div class="grid g2">' + R.similar.map(refMini).join('') + '</div></div>';
    return html;
  }
  var CAT = { GEN: ['General', '总体', '#17153f'], EL: ['Power', '电力', '#e39b1b'], ME: ['Cooling', '制冷', '#0ea5c6'], CS: ['Civil', '土建', '#b45309'], FS: ['Fire', '消防', '#f0544f'], SC: ['Security', '安防', '#7c3aed'], MC: ['Monitor', '监控', '#16a34a'], OPS: ['Ops', '运营', '#5d6280'] };
  function reqRow(r) { var c = CAT[r.cat] || CAT.GEN; return '<div class="req"><span class="tag" style="background:' + c[2] + '">' + esc(I18N.lang() === 'zh' ? c[1] : c[0]) + '</span><div>' + L(r.en, r.zh) + '</div></div>'; }
  function riskRow(r) { return '<div class="risk"><span class="lv ' + r.lv + '">' + r.lv + '</span><div><div>' + L(r.en, r.zh) + '</div><div class="mit">' + Li(r.m[0], r.m[1]) + '</div></div></div>'; }

  function pReq(R) {
    var p = R.p, c = R.cap, el = R.el, sp = R.sp;
    var html = '<div class="card">' + panelTitle('Requirements derived from your inputs', '根据输入推导的要求') + R.reqs.map(reqRow).join('') + '</div>';
    html += '<div class="card">' + panelTitle('Basis of Design (BoD) — design criteria', '设计依据（BoD）——设计准则') + kv([
      ['Outdoor design (dry / wet bulb)', '室外设计（干球/湿球）', R.clim.db + ' / ' + R.clim.wb + ' °C · ' + Li(R.clim.en, R.clim.zh)],
      ['IT inlet temperature (ASHRAE recommended)', 'IT进风温度（ASHRAE推荐）', '18 – 27 °C; ' + Li('dew point −9 to 15 °C', '露点−9至15 °C')],
      ['Design IT load / phases', '设计IT负载/分期', F(c.itMW, 2) + ' MW · ' + p.phases + ' × ' + F(c.phaseMW, 2) + ' MW'],
      ['Rack density (standard / high)', '机柜功率（标准/高密度）', F(c.sd, 1) + ' kW' + (c.hdR ? ' / ' + F(c.hd, 0) + ' kW × ' + c.hdR + ' ' + Li('racks', '柜') : '')],
      ['Racks', '机柜', F(c.racks) + ' × ' + p.rackU + 'U ' + p.rackW + ' mm'],
      ['Redundancy — power / cooling', '冗余——电力/制冷', 'TX ' + el.txLabel + ' · GEN ' + el.genLabel + ' · UPS ' + el.upsLabel + (R.me.chLabel ? ' · CH ' + R.me.chLabel : '')],
      ['Distribution paths to IT', 'IT供电路径', el.feedsPerRack === 2 ? Li('A + B dual-corded', 'A+B双电源') : Li('Single path', '单路径')],
      ['Fuel / UPS autonomy', '燃油/UPS后备', p.fuelH + ' h / ' + p.upsMin + ' min'],
      ['Chilled water / TCS temperatures', '冷冻水/TCS温度', R.cool.airTech === 'DX' ? '–' : '18 / 26 °C' + (R.cool.liquidKW ? ' · TCS 30–40 °C' : '')],
      ['Floor live load / clear height', '楼面活荷载/净高', sp.floorLoad + ' kN/m² · ' + esc(sp.clearH)],
      ['Target / estimated PUE', '目标/估算PUE', F(p.targetPUE, 2) + ' / ' + F(R.eff.pue, 2)],
      ['Renewable energy', '可再生能源', p.renewable + '%']
    ]) + '</div>';
    return html;
  }

  function powerDiagram(R) {
    var el = R.el, W = 900, H = 250, bw = 112, bh = 64, y = 30, gap = (W - 20 - bw * 7) / 6;
    var nodes = [
      ['Utility', '市电', el.feeds + ' × ' + F(el.mva, 1) + ' MVA', '#f2a93b'],
      ['MV switchgear', '中压开关柜', el.mva <= 2 ? 'LV / MV' : (el.mva <= 30 ? 'MV 10–35 kV' : (el.mva <= 120 ? 'HV 66–150 kV' : 'EHV ≥ 150 kV')), '#e39b1b'],
      ['Transformers', '变压器', el.txTotal + ' × ' + F(el.txSize) + ' kVA', '#3f3cbb'],
      ['LV switchboards', '低压配电柜', el.txTotal + ' ' + Lt('line-ups', '组'), '#3f3cbb'],
      ['UPS', 'UPS', el.upsTotal + ' × ' + F(el.upsSize) + ' kW', '#7c3aed'],
      [el.useBusway ? 'Busway' : 'PDU', el.useBusway ? '插接母线' : '列头柜', el.useBusway ? el.busways + ' × ' + el.bwA + ' A' : el.pdus + ' × 150 kVA', '#0ea5c6'],
      ['IT racks', 'IT机柜', F(R.cap.racks) + ' × ' + F(R.cap.avgDens, 1) + ' kW', '#17153f']
    ];
    var s = '<svg class="diagram" viewBox="0 0 ' + W + ' ' + H + '">';
    s += '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#5d6280"/></marker></defs>';
    nodes.forEach(function (n, i) {
      var x = 10 + i * (bw + gap);
      s += '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + bh + '" rx="10" fill="' + n[3] + '"/>';
      s += '<text x="' + (x + bw / 2) + '" y="' + (y + 22) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">' + esc(I18N.lang() === 'zh' ? n[1] : n[0]) + '</text>';
      if (I18N.lang() === 'bi') s += '<text x="' + (x + bw / 2) + '" y="' + (y + 38) + '" text-anchor="middle" font-size="11" fill="#d6f6fd">' + esc(n[1]) + '</text>';
      s += '<text x="' + (x + bw / 2) + '" y="' + (y + bh + 18) + '" text-anchor="middle" font-size="11.5" font-weight="700" fill="#161936">' + esc(n[2]) + '</text>';
      if (i < nodes.length - 1) s += '<line x1="' + (x + bw + 2) + '" y1="' + (y + bh / 2) + '" x2="' + (x + bw + gap - 3) + '" y2="' + (y + bh / 2) + '" stroke="#5d6280" stroke-width="2" marker-end="url(#ah)"/>';
    });
    var gx = 10 + 3 * (bw + gap), gy = 160;
    s += '<rect x="' + (gx - 10) + '" y="' + gy + '" width="' + (bw + 20) + '" height="56" rx="10" fill="#fdf1dc" stroke="#f2a93b" stroke-width="2"/>';
    s += '<text x="' + (gx + bw / 2) + '" y="' + (gy + 22) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#8a5a0a">' + esc(Lt('Generators', '发电机')) + '</text>';
    s += '<text x="' + (gx + bw / 2) + '" y="' + (gy + 40) + '" text-anchor="middle" font-size="11.5" font-weight="700" fill="#161936">' + el.genTotal + ' × ' + F(el.genSize) + ' kWe</text>';
    s += '<line x1="' + (gx + bw / 2) + '" y1="' + gy + '" x2="' + (gx + bw / 2) + '" y2="' + (y + bh + 26) + '" stroke="#f2a93b" stroke-width="2.5" marker-end="url(#ah)"/>';
    var bx = 10 + 4 * (bw + gap);
    s += '<rect x="' + (bx - 4) + '" y="' + gy + '" width="' + (bw + 8) + '" height="56" rx="10" fill="#efe8fd" stroke="#7c3aed" stroke-width="2"/>';
    s += '<text x="' + (bx + bw / 2) + '" y="' + (gy + 22) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#5b21b6">' + esc(Lt('Batteries', '电池')) + '</text>';
    s += '<text x="' + (bx + bw / 2) + '" y="' + (gy + 40) + '" text-anchor="middle" font-size="11.5" font-weight="700" fill="#161936">' + F(el.battKWh) + ' kWh</text>';
    s += '<line x1="' + (bx + bw / 2) + '" y1="' + gy + '" x2="' + (bx + bw / 2) + '" y2="' + (y + bh + 26) + '" stroke="#7c3aed" stroke-width="2.5" marker-end="url(#ah)"/>';
    s += '<text x="' + (W - 12) + '" y="' + (gy + 30) + '" text-anchor="end" font-size="11" fill="#5d6280">' + esc(el.feedsPerRack === 2 ? Lt('A + B feeds per rack', '每柜A+B双路') : Lt('Single feed', '单路')) + '</text>';
    return s + '</svg>';
  }
  function pPower(R) {
    var el = R.el, p = R.p, e = R.eff;
    var html = '<div class="card">' + panelTitle('Critical power chain', '关键供电链') + powerDiagram(R) + '</div>';
    html += '<div class="grid g2"><div class="card">' + panelTitle('Electrical sizing', '电气容量') + kv([
      ['IT load', 'IT负载', F(R.cap.itKW) + ' kW'],
      ['UPS-protected load (incl. critical mechanical)', 'UPS保护负载（含关键机械）', F(el.upsLoad) + ' kW'],
      ['Facility maximum demand', '设施最大需量', F(el.demandKW) + ' kW · ' + F(el.demandKVA) + ' kVA'],
      ['Utility connection', '市电接入', F(el.mva, 1) + ' MVA · ' + Li(el.volt[0], el.volt[1]) + ' · ' + el.feeds + ' ' + Li('feed(s)', '路')],
      ['Grid offered vs. needed', '电网可供vs需求', p.gridMVA > 0 ? (el.gridOK ? '✔ ' : '✖ ') + F(p.gridMVA, 1) + ' / ' + F(el.mva, 1) + ' MVA' : Li('not specified', '未提供')],
      ['MV/LV transformers', '中/低压变压器', el.txTotal + ' × ' + F(el.txSize) + ' kVA (' + el.txLabel + ')'],
      ['Diesel generators (COP/DCC)', '柴油发电机（持续功率）', el.genTotal + ' × ' + F(el.genSize) + ' kWe (' + el.genLabel + ')'],
      ['Fuel consumption at max demand', '最大需量下耗油', F(el.fuelLph) + ' L/h'],
      ['On-site fuel storage', '现场储油', F(el.fuelL / 1000) + ' m³ (' + p.fuelH + ' h) · ' + el.tanks + ' × ' + el.tankSize + ' m³'],
      ['UPS systems', 'UPS系统', el.upsTotal + ' × ' + F(el.upsSize) + ' kW (' + el.upsLabel + ')'],
      ['Battery energy installed', '电池装机能量', F(el.battKWh) + ' kWh · ' + (p.battery === 'LI' ? 'Li-ion LFP' : 'VRLA') + ' · ' + p.upsMin + ' min'],
      ['IT distribution', 'IT配电', el.useBusway ? el.busways + ' ' + Li('busway runs × ', '条母线 × ') + el.bwA + ' A (' + el.rows + ' ' + Li('rows', '列') + ')' : el.pdus + ' × 150 kVA PDU'],
      ['Rack PDUs', '机架PDU', F(el.rpdus) + ' · ' + Li(el.rStd[0], el.rStd[1]) + (el.rHd ? ' · HD: ' + Li(el.rHd[0], el.rHd[1]) : '')]
    ]) + '</div><div class="card">' + panelTitle('Energy & PUE breakdown', '能耗与PUE构成') +
      C.stackBar([{ label: 'IT', html: Li('IT', 'IT'), value: 1, color: '#c7d2fe' }, { label: 'Cooling', html: Li('Cooling', '制冷'), value: e.mech, color: '#0ea5c6' }, { label: 'Electrical losses', html: Li('Electrical losses', '电气损耗'), value: e.elec, color: '#f2a93b' }, { label: 'Lighting & other', html: Li('Lighting & other', '照明及其他'), value: e.misc, color: '#7c3aed' }], { dec: 3, h: 38 }) +
      kv([['Annual PUE at full load', '满载年均PUE', F(e.pue, 2)], ['PUE at 50% utilisation', '50%利用率PUE', F(e.pue50, 2)], ['Design-day PUE (for sizing)', '设计日PUE（用于选型）', F(e.puePeak, 2)],
          ['Annual energy (stabilised)', '年用电量（稳定期）', F(R.opex.energyMWh) + ' MWh'], ['Annual energy cost', '年电费', money(R.opex.energy)],
          ['China GB 40879 grade', '中国GB 40879等级', e.gbGrade ? Li('Grade ', '') + e.gbGrade + Li('', '级') : Li('Not compliant (> 1.5)', '不达标（>1.5）')]]) + '</div></div>';
    html += eqLinks(['EL-01', 'EL-02', 'EL-03', 'EL-04', 'EL-06', 'EL-09', p.battery === 'LI' ? 'EL-10' : 'EL-11', el.useBusway ? 'EL-13' : 'EL-12', 'EL-14']);
    return html;
  }
  function eqLinks(ids) {
    return '<div class="card"><h4 style="margin-top:0">' + Li('Specifications & TPG for these systems', '相关系统的技术规范及TPG') + '</h4><div class="row" style="gap:6px">' + ids.map(function (id) {
      var e = DB.equipment.filter(function (x) { return x.id === id; })[0]; if (!e) return '';
      return '<button class="chip ind" style="cursor:pointer" data-act="eq" data-id="' + id + '">' + id + ' · ' + Li(e.en, e.zh) + '</button>'; }).join('') + '</div></div>';
  }
  function pCooling(R) {
    var me = R.me, cl = R.cool, p = R.p;
    var why = {
      DLC: ['Maximum rack density ≥ 40 kW (or average ≥ 35 kW) — air cannot remove the heat; direct-to-chip liquid cooling with a warm-water loop.', '最大机柜密度≥40 kW（或平均≥35 kW）——风冷无法排热；采用冷板液冷与温水环路。'],
      DX: ['Small facility (< 0.6 MW): self-contained DX precision units are simplest and avoid a chilled-water plant.', '小型设施（<0.6 MW）：一体化直膨精密空调最简单，无需冷冻水站。'],
      IEC: ['Dry/temperate/cold climate with moderate density — indirect evaporative cooling gives very low PUE.', '干燥/温和/寒冷气候且密度适中——间接蒸发冷却PUE极低。'],
      ACCH: ['Medium facility or water-scarce site — air-cooled chillers with free-cooling coils avoid evaporative water use.', '中型设施或缺水场地——带自然冷却盘管的风冷冷机可避免蒸发耗水。'],
      WCCH: ['Large facility in a hot-humid climate — water-cooled centrifugal chillers with elevated chilled water give the best efficiency.', '湿热气候下的大型设施——高温冷冻水的水冷离心冷机效率最佳。'],
      IMM: ['Immersion cooling selected — highest density and lowest PUE, needs compatible IT and fluid handling.', '选择浸没式液冷——密度最高、PUE最低，需兼容IT及冷却液管理。']
    };
    var html = '<div class="card">' + panelTitle('Cooling strategy', '制冷策略') + '<div class="row" style="align-items:flex-start;gap:14px"><div class="ficon" style="background:#0ea5c6">' + ic('snow') + '</div><div style="flex:1"><h3>' + L(cl.obj.en, cl.obj.zh) + '</h3><div>' + Lp(why[cl.rec], false) + '</div>' +
      (cl.tech !== cl.rec ? '<div class="small" style="margin-top:6px;color:#b42318">' + Li('You selected a different technology than recommended (' + find(DB.cooling, cl.rec).en + ').', '您选择的技术与推荐不同（' + find(DB.cooling, cl.rec).zh + '）。') + '</div>' : '') + '</div></div></div>';
    var rows = [['Total heat to reject', '总散热量', F(me.totalHeat) + ' kW · ' + F(me.tr) + ' RT'], ['Heat to air / to liquid', '风冷/液冷热量', F(cl.airKW) + ' / ' + F(cl.liquidKW) + ' kW']];
    if (me.cracN) rows.push(['DX precision AC units', '直膨精密空调', (me.cracN + me.cracR) + ' × ' + me.cracSize + ' kW (' + E.redLabel(me.cracN, me.cracR) + ')']);
    if (me.chN) rows.push([R.cool.airTech === 'WCCH' ? 'Water-cooled chillers' : 'Air-cooled chillers', R.cool.airTech === 'WCCH' ? '水冷冷水机组' : '风冷冷水机组', (me.chN + me.chR) + ' × ' + F(me.chSize) + ' kW (' + me.chLabel + ') · ' + F(me.chwLoad) + ' kW']);
    if (me.ctN) rows.push(['Cooling tower cells', '冷却塔单元', (me.ctN + me.ctR) + ' · ' + F(me.rejKW) + ' kW ' + Li('heat rejection', '排热')]);
    if (me.pumps) rows.push(['Chilled / condenser water pumps', '冷冻/冷却水泵', me.pumps]);
    if (me.tesM3) rows.push(['Thermal storage (10 min ride-through)', '蓄冷罐（10 min穿越）', F(me.tesM3) + ' m³']);
    if (me.term) rows.push(['Air terminals', '空气末端', Li(me.term.en, me.term.zh) + ' × ' + (me.term.n + me.term.r) + ' (' + E.redLabel(me.term.n, me.term.r) + ')']);
    if (me.iecN) rows.push(['Indirect evaporative modules', '间接蒸发冷却模块', (me.iecN + me.iecR) + ' × 400 kW']);
    if (me.cduN) rows.push(['Coolant distribution units', '冷量分配单元', (me.cduN + me.cduR) + ' × ' + me.cduSize + ' kW (N+' + me.cduR + ')']);
    if (me.dcN) rows.push(['Liquid-loop heat rejection (dry coolers / towers)', '液冷环路散热（干冷器/冷却塔）', (me.dcN + me.dcR) + ' × 1,500 kW']);
    if (me.tanks) rows.push(['Immersion tanks', '浸没槽', me.tanks + ' × 100 kW']);
    if (me.phx) rows.push(['Plate heat exchangers (free cooling)', '板式换热器（自然冷却）', me.phx]);
    rows.push(['Water use', '用水', F(me.waterDay) + ' m³/' + Li('day', '日') + ' · WUE ' + F(R.eff.wue, 2) + ' L/kWh']);
    rows.push(['Make-up water storage', '补水储量', F(me.waterStore) + ' m³ (' + Math.max(12, p.fuelH) + ' h)']);
    html += '<div class="grid"><div class="card">' + panelTitle('Cooling plant sizing', '制冷设备容量') + kv(rows) + '</div><div class="card">' + panelTitle('Technology fit by rack density', '按密度的技术适配') +
      C.ranges(DB.cooling.map(function (c) { return { label: Lt(c.en.replace(/ \(.*\)/, ''), c.zh.replace(/（.*）/, '')), a: { DX: 3, ACCH: 5, WCCH: 5, IEC: 5, DLC: 40, IMM: 50 }[c.id], b: c.maxDens, color: c.id === cl.tech ? '#f0544f' : '#a5b4fc' }; }), 0, 200, '') +
      '<div class="small muted" style="margin-top:6px">' + Li('kW per rack · selected technology in coral · your max density ', 'kW/柜·珊瑚色为所选技术·您的最大密度 ') + F(R.cap.maxDens, 0) + ' kW</div></div></div>';
    html += eqLinks(R.boq.filter(function (b) { return b.sys === 'ME'; }).map(function (b) { return b.id; }));
    return html;
  }
  function find(arr, id) { return arr.filter(function (x) { return x.id === id; })[0] || {}; }

  function pSpace(R) {
    var sp = R.sp, p = R.p;
    var html = '<div class="grid g2"><div class="card">' + panelTitle('Building areas', '建筑面积') +
      C.stackBar([{ label: 'White space', html: Li('White space', '白区'), value: sp.ws, color: '#3f3cbb' }, { label: 'Electrical', html: Li('Electrical', '电气'), value: sp.elecRoom, color: '#f2a93b' }, { label: 'Mechanical', html: Li('Mechanical', '暖通'), value: sp.mechRoom, color: '#0ea5c6' }, { label: 'Support', html: Li('Support', '支持区'), value: sp.support, color: '#7c3aed' }, { label: 'Circulation', html: Li('Circulation & walls', '交通及墙体'), value: sp.gfa - sp.ws - sp.elecRoom - sp.mechRoom - sp.support, color: '#a3a6c8' }], { unit: ' m²', h: 38 }) +
      kv([['White space (data halls)', '白区（数据机房）', F(sp.ws) + ' m² · ' + sp.halls + ' ' + Li('hall(s)', '个机房')], ['White space per rack', '每柜白区面积', F(sp.rackArea, 2) + ' m²'],
          ['Electrical rooms (MV, LV, UPS, batteries)', '电气房间（中压、低压、UPS、电池）', F(sp.elecRoom) + ' m²'], ['Mechanical rooms', '暖通机房', F(sp.mechRoom) + ' m²'], ['Support (NOC, dock, staging, offices)', '支持区（NOC、装卸、预置、办公）', F(sp.support) + ' m²'],
          ['Gross floor area', '总建筑面积', '<b>' + F(sp.gfa) + ' m²</b> · ' + F(sp.gfa / R.cap.itMW) + ' m²/MW'], ['Footprint (' + p.floors + ' storeys)', '占地（' + p.floors + '层）', F(sp.footprint) + ' m²']]) + '</div>' +
      '<div class="card">' + panelTitle('Site', '场地') + kv([['External plant yards (generators, transformers, fuel, heat rejection)', '室外设备场地（发电机、变压器、油罐、散热）', F(sp.yard) + ' m²'],
          ['Substation / utility intake', '变电站/市电进线', F(sp.subst) + ' m²'], ['Site area required (incl. roads, parking, setbacks)', '所需用地（含道路、停车、退界）', '<b>' + F(sp.siteNeed) + ' m² (' + F(sp.siteNeed / 10000, 2) + ' ha)</b>'],
          ['Available site', '可用场地', p.siteArea > 0 ? F(p.siteArea) + ' m² — ' + (sp.siteOK ? '<span class="chip green">' + Li('sufficient', '充足') + '</span>' : '<span class="chip coral">' + Li('insufficient', '不足') + '</span>') : Li('not specified', '未提供')],
          ['White-space floor', '白区地面', sp.raised ? Li('Raised access floor', '防静电架空地板') : Li('Slab-on-grade, overhead distribution', '无架空地板，上走线')],
          ['Floor live load (white space)', '白区楼面活荷载', '≥ ' + sp.floorLoad + ' kN/m²'], ['Clear height', '净高', esc(sp.clearH)],
          ['Seismic / flood', '地震/洪水', Li({ low: 'Low', med: 'Medium', high: 'High' }[p.seismic], { low: '低', med: '中', high: '高' }[p.seismic]) + ' / ' + Li({ low: 'Low', med: 'Medium', high: 'High' }[p.flood], { low: '低', med: '中', high: '高' }[p.flood])]]) + '</div></div>';
    html += '<div class="card">' + panelTitle('Site selection checklist', '选址检查清单') + '<div class="grid g3">' + [
      ['Power: ' + F(R.el.mva, 1) + ' MVA available within schedule; two diverse substations for Tier III+', '电力：在工期内可提供' + F(R.el.mva, 1) + ' MVA；Tier III+需两个不同变电站'],
      ['Fibre: ≥ 2 carriers, diverse routes ≥ 20 m apart, low latency to users/IX', '光纤：≥2家运营商，相距≥20 m的分离路由，到用户/IX低时延'],
      ['Hazards: outside 100/500-year flood plain, away from airports, chemical plants, fault lines', '灾害：位于百年/五百年洪水区以外，远离机场、化工厂、断层'],
      ['Land: zoning allows data center use; site ≥ ' + F(R.sp.siteNeed / 10000, 1) + ' ha plus expansion', '土地：规划允许数据中心用途；用地≥' + F(R.sp.siteNeed / 10000, 1) + '公顷并预留扩建'],
      ['Water: ' + F(R.me.waterDay) + ' m³/day make-up (or closed-loop design)', '水：每日补水' + F(R.me.waterDay) + ' m³（或闭式设计）'],
      ['Permits: environmental (AMDAL/UKL-UPL), building (PBG/SLF), utility and spatial (PKKPR) in Indonesia', '许可：印尼环境（AMDAL/UKL-UPL）、建筑（PBG/SLF）、电力及空间规划（PKKPR）']
    ].map(function (x) { return '<div class="req"><span class="tag" style="background:#b45309">✓</span><div class="small">' + L(x[0], x[1]) + '</div></div>'; }).join('') + '</div></div>';
    return html;
  }
  function pFS(R) {
    var fs = R.fs, p = R.p;
    return '<div class="grid g2"><div class="card">' + panelTitle('Fire protection', '消防') + kv([
      ['Suppression strategy', '灭火策略', L(fs.suppression[0], fs.suppression[1])],
      ['Gas suppression zones (≤ 800 m² each, GB 50370)', '气体灭火分区（每区≤800 m²，GB 50370）', fs.gasZones ? fs.gasZones + ' · ≈ ' + F(fs.agentKg) + ' kg HFC-227ea ' + Li('equivalent', '当量') : Li('n/a (sprinkler-based halls)', '不适用（喷淋方案）')],
      ['Protected white-space volume', '白区保护容积', F(fs.vol) + ' m³'],
      ['Aspirating smoke detectors', '吸气式烟雾探测器', fs.asd],
      ['Pre-action sprinkler zones', '预作用喷淋分区', Math.max(1, R.sp.halls)],
      ['Leak detection', '漏水检测', Li('Under floors, around CRAH/CDU and pipe routes', '地板下、精密空调/CDU周边及管道沿线')],
      ['Li-ion battery rooms', '锂电池室', p.battery === 'LI' ? Li('Off-gas detection, fire separation, NFPA 855 / UL 9540A', '逸出气体探测、防火分隔、NFPA 855/UL 9540A') : Li('Hydrogen ventilation (VRLA)', '排氢通风（铅酸）')]
    ]) + '</div><div class="card">' + panelTitle('Security & monitoring', '安防与监控') + kv([
      ['Security layers', '安防层级', fs.securityLayers + ' ' + Li('(fence → rack)', '（围栏→机柜）')],
      ['Access-controlled doors (card + biometric)', '门禁门数（卡+生物识别）', '≈ ' + fs.readers],
      ['CCTV cameras (≥ 90-day retention)', 'CCTV摄像机（≥90天）', '≈ ' + fs.cams],
      ['Mantraps', '防尾随门', Math.max(1, R.sp.halls > 2 ? 2 : 1)],
      ['BMS points', 'BMS点位', '≈ ' + F(fs.bmsPts)],
      ['EPMS meters', 'EPMS表计', '≈ ' + fs.meters],
      ['DCIM', 'DCIM', Li('Asset, capacity, power, environment, PUE/WUE dashboards', '资产、容量、电力、环境、PUE/WUE仪表盘')]
    ]) + '</div></div>' + eqLinks(['FP-01', 'FP-02', 'FP-03', 'FP-05', 'FP-07', 'SC-01', 'SC-02', 'MC-01', 'MC-02', 'MC-03']);
  }
  function pBOQ(R) {
    var rows = R.boq.map(function (b) {
      return '<tr><td><button class="chip ind" style="cursor:pointer" data-act="eq" data-id="' + b.id + '">' + b.id + '</button></td><td>' + L(b.en, b.zh) + '</td><td class="r num"><b>' + F(b.qty) + '</b></td><td>' + esc(b.unit) + '</td><td>' + esc(b.rating) + '</td><td class="small muted">' + esc(b.note) + '</td></tr>';
    }).join('');
    return '<div class="card">' + panelTitle('Major & secondary equipment list (planning quantities)', '主要及次要设备清单（规划数量）', '<button class="btn small ghost" data-act="csv">' + ic('download') + 'CSV</button>') +
      '<div class="tblw"><table class="t"><thead><tr><th>' + Li('Ref.', '编号') + '</th><th>' + Li('Equipment', '设备') + '</th><th class="r">' + Li('Qty', '数量') + '</th><th>' + Li('Unit', '单位') + '</th><th>' + Li('Rating', '规格') + '</th><th>' + Li('Note', '备注') + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="small muted" style="margin-top:8px">' + Li('Click a reference to open its specification clauses and TPG schedule.', '点击编号可查看其技术条款及TPG表。') + '</div></div>';
  }
  function exportBOQ() {
    var R = S.R; if (!R) return;
    download((R.p.name || 'assessment').replace(/[^\w\-]+/g, '_') + '_equipment_list.csv', csv([['Ref', 'Equipment', '设备', 'Qty', 'Unit', 'Rating', 'Note']].concat(R.boq.map(function (b) { return [b.id, b.en, b.zh, Math.round(b.qty), b.unit, b.rating, b.note]; }))), 'text/csv;charset=utf-8');
  }
  function exportFin() {
    var R = S.R; if (!R) return;
    download((R.p.name || 'assessment').replace(/[^\w\-]+/g, '_') + '_cashflow_USD.csv', csv([['Year', 'Built kW', 'Used kW', 'CAPEX', 'Revenue', 'Energy', 'OPEX', 'EBITDA', 'Tax', 'Cash flow', 'Cumulative']].concat(R.fin.rows.map(function (r) {
      return [r.year, Math.round(r.built), Math.round(r.used), Math.round(r.capex), Math.round(r.rev), Math.round(r.energy), Math.round(r.opex), Math.round(r.ebitda), Math.round(r.tax), Math.round(r.cf), Math.round(r.cum)]; }))), 'text/csv;charset=utf-8');
  }
  function pFin(R) {
    var cx = R.capex, op = R.opex, f = R.fin, p = R.p;
    var cols = ['#e39b1b', '#0ea5c6', '#b45309', '#f0544f', '#3f3cbb', '#16a34a', '#a3a6c8', '#7c3aed'];
    var html = '<div class="grid g2"><div class="card">' + panelTitle('Capital expenditure (CAPEX)', '资本性支出（CAPEX）') +
      '<div class="tblw"><table class="t"><thead><tr><th>' + Li('Item', '项目') + '</th><th class="r">' + esc(S.cur) + '</th><th class="r">%</th></tr></thead><tbody>' +
      cx.breakdown.map(function (b) { return '<tr><td>' + L(b.en, b.zh) + '</td><td class="r num">' + money(b.usd) + '</td><td class="r num">' + F(b.share * 100, 0) + '%</td></tr>'; }).join('') +
      '<tr class="grp"><td>' + Li('Facility subtotal', '设施小计') + ' (' + money(cx.perMW * 1e6, 2) + '/MW)</td><td class="r num">' + money(cx.facility) + '</td><td class="r">100%</td></tr>' +
      '<tr><td>' + Li('Utility connection & substation', '电网接入及变电站') + '</td><td class="r num">' + money(cx.utility) + '</td><td></td></tr>' +
      '<tr><td>' + Li('Land', '土地') + ' (' + F(cx.landArea) + ' m²)</td><td class="r num">' + money(cx.land) + '</td><td></td></tr>' +
      '<tr><td>' + Li('Contingency', '不可预见费') + ' (' + p.contingency + '%)</td><td class="r num">' + money(cx.cont) + '</td><td></td></tr>' +
      (cx.itHW ? '<tr><td>' + Li('IT hardware', 'IT硬件') + '</td><td class="r num">' + money(cx.itHW) + '</td><td></td></tr>' : '') +
      '<tr class="grp"><td>' + Li('Total CAPEX', '总投资') + '</td><td class="r num">' + money(cx.total) + '</td><td></td></tr></tbody></table></div>' +
      '<div class="small muted" style="margin-top:6px">' + Li('Benchmark ', '基准 ') + money(cx.base * 1e6, 1) + '/MW (' + Li(R.reg.en, R.reg.zh) + ', Tier III) × ' + Li('Tier', '等级') + ' × ' + Li('scale', '规模') + ' ' + F(cx.scaleF, 2) + ' × ' + Li('cooling', '制冷') + '</div></div>' +
      '<div class="card">' + panelTitle('Facility CAPEX by system', '按系统划分的设施投资') + C.donut(cx.breakdown.map(function (b, i) { return { label: Lt(b.en, b.zh), html: Li(b.en.replace(/ \(.*\)/, ''), b.zh.replace(/（.*）/, '')), value: b.usd, color: cols[i] }; }), { center: money(cx.facility), centerSub: Lt('facility', '设施') }) + '</div></div>';
    html += '<div class="grid g2"><div class="card">' + panelTitle('Operating cost (stabilised year)', '运营成本（稳定年）') + kv([
      ['Energy', '电费', money(op.energy) + ' · ' + F(op.energyMWh) + ' MWh'], ['Maintenance (≈ 1.2% of facility CAPEX)', '维护（约设施投资1.2%）', money(op.maint)], ['Staff (' + R.staff.fte + ' FTE)', '人员（' + R.staff.fte + '人）', money(op.staff)],
      ['Insurance & property', '保险及物业', money(op.insurance)], ['Water', '水费', money(op.water)], ['Other G&A', '其他管理费用', money(op.other)], ['Total OPEX', '运营成本合计', '<b>' + money(op.total) + '</b>'],
      ['Carbon emissions (scope 2)', '碳排放（范围二）', F(op.co2t) + ' tCO₂e']]) + '</div><div class="card">' + panelTitle(p.revModel === 'lease' ? 'Investment returns (unlevered, after tax)' : 'Total cost of ownership', p.revModel === 'lease' ? '投资回报（无杠杆、税后）' : '总拥有成本') +
      (p.revModel === 'lease' ? kv([['IRR without / with exit value', '内部收益率（不含/含终值）', pct(f.irr) + ' / <b>' + pct(f.irrTV) + '</b>'], ['NPV @ ' + p.wacc + '% (with exit)', '净现值@' + p.wacc + '%（含终值）', money(f.npvTV)],
        ['Exit value (year ' + p.life + ')', '终值（第' + p.life + '年）', money(f.tv) + ' (' + p.exitMult + '× EBITDA)'], ['Simple payback', '静态回收期', f.payback ? f.payback + ' ' + Li('years', '年') : Li('> analysis period', '>分析期')],
        ['Levelised cost (excl. power)', '平准化成本（不含电）', money(f.lcoc, 0) + '/kW·' + Li('month', '月')], ['Lease price', '租赁价格', money(p.price, 0) + '/kW·' + Li('month', '月')]])
        : kv([['TCO present value', '总拥有成本现值', money(f.tcoPV)], ['Cost of ownership (all-in)', '全口径拥有成本', money(f.lcocAll, 0) + '/kW·' + Li('month', '月')], ['Cost excl. power', '不含电成本', money(f.lcoc, 0) + '/kW·' + Li('month', '月')],
          ['Equivalent colocation lease (PV)', '等效托管租赁（现值）', money(f.leaseAltPV) + ' @ ' + money(p.price, 0) + '/kW·' + Li('mo', '月')], ['Build vs. lease', '自建vs租赁', f.tcoPV < f.leaseAltPV ? '<span class="chip green">' + Li('Building is cheaper', '自建更经济') + '</span>' : '<span class="chip amber">' + Li('Leasing is cheaper', '租赁更经济') + '</span>']])) + '</div></div>';
    html += '<div class="card">' + panelTitle('Annual cash flow (bars) and cumulative (line)', '年度现金流（柱）与累计（线）', '<button class="btn small ghost" data-act="fincsv">' + ic('download') + 'CSV</button>') + C.cashflow(f.rows.map(function (r) { return { year: r.year, cf: r.cf * (S.fx[S.cur] || 1), cum: r.cum * (S.fx[S.cur] || 1) }; }), { unit: S.cur + ' M' }) +
      '<details style="margin-top:10px"><summary class="small" style="cursor:pointer">' + Li('Show yearly table', '显示年度表') + '</summary><div class="tblw" style="margin-top:8px"><table class="t"><thead><tr><th>' + Li('Year', '年份') + '</th><th class="r">' + Li('Used kW', '使用kW') + '</th><th class="r">CAPEX</th><th class="r">' + Li('Revenue', '收入') + '</th><th class="r">OPEX</th><th class="r">EBITDA</th><th class="r">' + Li('Cash flow', '现金流') + '</th><th class="r">' + Li('Cumulative', '累计') + '</th></tr></thead><tbody>' +
      f.rows.map(function (r) { return '<tr><td>' + r.year + '</td><td class="r num">' + F(r.used) + '</td><td class="r num">' + money(r.capex) + '</td><td class="r num">' + money(r.rev) + '</td><td class="r num">' + money(r.opex) + '</td><td class="r num">' + money(r.ebitda) + '</td><td class="r num">' + money(r.cf) + '</td><td class="r num">' + money(r.cum) + '</td></tr>'; }).join('') + '</tbody></table></div></details></div>';
    return html;
  }
  function pSched(R) {
    var t = R.sched.tasks.map(function (x) { return { text: Lt(x.en, x.zh), s: x.s, d: x.d, c: x.c }; }), st = R.staff;
    return '<div class="card">' + panelTitle('Indicative programme to Ready-for-Service (phase 1)', '至第一期投产的参考进度') + C.gantt(t, R.sched.total) +
      '<div class="small muted" style="margin-top:6px">' + Li('Durations in months from project start; long-lead items and utility connection typically drive the critical path.', '自项目启动起的月数；长周期设备及电网接入通常决定关键路径。') + '</div></div>' +
      '<div class="grid g2"><div class="card">' + panelTitle('Milestones', '里程碑') + '<div class="tblw"><table class="t"><thead><tr><th>' + Li('Activity', '活动') + '</th><th class="r">' + Li('Start', '开始') + '</th><th class="r">' + Li('Duration', '工期') + '</th></tr></thead><tbody>' +
      R.sched.tasks.map(function (x) { return '<tr><td>' + L(x.en, x.zh) + '</td><td class="r">M' + x.s + '</td><td class="r">' + x.d + ' ' + Li('mo', '月') + '</td></tr>'; }).join('') + '</tbody></table></div></div>' +
      '<div class="card">' + panelTitle('Operations staffing (24/7)', '运营人员配置（7×24）') + C.stackBar([{ label: 'Facility', html: Li('Facility engineers', '设施工程师'), value: st.fac, color: '#3f3cbb' }, { label: 'Security', html: Li('Security', '安保'), value: st.sec, color: '#7c3aed' }, { label: 'NOC', html: Li('NOC / remote hands', 'NOC/现场支持'), value: st.noc, color: '#0ea5c6' }, { label: 'Mgmt', html: Li('Management & admin', '管理及行政'), value: st.mgmt, color: '#f2a93b' }], { dec: 1, h: 34, unit: ' FTE' }) +
      '<div style="margin-top:10px">' + L('A 24/7 post needs ≈ 5.2 FTE (shift rota incl. leave & training). Small sites share NOC and engineering with a central team.', '每个7×24岗位约需5.2人（含轮班、休假及培训）。小型站点可与中心团队共享NOC及工程人员。') + '</div></div></div>';
  }
  function pRisk(R) {
    return '<div class="card">' + panelTitle('Risk register', '风险登记册') + '<div class="row small" style="gap:10px;margin-bottom:6px"><span><span class="lv H">H</span> ' + Li('High', '高') + '</span><span><span class="lv M">M</span> ' + Li('Medium', '中') + '</span><span><span class="lv L">L</span> ' + Li('Low', '低') + '</span></div>' + R.risks.map(riskRow).join('') + '</div>';
  }
  function pStd(R) {
    var names = { INT: ['International', '国际'], US: ['USA', '美国'], EU: ['Europe', '欧洲'], CN: ['China', '中国'], ID: ['Indonesia', '印度尼西亚'], SG: ['Singapore', '新加坡'] };
    return '<div class="card">' + panelTitle('Applicable codes & standards (' + Lt(R.reg.en, R.reg.zh) + ')', '适用规范与标准') + '<div class="tblw"><table class="t"><thead><tr><th>' + Li('Code', '规范') + '</th><th>' + Li('Region', '地区') + '</th><th>' + Li('Scope', '范围') + '</th></tr></thead><tbody>' +
      R.standards.map(function (s) { return '<tr><td><b>' + esc(s.c) + '</b></td><td class="nowrap">' + Li(names[s.r][0], names[s.r][1]) + '</td><td>' + L(s.en, s.zh) + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
  }

  /* ========================================================= REFERENCES */
  function refMini(r) {
    var mw = r.kind === 'arch' ? r.input.itMW || (r.input.racks * r.input.dens / 1000) : r.mw;
    return '<div class="refcard" data-act="ref" data-id="' + r.id + '"><div class="meta"><span class="chip ' + (r.kind === 'arch' ? 'ind' : 'cyan') + '">' + (r.kind === 'arch' ? Li('Benchmark design', '基准设计') : Li('Real project', '真实项目')) + '</span>' +
      (mw ? '<span class="chip">' + F(mw, mw < 1 ? 2 : 0) + ' MW</span>' : '') + '</div><h4>' + L(r.en, r.zh) + '</h4><div class="facts">' + Lp(r.loc, true) + '</div></div>';
  }
  function renderRefs() {
    var f = S.ref, q = f.q.toLowerCase();
    var list = DB.references.filter(function (r) {
      if (f.kind !== 'all' && r.kind !== f.kind) return false;
      if (f.type !== 'all' && r.type !== f.type) return false;
      if (q && (r.en + r.zh + (r.loc || []).join(' ') + JSON.stringify(r.facts || r.d)).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    var html = '<h2 class="sec">' + Li('Reference project database', '参考项目数据库') + '</h2><div class="sec-sub">' + Li('Benchmark designs carry complete planning & feasibility data generated by the assessment engine; real projects show publicly reported facts with sources.', '基准设计包含由评估引擎生成的完整规划与可研数据；真实项目展示公开报道的信息及来源。') + '</div>' +
      '<div class="filters"><input class="search" id="refQ" placeholder="' + esc(Lt('Search projects, locations, features…', '搜索项目、地点、特征…')) + '" value="' + esc(f.q) + '">' +
      '<select class="fsel" id="refKind"><option value="all">' + esc(Lt('All kinds', '全部类别')) + '</option><option value="arch"' + (f.kind === 'arch' ? ' selected' : '') + '>' + esc(Lt('Benchmark designs', '基准设计')) + '</option><option value="real"' + (f.kind === 'real' ? ' selected' : '') + '>' + esc(Lt('Real projects', '真实项目')) + '</option></select>' +
      '<select class="fsel" id="refType"><option value="all">' + esc(Lt('All types', '全部类型')) + '</option>' + DB.dcTypes.map(function (t) { return '<option value="' + t.id + '"' + (f.type === t.id ? ' selected' : '') + '>' + esc(Lt(t.en, t.zh)) + '</option>'; }).join('') + '</select></div>';
    var arch = list.filter(function (r) { return r.kind === 'arch'; }), real = list.filter(function (r) { return r.kind === 'real'; });
    if (arch.length) {
      html += '<h3>' + Li('Benchmark reference designs', '基准参考设计') + ' (' + arch.length + ')</h3><div class="card flat" style="padding:0;overflow:hidden"><div class="tblw"><table class="t"><thead><tr><th>' + Li('Project', '项目') + '</th><th class="r">MW</th><th>Tier</th><th class="r">' + Li('Racks', '机柜') + '</th><th>' + Li('Cooling', '制冷') + '</th><th class="r">PUE</th><th class="r">CAPEX</th><th class="r">' + Li('USD M/MW', '百万美元/MW') + '</th><th class="r">' + Li('Months', '月') + '</th><th class="r">' + Li('IRR / TCO', 'IRR/TCO') + '</th></tr></thead><tbody>' +
        arch.map(function (r) { var R = E.assess(r.input); return '<tr style="cursor:pointer" data-act="ref" data-id="' + r.id + '"><td><b>' + Li(r.en, r.zh) + '</b><div class="small muted">' + Lp(r.loc, true) + '</div></td><td class="r num">' + F(R.cap.itMW, R.cap.itMW < 1 ? 2 : 0) + '</td><td>' + ['I', 'II', 'III', 'IV'][R.p.tier - 1] + '</td><td class="r num">' + F(R.cap.racks) + '</td><td class="small">' + Li(R.cool.obj.en.replace(/ \(.*\)/, ''), R.cool.obj.zh.replace(/（.*）/, '')) + '</td><td class="r num">' + F(R.eff.pue, 2) + '</td><td class="r num">' + money(R.capex.total) + '</td><td class="r num">' + F(R.capex.perMW, 1) + '</td><td class="r num">' + R.sched.total + '</td><td class="r num">' + (R.p.revModel === 'lease' ? pct(R.fin.irrTV) : money(R.fin.lcocAll, 0) + '/kW·mo') + '</td></tr>'; }).join('') +
        '</tbody></table></div></div>';
    }
    if (real.length) html += '<h3 style="margin-top:18px">' + Li('Real-world projects (public information)', '真实项目（公开信息）') + ' (' + real.length + ')</h3><div class="grid g3">' + real.map(function (r) {
      return '<div class="refcard" data-act="ref" data-id="' + r.id + '"><div class="meta"><span class="chip cyan">' + esc(r.country) + '</span><span class="chip">' + Li(find(DB.dcTypes, r.type).en || r.type, find(DB.dcTypes, r.type).zh) + '</span>' + (r.mw ? '<span class="chip amber">≈ ' + F(r.mw) + ' MW</span>' : '') + '</div><h4>' + L(r.en, r.zh) + '</h4><div class="facts">' + Lp(r.loc, true) + '<br>' + Lp(r.facts[0], false) + '</div></div>';
    }).join('') + '</div>';
    if (!list.length) html += '<div class="card">' + Li('No matching projects.', '没有匹配的项目。') + '</div>';
    $('#view-refs').innerHTML = html;
  }
  function openRef(id) {
    var r = DB.references.filter(function (x) { return x.id === id; })[0]; if (!r) return;
    var body = '';
    if (r.kind === 'arch') {
      var R = E.assess(r.input);
      body += '<p>' + Lp(r.d, false) + '</p><div class="tiles" style="margin-top:12px">' +
        tile(F(R.cap.itMW, 2), 'MW', 'IT capacity', 'IT容量', F(R.cap.racks) + ' ' + Li('racks', '机柜')) + tile(R.cap.tier.en.split(' — ')[0], '', 'Tier', '等级', R.cap.tier.avail + '%', '#17153f') +
        tile(F(R.eff.pue, 2), '', 'PUE', 'PUE', Li(R.cool.obj.en, R.cool.obj.zh), '#0ea5c6') + tile(F(R.el.mva, 1), 'MVA', 'Utility', '市电', R.el.genTotal + ' × ' + R.el.genSize + ' kWe', '#f2a93b') +
        tile(money(R.capex.total), '', 'CAPEX', '投资', F(R.capex.perMW, 1) + ' USD M/MW', '#f0544f') + tile(R.sched.total, Li('months', '月'), 'To RFS', '至投产', '', '#16a34a') +
        tile(F(R.sp.gfa), 'm²', 'GFA', '建筑面积', F(R.sp.siteNeed / 10000, 2) + ' ha', '#b45309') + tile(R.p.revModel === 'lease' ? pct(R.fin.irrTV) : money(R.fin.lcocAll, 0), R.p.revModel === 'lease' ? '' : '/kW·mo', R.p.revModel === 'lease' ? 'IRR (with exit)' : 'Cost of ownership', R.p.revModel === 'lease' ? 'IRR（含终值）' : '拥有成本', '', '#7c3aed') + '</div>';
      body += '<h4>' + Li('Key requirements', '关键要求') + '</h4>' + R.reqs.slice(0, 8).map(reqRow).join('');
      body += '<h4>' + Li('Lessons & design notes', '经验与设计要点') + '</h4><ul style="padding-left:20px">' + r.lessons.map(function (l) { return '<li>' + L(l[0], l[1]) + '</li>'; }).join('') + '</ul>';
      body += '<div class="row" style="margin-top:14px"><button class="btn cyan" id="refLoad">' + ic('play') + Li('Load into assessment', '载入评估') + '</button></div>';
    } else {
      body += '<div class="row" style="gap:6px;margin-bottom:10px"><span class="chip cyan">' + Lp(r.loc, true) + '</span>' + (r.status ? '<span class="chip">' + Lp(r.status, true) + '</span>' : '') + (r.mw ? '<span class="chip amber">≈ ' + F(r.mw) + ' MW</span>' : '') + '</div>';
      body += '<h4>' + Li('Publicly reported facts', '公开报道信息') + '</h4><ul style="padding-left:20px">' + r.facts.map(function (x) { return '<li style="margin-bottom:6px">' + L(x[0], x[1]) + '</li>'; }).join('') + '</ul>';
      body += '<p class="small muted" style="margin-top:10px">' + Li('Figures as announced by operators / trade press; they may change. Verify before relying on them.', '数据来自运营商/行业媒体公告，可能变化，使用前请核实。') + '</p>';
      body += '<div class="row" style="margin-top:12px"><a class="btn ghost" href="' + esc(r.src) + '" target="_blank" rel="noopener">' + ic('link') + Li('Source', '来源') + '</a>' + (r.mw ? '<button class="btn cyan" id="refModel">' + ic('play') + Li('Model a similar project', '建模相似项目') + '</button>' : '') + '</div>';
    }
    $('#modalRoot').innerHTML = '<div class="modal" id="modal"><div class="modal-box"><div class="modal-head"><div><h3>' + esc(I18N.lang() === 'zh' ? r.zh : r.en) + '</h3>' + (I18N.lang() === 'bi' ? '<div class="zh">' + esc(r.zh) + '</div>' : '') + '</div><button class="xbtn" id="mClose">✕</button></div><div class="modal-body">' + body + '</div></div></div>';
    $('#mClose').onclick = closeModal; $('#modal').onclick = function (e) { if (e.target.id === 'modal') closeModal(); };
    if ($('#refLoad')) $('#refLoad').onclick = function () { closeModal(); loadInput(r.input, true); };
    if ($('#refModel')) $('#refModel').onclick = function () {
      var t = r.type, dens = { AI: [20, 85, 130] }[t] || [12, 0, 60];
      closeModal(); loadInput({ name: r.en + ' (model)', region: r.country === 'CN' ? 'CN' : (r.country === 'ID' ? 'ID' : (r.country === 'FI' ? 'NORD' : 'US')), type: t, tier: 3, sizing: 'mw', itMW: Math.min(r.mw, 1000), dens: dens[0], hdShare: dens[1], hdDens: dens[2], rackW: t === 'AI' ? 800 : 600, phases: r.mw > 100 ? 4 : 2, floors: 2 }, true);
    };
  }
  function closeModal() { $('#modalRoot').innerHTML = ''; }

  /* ========================================================== EQUIPMENT */
  function renderEquip() {
    var f = S.eq, q = f.q.toLowerCase();
    var match = function (e) { return (!q || (e.id + e.en + e.zh + e.fn.join(' ') + e.std.join(' ')).toLowerCase().indexOf(q) >= 0) && (f.sys === 'all' || e.sys === f.sys); };
    var list = '<div class="liblist">' + DB.systems.map(function (s) {
      var items = DB.equipment.filter(function (e) { return e.sys === s.id && match(e); }); if (!items.length) return '';
      return '<div class="libgrp"><i style="background:' + s.color + '"></i>' + Li(s.en, s.zh) + '</div>' + items.map(function (e) {
        return '<div class="libitem' + (e.id === f.sel ? ' on' : '') + '" data-eq="' + e.id + '"><span class="id">' + e.id + '</span><span>' + L(e.en, e.zh) + '</span></div>'; }).join('');
    }).join('') + '</div>';
    var e = DB.equipment.filter(function (x) { return x.id === f.sel; })[0] || DB.equipment[0], s = DB.systems.filter(function (x) { return x.id === e.sys; })[0];
    var n = 0;
    var detail = '<div><div class="card"><div class="row" style="align-items:flex-start;gap:14px"><div class="ficon" style="background:' + s.color + '">' + ic(SYS_IC[e.sys]) + '</div><div style="flex:1"><div class="small muted">' + e.id + ' · ' + Li(s.en, s.zh) + ' · ' + (e.cls === 'M' ? '<span class="chip coral">' + Li('Major', '主要设备') + '</span>' : '<span class="chip">' + Li('Secondary', '次要设备') + '</span>') + '</div><h3 style="font-size:1.2rem;margin-top:4px">' + L(e.en, e.zh) + '</h3></div>' +
      '<button class="btn small ghost" id="tpgCsv">' + ic('download') + 'TPG CSV</button></div>' +
      '<h4>' + Li('Function', '功能') + '</h4><div>' + Lp(e.fn) + '</div><h4>' + Li('Typical ratings', '典型规格') + '</h4><div>' + Lp(e.ty) + '</div>' +
      '<h4>' + Li('Technical requirements', '技术要求') + '</h4>' + e.s.map(function (c, i) { return '<div class="clause"><span class="no">' + (i + 1) + '</span><div>' + L(c[0], c[1]) + '</div></div>'; }).join('') +
      '<h4>' + Li('Applicable standards', '适用标准') + '</h4><div class="row" style="gap:6px">' + e.std.map(function (x) { return '<span class="chip ind">' + esc(x) + '</span>'; }).join('') + '</div>' +
      (e.t ? '<h4>' + Li('Inspection & testing', '检验与试验') + '</h4><ul style="padding-left:20px">' + e.t.map(function (x) { return '<li>' + L(x[0], x[1]) + '</li>'; }).join('') + '</ul>' : '') + '</div>' +
      '<div class="card"><h3>' + Li('Technical Particulars & Guarantees — TPG-' + e.id, '技术参数保证表——TPG-' + e.id) + '</h3><div class="small muted" style="margin-bottom:8px">' + Li('Required = Owner reference value (Tier III, tropical). Guaranteed = to be completed by the bidder.', '要求值=业主参考值（Tier III、热带）。保证值=由投标人填写。') + '</div>' +
      '<div class="tblw"><table class="t"><thead><tr><th>' + Li('No.', '序号') + '</th><th>' + Li('Description', '描述') + '</th><th>' + Li('Unit', '单位') + '</th><th>' + Li('Required', '要求值') + '</th><th>' + Li('Guaranteed', '保证值') + '</th></tr></thead><tbody>' +
      e.tpg.map(function (r) { if (r.g) return '<tr class="grp"><td colspan="5">' + Li(r.g[0], r.g[1]) + '</td></tr>'; n++; return '<tr><td>' + n + '</td><td>' + L(r[0], r[1]) + '</td><td class="nowrap">' + esc(r[2]) + '</td><td class="req-col">' + esc(r[3]) + '</td><td class="bid-col"></td></tr>'; }).join('') + '</tbody></table></div></div></div>';
    $('#view-equip').innerHTML = '<h2 class="sec">' + Li('Equipment library & TPG', '设备库与TPG') + '</h2><div class="sec-sub">' + Li(DB.equipment.length + ' items across 7 systems — the same content as the companion Word specification.', '7大系统共' + DB.equipment.length + '项——与配套Word技术规范内容一致。') + '</div>' +
      '<div class="filters"><input class="search" id="eqQ" placeholder="' + esc(Lt('Search equipment or standard (e.g. UPS, chiller, IEC 62040)…', '搜索设备或标准（如UPS、冷机、IEC 62040）…')) + '" value="' + esc(f.q) + '"><select class="fsel" id="eqSys"><option value="all">' + esc(Lt('All systems', '全部系统')) + '</option>' +
      DB.systems.map(function (x) { return '<option value="' + x.id + '"' + (f.sys === x.id ? ' selected' : '') + '>' + esc(Lt(x.en, x.zh)) + '</option>'; }).join('') + '</select></div><div class="lib">' + list + detail + '</div>';
    var cb = $('#tpgCsv'); if (cb) cb.onclick = function () {
      var k = 0; download('TPG-' + e.id + '.csv', csv([['No', 'Description', '描述', 'Unit', 'Required', 'Guaranteed', 'Remarks']].concat(e.tpg.map(function (r) { return r.g ? ['', r.g[0], r.g[1], '', '', '', ''] : [++k, r[0], r[1], r[2], r[3], '', '']; }))), 'text/csv;charset=utf-8');
    };
  }

  /* ========================================================== KNOWLEDGE */
  function kSection(id, en, zh, inner) { return '<div class="card" id="k-' + id + '"><h3 style="font-size:1.12rem">' + Li(en, zh) + '</h3>' + inner + '</div>'; }
  function chainSVG(items, colors) {
    var W = 900, bw = (W - 20) / items.length - 18, H = 120, s = '<svg class="diagram" viewBox="0 0 ' + W + ' ' + H + '"><defs><marker id="ak" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#5d6280"/></marker></defs>';
    items.forEach(function (it, i) {
      var x = 10 + i * (bw + 18);
      s += '<rect x="' + x + '" y="20" width="' + bw + '" height="62" rx="10" fill="' + colors[i % colors.length] + '"/>';
      s += '<text x="' + (x + bw / 2) + '" y="' + (I18N.lang() === 'bi' ? 46 : 55) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">' + esc(I18N.lang() === 'zh' ? it[1] : it[0]) + '</text>';
      if (I18N.lang() === 'bi') s += '<text x="' + (x + bw / 2) + '" y="64" text-anchor="middle" font-size="11" fill="#e0f7fc">' + esc(it[1]) + '</text>';
      if (it[2]) s += '<text x="' + (x + bw / 2) + '" y="104" text-anchor="middle" font-size="10.5" fill="#5d6280">' + esc(it[2]) + '</text>';
      if (i < items.length - 1) s += '<line x1="' + (x + bw + 1) + '" y1="51" x2="' + (x + bw + 16) + '" y2="51" stroke="#5d6280" stroke-width="2" marker-end="url(#ak)"/>';
    });
    return s + '</svg>';
  }
  function renderKnow() {
    var toc = [['what', 'What is a data center', '什么是数据中心'], ['types', 'Types & sizes', '类型与规模'], ['tiers', 'Tiers & redundancy', '等级与冗余'], ['spaces', 'Spaces', '功能区'], ['power', 'Power chain', '供电链'],
               ['cool', 'Cooling', '制冷'], ['life', 'Project lifecycle', '项目生命周期'], ['cx', 'Commissioning', '调试'], ['feas', 'Feasibility checklist', '可行性清单']];
    var html = '<h2 class="sec">' + Li('Knowledge base', '知识库') + '</h2><div class="sec-sub">' + Li('The essentials of data center design and delivery — see also the companion PPT and Word documents.', '数据中心设计与交付要点——另见配套PPT与Word文件。') + '</div>' +
      '<div class="row" style="gap:6px;margin-bottom:14px">' + toc.map(function (t) { return '<a class="chip ind" style="text-decoration:none" href="#k-' + t[0] + '" data-anchor="k-' + t[0] + '">' + Li(t[1], t[2]) + '</a>'; }).join('') + '</div>';
    html += kSection('what', 'What is a data center?', '什么是数据中心？', '<div class="grid g2"><div>' + L('A data center is a purpose-built facility that houses IT equipment (servers, storage, network) and provides everything needed to run it continuously: conditioned power, cooling, connectivity, physical security and 24/7 operations.', '数据中心是容纳IT设备（服务器、存储、网络）的专用设施，并提供其持续运行所需的一切：稳定电力、制冷、网络连接、物理安全及7×24运维。') +
      '<ul style="padding-left:20px;margin-top:10px">' + [['IT load (MW) is the basic unit of size; nearly every watt becomes heat.', 'IT负载（MW）是规模基本单位；几乎每一瓦都变成热量。'], ['Availability is achieved with redundancy (N+1, 2N) and maintainability.', '可用性通过冗余（N+1、2N）及可维护性实现。'], ['Data centres used ≈ 415 TWh in 2024 (≈ 1.5% of world electricity, IEA).', '2024年数据中心用电约415 TWh（约占全球1.5%，IEA）。']].map(function (x) { return '<li>' + L(x[0], x[1]) + '</li>'; }).join('') + '</ul></div><div>' +
      chainSVG([['Utility', '市电', 'MV / HV'], ['Power chain', '供电链', 'TX · UPS · GEN'], ['IT racks', 'IT机柜', 'kW → heat'], ['Cooling', '制冷', 'CRAH · chiller'], ['Atmosphere', '大气', 'tower / dry cooler']], ['#f2a93b', '#e39b1b', '#3f3cbb', '#0ea5c6', '#0b7f99']) + '</div></div>');
    html += kSection('types', 'Types of data centers and size classes', '数据中心类型与规模等级', '<div class="grid g4">' + DB.dcTypes.map(function (t) { return '<div class="card flat" style="margin:0"><h4 style="margin-top:0">' + L(t.en, t.zh) + '</h4><div class="small muted">' + Lp(t.d) + '</div><div class="row" style="margin-top:8px;gap:6px"><span class="chip ind">' + (t.mw[0] < 1 ? t.mw[0] * 1000 + ' kW' : t.mw[0] + ' MW') + ' – ' + (t.mw[1] >= 1000 ? t.mw[1] / 1000 + ' GW' : t.mw[1] + ' MW') + '</span><span class="chip cyan">' + t.dens[0] + '–' + t.dens[1] + ' kW/rack</span></div></div>'; }).join('') + '</div>' +
      '<div class="tblw" style="margin-top:14px"><table class="t"><thead><tr><th>' + Li('Size class', '规模等级') + '</th><th>' + Li('IT load', 'IT负载') + '</th><th>' + Li('Racks (5–10 kW)', '机柜（5–10 kW）') + '</th></tr></thead><tbody>' + DB.sizeClasses.map(function (s, i) { var lo = i ? DB.sizeClasses[i - 1].max : 0; return '<tr><td>' + L(s.en, s.zh) + '</td><td>' + (s.max > 1e6 ? '> ' + lo + ' MW' : lo + ' – ' + s.max + ' MW') + '</td><td>' + esc(s.racks) + '</td></tr>'; }).join('') + '</tbody></table></div>');
    html += kSection('tiers', 'Tier classification & redundancy', '等级分类与冗余', '<div class="tblw"><table class="t"><thead><tr><th>Uptime</th><th>' + Li('Redundancy', '冗余') + '</th><th>' + Li('Paths', '路径') + '</th><th>' + Li('Concurrently maintainable', '可同时维护') + '</th><th>' + Li('Fault tolerant', '容错') + '</th><th>' + Li('Availability', '可用性') + '</th><th>TIA-942</th><th>EN 50600</th><th>GB 50174</th><th>SNI 8799</th></tr></thead><tbody>' +
      DB.tiers.map(function (t) { return '<tr><td><b>' + L(t.en, t.zh) + '</b></td><td>' + t.red + '</td><td>' + esc(t.paths) + '</td><td>' + (t.cm ? '✔' : '–') + '</td><td>' + (t.ft ? '✔' : '–') + '</td><td>' + t.avail + '%<div class="small muted">' + t.down[0] + ' ' + t.down[1] + Li('/yr', '/年') + '</div></td><td>' + t.tia + '</td><td>' + t.en50600 + '</td><td>' + t.gb + '</td><td>' + t.sni + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<div class="grid g4" style="margin-top:12px">' + DB.tiers.map(function (t) { return '<div class="small"><b>' + esc(t.en.split(' — ')[0]) + '</b> — ' + Lp(t.fit, true) + '</div>'; }).join('') + '</div>');
    html += kSection('spaces', 'Functional spaces', '功能区', '<div class="kgrid">' + DB.spaces.map(function (z) { return '<div class="zone"><div class="zh-h" style="background:' + z.color + '">' + L(z.en, z.zh) + '</div><div class="small" style="padding:10px 14px 0;color:var(--muted)">' + Lp(z.d) + '</div><ul>' + z.items.map(function (i) { return '<li>' + Li(i[0], i[1]) + '</li>'; }).join('') + '</ul></div>'; }).join('') + '</div>');
    html += kSection('power', 'Critical power chain', '关键供电链', chainSVG([['Utility feeds', '市电进线', '20 / 150 kV'], ['MV switchgear', '中压开关柜', 'IEC 62271'], ['Transformers', '变压器', '2,500 kVA'], ['LV + generators', '低压+发电机', 'ATS / paralleling'], ['UPS + batteries', 'UPS+电池', '5–10 min'], ['PDU / busway', 'PDU/母线', 'A + B'], ['Rack PDU', '机架PDU', '7–43 kW']], ['#f2a93b', '#e39b1b', '#3f3cbb', '#7c3aed', '#7c3aed', '#0ea5c6', '#17153f']) +
      '<div class="grid g3" style="margin-top:12px">' + ['EL-04', 'EL-09', 'EL-10'].map(function (id) { var e = find(DB.equipment, id); return '<div class="small"><b>' + Li(e.en, e.zh) + '</b><div class="muted">' + Lp(e.ty) + '</div></div>'; }).join('') + '</div>');
    html += kSection('cool', 'Cooling: heat path, technologies and thermal envelope', '制冷：热量路径、技术及温度范围', chainSVG([['Chip / server', '芯片/服务器', 'IT power → heat'], ['Hot aisle', '热通道', '35–45 °C'], ['CRAH / CDU', '精密空调/CDU', '18/26 °C CHW'], ['Chiller', '冷水机组', 'COP 6–7'], ['Cooling tower', '冷却塔', '32/37 °C CW']], ['#f0544f', '#f0544f', '#7c3aed', '#0ea5c6', '#3f3cbb']) +
      '<div class="grid g2" style="margin-top:12px"><div><h4>' + Li('Cooling technology by rack density (kW/rack)', '按机柜密度的制冷技术（kW/柜）') + '</h4>' + C.ranges([{ label: Lt('DX CRAC', '直膨精密空调'), a: 3, b: 10, color: '#8b8fbf' }, { label: Lt('CRAH / fan wall', '精密空调/风墙'), a: 5, b: 25, color: '#3f3cbb' }, { label: Lt('In-row', '列间空调'), a: 15, b: 40, color: '#7c3aed' }, { label: Lt('Rear-door HX', '背板换热'), a: 20, b: 75, color: '#0ea5c6' }, { label: Lt('Direct-to-chip', '冷板液冷'), a: 40, b: 150, color: '#f0544f' }, { label: Lt('Immersion', '浸没式'), a: 50, b: 200, color: '#f2a93b' }], 0, 200, '') + '</div>' +
      '<div><h4>' + Li('ASHRAE inlet temperature classes (°C)', 'ASHRAE进风温度等级（°C）') + '</h4>' + C.ranges([{ label: Lt('Recommended', '推荐'), a: 18, b: 27, color: '#16a34a' }, { label: 'A1', a: 15, b: 32, color: '#0ea5c6' }, { label: 'A2', a: 10, b: 35, color: '#3f3cbb' }, { label: 'A3', a: 5, b: 40, color: '#7c3aed' }, { label: 'A4', a: 5, b: 45, color: '#8b8fbf' }, { label: Lt('H1 (high density)', 'H1（高密度）'), a: 15, b: 25, color: '#f0544f' }], 0, 50, '°') + '</div></div>');
    html += kSection('life', 'Project lifecycle', '项目全生命周期', '<div class="timeline">' + DB.lifecycle.map(function (l, i) { return '<div class="tl"><div class="k" style="background:' + ['#3f3cbb', '#7c3aed', '#0ea5c6', '#3f3cbb', '#7c3aed', '#f2a93b', '#f0544f', '#16a34a', '#0ea5c6', '#17153f'][i] + '">' + (i + 1) + '</div><b>' + L(l.en, l.zh) + '</b><div class="small muted" style="margin-top:4px">' + Lp(l.d) + '</div></div>'; }).join('') + '</div>');
    html += kSection('cx', 'Commissioning levels L1–L5', '调试等级L1–L5', '<div class="tblw"><table class="t"><thead><tr><th>' + Li('Level', '等级') + '</th><th>' + Li('Name', '名称') + '</th><th>' + Li('Description', '说明') + '</th></tr></thead><tbody>' + DB.cxLevels.map(function (c) { return '<tr><td><b>' + c[0] + '</b></td><td>' + L(c[1], c[2]) + '</td><td>' + L(c[3], c[4]) + '</td></tr>'; }).join('') + '</tbody></table></div>');
    html += kSection('feas', 'Feasibility checklist', '可行性检查清单', '<div class="grid g3">' + [['Power availability, cost & timeline', '电力可得性、成本与时间'], ['Fibre routes, carriers & latency', '光纤路由、运营商与时延'], ['Natural hazards (flood, seismic, storms)', '自然灾害（洪水、地震、风暴）'], ['Land, zoning, permits & setbacks', '土地、规划、许可及退界'], ['Water availability & cooling strategy', '水资源及制冷策略'], ['Climate: free-cooling hours, wet-bulb', '气候：自然冷却时数、湿球温度'], ['Regulation: data sovereignty, PDP law, incentives', '法规：数据主权、个人数据保护、激励'], ['Market demand, pricing & anchor tenants', '市场需求、定价及锚定租户'], ['Skilled workforce & O&M partners', '技术人员及运维伙伴'], ['CAPEX, OPEX, IRR & financing', '投资、运营成本、IRR及融资'], ['Sustainability: renewables, PUE/WUE', '可持续：可再生能源、PUE/WUE'], ['Schedule & long-lead equipment', '进度及长周期设备']].map(function (x) { return '<div class="req"><span class="tag" style="background:#3f3cbb">✓</span><div>' + L(x[0], x[1]) + '</div></div>'; }).join('') + '</div>');
    $('#view-know').innerHTML = html;
  }

  /* ========================================================== STANDARDS, GLOSSARY, ABOUT */
  var AREA = { DESIGN: ['Design', '设计'], ELEC: ['Electrical', '电气'], MECH: ['Mechanical', '暖通'], FIRE: ['Fire', '消防'], IT: ['IT & cabling', 'IT与布线'], ENERGY: ['Energy', '能效'], OPS: ['Operations', '运营'], CIVIL: ['Civil', '土建'], PERMIT: ['Permits', '许可'], POLICY: ['Policy', '政策'] };
  var REGN = { INT: ['International', '国际'], US: ['USA', '美国'], EU: ['Europe', '欧洲'], CN: ['China', '中国'], ID: ['Indonesia', '印度尼西亚'], SG: ['Singapore', '新加坡'] };
  function renderStd() {
    var f = S.std, q = f.q.toLowerCase();
    var list = DB.standards.filter(function (s) { return (f.r === 'all' || s.r === f.r) && (f.a === 'all' || s.a === f.a) && (!q || (s.c + s.en + s.zh).toLowerCase().indexOf(q) >= 0); });
    $('#view-std').innerHTML = '<h2 class="sec">' + Li('Codes & standards', '规范与标准') + '</h2><div class="sec-sub">' + Li('International, US, European, Chinese, Indonesian and Singapore references. Always use the latest editions and local statutory requirements.', '国际、美国、欧洲、中国、印尼及新加坡参考标准。请始终采用最新版本及当地法定要求。') + '</div>' +
      '<div class="filters"><input class="search" id="stdQ" placeholder="' + esc(Lt('Search code or topic…', '搜索规范或主题…')) + '" value="' + esc(f.q) + '"><select class="fsel" id="stdR"><option value="all">' + esc(Lt('All regions', '全部地区')) + '</option>' + Object.keys(REGN).map(function (k) { return '<option value="' + k + '"' + (f.r === k ? ' selected' : '') + '>' + esc(Lt(REGN[k][0], REGN[k][1])) + '</option>'; }).join('') + '</select>' +
      '<select class="fsel" id="stdA"><option value="all">' + esc(Lt('All disciplines', '全部专业')) + '</option>' + Object.keys(AREA).map(function (k) { return '<option value="' + k + '"' + (f.a === k ? ' selected' : '') + '>' + esc(Lt(AREA[k][0], AREA[k][1])) + '</option>'; }).join('') + '</select></div>' +
      '<div class="card" style="padding:0;overflow:hidden"><div class="tblw"><table class="t"><thead><tr><th>' + Li('Code / standard', '规范/标准') + '</th><th>' + Li('Region', '地区') + '</th><th>' + Li('Discipline', '专业') + '</th><th>' + Li('Scope', '范围') + '</th></tr></thead><tbody>' +
      list.map(function (s) { return '<tr><td><b>' + esc(s.c) + '</b></td><td class="nowrap">' + Li(REGN[s.r][0], REGN[s.r][1]) + '</td><td class="nowrap">' + Li(AREA[s.a][0], AREA[s.a][1]) + '</td><td>' + L(s.en, s.zh) + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
  }
  function renderGloss() {
    var q = S.gl.q.toLowerCase();
    var list = DB.glossary.filter(function (g) { return !q || g.join(' ').toLowerCase().indexOf(q) >= 0; });
    $('#view-gloss').innerHTML = '<h2 class="sec">' + Li('Bilingual glossary', '中英术语表') + '</h2><div class="sec-sub">' + Li(DB.glossary.length + ' key terms', DB.glossary.length + '个关键术语') + '</div>' +
      '<div class="filters"><input class="search" id="glQ" placeholder="' + esc(Lt('Search term…', '搜索术语…')) + '" value="' + esc(S.gl.q) + '"></div><div class="card" style="padding:0;overflow:hidden"><div class="tblw"><table class="t"><thead><tr><th>' + Li('Term', '术语') + '</th><th>中文</th><th>' + Li('Definition', '定义') + '</th></tr></thead><tbody>' +
      list.map(function (g) { return '<tr><td><b>' + esc(g[0]) + '</b></td><td class="zh">' + esc(g[1]) + '</td><td>' + L(g[2], g[3]) + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
  }
  function renderAbout() {
    $('#view-about').innerHTML = '<h2 class="sec">' + Li('About this tool', '关于本工具') + '</h2><div class="sec-sub">' + Li('Purpose, method, assumptions and limitations.', '目的、方法、假设与局限。') + '</div>' +
      '<div class="grid g2"><div class="card"><h3>' + Li('Purpose', '目的') + '</h3><p>' + L('Data Center Project Assessment helps owners, developers and engineers understand — at the planning and feasibility stage — what a data center of a given size, density, resilience and location requires: systems, equipment, space, utilities, cost, schedule, operations and risks.', '数据中心项目评估工具帮助业主、开发商及工程师在规划与可研阶段了解特定规模、密度、韧性及地点的数据中心所需的一切：系统、设备、空间、公用设施、投资、进度、运营及风险。') + '</p>' +
      '<h4>' + Li('Method (planning level)', '方法（规划深度）') + '</h4><ul style="padding-left:20px">' + [
        ['IT load from MW or racks × density (standard + high-density share).', 'IT负载=MW或机柜数×密度（标准+高密度占比）。'],
        ['PUE = 1 + cooling + electrical losses + lighting/other; cooling coefficient by technology and climate; liquid heat share for DLC/immersion.', 'PUE=1+制冷+电气损耗+照明/其他；制冷系数按技术及气候；冷板/浸没按液冷热量比例。'],
        ['Maximum demand from design-day PUE + battery recharge; transformers, generators (continuous rating, 0.27 L/kWh), UPS and batteries sized with Tier redundancy.', '最大需量=设计日PUE+电池充电；按等级冗余选择变压器、发电机（持续功率，0.27 L/kWh）、UPS及电池。'],
        ['Chillers, towers, terminals, CDUs and thermal storage from heat loads; water from WUE coefficients.', '冷机、冷却塔、末端、CDU及蓄冷按热负荷计算；用水按WUE系数。'],
        ['Space ≈ 2.6 m² per 600 mm rack (+0.8 m² liquid) plus electrical, mechanical and support ratios; site from footprint, yards, substation and coverage ratio.', '空间≈每600 mm机柜2.6 m²（液冷+0.8 m²）加电气、暖通、支持区比例；用地按占地、设备场地、变电站及建筑密度。'],
        ['CAPEX = regional USD/MW benchmark × Tier × scale × cooling factors + utility, land, contingency; OPEX from energy, maintenance, staff, insurance, water.', '投资=地区单位基准×等级×规模×制冷系数+电网、土地、不可预见费；运营成本含电费、维护、人员、保险、水。'],
        ['20-year phased cash flow with occupancy ramp, tax, depreciation and optional exit value → IRR, NPV, payback, levelised cost.', '20年分期现金流（含上架爬坡、税、折旧及可选终值）→IRR、NPV、回收期、平准化成本。']
      ].map(function (x) { return '<li style="margin-bottom:4px">' + L(x[0], x[1]) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="card"><h3>' + Li('Limitations', '局限') + '</h3><p>' + L('Results are indicative (±25–30%) and intended for early decision-making. Final design must follow site surveys, utility studies, local codes, the Authority Having Jurisdiction and certified designers. Regional cost, tariff and price benchmarks are editable planning assumptions — calibrate with a quantity surveyor and market data.', '结果为参考值（±25–30%），用于早期决策。最终设计须依据场地勘察、电网研究、当地规范、主管部门要求及具资质的设计单位。地区投资、电价及租价基准为可编辑的规划假设——请由造价顾问及市场数据校准。') + '</p>' +
      '<h4>' + Li('Key sources', '主要来源') + '</h4><ul style="padding-left:20px" class="small">' + [
        ['Uptime Institute Tier Standard: Topology; Global Data Center Survey 2025', 'https://uptimeinstitute.com/'], ['ANSI/TIA-942-C (2024)', 'https://tiaonline.org/'], ['ASHRAE TC 9.9 Thermal Guidelines', 'https://www.ashrae.org/'],
        ['Turner & Townsend Data Centre Construction Cost Index 2025', 'https://www.turnerandtownsend.com/'], ['IEA — Energy and AI (2025)', 'https://www.iea.org/'], ['GB 40879-2021 / GB 50174-2017', 'https://openstd.samr.gov.cn/'], ['SNI 8799 — BSN', 'https://bsn.go.id/']
      ].map(function (x) { return '<li><a href="' + x[1] + '" target="_blank" rel="noopener">' + esc(x[0]) + '</a></li>'; }).join('') + '</ul>' +
      '<h4>' + Li('Data & privacy', '数据与隐私') + '</h4><p class="small">' + L('Everything runs in your browser. Saved assessments are stored only in this browser (localStorage); export JSON to keep or share them.', '所有计算均在浏览器中运行。保存的评估仅存储于本浏览器（localStorage）；可导出JSON以保存或分享。') + '</p>' +
      '<h4>' + Li('Version', '版本') + '</h4><p class="small">v1.0 · 2026-10 · <a href="https://github.com/Alexandervsq/Data-Center-Project-Assessment" target="_blank" rel="noopener">github.com/Alexandervsq/Data-Center-Project-Assessment</a></p></div></div>';
  }

  /* ========================================================== wiring */
  function renderAll() {
    renderHeader(); renderHome(); renderAssessShell(); runReport(); renderRefs(); renderEquip(); renderKnow(); renderStd(); renderGloss(); renderAbout();
    show(S.view);
  }
  document.addEventListener('click', function (ev) {
    var l = ev.target.closest('.lang'); if (l) { I18N.set(l.dataset.lang); renderAll(); return; }
    var t = ev.target.closest('.tab'); if (t) { show(t.dataset.view); return; }
    var go = ev.target.closest('[data-go]'); if (go) { show(go.dataset.go); return; }
    var anc = ev.target.closest('[data-anchor]'); if (anc) { ev.preventDefault(); var el = document.getElementById(anc.dataset.anchor); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 140, behavior: 'smooth' }); return; }
    var li = ev.target.closest('[data-eq]'); if (li) { S.eq.sel = li.dataset.eq; renderEquip(); window.scrollTo({ top: 0 }); return; }
    if (S.view === 'refs') { var rc = ev.target.closest('[data-act="ref"]'); if (rc) { openRef(rc.dataset.id); return; } }
    if (ev.target.id === 'menuBtn') $('#tabs').classList.toggle('open');
  });
  document.addEventListener('input', function (ev) {
    var id = ev.target.id;
    if (id === 'refQ') { S.ref.q = ev.target.value; renderRefs(); var i1 = $('#refQ'); i1.focus(); i1.setSelectionRange(i1.value.length, i1.value.length); }
    if (id === 'eqQ') { S.eq.q = ev.target.value; renderEquip(); var i2 = $('#eqQ'); i2.focus(); i2.setSelectionRange(i2.value.length, i2.value.length); }
    if (id === 'stdQ') { S.std.q = ev.target.value; renderStd(); var i3 = $('#stdQ'); i3.focus(); i3.setSelectionRange(i3.value.length, i3.value.length); }
    if (id === 'glQ') { S.gl.q = ev.target.value; renderGloss(); var i4 = $('#glQ'); i4.focus(); i4.setSelectionRange(i4.value.length, i4.value.length); }
  });
  document.addEventListener('change', function (ev) {
    var id = ev.target.id;
    if (id === 'refKind') { S.ref.kind = ev.target.value; renderRefs(); }
    if (id === 'refType') { S.ref.type = ev.target.value; renderRefs(); }
    if (id === 'eqSys') { S.eq.sys = ev.target.value; renderEquip(); }
    if (id === 'stdR') { S.std.r = ev.target.value; renderStd(); }
    if (id === 'stdA') { S.std.a = ev.target.value; renderStd(); }
  });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closeModal(); });
  window.addEventListener('hashchange', function () { var h = location.hash.replace('#', ''); if (h && document.getElementById('view-' + h)) show(h); });

  var h0 = location.hash.replace('#', '');
  if (h0 && document.getElementById('view-' + h0)) S.view = h0;
  renderAll();
})();
