/**
 * scripts/generate_complete_satark_overview_pdf.js
 * Generates an executive, highly aesthetic HTML and pure PDF guide for
 * "SATARK — Complete Feature Overview" covering all 7 Sentinels and 6 Core Architecture Pillars.
 */

const fs = require('fs');
const path = require('path');

const overviewData = {
  title: "SATARK — Complete Feature Overview",
  subtitle: "Automated AI Risk Scoring, Forensic Audit & Multi-Layer Anomaly Detection Engine (PS 26102)",
  meta: [
    { label: "Problem Statement", value: "PS 26102 (MoSPI / DIID)" },
    { label: "Ministry", value: "Ministry of Statistics & Programme Implementation" },
    { label: "Dataset Scale", value: "176,925 Real Government Projects | 37 States & UTs" },
    { label: "Total Modules", value: "7 AI Sentinels + 6 Core Architecture Pillars (13 Modules)" }
  ],
  sentinels: [
    {
      id: "SENTINEL 1",
      name: "VIDHI-KAVACH (विधि-कवच)",
      purpose: "Legal & Rule-Based Fraud Detection",
      whatItDoes: "Checks whether a proposed MPLADS work violates government rules or eligibility conditions.",
      tech: "Indic Lexicon + Rule Matrix",
      howItWorks: [
        "Reads the proposed work description.",
        "Identifies keywords such as temples, trusts, prohibited activities, etc.",
        "Compares the proposal against predefined MPLADS rules.",
        "Checks suspicious budget/timing patterns such as March Rush."
      ],
      detects: "Ineligible/prohibited works and statutory rule violations.",
      output: "Rule violation / compliance flag with the exact reason.",
      benefit: "Prevents funds from being sanctioned for legally or procedurally invalid works."
    },
    {
      id: "SENTINEL 2",
      name: "PUNAR-DRISHTI (पुनर्दृष्टि)",
      purpose: "Duplicate Work Detection",
      whatItDoes: "Identifies the same or highly similar work being submitted more than once across schemes.",
      tech: "TF-IDF + Cosine Similarity",
      howItWorks: [
        "Converts work descriptions into numerical representations.",
        "Compares new proposals with existing proposals across databases.",
        "Measures textual similarity even when the title has been changed or rephrased.",
        "Example: 'Construction of Community Hall' vs 'Development of Village Multipurpose Hall'."
      ],
      detects: "Duplicate or suspiciously similar proposals.",
      output: "Similarity score percentage (e.g. 92% match) and matched project ID.",
      benefit: "Helps prevent duplicate funding and repeated submission of the same work."
    },
    {
      id: "SENTINEL 3",
      name: "ARTHA-DARPAN (अर्थ-दर्पण)",
      purpose: "Cost & Price Manipulation Detection",
      whatItDoes: "Checks whether the estimated project cost appears unusually high compared to government benchmarks.",
      tech: "CPWD DSR Rates + Per-Unit Median Analysis",
      howItWorks: [
        "Takes project quantities and estimated costs.",
        "Compares rates against CPWD Delhi Schedule of Rates (DSR 2023-24) benchmarks.",
        "Calculates expected/typical cost ranges for all 37 States/UTs.",
        "Flags significant upward cost deviations."
      ],
      detects: "Overpricing, inflated estimates, price padding, and abnormally high unit rates.",
      output: "Cost anomaly flag & excess risk score in INR ₹.",
      benefit: "Helps identify potential financial irregularities before sanction."
    },
    {
      id: "SENTINEL 4",
      name: "CHAKRA-VYUH (चक्रव्यूह)",
      purpose: "Contractor/Vendor Network Analysis",
      whatItDoes: "Finds suspicious relationships between contractors, vendors, agencies, and projects.",
      tech: "Graph Theory + Ego-Graphs (Vis.js / Louvain)",
      howItWorks: [
        "Represents contractors, vendors, and projects as an interconnected network.",
        "Creates connections based on common contracts, locations, and officials.",
        "Looks for highly connected or repeatedly appearing entities using Herfindahl-Hirschman Index (HHI)."
      ],
      detects: "Contractor concentration, vendor monopolies, cartel-like networks, and repeated contractor-project relationships.",
      output: "Graph centrality score & cartel risk alert.",
      benefit: "Reveals hidden syndicate patterns that are difficult to identify by checking individual records."
    },
    {
      id: "SENTINEL 5",
      name: "BHU-DRISHTI (भू-दृष्टि)",
      purpose: "Geospatial & Physical Verification",
      whatItDoes: "Checks whether a sanctioned asset/work actually exists at the claimed geographic location.",
      tech: "GIS + Remote Sensing + Geotagging (Leaflet / Esri Satellite)",
      howItWorks: [
        "Uses project coordinates and GPS geotags.",
        "Maps the project location using GIS satellite layers.",
        "Compares available geographic and satellite evidence.",
        "Identifies suspicious or unverifiable locations (water bodies, forests, barren land)."
      ],
      detects: "Ghost assets, incorrect coordinates, location mismatches, and non-existent works.",
      output: "GIS Spatial anomaly flag & spatial cluster alert (<250m).",
      benefit: "Adds a physical verification layer to digital records."
    },
    {
      id: "SENTINEL 6",
      name: "SANKHYA-SATYA (संख्या-सत्य)",
      purpose: "Tender & Financial Pattern Detection",
      whatItDoes: "Looks for suspicious tender patterns that indicate attempts to avoid open public scrutiny.",
      tech: "Benford's Law + Smurfing Rules",
      howItWorks: [
        "Analyzes financial amounts and transaction patterns.",
        "Detects unusual numerical distributions on leading digits (1-9).",
        "Looks for multiple smaller transactions/works that collectively represent a larger suspicious amount."
      ],
      detects: "Tender splitting (e.g. ₹4.95L bills), artificially small project values, suspicious financial distributions, and threshold-avoidance.",
      output: "Benford Chi-Square goodness-of-fit score & tender-split alert.",
      benefit: "Helps identify financial patterns that may not be obvious from individual transactions."
    },
    {
      id: "SENTINEL 7",
      name: "VIBHED-NETRA (विभेद-नेत्र)",
      purpose: "Advanced Multi-Parameter Anomaly Detection",
      whatItDoes: "Detects complex anomalies by considering multiple project parameters simultaneously.",
      tech: "12D Isolation Forest Machine Learning",
      howItWorks: [
        "Takes 12 dimensions: cost, date, location, vendor, project type, execution time, and administrative parameters.",
        "Machine learning identifies non-linear combinations that look unusual compared with normal projects."
      ],
      detects: "Complex multi-dimensional anomalies that individual rule-based checks may miss.",
      output: "Multi-variate anomaly score & outlier severity rating.",
      benefit: "Provides an additional AI/ML-based fraud detection layer."
    }
  ],
  architecture: [
    {
      num: 8,
      name: "SATARK-DRISHTI (सतर्क-दृष्टि)",
      purpose: "Unified Risk Scoring",
      whatItDoes: "Combines the results of all 7 Sentinel engines into a single dashboard risk score.",
      tech: "Composite Risk Scorer (0–100)",
      howItWorks: [
        "Collects alerts from all 7 Sentinels.",
        "Assigns weights and severity to different risks.",
        "Produces a single overall composite risk score (0-30 Low, 31-60 Moderate, 61-80 High, 81-100 Critical).",
        "Estimates potential project delay and risk trends."
      ],
      benefit: "Gives officers a single dashboard-level risk assessment instead of checking seven systems separately."
    },
    {
      num: 9,
      name: "SATARK-SAMVAAD (सतर्क-संवाद)",
      purpose: "AI-Powered Government Data Assistant",
      whatItDoes: "Allows officers to ask questions about government and project records in plain language.",
      tech: "GenAI Natural Language Copilot",
      howItWorks: [
        "Officer asks a normal-language question in English or Hindi.",
        "AI interprets the intent, location, budget, and sentinel filter.",
        "Searches 176,925 MoSPI government records in real time.",
        "Returns a concise answer with supporting evidence table."
      ],
      benefit: "Makes large government datasets easier for non-technical users to analyze."
    },
    {
      num: 10,
      name: "PRASHNA-KAVACH (प्रश्न-कवच)",
      purpose: "Explainable AI / Reason Behind the Alert",
      whatItDoes: "Explains why SATARK flagged a project with transparent evidence attribution.",
      tech: "SHAP Explainable AI Drawer",
      howItWorks: [
        "Breaks down factors contributing to a risk score.",
        "Shows which variables had the strongest influence.",
        "Example: High cost deviation (+25), Suspicious vendor network (+20), Location anomaly (+15).",
        "Answers: 'Why was this project flagged?'"
      ],
      benefit: "Makes AI decisions transparent and easier for auditors and officers to trust and verify."
    },
    {
      num: 11,
      name: "SATARK-SIMULATION (सतर्क-सिम्युलेशन)",
      purpose: "Pre-Sanction What-If Testing",
      whatItDoes: "Allows officials to test changes to a proposal in <15ms before approving it.",
      tech: "Real-Time Sub-15ms Sandbox Environment",
      howItWorks: [
        "Creates a simulated copy of the proposal.",
        "Officer changes parameters such as cost, vendor, or project details.",
        "SATARK immediately recalculates the risk across all 7 sentinels.",
        "Example: ₹50 Lakh estimate -> ₹40 Lakh estimate -> risk score recalculates in 2ms."
      ],
      benefit: "Supports better decisions before funds are sanctioned."
    },
    {
      num: 12,
      name: "BHAVISHYA-REKHA (भविष्य-रेखा)",
      purpose: "Future Risk & Trend Forecasting",
      whatItDoes: "Predicts potential future risk trends and March Rush surges from historical project data.",
      tech: "Linear Regression & Time-Series Forecasting",
      howItWorks: [
        "Analyzes historical project patterns.",
        "Identifies trends such as increasing March-Rush activity.",
        "Forecasts future quarterly risk patterns.",
        "Highlights seasonal risk spikes and high-risk periods."
      ],
      benefit: "Moves SATARK from reactive detection to proactive prevention."
    },
    {
      num: 13,
      name: "SATARK-KARYA (सतर्क-कार्य)",
      purpose: "Automated Vigilance & Documentation",
      whatItDoes: "Converts detected violations into formal legal documentation for further administrative action.",
      tech: "GFR-19A Memo Builder + SHA-256 Hashing",
      howItWorks: [
        "Takes investigation and alert details.",
        "Generates a structured Form GFR-19A vigilance memo/report.",
        "Includes supporting evidence and 5-point engineer inspection checklist.",
        "Uses SHA-256 hashing for document integrity."
      ],
      benefit: "Reduces manual paperwork and creates a consistent audit and action trail."
    }
  ]
};

function generateHtml(outputPath) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${overviewData.title}</title>
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: #151c2c;
      --border: #232d42;
      --text: #e2e8f0;
      --muted: #94a3b8;
      --accent: #38bdf8;
      --accent-glow: rgba(56, 189, 248, 0.15);
      --success: #34d399;
      --warning: #fbbf24;
      --danger: #f87171;
      --purple: #a855f7;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 30px 20px;
    }
    .container {
      max-width: 920px;
      margin: 0 auto;
    }
    .header {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 24px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .header h1 {
      font-size: 28px;
      color: #fff;
      margin-bottom: 8px;
      background: linear-gradient(90deg, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .header .subtitle {
      color: var(--muted);
      font-size: 14px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-top: 20px;
    }
    .meta-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border);
      padding: 10px 14px;
      border-radius: 8px;
      text-align: left;
    }
    .meta-label { font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 700; }
    .meta-val { font-size: 13px; color: #fff; font-weight: 600; }

    .section-header {
      color: #fff;
      font-size: 22px;
      font-weight: 800;
      margin: 28px 0 16px 0;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 2px solid var(--border);
      padding-bottom: 8px;
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border);
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    .card-title {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
    }
    .card-purpose {
      font-size: 13px;
      color: var(--accent);
      font-weight: 600;
    }
    .num-badge {
      background: var(--accent-glow);
      color: var(--accent);
      border: 1px solid var(--accent);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
    }
    .tech-tag {
      display: inline-block;
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.4);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .detail-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--muted);
      font-weight: 700;
      margin: 10px 0 4px 0;
    }
    .detail-val {
      font-size: 14px;
      color: #cbd5e1;
      margin-bottom: 10px;
    }
    .step-list {
      list-style-type: none;
      padding-left: 0;
      margin-bottom: 12px;
    }
    .step-list li {
      position: relative;
      padding-left: 20px;
      margin-bottom: 6px;
      font-size: 13.5px;
      color: #e2e8f0;
    }
    .step-list li::before {
      content: "•";
      position: absolute;
      left: 6px;
      color: var(--accent);
      font-weight: bold;
    }
    .benefit-box {
      background: rgba(52, 211, 153, 0.08);
      border-left: 4px solid var(--success);
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      font-size: 13px;
      color: #a7f3d0;
      margin-top: 10px;
    }

    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0f172a;
      border: 1px solid var(--border);
      padding: 16px 24px;
      border-radius: 12px;
      margin-bottom: 24px;
    }
    .btn {
      background: var(--accent);
      color: #0b0f19;
      font-weight: 700;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    .btn:hover { background: #7dd3fc; }

    @media print {
      body { background: #fff; color: #1e293b; padding: 0; }
      .action-bar { display: none; }
      .card { background: #fff; border: 1px solid #cbd5e1; color: #1e293b; box-shadow: none; page-break-inside: avoid; }
      .card-title { color: #0f172a; }
      .header { background: #f8fafc; border: 1px solid #cbd5e1; }
      .header h1 { -webkit-text-fill-color: #0f172a; color: #0f172a; }
      .benefit-box { background: #f0fdf4; border-color: #16a34a; color: #14532d; }
      .meta-card { background: #f1f5f9; border-color: #cbd5e1; }
      .meta-val { color: #0f172a; }
      .step-list li { color: #334155; }
      .section-header { color: #0f172a; border-color: #cbd5e1; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="action-bar">
      <span>📄 <b>PDF Ready:</b> Click the button to print/save as PDF!</span>
      <button class="btn" onclick="window.print()">🖨️ Save as PDF / Print</button>
    </div>

    <div class="header">
      <h1>${overviewData.title}</h1>
      <div class="subtitle">${overviewData.subtitle}</div>
      <div class="meta-grid">
        ${overviewData.meta.map(m => `
          <div class="meta-card">
            <div class="meta-label">${m.label}</div>
            <div class="meta-val">${m.value}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- PART 1: THE 7 AI SENTINELS -->
    <div class="section-header">
      <span>🛡️ Part 1: The 7 Independent AI Sentinels</span>
    </div>

    ${overviewData.sentinels.map(s => `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">${s.name}</div>
            <div class="card-purpose">Purpose: ${s.purpose}</div>
          </div>
          <span class="num-badge">${s.id}</span>
        </div>

        <div class="tech-tag">⚙️ Technology: ${s.tech}</div>

        <div class="detail-label">📌 What it does:</div>
        <div class="detail-val">${s.whatItDoes}</div>

        <div class="detail-label">🔬 How it works:</div>
        <ul class="step-list">
          ${s.howItWorks.map(step => `<li>${step}</li>`).join('')}
        </ul>

        <div class="detail-label">🚨 Detects:</div>
        <div class="detail-val">${s.detects}</div>

        ${s.output ? `
          <div class="detail-label">📊 Output:</div>
          <div class="detail-val">${s.output}</div>
        ` : ''}

        <div class="benefit-box">
          <b>🎯 Key Benefit:</b> ${s.benefit}
        </div>
      </div>
    `).join('')}

    <!-- PART 2: CORE SATARK ARCHITECTURE -->
    <div class="section-header">
      <span>🧠 Part 2: Core SATARK Architecture (6 Modules)</span>
    </div>

    ${overviewData.architecture.map(a => `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">${a.name}</div>
            <div class="card-purpose">Purpose: ${a.purpose}</div>
          </div>
          <span class="num-badge">Module ${a.num} of 13</span>
        </div>

        <div class="tech-tag">⚙️ Technology: ${a.tech}</div>

        <div class="detail-label">📌 What it does:</div>
        <div class="detail-val">${a.whatItDoes}</div>

        <div class="detail-label">🔬 How it works:</div>
        <ul class="step-list">
          ${a.howItWorks.map(step => `<li>${step}</li>`).join('')}
        </ul>

        <div class="benefit-box">
          <b>🎯 Key Benefit:</b> ${a.benefit}
        </div>
      </div>
    `).join('')}

  </div>
</body>
</html>`;

  fs.writeFileSync(outputPath, html, 'utf8');
}

function generatePurePdf(outputPath) {
  const objects = [];
  const offsets = {};
  let objCount = 3;

  function cleanText(txt) {
    if (!txt) return '';
    return String(txt).replace(/[^a-zA-Z0-9 :;,._+\-%/]/g, '').replace(/[()]/g, '');
  }

  function addObj(content) {
    objCount++;
    objects.push({ id: objCount, content });
    return objCount;
  }

  function printLine(txt) {
    return '(' + cleanText(txt) + ') Tj\nT*\n';
  }

  const contentLines = [];

  contentLines.push("SATARK - COMPLETE FEATURE OVERVIEW");
  contentLines.push("=================================================");
  contentLines.push("Problem Statement 26102 | MoSPI / DIID | 176,925 Real Government Works");
  contentLines.push("");

  contentLines.push("PART 1: THE 7 INDEPENDENT AI SENTINELS");
  contentLines.push("-------------------------------------------------");

  overviewData.sentinels.forEach(s => {
    contentLines.push(`[ ${s.id} ] ${s.name} - Purpose: ${s.purpose}`);
    contentLines.push(`* TECH: ${s.tech}`);
    contentLines.push(`* WHAT IT DOES: ${s.whatItDoes}`);
    s.howItWorks.forEach(step => contentLines.push(`  - ${step}`));
    contentLines.push(`* DETECTS: ${s.detects}`);
    contentLines.push(`* BENEFIT: ${s.benefit}`);
    contentLines.push("-------------------------------------------------");
  });

  contentLines.push("PART 2: CORE SATARK ARCHITECTURE (6 MODULES)");
  contentLines.push("-------------------------------------------------");

  overviewData.architecture.forEach(a => {
    contentLines.push(`[ Module ${a.num} ] ${a.name} - Purpose: ${a.purpose}`);
    contentLines.push(`* TECH: ${a.tech}`);
    contentLines.push(`* WHAT IT DOES: ${a.whatItDoes}`);
    a.howItWorks.forEach(step => contentLines.push(`  - ${step}`));
    contentLines.push(`* BENEFIT: ${a.benefit}`);
    contentLines.push("-------------------------------------------------");
  });

  const pageIds = [];
  const pageSize = 35;

  for (let p = 0; p < contentLines.length; p += pageSize) {
    const pageChunk = contentLines.slice(p, p + pageSize);
    let stream = 'BT\n/F1 10 Tf\n14 TL\n40 800 Td\n';

    pageChunk.forEach(line => {
      const cleanLine = cleanText(line);
      if (cleanLine.length > 85) {
        stream += printLine(cleanLine.substring(0, 85));
        stream += printLine('  ' + cleanLine.substring(85));
      } else {
        stream += printLine(cleanLine);
      }
    });

    stream += 'ET';

    const sId = addObj(`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`);
    const pId = addObj(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${sId} 0 R >>`);
    pageIds.push(pId);
  }

  objects.unshift({ id: 3, content: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>' });
  objects.unshift({ id: 2, content: `<< /Type /Pages /Kids [${pageIds.map(id => id + ' 0 R').join(' ')}] /Count ${pageIds.length} >>` });
  objects.unshift({ id: 1, content: '<< /Type /Catalog /Pages 2 0 R >>' });

  let pdf = '%PDF-1.4\n';
  let offset = Buffer.byteLength(pdf);

  for (const obj of objects) {
    offsets[obj.id] = offset;
    const objStr = `${obj.id} 0 obj\n${obj.content}\nendobj\n`;
    pdf += objStr;
    offset += Buffer.byteLength(objStr);
  }

  const xrefOffset = offset;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdf += (offsets[i].toString().padStart(10, '0') + ' 00000 n \n');
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  fs.writeFileSync(outputPath, pdf, 'binary');
}

const rootDir = path.join(__dirname, '..');
const htmlFile = path.join(rootDir, 'MPLADS_SATARK_Complete_Feature_Overview.html');
const pdfFile = path.join(rootDir, 'MPLADS_SATARK_Complete_Feature_Overview.pdf');

generateHtml(htmlFile);
console.log('✅ Generated HTML Overview Guide:', htmlFile);

generatePurePdf(pdfFile);
console.log('✅ Generated PDF Overview Document:', pdfFile, `(${fs.statSync(pdfFile).size} bytes)`);
