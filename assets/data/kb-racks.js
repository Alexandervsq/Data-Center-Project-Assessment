/* IT rack platform & cabinet reference database.
 * kw = design (nominal) kW per rack used for planning; kwPeak = peak / provisioning value.
 * cool: AIR · RDHX (air + rear-door HX) · DLC (direct-to-chip liquid) · IMM (immersion)
 * liq = share of heat to liquid. Figures from OEM / vendor documentation and trade press —
 * confirm with the IT vendor's site-readiness guide before freezing the design. */
(function (g) {
  var D = g.DCDB || (g.DCDB = { systems: [], equipment: [] });

  D.platforms = [
    { id: 'NV-GB300', cat: 'AI', vendor: 'NVIDIA (HPE, Dell, Supermicro, Foxconn, Inventec …)', year: 2025,
      en: 'NVIDIA GB300 NVL72 (Blackwell Ultra) rack-scale system', zh: 'NVIDIA GB300 NVL72（Blackwell Ultra）机架级系统',
      kw: 135, kwPeak: 155, cool: 'DLC', liq: 0.9, w: 600, d: 1068, u: 48, kg: 1500, gpu: 72,
      note: ['72 GPUs + 36 Grace CPUs in one NVLink domain; ≈ 132–142 kW nominal, ≈ 155 kW peak; OEMs suggest provisioning ≈ 190 kW busway per rack; 50 V DC busbar fed by 8 × 33 kW power shelves; in-row CDU (e.g. 1.3 MW serves ≈ 8 racks).',
             '单一NVLink域内72颗GPU+36颗Grace CPU；额定约132–142 kW，峰值约155 kW；OEM建议每柜按约190 kW配置母线；由8个33 kW电源架供电至50 V直流母排；列间CDU（如1.3 MW可服务约8柜）。'],
      src: 'https://www.hpe.com/us/en/collaterals/collateral.a50009244enw.html' },
    { id: 'NV-GB200', cat: 'AI', vendor: 'NVIDIA (OEM / ODM)', year: 2024,
      en: 'NVIDIA GB200 NVL72 (Blackwell) rack-scale system', zh: 'NVIDIA GB200 NVL72（Blackwell）机架级系统',
      kw: 132, kwPeak: 145, cool: 'DLC', liq: 0.85, w: 600, d: 1068, u: 48, kg: 1360, gpu: 72,
      note: ['First-generation NVL72; ≈ 120–132 kW design, ≈ 145 kW peak; direct-to-chip liquid cooling with residual air.', '第一代NVL72；设计约120–132 kW，峰值约145 kW；冷板液冷并有余热风冷。'],
      src: 'https://www.tomshardware.com/tech-industry/artificial-intelligence/huaweis-new-ai-cloudmatrix-cluster-beats-nvidias-gb200-by-brute-force-uses-4x-the-power' },
    { id: 'NV-VR', cat: 'AI', vendor: 'NVIDIA (announced)', year: 2026, provisional: true,
      en: 'NVIDIA Vera Rubin NVL144 / VR200 (next generation)', zh: 'NVIDIA Vera Rubin NVL144 / VR200（下一代）',
      kw: 190, kwPeak: 230, cool: 'DLC', liq: 0.95, w: 600, d: 1068, u: 48, kg: 1700, gpu: 72,
      note: ['Provisional: sources range from ≈ 120–130 kW to ≈ 190–230 kW per rack; plan facilities for ≥ 200 kW racks and 45 °C-class warm-water cooling.', '暂定：各来源从约120–130 kW到约190–230 kW/柜不等；设施宜按≥200 kW机柜及45 °C级温水冷却规划。'],
      src: 'https://www.datacenterdynamics.com/en/news/nvidia-prepares-data-center-industry-for-1mw-racks-and-800-volt-dc-power-architectures/' },
    { id: 'NV-KYBER', cat: 'AI', vendor: 'NVIDIA (roadmap)', year: 2027, provisional: true,
      en: 'NVIDIA Rubin Ultra NVL576 “Kyber” (roadmap)', zh: 'NVIDIA Rubin Ultra NVL576“Kyber”（路线图）',
      kw: 600, kwPeak: 600, cool: 'DLC', liq: 0.98, w: 1200, d: 1200, u: 48, kg: 3000, gpu: 576,
      note: ['Roadmap: ≈ 600 kW per rack incl. power/cooling sidecar (≈ 2 rack footprints) and 800 V DC distribution; timing reported to slip to 2027–2028.', '路线图：每柜约600 kW（含电源/冷却侧柜，约占2个机柜位）及800 V直流配电；报道称可能推迟至2027–2028年。'],
      src: 'https://www.sdxcentral.com/news/nvidia-pushes-kyber-release-to-2028-following-manufacturing-concerns-report/' },
    { id: 'NV-B300L', cat: 'AI', vendor: 'NVIDIA HGX (Gigabyte, Supermicro, Dell …)', year: 2025,
      en: 'NVIDIA HGX B300 8-GPU servers — liquid-cooled rack', zh: 'NVIDIA HGX B300 8卡服务器——液冷机柜',
      kw: 100, kwPeak: 110, cool: 'DLC', liq: 0.85, w: 600, d: 1200, u: 48, kg: 1300, gpu: 64,
      note: ['8 × 8-GPU nodes per rack; OEM liquid-cooled racks list up to ≈ 109 kW with in-rack CDU.', '每柜8台8卡节点；OEM液冷机柜标称可达约109 kW，配机架式CDU。'],
      src: 'https://gigabyte.com/Enterprise/GIGAPOD-Rack-Scale/AI-DLC-Rack_NVIDIA-HGX-B300' },
    { id: 'NV-B300A', cat: 'AI', vendor: 'NVIDIA DGX / HGX', year: 2025,
      en: 'NVIDIA DGX/HGX B300 — air-cooled (4 systems/rack, rear-door HX)', zh: 'NVIDIA DGX/HGX B300——风冷（每柜4台，配背板换热）',
      kw: 58, kwPeak: 62, cool: 'RDHX', liq: 0.6, w: 600, d: 1200, u: 48, kg: 1100, gpu: 32,
      note: ['DGX B300 ≈ 14.5 kW each (10U, air ≈ 1,500 CFM); 4 per rack ≈ 58 kW requires rear-door heat exchangers or in-row cooling; 2 per rack (≈ 30 kW) fits air-only halls.', 'DGX B300每台约14.5 kW（10U，风量约1,500 CFM）；每柜4台约58 kW需背板换热或列间空调；每柜2台（约30 kW）可用于纯风冷机房。'],
      src: 'https://www.amcompute.com/site-evaluation/b300-gb300-power-and-cooling' },
    { id: 'NV-H200', cat: 'AI', vendor: 'NVIDIA DGX / HGX (Hopper)', year: 2024,
      en: 'NVIDIA DGX/HGX H100–H200 — air-cooled (4 systems/rack)', zh: 'NVIDIA DGX/HGX H100–H200——风冷（每柜4台）',
      kw: 41, kwPeak: 44, cool: 'RDHX', liq: 0.5, w: 600, d: 1200, u: 48, kg: 950, gpu: 32,
      note: ['≈ 10.2 kW per 8-GPU system; ≈ 40 kW per rack typical for Hopper deployments.', '每台8卡系统约10.2 kW；Hopper部署通常约40 kW/柜。'],
      src: 'https://www.datacenterdynamics.com/en/analysis/nvidia-gtc-jensen-huang-data-center-rack-density/' },
    { id: 'AMD-MI355', cat: 'AI', vendor: 'AMD Instinct (OEM)', year: 2025, provisional: true,
      en: 'AMD Instinct MI355X — liquid-cooled 8-GPU nodes', zh: 'AMD Instinct MI355X——液冷8卡节点',
      kw: 110, kwPeak: 125, cool: 'DLC', liq: 0.85, w: 600, d: 1200, u: 48, kg: 1300, gpu: 64,
      note: ['Indicative planning value for 8 liquid-cooled nodes per rack; confirm with OEM rack configuration.', '按每柜8台液冷节点的规划参考值；需与OEM机柜配置确认。'], src: '' },
    { id: 'HW-CM384', cat: 'AI', vendor: 'Huawei Ascend', year: 2025,
      en: 'Huawei CloudMatrix 384 (Ascend 910C, 16 racks)', zh: '华为CloudMatrix 384（昇腾910C，16柜）',
      kw: 35, kwPeak: 45, cool: 'RDHX', liq: 0.5, w: 800, d: 1200, u: 47, kg: 1100, gpu: 24,
      note: ['384 NPUs over 12 compute + 4 network racks; ≈ 559 kW per system (analyst estimate) ≈ 35 kW/rack average, compute racks higher; optical interconnect.', '384颗NPU分布于12个计算柜+4个网络柜；每套约559 kW（分析师估算），平均约35 kW/柜，计算柜更高；光互连。'],
      src: 'https://www.tomshardware.com/tech-industry/artificial-intelligence/huaweis-new-ai-cloudmatrix-cluster-beats-nvidias-gb200-by-brute-force-uses-4x-the-power' },
    { id: 'INF-PCIE', cat: 'AI', vendor: 'NVIDIA L40S / RTX PRO servers (Dell, HPE, Lenovo, Inspur …)', year: 2025,
      en: 'Inference GPU servers (PCIe, 4–8 GPUs per 2U/4U)', zh: '推理GPU服务器（PCIe，每2U/4U 4–8卡）',
      kw: 20, kwPeak: 24, cool: 'AIR', liq: 0, w: 600, d: 1200, u: 48, kg: 800, gpu: 24,
      note: ['Enterprise / edge inference; 5–6 servers per rack ≈ 15–25 kW with hot-aisle containment.', '企业/边缘推理；每柜5–6台约15–25 kW，配热通道封闭。'], src: '' },
    { id: 'GP-2U', cat: 'GP', vendor: 'Dell PowerEdge, HPE ProLiant, Lenovo ThinkSystem, Inspur, Huawei, Supermicro', year: 2025,
      en: 'General-purpose 1U/2U servers (virtualisation, databases)', zh: '通用1U/2U服务器（虚拟化、数据库）',
      kw: 10, kwPeak: 12, cool: 'AIR', liq: 0, w: 600, d: 1200, u: 48, kg: 750, gpu: 0,
      note: ['0.5–1.2 kW per server; 8–15 kW per rack typical of enterprise and retail colocation.', '每台0.5–1.2 kW；企业及零售托管典型每柜8–15 kW。'], src: '' },
    { id: 'GP-HD', cat: 'GP', vendor: 'Multi-node / blade (Dell, HPE, Lenovo, Inspur)', year: 2025,
      en: 'High-density CPU / multi-node / blade', zh: '高密度CPU/多节点/刀片服务器',
      kw: 25, kwPeak: 30, cool: 'AIR', liq: 0, w: 600, d: 1200, u: 48, kg: 950, gpu: 0,
      note: ['20–30 kW per rack; requires containment and high-capacity CRAH / fan walls.', '每柜20–30 kW；需通道封闭及大容量精密空调/风墙。'], src: '' },
    { id: 'OCP-ORV3', cat: 'CLOUD', vendor: 'OCP Open Rack v3 (ODM)', year: 2025,
      en: 'OCP Open Rack v3 cloud rack (21″, 48 V busbar)', zh: 'OCP Open Rack v3云机柜（21英寸，48 V母排）',
      kw: 20, kwPeak: 30, cool: 'AIR', liq: 0, w: 600, d: 1068, u: 44, kg: 1000, gpu: 0,
      note: ['Hyperscale cloud compute; 15–30 kW per rack, power shelves with battery backup units possible.', '超大规模云计算；每柜15–30 kW，可配带电池备份单元的电源架。'], src: 'https://www.opencompute.org/' },
    { id: 'STOR', cat: 'STOR', vendor: 'Dell PowerScale/PowerStore, NetApp, Huawei OceanStor, Pure Storage', year: 2025,
      en: 'Storage arrays / JBOD', zh: '存储阵列/JBOD',
      kw: 8, kwPeak: 10, cool: 'AIR', liq: 0, w: 600, d: 1200, u: 48, kg: 1100, gpu: 0,
      note: ['5–10 kW per rack; heavy (HDD shelves) — check floor loading.', '每柜5–10 kW；较重（硬盘框）——需核查楼面荷载。'], src: '' },
    { id: 'NET', cat: 'NET', vendor: 'Cisco, Arista, Juniper, Huawei, NVIDIA Spectrum/Quantum', year: 2025,
      en: 'Network / spine / core racks', zh: '网络/脊/核心机柜',
      kw: 7, kwPeak: 10, cool: 'AIR', liq: 0, w: 800, d: 1200, u: 48, kg: 700, gpu: 0,
      note: ['800 mm wide for cable management; AI fabrics need many network racks (≈ 10–15% of racks).', '宽800 mm便于理线；AI网络需大量网络机柜（约占10–15%）。'], src: '' },
    { id: 'EDGE', cat: 'EDGE', vendor: 'Edge enclosures (Vertiv, Schneider, Huawei, Delta)', year: 2025,
      en: 'Edge / micro-DC rack', zh: '边缘/微型数据中心机柜',
      kw: 6, kwPeak: 8, cool: 'AIR', liq: 0, w: 600, d: 1100, u: 42, kg: 600, gpu: 0,
      note: ['3–8 kW per rack; integrated cooling/UPS enclosures for small sites.', '每柜3–8 kW；小型站点采用一体化制冷/UPS机柜。'], src: '' }
  ];

  D.cabinets = [
    { id: 'INTEGRATED', brand: 'Supplied with IT system', en: 'Integrated rack-scale cabinet (NVIDIA MGX / Oberon, OCP ORv3) — supplied by the IT vendor', zh: '机架级集成机柜（NVIDIA MGX/Oberon、OCP ORv3）——由IT厂商供货',
      w: [600], d: [1068], u: [48], kg: 1600, note: ['Arrives fully integrated and tested; facility provides power whips/busway, liquid quick-disconnects and floor capacity.', '整柜集成测试后到货；设施提供电源连接/母线、液冷快插接头及楼面承载。'], src: '' },
    { id: 'VERTIV-VR', brand: 'Vertiv', en: 'Vertiv VR Rack (VR3100 / VR3107 / VR3150 / VR3157)', zh: '维谛 VR机柜（VR3100/3107/3150/3157）',
      w: [600, 800], d: [1100, 1200], u: [42, 48], kg: 1360, kgDyn: 1022, note: ['3,000 lb (1,360 kg) static / 2,250 lb (1,022 kg) dynamic per Vertiv specification.', '据维谛规格：静载3,000 lb（1,360 kg）/动载2,250 lb（1,022 kg）。'], src: 'https://www.vertiv.com/en-asia/products-catalog/facilities-enclosures-and-racks/racks-and-containment/vr3100/' },
    { id: 'SE-SXG2', brand: 'Schneider Electric (APC)', en: 'APC NetShelter SX Gen 2', zh: 'APC NetShelter SX第二代',
      w: [600, 750], d: [1070, 1200], u: [42, 45, 48], kg: 1360, note: ['Static ≈ 1,360 kg for standard SKUs; “shock-packaging / AI-HPC ready” variants listed up to 4,000 lb (≈ 1,814 kg) — confirm per SKU.', '标准型号静载约1,360 kg；“防震包装/AI-HPC就绪”型号标称最高4,000 lb（约1,814 kg）——按具体型号确认。'], src: 'https://www.cdw.com/product/schneider-electric-netshelter-sx-server-rack-enclosure-gen-2-shock-packag/9010208' },
    { id: 'RITTAL-VX', brand: 'Rittal', en: 'Rittal VX IT', zh: '威图 VX IT',
      w: [600, 800], d: [1000, 1200], u: [42, 47], kg: 610, note: ['Datasheet static load per UL 2416 ≈ 6,000 N (≈ 610 kg) for standard vented 42U; heavy-duty variants available — verify for AI loads.', '标准42U通风型按UL 2416静载约6,000 N（约610 kg）；有重载型号——AI负载需核实。'], src: 'https://www.rittal.com/pdf-creator/variant/bg-bg/5329111' },
    { id: 'GENERIC', brand: 'Local / regional manufacturers', en: 'EIA-310 cabinet to TPG IT-01 (local or regional fabrication)', zh: '符合TPG IT-01的EIA-310机柜（本地或区域制造）',
      w: [600, 800], d: [1100, 1200], u: [42, 45, 48], kg: 1360, note: ['Specify ≥ 1,360 kg static (≥ 1,800 kg for AI), ≥ 80% perforation, seismic frame where required.', '规定静载≥1,360 kg（AI≥1,800 kg）、开孔率≥80%，必要时采用抗震框架。'], src: '' }
  ];

  /* proposed platform mix per facility type (std = standard racks, hd = high-density racks) */
  D.typeMix = {
    AI:    { std: 'NET', hd: 'NV-GB300', hdShare: 85, why: ['AI factories are built around rack-scale GPU systems; ≈ 10–15% of racks are network/storage.', 'AI算力中心以机架级GPU系统为核心；约10–15%为网络/存储机柜。'] },
    HYPER: { std: 'OCP-ORV3', hd: 'NV-GB300', hdShare: 10, why: ['Cloud regions combine 15–30 kW cloud racks with AI-ready halls (≈ 10% of racks, ≈ 40% of IT load).', '云区域结合15–30 kW云机柜与AI就绪机房（约10%机柜，约40%IT负载）。'] },
    WHOLE: { std: 'GP-HD', hd: 'NV-B300L', hdShare: 15, why: ['Build-to-suit halls for cloud/AI tenants: 20–30 kW base with liquid-ready AI zones (≈ 15% of racks).', '面向云/AI租户的定制机房：20–30 kW基础并设液冷就绪AI区（约15%机柜）。'] },
    COLO:  { std: 'GP-2U', hd: 'NV-B300A', hdShare: 10, why: ['Retail colocation in Jakarta averages 6–10 kW; AI-ready suites (rear-door HX) for ≈ 10% of racks.', '雅加达零售托管平均6–10 kW；约10%机柜为AI就绪包间（背板换热）。'] },
    ENT:   { std: 'GP-2U', hd: 'INF-PCIE', hdShare: 10, why: ['Enterprise IT is mostly virtualised servers; a small GPU inference zone is now common.', '企业IT以虚拟化服务器为主；目前普遍设小型GPU推理区。'] },
    GOV:   { std: 'GP-2U', hd: 'INF-PCIE', hdShare: 10, why: ['Government workloads (e-government, SPBE) on general-purpose servers with sovereign AI inference capacity.', '政府业务（电子政务、SPBE）以通用服务器为主，配主权AI推理能力。'] },
    EDGE:  { std: 'GP-2U', hd: 'INF-PCIE', hdShare: 10, why: ['Edge sites host CDN/5G/IoT servers plus AI inference GPUs close to users.', '边缘站点承载CDN/5G/物联网服务器及靠近用户的AI推理GPU。'] },
    MOD:   { std: 'GP-2U', hd: 'NV-B300A', hdShare: 10, why: ['Prefabricated modules are typically 10–15 kW with optional AI pods.', '预制模块通常10–15 kW，可选AI舱。'] }
  };
})(typeof window !== 'undefined' ? window : globalThis);
