import { initializeDietItems, calculateNutritionProgress } from "./dietItemUtils";
import DietItem from "../models/DietItem";
import NutritionProgress from "../models/NutritionProgress";

// Raw item shape as received from the API / Redux store
const makeRawItem = (overrides = {}) => ({
  id: 1,
  grams: 200,
  time: "12:30",
  product: {
    id: 101,
    name: "Apple",
    calories: 52,
    proteins: 0.3,
    fats: 0.2,
    carbs: 14,
  },
  ...overrides,
});

const t = (key) => key; // stub translation function

describe("initializeDietItems", () => {
  it("returns an empty array for empty input", () => {
    expect(initializeDietItems([])).toEqual([]);
  });

  it("returns DietItem instances", () => {
    const result = initializeDietItems([makeRawItem()]);
    expect(result[0]).toBeInstanceOf(DietItem);
  });

  it("scales nutritional values by grams/100", () => {
    const item = makeRawItem({ grams: 200 }); // multiplier = 2
    const result = initializeDietItems([item]);
    const product = result[0].product;

    expect(product.calories).toBeCloseTo(52 * 2);
    expect(product.protein).toBeCloseTo(0.3 * 2);
    expect(product.fat).toBeCloseTo(0.2 * 2);
    expect(product.carbs).toBeCloseTo(14 * 2);
  });

  it("always sets product.grams to 100 on the adjusted product", () => {
    const result = initializeDietItems([makeRawItem({ grams: 150 })]);
    expect(result[0].product.grams).toBe(100);
  });

  it("preserves item id and grams on DietItem", () => {
    const result = initializeDietItems([makeRawItem({ id: 42, grams: 300 })]);
    expect(result[0].id).toBe(42);
    expect(result[0].grams).toBe(300);
  });

  it("parses time string into a Date object", () => {
    const result = initializeDietItems([makeRawItem({ time: "08:45" })]);
    const time = result[0].time;
    expect(time).toBeInstanceOf(Date);
    expect(time.getHours()).toBe(8);
    expect(time.getMinutes()).toBe(45);
  });

  it("falls back to 00:00 when time is null", () => {
    const result = initializeDietItems([makeRawItem({ time: null })]);
    const time = result[0].time;
    expect(time.getHours()).toBe(0);
    expect(time.getMinutes()).toBe(0);
  });

  it("handles multiple items", () => {
    const items = [makeRawItem({ id: 1 }), makeRawItem({ id: 2 })];
    const result = initializeDietItems(items);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
  });
});

describe("calculateNutritionProgress", () => {
  const summedValues = { Calories: 1800, Protein: 90, Fat: 60, Carbs: 220 };
  const user = {
    selectedCalorieLimit: 2500,
    dailyProteinLimit: 150,
    dailyFatLimit: 80,
    dailyCarbsLimit: 300,
  };

  it("returns an array of four NutritionProgress instances", () => {
    const result = calculateNutritionProgress(summedValues, user, t);
    expect(result).toHaveLength(4);
    result.forEach((item) => expect(item).toBeInstanceOf(NutritionProgress));
  });

  it("assigns the correct current values", () => {
    const result = calculateNutritionProgress(summedValues, user, t);
    expect(result[0].current).toBe(1800); // Calories
    expect(result[1].current).toBe(90);   // Protein
    expect(result[2].current).toBe(60);   // Fat
    expect(result[3].current).toBe(220);  // Carbs
  });

  it("uses user limits as totals when provided", () => {
    const result = calculateNutritionProgress(summedValues, user, t);
    expect(result[0].total).toBe(2500);
    expect(result[1].total).toBe(150);
    expect(result[2].total).toBe(80);
    expect(result[3].total).toBe(300);
  });

  it("falls back to default totals when user limits are absent", () => {
    const result = calculateNutritionProgress(summedValues, {}, t);
    expect(result[0].total).toBe(2500);  // default calorie limit
    expect(result[1].total).toBe(100);   // default protein limit
    expect(result[2].total).toBe(70);    // default fat limit
    expect(result[3].total).toBe(300);   // default carbs limit
  });

  it("assigns the correct idNames", () => {
    const result = calculateNutritionProgress(summedValues, user, t);
    expect(result[0].idName).toBe("calories");
    expect(result[1].idName).toBe("protein");
    expect(result[2].idName).toBe("fat");
    expect(result[3].idName).toBe("carbs");
  });
});
