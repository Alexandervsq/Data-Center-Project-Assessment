/* Electrical Power Systems — equipment, specification clauses and TPG */
(function (g) {
  var D = g.DCDB || (g.DCDB = { systems: [], equipment: [] });
  var BID = 'By Bidder / 投标人填写';
  D.equipment.push(

  /* ------------------------------------------------------------------ */
  { id: 'EL-24', sys: 'EL', cls: 'M', en: 'HV Gas-Insulated Switchgear (GIS) Substation, 72.5–550 kV', zh: '高压气体绝缘开关设备（GIS）变电站，72.5–550 kV',
    fn: ['Connects the site to the PLN transmission network at 70, 150, 275 or 500 kV: line, transformer and bus-coupler bays with circuit breakers, disconnectors, earthing switches, instrument transformers and surge arresters in gas-insulated enclosures — compact enough for an on-site substation.',
         '在70、150、275或500 kV电压等级将场地接入PLN输电网：线路、主变及母联间隔，含断路器、隔离开关、接地开关、互感器及避雷器，封装于气体绝缘外壳内——体积紧凑，适合场内变电站。'],
    ty: ['Indoor GIS: 72.5 kV (2,500 A, 31.5 kA), 145 / 170 kV (2,000–4,000 A, 40–63 kA), 245 / 300 kV (3,150–4,000 A, 40–50 kA), 550 kV (4,000–5,000 A, 50–63 kA). Double busbar at 150 kV, breaker-and-a-half at 275 / 500 kV (PLN practice).',
         '户内GIS：72.5 kV（2,500 A，31.5 kA），145/170 kV（2,000–4,000 A，40–63 kA），245/300 kV（3,150–4,000 A，40–50 kA），550 kV（4,000–5,000 A，50–63 kA）。150 kV采用双母线，275/500 kV采用一个半断路器接线（PLN惯例）。'],
    s: [
      ['Busbar scheme: double busbar with bus coupler at 150 kV for Tier III / IV (single busbar with bus section for smaller connections); breaker-and-a-half at 275 / 500 kV per PLN practice; at least two incoming circuits from different PLN substations for Tier III / IV.', '母线接线：Tier III/IV在150 kV采用双母线+母联（较小接入可采用单母线分段）；275/500 kV按PLN惯例采用一个半断路器接线；Tier III/IV至少两回进线，来自不同PLN变电站。'],
      ['Rated short-time withstand current not below the fault level stated by PLN for the connection point (planning: 150 kV 40 kA, 50 kA in dense Java–Bali areas; 500 kV 50–63 kA), 1 s (3 s where specified); peak withstand 2.5 × Ik.', '额定短时耐受电流不低于PLN提供的接入点短路水平（规划值：150 kV 40 kA，爪哇-巴厘负荷密集区50 kA；500 kV 50–63 kA），持续1 s（如有规定3 s）；峰值耐受电流为2.5倍。'],
      ['Circuit breakers: SF6 puffer / self-blast, class C2 (very low restrike probability), M2 (10,000 operations), E1; first-pole-to-clear factor 1.3 (effectively earthed system); out-of-phase breaking 25 % of Ik; two independent trip coils.', '断路器：SF6压气式/自能式，C2级（极低重击穿概率）、M2级（10,000次）、E1级；首开极系数1.3（有效接地系统）；失步开断电流为额定短路开断电流的25%；两套独立分闸线圈。'],
      ['Gas compartments with temperature-compensated density monitors (two alarm stages and block); leakage ≤ 0.5 % per year per compartment; SF6 handling and recovery per IEC 62271-4 (SF6-free designs accepted where proven at the rated voltage).', '气室配温度补偿密度继电器（两级报警及闭锁）；每气室年泄漏率≤0.5%；SF6处理及回收按IEC 62271-4（在该电压等级有成熟业绩的无SF6设计可接受）。'],
      ['Insulation coordination per IEC 60071 with metal-oxide surge arresters at line entries and transformer bays (170 kV: lightning impulse 750 kV; 550 kV: lightning 1,550 kV, switching 1,175 kV).', '按IEC 60071进行绝缘配合，在线路入口及主变间隔设金属氧化物避雷器（170 kV：雷电冲击750 kV；550 kV：雷电冲击1,550 kV，操作冲击1,175 kV）。'],
      ['Protection and control on IEC 61850: line distance / differential (21 / 87L), busbar differential (87B), breaker failure (50BF), transformer differential (87T); bay controllers and local control cubicles with interlocking; 110 V DC auxiliary supply from two battery sets.', '基于IEC 61850的保护与控制：线路距离/差动（21/87L）、母线差动（87B）、断路器失灵（50BF）、主变差动（87T）；间隔控制器及就地控制柜带联锁；110 V直流电源由两组蓄电池供电。'],
      ['Grid Code duties at the connection point: fault clearing by main protection ≤ 120 ms at 150 kV (≤ 90 ms at 500 kV), revenue metering per PLN, power-quality meter, disturbance recorder and telemetry to the PLN control centre.', '接入点电网规范要求：主保护故障切除150 kV≤120 ms（500 kV≤90 ms），按PLN要求设关口计量，配电能质量表、故障录波及向PLN调度中心的遥测。']
    ],
    tpg: [
      {g: ['General', '一般']},
      ['Manufacturer / country of origin', '制造商 / 原产地', '-', BID],
      ['Type / model', '型号', '-', BID],
      ['Applicable standard', '适用标准', '-', 'IEC 62271-203 / -1 / -100 / -102'],
      ['Installation', '安装方式', '-', 'Indoor GIS building / 户内GIS楼'],
      ['Busbar scheme', '母线接线', '-', 'Double busbar (150 kV) / breaker-and-a-half (275–500 kV)'],
      {g: ['Ratings', '额定参数']},
      ['System nominal voltage', '系统标称电压', 'kV', '150 (70 / 275 / 500 per PLN connection)'],
      ['Rated voltage (Ur)', '额定电压', 'kV', '170 (72.5 / 300 / 550)'],
      ['Rated frequency', '额定频率', 'Hz', '50'],
      ['Power-frequency withstand, to earth / across isolating distance', '工频耐受电压（对地/断口）', 'kV', '325 / 375 (170 kV) · 620 / 800 (550 kV)'],
      ['Lightning impulse withstand, to earth / across isolating distance', '雷电冲击耐受电压（对地/断口）', 'kVp', '750 / 860 (170 kV) · 1,550 / 1,550 (+315) (550 kV)'],
      ['Switching impulse withstand to earth (Ur ≥ 300 kV)', '操作冲击耐受电压（对地，Ur≥300 kV）', 'kVp', '1,175 (550 kV)'],
      ['Rated busbar current', '母线额定电流', 'A', '≥ 2,000 (150 kV) · ≥ 4,000 (500 kV)'],
      ['Rated feeder current', '馈线额定电流', 'A', '≥ 1.2 × design load current'],
      ['Rated short-time withstand current / duration', '额定短时耐受电流/持续时间', 'kA / s', '≥ PLN fault level: 40 (150 kV), 50–63 (500 kV) / 1'],
      ['Rated peak withstand current', '额定峰值耐受电流', 'kA', '2.5 × Ik'],
      {g: ['Circuit breaker', '断路器']},
      ['Interrupting principle / operating mechanism', '灭弧原理/操作机构', '-', 'SF6 puffer or self-blast / spring or hydraulic'],
      ['Rated short-circuit breaking current', '额定短路开断电流', 'kA', '= rated short-time current'],
      ['First-pole-to-clear factor', '首开极系数', '-', '1.3 (effectively earthed)'],
      ['Classes (restrike / mechanical / electrical)', '等级（重击穿/机械/电气）', '-', 'C2 · M2 · E1'],
      ['Out-of-phase breaking current', '失步开断电流', '% of Ik', '25'],
      ['Rated break time', '额定开断时间', 'ms', '≤ 60 (150 kV) · ≤ 40 (500 kV)'],
      ['Trip / close coils · auxiliary voltage', '分闸/合闸线圈 · 辅助电压', 'V DC', '2 trip + 1 close · 110'],
      {g: ['Gas system', '气体系统']},
      ['Insulating gas', '绝缘气体', '-', 'SF6 (or proven SF6-free alternative)'],
      ['Filling / alarm / block pressure (CB and other compartments)', '充气/报警/闭锁压力（断路器及其他气室）', 'MPa abs', BID],
      ['Gas leakage rate per compartment', '每气室泄漏率', '% / year', '≤ 0.5'],
      ['Partial discharge at 1.2 Ur/√3 (routine test)', '局部放电（1.2 Ur/√3，出厂试验）', 'pC', '≤ 5'],
      {g: ['Instrument transformers, arresters & protection', '互感器、避雷器及保护']},
      ['Current transformers (protection / metering)', '电流互感器（保护/计量）', '-', '5P20 / 0.2S, 1 A secondary'],
      ['Voltage transformers (metering / protection)', '电压互感器（计量/保护）', '-', '0.2 / 3P'],
      ['Surge arresters', '避雷器', '-', 'Metal-oxide, IEC 60099-4 / SPLN T5.007; 10 kA (150 kV), 20 kA (500 kV)'],
      ['Protection & control', '保护与控制', '-', '21 / 87L, 87B, 50BF, 87T on IEC 61850'],
      ['Dimensions & weight per bay', '单间隔尺寸及重量', 'mm / kg', BID],
      ['Expected service life', '预期使用寿命', 'years', '≥ 40']
    ],
    std: ['IEC 62271-203', 'IEC 62271-1', 'IEC 62271-100', 'IEC 62271-102', 'IEC 62271-4', 'IEC 60071-1', 'IEC 60099-4', 'IEC 61869', 'IEC 61850', 'IEEE 80', 'SPLN T5.007:2014', 'Permen ESDM 20/2020 (Grid Code)'],
    t: [['Type tests (IEC 62271-203): dielectric, short-time and peak withstand, temperature rise, internal arc, gas tightness, mechanical endurance.', '型式试验（IEC 62271-203）：绝缘、短时及峰值耐受、温升、内部燃弧、气密性、机械寿命。'],
        ['Routine tests: power-frequency withstand with partial-discharge measurement, main-circuit resistance, gas tightness, mechanical operation and interlocks.', '出厂试验：工频耐压及局部放电测量、主回路电阻、气密性、机械操作及联锁。'],
        ['Site tests after assembly: gas quality (moisture, purity), AC voltage test with partial discharge, CT / VT tests, protection, interlock and SCADA checks, witnessed by PLN before energisation.', '现场安装后试验：气体品质（微水、纯度）、交流耐压及局部放电、CT/VT试验、保护、联锁及SCADA检查，送电前由PLN见证。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-25', sys: 'EL', cls: 'M', en: 'HV/MV Power Transformer and EHV Interbus Transformer (Oil-Immersed)', zh: '高压/中压电力变压器及超高压联络变压器（油浸式）',
    fn: ['Steps the PLN high voltage (150 kV, or 70 / 230 kV) down to the 20 kV site network; at 275 / 500 kV connections interbus transformers first step down to a 150 kV campus network.',
         '将PLN高压（150 kV，或70/230 kV）降至场内20 kV网络；275/500 kV接入时，先由联络变压器降至园区150 kV网络。'],
    ty: ['Three-phase oil-immersed, ONAN / ONAF, on-load tap changer: 150/20 kV 30 and 60 MVA (PLN standard units, SPLN T3.007-2:2016), 100–250 MVA for large campuses (split winding 150/20/20 kV above ≈ 140 MVA); interbus 500/150 kV 500 MVA (three 167 MVA single-phase units) and 275/150 kV 250 MVA.',
         '三相油浸式，ONAN/ONAF，有载调压：150/20 kV 30及60 MVA（PLN标准，SPLN T3.007-2:2016），大型园区100–250 MVA（约140 MVA以上采用150/20/20 kV分裂绕组）；联络变压器500/150 kV 500 MVA（3台167 MVA单相）及275/150 kV 250 MVA。'],
    s: [
      ['Vector group YNyn0 with a delta stabilising winding for 150/20 kV units (PLN practice); 150 kV neutral solidly earthed; 20 kV neutral earthed through a resistor (EL-26).', '150/20 kV主变联结组别YNyn0并带三角形稳定绕组（PLN惯例）；150 kV中性点直接接地；20 kV中性点经电阻接地（EL-26）。'],
      ['Short-circuit impedance not below IEC 60076-5 minima and chosen for the 20 kV fault level: ≈ 10 % up to 40 MVA, 12.5 % at 60 MVA, 13.5–15 % at 100–250 MVA; split-winding units supply two independent 20 kV boards.', '短路阻抗不低于IEC 60076-5最小值，并按20 kV短路水平选取：40 MVA及以下约10%，60 MVA约12.5%，100–250 MVA为13.5–15%；分裂绕组变压器向两段独立20 kV母线供电。'],
      ['On-load tap changer on the HV winding (typically ± 10 %) with automatic voltage control; Grid Code voltage range at 150 kV is + 5 % / − 10 %.', 'HV绕组有载调压（通常±10%）并自动调压；电网规范150 kV电压范围为+5%/−10%。'],
      ['Cooling ONAN / ONAF (ONAN ≈ 70 % of the ONAF rating); loading per IEC 60076-7; with one unit out the others carry the maximum demand (N+1 for Tier III, 2N for Tier IV).', '冷却方式ONAN/ONAF（ONAN约为ONAF容量的70%）；负载按IEC 60076-7；任一台退出时其余变压器承担最大需量（Tier III为N+1，Tier IV为2N）。'],
      ['Protection and monitoring: differential (87T), restricted earth fault (64REF), Buchholz, pressure relief, oil and winding temperature, tap-changer protective relay; on-line dissolved-gas monitor for units ≥ 60 MVA.', '保护与监测：差动（87T）、限制性接地（64REF）、瓦斯、压力释放、油温及绕组温度、有载开关保护继电器；60 MVA及以上配在线油色谱监测。'],
      ['Losses capitalised in the bid evaluation; oil containment and fire walls between units per IEC 61936-1; transport weight and dimensions checked against road and port limits (single-phase units at 500 kV).', '投标评审中对损耗进行资本化；按IEC 61936-1设集油设施及变压器间防火墙；运输重量及尺寸须核对道路及港口限值（500 kV采用单相变压器）。']
    ],
    tpg: [
      {g: ['General', '一般']},
      ['Manufacturer / country of origin', '制造商 / 原产地', '-', BID],
      ['Type / model', '型号', '-', BID],
      ['Applicable standard', '适用标准', '-', 'IEC 60076 series / SPLN T3.007-2:2016'],
      ['Installation', '安装方式', '-', 'Outdoor / 户外'],
      {g: ['Ratings', '额定参数']},
      ['Rated power ONAF / ONAN', '额定容量 ONAF/ONAN', 'MVA', 'Per design: 30 / 60 / 100 / 150 (ONAN ≈ 70 %)'],
      ['Rated voltages HV / LV', '额定电压 高压/低压', 'kV', '150 / 20 (split 20 / 20 above 140 MVA)'],
      ['Highest voltage for equipment Um, HV / LV', '设备最高电压 高压/低压', 'kV', '170 / 24'],
      ['Tapping range (on-load)', '调压范围（有载）', '%', '± 10'],
      ['Vector group', '联结组别', '-', 'YNyn0 + d (stabilising)'],
      ['Short-circuit impedance at principal tap', '主分接短路阻抗', '%', '≈ 10 (≤ 40 MVA) · 12.5 (60 MVA) · 13.5–15 (≥ 100 MVA)'],
      ['Insulation level HV: lightning impulse / power frequency', '高压绝缘水平：雷电冲击/工频', 'kV', '750 / 325'],
      ['Insulation level LV: lightning impulse / power frequency', '低压绝缘水平：雷电冲击/工频', 'kV', '125 / 50'],
      ['Short-circuit withstand duration (thermal)', '短路耐受时间（热稳定）', 's', '2'],
      ['Temperature rise top oil / average winding', '顶层油/绕组平均温升', 'K', '60 / 65'],
      ['No-load loss / load loss at rated power', '空载损耗/额定负载损耗', 'kW', BID],
      ['Sound power level (ONAF)', '声功率级（ONAF）', 'dB(A)', BID],
      {g: ['Construction & accessories', '结构及附件']},
      ['Insulating liquid', '绝缘液体', '-', 'Mineral oil (IEC 60296) or natural ester (IEC 62770)'],
      ['Bushings', '套管', '-', 'IEC 60137; HV OIP / RIP, LV bushings or cable box'],
      ['On-load tap changer', '有载分接开关', '-', 'IEC 60214-1, vacuum type preferred'],
      ['Monitoring & communication', '监测与通讯', '-', 'On-line DGA, temperatures, OLTC, IEC 61850'],
      ['Interbus transformers (275 / 500 kV connections)', '联络变压器（275/500 kV接入）', '-', '500/150 kV 500 MVA (3 × 167 MVA 1-ph) · 275/150 kV 250 MVA; uk ≈ 12–14 %'],
      ['Transport weight & dimensions', '运输重量及尺寸', 't / mm', BID],
      ['Expected service life', '预期使用寿命', 'years', '≥ 40']
    ],
    std: ['IEC 60076-1', 'IEC 60076-2', 'IEC 60076-3', 'IEC 60076-5', 'IEC 60076-7', 'IEC 60076-10', 'IEC 60214-1', 'IEC 60137', 'IEC 60296', 'IEC 61936-1', 'SPLN T3.007-2:2016'],
    t: [['Type tests: temperature rise, full and chopped lightning impulse, sound level; short-circuit withstand by test or calculation per IEC 60076-5.', '型式试验：温升、全波及截波雷电冲击、声级；按IEC 60076-5以试验或计算验证短路耐受能力。'],
        ['Routine tests: winding resistance, ratio and vector group, impedance and load loss, no-load loss and current, applied and induced voltage with partial discharge, tap-changer tests, insulation resistance, oil tests.', '出厂试验：绕组电阻、变比及联结组别、阻抗及负载损耗、空载损耗及电流、外施及感应耐压（含局放）、分接开关试验、绝缘电阻、油试验。'],
        ['Site: frequency-response (SFRA) fingerprint, oil DGA before and after energisation, protection and cooling function tests, no-load soak before loading.', '现场：频率响应（SFRA）基准测试、送电前后油色谱、保护及冷却功能试验、带负荷前空载运行。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-26', sys: 'EL', cls: 'S', en: '20 kV Neutral Earthing Resistor (NGR)', zh: '20 kV中性点接地电阻（NGR）',
    fn: ['Limits the earth-fault current of the 20 kV network fed by each HV/MV transformer, so cables and switchgear survive an earth fault and the protection detects and clears it selectively.',
         '限制每台主变所供20 kV网络的接地故障电流，使电缆及开关设备能承受接地故障，并由保护选择性检测和切除故障。'],
    ty: ['Stainless-steel grid resistor in an outdoor enclosure with neutral CT: 40 Ω / 300 A / 10 s (PLN practice for overhead networks; 12 Ω / 1,000 A on cable networks, 500 Ω / 25 A in some regions — agree with PLN).',
         '户外箱体不锈钢栅格电阻，配中性点CT：40 Ω/300 A/10 s（PLN架空网络惯例；电缆网络12 Ω/1,000 A，部分地区500 Ω/25 A——须与PLN确认）。'],
    s: [
      ['Resistance agreed with PLN to match the 20 kV earthing practice of the area and the ground-fault protection; rated current ≥ the earth-fault current, time rating ≥ the back-up clearing time.', '电阻值须与PLN确认，与当地20 kV接地方式及接地保护匹配；额定电流不低于接地故障电流，时间额定不低于后备保护切除时间。'],
      ['Ground-fault relay operating time ≤ 50 % of the resistor time rating, with ≥ 300 ms grading to the standby earth-fault protection (Grid Code).', '接地故障继电器动作时间≤电阻时间额定的50%，与后备接地保护级差≥300 ms（电网规范）。'],
      ['Continuous current rating ≥ 5 % of the rated current (sustained unbalance and high-resistance faults).', '持续电流额定≥额定电流的5%（持续不平衡及高阻故障）。'],
      ['Neutral current transformer 400/1 A, 5P20, ≥ 20 VA (SPLN T3.013-3:2023) for restricted and standby earth-fault protection.', '中性点电流互感器400/1 A、5P20、≥20 VA（SPLN T3.013-3:2023），用于限制性接地及后备接地保护。'],
      ['Enclosure IP23 minimum, stainless-steel elements, insulation for the 20 kV system (24 kV, 125 kV lightning impulse, 50 kV power frequency), seismic withstand ≥ 0.3 g.', '外壳防护等级至少IP23，不锈钢电阻元件，绝缘满足20 kV系统（24 kV，雷电冲击125 kV，工频50 kV），抗震≥0.3 g。']
    ],
    tpg: [
      ['Manufacturer / type', '制造商 / 型号', '-', BID],
      ['Applicable standard', '适用标准', '-', 'IEC 60076-25:2023 / IEEE C57.32'],
      ['System voltage / highest voltage', '系统电压/最高电压', 'kV', '20 / 24'],
      ['Rated resistance at 25 °C', '25 °C额定电阻', 'Ω', '40 (per PLN area practice)'],
      ['Rated current / rated time', '额定电流/额定时间', 'A / s', '300 / 10'],
      ['Continuous current', '持续电流', '% of rated', '≥ 5'],
      ['Insulation level: lightning impulse / power frequency', '绝缘水平：雷电冲击/工频', 'kV', '125 / 50'],
      ['Resistor element material', '电阻元件材料', '-', 'Stainless steel'],
      ['Enclosure / degree of protection', '外壳/防护等级', '-', 'Outdoor, IP23'],
      ['Neutral current transformer', '中性点电流互感器', '-', '400/1 A, 5P20, ≥ 20 VA'],
      ['Seismic withstand', '抗震能力', 'g', '≥ 0.3'],
      ['Dimensions & weight', '尺寸及重量', 'mm / kg', BID]
    ],
    std: ['IEC 60076-25', 'IEEE C57.32', 'IEC 61869-2', 'SPLN T3.013-3:2023', 'IEEE 80'],
    t: [['Routine tests: resistance measurement, power-frequency insulation test, visual and dimensional check.', '出厂试验：电阻测量、工频绝缘试验、外观及尺寸检查。'],
        ['Type tests: temperature rise at rated current and time, lightning impulse, degree of protection.', '型式试验：额定电流及时间下温升、雷电冲击、防护等级。'],
        ['Site: resistance and insulation check, CT ratio and polarity, earth-fault protection test with PLN.', '现场：电阻及绝缘检查、CT变比及极性、与PLN联合进行接地保护试验。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-01', sys: 'EL', cls: 'M', en: 'Medium Voltage Switchgear', zh: '中压开关柜',
    fn: ['Receives the utility supply (and/or MV generator output), protects and distributes power to the MV/LV transformers. Forms the first switching point of the critical power chain.',
         '接收市电（和/或中压发电机输出），对电源进行保护并分配至中压/低压变压器，是关键供电链的第一个开关节点。'],
    ty: ['Metal-clad, withdrawable VCB, 12 / 24 / 40.5 kV, 630–2500 A busbar, 25–31.5 kA. AIS or GIS where space is limited.',
         '金属铠装、手车式真空断路器，12 / 24 / 40.5 kV，母线630–2500 A，25–31.5 kA；空间受限时采用GIS。'],
    s: [
      ['Switchgear shall be metal-enclosed, LSC2B-PM, with internal arc classification IAC AFLR and withdrawable vacuum circuit breakers.', '开关柜应为金属封闭型，运行连续性等级LSC2B-PM，内部燃弧等级IAC AFLR，配手车式真空断路器。'],
      ['Double incoming feeders with bus-section (bus-coupler) breaker and automatic changeover shall be provided for Tier III/IV designs.', 'Tier III/IV设计应设双路进线及母联断路器，并具备自动切换功能。'],
      ['Numerical protection relays (50/51, 50N/51N, 27/59, 81, 87T where applicable) with IEC 61850 communication to the EPMS.', '配置数字式综合保护继电器（50/51、50N/51N、27/59、81，必要时87T），通过IEC 61850与电力监控系统通讯。'],
      ['Full mechanical and electrical interlocking (five-prevention) and key interlocks with downstream transformer doors.', '应具备完善的机械与电气联锁（“五防”），并与下游变压器柜门设钥匙联锁。'],
      ['Arc-flash mitigation: arc detection relays or arc-resistant design; arc-flash labels per IEEE 1584 study.', '电弧防护：配置弧光保护或耐弧设计，并根据IEEE 1584计算结果张贴电弧危险标签。'],
      ['Spare capacity: minimum 20% spare equipped feeders or space for future phases.', '预留容量：至少20%的备用回路或预留未来扩容位置。']
    ],
    tpg: [
      {g: ['General', '一般']},
      ['Manufacturer / country of origin', '制造商 / 原产地', '-', BID],
      ['Type / model', '型号', '-', BID],
      ['Applicable standard', '适用标准', '-', 'IEC 62271-200 / GB/T 3906'],
      ['Installation', '安装方式', '-', 'Indoor / 户内'],
      {g: ['Ratings', '额定参数']},
      ['System nominal voltage', '系统标称电压', 'kV', '20 (or 10 / 33 per utility)'],
      ['Rated voltage (Ur)', '额定电压', 'kV', '24 (12 / 36–40.5)'],
      ['Rated frequency', '额定频率', 'Hz', '50 (60)'],
      ['Rated power-frequency withstand voltage (1 min)', '额定工频耐受电压(1 min)', 'kV', '50 (24 kV class)'],
      ['Rated lightning impulse withstand voltage', '额定雷电冲击耐受电压', 'kVp', '125 (24 kV class)'],
      ['Rated busbar current', '母线额定电流', 'A', '≥ 1250'],
      ['Rated short-time withstand current / duration', '额定短时耐受电流 / 持续时间', 'kA / s', '25 / 3 (min.)'],
      ['Rated peak withstand current', '额定峰值耐受电流', 'kA', '63'],
      ['Internal arc classification', '内部燃弧等级', '-', 'IAC AFLR 25 kA 1 s'],
      ['Loss of service continuity category', '运行连续性丧失类别', '-', 'LSC2B'],
      ['Degree of protection (enclosure / between compartments)', '防护等级(外壳/隔室间)', 'IP', 'IP4X / IP2X'],
      {g: ['Circuit breaker', '断路器']},
      ['Type of interrupting medium', '灭弧介质', '-', 'Vacuum / 真空'],
      ['Rated short-circuit breaking current', '额定短路开断电流', 'kA', '25 (31.5 where required)'],
      ['Mechanical endurance class', '机械寿命等级', '-', 'M2 (10,000 ops)'],
      ['Electrical endurance class', '电气寿命等级', '-', 'E2'],
      ['Total break time', '全开断时间', 'ms', '≤ 60'],
      ['Operating mechanism / auxiliary voltage', '操作机构 / 辅助电压', 'V DC', 'Motor-charged spring / 110 DC'],
      {g: ['Protection & control', '保护与控制']},
      ['Protection relay type & communication protocol', '保护继电器型号及通讯协议', '-', 'Numerical, IEC 61850'],
      ['Arc-flash detection', '弧光保护', '-', 'Required / 需要'],
      ['Overall dimensions per panel (W × D × H)', '单柜外形尺寸(宽×深×高)', 'mm', BID],
      ['Weight per panel', '单柜重量', 'kg', BID],
      ['Expected service life', '预期使用寿命', 'years', '≥ 30']
    ],
    std: ['IEC 62271-1', 'IEC 62271-100', 'IEC 62271-200', 'IEC 60255', 'IEC 61850', 'GB/T 3906', 'GB/T 11022', 'IEEE 1584'],
    t: [['Type test certificates from an independent laboratory (incl. internal arc).', '独立实验室出具的型式试验报告（含内部燃弧试验）。'],
        ['Routine tests: power-frequency withstand, main circuit resistance, mechanical operation, interlocks, partial discharge.', '出厂试验：工频耐压、主回路电阻、机械操作、联锁、局部放电。'],
        ['Site tests: insulation resistance, relay secondary injection, primary injection, functional changeover tests.', '现场试验：绝缘电阻、继电保护二次注入、一次注流、切换功能试验。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-02', sys: 'EL', cls: 'M', en: 'MV/LV Power Transformer (Cast-Resin Dry-Type)', zh: '中压/低压电力变压器（环氧树脂浇注干式）',
    fn: ['Steps the MV distribution voltage down to the LV utilisation voltage (400/230 V or 415/240 V) that feeds UPS, cooling and building loads.',
         '将中压配电电压降至低压使用电压（400/230 V或415/240 V），为UPS、制冷及建筑负荷供电。'],
    ty: ['1,600 – 3,150 kVA per unit (2,500 kVA most common); one transformer per “block” of ~1.5–2 MW facility load.',
         '单台1,600–3,150 kVA（以2,500 kVA最常见）；每台对应约1.5–2 MW设施负荷的一个“供电模块”。'],
    s: [
      ['Indoor cast-resin, class F insulation (temperature rise limited to class B or 100 K) with E2-C2-F1 climatic/environmental/fire class.', '户内环氧树脂浇注干式，F级绝缘（温升按B级或100 K考核），环境/气候/燃烧等级E2-C2-F1。'],
      ['Losses shall comply with EU Ecodesign Tier 2 / GB 20052 energy efficiency grade 2 or better.', '损耗应满足欧盟Ecodesign Tier 2或GB 20052二级能效及以上。'],
      ['Forced-air cooling fans (AF) for 40% overload, PT100 winding temperature monitoring with alarm/trip.', '配强迫风冷风机（AF），可提供40%过载；PT100绕组测温，具报警/跳闸功能。'],
      ['IP31 enclosure with anti-vibration pads and door interlock with upstream MV breaker.', 'IP31外壳，配减振垫，柜门与上游中压断路器联锁。'],
      ['K-factor rated or derated for harmonic loads (non-linear IT/UPS loads).', '应考虑非线性IT/UPS负荷，按K系数设计或降容使用。']
    ],
    tpg: [
      {g: ['General', '一般']},
      ['Manufacturer / model', '制造商 / 型号', '-', BID],
      ['Type', '类型', '-', 'Cast-resin dry-type / 环氧浇注干式'],
      ['Applicable standard', '适用标准', '-', 'IEC 60076-11 / GB/T 1094.11'],
      {g: ['Ratings', '额定参数']},
      ['Rated power (AN / AF)', '额定容量(AN / AF)', 'kVA', '2,500 / 3,500'],
      ['Rated primary voltage', '一次额定电压', 'kV', '20 (10 / 33)'],
      ['Rated secondary voltage (no-load)', '二次额定电压(空载)', 'V', '400 / 230'],
      ['Vector group', '联结组别', '-', 'Dyn11'],
      ['Tapping range (off-circuit)', '分接范围(无励磁)', '%', '± 2 × 2.5'],
      ['Impedance voltage at 75 °C', '短路阻抗(75 °C)', '%', '6.0 – 8.0'],
      ['Insulation class / temperature rise', '绝缘等级 / 温升', '-/K', 'F / 100'],
      {g: ['Losses & performance', '损耗与性能']},
      ['No-load loss', '空载损耗', 'W', '≤ 2,880 (2,500 kVA, Ecodesign Tier 2)'],
      ['Load loss at 120 °C', '负载损耗(120 °C)', 'W', '≤ 18,500 (2,500 kVA)'],
      ['Efficiency at 50% load, PF 1.0', '50%负载、功率因数1.0时效率', '%', '≥ 99.2'],
      ['Partial discharge level at 1.3 Um', '1.3 Um下局部放电量', 'pC', '≤ 10'],
      ['Sound power level (AN)', '声功率级(AN)', 'dB(A)', '≤ 78'],
      ['Climatic / environmental / fire class', '气候/环境/燃烧等级', '-', 'C2 / E2 / F1'],
      {g: ['Physical', '外形']},
      ['Enclosure degree of protection', '外壳防护等级', 'IP', 'IP31'],
      ['Dimensions (L × W × H)', '外形尺寸(长×宽×高)', 'mm', BID],
      ['Total weight', '总重量', 'kg', BID],
      ['Winding temperature monitoring', '绕组温度监测', '-', '3 × PT100 + controller (Modbus)']
    ],
    std: ['IEC 60076-1', 'IEC 60076-11', 'IEC 60076-16', 'GB/T 1094.11', 'GB 20052', 'EU 548/2014 Ecodesign'],
    t: [['Routine: winding resistance, ratio & vector group, impedance, losses, applied & induced voltage, partial discharge.', '出厂试验：绕组电阻、变比与联结组别、短路阻抗、损耗、外施与感应耐压、局部放电。'],
        ['Type test or reference: temperature-rise, lightning impulse, sound level.', '型式试验或参考报告：温升、雷电冲击、噪声。'],
        ['Site: insulation resistance, ratio, energisation & inrush observation.', '现场：绝缘电阻、变比、带电投运及励磁涌流观察。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-03', sys: 'EL', cls: 'M', en: 'LV Main Switchboard (MSB)', zh: '低压主配电柜（MSB）',
    fn: ['Distributes LV power from transformers and generators to UPS inputs, mechanical plant and building services; includes ATS/tie breakers.',
         '将变压器和发电机的低压电源分配至UPS输入、机械设备及建筑设备，包含ATS/母联断路器。'],
    ty: ['4,000 – 6,300 A main busbar, 65–100 kA Icw 1 s, Form 4b separation, ACB incomers and MCCB/ACB feeders.',
         '主母线4,000–6,300 A，Icw 65–100 kA 1 s，Form 4b分隔，进线ACB、出线MCCB/ACB。'],
    s: [
      ['Type-tested assembly to IEC 61439-1/-2 verified by an accredited laboratory, Form 4b Type 6 internal separation.', '按IEC 61439-1/-2进行设计验证的成套设备，由认可实验室验证，内部分隔Form 4b Type 6。'],
      ['Withdrawable air circuit breakers with electronic trip units (LSIG), energy metering and Modbus/IEC 61850 communication.', '抽出式框架断路器，配电子脱扣器（LSIG）、电能计量及Modbus/IEC 61850通讯。'],
      ['Automatic transfer logic between transformer and generator sources with mechanical + electrical interlocks.', '变压器与发电机电源之间的自动转换逻辑，具备机械与电气联锁。'],
      ['Copper busbars, tin-plated, sized at max 1.6 A/mm² current density; neutral 100% (200% where harmonics require).', '镀锡铜母线，电流密度不大于1.6 A/mm²；中性线100%（谐波严重时200%）。'],
      ['Maintenance-mode switch (energy-reducing) per NEC 240.87 / arc-flash reduction for breakers ≥ 1,200 A.', '额定≥1,200 A的断路器应配维护模式开关（降低电弧能量）。']
    ],
    tpg: [
      {g: ['General', '一般']},
      ['Manufacturer / type designation', '制造商 / 型号', '-', BID],
      ['Applicable standard', '适用标准', '-', 'IEC 61439-1/-2 / GB/T 7251.12'],
      ['Rated operational voltage (Ue)', '额定工作电压', 'V', '400 / 415'],
      ['Rated insulation voltage (Ui)', '额定绝缘电压', 'V', '1000'],
      ['Rated impulse withstand voltage (Uimp)', '额定冲击耐受电压', 'kV', '12'],
      ['Main busbar rated current', '主母线额定电流', 'A', '4,000 (as per SLD)'],
      ['Rated short-time withstand current (Icw, 1 s)', '额定短时耐受电流(1 s)', 'kA', '≥ 65'],
      ['Form of internal separation', '内部分隔形式', '-', 'Form 4b'],
      ['Degree of protection', '防护等级', 'IP', 'IP42 (min. IP31)'],
      ['Earthing system', '接地型式', '-', 'TN-S'],
      {g: ['Air circuit breakers', '框架断路器']},
      ['Rated current range', '额定电流范围', 'A', '800 – 4,000'],
      ['Ultimate breaking capacity Icu / service Ics', '极限分断能力Icu / 运行分断能力Ics', 'kA', '≥ 65 / Ics = 100% Icu'],
      ['Trip unit type', '脱扣器类型', '-', 'Electronic LSIG + metering'],
      ['Mechanical endurance', '机械寿命', 'ops', '≥ 10,000'],
      ['Closing time', '合闸时间', 'ms', '≤ 70'],
      {g: ['Physical & accessories', '外形与附件']},
      ['Busbar material / plating', '母线材料 / 镀层', '-', 'Cu / Tin'],
      ['Access (front / rear)', '操作维护方式(前/后)', '-', 'Front & rear access'],
      ['Panel dimensions (W × D × H)', '单柜尺寸(宽×深×高)', 'mm', BID],
      ['Integrated power meters (class)', '内置电能表(精度等级)', '-', 'Class 0.5S, IEC 62053-22'],
      ['Surge protective device at incomer', '进线浪涌保护器', '-', 'Type 1+2, Iimp ≥ 25 kA']
    ],
    std: ['IEC 61439-1', 'IEC 61439-2', 'IEC 60947-2', 'GB/T 7251.12', 'IEC 61641', 'IEC 62053-22'],
    t: [['Design verification (temperature rise, short-circuit, dielectric) per IEC 61439.', '按IEC 61439进行设计验证（温升、短路、介电）。'],
        ['Routine verification at factory incl. wiring, dielectric, functional and interlocks (FAT witnessed).', '工厂例行检验：接线、介电、功能及联锁（见证FAT）。'],
        ['Site: torque check, IR scan under load, breaker trip tests, transfer scheme tests.', '现场：螺栓力矩检查、带载红外扫描、断路器脱扣试验、切换方案试验。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-04', sys: 'EL', cls: 'M', en: 'Diesel Generator Set', zh: '柴油发电机组',
    fn: ['On-site standby/continuous power source that carries the full facility load when the utility fails. In Uptime Tier topology the generator is treated as the primary power source.',
         '现场备用/持续电源，在市电失效时承担全部设施负荷。在Uptime分级体系中，发电机被视为主电源。'],
    ty: ['1,500 – 3,250 kVA per unit (2.0–2.5 MWe typical) at 400 V LV or 11/20 kV MV, containerised or in a generator hall.',
         '单台1,500–3,250 kVA（典型2.0–2.5 MWe），低压400 V或中压11/20 kV，集装箱式或机房式。'],
    s: [
      ['Rating shall be Continuous (COP) or Data Center Continuous (DCC) with no annual run-hour limit at site conditions to satisfy Tier III/IV.', '为满足Tier III/IV，额定功率应为持续功率（COP）或数据中心持续功率（DCC），在现场条件下无年运行小时限制。'],
      ['Start, synchronise and accept load within 10–15 s; single-step load acceptance per ISO 8528-5 performance class G3.', '10–15 s内完成启动、同步并接带负荷；突加负荷性能满足ISO 8528-5 G3级。'],
      ['Derate for site ambient (e.g. 40 °C), altitude and fuel quality; radiator sized for 50 °C ambient where required.', '按现场环境温度（如40 °C）、海拔及燃油品质降容；必要时散热器按50 °C设计。'],
      ['Emissions to local regulation (e.g. EU Stage V / US EPA Tier 4 / China GB 20891); SCR/DPF where required.', '排放满足当地法规（如欧盟Stage V、美国EPA Tier 4、中国GB 20891），必要时加装SCR/DPF。'],
      ['Acoustic enclosure ≤ 75 dB(A) at 7 m (or per local limit), residential silencers, coolant heaters and battery chargers.', '隔音罩在7 m处≤75 dB(A)（或按当地限值），配住宅级消声器、冷却液加热器和蓄电池充电器。'],
      ['Redundancy: N+1 (Tier II/III) or 2N / N+2 (Tier IV) with paralleling controls; load-bank connection points for testing.', '冗余：N+1（Tier II/III）或2N / N+2（Tier IV），配并机控制；预留负载测试连接点。']
    ],
    tpg: [
      {g: ['General', '一般']},
      ['Engine manufacturer / model', '发动机制造商 / 型号', '-', BID],
      ['Alternator manufacturer / model', '发电机制造商 / 型号', '-', BID],
      ['Applicable standard', '适用标准', '-', 'ISO 8528 / IEC 60034 / GB/T 2820'],
      ['Rating basis', '功率定额', '-', 'COP or DCC at site conditions'],
      {g: ['Ratings at site conditions', '现场条件额定值']},
      ['Rated output (continuous)', '额定持续输出功率', 'kWe / kVA', '2,000 / 2,500 (typ.)'],
      ['Rated voltage / frequency', '额定电压 / 频率', 'V / Hz', '400 or 20,000 / 50'],
      ['Power factor', '功率因数', '-', '0.8 lagging'],
      ['Site ambient / altitude for rating', '额定环境温度 / 海拔', '°C / m', '40 / ≤ 1,000'],
      ['Start-to-full-load time', '启动至满载时间', 's', '≤ 15 (≤ 10 preferred)'],
      ['Load acceptance first step', '首级突加负载', '% rated', '≥ 50 (ISO 8528-5 G3)'],
      ['Steady-state voltage regulation', '稳态电压调整率', '%', '± 0.5'],
      ['Steady-state frequency band', '稳态频率波动', '%', '± 0.25'],
      ['Transient voltage dip at 100% load step', '100%突加负载电压瞬变', '%', BID],
      {g: ['Engine', '发动机']},
      ['Number / arrangement of cylinders', '气缸数 / 排列', '-', BID],
      ['Fuel consumption at 100% / 75% / 50% load', '100%/75%/50%负载燃油消耗', 'L/h', BID],
      ['Specific fuel consumption at 100% load', '100%负载燃油消耗率', 'g/kWh', '≤ 215'],
      ['Lube oil consumption', '机油消耗率', '% of fuel', '≤ 0.1'],
      ['Emission compliance level', '排放等级', '-', 'Per local regulation'],
      {g: ['Alternator', '发电机']},
      ['Insulation class / temperature rise', '绝缘等级 / 温升', '-', 'H / F'],
      ['Sub-transient reactance X”d', '超瞬变电抗X”d', '%', BID],
      ['Excitation system', '励磁方式', '-', 'PMG'],
      ['Waveform THD (no load)', '空载波形总谐波畸变率', '%', '≤ 3'],
      {g: ['Physical & auxiliaries', '外形与辅助设备']},
      ['Enclosure type / noise at 7 m', '箱体型式 / 7 m处噪声', 'dB(A)', 'Container / ≤ 75'],
      ['Belly tank / day tank capacity', '底座油箱 / 日用油箱容量', 'L', '≥ 4 h at full load'],
      ['Starting system', '启动方式', '-', '24 V DC electric, dual batteries'],
      ['Dimensions & dry weight', '外形尺寸及干重', 'mm / kg', BID],
      ['Mean time between overhaul', '大修间隔', 'h', BID]
    ],
    std: ['ISO 8528-1', 'ISO 8528-5', 'IEC 60034-1', 'NFPA 110', 'GB/T 2820', 'GB 20891', 'Uptime Tier Standard: Topology'],
    t: [['Factory test: 4 h at full load incl. 1 h at 110%, load steps, transient response, protection functions.', '工厂试验：满载4 h（含110%过载1 h）、阶跃加载、瞬态响应、保护功能。'],
        ['Site: 4–8 h resistive/reactive load-bank test, parallel operation, black-start, fuel system integration.', '现场：4–8 h阻性/感性负载箱试验、并机运行、黑启动、燃油系统联调。'],
        ['IST (L5): utility failure simulation with real IT/heat load.', '综合系统测试（L5）：带真实IT/热负载的市电失效模拟。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-05', sys: 'EL', cls: 'M', en: 'Generator Paralleling Switchgear & Controls', zh: '发电机并机柜及控制系统',
    fn: ['Synchronises multiple generator sets onto a common bus, shares load, manages load shedding/adding and redundant priority sequencing.',
         '将多台发电机组同步并入公共母线，进行负荷分配、甩载/加载管理及冗余优先级排序。'],
    ty: ['LV 4,000–6,300 A or MV 12/24 kV paralleling bus; redundant PLC/controller with hot-standby.',
         '低压4,000–6,300 A或中压12/24 kV并机母线；冗余PLC/控制器热备。'],
    s: [
      ['Redundant master controllers (hot-standby) — no single controller failure shall prevent generators from supplying the critical load.', '冗余主控制器（热备）——任一控制器故障不得影响发电机向关键负荷供电。'],
      ['Closed-transition (soft) retransfer to utility with synch-check relay (25).', '回切市电采用闭式转换（软切换），配同期检查继电器（25）。'],
      ['Priority load-add and load-shed tables; dead-bus closing of first available generator.', '设置优先加载/甩载表；首台可用机组可进行死母线合闸。'],
      ['HMI with mimic, event log (1 ms), and BMS/EPMS interface.', 'HMI具备模拟图、事件记录（1 ms分辨率）及BMS/EPMS接口。']
    ],
    tpg: [
      ['Manufacturer / controller platform', '制造商 / 控制平台', '-', BID],
      ['Bus voltage / rated current', '母线电压 / 额定电流', 'V / A', '400 / 6,300 or MV'],
      ['Short-time withstand current (1 s)', '短时耐受电流(1 s)', 'kA', '≥ 85 (LV) / 25 (MV)'],
      ['Number of generator incomers (incl. future)', '发电机进线数量(含预留)', 'no.', 'Per design'],
      ['Synchronising time (all sets)', '全部机组同步时间', 's', '≤ 10'],
      ['Load-sharing accuracy (kW / kVAr)', '负荷分配精度(有功/无功)', '%', '± 2'],
      ['Controller redundancy', '控制器冗余', '-', 'Hot-standby, auto failover'],
      ['Event recorder resolution', '事件记录分辨率', 'ms', '≤ 1'],
      ['Communication protocols', '通讯协议', '-', 'Modbus TCP / IEC 61850 / BACnet'],
      ['Form of separation / IP rating', '分隔形式 / 防护等级', '-', 'Form 4b / IP42']
    ],
    std: ['IEC 61439-2', 'IEC 62271-200', 'NFPA 110', 'IEEE C37.20'],
    t: [['FAT with simulated generator signals; site parallel test with all sets and load bank.', '用模拟发电机信号进行FAT；现场全部机组配合负载箱并机试验。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-06', sys: 'EL', cls: 'M', en: 'Fuel Oil Storage & Transfer System', zh: '燃油储存与输送系统',
    fn: ['Stores diesel on site for the required autonomy (≥ 12 h at N load per Uptime; 24–72 h common) and transfers it to generator day tanks.',
         '在现场储存满足自持时间要求的柴油（Uptime要求N负荷下≥12 h，常见24–72 h），并输送至发电机日用油箱。'],
    ty: ['Double-wall bulk tanks 50–200 m³ each, duplex transfer pumps, fuel polishing, interstitial leak monitoring.',
         '双层储油罐每座50–200 m³，双联输油泵，燃油精滤，夹层渗漏监测。'],
    s: [
      ['Bulk storage sized for the specified autonomy at full facility N load: V (L) ≈ P (kW) × 0.27 L/kWh × hours.', '储油容量按设施N负荷满足规定自持时间计算：V(L) ≈ P(kW) × 0.27 L/kWh × 小时数。'],
      ['Concurrently maintainable piping: dual supply/return headers, isolation valves and redundant transfer pumps (N+1).', '管路可同时维护：双供/回油总管、隔离阀及冗余输油泵（N+1）。'],
      ['Double-wall steel or composite tanks with continuous interstitial leak detection and overfill prevention (95% alarm).', '双层钢制或复合材料油罐，夹层连续渗漏检测，防溢油（95%报警）。'],
      ['Fuel polishing system to maintain ISO 4406 cleanliness 18/16/13; quarterly fuel sampling.', '燃油精滤系统使清洁度保持ISO 4406 18/16/13；每季度取样化验。'],
      ['Bunding ≥ 110% of largest tank volume, fire separation per NFPA 30 / GB 50016.', '防火堤容积≥最大油罐容积的110%，防火间距符合NFPA 30 / GB 50016。']
    ],
    tpg: [
      ['Total usable fuel storage', '有效储油总量', 'm³', 'Per autonomy calculation'],
      ['Autonomy at N facility load', 'N负荷下自持时间', 'h', '≥ 24 (≥ 12 minimum)'],
      ['Tank construction', '油罐结构', '-', 'Double-wall, UL 142 / UL 2085 or equal'],
      ['Number of bulk tanks', '储油罐数量', 'no.', '≥ 2 (concurrent maintenance)'],
      ['Transfer pump capacity / redundancy', '输油泵流量 / 冗余', 'L/min', '≥ 2× total consumption / N+1'],
      ['Day tank capacity per generator', '单机日用油箱容量', 'L', '≥ 2 h at full load'],
      ['Fuel polishing flow rate', '燃油精滤流量', 'L/h', BID],
      ['Leak detection type', '渗漏检测方式', '-', 'Continuous interstitial sensor'],
      ['Tank level gauging accuracy', '液位计精度', '%', '± 1'],
      ['Interface to BMS', '与BMS接口', '-', 'Modbus / BACnet'],
      ['Design life', '设计寿命', 'years', '≥ 30']
    ],
    std: ['NFPA 30', 'NFPA 37', 'NFPA 110', 'UL 142', 'GB 50016', 'GB 50156'],
    t: [['Tank pressure/leak test, pipe hydrostatic test, pump changeover and level alarm tests.', '油罐压力/密封试验、管道水压试验、泵切换及液位报警试验。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-07', sys: 'EL', cls: 'M', en: 'Automatic Transfer Switch (ATS)', zh: '自动转换开关（ATS）',
    fn: ['Transfers mechanical/building loads automatically between utility and generator (or two sources) on loss of supply.',
         '在电源失效时自动将机械/建筑负荷在市电与发电机（或两路电源）之间切换。'],
    ty: ['PC-class, 4-pole, 400–4,000 A, open or closed transition, with bypass-isolation for critical loads.',
         'PC级四极，400–4,000 A，开式或闭式转换，关键负荷配旁路隔离型。'],
    s: [
      ['PC class (IEC 60947-6-1) with 4-pole switching to avoid neutral current circulation.', 'PC级（IEC 60947-6-1），四极切换以避免中性线环流。'],
      ['Bypass-isolation type for loads that must be maintained without shutdown (Tier III).', '对需不停电维护的负荷（Tier III）采用旁路隔离型。'],
      ['Programmable time delays, in-phase monitor or delayed transition for motor loads.', '可编程延时，电机负荷采用同相监测或延时转换。']
    ],
    tpg: [
      ['Manufacturer / model', '制造商 / 型号', '-', BID],
      ['Utilisation category / class', '使用类别 / 等级', '-', 'AC-33A / PC class'],
      ['Rated current', '额定电流', 'A', 'Per schedule'],
      ['Number of poles', '极数', '-', '4'],
      ['Rated short-time withstand (Icw)', '额定短时耐受电流', 'kA', '≥ 50 (30 cycles)'],
      ['Transfer time (open transition)', '转换时间(开式)', 'ms', '≤ 150'],
      ['Transition type', '转换方式', '-', 'Open / delayed / closed'],
      ['Bypass-isolation', '旁路隔离', '-', 'Required for critical loads'],
      ['Communication', '通讯', '-', 'Modbus TCP']
    ],
    std: ['IEC 60947-6-1', 'UL 1008', 'GB/T 14048.11'],
    t: [['Functional transfer/retransfer tests, timing measurement, interlock checks.', '转换/回切功能试验、时间测量、联锁检查。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-08', sys: 'EL', cls: 'S', en: 'Static Transfer Switch (STS)', zh: '静态转换开关（STS）',
    fn: ['Thyristor-based switch that transfers single-corded IT loads between two UPS sources within ¼ cycle.',
         '基于晶闸管的切换装置，可在1/4周波内将单电源IT负荷在两路UPS之间切换。'],
    ty: ['3-phase 100–1,200 A, transfer < 4 ms; rack-mount 1-phase ATS for small single-corded loads.',
         '三相100–1,200 A，切换时间<4 ms；小型单电源负荷采用机架式单相ATS。'],
    s: [
      ['Break-before-make transfer within 4 ms, compatible with ITIC/CBEMA curve.', '先断后合切换时间≤4 ms，满足ITIC/CBEMA曲线。'],
      ['Redundant control logic and power supplies; maintenance bypass with Kirk-key interlocks.', '冗余控制逻辑与电源；维修旁路配钥匙联锁。'],
      ['Transformer inrush management when feeding downstream PDU transformers.', '向下游PDU变压器供电时应具备励磁涌流管理功能。']
    ],
    tpg: [
      ['Rated current / voltage', '额定电流 / 电压', 'A / V', 'Per schedule / 400'],
      ['Transfer time', '切换时间', 'ms', '≤ 4'],
      ['Short-circuit withstand', '短路耐受', 'kA', '≥ 50'],
      ['Control redundancy', '控制冗余', '-', 'Dual logic, dual PSU'],
      ['Efficiency', '效率', '%', '≥ 99.5'],
      ['Communication', '通讯', '-', 'SNMP / Modbus']
    ],
    std: ['IEC 62310-1', 'IEC 62310-2', 'UL 1008'],
    t: [['Source failure transfer test with oscilloscope recording.', '用示波器记录的电源失效切换试验。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-09', sys: 'EL', cls: 'M', en: 'Static UPS (Uninterruptible Power Supply)', zh: '静态不间断电源（UPS）',
    fn: ['Provides clean, conditioned, uninterrupted power to the IT load and rides through the gap until generators take over, using battery energy.',
         '为IT负荷提供纯净、稳定、不间断的电源，并依靠蓄电池能量在发电机接管前桥接断电间隙。'],
    ty: ['Modular or monolithic double-conversion, 500–1,600 kW per system (modules 50–250 kW), 400/415 V, efficiency 96–97% (99% eco).',
         '模块化或塔式双变换，单系统500–1,600 kW（模块50–250 kW），400/415 V，效率96–97%（ECO模式99%）。'],
    s: [
      ['On-line double-conversion VFI-SS-111 topology per IEC 62040-3, transformer-less IGBT design.', '符合IEC 62040-3的在线双变换VFI-SS-111拓扑，无变压器IGBT设计。'],
      ['Hot-swappable power modules, internal redundancy (N+1 modules) and distributed or centralised static bypass.', '功率模块可热插拔，内部冗余（N+1模块），分布式或集中式静态旁路。'],
      ['Input PF ≥ 0.99 and THDi ≤ 3% at full load to minimise upstream generator oversizing.', '满载时输入功率因数≥0.99，THDi≤3%，以减少上游发电机放大选型。'],
      ['Output PF 1.0 (kVA = kW); overload 110% for 60 min / 125% for 10 min / 150% for 1 min.', '输出功率因数1.0（kVA = kW）；过载能力110% 60 min / 125% 10 min / 150% 1 min。'],
      ['External maintenance bypass with interlocks; capability for 2N or catcher (block-redundant) architectures.', '外置维修旁路并联锁；可组成2N或后备冗余（block-redundant）架构。'],
      ['Lithium-ion battery compatibility with BMS integration; battery monitoring per jar/module.', '兼容锂电池并集成电池管理系统；按单体/模块进行电池监测。']
    ],
    tpg: [
      {g: ['General', '一般']},
      ['Manufacturer / model', '制造商 / 型号', '-', BID],
      ['Topology / classification', '拓扑 / 分类', '-', 'Double-conversion VFI-SS-111'],
      ['Rated output power (kVA / kW)', '额定输出功率(kVA / kW)', 'kVA/kW', '1,200 / 1,200 (typ.)'],
      ['Power module rating and quantity', '功率模块容量及数量', 'kW × no.', BID],
      ['Parallel capability (max. units)', '并机能力(最大台数)', 'no.', '≥ 4'],
      {g: ['Input', '输入']},
      ['Rated input voltage / tolerance', '额定输入电压 / 允许范围', 'V / %', '400 / −15 to +10'],
      ['Input frequency range', '输入频率范围', 'Hz', '45 – 65'],
      ['Input power factor at 100% load', '100%负载输入功率因数', '-', '≥ 0.99'],
      ['Input current THDi at 100% load', '100%负载输入电流THDi', '%', '≤ 3'],
      ['Walk-in / soft-start time', '软启动时间', 's', '1 – 30 adjustable'],
      {g: ['Output', '输出']},
      ['Output voltage regulation (static)', '输出电压稳定度(稳态)', '%', '± 1'],
      ['Dynamic response 0–100% step', '0–100%阶跃动态响应', '%', '± 5 (IEC 62040-3 class 1)'],
      ['Output voltage THDu (linear / non-linear)', '输出电压THDu(线性/非线性)', '%', '≤ 1 / ≤ 3'],
      ['Output power factor', '输出功率因数', '-', '1.0'],
      ['Overload capacity (inverter)', '逆变器过载能力', '% / time', '110%/60 min, 125%/10 min, 150%/1 min'],
      {g: ['Efficiency', '效率']},
      ['Double-conversion efficiency at 25 / 50 / 75 / 100% load', '双变换效率(25/50/75/100%负载)', '%', '≥ 95.5 / 96.5 / 96.5 / 96'],
      ['Eco-mode / ESS efficiency', 'ECO模式效率', '%', '≥ 99'],
      ['Heat dissipation at full load', '满载散热量', 'kW', BID],
      {g: ['Physical & environment', '外形与环境']},
      ['Operating temperature range', '工作温度范围', '°C', '0 – 40'],
      ['Acoustic noise at 1 m', '1 m处噪声', 'dB(A)', '≤ 75'],
      ['Footprint / weight', '占地 / 重量', 'mm / kg', BID],
      ['Communication', '通讯', '-', 'SNMP, Modbus TCP, dry contacts'],
      ['Design life / capacitor replacement interval', '设计寿命 / 电容更换周期', 'years', '≥ 15 / ≥ 10'],
      ['MTBF (system)', '系统平均无故障时间', 'h', BID]
    ],
    std: ['IEC 62040-1', 'IEC 62040-2', 'IEC 62040-3', 'GB/T 7260', 'YD/T 2165', 'UL 1778'],
    t: [['FAT: full-load heat run, efficiency curve, step load, transfer to bypass, battery discharge, parallel/load sharing.', 'FAT：满载温升、效率曲线、阶跃负载、切换至旁路、电池放电、并机/均流。'],
        ['Site: load-bank test 100% for 2 h, battery autonomy test, module hot-swap demonstration.', '现场：100%负载箱测试2 h、电池后备时间测试、模块热插拔演示。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-10', sys: 'EL', cls: 'M', en: 'UPS Battery System — Lithium-ion (LFP)', zh: 'UPS蓄电池系统——磷酸铁锂（LFP）',
    fn: ['Stores the energy that keeps the UPS running during the 10–60 s generator start and for the specified autonomy (typically 5–10 min).',
         '储存能量，使UPS在发电机启动的10–60 s内及规定后备时间（通常5–10 min）内持续运行。'],
    ty: ['LFP cabinets 30–100 kWh each, 5–10 min autonomy, 1/3 the footprint and weight of VRLA, 15-year design life.',
         'LFP电池柜每柜30–100 kWh，后备5–10 min，占地和重量约为VRLA的1/3，设计寿命15年。'],
    s: [
      ['Lithium iron phosphate (LiFePO4) chemistry with three-level BMS (cell, module, rack) and active balancing.', '磷酸铁锂（LiFePO4）化学体系，配三级BMS（电芯、模组、电池簇）及主动均衡。'],
      ['Third-party UL 9540A cell/module/unit test results and UL 1973 certification shall be submitted.', '应提交第三方UL 9540A电芯/模组/单元试验报告及UL 1973认证。'],
      ['Autonomy at end-of-life (EOL) and at rated UPS load ≥ specified minutes (ageing factor included).', '寿命末期在UPS额定负荷下的后备时间≥规定值（已计入老化系数）。'],
      ['Battery room with off-gas detection, ventilation and fire separation per NFPA 855 / local code.', '电池室应设离子/气体（off-gas）探测、通风及防火分隔，符合NFPA 855/当地规范。'],
      ['Each string with DC breaker, rack-level isolation and remote monitoring to BMS/DCIM.', '每组电池配直流断路器、电池簇级隔离，并远程接入BMS/DCIM监控。']
    ],
    tpg: [
      ['Manufacturer (cell / system)', '制造商(电芯 / 系统)', '-', BID],
      ['Cell chemistry / format', '电芯化学体系 / 形式', '-', 'LFP / prismatic'],
      ['Nominal string voltage / voltage window', '电池组额定电压 / 电压范围', 'V DC', BID],
      ['Installed energy per cabinet', '单柜装机能量', 'kWh', BID],
      ['Autonomy at 100% UPS load (BOL / EOL)', '100% UPS负载后备时间(初期/末期)', 'min', '≥ 7 / ≥ 5'],
      ['Max discharge rate', '最大放电倍率', 'C', '≥ 6C'],
      ['Design life at 25 °C', '25 °C设计寿命', 'years', '≥ 15'],
      ['Cycle life at 100% DoD', '100%放电深度循环寿命', 'cycles', '≥ 3,000'],
      ['Recharge time to 90%', '充电至90%时间', 'h', '≤ 2'],
      ['Operating temperature range', '工作温度范围', '°C', '18 – 30 (optimum 25)'],
      ['Footprint per cabinet / floor loading', '单柜占地 / 楼面荷载', 'm² / kN/m²', BID],
      ['Certification', '认证', '-', 'UL 1973, UL 9540A, IEC 62619'],
      ['BMS communication', 'BMS通讯', '-', 'Modbus TCP / CAN to UPS & DCIM'],
      ['Thermal runaway propagation (UL 9540A unit level)', '热失控蔓延(UL 9540A单元级)', '-', 'No propagation beyond unit']
    ],
    std: ['IEC 62619', 'IEC 62485-5', 'UL 1973', 'UL 9540A', 'NFPA 855', 'GB/T 36276'],
    t: [['Factory discharge test at rated power; site autonomy test with UPS at 100% load; BMS alarm tests.', '额定功率工厂放电试验；UPS 100%负载现场后备时间测试；BMS报警试验。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-11', sys: 'EL', cls: 'S', en: 'UPS Battery System — VRLA (Alternative)', zh: 'UPS蓄电池系统——阀控式铅酸（备选）',
    fn: ['Traditional lead-acid energy storage for UPS; lower capital cost but larger footprint, heavier, and 5–8 year replacement cycle.',
         '传统UPS铅酸储能；初投资较低，但占地大、重量大，需5–8年更换。'],
    ty: ['12 V monoblocs, 10–15 min autonomy, open racks or cabinets, 25 °C controlled room.',
         '12 V单体电池，后备10–15 min，开放支架或电池柜，室温控制在25 °C。'],
    s: [
      ['High-rate AGM VRLA, 10-year design life (Eurobat “Long Life”).', '高倍率AGM阀控式铅酸电池，设计寿命10年（Eurobat长寿命级）。'],
      ['String monitoring of voltage, internal resistance and temperature for every block.', '对每节电池监测电压、内阻和温度。'],
      ['Hydrogen ventilation calculation per IEC 62485-2; acid-resistant floor and spill containment.', '按IEC 62485-2进行氢气通风计算；设耐酸地面与泄漏收集。']
    ],
    tpg: [
      ['Manufacturer / model', '制造商 / 型号', '-', BID],
      ['Block voltage / capacity (C10)', '单体电压 / 容量(C10)', 'V / Ah', '12 / per calc.'],
      ['Number of strings / blocks per string', '电池组数 / 每组单体数', 'no.', BID],
      ['Autonomy at 100% UPS load (EOL)', '100% UPS负载后备时间(末期)', 'min', '≥ 10'],
      ['Design life at 20–25 °C', '20–25 °C设计寿命', 'years', '10 – 12'],
      ['Ageing / temperature correction factors', '老化 / 温度修正系数', '-', '1.25 / per IEEE 485'],
      ['Floor loading', '楼面荷载', 'kN/m²', BID]
    ],
    std: ['IEC 60896-21/22', 'IEC 62485-2', 'IEEE 1188', 'GB/T 19638'],
    t: [['Capacity discharge test at site; impedance baseline record.', '现场容量放电试验；建立内阻基线记录。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-12', sys: 'EL', cls: 'M', en: 'Power Distribution Unit (PDU) / Remote Power Panel (RPP)', zh: '列头配电柜（PDU）/ 远程配电盘（RPP）',
    fn: ['Distributes UPS output to the IT cabinets in the data hall with branch-circuit protection and per-circuit metering.',
         '在数据机房内将UPS输出分配到IT机柜，提供分支回路保护和逐回路计量。'],
    ty: ['150 – 400 kVA floor-standing PDU (with or without isolation transformer), RPP 225 A 84-pole.',
         '落地式PDU 150–400 kVA（带或不带隔离变压器），RPP 225 A 84回路。'],
    s: [
      ['Branch-circuit monitoring (current, kW, kWh) for every outgoing circuit, accuracy class 1.', '每个出线回路进行分支监测（电流、kW、kWh），精度1级。'],
      ['Dual-input or A/B pairing per row to support dual-corded IT equipment (2N distribution).', '每列成对配置A/B路，以支持双电源IT设备（2N配电）。'],
      ['Front-access, top or bottom cable entry; IP20 finger-safe.', '前维护，上进线或下进线；IP20防触摸。']
    ],
    tpg: [
      ['Rated capacity', '额定容量', 'kVA', '150 – 400'],
      ['Input / output voltage', '输入 / 输出电压', 'V', '400 / 400-230'],
      ['Isolation transformer (if any) K-factor', '隔离变压器(如有)K系数', '-', 'K-13'],
      ['Number of branch circuits', '分支回路数', 'no.', '≥ 84 (per panelboard)'],
      ['Branch-circuit monitoring accuracy', '分支回路监测精度', '%', '± 1'],
      ['Main breaker rating / Icu', '主断路器额定值 / Icu', 'A / kA', 'Per SLD / ≥ 35'],
      ['Efficiency (with transformer)', '效率(含变压器)', '%', '≥ 98.5'],
      ['Communication', '通讯', '-', 'Modbus TCP / SNMP'],
      ['Dimensions (W × D × H)', '外形尺寸', 'mm', BID]
    ],
    std: ['IEC 61439-2', 'UL 60950/62368', 'GB/T 7251.12'],
    t: [['Branch-circuit metering verification and thermographic scan under load.', '分支回路计量校验及带载红外热成像检测。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-13', sys: 'EL', cls: 'M', en: 'Overhead Track Busway (IT Whitespace)', zh: '机房上走线插接母线（列头母线）',
    fn: ['Overhead plug-in busbar along each rack row; tap-off boxes feed each cabinet, enabling fast, flexible power changes as densities grow.',
         '沿机柜列敷设的上走线插接母线，通过插接箱为每个机柜供电，便于随密度提高快速灵活调整。'],
    ty: ['160 – 1,250 A, 3-phase 400/415 V, A+B dual busway per row; tap-off boxes 16–63 A 3-phase with metering.',
         '160–1,250 A，三相400/415 V，每列A+B双母线；插接箱16–63 A三相带计量。'],
    s: [
      ['Continuous access slots allowing tap-off boxes to be inserted/removed live (hot-pluggable) safely.', '连续插口，允许插接箱在带电状态下安全插拔。'],
      ['Tap-off units with MCB/RCBO and integrated metering communicating via Modbus/SNMP.', '插接箱内置MCB/RCBO及集成计量，通过Modbus/SNMP通讯。'],
      ['Mechanical keying for A/B feed identification (colour-coded).', '采用颜色编码的机械防误插，区分A/B路。']
    ],
    tpg: [
      ['Rated current', '额定电流', 'A', '400 – 800 (typ.)'],
      ['Rated voltage / insulation voltage', '额定电压 / 绝缘电压', 'V', '415 / 690'],
      ['Short-circuit rating (Icw)', '短路耐受(Icw)', 'kA', '≥ 25'],
      ['Conductor material', '导体材料', '-', 'Cu or Al'],
      ['Degree of protection', '防护等级', 'IP', 'IP4X'],
      ['Tap-off rating range', '插接箱额定值', 'A', '16 / 32 / 63, 3-phase'],
      ['Metering accuracy (tap-off)', '插接箱计量精度', '%', '± 1'],
      ['Voltage drop at rated current', '额定电流下电压降', '%', '≤ 1.5'],
      ['Standard', '标准', '-', 'IEC 61439-6']
    ],
    std: ['IEC 61439-6', 'GB/T 7251.6', 'UL 857'],
    t: [['Insulation resistance and dielectric test after installation; tap-off metering verification.', '安装后绝缘电阻和介电试验；插接箱计量校验。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-14', sys: 'EL', cls: 'M', en: 'Intelligent Rack PDU (rPDU)', zh: '智能机架式PDU（rPDU）',
    fn: ['Distributes power inside each cabinet to individual servers, with metering and (optionally) per-outlet switching.',
         '在机柜内部向各服务器分配电源，具备计量功能（可选逐插口开关）。'],
    ty: ['Vertical 0U, 1-phase 32 A (7.4 kW) to 3-phase 63 A (43 kW), C13/C19 or hybrid outlets; 2 per rack (A/B), 2 per feed (4 per rack) above ≈ 43 kW; not used where integrated AI racks have OEM power shelves fed from busway tap-offs.',
         '竖装0U，单相32 A（7.4 kW）至三相63 A（43 kW），C13/C19或混合插座；每柜2条（A/B），约43 kW以上每路2条（每柜4条）；集成AI机柜使用由母线插接箱供电的OEM电源架时不使用。'],
    s: [
      ['Metered-by-outlet or switched type with network management card, environmental sensor ports.', '逐插口计量或可开关型，带网络管理卡及环境传感器接口。'],
      ['Locking outlets to prevent accidental disconnection; colour-coded A/B bodies.', '防脱插座，防止意外断开；A/B路颜色区分外壳。'],
      ['Operating temperature up to 60 °C for hot-aisle installation.', '工作温度可达60 °C，适用热通道安装。']
    ],
    tpg: [
      ['Input rating', '输入额定值', 'A / phase', 'Per rack density'],
      ['Max. load capacity', '最大负载能力', 'kW', '7.4 / 22 / 43'],
      ['Outlet quantity and type', '插座数量及类型', '-', 'e.g. 36 × C13 + 6 × C19'],
      ['Metering accuracy', '计量精度', '%', '± 1 (IEC 62053-21 class 1)'],
      ['Overcurrent protection per bank', '每组过流保护', '-', 'Hydraulic-magnetic breaker'],
      ['Operating temperature', '工作温度', '°C', '0 – 60'],
      ['Network interface / protocols', '网络接口 / 协议', '-', 'Ethernet, SNMPv3, HTTPS, Redfish'],
      ['Certifications', '认证', '-', 'IEC 62368-1, CE / CB / UL']
    ],
    std: ['IEC 62368-1', 'IEC 60884', 'IEC 60320', 'UL 62368-1'],
    t: [['Sample load test, network monitoring integration test with DCIM.', '抽样负载试验，与DCIM的网络监控集成测试。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-15', sys: 'EL', cls: 'S', en: 'Medium Voltage Power Cables', zh: '中压电力电缆',
    fn: ['Connect utility intake, MV switchgear, transformers and MV generators.', '连接市电进线、中压开关柜、变压器及中压发电机。'],
    ty: ['Single-core XLPE, Cu or Al, 12/20 (24) kV, 95–630 mm², copper wire screen.', '单芯XLPE绝缘，铜或铝导体，12/20(24) kV，95–630 mm²，铜丝屏蔽。'],
    s: [
      ['Cross-linked polyethylene insulation, LSZH outer sheath inside buildings.', '交联聚乙烯绝缘，建筑内采用低烟无卤外护套。'],
      ['Diverse routing of A/B feeders in separate trenches/fire compartments.', 'A/B路馈线分设电缆沟/防火分区，路径分离。'],
      ['Cable sizing to include grouping, soil thermal resistivity and short-circuit withstand.', '截面选择应计及成组敷设、土壤热阻及短路耐受。']
    ],
    tpg: [
      ['Rated voltage U0/U (Um)', '额定电压U0/U(Um)', 'kV', '12/20 (24)'],
      ['Conductor material / cross-section', '导体材料 / 截面', '- / mm²', 'Cu / per calc.'],
      ['Insulation / sheath', '绝缘 / 护套', '-', 'XLPE / LSZH (indoor), PE (buried)'],
      ['Max. conductor temperature (normal / SC)', '导体最高温度(正常 / 短路)', '°C', '90 / 250'],
      ['Screen short-circuit rating', '屏蔽短路容量', 'kA / s', 'Per earth fault study'],
      ['Flame retardance', '阻燃性能', '-', 'IEC 60332-3 Cat. A'],
      ['Partial discharge (routine)', '局部放电(例行)', 'pC', '≤ 5 at 1.73 U0']
    ],
    std: ['IEC 60502-2', 'GB/T 12706.2', 'IEC 60332-3', 'IEC 60840 (HV)'],
    t: [['Site VLF/AC withstand test and sheath test after installation.', '安装后现场超低频/交流耐压试验及护套试验。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-16', sys: 'EL', cls: 'S', en: 'LV Power Cables & Wiring', zh: '低压电力电缆及布线',
    fn: ['Feeders and final circuits from switchboards to UPS, PDUs, mechanical plant and building loads.', '从配电柜至UPS、PDU、机械设备和建筑负荷的馈线和末端回路。'],
    ty: ['0.6/1 kV Cu XLPE/LSZH, fire-resistant cables (IEC 60331) for life-safety circuits.', '0.6/1 kV铜芯XLPE/低烟无卤，生命安全回路采用耐火电缆（IEC 60331）。'],
    s: [
      ['Voltage drop ≤ 3% feeder + final circuit; neutral sized for triplen harmonics.', '馈线与末端回路总压降≤3%；中性线截面计及三次谐波。'],
      ['Fire-resistant cables for fire pumps, smoke control, emergency lighting and gas suppression release.', '消防泵、防排烟、应急照明及气体灭火释放回路采用耐火电缆。']
    ],
    tpg: [
      ['Rated voltage', '额定电压', 'kV', '0.6/1'],
      ['Conductor', '导体', '-', 'Annealed Cu class 2'],
      ['Insulation / sheath', '绝缘 / 护套', '-', 'XLPE / LSZH'],
      ['Fire performance (general / life safety)', '燃烧性能(一般 / 生命安全)', '-', 'IEC 60332-3 / IEC 60331 + BS 8491'],
      ['Smoke density / halogen', '烟密度 / 卤素', '-', 'IEC 61034 / IEC 60754'],
      ['Max. voltage drop', '最大压降', '%', '≤ 3']
    ],
    std: ['IEC 60502-1', 'IEC 60364-5-52', 'GB/T 12706.1', 'GB 31247'],
    t: [['Insulation resistance and continuity testing; torque marking.', '绝缘电阻与导通测试；螺栓力矩标记。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-17', sys: 'EL', cls: 'S', en: 'Active Harmonic Filter & Power Factor Correction', zh: '有源滤波器及功率因数补偿',
    fn: ['Mitigates harmonic currents from IT/UPS/VFD loads and corrects power factor to meet utility (e.g. PLN / State Grid) limits and IEEE 519.',
         '抑制IT/UPS/变频器负荷产生的谐波电流，校正功率因数，满足电网（如PLN/国家电网）及IEEE 519要求。'],
    ty: ['Rack-mounted AHF modules 100–300 A, parallelable; detuned capacitor banks where required.', '机架式有源滤波模块100–300 A，可并联；必要时配调谐电容补偿柜。'],
    s: [
      ['Harmonic compensation up to 50th order, response time < 1 ms.', '可补偿至50次谐波，响应时间<1 ms。'],
      ['Target THDi at PCC ≤ 5% and PF ≥ 0.95.', '公共连接点THDi≤5%，功率因数≥0.95。']
    ],
    tpg: [
      ['Rated compensation current', '额定补偿电流', 'A', 'Per harmonic study'],
      ['Harmonic range', '谐波补偿范围', 'order', '2 – 50'],
      ['Response time', '响应时间', 'ms', '< 1'],
      ['Losses', '损耗', '% of rating', '≤ 3'],
      ['Resulting THDi at PCC', '公共连接点THDi', '%', '≤ 5']
    ],
    std: ['IEEE 519', 'IEC 61000-3-12', 'GB/T 14549'],
    t: [['Power quality measurement before/after commissioning (Class A analyser, IEC 61000-4-30).', '调试前后进行电能质量测量（A级分析仪，IEC 61000-4-30）。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-18', sys: 'EL', cls: 'S', en: 'Earthing (Grounding) & Bonding System', zh: '接地及等电位联结系统',
    fn: ['Provides personnel safety, fault clearing and a low-noise reference for IT equipment (mesh-bonded network, TMGB/TGB).',
         '保障人身安全、故障切除，并为IT设备提供低噪声参考地（网状等电位联结、总/分接地母排）。'],
    ty: ['Ring earth electrode + building mesh, ≤ 1 Ω combined; signal reference grid / mesh-BN under raised floor.', '环形接地极+建筑网格，联合接地电阻≤1 Ω；架空地板下设信号参考网格/网状联结。'],
    s: [
      ['Combined earthing system resistance ≤ 1 Ω (≤ 0.5 Ω preferred for telecom).', '联合接地电阻≤1 Ω（通信优先≤0.5 Ω）。'],
      ['Telecommunications bonding per TIA-607: TMGB in entrance room, TGB in each telecom space, bonding to every rack.', '按TIA-607进行通信接地：进线间设TMGB，各通信空间设TGB，每个机柜均联结。'],
      ['Exothermic welding for buried connections; inspection pits for testing.', '埋地连接采用放热焊接；设测试检查井。']
    ],
    tpg: [
      ['Earth resistance (combined)', '联合接地电阻', 'Ω', '≤ 1'],
      ['Earth electrode material', '接地极材料', '-', 'Cu-bonded steel rods / Cu tape'],
      ['Main earthing conductor size', '主接地导体截面', 'mm²', '≥ 120 Cu'],
      ['TMGB / TGB busbar size', 'TMGB / TGB母排规格', 'mm', '≥ 6 × 100 Cu'],
      ['Rack bonding conductor', '机柜联结导体', 'mm²', '≥ 16 Cu (6 AWG)'],
      ['Signal reference grid spacing', '信号参考网格间距', 'mm', '600 – 1,200']
    ],
    std: ['IEC 60364-5-54', 'IEEE 80', 'IEEE 1100', 'TIA-607-D', 'GB 50169', 'GB 50689'],
    t: [['Fall-of-potential earth resistance test; continuity of bonding.', '电位降法接地电阻测试；联结导通测试。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-19', sys: 'EL', cls: 'S', en: 'Lightning Protection & Surge Protection (SPD)', zh: '防雷及浪涌保护（SPD）',
    fn: ['Protects the structure and equipment from direct strikes and surges entering via power, data and metallic services.', '保护建筑物和设备免受直击雷及经电源、信号和金属管线侵入的浪涌危害。'],
    ty: ['LPL I or II per IEC 62305 risk assessment; Type 1+2 SPD at main incomers, Type 2 at sub-boards, Type 3 near equipment.', '按IEC 62305风险评估确定LPL I或II级；总进线设Type 1+2 SPD，分配电柜Type 2，设备前Type 3。'],
    s: [
      ['Risk assessment per IEC 62305-2; air-termination by mesh/rolling-sphere method.', '按IEC 62305-2进行风险评估；接闪器按网格法/滚球法布置。'],
      ['Coordinated SPD cascade with monitoring contacts to BMS.', '多级SPD配合，状态触点接入BMS。']
    ],
    tpg: [
      ['Lightning protection level', '防雷等级', 'LPL', 'I or II'],
      ['Down-conductor spacing', '引下线间距', 'm', '≤ 10 (LPL I) / ≤ 15 (LPL II)'],
      ['Main SPD impulse current Iimp (10/350)', '总进线SPD冲击电流Iimp', 'kA', '≥ 25 per pole'],
      ['Voltage protection level Up', '电压保护水平Up', 'kV', '≤ 1.5'],
      ['Data-line SPD category', '信号线SPD类别', '-', 'IEC 61643-21 C2/D1']
    ],
    std: ['IEC 62305-1~4', 'IEC 61643-11', 'IEC 61643-21', 'GB 50057', 'GB 50343'],
    t: [['Continuity and earth tests; visual inspection of air terminals and SPD status.', '导通与接地测试；接闪器及SPD状态目视检查。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-20', sys: 'EL', cls: 'S', en: 'Lighting, Emergency Lighting & Small Power', zh: '照明、应急照明及小动力',
    fn: ['General LED lighting with occupancy control in white space; emergency/exit lighting for egress; convenience outlets.', '机房LED照明并配人体感应控制；疏散用应急/出口照明；检修插座。'],
    ty: ['500 lx at 1 m in data halls (cold aisle), ≥ 90-min emergency autonomy.', '数据机房距地1 m处500 lx（冷通道），应急照明持续时间≥90 min。'],
    s: [
      ['LED luminaires ≥ 130 lm/W, DALI or occupancy sensor control; lights off when unoccupied.', 'LED灯具光效≥130 lm/W，DALI或人体感应控制；无人时关闭。'],
      ['Emergency lighting self-test or central battery system per IEC 60598-2-22.', '应急照明自检或集中电源系统，符合IEC 60598-2-22。']
    ],
    tpg: [
      ['Maintained illuminance – data hall / plant rooms', '维持照度——数据机房 / 设备间', 'lx', '500 / 300'],
      ['Luminaire efficacy', '灯具光效', 'lm/W', '≥ 130'],
      ['Colour rendering index', '显色指数', 'Ra', '≥ 80'],
      ['Emergency duration', '应急持续时间', 'min', '≥ 90'],
      ['Control system', '控制系统', '-', 'DALI / occupancy sensors']
    ],
    std: ['EN 12464-1', 'IEC 60598-2-22', 'GB 50034', 'GB 51309'],
    t: [['Illuminance survey and emergency duration test.', '照度测量及应急持续时间测试。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-21', sys: 'EL', cls: 'S', en: 'Load Banks (Commissioning & Testing)', zh: '负载箱（调试与测试用）',
    fn: ['Simulate IT and mechanical heat/electrical load during Level 4–5 commissioning before real IT equipment is installed.', '在真实IT设备安装前，于4–5级调试阶段模拟IT及机械的热/电负荷。'],
    ty: ['Rack-mount heat-load banks 3–30 kW (simulate server airflow) and portable 500–2,000 kW resistive/reactive banks.', '机架式热负载3–30 kW（模拟服务器气流）及移动式500–2,000 kW阻性/感性负载箱。'],
    s: [
      ['Rack-type heat load banks shall replicate server ΔT (10–15 K) and airflow.', '机架式热负载应模拟服务器温差（10–15 K）和风量。'],
      ['Digital control with step loading and data logging.', '数字化控制，支持分级加载与数据记录。']
    ],
    tpg: [
      ['Load capacity per unit', '单台负载容量', 'kW', '3 – 30 (rack) / 500 – 2,000 (portable)'],
      ['Load step resolution', '加载分级', 'kW', '≤ 1 (rack)'],
      ['Air ΔT across unit', '进出风温差', 'K', '10 – 15'],
      ['Power factor (portable)', '功率因数(移动式)', '-', '1.0 and 0.8']
    ],
    std: ['IEC 60034 (test methods)', 'ASHRAE Guideline 0', 'ASHRAE Guideline 1.1'],
    t: [['Calibration certificate before use.', '使用前提供校准证书。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-23', sys: 'EL', cls: 'M', en: 'Battery Energy Storage System (BESS)', zh: '电池储能系统（BESS）',
    fn: ['Grid-scale LFP storage that smooths AI/GPU load swings, shaves utility peaks, firms on-site solar and supports the grid connection — complementary to (not a replacement for) UPS and generators.',
         '电网级磷酸铁锂储能，用于平抑AI/GPU负荷波动、削减市电峰值、稳定现场光伏出力并支撑并网——是UPS和发电机的补充而非替代。'],
    ty: ['Containerised 20-ft LFP blocks of ≈ 3.5–5 MWh with 0.5C–1C PCS; 10–25% of IT MW for 1–2 h is typical for AI campuses.', '20英尺集装箱式LFP单元约3.5–5 MWh，PCS 0.5C–1C；AI园区通常按IT MW的10–25%、1–2 h配置。'],
    s: [
      ['LFP cells, liquid-cooled battery containers, UL 9540 / UL 9540A tested system with IEC 62619 cells and IEC 62933 system design.', '磷酸铁锂电芯、液冷电池集装箱，系统通过UL 9540/UL 9540A测试，电芯符合IEC 62619，系统设计符合IEC 62933。'],
      ['Grid-forming capable PCS with fast frequency response (< 100 ms) for GPU power-transient buffering.', 'PCS具备构网能力及快速频率响应（<100 ms），用于缓冲GPU功率瞬变。'],
      ['Energy management system integrated with EPMS/BMS: peak shaving (PLN WBP hours), solar firming, ramp-rate control.', '能量管理系统与EPMS/BMS集成：峰值削减（PLN峰时段）、光伏稳定、爬坡率控制。'],
      ['Separation distances, deflagration venting and fire suppression per NFPA 855; off-gas detection in each container.', '按NFPA 855设置安全间距、泄爆及灭火；每个集装箱设逸出气体探测。'],
      ['Capacity guarantee: usable energy at end of contract ≥ 70–80% of BOL; augmentation plan included.', '容量保证：合同期末可用能量≥初期的70–80%；包含扩容补充计划。']
    ],
    tpg: [
      ['Manufacturer (cells / container / PCS)', '制造商（电芯/集装箱/PCS）', '-', BID],
      ['Rated power / usable energy (BOL)', '额定功率/初期可用能量', 'MW / MWh', 'Per assessment'],
      ['Duration at rated power', '额定功率持续时间', 'h', '1 – 2'],
      ['Cell chemistry', '电芯化学体系', '-', 'LFP'],
      ['Round-trip efficiency (AC–AC)', '往返效率（交流-交流）', '%', '≥ 87'],
      ['Response time (0 → 100% power)', '响应时间（0→100%功率）', 'ms', '≤ 100'],
      ['Cycle life at 80% DoD', '80%放电深度循环寿命', 'cycles', '≥ 6,000'],
      ['Design life / energy retention at end', '设计寿命/期末容量保持', 'years / %', '≥ 15 / ≥ 70'],
      ['Container energy & dimensions', '集装箱能量及尺寸', 'MWh / ft', '3.5 – 5 / 20'],
      ['Thermal management', '热管理', '-', 'Liquid-cooled'],
      ['Fire testing', '火灾测试', '-', 'UL 9540A (cell/module/unit/installation)'],
      ['Grid code compliance', '并网规范符合性', '-', 'PLN grid code / IEC 62933'],
      ['Communication', '通讯', '-', 'Modbus TCP / IEC 61850 / DNP3']
    ],
    std: ['IEC 62933', 'IEC 62619', 'UL 9540', 'UL 9540A', 'NFPA 855', 'IEC 62477-1'],
    t: [['FAT of PCS and containers; site commissioning incl. capacity test, response-time test and EMS functions.', 'PCS及集装箱工厂测试；现场调试含容量测试、响应时间测试及EMS功能测试。']] },

  /* ------------------------------------------------------------------ */
  { id: 'EL-22', sys: 'EL', cls: 'S', en: 'Power Cable Containment (Tray, Ladder & Trunking)', zh: '电力电缆桥架（托盘、梯架及线槽）',
    fn: ['Supports and segregates power cables between plant rooms and the data hall.', '在设备间与数据机房之间支撑并分隔电力电缆。'],
    ty: ['Hot-dip galvanised or stainless ladder 300–900 mm, max 40–50% fill.', '热镀锌或不锈钢梯架300–900 mm，填充率≤40–50%。'],
    s: [
      ['Separation between power and data containment ≥ 300 mm (or per TIA-569 / EN 50174-2).', '电力与数据桥架间距≥300 mm（或按TIA-569 / EN 50174-2）。'],
      ['Seismic bracing in seismic design categories C–F.', '抗震设计类别C–F地区设抗震支吊架。']
    ],
    tpg: [
      ['Material / finish', '材料 / 表面处理', '-', 'HDG steel (ISO 1461) / SS316 outdoors'],
      ['Safe working load at span', '跨距安全工作荷载', 'kg/m', 'Per IEC 61537 class'],
      ['Max. fill ratio', '最大填充率', '%', '≤ 40 (power)'],
      ['Seismic restraint', '抗震支撑', '-', 'Per local seismic code']
    ],
    std: ['IEC 61537', 'NEMA VE-1', 'GB 50981 (seismic)'],
    t: [['Visual inspection and earthing continuity.', '目视检查及接地连续性测试。']] }
  );
})(typeof window !== 'undefined' ? window : globalThis);
