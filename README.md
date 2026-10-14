# Data Center Project Assessment · 数据中心项目评估

An interactive, bilingual (English / 简体中文 / bilingual view) planning & feasibility assessment tool for data center projects.
The owner describes the facility — location, type, capacity, racks, density, Tier, cooling and commercial assumptions — and the tool derives the requirements, systems, equipment quantities, space, utilities, cost, schedule, operations and risks, benchmarked against a reference project database.

交互式中英双语数据中心项目规划与可行性评估工具。业主输入地点、类型、容量、机柜、密度、等级、制冷及商业假设，工具即推导所需的要求、系统、设备数量、空间、公用设施、投资、进度、运营及风险，并与参考项目数据库对标。

**Live site:** https://alexandervsq.github.io/Data-Center-Project-Assessment/ (after GitHub Pages is enabled — see below)

---

## Features · 功能

| Module | What it does |
|---|---|
| **Assessment** · 项目评估 | 5-step input form → live report with 11 panels: Summary, Requirements & Basis of Design, Power, Cooling, Space & Site, Fire/Security/Monitoring, Equipment list (BOQ), Cost & Finance, Schedule & Staffing, Risks, Standards. Save / load / import / export (JSON, CSV), print to PDF, USD / IDR / CNY display. |
| **Reference projects** · 参考项目 | 10 benchmark reference designs (edge → 100 MW hyperscale, AI factory, Tier IV government, China hub, Nordic) with complete feasibility data computed by the engine, plus 12 real-world public projects (Jakarta, Batam, US AI campuses, Meta, Google, Tencent) with sources. One click loads a benchmark into the assessment. |
| **Equipment & TPG** · 设备与TPG | 79 major and secondary equipment items across 7 systems, each with function, typical ratings, specification clauses, standards, tests and a Technical Particulars & Guarantees schedule (612 parameters) — downloadable as CSV. |
| **Knowledge base** · 知识库 | What a data center is, types and size classes, Tier/TIA/EN 50600/GB 50174/SNI 8799 cross-reference, functional spaces, power chain, cooling technologies, ASHRAE envelope, lifecycle, commissioning L1–L5, feasibility checklist. |
| **Standards** · 规范标准 | 44 codes & standards (International, US, EU, China, Indonesia, Singapore) filterable by region and discipline. |
| **Glossary** · 术语表 | 58 bilingual terms. |
| **Downloads** · 下载 | Companion *Knowledge Base deck (PPTX)* and *Technical Specification & TPG (DOCX)* in `downloads/`. |

## Method (planning level, ±25–30%) · 方法

* IT load = MW, or racks × density (standard + high-density share).
* PUE = 1 + cooling + electrical losses + lighting/other; cooling coefficients by technology (DX, air-cooled chillers, water-cooled chillers, indirect evaporative, direct liquid cooling, immersion) and climate (tropical, subtropical, hot-dry, temperate, cold).
* Maximum demand from the design-day PUE plus battery recharge → utility MVA and voltage class, transformers, generators (continuous rating, 0.27 L/kWh fuel), UPS and Li-ion/VRLA batteries — all with Tier redundancy (N, N+1, 2N).
* Chillers, cooling towers, CRAH/fan walls/in-row, CDUs, thermal storage, water use (WUE).
* Space: white space per rack, electrical/mechanical/support ratios, GFA, footprint, yards, substation and site area vs. site coverage.
* CAPEX: regional USD/MW benchmark (Tier III, 10–30 MW) × Tier × scale × cooling factors + utility connection + land + contingency (+ optional IT hardware). OPEX: energy, maintenance, staff, insurance, water.
* Phased cash flow with occupancy ramp, tax, depreciation and optional exit value → IRR, NPV, payback, levelised cost; owner-occupied mode → TCO vs. leasing.
* Schedule (feasibility → permits → design → long-lead procurement → construction → L1–L5 commissioning → RFS), staffing for 24/7 operations, rule-based risk register.

All coefficients live in `assets/js/engine.js`; regional benchmarks in `assets/data/kb-core.js`. They are editable planning assumptions — calibrate with a quantity surveyor, the utility and market data for each project.

## Project structure · 目录结构

```
index.html                 single-page app
assets/css/app.css         theme ("cold aisle / hot aisle": indigo, cyan, coral)
assets/js/engine.js        calculation engine (pure functions, also runs in Node)
assets/js/app.js           views, form, report, libraries
assets/js/charts.js        dependency-free SVG charts
assets/js/i18n.js          English / 中文 / bilingual handling
assets/data/eq-*.js        equipment database with specification clauses & TPG
assets/data/kb-core.js     tiers, types, spaces, standards, glossary, lifecycle, regional benchmarks
assets/data/kb-references.js  benchmark designs & real projects
downloads/                 companion PPTX and DOCX
```

No build step and no external dependencies — everything runs in the browser; saved assessments stay in the browser's localStorage.

## Run locally · 本地运行

Open `index.html` directly, or serve the folder:

```bash
python -m http.server 8000
```

## Publish with GitHub Pages · 发布

Repository → **Settings → Pages → Build and deployment → Deploy from a branch → `main` / root** → Save. The site appears at `https://alexandervsq.github.io/Data-Center-Project-Assessment/`.

## Sources · 主要来源

Uptime Institute (Tier Standard: Topology; Global Data Center Survey 2025) · ANSI/TIA-942-C (2024) · ASHRAE TC 9.9 Thermal Guidelines · ISO/IEC 22237 / EN 50600 · GB 50174-2017 · GB 40879-2021 · SNI 8799 (BSN) · NFPA 75/76/2001/855 · Turner & Townsend Data Centre Construction Cost Index 2025 · IEA *Energy and AI* (2025) · operator press releases and trade press for real projects (links in the app).

## Disclaimer · 声明

Results are indicative planning values for early decision-making. Final design must follow site surveys, utility studies, local codes, the Authority Having Jurisdiction and qualified designers.
评估结果为规划阶段参考值，仅供早期决策使用；最终设计须依据场地勘察、电网研究、当地规范、主管部门要求及具资质的设计单位。

---

proudly presented by **乔书亚 Alexander** — CCEPC Indonesia | 都市环保印尼公司
