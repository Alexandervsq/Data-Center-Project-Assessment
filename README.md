# Data Center Project Assessment · 数据中心项目评估

An interactive planning & feasibility assessment tool for data center projects in **Indonesia**, with an English or Simplified Chinese interface.
The owner enters only what they know — project name, province and location, facility type and design IT load (and, optionally, the PLN tariff). The tool **proposes every other parameter** from its reference database and engineering standards, explains each proposal, lets the owner override any of them, and produces a **project proposal report** exportable to Word, Excel and PDF. Several projects can be kept side by side in a browser workspace.

面向**印度尼西亚**数据中心项目的交互式规划与可行性评估工具，界面可选英文或简体中文。业主只需输入已知信息——项目名称、省份与地点、设施类型及设计IT负载（可选PLN电价），工具即依据参考数据库与工程标准**自动提出其余全部参数**并说明依据；业主可修改任何参数，并可将**项目建议书**导出为Word、Excel及PDF。浏览器工作区可同时保存多个项目。

**Live site:** https://alexandervsq.github.io/Data-Center-Project-Assessment/ (after GitHub Pages is enabled — see below)

---

## Features · 功能

| Module | What it does |
|---|---|
| **Project assessment** · 项目评估 | Workspace with a **sub-menu**: *Workspace* (My projects, Reference library), *Inputs* (5 steps, one page each, with live results), *Results* (13 pages) and *Report* (export). The workspace may hold **zero projects**: the 11 reference benchmark designs are shown as examples — open one **read-only** to see its complete assessment, or **use it as a template** and edit every value. Projects can be created blank, duplicated, deleted (down to none), imported and exported as JSON. Input steps — *Project & site*, *Capacity & racks*, *Resilience, power & storage*, *Cooling & sustainability*, *Commercial & financial* — carry **AUTO** badges with their basis; editing marks a value **MANUAL** and **↺** restores the proposal. Result pages: Summary, Site & region, IT & racks, Resilience & power, Cooling (decision matrix), Building & space, Fire · security · monitoring, Equipment list, Cost & finance, Schedule & staffing, Risks, Permits & standards, Parameter register. USD / IDR / CNY display. Deep links: `#assess/<page>` (e.g. `#assess/library`, `#assess/ref/A08`, `#assess/in2`, `#assess/fin`). |
| **Proposal report** · 项目建议书 | 13-section report (executive summary, project definition with Owner / Proposed / Manual source, site, IT platforms, Tier & power with standards cross-reference, cooling decision matrix, space, fire/security, equipment list, cost & cash flow, schedule, risks, permits, parameter register). **Word** (.docx with charts), **Excel** (.xlsx, one sheet per section + cash-flow sheet with live NPV/IRR formulas) and **PDF** (print view). |
| **Project Technology Simulation** · 项目技术模拟 | Menu next to *Overview* and a quick-start card on the home page. Five one-slide interactive simulations in the CCEPC technology-card format — **Data Center Facility** (whole-system integration), **Critical Power Chain**, **Chilled-Water Air Cooling**, **Direct Liquid Cooling** (AI racks) and **Fire · Security · Monitoring**. Each 1920 × 1080 slide shows the drawn process with animated flows, a principle panel, support chips, KPIs and five tiles; every unit is a hotspot that opens a detail panel with **its own schematic illustration** (105 drawings), how it works, key formula, step-by-step calculator, TPG excerpt, requirements, standards, tests, O&M and related links, plus theory, FAQ, design-basis and glossary panels. Numbers come from the assessment engine for a selectable **design basis** (any benchmark or a workspace project). Calculators are **linked**: changing a source input (e.g. maximum demand, Tier, battery chemistry, room area, camera resolution) recalculates the dependent inputs from code / standard rules (IEC 60076, IEC 61439, IEC 62271, NFPA 110 / 855 / 2001 / 72, Uptime / TIA-942, ASHRAE, AHRI) — shown as AUTO with the rule; any AUTO value can be overwritten (MANUAL) and restored with ↺. The rule table is in Part K §33 of the specification. **Expand** keeps full screen when the language is switched; links to the equipment / TPG library and to the assessment open in a **new tab** so the simulation stays open. ← → between panels, Esc closes, F expands. Deep links: `#sim/<CARD>/<panel>` (old `#cards/…` links still work). |
| **Indonesia site database** · 印尼场地数据库 | 38 provinces and 47 data-center locations with design dry/wet-bulb, elevation, climate class, seismic and flood exposure, land and water prices, 2026 provincial minimum wage, logistics cost factor, DC-hub status and PLN grid system (JAMALI, Sumatra, Batam, Kalimantan, Sulawesi, Nusa Tenggara, Maluku, Papua); PLN tariffs Q4 2026 (B-3/TM, I-3/TM, I-4/TT) and PLN REC price. |
| **IT platforms & cabinets** · IT平台与机柜 | 16 rack platforms — NVIDIA GB300 / GB200 NVL72, Vera Rubin NVL144 and Kyber (provisional), HGX B300 liquid/air, H200, AMD MI355X, Huawei CloudMatrix 384, inference PCIe, general-purpose 1U/2U, high-density, OCP ORv3, storage, network, edge — with design/peak kW, cooling mode, liquid share, rack size, weight and GPUs per rack; 5 cabinet ranges (integrated OEM, Vertiv VR, Schneider NetShelter SX Gen2, Rittal VX IT, generic) with widths, depths, heights and load ratings. |
| **Proposal logic** · 建议逻辑 | Type → platform mix and high-density share; IT load + platform → rack count and density; criticality and size → Uptime Tier; Tier + PLN grid reliability → generator fuel autonomy; Tier + battery chemistry → UPS autonomy; AI swings / weak grid / renewables → BESS (LFP); weighted cooling decision matrix (efficiency, water, scale, CAPEX, maturity in Indonesia, IT compatibility) with feasibility limits — e.g. why a 25 MW edge site in Medan uses chilled-water CRAH/fan walls rather than DX CRAC; target PUE and renewable share; lease price by type and market; WACC, tax, contingency, staff cost by provincial wage. 47 proposed parameters in total. |
| **Reference library** (inside Project Assessment) · 参考项目库 | 11 Indonesian benchmark designs (250 kW edge Surabaya → 600 MW AI campus Karawang, Tier IV government DC at IKN, Batam AI factory, Bandung highland, Medan regional edge) computed by the engine, plus 22 real projects — 11 in Indonesia (DCI, BDx, NTT, Princeton Digital, DayOne, Digital Edge, NeutraDC Nxera, PDN, Microsoft, AWS, Google) and 11 regional/global with sources. Each reference has a detail page (design basis, main systems, 12 key figures, requirements, lessons, risks, related references or comparable benchmarks); benchmarks can be viewed as read-only examples or used as templates, real projects can be modelled in Indonesia. The former *Reference Projects* menu (`#refs`) now opens this library. |
| **Equipment & TPG** · 设备与TPG | 80 major and secondary equipment items (incl. EL-23 BESS) across 7 systems, each with function, typical ratings, specification clauses, standards, tests and a Technical Particulars & Guarantees schedule (600 parameters), downloadable as CSV. |
| **Knowledge base** · 知识库 | Companion documents, Rev. 2 (67-slide PPTX deck, 127-page DOCX specification with Part K project-development guidance), what a data center is, types and sizes, Tier cross-reference, spaces, power chain & storage, cooling technologies and ASHRAE envelope, Indonesia context (PLN systems, tariffs), lifecycle, commissioning L1–L5, feasibility checklist. |
| **Standards & regulations** · 标准与法规 | 65 codes, standards and regulations — 20 Indonesian (PP 28/2025 OSS-RBA, KBLI 2025 63102, Permenkomdigi 5/2025, PP 16/2021, PP 22/2021, SNI 8799, SNI 1726, PUIL, PLN tariffs …) plus international, US, EU, China and Singapore. |
| **Glossary** · 术语表 | 58 terms with Chinese equivalents. |

## Method (planning level, ±25–30%) · 方法

* **Climate** from the location's design dry-/wet-bulb (tropical lowland, highland, tropical dry) adjusts cooling energy, water use and design-day PUE.
* **Electrical:** maximum demand → PLN MVA and voltage class (TM 20 kV / TT 150 kV / EHV), transformers, generators (continuous rating, 0.27 L/kWh), fuel storage, UPS and LFP/VRLA batteries, busway or PDUs, BESS (≈ USD 280/kWh) — all with Tier redundancy.
* **Mechanical:** chillers, towers, CRAH/fan walls, rear-door HX, IEC, CDUs, dry coolers, thermal storage, water use.
* **Space:** white space per rack type, electrical/mechanical/support rooms, GFA, storeys, yards, substation, site area and floor loading from the heaviest rack.
* **Cost:** Greater-Jakarta benchmark USD 10.5 M/MW (Tier III, 10–30 MW) × location logistics × Tier × scale × cooling + utility connection + land + contingency + BESS (+ optional IT hardware). OPEX: PLN energy, maintenance, staff (provincial wage), insurance, water, RECs, BESS peak-shaving saving.
* **Finance:** cash flow aligned with the programme — land/utility up-front, phase-1 spend rising to Ready-for-Service, later phases one year ahead of capacity, occupancy ramp, tax, depreciation, exit value → IRR, NPV, payback, levelised cost; owner-occupied mode → TCO vs. leasing.
* **Schedule, staffing and risk:** programme to RFS (permits, PLN energisation, long-lead procurement, construction, L1–L5), 24/7 staffing, rule-based risk register.

The Project Technology Simulation follows the CCEPC technology-card format (one infographic slide per technology, hidden hotspots, detail panels with calculators), ported from Python to JavaScript so that it renders inside the website and stays in sync with the knowledge base and the engine. Unit and theory illustrations live in `assets/data/tc-illustrations.js`.

Assumptions live in `assets/js/engine.js`, `assets/js/propose.js` and `assets/data/*.js`. They are editable planning values — calibrate with a quantity surveyor, PLN and market data for each project.

## Project structure · 目录结构

```
index.html                    single-page app (full-width layout)
assets/css/app.css            theme ("cold aisle / hot aisle": indigo, cyan, coral)
assets/js/engine.js           calculation engine (pure functions, also runs in Node)
assets/js/propose.js          proposal layer: AUTO parameters, reasons, overrides, cooling decision matrix
assets/js/report.js           proposal report → HTML/PDF, DOCX, XLSX
assets/js/techcard.js         technology-card engine: drawing library, slide layout, panels, calculators, viewer
assets/css/techcard.css       technology-card styles (all classes prefixed tc-)
assets/data/tc-common.js      card knowledge layer: unit texts, calculators, theory, inside views
assets/data/tc-card-*.js      the five cards (dc, pwr, chw, dlc, fsm)
assets/img/                   CCEPC logo strip used in the card header
assets/js/app.js              workspace, form, report panels, libraries
assets/js/charts.js           dependency-free SVG charts
assets/js/i18n.js             English / 简体中文
assets/data/eq-*.js           equipment database with specification clauses & TPG
assets/data/kb-core.js        tiers, types, spaces, cooling, standards, glossary, lifecycle
assets/data/kb-indonesia.js   provinces, locations, PLN grids & tariffs, climates
assets/data/kb-racks.js       IT rack platforms, cabinet ranges, type mix
assets/data/kb-references.js  benchmark designs & real projects
assets/vendor/                docx.js and ExcelJS (MIT, loaded only when exporting)
downloads/                    companion PPTX and DOCX
```

No build step. Everything runs in the browser; projects are stored in the browser's localStorage — use **Export workspace** to back up or share them.

## Run locally · 本地运行

Serve the folder (exports load their libraries on demand, so use a local server rather than opening the file directly):

```bash
python -m http.server 8000
```

## Publish with GitHub Pages · 发布

Repository → **Settings → Pages → Build and deployment → Deploy from a branch → `main` / root** → Save. The site appears at `https://alexandervsq.github.io/Data-Center-Project-Assessment/`.

## Sources · 主要来源

Uptime Institute Tier Standard · ANSI/TIA-942-C · ASHRAE TC 9.9 · ISO/IEC 22237 / EN 50600 · GB 50174 · SNI 8799 (BSN) · NFPA 75/76/855 · IEC 62933 / UL 9540A · PLN tariff adjustment Q4 2026 · Kemnaker UMP 2026 · NVIDIA / HPE GB300 NVL72 documentation · Vertiv, Schneider Electric, Rittal cabinet data · operator press releases and trade press for real projects (links in the app).

## Disclaimer · 声明

Results are indicative planning values for early decision-making. Final design must follow site surveys, PLN studies, local codes, the Authority Having Jurisdiction and qualified designers.
评估结果为规划阶段参考值，仅供早期决策使用；最终设计须依据场地勘察、PLN研究、当地规范、主管部门要求及具资质的设计单位。

---

proudly presented by **乔书亚 Alexander** — CCEPC Indonesia | 都市环保印尼公司
