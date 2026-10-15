/* Indonesia regional database — 38 provinces with representative data-center locations.
 * Climate values are indicative design conditions (≈0.4% dry-bulb / design wet-bulb) for
 * planning; verify with BMKG / ASHRAE climatic data and a site survey.
 * cls: TROP = lowland tropical humid · HIGH = tropical highland (≥ ~450 m) · TDRY = tropical savanna (long dry season)
 * seis / flood: qualitative planning hazard (low / med / high) — confirm with SNI 1726:2019 site study & flood maps.
 * land: indicative DC-suitable industrial land, USD/m² (2026) · water: USD/m³ (PDAM / estate) ·
 * capexF: construction cost & logistics factor vs. Greater Jakarta · wage: blended O&M wage index vs. Jakarta.
 * ump: provincial minimum wage 2026, IDR/month (Kemnaker / provincial decrees; "≈" = approximated). */
(function (g) {
  var D = g.DCDB || (g.DCDB = { systems: [], equipment: [] });

  D.idGrids = {
    JAMALI: { en: 'Java–Madura–Bali (JAMALI) 500 kV interconnected grid', zh: '爪哇-马都拉-巴厘（JAMALI）500 kV互联电网', rel: 'high',
      d: ['Largest and most reliable PLN system; 150 kV / 500 kV substations near industrial estates.', 'PLN规模最大、最可靠的电网；工业园区附近有150/500 kV变电站。'] },
    SUM: { en: 'Sumatra interconnected grid (150/275 kV)', zh: '苏门答腊互联电网（150/275 kV）', rel: 'med',
      d: ['Interconnected Aceh–Lampung backbone; geothermal and hydro resources.', '亚齐至楠榜互联主网；地热和水电资源丰富。'] },
    BTM: { en: 'PLN Batam island grid (PT PLN Batam)', zh: '巴淡岛电网（PLN巴淡公司）', rel: 'med',
      d: ['Separate island utility serving Batam; large DC supply agreements (e.g. 90 MVA to NeutraDC Nxera) — confirm available MVA early.', '服务巴淡的独立岛屿电力公司；已有大型数据中心供电协议（如向NeutraDC Nxera供电90 MVA）——应尽早确认可供容量。'] },
    KAL: { en: 'Kalimantan interconnected grid', zh: '加里曼丹互联电网', rel: 'med',
      d: ['Growing interconnection (incl. supply to IKN Nusantara); coal and new renewable additions.', '互联电网持续扩展（含向新首都努桑塔拉供电）；煤电及新增可再生能源。'] },
    SULSEL: { en: 'South Sulawesi (Sulbagsel) grid', zh: '南苏拉威西（Sulbagsel）电网', rel: 'med', d: ['Hydro and wind resources; moderate capacity for large loads.', '水电和风电资源；大负荷承载能力中等。'] },
    SULUT: { en: 'North Sulawesi (Sulbagut) grid', zh: '北苏拉威西（Sulbagut）电网', rel: 'med', d: ['Geothermal resources (Lahendong); limited spare capacity.', '地热资源（拉亨东）；富余容量有限。'] },
    NUSA: { en: 'Nusa Tenggara island systems', zh: '努沙登加拉岛屿电网', rel: 'low', d: ['Isolated island grids; high solar resource; limited capacity for MW-scale loads.', '孤立岛屿电网；太阳能资源好；MW级负荷容量有限。'] },
    MAL: { en: 'Maluku island systems', zh: '马鲁古岛屿电网', rel: 'low', d: ['Small isolated diesel/gas-based systems.', '小型孤立柴油/燃气电网。'] },
    PAP: { en: 'Papua island systems', zh: '巴布亚岛屿电网', rel: 'low', d: ['Isolated systems; logistics and grid capacity are major constraints.', '孤立电网；物流及电网容量为主要制约。'] }
  };

  /* PLN tariffs (non-subsidised, unchanged since 2022; quoted for Q4 2026). Effective = LWBP blended with WBP (K≈1.4) for a flat 24/7 load. */
  D.idTariffs = [
    { id: 'B3TM', en: 'B-3 / TM — business, MV > 200 kVA', zh: 'B-3/中压——商业用电>200 kVA', lwbp: 1114.74, k: 1.4, eff: 1207.6 },
    { id: 'I3TM', en: 'I-3 / TM — industrial, MV > 200 kVA', zh: 'I-3/中压——工业用电>200 kVA', lwbp: 1114.74, k: 1.4, eff: 1207.6 },
    { id: 'I4TT', en: 'I-4 / TT — industrial, HV ≥ 30,000 kVA', zh: 'I-4/高压——工业用电≥30,000 kVA', lwbp: 996.74, k: 1, eff: 996.74 }
  ];
  D.idFx = 17900; /* IDR per USD — BI JISDOR ≈ 17,917 (6 Oct 2026); editable in the tool */
  D.idRec = 35000; /* PLN Renewable Energy Certificate, IDR per MWh (reported 2025 list price) */
  D.idGridEF = 0.79; /* tCO2e/MWh, indicative national average */

  function L(id, en, zh, db, wb, elev, cls, seis, flood, land, water, capexF, wage, hub, note, extra) {
    var o = { id: id, en: en, zh: zh, db: db, wb: wb, elev: elev, cls: cls, seis: seis, flood: flood, land: land, water: water, capexF: capexF, wage: wage, hub: hub, note: note || null };
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  }
  D.idProvinces = [
    { id: 'AC', en: 'Aceh', zh: '亚齐', island: 'Sumatra', grid: 'SUM', ump: 3685616, locs: [
      L('AC-BNA', 'Banda Aceh', '班达亚齐', 34, 27.5, 20, 'TROP', 'high', 'med', 60, 0.6, 1.08, 0.64, 'none', ['High seismic & tsunami exposure — Ie 1.5 and elevated sites.', '地震及海啸风险高——采用Ie 1.5并选择高地。'])] },
    { id: 'SU', en: 'North Sumatra', zh: '北苏门答腊', island: 'Sumatra', grid: 'SUM', ump: 3228949, locs: [
      L('SU-MDN', 'Medan / Kuala Namu', '棉兰/瓜拉纳穆', 34, 27.8, 25, 'TROP', 'med', 'med', 120, 0.7, 1.05, 0.7, 'emerging', ['Regional hub for northern Sumatra; KEK Sei Mangkei nearby.', '北苏门答腊区域枢纽；邻近Sei Mangkei经济特区。'])] },
    { id: 'SB', en: 'West Sumatra', zh: '西苏门答腊', island: 'Sumatra', grid: 'SUM', ump: 3182955, locs: [
      L('SB-PDG', 'Padang', '巴东', 32.5, 27.5, 5, 'TROP', 'high', 'med', 70, 0.6, 1.07, 0.6, 'none', ['Mentawai megathrust exposure — high seismic & tsunami hazard.', '明打威大逆冲断层影响——地震及海啸风险高。'])] },
    { id: 'RI', en: 'Riau', zh: '廖内', island: 'Sumatra', grid: 'SUM', ump: 3780495, locs: [
      L('RI-PKU', 'Pekanbaru', '北干巴鲁', 35, 28, 30, 'TROP', 'low', 'med', 70, 0.6, 1.06, 0.66, 'none', ['Seasonal haze from peat fires — specify air filtration (ePM1) and gas-phase filtration.', '泥炭火灾季节性雾霾——需高效空气过滤（ePM1）及气相过滤。'])] },
    { id: 'KR', en: 'Riau Islands', zh: '廖内群岛', island: 'Riau Islands', grid: 'BTM', ump: 3879520, locs: [
      L('KR-BTM', 'Batam (Nongsa / Kabil)', '巴淡（农萨/卡比尔）', 33.5, 27.5, 30, 'TROP', 'low', 'low', 140, 0.9, 1.0, 0.94, 'major', ['Cross-border hub serving Singapore demand; KEK Nongsa Digital Park incentives; raw-water supply is constrained — prefer water-efficient cooling.', '服务新加坡需求的跨境枢纽；农萨数字园经济特区有优惠政策；原水供应受限——优先节水型制冷。'], { scarce: true, kek: true }),
      L('KR-BTN', 'Bintan', '民丹', 33, 27.5, 20, 'TROP', 'low', 'low', 70, 0.8, 1.04, 0.8, 'emerging', ['Land-rich alternative to Batam; grid and fibre build-out needed.', '土地充足的巴淡替代选址；需配套电网及光纤建设。'], { scarce: true })] },
    { id: 'JA', en: 'Jambi', zh: '占碑', island: 'Sumatra', grid: 'SUM', ump: 3471497, locs: [
      L('JA-JMB', 'Jambi', '占碑', 34.5, 28, 30, 'TROP', 'low', 'med', 60, 0.6, 1.07, 0.61, 'none', null)] },
    { id: 'SS', en: 'South Sumatra', zh: '南苏门答腊', island: 'Sumatra', grid: 'SUM', ump: 3942963, locs: [
      L('SS-PLM', 'Palembang', '巨港', 34.5, 28, 10, 'TROP', 'low', 'med', 80, 0.6, 1.05, 0.69, 'none', ['Mine-mouth coal and gas generation nearby; KEK Tanjung Api-Api.', '附近有坑口煤电及燃气发电；Tanjung Api-Api经济特区。'])] },
    { id: 'BB', en: 'Bangka Belitung Islands', zh: '邦加-勿里洞群岛', island: 'Sumatra', grid: 'SUM', ump: 4035000, locs: [
      L('BB-PGK', 'Pangkal Pinang', '邦加槟港', 33.5, 27.8, 20, 'TROP', 'low', 'low', 60, 0.7, 1.1, 0.7, 'none', null)] },
    { id: 'BE', en: 'Bengkulu', zh: '明古鲁', island: 'Sumatra', grid: 'SUM', ump: 2827250, locs: [
      L('BE-BKL', 'Bengkulu', '明古鲁', 32.5, 27.5, 15, 'TROP', 'high', 'med', 50, 0.6, 1.1, 0.55, 'none', null)] },
    { id: 'LA', en: 'Lampung', zh: '楠榜', island: 'Sumatra', grid: 'SUM', ump: 3047734, locs: [
      L('LA-BDL', 'Bandar Lampung', '班达楠榜', 33.5, 27.5, 50, 'TROP', 'med', 'med', 70, 0.6, 1.04, 0.58, 'none', ['Closest Sumatra location to Java backbone (Sunda Strait links).', '距爪哇主干网最近的苏门答腊地点（巽他海峡互联）。'])] },
    { id: 'JK', en: 'DKI Jakarta', zh: '雅加达首都特区', island: 'Java', grid: 'JAMALI', ump: 5729876, locs: [
      L('JK-JKT', 'Jakarta (in-city)', '雅加达市区', 34, 28, 8, 'TROP', 'med', 'high', 1500, 0.8, 1.0, 1.0, 'major', ['Densest interconnection ecosystem and carrier hotels; very high land cost and flood exposure (land subsidence).', '互联生态最密集、运营商枢纽集中；土地成本极高且洪水风险高（地面沉降）。'])] },
    { id: 'JB', en: 'West Java', zh: '西爪哇', island: 'Java', grid: 'JAMALI', ump: 2317601, locs: [
      L('JB-BKS', 'Bekasi – Cikarang', '勿加泗-芝加朗', 34.5, 28, 25, 'TROP', 'med', 'high', 280, 1.0, 1.0, 1.0, 'major', ['Indonesia’s main DC corridor (Jababeka, MM2100, Greenland GIIC, Deltamas); 150 kV substations; check local flood history.', '印尼主要数据中心走廊（Jababeka、MM2100、Greenland GIIC、Deltamas）；150 kV变电站；需核查当地洪水历史。']),
      L('JB-KRW', 'Karawang', '卡拉旺', 34.5, 28, 20, 'TROP', 'med', 'med', 200, 1.0, 1.0, 1.0, 'major', ['Large industrial estates (KIIC, Suryacipta) with land for hyperscale campuses.', '大型工业园区（KIIC、Suryacipta），可提供超大规模园区用地。']),
      L('JB-BGR', 'Bogor – Sentul', '茂物-森图尔', 32, 26, 250, 'TROP', 'high', 'low', 220, 0.8, 1.0, 0.9, 'emerging', ['Cooler foothills climate; higher seismic hazard — site-specific seismic study.', '山麓气候较凉爽；地震风险较高——需场地专项抗震研究。']),
      L('JB-BDG', 'Bandung (highland)', '万隆（高原）', 31, 23.5, 768, 'HIGH', 'high', 'low', 180, 0.7, 1.0, 0.78, 'emerging', ['Highland climate improves cooling efficiency; Lembang fault — high seismic design.', '高原气候提升制冷效率；伦邦断层——需高抗震设计。'])] },
    { id: 'BT', en: 'Banten', zh: '万丹', island: 'Java', grid: 'JAMALI', ump: 3100881, locs: [
      L('BT-TNG', 'Tangerang', '唐格朗', 34, 28, 15, 'TROP', 'med', 'med', 350, 0.9, 1.0, 0.92, 'major', ['Close to Jakarta and airport; established DC cluster.', '靠近雅加达及机场；成熟的数据中心集群。']),
      L('BT-SRG', 'Serang – Cilegon', '西冷-芝勒贡', 34, 28, 30, 'TROP', 'med', 'low', 120, 0.7, 1.0, 0.8, 'emerging', ['Next to large power plants (Suralaya) and 500 kV backbone; industrial port area.', '邻近大型电厂（苏拉亚拉）及500 kV主干网；工业港口区。'])] },
    { id: 'JT', en: 'Central Java', zh: '中爪哇', island: 'Java', grid: 'JAMALI', ump: 2327386, locs: [
      L('JT-SMG', 'Semarang – Kendal', '三宝垄-肯德尔', 34, 28, 5, 'TROP', 'med', 'high', 110, 0.6, 1.0, 0.65, 'emerging', ['KEK Kendal and KITB Batang industrial zones; coastal tidal flooding & subsidence — elevate platforms.', '肯德尔经济特区及巴塘综合工业园；沿海潮汐洪水及地面沉降——抬高场地标高。']),
      L('JT-SOC', 'Surakarta (Solo)', '梭罗', 34, 27.5, 100, 'TROP', 'med', 'med', 90, 0.6, 1.0, 0.6, 'none', null)] },
    { id: 'YO', en: 'DI Yogyakarta', zh: '日惹特区', island: 'Java', grid: 'JAMALI', ump: 2417495, locs: [
      L('YO-YOG', 'Yogyakarta', '日惹', 33.5, 27.5, 110, 'TROP', 'high', 'low', 150, 0.6, 1.0, 0.6, 'none', ['High seismic hazard (2006 earthquake); university talent pool.', '地震风险高（2006年地震）；高校人才储备。'])] },
    { id: 'JI', en: 'East Java', zh: '东爪哇', island: 'Java', grid: 'JAMALI', ump: 2446880, locs: [
      L('JI-SBY', 'Surabaya – Gresik', '泗水-锦石', 34.5, 28, 5, 'TROP', 'med', 'med', 170, 0.7, 1.0, 0.88, 'emerging', ['Second-largest economy; KEK JIIPE Gresik; regional DC hub for eastern Indonesia.', '第二大经济区；锦石JIIPE经济特区；印尼东部区域数据中心枢纽。']),
      L('JI-MLG', 'Malang (highland)', '玛琅（高原）', 31, 24.5, 450, 'HIGH', 'high', 'low', 90, 0.6, 1.0, 0.65, 'none', null)] },
    { id: 'BA', en: 'Bali', zh: '巴厘', island: 'Bali', grid: 'JAMALI', ump: 3207459, locs: [
      L('BA-DPS', 'Denpasar', '登巴萨', 33, 27.5, 10, 'TROP', 'high', 'low', 400, 0.8, 1.03, 0.75, 'emerging', ['Tourism & edge demand; strict spatial planning; high seismic hazard.', '旅游及边缘需求；空间规划严格；地震风险高。'])] },
    { id: 'NB', en: 'West Nusa Tenggara', zh: '西努沙登加拉', island: 'Nusa Tenggara', grid: 'NUSA', ump: 2673861, locs: [
      L('NB-MTR', 'Mataram (Lombok)', '马塔兰（龙目）', 33.5, 27, 20, 'TDRY', 'high', 'low', 90, 0.7, 1.15, 0.6, 'none', ['Isolated grid; 2018 Lombok earthquakes.', '孤立电网；2018年龙目地震。'])] },
    { id: 'NT', en: 'East Nusa Tenggara', zh: '东努沙登加拉', island: 'Nusa Tenggara', grid: 'NUSA', ump: 2455898, locs: [
      L('NT-KOE', 'Kupang', '古邦', 34.5, 26.5, 100, 'TDRY', 'high', 'low', 50, 0.9, 1.18, 0.55, 'none', ['Long dry season and water scarcity; excellent solar resource.', '旱季长、缺水；太阳能资源极佳。'], { scarce: true })] },
    { id: 'KB', en: 'West Kalimantan', zh: '西加里曼丹', island: 'Kalimantan', grid: 'KAL', ump: 3054000, umpApprox: true, locs: [
      L('KB-PNK', 'Pontianak', '坤甸', 34, 28, 5, 'TROP', 'low', 'med', 70, 0.6, 1.1, 0.6, 'none', ['Equatorial; low seismic hazard; peat soils need deep foundations.', '赤道地区；地震风险低；泥炭土需深基础。'])] },
    { id: 'KT', en: 'Central Kalimantan', zh: '中加里曼丹', island: 'Kalimantan', grid: 'KAL', ump: 3686138, locs: [
      L('KT-PKY', 'Palangka Raya', '帕朗卡拉亚', 34.5, 28, 25, 'TROP', 'low', 'med', 40, 0.6, 1.12, 0.65, 'none', ['Peat-fire haze season — air filtration.', '泥炭火灾雾霾季节——加强空气过滤。'])] },
    { id: 'KS', en: 'South Kalimantan', zh: '南加里曼丹', island: 'Kalimantan', grid: 'KAL', ump: 3725000, locs: [
      L('KS-BDJ', 'Banjarmasin – Banjarbaru', '马辰-班贾尔巴鲁', 34.5, 28, 20, 'TROP', 'low', 'high', 70, 0.6, 1.1, 0.65, 'none', null)] },
    { id: 'KI', en: 'East Kalimantan', zh: '东加里曼丹', island: 'Kalimantan', grid: 'KAL', ump: 3762431, locs: [
      L('KI-BPN', 'Balikpapan', '巴厘巴板', 33, 27.5, 10, 'TROP', 'low', 'low', 120, 0.8, 1.1, 0.75, 'emerging', ['Gateway to IKN Nusantara; oil & gas industrial base; low seismic hazard.', '通往新首都努桑塔拉的门户；油气工业基地；地震风险低。']),
      L('KI-IKN', 'IKN Nusantara', '努桑塔拉新首都', 33.5, 27.5, 80, 'TROP', 'low', 'low', 60, 0.8, 1.12, 0.75, 'emerging', ['New capital — planned government data center capacity; land through IKN Authority.', '新首都——规划政府数据中心容量；土地通过新首都管理局获取。']),
      L('KI-SMD', 'Samarinda', '三马林达', 34, 27.8, 15, 'TROP', 'low', 'high', 80, 0.7, 1.1, 0.7, 'none', null)] },
    { id: 'KU', en: 'North Kalimantan', zh: '北加里曼丹', island: 'Kalimantan', grid: 'KAL', ump: 3775243, locs: [
      L('KU-TRK', 'Tarakan – Tanjung Selor', '打拉根-丹戎塞洛', 33.5, 27.8, 10, 'TROP', 'med', 'med', 50, 0.7, 1.15, 0.7, 'none', ['KIPI Tanah Kuning green industrial park with planned hydro power.', '塔纳库宁绿色工业园，规划水电供电。'])] },
    { id: 'SA', en: 'North Sulawesi', zh: '北苏拉威西', island: 'Sulawesi', grid: 'SULUT', ump: 4002630, locs: [
      L('SA-MDC', 'Manado – Bitung', '万鸦老-比通', 32.5, 27, 80, 'TROP', 'high', 'low', 90, 0.6, 1.12, 0.7, 'none', ['Pacific-facing cable landing potential; KEK Bitung; high seismic hazard.', '面向太平洋的海缆登陆潜力；比通经济特区；地震风险高。'])] },
    { id: 'GO', en: 'Gorontalo', zh: '哥伦打洛', island: 'Sulawesi', grid: 'SULUT', ump: 3405144, locs: [
      L('GO-GTO', 'Gorontalo', '哥伦打洛', 34, 27.5, 10, 'TROP', 'high', 'med', 50, 0.6, 1.15, 0.6, 'none', null)] },
    { id: 'ST', en: 'Central Sulawesi', zh: '中苏拉威西', island: 'Sulawesi', grid: 'SULUT', ump: 3090000, umpApprox: true, locs: [
      L('ST-PLW', 'Palu', '帕卢', 35, 26.5, 20, 'TDRY', 'high', 'med', 50, 0.7, 1.15, 0.6, 'none', ['Palu-Koro fault (2018 earthquake & liquefaction) — avoid liquefiable soils.', '帕卢-科罗断层（2018年地震及液化）——避开易液化土层。'])] },
    { id: 'SR', en: 'West Sulawesi', zh: '西苏拉威西', island: 'Sulawesi', grid: 'SULSEL', ump: 3290000, umpApprox: true, locs: [
      L('SR-MJU', 'Mamuju', '马穆朱', 33.5, 27.5, 10, 'TROP', 'high', 'med', 40, 0.6, 1.18, 0.6, 'none', null)] },
    { id: 'SN', en: 'South Sulawesi', zh: '南苏拉威西', island: 'Sulawesi', grid: 'SULSEL', ump: 3921088, locs: [
      L('SN-MKS', 'Makassar', '望加锡', 34, 27.8, 10, 'TROP', 'med', 'med', 130, 0.7, 1.1, 0.72, 'emerging', ['Eastern Indonesia gateway; hydro & wind (Sidrap) renewables on the grid.', '印尼东部门户；电网含水电及风电（Sidrap）可再生能源。'])] },
    { id: 'SG', en: 'Southeast Sulawesi', zh: '东南苏拉威西', island: 'Sulawesi', grid: 'SULSEL', ump: 3260000, umpApprox: true, locs: [
      L('SG-KDI', 'Kendari', '肯达里', 33.5, 27.5, 20, 'TROP', 'med', 'med', 50, 0.6, 1.15, 0.6, 'none', ['Nickel-processing region; industrial captive power common.', '镍加工区域；工业自备电厂常见。'])] },
    { id: 'MA', en: 'Maluku', zh: '马鲁古', island: 'Maluku', grid: 'MAL', ump: 3330000, umpApprox: true, locs: [
      L('MA-AMQ', 'Ambon', '安汶', 32, 27, 20, 'TROP', 'high', 'med', 70, 0.7, 1.22, 0.6, 'none', null)] },
    { id: 'MU', en: 'North Maluku', zh: '北马鲁古', island: 'Maluku', grid: 'MAL', ump: 3510240, locs: [
      L('MU-TTE', 'Ternate – Sofifi', '特尔纳特-索菲菲', 32, 27, 20, 'TROP', 'high', 'low', 60, 0.7, 1.22, 0.62, 'none', null)] },
    { id: 'PA', en: 'Papua', zh: '巴布亚', island: 'Papua', grid: 'PAP', ump: 4436283, locs: [
      L('PA-DJJ', 'Jayapura', '查亚普拉', 33, 27.5, 30, 'TROP', 'high', 'med', 90, 0.9, 1.3, 0.78, 'none', ['Logistics-heavy; isolated grid — consider on-site generation & BESS.', '物流成本高；孤立电网——考虑现场发电及储能。'])] },
    { id: 'PB', en: 'West Papua', zh: '西巴布亚', island: 'Papua', grid: 'PAP', ump: 3840000, umpApprox: true, locs: [
      L('PB-MKW', 'Manokwari', '马诺夸里', 32.5, 27.5, 20, 'TROP', 'high', 'med', 50, 0.9, 1.3, 0.67, 'none', null)] },
    { id: 'PD', en: 'Southwest Papua', zh: '西南巴布亚', island: 'Papua', grid: 'PAP', ump: 3766000, locs: [
      L('PD-SOQ', 'Sorong', '索龙', 32.5, 27.5, 10, 'TROP', 'high', 'low', 60, 0.9, 1.28, 0.66, 'none', ['KEK Sorong; submarine fibre (Palapa Ring) landing.', '索龙经济特区；帕拉帕环海底光缆登陆。'])] },
    { id: 'PT', en: 'Central Papua', zh: '中巴布亚', island: 'Papua', grid: 'PAP', ump: 4285848, locs: [
      L('PT-TIM', 'Timika – Nabire', '蒂米卡-纳比雷', 32.5, 27.5, 30, 'TROP', 'high', 'med', 60, 0.9, 1.32, 0.75, 'none', null)] },
    { id: 'PP', en: 'Highland Papua', zh: '巴布亚高地', island: 'Papua', grid: 'PAP', ump: 4508714, umpApprox: true, locs: [
      L('PP-WMX', 'Wamena (highland)', '瓦梅纳（高原）', 26, 19, 1550, 'HIGH', 'high', 'low', 40, 1.0, 1.42, 0.79, 'none', ['Air-freight logistics only; very cool climate.', '仅能空运物流；气候凉爽。'])] },
    { id: 'PS', en: 'South Papua', zh: '南巴布亚', island: 'Papua', grid: 'PAP', ump: 4508100, locs: [
      L('PS-MKQ', 'Merauke', '马老奇', 33.5, 27, 5, 'TDRY', 'low', 'med', 40, 0.9, 1.3, 0.79, 'none', ['Pronounced dry season; low seismic hazard; isolated grid.', '旱季明显；地震风险低；孤立电网。'])] }
  ];

  /* flattened location index */
  D.idLocs = [];
  D.idProvinces.forEach(function (p) {
    p.locs.forEach(function (l) { l.prov = p.id; l.provEn = p.en; l.provZh = p.zh; l.grid = p.grid; l.ump = p.ump; l.island = p.island; D.idLocs.push(l); });
  });
  D.idClimates = {
    TROP: { en: 'Tropical rainforest / monsoon, lowland (Köppen Af/Am)', zh: '低地热带雨林/季风气候（柯本Af/Am）', wbRef: 28, dbRef: 34.5 },
    HIGH: { en: 'Tropical highland (cooler, ≥ ~450 m)', zh: '热带高原（较凉爽，海拔约450 m以上）', wbRef: 23.5, dbRef: 31 },
    TDRY: { en: 'Tropical savanna, long dry season (Köppen Aw)', zh: '热带草原，旱季长（柯本Aw）', wbRef: 26.5, dbRef: 34.5 }
  };
})(typeof window !== 'undefined' ? window : globalThis);
