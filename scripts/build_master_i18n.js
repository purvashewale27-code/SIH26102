const fs = require('fs');
const path = require('path');

const mpMap = JSON.parse(fs.readFileSync('scripts/generated_mp_map.json', 'utf8'));

// Base Master UI & Domain Dictionary
const MASTER_DICT = {
  // ==========================================================
  // 1. TOP BRANDING & MASTHEAD
  // ==========================================================
  'NATIONAL PUBLIC FUND FORENSIC PIPELINE · MOSPI · SOVEREIGN OVERSIGHT': 'राष्ट्रीय सार्वजनिक निधि फोरेंसिक पाइपलाइन · सांख्यिकी मंत्रालय · संप्रभु सतर्कता',
  'NATIONAL PUBLIC FUND FORENSIC PIPELINE': 'राष्ट्रीय सार्वजनिक निधि फोरेंसिक पाइपलाइन',
  'SOVEREIGN OVERSIGHT': 'संप्रभु सतर्कता एवं निरीक्षण',
  'भारत सरकार · भारत सरकार': 'भारत सरकार',
  'भारत सरकार - भारत सरकार': 'भारत सरकार',
  'भारत सरकार &middot; भारत सरकार': 'भारत सरकार',
  'भारत सरकार · GOVERNMENT OF INDIA': 'भारत सरकार',
  'भारत सरकार &middot; GOVERNMENT OF INDIA': 'भारत सरकार',
  'GOVERNMENT OF INDIA · MINISTRY OF STATISTICS & PROGRAMME IMPLEMENTATION': 'भारत सरकार · सांख्यिकी एवं कार्यक्रम कार्यान्वयन मंत्रालय',
  'GOVERNMENT OF INDIA': 'भारत सरकार',
  'Government of India': 'भारत सरकार',
  'MINISTRY OF STATISTICS & PROGRAMME IMPLEMENTATION (MOSPI)': 'सांख्यिकी एवं कार्यक्रम कार्यान्वयन मंत्रालय (सांख्यिकी मंत्रालय)',
  'Ministry of Statistics & Programme Implementation (MoSPI)': 'सांख्यिकी एवं कार्यक्रम कार्यान्वयन मंत्रालय (सांख्यिकी मंत्रालय)',
  'Ministry of Statistics & Programme Implementation': 'सांख्यिकी एवं कार्यक्रम कार्यान्वयन मंत्रालय',
  'Ministry of Statistics and Programme Implementation': 'सांख्यिकी एवं कार्यक्रम कार्यान्वयन मंत्रालय',
  'MINISTRY OF STATISTICS AND PROGRAMME IMPLEMENTATION': 'सांख्यिकी एवं कार्यक्रम कार्यान्वयन मंत्रालय',
  'Autonomous Public Fund Forensic Decision Intelligence': 'स्वायत्त सार्वजनिक निधि फोरेंसिक निर्णय आसूचना प्रणाली',
  'National Decision Intelligence for India\'s Public Funds': 'भारत की सार्वजनिक निधि हेतु राष्ट्रीय निर्णय आसूचना',
  'MPLADS-SATARK transforms national public fund monitoring from retrospective descriptive auditing into predictive, risk-aware decision intelligence for sovereign policymakers, district collectors, and citizens.': 'एमपीलैड्स-सतर्क संप्रभु नीति निर्माताओं, जिलाधिकारियों एवं नागरिकों हेतु सार्वजनिक निधि निगरानी को पश्चगामी ऑडिटिंग से भविष्यसूचक, जोखिम-सचेत निर्णय आसूचना में रूपांतरित करता है।',
  'ENTER FORENSIC COMMAND HUB': 'फोरेंसिक कमांड हब में प्रवेश करें',
  'Explore 13 Sentinels': '१३ प्रहरियों का अन्वेषण करें',
  'Explore 7 Sentinels': '७ प्रहरियों का अन्वेषण करें',
  'MONITORED WORKS': 'निगरानीधीन कार्य',
  'AUDITED DISBURSAL PORTFOLIO': 'संपरीक्षित संवितरण पोर्टफोलियो',
  'STATES & UNION TERRITORIES': 'राज्य एवं केंद्र शासित प्रदेश',
  'VIGILANCE ENGINES & PLATFORMS': 'सतर्कता इंजन एवं प्लेटफॉर्म',
  'Search Works': 'कार्य खोजें',
  'Proposal Simulator': 'प्रस्ताव सिमुलेटर',
  'Data Lineage & Ledger': 'डेटा वंशावली एवं लेजर',
  'भाषा / Language:': 'भाषा / Language:',
  'Language': 'भाषा',
  'English': 'English',
  'हिन्दी': 'हिन्दी',

  // ==========================================================
  // 2. TOP STICKY NAVIGATION BAR (ALL 15 PAGES)
  // ==========================================================
  'National Overview': 'राष्ट्रीय अवलोकन',
  'Forensic Engines': 'फोरेंसिक इंजन',
  '7 Autonomous Sentinel AI Engines': '७ स्वायत्त प्रहरी एआई इंजन',
  'MoSPI Audited': 'सांख्यिकी मंत्रालय संपरीक्षित',
  'Explainable AI': 'व्याख्या योग्य एआई (XAI)',
  'Proposal Sandbox': 'प्रस्ताव सैंडबॉक्स',
  'Trends & Velocity': 'प्रवृत्तियां एवं व्यय गति',
  'Work Explorer': 'कार्य अन्वेषक',
  'Audit Copilot': 'सतर्क-संवाद (कोपायलट)',
  'SATARK-SAMVAAD (सतर्क-संवाद)': 'सतर्क-संवाद (एआई ऑडिट कोपायलट)',
  'SATARK-SAMVAAD (Copilot)': 'सतर्क-संवाद (कोपायलट)',
  'Executive Action': 'सतर्क-कार्या (कार्रवाई)',
  'SATARK-KARYAA (सतर्क-कार्या)': 'सतर्क-कार्या (कार्यकारी कार्रवाई)',
  'Parliamentary Q&A': 'संसदीय प्रश्न ऑडिट',
  'PRASHNA-KAVACH (प्रश्न-कवच)': 'प्रश्न-कवच (संसदीय प्रश्न ऑडिट)',
  'Predictive Sentry': 'भविष्य-रेखा (पूर्वानुमान)',
  'BHAVISHYA-REKHA (भविष्य-रेखा)': 'भविष्य-रेखा (विलंब एवं जोखिम मॉडल)',
  'SIH Presentation': 'एस.आई.एच. प्रस्तुति',
  'SIH Presentation Guide': 'एस.आई.एच. प्रस्तुति गाइड',
  'Master Guide': 'मुख्य मार्गदर्शिका',

  // Sentinels in Navigation Dropdown
  'S-01': 'एस-०१',
  'S-02': 'एस-०२',
  'S-03': 'एस-०३',
  'S-04': 'एस-०४',
  'S-05': 'एस-०५',
  'S-06': 'एस-०६',
  'S-07': 'एस-०७',
  'VIDHI-KAVACH (विधि-कवच)': 'विधि-कवच (सांविधिक अनुपालन एवं निषेध सूची)',
  'Statutory Compliance & Negative List': 'सांविधिक अनुपालन एवं निषेध सूची',
  'PUNAR-DRISHTI (पुनर्दृष्टि)': 'पुनर्दृष्टि (दोहरे दावे एवं क्लोन कार्य)',
  'NLP Duplicate Claims & Twin Works': 'एनएलपी दोहरे दावे एवं क्लोन कार्य',
  'ARTHA-DARPAN (अर्थ-दर्पण)': 'अर्थ-दर्पण (लागत मानक एवं मूल्य वृद्धि)',
  'CPWD Rate Benchmark & Cost Inflation': 'सीपीडब्ल्यूडी दर मानक एवं मूल्य वृद्धि',
  'CHAKRA-VYUH (चक्रव्यूह)': 'चक्रव्यूह (ठेकेदार सिंडिकेट एवं साठगांठ)',
  'Contractor Cartel & Vendor Nexus': 'ठेकेदार सिंडिकेट एवं विक्रेता साठगांठ',
  'VIBHED-NETRA (विभेद-नेत्र)': 'विभेद-नेत्र (१२-आयामी विसंगति संसूचक)',
  '12D Isolation Forest Outlier Sentry': '१२-आयामी आइसोलेशन फॉरेस्ट विसंगति प्रहरी',
  '12-D Isolation Forest Outlier': '१२-आयामी आइसोलेशन फॉरेस्ट विसंगति प्रहरी',
  'SANKHYA-SATYA (संख्या-सत्य)': 'संख्या-सत्य (बेनफोर्ड गणित एवं निविदा विभाजन)',
  'Benford Digit Law & Tender Splitting': 'बेनफोर्ड अंक नियम एवं निविदा विभाजन',
  'BHU-DRISHTI (भू-दृष्टि)': 'भू-दृष्टि (उपग्रह एवं भू-स्थानिक ऑडिट)',
  'Geospatial GIS & Satellite Asset Verification': 'भू-स्थानिक जीआईएस एवं उपग्रह परिसंपत्ति सत्यापन',

  // ==========================================================
  // 3. SENTINEL HEADERS & HERO BANNERS (EXACT MATCH FOR SCREENSHOTS 2, 3, 5)
  // ==========================================================
  // S-01: VIDHI-KAVACH
  'SENTINEL S-01: VIDHI-KAVACH (विधि-कवच — STATUTORY POLICY SHIELD)': 'प्रहरी एस-०१: विधि-कवच (सांविधिक नीति ढाल)',
  'SENTINEL S-01: VIDHI-KAVACH (विधि-कवच — Statutory Policy Shield)': 'प्रहरी एस-०१: विधि-कवच (सांविधिक नीति ढाल)',
  'SENTINEL S-01: VIDHI-KAVACH (विधि-कवच — सांविधिक नीति ढाल)': 'प्रहरी एस-०१: विधि-कवच (सांविधिक नीति ढाल)',
  'STATUTORY POLICY SHIELD': 'सांविधिक नीति ढाल',
  'Statutory Policy Shield': 'सांविधिक नीति ढाल',
  'Statutory Rule Compliance & Negative List Sentry': 'सांविधिक नियम अनुपालन एवं निषेध सूची प्रहरी',
  'Annexure-I Negative List & GFR 62 March Rush Sentry': 'अनुलग्नक-१ निषेध सूची एवं जीएफआर ६२ मार्च रश प्रहरी',
  'Auditing 176,925 works strictly against MoSPI MPLADS Guidelines 2023 Statutory Rules': 'सांख्यिकी मंत्रालय एमपीलैड्स दिशानिर्देश २०२३ के सांविधिक नियमों के विरुद्ध १,७६,९२५ कार्यों की सख्त जांच',
  'Auditing 176,925 works strictly against MoSPI MPLADS Guidelines 2023 (Annexure-I Prohibited Works) & GFR Rule 62': 'सांख्यिकी मंत्रालय एमपीलैड्स दिशानिर्देश २०२३ (अनुलग्नक-१ निषिद्ध कार्य) एवं जीएफआर नियम ६२ के अनुसार १,७६,९२५ कार्यों की सख्त जांच',
  'VIDHI-KAVACH (विधि-कवच) Live in Action': 'विधि-कवच (सांविधिक नीति ढाल) सक्रिय निरीक्षण',
  'Statutory Breaches Flagged': 'चिह्नित सांविधिक उल्लंघन',
  'Total Real Government Works': 'कुल वास्तविक सरकारी कार्य',
  'Total Works Audited': 'कुल संपरीक्षित कार्य',
  'WORKS AUDITED': 'संपरीक्षित कार्य',
  'Works Audited': 'संपरीक्षित कार्य',
  '100% Nationwide MoSPI eSAKSHI Data': '१००% राष्ट्रव्यापी सांख्यिकी मंत्रालय ई-साक्षी डेटा',
  'Nationwide MoSPI eSAKSHI Data': 'राष्ट्रव्यापी सांख्यिकी मंत्रालय ई-साक्षी डेटा',
  '100% Compliant Works': '१००% सांविधिक अनुपालित कार्य',
  'STATUTORILY COMPLIANT': 'सांविधिक रूप से अनुपालित',
  'Statutorily Compliant': 'सांविधिक रूप से अनुपालित',
  'Zero statutory breaches detected': 'शून्य सांविधिक उल्लंघन संसूचित',
  'Zero statutory violations detected': 'शून्य सांविधिक उल्लंघन संसूचित',
  'NEGATIVE LIST BREACHES': 'निषेध सूची उल्लंघन',
  'Negative List Breaches': 'निषेध सूची उल्लंघन',
  'Negative List Violations': 'निषेध सूची उल्लंघन',
  'Places of worship & commercial trusts': 'पूजा स्थल एवं व्यावसायिक न्यास',
  'Places of worship & religious structures': 'पूजा स्थल एवं धार्मिक संरचनाएं',
  'Prohibited places of worship & commercial trusts': 'निषिद्ध पूजा स्थल एवं व्यावसायिक न्यास',
  'MARCH RUSH VIOLATIONS': 'मार्च रश नियम उल्लंघन',
  'March Rush Violations': 'मार्च रश नियम उल्लंघन',
  'March Rush (GFR 62)': 'मार्च रश (जीएफआर ६२)',
  'March Rush (GFR ६२)': 'मार्च रश (जीएफआर ६२)',
  'Sanctioned in final 10 days of March (GFR 62)': 'मार्च के अंतिम १० दिनों में स्वीकृत (जीएफआर ६२)',
  'All Statutory Red Flags': 'सभी सांविधिक रेड फ्लैग',
  'Statutorily Compliant Works': 'सांविधिक रूप से अनुपालित कार्य',
  'All 176,925 Works': 'सभी १,७६,९२५ कार्य',

  // S-02: PUNAR-DRISHTI (SCREENSHOT 3)
  'SENTINEL S-02: PUNAR-DRISHTI (पुनर्दृष्टि — NLP DUPLICATE SENTRY)': 'प्रहरी एस-०२: पुनर्दृष्टि (एनएलपी डुप्लिकेट प्रहरी)',
  'SENTINEL S-02: PUNAR-DRISHTI (पुनर्दृष्टि — NLP Duplicate Sentry)': 'प्रहरी एस-०२: पुनर्दृष्टि (एनएलपी डुप्लिकेट प्रहरी)',
  'SENTINEL S-02: PUNAR-DRISHTI (पुनर्द्दष्टि — NLP DUPLICATE SENTRY)': 'प्रहरी एस-०२: पुनर्दृष्टि (एनएलपी डुप्लिकेट प्रहरी)',
  'SENTINEL एस-०२: PUNAR-DRISHTI (पुनर्द्दष्टि — NLP DUPLICATE SENTRY)': 'प्रहरी एस-०२: पुनर्दृष्टि (एनएलपी डुप्लिकेट प्रहरी)',
  'SENTINEL एस-०२: PUNAR-DRISHTI (पुनर्दृष्टि — NLP DUPLICATE SENTRY)': 'प्रहरी एस-०२: पुनर्दृष्टि (एनएलपी डुप्लिकेट प्रहरी)',
  'प्रहरी एस-०२: पुनर्द्दष्टि (एनएलपी डुप्लिकेट प्रहरी)': 'प्रहरी एस-०२: पुनर्दृष्टि (एनएलपी डुप्लिकेट प्रहरी)',
  'NLP DUPLICATE SENTRY': 'एनएलपी डुप्लिकेट प्रहरी',
  'NLP Duplicate Sentry': 'एनएलपी डुप्लिकेट प्रहरी',
  'NLP': 'एनएलपी',
  'DUPLICATE SENTRY': 'डुप्लिकेट प्रहरी',
  'Duplicate Sentry': 'डुप्लिकेट प्रहरी',
  'Cr': 'करोड़',
  'Cr.': 'करोड़',
  'Crore': 'करोड़',
  'Crores': 'करोड़',
  'Lakh': 'लाख',
  'Lakhs': 'लाख',
  'Cross-Work Lexical NLP Twin Work & Double-Billing Sentry': 'क्रॉस-कार्य शाब्दिक एनएलपी क्लोन कार्य एवं दोहरा-बिलिंग प्रहरी',
  "Vaibhav's TF-IDF & Cosine Similarity Engine identifying identical work descriptions and duplicate billing claims across India": 'वैभव का टीएफ-आईडीएफ एवं कोसाइन समानता इंजन - संपूर्ण भारत में एक समान कार्य विवरणों और दोहरे बिलिंग दावों की पहचान',
  "Vaibhav's TF-IDF & Cosine Similarity Engine identifying identical कार्य का विवरणs and duplicate billing claims across India": 'वैभव का टीएफ-आईडीएफ एवं कोसाइन समानता इंजन - संपूर्ण भारत में एक समान कार्य विवरणों और दोहरे बिलिंग दावों की पहचान',
  "Vaibhav's TF-IDF & Cosine Similarity Engine detecting duplicate project claims across India": 'वैभव का टीएफ-आईडीएफ एवं कोसाइन समानता इंजन - संपूर्ण भारत में दोहरे परियोजना दावों की पहचान',
  'Duplicate Claims (6,965 Clones)': 'दोहरे दावे (६,९६५ क्लोन)',
  'Duplicate Claims (६,९६५ Clones)': 'दोहरे दावे (६,९६५ क्लोन)',
  'TOTAL WORKS SCANNED': 'कुल संपरीक्षित कार्य',
  'Total Works Scanned': 'कुल संपरीक्षित कार्य',
  'Across all 36 States & UTs': 'सभी ३६ राज्य एवं केंद्र शासित प्रदेश',
  'DUPLICATE CLAIMS FLAGGED': 'चिह्नित दोहरे दावे',
  'Duplicate Claims Flagged': 'चिह्नित दोहरे दावे',
  'Cross-work twin assets in district': 'जिले में दोहरी संपत्ति',
  '100% EXACT CLONES': '१००% हूबहू क्लोन',
  '100% Exact Clones': '१००% हूबहू क्लोन',
  'Identical work descriptions in district': 'जिले में एक समान कार्य विवरण',
  'Identical कार्य का विवरणs in district': 'जिले में एक समान कार्य विवरण',
  'NEAR-CLONES (85%–99%)': 'निकट-क्लोन कार्य (८५%-९९%)',
  'NEAR-CLONES (८५%-९९%)': 'निकट-क्लोन कार्य (८५%-९९%)',
  'Near-Clones (85%–99%)': 'निकट-क्लोन कार्य (८५%-९९%)',
  'Near-Clones (८५%-९९%)': 'निकट-क्लोन कार्य (८५%-९९%)',
  'Slight variations in title phrasing': 'शीर्षक में मामूली भिन्नता',
  'All Duplicate Claims': 'सभी दोहरे दावे',
  '100% Exact Title Clones': '१००% हूबहू शीर्षक क्लोन',
  'Near-Clones (85%–99%)': 'निकट-क्लोन (८५%-९९%)',
  'All 176,925 Scanned Works': 'सभी १,७६,९२५ संपरीक्षित कार्य',
  'All १७६,९२५ Scanned Works': 'सभी १,७६,९२५ संपरीक्षित कार्य',
  'PUNAR-DRISHTI (पुनर्दृष्टि) Live in Action': 'पुनर्दृष्टि (दोहरे दावे एवं क्लोन कार्य) सक्रिय निरीक्षण',
  'Duplicate Sentry Analysis (PUNAR-DRISHTI)': 'दोहरा कार्य प्रहरी विश्लेषण (पुनर्दृष्टि)',
  '(PUNAR-DRISHTI)': '(पुनर्दृष्टि)',

  // S-03: ARTHA-DARPAN (SCREENSHOT 5)
  'SENTINEL S-03: ARTHA-DARPAN (अर्थ-दर्पण — CPWD COST BENCHMARK)': 'प्रहरी एस-०३: अर्थ-दर्पण (सीपीडब्ल्यूडी लागत मानक)',
  'SENTINEL S-03: ARTHA-DARPAN (अर्थ-दर्पण — COST INTEGRITY SENTRY)': 'प्रहरी एस-०३: अर्थ-दर्पण (लागत सत्यनिष्ठा प्रहरी)',
  'SENTINEL S-03: ARTHA-DARPAN (अर्थ-दर्पण — AI Cost Benchmark & Overpricing Sentry)': 'प्रहरी एस-०३: अर्थ-दर्पण (एआई लागत मानक एवं अधिमूल्यन प्रहरी)',
  'SENTINEL S-03: ARTHA-DARPAN (अर्थ-दर्पण — AI COST BENCHMARK & OVERPRICING SENTRY)': 'प्रहरी एस-०३: अर्थ-दर्पण (एआई लागत मानक एवं अधिमूल्यन प्रहरी)',
  'SENTINEL एस-०३: ARTHA-DARPAN (अर्थ-दर्पण — COST INTEGRITY SENTRY)': 'प्रहरी एस-०३: अर्थ-दर्पण (लागत सत्यनिष्ठा प्रहरी)',
  'SENTINEL एस-०३: ARTHA-DARPAN (अर्थ-दर्पण — AI COST BENCHMARK & OVERPRICING SENTRY)': 'प्रहरी एस-०३: अर्थ-दर्पण (एआई लागत मानक एवं अधिमूल्यन प्रहरी)',
  'SENTINEL एस-०३: ARTHA-DARPAN (अर्थ-दर्पण — AI COST BENCHमार्चK & OVERPRICING SENTRY)': 'प्रहरी एस-०३: अर्थ-दर्पण (एआई लागत मानक एवं अधिमूल्यन प्रहरी)',
  'CPWD Schedule of Rates Benchmark & Cost Inflation Sentry': 'सीपीडब्ल्यूडी दर अनुसूची (डीएसआर) मानक एवं लागत मुद्रास्फीति प्रहरी',
  'CPWD Schedule / Rates Benchmark & Cost Inflation Sentry': 'सीपीडब्ल्यूडी दर अनुसूची (डीएसआर) मानक एवं लागत मुद्रास्फीति प्रहरी',
  'CPWD Schedule / Rates Benchमार्चk & Cost Inflation Sentry': 'सीपीडब्ल्यूडी दर अनुसूची (डीएसआर) मानक एवं लागत मुद्रास्फीति प्रहरी',
  'CPWD Schedule of Rates (DSR) & Statistical Peer-Group Benchmark Analyzer': 'सीपीडब्ल्यूडी दर अनुसूची (डीएसआर) एवं सांख्यिकीय समकक्ष-समूह मानक विश्लेषक',
  'CPWD Schedule / Rates (DSR) & Statistical Peer-Group Benchmark Analyzer': 'सीपीडब्ल्यूडी दर अनुसूची (डीएसआर) एवं सांख्यिकीय समकक्ष-समूह मानक विश्लेषक',
  'CPWD Schedule / Rates (DSR) & Statistical Peer-Group Benchमार्चk Analyzer': 'सीपीडब्ल्यूडी दर अनुसूची (डीएसआर) एवं सांख्यिकीय समकक्ष-समूह मानक विश्लेषक',
  'Calibrated with 108 State-Category CPWD Delhi Schedule of Rates (DSR 2023-24) to flag unjustified cost escalations': 'अनुचित लागत वृद्धि को चिह्नित करने हेतु १०८ राज्य-श्रेणी सीपीडब्ल्यूडी दिल्ली दर अनुसूची (डीएसआर २०२३-२४) से अंशांकित',
  'Calibrated with 178 State-Category CPWD Delhi Schedule of Rates (DSR 2023-24) to flag unjustified cost escalations': 'अनुचित लागत वृद्धि को चिह्नित करने हेतु १७८ राज्य-श्रेणी सीपीडब्ल्यूडी दिल्ली दर अनुसूची (डीएसआर २०२३-२४) से अंशांकित',
  'Calibrated with १७८ State-Category CPWD दिल्ली Schedule / Rates (DSR २०२३-२४) to flag unjustified cost escalations': 'अनुचित लागत वृद्धि को चिह्नित करने हेतु १७८ राज्य-श्रेणी सीपीडब्ल्यूडी दिल्ली दर अनुसूची (डीएसआर २०२३-२४) से अंशांकित',
  'Flagged Excess Overrun Risk': 'चिह्नित अतिरिक्त लागत जोखिम',
  'TOTAL WORKS EVALUATED': 'कुल मूल्यांकित कार्य',
  'Total Works Evaluated': 'कुल मूल्यांकित कार्य',
  'Calibrated against CPWD Rates': 'सीपीडब्ल्यूडी दरों के विरुद्ध अंशांकित',
  'COST ANOMALIES FLAGGED': 'चिह्नित लागत विसंगतियां',
  'Cost Anomalies Flagged': 'चिह्नित लागत विसंगतियां',
  'Deviating from peer benchmarks': 'समकक्ष मानकों से विचलित',
  'Deviating from peer benchमार्चks': 'समकक्ष मानकों से विचलित',
  'CRITICAL INFLATION (+100%+)': 'अति-गंभीर मुद्रास्फीति (+१००%+)',
  'Critical Inflation (+100%+)': 'अति-गंभीर मुद्रास्फीति (+१००%+)',
  'अति-गंभीर INFLATION (+१००%+)': 'अति-गंभीर मुद्रास्फीति (+१००%+)',
  'Sanctioned at ≥ 2x peer median': 'समकक्ष मध्यिका से ≥ २ गुना पर स्वीकृत',
  'TOTAL EXCESS COST RISK': 'कुल अतिरिक्त लागत जोखिम',
  'Total Excess Cost Risk': 'कुल अतिरिक्त लागत जोखिम',
  'Cumulative price-padding risk flagged': 'संचयी मूल्य-वृद्धि जोखिम चिह्नित',
  'Auditing project budgets against State DSR Multipliers and category peer medians to prevent treasury overbilling': 'राजकोषीय अधिमूल्यन रोकने हेतु राज्य डीएसआर गुणकों एवं श्रेणी समकक्ष मध्यिकाओं के विरुद्ध परियोजना बजट की जांच',
  'All Cost Anomalies': 'सभी लागत विसंगतियां',
  'Critical Inflation (+100% to +400%)': 'अति-गंभीर मुद्रास्फीति (+१००% से +४००%)',
  'अति-गंभीर Inflation (+१००% to +४००%)': 'अति-गंभीर मुद्रास्फीति (+१००% से +४००%)',
  'Moderate Inflation (+40% to +100%)': 'मध्यम मुद्रास्फीति (+४०% से +१००%)',
  'Moderate Inflation (+४०% to +१००%)': 'मध्यम मुद्रास्फीति (+४०% से +१००%)',
  'Unviable Under-Bids (<-40%)': 'अलाभकारी न्यून बोलियां (<-४०%)',
  'Unviable Under-Bids (<-४०%)': 'अलाभकारी न्यून बोलियां (<-४०%)',
  'Fair Market Pricing': 'उचित बाजार मूल्य निर्धारण',
  'Fair मार्चket Pricing': 'उचित बाजार मूल्य निर्धारण',
  'COST BENCHMARK VERDICT (ARTHA-DARPAN)': 'लागत मानक निर्णय (अर्थ-दर्पण)',
  'COST BENCHमार्चK VERDICT (ARTHA-DARPAN)': 'लागत मानक निर्णय (अर्थ-दर्पण)',
  'ARTHA-DARPAN (अर्थ-दर्पण) Live in Action': 'अर्थ-दर्पण (लागत मानक एवं मूल्य वृद्धि) सक्रिय निरीक्षण',

  // S-04: CHAKRA-VYUH
  'SENTINEL S-04: CHAKRA-VYUH (चक्रव्यूह — CONTRACTOR CARTEL GRAPH)': 'प्रहरी एस-०४: चक्रव्यूह (ठेकेदार साठगांठ ग्राफ)',
  'SENTINEL S-04: CHAKRA-VYUH (चक्रव्यूह — CARTEL NEXUS SENTRY)': 'प्रहरी एस-०४: चक्रव्यूह (ठेकेदार साठगांठ ग्राफ)',
  'SENTINEL S-04: CHAKRA-VYUH (चक्रव्यूह — Contractor Cartel & Vendor Nexus Graph)': 'प्रहरी एस-०४: चक्रव्यूह (ठेकेदार साठगांठ ग्राफ)',
  'Contractor Cartel & Vendor Nexus Graph Sentry': 'ठेकेदार सिंडिकेट एवं विक्रेता साठगांठ ग्राफ प्रहरी',
  'Network Graph & Herfindahl-Hirschman Index (HHI) detecting vendor syndicates': 'नेटवर्क ग्राफ एवं एचएचआई सूचकांक - विक्रेता सिंडिकेट की पहचान',
  'CARTEL & VENDOR AUDIT VERDICT (CHAKRA-VYUH)': 'सिंडिकेट एवं विक्रेता ऑडिट निर्णय (चक्रव्यूह)',
  'All Cartel Risks': 'सभी साठगांठ जोखिम',
  'Vendor Monopolies (Share > 50%)': 'विक्रेता एकाधिकार (हिस्सेदारी > ५०%)',
  'High Concentration (HHI > 2500)': 'उच्च संकेन्द्रण (एचएचआई > २५००)',
  'Competitive Procurement': 'प्रतिस्पर्धी खरीद',

  // S-05: VIBHED-NETRA
  'SENTINEL S-05: VIBHED-NETRA (विभेद-नेत्र — 12D ISOLATION FOREST)': 'प्रहरी एस-०५: विभेद-नेत्र (१२डी आइसोलेशन फॉरेस्ट)',
  'SENTINEL S-05: VIBHED-NETRA (विभेद-नेत्र — ML ANOMALY SENTRY)': 'प्रहरी एस-०५: विभेद-नेत्र (१२डी आइसोलेशन फॉरेस्ट)',
  'SENTINEL S-05: VIBHED-NETRA (विभेद-नेत्र — 12D Isolation Forest Anomaly Sentry)': 'प्रहरी एस-०५: विभेद-नेत्र (१२डी आइसोलेशन फॉरेस्ट)',
  '12-Dimensional Isolation Forest Outlier Sentry': '१२-आयामी आइसोलेशन फॉरेस्ट विसंगति प्रहरी',
  'Multi-parametric unsupervised machine learning isolating complex statistical anomalies across 176k works': '१.७६ लाख कार्यों में जटिल सांख्यिकीय विसंगतियों को अलग करने वाली बहु-मापदंडीय मशीन लर्निंग',
  '12D ML ANOMALY VERDICT (VIBHED-NETRA)': '१२-आयामी एमएल विसंगति निर्णय (विभेद-नेत्र)',
  'All ML Outliers': 'सभी एमएल विसंगतियां',
  'Critical Outliers (Score > 0.75)': 'अति-गंभीर विसंगतियां (स्कोर > ०.७५)',
  'Elevated Anomalies (Score 0.55–0.75)': 'मध्यम विसंगतियां (स्कोर ०.५५–०.७५)',
  'Cluster Norms (Score < 0.55)': 'सामान्य क्लस्टर (स्कोर < ०.५५)',

  // S-06: SANKHYA-SATYA
  'SENTINEL S-06: SANKHYA-SATYA (संख्या-सत्य — BENFORD & TENDER-SPLIT)': 'प्रहरी एस-०६: संख्या-सत्य (बेनफोर्ड एवं निविदा विभाजन)',
  'SENTINEL S-06: SANKHYA-SATYA (संख्या-सत्य — MATHEMATICAL FORENSIC SENTRY)': 'प्रहरी एस-०६: संख्या-सत्य (गणितीय फोरेंसिक प्रहरी)',
  'SENTINEL S-06: SANKHYA-SATYA (संख्या-सत्य — Forensic Digit & Tender-Splitting Sentry)': 'प्रहरी एस-०६: संख्या-सत्य (गणितीय फोरेंसिक प्रहरी)',
  'Benford\'s Law Digit & Tender-Splitting Sentry': 'बेनफोर्ड अंक नियम एवं निविदा-विभाजन प्रहरी',
  'First-digit logarithmic frequency testing (Chi-square) & sub-threshold smurfing (GFR 149)': 'प्रथम-अंक लघुगणकीय आवृत्ति परीक्षण (काई-स्क्वायर) एवं सीमा-विभाजन जांच (जीएफआर १४९)',
  'MATHEMATICAL FORENSIC VERDICT (SANKHYA-SATYA)': 'गणितीय फोरेंसिक निर्णय (संख्या-सत्य)',
  'All Forensic Red Flags': 'सभी फोरेंसिक रेड फ्लैग',
  'Tender-Splitting (Sub-₹5L / ₹10L)': 'निविदा-विभाजन (₹५ लाख / ₹१० लाख से नीचे)',
  'Round-Number Approximations': 'पूर्णांक प्राक्कलन',
  'Benford Compliant Works': 'बेनफोर्ड अनुपालित कार्य',

  // S-07: BHU-DRISHTI
  'SENTINEL S-07: BHU-DRISHTI (भू-दृष्टि — SATELLITE & GIS OVERLAY)': 'प्रहरी एस-०७: भू-दृष्टि (उपग्रह एवं जीआईएस सत्यापन)',
  'SENTINEL S-07: BHU-DRISHTI (भू-दृष्टि — GEOSPATIAL SATELLITE RADAR)': 'प्रहरी एस-०७: भू-दृष्टि (उपग्रह एवं जीआईएस सत्यापन)',
  'SENTINEL S-07: BHU-DRISHTI (भू-दृष्टि — Geospatial Satellite Sentry & Ghost Asset Radar)': 'प्रहरी एस-०७: भू-दृष्टि (उपग्रह एवं जीआईएस सत्यापन)',
  'Geospatial GIS & Satellite Asset Verification Radar': 'भू-स्थानिक जीआईएस एवं उपग्रह परिसंपत्ति सत्यापन रडार',
  'ISRO Bhuvan satellite imagery & GPS coordinate auditing to verify physical presence of works': 'कार्यों की भौतिक उपस्थिति सत्यापित करने हेतु इसरो भुवन उपग्रह चित्र एवं जीपीएस निर्देशांक ऑडिट',
  'GEOSPATIAL AUDIT VERDICT (BHU-DRISHTI)': 'भू-स्थानिक ऑडिट निर्णय (भू-दृष्टि)',
  'All Geospatial Flags': 'सभी भू-स्थानिक फ्लैग',
  'Ghost Assets (Missing Geotag)': 'फर्जी परिसंपत्ति (लापता जियोटैग)',
  'Spatial Clusters (<250m Radius)': 'समीपस्थ क्लस्टर (<२५० मीटर दायरा)',
  'Verified Ground Coordinates': 'सत्यापित जमीनी निर्देशांक',

  // MODULE 08, 09, 10
  'MODULE 10: PRASHNA-KAVACH (प्रश्न-कवच — EXPLAINABLE FORENSIC AI)': 'मॉड्यूल १०: प्रश्न-कवच (व्याख्या योग्य फोरेंसिक एआई)',
  'MODULE 08: PRASHNA-KAVACH (प्रश्न कवच — PARLIAMENTARY Q&A AUDIT SENTRY)': 'मॉड्यूल ०८: प्रश्न-कवच (संसदीय प्रश्न ऑडिट प्रहरी)',
  'MODULE 09: SATARK-SAMVAAD (सतर्क संवाद — GENAI AUDIT COPILOT)': 'मॉड्यूल ०९: सतर्क-संवाद (जेनएआई ऑडिट कोपायलट)',
  'Explainable AI Attribution & Statutory Legal Proof': 'व्याख्या योग्य एआई आरोपण एवं सांविधिक कानूनी साक्ष्य',
  'Deconstructs multi-sentinel priority scores into additive SHAP feature attribution and statutory legal citations from MoSPI Guidelines 2023 & GFR Rules': 'बहु-प्रहरी प्राथमिकता स्कोर को योगात्मक SHAP विशेषता आरोपण तथा सांख्यिकी मंत्रालय दिशानिर्देश २०२३ एवं जीएफआर नियमों से सांविधिक उद्धरणों में विश्लेषित करता है',
  'Deconstructs complex multi-sentinel priority scores into additive SHAP feature attribution and statutory legal citations from MoSPI Guidelines 2023 & GFR Rules.': 'बहु-प्रहरी प्राथमिकता स्कोर को योगात्मक SHAP विशेषता आरोपण तथा सांख्यिकी मंत्रालय दिशानिर्देश २०२३ एवं जीएफआर नियमों से सांविधिक उद्धरणों में विश्लेषित करता है।',
  'Model Calibration Precision': 'मॉडल अंशांकन परिशुद्धता',
  'Export Official Evidence Dossier': 'आधिकारिक साक्ष्य डोजियर निर्यात करें',
  'Select Real MoSPI Audit (176k Dataset):': 'वास्तविक सांख्यिकी मंत्रालय ऑडिट चुनें (१.७६ लाख डेटासेट):',
  'Search any Project ID or keyword (e.g. 177089)...': 'कोई भी परियोजना आईडी या कीवर्ड खोजें (जैसे १७७०८९)...',
  'Search MoSPI': 'सांख्यिकी मंत्रालय खोजें',
  'Additive SHAP Feature Attribution (Explainable AI Waterfall)': 'योगात्मक SHAP विशेषता आरोपण (व्याख्या योग्य एआई वाटरफॉल)',
  'Model Calibration Precision: 94.2% · Zero Hallucination': 'मॉडल अंशांकन परिशुद्धता: ९४.२% · शून्य विभ्रम',
  'Verify Cryptographic SHA-256 Ledger': 'क्रिप्टोग्राफिक SHA-256 लेजर सत्यापित करें',
  'Export Official Pre-Sanction Inspection Memorandum': 'आधिकारिक स्वीकृति-पूर्व निरीक्षण ज्ञापन निर्यात करें',

  // Generic Sentinel Tokens
  'SENTINEL': 'प्रहरी',
  'SENTINELS': 'प्रहरी',
  'SENTRY': 'प्रहरी',
  'VIDHI-KAVACH': 'विधि-कवच',
  'PUNAR-DRISHTI': 'पुनर्दृष्टि',
  'ARTHA-DARPAN': 'अर्थ-दर्पण',
  'CHAKRA-VYUH': 'चक्रव्यूह',
  'VIBHED-NETRA': 'विभेद-नेत्र',
  'SANKHYA-SATYA': 'संख्या-सत्य',
  'BHU-DRISHTI': 'भू-दृष्टि',
  'PRASHNA-KAVACH': 'प्रश्न-कवच',
  'SATARK-SAMVAAD': 'सतर्क-संवाद',
  'SATARK-KARYAA': 'सतर्क-कार्या',
  'BHAVISHYA-REKHA': 'भविष्य-रेखा',
  'SATARK': 'सतर्क',
  'MPLADS': 'एमपीलैड्स',
  'MoSPI': 'सांख्यिकी मंत्रालय',
  'MOSPI': 'सांख्यिकी मंत्रालय',
  'eSAKSHI': 'ई-साक्षी',
  'ESAKSHI': 'ई-साक्षी',

  // ==========================================================
  // 4. CONTROLS, SEARCH BOX & DROPDOWNS
  // ==========================================================
  'Select State / UT:': 'राज्य / केंद्र शासित प्रदेश चुनें:',
  'Select State / UT': 'राज्य / केंद्र शासित प्रदेश चुनें',
  'All 36 States & UTs (All-India)': 'सभी ३६ राज्य एवं केंद्र शासित प्रदेश (अखिल भारतीय)',
  'All 37 States & UTs': 'सभी ३७ राज्य एवं केंद्र शासित प्रदेश',
  'All States & UTs': 'सभी राज्य एवं केंद्र शासित प्रदेश',
  'QUICK Search:': 'त्वरित खोज:',
  'QUICK खोजें:': 'त्वरित खोज:',
  'Search title, MP name, district, keyword...': 'शीर्षक, सांसद, जिला, कीवर्ड खोजें...',
  'Search by Project ID, Title, MP Name, District, or Vendor...': 'परियोजना आईडी, शीर्षक, सांसद, जिला या विक्रेता द्वारा खोजें...',
  'Filter by Sentinel Engine:': 'प्रहरी इंजन द्वारा फ़िल्टर करें:',
  'All Sentinel Risks': 'सभी प्रहरी जोखिम',
  'Only Critical Risks (Score ≥ 75)': 'केवल अति-गंभीर जोखिम (स्कोर ≥ ७५)',
  'Only High Risks (Score 55 - 74)': 'केवल उच्च जोखिम (स्कोर ५५ - ७४)',
  'Sort by Priority:': 'प्राथमिकता क्रम:',
  'Risk Score (High to Low)': 'जोखिम स्कोर (उच्च से निम्न)',
  'Sanction Cost (High to Low)': 'स्वीकृत लागत (उच्च से निम्न)',
  'Recently Recommended': 'हाल ही में अनुशंसित',
  'Export Audit CSV': 'ऑडिट CSV डाउनलोड करें',

  // ==========================================================
  // 5. TABLE HEADERS, BADGES & ROW ELEMENTS
  // ==========================================================
  'PROJECT ID': 'परियोजना आईडी',
  'Project ID': 'परियोजना आईडी',
  'WORK DESCRIPTION': 'कार्य का विवरण',
  'Work Description': 'कार्य का विवरण',
  'Work Title / Description': 'कार्य का शीर्षक / विवरण',
  'STATE & DISTRICT': 'राज्य एवं जिला',
  'State & District': 'राज्य एवं जिला',
  'HON\'BLE MP': 'माननीय सांसद',
  'Hon\'ble MP': 'माननीय सांसद',
  'MP & Sector': 'सांसद एवं क्षेत्र',
  'SANCTION OUTLAY (₹)': 'स्वीकृत परिव्यय (₹)',
  'SANCTION OUTLAY': 'स्वीकृत परिव्यय',
  'Sanctioned Amount': 'स्वीकृत राशि',
  'Forensic Flags & Citations': 'फोरेंसिक फ्लैग एवं नियम संदर्भ',
  'Composite Priority Score': 'समग्र प्राथमिकता स्कोर',
  'ACTION / DOSSIER': 'कार्रवाई / डोजियर',
  'Action / Dossier': 'कार्रवाई / डोजियर',
  'Action': 'कार्रवाई',
  'Actions': 'कार्रवाईयां',

  // Row Badges & Subtitles
  'Category:': 'श्रेणी:',
  'Sanctioned:': 'स्वीकृत:',
  'Completed:': 'पूर्ण:',
  'Normal/Others': 'सामान्य / अन्य',
  'Standard Work': 'मानक कार्य',
  'Repair and Renovation': 'मरम्मत एवं नवीनीकरण',
  'In Progress': 'प्रगति पर',
  'Physical Inspection': 'भौतिक निरीक्षण',
  'Sl.No.': 'क्र.सं.',
  'Sl. No.': 'क्र.सं.',
  'Plot No': 'प्लॉट संख्या',
  'JL No': 'जे.एल. संख्या',
  'NA': 'लागू नहीं',

  // Verdict Badges & Actions (Screenshots 1, 4, 5)
  '100% EXACT CLONE': '१००% हूबहू क्लोन',
  'EXACT CLONE': 'हूबहू क्लोन',
  'NEAR-CLONE': 'निकट-क्लोन',
  'Inspect Twin Work': 'क्लोन कार्य देखें',
  'Twin:': 'समान कार्य:',
  'Twin': 'समान कार्य',
  'Peer:': 'समकक्ष मध्यिका:',
  'Excess:': 'अतिरिक्त लागत:',
  'Vendor:': 'विक्रेता:',
  'HHI:': 'एचएचआई:',
  'Score:': 'स्कोर:',
  'Score': 'स्कोर',
  'View CPWD Rate Audit': 'सीपीडब्ल्यूडी दर ऑडिट देखें',
  'Trace Cartel Network': 'ठेकेदार सिंडिकेट देखें',
  'Inspect 12D Outlier Vector': '१२-आयामी विसंगति वेक्टर देखें',
  'View Digit Distribution': 'अंक वितरण देखें',
  'Fly to Satellite Radar': 'उपग्रह रडार पर देखें',
  'CRITICAL INFLATION': 'अति-गंभीर मुद्रास्फीति',
  'UNVIABLE BID': 'अलाभकारी बोली',
  'PRICE PADDING': 'मूल्य वृद्धि',
  'FAIR PRICING': 'उचित मूल्य',
  'Conforms to CPWD Benchmark': 'सीपीडब्ल्यूडी मानकों के अनुरूप',
  'VENDOR MONOPOLY': 'विक्रेता एकाधिकार',
  'HIGH CONCENTRATION': 'उच्च संकेन्द्रण',
  'Competitive Vendor Distribution': 'प्रतिस्पर्धी विक्रेता वितरण',
  '12D ML OUTLIER': '१२डी एमएल विसंगति',
  'CRITICAL OUTLIER': 'अति-गंभीर विसंगति',
  'ELEVATED ANOMALY': 'मध्यम विसंगति',
  'CLUSTER NORMAL': 'सामान्य क्लस्टर',
  'Conforms to Cluster Norms': 'क्लस्टर मानकों के अनुरूप',
  'TENDER-SPLIT': 'निविदा विभाजन',
  'ROUND NUMBER': 'पूर्णांक प्राक्कलन',
  'BENFORD OK': 'बेनफोर्ड ठीक',
  'Sub-Threshold Limit': 'सीमा-विभाजन जांच',
  'GHOST ASSET': 'फर्जी परिसंपत्ति',
  'SPATIAL CLUSTER': 'समीपस्थ क्लस्टर',
  'VERIFIED GPS': 'सत्यापित जीपीएस',
  'UNIQUE ASSET': 'अद्वितीय संपत्ति',
  'No Duplicate in District': 'जिले में कोई दोहरा कार्य नहीं',
  'Fiscal Year-End March Rush Violation': 'वित्तीय वर्ष समाप्ति मार्च रश उल्लंघन',
  'वित्तीय वर्ष समाप्ति मार्च रश उल्लंघन': 'वित्तीय वर्ष समाप्ति मार्च रश उल्लंघन',
  'Places of Worship & Religious Structures': 'पूजा स्थल एवं धार्मिक संरचनाएं',
  'पूजा स्थल एवं धार्मिक संरचनाएं': 'पूजा स्थल एवं धार्मिक संरचनाएं',
  'Zero Guidelines Breach': 'शून्य दिशानिर्देश उल्लंघन (स्वच्छ)',
  'CRITICAL': 'अति-गंभीर',
  'HIGH': 'उच्च जोखिम',
  'ELEVATED': 'मध्यम जोखिम',
  'LOW': 'न्यूनतम जोखिम',
  'COMPLIANT': 'अनुपालित',
  'STATUTORY BREACH': 'सांविधिक उल्लंघन',
  'DUPLICATE CLONE': 'क्लोन कार्य',
  'PRICE INFLATION': 'मूल्य वृद्धि',
  'CARTEL MONOPOLY': 'साठगांठ एकाधिकार',
  'OUTLIER': 'असामान्य विसंगति',
  'ALL CLEAR': 'सभी मानक स्वच्छ',
  'NEG-LIST': 'निषेध-सूची',
  'MARCH-RUSH': 'मार्च-रश',
  'pts': 'अंक',
  'points': 'अंक',

  // ==========================================================
  // 6. INSPECTION MODAL & DOSSIER (ALL INSPECT/MODAL POPUPS)
  // ==========================================================
  'STATUTORY AUDIT VERDICT': 'सांविधिक ऑडिट निर्णय',
  'Forensic Audit Findings & Legal Citations:': 'फोरेंसिक ऑडिट निष्कर्ष एवं कानूनी उद्धरण:',
  'VIDHI-KAVACH Statutory Policy Findings & Legal Citations:': 'विधि-कवच सांविधिक नीति निष्कर्ष एवं कानूनी उद्धरण:',
  'ARTHA-DARPAN CPWD Rate Benchmark & Overpricing Analysis:': 'अर्थ-दर्पण सीपीडब्ल्यूडी दर मानक एवं अधिमूल्यन विश्लेषण:',
  'S-01: VIDHI-KAVACH STATUTORY INVESTIGATION': 'एस-०१: विधि-कवच सांविधिक जांच',
  'S-02: PUNAR-DRISHTI DUPLICATE INVESTIGATION': 'एस-०२: पुनर्दृष्टि दोहरे दावे की जांच',
  'S-03: ARTHA-DARPAN COST BENCHMARK AUDIT': 'एस-०३: अर्थ-दर्पण लागत मानक ऑडिट',
  'S-04: CHAKRA-VYUH CONTRACTOR CARTEL AUDIT': 'एस-०४: चक्रव्यूह ठेकेदार साठगांठ ऑडिट',
  'S-05: VIBHED-NETRA 12D ISOLATION AUDIT': 'एस-०५: विभेद-नेत्र १२डी आइसोलेशन ऑडिट',
  'S-06: SANKHYA-SATYA FORENSIC DIGIT AUDIT': 'एस-०६: संख्या-सत्य फोरेंसिक अंक ऑडिट',
  'S-07: BHU-DRISHTI SATELLITE GEOSPATIAL AUDIT': 'एस-०७: भू-दृष्टि उपग्रह भू-स्थानिक ऑडिट',
  'Generate Official Vigilance Memorandum': 'आधिकारिक सतर्कता ज्ञापन तैयार करें',
  'GENERATE CASE FILE (Form GFR-19A)': 'मामला फाइल तैयार करें (फॉर्म जीएफआर-१९ए)',
  'Close': 'बंद करें',
  '← Back to Forensic Reason Summary': '← फोरेंसिक कारण सारांश पर वापस जाएं',
  'WHY WAS THIS FLAGGED?': 'यह क्यों चिह्नित हुआ?',
  'VIEW FORENSIC AUDIT': 'फोरेंसिक ऑडिट देखें',
  'VIEW GEOSPATIAL AUDIT': 'भू-स्थानिक ऑडिट देखें',
  'VIEW CPWD AUDIT': 'सीपीडब्ल्यूडी ऑडिट देखें',
  'Inspecting Sentinel Evidence (from "Why Was This Flagged?")': 'प्रहरी साक्ष्य निरीक्षण ("यह क्यों चिह्नित हुआ?" से)',
  'Click back anytime to return to the Forensic Reason Summary & inspect other sentinels.': 'फोरेंसिक कारण सारांश पर लौटने और अन्य प्रहरियों की जांच के लिए कभी भी वापस क्लिक करें।',
  'Back to "Why Was This Flagged?"': '"यह क्यों चिह्नित हुआ?" पर वापस जाएं',
  'Cost Deviation': 'लागत विचलन',
  'Excess Public Exposure:': 'अतिरिक्त सार्वजनिक जोखिम:',
  'State CPWD Peer Median:': 'राज्य सीपीडब्ल्यूडी समकक्ष मध्यिका:',
  'Statutory Rate Standard:': 'सांविधिक दर मानक:',
  'CPWD Schedule of Rates (DSR) & GFR 2017 Rule 144': 'सीपीडब्ल्यूडी दर अनुसूची (डीएसआर) एवं जीएफआर २०१७ नियम १४४',
  'Matched Twin Work Record': 'समान क्लोन कार्य अभिलेख',
  'Asset Description is Unique': 'परिसंपत्ति विवरण अद्वितीय है',
  'No risk of double-billing or multiple vouchers on the same civil construction.': 'समान निर्माण कार्य पर दोहरे बिलिंग या एकाधिक वाउचर का कोई जोखिम नहीं।',
  'Forensic Verdict': 'फोरेंसिक निर्णय',
  'GFR 149 Evasion': 'जीएफआर १४९ परिहार',
  'Lacks Itemized BOQ': 'मदवार बीओक्यू का अभाव',
  'Natural Distribution': 'प्राकृतिक वितरण',
  'Benford Forensic & Threshold Audit': 'बेनफोर्ड फोरेंसिक एवं सीमा ऑडिट',
  'Threshold Smurfing:': 'सीमा स्मर्फिंग (विभाजन):',
  'Priced Just Below ₹5L/10L Mandatory e-Tender Limit': '₹५ लाख / ₹१० लाख अनिवार्य ई-निविदा सीमा से ठीक नीचे मूल्य निर्धारित',
  'Exact Lakh Integer without Detail BOQ': 'विस्तृत बीओक्यू के बिना पूर्ण लाख पूर्णांक',
  'Natural Commercial Pricing': 'प्राकृतिक वाणिज्यिक मूल्य निर्धारण',
  'GFR 2017 Rule 149 & Rule 157 (Anti-Splitting Sentry)': 'जीएफआर २०१७ नियम १४९ एवं नियम १५७ (विभाजन-रोधी प्रहरी)',
  'BHU-DRISHTI Geospatial Forensic Evidence Trail': 'भू-दृष्टि भू-स्थानिक फोरेंसिक साक्ष्य श्रृंखला',
  'ISRO Bhuvan & eSAKSHI GIS': 'इसरो भुवन एवं ई-साक्षी जीआईएस',
  'SATELLITE POSITION:': 'उपग्रह स्थिति:',
  'GROUND TRUTH STATUS:': 'धरातलीय स्थिति:',
  'FIELD DIRECTIVE:': 'क्षेत्रीय निर्देश:',
  'Funds disbursed on paper without verified GPS photographic proof in eSAKSHI portal.': 'ई-साक्षी पोर्टल में सत्यापित जीपीएस फोटो साक्ष्य के बिना कागजों पर राशि वितरित।',
  'Sanctioned within 250m radius of existing asset, creating redundant civil asset risk.': 'मौजूदा परिसंपत्ति के २५० मीटर के दायरे में स्वीकृत, जिससे निरर्थक परिसंपत्ति का जोखिम।',
  'Coordinates verified within valid district cadastral boundaries.': 'निर्देशांक वैध जिला भूकर सीमाओं के भीतर सत्यापित।',
  'Execute on-ground physical geotag verification using mobile inspector app before final completion certificate is issued.': 'अंतिम पूर्णता प्रमाणपत्र जारी करने से पहले मोबाइल इंस्पेक्टर ऐप का उपयोग करके जमीनी भौतिक जियोटैग सत्यापन निष्पादित करें।',
  'BHU-DRISHTI Verified GIS Coordinates': 'भू-दृष्टि सत्यापित जीआईएस निर्देशांक',
  'Latitude:': 'अक्षांश:',
  'Longitude:': 'देशांतर:',
  'Copy Hash': 'हैश कॉपी करें',
  'Copied!': 'कॉपी किया गया!',
  'Export PDF': 'पीडीएफ निर्यात करें',
  'Print Dossier': 'डोजियर प्रिंट करें',

  // ==========================================================
  // 7. COMMON VOCABULARY & CIVIL WORKS PHRASES (SCREENSHOT 1 & 4)
  // ==========================================================
  'Provision / Lighting arrangement with Street light poles': 'स्ट्रीट लाइट पोल सहित प्रकाश व्यवस्था का प्रावधान',
  'Provision / Lighting arrangment with street light & Poles': 'स्ट्रीट लाइट एवं पोल सहित प्रकाश व्यवस्था का प्रावधान',
  'Provision / Lighting arrangement': 'विद्युत प्रकाश व्यवस्था का प्रावधान',
  'Provision / Lighting arrangment': 'विद्युत प्रकाश व्यवस्था का प्रावधान',
  'Lighting arrangement': 'प्रकाश व्यवस्था',
  'Lighting arrangment': 'प्रकाश व्यवस्था',
  'Street light poles': 'स्ट्रीट लाइट पोल',
  'Street light & Poles': 'स्ट्रीट लाइट एवं पोल',
  'Street light': 'स्ट्रीट लाइट',
  'Poles': 'खंभे',
  'Park Revonation': 'पार्क जीर्णोद्धार',
  'The working agency will be concerned Municipal Corporation': 'कार्यकारी एजेंसी संबंधित नगर निगम होगी',
  'Municipal Corporation': 'नगर निगम',
  'working agency': 'कार्यकारी एजेंसी',
  'concerned': 'संबंधित',
  'Const. / General Chaupal': 'निर्माण / सामान्य चौपाल',
  'General Chaupal': 'सामान्य चौपाल',
  'Chaupal': 'चौपाल',
  '1st phase': 'प्रथम चरण',
  '2nd phase': 'द्वितीय चरण',
  '3rd phase': 'तृतीय चरण',
  'Community Media Centre': 'सामुदायिक मीडिया केंद्र',
  'Public Mongpham': 'सार्वजनिक मोंगफाम',
  'Athoupung Leikol, a Public park': 'अथौपुंग लीकोल, सार्वजनिक पार्क',
  'Public park': 'सार्वजनिक पार्क',
  'Boundary wall, road gate guard wall': 'चारदीवारी, सड़क गेट सुरक्षा दीवार',
  'Boundary wall': 'चारदीवारी',
  'road gate guard wall': 'सड़क गेट सुरक्षा दीवार',
  'guard wall': 'सुरक्षा दीवार',
  'gate guard': 'गेट सुरक्षा',
  'Kaborsthan': 'कब्रिस्तान',
  'Kabristan': 'कब्रिस्तान',
  'and gate at infront': 'एवं सामने गेट',
  'mudi shop': 'किराना दुकान',
  'under': 'अंतर्गत',
  'Panchayat Samity': 'पंचायत समिति',
  'Samity': 'समिति',
  'G.P': 'ग्राम पंचायत',
  'Bus for Bal Bharti Vidhya': 'बाल भारती विद्या हेतु बस',
  'solar photovoltaic Submersible Pump': 'सौर फोटोवोल्टिक सबमर्सिबल पंप',
  'Submersible Pump': 'सबमर्सिबल पंप',
  'overhead tank': 'ओवरहेड टैंक',
  'pipe line': 'पाइपलाइन',
  'one (?) nos': '१ नग',
  'Near Laxmi': 'लक्ष्मी के समीप',
  'Excavation / Pit': 'खुदाई / गड्ढा',
  'Guru Kunta Temple Reach': 'गुरु कुंटा मंदिर रीच',
  'Temple Reach': 'मंदिर रीच',
  'Constructing a new': 'नवीन निर्माण',
  'near Maremma temple': 'मारेम्मा मंदिर के समीप',
  'Maremma temple': 'मारेम्मा मंदिर',
  'Two Hundred Fifty': 'दो सौ पचास',
  'solar street lights': 'सौर स्ट्रीट लाइटें',
  'solar street light': 'सौर स्ट्रीट लाइट',
  'at various public locations': 'विभिन्न सार्वजनिक स्थलों पर',
  'in Blocks': 'ब्लॉकों में',
  'as per the enclosed list': 'संलग्न सूची अनुसार',
  'enclosed list': 'संलग्न सूची',
  'Construction of Chabutra near Shiv Mandir': 'शिव मंदिर के पास चबूतरा निर्माण',
  'Construction of Chabutra': 'चबूतरा निर्माण',
  'near Shiv Mandir': 'शिव मंदिर के पास',
  'Shiv Mandir': 'शिव मंदिर',
  'Mandir': 'मंदिर',
  'Estimate for the': 'प्राक्कलन:',
  'Estimate for': 'प्राक्कलन:',
  'Purchase of ambulances': 'एम्बुलेंस की खरीद',
  'Purchase of ambulance': 'एम्बुलेंस की खरीद',
  'Purchase of': 'क्रय / खरीद:',
  'Medical Equipment to be Fitted in Ambulance': 'एम्बुलेंस हेतु चिकित्सा उपकरण',
  'Solar Light': 'सोलर लाइट',
  'PCC Road': 'पीसीसी सड़क',
  'CC road': 'सीसी सड़क',
  'Pitch road': 'डामर सड़क',
  'Drain construction': 'नाली निर्माण',
  'Drinking Water': 'पेयजल',
  'Water Tank': 'पानी की टंकी',
  'Pipeline': 'पाइपलाइन',
  'School': 'विद्यालय',
  'Hospital': 'अस्पताल',
  'Ambulance': 'एम्बुलेंस',
  'Excavation': 'खुदाई',
  'Pit': 'गड्ढा',
  'Reach': 'रीच',
  'Village': 'गांव',
  'Mandal': 'मंडल',
  'Block': 'ब्लॉक',
  'District': 'जिला',
  'State': 'राज्य',
  'Gram Panchayat': 'ग्राम पंचायत',
  'Panchayat': 'पंचायत',
  'Development Block': 'विकास खंड',
  'Near': 'समीप',
  'near': 'समीप',
  'Public': 'सार्वजनिक',
  'Private': 'निजी',

  // Administrative Titles
  'Sitting Rajya Sabha': 'वर्तमान राज्यसभा सांसद',
  'Rajya Sabha': 'राज्यसभा',
  'Lok Sabha': 'लोकसभा',
  'DEPUTY COMMISSIONER': 'उपायुक्त',
  'DISTRICT MAGISTRATE': 'जिलाधिकारी',
  'DISTRICT MAGISTRAE': 'जिलाधिकारी',
  'DISTRICT COLLECTOR': 'जिला कलेक्टर',
  'DISTRICT PLANNING OFFICER': 'जिला योजना अधिकारी',
  'COLLECTOR': 'कलेक्टर',
  'COMMISSIONER': 'आयुक्त',
  'MAGISTRATE': 'मजिस्ट्रेट',

  // States & UTs
  'Jharkhand': 'झारखंड',
  'Goa': 'गोवा',
  'Manipur': 'मणिपुर',
  'Uttar Pradesh': 'उत्तर प्रदेश',
  'Bihar': 'बिहार',
  'Rajasthan': 'राजस्थान',
  'Madhya Pradesh': 'मध्य प्रदेश',
  'Maharashtra': 'महाराष्ट्र',
  'Gujarat': 'गुजरात',
  'West Bengal': 'पश्चिम बंगाल',
  'Tamil Nadu': 'तमिलनाडु',
  'Karnataka': 'कर्नाटक',
  'Kerala': 'केरल',
  'Odisha': 'ओडिशा',
  'Punjab': 'पंजाब',
  'Haryana': 'हरियाणा',
  'Assam': 'असम',
  'Andhra Pradesh': 'आंध्र प्रदेश',
  'Telangana': 'तेलंगाना',
  'Chhattisgarh': 'छत्तीसगढ़',
  'Himachal Pradesh': 'हिमाचल प्रदेश',
  'Uttarakhand': 'उत्तराखंड',
  'Jammu & Kashmir': 'जम्मू एवं कश्मीर',
  'Jammu and Kashmir': 'जम्मू एवं कश्मीर',
  'Delhi': 'दिल्ली',
  'Tripura': 'त्रिपुरा',
  'Meghalaya': 'मेघालय',
  'Nagaland': 'नागालैंड',
  'Mizoram': 'मिजोरम',
  'Arunachal Pradesh': 'अरुणाचल प्रदेश',
  'Sikkim': 'सिक्किम',
  'Puducherry': 'पुदुचेरी',
  'Chandigarh': 'चंडीगढ़',
  'Ladakh': 'लद्दाख',
  'Andaman & Nicobar': 'अंडमान एवं निकोबार',
  'Dadra & Nagar Haveli': 'दादरा एवं नगर हवेली',
  'Lakshadweep': 'लक्षद्वीप',

  // Constituencies & Districts (Screenshots 1, 4)
  'NORTH 24 PARGANAS': 'उत्तर २४ परगना',
  'SOUTH 24 PARGANAS': 'दक्षिण २४ परगना',
  'NORTH TWENTY FOUR PARGANAS': 'उत्तर २४ परगना',
  'SOUTH TWENTY FOUR PARGANAS': 'दक्षिण २४ परगना',
  'BANKURA': 'बांकुड़ा',
  'Y.S.R. KADAPA': 'वाई.एस.आर. कडपा',
  'Y.S.R. Kadapa': 'वाई.एस.आर. कडपा',
  'CUDDAPAH': 'कडपा',
  'KADAPA': 'कडपा',
  'VIJAYANAGARA': 'विजयनगर',
  'Vijayanagara': 'विजयनगर',
  'AMETHI': 'अमेठी',
  'Amethi': 'अमेठी',
  'BASIRHAT': 'बशीरहाट',
  'BELLARY(ST)': 'बेल्लारी (अजजा)',
  'BELLARY': 'बेल्लारी',
  'GURDASPUR': 'गुरदासपुर',
  'JIND': 'जींद',
  'SONEPAT': 'सोनीपत',
  'THOUBAL': 'थौबल',
  'IMPHAL EAST': 'इंफाल पूर्व',
  'IMPHAL WEST': 'इंफाल पश्चिम',
  'INNER MANIPUR': 'इनर मणिपुर',
  'OUTER MANIPUR': 'आउटर मणिपुर',
  'EAST': 'पूर्व',
  'NORTH EAST': 'उत्तर पूर्व',
  'WEST': 'पश्चिम',
  'SOUTH': 'दक्षिण',
  'CENTRAL': 'मध्य',
  'NORTH GOA': 'उत्तर गोवा',
  'SOUTH GOA': 'दक्षिण गोवा',
  'Tiswadi': 'तिसवाड़ी',
  'Ribandar': 'रिबंदर',
  'Kamalapura': 'कमलापुरा',
  'Hosapete': 'होसपेट',
  'Barasat': 'बारासात',
  'Chhotojagulia': 'छोटोहागुलिया',
  'Indpur': 'इन्दपुर',
  'Mejia': 'मेजिया',
  'Deulvira': 'देउलविरा',
  'Gurajala': 'गुराजाला',
  'Simhadripuram': 'सिम्हाद्रिपुरम',
  'Tiloi': 'तिलोई',
  'Bahadurpur': 'बहादुरपुर',
  'Singhpur': 'सिंहपुर',
  'Sangrampur': 'संग्रामपुर',
  'Bhadar': 'भादर',
  'Bhetua': 'भेटुआ',
  'Gauriganj': 'गौरीगंज',
  'Jamo': 'जामो',
  'Shahgarh': 'शाहगढ़',
  'Musafirkhana': 'मुसाफिरखाना',
  'Jagdishpur': 'जगदीशपुर',
  'Shukul Bazar': 'शुकुल बाजार',
  'Soibam': 'सोइबम',
  'leikai': 'लीकाई',
  'Mongpham': 'मोंगफाम',
  'Porompat': 'पोरोमपट',
  'Arapti': 'अरापती',
  'Maning': 'मानिंग',
  'Leikal': 'लीकल',
  'Lilong': 'लिलोंग',
  'Paona': 'पाओना',

  // Months
  'Jan': 'जनवरी',
  'Feb': 'फरवरी',
  'Mar': 'मार्च',
  'March': 'मार्च',
  'Apr': 'अप्रैल',
  'May': 'मई',
  'Jun': 'जून',
  'Jul': 'जुलाई',
  'Aug': 'अगस्त',
  'Sep': 'सितंबर',
  'Oct': 'अक्टूबर',
  'Nov': 'नवंबर',
  'Dec': 'दिसंबर',

  // Pagination
  '← Previous': '← पिछला',
  'Previous': 'पिछला',
  'Next →': 'अगला →',
  'Next': 'अगला',
  ' of ': ' / ',
  'records': 'अभिलेख',
  'record': 'अभिलेख',
  'Page': 'पृष्ठ',

  // Footer
  'Unified automated vigilance intelligence platform auditing public fund flows, statutory GFR compliance, and procurement integrity across India.': 'समस्त भारत में सार्वजनिक निधि प्रवाह, सांविधिक जीएफआर अनुपालन एवं प्रापण निष्ठा की जांच करने वाला एकीकृत स्वचालित सतर्कता आसूचना मंच।',
  'QUICK LINKS': 'त्वरित लिंक',
  'Quick Links': 'त्वरित लिंक',
  'About SATARK': 'सतर्क के बारे में',
  'Website Policies': 'वेबसाइट नीतियां',
  'Privacy Policy': 'गोपनीयता नीति',
  'Terms & Conditions': 'नियम एवं शर्तें',
  'Statutory GFR Rules': 'सांविधिक जीएफआर नियम',
  'Cryptographic Ledger': 'क्रिप्टोग्राफिक लेजर',
  'HELPLINE & SUPPORT': 'हेल्पलाइन एवं सहायता',
  'Helpline & Support': 'हेल्पलाइन एवं सहायता',
  'TOLL-FREE HELPLINE': 'टोल-फ्री हेल्पलाइन',
  'Toll-Free Helpline': 'टोल-फ्री हेल्पलाइन',
  'TECHNICAL INQUIRIES': 'तकनीकी पूछताछ',
  'Technical Inquiries': 'तकनीकी पूछताछ',
  'NODAL MINISTRY': 'नोडल मंत्रालय',
  'Nodal Ministry': 'नोडल मंत्रालय',
  'Government of India, New Delhi': 'भारत सरकार, नई दिल्ली',
  'All Rights Reserved.': 'सर्वाधिकार सुरक्षित.',
  'All Rights Reserved': 'सर्वाधिकार सुरक्षित',
  'Developed for Smart India Hackathon (SIH 2026) · v2.5-PROD': 'स्मार्ट इंडिया हैकथॉन (SIH २०२६) हेतु विकसित · संस्करण २.५-उत्पादन',
  'Developed for Smart India Hackathon': 'स्मार्ट इंडिया हैकथॉन हेतु विकसित',
  'National Informatics Centre (NIC) Standards Aligned': 'राष्ट्रीय सूचना विज्ञान केंद्र (NIC) मानकों के अनुरूप',
  'Version 2.5 Sovereign Build · 176,925 MoSPI Records Verified': 'संस्करण २.५ संप्रभु संस्करण · १,७६,९२५ सांख्यिकी मंत्रालय अभिलेख सत्यापित'
};

// Merge all 746 MPs into MASTER_DICT
for (const [mpEn, mpHi] of Object.entries(mpMap)) {
  if (!MASTER_DICT[mpEn]) {
    MASTER_DICT[mpEn] = mpHi;
  }
}

console.log(`Total Dictionary Entries: ${Object.keys(MASTER_DICT).length}`);

// Generate the new frontend/i18n.js
const i18nCode = `/**
 * frontend/i18n.js
 * 
 * MPLADS-SATARK Autonomous 100% Bilingual (English & हिन्दी) Sovereign Engine
 * Enterprise-grade full-site localization for Smart India Hackathon 2026:
 * - 100% Comprehensive Coverage (Hero, Sticky Nav, 7 Sentinels, Modules 08-10, Tables, All 746 MPs, Modals)
 * - Strict Word Boundary Regex Construction (\b) Preventing Substring Glitches (Benchmark, Market, Maremma)
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
    res = res.replace(/\\bCr\\b/gi, 'करोड़')
             .replace(/\\bCrore\\b/gi, 'करोड़')
             .replace(/\\bCrores\\b/gi, 'करोड़')
             .replace(/\\bLakh\\b/gi, 'लाख')
             .replace(/\\bLakhs\\b/gi, 'लाख')
             .replace(/\\bpts\\b/gi, 'अंक')
             .replace(/\\bpoints\\b/gi, 'अंक');
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
    return s.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&');
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
    if (/^[A-Z]\\.?$/.test(word)) {
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
  const DICTIONARY = ${JSON.stringify(MASTER_DICT, null, 2)};

  // Sort dictionary entries by length descending for greedy matching
  const SORTED_ENTRIES = Object.entries(DICTIONARY).sort((a, b) => b[0].length - a[0].length);

  // Compile regexes with strict word boundaries
  const COMPILED_RULES = SORTED_ENTRIES.map(([en, hi]) => {
    const isAscii = /^[\\x20-\\x7E\\s]+$/.test(en);
    const startBoundary = /^\\w/.test(en) ? '\\\\b' : '';
    const endBoundary = /\\w$/.test(en) ? '\\\\b' : '';
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
    res = res.replace(/DISTRICT\\s+MAGISTRATE|DISTRICT\\s+MAGISTRAE/gi, 'जिलाधिकारी')
             .replace(/DEPUTY\\s+COMMISSIONER/gi, 'उपायुक्त')
             .replace(/DISTRICT\\s+COLLECTOR/gi, 'जिला कलेक्टर')
             .replace(/DISTRICT\\s+PLANNING\\s+OFFICER/gi, 'जिला योजना अधिकारी')
             .replace(/COMMISSIONER/gi, 'आयुक्त')
             .replace(/_IDA|_ida|MPLADS_ida|MPLADS_IDA/gi, '')
             .replace(/आयुक्तMCD/gi, 'आयुक्त एमसीडी ')
             .replace(/\\s+/g, ' ');
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
          const lead = text.match(/^\\s*/)[0];
          const trail = text.match(/\\s*$/)[0];
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
            if (!node[\`_orig_\${attr}\`]) node[\`_orig_\${attr}\`] = val;
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
            if (node[\`_orig_\${attr}\`]) {
              node.setAttribute(attr, node[\`_orig_\${attr}\`]);
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
`;

fs.writeFileSync('frontend/i18n.js', i18nCode, 'utf8');
console.log('✅ Successfully compiled and updated frontend/i18n.js');
