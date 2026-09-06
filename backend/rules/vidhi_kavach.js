/**
 * VIDHI-KAVACH (विधि-कवच | The Statutory Shield)
 * Deterministic Statutory Compliance & Negative List Sentry for MPLADS.
 * Evaluates public works against official guidelines (Annexure-I Negative List, GFR Rules).
 * Enhanced with Indic Lexicon Transliteration & Configurable Rulebook Versioning.
 */

const RULEBOOK_METADATA = {
  version: 'GFR-2017-v2.4 / MPLADS-2023-v1.2',
  lastUpdated: '2026-09-01',
  isConfigurable: true,
  statutoryAuthorities: ['Ministry of Finance (DoE)', 'MoSPI DIID', 'CVC']
};

const RULES = [
  {
    id: 'NEG-LIST-01',
    name: 'Places of Worship & Religious Structures',
    clause: 'MPLADS Guidelines 2023, Annexure-I (Negative List), Item 1',
    severity: 'CRITICAL',
    penalty: 40,
    keywords: [
      'temple', 'mandir', 'mosque', 'masjid', 'church', 'gurudwara', 
      'ashram', 'shrine', 'religious', 'math', 'dargah', 'puja pandal', 
      'idol', 'cemetery', 'kabristan', 'samadhi', 'devi sthal', 'devi sthan',
      'tirth', 'dharamshala', 'akhada', 'sthan', 'muth', 'gautam buddha sthal'
    ],
    explanation: 'Works within or belonging to places of religious worship are strictly inadmissible.'
  },
  {
    id: 'NEG-LIST-02',
    name: 'Commercial Entities & Private Trusts',
    clause: 'MPLADS Guidelines 2023, Annexure-I (Negative List), Item 4',
    severity: 'CRITICAL',
    penalty: 35,
    keywords: [
      'pvt ltd', 'private limited', 'commercial complex', 'shopping center', 
      'shopping mall', 'private society', 'family trust', 'private club', 'resort',
      'commercial shop', 'private firm'
    ],
    explanation: 'Works creating assets for private commercial gain or private trusts are prohibited.'
  },
  {
    id: 'NEG-LIST-03',
    name: 'Land Acquisition & Private Property',
    clause: 'MPLADS Guidelines 2023, Annexure-I (Negative List), Item 7',
    severity: 'HIGH',
    penalty: 30,
    keywords: [
      'land acquisition', 'purchase of land', 'land compensation', 'private plot'
    ],
    explanation: 'Purchase of land or compensation for land acquisition is not permissible under MPLADS.'
  },
  {
    id: 'NEG-LIST-04',
    name: 'Non-Durable Consumables & Honorariums',
    clause: 'MPLADS Guidelines 2023, Annexure-I (Negative List), Item 8',
    severity: 'HIGH',
    penalty: 25,
    keywords: [
      'honorarium', 'salary', 'fuel expenses', 'refreshment', 'sports kit distribution',
      'uniform distribution', 'festival celebration', 'grant in aid'
    ],
    explanation: 'Revenue expenditure, recurring costs, and non-durable consumables are strictly prohibited.'
  },
  {
    id: 'MARCH-RUSH',
    name: 'Fiscal Year-End March Rush Violation',
    clause: 'GFR 2017 Rule 62 & CVC Circular on Rush of Expenditure',
    severity: 'MEDIUM',
    penalty: 15,
    explanation: 'Sanctioning works during the final 10 days of March to exhaust remaining unspent funds is an audit breach.'
  }
];

function isMarchRush(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const month = d.getMonth() + 1; // March is 3
  const day = d.getDate();
  return month === 3 && day >= 20;
}

function auditProject(project) {
  const violations = [];
  const textToScan = `${project.title || ''} ${project.category || ''}`.toLowerCase();

  for (const rule of RULES) {
    if (rule.id === 'MARCH-RUSH') {
      if (isMarchRush(project.date)) {
        violations.push({
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          legalClause: rule.clause,
          finding: `Sanctioned on ${project.date} (March Rush Window)`,
          explanation: rule.explanation
        });
      }
    } else if (rule.keywords) {
      for (const kw of rule.keywords) {
        if (textToScan.includes(kw)) {
          violations.push({
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            legalClause: rule.clause,
            finding: `Flagged keyword "${kw}" found in work description "${project.title}"`,
            explanation: rule.explanation
          });
          break; // Avoid duplicate flags for same rule
        }
      }
    }
  }

  return {
    isCompliant: violations.length === 0,
    violations: violations,
    totalViolations: violations.length,
    rulebookMetadata: RULEBOOK_METADATA
  };
}

module.exports = {
  RULES,
  RULEBOOK_METADATA,
  auditProject,
  isMarchRush
};
