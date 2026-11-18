/* Data Center Project Assessment — core knowledge base
 * Tiers, facility types, size classes, spaces, standards, glossary,
 * project lifecycle, commissioning levels and regional benchmarks.
 * Benchmarks are indicative planning values (2025–2026) and must be
 * calibrated by a quantity surveyor / local consultant for each project. */
(function (g) {
  var D = g.DCDB || (g.DCDB = { systems: [], equipment: [] });

  /* ------------------------------------------------------------ tiers */
  D.tiers = [
    { n: 1, en: 'Tier I — Basic Capacity', zh: 'Tier I——基本容量', red: 'N', paths: '1', cm: false, ft: false,
      avail: 99.671, down: [28.8, 'h'], tia: 'Rated-1', en50600: 'Class 1', gb: 'C 级', sni: 'Strata I', bicsi: 'Class F1',
      d: ['Single path, no redundant components. Any maintenance or failure causes an outage.', '单一路径，无冗余组件。任何维护或故障都会导致停机。'],
      fit: ['Small enterprise server rooms, non-critical workloads, test/dev.', '小型企业机房、非关键业务、测试/开发。'] },
    { n: 2, en: 'Tier II — Redundant Capacity Components', zh: 'Tier II——冗余容量组件', red: 'N+1', paths: '1', cm: false, ft: false,
      avail: 99.741, down: [22.7, 'h'], tia: 'Rated-2', en50600: 'Class 2', gb: 'B 级 (partial)', sni: 'Strata II', bicsi: 'Class F2',
      d: ['Redundant UPS, generators and chillers (N+1) on a single distribution path; path maintenance still needs shutdown.', 'UPS、发电机、冷机冗余（N+1），但为单一配电路径；路径维护仍需停机。'],
      fit: ['Enterprise data centres, regional branch sites, edge hubs.', '企业数据中心、区域分支站点、边缘枢纽。'] },
    { n: 3, en: 'Tier III — Concurrently Maintainable', zh: 'Tier III——可同时维护', red: 'N+1', paths: '1 active + 1 alternate', cm: true, ft: false,
      avail: 99.982, down: [1.6, 'h'], tia: 'Rated-3', en50600: 'Class 3', gb: 'B 级 / A 级 (partial)', sni: 'Strata III', bicsi: 'Class F3',
      d: ['Every component and distribution path can be removed for planned maintenance without impacting IT. Dual-corded IT; ≥ 12 h on-site fuel.', '任一组件和配电路径均可在计划维护时退出而不影响IT。IT双电源；现场燃油≥12 h。'],
      fit: ['Colocation, cloud regions, banks, government — the industry mainstream.', '托管、云区域、银行、政府——行业主流。'] },
    { n: 4, en: 'Tier IV — Fault Tolerant', zh: 'Tier IV——容错', red: '2N / 2(N+1)', paths: '2 active', cm: true, ft: true,
      avail: 99.995, down: [26.3, 'min'], tia: 'Rated-4', en50600: 'Class 4', gb: 'A 级', sni: 'Strata IV', bicsi: 'Class F4',
      d: ['Any single unplanned failure is tolerated automatically. Two simultaneously active paths, compartmentalisation and continuous cooling.', '可自动承受任何单一非计划故障。两条同时运行的路径、物理分区隔离及连续制冷。'],
      fit: ['Stock exchanges, national data centres, critical financial & defence systems.', '证券交易所、国家数据中心、关键金融与国防系统。'] }
  ];

  /* ------------------------------------------------- facility types */
  D.dcTypes = [
    { id: 'ENT', en: 'Enterprise (Owner-operated)', zh: '企业自建（自用）', rev: 'none',
      d: ['Built and operated by one organisation for its own IT.', '由单一机构为自身IT建设并运营。'], mw: [0.2, 10], dens: [5, 12] },
    { id: 'COLO', en: 'Retail Colocation', zh: '零售型托管', rev: 'lease',
      d: ['Operator leases racks, cages and suites to many tenants; carrier-neutral interconnection is a key value.', '运营商向众多租户出租机柜、笼位和包间；运营商中立的互联是核心价值。'], mw: [2, 30], dens: [6, 15] },
    { id: 'WHOLE', en: 'Wholesale / Build-to-Suit', zh: '批发型 / 定制建设', rev: 'lease',
      d: ['Whole data halls or buildings leased to a single large tenant (often a cloud provider) on long terms.', '整个机房或整栋楼长期租给单一大租户（通常为云服务商）。'], mw: [10, 100], dens: [10, 25] },
    { id: 'HYPER', en: 'Hyperscale / Cloud', zh: '超大规模 / 云', rev: 'lease',
      d: ['Campus-scale facilities owned or leased by cloud and internet giants, highly standardised and efficient.', '云与互联网巨头自有或租赁的园区级设施，高度标准化、高能效。'], mw: [30, 500], dens: [12, 30] },
    { id: 'AI', en: 'AI Factory / HPC', zh: 'AI算力中心 / 高性能计算', rev: 'lease',
      d: ['GPU clusters for AI training and inference; 40–140 kW per rack, liquid cooling, very large single-site power.', '用于AI训练和推理的GPU集群；单柜40–140 kW，液冷，单站点用电极大。'], mw: [5, 1000], dens: [40, 140] },
    { id: 'EDGE', en: 'Edge / Micro Data Center', zh: '边缘 / 微型数据中心', rev: 'lease',
      d: ['Sites close to users or devices for low latency (5G, CDN, IoT, AI inference) — from micro sites to regional edge campuses; often prefabricated.', '靠近用户或设备以降低时延的站点（5G、CDN、物联网、AI推理）——从微型站点到区域边缘园区；常为预制式。'], mw: [0.05, 30], dens: [5, 20] },
    { id: 'GOV', en: 'Government / Sovereign', zh: '政府 / 主权数据中心', rev: 'none',
      d: ['National or regional government facilities with data-sovereignty and high-security requirements.', '具有数据主权及高安全要求的国家或地方政府设施。'], mw: [1, 50], dens: [6, 20] },
    { id: 'MOD', en: 'Modular / Prefabricated', zh: '模块化 / 预制式', rev: 'none',
      d: ['Factory-built power, cooling and IT modules assembled on site — faster delivery and phased growth.', '在工厂预制电力、制冷与IT模块并在现场拼装——交付更快、可分期扩展。'], mw: [0.2, 20], dens: [8, 40] }
  ];

  /* ---------------------------------------------------- size classes */
  D.sizeClasses = [
    { id: 'MICRO', max: 0.5, en: 'Micro / Edge', zh: '微型 / 边缘', racks: '≤ 100' },
    { id: 'SMALL', max: 2, en: 'Small', zh: '小型', racks: '100 – 400' },
    { id: 'MEDIUM', max: 10, en: 'Medium', zh: '中型', racks: '400 – 1,500' },
    { id: 'LARGE', max: 30, en: 'Large', zh: '大型', racks: '1,500 – 4,000' },
    { id: 'HYPER', max: 100, en: 'Hyperscale building', zh: '超大规模单体', racks: '4,000 – 10,000' },
    { id: 'CAMPUS', max: 1e9, en: 'Hyperscale / AI campus', zh: '超大规模 / AI园区', racks: '> 10,000' }
  ];

  /* ---------------------------------------------------------- spaces */
  D.spaces = [
    { id: 'WS', en: 'White Space', zh: '白区（IT空间）', color: '#4F46E5',
      d: ['Where IT equipment lives. Clean, secure, precisely cooled.', 'IT设备所在区域。洁净、安全、精密制冷。'],
      items: [['Data hall / computer room', '数据机房 / 主机房'], ['Entrance room / Meet-Me Room (MMR)', '进线间 / 运营商交汇间'], ['Main Distribution Area (MDA)', '主配线区（MDA）'], ['Horizontal / Zone Distribution Area (HDA/ZDA)', '水平 / 区域配线区（HDA/ZDA）'], ['Equipment Distribution Area (EDA) — rack rows', '设备配线区（EDA）——机柜列'], ['Customer cages & suites', '客户笼位及包间'], ['Tape / storage room', '磁带 / 存储间']] },
    { id: 'GS', en: 'Grey Space', zh: '灰区（基础设施空间）', color: '#E8505B',
      d: ['Plant rooms housing power and cooling infrastructure that support the white space.', '容纳支持白区的电力与制冷基础设施的设备间。'],
      items: [['MV switchgear room / utility intake', '中压开关室 / 市电进线'], ['Transformer room / yard', '变压器室 / 变压器场'], ['LV switchboard room', '低压配电室'], ['UPS room', 'UPS室'], ['Battery room', '电池室'], ['Generator hall / yard & fuel farm', '发电机房 / 发电机场地及油库'], ['Chiller plant & pump room', '冷站及水泵房'], ['Cooling tower / heat-rejection yard', '冷却塔 / 散热设备场'], ['Gas suppression cylinder room', '气体灭火钢瓶间'], ['Fire pump room & water tanks', '消防泵房及水池']] },
    { id: 'SP', en: 'Support Space', zh: '支持区（辅助空间）', color: '#0891B2',
      d: ['Spaces for people, logistics and operations.', '供人员、物流及运营使用的空间。'],
      items: [['Network/Security Operations Center (NOC/SOC)', '网络/安全运营中心（NOC/SOC）'], ['Loading dock & freight lift', '装卸平台及货梯'], ['Staging, build & burn-in room', '设备预置、组装及老化测试间'], ['Storage & spare parts', '库房及备品备件'], ['Security control & mantrap lobby', '安保控制室及防尾随门厅'], ['Offices, customer lounge, meeting rooms', '办公室、客户休息区、会议室'], ['Workshop, break room & amenities', '维修间、休息室及配套设施']] },
    { id: 'SITE', en: 'Site & External Works', zh: '场地及室外工程', color: '#B45309',
      d: ['Everything outside the building envelope.', '建筑围护结构之外的一切。'],
      items: [['Perimeter fence, gatehouse & vehicle barriers', '周界围栏、门卫室及车辆拦阻'], ['Utility substation (HV/MV)', '变电站（高压/中压）'], ['Diverse fibre duct banks & manholes', '分离光缆管群及人孔'], ['Water storage & treatment', '储水及水处理'], ['Roads, parking & landscaping', '道路、停车及景观'], ['Future expansion land', '未来扩建用地']] }
  ];

  /* ------------------------------------------------------- standards */
  D.standards = [
    /* International */
    { c: 'Uptime Institute Tier Standard: Topology', r: 'INT', a: 'DESIGN', en: 'Tier I–IV performance-based topology criteria; design & constructed-facility certification.', zh: 'Tier I–IV基于性能的拓扑准则；设计及建成设施认证。' },
    { c: 'Uptime Institute Tier Standard: Operational Sustainability', r: 'INT', a: 'OPS', en: 'Staffing, maintenance and management behaviours that sustain the Tier over time.', zh: '保障Tier等级长期有效的人员配置、维护与管理要求。' },
    { c: 'ANSI/TIA-942-C (2024)', r: 'INT', a: 'DESIGN', en: 'Telecommunications Infrastructure Standard for Data Centers — Rated-1 to Rated-4 across telecom, architectural, electrical and mechanical.', zh: '数据中心电信基础设施标准——在通信、建筑、电气、机械方面分Rated-1至Rated-4。' },
    { c: 'ISO/IEC 22237 series (≈ EN 50600)', r: 'INT', a: 'DESIGN', en: 'Data centre facilities and infrastructures — availability classes, protection classes, energy efficiency enablement.', zh: '数据中心设施与基础设施——可用性等级、防护等级、能效保障。' },
    { c: 'ANSI/BICSI 002', r: 'INT', a: 'DESIGN', en: 'Data Center Design and Implementation Best Practices — Class F0–F4.', zh: '数据中心设计与实施最佳实践——F0–F4级。' },
    { c: 'ASHRAE TC 9.9 Thermal Guidelines (5th ed.)', r: 'INT', a: 'MECH', en: 'Recommended inlet 18–27 °C; allowable classes A1–A4 and H1 (high density); liquid-cooling classes W17–W45+.', zh: '推荐进风18–27 °C；允许等级A1–A4及H1（高密度）；液冷等级W17–W45+。' },
    { c: 'ASHRAE 90.4', r: 'INT', a: 'MECH', en: 'Energy Standard for Data Centers (mechanical & electrical loss components).', zh: '数据中心能效标准（机械及电气损耗指标）。' },
    { c: 'ISO/IEC 30134 series', r: 'INT', a: 'ENERGY', en: 'Data centre KPIs: PUE (-2), REF (-3), ITEEsv, WUE (-9), CUE (-8).', zh: '数据中心关键性能指标：PUE（-2）、REF（-3）、WUE（-9）、CUE（-8）等。' },
    { c: 'IEC 62040 series', r: 'INT', a: 'ELEC', en: 'Uninterruptible power systems — safety, EMC, performance classification.', zh: '不间断电源系统——安全、EMC、性能分类。' },
    { c: 'IEC 62271 series', r: 'INT', a: 'ELEC', en: 'High-voltage switchgear and controlgear.', zh: '高压开关设备和控制设备。' },
    { c: 'IEC 61439 series', r: 'INT', a: 'ELEC', en: 'Low-voltage switchgear and controlgear assemblies (incl. busbar trunking -6).', zh: '低压成套开关设备和控制设备（含-6母线干线系统）。' },
    { c: 'IEC 60076 series', r: 'INT', a: 'ELEC', en: 'Power transformers (incl. -11 dry-type).', zh: '电力变压器（含-11干式变压器）。' },
    { c: 'ISO 8528 series', r: 'INT', a: 'ELEC', en: 'Reciprocating engine-driven generating sets — ratings & performance classes.', zh: '往复式内燃机驱动的发电机组——功率定额及性能等级。' },
    { c: 'IEC 62305 series', r: 'INT', a: 'ELEC', en: 'Protection against lightning.', zh: '雷电防护。' },
    { c: 'IEC 60364 series', r: 'INT', a: 'ELEC', en: 'Low-voltage electrical installations.', zh: '低压电气装置。' },
    { c: 'ISO 14520 / EN 15004', r: 'INT', a: 'FIRE', en: 'Gaseous fire-extinguishing systems.', zh: '气体灭火系统。' },
    { c: 'ISO/IEC 27001', r: 'INT', a: 'OPS', en: 'Information security management (physical & environmental controls).', zh: '信息安全管理体系（含物理与环境控制）。' },
    { c: 'ISO 50001 / ISO 14001', r: 'INT', a: 'ENERGY', en: 'Energy and environmental management systems.', zh: '能源及环境管理体系。' },
    { c: 'ISO 22301', r: 'INT', a: 'OPS', en: 'Business continuity management.', zh: '业务连续性管理。' },
    /* United States / NFPA */
    { c: 'NFPA 75', r: 'US', a: 'FIRE', en: 'Fire Protection of Information Technology Equipment.', zh: '信息技术设备防火。' },
    { c: 'NFPA 76', r: 'US', a: 'FIRE', en: 'Fire Protection of Telecommunications Facilities.', zh: '电信设施防火。' },
    { c: 'NFPA 2001', r: 'US', a: 'FIRE', en: 'Clean Agent Fire Extinguishing Systems.', zh: '洁净气体灭火系统。' },
    { c: 'NFPA 72 / 13 / 20', r: 'US', a: 'FIRE', en: 'Fire alarm, sprinkler and fire pump standards.', zh: '火灾报警、自动喷水及消防泵标准。' },
    { c: 'NFPA 855', r: 'US', a: 'FIRE', en: 'Installation of Stationary Energy Storage Systems (Li-ion batteries).', zh: '固定式储能系统安装（锂电池）。' },
    { c: 'NFPA 70 (NEC) Art. 645 / NFPA 110', r: 'US', a: 'ELEC', en: 'IT equipment rooms; emergency and standby power systems.', zh: '信息技术设备间；应急及备用电源系统。' },
    { c: 'UL 9540A', r: 'US', a: 'FIRE', en: 'Test method for thermal runaway fire propagation in battery energy storage.', zh: '电池储能热失控火灾蔓延测试方法。' },
    /* Europe */
    { c: 'EN 50600 series', r: 'EU', a: 'DESIGN', en: 'European data centre facilities & infrastructure standard (Availability Class 1–4).', zh: '欧洲数据中心设施与基础设施标准（可用性等级1–4）。' },
    { c: 'EU Energy Efficiency Directive (2023/1791) & Delegated Reg. 2024/1364', r: 'EU', a: 'ENERGY', en: 'Mandatory annual KPI reporting (PUE, WUE, REF, etc.) for data centres ≥ 500 kW IT.', zh: 'IT功率≥500 kW的数据中心须年度报告PUE、WUE、REF等指标。' },
    { c: 'EU Code of Conduct for Data Centre Energy Efficiency', r: 'EU', a: 'ENERGY', en: 'Voluntary best-practice framework for energy efficiency.', zh: '自愿性能效最佳实践框架。' },
    /* China */
    { c: 'GB 50174-2017', r: 'CN', a: 'DESIGN', en: 'Code for design of data centers — Class A / B / C.', zh: '《数据中心设计规范》——A/B/C级。' },
    { c: 'GB 50462', r: 'CN', a: 'DESIGN', en: 'Code for construction and acceptance of data center infrastructure (check latest edition).', zh: '《数据中心基础设施施工及验收规范》（请核对最新版本）。' },
    { c: 'GB 40879-2021', r: 'CN', a: 'ENERGY', en: 'Energy-efficiency limits & grades for data centres — PUE grade 1 ≤ 1.20, grade 2 ≤ 1.30, grade 3 ≤ 1.50.', zh: '《数据中心能效限定值及能效等级》——1级≤1.20、2级≤1.30、3级≤1.50。' },
    { c: 'GB 50370', r: 'CN', a: 'FIRE', en: 'Code for design of gas fire extinguishing systems.', zh: '《气体灭火系统设计规范》。' },
    { c: 'GB 50116 / GB 50016', r: 'CN', a: 'FIRE', en: 'Fire alarm system design; fire protection of buildings.', zh: '《火灾自动报警系统设计规范》；《建筑设计防火规范》。' },
    { c: 'GB 50052 / GB 50054 / GB 50057', r: 'CN', a: 'ELEC', en: 'Power supply system design; LV distribution; lightning protection of buildings.', zh: '《供配电系统设计规范》；《低压配电设计规范》；《建筑物防雷设计规范》。' },
    { c: 'GB 50311 / GB/T 50312', r: 'CN', a: 'IT', en: 'Generic cabling system design and acceptance.', zh: '《综合布线系统工程设计规范》及验收规范。' },
    { c: 'East-Data-West-Computing (东数西算) policy', r: 'CN', a: 'POLICY', en: '8 national computing hubs & 10 clusters; new hub DCs target high green-power share and low PUE.', zh: '8大国家算力枢纽、10大数据中心集群；新建枢纽数据中心要求高绿电占比、低PUE。' },
    /* Indonesia */
    { c: 'SNI 8799 (2019, rev. 2023)', r: 'ID', a: 'DESIGN', en: 'Indonesian national data-centre standard — Part 1 technical spec., Part 2 management system, Part 3 audit; Strata I–IV.', zh: '印尼国家数据中心标准——第1部分技术规范、第2部分管理体系、第3部分审核；Strata I–IV。' },
    { c: 'PP 71/2019 & UU 27/2022 (PDP)', r: 'ID', a: 'POLICY', en: 'Electronic systems & transactions regulation; Personal Data Protection Law (data localisation & protection).', zh: '电子系统与交易条例；个人数据保护法（数据本地化与保护）。' },
    { c: 'PUIL 2011 (SNI 0225) & amendments', r: 'ID', a: 'ELEC', en: 'General requirements for electrical installations.', zh: '印尼电气装置通用要求。' },
    { c: 'SNI 1726:2019 / SNI 1727:2020 / SNI 2847:2019', r: 'ID', a: 'CIVIL', en: 'Seismic design, minimum design loads, structural concrete.', zh: '抗震设计、最小设计荷载、结构混凝土。' },
    { c: 'SNI 03-3985 / SNI 03-3989 & Permen PU 26/2008', r: 'ID', a: 'FIRE', en: 'Fire detection & alarm, sprinkler systems, building fire-protection requirements.', zh: '火灾探测报警、自动喷水系统及建筑防火要求。' },
    { c: 'PBG / SLF / AMDAL or UKL-UPL / PKKPR', r: 'ID', a: 'PERMIT', en: 'Building approval, certificate of occupancy, environmental approval and spatial-use conformity.', zh: '建筑审批、使用合格证、环境审批及空间用途符合性确认。' },
    { c: 'PP 28/2025 — Risk-based business licensing (OSS-RBA)', r: 'ID', a: 'PERMIT', en: 'Replaces PP 5/2021 (effective 5 Oct 2025): NIB and standard certificate through OSS, with transition rules for projects already holding spatial approval.', zh: '取代PP 5/2021（2025年10月5日生效）：通过OSS取得NIB及标准证书，已获空间许可的项目适用过渡规定。' },
    { c: 'BPS Reg. 7/2025 — KBLI 2025 (code 63102)', r: 'ID', a: 'PERMIT', en: 'KBLI 63102 covers computing infrastructure, hosting, cloud and colocation data centers (replacing KBLI 2020 code 63112) — verify the active code in OSS.', zh: 'KBLI 63102涵盖计算基础设施、托管、云及机柜托管数据中心（取代KBLI 2020的63112）——请在OSS核实现行代码。' },
    { c: 'Permenkomdigi 5/2025 — Electronic System Operators (PSE)', r: 'ID', a: 'POLICY', en: 'Registration and obligations of private-scope electronic system operators, incl. data protection and security.', zh: '私营电子系统运营者的登记及义务，包括数据保护与安全。' },
    { c: 'Permenkomdigi 18/2025 — National Data Center service unit', r: 'ID', a: 'POLICY', en: 'Organisation of the Balai Layanan Pusat Data Nasional (PDN) operating the government data centers.', zh: '国家数据中心服务中心（PDN）组织架构，负责运营政府数据中心。' },
    { c: 'Perpres 95/2018 — SPBE (e-government)', r: 'ID', a: 'POLICY', en: 'Electronic-based government system; national data center as shared government infrastructure.', zh: '电子政务系统；国家数据中心作为政府共享基础设施。' },
    { c: 'POJK 11/POJK.03/2022 — IT governance of commercial banks', r: 'ID', a: 'POLICY', en: 'Bank data centers and DR centers in Indonesia unless approved otherwise by OJK — verify current text.', zh: '银行数据中心及灾备中心须设在印尼境内（经OJK批准的除外）——请核实现行条文。' },
    { c: 'PP 16/2021 — Buildings (PBG & SLF)', r: 'ID', a: 'PERMIT', en: 'Building approval (Persetujuan Bangunan Gedung) and certificate of worthiness (Sertifikat Laik Fungsi).', zh: '建筑审批（PBG）及建筑适用性证书（SLF）。' },
    { c: 'PP 22/2021 — Environmental protection & management', r: 'ID', a: 'PERMIT', en: 'AMDAL / UKL-UPL / SPPL environmental approval depending on scale and impact.', zh: '根据规模及影响办理AMDAL/UKL-UPL/SPPL环境审批。' },
    { c: 'Permen PUPR 21/2021 — Green building performance (BGH)', r: 'ID', a: 'ENERGY', en: 'Bangunan Gedung Hijau assessment; GREENSHIP (GBC Indonesia) as voluntary rating.', zh: '绿色建筑（BGH）评估；GREENSHIP（印尼绿色建筑委员会）为自愿性评级。' },
    { c: 'Permen ESDM 2/2024 — Rooftop solar (PLTS Atap)', r: 'ID', a: 'ENERGY', en: 'Rules and quotas for rooftop solar connected to PLN — on-site renewable contribution.', zh: '并入PLN电网的屋顶光伏规定及配额——现场可再生能源贡献。' },
    { c: 'PLN tariffs 2026 — B-3/I-3 TM Rp1,114.74; I-4 TT Rp996.74 per kWh', r: 'ID', a: 'ENERGY', en: 'Non-subsidised tariffs unchanged since 2022 (Q4 2026); WBP peak multiplier applies to TM classes.', zh: '非补贴电价自2022年以来未调整（2026年第四季度）；中压类别适用高峰时段系数。' },
    { c: 'PLN Renewable Energy Certificate (REC) & green energy services', r: 'ID', a: 'ENERGY', en: 'REC list price ≈ Rp35,000 per MWh (2025); 6.43 TWh sold in 2025.', zh: 'REC挂牌价约每MWh 35,000印尼盾（2025）；2025年售出6.43 TWh。' },
    { c: 'UU 1/1970 & Permenaker 12/2015 — Occupational safety (K3, electrical)', r: 'ID', a: 'OPS', en: 'Workplace safety and electrical K3 requirements for construction and operation.', zh: '施工及运营阶段的职业安全与电气K3要求。' },
    { c: 'SNI 03-1745-2000 / SNI 1729:2020', r: 'ID', a: 'CIVIL', en: 'Standpipe & hydrant systems; structural steel design.', zh: '竖管及消火栓系统；钢结构设计。' },
    /* global additions */
    { c: 'IEC 62933 / UL 9540 / UL 9540A', r: 'INT', a: 'ELEC', en: 'Battery energy storage systems — safety, performance and thermal-runaway fire testing.', zh: '电池储能系统——安全、性能及热失控火灾测试。' },
    { c: 'OCP Open Rack v3 & Advanced Cooling Solutions specs', r: 'INT', a: 'IT', en: 'Open Compute rack, power-shelf and liquid-cooling (cold plate, CDU) specifications.', zh: '开放计算机柜、电源架及液冷（冷板、CDU）规范。' },
    { c: 'NVIDIA DGX SuperPOD / MGX site-readiness guides', r: 'INT', a: 'IT', en: 'Vendor facility requirements for rack-scale AI: power, liquid cooling, weight, networking.', zh: '机架级AI的厂商设施要求：电力、液冷、重量、网络。' },
    { c: 'ISO 14644-1 / ANSI/ISA-71.04', r: 'INT', a: 'MECH', en: 'Air cleanliness classes; gaseous-corrosion severity levels (G1 target) for IT spaces.', zh: '空气洁净度等级；IT空间气态腐蚀等级（目标G1）。' },
    { c: 'IEEE 3006 series / IEEE 493', r: 'US', a: 'ELEC', en: 'Reliability and availability analysis of industrial and commercial power systems.', zh: '工业及商业电力系统可靠性与可用性分析。' },
    { c: 'NFPA 770', r: 'US', a: 'FIRE', en: 'Hybrid (water and inert gas) fire-extinguishing systems.', zh: '混合式（水+惰性气体）灭火系统。' },
    { c: 'LEED v4.1 BD+C: Data Centers', r: 'US', a: 'ENERGY', en: 'Green-building rating adaptation for data centers.', zh: '适用于数据中心的绿色建筑评级。' },
    /* Singapore / regional */
    { c: 'SS 564 (Green Data Centres) & IMDA DC-CFA', r: 'SG', a: 'ENERGY', en: 'Singapore green data-centre standard; capacity allocation favouring best-in-class efficiency.', zh: '新加坡绿色数据中心标准；容量分配倾向最高能效项目。' }
  ];

  /* -------------------------------------------------------- glossary */
  D.glossary = [
    ['Availability', '可用性', 'Percentage of time the IT service/infrastructure is operational.', 'IT服务/基础设施正常运行时间所占百分比。'],
    ['ATS', '自动转换开关', 'Automatic Transfer Switch — transfers load between two power sources.', '在两路电源之间自动切换负荷的开关。'],
    ['BMS', '楼宇自控系统', 'Building Management System for mechanical & environmental monitoring/control.', '用于机械及环境监控的楼宇管理系统。'],
    ['Busway', '插接母线', 'Overhead plug-in busbar feeding racks through tap-off boxes.', '通过插接箱为机柜供电的上走线插接母线。'],
    ['CAC / HAC', '冷/热通道封闭', 'Cold- or hot-aisle containment separating supply and exhaust air.', '隔离送风与排风的冷通道或热通道封闭。'],
    ['CDU', '冷量分配单元', 'Coolant Distribution Unit separating facility water from the technology cooling loop.', '将设施水与技术冷却环路隔离的冷却液分配单元。'],
    ['Chiller', '冷水机组', 'Machine producing chilled water using a refrigeration cycle.', '利用制冷循环制取冷冻水的设备。'],
    ['Cold plate / DLC', '冷板 / 直接液冷', 'Direct-to-chip liquid cooling: coolant flows through plates on CPUs/GPUs.', '直接芯片液冷：冷却液流经CPU/GPU上的冷板。'],
    ['Colocation', '托管', 'Business model leasing space, power and cooling to multiple tenants.', '向多个租户出租空间、电力和制冷的商业模式。'],
    ['Commissioning (Cx)', '调试', 'Process verifying systems are designed, installed and perform to requirements (L1–L5).', '验证系统按要求设计、安装并运行的过程（L1–L5）。'],
    ['Concurrent maintainability', '可同时维护', 'Ability to maintain any component/path without IT impact (Tier III).', '可维护任一组件/路径而不影响IT（Tier III）。'],
    ['CRAC', '直膨式精密空调', 'Computer Room Air Conditioner with its own compressor (DX).', '自带压缩机的机房精密空调（直膨式）。'],
    ['CRAH', '冷冻水型精密空调', 'Computer Room Air Handler using chilled water coils.', '使用冷冻水盘管的机房空气处理机。'],
    ['CUE', '碳利用效率', 'Carbon Usage Effectiveness — kgCO₂e per kWh of IT energy.', '每kWh IT能耗对应的二氧化碳当量（kg）。'],
    ['DCIM', '数据中心基础设施管理', 'Software managing assets, capacity, power and environment.', '管理资产、容量、电力及环境的软件。'],
    ['Dual-corded', '双电源', 'IT equipment with two power supplies fed from A and B sources.', '由A、B两路电源供电的双电源IT设备。'],
    ['Economiser (free cooling)', '自然冷却', 'Using cool outside air/water to reduce or eliminate compressor cooling.', '利用室外冷空气/冷水减少或取消压缩机制冷。'],
    ['Edge data center', '边缘数据中心', 'Small facility close to end users for low latency.', '靠近终端用户、低时延的小型设施。'],
    ['EPMS', '电力监控系统', 'Electrical Power Monitoring System for the power chain.', '监测供电链的电力监控系统。'],
    ['EPO', '紧急断电', 'Emergency Power Off — disconnects power to IT room in emergencies.', '紧急情况下切断IT机房电源的装置。'],
    ['FAT / SAT', '工厂/现场验收测试', 'Factory / Site Acceptance Test.', '工厂验收测试/现场验收测试。'],
    ['Fault tolerance', '容错', 'Ability to withstand any single failure without IT impact (Tier IV).', '承受任一单点故障而不影响IT（Tier IV）。'],
    ['Fan wall', '风墙', 'Large array of fans and coils supplying a flooded cold aisle.', '向漫灌冷区送风的大型风机与盘管阵列。'],
    ['Generator (genset)', '发电机组', 'Diesel/gas engine-driven generator providing backup power.', '提供备用电源的柴油/燃气发电机组。'],
    ['Grey space', '灰区', 'Plant areas for power and cooling infrastructure.', '电力与制冷基础设施所在的设备区。'],
    ['Hyperscale', '超大规模', 'Very large standardised facilities of cloud/internet providers.', '云/互联网服务商的超大型标准化设施。'],
    ['IEC (cooling)', '间接蒸发冷却', 'Indirect Evaporative Cooling — air-to-air HX with evaporative outdoor side.', '室外侧蒸发、空-空换热的间接蒸发冷却。'],
    ['Immersion cooling', '浸没式液冷', 'Servers submerged in dielectric fluid.', '服务器浸没在绝缘冷却液中。'],
    ['IST', '综合系统测试', 'Integrated Systems Test — Level 5 commissioning of all systems together.', '所有系统联合进行的第5级调试。'],
    ['IT load', 'IT负载', 'Electrical power consumed by IT equipment (kW/MW) — the basis of DC sizing.', 'IT设备消耗的电功率（kW/MW）——数据中心规模的基础。'],
    ['kW per rack', '单柜功率密度', 'Average or design power per cabinet.', '每个机柜的平均或设计功率。'],
    ['Leaf-spine', '叶脊架构', 'Two-tier Clos network topology for predictable east-west traffic.', '用于可预测东西向流量的两层Clos网络拓扑。'],
    ['Li-ion (LFP)', '锂离子（磷酸铁锂）', 'Lithium iron phosphate batteries for UPS — compact, long life.', '用于UPS的磷酸铁锂电池——体积小、寿命长。'],
    ['MDA / HDA / EDA', '主/水平/设备配线区', 'TIA-942 cabling distribution areas.', 'TIA-942定义的布线分配区域。'],
    ['MMR', '运营商交汇间', 'Meet-Me Room where carriers interconnect with tenants.', '运营商与租户进行互联的房间。'],
    ['MV / LV', '中压 / 低压', 'Medium voltage (1–35 kV) / Low voltage (≤ 1 kV).', '中压（1–35 kV）/ 低压（≤1 kV）。'],
    ['N, N+1, 2N', 'N、N+1、2N冗余', 'N = capacity needed; N+1 = one spare; 2N = full duplicate system.', 'N=所需容量；N+1=一台备用；2N=完全双套系统。'],
    ['NOC', '网络运营中心', 'Network / facility Operations Center staffed 24/7.', '7×24值守的网络/设施运营中心。'],
    ['PDU', '列头配电柜', 'Power Distribution Unit feeding racks from UPS.', '从UPS向机柜供电的配电单元。'],
    ['Phasing', '分期建设', 'Building capacity in stages to match demand and cash flow.', '按需求和现金流分阶段建设容量。'],
    ['Pre-action sprinkler', '预作用喷淋', 'Dry-pipe sprinkler requiring detection + head activation.', '需探测报警+喷头动作的干式喷淋系统。'],
    ['PUE', '电能利用效率', 'Power Usage Effectiveness = total facility energy ÷ IT energy (ideal 1.0).', '总设施能耗÷IT能耗（理想值1.0）。'],
    ['Raised floor', '架空地板', 'Elevated floor creating an under-floor plenum.', '形成地板下静压箱的高架地板。'],
    ['RDHx', '背板热交换器', 'Rear Door Heat Exchanger mounted on the rack.', '安装在机柜后门的热交换器。'],
    ['REF', '可再生能源系数', 'Renewable Energy Factor — share of renewable energy used.', '使用可再生能源的比例。'],
    ['RFS', '可交付使用', 'Ready For Service — date capacity is available to customers.', '容量可向客户交付使用的日期。'],
    ['rPDU', '机架PDU', 'Rack-mounted power strip distributing power to servers; counted per feed — 2 per standard rack (A + B), more on high-density air-cooled racks, none where OEM power shelves are used.', '机柜内向服务器配电的电源排插；按每路计数——标准机柜每柜2条（A+B），高密度风冷机柜更多，使用OEM电源架时不需要。'],
    ['Rack position', '机柜位', 'One physical place for a rack in the white space, with its power feeds, cooling and floor capacity; the basic unit for counting racks.', '白区内放置一个机柜的物理位置，含供电、制冷及楼面承载；机柜计数的基本单位。'],
    ['Cabinet (rack enclosure)', '机柜（机架外壳）', 'The steel enclosure (e.g. 48U, 600 × 1,200 mm) that holds IT equipment; standard cabinets are supplied by the facility, integrated AI racks arrive with the IT system.', '容纳IT设备的钢制外壳（如48U、600×1,200 mm）；标准机柜由设施供货，集成AI机柜随IT系统到货。'],
    ['Rack-scale system', '机架级系统', 'A whole rack built and tested as one system by the IT vendor (e.g. NVIDIA GB300 NVL72: 72 GPUs, ≈ 135 kW, liquid-cooled) — one system per rack position.', '由IT厂商整柜集成测试的系统（如NVIDIA GB300 NVL72：72颗GPU、约135 kW、液冷）——每个机柜位一个系统。'],
    ['GPU system (server / node)', 'GPU系统（服务器/节点）', 'An accelerated server, typically 8 GPUs (e.g. DGX / HGX B300); 4–8 per rack depending on density. Counted as IT equipment inside the rack positions, not as extra racks.', '加速计算服务器，通常8颗GPU（如DGX/HGX B300）；按密度每柜4–8台。作为机柜位内的IT设备计数，不是额外机柜。'],
    ['Power shelf', '电源架', 'Rack-mounted AC/DC power supplies feeding a DC busbar inside AI racks (e.g. 8 × 33 kW shelves, 50 V DC); replaces rack PDUs.', 'AI机柜内为直流母排供电的交流/直流电源单元（如8×33 kW、50 V直流）；替代机柜PDU。'],
    ['Tap-off unit', '插接箱', 'Plug-in box on the overhead busway that feeds one rack (or one power shelf) per feed; one or more per rack per feed.', '安装在上走线母线上的插接单元，每路为一个机柜（或电源架）供电；每柜每路一个或多个。'],
    ['SLA', '服务等级协议', 'Service Level Agreement (e.g. 99.999% power availability).', '服务等级协议（如99.999%电力可用性）。'],
    ['STS', '静态转换开关', 'Static Transfer Switch switching between two UPS sources in < 4 ms.', '在<4 ms内于两路UPS间切换的静态开关。'],
    ['Stranded capacity', '搁浅容量', 'Power/cooling capacity that cannot be used due to imbalance elsewhere.', '因其他环节不匹配而无法使用的电力/制冷容量。'],
    ['Thermal runaway', '热失控', 'Self-accelerating overheating of a battery cell.', '电池单体自加速升温失控。'],
    ['Tier', '等级（Tier）', 'Uptime Institute classification of infrastructure topology I–IV.', 'Uptime Institute基础设施拓扑分级I–IV。'],
    ['TPG', '技术参数保证表', 'Technical Particulars & Guarantees — bidder-guaranteed equipment data.', '投标人保证的设备技术参数表。'],
    ['UPS', '不间断电源', 'Uninterruptible Power Supply bridging power until generators start.', '在发电机启动前桥接供电的不间断电源。'],
    ['Utilisation', '利用率', 'Actual IT load ÷ design IT capacity.', '实际IT负载÷设计IT容量。'],
    ['VESDA / ASD', '极早期烟雾探测', 'Aspirating Smoke Detection — very early warning fire detection.', '吸气式感烟探测——极早期火灾预警。'],
    ['White space', '白区', 'Floor area hosting IT racks.', '放置IT机柜的楼面区域。'],
    ['WUE', '水利用效率', 'Water Usage Effectiveness = site water (L) ÷ IT energy (kWh).', '场地用水量（L）÷IT能耗（kWh）。']
  ];

  /* --------------------------------------------- project lifecycle */
  D.lifecycle = [
    { en: 'Strategy & Business Case', zh: '战略与商业论证', d: ['Demand, business model, target market, funding strategy.', '需求、商业模式、目标市场、融资策略。'] },
    { en: 'Feasibility & Site Selection', zh: '可行性研究与选址', d: ['Power & fibre availability, hazards, land, permits, CAPEX/OPEX, financial model.', '电力与光纤可得性、灾害、土地、许可、投资/运营成本、财务模型。'] },
    { en: 'Permits & Utility Applications', zh: '报批报建与公用事业申请', d: ['Grid connection, environmental approval, building permit, water rights.', '电网接入、环境审批、建筑许可、取水许可。'] },
    { en: 'Concept & Basis of Design', zh: '概念设计与设计依据', d: ['Tier, capacity, density, cooling and power architecture frozen.', '确定Tier、容量、密度、制冷与供电架构。'] },
    { en: 'Schematic & Detailed Design', zh: '方案及详细设计', d: ['Drawings, specifications, TPG, BOQ, tender documents; Tier design certification.', '图纸、技术规范、TPG、工程量清单、招标文件；Tier设计认证。'] },
    { en: 'Procurement', zh: '采购', d: ['Long-lead items first: transformers, generators, MV switchgear, UPS, chillers.', '优先采购长周期设备：变压器、发电机、中压开关柜、UPS、冷机。'] },
    { en: 'Construction & Installation', zh: '施工与安装', d: ['Civil/structural, building envelope, MEP installation, QA/QC.', '土建/结构、建筑围护、机电安装、质量控制。'] },
    { en: 'Testing & Commissioning (L1–L5)', zh: '测试与调试（L1–L5）', d: ['FAT → installation checks → start-up → functional tests → integrated systems test.', '工厂测试→安装检查→单机启动→系统功能测试→综合系统测试。'] },
    { en: 'Handover & Ready-for-Service', zh: '移交与投产', d: ['As-builts, O&M manuals, training, Tier facility certification, customer onboarding.', '竣工图、运维手册、培训、Tier设施认证、客户入驻。'] },
    { en: 'Operations & Optimisation', zh: '运营与优化', d: ['24/7 operations, maintenance, capacity management, PUE optimisation, expansions.', '7×24运营、维护、容量管理、PUE优化、扩建。'] }
  ];

  D.cxLevels = [
    ['L1', 'Factory Acceptance Test (FAT)', '工厂验收测试', 'Witness tests of major equipment at manufacturer.', '在制造厂见证主要设备测试。'],
    ['L2', 'Delivery & Installation Verification', '到货及安装检查', 'Inspect equipment on arrival and installation quality.', '检查到货设备及安装质量。'],
    ['L3', 'Start-up / Pre-functional', '单机启动 / 预功能测试', 'Energise and start each component individually.', '对各组件逐一通电启动。'],
    ['L4', 'Functional Performance Test', '系统功能性能测试', 'Test each system under load (load banks) incl. failure modes.', '在负载（负载箱）下测试每个系统，包括故障模式。'],
    ['L5', 'Integrated Systems Test (IST)', '综合系统测试', 'All systems together: utility failure, generator start, UPS, cooling recovery.', '所有系统联合测试：市电失效、发电机启动、UPS、制冷恢复。']
  ];

  /* ------------------------------------------- regional benchmarks */
  /* capex: USD million per MW IT, Tier III, 10–30 MW, air-cooled (shell + MEP fit-out,
     excluding land & IT hardware). Calibrated against public cost-index ranges (2025). */
  D.regions = [
    { id: 'ID', en: 'Indonesia (Jakarta / Batam)', zh: '印度尼西亚（雅加达 / 巴淡）', capex: 10.5, tariff: 0.075, colo: 160, land: 250, water: 1.0, tax: 22, wacc: 10, climate: 'TROP', grid: '20 kV (TM) / 150 kV (TT) — PLN', std: ['ID'] },
    { id: 'MY', en: 'Malaysia (Johor / KL)', zh: '马来西亚（柔佛 / 吉隆坡）', capex: 11.0, tariff: 0.11, colo: 125, land: 200, water: 0.8, tax: 24, wacc: 9.5, climate: 'TROP', grid: '11 / 33 / 132 kV — TNB', std: [] },
    { id: 'SG', en: 'Singapore', zh: '新加坡', capex: 14.5, tariff: 0.20, colo: 280, land: 2500, water: 2.0, tax: 17, wacc: 8, climate: 'TROP', grid: '22 / 66 kV — SP Group', std: ['SG'] },
    { id: 'CN', en: 'China (Tier-1 / hub cities)', zh: '中国（一线 / 枢纽城市）', capex: 7.5, tariff: 0.085, colo: 110, land: 150, water: 0.6, tax: 25, wacc: 8, climate: 'SUBT', grid: '10 / 35 / 110 kV — State Grid / CSG', std: ['CN'] },
    { id: 'IN', en: 'India (Mumbai / Chennai)', zh: '印度（孟买 / 金奈）', capex: 7.0, tariff: 0.09, colo: 110, land: 300, water: 0.8, tax: 25, wacc: 11, climate: 'TROP', grid: '22 / 33 / 220 kV', std: [] },
    { id: 'JP', en: 'Japan (Tokyo / Osaka)', zh: '日本（东京 / 大阪）', capex: 15.0, tariff: 0.19, colo: 230, land: 1500, water: 1.5, tax: 30, wacc: 6.5, climate: 'TEMP', grid: '22 / 66 / 154 kV', std: [] },
    { id: 'AU', en: 'Australia (Sydney / Melbourne)', zh: '澳大利亚（悉尼 / 墨尔本）', capex: 12.5, tariff: 0.15, colo: 190, land: 700, water: 2.5, tax: 30, wacc: 8, climate: 'TEMP', grid: '11 / 33 / 132 kV', std: [] },
    { id: 'US', en: 'United States', zh: '美国', capex: 11.5, tariff: 0.085, colo: 165, land: 120, water: 1.2, tax: 21, wacc: 8, climate: 'TEMP', grid: '13.8 / 34.5 / 138–345 kV', std: ['US'] },
    { id: 'EU', en: 'Western Europe (FLAP-D)', zh: '西欧（法兰克福/伦敦/阿姆斯特丹/巴黎/都柏林）', capex: 12.5, tariff: 0.18, colo: 200, land: 500, water: 2.0, tax: 25, wacc: 7.5, climate: 'TEMP', grid: '10 / 20 / 110 kV', std: ['EU'] },
    { id: 'ME', en: 'Middle East (GCC)', zh: '中东（海湾国家）', capex: 10.0, tariff: 0.06, colo: 160, land: 150, water: 2.5, tax: 9, wacc: 8.5, climate: 'HOTD', grid: '11 / 33 / 132 kV', std: [] },
    { id: 'NORD', en: 'Nordics', zh: '北欧', capex: 11.0, tariff: 0.07, colo: 150, land: 80, water: 1.5, tax: 21, wacc: 7, climate: 'COLD', grid: '20 / 132 kV', std: ['EU'] }
  ];

  D.climates = [
    { id: 'TROP', en: 'Tropical humid (e.g. Jakarta, Batam, Singapore)', zh: '热带湿热（如雅加达、巴淡、新加坡）', db: 35, wb: 28, econ: 0.02 },
    { id: 'SUBT', en: 'Subtropical / monsoon (e.g. S. China, India)', zh: '亚热带 / 季风（如华南、印度）', db: 36, wb: 28, econ: 0.20 },
    { id: 'HOTD', en: 'Hot & dry (e.g. inland Middle East)', zh: '干热（如中东内陆）', db: 46, wb: 25, econ: 0.25 },
    { id: 'TEMP', en: 'Temperate (e.g. Europe, N. China, US)', zh: '温带（如欧洲、华北、美国）', db: 32, wb: 23, econ: 0.55 },
    { id: 'COLD', en: 'Cold (e.g. Nordics, Inner Mongolia)', zh: '寒冷（如北欧、内蒙古）', db: 27, wb: 19, econ: 0.85 }
  ];

  D.cooling = [
    { id: 'DX', en: 'DX precision AC (CRAC)', zh: '直膨式精密空调（CRAC）', maxDens: 10, maxMW: 1.5,
      d: ['Simple, no water; for small rooms and edge sites.', '简单、无水系统；适合小型机房和边缘站点。'] },
    { id: 'ACCH', en: 'Air-cooled chillers + CRAH / fan wall', zh: '风冷冷水机组 + 冷冻水精密空调 / 风墙', maxDens: 25, maxMW: 30,
      d: ['No evaporative water use; good where water is scarce.', '无蒸发耗水；适合缺水地区。'] },
    { id: 'WCCH', en: 'Water-cooled chillers + cooling towers + CRAH / fan wall', zh: '水冷冷水机组 + 冷却塔 + 精密空调 / 风墙', maxDens: 25, maxMW: 1000,
      d: ['Most efficient compressor-based plant for large sites in hot-humid climates; uses water.', '湿热地区大型站点效率最高的压缩机制冷方案；需耗水。'] },
    { id: 'IEC', en: 'Indirect evaporative cooling (IEC)', zh: '间接蒸发冷却（IEC）', maxDens: 20, maxMW: 200,
      d: ['Very low PUE in dry/temperate climates; limited benefit in tropical climates.', '干燥/温和气候下PUE极低；热带气候效果有限。'] },
    { id: 'DLC', en: 'Direct liquid cooling (cold plate) + residual air', zh: '冷板式液冷 + 余热风冷', maxDens: 150, maxMW: 2000,
      d: ['Required for AI/GPU racks above ~40 kW; warm-water loops enable chiller-less heat rejection.', '约40 kW以上AI/GPU机柜必需；温水环路可实现无冷机散热。'] },
    { id: 'IMM', en: 'Immersion cooling', zh: '浸没式液冷', maxDens: 200, maxMW: 200,
      d: ['Lowest PUE; specialised IT, fluid handling and floor loading considerations.', 'PUE最低；需专用IT、冷却液管理并考虑楼面荷载。'] }
  ];
  /* Rev. 18: CRAC or CRAH — the two air-side families compared, what the standards regulate, the typical choice by project (simulation panel and knowledge documents) */
  D.cracCrah = {
    rows: [
      [['What cools the coil', '盘管冷源'], ['refrigerant from the unit’s own compressor (direct expansion)', '机组自带压缩机的冷媒（直接膨胀）'], ['chilled water from the central plant; no compressor in the unit', '集中冷站的冷冻水；机组内无压缩机']],
      [['Where the heat goes', '热量去向'], ['outdoor air-cooled condenser per unit (or glycol dry cooler, water-cooled condenser)', '每台配室外风冷冷凝器（或乙二醇干冷器、水冷冷凝器）'], ['chillers → cooling towers (water-cooled) or condenser fans (air-cooled); economiser hours', '冷机 → 冷却塔（水冷）或冷凝风机（风冷）；自然冷却时段']],
      [['Typical unit size', '典型单机'], ['10–150 kW', '10–150 kW'], ['CRAH 50–250 kW | fan wall 300–500 kW | CW in-row 30–60 kW', 'CRAH 50–250 kW | 风墙300–500 kW | 冷冻水列间30–60 kW']],
      [['Efficiency in Indonesia', '印尼能效'], ['COP ≈ 2.5–4 (condensing at ≈ 45–50 °C)', 'COP约2.5–4（冷凝约45–50 °C）'], ['plant COP ≈ 5–7 water-cooled, ≈ 3–4 air-cooled; 14–18 °C chilled water helps', '水冷冷站COP约5–7，风冷约3–4；14–18 °C冷冻水更节能']],
      [['Water', '用水'], ['none', '无'], ['towers ≈ 1.8–2.0 L/kWh; air-cooled ≈ 0', '冷却塔约1.8–2.0 L/kWh；风冷约0']],
      [['Refrigerant', '冷媒'], ['in every unit and field pipe run (HFC phase-down)', '每台机组及现场管路均有（HFC削减）'], ['only inside the chillers in the plant room', '仅在冷机房的冷机内']],
      [['Best for', '适用'], ['server rooms, edge sites, UPS / battery rooms, MMR; ≤ ≈ 1–1.5 MW', '服务器机房、边缘站点、UPS/电池室、MMR；约≤1–1.5 MW'], ['halls from ≈ 1 MW to hyperscale; ≈ 25 kW/rack with containment, 40–75 kW with rear doors', '约1 MW至超大规模机房；封闭通道约25 kW/柜，背板换热40–75 kW']],
      [['Redundancy (Tier III)', '冗余（Tier III）'], ['N+1 units per room, each an independent circuit', '每间N+1，每台独立回路'], ['N+1 units per hall + N+1 chillers and pumps + A/B or ring piping', '每厅N+1末端 + N+1冷机与水泵 + A/B或环网管路']],
      [['Watch-outs', '注意事项'], ['many compressors to maintain; pipe-length limits; noise outdoors', '压缩机多、维护量大；管长受限；室外噪声'], ['water near the white space → leak detection; plant CAPEX', '水管靠近白区 → 漏水检测；冷站投资']]],
    std: [
      ['ASHRAE TC 9.9 Thermal Guidelines (5th ed.)', ['server inlet 18–27 °C recommended (classes A1–A4, H1 for high density), dew point and humidity limits', '服务器进风推荐18–27 °C（A1–A4级，高密度H1级），露点及湿度限值']],
      ['ASHRAE 90.4', ['energy of the whole cooling system: maximum mechanical load component (MLC) by climate zone', '整个制冷系统能效：按气候区限定机械负荷分量（MLC）']],
      ['ASHRAE 127 | AHRI 1360 / 1361', ['how computer-room air conditioners are tested and rated (net sensible capacity, NSenCOP)', '机房空调的测试与额定（净显冷量、NSenCOP）']],
      ['ANSI/TIA-942-C', ['Rated-3: N+1 cooling units, concurrently maintainable; Rated-4: fault tolerant', 'Rated-3：N+1制冷末端、可同时维护；Rated-4：容错']],
      ['Uptime Tier Standard: Topology', ['Tier III: every cooling component and path maintainable without stopping the IT; Tier IV: continuous cooling, fault tolerant', 'Tier III：任一制冷组件及路径可维护而不停IT；Tier IV：连续制冷、容错']],
      ['EN 50600-2-3', ['environmental-control availability classes 1–4; supply conditions per the ASHRAE / ETSI envelopes', '环境控制可用性等级1–4；送风条件按ASHRAE/ETSI范围']],
      ['BICSI 002', ['mechanical classes F0–F4, comparable to the Tiers', '机械等级F0–F4，与Tier对应']],
      [['Kigali Amendment | F-gas rules', '基加利修正案 | 含氟气体法规'], ['phase-down of high-GWP refrigerants (R-410A → R-32, R-454B, R-1234ze, R-513A) — favours low-charge central plants', '高GWP冷媒削减（R-410A → R-32、R-454B、R-1234ze、R-513A）——利于低充注量的集中冷站']],
      ['SNI 8799', ['Indonesian data-center standard series, aligned with TIA-942', '印尼数据中心标准系列，与TIA-942一致']]],
    typ: [
      [['Edge / server room ≤ 1 MW', '边缘/服务器机房≤1 MW'], ['DX CRAC (or DX in-row)', '直膨CRAC（或直膨列间）'], ['outdoor condensers', '室外冷凝器']],
      [['Enterprise / colocation 1–30 MW', '企业/托管1–30 MW'], ['CRAH or fan walls', 'CRAH或风墙'], ['air-cooled chillers (water-scarce) or water-cooled chillers + towers', '风冷冷机（缺水）或水冷冷机+冷却塔']],
      [['Hyperscale 30 MW+', '超大规模30 MW+'], ['fan walls; IEC in dry climates', '风墙；干燥气候采用IEC'], ['water-cooled chillers with economisers', '带自然冷却的水冷冷机']],
      [['AI / HPC', 'AI/HPC'], ['cold plates (CDU) + CRAH or rear doors for the residual air', '冷板（CDU）+ CRAH或背板承担余热'], ['warm-water dry coolers + trim chillers', '温水干冷器 + 补冷冷机']],
      [['Small rooms in a chilled-water building', '冷冻水建筑中的小房间'], ['CRAH where chilled water reaches; DX units where it does not', '冷冻水可达处用CRAH；不可达处用直膨机组'], ['the building plant', '建筑冷站']]],
    ans: ['Not every data center uses CRAC and CRAH units together: they are two families for the same job. A CRAC (computer room air conditioner) is a DX unit with its own compressor and an outdoor condenser — the choice for server rooms, edge sites and support rooms up to about 1–1.5 MW. A CRAH (computer room air handler) has a chilled-water coil and fans but no compressor; fan walls, chilled-water in-row coolers and rear-door coils belong to the same family and are fed by a central chiller plant — the choice for colocation, enterprise, hyperscale and the residual air of liquid-cooled AI halls. A building mixes them only for a reason: DX units in small rooms the chilled water does not reach, or diverse back-up in a small critical room. The standards (ASHRAE TC 9.9, ASHRAE 90.4, TIA-942-C, Uptime Tier, EN 50600-2-3, BICSI 002, SNI 8799) set temperatures, efficiency and redundancy — not the unit type.', '并非每个数据中心都同时使用CRAC与CRAH：二者是完成同一任务的两类设备。CRAC（机房精密空调）为自带压缩机及室外冷凝器的直膨机组——适用于服务器机房、边缘站点及约1–1.5 MW以内的辅助房间。CRAH（机房空气处理机）只有冷冻水盘管和风机、没有压缩机；风墙、冷冻水列间空调及背板盘管同属此类，由集中冷站供冷——适用于托管、企业、超大规模及液冷AI机房的余热风冷。只有在特定原因下才会混用：冷冻水到不了的小房间采用直膨机组，或小型关键房间的多样化备用。标准（ASHRAE TC 9.9、ASHRAE 90.4、TIA-942-C、Uptime Tier、EN 50600-2-3、BICSI 002、SNI 8799）规定的是温湿度、能效与冗余——而非末端类型。']
  };
  /* Rev. 19: cooling equipment — efficiency parameters, chiller classes, operating limits, part load, restart, instrumentation,
     Indonesian plant references and a manufacturer line-up. Manufacturer data from the Daikin Applied Solutions Indonesia data-centre
     profile (2026, ratings per AHRI 550/590 unless noted); client names are not given. One source for the Knowledge Base page,
     the Project Technology Simulation and the knowledge documents. */
  D.coolEq = {
    src: ['Manufacturer data: Daikin Applied Solutions Indonesia, data-centre company and technical profile (2026); chiller ratings per AHRI 550/590 (evaporator 12.2 → 6.7 °C, condenser water 29.4 → 35 °C or 35 °C ambient) unless a data-centre condition is stated. Values are “up to” figures of the best models — check every selection at the project conditions.',
      '厂商资料：大金应用解决方案（印尼）数据中心公司及技术介绍（2026）；除注明数据中心工况外，冷机额定值均按AHRI 550/590（蒸发器12.2→6.7 °C，冷却水29.4→35 °C或环境35 °C）。数值为最佳型号的“最高可达”值——每项选型须按项目工况复核。'],
    /* efficiency metrics: [name, definition, formula, unit, typical data-centre values, standard] */
    metrics: [
      ['COP', ['Cooling delivered ÷ electrical power of the chiller (or unit) at stated temperatures', '规定温度下冷量与输入电功率之比'], 'COP = Q ÷ P', 'kW/kW', ['water-cooled centrifugal 6.4–7.5 at AHRI, 9–11 at 20 °C chilled water | air-cooled 2.9–3.7 at AHRI, 4.5–5.2 at 20 °C', '水冷离心AHRI工况6.4–7.5，20 °C冷冻水9–11 | 风冷AHRI工况2.9–3.7，20 °C时4.5–5.2'], 'AHRI 550/590, EN 14511, GB/T 18430.1'],
      ['kW/RT', ['Electrical input per refrigeration ton (3.517 kW of cooling) — the plant engineer’s unit, lower is better', '每冷吨（3.517 kW冷量）输入电功率——越低越好'], 'kW/RT = 3.517 ÷ COP', 'kW/RT', ['chiller 0.31–0.56 water-cooled, 0.95–1.2 air-cooled | whole water-cooled plant 0.55–0.85', '冷机水冷0.31–0.56、风冷0.95–1.2 | 整个水冷冷站0.55–0.85'], 'ASHRAE 90.1, ASHRAE Guideline 22'],
      ['EER', ['Cooling in Btu/h per watt (US practice); in Europe EER is kW/kW at full load', '每瓦输入的冷量（Btu/h，美制）；欧洲EER为满负荷kW/kW'], 'EER = 3.412 × COP', 'Btu/Wh', ['air-cooled chillers ≥ 10.1 (ASHRAE 90.1 Path A, ≥ 150 RT)', '风冷冷机≥10.1（ASHRAE 90.1 Path A，≥150 RT）'], 'ASHRAE 90.1, AHRI 550/590'],
      ['IPLV / NPLV', ['Integrated part-load value: weighted COP at 100 / 75 / 50 / 25 % load with colder condenser water at part load; NPLV uses the project conditions', '综合部分负荷性能：100/75/50/25%负荷加权COP，部分负荷时冷却水更冷；NPLV采用项目工况'], 'IPLV = 0.01 A + 0.42 B + 0.45 C + 0.12 D | condenser water 29.4 / 23.9 / 18.3 / 18.3 °C', 'kW/kW', ['magnetic-bearing water-cooled 11–12 | air-cooled 4.7–7.0', '磁悬浮水冷11–12 | 风冷4.7–7.0'], 'AHRI 550/590'],
      ['ESEER / SEER', ['European seasonal ratios: EER weighted 3 / 33 / 41 / 23 % at 100 / 75 / 50 / 25 % load with 35 / 30 / 25 / 20 °C air (30 / 26 / 22 / 18 °C water); SEER and SEPR per EN 14825', '欧洲季节能效：100/75/50/25%负荷的EER按3/33/41/23%加权，空气35/30/25/20 °C（水30/26/22/18 °C）；SEER及SEPR按EN 14825'], 'ESEER = 0.03 A + 0.33 B + 0.41 C + 0.23 D', 'kW/kW', ['air-cooled screw 4.7–6.6 by efficiency class', '风冷螺杆按能效等级4.7–6.6'], 'Eurovent, EN 14825'],
      ['NSenCOP', ['Net sensible cooling ÷ total power of a computer-room unit, fans and (for CRAC) compressors included', '机房空调净显冷量÷总功率（含风机，CRAC含压缩机）'], 'NSenCOP = Q sensible, net ÷ P total', 'kW/kW', ['CRAH / fan wall 20–40 (fans only) | DX CRAC 2.5–4', 'CRAH/风墙20–40（仅风机）| 直膨CRAC 2.5–4'], 'AHRI 1360 / 1361, ASHRAE 127'],
      ['SFP', ['Specific fan power of air handlers, CRAH units and fan walls', '空气处理机、CRAH及风墙的单位风量风机功率'], 'SFP = fan power ÷ airflow', 'W/(m³/s)', ['EC fan walls 400–800 at 300–400 Pa', 'EC风墙400–800（300–400 Pa）'], 'EN 16798-3, AMCA 210'],
      [['Pump efficiency | WTF', '水泵效率 | 输送系数'], ['Hydraulic ÷ electrical power; water transport factor = heat carried ÷ pump power', '水力功率÷电功率；输送系数=输送热量÷水泵功率'], 'P = flow × head ÷ η | WTF = Q ÷ P pump', '% | kW/kW', ['pumps ≥ 80 % at the duty point, IE4 / IE5 motors | chilled-water WTF ≥ 40', '工作点效率≥80%，IE4/IE5电机 | 冷冻水输送系数≥40'], 'ISO 9906, IEC 60034-30-1'],
      [['Approach | range', '逼近度 | 温差'], ['Approach = leaving water − entering-air wet-bulb (tower) or − the other fluid (heat exchanger); range = water temperature difference', '逼近度=出水温度−进风湿球（冷却塔）或−另一侧流体（换热器）；温差=水侧温差'], 'approach = T water, out − T wb', 'K', ['towers 3–4 K at 28 °C wet-bulb | plate HX and CDU 1–3 K | dry coolers 5–8 K above dry-bulb', '冷却塔3–4 K（湿球28 °C）| 板换及CDU 1–3 K | 干冷器高于干球5–8 K'], 'CTI ATC-105, AHRI 400'],
      ['CLF | pPUE', ['Cooling load factor = cooling energy ÷ IT energy; partial PUE of the cooling system', '制冷负荷系数=制冷能耗÷IT能耗；制冷系统局部PUE'], 'CLF = E cooling ÷ E IT | pPUE = (E IT + E cooling) ÷ E IT', '–', ['tropical water-cooled 0.20–0.32 | liquid-cooled AI 0.08–0.15', '热带水冷0.20–0.32 | 液冷AI 0.08–0.15'], 'ISO/IEC 30134-2'],
      ['MLC', ['Mechanical load component: annual cooling energy ÷ annual IT energy, limited per climate zone (Jakarta = zone 0A)', '机械负荷分量：年制冷能耗÷年IT能耗，按气候区限值（雅加达为0A区）'], 'MLC = Σ E mechanical ÷ Σ E IT', '–', ['compliance check of the whole cooling design', '整体制冷设计的合规校核'], 'ASHRAE 90.4'],
      ['WUE | CoC', ['Water use effectiveness = site water ÷ IT energy; cycles of concentration = make-up ÷ blowdown', '用水效率=场地用水÷IT能耗；浓缩倍数=补水÷排污'], 'WUE = L ÷ kWh IT | CoC = C circulating ÷ C make-up', 'L/kWh | –', ['towers 1.8–2.0 L/kWh in the tropics, CoC 4–6 | air-cooled 0.05–0.35', '热带冷却塔1.8–2.0 L/kWh，浓缩4–6倍 | 风冷0.05–0.35'], 'ISO/IEC 30134-9, ASHRAE 188']
    ],
    /* chiller classes; eta = fraction of the Carnot COP at full load, pl = share of the part-load gain of a VSD magnetic-bearing centrifugal */
    cls: [
      { k: 'WMAG', air: false, eta: .70, pl: 1, en: 'Water-cooled centrifugal, magnetic bearing (oil-free, VSD)', zh: '水冷离心，磁悬浮（无油、变频）', cap: '90–2,800 RT', copA: '6.8–7.5', iplv: '11.4–12.0', copDC: ['9.7–11.3 at 20 °C chilled water', '20 °C冷冻水时9.7–11.3'], lwt: '20–25', cond: '40–45', restart: ['ride-through ≈ 20 s; restart 35 s, 80 % in 85 s, 100 % in 180 s', '断电穿越约20 s；35 s重启，85 s达80%，180 s达100%'], ref: 'R-1233zd(E), R-1234ze, R-134a, R-513A, R-515B', use: ['large data-centre plants; best part load', '大型数据中心冷站；部分负荷最佳'] },
      { k: 'WOIL', air: false, eta: .68, pl: .7, en: 'Water-cooled centrifugal, oil-lubricated (one or two stage, VSD)', zh: '水冷离心，油润滑（单级或两级、变频）', cap: '350–3,500 RT', copA: '6.6–7.3', iplv: '≈ 11', copDC: ['≈ 9.7 at 30 → 20 °C evaporator, 35 → 40 °C condenser', '蒸发器30→20 °C、冷凝器35→40 °C时约9.7'], lwt: '15–30', cond: '40–57', restart: ['0–80 % of rated current in 180 s', '180 s内由0升至80%额定电流'], ref: 'R-1234ze, R-1233zd(E), R-515B, R-513A, R-134a', use: ['very large units, high condenser temperatures, heat recovery', '超大单机、高冷凝温度、热回收'] },
      { k: 'WSCR', air: false, eta: .64, pl: .5, en: 'Water-cooled screw / scroll', zh: '水冷螺杆/涡旋', cap: '50–600 RT', copA: '5.5–6.3', iplv: '7–9', copDC: ['≈ 8 at 20 °C chilled water', '20 °C冷冻水时约8'], lwt: '15–18', cond: '45', restart: ['≈ 2–4 min', '约2–4 min'], ref: 'R-134a, R-513A, R-1234ze', use: ['small and medium plants', '中小型冷站'] },
      { k: 'AMAG', air: true, eta: .55, pl: .6, en: 'Air-cooled centrifugal, magnetic bearing (multi-compressor)', zh: '风冷离心，磁悬浮（多压缩机）', cap: '90–480 RT', copA: '3.4–3.7', iplv: '6.0–7.0', copDC: ['4.5–5.2 at 30 → 20 °C evaporator, 40 °C ambient', '蒸发器30→20 °C、环境40 °C时4.5–5.2'], lwt: '21–30', cond: ['44–45 °C ambient (≈ 54 °C option)', '环境44–45 °C（选配约54 °C）'], restart: ['30 s to restart, 180 s to 100 % (controls on UPS)', '30 s重启，180 s达100%（控制系统接UPS）'], ref: 'R-134a, R-1234ze', use: ['sites without water; mid-size halls', '无水源场地；中等规模机房'] },
      { k: 'ASCR', air: true, eta: .52, pl: .4, en: 'Air-cooled screw, inverter (efficiency classes)', zh: '风冷螺杆，变频（分能效等级）', cap: '60–550 RT', copA: ['2.9 / 3.1 / 3.4 / 3.7 (four classes)', '2.9/3.1/3.4/3.7（四个等级）'], iplv: ['4.7 / 5.5 / 6.0 / 6.6 (IPLV / ESEER)', '4.7/5.5/6.0/6.6（IPLV/ESEER）'], copDC: ['≈ 4–4.5 at 18–20 °C chilled water', '18–20 °C冷冻水时约4–4.5'], lwt: '18 (30 option)', cond: ['46 °C ambient (55 °C option)', '环境46 °C（选配55 °C）'], restart: ['rapid-restart option', '可选快速重启'], ref: 'R-134a, R-513A, R-1234ze', use: ['colocation and enterprise sites, phased growth', '托管及企业站点，分期扩容'] },
      { k: 'AMOD', air: true, eta: .47, pl: .4, en: 'Air-cooled scroll / modular', zh: '风冷涡旋/模块化', cap: '30–470 RT', copA: '≈ 2.9–3.1', iplv: '≈ 4.5–5', copDC: ['≈ 3.8 at 20 °C chilled water', '20 °C冷冻水时约3.8'], lwt: '15–18', cond: ['46 °C ambient', '环境46 °C'], restart: ['≈ 1–3 min', '约1–3 min'], ref: 'R-410A, R-32, R-454B', use: ['edge rooms, support areas', '边缘机房、辅助区'] }
    ],
    /* operating envelope of manufacturer models: [type, model, max leaving chilled water °C, max condenser leaving water / ambient °C] */
    limits: [[['Water-cooled, magnetic bearing', '水冷磁悬浮'], 'WMTC', '25', '41'], [['Water-cooled, magnetic bearing', '水冷磁悬浮'], 'HXEV-TG', '21', '45'], [['Water-cooled, magnetic bearing', '水冷磁悬浮'], 'HXEV-VTX', '21', '40'], [['Water-cooled, magnetic bearing', '水冷磁悬浮'], 'HXEV-Daikin', '25', '40'], [['Water-cooled, magnetic bearing', '水冷磁悬浮'], 'HXEV-TT', '20', '40'],
      [['Water-cooled centrifugal', '水冷离心'], 'WTCC / WTD', '18', '45'], [['Water-cooled centrifugal', '水冷离心'], 'HTS', '15–20', '45'], [['Water-cooled centrifugal', '水冷离心'], 'WLT', '18', '40'], [['Water-cooled centrifugal', '水冷离心'], 'WDC', '18', '50'], [['Water-cooled centrifugal (two-stage)', '水冷离心（两级）'], 'WTCV', '30', '57'],
      [['Air-cooled screw', '风冷螺杆'], 'UAA-MV3', '35', '50'], [['Air-cooled screw', '风冷螺杆'], 'EWAH-TZ D', '30', '55'], [['Air-cooled magnetic bearing', '风冷磁悬浮'], 'UXEV (R-134a)', '21', '44'], [['Air-cooled magnetic bearing', '风冷磁悬浮'], 'UXEV (HFO)', '30', '45']],
    /* part load of a 1,320 RT magnetic-bearing chiller at data-centre conditions: evaporator 30 → 20 °C, condenser water entering 30.6 °C (constant): [load %, COP, kW/RT] */
    partLoad: [[100, 11.31, .3111], [90, 12.04, .2921], [80, 12.72, .2766], [70, 13.35, .2634], [60, 13.80, .2548], [50, 14.01, .2510], [40, 14.74, .2386], [30, 15.89, .2213], [20, 15.31, .2297], [10, 11.45, .3071]],
    /* instrumentation: [measurement, instrument, accuracy, what it gives] */
    instr: [
      [['Chilled-water supply and return temperature', '冷冻水供回水温度'], ['matched RTD pair (Pt100 class A or better) in thermowells', '配对铂电阻（Pt100 A级或更高）装于套管内'], ['± 0.1 K as a calibrated pair', '配对校准±0.1 K'], ['ΔT → cooling load, COP', 'ΔT → 冷负荷、COP']],
      [['Chilled-water flow', '冷冻水流量'], ['full-bore electromagnetic flow meter, straight runs ≥ 5 D before, 3 D after', '满管电磁流量计，前直管≥5D、后≥3D'], ['± 0.5 % of reading', '读数±0.5%'], ['cooling load = flow × 4.186 × ΔT', '冷负荷=流量×4.186×ΔT']],
      [['Cooling energy per chiller and per hall', '各冷机及各机房冷量'], ['thermal-energy (BTU) meter: calculator + flow + matched sensors', '冷量（BTU）表：积算仪+流量计+配对传感器'], ['EN 1434 class 2', 'EN 1434 2级'], ['kWh of cooling, billing and M&V', '冷量kWh、计费及节能量测量验证']],
      [['Chiller electrical input', '冷机输入电功率'], ['power meter IEC 62053-22 class 0.5S on dedicated CTs, true RMS for VSD drives', 'IEC 62053-22 0.5S级电能表配专用CT，变频负载真有效值'], ['± 0.5 %', '±0.5%'], ['COP, kW/RT', 'COP、kW/RT']],
      [['Pumps, tower fans, air-side fans', '水泵、冷却塔风机、末端风机'], ['class-1 meters or the VFD power reading', '1级电能表或变频器功率读数'], ['± 1–2 %', '±1–2%'], ['plant kW/RT, CLF', '冷站kW/RT、CLF']],
      [['Condenser-water temperatures', '冷却水温度'], ['RTD pair', '铂电阻配对'], ['± 0.1–0.2 K', '±0.1–0.2 K'], ['lift, tower approach', '提升温差、冷却塔逼近度']],
      [['Outdoor dry-bulb and humidity', '室外干球温度与湿度'], ['aspirated, shaded T / RH sensor → wet-bulb', '强制通风遮阳温湿度传感器→湿球'], ['± 0.2 K, ± 2 % RH', '±0.2 K、±2% RH'], ['tower approach, economiser, chiller reset', '冷却塔逼近度、自然冷却、冷机重设']],
      [['Differential pressure', '压差'], ['DP transmitter at the index circuit', '最不利环路压差变送器'], ['± 0.25 % of span', '量程±0.25%'], ['variable-flow pump control', '变流量水泵控制']],
      [['Make-up and blowdown water, conductivity', '补水、排污水量及电导率'], ['pulse water meters + conductivity analyser', '脉冲水表+电导率分析仪'], ['± 1–2 %', '±1–2%'], ['WUE, cycles of concentration', 'WUE、浓缩倍数']],
      [['Refrigerant leak', '冷媒泄漏'], ['infrared or semiconductor detector in the plant room', '冷机房红外或半导体探测器'], ['alarm ≤ 25–50 % of the practical limit', '报警≤实用限值的25–50%'], ['safety (ASHRAE 15, EN 378)', '安全（ASHRAE 15、EN 378）']],
      [['IT energy', 'IT能耗'], ['UPS output or rack PDU meters (PUE category 2–3)', 'UPS输出或机柜PDU计量（PUE第2–3类）'], ['± 1 %', '±1%'], ['PUE, CLF', 'PUE、CLF']],
      [['Rack inlet air', '机柜进风'], ['sensors at three heights on the rack front', '机柜正面三个高度的传感器'], ['± 0.5 K', '±0.5 K'], ['ASHRAE envelope compliance, set-point reset', 'ASHRAE范围符合性、设定值重设']]
    ],
    /* Indonesian chiller plants (manufacturer references, clients not named): [site, year, chillers, kW/RT (≤), note] */
    refs: [
      [['Bogor (Citeureup) — colocation, Tier III, 28 MW', '茂物（Citeureup）——托管，Tier III，28 MW'], '2021', ['4 × 620 RT water-cooled, magnetic bearing; 72 FCU, 16 AHU', '4台620 RT水冷磁悬浮；72台FCU、16台AHU'], .45, ['Green Mark Platinum', 'Green Mark白金级']],
      [['Cikarang — hyperscale, Tier III', '芝卡朗——超大规模，Tier III'], '2021', ['4 × 665 RT water-cooled, magnetic bearing; 62 FCU', '4台665 RT水冷磁悬浮；62台FCU'], .37, ['', '']],
      [['Cikarang — enterprise (financial), Tier III, 28 MW', '芝卡朗——企业（金融），Tier III，28 MW'], '2023', ['3 × 750 RT water-cooled, magnetic bearing', '3台750 RT水冷磁悬浮'], .45, ['', '']],
      [['Cikarang — hyperscale, Tier III, 120 MW', '芝卡朗——超大规模，Tier III，120 MW'], '2026', ['42 × 550 RT air-cooled screw; 102 FCU, 18 AHU', '42台550 RT风冷螺杆；102台FCU、18台AHU'], .8, ['', '']],
      [['Karawang — enterprise (financial), Tier IV, 6 MW', '卡拉旺——企业（金融），Tier IV，6 MW'], '2025', ['4 × 300 RT air-cooled screw; 40 FCU, 8 AHU', '4台300 RT风冷螺杆；40台FCU、8台AHU'], 1.06, ['', '']],
      [['South Jakarta — colocation, Tier III, 15 MW', '南雅加达——托管，Tier III，15 MW'], ['2026 (under construction)', '2026（在建）'], ['10 × 130 RT air-cooled magnetic bearing (30 in three phases)', '10台130 RT风冷磁悬浮（三期共30台）'], .8, ['', '']],
      [['Malaysia — 12 MW IT, prefabricated plant', '马来西亚——12 MW IT，预制冷站'], '–', ['1,300 RT magnetic bearing in a 12 × 4.2 × 4.2 m module (towers separate)', '1,300 RT磁悬浮装于12×4.2×4.2 m模块（冷却塔另设）'], .31, ['at 20 °C chilled water', '20 °C冷冻水工况']]
    ],
    /* manufacturer line-up: [family, type, refrigerant, capacity, COP / IPLV] */
    lineup: [
      ['WMTC', ['Water-cooled, magnetic bearing, two-stage', '水冷磁悬浮，两级'], 'R-1233zd(E)', '300–1,900 RT', '7.3–7.5 / 11.8–11.9'],
      ['HXEV-Daikin (WME)', ['Water-cooled, magnetic bearing (data-centre focus)', '水冷磁悬浮（数据中心专用）'], 'R-134a, R-1234ze', '400–2,800 RT', '6.8 / 11.4'],
      ['HXEV-TT | -TG | -VTX | -CMW', ['Water-cooled, magnetic bearing', '水冷磁悬浮'], 'R-134a, R-1234ze', '90–1,300 RT', '6.8–7.3 / 11.8–12'],
      ['WTCV', ['Water-cooled centrifugal, two-stage, oil bearing (extreme conditions)', '水冷离心，两级，油轴承（极端工况）'], 'R-1234ze, R-515B, R-513A, R-134a', '500–3,000 RT', ['6.8 / 11.0 (9.7 at DC condition)', '6.8/11.0（数据中心工况9.7）']],
      ['WTCC | WTD | WLT | HTS | HTC', ['Water-cooled centrifugal, oil bearing', '水冷离心，油轴承'], 'R-134a, R-513A, R-1233zd(E)', '400–3,500 RT', '6.6–7.3'],
      ['UXEV-ST3 | -ST9', ['Air-cooled, magnetic bearing (data-centre focus)', '风冷磁悬浮（数据中心专用）'], 'R-134a, R-1234ze', '90–480 RT', ['3.4–3.6 / 6.0–7.0 (4.5–4.8 at DC condition)', '3.4–3.6/6.0–7.0（数据中心工况4.5–4.8）']],
      ['EWAD | EWAH | EWAS-TZ D', ['Air-cooled screw, inverter, four efficiency classes', '风冷螺杆，变频，四个能效等级'], 'R-134a, R-1234ze, R-513A', '60–550 RT', '2.9–3.7 / 4.7–6.6'],
      ['UAA-CV', ['Air-cooled', '风冷'], 'R-134a, R-513A', '102–466 RT', '≈ 3.1']
    ],
    /* liquid cooling with the chilled-water plant (manufacturer reference design) */
    liquid: {
      split: ['≈ 65–70 % of the server heat goes to the cold plates (technology loop), ≈ 30–35 % stays air-cooled', '约65–70%服务器热量进入冷板（技术环路），约30–35%仍需风冷'],
      fws: ['Facility-water classes W17, W28, W32, W40, W45 (°C supply to the CDU); hyperscale CDUs ≈ 1 MW with facility water 22 → 32 °C', '设施水等级W17、W28、W32、W40、W45（至CDU供水温度）；超大规模CDU约1 MW，设施水22→32 °C'],
      design: ['Reference hybrid design: CDUs 60 % on closed-circuit coolers (facility water 32 → 44 °C, N+1, 2,700 kW each); fan walls 40 % on chilled water 19 → 27 °C (supply air 24 °C, hot aisle 34.5 °C) from water-cooled chillers (condenser 34.5 → 40 °C) or, where water is short, air-cooled chillers (N+2)', '参考混合设计：CDU承担60%，由闭式冷却器供水（设施水32→44 °C，N+1，每台2,700 kW）；风墙承担40%，冷冻水19→27 °C（送风24 °C，热通道34.5 °C），由水冷冷机（冷却水34.5→40 °C）或缺水时由风冷冷机（N+2）供冷']
    },
    /* chiller COP at given conditions (full load from the Carnot COP × eta, part load from the measured curve above; flooded or falling-film evaporator 1 K, condenser water range 5.5 K + 1 K, air-cooled condensing 14 K above ambient) */
    cop: function (k, chws, tc, load) {
      var c = D.coolEq.cls.filter(function (x) { return x.k === k; })[0] || D.coolEq.cls[0], L = Math.max(10, Math.min(100, +load || 100));
      var tev = chws - 1, tcond = c.air ? tc + 14 : tc + 6.5, lift = Math.max(8, tcond - tev), carnot = (tev + 273.15) / lift;
      var pts = D.coolEq.partLoad, f = 1;
      for (var i = 0; i < pts.length - 1; i++) if (L <= pts[i][0] && L >= pts[i + 1][0]) { var a = pts[i], b = pts[i + 1], r = (a[0] - L) / (a[0] - b[0]); f = (a[1] + (b[1] - a[1]) * r) / pts[0][1]; }
      var pl = 1 + c.pl * (f - 1), full = c.eta * carnot, cop = Math.min(c.air ? 8 : 16, full * pl);
      return { cls: c, tev: tev, tcond: tcond, lift: lift, carnot: carnot, eta: c.eta, full: Math.min(c.air ? 8 : 16, full), pl: pl, cop: cop, kwrt: 3.517 / cop, eer: 3.412 * cop };
    },
    /* ASHRAE 90.1-2019 minimum chiller efficiency (Path A full load | IPLV) for comparison */
    ashrae: [[['Water-cooled ≥ 600 RT', '水冷≥600 RT'], '≤ 0.560 kW/RT (COP ≥ 6.28)', '≤ 0.500 kW/RT (≥ 7.03)'], [['Air-cooled ≥ 150 RT', '风冷≥150 RT'], 'EER ≥ 10.1 (COP ≥ 2.96)', 'IPLV ≥ 14.0 (≥ 4.10)']]
  };
})(typeof window !== 'undefined' ? window : globalThis);
