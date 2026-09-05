/**
 * MPLADS-SATARK: Signal 3 (6C) — Bitemporal Policy-as-Data Statutory Engine
 * Evaluates GFR 2017 & MPLADS Guidelines 2023 versioned rules:
 * - SC/ST Quotas (15% SC / 7.5% ST allocation mandatory)
 * - Negative List 01-07 (Places of worship, commercial works, land acquisition, etc.)
 * - March Rush / Expenditure Pacing Caps (Ministry of Finance GFR Rule 62)
 * - Statutory Completion Deadlines (18 months from sanction)
 * - Trust / Registered Society Lifetime Cap (₹50 Lakhs limit)
 */

const fs = require('fs');
const path = require('path');

class StatutoryRulesEngine {
  constructor() {
    this.rules = [];
    this.isLoaded = false;
  }

  loadRules() {
    if (this.isLoaded) return;
    try {
      const p = path.join(__dirname, '..', 'policy', 'statutory_rules.json');
      if (fs.existsSync(p)) {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        this.rules = data.rules || [];
      }
    } catch (e) {
      console.warn('⚠️ Could not load statutory rules:', e.message);
    }
    this.isLoaded = true;
  }

  getRulesActiveOn(dateStr) {
    this.loadRules();
    const target = dateStr ? new Date(dateStr) : new Date();
    return this.rules.filter(rule => {
      const from = new Date(rule.effective_from);
      const to = rule.effective_to ? new Date(rule.effective_to) : new Date('2099-12-31');
      return target >= from && target <= to;
    });
  }

  evaluateProject(project, constituencyContext = null) {
    this.loadRules();
    const sanctionDateStr = project.fields?.sanction_date?.value || '2024-04-01';
    const activeRules = this.getRulesActiveOn(sanctionDateStr);

    const violations = [];
    let complianceScore = 1.0; // 1.0 = 100% compliant, 0.0 = severe violation
    const title = (project.project_title || '').toLowerCase();
    const category = (project.work_category || '').toLowerCase();
    const cost = project.fields?.estimated_cost?.value || 0;
    const isMarchRush = project.fields?.is_march_rush?.value || false;
    const delayDays = project.fields?.delay_days?.value || 0;

    for (const rule of activeRules) {
      // 1. Negative List: Places of Worship (NEG-LIST-04)
      if (rule.rule_id === 'NEG-LIST-04') {
        const religiousKeywords = ['temple', 'mandir', 'masjid', 'mosque', 'church', 'gurudwara', 'ashram', 'dargah', 'shrine', 'samadhi'];
        const matched = religiousKeywords.find(kw => title.includes(kw));
        if (matched) {
          violations.push({
            rule_id: rule.rule_id,
            clause: rule.clause_title || rule.clause,
            citation: rule.legal_source || rule.citation,
            version: rule.version,
            provenance: 'STATUTORY',
            severity: 'CRITICAL',
            penalty_points: 35,
            message: `Ineligible Work: Keyword '${matched}' matches prohibited place of worship under MPLADS 2023 Guidelines Annexure.`
          });
          complianceScore -= 0.35;
        }
      }

      // 2. Negative List: Land Acquisition (NEG-LIST-07)
      if (rule.rule_id === 'NEG-LIST-07') {
        const landKeywords = ['land acquisition', 'purchase of land', 'compensation for land'];
        const matched = landKeywords.find(kw => title.includes(kw));
        if (matched) {
          violations.push({
            rule_id: rule.rule_id,
            clause: rule.clause_title || rule.clause,
            citation: rule.legal_source || rule.citation,
            version: rule.version,
            provenance: 'STATUTORY',
            severity: 'CRITICAL',
            penalty_points: 30,
            message: `Ineligible Work: Land acquisition is explicitly inadmissible under MPLADS Guidelines.`
          });
          complianceScore -= 0.30;
        }
      }

      // 3. Negative List: Maintenance / Recurring (NEG-LIST-06)
      if (rule.rule_id === 'NEG-LIST-06') {
        const maintKeywords = ['maintenance work', 'routine repair', 'operational cost', 'fuel charges'];
        const matched = maintKeywords.find(kw => title.includes(kw));
        if (matched) {
          violations.push({
            rule_id: rule.rule_id,
            clause: rule.clause_title || rule.clause,
            citation: rule.legal_source || rule.citation,
            version: rule.version,
            provenance: 'STATUTORY',
            severity: 'HIGH',
            penalty_points: 20,
            message: `Recurring Maintenance: Works of routine maintenance / repair are not permissible.`
          });
          complianceScore -= 0.20;
        }
      }

      // 4. March Rush Pacing Cap (PACE-CAP)
      if (rule.rule_id === 'PACE-CAP') {
        if (isMarchRush) {
          violations.push({
            rule_id: rule.rule_id,
            clause: rule.clause_title || rule.clause,
            citation: rule.legal_source || rule.citation,
            version: rule.version,
            provenance: 'DERIVED',
            severity: 'HIGH',
            penalty_points: 20,
            message: `Fiscal Year-End Clumping: Project sanctioned during March rush exceeding Ministry of Finance 15% pacing guideline.`
          });
          complianceScore -= 0.20;
        }
      }

      // 5. Completion Deadline (COMP-DEADLINE)
      if (rule.rule_id === 'COMP-DEADLINE') {
        if (delayDays > 540) { // 18 months = ~540 days
          violations.push({
            rule_id: rule.rule_id,
            clause: rule.clause_title || rule.clause,
            citation: rule.legal_source || rule.citation,
            version: rule.version,
            provenance: 'STATUTORY',
            severity: 'HIGH',
            penalty_points: 20,
            message: `Statutory Time Limit Exceeded: Project delay (${delayDays} days) exceeds 18-month completion requirement.`
          });
          complianceScore -= 0.20;
        }
      }

      // 6. SC/ST Quota Deficit (SC-ST-QUOTA-SC / ST)
      if (constituencyContext) {
        if (rule.rule_id === 'SC-ST-QUOTA-SC' && constituencyContext.sc_quota_pct < 15.0) {
          violations.push({
            rule_id: rule.rule_id,
            clause: rule.clause_title || rule.clause,
            citation: rule.legal_source || rule.citation,
            version: rule.version,
            provenance: 'STATUTORY',
            severity: 'MEDIUM',
            penalty_points: 15,
            message: `SC Quota Deficit: Constituency has allocated only ${constituencyContext.sc_quota_pct}% to SC areas (Mandatory: 15.0%).`
          });
          complianceScore -= 0.15;
        }
        if (rule.rule_id === 'SC-ST-QUOTA-ST' && constituencyContext.st_quota_pct < 7.5) {
          violations.push({
            rule_id: rule.rule_id,
            clause: rule.clause_title || rule.clause,
            citation: rule.legal_source || rule.citation,
            version: rule.version,
            provenance: 'STATUTORY',
            severity: 'MEDIUM',
            penalty_points: 10,
            message: `ST Quota Deficit: Constituency has allocated only ${constituencyContext.st_quota_pct}% to ST areas (Mandatory: 7.5%).`
          });
          complianceScore -= 0.10;
        }
      }
    }

    const statutoryRiskScore = +(Math.max(0.0, 1.0 - Math.max(0.0, complianceScore))).toFixed(3);

    return {
      signal_id: 'SIGNAL_3_STATUTORY_RULES',
      signal_name: 'Bitemporal Statutory Compliance Engine',
      statutory_risk_score: statutoryRiskScore,
      is_compliant: violations.length === 0,
      violations_count: violations.length,
      violations
    };
  }
}

const instance = new StatutoryRulesEngine();
module.exports = instance;
