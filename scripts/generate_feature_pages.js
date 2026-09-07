const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, '../frontend/index.html');
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// 1. Head Content
const headContent = indexHtml.substring(indexHtml.indexOf('<head>'), indexHtml.indexOf('</head>') + 7);

// 2. Ministerial Masthead (Utility strip removed per design request)
const mastheadStart = indexHtml.indexOf('<!-- 2. MINISTERIAL MASTHEAD');
const stickyNavStart = indexHtml.indexOf('<!-- UNIFIED STICKY EXECUTIVE NAVIGATION HEADER');
const masthead = indexHtml.substring(mastheadStart, stickyNavStart).trim();

// 4. Unified Sticky Executive Navigation Header (Primary Nav + Sentinel Directory)
const mainContentStart = indexHtml.indexOf('<!-- Main Content Container -->');
const stickyNavHeader = indexHtml.substring(stickyNavStart, mainContentStart).trim();

// 6. Shared KPI Section
const kpiStart = indexHtml.indexOf('<!-- Dynamic 4 Summary KPI Cards');
const tableSecStart = indexHtml.indexOf('<!-- Project Explorer Section -->');
const kpiSection = indexHtml.substring(kpiStart, tableSecStart).trim();

// 7. Table Header Controls
const tableHeaderBarStart = indexHtml.indexOf('<div class="table-header-bar">');
const filterTabBarStart = indexHtml.indexOf('<!-- Quick Filter Tabs');
const tableHeaderBar = indexHtml.substring(tableHeaderBarStart, filterTabBarStart).trim();

// 8. Filter Tab Bar
const chakraStart = indexHtml.indexOf('<!-- Feature 4 Dedicated Interactive Network Ego-Graph');
const filterTabBar = indexHtml.substring(filterTabBarStart, chakraStart).trim();

// 9. Table Container and Pagination Footer
const tableContainerStart = indexHtml.indexOf('<!-- Real Data Table -->');
const tableSecEnd = indexHtml.indexOf('</section>', tableContainerStart) + 10;
const tableContainerAndPagination = indexHtml.substring(tableContainerStart, tableSecEnd).trim();

// 10. Modals
const modalsStart = indexHtml.indexOf('<!-- Modal / Drawer for Inspection Details -->');
const footerStart = indexHtml.indexOf('<footer class="site-footer"');
const modals = indexHtml.substring(modalsStart, footerStart).trim();

// 11. Footer
const footerEnd = indexHtml.indexOf('</footer>') + 9;
const footer = indexHtml.substring(footerStart, footerEnd).trim();

// Feature-Specific Specialized Visualizer Sections
// A. Chakra-Vyuh graph section
const benfordStart = indexHtml.indexOf('<!-- Feature 6 Dedicated Interactive Benford');
const chakraSection = indexHtml.substring(chakraStart, benfordStart).trim().replace('style="display: none;"', 'style="display: block;"');

// B. Benford histogram section
const bhuStart = indexHtml.indexOf('<!-- Feature 7 Dedicated Interactive Geospatial');
const benfordSection = indexHtml.substring(benfordStart, bhuStart).trim().replace('style="display: none;"', 'style="display: block;"');

// C. Bhu-Drishti map section
const bhuSection = indexHtml.substring(bhuStart, tableContainerStart).trim().replace('style="display: none;"', 'style="display: block;"');

// D. Samvaad Copilot Card
const samvaadStart = indexHtml.indexOf('<!-- 09. CORE MODULE 09: SATARK-SAMVAAD');
const prashnaStart = indexHtml.indexOf('<!-- 10. CORE MODULE 10: PRASHNA-KAVACH');
const samvaadSection = indexHtml.substring(samvaadStart, prashnaStart).trim().replace('style="display: none;"', 'style="display: block;"');

// Function to generate the Unified Sticky Header with accurate active states
function getStickyNavHeader(activeView, activeNav) {
  let nav = stickyNavHeader;
  nav = nav.replace(/class="main-nav-btn active"/g, 'class="main-nav-btn"');
  nav = nav.replace(`class="main-nav-btn" data-view="${activeView}"`, `class="main-nav-btn active" data-view="${activeView}"`);
  nav = nav.replace(/class="s-nav-tab active"/g, 'class="s-nav-tab"');
  nav = nav.replace(`class="s-nav-tab" data-nav="${activeNav}"`, `class="s-nav-tab active" data-nav="${activeNav}"`);
  const engineNavs = ['vidhi-kavach', 'punar-drishti', 'artha-darpan', 'chakra-vyuh', 'vibhed-netra', 'sankhya-satya', 'bhu-drishti'];
  if (engineNavs.includes(activeNav)) {
    nav = nav.replace('class="s-nav-tab s-dropdown-trigger"', 'class="s-nav-tab s-dropdown-trigger active"');
  }
  return nav;
}

// Definition of each independent page
const pages = [
  {
    fileName: 'vidhi-kavach.html',
    pageId: 'vidhi-kavach',
    mainView: 'overview',
    sentinelCode: 'S-01',
    chipClass: 'gov',
    shortTitle: 'VIDHI-KAVACH (विधि-कवच)',
    title: 'VIDHI-KAVACH (विधि-कवच) · Statutory Compliance & Negative List Sentry | MPLADS-SATARK',
    tag: 'SENTINEL S-01: VIDHI-KAVACH (विधि-कवच — STATUTORY POLICY SHIELD)',
    tagColor: 'rgba(12, 35, 64, 0.06)',
    tagTextColor: '#0c2340',
    tagBorder: 'rgba(12, 35, 64, 0.18)',
    heading: 'Statutory Rule Compliance & Negative List Sentry',
    subheading: 'Auditing 176,925 works strictly against MoSPI MPLADS Guidelines 2023 (Annexure-I Prohibited Works) & GFR Rule 62',
    badgeVal: '23,722',
    badgeLbl: 'Statutory Breaches Flagged',
    badgeColor: '#0c2340',
    visualizer: ''
  },
  {
    fileName: 'punar-drishti.html',
    pageId: 'punar-drishti',
    mainView: 'overview',
    sentinelCode: 'S-02',
    chipClass: 'gov',
    shortTitle: 'PUNAR-DRISHTI (पुनर्दृष्टि)',
    title: 'PUNAR-DRISHTI (पुनर्दृष्टि) · NLP Duplicate Claims & Twin Works Sentry | MPLADS-SATARK',
    tag: 'SENTINEL S-02: PUNAR-DRISHTI (पुनर्दृष्टि — NLP DUPLICATE SENTRY)',
    tagColor: 'rgba(12, 35, 64, 0.06)',
    tagTextColor: '#0c2340',
    tagBorder: 'rgba(12, 35, 64, 0.18)',
    heading: 'Cross-Work Lexical NLP Twin Work & Double-Billing Sentry',
    subheading: "Vaibhav's TF-IDF & Cosine Similarity Engine identifying identical work descriptions and duplicate billing claims across India",
    badgeVal: '10,204',
    badgeLbl: 'Duplicate Claims (6,965 Clones)',
    badgeColor: '#0c2340',
    visualizer: ''
  },
  {
    fileName: 'artha-darpan.html',
    pageId: 'artha-darpan',
    mainView: 'overview',
    sentinelCode: 'S-03',
    chipClass: 'gov',
    shortTitle: 'ARTHA-DARPAN (अर्थ-दर्पण)',
    title: 'ARTHA-DARPAN (अर्थ-दर्पण) · CPWD DSR Benchmark & Price Inflation Sentry | MPLADS-SATARK',
    tag: 'SENTINEL S-03: ARTHA-DARPAN (अर्थ-दर्पण — COST INTEGRITY SENTRY)',
    tagColor: 'rgba(12, 35, 64, 0.06)',
    tagTextColor: '#0c2340',
    tagBorder: 'rgba(12, 35, 64, 0.18)',
    heading: 'CPWD Schedule of Rates Benchmark & Cost Inflation Sentry',
    subheading: 'Calibrated with 108 State-Category CPWD Delhi Schedule of Rates (DSR 2023-24) to flag unjustified cost escalations',
    badgeVal: '₹3,639.9 Cr',
    badgeLbl: 'Flagged Excess Overrun Risk',
    badgeColor: '#0c2340',
    visualizer: ''
  },
  {
    fileName: 'chakra-vyuh.html',
    pageId: 'chakra-vyuh',
    mainView: 'networks',
    sentinelCode: 'S-04',
    chipClass: 'gov',
    shortTitle: 'CHAKRA-VYUH (चक्रव्यूह)',
    title: 'CHAKRA-VYUH (चक्रव्यूह) · Contractor Cartel & Vendor Nexus Sentry | MPLADS-SATARK',
    tag: 'SENTINEL S-04: CHAKRA-VYUH (चक्रव्यूह — CARTEL NEXUS SENTRY)',
    tagColor: 'rgba(12, 35, 64, 0.06)',
    tagTextColor: '#0c2340',
    tagBorder: 'rgba(12, 35, 64, 0.18)',
    heading: 'Contractor Cartel & Vendor Nexus Forensic Sentry',
    subheading: 'Herfindahl-Hirschman Index (HHI) concentration audit over 109,475 payment vouchers mapping MP-to-Agency-to-Vendor flows',
    badgeVal: '47,302',
    badgeLbl: 'Cartel Risk Works (1,248 Monopolies)',
    badgeColor: '#0c2340',
    visualizer: chakraSection
  },
  {
    fileName: 'vibhed-netra.html',
    pageId: 'vibhed-netra',
    mainView: 'overview',
    sentinelCode: 'S-05',
    chipClass: 'gov',
    shortTitle: 'VIBHED-NETRA (विभेद-नेत्र)',
    title: 'VIBHED-NETRA (विभेद-नेत्र) · 12-Dimensional Isolation Forest Anomaly Sentry | MPLADS-SATARK',
    tag: 'SENTINEL S-05: VIBHED-NETRA (विभेद-नेत्र — ML ANOMALY SENTRY)',
    tagColor: 'rgba(12, 35, 64, 0.06)',
    tagTextColor: '#0c2340',
    tagBorder: 'rgba(12, 35, 64, 0.18)',
    heading: '12-Dimensional Isolation Forest Multivariate Outlier Sentry',
    subheading: 'Unsupervised Machine Learning anomaly detector calibrated in <15ms across 176,925 works evaluating efficiency and delay vectors',
    badgeVal: '37,391',
    badgeLbl: 'High-Dimensional Outliers (7,780 Critical)',
    badgeColor: '#0c2340',
    visualizer: ''
  },
  {
    fileName: 'sankhya-satya.html',
    pageId: 'sankhya-satya',
    mainView: 'overview',
    sentinelCode: 'S-06',
    chipClass: 'gov',
    shortTitle: 'SANKHYA-SATYA (संख्या-सत्य)',
    title: 'SANKHYA-SATYA (संख्या-सत्य) · Benford Forensic Digit & Tender-Splitting Sentry | MPLADS-SATARK',
    tag: 'SENTINEL S-06: SANKHYA-SATYA (संख्या-सत्य — MATHEMATICAL FORENSIC SENTRY)',
    tagColor: 'rgba(12, 35, 64, 0.06)',
    tagTextColor: '#0c2340',
    tagBorder: 'rgba(12, 35, 64, 0.18)',
    heading: "Benford's Law Digit Sentry & GFR Tender-Splitting Sentry",
    subheading: 'Forensic logarithmic first-digit analysis & threshold evasion detection (works clustered below ₹5,00,000 to bypass tenders)',
    badgeVal: '7,710',
    badgeLbl: 'Threshold Splits (Chi-Sq: 68.4)',
    badgeColor: '#0c2340',
    visualizer: benfordSection
  },
  {
    fileName: 'bhu-drishti.html',
    pageId: 'bhu-drishti',
    mainView: 'map',
    sentinelCode: 'S-07',
    chipClass: 'gov',
    shortTitle: 'BHU-DRISHTI (भू-दृष्टि)',
    title: 'BHU-DRISHTI (भू-दृष्टि) · Geospatial Satellite Sentry & Ghost Asset Radar | MPLADS-SATARK',
    tag: 'SENTINEL S-07: BHU-DRISHTI (भू-दृष्टि — GEOSPATIAL SATELLITE RADAR)',
    tagColor: 'rgba(12, 35, 64, 0.06)',
    tagTextColor: '#0c2340',
    tagBorder: 'rgba(12, 35, 64, 0.18)',
    heading: 'Geospatial Satellite Sentry & Ghost Asset Radar',
    subheading: 'Satellite coordinate verification & spatial proximity clustering auditing 176,925 works for physical existence',
    badgeVal: '3,031',
    badgeLbl: 'Ghost Assets (Disbursed Without Geotag)',
    badgeColor: '#0c2340',
    visualizer: bhuSection
  },
  {
    fileName: 'samvaad.html',
    pageId: 'samvaad',
    mainView: 'investigate',
    sentinelCode: 'AI',
    chipClass: 'gov',
    shortTitle: 'SATARK-SAMVAAD (सतर्क संवाद)',
    title: 'SATARK-SAMVAAD (सतर्क संवाद) · GenAI Natural Language Audit Copilot | MPLADS-SATARK',
    tag: 'SATARK-SAMVAAD (सतर्क संवाद) — GENAI AUDIT COPILOT',
    tagColor: 'rgba(12, 35, 64, 0.06)',
    tagTextColor: '#0c2340',
    tagBorder: 'rgba(12, 35, 64, 0.18)',
    heading: 'Real-Time Conversational Forensic Copilot over 176,925 MoSPI Works',
    subheading: 'Ask natural language queries in English or Hindi to synthesize cross-sentinel evidence and generate printable vigilance memorandums',
    badgeVal: '176,925',
    badgeLbl: 'Records Indexed in Real Time',
    badgeColor: '#0c2340',
    visualizer: samvaadSection
  }
];

// Generate each page
pages.forEach(p => {
  const currentStickyNav = getStickyNavHeader(p.mainView, p.pageId);
  const currentTableHeaderBar = tableHeaderBar
    .replace(/id="view-feature-tag">.*?<\/div>/, `id="view-feature-tag">${p.tag}</div>`)
    .replace(/id="view-heading">.*?<\/h2>/, `id="view-heading">${p.heading}</h2>`)
    .replace(/id="view-subheading">.*?<\/p>/, `id="view-subheading">${p.subheading}</p>`);

  const heroCard = `
    <!-- Dedicated Feature Hero Card -->
    <section class="feature-hero-card">
      <div class="feature-hero-left">
        <div class="feature-hero-tag" style="background:${p.tagColor}; color:${p.tagTextColor}; border:1px solid ${p.tagBorder};">
          ${p.tag}
        </div>
        <h1 class="feature-hero-title">${p.heading}</h1>
        <p class="feature-hero-desc">${p.subheading}</p>
      </div>
      <div class="feature-hero-badge">
        <span class="val" style="color:${p.badgeColor};">${p.badgeVal}</span>
        <span class="lbl">${p.badgeLbl}</span>
      </div>
    </section>
  `;

  const pageHtml = `<!DOCTYPE html>
<html lang="en">
${headContent.replace(/<title>.*?<\/title>/, `<title>${p.title}</title>`)}
<body data-page="${p.pageId}">

  ${masthead}

  ${currentStickyNav}

  <!-- Main Content Container -->
  <main class="page-container">

    ${heroCard}

    ${kpiSection}

    <section class="table-section">
      ${currentTableHeaderBar}

      ${filterTabBar}

      ${p.visualizer}

      ${tableContainerAndPagination}

  </main>

  ${modals}

  ${footer}

  <!-- SCRIPTS -->
  <script src="app.js"></script>
  ${p.pageId === 'bhu-drishti' ? `
  <!-- BHU-DRISHTI: Direct fallback map initializer for independent page -->
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        if (typeof initOrUpdateBhuMap === 'function') {
          try { initOrUpdateBhuMap(); } catch(e) { console.error('[BHU-DRISHTI] Map init error:', e); }
        }
      }, 200);
    });
  </script>` : ''}
</body>
</html>`;

  const outPath = path.join(__dirname, '../frontend', p.fileName);
  fs.writeFileSync(outPath, pageHtml, 'utf8');
  console.log(`✅ Generated dedicated page: frontend/${p.fileName} (${fs.statSync(outPath).size} bytes)`);
});

console.log('\n🎉 ALL 8 INDEPENDENT FEATURE PAGES GENERATED SUCCESSFULLY!');
