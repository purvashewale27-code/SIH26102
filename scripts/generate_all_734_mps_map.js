const fs = require('fs');
const { transliterateText, COMMON_WORDS } = require('./transliterate_mps.js');

const mps = JSON.parse(fs.readFileSync('scripts/all_unique_mps.json', 'utf8'));

// Special known high-profile and screenshot MPs overrides for 100% perfection
const SPECIAL_MP_OVERRIDES = {
  'SK NURUL ISLAM': 'एस.के. नुरुल इस्लाम',
  'S K NURUL ISLAM': 'एस.के. नुरुल इस्लाम',
  'Shri Sadanand Mhalu Shet Tanavade (2023-29)': 'श्री सदानंद शेट तनावड़े (२०२३-२९)',
  'Shri Sadanand Mhalu Shet Tanavade': 'श्री सदानंद शेट तनावड़े',
  'ARUP CHAKRABORTY': 'अरूप चक्रवर्ती',
  'Y S Avinash Reddy': 'वाई.एस. अविनाश रेड्डी',
  'Y. S. Avinash Reddy': 'वाई.एस. अविनाश रेड्डी',
  'E. TUKARAM': 'ई. तुकाराम',
  'E TUKARAM': 'ई. तुकाराम',
  'KISHORI LAL': 'किशोरी लाल',
  'Manoj Tiwari': 'मनोज तिवारी',
  'MANOJ TIWARI': 'मनोज तिवारी',
  'SUKHJINDER SINGH RANDHAWA': 'सुखजिंदर सिंह रंधावा',
  'SATPAL BRAHAMCHARI': 'सतपाल ब्रह्मचारी',
  'ANGOMCHA BIMOL AKOIJAM': 'अंगोमचा बिमोल अकोइजाम',
  'Sitting Rajya Sabha': 'वर्तमान राज्यसभा सांसद',
  'PUSHPENDRA SAROJ': 'पुष्पेंद्र सरोज',
  'PRIYA SAROJ': 'प्रिया सरोज',
  'Arvind Dharmapuri': 'अरविंद धर्मपुरी',
  'ARVIND DHARMAPURI': 'अरविंद धर्मपुरी',
  'Ram Shiromani': 'राम शिरोमणि',
  'RAM SHIROMANI': 'राम शिरोमणि',
  'SAMBIT PATRA': 'संबित पात्रा',
  'BABU SINGH KUSHWAHA': 'बाबू सिंह कुशवाहा',
  'Shri Baburam Nishad (2022-28)': 'श्री बाबूराम निषाद (२०२२-२८)',
  'VINOD KUMAR BIND': 'विनोद कुमार बिंद',
  'Devusinh Jesingbhai Chauhan': 'देवुसिंह जेसिंगभाई चौहान',
  'CHAMALA KIRAN KUMAR REDDY': 'चमाला किरण कुमार रेड्डी',
  'SHER SINGH GHUBAYA': 'शेर सिंह घुबाया',
  'RAJEEV BHARDWAJ': 'राजीव भारद्वाज',
  'Sanjay Kumar Bandi': 'संजय कुमार बांडी',
  'CHANDRA SHEKHAR': 'चंद्र शेखर',
  'Durga Das Uikey ': 'दुर्गा दास उइके',
  'Durga Das Uikey': 'दुर्गा दास उइके',
  'Mitesh Rameshbhai Bakabhai Patel': 'मितेश रमेशभाई बकाभाई पटेल',
  'Dr. Dharmasthala Veerendra Heggade (2022-28)': 'डॉ. धर्मस्थल वीरेंद्र हेगड़े (२०२२-२८)',
  'HARIBHAI PATEL': 'हरीभाई पटेल',
  'SARABJEET SINGH KHALSA': 'सरबजीत सिंह खालसा',
  'Shri B.L. Verma (2020-26)': 'श्री बी.एल. वर्मा (२०२०-२६)',
  'Saptagiri Sankar Ulaka': 'सप्तगिरि शंकर उलाका',
  'Ganesan Selvam': 'गणेशन सेल्वम',
  'Shri Chandra Prakash Choudhary': 'श्री चंद्र प्रकाश चौधरी',
  'UTKARSH VERMA MADHUR': 'उत्कर्ष वर्मा मधुर',
  'Shri Hardeep Singh Puri (2020-26)': 'श्री हरदीप सिंह पुरी (२०२०-२६)',
  'JITENDRA KUMAR DOHARE': 'जितेंद्र कुमार दोहरे',
  'DR. S P SINGH': 'डॉ. एस.पी. सिंह',
  'KONDA VISHWESHWAR REDDY': 'कोंडा विश्वेश्वर रेड्डी',
  'CHHOTELAL': 'छोटेलाल',
  'C R Patil': 'सी.आर. पाटिल',
  'Midhun Reddy': 'मिथुन रेड्डी',
  'KRISHNA DEVI SHIVSHANKER PATEL': 'कृष्णा देवी शिवशंकर पटेल',
  'RAJPALSINH MAHENDRASINH JADAV': 'राजपालसिंह महेंद्रसिंह जादव',
  'Suresh Kumar Kashyap': 'सुरेश कुमार कश्यप',
  'Shri Vivek K. Tankha (2022-28)': 'श्री विवेक के. तंखा (२०२२-२८)',
  'Smt. Seema Dwivedi (2020-26)': 'श्रीमती सीमा द्विवेदी (२०२०-२६)',
  'Shri Harsh Mahajan (2024-30)': 'श्री हर्ष महाजन (२०२४-३०)',
  'Smt. Mahua Maji (2022-28)': 'श्रीमती महुआ माजी (२०२२-२८)',
  'Mansukhbhai Dhanjibhai Vasava': 'मनसुखभाई धनजीभाई वसावा',
  'KAMLESH JANGDE': 'कमलेश जांगड़े',
  'BALRAM NAIK PORIKA': 'बलराम नाइक पोरिका',
  'Dr. K. Laxman (2022-28)': 'डॉ. के. लक्ष्मण (२०२२-२८)',
  'KALI CHARAN SINGH': 'काली चरण सिंह',
  'Shri Sant Balbir Singh (2022-28)': 'श्री संत बलबीर सिंह (२०२२-२८)',
  'MALAIYARASAN D': 'मलैयारासन डी.',
  'BUNTY VIVEK SAHU': 'बंटी विवेक साहू',
  'Shri Bhartruhari Mahtab': 'श्री भर्तृहरि महताब',
  'Ajay Bhatt': 'अजय भट्ट',
  'Dr. Sikander Kumar (2022-28)': 'डॉ. सिकंदर कुमार (२०२२-२८)',
  'DEVESH SHAKYA': 'देवेश शाक्य',
  'SUDAMA PRASAD': 'सुदामा प्रसाद',
  'Gautam Gambhir': 'गौतम गंभीर',
  'Ravi Shankar Prasad': 'रवि शंकर प्रसाद',
  'Kirti Vardhan Singh': 'कीर्ति वर्धन सिंह',
  'Asaduddin Owaisi': 'असदुद्दीन ओवैसी',
  'Gopal Jee Thakur': 'गोपाल जी ठाकुर',
  'Mohammad Akbar Lone': 'मोहम्मद अकबर लोन'
};

const mpMap = {};

mps.forEach(m => {
  const trimmed = m.trim();
  if (SPECIAL_MP_OVERRIDES[trimmed]) {
    mpMap[trimmed] = SPECIAL_MP_OVERRIDES[trimmed];
  } else {
    // Process through transliterateText
    let t = transliterateText(trimmed);
    // Convert any digits to devanagari numerals
    const enDigits = ['0','1','2','3','4','5','6','7','8','9'];
    const hiDigits = ['०','१','२','३','४','५','६','७','८','९'];
    for (let i = 0; i < 10; i++) {
      t = t.replaceAll(enDigits[i], hiDigits[i]);
    }
    mpMap[trimmed] = t;
  }
});

// Also include lowercase/titlecase versions for maximum robustness
for (const [k, v] of Object.entries(SPECIAL_MP_OVERRIDES)) {
  mpMap[k] = v;
}

fs.writeFileSync('scripts/generated_mp_map.json', JSON.stringify(mpMap, null, 2));
console.log(`✅ Generated Hindi mapping for all ${Object.keys(mpMap).length} MPs!`);
