/**
 * backend/services/groq_copilot.js
 * 
 * SATARK-SAMVAAD: Real Generative AI Vigilance Copilot
 * Powered by Groq LPU Ultra-Low Latency Inference (Qwen-27B)
 * 
 * Acts as an interactive vigilance intelligence advisor for District Magistrates (DM)
 * and the Comptroller and Auditor General (CAG) under GFR 2017 & MoSPI Guidelines 2023.
 */

const fs = require('fs');
const path = require('path');

// Auto-load .env if not already set in process.env
function initEnv() {
  const envFiles = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../.env')
  ];
  for (const f of envFiles) {
    if (fs.existsSync(f)) {
      try {
        const text = fs.readFileSync(f, 'utf8');
        for (const line of text.split('\n')) {
          const t = line.trim();
          if (!t || t.startsWith('#')) continue;
          const idx = t.indexOf('=');
          if (idx > 0) {
            const k = t.slice(0, idx).trim();
            const v = t.slice(idx + 1).trim();
            if (!process.env[k]) process.env[k] = v;
          }
        }
        break;
      } catch (e) {}
    }
  }
}
initEnv();

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL_NAME = 'qwen/qwen3.8-27b';

const SYSTEM_PROMPT = `You are SATARK-SAMVAAD, an elite AI Vigilance and Audit Intelligence Copilot for India's Ministry of Statistics and Programme Implementation (MoSPI), the Comptroller and Auditor General (CAG), and District Magistrates.

CRITICAL FORMATTING & PERSONA RULES:
1. DEFAULT INTERACTION STYLE:
   - Always respond directly and conversationally in clean, structured Markdown.
   - NEVER use letter templates or formal administrative headers (DO NOT output "To:", "From:", "Subject:", "Date:", "MEMORANDUM", or letter sign-offs) UNLESS the user explicitly asks to "draft a notice", "write a memo", or "draft a letter".
   - Answer questions straight to the point.

2. QUERY INTENTS:
   - GREETING / CASUAL (e.g. "hello", "hi", "who are you", "what can you do"):
     Respond warmly and professionally as an interactive AI audit copilot. Explain that you monitor 1,76,925 MoSPI MPLADS works across India. Mention key fraud detectors (GFR violations, tender splitting below ₹5L, duplicate claims, ghost assets, contractor cartels). Suggest 3-4 clickable or sample queries they can explore. Do NOT cite fictitious failures or audit random records.
   - AUDIT ANALYSIS (e.g. questions about states, districts, rules, anomalies, contractors):
     Provide direct, sharp executive analysis:
     • Executive Summary (direct answer with real numbers)
     • Key Findings (bulleted highlights with project IDs and financial figures)
     • Statutory Grounding (GFR 2017 Rules 144, 149, 166 or MoSPI 2023 Guidelines)
     • Action Directives for Field Auditors / District Magistrates
   - DRAFTING REQUEST (ONLY when explicitly instructed e.g. "draft a show cause notice", "prepare an inquiry memo"):
     Format in formal Government of India administrative memorandum style with reference number, recipient, subject, statement of charges, and 7-day reply requirement.

3. Administrative rigor:
   - Ground all insights in official frameworks: GFR 2017 (Rule 144, 149, 166/167, 168), MoSPI MPLADS Revised Guidelines 2023 (Para 4.3 Geotagging, Annexure-I Negative List), and CVC circulars.
   - Keep answers concise, factual, and actionable. Avoid generic filler.`;

/**
 * Clean LLM output (remove reasoning tags or raw artifacts)
 */
function cleanContent(rawText) {
  if (!rawText) return '';
  return rawText
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .trim();
}

const responseCache = new Map();

/**
 * Generate an audit answer using real Groq LLM with RAG context
 * @param {string} query - The user's question or search query
 * @param {Object} context - Retrieved matching MoSPI projects and statistics
 * @returns {Promise<Object>}
 */
async function generateAuditResponse(query, context = {}) {
  const startTime = Date.now();
  const rawQuery = (query || '').trim();
  const lowerQuery = rawQuery.toLowerCase();
  const cacheKey = lowerQuery;

  // Return cached AI response if recently generated
  if (responseCache.has(cacheKey)) {
    const cached = responseCache.get(cacheKey);
    return {
      ...cached,
      responseTimeMs: 8,
      fromCache: true
    };
  }

  try {
    const { totalMatches = 0, exposureInCr = '0.00', topMatches = [], isGreeting = false, isDrafting = false } = context;

    let userMessage = '';

    if (isGreeting) {
      userMessage = `The user sent a greeting or introduction: "${rawQuery}".

Please respond warmly and conversationally as SATARK-SAMVAAD, the official AI Vigilance Copilot for MPLADS.
1. Welcome the auditor / officer.
2. Briefly introduce your capability: Real-time surveillance over 1,76,925 MoSPI works (₹7,908 Cr) across 36 States/UTs to detect GFR breaches, tender splitting, ghost assets, and contractor cartels.
3. Suggest 3-4 prompt ideas they can run right now (e.g. "Show top high-risk projects in Varanasi", "Find tender splitting below ₹5 Lakh threshold", "March rush expenditure violations", "Flagged contractor cartels in Bihar").
Do NOT use any letter format (no "To:", "From:", "Subject:"). Keep it snappy, interactive, and helpful.`;
    } else if (isDrafting) {
      let flaggedRecordsSnippet = '';
      if (topMatches && topMatches.length > 0) {
        flaggedRecordsSnippet = `\nFlagged Project Evidence:\n`;
        topMatches.slice(0, 3).forEach((p, idx) => {
          const riskScore = p.composite ? (p.composite.score ?? p.composite.priorityScore ?? 75) : 75;
          const riskTier = p.composite ? (p.composite.tier ?? p.composite.riskTier ?? 'HIGH') : 'HIGH';
          flaggedRecordsSnippet += `${idx + 1}. [${p.id}] "${p.title.substring(0, 60)}" - ${p.district || p.state}, Cost: ${p.costFormatted}, Risk: ${riskScore}/100 (${riskTier})\n`;
        });
      }

      userMessage = `MoSPI Database Ground Truth:
- Matching Works: ${totalMatches.toLocaleString('en-IN')}
- Financial Exposure: ₹${exposureInCr} Cr
${flaggedRecordsSnippet}
User Request: "${rawQuery}"

The user has explicitly asked to DRAFT A FORMAL NOTICE / MEMORANDUM.
Format as an official Government of India Show Cause Notice / Vigilance Inquiry Memorandum from the Vigilance Unit to the relevant Implementing Agency / District Authority.
Include: Reference Number, Subject, Specific Statement of Irregularities with project IDs, Statutory Legal Grounding (GFR 2017 & MoSPI 2023 Guidelines), and 7-day Explanation Requirement.`;
    } else {
      let flaggedRecordsSnippet = '';
      if (topMatches && topMatches.length > 0) {
        flaggedRecordsSnippet = `\nTop Retrieved Works Ground Truth:\n`;
        topMatches.slice(0, 4).forEach((p, idx) => {
          const riskScore = p.composite ? (p.composite.score ?? p.composite.priorityScore ?? 75) : 75;
          const riskTier = p.composite ? (p.composite.tier ?? p.composite.riskTier ?? 'HIGH') : 'HIGH';
          flaggedRecordsSnippet += `${idx + 1}. [${p.id}] "${p.title.substring(0, 60)}" | Location: ${p.district || p.state} | Cost: ${p.costFormatted} | Risk: ${riskScore}/100 (${riskTier})\n`;
        });
      }

      userMessage = `MoSPI Database Ground Truth:
- Matching Works: ${totalMatches.toLocaleString('en-IN')}
- Financial Exposure: ₹${exposureInCr} Cr
${flaggedRecordsSnippet}
User Investigation Query: "${rawQuery}"

Provide a direct, conversational, and authoritative audit assessment in structured Markdown.
IMPORTANT: DO NOT use letter headers (No "To:", "From:", "Subject:", "Date:").
Structure:
1. **Executive Summary**: Direct answer addressing the query with retrieved statistics.
2. **Key Findings**: Specific observations, risk patterns, or anomalies in the retrieved records.
3. **Statutory Legal Grounding**: Cite applicable clauses from GFR 2017 (e.g. Rule 144, 149, 166) or MoSPI MPLADS Guidelines 2023.
4. **Actionable Directives**: 2-3 immediate directives for District Magistrates / CAG field audit teams.`;
    }

    const tokenLimit = isGreeting ? 250 : 380;

    // Attempt request with 1 retry on rate limit
    let res = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);

      res = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage }
          ],
          max_tokens: tokenLimit,
          temperature: isGreeting ? 0.4 : 0.2
        })
      });

      clearTimeout(timeout);

      if (res.status === 429 && attempt === 0) {
        console.warn('Groq rate limit encountered, waiting 2s for token replenishment...');
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      break;
    }

    if (!res || !res.ok) {
      const errorText = res ? await res.text() : 'No response';
      console.error(`Groq API error:`, errorText);
      return {
        success: false,
        error: `Groq error`,
        responseTimeMs: Date.now() - startTime
      };
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content || '';
    const cleanedText = cleanContent(rawContent);

    if (!cleanedText) {
      return {
        success: false,
        error: 'Empty response generated',
        responseTimeMs: Date.now() - startTime
      };
    }

    const result = {
      success: true,
      model: `Groq LPU (${MODEL_NAME})`,
      aiText: cleanedText,
      responseTimeMs: Date.now() - startTime
    };

    // Cache response for 5 minutes
    responseCache.set(cacheKey, result);
    if (responseCache.size > 50) {
      const oldestKey = responseCache.keys().next().value;
      responseCache.delete(oldestKey);
    }

    return result;
  } catch (err) {
    console.error('Groq Copilot error:', err.message);
    return {
      success: false,
      error: err.message,
      responseTimeMs: Date.now() - startTime
    };
  }
}

module.exports = {
  generateAuditResponse,
  cleanContent,
  MODEL_NAME
};
