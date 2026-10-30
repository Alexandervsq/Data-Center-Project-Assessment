/* Technology cards — shared knowledge layer.
 * U  : unit texts keyed by unit (how it works, O&M, key formula, line for the design basis); the equipment record
 *      (function, ratings, requirements, standards, tests, TPG) is read from DCDB.equipment by the card engine.
 * CALC: step-by-step calculators; every constant comes from DCEngine.K so cards and assessment never diverge.
 * TH : theory items; IV: schematic inside views for detail panels. Text pairs are [English, 简体中文]. */
(function (g) {
  'use strict';
  var DB = g.DCDB, E = g.DCEngine, K = E.K, L = g.TC.lib, F = L.F, t = L.t;
  var R0 = function (c) { return c.R; };
  function roman(n) { return ['I', 'II', 'III', 'IV'][n - 1] || n; }
  function rp(rpVal) { return ['Rp ' + F(rpVal / 1e9, 1) + ' billion', 'Rp ' + F(rpVal / 1e8, 0) + ' 亿']; }
  function usd(v) { return v >= 1e9 ? 'USD ' + F(v / 1e9, 2) + ' B' : v >= 1e6 ? 'USD ' + F(v / 1e6, 1) + ' M' : 'USD ' + F(v / 1e3, 0) + ' k'; }
  function pick(list, v) { for (var i = 0; i < list.length; i++) if (list[i] >= v) return list[i]; return list[list.length - 1]; }
  function grid(c) { var gr = DB.idGrids[c.R.L.grid] || {}; return gr; }
  function relTxt(v) { return { high: ['high', '高'], med: ['medium', '中'], low: ['low', '低'] }[v] || [v, v]; }
  function bat(c) { return c.p.battery === 'LI' ? ['Li-ion (LFP)', '锂电（磷酸铁锂）'] : ['VRLA lead-acid', '阀控铅酸']; }
  function W2(en, zh) { return [en, zh]; }

  /* PLN connection options for the demand of the design (engine connection solution) and the resulting power chain */
  var AVT = { 0: ['not in this PLN system', '本电网无'], 1: ['in service', '已投运'], 2: ['limited / legacy', '有限/存量'], 3: ['planned (RUPTL)', '规划中（RUPTL）'] };
  function connTable(c) {
    var hv = c.R.el.hv, gr = DB.idGrids[c.R.L.grid] || {};
    var rows = hv.opts.map(function (o) {
      var st = o.intl ? ['international (not PLN)', '国际等级（非PLN）'] : AVT[o.avail], fit = o.asm.c === 'std' ? ['✓ standard', '✓ 标准方案'] : (o.asm.c === 'opt' ? ['△ possible / strategic', '△ 可行/战略方案'] : ['✗ not practical', '✗ 不可行']);
      var r = ['<b>' + L.te([o.en, o.zh]) + '</b>' + (o.rule ? ' <span class="tc-tag2">' + L.te(['recommended', '建议']) + '</span>' : ''), o.kv > 20 ? 'GIS ' + o.ur + ' kV' : '24 kV', F(o.lo) + '–' + F(o.hi) + ' MVA', F(o.circ), L.te(st), '<span title="' + L.e(L.t([o.asm.en, o.asm.zh])) + '">' + L.te(fit) + '</span>'];
      r.cur = o.sel; return r;
    });
    return '<div><h3>' + L.te(['Connection options for ' + F(c.R.el.mva, 1) + ' MVA — ' + gr.en, gr.zh + ' — ' + F(c.R.el.mva, 1) + ' MVA的接入方案']) + '</h3>' +
      L.ptable([['Voltage', '电压'], ['Switchgear', '开关设备'], ['Typical range', '典型范围'], ['Circuits', '回路'], ['In this grid', '本电网'], ['Assessment', '评估']], rows) +
      '<div class="tc-basisbox"><b>' + L.te(['Selected: ' + hv.name, '所选：' + hv.name]) + ' — ' + L.te(hv.asm.c === 'std' ? ['standard solution', '标准方案'] : (hv.asm.c === 'opt' ? ['possible with conditions', '有条件可行'] : ['not practical', '不可行'])) + '.</b> ' + L.te([hv.asm.en, hv.asm.zh]) + '</div>' +
      '<p class="tc-src">' + L.te(['Highlighted: the connection of this design. The typical range is guidance, not a limit: a 150 kV substation for a 10–30 MVA first phase is a common strategic choice for data-center campuses. Change the voltage, the fault level or the transformer rating in the calculator below — substation, transformers, 20 kV switchgear, tariff, cost, programme and the grid impact indicators follow. Planning view of the PLN network (RUPTL 2025–2034); confirm with PLN.', '高亮行：本设计的接入方式。典型范围为参考而非限值：数据中心园区首期10–30 MVA即自建150 kV变电站是常见的战略选择。可在下方计算器中修改电压、短路电流或主变容量——变电站、变压器、20 kV开关柜、电价、投资、工期及电网影响指标随之联动。PLN电网为规划层面判断（RUPTL 2025–2034），须与PLN确认。']) + '</p></div>';
  }
  /* PLN grid impact indicators of this design (Grid Code Permen ESDM 20/2020 limits; engine R.gimp) */
  var LLCT = { std: ['standard load (< 75 MW)', '常规负荷（<75 MW）'], large: ['large load (75–300 MW)', '大负荷（75–300 MW）'], vlarge: ['very large load (> 300 MW)', '超大负荷（>300 MW）'] };
  function gimpTable(c) {
    var gi = c.R.gimp; if (!gi) return '';
    function ok(b) { return b ? ' ✓' : ' ✗'; }
    var rows = [[L.te(['Short-circuit power · Isc/IL', '短路容量 · Isc/IL']), F(gi.ssc) + ' MVA · ' + F(gi.scr), L.te(gi.scr < 20 ? ['low ratio: strictest limits', '短路比低：限值最严'] : ['adequate', '满足'])],
      [L.te(['Harmonic current TDD (estimate / limit)', '谐波电流TDD（估算/限值）']), F(gi.tdd, 1) + ' % / ' + F(gi.tddLimit, 1) + ' %' + ok(gi.tdd <= gi.tddLimit), L.te(gi.ahf ? ['active harmonic filters on drives', '驱动负荷配有源滤波器'] : ['no filters needed by estimate', '估算无需滤波器'])],
      [L.te(['Voltage distortion THDv (estimate / limit)', '电压畸变THDv（估算/限值）']), F(gi.thdv, 2) + ' % / ' + gi.thdLim[1] + ' %' + ok(gi.thdv <= gi.thdLim[1]), L.te(['individual harmonic ≤ ' + gi.thdLim[0] + ' %', '单次谐波≤' + gi.thdLim[0] + '%'])],
      [L.te(['Voltage step from AI load swing', 'AI负荷波动电压阶跃']), F(gi.dvAi, 2) + ' %' + ok(gi.dvAi <= 2), L.te(['≤ 2 % repetitive, ≤ 3 % infrequent; flicker Pst ≤ ' + (gi.kv >= 66 ? '0.8' : '1.0'), '重复≤2%、偶发≤3%；闪变Pst≤' + (gi.kv >= 66 ? '0.8' : '1.0')])],
      [L.te(['Loss of the whole load', '全部负荷失去']), F(gi.dvLoss, 1) + ' %', L.te(['re-transfer in blocks ≤ ' + F(gi.blk3) + ' MVA; ' + LLCT[gi.llc][0], '分块回切每块≤' + F(gi.blk3) + ' MVA；' + LLCT[gi.llc][1]])],
      [L.te(['Power factor · voltage range', '功率因数 · 电压范围']), '≈ ' + F(gi.pfEst, 2), L.te(['0.9 lagging – 0.9 leading · ' + gi.vrange[0], '滞后0.9至超前0.9 · ' + gi.vrange[1]])],
      [L.te(['Fault clearing · studies', '故障切除 · 研究']), gi.clearMs ? '≤ ' + gi.clearMs + ' ms' : '20 kV OCR', L.te([gi.studies.length + ' studies, ≈ ' + gi.months + ' months', gi.studies.length + '项研究，约' + gi.months + '个月'])]];
    return '<div><h3>' + L.te(['PLN Grid Impact Study — indicators of this design', 'PLN电网影响研究——本设计指标']) + '</h3>' + L.ptable([['Check', '校核项'], ['This design', '本设计'], ['Grid Code / note', '电网规范/说明']], rows) +
      '<div class="tc-rel" style="margin-top:10px"><button type="button" data-tco="gimp">' + L.te(['Grid Impact Study: limits, studies and process', '电网影响研究：限值、研究与流程']) + ' →</button></div></div>';
  }
  function chainTable(c) {
    var el = c.R.el, h = el.hv, rows = [];
    rows.push([L.te(['PLN supply', 'PLN供电']), L.te([h.name + ' · ' + h.circ + ' circuit(s)', h.name + ' · ' + h.circ + '回']), F(el.mva, 1) + ' MVA']);
    if (h.gis) rows.push([L.te(['HV substation (GIS, IEC 62271-203)', '高压变电站（GIS，IEC 62271-203）']), L.te(h.scheme), h.ur + ' kV · ' + h.ik + ' kA · ' + F(h.busA) + ' A']);
    if (h.ibt) rows.push([L.te(['EHV/HV interbus transformers', '超高压/高压联络变压器']), h.ibt.ratio, h.ibt.total + ' × ' + h.ibt.mva + ' MVA']);
    rows.push([L.te(['Fault level at the connection point', '接入点短路水平']), L.te(['planning value, PLN confirms', '规划值，以PLN确认为准']), F(h.pccIk, 1) + ' kA · ' + F(h.ssc) + ' MVA']);
    if (h.ht) rows.push([L.te(['HV/MV transformers (IEC 60076)', '高压/中压主变压器（IEC 60076）']), h.ht.ratio + ' · uk ' + h.ht.uk + ' % · ONAN ' + h.ht.onan + ' / ONAF ' + h.ht.mva + ' MVA' + (h.ht.split ? L.te([' · split winding', ' · 分裂绕组']) : ''), h.ht.total + ' × ' + h.ht.mva + ' MVA']);
    if (h.ht) rows.push([L.te(['20 kV neutral earthing resistors', '20 kV中性点接地电阻']), L.te(['one per HV/MV transformer (SPLN, IEC 60076-25)', '每台主变一台（SPLN、IEC 60076-25）']), h.ht.total + ' × 40 Ω · 300 A · 10 s']);
    rows.push([L.te(['20 kV switchgear (IEC 62271-200)', '20 kV开关柜（IEC 62271-200）']), L.te(h.mv.gis ? ['GIS, vacuum breakers', 'GIS，真空断路器'] : ['metal-clad AIS, vacuum breakers', '金属铠装空气绝缘，真空断路器']), h.mv.boards + ' × ' + F(h.mv.busA) + ' A · ' + h.mv.ik + ' kA']);
    rows.push([L.te(['MV/LV transformers', '中/低压变压器']), '20/0.4 kV · uk ' + el.lv.uk + ' % · ' + el.txLabel, el.txTotal + ' × ' + F(el.txSize) + ' kVA']);
    rows.push([L.te(['LV main switchboards (IEC 61439-2)', '低压主配电柜（IEC 61439-2）']), L.te(['main ACB · fault level', '主框架断路器 · 短路水平']), el.txTotal + ' × ' + F(el.lv.acb) + ' A · ' + el.lv.icw + ' kA']);
    rows.push([L.te(['Generators', '发电机']), L.te(el.genV === 'MV' ? ['20 kV paralleled plant', '20 kV并机电站'] : ['400 V sets with ATS', '400 V机组+ATS']), el.genTotal + ' × ' + F(el.genSize) + ' kWe']);
    rows.push([L.te(['UPS · batteries', 'UPS · 蓄电池']), el.upsLabel + ' · ' + c.p.upsMin + ' min', el.upsTotal + ' × ' + F(el.upsSize) + ' kW · ' + F(el.battKWh) + ' kWh']);
    return '<div><h3>' + L.te(['Power chain of this design — every rating follows the demand', '本设计供电链——各额定值随需量联动']) + '</h3>' + L.ptable([['Stage', '环节'], ['Arrangement', '配置'], ['Rating', '额定']], rows) + '</div>';
  }

  /* ================================================================ unit library */
  var U = {
    grid: { name: ['PLN grid connection', 'PLN电网接入'], no: '01', eq: function (c) { return c.R.el.hv.kv > 20 ? 'EL-24' : 'EL-01'; }, more: ['EL-24', 'EL-25', 'EL-26', 'EL-15'],
      func: ['Brings utility power from the PLN grid to the site through dedicated feeders or an on-site substation.', '通过专用馈线或场内变电站，将PLN电网电力引入场地。'],
      how: ['The connection voltage follows the maximum demand and the PLN system: up to ≈ 30 MVA on dedicated 20 kV (TM) feeders; up to ≈ 300 MVA at 150 kV (TT) with an on-site GIS substation and 150/20 kV transformers; above that an extra-high-voltage connection — 500 kV in Java–Bali, 275 kV in Sumatra, Kalimantan and Sulawesi — with 500/150 or 275/150 kV interbus transformers feeding a 150 kV campus network. 220/230 kV is the equivalent level in other ASEAN grids, not a PLN voltage. Tier III/IV sites take N-1 circuits from two PLN substations so that one outage does not drop the site.',
        '接入电压由最大需量及所在PLN电网决定：约30 MVA以内采用20 kV（中压）专用馈线；约300 MVA以内采用150 kV（高压），自建GIS变电站及150/20 kV主变；更大时采用超高压接入——爪哇-巴厘为500 kV，苏门答腊、加里曼丹、苏拉威西为275 kV——经500/150或275/150 kV联络变压器向园区150 kV网络供电。220/230 kV为其他东盟电网的对应等级，非PLN电压。Tier III/IV站点按N-1配置来自两座PLN变电站的进线，避免单一故障导致全站失电。'],
      basis: function (c) { var R = c.R, gr = grid(c), h = R.el.hv; return [R.el.volt[0] + ' · ' + F(R.el.mva, 1) + ' MVA · ' + h.circ + ' circuit(s) · ' + gr.en + ' (reliability ' + relTxt(gr.rel)[0] + ') · Rp ' + F(c.p.tariffIDR, 1) + '/kWh · ≈ ' + h.lead + ' months of PLN works',
        R.el.volt[1] + ' · ' + F(R.el.mva, 1) + ' MVA · ' + h.circ + '回进线 · ' + gr.zh + '（可靠性' + relTxt(gr.rel)[1] + '）· 电价 ' + F(c.p.tariffIDR, 1) + ' 印尼盾/kWh · PLN工程约' + h.lead + '个月']; },
      om: [['Start the PLN application (SLO, connection agreement) at feasibility — high-voltage connections take 18–36 months.', '可研阶段即启动PLN申请（SLO、接入协议）——高压接入需18–36个月。'],
        ['Agree protection settings and fault levels with PLN; record power quality (sags, harmonics) during commissioning.', '与PLN确认保护定值与短路水平；调试期间记录电能质量（电压暂降、谐波）。'],
        ['Weaker grids outside Java–Bali justify longer fuel autonomy and a battery energy storage system (BESS).', '爪哇-巴厘以外电网较弱地区，需更长燃油自持并配置电池储能系统（BESS）。']],
      extra: function (c) {
        var gr = c.R.L.grid;
        return connTable(c) + gimpTable(c) + '<div class="tc-g2"><div><h3>' + L.te(['PLN grid systems', 'PLN电网系统']) + '</h3>' + L.ptable(null, Object.keys(DB.idGrids).map(function (k) { var x = DB.idGrids[k], r = [L.te([x.en, x.zh]), L.te(relTxt(x.rel))]; r.cur = k === gr; return r; })) + '</div>' +
          '<div><h3>' + L.te(['PLN tariffs used by the assessment', '评估采用的PLN电价']) + '</h3>' + L.ptable([['Class', '类别'], 'LWBP Rp/kWh', ['24/7 blended', '24/7加权']], DB.idTariffs.map(function (x) { return [L.te([x.en, x.zh]), F(x.lwbp, 2), F(x.eff, 1)]; })) + '</div></div>';
      }, calc: 'mva' },
    mvsg: { eq: 'EL-01', more: ['EL-15', 'EL-24', 'EL-25', 'EL-26'],
      how: ['Each incoming feeder lands on a metal-enclosed, arc-resistant switchboard (IAC AFLR) with vacuum circuit breakers and protection relays. A bus coupler lets either feeder supply both halves of the board, outgoing breakers feed the transformers, and interlocks prevent unsafe switching.',
        '每路进线接入金属铠装、内部燃弧分级（IAC AFLR）的开关柜，配真空断路器及保护继电器。母联使任一路进线可带两段母线，出线断路器向变压器供电，联锁防止误操作。'],
      om: [['Thermographic scan of terminations under load every year.', '每年在带负荷状态下对接头进行红外测温。'], ['Test protection relays and breaker timing every 2–3 years.', '每2–3年测试保护继电器及断路器动作时间。'],
        ['Arc-flash study and labels before energisation; switching only under a written method of procedure (MOP).', '送电前完成弧闪分析并张贴标识；倒闸操作必须依据书面操作程序（MOP）。']],
      basis: function (c) { var el = c.R.el, h = el.hv; return h.kv > 20 ? [h.name + ' GIS (' + h.ur + ' kV, ' + h.ik + ' kA) → ' + (h.ibt ? h.ibt.total + ' × ' + h.ibt.mva + ' MVA ' + h.ibt.ratio + ' → ' : '') + h.ht.total + ' × ' + h.ht.mva + ' MVA ' + h.ht.ratio + ' → ' + h.mv.boards + ' × 24 kV boards (' + F(h.mv.busA) + ' A, ' + h.mv.ik + ' kA) feeding ' + el.txTotal + ' transformers',
        h.name + ' GIS（' + h.ur + ' kV，' + h.ik + ' kA）→ ' + (h.ibt ? h.ibt.total + '台' + h.ibt.mva + ' MVA ' + h.ibt.ratio + ' → ' : '') + h.ht.total + '台' + h.ht.mva + ' MVA ' + h.ht.ratio + ' → ' + h.mv.boards + '段24 kV开关柜（' + F(h.mv.busA) + ' A，' + h.mv.ik + ' kA），向' + el.txTotal + '台变压器供电']
        : [h.circ + ' incoming 20 kV feeder(s) on a 24 kV board (' + F(h.mv.busA) + ' A, ' + h.mv.ik + ' kA) feeding ' + el.txTotal + ' transformers', h.circ + '路20 kV进线接入24 kV开关柜（' + F(h.mv.busA) + ' A，' + h.mv.ik + ' kA），向' + el.txTotal + '台变压器供电']; },
      extra: function (c) { return chainTable(c); },
      calc: 'mva' },
    tx: { eq: 'EL-02', more: ['EL-25', 'EL-03'],
      how: ['Cast-resin dry-type transformers step 20 kV down to 400 V close to the load, without oil, so they can stand indoors next to the LV switchboards. They are counted with the Tier redundancy so that normal loading stays moderate and a failed unit can be carried by the others.',
        '环氧树脂浇注干式变压器将20 kV降至400 V，无油，可靠近负荷布置于室内低压配电柜旁。按Tier冗余配置台数，正常负载率适中，单台故障时其余变压器可承担负荷。'],
      key: [['N = ⌈kVA ÷ (unit kVA × ' + K.TX_LOAD + ')⌉ + redundancy', 'N = ⌈kVA ÷ (单台kVA × ' + K.TX_LOAD + ')⌉ + 冗余'], function (c) { var el = c.R.el; return F(el.demandKVA) + ' kVA ÷ (' + F(el.txSize) + ' × ' + K.TX_LOAD + ') → ' + el.txN + ' + ' + el.txR + ' (' + el.txLabel + ')'; }],
      om: [['Keep enclosure filters clean and check winding temperature (PT100) alarms monthly.', '保持外壳滤网清洁，每月检查绕组温度（PT100）报警。'], ['Partial-discharge test at commissioning; infrared scan of LV links every year.', '调试时进行局部放电测试；每年对低压连接进行红外测温。'],
        ['Order early: large transformers have 12–24 month lead times.', '尽早订货：大型变压器交货期12–24个月。']],
      basis: function (c) { var el = c.R.el; return [el.txTotal + ' × ' + F(el.txSize) + ' kVA (' + el.txLabel + ', uk ' + el.lv.uk + ' %) for ' + F(el.demandKVA) + ' kVA maximum demand · LV ' + F(el.lv.acb) + ' A / ' + el.lv.icw + ' kA', el.txTotal + ' × ' + F(el.txSize) + ' kVA（' + el.txLabel + '，uk ' + el.lv.uk + '%），最大需量' + F(el.demandKVA) + ' kVA · 低压' + F(el.lv.acb) + ' A/' + el.lv.icw + ' kA']; },
      extra: function (c) { return chainTable(c); }, calc: 'tx' },
    lv: { eq: 'EL-03', more: ['EL-07', 'EL-08', 'EL-16'],
      how: ['The main switchboard receives the transformer and generator supplies and distributes 400 V to the UPS, mechanical plant and building services. Automatic transfer (ATS or breaker interlocks) moves the load to the generators within seconds of a utility failure and back again when PLN returns.',
        '低压主配电柜接收变压器及发电机电源，向UPS、暖通设备及建筑负荷分配400 V电力。市电故障后数秒内通过自动转换（ATS或断路器联锁）切换至发电机，PLN恢复后再切回。'],
      om: [['Check breaker trip units and settings against the coordination study.', '依据选择性配合研究核对断路器脱扣器及整定值。'], ['Infrared scan of busbars and cable lugs under load every year.', '每年带负荷对母排及电缆端子红外测温。'],
        ['Exercise the transfer scheme monthly together with the generator test.', '每月结合发电机试验演练切换方案。']],
      basis: function (c) { return [c.R.el.txTotal + ' LV line-ups (one per transformer)', c.R.el.txTotal + '组低压配电柜（每台变压器一组）']; }, calc: 'tx' },
    gen: { eq: 'EL-04', more: ['EL-05', 'EL-06'],
      how: ['Diesel generator sets start automatically on loss of utility, reach rated voltage and frequency in ≈ 10–15 s and pick up the load while the UPS batteries carry the IT. Data center sets are continuous-rated (COP/DCC), so they can run for unlimited hours at the site load; paralleling switchgear shares the load and adds redundancy.',
        '柴油发电机组在市电失电后自动启动，约10–15 s达到额定电压与频率并承担负荷，期间由UPS电池支撑IT。数据中心机组采用持续功率（COP/DCC），可在现场负荷下不限时运行；并机柜实现负荷分配与冗余。'],
      key: [['Fuel = demand × ' + K.FUEL_L_KWH + ' L/kWh × hours', '燃油 = 需量 × ' + K.FUEL_L_KWH + ' L/kWh × 小时'], function (c) { var el = c.R.el; return F(el.demandKW) + ' kW × ' + K.FUEL_L_KWH + ' × ' + c.p.fuelH + ' h = ' + F(el.fuelL / 1000) + ' m³'; }],
      om: [['Monthly start-and-run test; annual load-bank test at ≥ 80 % load to avoid wet stacking.', '每月启动运行试验；每年以≥80%负载做负载箱测试，避免湿堆积。'], ['Fuel sampling and polishing every 6–12 months (water, microbes).', '每6–12个月燃油取样及净化（水分、微生物）。'],
        ['Confirm emission permit, stack height and noise limits with the authority having jurisdiction.', '与主管部门确认排放许可、排气筒高度及噪声限值。']],
      basis: function (c) { var el = c.R.el; return [el.genTotal + ' × ' + F(el.genSize) + ' kWe (' + el.genLabel + ') · ' + F(el.fuelL / 1000) + ' m³ fuel for ' + c.p.fuelH + ' h', el.genTotal + ' × ' + F(el.genSize) + ' kWe（' + el.genLabel + '）· 燃油' + F(el.fuelL / 1000) + ' m³（' + c.p.fuelH + ' h）']; },
      calc: 'fuel' },
    ups: { eq: 'EL-09', more: ['EL-10', 'EL-11', 'EL-08'],
      how: ['The double-conversion UPS rectifies the incoming power to DC, keeps the batteries charged and inverts it back to a clean sine wave, so the IT never sees grid disturbances. On a utility failure the inverter keeps running from the batteries without any break until the generators take over; a static bypass handles faults and overloads.',
        '双变换UPS将输入电力整流为直流，为电池浮充，再逆变为纯净正弦波，IT设备不受电网扰动影响。市电故障时逆变器由电池供电无间断运行，直到发电机接管；静态旁路处理故障与过载。'],
      key: [['Battery kWh = kW × min ÷ 60 × ' + K.BATT_AGE + ' ÷ ' + K.BATT_EFF, '电池kWh = kW × 分钟 ÷ 60 × ' + K.BATT_AGE + ' ÷ ' + K.BATT_EFF], function (c) { var el = c.R.el; return el.upsTotal + ' × ' + F(el.upsSize) + ' kW × ' + c.p.upsMin + ' min → ' + F(el.battKWh) + ' kWh'; }],
      om: [['Keep UPS and battery rooms at 20–25 °C; VRLA life halves for every ≈ 10 K above 25 °C.', 'UPS及电池室保持20–25 °C；温度每高于25 °C约10 K，铅酸电池寿命减半。'], ['Replace fans and DC capacitors on the manufacturer schedule (≈ 5–7 years).', '按厂家周期（约5–7年）更换风扇与直流电容。'],
        ['Use eco-mode only where the IT power supplies tolerate the transfer time.', '仅在IT电源可承受切换时间时使用ECO模式。']],
      basis: function (c) { var el = c.R.el; return [el.upsTotal + ' × ' + F(el.upsSize) + ' kW (' + el.upsLabel + ') · ' + c.p.upsMin + ' min · ' + t(bat(c)), el.upsTotal + ' × ' + F(el.upsSize) + ' kW（' + el.upsLabel + '）· ' + c.p.upsMin + ' min · ' + bat(c)[1]]; },
      calc: 'batt', ill: function () { return IV.ups(); } },
    batt: { eq: 'EL-10', more: ['EL-11', 'FP-08', 'ME-18'],
      how: ['Lithium iron phosphate (LFP) racks store the energy that bridges the gap until the generators carry the load. LFP is chosen for its thermal stability; each module is supervised by a battery management system (BMS) that balances the cells and trips on over-temperature or over-voltage.',
        '磷酸铁锂（LFP）电池柜储存桥接至发电机带载所需的能量。选用LFP因其热稳定性好；每个模块由电池管理系统（BMS）监控，负责均衡并在过温或过压时脱扣。'],
      om: [['Trend cell voltages and temperatures in the BMS; investigate any drifting module.', '在BMS中跟踪单体电压与温度趋势，排查任何漂移模块。'], ['Battery rooms need off-gas detection and separation according to NFPA 855 and UL 9540A results.', '电池室按NFPA 855及UL 9540A结果设置逸出气体探测与防火间距。'],
        ['Design life 12–15 years for LFP versus ≈ 5–7 years for VRLA.', '磷酸铁锂设计寿命12–15年，阀控铅酸约5–7年。']],
      basis: function (c) { return [F(c.R.el.battKWh) + ' kWh ' + t(bat(c)) + ' for ' + c.p.upsMin + ' min', F(c.R.el.battKWh) + ' kWh ' + bat(c)[1] + '，后备' + c.p.upsMin + ' min']; }, calc: 'batt' },
    bwy: { eq: 'EL-13', more: ['EL-12', 'EL-22'],
      how: ['Overhead plug-in busbars run above each rack row. Tap-off boxes with their own breakers clip on wherever a rack needs power, so racks can be added or changed without new cabling; every row gets an A and a B busway for dual-corded IT.',
        '上走线插接母线布置于每排机柜上方。带断路器的插接箱可在任意位置插接取电，增减机柜无需重新布线；每排配置A、B两路母线供双电源IT使用。'],
      key: ['I = P ÷ (√3 × ' + K.BW_V + ' kV × ' + K.BW_F + ')', function (c) { var el = c.R.el; return F(c.R.cap.itKW / el.rows) + ' kW per row → ' + el.bwA + ' A'; }],
      om: [['Infrared scan of joints and tap-offs every year; torque check after installation.', '每年红外测温接头及插接箱；安装后检查力矩。'], ['Label A/B feeds clearly; never load one side above 50 % of the pair rating.', '清晰标识A/B路；单路负载不得超过两路总额定的50%。'],
        ['Keep spare tap-off boxes of each rating on site.', '现场备用各规格插接箱。']],
      basis: function (c) { var el = c.R.el; return el.useBusway ? [el.busways + ' busway runs × ' + el.bwA + ' A' + (el.bwHdA && el.bwHdA !== el.bwA ? ' / HD ' + el.bwHdA + ' A' : '') + ' (' + el.rows + ' rows, A + B)', el.busways + '条母线 × ' + el.bwA + ' A' + (el.bwHdA && el.bwHdA !== el.bwA ? ' / HD ' + el.bwHdA + ' A' : '') + '（' + el.rows + '排，A+B）'] : [el.pdus + ' × 150 kVA PDUs', el.pdus + '台150 kVA列头柜']; }, calc: 'bwy' },
    rpdu: { eq: 'EL-14', more: ['IT-01'],
      how: ['Intelligent rack PDUs distribute power to each server inside the cabinet and meter it per outlet or per phase, which feeds capacity planning and billing in DCIM. Dual-corded servers plug into the A and the B PDU so either path can carry the full load.',
        '智能机柜PDU在机柜内为每台服务器配电，并按插座或相计量，为DCIM容量规划与计费提供数据。双电源服务器分别接入A、B路PDU，任一路均可承担全部负荷。'],
      om: [['Alarm thresholds at 80 % of the PDU breaker rating.', '在PDU断路器额定值的80%设置报警阈值。'], ['Balance phases within ± 10 %.', '三相不平衡控制在±10%以内。'], ['Keep firmware current — PDUs are network devices (cyber-security).', '保持固件更新——PDU属于网络设备（需考虑网络安全）。']],
      basis: function (c) { var el = c.R.el; return [F(el.rpdus) + ' rack PDUs · standard racks ' + el.rStd[0] + (el.rHd ? ' · high-density ' + el.rHd[0] : ''), F(el.rpdus) + '个机柜PDU · 标准机柜' + el.rStd[1] + (el.rHd ? ' · 高密度' + el.rHd[1] : '')]; }, calc: 'bwy' },
    bess: { eq: 'EL-23',
      how: ['Containerised LFP batteries with a power conversion system (PCS) connect at medium voltage. They smooth fast load swings of AI clusters, shave PLN peak demand and firm on-site solar; they do not replace the UPS or the generators.',
        '集装箱式LFP电池经功率变换系统（PCS）接入中压。用于平抑AI集群的快速负荷波动、削减PLN峰值需量并稳定现场光伏出力；不能替代UPS或发电机。'],
      om: [['Keep the state of charge in the window agreed with the energy management system; test the response time every year.', '将荷电状态保持在与能量管理系统约定的区间；每年测试响应时间。'], ['Maintain container cooling, off-gas detection and deflagration venting.', '维护集装箱制冷、逸出气体探测及泄爆装置。'],
        ['Plan augmentation: usable energy falls to ≈ 70–80 % over the contract.', '规划扩容补充：合同期内可用能量降至约70–80%。']],
      basis: function (c) { var b = c.R.el.bess; return b ? [F(b.mw, 1) + ' MW / ' + F(b.mwh, 1) + ' MWh · ' + b.containers + ' containers · ' + usd(b.capex), F(b.mw, 1) + ' MW / ' + F(b.mwh, 1) + ' MWh · ' + b.containers + '个集装箱 · ' + usd(b.capex)] : ['Not proposed for this design basis.', '本设计基准未建议配置。']; }, calc: 'bess' },
    fuel: { eq: 'EL-06', more: ['EL-04', 'CS-06'],
      how: ['Bulk tanks (often underground or in bunded yards) hold the autonomy fuel; duplicate transfer pumps and filters keep each generator day tank full. Level, leak and water sensors report to the building management system.',
        '主储油罐（通常为地下或带围堰场地）储存自持燃油；双套输油泵及滤器保持各发电机日用油箱满油。液位、泄漏及水分传感器接入楼宇管理系统。'],
      om: [['Fuel sampling every 6 months; polishing loop for long storage.', '每6个月取样；长期储存设燃油净化回路。'], ['Test leak detection and overfill alarms every year.', '每年测试泄漏探测及溢油报警。'],
        ['Keep a refuelling contract with guaranteed delivery during regional emergencies.', '签订在区域紧急情况下保证供油的加油合同。']],
      basis: function (c) { var el = c.R.el; return [el.tanks + ' × ' + el.tankSize + ' m³ tanks · ' + F(el.fuelLph) + ' L/h at maximum demand', el.tanks + ' × ' + el.tankSize + ' m³储罐 · 最大需量耗油' + F(el.fuelLph) + ' L/h']; }, calc: 'fuel' },
    earth: { eq: 'EL-18', more: ['EL-19'],
      how: ['A common bonding network ties the building steel, rack frames, cable trays and the main earth bar into one equipotential mesh, so faults clear fast and electronics see no dangerous voltage differences. External lightning protection and surge protective devices (SPD) at every distribution level divert strikes and surges.',
        '公共联结网络将建筑钢结构、机柜框架、桥架及总接地排连接为等电位网格，使故障快速切除，电子设备之间无危险电位差。外部防雷及各级配电的浪涌保护器（SPD）泄放雷击与浪涌。'],
      om: [['Measure the earth resistance (≤ 1 Ω target) every year in the dry season.', '每年旱季测量接地电阻（目标≤1 Ω）。'], ['Inspect SPD status indicators monthly; replace after large surges.', '每月检查SPD状态指示；大浪涌后更换。'],
        ['Indonesia has very high lightning density: keep down conductors and bonds intact.', '印尼雷暴密度极高：保持引下线及连接完好。']] },
    epms: { eq: 'MC-02', more: ['EL-17'],
      how: ['The electrical power monitoring system reads every meter, breaker and relay on the power chain in real time, records waveforms and sequences of events, and calculates PUE. After a disturbance it shows exactly which breaker operated first.',
        '电力监控系统实时读取供电链上所有电表、断路器及继电器数据，记录波形及事件顺序并计算PUE。扰动后可准确显示首先动作的断路器。'],
      om: [['Time-synchronise all meters (GPS/PTP) so event sequences are valid.', '所有电表时钟同步（GPS/PTP），保证事件顺序有效。'], ['Review power-quality reports monthly.', '每月审阅电能质量报告。'], ['Keep the EPMS on a segregated operational-technology network.', 'EPMS部署于隔离的运营技术（OT）网络。']],
      basis: function (c) { return ['≈ ' + F(c.R.fs.meters) + ' power meters', '约' + F(c.R.fs.meters) + '块电表']; }, calc: 'points' },
    tower: { eq: 'ME-03', more: ['ME-17', 'ME-19'],
      how: ['Warm condenser water is sprayed over the fill while fans pull air through; a small part evaporates and carries the heat away, cooling the rest to within ≈ 3–4 K of the outdoor wet-bulb. In lowland Indonesia the design wet-bulb is ≈ 27–28 °C, so the towers return ≈ 31–32 °C water to the chillers.',
        '温热冷却水喷淋于填料上，风机抽吸空气，少量水蒸发带走热量，使其余水冷却至比室外湿球温度高约3–4 K。印尼低地设计湿球约27–28 °C，冷却塔向冷机回水约31–32 °C。'],
      key: [['Evaporation ≈ kW × 3,600 ÷ 2,400 kJ/kg', '蒸发量 ≈ kW × 3,600 ÷ 2,400 kJ/kg'], function (c) { var k = c.R.me.rejKW || c.R.cap.itKW; return F(k) + ' kW → ≈ ' + F(k * 0.0015, 1) + ' m³/h (' + F(k * 0.036) + ' m³/day)'; }],
      om: [['Water treatment and Legionella control (biocide, monthly sampling).', '水处理与军团菌控制（杀菌剂，每月取样）。'], ['Control cycles of concentration (CoC 4–6) with conductivity-based blowdown.', '依据电导率排污，控制浓缩倍数（4–6）。'],
        ['Clean fill and basins; check fan gearboxes and drives quarterly.', '清洗填料与集水盘；每季度检查风机齿轮箱及变频器。']],
      basis: function (c) { var me = c.R.me; return me.ctN ? [(me.ctN + me.ctR) + ' cells · ' + F(me.rejKW) + ' kW rejected · ' + F(me.waterDay) + ' m³/day make-up', (me.ctN + me.ctR) + '格 · 散热' + F(me.rejKW) + ' kW · 补水' + F(me.waterDay) + ' m³/日'] : ['This design uses air-cooled or dry heat rejection (no cooling towers).', '本设计采用风冷或干式散热（无冷却塔）。']; }, calc: 'wue' },
    pumps: { eq: 'ME-04', more: ['ME-16', 'ME-20'],
      how: ['Variable-speed centrifugal pumps circulate chilled water to the air handlers and condenser water to the towers. Speed follows the differential pressure, so pump energy falls with the cube of the flow at part load; standby pumps give N+1.',
        '变频离心泵将冷冻水输送至空气处理设备，将冷却水输送至冷却塔。转速随压差调节，部分负荷时泵能耗随流量三次方下降；备用泵实现N+1。'],
      om: [['Trend vibration and bearing temperature.', '跟踪振动与轴承温度趋势。'], ['Check mechanical seals and strainers quarterly.', '每季度检查机械密封及过滤器。'], ['Verify automatic changeover to the standby pumps monthly.', '每月验证备用泵自动切换。']],
      basis: function (c) { return c.R.me.pumps ? [c.R.me.pumps + ' pumps (chilled' + (c.R.cool.airTech === 'WCCH' ? ' + condenser' : '') + ' water)', c.R.me.pumps + '台水泵（冷冻水' + (c.R.cool.airTech === 'WCCH' ? '+冷却水' : '') + '）'] : null; }, calc: 'chw' },
    chiller: { eq: 'ME-01', more: ['ME-02', 'ME-05', 'ME-16'],
      how: ['Oil-free magnetic-bearing centrifugal chillers compress refrigerant to move heat from the chilled-water loop to the condenser-water loop. Elevated chilled water (for example 14 → 22 °C) raises efficiency; at part load and variable speed the plant reaches a coefficient of performance (COP) of ≈ 6–8.',
        '无油磁悬浮离心式冷水机组压缩制冷剂，把热量从冷冻水环路转移至冷却水环路。提高冷冻水温度（如14→22 °C）可提升效率；部分负荷与变频运行时机组性能系数（COP）约6–8。'],
      key: [['RT = kW ÷ ' + K.RT_KW + ' · N = ⌈load ÷ size⌉', 'RT = kW ÷ ' + K.RT_KW + ' · N = ⌈负荷 ÷ 单机容量⌉'], function (c) { var me = c.R.me; return me.chN ? F(me.chwLoad) + ' kW = ' + F(me.chwLoad / K.RT_KW) + ' RT → ' + me.chN + ' + ' + me.chR + ' × ' + F(me.chSize) + ' kW' : '–'; }],
      om: [['Log approach temperatures; a rising approach means fouled tubes.', '记录趋近温度；趋近温度上升说明换热管结垢。'], ['Clean condenser tubes every year and check for refrigerant leaks.', '每年清洗冷凝器管束并检查冷媒泄漏。'],
        ['Restart time after a power loss matters: specify fast restart (< 5 min) and add thermal storage.', '断电后的重启时间至关重要：规定快速重启（<5 min）并配置蓄冷。']],
      basis: function (c) { var me = c.R.me; return me.chN ? [(me.chN + me.chR) + ' × ' + F(me.chSize) + ' kW ' + (c.R.cool.airTech === 'WCCH' ? 'water-cooled' : 'air-cooled') + ' chillers (' + me.chLabel + ') for ' + F(me.chwLoad) + ' kW', (me.chN + me.chR) + ' × ' + F(me.chSize) + ' kW' + (c.R.cool.airTech === 'WCCH' ? '水冷' : '风冷') + '冷水机组（' + me.chLabel + '），负荷' + F(me.chwLoad) + ' kW'] : ['No chillers in this design (DX or indirect evaporative cooling).', '本设计无冷水机组（直膨或间接蒸发冷却）。']; },
      calc: 'chw', ill: function () { return IV.chiller(); } },
    phe: { eq: 'ME-05',
      how: ['A plate heat exchanger lets cool condenser water chill the loop directly when the outdoor wet-bulb is low enough, so the compressors can rest. In lowland Indonesia this rarely happens; it pays off with warm-water liquid cooling or at highland sites such as Bandung.',
        '当室外湿球温度足够低时，板式换热器可用冷却水直接冷却冷冻水环路，压缩机可以停机。印尼低地很少出现该条件；更适用于温水液冷或万隆等高原站点。'],
      om: [['Clean the plates when the approach rises above ≈ 1.5–2 K.', '趋近温度高于约1.5–2 K时清洗板片。'], ['Check gaskets for leaks every year.', '每年检查密封垫泄漏。'], ['Install strainers upstream to protect the narrow channels.', '上游设置过滤器保护狭窄流道。']],
      basis: function (c) { return ['Climate class ' + c.R.L.cls + ' · design wet-bulb ' + c.R.L.wb + ' °C', '气候类型' + c.R.L.cls + ' · 设计湿球' + c.R.L.wb + ' °C']; }, calc: 'chw' },
    tes: { eq: 'ME-06',
      how: ['An insulated chilled-water tank stores enough cold water to keep the air handlers supplied while the chillers restart after a power interruption — typically 5–15 minutes. Without it, a high-density room can warm up by several kelvin per minute.',
        '保温冷冻水罐储存足够的冷水，在断电后冷机重启期间维持空气处理设备供冷——通常5–15分钟。若无蓄冷，高密度机房温度每分钟可上升数开尔文。'],
      key: ['V = Q × t ÷ (ρ · cp · ΔT)', function (c) { return F(c.R.me.chwLoad || 0) + ' kW × ' + K.TES_S + ' s ÷ (4.186 × ' + K.CHW_DT + ') → ' + F(c.R.me.tesM3 || 0) + ' m³'; }],
      om: [['Keep stratification with low-velocity inlet diffusers.', '采用低流速布水器保持分层。'], ['Prove the ride-through with a controlled chiller trip during the integrated systems test (IST).', '在综合系统测试（IST）中通过受控停冷机验证蓄冷时间。'], ['Inspect insulation and corrosion every year.', '每年检查保温与腐蚀。']],
      basis: function (c) { return c.R.me.tesM3 ? [F(c.R.me.tesM3) + ' m³ for ' + K.TES_S / 60 + ' min at ' + F(c.R.me.chwLoad) + ' kW', F(c.R.me.tesM3) + ' m³，在' + F(c.R.me.chwLoad) + ' kW下维持' + K.TES_S / 60 + '分钟'] : ['Not required for this design basis.', '本设计基准无需配置。']; }, calc: 'tes' },
    crah: { eq: 'ME-08', more: ['ME-07', 'ME-10', 'ME-09'],
      how: ['Fan walls (or CRAH units) blow air across chilled-water coils into the cold aisle at ≈ 22–25 °C and draw warm return air from the hot aisle. Electronically commutated (EC) fans adjust their speed to keep the cold aisle at a small positive pressure, so the airflow matches what the servers draw.',
        '风墙（或冷冻水精密空调）将空气吹过冷冻水盘管，以约22–25 °C送入冷通道，并从热通道吸回热风。电子换向（EC）风机调速使冷通道保持微正压，送风量与服务器吸风量匹配。'],
      key: [['Airflow (m³/h) = kW ÷ (1.2 × 1.006 × ΔT) × 3,600', '风量（m³/h）= kW ÷ (1.2 × 1.006 × ΔT) × 3,600'], function (c) { var kw = c.R.cool.airKW; return F(kw) + ' kW at ΔT 12 K → ' + F(kw / (1.2 * 1.006 * 12) * 3600) + ' m³/h'; }],
      om: [['Replace filters by differential pressure, not by calendar.', '按压差而非固定周期更换过滤器。'], ['Calibrate temperature and humidity sensors every year.', '每年校准温湿度传感器。'],
        ['Stop bypass air: blanking panels, brush grommets and sealed containment.', '消除旁通气流：盲板、毛刷封口及密封通道。']],
      basis: function (c) { var me = c.R.me; return me.term ? [(me.term.n + me.term.r) + ' × ' + me.term.en + ' for ' + F(c.R.cool.airKW) + ' kW of air-side heat', (me.term.n + me.term.r) + ' × ' + me.term.zh + '，风侧热负荷' + F(c.R.cool.airKW) + ' kW'] : (me.cracN ? [(me.cracN + me.cracR) + ' × ' + me.cracSize + ' kW DX precision units', (me.cracN + me.cracR) + ' × ' + me.cracSize + ' kW直膨精密空调'] : null); },
      calc: 'air' },
    aisle: { eq: 'IT-02', more: ['IT-01', 'MC-04'],
      how: ['Hot-aisle (or cold-aisle) containment physically separates supply and exhaust air. Servers take cold air at the front and reject it 10–15 K warmer at the back; containment stops the two streams mixing, which allows higher supply temperatures and lower fan energy.',
        '热通道（或冷通道）封闭将送风与排风物理隔离。服务器前部吸入冷风，后部排出温升10–15 K的热风；封闭防止两股气流混合，可提高送风温度并降低风机能耗。'],
      om: [['Blanking panels in every empty U; seal cable openings.', '每个空U安装盲板；封堵线缆开孔。'], ['Containment roofs must not obstruct sprinkler or gas discharge (fusible or drop-away panels).', '封闭顶板不得阻挡喷淋或气体喷放（采用易熔或可脱落面板）。'],
        ['Watch the temperature rise across racks in DCIM to find recirculation.', '在DCIM中监测机柜温升以发现回流。']],
      basis: function (c) { return [F(c.R.cap.racks) + ' racks in ' + c.R.el.rows + ' rows · white space ' + F(c.R.sp.ws) + ' m²', F(c.R.cap.racks) + '个机柜，' + c.R.el.rows + '排 · 白区' + F(c.R.sp.ws) + ' m²']; }, calc: 'air', ill: function () { return IV.aisle(); } },
    rdhx: { eq: 'ME-11', more: ['FP-07'],
      how: ['A water coil in the rear door of a rack absorbs the hot exhaust before it leaves the rack, so 20–75 kW racks can stand in an air-cooled hall. Passive doors rely on the server fans; active doors add their own fans for higher densities.',
        '机柜后门内置水盘管，在热风离开机柜前将其吸收，使20–75 kW机柜可置于风冷机房。被动式背门依靠服务器风扇；主动式背门自带风扇，适用于更高密度。'],
      om: [['Leak detection under every door circuit.', '每个背门回路下方设漏水检测。'], ['Keep the supply water above the dew point (≥ 18–20 °C) — no condensation.', '供水温度高于露点（≥18–20 °C），防止结露。'], ['Hinged hoses with dry-break couplings for rack access.', '采用带干式快接头的活动软管，便于机柜维护。']],
      basis: function (c) { return c.R.me.rdhx ? [c.R.me.rdhx + ' rear-door coolers on ' + F(c.R.cap.hd) + ' kW racks', c.R.me.rdhx + '个背板换热器，用于' + F(c.R.cap.hd) + ' kW机柜'] : ['Not used in this design basis.', '本设计基准未采用。']; }, calc: 'air' },
    wtreat: { eq: 'ME-17',
      how: ['Chemical dosing, side-stream filtration and conductivity-controlled blowdown keep condenser and chilled water free of scale, corrosion and biological growth, including Legionella in the cooling towers.', '加药、旁滤及电导率控制排污，使冷却水与冷冻水免于结垢、腐蚀和生物滋生（含冷却塔军团菌）。'],
      om: [['Monthly Legionella sampling and quarterly service reports.', '每月军团菌取样，每季度提交服务报告。'], ['Keep CoC 4–6 to balance water use and scaling risk.', '浓缩倍数保持4–6，平衡耗水与结垢风险。'], ['Closed loops: corrosion inhibitor and corrosion coupons.', '闭式环路：缓蚀剂及腐蚀挂片监测。']], calc: 'wue' },
    makeup: { eq: 'ME-19',
      how: ['Storage tanks keep the cooling towers running when the municipal or groundwater supply is interrupted — sized like fuel, in hours of autonomy (often equal to the generator autonomy). Rainwater harvesting can cover part of the demand.',
        '储水箱在市政或地下水供应中断时维持冷却塔运行——与燃油相同，按自持小时数选型（通常与发电机自持时间相同）。雨水收集可满足部分需求。'],
      om: [['Two supply sources and duplicate make-up valves.', '双水源及双补水阀。'], ['Level alarms to the BMS; clean the tanks every year.', '液位报警接入BMS；每年清洗水箱。'], ['Groundwater permits (SIPA) where wells are used.', '使用水井时办理地下水许可（SIPA）。']],
      basis: function (c) { return [F(c.R.me.waterStore) + ' m³ storage · ' + F(c.R.me.waterDay) + ' m³/day', '储水' + F(c.R.me.waterStore) + ' m³ · ' + F(c.R.me.waterDay) + ' m³/日']; }, calc: 'wue' },
    vfd: { eq: 'ME-20',
      how: ['Variable frequency drives run pumps, tower fans and air-handler fans at the speed actually needed. Because fan and pump power follows the cube of speed, running at 80 % speed needs only ≈ 51 % of the power.', '变频器使水泵、冷却塔风机及空气处理风机按实际需要的转速运行。风机水泵功率与转速三次方成正比，80%转速仅需约51%功率。'],
      om: [['Keep drives clean and cool; check their cooling fans every year.', '保持变频器清洁散热；每年检查其冷却风扇。'], ['Verify the bypass (where specified) for critical pumps.', '验证关键水泵的旁路（如有）。'], ['Limit harmonics: active front end or filters.', '限制谐波：有源前端或滤波器。']], calc: 'chw' },
    bms: { eq: 'MC-01', more: ['MC-04'],
      how: ['The building management system controls and monitors chillers, pumps, air handlers, valves and room sensors, runs the sequences of operation (staging, failover) and raises alarms to the operators 24/7.', '楼宇管理系统控制并监测冷机、水泵、空气处理设备、阀门及房间传感器，执行运行逻辑（加减机、故障切换），并全天候向运维人员报警。'],
      om: [['Test failover sequences during the IST and after every software change.', '在IST及每次软件变更后测试故障切换逻辑。'], ['Back up controller programs; keep spares of critical controllers.', '备份控制器程序；关键控制器备品。'], ['Segregated OT network with secure remote access.', '隔离的OT网络及安全远程访问。']],
      basis: function (c) { return ['≈ ' + F(c.R.fs.bmsPts) + ' BMS points', '约' + F(c.R.fs.bmsPts) + '个BMS点位']; }, calc: 'points' },
    gpu: { eq: 'IT-08', more: ['IT-01', 'IT-06'],
      how: ['Each compute tray carries GPUs and CPUs with cold plates fixed directly on the chips. Coolant flows through micro-channels in the plates and removes ≈ 85–90 % of the tray heat; the remaining heat from memory, drives and power supplies is still air-cooled.',
        '每个计算托盘的GPU与CPU上直接安装冷板。冷却液流经冷板微通道，带走托盘约85–90%的热量；内存、硬盘及电源的其余热量仍需风冷。'],
      om: [['Follow the OEM coolant specification exactly (PG25 or treated water, filtration).', '严格遵循OEM冷却液规范（PG25或处理水、过滤精度）。'], ['Pressure-test trays after any cold-plate service.', '冷板维护后对托盘进行压力测试。'], ['Monitor GPU temperatures and throttling events in DCIM.', '在DCIM中监测GPU温度与降频事件。']],
      basis: function (c) { var hp = c.R.hdP, cap = c.R.cap; return cap.hdR ? [F(cap.hdR) + ' × ' + hp.en + ' · ≈ ' + F(cap.gpus) + ' GPUs', F(cap.hdR) + ' × ' + hp.zh + ' · 约' + F(cap.gpus) + '颗GPU'] : null; }, calc: 'flow', ill: function () { return IV.coldplate(); } },
    airack: { eq: 'IT-01', more: ['IT-08', 'CS-01'],
      how: ['An AI rack such as NVIDIA GB300 NVL72 joins 72 GPUs in one NVLink domain. It draws ≈ 135 kW, weighs ≈ 1.5 t and arrives as an integrated, pre-plumbed rack with its own manifolds and power shelves — the facility must supply liquid, power and floor strength to match.',
        'NVIDIA GB300 NVL72等AI机柜将72颗GPU组成一个NVLink域。功率约135 kW、重约1.5 t，以集成、预配管的整机柜交付，自带分液器及电源架——设施须提供相应的液冷、电力及楼面承载能力。'],
      om: [['Plan the delivery route: dock, freight lift and ramps rated for the rack on its pallet.', '规划运输路线：卸货平台、货梯及坡道须承载带托盘的机柜。'], ['Commission each rack with flow and pressure checks before power-on.', '每个机柜上电前进行流量与压力调试。'], ['Keep a rack-level spares kit (QDs, hoses, power shelves).', '配备机柜级备件包（快插接头、软管、电源架）。']],
      basis: function (c) { var hp = c.R.hdP; return [hp.en + ': ' + hp.kw + ' kW design / ' + hp.kwPeak + ' kW peak · ' + hp.w + ' × ' + hp.d + ' mm · ' + hp.u + 'U · ≈ ' + F(hp.kg) + ' kg · ' + (hp.gpu || '–') + ' GPUs', hp.zh + '：设计' + hp.kw + ' kW / 峰值' + hp.kwPeak + ' kW · ' + hp.w + ' × ' + hp.d + ' mm · ' + hp.u + 'U · 约' + F(hp.kg) + ' kg · ' + (hp.gpu || '–') + '颗GPU']; },
      extra: function (c) {
        var rows = DB.platforms.filter(function (p) { return p.cat === 'AI'; }).map(function (p) { var r = [L.te([p.en, p.zh]) + (p.provisional ? ' *' : ''), p.kw + ' kW', p.cool, F(p.kg) + ' kg', p.gpu || '–']; r.cur = p.id === c.R.hdP.id; return r; });
        return '<div><h3>' + L.te(['AI rack platforms in the knowledge base', '知识库中的AI机柜平台']) + '</h3>' + L.ptable([['Platform', '平台'], ['Design', '设计'], ['Cooling', '冷却'], ['Weight', '重量'], 'GPU'], rows) + '<p class="tc-src">* ' + L.te(['provisional figures', '暂定数据']) + '</p></div>';
      }, calc: 'floor' },
    manifold: { eq: 'ME-16', more: ['FP-07', 'ME-12'], name: ['Rack manifolds & quick disconnects', '机柜分液器与快插接头'],
      func: ['Distribute coolant from the row piping to every compute tray and let trays be removed without draining the loop.', '将冷却液从列管道分配至每个计算托盘，拆卸托盘无需排空环路。'],
      how: ['Rack manifolds feed each tray through dripless quick disconnects (QD). Supply and return hoses connect the rack to the row piping or directly to the in-row CDU; isolation valves at every rack allow concurrent maintenance.',
        '机柜分液器通过无滴漏快插接头（QD）向每个托盘供液。供回水软管将机柜接至列管道或直接接至列间CDU；每个机柜设隔离阀，便于同时维护。'],
      om: [['Inspect QDs for weeping; keep spare O-rings and QDs.', '检查快插接头渗漏；备用O型圈及接头。'], ['Leak-detection cable under manifolds and in drip trays.', '分液器下方及接水盘设漏水检测线缆。'], ['Label supply/return and flow direction on every hose.', '每根软管标识供回水及流向。']], calc: 'flow' },
    cdu: { eq: 'ME-12', more: ['ME-04', 'ME-17'],
      how: ['The coolant distribution unit separates the clean technology cooling system (TCS) loop from the facility water system (FWS) with a plate heat exchanger. Its pumps, filters (≈ 25–50 µm) and controls hold the supply temperature, flow and pressure the IT needs; large in-row CDUs each serve roughly ten AI racks.',
        '冷量分配单元以板式换热器将洁净的技术冷却系统（TCS）环路与设施水系统（FWS）隔离。其水泵、过滤器（约25–50 µm）及控制系统保持IT所需的供液温度、流量与压力；大型列间CDU每台约服务十个AI机柜。'],
      key: [['CDUs = ⌈liquid kW ÷ CDU kW⌉ + 1 per ' + K.CDU_N_PER_R, 'CDU = ⌈液冷kW ÷ 单台kW⌉ + 每' + K.CDU_N_PER_R + '台备1台'], function (c) { var me = c.R.me; return me.cduN ? F(c.R.cool.liquidKW) + ' kW ÷ ' + F(me.cduSize) + ' → ' + me.cduN + ' + ' + me.cduR : '–'; }],
      om: [['Redundant pumps and dual A/B power in every CDU.', '每台CDU水泵冗余并双路（A/B）供电。'], ['Monitor coolant quality: conductivity, pH, glycol %, particles.', '监测冷却液质量：电导率、pH、乙二醇浓度、颗粒物。'], ['Change strainers by differential pressure alarm.', '按压差报警更换滤网。']],
      basis: function (c) { var me = c.R.me; return me.cduN ? [(me.cduN + me.cduR) + ' × ' + F(me.cduSize) + ' kW CDUs for ' + F(c.R.cool.liquidKW) + ' kW to liquid', (me.cduN + me.cduR) + ' × ' + F(me.cduSize) + ' kW CDU，液冷负荷' + F(c.R.cool.liquidKW) + ' kW'] : null; },
      calc: 'cdu', ill: function () { return IV.cdu(); } },
    fws: { eq: 'ME-04', more: ['ME-16', 'ME-17'], name: ['Facility water system (FWS)', '设施水系统（FWS）'],
      func: ['Carries the heat from the CDUs to the outdoor heat rejection in a warm-water loop.', '以温水环路将热量从CDU输送至室外散热设备。'],
      how: ['Warm-water loops (ASHRAE W32–W45) can reject heat with dry coolers alone for most hours, without compressors. Supply and return run as a ring with isolation valves so any section can be maintained without stopping the IT.',
        '温水环路（ASHRAE W32–W45）在多数时间仅用干冷器即可散热，无需压缩机。供回水环形布置并设隔离阀，任一段均可在不停IT的情况下维护。'],
      om: [['Keep a strainer and an air separator in the loop.', '环路中设置过滤器及除气器。'], ['Closed-loop water treatment (inhibitor, biocide).', '闭式环路水处理（缓蚀剂、杀菌剂）。'], ['Exercise isolation valves regularly so they work when needed.', '定期操作隔离阀，确保需要时可用。']], calc: 'cdu' },
    dry: { eq: 'ME-15',
      how: ['Finned coils with large fans reject the facility-water heat to outdoor air. Adiabatic pads pre-cool the inlet air during the hottest hours; in Indonesia, warm supply water (≈ 35–40 °C or more) is needed for chiller-less operation all year.',
        '翅片盘管配大风量风机将设施水热量排至室外空气。最热时段由绝热湿帘预冷进风；在印尼，全年无冷机运行需要较高的供水温度（约35–40 °C或以上）。'],
      om: [['Clean coils (dust, insects) every 3–6 months.', '每3–6个月清洗盘管（灰尘、昆虫）。'], ['Adiabatic pads: water quality and replacement.', '绝热湿帘：水质及更换。'], ['Fan speed follows the supply temperature set-point.', '风机转速跟随供水温度设定值。']],
      basis: function (c) { var me = c.R.me; return me.dcN ? [(me.dcN + me.dcR) + ' × ' + F(K.DC_KW) + ' kW dry coolers · design dry-bulb ' + c.R.L.db + ' °C', (me.dcN + me.dcR) + ' × ' + F(K.DC_KW) + ' kW干冷器 · 设计干球' + c.R.L.db + ' °C'] : null; }, calc: 'appr' },
    leak: { eq: 'FP-07',
      how: ['Sensing cables along pipe runs and under CDUs and manifolds detect water within seconds and pinpoint the location, before a leak reaches electrical equipment.', '沿管道及CDU、分液器下方敷设的感应线缆可在数秒内探测漏水并精确定位，在泄漏蔓延至电气设备前报警。'],
      om: [['Test each zone with water every 6 months.', '每6个月用水测试每个防区。'], ['Map cable distances to room drawings.', '将线缆距离与房间图纸对应。'], ['Automatic isolation valves where the loop design allows.', '环路设计允许时设自动隔离阀。']] },
    coolant: { eq: 'ME-17', name: ['Coolant quality', '冷却液品质'],
      func: ['Keeps the technology cooling loop clean and stable so cold-plate micro-channels never block or corrode.', '保持技术冷却环路洁净稳定，防止冷板微通道堵塞或腐蚀。'],
      how: ['The technology loop usually runs 25 % propylene glycol (PG25) or treated water with inhibitors. Fine filtration, controlled materials (copper, stainless steel, EPDM) and regular sampling keep particles, bacteria and corrosion products out of the micro-channels.',
        '技术冷却环路通常采用25%丙二醇（PG25）或添加缓蚀剂的处理水。精细过滤、受控材质（铜、不锈钢、EPDM）及定期取样，防止颗粒物、细菌及腐蚀产物进入微通道。'],
      om: [['Monthly sampling: pH, conductivity, glycol %, bacteria.', '每月取样：pH、电导率、乙二醇浓度、细菌。'], ['Flush and pre-commission new loops before connecting IT.', '新环路接入IT前进行冲洗及预调试。'], ['Top up only with the same approved fluid.', '仅使用同一认可冷却液补充。']], calc: 'flow' },
    floor: { eq: 'CS-01', more: ['CS-02', 'CS-07'],
      how: ['AI racks weigh 1.3–1.5 t on ≈ 0.6–0.7 m² of floor. Slabs are designed for ≈ 20–25 kN/m² including the racks, coolant and overhead busway, and the delivery route (dock, lift, ramps) must carry the rack on its pallet.',
        'AI机柜重1.3–1.5 t，占地约0.6–0.7 m²。楼板按约20–25 kN/m²设计（含机柜、冷却液及上部母线），运输路线（卸货平台、货梯、坡道）须能承载带托盘的机柜。'],
      om: [['Check caster point loads on raised floors (if any).', '检查架空地板上的脚轮集中荷载（如有）。'], ['Mark permitted rack positions on the slab layout.', '在楼板布置图上标注允许的机柜位置。'], ['Seismic restraints for tall racks in higher-hazard zones (SNI 1726).', '较高地震风险区的高机柜设置抗震约束（SNI 1726）。']],
      basis: function (c) { return ['Design floor load ≥ ' + c.R.sp.floorLoad + ' kN/m² · heaviest rack ≈ ' + F(c.R.sp.heavyRack) + ' kg · clear height ' + c.R.sp.clearH, '楼面设计荷载≥' + c.R.sp.floorLoad + ' kN/m² · 最重机柜约' + F(c.R.sp.heavyRack) + ' kg · 净高' + c.R.sp.clearHzh]; }, calc: 'floor' },
    hall: { eq: 'IT-01', more: ['IT-02', 'IT-03', 'IT-06', 'IT-08'], name: ['White space (data halls)', '白区（数据机房）'],
      func: ['Houses the IT racks in secure, precisely cooled halls with power and network delivered to every rack.', '在安全、精密制冷的机房中安放IT机柜，并向每个机柜提供电力与网络。'],
      how: ['Racks stand in rows with contained hot or cold aisles; overhead busway and fibre trays feed them. The IT load per rack drives everything else — power distribution, cooling technology, floor loading and white-space area. Typical enterprise racks draw 5–15 kW; AI racks such as NVIDIA GB300 NVL72 draw ≈ 135 kW.',
        '机柜成排布置并封闭冷/热通道，上方母线与光纤桥架为其供电与联网。单柜IT负载决定其余一切——配电方式、制冷技术、楼面荷载及白区面积。典型企业机柜5–15 kW；NVIDIA GB300 NVL72等AI机柜约135 kW。'],
      om: [['Track rack power and inlet temperature in DCIM; avoid stranded capacity.', '在DCIM中跟踪机柜功率与进风温度，避免容量闲置。'], ['Bond every rack to the common bonding network.', '每个机柜接入公共等电位联结网络。'], ['Clean-room discipline: no cardboard, filtered make-up air, access logs.', '洁净管理：禁止纸箱入内，新风过滤，出入登记。']],
      basis: function (c) { var cap = c.R.cap; return [F(cap.racks) + ' racks: ' + F(cap.stdR) + ' × ' + F(cap.sd, 1) + ' kW + ' + F(cap.hdR) + ' × ' + F(cap.hd) + ' kW · ' + F(c.R.sp.ws) + ' m² in ' + c.R.sp.halls + ' hall(s)', F(cap.racks) + '个机柜：' + F(cap.stdR) + ' × ' + F(cap.sd, 1) + ' kW + ' + F(cap.hdR) + ' × ' + F(cap.hd) + ' kW · 白区' + F(c.R.sp.ws) + ' m²，' + c.R.sp.halls + '个机房']; },
      extra: function (c) { var ws = E.find(DB.spaces, 'WS'); return ws ? '<div><h3>' + L.te(['Spaces in the white space', '白区功能空间']) + '</h3><ul class="tc-li">' + ws.items.map(function (i) { return '<li>' + L.te(i) + '</li>'; }).join('') + '</ul></div>' : ''; }, calc: 'dens' },
    mmr: { eq: 'IT-10', more: ['IT-03', 'IT-05', 'IT-06', 'IT-11'],
      how: ['Carriers bring fibre into the site through at least two diverse duct routes and two entrance rooms; cross-connects in the meet-me room (MMR) join customers to carriers, clouds and internet exchanges. Carrier neutrality is a key value of colocation sites.',
        '运营商通过至少两条不同路由的管道及两个进线间将光纤引入场地；运营商交汇间（MMR）内的交叉连接将客户与运营商、云及互联网交换中心相连。运营商中立是托管数据中心的核心价值。'],
      om: [['Document every cross-connect (patch records) and audit quarterly.', '记录每条交叉连接（跳线记录），每季度审核。'], ['Keep duct routes ≥ 20 m apart and outside common trenches.', '管道路由间距≥20 m，避免共用管沟。'], ['Dual power and cooling for MMR equipment, as for the data halls.', 'MMR设备与数据机房一样双路供电、冗余制冷。']] },
    secsite: { eq: 'SC-03', more: ['SC-05', 'SC-02', 'SC-01'], name: ['Site perimeter & entry', '场地周界与出入口'],
      how: ['The first security layers: an anti-climb fence with perimeter intrusion detection, crash-rated vehicle barriers, a guardhouse and cameras, so an attempt is detected and verified before anyone reaches the building.',
        '首道安防层：防攀爬围栏配周界入侵探测、防冲撞车辆路障、门卫室及摄像机，在人员接近建筑前即探测并确认入侵企图。'],
      om: [['Walk-test every intrusion zone monthly.', '每月对每个入侵防区步测。'], ['Keep a vegetation-free clear zone along the fence.', '围栏沿线保持无植被的净空区。'], ['Camera call-up on every perimeter alarm.', '周界报警联动摄像机。']],
      basis: function (c) { return [c.R.fs.securityLayers + ' security layers · ≈ ' + F(c.R.fs.cams) + ' cameras · ≈ ' + F(c.R.fs.readers) + ' access-controlled doors', c.R.fs.securityLayers + '道安防层 · 约' + F(c.R.fs.cams) + '台摄像机 · 约' + F(c.R.fs.readers) + '个门禁点']; }, calc: 'cctv' },
    fence: { eq: 'SC-03',
      how: ['An anti-climb fence with a perimeter intrusion detection system (vibration or fibre-optic sensor), lighting and cameras forms the outer layer; every alarm is verified on video before guards respond.', '防攀爬围栏配周界入侵探测系统（振动或光纤传感）、照明及摄像机构成外层防线；每次报警先经视频确认再由保安响应。'],
      om: [['Walk-test every zone monthly.', '每月对每个防区步测。'], ['Clear zone of 2–3 m on both sides of the fence.', '围栏两侧保持2–3 m净空区。'], ['Check fence tension and sensor cable after storms.', '暴风雨后检查围栏张力及传感线缆。']], calc: 'cctv' },
    gate: { eq: 'SC-05', more: ['SC-03'],
      how: ['Crash-rated bollards and barriers (ASTM F2656 / IWA 14) stop hostile vehicles at the entrance; the guardhouse checks identity, visitors and deliveries before vehicles enter the site.', '防冲撞柱与路障（ASTM F2656 / IWA 14）在入口阻挡恶意车辆；门卫室在车辆入场前核验身份、访客及送货。'],
      om: [['Cycle-test barriers weekly.', '每周循环测试路障。'], ['Delivery bookings and vehicle search procedures.', '送货预约及车辆检查程序。'], ['Keep the gate staffed 24/7 with a radio link to the NOC.', '入口全天候值守，并与NOC无线电联络。']] },
    mantrap: { eq: 'SC-04', more: ['SC-01'],
      how: ['Interlocked doors or portals let only one person through per authorised badge: the second door opens only after the first has closed and the person is verified, preventing tailgating into the building and the data halls.', '联锁门或通道每次只允许一名持授权卡人员通过：第一道门关闭并核验后第二道门才开启，防止尾随进入建筑和数据机房。'],
      om: [['Test the interlock and anti-tailgating sensors monthly.', '每月测试联锁及防尾随传感器。'], ['Fail-safe/fail-secure behaviour agreed with the fire strategy.', '失电开/失电锁方式须与消防策略一致。'], ['Accessible bypass procedure for emergencies.', '应急情况下的无障碍旁路程序。']] },
    access: { eq: 'SC-01', more: ['SC-04', 'MC-03'],
      how: ['Card plus biometric (or PIN) readers control every door between zones. Rights follow least privilege, every event is logged and linked to video, and critical rooms apply a two-person rule.', '卡+生物识别（或密码）读卡器控制各区域之间的每扇门。权限遵循最小授权原则，所有事件均记录并联动视频，关键房间实行双人规则。'],
      om: [['Review access rights monthly and remove leavers the same day.', '每月审查权限，离职人员当日注销。'], ['Back-up power for controllers and locks.', '控制器及门锁设备后备电源。'], ['Keep the access system on its own secured network.', '门禁系统部署于独立的安全网络。']],
      basis: function (c) { return ['≈ ' + F(c.R.fs.readers) + ' access-controlled doors', '约' + F(c.R.fs.readers) + '个门禁点']; } },
    cctv: { eq: 'SC-02', more: ['SC-03'],
      how: ['IP cameras cover the perimeter, entrances, corridors, data-hall aisles and the loading dock. Video is recorded continuously (≥ 90 days is common for colocation) and analytics flag loitering or line crossing.', 'IP摄像机覆盖周界、出入口、走廊、机房通道及卸货区。视频连续录像（托管机房通常≥90天），智能分析识别徘徊或越线行为。'],
      om: [['Daily camera health check from the video management system.', '每日通过视频管理系统检查摄像机状态。'], ['Clean housings and check focus every quarter.', '每季度清洁防护罩并检查对焦。'], ['Test that recordings can be exported for evidence.', '测试录像可导出作为证据。']],
      basis: function (c) { return ['≈ ' + F(c.R.fs.cams) + ' cameras', '约' + F(c.R.fs.cams) + '台摄像机']; }, calc: 'cctv' },
    vesda: { eq: 'FP-02', more: ['FP-01'],
      how: ['Aspirating smoke detectors draw air continuously through sampling pipes to a laser chamber that sees smoke particles long before a flame appears. Alarm levels (alert, action, fire 1, fire 2) give staff time to find an overheating component before suppression is needed.',
        '吸气式感烟探测器通过采样管持续抽取空气至激光探测腔，在明火出现前很久即可检测到烟雾颗粒。分级报警（警告、行动、火警1、火警2）使人员有时间在需要灭火前找到过热部件。'],
      om: [['Check airflow and filters every 6 months; transport-time test every year.', '每6个月检查气流与过滤器；每年测试传输时间。'], ['Adjust thresholds after commissioning to the room background.', '调试后按房间背景值调整阈值。'], ['Keep sampling holes clear of new obstructions.', '采样孔不得被新增物遮挡。']],
      basis: function (c) { return ['≈ ' + c.R.fs.asd + ' aspirating detectors', '约' + c.R.fs.asd + '台吸气式探测器']; }, calc: 'asd', ill: function () { return IV.vesda(); } },
    agent: { eq: 'FP-03', more: ['FP-04', 'FP-09'],
      how: ['Clean agents (FK-5-1-12 or HFC-227ea) flood a sealed room to a design concentration that stops combustion within ≈ 10 s of discharge and leave no residue on IT equipment. The room must be tight enough to hold the concentration for ≥ 10 minutes, proven by a door-fan test.',
        '洁净气体（全氟己酮或七氟丙烷）在约10 s内喷放并充满密闭房间至设计浓度，抑制燃烧且不在IT设备上留下残留。房间须足够密闭以保持浓度≥10分钟，并经门风扇测试验证。'],
      om: [['Weigh cylinders (or check level) every 6 months.', '每6个月称重钢瓶（或检查液位）。'], ['Door-fan integrity test after any room alteration.', '房间改动后进行门风扇密闭性测试。'], ['Abort and manual-release stations clearly labelled; staff trained.', '紧急中止及手动释放按钮清晰标识，人员受训。']],
      basis: function (c) { var f = c.R.fs; return f.gasZones ? [f.gasZones + ' gas zones · ≈ ' + F(f.agentKg) + ' kg HFC-227ea equivalent', f.gasZones + '个气体防区 · 约' + F(f.agentKg) + ' kg（七氟丙烷当量）'] : ['Large halls: pre-action sprinklers; clean agent in MMR, electrical and battery rooms.', '大型机房：预作用喷淋；运营商交汇间、电气室及电池室采用洁净气体。']; }, calc: 'agent', ill: function () { return IV.agent(); } },
    preact: { eq: 'FP-05', more: ['FP-06'],
      how: ['Pipes stay dry until two independent events occur — a detector alarm and a sprinkler head opening — so an accidentally damaged head does not flood the data hall. Common in large halls where gas suppression is impractical.', '管网平时为干式，只有两个独立事件同时发生——探测器报警且喷头开启——才放水，意外损坏的喷头不会淹没机房。常用于不宜采用气体灭火的大型机房。'],
      om: [['Trip test the valves every year; supervise the air pressure.', '每年做阀门跳闸试验；监控管网气压。'], ['Check head clearances above new containment and trays.', '检查新增通道封闭及桥架上方的喷头净空。'], ['Drain low points to avoid corrosion.', '排放低点积水，防止腐蚀。']] },
    fap: { eq: 'FP-01', more: ['FP-09'],
      how: ['The addressable fire alarm panel collects every detector, manual call point and suppression status, runs the cause-and-effect matrix (release gas, close dampers, stop air handlers, call the fire brigade) and reports to the BMS and the NOC.', '可寻址火灾报警控制器汇集所有探测器、手动报警按钮及灭火状态，执行联动矩阵（释放气体、关闭风阀、停空调机组、通知消防队），并上报BMS及NOC。'],
      om: [['Test every device once a year (rolling programme).', '每年测试全部设备（滚动计划）。'], ['Keep the cause-and-effect matrix under change control.', '联动矩阵纳入变更管理。'], ['Joint drills with the local fire brigade (Damkar).', '与当地消防队（Damkar）联合演练。']] },
    liion: { eq: 'FP-08', more: ['EL-10', 'EL-23'],
      how: ['Lithium-ion rooms add off-gas detection that senses electrolyte vapour at the very start of thermal runaway, triggering battery isolation, ventilation and alarms before smoke appears. Separation and suppression follow NFPA 855 and the UL 9540A test results.', '锂电池室增设逸出气体探测，在热失控初期感知电解液蒸汽，于冒烟前触发电池隔离、通风及报警。防火间距与灭火按NFPA 855及UL 9540A测试结果确定。'],
      om: [['Calibrate off-gas sensors per the manufacturer (often yearly).', '按厂家要求校准逸出气体传感器（通常每年）。'], ['Keep exhaust fans on emergency power.', '排风机接应急电源。'], ['Coordinate the battery management system trips with the fire panel.', '电池管理系统脱扣与火灾报警控制器联动。']] },
    firepump: { eq: 'FP-06', more: ['FP-05'],
      how: ['Electric and diesel fire pumps draw from a dedicated fire-water tank to feed hydrants, hose reels and sprinklers at the required pressure, independent of the utility water supply.', '电动及柴油消防泵从专用消防水池取水，以所需压力向消火栓、软管卷盘及喷淋系统供水，不依赖市政供水。'],
      om: [['Weekly churn test; annual flow test.', '每周空转试验；每年流量试验。'], ['Keep the diesel fire pump fuel and batteries ready.', '保持柴油消防泵燃油及蓄电池就绪。'], ['Check tank level alarms and refill sources.', '检查水池液位报警及补水水源。']] },
    dcim: { eq: 'MC-03', more: ['MC-01', 'MC-02', 'MC-04'],
      how: ['Data center infrastructure management (DCIM) combines asset, space, power and cooling data to show capacity per room, row and rack, model changes before they are made and report PUE and service-level performance.', '数据中心基础设施管理（DCIM）整合资产、空间、电力与制冷数据，按机房、列、机柜显示容量，在变更前进行模拟，并报告PUE及服务水平表现。'],
      om: [['Keep the asset database audited (quarterly walk-downs).', '定期审核资产数据库（每季度现场核对）。'], ['Integrate BMS and EPMS through open protocols (BACnet, Modbus, SNMP).', '通过开放协议（BACnet、Modbus、SNMP）集成BMS与EPMS。'], ['Use capacity reports before accepting new customers.', '接纳新客户前先查看容量报告。']],
      basis: function (c) { return ['≈ ' + F(c.R.fs.bmsPts) + ' BMS points · ≈ ' + F(c.R.fs.meters) + ' meters · ' + F(c.R.cap.racks) + ' racks in the asset model', '约' + F(c.R.fs.bmsPts) + '个BMS点位 · 约' + F(c.R.fs.meters) + '块电表 · 资产模型' + F(c.R.cap.racks) + '个机柜']; }, calc: 'points' },
    noc: { eq: 'MC-05', more: ['MC-03'],
      how: ['The network and operations centre (NOC) is staffed 24/7. Video walls show BMS, EPMS, DCIM, fire and security alarms in one place, so operators can follow the emergency operating procedures (EOP) for every event.', '网络运营中心（NOC）全天候值守。视频墙集中显示BMS、EPMS、DCIM、消防及安防报警，运维人员可按应急操作程序（EOP）处置每个事件。'],
      om: [['Shift handover checklist and incident log.', '交接班清单及事件日志。'], ['Run emergency drills (utility failure, fire, cooling loss) every quarter.', '每季度进行应急演练（市电失电、火灾、失冷）。'], ['Redundant NOC workstation or remote NOC for continuity.', '设冗余NOC工位或远程NOC以保障连续性。']],
      basis: function (c) { var s = c.R.staff; return ['24/7 operations team ≈ ' + s.fte + ' FTE (facility ' + F(s.fac) + ', security ' + F(s.sec) + ', NOC ' + F(s.noc) + ')', '7×24运维团队约' + s.fte + '人（设施' + F(s.fac) + '、安保' + F(s.sec) + '、NOC ' + F(s.noc) + '）']; } },
    bldg: { eq: 'CS-01', more: ['CS-02', 'CS-03', 'CS-04', 'CS-06', 'CS-07'], name: ['Building & structure', '建筑与结构'],
      func: ['Protects and carries every system: structure, fire compartments, envelope, yards and logistics.', '保护并承载所有系统：结构、防火分区、围护、室外场地及物流。'],
      how: ['The building carries heavy racks and roof plant, separates halls, electrical and battery rooms into fire compartments, keeps water out and gives loading docks and lifts sized for racks and transformers. Seismic design follows SNI 1726:2019 for the site.',
        '建筑承载重型机柜及屋面设备，将机房、电气室及电池室划分为防火分区，防止渗水，并设置满足机柜与变压器运输的卸货平台及货梯。抗震设计按场地依据SNI 1726:2019。'],
      om: [['Roof and façade inspections before each rainy season.', '每个雨季前检查屋面及外墙。'], ['Fire-stopping audit after every cabling change.', '每次布线变更后检查防火封堵。'], ['Keep structural load drawings current with rack layouts.', '结构荷载图纸与机柜布置保持同步。']],
      basis: function (c) { var sp = c.R.sp; return [F(sp.gfa) + ' m² GFA · ' + c.p.floors + ' storey(s) · floor ≥ ' + sp.floorLoad + ' kN/m² · site ≈ ' + F(sp.siteNeed / 1e4, 2) + ' ha', '建筑面积' + F(sp.gfa) + ' m² · ' + c.p.floors + '层 · 楼面≥' + sp.floorLoad + ' kN/m² · 用地约' + F(sp.siteNeed / 1e4, 2) + ' ha']; }, calc: 'space' },
    ops: { name: ['Operations & commissioning', '运维与调试'],
      func: ['A 24/7 team, written procedures, maintenance and staged commissioning keep the design availability real.', '7×24团队、书面程序、维护保养及分级调试，使设计可用性真正落地。'],
      how: ['Most data-center outages trace back to people and process, not equipment. Sites run shift teams, standard (SOP), method (MOP) and emergency (EOP) procedures, planned maintenance and five commissioning levels from factory tests to the integrated systems test.',
        '大多数数据中心中断源于人员与流程而非设备。站点实行轮班团队、标准（SOP）、方法（MOP）及应急（EOP）程序、计划性维护，以及从工厂测试到综合系统测试的五级调试。'],
      basis: function (c) { var s = c.R.staff; return [s.fte + ' FTE: facility ' + F(s.fac) + ' · security ' + F(s.sec) + ' · NOC ' + F(s.noc) + ' · management ' + F(s.mgmt), s.fte + '人：设施' + F(s.fac) + ' · 安保' + F(s.sec) + ' · NOC ' + F(s.noc) + ' · 管理' + F(s.mgmt)]; },
      extra: function () {
        return '<div class="tc-g2"><div><h3>' + L.te(['Commissioning levels', '调试等级']) + '</h3>' + L.ptable(null, DB.cxLevels.map(function (x) { return ['<b>' + x[0] + '</b>', L.te([x[1], x[2]]), L.te([x[3], x[4]])]; })) + '</div>' +
          '<div><h3>' + L.te(['Project lifecycle', '项目生命周期']) + '</h3><ul class="tc-chain" style="gap:10px 24px">' + DB.lifecycle.map(function (x) { return '<li>' + L.te([x.en, x.zh]) + '</li>'; }).join('') + '</ul></div></div>';
      },
      om: [['Two people for any switching on live systems; written MOP signed off beforehand.', '带电系统任何操作需两人在场，事先签署书面MOP。'], ['Quarterly emergency drills; annual load-bank and IST-style tests.', '每季度应急演练；每年负载箱及IST式测试。'], ['Track availability, incidents and near misses; learn from each.', '跟踪可用性、事件及未遂事件，并总结改进。']] },
    firezone: { eq: 'FP-01', more: ['FP-02', 'FP-03', 'FP-05', 'FP-08'], name: ['Fire detection & suppression', '火灾探测与灭火'],
      func: ['Detects a fire at the earliest stage and suppresses it without damaging IT equipment, while protecting people.', '在最早期探测火情，在不损坏IT设备的前提下灭火，同时保障人员安全。'],
      how: ['Aspirating smoke detection senses overheating long before flames; clean-agent gas floods smaller rooms, pre-action sprinklers protect large halls, and lithium-ion rooms add off-gas detection. The fire alarm panel runs the cause-and-effect matrix.',
        '吸气式感烟探测在明火出现前很久即可感知过热；较小房间采用洁净气体全淹没，大型机房采用预作用喷淋，锂电池室增设逸出气体探测。火灾报警控制器执行联动矩阵。'],
      basis: function (c) { return [t(c.R.fs.suppression), t(c.R.fs.suppression)]; },
      om: [['Rolling annual test of all devices; cylinder weighing every 6 months.', '全部设备每年滚动测试；钢瓶每6个月称重。'], ['Door-fan tests after room changes.', '房间改动后进行门风扇测试。'], ['Drills with the local fire brigade.', '与当地消防队联合演练。']], calc: 'agent' },
    monzone: { eq: 'MC-03', more: ['MC-01', 'MC-02', 'MC-04', 'MC-05'], name: ['Monitoring & control', '监控与管理'],
      func: ['BMS, EPMS and DCIM give operators real-time visibility and control of power, cooling, environment and capacity.', 'BMS、EPMS与DCIM使运维人员实时掌握并控制电力、制冷、环境与容量。'],
      how: ['The building management system (BMS) runs the mechanical plant, the electrical power monitoring system (EPMS) watches the power chain, and DCIM ties assets, space and capacity together; alarms converge in the 24/7 NOC.',
        '楼宇管理系统（BMS）控制机电设备，电力监控系统（EPMS）监视供电链，DCIM整合资产、空间与容量；所有报警汇集至7×24 NOC。'],
      basis: function (c) { return ['≈ ' + F(c.R.fs.bmsPts) + ' BMS points · ≈ ' + F(c.R.fs.meters) + ' meters', '约' + F(c.R.fs.bmsPts) + '个BMS点位 · 约' + F(c.R.fs.meters) + '块电表']; },
      om: [['Alarm rationalisation: every alarm has an owner and a response.', '报警梳理：每条报警都有责任人及处置方式。'], ['Time-sync and back up all systems.', '所有系统时钟同步并备份。'], ['Separate OT network; strict remote access.', '独立OT网络；严格远程访问。']], calc: 'points' }
  };

  /* ================================================================ calculators (keys = theory ids) */
  var CALC = {
    pue: { i: [['it', ['IT load', 'IT负载'], 'MW', .1, 1000, .1, function (c) { return c.R.cap.itMW; }], ['mech', ['Cooling overhead', '制冷附加'], ['× IT', '× IT'], 0, 1, .01, function (c) { return +c.R.eff.mech.toFixed(2); }],
      ['elec', ['Electrical losses', '电气损耗'], ['× IT', '× IT'], 0, .2, .005, function (c) { return c.R.eff.elec; }], ['misc', ['Lighting & other', '照明及其他'], ['× IT', '× IT'], 0, .1, .005, function (c) { return c.R.eff.misc; }],
      ['occ', ['Average utilisation', '平均利用率'], '%', 10, 100, 5, function (c) { return c.p.targetOcc; }], ['tar', ['PLN tariff', 'PLN电价'], 'Rp/kWh', 500, 3000, 1, function (c) { return Math.round(c.p.tariffIDR); }]],
      f: function (v) {
        var pue = 1 + v.mech + v.elec + v.misc, itE = v.it * v.occ / 100 * 8760, fac = itE * pue, cost = fac * 1000 * v.tar;
        return [[['PUE', 'PUE'], '1 + ' + F(v.mech, 2) + ' + ' + F(v.elec, 3) + ' + ' + F(v.misc, 3), F(pue, 2)],
          [['IT energy per year', '年IT能耗'], F(v.it, 1) + ' MW × ' + F(v.occ) + ' % × 8,760 h', F(itE) + ' MWh'],
          [['Facility energy per year', '年设施总能耗'], F(itE) + ' × ' + F(pue, 2), F(fac) + ' MWh'],
          [['Overhead energy', '附加能耗'], F(fac) + ' − ' + F(itE), F(fac - itE) + ' MWh'],
          [['Electricity cost', '电费'], F(fac) + ' MWh × Rp ' + F(v.tar) + '/kWh', rp(cost)],
          [['Saving if PUE were 0.10 lower', 'PUE降低0.10可节省'], F(itE) + ' × 0.10 × Rp ' + F(v.tar), rp(itE * 0.1 * 1000 * v.tar)]];
      } },
    tier: { i: [['tier', ['Tier', '等级'], '', 1, 4, 1, function (c) { return c.p.tier; }], ['n', ['Duty units needed (N)', '所需工作单元（N）'], ['units', '台'], 1, 60, 1, function (c) { return c.R.el.upsN; }]],
      f: function (v) {
        var tr = DB.tiers[Math.min(3, Math.max(0, Math.round(v.tier) - 1))], r = E.redundancy(Math.round(v.tier), Math.round(v.n), 'ups'), dt = (1 - tr.avail / 100) * 8760;
        return [[['Availability target', '可用性目标'], tr.tia + ' · ' + tr.sni, F(tr.avail, 3) + ' %'],
          [['Downtime per year', '年停机时间'], '(1 − ' + F(tr.avail, 3) + ' %) × 8,760 h', F(dt, 1) + ' h (' + F(dt * 60) + ' min)'],
          [['Redundancy rule', '冗余规则'], tr.red, E.redLabel(Math.round(v.n), r)],
          [['Units installed', '安装台数'], F(v.n) + ' + ' + r, F(v.n + r)],
          [['Concurrently maintainable / fault tolerant', '可同时维护 / 容错'], tr.cm ? 'CM ✓' : 'CM ✗', (tr.ft ? 'FT ✓' : 'FT ✗')]];
      } },
    dens: { i: [['it', ['IT load', 'IT负载'], 'MW', .1, 1000, .1, function (c) { return c.R.cap.itMW; }], ['sd', ['Standard rack', '标准机柜'], 'kW', 1, 60, .5, function (c) { return c.R.cap.sd; }],
      ['s', ['High-density share', '高密度占比'], '%', 0, 100, 5, function (c) { return Math.round(c.R.cap.share * 100); }], ['hd', ['High-density rack', '高密度机柜'], 'kW', 5, 300, 1, function (c) { return c.R.cap.hd || 60; }]],
      f: function (v, c) {
        var s = v.s / 100, avg = (1 - s) * v.sd + s * v.hd, racks = Math.ceil(v.it * 1000 / avg), hdR = Math.round(racks * s), stdR = racks - hdR, ws = stdR * c.R.sp.stdArea + hdR * c.R.sp.hdArea;
        var tech = DB.cooling.filter(function (q) { return q.maxDens >= Math.max(v.sd, s > 0 ? v.hd : 0); })[0];
        return [[['Average density', '平均密度'], '(1 − ' + F(s, 2) + ') × ' + F(v.sd, 1) + ' + ' + F(s, 2) + ' × ' + F(v.hd), F(avg, 1) + ' kW/rack'],
          [['Number of racks', '机柜数量'], F(v.it * 1000) + ' kW ÷ ' + F(avg, 1), F(racks)],
          [['Standard / high-density', '标准 / 高密度'], F(racks) + ' × ' + F(s, 2), F(stdR) + ' / ' + F(hdR)],
          [['White space (≈)', '白区面积（约）'], F(stdR) + ' × ' + F(c.R.sp.stdArea, 2) + ' + ' + F(hdR) + ' × ' + F(c.R.sp.hdArea, 2) + ' m²', F(ws) + ' m²'],
          [['Lowest-cost cooling that fits', '满足要求的最低成本制冷'], ['max density ' + F(Math.max(v.sd, s > 0 ? v.hd : 0)) + ' kW', '最大密度 ' + F(Math.max(v.sd, s > 0 ? v.hd : 0)) + ' kW'], tech ? [tech.en, tech.zh] : '–']];
      } },
    mva: { i: [['it', ['IT load', 'IT负载'], 'kW', 50, 1000000, 50, function (c) { return c.R.cap.itKW; }], ['pk', ['PUE on the design day', '设计日PUE'], '', 1.05, 2, .01, function (c) { return +c.R.eff.puePeak.toFixed(2); }]],
      f: function (v, c) {
        var d = v.it * v.pk + K.UPS_LOSS * v.it + Math.max(50, 0.01 * v.it), kva = d / K.PF, mva = kva / 1000;
        var vc = mva <= 2 ? ['LV/MV service ≤ 20 kV', '低压/中压≤20 kV'] : mva <= 30 ? ['20 kV (PLN TM), dedicated feeders', '20 kV（PLN中压）专用馈线'] : mva <= 300 ? ['150 kV (PLN TT) + on-site substation', '150 kV（PLN高压）+自建变电站'] : ['500 kV / several 150 kV substations', '500 kV/多座150 kV变电站'];
        var size = kva <= 1600 ? pick([500, 630, 800, 1000, 1250, 1600], kva / 0.8) : (kva > 40000 ? 3150 : 2500), n = Math.ceil(kva / (size * K.TX_LOAD)), r = E.redundancy(c.p.tier, n, 'tx');
        return [[['Maximum demand', '最大需量'], F(v.it) + ' × ' + F(v.pk, 2) + ' + ' + K.UPS_LOSS + ' × ' + F(v.it) + ' + building', F(d) + ' kW'],
          [['Apparent power', '视在功率'], F(d) + ' ÷ ' + K.PF, F(kva) + ' kVA'],
          [['PLN connection', 'PLN接入'], F(mva, 1) + ' MVA', vc],
          [['Transformers (Tier ' + roman(c.p.tier) + ')', '变压器（Tier ' + roman(c.p.tier) + '）'], '⌈' + F(kva) + ' ÷ (' + F(size) + ' × ' + K.TX_LOAD + ')⌉ + ' + r, F(n + r) + ' × ' + F(size) + ' kVA']];
      } },
    tx: { i: [['kva', ['Maximum demand', '最大需量'], 'kVA', 100, 1000000, 10, function (c) { return Math.round(c.R.el.demandKVA); }], ['size', ['Transformer rating', '变压器容量'], 'kVA', 500, 3150, 10, function (c) { return c.R.el.txSize; }],
      ['ld', ['Loading limit', '负载率上限'], '%', 50, 100, 1, function () { return K.TX_LOAD * 100; }]],
      f: function (v, c) {
        var n = Math.ceil(v.kva / (v.size * v.ld / 100)), r = E.redundancy(c.p.tier, n, 'tx'), tot = n + r;
        return [[['Duty transformers', '工作变压器'], '⌈' + F(v.kva) + ' ÷ (' + F(v.size) + ' × ' + F(v.ld / 100, 2) + ')⌉', F(n)],
          [['Redundancy (Tier ' + roman(c.p.tier) + ')', '冗余（Tier ' + roman(c.p.tier) + '）'], E.redLabel(n, r), '+' + F(r)],
          [['Installed', '安装台数'], F(n) + ' + ' + F(r), F(tot) + ' × ' + F(v.size) + ' kVA'],
          [['Normal loading per unit', '正常时单台负载率'], F(v.kva) + ' ÷ (' + F(tot) + ' × ' + F(v.size) + ')', F(v.kva / (tot * v.size) * 100) + ' %']];
      } },
    fuel: { i: [['d', ['Maximum demand', '最大需量'], 'kW', 50, 1000000, 10, function (c) { return Math.round(c.R.el.demandKW); }], ['h', ['Fuel autonomy', '燃油自持'], 'h', 4, 120, 1, function (c) { return c.p.fuelH; }],
      ['q', ['Specific consumption', '比油耗'], 'L/kWh', .2, .35, .01, function () { return K.FUEL_L_KWH; }], ['tank', ['Tank size', '储罐容量'], 'm³', 10, 200, 10, function (c) { return c.R.el.tankSize; }]],
      f: function (v) {
        var lph = v.d * v.q, L = lph * v.h, tanks = Math.ceil(L / 1000 / v.tank), trucks = Math.ceil(L / 16000);
        return [[['Consumption at full load', '满载耗油'], F(v.d) + ' kW × ' + F(v.q, 2), F(lph) + ' L/h'],
          [['Fuel for the autonomy', '自持所需燃油'], F(lph) + ' × ' + F(v.h) + ' h', F(L / 1000, 1) + ' m³'],
          [['Bulk tanks', '主储油罐'], '⌈' + F(L / 1000, 1) + ' ÷ ' + F(v.tank) + '⌉', F(tanks) + ' × ' + F(v.tank) + ' m³'],
          [['Refill by 16 kL tankers', '16 kL油罐车补油'], F(L / 1000, 1) + ' ÷ 16', [F(trucks) + ' trucks', F(trucks) + ' 车']]];
      } },
    batt: { i: [['kw', ['UPS system rating', 'UPS单系统容量'], 'kW', 100, 2000, 50, function (c) { return c.R.el.upsSize; }], ['n', ['Installed UPS systems', '安装UPS系统数'], ['units', '台'], 1, 400, 1, function (c) { return c.R.el.upsTotal; }],
      ['m', ['Autonomy', '后备时间'], 'min', 1, 30, 1, function (c) { return c.p.upsMin; }], ['age', ['Ageing factor', '老化系数'], '', 1, 1.5, .05, function () { return K.BATT_AGE; }]],
      f: function (v) {
        var e1 = v.kw * v.m / 60, e2 = e1 * v.age / K.BATT_EFF, tot = e2 * v.n;
        return [[['Energy at the inverter', '逆变器所需能量'], F(v.kw) + ' kW × ' + F(v.m) + ' ÷ 60', F(e1, 1) + ' kWh'],
          [['With ageing and DC losses', '计入老化及直流损耗'], F(e1, 1) + ' × ' + F(v.age, 2) + ' ÷ ' + K.BATT_EFF, F(e2, 1) + ' kWh'],
          [['Total battery energy', '电池总能量'], F(e2, 1) + ' × ' + F(v.n), F(tot) + ' kWh'],
          [['Bridging margin over generator start (15 s)', '相对发电机启动（15 s）的裕度'], F(v.m * 60) + ' s ÷ 15 s', '× ' + F(v.m * 60 / 15)]];
      } },
    bwy: { i: [['row', ['IT load per row', '每排IT负载'], 'kW', 5, 3000, 5, function (c) { return Math.round(c.R.cap.itKW / c.R.el.rows); }], ['rk', ['Rack density', '机柜功率'], 'kW', 1, 200, 1, function (c) { return Math.round(c.R.cap.maxDens); }]],
      f: function (v) {
        var I = v.row / (K.BW_V * 1.732 * K.BW_F), bw = pick([160, 250, 400, 630, 800, 1000, 1250, 1600], I), Ir = v.rk / (K.BW_V * 1.732 * K.BW_F);
        var rp2 = v.rk <= 7 ? '1-ph 32 A' : v.rk <= 22 ? '3-ph 32 A' : v.rk <= 43 ? '3-ph 63 A' : Math.ceil(v.rk / 43) + ' × 3-ph 63 A';
        return [[['Row current', '每排电流'], F(v.row) + ' ÷ (√3 × ' + K.BW_V + ' × ' + K.BW_F + ')', F(I) + ' A'],
          [['Busway rating (each of A and B)', '母线额定（A、B各一）'], 'next standard ≥ ' + F(I) + ' A', bw + ' A'],
          [['Rack current', '机柜电流'], F(v.rk) + ' ÷ (√3 × ' + K.BW_V + ' × ' + K.BW_F + ')', F(Ir) + ' A'],
          [['Rack feed per side', '每路机柜进线'], F(v.rk) + ' kW', rp2]];
      } },
    bess: { i: [['it', ['IT load', 'IT负载'], 'MW', 1, 2000, 1, function (c) { return Math.max(1, Math.round(c.R.cap.itMW)); }], ['sh', ['BESS power share', '储能功率占比'], '% IT', 5, 50, 1, function (c) { return c.R.el.bess ? Math.round(c.R.el.bess.mw / c.R.cap.itMW * 100) : 15; }],
      ['h', ['Duration', '时长'], 'h', .5, 4, .5, function (c) { return c.R.el.bess ? c.R.el.bess.h : 1; }]],
      f: function (v) {
        var mw = v.it * v.sh / 100, mwh = mw * v.h, box = Math.ceil(mwh / K.BESS_MWH_BOX);
        return [[['BESS power', '储能功率'], F(v.it) + ' × ' + F(v.sh) + ' %', F(mw, 1) + ' MW'], [['Energy', '能量'], F(mw, 1) + ' × ' + F(v.h, 1) + ' h', F(mwh, 1) + ' MWh'],
          [['Containers', '集装箱数'], '⌈' + F(mwh, 1) + ' ÷ ' + K.BESS_MWH_BOX + '⌉', F(box)], [['Yard area (≈ 40 m² each)', '场地面积（每个约40 m²）'], F(box) + ' × 40', F(box * 40) + ' m²'],
          [['Indicative CAPEX', '参考投资'], F(mwh * 1000) + ' kWh × USD ' + E.BESS_USD_KWH, usd(mwh * 1000 * E.BESS_USD_KWH)]];
      } },
    air: { i: [['kw', ['Rack load', '机柜负载'], 'kW', 1, 80, .5, function (c) { return c.R.cap.sd; }], ['dt', ['Temperature rise across the servers', '服务器温升'], 'K', 6, 20, 1, function () { return 12; }],
      ['hall', ['Air-cooled heat in the hall', '机房风冷热负荷'], 'kW', 10, 500000, 10, function (c) { return Math.round(c.R.cool.airKW); }]],
      f: function (v) {
        var q = v.kw / (1.2 * 1.006 * v.dt), qh = q * 3600, H = v.hall / (1.2 * 1.006 * v.dt) * 3600, fw = Math.ceil(v.hall / K.FANWALL_KW);
        return [[['Airflow per rack', '单柜风量'], F(v.kw, 1) + ' ÷ (1.2 × 1.006 × ' + F(v.dt) + ')', F(q, 2) + ' m³/s'], [['Per hour', '每小时'], F(q, 2) + ' × 3,600', F(qh) + ' m³/h (' + F(qh * 0.5886) + ' CFM)'],
          [['Hall airflow', '机房总风量'], F(v.hall) + ' kW at ΔT ' + F(v.dt) + ' K', F(H) + ' m³/h'], [['Fan walls of ' + K.FANWALL_KW + ' kW (duty)', K.FANWALL_KW + ' kW风墙（工作）'], '⌈' + F(v.hall) + ' ÷ ' + K.FANWALL_KW + '⌉', F(fw)],
          [['Hot-aisle temperature (supply 24 °C)', '热通道温度（送风24 °C）'], '24 + ' + F(v.dt), F(24 + v.dt) + ' °C']];
      } },
    chw: { i: [['q', ['Chilled-water load', '冷冻水负荷'], 'kW', 50, 1000000, 50, function (c) { return Math.round(c.R.me.chwLoad || c.R.cool.airKW); }], ['size', ['Chiller size', '单机容量'], 'kW', 300, 4000, 1, function (c) { return c.R.me.chSize || 1407; }],
      ['dt', ['Chilled-water ΔT', '冷冻水温差'], 'K', 4, 12, .5, function () { return K.CHW_DT; }]],
      f: function (v, c) {
        var n = Math.ceil(v.q / v.size), r = E.redundancy(c.p.tier, n, 'plant'), fl = v.q / (4.186 * v.dt);
        return [[['Cooling capacity', '冷量'], F(v.q) + ' ÷ ' + K.RT_KW, F(v.q / K.RT_KW) + ' RT'], [['Duty chillers', '工作冷机'], '⌈' + F(v.q) + ' ÷ ' + F(v.size) + '⌉', F(n)],
          [['Installed (Tier ' + roman(c.p.tier) + ')', '安装（Tier ' + roman(c.p.tier) + '）'], E.redLabel(n, r), F(n + r) + ' × ' + F(v.size) + ' kW'], [['Chilled-water flow', '冷冻水流量'], F(v.q) + ' ÷ (4.186 × ' + F(v.dt, 1) + ')', F(fl) + ' L/s (' + F(fl * 3.6) + ' m³/h)'],
          [['Heat at the cooling towers', '冷却塔散热量'], F(v.q) + ' × ' + K.REJ, F(v.q * K.REJ) + ' kW']];
      } },
    tes: { i: [['q', ['Chilled-water load', '冷冻水负荷'], 'kW', 50, 1000000, 50, function (c) { return Math.round(c.R.me.chwLoad || c.R.cool.airKW); }], ['s', ['Ride-through time', '后备时间'], 's', 60, 1800, 30, function () { return K.TES_S; }],
      ['dt', ['Usable ΔT', '可用温差'], 'K', 4, 12, .5, function () { return K.CHW_DT; }]],
      f: function (v) {
        var kj = v.q * v.s, m3 = kj / (4.186 * v.dt) / 1000, d = Math.pow(m3 / (Math.PI / 4 * 1.5), 1 / 3);
        return [[['Cooling energy to store', '需储存冷量'], F(v.q) + ' kW × ' + F(v.s) + ' s', F(kj / 3600) + ' kWh'], [['Water volume', '水量'], F(kj) + ' kJ ÷ (4.186 × ' + F(v.dt, 1) + ') ÷ 1,000', F(m3) + ' m³'],
          [['Tank diameter (height = 1.5 × D)', '储罐直径（高 = 1.5 × D）'], '∛(' + F(m3) + ' ÷ (π/4 × 1.5))', F(d, 1) + ' m']];
      } },
    wue: { i: [['it', ['IT load', 'IT负载'], 'kW', 50, 1000000, 50, function (c) { return c.R.cap.itKW; }], ['occ', ['Average utilisation', '平均利用率'], '%', 10, 100, 5, function (c) { return c.p.targetOcc; }],
      ['heat', ['Heat to the towers', '冷却塔散热量'], 'kW', 0, 2000000, 50, function (c) { return Math.round(c.R.me.rejKW || c.R.cap.itKW * 1.1); }], ['coc', ['Cycles of concentration', '浓缩倍数'], '', 2, 10, .5, function () { return 5; }]],
      f: function (v) {
        var ev = v.heat * v.occ / 100 * 0.036, mu = ev * v.coc / (v.coc - 1), bd = ev / (v.coc - 1), wue = mu * 1000 / (v.it * v.occ / 100 * 24);
        return [[['Evaporation', '蒸发量'], F(v.heat) + ' kW × ' + F(v.occ) + ' % × 24 h × 3,600 ÷ 2,400 ÷ 1,000', F(ev) + ' m³/day'], [['Blowdown', '排污量'], F(ev) + ' ÷ (' + F(v.coc, 1) + ' − 1)', F(bd) + ' m³/day'],
          [['Make-up water', '补水量'], F(ev) + ' × ' + F(v.coc, 1) + ' ÷ (' + F(v.coc, 1) + ' − 1)', F(mu) + ' m³/day'], [['Water usage effectiveness', '用水效率'], F(mu * 1000) + ' L ÷ ' + F(v.it * v.occ / 100 * 24) + ' kWh', F(wue, 2) + ' L/kWh'],
          [['Per year', '每年'], F(mu) + ' × 365', F(mu * 365) + ' m³']];
      } },
    flow: { i: [['kw', ['Rack power', '机柜功率'], 'kW', 10, 300, 1, function (c) { return c.R.hdP.kw; }], ['liq', ['Share to liquid', '液冷占比'], '%', 50, 100, 1, function (c) { return Math.round((c.R.hdP.liq || .85) * 100); }],
      ['dt', ['Coolant temperature rise', '冷却液温升'], 'K', 4, 20, 1, function () { return 10; }]],
      f: function (v, c) {
        var q = v.kw * v.liq / 100, lpm = q / (1020 * 3.9 * v.dt) * 60000, cdu = c.R.me.cduSize || K.DC_KW, rk = Math.floor(cdu / q);
        return [[['Heat to liquid', '液冷热量'], F(v.kw) + ' × ' + F(v.liq) + ' %', F(q, 1) + ' kW'], [['Coolant flow (PG25)', '冷却液流量（PG25）'], F(q, 1) + ' ÷ (1,020 × 3.9 × ' + F(v.dt) + ') × 60,000', F(lpm) + ' L/min'],
          [['Flow per kW', '每kW流量'], F(lpm) + ' ÷ ' + F(q, 1), F(lpm / q, 2) + ' L/min·kW'], [['Heat left for air', '剩余风冷热量'], F(v.kw) + ' − ' + F(q, 1), F(v.kw - q, 1) + ' kW'],
          [['Racks per ' + F(cdu) + ' kW CDU', '每台' + F(cdu) + ' kW CDU可带机柜'], '⌊' + F(cdu) + ' ÷ ' + F(q, 1) + '⌋', F(rk)]];
      } },
    cdu: { i: [['q', ['Heat to liquid', '液冷热量'], 'kW', 100, 2000000, 100, function (c) { return Math.round(c.R.cool.liquidKW || 5000); }], ['size', ['CDU capacity', 'CDU容量'], 'kW', 200, 2500, 50, function (c) { return c.R.me.cduSize || 1500; }],
      ['dt', ['Facility-water ΔT', '设施水温差'], 'K', 4, 15, .5, function () { return 8; }]],
      f: function (v) {
        var n = Math.ceil(v.q / v.size), r = Math.max(1, Math.ceil(n / K.CDU_N_PER_R)), fl = v.q / (4.186 * v.dt), dc = Math.ceil(v.q * 1.05 / K.DC_KW);
        return [[['Duty CDUs', '工作CDU'], '⌈' + F(v.q) + ' ÷ ' + F(v.size) + '⌉', F(n)], [['Standby CDUs (1 per ' + K.CDU_N_PER_R + ')', '备用CDU（每' + K.CDU_N_PER_R + '台1台）'], '⌈' + F(n) + ' ÷ ' + K.CDU_N_PER_R + '⌉', F(r)],
          [['Facility-water flow', '设施水流量'], F(v.q) + ' ÷ (4.186 × ' + F(v.dt, 1) + ')', F(fl) + ' L/s'], [['Dry coolers of ' + F(K.DC_KW) + ' kW (duty)', F(K.DC_KW) + ' kW干冷器（工作）'], '⌈' + F(v.q) + ' × 1.05 ÷ ' + F(K.DC_KW) + '⌉', F(dc)]];
      } },
    appr: { i: [['db', ['Design dry-bulb', '设计干球温度'], '°C', 20, 45, .5, function (c) { return c.R.L.db; }], ['a1', ['Dry-cooler approach', '干冷器趋近温度'], 'K', 3, 15, .5, function () { return 7; }],
      ['a2', ['CDU approach', 'CDU趋近温度'], 'K', 1, 8, .5, function () { return 3; }]],
      f: function (v) {
        var fws = v.db + v.a1, tcs = fws + v.a2, cls = tcs <= 17 ? 'W17' : tcs <= 27 ? 'W27' : tcs <= 32 ? 'W32' : tcs <= 40 ? 'W40' : tcs <= 45 ? 'W45' : 'W+';
        return [[['Facility-water supply (dry cooler only)', '设施水供水（仅干冷器）'], F(v.db, 1) + ' + ' + F(v.a1, 1), F(fws, 1) + ' °C'], [['Technology-loop supply to the racks', '至机柜的技术环路供液'], F(fws, 1) + ' + ' + F(v.a2, 1), F(tcs, 1) + ' °C'],
          [['ASHRAE liquid class needed', '所需ASHRAE液冷等级'], tcs.toFixed(1) + ' °C', cls], [['Chiller-less all year?', '全年无冷机？'], ['if the IT accepts ' + cls, '若IT接受' + cls], tcs <= 45 ? ['possible with W45-rated IT', 'W45级IT可实现'] : ['add trim chiller or tower', '需增设补冷冷机或冷却塔']]];
      } },
    floor: { i: [['kg', ['Rack weight (loaded)', '机柜重量（满载）'], 'kg', 300, 3000, 10, function (c) { return c.R.sp.heavyRack || 1360; }], ['w', ['Rack width', '机柜宽度'], 'mm', 600, 1200, 10, function (c) { return c.R.hdP.w || 600; }],
      ['d', ['Rack depth', '机柜深度'], 'mm', 1000, 1400, 10, function (c) { return c.R.hdP.d || 1200; }], ['aisle', ['Share of aisle per rack', '每柜分摊通道'], 'm²', 0, 2, .05, function () { return .9; }]],
      f: function (v, c) {
        var a = v.w * v.d / 1e6, p1 = v.kg * 9.81 / 1000 / a, p2 = v.kg * 9.81 / 1000 / (a + v.aisle);
        return [[['Rack footprint', '机柜占地'], F(v.w) + ' × ' + F(v.d) + ' mm', F(a, 2) + ' m²'], [['Pressure under the rack', '机柜下方压强'], F(v.kg) + ' × 9.81 ÷ 1,000 ÷ ' + F(a, 2), F(p1, 1) + ' kN/m²'],
          [['Spread over rack + aisle', '计入通道后均布'], F(v.kg) + ' × 9.81 ÷ 1,000 ÷ ' + F(a + v.aisle, 2), F(p2, 1) + ' kN/m²'], [['Design live load in this basis', '本基准设计活荷载'], ['engine rule', '引擎规则'], '≥ ' + c.R.sp.floorLoad + ' kN/m²']];
      } },
    space: { i: [['racks', ['Racks', '机柜数'], '', 10, 20000, 10, function (c) { return c.R.cap.racks; }], ['ar', ['White space per rack', '每柜白区面积'], 'm²', 1.5, 6, .1, function (c) { return +c.R.sp.rackArea.toFixed(1); }],
      ['ratio', ['GFA ÷ white space', '建筑面积 ÷ 白区'], '', 1.5, 6, .1, function (c) { return +(c.R.sp.gfa / c.R.sp.ws).toFixed(1); }], ['fl', ['Storeys', '层数'], '', 1, 6, 1, function (c) { return c.p.floors; }],
      ['kdb', ['Site coverage KDB', '建筑密度KDB'], '%', 20, 90, 5, function (c) { return c.p.kdb; }]],
      f: function (v, c) {
        var ws = v.racks * v.ar, gfa = ws * v.ratio, fp = gfa / v.fl, site = fp / (v.kdb / 100);
        return [[['White space', '白区面积'], F(v.racks) + ' × ' + F(v.ar, 1), F(ws) + ' m²'], [['Gross floor area', '总建筑面积'], F(ws) + ' × ' + F(v.ratio, 1), F(gfa) + ' m²'],
          [['Footprint', '占地面积'], F(gfa) + ' ÷ ' + F(v.fl), F(fp) + ' m²'], [['Land from coverage only', '仅按建筑密度所需用地'], F(fp) + ' ÷ ' + F(v.kdb) + ' %', F(site) + ' m²'],
          [['Engine estimate incl. yards & substation', '引擎估算（含室外场地及变电站）'], ['basis', '基准'], F(c.R.sp.siteNeed / 1e4, 2) + ' ha']];
      } },
    agent: { i: [['v', ['Protected volume', '保护容积'], 'm³', 50, 20000, 10, function (c) { return Math.round(Math.min(800, c.R.sp.ws / Math.max(1, c.R.fs.gasZones || 1)) * 4.5); }],
      ['ag', ['Agent: 1 = HFC-227ea, 2 = FK-5-1-12', '灭火剂：1 = 七氟丙烷，2 = 全氟己酮'], '', 1, 2, 1, function () { return 1; }], ['cc', ['Design concentration', '设计浓度'], '%', 3, 10, .1, function () { return 7.5; }], ['tt', ['Minimum room temperature', '最低室温'], '°C', 10, 30, 1, function () { return 20; }]],
      f: function (v) {
        var hfc = Math.round(v.ag) !== 2, S = hfc ? 0.1269 + 0.000513 * v.tt : 0.0664 + 0.000274 * v.tt, W = v.v / S * v.cc / (100 - v.cc);
        return [[['Specific vapour volume S', '比容S'], hfc ? '0.1269 + 0.000513 × ' + F(v.tt) : '0.0664 + 0.000274 × ' + F(v.tt), F(S, 4) + ' m³/kg'],
          [['Agent quantity', '灭火剂用量'], F(v.v) + ' ÷ ' + F(S, 4) + ' × ' + F(v.cc, 1) + ' ÷ (100 − ' + F(v.cc, 1) + ')', F(W) + ' kg'],
          [['Flooding factor', '充装系数'], F(W) + ' ÷ ' + F(v.v), F(W / v.v, 3) + ' kg/m³'], [['Discharge time (NFPA 2001)', '喷放时间（NFPA 2001）'], hfc ? 'HFC-227ea' : 'FK-5-1-12', '≤ 10 s']];
      } },
    asd: { i: [['ws', ['White space', '白区面积'], 'm²', 100, 500000, 50, function (c) { return Math.round(c.R.sp.ws); }], ['m2', ['Area per detector', '单台覆盖面积'], 'm²', 500, 2000, 50, function () { return K.ASD_M2; }],
      ['pl', ['Electrical & mechanical rooms', '电气及暖通机房'], 'm²', 0, 500000, 50, function (c) { return Math.round(c.R.sp.elecRoom + c.R.sp.mechRoom); }]],
      f: function (v) {
        var a = Math.ceil(v.ws / v.m2), b = Math.ceil(v.pl / 2000);
        return [[['Detectors for the white space', '白区探测器'], '⌈' + F(v.ws) + ' ÷ ' + F(v.m2) + '⌉', F(a)], [['Detectors for plant rooms (2,000 m² each)', '设备房探测器（每台2,000 m²）'], '⌈' + F(v.pl) + ' ÷ 2,000⌉', F(b)],
          [['Total aspirating detectors', '吸气式探测器合计'], F(a) + ' + ' + F(b), F(a + b)], [['Maximum transport time', '最大传输时间'], 'EN 54-20 / NFPA 72', '≤ 120 s']];
      } },
    cctv: { i: [['n', ['Cameras', '摄像机数量'], '', 10, 20000, 1, function (c) { return c.R.fs.cams; }], ['mb', ['Bit rate per camera', '单路码率'], 'Mbps', 1, 16, .5, function () { return 4; }],
      ['d', ['Retention', '保存天数'], ['days', '天'], 30, 365, 1, function () { return 90; }]],
      f: function (v) {
        var day = v.mb * 86400 / 8 / 1000, tb = v.n * day * v.d / 1000, raw = tb * 1.25;
        return [[['Per camera per day', '单路每日'], F(v.mb, 1) + ' Mbps × 86,400 s ÷ 8', F(day, 1) + ' GB'], [['Storage for the retention', '保存期存储量'], F(v.n) + ' × ' + F(day, 1) + ' GB × ' + F(v.d), F(tb) + ' TB'],
          [['With RAID & headroom (× 1.25)', '计入RAID及余量（×1.25）'], F(tb) + ' × 1.25', F(raw) + ' TB'], [['Network load to recorders', '至录像机网络负载'], F(v.n) + ' × ' + F(v.mb, 1) + ' Mbps', F(v.n * v.mb / 1000, 2) + ' Gbps']];
      } },
    points: { i: [['it', ['IT load', 'IT负载'], 'MW', .1, 1000, .1, function (c) { return c.R.cap.itMW; }], ['tx', ['Transformers', '变压器'], '', 1, 1000, 1, function (c) { return c.R.el.txTotal; }],
      ['ups', ['UPS systems', 'UPS系统'], '', 1, 1000, 1, function (c) { return c.R.el.upsTotal; }], ['bw', ['Busway runs', '母线条数'], '', 0, 5000, 1, function (c) { return c.R.el.busways; }]],
      f: function (v) {
        var b = Math.round(400 + 450 * v.it), m = Math.round(20 + v.tx * 12 + v.ups * 4 + v.bw * 2);
        return [[['BMS points', 'BMS点位'], '400 + 450 × ' + F(v.it, 1), F(b)], [['EPMS meters', 'EPMS电表'], '20 + 12 × ' + F(v.tx) + ' + 4 × ' + F(v.ups) + ' + 2 × ' + F(v.bw), F(m)],
          [['Data points per MW (BMS + EPMS)', '每MW数据点（BMS+EPMS）'], '(' + F(b) + ' + ' + F(m) + ' × 20) ÷ ' + F(v.it, 1), F((b + m * 20) / v.it)]];
      } }
  };

  /* ================================================================ inside views (detail-panel illustrations) */
  var IV = {
    ups: function () {
      var o = L.text(20, 24, ['Double-conversion UPS (on-line)', '双变换在线式UPS'], 'tc-lt');
      function box(x, y, w, h, fill, label, sub) { return L.R(x, y, w, h, fill, ' rx="10"') + L.text(x + w / 2, y + h / 2 + (sub ? -2 : 5), label, 'tc-lw', ' text-anchor="middle" style="font-size:13px"') + (sub ? L.text(x + w / 2, y + h / 2 + 15, sub, 'tc-lw', ' text-anchor="middle" style="font-size:11px;opacity:.85"') : ''); }
      o += box(10, 110, 100, 56, '#E39B1B', ['Utility / gen.', '市电/发电机'], 'AC 400 V') + box(150, 110, 100, 56, '#3F3CBB', ['Rectifier', '整流器'], 'AC → DC') + box(290, 110, 100, 56, '#3F3CBB', ['Inverter', '逆变器'], 'DC → AC') + box(430, 110, 90, 56, '#17153F', ['IT load', 'IT负载'], 'A + B');
      o += L.R(200, 196, 140, 52, '#16A34A', ' rx="10"') + L.text(270, 220, ['Battery (DC bus)', '电池（直流母线）'], 'tc-lw', ' text-anchor="middle" style="font-size:12.5px"') + L.text(270, 238, ['bridges 10–15 s gen. start', '桥接10–15 s发电机启动'], 'tc-lw', ' text-anchor="middle" style="font-size:10.5px"');
      o += L.pipe('M110 138H150', 'lv', 6) + L.pipe('M250 138H290', 'dc', 6) + L.pipe('M390 138H430', 'lv', 6) + L.pipe('M270 166V196', 'dc', 5, true, true);
      o += '<path d="M60 110V62H470V110" fill="none" stroke="#9AA0BC" stroke-width="3" stroke-dasharray="7 5"/>' + L.text(265, 54, ['Static bypass (faults, overload)', '静态旁路（故障、过载）'], 'tc-ls', ' text-anchor="middle" style="font-weight:700"');
      return L.illSvg(o, '0 0 530 260');
    },
    chiller: function () {
      var o = L.text(20, 24, ['Vapour-compression cycle', '蒸气压缩制冷循环'], 'tc-lt');
      o += L.R(30, 60, 170, 70, '#0EA5C6', ' rx="12"') + L.text(115, 92, ['Evaporator', '蒸发器'], 'tc-lw', ' text-anchor="middle" style="font-size:14px"') + L.text(115, 112, ['CHW 22 → 14 °C', '冷冻水 22→14 °C'], 'tc-lw', ' text-anchor="middle"');
      o += L.R(330, 60, 170, 70, '#3F3CBB', ' rx="12"') + L.text(415, 92, ['Condenser', '冷凝器'], 'tc-lw', ' text-anchor="middle" style="font-size:14px"') + L.text(415, 112, ['CW 32 → 37 °C', '冷却水 32→37 °C'], 'tc-lw', ' text-anchor="middle"');
      o += L.pipe('M200 110Q235 170 235 180', '#E5806E', 5, true) + L.pipe('M295 180Q300 150 330 110', '#E5534B', 5, true) + L.pipe('M330 70H200', '#9AA0BC', 4, true, true);
      o += '<circle cx="265" cy="192" r="42" fill="#17153F"/>' + L.text(265, 189, ['Compressor', '压缩机'], 'tc-lw', ' text-anchor="middle" style="font-size:12px"') + L.text(265, 205, ['magnetic bearing', '磁悬浮'], 'tc-lw', ' text-anchor="middle" style="font-size:9.5px"');
      o += '<path d="M258 64l14 12M272 64l-14 12" stroke="#17153F" stroke-width="3"/>' + L.text(265, 52, ['Expansion valve', '膨胀阀'], 'tc-ls', ' text-anchor="middle" style="font-weight:700"');
      o += L.text(265, 250, ['COP = cooling ÷ compressor power ≈ 6–8 at elevated chilled water', '提高冷冻水温度时 COP = 制冷量 ÷ 压缩机功率 ≈ 6–8'], 'tc-ls', ' text-anchor="middle"');
      return L.illSvg(o, '0 0 530 262');
    },
    aisle: function () {
      var o = L.text(20, 24, ['Hot-aisle containment (section)', '热通道封闭（剖面）'], 'tc-lt');
      o += L.R(10, 230, 510, 8, '#C9CDDE') + L.R(10, 40, 510, 6, '#C9CDDE');
      o += L.rack(130, 92, 60, 138, {}) + L.rack(330, 92, 60, 138, {}) + L.containment(190, 70, 140, 160);
      o += L.air('M30 200H120', false, 5) + L.air('M500 200H400', false, 5) + L.air('M200 180V90', true, 5) + L.air('M320 180V90', true, 5) + L.air('M260 70V52H490', true, 4);
      o += L.text(70, 190, ['cold aisle 24 °C', '冷通道 24 °C'], 'tc-ls', ' text-anchor="middle" style="font-weight:700;fill:#0B7F99"') + L.text(450, 190, ['cold aisle 24 °C', '冷通道 24 °C'], 'tc-ls', ' text-anchor="middle" style="font-weight:700;fill:#0B7F99"');
      o += L.text(260, 150, ['hot aisle 36 °C', '热通道 36 °C'], 'tc-ls', ' text-anchor="middle" style="font-weight:700;fill:#B0302A"') + L.text(400, 66, ['return to fan walls', '回风至风墙'], 'tc-ls', ' style="fill:#B0302A"');
      return L.illSvg(o, '0 0 530 248');
    },
    coldplate: function () {
      var o = L.text(20, 24, ['Cold plate on a GPU (section)', 'GPU冷板（剖面）'], 'tc-lt');
      o += L.R(40, 200, 450, 14, '#2E7D4F', ' rx="3"') + L.text(265, 232, ['circuit board', '电路板'], 'tc-ls', ' text-anchor="middle"');
      o += L.R(170, 172, 190, 28, '#3A3F63', ' rx="3"') + L.text(265, 191, ['GPU package', 'GPU芯片'], 'tc-lw', ' text-anchor="middle"');
      o += L.R(150, 120, 230, 48, '#B9BED2', ' rx="6" stroke="#17153F" stroke-opacity=".4"');
      for (var i = 0; i < 12; i++) o += L.R(160 + i * 18, 128, 8, 32, i % 2 ? '#7ADBEE' : '#4FC3E0', ' rx="2"');
      o += L.pipe('M60 140H150', 'tcs', 7) + L.pipe('M380 150H470', 'tcr', 7);
      o += L.text(90, 128, ['in ≈ 35 °C', '进 ≈ 35 °C'], 'tc-ls', ' text-anchor="middle" style="font-weight:700;fill:#0B7F99"') + L.text(430, 138, ['out ≈ 45 °C', '出 ≈ 45 °C'], 'tc-ls', ' text-anchor="middle" style="font-weight:700;fill:#B0302A"');
      o += L.text(265, 104, ['micro-channels (copper) · thermal interface material below', '微通道（铜）· 下方为导热界面材料'], 'tc-ls', ' text-anchor="middle"');
      o += L.text(265, 60, ['≈ 85–90 % of tray heat to liquid', '约85–90%托盘热量由液体带走'], 'tc-lt', ' text-anchor="middle" style="font-size:14px"');
      return L.illSvg(o, '0 0 530 246');
    },
    cdu: function () {
      var o = L.text(20, 24, ['CDU: technology loop ↔ facility water', 'CDU：技术环路↔设施水'], 'tc-lt');
      o += L.R(200, 60, 130, 170, '#EFF1F8', ' rx="10" stroke="#9AA0BC"') + L.phe(225, 80, 80, 70) + L.text(265, 172, ['plate heat exchanger', '板式换热器'], 'tc-ls', ' text-anchor="middle"');
      o += '<circle cx="240" cy="205" r="13" fill="#0EA5C6"/><circle cx="290" cy="205" r="13" fill="#0EA5C6"/>' + L.text(265, 248, ['duty + standby pumps · 25–50 µm filter', '主备水泵 · 25–50 µm过滤器'], 'tc-ls', ' text-anchor="middle"');
      o += L.pipe('M20 100H200', 'tcs', 7) + L.pipe('M200 200H20', 'tcr', 7) + L.pipe('M330 100H510', 'fwr', 7) + L.pipe('M510 200H330', 'fws', 7);
      o += L.text(110, 88, ['to racks (TCS) 35 °C', '至机柜（TCS）35 °C'], 'tc-ls', ' text-anchor="middle" style="font-weight:700"') + L.text(110, 224, ['from racks 45 °C', '机柜回液 45 °C'], 'tc-ls', ' text-anchor="middle" style="font-weight:700"');
      o += L.text(420, 88, ['to dry coolers (FWS) 40 °C', '至干冷器（FWS）40 °C'], 'tc-ls', ' text-anchor="middle" style="font-weight:700"') + L.text(420, 224, ['from dry coolers 32 °C', '干冷器回水 32 °C'], 'tc-ls', ' text-anchor="middle" style="font-weight:700"');
      return L.illSvg(o, '0 0 530 262');
    },
    vesda: function () {
      var o = L.text(20, 24, ['Aspirating smoke detection', '吸气式感烟探测'], 'tc-lt');
      o += '<path d="M40 70H500" stroke="#E5534B" stroke-width="5"/>';
      for (var i = 0; i < 8; i++) { var x = 70 + i * 56; o += '<circle cx="' + x + '" cy="70" r="4" fill="#fff" stroke="#E5534B" stroke-width="2"/>' + L.bubbles(x - 4, 74, 8, 40, 2, 3 + i, '#9AA0BC', .6, false, 1.2, 2.2); }
      o += '<path d="M40 70V150" stroke="#E5534B" stroke-width="5"/>' + L.vesda(10, 150, 64, 86);
      var lv = [[['Alert', '警告'], .05, '#16A34A'], [['Action', '行动'], .1, '#E39B1B'], [['Fire 1', '火警1'], .2, '#E5534B'], [['Fire 2', '火警2'], .5, '#8E1F1A']];
      lv.forEach(function (l, j) { var y = 120 + j * 30; o += L.R(130, y, 60 + j * 70, 20, l[2], ' rx="5"') + L.text(140, y + 14, l[0], 'tc-lw') + L.text(200 + j * 70, y + 14, '≈ ' + l[1] + ' %obs/m', 'tc-ls', ' style="font-weight:700"'); });
      o += L.text(270, 104, ['sampling holes · transport time ≤ 120 s', '采样孔 · 传输时间≤120 s'], 'tc-ls', ' text-anchor="middle"');
      return L.illSvg(o, '0 0 530 252');
    },
    agent: function () {
      var o = L.text(20, 24, ['Total flooding of a sealed room', '密闭房间全淹没灭火'], 'tc-lt');
      o += L.R(150, 50, 360, 180, '#F4F5FB', ' rx="6" stroke="#5E6484" stroke-width="3"') + L.rackRow(220, 120, 4, 34, 100, {});
      o += '<path d="M150 66H510" stroke="#C93A33" stroke-width="4"/>';
      [240, 330, 420].forEach(function (x) { o += '<path d="M' + x + ' 66v8" stroke="#C93A33" stroke-width="4"/>' + L.bubbles(x - 30, 76, 60, 40, 5, x, '#E5534B', .35, true, 3, 6); });
      o += L.gasCyl(20, 130, 4, 'tcRed') + '<path d="M50 118V66H150" stroke="#C93A33" stroke-width="4" fill="none"/>';
      o += L.text(330, 246, ['design concentration held ≥ 10 min · door-fan test', '设计浓度保持≥10 min · 门风扇测试'], 'tc-ls', ' text-anchor="middle"');
      return L.illSvg(o, '0 0 530 256');
    },
    twoN: function () {
      var o = L.text(20, 24, ['2N power paths to a dual-corded server', '双路径（2N）至双电源服务器'], 'tc-lt');
      function chain(y, col, lab) {
        var s = L.R(20, y, 90, 34, col, ' rx="8"') + L.text(65, y + 22, lab, 'tc-lw', ' text-anchor="middle"');
        [['TX', 140], ['UPS', 240], ['PDU', 340]].forEach(function (b) { s += L.R(b[1], y, 70, 34, '#3F3CBB', ' rx="8"') + L.text(b[1] + 35, y + 22, b[0], 'tc-lw', ' text-anchor="middle"'); });
        return s + L.pipe('M110 ' + (y + 17) + 'H140M210 ' + (y + 17) + 'H240M310 ' + (y + 17) + 'H340', 'lv', 4);
      }
      o += chain(50, '#E39B1B', ['Path A', 'A路']) + chain(170, '#E39B1B', ['Path B', 'B路']);
      o += L.R(450, 98, 64, 84, '#17153F', ' rx="6"') + L.text(482, 145, ['Server', '服务器'], 'tc-lw', ' text-anchor="middle"');
      o += L.pipe('M410 67H430V120H450', 'lv', 4) + L.pipe('M410 187H430V160H450', 'lv', 4);
      o += L.text(265, 128, ['either path carries 100 % of the load', '任一路径均可承担100%负荷'], 'tc-ls', ' text-anchor="middle" style="font-weight:700"');
      return L.illSvg(o, '0 0 530 230');
    },
    pueBar: function (c) {
      var e = c.R.eff, W = 480, sc = W / (1 + e.mech + e.elec + e.misc), x = 25, o = L.text(20, 24, ['Facility energy per unit of IT energy', '单位IT能耗对应的设施能耗'], 'tc-lt');
      [[['IT', 'IT'], 1, '#3F3CBB'], [['Cooling', '制冷'], e.mech, '#0EA5C6'], [['Electrical', '电气'], e.elec, '#E39B1B'], [['Other', '其他'], e.misc, '#5D6280']].forEach(function (p, i) {
        o += L.R(x, 50, p[1] * sc, 44, p[2]) + (p[1] * sc > 50 ? L.text(x + p[1] * sc / 2, 77, F(p[1], 2), 'tc-lw', ' text-anchor="middle"') : '');
        o += L.R(25 + i * 124, 108, 10, 10, p[2]) + L.text(39 + i * 124, 118, [t(p[0]) + ' ' + F(p[1], 2), t(p[0]) + ' ' + F(p[1], 2)], 'tc-ls', ' style="font-weight:700"'); x += p[1] * sc;
      });
      o += L.text(265, 160, ['PUE = ' + F(e.pue, 2) + ' (annual) · ' + F(e.puePeak, 2) + ' (design day)', 'PUE = ' + F(e.pue, 2) + '（年均）· ' + F(e.puePeak, 2) + '（设计日）'], 'tc-lt', ' text-anchor="middle"');
      return L.illSvg(o, '0 0 530 180');
    },
    densRanges: function () {
      var o = L.text(20, 24, ['Cooling technology by rack density (knowledge base)', '按机柜密度的制冷技术（知识库）'], 'tc-lt'), max = 210;
      DB.cooling.forEach(function (q, i) {
        var y = 44 + i * 30, w = q.maxDens / max * 300;
        o += L.text(10, y + 15, [q.en.replace(/ \(.*\)/, '').slice(0, 30), q.zh.replace(/（.*）/, '').slice(0, 12)], 'tc-ls', ' style="font-weight:700;font-size:11.5px"');
        o += L.R(185, y + 2, w, 18, ['#8B8FBF', '#3F3CBB', '#2A2785', '#0B7F99', '#0EA5C6', '#E39B1B'][i % 6], ' rx="5"') + L.text(191 + w, y + 16, '≤ ' + q.maxDens + ' kW', 'tc-ls');
      });
      return L.illSvg(o, '0 0 560 230');
    },
    layers: function (c) {
      var o = L.text(20, 24, ['Security layers from fence to rack', '从围栏到机柜的安防层级'], 'tc-lt'), labs = [['Perimeter fence & detection', '周界围栏与探测'], ['Gate & vehicle barriers', '入口与车辆路障'], ['Building envelope & reception', '建筑围护与前台'], ['Mantrap', '防尾随通道'], ['Data hall door', '机房门'], ['Customer cage', '客户笼位'], ['Locked rack', '机柜锁']];
      var lt = ''; labs.forEach(function (l, i) { var p = i * 22; o += '<rect x="' + (20 + p) + '" y="' + (40 + p * .75) + '" width="' + (490 - 2 * p) + '" height="' + (230 - p * 1.5) + '" rx="10" fill="' + ['#ECECFB', '#E2E3F8', '#D8D9F4', '#CBCCF0', '#BBBDEA', '#A9ABE3', '#3F3CBB'][i] + '" stroke="#fff"/>'; lt += L.text(30 + p, 56 + p * .75, (i + 1) + ' · ' + t(l), i === 6 ? 'tc-lw' : 'tc-ls', ' style="font-weight:700"'); }); o += lt;
      return L.illSvg(o, '0 0 530 280');
    },
    timeline: function (c) {
      var o = L.text(20, 24, ['Utility failure: who carries the IT load', '市电失电：由谁承担IT负荷'], 'tc-lt');
      o += '<path d="M30 160H510" stroke="#5D6280" stroke-width="2"/>';
      [[0, '0 s'], [90, '10–15 s'], [190, '1 min'], [330, c.p.upsMin + ' min'], [480, c.p.fuelH + ' h']].forEach(function (m) { o += '<path d="M' + (30 + m[0]) + ' 154v12" stroke="#5D6280" stroke-width="2"/>' + L.text(30 + m[0], 184, m[1], 'tc-ls', ' text-anchor="middle" style="font-weight:700"'); });
      o += L.R(30, 60, 70, 30, '#E39B1B', ' rx="6"') + L.text(65, 80, 'PLN', 'tc-lw', ' text-anchor="middle"');
      o += L.R(30, 100, 330, 30, '#16A34A', ' rx="6" opacity=".85"') + L.text(195, 120, ['UPS batteries (capacity until ' + c.p.upsMin + ' min)', 'UPS电池（容量可达' + c.p.upsMin + '分钟）'], 'tc-lw', ' text-anchor="middle"');
      o += L.R(120, 60, 390, 30, '#3F3CBB', ' rx="6"') + L.text(315, 80, ['Generators carry the load (fuel ' + c.p.fuelH + ' h)', '发电机带载（燃油' + c.p.fuelH + ' h）'], 'tc-lw', ' text-anchor="middle"');
      return L.illSvg(o, '0 0 530 200');
    }
  };

  /* ================================================================ theory library (id = calculator key) */
  var TH = {
    pue: { title: ['Power usage effectiveness (PUE)', '电能使用效率（PUE）'],
      body: ['PUE compares all the energy the facility draws with the energy that reaches the IT. 1.0 would mean zero overhead; cooling dominates the overhead, followed by electrical losses (transformers, UPS) and lighting. Indonesia’s hot, humid climate (design wet-bulb ≈ 27–28 °C) gives few free-cooling hours, so efficient chillers, elevated water temperatures and liquid cooling matter most.',
        'PUE是设施总能耗与到达IT设备能耗之比。1.0表示零附加能耗；附加能耗以制冷为主，其次为电气损耗（变压器、UPS）及照明。印尼湿热气候（设计湿球约27–28 °C）自然冷却时数很少，因此高效冷机、提高水温及液冷最为关键。'],
      formula: ['PUE = facility energy ÷ IT energy\n    = 1 + cooling + electrical losses + other', 'PUE = 设施总能耗 ÷ IT能耗\n    = 1 + 制冷 + 电气损耗 + 其他'],
      ex: function (c) { var e = c.R.eff; return ['For this basis: 1 + ' + F(e.mech, 3) + ' + ' + F(e.elec, 3) + ' + ' + F(e.misc, 3) + ' = <b>' + F(e.pue, 2) + '</b> annual (' + F(e.puePeak, 2) + ' on the design day). China’s GB 40879 grades: ≤ 1.20 grade 1, ≤ 1.30 grade 2, ≤ 1.50 grade 3.',
        '本基准：1 + ' + F(e.mech, 3) + ' + ' + F(e.elec, 3) + ' + ' + F(e.misc, 3) + ' = 年均<b>' + F(e.pue, 2) + '</b>（设计日' + F(e.puePeak, 2) + '）。中国GB 40879分级：≤1.20为1级，≤1.30为2级，≤1.50为3级。']; },
      visual: function (c) { return IV.pueBar(c); } },
    tier: { title: ['Tier, redundancy & availability', '等级、冗余与可用性'],
      body: ['Redundancy is written as N (just enough capacity), N+1 (one spare unit) or 2N (two complete systems). Uptime Tier III requires concurrent maintainability — any component or path can be taken out for maintenance without shutting down the IT; Tier IV adds fault tolerance, so a single failure anywhere does not drop the IT load.',
        '冗余表示为N（容量刚好满足）、N+1（一台备用）或2N（两套完整系统）。Uptime Tier III要求可同时维护——任一组件或路径均可退出维护而不中断IT；Tier IV增加容错，任何单点故障都不会导致IT失电。'],
      formula: ['Downtime per year = (1 − availability) × 8,760 h', '年停机时间 = (1 − 可用性) × 8,760 h'],
      ex: function (c) { var tr = c.R.cap.tier; return ['Tier ' + roman(c.p.tier) + ': ' + tr.avail + ' % → <b>' + F((1 - tr.avail / 100) * 8760, 1) + ' h/yr</b>. UPS in this basis: ' + c.R.el.upsN + ' duty + ' + c.R.el.upsR + ' (' + c.R.el.upsLabel + '); generators ' + c.R.el.genLabel + '; transformers ' + c.R.el.txLabel + '.',
        'Tier ' + roman(c.p.tier) + '：' + tr.avail + ' % → <b>' + F((1 - tr.avail / 100) * 8760, 1) + ' h/年</b>。本基准UPS：' + c.R.el.upsN + '台工作 + ' + c.R.el.upsR + '台（' + c.R.el.upsLabel + '）；发电机' + c.R.el.genLabel + '；变压器' + c.R.el.txLabel + '。']; },
      visual: function () { return IV.twoN(); },
      table: function (c) { return '<div><h3>' + L.te(['Tier cross-reference (knowledge base)', '等级对照（知识库）']) + '</h3>' + L.ptable(['Uptime', ['Redundancy', '冗余'], ['Availability', '可用性'], 'TIA-942', 'SNI 8799', 'EN 50600', 'GB 50174'], DB.tiers.map(function (x) { var r = [L.te([x.en, x.zh]), x.red, x.avail + ' %', x.tia, x.sni, x.en50600, L.e(x.gb)]; r.cur = x.n === c.p.tier; return r; })) + '</div>'; } },
    dens: { title: ['Rack density & IT capacity', '机柜密度与IT容量'],
      body: ['The design IT load divided by the average rack density gives the number of racks, and the density decides the cooling: air (CRAH or fan walls) up to ≈ 25 kW, rear-door coolers to ≈ 75 kW, and direct liquid cooling beyond ≈ 40 kW for GPU racks. A small share of high-density racks raises the average quickly.',
        '设计IT负载除以平均机柜功率即得机柜数量，而功率密度决定制冷方式：约25 kW以内采用风冷（精密空调或风墙），约75 kW以内可用背板换热，GPU机柜约40 kW以上采用冷板液冷。少量高密度机柜即可迅速拉高平均值。'],
      formula: ['Racks = IT load ÷ average kW per rack\naverage = (1 − s) × standard + s × high-density', '机柜数 = IT负载 ÷ 平均单柜kW\n平均 = (1 − s) × 标准 + s × 高密度'],
      ex: function (c) { var k = c.R.cap; return ['This basis: ' + F(k.itKW) + ' kW ÷ ' + F(k.avgDens, 1) + ' kW = <b>' + F(k.racks) + ' racks</b> (' + F(k.stdR) + ' × ' + F(k.sd, 1) + ' kW + ' + F(k.hdR) + ' × ' + F(k.hd) + ' kW).', '本基准：' + F(k.itKW) + ' kW ÷ ' + F(k.avgDens, 1) + ' kW = <b>' + F(k.racks) + '个机柜</b>（' + F(k.stdR) + ' × ' + F(k.sd, 1) + ' kW + ' + F(k.hdR) + ' × ' + F(k.hd) + ' kW）。']; },
      visual: function () { return IV.densRanges(); } },
    mva: { title: ['From IT load to PLN demand', '从IT负载到PLN需量'],
      body: ['The utility connection must carry the IT load plus cooling at the hottest hour, UPS losses and battery recharge, and the building. The voltage follows the demand and the PLN system: up to ≈ 30 MVA at 20 kV, up to ≈ 300 MVA at 150 kV with an on-site GIS substation, beyond that 500 kV (Java–Bali) or 275 kV (Sumatra, Kalimantan, Sulawesi) with interbus transformers to a 150 kV campus network; 220/230 kV is the equivalent in other ASEAN grids. Every rating downstream — HV/MV and MV/LV transformers, switchgear, generators, UPS — follows the same demand.',
        '电网接入须承担IT负载、最热时段的制冷、UPS损耗与电池充电以及建筑负荷。电压等级由需量及PLN电网决定：约30 MVA以内为20 kV，约300 MVA以内为150 kV并自建GIS变电站，更大时采用500 kV（爪哇-巴厘）或275 kV（苏门答腊、加里曼丹、苏拉威西），经联络变压器接入园区150 kV网络；220/230 kV为其他东盟电网的对应等级。下游各额定值——高/中压及中/低压变压器、开关设备、发电机、UPS——均随同一需量确定。'],
      formula: ['Demand (kW) = IT × PUE(design day) + ' + K.UPS_LOSS * 100 + ' % UPS losses + building\nkVA = kW ÷ ' + K.PF, '需量（kW）= IT × 设计日PUE + ' + K.UPS_LOSS * 100 + '% UPS损耗 + 建筑\nkVA = kW ÷ ' + K.PF],
      ex: function (c) { var el = c.R.el; return ['This basis: ' + F(c.R.cap.itKW) + ' kW × ' + F(c.R.eff.puePeak, 2) + ' + … = ' + F(el.demandKW) + ' kW → <b>' + F(el.mva, 1) + ' MVA</b>, ' + t(el.volt) + '.', '本基准：' + F(c.R.cap.itKW) + ' kW × ' + F(c.R.eff.puePeak, 2) + ' + … = ' + F(el.demandKW) + ' kW → <b>' + F(el.mva, 1) + ' MVA</b>，' + el.volt[1] + '。']; } },
    space: { title: ['Space, building & site', '空间、建筑与场地'],
      body: ['White space is only part of the building: electrical rooms (UPS, batteries, switchboards), mechanical plant and support areas typically double or triple it. Yards for generators, transformers, fuel and heat rejection, plus setbacks and the site-coverage rule (KDB), set the land needed.',
        '白区只是建筑的一部分：电气室（UPS、电池、配电柜）、暖通机房及辅助区通常使面积增至两到三倍。发电机、变压器、燃油及散热设备场地，加上退界与建筑密度（KDB）规定，共同决定所需用地。'],
      formula: ['GFA ≈ (white space + electrical + mechanical + support) × 1.15\nsite ≈ max(footprint ÷ KDB, (footprint + yards + substation) × 1.6)', '建筑面积 ≈ (白区 + 电气 + 暖通 + 辅助) × 1.15\n用地 ≈ max(占地 ÷ KDB, (占地 + 场地 + 变电站) × 1.6)'],
      ex: function (c) { var sp = c.R.sp; return ['This basis: white space ' + F(sp.ws) + ' m², electrical ' + F(sp.elecRoom) + ' m², mechanical ' + F(sp.mechRoom) + ' m², support ' + F(sp.support) + ' m² → <b>' + F(sp.gfa) + ' m² GFA</b>, site ≈ <b>' + F(sp.siteNeed / 1e4, 2) + ' ha</b>.', '本基准：白区' + F(sp.ws) + ' m²、电气' + F(sp.elecRoom) + ' m²、暖通' + F(sp.mechRoom) + ' m²、辅助' + F(sp.support) + ' m² → <b>建筑面积' + F(sp.gfa) + ' m²</b>，用地约<b>' + F(sp.siteNeed / 1e4, 2) + ' ha</b>。']; } },
    batt: { title: ['UPS battery autonomy', 'UPS电池后备时间'],
      body: ['The battery only has to bridge the generator start (≈ 10–15 s) plus a few retries. Five minutes is standard with lithium-ion; 10–15 minutes with VRLA or for Tier IV. The sizing adds an end-of-life ageing margin and the inverter losses.',
        '电池只需桥接发电机启动（约10–15 s）及数次重试。锂电标准为5分钟；阀控铅酸或Tier IV为10–15分钟。选型需计入寿命末期老化裕量及逆变器损耗。'],
      formula: ['kWh = UPS kW × minutes ÷ 60 × ' + K.BATT_AGE + ' ÷ ' + K.BATT_EFF, 'kWh = UPS kW × 分钟 ÷ 60 × ' + K.BATT_AGE + ' ÷ ' + K.BATT_EFF],
      ex: function (c) { var el = c.R.el; return ['This basis: ' + el.upsTotal + ' × ' + F(el.upsSize) + ' kW × ' + c.p.upsMin + ' min → <b>' + F(el.battKWh) + ' kWh</b> ' + t(bat(c)) + '.', '本基准：' + el.upsTotal + ' × ' + F(el.upsSize) + ' kW × ' + c.p.upsMin + ' min → <b>' + F(el.battKWh) + ' kWh</b> ' + bat(c)[1] + '。']; },
      visual: function (c) { return IV.timeline(c); } },
    fuel: { title: ['Generator fuel autonomy', '发电机燃油自持'],
      body: ['Uptime Tier III and IV require at least 12 h of on-site fuel at full load; TIA-942 references 72 h (Rated-3) and 96 h (Rated-4). Indonesian operators usually hold 24–48 h, more where the PLN grid is weak or fuel deliveries take long.',
        'Uptime Tier III与IV要求满载下现场燃油至少12 h；TIA-942参考72 h（Rated-3）及96 h（Rated-4）。印尼运营商通常储备24–48 h，电网较弱或供油周期长的地区更多。'],
      formula: ['Fuel (L) = maximum demand (kW) × ' + K.FUEL_L_KWH + ' L/kWh × hours', '燃油（L）= 最大需量（kW）× ' + K.FUEL_L_KWH + ' L/kWh × 小时'],
      ex: function (c) { var el = c.R.el; return ['This basis: ' + F(el.demandKW) + ' kW × ' + K.FUEL_L_KWH + ' × ' + c.p.fuelH + ' h = <b>' + F(el.fuelL / 1000) + ' m³</b> in ' + el.tanks + ' × ' + el.tankSize + ' m³ tanks.', '本基准：' + F(el.demandKW) + ' kW × ' + K.FUEL_L_KWH + ' × ' + c.p.fuelH + ' h = <b>' + F(el.fuelL / 1000) + ' m³</b>，' + el.tanks + ' × ' + el.tankSize + ' m³储罐。']; },
      visual: function (c) { var d = c.R.el.demandKW, o = L.text(20, 24, ['Fuel volume by autonomy for this demand', '该需量下不同自持时间的燃油量'], 'tc-lt'), mx = d * K.FUEL_L_KWH * 96 / 1000;
        [12, 24, 48, 72, 96].forEach(function (h, i) { var v = d * K.FUEL_L_KWH * h / 1000, w = v / mx * 360; o += L.text(20, 64 + i * 32, h + ' h', 'tc-ls', ' style="font-weight:700"') + L.R(70, 50 + i * 32, w, 20, h === c.p.fuelH ? '#3F3CBB' : '#B9BCE6', ' rx="5"') + L.text(78 + w, 65 + i * 32, F(v) + ' m³', 'tc-ls'); });
        return L.illSvg(o, '0 0 530 220'); } },
    bwy: { title: ['Busway & rack power', '母线与机柜供电'],
      body: ['Current grows with power: at 400 V three-phase a 22 kW rack draws ≈ 32 A, a 43 kW rack ≈ 63 A, and a 135 kW AI rack needs several 63 A feeds or OEM power shelves fed by busway. Busway sized per row keeps rows flexible as densities change.',
        '电流随功率增大：400 V三相下22 kW机柜约32 A，43 kW约63 A，135 kW AI机柜需多路63 A或由母线供电的OEM电源架。按排配置母线，可在密度变化时保持灵活。'],
      formula: ['I = P ÷ (√3 × ' + K.BW_V + ' kV × ' + K.BW_F + ')', 'I = P ÷ (√3 × ' + K.BW_V + ' kV × ' + K.BW_F + ')'],
      ex: function (c) { var el = c.R.el; return ['This basis: ' + F(c.R.cap.itKW / el.rows) + ' kW per row → <b>' + el.bwA + ' A</b> busway, A + B per row; standard racks ' + el.rStd[0] + '.', '本基准：每排' + F(c.R.cap.itKW / el.rows) + ' kW → <b>' + el.bwA + ' A</b>母线，每排A+B；标准机柜' + el.rStd[1] + '。']; } },
    bess: { title: ['Battery energy storage (BESS)', '电池储能系统（BESS）'],
      body: ['AI training clusters can swing tens of megawatts within seconds as jobs synchronise. A BESS of typically 10–25 % of the IT power for 1–2 h absorbs the swings, shaves PLN peak demand and firms solar. LFP containers of ≈ 3.5–5 MWh are tested to UL 9540A and spaced according to NFPA 855.',
        'AI训练集群在任务同步时可在数秒内波动数十兆瓦。通常按IT功率10–25%、时长1–2 h配置的储能可吸收波动、削减PLN峰值需量并稳定光伏。约3.5–5 MWh的LFP集装箱经UL 9540A测试，并按NFPA 855布置间距。'],
      formula: ['MWh = MW × hours · containers = ⌈MWh ÷ ' + K.BESS_MWH_BOX + '⌉', 'MWh = MW × 小时 · 集装箱 = ⌈MWh ÷ ' + K.BESS_MWH_BOX + '⌉'],
      ex: function (c) { var b = c.R.el.bess; return b ? ['This basis: <b>' + F(b.mw, 1) + ' MW / ' + F(b.mwh, 1) + ' MWh</b> in ' + b.containers + ' containers, ≈ ' + usd(b.capex) + '. Basis of the proposal: ' + t(c.x.why.bessOn), '本基准：<b>' + F(b.mw, 1) + ' MW / ' + F(b.mwh, 1) + ' MWh</b>，' + b.containers + '个集装箱，约' + usd(b.capex) + '。建议依据：' + t(c.x.why.bessOn)] : ['No BESS is proposed for this basis: ' + t(c.x.why.bessOn), '本基准未建议储能：' + t(c.x.why.bessOn)]; } },
    air: { title: ['Heat & airflow', '热量与风量'],
      body: ['Every kilowatt of IT becomes heat, and air can carry it only in large volumes. With a 12 K rise across the servers, 1 kW needs ≈ 250 m³/h of air — which is why air cooling stops being practical above ≈ 25–40 kW per rack.',
        'IT的每千瓦都会变成热量，而空气只能以大风量带走热量。服务器温升12 K时，1 kW约需250 m³/h风量——这就是单柜约25–40 kW以上风冷不再实用的原因。'],
      formula: ['Airflow (m³/s) = kW ÷ (1.2 kg/m³ × 1.006 kJ/kg·K × ΔT)', '风量（m³/s）= kW ÷ (1.2 kg/m³ × 1.006 kJ/kg·K × ΔT)'],
      ex: function (c) { var k = c.R.cap.sd; return ['A ' + F(k, 1) + ' kW rack at ΔT 12 K needs ' + F(k / (1.2 * 1.006 * 12) * 3600) + ' m³/h; this basis moves ' + F(c.R.cool.airKW) + ' kW by air.', F(k, 1) + ' kW机柜在温升12 K时需' + F(k / (1.2 * 1.006 * 12) * 3600) + ' m³/h；本基准风冷热量' + F(c.R.cool.airKW) + ' kW。']; },
      visual: function () { return IV.aisle(); } },
    chw: { title: ['Chilled-water plant sizing', '冷冻水机房选型'],
      body: ['The chilled-water load is the air-side IT heat plus the losses released in the white space. Chillers are counted with Tier redundancy, and the flow follows the temperature difference — a wider ΔT means smaller pipes and pumps. Heat rejected at the towers adds the compressor energy (≈ 18 %).',
        '冷冻水负荷为风侧IT热量加上白区内释放的损耗。冷机按Tier冗余计数，流量随温差确定——温差越大，管径与水泵越小。冷却塔散热量还需加上压缩机能耗（约18%）。'],
      formula: ['RT = kW ÷ ' + K.RT_KW + '\nflow (L/s) = kW ÷ (4.186 × ΔT)', 'RT = kW ÷ ' + K.RT_KW + '\n流量（L/s）= kW ÷ (4.186 × ΔT)'],
      ex: function (c) { var me = c.R.me; return me.chN ? ['This basis: ' + F(me.chwLoad) + ' kW = ' + F(me.chwLoad / K.RT_KW) + ' RT → <b>' + (me.chN + me.chR) + ' × ' + F(me.chSize) + ' kW</b> (' + me.chLabel + ').', '本基准：' + F(me.chwLoad) + ' kW = ' + F(me.chwLoad / K.RT_KW) + ' RT → <b>' + (me.chN + me.chR) + ' × ' + F(me.chSize) + ' kW</b>（' + me.chLabel + '）。'] : ['This basis has no chilled-water plant.', '本基准无冷冻水机房。']; },
      visual: function () { return IV.chiller(); } },
    wue: { title: ['Water use (WUE)', '用水效率（WUE）'],
      body: ['Cooling towers evaporate ≈ 1.5 L of water per kWh of heat rejected, plus blowdown that controls dissolved solids. WUE = annual site water ÷ IT energy; water-cooled plants in the tropics reach ≈ 1.8–2.0 L/kWh, air-cooled and dry-cooler plants ≈ 0.05–0.35.',
        '冷却塔每散热1 kWh约蒸发1.5 L水，另需排污控制溶解性固体。WUE = 年用水量 ÷ IT能耗；热带水冷系统约1.8–2.0 L/kWh，风冷及干冷系统约0.05–0.35。'],
      formula: ['evaporation (m³/h) ≈ kW × 3,600 ÷ 2,400 ÷ 1,000\nmake-up = evaporation × CoC ÷ (CoC − 1)', '蒸发量（m³/h）≈ kW × 3,600 ÷ 2,400 ÷ 1,000\n补水 = 蒸发量 × CoC ÷ (CoC − 1)'],
      ex: function (c) { return ['This basis: WUE <b>' + F(c.R.eff.wue, 2) + ' L/kWh</b> → ' + F(c.R.me.waterDay) + ' m³/day at ' + c.p.targetOcc + ' % utilisation; storage ' + F(c.R.me.waterStore) + ' m³.', '本基准：WUE <b>' + F(c.R.eff.wue, 2) + ' L/kWh</b> → 利用率' + c.p.targetOcc + '%时' + F(c.R.me.waterDay) + ' m³/日；储水' + F(c.R.me.waterStore) + ' m³。']; } },
    tes: { title: ['Thermal storage ride-through', '蓄冷后备'],
      body: ['When the utility fails, the chillers stop until the generators are on line and the compressors restart — often 2–5 minutes. Pumps and fans on UPS keep circulating water from a storage tank sized for the restart time, so the IT inlet temperature stays inside the ASHRAE envelope.',
        '市电失电时，冷机停止运行，直至发电机上线且压缩机重启——通常需2–5分钟。UPS供电的水泵与风机继续从按重启时间选型的蓄冷罐循环供水，使IT进风温度保持在ASHRAE范围内。'],
      formula: ['V = Q × t ÷ (ρ · cp · ΔT)', 'V = Q × t ÷ (ρ · cp · ΔT)'],
      ex: function (c) { return c.R.me.tesM3 ? ['This basis: ' + F(c.R.me.chwLoad) + ' kW × ' + K.TES_S + ' s → <b>' + F(c.R.me.tesM3) + ' m³</b> at ΔT ' + K.CHW_DT + ' K.', '本基准：' + F(c.R.me.chwLoad) + ' kW × ' + K.TES_S + ' s → <b>' + F(c.R.me.tesM3) + ' m³</b>（温差' + K.CHW_DT + ' K）。'] : ['Not required for this basis (Tier and density below the threshold).', '本基准无需配置（等级与密度低于阈值）。']; } },
    ashrae: { title: ['ASHRAE thermal envelope', 'ASHRAE温湿度范围'], calc: false,
      body: ['ASHRAE TC 9.9 recommends 18–27 °C server inlet air (class A1 allowable 15–32 °C) with a dew point between −9 and 15 °C. Raising the supply towards 24–27 °C cuts chiller energy, but the hot aisle then reaches 35–45 °C — lighting, cabling and staff access must suit it. Liquid-cooled IT follows the W classes (W17–W45).',
        'ASHRAE TC 9.9推荐服务器进风18–27 °C（A1允许15–32 °C），露点−9至15 °C。将送风提高至24–27 °C可降低冷机能耗，但热通道将达35–45 °C——照明、布线与人员通行需适应。液冷IT按W等级（W17–W45）。'],
      ex: function (c) { return ['Design outdoor conditions at ' + c.R.L.en + ': ' + c.R.L.db + ' °C dry-bulb, ' + c.R.L.wb + ' °C wet-bulb.', c.R.L.zh + '室外设计条件：干球' + c.R.L.db + ' °C、湿球' + c.R.L.wb + ' °C。']; },
      visual: function () { var o = L.text(20, 24, ['Inlet temperature classes (°C)', '进风温度等级（°C）'], 'tc-lt');
        [[['Recommended', '推荐'], 18, 27, '#16A34A'], ['A1', 15, 32, '#0EA5C6'], ['A2', 10, 35, '#3F3CBB'], ['A3', 5, 40, '#2A2785'], ['A4', 5, 45, '#8B8FBF'], [['H1 (high density)', 'H1（高密度）'], 15, 25, '#E5534B']].forEach(function (r, i) {
          var y = 44 + i * 30; o += L.text(14, y + 15, r[0], 'tc-ls', ' style="font-weight:700"') + L.R(150 + r[1] * 7.5, y + 2, (r[2] - r[1]) * 7.5, 18, r[3], ' rx="5"') + L.text(156 + r[2] * 7.5, y + 16, r[1] + '–' + r[2], 'tc-ls'); });
        return L.illSvg(o, '0 0 560 230'); } },
    flow: { title: ['Coolant flow for cold plates', '冷板冷却液流量'],
      body: ['Per unit volume, water carries ≈ 3,500 times more heat than air. A GB300 NVL72 rack rejects ≈ 85–90 % of its heat to liquid; with 25 % propylene glycol (PG25) and a 10 K rise it needs ≈ 1.5 L/min per kW — about 180 L/min for the rack.',
        '单位体积的水携热能力约为空气的3,500倍。GB300 NVL72机柜约85–90%热量进入液体；采用25%丙二醇（PG25）、温升10 K时约需1.5 L/min/kW——整柜约180 L/min。'],
      formula: ['Flow (L/min) = kW ÷ (ρ · cp · ΔT) × 60,000\nPG25: ρ ≈ 1,020 kg/m³, cp ≈ 3.9 kJ/kg·K', '流量（L/min）= kW ÷ (ρ · cp · ΔT) × 60,000\nPG25：ρ ≈ 1,020 kg/m³，cp ≈ 3.9 kJ/kg·K'],
      ex: function (c) { var hp = c.R.hdP, q = hp.kw * (hp.liq || .85); return [hp.en + ': ' + F(q) + ' kW to liquid → <b>' + F(q / (1020 * 3.9 * 10) * 60000) + ' L/min</b> at ΔT 10 K.', hp.zh + '：液冷' + F(q) + ' kW → 温升10 K时<b>' + F(q / (1020 * 3.9 * 10) * 60000) + ' L/min</b>。']; },
      visual: function () { return IV.coldplate(); } },
    cdu: { title: ['CDU & heat rejection', 'CDU与散热'],
      body: ['CDUs are counted like any critical plant: duty units for the liquid heat plus standby. Each one hands its heat to the facility water through a plate heat exchanger; dry coolers (or towers) reject it outdoors, with ≈ 5 % margin for pump heat and fouling.',
        'CDU与其他关键设备一样按工作台数加备用配置。每台通过板式换热器将热量传给设施水；由干冷器（或冷却塔）排至室外，并预留约5%余量用于水泵发热及结垢。'],
      formula: ['CDUs = ⌈liquid kW ÷ CDU kW⌉ + ⌈N ÷ ' + K.CDU_N_PER_R + '⌉\ndry coolers = ⌈liquid kW × 1.05 ÷ ' + K.DC_KW + '⌉', 'CDU = ⌈液冷kW ÷ 单台kW⌉ + ⌈N ÷ ' + K.CDU_N_PER_R + '⌉\n干冷器 = ⌈液冷kW × 1.05 ÷ ' + K.DC_KW + '⌉'],
      ex: function (c) { var me = c.R.me; return me.cduN ? ['This basis: ' + F(c.R.cool.liquidKW) + ' kW → <b>' + me.cduN + ' + ' + me.cduR + ' CDUs</b> of ' + F(me.cduSize) + ' kW, <b>' + (me.dcN + me.dcR) + ' dry coolers</b>.', '本基准：' + F(c.R.cool.liquidKW) + ' kW → <b>' + me.cduN + ' + ' + me.cduR + '台CDU</b>（' + F(me.cduSize) + ' kW），<b>' + (me.dcN + me.dcR) + '台干冷器</b>。'] : ['This basis has no liquid cooling.', '本基准无液冷。']; },
      visual: function () { return IV.cdu(); } },
    appr: { title: ['Warm water & chiller-less cooling', '温水与无冷机冷却'],
      body: ['ASHRAE liquid classes W17–W45 give the highest facility-water supply temperature the IT accepts. Every heat exchanger adds an approach (≈ 3 K at the CDU, 5–8 K at a dry cooler), so with a 34.5 °C design dry-bulb the loop reaches ≈ 40–45 °C. Chiller-less operation all year needs IT rated for W40/W45; otherwise a trim chiller or cooling tower stays in the design.',
        'ASHRAE液冷等级W17–W45给出IT可接受的最高设施供水温度。每个换热环节都会增加趋近温度（CDU约3 K，干冷器5–8 K），设计干球34.5 °C时环路约达40–45 °C。全年无冷机运行需要W40/W45级IT；否则仍需保留补冷冷机或冷却塔。'],
      formula: ['T(technology loop) = T(outdoor dry-bulb) + approach(dry cooler) + approach(CDU)', 'T（技术环路）= T（室外干球）+ 趋近（干冷器）+ 趋近（CDU）'],
      ex: function (c) { return ['At ' + c.R.L.en + ' (' + c.R.L.db + ' °C dry-bulb): ' + c.R.L.db + ' + 7 + 3 = <b>' + F(c.R.L.db + 10, 1) + ' °C</b> supply to the racks.', c.R.L.zh + '（干球' + c.R.L.db + ' °C）：' + c.R.L.db + ' + 7 + 3 = 至机柜供液<b>' + F(c.R.L.db + 10, 1) + ' °C</b>。']; } },
    floor: { title: ['Rack weight & floor loading', '机柜重量与楼面荷载'],
      body: ['Integrated AI racks put 1.3–1.5 t on about 0.6–0.7 m², i.e. more than 20 kN/m² under the rack. Structural design spreads it over rack plus aisle and adds coolant, busway and trays; the engine raises the design live load to 25 kN/m² for racks above 1.3 t or 40 kW.',
        '集成AI机柜在约0.6–0.7 m²上施加1.3–1.5 t，即机柜下方超过20 kN/m²。结构设计将其分摊到机柜及通道，并计入冷却液、母线及桥架；评估引擎对1.3 t或40 kW以上机柜将设计活荷载提高至25 kN/m²。'],
      formula: ['p = m × g ÷ area', 'p = m × g ÷ 面积'],
      ex: function (c) { var sp = c.R.sp; return ['This basis: heaviest rack ≈ ' + F(sp.heavyRack) + ' kg → design floor load <b>≥ ' + sp.floorLoad + ' kN/m²</b>; clear height ' + sp.clearH + '.', '本基准：最重机柜约' + F(sp.heavyRack) + ' kg → 楼面设计荷载<b>≥' + sp.floorLoad + ' kN/m²</b>；净高' + sp.clearHzh + '。']; } },
    agent: { title: ['Clean-agent quantity', '洁净气体用量'],
      body: ['NFPA 2001 sizes halocarbon agents from the protected volume, the design concentration and the agent’s specific vapour volume at the lowest room temperature. The room must hold the concentration for at least 10 minutes, so openings are sealed and proven by a door-fan test.',
        'NFPA 2001根据保护容积、设计浓度及最低室温下灭火剂比容计算卤代烷灭火剂用量。房间须保持浓度至少10分钟，因此需封堵开口并经门风扇测试验证。'],
      formula: ['W (kg) = V ÷ S × C ÷ (100 − C)\nHFC-227ea: S = 0.1269 + 0.000513 × T\nFK-5-1-12: S = 0.0664 + 0.000274 × T', 'W（kg）= V ÷ S × C ÷ (100 − C)\n七氟丙烷：S = 0.1269 + 0.000513 × T\n全氟己酮：S = 0.0664 + 0.000274 × T'],
      ex: function (c) { var f = c.R.fs; return f.gasZones ? ['This basis: ' + f.gasZones + ' zones, ' + F(f.vol) + ' m³ → ≈ <b>' + F(f.agentKg) + ' kg</b> (' + K.AGENT_KG_M3 + ' kg/m³, HFC-227ea ≈ 7.5 % at 20 °C).', '本基准：' + f.gasZones + '个防区、' + F(f.vol) + ' m³ → 约<b>' + F(f.agentKg) + ' kg</b>（' + K.AGENT_KG_M3 + ' kg/m³，七氟丙烷约7.5%、20 °C）。'] : ['This basis uses pre-action sprinklers in the halls; gas protects MMR, electrical and battery rooms.', '本基准机房采用预作用喷淋；运营商交汇间、电气及电池室采用气体灭火。']; },
      visual: function () { return IV.agent(); } },
    asd: { title: ['Very early smoke detection', '极早期烟雾探测'],
      body: ['Aspirating detection (EN 54-20 class A) samples the air through holes in pipes, each hole acting as a very sensitive point detector. Thresholds step from alert to fire 2, and the transport time from the furthest hole must not exceed 120 s. The early warning lets staff find an overheating component before any suppression is needed.',
        '吸气式探测（EN 54-20 A级）通过管道采样孔取样，每个孔相当于一个高灵敏度点型探测器。阈值由警告逐级升至火警2，最远采样孔传输时间不得超过120 s。早期预警使人员在需要灭火前找到过热部件。'],
      ex: function (c) { return ['This basis: ≈ <b>' + c.R.fs.asd + ' detectors</b> for ' + F(c.R.sp.ws) + ' m² of white space and the plant rooms.', '本基准：约<b>' + c.R.fs.asd + '台探测器</b>，覆盖' + F(c.R.sp.ws) + ' m²白区及设备房。']; },
      visual: function () { return IV.vesda(); } },
    cctv: { title: ['Video recording & retention', '视频录像与保存'],
      body: ['Recording storage grows with cameras × bit rate × days. H.265 4-megapixel cameras average ≈ 2–6 Mbps; colocation customers often require ≥ 90 days of retention, and RAID plus headroom adds ≈ 25 %.',
        '录像存储量随摄像机数×码率×天数增长。H.265 400万像素摄像机平均约2–6 Mbps；托管客户通常要求保存≥90天，RAID及余量再增加约25%。'],
      formula: ['TB = cameras × Mbps × 86,400 × days ÷ 8 ÷ 10⁶', 'TB = 摄像机数 × Mbps × 86,400 × 天数 ÷ 8 ÷ 10⁶'],
      ex: function (c) { var n = c.R.fs.cams, tb = n * 4 * 86400 / 8 / 1e6 * 90; return ['This basis: ' + F(n) + ' cameras × 4 Mbps × 90 days ≈ <b>' + F(tb) + ' TB</b> (+25 % → ' + F(tb * 1.25) + ' TB).', '本基准：' + F(n) + '台 × 4 Mbps × 90天 ≈ <b>' + F(tb) + ' TB</b>（+25% → ' + F(tb * 1.25) + ' TB）。']; } },
    layers: { title: ['Layered physical security', '分层物理安防'], calc: false,
      body: ['Security works in rings: each layer must detect, delay and verify before the next. A Tier III/IV colocation site typically has seven layers from the fence to the locked rack, with every door event logged and linked to video.',
        '安防按层级运作：每一层都需在下一层之前完成探测、延迟与确认。Tier III/IV托管站点通常从围栏到上锁机柜共七层，每次门禁事件均记录并联动视频。'],
      ex: function (c) { return ['This basis: <b>' + c.R.fs.securityLayers + ' layers</b>, ≈ ' + F(c.R.fs.readers) + ' access-controlled doors, ≈ ' + F(c.R.fs.cams) + ' cameras.', '本基准：<b>' + c.R.fs.securityLayers + '道安防层</b>，约' + F(c.R.fs.readers) + '个门禁点，约' + F(c.R.fs.cams) + '台摄像机。']; },
      visual: function (c) { return IV.layers(c); } },
    points: { title: ['Monitoring: BMS, EPMS & DCIM', '监控：BMS、EPMS与DCIM'],
      body: ['A data center is instrumented densely: every chiller, pump, fan, valve, breaker, UPS and battery string reports to the building management system (BMS) or the electrical power monitoring system (EPMS); DCIM adds assets, space and capacity. Point counts grow roughly with MW and with the number of electrical line-ups.',
        '数据中心监测点非常密集：每台冷机、水泵、风机、阀门、断路器、UPS及电池组都接入楼宇管理系统（BMS）或电力监控系统（EPMS）；DCIM再加入资产、空间与容量信息。点位数量大致随MW及配电回路数增长。'],
      formula: ['BMS points ≈ 400 + 450 × MW\nEPMS meters ≈ 20 + 12 × TX + 4 × UPS + 2 × busways', 'BMS点位 ≈ 400 + 450 × MW\nEPMS电表 ≈ 20 + 12 × 变压器 + 4 × UPS + 2 × 母线'],
      ex: function (c) { return ['This basis: ≈ <b>' + F(c.R.fs.bmsPts) + ' BMS points</b> and ≈ <b>' + F(c.R.fs.meters) + ' meters</b>.', '本基准：约<b>' + F(c.R.fs.bmsPts) + '个BMS点位</b>及约<b>' + F(c.R.fs.meters) + '块电表</b>。']; } },
    liion: { title: ['Lithium-ion fire safety', '锂电池消防安全'], calc: false,
      body: ['Thermal runaway starts with electrolyte off-gassing minutes before smoke or flame. Detecting the off-gas lets the battery management system isolate the string and ventilation remove flammable gas. NFPA 855 sets spacing, room limits and deflagration control; UL 9540A tests show how far a fire propagates.',
        '热失控在冒烟或起火前数分钟以电解液逸出气体开始。探测逸出气体可使电池管理系统隔离电池组，并由通风排除可燃气体。NFPA 855规定间距、房间限制及爆燃控制；UL 9540A测试显示火势传播范围。'],
      ex: function (c) { return ['This basis: ' + F(c.R.el.battKWh) + ' kWh UPS batteries (' + t(bat(c)) + ')' + (c.R.el.bess ? ' and ' + F(c.R.el.bess.mwh, 1) + ' MWh BESS.' : '.'), '本基准：UPS电池' + F(c.R.el.battKWh) + ' kWh（' + bat(c)[1] + '）' + (c.R.el.bess ? '及储能' + F(c.R.el.bess.mwh, 1) + ' MWh。' : '。')]; } },
    gimp: { title: ['PLN Grid Impact Study', 'PLN电网影响研究'],
      body: ['Before PLN energises a large customer, the Grid Code (Permen ESDM 20/2020, Connection Code CC 5.1) requires connection studies: a feasibility (grid impact) study prepared by the consumer and a connection evaluation by PLN. They check steady-state power flow (N-0 / N-1), short circuit, frequency, transient and small-signal stability, power quality and dispatching, for peak and light load in wet and dry seasons, and the consumer presents the results to the PLN planner and system operator. A data center is a large power-electronic load: UPS rectifiers and drives inject harmonics, AI training swings tens of megawatts within seconds, and during a grid fault every UPS may transfer to battery at once — NERC reported ≈ 1,500 MW of data-center load dropping in one 2024 event.',
        '大用户接入前，电网规范（能矿部长令2020年第20号，接入规范CC 5.1）要求开展接入研究：由用户编制可行性（电网影响）研究，由PLN进行接入评估。研究内容包括稳态潮流（N-0/N-1）、短路、频率、暂态及小信号稳定、电能质量及调度，覆盖高峰/低谷负荷及雨季/旱季，并由用户向PLN规划及调度部门汇报。数据中心是大型电力电子负荷：UPS整流器及驱动产生谐波，AI训练数秒内波动数十兆瓦，电网故障时所有UPS可能同时转入电池——NERC报告2024年一次事件中约1,500 MW数据中心负荷同时脱网。'],
      formula: ['Ssc = √3 × U × Ik        Isc/IL = Ssc ÷ S(demand)\nΔV ≈ ΔP ÷ (PF × Ssc)      THDv ≈ TDD × S ÷ Ssc × h', 'Ssc = √3 × U × Ik        Isc/IL = Ssc ÷ S（需量）\nΔV ≈ ΔP ÷ (PF × Ssc)      THDv ≈ TDD × S ÷ Ssc × h'],
      ex: function (c) { var gi = c.R.gimp; return ['This basis: ' + F(gi.ssc) + ' MVA at ' + E.kvName(gi.kv) + ' (Isc/IL ≈ ' + F(gi.scr) + '): harmonic limit ' + F(gi.tddLimit, 1) + ' % TDD, estimate ' + F(gi.tdd, 1) + ' %' + (gi.ahf ? ' with active filters' : '') + '; AI swing step ' + F(gi.dvAi, 2) + ' %; ' + gi.studies.length + ' studies, ≈ <b>' + gi.months + ' months</b>.',
        '本基准：' + E.kvName(gi.kv) + '短路容量' + F(gi.ssc) + ' MVA（Isc/IL约' + F(gi.scr) + '）：谐波限值' + F(gi.tddLimit, 1) + '% TDD，估算' + F(gi.tdd, 1) + '%' + (gi.ahf ? '（含有源滤波）' : '') + '；AI波动电压阶跃' + F(gi.dvAi, 2) + '%；' + gi.studies.length + '项研究，约<b>' + gi.months + '个月</b>。']; },
      table: function (c) {
        var gi = c.R.gimp, lim = E.GRID_CODE.limits, proc = E.GRID_CODE.process, nerc = E.GRID_CODE.nerc;
        return '<div><h3>' + L.te(['Grid Code limits at the connection point (Lampiran I, Java–Madura–Bali)', '接入点电网规范限值（附件一，爪哇-马都拉-巴厘）']) + '</h3>' + L.ptable([['Item', '项目'], ['Requirement', '要求']], lim.map(function (r) { return [L.te(r[0]), L.te(r[1])]; })) + '</div>' +
          '<div class="tc-g2"><div><h3>' + L.te(['Studies for this design', '本设计所需研究']) + '</h3><ul class="tc-li">' + gi.studies.map(function (x) { return '<li>' + L.te(x) + '</li>'; }).join('') + '</ul></div>' +
          '<div><h3>' + L.te(['Process (Grid Code CC 5)', '流程（电网规范CC 5）']) + '</h3>' + L.ptable(null, proc.map(function (r) { return [L.te(r[0]), L.te(r[1])]; })) + '</div></div>' +
          '<div><h3>' + L.te(['Large data-center loads — lessons from NERC', '大型数据中心负荷——NERC经验']) + '</h3><ul class="tc-li">' + nerc.map(function (x) { return '<li>' + L.te(x) + '</li>'; }).join('') + '</ul></div>';
      },
      rel: [['grid', ['PLN grid connection', 'PLN电网接入']], ['mva', ['PLN demand', 'PLN需量']]] }
  };
  Object.keys(TH).forEach(function (k) { TH[k].id = k; });

  g.TCX = { U: U, CALC: CALC, TH: TH, IV: IV, roman: roman, rp: rp, usd: usd, grid: grid, relTxt: relTxt, bat: bat, gimpTable: gimpTable };
})(window);
