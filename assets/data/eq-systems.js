/* Data Center Project Assessment — shared knowledge base
 * System (discipline) catalogue. Loaded by the website and by the
 * Word / PowerPoint generators (Node), so keep it plain ES5 data.
 * Row formats used by the equipment files:
 *   fn  : [en, zh]                      function / purpose
 *   ty  : [en, zh]                      typical sizes / ratings
 *   s   : [[en, zh], ...]               specification clauses
 *   tpg : [[param_en, param_zh, unit, required], {g:[en, zh]}, ...]
 *   t   : [[en, zh], ...]               inspection & tests
 *   std : ['code', ...]                 governing standards
 */
(function (g) {
  var D = g.DCDB || (g.DCDB = { systems: [], equipment: [] });
  D.systems = [
    { id: 'EL', color: '#E8505B', icon: 'bolt',
      en: 'Electrical Power Systems', zh: '电气供配电系统',
      d: ['Receives utility power, transforms, conditions, backs it up and distributes it to every IT rack without interruption.',
          '接收市电，经变压、调理、备用后，不间断地分配到每一个IT机柜。'] },
    { id: 'ME', color: '#0891B2', icon: 'snow',
      en: 'Mechanical & Cooling Systems', zh: '暖通与制冷系统',
      d: ['Removes the heat produced by IT equipment and keeps server inlet air or coolant within the allowable envelope.',
          '排除IT设备产生的热量，使服务器进风或冷却液保持在允许范围内。'] },
    { id: 'IT', color: '#4F46E5', icon: 'server',
      en: 'IT & Telecommunication Infrastructure', zh: 'IT与通信基础设施',
      d: ['Cabinets, containment, cabling and network that physically host and connect the compute, storage and network equipment.',
          '机柜、通道封闭、布线与网络，用于承载并连接计算、存储和网络设备。'] },
    { id: 'FP', color: '#DC2626', icon: 'fire',
      en: 'Fire Protection & Life Safety', zh: '消防与生命安全系统',
      d: ['Detects fire at the earliest stage and suppresses it without damaging IT equipment, while protecting occupants.',
          '在最早期探测火情，并在不损坏IT设备的前提下灭火，同时保障人员安全。'] },
    { id: 'SC', color: '#7C3AED', icon: 'shield',
      en: 'Physical Security Systems', zh: '物理安防系统',
      d: ['Layered physical protection from the site perimeter to the individual rack: access control, CCTV, intrusion and anti-ram measures.',
          '从场地周界到单个机柜的分层物理防护：门禁、视频监控、入侵报警与防冲撞设施。'] },
    { id: 'MC', color: '#059669', icon: 'monitor',
      en: 'Monitoring & Control Systems', zh: '监控与管理系统',
      d: ['BMS, EPMS and DCIM give operators real-time visibility and control of power, cooling, environment and capacity.',
          'BMS、EPMS与DCIM使运维人员实时掌握并控制电力、制冷、环境与容量。'] },
    { id: 'CS', color: '#B45309', icon: 'building',
      en: 'Civil, Structural & Architectural', zh: '土建、结构与建筑',
      d: ['The building, floors, envelope, fire compartments and yards that physically protect and support all systems.',
          '为所有系统提供物理保护与承载的建筑、楼板、围护结构、防火分区及室外场地。'] }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
