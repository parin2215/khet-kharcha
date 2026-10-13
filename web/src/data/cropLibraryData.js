/**
 * Khet Kharcha - Crop Knowledge Library Data
 * Compiled from ICAR, State Agricultural Universities (PAU, TNAU, AAU), and AICRP packages of practices.
 */

export const CROP_CATEGORIES = [
  { id: 'all', label: 'All Crops' },
  { id: 'cash_crop', label: 'Cash Crops' },
  { id: 'cereals', label: 'Grains & Cereals' },
  { id: 'oilseeds', label: 'Oilseeds' },
  { id: 'pulses', label: 'Pulses / Dal' },
  { id: 'spices', label: 'Spices' },
  { id: 'vegetables', label: 'Vegetables' },
];

export const CROP_LIBRARY = [
  {
    id: 'cotton',
    name: 'Cotton',
    localName: 'कपास / કપાસ',
    scientificName: 'Gossypium hirsutum',
    category: 'cash_crop',
    season: 'kharif',
    durationDays: '150 - 180 Days',
    bestPracticingMonths: {
      sowing: 'May (North Zone Irrigated) to June - Mid July (Central/South Rainfed)',
      flowering: 'August - October',
      harvesting: 'October - January (3-4 Pickings)'
    },
    soilRequirement: {
      soilType: 'Deep Black Cotton Soil (Regur/Vertisols) or well-drained fertile clay-loam',
      phRange: '6.5 - 8.0 pH',
      condition: 'Rich in potassium and calcium, excellent water retention without surface stagnation. Avoid waterlogged or shallow sandy soils.'
    },
    environmentalRequirements: {
      temperature: '21°C - 32°C (Minimum 16°C for germination, >26°C for boll maturation)',
      rainfall: '600 - 900 mm well-distributed, or 5-7 scheduled irrigations',
      sunlight: 'Minimum 6-8 hours daily direct bright sunshine; high vulnerability to prolonged cloudy humidity'
    },
    seedRateAndSpacing: {
      seedRate: '1.5 - 2.0 kg/acre (Bt Hybrids)',
      spacing: 'Row-to-row: 90 - 120 cm × Plant-to-plant: 45 - 60 cm',
      seedTreatment: 'Seed dressing with Trichoderma viride @ 5g/kg + Imidacloprid 70WS @ 5g/kg against early sucking pests'
    },
    nutrientManagement: {
      basal: '5-8 tons FYM + 50 kg DAP + 25 kg MOP + 10 kg Zinc Sulphate per acre during land preparation',
      topDressing: 'Urea 35 kg at 30-35 DAS (Squaring) + Urea 35 kg + MOP 20 kg at 60-70 DAS (Peak Flowering)',
      foliarSprays: '13-0-45 (Potassium Nitrate) 1% + 0.1% Boron spray at 75 & 90 DAS to prevent boll drop'
    },
    economics: {
      expectedYield: '12 - 16 Quintals / acre (under good management)',
      mandiRateRange: '₹6,800 - ₹7,800 / Quintal',
      costOfCultivation: '₹28,000 - ₹35,000 / acre'
    },
    timelineSteps: [
      {
        phase: 'Pre-Sowing & Field Preparation',
        timeline: '15 to 20 Days Before Sowing',
        tasks: [
          'Deep summer ploughing (MB plough) to destroy pupae of pink bollworm and weed rootstocks.',
          'Two cross harrowings followed by planking to create a fine, weed-free pulverized seedbed.',
          'Incorporate 6-8 tonnes of decomposed farmyard manure (FYM) per acre.',
          'Form ridges and furrows (90-120 cm apart) for improved root aeration and drainage.'
        ],
        precautions: 'Do not sow on dry or cloddy soils. Ensure adequate sub-surface soil moisture.'
      },
      {
        phase: 'Sowing & Germination',
        timeline: 'Day 0 to 7',
        tasks: [
          'Treat seeds with biological biofungicide Trichoderma viride to prevent damping-off.',
          'Dibble seeds on the sides of ridges at 3-4 cm depth at recommended spacing.',
          'Plant non-Bt refuge seeds around the border (minimum 5 border rows or 20% area) for resistance management.'
        ],
        precautions: 'Avoid deep sowing (>5 cm) as it leads to poor seedling emergence.'
      },
      {
        phase: 'Early Vegetative & Gap Filling',
        timeline: 'Day 8 to 30',
        tasks: [
          'Gap filling at 8-10 DAS using pre-sprouted seeds or polythene nursery seedlings.',
          'Thinning at 15-18 DAS to retain only one healthy, vigorous seedling per hill.',
          'First shallow weeding and intercultural hoeing at 20-25 DAS to control early weed flush.',
          'Install Yellow Sticky Traps (10-12 traps/acre) to monitor whiteflies and thrips.'
        ],
        precautions: 'Do not allow standing water during seedling stage to prevent collar rot.'
      },
      {
        phase: 'Square Formation & Branching',
        timeline: 'Day 31 to 60',
        tasks: [
          'First top dressing: Apply 35 kg Urea per acre at square initiation (30-35 DAS).',
          'Earthing-up operation after fertilizer application to support plants and create irrigation furrows.',
          'Install Pheromone Traps (5-8 traps/acre) to monitor Pink Bollworm and Spodoptera moths.',
          'Spray 5% Neem Seed Kernel Extract (NSKE) or Neem oil 1500 ppm at 45 DAS as preventive deterrent.'
        ],
        precautions: 'Keep watch on leaf curl virus vectors (whiteflies); spray Diafenthiuron or Acetamiprid if ETL crosses 6-8 nymphs/leaf.'
      },
      {
        phase: 'Peak Flowering & Boll Development',
        timeline: 'Day 61 to 110',
        tasks: [
          'Second top dressing: Apply 35 kg Urea + 20 kg MOP per acre at peak flowering (65-70 DAS).',
          'Maintain regular irrigation at 10-14 days interval; avoid water stress during boll expansion.',
          'Foliar spray of 1% 13-0-45 (Potassium Nitrate) + 0.1% Boron at 75 & 90 DAS to maximize boll size and reduce flower shedding.',
          'Spray Emamectin Benzoate 5% SG @ 80g/acre or Chlorantraniliprole 18.5% SC @ 60ml/acre if bollworm infestation exceeds ETL.'
        ],
        precautions: 'Critical stage: Any water deficit or nitrogen imbalance at this stage causes square drop and lower yield.'
      },
      {
        phase: 'Boll Bursting & Harvesting',
        timeline: 'Day 111 to 160+',
        tasks: [
          'Withhold irrigation 10-14 days prior to first picking to facilitate uniform boll bursting.',
          'Pick clean, dry seed cotton in the morning hours after dew evaporates.',
          'Store in clean, dry bags separated by picking grades (Grade 1 vs Grade 2).',
          'Sun-dry the picked cotton for 2-3 days until seed moisture drops below 8% before APMC mandi transport.'
        ],
        precautions: 'Never pick damaged, rotten bolls or mix leaf bracts/trash, as it downgrades market lint quality.'
      }
    ]
  },
  {
    id: 'wheat',
    name: 'Wheat',
    localName: 'गेहूं / ઘઉં',
    scientificName: 'Triticum aestivum',
    category: 'cereals',
    season: 'rabi',
    durationDays: '115 - 135 Days',
    bestPracticingMonths: {
      sowing: 'Optimal: November 1 to November 20 (Late-sown up to December 10)',
      flowering: 'January - February (heading stage)',
      harvesting: 'March - April'
    },
    soilRequirement: {
      soilType: 'Well-drained fertile loam, clay-loam, or alluvial soil',
      phRange: '6.0 - 7.5 pH',
      condition: 'Friable seedbed with high organic matter and good water retention. Avoid highly alkaline (>8.5) or acidic waterlogged soils.'
    },
    environmentalRequirements: {
      temperature: '15°C - 22°C optimal (18°C-20°C for germination, cool winter for tillering, warm sunshine for grain filling)',
      rainfall: '250 - 400 mm requirement, met through 4-6 critical irrigations',
      sunlight: 'Clear sunny days during grain filling; sudden heat waves (>32°C in March) cause terminal heat stress'
    },
    seedRateAndSpacing: {
      seedRate: '40 - 45 kg/acre (Timely sown), 50 - 55 kg/acre (Late sown)',
      spacing: 'Row-to-row: 20 - 22.5 cm × continuous drilling at 4-5 cm depth',
      seedTreatment: 'Carbendazim @ 2g/kg or Vitavax @ 2.5g/kg seed to prevent loose smut and flag smut'
    },
    nutrientManagement: {
      basal: '50 kg DAP + 25 kg MOP + 25 kg Urea + 10 kg Zinc Sulphate (21%) per acre at drilling',
      topDressing: 'Split 1: 35 kg Urea at 1st Irrigation (CRI stage 21 DAS); Split 2: 35 kg Urea at 2nd Irrigation (Jointing 45 DAS)',
      foliarSprays: 'Foliar spray of 0.2% Zinc Sulphate or 1% Urea at flag leaf emergence for grain boldness'
    },
    economics: {
      expectedYield: '18 - 24 Quintals / acre (under good management)',
      mandiRateRange: '₹2,275 - ₹2,750 / Quintal (MSP supported)',
      costOfCultivation: '₹14,000 - ₹18,000 / acre'
    },
    timelineSteps: [
      {
        phase: 'Land Preparation & Pre-Sowing Irrigation (Paleva)',
        timeline: 'October 25 to November 5',
        tasks: [
          'Pre-sowing heavy irrigation (Paleva) after Kharif harvest to ensure deep root-zone moisture.',
          'Plough with disc harrow followed by cultivator (2-3 passes) once soil reaches workable moisture (*vapsa*).',
          'Plank the field immediately after ploughing to conserve moisture and break crusty clods.'
        ],
        precautions: 'Never sow in dry soil; moisture at 5 cm depth is essential for rapid uniform germination.'
      },
      {
        phase: 'Seed Sowing & Depth Calibration',
        timeline: 'Day 0 to 5',
        tasks: [
          'Use certified varieties like GW-496, Sharbati, HD-2967, DBW-187, or Lok-1.',
          'Sow using Seed-cum-Fertilizer Drill at 20-22.5 cm row spacing.',
          'Maintain precise seed depth of 4 to 5 cm. Place basal fertilizer 2-3 cm below the seed line.'
        ],
        precautions: 'Do not sow deeper than 6 cm; deep sowing delays coleoptile emergence and reduces productive tillers.'
      },
      {
        phase: 'Crown Root Initiation (CRI Stage) & 1st Irrigation',
        timeline: 'Day 20 to 25',
        tasks: [
          'Most critical growth stage: Crown root initiation occurs at 21 DAS.',
          'Provide the 1st critical irrigation. Delaying this irrigation reduces yield by 20-30%.',
          'Broadcast first top-dressing of 35 kg Urea per acre 1-2 days after irrigation when soil dries slightly.'
        ],
        precautions: 'Never skip or delay the CRI irrigation; tillering potential is determined during this window.'
      },
      {
        phase: 'Tillering & Weed Control',
        timeline: 'Day 26 to 45',
        tasks: [
          'Apply post-emergence herbicide at 30-35 DAS: Clodinafop-propargyl @ 160g/acre for grassy weeds (Phalaris minor) or Metsulfuron-methyl @ 8g/acre for broadleaf weeds.',
          'Provide 2nd irrigation at late tillering / jointing stage (40-45 DAS).',
          'Apply second split of 35 kg Urea per acre.'
        ],
        precautions: 'Spray weedicides using flat fan nozzle in sunny, non-windy conditions with adequate soil moisture.'
      },
      {
        phase: 'Booting, Heading & Flowering Stage',
        timeline: 'Day 60 to 85',
        tasks: [
          'Provide 3rd irrigation at booting/flag leaf stage (60-65 DAS) and 4th irrigation at flowering (80-85 DAS).',
          'Monitor for yellow or brown rust; spray Propiconazole 25% EC (Tilt) @ 200 ml/acre if rust pustules appear.',
          'Spray 0.5% Potassium Nitrate (13-0-45) to protect against early temperature spikes.'
        ],
        precautions: 'Avoid heavy irrigations during windy days to prevent plant lodging (falling down).'
      },
      {
        phase: 'Milking, Dough Stage & Harvesting',
        timeline: 'Day 90 to 130',
        tasks: [
          'Provide final light irrigation at milk/early dough stage (100-105 DAS) to maximize test weight and kernel plumpness.',
          'Stop irrigations when grains turn firm and golden yellow.',
          'Harvest when grain moisture drops below 14% using combine harvester or manual sickle cutting.',
          'Thresh and winnow; dry grain in the sun for 2 days to achieve <12% storage moisture.'
        ],
        precautions: 'Irrigating at late dough stage causes severe lodging and discoloration of grains.'
      }
    ]
  },
  {
    id: 'mustard',
    name: 'Mustard / Rapeseed',
    localName: 'सरसों / રાઈ',
    scientificName: 'Brassica juncea',
    category: 'oilseeds',
    season: 'rabi',
    durationDays: '105 - 125 Days',
    bestPracticingMonths: {
      sowing: 'October 10 to October 31 (Ideal: Mid-October for maximum yield and aphid escape)',
      flowering: 'December - January',
      harvesting: 'February - Mid March'
    },
    soilRequirement: {
      soilType: 'Light loam to medium clay loam soils',
      phRange: '6.5 - 7.8 pH',
      condition: 'Good moisture retention and fine clod-free seedbed. Responds extraordinarily well to elemental Sulphur.'
    },
    environmentalRequirements: {
      temperature: '15°C - 25°C (Cool climate during vegetative & flowering, warm dry weather at maturity)',
      rainfall: 'Requires 250 - 350 mm water; highly efficient water user (needs only 2-3 irrigations)',
      sunlight: 'Bright sunny days; prolonged foggy days in Jan-Feb trigger severe aphid outbreaks'
    },
    seedRateAndSpacing: {
      seedRate: '1.5 - 2.0 kg/acre',
      spacing: 'Row-to-row: 30 - 45 cm × Plant-to-plant: 10 - 15 cm',
      seedTreatment: 'Trichoderma viride @ 4g/kg + Apron 35 SD @ 3g/kg against white rust & downy mildew'
    },
    nutrientManagement: {
      basal: '35 kg DAP + 20 kg MOP + 20 kg Urea + 15 kg Elemental Sulphur or 100 kg Gypsum per acre',
      topDressing: 'Urea 30 kg per acre at 1st irrigation (30-35 DAS)',
      foliarSprays: '0.5% Boron spray at 50% flowering stage enhances siliqua pod setting and seed oil %'
    },
    economics: {
      expectedYield: '8 - 12 Quintals / acre',
      mandiRateRange: '₹5,200 - ₹6,100 / Quintal',
      costOfCultivation: '₹10,000 - ₹13,000 / acre (High ROI)'
    },
    timelineSteps: [
      {
        phase: 'Land Preparation & Basal Sulphur Application',
        timeline: 'October 5 to 15',
        tasks: [
          'Plough 2-3 times followed by heavy planking to create a fine, clod-free seedbed retaining moisture.',
          'Broadcast 15 kg Elemental Sulphur or 100 kg agricultural gypsum along with basal DAP & MOP.',
          'Conserve residual moisture from Kharif harvest for fast germination of tiny seeds.'
        ],
        precautions: 'Do not leave coarse clods; tiny mustard seeds fail to emerge through rough soil.'
      },
      {
        phase: 'Line Sowing & Thinning',
        timeline: 'Day 0 to 20',
        tasks: [
          'Sow in rows 30-45 cm apart at shallow depth of 3-4 cm using seed drill or *pora*.',
          'Mix seed with sand or dry sieved compost (1:3 ratio) for even seed distribution.',
          'Perform mandatory thinning at 15-20 DAS to space plants 10-15 cm apart.'
        ],
        precautions: 'Overcrowding without thinning causes thin, weak stems and drastic pod reduction.'
      },
      {
        phase: '1st Irrigation & Weed Management',
        timeline: 'Day 25 to 35',
        tasks: [
          'Provide 1st critical irrigation at pre-flowering / rosette stage (30-35 DAS).',
          'Apply 30 kg Urea per acre immediately post irrigation.',
          'One manual weeding or wheel hoeing at 25-30 DAS.'
        ],
        precautions: 'Do not flood heavily; light irrigation is sufficient for the root zone.'
      },
      {
        phase: 'Flowering & Aphid (Mahu) Prevention',
        timeline: 'Day 45 to 75',
        tasks: [
          'Provide 2nd critical irrigation at pod formation stage (60-65 DAS).',
          'Scout for mustard aphid (*Lipaphis erysimi*) colonies on central shoots during cloudy spells.',
          'Spray Dimethoate 30% EC @ 300 ml/acre or Thiamethoxam 25% WG @ 80g/acre if aphid colony exceeds ETL (20-25 aphids/plant).'
        ],
        precautions: 'Spray in late afternoon to safeguard honeybee pollinators active in morning hours.'
      },
      {
        phase: 'Pod Maturation & Harvesting',
        timeline: 'Day 90 to 120',
        tasks: [
          'Harvest when 75-80% of siliquae (pods) turn golden straw-yellow.',
          'Harvest early in the morning when dew softens pods to avoid shattering losses.',
          'Stack plants in the threshing yard for 4-5 days to dry before thresher separation.'
        ],
        precautions: 'Do not delay harvest until pods are dead brown, as severe seed shattering occurs.'
      }
    ]
  },
  {
    id: 'groundnut',
    name: 'Groundnut / Peanut',
    localName: 'मूंगफली / મગફળી',
    scientificName: 'Arachis hypogaea',
    category: 'oilseeds',
    season: 'kharif',
    durationDays: '110 - 125 Days',
    bestPracticingMonths: {
      sowing: 'June 15 to July 15 (Kharif with monsoon onset); January 15 - Feb 15 (Summer crop)',
      flowering: 'Day 30 to 55 (Pegging stage)',
      harvesting: 'October - November'
    },
    soilRequirement: {
      soilType: 'Light sandy loam, red sandy soil, or loose well-drained alluvial soil',
      phRange: '6.0 - 7.5 pH',
      condition: 'Loose, friable topsoil is essential for unhindered peg penetration into the soil. Avoid heavy sticky clay that prevents pod lifting.'
    },
    environmentalRequirements: {
      temperature: '25°C - 32°C (Sensitive to frost and cold spells)',
      rainfall: '500 - 700 mm evenly distributed; critical dry spells during pegging severely impair pod set',
      sunlight: 'Full bright sunshine; warm weather speeds up pod maturity'
    },
    seedRateAndSpacing: {
      seedRate: '40 - 50 kg kernels/acre (Semi-spreading); 55 - 60 kg/acre (Bunch type)',
      spacing: 'Row-to-row: 30 cm × Plant-to-plant: 10 cm',
      seedTreatment: 'Treat kernels with Mancozeb @ 3g/kg + Rhizobium & PSB culture @ 10g/kg kernel'
    },
    nutrientManagement: {
      basal: '25 kg DAP + 20 kg MOP + 15 kg Urea + 10 kg Zinc Sulphate at sowing',
      topDressing: 'Gypsum application @ 150-200 kg/acre at 40-45 DAS (flowering/pegging) is mandatory for calcium shell development',
      foliarSprays: '0.5% Ferrous Sulphate + 0.1% Citric acid spray if lime-induced iron chlorosis (yellow leaves) appears'
    },
    economics: {
      expectedYield: '10 - 15 Quintals / acre (Kharif); 15 - 20 Quintals / acre (Summer irrigated)',
      mandiRateRange: '₹5,800 - ₹6,800 / Quintal',
      costOfCultivation: '₹18,000 - ₹24,000 / acre'
    },
    timelineSteps: [
      {
        phase: 'Seed Selection & Shelled Kernel Treatment',
        timeline: 'June 5 to 15',
        tasks: [
          'Shell pods 1-2 weeks before sowing; select bold, uniform kernels free of insect holes.',
          'Conduct seed treatment with biological culture (Rhizobium + Trichoderma) to ensure nitrogen fixation nodules.',
          'Plough land twice to create friable, loose crumbly topsoil.'
        ],
        precautions: 'Do not damage the thin kernel seed coat (testa) during hand or machine shelling.'
      },
      {
        phase: 'Sowing on Broad Bed & Furrow (BBF)',
        timeline: 'Day 0 to 5',
        tasks: [
          'Sow using tractor seed drill on Broad Bed and Furrow (BBF) layout for optimum drainage and loose peg bed.',
          'Sow at 4-5 cm depth at 30 cm × 10 cm spacing.',
          'Apply pre-emergence herbicide Pendimethalin @ 1.0 kg a.i./ha within 48 hours of sowing.'
        ],
        precautions: 'Never sow deeper than 6 cm as kernel emergence will be choked.'
      },
      {
        phase: 'Early Weeding & Gypsum Top-Dressing',
        timeline: 'Day 20 to 45',
        tasks: [
          'Hand weeding at 20-25 DAS to keep field clean before pegging begins.',
          'Apply agricultural gypsum @ 150-200 kg/acre at 40-45 DAS around plant base.',
          'Perform light earthing-up alongside gypsum application.'
        ],
        precautions: 'Stop all intercultural hoeing/weeding once pegs start penetrating the soil (Day 45) to avoid breaking pegs.'
      },
      {
        phase: 'Pegging & Pod Filling Stage',
        timeline: 'Day 50 to 85',
        tasks: [
          'Ensure adequate soil moisture during peg penetration and pod development.',
          'Monitor for Tikka leaf spot (*Cercospora*); spray Mancozeb + Carbendazim (Saaf) @ 2g/litre.',
          'Apply neem cake or Chlorpyrifos drenching if white grub infestation is detected.'
        ],
        precautions: 'Water stress between day 50 and 80 reduces shelling percentage and creates empty pops.'
      },
      {
        phase: 'Pod Maturation & Harvesting',
        timeline: 'Day 90 to 120',
        tasks: [
          'Check maturity by pulling 2-3 sample plants: inner pod shell should show dark brownish-black vascular lining.',
          'Give light irrigation 1 day prior to lifting if soil is hard to avoid leaving pods buried.',
          'Lift plants, shake off soil, and dry inverted in field for 2-3 days before mechanical pod picking.',
          'Dry pods in sun until rattling sound is heard and moisture reaches 8-9%.'
        ],
        precautions: 'High moisture storage (>10%) causes toxic Aspergillus flavus aflatoxin contamination.'
      }
    ]
  },
  {
    id: 'cumin',
    name: 'Cumin / Jeera',
    localName: 'जीरा / જીરું',
    scientificName: 'Cuminum cyminum',
    category: 'spices',
    season: 'rabi',
    durationDays: '100 - 115 Days',
    bestPracticingMonths: {
      sowing: 'October 25 to November 15 (Late sowing after Nov 20 invites heavy blight)',
      flowering: 'December - January',
      harvesting: 'February - March'
    },
    soilRequirement: {
      soilType: 'Well-drained sandy loam to loamy soil rich in organic humus',
      phRange: '7.0 - 8.5 pH',
      condition: 'Strictly requires clean, well-drained soil with zero waterlogging history. Rotate crops; avoid cumin after cumin to stop Fusarium wilt.'
    },
    environmentalRequirements: {
      temperature: '15°C - 25°C (Cool, dry, clear climate without frost or high humidity)',
      rainfall: 'Grown in dry arid zones (Gujarat & Rajasthan); requires only 3-4 light irrigations',
      sunlight: 'Abundant clear dry sunshine; high humidity or morning fog causes devastating Alternaria blight and powdery mildew'
    },
    seedRateAndSpacing: {
      seedRate: '4.0 - 5.0 kg/acre (Broadcasting/Line sowing)',
      spacing: 'Line sowing: 25 - 30 cm row spacing with light soil cover (1-2 cm depth)',
      seedTreatment: 'Carbendazim @ 2g/kg or Trichoderma viride @ 5g/kg seed for Fusarium wilt immunity'
    },
    nutrientManagement: {
      basal: '30 kg DAP + 15 kg MOP + 15 kg Urea per acre at field prep',
      topDressing: '20 kg Urea per acre after 1st irrigation (30 DAS)',
      foliarSprays: '0.2% Mancozeb + 0.1% Dinocap (Karathane) prophylactic spray at 45 & 60 DAS'
    },
    economics: {
      expectedYield: '4 - 6 Quintals / acre (Premium high-value spice)',
      mandiRateRange: '₹22,000 - ₹28,000 / Quintal',
      costOfCultivation: '₹14,000 - ₹18,000 / acre (Exceptional net profits)'
    },
    timelineSteps: [
      {
        phase: 'Land Preparation & Wilt Sanitization',
        timeline: 'October 15 to 25',
        tasks: [
          'Plough field 3 times to produce an exceptionally fine, smooth, level seedbed.',
          'Prepare beds of convenient size (3m × 2m) with bunds for uniform micro-irrigation.',
          'Apply 4 tonnes of well-rotted FYM mixed with Trichoderma culture per acre to suppress soil-borne wilt.'
        ],
        precautions: 'Never grow cumin on low-lying land or fields with a history of Fusarium wilt.'
      },
      {
        phase: 'Shallow Sowing & Emergence Irrigation',
        timeline: 'Day 0 to 10',
        tasks: [
          'Soak seeds in water for 8 hours and shade dry before sowing to accelerate germination.',
          'Sow in shallow lines at 25 cm spacing or broadcast uniformly followed by light sweeping rake.',
          'Apply an immediate very light irrigation with gentle water flow to avoid sweeping seeds away.',
          'Give second light irrigation 8-10 days later for complete emergence.'
        ],
        precautions: 'Cumin seeds are delicate and tiny; sowing deeper than 2 cm results in complete germination failure.'
      },
      {
        phase: 'Weeding & 1st Top Dressing',
        timeline: 'Day 15 to 35',
        tasks: [
          'Slow initial growth requires two meticulous hand weedings at 20 and 35 DAS.',
          'Apply 20 kg Urea per acre at 30 DAS followed by third light irrigation.',
          'Thin out excess seedlings to maintain 5-8 cm plant spacing.'
        ],
        precautions: 'Do not allow heavy stream of irrigation water to submerge young plants.'
      },
      {
        phase: 'Flowering & Blight/Mildew Defense',
        timeline: 'Day 40 to 75',
        tasks: [
          'Fourth irrigation at flowering stage (55-60 DAS).',
          'Prophylactic spray of Mancozeb 75% WP @ 2.5g/L for Alternaria blight (*Chhachhiya*) at first signs of cloudiness.',
          'Spray Wettable Sulphur 80% WP @ 2g/L or Hexaconazole 5% EC @ 1ml/L for Powdery mildew prevention.'
        ],
        precautions: 'Fog and cloudy weather are emergency signals for cumin; spray fungicides immediately before disease strikes.'
      },
      {
        phase: 'Maturity, Cutting & Shade Curing',
        timeline: 'Day 85 to 110',
        tasks: [
          'Withhold irrigation when seed umbels start turning brownish-yellow.',
          'Harvest in the early morning by pulling plants or sickle cutting to prevent seed shedding.',
          'Dry harvested plants on clean tarpaulin sheets in the shade for 3-4 days.',
          'Thresh by gentle beating with sticks; winnow to remove dust, and store in moisture-proof bags.'
        ],
        precautions: 'Never dry cumin under direct harsh afternoon sun or allow rain/dew on harvested heaps.'
      }
    ]
  },
  {
    id: 'soybean',
    name: 'Soybean',
    localName: 'सोयाबीन',
    scientificName: 'Glycine max',
    category: 'oilseeds',
    season: 'kharif',
    durationDays: '90 - 105 Days',
    bestPracticingMonths: {
      sowing: 'June 20 to July 10 (Immediately with monsoon rain of >100 mm)',
      flowering: 'Day 35 to 55',
      harvesting: 'Late September - October'
    },
    soilRequirement: {
      soilType: 'Well-drained clay loam, black cotton soil, or fertile alluvial soil',
      phRange: '6.5 - 7.5 pH',
      condition: 'Good moisture-holding capacity and adequate drainage. Sensitive to waterlogging and soil salinity.'
    },
    environmentalRequirements: {
      temperature: '22°C - 30°C optimal for growth and nitrogen fixation',
      rainfall: '600 - 800 mm evenly distributed throughout the season',
      sunlight: 'Warm, humid climate; daylength sensitive'
    },
    seedRateAndSpacing: {
      seedRate: '30 - 35 kg/acre (Certified bold seeds with >70% germination)',
      spacing: 'Row-to-row: 45 cm × Plant-to-plant: 5 - 7 cm',
      seedTreatment: 'Bradyrhizobium japonicum + PSB culture @ 10g/kg seed + Carboxin + Thiram (Vitavax Power) @ 2.5g/kg'
    },
    nutrientManagement: {
      basal: '12 kg N (Starter) + 30 kg P2O5 (65 kg SSP) + 15 kg K2O per acre at sowing',
      topDressing: 'Apply 15 kg Sulphur per acre (SSP provides both Phosphorus & Sulphur naturally)',
      foliarSprays: 'Foliar spray of 2% Urea at 50 DAS (pod initiation) boosts seed filling'
    },
    economics: {
      expectedYield: '10 - 14 Quintals / acre',
      mandiRateRange: '₹4,400 - ₹5,200 / Quintal',
      costOfCultivation: '₹12,000 - ₹16,000 / acre'
    },
    timelineSteps: [
      {
        phase: 'Land Preparation & Seed Inoculation',
        timeline: 'June 10 to 20',
        tasks: [
          'Plough once and harrow twice to create a firm seedbed with good moisture conservation.',
          'Inoculate seeds with Bradyrhizobium culture in shade 2 hours before sowing.',
          'Ensure soil has received at least 100 mm cumulative rainfall before drilling.'
        ],
        precautions: 'Do not sow in dry soil hoping for rain; germination will fail.'
      },
      {
        phase: 'Sowing on Ridge-Furrow or BBF',
        timeline: 'Day 0 to 5',
        tasks: [
          'Sow using seed drill at 45 cm row spacing and 3-4 cm depth.',
          'Apply pre-emergence herbicide Diclosulam @ 12.4g/acre or Pendimethalin within 48 hours of sowing.'
        ],
        precautions: 'Deep placement (>5 cm) severely reduces soybean germination.'
      },
      {
        phase: 'Critical Weed Control & Root Nodulation',
        timeline: 'Day 15 to 30',
        tasks: [
          'Maintain weed-free period for 20-30 DAS.',
          'If pre-emergence herbicide was not applied, spray Imazethapyr 10% SL @ 400 ml/acre at 15-20 DAS.',
          'Check root nodulation: healthy active nodules show pinkish/reddish color inside.'
        ],
        precautions: 'Avoid chemical spray under drought-stressed dry soil conditions.'
      },
      {
        phase: 'Flowering & Pod Borer Management',
        timeline: 'Day 35 to 65',
        tasks: [
          'Monitor for Girdle beetle and Spodoptera leaf defoliators.',
          'Install pheromone traps (5 traps/acre) and yellow sticky traps.',
          'Spray Chlorantraniliprole 18.5% SC @ 60 ml/acre or Flubendiamide 39.35% SC @ 40 ml/acre if pest threshold exceeds.'
        ],
        precautions: 'Avoid moisture stress during flowering and pod development; provide irrigation if dry spell exceeds 15 days.'
      },
      {
        phase: 'Maturity & Mechanical Harvesting',
        timeline: 'Day 75 to 105',
        tasks: [
          'Harvest when leaves turn yellow and drop off, and pods turn light brown/straw-colored.',
          'Harvest when grain moisture is around 13-14% to prevent shattering and mechanical cracking.',
          'Set combine harvester cylinder speed low (350-400 RPM) to avoid splitting seed coat.'
        ],
        precautions: 'Delaying harvest leads to severe pod shattering losses under hot sunny conditions.'
      }
    ]
  },
  {
    id: 'chickpea',
    name: 'Chickpea / Bengal Gram',
    localName: 'चना / ચણા',
    scientificName: 'Cicer arietinum',
    category: 'pulses',
    season: 'rabi',
    durationDays: '100 - 120 Days',
    bestPracticingMonths: {
      sowing: 'October 15 to November 10 (Desi); Late October to Mid November (Kabuli)',
      flowering: 'December - January',
      harvesting: 'February - March'
    },
    soilRequirement: {
      soilType: 'Well-drained light loam, sandy loam to medium black clay-loam',
      phRange: '6.5 - 7.8 pH',
      condition: 'Good moisture conservation; avoid heavy waterlogged soils which promote Fusarium wilt and collar rot.'
    },
    environmentalRequirements: {
      temperature: '15°C - 25°C (Cool climate for vegetative growth, warm sunny climate during pod fill)',
      rainfall: 'Grown primarily on residual soil moisture; responds with 25-30% higher yield to 1-2 irrigations',
      sunlight: 'Clear sunny weather; high humidity during flowering causes flower drop and blight'
    },
    seedRateAndSpacing: {
      seedRate: '30 - 35 kg/acre (Desi type); 45 - 50 kg/acre (Large seeded Kabuli)',
      spacing: 'Row-to-row: 30 cm × Plant-to-plant: 10 cm (Desi); 45 cm × 10 cm (Kabuli)',
      seedTreatment: 'Mancozeb @ 2g/kg + Trichoderma viride @ 5g/kg + Rhizobium & PSB inoculant'
    },
    nutrientManagement: {
      basal: '10 kg N + 25 kg P2O5 (150 kg SSP) + 10 kg Sulphur per acre at drilling',
      topDressing: 'No top-dressed nitrogen needed (fixes its own nitrogen via root nodules)',
      foliarSprays: 'Foliar spray of 2% DAP or 19-19-19 @ 1 kg/acre at 50% flowering and pod formation'
    },
    economics: {
      expectedYield: '8 - 12 Quintals / acre (Desi); 10 - 14 Quintals / acre (Kabuli)',
      mandiRateRange: '₹5,400 - ₹6,400 / Quintal (MSP supported)',
      costOfCultivation: '₹9,000 - ₹12,000 / acre (Low input cost, high margin)'
    },
    timelineSteps: [
      {
        phase: 'Land Preparation & Seed Inoculation',
        timeline: 'October 10 to 20',
        tasks: [
          'Plough once followed by 2 passes of cultivator and planking to conserve moisture.',
          'Treat seeds with dual culture of Mesorhizobium ciceri and PSB.',
          'Select wilt-resistant varieties: Gujarat Gram-1/5, JG-11, JAKI-9218, RVG-202.'
        ],
        precautions: 'Do not prepare too fine a dust-like seedbed; slightly rough cloddy surface prevents crusting.'
      },
      {
        phase: 'Sowing at Moisture Depth',
        timeline: 'Day 0 to 5',
        tasks: [
          'Sow at 7-10 cm deep to place seeds firmly into moist soil zone.',
          'Keep 30 cm row spacing with seed drill.'
        ],
        precautions: 'Shallow sowing (<5 cm) leads to poor germination and higher wilt infection.'
      },
      {
        phase: 'Nipping (Apical Pruning) & Branching',
        timeline: 'Day 30 to 45',
        tasks: [
          'Traditional best practice: Pluck 2-3 cm shoot tips (*nipping*) at 30-35 DAS when plants are 15 cm tall.',
          'Nipping breaks apical dominance and triggers heavy lateral branching, doubling pod count per plant.',
          'Provide 1st critical irrigation at pre-flowering stage (40-45 DAS) if soil is dry.'
        ],
        precautions: 'Never irrigate during active flowering; irrigation during bloom causes flower drop and vegetative overgrowth.'
      },
      {
        phase: 'Pod Borer (Helicoverpa) Defense',
        timeline: 'Day 50 to 80',
        tasks: [
          'Install T-shaped bird perches (15-20 per acre) for predatory birds.',
          'Install 5 pheromone traps per acre to monitor Helicoverpa armigera moth activity.',
          'Spray HaNPV @ 200 LE/acre or Emamectin Benzoate 5% SG @ 80g/acre or Chlorantraniliprole 18.5% SC @ 50ml/acre at pod borer initiation.'
        ],
        precautions: 'Pod borer larvae feed directly inside developing green pods; spray immediately on ETL detection.'
      },
      {
        phase: 'Pod Maturation & Harvesting',
        timeline: 'Day 85 to 115',
        tasks: [
          'Harvest when plants turn brownish-yellow and dry seeds rattle inside pods.',
          'Cut plants with sickles in the morning and stack in threshing floor for 3-4 days.',
          'Thresh using pulse thresher and clean grains; store at <10% moisture.'
        ],
        precautions: 'Store with sun-dried neem leaves or aluminium phosphide tablet in airtight bins to prevent pulse beetle (*bruchids*).'
      }
    ]
  },
  {
    id: 'paddy',
    name: 'Paddy / Rice',
    localName: 'धान / ડાંગર',
    scientificName: 'Oryza sativa',
    category: 'cereals',
    season: 'kharif',
    durationDays: '115 - 145 Days',
    bestPracticingMonths: {
      sowing: 'Nursery: May 25 to June 20; Main Field Transplanting: June 25 to July 25',
      flowering: 'September - October',
      harvesting: 'October - November'
    },
    soilRequirement: {
      soilType: 'Heavy clay, clay-loam, or silty alluvial soil with low permeability',
      phRange: '5.5 - 7.5 pH',
      condition: 'Capable of holding standing water; puddling creates an impervious hardpan that prevents deep water percolation.'
    },
    environmentalRequirements: {
      temperature: '22°C - 32°C (Warm humid climate, minimum 20°C for flowering)',
      rainfall: '1000 - 1500 mm requirement; continuous water access needed',
      sunlight: 'High solar radiation during panicle development and grain filling'
    },
    seedRateAndSpacing: {
      seedRate: '15 - 20 kg/acre (Transplanted); 6 - 8 kg/acre (Hybrids); 25 - 30 kg/acre (Direct Seeded Rice)',
      spacing: 'Row-to-row: 20 cm × Plant-to-plant: 15 cm (2-3 seedlings per hill)',
      seedTreatment: 'Salt water test (10% brine to float light seeds) + Carbendazim @ 2g/kg seed + Streptocycline @ 0.1g/kg'
    },
    nutrientManagement: {
      basal: '50 kg DAP + 25 kg MOP + 10 kg Zinc Sulphate (21%) per acre at final puddling',
      topDressing: 'Urea 35 kg at active tillering (21 DAT) + Urea 35 kg + MOP 15 kg at panicle initiation (45 DAT)',
      foliarSprays: '0.2% Zinc Sulphate spray at 30 DAT if Khaira disease (zinc deficiency bronzing) appears'
    },
    economics: {
      expectedYield: '22 - 30 Quintals / acre (Common); 18 - 24 Quintals / acre (Basmati)',
      mandiRateRange: '₹2,300 - ₹3,800 / Quintal',
      costOfCultivation: '₹20,000 - ₹26,000 / acre'
    },
    timelineSteps: [
      {
        phase: 'Nursery Raising & Seed Treatment',
        timeline: 'May 25 to June 15',
        tasks: [
          'Prepare raised nursery beds (1.5m wide) with fine soil mixed with vermicompost.',
          'Soak treated seeds in water for 24 hours and incubate in moist gunny bags for 24 hours to sprout.',
          'Broadcast sprouted seeds evenly on nursery beds; maintain thin water film.'
        ],
        precautions: 'Ensure nursery is protected against bird feeding and water stagnation during early 3 days.'
      },
      {
        phase: 'Main Field Puddling & Transplanting',
        timeline: 'Day 0 to 25 (Nursery Age)',
        tasks: [
          'Flood main field and puddle with tractor cage wheels (2-3 passes) followed by leveling plank.',
          'Apply basal fertilizer dose at final puddling pass.',
          'Transplant 20-25 day old seedlings (3-4 leaf stage) at 20 cm × 15 cm spacing, 2-3 seedlings per hill, shallow at 2-3 cm depth.'
        ],
        precautions: 'Do not transplant older seedlings (>30 days) as tillering capacity drops drastically.'
      },
      {
        phase: 'Water Regime & Active Tillering',
        timeline: 'Day 10 to 35 After Transplanting',
        tasks: [
          'Maintain 2-3 cm shallow water depth during initial establishment.',
          'Apply pre-emergence herbicide Pretilachlor with safener @ 600 ml/acre at 3-5 DAT in standing water.',
          'First top-dressing of 35 kg Urea at 21 DAT.',
          'Practice Alternate Wetting and Drying (AWD) to oxygenate roots and save 25% irrigation water.'
        ],
        precautions: 'Do not drain water within 48 hours of herbicide or fertilizer application.'
      },
      {
        phase: 'Panicle Initiation & Disease Management',
        timeline: 'Day 40 to 75 After Transplanting',
        tasks: [
          'Apply second top-dressing of 35 kg Urea + 15 kg MOP at panicle initiation.',
          'Maintain 5 cm standing water from panicle emergence through grain filling.',
          'Scout for Stem Borer (*dead hearts* / *white ears*) and Brown Plant Hopper (BPH).',
          'Spray Cartap Hydrochloride 50% SP @ 400g/acre or Triflumezopyrim 10% SC @ 94ml/acre for BPH.'
        ],
        precautions: 'Avoid excessive nitrogen fertilization that attracts blast disease and causes lodging.'
      },
      {
        phase: 'Grain Filling & Harvest',
        timeline: 'Day 80 to 125',
        tasks: [
          'Drain field completely 10-12 days before anticipated harvest to facilitate soil firmness for machines.',
          'Harvest when 85-90% of panicles turn golden brown and grains in lower portion are in hard dough stage.',
          'Thresh promptly and dry paddy on clean threshing floors until grain moisture reaches 13-14%.'
        ],
        precautions: 'Never over-dry below 11% moisture to prevent breakage during rice milling.'
      }
    ]
  },
  {
    id: 'tomato',
    name: 'Tomato',
    localName: 'टमाटर / ટામેટા',
    scientificName: 'Solanum lycopersicum',
    category: 'vegetables',
    season: 'kharif',
    durationDays: '120 - 150 Days',
    bestPracticingMonths: {
      sowing: 'Kharif: June - July | Rabi: October - November | Summer: January - February',
      flowering: '45 - 75 Days after transplanting',
      harvesting: '75 - 140 Days (Multiple hand pickings every 4-5 days)'
    },
    soilRequirement: {
      soilType: 'Deep, well-drained sandy loam or red loam rich in organic matter',
      phRange: '6.0 - 7.0 pH',
      condition: 'High humus content, free of root-knot nematodes. Extremely sensitive to water stagnation.'
    },
    environmentalRequirements: {
      temperature: '20°C - 28°C (Optimal fruit setting at night temp 15°C-20°C; >35°C causes flower drop)',
      rainfall: 'Requires drip irrigation with precise water control (600 - 800 mm)',
      sunlight: 'Bright sunny days; high humidity favors early and late blight'
    },
    seedRateAndSpacing: {
      seedRate: '60 - 80 grams / acre (F1 Hybrids)',
      spacing: 'Bed width: 90 cm; Row-to-row on bed: 60 cm × Plant-to-plant: 45 - 50 cm with silver-black mulch',
      seedTreatment: 'Pro-tray nursery in cocopeat treated with Trichoderma harzianum @ 10g/kg'
    },
    nutrientManagement: {
      basal: '10 tons FYM + 50 kg DAP + 40 kg MOP + 10 kg Micronutrient mixture per acre',
      fertigation: 'Weekly drip fertigation using 19:19:19 (Vegetative) and 13:0:45 + 0:52:34 (Fruiting)',
      foliarSprays: 'Calcium Nitrate @ 3g/L + Boron @ 1g/L at flowering to eliminate Blossom End Rot (black bottom)'
    },
    economics: {
      expectedYield: '250 - 400 Quintals / acre (High yield F1 hybrids with staking)',
      mandiRateRange: '₹1,200 - ₹3,500 / Quintal (Volatile market, high upside)',
      costOfCultivation: '₹35,000 - ₹45,000 / acre (Mulch & Trellis setup)'
    },
    timelineSteps: [
      {
        phase: 'Pro-Tray Nursery in Shade Net',
        timeline: 'Day -30 to -1',
        tasks: [
          'Sow hybrid seeds in 98-cell pro-trays filled with sterilized cocopeat, vermicompost, and perlite.',
          'Keep under 50% green shade net; drench with metalaxyl @ 1g/L against damping-off.',
          'Harden seedlings 3-4 days before field transplanting by withholding shade and reducing water.'
        ],
        precautions: 'Do not overwater pro-trays; damping-off destroys entire nursery overnight.'
      },
      {
        phase: 'Raised Bed Preparation & Drip-Mulch Installation',
        timeline: 'Day -10 to 0',
        tasks: [
          'Form raised beds 90 cm top width, 30 cm height, and 45 cm furrow walk-path.',
          'Incorporate basal compost and fertilizers into bed top.',
          'Lay inline drip lateral (16 mm, 40 cm dripper spacing, 2 LPH discharge).',
          'Cover with 25-30 micron Silver-Black reflective plastic mulch film with pre-punched holes.'
        ],
        precautions: 'Silver side of mulch must face upward to reflect sun and deter insect vectors (aphids/thrips).'
      },
      {
        phase: 'Transplanting & Staking / Trellising',
        timeline: 'Day 1 to 30',
        tasks: [
          'Transplant 25-day old sturdy seedlings in evening hours; run drip immediately.',
          'Erect bamboo/iron trellis system (6 ft height with GI wire and twine) at 20-25 DAT.',
          'Train plants vertically on strings and prune lower suckers to maintain single or double main stems.'
        ],
        precautions: 'Staking is mandatory for indeterminate hybrids to keep fruits off soil and prevent fungal rot.'
      },
      {
        phase: 'Flowering, Fruit Set & Pest Control',
        timeline: 'Day 35 to 70',
        tasks: [
          'Begin weekly fertigation schedule with water-soluble 19-19-19 and Calcium Nitrate.',
          'Install Yellow & Blue sticky traps and Delta pheromone traps for Tuta absoluta (leaf miner).',
          'Spray Cyantraniliprole 10.26% OD @ 360 ml/acre or Spinetoram 11.7% SC for fruit borer and thrips.',
          'Prophylactic spray of Copper Oxychloride 50% WP @ 2.5g/L + Streptocycline 0.1g/L for bacterial spot.'
        ],
        precautions: 'Never spray insecticides during active pollinator hours in mid-morning.'
      },
      {
        phase: 'Harvesting & Grading',
        timeline: 'Day 75 to 140',
        tasks: [
          'Harvest at breaker stage (turning pink/orange) for distant transport, or firm red-ripe for local mandi.',
          'Harvest fruit with calyx attached by gentle twist in morning or evening hours.',
          'Grade into A, B, and C sizes; pack in ventilated plastic crates (25 kg capacity).'
        ],
        precautions: 'Do not heap fruits deeper than 3 layers in crates to avoid crushing bottom tomatoes.'
      }
    ]
  },
  {
    id: 'onion',
    name: 'Onion',
    localName: 'प्याज़ / ડુંગળી',
    scientificName: 'Allium cepa',
    category: 'vegetables',
    season: 'rabi',
    durationDays: '120 - 140 Days',
    bestPracticingMonths: {
      sowing: 'Nursery: Oct - Nov (Rabi); Main Field: Dec - Jan; Harvest: April - May',
      flowering: 'Bulb enlargement: 60 - 100 DAT',
      harvesting: 'April - May (When 50-70% tops fall down)'
    },
    soilRequirement: {
      soilType: 'Deep, rich, well-drained sandy loam or alluvial soil with friable texture',
      phRange: '6.5 - 7.5 pH',
      condition: 'High organic matter, free of hardpan. Cloddy clay soils restrict bulb swelling and cause deformed shapes.'
    },
    environmentalRequirements: {
      temperature: '15°C - 25°C (Cool climate for early vegetative growth; 25°C-32°C for bulb formation and dry curing)',
      rainfall: 'Sensitive to water excess; requires regular light irrigations (400 - 500 mm)',
      sunlight: 'Long photoperiod (>11 hours daylight) essential for bulb development in Rabi varieties'
    },
    seedRateAndSpacing: {
      seedRate: '3.5 - 4.0 kg seeds/acre (Nursery raised for 1 acre transplanting)',
      spacing: 'Row-to-row: 15 cm × Plant-to-plant: 10 cm (Shallow transplanting 2-3 cm deep)',
      seedTreatment: 'Thiram @ 2g/kg + Trichoderma viride @ 5g/kg seed in nursery bed'
    },
    nutrientManagement: {
      basal: '10 tons FYM + 40 kg DAP + 30 kg MOP + 15 kg Elemental Sulphur per acre',
      topDressing: 'Split 1: 30 kg Urea at 30 DAT; Split 2: 30 kg Urea + 10 kg Sulphur at 45 DAT',
      foliarSprays: '0.5% 00:52:34 + 0.1% Boron at 65 & 80 DAT for firm, heavy bulb skin'
    },
    economics: {
      expectedYield: '120 - 160 Quintals / acre (Rabi storage onion)',
      mandiRateRange: '₹1,500 - ₹3,200 / Quintal',
      costOfCultivation: '₹22,000 - ₹28,000 / acre'
    },
    timelineSteps: [
      {
        phase: 'Nursery Raising & Care',
        timeline: 'October 15 to November 15',
        tasks: [
          'Sow seeds in lines 7-8 cm apart on raised nursery beds (15 cm high, 1.2 m wide).',
          'Cover lightly with compost and paddy straw until germination; drench with Captan @ 2g/L against damping-off.',
          'Nursery seedlings are ready in 6-7 weeks when stem thickness reaches pencil size (6-8 mm).'
        ],
        precautions: 'Do not transplant overgrown seedlings with thick necks or bulb swelling in nursery.'
      },
      {
        phase: 'Flat Bed / BBF Preparation & Shallow Transplanting',
        timeline: 'December 1 to January 10',
        tasks: [
          'Prepare level flat beds (3m × 2m) or broad bed furrows with basal fertilizers incorporated.',
          'Trim long seedling roots and top 1/3rd leaf tips before transplanting.',
          'Transplant shallow at 2-3 cm depth at 15 cm × 10 cm spacing in moist soil.'
        ],
        precautions: 'Never transplant deeply (>3 cm); deep planting results in elongated bottle-shaped bulbs and split bulbs.'
      },
      {
        phase: 'Weed Management & Thrips Control',
        timeline: 'Day 10 to 45',
        tasks: [
          'Apply Oxyfluorfen 23.5% EC @ 150 ml/acre as post-emergence at 20 DAT for weed eradication.',
          'Scout for Onion Thrips (*Thrips tabaci*) hiding in leaf sheaths causing silver patches.',
          'Spray Fipronil 5% SC @ 350 ml/acre or Spinosad 45% SC @ 60 ml/acre if thrips population exceeds threshold.'
        ],
        precautions: 'Add non-ionic wetting agent (sticker) @ 0.5 ml/L with all sprays due to waxy onion foliage.'
      },
      {
        phase: 'Bulb Swelling & Purple Blotch Defense',
        timeline: 'Day 50 to 90',
        tasks: [
          'Maintain consistent light irrigations at 7-10 day intervals; avoid water stress.',
          'Complete all nitrogen top-dressings before 60 DAT.',
          'Spray Tebuconazole 25.9% EC @ 200 ml/acre or Difenoconazole @ 150 ml/acre for Purple Blotch (*Alternaria porri*).'
        ],
        precautions: 'Stop all nitrogen application after 60 DAT; late nitrogen causes thick necks and poor storage life.'
      },
      {
        phase: 'Neck Fall, Curing & Safe Storage',
        timeline: 'Day 95 to 135',
        tasks: [
          'Withhold irrigation 12-15 days prior to harvest when 20-25% tops start naturally lodging (*neck fall*).',
          'Harvest when 50-70% tops have fallen over by gently pulling bulbs.',
          'Field cure under windrows with leaves covering bulbs for 3-5 days to dry outer scale leaves.',
          'Cut tops leaving 2-2.5 cm neck attached to bulb; shade-cure in ventilated sheds for 10-12 days.'
        ],
        precautions: 'Never cut neck flush with the bulb; cutting too close creates entry for bacterial soft rot.'
      }
    ]
  },
  {
    id: 'potato',
    name: 'Potato',
    localName: 'आलू / બટાકા',
    scientificName: 'Solanum tuberosum',
    category: 'vegetables',
    season: 'rabi',
    durationDays: '90 - 110 Days',
    bestPracticingMonths: {
      sowing: 'October 15 to November 10 (Plains of North & Western India)',
      flowering: 'Tuber initiation: 30 - 45 Days',
      harvesting: 'January - March'
    },
    soilRequirement: {
      soilType: 'Loose, friable, well-aerated sandy loam to medium loam rich in organic matter',
      phRange: '5.2 - 6.5 pH (Slightly acidic helps prevent potato scab disease)',
      condition: 'Completely stone-free and deep pulverized seedbed. Heavy clay restricts tuber expansion and deforms shape.'
    },
    environmentalRequirements: {
      temperature: '16°C - 20°C for tuberization (>28°C stops tuber formation completely)',
      rainfall: 'Requires 400 - 500 mm through 5-7 scheduled furrows/drip irrigations',
      sunlight: 'Cool short winter days favor heavy tuber initiation'
    },
    seedRateAndSpacing: {
      seedRate: '1,000 - 1,200 kg certified seed tubers / acre (30-40 g size with 2-3 sprouted eyes)',
      spacing: 'Row-to-row on ridges: 60 cm × Plant-to-plant: 20 cm at 5-7 cm depth',
      seedTreatment: 'Treat tubers with Mancozeb @ 2.5g/L + Streptocycline @ 0.1g/L for 10 minutes; dry in shade before planting'
    },
    nutrientManagement: {
      basal: '10 tons FYM + 60 kg DAP + 50 kg MOP + 40 kg Urea + 10 kg Zinc Sulphate per acre',
      topDressing: 'Apply 40 kg Urea per acre at earthing up (30-35 DAP)',
      foliarSprays: '0.5% Potassium Nitrate (13:0:45) at 60 DAP boosts tuber enlargement and dry matter %'
    },
    economics: {
      expectedYield: '120 - 180 Quintals / acre (Table potato); 140 - 200 Quintals / acre (Processing varieties like Kufri Chipsona)',
      mandiRateRange: '₹1,100 - ₹2,200 / Quintal',
      costOfCultivation: '₹28,000 - ₹38,000 / acre (Seed tubers constitute 40-50% of cost)'
    },
    timelineSteps: [
      {
        phase: 'Cold Store Pre-Conditioning & Sprouting',
        timeline: 'October 1 to 15',
        tasks: [
          'Procure certified seed tubers (Kufri Pukhraj, Kufri Jyoti, Kufri Badshah, Kufri Chipsona) from cold storage 10-15 days prior to planting.',
          'Spread in thin layers in diffused light and well-ventilated room to initiate short, stout green sprouts.',
          'Cut larger tubers (>50g) lengthwise ensuring 2-3 viable eyes per cut piece; dip cut pieces in fungicide solution.'
        ],
        precautions: 'Never plant tubers straight out of cold storage without acclimatization.'
      },
      {
        phase: 'Ridge Planting & Furrow Setup',
        timeline: 'Day 0 to 5',
        tasks: [
          'Plough deep (20-25 cm) and harrow to create soft, fluffy seedbed.',
          'Open furrows 60 cm apart; apply basal fertilizer in furrows and cover with thin soil layer.',
          'Place sprouted seed tubers 20 cm apart with eyes facing upward; cover with ridges (8-10 cm high).'
        ],
        precautions: 'Avoid direct contact between seed tubers and chemical fertilizers.'
      },
      {
        phase: 'Earthing Up & Weed Control',
        timeline: 'Day 25 to 35',
        tasks: [
          'Perform mandatory earthing-up when plants reach 15-20 cm height (30-35 DAP).',
          'Draw soil from furrows onto ridges around plant stems to form wide, broad ridges.',
          'Apply 40 kg Urea per acre immediately before earthing-up.',
          'Apply post-emergence Metribuzin 70% WP @ 150g/acre on moist soil for broadleaf weeds.'
        ],
        precautions: 'Earthing up is crucial: tubers exposed to sunlight produce toxic solanine and turn green, becoming unsellable.'
      },
      {
        phase: 'Tuber Bulking & Late Blight Surveillance',
        timeline: 'Day 40 to 75',
        tasks: [
          'Maintain regular furrow irrigations at 8-10 days interval; water level should not exceed 2/3rd ridge height.',
          'Scout for Late Blight (*Phytophthora infestans*) water-soaked lesions on leaf margins.',
          'Preventive spray of Mancozeb 75% WP @ 2.5g/L; switch to Cymoxanil + Mancozeb (Curzate) @ 3g/L or Dimethomorph @ 1.5g/L upon disease onset.'
        ],
        precautions: 'Do not over-irrigate or allow ridge tops to submerge, which causes tuber rot.'
      },
      {
        phase: 'Dehaulming (Vine Cutting) & Curing',
        timeline: 'Day 80 to 105',
        tasks: [
          'Cut potato vines at ground level (*dehaulming*) 10-12 days prior to final harvesting.',
          'Leave tubers buried in dry soil for 10-12 days for skin curing and hardening.',
          'Dig out tubers using tractor potato digger or hand spades during mild dry weather.',
          'Store in heaps in cool shaded shed for 10 days for final curing before grading.'
        ],
        precautions: 'Harvesting with soft uncured skin causes peeling, bruising, and heavy cold store rot.'
      }
    ]
  },
  {
    id: 'maize',
    name: 'Maize / Corn',
    localName: 'मक्का / મકાઈ',
    scientificName: 'Zea mays',
    category: 'cereals',
    season: 'kharif',
    durationDays: '90 - 110 Days',
    bestPracticingMonths: {
      sowing: 'Kharif: June 15 - July 15 | Rabi: October - November | Spring: February',
      flowering: 'Tasseling & Silking: 45 - 60 Days',
      harvesting: 'September - October (Kharif)'
    },
    soilRequirement: {
      soilType: 'Deep, fertile, well-drained loamy sand to clay loam soils rich in organic matter',
      phRange: '6.0 - 7.5 pH',
      condition: 'Excellent drainage is vital; maize cannot tolerate water stagnation for even 24 hours in the seedling phase.'
    },
    environmentalRequirements: {
      temperature: '21°C - 30°C (>35°C during tasseling causes pollen desiccation and poor grain set)',
      rainfall: '500 - 750 mm; high water user during tasseling and silking stages',
      sunlight: 'Full bright sun; C4 plant with maximum photosynthetic efficiency'
    },
    seedRateAndSpacing: {
      seedRate: '7 - 8 kg/acre (Hybrids)',
      spacing: 'Row-to-row: 60 cm × Plant-to-plant: 20 cm at 4-5 cm depth',
      seedTreatment: 'Cyantraniliprole 19.8% + Thiamethoxam 19.8% (Fortenza Duo) @ 4ml/kg against Fall Armyworm'
    },
    nutrientManagement: {
      basal: '50 kg DAP + 30 kg MOP + 25 kg Urea + 10 kg Zinc Sulphate per acre',
      topDressing: 'Split 1: 35 kg Urea at knee-high stage (30 DAS); Split 2: 35 kg Urea at tasseling stage (55 DAS)',
      foliarSprays: '0.5% Zinc Sulphate or 19-19-19 foliar spray if interveinal striping appears'
    },
    economics: {
      expectedYield: '25 - 35 Quintals / acre (High yield single cross hybrids)',
      mandiRateRange: '₹2,090 - ₹2,500 / Quintal (MSP supported, high poultry demand)',
      costOfCultivation: '₹14,000 - ₹18,000 / acre'
    },
    timelineSteps: [
      {
        phase: 'Land Preparation & Ridge Bedding',
        timeline: 'June 5 to 20',
        tasks: [
          'Plough deep and harrow twice to create pulverized seedbed.',
          'Form ridges 60 cm apart to ensure water drainage during torrential monsoon rains.',
          'Incorporate 5 tonnes FYM per acre during penultimate harrowing.'
        ],
        precautions: 'Avoid sowing in flat beds in high rainfall zones to prevent waterlogging.'
      },
      {
        phase: 'Seed Sowing & Fall Armyworm Protection',
        timeline: 'Day 0 to 10',
        tasks: [
          'Dibble single seed per hill on ridges at 4-5 cm depth, 20 cm apart.',
          'Apply pre-emergence herbicide Atrazine 50% WP @ 500g/acre within 48 hours.',
          'Erect pheromone traps (5 traps/acre) for Fall Armyworm (*Spodoptera frugiperda*).'
        ],
        precautions: 'Do not apply Atrazine if intercropping with pulses.'
      },
      {
        phase: 'Knee-High Stage & 1st Top Dressing',
        timeline: 'Day 25 to 35',
        tasks: [
          'Apply 35 kg Urea per acre at knee-high stage (30-35 DAS).',
          'Perform earthing-up to bury fertilizer and support strong prop roots.',
          'Scout central whorls for FAW pinholes and frass; apply Chlorantraniliprole 18.5% SC @ 0.4 ml/L or Emamectin Benzoate 5% SG @ 0.4 g/L directly into whorls.'
        ],
        precautions: 'FAW larvae hide deep inside the plant whorl; direct the spray nozzle straight down into whorls.'
      },
      {
        phase: 'Tasseling, Silking & Cob Development',
        timeline: 'Day 50 to 75',
        tasks: [
          'Most critical moisture stage: Ensure adequate soil moisture during tassel emergence and silk emergence.',
          'Apply second top-dressing of 35 kg Urea per acre at tasseling.',
          'Maintain regular irrigation if monsoon rain fails during silking.'
        ],
        precautions: 'Moisture stress during silking delays silk emergence, causing poor fertilization and patchy grain rows on cobs.'
      },
      {
        phase: 'Maturity & Cob Harvesting',
        timeline: 'Day 85 to 110',
        tasks: [
          'Harvest when cob husk leaves turn paper-dry straw color and black layer forms at the base of grain kernel.',
          'De-husk cobs and sun-dry on clean floor for 3-4 days.',
          'Shell cobs using tractor maize sheller when kernel moisture drops to 14%.'
        ],
        precautions: 'Never store grains with >13% moisture to avoid aflatoxin mold and weevil attack.'
      }
    ]
  }
];
