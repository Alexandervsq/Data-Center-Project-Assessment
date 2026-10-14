/* Mechanical & Cooling Systems — equipment, specification clauses and TPG */
(function (g) {
  var D = g.DCDB || (g.DCDB = { systems: [], equipment: [] });
  var BID = 'By Bidder / 投标人填写';
  D.equipment.push(

  /* ------------------------------------------------------------------ */
  { id: 'ME-01', sys: 'ME', cls: 'M', en: 'Water-Cooled Centrifugal Chiller (Oil-Free Magnetic Bearing)', zh: '水冷离心式冷水机组（无油磁悬浮）',
    fn: ['Produces chilled water for CRAHs/fan walls by rejecting heat to condenser water and cooling towers. Highest efficiency option for large plants in hot-humid climates.',
         '为精密空调/风墙制取冷冻水，并通过冷却水和冷却塔排热。是湿热地区大型冷站效率最高的方案。'],
    ty: ['500 – 1,500 RT (1.75 – 5.3 MW) per unit; elevated chilled water 16–20 °C supply for data centres; N+1 or 2N.',
         '单台500–1,500冷吨（1.75–5.3 MW）；数据中心采用16–20 °C高温冷冻水供水；N+1或2N。'],
    s: [
      ['Oil-free magnetic-bearing or high-efficiency centrifugal compressors with VFD; low-GWP refrigerant (R-1234ze, R-513A or R-515B).', '无油磁悬浮或高效变频离心压缩机；采用低GWP冷媒（R-1234ze、R-513A或R-515B）。'],
      ['Rapid restart: ≤ 3 min to 100% capacity after power restoration (fast-restart feature mandatory for Tier III/IV).', '快速重启：恢复供电后≤3 min达到100%冷量（Tier III/IV必须具备快速重启功能）。'],
      ['Designed for elevated CHW (e.g. 18/26 °C) to maximise efficiency and economiser hours.', '按高温冷冻水（如18/26 °C）设计，以最大化效率和自然冷却时数。'],
      ['Performance certified to AHRI 550/590 or EN 14511; witnessed factory performance test.', '性能经AHRI 550/590或EN 14511认证；见证工厂性能测试。'],
      ['BACnet/IP or Modbus TCP interface to BMS; local touchscreen controller with trend logging.', '通过BACnet/IP或Modbus TCP与BMS接口；本地触摸屏控制器带趋势记录。']
    ],
    tpg: [
      {g: ['General', '一般']},
      ['Manufacturer / model', '制造商 / 型号', '-', BID],
      ['Compressor type / quantity', '压缩机型式 / 数量', '-', 'Magnetic-bearing centrifugal / ≥ 2'],
      ['Refrigerant / GWP', '冷媒 / GWP', '- / -', 'R-1234ze / < 10 (or R-513A)'],
      ['Applicable standard', '适用标准', '-', 'AHRI 550/590 / GB/T 18430.1'],
      {g: ['Performance at design conditions', '设计工况性能']},
      ['Net cooling capacity', '净制冷量', 'kW (RT)', 'Per design, e.g. 3,500 (1,000)'],
      ['Chilled water supply / return temperature', '冷冻水供/回水温度', '°C', '18 / 26 (typ.)'],
      ['Condenser water entering / leaving temperature', '冷却水进/出水温度', '°C', '32 / 37 (tropical)'],
      ['Power input at design', '设计工况输入功率', 'kW', BID],
      ['COP at design conditions', '设计工况性能系数COP', 'kW/kW', '≥ 6.5'],
      ['IPLV / NPLV', '综合部分负荷性能系数', 'kW/kW', '≥ 10.0'],
      ['Minimum unloading (turndown)', '最小卸载率', '%', '≤ 15'],
      ['Restart time to 100% capacity', '重启至100%冷量时间', 's', '≤ 180'],
      {g: ['Hydraulics', '水力参数']},
      ['Evaporator flow / pressure drop', '蒸发器流量 / 压降', 'L/s / kPa', BID],
      ['Condenser flow / pressure drop', '冷凝器流量 / 压降', 'L/s / kPa', '≤ 80 kPa'],
      ['Fouling factor (evap / cond)', '污垢系数(蒸发器/冷凝器)', 'm²K/kW', '0.018 / 0.044'],
      ['Water-side working pressure', '水侧工作压力', 'bar', '10 (16 for high-rise)'],
      {g: ['Electrical & physical', '电气与外形']},
      ['Power supply', '电源', 'V/ph/Hz', '400/3/50'],
      ['Starting current (VFD)', '启动电流(变频)', 'A', '≤ rated FLA'],
      ['Input current THDi', '输入电流THDi', '%', '≤ 5 (with AHF/AFE)'],
      ['Sound pressure at 1 m', '1 m处声压级', 'dB(A)', '≤ 80'],
      ['Operating weight / dimensions', '运行重量 / 外形尺寸', 'kg / mm', BID]
    ],
    std: ['AHRI 550/590', 'ASHRAE 90.1', 'ASHRAE 90.4', 'EN 14511', 'GB/T 18430.1', 'GB 19577', 'ASHRAE 15'],
    t: [['Witnessed factory performance test at 100/75/50/25% load (AHRI 550/590 tolerances).', '见证工厂性能测试，负载100/75/50/25%（按AHRI 550/590允差）。'],
        ['Site: start-up, controls integration, rapid restart demonstration after power interruption.', '现场：开机、控制联调、断电后快速重启演示。']] },

  /* ------------------------------------------------------------------ */
  { id: 'ME-02', sys: 'ME', cls: 'M', en: 'Air-Cooled Chiller with Integrated Free Cooling', zh: '风冷冷水机组（带集成自然冷却）',
    fn: ['Produces chilled water rejecting heat directly to air (no cooling tower, no evaporative water). Integrated free-cooling coils use cool ambient air when available.',
         '直接向空气排热制取冷冻水（无冷却塔、无蒸发耗水）；环境温度低时由集成自然冷却盘管利用室外冷空气。'],
    ty: ['300 – 2,000 kW per unit; screw or centrifugal compressor; roof or yard mounted.', '单台300–2,000 kW；螺杆或离心压缩机；屋面或室外场地安装。'],
    s: [
      ['Variable-speed screw/centrifugal compressors, EC condenser fans, low-GWP refrigerant.', '变频螺杆/离心压缩机，EC冷凝风机，低GWP冷媒。'],
      ['Glycol free-cooling coils with automatic changeover (partial/full free cooling).', '乙二醇自然冷却盘管，自动切换（部分/完全自然冷却）。'],
      ['Rated for max. site ambient + 3 K recirculation allowance (e.g. 43 °C).', '按现场最高环境温度+3 K回流裕量（如43 °C）选型。'],
      ['Fast restart ≤ 3 min; dual power feed via ATS for Tier III.', '快速重启≤3 min；Tier III采用双路电源经ATS供电。']
    ],
    tpg: [
      ['Manufacturer / model', '制造商 / 型号', '-', BID],
      ['Net cooling capacity at design ambient', '设计环境温度净制冷量', 'kW', 'Per design'],
      ['Design ambient (dry bulb)', '设计环境干球温度', '°C', '40 – 43'],
      ['CHW supply / return', '冷冻水供/回水温度', '°C', '18 / 26'],
      ['EER at design / SEER', '设计工况EER / SEER', 'kW/kW', '≥ 3.2 / ≥ 5.0'],
      ['Free-cooling start ambient', '自然冷却起始环境温度', '°C', BID],
      ['Glycol concentration', '乙二醇浓度', '%', '25 – 35 (if freezing risk)'],
      ['Restart time to full capacity', '重启至满冷量时间', 's', '≤ 180'],
      ['Refrigerant / GWP', '冷媒 / GWP', '-', 'R-1234ze / R-513A'],
      ['Sound power level', '声功率级', 'dB(A)', BID],
      ['Footprint / operating weight', '占地 / 运行重量', 'm² / kg', BID]
    ],
    std: ['AHRI 550/590', 'EN 14511', 'EN 14825', 'GB/T 18430.1', 'GB 19577'],
    t: [['Factory performance test; site free-cooling changeover and restart tests.', '工厂性能测试；现场自然冷却切换及重启测试。']] },

  /* ------------------------------------------------------------------ */
  { id: 'ME-03', sys: 'ME', cls: 'M', en: 'Cooling Tower (Induced-Draft)', zh: '冷却塔（机械引风式）',
    fn: ['Rejects condenser heat to atmosphere by evaporation; the main consumer of water in a water-cooled plant.', '通过蒸发将冷凝热排至大气；是水冷冷站的主要耗水设备。'],
    ty: ['Modular FRP/steel cells 1,000–2,500 RT each; design wet-bulb 28 °C (tropical), approach 3–4 K.', '模块化玻璃钢/钢结构单元，每格1,000–2,500冷吨；湿热地区设计湿球28 °C，逼近度3–4 K。'],
    s: [
      ['Counter-flow or cross-flow, CTI-certified thermal performance (STD-201).', '逆流或横流式，热力性能经CTI认证（STD-201）。'],
      ['VFD/EC fans, drift eliminators ≤ 0.001% of circulating flow, PVC fill suitable for water quality.', '变频/EC风机，飘水率≤循环水量的0.001%，PVC填料适应水质。'],
      ['Basin equaliser lines, individual cell isolation for concurrent maintenance.', '设水盘平衡管，每格可单独隔离以便同时维护。'],
      ['Legionella risk management plan per ASHRAE 188 / local health rules.', '按ASHRAE 188/当地卫生规定编制军团菌风险管理计划。']
    ],
    tpg: [
      ['Manufacturer / model', '制造商 / 型号', '-', BID],
      ['Heat rejection capacity per cell', '单格排热量', 'kW', 'Per design'],
      ['Design wet-bulb temperature', '设计湿球温度', '°C', '28 (tropical) / site data'],
      ['Entering / leaving water temperature', '进/出水温度', '°C', '37 / 32'],
      ['Approach', '逼近度', 'K', '≤ 4'],
      ['Water flow per cell', '单格水量', 'm³/h', BID],
      ['Fan motor power / type', '风机功率 / 类型', 'kW', 'IE4 + VFD or EC'],
      ['Drift loss', '飘水率', '% of flow', '≤ 0.001'],
      ['Evaporation + blowdown at design', '设计工况蒸发+排污量', 'm³/h', BID],
      ['Casing / basin material', '外壳 / 水盘材料', '-', 'FRP or SS304'],
      ['Sound pressure at 1.5 m', '1.5 m处声压级', 'dB(A)', '≤ 75'],
      ['CTI certification', 'CTI认证', '-', 'Required / 需要']
    ],
    std: ['CTI STD-201', 'CTI ATC-105', 'ASHRAE 188', 'GB/T 7190.2'],
    t: [['Thermal performance acceptance test (CTI ATC-105) within 12 months.', '12个月内进行热力性能验收测试（CTI ATC-105）。']] },

  /* ------------------------------------------------------------------ */
  { id: 'ME-04', sys: 'ME', cls: 'M', en: 'Chilled & Condenser Water Pumps', zh: '冷冻水泵及冷却水泵',
    fn: ['Circulate chilled water to terminals and condenser water to cooling towers; variable primary flow is typical.', '将冷冻水循环至末端、冷却水循环至冷却塔；通常采用一次泵变流量系统。'],
    ty: ['Split-case or end-suction, 50–500 L/s, IE4/IE5 motors with VFD, N+1 per pump group.', '中开或端吸泵，50–500 L/s，IE4/IE5电机配变频，每组N+1。'],
    s: [
      ['Pump efficiency ≥ 80% at duty point, selected left of BEP.', '工作点效率≥80%，选型点位于最高效率点左侧。'],
      ['Mechanical seals, flexible connectors, suction diffusers/strainers, vibration isolation.', '机械密封、软接头、吸入扩散器/过滤器、隔振。'],
      ['Pumps on UPS (or with ride-through) for continuous cooling in high-density / Tier IV sites.', '高密度/Tier IV场地的水泵由UPS供电（或具备穿越能力），实现连续制冷。']
    ],
    tpg: [
      ['Pump type / model', '泵型式 / 型号', '-', BID],
      ['Design flow / head', '设计流量 / 扬程', 'L/s / kPa', 'Per hydraulic calc.'],
      ['Pump efficiency at duty', '工作点效率', '%', '≥ 80'],
      ['Motor rating / efficiency class', '电机功率 / 能效等级', 'kW', 'IE4 (IE5 preferred)'],
      ['NPSH required / available', '必需 / 有效汽蚀余量', 'm', BID],
      ['Speed', '转速', 'rpm', '≤ 1,500'],
      ['Casing / impeller material', '泵壳 / 叶轮材料', '-', 'Ductile iron / bronze or SS'],
      ['Seal type', '密封型式', '-', 'Mechanical'],
      ['Redundancy', '冗余', '-', 'N+1 (Tier II/III), 2N or N+2 (Tier IV)']
    ],
    std: ['ISO 9906', 'ISO 5199', 'IEC 60034-30-1', 'GB/T 3216', 'GB 19762'],
    t: [['Factory performance test ISO 9906 grade 2B; site vibration and flow verification.', '工厂按ISO 9906 2B级做性能试验；现场振动和流量验证。']] },

  /* ------------------------------------------------------------------ */
  { id: 'ME-05', sys: 'ME', cls: 'S', en: 'Plate Heat Exchanger (Water-Side Economiser)', zh: '板式换热器（水侧自然冷却）',
    fn: ['Allows cooling-tower or dry-cooler water to cool the chilled-water loop directly when ambient conditions permit (free cooling), and isolates loops.', '在室外条件允许时，用冷却塔或干冷器的水直接冷却冷冻水环路（自然冷却），并隔离不同水系统。'],
    ty: ['Gasketed SS316 plates, 1–6 MW each, approach 1–2 K.', '可拆式SS316板片，单台1–6 MW，逼近温差1–2 K。'],
    s: [['Close approach design (≤ 1.5 K) to maximise economiser hours.', '小温差设计（≤1.5 K）以最大化自然冷却时数。'],
        ['Isolation and bypass valves for cleaning without loss of cooling.', '设隔离与旁通阀，清洗时不影响制冷。']],
    tpg: [
      ['Heat duty', '换热量', 'kW', 'Per design'],
      ['Approach temperature', '逼近温差', 'K', '≤ 1.5'],
      ['Plate material / thickness', '板片材料 / 厚度', '- / mm', 'SS316 / ≥ 0.5'],
      ['Gasket material', '密封垫材料', '-', 'EPDM'],
      ['Pressure drop (hot / cold side)', '压降(热侧 / 冷侧)', 'kPa', '≤ 50'],
      ['Design pressure / test pressure', '设计压力 / 试验压力', 'bar', '10 / 15']
    ],
    std: ['AHRI 400', 'PED 2014/68/EU', 'NB/T 47004'],
    t: [['Hydrostatic test; thermal performance verification during commissioning.', '水压试验；调试期间验证换热性能。']] },

  /* ------------------------------------------------------------------ */
  { id: 'ME-06', sys: 'ME', cls: 'S', en: 'Thermal Energy Storage (Chilled-Water Buffer Tank)', zh: '蓄冷罐（冷冻水缓冲罐）',
    fn: ['Provides continuous cooling during chiller restart after a power interruption (ride-through) and stabilises the plant.', '在断电后冷机重启期间提供连续制冷（穿越），并稳定冷站运行。'],
    ty: ['Stratified steel tank sized for 10–15 min of full cooling load.', '分层式钢制蓄冷罐，按满冷负荷10–15 min设计。'],
    s: [['Stratified design with diffusers; insulation and vapour barrier; pumps for discharge on UPS.', '采用布水器的分层设计；保温及防潮层；放冷水泵由UPS供电。']],
    tpg: [
      ['Ride-through duration at full load', '满负荷穿越时间', 'min', '≥ 10 (≥ chiller restart + margin)'],
      ['Net volume', '有效容积', 'm³', 'V = Q·t / (ρ·cp·ΔT)'],
      ['Design ΔT', '设计温差', 'K', '8'],
      ['Insulation thickness / U-value', '保温厚度 / 传热系数', 'mm / W/m²K', BID],
      ['Design pressure', '设计压力', 'bar', 'Per system']
    ],
    std: ['ASHRAE Design Guide for Cool Thermal Storage', 'API 650 / EN 14015'],
    t: [['Ride-through test during IST (chiller trip with full load).', '综合测试期间穿越试验（满负荷下冷机跳闸）。']] },

  /* ------------------------------------------------------------------ */
  { id: 'ME-07', sys: 'ME', cls: 'M', en: 'Computer Room Air Handler (CRAH) — Chilled Water', zh: '冷冻水型精密空调（CRAH）',
    fn: ['Cools data-hall air using chilled-water coils and EC fans; supplies cold air to the cold aisle (raised floor or flooded room).', '利用冷冻水盘管和EC风机冷却机房空气，向冷通道送冷风（地板下送风或房间漫灌）。'],
    ty: ['100 – 250 kW sensible per unit, downflow or horizontal, EC fans, SHR = 1.0.', '单台显冷量100–250 kW，下送风或水平送风，EC风机，显热比1.0。'],
    s: [
      ['Capacity rated to ASHRAE 127 at elevated return air (e.g. 36 °C) and 18/26 °C chilled water.', '按ASHRAE 127在高回风温度（如36 °C）及18/26 °C冷冻水条件下标定冷量。'],
      ['EC plug fans with N+1 internal redundancy; pressure-independent 2-way control valve.', 'EC插板风机，内部N+1冗余；动态压差无关型两通调节阀。'],
      ['Supply-air temperature control (not return-air) and fan speed by differential pressure.', '控制送风温度（而非回风温度），风机转速按压差控制。'],
      ['Dual power supply with automatic changeover; group controls with standby rotation.', '双路电源自动切换；群控并轮换备用。']
    ],
    tpg: [
      ['Manufacturer / model', '制造商 / 型号', '-', BID],
      ['Net sensible cooling capacity', '净显冷量', 'kW', '≥ 150 (typ.)'],
      ['Return / supply air temperature', '回风 / 送风温度', '°C', '36 / 24'],
      ['Chilled water supply / return', '冷冻水供/回水温度', '°C', '18 / 26'],
      ['Airflow', '风量', 'm³/h', BID],
      ['External static pressure', '机外余压', 'Pa', '20 – 50'],
      ['Fan type / quantity / total power', '风机类型 / 数量 / 总功率', '- / no. / kW', 'EC plug / ≥ 3 / BID'],
      ['Sensible heat ratio', '显热比', '-', '1.0'],
      ['Specific fan power at design', '设计工况风机单位功耗', 'W/(m³/s)', '≤ 600'],
      ['Filter class', '过滤等级', '-', 'ISO ePM10 50% (MERV 8)'],
      ['Water-side pressure drop', '水侧压降', 'kPa', '≤ 60'],
      ['Sound pressure at 2 m', '2 m处声压级', 'dB(A)', '≤ 70'],
      ['Dimensions (W × D × H)', '外形尺寸', 'mm', BID]
    ],
    std: ['ASHRAE 127', 'EN 14511', 'GB/T 19413', 'ASHRAE TC 9.9 Thermal Guidelines'],
    t: [['Factory capacity test (sample unit); site airflow & temperature mapping with heat-load banks.', '工厂冷量测试（抽样）；现场以热负载进行风量和温度场测试。']] },

  /* ------------------------------------------------------------------ */
  { id: 'ME-08', sys: 'ME', cls: 'M', en: 'Fan Wall Unit', zh: '风墙空调（Fan Wall）',
    fn: ['Large-array of EC fans with chilled-water coils located in a perimeter gallery, supplying a flooded cold aisle on slab — common in hyperscale halls.', '位于机房侧边走廊的大型EC风机阵列与冷冻水盘管，向无地板的冷区漫灌送风——超大规模机房常用。'],
    ty: ['250 – 500 kW per unit, coil face velocity ≤ 2.5 m/s, N+1 or N+2 per hall.', '单台250–500 kW，盘管迎面风速≤2.5 m/s，每个机房N+1或N+2。'],
    s: [['Modular fan array with individual fan isolation; pressure control of cold aisle (5–15 Pa).', '模块化风机阵列，单风机可隔离；冷通道压差控制（5–15 Pa）。'],
        ['Coils selected for 26–28 °C supply-air capability for higher efficiency where IT allows.', '在IT允许时按26–28 °C送风能力选择盘管以提高效率。']],
    tpg: [
      ['Net sensible capacity', '净显冷量', 'kW', '250 – 500'],
      ['Airflow', '风量', 'm³/h', BID],
      ['Number of fans / redundancy', '风机数量 / 冗余', 'no.', 'N+1 fans within unit'],
      ['Coil face velocity', '盘管迎面风速', 'm/s', '≤ 2.5'],
      ['CHW supply / return', '冷冻水供/回水温度', '°C', '20 / 28'],
      ['Supply air temperature', '送风温度', '°C', '24 – 27'],
      ['Total fan power at design', '设计工况风机总功率', 'kW', BID]
    ],
    std: ['ASHRAE 127', 'EN 1886', 'AMCA 210'],
    t: [['Airflow test with heat-load banks and CFD validation.', '配合热负载进行风量测试并验证CFD。']] },

  /* ------------------------------------------------------------------ */
  { id: 'ME-09', sys: 'ME', cls: 'S', en: 'Precision Air Conditioner — DX (CRAC)', zh: '风冷直膨式精密空调（CRAC）',
    fn: ['Self-contained direct-expansion unit with remote air-cooled condenser; suitable for small rooms, edge sites and telecom rooms.', '带室外风冷冷凝器的直膨式一体化机组；适用于小型机房、边缘站点及通信机房。'],
    ty: ['20 – 120 kW, inverter compressor, R-410A/R-32/R-454B, optional pumped-refrigerant economiser.', '20–120 kW，变频压缩机，R-410A/R-32/R-454B，可选氟泵自然冷却。'],
    s: [['Inverter (variable-speed) compressor and EC fans; electronic expansion valve.', '变频压缩机及EC风机；电子膨胀阀。'],
        ['N+1 units per room; condensers sized for max ambient + 5 K.', '每个房间N+1台；冷凝器按最高环境温度+5 K选型。']],
    tpg: [
      ['Net sensible capacity', '净显冷量', 'kW', 'Per room load'],
      ['Return air condition', '回风工况', '°C / %RH', '35 / 25'],
      ['Design ambient for condenser', '冷凝器设计环境温度', '°C', '45'],
      ['Net sensible EER', '净显热能效比', 'kW/kW', '≥ 3.0'],
      ['Refrigerant', '冷媒', '-', 'R-410A / R-32 / R-454B'],
      ['Annual energy efficiency (AEER)', '全年能效比', 'kW/kW', BID]
    ],
    std: ['ASHRAE 127', 'EN 14511', 'GB/T 19413'],
    t: [['Factory run test; site capacity check and alarm tests.', '工厂运转测试；现场冷量核查及报警测试。']] },

  /* ------------------------------------------------------------------ */
  { id: 'ME-10', sys: 'ME', cls: 'M', en: 'In-Row Cooling Unit', zh: '列间空调',
    fn: ['Close-coupled cooler placed between racks, capturing hot-aisle air and delivering cold air directly to adjacent racks — for 15–40 kW/rack.', '安装于机柜之间的近端制冷设备，吸入热通道空气并直接向相邻机柜送冷风——适用于15–40 kW/柜。'],
    ty: ['300 or 600 mm wide, 25 – 70 kW, chilled water or DX.', '宽300或600 mm，25–70 kW，冷冻水型或直膨型。'],
    s: [['Rack-height (42–48U) footprint matched to cabinets; top/bottom piping with leak detection tray.', '高度与机柜一致（42–48U）；上/下进水并设漏水检测接水盘。'],
        ['Variable-speed EC fans controlled by rack inlet temperature sensors.', 'EC变速风机，由机柜进风温度传感器控制。']],
    tpg: [
      ['Width × depth × height', '宽 × 深 × 高', 'mm', '300/600 × 1,200 × 2,000+'],
      ['Net sensible capacity', '净显冷量', 'kW', '25 – 70'],
      ['Hot-aisle return air temperature', '热通道回风温度', '°C', '38 – 45'],
      ['CHW supply / return', '冷冻水供/回水温度', '°C', '18 / 26'],
      ['Airflow', '风量', 'm³/h', BID],
      ['Fan power at design', '设计工况风机功率', 'kW', BID]
    ],
    std: ['ASHRAE 127', 'EN 14511'],
    t: [['Site capacity test with rack heat-load banks.', '现场以机架热负载进行冷量测试。']] },

  /* ------------------------------------------------------------------ */
  { id: 'ME-11', sys: 'ME', cls: 'M', en: 'Rear Door Heat Exchanger (RDHx)', zh: '背板式热交换器（RDHx）',
    fn: ['Water coil replacing the rear door of a rack; neutralises exhaust heat at source. Passive (server fans) or active (built-in fans).', '替换机柜后门的水盘管，在热源处中和排风热量；分为被动式（依靠服务器风扇）和主动式（内置风机）。'],
    ty: ['Passive 20–35 kW, active 40–75 kW per rack; water 18–22 °C supply above dew point.', '被动式每柜20–35 kW，主动式40–75 kW；供水18–22 °C，高于露点。'],
    s: [['Supply water always above room dew point (condensation-free); dedicated CDU or secondary loop.', '供水温度始终高于室内露点（无凝露）；采用专用CDU或二次环路。'],
        ['Hinged door with quick-connect dripless couplings and integrated leak sensors.', '铰链门配无滴漏快插接头及集成漏水传感器。']],
    tpg: [
      ['Cooling capacity per door', '单门冷量', 'kW', '35 (passive) / 75 (active)'],
      ['Water supply temperature', '供水温度', '°C', '18 – 22'],
      ['Water flow per door', '单门水流量', 'L/min', BID],
      ['Air-side pressure drop (passive)', '空气侧压降(被动式)', 'Pa', '≤ 25'],
      ['Working pressure', '工作压力', 'bar', '≤ 6 (secondary loop)'],
      ['Leak detection', '漏水检测', '-', 'Integrated'],
      ['Weight with water', '含水重量', 'kg', BID]
    ],
    std: ['ASHRAE TC 9.9 Liquid Cooling Guidelines', 'EN 14511'],
    t: [['Pressure test, flow balancing and heat-load verification.', '压力试验、流量平衡及热负载验证。']] },

  /* ------------------------------------------------------------------ */
  { id: 'ME-12', sys: 'ME', cls: 'M', en: 'Coolant Distribution Unit (CDU) — Direct Liquid Cooling', zh: '冷量分配单元（CDU）——冷板式液冷',
    fn: ['Separates the facility water loop (FWS) from the technology cooling system (TCS) feeding cold plates on CPUs/GPUs; controls flow, temperature, pressure and filtration.', '将设施水环路（FWS）与为CPU/GPU冷板供液的技术冷却系统（TCS）隔离，控制流量、温度、压力并过滤。'],
    ty: ['In-row 300 kW – 2.5 MW, or in-rack 80–150 kW; TCS supply 25–45 °C (ASHRAE W27–W45); N+1 pumps.', '列间式300 kW–2.5 MW或机架式80–150 kW；TCS供液25–45 °C（ASHRAE W27–W45）；水泵N+1。'],
    s: [
      ['Liquid-to-liquid heat exchanger with approach ≤ 3–5 K; redundant variable-speed pumps (N+1) and redundant power supplies (A/B).', '液-液换热器逼近温差≤3–5 K；冗余变频水泵（N+1）及冗余电源（A/B）。'],
      ['Filtration ≤ 25–50 µm on TCS; coolant quality monitoring (conductivity, pH, particulates).', 'TCS侧过滤≤25–50 µm；冷却液品质监测（电导率、pH、颗粒）。'],
      ['Wetted-materials compatibility list (copper, stainless, EPDM) with coolant (PG25 or treated water).', '提交与冷却液（PG25或处理水）接触材料（铜、不锈钢、EPDM）兼容清单。'],
      ['Leak detection at CDU, manifolds and racks with automatic isolation valves.', 'CDU、分液器及机柜设漏液检测并联动自动隔离阀。'],
      ['Controls integrated to BMS/DCIM (Redfish/Modbus), pressure differential control to rack manifolds.', '控制系统接入BMS/DCIM（Redfish/Modbus），对机柜分液器进行压差控制。']
    ],
    tpg: [
      ['Manufacturer / model', '制造商 / 型号', '-', BID],
      ['Rated heat transfer capacity', '额定换热量', 'kW', '1,000 – 2,000 (row type)'],
      ['Approach temperature (FWS supply → TCS supply)', '逼近温差(FWS供液→TCS供液)', 'K', '≤ 4'],
      ['TCS supply temperature range', 'TCS供液温度范围', '°C', '25 – 45'],
      ['TCS flow rate / available pressure', 'TCS流量 / 可用压头', 'L/min / kPa', 'Per IT vendor (≈1.5 L/min/kW)'],
      ['Pump configuration', '水泵配置', '-', 'N+1 variable speed, hot-swappable'],
      ['Filtration rating', '过滤精度', 'µm', '≤ 25'],
      ['Coolant type', '冷却液类型', '-', 'PG25 or treated DI water'],
      ['Power supply / consumption', '电源 / 功耗', 'V / kW', 'Dual A/B, 400 V / BID'],
      ['Leak detection & auto-isolation', '漏液检测及自动隔离', '-', 'Required / 需要'],
      ['Footprint (W × D × H)', '外形尺寸', 'mm', BID],
      ['Communication', '通讯', '-', 'Modbus TCP, SNMP, Redfish']
    ],
    std: ['ASHRAE TC 9.9 Liquid Cooling Guidelines', 'OCP Advanced Cooling Solutions', 'ASME B31.9', 'UL 62368-1'],
    t: [['Factory flow/heat test; site pressure test, flushing & coolant quality certificate before IT connection.', '工厂流量/换热测试；接入IT前完成现场压力试验、冲洗并出具冷却液品质证书。']] },

  /* ------------------------------------------------------------------ */
  { id: 'ME-13', sys: 'ME', cls: 'S', en: 'Immersion Cooling Tank System', zh: '浸没式液冷系统',
    fn: ['Servers are submerged in dielectric fluid; heat is removed by fluid circulation through a CDU — enables > 100 kW per tank with very low PUE.', '服务器浸没于绝缘冷却液中，通过CDU循环带走热量——单槽可超过100 kW且PUE极低。'],
    ty: ['Single-phase hydrocarbon/synthetic fluid tanks 50 – 200 kW; two-phase systems for niche HPC.', '单相烃类/合成冷却液槽，50–200 kW；两相系统用于特定HPC场景。'],
    s: [['Fluid with flash point > 150 °C, dielectric strength > 30 kV, compatibility with server components (vendor-approved).', '冷却液闪点>150 °C，介电强度>30 kV，与服务器部件兼容（厂商认可）。'],
        ['Floor loading and fluid containment (bunding) designed for full fluid volume.', '楼面荷载及冷却液围堰按全部液量设计。']],
    tpg: [
      ['Heat removal capacity per tank', '单槽散热能力', 'kW', '≥ 100'],
      ['Fluid type / volume per tank', '冷却液类型 / 单槽液量', '- / L', BID],
      ['Fluid dielectric strength', '冷却液介电强度', 'kV', '> 30'],
      ['Fluid flash point', '冷却液闪点', '°C', '> 150'],
      ['Facility water supply temperature', '设施侧供水温度', '°C', '30 – 40'],
      ['Tank weight (filled) / floor load', '满载重量 / 楼面荷载', 'kg / kN/m²', BID]
    ],
    std: ['OCP Immersion Requirements', 'ASHRAE TC 9.9', 'IEC 60296 (fluids reference)'],
    t: [['Fluid sampling and IT burn-in under full load.', '冷却液取样及满载IT老化测试。']] },

  /* ------------------------------------------------------------------ */
  { id: 'ME-14', sys: 'ME', cls: 'S', en: 'Indirect Evaporative Cooler (IEC)', zh: '间接蒸发冷却机组（IEC）',
    fn: ['Cools data-hall air via an air-to-air heat exchanger wetted on the outdoor side; no mixing of outside air. Very efficient in dry/temperate climates.', '通过室外侧喷淋的空-空换热器冷却机房空气，室内外空气不混合；在干燥/温和气候中效率极高。'],
    ty: ['250 – 500 kW modules with DX trim; best where design wet-bulb ≤ 24 °C.', '250–500 kW模块，带直膨补冷；设计湿球温度≤24 °C时效果最佳。'],
    s: [['Polymer or coated aluminium heat exchanger; integral DX/CHW trim for peak conditions.', '高分子或涂层铝换热芯体；配直膨/冷冻水补冷应对峰值工况。'],
        ['Water treatment and scale control; water storage for ≥ 24–48 h of evaporative operation.', '水处理及防垢；储水满足≥24–48 h蒸发运行。']],
    tpg: [
      ['Net sensible capacity', '净显冷量', 'kW', '250 – 500'],
      ['Wet-bulb effectiveness', '湿球效率', '%', '≥ 70'],
      ['Trim cooling type / capacity', '补冷方式 / 冷量', '- / kW', BID],
      ['Annual pPUE (site climate)', '全年局部PUE(当地气候)', '-', BID],
      ['Peak water consumption', '峰值耗水量', 'L/h', BID]
    ],
    std: ['ASHRAE 143', 'EN 14511', 'GB/T 30192'],
    t: [['Factory performance test; seasonal performance verification.', '工厂性能测试；季节性能验证。']] },

  /* ------------------------------------------------------------------ */
  { id: 'ME-15', sys: 'ME', cls: 'S', en: 'Adiabatic Dry Cooler', zh: '绝热型干冷器',
    fn: ['Rejects heat from warm-water liquid-cooling loops (30–45 °C) to air with minimal water use (adiabatic pre-cooling only at peak).', '将温水液冷环路（30–45 °C）的热量排至空气，耗水极少（仅峰值时绝热预冷）。'],
    ty: ['500 – 2,000 kW per unit, EC fans, V-coil.', '单台500–2,000 kW，EC风机，V型盘管。'],
    s: [['Adiabatic pads/sprays used only above set ambient; otherwise dry operation.', '仅在环境温度高于设定值时使用湿帘/喷淋；其余时间干式运行。']],
    tpg: [
      ['Heat rejection capacity', '排热量', 'kW', 'Per design'],
      ['Fluid inlet / outlet', '流体进/出口温度', '°C', '45 / 35'],
      ['Design ambient (dry / adiabatic)', '设计环境温度(干式/绝热)', '°C', BID],
      ['Annual water use', '年耗水量', 'm³', BID],
      ['Fan power', '风机功率', 'kW', BID]
    ],
    std: ['EN 1048', 'Eurovent certification'],
    t: [['Site performance check at peak ambient.', '峰值环境温度下现场性能核查。']] },

  /* ------------------------------------------------------------------ */
  { id: 'ME-16', sys: 'ME', cls: 'S', en: 'Chilled Water Piping, Valves & Insulation', zh: '冷冻水管道、阀门及保温',
    fn: ['Distributes chilled/condenser water; ring-main or dual-path headers provide concurrent maintainability.', '输配冷冻水/冷却水；环网或双路总管实现可同时维护。'],
    ty: ['Carbon steel (welded) DN50–DN900, butterfly isolation valves, PICVs at terminals, closed-cell insulation.', '碳钢焊接管DN50–DN900，蝶阀隔离，末端动态平衡电动调节阀，闭孔保温。'],
    s: [['Valving arranged so that any segment can be isolated without loss of cooling (Tier III).', '阀门布置应使任一管段可隔离而不影响制冷（Tier III）。'],
        ['No water piping over IT racks; drip trays and leak detection where crossing white space.', 'IT机柜上方不得敷设水管；穿越机房处设接水盘和漏水检测。']],
    tpg: [
      ['Pipe material / standard', '管材 / 标准', '-', 'ASTM A53 / GB/T 8163'],
      ['Design / test pressure', '设计 / 试验压力', 'bar', '10 / 15'],
      ['Insulation type / thickness', '保温材料 / 厚度', '- / mm', 'Closed-cell elastomeric / per condensation calc.'],
      ['Isolation valve type', '隔离阀类型', '-', 'Lug-type butterfly, gear operated'],
      ['Seismic bracing', '抗震支吊架', '-', 'Per local code']
    ],
    std: ['ASME B31.9', 'GB 50243', 'GB 50981'],
    t: [['Hydrostatic test 1.5× design pressure; flushing & cleaning certificate.', '1.5倍设计压力水压试验；冲洗清洁证明。']] },

  /* ------------------------------------------------------------------ */
  { id: 'ME-17', sys: 'ME', cls: 'S', en: 'Water Treatment System', zh: '水处理系统',
    fn: ['Controls corrosion, scaling and biological growth in condenser and chilled water systems; manages cycles of concentration to save water.', '控制冷却水与冷冻水系统的腐蚀、结垢和微生物滋生；控制浓缩倍数以节水。'],
    ty: ['Automatic chemical dosing, side-stream filtration, conductivity-controlled blowdown.', '自动加药、旁流过滤、电导率控制排污。'],
    s: [['Target cycles of concentration 4–6 to reduce make-up water.', '浓缩倍数目标4–6，以减少补水量。'], ['Legionella monitoring & biocide programme.', '军团菌监测及杀菌方案。']],
    tpg: [
      ['Cycles of concentration', '浓缩倍数', '-', '4 – 6'],
      ['Side-stream filtration rate', '旁流过滤量', '% of flow', '≥ 5'],
      ['Corrosion rate (mild steel)', '腐蚀速率(碳钢)', 'mm/a', '≤ 0.075'],
      ['Monitoring', '监测', '-', 'Online conductivity, pH, ORP']
    ],
    std: ['ASHRAE 188', 'GB/T 50050'],
    t: [['Water analysis report at handover and monthly.', '移交时及每月出具水质分析报告。']] },

  /* ------------------------------------------------------------------ */
  { id: 'ME-18', sys: 'ME', cls: 'S', en: 'Ventilation, Pressurisation & Battery-Room Exhaust', zh: '通风、正压送风及电池室排风',
    fn: ['Supplies filtered fresh air to keep white space at positive pressure, ventilates UPS/battery and generator rooms, and handles smoke/gas extraction after suppression.', '向机房送入过滤新风保持正压，为UPS/电池室和发电机房通风，并在灭火后排除烟气/灭火气体。'],
    ty: ['Fresh-air AHU with F7/F9 filters, dehumidification; +5 to +15 Pa room pressure.', '新风机组配F7/F9过滤及除湿；房间正压+5~+15 Pa。'],
    s: [['Data-hall cleanliness ISO 14644-1 Class 8; gaseous contamination ≤ G1 severity (ISA-71.04).', '机房洁净度ISO 14644-1 8级；气态污染≤G1级（ISA-71.04）。'],
        ['Post-discharge extract system for clean-agent zones with motorised dampers.', '气体灭火区设灭火后排风系统及电动风阀。']],
    tpg: [
      ['Room pressure (white space)', '机房正压', 'Pa', '+5 to +15'],
      ['Fresh air filtration', '新风过滤', '-', 'ISO ePM1 ≥ 70% (F7) + ePM1 ≥ 80% (F9)'],
      ['Supply air dew point control', '送风露点控制', '°C', '−9 to 15 (ASHRAE)'],
      ['Battery room air changes', '电池室换气次数', 'ACH', 'Per IEC 62485 / NFPA 855'],
      ['Gas extract air changes', '气体灭火后排风换气次数', 'ACH', '≥ 5']
    ],
    std: ['ISO 14644-1', 'ANSI/ISA-71.04', 'EN 16798-3', 'GB 50019'],
    t: [['Room pressure and particle count measurement.', '房间压差及粒子计数测量。']] },

  /* ------------------------------------------------------------------ */
  { id: 'ME-19', sys: 'ME', cls: 'S', en: 'Make-up Water Storage & Plumbing', zh: '补水储存及给排水',
    fn: ['Stores make-up water for cooling towers/evaporative systems to survive municipal supply interruptions; domestic water and drainage.', '储存冷却塔/蒸发系统补水，以应对市政供水中断；生活给水及排水。'],
    ty: ['Two-compartment tanks for 24–72 h of make-up; duplex booster pumps.', '双格水箱满足24–72 h补水；双联加压泵。'],
    s: [['Storage volume = peak make-up rate × autonomy hours (match fuel autonomy for Tier III/IV).', '储水容积 = 峰值补水量 × 自持时间（Tier III/IV应与燃油自持时间匹配）。'],
        ['Two independent water sources where available (municipal + well/recycled).', '尽可能设两路独立水源（市政+井水/再生水）。']],
    tpg: [
      ['Make-up water autonomy', '补水自持时间', 'h', '≥ 12 (match fuel autonomy)'],
      ['Tank material', '水箱材料', '-', 'SS304 / FRP / concrete'],
      ['Booster pumps redundancy', '加压泵冗余', '-', 'N+1'],
      ['Water metering', '水计量', '-', 'Sub-metering for WUE']
    ],
    std: ['GB 50015', 'IPC (International Plumbing Code)'],
    t: [['Tank leak test, pump changeover test.', '水箱渗漏试验、泵切换试验。']] },

  /* ------------------------------------------------------------------ */
  { id: 'ME-20', sys: 'ME', cls: 'S', en: 'Variable Frequency Drives (VFD)', zh: '变频器（VFD）',
    fn: ['Control speed of pumps, fans and cooling-tower fans to match load and save energy.', '控制水泵、风机及冷却塔风机转速以匹配负荷并节能。'],
    ty: ['0.75 – 500 kW, IP54 or panel-mounted, with bypass for critical pumps.', '0.75–500 kW，IP54或柜装，关键水泵配旁路。'],
    s: [['Low-harmonic (AFE or 12-pulse/filters) THDi ≤ 5%; EMC category C2.', '低谐波（AFE或12脉波/滤波器）THDi≤5%；EMC等级C2。'], ['Ride-through and auto-restart after power dip.', '具备电压暂降穿越及自动重启功能。']],
    tpg: [
      ['Efficiency at rated load', '额定负载效率', '%', '≥ 97'],
      ['Input THDi', '输入电流THDi', '%', '≤ 5'],
      ['EMC category', 'EMC类别', '-', 'C2 (IEC 61800-3)'],
      ['Communication', '通讯', '-', 'BACnet / Modbus'],
      ['Enclosure', '防护等级', 'IP', 'IP54 / IP21 in panel']
    ],
    std: ['IEC 61800-2', 'IEC 61800-3', 'IEC 61800-9-2'],
    t: [['Functional test and harmonic measurement.', '功能测试及谐波测量。']] }
  );
})(typeof window !== 'undefined' ? window : globalThis);
