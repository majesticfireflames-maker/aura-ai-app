// ==================== CALORIE_ESTIMATION.js ====================
// Import this file in your Nutrition and Fitness pages

/**
 * COMPLETE CALORIE ESTIMATION MODULE
 * Handles ANY food or workout input with intelligent estimation
 */

// ==================== NUTRITION CALORIE ESTIMATION ====================

/**
 * Estimate calories for ANY food item based on name and quantity
 * @param {string} foodName - Name of the food (can include quantity like "2 eggs", "chicken breast 200g")
 * @returns {number} - Estimated calories
 */
export const estimateFoodCalories = (foodName) => {
  if (!foodName || typeof foodName !== 'string') return 250;
  
  const originalInput = foodName;
  const food = foodName.toLowerCase().trim();
  
  // Extract quantity if present (e.g., "2 eggs", "200g chicken")
  let quantity = 1;
  let quantityMultiplier = 1;
  let unit = 'serving';
  
  // Check for numbers at the beginning
  const numberMatch = food.match(/^(\d+(?:\.\d+)?)\s*([a-z]*)\s+(.+)$/);
  if (numberMatch) {
    quantity = parseFloat(numberMatch[1]);
    unit = numberMatch[2] || 'serving';
    const foodItem = numberMatch[3];
    
    // Adjust multiplier based on unit
    if (unit === 'g' || unit === 'gram' || unit === 'grams') {
      quantityMultiplier = quantity / 100; // Most values are per 100g
    } else if (unit === 'kg' || unit === 'kilo' || unit === 'kilos') {
      quantityMultiplier = quantity * 10; // per 100g * 10 = per kg
    } else if (unit === 'lb' || unit === 'lbs' || unit === 'pound' || unit === 'pounds') {
      quantityMultiplier = quantity * 4.5; // approx per 100g
    } else if (unit === 'oz' || unit === 'ounce' || unit === 'ounces') {
      quantityMultiplier = quantity * 2.8; // approx per 100g
    } else {
      // Assume it's number of items (e.g., "2 eggs")
      quantityMultiplier = quantity;
    }
    
    // Recursively estimate the food item without the quantity
    return estimateFoodCalories(foodItem) * quantityMultiplier;
  }
  
  // Check for "with" or "and" combinations
  if (food.includes(' with ') || food.includes(' and ')) {
    const parts = food.split(/\s+(?:with|and)\s+/);
    let totalCalories = 0;
    parts.forEach(part => {
      totalCalories += estimateFoodCalories(part);
    });
    return Math.round(totalCalories * 0.9); // 10% reduction for combination meals
  }
  
  // ========== COMPREHENSIVE FOOD DATABASE ==========
  
  // PROTEIN FOODS
  if (food.includes('chicken')) {
    if (food.includes('breast')) return 165 * 1.65; // per 100g
    if (food.includes('thigh')) return 210 * 1.65;
    if (food.includes('wing')) return 200 * 1.65;
    if (food.includes('fried')) return 250 * 1.65;
    if (food.includes('grilled')) return 165 * 1.65;
    return 200 * 1.65; // default chicken
  }
  
  if (food.includes('beef') || food.includes('steak')) {
    if (food.includes('ribeye')) return 270 * 1.65;
    if (food.includes('sirloin')) return 210 * 1.65;
    if (food.includes('tenderloin')) return 180 * 1.65;
    if (food.includes('ground') || food.includes('mince')) return 250 * 1.65;
    if (food.includes('burger')) return 280 * 1.65;
    return 220 * 1.65;
  }
  
  if (food.includes('pork')) {
    if (food.includes('chop')) return 240 * 1.65;
    if (food.includes('loin')) return 200 * 1.65;
    if (food.includes('belly')) return 350 * 1.65;
    return 210 * 1.65;
  }
  
  if (food.includes('fish') || food.includes('seafood')) {
    if (food.includes('salmon')) return 208 * 1.65;
    if (food.includes('tuna')) return 184 * 1.65;
    if (food.includes('cod')) return 105 * 1.65;
    if (food.includes('tilapia')) return 128 * 1.65;
    if (food.includes('shrimp') || food.includes('prawn')) return 120 * 1.65;
    if (food.includes('crab')) return 130 * 1.65;
    if (food.includes('lobster')) return 140 * 1.65;
    return 150 * 1.65;
  }
  
  if (food.includes('egg') || food.includes('eggs')) {
    if (food.includes('omelette')) return 200;
    if (food.includes('fried')) return 160;
    if (food.includes('scrambled')) return 180;
    if (food.includes('boiled') || food.includes('hard')) return 140;
    if (food.includes('poached')) return 140;
    return 140; // per egg
  }
  
  // CARBS & GRAINS
  if (food.includes('rice')) {
    if (food.includes('fried')) return 250 * 1.65;
    if (food.includes('brown')) return 215 * 1.65;
    if (food.includes('white')) return 205 * 1.65;
    if (food.includes('jasmine')) return 205 * 1.65;
    if (food.includes('basmati')) return 210 * 1.65;
    return 200 * 1.65;
  }
  
  if (food.includes('pasta') || food.includes('spaghetti') || food.includes('noodle')) {
    if (food.includes('whole wheat')) return 220 * 1.65;
    if (food.includes('with sauce')) return 280 * 1.65;
    if (food.includes('carbonara')) return 350 * 1.65;
    if (food.includes('bolognese')) return 320 * 1.65;
    if (food.includes('ramen')) return 300 * 1.65;
    return 250 * 1.65;
  }
  
  if (food.includes('bread') || food.includes('toast') || food.includes('sandwich')) {
    if (food.includes('white')) return 120;
    if (food.includes('whole wheat') || food.includes('brown')) return 110;
    if (food.includes('rye')) return 100;
    if (food.includes('sourdough')) return 120;
    if (food.includes('baguette')) return 150;
    if (food.includes('roll') || food.includes('bun')) return 140;
    if (food.includes('sandwich')) {
      if (food.includes('chicken')) return 350;
      if (food.includes('tuna')) return 320;
      if (food.includes('ham')) return 300;
      if (food.includes('cheese')) return 280;
      return 250;
    }
    return 120;
  }
  
  if (food.includes('potato') || food.includes('fries') || food.includes('chips')) {
    if (food.includes('french') || food.includes('fries')) return 320 * 1.65;
    if (food.includes('baked')) return 160 * 1.65;
    if (food.includes('mashed')) return 210 * 1.65;
    if (food.includes('roasted')) return 190 * 1.65;
    if (food.includes('potato chips')) return 550 * 1.65;
    return 200 * 1.65;
  }
  
  // VEGETABLES
  if (food.includes('salad')) {
    if (food.includes('caesar')) return 250;
    if (food.includes('garden') || food.includes('green')) return 100;
    if (food.includes('chicken')) return 280;
    if (food.includes('tuna')) return 220;
    if (food.includes('pasta')) return 300;
    return 150;
  }
  
  const vegetables = {
    'broccoli': 55,
    'spinach': 23,
    'kale': 50,
    'lettuce': 15,
    'cucumber': 15,
    'tomato': 18,
    'carrot': 41,
    'bell pepper': 30,
    'onion': 40,
    'garlic': 4,
    'mushroom': 22,
    'zucchini': 17,
    'cauliflower': 25,
    'cabbage': 25,
    'celery': 16,
    'asparagus': 20,
    'green beans': 31,
    'peas': 81,
    'corn': 86,
  };
  
  for (const [veg, cals] of Object.entries(vegetables)) {
    if (food.includes(veg)) return cals * 1.65; // per 100g
  }
  
  // FRUITS
  const fruits = {
    'apple': 95,
    'banana': 105,
    'orange': 70,
    'strawberry': 50,
    'blueberry': 85,
    'raspberry': 65,
    'grape': 100,
    'watermelon': 85,
    'pineapple': 80,
    'mango': 150,
    'peach': 60,
    'pear': 100,
    'kiwi': 42,
    'avocado': 240,
    'lemon': 20,
    'lime': 20,
    'coconut': 160,
    'dates': 280,
    'fig': 75,
  };
  
  for (const [fruit, cals] of Object.entries(fruits)) {
    if (food.includes(fruit)) return cals;
  }
  
  // FAST FOOD / RESTAURANT
  if (food.includes('pizza')) {
    if (food.includes('pepperoni')) return 350;
    if (food.includes('margherita')) return 250;
    if (food.includes('veggie')) return 240;
    if (food.includes('cheese')) return 280;
    if (food.includes('slice')) return 300;
    return 300;
  }
  
  if (food.includes('burger')) {
    if (food.includes('cheese')) return 350;
    if (food.includes('double')) return 550;
    if (food.includes('chicken')) return 380;
    if (food.includes('veggie')) return 300;
    return 320;
  }
  
  if (food.includes('taco') || food.includes('burrito')) {
    if (food.includes('taco')) return 200;
    if (food.includes('burrito')) return 400;
    return 250;
  }
  
  if (food.includes('sushi')) {
    if (food.includes('roll')) return 300;
    if (food.includes('nigiri')) return 100;
    if (food.includes('sashimi')) return 50;
    return 250;
  }
  
  // SNACKS & DESSERTS
  if (food.includes('cookie') || food.includes('biscuit')) {
    if (food.includes('chocolate chip')) return 150;
    if (food.includes('oatmeal')) return 130;
    return 120;
  }
  
  if (food.includes('cake')) {
    if (food.includes('chocolate')) return 350;
    if (food.includes('cheese')) return 400;
    if (food.includes('vanilla')) return 300;
    return 300;
  }
  
  if (food.includes('ice cream')) {
    if (food.includes('vanilla')) return 200;
    if (food.includes('chocolate')) return 210;
    return 200;
  }
  
  if (food.includes('chocolate') || food.includes('candy')) {
    if (food.includes('bar')) return 250;
    return 150;
  }
  
  if (food.includes('chips') || food.includes('crisps')) return 150;
  
  // BEVERAGES
  if (food.includes('coffee') || food.includes('latte') || food.includes('cappuccino')) {
    if (food.includes('black')) return 5;
    if (food.includes('with milk')) return 50;
    if (food.includes('latte')) return 120;
    if (food.includes('cappuccino')) return 100;
    if (food.includes('mocha')) return 200;
    return 100;
  }
  
  if (food.includes('tea')) {
    if (food.includes('green')) return 5;
    if (food.includes('black')) return 5;
    if (food.includes('with milk')) return 30;
    if (food.includes('bubble') || food.includes('boba')) return 300;
    return 5;
  }
  
  if (food.includes('soda') || food.includes('coke') || food.includes('pepsi')) {
    if (food.includes('diet') || food.includes('zero')) return 0;
    return 140;
  }
  
  if (food.includes('juice')) {
    if (food.includes('orange')) return 110;
    if (food.includes('apple')) return 120;
    if (food.includes('grape')) return 150;
    return 120;
  }
  
  if (food.includes('smoothie')) {
    if (food.includes('protein')) return 300;
    if (food.includes('fruit')) return 250;
    return 250;
  }
  
  if (food.includes('milk')) {
    if (food.includes('whole')) return 150;
    if (food.includes('skim') || food.includes('fat-free')) return 90;
    if (food.includes('soy')) return 100;
    if (food.includes('almond')) return 40;
    if (food.includes('oat')) return 120;
    return 150;
  }
  
  if (food.includes('beer')) return 150;
  if (food.includes('wine')) {
    if (food.includes('red')) return 125;
    if (food.includes('white')) return 120;
    return 120;
  }
  
  // SOUPS
  if (food.includes('soup')) {
    if (food.includes('chicken')) return 150;
    if (food.includes('tomato')) return 120;
    if (food.includes('vegetable')) return 100;
    return 120;
  }
  
  // DEFAULT FALLBACK - analyze the input
  // Check for meal type keywords
  if (food.includes('breakfast')) return 400;
  if (food.includes('lunch')) return 600;
  if (food.includes('dinner')) return 700;
  if (food.includes('snack')) return 200;
  if (food.includes('meal')) return 500;
  
  // Check for portion indicators
  if (food.includes('small')) return 150;
  if (food.includes('medium') || food.includes('regular')) return 250;
  if (food.includes('large') || food.includes('big')) return 400;
  
  // Check for cooking methods
  if (food.includes('fried') || food.includes('crispy')) return 350;
  if (food.includes('grilled') || food.includes('roasted')) return 200;
  if (food.includes('baked')) return 180;
  if (food.includes('steamed')) return 150;
  if (food.includes('raw') || food.includes('fresh')) return 100;
  
  // Ultimate fallback - return a reasonable average
  console.log(`⚠️ Unknown food: "${foodName}", using default 250 calories`);
  return 250;
};

/**
 * Format calories with appropriate unit
 * @param {number} calories 
 * @returns {string}
 */
export const formatCalories = (calories) => {
  if (!calories || isNaN(calories)) return '0 cal';
  return `${Math.round(calories)} cal`;
};

/**
 * Get nutrition summary for a meal
 * @param {Array} meals 
 * @returns {object}
 */
export const getNutritionSummary = (meals) => {
  const total = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const average = meals.length > 0 ? total / meals.length : 0;
  
  return {
    total,
    average,
    count: meals.length,
    byMealType: meals.reduce((acc, meal) => {
      const type = meal.type || 'meal';
      if (!acc[type]) acc[type] = { count: 0, calories: 0 };
      acc[type].count++;
      acc[type].calories += meal.calories || 0;
      return acc;
    }, {})
  };
};

// ==================== FITNESS CALORIE ESTIMATION ====================

/**
 * Estimate calories burned for ANY workout
 * @param {string} workoutName - Name/type of workout
 * @param {number} duration - Duration in minutes
 * @param {number} weight - User weight in kg (optional, default 70)
 * @returns {number} - Estimated calories burned
 */
export const estimateWorkoutCalories = (workoutName, duration, weight = 70) => {
  if (!workoutName || !duration) return 0;
  
  const workout = workoutName.toLowerCase().trim();
  const minutes = parseInt(duration) || 30;
  
  // Base MET values (Metabolic Equivalent of Task)
  // Calories burned = MET * weight (kg) * time (hours)
  let met = 5; // Default moderate exercise
  
  // ========== COMPREHENSIVE WORKOUT DATABASE ==========
  
  // RUNNING / JOGGING
  if (workout.includes('run') || workout.includes('jog')) {
    if (workout.includes('sprint')) met = 15;
    else if (workout.includes('fast') || workout.includes('speed')) met = 12;
    else if (workout.includes('slow') || workout.includes('easy')) met = 8;
    else if (workout.includes('marathon') || workout.includes('long')) met = 10;
    else if (workout.includes('trail') || workout.includes('off-road')) met = 11;
    else met = 10;
  }
  
  // WALKING
  else if (workout.includes('walk')) {
    if (workout.includes('brisk') || workout.includes('fast')) met = 4.5;
    else if (workout.includes('slow') || workout.includes('leisurely')) met = 2.5;
    else if (workout.includes('race') || workout.includes('speed')) met = 5.5;
    else if (workout.includes('nordic') || workout.includes('pole')) met = 5;
    else met = 3.5;
  }
  
  // CYCLING / BIKING
  else if (workout.includes('cycle') || workout.includes('bike') || workout.includes('cycling')) {
    if (workout.includes('spin') || workout.includes('indoor')) met = 8.5;
    else if (workout.includes('mountain') || workout.includes('mtb')) met = 9;
    else if (workout.includes('road') || workout.includes('racing')) met = 10;
    else if (workout.includes('slow') || workout.includes('leisurely')) met = 4;
    else if (workout.includes('stationary')) met = 7;
    else met = 7.5;
  }
  
  // SWIMMING
  else if (workout.includes('swim') || workout.includes('swimming')) {
    if (workout.includes('lap') || workout.includes('freestyle')) met = 8;
    else if (workout.includes('breaststroke')) met = 10;
    else if (workout.includes('backstroke')) met = 8;
    else if (workout.includes('butterfly')) met = 12;
    else if (workout.includes('treading') || workout.includes('water')) met = 4;
    else met = 7;
  }
  
  // YOGA / PILATES
  else if (workout.includes('yoga')) {
    if (workout.includes('hot') || workout.includes('bikram')) met = 5;
    else if (workout.includes('power') || workout.includes('vinyasa')) met = 4;
    else if (workout.includes('restorative') || workout.includes('gentle')) met = 2;
    else if (workout.includes('ashtanga')) met = 5;
    else met = 3;
  }
  else if (workout.includes('pilates')) {
    if (workout.includes('reformer')) met = 3.5;
    else met = 3;
  }
  
  // GYM / WEIGHT TRAINING
  else if (workout.includes('weight') || workout.includes('lift') || workout.includes('strength')) {
    if (workout.includes('heavy') || workout.includes('power')) met = 6;
    else if (workout.includes('light') || workout.includes('toning')) met = 3;
    else if (workout.includes('circuit')) met = 8;
    else if (workout.includes('crossfit')) met = 12;
    else if (workout.includes('bodybuilding')) met = 5;
    else met = 4.5;
  }
  
  // HIIT / INTERVAL TRAINING
  else if (workout.includes('hiit') || workout.includes('interval') || workout.includes('tabata')) {
    if (workout.includes('low') || workout.includes('beginner')) met = 8;
    else met = 12;
  }
  
  // CARDIO MACHINES
  else if (workout.includes('elliptical')) met = 6;
  else if (workout.includes('treadmill')) {
    if (workout.includes('incline')) met = 8;
    else met = 7;
  }
  else if (workout.includes('stair') || workout.includes('step')) {
    if (workout.includes('machine') || workout.includes('climber')) met = 9;
    else met = 8;
  }
  else if (workout.includes('row') || workout.includes('rowing')) met = 7;
  
  // SPORTS
  else if (workout.includes('basketball')) {
    if (workout.includes('game') || workout.includes('playing')) met = 8;
    else met = 6.5;
  }
  else if (workout.includes('soccer') || workout.includes('football')) met = 8;
  else if (workout.includes('tennis')) {
    if (workout.includes('singles')) met = 8;
    else if (workout.includes('doubles')) met = 6;
    else met = 7;
  }
  else if (workout.includes('golf')) {
    if (workout.includes('walking')) met = 4.5;
    else met = 3.5;
  }
  else if (workout.includes('boxing') || workout.includes('kickboxing')) {
    if (workout.includes('sparring')) met = 9;
    else if (workout.includes('bag') || workout.includes('punch')) met = 7;
    else met = 8;
  }
  else if (workout.includes('martial') || workout.includes('karate') || workout.includes('taekwondo')) met = 8;
  else if (workout.includes('dance') || workout.includes('zumba')) {
    if (workout.includes('hip hop')) met = 6;
    if (workout.includes('ballroom')) met = 4;
    else met = 5.5;
  }
  else if (workout.includes('hiking')) {
    if (workout.includes('uphill') || workout.includes('mountain')) met = 7;
    else met = 5;
  }
  else if (workout.includes('ski') || workout.includes('snowboard')) {
    if (workout.includes('downhill')) met = 6;
    else met = 5;
  }
  else if (workout.includes('skate') || workout.includes('roller')) met = 7;
  
  // INTENSITY MODIFIERS
  if (workout.includes('intense') || workout.includes('hard') || workout.includes('vigorous')) {
    met *= 1.3;
  }
  if (workout.includes('light') || workout.includes('easy') || workout.includes('gentle')) {
    met *= 0.7;
  }
  if (workout.includes('moderate') || workout.includes('medium')) {
    met *= 1.0;
  }
  
  // Calculate calories burned
  // MET * weight(kg) * time(hours)
  const hours = minutes / 60;
  const calories = Math.round(met * weight * hours);
  
  // Ensure minimum calories
  return Math.max(calories, Math.round(minutes * 2)); // At least 2 cal per minute
};

/**
 * Get workout intensity level
 * @param {string} workoutName 
 * @returns {string} - 'Low', 'Medium', or 'High'
 */
export const getWorkoutIntensity = (workoutName) => {
  if (!workoutName) return 'Medium';
  
  const workout = workoutName.toLowerCase();
  
  const highIntensity = ['sprint', 'hiit', 'interval', 'tabata', 'crossfit', 'intense', 'hard', 'vigorous', 'heavy', 'power', 'boxing', 'sparring', 'butterfly', 'race', 'competition'];
  const lowIntensity = ['walk', 'light', 'gentle', 'slow', 'leisurely', 'restorative', 'easy', 'stretch', 'recovery', 'yoga', 'pilates', 'tai chi'];
  
  for (const term of highIntensity) {
    if (workout.includes(term)) return 'High';
  }
  
  for (const term of lowIntensity) {
    if (workout.includes(term)) return 'Low';
  }
  
  return 'Medium';
};

/**
 * Get workout category
 * @param {string} workoutName 
 * @returns {string}
 */
export const getWorkoutCategory = (workoutName) => {
  if (!workoutName) return 'Other';
  
  const workout = workoutName.toLowerCase();
  
  if (workout.includes('run') || workout.includes('jog') || workout.includes('walk')) return 'Cardio';
  if (workout.includes('cycle') || workout.includes('bike')) return 'Cycling';
  if (workout.includes('swim')) return 'Swimming';
  if (workout.includes('yoga')) return 'Yoga';
  if (workout.includes('weight') || workout.includes('lift') || workout.includes('strength')) return 'Strength';
  if (workout.includes('hiit') || workout.includes('interval')) return 'HIIT';
  if (workout.includes('dance') || workout.includes('zumba')) return 'Dance';
  if (workout.includes('sport') || workout.includes('game') || workout.includes('basketball') || workout.includes('soccer') || workout.includes('tennis')) return 'Sports';
  
  return 'Other';
};

/**
 * Get fitness summary
 * @param {Array} workouts 
 * @returns {object}
 */
export const getFitnessSummary = (workouts) => {
  const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  
  return {
    totalCalories,
    totalMinutes,
    count: workouts.length,
    averageCaloriesPerWorkout: workouts.length > 0 ? totalCalories / workouts.length : 0,
    averageMinutesPerWorkout: workouts.length > 0 ? totalMinutes / workouts.length : 0,
    byIntensity: workouts.reduce((acc, w) => {
      const intensity = w.intensity || 'Medium';
      if (!acc[intensity]) acc[intensity] = { count: 0, calories: 0, minutes: 0 };
      acc[intensity].count++;
      acc[intensity].calories += w.calories || 0;
      acc[intensity].minutes += w.duration || 0;
      return acc;
    }, {})
  };
};

/**
 * Suggest next workout based on history
 * @param {Array} workouts 
 * @returns {string}
 */
export const suggestNextWorkout = (workouts) => {
  if (!workouts || workouts.length === 0) {
    return "Try a 20-minute brisk walk to get started! 🚶";
  }
  
  const lastWorkout = workouts[0];
  const categories = workouts.map(w => getWorkoutCategory(w.title));
  
  // Count category frequency
  const categoryCount = categories.reduce((acc, cat) => {
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  
  // Find least common category
  let leastCommon = 'Cardio';
  let minCount = Infinity;
  for (const [cat, count] of Object.entries(categoryCount)) {
    if (count < minCount) {
      minCount = count;
      leastCommon = cat;
    }
  }
  
  const suggestions = {
    'Cardio': 'Try interval running: 1 min sprint, 2 min jog 🏃',
    'Strength': 'Full body workout: squats, pushups, rows 💪',
    'Yoga': 'Sun salutations and deep stretching 🧘',
    'HIIT': '20 sec work, 10 sec rest x 8 rounds ⚡',
    'Cycling': 'Hill intervals or steady endurance ride 🚴',
    'Swimming': 'Mix freestyle and breaststroke laps 🏊',
    'Dance': 'Follow a Zumba or hip hop routine 💃',
    'Sports': 'Practice drills or join a pickup game 🎯',
    'Other': 'Try a new activity like rock climbing! 🧗'
  };
  
  return suggestions[leastCommon] || suggestions['Cardio'];
};

// Export all functions
export default {
  estimateFoodCalories,
  formatCalories,
  getNutritionSummary,
  estimateWorkoutCalories,
  getWorkoutIntensity,
  getWorkoutCategory,
  getFitnessSummary,
  suggestNextWorkout,
};