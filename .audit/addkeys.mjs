import fs from "fs";
const DIR = "C:/Users/patel/OneDrive/Desktop/khet kharcha/shared/i18n/";

// Keys added under "expense" (singular) for voice entry, mandi advisory and partner khata.
const ADDITIONS = {
  en: {
    expense: {
      speakExpense: "Speak expense",
      voiceTitle: "Speak your expense",
      voiceHint: 'Say the category and amount, e.g. "diesel do hazaar rupaye".',
      voiceTranscript: "What did you say?",
      detected: "Detected",
      useThis: "Use this",
      confidence: "Confidence",
      type: "Type",
      mandiTitle: "Mandi rate check",
      mandiGood: "Good price",
      mandiFair: "Fair price",
      mandiLow: "Sold below rate",
      mandiUnknown: "No reference rate for this crop",
      khataTitle: "Partner khata",
      khataBalance: "Balance",
      khataCredits: "Total credits",
      khataDebits: "Total debits",
      khataSettled: "Fully settled",
      khataPartnerOwes: "Partner owes Owner",
      khataOwnerOwes: "Owner owes Partner",
      khataShare: "Share",
    },
    common: { tapToSpeak: "Tap to speak", listening: "Listening..." },
  },
  hi: {
    expense: {
      speakExpense: "बोलकर खर्च दर्ज करें",
      voiceTitle: "अपना खर्च बोलें",
      voiceHint: 'श्रेणी और राशि बोलें, जैसे "डीजल दो हज़ार रुपये"।',
      voiceTranscript: "आपने क्या कहा?",
      detected: "पहचाना गया",
      useThis: "यही उपयोग करें",
      confidence: "विश्वास",
      type: "प्रकार",
      mandiTitle: "मंडी भाव जाँच",
      mandiGood: "अच्छा भाव",
      mandiFair: "सही भाव",
      mandiLow: "भाव कम मिला",
      mandiUnknown: "इस फसल का भाव उपलब्ध नहीं",
      khataTitle: "साझेदार खाता",
      khataBalance: "शेष",
      khataCredits: "कुल जमा",
      khataDebits: "कुल कटौती",
      khataSettled: "पूरा हिसाब बराबर",
      khataPartnerOwes: "साझेदार का मालिक पर",
      khataOwnerOwes: "मालिक का साझेदार पर",
      khataShare: "हिस्सा",
    },
    common: { tapToSpeak: "बोलने के लिए टैप करें", listening: "सुन रहा है..." },
  },
  gu: {
    expense: {
      speakExpense: "બોલીને ખર્ચ નોંધો",
      voiceTitle: "તમારો ખર્ચ બોલો",
      voiceHint: 'શ્રેણી અને રકમ બોલો, દા.ત. "ડીઝલ બે હજાર રૂપિયા"।',
      voiceTranscript: "તમે શું કહ્યું?",
      detected: "ઓળખાયું",
      useThis: "આ વાપરો",
      confidence: "વિશ્વાસ",
      type: "પ્રકાર",
      mandiTitle: "મંડી ભાવ ચકાસણી",
      mandiGood: "સારો ભાવ",
      mandiFair: "યોગ્ય ભાવ",
      mandiLow: "ઓછો ભાવ મળ્યો",
      mandiUnknown: "આ પાકનો ભાવ ઉપલબ્ધ નથી",
      khataTitle: "ભાગીદાર ખાતું",
      khataBalance: "બાકી",
      khataCredits: "કુલ જમા",
      khataDebits: "કુલ કપાત",
      khataSettled: "સંપૂર્ણ હિસાબ સરખો",
      khataPartnerOwes: "ભાગીદારનું માલિક પર",
      khataOwnerOwes: "માલિકનું ભાગીદાર પર",
      khataShare: "હિસ્સો",
    },
    common: { tapToSpeak: "બોલવા માટે ટેપ કરો", listening: "સાંભળી રહ્યું છે..." },
  },
  mr: {
    expense: {
      speakExpense: "बोलून खर्च नोंदवा",
      voiceTitle: "तुमचा खर्च बोला",
      voiceHint: 'श्रेणी आणि रक्कम सांगा, उदा. "डिझेल दोन हजार रुपये"।',
      voiceTranscript: "तुम्ही काय म्हणालात?",
      detected: "ओळखले",
      useThis: "हे वापरा",
      confidence: "विश्वास",
      type: "प्रकार",
      mandiTitle: "बाजारभाव तपासणी",
      mandiGood: "चांगला भाव",
      mandiFair: "योोग्य भाव",
      mandiLow: "कमी भाव मिळाला",
      mandiUnknown: "या पिकाचा भाव उपलब्ध नाही",
      khataTitle: "भागीदार खाते",
      khataBalance: "शिल्लक",
      khataCredits: "एकूण जमा",
      khataDebits: "एकूण वजा",
      khataSettled: "पूर्ण हिसेब समान",
      khataPartnerOwes: "भागीदाराचे मालकावर",
      khataOwnerOwes: "मालकाचे भागीदारावर",
      khataShare: "हिस्सा",
    },
    common: { tapToSpeak: "बोलण्यासाठी टॅप करा", listening: "ऐकत आहे..." },
  },
};

for (const [lang, sections] of Object.entries(ADDITIONS)) {
  const file = `${DIR}${lang}.json`;
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const [section, keys] of Object.entries(sections)) {
    if (!data[section]) data[section] = {};
    for (const [k, v] of Object.entries(keys)) data[section][k] = v;
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`updated ${lang}.json`);
}
