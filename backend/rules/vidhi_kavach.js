/**
 * VIDHI-KAVACH (विधि-कवच | The Statutory Shield)
 * Deterministic Statutory Compliance & Negative List Sentry for MPLADS.
 * Evaluates public works against official guidelines (Annexure-I Negative List, GFR Rules).
 */

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
      'idol', 'cemetery', 'kabristan', 'samadhi'
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
      'shopping mall', 'private society', 'family trust', 'private club', 'resort'
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
    keywords: [], // evaluated via date
    explanation: 'Sanction approved in the final 10 days of the financial year (March 21-31), risking hurried unvetted fund exhaustion.'
  }
];

/**
 * Checks a single project object against all statutory rules.
 * @param {Object} project - Standard project item
 * @returns {Object} Verdict with status, score, and violations list
 */
function auditProject(project) {
  const violations = [];
  let totalPenalty = 0;

  const textToScan = `${project.title || ''} ${project.category || ''} ${project.description || ''}`.toLowerCase();

  for (const rule of RULES) {
    // 1. Keyword-based Negative List checks
    if (rule.keywords.length > 0) {
      for (const kw of rule.keywords) {
        // Regex word boundary matching to prevent false matches
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        if (regex.test(textToScan)) {
          violations.push({
            ruleId: rule.id,
            ruleName: rule.name,
            clause: rule.clause,
            severity: rule.severity,
            penalty: rule.penalty,
            matchedKeyword: kw,
            explanation: rule.explanation
          });
          totalPenalty += rule.penalty;
          break; // Avoid multiple hits of the same rule
        }
      }
    }

    // 2. March Rush Check
    if (rule.id === 'MARCH-RUSH' && project.date) {
      const dateStr = String(project.date).toLowerCase();
      // Match dates in late March (e.g., "25-Mar", "28-March", "2025-03-28", etc.)
      const isLateMarch = /2[1-9]-mar|3[01]-mar|-03-2[1-9]|-03-3[01]/i.test(dateStr);
      if (isLateMarch) {
        violations.push({
          ruleId: rule.id,
          ruleName: rule.name,
          clause: rule.clause,
          severity: rule.severity,
          penalty: rule.penalty,
          matchedKeyword: 'Fiscal Year-End (March 21-31)',
          explanation: rule.explanation
        });
        totalPenalty += rule.penalty;
      }
    }
  }

  const isCompliant = violations.length === 0;

  return {
    status: isCompliant ? 'COMPLIANT' : 'VIOLATION',
    isCompliant,
    riskScore: Math.min(100, totalPenalty),
    violationCount: violations.length,
    violations: violations,
    primaryBadge: isCompliant 
      ? { text: 'COMPLIANT', color: 'success' } 
      : { text: `RED FLAG: ${violations[0].ruleId}`, color: 'danger', detail: violations[0].ruleName }
  };
}

module.exports = {
  RULES,
  auditProject
};
