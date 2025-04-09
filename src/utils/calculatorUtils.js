/**
 * Constants for water usage calculations (liters)
 */
const WATER_USAGE = {
  // Personal hygiene
  SHOWER_PER_MINUTE: 10,
  BATH_FULL: 80,
  TOILET_FLUSH: 6,
  FAUCET_PER_MINUTE: 6,
  TEETH_BRUSHING: 5,
  
  // Household
  DISHWASHER_LOAD: 15,
  WASHING_MACHINE_LOAD: 50,
  HAND_WASHING_DISHES: 20,
  
  // Diet (daily averages)
  MEAT_HEAVY_DIET: 5000,
  BALANCED_DIET: 3500,
  VEGETARIAN_DIET: 2500,
  VEGAN_DIET: 1700,
  
  // Food water footprints (liters per kg)
  RICE: 3400,
  WHEAT: 1300,
  PULSES: 4000,
  MILK: 1000, // Per liter
  CHICKEN: 4000,
  MUTTON: 8000,
  BEEF: 15000,
  VEGETABLES: 300,
  FRUITS: 800,
  
  // Outdoor
  GARDEN_WATERING_PER_MIN: 12,
  CAR_WASH: 150
};

/**
 * Calculate personal hygiene water usage
 */
function calculateHygieneUsage(userData) {
  let total = 0;
  
  // Shower usage
  if (userData.shower) {
    total += userData.shower * WATER_USAGE.SHOWER_PER_MINUTE;
  }
  
  // Bath usage (weekly converted to daily)
  if (userData.baths) {
    total += (userData.baths * WATER_USAGE.BATH_FULL) / 7;
  }
  
  // Toilet flushes
  if (userData.toiletFlushes) {
    total += userData.toiletFlushes * WATER_USAGE.TOILET_FLUSH;
  }
  
  // Teeth brushing (assume twice daily)
  total += 2 * WATER_USAGE.TEETH_BRUSHING;
  
  // Hand washing (assume 6 times daily for 30 seconds each)
  total += 6 * (WATER_USAGE.FAUCET_PER_MINUTE / 2);
  
  return Math.round(total);
}

/**
 * Calculate household water usage
 */
function calculateHouseholdUsage(userData) {
  let total = 0;
  
  // Dishwasher usage (weekly converted to daily)
  if (userData.dishwasher) {
    total += (userData.dishwasher * WATER_USAGE.DISHWASHER_LOAD) / 7;
  } else if (userData.handWashDishes) {
    // If no dishwasher, assume hand washing dishes (daily)
    total += userData.handWashDishes * WATER_USAGE.HAND_WASHING_DISHES;
  }
  
  // Laundry usage (weekly converted to daily)
  if (userData.laundry) {
    total += (userData.laundry * WATER_USAGE.WASHING_MACHINE_LOAD) / 7;
  }
  
  return Math.round(total);
}

/**
 * Calculate dietary water usage
 */
function calculateDietaryUsage(userData) {
  let total = 0;
  
  // Base water usage on diet type
  if (userData.diet === 'meat-heavy') {
    total += WATER_USAGE.MEAT_HEAVY_DIET;
  } else if (userData.diet === 'balanced') {
    total += WATER_USAGE.BALANCED_DIET;
  } else if (userData.diet === 'vegetarian') {
    total += WATER_USAGE.VEGETARIAN_DIET;
  } else if (userData.diet === 'vegan') {
    total += WATER_USAGE.VEGAN_DIET;
  } else {
    // Default to balanced if not specified
    total += WATER_USAGE.BALANCED_DIET;
  }
  
  // Additional water usage for specific food items
  if (userData.riceConsumption) {
    // Convert from kg per week to liters per day
    total += (userData.riceConsumption * WATER_USAGE.RICE) / 7;
  }
  
  if (userData.wheatConsumption) {
    total += (userData.wheatConsumption * WATER_USAGE.WHEAT) / 7;
  }
  
  if (userData.milkConsumption) {
    // Assuming daily consumption in liters
    total += userData.milkConsumption * WATER_USAGE.MILK;
  }
  
  if (userData.meatConsumption) {
    // Average of chicken and mutton per week
    total += (userData.meatConsumption * 6000) / 7;
  }
  
  return Math.round(total);
}

/**
 * Calculate outdoor water usage
 */
function calculateOutdoorUsage(userData) {
  let total = 0;
  
  // Garden watering (weekly converted to daily)
  if (userData.garden && userData.gardenDuration) {
    const weeklyUsage = userData.garden * userData.gardenDuration * WATER_USAGE.GARDEN_WATERING_PER_MIN;
    total += weeklyUsage / 7;
  }
  
  // Car washing (monthly converted to daily)
  if (userData.carWash) {
    total += (userData.carWash * WATER_USAGE.CAR_WASH) / 30;
  }
  
  return Math.round(total);
}

/**
 * Calculate total water usage from all categories
 */
exports.calculateTotalWaterUsage = (userData) => {
  // Calculate water usage by category
  const hygiene = calculateHygieneUsage(userData);
  const household = calculateHouseholdUsage(userData);
  const dietary = calculateDietaryUsage(userData);
  const outdoor = calculateOutdoorUsage(userData);
  
  // Calculate total
  const total = hygiene + household + dietary + outdoor;
  
  // Determine highest category
  const categories = {
    'Personal Hygiene': hygiene,
    'Household': household,
    'Diet': dietary,
    'Outdoor': outdoor
  };
  
  const highestCategory = Object.keys(categories).reduce((a, b) => 
    categories[a] > categories[b] ? a : b
  );
  
  // Create breakdown by percentage
  const percentages = {
    'Personal Hygiene': Math.round((hygiene / total) * 100),
    'Household': Math.round((household / total) * 100),
    'Diet': Math.round((dietary / total) * 100),
    'Outdoor': Math.round((outdoor / total) * 100)
  };
  
  // Calculate per-day, per-month, and per-year usage
  const dailyUsage = Math.round(total);
  const monthlyUsage = dailyUsage * 30;
  const yearlyUsage = dailyUsage * 365;
  
  // Calculate comparison with average consumption (4000 liters per day per person)
  const averageConsumption = 4000;
  const comparisonToAverage = Math.round((dailyUsage / averageConsumption) * 100);
  
  // Calculate dietary breakdown if specific food inputs are provided
  let dietaryBreakdown = null;
  if (userData.riceConsumption || userData.wheatConsumption || userData.milkConsumption || userData.meatConsumption) {
    dietaryBreakdown = {
      rice: userData.riceConsumption ? Math.round((userData.riceConsumption * WATER_USAGE.RICE) / 7) : 0,
      wheat: userData.wheatConsumption ? Math.round((userData.wheatConsumption * WATER_USAGE.WHEAT) / 7) : 0,
      milk: userData.milkConsumption ? Math.round(userData.milkConsumption * WATER_USAGE.MILK) : 0,
      meat: userData.meatConsumption ? Math.round((userData.meatConsumption * 6000) / 7) : 0
    };
  }
  
  return {
    total: dailyUsage,
    monthly: monthlyUsage,
    yearly: yearlyUsage,
    comparisonToAverage,
    breakdown: {
      hygiene,
      household,
      dietary,
      outdoor
    },
    percentages,
    highestCategory,
    dietaryBreakdown
  };
}; 