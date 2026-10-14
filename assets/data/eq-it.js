/* IT & Telecommunication Infrastructure — equipment, specification clauses and TPG */
(function (g) {
  var D = g.DCDB || (g.DCDB = { systems: [], equipment: [] });
  var BID = 'By Bidder / 投标人填写';
  D.equipment.push(

  { id: 'IT-01', sys: 'IT', cls: 'M', en: 'Server Cabinet / Rack', zh: '服务器机柜',
    fn: ['Houses and secures servers, storage and network devices in standard 19-inch mounting, manages airflow and cabling.', '以标准19英寸安装方式容纳并保护服务器、存储和网络设备，管理气流和线缆。'],
    ty: ['42U–52U, 600 mm (servers) or 800 mm (network / AI) wide, 1,070–1,200 mm deep, static load 1,360–1,800 kg.', '42U–52U，宽600 mm（服务器）或800 mm（网络/AI），深1,070–1,200 mm，静载1,360–1,800 kg。'],
    s: [
      ['Perforated front and rear doors ≥ 75–80% open area; lockable with electronic lock option (DCIM integrated).', '前后网孔门开孔率≥75–80%；可上锁，可选电子锁（接入DCIM）。'],
      ['Static load rating ≥ 1,360 kg (≥ 1,800 kg for AI/GPU racks); seismic-rated frame where required.', '静载≥1,360 kg（AI/GPU机柜≥1,800 kg）；必要时采用抗震框架。'],
      ['Blanking panels in all unused U spaces, brush-strip cable entries, side air-dams to prevent recirculation.', '所有空置U位安装盲板，线缆入口设毛刷条，侧面设挡风板防止回流。'],
      ['Earthing stud on frame and doors bonded to rack bonding conductor (TIA-607).', '框架及门设接地螺柱并与机柜接地导体联结（TIA-607）。'],
      ['Vertical 0U PDU mounting channels for two rPDUs (A/B) and cable managers.', '设两条（A/B）竖装0U PDU安装槽及理线器。']
    ],
    tpg: [
      ['Manufacturer / model', '制造商 / 型号', '-', BID],
      ['Rack units (height)', '高度(U数)', 'U', '42 / 45 / 48 / 52'],
      ['External dimensions (W × D × H)', '外形尺寸(宽×深×高)', 'mm', '600 × 1,200 × 2,000–2,400'],
      ['Static load / dynamic (rolling) load', '静载 / 动载', 'kg', '≥ 1,360 / ≥ 1,000'],
      ['Door perforation (front / rear)', '门开孔率(前 / 后)', '%', '≥ 80 / ≥ 80'],
      ['Mounting rail standard', '安装导轨标准', '-', 'EIA-310-E 19″, adjustable depth'],
      ['Material / thickness (frame)', '材料 / 厚度(框架)', '- / mm', 'Cold-rolled steel / ≥ 2.0'],
      ['Finish', '表面处理', '-', 'Powder coat, RAL 9005'],
      ['Locking', '锁具', '-', 'Mechanical + optional electronic (RFID)'],
      ['Seismic rating (if required)', '抗震等级(如需)', '-', 'Zone 4 / GR-63-CORE'],
      ['Blanking panels & brush strips', '盲板及毛刷条', '-', 'Included / 包含']
    ],
    std: ['EIA-310-E', 'IEC 60297', 'EN 50174', 'TIA-942-C', 'GB/T 19520'],
    t: [['Visual & dimensional inspection; load certificate; earthing continuity test.', '外观与尺寸检查；承重证书；接地连续性测试。']] },

  { id: 'IT-02', sys: 'IT', cls: 'M', en: 'Aisle Containment System (Hot / Cold)', zh: '冷/热通道封闭系统',
    fn: ['Physically separates hot exhaust and cold supply air to eliminate mixing, enabling higher supply temperatures and lower fan energy.', '物理隔离热排风和冷送风，消除混风，从而提高送风温度并降低风机能耗。'],
    ty: ['Cold-aisle (CAC) or hot-aisle containment (HAC) with doors, roof panels / chimney; fire-rated materials.', '冷通道封闭（CAC）或热通道封闭（HAC），含端门、顶板/烟囱；采用防火材料。'],
    s: [
      ['Roof panels shall drop or retract automatically on fire alarm to allow sprinkler/gas discharge (or be designed not to obstruct).', '火灾报警时顶板自动下落或收回，以便喷淋/气体释放（或设计为不阻挡）。'],
      ['Panels of polycarbonate or tempered glass with UL 94 V-0 / Class B1 fire rating.', '面板为聚碳酸酯或钢化玻璃，阻燃等级UL 94 V-0 / B1级。'],
      ['Leakage ≤ 3–5% of airflow; sliding self-closing doors.', '漏风率≤风量的3–5%；推拉式自闭门。']
    ],
    tpg: [
      ['Containment type', '封闭类型', '-', 'HAC or CAC (per design)'],
      ['Panel material / fire rating', '面板材料 / 防火等级', '-', 'PC or glass / UL 94 V-0'],
      ['Door type', '门型式', '-', 'Sliding, self-closing, lockable'],
      ['Fire-release mechanism', '火灾释放机构', '-', 'Fusible-link / electromagnetic drop'],
      ['Air leakage', '漏风率', '%', '≤ 5'],
      ['Compatible rack heights', '适配机柜高度', 'U', '42 – 52']
    ],
    std: ['NFPA 75', 'NFPA 13', 'ASHRAE TC 9.9', 'GB 50174'],
    t: [['Smoke test for leakage, fire release test with FACP.', '烟雾测试检查漏风，与火灾报警主机联动释放试验。']] },

  { id: 'IT-03', sys: 'IT', cls: 'M', en: 'Structured Cabling — Optical Fibre', zh: '综合布线——光纤',
    fn: ['High-bandwidth backbone and horizontal links between MDA, HDA and EDA; supports 100G/400G/800G Ethernet and InfiniBand.', 'MDA、HDA与EDA之间的高带宽主干及水平链路；支持100G/400G/800G以太网及InfiniBand。'],
    ty: ['OS2 single-mode and OM4/OM5 multimode, MPO/MTP-12/16/24 trunks, LC/MPO patch panels, 1U 144–288 fibre.', 'OS2单模及OM4/OM5多模，MPO/MTP-12/16/24预端接主干，LC/MPO配线架，1U 144–288芯。'],
    s: [
      ['Pre-terminated, factory-tested MPO trunks with low-loss connectors (≤ 0.35 dB MPO, ≤ 0.15 dB LC).', '工厂预端接并测试的MPO主干，低损耗连接器（MPO≤0.35 dB，LC≤0.15 dB）。'],
      ['Minimum two diverse fibre paths between entrance rooms and MDA (Rated-3/4).', '进线间与MDA之间至少两条分离路由（Rated-3/4）。'],
      ['Labelling per TIA-606-D; fibre raceway separate from power.', '按TIA-606-D标识；光纤槽道与电力分开。']
    ],
    tpg: [
      ['Fibre type (backbone / horizontal)', '光纤类型(主干 / 水平)', '-', 'OS2 / OM4 or OM5'],
      ['Connector type', '连接器类型', '-', 'MPO-12/16 (APC for SM), LC duplex'],
      ['Max. insertion loss per mated pair', '单对连接最大插损', 'dB', '≤ 0.35 MPO / ≤ 0.15 LC'],
      ['Cable jacket rating', '护套阻燃等级', '-', 'LSZH, IEC 60332-3 / CPR Cca'],
      ['Channel test method', '链路测试方法', '-', 'Tier 1 (OLTS) + Tier 2 (OTDR)'],
      ['Warranty', '质保', 'years', '≥ 25 (system warranty)']
    ],
    std: ['TIA-568.3-E', 'TIA-942-C', 'ISO/IEC 11801-5', 'ISO/IEC 14763-3', 'GB 50311', 'GB/T 50312'],
    t: [['100% fibre testing (OLTS + OTDR) with test reports.', '光纤100%测试（OLTS+OTDR）并提交报告。']] },

  { id: 'IT-04', sys: 'IT', cls: 'S', en: 'Structured Cabling — Copper', zh: '综合布线——铜缆',
    fn: ['Management networks, out-of-band, BMS/security devices and short in-row connections.', '管理网络、带外网络、BMS/安防设备及列内短距离连接。'],
    ty: ['Category 6A F/UTP, 10GBASE-T to 100 m; Category 8 for ≤ 30 m 25/40GBASE-T.', '6A类F/UTP，10GBASE-T至100 m；8类用于≤30 m的25/40GBASE-T。'],
    s: [['Channel performance Class EA (ISO) / Cat 6A (TIA); PoE++ (Type 4) capable.', '链路性能达到EA级（ISO）/6A类（TIA）；支持PoE++（Type 4）。']],
    tpg: [
      ['Category / class', '类别 / 等级', '-', 'Cat 6A / Class EA'],
      ['Shielding', '屏蔽', '-', 'F/UTP or U/FTP'],
      ['Max. channel length', '最大链路长度', 'm', '100'],
      ['Jacket', '护套', '-', 'LSZH'],
      ['PoE support', 'PoE支持', '-', 'IEEE 802.3bt Type 4']
    ],
    std: ['TIA-568.2-D', 'ISO/IEC 11801-1', 'GB 50311'],
    t: [['100% permanent-link certification testing.', '永久链路100%认证测试。']] },

  { id: 'IT-05', sys: 'IT', cls: 'S', en: 'Fibre Raceway & Data Cable Tray', zh: '光纤槽道及数据桥架',
    fn: ['Overhead pathways that protect fibre bend radius and organise data cabling above racks.', '机柜上方的线缆通道，保护光纤弯曲半径并整理数据线缆。'],
    ty: ['Yellow PVC/ABS fibre raceway 120–600 mm; wire-mesh (basket) tray for copper.', '黄色PVC/ABS光纤槽道120–600 mm；铜缆采用网格桥架。'],
    s: [['Bend-radius control fittings ≥ 50 mm; fill ratio ≤ 50%; separate tiers for power/data.', '弯曲半径控制配件≥50 mm；填充率≤50%；电力/数据分层。']],
    tpg: [
      ['Raceway size', '槽道尺寸', 'mm', '120 × 100 to 600 × 100'],
      ['Material / flame rating', '材料 / 阻燃等级', '-', 'PVC-free LSZH / UL 94 V-0'],
      ['Mesh tray finish', '网格桥架表面处理', '-', 'Electro-zinc / HDG'],
      ['Max. fill', '最大填充率', '%', '≤ 50']
    ],
    std: ['TIA-569-E', 'EN 50174-2', 'IEC 61537'],
    t: [['Visual inspection and bend-radius check.', '目视检查及弯曲半径检查。']] },

  { id: 'IT-06', sys: 'IT', cls: 'M', en: 'Network Switches (Core / Spine / Leaf)', zh: '网络交换机（核心/脊/叶）',
    fn: ['Interconnect servers and storage; leaf-spine (Clos) fabric gives predictable east-west bandwidth. AI clusters use separate back-end GPU fabrics.', '连接服务器与存储；叶脊（Clos）架构提供可预测的东西向带宽。AI集群另设后端GPU网络。'],
    ty: ['Leaf: 48×25/100G + 8×400G; Spine: 32–64×400/800G; AI back-end: 800G InfiniBand/Ethernet (RoCE).', '叶：48×25/100G+8×400G；脊：32–64×400/800G；AI后端：800G InfiniBand/以太网（RoCE）。'],
    s: [['Redundant hot-swap PSUs and fans; front-to-back or back-to-front airflow matched to aisle orientation.', '冗余可热插拔电源和风扇；前后/后前气流方向与通道布置一致。'],
        ['Non-blocking or defined oversubscription (e.g. 3:1 front-end, 1:1 AI back-end).', '无阻塞或明确收敛比（如前端3:1、AI后端1:1）。']],
    tpg: [
      ['Switching capacity', '交换容量', 'Tbps', BID],
      ['Port configuration', '端口配置', '-', 'Per network design'],
      ['Latency (port-to-port)', '端口间时延', 'ns', BID],
      ['Power consumption (typ. / max.)', '功耗(典型 / 最大)', 'W', BID],
      ['Airflow direction', '风道方向', '-', 'F-to-B / B-to-F selectable'],
      ['PSU / fan redundancy', '电源 / 风扇冗余', '-', '1+1 / N+1 hot-swap']
    ],
    std: ['IEEE 802.3', 'IEEE 802.1', 'NEBS GR-63 (if telco)'],
    t: [['Burn-in, configuration verification and failover testing.', '老化、配置验证及故障切换测试。']] },

  { id: 'IT-07', sys: 'IT', cls: 'S', en: 'Servers — General-Purpose Compute (Reference)', zh: '服务器——通用计算（参考）',
    fn: ['Run applications, virtual machines and databases. Normally owner/tenant-supplied; included here to define facility interface requirements.', '运行应用、虚拟机及数据库；通常由业主/租户自行提供，此处用于定义设施接口要求。'],
    ty: ['1U/2U dual-socket, 0.5 – 1.2 kW each; 8–20 kW per rack.', '1U/2U双路，每台0.5–1.2 kW；每柜8–20 kW。'],
    s: [['Dual PSUs (A/B) 80 PLUS Titanium; ASHRAE A2 or better inlet class.', '双电源（A/B）80 PLUS钛金；进风等级ASHRAE A2或更优。']],
    tpg: [
      ['Typical / max. power per server', '单台典型 / 最大功耗', 'W', BID],
      ['PSU efficiency class', '电源效率等级', '-', '80 PLUS Titanium'],
      ['Allowable inlet class', '允许进风等级', '-', 'ASHRAE A2'],
      ['Airflow per kW', '每kW风量', 'm³/h', '≈ 200 – 300']
    ],
    std: ['ASHRAE TC 9.9', 'IEC 62368-1', 'ENERGY STAR Servers'],
    t: [['Burn-in in staging area before installation.', '安装前在预置区老化测试。']] },

  { id: 'IT-08', sys: 'IT', cls: 'M', en: 'GPU / AI Accelerated System (Reference)', zh: 'GPU/AI加速计算系统（参考）',
    fn: ['High-density accelerated servers for AI training/inference; drive rack densities from 40 kW to > 130 kW and require liquid cooling.', '用于AI训练/推理的高密度加速服务器；机柜密度40 kW至>130 kW，需要液冷。'],
    ty: ['8-GPU servers 10–14 kW each (air/hybrid); rack-scale liquid-cooled systems ~120–140 kW per rack.', '8卡GPU服务器每台10–14 kW（风冷/混合）；机架级液冷系统每柜约120–140 kW。'],
    s: [['Facility to provide liquid-cooling interface (TCS supply/return, quick disconnects) per vendor reference design.', '设施按厂商参考设计提供液冷接口（TCS供/回液、快插接头）。'],
        ['Power: multiple 3-phase 63 A feeds or busbar/power shelves; account for synchronous load swings (power transients).', '供电：多路三相63 A或母线/电源架；需考虑同步负荷波动（功率瞬变）。'],
        ['Floor loading up to 1,500–1,800 kg per rack; 800 mm wide cabinets typical.', '单柜重量可达1,500–1,800 kg；通常采用800 mm宽机柜。']],
    tpg: [
      ['Rack power (design / peak)', '机柜功率(设计 / 峰值)', 'kW', BID],
      ['Liquid-cooled fraction of heat', '液冷散热比例', '%', '≈ 75 – 90'],
      ['Required TCS supply temperature / flow', '所需TCS供液温度 / 流量', '°C / L/min', BID],
      ['Rack weight (fully loaded)', '机柜满载重量', 'kg', BID],
      ['Power feeds per rack', '每柜电源回路数', 'no. × A', BID]
    ],
    std: ['ASHRAE TC 9.9 Liquid Cooling', 'OCP ORv3', 'IEC 62368-1'],
    t: [['Vendor-led cluster acceptance (burn-in, HPL/NCCL benchmarks) after facility IST.', '设施综合测试后由厂商主导集群验收（老化、HPL/NCCL基准）。']] },

  { id: 'IT-09', sys: 'IT', cls: 'S', en: 'Storage Systems (Reference)', zh: '存储系统（参考）',
    fn: ['SAN/NAS/object storage arrays for data persistence; heavy, moderate power density.', '用于数据持久化的SAN/NAS/对象存储阵列；重量大、功率密度中等。'],
    ty: ['5–15 kW per rack, up to 1,200 kg per rack.', '每柜5–15 kW，单柜重量可达1,200 kg。'],
    s: [['Check floor loading and vibration limits for high-capacity HDD enclosures.', '高容量硬盘框需核查楼面荷载与振动限值。']],
    tpg: [
      ['Raw / usable capacity', '原始 / 可用容量', 'PB', BID],
      ['Power per rack', '每柜功率', 'kW', BID],
      ['Rack weight', '机柜重量', 'kg', BID]
    ],
    std: ['SNIA', 'ASHRAE TC 9.9'],
    t: [['Vendor acceptance test.', '厂商验收测试。']] },

  { id: 'IT-10', sys: 'IT', cls: 'M', en: 'Meet-Me Room (MMR) & Carrier Entrance Facilities', zh: '运营商交汇间（MMR）及进线设施',
    fn: ['Secure, carrier-neutral room where telecom carriers terminate and cross-connect to tenants; the entrance room in TIA-942.', '安全、运营商中立的房间，电信运营商在此成端并与租户交叉连接；即TIA-942中的进线间。'],
    ty: ['Two physically diverse MMRs and ≥ 2 diverse building entry points (≥ 20 m apart) for Rated-3/4.', 'Rated-3/4需两个物理分离的MMR及≥2个分离的建筑入口（相距≥20 m）。'],
    s: [['Diverse duct banks (4–6 × 100 mm ducts each) from property line to MMR; maintenance holes at property line.', '从红线至MMR设分离的管群（每路4–6根100 mm管）；红线处设人孔。'],
        ['Dedicated cooling, power (A/B) and access control; ODF frames with cross-connect management.', '专用制冷、A/B电源及门禁；ODF机架配交叉连接管理。']],
    tpg: [
      ['Number of MMRs', 'MMR数量', 'no.', '2 (Rated-3/4)'],
      ['Number of diverse entry points', '分离入口数量', 'no.', '≥ 2, ≥ 20 m separation'],
      ['Ducts per entry', '每个入口管道数', 'no. × mm', '≥ 4 × 100'],
      ['ODF capacity', 'ODF容量', 'fibres', BID],
      ['Carrier racks provided', '运营商机柜数量', 'no.', 'Per carrier demand']
    ],
    std: ['TIA-942-C', 'TIA-569-E', 'BICSI 002', 'GB 50174'],
    t: [['Duct mandrel test; access control test.', '管道通管试验；门禁测试。']] },

  { id: 'IT-11', sys: 'IT', cls: 'S', en: 'KVM & Out-of-Band Management', zh: 'KVM及带外管理',
    fn: ['Remote console access to servers and network devices independent of the production network.', '独立于生产网络对服务器和网络设备进行远程控制台访问。'],
    ty: ['IP-KVM switches, serial console servers with LTE fallback.', 'IP-KVM切换器、带LTE备份的串口控制台服务器。'],
    s: [['Separate OOB network with its own firewall and MFA access.', '独立带外网络，配专用防火墙及多因素认证访问。']],
    tpg: [
      ['Ports per unit', '每台端口数', 'no.', '16 / 32 / 48'],
      ['Remote sessions', '远程会话数', 'no.', BID],
      ['Security', '安全', '-', 'TLS 1.3, MFA, RBAC']
    ],
    std: ['IEC 62443 (security reference)', 'ISO/IEC 27001'],
    t: [['Access test and failover to LTE.', '访问测试及LTE备份切换测试。']] }
  );
})(typeof window !== 'undefined' ? window : globalThis);
