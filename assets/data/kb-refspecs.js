/* Real reference projects — structured technical parameters and findings by facility type.
 * Publicly reported values only (operator releases, trade press, datasheets); null = not published.
 * spec: itMW (campus / planned IT MW), firstMW (first phase), racks, kw [min, max] kW/rack, kwAvg (derived = IT ÷ racks),
 *       pue + pueNote, tier (Uptime level or null), tierTxt, cool (AIR | CHW | DLC | EVAP | SEA), coolTxt, power, area, other, srcs.
 * Figures change as projects evolve — verify before use. */
(function (g) {
  var D = g.DCDB;
  function S(id, spec) { var r = D.references.filter(function (x) { return x.id === id; })[0]; if (r) r.spec = spec; }
  S('R01', { itMW: 73, firstMW: 36, tier: 4, tierTxt: ['Uptime Tier IV (Design and Constructed Facility); Tier IV Gold operational sustainability for JK5 hall 5A', 'Uptime Tier IV（设计及建成设施认证）；JK5 5A机房获Tier IV金级运营认证'],
    cool: 'CHW', coolTxt: ['Chilled water; JK6 (36 MW, June 2025) AI-ready with liquid cooling', '冷冻水；JK6（36 MW，2025年6月）为AI就绪并配液冷'], power: ['PLN; campus plan to 300 MW and ≈ 85,000 m² at full build-out (reported)', 'PLN供电；园区规划最终约300 MW、约85,000 m²（报道）'],
    srcs: ['https://dci-indonesia.com/news/dci-indonesia-launches-ai-ready-jk6-with-36-mw-capacity', 'https://dci-indonesia.com/news/dci-indonesia-sets-a-new-industry-benchmark-as-the-first-in-southeast-asia-to-achieve-tier-iv-tcos-gold-certification-from-uptime-institute'] });
  S('R02', { itMW: 500, firstMW: 120, kw: [120, 500], pue: 1.3, pueNote: ['planning-database value, unconfirmed', '规划数据库数值，未经确认'], tier: 3, tierTxt: ['Uptime Tier III design & facility (operator); NVIDIA DGX-Ready colocation', 'Uptime Tier III设计及设施（运营商）；NVIDIA DGX-Ready托管'],
    cool: 'DLC', coolTxt: ['Direct-to-chip liquid cooling; phase 1 up to 120 kW/rack, building 1 designed for up to 500 kW/rack', '冷板液冷；一期每柜最高120 kW，1号楼按每柜最高500 kW设计'], power: ['845 MVA secured from PLN; renewable-powered campus (reported)', '已从PLN获得845 MVA；园区以可再生能源供电（报道）'],
    srcs: ['https://datacentremagazine.com/news/bdx-data-centers-breaks-ground-on-cgk4-campus-in-indonesia', 'https://www.intelligentcio.com/apac/2024/08/01/bdx-data-centers-launches-first-phase-of-500mw-renewable-powered-ai-campus-in-indonesia/'] });
  S('R03', { itMW: 45, firstMW: 15.2, kw: [5, 15], tier: null, tierTxt: ['Designed “Tier IV-ready” (no certificate found)', '按“Tier IV就绪”设计（未见认证）'], cool: 'CHW', coolTxt: ['Water-cooled “cooling wall”, N+1, side/down flow (≈ 20 % more efficient, operator)', '水冷“冷却墙”，N+1，侧/下送风（运营商称能效提升约20%）'],
    power: ['Dual power path; UPS and generators N+1; 3 buildings × 15.2 MW', '双路供电；UPS及发电机N+1；3栋×15.2 MW'], area: ['18,000 m² IT space at full build-out', '全部建成后IT面积18,000 m²'],
    srcs: ['https://services.global.ntt/-/media/ntt/global/insights-and-resources/brochures/jakarta-3-data-center-brochure.pdf'] });
  S('R04', { itMW: 120, cool: 'DLC', coolTxt: ['Direct-to-chip liquid cooling, with flexibility for conventional air cooling', '冷板液冷，并可灵活采用传统风冷'], power: ['Dual PLN grid feeds; full capacity contracted', 'PLN双电网进线；全部容量已签约'],
    other: ['USD 1 bn (≈ USD 8.3 M per MW, derived); modular construction; phase 1 RFS Q4 2026', '投资10亿美元（约830万美元/MW，推算）；模块化建造；一期2026年第四季度投产'], srcs: ['https://w.media/?p=19378', 'https://inet.detik.com/business/d-8223815/pdg-bangun-data-center-hyperscale-120-mw-di-bekasi'] });
  S('R05', { itMW: 72, power: ['PLN power supply agreement (PJBTL) of 511 MVA — Indonesia’s largest for a data center (Kabil campus)', 'PLN购电协议（PJBTL）511 MVA——印尼数据中心最大（卡比尔园区）'], other: ['Three data centers in Nongsa Digital Park; IDR 6.7 trillion (≈ USD 412 M) loan', '农萨数字园区3座数据中心；贷款6.7万亿印尼盾（约4.12亿美元）'],
    srcs: ['https://w.media/dayone-inks-indonesias-largest-power-deal-for-its-batam-data-center/', 'https://www.datacenterdynamics.com/en/news/dayone-secures-412m-loan-for-batam-data-center-campus-in-indonesia/'] });
  S('R06', { itMW: 500, firstMW: 29, other: ['EDGE1 + EDGE2 ≈ 29 MW operating; CGK campus 500 MW scalable to 1 GW, ≈ USD 4.5 bn (≈ USD 9 M per MW, derived)', 'EDGE1+EDGE2约29 MW已运营；CGK园区500 MW，可扩至1 GW，约45亿美元（约900万美元/MW，推算）'], srcs: ['https://w.media/digital-edge-to-invest-us4-5-billion-to-build-500mw-data-center-in-jakarta/'] });
  S('R13', { itMW: 54, firstMW: 18, kw: [40, 100], tier: 3, tierTxt: ['Uptime Tier III design certification (BTM-1)', 'Uptime Tier III设计认证（BTM-1）'], cool: 'DLC', coolTxt: ['Liquid cooling (method not disclosed); NeutraDC design range 40–100 kW/rack', '液冷（未披露方式）；NeutraDC设计范围40–100 kW/柜'],
    power: ['PLN Batam power purchase agreement up to 90 MVA (2025–2028)', 'PLN巴淡购电协议最高90 MVA（2025–2028）'], srcs: ['https://indonesiabusinesspost.com/5559/corporate-affairs/telkom-subsidiary-neutradc-launches-ai-data-center-in-batam-with-18mw-capacity', 'https://www.neutradc.com/news/50737/neutradc-pioneering-the-future-of-high-density-sustainable-data-center-builds'] });
  S('R14', { itMW: 80, firstMW: 20, tier: 4, tierTxt: ['Tier IV national data center', 'Tier IV国家数据中心'], other: ['≈ 25,000 compute cores and up to 40 PB storage', '约25,000个计算核心，最多40 PB存储'] });
  ['R15', 'R16', 'R17'].forEach(function (id) { S(id, { other: ['Cloud region of three availability zones, each with separate power, cooling and networking', '云区域由3个可用区组成，各自独立供电、制冷及网络'] }); });
  S('R18', { itMW: 150, firstMW: 50, pue: 1.15, pueNote: ['design', '设计值'], cool: 'DLC', coolTxt: ['Direct-to-chip liquid cooling (first for AirTrunk) with indirect evaporative cooling', '冷板液冷（AirTrunk首次）+间接蒸发冷却'], power: ['> 1 MW rooftop solar in phase 1', '一期屋顶光伏>1 MW'], area: ['10.3 ha site', '场地10.3 ha'],
    srcs: ['https://digitalnewsasia.com/business/airtrunk-launches-ai-ready-hyperscale-data-centre-johor-bahru'] });
  S('R19', { itMW: 600, firstMW: 300, kw: [120, 132], cool: 'DLC', coolTxt: ['NVIDIA GB200 NVL72 liquid-cooled rack-scale systems', 'NVIDIA GB200 NVL72液冷机架级系统'], power: ['500 MW solar plant + 600 MW grid backup (as reported); park planned to 1,000 MW', '500 MW光伏+600 MW电网备用（报道）；园区规划至1,000 MW'], area: ['664 ha park', '园区664 ha'],
    srcs: ['https://w.media/ytl-power-completes-nvidia-powered-ai-data-centre-in-johor/'] });
  S('R07', { kw: [120, 140], cool: 'DLC', coolTxt: ['GB200 NVL72 racks in a two-storey layout; closed-loop liquid cooling for > 90 % of capacity, very large water-cooled chiller plant, 172 fans', '两层布置的GB200 NVL72机柜；>90%容量闭式液冷，超大型水冷冷机站，172台风机'], area: ['315-acre (≈ 127 ha) site, ≈ 1.2 million ft² (≈ 111,000 m²) under roof', '场地315英亩（约127 ha），建筑约120万平方英尺（约111,000 m²）'],
    srcs: ['https://convergedigest.com/microsoft-unveils-fairwater-ai-data-center-in-wisconsin/'] });
  S('R08', { itMW: 1200, firstMW: 200, kw: [120, 142], cool: 'DLC', coolTxt: ['Closed-loop direct-to-chip, heat rejected by air-cooled heat exchangers (“zero water evaporation”)', '闭式冷板液冷，由风冷换热器散热（“零蒸发”）'], power: ['On-site generation plus grid and West Texas wind', '现场发电+电网及西德州风电'],
    other: ['8 buildings, up to ≈ 400,000 GB200 GPUs; ≈ 421 MW IT operating mid-2026 (Epoch AI estimate)', '8栋，最多约40万颗GB200 GPU；2026年中约421 MW IT投运（Epoch AI估算）'], srcs: ['https://www.rcrwireless.com/20251001/uncategorized/crusoe-ai', 'https://epoch.ai/data/data-centers/satellite-explorer/OpenAIStargateAbilene'] });
  S('R20', { itMW: 5000, firstMW: 2000, power: ['Utility gas plants and solar procured for supply', '采购燃气电厂及光伏供电'] });
  S('R21', { itMW: 1000, firstMW: 200 });
  S('R22', { itMW: 150, other: ['Brownfield conversion of an LCD factory; expandable beyond 250 MW', '液晶面板厂改造；可扩至250 MW以上'] });
  S('R09', { itMW: 150, kw: [100, 130], cool: 'DLC', coolTxt: ['8 liquid-cooled nodes (64 GPUs) per rack with a rack CDU and rear-door heat exchanger', '每柜8个液冷节点（64颗GPU），配机柜CDU及背板换热器'], power: ['Grid request ≈ 150 MW; Tesla Megapack batteries smooth GPU load swings', '电网申请约150 MW；特斯拉Megapack电池平抑GPU负荷波动'],
    other: ['≈ 100,000 H100 GPUs installed in 122 days in a former factory', '在原工厂内122天部署约10万颗H100 GPU'], srcs: ['https://glennklockwood.com/garden/systems/colossus'] });
  S('R10', { pue: 1.07, pueNote: ['full load at commissioning', '投运时满载'], cool: 'EVAP', coolTxt: ['100 % outside air with evaporative cooling, no chiller plant; Open Compute servers', '100%室外空气+蒸发冷却，无冷机站；开放计算服务器'] });
  S('R11', { cool: 'SEA', coolTxt: ['Seawater cooling through the paper-mill tunnel; waste heat to district heating', '经原造纸厂隧道引海水冷却；余热用于区域供暖'] });
  S('R12', { racks: null, cool: 'AIR', coolTxt: ['Cave tunnels (> 30,000 m²) using natural cool air; prefabricated T-Block modules', '山洞隧道（>30,000 m²）利用自然冷空气；预制T-Block模块'], other: ['≈ 50,000 servers', '约50,000台服务器'] });

  /* additional real projects: edge, modular, enterprise and colocation examples in Indonesia */
  [{ id: 'R23', kind: 'real', type: 'COLO', en: 'Digital Edge — EDGE2 Jakarta (Kuningan)', zh: 'Digital Edge——EDGE2雅加达（库宁安）', mw: 23, country: 'ID', loc: ['Kuningan, South Jakarta, Indonesia', '印尼南雅加达库宁安'], status: ['Operating since Feb 2024', '2024年2月起运营'],
      facts: [['23 MW IT and more than 3,400 racks in downtown Jakarta; annualised PUE 1.24 (operator).', '雅加达市中心23 MW IT、3,400余个机柜；年均PUE 1.24（运营商）。'], ['Liquid-cooling capable for high-density deployments; four diverse entry points and 50+ carriers; LEED Gold target.', '可支持液冷高密度部署；4个独立进线点、50余家运营商；目标LEED金级。']],
      src: 'https://www.digitaledgedc.com/resources/newsroom/digital-edge-announces-availability-of-23-mw-data-center-in-downtown-jakarta/',
      spec: { itMW: 23, racks: 3400, pue: 1.24, pueNote: ['annualised (operator)', '年均（运营商）'], cool: 'CHW', coolTxt: ['Air cooling with liquid-cooling capability for high-density racks', '风冷，高密度机柜可采用液冷'], other: ['4 diverse points of entry, 50+ carriers; LEED Gold target', '4个独立进线点，50余家运营商；目标LEED金级'] } },
    { id: 'R24', kind: 'real', type: 'EDGE', en: 'Telkom neuCentrIX — edge data center network', zh: 'Telkom neuCentrIX——边缘数据中心网络', mw: 6, country: 'ID', loc: ['18–20 cities from Medan to Banjarmasin, Indonesia', '印尼棉兰至马辰等18–20个城市'], status: ['Operating; expanding', '运营中，持续扩展'],
      facts: [['Distributed edge sites: ≈ 1,900 racks and ≈ 6 MW in total across the network (reported).', '分布式边缘站点：全网约1,900个机柜、约6 MW（报道）。'], ['Example site: neuCentrIX Ulin Banjarmasin with 29 racks, Tier II; mini sites added across Sumatra.', '示例：马辰乌林站点29个机柜，Tier II；苏门答腊持续新增小型站点。']],
      src: 'https://www.telkom.co.id/sites/news-resources/en_US/news/strengthening-data-platform,-telkom-introduces-data-center-neucentrix-ulin-banjarmasin-1305',
      spec: { itMW: 6, racks: 1900, tier: 2, tierTxt: ['Tier II per site (example Ulin Banjarmasin)', '单站Tier II（如乌林站点）'], cool: 'AIR', coolTxt: ['Small rooms with precision air conditioning', '小型机房，精密空调'], other: ['≈ 18–20 sites; 29 racks at Ulin Banjarmasin', '约18–20个站点；乌林站点29个机柜'], srcs: ['https://www.datacenterdynamics.com/en/news/telkom-indonesia-opens-new-data-center-in-banjarmasin-indonesia/'] } },
    { id: 'R25', kind: 'real', type: 'MOD', en: 'Space DC — JAK2 (containerised prefabricated)', zh: 'Space DC——JAK2（集装箱式预制）', mw: 1.45, country: 'ID', loc: ['Jakarta, Indonesia', '印尼雅加达'], status: ['Operating (2021)', '运营中（2021年）'],
      facts: [['1.45 MW facility built with containerised, prefabricated techniques; average design density 3.8 kW per rack.', '采用集装箱式预制技术建造的1.45 MW设施；平均设计密度每柜3.8 kW。'], ['Uptime Tier III certified.', '获Uptime Tier III认证。']],
      src: 'https://publication.datacentremagazine.com/data-centre-magazine-june-2021/0191650001688384958/p248',
      spec: { itMW: 1.45, kw: [3.8, 3.8], tier: 3, tierTxt: ['Uptime Tier III', 'Uptime Tier III'], cool: 'AIR', coolTxt: ['Containerised modules with integrated cooling', '集装箱模块，集成制冷'] } },
    { id: 'R26', kind: 'real', type: 'MOD', en: 'Huawei prefabricated modular data center — 3 Indonesia (Malang)', zh: '华为预制模块化数据中心——3 Indonesia（玛琅）', mw: null, country: 'ID', loc: ['Malang, East Java, Indonesia', '印尼东爪哇玛琅'], status: ['Operating (2020)', '运营中（2020年）'],
      facts: [['Prefabricated modular data center for a mobile operator; build time cut from ≈ 3 months to 40 days (operator statement).', '为移动运营商建设的预制模块化数据中心；工期由约3个月缩短至40天（运营商表述）。']],
      src: 'https://ekonomi.republika.co.id/berita/qbymmj2417000/gunakan-solusi-modular-huawei-3-bangun-data-center-baru',
      spec: { cool: 'AIR', coolTxt: ['Factory-built modules with integrated cooling, power and monitoring', '工厂预制模块，集成制冷、供电及监控'], other: ['40-day site delivery', '现场交付40天'] } },
    { id: 'R27', kind: 'real', type: 'ENT', en: 'Bank Indonesia — data center (Tier IV)', zh: '印尼央行——数据中心（Tier IV）', mw: null, country: 'ID', loc: ['Indonesia', '印尼'], status: ['Tier IV certification reported 2025', '2025年报道获Tier IV认证'],
      facts: [['Central-bank data center built by Adhi Karya; Tier IV certification reported, described as the second-largest of its kind in Asia.', '由Adhi Karya建设的央行数据中心；报道获Tier IV认证，称为亚洲同类第二大。']],
      src: 'https://industri.kontan.co.id/news/adhi-raih-sertifikasi-tier-iv-untuk-proyek-data-center-bi-terbesar-kedua-di-asia',
      spec: { tier: 4, tierTxt: ['Tier IV (reported)', 'Tier IV（报道）'], other: ['Owner-operated, mission-critical financial infrastructure', '业主自营的关键任务金融基础设施'] } },
    { id: 'R28', kind: 'real', type: 'ENT', en: 'Bank Central Asia (BCA) — enterprise data centers', zh: '中亚银行（BCA）——企业数据中心', mw: null, country: 'ID', loc: ['Jakarta, Surabaya and Cibitung, Indonesia', '印尼雅加达、泗水及芝比通'], status: ['Operating (multi-site)', '运营中（多站点）'],
      facts: [['Data center operation at Menara BCA, Wisma Asia 2, Grha Asia Surabaya and Grha Asia Cibitung certified to ISO 9001; ISO/IEC 27001 and ISO/IEC 20000-1 for data center and IT operation services.', 'Menara BCA、Wisma Asia 2、Grha Asia泗水及芝比通的数据中心运营获ISO 9001认证；数据中心及IT运营服务获ISO/IEC 27001及ISO/IEC 20000-1认证。']],
      src: 'https://www.bsigroup.com/en-US/products-and-services/assessment-and-certification/validation-and-verification/client-directory-certificate/ITMS 775326',
      spec: { cool: 'CHW', other: ['Primary and secondary sites; certifications focus on operations (ISO 9001, ISO/IEC 27001, ISO/IEC 20000-1)', '主备多站点；认证侧重运营（ISO 9001、ISO/IEC 27001、ISO/IEC 20000-1）'] } },
    { id: 'R29', kind: 'real', type: 'COLO', en: 'EdgeConneX — Jakarta campus (incl. former GTN Cikarang)', zh: 'EdgeConneX——雅加达园区（含原GTN芝加朗）', mw: 200, country: 'ID', loc: ['Greater Jakarta (Bekasi–Cikarang), Indonesia', '印尼大雅加达（勿加泗-芝加朗）'], status: ['Operating; expanding', '运营中，扩建中'],
      facts: [['Campus planned up to 200 MW; 6 MW existing facility with 15,000 m² space (datasheet).', '园区规划最高200 MW；现有设施6 MW、15,000 m²（数据表）。'], ['Acquired GTN Cikarang: Uptime Tier III certified since 2016, ≈ 7 MW, 50+ customers.', '收购GTN芝加朗：2016年起获Uptime Tier III认证，约7 MW，50余家客户。']],
      src: 'https://www.edgeconnex.com/wp-content/uploads/2026/03/Jakarta-Data-Sheet-Q1-update.pdf',
      spec: { itMW: 200, firstMW: 6, tier: 3, tierTxt: ['Uptime Tier III (former GTN site)', 'Uptime Tier III（原GTN站点）'], area: ['15,000 m² existing space', '现有面积15,000 m²'] } }
  ].forEach(function (r) { D.references.push(r); });

  /* findings by facility type: what the real projects say (EN / ZH) */
  D.typeFindings = {
    EDGE: ['Edge in Indonesia means many small rooms close to users: Telkom neuCentrIX runs ≈ 1,900 racks over 18–20 cities for ≈ 6 MW in total (≈ 3 kW per rack on average; e.g. 29 racks, Tier II, at Ulin Banjarmasin). Plan 0.1–1 MW per site, 3–8 kW/rack, Tier II–III, DX or in-row cooling and remote operation.',
      '印尼的边缘数据中心是大量靠近用户的小型机房：Telkom neuCentrIX在18–20个城市共约1,900个机柜、合计约6 MW（平均每柜约3 kW；如马辰乌林站点29柜、Tier II）。单站规划0.1–1 MW、3–8 kW/柜、Tier II–III、直膨或列间空调并远程运维。'],
    MOD: ['Prefabricated / containerised builds trade flexibility for speed: Space DC JAK2 delivered 1.45 MW at 3.8 kW/rack with Uptime Tier III, and Huawei modules for 3 Indonesia were installed in 40 days instead of ≈ 3 months. Use 0.25–5 MW blocks at 4–15 kW/rack unless AI pods are added.',
      '预制/集装箱式建设以灵活性换取速度：Space DC JAK2以3.8 kW/柜交付1.45 MW并获Uptime Tier III；华为为3 Indonesia提供的模块40天完成安装（原约3个月）。除非加装AI舱，宜采用0.25–5 MW单元、4–15 kW/柜。'],
    ENT: ['Enterprise (bank) data centers are owner-operated and multi-site — BCA runs primary and secondary sites in Jakarta, Surabaya and Cibitung certified on operations (ISO 9001, ISO/IEC 27001, ISO/IEC 20000-1); central-bank infrastructure goes to Tier IV (Bank Indonesia, reported 2025). Typical 0.5–5 MW, 5–10 kW/rack, chilled water, Tier III–IV, with a disaster-recovery site.',
      '企业（银行）数据中心由业主自营并多站点部署——BCA在雅加达、泗水及芝比通设主备站点，运营获ISO 9001、ISO/IEC 27001及ISO/IEC 20000-1认证；央行基础设施达到Tier IV（印尼央行，2025年报道）。典型0.5–5 MW、5–10 kW/柜、冷冻水、Tier III–IV，并设灾备站点。'],
    COLO: ['Jakarta colocation campuses are 23–200 MW: EDGE2 has 23 MW for 3,400+ racks (≈ 6.8 kW/rack average) at an annualised PUE of 1.24; NTT JKT3 45 MW at 5–15 kW/rack with a chilled-water cooling wall; DCI Cibitung 73 MW with Uptime Tier IV. New halls are liquid-cooling-ready for AI tenants (DCI JK6, EDGE2).',
      '雅加达托管园区规模为23–200 MW：EDGE2以23 MW承载3,400余个机柜（平均约6.8 kW/柜），年均PUE 1.24；NTT JKT3为45 MW、5–15 kW/柜，采用冷冻水冷却墙；DCI芝比通73 MW并获Uptime Tier IV。新机房均为AI租户预留液冷（DCI JK6、EDGE2）。'],
    WHOLE: ['Wholesale / build-to-suit campuses of 50–120 MW secure PLN capacity well above the IT load: DayOne Batam 72 MW with a 511 MVA PLN agreement; NeutraDC Nxera Batam 54 MW with up to 90 MVA, Tier III design and liquid cooling at 40–100 kW/rack.',
      '批发/定制园区规模为50–120 MW，PLN容量远高于IT负载：DayOne巴淡72 MW，PLN协议511 MVA；NeutraDC Nxera巴淡54 MW，最高90 MVA，Tier III设计，液冷40–100 kW/柜。'],
    HYPER: ['Hyperscale campuses are 100–200 MW and more: PDG JC3 120 MW with dual PLN feeds and direct-to-chip cooling (USD 1 bn ≈ USD 8.3 M/MW); AirTrunk JHB1 150 MW at a design PUE of 1.15 with liquid + indirect evaporative cooling; cloud regions in Jakarta (AWS, Microsoft, Google) are built as three availability zones.',
      '超大规模园区达100–200 MW以上：PDG JC3 120 MW，PLN双进线、冷板液冷（10亿美元≈830万美元/MW）；AirTrunk JHB1 150 MW，设计PUE 1.15，液冷+间接蒸发冷却；雅加达云区域（AWS、微软、谷歌）均按3个可用区建设。'],
    AI: ['AI factories are planned at hundreds of MW to GW (BDx CGK4 500 MW with 845 MVA; YTL Kulai 600 MW park; Stargate Abilene 1.2 GW). Racks are GB200 / GB300 NVL72-class at 120–142 kW with closed-loop direct-to-chip cooling (Abilene: air-cooled heat exchangers, zero evaporation; Fairwater: > 90 % liquid); next generations reach 500 kW/rack (BDx). Batteries buffer GPU swings (xAI Colossus).',
      'AI算力中心规划规模为数百MW至GW级（BDx CGK4 500 MW、845 MVA；YTL Kulai园区600 MW；Stargate Abilene 1.2 GW）。机柜为GB200/GB300 NVL72级120–142 kW，采用闭式冷板液冷（Abilene：风冷换热器、零蒸发；Fairwater：>90%液冷）；下一代可达500 kW/柜（BDx）。电池缓冲GPU负荷波动（xAI Colossus）。'],
    GOV: ['Government / sovereign: PDN Cikarang is Tier IV, 20 MW expandable to 80 MW, with ≈ 25,000 cores and 40 PB of storage; government data should be hosted at SNI 8799 Strata III / Tier III or above.',
      '政府/主权：PDN芝加朗为Tier IV，20 MW可扩至80 MW，约25,000个计算核心及40 PB存储；政府数据应托管于SNI 8799 Strata III/Tier III及以上设施。']
  };
})(typeof window !== 'undefined' ? window : globalThis);
