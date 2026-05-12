export function calculateDailyCalorieNorm({
  weight,
  height,
  age,
  gender,
  activityCoef,
}) {
  let calorieNorm;
  if (gender === "Female") {
    calorieNorm = (10 * weight + 6.25 * height - 5 * age - 161) * activityCoef;
  } else {
    calorieNorm = (10 * weight + 6.25 * height - 5 * age + 5) * activityCoef;
  }
  return Math.round(calorieNorm);
}

export function calculateDailyProteinLimit(calorieLimit) {
  return Math.round((0.3 * calorieLimit) / 4);
}

export function calculateDailyFatLimit(calorieLimit) {
  return Math.round((0.3 * calorieLimit) / 9);
}

export function calculateDailyCarbsLimit(calorieLimit) {
  return Math.round((0.4 * calorieLimit) / 4);
}

export function calculateTotalCalories(protein, carbs, fat) {
  return Math.round(protein * 4 + carbs * 4 + fat * 9);
}

export function calculatePercentage(macronutrient, type, totalCalories) {
  let macronutrientCalories = 0;

  switch (type.toLowerCase()) {
    case "protein":
      macronutrientCalories = macronutrient * 4;
      break;
    case "carbs":
      macronutrientCalories = macronutrient * 4;
      break;
    case "fat":
      macronutrientCalories = macronutrient * 9;
      break;
    default:
      throw new Error(
        'Invalid macronutrient type. Use "protein", "carbs", or "fat".'
      );
  }

  return Math.round((macronutrientCalories / totalCalories) * 100);
}
export function calculateGramsFromPercentage(percentage, type, totalCalories) {
  let caloriesPerGram = 0;

  switch (type.toLowerCase()) {
    case "protein":
    case "carbs":
      caloriesPerGram = 4;
      break;
    case "fat":
      caloriesPerGram = 9;
      break;
    default:
      throw new Error(
        'Invalid macronutrient type. Use "protein", "carbs", or "fat".'
      );
  }

  const macronutrientCalories = (percentage / 100) * totalCalories;
  return Math.round(macronutrientCalories / caloriesPerGram);
}
export function calculateIdealBodyWeight({ height, gender }) {
  if (!height || !gender || gender === "unknown") return 0;

  const heightDiff = height - 152;
  const baseWeight = gender.toLowerCase() === "female" ? 45.5 : 50;
  const weightAdjustment = 0.9 * heightDiff;
  const result = baseWeight + weightAdjustment;

  return Number(result.toFixed(2));
}