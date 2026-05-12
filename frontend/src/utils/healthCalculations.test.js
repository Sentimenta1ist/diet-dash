import {
  calculateDailyCalorieNorm,
  calculateDailyProteinLimit,
  calculateDailyFatLimit,
  calculateDailyCarbsLimit,
  calculateTotalCalories,
  calculatePercentage,
  calculateGramsFromPercentage,
  calculateIdealBodyWeight,
} from "./healthCalculations";

describe("calculateDailyCalorieNorm", () => {
  const base = { weight: 70, height: 175, age: 30, activityCoef: 1.55 };

  it("calculates correctly for male", () => {
    // (10*70 + 6.25*175 - 5*30 + 5) * 1.55 = (700 + 1093.75 - 150 + 5) * 1.55 = 1648.75 * 1.55 ≈ 2556
    expect(calculateDailyCalorieNorm({ ...base, gender: "Male" })).toBe(2556);
  });

  it("calculates correctly for female", () => {
    // (10*70 + 6.25*175 - 5*30 - 161) * 1.55 = (700 + 1093.75 - 150 - 161) * 1.55 = 1482.75 * 1.55 ≈ 2298
    expect(calculateDailyCalorieNorm({ ...base, gender: "Female" })).toBe(2298);
  });

  it("returns a rounded integer", () => {
    const result = calculateDailyCalorieNorm({ ...base, gender: "Male" });
    expect(Number.isInteger(result)).toBe(true);
  });

  it("scales with activity coefficient", () => {
    const sedentary = calculateDailyCalorieNorm({ ...base, gender: "Male", activityCoef: 1.2 });
    const active = calculateDailyCalorieNorm({ ...base, gender: "Male", activityCoef: 1.9 });
    expect(active).toBeGreaterThan(sedentary);
  });
});

describe("calculateDailyProteinLimit", () => {
  it("returns 30% of calories divided by 4 kcal/g", () => {
    expect(calculateDailyProteinLimit(2000)).toBe(Math.round((0.3 * 2000) / 4));
  });

  it("returns a rounded integer", () => {
    expect(Number.isInteger(calculateDailyProteinLimit(2500))).toBe(true);
  });
});

describe("calculateDailyFatLimit", () => {
  it("returns 30% of calories divided by 9 kcal/g", () => {
    expect(calculateDailyFatLimit(2000)).toBe(Math.round((0.3 * 2000) / 9));
  });

  it("returns a rounded integer", () => {
    expect(Number.isInteger(calculateDailyFatLimit(2500))).toBe(true);
  });
});

describe("calculateDailyCarbsLimit", () => {
  it("returns 40% of calories divided by 4 kcal/g", () => {
    expect(calculateDailyCarbsLimit(2000)).toBe(Math.round((0.4 * 2000) / 4));
  });

  it("returns a rounded integer", () => {
    expect(Number.isInteger(calculateDailyCarbsLimit(2500))).toBe(true);
  });
});

describe("calculateTotalCalories", () => {
  it("sums protein*4 + carbs*4 + fat*9", () => {
    expect(calculateTotalCalories(50, 100, 30)).toBe(
      Math.round(50 * 4 + 100 * 4 + 30 * 9)
    );
  });

  it("returns 0 for all-zero input", () => {
    expect(calculateTotalCalories(0, 0, 0)).toBe(0);
  });

  it("returns a rounded integer", () => {
    expect(Number.isInteger(calculateTotalCalories(50, 100, 30))).toBe(true);
  });
});

describe("calculatePercentage", () => {
  const totalCalories = 2000;

  it("calculates protein percentage (4 kcal/g)", () => {
    expect(calculatePercentage(100, "protein", totalCalories)).toBe(
      Math.round((100 * 4 / totalCalories) * 100)
    );
  });

  it("calculates carbs percentage (4 kcal/g)", () => {
    expect(calculatePercentage(150, "carbs", totalCalories)).toBe(
      Math.round((150 * 4 / totalCalories) * 100)
    );
  });

  it("calculates fat percentage (9 kcal/g)", () => {
    expect(calculatePercentage(60, "fat", totalCalories)).toBe(
      Math.round((60 * 9 / totalCalories) * 100)
    );
  });

  it("is case-insensitive for type", () => {
    expect(calculatePercentage(100, "Protein", totalCalories)).toBe(
      calculatePercentage(100, "protein", totalCalories)
    );
  });

  it("throws for an invalid macronutrient type", () => {
    expect(() => calculatePercentage(100, "fiber", totalCalories)).toThrow();
  });
});

describe("calculateGramsFromPercentage", () => {
  const totalCalories = 2000;

  it("calculates grams for protein (4 kcal/g)", () => {
    expect(calculateGramsFromPercentage(30, "protein", totalCalories)).toBe(
      Math.round((0.3 * totalCalories) / 4)
    );
  });

  it("calculates grams for carbs (4 kcal/g)", () => {
    expect(calculateGramsFromPercentage(40, "carbs", totalCalories)).toBe(
      Math.round((0.4 * totalCalories) / 4)
    );
  });

  it("calculates grams for fat (9 kcal/g)", () => {
    expect(calculateGramsFromPercentage(30, "fat", totalCalories)).toBe(
      Math.round((0.3 * totalCalories) / 9)
    );
  });

  it("treats protein and carbs identically (both 4 kcal/g)", () => {
    expect(calculateGramsFromPercentage(30, "protein", totalCalories)).toBe(
      calculateGramsFromPercentage(30, "carbs", totalCalories)
    );
  });

  it("throws for an invalid macronutrient type", () => {
    expect(() => calculateGramsFromPercentage(30, "sugar", totalCalories)).toThrow();
  });
});

describe("calculateIdealBodyWeight", () => {
  it("calculates for a male", () => {
    // base=50, diff=175-152=23, adjustment=0.9*23=20.7 → 70.7
    expect(calculateIdealBodyWeight({ height: 175, gender: "male" })).toBe(70.7);
  });

  it("calculates for a female", () => {
    // base=45.5, diff=175-152=23, adjustment=0.9*23=20.7 → 66.2
    expect(calculateIdealBodyWeight({ height: 175, gender: "female" })).toBe(66.2);
  });

  it("returns 0 when gender is 'unknown'", () => {
    expect(calculateIdealBodyWeight({ height: 175, gender: "unknown" })).toBe(0);
  });

  it("returns 0 when height is missing", () => {
    expect(calculateIdealBodyWeight({ height: null, gender: "male" })).toBe(0);
  });

  it("returns 0 when gender is missing", () => {
    expect(calculateIdealBodyWeight({ height: 175, gender: null })).toBe(0);
  });

  it("returns a number with at most 2 decimal places", () => {
    const result = calculateIdealBodyWeight({ height: 170, gender: "male" });
    expect(result).toBe(Number(result.toFixed(2)));
  });
});
