/* Technology card: Fire, Security & Monitoring (security layers, very early detection, suppression, Li-ion safety, NOC). */
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

  function pfd(c) {
    var R = c.R, fs = R.fs, o = '';
    o += L.ground(132, 232, 1330) + L.R(132, 242, 1330, 40, 'url(#tcSoil)', ' opacity=".5"') + L.R(0, 497, 1470, 16, 'url(#tcGround)');
    o += L.waves(0, 512, 1470, 108, 'url(#tcWater)', 6, 140, 7, '#7FD0EA');
    /* signal lines to the NOC */
    o += L.thin('M330 150V124H1220', 'data', 2.4, '3 4') + L.thin('M912 182V124', 'data', 2.4, '3 4') + L.thin('M1010 150V124', 'data', 2.4, '3 4');
    /* fire water and gas */
    o += L.pipe('M660 513V430', 'fire', 6, true, true) + L.pipe('M612 400V392H662', 'fire', 4, false) + L.thin('M430 410V372H1380V392', 'sig', 2.2, '3 4');
    o += L.banner(140, 0, 1310, ['① SECURITY LAYERS · 安防层级', '① 安防层级 · SECURITY'], ['detect, delay and verify from the fence to the rack', '从围栏到机柜逐层探测、延迟与确认'], null, 'tcZone');
    o += L.banner(640, 290, 820, ['② FIRE DETECTION & SUPPRESSION · 火灾探测与灭火', '② 火灾探测与灭火 · FIRE'], ['see smoke early, suppress without water damage', '早期发现烟雾，灭火不损坏设备'], null, 'tcZone4');
    o += L.banner(130, 290, 490, ['③ CONTROL & BATTERIES · 控制与电池', '③ 控制与电池 · CONTROL'], ['panel · batteries', '主机 · 电池'], null, 'tcZone5');
    /* row 1 */
    var f1 = L.fence(150, 232, 170, 62) + L.R(326, 140, 4, 92, '#5E6484') + L.camera(330, 146, .9);
    o += L.hot('fence', ['Perimeter', '周界'], 144, 38, 220, 200, f1 + L.label(245, 60, '01', ['Perimeter', '周界'], ['fence + intrusion detection', '围栏+入侵探测']));
    o += L.hot('gate', ['Gate & barriers', '入口与路障'], 396, 38, 270, 200, L.building(400, 186, 84, 46, '#5D6280') + L.barrier(492, 232, 80) + L.bollards(596, 232, 4) + L.label(520, 60, '02', ['Gate & barriers', '入口与路障'], ['crash-rated · guardhouse', '防冲撞 · 门卫室']));
    o += L.hot('mantrap', ['Mantrap', '防尾随门'], 694, 38, 110, 200, L.mantrap(700, 232, 96) + L.label(730, 60, '03', ['Mantrap', '防尾随门'], ['anti-tailgating', '防尾随']));
    var door = L.R(830, 128, 70, 104, '#E9EBF4', ' rx="3" stroke="#5E6484" stroke-width="2"') + L.R(842, 140, 46, 36, 'url(#tcGlass)', ' rx="2"') + L.R(888, 182, 6, 14, '#5E6484', ' rx="2"') + L.reader(906, 168);
    o += L.hot('access', ['Access control', '门禁'], 824, 38, 120, 200, door + L.label(905, 60, '04', ['Access control', '门禁'], ['≈ ' + F(fs.readers) + ' doors', '约' + F(fs.readers) + '个门']));
    var cam = L.cab(980, 150, 60, 82, '#E9EBF4', { door: false }) + L.R(988, 164, 44, 6, '#16A34A') + L.R(988, 176, 44, 6, '#16A34A') + L.R(988, 188, 44, 6, '#16A34A') + L.camera(1066, 142, 1) + L.R(1150, 150, 4, 82, '#5E6484') + L.camera(1150, 156, 1, true);
    o += L.hot('cctv', ['CCTV', '视频监控'], 974, 38, 220, 200, cam + L.label(1080, 60, '05', ['CCTV', '视频监控'], ['≈ ' + F(fs.cams) + ' cameras', '约' + F(fs.cams) + '台摄像机']));
    o += L.hot('noc', ['NOC', '运营中心'], 1214, 38, 240, 200, L.nocWall(1220, 112, 230, 120) + L.label(1335, 60, '06', ['NOC', '运营中心'], ['24/7 · BMS · EPMS · DCIM', '7×24 · BMS·EPMS·DCIM']));
    /* row 2: data hall */
    var hall = L.R(650, 380, 790, 117, '#F7F8FD', ' rx="4" stroke="#C9CDE0"') + L.rackRow(720, 432, 13, 40, 64, { blink: true });
    o += hall;
    var vp = '<path d="M670 392H1380" stroke="#E5534B" stroke-width="5"/>';
    for (var i = 0; i < 12; i++) vp += '<circle cx="' + (700 + i * 56) + '" cy="392" r="3.4" fill="#fff" stroke="#E5534B" stroke-width="1.8"/>';
    vp += L.bubbles(700, 396, 640, 30, 6, 21, '#9AA0BC', .5, false, 1, 2);
    o += L.hot('vesda', ['Aspirating smoke detection', '吸气式感烟探测'], 664, 330, 790, 70, vp + L.vesda(1380, 404, 48, 84) + L.label(1300, 352, '07', ['Aspirating detection', '吸气式探测'], ['≈ ' + fs.asd + ' detectors', '约' + fs.asd + '台']));
    o += L.hot('preact', ['Pre-action sprinklers', '预作用喷淋'], 664, 400, 710, 34, L.sprinklers(680, 410, 690, 12) + L.R(654, 420, 16, 30, '#C93A33', ' rx="3"') + L.label(1046, 352, '08', ['Pre-action sprinklers', '预作用喷淋'], ['double interlock', '双连锁']));
    o += L.hot('agent', ['Clean-agent gas', '洁净气体'], 520, 330, 120, 170, L.gasCyl(530, 404, 4) + L.label(590, 352, '09', ['Clean agent', '洁净气体'], fs.gasZones ? [fs.gasZones + ' zones · ' + F(fs.agentKg) + ' kg', fs.gasZones + '区 · ' + F(fs.agentKg) + ' kg'] : ['MMR · electrical rooms', 'MMR · 电气室']));
    o += L.hot('fap', ['Fire alarm panel', '火灾报警控制器'], 360, 330, 140, 170, L.firePanel(400, 410, 60, 88) + L.label(410, 352, '10', ['Fire panel', '火警主机'], ['cause & effect', '联动矩阵']));
    var li = L.R(150, 400, 190, 97, '#F7F8FD', ' rx="4" stroke="#C9CDE0"') + L.battRack(160, 420, 3, 96, 76, true) + L.fan(300, 420, 12, 1.6, true) + '<circle cx="300" cy="460" r="7" fill="#E39B1B"/><path d="M296 460h8M300 456v8" stroke="#fff" stroke-width="1.6"/>';
    o += L.hot('liion', ['Li-ion battery room', '锂电池室'], 140, 330, 210, 170, li + L.label(240, 352, '11', ['Li-ion room', '锂电池室'], ['off-gas · NFPA 855', '逸出气体 · NFPA 855']));
    var fp = L.pump(40, 600, .9, '#C93A33') + L.pump(130, 600, .9, '#C93A33') + '<circle cx="238" cy="560" r="12.5" fill="url(#tcZone4)"/>' + L.text(238, 564.5, '12', 'tc-ln', ' text-anchor="middle"') + L.text(256, 566, ['Fire-water reservoir & fire pumps', '消防水池与消防泵'], 'tc-lw', ' style="font-size:14px"');
    o += L.hot('firepump', ['Fire pumps & water', '消防泵与水池'], 20, 520, 560, 96, fp);
    return '<svg class="tc-pfd tc-abs" viewBox="0 0 1470 620" role="img" aria-label="' + L.te(['Fire, security and monitoring', '消防、安防与监控']) + '">' + o + '</svg>';
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
        ['asdT', '≤ 120', 's', ['ASD transport', '吸气传输时间'], ['EN 54-20 · NFPA 72', 'EN 54-20 · NFPA 72']],
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
    id: 'FSM', abbr: null, title: ['Fire, Security & Monitoring', '消防、安防与监控'], short: ['Fire · Security · Monitoring', '消防·安防·监控'], icon: 'shield',
    blurb: ['Security layers, early detection, suppression, NOC', '安防层级、早期探测、灭火、NOC'], badge: ['Safety & operations', '安全与运维'], basis: 'A05', units: UNITS, faq: FAQ,
    calc: Object.assign({}, X.CALC, { asdT: X.CALC.asd, agentT: X.CALC.agent, cctvT: X.CALC.cctv, pointsT: X.CALC.points }),
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
