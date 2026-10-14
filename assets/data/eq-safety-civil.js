/* Fire Protection, Security, Monitoring & Control, Civil/Structural/Architectural */
(function (g) {
  var D = g.DCDB || (g.DCDB = { systems: [], equipment: [] });
  var BID = 'By Bidder / 投标人填写';
  D.equipment.push(

  /* ============================ FIRE PROTECTION ============================ */
  { id: 'FP-01', sys: 'FP', cls: 'M', en: 'Addressable Fire Alarm & Detection System', zh: '可寻址火灾自动报警系统',
    fn: ['Detects fire/smoke, alerts occupants, and coordinates release of suppression, shutdown of HVAC, door release and EPO interfaces.', '探测火灾/烟雾、警示人员，并联动灭火释放、关闭空调、门禁释放及紧急断电接口。'],
    ty: ['Networked addressable FACP, loop-powered smoke/heat detectors, manual call points, sounders/strobes.', '联网可寻址火灾报警控制器，回路供电的感烟/感温探测器、手动报警按钮、声光报警器。'],
    s: [
      ['Addressable, networked panels with redundant loops (Class A / Style 7 wiring) — single break shall not lose devices.', '可寻址联网控制器，冗余回路（A类/Style 7接线）——单点断线不得丢失设备。'],
      ['Cross-zoned (double-knock) logic for suppression release: two independent detection signals required.', '灭火释放采用交叉区（双重确认）逻辑：需两个独立探测信号。'],
      ['Interfaces: BMS, access control (fail-safe door release), CRAH/AHU shutdown, gas release panel, pre-action valve.', '接口：BMS、门禁（失效安全型门释放）、精密空调/新风机关闭、气体释放盘、预作用阀。'],
      ['Battery standby 24 h + 30 min alarm (EN 54-4 / NFPA 72).', '备用电池满足24 h监视+30 min报警（EN 54-4 / NFPA 72）。']
    ],
    tpg: [
      ['Manufacturer / panel model', '制造商 / 主机型号', '-', BID],
      ['Approvals', '认证', '-', 'EN 54 / UL 864 / GB 4717 (CCCF)'],
      ['Loops per panel / devices per loop', '每台回路数 / 每回路设备数', 'no.', BID],
      ['Loop wiring class', '回路接线等级', '-', 'Class A (loop)'],
      ['Panel networking / redundancy', '主机联网 / 冗余', '-', 'Peer-to-peer, fault-tolerant'],
      ['Standby battery duration', '备用电池时间', 'h', '24 + 0.5 alarm'],
      ['Event log capacity', '事件记录容量', 'events', '≥ 10,000'],
      ['BMS interface', 'BMS接口', '-', 'BACnet / Modbus gateway']
    ],
    std: ['NFPA 72', 'NFPA 75', 'NFPA 76', 'EN 54', 'GB 50116', 'GB 4717', 'SNI 03-3985'],
    t: [['100% device test, cause-and-effect matrix verification, battery capacity test.', '设备100%测试、联动矩阵验证、电池容量测试。']] },

  { id: 'FP-02', sys: 'FP', cls: 'M', en: 'Aspirating Smoke Detection (ASD / VESDA-type)', zh: '吸气式感烟火灾探测（极早期）',
    fn: ['Continuously samples air through pipe networks and detects smoke at very early (incipient) stage — essential in high-airflow white space.', '通过采样管网连续抽取空气，在极早期（阴燃阶段）探测烟雾——高风速机房的必备设施。'],
    ty: ['Class A sensitivity laser detectors, 4 pipes × 100 m each, sampling at return air paths and ceiling/under-floor.', 'A类灵敏度激光探测器，每台4根采样管各100 m，在回风路径及顶棚/地板下采样。'],
    s: [['Multi-level alarms (Alert, Action, Fire 1, Fire 2) with ASD used as one input of double-knock.', '多级报警（警告、行动、火警1、火警2），ASD作为双重确认的一个输入。'],
        ['Sampling holes at CRAH/fan-wall returns and in hot-aisle containment; transport time ≤ 60 s.', '在精密空调/风墙回风口及热通道封闭内设采样孔；传输时间≤60 s。']],
    tpg: [
      ['Sensitivity range', '灵敏度范围', '%obs/m', '0.005 – 20'],
      ['Classification', '等级', '-', 'EN 54-20 Class A'],
      ['Max. transport time', '最大传输时间', 's', '≤ 60 (≤ 120 per NFPA 72)'],
      ['Pipe length / number of pipes', '采样管长度 / 数量', 'm / no.', '≤ 100 / 4'],
      ['Airflow monitoring', '气流监测', '-', 'Ultrasonic, per pipe'],
      ['Filter life', '过滤器寿命', 'years', '≥ 2']
    ],
    std: ['EN 54-20', 'NFPA 72', 'BS 6266', 'GB 50116', 'GB 15631'],
    t: [['Smoke and transport-time tests from the farthest sampling hole.', '从最远采样孔进行烟雾及传输时间测试。']] },

  { id: 'FP-03', sys: 'FP', cls: 'M', en: 'Clean-Agent Gaseous Suppression (Halocarbon)', zh: '洁净气体灭火系统（卤代烃类）',
    fn: ['Total-flooding clean agent extinguishes fire without residue or water damage. Common agents: HFC-227ea (FM-200) and FK-5-1-12; note HFC phase-down and PFAS restrictions — verify long-term agent availability.', '全淹没式洁净灭火剂，灭火无残留、无水渍。常用七氟丙烷（HFC-227ea）和全氟己酮（FK-5-1-12）；需注意HFC削减及PFAS限制，核实灭火剂长期供应。'],
    ty: ['Engineered pipe-network or modular cylinders; design concentration ~7–8% (HFC-227ea) or ~4.5–5.9% (FK-5-1-12).', '组合分配管网或无管网柜式；设计浓度约7–8%（七氟丙烷）或约4.5–5.9%（全氟己酮）。'],
    s: [
      ['Discharge time ≤ 10 s (NFPA 2001) or ≤ 8 s for computer rooms (GB 50370); hold time ≥ 10 min.', '喷放时间≤10 s（NFPA 2001）或计算机房≤8 s（GB 50370）；浸渍时间≥10 min。'],
      ['Room integrity (door fan) test to prove hold time; pressure relief vents sized per agent.', '房间密闭性（门风扇）测试以验证浸渍时间；按灭火剂计算设置泄压口。'],
      ['Silenced/acoustically-optimised nozzles to avoid HDD damage from discharge noise.', '采用消声/声学优化喷嘴，避免喷放噪声损坏硬盘。'],
      ['Abort and manual release stations; 30 s pre-discharge delay; main/reserve cylinders for Tier IV.', '设紧急停止及手动释放按钮；30 s延时喷放；Tier IV设主/备用钢瓶。']
    ],
    tpg: [
      ['Agent type', '灭火剂类型', '-', 'HFC-227ea / FK-5-1-12 (per AHJ)'],
      ['Design concentration', '设计浓度', '%', 'Per NFPA 2001 / GB 50370'],
      ['Discharge time', '喷放时间', 's', '≤ 10 (≤ 8 GB 50370)'],
      ['Hold (soaking) time', '浸渍时间', 'min', '≥ 10'],
      ['Cylinder storage pressure', '储存压力', 'bar', '25 / 42'],
      ['Nozzle type', '喷嘴类型', '-', 'Low-noise (≤ 110 dB at 1 m)'],
      ['Approvals', '认证', '-', 'UL / FM / CCCF'],
      ['Reserve agent', '备用灭火剂', '-', '100% connected reserve (Tier IV)']
    ],
    std: ['NFPA 2001', 'ISO 14520', 'EN 15004', 'GB 50370', 'GB 50263'],
    t: [['Door-fan integrity test, pipe pressure test, simulated release (no agent) with cause & effect.', '门风扇密闭测试、管道压力试验、模拟释放（不喷药）及联动验证。']] },

  { id: 'FP-04', sys: 'FP', cls: 'S', en: 'Inert Gas Suppression (IG-541 / IG-55)', zh: '惰性气体灭火系统（IG-541 / IG-55）',
    fn: ['Natural gas blends (N₂/Ar/CO₂) reduce oxygen to ~12–14%; zero ODP/GWP and no supply-chain risk from HFC/PFAS rules.', '天然气体混合物（N₂/Ar/CO₂）将氧气降至约12–14%；ODP/GWP为零，不受HFC/PFAS法规的供应风险影响。'],
    ty: ['300 bar cylinders, pressure-reducing nozzles/orifices; requires larger cylinder room than halocarbons.', '300 bar钢瓶，配减压孔板/喷嘴；钢瓶间面积大于卤代烃系统。'],
    s: [['95% of design quantity discharged within 60 s (NFPA 2001) — GB 50370: 48–60 s.', '60 s内喷放设计用量的95%（NFPA 2001）——GB 50370要求48–60 s。'],
        ['Over-pressure venting essential; constant-flow valves to limit peak pressure.', '必须设泄压口；采用恒流阀限制峰值压力。']],
    tpg: [
      ['Agent', '灭火剂', '-', 'IG-541 or IG-55'],
      ['Design concentration', '设计浓度', '%', '≈ 37 – 43 (Class A)'],
      ['Discharge time (95%)', '喷放时间(95%)', 's', '≤ 60'],
      ['Storage pressure', '储存压力', 'bar', '200 / 300'],
      ['Cylinder room area', '钢瓶间面积', 'm²', BID]
    ],
    std: ['NFPA 2001', 'ISO 14520', 'GB 50370'],
    t: [['Integrity test and pipe network pressure test.', '密闭性测试及管网压力试验。']] },

  { id: 'FP-05', sys: 'FP', cls: 'M', en: 'Pre-Action Sprinkler System (Double Interlock)', zh: '预作用自动喷水灭火系统（双连锁）',
    fn: ['Dry pipes in white space fill with water only after two events (detection + sprinkler head operation), minimising accidental water damage.', '机房内为干管，仅在两个事件（探测报警+喷头动作）同时发生后才充水，最大限度减少误喷水损。'],
    ty: ['Double-interlock pre-action valve per zone, nitrogen supervisory gas, quick-response sprinklers 68–93 °C.', '每区设双连锁预作用阀，氮气监督充气，快速响应喷头68–93 °C。'],
    s: [['Nitrogen generator for supervisory pressure to limit corrosion (MIC) in dry pipes.', '采用氮气发生器提供监督气压，以减少干管腐蚀（MIC）。'],
        ['Water delivery to remote head within 60 s; hazard classification per NFPA 13 / GB 50084.', '最远喷头60 s内出水；危险等级按NFPA 13 / GB 50084划分。']],
    tpg: [
      ['System type', '系统类型', '-', 'Double-interlock pre-action'],
      ['Design density / area', '设计喷水强度 / 作用面积', 'mm/min / m²', 'Per hazard class (e.g. OH1: 5 / 72)'],
      ['Sprinkler type / temperature', '喷头类型 / 温度', '- / °C', 'Quick response / 68 – 93'],
      ['Supervisory gas', '监督气体', '-', 'Nitrogen (≥ 98%)'],
      ['Max. water delivery time', '最大出水时间', 's', '≤ 60'],
      ['Valve approvals', '阀门认证', '-', 'UL / FM']
    ],
    std: ['NFPA 13', 'NFPA 75', 'EN 12845', 'GB 50084', 'SNI 03-3989'],
    t: [['Trip test, water delivery time test, hydrostatic test 200 psi / 1.4 MPa for 2 h.', '跳阀试验、出水时间测试、管网水压试验1.4 MPa保压2 h。']] },

  { id: 'FP-06', sys: 'FP', cls: 'S', en: 'Fire Pump Set & Hydrant System', zh: '消防泵组及消火栓系统',
    fn: ['Supplies water at required pressure to sprinklers and hydrants; electric + diesel pumps with jockey pump.', '向喷淋和消火栓系统提供所需压力的水；电动泵+柴油泵+稳压泵。'],
    ty: ['Listed horizontal split-case pumps, 1,000–2,500 gpm (63–158 L/s), fire water tank for 1–2 h.', '认证的水平中开消防泵，1,000–2,500 gpm（63–158 L/s），消防水池满足1–2 h用水。'],
    s: [['Pump performance: 150% rated flow at ≥ 65% rated pressure; shut-off ≤ 140%.', '性能：150%额定流量时压力≥65%额定压力；关阀压力≤140%。']],
    tpg: [
      ['Rated flow / pressure', '额定流量 / 压力', 'L/s / bar', 'Per hydraulic calc.'],
      ['Driver (duty / standby)', '驱动(主 / 备)', '-', 'Electric / Diesel'],
      ['Listing', '认证', '-', 'UL / FM / CCCF'],
      ['Fire water storage', '消防水储量', 'm³', 'Per code duration']
    ],
    std: ['NFPA 20', 'NFPA 14', 'GB 50974', 'GB 6245'],
    t: [['Annual-style acceptance flow test at 0 / 100 / 150%.', '按0/100/150%流量点进行验收流量测试。']] },

  { id: 'FP-07', sys: 'FP', cls: 'S', en: 'Water Leak Detection System', zh: '漏水检测系统',
    fn: ['Locates water/coolant leaks under raised floors, around CRAHs, CDUs, pipe routes and liquid-cooled racks.', '定位架空地板下、精密空调、CDU、管道路由及液冷机柜周边的漏水/漏液点。'],
    ty: ['Location-sensing cable with controller reporting position within ±1 m.', '定位式感应线缆，控制器定位精度±1 m。'],
    s: [['Distance-reading controller linked to BMS; automatic valve shut-off for liquid-cooling loops.', '定位控制器接入BMS；液冷回路联动自动关断阀。']],
    tpg: [
      ['Max. cable length per controller', '每台控制器最大线缆长度', 'm', '≥ 1,500'],
      ['Location accuracy', '定位精度', 'm', '± 1'],
      ['Detection response', '探测响应', 's', '≤ 10'],
      ['Interface', '接口', '-', 'Modbus / BACnet / dry contact']
    ],
    std: ['GB 50174', 'BS EN 50131 (alarm reference)'],
    t: [['Wet test at multiple points; location accuracy verification.', '多点湿测；定位精度验证。']] },

  { id: 'FP-08', sys: 'FP', cls: 'S', en: 'Li-ion Battery Room Protection (Off-Gas Detection)', zh: '锂电池室防护（电解液气体探测）',
    fn: ['Detects electrolyte off-gas before thermal runaway and triggers isolation, ventilation and alarms — a key mitigation for Li-ion UPS batteries.', '在热失控前探测电解液逸出气体，并联动隔离、通风及报警——锂电池UPS的关键防护措施。'],
    ty: ['Off-gas sensors per battery cabinet row, H₂/CO gas detection, explosion-control ventilation.', '每排电池柜设逸出气体传感器，H₂/CO气体探测，防爆控制通风。'],
    s: [['Design per NFPA 855 hazard mitigation analysis and UL 9540A results.', '依据NFPA 855危害缓解分析及UL 9540A结果进行设计。']],
    tpg: [
      ['Detection method', '探测方式', '-', 'Electrolyte vapour + H₂ / CO'],
      ['Detection lead time before runaway', '热失控前预警时间', 'min', BID],
      ['Automatic actions', '自动联动', '-', 'BMS trip, exhaust ON, alarm']
    ],
    std: ['NFPA 855', 'NFPA 68/69', 'UL 9540A'],
    t: [['Sensor bump test and cause-and-effect verification.', '传感器标定测试及联动验证。']] },

  { id: 'FP-09', sys: 'FP', cls: 'S', en: 'Portable Extinguishers, EPO & Fire Safety Signage', zh: '手提灭火器、紧急断电（EPO）及消防标识',
    fn: ['First-response extinguishers (CO₂/clean agent for electrical), emergency power-off where required by code, egress signage.', '首期响应灭火器（电气火灾用CO₂/洁净气体），规范要求时设紧急断电按钮，疏散标识。'],
    ty: ['5 kg CO₂ / clean-agent extinguishers at every exit; EPO with protective cover and abort time.', '每个出口设5 kg CO₂/洁净气体灭火器；EPO带保护盖及延时。'],
    s: [['EPO only where mandated (NFPA 70 Art. 645 alternatives considered) to avoid accidental shutdown.', '仅在法规强制时设置EPO（可考虑NFPA 70第645条替代方案），避免误断电。']],
    tpg: [
      ['Extinguisher type / rating', '灭火器类型 / 级别', '-', 'CO₂ 5 kg / 55B'],
      ['Max. travel distance', '最大保护距离', 'm', '≤ 15'],
      ['EPO protection', 'EPO防护', '-', 'Hinged cover + alarm']
    ],
    std: ['NFPA 10', 'NFPA 70 Art. 645', 'GB 50140'],
    t: [['Inspection and tagging.', '检查并挂牌。']] },

  /* ================================ SECURITY ================================ */
  { id: 'SC-01', sys: 'SC', cls: 'M', en: 'Access Control System (Card + Biometric)', zh: '门禁系统（卡+生物识别）',
    fn: ['Controls and logs every entry through layered zones (site → building → data hall → cage/rack) with multi-factor authentication.', '通过分层区域（场地→建筑→机房→笼位/机柜）控制并记录每一次进入，采用多因素认证。'],
    ty: ['Encrypted smart cards (DESFire EV3 / SEOS), face/palm-vein biometrics, anti-passback, rack-level e-locks.', '加密智能卡（DESFire EV3/SEOS）、人脸/掌静脉识别、防反潜回、机柜级电子锁。'],
    s: [['Two-factor (card + biometric/PIN) at white space and critical plant rooms; anti-passback and two-person rule where required.', '机房及关键设备间采用双因素（卡+生物识别/PIN）；必要时防反潜回及双人规则。'],
        ['Fail-secure locks for security perimeters, fail-safe release on fire alarm for egress doors (per code).', '安全周界采用断电闭锁，疏散门在火警时断电释放（按规范）。'],
        ['Controller redundancy, offline card database, 72 h battery backup; integration with CCTV (event video).', '控制器冗余，离线卡库，72 h电池备份；与CCTV联动（事件录像）。']],
    tpg: [
      ['Card technology', '卡技术', '-', 'MIFARE DESFire EV3 / HID SEOS'],
      ['Biometric type / FAR', '生物识别类型 / 误识率', '- / %', 'Face or palm vein / ≤ 0.0001'],
      ['Controller capacity (doors / cardholders)', '控制器容量(门 / 持卡人)', 'no.', BID],
      ['Offline operation', '离线运行', '-', 'Full decision at controller'],
      ['Standby power', '备用电源', 'h', '≥ 4 (controller), UPS-backed'],
      ['Standards / grade', '标准 / 等级', '-', 'EN 60839-11-1 Grade 3 / UL 294'],
      ['Event log retention', '事件记录保存', 'months', '≥ 12']
    ],
    std: ['EN 60839-11-1', 'UL 294', 'ISO/IEC 27001 A.7', 'GB 50396', 'GB/T 37078'],
    t: [['Door-by-door functional test, anti-passback test, fire-alarm release test.', '逐门功能测试、防反潜回测试、火警释放测试。']] },

  { id: 'SC-02', sys: 'SC', cls: 'M', en: 'IP Video Surveillance (CCTV)', zh: 'IP视频监控系统（CCTV）',
    fn: ['Records all entries, aisles, perimeter and critical plant with video analytics; supports investigations and compliance audits.', '记录所有出入口、通道、周界及关键设备，并具备视频分析，支持调查及合规审计。'],
    ty: ['4–8 MP IP cameras, H.265, 25 fps, IR/starlight, 90-day retention on RAID storage; VMS with failover.', '4–8 MP网络摄像机，H.265，25 fps，红外/星光，RAID存储保存90天；VMS具备故障切换。'],
    s: [['Full coverage of every white-space aisle, all doors (both sides) and the perimeter with no blind spots.', '全覆盖每条机房通道、所有门（两侧）及周界，无盲区。'],
        ['Recording retention ≥ 90 days (or per customer/regulatory requirement); redundant recording servers.', '录像保存≥90天（或按客户/法规要求）；冗余录像服务器。']],
    tpg: [
      ['Camera resolution', '摄像机分辨率', 'MP', '≥ 4 (8 at perimeter)'],
      ['Frame rate / compression', '帧率 / 压缩', 'fps / -', '25 / H.265'],
      ['Low-light sensitivity', '低照度', 'lux', '≤ 0.005 (colour)'],
      ['Retention period', '存储时间', 'days', '≥ 90'],
      ['Storage redundancy', '存储冗余', '-', 'RAID 6 + N+1 recorders'],
      ['Interoperability', '互操作性', '-', 'ONVIF Profile S / T'],
      ['Cybersecurity', '网络安全', '-', 'Signed firmware, TLS, 802.1X']
    ],
    std: ['IEC 62676', 'EN 62676-4', 'GB 50395', 'GB/T 28181'],
    t: [['Camera field-of-view verification against coverage drawings; retention test.', '按覆盖图验证摄像机视场；存储时间测试。']] },

  { id: 'SC-03', sys: 'SC', cls: 'S', en: 'Perimeter Fence & Intrusion Detection (PIDS)', zh: '周界围栏及入侵探测系统',
    fn: ['First line of defence: anti-climb fence with detection (fence sensors, microwave/radar), lighting and CCTV verification.', '第一道防线：防攀爬围栏配探测（围栏传感器、微波/雷达）、照明及视频复核。'],
    ty: ['2.4–3.0 m high-security mesh fence, zone length ≤ 100 m, PTZ/thermal camera tracking.', '2.4–3.0 m高安全网格围栏，防区长度≤100 m，PTZ/热成像跟踪。'],
    s: [['Detection probability ≥ 95% with nuisance alarm rate ≤ 1 per zone per month.', '探测率≥95%，误报率≤每防区每月1次。']],
    tpg: [
      ['Fence height / type', '围栏高度 / 类型', 'm', '≥ 2.4 / anti-climb 358 mesh'],
      ['Detection technology', '探测技术', '-', 'Fence sensor + radar/microwave'],
      ['Zone length', '防区长度', 'm', '≤ 100'],
      ['Probability of detection', '探测概率', '%', '≥ 95']
    ],
    std: ['ASTM F2781', 'LPS 1175', 'GB 50348'],
    t: [['Walk/climb tests per zone.', '逐防区行走/攀爬测试。']] },

  { id: 'SC-04', sys: 'SC', cls: 'S', en: 'Security Mantrap / Interlock Portal & Turnstiles', zh: '防尾随门（互锁通道）及闸机',
    fn: ['Prevents tailgating into secure zones — only one authenticated person passes at a time.', '防止尾随进入安全区域——每次仅允许一名已认证人员通过。'],
    ty: ['Two-door interlocked portal with weight/3D-vision single-person detection; full-height turnstiles at site entry.', '双门互锁通道，配重量/三维视觉单人检测；场地入口设全高转闸。'],
    s: [['Interlock: second door cannot open until the first is closed and single occupancy verified.', '互锁：第一道门关闭并确认单人后第二道门方可开启。']],
    tpg: [
      ['Detection method', '检测方式', '-', '3D vision / weight'],
      ['Throughput', '通行能力', 'persons/min', BID],
      ['Bullet / forced-entry rating (if req.)', '防弹 / 防破坏等级(如需)', '-', 'EN 1063 BR4 / EN 1627 RC3'],
      ['Emergency egress', '紧急疏散', '-', 'Fail-safe on fire alarm']
    ],
    std: ['EN 16005', 'EN 1627', 'UL 325'],
    t: [['Tailgate/piggyback test; emergency release test.', '尾随/背负测试；紧急释放测试。']] },

  { id: 'SC-05', sys: 'SC', cls: 'S', en: 'Crash-Rated Vehicle Barriers & Bollards', zh: '防冲撞车辆拦阻装置及防撞柱',
    fn: ['Stops hostile vehicles at the stand-off perimeter, protecting building façade and critical yards.', '在安全距离周界拦截恶意车辆，保护建筑外立面及关键场地。'],
    ty: ['Fixed/retractable bollards and road blockers, ASTM F2656 M30/M50 or IWA 14-1 rating.', '固定/升降防撞柱及路障机，ASTM F2656 M30/M50或IWA 14-1等级。'],
    s: [['Crash rating selected from threat assessment and available stand-off distance (≥ 30 m preferred).', '根据威胁评估及可用安全距离（优选≥30 m）选择防撞等级。']],
    tpg: [
      ['Crash rating', '防撞等级', '-', 'ASTM F2656 M30 P1 (min.)'],
      ['Operating cycle time (retractable)', '升降时间', 's', '≤ 5 (EFO ≤ 2)'],
      ['Clear opening', '净开口', 'm', BID]
    ],
    std: ['ASTM F2656', 'IWA 14-1', 'PAS 68'],
    t: [['Operational test and emergency fast operation (EFO) test.', '运行测试及紧急快速升起测试。']] },

  /* =========================== MONITORING & CONTROL ========================== */
  { id: 'MC-01', sys: 'MC', cls: 'M', en: 'Building Management System (BMS)', zh: '楼宇自控系统（BMS）',
    fn: ['Monitors and controls mechanical plant (chillers, pumps, CRAHs, ventilation), fuel, water, leak detection and alarms.', '监控机械设备（冷机、水泵、精密空调、通风）、燃油、给水、漏水检测及报警。'],
    ty: ['BACnet/IP DDC controllers, redundant servers, 3,000–50,000 points; dedicated mechanical PLCs for chiller plant.', 'BACnet/IP DDC控制器，冗余服务器，3,000–50,000点位；冷站采用专用PLC。'],
    s: [['No single controller failure shall cause loss of cooling — distributed control with fail-safe (last-state/default) outputs.', '任何单个控制器故障不得导致失冷——分布式控制，输出具备故障安全（保持/默认）状态。'],
        ['Redundant servers (hot standby), historian ≥ 2 years at 1-min resolution, time sync (NTP).', '冗余服务器（热备），历史数据1分钟分辨率保存≥2年，NTP时钟同步。'],
        ['Cybersecurity: segregated OT network, role-based access, IEC 62443 practices.', '网络安全：独立OT网络、基于角色的访问、遵循IEC 62443。']],
    tpg: [
      ['Platform / manufacturer', '平台 / 制造商', '-', BID],
      ['Protocol', '协议', '-', 'BACnet/IP (ISO 16484-5), Modbus'],
      ['Server redundancy', '服务器冗余', '-', 'Hot-standby'],
      ['Critical alarm latency', '关键报警延迟', 's', '≤ 2'],
      ['Data retention', '数据保存', 'years', '≥ 2 (1-min)'],
      ['Controller BTL listing', '控制器BTL认证', '-', 'Required'],
      ['Cybersecurity standard', '网络安全标准', '-', 'IEC 62443-3-3 SL2']
    ],
    std: ['ISO 16484', 'ASHRAE 135 (BACnet)', 'IEC 62443', 'GB 50339', 'GB/T 50314'],
    t: [['Point-to-point checkout (100%), sequence-of-operation tests, failover test.', '逐点检查（100%）、运行程序测试、故障切换测试。']] },

  { id: 'MC-02', sys: 'MC', cls: 'M', en: 'Electrical Power Monitoring System (EPMS)', zh: '电力监控系统（EPMS）',
    fn: ['High-resolution monitoring of the power chain — power quality, sequence of events, breaker status, energy and PUE metering.', '对供电链进行高分辨率监测——电能质量、事件顺序、断路器状态、能耗及PUE计量。'],
    ty: ['Class A PQ meters at incomers, class 0.5S meters at feeders, GPS/PTP time-sync, 1 ms SOE.', '进线设A级电能质量表，馈线0.5S级表计，GPS/PTP对时，1 ms事件顺序记录。'],
    s: [['Metering hierarchy sufficient to calculate PUE (ISO/IEC 30134-2 Category 2 or 3).', '计量层级应足以计算PUE（ISO/IEC 30134-2第2或第3类）。'],
        ['Waveform capture on events for root-cause analysis.', '事件时捕获波形以用于根因分析。']],
    tpg: [
      ['Incomer meter class', '进线表计等级', '-', 'IEC 61000-4-30 Class A'],
      ['Feeder meter accuracy', '馈线表计精度', '-', 'Class 0.5S'],
      ['SOE resolution', '事件顺序分辨率', 'ms', '≤ 1'],
      ['Time synchronisation', '对时方式', '-', 'PTP (IEEE 1588) / GPS'],
      ['PUE measurement category', 'PUE测量类别', '-', 'ISO/IEC 30134-2 Cat. 2+'],
      ['Data retention', '数据保存', 'years', '≥ 3']
    ],
    std: ['IEC 61000-4-30', 'IEC 62053-22', 'IEC 61850', 'ISO/IEC 30134-2', 'GB/T 32127'],
    t: [['Metering accuracy verification; SOE time-stamp test.', '计量精度验证；事件时间戳测试。']] },

  { id: 'MC-03', sys: 'MC', cls: 'M', en: 'Data Center Infrastructure Management (DCIM)', zh: '数据中心基础设施管理（DCIM）',
    fn: ['Single source of truth for assets, space, power and cooling capacity, connectivity and change management; dashboards for KPIs (PUE, WUE, CUE).', '资产、空间、电力与制冷容量、连接及变更管理的统一数据源；KPI仪表盘（PUE、WUE、CUE）。'],
    ty: ['Software platform integrating BMS, EPMS, rPDU, sensors; 3D floor models, capacity forecasting, APIs.', '集成BMS、EPMS、rPDU、传感器的软件平台；3D楼层模型、容量预测、API。'],
    s: [['Power-chain capacity modelling down to rPDU outlet with stranded-capacity reports.', '供电链容量建模至rPDU插口，并提供搁浅容量报告。'],
        ['Open APIs (REST/Redfish) and integration with ITSM/CMDB.', '开放API（REST/Redfish）并与ITSM/CMDB集成。']],
    tpg: [
      ['Modules included', '包含模块', '-', 'Asset, capacity, power, environmental, change, reporting'],
      ['Number of monitored devices / points', '监控设备 / 点位数', 'no.', BID],
      ['Integration protocols', '集成协议', '-', 'SNMP, Modbus, BACnet, Redfish, REST'],
      ['KPI reporting', 'KPI报表', '-', 'PUE, WUE, CUE, REF per ISO/IEC 30134'],
      ['Deployment', '部署方式', '-', 'On-premise, redundant']
    ],
    std: ['ISO/IEC 30134 series', 'ISO/IEC 22237-6', 'EN 50600-4'],
    t: [['Data accuracy audit and user acceptance tests.', '数据准确性审核及用户验收测试。']] },

  { id: 'MC-04', sys: 'MC', cls: 'S', en: 'Environmental Monitoring Sensors', zh: '环境监测传感器',
    fn: ['Measure rack inlet temperature, humidity and differential pressure to verify ASHRAE compliance and optimise cooling.', '测量机柜进风温度、湿度及压差，以验证是否符合ASHRAE要求并优化制冷。'],
    ty: ['Three temperature sensors per rack front (top/middle/bottom) at end and every 3rd rack; ΔP sensors per aisle.', '在列端及每隔3个机柜的正面设3个温度传感器（上/中/下）；每条通道设压差传感器。'],
    s: [['Wired or wireless sensors with ≥ 5-year battery life; data to DCIM/BMS.', '有线或无线传感器，电池寿命≥5年；数据接入DCIM/BMS。']],
    tpg: [
      ['Temperature accuracy', '温度精度', '°C', '± 0.3'],
      ['Humidity accuracy', '湿度精度', '%RH', '± 2'],
      ['Differential pressure accuracy', '压差精度', 'Pa', '± 1'],
      ['Sampling interval', '采样间隔', 's', '≤ 60']
    ],
    std: ['ASHRAE TC 9.9', 'GB 50174'],
    t: [['Calibration certificates; spot-check against reference instrument.', '校准证书；用标准仪器抽检。']] },

  { id: 'MC-05', sys: 'MC', cls: 'S', en: 'NOC / Control Room Video Wall & Workstations', zh: 'NOC监控中心大屏及工作站',
    fn: ['24/7 operations centre displaying BMS, EPMS, DCIM, security and network status.', '7×24运维中心，显示BMS、EPMS、DCIM、安防及网络状态。'],
    ty: ['LCD/LED video wall 3×3 – 4×6, redundant workstations on UPS, ergonomic consoles.', 'LCD/LED拼接大屏3×3–4×6，UPS供电的冗余工作站，人体工学操作台。'],
    s: [['Control room powered from critical UPS with independent cooling.', '控制室由关键UPS供电并配独立制冷。']],
    tpg: [
      ['Video wall size / resolution', '大屏尺寸 / 分辨率', '-', BID],
      ['Operator consoles', '操作台数量', 'no.', 'Per staffing plan'],
      ['Power source', '电源', '-', 'Critical UPS (A/B)']
    ],
    std: ['ISO 11064', 'GB 50174'],
    t: [['Display and failover test.', '显示及故障切换测试。']] },

  /* ====================== CIVIL, STRUCTURAL & ARCHITECTURAL ===================== */
  { id: 'CS-01', sys: 'CS', cls: 'M', en: 'Structural Frame & Floor Loading', zh: '结构框架及楼面荷载',
    fn: ['Carries heavy IT racks, UPS/batteries, plant and rooftop equipment; resists seismic and wind actions with an elevated importance factor.', '承载重型IT机柜、UPS/电池、设备及屋面设备；以较高重要性系数抵抗地震与风荷载。'],
    ty: ['White space 12–15 kN/m² (traditional), 20–25 kN/m² (AI/high density); battery rooms 15–25 kN/m²; clear height 4.5–6 m.', '机房12–15 kN/m²（传统），20–25 kN/m²（AI/高密度）；电池室15–25 kN/m²；净高4.5–6 m。'],
    s: [
      ['Importance / risk category III–IV per owner resilience target (e.g. Ie = 1.25–1.5).', '按业主韧性目标确定重要性/风险类别III–IV（如Ie = 1.25–1.5）。'],
      ['Floor deflection ≤ L/360 under rack loads; slab-on-grade preferred for heavy AI racks.', '机柜荷载下楼板挠度≤L/360；重型AI机柜优先采用地面板。'],
      ['Overhead support grid (unistrut/strut) designed for busway, trays, containment and piping (≥ 1.5–2.5 kN/m²).', '吊顶支撑格栅（C型钢）按母线、桥架、封闭及管道荷载设计（≥1.5–2.5 kN/m²）。'],
      ['Seismic restraint of all non-structural components (racks, cable trays, piping) in seismic regions.', '地震区所有非结构构件（机柜、桥架、管道）均设抗震约束。']
    ],
    tpg: [
      ['Design live load — white space', '设计活荷载——机房', 'kN/m²', '≥ 15 (≥ 20 for AI)'],
      ['Design live load — UPS / battery rooms', '设计活荷载——UPS/电池室', 'kN/m²', '≥ 20'],
      ['Design live load — plant rooms / roof plant', '设计活荷载——设备间/屋面设备', 'kN/m²', '≥ 10 / ≥ 7.5 + equipment'],
      ['Ceiling suspended load (services)', '吊挂荷载(机电)', 'kN/m²', '≥ 1.5'],
      ['Clear height (slab to soffit) — white space', '净高(板面至梁底)——机房', 'm', '≥ 4.5 (5.5–6 with overhead services)'],
      ['Seismic importance factor', '抗震重要性系数', '-', '1.25 – 1.5'],
      ['Floor flatness (for rolling racks)', '地面平整度(机柜推运)', 'FF/FL', '≥ 35 / 25'],
      ['Design working life', '设计使用年限', 'years', '50']
    ],
    std: ['ASCE 7', 'IBC', 'Eurocode 1 / 8', 'GB 50009', 'GB 50011', 'SNI 1726:2019', 'SNI 1727:2020', 'SNI 2847:2019'],
    t: [['Concrete cube/cylinder tests, floor flatness survey, structural inspection records.', '混凝土试块试验、地面平整度测量、结构检查记录。']] },

  { id: 'CS-02', sys: 'CS', cls: 'M', en: 'Raised Access Floor', zh: '防静电架空地板',
    fn: ['Elevated floor providing an under-floor air plenum and/or cable/pipe space. Modern hyperscale/AI halls often use slab-on-grade with overhead services instead.', '架空地板提供地板下送风静压箱和/或线缆/管道空间。现代超大规模/AI机房常采用无地板+上走线方式。'],
    ty: ['600 × 600 mm steel cement-filled or calcium-sulphate panels, 600–1,000 mm height, 30–60% perforated tiles.', '600×600 mm钢制填充水泥或硫酸钙地板，高度600–1,000 mm，开孔率30–60%的通风地板。'],
    s: [['Panels static-dissipative (resistance 2.5 × 10⁴ – 1 × 10⁹ Ω) and bonded to earth via pedestals/stringers.', '地板为静电耗散型（电阻2.5×10⁴–1×10⁹ Ω），通过支架/横梁接地。'],
        ['Concentrated load and rolling load to suit rack installation routes; seismic pedestals where needed.', '集中荷载及滚动荷载满足机柜搬运路径；必要时采用抗震支架。']],
    tpg: [
      ['Panel size / type', '板块尺寸 / 类型', 'mm / -', '600 × 600 / steel cement-filled'],
      ['Finished floor height', '完成面高度', 'mm', '600 – 1,000'],
      ['Concentrated load (deflection ≤ 2 mm)', '集中荷载(挠度≤2 mm)', 'kN', '≥ 4.5 (≥ 6.7 heavy duty)'],
      ['Uniform distributed load', '均布荷载', 'kN/m²', '≥ 23'],
      ['Rolling load (10 passes)', '滚动荷载(10次)', 'kN', '≥ 4.5'],
      ['Electrical resistance', '电阻', 'Ω', '2.5 × 10⁴ – 1 × 10⁹'],
      ['Perforated tile open area', '通风地板开孔率', '%', '25 – 56 (with dampers)'],
      ['Fire rating', '燃烧性能', '-', 'Class A1 / A (non-combustible)']
    ],
    std: ['CISCA', 'EN 12825', 'GB/T 36340', 'GB 50174', 'SJ/T 10796'],
    t: [['Load test certificate; electrical resistance measurement; level survey.', '荷载测试证书；电阻测量；标高测量。']] },

  { id: 'CS-03', sys: 'CS', cls: 'S', en: 'Building Envelope, Roof & Waterproofing', zh: '建筑围护、屋面及防水',
    fn: ['Keeps water, dust and heat out; supports rooftop plant; resists wind uplift and severe weather.', '防止雨水、灰尘和热量侵入；承载屋面设备；抵抗风揭及恶劣天气。'],
    ty: ['Insulated metal panels or precast concrete; single-ply or built-up roof with 25-year warranty.', '保温金属板或预制混凝土；单层或多层屋面防水，质保25年。'],
    s: [['No roof penetrations or water-bearing services directly above white space; secondary roof drainage.', '机房正上方不设屋面穿洞及含水管线；设置溢流排水。'],
        ['Ground-floor level above 100-year (500-year for Tier IV) flood level plus freeboard.', '首层标高高于百年一遇（Tier IV为五百年一遇）洪水位并留超高。']],
    tpg: [
      ['Roof wind uplift rating', '屋面抗风揭等级', '-', 'FM 1-90 or per wind study'],
      ['Wall / roof U-value', '墙体 / 屋面传热系数', 'W/m²K', 'Per energy code'],
      ['Waterproofing warranty', '防水质保', 'years', '≥ 20'],
      ['Finished floor level vs. design flood', '室内地坪相对设计洪水位', 'm', '≥ +0.5 above 100-yr flood']
    ],
    std: ['FM Global DS 1-28', 'ASCE 24', 'GB 50345', 'GB 50207'],
    t: [['Flood/water test of roof; air-tightness test of white space.', '屋面蓄水/淋水试验；机房气密性测试。']] },

  { id: 'CS-04', sys: 'CS', cls: 'S', en: 'Fire-Rated Walls, Doors & Fire Stopping', zh: '防火墙、防火门及防火封堵',
    fn: ['Compartmentalises data halls, electrical/battery rooms and generator rooms to limit fire spread (key to Tier IV compartmentalisation).', '对数据机房、电气/电池室及发电机房进行防火分隔，限制火灾蔓延（Tier IV分区隔离的关键）。'],
    ty: ['2-h walls between data halls and plant rooms; 1.5–2 h doors; listed penetration seals.', '机房与设备间之间2 h防火墙；1.5–2 h防火门；经认证的穿越封堵。'],
    s: [['Fire-resistance ratings per NFPA 75 / local code; A and B system paths in separate fire compartments for Tier IV.', '耐火等级按NFPA 75/当地规范；Tier IV的A、B路系统位于不同防火分区。'],
        ['All penetrations sealed with tested systems (UL/EN 1366-3) and labelled.', '所有穿越孔洞采用经测试的封堵系统（UL/EN 1366-3）并标识。']],
    tpg: [
      ['Wall fire rating (data hall ↔ plant)', '墙体耐火(机房↔设备间)', 'h', '≥ 2'],
      ['Door fire rating', '防火门耐火', 'h', '1.5 – 2'],
      ['Penetration seal standard', '封堵标准', '-', 'UL 1479 / EN 1366-3'],
      ['Door size for equipment', '设备搬运门尺寸', 'm', '≥ 1.5 × 2.7 (≥ 2.4 × 3.0 loading)']
    ],
    std: ['NFPA 75', 'NFPA 80', 'NFPA 101', 'GB 50016', 'GB 12955'],
    t: [['Inspection of each penetration; door hardware tests.', '逐处检查穿越封堵；门五金测试。']] },

  { id: 'CS-05', sys: 'CS', cls: 'S', en: 'Architectural Finishes for Critical Spaces', zh: '关键空间建筑装饰',
    fn: ['Dust-free, static-safe, light-reflective finishes that support cleanliness (ISO 14644 Class 8) and operations.', '无尘、防静电、高反光的装饰面，满足洁净度（ISO 14644 8级）与运维要求。'],
    ty: ['Sealed/epoxy floors, dust-free painted walls, white ceilings, no carpets or combustible finishes.', '封闭剂/环氧地坪，防尘涂料墙面，白色顶棚，不使用地毯或可燃装饰。'],
    s: [['All slabs sealed before raised floor installation; non-shedding finishes.', '架空地板安装前所有楼板均做封闭处理；不起尘饰面。']],
    tpg: [
      ['Floor finish (slab)', '地面做法', '-', 'Epoxy / dust sealer, anti-static'],
      ['Wall finish', '墙面做法', '-', 'Low-VOC dust-free paint'],
      ['Ceiling reflectance', '顶棚反射率', '%', '≥ 80'],
      ['Combustibility', '燃烧性能', '-', 'Class A (GB 8624 A)']
    ],
    std: ['ISO 14644-1', 'GB 50174', 'GB 50222'],
    t: [['Particle count after cleaning (pre-commissioning).', '清洁后粒子计数（调试前）。']] },

  { id: 'CS-06', sys: 'CS', cls: 'S', en: 'Equipment Yards, Hardstands & Fuel Bunds', zh: '室外设备场地、硬化地坪及油罐防火堤',
    fn: ['External plant areas for generators, transformers, chillers/cooling towers and fuel tanks, with access roads for maintenance and replacement.', '用于发电机、变压器、冷机/冷却塔及油罐的室外设备区，设检修及更换用道路。'],
    ty: ['Reinforced concrete hardstands, acoustic screens, bunds ≥ 110%, crane access routes.', '钢筋混凝土硬化地坪、隔声屏、防火堤≥110%、吊车通道。'],
    s: [['Separation distances between generator exhausts and air intakes (avoid recirculation); prevailing wind study.', '发电机排气口与进风口保持距离（避免回流）；进行主导风向研究。']],
    tpg: [
      ['Hardstand load capacity', '硬化地坪承载力', 'kN/m²', 'Per equipment + crane outrigger loads'],
      ['Bund capacity', '防火堤容量', '% of largest tank', '≥ 110'],
      ['Acoustic limit at boundary (night)', '边界噪声限值(夜间)', 'dB(A)', 'Per local regulation'],
      ['Access road width / turning radius', '道路宽度 / 转弯半径', 'm', '≥ 6 / ≥ 12']
    ],
    std: ['NFPA 30', 'GB 50016', 'GB 12348', 'Local environmental regulation'],
    t: [['Plate load tests; bund water-tightness test.', '平板荷载试验；防火堤闭水试验。']] },

  { id: 'CS-07', sys: 'CS', cls: 'S', en: 'Loading Dock, Freight Lift & Staging Area', zh: '装卸平台、货梯及设备预置区',
    fn: ['Safe delivery of heavy, tall IT racks (pre-integrated up to 1,800 kg) from truck to data hall; staging/burn-in before installation.', '将重型、高大的IT机柜（预集成可达1,800 kg）从货车安全运至机房；安装前在预置区开箱/老化测试。'],
    ty: ['Dock leveller 1.2 m, freight lift ≥ 3,000–5,000 kg with 2.5 × 3.5 m car, 3 m door height, ramp ≤ 1:12.', '装卸平台调节板1.2 m，货梯≥3,000–5,000 kg、轿厢2.5×3.5 m，门高3 m，坡道≤1:12。'],
    s: [['Continuous route from dock to white space with no steps, door clearances ≥ 2.7–3.0 m high.', '从装卸平台到机房的连续无台阶路线，门洞净高≥2.7–3.0 m。']],
    tpg: [
      ['Freight lift capacity', '货梯载重', 'kg', '≥ 3,000 (5,000 for AI)'],
      ['Lift car internal size', '轿厢内部尺寸', 'm', '≥ 2.5 × 3.5 × 3.0'],
      ['Dock leveller capacity', '调节板承载', 'kg', '≥ 6,000'],
      ['Route clear height', '路线净高', 'm', '≥ 2.7']
    ],
    std: ['EN 81-20', 'GB 7588', 'BICSI 002'],
    t: [['Lift load test and route trial with dummy rack.', '货梯载荷试验及模拟机柜通行测试。']] }
  );
})(typeof window !== 'undefined' ? window : globalThis);
