/* Technology card: Fire, Security & Monitoring (security layers, very early detection, suppression, Li-ion safety, NOC).
   Rev. 18: full-width illustration (1860 × 840) — seven nested security layers with the visitor's path and the security network, the data hall with
   aspirating detection, pre-action and clean agent, fire panel, Li-ion room and fire pumps, the fire event step by step and the monitoring systems. */
(function (g) {
  'use strict';
  var TC = g.TC, L = TC.lib, X = g.TCX, DB = g.DCDB, E = g.DCEngine, K = E.K, F = L.F, t = L.t;
  function U(k, o) { return Object.assign({}, X.U[k], o || {}); }
  var PWR = { card: 'PWR', label: ['Critical power', '关键供电'] }, DC = { card: 'DC', label: ['Data center facility', '数据中心设施'] };
  var UNITS = [
    U('fence', { id: 'fence', no: '01', rel: [['layers', ['Security layers', '安防层级']]] }),
    U('gate', { id: 'gate', no: '02', rel: [['layers', ['Security layers', '安防层级']]] }),
    U('mantrap', { id: 'mantrap', no: '03', rel: [['access', ['Access control', '门禁']]] }),
    U('access', { id: 'access', no: '04', rel: [['layers', ['Security layers', '安防层级']]] }),
    U('cctv', { id: 'cctv', no: '05', rel: [['cctvT', ['Video retention', '录像保存']]] }),
    U('noc', { id: 'noc', no: '06', rel: [['pointsT', ['Monitoring points', '监控点位']], ['dcim', ['DCIM', 'DCIM']]] }),
    U('vesda', { id: 'vesda', no: '07', rel: [['asdT', ['Early detection', '早期探测']], ['fap', ['Fire panel', '火警主机']]] }),
    U('preact', { id: 'preact', no: '08', rel: [['firepump', ['Fire pumps', '消防泵']]] }),
    U('agent', { id: 'agent', no: '09', rel: [['agentT', ['Agent quantity', '灭火剂用量']]] }),
    U('fap', { id: 'fap', no: '10', rel: [['vesda', ['Aspirating detection', '吸气式探测']]] }),
    U('liion', { id: 'liion', no: '11', rel: [['liionT', ['Lithium-ion safety', '锂电安全']], PWR] }),
    U('firepump', { id: 'firepump', no: '12', rel: [['preact', ['Pre-action sprinklers', '预作用喷淋']]] }),
    U('bms', { id: 'bms', no: 'A' }), U('epms', { id: 'epms', no: 'B', rel: [PWR] }), U('dcim', { id: 'dcim', no: 'C' }), U('leak', { id: 'leak', no: 'D', rel: [{ card: 'DLC', label: ['Direct liquid cooling', '冷板液冷'] }] })
  ];
  var THEORY = [['layers', 'layers'], ['asdT', 'asd'], ['agentT', 'agent'], ['cctvT', 'cctv'], ['pointsT', 'points'], ['liionT', 'liion']];
  var FAQ = [
    [['Why not ordinary sprinklers in a data hall?', '为什么机房不用普通喷淋？'], ['Wet pipes can leak, and one damaged head would flood live IT. Pre-action systems only fill with water after a detector alarm and only discharge where a head opens; smaller rooms use clean-agent gas that leaves no residue.', '湿式管道可能泄漏，一个损坏的喷头就会淹没运行中的IT设备。预作用系统仅在探测器报警后充水，且只在开启的喷头处放水；较小房间采用不留残留的洁净气体。']],
    [['Is gas suppression safe for people?', '气体灭火对人员安全吗？'], ['Halocarbon agents at design concentration stay below their no-observed-adverse-effect level (NOAEL); inert gases lower oxygen to ≈ 12–14 %. Pre-discharge alarms, a time delay and abort switches still make sure people leave before release.', '设计浓度下的卤代烷灭火剂低于其无可见不良影响水平（NOAEL）；惰性气体将氧浓度降至约12–14%。仍通过预喷放报警、延时及中止按钮确保人员在释放前撤离。']],
    [['How early does aspirating detection warn?', '吸气式探测能提前多久预警？'], ['It samples the air continuously and responds at very low smoke densities (EN 54-20 class A), typically while a component is still overheating or smouldering — before ceiling point detectors and long before flames.', '持续采样空气，在极低烟雾浓度下响应（EN 54-20 A级），通常在部件仍处于过热或阴燃阶段——早于吊顶点型探测器，远早于明火。']],
    [['How many security layers does a data center need?', '数据中心需要几层安防？'], ['Tier III/IV and colocation sites typically use seven: perimeter, gate, building, mantrap, data-hall door, customer cage and locked rack — each with detection, delay and verification.', 'Tier III/IV及托管站点通常设七层：周界、入口、建筑、防尾随门、机房门、客户笼位及上锁机柜——每层均具备探测、延迟与确认。']],
    [['How long must CCTV recordings be kept?', '录像需保存多久？'], ['Colocation customers and auditors commonly ask for ≥ 90 days; banks and government may require more. Storage grows with cameras × bit rate × days — see the calculator.', '托管客户及审计通常要求≥90天；银行与政府可能要求更长。存储量随摄像机数×码率×天数增长——见计算器。']],
    [['What does the NOC monitor?', 'NOC监控哪些内容？'], ['Everything with an alarm: the power chain (EPMS), cooling and environment (BMS), capacity (DCIM), fire, leak detection, access and video — with written procedures for every event.', '所有带报警的系统：供电链（EPMS）、制冷与环境（BMS）、容量（DCIM）、消防、漏水检测、门禁与视频——每类事件均有书面处置程序。']],
    [['How are lithium-ion battery fires handled?', '锂电池火灾如何应对？'], ['Prevention first: LFP chemistry, BMS supervision, off-gas detection that isolates strings before thermal runaway, ventilation, separation per NFPA 855 and suppression chosen from UL 9540A test results.', '以预防为先：LFP化学体系、BMS监控、在热失控前隔离电池组的逸出气体探测、通风、按NFPA 855的间距，以及依据UL 9540A测试结果选择的灭火方式。']]
  ];

  /* ---------------------------------------------------------------- illustration (1860 × 840), Rev. 18
     row 1: security layers from the fence to the rack (nested zones, the visitor's path, every device on the security network to the NOC) |
     row 2: data hall with aspirating detection, pre-action sprinklers and clean agent; fire panel, Li-ion room, fire pumps |
     row 3: a fire event step by step | monitoring systems */
  var ZONES = [[40, 40, '#F7F8FD'], [330, 50, '#EFF0FA'], [620, 60, '#E7E9F7'], [820, 70, '#DFE2F4'], [1000, 80, '#D6D9F0'], [1170, 90, '#CDD1EC'], [1330, 100, '#C3C8E8']];
  var LNAME = [['site', '场地'], ['gate', '入口'], ['building', '建筑'], ['mantrap', '防尾随'], ['hall', '机房'], ['cage', '笼位'], ['rack', '机柜']];
  function person(x, y) { return '<circle cx="' + x + '" cy="' + (y - 34) + '" r="7" fill="#3F3CBB"/><path d="M' + (x - 8) + ' ' + y + 'V' + (y - 14) + 'a8 8 0 0 1 16 0V' + y + 'Z" fill="#3F3CBB"/>'; }
  function security(c) {
    var R = c.R, fs = R.fs, n = fs.securityLayers || 7, o = '';
    o += L.banner(20, 0, 1820, ['① SECURITY LAYERS | 安防层级', '① 安防层级 | SECURITY LAYERS'], ['detect · delay · verify — from the fence to the rack; every event goes to the NOC', '探测·延迟·确认——从围栏到机柜；所有事件上传NOC'], null, 'tcZone');
    ZONES.forEach(function (z, i) { o += '<g' + (i < n ? '' : ' opacity=".4"') + '>' + L.R(z[0], z[1], 1490 - z[0], 254 - z[1], z[2], ' rx="12" stroke="#C3C7E2"') + L.text(z[0] + 8, 276, 'L' + (i + 1) + ' ' + t(LNAME[i]), 'tc-ls', ' style="font-size:11.5px;font-weight:800;fill:#3F3CBB"') + '</g>'; });
    o += L.R(30, 252, 1470, 6, '#C9CDE0', ' rx="2"');
    /* security network to the NOC */
    o += L.fl('noc fence gate cctv mantrap access', L.thin('M300 252V292H1676V246', 'data', 2.4, '3 4') + L.thin('M400 252V292M720 252V292M940 252V292M1104 252V292M1252 252V292M1404 252V292', 'data', 2, '3 4'));
    /* the visitor's path */
    var pth = L.thin('M64 238H1352', '#3F3CBB', 2.4, '2 7') + person(52, 250);
    [330, 620, 820, 1000, 1170, 1330].forEach(function (x, i) { if (i + 1 < n) pth += L.arrowHead(x + 8, 238, 'r', '#3F3CBB', 7); });
    o += L.fl('fence gate cctv mantrap access', pth);
    /* layer devices */
    var f1 = L.fence(76, 252, 214, 62) + '<path d="M76 250H290" stroke="#E5534B" stroke-width="2" stroke-dasharray="2 5"/>' + L.R(296, 150, 4, 102, '#5E6484') + L.camera(298, 156, .85, true);
    o += L.hot('fence', ['Perimeter', '周界'], 44, 44, 282, 210, f1 + L.label(54, 76, '01', ['Perimeter', '周界'], ['fence + intrusion sensors', '围栏+入侵探测'], 'start'), ['≥ 2.4 m anti-climb fence, fibre or radar intrusion detection, lighting and cameras', '≥2.4 m防攀爬围栏、光纤或雷达入侵探测、照明及摄像机']);
    var g2 = L.building(346, 206, 80, 46, '#5D6280') + L.barrier(440, 252, 96) + L.bollards(552, 252, 3);
    o += L.hot('gate', ['Gate & barriers', '入口与路障'], 334, 54, 282, 200, g2 + L.label(344, 86, '02', ['Gate & barriers', '入口与路障'], ['crash-rated | guardhouse', '防冲撞 | 门卫室'], 'start'), ['vehicle barriers and bollards (ASTM F2656 / IWA 14), guardhouse, visitor registration', '车辆路障及防撞柱（ASTM F2656 / IWA 14）、门卫室、访客登记']);
    var l3 = L.R(640, 150, 160, 102, '#F4F5FA', ' stroke="#8E95AE"') + L.R(700, 190, 40, 62, 'url(#tcGlass)', ' stroke="#7FC6DA"') + L.camera(650, 166, .8) + L.camera(790, 166, .8, true) + L.R(752, 214, 40, 16, '#5D6280', ' rx="2"') + L.text(772, 244, ['lobby', '大堂'], 'tc-ls', ' text-anchor="middle" style="font-size:10.5px;font-weight:700"');
    o += L.hot('cctv', ['CCTV', '视频监控'], 624, 64, 192, 190, l3 + L.label(632, 96, '05', ['CCTV', '视频监控'], ['≈ ' + F(fs.cams) + ' cameras', '约' + F(fs.cams) + '台'], 'start'), ['≈ ' + F(fs.cams) + ' cameras on every door, aisle and the perimeter; ≥ 90 days of video', '约' + F(fs.cams) + '台摄像机覆盖门、通道及周界；录像≥90天']);
    o += L.hot('mantrap', ['Mantrap', '防尾随门'], 824, 74, 172, 180, L.mantrap(846, 252, 108) + L.reader(934, 196) + L.label(830, 106, '03', ['Mantrap', '防尾随门'], ['one person at a time', '一次一人'], 'start'), ['interlocked doors and a weight / camera check stop tailgating', '互锁门及称重/视频核验防止尾随']);
    var ac = L.R(1022, 150, 62, 102, '#E9EBF4', ' rx="3" stroke="#5E6484" stroke-width="2"') + L.R(1032, 162, 42, 34, 'url(#tcGlass)', ' rx="2"') + L.reader(1092, 188);
    var cage = L.R(1188, 150, 116, 102, 'url(#tcMesh)', ' stroke="#5E6484"') + L.rack(1218, 168, 44, 84), lock = L.rack(1346, 150, 60, 102) + '<rect x="1394" y="196" width="10" height="12" rx="2" fill="#E39B1B"/><path d="M1396 196v-4a3 3 0 0 1 6 0v4" fill="none" stroke="#E39B1B" stroke-width="2"/>';
    ac += (n < 6 ? '<g opacity=".4">' + cage + '</g>' : cage) + (n < 7 ? '<g opacity=".4">' + lock + '</g>' : lock);
    o += L.hot('access', ['Access control', '门禁'], 1004, 84, 482, 170, ac + L.label(1014, 116, '04', ['Access control', '门禁'], ['≈ ' + F(fs.readers) + ' doors | card + biometric', '约' + F(fs.readers) + '个门 | 卡+生物识别'], 'start'), ['hall door → customer cage → locked rack; every door event is logged and linked to video', '机房门 → 客户笼位 → 上锁机柜；每次门禁事件均记录并联动视频']);
    var noc = L.nocWall(1532, 104, 290, 118) + L.R(1560, 230, 230, 10, '#5E6484', ' rx="3"') + person(1610, 246) + person(1700, 246);
    o += L.hot('noc', ['NOC', '运营中心'], 1508, 40, 332, 256, noc + L.label(1674, 70, '06', ['NOC', '运营中心'], ['24/7 | every alarm', '7×24 | 全部报警']), ['one room watches every alarm, with written procedures (SOP / EOP) for each event', '一个中心监视所有报警，每类事件均有书面程序（SOP/EOP）']);
    return o;
  }
  function fire(c) {
    var R = c.R, fs = R.fs, gas = fs.gasZones > 0, o = '';
    o += L.banner(20, 312, 1820, ['② FIRE: DETECT → DECIDE → SUPPRESS | 火灾：探测→判断→灭火', '② 火灾：探测→判断→灭火 | FIRE'], ['aspirating detection sees smoke early; ' + (gas ? 'clean agent in the halls' : 'pre-action water in the halls') + ' — never wet pipes over live IT', '吸气式探测早期发现烟雾；' + (gas ? '机房采用洁净气体' : '机房采用预作用喷淋') + '——运行中的IT上方绝不设湿式管道'], null, 'tcZone4');
    o += L.zbox(30, 350, 990, 250, '#F7F8FD', '#C9CDE0') + L.R(40, 572, 970, 8, '#C9CDE0', ' rx="2"');
    /* fire-alarm loop: detector, cylinders, valve set, panel, battery room */
    o += L.fl('fap vesda agent preact liion f3 f4', L.thin('M70 380V360H1600V400M1100 360V448M984 360V430M1326 360V420', 'sig', 2.2, '4 3'));
    var rk = L.rackRow(160, 470, 14, 44, 100, { blink: true });
    o += rk + L.bubbles(352, 380, 40, 88, 7, 5, '#8E95AE', .55, false, 3, 7);
    var vp = '<path d="M96 372H1000" stroke="#E5534B" stroke-width="5"/>';
    for (var i = 0; i < 13; i++) vp += '<circle cx="' + (130 + i * 68) + '" cy="372" r="3.4" fill="#fff" stroke="#E5534B" stroke-width="1.8"/>';
    o += L.hot('vesda', ['Aspirating smoke detection', '吸气式感烟探测'], 36, 352, 380, 112, L.fl('vesda f1 f2', vp) + L.vesda(44, 380, 52, 120) + L.label(118, 436, '07', ['Aspirating detection', '吸气式探测'], ['≈ ' + fs.asd + ' detectors | EN 54-20 class A', '约' + fs.asd + '台 | EN 54-20 A级'], 'start'),
      ['pipes sample the air through small holes; the detector sees smoke long before a ceiling detector', '管网经小孔持续采样空气；探测器远早于吊顶探测器发现烟雾']);
    var pa = L.sprinklers(110, 404, 860, 12) + L.R(970, 430, 28, 118, '#C93A33', ' rx="4"') + '<circle cx="984" cy="470" r="9" fill="#fff" stroke="#8E1F1A" stroke-width="2"/><path d="M978 470h12" stroke="#8E1F1A" stroke-width="2"/>' + '<path d="M984 430V404" stroke="#C93A33" stroke-width="5"/>';
    o += L.hot('preact', ['Pre-action sprinklers', '预作用喷淋'], 600, 392, 416, 170, (gas ? '<g opacity=".55">' + pa + '</g>' : pa) + L.label(612, 436, '08', ['Pre-action sprinklers', '预作用喷淋'], gas ? ['where the AHJ requires', '按消防部门要求'] : ['double interlock | dry pipes', '双连锁 | 干式管道'], 'start'),
      ['pipes stay dry until a detector AND a heated head both act; only the opened heads spray', '探测器报警且喷头受热开启后管道才充水；仅开启的喷头喷水']);
    var ag = L.zbox(1036, 350, 200, 250, '#FCEFEE', '#EBC3BF') + L.gasCyl(1060, 460, 5) + '<path d="M1068 448V438H1000V386" fill="none" stroke="#B9BFD3" stroke-width="4"/>';
    [300, 600, 900].forEach(function (x) { ag += '<path d="M' + x + ' 386V394" stroke="#B9BFD3" stroke-width="4"/><path d="M' + (x - 7) + ' 396h14" stroke="#8E95AE" stroke-width="3"/>'; });
    ag += '<path d="M300 386H1000" stroke="#B9BFD3" stroke-width="4"/>';
    o += L.hot('agent', ['Clean-agent gas', '洁净气体'], 1036, 350, 200, 250, (gas ? ag : '<g opacity=".45">' + ag + '</g>') + L.label(1136, 384, '09', ['Clean agent', '洁净气体'], gas ? [fs.gasZones + ' zones | ' + F(fs.agentKg) + ' kg', fs.gasZones + '区 | ' + F(fs.agentKg) + ' kg'] : ['MMR | electrical rooms', 'MMR | 电气室']),
      [t(fs.suppression).split(', plus')[0], fs.suppression[1].split('，并')[0]]);
    o += L.hot('fap', ['Fire alarm panel', '火灾报警控制器'], 1252, 350, 150, 250, L.zbox(1252, 350, 150, 250, '#F7F8FD', '#C9CDE0') + L.firePanel(1292, 420, 70, 120) + L.label(1328, 384, '10', ['Fire panel', '火警主机'], ['cause & effect', '联动矩阵']), ['decides from the detector levels: alarms, HVAC and damper shutdown, door release, discharge', '根据探测分级决策：报警、关闭空调及风阀、释放门禁、喷放']);
    var li = L.zbox(1416, 350, 204, 250, '#F7F8FD', '#C9CDE0') + L.battRack(1430, 440, 3, 120, 112, true) + L.fan(1590, 420, 13, 1.6, true) + L.R(1566, 470, 30, 26, '#3A3F63', ' rx="3"') + '<circle cx="1581" cy="483" r="6" fill="#E39B1B"/>' + L.text(1581, 516, ['off-gas', '逸出气体'], 'tc-ls', ' text-anchor="middle" style="font-size:10.5px;font-weight:700"');
    o += L.hot('liion', ['Li-ion battery room', '锂电池室'], 1416, 350, 204, 250, li + L.label(1518, 384, '11', ['Li-ion room', '锂电池室'], ['off-gas | NFPA 855', '逸出气体 | NFPA 855']), ['off-gas sensors isolate a string before thermal runaway; ventilation, spacing and UL 9540A-based suppression', '逸出气体探测在热失控前隔离电池组；通风、间距及基于UL 9540A的灭火']);
    var fp = L.zbox(1636, 350, 204, 250, '#F7F8FD', '#C9CDE0') + L.tankBox(1650, 470, 96, 84, 16, 'tcWater', .75) + L.pump(1760, 560, .75, '#C93A33');
    o += L.fl('firepump preact f5', L.pipe('M1790 560V606H984V548', 'fire', 5, true, true));
    o += L.hot('firepump', ['Fire pumps & water', '消防泵与水池'], 1636, 350, 204, 250, fp + L.label(1738, 384, '12', ['Fire pumps', '消防泵'], ['duty + standby', '主备泵']), ['fire-water reservoir, electric and diesel pumps and a jockey pump keep the mains pressurised', '消防水池、电动及柴油消防泵和稳压泵保持管网压力']);
    return o;
  }
  function sequence(c) {
    var fs = c.R.fs, gas = fs.gasZones > 0, o = '', y = 736;
    o += L.banner(20, 624, 1220, ['③ A FIRE EVENT, STEP BY STEP | 火灾事件过程', '③ 火灾事件过程 | FIRE EVENT'], ['aspirating detection levels → fire panel → suppression', '吸气式探测分级 → 火警主机 → 灭火'], null, 'tcZone4');
    o += '<path d="M50 710C380 708 520 702 640 694S900 674 1000 670 1160 668 1200 668" fill="none" stroke="#8E95AE" stroke-width="2.4" stroke-dasharray="5 4"/>' + L.text(56, 692, ['smoke', '烟雾'], 'tc-ls', ' style="font-size:11.5px;font-weight:700;fill:#8E95AE"');
    o += '<path d="M50 ' + y + 'H1210" stroke="#17153F" stroke-width="2.2"/>' + L.arrowHead(1220, y, 'r', '#17153F', 9);
    var ev = [
      [130, 'f1', '#16A34A', ['Alert', '警告'], ['very low smoke', '极低烟雾'], ['staff check the room', '人员到场检查']],
      [330, 'f2', '#E39B1B', ['Action', '行动'], ['smoke is rising', '烟雾上升'], ['standby, NOC informed', '待命，通知NOC']],
      [530, 'f3', '#E5534B', ['Fire 1', '火警1'], ['pre-discharge alarm', '预喷放报警'], ['HVAC off, doors close', '关空调、关门']],
      [730, 'f4', '#8E1F1A', ['Fire 2', '火警2'], ['second detector confirms', '第二探测器确认'], ['30 s delay, abort switch', '30 s延时、可中止']],
      [930, 'f5', '#C93A33', gas ? ['Agent discharge', '气体喷放'] : ['Pre-action valve opens', '预作用阀开启'], gas ? ['in ≤ 10 s (halocarbon)', '≤10 s（卤代烷）'] : ['pipes fill with water', '管道充水'], gas ? ['hold ≥ 10 min', '保持≥10 min'] : ['only heated heads spray', '仅受热喷头喷水']],
      [1120, 'f6', '#3F3CBB', ['Reset', '复位'], ['ventilate, inspect', '通风、检查'], ['recharge, report', '充装、报告']]
    ];
    ev.forEach(function (e) {
      o += L.fl(e[1], '<circle cx="' + e[0] + '" cy="' + y + '" r="12" fill="' + e[2] + '"/>' + L.text(e[0], y + 30, e[3], 'tc-lt', ' text-anchor="middle" style="font-size:14px;fill:' + e[2] + '"') + L.text(e[0], y + 50, e[4], 'tc-ls', ' text-anchor="middle" style="font-size:12.5px"') + L.text(e[0], y + 68, e[5], 'tc-ls', ' text-anchor="middle" style="font-size:12.5px"'));
    });
    return o;
  }
  function monitoring(c) {
    var R = c.R, fs = R.fs, o = '';
    o += L.banner(1260, 624, 580, ['④ MONITORING | 监控', '④ 监控 | MONITORING'], ['all of it reports to the NOC', '全部上传NOC'], null, 'tcZone5');
    o += L.fl('bms epms dcim leak noc', L.thin('M1330 670V660H1846V200H1822', 'data', 2.4, '3 4') + L.thin('M1474 670V660M1618 670V660M1762 670V660', 'data', 2, '3 4'));
    var box = function (x, key, nm, no, sub, icon, tip) {
      return L.hot(key, nm, x, 664, 136, 172, L.R(x, 670, 136, 160, '#fff', ' rx="12" stroke="#D9DCEC"') + icon + L.num(x + 22, 690, no, 'tcZone5') + L.text(x + 40, 695, nm, 'tc-lt', ' style="font-size:13.5px"') + L.text(x + 68, 812, sub, 'tc-ls', ' text-anchor="middle" style="font-size:12px;font-weight:700"'), tip);
    };
    o += box(1262, 'bms', ['BMS', '楼宇自控'], 'A', ['≈ ' + F(fs.bmsPts) + ' points', '约' + F(fs.bmsPts) + '点'], L.R(1290, 712, 34, 70, '#E9EBF4', ' rx="17" stroke="#8E95AE"') + L.R(1301, 736, 12, 40, '#E5534B', ' rx="6"') + L.fan(1360, 746, 18, 1.4, true), ['cooling, temperature, humidity, pressure, water', '制冷、温湿度、压差、水系统']);
    o += box(1406, 'epms', ['EPMS', '电力监控'], 'B', ['≈ ' + F(fs.meters) + ' meters', '约' + F(fs.meters) + '块电表'], L.R(1432, 712, 84, 64, '#17153F', ' rx="6"') + L.text(1474, 752, 'kW', 'tc-lw', ' text-anchor="middle" style="font-size:20px"') + '<path d="M1440 770l10-8 10 4 12-10 10 6 14-12" fill="none" stroke="#5BE0B0" stroke-width="2"/>', ['every breaker, UPS, generator and meter, 1 s logging', '每台断路器、UPS、发电机及电表，1 s记录']);
    var grid = ''; for (var i = 0; i < 4; i++) for (var j = 0; j < 3; j++) grid += L.R(1580 + i * 18, 714 + j * 20, 14, 16, (i + j) % 3 ? '#3F3CBB' : '#16A34A', ' rx="2" opacity=".8"');
    o += box(1550, 'dcim', ['DCIM', 'DCIM'], 'C', ['capacity & assets', '容量与资产'], grid, ['space, power and cooling capacity per rack; asset and change records', '每柜空间、电力及冷量容量；资产与变更记录']);
    o += box(1694, 'leak', ['Leak detection', '漏水检测'], 'D', ['under CDUs & CRAHs', 'CDU及CRAH下方'], '<path d="M1762 712c-12 18-18 28-18 38a18 18 0 0 0 36 0c0-10-6-20-18-38Z" fill="#0EA5C6"/>' + L.thin('M1714 790H1810', '#E3B505', 3, '7 4'), ['sensing cable under pipes, CDUs and CRAH units; zone and distance alarms', '管道、CDU及CRAH下方感应线缆；分区及定位报警']);
    return o;
  }
  function pfd(c) {
    return '<svg class="tc-pfd tc-abs" viewBox="0 0 1860 840" role="img" aria-label="' + L.te(['Fire, security and monitoring: security layers, fire detection and suppression, monitoring', '消防、安防与监控：安防层级、火灾探测与灭火、监控']) + '">' + security(c) + fire(c) + sequence(c) + monitoring(c) + '</svg>';
  }
  function steps(c) {
    var R = c.R, fs = R.fs, gas = fs.gasZones > 0, n = fs.securityLayers || 7;
    return [
      { k: ['fence'], t: ['L1 perimeter', 'L1 周界'], d: ['The first of <b>' + n + ' layers</b>: an anti-climb fence with intrusion sensors, lighting and cameras <b>detects</b> and <b>delays</b> anyone approaching.', '<b>' + n + '道防线</b>的第一道：防攀爬围栏配入侵探测、照明及摄像机，对接近者进行<b>探测</b>与<b>延迟</b>。'] },
      { k: ['gate'], t: ['L2 gate & barriers', 'L2 入口与路障'], d: ['Crash-rated barriers and bollards stop vehicles; the guardhouse <b>verifies</b> every visitor against a booking.', '防冲撞路障及防撞柱阻止车辆；门卫室按预约<b>核验</b>每位访客。'] },
      { k: ['cctv'], t: ['L3 building + CCTV', 'L3 建筑+视频'], d: ['≈ <b>' + F(fs.cams) + ' cameras</b> cover the perimeter, doors and aisles; video is kept ≥ 90 days and every door event is linked to it.', '约<b>' + F(fs.cams) + '台摄像机</b>覆盖周界、门及通道；录像保存≥90天，每次门禁事件均联动视频。'] },
      { k: ['mantrap'], t: ['L4 mantrap', 'L4 防尾随门'], d: ['Interlocked doors let one person through at a time; a card plus biometric check stops tailgating.', '互锁门一次只允许一人通过；卡加生物识别核验防止尾随。'] },
      { k: ['access'], t: ['L5–L7 hall, cage, rack', 'L5–L7 机房、笼位、机柜'], d: ['≈ <b>' + F(fs.readers) + ' access-controlled doors</b>: the data-hall door, the customer cage and finally the locked rack.', '约<b>' + F(fs.readers) + '个门禁点</b>：机房门、客户笼位，最后是上锁的机柜。'] },
      { k: ['noc'], t: ['NOC watches 24/7', 'NOC全天候监视'], d: ['Every alarm — security, fire, power, cooling — reaches the NOC, which follows a written procedure (SOP / EOP) for each event.', '所有报警——安防、消防、电力、制冷——上传NOC，每类事件按书面程序（SOP/EOP）处置。'] },
      { k: ['vesda', 'f1', 'f2'], t: ['Very early detection', '极早期探测'], d: ['≈ ' + fs.asd + ' aspirating detectors sample the air through pipes and raise <b>Alert</b> and <b>Action</b> while a component is still overheating — minutes before a ceiling detector.', '约' + fs.asd + '台吸气式探测器经管网采样，在部件仍处于过热阶段即发出<b>警告</b>与<b>行动</b>报警——比吊顶探测器早数分钟。'] },
      { k: ['fap', 'f3', 'f4'], t: ['Fire panel decides', '火警主机判断'], d: ['At <b>Fire 1</b> the panel sounds the pre-discharge alarm, stops HVAC and closes dampers and doors; when a second detector confirms (<b>Fire 2</b>) a 30 s countdown starts, with an abort switch at the door.', '<b>火警1</b>时主机发出预喷放报警，关闭空调、风阀及门；第二探测器确认（<b>火警2</b>）后开始30 s倒计时，门口设中止按钮。'] },
      gas ? { k: ['agent', 'f5'], t: ['Clean agent discharges', '洁净气体喷放'], d: ['In ' + fs.gasZones + ' gas zones the agent (' + F(fs.agentKg) + ' kg) discharges in ≤ 10 s and holds the design concentration ≥ 10 min — no water, no residue on the IT.', fs.gasZones + '个气体防区内灭火剂（' + F(fs.agentKg) + ' kg）≤10 s喷放并保持设计浓度≥10 min——无水、IT设备无残留。'] }
        : { k: ['preact', 'f5'], t: ['Pre-action water', '预作用喷水'], d: ['The halls use <b>pre-action</b> sprinklers: the pipes fill only after the detector alarm, and water flows only from heads opened by heat — never from a damaged pipe over live IT. Gas protects the MMR and electrical rooms.', '机房采用<b>预作用</b>喷淋：探测器报警后管道才充水，且只有受热开启的喷头出水——不会因管道损坏淋湿运行中的IT。MMR及电气室采用气体灭火。'] },
      { k: ['preact', 'firepump'], t: ['Fire water', '消防水'], d: ['A fire-water reservoir with duty and standby pumps (electric + diesel) and a jockey pump keeps the sprinkler mains pressurised' + (gas ? '; pre-action covers the areas the fire authority requires.' : '.'), '消防水池配主备消防泵（电动+柴油）及稳压泵，保持喷淋管网压力' + (gas ? '；预作用覆盖消防部门要求的区域。' : '。')] },
      { k: ['liion'], t: ['Li-ion battery room', '锂电池室'], d: ['Off-gas sensors isolate a battery string before thermal runaway; ventilation, spacing per NFPA 855 and suppression chosen from UL 9540A tests contain an event.', '逸出气体探测在热失控前隔离电池组；通风、按NFPA 855的间距及依据UL 9540A测试选择的灭火方式控制事故。'] },
      { k: ['bms', 'epms', 'dcim', 'leak', 'f6'], t: ['Monitoring & reset', '监控与复位'], d: ['BMS (≈ ' + F(fs.bmsPts) + ' points), EPMS (≈ ' + F(fs.meters) + ' meters), DCIM and leak detection feed the NOC; after an event the room is ventilated, inspected, recharged and reported.', 'BMS（约' + F(fs.bmsPts) + '点）、EPMS（约' + F(fs.meters) + '块电表）、DCIM及漏水检测上传NOC；事件后房间通风、检查、充装并报告。'] }
    ];
  }
  function principleSvg() {
    var o = '<svg viewBox="0 0 340 196" role="img" aria-label="detection">';
    o += '<path d="M30 168H326M30 168V20" stroke="#5D6280" stroke-width="2"/>' + L.text(326, 186, ['time', '时间'], 'tc-ls', ' text-anchor="end"') + L.text(34, 16, ['smoke', '烟雾'], 'tc-ls');
    o += '<path d="M30 164C120 162 170 150 210 120S270 40 300 22" fill="none" stroke="#17153F" stroke-width="3"/>';
    [[150, '#16A34A', ['Alert', '警告']], [138, '#E39B1B', ['Action', '行动']], [122, '#E5534B', ['Fire 1', '火警1']], [96, '#8E1F1A', ['Fire 2', '火警2']], [50, '#9AA0BC', ['Point detector', '点型探测器']]].forEach(function (lv) {
      o += '<path d="M30 ' + lv[0] + 'H326" stroke="' + lv[1] + '" stroke-width="1.6" stroke-dasharray="5 4"/>' + L.text(36, lv[0] - 3, lv[2], 'tc-ls', ' style="font-size:11px;font-weight:700;fill:' + lv[1] + '"');
    });
    return o + L.text(178, 186, ['aspirating detection warns minutes earlier', '吸气式探测提前数分钟预警'], 'tc-ls', ' text-anchor="middle" style="font-weight:700"') + '</svg>';
  }
  function right(c) {
    var R = c.R, fs = R.fs;
    return L.principle('asdT', 'fire', ['See smoke before fire', '起火前发现烟雾'], principleSvg(), ['Aspirating detection raises alert, action and fire levels while a component is still overheating — long before a point detector or a flame.', '在部件仍处于过热阶段时，吸气式探测即发出警告、行动及火警分级报警——远早于点型探测器或明火。']) +
      L.chips([['bms', 'monitor', ['BMS', '楼宇自控']], ['epms', 'bolt', ['EPMS', '电力监控']], ['dcim', 'grid', ['DCIM', 'DCIM']], ['leak', 'drop', ['Leak detection', '漏水检测']]]) +
      L.kpis([['layers', String(fs.securityLayers), ['layers', '层'], ['Security layers', '安防层级'], ['fence → rack', '围栏→机柜']],
        ['agentT', '≤ 10', 's', ['Agent discharge', '气体喷放'], ['NFPA 2001 halocarbon', 'NFPA 2001卤代烷']],
        ['asdT', '≤ 120', 's', ['ASD transport', '吸气传输时间'], ['EN 54-20 | NFPA 72', 'EN 54-20 | NFPA 72']],
        ['cctvT', '≥ 90', ['days', '天'], ['Video retention', '录像保存'], ['≈ ' + F(fs.cams) + ' cameras', '约' + F(fs.cams) + '台摄像机']]]);
  }
  function bottom(c) {
    var R = c.R, fs = R.fs, h = '';
    h += L.tile(0, 'layers', 'shield', ['Security layers', '安防层级'], [fs.securityLayers + ' layers', fs.securityLayers + '层'], '<ul class="tc-chain">' + [['Fence', '围栏'], ['Gate', '入口'], ['Building', '建筑'], ['Mantrap', '防尾随'], ['Hall door', '机房门'], ['Cage', '笼位'], ['Rack lock', '机柜锁']].slice(0, fs.securityLayers).map(function (x) { return '<li>' + L.te(x) + '</li>'; }).join('') + '</ul>' + L.note(['Every door event is logged and linked to video.', '每次门禁事件均记录并联动视频。']));
    h += L.tile(1, 'agentT', 'fire', ['Suppression options', '灭火方式'], ['design', '设计'], L.mtable([['Agent', '灭火剂'], ['Design', '设计浓度'], ['Discharge', '喷放']], [['HFC-227ea', '≈ 7–8 %', '≤ 10 s'], ['FK-5-1-12', '≈ 4.2–5.3 %', '≤ 10 s'], ['IG-541', '≈ 38–42 %', '60–120 s'], [t(['Pre-action water', '预作用喷水']), '–', t(['per head', '逐喷头'])]]) + L.note(['Gas needs a tight room (door-fan test).', '气体灭火需房间密闭（门风扇测试）。']), '#FCE9E7');
    h += L.tile(2, 'pointsT', 'monitor', ['Monitoring points', '监控点位'], ['this basis', '本基准'], L.facts([[['BMS points', 'BMS点位'], F(fs.bmsPts), ['mechanical & environment', '机电与环境']], [['EPMS meters', 'EPMS电表'], F(fs.meters), ['power chain', '供电链']], [['Cameras', '摄像机'], F(fs.cams), ['≥ 90 days', '≥90天']], [['Access doors', '门禁点'], F(fs.readers), ['card + biometric', '卡+生物识别']]]));
    var codes = DB.standards.filter(function (s) { return s.a === 'FIRE'; });
    h += L.tile(3, 'fstd', 'law', ['Fire codes', '消防规范'], ['knowledge base', '知识库'], '<div class="tc-pins">' + codes.slice(0, 10).map(function (s) { return '<span>' + L.e(s.c.replace(/\s*\(.*\)/, '').slice(0, 24)) + '</span>'; }).join('') + '</div>' + L.note([codes.length + ' fire and life-safety references (Indonesia, NFPA, EN, ISO).', codes.length + '项消防与生命安全规范（印尼、NFPA、EN、ISO）。']));
    h += L.tile(4, 'faq', 'chat', ['Client questions', '客户问题'], [FAQ.length + ' answers', FAQ.length + '个解答'], '<div class="tc-qs">' + FAQ.slice(0, 4).map(function (q) { return '<span>' + L.te(q[0]) + '</span>'; }).join('') + '</div>', '#E2F5FA');
    return h;
  }
  function stdPanel() {
    var REG = { INT: ['International', '国际'], US: ['USA', '美国'], EU: ['Europe', '欧洲'], CN: ['China', '中国'], ID: ['Indonesia', '印度尼西亚'], SG: ['Singapore', '新加坡'] };
    var rows = DB.standards.filter(function (s) { return s.a === 'FIRE' || /NFPA|SC-0|UL 9540|EN 54/.test(s.c); }).sort(function (a, b) { return (a.r === 'ID' ? 0 : 1) - (b.r === 'ID' ? 0 : 1); }).map(function (s) { return ['<b>' + L.e(s.c) + '</b>', L.te(REG[s.r] || [s.r, s.r]), L.te([s.en, s.zh])]; });
    return L.freePanel('fstd', '§', ['Fire & life-safety codes', '消防与生命安全规范'], ['From the standards library of this website', '来自本网站规范库'], L.ptable([['Code', '规范'], ['Region', '地区'], ['Scope', '范围']], rows), 'x');
  }
  var card = {
    id: 'FSM', abbr: null, title: ['Fire, Security & Monitoring', '消防、安防与监控'], short: ['Fire | Security | Monitoring', '消防·安防·监控'], icon: 'shield',
    blurb: ['Security layers, early detection, suppression, NOC', '安防层级、早期探测、灭火、NOC'], badge: ['Safety & operations', '安全与运维'], basis: 'A05', units: UNITS, faq: FAQ,
    calc: Object.assign({}, X.CALC, { asdT: X.CALC.asd, agentT: X.CALC.agent, cctvT: X.CALC.cctv, pointsT: X.CALC.points }),
    steps: steps,
    gloss: [['ASD', '吸气式感烟探测', 'Aspirating smoke detection (VESDA-type).', '吸气式感烟探测（VESDA类）。'], ['PIDS', '周界入侵探测', 'Perimeter intrusion detection system.', '周界入侵探测系统。'], ['NOAEL', '无可见不良影响水平', 'No-observed-adverse-effect level of an agent.', '灭火剂的无可见不良影响浓度。'], ['NVR', '网络录像机', 'Network video recorder.', '网络录像机。'], ['EOP / SOP / MOP', '应急/标准/方法操作程序', 'Emergency, standard and method of procedure documents.', '应急、标准及方法操作程序文件。']],
    sources: ['NFPA 75 / 76 / 72 / 2001 / 855', 'EN 54-20', ['Permen PU 26/2008 (fire safety in buildings)', 'Permen PU 26/2008（建筑防火）'], 'UL 9540A', ['ASTM F2656 / IWA 14 (vehicle barriers)', 'ASTM F2656 / IWA 14（车辆路障）'], ['Assessment engine fire & security sizing', '评估引擎消防及安防估算']],
    stage: function (c) {
      var R = c.R, fs = R.fs;
      card.tag = ['<b>' + fs.securityLayers + '</b> security layers from fence to rack, very early smoke detection, ' + (fs.gasZones ? 'clean-agent gas in <b>' + fs.gasZones + '</b> zones' : 'pre-action sprinklers in the halls') + ' and a 24/7 NOC watching ≈ <b>' + F(fs.bmsPts) + '</b> BMS points and <b>' + F(fs.cams) + '</b> cameras.',
        '从围栏到机柜<b>' + fs.securityLayers + '</b>道安防、极早期烟雾探测、' + (fs.gasZones ? '<b>' + fs.gasZones + '</b>个洁净气体防区' : '机房预作用喷淋') + '，以及7×24 NOC监控约<b>' + F(fs.bmsPts) + '</b>个BMS点位及<b>' + F(fs.cams) + '</b>台摄像机。'];
      return L.header(card) + pfd(c) + right(c) + bottom(c) + L.footer(['Indicative values for the selected design basis; fire strategy and suppression design are agreed with the local fire authority (Damkar).', '所选设计基准的参考值；消防策略及灭火设计须与当地消防主管部门（Damkar）确认。'], [['basis', L.UI.basis], ['gloss', L.UI.gloss]]);
    },
    panels: function (c) {
      var P = UNITS.map(function (u) { return L.unitPanel(u, c); });
      THEORY.forEach(function (th, i) { P.push(L.theoryPanel(Object.assign({}, X.TH[th[1]], { id: th[0] }), 'T' + (i + 1), c)); });
      P.push(stdPanel()); P.push(L.faqPanel(card));
      return P;
    }
  };
  TC.register(card);
})(window);
