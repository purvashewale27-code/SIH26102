/**
 * backend/ml/predictive_sentry.js
 * 
 * PREDICTIVE RISK & DELAY CLASSIFIER (SIH 2026 Core Component)
 * Forecasts completion delay probability (%), cost overrun risk (%), and estimated delay months
 * BEFORE sanction approval or fund release.
 */

// Regional Terrain Cost & Logistics Multipliers (State-Wise PWD SoR Normalization)
const REGIONAL_TERRAIN_MULTIPLIERS = {
  'Assam': 1.45,
  'Meghalaya': 1.50,
  'Arunachal Pradesh': 1.55,
  'Nagaland': 1.50,
  'Manipur': 1.50,
  'Mizoram': 1.50,
  'Tripura': 1.40,
  'Sikkim': 1.50,
  'Himachal Pradesh': 1.40,
  'Uttarakhand': 1.40,
  'Jammu and Kashmir': 1.45,
  'Ladakh': 1.60,
  'Jharkhand': 1.20,
  'Chhattisgarh': 1.20,
  'Odisha': 1.15,
  'Bihar': 1.10,
  'Uttar Pradesh': 1.00,
  'Maharashtra': 1.00,
  'West Bengal': 1.05,
  'Tamil Nadu': 1.00,
  'Karnataka': 1.00,
  'Gujarat': 1.00,
  'Madhya Pradesh': 1.05,
  'Rajasthan': 1.10,
  'Kerala': 1.10,
  'Andhra Pradesh': 1.00,
  'Telangana': 1.00,
  'Punjab': 1.00,
  'Haryana': 1.00,
  'Delhi': 1.00
};

function getRegionalMultiplier(stateName) {
  if (!stateName) return 1.0;
  const key = Object.keys(REGIONAL_TERRAIN_MULTIPLIERS).find(k => k.toLowerCase() === stateName.toLowerCase());
  return key ? REGIONAL_TERRAIN_MULTIPLIERS[key] : 1.0;
}

function predictProjectRisk(p) {
  let delayScore = 15; // Baseline risk
  const factors = [];
  
  // 1. Sanction Month (March Rush Effect on Delay)
  const sanctionDate = p.date ? new Date(p.date) : new Date('2024-03-25');
  const month = sanctionDate.getMonth() + 1; // 1-12
  if (month === 3) {
    delayScore += 25;
    factors.push('Fiscal Year-End March Rush Sanction (Historical 3.2x delay rate)');
  }

  // 2. Cost Complexity Scaling
  const cost = Number(p.cost) || 500000;
  if (cost > 4000000) {
    delayScore += 20;
    factors.push('High-Value Civil Outlay (>₹40 Lakhs) requiring multi-stage MB verification');
  } else if (cost >= 490000 && cost <= 499999) {
    delayScore += 15;
    factors.push('Sub-₹5L E-Tender Avoidance (Smurfing pattern increases execution friction)');
  }

  // 3. Category Complexity & Historical Lead Times
  const cat = (p.category || p.title || '').toLowerCase();
  let baseMonths = 6;
  if (cat.includes('road') || cat.includes('pcc') || cat.includes('bridge')) {
    baseMonths = 12;
    delayScore += 15;
    factors.push('Linear Right-of-Way & Weather Sensitivity (Roads/Bridges)');
  } else if (cat.includes('hall') || cat.includes('building') || cat.includes('school')) {
    baseMonths = 9;
    delayScore += 10;
    factors.push('Structural Construction & CPWD Quality Inspection Timeline');
  } else if (cat.includes('water') || cat.includes('pipe') || cat.includes('borewell')) {
    baseMonths = 4;
  }

  // 4. Regional Terrain Adjustment Factor
  const stateMultiplier = getRegionalMultiplier(p.state);
  if (stateMultiplier > 1.25) {
    delayScore += 15;
    factors.push(`Hilly/North-East Logistics Adjustment (+${Math.round((stateMultiplier - 1) * 100)}% Lead Time)`);
  }

  // 5. Vendor Concentration Impact
  if (p.chakra && p.chakra.hasCartelRisk) {
    delayScore += 15;
    factors.push('High Vendor Over-Allocation (Contractor capacity bottleneck)');
  }

  delayScore = Math.min(98, Math.max(10, delayScore));
  const overrunProb = Math.min(95, Math.round(delayScore * 0.92));
  const predictedDelayMonths = Math.round(baseMonths * (1 + (delayScore / 100)));

  return {
    delayProbability: overrunProb,
    predictedDelayScore: delayScore,
    estimatedCompletionMonths: predictedDelayMonths,
    expectedDelayDays: Math.round((predictedDelayMonths - baseMonths) * 30),
    regionalTerrainMultiplier: stateMultiplier,
    keyRiskDrivers: factors
  };
}

module.exports = {
  predictProjectRisk,
  getRegionalMultiplier,
  REGIONAL_TERRAIN_MULTIPLIERS
};
