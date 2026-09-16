/**
 * scripts/generate_architecture_explanation_pdf.js
 * Generates an easy-to-read, beautifully formatted HTML and pure PDF guide
 * explaining MPLADS-SATARK Core Technical Architecture & the 6 Modules for friends & team.
 */

const fs = require('fs');
const path = require('path');

const archData = {
  title: "MPLADS-SATARK (सतर्क) — Core Architecture & 6 Core Modules Guide",
  subtitle: "An Easy, Plain-Language Explanation of Technical Architecture & Core Modules to Share with Friends & Team",
  meta: [
    { label: "Problem Statement", value: "PS 26102 (MoSPI / DIID)" },
    { label: "Project Title", value: "MPLADS-SATARK (Automated Forensic Vigilance)" },
    { label: "Dataset Scale", value: "176,925 Real Government Projects | 37 States & UTs" },
    { label: "Architecture Type", value: "Bifurcated Compute (Cold Batch + Hot Path <15ms)" }
  ],
  modules: [
    {
      num: 1,
      name: "SATARK-DRISHTI (सतर्क-दृष्टि)",
      tagline: "Master Risk Scorer & Delay Predictor",
      engine: "Composite Scorer (0-100) & Survival Analysis",
      whatItDoes: "Combines findings from all 7 AI sentinels into one single Priority Risk Score between 0 and 100. It also predicts how many months a project will be delayed.",
      howToExplain: "Think of this like a CIBIL Score for credit cards or a Student Report Card. Instead of handing an officer 7 different complicated reports, it gives one final score (e.g. 85/100 - CRITICAL RISK) so they instantly know which projects need urgent attention!",
      example: "Combines Statutory Violations (+30), CPWD Overpricing (+25), and Cartel Risk (+25) to assign an 80/100 Critical Risk rating."
    },
    {
      num: 2,
      name: "SATARK-SAMVAAD (सतर्क-संवाद)",
      tagline: "GenAI Natural Language Audit Copilot",
      engine: "GenAI Natural Language Copilot over 176,925 MoSPI Records",
      whatItDoes: "Lets government officers ask plain-language questions in English or Hindi over 176,925 government records instead of writing complex database code.",
      howToExplain: "Like ChatGPT for government audits! An officer can simply type: 'Show high-risk projects in Bihar under 5 Lakh', and SAMVAAD instantly scans all records and presents the exact matching projects.",
      example: "Query: 'Find ghost assets in Bihar' -> Returns 42 matching projects with total financial exposure of ₹1.8 Cr."
    },
    {
      num: 3,
      name: "PRASHNA-KAVACH (प्रश्न-कवच)",
      tagline: "The 'Why Was This Flagged?' Evidence Drawer",
      engine: "SHAP Explainable AI Drawer & Evidence Shield",
      whatItDoes: "Answers the question 'WHY WAS THIS FLAGGED?' by popping open a side drawer that lists line-by-line evidence and legal rule citations.",
      howToExplain: "Think of an itemized restaurant or hospital bill. If a waiter charges you ₹5,000, you don't just pay blindly — you want an itemized bill showing ₹2,000 for food, ₹1,500 for drinks, etc. PRASHNA-KAVACH shows officers line-by-line why a project was flagged (+30 Overpricing, +25 Cartel Risk, +20 March Rush).",
      example: "Pops open drawer showing exact GFR Rule 144 citation, CPWD cost variance, and matched duplicate project ID."
    },
    {
      num: 4,
      name: "SATARK-SIMULATION (सतर्क-सिम्युलेशन)",
      tagline: "Pre-Approval 'What-If' Real-Time Sandbox (<15ms)",
      engine: "Sub-15ms Real-Time Sandbox",
      whatItDoes: "Allows officers to test a new project proposal (title, cost, date, location) in less than 15 milliseconds BEFORE signing sanction approvals.",
      howToExplain: "Like a Spell-Checker before sending an email or a Flight Simulator! Before an MP or Collector signs off on spending ₹10 Lakhs of public money, they run a 3-millisecond simulation to check for any hidden red flags BEFORE funds leave the bank!",
      example: "Officer inputs a proposed ₹4,95,000 community hall bill on March 29; Simulator flags March Rush + Tender-Split Evasion in 2ms."
    },
    {
      num: 5,
      name: "BHAVISHYA-REKHA (भविष्य-रेखा)",
      tagline: "Future Risk & Trend Forecaster",
      engine: "Linear Regression & Time-Series Forecasting",
      whatItDoes: "Uses trend forecasting math to predict upcoming spending surges, March Rush spikes, and future quarterly risk trends.",
      howToExplain: "Like a Weather Forecast app! It doesn't just tell you if it's raining right now — it warns officers 3 months in advance that a heavy spending surge ('March Rush') is coming so they can prepare early.",
      example: "Projects a 45% spike in unverified end-of-year fund sanctions for Q4, alerting auditors in January."
    },
    {
      num: 6,
      name: "SATARK-KARYA (सतर्क-कार्य)",
      tagline: "1-Click Printable Legal Memo Builder",
      engine: "Form GFR-19A Legal Memo Builder with SHA-256 Hash",
      whatItDoes: "Automatically converts AI findings into a ready-to-print official legal notice (Form GFR-19A) complete with Government letterhead, legal citations, a 5-point engineer checklist, and a tamper-proof SHA-256 digital security hash.",
      howToExplain: "Like an automatic traffic challan / speeding ticket. Once the system detects a violation, SATARK-KARYA generates an official legal document with 1 click that can be printed and handed to field engineers for physical ground inspection.",
      example: "Generates confidential Memorandum MEMO/SATARK/2026/145555 with barcode and District Magistrate countersignature block."
    }
  ],
  systemLayers: [
    { name: "Layer 1: Real Government Data Warehouse", desc: "Ingests 100% real live data from official MoSPI eSAKSHI portals (176,925 projects, 109,475 payment vouchers, 27,234 contractors across 37 States & UTs)." },
    { name: "Layer 2: Dual-Brain Architecture (Cold vs Hot Path)", desc: "Heavy offline batch processing (Cold Path) combined with sub-15ms live scoring gateway (Hot Path)." },
    { name: "Layer 3: 7 Independent AI Sentinels", desc: "Multi-layer defense inspecting statutory rules, text duplicates, CPWD benchmarks, network cartels, 12D ML outliers, digit math, and satellite geotags." },
    { name: "Layer 4: Itemized Receipt Risk Scorer", desc: "0 to 100 composite risk score with additive waterfall breakdown replacing obscure black-box AI." },
    { name: "Layer 5: Role Dashboards & 1-Click Legal Notice", desc: "Custom views for MP, District Collector, State Nodal, and Ministry with Form GFR-19A printable memorandums." }
  ],
  elevatorPitch: "SATARK's core architecture has 6 main engines: DRISHTI gives a 0-100 report card score, SAMVAAD lets you ask questions like ChatGPT, PRASHNA-KAVACH gives itemized proof of why a project was flagged, SIMULATION tests proposals in 3 milliseconds before signing, BHAVISHYA-REKHA forecasts future risk trends like weather, and KARYA prints official legal inspection memos with 1 click!"
};

function generateHtml(outputPath) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${archData.title}</title>
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
      max-width: 900px;
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
      font-size: 26px;
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
      margin-bottom: 16px;
    }
    .card-title {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
    }
    .card-tagline {
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
    .engine-tag {
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
    .section-title {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--muted);
      font-weight: 700;
      margin: 12px 0 4px 0;
    }
    .section-content {
      font-size: 14px;
      color: #cbd5e1;
      margin-bottom: 12px;
    }
    .example-box {
      background: rgba(52, 211, 153, 0.08);
      border-left: 4px solid var(--success);
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      font-size: 13px;
      color: #a7f3d0;
      margin-top: 10px;
    }
    .pitch-card {
      background: linear-gradient(135deg, #1e1b4b, #311b92);
      border: 1px solid #6366f1;
      border-radius: 12px;
      padding: 24px;
      color: #fff;
      margin-top: 24px;
    }
    .pitch-title {
      font-size: 18px;
      font-weight: 700;
      color: #a5b4fc;
      margin-bottom: 8px;
    }
    .layers-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      margin-top: 12px;
    }
    .layer-item {
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid var(--border);
      padding: 12px 16px;
      border-radius: 8px;
    }
    .layer-name { font-weight: 700; color: #38bdf8; font-size: 14px; }
    .layer-desc { font-size: 13px; color: #94a3b8; margin-top: 4px; }

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
      .example-box { background: #f0fdf4; border-color: #16a34a; color: #14532d; }
      .pitch-card { background: #f5f3ff; border: 1px solid #818cf8; color: #1e1b4b; }
      .pitch-title { color: #4338ca; }
      .meta-card { background: #f1f5f9; border-color: #cbd5e1; }
      .meta-val { color: #0f172a; }
      .layer-item { background: #f8fafc; border-color: #cbd5e1; }
      .layer-name { color: #0284c7; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="action-bar">
      <span>📄 <b>PDF Ready:</b> Click the button to print/save as PDF for your friends!</span>
      <button class="btn" onclick="window.print()">🖨️ Save as PDF / Print</button>
    </div>

    <div class="header">
      <h1>${archData.title}</h1>
      <div class="subtitle">${archData.subtitle}</div>
      <div class="meta-grid">
        ${archData.meta.map(m => `
          <div class="meta-card">
            <div class="meta-label">${m.label}</div>
            <div class="meta-val">${m.value}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <h2 style="margin-bottom:16px; color:#fff; font-size:20px;">🏛️ The 6 Core Architecture Modules</h2>

    ${archData.modules.map(m => `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">${m.num}. ${m.name}</div>
            <div class="card-tagline">${m.tagline}</div>
          </div>
          <span class="num-badge">Module ${m.num} of 6</span>
        </div>

        <div class="engine-tag">⚙️ Core Engine: ${m.engine}</div>

        <div class="section-title">🔍 What it does:</div>
        <div class="section-content">${m.whatItDoes}</div>

        <div class="section-title">💡 How to explain it to a friend:</div>
        <div class="section-content">${m.howToExplain}</div>

        <div class="example-box">
          <b>⚡ Concrete Real-World Example:</b> ${m.example}
        </div>
      </div>
    `).join('')}

    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">🌐 High-Level System Architecture Layers</div>
          <div class="card-tagline">5-Tier End-to-End System Pipeline</div>
        </div>
      </div>
      <div class="layers-grid">
        ${archData.systemLayers.map(l => `
          <div class="layer-item">
            <div class="layer-name">${l.name}</div>
            <div class="layer-desc">${l.desc}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="pitch-card">
      <div class="pitch-title">🗣️ 30-Second Quick Elevator Pitch:</div>
      <div style="font-size: 15px; line-height: 1.6;">"${archData.elevatorPitch}"</div>
    </div>
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

  contentLines.push("MPLADS-SATARK (SATARK) - Core Architecture Guide");
  contentLines.push("=================================================");
  contentLines.push("Problem Statement 26102 | MoSPI / DIID | 176,925 Real Government Works");
  contentLines.push("");

  contentLines.push("THE 6 CORE ARCHITECTURE MODULES:");
  contentLines.push("-------------------------------------------------");

  archData.modules.forEach(m => {
    contentLines.push(`[ Module ${m.num} ] ${m.name} - ${m.tagline}`);
    contentLines.push(`* CORE ENGINE: ${m.engine}`);
    contentLines.push(`* WHAT IT DOES: ${m.whatItDoes}`);
    contentLines.push(`* HOW TO EXPLAIN: ${m.howToExplain}`);
    contentLines.push(`* EXAMPLE: ${m.example}`);
    contentLines.push("-------------------------------------------------");
  });

  contentLines.push("HIGH-LEVEL SYSTEM ARCHITECTURE LAYERS:");
  archData.systemLayers.forEach(l => {
    contentLines.push(`* ${l.name}: ${l.desc}`);
  });

  contentLines.push("");
  contentLines.push("30-SECOND QUICK ELEVATOR PITCH:");
  contentLines.push(`"${archData.elevatorPitch}"`);

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
const htmlFile = path.join(rootDir, 'SATARK_Core_Architecture_Guide.html');
const pdfFile = path.join(rootDir, 'SATARK_Core_Architecture_Guide.pdf');

generateHtml(htmlFile);
console.log('✅ Generated HTML Architecture Guide:', htmlFile);

generatePurePdf(pdfFile);
console.log('✅ Generated PDF Architecture Document:', pdfFile, `(${fs.statSync(pdfFile).size} bytes)`);
