# 🇮🇳 MPLADS-SATARK (सतर्क)
### Automated AI Risk Scoring, Forensic Audit & Multi-Layer Anomaly Detection Engine
> **Smart India Hackathon 2024 / 2025 | Problem Statement 26102**  
> **Ministry**: Ministry of Statistics & Programme Implementation (MoSPI) / Data & Information Innovation Division (DIID)  
> **Core Mandate**: Multi-agent audit, forensic fraud detection, and explainable risk-scoring across nationwide MPLADS project implementations.

---

## 🌟 Overview & Ground Truth Guarantee

MPLADS-SATARK is an enterprise-grade forensic auditing system designed to bring radical transparency, anti-collusion intelligence, and predictive risk management to the Member of Parliament Local Area Development Scheme (MPLADS).

Every figure, vendor record, and project work in this repository is sourced **100% live and direct from official Government of India endpoints**:
- **Live Ministry Server**: Ministry of Statistics & Programme Implementation (MoSPI) eSAKSHI portal (`https://mplads.mospi.gov.in/rest/PreLoginDashboardData/`).
- **Schedule of Rates (DSR)**: Central Public Works Department (CPWD) Delhi Schedule of Rates 2023–24.
- **Cross-Scheme Geotags**: ISRO Bhuvan Geo-platform & Ministry of Rural Development (MoRD) MGNREGA / PMGSY asset registry.
- **Statutory Framework**: General Financial Rules (GFR 2017) & Revised MPLADS Guidelines 2023.

---

## 📊 Nationwide Dataset Scale (100% Complete)

| Dimension | Nationwide Scope | Data Stored on Disk |
|:---|:---:|:---|
| **States & Union Territories** | **36 / 36** | 100% of India's States & UTs |
| **Lok Sabha Parliamentary Constituencies** | **543 / 543** | 100% of India's Constituencies |
| **Members of Parliament Indexed** | **779 MPs** | 543 Lok Sabha + 236 Rajya Sabha |
| **Real Government Projects Harvested** | **176,831 Projects** | Full work titles, stages, costs, and dates |
| **Real Payment & Vendor Vouchers** | **109,475 Vouchers** | Transaction dates, disbursed amounts, and voucher IDs |
| **Government Contractors / Vendors** | **27,233 Unique Entities** | Contractor network nodes & tax IDs |
| **Implementing Agencies** | **7,231 Agencies** | DRDAs, LAEOs, PWDs, Zilla Parishads |

---

## 🔬 Six Independent Detection Signals (Multi-Layer Defense)

1. **Signal 1 (6A) — Multivariate Outlier Detection (Isolation Forest)**:
   Detects cost overruns, temporal duration anomalies, progress gaps, and atypical cost-per-km ratios calibrated against CPWD DSR benchmarks.
2. **Signal 2 (6B) — Agency-Vendor Ego-Graph & Network Centrality (Louvain)**:
   Maps contractor concentration, betweenness centrality, and suspicious bidding syndicates across 27,233 vendors and 7,231 agencies.
3. **Signal 3 (6C) — Bitemporal Statutory Compliance Engine (GFR 2017 & MPLADS 2023)**:
   Codified declarative rules evaluating SC/ST mandatory quotas (15% SC, 7.5% ST), Ministry of Finance pacing caps (Rule 62 March rush), and 7 Negative List ineligible works.
4. **Signal 4 (6D) — Cross-Scheme Block-Level Deduplication**:
   Probabilistic entity resolution matching MPLADS road/hall works against Bhuvan ISRO / MGNREGA assets in identical Gram Panchayats to catch double-billing.
5. **Signal 5 (6E) — Forensic Digit Analysis (Benford's Law)**:
   Chi-square goodness-of-fit testing on leading financial digits to flag human-fabricated vouchers and split sanctions below tender thresholds.
6. **Signal 6 (6F) — Survival Analysis for "Zombie Projects" (Cox Proportional Hazards)**:
   Predictive hazard curve estimating stall probability for stalled projects months before physical deadlines lapse.

---

## 🏛️ Four Role-Based Dashboards

1. **Hon'ble Member of Parliament (MP)**: Constituency health self-check, SC/ST quota progress meter, pending approvals, and delay alerts.
2. **District Authority (District Magistrate / Collector)**: Interactive GIS heatmap, priority inspection queue, agency workload distribution, and one-click Field Audit Dossier generation.
3. **State Nodal Authority**: Inter-district performance comparisons, vendor concentration heatmaps, and unspent balance tracking.
4. **Union Ministry / DIID**: Macro trends, national compliance rates, March-rush tracking, and inter-state benchmarking.

---

## 📁 Repository Structure

```
├── backend/
│   ├── data/
│   │   ├── mospi/                 # Raw MoSPI live government datasets
│   │   │   ├── states.json        # 36 States & UTs
│   │   │   ├── constituencies.json# 543 Lok Sabha Constituencies
│   │   │   ├── mps.json           # 779 Parliamentarians
│   │   │   ├── real_works_part1.json # Part 1 of 176,831 project works
│   │   │   ├── real_works_part2.json # Part 2 of 176,831 project works
│   │   │   └── real_expenditures_and_vendors.json # 109,475 payment vouchers
│   │   ├── cpwd/                  # CPWD Delhi Schedule of Rates (DSR 2023-24)
│   │   │   └── cpwd_dsr_rates.json
│   │   ├── bhuvan/                # Bhuvan ISRO / MGNREGA geo-tagged assets
│   │   │   └── bhuvan_mgnrega_assets.json
│   │   ├── processed/             # Unified provenance-tagged datasets
│   │   │   ├── mplads_unified_projects.csv # 176,831 records with 25 metrics
│   │   │   └── mplads_unified_projects.json # Structured snapshot
│   │   ├── fetch_all_india_works.js # Nationwide harvester
│   │   ├── transform_nationwide_dataset.js # Provenance labeling pipeline
│   │   └── rigorous_data_audit.js # Complete integrity test suite
│   ├── policy/
│   │   └── statutory_rules.json   # Declarative bitemporal policy rules
│   └── db/                        # DuckDB analytical serving layer
├── PROJECT_MASTER_TRACKER.md      # Permanent session log & roadmap
└── README.md                      # Architecture documentation
```

---

## 🚀 Quick Start

### 1. Verify Data Integrity
```bash
node backend/data/rigorous_data_audit.js
```
Expected output: `PASSED: 27 | WARNINGS: 0 | FAILURES: 0 (100% Nationwide Coverage)`

### 2. Recombine Raw Works (Optional)
```bash
node backend/data/combine_works.js
```

---

*MPLADS-SATARK — Built for transparency, speed, and precision in Indian public governance.*
