const fs = require('fs');
const path = require('path');

// Consonant clusters and consonants
const CONSONANTS = [
  ['ksh', 'क्ष'], ['gy', 'ज्ञ'], ['tr', 'त्र'],
  ['chh', 'छ'], ['ch', 'च'], ['kh', 'ख'], ['gh', 'घ'],
  ['jh', 'झ'], ['th', 'थ'], ['dh', 'ध'], ['ph', 'फ'],
  ['bh', 'भ'], ['sh', 'श'], ['shh', 'ष'],
  ['k', 'क'], ['g', 'ग'], ['j', 'ज'], ['t', 'ट'], ['d', 'ड'],
  ['n', 'न'], ['p', 'प'], ['b', 'ब'], ['m', 'म'], ['y', 'य'],
  ['r', 'र'], ['l', 'ल'], ['v', 'व'], ['w', 'व'], ['s', 'स'],
  ['h', 'ह'], ['z', 'ज़'], ['f', 'फ़'], ['q', 'क़']
];

// Independent Vowels (at beginning of word or syllable)
const IND_VOWELS = [
  ['aa', 'आ'], ['ee', 'ई'], ['oo', 'ऊ'], ['ai', 'ऐ'], ['au', 'औ'],
  ['a', 'अ'], ['i', 'इ'], ['u', 'उ'], ['e', 'ए'], ['o', 'ओ']
];

// Dependent Vowel Matras (after a consonant)
const MATRAS = [
  ['aa', 'ा'], ['ee', 'ी'], ['oo', 'ू'], ['ai', 'ै'], ['au', 'ौ'],
  ['a', ''], ['i', 'ि'], ['u', 'ु'], ['e', 'े'], ['o', 'ो']
];

// Common Titles, Names & Words
const COMMON_WORDS = {
  'DR': 'डॉ.',
  'DR.': 'डॉ.',
  'SHRI': 'श्री',
  'SMT': 'श्रीमती',
  'SMT.': 'श्रीमती',
  'ADV': 'अधिवक्ता',
  'ADV.': 'अधिवक्ता',
  'PROF': 'प्रोफेसर',
  'PROF.': 'प्रोफेसर',
  'KUMAR': 'कुमार',
  'SINGH': 'सिंह',
  'YADAV': 'यादव',
  'SHARMA': 'शर्मा',
  'PATEL': 'पटेल',
  'GUPTA': 'गुप्ता',
  'REDDY': 'रेड्डी',
  'PRASAD': 'प्रसाद',
  'VERMA': 'वर्मा',
  'PANDEY': 'पांडेय',
  'TIWARI': 'तिवारी',
  'CHOUHAN': 'चौहान',
  'CHAUHAN': 'चौहान',
  'CHAKRABORTY': 'चक्रवर्ती',
  'GANGOPADHYAY': 'गंगोपाध्याय',
  'BANERJEE': 'बनर्जी',
  'CHATTERJEE': 'चैटर्जी',
  'MUKHERJEE': 'मुखर्जी',
  'GARG': 'गर्ग',
  'DUBEY': 'दुबे',
  'MISHRA': 'मिश्रा',
  'JOSHI': 'जोशी',
  'LAL': 'लाल',
  'ISLAM': 'इस्लाम',
  'NURUL': 'नुरुल',
  'TUKARAM': 'तुकाराम',
  'RANDHAWA': 'रंधावा',
  'BRAHAMCHARI': 'ब्रह्मचारी',
  'AKOIJAM': 'अकोइजाम',
  'BIMOL': 'बिमोल',
  'ANGOMCHA': 'अंगोमचा',
  'SUKHJINDER': 'सुखजिंदर',
  'SATPAL': 'सतपाल',
  'MANOJ': 'मनोज',
  'ARUP': 'अरूप',
  'AVINASH': 'अविनाश',
  'KISHORI': 'किशोरी',
  'PUSHPENDRA': 'पुष्पेंद्र',
  'SAROJ': 'सरोज',
  'PRIYA': 'प्रिया',
  'ARVIND': 'अरविंद',
  'DHARMAPURI': 'धर्मपुरी',
  'RAM': 'राम',
  'SHIROMANI': 'शिरोमणि',
  'SAMBIT': 'संबित',
  'PATRA': 'पात्रा',
  'BABU': 'बाबू',
  'KUSHWAHA': 'कुशवाहा',
  'BABURAM': 'बाबूराम',
  'NISHAD': 'निषाद',
  'VINOD': 'विनोद',
  'BIND': 'बिंद',
  'DEVUSINH': 'देवुसिंह',
  'JESINGBHAI': 'जेसिंगभाई',
  'CHAMALA': 'चमाला',
  'KIRAN': 'किरण',
  'SHER': 'शेर',
  'GHUBAYA': 'घुबाया',
  'RAJEEV': 'राजीव',
  'BHARDWAJ': 'भारद्वाज',
  'SANJAY': 'संजय',
  'BANDI': 'बांडी',
  'CHANDRA': 'चंद्र',
  'SHEKHAR': 'शेखर',
  'DURGA': 'दुर्गा',
  'DAS': 'दास',
  'UIKEY': 'उइके',
  'MITESH': 'मितेश',
  'RAMESHBHAI': 'रमेशभाई',
  'BAKABHAI': 'बकाभाई',
  'DHARMASTHALA': 'धर्मस्थल',
  'VEERENDRA': 'वीरेंद्र',
  'HEGGADE': 'हेगड़े',
  'HARIBHAI': 'हरीभाई',
  'SARABJEET': 'सरबजीत',
  'KHALSA': 'खालसा',
  'SAPTAGIRI': 'सप्तगिरि',
  'SANKAR': 'शंकर',
  'ULAKA': 'उलाका',
  'GANESAN': 'गणेशन',
  'SELVAM': 'सेल्वम',
  'PRAKASH': 'प्रकाश',
  'CHOUDHARY': 'चौधरी',
  'UTKARSH': 'उत्कर्ष',
  'MADHUR': 'मधुर',
  'HARDEEP': 'हरदीप',
  'PURI': 'पुरी',
  'JITENDRA': 'जितेंद्र',
  'DOHARE': 'दोहरे',
  'KONDA': 'कोंडा',
  'VISHWESHWAR': 'विश्वेश्वर',
  'CHHOTELAL': 'छोटेलाल',
  'MIDHUN': 'मिथुन',
  'KRISHNA': 'कृष्णा',
  'DEVI': 'देवी',
  'SHIVSHANKER': 'शिवशंकर',
  'RAJPALSINH': 'राजपालसिंह',
  'MAHENDRASINH': 'महेंद्रसिंह',
  'SURESH': 'सुरेश',
  'KASHYAP': 'कश्यप',
  'VIVEK': 'विवेक',
  'TANKHA': 'तंखा',
  'SEEMA': 'सीमा',
  'DWIVEDI': 'द्विवेदी',
  'HARSH': 'हर्ष',
  'MAHAJAN': 'महाजन',
  'MAHUA': 'महुआ',
  'MAJI': 'माजी',
  'MANSUKHBHAI': 'मनसुखभाई',
  'DHANJIBHAI': 'धनजीभाई',
  'VASAVA': 'वसावा',
  'KAMLESH': 'कमलेश',
  'JANGDE': 'जांगड़े',
  'BALRAM': 'बलराम',
  'NAIK': 'नाइक',
  'PORIKA': 'पोरिका',
  'LAXMAN': 'लक्ष्मण',
  'KALI': 'काली',
  'CHARAN': 'चरण',
  'SANT': 'संत',
  'BALBIR': 'बलबीर',
  'MALAIYARASAN': 'मलैयारासन',
  'BUNTY': 'बंटी',
  'SAHU': 'साहू',
  'BHARTRUHARI': 'भर्तृहरि',
  'AJAY': 'अजय',
  'BHATT': 'भट्ट',
  'SIKANDER': 'सिकंदर',
  'DEVESH': 'देवेश',
  'SHAKYA': 'शाक्य',
  'RAHUL': 'राहुल',
  'GANDHI': 'गांधी',
  'NARENDRA': 'नरेंद्र',
  'MODI': 'मोदी',
  'AMIT': 'अमित',
  'SHAH': 'शाह',
  'RAJNATH': 'राजनाथ',
  'NITIN': 'नितिन',
  'GADKARI': 'गडकरी',
  'NIRMALAA': 'निर्मला',
  'SITHARAMAN': 'सीतारमण',
  'ASHWINI': 'अश्विनी',
  'VAISHNAW': 'वैष्णव',
  'JYOTIRADITYA': 'ज्योतिरादित्य',
  'SCINDIA': 'सिंधिया',
  'KIREN': 'किरेन',
  'RIJIJU': 'रिजिजू',
  'SADANAND': 'सदानंद',
  'MHALU': 'म्हाळू',
  'SHET': 'शेट',
  'TANAVADE': 'तनावड़े',
  'SITTING': 'वर्तमान',
  'RAJYA': 'राज्य',
  'SABHA': 'सभा',
  'LOK': 'लोक',
  'HON\'BLE': 'माननीय',
  'HON': 'माननीय'
};

// Transliterate single English word
function transliterateWord(word) {
  if (!word) return '';
  const upper = word.toUpperCase();
  if (COMMON_WORDS[upper]) return COMMON_WORDS[upper];

  // Check single letter initials (e.g., S, K, A, B, etc.)
  if (/^[A-Z]\.?$/.test(word)) {
    const letterMap = {
      'A': 'ए.', 'B': 'बी.', 'C': 'सी.', 'D': 'डी.', 'E': 'ई.',
      'F': 'एफ.', 'G': 'जी.', 'H': 'एच.', 'I': 'आई.', 'J': 'जे.',
      'K': 'के.', 'L': 'एल.', 'M': 'एम.', 'N': 'एन.', 'O': 'ओ.',
      'P': 'पी.', 'Q': 'क्यू.', 'R': 'आर.', 'S': 'एस.', 'T': 'टी.',
      'U': 'यू.', 'V': 'वी.', 'W': 'डब्ल्यू.', 'X': 'एक्स.', 'Y': 'वाई.', 'Z': 'जेड.'
    };
    return letterMap[upper.replace('.', '')] || word;
  }

  let str = word.toLowerCase();
  let result = '';
  let i = 0;

  while (i < str.length) {
    // Check consonant match
    let matchedConsonant = null;
    let consLen = 0;
    for (const [cStr, cDev] of CONSONANTS) {
      if (str.startsWith(cStr, i)) {
        matchedConsonant = cDev;
        consLen = cStr.length;
        break;
      }
    }

    if (matchedConsonant) {
      result += matchedConsonant;
      i += consLen;

      // Check following vowel
      let matchedMatra = null;
      let matraLen = 0;
      for (const [mStr, mDev] of MATRAS) {
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
        // If next char is another consonant (and not end of word), insert virama halant
        if (i < str.length && /[a-z]/i.test(str[i])) {
          let nextIsVowel = /^[aeiou]/i.test(str.slice(i));
          if (!nextIsVowel) {
            result += '्';
          }
        }
      }
    } else {
      // Independent vowel
      let matchedIndVowel = null;
      let vowelLen = 0;
      for (const [vStr, vDev] of IND_VOWELS) {
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
        // Non-alpha character (numbers, punctuation, symbols)
        result += str[i];
        i++;
      }
    }
  }

  return result;
}

function transliterateText(text) {
  if (!text) return '';
  return text.replace(/[a-zA-Z]+(?:\.[a-zA-Z]+)*|\./g, (token) => {
    return transliterateWord(token);
  });
}

// Test on user screenshot MPs
const testMPs = [
  'SK NURUL ISLAM',
  'Shri Sadanand Mhalu Shet Tanavade (2023-29)',
  'Sitting Rajya Sabha',
  'ARUP CHAKRABORTY',
  'Y S Avinash Reddy',
  'E. TUKARAM',
  'KISHORI LAL',
  'Manoj Tiwari',
  'SUKHJINDER SINGH RANDHAWA',
  'SATPAL BRAHAMCHARI',
  'ANGOMCHA BIMOL AKOIJAM'
];

console.log('--- TEST ON USER SCREENSHOT MPs ---');
testMPs.forEach(m => {
  console.log(m, '=>', transliterateText(m));
});

module.exports = {
  transliterateWord,
  transliterateText,
  COMMON_WORDS
};
