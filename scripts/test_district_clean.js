const testDistricts = [
  'North 24 Parganas(जिलाधिकारी NORTH TWENTY FOUR PARGANAS_IDA)',
  'उत्तर गोवा (जिला कलेक्टर उत्तर गोवा)',
  'BANKURA(जिलाधिकारी BANKURA_IDA)',
  'Y.S.R. Kadapa(जिला कलेक्टर CUDDAPAH_IDA)',
  'Vijayanagara(उपायुक्त VIJAYANAGARA_IDA)',
  'Amethi(DISTRICT MAGISTRAE AMETHI_IDA)',
  'EAST(आयुक्त EAST)',
  'NORTH EAST(आयुक्तMCD NORTH EAST)',
  'GURDASPUR(उपायुक्त GURDASPUR_IDA)',
  'JIND(उपायुक्त JIND)',
  'THOUBAL(उपायुक्त Thoubal MPLADS_ida)',
  'JAUNPUR(DISTRICT MAGISTRATE JAUNPUR_IDA)',
  'PATNA(DISTRICT PLANNING OFFICER PATNA_IDA)',
  'RANCHI(DEPUTY COMMISSIONER RANCHI_IDA)'
];

const DISTRICT_NAMES = {
  'NORTH 24 PARGANAS': 'उत्तर २४ परगना',
  'SOUTH 24 PARGANAS': 'दक्षिण २४ परगना',
  'NORTH TWENTY FOUR PARGANAS': 'उत्तर २४ परगना',
  'SOUTH TWENTY FOUR PARGANAS': 'दक्षिण २४ परगना',
  'BANKURA': 'बांकुड़ा',
  'Y.S.R. KADAPA': 'वाई.एस.आर. कडपा',
  'CUDDAPAH': 'कडपा',
  'KADAPA': 'कडपा',
  'VIJAYANAGARA': 'विजयनगर',
  'AMETHI': 'अमेठी',
  'EAST': 'पूर्व',
  'NORTH EAST': 'उत्तर पूर्व',
  'WEST': 'पश्चिम',
  'NORTH': 'उत्तर',
  'SOUTH': 'दक्षिण',
  'CENTRAL': 'मध्य',
  'GURDASPUR': 'गुरदासपुर',
  'JIND': 'जींद',
  'SONEPAT': 'सोनीपत',
  'THOUBAL': 'थौबल',
  'IMPHAL EAST': 'इंफाल पूर्व',
  'IMPHAL WEST': 'इंफाल पश्चिम',
  'JAUNPUR': 'जौनपुर',
  'PATNA': 'पटना',
  'RANCHI': 'रांची',
  'NORTH GOA': 'उत्तर गोवा',
  'SOUTH GOA': 'दक्षिण गोवा',
  'BELLARY': 'बेल्लारी',
  'BASIRHAT': 'बशीरहाट'
};

function cleanDistrict(d) {
  let res = d;
  // Replace roles
  res = res.replace(/DISTRICT\s+MAGISTRATE|DISTRICT\s+MAGISTRAE/gi, 'जिलाधिकारी')
           .replace(/DEPUTY\s+COMMISSIONER/gi, 'उपायुक्त')
           .replace(/DISTRICT\s+COLLECTOR/gi, 'जिला कलेक्टर')
           .replace(/DISTRICT\s+PLANNING\s+OFFICER/gi, 'जिला योजना अधिकारी')
           .replace(/COMMISSIONER/gi, 'आयुक्त')
           .replace(/_IDA|_ida|MPLADS_ida|MPLADS_IDA/gi, '')
           .replace(/आयुक्तMCD/gi, 'आयुक्त एमसीडी ')
           .replace(/\s+/g, ' ');

  // Sort district names by length descending
  const sortedNames = Object.entries(DISTRICT_NAMES).sort((a,b) => b[0].length - a[0].length);
  for (const [en, hi] of sortedNames) {
    res = res.replace(new RegExp('\\b' + en + '\\b', 'gi'), hi);
  }
  return res.trim();
}

testDistricts.forEach(d => {
  console.log(d, '=>', cleanDistrict(d));
});
