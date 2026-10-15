/**
 * Crop Cultivation Library Catalog
 * Contains complete master catalog of 241 agricultural crops.
 * Cereals & Pseudocereals mapped with comprehensive market types & certified cultivars.
 */

export const CROP_CATEGORIES = [
  {
    "id": "all",
    "label": "All Crops",
    "icon": "🌱"
  },
  {
    "id": "cereals",
    "label": "Cereals & Pseudocereals",
    "icon": "🌾"
  },
  {
    "id": "pulses",
    "label": "Legumes & Pulses",
    "icon": "🫘"
  },
  {
    "id": "oilseeds",
    "label": "Oilseed Crops",
    "icon": "🛢️"
  },
  {
    "id": "tubers",
    "label": "Tubers & Root Crops",
    "icon": "🍠"
  },
  {
    "id": "fiber_industrial",
    "label": "Fiber & Industrial",
    "icon": "🪵"
  },
  {
    "id": "plantation",
    "label": "Plantation & Stimulants",
    "icon": "☕"
  },
  {
    "id": "spices_herbs",
    "label": "Spices & Aromatic Herbs",
    "icon": "🌶️"
  },
  {
    "id": "vegetables",
    "label": "Vegetable Crops",
    "icon": "🥦"
  },
  {
    "id": "fruits_nuts",
    "label": "Fruit & Nut Crops",
    "icon": "🍎"
  },
  {
    "id": "fodder",
    "label": "Fodder & Forage Crops",
    "icon": "🌾"
  },
  {
    "id": "floriculture",
    "label": "Floriculture & Flowers",
    "icon": "🌸"
  },
  {
    "id": "medicinal_biofuel",
    "label": "Medicinal & Biofuel",
    "icon": "🧪"
  }
];

export const MASTER_CROPS = [
  {
    "id": "crop_1_rice_paddy",
    "name": "Rice (Paddy)",
    "category": "cereals",
    "subcategory": "Primary Staples",
    "localNames": {
      "gu": "ડાંગર (ચોખા)",
      "hi": "धान / चावल",
      "en": "Rice / Paddy"
    },
    "scientificName": "Oryza sativa",
    "marketTypes": [
      {
        "typeName": "Premium Long-Grain Basmati (સુગંધિત બાસમતી)",
        "varieties": [
          "Pusa Basmati 1121",
          "Pusa Basmati 1509",
          "Pusa Basmati 1718",
          "PB 1847",
          "Taraori Basmati",
          "Dehraduni Type 3"
        ],
        "marketUse": "Export market, premium biryani, pulav, high-end culinary",
        "grainType": "Extra-long slender grain, exceptional elongation after cooking, delicate floral aroma"
      },
      {
        "typeName": "Medium Slender Non-Basmati (સોના મસૂરી / સાંભા)",
        "varieties": [
          "Sona Masoori",
          "BPT 5204 (Samba Mahsuri)",
          "RNR 15048 (Telangana Sona - Low GI)",
          "HMT Kolam",
          "Wada Kolam"
        ],
        "marketUse": "Daily staple cooking, south Indian cuisines, health conscious diet (low GI)",
        "grainType": "Medium slender, lightweight, soft texture"
      },
      {
        "typeName": "High-Yielding Coarse Rice (જાડા ચોખા / પરબોઈલ્ડ)",
        "varieties": [
          "IR-64",
          "Swarna (MTU 7029)",
          "Jaya",
          "PR-126",
          "Gurjari (Gujarat)",
          "GR-11",
          "Dandi (Salt tolerant)"
        ],
        "marketUse": "Mandi bulk trade, PDS distribution, parboiled rice mills, idli/dosa batter, poha (flattened rice)",
        "grainType": "Bold, short to medium grain, high starch yield"
      },
      {
        "typeName": "Aromatic Heritage & Specialty Rice (વિશિષ્ટ સુગંધિત)",
        "varieties": [
          "Kalanamak (Buddha Rice)",
          "Gobindobhog (West Bengal)",
          "Ambemohar (Maharashtra)",
          "Jeerakasala / Kaima",
          "Chak-Hao (Manipur Black Rice)",
          "Navara (Kerala Red Ayurvedic)"
        ],
        "marketUse": "Gourmet desserts (Kheer/Payasam), temple offerings, medicinal and organic export",
        "grainType": "Short aromatic grain or pigmented pericarp (anthocyanin rich black/red)"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_2_wheat_durum_bread_emmer",
    "name": "Wheat (Durum, Bread, Emmer)",
    "category": "cereals",
    "subcategory": "Primary Staples",
    "localNames": {
      "gu": "ઘઉં",
      "hi": "गेहूं",
      "en": "Wheat"
    },
    "scientificName": "Triticum spp.",
    "marketTypes": [
      {
        "typeName": "Sharbati & Premium Bread Wheat (શરબતી / દેશી લોકવાન)",
        "varieties": [
          "C-306 (Original Sharbati)",
          "Lokwan (Lok-1)",
          "GW-496 (Gujarat Gold)",
          "GW-322",
          "GW-366",
          "Raj-4037"
        ],
        "marketUse": "Premium chapatis, rotis, consumer flour brands, golden luster mandis (Sehore / Gujarat)",
        "grainType": "Semi-hard to hard golden bold grain, sweet taste, high protein"
      },
      {
        "typeName": "High-Yielding Irrigated Milling Wheat (મિલિંગ / પીડીએસ)",
        "varieties": [
          "HD-2967 (Pusa Sindhu)",
          "HD-3086 (Pusa Gautami)",
          "PBW-343",
          "DBW-187 (Karan Vandana)",
          "DBW-303 (Karan Vaishnavi)"
        ],
        "marketUse": "Commercial roller flour mills, Maida, Suji, bakery bread, biscuit industry",
        "grainType": "Amber colored, medium hard, high gluten strength"
      },
      {
        "typeName": "Durum / Macaroni / Kathiya Wheat (કાઠીયા / સોજી ઘઉં)",
        "varieties": [
          "GW-1",
          "GW-2",
          "HI-8713 (Pusa Mangal)",
          "WHD-943",
          "PDW-233",
          "Malavshakti"
        ],
        "marketUse": "Pasta, macaroni, spaghetti, rava/suji, vermicelli (seviyan), dalia",
        "grainType": "Extremely vitreous (glassy), amber bold hard grain, high carotenoid pigment"
      },
      {
        "typeName": "Emmer / Khapli Wheat (ખાપલી / પ્રાચીન ડાયાબિટીક ઘઉં)",
        "varieties": [
          "DDK-1029",
          "DDK-1009",
          "Local Desi Khapli"
        ],
        "marketUse": "Specialty diabetic flour, therapeutic diets, low glycemic index chapatis",
        "grainType": "Hulled grain, long reddish spindle shape, rich in dietary fiber"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_3_maize_corn",
    "name": "Maize (Corn)",
    "category": "cereals",
    "subcategory": "Primary Staples",
    "localNames": {
      "gu": "મકાઈ",
      "hi": "मक्का / भुट्टा",
      "en": "Maize / Corn"
    },
    "scientificName": "Zea mays",
    "marketTypes": [
      {
        "typeName": "Commercial Yellow Dent & Flint Corn (પીળી મકાઈ)",
        "varieties": [
          "Pioneer P3396",
          "Syngenta NK-6240",
          "Dekalb 9108",
          "Monsanto DKC-9144",
          "HQPM-1 (High Quality Protein)",
          "GAYMH-1"
        ],
        "marketUse": "Poultry feed, cattle feed, industrial starch, corn oil, ethanol production",
        "grainType": "Hard yellow flint or dent kernels with high starch density"
      },
      {
        "typeName": "Sweet Corn (મીઠી મકાઈ / ટેબલ કોર્ન)",
        "varieties": [
          "Sugar-75 (Syngenta)",
          "Madhuri",
          "Priya Sweet Corn",
          "Mishti",
          "Advanta Golden"
        ],
        "marketUse": "Fresh green cob roasting, boiling, frozen sweet corn kernels, restaurant salads",
        "grainType": "High sugar content (shrunken kernel gene), tender translucent golden grains"
      },
      {
        "typeName": "Baby Corn (બેબી કોર્ન)",
        "varieties": [
          "GAYMH-1 (Gujarat)",
          "HM-4",
          "VL Baby Corn 1",
          "Golden Baby"
        ],
        "marketUse": "Canned vegetables, gourmet stir-fries, hotel salad buffet, export processing",
        "grainType": "Immature unfertilized ear harvested within 2-3 days of silk emergence"
      },
      {
        "typeName": "White Maize / Desi Corn (સફેદ મકાઈ / દેશી)",
        "varieties": [
          "Gujarat Anand White Maize-2",
          "GWM-3",
          "Narmada Moti",
          "Bhiloda Desi"
        ],
        "marketUse": "Traditional maize rotlas (Makai no Rotlo in Saurashtra/Panchmahal), cornmeal",
        "grainType": "Pure white flint kernels, traditional rustic corn flavor"
      },
      {
        "typeName": "Popcorn (પોપકોર્ન)",
        "varieties": [
          "Amber Popcorn",
          "Pearl Popcorn",
          "VL Popcorn-2"
        ],
        "marketUse": "Movie theater popcorn, ready-to-eat puffed snacks",
        "grainType": "Dense, small hard pericarp with moisture-steam expansion capacity"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_4_barley",
    "name": "Barley",
    "category": "cereals",
    "subcategory": "Primary Staples",
    "localNames": {
      "gu": "જવ",
      "hi": "जौ",
      "en": "Barley"
    },
    "scientificName": "Hordeum vulgare",
    "marketTypes": [
      {
        "typeName": "Two-Row Malting Barley (બ્રુઅરી / માલ્ટ જવ)",
        "varieties": [
          "DWRB-101",
          "DWRB-180",
          "RD-2849",
          "VJM-201",
          "Alfa"
        ],
        "marketUse": "Beer brewing, malted health food drinks (Horlicks/Bournvita), whisky distillation",
        "grainType": "Uniform bold plump grains, low protein, high diastatic power"
      },
      {
        "typeName": "Six-Row Feed & Food Barley (સામાન્ય જવ)",
        "varieties": [
          "RD-2552",
          "RD-2035",
          "BH-902",
          "PL-426",
          "Ratna",
          "Azad"
        ],
        "marketUse": "Animal feed, barley flour (Jau Sattu), medicinal water (cooling beverage)",
        "grainType": "Six-row asymmetric grains, high fiber, high beta-glucan"
      },
      {
        "typeName": "Hulless / Naked Barley (ફોતરા વગરના જવ)",
        "varieties": [
          "BHS-352",
          "Karan-16",
          "Himani"
        ],
        "marketUse": "Direct human food grain, porridges, whole grain flatbreads",
        "grainType": "Free-threshing grain without adherent lemma and palea hull"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_5_oats",
    "name": "Oats",
    "category": "cereals",
    "subcategory": "Primary Staples",
    "localNames": {
      "gu": "ઓટ્સ / જઈ",
      "hi": "जई / ओट्स",
      "en": "Oats"
    },
    "scientificName": "Avena sativa",
    "marketTypes": [
      {
        "typeName": "Breakfast & Food Grain Oats (બ્રેકફાસ્ટ ઓટ્સ)",
        "varieties": [
          "Kent",
          "HJ-8",
          "OS-6",
          "UPO-212",
          "SKO-90"
        ],
        "marketUse": "Rolled oats, oatmeal porridge, oat flour, dietary fiber supplements",
        "grainType": "Plump groats rich in soluble beta-glucan fiber and antioxidants"
      },
      {
        "typeName": "Dual Purpose & Green Fodder Oats (ઘાસચારો / જઈ)",
        "varieties": [
          "RO-19 (Gujarat)",
          "JHO-822",
          "Bundel Oat-991",
          "OL-9",
          "JHO-851"
        ],
        "marketUse": "High-protein green fodder for dairy cattle, multi-cut hay production",
        "grainType": "Heavy vegetative biomass with nutritive grain recovery"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_6_rye",
    "name": "Rye",
    "category": "cereals",
    "subcategory": "Primary Staples",
    "localNames": {
      "gu": "રાય (ધાન્ય)",
      "hi": "राई (सीरियल)",
      "en": "Cereal Rye"
    },
    "scientificName": "Secale cereale",
    "marketTypes": [
      {
        "typeName": "Winter Rye (શિયાળુ રાય)",
        "varieties": [
          "Gazelle",
          "Dacold",
          "Danko",
          "Ryman"
        ],
        "marketUse": "Pumpernickel & dark rye bread, sourdough starters, rye whiskey distilling",
        "grainType": "Slender grayish-green grain with distinctive earthy, tangy flavor"
      },
      {
        "typeName": "Cover Crop & Forage Rye",
        "varieties": [
          "Abruzzi",
          "Elbon",
          "Wheeler"
        ],
        "marketUse": "Soil conservation green manure, winter grazing for livestock",
        "grainType": "Rapid germination, cold-hardy tillering growth"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_7_sorghum_jowar",
    "name": "Sorghum (Jowar)",
    "category": "cereals",
    "subcategory": "Millets & Sorghum",
    "localNames": {
      "gu": "જુવાર",
      "hi": "ज्वार",
      "en": "Sorghum / Jowar"
    },
    "scientificName": "Sorghum bicolor",
    "marketTypes": [
      {
        "typeName": "Rabi Grain Sorghum (શિયાળુ માલદંડી જુવાર)",
        "varieties": [
          "M-35-1 (Maldandi)",
          "Phule Yashoda",
          "Phule Revati",
          "Parbhani Moti",
          "CSV-29R",
          "GJ-38"
        ],
        "marketUse": "Premium food grain for rotlas (Jowar Bhakri), high market price in Maharashtra & Gujarat",
        "grainType": "Pearlescent ivory-white bold grain, sweet dough texture, gluten-free"
      },
      {
        "typeName": "Kharif Grain Sorghum (ચોમાસુ જુવાર હાઇબ્રિડ)",
        "varieties": [
          "CSH-14",
          "CSH-16",
          "CSH-25",
          "CSV-15",
          "GJ-42 (Gujarat Jowar)"
        ],
        "marketUse": "Industrial alcohol, starch manufacturing, poultry feed, flour blending",
        "grainType": "Creamy white to light yellow grain with high starch extraction"
      },
      {
        "typeName": "Sweet Sorghum (શેરડી જુવાર - બાયોઇથેનોલ)",
        "varieties": [
          "SSV-84",
          "CSH-22SS",
          "Phule Vasundhara"
        ],
        "marketUse": "Stalk juice for bio-ethanol, jaggery syrup, bagasse for paper",
        "grainType": "Sugar-rich juicy stalks with dual grain harvest"
      },
      {
        "typeName": "Multicut Fodder Sorghum (ગુંદરી ઘાસચારો)",
        "varieties": [
          "Gundari (Gujarat Chari)",
          "MP Chari",
          "SSG-59-3 (Meethi Sudax)",
          "Pant Chari-5"
        ],
        "marketUse": "Green succulent fodder for dairy cows and buffaloes",
        "grainType": "Tall vegetative tillering with sweet palatable foliage"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_8_pearl_millet_bajra",
    "name": "Pearl Millet (Bajra)",
    "category": "cereals",
    "subcategory": "Millets & Sorghum",
    "localNames": {
      "gu": "બાજરી",
      "hi": "बाजरा",
      "en": "Pearl Millet / Bajra"
    },
    "scientificName": "Pennisetum glaucum",
    "marketTypes": [
      {
        "typeName": "Commercial High-Yielding Hybrids (હાઇબ્રિડ બાજરી)",
        "varieties": [
          "GHB-558 (Gujarat Hybrid)",
          "GHB-744",
          "GHB-905",
          "Pioneer 86M88",
          "ProAgro 9444",
          "Kaveri Super Boss",
          "Nandi-65"
        ],
        "marketUse": "Commercial grain trade, khichdi, flour mills, animal feed compounding",
        "grainType": "Steel gray to golden globular bold grain, high yield per bigha"
      },
      {
        "typeName": "Biofortified Iron & Zinc Bajra (પોષક તત્વો સભર)",
        "varieties": [
          "Dhanshakti (High Iron)",
          "AHB-1200",
          "HHB-67 Improved",
          "ProAgro 9444 Fe"
        ],
        "marketUse": "Nutritional programs, health-oriented millet flour, infant mixes",
        "grainType": "Dense nutritious gray-green grains with >70 ppm Iron"
      },
      {
        "typeName": "Desi Landraces (દેશી સૌરાષ્ટ્ર / રાજસ્થાન બાજરી)",
        "varieties": [
          "Desi Barmer Bajra",
          "Kathiawadi Desi Bajri",
          "Jakhrana"
        ],
        "marketUse": "Traditional Saurashtra & Marwad winter rotla, distinct sweet natural flavor",
        "grainType": "Smaller grain size, higher fat content and exceptional aroma"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_9_finger_millet_ragi",
    "name": "Finger Millet (Ragi)",
    "category": "cereals",
    "subcategory": "Millets & Sorghum",
    "localNames": {
      "gu": "નાગલી / રાગી / બાવટો",
      "hi": "रागी / मड़ुआ",
      "en": "Finger Millet / Ragi"
    },
    "scientificName": "Eleusine coracana",
    "marketTypes": [
      {
        "typeName": "Commercial Brown Ragi (લાલ/કથ્થઈ રાગી)",
        "varieties": [
          "GPU-28",
          "ML-365",
          "MR-1",
          "Indaf-8",
          "VL-149",
          "PR-202"
        ],
        "marketUse": "Ragi flour, ragi malt drinks, dosa mixes, porridge, biscuits, baby weaning foods",
        "grainType": "Reddish-brown spherical grains, richest plant source of calcium (344 mg/100g)"
      },
      {
        "typeName": "Gujarat Dangs & Tribal Nagli (ડાંગ નાગલી)",
        "varieties": [
          "GN-4 (Gujarat Nagli)",
          "GN-5",
          "GNN-6",
          "Dangs Local"
        ],
        "marketUse": "Rotla, Nagli papad, traditional ethnic hill farming trade",
        "grainType": "Locally adapted high-iron and mineral dense grains"
      },
      {
        "typeName": "White Ragi (સફેદ રાગી)",
        "varieties": [
          "CO-14 (White)",
          "KMR-340"
        ],
        "marketUse": "Bakery bread blending without darkening color, noodles, pasta",
        "grainType": "Light creamish white seed coat with mild taste"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_10_foxtail_millet",
    "name": "Foxtail Millet",
    "category": "cereals",
    "subcategory": "Millets & Sorghum",
    "localNames": {
      "gu": "કાંગ",
      "hi": "कंगनी / राल",
      "en": "Foxtail Millet / Kangni"
    },
    "scientificName": "Setaria italica",
    "marketTypes": [
      {
        "typeName": "High-Yielding Grain Cultivars (કાંગની વેરાયટી)",
        "varieties": [
          "SiA-3085",
          "SiA-3156",
          "Suryanandi",
          "HMT-100-1",
          "Pratap Kangani-1",
          "CO-7"
        ],
        "marketUse": "Millet rice substitute, upma, diabetic porridge, healthy snacks",
        "grainType": "Golden-yellow or creamy small seeds with low glycemic index"
      },
      {
        "typeName": "Birdseed & Forage Foxtail",
        "varieties": [
          "German Foxtail",
          "Hungarian Foxtail"
        ],
        "marketUse": "Pet bird feed market, quick dry-matter hay production",
        "grainType": "Glossy unhulled seed"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_11_proso_millet_cheena",
    "name": "Proso Millet (Cheena)",
    "category": "cereals",
    "subcategory": "Millets & Sorghum",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_12_kodo_millet",
    "name": "Kodo Millet",
    "category": "cereals",
    "subcategory": "Millets & Sorghum",
    "localNames": {
      "gu": "કોદરી",
      "hi": "कोदो",
      "en": "Kodo Millet / Kodra"
    },
    "scientificName": "Paspalum scrobiculatum",
    "marketTypes": [
      {
        "typeName": "Improved Food Kodri (કોદરી)",
        "varieties": [
          "GPUK-3",
          "JK-48",
          "RBK-155",
          "DPS-9-1",
          "TNAU-86",
          "Gujarat Kodri Local"
        ],
        "marketUse": "Kodri khichdi (traditional Gujarati diet), diabetic rice alternative",
        "grainType": "Hard brown husk enclosing light brown grain, exceptionally rich in antioxidants"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_13_barnyard_millet_sawan",
    "name": "Barnyard Millet (Sawan)",
    "category": "cereals",
    "subcategory": "Millets & Sorghum",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_14_little_millet_samai",
    "name": "Little Millet (Samai)",
    "category": "cereals",
    "subcategory": "Millets & Sorghum",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_15_browntop_millet",
    "name": "Browntop Millet",
    "category": "cereals",
    "subcategory": "Millets & Sorghum",
    "localNames": {
      "gu": "હરિકા / બ્રાઉનટોપ",
      "hi": "कोराले / मकरा",
      "en": "Browntop Millet / Korale"
    },
    "scientificName": "Urochloa ramosa",
    "marketTypes": [
      {
        "typeName": "Super-Fiber Grain (બ્રાઉનટોપ)",
        "varieties": [
          "GPUBT-2",
          "VHC-1",
          "Karnataka Local Korale"
        ],
        "marketUse": "Therapeutic superfood, high-fiber flour blending (12.5% fiber), detoxification diets",
        "grainType": "Olive green to brownish seed with robust drought tolerance"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_16_teff",
    "name": "Teff",
    "category": "cereals",
    "subcategory": "Millets & Sorghum",
    "localNames": {
      "gu": "ટેફ ધાન્ય",
      "hi": "टेफ",
      "en": "Teff"
    },
    "scientificName": "Eragrostis tef",
    "marketTypes": [
      {
        "typeName": "Ivory & White Teff (સફેદ ટેફ)",
        "varieties": [
          "Quncho (DZ-Cr-387)",
          "Magnam",
          "White Ex-Ethiopia"
        ],
        "marketUse": "Injera flatbread, gluten-free gourmet baking, export health food market",
        "grainType": "Smallest grain in the world (150 grains = 1 wheat kernel), mild sweet molasses flavor"
      },
      {
        "typeName": "Brown & Red Teff (કથ્થઈ ટેફ)",
        "varieties": [
          "DZ-01-99",
          "Brown Seed Selected"
        ],
        "marketUse": "Nutrient-dense breads, high iron and calcium supplement flours",
        "grainType": "Robust earthy flavor, higher mineral concentration"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_17_fonio_black_white",
    "name": "Fonio (Black & White)",
    "category": "cereals",
    "subcategory": "Millets & Sorghum",
    "localNames": {
      "gu": "ફોનિઓ",
      "hi": "फोनियो",
      "en": "Fonio"
    },
    "scientificName": "Digitaria exilis / D. iburua",
    "marketTypes": [
      {
        "typeName": "White Fonio (Acha - સફેદ ફોનિઓ)",
        "varieties": [
          "Digitaria exilis Selection",
          "Sirigu White"
        ],
        "marketUse": "African ancient supergrain, couscous-like fluffy side dish, gluten-free beer",
        "grainType": "Tiny seed matures in only 60 to 70 days, low glycemic index"
      },
      {
        "typeName": "Black Fonio (Iburu - કાળો ફોનિઓ)",
        "varieties": [
          "Digitaria iburua Selection"
        ],
        "marketUse": "Traditional brewing, porridges in arid sahel regions",
        "grainType": "Dark brownish black seed with rich sulfur amino acids (methionine & cystine)"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_18_job_s_tears",
    "name": "Job's Tears",
    "category": "cereals",
    "subcategory": "Millets & Sorghum",
    "localNames": {
      "gu": "કાસઈ / અડલે",
      "hi": "गारुड़ / कासई",
      "en": "Job's Tears / Adlay"
    },
    "scientificName": "Coix lacryma-jobi",
    "marketTypes": [
      {
        "typeName": "Edible Soft-Shell Adlay (ખાવાલાયક જોબ્સ ટિયર્સ)",
        "varieties": [
          "Coix lacryma-jobi var. ma-yuen",
          "Northeast Indian Adlay"
        ],
        "marketUse": "Traditional Chinese medicine (Yiyi Ren), nourishing soups, herbal tea, gluten-free porridge",
        "grainType": "Soft hull easily dehulled, pearl-white bead kernel with mild sweet nutty taste"
      },
      {
        "typeName": "Ornamental Hard-Shell Bead Grass",
        "varieties": [
          "Wild Hard Shell Ecotypes"
        ],
        "marketUse": "Natural rosary beads, jewelry, musical instruments",
        "grainType": "Enamel-like shiny porcelain hard shell"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_19_quinoa",
    "name": "Quinoa",
    "category": "cereals",
    "subcategory": "Pseudocereals",
    "localNames": {
      "gu": "ક્વિનોઆ",
      "hi": "किनुआ",
      "en": "Quinoa"
    },
    "scientificName": "Chenopodium quinoa",
    "marketTypes": [
      {
        "typeName": "White / Golden Quinoa (સફેદ ક્વિનોઆ)",
        "varieties": [
          "Royal White",
          "CSIR-NBRI Quinoa (Indian adapted)",
          "Him Quinoa",
          "Atlas"
        ],
        "marketUse": "Breakfast bowls, health salads, rice substitute, protein bars (complete plant protein)",
        "grainType": "Fluffy light texture when cooked, mildest neutral flavor"
      },
      {
        "typeName": "Red Quinoa (લાલ ક્વિનોઆ)",
        "varieties": [
          "Pasankalla",
          "Cherry Vanilla"
        ],
        "marketUse": "Gourmet cold grain salads, artistic culinary dishes",
        "grainType": "Holds distinct shape and firm crunch after boiling, rich in anthocyanins"
      },
      {
        "typeName": "Black Quinoa (કાળો ક્વિનોઆ)",
        "varieties": [
          "Black Royal Quinoa"
        ],
        "marketUse": "Specialty high-end health market, antioxidant-rich diets",
        "grainType": "Earthy sweet flavor, firm texture, highest antioxidant density"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_20_buckwheat",
    "name": "Buckwheat",
    "category": "cereals",
    "subcategory": "Pseudocereals",
    "localNames": {
      "gu": "કુટ્ટુ / ફાફરો",
      "hi": "कूटू",
      "en": "Buckwheat"
    },
    "scientificName": "Fagopyrum esculentum",
    "marketTypes": [
      {
        "typeName": "Common Sweet Buckwheat (સામાન્ય કૂટુ)",
        "varieties": [
          "Himpriya",
          "Shimla B-1",
          "PRB-1",
          "Koto",
          "Mancan"
        ],
        "marketUse": "Kuttu ka Atta for Navratri fasting rotis & puris, Japanese Soba noodles, Russian Kasha groats",
        "grainType": "Triangular three-sided groats, nutty earthy flavor, high lysine"
      },
      {
        "typeName": "Tartary Buckwheat (કડવો કૂટુ - રુટિન સભર)",
        "varieties": [
          "Fagopyrum tataricum Local Himalayan"
        ],
        "marketUse": "Medicinal buckwheat tea, high-rutin cardiovascular health supplements",
        "grainType": "Smaller bitter grain, up to 100x higher rutin bioflavonoid content"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_21_amaranth_rajgira_ramdana",
    "name": "Amaranth (Rajgira/Ramdana)",
    "category": "cereals",
    "subcategory": "Pseudocereals",
    "localNames": {
      "gu": "રાજગરો",
      "hi": "रामदाना / चौलाई",
      "en": "Grain Amaranth / Rajgira"
    },
    "scientificName": "Amaranthus hypochondriacus / A. cruentus",
    "marketTypes": [
      {
        "typeName": "High-Yielding Grain Rajgira (ગુજરાત રાજગરો)",
        "varieties": [
          "Gujarat Amaranth-1 (GA-1)",
          "GA-2",
          "GA-3",
          "Annapurna",
          "Suvarna",
          "BGA-2"
        ],
        "marketUse": "Fasting food (Rajgira ladoo, chikki, puris, shira), popped amaranth snacks, breakfast cereal",
        "grainType": "Tiny golden-yellow glossy spherical seeds, rich in squalene and lysine"
      },
      {
        "typeName": "Red Plume Amaranth Grain",
        "varieties": [
          "Red Garnet",
          "Burgundy Grain"
        ],
        "marketUse": "Dual purpose (tender microgreens/leafy vegetable + grain harvest)",
        "grainType": "Deep burgundy panicles yielding cream colored seeds"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_22_chia",
    "name": "Chia",
    "category": "cereals",
    "subcategory": "Pseudocereals",
    "localNames": {
      "gu": "ચિયા સીડ્સ",
      "hi": "ચિયા બીજ",
      "en": "Chia Seeds"
    },
    "scientificName": "Salvia hispanica",
    "marketTypes": [
      {
        "typeName": "Black Chia (કાળા ચિયા સીડ્સ)",
        "varieties": [
          "Standard Commercial Black",
          "CSIR-CFTRI Indian Chia Line"
        ],
        "marketUse": "Omega-3 smoothies, chia pudding, weight-loss hydration drinks (masticating gel)",
        "grainType": "Mottled dark brown/black seed, absorbs up to 12x water weight into mucilaginous gel"
      },
      {
        "typeName": "White Chia (સફેદ ચિયા સીડ્સ)",
        "varieties": [
          "Salba White",
          "Pure White Chia Selection"
        ],
        "marketUse": "Bakery goods, light-colored yogurt and drink formulations without black specks",
        "grainType": "Recessive white seed with identical omega-3 fatty acid concentration"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_23_chickpea_bengal_gram_garbanzo",
    "name": "Chickpea (Bengal Gram/Garbanzo)",
    "category": "pulses",
    "subcategory": "Primary Pulses",
    "localNames": {
      "gu": "ચણા",
      "hi": "चना / छोले",
      "en": "Chickpea / Bengal Gram"
    },
    "scientificName": "Cicer arietinum",
    "marketTypes": [
      {
        "typeName": "Desi Brown / Yellow Chickpea (દેશી પીળા ચણા / કાઠીયાવાડી)",
        "varieties": [
          "Gujarat Gram 1 (GG-1)",
          "Gujarat Gram 2 (GG-2)",
          "GJG-3 (Gujarat Junagadh Gram 3)",
          "GJG-5",
          "JAKI 9218",
          "Digvijay",
          "Vijay",
          "Pusa 362",
          "Radhey"
        ],
        "marketUse": "Dal mills (Chana Dal), Besan (gram flour), roasted chana, snacks, daily dal",
        "grainType": "Medium angular grain, brownish-yellow seed coat, high protein (21-22%), 100-seed weight 18-24g"
      },
      {
        "typeName": "Bold Dollar Kabuli Chickpea (ડોલર કાબુલી ચણા - એક્સપોર્ટ ક્વોલિટી)",
        "varieties": [
          "Dollar Chana (K-4)",
          "Pusa 1003 (Pusa Chamatkar)",
          "PKV Kabuli 2",
          "PKV Kabuli 4",
          "Phule G-0517",
          "Virat",
          "Kripa (Phule G 12107)"
        ],
        "marketUse": "Premium restaurant curries (Chhole Bhature), international export, canned garbanzo, high-end mandi trades",
        "grainType": "Extra bold white/cream grain, smooth wrinkled coat, 100-seed weight 38-55g, 50-80% price premium"
      },
      {
        "typeName": "Green Chickpea (પોપટા / લીલા ચણા / છોલીયા)",
        "varieties": [
          "Gujarat Green Gram 1 (GGG-1)",
          "PKV Harita (AKG-9303)",
          "Bimbadhar",
          "Sadabahar"
        ],
        "marketUse": "Fresh vegetable markets (લીલા જીંજરા / પોપટા), roasted winter snacks (હોળો / ઊંધિયું), sweet green dal",
        "grainType": "Emerald green grain retaining chlorophyll color upon maturity and drying"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_24_lentils_masoor",
    "name": "Lentils (Masoor)",
    "category": "pulses",
    "subcategory": "Primary Pulses",
    "localNames": {
      "gu": "મસૂર / મસૂર દાળ",
      "hi": "मसूर",
      "en": "Lentils"
    },
    "scientificName": "Lens culinaris",
    "marketTypes": [
      {
        "typeName": "Bold-Seeded Red Lentil / Masoor (મોટી લાલ મસૂર - મલકા)",
        "varieties": [
          "Pusa Vaibhav (L-4161)",
          "IPL-81 (Noor)",
          "HUL-57",
          "KLS-218",
          "JL-3",
          "DPL-62 (Sheri)"
        ],
        "marketUse": "Red split dal (મસૂર દાળ / Malkaa Masoor), export, high protein soup",
        "grainType": "Bold lens-shaped grain (macrosperma), pink-red cotyledon under grayish-brown seed coat, 100-seed weight >3.0g"
      },
      {
        "typeName": "Small-Seeded Brown / Black Masoor (નાની દેશી મસૂર - આખી મસૂર)",
        "varieties": [
          "Pant L-406",
          "Pant L-4",
          "PL-639",
          "K-75",
          "Asha (WBL-58)"
        ],
        "marketUse": "Whole black masoor cooked with gravy (આખી મસૂર), sprouted pulses",
        "grainType": "Small compact seed (microsperma), dark speckled coat, rich in dietary fiber and iron"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_25_pigeon_pea_arhar_tur",
    "name": "Pigeon Pea (Arhar/Tur)",
    "category": "pulses",
    "subcategory": "Primary Pulses",
    "localNames": {
      "gu": "તુવેર",
      "hi": "अरहर / तुअर",
      "en": "Pigeon Pea / Red Gram"
    },
    "scientificName": "Cajanus cajan",
    "marketTypes": [
      {
        "typeName": "White Seeded Premium Tur (સફેદ દેશી તુવેર - વાસદ દાળ સ્પેશિયલ)",
        "varieties": [
          "Gujarat Tur 1 (GT-1)",
          "Gujarat Anand Tur 2 (GAT-2)",
          "GT-101",
          "GT-104",
          "Maruti (ICP-8863)",
          "BSMR-736",
          "BSMR-853",
          "Asha (ICPL-87119)"
        ],
        "marketUse": "World-renowned Vasad Tuver Dal (વાસદની દાળ), oily dal (તેલીયા તુવેર), highest recovery in dal mills",
        "grainType": "Plump white-cream round grain, fast cooking, sweet taste, thin seed coat"
      },
      {
        "typeName": "Red / Brown Seeded Medium Duration Tur (લાલ / બદામી તુવેર)",
        "varieties": [
          "BDN-711",
          "BDN-708 (Amol)",
          "Vaishali",
          "ICPL-87 (Prabhat)",
          "C-11",
          "UPAS-120"
        ],
        "marketUse": "Mandi bulk trading, commercial dal processing, intercropping with cotton/soybean",
        "grainType": "Brown/reddish coat, yellow cotyledons, tolerant to wilt and sterility mosaic disease"
      },
      {
        "typeName": "Vegetable Pod Green Tur (લીલી શાકભાજીની તુવેર - ઊંધિયું સ્પેશિયલ)",
        "varieties": [
          "Gujarat Anand Vegetable Tur 1 (GAVT-1)",
          "ICPL-87",
          "T-Vishakha-1"
        ],
        "marketUse": "Fresh green pods for winter special recipes (કાઠિયાવાડી ઊંધિયું, લીલી તુવેરના ટોઠા, કચોરી)",
        "grainType": "Long fleshy green pods, 5-6 bold sweet green seeds per pod"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_26_mung_bean_green_gram",
    "name": "Mung Bean (Green Gram)",
    "category": "pulses",
    "subcategory": "Primary Pulses",
    "localNames": {
      "gu": "મગ",
      "hi": "मूंग",
      "en": "Mung Bean / Green Gram"
    },
    "scientificName": "Vigna radiata",
    "marketTypes": [
      {
        "typeName": "Kharif & Summer Bold Shiny Mung (ચમકદાર મોટા મગ)",
        "varieties": [
          "Gujarat Anand Mung 5 (GAM-5)",
          "GM-4",
          "GM-6",
          "Meha (IPM 99-125)",
          "Samrat (PDM-139)",
          "Shikha (IPM 410-3)",
          "Virat (IPM 205-7)",
          "SML-668"
        ],
        "marketUse": "Whole green mung, split yellow dal (મગની દાળ), sprouted mung (મગના ફણગાવેલા કઠોળ), export",
        "grainType": "Bold, bright glossy emerald green seed coat, non-shattering pods, synchronized maturity in 60-65 days"
      },
      {
        "typeName": "Dull Green Medium Desi Mung (ઝીણા દેશી મગ)",
        "varieties": [
          "Kopergaon",
          "Jawahar 721",
          "T-44",
          "Pusa Baisakhi",
          "PJM-1"
        ],
        "marketUse": "Traditional cooking, khichdi, easily digestible dal for children and elders",
        "grainType": "Medium to small dull green seed, rich earthy flavor"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_27_urad_bean_black_gram",
    "name": "Urad Bean (Black Gram)",
    "category": "pulses",
    "subcategory": "Primary Pulses",
    "localNames": {
      "gu": "અડદ",
      "hi": "उड़द",
      "en": "Black Gram"
    },
    "scientificName": "Vigna mungo",
    "marketTypes": [
      {
        "typeName": "Bold Black Seeded Urad (કાળા મોટા અડદ / દાળ સ્પેશિયલ)",
        "varieties": [
          "Gujarat Anand Urad 1 (GAU-1)",
          "GU-1",
          "IPU 02-43",
          "Pant U-31",
          "T-9",
          "Shekhar 2",
          "Mash 114"
        ],
        "marketUse": "Urad dal (અડદની દાળ), papad making (અડદના પાપડ), Kathiyawadi dal, idli-dosa batter fermentation",
        "grainType": "Bold cylindrical jet-black grain, prominent white hilum, high mucilage and starch for batter viscosity"
      },
      {
        "typeName": "Short Duration Yellow Mosaic Resistant Urad (વાયરસ પ્રતિકારક ઉનાળુ અડદ)",
        "varieties": [
          "VBN 8",
          "CO 6",
          "Uttara",
          "Prashant",
          "KU 96-3"
        ],
        "marketUse": "Summer rotation crop between wheat and cotton, soil fertility enhancement",
        "grainType": "Medium black seed, resistant to Yellow Mosaic Virus (YMV)"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_28_cowpea_black_eyed_pea",
    "name": "Cowpea (Black-eyed pea)",
    "category": "pulses",
    "subcategory": "Primary Pulses",
    "localNames": {
      "gu": "ચોળી / ચોળા",
      "hi": "लोबिया / चौलाई",
      "en": "Cowpea / Black-Eyed Pea"
    },
    "scientificName": "Vigna unguiculata",
    "marketTypes": [
      {
        "typeName": "White Grain with Black Eye (સફેદ ચોળા / બ્લેક-આઇડ પી)",
        "varieties": [
          "Gujarat Cowpea 4 (GC-4)",
          "Gujarat Cowpea 5 (GC-5)",
          "Anand Cowpea 1",
          "Pusa Sukomal",
          "Pusa Barsati",
          "Pant Lobia 1"
        ],
        "marketUse": "Dry grain curries (ચોળાનું શાક), boiled pulse dishes, commercial canning",
        "grainType": "Medium bold oval grain, chalky white with distinct black eye surrounding the hilum"
      },
      {
        "typeName": "Vegetable Tender Long Pod Cowpea (શાકભાજીની લાંબી ચોળી - શીંગો)",
        "varieties": [
          "Pusa Komal",
          "Kashi Kanchan",
          "Kashi Unnati",
          "Arka Garima",
          "Gujarat Vegetable Cowpea 1 (GVCP-1)"
        ],
        "marketUse": "Long green tender vegetable pods sold daily in sabzi mandis",
        "grainType": "30-45 cm long stringless green pods harvested every 3-4 days"
      },
      {
        "typeName": "Red / Brown Seeded Cowpea (લાલ ચોળા / રોઝી લોબિયા)",
        "varieties": [
          "Pusa Rituraj",
          "C-152",
          "KBC-2"
        ],
        "marketUse": "Whole pulse cooking, drought-prone rainfed farming",
        "grainType": "Mottled reddish-brown seed, high antioxidant content"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_29_broad_bean_fava",
    "name": "Broad Bean (Fava)",
    "category": "pulses",
    "subcategory": "Primary Pulses",
    "localNames": {
      "gu": "વાલ / બકલા",
      "hi": "बाकला / सेम",
      "en": "Broad Bean / Fava Bean"
    },
    "scientificName": "Vicia faba",
    "marketTypes": [
      {
        "typeName": "Large Seeded Fava Bean (મોટા ચપટા વાલ / બકલા)",
        "varieties": [
          "Pusa Sumeet",
          "Huasca",
          "Aquadulce",
          "Jawahar Faba 1"
        ],
        "marketUse": "Fresh shelled beans, roasted salted beans, Mediterranean food export",
        "grainType": "Extra large flat broad seed, tan/pale green coat, highly nutritious"
      },
      {
        "typeName": "Small / Feed Bean (નાના વાલ - પશુઆહાર અને દેશી)",
        "varieties": [
          "Major",
          "Minor Faba",
          "Vikrant"
        ],
        "marketUse": "Pulse soups, concentrated protein feed",
        "grainType": "Compact seed, high biological nitrogen fixing capacity"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_30_field_pea_green_yellow_peas",
    "name": "Field Pea (Green/Yellow Peas)",
    "category": "pulses",
    "subcategory": "Primary Pulses",
    "localNames": {
      "gu": "વટાણા",
      "hi": "मटर",
      "en": "Field Pea / Garden Pea"
    },
    "scientificName": "Pisum sativum",
    "marketTypes": [
      {
        "typeName": "Sweet Garden Green Pea (મીઠા લીલા વટાણા - શાકભાજી સ્પેશિયલ)",
        "varieties": [
          "Arka Mayur",
          "GS-10",
          "Pusa Pragati",
          "Azad Pea 3",
          "Matar Ageta-6",
          "Golden Pea"
        ],
        "marketUse": "Fresh vegetable markets, IQF frozen peas, dehydrated green peas",
        "grainType": "Wrinkled seed coat, high sugar content (sweet taste), bright green pods"
      },
      {
        "typeName": "Smooth Yellow Dry Field Pea (સૂકા પીળા વટાણા - રગડા પેટીસ સ્પેશિયલ)",
        "varieties": [
          "Aparna (HFP-4)",
          "Dantivada Pea 1",
          "HPS-1",
          "Pant P-5",
          "Rachna",
          "Jayanti"
        ],
        "marketUse": "Street food Ragda (રગડા પેટીસ), dried pea split dal, snacks, wholesale mandi trade",
        "grainType": "Round smooth spherical yellow seed, uniform size, drought tolerant dwarf plant"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_31_lupin",
    "name": "Lupin",
    "category": "pulses",
    "subcategory": "Primary Pulses",
    "localNames": {
      "gu": "લ્યુપિન / કડવી દાળ",
      "hi": "ल्यूपिन",
      "en": "Lupin / Lupine Bean"
    },
    "scientificName": "Lupinus albus / angustifolius",
    "marketTypes": [
      {
        "typeName": "Sweet White Lupin (મીઠું લ્યુપિન - માનવ આહાર)",
        "varieties": [
          "Dieta",
          "Albus Sweet",
          "Bordako",
          "Tanjil"
        ],
        "marketUse": "High-protein flour (35-40% protein), gluten-free baking, fermented plant foods",
        "grainType": "Flat creamy-white square-oval seed, zero bitterness (low alkaloid <0.02%)"
      },
      {
        "typeName": "Blue / Narrow-Leafed Lupin (પશુ આહાર લ્યુપિન)",
        "varieties": [
          "Mandelup",
          "Coromup",
          "Belara"
        ],
        "marketUse": "High protein cattle and dairy feed, green manure soil recharger",
        "grainType": "Speckled seed, deep root system opening subsoil compaction"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_32_bambara_groundnut",
    "name": "Bambara Groundnut",
    "category": "pulses",
    "subcategory": "Primary Pulses",
    "localNames": {
      "gu": "બામ્બારા નટ / આફ્રિકન મગફળી",
      "hi": "बम्बारा मूँगफली",
      "en": "Bambara Groundnut / Earth Pea"
    },
    "scientificName": "Vigna subterranea",
    "marketTypes": [
      {
        "typeName": "Red & Mottled High-Iron Seed (લાલ અને છાંટણાવાળા)",
        "varieties": [
          "Uniswa Red",
          "Mottled Cream",
          "Songoka"
        ],
        "marketUse": "Boiled fresh snacks, high-protein flour, extreme drought-resistant legume",
        "grainType": "Subterranean pod like peanut, round hard seed, rich in essential amino acids (methionine)"
      },
      {
        "typeName": "Cream / White Eyed Seed (સફેદ બામ્બારા)",
        "varieties": [
          "Cream Local",
          "Gweru White"
        ],
        "marketUse": "Porridge, snacks, culinary flour",
        "grainType": "Cream colored round seed, high starch and balanced 20% protein"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_33_lablab_hyacinth_bean",
    "name": "Lablab (Hyacinth Bean)",
    "category": "pulses",
    "subcategory": "Primary Pulses",
    "localNames": {
      "gu": "પાપડી / સુરતી પાપડી / વાલોળ",
      "hi": "सेम फली / लबलब",
      "en": "Lablab / Hyacinth Bean"
    },
    "scientificName": "Lablab purpureus",
    "marketTypes": [
      {
        "typeName": "Surti Flat Tender Papdi (વિશ્વવિખ્યાત સુરતી પાપડી - કાટીગામ સ્પેશિયલ)",
        "varieties": [
          "Gujarat Papdi 1 (GP-1)",
          "Surti Papdi Local",
          "Katargam Papdi",
          "Anand Bean 1"
        ],
        "marketUse": "Iconic Surti Undhiyu (સુરતી ઊંધિયું), winter fresh pods, premium vegetable markets",
        "grainType": "Short, flat, stringless, feather-light green pods with distinct buttery aroma and sweet seeds"
      },
      {
        "typeName": "Walor / Long Bush Hyacinth Bean (વાલોળ શીંગો)",
        "varieties": [
          "Kashi Haritima",
          "Arka Jay",
          "Pusa Early Prolific",
          "Deepali"
        ],
        "marketUse": "Vegetable curry pods, pole climber farming, multi-harvesting",
        "grainType": "Long, broad green curved pods, prolific heavy yielding"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_34_winged_bean",
    "name": "Winged Bean",
    "category": "pulses",
    "subcategory": "Primary Pulses",
    "localNames": {
      "gu": "વિંગ્ડ બીન (ચાર પાંખવાળી શીંગ / ગોવા વાલ)",
      "hi": "चौकोनी सेम / पंखों वाली सेम",
      "en": "Winged Bean / Goa Bean"
    },
    "scientificName": "Psophocarpus tetragonolobus",
    "marketTypes": [
      {
        "typeName": "Green Tender Vegetable Winged Bean (લીલી શાકભાજી જાત)",
        "varieties": [
          "AKWB-1",
          "Reveille",
          "Chimbu",
          "Pusa Navrang"
        ],
        "marketUse": "Crispy stir-fry vegetable, leaves edible as spinach, tuberous roots eaten like potato",
        "grainType": "4 distinct wavy frilly longitudinal wings along the square pod, harvested 15-20 days after flowering"
      },
      {
        "typeName": "High-Protein Dry Grain Type (સૂકા દાણાની જાત)",
        "varieties": [
          "UPS-122",
          "TPT-2",
          "WB-2"
        ],
        "marketUse": "Soy-equivalent pulse, 30-38% protein and 15-18% edible oil",
        "grainType": "Round shiny tan or brown seeds, exceptional nutritional profile"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_35_cluster_bean_guar",
    "name": "Cluster Bean (Guar)",
    "category": "pulses",
    "subcategory": "Primary Pulses",
    "localNames": {
      "gu": "ગુવાર / ગુવારફળી",
      "hi": "ग्वार / ग्वार फली",
      "en": "Cluster Bean / Guar"
    },
    "scientificName": "Cyamopsis tetragonoloba",
    "marketTypes": [
      {
        "typeName": "Industrial High-Gum Seed Guar (ગમ ઉદ્યોગ માટેના બીયાં ગુવાર)",
        "varieties": [
          "RGC-936",
          "HG-365",
          "HG-563",
          "RGC-1002",
          "RGC-1017",
          "Gujarat Guar 1 (GG-1)",
          "Gujarat Guar 2 (GG-2)"
        ],
        "marketUse": "International export for Guar Gum (ગેલેક્ટોમેનન), oil drilling friction reducer, food stabilizer, textile sizing",
        "grainType": "Hard greyish-white small round seed, gum content 28-33%, drought hardy desert crop"
      },
      {
        "typeName": "Tender Sweet Vegetable Guar (શાકભાજીનો દેશી દેશાવરી ગુવાર)",
        "varieties": [
          "Pusa Navbahar",
          "Pusa Domausami",
          "Gujarat Vegetable Guar 1 (GVG-1)",
          "Anand Vegetable Guar",
          "Durgapura Safed"
        ],
        "marketUse": "Soft, stringless tender pods for fresh vegetable markets (દેશી મીઠો ગુવાર)",
        "grainType": "Long straight flat clusters, low fiber when young, high culinary demand"
      }
    ],
    "status": "card_ready"
  },
  {
    "id": "crop_36_horse_gram",
    "name": "Horse Gram",
    "category": "pulses",
    "subcategory": "Primary Pulses",
    "localNames": {
      "gu": "કુલથી / કળથી",
      "hi": "कुलथी",
      "en": "Horse Gram"
    },
    "scientificName": "Macrotyloma uniflorum",
    "marketTypes": [
      {
        "typeName": "Brown Grain High-Medicinal Cultivar (બદામી કળથી - પથરી નિવારક)",
        "varieties": [
          "Gujarat Horse Gram 1 (GHG-1)",
          "CRHG-4",
          "Paiyur 2",
          "AK-21",
          "Birsa Kulthi 1",
          "Dharwad Kulthi"
        ],
        "marketUse": "Ayurvedic decoctions (dissolves kidney stones - પથરી તોડવા માટેનો ઉકાળો), herbal pulse soups, horses and drought livestock feed",
        "grainType": "Flat kidney-shaped small brown/black mottled seed, high antioxidant, enzyme inhibitor and calcium content"
      },
      {
        "typeName": "Black & Mottled Rust-Tolerant Cultivar (કાળી કુલથી)",
        "varieties": [
          "Madhu",
          "PHG-9",
          "VL Gahat 8",
          "VL Gahat 10"
        ],
        "marketUse": "Mountain and rainfed whole grain cooking, green cover crop for soil conservation",
        "grainType": "Deep black hard seed coat, high resilience to nutrient-poor soils"
      }
    ],
    "status": "card_ready"
  },
    {
      "id": "crop_37_soybean",
      "name": "Soybean",
      "category": "oilseeds",
      "subcategory": "Major Oilseeds",
      "localNames": {
        "gu": "સોયાબીન",
        "hi": "सोयाबीन",
        "en": "Soybean"
      },
      "scientificName": "Glycine max",
      "marketTypes": [
        {
          "typeName": "Medium Maturity High-Yielding Standard (મધ્યમ ગાળાની મુખ્ય જાતો - ૯૫ થી ૧૦૫ દિવસ)",
          "varieties": [
            "JS 335 (સૌથી વધુ વવાયેલ રાષ્ટ્રીય જાત)",
            "JS 20-29",
            "JS 20-34",
            "JS 20-69",
            "Phule Sangam (KDS 726 - રેકોર્ડ ઉત્પાદન)",
            "Phule Kimaya (KDS 753)"
          ],
          "marketUse": "Commercial oil extraction (18-20% oil), solvent extraction plants, high-protein de-oiled cake (DOC) for cattle/poultry feed",
          "grainType": "Medium cream/yellow round seeds with black/brown hilum, uniform size, non-shattering pods"
        },
        {
          "typeName": "Early Maturing Drought-Escape (વહેલી પાકતી જાતો - ૮૫ થી ૯૦ દિવસ)",
          "varieties": [
            "JS 95-60 (અતિ લોકપ્રિય વહેલી જાત)",
            "JS 93-05",
            "NRC 37 (Ahilya 2)",
            "NRC 127",
            "MACS 1407"
          ],
          "marketUse": "Short rainfall zones, catch cropping, enables timely rabi sowing of wheat or gram",
          "grainType": "Slightly smaller golden-yellow grains, quick maturity, moderate shatter resistance"
        },
        {
          "typeName": "Bold Seeded Food & Soymilk Grade (મોટા દાણા - ખાદ્ય, સોયા પનીર/ટોફુ અને દૂધ)",
          "varieties": [
            "NRC 142 (Lipoxygenase-2 free - કડવાશ મુક્ત)",
            "NRC 138",
            "Himsoya",
            "Karune (Green vegetable edamame)",
            "JS 20-98"
          ],
          "marketUse": "Direct culinary food processing, soymilk, tofu, edamame snacks, health flour blending",
          "grainType": "Extra-large plump cream grains, low beany odor, high protein (41-43%)"
        },
        {
          "typeName": "Disease Resistant & Charcoal Rot Tolerant (રોગ-જીવાત પ્રતિરોધક સુધારેલી જાતો)",
          "varieties": [
            "RVS 2001-4 (Raj Vijay)",
            "DSb 21",
            "NRC 7",
            "AMS 100-39 (PDKV)",
            "SL 958"
          ],
          "marketUse": "High rainfall or humid heavy black soils prone to collar rot, yellow mosaic virus and girdle beetle",
          "grainType": "Sturdy yellow grains, thick pod shell preventing field sprouting"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_38_groundnut_peanut",
      "name": "Groundnut (Peanut)",
      "category": "oilseeds",
      "subcategory": "Major Oilseeds",
      "localNames": {
        "gu": "મગફળી (માંડવી / સીંગ)",
        "hi": "मूंगफली / दाना",
        "en": "Groundnut / Peanut"
      },
      "scientificName": "Arachis hypogaea",
      "marketTypes": [
        {
          "typeName": "Spanish Bunch Type - Erect / Small Pods (સ્પૅનિશ ગુચ્છાદાર / ઊભડી મગફળી - ૯૫ થી ૧૦૫ દિવસ)",
          "varieties": [
            "GG 2 (ગુજરાત જૂનાગઢ મગફળી ૨)",
            "GG 7 (ઉનાળુ અને ખરીફ લોકપ્રિય)",
            "GG 5",
            "GJG 9 (જૂનાગઢ મગફળી ૯)",
            "TAG 24 (ટ્રોમ્બે અકોલા)",
            "TG 37A",
            "JL 24 (Phule Pragati)",
            "Kadiri 6 (K 6)",
            "Kadiri 9",
            "DH 86"
          ],
          "marketUse": "Edible roasting, salted peanuts, short kharif & summer crop, high oil crushing (49-51%)",
          "grainType": "Compact 2-seeded cylindrical pods, light pink kernel, clustered tightly around the root collar"
        },
        {
          "typeName": "Semi-Spreading Main Season (અર્ધ-વેલડી મગફળી - ૧૧૦ થી ૧૨૦ દિવસ)",
          "varieties": [
            "GG 20 (જી-૨૦ - સૌરાષ્ટ્રની રાજકન્યા જાત)",
            "GJG 22 (સુધારેલી નવી જાત)",
            "GG 8",
            "Somnath (TGS 1)",
            "Girnar 2",
            "Girnar 3 (High Oleic)",
            "GG 16"
          ],
          "marketUse": "The primary backbone of Saurashtra APMC mandis and oil mill crushing (સીંગતેલ), excellent green dry fodder (ભૂસું/ગોતર)",
          "grainType": "Medium bold uniform pods, high shelling turnover (70-73%), deep pink seeds, high test weight"
        },
        {
          "typeName": "Virginia Runner / Bold Spreading (જાડા દાણા - વેલડી મગફળી - ૧૨૦ થી ૧૩૫ દિવસ)",
          "varieties": [
            "GG 11 (વેલડી મુખ્ય જાત)",
            "GG 13",
            "GJG 17",
            "GJG 32",
            "Mallika",
            "Western 44"
          ],
          "marketUse": "Chikki manufacturing, peanut butter, confectionery paste, high drought tolerance in low rain",
          "grainType": "Long trailing vines, large curved 2-to-3 seeded pods, thick netted shell, high dormancy"
        },
        {
          "typeName": "High-Oleic Confectionery Export Quality (હાઈ ઓલિક બોલ્ડ દાણા - એક્સપોર્ટ ક્વોલિટી)",
          "varieties": [
            "Girnar 4 (૮૦% ઓલિક એસિડ - સુપર હેલ્ધી)",
            "Girnar 5",
            "TG 51",
            "TLG 45 (જમ્બો દાણા)",
            "TCGS 888",
            "ICGV 00350"
          ],
          "marketUse": "Export to European Union, Middle East, snacks and breakfast cereals with long shelf life without rancidity",
          "grainType": "Extra-large jumbo pink seeds (count 40-50 per ounce), very low aflatoxin susceptibility, premium mandi rate"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_39_rapeseed_mustard",
      "name": "Rapeseed/Mustard",
      "category": "oilseeds",
      "subcategory": "Major Oilseeds",
      "localNames": {
        "gu": "રાયડો / સરસવ / રાઈ",
        "hi": "सरसों / राई / तोरिया",
        "en": "Rapeseed / Mustard"
      },
      "scientificName": "Brassica juncea / Brassica campestris",
      "marketTypes": [
        {
          "typeName": "Gujarat Mustard Hybrids & High Yielding (ગુજરાત રાયડો - સરદારકૃષિનગર યુનિવર્સિટી જાતો)",
          "varieties": [
            "Gujarat Mustard 2 (GM 2)",
            "Gujarat Mustard 3 (GM 3 - અતિ લોકપ્રિય ઉત્તર ગુજરાત અને સૌરાષ્ટ્ર)",
            "GDM 4 (કાંટાળી શીંગો - ભૂંડ અને પક્ષીઓના નુકસાન સામે સુરક્ષિત)",
            "GM 6 (કચ્છ અને અર્ધશુષ્ક વિસ્તાર માટે શ્રેષ્ઠ)"
          ],
          "marketUse": "Edible kachchi ghani mustard oil (39-42% oil), high pungency allyl isothiocyanate, cattle cake (ખોળ)",
          "grainType": "Uniform medium reddish-brown to dark seeds, dense siliqua pods, strong shattering resistance"
        },
        {
          "typeName": "Bold Seeded Indian Mustard (બોલ્ડ સરસવ - વરુણા, પુસા અને પાયોનિયર શ્રેણી)",
          "varieties": [
            "Varuna (T 59 - રાષ્ટ્રીય સ્ટાન્ડર્ડ)",
            "Pusa Bold",
            "Bio 902 (Pusa Jaikisan)",
            "Kranti (PR 15)",
            "RH 749",
            "RH 725",
            "Giriraj (DRMRIJ 31)",
            "Pioneer 45S46 (Private Hybrid)"
          ],
          "marketUse": "Maximum oil extraction, heavy mandi weight, tall branched canopy with high pod density",
          "grainType": "Bold spherical dark brown to black seeds, high 1000-seed weight (5.5 - 6.5 g), high oil yield"
        },
        {
          "typeName": "Yellow Mustard / Sarson (પીળી સરસવ - મસાલા, અથાણાં અને પારદર્શક તેલ)",
          "varieties": [
            "Pusa Gold",
            "YST 151",
            "Pitambari",
            "Narendra Rai 1",
            "NRCYS 05-02"
          ],
          "marketUse": "Clean golden cooking oil without dark discoloration, pickle processing (અથાણાંનો સંભાર), table mustard paste",
          "grainType": "Bright glossy golden-yellow round seeds, milder pungency, high oil content (43-45%)"
        },
        {
          "typeName": "Toria & Early Rapeseed (વહેલી પાકતી તોરિયા - ૭૫ થી ૮૫ દિવસ)",
          "varieties": [
            "TL 15",
            "PT 303",
            "Bhawani",
            "Panchali",
            "Tapeshwari"
          ],
          "marketUse": "Catch crop harvested early between Kharif paddy/cotton and late Rabi wheat/vegetables",
          "grainType": "Small smooth brown seeds, short plant stature, quick branching"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_40_sunflower",
      "name": "Sunflower",
      "category": "oilseeds",
      "subcategory": "Major Oilseeds",
      "localNames": {
        "gu": "સૂર્યમુખી",
        "hi": "सूरजमुखी",
        "en": "Sunflower"
      },
      "scientificName": "Helianthus annuus",
      "marketTypes": [
        {
          "typeName": "High Oil Crushing Hybrids (વ્યાપારી તેલ ઉત્પાદન હાઇબ્રિડ - ૯૦ થી ૧૦૦ દિવસ)",
          "varieties": [
            "KBSH 41 (બેંગ્લોર હાઇબ્રિડ)",
            "KBSH 44",
            "KBSH 53",
            "DRSH 1 (ICAR IIOR હાઇબ્રિડ)",
            "Sunbred 275",
            "PAC 361",
            "Phule Bhaskar"
          ],
          "marketUse": "Refined heart-healthy cooking oil (high Linoleic acid & Vitamin E), premium poultry feed cake",
          "grainType": "Black striped medium elongated seeds (achenes), thin hull, 40-44% oil recovery, high seed setting"
        },
        {
          "typeName": "Confectionery, Birdfeed & Large Seeded (મોટા દાણા - નાસ્તો, બેકરી અને બર્ડફીડ)",
          "varieties": [
            "Modern (Morden - પ્રારંભિક મુક્ત પરાગિત જાત)",
            "Badami Sunflower",
            "Giant Russian",
            "Mammoth Grey Stripe"
          ],
          "marketUse": "Toasted and salted snack seeds, confectionery toppings, breakfast muesli, export birdfeed",
          "grainType": "Extra-large broad grey and white striped seeds, high kernel-to-hull ratio, lower oil but high protein"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_41_sesame_til",
      "name": "Sesame (Til)",
      "category": "oilseeds",
      "subcategory": "Major Oilseeds",
      "localNames": {
        "gu": "તલ (સફેદ, કાળા અને લાલ તલ)",
        "hi": "तिल (सफेद, काला, लाल)",
        "en": "Sesame / Gingelly"
      },
      "scientificName": "Sesamum indicum",
      "marketTypes": [
        {
          "typeName": "Pure Pearl White Commercial Sesame (સફેદ તલ - નિકાસ ગુણવત્તા - ખરીફ અને ઉનાળુ)",
          "varieties": [
            "Gujarat Til 1 (GT 1 - જૂનાગઢ)",
            "Gujarat Til 2 (GT 2 - ઉનાળુ ખેતી માટે શ્રેષ્ઠ)",
            "Gujarat Til 3 (GT 3)",
            "Gujarat Til 4 (GT 4)",
            "Gujarat Til 5 (GT 5 - સુધારેલી ઊંચી ઉપજ)",
            "RT 351",
            "TKG 22",
            "Swetha"
          ],
          "marketUse": "Sesame chikki, sweets, tahini, burger buns, confectionery, high premium export to Japan, Korea, Europe",
          "grainType": "Brilliant pearl-white flat oval seeds, 49-53% sweet edible oil, excellent crunch"
        },
        {
          "typeName": "Jet Black Medicinal & Pooja Sesame (કાળા તલ - ઔષધીય અને પૂજા અર્ચના)",
          "varieties": [
            "Gujarat Til 10 (GT 10 - જૂનાગઢ સ્પેશિયલ કાળા તલ)",
            "Kalathil",
            "TKG 55",
            "RT 346",
            "Prachi"
          ],
          "marketUse": "Ayurvedic medicines, hair oils, therapeutic tonics, holy religious pooja rituals, high price per quintal",
          "grainType": "Deep jet-black shiny seed coat, rich in natural antioxidants (sesamin and sesamolin), distinct earthy aroma"
        },
        {
          "typeName": "Reddish & Brown Crushing Sesame (લાલ/કથ્થાઈ તલ - પરંપરાગત ઘાણી તેલ)",
          "varieties": [
            "Purva 1",
            "TMV 3",
            "TMV 7",
            "VRI 1"
          ],
          "marketUse": "Traditional South Indian gingelly oil, cold-pressed raw sesame oil, Ayurvedic massage oils",
          "grainType": "Reddish-brown seeds, high pungent aroma, high oil extraction percentage"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_42_safflower",
      "name": "Safflower",
      "category": "oilseeds",
      "subcategory": "Major Oilseeds",
      "localNames": {
        "gu": "કુસુમ / કરડી",
        "hi": "कुसुम / करडी",
        "en": "Safflower"
      },
      "scientificName": "Carthamus tinctorius",
      "marketTypes": [
        {
          "typeName": "Spiny High-Linoleic Edible Oil (કાંટાળી કુસુમ - ઉચ્ચ લિનોલીઇક હૃદયલક્ષી તેલ)",
          "varieties": [
            "A-1 (Annigeri 1)",
            "NARI-6 (નિમ્બકર ઇન્સ્ટિટ્યૂટ)",
            "PBNS-12",
            "Bhima",
            "Phule Kusuma",
            "Sharda"
          ],
          "marketUse": "Premium cooking oil for reducing blood cholesterol, drought-proof rabi crop in residual moisture",
          "grainType": "White pyramidal angular seeds (achenes), spiny involucral bracts preventing grazing by cattle/wild boar, 30-34% oil"
        },
        {
          "typeName": "Spineless & Floret Petal Dye Type (કાંટા વગરની કુસુમ - કુદરતી કેસર રંગ અને હર્બલ ટી)",
          "varieties": [
            "NARI-NH-1 (Spineless Hybrid)",
            "DSH-129",
            "JSF-1",
            "NARI-Poornima"
          ],
          "marketUse": "Harvesting dried red/orange florets as false saffron (Kusum Phool), herbal infusions, natural textile coloring, high oleic oil",
          "grainType": "Smooth non-spiny leaves for easy manual picking, bright crimson florets, medium white seeds"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_43_linseed_flax",
      "name": "Linseed (Flax)",
      "category": "oilseeds",
      "subcategory": "Major Oilseeds",
      "localNames": {
        "gu": "અળસી",
        "hi": "अलसी / तीसी",
        "en": "Linseed / Flaxseed"
      },
      "scientificName": "Linum usitatissimum",
      "marketTypes": [
        {
          "typeName": "Food Grade Omega-3 Flaxseed (ખાદ્ય અળસી - મુખવાસ, પોષણ અને સુપરફૂડ)",
          "varieties": [
            "Gaurav",
            "Padmini",
            "JLS 27",
            "RLC 92",
            "Deepika",
            "Tiara"
          ],
          "marketUse": "Roasted mukhwas with lemon-salt, dietary Omega-3 supplements (Alpha-Linolenic Acid), bakery breads, dietary fiber",
          "grainType": "Glossy golden-brown flattened oval seeds with sharp beak, crisp crunchy texture, pleasant nutty taste"
        },
        {
          "typeName": "Industrial & Technical Fast-Drying Oil (ઔદ્યોગિક અળસી - પેઇન્ટ, વાર્નિશ અને પોલિશ)",
          "varieties": [
            "Neelam",
            "Sharda",
            "Meera",
            "Shikha",
            "T 397"
          ],
          "marketUse": "Quick-drying boiled linseed oil for wood varnish, oil paints, printing inks, linoleum flooring, dual-purpose linen fiber",
          "grainType": "High iodine number oil (175-195), dark brown firm seeds, high resistance to powdery mildew"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_44_castor_bean",
      "name": "Castor Bean",
      "category": "oilseeds",
      "subcategory": "Major Oilseeds",
      "localNames": {
        "gu": "દિવેલા (એરંડા)",
        "hi": "अरंडी (रेड़ी)",
        "en": "Castor Bean"
      },
      "scientificName": "Ricinus communis",
      "marketTypes": [
        {
          "typeName": "Gujarat Commercial High-Yielding Hybrids (ગુજરાત હાઇબ્રિડ એરંડા - વિશ્વ પ્રસિદ્ધ જાતો)",
          "varieties": [
            "Gujarat Castor Hybrid 7 (GCH 7 - ઉત્તર ગુજરાત, સૌરાષ્ટ્ર અને કચ્છનો રાજા)",
            "GCH 9 (સરદારકૃષિનગર યુનિવર્સિટી નવી હાઇબ્રિડ જાત)",
            "GCH 11 (સુધારેલી ઉચ્ચ ઉત્પાદક જાત)",
            "GCH 4 (ઐતિહાસિક વિશ્વપ્રસિદ્ધ હાઇબ્રિડ)",
            "GCH 8 (સુકારો પ્રતિરોધક)",
            "DCH 519"
          ],
          "marketUse": "Aviation turbine lubricants, hydraulic fluids, Nylon-11 engineering polymers, castor oil export (Gujarat leads >80% world supply)",
          "grainType": "Large mottled shiny seeds with prominent caruncle, 48-52% ricinoleic acid non-edible oil, dense spiny spikes"
        },
        {
          "typeName": "Wilt & Root-Rot Tolerant Lines (સુકારો અને જમીનજન્ય મૂળના કોહવારા સામે પ્રતિરોધક જાતો)",
          "varieties": [
            "GCH 2",
            "GC 3 (ગુજરાત એરંડા ૩ - વેરાઇટી)",
            "DCH 177",
            "YRCH 1",
            "Pragati (PCS 124)"
          ],
          "marketUse": "Recommended for wilt-sick soils and heavy textured lands prone to Macrophomina and Fusarium root wilt",
          "grainType": "Uniform grey-brown patterned seeds, strong root system with vigorous tertiary branching"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_45_niger_seed",
      "name": "Niger Seed",
      "category": "oilseeds",
      "subcategory": "Major Oilseeds",
      "localNames": {
        "gu": "ખુરાસણી (રામતિલ)",
        "hi": "रामतिल / खुरासनी",
        "en": "Niger Seed"
      },
      "scientificName": "Guizotia abyssinica",
      "marketTypes": [
        {
          "typeName": "Rainfed Tribal Hill & Plateau Varieties (ચોમાસુ ડુંગરાળ અને પહાડી જાતો - શૂન્ય ખર્ચ ખેતી)",
          "varieties": [
            "Gujarat Niger 1 (GN 1 - નવસારી કૃષિ યુનિવર્સિટી)",
            "IGPN 2004-1 (પૂજા)",
            "Birsa Niger 1",
            "Utkal Niger 150",
            "Deomali",
            "KGN 2"
          ],
          "marketUse": "Traditional cold-pressed tribal edible oil, dry roasted spicy chutney (ખુરાસણીની ચટણી), wild songbird feed export to USA and Europe",
          "grainType": "Small elongated shiny jet-black seeds, high oil content (38-42%), prolific yellow daisy-like flowers attracting bees"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_46_cottonseed",
      "name": "Cottonseed",
      "category": "oilseeds",
      "subcategory": "Major Oilseeds",
      "localNames": {
        "gu": "કપાસિયા (રૂ / કપાસનું બિયારણ)",
        "hi": "बिनौला / कपास के बीज",
        "en": "Cottonseed"
      },
      "scientificName": "Gossypium hirsutum / Gossypium herbaceum",
      "marketTypes": [
        {
          "typeName": "Transgenic Bt Hybrid Cottonseed (બીટી કપાસિયા - રિફાઇન્ડ તેલ અને ખોળનો મુખ્ય સ્ત્રોત)",
          "varieties": [
            "RCH 2 Bt",
            "Bollgard II Hybrids",
            "Gujarat Cotton Hybrid 8 (G.Cot.Hy 8)",
            "G.Cot 10",
            "Ajit 155",
            "Kaveri Jadu",
            "ATM Bt"
          ],
          "marketUse": "Refined edible cottonseed oil (ગુજરાતનું મુખ્ય રસોઈ તેલ), high-protein cottonseed oil cake (કપાસિયા ખોળ) for milch dairy cattle",
          "grainType": "Fuzzy dark seeds with linters requiring mechanical delinting, 18-22% edible oil, 38-42% protein rich meal"
        },
        {
          "typeName": "Desi Herbaceum / Arboreum Non-Bt (દેશી કપાસિયા - ભાલ અને કાનમ કપાસ)",
          "varieties": [
            "G.Cot 13 (કાનમ ટ્રેક્ટ)",
            "G.Cot 21",
            "Wagad Cotton (ભાલ કપાસ)",
            "V 797",
            "Jayadhar"
          ],
          "marketUse": "Rainfed drought-hardy ecology, organic cotton value chain, traditional whole boiled cottonseed cattle feed",
          "grainType": "Smaller dense seeds, thick seed coat, very high natural drought and salinity resilience"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_47_oil_palm",
      "name": "Oil Palm",
      "category": "oilseeds",
      "subcategory": "Major Oilseeds",
      "localNames": {
        "gu": "પામ ઓઇલ (તેલી તાળ)",
        "hi": "ऑयल पाम / ताड़ का पेड़",
        "en": "Oil Palm"
      },
      "scientificName": "Elaeis guineensis",
      "marketTypes": [
        {
          "typeName": "Tenera Hybrid High Oil Bunches (ટેનેરા હાઇબ્રિડ - ડુરા x પિસિફેરા ક્રોસ)",
          "varieties": [
            "Palode Tenera (ICAR IIOPR પેકેજ)",
            "Godrej Gold Tenera",
            "ASD Costa Rica Tenera",
            "Deli x AVROS",
            "Calabar Hybrids"
          ],
          "marketUse": "World's most productive oil crop (4-5 tonnes edible oil/hectare), crude palm oil (CPO) for cooking, palm kernel oil for soaps and bio-lubricants",
          "grainType": "Fresh Fruit Bunches (FFB) weighing 15-25 kg with fibrous fleshy orange mesocarp (45-50% oil) surrounding hard kernel nut"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_48_coconut",
      "name": "Coconut",
      "category": "oilseeds",
      "subcategory": "Major Oilseeds",
      "localNames": {
        "gu": "નાળિયેર (શ્રીફળ / ત્રોફો)",
        "hi": "नारियल / गरी",
        "en": "Coconut"
      },
      "scientificName": "Cocos nucifera",
      "marketTypes": [
        {
          "typeName": "Coastal Tall Commercial Copra & Oil (દરિયાકાંઠાની ઊંચી જાતો - કોપરા અને તેલ)",
          "varieties": [
            "West Coast Tall (WCT - પશ્ચિમ કિનારો)",
            "Pratap (પ્રતાપ - મહારાષ્ટ્ર અને દક્ષિણ ગુજરાત)",
            "East Coast Tall (ECT)",
            "Gujarat Coconut 1 (સૌરાષ્ટ્ર કોસ્ટલ રિસર્ચ સ્ટેશન મહુવા)",
            "Tiptur Tall"
          ],
          "marketUse": "Dry copra making, virgin coconut oil, edible hair and body oil, religious holy offerings, coir fiber extraction",
          "grainType": "Large round to oval green/brown nuts, thick fibrous husk, thick solid white endosperm (meat) with 65-68% oil"
        },
        {
          "typeName": "Dwarf Varieties for Sweet Tender Water (વામન જાતો - મીઠું નાળિયેર પાણી / ત્રોફા)",
          "varieties": [
            "Chowghat Orange Dwarf (COD)",
            "Chowghat Green Dwarf (CGD)",
            "Malayan Yellow Dwarf (MYD)",
            "Kalpa Jyothi"
          ],
          "marketUse": "Commercial fresh tender water roadside stalls (350-500 ml sweet isotonic mineral water per nut), early bearing in 3-4 years",
          "grainType": "Medium golden-orange or bright green nuts, thin husk, high water volume with delicious sweetness"
        },
        {
          "typeName": "High-Yielding Tall x Dwarf Hybrids (હાઇબ્રિડ ટી x ડી - ડબલ ઉપયોગ)",
          "varieties": [
            "Kera Sankara (WCT x COD)",
            "Chandralaksha (Laccadive Ordinary x COD)",
            "VHC 1",
            "Godavari Ganga"
          ],
          "marketUse": "Heavy commercial yield (120-160 nuts/palm/year), commercial copra drying, packaged tender coconut water",
          "grainType": "Medium uniform nuts, rapid growth, heavy bearing bunches with thick kernel and good water volume"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_49_potato",
      "name": "Potato",
      "category": "tubers",
      "subcategory": "Starch Roots",
      "localNames": {
        "gu": "બટાટા (બટાકા)",
        "hi": "आलू",
        "en": "Potato"
      },
      "scientificName": "Solanum tuberosum",
      "marketTypes": [
        {
          "typeName": "Table & Ware Potato - Main Round/Oval (શાકભાજી માટેના સામાન્ય બટાટા - ૮૦ થી ૯૦ દિવસ)",
          "varieties": [
            "Kufri Pukhraj (કુફરી પુખરાજ - ડીસા અને ઉત્તર ગુજરાતની શાન)",
            "Kufri Jyoti (સાર્વત્રિક અનુકૂળ)",
            "Kufri Lauvkar (વહેલી પાકતી જાત - ૭૫ દિવસ)",
            "Kufri Badshah (કુફરી બાદશાહ - મોડી પાકતી ઊંચી ઉપજ)",
            "Kufri Bahar (3797)"
          ],
          "marketUse": "Daily kitchen cooking, boiled mashed potato, sabzi, cold-storage bulk mandi trade across Gujarat and India",
          "grainType": "Large oval to slightly flat tubers, smooth creamy-yellow skin, shallow eyes, pale yellow flesh"
        },
        {
          "typeName": "Processing & Chip-grade Potato (ચિપ્સ, વેફર્સ અને ફ્રેન્ચ ફ્રાઈસ સ્પેશિયલ)",
          "varieties": [
            "Kufri Chipsona 1 (કુફરી ચિપ્સોના ૧ - ઉચ્ચ ડ્રાય મેટર)",
            "Kufri Chipsona 3 (શ્રેષ્ઠ ચિપ્સિંગ ગુણવત્તા)",
            "Kufri Chipsona 4",
            "Kufri Frysona (ફ્રેન્ચ ફ્રાઈસ સ્પેશિયલ)",
            "Lady Rosetta (રેડ સ્કીન - બાલાજી અને લેય્સ કોન્ટ્રાક્ટ)"
          ],
          "marketUse": "Contract commercial farming for Balaji Wafers, PepsiCo Lay's, ITC, McCain; high dry matter (>21%), low reducing sugars (<0.1%) preventing brown burnt color during deep frying",
          "grainType": "Uniform round/oblong tubers, firm white to cream flesh, shallow eyes, minimal water retention"
        },
        {
          "typeName": "Red-Skinned Table Potato (લાલ છાલવાળા બટાટા - ઉત્કૃષ્ટ સંગ્રહ શક્તિ)",
          "varieties": [
            "Kufri Lalima",
            "Kufri Sindhuri (કુફરી સિંદૂરી)",
            "Kufri Arun",
            "Kufri Manik (લાલ ગર્ભ એન્ટીઓક્સીડેન્ટ)"
          ],
          "marketUse": "High keeping quality and storage resistance, preferred in Eastern India, Bihar, Bengal and export to Gulf/Nepal",
          "grainType": "Attractive shiny red/crimson skin, medium-deep eyes, dense yellow flesh, strong field dormancy"
        },
        {
          "typeName": "Heat-Tolerant Early Autumn Potato (ગરમી સહન કરતી વહેલી જાતો)",
          "varieties": [
            "Kufri Surya (કુફરી સૂર્યા - ઊંચા તાપમાને પણ ગાંઠ બંધાય છે)",
            "Kufri Lima",
            "Kufri Kiran"
          ],
          "marketUse": "Early autumn planting (September-October) capturing highest pre-season Diwali festival market rates",
          "grainType": "Oblong medium tubers, smooth skin, excellent tolerance to night temperatures above 20°C"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_50_sweet_potato",
      "name": "Sweet Potato",
      "category": "tubers",
      "subcategory": "Starch Roots",
      "localNames": {
        "gu": "શક્કરિયાં",
        "hi": "शकरकंद",
        "en": "Sweet Potato"
      },
      "scientificName": "Ipomoea batatas",
      "marketTypes": [
        {
          "typeName": "White / Cream Flesh Starch Roots (સફેદ / ક્રીમ ગર્ભ - પરંપરાગત મીઠા કંદ અને ફરાળી)",
          "varieties": [
            "Gujarat Sweet Potato 1 (GSP 1 - આણંદ કૃષિ યુનિવર્સિટી)",
            "Sree Bhadra",
            "Sree Vardhini",
            "Kalmegh",
            "Co 3",
            "Local Desi Shakariya"
          ],
          "marketUse": "Boiled table snack, upvas fasting food (ફરાળી પેટીસ, શીરો, સૂકીભાજી), industrial starch, livestock green forage",
          "grainType": "Fusiform spindle-shaped roots, pink/purple skin, dense firm cream-white flesh, sweet aromatic taste"
        },
        {
          "typeName": "Orange-Fleshed Biofortified Beta-Carotene (કેસરી ગર્ભ - વિટામિન 'A' સુપરફૂડ)",
          "varieties": [
            "Bhu Sona (૧૨૦-૧૪૦ ppm બીટા-કેરોટિન સમૃદ્ધ)",
            "Bhu Kanti",
            "Sree Kanaka",
            "ST 14",
            "Kamala Sundari"
          ],
          "marketUse": "Nutritional security, baby food purees, healthy bakery flour, anti-blindness health campaigns, premium urban sales",
          "grainType": "Bright golden-orange moist flesh, copper skin, high sugar content, velvety smooth texture upon baking"
        },
        {
          "typeName": "Purple-Fleshed Antioxidant Anthocyanin (જાંબલી શક્કરિયાં - કેન્સરરોધી એન્ટીઓક્સીડેન્ટ)",
          "varieties": [
            "Bhu Krishna (ભૂ કૃષ્ણા - ગાઢ જાંબલી રંગ)",
            "Sree Arun"
          ],
          "marketUse": "Specialty functional health food, natural food dye, low GI resistant starch, modern gourmet culinary dishes",
          "grainType": "Vivid dark purple skin and interior flesh, rich in natural anthocyanins and dietary fiber"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_51_cassava_tapioca",
      "name": "Cassava (Tapioca)",
      "category": "tubers",
      "subcategory": "Starch Roots",
      "localNames": {
        "gu": "કસાવા (સાબુદાણાનો કંદ / ટેપિયોકા)",
        "hi": "कसावा / साबूदाना कंद / टैपिओका",
        "en": "Cassava / Tapioca"
      },
      "scientificName": "Manihot esculenta",
      "marketTypes": [
        {
          "typeName": "Industrial Starch & Sago Processing (સાબુદાણા અને ઔદ્યોગિક સ્ટાર્ચ ઉત્પાદન)",
          "varieties": [
            "H-226 (હાઇબ્રિડ ૨૨૬ - સેલમ સાબુદાણા ઇન્ડસ્ટ્રી)",
            "H-165",
            "Sree Jaya",
            "Sree Vijaya",
            "Co (Tp) 4",
            "Co (Tp) 5"
          ],
          "marketUse": "Raw material for Sago (સાબુદાણા) processing mills, textile sizing, paper manufacturing, adhesive starch, bioethanol",
          "grainType": "Heavy cylindrical roots (1.5-3 kg each), thick brown woody bark, snow-white core with 30-34% extractable starch"
        },
        {
          "typeName": "Sweet Table Culinary Varieties (રસોઈ અને વેફર્સ માટે ખાદ્ય કસાવા)",
          "varieties": [
            "M-4 (મીઠો કસાવા - ઝીરો કડવાશ)",
            "Sree Prakash",
            "Sree Padmanabha",
            "Sree Rekha"
          ],
          "marketUse": "Boiled table dish, spicy cassava chips (ટેપિયોકા વેફર્સ), roasted snacks, traditional south coastal cuisine",
          "grainType": "Low cyanogenic glucosides (HCN < 50 ppm), soft floury texture when boiled, delicate mild nutty taste"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_52_yam",
      "name": "Yam",
      "category": "tubers",
      "subcategory": "Starch Roots",
      "localNames": {
        "gu": "રતાળુ (કંદ / ઊંધિયું સ્પેશિયલ)",
        "hi": "रतालू / याम / खम्हालू",
        "en": "Greater Yam / Asiatic Yam"
      },
      "scientificName": "Dioscorea alata / Dioscorea rotundata",
      "marketTypes": [
        {
          "typeName": "Traditional White Flesh Culinary Yam (સફેદ રતાળુ - કાઠિયાવાડી અને સુરતી ઊંધિયું સ્પેશિયલ)",
          "varieties": [
            "Sree Keerthi (ICAR CTCRI)",
            "Sree Roopa",
            "Sree Shilpa",
            "Local Surti Ratalu (સુરતી દેશી રતાળુ)",
            "Navsari Selection"
          ],
          "marketUse": "Crucial authentic vegetable for Gujarati Undhiyu (ઊંધિયું), wedding catering curries, fried ratalu chips, festive cooking",
          "grainType": "Large club-shaped or cylindrical tubers, rough fibrous dark brown skin, firm dense white flesh with mucilage"
        },
        {
          "typeName": "Vivid Purple Flesh Dioscorea Yam (જાંબલી રતાળુ / જાંબલી કંદ - વિશિષ્ટ સ્વાદ)",
          "varieties": [
            "Sree Neelima",
            "Sree Swathy",
            "Local Desi Purple Yam"
          ],
          "marketUse": "Exotic purple vegetable dishes, royal banquets, sweet candied yam halwa, specialty winter vegetable markets",
          "grainType": "Dark purple-patterned skin, deep purple to magenta interior rings, high anthocyanin and mineral content"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_53_taro_colocasia",
      "name": "Taro (Colocasia)",
      "category": "tubers",
      "subcategory": "Starch Roots",
      "localNames": {
        "gu": "અળવી (પત્તરાં અને અળવીની ગાંઠ)",
        "hi": "अरबी / घुइयां / अरुई",
        "en": "Taro / Colocasia / Eddoe"
      },
      "scientificName": "Colocasia esculenta",
      "marketTypes": [
        {
          "typeName": "Dual-Purpose Leaf & Corm Taro (પત્તરાં અને ગાંઠ ડબલ ઉપયોગી - પાત્રા સ્પેશિયલ)",
          "varieties": [
            "Gujarat Taro 1 (GT 1 - આણંદ કૃષિ યુનિવર્સિટી ભલામણ)",
            "Sree Rashmi",
            "Sree Pallavi",
            "Local Patra Alvi (પાત્રાના અળવી)"
          ],
          "marketUse": "Broad non-itching leaves used for Gujarati Patra (પાત્રા / વડી), succulent petiole stalks used in dals, mother corms boiled as root vegetable",
          "grainType": "Broad heart-shaped waxy green leaves with purplish petiole joint, low acridity, clustered medium brown corms"
        },
        {
          "typeName": "Corm-Centric Eddoe Table Taro (અળવીની બજારુ ગાંઠ - બટાટા વિકલ્પ શાકભાજી)",
          "varieties": [
            "Muktakeshi (મુક્તાકેશી - ગળામાં ખંજવાળ વગરની શ્રેષ્ઠ જાત)",
            "Narendra Arbi 1",
            "Panjab Arvi 1",
            "Telia Arbi"
          ],
          "marketUse": "Fried arbi fry, dahi arbi sabzi, upvas fasting snack, high starch culinary vegetable",
          "grainType": "Prolific small cylindrical to egg-shaped daughter corms, smooth ringed brown skin, dense white non-acrid flesh"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_54_elephant_foot_yam",
      "name": "Elephant Foot Yam",
      "category": "tubers",
      "subcategory": "Starch Roots",
      "localNames": {
        "gu": "સૂરણ (જીમીકંદ / કંદમૂળ)",
        "hi": "सूरन / जिमीकंद / ओल",
        "en": "Elephant Foot Yam"
      },
      "scientificName": "Amorphophallus paeoniifolius",
      "marketTypes": [
        {
          "typeName": "Acrid-Free Non-Itch Commercial Hybrids (મીઠું સૂરણ - ગળામાં ખંજવાળ મુક્ત વાણિજ્યિક જાતો)",
          "varieties": [
            "Gajendra (ગજેન્દ્ર - દેશભરમાં નંબર ૧ લોકપ્રિય જાત)",
            "Sree Padma (ICAR CTCRI)",
            "Bidhan Kusum",
            "NDA 9"
          ],
          "marketUse": "Gujarati Suran nu Shaak, suran fries, Diwali festival mandatory feast, Ayurvedic therapy for piles, constipation and gut health",
          "grainType": "Depressed globose corms weighing 3 to 8 kg, warted grey-brown skin, pale yellow to pinkish flesh, zero throat irritation"
        },
        {
          "typeName": "Traditional Desi Long-Shelf Yam (દેશી સૂરણ - ઔષધીય અને અથાણાં)",
          "varieties": [
            "Local Desi Santrampur",
            "Kovvur Local",
            "Chanchal"
          ],
          "marketUse": "Spicy mustard suran pickles (સૂરણનું અથાણું), folk medicine, outstanding keeping quality up to 6 months without rotting",
          "grainType": "Very dense hard corm, moderate calcium oxalate raphides (requiring tamarind/kokum during cooking), strong medicinal value"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_55_arrowroot",
      "name": "Arrowroot",
      "category": "tubers",
      "subcategory": "Starch Roots",
      "localNames": {
        "gu": "તવખીર (અરોરૂટ કંદ)",
        "hi": "अरारोट / तिखुर",
        "en": "West Indian / East Indian Arrowroot"
      },
      "scientificName": "Maranta arundinacea / Curcuma angustifolia",
      "marketTypes": [
        {
          "typeName": "Medicinal & Infant Food Pure White Starch (શુદ્ધ તવખીર પાવડર અને બેબી ફૂડ)",
          "varieties": [
            "Sree Raksha (CTCRI)",
            "Tikhur Local",
            "Kerala White Selection"
          ],
          "marketUse": "Premium therapeutic Tavkhir starch (તવખીર પાવડર) used for soothing gastric ulcers, infant digestive porridge, invalid diets, clear dessert jellies",
          "grainType": "Fleshy curved spindle rhizomes with papery overlapping scales, brilliant snow-white core with 20-24% ultra-fine starch"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_56_arracha",
      "name": "Arracha",
      "category": "tubers",
      "subcategory": "Starch Roots",
      "localNames": {
        "gu": "અરાકાચા (પીળા ગાજર જેવું કંદ)",
        "hi": "अराकाचा",
        "en": "Arracacha / Peruvian Carrot"
      },
      "scientificName": "Arracacia xanthorrhiza",
      "marketTypes": [
        {
          "typeName": "Yellow Culinary Carrot-Potato Hybrid Root (પીળું સ્ટાર્ચ રુટ - સૂપ અને ક્યુલિનરી)",
          "varieties": [
            "Yellow Andean",
            "White Root Cultivar"
          ],
          "marketUse": "Gourmet culinary soups, baby food purees, roasted vegetable medleys, delicate combination of celery and roasted chestnut flavor",
          "grainType": "Clustered tuberous rootstock resembling plump parsnips or pale carrots, fine starch granules that cook rapidly"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_57_jicama_yam_bean",
      "name": "Jicama (Yam Bean)",
      "category": "tubers",
      "subcategory": "Starch Roots",
      "localNames": {
        "gu": "શંકરકંદ (યામ બીન / પાણી કંદ)",
        "hi": "मिश्रीकंद / केसरू / याम बीन",
        "en": "Jicama / Yam Bean / Mexican Turnip"
      },
      "scientificName": "Pachyrhizus erosus",
      "marketTypes": [
        {
          "typeName": "Crisp Juicy Salad Turnip Type (સલાડ અને કાચું ખાવા યોગ્ય ક્રિસ્પી કંદ)",
          "varieties": [
            "Rajendra Mishrikand 1 (RM 1 - રાજેન્દ્ર કૃષિ યુનિવર્સિટી)",
            "Local Bihar Mishrikand"
          ],
          "marketUse": "Crisp raw refreshing salad slices with lime and chili, stir-fries, low calorie diabetic fruit-snack (rich in inulin prebiotic)",
          "grainType": "Turnip-shaped globose brown root, crisp translucent watery white flesh with sweet apple-turnip crunch (does not turn brown on cutting)"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_58_tiger_nut",
      "name": "Tiger Nut",
      "category": "tubers",
      "subcategory": "Starch Roots",
      "localNames": {
        "gu": "ચીબડી કંદ (ટાઇગર નટ / મોથ કંદ)",
        "hi": "कशेरू / टाइगर नट / चुफा",
        "en": "Tiger Nut / Chufa / Earth Almond"
      },
      "scientificName": "Cyperus esculentus var. sativus",
      "marketTypes": [
        {
          "typeName": "Edible Sweet Earth Almond (ખાદ્ય મીઠા કંદ - હોર્ચાટા ડ્રિંક અને સુપરફૂડ)",
          "varieties": [
            "Long Tuber Chufa",
            "Round Tuber Chufa"
          ],
          "marketUse": "Horchata de Chufa (non-dairy nut milk), gluten-free tiger nut flour, raw snacking, high fiber prebiotic resistant starch",
          "grainType": "Small wrinkled marble-sized underground tubers with dark striations, sweet nutty creamy taste"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_59_cotton_upland_sea_island",
      "name": "Cotton (Upland, Sea Island)",
      "category": "fiber_industrial",
      "subcategory": "Fibers",
      "localNames": {
        "gu": "કપાસ (રૂ / સફેદ સોનું)",
        "hi": "कपास (रुई)",
        "en": "Cotton (Upland & Sea Island)"
      },
      "scientificName": "Gossypium hirsutum / Gossypium barbadense",
      "marketTypes": [
        {
          "typeName": "Long Staple Transgenic Bt Hybrids (લાંબા તારવાળા બીટી કપાસ હાઇબ્રિડ - ૧૫૦ થી ૧૮૦ દિવસ)",
          "varieties": [
            "RCH 2 Bt (રાશિ ૨ - ઐતિહાસિક લોકપ્રિય)",
            "Bollgard II Hybrids",
            "Gujarat Cotton Hybrid 8 (G.Cot.Hy 8 - આણંદ/જૂનાગઢ)",
            "Ajit 155",
            "Kaveri Jadu",
            "ATM Bt",
            "Jai Bt"
          ],
          "marketUse": "Textile spinning mills, medium-to-fine yarn (30s to 50s count), garment manufacturing, raw cotton bales export to Bangladesh & Vietnam",
          "fiberType": "28 to 32 mm long staple, strong tensile strength (28-30 g/tex), micronaire 3.8-4.5, high ginning outturn (34-37%)"
        },
        {
          "typeName": "Extra-Long Staple (ELS) / Sea Island Type (અતિ લાંબા રેશમી તાર - સુવિન અને બારબાડેન્સ)",
          "varieties": [
            "Suvin (સુવિન - ભારતનો સર્વોચ્ચ ગુણવત્તાયુક્ત રેશમી કપાસ)",
            "DCH 32",
            "MCU 5",
            "Sujata"
          ],
          "marketUse": "Luxury high-count fabrics (80s to 120s count), superfine formal shirts, handkerchiefs, export premium competing with Egyptian Giza cotton",
          "fiberType": "Extra-long staple (36-40 mm), creamy white silk luster, exceptional fineness (micronaire 3.0-3.4)"
        },
        {
          "typeName": "Desi Rainfed Short Staple (દેશી કાલા કપાસ - ભાલ અને કાનમ વિશિષ્ટ)",
          "varieties": [
            "G.Cot 13 (કાનમ ટ્રેક્ટ)",
            "G.Cot 21",
            "Wagad (ભાલ કાલા કપાસ - વીઘે શૂન્ય પિયત)",
            "V 797",
            "Jayadhar"
          ],
          "marketUse": "Surgical sterile absorbent cotton, heavy canvas, denim blending, coarse organic khadi, traditional mattress stuffing",
          "fiberType": "Short coarse staple (18-22 mm), very high drought and salinity resilience, rainfed zero-irrigation ecology"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_60_jute",
      "name": "Jute",
      "category": "fiber_industrial",
      "subcategory": "Fibers",
      "localNames": {
        "gu": "શણ (પટસન / સોનેરી રેસા)",
        "hi": "जूट / पटसन",
        "en": "Jute (Golden Fiber)"
      },
      "scientificName": "Corchorus olitorius / Corchorus capsularis",
      "marketTypes": [
        {
          "typeName": "Tossa Jute - Golden Soft Fiber (ટોસા શણ - સોનેરી મજબૂત રેસા)",
          "varieties": [
            "JRO 524 (Navin - સૌથી લોકપ્રિય રાષ્ટ્રીય જાત)",
            "JRO 204",
            "JRO 8432",
            "Ira (JRO 2413)",
            "Tarun"
          ],
          "marketUse": "Gunny bags (બારદાન / અનાજના કોથળા), burlap sacks, geo-textiles for soil erosion, shopping bags, carpet backing yarn",
          "fiberType": "Lustrous golden-yellow to copper soft bast fibers, high tensile strength, 2.5-3.5 meter tall unbranched stalks"
        },
        {
          "typeName": "White Jute - Waterlogging Resistant (સફેદ શણ - નીચાણવાળી પાણી ભરાતી જમીન)",
          "varieties": [
            "JRC 321 (Sonali)",
            "JRC 212",
            "JRC 517",
            "Bidhan Jute 1"
          ],
          "marketUse": "Twines, ropes, coarse packaging fabric, paper pulp blending, flood-prone alluvial belts",
          "fiberType": "Silvery-white coarser fibers, lower strength than Tossa, but withstands standing water during monsoon"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_61_hemp",
      "name": "Hemp",
      "category": "fiber_industrial",
      "subcategory": "Fibers",
      "localNames": {
        "gu": "ઔદ્યોગિક ભાંગ (હેમ્પ રેસા)",
        "hi": "औद्योगिक भांग / हेम्प",
        "en": "Industrial Hemp"
      },
      "scientificName": "Cannabis sativa subsp. sativa",
      "marketTypes": [
        {
          "typeName": "Industrial Bast Fiber & Hurds (ઔદ્યોગિક કાપડ, દોરડાં અને હેમ્પક્રિટ - THC < 0.3%)",
          "varieties": [
            "Fedora 17 (પ્રમાણિત ઔદ્યોગિક જાત)",
            "Santhica 27",
            "USO 31",
            "Futura 75"
          ],
          "marketUse": "Eco-textiles (canvas, denim, durable workwear), bio-composites for automobile interior panels, hempcrete green insulation blocks, biodegradable plastics",
          "fiberType": "Extraordinarily strong bast fiber, natural anti-microbial and UV resistance, high biomass hurds"
        },
        {
          "typeName": "Dual-Purpose Seed & Biomass (હેમ્પ સીડ તેલ, પ્રોટીન અને ફાઇબર)",
          "varieties": [
            "Finola",
            "Carmagnola"
          ],
          "marketUse": "Hemp seed hearts, cold-pressed omega-rich edible oil, plant-based protein powders, livestock bedding",
          "fiberType": "Medium fiber length with high seed yield, rapid 90-100 day maturity"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_62_sisal",
      "name": "Sisal",
      "category": "fiber_industrial",
      "subcategory": "Fibers",
      "localNames": {
        "gu": "કેતકી (સીસલ / કુંવાર જેવા રેસા)",
        "hi": "सीसल / केतकी",
        "en": "Sisal Agave"
      },
      "scientificName": "Agave sisalana",
      "marketTypes": [
        {
          "typeName": "Commercial Hard Leaf Fiber (દરિયાઈ દોરડાં, ચટાઈ અને વાયર કોર)",
          "varieties": [
            "Hybrid 11648 (ICAR સિસલ રિસર્ચ સ્ટેશન)",
            "Agave sisalana Local",
            "Agave veracruz"
          ],
          "marketUse": "Marine ship mooring cables, elevator wire rope cores, agricultural baler twine, dartboards, floor carpets, bio-fencing borders",
          "fiberType": "Stiff creamy-white glossy leaf fibers (1 to 1.5 m length), extreme saltwater and stretch resistance"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_63_abaca_manila_hemp",
      "name": "Abaca (Manila Hemp)",
      "category": "fiber_industrial",
      "subcategory": "Fibers",
      "localNames": {
        "gu": "મનિલા હેમ્પ (એબાકા કેળા રેસા)",
        "hi": "अबाका / मनीला हेम्प",
        "en": "Abaca / Manila Hemp"
      },
      "scientificName": "Musa textilis",
      "marketTypes": [
        {
          "typeName": "High-Tensile Specialty Paper & Marine Grade (વિશ્વનો સૌથી મજબૂત કુદરતી કેળા રેસો)",
          "varieties": [
            "Tangongon",
            "Bongolanon",
            "Maguindanao"
          ],
          "marketUse": "Currency banknote paper (રૂપિયા/ડોલરની નોટો), tea filter bags, surgical masks, marine ship hawsers, automotive dashboard composites",
          "fiberType": "Highest mechanical tensile strength among plant fibers, lightweight, zero rotting in ocean saltwater"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_64_coir",
      "name": "Coir",
      "category": "fiber_industrial",
      "subcategory": "Fibers",
      "localNames": {
        "gu": "નાળિયેરના કાથા (કાથી / કોકોપીટ)",
        "hi": "नारियल रेशा / कॉयर / कोकोपीट",
        "en": "Coir / Coconut Fiber"
      },
      "scientificName": "Cocos nucifera (Mesocarp)",
      "marketTypes": [
        {
          "typeName": "White Fiber - Coastal Retting Grade (સફેદ કાથી - ખાડીના પાણીમાં સડાવીને કાઢેલ રેસા)",
          "varieties": [
            "Mahuva Coastal Grade (મહુવા-વેરાવળ દરિયાકાંઠો)",
            "Kerala Anjengo Retting Line"
          ],
          "marketUse": "Hand-spun fine coir yarn, luxury door mats (ચટાઈ), geo-textile soil erosion control blankets, marine cordage",
          "fiberType": "Flexible golden-white smooth fiber extracted from green husks after saltwater retting"
        },
        {
          "typeName": "Brown Fiber & Washed Cocopeat (બ્રાઉન કાથા અને ઓર્ગેનિક કોકોપીટ બ્લોક)",
          "varieties": [
            "Mechanical Decorticated Grade"
          ],
          "marketUse": "Coir spring mattresses, rubberized automobile seats, export coir pith blocks (Low EC < 0.5) for greenhouse horticulture seedling media",
          "fiberType": "Stiff dark-brown lignin-rich fibers (40-45% lignin), resilient to rot and fungal attack"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_65_kenaf",
      "name": "Kenaf",
      "category": "fiber_industrial",
      "subcategory": "Fibers",
      "localNames": {
        "gu": "અંબાડી (મેસ્તા / ખાટી ભાજીના છોડના રેસા)",
        "hi": "पटुआ / मेસ્તા / अम्बाडी",
        "en": "Kenaf / Mesta"
      },
      "scientificName": "Hibiscus cannabinus / Hibiscus sabdariffa",
      "marketTypes": [
        {
          "typeName": "Cannabinus Fast-Growing Bast Fiber (શણનો શ્રેષ્ઠ વિકલ્પ - કાગળ અને દોરડાં)",
          "varieties": [
            "AMC 108",
            "HC 583",
            "MT 150"
          ],
          "marketUse": "Jute blending in sack manufacturing, paper pulp, eco-composites, sour tender leaves cooked as vegetable curry (ખાટી ભાજી)",
          "fiberType": "Light cream bast fibers, 1.8-2.5 m tall stalks, fast 100-day maturity in rainfed semi-arid soils"
        },
        {
          "typeName": "Sabdariffa Drought-Hardy Roselle (લાલ અંબાડી - દુષ્કાળ પ્રતિરોધક)",
          "varieties": [
            "AMV 5",
            "HS 4288",
            "GR 27"
          ],
          "marketUse": "Arid zone coarse cordage, edible red tart calyces used for herbal hibiscus tea, jam and syrups",
          "fiberType": "Coarser fiber, excellent tolerance to poor sandy soils and root-knot nematodes"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_66_flax_fiber",
      "name": "Flax Fiber",
      "category": "fiber_industrial",
      "subcategory": "Fibers",
      "localNames": {
        "gu": "લિનેન ફાઇબર (અળસીના રેસા)",
        "hi": "अलसी रेशा / लिनेન",
        "en": "Flax Fiber / Linen"
      },
      "scientificName": "Linum usitatissimum",
      "marketTypes": [
        {
          "typeName": "Dual-Purpose Seed & Fine Linen Fiber (લિનેન કાપડ અને અળસી બીજ બંને)",
          "varieties": [
            "JRF 2 (CRIJAF પ્રમાણિત)",
            "Tiara",
            "Gaurav Fiber Selection",
            "Electra"
          ],
          "marketUse": "Premium breathable summer linen shirts, luxury home furnishings, artist oil painting canvas, banknote security papers",
          "fiberType": "Silky soft, high natural luster, absorbs up to 20% moisture without feeling damp, crisp cool hand-feel"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_67_sunn_hemp",
      "name": "Sunn Hemp",
      "category": "fiber_industrial",
      "subcategory": "Fibers",
      "localNames": {
        "gu": "સણ (લીલા ખાતર અને દોરડાંનો પાક)",
        "hi": "सनई / सण",
        "en": "Sunn Hemp"
      },
      "scientificName": "Crotalaria juncea",
      "marketTypes": [
        {
          "typeName": "High-Grade Cordage & Paper Bast (સણના મજબૂત રેસા - સિગારેટ પેપર અને દોરડાં)",
          "varieties": [
            "K 12 (Yellow)",
            "Swastik (PA 4)",
            "Ankur",
            "Shailesh"
          ],
          "marketUse": "Cigarette tissue paper, marine fishing twines, traditional charpoy bedding rope (ખાટલા ભરવાની મજબૂત કાથી), handicrafts",
          "fiberType": "Very strong bast fiber with high cellulose content, zero rotting in water, light grey-golden"
        },
        {
          "typeName": "Dual-Purpose Green Manure & Biomass (લીલો ખાતર - જમીન સુધારક)",
          "varieties": [
            "Local Gujarat Sann (દેશી સણ)",
            "CO 1"
          ],
          "marketUse": "Green manuring plowed in soil at 45 days (adds 80-100 kg atmospheric Nitrogen/ha), suppresses root-knot nematodes and builds humus",
          "fiberType": "Rapid vegetative biomass, succulent leafy stalks decomposing in 10-15 days"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_68_sugarcane",
      "name": "Sugarcane",
      "category": "fiber_industrial",
      "subcategory": "Industrial Latex & Resins",
      "localNames": {
        "gu": "શેરડી",
        "hi": "गन्ना",
        "en": "Sugarcane"
      },
      "scientificName": "Saccharum officinarum",
      "marketTypes": [
        {
          "typeName": "Early Maturing High-Sugar Commercial (વહેલી પાકતી સુગર ફેક્ટરી જાતો - ૧૦ થી ૧૧ મહિના)",
          "varieties": [
            "CoC 671 (દક્ષિણ ગુજરાતની સુવર્ણ શેરડી - ૧૨-૧૩% શર્કરા)",
            "Co 0238 (કરણ ૪ - ઉત્તર ભારત રેકોર્ડ ઉત્પાદક)",
            "Co 94012 (ફૂલે સાવિત્રી)",
            "Co 86032 (નયના - સાર્વત્રિક સફળ જાત)"
          ],
          "marketUse": "Commercial sugar mills (બારડોલી, ગણદેવી, મહુવા, કોડીનાર સુગર ફેક્ટરી), ethanol bio-refineries, fresh sweet sugarcane juice",
          "fiberType": "Medium thick stalks, yellowish-green to purple rind, soft rind with high juicy sucrose (Brix 20-22%), high tillering"
        },
        {
          "typeName": "Mid-Late Heavy Cane Ratoon Specialist (મધ્યમ-મોડી જાતો - ઉત્કૃષ્ટ કૂંચી/રાયતણ અને દેશી ગોળ)",
          "varieties": [
            "CoM 0265 (ફૂલે ૨૬૫ - રાક્ષસી વજન ૧૫૦ ટન/હેક્ટર)",
            "Gujarat Sugarcane 5 (GS 5 - નવસારી કૃષિ યુનિવર્સિટી)",
            "Co 99004",
            "MS 10001"
          ],
          "marketUse": "Authentic organic chemical-free jaggery (દેશી ગોળ / રાબડા), multi-cut ratoon management (કૂંચી પાક), bagasse power co-generation",
          "fiberType": "Extra-thick solid heavy canes, non-lodging erect habit, high red rot resistance, heavy biomass"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_69_sugar_beet",
      "name": "Sugar Beet",
      "category": "fiber_industrial",
      "subcategory": "Industrial Latex & Resins",
      "localNames": {
        "gu": "સુગર બીટ (ખાંડનું બીટ)",
        "hi": "चुकंदर / शुगर बीट",
        "en": "Sugar Beet"
      },
      "scientificName": "Beta vulgaris subsp. vulgaris var. altissima",
      "marketTypes": [
        {
          "typeName": "Tropical High Sucrose Hybrids (ઉષ્ણકટિબંધીય શિયાળુ સુગર બીટ - ૫ થી ૬ મહિના)",
          "varieties": [
            "Shubhra (શુભ્રા - ભારત અનુકૂળ)",
            "Indus",
            "Cauvery",
            "Magnolia",
            "SV 894"
          ],
          "marketUse": "Sugar production in saline and water-scarce coastal soils (uses 60% less water than sugarcane), ethanol distillery, beet pulp cattle feed",
          "fiberType": "Large conical silvery-white fleshy taproot (1.2-2.0 kg), 16-18% sucrose content, high salt tolerance"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_70_para_rubber_natural_rubber",
      "name": "Para Rubber (Natural Rubber)",
      "category": "fiber_industrial",
      "subcategory": "Industrial Latex & Resins",
      "localNames": {
        "gu": "કુદરતી રબરનું વૃક્ષ",
        "hi": "प्राकृतिक रबर",
        "en": "Para Rubber (Natural Rubber)"
      },
      "scientificName": "Hevea brasiliensis",
      "marketTypes": [
        {
          "typeName": "High-Yielding Latex Clones (ઊંચું દૂધ આપતા રબર ક્લોન - ૭ વર્ષે ટેપિંગ શરૂ)",
          "varieties": [
            "RRII 105 (ભારતનો સૌથી સફળ રાષ્ટ્રીય ક્લોન)",
            "RRII 414",
            "RRII 430",
            "PB 260",
            "GT 1"
          ],
          "marketUse": "Automotive radial tires, aircraft landing tires, surgical gloves, conveyor belts, Ribbed Smoked Sheets (RSS 4), latex foam mattresses",
          "fiberType": "Dry Rubber Content (DRC 35-40%), extreme elasticity and high tensile rebound resilience, 25-30 year productive tapping life"
        }
      ],
      "status": "card_ready"
    },
    {
      "id": "crop_71_tobacco",
      "name": "Tobacco",
      "category": "fiber_industrial",
      "subcategory": "Industrial Latex & Resins",
      "localNames": {
        "gu": "તમાકુ (બીડી તમાકુ અને કલકત્તી)",
        "hi": "तंबाकू",
        "en": "Tobacco"
      },
      "scientificName": "Nicotiana tabacum / Nicotiana rustica",
      "marketTypes": [
        {
          "typeName": "Gujarat Bidi Tobacco (ગુજરાત બીડી તમાકુ - ચરોતરનો ગોલ્ડન પાક)",
          "varieties": [
            "Anand 119 (A 119 - આણંદ કૃષિ યુનિવર્સિટી મુખ્ય ભલામણ)",
            "Gujarat Tobacco 4 (GT 4)",
            "GT 5",
            "GT 7 (મોલો પ્રતિરોધક)",
            "GT 9",
            "GABT 11"
          ],
          "marketUse": "Bidi rolling flake tobacco, chewing blends, nicotine sulfate botanical insecticide manufacture, Charotar mandi auction trade",
          "fiberType": "Thick puckered leaves developing prominent golden-yellow spangles upon maturity, 6-8% nicotine, strong pungent aroma"
        },
        {
          "typeName": "Rustica / Calcuttia Hookah & Snuff (કલકત્તી તમાકુ - હુક્કો અને છીંકણી)",
          "varieties": [
            "Gujarat Calcuttia 1 (GC 1)",
            "Dharmaj Selection",
            "Motihari Local"
          ],
          "marketUse": "Traditional hookah paste, nasal snuff (છીંકણી), high nicotine extraction",
          "fiberType": "Dark green thick leathery ovate leaves, extra-high nicotine content (8-10%), dwarf stocky plants"
        },
        {
          "typeName": "Virginia Flue-Cured (VFC Export Tobacco - સિગરેટ તમાકુ)",
          "varieties": [
            "Kanchan",
            "Siri",
            "Hema",
            "Bhavya"
          ],
          "marketUse": "Cigarette blends, barn flue-curing, international export auctions",
          "fiberType": "Large thin lemon-yellow to bright orange cured leaves, mild nicotine, high pleasant aroma"
        }
      ],
      "status": "card_ready"
    },
  {
    "id": "crop_72_tea",
    "name": "Tea",
    "category": "plantation",
    "subcategory": "Plantation Crops",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_73_coffee_arabica_robusta",
    "name": "Coffee (Arabica, Robusta)",
    "category": "plantation",
    "subcategory": "Plantation Crops",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_74_cocoa_cacao",
    "name": "Cocoa (Cacao)",
    "category": "plantation",
    "subcategory": "Plantation Crops",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_75_areca_nut_betel_nut",
    "name": "Areca Nut (Betel Nut)",
    "category": "plantation",
    "subcategory": "Plantation Crops",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_76_betel_leaf",
    "name": "Betel Leaf",
    "category": "plantation",
    "subcategory": "Plantation Crops",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_77_hops_for_brewing",
    "name": "Hops (for brewing)",
    "category": "plantation",
    "subcategory": "Plantation Crops",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_78_yerba_mate",
    "name": "Yerba Mate",
    "category": "plantation",
    "subcategory": "Plantation Crops",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_79_kola_nut",
    "name": "Kola Nut",
    "category": "plantation",
    "subcategory": "Plantation Crops",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_80_opium_poppy",
    "name": "Opium Poppy",
    "category": "plantation",
    "subcategory": "Plantation Crops",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_81_cumin",
    "name": "Cumin",
    "category": "spices_herbs",
    "subcategory": "Seed Spices",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_82_coriander",
    "name": "Coriander",
    "category": "spices_herbs",
    "subcategory": "Seed Spices",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_83_fennel",
    "name": "Fennel",
    "category": "spices_herbs",
    "subcategory": "Seed Spices",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_84_fenugreek",
    "name": "Fenugreek",
    "category": "spices_herbs",
    "subcategory": "Seed Spices",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_85_aniseed",
    "name": "Aniseed",
    "category": "spices_herbs",
    "subcategory": "Seed Spices",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_86_caraway",
    "name": "Caraway",
    "category": "spices_herbs",
    "subcategory": "Seed Spices",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_87_dill",
    "name": "Dill",
    "category": "spices_herbs",
    "subcategory": "Seed Spices",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_88_celery_seed",
    "name": "Celery Seed",
    "category": "spices_herbs",
    "subcategory": "Seed Spices",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_89_mustard_seed",
    "name": "Mustard Seed",
    "category": "spices_herbs",
    "subcategory": "Seed Spices",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_90_turmeric",
    "name": "Turmeric",
    "category": "spices_herbs",
    "subcategory": "Rhizomes & Roots",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_91_ginger",
    "name": "Ginger",
    "category": "spices_herbs",
    "subcategory": "Rhizomes & Roots",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_92_garlic",
    "name": "Garlic",
    "category": "spices_herbs",
    "subcategory": "Rhizomes & Roots",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_93_horseradish",
    "name": "Horseradish",
    "category": "spices_herbs",
    "subcategory": "Rhizomes & Roots",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_94_black_white_pepper",
    "name": "Black/White Pepper",
    "category": "spices_herbs",
    "subcategory": "Tree & Vine Spices",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_95_cardamom_small_large",
    "name": "Cardamom (Small & Large)",
    "category": "spices_herbs",
    "subcategory": "Tree & Vine Spices",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_96_cinnamon",
    "name": "Cinnamon",
    "category": "spices_herbs",
    "subcategory": "Tree & Vine Spices",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_97_clove",
    "name": "Clove",
    "category": "spices_herbs",
    "subcategory": "Tree & Vine Spices",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_98_nutmeg_mace",
    "name": "Nutmeg & Mace",
    "category": "spices_herbs",
    "subcategory": "Tree & Vine Spices",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_99_allspice",
    "name": "Allspice",
    "category": "spices_herbs",
    "subcategory": "Tree & Vine Spices",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_100_vanilla",
    "name": "Vanilla",
    "category": "spices_herbs",
    "subcategory": "Tree & Vine Spices",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_101_mint_peppermint_spearmint",
    "name": "Mint (Peppermint/Spearmint)",
    "category": "spices_herbs",
    "subcategory": "Herbs",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_102_basil",
    "name": "Basil",
    "category": "spices_herbs",
    "subcategory": "Herbs",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_103_oregano",
    "name": "Oregano",
    "category": "spices_herbs",
    "subcategory": "Herbs",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_104_thyme",
    "name": "Thyme",
    "category": "spices_herbs",
    "subcategory": "Herbs",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_105_rosemary",
    "name": "Rosemary",
    "category": "spices_herbs",
    "subcategory": "Herbs",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_106_sage",
    "name": "Sage",
    "category": "spices_herbs",
    "subcategory": "Herbs",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_107_parsley",
    "name": "Parsley",
    "category": "spices_herbs",
    "subcategory": "Herbs",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_108_lemongrass",
    "name": "Lemongrass",
    "category": "spices_herbs",
    "subcategory": "Herbs",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_109_citronella",
    "name": "Citronella",
    "category": "spices_herbs",
    "subcategory": "Herbs",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_110_palmarosa",
    "name": "Palmarosa",
    "category": "spices_herbs",
    "subcategory": "Herbs",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_111_tomato",
    "name": "Tomato",
    "category": "vegetables",
    "subcategory": "Solanaceous",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_112_eggplant_brinjal",
    "name": "Eggplant (Brinjal)",
    "category": "vegetables",
    "subcategory": "Solanaceous",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_113_chili_pepper_bell_pepper_cayenne",
    "name": "Chili Pepper (Bell pepper, Cayenne)",
    "category": "vegetables",
    "subcategory": "Solanaceous",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_114_cabbage",
    "name": "Cabbage",
    "category": "vegetables",
    "subcategory": "Cruciferous (Cole)",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_115_cauliflower",
    "name": "Cauliflower",
    "category": "vegetables",
    "subcategory": "Cruciferous (Cole)",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_116_broccoli",
    "name": "Broccoli",
    "category": "vegetables",
    "subcategory": "Cruciferous (Cole)",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_117_brussels_sprouts",
    "name": "Brussels Sprouts",
    "category": "vegetables",
    "subcategory": "Cruciferous (Cole)",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_118_kale",
    "name": "Kale",
    "category": "vegetables",
    "subcategory": "Cruciferous (Cole)",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_119_kohlrabi",
    "name": "Kohlrabi",
    "category": "vegetables",
    "subcategory": "Cruciferous (Cole)",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_120_cucumber",
    "name": "Cucumber",
    "category": "vegetables",
    "subcategory": "Cucurbits (Gourds)",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_121_pumpkin",
    "name": "Pumpkin",
    "category": "vegetables",
    "subcategory": "Cucurbits (Gourds)",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_122_bottle_gourd",
    "name": "Bottle Gourd",
    "category": "vegetables",
    "subcategory": "Cucurbits (Gourds)",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_123_bitter_gourd",
    "name": "Bitter Gourd",
    "category": "vegetables",
    "subcategory": "Cucurbits (Gourds)",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_124_ridge_gourd",
    "name": "Ridge Gourd",
    "category": "vegetables",
    "subcategory": "Cucurbits (Gourds)",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_125_snake_gourd",
    "name": "Snake Gourd",
    "category": "vegetables",
    "subcategory": "Cucurbits (Gourds)",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_126_sponge_gourd",
    "name": "Sponge Gourd",
    "category": "vegetables",
    "subcategory": "Cucurbits (Gourds)",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_127_ash_gourd",
    "name": "Ash Gourd",
    "category": "vegetables",
    "subcategory": "Cucurbits (Gourds)",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_128_squash_zucchini",
    "name": "Squash/Zucchini",
    "category": "vegetables",
    "subcategory": "Cucurbits (Gourds)",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_129_chayote",
    "name": "Chayote",
    "category": "vegetables",
    "subcategory": "Cucurbits (Gourds)",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_130_spinach",
    "name": "Spinach",
    "category": "vegetables",
    "subcategory": "Leafy Greens",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_131_lettuce",
    "name": "Lettuce",
    "category": "vegetables",
    "subcategory": "Leafy Greens",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_132_amaranth_leaves",
    "name": "Amaranth Leaves",
    "category": "vegetables",
    "subcategory": "Leafy Greens",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_133_fenugreek_leaves",
    "name": "Fenugreek Leaves",
    "category": "vegetables",
    "subcategory": "Leafy Greens",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_134_bok_choy",
    "name": "Bok Choy",
    "category": "vegetables",
    "subcategory": "Leafy Greens",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_135_swiss_chard",
    "name": "Swiss Chard",
    "category": "vegetables",
    "subcategory": "Leafy Greens",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_136_watercress",
    "name": "Watercress",
    "category": "vegetables",
    "subcategory": "Leafy Greens",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_137_celery",
    "name": "Celery",
    "category": "vegetables",
    "subcategory": "Leafy Greens",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_138_onion",
    "name": "Onion",
    "category": "vegetables",
    "subcategory": "Allium / Bulbs",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_139_shallots",
    "name": "Shallots",
    "category": "vegetables",
    "subcategory": "Allium / Bulbs",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_140_leek",
    "name": "Leek",
    "category": "vegetables",
    "subcategory": "Allium / Bulbs",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_141_scallion_green_onion",
    "name": "Scallion (Green Onion)",
    "category": "vegetables",
    "subcategory": "Allium / Bulbs",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_142_carrot",
    "name": "Carrot",
    "category": "vegetables",
    "subcategory": "Root Vegetables",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_143_radish",
    "name": "Radish",
    "category": "vegetables",
    "subcategory": "Root Vegetables",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_144_turnip",
    "name": "Turnip",
    "category": "vegetables",
    "subcategory": "Root Vegetables",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_145_beetroot",
    "name": "Beetroot",
    "category": "vegetables",
    "subcategory": "Root Vegetables",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_146_parsnip",
    "name": "Parsnip",
    "category": "vegetables",
    "subcategory": "Root Vegetables",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_147_rutabaga",
    "name": "Rutabaga",
    "category": "vegetables",
    "subcategory": "Root Vegetables",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_148_okra_lady_s_finger",
    "name": "Okra (Lady's Finger)",
    "category": "vegetables",
    "subcategory": "Other Vegetables",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_149_asparagus",
    "name": "Asparagus",
    "category": "vegetables",
    "subcategory": "Other Vegetables",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_150_globe_artichoke",
    "name": "Globe Artichoke",
    "category": "vegetables",
    "subcategory": "Other Vegetables",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_151_sweet_corn",
    "name": "Sweet Corn",
    "category": "vegetables",
    "subcategory": "Other Vegetables",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_152_drumstick_moringa",
    "name": "Drumstick (Moringa)",
    "category": "vegetables",
    "subcategory": "Other Vegetables",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_153_apple",
    "name": "Apple",
    "category": "fruits_nuts",
    "subcategory": "Pome & Stone Fruits",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_154_pear",
    "name": "Pear",
    "category": "fruits_nuts",
    "subcategory": "Pome & Stone Fruits",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_155_peach",
    "name": "Peach",
    "category": "fruits_nuts",
    "subcategory": "Pome & Stone Fruits",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_156_plum",
    "name": "Plum",
    "category": "fruits_nuts",
    "subcategory": "Pome & Stone Fruits",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_157_apricot",
    "name": "Apricot",
    "category": "fruits_nuts",
    "subcategory": "Pome & Stone Fruits",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_158_cherry",
    "name": "Cherry",
    "category": "fruits_nuts",
    "subcategory": "Pome & Stone Fruits",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_159_nectarine",
    "name": "Nectarine",
    "category": "fruits_nuts",
    "subcategory": "Pome & Stone Fruits",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_160_quince",
    "name": "Quince",
    "category": "fruits_nuts",
    "subcategory": "Pome & Stone Fruits",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_161_orange",
    "name": "Orange",
    "category": "fruits_nuts",
    "subcategory": "Citrus",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_162_lemon",
    "name": "Lemon",
    "category": "fruits_nuts",
    "subcategory": "Citrus",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_163_lime",
    "name": "Lime",
    "category": "fruits_nuts",
    "subcategory": "Citrus",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_164_grapefruit",
    "name": "Grapefruit",
    "category": "fruits_nuts",
    "subcategory": "Citrus",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_165_mandarins_tangerines",
    "name": "Mandarins/Tangerines",
    "category": "fruits_nuts",
    "subcategory": "Citrus",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_166_pomelo",
    "name": "Pomelo",
    "category": "fruits_nuts",
    "subcategory": "Citrus",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_167_citron",
    "name": "Citron",
    "category": "fruits_nuts",
    "subcategory": "Citrus",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_168_mango",
    "name": "Mango",
    "category": "fruits_nuts",
    "subcategory": "Tropical & Exotic",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_169_banana",
    "name": "Banana",
    "category": "fruits_nuts",
    "subcategory": "Tropical & Exotic",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_170_plantain",
    "name": "Plantain",
    "category": "fruits_nuts",
    "subcategory": "Tropical & Exotic",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_171_pineapple",
    "name": "Pineapple",
    "category": "fruits_nuts",
    "subcategory": "Tropical & Exotic",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_172_papaya",
    "name": "Papaya",
    "category": "fruits_nuts",
    "subcategory": "Tropical & Exotic",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_173_guava",
    "name": "Guava",
    "category": "fruits_nuts",
    "subcategory": "Tropical & Exotic",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_174_pomegranate",
    "name": "Pomegranate",
    "category": "fruits_nuts",
    "subcategory": "Tropical & Exotic",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_175_lychee",
    "name": "Lychee",
    "category": "fruits_nuts",
    "subcategory": "Tropical & Exotic",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_176_avocado",
    "name": "Avocado",
    "category": "fruits_nuts",
    "subcategory": "Tropical & Exotic",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_177_kiwi",
    "name": "Kiwi",
    "category": "fruits_nuts",
    "subcategory": "Tropical & Exotic",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_178_dragon_fruit",
    "name": "Dragon Fruit",
    "category": "fruits_nuts",
    "subcategory": "Tropical & Exotic",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_179_passion_fruit",
    "name": "Passion Fruit",
    "category": "fruits_nuts",
    "subcategory": "Tropical & Exotic",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_180_mangosteen",
    "name": "Mangosteen",
    "category": "fruits_nuts",
    "subcategory": "Tropical & Exotic",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_181_rambutan",
    "name": "Rambutan",
    "category": "fruits_nuts",
    "subcategory": "Tropical & Exotic",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_182_durian",
    "name": "Durian",
    "category": "fruits_nuts",
    "subcategory": "Tropical & Exotic",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_183_jackfruit",
    "name": "Jackfruit",
    "category": "fruits_nuts",
    "subcategory": "Tropical & Exotic",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_184_breadfruit",
    "name": "Breadfruit",
    "category": "fruits_nuts",
    "subcategory": "Tropical & Exotic",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_185_fig",
    "name": "Fig",
    "category": "fruits_nuts",
    "subcategory": "Tropical & Exotic",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_186_date_palm",
    "name": "Date Palm",
    "category": "fruits_nuts",
    "subcategory": "Tropical & Exotic",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_187_persimmon",
    "name": "Persimmon",
    "category": "fruits_nuts",
    "subcategory": "Tropical & Exotic",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_188_grapes_wine_table",
    "name": "Grapes (Wine & Table)",
    "category": "fruits_nuts",
    "subcategory": "Berries & Vine Fruits",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_189_strawberry",
    "name": "Strawberry",
    "category": "fruits_nuts",
    "subcategory": "Berries & Vine Fruits",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_190_blueberry",
    "name": "Blueberry",
    "category": "fruits_nuts",
    "subcategory": "Berries & Vine Fruits",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_191_raspberry",
    "name": "Raspberry",
    "category": "fruits_nuts",
    "subcategory": "Berries & Vine Fruits",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_192_blackberry",
    "name": "Blackberry",
    "category": "fruits_nuts",
    "subcategory": "Berries & Vine Fruits",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_193_cranberry",
    "name": "Cranberry",
    "category": "fruits_nuts",
    "subcategory": "Berries & Vine Fruits",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_194_gooseberry",
    "name": "Gooseberry",
    "category": "fruits_nuts",
    "subcategory": "Berries & Vine Fruits",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_195_currant",
    "name": "Currant",
    "category": "fruits_nuts",
    "subcategory": "Berries & Vine Fruits",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_196_watermelon",
    "name": "Watermelon",
    "category": "fruits_nuts",
    "subcategory": "Berries & Vine Fruits",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_197_muskmelon_cantaloupe",
    "name": "Muskmelon (Cantaloupe)",
    "category": "fruits_nuts",
    "subcategory": "Berries & Vine Fruits",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_198_almond",
    "name": "Almond",
    "category": "fruits_nuts",
    "subcategory": "Tree Nuts",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_199_walnut",
    "name": "Walnut",
    "category": "fruits_nuts",
    "subcategory": "Tree Nuts",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_200_cashew",
    "name": "Cashew",
    "category": "fruits_nuts",
    "subcategory": "Tree Nuts",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_201_pistachio",
    "name": "Pistachio",
    "category": "fruits_nuts",
    "subcategory": "Tree Nuts",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_202_hazelnut",
    "name": "Hazelnut",
    "category": "fruits_nuts",
    "subcategory": "Tree Nuts",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_203_chestnut",
    "name": "Chestnut",
    "category": "fruits_nuts",
    "subcategory": "Tree Nuts",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_204_pecan",
    "name": "Pecan",
    "category": "fruits_nuts",
    "subcategory": "Tree Nuts",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_205_macadamia",
    "name": "Macadamia",
    "category": "fruits_nuts",
    "subcategory": "Tree Nuts",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_206_brazil_nut",
    "name": "Brazil Nut",
    "category": "fruits_nuts",
    "subcategory": "Tree Nuts",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_207_alfalfa_lucerne",
    "name": "Alfalfa (Lucerne)",
    "category": "fodder",
    "subcategory": "Livestock Forage & Feed",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_208_berseem_egyptian_clover",
    "name": "Berseem (Egyptian Clover)",
    "category": "fodder",
    "subcategory": "Livestock Forage & Feed",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_209_napier_grass_elephant_grass",
    "name": "Napier Grass (Elephant Grass)",
    "category": "fodder",
    "subcategory": "Livestock Forage & Feed",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_210_sorghum_fodder",
    "name": "Sorghum Fodder",
    "category": "fodder",
    "subcategory": "Livestock Forage & Feed",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_211_maize_fodder",
    "name": "Maize Fodder",
    "category": "fodder",
    "subcategory": "Livestock Forage & Feed",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_212_sudan_grass",
    "name": "Sudan Grass",
    "category": "fodder",
    "subcategory": "Livestock Forage & Feed",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_213_oats_fodder",
    "name": "Oats Fodder",
    "category": "fodder",
    "subcategory": "Livestock Forage & Feed",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_214_timothy_grass",
    "name": "Timothy Grass",
    "category": "fodder",
    "subcategory": "Livestock Forage & Feed",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_215_clover_red_white",
    "name": "Clover (Red, White)",
    "category": "fodder",
    "subcategory": "Livestock Forage & Feed",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_216_ryegrass",
    "name": "Ryegrass",
    "category": "fodder",
    "subcategory": "Livestock Forage & Feed",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_217_fescue",
    "name": "Fescue",
    "category": "fodder",
    "subcategory": "Livestock Forage & Feed",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_218_guinea_grass",
    "name": "Guinea Grass",
    "category": "fodder",
    "subcategory": "Livestock Forage & Feed",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_219_stylo",
    "name": "Stylo",
    "category": "fodder",
    "subcategory": "Livestock Forage & Feed",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_220_rose",
    "name": "Rose",
    "category": "floriculture",
    "subcategory": "Commercial Flowers",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_221_marigold",
    "name": "Marigold",
    "category": "floriculture",
    "subcategory": "Commercial Flowers",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_222_jasmine",
    "name": "Jasmine",
    "category": "floriculture",
    "subcategory": "Commercial Flowers",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_223_chrysanthemum",
    "name": "Chrysanthemum",
    "category": "floriculture",
    "subcategory": "Commercial Flowers",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_224_orchid_dendrobium",
    "name": "Orchid (Dendrobium)",
    "category": "floriculture",
    "subcategory": "Commercial Flowers",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_225_carnation",
    "name": "Carnation",
    "category": "floriculture",
    "subcategory": "Commercial Flowers",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_226_gerbera",
    "name": "Gerbera",
    "category": "floriculture",
    "subcategory": "Commercial Flowers",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_227_anthurium",
    "name": "Anthurium",
    "category": "floriculture",
    "subcategory": "Commercial Flowers",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_228_gladiolus",
    "name": "Gladiolus",
    "category": "floriculture",
    "subcategory": "Commercial Flowers",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_229_tuberose",
    "name": "Tuberose",
    "category": "floriculture",
    "subcategory": "Commercial Flowers",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_230_lavender",
    "name": "Lavender",
    "category": "floriculture",
    "subcategory": "Commercial Flowers",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_231_tulip",
    "name": "Tulip",
    "category": "floriculture",
    "subcategory": "Commercial Flowers",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_232_lily",
    "name": "Lily",
    "category": "floriculture",
    "subcategory": "Commercial Flowers",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_233_aloe_vera",
    "name": "Aloe Vera",
    "category": "medicinal_biofuel",
    "subcategory": "Medicinal & Biofuel",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_234_ashwagandha_indian_ginseng",
    "name": "Ashwagandha (Indian Ginseng)",
    "category": "medicinal_biofuel",
    "subcategory": "Medicinal & Biofuel",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_235_sarpagandha",
    "name": "Sarpagandha",
    "category": "medicinal_biofuel",
    "subcategory": "Medicinal & Biofuel",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_236_artemisia_sweet_wormwood",
    "name": "Artemisia (Sweet Wormwood)",
    "category": "medicinal_biofuel",
    "subcategory": "Medicinal & Biofuel",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_237_isabgol_psyllium_husk",
    "name": "Isabgol (Psyllium Husk)",
    "category": "medicinal_biofuel",
    "subcategory": "Medicinal & Biofuel",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_238_neem",
    "name": "Neem",
    "category": "medicinal_biofuel",
    "subcategory": "Medicinal & Biofuel",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_239_jatropha_biofuel",
    "name": "Jatropha (Biofuel)",
    "category": "medicinal_biofuel",
    "subcategory": "Medicinal & Biofuel",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_240_pongamia_karanja",
    "name": "Pongamia (Karanja)",
    "category": "medicinal_biofuel",
    "subcategory": "Medicinal & Biofuel",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  },
  {
    "id": "crop_241_stevia_natural_sweetener",
    "name": "Stevia (Natural Sweetener)",
    "category": "medicinal_biofuel",
    "subcategory": "Medicinal & Biofuel",
    "localNames": null,
    "scientificName": null,
    "marketTypes": null,
    "status": "card_ready"
  }
];

const STORAGE_KEY = 'khet_kharcha_user_crop_library_v7';

export const getLibraryCrops = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Prefer user's customized marketTypes and saved practices
        return MASTER_CROPS.map(mc => {
          const userCrop = parsed.find(p => p.id === mc.id || p.name === mc.name);
          if (!userCrop) return mc;
          return {
            ...mc,
            ...userCrop,
            marketTypes: (userCrop.marketTypes && userCrop.marketTypes.length > 0)
              ? userCrop.marketTypes
              : mc.marketTypes
          };
        });
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MASTER_CROPS));
    return MASTER_CROPS;
  } catch (e) {
    console.error('Error loading library crops:', e);
    return MASTER_CROPS;
  }
};

export const saveLibraryCrops = (crops) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(crops));
  } catch (e) {
    console.error('Error saving library crops:', e);
  }
};

export const CROP_LIBRARY = MASTER_CROPS;
