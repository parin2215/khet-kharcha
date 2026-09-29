import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore.js';
import { 
  Globe, ArrowRight, Shield, Award, Landmark, TrendingUp,
  AlertTriangle, BookOpen, Clock, Heart, Users, FileText,
  DollarSign, CheckCircle2, ChevronRight, Sparkles, Scale, Wheat, Droplet, UserCheck, ShieldAlert, Scissors, Hammer, Truck, Eye, Navigation, HelpCircle
} from 'lucide-react';

const TRANSLATIONS = {
  en: {
    tagline: "Your farm's account",
    heroHeadline: "Your Farm. Your Expenses. Your Control.",
    heroSub: "Track every rupee spent on your farm — seeds, fertilizer, electricity, labour — and manage partnerships with clarity.",
    getStartedFree: "Get Started Free",
    seeHowItWorks: "See How It Works",
    goToDashboard: "Go to Dashboard →",
    login: "Login",
    problemTitle: "Farmers work hard. Keeping track shouldn't be hard.",
    problem1Title: "Paper records get lost in the rain",
    problem1Desc: "Notebooks get wet, torn, or misplaced in the fields. Keep your logs safe on your phone.",
    problem2Title: "Partnership disputes over who paid what",
    problem2Desc: "Never fight over shared costs. Track every split payment transparently with your partner.",
    problem3Title: "No idea where money went at end of season",
    problem3Desc: "Know exactly how much you spent on seeds, fertilizer, and diesel this season.",
    featuresTitle: "Powering Indian Agriculture",
    featuresSub: "Smart tools built for modern Indian farming operations.",
    feat1Title: "Expense Tracking",
    feat1Desc: "Log every farm expense by category — Beej, Khad, Keetnashak, Bijli, Majdoori and more.",
    feat2Title: "Own Farm vs Partner Farm",
    feat2Desc: "Clearly separate your own farm expenses from partnership farms. Never mix up accounts again.",
    feat3Title: "Partnership Agreement Builder",
    feat3Desc: "Create a legal-style written agreement with your partner — crop share %, expense responsibilities, work obligations — all in one document.",
    feat4Title: "Partner Settlement",
    feat4Desc: "Automatically calculate who owes whom at the end of the season. No arguments, just numbers.",
    feat5Title: "Bills & Reminders",
    feat5Desc: "Track electricity bills, loan EMIs, and equipment rent. Get reminders before due dates.",
    feat6Title: "Season Reports",
    feat6Desc: "See your total spending per season — Kharif, Rabi, Zaid — broken down by category and farm.",
    howItWorksTitle: "How Khet Kharcha Works",
    howItWorksSub: "Simple 3-step setup to master your agricultural accounts.",
    step1Title: "Add your farms",
    step1Desc: "Create your own and partnership farm plots.",
    step2Title: "Log operational expenses",
    step2Desc: "Enter costs in 10 seconds right from the field.",
    step3Title: "See reports & settle",
    step3Desc: "Instantly check totals and settlements at harvest.",
    spotlightTitle: "Stop arguing. Start agreeing.",
    spotlightSub: "Before the season starts, set everything in writing — who gets what % of the crop, who pays for seeds, who does the irrigation. Generate a ready-to-sign agreement in minutes.",
    spotlightBullet1: "Set crop share % for owner and partners",
    spotlightBullet2: "Define who pays for each expense category",
    spotlightBullet3: "Write partner work obligations",
    spotlightBullet4: "Print or save as PDF",
    spotlightBullet5: "Save to your account for future reference",
    spotlightCTA: "Create Your First Agreement",
    stats1: "10,000+ Farmers",
    stats1Desc: "managing their crop cycles",
    stats2: "₹2 Crore+",
    stats2Desc: "expenses tracked",
    stats3: "4 Indian Languages",
    stats3Desc: "fully supported natively",
    stats4: "Works Offline",
    stats4Desc: "no signal needed in field",
    testimonialsTitle: "Trusted by Farmers Across India",
    testimonialsSub: "Here is how Khet Kharcha is helping families manage their legacy lands.",
    t1Name: "Ramesh Patel",
    t1Village: "Nadiad, Gujarat",
    t2Name: "Suresh Kumar",
    t2Village: "Jhansi, UP",
    t3Name: "Anita Deshmukh",
    t3Village: "Nashik, Maharashtra",
    languageSectionTitle: "Available in your language",
    languageSectionSub: "More languages coming soon",
    ctaTitle: "Start tracking your farm expenses today — it's free",
    ctaButton: "Create Free Account",
    footerText: "Made with ❤️ for Indian Farmers 🌾",
    copyright: "© 2025 Khet Kharcha. All rights reserved."
  },
  hi: {
    tagline: "अपने खेत का हिसाब",
    heroHeadline: "आपका खेत। आपका खर्च। आपका नियंत्रण।",
    heroSub: "अपने खेत पर होने वाले हर खर्च — जैसे बीज, खाद, बिजली, मजदूरी — का हिसाब रखें और पूरी पारदर्शिता के साथ सांझेदारी संभालें।",
    getStartedFree: "मुफ्त में शुरू करें",
    seeHowItWorks: "देखें यह कैसे काम करता है",
    goToDashboard: "डैशबोर्ड पर जाएं →",
    login: "लॉगिन",
    problemTitle: "किसान मेहनत करते हैं। हिसाब रखना मुश्किल नहीं होना चाहिए।",
    problem1Title: "कागजी हिसाब बारिश में खराब हो जाता है",
    problem1Desc: "खेतों में डायरियां गीली हो जाती हैं या खो जाती हैं। अपने मोबाइल पर हिसाब सुरक्षित रखें।",
    problem2Title: "सांझेदार के साथ खर्चों को लेकर अनबन",
    problem2Desc: "साझा खर्चों पर लड़ाई बंद करें। अपने पार्टनर के साथ हर लेनदेन का साफ हिसाब रखें।",
    problem3Title: "फसल कटने पर पता नहीं चलता कि कमाई कहां गई",
    problem3Desc: "मौसम के अंत में जानें कि आपने बीज, खाद और डीजल पर कुल कितना खर्च किया है।",
    featuresTitle: "भारतीय कृषि के लिए आधुनिक साधन",
    featuresSub: "हमारे देश के किसानों की जरूरतों के अनुसार बनाए गए खास फीचर्स।",
    feat1Title: "खर्चों का हिसाब",
    feat1Desc: "अपने सभी कृषि खर्चों को कैटेगरी के अनुसार लिखें — जैसे बीज, खाद, कीटनाशक, बिजली, मजदूरी आदि।",
    feat2Title: "खुद की खेती बनाम बटाई (सांझेदारी)",
    feat2Desc: "अपने खुद के खेतों और बटाई/साझा खेतों के खातों को बिल्कुल अलग रखें। हिसाब कभी मिक्स नहीं होगा।",
    feat3Title: "भागीदारी समझौता पत्र (एग्रीमेंट)",
    feat3Desc: "पार्टनर के साथ फसल हिस्सेदारी, खर्च बंटवारे और काम की जिम्मेदारियों का लिखित समझौता तैयार करें।",
    feat4Title: "सांझेदारी का निपटारा",
    feat4Desc: "मौसम के अंत में ऐप खुद बताएगा कि किसको किसे कितना पैसा देना है। बिना किसी विवाद के सही आंकड़े।",
    feat5Title: "बिल और याद दिलाना (रिमाइंडर)",
    feat5Desc: "बिजली के बिल, कर्ज की किस्त और ट्रैक्टर किराए पर नज़र रखें। समय से पहले रिमाइंडर पाएं।",
    feat6Title: "सीजनल रिपोर्ट",
    feat6Desc: "खरीफ, रबी और जायद फसलों की कुल लागत, कैटेगरी और खेत के अनुसार देखें।",
    howItWorksTitle: "खेत खर्चा कैसे काम करता है?",
    howItWorksSub: "अपने खेती के हिसाब को संभालने के लिए 3 आसान कदम।",
    step1Title: "अपने खेत जोड़ें",
    step1Desc: "अपने खुद के और सांझेदारी (बटाई) वाले खेतों की जानकारी डालें।",
    step2Title: "रोज का खर्चा दर्ज करें",
    step2Desc: "खेत से ही सिर्फ 10 सेकंड में खर्चों को ऐप में लिखें।",
    step3Title: "हिसाब और रिपोर्ट देखें",
    step3Desc: "कटाई के समय पूरी रिपोर्ट देखें और आपसी हिसाब तुरंत निपटाएं।",
    spotlightTitle: "बहस बंद करें। मिलकर समझौता करें।",
    spotlightSub: "सीजन शुरू होने से पहले ही सब कुछ लिखित में तय करें — फसल का कितना हिस्सा किसे मिलेगा, बीज का खर्च कौन देगा और सिंचाई कौन करेगा। मिनटों में हस्ताक्षर के लिए तैयार समझौता पत्र तैयार करें।",
    spotlightBullet1: "मालिक और साझेदार की फसल हिस्सेदारी तय करें",
    spotlightBullet2: "तय करें कि हर कैटेगरी का खर्च कौन और कितना उठाएगा",
    spotlightBullet3: "साझेदार के काम की जिम्मेदारियां लिखें",
    spotlightBullet4: "प्रिंट करें या पीडीएफ (PDF) के रूप में सेव करें",
    spotlightBullet5: "भविष्य के लिए अपने अकाउंट में सुरक्षित रखें",
    spotlightCTA: "अपना पहला समझौता पत्र बनाएं",
    stats1: "10,000+ किसान",
    stats1Desc: "जो अपने खेतों का हिसाब रख रहे हैं",
    stats2: "₹2 करोड़+",
    stats2Desc: "का खर्चा ट्रैक किया गया",
    stats3: "4 भारतीय भाषाएं",
    stats3Desc: "पूरी तरह से ऐप में उपलब्ध हैं",
    stats4: "बिना इंटरनेट चलता है",
    stats4Desc: "खेतों में बिना नेटवर्क के भी चलता है",
    testimonialsTitle: "देश के किसानों का भरोसा",
    testimonialsSub: "देखिए कैसे खेत खर्चा किसानों को उनकी विरासत संभालने में मदद कर रहा है।",
    t1Name: "रमेश पटेल",
    t1Village: "नडियाद, गुजरात",
    t2Name: "सुरेश कुमार",
    t2Village: "झांसी, उत्तर प्रदेश",
    t3Name: "अनिता देशमुख",
    t3Village: "नाशिक, महाराष्ट्र",
    languageSectionTitle: "आपकी अपनी भाषा में उपलब्ध",
    languageSectionSub: "जल्द ही और भी भाषाएं आ रही हैं",
    ctaTitle: "आज ही अपने खेतों का हिसाब रखना शुरू करें — यह बिल्कुल मुफ्त है",
    ctaButton: "मुफ्त अकाउंट बनाएं",
    footerText: "भारतीय किसानों के लिए ❤️ के साथ बनाया गया 🌾",
    copyright: "© 2025 खेत खर्चा। सभी अधिकार सुरक्षित हैं।"
  },
  gu: {
    tagline: "તમારા ખેતરનો હિસાબ",
    heroHeadline: "તમારું ખેતર. તમારો ખર્ચ. તમારો કાબૂ.",
    heroSub: "તમારા ખેતરમાં થતા દરેક ખર્ચ — જેમ કે બિયારણ, ખાતર, લાઈટ બિલ, મજૂરી — નો હિસાબ રાખો અને પૂરી પારદર્શકતા સાથે ભાગીદારી સંભાળો.",
    getStartedFree: "મફતમાં શરૂ કરો",
    seeHowItWorks: "જુઓ તે કેવી રીતે કામ કરે છે",
    goToDashboard: "ડેશબોર્ડ પર જાઓ →",
    login: "લોગિન",
    problemTitle: "ખેડૂતો મહેનત કરે છે. હિસાબ રાખવો અઘરો ન હોવો જોઈએ.",
    problem1Title: "કાગળનો હિસાબ વરસાદમાં પલળી જાય છે",
    problem1Desc: "ખેતરમાં ચોપડા ભીના થઈ જાય છે અથવા ખોવાઈ જાય છે. તમારા મોબાઇલમાં હિસાબ સુરક્ષિત રાખો.",
    problem2Title: "ભાગીદાર સાથે ખર્ચ અંગે વિવાદ",
    problem2Desc: "સાથે કરેલા ખર્ચ અંગે ઝઘડો બંધ કરો. ભાગીદાર સાથે દરેક હિસાબ એકદम ચોખ્ખો રાખો.",
    problem3Title: "પાક વેચાયા પછી ખબર નથી પડતી કમાણી ક્યાં ગઈ",
    problem3Desc: "સીઝન પૂરી થતાં જ જાણી શકો છો કે બિયારણ, ખાતર અને ડીઝલમાં કેટલો ખર્ચ થયો.",
    featuresTitle: "ખેતી માટે આધુનિક સુવિધાઓ",
    featuresSub: "ખેડૂતોની જરૂરિયાતોને ધ્યાનમાં રાખીને બનાવેલા ખાસ ફીચર્સ.",
    feat1Title: "ખર્ચનો હિસાબ",
    feat1Desc: "ખેતીના તમામ ખર્ચાઓ વર્ગીકરણ સાથે લખો — જેમ કે બિયારણ, ખાતર, દવાઓ, લાઈટ બિલ, મજૂરી વગેરે.",
    feat2Title: "પોતાનું ખેતર વિ. ભાગીદારીનું ખેતર",
    feat2Desc: "પોતાના ખેતર અને ભાગીદારીના ખેતરના ખાતાઓ એકદમ અલગ રાખો. હિસાબ ક્યારેય મિક્સ નહીં થાય.",
    feat3Title: "ભાગીદારી સમજૂતી પત્રક (એગ્રીમેન્ટ)",
    feat3Desc: "ભાગીદાર સાથે પાકની વહેંચણી, ખર્ચનો ભાગ અને કામની જવાબદારીનો લેખિત દસ્તાવેજ બનાવો.",
    feat4Title: "ભાગીદારીની વહેંચણી",
    feat4Desc: "પાક તૈયાર થાય ત્યારે એપ આપોઆપ જણાવશે કે કોણે કોને કેટલા રૂપિયા આપવાના છે. સચોટ હિસાબ.",
    feat5Title: "બિલ અને રીમાઇન્ડર",
    feat5Desc: "લાઈટ બિલ, લોન અને ટ્રેક્ટરના ભાડા પર નજર રાખો. નિયત તારીખ પહેલા રીમાઇન્ડર મેળવો.",
    feat6Title: "મોસમની રિપોર્ટ",
    feat6Desc: "ખરીફ, રવિ અને ઉનાળુ પાકનો કુલ ખર્ચ, કેટેગરી અને ખેતર મુજબ જુઓ.",
    howItWorksTitle: "ખેત ખર્ચ કેવી રીતે કામ કરે છે?",
    howItWorksSub: "ખેતીના હિસાબને મેનેજ કરવા માટેના ૩ સરળ સ્ટેપ્સ.",
    step1Title: "તમારા ખેતરો ઉમેરો",
    step1Desc: "પોતાના ખેતરો અને ભાગીદારીના પ્લોટ્સની વિગતો નાખો.",
    step2Title: "રોજનો ખર્ચ નોંધો",
    step2Desc: "ખેતરમાંથી જ ફક્ત ૧૦ સેકન્ડમાં ખર્ચ લખો.",
    step3Title: "રિપોર્ટ અને હિસાબ જુઓ",
    step3Desc: "કાપણી વખતે હિસાબની વહેંચણી આપોઆપ પતાવો.",
    spotlightTitle: "દલીલો બંધ કરો. સમજૂતી શરૂ કરો.",
    spotlightSub: "સીઝન શરૂ થાય તે પહેલાં જ બધું લખાણમાં નક્કી કરો — પાકનો કેટલો ટકા ભાગ કોને મળશે, બિયારણનો ખર્ચ કોણ ચૂકવશે અને પાણી કોણ આપશે. મિનિટોમાં સહી કરવા લાયક એગ્રીમેન્ટ બનાવો.",
    spotlightBullet1: "માલિક અને ભાગીદારની પાક વહેંચણી નક્કી કરો",
    spotlightBullet2: "દરેક કેટેગરીનો ખર્ચ કોણ ભોગવશે તે નક્કી કરો",
    spotlightBullet3: "ભાગીદારના કામની વિગતો લખો",
    spotlightBullet4: "પ્રિન્ટ કરો અથવા પીડીએફ (PDF) તરીકે સેવ કરો",
    spotlightBullet5: "ભવિષ્ય માટે તમારા ખાતામાં ઓનલાઇન સાચવી રાખો",
    spotlightCTA: "તમારું પહેલું સમજૂતી પત્રક બનાવો",
    stats1: "૧૦,૦00+ ખેડૂતો",
    stats1Desc: "જેઓ પોતાના હિસાબ મેનેજ કરી રહ્યા છે",
    stats2: "₹૨ કરોડ+",
    stats2Desc: "ખર્ચ ટ્રેક કરવામાં આવ્યો",
    stats3: "૪ ભારતીય ભાષાઓ",
    stats3Desc: "એપમાં સંપૂર્ણ માતૃભાષા સપોર્ટ ઉપલબ્ધ",
    stats4: "નેટ વગર ચાલે",
    stats4Desc: "ખેતરમાં નેટવર્ક ન હોય તો પણ ચાले",
    testimonialsTitle: "ખેડૂતોનો અતૂટ વિશ્વાસ",
    testimonialsSub: "જુઓ કેવી રીતે ખેત ખર્ચ ખેડૂતોના હિસાબ ચોખ્ખા રાખી રહ્યું છે.",
    t1Name: "રમેશ પટેલ",
    t1Village: "નડિયાદ, ગુજરાત",
    t2Name: "સુરેશ કુમાર",
    t2Village: "ઝાંસી, ઉત્તર પ્રદેશ",
    t3Name: "અનીતા દેશમુખ",
    t3Village: "નાસિક, મહારાષ્ટ્ર",
    languageSectionTitle: "તમારી ભાષામાં ઉપલબ્ધ",
    languageSectionSub: "નવી ભાષાઓ ટૂંક સમયમાં ઉમેરાશે",
    ctaTitle: "આજે જ તમારા ખેતરનો હિસાબ રાખવાનું શરૂ કરો — એકદમ મફત છે",
    ctaButton: "મફત એકાઉન્ટ બનાવો",
    footerText: "ખેડૂતો માટે ખાસ પ્રેમપૂર્વક બનાવેલ 🌾",
    copyright: "© ૨૦૨૫ ખેત ખર્ચ. સર્વ હક સ્વાધીન."
  },
  mr: {
    tagline: "तुमच्या शेताचा हिशोब",
    heroHeadline: "तुमचं शेत. तुमचा खर्च. तुमचं नियंत्रण.",
    heroSub: "तुमच्या शेतावरील प्रत्येक रुपयाचा हिसाब ठेवा — बी-बियाणे, खते, वीज बिल, मजुरी — आणि भागीदारासोबतचा हिशोब स्पष्ट ठेवा.",
    getStartedFree: "विनामूल्य सुरू करा",
    seeHowItWorks: "हे कसे काम करते ते पहा",
    goToDashboard: "डॅशबोर्डवर जा →",
    login: "लॉगिन",
    problemTitle: "शेतकरी मेहनत करतात. हिशोब ठेवणे कठीण नसावे.",
    problem1Title: "कागदी हिशोब पावसात खराब होतो",
    problem1Desc: "शेतात वह्या ओल्या होतात किंवा हरवतात. आपल्या हिशोबाची नोंद मोबाईलमध्ये सुरक्षित ठेवा.",
    problem2Title: "भागीदार किंवा वाटदारासोबत खर्चावरून भांडण",
    problem2Desc: "सामायिक खर्चावरून वाद घालणे बंद करा. भागीदारासोबत प्रत्येक खर्चाचा पारदर्शक हिशोब ठेवा.",
    problem3Title: "हंगाम संपल्यावर पैसे कुठे गेले हे समजत नाही",
    problem3Desc: "बी-बियाणे, खते आणि डिझेलवर एकूण किती खर्च झाला, हे अचूकपणे जाणून घ्या.",
    featuresTitle: "भारतीय शेतीसाठी स्मार्ट साधने",
    featuresSub: "आपल्या शेतकऱ्यांच्या गरजेनुसार बनवलेले आधुनिक फीचर्स.",
    feat1Title: "खर्चाचा हिशोब",
    feat1Desc: "शेतीमधील प्रत्येक खर्च वर्गवारीनुसार नोंदवा — बी-बियाणे, खते, औषधे, वीज बिल, मजुरी इ.",
    feat2Title: "स्वतःची शेती वि. भागीदारीची शेती",
    feat2Desc: "स्वतःच्या शेतीचे आणि भागीदारीच्या शेतीचे हिशोब पूर्णपणे वेगळे ठेवा. हिशोब कधीच मिक्स होणार नाही.",
    feat3Title: "भागीदारी करारनामा (Agreement)",
    feat3Desc: "भागीदारासोबत पिकाचा वाटा, खर्चाची टक्केवारी आणि कामाची जबाबदारी यांचा लिखित करारनामा बनवा.",
    feat4Title: "भागीदाराचा हिशोब",
    feat4Desc: "हंगाम संपल्यावर कोणाचे किती देणे-घेणे आहे, हे मोबाईल स्वतः मोजेल. अचूक आकडेवारी.",
    feat5Title: "बिल आणि आठवण (रिमाइंडर)",
    feat5Desc: "वीज बिल, कर्जाचे हप्ते आणि ट्रॅक्टर भाडे यावर लक्ष ठेवा. अंतिम मुदतीपूर्वी आठवण मिळवा.",
    feat6Title: "हंगामी अहवाल",
    feat6Desc: "खरीप, रब्बी आणि उन्हाळी हंगामातील एकूण खर्च, वर्गवारीनुसार आणि शेतानुसार तपासा.",
    howItWorksTitle: "खेत खर्चा कसे काम करते?",
    howItWorksSub: "शेतीचा हिशोब सोपा करण्यासाठी ३ सोप्या पायऱ्या.",
    step1Title: "शेत जोडा",
    step1Desc: "तुमच्या स्वतःच्या आणि भागीदारीच्या शेतांची माहिती टाका.",
    step2Title: "खर्च नोंदवा",
    step2Desc: "शेतातूनच केवळ १० सेकंदात रोजचे खर्च मोबाईलमध्ये लिहा.",
    step3Title: "हिशोब पूर्ण करा",
    step3Desc: "पीक निघाल्यावर आपोआप हिशोब आणि अहवाल पूर्ण करा.",
    spotlightTitle: "भांडण नको, लेखी करार हवा.",
    spotlightSub: "हंगाम सुरू होण्यापूर्वीच सर्व गोष्टी लेखी ठरवा — पिकाचा किती वाटा कोणाला मिळणार, बियाण्यांचा खर्च कोण करणार आणि पाणी कोण देणार. काही मिनिटांत स्वाक्षरीसाठी करारनामा तयार करा.",
    spotlightBullet1: "मालक आणि भागीदाराचा पिकातील वाटा निश्चित करा",
    spotlightBullet2: "प्रत्येक प्रकारचा खर्च कोण आणि किती देणार ते ठरवा",
    spotlightBullet3: "भागीदाराच्या कामाच्या जबाबदाऱ्या नोंदवा",
    spotlightBullet4: "प्रिंट करा किंवा पीडीएफ (PDF) म्हणून सेव्ह करा",
    spotlightBullet5: "भविष्यासाठी तुमच्या खात्यात सुरक्षित साठवून ठेवा",
    spotlightCTA: "तुमचा पहिला करारनामा बनवा",
    stats1: "१०,०००+ शेतकरी",
    stats1Desc: "जे आपल्या शेताचा हिशोब ठेवत आहेत",
    stats2: "₹२ कोटी+",
    stats2Desc: "चा खर्च ट्रॅक केला गेला",
    stats3: "४ भारतीय भाषा",
    stats3Desc: "पूर्ण मातृभाषा सपोर्ट उपलब्ध",
    stats4: "इंटरनेटशिवाय चालते",
    stats4Desc: "शेतात नेटवर्क नसले तरीही काम करते",
    testimonialsTitle: "शेतकऱ्यांचा विश्वासू सोबती",
    testimonialsSub: "बघा कशा प्रकारे खेत खर्चा शेतकऱ्यांना त्यांची शेती सांभाळण्यास मदत करत आहे.",
    t1Name: "रमेश पटेल",
    t1Village: "नडियाद, गुजरात",
    t2Name: "सुरेश कुमार",
    t2Village: "झांसी, उत्तर प्रदेश",
    t3Name: "अनिता देशमुख",
    t3Village: "नाशिक, महाराष्ट्र",
    languageSectionTitle: "तुमच्या भाषेत उपलब्ध",
    languageSectionSub: "लवकरच नवीन भाषा जोडल्या जातील",
    ctaTitle: "आजच तुमच्या शेतीचा हिशोब ठेवण्यास सुरुवात करा — हे पूर्णपणे मोफत आहे",
    ctaButton: "मोफत खाते तयार करा",
    footerText: "शेतकऱ्यांसाठी प्रेमाने बनवलेले 🌾",
    copyright: "© २०२५ खेत खर्चा. सर्व हक्क राखीव."
  }
};

const LANGUAGES_LIST = [
  { code: 'en', native: 'English', flag: '🇬🇧', cta: 'Continue in English' },
  { code: 'hi', native: 'हिंदी', flag: '🇮🇳', cta: 'हिंदी में जारी रखें' },
  { code: 'gu', native: 'ગુજરાતી', flag: '🌾', cta: 'ગુજરાતીમાં આગળ વધો' },
  { code: 'mr', native: 'मराठी', flag: '🚜', cta: 'मराठीत सुरू ठेवा' }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedLang, setSelectedLang] = useState(localStorage.getItem('khet_kharcha_lang') || '');
  const [showLangSelector, setShowLangSelector] = useState(!localStorage.getItem('khet_kharcha_lang'));

  const selectLanguage = (code) => {
    localStorage.setItem('khet_kharcha_lang', code);
    setSelectedLang(code);
    // Apply lang to i18n if possible
    window.location.reload(); // Quick refresh to boot i18n
  };

  const handleScrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (showLangSelector) {
    return (
      <div className="min-h-screen flex flex-col justify-between items-center p-6 bg-gradient-to-br from-amber-50 via-stone-50 to-emerald-50">
        
        {/* Top Space / Branding */}
        <div className="w-full text-center mt-12 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600/10 text-emerald-700 rounded-3xl mb-1 shadow-inner animate-bounce">
            <Wheat className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-stone-900">
            Khet Kharcha
          </h1>
          
          {/* Multilingual Tagline */}
          <div className="flex flex-col gap-1 mt-2 text-stone-400 font-semibold text-xs leading-normal">
            <span>Your Farm's Account</span>
            <span>• अपने खेत का हिसाब</span>
            <span>• તમારા ખેતરનો હિસાબ</span>
            <span>• तुमच्या शेताचा हिशोब</span>
          </div>
        </div>

        {/* Language Selection Grid */}
        <div className="w-full max-w-xl mx-auto my-8">
          <h2 className="text-center text-sm font-extrabold text-stone-400 uppercase tracking-widest mb-6">Select Language / भाषा चुनें</h2>
          <div className="grid grid-cols-2 gap-4">
            {LANGUAGES_LIST.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => selectLanguage(lang.code)}
                className="p-6 bg-white border border-stone-200/50 hover:border-emerald-600 rounded-2xl text-left transition duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer flex flex-col justify-between min-h-[140px]"
              >
                <span className="text-3xl">{lang.flag}</span>
                <div>
                  <h3 className="text-lg font-extrabold text-stone-850 mt-2">{lang.native}</h3>
                  <p className="text-[10px] text-stone-400 font-bold mt-1 flex items-center gap-1">
                    {lang.cta} <ChevronRight className="w-3 h-3" />
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-6 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          Secure Farmer Ledger System
        </div>

      </div>
    );
  }

  const text = TRANSLATIONS[selectedLang] || TRANSLATIONS.en;

  const t1Quote = "પહેલાં હિસાબ રાખવામાં બહુ માથાકૂટ થતી હતી, પણ જ્યારથી આ એપ વાપરી છે ત્યારથી બધી ચિંતા દૂર થઈ ગઈ છે. ભાગીદારીનો હિસાબ એકદમ પાક્કો રહે છે!";
  const t2Quote = "कागज़ पर लिखा खो जाता था, लेकिन अब मोबाइल पर सारा खर्चा दर्ज रहता है। फसल कटने पर हिसाब करना बहुत ही आसान हो गया है।";
  const t3Quote = "भागीदारीच्या शेतीमध्ये खर्चाचे नियोजन करणे खूप कठीण होते. आता कष्टाच्या घामाचा प्रत्येक रुपया कुठे गेला, हे आम्हाला स्पष्ट दिसते.";

  return (
    <div className="min-h-screen bg-[#FFF8E7]/30 text-stone-850 font-sans selection:bg-emerald-200">
      
      {/* ━━━ NAVBAR ━━━ */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-stone-200/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center">
              <Wheat className="w-5.5 h-5.5" />
            </div>
            <span className="text-lg font-black text-stone-900 tracking-tight">Khet Kharcha</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-bold text-stone-600">
            <a href="#features" className="hover:text-emerald-700 transition">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-700 transition">How it works</a>
            <a href="#agreement" className="hover:text-emerald-700 transition">Agreement Builder</a>
            <a href="#testimonials" className="hover:text-emerald-700 transition">Testimonials</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLangSelector(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-200/50 rounded-xl text-xs font-bold text-stone-700 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              {LANGUAGES_LIST.find(l => l.code === selectedLang)?.native || 'Language'}
            </button>

            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-emerald-750 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer flex items-center gap-1"
              >
                {text.goToDashboard}
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 font-bold text-xs cursor-pointer"
                >
                  {text.login}
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  {text.getStartedFree}
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ━━━ HERO SECTION ━━━ */}
      <section className="relative overflow-hidden bg-gradient-to-tr from-[#FF9933]/15 via-white to-[#2D6A4F]/15 py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-stone-200/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              100% Free Farmer App
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black text-stone-950 leading-tight">
              {text.heroHeadline}
            </h1>
            
            <p className="text-sm sm:text-base text-stone-500 font-medium leading-relaxed">
              {text.heroSub}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {user ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-md hover:shadow-xl transition text-sm flex justify-center items-center gap-2 cursor-pointer"
                >
                  {text.goToDashboard}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-md hover:shadow-xl transition text-sm flex justify-center items-center gap-2 cursor-pointer"
                  >
                    {text.ctaButton}
                    <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={handleScrollToHowItWorks}
                    className="px-8 py-3.5 bg-white border border-stone-250 hover:bg-stone-50 text-stone-600 font-bold rounded-2xl shadow-sm transition text-sm cursor-pointer"
                  >
                    {text.seeHowItWorks}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Hero Visual Mockup */}
          <div className="relative flex justify-center items-center">
            
            {/* Background elements */}
            <div className="absolute w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl" />
            <div className="absolute w-48 h-48 bg-amber-500/10 rounded-full blur-2xl -bottom-10" />

            <div className="relative bg-stone-900 rounded-[3rem] p-3.5 shadow-2xl border-4 border-stone-850 w-72 md:w-80 overflow-hidden transform hover:scale-[1.02] transition duration-500 rotate-2">
              <div className="absolute top-0 inset-x-0 h-4 bg-stone-900 rounded-b-xl flex items-center justify-center z-10">
                <div className="w-16 h-4 bg-stone-900 rounded-b-xl" />
              </div>
              <div className="bg-[#F7F7F5] rounded-[2.5rem] overflow-hidden aspect-[9/19] flex flex-col p-4 space-y-4">
                
                {/* Simulated dashboard */}
                <div className="flex justify-between items-center border-b border-stone-200/50 pb-2 mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-6 h-6 bg-emerald-600 text-white rounded-md flex items-center justify-center font-bold text-xs">🌾</span>
                    <span className="text-[10px] font-black">Khet Kharcha</span>
                  </div>
                  <span className="text-[9px] bg-amber-500/10 text-amber-700 font-bold px-1.5 py-0.5 rounded">Gujarat</span>
                </div>

                <div className="p-3 bg-white border border-stone-200/50 rounded-xl text-center space-y-1">
                  <span className="text-[8px] font-bold text-stone-400 block uppercase">Total Expense</span>
                  <span className="text-lg font-black text-stone-950 block">₹45,500</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                    <span className="text-[7px] text-emerald-600 font-bold block uppercase">Owner Share</span>
                    <span className="text-xs font-extrabold text-emerald-800">₹22,750</span>
                  </div>
                  <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-center">
                    <span className="text-[7px] text-amber-700 font-bold block uppercase">Partner Share</span>
                    <span className="text-xs font-extrabold text-amber-800">₹22,750</span>
                  </div>
                </div>

                <div className="space-y-1.5 flex-1 overflow-hidden">
                  <span className="text-[8px] font-bold text-stone-400 uppercase tracking-wider block">Recent Expenses</span>
                  {[
                    { label: 'Beej (Seeds)', amount: '₹12,000', color: 'bg-emerald-100 text-emerald-700' },
                    { label: 'Khad (Fertilizer)', amount: '₹8,500', color: 'bg-amber-100 text-amber-700' },
                    { label: 'Diesel Pump', amount: '₹5,000', color: 'bg-red-100 text-red-700' }
                  ].map((item, idx) => (
                    <div key={idx} className="p-2 bg-white border border-stone-200/30 rounded-lg flex justify-between items-center text-[9px] font-bold shadow-sm">
                      <span className="flex items-center gap-1">
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${item.color}`}>•</span>
                        {item.label}
                      </span>
                      <span>{item.amount}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Farm Floating Icons */}
            <div className="absolute top-10 left-5 bg-white p-3 rounded-2xl border border-stone-200/50 shadow-md animate-bounce transform -translate-x-4">
              <Wheat className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="absolute bottom-10 right-5 bg-white p-3 rounded-2xl border border-stone-200/50 shadow-md animate-bounce transform translate-x-4 delay-300">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>

          </div>

        </div>
      </section>

      {/* ━━━ PROBLEM STATEMENT ━━━ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 leading-snug">
            {text.problemTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pain Card 1 */}
            <div className="p-6 bg-stone-50 border border-stone-200/50 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-stone-900">{text.problem1Title}</h3>
              <p className="text-xs text-stone-400 font-semibold leading-relaxed">{text.problem1Desc}</p>
            </div>

            {/* Pain Card 2 */}
            <div className="p-6 bg-stone-50 border border-stone-200/50 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-stone-900">{text.problem2Title}</h3>
              <p className="text-xs text-stone-400 font-semibold leading-relaxed">{text.problem2Desc}</p>
            </div>

            {/* Pain Card 3 */}
            <div className="p-6 bg-stone-50 border border-stone-200/50 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-stone-900">{text.problem3Title}</h3>
              <p className="text-xs text-stone-400 font-semibold leading-relaxed">{text.problem3Desc}</p>
            </div>

          </div>
        </div>
      </section>

      {/* ━━━ FEATURES GRID ━━━ */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-50 border-t border-b border-stone-200/30">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">{text.featuresTitle}</h2>
            <p className="text-xs sm:text-sm text-stone-400 font-semibold">{text.featuresSub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feat 1 */}
            <div className="p-6 bg-white border border-stone-200/50 rounded-3xl space-y-3 shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300">
              <div className="w-10 h-10 bg-emerald-600/10 text-emerald-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5.5 h-5.5" />
              </div>
              <h4 className="font-extrabold text-sm text-stone-900">{text.feat1Title}</h4>
              <p className="text-xs text-stone-400 font-medium leading-relaxed">{text.feat1Desc}</p>
            </div>

            {/* Feat 2 */}
            <div className="p-6 bg-white border border-stone-200/50 rounded-3xl space-y-3 shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300">
              <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center">
                <Scale className="w-5.5 h-5.5" />
              </div>
              <h4 className="font-extrabold text-sm text-stone-900">{text.feat2Title}</h4>
              <p className="text-xs text-stone-400 font-medium leading-relaxed">{text.feat2Desc}</p>
            </div>

            {/* Feat 3 */}
            <div className="p-6 bg-white border border-stone-200/50 rounded-3xl space-y-3 shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300">
              <div className="w-10 h-10 bg-emerald-600/10 text-emerald-700 rounded-xl flex items-center justify-center">
                <FileText className="w-5.5 h-5.5" />
              </div>
              <h4 className="font-extrabold text-sm text-stone-900">{text.feat3Title}</h4>
              <p className="text-xs text-stone-400 font-medium leading-relaxed">{text.feat3Desc}</p>
            </div>

            {/* Feat 4 */}
            <div className="p-6 bg-white border border-stone-200/50 rounded-3xl space-y-3 shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300">
              <div className="w-10 h-10 bg-amber-500/10 text-amber-700 rounded-xl flex items-center justify-center">
                <Award className="w-5.5 h-5.5" />
              </div>
              <h4 className="font-extrabold text-sm text-stone-900">{text.feat4Title}</h4>
              <p className="text-xs text-stone-400 font-medium leading-relaxed">{text.feat4Desc}</p>
            </div>

            {/* Feat 5 */}
            <div className="p-6 bg-white border border-stone-200/50 rounded-3xl space-y-3 shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300">
              <div className="w-10 h-10 bg-emerald-600/10 text-emerald-600 rounded-xl flex items-center justify-center">
                <Clock className="w-5.5 h-5.5" />
              </div>
              <h4 className="font-extrabold text-sm text-stone-900">{text.feat5Title}</h4>
              <p className="text-xs text-stone-400 font-medium leading-relaxed">{text.feat5Desc}</p>
            </div>

            {/* Feat 6 */}
            <div className="p-6 bg-white border border-stone-200/50 rounded-3xl space-y-3 shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300">
              <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center">
                <Landmark className="w-5.5 h-5.5" />
              </div>
              <h4 className="font-extrabold text-sm text-stone-900">{text.feat6Title}</h4>
              <p className="text-xs text-stone-400 font-medium leading-relaxed">{text.feat6Desc}</p>
            </div>

          </div>
        </div>
      </section>

      {/* ━━━ HOW IT WORKS ━━━ */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">{text.howItWorksTitle}</h2>
            <p className="text-xs sm:text-sm text-stone-400 font-semibold">{text.howItWorksSub}</p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 max-w-4xl mx-auto relative pt-6">
            
            {/* Step 1 */}
            <div className="flex-1 text-center space-y-3 max-w-[240px] relative">
              <span className="w-12 h-12 bg-emerald-600 text-white rounded-full font-black text-sm flex items-center justify-center mx-auto shadow-md ring-4 ring-emerald-50">
                1
              </span>
              <h4 className="font-extrabold text-sm text-stone-900 mt-2">{text.step1Title}</h4>
              <p className="text-xs text-stone-450 leading-relaxed font-semibold">{text.step1Desc}</p>
            </div>

            {/* Arrow/Line divider between 1 and 2 */}
            <div className="hidden md:block absolute top-12 left-[27%] w-[16%] h-0.5 bg-stone-200" />

            {/* Step 2 */}
            <div className="flex-1 text-center space-y-3 max-w-[240px] relative">
              <span className="w-12 h-12 bg-amber-500 text-white rounded-full font-black text-sm flex items-center justify-center mx-auto shadow-md ring-4 ring-amber-50">
                2
              </span>
              <h4 className="font-extrabold text-sm text-stone-900 mt-2">{text.step2Title}</h4>
              <p className="text-xs text-stone-450 leading-relaxed font-semibold">{text.step2Desc}</p>
            </div>

            {/* Arrow/Line divider between 2 and 3 */}
            <div className="hidden md:block absolute top-12 left-[61%] w-[16%] h-0.5 bg-stone-200" />

            {/* Step 3 */}
            <div className="flex-1 text-center space-y-3 max-w-[240px] relative">
              <span className="w-12 h-12 bg-emerald-600 text-white rounded-full font-black text-sm flex items-center justify-center mx-auto shadow-md ring-4 ring-emerald-50">
                3
              </span>
              <h4 className="font-extrabold text-sm text-stone-900 mt-2">{text.step3Title}</h4>
              <p className="text-xs text-stone-450 leading-relaxed font-semibold">{text.step3Desc}</p>
            </div>

          </div>
        </div>
      </section>

      {/* ━━━ SPOTLIGHT agreement builder ━━━ */}
      <section id="agreement" className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-50 border-t border-stone-200/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Spotlight Mockup */}
          <div className="flex justify-center items-center">
            <div className="bg-white border border-stone-300 rounded-3xl p-5 shadow-2xl relative w-full max-w-md overflow-hidden rotate-[-1deg] font-mono text-[10px] sm:text-xs">
              <div className="absolute top-0 inset-x-0 h-2 bg-emerald-650" />
              
              <div className="bg-[#FFF8E7]/50 rounded-2xl p-5 border border-amber-500/10 space-y-4 text-stone-850">
                <div className="text-center pb-3 border-b border-dashed border-stone-300">
                  <h4 className="font-extrabold text-xs tracking-widest uppercase">PARTNERSHIP AGREEMENT</h4>
                  <p className="text-[9px] text-stone-400 mt-0.5">Khet Kharcha App Generator</p>
                </div>

                <div className="space-y-1.5 leading-snug">
                  <p><strong>Farm Plot :</strong> Ghar nu Khet (Anand)</p>
                  <p><strong>Partner   :</strong> Bhavesh Patel · +91 98765 43211</p>
                  <p><strong>Season    :</strong> KHARIF 2026</p>
                  <p><strong>System    :</strong> Bhag (Custom preset)</p>
                </div>

                <div className="space-y-1.5 border-t border-b border-dashed border-stone-300 py-3">
                  <p className="text-emerald-700 font-bold uppercase text-[9px] tracking-wider mb-1">CROP SHARE DIVISION</p>
                  <p><strong>Partner gets:</strong> 10% of total physical yield</p>
                  <p><strong>Timing      :</strong> Immediately after harvest</p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-ownExpense font-bold uppercase text-[9px] tracking-wider mb-1">EXPENSE SPLITS (Partner Share)</p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
                    <p>Seeds: 50%</p>
                    <p>Fertilizer: 0%</p>
                    <p>Labour: 100%</p>
                    <p>Electricity: 0%</p>
                  </div>
                </div>

                <div className="border-t border-dashed border-stone-300 pt-3 flex justify-between items-center text-[10px]">
                  <span>Sign: Owner _____________</span>
                  <span>Partner _____________</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 text-left max-w-xl">
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 leading-tight">
              {text.spotlightTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-semibold">
              {text.spotlightSub}
            </p>

            <ul className="space-y-3 pt-2">
              {[
                text.spotlightBullet1,
                text.spotlightBullet2,
                text.spotlightBullet3,
                text.spotlightBullet4,
                text.spotlightBullet5
              ].map((bullet, idx) => (
                <li key={idx} className="flex items-center gap-3 text-xs sm:text-sm font-bold text-stone-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  {bullet}
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
              >
                {text.spotlightCTA}
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ━━━ STATS BAR ━━━ */}
      <section className="bg-emerald-800 py-16 px-4 sm:px-6 lg:px-8 text-white text-center">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          
          <div className="space-y-1">
            <span className="text-2xl sm:text-4xl font-black block tracking-tight">{text.stats1}</span>
            <span className="text-[10px] sm:text-xs text-emerald-100 font-bold block">{text.stats1Desc}</span>
          </div>

          <div className="space-y-1">
            <span className="text-2xl sm:text-4xl font-black block tracking-tight">{text.stats2}</span>
            <span className="text-[10px] sm:text-xs text-emerald-100 font-bold block">{text.stats2Desc}</span>
          </div>

          <div className="space-y-1">
            <span className="text-2xl sm:text-4xl font-black block tracking-tight">{text.stats3}</span>
            <span className="text-[10px] sm:text-xs text-emerald-100 font-bold block">{text.stats3Desc}</span>
          </div>

          <div className="space-y-1">
            <span className="text-2xl sm:text-4xl font-black block tracking-tight">{text.stats4}</span>
            <span className="text-[10px] sm:text-xs text-emerald-100 font-bold block">{text.stats4Desc}</span>
          </div>

        </div>
      </section>

      {/* ━━━ TESTIMONIALS ━━━ */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">{text.testimonialsTitle}</h2>
            <p className="text-xs sm:text-sm text-stone-400 font-semibold">{text.testimonialsSub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Testimonial 1 */}
            <div className="p-6 bg-stone-50 border border-stone-200/50 rounded-2xl flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="flex text-amber-500 gap-0.5">
                  {Array(5).fill(null).map((_, i) => <span key={i} className="text-lg">★</span>)}
                </div>
                <p className="text-xs text-stone-600 italic font-semibold leading-relaxed">
                  "{t1Quote}"
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 border-t border-stone-150 pt-4">
                <span className="w-10 h-10 bg-emerald-600/10 text-emerald-700 rounded-full font-bold text-sm flex items-center justify-center shrink-0">RP</span>
                <div>
                  <h4 className="font-extrabold text-xs text-stone-950">{text.t1Name}</h4>
                  <p className="text-[10px] text-stone-400 font-semibold">{text.t1Village}</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-6 bg-stone-50 border border-stone-200/50 rounded-2xl flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="flex text-amber-500 gap-0.5">
                  {Array(5).fill(null).map((_, i) => <span key={i} className="text-lg">★</span>)}
                </div>
                <p className="text-xs text-stone-600 italic font-semibold leading-relaxed">
                  "{t2Quote}"
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 border-t border-stone-150 pt-4">
                <span className="w-10 h-10 bg-amber-550/10 text-amber-700 rounded-full font-bold text-sm flex items-center justify-center shrink-0">SK</span>
                <div>
                  <h4 className="font-extrabold text-xs text-stone-955">{text.t2Name}</h4>
                  <p className="text-[10px] text-stone-400 font-semibold">{text.t2Village}</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-6 bg-stone-50 border border-stone-200/50 rounded-2xl flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="flex text-amber-500 gap-0.5">
                  {Array(5).fill(null).map((_, i) => <span key={i} className="text-lg">★</span>)}
                </div>
                <p className="text-xs text-stone-600 italic font-semibold leading-relaxed">
                  "{t3Quote}"
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 border-t border-stone-150 pt-4">
                <span className="w-10 h-10 bg-emerald-600/10 text-emerald-700 rounded-full font-bold text-sm flex items-center justify-center shrink-0">AD</span>
                <div>
                  <h4 className="font-extrabold text-xs text-stone-950">{text.t3Name}</h4>
                  <p className="text-[10px] text-stone-400 font-semibold">{text.t3Village}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ━━━ SUPPORTED LANGUAGES ━━━ */}
      <section className="py-16 px-4 bg-stone-50 border-t border-stone-200/20 text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <h3 className="text-sm font-extrabold text-stone-400 uppercase tracking-widest">{text.languageSectionTitle}</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {LANGUAGES_LIST.map((lang) => (
              <span key={lang.code} className="px-4.5 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-700 shadow-sm flex items-center gap-1.5">
                <span>{lang.flag}</span>
                <span>{lang.native}</span>
              </span>
            ))}
          </div>
          <p className="text-[10px] text-stone-400 font-bold uppercase">{text.languageSectionSub}</p>
        </div>
      </section>

      {/* ━━━ CTA BANNER ━━━ */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-800 to-[#2D6A4F] py-20 px-4 sm:px-6 lg:px-8 text-white text-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500 via-stone-900 to-black pointer-events-none" />
        
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-black leading-snug">
            {text.ctaTitle}
          </h2>
          
          <div className="flex justify-center gap-4 pt-2">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 bg-white text-emerald-800 font-extrabold rounded-xl shadow-md hover:shadow-xl transition text-xs cursor-pointer"
              >
                {text.goToDashboard}
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-3 bg-white text-emerald-850 hover:bg-stone-50 font-extrabold rounded-xl shadow transition text-xs cursor-pointer animate-pulse"
                >
                  {text.ctaButton}
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-3 border border-white hover:bg-white/10 text-white font-extrabold rounded-xl transition text-xs cursor-pointer"
                >
                  {text.login}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="bg-stone-900 text-stone-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-stone-850">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          
          <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-700 text-white rounded-lg flex items-center justify-center">
                <Wheat className="w-5 h-5" />
              </div>
              <span className="text-base font-extrabold text-white">Khet Kharcha</span>
            </div>
            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">{text.tagline}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how-it-works" className="hover:text-white transition">How it works</a>
            <a href="#agreement" className="hover:text-white transition">Agreement Builder</a>
            <a href="#testimonials" className="hover:text-white transition">Testimonials</a>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
            <span className="text-xs font-bold text-stone-500">{text.footerText}</span>
            <span className="text-[10px] text-stone-600 font-bold uppercase">{text.copyright}</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
