/**
 * MPLADS-SATARK: Signal 4 (6D) — Cross-Scheme Block-Level Deduplication Engine
 * Probabilistic entity resolution matching MPLADS works against ISRO Bhuvan / MGNREGA
 * rural asset registries in the same State/District/Block.
 * 
 * Catches double-invoicing: funding the same rural road, water tank, or community hall
 * under both MPLADS and MGNREGA / PMGSY.
 */

const fs = require('fs');
const path = require('path');

class CrossSchemeDeduplicationEngine {
  constructor() {
    this.bhuvanAssets = [];
    this.byState = new Map();
    this.isLoaded = false;
  }

  loadAssets() {
    if (this.isLoaded) return;
    try {
      const p = path.join(__dirname, '..', 'data', 'bhuvan', 'bhuvan_mgnrega_assets.json');
      if (fs.existsSync(p)) {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        this.bhuvanAssets = data.assets || [];

        for (const asset of this.bhuvanAssets) {
          const st = (asset.state || '').toUpperCase();
          if (!this.byState.has(st)) this.byState.set(st, []);
          this.byState.get(st).push(asset);
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not load Bhuvan assets:', e.message);
    }
    this.isLoaded = true;
  }

  tokenize(text) {
    if (!text) return new Set();
    const stopWords = new Set(['of', 'the', 'and', 'or', 'in', 'at', 'to', 'for', 'with', 'without', 'any', 'other', 'from', 'system', 'work', 'works', 'construction']);
    return new Set(
      text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w))
    );
  }

  jaccardSimilarity(setA, setB) {
    if (setA.size === 0 || setB.size === 0) return 0;
    let intersection = 0;
    for (const item of setA) {
      if (setB.has(item)) intersection++;
    }
    const union = setA.size + setB.size - intersection;
    return union > 0 ? intersection / union : 0;
  }

  evaluateProject(project) {
    this.loadAssets();
    const stateKey = (project.state || '').toUpperCase();
    const districtKey = (project.district || '').toUpperCase();
    const projectTitle = project.project_title || '';
    const projectTokens = this.tokenize(projectTitle);

    // Candidates blocked by state
    const candidates = this.byState.get(stateKey) || this.bhuvanAssets;

    let bestMatch = null;
    let highestSim = 0.0;

    for (const asset of candidates) {
      const assetTokens = this.tokenize(asset.asset_title);
      let textSim = this.jaccardSimilarity(projectTokens, assetTokens);

      // District match boost
      const assetDist = (asset.district || '').toUpperCase();
      if (assetDist && (districtKey.includes(assetDist) || assetDist.includes(districtKey))) {
        textSim += 0.25;
      }

      if (textSim > highestSim) {
        highestSim = textSim;
        bestMatch = asset;
      }
    }

    // Likelihood percentage (clamped 0 to 95%)
    const likelihoodPct = Math.min(95, Math.round(highestSim * 100));
    const isDuplicateRisk = likelihoodPct >= 50;

    let explanation = 'No significant cross-scheme asset duplication detected in block registry.';
    if (isDuplicateRisk && bestMatch) {
      explanation = `Potential Cross-Scheme Double Invoicing: Found matching ${bestMatch.scheme} asset '${bestMatch.asset_title}' in ${bestMatch.district || stateKey} (${bestMatch.asset_code}) with ${likelihoodPct}% structural alignment.`;
    }

    return {
      signal_id: 'SIGNAL_4_DEDUPLICATION',
      signal_name: 'Cross-Scheme Block-Level Asset Deduplication',
      duplicate_likelihood_pct: likelihoodPct,
      is_duplicate_risk: isDuplicateRisk,
      matched_asset: isDuplicateRisk && bestMatch ? {
        asset_code: bestMatch.asset_code,
        scheme: bestMatch.scheme,
        asset_title: bestMatch.asset_title,
        gram_panchayat: bestMatch.gram_panchayat,
        block: bestMatch.block,
        district: bestMatch.district,
        state: bestMatch.state,
        expenditure_inr: bestMatch.expenditure_inr,
        coordinates: { lat: bestMatch.latitude, lon: bestMatch.longitude }
      } : null,
      explanation
    };
  }
}

const instance = new CrossSchemeDeduplicationEngine();
module.exports = instance;
