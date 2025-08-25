// Random Verification Data Generator for Dashboard
// Generates realistic verification data for Indian states and districts

const indianStates = [
  { name: 'Uttar Pradesh', districts: ['Kanpur Nagar', 'Lucknow', 'Agra', 'Varanasi', 'Allahabad', 'Meerut'] },
  { name: 'Maharashtra', districts: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur'] },
  { name: 'Bihar', districts: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia'] },
  { name: 'West Bengal', districts: ['Kolkata', 'Howrah', 'Darjeeling', 'Jalpaiguri', 'Malda', 'Murshidabad'] },
  { name: 'Madhya Pradesh', districts: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar'] },
  { name: 'Tamil Nadu', districts: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli'] },
  { name: 'Rajasthan', districts: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur'] },
  { name: 'Karnataka', districts: ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga'] },
  { name: 'Gujarat', districts: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar'] },
  { name: 'Andhra Pradesh', districts: ['Hyderabad', 'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool'] },
]

const bankNames = [
  'State Bank of India',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'Bank of India',
  'Central Bank of India',
  'Indian Overseas Bank',
  'UCO Bank',
  'Bank of Maharashtra',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
]

const categories = ['Defence', 'Civil', 'Railways', 'Telecom', 'Postal']
const ageGroups = ['60-65', '66-70', '71-75', '76-80', 'Above 80']
const verificationMethods = ['fingerprint', 'iris', 'face', 'OTP']

// Major Indian cities with exact coordinates
const indianCities = [
  { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { name: 'Surat', lat: 21.1702, lng: 72.8311 },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { name: 'Kanpur', lat: 26.4499, lng: 80.3319 },
  { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  { name: 'Indore', lat: 22.7196, lng: 75.8577 },
  { name: 'Thane', lat: 19.2183, lng: 72.9781 },
  { name: 'Bhopal', lat: 23.2599, lng: 77.4126 },
  { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  { name: 'Pimpri', lat: 18.6298, lng: 73.7997 },
  { name: 'Patna', lat: 25.5941, lng: 85.1376 },
  { name: 'Vadodara', lat: 22.3072, lng: 73.1812 },
]

// Generate coordinates based on specific district/city and state
const generateCoordinatesForDistrict = (district, stateName) => {
  // Find the city that matches the district name
  const matchingCity = indianCities.find(
    (city) =>
      city.name.toLowerCase() === district.toLowerCase() ||
      district.toLowerCase().includes(city.name.toLowerCase()) ||
      city.name.toLowerCase().includes(district.toLowerCase()),
  )

  let baseCity
  if (matchingCity) {
    baseCity = matchingCity
  } else {
    // If no exact match, find cities within the same state or use state-appropriate fallback
    const stateBasedFallback = getStateBasedFallbackCity(stateName)
    baseCity = stateBasedFallback || indianCities[0] // Use first city as last resort
  }

  // Add small random variation around the city (±0.02 degrees for more accuracy)
  const latVariation = (Math.random() - 0.5) * 0.04 // ±0.02 degrees
  const lngVariation = (Math.random() - 0.5) * 0.04 // ±0.02 degrees

  const newLat = baseCity.lat + latVariation
  const newLng = baseCity.lng + lngVariation

  // Ensure coordinates are within India bounds
  if (newLat < 8.0 || newLat > 35.5 || newLng < 68.7 || newLng > 97.25) {
    // If outside bounds, use original city coordinates
    return {
      latitude: Number(baseCity.lat.toFixed(6)),
      longitude: Number(baseCity.lng.toFixed(6)),
    }
  }

  return {
    latitude: Number(newLat.toFixed(6)),
    longitude: Number(newLng.toFixed(6)),
  }
}

// Helper function to get state-appropriate fallback city
const getStateBasedFallbackCity = (stateName) => {
  const stateToCity = {
    'Uttar Pradesh': { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
    Maharashtra: { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
    Bihar: { name: 'Patna', lat: 25.5941, lng: 85.1376 },
    'West Bengal': { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    'Madhya Pradesh': { name: 'Bhopal', lat: 23.2599, lng: 77.4126 },
    'Tamil Nadu': { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
    Rajasthan: { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
    Karnataka: { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
    Gujarat: { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
    'Andhra Pradesh': { name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
  }

  return stateToCity[stateName]
}

// Generate coordinates strictly within India's political boundaries (fallback function)
const generateIndianCoordinates = () => {
  // Use real Indian cities with small variations for realistic distribution
  const city = indianCities[Math.floor(Math.random() * indianCities.length)]

  // Add small random variation around the city (±0.05 degrees max for better accuracy)
  const latVariation = (Math.random() - 0.5) * 0.1 // ±0.05 degrees
  const lngVariation = (Math.random() - 0.5) * 0.1 // ±0.05 degrees

  const newLat = city.lat + latVariation
  const newLng = city.lng + lngVariation

  // Ensure coordinates are within India bounds
  if (newLat < 8.0 || newLat > 35.5 || newLng < 68.7 || newLng > 97.25) {
    // If outside bounds, use original city coordinates
    return {
      latitude: Number(city.lat.toFixed(6)),
      longitude: Number(city.lng.toFixed(6)),
    }
  }

  return {
    latitude: Number(newLat.toFixed(6)),
    longitude: Number(newLng.toFixed(6)),
  }
}

// Generate random phone numbers
const generatePhoneNumbers = (count) => {
  const numbers = []
  for (let i = 0; i < count; i++) {
    numbers.push(`9${Math.floor(Math.random() * 900000000 + 100000000)}`)
  }
  return numbers
}

// Generate gender statistics
const generateGenderStats = (total, completed, pending) => {
  const maleTotal = Math.floor(total * (0.4 + Math.random() * 0.4)) // 40-80% male
  const femaleTotal = total - maleTotal

  const maleCompleted = Math.min(maleTotal, Math.floor(completed * (maleTotal / total)))
  const malePending = maleTotal - maleCompleted

  const femaleCompleted = completed - maleCompleted
  const femalePending = pending - malePending

  return {
    male: {
      total: maleTotal,
      completed: maleCompleted,
      pending: malePending,
      ...(malePending > 0 && { pending_numbers: generatePhoneNumbers(malePending) }),
    },
    female: {
      total: femaleTotal,
      completed: femaleCompleted,
      pending: femalePending,
      ...(femalePending > 0 && { pending_numbers: generatePhoneNumbers(femalePending) }),
    },
  }
}

// Generate verification methods data
const generateVerificationMethods = (total, completed) => {
  const methods = {}
  let remainingTotal = total
  let remainingCompleted = completed

  verificationMethods.forEach((method, index) => {
    if (index === verificationMethods.length - 1) {
      // Last method gets remaining
      methods[method] = {
        total: remainingTotal,
        completed: remainingCompleted,
      }
    } else {
      const methodTotal = Math.floor(remainingTotal * (0.2 + Math.random() * 0.4))
      const methodCompleted = Math.min(methodTotal, Math.floor(remainingCompleted * (methodTotal / remainingTotal)))

      methods[method] = {
        total: methodTotal,
        completed: methodCompleted,
      }

      remainingTotal -= methodTotal
      remainingCompleted -= methodCompleted
    }
  })

  return methods
}

// Generate categories for age group
const generateCategories = (total, completed, pending) => {
  const categoryCount = Math.floor(Math.random() * 3) + 2 // 2-4 categories
  const selectedCategories = categories.sort(() => 0.5 - Math.random()).slice(0, categoryCount)

  const categoriesData = []
  let remainingTotal = total
  let remainingCompleted = completed
  let remainingPending = pending

  selectedCategories.forEach((category, index) => {
    if (index === selectedCategories.length - 1) {
      // Last category gets remaining
      categoriesData.push({
        category,
        total: remainingTotal,
        completed: remainingCompleted,
        pending: remainingPending,
        gender_stats: generateGenderStats(remainingTotal, remainingCompleted, remainingPending),
      })
    } else {
      const catTotal = Math.floor(remainingTotal * (0.15 + Math.random() * 0.4))
      const catCompleted = Math.floor(catTotal * (0.8 + Math.random() * 0.15))
      const catPending = catTotal - catCompleted

      categoriesData.push({
        category,
        total: catTotal,
        completed: catCompleted,
        pending: catPending,
        gender_stats: generateGenderStats(catTotal, catCompleted, catPending),
      })

      remainingTotal -= catTotal
      remainingCompleted -= catCompleted
      remainingPending -= catPending
    }
  })

  return categoriesData
}

// Generate age group statistics
const generateAgeGroupStats = (total, completed, pending) => {
  const ageGroupCount = Math.floor(Math.random() * 3) + 2 // 2-4 age groups
  const selectedAgeGroups = ageGroups.sort(() => 0.5 - Math.random()).slice(0, ageGroupCount)

  const ageGroupStats = []
  let remainingTotal = total
  let remainingCompleted = completed
  let remainingPending = pending

  selectedAgeGroups.forEach((ageGroup, index) => {
    if (index === selectedAgeGroups.length - 1) {
      // Last age group gets remaining
      const categories = generateCategories(remainingTotal, remainingCompleted, remainingPending)
      ageGroupStats.push({
        age_group: ageGroup,
        total: remainingTotal,
        completed: remainingCompleted,
        pending: remainingPending,
        categories,
        verification_methods: generateVerificationMethods(remainingTotal, remainingCompleted),
      })
    } else {
      const ageTotal = Math.floor(remainingTotal * (0.2 + Math.random() * 0.4))
      const ageCompleted = Math.floor(ageTotal * (0.85 + Math.random() * 0.1))
      const agePending = ageTotal - ageCompleted

      const categories = generateCategories(ageTotal, ageCompleted, agePending)
      ageGroupStats.push({
        age_group: ageGroup,
        total: ageTotal,
        completed: ageCompleted,
        pending: agePending,
        categories,
        verification_methods: generateVerificationMethods(ageTotal, ageCompleted),
      })

      remainingTotal -= ageTotal
      remainingCompleted -= ageCompleted
      remainingPending -= agePending
    }
  })

  return ageGroupStats
}

// Generate bank data
const generateBankData = (locationName, pincode, district, stateName) => {
  const bankCount = Math.floor(Math.random() * 3) + 1 // 1-3 banks per location
  const banks = []

  for (let i = 0; i < bankCount; i++) {
    const bankName = bankNames[Math.floor(Math.random() * bankNames.length)]
    const total = Math.floor(Math.random() * 300) + 100 // 100-400 total
    const completed = Math.floor(total * (0.8 + Math.random() * 0.15)) // 80-95% completion
    const pending = total - completed

    banks.push({
      bank_id: `B${String(Math.floor(Math.random() * 9000) + 1000)}`,
      bank_name: bankName,
      branch_name: `${locationName} ${['Main', 'Central', 'Branch', 'Regional'][Math.floor(Math.random() * 4)]}`,
      geo_coordinates: generateCoordinatesForDistrict(district, stateName),
      total,
      completed,
      pending,
      age_group_stats: generateAgeGroupStats(total, completed, pending),
      verification_methods: generateVerificationMethods(total, completed),
    })
  }

  return banks
}

// Generate location data
const generateLocationData = (district, stateName) => {
  const locationCount = Math.floor(Math.random() * 3) + 2 // 2-4 locations per district
  const locations = []

  for (let i = 0; i < locationCount; i++) {
    const locationName = `${district} ${['Central', 'East', 'West', 'North', 'South'][i] || 'Main'}`
    const pincode = String(Math.floor(Math.random() * 900000) + 100000)

    locations.push({
      location: locationName,
      pincode,
      banks: generateBankData(locationName, pincode, district, stateName),
    })
  }

  return locations
}

// Main function to generate complete verification data
export const generateVerificationData = () => {
  const states = []

  indianStates.forEach((stateInfo) => {
    const districts = []

    stateInfo.districts.forEach((district) => {
      districts.push({
        district,
        locations: generateLocationData(district, stateInfo.name),
      })
    })

    states.push({
      state: stateInfo.name,
      districts,
    })
  })

  return {
    country: 'India',
    states,
    generated_at: new Date().toISOString(),
    total_states: states.length,
    total_districts: states.reduce((sum, state) => sum + state.districts.length, 0),
    total_locations: states.reduce(
      (sum, state) => sum + state.districts.reduce((distSum, dist) => distSum + dist.locations.length, 0),
      0,
    ),
  }
}

// Function to get aggregated data for map visualization
export const getMapVisualizationData = (data) => {
  const mapData = []

  data.states.forEach((state) => {
    state.districts.forEach((district) => {
      district.locations.forEach((location) => {
        location.banks.forEach((bank) => {
          mapData.push({
            state: state.state,
            district: district.district,
            location: location.location,
            bank_name: bank.bank_name,
            coordinates: bank.geo_coordinates,
            total: bank.total,
            completed: bank.completed,
            pending: bank.pending,
            completion_rate: ((bank.completed / bank.total) * 100).toFixed(1),
          })
        })
      })
    })
  })

  return mapData
}

// Export default function for easy import
export default {
  generateVerificationData,
  getMapVisualizationData,
}
