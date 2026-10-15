/* Data Center Project Assessment — application v2
 * Indonesia-focused, multi-project workspace, auto-proposed parameters with manual override,
 * proposal report export (DOCX / XLSX / PDF). */
(function () {
  'use strict';
  var DB = window.DCDB, E = window.DCEngine, P = window.DCPropose, F = E.fmt, C = window.Charts, RP = window.DCReport;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------ icons (lucide paths) */
  var IP = {
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>', gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>', info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>', snow: '<path d="M2 12h20M12 2v20m-8-6 4-4-4-4m16 8-4-4 4-4M8 4l4 4 4-4M8 20l4-4 4 4"/>',
    server: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01M6 18h.01"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>', download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>', print: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>', link: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    play: '<path d="m5 3 14 9-14 9z"/>', plus: '<path d="M12 5v14M5 12h14"/>', copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    trash: '<path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2"/>', folder: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>', grid: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
    map: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'
  };
  function ic(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (IP[n] || '') + '</svg>'; }
  var SYS_IC = { EL: 'bolt', ME: 'snow', IT: 'server', FP: 'flame', SC: 'shield', MC: 'monitor', CS: 'building' };
  function find(arr, id) { return E.find(arr, id) || {}; }
  function lv(v) { return { low: Lt('Low', '低'), med: Lt('Medium', '中'), high: Lt('High', '高') }[v] || v; }

  /* ------------------------------------------------------------ project database */
  var LS_DB = 'dcpa_db';
  var S = { view: 'home', rtab: 'sum', x: null, cur: 'USD', cny: 7.1, showAll: false, eqTab: 'eq',
            ref: { q: '', kind: 'all', type: 'all' }, eq: { sel: 'EL-01', q: '', sys: 'all' }, std: { r: 'all', a: 'all', q: '' }, gl: { q: '' } };
  function uid() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function newInput(base) { var i = Object.assign(E.defaults(), base || {}); i.ov = Object.assign({}, (base && base.ov) || {}); return i; }
  function loadDB() {
    var db = null;
    try { db = JSON.parse(localStorage.getItem(LS_DB)); } catch (e) { }
    if (!db || !db.projects || !db.projects.length) {
      db = { active: null, projects: [] };
      var first = { id: uid(), name: 'Colocation 10 MW — Cikarang', created: Date.now(), updated: Date.now(), input: newInput({ name: 'Colocation 10 MW — Cikarang', loc: 'JB-BKS', type: 'COLO', itMW: 10 }) };
      db.projects.push(first); db.active = first.id;
    }
    if (!find(db.projects, db.active).id) db.active = db.projects[0].id;
    return db;
  }
  var DBS = loadDB();
  try { var cu = JSON.parse(localStorage.getItem('dcpa_cur2')); if (cu) { S.cur = cu.cur || 'USD'; S.cny = cu.cny || 7.1; } } catch (e) { }
  function saveDB() { try { localStorage.setItem(LS_DB, JSON.stringify(DBS)); localStorage.setItem('dcpa_cur2', JSON.stringify({ cur: S.cur, cny: S.cny })); } catch (e) { toast(Lt('Browser storage unavailable — export your projects.', '浏览器存储不可用——请导出项目。')); } }
  function active() { return find(DBS.projects, DBS.active); }
  function inp() { return active().input; }

  function toast(msg) { var t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2400); }
  function fxNow() { return S.cur === 'IDR' ? (S.x ? S.x.p.fx : DB.idFx) : (S.cur === 'CNY' ? S.cny : 1); }
  function money(usd, dec) {
    var v = usd * fxNow(), a = Math.abs(v), sfx = '';
    if (a >= 1e12) { v /= 1e12; sfx = ' T'; } else if (a >= 1e9) { v /= 1e9; sfx = ' B'; } else if (a >= 1e6) { v /= 1e6; sfx = ' M'; } else if (a >= 1e4) { v /= 1e3; sfx = ' k'; }
    return S.cur + ' ' + F(v, dec === undefined ? (sfx ? 1 : 0) : dec) + sfx;
  }
  function pct(v, d) { return v === null || v === undefined ? '–' : F(v * 100, d === undefined ? 1 : d) + '%'; }
  function download(name, text, type) { var blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' }); var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400); }
  function csv(rows) { return '﻿' + rows.map(function (r) { return r.map(function (c) { c = String(c === undefined || c === null ? '' : c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(','); }).join('\r\n'); }
  function safeName(s) { return String(s || 'project').replace(/[^\w\-]+/g, '_').slice(0, 60); }

  /* ------------------------------------------------------------ header & routing */
  var TABS = [['home', 'home', 'Overview', '概览'], ['assess', 'gauge', 'Project Assessment', '项目评估'], ['refs', 'building', 'Reference Projects', '参考项目'],
              ['equip', 'cpu', 'Equipment & Racks', '设备与机柜'], ['know', 'book', 'Knowledge Base', '知识库'], ['std', 'scale', 'Standards & Regulations', '标准与法规'],
              ['gloss', 'list', 'Glossary', '术语表'], ['about', 'info', 'About', '关于']];
  function renderHeader() {
    $('#brandTitle').innerHTML = L('Data Center Project Assessment', '数据中心项目评估');
    $('#brandSub').innerHTML = L('Indonesia · Planning · Feasibility · Proposal report', '印度尼西亚·规划·可行性·建议书');
    $('#langs').innerHTML = I18N.switcher();
    $('#tabs').innerHTML = TABS.map(function (t) { return '<button class="tab' + (S.view === t[0] ? ' on' : '') + '" data-view="' + t[0] + '">' + ic(t[1]) + '<span>' + L(t[2], t[3]) + '</span></button>'; }).join('');
    document.documentElement.lang = I18N.lang() === 'zh' ? 'zh-CN' : 'en';
    $('#footer').innerHTML = L('Planning-stage indications (±25–30%) — verify with site studies, PLN and qualified consultants.', '规划阶段参考（±25–30%）——须经场地研究、PLN及专业顾问核实。') + ' · <a href="https://github.com/Alexandervsq/Data-Center-Project-Assessment" target="_blank" rel="noopener">GitHub</a>';
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
      ['gauge', '#3f3cbb', 'Assess a project', '评估项目', 'Enter location, type and IT load — every other parameter is proposed from references and standards, and you can override any of them.', '输入地点、类型及IT负载——其余参数均依据参考与标准自动提出，并可随时修改。', 'assess'],
      ['building', '#0ea5c6', 'Benchmark', '对标', nArch + ' Indonesian benchmark designs and ' + nReal + ' real projects in Indonesia and worldwide.', nArch + '个印尼基准设计及' + nReal + '个印尼与全球真实项目。', 'refs'],
      ['cpu', '#f0544f', 'Racks & equipment', '机柜与设备', DB.platforms.length + ' IT rack platforms (e.g. NVIDIA GB300 NVL72), ' + DB.cabinets.length + ' cabinet ranges, ' + nEq + ' equipment specs with ' + nTpg + ' TPG parameters.', DB.platforms.length + '种IT机柜平台（如NVIDIA GB300 NVL72）、' + DB.cabinets.length + '类机柜、' + nEq + '项设备规范及' + nTpg + '项TPG参数。', 'equip'],
      ['file', '#16a34a', 'Proposal report', '项目建议书', 'Export a complete project proposal as Word, Excel or PDF for each project in your workspace.', '为工作区内每个项目导出完整的项目建议书（Word、Excel或PDF）。', 'assess']
    ];
    var projs = DBS.projects.slice().sort(function (a, b) { return b.updated - a.updated; }).slice(0, 6);
    var html = '<div class="hero">' + heroArt() + '<h1>' + L('Plan a data center in Indonesia with confidence', '科学规划印尼数据中心项目') + '</h1>' +
      '<p>' + L('An interactive planning & feasibility assessment for data center owners and developers. Choose the province and location, the facility type and the IT load — the tool proposes the IT platforms, resilience, power, energy storage, cooling, building, cost, schedule and risks, and produces a proposal report.', '面向数据中心业主与开发商的交互式规划与可行性评估工具。选择省份与地点、设施类型及IT负载——工具即提出IT平台、韧性、供电、储能、制冷、建筑、投资、进度与风险，并生成项目建议书。') + '</p>' +
      '<div class="kpis">' + [[DB.idProvinces.length, 'provinces', '个省份'], [DB.idLocs.length, 'DC locations', '个选址地点'], [DB.platforms.length, 'IT platforms', '种IT平台'], [DB.references.length, 'reference projects', '个参考项目'], [DB.standards.length, 'codes & regulations', '项规范法规']].map(function (k) {
        return '<div class="kpi"><b>' + k[0] + '</b><span>' + L(k[1], k[2]) + '</span></div>'; }).join('') + '</div>' +
      '<div class="row"><button class="btn cyan" data-go="assess">' + ic('play') + L('Open project assessment', '打开项目评估') + '</button><button class="btn ghost" data-act="newproj">' + ic('plus') + L('New project', '新建项目') + '</button></div></div>';
    html += '<div class="grid g4">' + feats.map(function (f) { return '<div class="card feature" style="cursor:pointer" data-go="' + f[6] + '"><div class="ficon" style="background:' + f[1] + '">' + ic(f[0]) + '</div><div><h3>' + L(f[2], f[3]) + '</h3><div class="small muted">' + L(f[4], f[5]) + '</div></div></div>'; }).join('') + '</div>';
    html += '<div class="grid g2"><div class="card"><h3>' + L('How it works', '工作流程') + '</h3><div class="steps">' + [
      ['Create a project (or several) — each is saved in your browser workspace.', '新建一个或多个项目——均保存在浏览器工作区。'],
      ['Enter the essentials: province & location, facility type, design IT load and (optionally) your PLN tariff.', '输入关键信息：省份与地点、设施类型、设计IT负载及（可选）PLN电价。'],
      ['Review the proposals: rack platform & density, Tier, fuel/UPS autonomy, BESS, cooling (with decision matrix), PUE and commercial assumptions — each with its reasoning.', '审阅建议值：机柜平台与功率、等级、燃油/UPS后备、储能、制冷（含决策矩阵）、PUE及商业假设——均附依据。'],
      ['Override anything you know better; reset to the proposal at any time.', '可修改任何参数；随时恢复建议值。'],
      ['Export the proposal report (Word / Excel / PDF).', '导出项目建议书（Word/Excel/PDF）。']
    ].map(function (s) { return '<div class="step"><div>' + L(s[0], s[1]) + '</div></div>'; }).join('') + '</div></div>' +
      '<div class="card"><div class="row"><h3 style="margin:0">' + L('Your projects', '我的项目') + '</h3><span class="spacer"></span><button class="btn small ghost" data-act="newproj">' + ic('plus') + L('New', '新建') + '</button></div><div class="tblw" style="margin-top:10px"><table class="t"><thead><tr><th>' + L('Project', '项目') + '</th><th>' + L('Location', '地点') + '</th><th class="r">MW</th><th>' + L('Updated', '更新') + '</th></tr></thead><tbody>' +
      projs.map(function (pr) { var l = E.loc(pr.input.loc); return '<tr style="cursor:pointer" data-open="' + pr.id + '"><td><b>' + esc(pr.name) + '</b></td><td>' + L(l.en, l.zh) + '</td><td class="r">' + F(pr.input.sizing === 'racks' ? 0 : pr.input.itMW, 1) + '</td><td class="small muted">' + new Date(pr.updated).toLocaleDateString() + '</td></tr>'; }).join('') + '</tbody></table></div></div></div>';
    $('#view-home').innerHTML = html;
  }
  function heroArt() {
    var s = '<svg class="hero-art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">';
    for (var i = 0; i < 6; i++) { var x = 70 + i * 56; s += '<rect x="' + x + '" y="40" width="46" height="220" rx="4" fill="rgba(255,255,255,.06)" stroke="rgba(159,230,246,.35)"/>';
      for (var u = 0; u < 12; u++) { var y = 50 + u * 17.5, c = ((i * 7 + u * 3) % 11 === 0) ? '#f0544f' : (((i + u) % 5 === 0) ? '#f2a93b' : '#22d3ee'); s += '<rect x="' + (x + 5) + '" y="' + y + '" width="36" height="13" rx="2" fill="rgba(13,11,43,.55)"/><circle cx="' + (x + 35) + '" cy="' + (y + 6.5) + '" r="2.2" fill="' + c + '"/>'; } }
    return s + '</svg>';
  }

  /* ============================================================ ASSESSMENT — form */
  var SEV = [['low', 'Low', '低'], ['med', 'Medium', '中'], ['high', 'High', '高']];
  function platOpts(filter) { return function () { return DB.platforms.filter(filter || function () { return true; }).map(function (p) { return [p.id, p.en + ' — ' + p.kw + ' kW', p.zh + '——' + p.kw + ' kW']; }); }; }
  function cabOf(p) { return find(DB.cabinets, p.cabinet); }
  var STEPS = [
    { n: 1, en: 'Project & site', zh: '项目与场地', open: true, f: [
      { k: 'name', t: 'text', en: 'Project name', zh: '项目名称', full: 1 },
      { k: 'prov', t: 'select', en: 'Province', zh: '省份', full: 1, opts: function () { return DB.idProvinces.map(function (p) { var isl = p.island && p.island !== p.en; return [p.id, p.en + (isl ? ' (' + p.island + ')' : ''), p.zh + (isl ? '（' + p.island + '）' : '')]; }); }, virtual: true },
      { k: 'loc', t: 'select', en: 'Location / DC hub', zh: '地点/数据中心枢纽', full: 1, opts: function (p) { var L0 = E.loc(p.loc); var pr = find(DB.idProvinces, L0.prov); return pr.locs.map(function (l) { return [l.id, l.en + (l.hub === 'major' ? ' ★' : ''), l.zh + (l.hub === 'major' ? ' ★' : '')]; }); } },
      { k: 'climate', t: 'info', full: 1 },
      { k: 'type', t: 'select', en: 'Data center type / business model', zh: '数据中心类型/商业模式', full: 1, opts: function () { return DB.dcTypes.map(function (t) { return [t.id, t.en, t.zh]; }); } },
      { k: 'crit', t: 'select', en: 'Workload criticality', zh: '业务关键程度', full: 1, opts: function () { return Object.keys(P.CRIT).map(function (k) { return [k, P.CRIT[k][0], P.CRIT[k][1]]; }); } },
      { k: 'siteArea', t: 'num', en: 'Available site area (m²)', zh: '可用场地面积（m²）', step: 500, hint: ['0 = not yet defined', '0=尚未确定'] },
      { k: 'gridMVA', t: 'num', en: 'PLN capacity offered (MVA)', zh: 'PLN可供容量（MVA）', step: 1, hint: ['0 = unknown', '0=未知'] },
      { k: 'floors', t: 'num', en: 'Building storeys', zh: '建筑层数', step: 1 },
      { k: 'kdb', t: 'num', en: 'Max. site coverage KDB (%)', zh: '最大建筑密度KDB（%）', step: 5 },
      { k: 'seismic', t: 'seg', en: 'Seismic hazard', zh: '地震风险', opts: SEV },
      { k: 'flood', t: 'seg', en: 'Flood exposure', zh: '洪水风险', opts: SEV },
      { k: 'waterScarce', t: 'chk', en: 'Water-constrained site', zh: '水资源受限场地', full: 1 }
    ] },
    { n: 2, en: 'Capacity & racks', zh: '容量与机柜', open: true, f: [
      { k: 'sizing', t: 'seg', en: 'Size the project by', zh: '规模确定方式', full: 1, opts: [['mw', 'IT load (MW)', 'IT负载（MW）'], ['racks', 'Rack count', '机柜数量']] },
      { k: 'itMW', t: 'num', en: 'Design IT load (MW)', zh: '设计IT负载（MW）', step: 0.1, show: function (p) { return p.sizing !== 'racks'; } },
      { k: 'racks', t: 'num', en: 'Number of racks', zh: '机柜数量', step: 10, show: function (p) { return p.sizing === 'racks'; } },
      { k: 'stdPlat', t: 'select', en: 'Standard rack platform', zh: '标准机柜平台', full: 1, opts: platOpts(function (p) { return p.cat !== 'AI' || p.kw < 30; }) },
      { k: 'dens', t: 'num', en: 'Standard rack density (kW/rack)', zh: '标准机柜功率（kW/柜）', step: 0.5 },
      { k: 'hdShare', t: 'num', en: 'High-density / AI racks (% of racks)', zh: '高密度/AI机柜占比（%）', step: 5 },
      { k: 'hdPlat', t: 'select', en: 'High-density rack platform', zh: '高密度机柜平台', full: 1, opts: platOpts(), show: function (p) { return +p.hdShare > 0; } },
      { k: 'hdDens', t: 'num', en: 'High-density rack (kW/rack)', zh: '高密度机柜功率（kW/柜）', step: 5, show: function (p) { return +p.hdShare > 0; } },
      { k: 'cabinet', t: 'select', en: 'Cabinet brand / range (standard racks)', zh: '机柜品牌/系列（标准机柜）', full: 1, opts: function () { return DB.cabinets.map(function (c) { return [c.id, c.en, c.zh]; }); } },
      { k: 'rackW', t: 'select', en: 'Rack width (mm)', zh: '机柜宽度（mm）', opts: function (p) { return (cabOf(p).w || [600, 800]).map(function (v) { return [v, v + ' mm']; }); } },
      { k: 'rackD', t: 'select', en: 'Rack depth (mm)', zh: '机柜深度（mm）', opts: function (p) { return (cabOf(p).d || [1200]).map(function (v) { return [v, v + ' mm']; }); } },
      { k: 'rackU', t: 'select', en: 'Rack height (U)', zh: '机柜高度（U）', opts: function (p) { return (cabOf(p).u || [42, 48]).map(function (v) { return [v, v + 'U']; }); } },
      { k: 'phases', t: 'num', en: 'Construction phases', zh: '建设分期数', step: 1 },
      { k: 'phaseInterval', t: 'num', en: 'Years between phases', zh: '分期间隔（年）', step: 1, show: function (p) { return +p.phases > 1; } },
      { k: 'raised', t: 'seg', en: 'White-space floor', zh: '白区地面', full: 1, opts: [['YES', 'Raised floor', '架空地板'], ['NO', 'Slab + overhead', '无地板上走线']] }
    ] },
    { n: 3, en: 'Resilience, power & storage', zh: '韧性、供电与储能', f: [
      { k: 'tier', t: 'tier', full: 1 },
      { k: 'fuelH', t: 'select', en: 'Generator fuel autonomy', zh: '发电机燃油自持', opts: function () { return [8, 12, 24, 48, 72, 96].map(function (h) { return [h, h + ' h']; }); } },
      { k: 'upsMin', t: 'select', en: 'UPS battery autonomy', zh: 'UPS电池后备', opts: function () { return [5, 7, 10, 15].map(function (m) { return [m, m + ' min']; }); } },
      { k: 'battery', t: 'seg', en: 'Battery technology', zh: '电池技术', full: 1, opts: [['LI', 'Li-ion (LFP)', '锂电（磷酸铁锂）'], ['VRLA', 'VRLA lead-acid', '阀控铅酸']] },
      { k: 'eco', t: 'chk', en: 'UPS eco-mode / energy saver', zh: 'UPS节能模式', full: 1 },
      { k: 'bessOn', t: 'chk', en: 'Battery Energy Storage System (BESS)', zh: '电池储能系统（BESS）', full: 1 },
      { k: 'bessMW', t: 'num', en: 'BESS power (MW)', zh: '储能功率（MW）', step: 0.5, show: function (p) { return !!p.bessOn; } },
      { k: 'bessH', t: 'select', en: 'BESS duration', zh: '储能时长', opts: function () { return [0.5, 1, 2, 4].map(function (h) { return [h, h + ' h']; }); }, show: function (p) { return !!p.bessOn; } }
    ] },
    { n: 4, en: 'Cooling & sustainability', zh: '制冷与可持续', f: [
      { k: 'cooling', t: 'select', en: 'Cooling technology', zh: '制冷技术', full: 1, opts: function () { return DB.cooling.map(function (c) { return [c.id, c.en, c.zh]; }); } },
      { k: 'targetPUE', t: 'num', en: 'Target annual PUE', zh: '目标年均PUE', step: 0.01 },
      { k: 'renewable', t: 'num', en: 'Renewable energy share (%)', zh: '可再生能源占比（%）', step: 5 }
    ] },
    { n: 5, en: 'Commercial & financial', zh: '商业与财务', f: [
      { k: 'tariffIDR', t: 'num', en: 'PLN electricity tariff (Rp/kWh) — owner input', zh: 'PLN电价（印尼盾/kWh）——业主输入', step: 1, full: 1 },
      { k: 'fx', t: 'num', en: 'Exchange rate (Rp per USD)', zh: '汇率（印尼盾/美元）', step: 10, hint: ['BI JISDOR ≈ 17,917 (6 Oct 2026)', 'BI JISDOR约17,917（2026-10-06）'] },
      { k: 'startYear', t: 'num', en: 'Project start year', zh: '项目启动年份', step: 1 },
      { k: 'revModel', t: 'seg', en: 'Business case', zh: '商业模式', full: 1, opts: [['lease', 'Lease / colocation', '租赁/托管'], ['none', 'Owner-occupied (TCO)', '自用（TCO）']] },
      { k: 'price', t: 'num', en: 'Lease price (USD/kW/month, excl. power)', zh: '租赁价格（美元/kW·月，不含电）', step: 5 },
      { k: 'targetOcc', t: 'num', en: 'Stabilised utilisation (%)', zh: '稳定期利用率（%）', step: 5 },
      { k: 'rampYears', t: 'num', en: 'Years to stabilise', zh: '达到稳定年数', step: 1 },
      { k: 'landPrice', t: 'num', en: 'Land price (USD/m²)', zh: '土地价格（美元/m²）', step: 10 },
      { k: 'waterPrice', t: 'num', en: 'Water price (USD/m³)', zh: '水价（美元/m³）', step: 0.1 },
      { k: 'capexOverride', t: 'num', en: 'CAPEX benchmark override (USD M/MW)', zh: '单位投资覆盖（百万美元/MW）', step: 0.1, hint: ['0 = regional benchmark', '0=地区基准'] },
      { k: 'contingency', t: 'num', en: 'Contingency (%)', zh: '不可预见费（%）', step: 1 },
      { k: 'staffCost', t: 'num', en: 'Staff cost (USD/FTE/yr)', zh: '人员成本（美元/人·年）', step: 500 },
      { k: 'wacc', t: 'num', en: 'Discount rate / WACC (%)', zh: '折现率/WACC（%）', step: 0.5 },
      { k: 'tax', t: 'num', en: 'Corporate tax (%)', zh: '企业所得税（%）', step: 1 },
      { k: 'life', t: 'num', en: 'Analysis period (years)', zh: '分析期（年）', step: 1 },
      { k: 'exitMult', t: 'num', en: 'Exit value (× EBITDA)', zh: '终值（×EBITDA）', step: 0.5 },
      { k: 'markup', t: 'num', en: 'Power resale markup (%)', zh: '电费转售加价（%）', step: 1 },
      { k: 'prefab', t: 'chk', en: 'Prefabricated / modular construction', zh: '预制/模块化建造', full: 1 },
      { k: 'includeIT', t: 'chk', en: 'Include IT hardware in CAPEX', zh: '投资中包含IT硬件', full: 1 },
      { k: 'itCostKW', t: 'num', en: 'IT hardware (USD/kW IT)', zh: 'IT硬件（美元/kW IT）', step: 500, show: function (p) { return !!p.includeIT; } }
    ] }
  ];
  var AUTO = {}; P.AUTO.forEach(function (k) { AUTO[k] = 1; });
  var OWNER_FIELDS = { name: 1, loc: 1, prov: 1, type: 1, sizing: 1, itMW: 1, racks: 1, siteArea: 1, gridMVA: 1, fx: 1, startYear: 1 };
  var RERENDER = ['prov', 'loc', 'type', 'sizing', 'hdShare', 'phases', 'revModel', 'includeIT', 'tier', 'bessOn', 'cabinet', 'stdPlat', 'hdPlat', 'battery', 'crit'];

  function badge(k) {
    if (!AUTO[k]) return '';
    var x = S.x, ovd = inp().ov && inp().ov[k];
    var tip = x && x.why[k] ? Lt(x.why[k][0], x.why[k][1]) : '';
    if (ovd) return '<span class="badge man" title="' + esc(tip) + '">' + L('MANUAL', '手动') + '</span><button type="button" class="rst" data-reset="' + k + '" title="' + esc(Lt('Reset to proposed value', '恢复建议值')) + '">↺</button>';
    return '<span class="badge auto" title="' + esc(tip) + '">' + L('AUTO', '自动') + '</span>';
  }
  function whyLine(k) { var x = S.x; if (!AUTO[k] || !x || !x.why[k]) return ''; var t = Lt(x.why[k][0], x.why[k][1]); return '<div class="why" title="' + esc(t) + '">' + esc(t) + '</div>'; }
  function fieldHTML(f, p) {
    var hid = f.show && !f.show(p) ? ' hidden' : '';
    var lab = f.en ? '<label for="in-' + f.k + '"><span>' + L(f.en, f.zh) + '</span>' + badge(f.k) + '</label>' : '';
    var hint = f.hint ? '<div class="hint">' + L(f.hint[0], f.hint[1]) + '</div>' : '';
    var v = f.k === 'prov' ? E.loc(p.loc).prov : p[f.k], html = '';
    if (f.t === 'text') html = '<input type="text" id="in-' + f.k + '" data-k="' + f.k + '" value="' + esc(v) + '">';
    else if (f.t === 'num') html = '<input type="number" id="in-' + f.k + '" data-k="' + f.k + '" value="' + esc(v === undefined ? '' : v) + '" step="' + (f.step || 1) + '">';
    else if (f.t === 'select') html = '<select id="in-' + f.k + '" data-k="' + f.k + '">' + f.opts(p).map(function (o) { return '<option value="' + o[0] + '"' + (String(o[0]) === String(v) ? ' selected' : '') + '>' + esc(o[2] ? Lt(o[1], o[2]) : o[1]) + '</option>'; }).join('') + '</select>';
    else if (f.t === 'seg') html = '<div class="seg" data-k="' + f.k + '">' + f.opts.map(function (o) { return '<button type="button" data-v="' + o[0] + '" class="' + (String(o[0]) === String(v) ? 'on' : '') + '">' + (o[2] ? L(o[1], o[2]) : esc(o[1])) + '</button>'; }).join('') + '</div>';
    else if (f.t === 'chk') return '<div class="f full' + hid + '"><label class="chk"><input type="checkbox" data-k="' + f.k + '"' + (v ? ' checked' : '') + '> <span>' + L(f.en, f.zh) + '</span>' + badge(f.k) + '</label>' + whyLine(f.k) + '</div>';
    else if (f.t === 'tier') return '<div class="f full"><label><span>' + L('Resilience target (Uptime Tier)', '韧性目标（Uptime等级）') + '</span>' + badge('tier') + '</label><div class="tiers">' + DB.tiers.map(function (t) {
        return '<button type="button" class="tierbtn' + (+p.tier === t.n ? ' on' : '') + '" data-tier="' + t.n + '"><b>' + ['I', 'II', 'III', 'IV'][t.n - 1] + '</b><span>' + t.red + ' · ' + t.avail + '%</span></button>'; }).join('') + '</div>' + whyLine('tier') + '</div>';
    else if (f.t === 'info') {
      var Lc = E.loc(p.loc), gr = DB.idGrids[Lc.grid], cl = DB.idClimates[Lc.cls];
      return '<div class="f full"><div class="locinfo"><div class="row" style="gap:6px"><span class="chip cyan">' + ic('map') + L(Lc.provEn, Lc.provZh) + '</span><span class="chip">' + Lc.db + ' °C DB · ' + Lc.wb + ' °C WB · ' + F(Lc.elev) + ' m</span><span class="chip ind">' + L({ major: 'Major DC hub', emerging: 'Emerging hub', none: 'No DC hub' }[Lc.hub], { major: '主要数据中心枢纽', emerging: '新兴枢纽', none: '无数据中心枢纽' }[Lc.hub]) + '</span></div>' +
        '<div class="small" style="margin-top:6px"><b>' + L('Climate', '气候') + ':</b> ' + L(cl.en, cl.zh) + '<br><b>' + L('Grid', '电网') + ':</b> ' + L(gr.en, gr.zh) + (Lc.note ? '<br>' + Lp(Lc.note) : '') + '</div></div></div>';
    }
    return '<div class="f' + (f.full ? ' full' : '') + hid + (AUTO[f.k] && inp().ov && inp().ov[f.k] ? ' isman' : '') + '">' + lab + html + hint + whyLine(f.k) + '</div>';
  }
  function projectBar() {
    var pr = active();
    return '<div class="projbar"><div class="row" style="gap:8px;flex:1;min-width:0"><span class="chip ind" style="flex-shrink:0">' + ic('folder') + L('Project', '项目') + '</span>' +
      '<select id="projSel" class="fsel" style="flex:1;min-width:180px;max-width:440px">' + DBS.projects.map(function (x) { return '<option value="' + x.id + '"' + (x.id === pr.id ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('') + '</select>' +
      '<button class="btn small" data-act="newproj">' + ic('plus') + L('New', '新建') + '</button><button class="btn small ghost" data-act="dupproj">' + ic('copy') + L('Duplicate', '复制') + '</button>' +
      '<button class="btn small ghost" data-act="delproj">' + ic('trash') + L('Delete', '删除') + '</button><button class="btn small ghost" data-act="allproj">' + ic('grid') + L('All projects', '全部项目') + ' (' + DBS.projects.length + ')</button></div>' +
      '<div class="row" style="gap:6px"><button class="btn small ghost" data-act="exportdb">' + ic('download') + L('Export workspace', '导出工作区') + '</button><label class="btn small ghost" style="cursor:pointer">' + ic('upload') + L('Import', '导入') + '<input type="file" id="fileImport" accept=".json" hidden></label></div></div>' +
      (S.showAll ? allProjectsTable() : '');
  }
  function allProjectsTable() {
    return '<div class="card" style="margin-top:10px"><div class="tblw"><table class="t"><thead><tr><th>' + L('Project', '项目') + '</th><th>' + L('Location', '地点') + '</th><th>' + L('Type', '类型') + '</th><th class="r">MW</th><th>Tier</th><th class="r">PUE</th><th class="r">CAPEX</th><th class="r">IRR / TCO</th><th>' + L('Updated', '更新') + '</th><th></th></tr></thead><tbody>' +
      DBS.projects.map(function (pr) {
        var x; try { x = P.resolve(pr.input); } catch (e) { return ''; }
        var R = x.R;
        return '<tr' + (pr.id === DBS.active ? ' class="cur"' : '') + '><td><b>' + esc(pr.name) + '</b></td><td>' + L(R.L.en, R.L.zh) + '</td><td>' + L(R.cap.type.en, R.cap.type.zh) + '</td><td class="r">' + F(R.cap.itMW, 1) + '</td><td>' + ['I', 'II', 'III', 'IV'][R.p.tier - 1] + '</td><td class="r">' + F(R.eff.pue, 2) + '</td><td class="r">' + money(R.capex.total) + '</td><td class="r">' + (R.p.revModel === 'lease' ? pct(R.fin.irrTV) : money(R.fin.lcocAll, 0) + '/kW·mo') + '</td><td class="small muted">' + new Date(pr.updated).toLocaleString() + '</td>' +
          '<td class="nowrap"><button class="btn small ghost" data-open="' + pr.id + '">' + L('Open', '打开') + '</button></td></tr>';
      }).join('') + '</tbody></table></div></div>';
  }
  function renderForm() {
    var p = S.x.p;
    var openState = $$('details.stepbox').map(function (d) { return d.open; });
    var html = '';
    STEPS.forEach(function (st, i) {
      var nOv = st.f.filter(function (f) { return AUTO[f.k] && inp().ov && inp().ov[f.k]; }).length;
      html += '<details class="stepbox"' + ((openState.length ? openState[i] : st.open) ? ' open' : '') + '><summary><span class="n">' + st.n + '</span><span>' + L(st.en, st.zh) + '</span>' + (nOv ? '<span class="badge man">' + nOv + ' ' + L('manual', '手动') + '</span>' : '') + '<span class="tw">›</span></summary><div class="fields">' +
        st.f.map(function (f) { return fieldHTML(f, p); }).join('') + '</div></details>';
    });
    html += '<div class="small muted" style="padding:4px 4px 12px">' + L('AUTO = proposed from references & standards (hover for the basis). Editing a value marks it MANUAL; ↺ restores the proposal.', '自动=依据参考及标准提出（悬停查看依据）。修改后标记为手动；↺恢复建议值。') + '</div>';
    $('#formCol').innerHTML = html;
  }
  var timer = null;
  function setVal(k, v, rerender) {
    var i = inp(), f = null;
    STEPS.forEach(function (st) { st.f.forEach(function (x) { if (x.k === k) f = x; }); });
    if (k === 'prov') { var pr = find(DB.idProvinces, v); i.loc = pr.locs[0].id; }
    else {
      if (f && (f.t === 'num')) v = v === '' ? 0 : parseFloat(v);
      if (['rackW', 'rackD', 'rackU', 'fuelH', 'upsMin', 'bessH', 'tier'].indexOf(k) >= 0) v = parseFloat(v);
      i[k] = v;
      if (AUTO[k]) { i.ov = i.ov || {}; i.ov[k] = true; }
      if (k === 'name') { active().name = v || 'Untitled'; }
    }
    active().updated = Date.now();
    recompute();
    if (rerender || RERENDER.indexOf(k) >= 0) { renderForm(); if (k === 'name') renderProjBar(); }
    else refreshBadges();
    clearTimeout(timer); timer = setTimeout(function () { saveDB(); renderReport(); }, 150);
  }
  function refreshBadges() {
    /* update auto values of untouched fields after a recompute without stealing focus */
    var p = S.x.p;
    $$('#formCol [data-k]').forEach(function (el) {
      var k = el.dataset.k; if (!AUTO[k] || (inp().ov && inp().ov[k]) || el === document.activeElement) return;
      if (el.tagName === 'INPUT' && el.type === 'checkbox') el.checked = !!p[k];
      else if (el.tagName === 'INPUT' || el.tagName === 'SELECT') el.value = p[k];
      else if (el.classList.contains('seg')) $$('button', el).forEach(function (b) { b.classList.toggle('on', String(b.dataset.v) === String(p[k])); });
    });
  }
  function recompute() { S.x = P.resolve(inp()); }
  function renderProjBar() { $('#projBar').innerHTML = projectBar(); }

  function newProject(base, name) {
    var pr = { id: uid(), name: name || (base && base.name) || Lt('New Data Center Project', '新数据中心项目'), created: Date.now(), updated: Date.now(), input: newInput(base || { loc: inp().loc }) };
    pr.input.name = pr.name;
    DBS.projects.push(pr); DBS.active = pr.id; saveDB();
    recompute(); renderAssess(); renderHome();
    return pr;
  }
  function openProject(id) { DBS.active = id; saveDB(); recompute(); renderAssess(); show('assess'); }
  function importJSON(file) {
    if (!file) return;
    var rd = new FileReader();
    rd.onload = function () {
      try {
        var o = JSON.parse(rd.result), added = 0;
        var list = o.projects ? o.projects : (o.input ? [{ name: o.input.name, input: o.input }] : [o]);
        list.forEach(function (pp) { var inpx = pp.input || pp; if (!inpx || (!inpx.loc && !inpx.type)) return; var pr = { id: uid(), name: pp.name || inpx.name || 'Imported', created: Date.now(), updated: Date.now(), input: newInput(inpx) }; DBS.projects.push(pr); DBS.active = pr.id; added++; });
        if (!added) throw new Error('none');
        saveDB(); recompute(); renderAssess(); renderHome(); toast(Lt('Imported ' + added + ' project(s)', '已导入' + added + '个项目'));
      } catch (e) { toast(Lt('Invalid file', '文件无效')); }
    };
    rd.readAsText(file);
  }

  function renderAssess() {
    $('#view-assess').innerHTML = '<div id="projBar"></div><div class="assess"><div class="form-col" id="formCol"></div><div id="reportCol"></div></div>';
    renderProjBar(); renderForm(); renderReport();
  }
  function bindAssess() {
    var v = $('#view-assess');
    v.addEventListener('input', function (ev) { var t = ev.target; if (t.dataset && t.dataset.k && (t.type === 'number' || t.type === 'text')) setVal(t.dataset.k, t.value, false); });
    v.addEventListener('change', function (ev) {
      var t = ev.target;
      if (t.id === 'fileImport') return importJSON(t.files[0]);
      if (t.id === 'projSel') return openProject(t.value);
      if (t.id === 'curSel') { S.cur = t.value; saveDB(); renderReport(); if (S.showAll) renderProjBar(); return; }
      if (t.id === 'cnyIn') { S.cny = parseFloat(t.value) || 7.1; saveDB(); renderReport(); return; }
      if (t.dataset && t.dataset.k) {
        if (t.type === 'checkbox') setVal(t.dataset.k, t.checked, true);
        else if (t.tagName === 'SELECT') setVal(t.dataset.k, t.value, true);
        else setVal(t.dataset.k, t.value, false);
      }
    });
    v.addEventListener('click', function (ev) {
      var b = ev.target.closest('button,[data-rtab],[data-act],[data-open]'); if (!b) return;
      if (b.dataset.reset) { var i = inp(); if (i.ov) delete i.ov[b.dataset.reset]; active().updated = Date.now(); recompute(); saveDB(); renderForm(); renderReport(); return; }
      if (b.dataset.tier) { setVal('tier', +b.dataset.tier, true); return; }
      var seg = b.closest('.seg'); if (seg && b.dataset.v !== undefined) { setVal(seg.dataset.k, b.dataset.v, true); return; }
      if (b.dataset.rtab) { S.rtab = b.dataset.rtab; $$('.rtab').forEach(function (x) { x.classList.toggle('on', x.dataset.rtab === S.rtab); }); $$('.rpanel').forEach(function (p) { p.classList.toggle('hidden', p.dataset.panel !== S.rtab); }); return; }
      if (b.dataset.open) { openProject(b.dataset.open); return; }
      var a = b.dataset.act;
      if (a === 'dupproj') { var cp = JSON.parse(JSON.stringify(inp())); newProject(cp, active().name + ' (' + Lt('copy', '副本') + ')'); toast(Lt('Duplicated', '已复制')); }
      if (a === 'delproj') { if (DBS.projects.length <= 1) { toast(Lt('Keep at least one project', '至少保留一个项目')); return; } if (!confirm(Lt('Delete project “' + active().name + '”?', '删除项目“' + active().name + '”？'))) return; DBS.projects = DBS.projects.filter(function (x) { return x.id !== DBS.active; }); DBS.active = DBS.projects[0].id; saveDB(); recompute(); renderAssess(); renderHome(); }
      if (a === 'allproj') { S.showAll = !S.showAll; renderProjBar(); }
      if (a === 'exportdb') download('dc-assessment-workspace.json', JSON.stringify({ app: 'Data Center Project Assessment', version: 2, exported: new Date().toISOString(), projects: DBS.projects }, null, 2), 'application/json');
      if (a === 'json') download(safeName(active().name) + '.json', JSON.stringify({ app: 'Data Center Project Assessment', version: 2, projects: [active()] }, null, 2), 'application/json');
      if (a === 'pdf') { if (!RP.openPrint(S.x, ropt(), reportName())) toast(Lt('Allow pop-ups to open the printable report', '请允许弹出窗口以打开打印报告')); }
      if (a === 'docx') { toast(Lt('Building Word report…', '正在生成Word报告…')); RP.docx(S.x, ropt(), reportName()).catch(function (e) { console.error(e); toast(Lt('Word export failed', 'Word导出失败')); }); }
      if (a === 'xlsx') { toast(Lt('Building Excel workbook…', '正在生成Excel…')); RP.xlsx(S.x, ropt(), reportName()).catch(function (e) { console.error(e); toast(Lt('Excel export failed', 'Excel导出失败')); }); }
      if (a === 'csv') exportBOQ();
      if (a === 'fincsv') exportFin();
      if (a === 'eq') { S.eq.sel = b.dataset.id; S.eqTab = 'eq'; renderEquip(); show('equip'); }
      if (a === 'plat') { S.eqTab = 'plat'; renderEquip(); show('equip'); }
      if (a === 'ref') openRef(b.dataset.id);
    });
  }
  function ropt() { return { money: money, cur: S.cur, fx: fxNow(), lang: I18N.lang() }; }
  function reportName() { return safeName(active().name) + '_' + Lt('Proposal', '建议书'); }

  /* ============================================================ ASSESSMENT — report */
  var RTABS = [['sum', 'Summary', '摘要'], ['site', 'Site & region', '场地与区域'], ['it', 'IT & racks', 'IT与机柜'], ['el', 'Resilience & power', '韧性与供电'], ['me', 'Cooling', '制冷'],
               ['sp', 'Building & space', '建筑与空间'], ['fs', 'Fire · security · monitoring', '消防·安防·监控'], ['boq', 'Equipment list', '设备清单'], ['fin', 'Cost & finance', '投资与财务'],
               ['sch', 'Schedule & staffing', '进度与人员'], ['risk', 'Risks', '风险'], ['std', 'Permits & standards', '许可与标准'], ['reg', 'Parameter register', '参数登记']];
  function renderReport() {
    var x = S.x, R = x.R, p = x.p, c = R.cap;
    var head = '<div class="report-head"><div class="row" style="align-items:flex-start"><div style="min-width:0"><h3>' + esc(p.name || 'Untitled') + '</h3><div class="small" style="color:#c8cbff">' + L(R.L.en + ', ' + R.L.provEn, R.L.zh + '，' + R.L.provZh) + ' · ' + L(c.type.en, c.type.zh) + '</div></div><span class="spacer"></span>' +
      '<div class="row no-print" style="gap:6px"><select id="curSel" class="fsel" style="padding:5px 8px">' + ['USD', 'IDR', 'CNY'].map(function (k) { return '<option' + (S.cur === k ? ' selected' : '') + '>' + k + '</option>'; }).join('') + '</select>' +
      (S.cur === 'CNY' ? '<input id="cnyIn" class="fsel" style="width:80px;padding:5px 8px" type="number" step="0.01" value="' + S.cny + '" title="CNY per USD">' : '') +
      '<span class="exp">' + L('Export proposal', '导出建议书') + '</span><button class="btn small cyan" data-act="docx">' + ic('file') + 'Word</button><button class="btn small cyan" data-act="xlsx">' + ic('grid') + 'Excel</button><button class="btn small cyan" data-act="pdf">' + ic('print') + 'PDF</button><button class="btn small ghost2" data-act="json">JSON</button></div></div>' +
      '<div class="chips"><span class="chip">' + L(c.size.en, c.size.zh) + '</span><span class="chip">' + esc(c.tier.en.split(' — ')[0]) + ' · ' + c.tier.avail + '%</span><span class="chip">' + F(c.itMW, 2) + ' MW IT</span><span class="chip">' + F(c.racks) + ' ' + L('racks', '机柜') + '</span>' +
      (c.gpus ? '<span class="chip">≈ ' + F(c.gpus) + ' GPU</span>' : '') + '<span class="chip">PUE ' + F(R.eff.pue, 2) + '</span><span class="chip">' + L(R.cool.obj.en, R.cool.obj.zh) + '</span></div></div>';
    var tabs = '<div class="rtabs no-print">' + RTABS.map(function (t) { return '<button class="rtab' + (S.rtab === t[0] ? ' on' : '') + '" data-rtab="' + t[0] + '">' + L(t[1], t[2]) + '</button>'; }).join('') + '</div>';
    var panels = { sum: pSummary, site: pSite, it: pIT, el: pPower, me: pCooling, sp: pSpace, fs: pFS, boq: pBOQ, fin: pFin, sch: pSched, risk: pRisk, std: pStd, reg: pReg };
    var body = RTABS.map(function (t) { var h; try { h = panels[t[0]](x); } catch (e) { console.error(e); h = '<div class="card">' + esc(String(e)) + '</div>'; } return '<div class="rpanel' + (S.rtab === t[0] ? '' : ' hidden') + '" data-panel="' + t[0] + '">' + h + '</div>'; }).join('');
    $('#reportCol').innerHTML = head + tabs + body;
  }
  function tile(val, unit, en, zh, sub, color) { return '<div class="tile" style="--c:' + (color || '#3f3cbb') + '"><div class="lbl">' + L(en, zh) + '</div><b>' + val + (unit ? '<span class="u">' + unit + '</span>' : '') + '</b>' + (sub ? '<div class="sub">' + sub + '</div>' : '') + '</div>'; }
  function kv(rows) { return '<div class="tblw"><table class="t kv"><tbody>' + rows.map(function (r) { return '<tr><td>' + L(r[0], r[1]) + '</td><td>' + r[2] + '</td></tr>'; }).join('') + '</tbody></table></div>'; }
  function ptitle(en, zh, extra) { return '<div class="row" style="margin:2px 0 10px"><h3 style="margin:0">' + L(en, zh) + '</h3><span class="spacer"></span>' + (extra || '') + '</div>'; }
  function showVal(v) {
    if (typeof v === 'boolean') return v ? L('Yes', '是') : L('No', '否');
    var pl = find(DB.platforms, v); if (pl.id) return L(pl.en, pl.zh);
    var cb = find(DB.cabinets, v); if (cb.id) return L(cb.en, cb.zh);
    var co = find(DB.cooling, v); if (co.id) return L(co.en, co.zh);
    if (P.CRIT[v]) return L(P.CRIT[v][0], P.CRIT[v][1]);
    return esc(typeof v === 'number' ? F(v, v % 1 ? 2 : 0) : v);
  }
  function why(k) {
    var x = S.x; if (!x.why[k]) return '';
    var ovd = x.p.ov && x.p.ov[k] && String(x.prop[k]) !== String(x.p[k]);
    return '<div class="whybox">' + (ovd ? '<b>' + L('Owner override', '业主修改') + ':</b> ' + showVal(x.p[k]) + ' — ' + L('proposed', '建议值') + ': ' + showVal(x.prop[k]) + '.\n' + L('Basis of the proposal', '建议依据') + ': ' : '') + Lp(x.why[k]) + '</div>';
  }
  var CAT = { GEN: ['General', '总体', '#17153f'], EL: ['Power', '电力', '#e39b1b'], ME: ['Cooling', '制冷', '#0ea5c6'], CS: ['Civil', '土建', '#b45309'], FS: ['Fire', '消防', '#f0544f'], SC: ['Security', '安防', '#7c3aed'], MC: ['Monitor', '监控', '#16a34a'], OPS: ['Ops', '运营', '#5d6280'] };
  function reqRow(r) { var c = CAT[r.cat] || CAT.GEN; return '<div class="req"><span class="tag" style="background:' + c[2] + '">' + L(c[0], c[1]) + '</span><div>' + L(r.en, r.zh) + '</div></div>'; }
  function riskRow(r) { return '<div class="risk"><span class="lv ' + r.lv + '">' + r.lv + '</span><div><div>' + L(r.en, r.zh) + '</div><div class="mit">' + Lp(r.m) + '</div></div></div>'; }

  function pSummary(x) {
    var R = x.R, c = R.cap, f = R.fin, p = x.p;
    var finTile = p.revModel === 'lease'
      ? tile(pct(f.irrTV), '', 'Project IRR (with exit)', '项目IRR（含终值）', L('without exit ', '不含终值 ') + pct(f.irr) + ' · NPV ' + money(f.npvTV), f.irrTV !== null && f.irrTV >= p.wacc / 100 ? '#16a34a' : '#f0544f')
      : tile(money(f.lcocAll, 0), '/kW·mo', 'Cost of ownership', '拥有成本', L('vs. lease ≈ ', '对比租赁约 ') + money(p.price + R.eff.pue * 730 * R.tariffUSD, 0) + '/kW·mo', '#7c3aed');
    var html = '<div class="tiles">' +
      tile(F(c.itMW, 2), 'MW', 'IT capacity', 'IT容量', F(c.racks) + ' ' + L('racks · avg ', '柜·平均 ') + F(c.avgDens, 1) + ' kW', '#3f3cbb') +
      tile(c.tier.en.split(' — ')[0], '', 'Resilience', '韧性等级', c.tier.avail + '% · ' + L(p.fuelH + ' h fuel', '燃油' + p.fuelH + ' h'), '#17153f') +
      tile(F(R.eff.pue, 2), '', 'Annual PUE', '年均PUE', L('target ', '目标 ') + F(p.targetPUE, 2) + ' · WUE ' + F(R.eff.wue, 2), '#0ea5c6') +
      tile(F(R.el.mva, 1), 'MVA', 'PLN demand', 'PLN需量', L(R.el.volt[0], R.el.volt[1]), '#f2a93b') +
      tile(money(R.capex.total), '', 'Total CAPEX', '总投资', money(R.capex.perMW * 1e6, 1) + '/MW', '#f0544f') +
      tile(money(R.opex.total), L('/yr', '/年'), 'OPEX (stabilised)', '运营成本（稳定期）', L('energy ', '电费 ') + Math.round(R.opex.energy / R.opex.total * 100) + '%', '#7c3aed') + finTile +
      tile(R.sched.total, L('months', '个月'), 'To Ready-for-Service', '至投产', 'RFS ≈ ' + R.sched.rfsYear, '#16a34a') +
      tile(F(R.sp.siteNeed / 10000, 2), 'ha', 'Site required', '所需用地', F(R.sp.gfa) + ' m² GFA', '#b45309') +
      tile(R.el.bess ? F(R.el.bess.mwh, 1) : '–', R.el.bess ? 'MWh' : '', 'BESS', '储能', R.el.bess ? F(R.el.bess.mw, 1) + ' MW · ' + R.el.bess.containers + L(' containers', '个集装箱') : L('not proposed', '未建议'), '#0b7f99') +
      tile(R.staff.fte, 'FTE', 'Operations staff', '运营人员', '24/7', '#5d6280') +
      tile(F(R.opex.co2t / 1000, 1), 'kt CO₂e', 'Scope-2 emissions', '范围二排放', L('renewable ', '可再生 ') + p.renewable + '%', '#16a34a') + '</div>';
    html += '<div class="grid g2"><div class="card">' + ptitle('Key requirements', '关键要求') + R.reqs.slice(0, 8).map(reqRow).join('') + '<div style="margin-top:8px"><button class="btn small ghost" data-rtab="el">' + L('Details →', '详情 →') + '</button></div></div>' +
      '<div class="card">' + ptitle('Top risks', '主要风险') + R.risks.slice(0, 5).map(riskRow).join('') + '<div style="margin-top:8px"><button class="btn small ghost" data-rtab="risk">' + L('Risk register →', '风险登记册 →') + '</button></div></div></div>';
    html += '<div class="card">' + ptitle('Similar reference projects', '相似参考项目') + '<div class="grid g4">' + R.similar.map(refMini).join('') + '</div></div>';
    return html;
  }
  function pSite(x) {
    var R = x.R, L0 = R.L, p = x.p;
    return '<div class="grid g2"><div class="card">' + ptitle('Location profile', '地点概况') + kv([
      ['Province / location', '省份/地点', L(L0.provEn + ' — ' + L0.en, L0.provZh + '——' + L0.zh)], ['Island', '岛屿', esc(L0.island)],
      ['Climate class', '气候类型', L(R.clim.en, R.clim.zh)], ['Design dry-bulb / wet-bulb', '设计干球/湿球', L0.db + ' °C / ' + L0.wb + ' °C'], ['Elevation', '海拔', F(L0.elev) + ' m'],
      ['Seismic / flood (planning)', '地震/洪水（规划级）', lv(p.seismic) + ' / ' + lv(p.flood)], ['Water constraint', '水资源', p.waterScarce ? L('Constrained', '受限') : L('No major constraint', '无明显制约')],
      ['DC market', '数据中心市场', L({ major: 'Major hub', emerging: 'Emerging hub', none: 'No established hub' }[L0.hub], { major: '主要枢纽', emerging: '新兴枢纽', none: '尚无成熟枢纽' }[L0.hub])]]) +
      (L0.note ? '<div class="whybox">' + Lp(L0.note) + '</div>' : '') + '</div>' +
      '<div class="card">' + ptitle('Utilities, costs & labour', '公用设施、成本与人工') + kv([
      ['PLN system', 'PLN电网', L(R.grid.en, R.grid.zh)], ['Grid reliability (planning)', '电网可靠性（规划级）', lv(R.grid.rel)], ['Grid note', '电网说明', Lp(R.grid.d)],
      ['Electricity tariff used', '采用电价', 'Rp' + F(p.tariffIDR, 1) + '/kWh ≈ USD ' + F(R.tariffUSD, 4) + '/kWh'], ['Land price', '土地价格', 'USD ' + F(p.landPrice) + '/m² ≈ Rp' + F(p.landPrice * p.fx / 1e6, 2) + ' ' + L('million/m²', '百万/m²')],
      ['Water price', '水价', 'USD ' + F(p.waterPrice, 2) + '/m³'], ['UMP 2026', '2026年最低工资', 'Rp' + F(L0.ump) + '/' + L('month', '月') + (L0.umpApprox ? ' (≈)' : '')], ['Staff cost used', '采用人员成本', 'USD ' + F(p.staffCost) + '/FTE·' + L('yr', '年')],
      ['Construction logistics factor', '施工物流系数', F(L0.capexF, 2) + ' × ' + L('Greater Jakarta', '大雅加达')]]) + '</div></div>' +
      '<div class="card">' + ptitle('Site area check', '用地核查') + kv([['Site area required', '所需用地', F(R.sp.siteNeed) + ' m² (' + F(R.sp.siteNeed / 10000, 2) + ' ha)'],
        ['Available site', '可用场地', p.siteArea > 0 ? F(p.siteArea) + ' m² — ' + (R.sp.siteOK ? '<span class="chip green">' + L('sufficient', '充足') + '</span>' : '<span class="chip coral">' + L('insufficient', '不足') + '</span>') : L('not specified', '未提供')],
        ['PLN capacity offered', 'PLN可供容量', p.gridMVA > 0 ? F(p.gridMVA, 1) + ' / ' + F(R.el.mva, 1) + ' MVA ' + (R.el.gridOK ? '✔' : '✖') : L('not specified', '未提供')]]) + '</div>';
  }
  function pIT(x) {
    var R = x.R, c = R.cap, p = x.p, sp = R.stdP, hp = R.hdP;
    function platCard(pl, role, n, kw) {
      return '<div class="card"><div class="row"><span class="chip ' + (pl.cat === 'AI' ? 'coral' : 'ind') + '">' + L(role[0], role[1]) + '</span>' + (pl.provisional ? '<span class="chip amber">' + L('provisional', '暂定') + '</span>' : '') + '<span class="spacer"></span><b>' + F(n) + ' ' + L('racks', '柜') + '</b></div>' +
        '<h3 style="margin-top:8px">' + L(pl.en, pl.zh) + '</h3><div class="small muted">' + esc(pl.vendor) + '</div>' + kv([['Design / peak', '设计/峰值', F(kw, 1) + ' / ' + F(pl.kwPeak) + ' kW'], ['Cooling', '冷却', pl.cool + (pl.liq ? ' (' + F(pl.liq * 100) + '% ' + L('to liquid', '液冷') + ')' : '')],
          ['Rack', '机柜', pl.w + ' × ' + pl.d + ' mm · ' + pl.u + 'U · ≈ ' + F(pl.kg) + ' kg'], ['GPUs / accelerators per rack', '每柜GPU/加速器', pl.gpu || '–']]) + '<div class="whybox">' + Lp(pl.note) + (pl.src ? ' <a href="' + esc(pl.src) + '" target="_blank" rel="noopener">' + L('source', '来源') + '</a>' : '') + '</div></div>';
    }
    var html = '<div class="tiles">' + tile(F(c.racks), '', 'Total racks', '机柜总数', F(c.stdR) + ' + ' + F(c.hdR) + ' HD', '#3f3cbb') + tile(F(c.avgDens, 1), 'kW', 'Average density', '平均密度', L('max ', '最大 ') + F(c.maxDens, 0) + ' kW', '#f0544f') +
      tile(c.gpus ? F(c.gpus) : '–', '', 'GPUs / accelerators', 'GPU/加速器', c.hdR ? L(hp.en, hp.zh) : '', '#7c3aed') + tile(F(R.sp.ws), 'm²', 'White space', '白区', F(R.sp.rackArea, 2) + ' m²/' + L('rack', '柜'), '#0ea5c6') + '</div>';
    html += '<div class="grid g2">' + platCard(sp, ['Standard racks', '标准机柜'], c.stdR, c.sd) + (c.hdR ? platCard(hp, ['High-density racks', '高密度机柜'], c.hdR, c.hd) : '<div class="card">' + L('No high-density racks.', '无高密度机柜。') + '</div>') + '</div>';
    var cab = find(DB.cabinets, p.cabinet);
    html += '<div class="card">' + ptitle('Cabinet selection', '机柜选型') + kv([['Brand / range', '品牌/系列', L(cab.en, cab.zh)], ['Selected size', '选型尺寸', p.rackW + ' × ' + p.rackD + ' mm · ' + p.rackU + 'U'], ['Static load rating', '静载能力', '≈ ' + F(cab.kg) + ' kg'], ['Note', '说明', Lp(cab.note)]]) + why('cabinet') + '</div>';
    html += '<div class="card">' + ptitle('Platform comparison for ' + F(c.itMW, 1) + ' MW', F(c.itMW, 1) + ' MW的平台比较', '<button class="btn small ghost" data-act="plat">' + L('Platform catalogue →', '平台目录 →') + '</button>') +
      '<div class="tblw"><table class="t"><thead><tr><th>' + L('Platform', '平台') + '</th><th class="r">kW/' + L('rack', '柜') + '</th><th>' + L('Cooling', '冷却') + '</th><th class="r">' + L('Racks for this load', '所需机柜') + '</th><th class="r">GPU</th><th class="r">kg</th></tr></thead><tbody>' +
      DB.platforms.filter(function (pl) { return pl.cat === 'AI' || pl.id === sp.id; }).map(function (pl) { var n = Math.ceil(c.itKW / pl.kw); return '<tr' + (pl.id === hp.id || pl.id === sp.id ? ' class="cur"' : '') + '><td>' + L(pl.en, pl.zh) + (pl.provisional ? ' <span class="chip amber">' + L('provisional', '暂定') + '</span>' : '') + '</td><td class="r">' + pl.kw + '</td><td>' + pl.cool + '</td><td class="r">' + F(n) + '</td><td class="r">' + (pl.gpu ? F(n * pl.gpu) : '–') + '</td><td class="r">' + F(pl.kg) + '</td></tr>'; }).join('') +
      '</tbody></table></div><div class="small muted" style="margin-top:6px">' + L('Racks needed if the entire IT load used that platform — for comparison.', '若全部IT负载采用该平台所需机柜数——仅供比较。') + '</div></div>';
    return html;
  }
  function powerDiagram(R) {
    var el = R.el, W = 900, H = 250, bw = 112, bh = 64, y = 30, gap = (W - 20 - bw * 7) / 6, zh = I18N.lang() === 'zh';
    var nodes = [['Utility (PLN)', '市电（PLN）', el.feeds + ' × ' + F(el.mva, 1) + ' MVA', '#f2a93b'], ['MV switchgear', '中压开关柜', el.vclass === 'TT' ? '150 kV → 20 kV' : '20 kV', '#e39b1b'],
      ['Transformers', '变压器', el.txTotal + ' × ' + F(el.txSize) + ' kVA', '#3f3cbb'], ['LV switchboards', '低压配电柜', el.txTotal + ' ' + Lt('line-ups', '组'), '#3f3cbb'], ['UPS', 'UPS', el.upsTotal + ' × ' + F(el.upsSize) + ' kW', '#7c3aed'],
      [el.useBusway ? 'Busway' : 'PDU', el.useBusway ? '插接母线' : '列头柜', el.useBusway ? el.busways + ' × ' + el.bwA + ' A' : el.pdus + ' × 150 kVA', '#0ea5c6'], ['IT racks', 'IT机柜', F(R.cap.racks) + ' × ' + F(R.cap.avgDens, 1) + ' kW', '#17153f']];
    var s = '<svg class="diagram" viewBox="0 0 ' + W + ' ' + H + '"><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#5d6280"/></marker></defs>';
    nodes.forEach(function (n, i) { var x = 10 + i * (bw + gap);
      s += '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + bh + '" rx="10" fill="' + n[3] + '"/><text x="' + (x + bw / 2) + '" y="' + (y + 37) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">' + esc(zh ? n[1] : n[0]) + '</text>';
      s += '<text x="' + (x + bw / 2) + '" y="' + (y + bh + 18) + '" text-anchor="middle" font-size="11.5" font-weight="700" fill="#161936">' + esc(n[2]) + '</text>';
      if (i < nodes.length - 1) s += '<line x1="' + (x + bw + 2) + '" y1="' + (y + bh / 2) + '" x2="' + (x + bw + gap - 3) + '" y2="' + (y + bh / 2) + '" stroke="#5d6280" stroke-width="2" marker-end="url(#ah)"/>'; });
    var gx = 10 + 3 * (bw + gap), gy = 160, bx = 10 + 4 * (bw + gap), sx = 10 + 1 * (bw + gap);
    s += '<rect x="' + (gx - 10) + '" y="' + gy + '" width="' + (bw + 20) + '" height="56" rx="10" fill="#fdf1dc" stroke="#f2a93b" stroke-width="2"/><text x="' + (gx + bw / 2) + '" y="' + (gy + 22) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#8a5a0a">' + esc(Lt('Generators', '发电机')) + '</text><text x="' + (gx + bw / 2) + '" y="' + (gy + 40) + '" text-anchor="middle" font-size="11.5" font-weight="700" fill="#161936">' + el.genTotal + ' × ' + F(el.genSize) + ' kWe</text>';
    s += '<line x1="' + (gx + bw / 2) + '" y1="' + gy + '" x2="' + (gx + bw / 2) + '" y2="' + (y + bh + 26) + '" stroke="#f2a93b" stroke-width="2.5" marker-end="url(#ah)"/>';
    s += '<rect x="' + (bx - 4) + '" y="' + gy + '" width="' + (bw + 8) + '" height="56" rx="10" fill="#efe8fd" stroke="#7c3aed" stroke-width="2"/><text x="' + (bx + bw / 2) + '" y="' + (gy + 22) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#5b21b6">' + esc(Lt('UPS batteries', 'UPS电池')) + '</text><text x="' + (bx + bw / 2) + '" y="' + (gy + 40) + '" text-anchor="middle" font-size="11.5" font-weight="700" fill="#161936">' + F(el.battKWh) + ' kWh</text>';
    s += '<line x1="' + (bx + bw / 2) + '" y1="' + gy + '" x2="' + (bx + bw / 2) + '" y2="' + (y + bh + 26) + '" stroke="#7c3aed" stroke-width="2.5" marker-end="url(#ah)"/>';
    if (el.bess) { s += '<rect x="' + (sx - 10) + '" y="' + gy + '" width="' + (bw + 20) + '" height="56" rx="10" fill="#def6fb" stroke="#0ea5c6" stroke-width="2"/><text x="' + (sx + bw / 2) + '" y="' + (gy + 22) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#0b7f99">BESS</text><text x="' + (sx + bw / 2) + '" y="' + (gy + 40) + '" text-anchor="middle" font-size="11.5" font-weight="700" fill="#161936">' + F(el.bess.mw, 1) + ' MW / ' + F(el.bess.mwh, 1) + ' MWh</text>';
      s += '<line x1="' + (sx + bw / 2) + '" y1="' + gy + '" x2="' + (sx + bw / 2) + '" y2="' + (y + bh + 26) + '" stroke="#0ea5c6" stroke-width="2.5" marker-end="url(#ah)"/>'; }
    s += '<text x="' + (W - 12) + '" y="' + (gy + 30) + '" text-anchor="end" font-size="11" fill="#5d6280">' + esc(el.feedsPerRack === 2 ? Lt('A + B feeds per rack', '每柜A+B双路') : Lt('Single feed', '单路')) + '</text>';
    return s + '</svg>';
  }
  function pPower(x) {
    var R = x.R, el = R.el, p = x.p;
    var html = '<div class="card">' + ptitle('Resilience level & standards', '韧性等级与标准') + why('tier') + '<div class="tblw" style="margin-top:8px"><table class="t"><thead><tr><th>' + L('Standard', '标准') + '</th><th>' + L('Level', '等级') + '</th><th>' + L('Key requirements', '主要要求') + '</th></tr></thead><tbody>' +
      x.tierStd.map(function (r) { return '<tr><td><b>' + esc(r[0]) + '</b></td><td>' + esc(r[1]) + '</td><td>' + L(r[2], r[3]) + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
    html += '<div class="card">' + ptitle('Critical power chain', '关键供电链') + powerDiagram(R) + '</div>';
    html += '<div class="grid g2"><div class="card">' + ptitle('Electrical sizing', '电气容量') + kv([
      ['IT load / UPS-protected load', 'IT负载/UPS保护负载', F(R.cap.itKW) + ' / ' + F(el.upsLoad) + ' kW'], ['Facility maximum demand', '设施最大需量', F(el.demandKW) + ' kW · ' + F(el.demandKVA) + ' kVA'],
      ['PLN connection', 'PLN接入', F(el.mva, 1) + ' MVA · ' + L(el.volt[0], el.volt[1]) + ' · ' + el.feeds + ' ' + L('feed(s)', '路')], ['MV/LV transformers', '中/低压变压器', el.txTotal + ' × ' + F(el.txSize) + ' kVA (' + el.txLabel + ')'],
      ['Diesel generators', '柴油发电机', el.genTotal + ' × ' + F(el.genSize) + ' kWe (' + el.genLabel + '), COP/DCC'], ['Fuel at max demand / storage', '耗油/储油', F(el.fuelLph) + ' L/h · ' + F(el.fuelL / 1000) + ' m³ (' + p.fuelH + ' h) · ' + el.tanks + ' × ' + el.tankSize + ' m³'],
      ['UPS systems', 'UPS系统', el.upsTotal + ' × ' + F(el.upsSize) + ' kW (' + el.upsLabel + ')'], ['UPS batteries', 'UPS电池', F(el.battKWh) + ' kWh ' + (p.battery === 'LI' ? 'Li-ion LFP' : 'VRLA') + ' · ' + p.upsMin + ' min'],
      ['IT distribution', 'IT配电', el.useBusway ? el.busways + ' × ' + el.bwA + ' A ' + L('busway', '母线') : el.pdus + ' × 150 kVA PDU'], ['Rack power', '机柜供电', L(el.rStd[0], el.rStd[1]) + (el.rHd ? ' · HD: ' + L(el.rHd[0], el.rHd[1]) : '')]]) + '</div>' +
      '<div class="card">' + ptitle('Backup autonomy & storage', '后备时间与储能') + '<h4>' + L('Generator fuel', '发电机燃油') + ' — ' + p.fuelH + ' h</h4>' + why('fuelH') + '<h4>UPS — ' + p.upsMin + ' min, ' + (p.battery === 'LI' ? 'LFP' : 'VRLA') + '</h4>' + why('upsMin') + why('battery') +
      '<h4>BESS — ' + (el.bess ? F(el.bess.mw, 1) + ' MW / ' + F(el.bess.mwh, 1) + ' MWh (' + el.bess.containers + ' × 20-ft)' : L('not included', '未配置')) + '</h4>' + why('bessOn') +
      (el.bess ? kv([['BESS CAPEX', '储能投资', money(R.capex.bess) + ' (≈ USD ' + E.BESS_USD_KWH + '/kWh)'], ['Peak-shaving saving / yr', '年削峰节省', money(-R.opex.bessSave)], ['Yard area', '场地面积', F(el.bess.area) + ' m²']]) : '') + '</div></div>';
    return html + eqLinks(['EL-01', 'EL-02', 'EL-03', 'EL-04', 'EL-06', 'EL-09', p.battery === 'LI' ? 'EL-10' : 'EL-11', 'EL-23', el.useBusway ? 'EL-13' : 'EL-12', 'EL-14']);
  }
  function eqLinks(ids) {
    return '<div class="card"><h4 style="margin-top:0">' + L('Specifications & TPG for these systems', '相关系统的技术规范及TPG') + '</h4><div class="row" style="gap:6px">' + ids.map(function (id) { var e = find(DB.equipment, id); if (!e.id) return '';
      return '<button class="chip ind" style="cursor:pointer" data-act="eq" data-id="' + id + '">' + id + ' · ' + L(e.en, e.zh) + '</button>'; }).join('') + '</div></div>';
  }
  function pCooling(x) {
    var R = x.R, me = R.me, p = x.p;
    var html = '<div class="card">' + ptitle('Cooling decision matrix', '制冷决策矩阵') + '<div class="tblw"><table class="t"><thead><tr><th>' + L('Technology', '技术') + '</th><th>' + L('Feasible', '可行') + '</th><th class="r">PUE</th><th class="r">WUE</th><th class="r">' + L('Energy / yr', '年电费') + '</th><th class="r">' + L('Water m³/day', '用水m³/日') + '</th><th>' + L('Units', '设备') + '</th>' +
      ['Efficiency', 'Water', 'Scale', 'CAPEX', 'Maturity', 'IT fit'].map(function (h, i) { return '<th class="r">' + L(h, ['能效', '用水', '规模', '投资', '成熟度', 'IT适配'][i]) + '</th>'; }).join('') + '<th class="r">' + L('Score', '得分') + '</th></tr></thead><tbody>' +
      x.matrix.map(function (m) { return '<tr' + (m.id === p.cooling ? ' class="cur"' : '') + '><td><b>' + L(m.en, m.zh) + '</b></td><td>' + (m.feasible ? '<span class="chip green">✓</span>' : '<span class="chip coral">✗</span>') + '</td><td class="r">' + F(m.pue, 2) + '</td><td class="r">' + F(m.wue, 2) + '</td><td class="r">' + money(m.energyCost) + '</td><td class="r">' + F(m.water) + '</td><td class="small">' + F(m.units.n) + ' × ' + m.units.size + ' kW ' + L(m.units.en, m.units.zh) + '</td>' +
        ['eff', 'water', 'scale', 'capex', 'mat', 'it'].map(function (k) { return '<td class="r">' + F(m.s[k], 1) + '</td>'; }).join('') + '<td class="r"><b>' + (m.feasible ? F(m.score, 2) : '–') + '</b></td></tr>'; }).join('') + '</tbody></table></div>' +
      '<div class="small muted" style="margin-top:6px">' + L('Scores 0–5; weights: efficiency 28, water ' + (p.waterScarce ? 25 : 12) + ', scale 18, CAPEX 14, maturity in Indonesia 14, IT compatibility 14. Infeasible options exceed their density limit or do not match the IT platforms.', '评分0–5；权重：能效28、用水' + (p.waterScarce ? 25 : 12) + '、规模18、投资14、印尼成熟度14、IT适配14。不可行项超出密度上限或与IT平台不匹配。') + '</div></div>';
    html += '<div class="card">' + ptitle('Selected design & reasoning', '选定方案及依据') + '<h3>' + L(R.cool.obj.en, R.cool.obj.zh) + (p.ov && p.ov.cooling ? ' <span class="badge man">' + L('MANUAL', '手动') + '</span>' : '') + '</h3>' + why('cooling') + '</div>';
    var rows = [['Total heat to reject', '总散热量', F(me.totalHeat) + ' kW · ' + F(me.tr) + ' RT'], ['Heat to air / liquid', '风冷/液冷热量', F(R.cool.airKW) + ' / ' + F(R.cool.liquidKW) + ' kW']];
    if (me.cracN) rows.push(['DX precision AC', '直膨精密空调', (me.cracN + me.cracR) + ' × ' + me.cracSize + ' kW']);
    if (me.chN) rows.push([R.cool.airTech === 'WCCH' ? 'Water-cooled chillers' : 'Air-cooled chillers', R.cool.airTech === 'WCCH' ? '水冷冷水机组' : '风冷冷水机组', (me.chN + me.chR) + ' × ' + F(me.chSize) + ' kW (' + me.chLabel + ')']);
    if (me.ctN) rows.push(['Cooling tower cells', '冷却塔单元', (me.ctN + me.ctR) + ' · ' + F(me.rejKW) + ' kW']);
    if (me.term) rows.push(['Air terminals', '空气末端', L(me.term.en, me.term.zh) + ' × ' + (me.term.n + me.term.r)]);
    if (me.rdhx) rows.push(['Rear-door heat exchangers', '背板换热器', me.rdhx]);
    if (me.iecN) rows.push(['IEC modules', '间接蒸发模块', (me.iecN + me.iecR) + ' × 400 kW']);
    if (me.cduN) rows.push(['CDUs', 'CDU', (me.cduN + me.cduR) + ' × ' + me.cduSize + ' kW']);
    if (me.dcN) rows.push(['Warm-water heat rejection', '温水散热', (me.dcN + me.dcR) + ' × 1,500 kW']);
    if (me.tesM3) rows.push(['Thermal storage (10 min)', '蓄冷（10 min）', F(me.tesM3) + ' m³']);
    rows.push(['Water use', '用水', F(me.waterDay) + ' m³/' + L('day', '日') + ' · ' + L('storage ', '储水 ') + F(me.waterStore) + ' m³']);
    html += '<div class="grid g2"><div class="card">' + ptitle('Cooling plant sizing', '制冷设备容量') + kv(rows) + '</div><div class="card">' + ptitle('Efficiency & sustainability', '能效与可持续') +
      C.stackBar([{ label: 'IT', html: 'IT', value: 1, color: '#c7d2fe' }, { label: 'Cooling', html: L('Cooling', '制冷'), value: R.eff.mech, color: '#0ea5c6' }, { label: 'Electrical', html: L('Electrical losses', '电气损耗'), value: R.eff.elec, color: '#f2a93b' }, { label: 'Other', html: L('Lighting & other', '照明及其他'), value: R.eff.misc, color: '#7c3aed' }], { dec: 3, h: 36 }) +
      kv([['Annual PUE / design day', '年均/设计日PUE', F(R.eff.pue, 2) + ' / ' + F(R.eff.puePeak, 2)], ['Target PUE', '目标PUE', F(p.targetPUE, 2)], ['WUE', 'WUE', F(R.eff.wue, 2) + ' L/kWh'], ['Renewable share / REC cost', '可再生占比/绿证成本', p.renewable + '% · ' + money(R.opex.rec) + L('/yr', '/年')], ['Scope-2 emissions', '范围二排放', F(R.opex.co2t) + ' tCO₂e/' + L('yr', '年')]]) +
      '<h4>' + L('Target PUE basis', '目标PUE依据') + '</h4>' + why('targetPUE') + '<h4>' + L('Renewable share basis', '可再生能源依据') + '</h4>' + why('renewable') + '</div></div>';
    return html + eqLinks(R.boq.filter(function (b) { return b.sys === 'ME'; }).map(function (b) { return b.id; }));
  }
  function pSpace(x) {
    var R = x.R, sp = R.sp, p = x.p;
    return '<div class="grid g2"><div class="card">' + ptitle('Building areas', '建筑面积') +
      C.stackBar([{ label: 'WS', html: L('White space', '白区'), value: sp.ws, color: '#3f3cbb' }, { label: 'EL', html: L('Electrical', '电气'), value: sp.elecRoom, color: '#f2a93b' }, { label: 'ME', html: L('Mechanical', '暖通'), value: sp.mechRoom, color: '#0ea5c6' }, { label: 'SP', html: L('Support', '支持区'), value: sp.support, color: '#7c3aed' }, { label: 'CI', html: L('Circulation & walls', '交通及墙体'), value: sp.gfa - sp.ws - sp.elecRoom - sp.mechRoom - sp.support, color: '#a3a6c8' }], { unit: ' m²', h: 36 }) +
      kv([['White space', '白区', F(sp.ws) + ' m² · ' + sp.halls + ' ' + L('hall(s)', '个机房')], ['Electrical rooms', '电气房间', F(sp.elecRoom) + ' m²'], ['Mechanical rooms', '暖通机房', F(sp.mechRoom) + ' m²'], ['Support', '支持区', F(sp.support) + ' m²'],
          ['Gross floor area', '总建筑面积', '<b>' + F(sp.gfa) + ' m²</b> · ' + F(sp.gfa / R.cap.itMW) + ' m²/MW'], ['Footprint', '占地', F(sp.footprint) + ' m² · ' + p.floors + ' ' + L('storey(s)', '层')]]) + '</div>' +
      '<div class="card">' + ptitle('Structure & site', '结构与场地') + kv([['Floor live load', '楼面活荷载', '≥ ' + sp.floorLoad + ' kN/m² (' + L('heaviest rack ≈ ', '最重机柜约') + F(sp.heavyRack) + ' kg)'], ['Clear height', '净高', L(sp.clearH, sp.clearHzh)],
          ['White-space floor', '白区地面', sp.raised ? L('Raised access floor', '防静电架空地板') : L('Slab-on-grade, overhead distribution', '无架空地板，上走线')], ['Seismic design', '抗震设计', 'SNI 1726:2019 · ' + lv(p.seismic) + (p.seismic === 'high' ? ' · Ie 1.5' : '')],
          ['External yards', '室外场地', F(sp.yard) + ' m²'], ['Substation', '变电站', F(sp.subst) + ' m²'], ['Site required', '所需用地', F(sp.siteNeed) + ' m² (' + F(sp.siteNeed / 10000, 2) + ' ha)']]) + why('floors') + why('raised') + '</div></div>';
  }
  function pFS(x) {
    var R = x.R, fs = R.fs, p = x.p;
    return '<div class="grid g2"><div class="card">' + ptitle('Fire protection', '消防') + kv([['Suppression strategy', '灭火策略', Lp(fs.suppression)], ['Gas zones (≤ 800 m²)', '气体分区（≤800 m²）', fs.gasZones ? fs.gasZones + ' · ≈ ' + F(fs.agentKg) + ' kg' : L('n/a', '不适用')],
      ['Aspirating smoke detectors', '吸气式烟雾探测器', F(fs.asd)], ['Pre-action zones', '预作用分区', Math.max(1, R.sp.halls)], ['Battery / BESS rooms', '电池/储能', (p.battery === 'LI' || R.el.bess) ? L('Off-gas detection, NFPA 855 separation', '逸出气体探测、NFPA 855间距') : L('VRLA ventilation', '铅酸通风')]]) + '</div>' +
      '<div class="card">' + ptitle('Security & monitoring', '安防与监控') + kv([['Security layers', '安防层级', fs.securityLayers], ['Access-controlled doors', '门禁门数', '≈ ' + F(fs.readers)], ['CCTV cameras', '摄像机', '≈ ' + F(fs.cams) + ' (≥ 90 ' + L('days', '天') + ')'], ['BMS points', 'BMS点位', '≈ ' + F(fs.bmsPts)], ['EPMS meters', 'EPMS表计', '≈ ' + F(fs.meters)]]) + '</div></div>' +
      eqLinks(['FP-01', 'FP-02', 'FP-03', 'FP-05', 'FP-07', 'FP-08', 'SC-01', 'SC-02', 'MC-01', 'MC-02', 'MC-03']);
  }
  function pBOQ(x) {
    var R = x.R;
    return '<div class="card">' + ptitle('Major & secondary equipment list (planning quantities)', '主要及次要设备清单（规划数量）', '<button class="btn small ghost" data-act="csv">' + ic('download') + 'CSV</button>') +
      '<div class="tblw"><table class="t"><thead><tr><th>' + L('Ref.', '编号') + '</th><th>' + L('Equipment', '设备') + '</th><th class="r">' + L('Qty', '数量') + '</th><th>' + L('Unit', '单位') + '</th><th>' + L('Rating', '规格') + '</th><th>' + L('Note', '备注') + '</th></tr></thead><tbody>' +
      R.boq.map(function (b) { return '<tr><td><button class="chip ind" style="cursor:pointer" data-act="eq" data-id="' + b.id + '">' + b.id + '</button></td><td>' + L(b.en, b.zh) + '</td><td class="r num"><b>' + F(b.qty) + '</b></td><td>' + esc(b.unit) + '</td><td>' + esc(b.rating) + '</td><td class="small muted">' + esc(b.note) + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
  }
  function exportBOQ() { var R = S.x.R; download(safeName(active().name) + '_equipment.csv', csv([['Ref', 'Equipment', '设备', 'Qty', 'Unit', 'Rating', 'Note']].concat(R.boq.map(function (b) { return [b.id, b.en, b.zh, Math.round(b.qty), b.unit, b.rating, b.note]; }))), 'text/csv;charset=utf-8'); }
  function exportFin() { var R = S.x.R; download(safeName(active().name) + '_cashflow_USD.csv', csv([['Year', 'Built kW', 'Used kW', 'CAPEX', 'Revenue', 'Energy', 'OPEX', 'EBITDA', 'Tax', 'Cash flow', 'Cumulative']].concat(R.fin.rows.map(function (r) { return [r.year, Math.round(r.built), Math.round(r.used), Math.round(r.capex), Math.round(r.rev), Math.round(r.energy), Math.round(r.opex), Math.round(r.ebitda), Math.round(r.tax), Math.round(r.cf), Math.round(r.cum)]; }))), 'text/csv;charset=utf-8'); }
  function pFin(x) {
    var R = x.R, cx = R.capex, op = R.opex, f = R.fin, p = x.p, cols = ['#e39b1b', '#0ea5c6', '#b45309', '#f0544f', '#3f3cbb', '#16a34a', '#a3a6c8', '#7c3aed'];
    var html = '<div class="grid g2"><div class="card">' + ptitle('Capital expenditure', '资本性支出') + '<div class="tblw"><table class="t"><thead><tr><th>' + L('Item', '项目') + '</th><th class="r">' + S.cur + '</th><th class="r">%</th></tr></thead><tbody>' +
      cx.breakdown.map(function (b) { return '<tr><td>' + L(b.en, b.zh) + '</td><td class="r num">' + money(b.usd) + '</td><td class="r num">' + F(b.share * 100) + '%</td></tr>'; }).join('') +
      '<tr class="grp"><td>' + L('Facility subtotal', '设施小计') + ' (' + money(cx.perMW * 1e6, 2) + '/MW)</td><td class="r num">' + money(cx.facility) + '</td><td class="r">100%</td></tr>' +
      '<tr><td>' + L('Utility connection & substation', '电网接入及变电站') + '</td><td class="r num">' + money(cx.utility) + '</td><td></td></tr><tr><td>' + L('Land', '土地') + ' (' + F(cx.landArea) + ' m²)</td><td class="r num">' + money(cx.land) + '</td><td></td></tr>' +
      '<tr><td>' + L('Contingency', '不可预见费') + ' (' + p.contingency + '%)</td><td class="r num">' + money(cx.cont) + '</td><td></td></tr>' + (cx.bess ? '<tr><td>BESS</td><td class="r num">' + money(cx.bess) + '</td><td></td></tr>' : '') +
      (cx.itHW ? '<tr><td>' + L('IT hardware', 'IT硬件') + '</td><td class="r num">' + money(cx.itHW) + '</td><td></td></tr>' : '') + '<tr class="grp"><td>' + L('Total CAPEX', '总投资') + '</td><td class="r num">' + money(cx.total) + '</td><td></td></tr></tbody></table></div>' + why('capexOverride') + '</div>' +
      '<div class="card">' + ptitle('Facility CAPEX by system', '按系统划分的设施投资') + C.donut(cx.breakdown.map(function (b, i) { return { label: Lt(b.en, b.zh), html: L(b.en.replace(/ \(.*\)/, ''), b.zh.replace(/（.*）/, '')), value: b.usd, color: cols[i] }; }), { center: money(cx.facility), centerSub: Lt('facility', '设施') }) + '</div></div>';
    html += '<div class="grid g2"><div class="card">' + ptitle('Operating cost (stabilised year)', '运营成本（稳定年）') + kv([['Energy', '电费', money(op.energy) + ' · ' + F(op.energyMWh) + ' MWh'], ['Maintenance', '维护', money(op.maint)], ['Staff (' + R.staff.fte + ' FTE)', '人员（' + R.staff.fte + '人）', money(op.staff)],
      ['Insurance & property', '保险及物业', money(op.insurance)], ['Water', '水费', money(op.water)], ['Renewable certificates', '绿证', money(op.rec)], ['Other G&A', '其他管理费', money(op.other)]].concat(op.bessSave ? [['BESS peak-shaving saving', '储能削峰节省', money(op.bessSave)]] : []).concat([['Total OPEX', '运营成本合计', '<b>' + money(op.total) + '</b>']])) + '</div>' +
      '<div class="card">' + ptitle(p.revModel === 'lease' ? 'Investment returns (unlevered, after tax)' : 'Total cost of ownership', p.revModel === 'lease' ? '投资回报（无杠杆、税后）' : '总拥有成本') +
      (p.revModel === 'lease' ? kv([['IRR without / with exit', 'IRR（不含/含终值）', pct(f.irr) + ' / <b>' + pct(f.irrTV) + '</b>'], ['NPV @ ' + p.wacc + '% (with exit)', 'NPV@' + p.wacc + '%（含终值）', money(f.npvTV)], ['Exit value', '终值', money(f.tv) + ' (' + p.exitMult + '× EBITDA)'],
        ['Simple payback', '静态回收期', f.payback ? f.payback + ' ' + L('years', '年') : L('> analysis period', '>分析期')], ['Levelised cost (excl. power)', '平准化成本（不含电）', money(f.lcoc, 0) + '/kW·' + L('month', '月')], ['Lease price', '租价', money(p.price, 0) + '/kW·' + L('month', '月')]])
        : kv([['TCO present value', '总拥有成本现值', money(f.tcoPV)], ['Cost of ownership (all-in)', '全口径拥有成本', money(f.lcocAll, 0) + '/kW·' + L('month', '月')], ['Equivalent lease (PV)', '等效租赁（现值）', money(f.leaseAltPV)],
          ['Build vs. lease', '自建vs租赁', f.tcoPV < f.leaseAltPV ? '<span class="chip green">' + L('Building is cheaper', '自建更经济') + '</span>' : '<span class="chip amber">' + L('Leasing is cheaper', '租赁更经济') + '</span>']])) + why('price') + '</div></div>';
    html += '<div class="card">' + ptitle('Annual cash flow (bars) and cumulative (line)', '年度现金流（柱）与累计（线）', '<button class="btn small ghost" data-act="fincsv">' + ic('download') + 'CSV</button>') + C.cashflow(f.rows.map(function (r) { return { year: r.year, cf: r.cf * fxNow(), cum: r.cum * fxNow() }; }), { unit: S.cur + ' M' }) + '</div>';
    return html;
  }
  function pSched(x) {
    var R = x.R, st = R.staff;
    return '<div class="card">' + ptitle('Indicative programme to Ready-for-Service (phase 1)', '至第一期投产的参考进度') + C.gantt(R.sched.tasks.map(function (t) { return { text: Lt(t.en, t.zh), s: t.s, d: t.d, c: t.c }; }), R.sched.total) + '</div>' +
      '<div class="grid g2"><div class="card">' + ptitle('Milestones', '里程碑') + '<div class="tblw"><table class="t"><thead><tr><th>' + L('Activity', '活动') + '</th><th class="r">' + L('Start', '开始') + '</th><th class="r">' + L('Duration', '工期') + '</th></tr></thead><tbody>' +
      R.sched.tasks.map(function (t) { return '<tr><td>' + L(t.en, t.zh) + '</td><td class="r">M' + t.s + '</td><td class="r">' + t.d + ' ' + L('mo', '月') + '</td></tr>'; }).join('') + '</tbody></table></div></div>' +
      '<div class="card">' + ptitle('Operations staffing (24/7)', '运营人员配置（7×24）') + C.stackBar([{ label: 'F', html: L('Facility engineers', '设施工程师'), value: st.fac, color: '#3f3cbb' }, { label: 'S', html: L('Security', '安保'), value: st.sec, color: '#7c3aed' }, { label: 'N', html: L('NOC', 'NOC'), value: st.noc, color: '#0ea5c6' }, { label: 'M', html: L('Management', '管理'), value: st.mgmt, color: '#f2a93b' }], { dec: 1, h: 34, unit: ' FTE' }) +
      '<div style="margin-top:10px" class="small">' + L('A 24/7 post needs ≈ 5.2 FTE. Staff cost basis: ', '每个7×24岗位约需5.2人。人员成本依据：') + Lp(x.why.staffCost) + '</div></div></div>';
  }
  function pRisk(x) { return '<div class="card">' + ptitle('Risk register', '风险登记册') + x.R.risks.map(riskRow).join('') + '</div>'; }
  var AREA = { DESIGN: ['Design', '设计'], ELEC: ['Electrical', '电气'], MECH: ['Mechanical', '暖通'], FIRE: ['Fire', '消防'], IT: ['IT & cabling', 'IT与布线'], ENERGY: ['Energy', '能效'], OPS: ['Operations', '运营'], CIVIL: ['Civil', '土建'], PERMIT: ['Permits', '许可'], POLICY: ['Policy', '政策'] };
  var REGN = { INT: ['International', '国际'], US: ['USA', '美国'], EU: ['Europe', '欧洲'], CN: ['China', '中国'], ID: ['Indonesia', '印度尼西亚'], SG: ['Singapore', '新加坡'] };
  function pStd(x) {
    var R = x.R, permits = [
      ['OSS-RBA business licence (PP 28/2025): NIB + standard certificate, KBLI 2025 code 63102', 'OSS-RBA经营许可（PP 28/2025）：NIB+标准证书，KBLI 2025代码63102'],
      ['Spatial conformity KKPR / PKKPR for the site', '场地空间用途符合性KKPR/PKKPR'], ['Environmental approval: AMDAL or UKL-UPL (PP 22/2021)', '环境审批：AMDAL或UKL-UPL（PP 22/2021）'],
      ['Building approval PBG and certificate SLF (PP 16/2021)', '建筑审批PBG及使用证书SLF（PP 16/2021）'], ['PLN connection agreement & SLO; captive power licence if on-site generation exceeds limits', 'PLN接入协议及SLO；现场发电超限时办理自备电力许可'],
      ['PSE registration (Permenkomdigi 5/2025); personal data protection (UU 27/2022)', 'PSE登记（Permenkomdigi 5/2025）；个人数据保护（UU 27/2022）'], ['Fire safety approval (Permen PU 26/2008, local Damkar), K3 electrical (Permenaker 12/2015)', '消防审批（Permen PU 26/2008、地方消防局），电气K3（Permenaker 12/2015）'],
      ['Groundwater / surface-water permits if abstracting water; genset emission compliance', '如取用地下/地表水需办理许可；发电机排放合规']];
    return '<div class="card">' + ptitle('Indonesian permits & approvals checklist', '印尼许可与审批清单') + permits.map(function (pz) { return '<div class="req"><span class="tag" style="background:#b45309">✓</span><div>' + L(pz[0], pz[1]) + '</div></div>'; }).join('') + '</div>' +
      '<div class="card">' + ptitle('Applicable codes, standards & regulations', '适用规范、标准与法规') + '<div class="tblw"><table class="t"><thead><tr><th>' + L('Code', '规范') + '</th><th>' + L('Region', '地区') + '</th><th>' + L('Scope', '范围') + '</th></tr></thead><tbody>' +
      R.standards.sort(function (a, b) { return (a.r === 'ID' ? 0 : 1) - (b.r === 'ID' ? 0 : 1); }).map(function (s) { return '<tr><td><b>' + esc(s.c) + '</b></td><td class="nowrap">' + L(REGN[s.r][0], REGN[s.r][1]) + '</td><td>' + L(s.en, s.zh) + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
  }
  function pReg(x) {
    var p = x.p, defs = { tier: { en: 'Resilience target (Uptime Tier)', zh: '韧性目标（Uptime等级）' } };
    STEPS.forEach(function (st) { st.f.forEach(function (f) { if (f.en) defs[f.k] = f; }); });
    var rows = P.AUTO.filter(function (k) { return x.why[k]; }).map(function (k) {
      var f = defs[k], name = f ? L(f.en, f.zh) : esc(k), ovd = p.ov && p.ov[k], show = showVal;
      return '<tr' + (ovd ? ' class="cur"' : '') + '><td><b>' + name + '</b></td><td>' + show(x.prop[k]) + '</td><td>' + (ovd ? '<span class="badge man">' + show(p[k]) + '</span>' : '<span class="badge auto">' + L('as proposed', '采用建议') + '</span>') + '</td><td class="small">' + Lp(x.why[k]) + '</td></tr>';
    }).join('');
    return '<div class="card">' + ptitle('Parameter register — proposals, overrides and basis', '参数登记——建议值、修改及依据') + '<div class="tblw"><table class="t"><thead><tr><th>' + L('Parameter', '参数') + '</th><th>' + L('Proposed', '建议值') + '</th><th>' + L('Used', '采用值') + '</th><th>' + L('Basis', '依据') + '</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  }

  /* ========================================================= REFERENCES */
  function refMini(r) {
    var mw = r.kind === 'arch' ? (r.input.itMW || 1) : r.mw;
    return '<div class="refcard" data-act="ref" data-id="' + r.id + '"><div class="meta"><span class="chip ' + (r.kind === 'arch' ? 'ind' : 'cyan') + '">' + (r.kind === 'arch' ? L('Benchmark design', '基准设计') : L('Real project', '真实项目')) + '</span>' + (mw ? '<span class="chip">' + F(mw, mw < 1 ? 2 : 0) + ' MW</span>' : '') + '</div><h4>' + L(r.en, r.zh) + '</h4><div class="facts">' + Lp(r.loc) + '</div></div>';
  }
  function renderRefs() {
    var f = S.ref, q = f.q.toLowerCase();
    var list = DB.references.filter(function (r) { if (f.kind !== 'all' && r.kind !== f.kind && !(f.kind === 'id' && r.kind === 'real' && r.country === 'ID')) return false; if (f.kind === 'id' && !(r.kind === 'real' && r.country === 'ID')) return false; if (f.type !== 'all' && r.type !== f.type) return false;
      if (q && (r.en + r.zh + (r.loc || []).join(' ') + JSON.stringify(r.facts || r.d)).toLowerCase().indexOf(q) < 0) return false; return true; });
    var html = '<h2 class="sec">' + L('Reference project database', '参考项目数据库') + '</h2><div class="sec-sub">' + L('Benchmark designs in Indonesian locations carry complete planning & feasibility data; real projects show publicly reported facts with sources.', '位于印尼地点的基准设计包含完整的规划与可研数据；真实项目展示公开报道的信息及来源。') + '</div>' +
      '<div class="filters"><input class="search" id="refQ" placeholder="' + esc(Lt('Search projects, locations, features…', '搜索项目、地点、特征…')) + '" value="' + esc(f.q) + '">' +
      '<select class="fsel" id="refKind">' + [['all', 'All', '全部'], ['arch', 'Benchmark designs', '基准设计'], ['id', 'Real projects — Indonesia', '真实项目——印尼'], ['real', 'Real projects — all', '真实项目——全部']].map(function (o) { return '<option value="' + o[0] + '"' + (f.kind === o[0] ? ' selected' : '') + '>' + esc(Lt(o[1], o[2])) + '</option>'; }).join('') + '</select>' +
      '<select class="fsel" id="refType"><option value="all">' + esc(Lt('All types', '全部类型')) + '</option>' + DB.dcTypes.map(function (t) { return '<option value="' + t.id + '"' + (f.type === t.id ? ' selected' : '') + '>' + esc(Lt(t.en, t.zh)) + '</option>'; }).join('') + '</select></div>';
    var arch = list.filter(function (r) { return r.kind === 'arch'; }), real = list.filter(function (r) { return r.kind === 'real'; });
    if (arch.length) html += '<h3>' + L('Benchmark designs (Indonesia)', '基准设计（印尼）') + ' (' + arch.length + ')</h3><div class="card flat" style="padding:0;overflow:hidden"><div class="tblw"><table class="t"><thead><tr><th>' + L('Project', '项目') + '</th><th class="r">MW</th><th>Tier</th><th>' + L('Platform', '平台') + '</th><th class="r">' + L('Racks', '机柜') + '</th><th>' + L('Cooling', '制冷') + '</th><th class="r">PUE</th><th class="r">CAPEX</th><th class="r">USD M/MW</th><th class="r">' + L('Months', '月') + '</th><th class="r">IRR / TCO</th><th></th></tr></thead><tbody>' +
      arch.map(function (r) { var x = P.resolve(r.input), R = x.R; return '<tr><td style="cursor:pointer" data-act="ref" data-id="' + r.id + '"><b>' + L(r.en, r.zh) + '</b><div class="small muted">' + Lp(r.loc) + '</div></td><td class="r">' + F(R.cap.itMW, R.cap.itMW < 1 ? 2 : 0) + '</td><td>' + ['I', 'II', 'III', 'IV'][x.p.tier - 1] + '</td><td class="small">' + (R.cap.hdR ? L(R.hdP.en.split(' (')[0].split(' —')[0], R.hdP.zh.split('（')[0].split('——')[0]) : L(R.stdP.en.split(' (')[0], R.stdP.zh.split('（')[0])) + '</td><td class="r">' + F(R.cap.racks) + '</td><td class="small">' + L(R.cool.obj.en.replace(/ \(.*\)/, ''), R.cool.obj.zh.replace(/（.*）/, '')) + '</td><td class="r">' + F(R.eff.pue, 2) + '</td><td class="r">' + money(R.capex.total) + '</td><td class="r">' + F(R.capex.perMW, 1) + '</td><td class="r">' + R.sched.total + '</td><td class="r">' + (x.p.revModel === 'lease' ? pct(R.fin.irrTV) : money(R.fin.lcocAll, 0) + '/kW·mo') + '</td>' +
        '<td><button class="btn small ghost" data-loadref="' + r.id + '">' + ic('plus') + L('New project', '新建项目') + '</button></td></tr>'; }).join('') + '</tbody></table></div></div>';
    if (real.length) html += '<h3 style="margin-top:18px">' + L('Real-world projects (public information)', '真实项目（公开信息）') + ' (' + real.length + ')</h3><div class="grid g4">' + real.map(function (r) {
      return '<div class="refcard" data-act="ref" data-id="' + r.id + '"><div class="meta"><span class="chip cyan">' + esc(r.country) + '</span><span class="chip">' + L(find(DB.dcTypes, r.type).en || r.type, find(DB.dcTypes, r.type).zh) + '</span>' + (r.mw ? '<span class="chip amber">≈ ' + F(r.mw) + ' MW</span>' : '') + '</div><h4>' + L(r.en, r.zh) + '</h4><div class="facts">' + Lp(r.loc) + '<br>' + Lp(r.facts[0]) + '</div></div>'; }).join('') + '</div>';
    if (!list.length) html += '<div class="card">' + L('No matching projects.', '没有匹配的项目。') + '</div>';
    $('#view-refs').innerHTML = html;
  }
  function openRef(id) {
    var r = find(DB.references, id); if (!r.id) return;
    var body = '';
    if (r.kind === 'arch') {
      var x = P.resolve(r.input), R = x.R;
      body += '<p>' + Lp(r.d) + '</p><div class="tiles" style="margin-top:12px">' + tile(F(R.cap.itMW, 2), 'MW', 'IT capacity', 'IT容量', F(R.cap.racks) + ' ' + L('racks', '机柜')) + tile(R.cap.tier.en.split(' — ')[0], '', 'Tier', '等级', R.cap.tier.avail + '%', '#17153f') +
        tile(F(R.eff.pue, 2), '', 'PUE', 'PUE', L(R.cool.obj.en, R.cool.obj.zh), '#0ea5c6') + tile(F(R.el.mva, 1), 'MVA', 'PLN demand', 'PLN需量', R.el.genTotal + ' × ' + R.el.genSize + ' kWe', '#f2a93b') +
        tile(money(R.capex.total), '', 'CAPEX', '投资', F(R.capex.perMW, 1) + ' USD M/MW', '#f0544f') + tile(R.sched.total, L('months', '月'), 'To RFS', '至投产', '', '#16a34a') + '</div>';
      body += '<h4>' + L('Key requirements', '关键要求') + '</h4>' + R.reqs.slice(0, 8).map(reqRow).join('');
      body += '<h4>' + L('Lessons & design notes', '经验与设计要点') + '</h4><ul style="padding-left:20px">' + r.lessons.map(function (l) { return '<li>' + L(l[0], l[1]) + '</li>'; }).join('') + '</ul>';
      body += '<div class="row" style="margin-top:14px"><button class="btn cyan" id="refLoad">' + ic('plus') + L('Create project from this benchmark', '以此基准新建项目') + '</button></div>';
    } else {
      body += '<div class="row" style="gap:6px;margin-bottom:10px"><span class="chip cyan">' + Lp(r.loc) + '</span>' + (r.status ? '<span class="chip">' + Lp(r.status) + '</span>' : '') + (r.mw ? '<span class="chip amber">≈ ' + F(r.mw) + ' MW</span>' : '') + '</div>';
      body += '<h4>' + L('Publicly reported facts', '公开报道信息') + '</h4><ul style="padding-left:20px">' + r.facts.map(function (f) { return '<li style="margin-bottom:6px">' + L(f[0], f[1]) + '</li>'; }).join('') + '</ul>';
      body += '<p class="small muted" style="margin-top:10px">' + L('Figures as announced by operators / trade press; they may change.', '数据来自运营商/行业媒体公告，可能变化。') + '</p>';
      body += '<div class="row" style="margin-top:12px"><a class="btn ghost" href="' + esc(r.src) + '" target="_blank" rel="noopener">' + ic('link') + L('Source', '来源') + '</a>' + (r.mw ? '<button class="btn cyan" id="refModel">' + ic('plus') + L('Model a similar project in Indonesia', '在印尼建模相似项目') + '</button>' : '') + '</div>';
    }
    $('#modalRoot').innerHTML = '<div class="modal" id="modal"><div class="modal-box"><div class="modal-head"><div><h3>' + L(r.en, r.zh) + '</h3></div><button class="xbtn" id="mClose">✕</button></div><div class="modal-body">' + body + '</div></div></div>';
    $('#mClose').onclick = closeModal; $('#modal').onclick = function (e) { if (e.target.id === 'modal') closeModal(); };
    if ($('#refLoad')) $('#refLoad').onclick = function () { closeModal(); newProject(JSON.parse(JSON.stringify(r.input))); show('assess'); toast(Lt('Project created', '已新建项目')); };
    if ($('#refModel')) $('#refModel').onclick = function () { closeModal(); newProject({ name: r.en + ' (model)', loc: r.country === 'ID' ? (/Batam/.test(r.en + r.loc[0]) ? 'KR-BTM' : 'JB-BKS') : 'JB-KRW', type: r.type, itMW: Math.min(r.mw, 1000) }); show('assess'); };
  }
  function closeModal() { $('#modalRoot').innerHTML = ''; }

  /* ========================================================== EQUIPMENT & RACKS */
  function renderEquip() {
    var tabs = '<div class="seg" style="max-width:520px;margin-bottom:14px"><button class="' + (S.eqTab === 'eq' ? 'on' : '') + '" data-eqtab="eq">' + L('Equipment & TPG', '设备与TPG') + '</button><button class="' + (S.eqTab === 'plat' ? 'on' : '') + '" data-eqtab="plat">' + L('IT platforms & cabinets', 'IT平台与机柜') + '</button></div>';
    var head = '<h2 class="sec">' + L('Equipment, IT platforms & racks', '设备、IT平台与机柜') + '</h2><div class="sec-sub">' + L(DB.equipment.length + ' equipment items with specification clauses and TPG; ' + DB.platforms.length + ' IT rack platforms and ' + DB.cabinets.length + ' cabinet ranges.', DB.equipment.length + '项设备规范及TPG；' + DB.platforms.length + '种IT机柜平台及' + DB.cabinets.length + '类机柜。') + '</div>' + tabs;
    if (S.eqTab === 'plat') {
      $('#view-equip').innerHTML = head + '<div class="card" style="padding:0;overflow:hidden"><div class="tblw"><table class="t"><thead><tr><th>' + L('Platform', '平台') + '</th><th>' + L('Category', '类别') + '</th><th>' + L('Vendors', '厂商') + '</th><th class="r">kW ' + L('design', '设计') + '</th><th class="r">kW ' + L('peak', '峰值') + '</th><th>' + L('Cooling', '冷却') + '</th><th>' + L('Rack W×D · U', '机柜宽×深·U') + '</th><th class="r">kg</th><th class="r">GPU</th><th>' + L('Notes', '说明') + '</th></tr></thead><tbody>' +
        DB.platforms.map(function (pl) { return '<tr><td><b>' + L(pl.en, pl.zh) + '</b>' + (pl.provisional ? ' <span class="chip amber">' + L('provisional', '暂定') + '</span>' : '') + '</td><td>' + pl.cat + '</td><td class="small">' + esc(pl.vendor) + '</td><td class="r">' + pl.kw + '</td><td class="r">' + pl.kwPeak + '</td><td>' + pl.cool + (pl.liq ? ' ' + F(pl.liq * 100) + '%' : '') + '</td><td class="nowrap">' + pl.w + '×' + pl.d + ' · ' + pl.u + 'U</td><td class="r">' + F(pl.kg) + '</td><td class="r">' + (pl.gpu || '–') + '</td><td class="small">' + Lp(pl.note) + (pl.src ? ' <a href="' + esc(pl.src) + '" target="_blank" rel="noopener">↗</a>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div></div>' +
        '<div class="card" style="padding:0;overflow:hidden;margin-top:14px"><div class="tblw"><table class="t"><thead><tr><th>' + L('Cabinet range', '机柜系列') + '</th><th>' + L('Brand', '品牌') + '</th><th>' + L('Widths', '宽度') + '</th><th>' + L('Depths', '深度') + '</th><th>' + L('Heights', '高度') + '</th><th class="r">' + L('Static load', '静载') + '</th><th>' + L('Notes', '说明') + '</th></tr></thead><tbody>' +
        DB.cabinets.map(function (cb) { return '<tr><td><b>' + L(cb.en, cb.zh) + '</b></td><td>' + esc(cb.brand) + '</td><td>' + cb.w.join(' / ') + ' mm</td><td>' + cb.d.join(' / ') + ' mm</td><td>' + cb.u.join(' / ') + 'U</td><td class="r">' + F(cb.kg) + ' kg</td><td class="small">' + Lp(cb.note) + (cb.src ? ' <a href="' + esc(cb.src) + '" target="_blank" rel="noopener">↗</a>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
      return;
    }
    var f = S.eq, q = f.q.toLowerCase();
    var match = function (e) { return (!q || (e.id + e.en + e.zh + e.fn.join(' ') + e.std.join(' ')).toLowerCase().indexOf(q) >= 0) && (f.sys === 'all' || e.sys === f.sys); };
    var list = '<div class="liblist">' + DB.systems.map(function (s) { var items = DB.equipment.filter(function (e) { return e.sys === s.id && match(e); }); if (!items.length) return '';
      return '<div class="libgrp"><i style="background:' + s.color + '"></i>' + L(s.en, s.zh) + '</div>' + items.map(function (e) { return '<div class="libitem' + (e.id === f.sel ? ' on' : '') + '" data-eq="' + e.id + '"><span class="id">' + e.id + '</span><span>' + L(e.en, e.zh) + '</span></div>'; }).join(''); }).join('') + '</div>';
    var e = find(DB.equipment, f.sel); if (!e.id) e = DB.equipment[0];
    var s = find(DB.systems, e.sys), n = 0;
    var detail = '<div><div class="card"><div class="row" style="align-items:flex-start;gap:14px"><div class="ficon" style="background:' + s.color + '">' + ic(SYS_IC[e.sys]) + '</div><div style="flex:1"><div class="small muted">' + e.id + ' · ' + L(s.en, s.zh) + ' · ' + (e.cls === 'M' ? '<span class="chip coral">' + L('Major', '主要设备') + '</span>' : '<span class="chip">' + L('Secondary', '次要设备') + '</span>') + '</div><h3 style="font-size:1.2rem;margin-top:4px">' + L(e.en, e.zh) + '</h3></div><button class="btn small ghost" id="tpgCsv">' + ic('download') + 'TPG CSV</button></div>' +
      '<h4>' + L('Function', '功能') + '</h4><div>' + Lp(e.fn) + '</div><h4>' + L('Typical ratings', '典型规格') + '</h4><div>' + Lp(e.ty) + '</div><h4>' + L('Technical requirements', '技术要求') + '</h4>' + e.s.map(function (c, i) { return '<div class="clause"><span class="no">' + (i + 1) + '</span><div>' + L(c[0], c[1]) + '</div></div>'; }).join('') +
      '<h4>' + L('Applicable standards', '适用标准') + '</h4><div class="row" style="gap:6px">' + e.std.map(function (x) { return '<span class="chip ind">' + esc(x) + '</span>'; }).join('') + '</div>' + (e.t ? '<h4>' + L('Inspection & testing', '检验与试验') + '</h4><ul style="padding-left:20px">' + e.t.map(function (x) { return '<li>' + L(x[0], x[1]) + '</li>'; }).join('') + '</ul>' : '') + '</div>' +
      '<div class="card"><h3>' + L('Technical Particulars & Guarantees — TPG-' + e.id, '技术参数保证表——TPG-' + e.id) + '</h3><div class="tblw"><table class="t"><thead><tr><th>' + L('No.', '序号') + '</th><th>' + L('Description', '描述') + '</th><th>' + L('Unit', '单位') + '</th><th>' + L('Required', '要求值') + '</th><th>' + L('Guaranteed', '保证值') + '</th></tr></thead><tbody>' +
      e.tpg.map(function (r) { if (r.g) return '<tr class="grp"><td colspan="5">' + L(r.g[0], r.g[1]) + '</td></tr>'; n++; return '<tr><td>' + n + '</td><td>' + L(r[0], r[1]) + '</td><td class="nowrap">' + esc(r[2]) + '</td><td class="req-col">' + esc(r[3]) + '</td><td class="bid-col"></td></tr>'; }).join('') + '</tbody></table></div></div></div>';
    $('#view-equip').innerHTML = head + '<div class="filters"><input class="search" id="eqQ" placeholder="' + esc(Lt('Search equipment or standard (e.g. UPS, BESS, IEC 62040)…', '搜索设备或标准（如UPS、储能、IEC 62040）…')) + '" value="' + esc(f.q) + '"><select class="fsel" id="eqSys"><option value="all">' + esc(Lt('All systems', '全部系统')) + '</option>' +
      DB.systems.map(function (x) { return '<option value="' + x.id + '"' + (f.sys === x.id ? ' selected' : '') + '>' + esc(Lt(x.en, x.zh)) + '</option>'; }).join('') + '</select></div><div class="lib">' + list + detail + '</div>';
    var cb = $('#tpgCsv'); if (cb) cb.onclick = function () { var k = 0; download('TPG-' + e.id + '.csv', csv([['No', 'Description', '描述', 'Unit', 'Required', 'Guaranteed', 'Remarks']].concat(e.tpg.map(function (r) { return r.g ? ['', r.g[0], r.g[1], '', '', '', ''] : [++k, r[0], r[1], r[2], r[3], '', '']; }))), 'text/csv;charset=utf-8'); };
  }

  /* ========================================================== KNOWLEDGE */
  function kSection(id, en, zh, inner) { return '<div class="card" id="k-' + id + '"><h3 style="font-size:1.12rem">' + L(en, zh) + '</h3>' + inner + '</div>'; }
  function chainSVG(items, colors) {
    var W = 900, bw = (W - 20) / items.length - 18, H = 120, zh = I18N.lang() === 'zh', s = '<svg class="diagram" viewBox="0 0 ' + W + ' ' + H + '"><defs><marker id="ak" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#5d6280"/></marker></defs>';
    items.forEach(function (it, i) { var x = 10 + i * (bw + 18); s += '<rect x="' + x + '" y="20" width="' + bw + '" height="62" rx="10" fill="' + colors[i % colors.length] + '"/><text x="' + (x + bw / 2) + '" y="55" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">' + esc(zh ? it[1] : it[0]) + '</text>';
      if (it[2]) s += '<text x="' + (x + bw / 2) + '" y="104" text-anchor="middle" font-size="10.5" fill="#5d6280">' + esc(it[2]) + '</text>';
      if (i < items.length - 1) s += '<line x1="' + (x + bw + 1) + '" y1="51" x2="' + (x + bw + 16) + '" y2="51" stroke="#5d6280" stroke-width="2" marker-end="url(#ak)"/>'; });
    return s + '</svg>';
  }
  function renderKnow() {
    var toc = [['docs', 'Companion documents', '配套文件'], ['what', 'What is a data center', '什么是数据中心'], ['types', 'Types & sizes', '类型与规模'], ['tiers', 'Tiers & redundancy', '等级与冗余'], ['spaces', 'Spaces', '功能区'], ['power', 'Power chain', '供电链'],
               ['cool', 'Cooling', '制冷'], ['id', 'Indonesia context', '印尼背景'], ['life', 'Project lifecycle', '项目生命周期'], ['cx', 'Commissioning', '调试'], ['feas', 'Feasibility checklist', '可行性清单']];
    var html = '<h2 class="sec">' + L('Knowledge base', '知识库') + '</h2><div class="sec-sub">' + L('Essentials of data center design and delivery, with the companion presentation and technical specification.', '数据中心设计与交付要点，附配套演示文稿及技术规范书。') + '</div>' +
      '<div class="row" style="gap:6px;margin-bottom:14px">' + toc.map(function (t) { return '<a class="chip ind" style="text-decoration:none" href="#k-' + t[0] + '" data-anchor="k-' + t[0] + '">' + L(t[1], t[2]) + '</a>'; }).join('') + '</div>';
    html += kSection('docs', 'Companion knowledge documents', '配套知识文件', '<div class="grid g2"><div class="docbox"><div class="ficon" style="background:#f0544f">' + ic('file') + '</div><div style="flex:1"><h4 style="margin-top:0">' + L('Data Center Knowledge Base — presentation', '数据中心知识库——演示文稿') + '</h4><div class="small muted">' + L('49 bilingual slides: types, tiers, spaces, power, cooling, IT, safety, lifecycle, cost.', '49页中英双语：类型、等级、功能区、电力、制冷、IT、安全、生命周期、投资。') + '</div><a class="btn small" style="margin-top:8px" href="downloads/Data%20Center%20Knowledge%20Base%20(EN-ZH).pptx" download>' + ic('download') + 'PPTX</a></div></div>' +
      '<div class="docbox"><div class="ficon" style="background:#3f3cbb">' + ic('file') + '</div><div style="flex:1"><h4 style="margin-top:0">' + L('Technical Specification & TPG', '技术规范书及技术参数保证表') + '</h4><div class="small muted">' + L('Bilingual specification with ' + DB.equipment.length + ' equipment sections and TPG schedules.', '中英双语规范，含' + DB.equipment.length + '个设备章节及TPG表。') + '</div><a class="btn small" style="margin-top:8px" href="downloads/Data%20Center%20Technical%20Specification%20%26%20TPG%20(EN-ZH).docx" download>' + ic('download') + 'DOCX</a></div></div></div>');
    html += kSection('what', 'What is a data center?', '什么是数据中心？', '<p>' + L('A data center is a purpose-built facility that houses IT equipment (servers, storage, network) and provides everything needed to run it continuously: conditioned power, cooling, connectivity, physical security and 24/7 operations. IT load (MW) is the basic unit of size; nearly every watt becomes heat.', '数据中心是容纳IT设备（服务器、存储、网络）的专用设施，并提供其持续运行所需的一切：稳定电力、制冷、网络连接、物理安全及7×24运维。IT负载（MW）是规模的基本单位；几乎每一瓦都变成热量。') + '</p>' +
      chainSVG([['Utility (PLN)', '市电（PLN）', '20 / 150 kV'], ['Power chain', '供电链', 'TX · UPS · GEN'], ['IT racks', 'IT机柜', 'kW → heat'], ['Cooling', '制冷', 'CRAH · CDU · chiller'], ['Atmosphere', '大气', 'tower / dry cooler']], ['#f2a93b', '#e39b1b', '#3f3cbb', '#0ea5c6', '#0b7f99']));
    html += kSection('types', 'Types of data centers and size classes', '数据中心类型与规模等级', '<div class="grid g4">' + DB.dcTypes.map(function (t) { return '<div class="card flat" style="margin:0"><h4 style="margin-top:0">' + L(t.en, t.zh) + '</h4><div class="small muted">' + Lp(t.d) + '</div><div class="row" style="margin-top:8px;gap:6px"><span class="chip cyan">' + t.dens[0] + '–' + t.dens[1] + ' kW/rack</span></div></div>'; }).join('') + '</div>' +
      '<div class="tblw" style="margin-top:14px"><table class="t"><thead><tr><th>' + L('Size class', '规模等级') + '</th><th>' + L('IT load', 'IT负载') + '</th><th>' + L('Racks (5–10 kW)', '机柜（5–10 kW）') + '</th></tr></thead><tbody>' + DB.sizeClasses.map(function (s, i) { var lo = i ? DB.sizeClasses[i - 1].max : 0; return '<tr><td>' + L(s.en, s.zh) + '</td><td>' + (s.max > 1e6 ? '> ' + lo + ' MW' : lo + ' – ' + s.max + ' MW') + '</td><td>' + esc(s.racks) + '</td></tr>'; }).join('') + '</tbody></table></div>');
    html += kSection('tiers', 'Tier classification & redundancy', '等级分类与冗余', '<div class="tblw"><table class="t"><thead><tr><th>Uptime</th><th>' + L('Redundancy', '冗余') + '</th><th>' + L('Concurrently maintainable', '可同时维护') + '</th><th>' + L('Fault tolerant', '容错') + '</th><th>' + L('Availability', '可用性') + '</th><th>TIA-942</th><th>SNI 8799</th><th>GB 50174</th><th>EN 50600</th></tr></thead><tbody>' +
      DB.tiers.map(function (t) { return '<tr><td><b>' + L(t.en, t.zh) + '</b><div class="small muted">' + Lp(t.fit) + '</div></td><td>' + t.red + '</td><td>' + (t.cm ? '✔' : '–') + '</td><td>' + (t.ft ? '✔' : '–') + '</td><td>' + t.avail + '%</td><td>' + t.tia + '</td><td>' + t.sni + '</td><td>' + t.gb + '</td><td>' + t.en50600 + '</td></tr>'; }).join('') + '</tbody></table></div>');
    html += kSection('spaces', 'Functional spaces', '功能区', '<div class="kgrid">' + DB.spaces.map(function (z) { return '<div class="zone"><div class="zh-h" style="background:' + z.color + '">' + L(z.en, z.zh) + '</div><div class="small" style="padding:10px 14px 0;color:var(--muted)">' + Lp(z.d) + '</div><ul>' + z.items.map(function (i) { return '<li>' + L(i[0], i[1]) + '</li>'; }).join('') + '</ul></div>'; }).join('') + '</div>');
    html += kSection('power', 'Critical power chain & energy storage', '关键供电链与储能', chainSVG([['PLN feeds', 'PLN进线', '20 / 150 kV'], ['MV switchgear', '中压开关柜', 'IEC 62271'], ['Transformers', '变压器', '2,500 kVA'], ['LV + generators', '低压+发电机', 'ATS / paralleling'], ['UPS + batteries', 'UPS+电池', '5–10 min'], ['Busway / PDU', '母线/PDU', 'A + B'], ['Rack power', '机柜供电', '7–190 kW']], ['#f2a93b', '#e39b1b', '#3f3cbb', '#7c3aed', '#7c3aed', '#0ea5c6', '#17153f']) +
      '<div class="grid g3" style="margin-top:12px">' + ['EL-04', 'EL-09', 'EL-23'].map(function (id) { var e = find(DB.equipment, id); return '<div class="small"><b>' + L(e.en, e.zh) + '</b><div class="muted">' + Lp(e.ty) + '</div></div>'; }).join('') + '</div>');
    html += kSection('cool', 'Cooling technologies, rack density and thermal envelope', '制冷技术、机柜密度与温度范围', '<div class="grid g2"><div><h4>' + L('Cooling technology by rack density (kW/rack)', '按机柜密度的制冷技术（kW/柜）') + '</h4>' + C.ranges([{ label: Lt('DX CRAC', '直膨精密空调'), a: 3, b: 10, color: '#8b8fbf' }, { label: Lt('CRAH / fan wall', '精密空调/风墙'), a: 5, b: 25, color: '#3f3cbb' }, { label: Lt('In-row', '列间空调'), a: 15, b: 40, color: '#7c3aed' }, { label: Lt('Rear-door HX', '背板换热'), a: 20, b: 75, color: '#0ea5c6' }, { label: Lt('Direct-to-chip', '冷板液冷'), a: 40, b: 200, color: '#f0544f' }, { label: Lt('Immersion', '浸没式'), a: 50, b: 200, color: '#f2a93b' }], 0, 200, '') + '</div>' +
      '<div><h4>' + L('ASHRAE inlet temperature classes (°C)', 'ASHRAE进风温度等级（°C）') + '</h4>' + C.ranges([{ label: Lt('Recommended', '推荐'), a: 18, b: 27, color: '#16a34a' }, { label: 'A1', a: 15, b: 32, color: '#0ea5c6' }, { label: 'A2', a: 10, b: 35, color: '#3f3cbb' }, { label: 'A3', a: 5, b: 40, color: '#7c3aed' }, { label: 'A4', a: 5, b: 45, color: '#8b8fbf' }, { label: Lt('H1 (high density)', 'H1（高密度）'), a: 15, b: 25, color: '#f0544f' }], 0, 50, '°') + '</div></div>');
    html += kSection('id', 'Indonesia context', '印尼背景', '<div class="grid g2"><div><h4>' + L('PLN grid systems', 'PLN电网') + '</h4><ul style="padding-left:20px">' + Object.keys(DB.idGrids).map(function (k) { var g0 = DB.idGrids[k]; return '<li><b>' + L(g0.en, g0.zh) + '</b> — ' + Lp(g0.d) + '</li>'; }).join('') + '</ul></div>' +
      '<div><h4>' + L('PLN tariffs (Q4 2026)', 'PLN电价（2026年第四季度）') + '</h4><div class="tblw"><table class="t"><thead><tr><th>' + L('Class', '类别') + '</th><th class="r">LWBP Rp/kWh</th><th class="r">' + L('24/7 blended', '24/7加权') + '</th></tr></thead><tbody>' + DB.idTariffs.map(function (t) { return '<tr><td>' + L(t.en, t.zh) + '</td><td class="r">' + F(t.lwbp, 2) + '</td><td class="r">' + F(t.eff, 1) + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<p class="small muted" style="margin-top:6px">' + L('PLN REC ≈ Rp' + F(DB.idRec) + '/MWh; exchange rate ≈ Rp' + F(DB.idFx) + '/USD.', 'PLN绿证约每MWh ' + F(DB.idRec) + '印尼盾；汇率约' + F(DB.idFx) + '印尼盾/美元。') + '</p></div></div>');
    html += kSection('life', 'Project lifecycle', '项目全生命周期', '<div class="timeline">' + DB.lifecycle.map(function (l, i) { return '<div class="tl"><div class="k" style="background:' + ['#3f3cbb', '#7c3aed', '#0ea5c6', '#3f3cbb', '#7c3aed', '#f2a93b', '#f0544f', '#16a34a', '#0ea5c6', '#17153f'][i] + '">' + (i + 1) + '</div><b>' + L(l.en, l.zh) + '</b><div class="small muted" style="margin-top:4px">' + Lp(l.d) + '</div></div>'; }).join('') + '</div>');
    html += kSection('cx', 'Commissioning levels L1–L5', '调试等级L1–L5', '<div class="tblw"><table class="t"><thead><tr><th>' + L('Level', '等级') + '</th><th>' + L('Name', '名称') + '</th><th>' + L('Description', '说明') + '</th></tr></thead><tbody>' + DB.cxLevels.map(function (c) { return '<tr><td><b>' + c[0] + '</b></td><td>' + L(c[1], c[2]) + '</td><td>' + L(c[3], c[4]) + '</td></tr>'; }).join('') + '</tbody></table></div>');
    html += kSection('feas', 'Feasibility checklist', '可行性检查清单', '<div class="grid g3">' + [['Power availability, cost & PLN timeline', '电力可得性、成本与PLN时间'], ['Fibre routes, carriers & latency', '光纤路由、运营商与时延'], ['Natural hazards (flood, seismic)', '自然灾害（洪水、地震）'], ['Land, KKPR zoning, permits & setbacks', '土地、KKPR规划、许可及退界'], ['Water availability & cooling strategy', '水资源及制冷策略'], ['Climate: design wet-bulb', '气候：设计湿球温度'], ['Regulation: PDP, PSE, sector rules, incentives', '法规：个人数据保护、PSE、行业规定、激励'], ['Market demand, pricing & anchor tenants', '市场需求、定价及锚定租户'], ['Skilled workforce & O&M partners', '技术人员及运维伙伴'], ['CAPEX, OPEX, IRR & financing', '投资、运营成本、IRR及融资'], ['Sustainability: RECs, solar, PUE/WUE', '可持续：绿证、光伏、PUE/WUE'], ['Schedule & long-lead equipment', '进度及长周期设备']].map(function (x) { return '<div class="req"><span class="tag" style="background:#3f3cbb">✓</span><div>' + L(x[0], x[1]) + '</div></div>'; }).join('') + '</div>');
    $('#view-know').innerHTML = html;
  }

  /* ========================================================== STANDARDS, GLOSSARY, ABOUT */
  function renderStd() {
    var f = S.std, q = f.q.toLowerCase();
    var list = DB.standards.filter(function (s) { return (f.r === 'all' || s.r === f.r) && (f.a === 'all' || s.a === f.a) && (!q || (s.c + s.en + s.zh).toLowerCase().indexOf(q) >= 0); }).sort(function (a, b) { return (a.r === 'ID' ? 0 : 1) - (b.r === 'ID' ? 0 : 1); });
    $('#view-std').innerHTML = '<h2 class="sec">' + L('Standards & regulations', '标准与法规') + '</h2><div class="sec-sub">' + L('Indonesian regulations and national standards first, then international, US, European, Chinese and Singapore references. Always verify the latest editions.', '优先列出印尼法规及国家标准，其次为国际、美国、欧洲、中国及新加坡参考。请始终核实最新版本。') + '</div>' +
      '<div class="filters"><input class="search" id="stdQ" placeholder="' + esc(Lt('Search code or topic…', '搜索规范或主题…')) + '" value="' + esc(f.q) + '"><select class="fsel" id="stdR"><option value="all">' + esc(Lt('All regions', '全部地区')) + '</option>' + Object.keys(REGN).map(function (k) { return '<option value="' + k + '"' + (f.r === k ? ' selected' : '') + '>' + esc(Lt(REGN[k][0], REGN[k][1])) + '</option>'; }).join('') + '</select>' +
      '<select class="fsel" id="stdA"><option value="all">' + esc(Lt('All disciplines', '全部专业')) + '</option>' + Object.keys(AREA).map(function (k) { return '<option value="' + k + '"' + (f.a === k ? ' selected' : '') + '>' + esc(Lt(AREA[k][0], AREA[k][1])) + '</option>'; }).join('') + '</select></div>' +
      '<div class="card" style="padding:0;overflow:hidden"><div class="tblw"><table class="t"><thead><tr><th>' + L('Code / regulation', '规范/法规') + '</th><th>' + L('Region', '地区') + '</th><th>' + L('Discipline', '专业') + '</th><th>' + L('Scope', '范围') + '</th></tr></thead><tbody>' +
      list.map(function (s) { return '<tr><td><b>' + esc(s.c) + '</b></td><td class="nowrap">' + L(REGN[s.r][0], REGN[s.r][1]) + '</td><td class="nowrap">' + L(AREA[s.a][0], AREA[s.a][1]) + '</td><td>' + L(s.en, s.zh) + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
  }
  function renderGloss() {
    var q = S.gl.q.toLowerCase(), list = DB.glossary.filter(function (g0) { return !q || g0.join(' ').toLowerCase().indexOf(q) >= 0; });
    $('#view-gloss').innerHTML = '<h2 class="sec">' + L('Glossary', '术语表') + '</h2><div class="sec-sub">' + L(DB.glossary.length + ' key terms with Chinese equivalents', DB.glossary.length + '个关键术语（含英文对照）') + '</div>' +
      '<div class="filters"><input class="search" id="glQ" placeholder="' + esc(Lt('Search term…', '搜索术语…')) + '" value="' + esc(S.gl.q) + '"></div><div class="card" style="padding:0;overflow:hidden"><div class="tblw"><table class="t"><thead><tr><th>' + L('Term', '术语') + '</th><th>' + L('Chinese', '中文') + '</th><th>' + L('Definition', '定义') + '</th></tr></thead><tbody>' +
      list.map(function (g0) { return '<tr><td><b>' + esc(g0[0]) + '</b></td><td>' + esc(g0[1]) + '</td><td>' + L(g0[2], g0[3]) + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
  }
  function renderAbout() {
    $('#view-about').innerHTML = '<h2 class="sec">' + L('About this tool', '关于本工具') + '</h2><div class="sec-sub">' + L('Purpose, method, data and limitations.', '目的、方法、数据与局限。') + '</div><div class="grid g2"><div class="card"><h3>' + L('Purpose', '目的') + '</h3><p>' + L('Helps owners, developers and engineers understand — at planning and feasibility stage — what a data center in a given Indonesian location, type and size requires, and produces a project proposal report.', '帮助业主、开发商及工程师在规划与可研阶段了解位于特定印尼地点、类型与规模的数据中心所需的一切，并生成项目建议书。') + '</p>' +
      '<h4>' + L('Method', '方法') + '</h4><ul style="padding-left:20px">' + [
        ['Proposal layer: location → climate, hazards, land, water, wages; type & IT load → IT platform mix, rack density, cabinet; criticality → Tier, fuel, UPS, battery, BESS; cooling chosen by a weighted decision matrix; commercial inputs from market references.', '建议层：地点→气候、灾害、土地、水、工资；类型与IT负载→IT平台组合、机柜功率、机柜；关键程度→等级、燃油、UPS、电池、储能；制冷由加权决策矩阵选定；商业参数来自市场参考。'],
        ['Engine: PUE from cooling technology and design wet-/dry-bulb; maximum demand, transformers, generators (0.27 L/kWh), UPS, batteries, BESS; chillers, towers, CRAH, CDU; space and site; CAPEX (Greater Jakarta USD 10.5 M/MW × logistics × Tier × scale × cooling); OPEX incl. PLN tariff and RECs; phased cash flow with IRR, NPV, TCO.', '引擎：按制冷技术及设计干/湿球计算PUE；最大需量、变压器、发电机（0.27 L/kWh）、UPS、电池、储能；冷机、冷却塔、精密空调、CDU；空间及场地；投资（大雅加达10.5百万美元/MW×物流×等级×规模×制冷）；运营成本含PLN电价及绿证；分期现金流IRR、NPV、TCO。'],
        ['Every proposal is shown with its basis and can be overridden; the parameter register documents what was proposed and what was used.', '每项建议均附依据并可修改；参数登记记录建议值与采用值。']
      ].map(function (x) { return '<li style="margin-bottom:6px">' + L(x[0], x[1]) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="card"><h3>' + L('Limitations & data', '局限与数据') + '</h3><p>' + L('Indicative results (±25–30%). Regional values (climate, land, water, wages, hazards) are planning-level and must be replaced by surveys, PLN studies and quotations. Real-project facts come from public sources and may change.', '结果为参考值（±25–30%）。地区数值（气候、土地、水、工资、灾害）为规划级，须以勘察、PLN研究及报价替换。真实项目信息来自公开来源，可能变化。') + '</p>' +
      '<h4>' + L('Key sources', '主要来源') + '</h4><ul style="padding-left:20px" class="small">' + [['PLN tariffs Q4 2026 (JournalArta)', 'https://journalarta.com/news/2026/10/06/tarif-listrik-pln-terbaru-oktober-2026/'], ['UMP 2026 (Bisnis.com)', 'https://ekonomi.bisnis.com/read/20260108/12/1942811/lengkap-ini-daftar-ump-2026-di-38-provinsi-versi-kemnaker'],
        ['HPE NVIDIA GB300 NVL72 documentation', 'https://www.hpe.com/us/en/collaterals/collateral.a50009244enw.html'], ['Uptime Institute Tier Standard', 'https://uptimeinstitute.com/'], ['ANSI/TIA-942-C', 'https://tiaonline.org/'], ['ASHRAE TC 9.9', 'https://www.ashrae.org/'], ['SNI 8799 — BSN', 'https://bsn.go.id/'], ['PLN REC sales (Kontan)', 'https://industri.kontan.co.id/news/pln-catat-penjualan-energi-hijau-tembus-1368-twh-pada-semester-i-2025']]
        .map(function (x) { return '<li><a href="' + x[1] + '" target="_blank" rel="noopener">' + esc(x[0]) + '</a></li>'; }).join('') + '</ul>' +
      '<h4>' + L('Data & privacy', '数据与隐私') + '</h4><p class="small">' + L('Everything runs in your browser. Projects are stored in this browser (localStorage); export the workspace to back up or share.', '所有计算均在浏览器中运行。项目存储于本浏览器（localStorage）；可导出工作区备份或分享。') + '</p><p class="small">v2.0 · 2026-10 · <a href="https://github.com/Alexandervsq/Data-Center-Project-Assessment" target="_blank" rel="noopener">GitHub</a> · docx.js & ExcelJS (MIT)</p></div></div>';
  }

  /* ========================================================== wiring */
  function renderAll() { renderHeader(); renderHome(); renderAssess(); renderRefs(); renderEquip(); renderKnow(); renderStd(); renderGloss(); renderAbout(); show(S.view); }
  document.addEventListener('click', function (ev) {
    var l = ev.target.closest('.lang'); if (l) { I18N.set(l.dataset.lang); renderAll(); return; }
    var t = ev.target.closest('.tab'); if (t) { show(t.dataset.view); return; }
    var go = ev.target.closest('[data-go]'); if (go) { show(go.dataset.go); return; }
    var anc = ev.target.closest('[data-anchor]'); if (anc) { ev.preventDefault(); var el = document.getElementById(anc.dataset.anchor); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 150, behavior: 'smooth' }); return; }
    var et = ev.target.closest('[data-eqtab]'); if (et) { S.eqTab = et.dataset.eqtab; renderEquip(); return; }
    var li = ev.target.closest('[data-eq]'); if (li) { S.eq.sel = li.dataset.eq; renderEquip(); window.scrollTo({ top: 0 }); return; }
    var lr = ev.target.closest('[data-loadref]'); if (lr) { var r = find(DB.references, lr.dataset.loadref); newProject(JSON.parse(JSON.stringify(r.input))); show('assess'); toast(Lt('Project created', '已新建项目')); return; }
    if (S.view !== 'assess') { var np = ev.target.closest('[data-act="newproj"]'); if (np) { newProject(); show('assess'); return; } var op = ev.target.closest('[data-open]'); if (op) { openProject(op.dataset.open); return; } }
    if (S.view === 'assess') { var np2 = ev.target.closest('[data-act="newproj"]'); if (np2) { newProject(); return; } }
    if (S.view === 'refs') { var rc = ev.target.closest('[data-act="ref"]'); if (rc) { openRef(rc.dataset.id); return; } }
    if (ev.target.id === 'menuBtn') $('#tabs').classList.toggle('open');
  });
  document.addEventListener('input', function (ev) {
    var id = ev.target.id, map = { refQ: ['ref', renderRefs], eqQ: ['eq', renderEquip], stdQ: ['std', renderStd], glQ: ['gl', renderGloss] };
    if (map[id]) { S[map[id][0]].q = ev.target.value; map[id][1](); var i1 = $('#' + id); i1.focus(); i1.setSelectionRange(i1.value.length, i1.value.length); }
  });
  document.addEventListener('change', function (ev) {
    var id = ev.target.id;
    if (id === 'refKind') { S.ref.kind = ev.target.value; renderRefs(); } if (id === 'refType') { S.ref.type = ev.target.value; renderRefs(); }
    if (id === 'eqSys') { S.eq.sys = ev.target.value; renderEquip(); } if (id === 'stdR') { S.std.r = ev.target.value; renderStd(); } if (id === 'stdA') { S.std.a = ev.target.value; renderStd(); }
  });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closeModal(); });
  window.addEventListener('hashchange', function () { var h = location.hash.replace('#', ''); if (h && document.getElementById('view-' + h)) show(h); });

  var h0 = location.hash.replace('#', ''); if (h0 && document.getElementById('view-' + h0)) S.view = h0;
  recompute(); bindAssess(); renderAll();
})();
