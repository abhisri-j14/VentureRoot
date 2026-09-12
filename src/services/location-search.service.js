/**
 * VentureRoot Location Intelligence & OpenStreetMap Geocoding Service
 * Combines a comprehensive master database of all Indian States & Districts
 * with real-time OpenStreetMap (Nominatim) search for hyper-local villages and blocks.
 */

// In-memory LRU search cache
const searchCache = new Map();
const CACHE_MAX_SIZE = 500;

// Master Directory of Indian States & UTs with their constituent districts
export const INDIAN_LOCATIONS_MASTER = [
  // Gujarat
  { state: "Gujarat", district: "Anand", popularTalukas: ["Anand", "Borsad", "Khambhat", "Petlad", "Sojitra", "Tarapur", "Umreth"], lat: 22.5645, lon: 72.9289 },
  { state: "Gujarat", district: "Ahmedabad", popularTalukas: ["Ahmedabad City", "Daskroi", "Sanand", "Dholka", "Bavla", "Viramgam"], lat: 23.0225, lon: 72.5714 },
  { state: "Gujarat", district: "Surat", popularTalukas: ["Surat City", "Chorasi", "Olpad", "Bardoli", "Kamrej", "Mahuva"], lat: 21.1702, lon: 72.8311 },
  { state: "Gujarat", district: "Vadodara", popularTalukas: ["Vadodara", "Padra", "Karjan", "Dabhoi", "Savli", "Vaghodia"], lat: 22.3072, lon: 73.1812 },
  { state: "Gujarat", district: "Rajkot", popularTalukas: ["Rajkot", "Gondal", "Jetpur", "Dhoraji", "Upleta", "Jasdan"], lat: 22.3039, lon: 70.8022 },
  { state: "Gujarat", district: "Bhavnagar", popularTalukas: ["Bhavnagar", "Palitana", "Talaja", "Mahuva", "Sihor", "Gariadhar"], lat: 21.7645, lon: 72.1519 },
  { state: "Gujarat", district: "Jamnagar", popularTalukas: ["Jamnagar", "Lalpur", "Kalavad", "Jamjodhpur", "Jodiya"], lat: 22.4707, lon: 70.0577 },
  { state: "Gujarat", district: "Gandhinagar", popularTalukas: ["Gandhinagar", "Kalol", "Dehgam", "Mansa"], lat: 23.2156, lon: 72.6369 },
  { state: "Gujarat", district: "Amreli", popularTalukas: ["Amreli", "Dhari", "Babra", "Savarkundla", "Rajula", "Jafrabad"], lat: 21.6032, lon: 71.2221 },
  { state: "Gujarat", district: "Bharuch", popularTalukas: ["Bharuch", "Ankleshwar", "Jambusar", "Hansot", "Amod"], lat: 21.7051, lon: 72.9959 },
  { state: "Gujarat", district: "Mehsana", popularTalukas: ["Mehsana", "Kadi", "Visnagar", "Unjha", "Vadnagar", "Vijapur"], lat: 23.5880, lon: 72.3693 },
  { state: "Gujarat", district: "Kutch", popularTalukas: ["Bhuj", "Gandhidham", "Anjar", "Mandvi", "Mundra", "Nakhatrana"], lat: 23.2420, lon: 69.6669 },
  { state: "Gujarat", district: "Navsari", popularTalukas: ["Navsari", "Jalalpore", "Chikhli", "Gandevi", "Vansda"], lat: 20.9467, lon: 72.9520 },
  { state: "Gujarat", district: "Valsad", popularTalukas: ["Valsad", "Pardi", "Vapi", "Dharampur", "Umbergaon"], lat: 20.5992, lon: 72.9342 },
  { state: "Gujarat", district: "Panchmahal", popularTalukas: ["Godhra", "Halol", "Kalol", "Shehra", "Ghoghamba"], lat: 22.7758, lon: 73.6149 },
  { state: "Gujarat", district: "Dahod", popularTalukas: ["Dahod", "Jhalod", "Limkheda", "Garbada", "Fatepura"], lat: 22.8340, lon: 74.2546 },
  { state: "Gujarat", district: "Surendranagar", popularTalukas: ["Wadhwan", "Dhrangadhra", "Chotila", "Limbdi", "Patdi"], lat: 22.7275, lon: 71.6372 },
  { state: "Gujarat", district: "Patan", popularTalukas: ["Patan", "Sidhpur", "Chanasma", "Radhanpur", "Sami"], lat: 23.8493, lon: 72.1266 },
  { state: "Gujarat", district: "Junagadh", popularTalukas: ["Junagadh", "Keshod", "Mangrol", "Manavadar", "Visavadar"], lat: 21.5222, lon: 70.4579 },
  { state: "Gujarat", district: "Porbandar", popularTalukas: ["Porbandar", "Ranavav", "Kutiyana"], lat: 21.6417, lon: 69.6293 },
  { state: "Gujarat", district: "Banaskantha", popularTalukas: ["Palanpur", "Deesa", "Dhanera", "Tharad", "Vav"], lat: 24.1724, lon: 72.4346 },
  { state: "Gujarat", district: "Sabarkantha", popularTalukas: ["Himatnagar", "Idar", "Prantij", "Talod", "Khedbrahma"], lat: 23.6039, lon: 72.9648 },
  { state: "Gujarat", district: "Aravalli", popularTalukas: ["Modasa", "Malpur", "Bayad", "Meghraj", "Bhiloda"], lat: 23.4619, lon: 73.3039 },
  { state: "Gujarat", district: "Morbi", popularTalukas: ["Morbi", "Wankaner", "Halvad", "Tankara", "Maliya"], lat: 22.8120, lon: 70.8384 },
  { state: "Gujarat", district: "Botad", popularTalukas: ["Botad", "Gadhada", "Barwala", "Ranpur"], lat: 22.1704, lon: 71.6669 },
  { state: "Gujarat", district: "Gir Somnath", popularTalukas: ["Veraval", "Talala", "Kodinar", "Una", "Sutrapada"], lat: 20.9042, lon: 70.3667 },

  // Maharashtra
  { state: "Maharashtra", district: "Pune", popularTalukas: ["Pune City", "Haveli", "Khed", "Shirur", "Baramati", "Maval", "Mulshi", "Ambegaon", "Indapur", "Daund", "Purandar", "Bhor", "Junnar", "Velhe"], lat: 18.5204, lon: 73.8567 },
  { state: "Maharashtra", district: "Mumbai City", popularTalukas: ["Colaba", "Fort", "Dadar", "Byculla", "Worli"], lat: 18.9388, lon: 72.8354 },
  { state: "Maharashtra", district: "Mumbai Suburban", popularTalukas: ["Andheri", "Bandra", "Borivali", "Kurla", "Malad", "Goregaon"], lat: 19.0760, lon: 72.8777 },
  { state: "Maharashtra", district: "Thane", popularTalukas: ["Thane", "Kalyan", "Ulhasnagar", "Bhiwandi", "Murbad", "Shahapur"], lat: 19.2183, lon: 72.9781 },
  { state: "Maharashtra", district: "Nagpur", popularTalukas: ["Nagpur Urban", "Nagpur Rural", "Kamptee", "Hingna", "Katol", "Ramtek", "Umred"], lat: 21.1458, lon: 79.0882 },
  { state: "Maharashtra", district: "Nashik", popularTalukas: ["Nashik", "Sinnar", "Niphad", "Malegaon", "Yeola", "Dindori", "Igatpuri"], lat: 19.9975, lon: 73.7898 },
  { state: "Maharashtra", district: "Chhatrapati Sambhaji Nagar", popularTalukas: ["Aurangabad", "Paithan", "Gangapur", "Vaijapur", "Kannad", "Sillod"], lat: 19.8762, lon: 75.3433 },
  { state: "Maharashtra", district: "Solapur", popularTalukas: ["Solapur North", "Solapur South", "Pandharpur", "Barshi", "Madha", "Mohol", "Karmala"], lat: 17.6599, lon: 75.9064 },
  { state: "Maharashtra", district: "Kolhapur", popularTalukas: ["Karvir", "Hatkanangle", "Shirol", "Radhanagari", "Kagal", "Panhala"], lat: 16.7050, lon: 74.2433 },
  { state: "Maharashtra", district: "Ahmednagar", popularTalukas: ["Ahmednagar", "Rahata", "Sangamner", "Kopargaon", "Shrirampur", "Nevasa", "Parner"], lat: 19.0952, lon: 74.7496 },
  { state: "Maharashtra", district: "Satara", popularTalukas: ["Satara", "Karad", "Wai", "Phaltan", "Koregaon", "Mahabaleshwar", "Patan"], lat: 17.6805, lon: 74.0183 },
  { state: "Maharashtra", district: "Ratnagiri", popularTalukas: ["Ratnagiri", "Khed", "Chiplun", "Dapoli", "Guhagar", "Lanja", "Rajapur", "Sangameshwar", "Mandangad"], lat: 16.9902, lon: 73.3120 },
  { state: "Maharashtra", district: "Raigad", popularTalukas: ["Alibag", "Panvel", "Pen", "Karjat", "Roha", "Mangaon", "Mahad"], lat: 18.6414, lon: 72.8722 },
  { state: "Maharashtra", district: "Amravati", popularTalukas: ["Amravati", "Achalpur", "Morshi", "Warud", "Chandur", "Daryapur"], lat: 20.9374, lon: 77.7796 },
  { state: "Maharashtra", district: "Nanded", popularTalukas: ["Nanded", "Mukhed", "Deglur", "Kandhar", "Hadgaon", "Kinwat"], lat: 19.1383, lon: 77.3210 },
  { state: "Maharashtra", district: "Jalgaon", popularTalukas: ["Jalgaon", "Bhusawal", "Chalisgaon", "Amalner", "Pachora", "Raver"], lat: 21.0077, lon: 75.5626 },
  { state: "Maharashtra", district: "Akola", popularTalukas: ["Akola", "Akot", "Balapur", "Murtizapur", "Patur"], lat: 20.7002, lon: 77.0082 },
  { state: "Maharashtra", district: "Latur", popularTalukas: ["Latur", "Ausa", "Nilanga", "Udgir", "Ahmedpur", "Chakur"], lat: 18.4088, lon: 76.5604 },
  { state: "Maharashtra", district: "Dhule", popularTalukas: ["Dhule", "Sakri", "Shirpur", "Sindkheda"], lat: 20.9042, lon: 74.7749 },
  { state: "Maharashtra", district: "Sangli", popularTalukas: ["Miraj", "Walwa", "Tasgaon", "Shirala", "Khanapur", "Jat"], lat: 16.8524, lon: 74.5815 },
  { state: "Maharashtra", district: "Palghar", popularTalukas: ["Palghar", "Vasai", "Dahanu", "Boisar", "Jawhar", "Wada"], lat: 19.6967, lon: 72.7699 },
  { state: "Maharashtra", district: "Sindhudurg", popularTalukas: ["Kudal", "Kankavli", "Sawantwadi", "Malvan", "Vengurla", "Devgad"], lat: 16.1197, lon: 73.7125 },

  // Tamil Nadu
  { state: "Tamil Nadu", district: "Coimbatore", popularTalukas: ["Coimbatore North", "Coimbatore South", "Pollachi", "Mettupalayam", "Sulur", "Annur"], lat: 11.0168, lon: 76.9558 },
  { state: "Tamil Nadu", district: "Chennai", popularTalukas: ["Egmore", "Mylapore", "T Nagar", "Guindy", "Ambattur", "Velachery"], lat: 13.0827, lon: 80.2707 },
  { state: "Tamil Nadu", district: "Madurai", popularTalukas: ["Madurai North", "Madurai South", "Melur", "Thirumangalam", "Usilampatti"], lat: 9.9252, lon: 78.1198 },
  { state: "Tamil Nadu", district: "Tiruchirappalli", popularTalukas: ["Tiruchirappalli", "Srirangam", "Lalgudi", "Manapparai", "Musiri"], lat: 10.7905, lon: 78.7047 },
  { state: "Tamil Nadu", district: "Salem", popularTalukas: ["Salem", "Attur", "Mettur", "Omalur", "Sankari", "Yercaud"], lat: 11.6643, lon: 78.1460 },
  { state: "Tamil Nadu", district: "Tiruppur", popularTalukas: ["Tiruppur", "Avinashi", "Dharapuram", "Kangeyam", "Udumalaipettai"], lat: 11.1085, lon: 77.3411 },
  { state: "Tamil Nadu", district: "Erode", popularTalukas: ["Erode", "Gobichettipalayam", "Bhavani", "Perundurai", "Sathyamangalam"], lat: 11.3410, lon: 77.7172 },
  { state: "Tamil Nadu", district: "Vellore", popularTalukas: ["Vellore", "Katpadi", "Gudiyatham", "Anaicut"], lat: 12.9165, lon: 79.1325 },
  { state: "Tamil Nadu", district: "Tirunelveli", popularTalukas: ["Tirunelveli", "Palayamkottai", "Ambasamudram", "Nanguneri"], lat: 8.7139, lon: 77.7567 },
  { state: "Tamil Nadu", district: "Thanjavur", popularTalukas: ["Thanjavur", "Kumbakonam", "Papanasam", "Pattukkottai"], lat: 10.7870, lon: 79.1378 },

  // Karnataka
  { state: "Karnataka", district: "Bengaluru Urban", popularTalukas: ["Bengaluru North", "Bengaluru South", "Bengaluru East", "Anekal", "Yelahanka"], lat: 12.9716, lon: 77.5946 },
  { state: "Karnataka", district: "Bengaluru Rural", popularTalukas: ["Devanahalli", "Doddaballapura", "Hosakote", "Nelamangala"], lat: 13.2924, lon: 77.7126 },
  { state: "Karnataka", district: "Mysuru", popularTalukas: ["Mysuru", "Nanjangud", "Hunsur", "T Narasipura", "Heggadadevankote"], lat: 12.2958, lon: 76.6394 },
  { state: "Karnataka", district: "Dharwad", popularTalukas: ["Hubballi", "Dharwad", "Kundgol", "Navalgund", "Kalghatgi"], lat: 15.4589, lon: 75.0078 },
  { state: "Karnataka", district: "Dakshina Kannada", popularTalukas: ["Mangaluru", "Bantwal", "Puttur", "Belthangady", "Sullia"], lat: 12.8703, lon: 74.8806 },
  { state: "Karnataka", district: "Belagavi", popularTalukas: ["Belagavi", "Gokak", "Chikkodi", "Bailhongal", "Athani"], lat: 15.8497, lon: 74.4977 },
  { state: "Karnataka", district: "Tumakuru", popularTalukas: ["Tumakuru", "Tiptur", "Kunigal", "Madhugiri", "Sira"], lat: 13.3379, lon: 77.1173 },
  { state: "Karnataka", district: "Shivamogga", popularTalukas: ["Shivamogga", "Bhadravathi", "Sagar", "Shikaripura", "Thirthahalli"], lat: 13.9299, lon: 75.5681 },

  // Rajasthan
  { state: "Rajasthan", district: "Jaipur", popularTalukas: ["Jaipur", "Sanganer", "Amber", "Chomu", "Phulera", "Kotputli", "Bassil", "Chaksu"], lat: 26.9124, lon: 75.7873 },
  { state: "Rajasthan", district: "Jodhpur", popularTalukas: ["Jodhpur", "Osian", "Phalodi", "Bilara", "Bhopalgarh", "Shergarh"], lat: 26.2389, lon: 73.0243 },
  { state: "Rajasthan", district: "Kota", popularTalukas: ["Kota", "Ladpura", "Sangod", "Ramganj Mandi", "Digod"], lat: 25.2138, lon: 75.8648 },
  { state: "Rajasthan", district: "Udaipur", popularTalukas: ["Girwa", "Mavli", "Vallabhnagar", "Salumbar", "Kherwara"], lat: 24.5854, lon: 73.7125 },
  { state: "Rajasthan", district: "Bikaner", popularTalukas: ["Bikaner", "Nokha", "Lunkaransar", "Kolayat", "Khajuwala"], lat: 28.0229, lon: 73.3119 },
  { state: "Rajasthan", district: "Ajmer", popularTalukas: ["Ajmer", "Kishangarh", "Beawar", "Nasirabad", "Kekri"], lat: 26.4499, lon: 74.6399 },
  { state: "Rajasthan", district: "Alwar", popularTalukas: ["Alwar", "Tijara", "Behror", "Kishangarh Bas", "Rajgarh"], lat: 27.5530, lon: 76.6346 },
  { state: "Rajasthan", district: "Bhilwara", popularTalukas: ["Bhilwara", "Shahpura", "Mandal", "Asind", "Jahazpur"], lat: 25.3216, lon: 74.6413 },

  // Uttar Pradesh
  { state: "Uttar Pradesh", district: "Lucknow", popularTalukas: ["Lucknow", "Mohanlalganj", "Bakshi Ka Talab", "Malihabad"], lat: 26.8467, lon: 80.9462 },
  { state: "Uttar Pradesh", district: "Kanpur Nagar", popularTalukas: ["Kanpur", "Bilhaur", "Ghatampur"], lat: 26.4499, lon: 80.3319 },
  { state: "Uttar Pradesh", district: "Varanasi", popularTalukas: ["Varanasi", "Pindra", "Rajatalab"], lat: 25.3176, lon: 82.9739 },
  { state: "Uttar Pradesh", district: "Agra", popularTalukas: ["Agra", "Fatehabad", "Kheragarh", "Etmadpur", "Bah"], lat: 27.1767, lon: 78.0081 },
  { state: "Uttar Pradesh", district: "Gautam Buddha Nagar", popularTalukas: ["Noida", "Dadri", "Jewar"], lat: 28.5355, lon: 77.3910 },
  { state: "Uttar Pradesh", district: "Ghaziabad", popularTalukas: ["Ghaziabad", "Modinagar", "Loni"], lat: 28.6692, lon: 77.4538 },
  { state: "Uttar Pradesh", district: "Prayagraj", popularTalukas: ["Sadar", "Phulpur", "Koraon", "Soraon", "Handia"], lat: 25.4358, lon: 81.8463 },
  { state: "Uttar Pradesh", district: "Gorakhpur", popularTalukas: ["Gorakhpur", "Campierganj", "Sahjanwa", "Bansgaon", "Khajni"], lat: 26.7606, lon: 83.3732 },
  { state: "Uttar Pradesh", district: "Meerut", popularTalukas: ["Meerut", "Mawana", "Sardhana"], lat: 28.9845, lon: 77.7064 },
  { state: "Uttar Pradesh", district: "Bareilly", popularTalukas: ["Bareilly", "Aonla", "Faridpur", "Baheri", "Nawabganj"], lat: 28.3670, lon: 79.4304 },

  // Delhi NCR
  { state: "Delhi", district: "Central Delhi", popularTalukas: ["Kotwali", "Civil Lines", "Karol Bagh"], lat: 28.6448, lon: 77.2167 },
  { state: "Delhi", district: "South Delhi", popularTalukas: ["Hauz Khas", "Mehrauli", "Saket"], lat: 28.5034, lon: 77.1856 },
  { state: "Delhi", district: "New Delhi", popularTalukas: ["Chanakyapuri", "Connaught Place", "Vasant Vihar"], lat: 28.6139, lon: 77.2090 },
  { state: "Delhi", district: "North West Delhi", popularTalukas: ["Rohini", "Saraswati Vihar", "Kanjhawala"], lat: 28.7180, lon: 77.0650 },
  { state: "Delhi", district: "East Delhi", popularTalukas: ["Gandhi Nagar", "Preet Vihar", "Mayur Vihar"], lat: 28.6279, lon: 77.2784 },

  // Madhya Pradesh
  { state: "Madhya Pradesh", district: "Indore", popularTalukas: ["Indore", "Mhow / Dr Ambedkar Nagar", "Sanwer", "Depalpur"], lat: 22.7196, lon: 75.8577 },
  { state: "Madhya Pradesh", district: "Bhopal", popularTalukas: ["Huzur", "Berasia", "Kolar"], lat: 23.2599, lon: 77.4126 },
  { state: "Madhya Pradesh", district: "Jabalpur", popularTalukas: ["Jabalpur", "Sihora", "Patan", "Panagar", "Kundam"], lat: 23.1815, lon: 79.9864 },
  { state: "Madhya Pradesh", district: "Gwalior", popularTalukas: ["Gwalior", "Dabra", "Bhitarwar", "Chinour"], lat: 26.2183, lon: 78.1828 },
  { state: "Madhya Pradesh", district: "Ujjain", popularTalukas: ["Ujjain", "Nagda", "Khachrod", "Mahidpur", "Tarana"], lat: 23.1765, lon: 75.7885 },

  // West Bengal
  { state: "West Bengal", district: "Kolkata", popularTalukas: ["Kolkata North", "Kolkata South", "Alipore", "Bhowanipore", "Behala"], lat: 22.5726, lon: 88.3639 },
  { state: "West Bengal", district: "Howrah", popularTalukas: ["Howrah", "Bally", "Uluberia", "Amta", "Shyampur"], lat: 22.5958, lon: 88.2636 },
  { state: "West Bengal", district: "North 24 Parganas", popularTalukas: ["Barasat", "Barrackpore", "Bidhannagar", "Basirhat", "Bongaon"], lat: 22.7210, lon: 88.4810 },
  { state: "West Bengal", district: "South 24 Parganas", popularTalukas: ["Alipore", "Baruipur", "Canning", "Diamond Harbour", "Kakdwip"], lat: 22.1645, lon: 88.4334 },
  { state: "West Bengal", district: "Hooghly", popularTalukas: ["Chinsurah", "Chandannagar", "Serampore", "Arambagh"], lat: 22.9015, lon: 88.3968 },
  { state: "West Bengal", district: "Darjeeling", popularTalukas: ["Darjeeling", "Kurseong", "Siliguri", "Mirik"], lat: 27.0410, lon: 88.2663 },

  // Kerala
  { state: "Kerala", district: "Ernakulam", popularTalukas: ["Kochi", "Kanayannur", "Aluva", "Paravur", "Kothamangalam", "Muvattupuzha"], lat: 9.9816, lon: 76.2999 },
  { state: "Kerala", district: "Thiruvananthapuram", popularTalukas: ["Thiruvananthapuram", "Neyyattinkara", "Nedumangad", "Chirayinkeezhu"], lat: 8.5241, lon: 76.9366 },
  { state: "Kerala", district: "Kozhikode", popularTalukas: ["Kozhikode", "Vadakara", "Koyilandy", "Thamarassery"], lat: 11.2588, lon: 75.7804 },
  { state: "Kerala", district: "Thrissur", popularTalukas: ["Thrissur", "Mukundapuram", "Chalakudy", "Kodungallur", "Chavakkad"], lat: 10.5276, lon: 76.2144 },

  // Telangana & Andhra Pradesh
  { state: "Telangana", district: "Hyderabad", popularTalukas: ["Charminar", "Golconda", "Secunderabad", "Khairatabad", "Musheerabad"], lat: 17.3850, lon: 78.4867 },
  { state: "Telangana", district: "Warangal", popularTalukas: ["Warangal", "Hanamkonda", "Kazipet", "Narsampet"], lat: 17.9689, lon: 79.5941 },
  { state: "Andhra Pradesh", district: "Visakhapatnam", popularTalukas: ["Visakhapatnam Urban", "Visakhapatnam Rural", "Gajuwaka", "Bheemunipatnam", "Anandapuram"], lat: 17.6868, lon: 83.2185 },
  { state: "Andhra Pradesh", district: "Krishna", popularTalukas: ["Vijayawada", "Machilipatnam", "Gudivada", "Nuzvid"], lat: 16.1875, lon: 81.1389 },
  { state: "Andhra Pradesh", district: "Guntur", popularTalukas: ["Guntur", "Tenali", "Mangalagiri", "Ponnur"], lat: 16.3067, lon: 80.4365 },

  // Punjab & Haryana
  { state: "Punjab", district: "Ludhiana", popularTalukas: ["Ludhiana East", "Ludhiana West", "Jagraon", "Khanna", "Samrala"], lat: 30.9010, lon: 75.8573 },
  { state: "Punjab", district: "Amritsar", popularTalukas: ["Amritsar I", "Amritsar II", "Ajnala", "Baba Bakala"], lat: 31.6340, lon: 74.8723 },
  { state: "Haryana", district: "Gurugram", popularTalukas: ["Gurugram", "Sohna", "Pataudi", "Badshahpur", "Manesar"], lat: 28.4595, lon: 77.0266 },
  { state: "Haryana", district: "Faridabad", popularTalukas: ["Faridabad", "Ballabgarh", "Badkhal"], lat: 28.4089, lon: 77.3178 },

  // Bihar & Odisha
  { state: "Bihar", district: "Patna", popularTalukas: ["Patna Sadar", "Danapur", "Barh", "Masaurhi", "Paliganj", "Bikram"], lat: 25.5941, lon: 85.1376 },
  { state: "Bihar", district: "Gaya", popularTalukas: ["Gaya Sadar", "Bodh Gaya", "Tekari", "Sherghati"], lat: 24.7914, lon: 85.0002 },
  { state: "Odisha", district: "Khordha", popularTalukas: ["Bhubaneswar", "Khordha", "Jatni", "Banapur", "Begunia"], lat: 20.1873, lon: 85.6264 },
  { state: "Odisha", district: "Cuttack", popularTalukas: ["Cuttack Sadar", "Choudwar", "Athagarh", "Salepur", "Banki"], lat: 20.4625, lon: 85.8828 },

  // Chhattisgarh & Jharkhand
  { state: "Chhattisgarh", district: "Raipur", popularTalukas: ["Raipur", "Arang", "Abhanpur", "Tilda Neora"], lat: 21.2514, lon: 81.6296 },
  { state: "Chhattisgarh", district: "Bijapur", popularTalukas: ["Bijapur", "Bhairamgarh", "Bhopalpatnam", "Usoor"], lat: 18.7900, lon: 80.8164 },
  { state: "Jharkhand", district: "Ranchi", popularTalukas: ["Ranchi", "Kanke", "Ratu", "Ormanjhi", "Bundu"], lat: 23.3441, lon: 85.3096 },
  { state: "Jharkhand", district: "East Singhbhum", popularTalukas: ["Jamshedpur", "Ghatshila", "Potka", "Golmuri"], lat: 22.8046, lon: 86.2029 },
];

/**
 * Filter Indian locations master dataset by user initials/search term
 */
function searchMasterLocations(term) {
  const cleanTerm = term.trim().toLowerCase();
  if (!cleanTerm) return [];

  const results = [];

  // 0. Direct Indian State & UT matching (prioritized at top when typing state initials)
  const ALL_INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Chandigarh", "Puducherry", "Andaman and Nicobar Islands",
    "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep"
  ];

  for (const stateName of ALL_INDIAN_STATES) {
    if (stateName.toLowerCase().startsWith(cleanTerm) || stateName.toLowerCase().includes(cleanTerm)) {
      const rep = INDIAN_LOCATIONS_MASTER.find((l) => l.state.toLowerCase() === stateName.toLowerCase());
      results.push({
        id: `master-state-${stateName.toLowerCase().replace(/\s+/g, "-")}`,
        label: `${stateName} (State)`,
        name: stateName,
        type: "STATE",
        source: "master",
        data: {
          village: rep ? rep.popularTalukas[0] || rep.district : stateName,
          block: rep ? rep.popularTalukas[0] || rep.district : stateName,
          district: rep ? rep.district : stateName,
          state: stateName,
          latitude: rep ? rep.lat : 20.5937,
          longitude: rep ? rep.lon : 78.9629,
        },
      });
    }
  }

  for (const loc of INDIAN_LOCATIONS_MASTER) {
    const districtLower = loc.district.toLowerCase();
    const stateLower = loc.state.toLowerCase();

    // 1. Direct district match (starts with or contains)
    if (districtLower.startsWith(cleanTerm) || districtLower.includes(cleanTerm)) {
      results.push({
        id: `master-${loc.state}-${loc.district}`,
        label: `${loc.district}, ${loc.state}`,
        name: loc.district,
        type: "DISTRICT",
        source: "master",
        data: {
          village: loc.popularTalukas[0] || loc.district,
          block: loc.popularTalukas[0] || loc.district,
          district: loc.district,
          state: loc.state,
          latitude: loc.lat,
          longitude: loc.lon,
        },
      });
    }

    // 2. Taluka / Sub-district match
    for (const taluka of loc.popularTalukas) {
      const talukaLower = taluka.toLowerCase();
      if (talukaLower.startsWith(cleanTerm) || talukaLower.includes(cleanTerm)) {
        results.push({
          id: `master-${loc.state}-${loc.district}-${taluka}`,
          label: `${taluka}, ${loc.district}, ${loc.state}`,
          name: taluka,
          type: "TALUKA",
          source: "master",
          data: {
            village: taluka,
            block: taluka,
            district: loc.district,
            state: loc.state,
            latitude: loc.lat,
            longitude: loc.lon,
          },
        });
      }
    }

    // 3. State match
    if (stateLower.startsWith(cleanTerm)) {
      results.push({
        id: `master-state-${loc.state}-${loc.district}`,
        label: `${loc.district}, ${loc.state}`,
        name: loc.district,
        type: "DISTRICT",
        source: "master",
        data: {
          village: loc.popularTalukas[0] || loc.district,
          block: loc.popularTalukas[0] || loc.district,
          district: loc.district,
          state: loc.state,
          latitude: loc.lat,
          longitude: loc.lon,
        },
      });
    }
  }

  // Deduplicate and rank
  const seen = new Set();
  const ranked = [];
  for (const item of results) {
    if (!seen.has(item.label)) {
      seen.add(item.label);
      ranked.push(item);
    }
    if (ranked.length >= 8) break;
  }

  return ranked;
}

/**
 * Real-time OpenStreetMap Nominatim Geocoding for India
 */
async function searchOpenStreetMap(term) {
  try {
    const encoded = encodeURIComponent(term.trim());
    const apiKey = process.env.OPENSTREETMAP_API_KEY || process.env.LOCATIONIQ_API_KEY;

    let url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&countrycodes=in&limit=8`;
    if (apiKey) {
      // If user configured a LocationIQ or Nominatim-compatible API key
      url += `&key=${encodeURIComponent(apiKey)}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s timeout for snappy UX

    const res = await fetch(url, {
      headers: {
        "User-Agent": "VentureRoot-App/1.0 (contact@ventureroot.in; India-MSME-Intelligence)",
        "Accept-Language": "en,hi",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[location-search] OSM returned status: ${res.status}`);
      return [];
    }

    const items = await res.json();
    if (!Array.isArray(items)) return [];

    return items.map((item) => {
      const addr = item.address || {};
      const state = addr.state || addr.state_district || "";
      const district =
        addr.state_district ||
        addr.district ||
        addr.county ||
        addr.city ||
        addr.town ||
        "";
      const block =
        addr.county ||
        addr.subdistrict ||
        addr.town ||
        addr.municipality ||
        district;
      const village =
        addr.village ||
        addr.town ||
        addr.suburb ||
        addr.city ||
        addr.neighbourhood ||
        item.name ||
        "";

      // Formulate clean, readable label
      const parts = [village, block, district, state].filter(
        (v, i, a) => v && a.indexOf(v) === i
      );
      const label = parts.length > 0 ? parts.join(", ") : item.display_name;

      return {
        id: `osm-${item.place_id || item.osm_id || Math.random()}`,
        label: label,
        name: item.name || village,
        type: item.type?.toUpperCase() || "LOCALITY",
        source: "openstreetmap",
        data: {
          village: village || block || district,
          block: block || district,
          district: district || state,
          state: state || district,
          pincode: addr.postcode || null,
          latitude: Number(item.lat),
          longitude: Number(item.lon),
        },
      };
    });
  } catch (err) {
    console.warn("[location-search] OpenStreetMap request error or timeout:", err.message);
    return [];
  }
}

/**
 * Public search function combining Master Index and OpenStreetMap
 */
export async function searchLocationsCombined({ query, limit = 8 }) {
  const cleanTerm = (query || "").trim();
  if (cleanTerm.length === 0) return [];

  // Check cache
  const cacheKey = cleanTerm.toLowerCase();
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey).slice(0, limit);
  }

  // 1. Instant match against comprehensive Indian Master Index
  const masterMatches = searchMasterLocations(cleanTerm);

  // 2. Query OpenStreetMap if query is >= 3 chars or if master had few matches
  let osmMatches = [];
  if (cleanTerm.length >= 3 || masterMatches.length < 3) {
    osmMatches = await searchOpenStreetMap(cleanTerm);
  }

  // 3. Merge results with master matches prioritized
  const merged = [];
  const seenLabels = new Set();

  for (const item of [...masterMatches, ...osmMatches]) {
    const key = item.label.toLowerCase();
    if (!seenLabels.has(key)) {
      seenLabels.add(key);
      merged.push(item);
    }
    if (merged.length >= limit) break;
  }

  // Save to cache
  if (searchCache.size > CACHE_MAX_SIZE) {
    const firstKey = searchCache.keys().next().value;
    searchCache.delete(firstKey);
  }
  searchCache.set(cacheKey, merged);

  return merged;
}
