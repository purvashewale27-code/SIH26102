/**
 * frontend/i18n.js
 * 
 * MPLADS-SATARK Autonomous 100% Bilingual (English & हिन्दी) Sovereign Engine
 * Enterprise-grade full-site localization for Smart India Hackathon 2026:
 * - 100% Comprehensive Coverage (Hero, Sticky Nav, 7 Sentinels, Modules 08-10, Tables, All 746 MPs, Modals)
 * - Strict Word Boundary Regex Construction () Preventing Substring Glitches (Benchmark, Market, Maremma)
 * - Bi-directional Devanagari Numerals (0-9 <-> ०-९) & Indian Financial Units (Cr -> करोड़, Lakh -> लाख, pts -> अंक)
 * - District & IDA Cleaner (Removes _IDA and translates administrative roles)
 * - Indic Phonetic Fallback Transliteration for Any Unmapped Project Words
 * - Reversible English Caching via node._originalEnText
 * - Dynamic MutationObserver Translating Dynamic MoSPI Rows and Popups
 */

(function() {
  'use strict';

  // ==========================================================
  // 1. DEVANAGARI NUMERAL CONVERTERS
  // ==========================================================
  const EN_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const HI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

  function toDevanagariNumerals(str) {
    if (typeof str !== 'string') str = String(str || '');
    let res = str;
    for (let i = 0; i < 10; i++) {
      res = res.replaceAll(EN_DIGITS[i], HI_DIGITS[i]);
    }
    // Units and Abbreviations
    res = res.replace(/\bCr\b/gi, 'करोड़')
             .replace(/\bCrore\b/gi, 'करोड़')
             .replace(/\bCrores\b/gi, 'करोड़')
             .replace(/\bLakh\b/gi, 'लाख')
             .replace(/\bLakhs\b/gi, 'लाख')
             .replace(/\bpts\b/gi, 'अंक')
             .replace(/\bpoints\b/gi, 'अंक');
    return res;
  }

  function toEnglishNumerals(str) {
    if (typeof str !== 'string') str = String(str || '');
    let res = str;
    for (let i = 0; i < 10; i++) {
      res = res.replaceAll(HI_DIGITS[i], EN_DIGITS[i]);
    }
    res = res.replace(/करोड़/g, 'Cr')
             .replace(/लाख/g, 'Lakh')
             .replace(/अंक/g, 'pts');
    return res;
  }

  function escapeRegex(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  // ==========================================================
  // 2. INDIC PHONETIC TRANSLITERATOR (FALLBACK FOR HAMLETS & PROPER NOUNS)
  // ==========================================================
  const CONSONANTS = [
    ['ksh', 'क्ष'], ['gy', 'ज्ञ'], ['tr', 'त्र'],
    ['chh', 'छ'], ['ch', 'च'], ['kh', 'ख'], ['gh', 'घ'],
    ['jh', 'झ'], ['th', 'थ'], ['dh', 'ध'], ['ph', 'फ'],
    ['bh', 'भ'], ['sh', 'श'], ['shh', 'ष'],
    ['k', 'क'], ['c', 'क'], ['g', 'ग'], ['j', 'ज'], ['t', 'ट'], ['d', 'ड'],
    ['n', 'न'], ['p', 'प'], ['b', 'ब'], ['m', 'म'], ['y', 'य'],
    ['r', 'र'], ['l', 'ल'], ['v', 'व'], ['w', 'व'], ['s', 'स'],
    ['h', 'ह'], ['z', 'ज़'], ['f', 'फ़'], ['q', 'क़']
  ];

  const IND_VOWELS = [
    ['aa', 'आ'], ['ee', 'ई'], ['oo', 'ऊ'], ['ai', 'ऐ'], ['au', 'औ'],
    ['a', 'अ'], ['i', 'इ'], ['u', 'उ'], ['e', 'ए'], ['o', 'ओ']
  ];

  const MATRAS = [
    ['aa', 'ा'], ['ee', 'ी'], ['oo', 'ू'], ['ai', 'ै'], ['au', 'ौ'],
    ['a', ''], ['i', 'ि'], ['u', 'ु'], ['e', 'े'], ['o', 'ो']
  ];

  function transliterateWord(word) {
    if (!word) return '';
    // Single letter initials (e.g. S, K, A, B, etc.)
    if (/^[A-Z]\.?$/.test(word)) {
      const letterMap = {
        'A': 'ए.', 'B': 'बी.', 'C': 'सी.', 'D': 'डी.', 'E': 'ई.',
        'F': 'एफ.', 'G': 'जी.', 'H': 'एच.', 'I': 'आई.', 'J': 'जे.',
        'K': 'के.', 'L': 'एल.', 'M': 'एम.', 'N': 'एन.', 'O': 'ओ.',
        'P': 'पी.', 'Q': 'क्यू.', 'R': 'आर.', 'S': 'एस.', 'T': 'टी.',
        'U': 'यू.', 'V': 'वी.', 'W': 'डब्ल्यू.', 'X': 'एक्स.', 'Y': 'वाई.', 'Z': 'जेड.'
      };
      return letterMap[word.replace('.', '').toUpperCase()] || word;
    }

    let str = word.toLowerCase();
    let result = '';
    let i = 0;

    while (i < str.length) {
      let matchedConsonant = null;
      let consLen = 0;
      for (let c = 0; c < CONSONANTS.length; c++) {
        const [cStr, cDev] = CONSONANTS[c];
        if (str.startsWith(cStr, i)) {
          matchedConsonant = cDev;
          consLen = cStr.length;
          break;
        }
      }

      if (matchedConsonant) {
        result += matchedConsonant;
        i += consLen;

        let matchedMatra = null;
        let matraLen = 0;
        for (let m = 0; m < MATRAS.length; m++) {
          const [mStr, mDev] = MATRAS[m];
          if (str.startsWith(mStr, i)) {
            matchedMatra = mDev;
            matraLen = mStr.length;
            break;
          }
        }

        if (matchedMatra !== null) {
          result += matchedMatra;
          i += matraLen;
        } else {
          if (i < str.length && /[a-z]/i.test(str[i])) {
            const nextIsVowel = /^[aeiou]/i.test(str.slice(i));
            if (!nextIsVowel) {
              result += '्';
            }
          }
        }
      } else {
        let matchedIndVowel = null;
        let vowelLen = 0;
        for (let v = 0; v < IND_VOWELS.length; v++) {
          const [vStr, vDev] = IND_VOWELS[v];
          if (str.startsWith(vStr, i)) {
            matchedIndVowel = vDev;
            vowelLen = vStr.length;
            break;
          }
        }

        if (matchedIndVowel) {
          result += matchedIndVowel;
          i += vowelLen;
        } else {
          result += str[i];
          i++;
        }
      }
    }

    return result;
  }

  function transliterateRemainingEnglish(text) {
    if (!text || !/[a-zA-Z]/.test(text)) return text;
    return text.replace(/[a-zA-Z]+/g, (token) => {
      // Don't transliterate if it's already Devanagari
      return transliterateWord(token);
    });
  }

  // ==========================================================
  // 3. MASTER DICTIONARY
  // ==========================================================
  const DICTIONARY = {
  "NATIONAL PUBLIC FUND FORENSIC PIPELINE · MOSPI · SOVEREIGN OVERSIGHT": "राष्ट्रीय सार्वजनिक निधि फोरेंसिक पाइपलाइन · सांख्यिकी मंत्रालय · संप्रभु सतर्कता",
  "NATIONAL PUBLIC FUND FORENSIC PIPELINE": "राष्ट्रीय सार्वजनिक निधि फोरेंसिक पाइपलाइन",
  "SOVEREIGN OVERSIGHT": "संप्रभु सतर्कता एवं निरीक्षण",
  "भारत सरकार · भारत सरकार": "भारत सरकार",
  "भारत सरकार - भारत सरकार": "भारत सरकार",
  "भारत सरकार &middot; भारत सरकार": "भारत सरकार",
  "भारत सरकार · GOVERNMENT OF INDIA": "भारत सरकार",
  "भारत सरकार &middot; GOVERNMENT OF INDIA": "भारत सरकार",
  "GOVERNMENT OF INDIA · MINISTRY OF STATISTICS & PROGRAMME IMPLEMENTATION": "भारत सरकार · सांख्यिकी एवं कार्यक्रम कार्यान्वयन मंत्रालय",
  "GOVERNMENT OF INDIA": "भारत सरकार",
  "Government of India": "भारत सरकार",
  "MINISTRY OF STATISTICS & PROGRAMME IMPLEMENTATION (MOSPI)": "सांख्यिकी एवं कार्यक्रम कार्यान्वयन मंत्रालय (सांख्यिकी मंत्रालय)",
  "Ministry of Statistics & Programme Implementation (MoSPI)": "सांख्यिकी एवं कार्यक्रम कार्यान्वयन मंत्रालय (सांख्यिकी मंत्रालय)",
  "Ministry of Statistics & Programme Implementation": "सांख्यिकी एवं कार्यक्रम कार्यान्वयन मंत्रालय",
  "Ministry of Statistics and Programme Implementation": "सांख्यिकी एवं कार्यक्रम कार्यान्वयन मंत्रालय",
  "MINISTRY OF STATISTICS AND PROGRAMME IMPLEMENTATION": "सांख्यिकी एवं कार्यक्रम कार्यान्वयन मंत्रालय",
  "Autonomous Public Fund Forensic Decision Intelligence": "स्वायत्त सार्वजनिक निधि फोरेंसिक निर्णय आसूचना प्रणाली",
  "National Decision Intelligence for India's Public Funds": "भारत की सार्वजनिक निधि हेतु राष्ट्रीय निर्णय आसूचना",
  "MPLADS-SATARK transforms national public fund monitoring from retrospective descriptive auditing into predictive, risk-aware decision intelligence for sovereign policymakers, district collectors, and citizens.": "एमपीलैड्स-सतर्क संप्रभु नीति निर्माताओं, जिलाधिकारियों एवं नागरिकों हेतु सार्वजनिक निधि निगरानी को पश्चगामी ऑडिटिंग से भविष्यसूचक, जोखिम-सचेत निर्णय आसूचना में रूपांतरित करता है।",
  "ENTER FORENSIC COMMAND HUB": "फोरेंसिक कमांड हब में प्रवेश करें",
  "Explore 13 Sentinels": "१३ प्रहरियों का अन्वेषण करें",
  "Explore 7 Sentinels": "७ प्रहरियों का अन्वेषण करें",
  "MONITORED WORKS": "निगरानीधीन कार्य",
  "AUDITED DISBURSAL PORTFOLIO": "संपरीक्षित संवितरण पोर्टफोलियो",
  "STATES & UNION TERRITORIES": "राज्य एवं केंद्र शासित प्रदेश",
  "VIGILANCE ENGINES & PLATFORMS": "सतर्कता इंजन एवं प्लेटफॉर्म",
  "Search Works": "कार्य खोजें",
  "Proposal Simulator": "प्रस्ताव सिमुलेटर",
  "Data Lineage & Ledger": "डेटा वंशावली एवं लेजर",
  "भाषा / Language:": "भाषा / Language:",
  "Language": "भाषा",
  "English": "English",
  "हिन्दी": "हिन्दी",
  "National Overview": "राष्ट्रीय अवलोकन",
  "Forensic Engines": "फोरेंसिक इंजन",
  "7 Autonomous Sentinel AI Engines": "७ स्वायत्त प्रहरी एआई इंजन",
  "MoSPI Audited": "सांख्यिकी मंत्रालय संपरीक्षित",
  "Explainable AI": "व्याख्या योग्य एआई (XAI)",
  "Proposal Sandbox": "प्रस्ताव सैंडबॉक्स",
  "Trends & Velocity": "प्रवृत्तियां एवं व्यय गति",
  "Work Explorer": "कार्य अन्वेषक",
  "Audit Copilot": "सतर्क-संवाद (कोपायलट)",
  "SATARK-SAMVAAD (सतर्क-संवाद)": "सतर्क-संवाद (एआई ऑडिट कोपायलट)",
  "SATARK-SAMVAAD (Copilot)": "सतर्क-संवाद (कोपायलट)",
  "Executive Action": "सतर्क-कार्या (कार्रवाई)",
  "SATARK-KARYAA (सतर्क-कार्या)": "सतर्क-कार्या (कार्यकारी कार्रवाई)",
  "Parliamentary Q&A": "संसदीय प्रश्न ऑडिट",
  "PRASHNA-KAVACH (प्रश्न-कवच)": "प्रश्न-कवच (संसदीय प्रश्न ऑडिट)",
  "Predictive Sentry": "भविष्य-रेखा (पूर्वानुमान)",
  "BHAVISHYA-REKHA (भविष्य-रेखा)": "भविष्य-रेखा (विलंब एवं जोखिम मॉडल)",
  "SIH Presentation": "एस.आई.एच. प्रस्तुति",
  "SIH Presentation Guide": "एस.आई.एच. प्रस्तुति गाइड",
  "Master Guide": "मुख्य मार्गदर्शिका",
  "S-01": "एस-०१",
  "S-02": "एस-०२",
  "S-03": "एस-०३",
  "S-04": "एस-०४",
  "S-05": "एस-०५",
  "S-06": "एस-०६",
  "S-07": "एस-०७",
  "VIDHI-KAVACH (विधि-कवच)": "विधि-कवच (सांविधिक अनुपालन एवं निषेध सूची)",
  "Statutory Compliance & Negative List": "सांविधिक अनुपालन एवं निषेध सूची",
  "PUNAR-DRISHTI (पुनर्दृष्टि)": "पुनर्दृष्टि (दोहरे दावे एवं क्लोन कार्य)",
  "NLP Duplicate Claims & Twin Works": "एनएलपी दोहरे दावे एवं क्लोन कार्य",
  "ARTHA-DARPAN (अर्थ-दर्पण)": "अर्थ-दर्पण (लागत मानक एवं मूल्य वृद्धि)",
  "CPWD Rate Benchmark & Cost Inflation": "सीपीडब्ल्यूडी दर मानक एवं मूल्य वृद्धि",
  "CHAKRA-VYUH (चक्रव्यूह)": "चक्रव्यूह (ठेकेदार सिंडिकेट एवं साठगांठ)",
  "Contractor Cartel & Vendor Nexus": "ठेकेदार सिंडिकेट एवं विक्रेता साठगांठ",
  "VIBHED-NETRA (विभेद-नेत्र)": "विभेद-नेत्र (१२-आयामी विसंगति संसूचक)",
  "12D Isolation Forest Outlier Sentry": "१२-आयामी आइसोलेशन फॉरेस्ट विसंगति प्रहरी",
  "12-D Isolation Forest Outlier": "१२-आयामी आइसोलेशन फॉरेस्ट विसंगति प्रहरी",
  "SANKHYA-SATYA (संख्या-सत्य)": "संख्या-सत्य (बेनफोर्ड गणित एवं निविदा विभाजन)",
  "Benford Digit Law & Tender Splitting": "बेनफोर्ड अंक नियम एवं निविदा विभाजन",
  "BHU-DRISHTI (भू-दृष्टि)": "भू-दृष्टि (उपग्रह एवं भू-स्थानिक ऑडिट)",
  "Geospatial GIS & Satellite Asset Verification": "भू-स्थानिक जीआईएस एवं उपग्रह परिसंपत्ति सत्यापन",
  "SENTINEL S-01: VIDHI-KAVACH (विधि-कवच — STATUTORY POLICY SHIELD)": "प्रहरी एस-०१: विधि-कवच (सांविधिक नीति ढाल)",
  "SENTINEL S-01: VIDHI-KAVACH (विधि-कवच — Statutory Policy Shield)": "प्रहरी एस-०१: विधि-कवच (सांविधिक नीति ढाल)",
  "SENTINEL S-01: VIDHI-KAVACH (विधि-कवच — सांविधिक नीति ढाल)": "प्रहरी एस-०१: विधि-कवच (सांविधिक नीति ढाल)",
  "STATUTORY POLICY SHIELD": "सांविधिक नीति ढाल",
  "Statutory Policy Shield": "सांविधिक नीति ढाल",
  "Statutory Rule Compliance & Negative List Sentry": "सांविधिक नियम अनुपालन एवं निषेध सूची प्रहरी",
  "Annexure-I Negative List & GFR 62 March Rush Sentry": "अनुलग्नक-१ निषेध सूची एवं जीएफआर ६२ मार्च रश प्रहरी",
  "Auditing 176,925 works strictly against MoSPI MPLADS Guidelines 2023 Statutory Rules": "सांख्यिकी मंत्रालय एमपीलैड्स दिशानिर्देश २०२३ के सांविधिक नियमों के विरुद्ध १,७६,९२५ कार्यों की सख्त जांच",
  "Auditing 176,925 works strictly against MoSPI MPLADS Guidelines 2023 (Annexure-I Prohibited Works) & GFR Rule 62": "सांख्यिकी मंत्रालय एमपीलैड्स दिशानिर्देश २०२३ (अनुलग्नक-१ निषिद्ध कार्य) एवं जीएफआर नियम ६२ के अनुसार १,७६,९२५ कार्यों की सख्त जांच",
  "VIDHI-KAVACH (विधि-कवच) Live in Action": "विधि-कवच (सांविधिक नीति ढाल) सक्रिय निरीक्षण",
  "Statutory Breaches Flagged": "चिह्नित सांविधिक उल्लंघन",
  "Total Real Government Works": "कुल वास्तविक सरकारी कार्य",
  "Total Works Audited": "कुल संपरीक्षित कार्य",
  "WORKS AUDITED": "संपरीक्षित कार्य",
  "Works Audited": "संपरीक्षित कार्य",
  "100% Nationwide MoSPI eSAKSHI Data": "१००% राष्ट्रव्यापी सांख्यिकी मंत्रालय ई-साक्षी डेटा",
  "Nationwide MoSPI eSAKSHI Data": "राष्ट्रव्यापी सांख्यिकी मंत्रालय ई-साक्षी डेटा",
  "100% Compliant Works": "१००% सांविधिक अनुपालित कार्य",
  "STATUTORILY COMPLIANT": "सांविधिक रूप से अनुपालित",
  "Statutorily Compliant": "सांविधिक रूप से अनुपालित",
  "Zero statutory breaches detected": "शून्य सांविधिक उल्लंघन संसूचित",
  "Zero statutory violations detected": "शून्य सांविधिक उल्लंघन संसूचित",
  "NEGATIVE LIST BREACHES": "निषेध सूची उल्लंघन",
  "Negative List Breaches": "निषेध सूची उल्लंघन",
  "Negative List Violations": "निषेध सूची उल्लंघन",
  "Places of worship & commercial trusts": "पूजा स्थल एवं व्यावसायिक न्यास",
  "Places of worship & religious structures": "पूजा स्थल एवं धार्मिक संरचनाएं",
  "Prohibited places of worship & commercial trusts": "निषिद्ध पूजा स्थल एवं व्यावसायिक न्यास",
  "MARCH RUSH VIOLATIONS": "मार्च रश नियम उल्लंघन",
  "March Rush Violations": "मार्च रश नियम उल्लंघन",
  "March Rush (GFR 62)": "मार्च रश (जीएफआर ६२)",
  "March Rush (GFR ६२)": "मार्च रश (जीएफआर ६२)",
  "Sanctioned in final 10 days of March (GFR 62)": "मार्च के अंतिम १० दिनों में स्वीकृत (जीएफआर ६२)",
  "All Statutory Red Flags": "सभी सांविधिक रेड फ्लैग",
  "Statutorily Compliant Works": "सांविधिक रूप से अनुपालित कार्य",
  "All 176,925 Works": "सभी १,७६,९२५ कार्य",
  "SENTINEL S-02: PUNAR-DRISHTI (पुनर्दृष्टि — NLP DUPLICATE SENTRY)": "प्रहरी एस-०२: पुनर्दृष्टि (एनएलपी डुप्लिकेट प्रहरी)",
  "SENTINEL S-02: PUNAR-DRISHTI (पुनर्दृष्टि — NLP Duplicate Sentry)": "प्रहरी एस-०२: पुनर्दृष्टि (एनएलपी डुप्लिकेट प्रहरी)",
  "SENTINEL S-02: PUNAR-DRISHTI (पुनर्द्दष्टि — NLP DUPLICATE SENTRY)": "प्रहरी एस-०२: पुनर्दृष्टि (एनएलपी डुप्लिकेट प्रहरी)",
  "SENTINEL एस-०२: PUNAR-DRISHTI (पुनर्द्दष्टि — NLP DUPLICATE SENTRY)": "प्रहरी एस-०२: पुनर्दृष्टि (एनएलपी डुप्लिकेट प्रहरी)",
  "SENTINEL एस-०२: PUNAR-DRISHTI (पुनर्दृष्टि — NLP DUPLICATE SENTRY)": "प्रहरी एस-०२: पुनर्दृष्टि (एनएलपी डुप्लिकेट प्रहरी)",
  "प्रहरी एस-०२: पुनर्द्दष्टि (एनएलपी डुप्लिकेट प्रहरी)": "प्रहरी एस-०२: पुनर्दृष्टि (एनएलपी डुप्लिकेट प्रहरी)",
  "NLP DUPLICATE SENTRY": "एनएलपी डुप्लिकेट प्रहरी",
  "NLP Duplicate Sentry": "एनएलपी डुप्लिकेट प्रहरी",
  "NLP": "एनएलपी",
  "DUPLICATE SENTRY": "डुप्लिकेट प्रहरी",
  "Duplicate Sentry": "डुप्लिकेट प्रहरी",
  "Cr": "करोड़",
  "Cr.": "करोड़",
  "Crore": "करोड़",
  "Crores": "करोड़",
  "Lakh": "लाख",
  "Lakhs": "लाख",
  "Cross-Work Lexical NLP Twin Work & Double-Billing Sentry": "क्रॉस-कार्य शाब्दिक एनएलपी क्लोन कार्य एवं दोहरा-बिलिंग प्रहरी",
  "Vaibhav's TF-IDF & Cosine Similarity Engine identifying identical work descriptions and duplicate billing claims across India": "वैभव का टीएफ-आईडीएफ एवं कोसाइन समानता इंजन - संपूर्ण भारत में एक समान कार्य विवरणों और दोहरे बिलिंग दावों की पहचान",
  "Vaibhav's TF-IDF & Cosine Similarity Engine identifying identical कार्य का विवरणs and duplicate billing claims across India": "वैभव का टीएफ-आईडीएफ एवं कोसाइन समानता इंजन - संपूर्ण भारत में एक समान कार्य विवरणों और दोहरे बिलिंग दावों की पहचान",
  "Vaibhav's TF-IDF & Cosine Similarity Engine detecting duplicate project claims across India": "वैभव का टीएफ-आईडीएफ एवं कोसाइन समानता इंजन - संपूर्ण भारत में दोहरे परियोजना दावों की पहचान",
  "Duplicate Claims (6,965 Clones)": "दोहरे दावे (६,९६५ क्लोन)",
  "Duplicate Claims (६,९६५ Clones)": "दोहरे दावे (६,९६५ क्लोन)",
  "TOTAL WORKS SCANNED": "कुल संपरीक्षित कार्य",
  "Total Works Scanned": "कुल संपरीक्षित कार्य",
  "Across all 36 States & UTs": "सभी ३६ राज्य एवं केंद्र शासित प्रदेश",
  "DUPLICATE CLAIMS FLAGGED": "चिह्नित दोहरे दावे",
  "Duplicate Claims Flagged": "चिह्नित दोहरे दावे",
  "Cross-work twin assets in district": "जिले में दोहरी संपत्ति",
  "100% EXACT CLONES": "१००% हूबहू क्लोन",
  "100% Exact Clones": "१००% हूबहू क्लोन",
  "Identical work descriptions in district": "जिले में एक समान कार्य विवरण",
  "Identical कार्य का विवरणs in district": "जिले में एक समान कार्य विवरण",
  "NEAR-CLONES (85%–99%)": "निकट-क्लोन कार्य (८५%-९९%)",
  "NEAR-CLONES (८५%-९९%)": "निकट-क्लोन कार्य (८५%-९९%)",
  "Near-Clones (85%–99%)": "निकट-क्लोन (८५%-९९%)",
  "Near-Clones (८५%-९९%)": "निकट-क्लोन कार्य (८५%-९९%)",
  "Slight variations in title phrasing": "शीर्षक में मामूली भिन्नता",
  "All Duplicate Claims": "सभी दोहरे दावे",
  "100% Exact Title Clones": "१००% हूबहू शीर्षक क्लोन",
  "All 176,925 Scanned Works": "सभी १,७६,९२५ संपरीक्षित कार्य",
  "All १७६,९२५ Scanned Works": "सभी १,७६,९२५ संपरीक्षित कार्य",
  "PUNAR-DRISHTI (पुनर्दृष्टि) Live in Action": "पुनर्दृष्टि (दोहरे दावे एवं क्लोन कार्य) सक्रिय निरीक्षण",
  "Duplicate Sentry Analysis (PUNAR-DRISHTI)": "दोहरा कार्य प्रहरी विश्लेषण (पुनर्दृष्टि)",
  "(PUNAR-DRISHTI)": "(पुनर्दृष्टि)",
  "SENTINEL S-03: ARTHA-DARPAN (अर्थ-दर्पण — CPWD COST BENCHMARK)": "प्रहरी एस-०३: अर्थ-दर्पण (सीपीडब्ल्यूडी लागत मानक)",
  "SENTINEL S-03: ARTHA-DARPAN (अर्थ-दर्पण — COST INTEGRITY SENTRY)": "प्रहरी एस-०३: अर्थ-दर्पण (लागत सत्यनिष्ठा प्रहरी)",
  "SENTINEL S-03: ARTHA-DARPAN (अर्थ-दर्पण — AI Cost Benchmark & Overpricing Sentry)": "प्रहरी एस-०३: अर्थ-दर्पण (एआई लागत मानक एवं अधिमूल्यन प्रहरी)",
  "SENTINEL S-03: ARTHA-DARPAN (अर्थ-दर्पण — AI COST BENCHMARK & OVERPRICING SENTRY)": "प्रहरी एस-०३: अर्थ-दर्पण (एआई लागत मानक एवं अधिमूल्यन प्रहरी)",
  "SENTINEL एस-०३: ARTHA-DARPAN (अर्थ-दर्पण — COST INTEGRITY SENTRY)": "प्रहरी एस-०३: अर्थ-दर्पण (लागत सत्यनिष्ठा प्रहरी)",
  "SENTINEL एस-०३: ARTHA-DARPAN (अर्थ-दर्पण — AI COST BENCHMARK & OVERPRICING SENTRY)": "प्रहरी एस-०३: अर्थ-दर्पण (एआई लागत मानक एवं अधिमूल्यन प्रहरी)",
  "SENTINEL एस-०३: ARTHA-DARPAN (अर्थ-दर्पण — AI COST BENCHमार्चK & OVERPRICING SENTRY)": "प्रहरी एस-०३: अर्थ-दर्पण (एआई लागत मानक एवं अधिमूल्यन प्रहरी)",
  "CPWD Schedule of Rates Benchmark & Cost Inflation Sentry": "सीपीडब्ल्यूडी दर अनुसूची (डीएसआर) मानक एवं लागत मुद्रास्फीति प्रहरी",
  "CPWD Schedule / Rates Benchmark & Cost Inflation Sentry": "सीपीडब्ल्यूडी दर अनुसूची (डीएसआर) मानक एवं लागत मुद्रास्फीति प्रहरी",
  "CPWD Schedule / Rates Benchमार्चk & Cost Inflation Sentry": "सीपीडब्ल्यूडी दर अनुसूची (डीएसआर) मानक एवं लागत मुद्रास्फीति प्रहरी",
  "CPWD Schedule of Rates (DSR) & Statistical Peer-Group Benchmark Analyzer": "सीपीडब्ल्यूडी दर अनुसूची (डीएसआर) एवं सांख्यिकीय समकक्ष-समूह मानक विश्लेषक",
  "CPWD Schedule / Rates (DSR) & Statistical Peer-Group Benchmark Analyzer": "सीपीडब्ल्यूडी दर अनुसूची (डीएसआर) एवं सांख्यिकीय समकक्ष-समूह मानक विश्लेषक",
  "CPWD Schedule / Rates (DSR) & Statistical Peer-Group Benchमार्चk Analyzer": "सीपीडब्ल्यूडी दर अनुसूची (डीएसआर) एवं सांख्यिकीय समकक्ष-समूह मानक विश्लेषक",
  "Calibrated with 108 State-Category CPWD Delhi Schedule of Rates (DSR 2023-24) to flag unjustified cost escalations": "अनुचित लागत वृद्धि को चिह्नित करने हेतु १०८ राज्य-श्रेणी सीपीडब्ल्यूडी दिल्ली दर अनुसूची (डीएसआर २०२३-२४) से अंशांकित",
  "Calibrated with 178 State-Category CPWD Delhi Schedule of Rates (DSR 2023-24) to flag unjustified cost escalations": "अनुचित लागत वृद्धि को चिह्नित करने हेतु १७८ राज्य-श्रेणी सीपीडब्ल्यूडी दिल्ली दर अनुसूची (डीएसआर २०२३-२४) से अंशांकित",
  "Calibrated with १७८ State-Category CPWD दिल्ली Schedule / Rates (DSR २०२३-२४) to flag unjustified cost escalations": "अनुचित लागत वृद्धि को चिह्नित करने हेतु १७८ राज्य-श्रेणी सीपीडब्ल्यूडी दिल्ली दर अनुसूची (डीएसआर २०२३-२४) से अंशांकित",
  "Flagged Excess Overrun Risk": "चिह्नित अतिरिक्त लागत जोखिम",
  "TOTAL WORKS EVALUATED": "कुल मूल्यांकित कार्य",
  "Total Works Evaluated": "कुल मूल्यांकित कार्य",
  "Calibrated against CPWD Rates": "सीपीडब्ल्यूडी दरों के विरुद्ध अंशांकित",
  "COST ANOMALIES FLAGGED": "चिह्नित लागत विसंगतियां",
  "Cost Anomalies Flagged": "चिह्नित लागत विसंगतियां",
  "Deviating from peer benchmarks": "समकक्ष मानकों से विचलित",
  "Deviating from peer benchमार्चks": "समकक्ष मानकों से विचलित",
  "CRITICAL INFLATION (+100%+)": "अति-गंभीर मुद्रास्फीति (+१००%+)",
  "Critical Inflation (+100%+)": "अति-गंभीर मुद्रास्फीति (+१००%+)",
  "अति-गंभीर INFLATION (+१००%+)": "अति-गंभीर मुद्रास्फीति (+१००%+)",
  "Sanctioned at ≥ 2x peer median": "समकक्ष मध्यिका से ≥ २ गुना पर स्वीकृत",
  "TOTAL EXCESS COST RISK": "कुल अतिरिक्त लागत जोखिम",
  "Total Excess Cost Risk": "कुल अतिरिक्त लागत जोखिम",
  "Cumulative price-padding risk flagged": "संचयी मूल्य-वृद्धि जोखिम चिह्नित",
  "Auditing project budgets against State DSR Multipliers and category peer medians to prevent treasury overbilling": "राजकोषीय अधिमूल्यन रोकने हेतु राज्य डीएसआर गुणकों एवं श्रेणी समकक्ष मध्यिकाओं के विरुद्ध परियोजना बजट की जांच",
  "All Cost Anomalies": "सभी लागत विसंगतियां",
  "Critical Inflation (+100% to +400%)": "अति-गंभीर मुद्रास्फीति (+१००% से +४००%)",
  "अति-गंभीर Inflation (+१००% to +४००%)": "अति-गंभीर मुद्रास्फीति (+१००% से +४००%)",
  "Moderate Inflation (+40% to +100%)": "मध्यम मुद्रास्फीति (+४०% से +१००%)",
  "Moderate Inflation (+४०% to +१००%)": "मध्यम मुद्रास्फीति (+४०% से +१००%)",
  "Unviable Under-Bids (<-40%)": "अलाभकारी न्यून बोलियां (<-४०%)",
  "Unviable Under-Bids (<-४०%)": "अलाभकारी न्यून बोलियां (<-४०%)",
  "Fair Market Pricing": "उचित बाजार मूल्य निर्धारण",
  "Fair मार्चket Pricing": "उचित बाजार मूल्य निर्धारण",
  "COST BENCHMARK VERDICT (ARTHA-DARPAN)": "लागत मानक निर्णय (अर्थ-दर्पण)",
  "COST BENCHमार्चK VERDICT (ARTHA-DARPAN)": "लागत मानक निर्णय (अर्थ-दर्पण)",
  "ARTHA-DARPAN (अर्थ-दर्पण) Live in Action": "अर्थ-दर्पण (लागत मानक एवं मूल्य वृद्धि) सक्रिय निरीक्षण",
  "SENTINEL S-04: CHAKRA-VYUH (चक्रव्यूह — CONTRACTOR CARTEL GRAPH)": "प्रहरी एस-०४: चक्रव्यूह (ठेकेदार साठगांठ ग्राफ)",
  "SENTINEL S-04: CHAKRA-VYUH (चक्रव्यूह — CARTEL NEXUS SENTRY)": "प्रहरी एस-०४: चक्रव्यूह (ठेकेदार साठगांठ ग्राफ)",
  "SENTINEL S-04: CHAKRA-VYUH (चक्रव्यूह — Contractor Cartel & Vendor Nexus Graph)": "प्रहरी एस-०४: चक्रव्यूह (ठेकेदार साठगांठ ग्राफ)",
  "Contractor Cartel & Vendor Nexus Graph Sentry": "ठेकेदार सिंडिकेट एवं विक्रेता साठगांठ ग्राफ प्रहरी",
  "Network Graph & Herfindahl-Hirschman Index (HHI) detecting vendor syndicates": "नेटवर्क ग्राफ एवं एचएचआई सूचकांक - विक्रेता सिंडिकेट की पहचान",
  "CARTEL & VENDOR AUDIT VERDICT (CHAKRA-VYUH)": "सिंडिकेट एवं विक्रेता ऑडिट निर्णय (चक्रव्यूह)",
  "All Cartel Risks": "सभी साठगांठ जोखिम",
  "Vendor Monopolies (Share > 50%)": "विक्रेता एकाधिकार (हिस्सेदारी > ५०%)",
  "High Concentration (HHI > 2500)": "उच्च संकेन्द्रण (एचएचआई > २५००)",
  "Competitive Procurement": "प्रतिस्पर्धी खरीद",
  "SENTINEL S-05: VIBHED-NETRA (विभेद-नेत्र — 12D ISOLATION FOREST)": "प्रहरी एस-०५: विभेद-नेत्र (१२डी आइसोलेशन फॉरेस्ट)",
  "SENTINEL S-05: VIBHED-NETRA (विभेद-नेत्र — ML ANOMALY SENTRY)": "प्रहरी एस-०५: विभेद-नेत्र (१२डी आइसोलेशन फॉरेस्ट)",
  "SENTINEL S-05: VIBHED-NETRA (विभेद-नेत्र — 12D Isolation Forest Anomaly Sentry)": "प्रहरी एस-०५: विभेद-नेत्र (१२डी आइसोलेशन फॉरेस्ट)",
  "12-Dimensional Isolation Forest Outlier Sentry": "१२-आयामी आइसोलेशन फॉरेस्ट विसंगति प्रहरी",
  "Multi-parametric unsupervised machine learning isolating complex statistical anomalies across 176k works": "१.७६ लाख कार्यों में जटिल सांख्यिकीय विसंगतियों को अलग करने वाली बहु-मापदंडीय मशीन लर्निंग",
  "12D ML ANOMALY VERDICT (VIBHED-NETRA)": "१२-आयामी एमएल विसंगति निर्णय (विभेद-नेत्र)",
  "All ML Outliers": "सभी एमएल विसंगतियां",
  "Critical Outliers (Score > 0.75)": "अति-गंभीर विसंगतियां (स्कोर > ०.७५)",
  "Elevated Anomalies (Score 0.55–0.75)": "मध्यम विसंगतियां (स्कोर ०.५५–०.७५)",
  "Cluster Norms (Score < 0.55)": "सामान्य क्लस्टर (स्कोर < ०.५५)",
  "SENTINEL S-06: SANKHYA-SATYA (संख्या-सत्य — BENFORD & TENDER-SPLIT)": "प्रहरी एस-०६: संख्या-सत्य (बेनफोर्ड एवं निविदा विभाजन)",
  "SENTINEL S-06: SANKHYA-SATYA (संख्या-सत्य — MATHEMATICAL FORENSIC SENTRY)": "प्रहरी एस-०६: संख्या-सत्य (गणितीय फोरेंसिक प्रहरी)",
  "SENTINEL S-06: SANKHYA-SATYA (संख्या-सत्य — Forensic Digit & Tender-Splitting Sentry)": "प्रहरी एस-०६: संख्या-सत्य (गणितीय फोरेंसिक प्रहरी)",
  "Benford's Law Digit & Tender-Splitting Sentry": "बेनफोर्ड अंक नियम एवं निविदा-विभाजन प्रहरी",
  "First-digit logarithmic frequency testing (Chi-square) & sub-threshold smurfing (GFR 149)": "प्रथम-अंक लघुगणकीय आवृत्ति परीक्षण (काई-स्क्वायर) एवं सीमा-विभाजन जांच (जीएफआर १४९)",
  "MATHEMATICAL FORENSIC VERDICT (SANKHYA-SATYA)": "गणितीय फोरेंसिक निर्णय (संख्या-सत्य)",
  "All Forensic Red Flags": "सभी फोरेंसिक रेड फ्लैग",
  "Tender-Splitting (Sub-₹5L / ₹10L)": "निविदा-विभाजन (₹५ लाख / ₹१० लाख से नीचे)",
  "Round-Number Approximations": "पूर्णांक प्राक्कलन",
  "Benford Compliant Works": "बेनफोर्ड अनुपालित कार्य",
  "SENTINEL S-07: BHU-DRISHTI (भू-दृष्टि — SATELLITE & GIS OVERLAY)": "प्रहरी एस-०७: भू-दृष्टि (उपग्रह एवं जीआईएस सत्यापन)",
  "SENTINEL S-07: BHU-DRISHTI (भू-दृष्टि — GEOSPATIAL SATELLITE RADAR)": "प्रहरी एस-०७: भू-दृष्टि (उपग्रह एवं जीआईएस सत्यापन)",
  "SENTINEL S-07: BHU-DRISHTI (भू-दृष्टि — Geospatial Satellite Sentry & Ghost Asset Radar)": "प्रहरी एस-०७: भू-दृष्टि (उपग्रह एवं जीआईएस सत्यापन)",
  "Geospatial GIS & Satellite Asset Verification Radar": "भू-स्थानिक जीआईएस एवं उपग्रह परिसंपत्ति सत्यापन रडार",
  "ISRO Bhuvan satellite imagery & GPS coordinate auditing to verify physical presence of works": "कार्यों की भौतिक उपस्थिति सत्यापित करने हेतु इसरो भुवन उपग्रह चित्र एवं जीपीएस निर्देशांक ऑडिट",
  "GEOSPATIAL AUDIT VERDICT (BHU-DRISHTI)": "भू-स्थानिक ऑडिट निर्णय (भू-दृष्टि)",
  "All Geospatial Flags": "सभी भू-स्थानिक फ्लैग",
  "Ghost Assets (Missing Geotag)": "फर्जी परिसंपत्ति (लापता जियोटैग)",
  "Spatial Clusters (<250m Radius)": "समीपस्थ क्लस्टर (<२५० मीटर दायरा)",
  "Verified Ground Coordinates": "सत्यापित जमीनी निर्देशांक",
  "MODULE 10: PRASHNA-KAVACH (प्रश्न-कवच — EXPLAINABLE FORENSIC AI)": "मॉड्यूल १०: प्रश्न-कवच (व्याख्या योग्य फोरेंसिक एआई)",
  "MODULE 08: PRASHNA-KAVACH (प्रश्न कवच — PARLIAMENTARY Q&A AUDIT SENTRY)": "मॉड्यूल ०८: प्रश्न-कवच (संसदीय प्रश्न ऑडिट प्रहरी)",
  "MODULE 09: SATARK-SAMVAAD (सतर्क संवाद — GENAI AUDIT COPILOT)": "मॉड्यूल ०९: सतर्क-संवाद (जेनएआई ऑडिट कोपायलट)",
  "Explainable AI Attribution & Statutory Legal Proof": "व्याख्या योग्य एआई आरोपण एवं सांविधिक कानूनी साक्ष्य",
  "Deconstructs multi-sentinel priority scores into additive SHAP feature attribution and statutory legal citations from MoSPI Guidelines 2023 & GFR Rules": "बहु-प्रहरी प्राथमिकता स्कोर को योगात्मक SHAP विशेषता आरोपण तथा सांख्यिकी मंत्रालय दिशानिर्देश २०२३ एवं जीएफआर नियमों से सांविधिक उद्धरणों में विश्लेषित करता है",
  "Deconstructs complex multi-sentinel priority scores into additive SHAP feature attribution and statutory legal citations from MoSPI Guidelines 2023 & GFR Rules.": "बहु-प्रहरी प्राथमिकता स्कोर को योगात्मक SHAP विशेषता आरोपण तथा सांख्यिकी मंत्रालय दिशानिर्देश २०२३ एवं जीएफआर नियमों से सांविधिक उद्धरणों में विश्लेषित करता है।",
  "Model Calibration Precision": "मॉडल अंशांकन परिशुद्धता",
  "Export Official Evidence Dossier": "आधिकारिक साक्ष्य डोजियर निर्यात करें",
  "Select Real MoSPI Audit (176k Dataset):": "वास्तविक सांख्यिकी मंत्रालय ऑडिट चुनें (१.७६ लाख डेटासेट):",
  "Search any Project ID or keyword (e.g. 177089)...": "कोई भी परियोजना आईडी या कीवर्ड खोजें (जैसे १७७०८९)...",
  "Search MoSPI": "सांख्यिकी मंत्रालय खोजें",
  "Additive SHAP Feature Attribution (Explainable AI Waterfall)": "योगात्मक SHAP विशेषता आरोपण (व्याख्या योग्य एआई वाटरफॉल)",
  "Model Calibration Precision: 94.2% · Zero Hallucination": "मॉडल अंशांकन परिशुद्धता: ९४.२% · शून्य विभ्रम",
  "Verify Cryptographic SHA-256 Ledger": "क्रिप्टोग्राफिक SHA-256 लेजर सत्यापित करें",
  "Export Official Pre-Sanction Inspection Memorandum": "आधिकारिक स्वीकृति-पूर्व निरीक्षण ज्ञापन निर्यात करें",
  "SENTINEL": "प्रहरी",
  "SENTINELS": "प्रहरी",
  "SENTRY": "प्रहरी",
  "VIDHI-KAVACH": "विधि-कवच",
  "PUNAR-DRISHTI": "पुनर्दृष्टि",
  "ARTHA-DARPAN": "अर्थ-दर्पण",
  "CHAKRA-VYUH": "चक्रव्यूह",
  "VIBHED-NETRA": "विभेद-नेत्र",
  "SANKHYA-SATYA": "संख्या-सत्य",
  "BHU-DRISHTI": "भू-दृष्टि",
  "PRASHNA-KAVACH": "प्रश्न-कवच",
  "SATARK-SAMVAAD": "सतर्क-संवाद",
  "SATARK-KARYAA": "सतर्क-कार्या",
  "BHAVISHYA-REKHA": "भविष्य-रेखा",
  "SATARK": "सतर्क",
  "MPLADS": "एमपीलैड्स",
  "MoSPI": "सांख्यिकी मंत्रालय",
  "MOSPI": "सांख्यिकी मंत्रालय",
  "eSAKSHI": "ई-साक्षी",
  "ESAKSHI": "ई-साक्षी",
  "Select State / UT:": "राज्य / केंद्र शासित प्रदेश चुनें:",
  "Select State / UT": "राज्य / केंद्र शासित प्रदेश चुनें",
  "All 36 States & UTs (All-India)": "सभी ३६ राज्य एवं केंद्र शासित प्रदेश (अखिल भारतीय)",
  "All 37 States & UTs": "सभी ३७ राज्य एवं केंद्र शासित प्रदेश",
  "All States & UTs": "सभी राज्य एवं केंद्र शासित प्रदेश",
  "QUICK Search:": "त्वरित खोज:",
  "QUICK खोजें:": "त्वरित खोज:",
  "Search title, MP name, district, keyword...": "शीर्षक, सांसद, जिला, कीवर्ड खोजें...",
  "Search by Project ID, Title, MP Name, District, or Vendor...": "परियोजना आईडी, शीर्षक, सांसद, जिला या विक्रेता द्वारा खोजें...",
  "Filter by Sentinel Engine:": "प्रहरी इंजन द्वारा फ़िल्टर करें:",
  "All Sentinel Risks": "सभी प्रहरी जोखिम",
  "Only Critical Risks (Score ≥ 75)": "केवल अति-गंभीर जोखिम (स्कोर ≥ ७५)",
  "Only High Risks (Score 55 - 74)": "केवल उच्च जोखिम (स्कोर ५५ - ७४)",
  "Sort by Priority:": "प्राथमिकता क्रम:",
  "Risk Score (High to Low)": "जोखिम स्कोर (उच्च से निम्न)",
  "Sanction Cost (High to Low)": "स्वीकृत लागत (उच्च से निम्न)",
  "Recently Recommended": "हाल ही में अनुशंसित",
  "Export Audit CSV": "ऑडिट CSV डाउनलोड करें",
  "PROJECT ID": "परियोजना आईडी",
  "Project ID": "परियोजना आईडी",
  "WORK DESCRIPTION": "कार्य का विवरण",
  "Work Description": "कार्य का विवरण",
  "Work Title / Description": "कार्य का शीर्षक / विवरण",
  "STATE & DISTRICT": "राज्य एवं जिला",
  "State & District": "राज्य एवं जिला",
  "HON'BLE MP": "माननीय सांसद",
  "Hon'ble MP": "माननीय सांसद",
  "MP & Sector": "सांसद एवं क्षेत्र",
  "SANCTION OUTLAY (₹)": "स्वीकृत परिव्यय (₹)",
  "SANCTION OUTLAY": "स्वीकृत परिव्यय",
  "Sanctioned Amount": "स्वीकृत राशि",
  "Forensic Flags & Citations": "फोरेंसिक फ्लैग एवं नियम संदर्भ",
  "Composite Priority Score": "समग्र प्राथमिकता स्कोर",
  "ACTION / DOSSIER": "कार्रवाई / डोजियर",
  "Action / Dossier": "कार्रवाई / डोजियर",
  "Action": "कार्रवाई",
  "Actions": "कार्रवाईयां",
  "Category:": "श्रेणी:",
  "Sanctioned:": "स्वीकृत:",
  "Completed:": "पूर्ण:",
  "Normal/Others": "सामान्य / अन्य",
  "Standard Work": "मानक कार्य",
  "Repair and Renovation": "मरम्मत एवं नवीनीकरण",
  "In Progress": "प्रगति पर",
  "Physical Inspection": "भौतिक निरीक्षण",
  "Sl.No.": "क्र.सं.",
  "Sl. No.": "क्र.सं.",
  "Plot No": "प्लॉट संख्या",
  "JL No": "जे.एल. संख्या",
  "NA": "लागू नहीं",
  "100% EXACT CLONE": "१००% हूबहू क्लोन",
  "EXACT CLONE": "हूबहू क्लोन",
  "NEAR-CLONE": "निकट-क्लोन",
  "Inspect Twin Work": "क्लोन कार्य देखें",
  "Twin:": "समान कार्य:",
  "Twin": "समान कार्य",
  "Peer:": "समकक्ष मध्यिका:",
  "Excess:": "अतिरिक्त लागत:",
  "Vendor:": "विक्रेता:",
  "HHI:": "एचएचआई:",
  "Score:": "स्कोर:",
  "Score": "स्कोर",
  "View CPWD Rate Audit": "सीपीडब्ल्यूडी दर ऑडिट देखें",
  "Trace Cartel Network": "ठेकेदार सिंडिकेट देखें",
  "Inspect 12D Outlier Vector": "१२-आयामी विसंगति वेक्टर देखें",
  "View Digit Distribution": "अंक वितरण देखें",
  "Fly to Satellite Radar": "उपग्रह रडार पर देखें",
  "CRITICAL INFLATION": "अति-गंभीर मुद्रास्फीति",
  "UNVIABLE BID": "अलाभकारी बोली",
  "PRICE PADDING": "मूल्य वृद्धि",
  "FAIR PRICING": "उचित मूल्य",
  "Conforms to CPWD Benchmark": "सीपीडब्ल्यूडी मानकों के अनुरूप",
  "VENDOR MONOPOLY": "विक्रेता एकाधिकार",
  "HIGH CONCENTRATION": "उच्च संकेन्द्रण",
  "Competitive Vendor Distribution": "प्रतिस्पर्धी विक्रेता वितरण",
  "12D ML OUTLIER": "१२डी एमएल विसंगति",
  "CRITICAL OUTLIER": "अति-गंभीर विसंगति",
  "ELEVATED ANOMALY": "मध्यम विसंगति",
  "CLUSTER NORMAL": "सामान्य क्लस्टर",
  "Conforms to Cluster Norms": "क्लस्टर मानकों के अनुरूप",
  "TENDER-SPLIT": "निविदा विभाजन",
  "ROUND NUMBER": "पूर्णांक प्राक्कलन",
  "BENFORD OK": "बेनफोर्ड ठीक",
  "Sub-Threshold Limit": "सीमा-विभाजन जांच",
  "GHOST ASSET": "फर्जी परिसंपत्ति",
  "SPATIAL CLUSTER": "समीपस्थ क्लस्टर",
  "VERIFIED GPS": "सत्यापित जीपीएस",
  "UNIQUE ASSET": "अद्वितीय संपत्ति",
  "No Duplicate in District": "जिले में कोई दोहरा कार्य नहीं",
  "Fiscal Year-End March Rush Violation": "वित्तीय वर्ष समाप्ति मार्च रश उल्लंघन",
  "वित्तीय वर्ष समाप्ति मार्च रश उल्लंघन": "वित्तीय वर्ष समाप्ति मार्च रश उल्लंघन",
  "Places of Worship & Religious Structures": "पूजा स्थल एवं धार्मिक संरचनाएं",
  "पूजा स्थल एवं धार्मिक संरचनाएं": "पूजा स्थल एवं धार्मिक संरचनाएं",
  "Zero Guidelines Breach": "शून्य दिशानिर्देश उल्लंघन (स्वच्छ)",
  "CRITICAL": "अति-गंभीर",
  "HIGH": "उच्च जोखिम",
  "ELEVATED": "मध्यम जोखिम",
  "LOW": "न्यूनतम जोखिम",
  "COMPLIANT": "अनुपालित",
  "STATUTORY BREACH": "सांविधिक उल्लंघन",
  "DUPLICATE CLONE": "क्लोन कार्य",
  "PRICE INFLATION": "मूल्य वृद्धि",
  "CARTEL MONOPOLY": "साठगांठ एकाधिकार",
  "OUTLIER": "असामान्य विसंगति",
  "ALL CLEAR": "सभी मानक स्वच्छ",
  "NEG-LIST": "निषेध-सूची",
  "MARCH-RUSH": "मार्च-रश",
  "pts": "अंक",
  "points": "अंक",
  "STATUTORY AUDIT VERDICT": "सांविधिक ऑडिट निर्णय",
  "Forensic Audit Findings & Legal Citations:": "फोरेंसिक ऑडिट निष्कर्ष एवं कानूनी उद्धरण:",
  "VIDHI-KAVACH Statutory Policy Findings & Legal Citations:": "विधि-कवच सांविधिक नीति निष्कर्ष एवं कानूनी उद्धरण:",
  "ARTHA-DARPAN CPWD Rate Benchmark & Overpricing Analysis:": "अर्थ-दर्पण सीपीडब्ल्यूडी दर मानक एवं अधिमूल्यन विश्लेषण:",
  "S-01: VIDHI-KAVACH STATUTORY INVESTIGATION": "एस-०१: विधि-कवच सांविधिक जांच",
  "S-02: PUNAR-DRISHTI DUPLICATE INVESTIGATION": "एस-०२: पुनर्दृष्टि दोहरे दावे की जांच",
  "S-03: ARTHA-DARPAN COST BENCHMARK AUDIT": "एस-०३: अर्थ-दर्पण लागत मानक ऑडिट",
  "S-04: CHAKRA-VYUH CONTRACTOR CARTEL AUDIT": "एस-०४: चक्रव्यूह ठेकेदार साठगांठ ऑडिट",
  "S-05: VIBHED-NETRA 12D ISOLATION AUDIT": "एस-०५: विभेद-नेत्र १२डी आइसोलेशन ऑडिट",
  "S-06: SANKHYA-SATYA FORENSIC DIGIT AUDIT": "एस-०६: संख्या-सत्य फोरेंसिक अंक ऑडिट",
  "S-07: BHU-DRISHTI SATELLITE GEOSPATIAL AUDIT": "एस-०७: भू-दृष्टि उपग्रह भू-स्थानिक ऑडिट",
  "Generate Official Vigilance Memorandum": "आधिकारिक सतर्कता ज्ञापन तैयार करें",
  "GENERATE CASE FILE (Form GFR-19A)": "मामला फाइल तैयार करें (फॉर्म जीएफआर-१९ए)",
  "Close": "बंद करें",
  "← Back to Forensic Reason Summary": "← फोरेंसिक कारण सारांश पर वापस जाएं",
  "WHY WAS THIS FLAGGED?": "यह क्यों चिह्नित हुआ?",
  "VIEW FORENSIC AUDIT": "फोरेंसिक ऑडिट देखें",
  "VIEW GEOSPATIAL AUDIT": "भू-स्थानिक ऑडिट देखें",
  "VIEW CPWD AUDIT": "सीपीडब्ल्यूडी ऑडिट देखें",
  "Inspecting Sentinel Evidence (from \"Why Was This Flagged?\")": "प्रहरी साक्ष्य निरीक्षण (\"यह क्यों चिह्नित हुआ?\" से)",
  "Click back anytime to return to the Forensic Reason Summary & inspect other sentinels.": "फोरेंसिक कारण सारांश पर लौटने और अन्य प्रहरियों की जांच के लिए कभी भी वापस क्लिक करें।",
  "Back to \"Why Was This Flagged?\"": "\"यह क्यों चिह्नित हुआ?\" पर वापस जाएं",
  "Cost Deviation": "लागत विचलन",
  "Excess Public Exposure:": "अतिरिक्त सार्वजनिक जोखिम:",
  "State CPWD Peer Median:": "राज्य सीपीडब्ल्यूडी समकक्ष मध्यिका:",
  "Statutory Rate Standard:": "सांविधिक दर मानक:",
  "CPWD Schedule of Rates (DSR) & GFR 2017 Rule 144": "सीपीडब्ल्यूडी दर अनुसूची (डीएसआर) एवं जीएफआर २०१७ नियम १४४",
  "Matched Twin Work Record": "समान क्लोन कार्य अभिलेख",
  "Asset Description is Unique": "परिसंपत्ति विवरण अद्वितीय है",
  "No risk of double-billing or multiple vouchers on the same civil construction.": "समान निर्माण कार्य पर दोहरे बिलिंग या एकाधिक वाउचर का कोई जोखिम नहीं।",
  "Forensic Verdict": "फोरेंसिक निर्णय",
  "GFR 149 Evasion": "जीएफआर १४९ परिहार",
  "Lacks Itemized BOQ": "मदवार बीओक्यू का अभाव",
  "Natural Distribution": "प्राकृतिक वितरण",
  "Benford Forensic & Threshold Audit": "बेनफोर्ड फोरेंसिक एवं सीमा ऑडिट",
  "Threshold Smurfing:": "सीमा स्मर्फिंग (विभाजन):",
  "Priced Just Below ₹5L/10L Mandatory e-Tender Limit": "₹५ लाख / ₹१० लाख अनिवार्य ई-निविदा सीमा से ठीक नीचे मूल्य निर्धारित",
  "Exact Lakh Integer without Detail BOQ": "विस्तृत बीओक्यू के बिना पूर्ण लाख पूर्णांक",
  "Natural Commercial Pricing": "प्राकृतिक वाणिज्यिक मूल्य निर्धारण",
  "GFR 2017 Rule 149 & Rule 157 (Anti-Splitting Sentry)": "जीएफआर २०१७ नियम १४९ एवं नियम १५७ (विभाजन-रोधी प्रहरी)",
  "BHU-DRISHTI Geospatial Forensic Evidence Trail": "भू-दृष्टि भू-स्थानिक फोरेंसिक साक्ष्य श्रृंखला",
  "ISRO Bhuvan & eSAKSHI GIS": "इसरो भुवन एवं ई-साक्षी जीआईएस",
  "SATELLITE POSITION:": "उपग्रह स्थिति:",
  "GROUND TRUTH STATUS:": "धरातलीय स्थिति:",
  "FIELD DIRECTIVE:": "क्षेत्रीय निर्देश:",
  "Funds disbursed on paper without verified GPS photographic proof in eSAKSHI portal.": "ई-साक्षी पोर्टल में सत्यापित जीपीएस फोटो साक्ष्य के बिना कागजों पर राशि वितरित।",
  "Sanctioned within 250m radius of existing asset, creating redundant civil asset risk.": "मौजूदा परिसंपत्ति के २५० मीटर के दायरे में स्वीकृत, जिससे निरर्थक परिसंपत्ति का जोखिम।",
  "Coordinates verified within valid district cadastral boundaries.": "निर्देशांक वैध जिला भूकर सीमाओं के भीतर सत्यापित।",
  "Execute on-ground physical geotag verification using mobile inspector app before final completion certificate is issued.": "अंतिम पूर्णता प्रमाणपत्र जारी करने से पहले मोबाइल इंस्पेक्टर ऐप का उपयोग करके जमीनी भौतिक जियोटैग सत्यापन निष्पादित करें।",
  "BHU-DRISHTI Verified GIS Coordinates": "भू-दृष्टि सत्यापित जीआईएस निर्देशांक",
  "Latitude:": "अक्षांश:",
  "Longitude:": "देशांतर:",
  "Copy Hash": "हैश कॉपी करें",
  "Copied!": "कॉपी किया गया!",
  "Export PDF": "पीडीएफ निर्यात करें",
  "Print Dossier": "डोजियर प्रिंट करें",
  "Provision / Lighting arrangement with Street light poles": "स्ट्रीट लाइट पोल सहित प्रकाश व्यवस्था का प्रावधान",
  "Provision / Lighting arrangment with street light & Poles": "स्ट्रीट लाइट एवं पोल सहित प्रकाश व्यवस्था का प्रावधान",
  "Provision / Lighting arrangement": "विद्युत प्रकाश व्यवस्था का प्रावधान",
  "Provision / Lighting arrangment": "विद्युत प्रकाश व्यवस्था का प्रावधान",
  "Lighting arrangement": "प्रकाश व्यवस्था",
  "Lighting arrangment": "प्रकाश व्यवस्था",
  "Street light poles": "स्ट्रीट लाइट पोल",
  "Street light & Poles": "स्ट्रीट लाइट एवं पोल",
  "Street light": "स्ट्रीट लाइट",
  "Poles": "खंभे",
  "Park Revonation": "पार्क जीर्णोद्धार",
  "The working agency will be concerned Municipal Corporation": "कार्यकारी एजेंसी संबंधित नगर निगम होगी",
  "Municipal Corporation": "नगर निगम",
  "working agency": "कार्यकारी एजेंसी",
  "concerned": "संबंधित",
  "Const. / General Chaupal": "निर्माण / सामान्य चौपाल",
  "General Chaupal": "सामान्य चौपाल",
  "Chaupal": "चौपाल",
  "1st phase": "प्रथम चरण",
  "2nd phase": "द्वितीय चरण",
  "3rd phase": "तृतीय चरण",
  "Community Media Centre": "सामुदायिक मीडिया केंद्र",
  "Public Mongpham": "सार्वजनिक मोंगफाम",
  "Athoupung Leikol, a Public park": "अथौपुंग लीकोल, सार्वजनिक पार्क",
  "Public park": "सार्वजनिक पार्क",
  "Boundary wall, road gate guard wall": "चारदीवारी, सड़क गेट सुरक्षा दीवार",
  "Boundary wall": "चारदीवारी",
  "road gate guard wall": "सड़क गेट सुरक्षा दीवार",
  "guard wall": "सुरक्षा दीवार",
  "gate guard": "गेट सुरक्षा",
  "Kaborsthan": "कब्रिस्तान",
  "Kabristan": "कब्रिस्तान",
  "and gate at infront": "एवं सामने गेट",
  "mudi shop": "किराना दुकान",
  "under": "अंतर्गत",
  "Panchayat Samity": "पंचायत समिति",
  "Samity": "समिति",
  "G.P": "ग्राम पंचायत",
  "Bus for Bal Bharti Vidhya": "बाल भारती विद्या हेतु बस",
  "solar photovoltaic Submersible Pump": "सौर फोटोवोल्टिक सबमर्सिबल पंप",
  "Submersible Pump": "सबमर्सिबल पंप",
  "overhead tank": "ओवरहेड टैंक",
  "pipe line": "पाइपलाइन",
  "one (?) nos": "१ नग",
  "Near Laxmi": "लक्ष्मी के समीप",
  "Excavation / Pit": "खुदाई / गड्ढा",
  "Guru Kunta Temple Reach": "गुरु कुंटा मंदिर रीच",
  "Temple Reach": "मंदिर रीच",
  "Constructing a new": "नवीन निर्माण",
  "near Maremma temple": "मारेम्मा मंदिर के समीप",
  "Maremma temple": "मारेम्मा मंदिर",
  "Two Hundred Fifty": "दो सौ पचास",
  "solar street lights": "सौर स्ट्रीट लाइटें",
  "solar street light": "सौर स्ट्रीट लाइट",
  "at various public locations": "विभिन्न सार्वजनिक स्थलों पर",
  "in Blocks": "ब्लॉकों में",
  "as per the enclosed list": "संलग्न सूची अनुसार",
  "enclosed list": "संलग्न सूची",
  "Construction of Chabutra near Shiv Mandir": "शिव मंदिर के पास चबूतरा निर्माण",
  "Construction of Chabutra": "चबूतरा निर्माण",
  "near Shiv Mandir": "शिव मंदिर के पास",
  "Shiv Mandir": "शिव मंदिर",
  "Mandir": "मंदिर",
  "Estimate for the": "प्राक्कलन:",
  "Estimate for": "प्राक्कलन:",
  "Purchase of ambulances": "एम्बुलेंस की खरीद",
  "Purchase of ambulance": "एम्बुलेंस की खरीद",
  "Purchase of": "क्रय / खरीद:",
  "Medical Equipment to be Fitted in Ambulance": "एम्बुलेंस हेतु चिकित्सा उपकरण",
  "Solar Light": "सोलर लाइट",
  "PCC Road": "पीसीसी सड़क",
  "CC road": "सीसी सड़क",
  "Pitch road": "डामर सड़क",
  "Drain construction": "नाली निर्माण",
  "Drinking Water": "पेयजल",
  "Water Tank": "पानी की टंकी",
  "Pipeline": "पाइपलाइन",
  "School": "विद्यालय",
  "Hospital": "अस्पताल",
  "Ambulance": "एम्बुलेंस",
  "Excavation": "खुदाई",
  "Pit": "गड्ढा",
  "Reach": "रीच",
  "Village": "गांव",
  "Mandal": "मंडल",
  "Block": "ब्लॉक",
  "District": "जिला",
  "State": "राज्य",
  "Gram Panchayat": "ग्राम पंचायत",
  "Panchayat": "पंचायत",
  "Development Block": "विकास खंड",
  "Near": "समीप",
  "near": "समीप",
  "Public": "सार्वजनिक",
  "Private": "निजी",
  "Sitting Rajya Sabha": "वर्तमान राज्यसभा सांसद",
  "Rajya Sabha": "राज्यसभा",
  "Lok Sabha": "लोकसभा",
  "DEPUTY COMMISSIONER": "उपायुक्त",
  "DISTRICT MAGISTRATE": "जिलाधिकारी",
  "DISTRICT MAGISTRAE": "जिलाधिकारी",
  "DISTRICT COLLECTOR": "जिला कलेक्टर",
  "DISTRICT PLANNING OFFICER": "जिला योजना अधिकारी",
  "COLLECTOR": "कलेक्टर",
  "COMMISSIONER": "आयुक्त",
  "MAGISTRATE": "मजिस्ट्रेट",
  "Jharkhand": "झारखंड",
  "Goa": "गोवा",
  "Manipur": "मणिपुर",
  "Uttar Pradesh": "उत्तर प्रदेश",
  "Bihar": "बिहार",
  "Rajasthan": "राजस्थान",
  "Madhya Pradesh": "मध्य प्रदेश",
  "Maharashtra": "महाराष्ट्र",
  "Gujarat": "गुजरात",
  "West Bengal": "पश्चिम बंगाल",
  "Tamil Nadu": "तमिलनाडु",
  "Karnataka": "कर्नाटक",
  "Kerala": "केरल",
  "Odisha": "ओडिशा",
  "Punjab": "पंजाब",
  "Haryana": "हरियाणा",
  "Assam": "असम",
  "Andhra Pradesh": "आंध्र प्रदेश",
  "Telangana": "तेलंगाना",
  "Chhattisgarh": "छत्तीसगढ़",
  "Himachal Pradesh": "हिमाचल प्रदेश",
  "Uttarakhand": "उत्तराखंड",
  "Jammu & Kashmir": "जम्मू एवं कश्मीर",
  "Jammu and Kashmir": "जम्मू एवं कश्मीर",
  "Delhi": "दिल्ली",
  "Tripura": "त्रिपुरा",
  "Meghalaya": "मेघालय",
  "Nagaland": "नागालैंड",
  "Mizoram": "मिजोरम",
  "Arunachal Pradesh": "अरुणाचल प्रदेश",
  "Sikkim": "सिक्किम",
  "Puducherry": "पुदुचेरी",
  "Chandigarh": "चंडीगढ़",
  "Ladakh": "लद्दाख",
  "Andaman & Nicobar": "अंडमान एवं निकोबार",
  "Dadra & Nagar Haveli": "दादरा एवं नगर हवेली",
  "Lakshadweep": "लक्षद्वीप",
  "NORTH 24 PARGANAS": "उत्तर २४ परगना",
  "SOUTH 24 PARGANAS": "दक्षिण २४ परगना",
  "NORTH TWENTY FOUR PARGANAS": "उत्तर २४ परगना",
  "SOUTH TWENTY FOUR PARGANAS": "दक्षिण २४ परगना",
  "BANKURA": "बांकुड़ा",
  "Y.S.R. KADAPA": "वाई.एस.आर. कडपा",
  "Y.S.R. Kadapa": "वाई.एस.आर. कडपा",
  "CUDDAPAH": "कडपा",
  "KADAPA": "कडपा",
  "VIJAYANAGARA": "विजयनगर",
  "Vijayanagara": "विजयनगर",
  "AMETHI": "अमेठी",
  "Amethi": "अमेठी",
  "BASIRHAT": "बशीरहाट",
  "BELLARY(ST)": "बेल्लारी (अजजा)",
  "BELLARY": "बेल्लारी",
  "GURDASPUR": "गुरदासपुर",
  "JIND": "जींद",
  "SONEPAT": "सोनीपत",
  "THOUBAL": "थौबल",
  "IMPHAL EAST": "इंफाल पूर्व",
  "IMPHAL WEST": "इंफाल पश्चिम",
  "INNER MANIPUR": "इनर मणिपुर",
  "OUTER MANIPUR": "आउटर मणिपुर",
  "EAST": "पूर्व",
  "NORTH EAST": "उत्तर पूर्व",
  "WEST": "पश्चिम",
  "SOUTH": "दक्षिण",
  "CENTRAL": "मध्य",
  "NORTH GOA": "उत्तर गोवा",
  "SOUTH GOA": "दक्षिण गोवा",
  "Tiswadi": "तिसवाड़ी",
  "Ribandar": "रिबंदर",
  "Kamalapura": "कमलापुरा",
  "Hosapete": "होसपेट",
  "Barasat": "बारासात",
  "Chhotojagulia": "छोटोहागुलिया",
  "Indpur": "इन्दपुर",
  "Mejia": "मेजिया",
  "Deulvira": "देउलविरा",
  "Gurajala": "गुराजाला",
  "Simhadripuram": "सिम्हाद्रिपुरम",
  "Tiloi": "तिलोई",
  "Bahadurpur": "बहादुरपुर",
  "Singhpur": "सिंहपुर",
  "Sangrampur": "संग्रामपुर",
  "Bhadar": "भादर",
  "Bhetua": "भेटुआ",
  "Gauriganj": "गौरीगंज",
  "Jamo": "जामो",
  "Shahgarh": "शाहगढ़",
  "Musafirkhana": "मुसाफिरखाना",
  "Jagdishpur": "जगदीशपुर",
  "Shukul Bazar": "शुकुल बाजार",
  "Soibam": "सोइबम",
  "leikai": "लीकाई",
  "Mongpham": "मोंगफाम",
  "Porompat": "पोरोमपट",
  "Arapti": "अरापती",
  "Maning": "मानिंग",
  "Leikal": "लीकल",
  "Lilong": "लिलोंग",
  "Paona": "पाओना",
  "Jan": "जनवरी",
  "Feb": "फरवरी",
  "Mar": "मार्च",
  "March": "मार्च",
  "Apr": "अप्रैल",
  "May": "मई",
  "Jun": "जून",
  "Jul": "जुलाई",
  "Aug": "अगस्त",
  "Sep": "सितंबर",
  "Oct": "अक्टूबर",
  "Nov": "नवंबर",
  "Dec": "दिसंबर",
  "← Previous": "← पिछला",
  "Previous": "पिछला",
  "Next →": "अगला →",
  "Next": "अगला",
  " of ": " / ",
  "records": "अभिलेख",
  "record": "अभिलेख",
  "Page": "पृष्ठ",
  "Unified automated vigilance intelligence platform auditing public fund flows, statutory GFR compliance, and procurement integrity across India.": "समस्त भारत में सार्वजनिक निधि प्रवाह, सांविधिक जीएफआर अनुपालन एवं प्रापण निष्ठा की जांच करने वाला एकीकृत स्वचालित सतर्कता आसूचना मंच।",
  "QUICK LINKS": "त्वरित लिंक",
  "Quick Links": "त्वरित लिंक",
  "About SATARK": "सतर्क के बारे में",
  "Website Policies": "वेबसाइट नीतियां",
  "Privacy Policy": "गोपनीयता नीति",
  "Terms & Conditions": "नियम एवं शर्तें",
  "Statutory GFR Rules": "सांविधिक जीएफआर नियम",
  "Cryptographic Ledger": "क्रिप्टोग्राफिक लेजर",
  "HELPLINE & SUPPORT": "हेल्पलाइन एवं सहायता",
  "Helpline & Support": "हेल्पलाइन एवं सहायता",
  "TOLL-FREE HELPLINE": "टोल-फ्री हेल्पलाइन",
  "Toll-Free Helpline": "टोल-फ्री हेल्पलाइन",
  "TECHNICAL INQUIRIES": "तकनीकी पूछताछ",
  "Technical Inquiries": "तकनीकी पूछताछ",
  "NODAL MINISTRY": "नोडल मंत्रालय",
  "Nodal Ministry": "नोडल मंत्रालय",
  "Government of India, New Delhi": "भारत सरकार, नई दिल्ली",
  "All Rights Reserved.": "सर्वाधिकार सुरक्षित.",
  "All Rights Reserved": "सर्वाधिकार सुरक्षित",
  "Developed for Smart India Hackathon (SIH 2026) · v2.5-PROD": "स्मार्ट इंडिया हैकथॉन (SIH २०२६) हेतु विकसित · संस्करण २.५-उत्पादन",
  "Developed for Smart India Hackathon": "स्मार्ट इंडिया हैकथॉन हेतु विकसित",
  "National Informatics Centre (NIC) Standards Aligned": "राष्ट्रीय सूचना विज्ञान केंद्र (NIC) मानकों के अनुरूप",
  "Version 2.5 Sovereign Build · 176,925 MoSPI Records Verified": "संस्करण २.५ संप्रभु संस्करण · १,७६,९२५ सांख्यिकी मंत्रालय अभिलेख सत्यापित",
  "AASHTIKAR PATIL NAGESH BAPURAO": "आश्टिकर पटिल नगेश बपुरओ",
  "ABDUL RASHID SHEIKH": "अब्डुल रशिड शेइख",
  "ABHAY KUMAR SINHA": "अभय कुमार सिन्ह",
  "ABHIJIT GANGOPADHYAY": "अभिजिट गंगोपाध्याय",
  "ADHIKARI SOUMENDU": "अधिकरि सोउमेन्डु",
  "ADITYA YADAV": "अडिट्य यादव",
  "ADV GOWAAL KAGADA PADAVI": "अधिवक्ता गोवाल कगड पडवि",
  "ADV K FRANCIS GEORGE": "अधिवक्ता के. फ़्रन्cइस गेओर्गे",
  "AFZAL ANSARI": "अफ़्ज़ल अन्सरि",
  "AGA SYED RUHULLAH MEHDI": "अग स्येड रुहुल्लह मेह्डि",
  "AJENDRA SINGH LODHI": "अजेन्ड्र सिंह लोधि",
  "AKHILESH YADAV": "अखिलेश यादव",
  "AKSHAYA YADAV": "अक्षय यादव",
  "ALFRED KANNGAM S ARTHUR": "अल्फ़्रेड कन्न्गम एस. अर्थुर",
  "ALOK SHARMA": "अलोक शर्मा",
  "AMAR SHARADRAO KALE": "अमर शरड्रओ कले",
  "AMARSING TISSO": "अमर्सिन्ग टिस्सो",
  "AMBICA G LAKSHMINARAYANA VALMIKI": "अम्बिcअ जी. लक्ष्मिनरयन वल्मिकि",
  "AMRARAM": "अम्ररम",
  "AMRINDER SINGH RAJA WARRING": "अम्रिन्डेर सिंह रज वर्रिन्ग",
  "ANAND BHADAURIYA": "अनन्ड भडौरिय",
  "ANAND KUMAR": "अनन्ड कुमार",
  "ANANTA NAYAK": "अनन्ट नयक",
  "ANDREW J. SYNGKON": "अन्ड्रेव जे.. स्य्न्ग्कोन",
  "ANGOMCHA BIMOL AKOIJAM": "अंगोमचा बिमोल अकोइजाम",
  "ANIL BALUNI": "अनिल बलुनि",
  "ANIL YESHWANT DESAI": "अनिल येश्वन्ट डेसै",
  "ANITA NAGARSINGH CHOUHAN": "अनिट नगर्सिन्घ चौहान",
  "ANITA SUBHADARSHINI": "अनिट सुभडर्शिनि",
  "ANOOP PRADHAN BALMIKI": "अनूप प्रधन बल्मिकि",
  "ANUP SANJAY DHOTRE": "अनुप संजय धोत्रे",
  "ARUN BHARTI": "अरुन भर्टि",
  "ARUN GOVIL": "अरुन गोविल",
  "ARUN NEHRU": "अरुन नेह्रु",
  "ARUNA. D. K": "अरुन. डी.. के.",
  "ARUP CHAKRABORTY": "अरूप चक्रवर्ती",
  "ASHISH DUBEY": "अशिश दुबे",
  "ATUL GARG": "अटुल गर्ग",
  "AVIMANYU SETHI": "अविमन्यु सेथि",
  "AWADHESH PRASAD": "अवधेश प्रसाद",
  "AZAD KIRTI JHA": "अज़ड किर्टि झ",
  "Abu Taher Khan": "अबु टहेर खन",
  "Adv Adoor Prakash": "अधिवक्ता अडूर प्रकाश",
  "Adv Dean Kuriakose": "अधिवक्ता डेअन कुरिअकोसे",
  "Ajay Bhatt": "अजय भट्ट",
  "Ajay Kumar Mandal": "अजय कुमार मन्डल",
  "Ajay Tamta": "अजय टम्ट",
  "Alok Kumar Suman": "अलोक कुमार सुमन",
  "Amol Ramsing Kolhe": "अमोल रम्सिन्ग कोल्हे",
  "Andimuthu Raja": "अन्डिमुथु रज",
  "Annpurna Devi": "अन्न्पुर्न देवी",
  "Anto Antony": "अन्टो अन्टोन्य",
  "Anurag Sharma": "अनुरग शर्मा",
  "Anurag Singh Thakur": "अनुरग सिंह थकुर",
  "Appalanaidu Kalisetti": "अप्पलनैडु कलिसेट्टि",
  "Arvind Dharmapuri": "अरविंद धर्मपुरी",
  "Arvind Ganpat Sawant": "अरविंद गन्पट सवन्ट",
  "Asaduddin Owaisi": "असदुद्दीन ओवैसी",
  "Ashok Kumar Rawat": "अशोक कुमार रवट",
  "Ashok Kumar Yadav": "अशोक कुमार यादव",
  "Asit Kumar Mal": "असिट कुमार मल",
  "B K PARTHASARATHI": "बी. के. पर्थसरथि",
  "BABU SINGH KUSHWAHA": "बाबू सिंह कुशवाहा",
  "BACHHAV SHOBHA DINESH": "बछव शोभ डिनेश",
  "BAG MITALI": "बग मिटलि",
  "BAIJAYANT PANDA": "बैजयन्ट पन्ड",
  "BAJRANG MANOHAR SONWANE": "बज्रन्ग मनोहर सोन्वने",
  "BALABHADRA MAJHI": "बलभड्र मझि",
  "BALRAM NAIK PORIKA": "बलराम नाइक पोरिका",
  "BALWANT BASWANT WANKHADE": "बल्वन्ट बस्वन्ट वन्खडे",
  "BALYA MAMA SURESH GOPINATH MHATRE": "बल्य मम सुरेश गोपिनथ म्हत्रे",
  "BAPI HALDAR": "बपि हल्डर",
  "BASAVARAJ BOMMAI": "बसवरज बोम्मै",
  "BASTIPATI NAGARAJU PANCHALINGALA": "बस्टिपटि नगरजु पन्चलिन्गल",
  "BHAJAN LAL JATAV": "भजन लाल जटव",
  "BHARAT SINGH KUSHWAH": "भरट सिंह कुश्वह",
  "BHARATBHAI MANUBHAI SUTARIYA": "भरट्भै मनुभै सुटरिय",
  "BHARTI PARDHI": "भर्टि पर्धि",
  "BHASKAR MURLIDHAR BHAGARE": "भस्कर मुर्लिधर भगरे",
  "BHAUSAHEB RAJARAM WAKCHAURE": "भौसहेब रजरम वक्चौरे",
  "BHOJRAJ NAG": "भोज्रज नग",
  "BHUMARE SANDIPANRAO ASARAM": "भुमरे सन्डिपन्रओ असरम",
  "BHUPENDER YADAV": "भुपेन्डेर यादव",
  "BIBHU PRASAD TARAI": "बिभु प्रसाद टरै",
  "BIJULI KALITA MEDHI": "बिजुलि कलिट मेधि",
  "BIPLAB KUMAR DEB": "बिप्लब कुमार डेब",
  "BISHNU PADA RAY": "बिश्नु पड रय",
  "BRIJENDRA SINGH OLA": "ब्रिजेन्ड्र सिंह ओल",
  "BRIJMOHAN AGRAWAL": "ब्रिज्मोहन अग्रवल",
  "BUNTY VIVEK SAHU": "बंटी विवेक साहू",
  "Balashowry Vallabbhaneni": "बलशोव्र्य वल्लब्भनेनि",
  "Bansuri Swaraj": "बन्सुरि स्वरज",
  "Bhagirath Chaudhary": "भगिरथ चौधर्य",
  "Bharatsinhji Shankarji Dabhi": "भरट्सिन्ह्जि शन्कर्जि डभि",
  "Bhola Singh": "भोल सिंह",
  "Bhupathiraju Srinivasa varma": "भुपथिरजु स्रिनिवस वर्म",
  "Bidyut Baran Mahato": "बिड्युट बरन महटो",
  "C R Patil": "सी.आर. पाटिल",
  "C.M.RAMESH": "c.म.रमेश",
  "CAPTAIN BRIJESH CHOWTA": "cअप्टैन ब्रिजेश चोव्ट",
  "CAPTAIN VIRIATO FERNANDES": "cअप्टैन विरिअटो फ़ेर्नन्डेस",
  "CHAMALA KIRAN KUMAR REDDY": "चमाला किरण कुमार रेड्डी",
  "CHANDAN CHAUHAN": "चन्डन चौहान",
  "CHANDRA SHEKHAR": "चंद्र शेखर",
  "CHANDUBHAI CHHAGANBHAI SHIHORA": "चन्डुभै छगन्भै शिहोर",
  "CHARANJIT SINGH CHANNI": "चरन्जिट सिंह चन्नि",
  "CHHATRA PAL SINGH GANGWAR": "छत्र पल सिंह गन्ग्वर",
  "CHHATRAPATI SHAHU SHAHAJI": "छत्रपटि शहु शहजि",
  "CHHOTELAL": "छोटेलाल",
  "CHINTAMANI MAHARAJ": "चिन्टमनि महरज",
  "CHIRAG PASWAN": "चिरग पस्वन",
  "CN Annadurai": "cन अन्नडुरै",
  "Chandra Prakash Joshi": "चंद्र प्रकाश जोशी",
  "D M Kathir Anand": "डी. एम. कथिर अनन्ड",
  "D Ravikumar": "डी. रविकुमर",
  "DAGGUMALLA PRASADA RAO": "डग्गुमल्ल प्रसड रओ",
  "DAMODAR AGARWAL": "डमोडर अगर्वल",
  "DAROGA PRASAD SAROJ": "डरोग प्रसाद सरोज",
  "DARSHAN SINGH CHOUDHARY": "डर्शन सिंह चौधरी",
  "DEEPENDER SINGH HOODA": "डीपेन्डेर सिंह हूड",
  "DEVESH CHANDRA THAKUR": "देवेश चंद्र थकुर",
  "DEVESH SHAKYA": "देवेश शाक्य",
  "DHANORKAR PRATIBHA SURESH ALIAS BALUBHAU": "धनोर्कर प्रटिभ सुरेश अलिअस बलुभौ",
  "DHARMENDRA PRADHAN": "धर्मेन्ड्र प्रधन",
  "DHARMENDRA YADAV": "धर्मेन्ड्र यादव",
  "DHAVAL LAXMANBHAI PATEL": "धवल लxमन्भै पटेल",
  "DINESHBHAI MAKWANA": "डिनेश्भै मक्वन",
  "DR BYREDDY SHABARI": "डॉ. ब्य्रेड्ड्य शबरि",
  "DR C N MANJUNATH": "डॉ. सी. एन. मन्जुनथ",
  "DR DHARAMVIRA GANDHI": "डॉ. धरम्विर गांधी",
  "DR KALGE SHIVAJI BANDAPPA": "डॉ. कल्गे शिवजि बन्डप्प",
  "DR RAJKUMAR SANGWAN": "डॉ. रज्कुमर सन्ग्वन",
  "DR RANI SRI KUMAR": "डॉ. रनि स्रि कुमार",
  "DR. HEMANG JOSHI": "डॉ.. हेमन्ग जोशी",
  "DR. HEMANT VISHNU SAVARA": "डॉ.. हेमन्ट विश्नु सवर",
  "DR. KIRSAN NAMDEO": "डॉ.. किर्सन नम्डेओ",
  "DR. LATA WANKHEDE": "डॉ.. लट वन्खेडे",
  "DR. M.P ABDUSSAMAD SAMADANI": "डॉ.. म.प अब्डुस्समड समडनि",
  "DR. MANSUKH MANDAVIYA": "डॉ.. मन्सुख मन्डविय",
  "DR. PRABHA MALLIKARJUN": "डॉ.. प्रभ मल्लिकर्जुन",
  "DR. PRADEEP KUMAR PANIGRAHY": "डॉ.. प्रडीप कुमार पनिग्रह्य",
  "DR. PRASHANT YADAORAO PADOLE": "डॉ.. प्रशन्ट यडओरओ पडोले",
  "DR. RAJ KUMAR CHABBEWAL": "डॉ.. रज कुमार चब्बेवल",
  "DR. RAJESH MISHRA": "डॉ.. रजेश मिश्रा",
  "DR. S P SINGH": "डॉ. एस.पी. सिंह",
  "DR. SHARMILA SARKAR": "डॉ.. शर्मिल सर्कर",
  "DR.K.SUDHAKAR": "ड्र.क.सुधकर",
  "DR.MALLU RAVI": "ड्र.मल्लु रवि",
  "DULU MAHATO": "डुलु महटो",
  "DURAI VAIKO": "डुरै वैको",
  "Daggubati Purandeshwari": "डग्गुबटि पुरन्डेश्वरि",
  "Devendra Alias Bhole Singh": "डेवेन्ड्र अलिअस भोले सिंह",
  "Devusinh Jesingbhai Chauhan": "देवुसिंह जेसिंगभाई चौहान",
  "Dhairyasheel Sambhajirao Mane": "धैर्यशील सम्भजिरओ मने",
  "Dileshwar Kamait": "डिलेश्वर कमैट",
  "Dilip Saikia": "डिलिप सैकिअ",
  "Dinesh Chandra Yadav": "डिनेश चंद्र यादव",
  "Dr Chandra Sekhar Pemmasani": "डॉ. चंद्र सेखर पेम्मसनि",
  "Dr Jayanta Kumar Roy": "डॉ. जयन्ट कुमार रोय",
  "Dr Mohammad Jawed": "डॉ. मोहम्मड जवेड",
  "Dr Shashi Tharoor": "डॉ. शशि थरूर",
  "Dr Sukanta Majumdar": "डॉ. सुकन्ट मजुम्डर",
  "Dr. Abhishek Manu Singhvi (2026-32)": "डॉ.. अभिशेक मनु सिन्घ्वि (२०२६-३२)",
  "Dr. Ajeet Madhavrao Gopchade (2024-30)": "डॉ.. अजीट मधव्रओ गोप्चडे (२०२४-३०)",
  "Dr. Anil Sukhdeorao Bonde (2022-28)": "डॉ.. अनिल सुख्डेओरओ बोन्डे (२०२२-२८)",
  "Dr. Ashok Kumar Mittal (2022-28)": "डॉ.. अशोक कुमार मिट्टल (२०२२-२८)",
  "Dr. Bhim Singh (2024-30)": "डॉ.. भिम सिंह (२०२४-३०)",
  "Dr. Dharmasthala Veerendra Heggade (2022-28)": "डॉ. धर्मस्थल वीरेंद्र हेगड़े (२०२२-२८)",
  "Dr. Dharmshila Gupta (2024-30)": "डॉ.. धर्म्शिल गुप्ता (२०२४-३०)",
  "Dr. Dinesh Sharma (2023-26)": "डॉ.. डिनेश शर्मा (२०२३-२६)",
  "Dr. Faiyaz Ahmad (2022-28)": "डॉ.. फ़ैयज़ अह्मड (२०२२-२८)",
  "Dr. John Brittas (2021-27)": "डॉ.. जोह्न ब्रिट्टस (२०२१-२७)",
  "Dr. K. Laxman (2022-28)": "डॉ. के. लक्ष्मण (२०२२-२८)",
  "Dr. Kalpana Saini (2022-28)": "डॉ.. कल्पन सैनि (२०२२-२८)",
  "Dr. Kavita Patidar (2022-28)": "डॉ.. कविट पटिडर (२०२२-२८)",
  "Dr. L. Murugan (2024-30)": "डॉ.. एल.. मुरुगन (२०२४-३०)",
  "Dr. Laxmikant Bajpayee (2022-28)": "डॉ.. लxमिकन्ट बज्पयी (२०२२-२८)",
  "Dr. M. Dhanapal (2025-31)": "डॉ.. एम.. धनपल (२०२५-३१)",
  "Dr. Medha Vishram Kulkarni (2024-30)": "डॉ.. मेध विश्रम कुल्कर्नि (२०२४-३०)",
  "Dr. Meenakshi Jain (2025-31)": "डॉ.. मीनक्षि जैन (२०२५-३१)",
  "Dr. Parmar Jashvantsinh Salamsinh (2024-30)": "डॉ.. पर्मर जश्वन्ट्सिन्ह सलम्सिन्ह (२०२४-३०)",
  "Dr. Radha Mohan Das Agrawal (2022-28)": "डॉ.. रध मोहन दास अग्रवल (२०२२-२८)",
  "Dr. Sandeep Kumar Pathak (2022-28)": "डॉ.. सन्डीप कुमार पथक (२०२२-२८)",
  "Dr. Sangeeta Balwant (2024-30)": "डॉ.. सन्गीट बल्वन्ट (२०२४-३०)",
  "Dr. Santrupt Misra (2026-32)": "डॉ.. सन्त्रुप्ट मिस्र (२०२६-३२)",
  "Dr. Sarfraz Ahmad (2024-30)": "डॉ.. सर्फ़्रज़ अह्मड (२०२४-३०)",
  "Dr. Sasmit Patra (2022-28)": "डॉ.. सस्मिट पात्रा (२०२२-२८)",
  "Dr. Sikander Kumar (2022-28)": "डॉ. सिकंदर कुमार (२०२२-२८)",
  "Dr. Sudhanshu Trivedi (2024-30)": "डॉ.. सुधन्शु त्रिवेडि (२०२४-३०)",
  "Dr. Syed Naseer Hussain (2024-30)": "डॉ.. स्येड नसीर हुस्सैन (२०२४-३०)",
  "Dr. V. Sivadasan (2021-27)": "डॉ.. वी.. सिवडसन (२०२१-२७)",
  "Dr. Vikramjit Singh Sahney (2022-28)": "डॉ.. विक्रम्जिट सिंह सह्नेय (२०२२-२८)",
  "Durga Das Uikey": "दुर्गा दास उइके",
  "Dushyant Singh": "डुश्यन्ट सिंह",
  "E. TUKARAM": "ई. तुकाराम",
  "E.T. MOHAMMED BASHEER": "ए.ट. मोहम्मेड बशीर",
  "EATALA RAJENDER": "एअटल रजेन्डेर",
  "ESWARASAMY K": "एस्वरसम्य के.",
  "Faggan Singh Kulaste": "फ़ग्गन सिंह कुलस्टे",
  "G. KUMAR NAIK": "जी.. कुमार नाइक",
  "GAIKWAD VARSHA EKNATH": "गैक्वड वर्श एक्नथ",
  "GANAPATHY RAJKUMAR P": "गनपथ्य रज्कुमर पी.",
  "GAURAV GOGOI": "गौरव गोगोइ",
  "GENIBEN NAGAJI THAKOR": "गेनिबेन नगजि थकोर",
  "GM Harish Balayogi": "ग्म हरिश बलयोगि",
  "GODAM NAGESH": "गोडम नगेश",
  "GOPINATH K": "गोपिनथ के.",
  "GOVIND MAKTHAPPA KARJOL": "गोविन्ड मक्थप्प कर्जोल",
  "GURMEET SINGH MEET HAYER": "गुर्मीट सिंह मीट हयेर",
  "Gajendra Singh Patel": "गजेन्ड्र सिंह पटेल",
  "Gajendra Singh Shekhawat": "गजेन्ड्र सिंह शेखवट",
  "Ganesan Selvam": "गणेशन सेल्वम",
  "Ganesh Singh": "गनेश सिंह",
  "Giridhari Yadav": "गिरिधरि यादव",
  "Giriraj Singh": "गिरिरज सिंह",
  "Gumma Thanuja Rani": "गुम्म थनुज रनि",
  "Gyaneshwar Patil": "ज्ञनेश्वर पटिल",
  "H.D. KUMARASWAMY": "ह.ड. कुमरस्वम्य",
  "HARENDRA SINGH MALIK": "हरेन्ड्र सिंह मलिक",
  "HARIBHAI PATEL": "हरीभाई पटेल",
  "Harsh Malhotra": "हर्ष मल्होत्र",
  "Hasmukh Bhai Soma Bhai Patel": "हस्मुख भै सोम भै पटेल",
  "IMRAN MASOOD": "इम्रन मसूड",
  "IQRA CHOUDHARY": "इक़्र चौधरी",
  "ISHA KHAN CHOUDHURY": "इश खन चोउधुर्य",
  "Indra Hang Subba": "इन्ड्र हन्ग सुब्ब",
  "JAGADISH CHANDRA BARMA BASUNIA": "जगडिश चंद्र बर्म बसुनिअ",
  "JAGADISH SHETTAR": "जगडिश शेट्टर",
  "JAI PARKASH": "जै पर्कश",
  "JASHUBHAI BHILUBHAI RATHVA": "जशुभै भिलुभै रथ्व",
  "JITAN RAM MANJHI": "जिटन राम मन्झि",
  "JITENDRA KUMAR DOHARE": "जितेंद्र कुमार दोहरे",
  "JITIN PRASADA": "जिटिन प्रसड",
  "JOBA MAJHI": "जोब मझि",
  "JOYANTA BASUMATARY": "जोयन्ट बसुमटर्य",
  "JUNE MALIAH": "जुने मलिअह",
  "JYOTIRADITYA M. SCINDIA": "ज्योतिरादित्य एम.. सिंधिया",
  "Jagannath Sarkar": "जगन्नथ सर्कर",
  "Jagdambika Pal": "जग्डम्बिक पल",
  "Jai Prakash": "जै प्रकाश",
  "Janardan Mishra": "जनर्डन मिश्रा",
  "Jaswantsinh Sumanbhai Bhabhor": "जस्वन्ट्सिन्ह सुमन्भै भभोर",
  "Jitendra Singh": "जितेंद्र सिंह",
  "Jyotsna Charandas Mahant": "ज्योट्स्न चरन्डस महन्ट",
  "K E PRAKASH": "के. ई. प्रकाश",
  "K RADHAKRISHNAN": "के. रधक्रिश्नन",
  "K Subbarayan": "के. सुब्बरयन",
  "K. C VENUGOPAL": "के.. सी. वेनुगोपल",
  "K. RAJASHEKAR BASAVARAJ HITNAL": "के.. रजशेकर बसवरज हिट्नल",
  "KADIYAM KAVYA": "कडियम कव्य",
  "KALI CHARAN MUNDA": "काली चरण मुन्ड",
  "KALI CHARAN SINGH": "काली चरण सिंह",
  "KALIPADA SAREN": "कलिपड सरेन",
  "KALYAN VAIJINATHRAO KALE": "कल्यन वैजिनथ्रओ कले",
  "KAMAKHYA PRASAD TASA": "कमख्य प्रसाद टस",
  "KAMLESH JANGDE": "कमलेश जांगड़े",
  "KANWAR SINGH TANWAR": "कन्वर सिंह टन्वर",
  "KARAN BHUSHAN SINGH": "करन भुशन सिंह",
  "KARTICK CHANDRA PAUL": "कर्टिcक चंद्र पौल",
  "KISHORI LAL": "किशोरी लाल",
  "KONDA VISHWESHWAR REDDY": "कोंडा विश्वेश्वर रेड्डी",
  "KOTA SRINIVAS POOJARY": "कोट स्रिनिवस पूजर्य",
  "KRISHNA DEVI SHIVSHANKER PATEL": "कृष्णा देवी शिवशंकर पटेल",
  "KRITI DEVI DEBBARMAN": "क्रिटि देवी डेब्बर्मन",
  "KULDEEP INDORA": "कुल्डीप इन्डोर",
  "KUNDURU RAGHUVEER": "कुन्डुरु रघुवीर",
  "Kakoli Ghosh Dastidar": "ककोलि घोश डस्टिडर",
  "Kalaben Mohanbhai Delkar": "कलबेन मोहन्भै डेल्कर",
  "Kalanidhi Veeraswamy": "कलनिधि वीरस्वम्य",
  "Kalyan Banerjee": "कल्यन बनर्जी",
  "Kamaljeet Sehrawat": "कमल्जीट सेह्रवट",
  "Kamlesh Paswan": "कमलेश पस्वन",
  "Kangana Ranaut": "कन्गन रनौट",
  "Kani K Navas": "कनि के. नवस",
  "Kanimozhi Karunanidhi": "कनिमोज़्हि करुननिधि",
  "Kaushalendra Kumar": "कौशलेन्ड्र कुमार",
  "Khagen Murmu": "खगेन मुर्मु",
  "Khalilur Rahaman": "खलिलुर रहमन",
  "Kinjarapu Ram Mohan Naidu": "किन्जरपु राम मोहन नैडु",
  "Kiren Rijiju": "किरेन रिजिजू",
  "Kirti Vardhan Singh": "कीर्ति वर्धन सिंह",
  "Kishan Reddy Gangapuram": "किशन रेड्डी गन्गपुरम",
  "Kripanath Mallah": "क्रिपनथ मल्लह",
  "Krishan Pal Gurjar": "क्रिशन पल गुर्जर",
  "Krishna Prasad Tenneti": "कृष्णा प्रसाद टेन्नेटि",
  "LALJI VERMA": "लल्जि वर्मा",
  "LAXMIKANT PAPPU NISHAD": "लxमिकन्ट पप्पु निषाद",
  "LOVELY ANAND": "लोवेल्य अनन्ड",
  "LUMBARAM": "लुम्बरम",
  "Lavu Sri Krishna Devarayalu": "लवु स्रि कृष्णा डेवरयलु",
  "M. MALLESH BABU": "एम.. मल्लेश बाबू",
  "M.K. VISHNUPRASAD": "म.क. विश्नुप्रसड",
  "MADHAVANENI RAGHUNANDAN RAO": "मधवनेनि रघुनन्डन रओ",
  "MAHESH KASHYAP": "महेश कश्यप",
  "MAHIMA KUMARI MEWAR": "महिम कुमरि मेवर",
  "MALAIYARASAN D": "मलैयारासन डी.",
  "MALVIKA DEVI": "मल्विक देवी",
  "MALVINDER SINGH KANG": "मल्विन्डेर सिंह कन्ग",
  "MANI. A.": "मनि. ए..",
  "MANISH JAISWAL": "मनिश जैस्वल",
  "MANISH TEWARI": "मनिश टेवरि",
  "MANJU SHARMA": "मन्जु शर्मा",
  "MANNA LAL RAWAT": "मन्न लाल रवट",
  "MANOHAR LAL": "मनोहर लाल",
  "MANOJ KUMAR": "मनोज कुमार",
  "MANOJ TIGGA": "मनोज टिग्ग",
  "MIAN ALTAF AHMAD": "मिअन अल्टफ़ अह्मड",
  "MOHIBBULLAH": "मोहिब्बुल्लह",
  "MOHITE PATIL DHAIRYASHEEL RAJSINH": "मोहिटे पटिल धैर्यशील रज्सिन्ह",
  "MUHAMMED HAMDULLAH SAYEED": "मुहम्मेड हम्डुल्लह सयीड",
  "MUKESHKUMAR CHANDRAKAANT DALAL": "मुकेश्कुमर चन्ड्रकान्ट डलल",
  "MURARI LAL MEENA": "मुररि लाल मीन",
  "MURASOLI S": "मुरसोलि एस.",
  "MURLIDHAR MOHOL": "मुर्लिधर मोहोल",
  "Maddila Gurumoorthy": "मड्डिल गुरुमूर्थ्य",
  "Magunta Sreenivasulu Reddy": "मगुन्ट स्रीनिवसुलु रेड्डी",
  "Mahendra Singh Solanky": "महेन्ड्र सिंह सोलन्क्य",
  "Mahesh Sharma": "महेश शर्मा",
  "Mala Rajya Laxmi Shah": "मल राज्य लxमि शाह",
  "Mala Roy": "मल रोय",
  "Manickam Tagore B": "मनिcकम टगोरे बी.",
  "Manoj Tiwari": "मनोज तिवारी",
  "Mansukhbhai Dhanjibhai Vasava": "मनसुखभाई धनजीभाई वसावा",
  "Midhun Reddy": "मिथुन रेड्डी",
  "Mitesh Rameshbhai Bakabhai Patel": "मितेश रमेशभाई बकाभाई पटेल",
  "Mohamed Haneefa": "मोहमेड हनीफ़",
  "Mr Gopal Jee Thakur": "म्र गोपल जी थकुर",
  "Ms Mahua Moitra": "म्स महुआ मोइत्र",
  "Ms. Dola Sen (2023-29)": "म्स. डोल सेन (२०२३-२९)",
  "Ms. Swati Maliwal (2024-30)": "म्स. स्वटि मलिवल (२०२४-३०)",
  "Mukesh Rajput": "मुकेश रज्पुट",
  "NABA CHARAN MAJHI": "नब चरण मझि",
  "NALIN SOREN": "नलिन सोरेन",
  "NARAYAN DAS AHIRWAR": "नरयन दास अहिर्वर",
  "NARAYAN TATU RANE": "नरयन टटु रने",
  "NARESH CHANDRA UTTAM PATEL": "नरेश चंद्र उट्टम पटेल",
  "NAVEEN JINDAL": "नवीन जिन्डल",
  "NEERAJ MAURYA": "नीरज मौर्य",
  "NILESH DNYANDEV LANKE": "निलेश ड्न्यन्डेव लन्के",
  "NIMUBEN JAYANTIBHAI BAMBHANIYA": "निमुबेन जयन्टिभै बम्भनिय",
  "Nishikant Dubey": "निशिकन्ट दुबे",
  "Nitin Jairam Gadkari": "नितिन जैरम गडकरी",
  "Nityanand Rai": "निट्यनन्ड रै",
  "Om Birla": "ओम बिर्ल",
  "Omprakash Bhupalsinh Alias Pawan Rajenimbalkar": "ओम्प्रकश भुपल्सिन्ह अलिअस पवन रजेनिम्बल्कर",
  "P C Mohan": "पी. सी. मोहन",
  "PARIMAL SUKLABAIDYA": "परिमल सुक्लबैड्य",
  "PARSHOTTAMBHAI RUPALA": "पर्शोट्टम्भै रुपल",
  "PARTHA BHOWMICK": "पर्थ भोव्मिcक",
  "PATEL UMESHBHAI BABUBHAI": "पटेल उमेश्भै बबुभै",
  "PATHAN YUSUF": "पथन युसुफ़",
  "PHANI BHUSAN CHOUDHURY": "फनि भुसन चोउधुर्य",
  "PRABHAKAR REDDY VEMIREDDY": "प्रभकर रेड्डी वेमिरेड्ड्य",
  "PRADEEP PUROHIT": "प्रडीप पुरोहिट",
  "PRANITI SUSHILKUMAR SHINDE": "प्रनिटि सुशिल्कुमर शिन्डे",
  "PRAVEEN PATEL": "प्रवीन पटेल",
  "PRIYA SAROJ": "प्रिया सरोज",
  "PRIYANKA SATISH JARKIHOLI": "प्रियन्क सटिश जर्किहोलि",
  "PUSHPENDRA SAROJ": "पुष्पेंद्र सरोज",
  "Pankaj Chowdhary": "पन्कज चोव्धर्य",
  "Parvatagouda Chandanagouda Gaddigoudar": "पर्वटगोउड चन्डनगोउड गड्डिगोउडर",
  "Piyush Vedprakash Goyal": "पियुश वेड्प्रकश गोयल",
  "Prabhubhai Nagarbhai Vasava": "प्रभुभै नगर्भै वसावा",
  "Pradan Baruah": "प्रडन बरुअह",
  "Pradeep Kumar Singh": "प्रडीप कुमार सिंह",
  "Pradyut Bordoloi": "प्रड्युट बोर्डोलोइ",
  "Pralhad Venkatesh Joshi": "प्रल्हड वेन्कटेश जोशी",
  "Prasun Banerjee": "प्रसुन बनर्जी",
  "Pratap Chandra Sarangi": "प्रटप चंद्र सरन्गि",
  "Prataprao Jadhav": "प्रटप्रओ जधव",
  "Pratima Mondal": "प्रटिम मोन्डल",
  "Praveen Khandelwal": "प्रवीन खन्डेल्वल",
  "Priyanka Gandhi Vadra": "प्रियन्क गांधी वड्र",
  "Prof SP Singh Baghel": "प्रोफेसर स्प सिंह बघेल",
  "Prof Sougata Ray": "प्रोफेसर सोउगट रय",
  "Prof. Manoj Kumar Jha (2024-30)": "प्रोफेसर. मनोज कुमार झ (२०२४-३०)",
  "Prof. Ram Gopal Yadav (2020-26)": "प्रोफेसर. राम गोपल यादव (२०२०-२६)",
  "Putta Mahesh Kumar": "पुट्ट महेश कुमार",
  "R.K. CHAUDHARY": "र.क. चौधर्य",
  "RABINDRA NARAYAN BEHERA": "रबिन्ड्र नरयन बेहेर",
  "RACHNA BANERJEE": "रच्न बनर्जी",
  "RADHAKRISHNA": "रधक्रिश्न",
  "RADHE SHYAM RATHIYA": "रधे श्यम रथिय",
  "RAHUL GANDHI": "राहुल गांधी",
  "RAHUL SINGH LODHI": "राहुल सिंह लोधि",
  "RAJ BHUSHAN CHOUDHARY": "रज भुशन चौधरी",
  "RAJ KUMAR ROAT": "रज कुमार रोअट",
  "RAJA RAM SINGH": "रज राम सिंह",
  "RAJABHAU": "रजभौ",
  "RAJEEV BHARDWAJ": "राजीव भारद्वाज",
  "RAJEEV RAI": "राजीव रै",
  "RAJESH RANJAN ALIAS PAPPU YADAV": "रजेश रन्जन अलिअस पप्पु यादव",
  "RAJESH VERMA": "रजेश वर्मा",
  "RAJPALSINH MAHENDRASINH JADAV": "राजपालसिंह महेंद्रसिंह जादव",
  "RAKESH RATHOR": "रकेश रथोर",
  "RAKIBUL HUSSAIN": "रकिबुल हुस्सैन",
  "RAM PRASAD CHAUDHARY": "राम प्रसाद चौधर्य",
  "RAMASAHAYAM RAGHURAM REDDY": "रमसहयम रघुरम रेड्डी",
  "RAMASHANKAR RAJBHAR": "रमशन्कर रज्भर",
  "RAMBHUAL NISHAD": "रम्भुअल निषाद",
  "RAMESH AWASTHI": "रमेश अवस्थि",
  "RANJIT DUTTA": "रन्जिट डुट्ट",
  "RAVINDRA DATTARAM WAIKAR": "रविन्ड्र डट्टरम वैकर",
  "RICHARD VANLALHMANGAIHA": "रिचर्ड वन्लल्ह्मन्गैह",
  "ROBERT BRUCE C": "रोबेर्ट ब्रुcए सी.",
  "ROOP KUMARI CHOUDHARY": "रूप कुमरि चौधरी",
  "RUCHI VIRA": "रुचि विर",
  "RUDRA NARAYAN PANY": "रुड्र नरयन पन्य",
  "Radha Mohan Singh": "रध मोहन सिंह",
  "Rahul Kaswan": "राहुल कस्वन",
  "Rajeshbhai Naranbhai Chudasama": "रजेश्भै नरन्भै चुडसम",
  "Rajiv Pratap Rudy": "रजिव प्रटप रुड्य",
  "Rajiv Ranjan (Lalan) Singh": "रजिव रन्जन (ललन) सिंह",
  "Rajkumar Chahar": "रज्कुमर चहर",
  "Rajnath Singh": "राजनाथ सिंह",
  "Raju Bista": "रजु बिस्ट",
  "Ram Shiromani": "राम शिरोमणि",
  "Ramesh Chandappa Jigajinagi": "रमेश चन्डप्प जिगजिनगि",
  "Ramprit Mandal": "रम्प्रिट मन्डल",
  "Ramvir Singh Bidhuri": "रम्विर सिंह बिधुरि",
  "Rao Inderjit Singh": "रओ इन्डेर्जिट सिंह",
  "Rao Rajendra Singh": "रओ रजेन्ड्र सिंह",
  "Ravi Shankar Prasad": "रवि शंकर प्रसाद",
  "Ravindra Shyamnarayan Alias Ravi Kishan Shukla": "रविन्ड्र श्यम्नरयन अलिअस रवि किशन शुक्ल",
  "Ravindra Vasantrao Chavan": "रविन्ड्र वसन्त्रओ चवन",
  "Rodmal Nagar": "रोड्मल नगर",
  "S SUPONGMEREN JAMIR": "एस. सुपोन्ग्मेरेन जमिर",
  "S Venkatesan": "एस. वेन्कटेसन",
  "S. Jagathrakshakan": "एस.. जगथ्रक्षकन",
  "SACHITHANANTHAM R": "सचिथनन्थम आर.",
  "SAGAR ESHWAR KHANDRE": "सगर एश्वर खन्ड्रे",
  "SALENG A SANGMA": "सलेन्ग ए. सन्ग्म",
  "SAMBIT PATRA": "संबित पात्रा",
  "SANATAN PANDEY": "सनटन पांडेय",
  "SANJAY DINA PATIL": "संजय डिन पटिल",
  "SANJNA JATAV": "सन्ज्न जटव",
  "SARABJEET SINGH KHALSA": "सरबजीत सिंह खालसा",
  "SATPAL BRAHAMCHARI": "सतपाल ब्रह्मचारी",
  "SAVITRI THAKUR": "सवित्रि थकुर",
  "SAYANI GHOSH": "सयनि घोश",
  "SELJA": "सेल्ज",
  "SELVAGANAPATHI T M": "सेल्वगनपथि टी. एम.",
  "SELVARAJ V": "सेल्वरज वी.",
  "SHAFI PARAMBIL": "शफ़ि परम्बिल",
  "SHAMBHAVI": "शम्भवि",
  "SHASHANK MANI": "शशन्क मनि",
  "SHER SINGH GHUBAYA": "शेर सिंह घुबाया",
  "SHIVMANGAL SINGH TOMAR": "शिव्मन्गल सिंह टोमर",
  "SHIVRAJ SINGH CHOUHAN": "शिव्रज सिंह चौहान",
  "SHOBHA KARANDLAJE": "शोभ करन्ड्लजे",
  "SHOBHANABEN MAHENDRASINH BARAIYA": "शोभनबेन महेंद्रसिंह बरैय",
  "SHREYAS. M. PATEL": "श्रेयस. एम.. पटेल",
  "SHRIMANT CHH UDAYANRAJE PRATAPSINHAMAHARAJ BHONSLE": "श्रिमन्ट छ उडयन्रजे प्रटप्सिन्हमहरज भोन्स्ले",
  "SK NURUL ISLAM": "एस.के. नुरुल इस्लाम",
  "SMITA UDAY WAGH": "स्मिट उडय वघ",
  "SUDAMA PRASAD": "सुदामा प्रसाद",
  "SUDHA R": "सुध आर.",
  "SUDHAKAR SINGH": "सुधकर सिंह",
  "SUKANTA KUMAR PANIGRAHI": "सुकन्ट कुमार पनिग्रहि",
  "SUKHDEO BHAGAT": "सुख्डेओ भगट",
  "SUKHJINDER SINGH RANDHAWA": "सुखजिंदर सिंह रंधावा",
  "SUNIL BOSE": "सुनिल बोसे",
  "SURENDRA PRASAD YADAV": "सुरेन्ड्र प्रसाद यादव",
  "SURESH GOPI": "सुरेश गोपि",
  "SURESH KUMAR SHETKAR": "सुरेश कुमार शेट्कर",
  "Sanjay Haribhau Jadhav": "संजय हरिभौ जधव",
  "Sanjay Kumar Bandi": "संजय कुमार बांडी",
  "Sanjay Seth": "संजय सेथ",
  "Sanjay Uttamrao Deshmukh": "संजय उट्टम्रओ डेश्मुख",
  "Santosh Pandey": "सन्टोश पांडेय",
  "Saptagiri Sankar Ulaka": "सप्तगिरि शंकर उलाका",
  "Sasikanth Senthil": "ससिकन्थ सेन्थिल",
  "Saumitra khan": "सौमित्र खन",
  "Shankar Lalwani": "शन्कर लल्वनि",
  "Shatrughan Sinha": "शत्रुघन सिन्ह",
  "Shri  Dharambir Singh": "श्री  धरम्बिर सिंह",
  "Shri A. A. Rahim (2022-28)": "श्री ए.. ए.. रहिम (२०२२-२८)",
  "Shri Abdul Wahab (2021-27)": "श्री अब्डुल वहब (२०२१-२७)",
  "Shri Abhishek Banerjee": "श्री अभिशेक बनर्जी",
  "Shri Aditya Prasad (2022-28)": "श्री अडिट्य प्रसाद (२०२२-२८)",
  "Shri Ajay Makan (2024-30)": "श्री अजय मकन (२०२४-३०)",
  "Shri Akhilesh Prasad Singh (2024-30)": "श्री अखिलेश प्रसाद सिंह (२०२४-३०)",
  "Shri Amar Pal Maurya (2024-30)": "श्री अमर पल मौर्य (२०२४-३०)",
  "Shri Amar Singh": "श्री अमर सिंह",
  "Shri Amit Shah": "श्री अमित शाह",
  "Shri Anil Firojiya": "श्री अनिल फ़िरोजिय",
  "Shri Anil Kumar Yadav Mandadi (2024-30)": "श्री अनिल कुमार यादव मन्डडि (२०२४-३०)",
  "Shri Arjun Ram Meghwal": "श्री अर्जुन राम मेघ्वल",
  "Shri Arun Kumar Sagar": "श्री अरुन कुमार सगर",
  "Shri Arun Singh (2020-26)": "श्री अरुन सिंह (२०२०-२६)",
  "Shri Ashok Singh (2024-30)": "श्री अशोक सिंह (२०२४-३०)",
  "Shri Ashokrao Shankarrao Chavan (2024-30)": "श्री अशोक्रओ शन्कर्रओ चवन (२०२४-३०)",
  "Shri Ashwini Vaishnaw (2024-30)": "श्री अश्विनी वैष्णव (२०२४-३०)",
  "Shri B Y Raghavendra": "श्री बी. वाई. रघवेन्ड्र",
  "Shri B. Parthasaradhi Reddy (2022-28)": "श्री बी.. पर्थसरधि रेड्डी (२०२२-२८)",
  "Shri B.L. Verma (2020-26)": "श्री बी.एल. वर्मा (२०२०-२६)",
  "Shri Babubhai Jesangbhai Desai (2023-29)": "श्री बबुभै जेसन्ग्भै डेसै (२०२३-२९)",
  "Shri Baburam Nishad (2022-28)": "श्री बाबूराम निषाद (२०२२-२८)",
  "Shri Balyogi Umeshnath (2024-30)": "श्री बल्योगि उमेश्नथ (२०२४-३०)",
  "Shri Banshilal Gurjar (2024-30)": "श्री बन्शिलल गुर्जर (२०२४-३०)",
  "Shri Benny Behanan": "श्री बेन्न्य बेहनन",
  "Shri Bhartruhari Mahtab": "श्री भर्तृहरि महताब",
  "Shri Bhashyam Rama Krishna (2026-32)": "श्री भश्यम रम कृष्णा (२०२६-३२)",
  "Shri Birendra Prasad Baishya (2025-31)": "श्री बिरेन्ड्र प्रसाद बैश्य (२०२५-३१)",
  "Shri Brij Lal (2020-26)": "श्री ब्रिज लाल (२०२०-२६)",
  "Shri C. Sadanandan Master (2025-31)": "श्री सी.. सडनन्डन मस्टेर (२०२५-३१)",
  "Shri Chandra Prakash Choudhary": "श्री चंद्र प्रकाश चौधरी",
  "Shri Chandrakant Damodar Handore (2024-30)": "श्री चन्ड्रकन्ट डमोडर हन्डोरे (२०२४-३०)",
  "Shri Chowdry Mohammad Ramzan (2025-31)": "श्री चोव्ड्र्य मोहम्मड रम्ज़न (२०२५-३१)",
  "Shri Chunnilal Garasiya (2024-30)": "श्री चुन्निलल गरसिय (२०२४-३०)",
  "Shri Damodar Rao Divakonda (2022-28)": "श्री डमोडर रओ डिवकोन्ड (२०२२-२८)",
  "Shri Debashish Samantaray (2026-30)": "श्री डेबशिश समन्टरय (२०२६-३०)",
  "Shri Deepak (Dev) Adhikari": "श्री डीपक (डेव) अधिकरि",
  "Shri Derek O' Brien (2023-29)": "श्री डेरेक ओ.' ब्रिएन (२०२३-२९)",
  "Shri Devendra Pratap Singh (2024-30)": "श्री डेवेन्ड्र प्रटप सिंह (२०२४-३०)",
  "Shri Dhananjay Bhimrao Mahadik (2022-28)": "श्री धनन्जय भिम्रओ महडिक (२०२२-२८)",
  "Shri Dilip Kumar Ray (2026-32)": "श्री डिलिप कुमार रय (२०२६-३२)",
  "Shri Dorjee Tshering Lepcha (2024-30)": "श्री डोर्जी ट्शेरिन्ग लेप्च (२०२४-३०)",
  "Shri G.C. Chandrashekhar (2024-30)": "श्री ग.c. चन्ड्रशेखर (२०२४-३०)",
  "Shri Ghanshyam Tiwari (2022-28)": "श्री घन्श्यम तिवारी (२०२२-२८)",
  "Shri Golla Baburao (2024-30)": "श्री गोल्ल बबुरओ (२०२४-३०)",
  "Shri Govindbhai Laljibhai Dholakia (2024-30)": "श्री गोविन्ड्भै लल्जिभै धोलकिअ (२०२४-३०)",
  "Shri Gulam Ali (2022-28)": "श्री गुलम अलि (२०२२-२८)",
  "Shri Gurjeet Singh Aujla": "श्री गुर्जीट सिंह औज्ल",
  "Shri Hanuman Beniwal": "श्री हनुमन बेनिवल",
  "Shri Harbhajan Singh (2022-28)": "श्री हर्भजन सिंह (२०२२-२८)",
  "Shri Hardeep Singh Puri (2020-26)": "श्री हरदीप सिंह पुरी (२०२०-२६)",
  "Shri Haris Beeran (2024-30)": "श्री हरिस बीरन (२०२४-३०)",
  "Shri Harsh Mahajan (2024-30)": "श्री हर्ष महाजन (२०२४-३०)",
  "Shri Harsh Vardhan Shringla (2025-31)": "श्री हर्ष वर्धन श्रिन्ग्ल (२०२५-३१)",
  "Shri Hibi Eden": "श्री हिबि एडेन",
  "Shri I.S. Inbadurai (2025-31)": "श्री इ.स. इन्बडुरै (२०२५-३१)",
  "Shri Ilaiyaraaja (2022-28)": "श्री इलैयराज (२०२२-२८)",
  "Shri Imran Pratapgarhi (2022-28)": "श्री इम्रन प्रटप्गर्हि (२०२२-२८)",
  "Shri Jagat Prakash Nadda (2024-30)": "श्री जगट प्रकाश नड्ड (२०२४-३०)",
  "Shri Jaggesh (2022-28)": "श्री जग्गेश (२०२२-२८)",
  "Shri Jairam Ramesh (2022-28)": "श्री जैरम रमेश (२०२२-२८)",
  "Shri Janardan Singh Sigriwal": "श्री जनर्डन सिंह सिग्रिवल",
  "Shri Javed Ali Khan (2022-28)": "श्री जवेड अलि खन (२०२२-२८)",
  "Shri Jayant Chaudhary (2022-28)": "श्री जयन्ट चौधर्य (२०२२-२८)",
  "Shri Jogen Mohan (2026-32)": "श्री जोगेन मोहन (२०२६-३२)",
  "Shri Jose K. Mani (2024-30)": "श्री जोसे के.. मनि (२०२४-३०)",
  "Shri Jual Oram": "श्री जुअल ओरम",
  "Shri Jugal Kishore Sharma": "श्री जुगल किशोरे शर्मा",
  "Shri Jyotirmay Singh Mahato": "श्री ज्योटिर्मय सिंह महटो",
  "Shri K.R.N. Rajeshkumar (2022-28)": "श्री क.र.न. रजेश्कुमर (२०२२-२८)",
  "Shri Kamal Haasan (2025-31)": "श्री कमल हासन (२०२५-३१)",
  "Shri Kanad Purkayastha (2025-31)": "श्री कनड पुर्कयस्थ (२०२५-३१)",
  "Shri Kapil Sibal (2022-28)": "श्री कपिल सिबल (२०२२-२८)",
  "Shri Karti P Chidambaram": "श्री कर्टि पी. चिडम्बरम",
  "Shri Kartikeya Sharma (2022-28)": "श्री कर्टिकेय शर्मा (२०२२-२८)",
  "Shri Kesridevsinh Jhala (2023-29)": "श्री केस्रिडेव्सिन्ह झल (२०२३-२९)",
  "Shri Khiangte Laltluangkima (2026-32)": "श्री खिअन्ग्टे लल्ट्लुअन्ग्किम (२०२६-३२)",
  "Shri Khiru Mahto (2022-28)": "श्री खिरु मह्टो (२०२२-२८)",
  "Shri Kumbakudi Sudhakaran": "श्री कुम्बकुडि सुधकरन",
  "Shri LS Tejasvi Surya": "श्री ल्स टेजस्वि सुर्य",
  "Shri Lahar Singh Siroya (2022-28)": "श्री लहर सिंह सिरोय (२०२२-२८)",
  "Shri Lingamaneni Ramesh (2026-32)": "श्री लिन्गमनेनि रमेश (२०२६-३२)",
  "Shri M K Raghavan": "श्री एम. के. रघवन",
  "Shri Madan Rathore (2024-30)": "श्री मडन रथोरे (२०२४-३०)",
  "Shri Mahendra Bhatt (2024-30)": "श्री महेन्ड्र भट्ट (२०२४-३०)",
  "Shri Manan Kumar Mishra (2024-28)": "श्री मनन कुमार मिश्रा (२०२४-२८)",
  "Shri Manas Ranjan Mangaraj (2022-28)": "श्री मनस रन्जन मन्गरज (२०२२-२८)",
  "Shri Mansoor Ali Khan (2026-32)": "श्री मन्सूर अलि खन (२०२६-३२)",
  "Shri Masthan Rao Yadav Beedha (2024-28)": "श्री मस्थन रओ यादव बीध (२०२४-२८)",
  "Shri Mayankkumar Nayak (2024-30)": "श्री मयन्क्कुमर नयक (२०२४-३०)",
  "Shri Meda Raghunadha Reddy (2024-30)": "श्री मेड रघुनध रेड्डी (२०२४-३०)",
  "Shri Milind Murli Deora (2024-30)": "श्री मिलिन्ड मुर्लि डेओर (२०२४-३०)",
  "Shri Mithlesh Kumar (2022-28)": "श्री मिथ्लेश कुमार (२०२२-२८)",
  "Shri Mohammed Nadimul Haque (2024-30)": "श्री मोहम्मेड नडिमुल हक़ुए (२०२४-३०)",
  "Shri Mukul Wasnik (2022-28)": "श्री मुकुल वस्निक (२०२२-२८)",
  "Shri NK Premachandran": "श्री न्क प्रेमचन्ड्रन",
  "Shri Nagendra Ray (2023-29)": "श्री नगेन्ड्र रय (२०२३-२९)",
  "Shri Narain Dass Gupta (2024-30)": "श्री नरैन डस्स गुप्ता (२०२४-३०)",
  "Shri Narayanasa K. Bhandage (2024-30)": "श्री नरयनस के.. भन्डगे (२०२४-३०)",
  "Shri Narendra Modi": "श्री नरेंद्र मोदी",
  "Shri Naresh Bansal (2020-26)": "श्री नरेश बन्सल (२०२०-२६)",
  "Shri Naveen Jain (2024-30)": "श्री नवीन जैन (२०२४-३०)",
  "Shri Neeraj Dangi (2026-32)": "श्री नीरज डन्गि (२०२६-३२)",
  "Shri Neeraj Shekhar (2020-26)": "श्री नीरज शेखर (२०२०-२६)",
  "Shri Nitin Laxmanrao Jadhav Patil (2024-28)": "श्री नितिन लxमन्रओ जधव पटिल (२०२४-२८)",
  "Shri P. Chidambaram (2022-28)": "श्री पी.. चिडम्बरम (२०२२-२८)",
  "Shri P. P. Suneer (2024-30)": "श्री पी.. पी.. सुनीर (२०२४-३०)",
  "Shri P. Wilson (2025-31)": "श्री पी.. विल्सोन (२०२५-३१)",
  "Shri PP Chaudhary": "श्री प्प चौधर्य",
  "Shri Pabitra Margherita (2022-28)": "श्री पबित्र मर्घेरिट (२०२२-२८)",
  "Shri Paka Venkata Satyanarayana (2025-28)": "श्री पक वेन्कट सट्यनरयन (२०२५-२८)",
  "Shri Pawan Khera (2026-32)": "श्री पवन खेर (२०२६-३२)",
  "Shri Pradip Kumar Varma (2024-30)": "श्री प्रडिप कुमार वर्म (२०२४-३०)",
  "Shri Praful Patel (2024-30)": "श्री प्रफ़ुल पटेल (२०२४-३०)",
  "Shri Pramod Boro (2026-32)": "श्री प्रमोड बोरो (२०२६-३२)",
  "Shri Pramod Tiwari (2022-28)": "श्री प्रमोड तिवारी (२०२२-२८)",
  "Shri Praveen Chakravarthy (2026-28)": "श्री प्रवीन चक्रवर्थ्य (२०२६-२८)",
  "Shri R. Dharmar (2022-28)": "श्री आर.. धर्मर (२०२२-२८)",
  "Shri R. Girirajan (2022-28)": "श्री आर.. गिरिरजन (२०२२-२८)",
  "Shri Raghav Chadha (2022-28)": "श्री रघव चध (२०२२-२८)",
  "Shri Rajeev Shukla (2022-28)": "श्री राजीव शुक्ल (२०२२-२८)",
  "Shri Rajib Bhattacharjee (2024-28)": "श्री रजिब भट्टचर्जी (२०२४-२८)",
  "Shri Rajmohan Unnithan": "श्री रज्मोहन उन्निथन",
  "Shri Ram Nath Thakur (2026-32)": "श्री राम नथ थकुर (२०२६-३२)",
  "Shri Ramdas Bandu Athawale (2026-32)": "श्री रम्डस बन्डु अथवले (२०२६-३२)",
  "Shri Ramji (2020-26)": "श्री रम्जि (२०२०-२६)",
  "Shri Ramji Lal Suman (2024-30)": "श्री रम्जि लाल सुमन (२०२४-३०)",
  "Shri Randeep Singh Surjewala (2022-28)": "श्री रन्डीप सिंह सुर्जेवल (२०२२-२८)",
  "Shri Ratanjit Pratap Narain Singh (2024-30)": "श्री रटन्जिट प्रटप नरैन सिंह (२०२४-३०)",
  "Shri Ravi Chandra Vaddiraju (2024-30)": "श्री रवि चंद्र वड्डिरजु (२०२४-३०)",
  "Shri Rwngwra Narzary (2022-28)": "श्री र्व्न्ग्व्र नर्ज़र्य (२०२२-२८)",
  "Shri Ryaga Krishnaiah (2024-28)": "श्री र्यग क्रिश्नैअह (२०२४-२८)",
  "Shri S Niranjan Reddy (2022-28)": "श्री एस. निरन्जन रेड्डी (२०२२-२८)",
  "Shri S. Jaishankar (2023-29)": "श्री एस.. जैशन्कर (२०२३-२९)",
  "Shri S. Kalyanasundaram (2022-28)": "श्री एस.. कल्यनसुन्डरम (२०२२-२८)",
  "Shri S. Selvaganabathy (2021-27)": "श्री एस.. सेल्वगनबथ्य (२०२१-२७)",
  "Shri S.R. Sivalingam (2025-31)": "श्री स.र. सिवलिन्गम (२०२५-३१)",
  "Shri Sadanand Mhalu Shet Tanavade (2023-29)": "श्री सदानंद शेट तनावड़े (२०२३-२९)",
  "Shri Sajjad Ahmad Kichloo (2025-31)": "श्री सज्जड अह्मड किच्लू (२०२५-३१)",
  "Shri Samik Bhattacharya (2024-30)": "श्री समिक भट्टचर्य (२०२४-३०)",
  "Shri Samirul Islam (2023-29)": "श्री समिरुल इस्लाम (२०२३-२९)",
  "Shri Sandosh Kumar P (2022-28)": "श्री सन्डोश कुमार पी. (२०२२-२८)",
  "Shri Sanjay Bhatia (2026-32)": "श्री संजय भटिअ (२०२६-३२)",
  "Shri Sanjay Kumar Jha (2024-30)": "श्री संजय कुमार झ (२०२४-३०)",
  "Shri Sanjay Raut (2022-28)": "श्री संजय रौट (२०२२-२८)",
  "Shri Sanjay Seth (2024-30)": "श्री संजय सेथ (२०२४-३०)",
  "Shri Sanjay Singh (2024-30)": "श्री संजय सिंह (२०२४-३०)",
  "Shri Sanjay Yadav (2024-30)": "श्री संजय यादव (२०२४-३०)",
  "Shri Sant Balbir Singh (2022-28)": "श्री संत बलबीर सिंह (२०२२-२८)",
  "Shri Sarbananda Sonowal (18LS)": "श्री सर्बनन्ड सोनोवल (१८ल्स)",
  "Shri Sat Paul Sharma (2025-31)": "श्री सट पौल शर्मा (२०२५-३१)",
  "Shri Satish Chandra Dubey (2022-28)": "श्री सटिश चंद्र दुबे (२०२२-२८)",
  "Shri Satish Kumar Gautam": "श्री सटिश कुमार गौटम",
  "Shri Satnam Singh Sandhu (2024-30)": "श्री सट्नम सिंह सन्धु (२०२४-३०)",
  "Shri Shambhu Sharan Patel (2022-28)": "श्री शम्भु शरन पटेल (२०२२-२८)",
  "Shri Shantanu Thakur": "श्री शन्टनु थकुर",
  "Shri Subhash Barala (2024-30)": "श्री सुभश बरल (२०२४-३०)",
  "Shri Subhasish Khuntia (2024-30)": "श्री सुभसिश खुन्टिअ (२०२४-३०)",
  "Shri Sudheer Gupta": "श्री सुधीर गुप्ता",
  "Shri Sujeet Kumar (2026-32)": "श्री सुजीट कुमार (२०२६-३२)",
  "Shri Surendra Singh Nagar (2022-28)": "श्री सुरेन्ड्र सिंह नगर (२०२२-२८)",
  "Shri Suresh Kodikunnil": "श्री सुरेश कोडिकुन्निल",
  "Shri Tapir Gao": "श्री टपिर गओ",
  "Shri Tejveer Singh (2024-30)": "श्री टेज्वीर सिंह (२०२४-३०)",
  "Shri Upendra Kushwaha (2026-32)": "श्री उपेन्ड्र कुशवाहा (२०२६-३२)",
  "Shri V. Vijayendra Prasad (2022-28)": "श्री वी.. विजयेन्ड्र प्रसाद (२०२२-२८)",
  "Shri Vivek K. Tankha (2022-28)": "श्री विवेक के. तंखा (२०२२-२८)",
  "Shri Yerram Venkata Subba Reddy (2024-30)": "श्री येर्रम वेन्कट सुब्ब रेड्डी (२०२४-३०)",
  "Shri vijayakumar Vasanth": "श्री विजयकुमर वसन्थ",
  "Shrikant Eknath Shinde": "श्रिकन्ट एक्नथ शिन्डे",
  "Shripad Yesso Naik": "श्रिपड येस्सो नाइक",
  "Shrirang Appa Barne": "श्रिरन्ग अप्प बर्ने",
  "Shyamkumar": "श्यम्कुमर",
  "Sivanath Kesineni": "सिवनथ केसिनेनि",
  "Smt Anupriya Patel": "श्रीमती अनुप्रिय पटेल",
  "Smt Aparajita Sarangi": "श्रीमती अपरजिट सरन्गि",
  "Smt Dimple Yadav": "श्रीमती डिम्प्ले यादव",
  "Smt Harsimrat Kaur Badal": "श्रीमती हर्सिम्रट कौर बडल",
  "Smt Hema Malini": "श्रीमती हेम मलिनि",
  "Smt Himadri Singh": "श्रीमती हिमड्रि सिंह",
  "Smt Poonamben Hematbhai Maadam": "श्रीमती पूनम्बेन हेमट्भै माडम",
  "Smt Raksha Nikhil Khadse": "श्रीमती रक्ष निखिल खड्से",
  "Smt S Jothimani": "श्रीमती एस. जोथिमनि",
  "Smt Sajda Ahmed": "श्रीमती सज्ड अह्मेड",
  "Smt Sandhya Ray": "श्रीमती सन्ध्य रय",
  "Smt Sangeeta Kumari Singh Deo": "श्रीमती सन्गीट कुमरि सिंह डेओ",
  "Smt Satabdi Roy (Banerjee)": "श्रीमती सटब्डि रोय (बनर्जी)",
  "Smt Supriya Sadanand Sule": "श्रीमती सुप्रिय सदानंद सुले",
  "Smt Veena Devi": "श्रीमती वीन देवी",
  "Smt. Adhikarimayum Sharda Devi (2026-32)": "श्रीमती. अधिकरिमयुम शर्ड देवी (२०२६-३२)",
  "Smt. Darshana Singh (2022-28)": "श्रीमती. डर्शन सिंह (२०२२-२८)",
  "Smt. Geeta alias Chandraprabha (2020-26)": "श्रीमती. गीट अलिअस चन्ड्रप्रभ (२०२०-२६)",
  "Smt. Jaya Amitabh Bachchan (2024-30)": "श्रीमती. जय अमिटभ बच्चन (२०२४-३०)",
  "Smt. Jebi Mather Hisham (2022-28)": "श्रीमती. जेबि मथेर हिशम (२०२२-२८)",
  "Smt. Laxmi Verma (2026-32)": "श्रीमती. लxमि वर्मा (२०२६-३२)",
  "Smt. Mahua Maji (2022-28)": "श्रीमती महुआ माजी (२०२२-२८)",
  "Smt. Mamata Thakur (2024-30)": "श्रीमती. ममट थकुर (२०२४-३०)",
  "Smt. Maya Chintaman Ivnate (2026-32)": "श्रीमती. मय चिन्टमन इव्नटे (२०२६-३२)",
  "Smt. Maya Naroliya (2024-30)": "श्रीमती. मय नरोलिय (२०२४-३०)",
  "Smt. Nirmala Sitharaman (2022-28)": "श्रीमती. निर्मल सीतारमण (२०२२-२८)",
  "Smt. P. T. Usha (2022-28)": "श्रीमती. पी.. टी.. उश (२०२२-२८)",
  "Smt. Phulo Devi Netam (2026-32)": "श्रीमती. फुलो देवी नेटम (२०२६-३२)",
  "Smt. Rajathi (2025-31)": "श्रीमती. रजथि (२०२५-३१)",
  "Smt. Ranjeet Ranjan (2022-28)": "श्रीमती. रन्जीट रन्जन (२०२२-२८)",
  "Smt. Rekha Sharma (2024-28)": "श्रीमती. रेख शर्मा (२०२४-२८)",
  "Smt. Renuka Chowdhury (2024-30)": "श्रीमती. रेनुक चोव्धुर्य (२०२४-३०)",
  "Smt. S. Phangnon Konyak (2022-28)": "श्रीमती. एस.. फन्ग्नोन कोन्यक (२०२२-२८)",
  "Smt. Sadhna Singh (2024-30)": "श्रीमती. सध्न सिंह (२०२४-३०)",
  "Smt. Sagarika Ghose (2024-30)": "श्रीमती. सगरिक घोसे (२०२४-३०)",
  "Smt. Sangeeta Yadav (2022-28)": "श्रीमती. सन्गीट यादव (२०२२-२८)",
  "Smt. Seema Dwivedi (2020-26)": "श्रीमती सीमा द्विवेदी (२०२०-२६)",
  "Smt. Sonia Gandhi (2024-30)": "श्रीमती. सोनिअ गांधी (२०२४-३०)",
  "Smt. Sudha Murty (2024-30)": "श्रीमती. सुध मुर्ट्य (२०२४-३०)",
  "Smt. Sulata Deo (2022-28)": "श्रीमती. सुलट डेओ (२०२२-२८)",
  "Smt. Sumitra Balmik (2022-28)": "श्रीमती. सुमित्र बल्मिक (२०२२-२८)",
  "Sribharat MathuKumli": "स्रिभरट मथुकुम्लि",
  "Sudip Bandyopadhyay": "सुडिप बन्ड्योपध्यय",
  "Sunil Dattatray Tatkare": "सुनिल डट्टत्रय टट्करे",
  "Sunil Kumar": "सुनिल कुमार",
  "Suresh Kumar Kashyap": "सुरेश कुमार कश्यप",
  "Swami Sachchidanandhari Sakshi ji Maharaj": "स्वमि सच्चिडनन्धरि सक्षि जि महरज",
  "T Sumathy (A) Thamizhachi Thangapandian": "टी. सुमथ्य (ए.) थमिज़्हचि थन्गपन्डिअन",
  "TANGELLA UDAY SRINIVAS": "टन्गेल्ल उडय स्रिनिवस",
  "TANUJ PUNIA": "टनुज पुनिअ",
  "TARIQ ANWAR": "टरिक़ अन्वर",
  "THANGA TAMILSELVAN": "थन्ग टमिल्सेल्वन",
  "THARANIVENTHAN M S": "थरनिवेन्थन एम. एस.",
  "TOKHAN SAHU": "टोखन साहू",
  "TRIVENDRA SINGH RAWAT": "त्रिवेन्ड्र सिंह रवट",
  "Thalikkottai Rajuthevar Baalu": "थलिक्कोट्टै रजुथेवर बालु",
  "Thiru Dayanidhi Maran": "थिरु डयनिधि मरन",
  "Thirumaa Valavan Thol": "थिरुमा वलवन थोल",
  "UJJWAL RAMAN SINGH": "उज्ज्वल रमन सिंह",
  "UMMEDA RAM BENIWAL": "उम्मेड राम बेनिवल",
  "UTKARSH VERMA MADHUR": "उत्कर्ष वर्मा मधुर",
  "V S Matheswaran": "वी. एस. मथेस्वरन",
  "V. SOMANNA": "वी.. सोमन्न",
  "VAMSI KRISHNA GADDAM": "वम्सि कृष्णा गड्डम",
  "VARUN CHAUDHRY": "वरुन चौध्र्य",
  "VIJAYLAKSHMI DEVI": "विजय्लक्ष्मि देवी",
  "VINOD KUMAR BIND": "विनोद कुमार बिंद",
  "VIRENDRA SINGH": "विरेन्ड्र सिंह",
  "VISHAL": "विशल",
  "VISHWESHWAR HEGDE KAGERI": "विश्वेश्वर हेग्डे कगेरि",
  "VIVEK THAKUR": "विवेक थकुर",
  "Vaithilingam Ve": "वैथिलिन्गम वे",
  "Vellalath Kochukrishnan Nair Sreekandan": "वेल्ललथ कोचुक्रिश्नन नैर स्रीकन्डन",
  "Vijay Baghel": "विजय बघेल",
  "Vijay Kumar Dubey": "विजय कुमार दुबे",
  "Vijay Kumar Hansdak": "विजय कुमार हन्स्डक",
  "Vinod Chavda": "विनोद चव्ड",
  "Virendra Kumar": "विरेन्ड्र कुमार",
  "Vishnu Dayal Ram": "विश्नु डयल राम",
  "Vishnu Dutt Sharma": "विश्नु डुट्ट शर्मा",
  "Y S Avinash Reddy": "वाई.एस. अविनाश रेड्डी",
  "YADUVEER KRISHNADATTA CHAMARAJA WADIYAR": "यडुवीर क्रिश्नडट्ट चमरज वडियर",
  "Yogendra Chandoliya": "योगेन्ड्र चन्डोलिय",
  "ZIA UR REHMAN": "ज़िअ उर रेह्मन",
  "S K NURUL ISLAM": "एस.के. नुरुल इस्लाम",
  "Shri Sadanand Mhalu Shet Tanavade": "श्री सदानंद शेट तनावड़े",
  "Y. S. Avinash Reddy": "वाई.एस. अविनाश रेड्डी",
  "E TUKARAM": "ई. तुकाराम",
  "MANOJ TIWARI": "मनोज तिवारी",
  "ARVIND DHARMAPURI": "अरविंद धर्मपुरी",
  "RAM SHIROMANI": "राम शिरोमणि",
  "Durga Das Uikey ": "दुर्गा दास उइके",
  "Gautam Gambhir": "गौतम गंभीर",
  "Gopal Jee Thakur": "गोपाल जी ठाकुर",
  "Mohammad Akbar Lone": "मोहम्मद अकबर लोन"
};

  // Sort dictionary entries by length descending for greedy matching
  const SORTED_ENTRIES = Object.entries(DICTIONARY).sort((a, b) => b[0].length - a[0].length);

  // Compile regexes with strict word boundaries
  const COMPILED_RULES = SORTED_ENTRIES.map(([en, hi]) => {
    const isAscii = /^[\x20-\x7E\s]+$/.test(en);
    const startBoundary = /^\w/.test(en) ? '\\b' : '';
    const endBoundary = /\w$/.test(en) ? '\\b' : '';
    return {
      en,
      hi,
      regex: isAscii ? new RegExp(startBoundary + escapeRegex(en) + endBoundary, 'gi') : null
    };
  });

  let currentLang = 'en';

  // District & IDA cleaner helper
  function cleanDistrictIDA(text) {
    if (!text || typeof text !== 'string') return text;
    let res = text;
    res = res.replace(/DISTRICT\s+MAGISTRATE|DISTRICT\s+MAGISTRAE/gi, 'जिलाधिकारी')
             .replace(/DEPUTY\s+COMMISSIONER/gi, 'उपायुक्त')
             .replace(/DISTRICT\s+COLLECTOR/gi, 'जिला कलेक्टर')
             .replace(/DISTRICT\s+PLANNING\s+OFFICER/gi, 'जिला योजना अधिकारी')
             .replace(/COMMISSIONER/gi, 'आयुक्त')
             .replace(/_IDA|_ida|MPLADS_ida|MPLADS_IDA/gi, '')
             .replace(/आयुक्तMCD/gi, 'आयुक्त एमसीडी ')
             .replace(/\s+/g, ' ');
    return res;
  }

  // ==========================================================
  // 4. RECURSIVE DOM NODE TRANSLATOR
  // ==========================================================
  function translateNode(node, lang) {
    if (!node) return;

    // Handle Text Nodes
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue;
      if (!text || !text.trim()) return;

      const trimmed = text.trim();

      if (lang === 'hi') {
        // Cache original English text
        if (!node._originalEnText) {
          node._originalEnText = text;
        }

        // Check exact match first
        if (DICTIONARY[trimmed]) {
          const lead = text.match(/^\s*/)[0];
          const trail = text.match(/\s*$/)[0];
          node.nodeValue = lead + DICTIONARY[trimmed] + trail;
          return;
        }

        let modified = text;

        // Clean IDA strings if present
        if (modified.includes('_IDA') || modified.includes('_ida') || modified.includes('DISTRICT')) {
          modified = cleanDistrictIDA(modified);
        }

        // Apply sorted phrase and token replacements with word boundaries
        for (let i = 0; i < COMPILED_RULES.length; i++) {
          const rule = COMPILED_RULES[i];
          if (rule.regex) {
            if (rule.regex.test(modified)) {
              modified = modified.replace(rule.regex, rule.hi);
            }
          } else if (modified.includes(rule.en)) {
            modified = modified.replaceAll(rule.en, rule.hi);
          }
        }

        // Convert Numbers & Financial Units to Devanagari numerals
        modified = toDevanagariNumerals(modified);

        // Transliterate any remaining English proper nouns/words so 0 English remains
        if (/[a-zA-Z]/.test(modified)) {
          modified = transliterateRemainingEnglish(modified);
        }

        node.nodeValue = modified;

      } else {
        // Restore pristine English
        if (node._originalEnText) {
          node.nodeValue = node._originalEnText;
        } else {
          let modified = text;
          modified = toEnglishNumerals(modified);
          node.nodeValue = modified;
        }
      }
      return;
    }

    // Skip scripts, styles, svgs
    const tag = (node.tagName || '').toLowerCase();
    if (tag === 'script' || tag === 'style' || tag === 'svg' || tag === 'noscript') {
      return;
    }

    // Handle Attributes (placeholder, title, aria-label)
    const attrs = ['placeholder', 'title', 'aria-label'];
    for (let a = 0; a < attrs.length; a++) {
      const attr = attrs[a];
      if (node.hasAttribute && node.hasAttribute(attr)) {
        const val = node.getAttribute(attr);
        if (val && val.trim()) {
          if (lang === 'hi') {
            if (!node[`_orig_${attr}`]) node[`_orig_${attr}`] = val;
            let newVal = val;
            for (let i = 0; i < COMPILED_RULES.length; i++) {
              const rule = COMPILED_RULES[i];
              if (rule.regex && rule.regex.test(newVal)) {
                newVal = newVal.replace(rule.regex, rule.hi);
              }
            }
            newVal = toDevanagariNumerals(newVal);
            if (/[a-zA-Z]/.test(newVal)) {
              newVal = transliterateRemainingEnglish(newVal);
            }
            node.setAttribute(attr, newVal);
          } else {
            if (node[`_orig_${attr}`]) {
              node.setAttribute(attr, node[`_orig_${attr}`]);
            }
          }
        }
      }
    }

    // Recursively traverse children
    let child = node.firstChild;
    while (child) {
      translateNode(child, lang);
      child = child.nextSibling;
    }
  }

  // ==========================================================
  // 5. APPLY FULL-PAGE TRANSLATION
  // ==========================================================
  function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    
    if (lang === 'hi') {
      document.body.classList.add('lang-hi');
    } else {
      document.body.classList.remove('lang-hi');
    }

    // Translate DOM
    translateNode(document.body, lang);

    // Update Language Switcher UI Buttons
    document.querySelectorAll('.lang-pill-btn').forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      if (btnLang === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Save Preference
    try {
      localStorage.setItem('satark_user_lang', lang);
    } catch (e) {}

    // Dispatch custom event for charts or dynamic components
    if (typeof window !== 'undefined' && window.dispatchEvent && typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent('satarkLanguageChanged', { detail: { language: lang } }));
    }
  }

  // ==========================================================
  // 6. GLOBAL PUBLIC API
  // ==========================================================
  window.setAppLanguage = function(lang) {
    if (lang !== 'en' && lang !== 'hi') lang = 'en';
    applyLanguage(lang);
  };

  window.getAppLanguage = function() {
    return currentLang;
  };

  window.translateNode = translateNode;
  window.toDevanagariNumerals = toDevanagariNumerals;
  window.toEnglishNumerals = toEnglishNumerals;
  window.transliterateRemainingEnglish = transliterateRemainingEnglish;

  // ==========================================================
  // 7. DYNAMIC CONTENT MUTATION OBSERVER
  // ==========================================================
  let observer = null;
  function initObserver() {
    if (typeof MutationObserver === 'undefined') return;
    if (observer) observer.disconnect();
    observer = new MutationObserver((mutations) => {
      if (currentLang !== 'hi') return;
      for (let m = 0; m < mutations.length; m++) {
        const mutation = mutations[m];
        for (let a = 0; a < mutation.addedNodes.length; a++) {
          const addedNode = mutation.addedNodes[a];
          if (addedNode.nodeType === Node.ELEMENT_NODE || addedNode.nodeType === Node.TEXT_NODE) {
            if (addedNode.classList && addedNode.classList.contains('header-lang-block')) continue;
            translateNode(addedNode, 'hi');
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // ==========================================================
  // 8. INITIALIZE ON LOAD
  // ==========================================================
  function init() {
    let saved = 'en';
    try {
      saved = localStorage.getItem('satark_user_lang') || 'en';
    } catch (e) {}

    initObserver();

    if (saved === 'hi') {
      applyLanguage('hi');
      setTimeout(() => applyLanguage('hi'), 250);
      setTimeout(() => applyLanguage('hi'), 800);
      setTimeout(() => applyLanguage('hi'), 1800);
    } else {
      applyLanguage('en');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
