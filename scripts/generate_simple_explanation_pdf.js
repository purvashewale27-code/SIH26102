/**
 * scripts/generate_simple_explanation_pdf.js
 * Generates an easy-to-read, beautifully formatted HTML and pure PDF guide
 * explaining MPLADS-SATARK features in simple language for friends & team members.
 */

const fs = require('fs');
const path = require('path');

const guideData = {
  title: "MPLADS-SATARK (सतर्क) — Simple Feature Guide",
  subtitle: "An Easy, Plain-Language Explanation of All 7 AI Detectives to Share with Friends & Team",
  meta: [
    { label: "Problem Statement", value: "PS 26102 (MoSPI / DIID)" },
    { label: "Project Title", value: "MPLADS-SATARK (Automated Forensic Vigilance)" },
    { label: "Dataset Scale", value: "176,925 Real Government Projects | 37 States & UTs" },
    { label: "Core Purpose", value: "Pre-Disbursement Audit & Multi-Layer Fraud Prevention" }
  ],
  features: [
    {
      num: 1,
      name: "VIDHI-KAVACH (विधि-कवच)",
      tagline: "The Legal Shield & Rules Referee",
      whatItDoes: "Checks if government laws, SC/ST mandatory quotas, and MPLADS guidelines are strictly followed before money is disbursed.",
      howToExplain: "Think of this like a referee in a football match. Government money has strict rules — for example, you cannot use public funds to build private clubhouses, luxury guest houses, or buy private cars. It also stops 'March Rush' (when officers try to spend all remaining budget in the last few days of March just so the funds don't expire).",
      example: "If someone tries to pass a bill for an unapproved private building in mid-March, VIDHI-KAVACH immediately blows the whistle and blocks it!"
    },
    {
      num: 2,
      name: "PUNAR-DRISHTI (पुनर्दृष्टि)",
      tagline: "The Double-Dipping & Clone Sentry",
      whatItDoes: "Catches duplicate or copy-pasted projects using smart text-matching (TF-IDF & Cosine Similarity).",
      howToExplain: "Imagine a dishonest contractor builds one concrete road in a village using rural scheme money (like MGNREGA). Then, he submits the exact same road under MPLADS scheme funds to get paid twice for the same work! PUNAR-DRISHTI compares project titles across scheme databases.",
      example: "It compares 'PCC Road near GP Office' in both databases and catches double-billing instantly!"
    },
    {
      num: 3,
      name: "ARTHA-DARPAN (अर्थ-दर्पण)",
      tagline: "The Price Inflation & Rate Book Checker",
      whatItDoes: "Compares claimed project costs against standard government benchmarks (CPWD Delhi Schedule of Rates).",
      howToExplain: "Imagine going to buy a phone that costs ₹80,000, but the shopkeeper charges you ₹3,00,000. ARTHA-DARPAN keeps a standard price book for every state in India. If a standard 500-meter road usually costs ₹5 Lakhs, but a bill comes in for ₹18 Lakhs, ARTHA-DARPAN flags it.",
      example: "It flags excess expenditure and calculates exact overpricing (e.g., '₹13 Lakhs excess risk flagged')."
    },
    {
      num: 4,
      name: "CHAKRA-VYUH (चक्रव्यूह)",
      tagline: "The Contractor Syndicate & Cartel Hunter",
      whatItDoes: "Exposes hidden networks and cartels between contractors, agencies, and officers using network graph theory.",
      howToExplain: "Sometimes, 3 or 4 contractor companies pretend to compete against each other in open tenders, but behind closed doors, they are all owned by the same family or group! CHAKRA-VYUH builds a visual web (social network graph) connecting MPs, agencies, and vendors to see who is getting all the contracts.",
      example: "If one single contractor secretly captures 85% of all project contracts in a district, CHAKRA-VYUH flags a Monopoly/Cartel Risk."
    },
    {
      num: 5,
      name: "VIBHED-NETRA (विभेद-नेत्र)",
      tagline: "The 12D AI Anomaly Spotter",
      whatItDoes: "Finds suspicious projects by evaluating 12 different clues simultaneously using Machine Learning (Isolation Forest).",
      howToExplain: "A human auditor can only look at 1 or 2 details at a time (like cost or date). But this AI looks at 12 details simultaneously (cost, duration, completion rate, location, payment pattern, etc.) to spot weird outliers.",
      example: "A project that was approved in 1 day, spent 100% of its budget on day 2, but has zero physical progress stands out like a sore thumb to the AI."
    },
    {
      num: 6,
      name: "SANKHYA-SATYA (संख्या-सत्य)",
      tagline: "The Fake Bill & Tender-Split Finder",
      whatItDoes: "Uses financial math (Benford's Law) and pattern recognition to catch fabricated numbers and tender splitting.",
      howToExplain: "1) Tender-Splitting: Rules say any project above ₹5 Lakhs MUST go through an open public tender. Dishonest people split a ₹14 Lakh project into three fake bills of ₹4.95 Lakhs each to bypass tenders! SANKHYA-SATYA catches this trick.\n2) Benford's Law: In real financial records, the number 1 appears as the first digit about 30% of the time. When humans make up fake bills from thin air, they overuse round numbers (like ₹5,00,000). Math catches them!",
      example: "Flags artificial bill splitting (smurfing) and round-number human-fabricated estimates."
    },
    {
      num: 7,
      name: "BHU-DRISHTI (भू-दृष्टि)",
      tagline: "The Satellite & Ghost Asset Radar",
      whatItDoes: "Uses GPS coordinates and ISRO satellite maps to check if the project actually exists on the ground.",
      howToExplain: "What if someone claims ₹15 Lakhs for a 'Community Center', but it was never built? BHU-DRISHTI checks the exact GPS latitude and longitude on satellite maps.",
      example: "If the GPS location shows empty barren land, a lake, or a forest where a building was claimed to be constructed, BHU-DRISHTI flags it as a Ghost Asset!"
    }
  ],
  masterSystem: {
    title: "🎯 Unified Priority Score & Official Vigilance Memo",
    scoreExp: "Combines all 7 sentinels into one clear score from 0 to 100. 0-30 is Green (Clean), 30-70 is Yellow (Medium Risk), and 70-100 is Red (Critical Fraud Risk).",
    memoExp: "With one click, auditors can generate and print an official legal vigilance memorandum (Form GFR-19A) with Government letterhead, rule citations, and a field verification checklist!"
  },
  elevatorPitch: "SATARK is an all-in-one AI vigilance system for government projects. It uses 7 specialized AI sentinels to check rules, stop duplicate billing, check fair pricing, break up contractor syndicates, run financial math audits on fake bills, and check satellite maps to make sure projects actually exist on the ground!"
};

function generateHtml(outputPath) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${guideData.title}</title>
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
      font-size: 28px;
      color: #fff;
      margin-bottom: 8px;
      background: linear-gradient(90deg, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .header .subtitle {
      color: var(--muted);
      font-size: 15px;
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
      transition: transform 0.2s;
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
      white-space: pre-line;
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
      <h1>${guideData.title}</h1>
      <div class="subtitle">${guideData.subtitle}</div>
      <div class="meta-grid">
        ${guideData.meta.map(m => `
          <div class="meta-card">
            <div class="meta-label">${m.label}</div>
            <div class="meta-val">${m.value}</div>
          </div>
        `).join('')}
      </div>
    </div>

    ${guideData.features.map(f => `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">${f.num}. ${f.name}</div>
            <div class="card-tagline">${f.tagline}</div>
          </div>
          <span class="num-badge">Sentinel ${f.num} of 7</span>
        </div>

        <div class="section-title">🔍 What it does:</div>
        <div class="section-content">${f.whatItDoes}</div>

        <div class="section-title">💡 How to explain it to a friend:</div>
        <div class="section-content">${f.howToExplain}</div>

        <div class="example-box">
          <b>⚡ Real-World Example:</b> ${f.example}
        </div>
      </div>
    `).join('')}

    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">${guideData.masterSystem.title}</div>
          <div class="card-tagline">Master Risk Aggregator & Legal Memo Sentry</div>
        </div>
      </div>

      <div class="section-title">📊 0 to 100 Composite Risk Score:</div>
      <div class="section-content">${guideData.masterSystem.scoreExp}</div>

      <div class="section-title">📜 1-Click Legal Memorandum:</div>
      <div class="section-content">${guideData.masterSystem.memoExp}</div>
    </div>

    <div class="pitch-card">
      <div class="pitch-title">🗣️ 30-Second Quick Elevator Pitch:</div>
      <div style="font-size: 15px; line-height: 1.6;">"${guideData.elevatorPitch}"</div>
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

  contentLines.push("MPLADS-SATARK (SATARK) - Simple Feature Guide");
  contentLines.push("=================================================");
  contentLines.push("Problem Statement 26102 | MoSPI / DIID | 176,925 Real Government Works");
  contentLines.push("");

  guideData.features.forEach(f => {
    contentLines.push(`[ Sentinel ${f.num} ] ${f.name} - ${f.tagline}`);
    contentLines.push(`* WHAT IT DOES: ${f.whatItDoes}`);
    contentLines.push(`* HOW TO EXPLAIN: ${f.howToExplain.replace(/\n/g, ' ')}`);
    contentLines.push(`* EXAMPLE: ${f.example}`);
    contentLines.push("-------------------------------------------------");
  });

  contentLines.push(`[ MASTER SYSTEM ] ${guideData.masterSystem.title}`);
  contentLines.push(`* COMPOSITE SCORE: ${guideData.masterSystem.scoreExp}`);
  contentLines.push(`* LEGAL MEMO: ${guideData.masterSystem.memoExp}`);
  contentLines.push("");
  contentLines.push("30-SECOND QUICK ELEVATOR PITCH:");
  contentLines.push(`"${guideData.elevatorPitch}"`);

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
const htmlFile = path.join(rootDir, 'SATARK_Simple_Features_Guide.html');
const pdfFile = path.join(rootDir, 'SATARK_Simple_Features_Guide.pdf');

generateHtml(htmlFile);
console.log('✅ Generated HTML Guide:', htmlFile);

generatePurePdf(pdfFile);
console.log('✅ Generated PDF Document:', pdfFile, `(${fs.statSync(pdfFile).size} bytes)`);

