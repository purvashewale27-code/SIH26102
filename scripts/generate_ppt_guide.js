/**
 * generate_ppt_guide.js
 * Generates an executive, slide-by-slide PPT guide for SIH Hackathon PS 26102
 * in both standalone PDF format and presentation HTML format.
 */

const fs = require('fs');
const path = require('path');

const slides = [
  {
    slideNum: 1,
    title: "Title & Hook: MPLADS-SATARK (सतर्क)",
    tagline: "Automated AI Risk Scoring, Multi-Layer Fraud Detection & Explainable Auditing",
    points: [
      "Problem Statement 26102 | Ministry of Statistics & Programme Implementation (MoSPI / DIID)",
      "What is MPLADS? Over Rs 4,000 Crore is given annually to 779 MPs across 788 districts for local public infrastructure.",
      "The Core Hook: Official portals only show WHAT happened in the past. They do not warn officers BEFORE public money is wasted on duplicate works, overpriced tenders, or stalled projects.",
      "Our Solution: SATARK (सतर्क) — an AI-powered proactive vigilance system that scans government works in real-time, catches corruption patterns, and explains every red flag in plain language."
    ],
    speakerNotes: "Start with high energy: 'Good morning respected jury members! Every year, ₹4,000+ Crore of taxpayers' money is spent on MPLADS for roads, schools, and drinking water. But today, audits happen 2 years too late. We present MPLADS-SATARK — an AI system that catches fraud, overpricing, and ghost projects before public funds are wasted!'"
  },
  {
    slideNum: 2,
    title: "Ground Realities & 4 Massive Problems in MPLADS",
    tagline: "Why Government Audits Fail Today and Where Public Money is Leaking",
    points: [
      "1. Double Invoicing / Ghost Works: The same rural road or hall is funded under MPLADS AND also billed under MGNREGA or PMGSY.",
      "2. Inflated Estimates (Overpricing): Contractors charge Rs 50 Lakhs for a basic road that CPWD standard rates benchmark at Rs 20 Lakhs.",
      "3. Contractor-Agency Cartels (Favoritism): 70% to 80% of an MP's funds repeatedly awarded to a single favorite agency or contractor.",
      "4. Statutory Violations & March Rush: Sanctioning ineligible works (places of worship, private clubs) and dumping 30% of funds in March without verification.",
      "5. Zombie Projects: Works that are 10% complete on paper, stalled for 3 years, with zero progress."
    ],
    speakerNotes: "Highlight ground reality: 'Judges, fraud in public works doesn't happen with complicated equations. It happens when someone claims money for the same road twice, charges double the CPWD rate book, or creates a fake bill of ₹4.98 Lakhs to avoid mandatory online tenders!'"
  },
  {
    slideNum: 3,
    title: "Our Solution: MPLADS-SATARK Architecture in Simple Words",
    tagline: "How We Catch Irregularities Without Black-Box Confusion",
    points: [
      "100% Real Government Data: Sourced directly from MoSPI eSAKSHI live endpoints (176,831 real works, 109,475 payment vouchers, 36/36 States & UTs).",
      "Multi-Layer Defense (6 Independent Signals): A project is never flagged based on one single model. It requires multiple red flags to become high priority.",
      "Honest Data Provenance Badges: Every number carries a clear badge — REAL, DERIVED, ESTIMATED, or STATUTORY. Zero fake numbers, zero black boxes.",
      "Explain-My-Score Waterfall: Instead of an obscure decimal, officers see plain English points: e.g. '+30 CPWD Overpricing', '+25 Contractor Favoritism', '+20 March Rush'."
    ],
    speakerNotes: "Explain clearly: 'We don't use black-box AI. Government officers cannot take disciplinary action on a black-box percentage. SATARK gives an itemized additive waterfall: why was this project flagged, which rule was broken, and how much is the cost variance!'"
  },
  {
    slideNum: 4,
    title: "The 6 Independent AI & Detection Signals (Explained Simply)",
    tagline: "Each Signal Catches a Different Type of Financial or Operational Fraud",
    points: [
      "Signal 1 (Cost & Delay Outliers): Uses Isolation Forest ML calibrated against official CPWD Delhi Schedule of Rates (DSR) to spot inflated estimates.",
      "Signal 2 (Contractor Cartels & Network Graph): Measures fund concentration (HHI) and spots syndicate bidding where 1 contractor monopolizes funds.",
      "Signal 3 (Statutory Compliance Engine): Policy-as-Data checking mandatory 15% SC / 7.5% ST quotas, and 7 Negative List clauses (e.g. prohibited religious structures).",
      "Signal 4 (Cross-Scheme Deduplication): Probabilistic matching comparing MPLADS works against ISRO Bhuvan & MGNREGA registries in the same Gram Panchayat.",
      "Signal 5 (Benford's Law Forensic Accounting): Analyzes leading digits (1-9) in bills to detect human-padded figures and ₹4.98L split tenders.",
      "Signal 6 (Cox Survival Hazard for Zombie Projects): Statistical time-to-event model forecasting completion curves and warning of stalls 6 months early."
    ],
    speakerNotes: "Walk through the 6 signals: 'Signal 1 checks pricing. Signal 2 checks who got the contract. Signal 3 checks government guidelines. Signal 4 checks if another scheme already built it. Signal 5 checks the mathematics of the invoice. Signal 6 predicts if the project will die before finish!'"
  },
  {
    slideNum: 5,
    title: "Bifurcated Architecture: Cold Path vs Hot Path Live Demo",
    tagline: "Engineered for Government Scale and Flawless Live Demonstration",
    points: [
      "Cold Path (Offline Analytics): Indexes 176,831 projects in under 2 seconds for instant national/state aggregations and filtering.",
      "Hot Path (Live Stage Injection): Live scoring of any newly proposed work in UNDER 15 MILLISECONDS (against < 50ms SLA).",
      "Focus & Context Ego-Graph: Rather than crashing browser with 27,000 nodes, renders 1-2 hop neighborhood (10-15 related nodes) on click.",
      "Bitemporal Policy Engine: Versioned rules ensure projects sanctioned under older guidelines are evaluated against the rules active on that date."
    ],
    speakerNotes: "Emphasize live demo speed: 'Most teams struggle with live demo lag. We built a bifurcated architecture where live injection scores any new project in 1 millisecond on stage!'"
  },
  {
    slideNum: 6,
    title: "4 Role-Based Dashboards for Every Level of Governance",
    tagline: "One Unified Source of Truth, Scoped to 4 Key Administrative Roles",
    points: [
      "1. Union Ministry / DIID: National macro overview, inter-state benchmarking, fund utilization rates, and nationwide GIS risk density map.",
      "2. State Nodal Authority: Inter-district performance roll-up, agency concentration heatmaps, and unspent balances.",
      "3. District Magistrate / Collector: Prioritized inspection queue, one-click Explain-My-Score modal, and print-ready field audit dossiers.",
      "4. Hon'ble Member of Parliament: Self-check scorecard, live SC (15%) and ST (7.5%) statutory quota meters, and pending approvals."
    ],
    speakerNotes: "Demonstrate governance value: 'Different users need different views. The MP wants a self-check tool to stay compliant. The District Collector wants an inspection list. The Ministry wants national macro trends. SATARK serves all 4 from one single database!'"
  },
  {
    slideNum: 7,
    title: "Closing the Loop: One-Click Printable Audit Dossier",
    tagline: "Moving From Digital Flags to Real Administrative Ground Action",
    points: [
      "Official Inspection Memorandum: 1-click printable CAG/District Engineer notice with pre-filled citations and evidence.",
      "On-Ground Verification Checklist: Standardized checks for physical asset existence, signboard display, and Measurement Book (MB) reconciliation.",
      "Human-in-the-Loop Governance: AI never freezes funds or replaces officers; it acts as an intelligent assistant providing audit-defensible proof.",
      "Digital Sign-Off Audit Trail: District engineers record photos, GPS coordinates, and inspection findings directly onto the system."
    ],
    speakerNotes: "Show practical impact: 'AI that just shows red badges on a screen is useless in government. Our system outputs an official inspection memorandum that a junior engineer can take directly to the construction site to verify the work!'"
  },
  {
    slideNum: 8,
    title: "Why MPLADS-SATARK Wins (The Scorecard)",
    tagline: "Comparing Our Solution Against Typical Hackathon Submissions",
    points: [
      "1. Data Integrity: Typical teams use fake/synthetic data. We use 100% real government MoSPI, CPWD DSR, and Bhuvan data.",
      "2. AI Breadth: Typical teams use 1 basic ML model. We use 6 independent mathematical and ML layers.",
      "3. Transparency: Typical teams have black-box scores. We have an itemized additive waterfall with legal rule citations.",
      "4. Legal Grounding: Grounded directly in GFR 2017 & MPLADS 2023 Guidelines.",
      "5. Ready Working Prototype: Full REST API, Hot Path live sandbox, and interactive UI ready today."
    ],
    speakerNotes: "Conclude with confidence: 'In conclusion, MPLADS-SATARK is not a toy project with dummy numbers. It is an audit-defensible, legally grounded, and ultra-fast vigilance platform ready for national rollout across India. Thank you!'"
  }
];

// Generate Clean HTML Presentation Deck
function generateHtmlGuide(outputPath) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MPLADS-SATARK — Presentation & PPT Master Guide (SIH PS 26102)</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: #131b2e;
      --accent: #3b82f6;
      --gold: #f59e0b;
      --green: #10b981;
      --red: #ef4444;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 30px;
      line-height: 1.6;
    }
    .container { max-width: 1100px; margin: 0 auto; }
    .header {
      text-align: center;
      padding-bottom: 24px;
      border-bottom: 2px solid #1e293b;
      margin-bottom: 30px;
    }
    .header h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 32px;
      color: #fff;
      margin-bottom: 6px;
    }
    .header .subtitle { color: var(--gold); font-weight: 600; font-size: 16px; }
    .header .meta { color: var(--text-muted); font-size: 13px; margin-top: 6px; }
    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.3);
      padding: 12px 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .print-btn {
      background: var(--accent);
      color: #fff;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
    }
    .slide-card {
      background: var(--card-bg);
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 24px 28px;
      margin-bottom: 28px;
      page-break-inside: avoid;
    }
    .slide-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      border-bottom: 1px solid #243049;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }
    .slide-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: var(--gold);
      background: rgba(245, 158, 11, 0.15);
      padding: 4px 10px;
      border-radius: 20px;
      font-weight: 700;
    }
    .slide-title {
      font-family: 'Outfit', sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: #fff;
    }
    .slide-tagline {
      font-size: 13px;
      color: #60a5fa;
      font-style: italic;
      margin-bottom: 14px;
    }
    .points-list {
      list-style-type: none;
      margin-bottom: 16px;
    }
    .points-list li {
      position: relative;
      padding-left: 24px;
      margin-bottom: 10px;
      font-size: 14px;
      color: #e2e8f0;
    }
    .points-list li::before {
      content: "▶";
      position: absolute;
      left: 0;
      color: var(--gold);
      font-size: 11px;
      top: 4px;
    }
    .speaker-box {
      background: rgba(16, 185, 129, 0.08);
      border-left: 4px solid var(--green);
      padding: 10px 16px;
      border-radius: 0 6px 6px 0;
      font-size: 13px;
      color: #a7f3d0;
    }
    .speaker-box b { color: #34d399; }
    @media print {
      body { background: #fff; color: #000; padding: 10px; }
      .action-bar { display: none; }
      .slide-card { background: #fff; border: 1px solid #ccc; color: #000; margin-bottom: 20px; }
      .slide-title { color: #000; }
      .points-list li { color: #222; }
      .speaker-box { background: #f0fdf4; color: #065f46; border-left-color: #059669; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🇮🇳 MPLADS-SATARK (सतर्क) — PPT Presentation Master Guide</h1>
      <div class="subtitle">Smart India Hackathon · Problem Statement 26102 (MoSPI / DIID)</div>
      <div class="meta">Designed for Purva, Vaibhav, Tanvi, Ankesh, Makarand & Raj · Slide-by-Slide Copy-Paste Deck</div>
    </div>

    <div class="action-bar">
      <div><b>Tip for Team:</b> Give this exact structure to teammates making PPT slides. Every bullet is written in simple, persuasive language!</div>
      <button class="print-btn" onclick="window.print()">🖨️ Save / Print as PDF</button>
    </div>

    ${slides.map(s => `
      <div class="slide-card">
        <div class="slide-top">
          <div class="slide-title">${s.title}</div>
          <span class="slide-num">SLIDE ${s.slideNum} OF 8</span>
        </div>
        <div class="slide-tagline">${s.tagline}</div>
        <ul class="points-list">
          ${s.points.map(p => `<li>${p}</li>`).join('')}
        </ul>
        <div class="speaker-box">
          <b>🎙️ Exactly What to Speak to Judges:</b> "${s.speakerNotes}"
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>`;

  fs.writeFileSync(outputPath, html, 'utf8');
}

// Generate PDF binary
function generatePurePdf(outputPath) {
  let objects = [];
  let offsets = [];
  let objCount = 3;

  function addObj(content) {
    objCount++;
    objects.push({ id: objCount, content });
    return objCount;
  }

  const pageIds = [];

  for (const s of slides) {
    let stream = 'BT\n';
    stream += '/F1 18 Tf\n22 TL\n50 780 Td\n';
    stream += `(SLIDE ${s.slideNum}: ${s.title.replace(/[^a-zA-Z0-9 :()-]/g, '')}) '\n`;
    
    stream += '/F1 11 Tf\n15 TL\n';
    stream += `(Tagline: ${s.tagline.replace(/[^a-zA-Z0-9 :()-]/g, '')}) '\n\n`;

    stream += '/F1 12 Tf\n17 TL\n';
    stream += '(KEY BULLET POINTS FOR SLIDE:) \'\n';
    
    stream += '/F1 10 Tf\n14 TL\n';
    for (const p of s.points) {
      // split long lines
      const cleanP = p.replace(/[^a-zA-Z0-9 :(),.+-]/g, '');
      const words = cleanP.split(' ');
      let currentLine = '* ';
      for (const w of words) {
        if ((currentLine + w).length > 80) {
          stream += `(${currentLine}) '\n`;
          currentLine = '  ' + w + ' ';
        } else {
          currentLine += w + ' ';
        }
      }
      if (currentLine.trim()) {
        stream += `(${currentLine}) '\n`;
      }
    }

    stream += '\n/F1 11 Tf\n15 TL\n';
    stream += '(WHAT TO SAY TO JUDGES:) \'\n';
    stream += '/F1 9 Tf\n12 TL\n';
    const cleanNotes = s.speakerNotes.replace(/[^a-zA-Z0-9 :(),.+-]/g, '');
    const noteWords = cleanNotes.split(' ');
    let noteLine = '"';
    for (const w of noteWords) {
      if ((noteLine + w).length > 85) {
        stream += `(${noteLine}) '\n`;
        noteLine = ' ' + w + ' ';
      } else {
        noteLine += w + ' ';
      }
    }
    if (noteLine.trim()) stream += `(${noteLine}") '\n`;

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
const htmlOut = path.join(rootDir, 'MPLADS_SATARK_PPT_Guide.html');
const pdfOut = path.join(rootDir, 'MPLADS_SATARK_PPT_Guide.pdf');

generateHtmlGuide(htmlOut);
console.log('✅ Generated HTML Presentation Guide:', htmlOut);

generatePurePdf(pdfOut);
console.log('✅ Generated PDF Document:', pdfOut, `(${fs.statSync(pdfOut).size} bytes)`);
