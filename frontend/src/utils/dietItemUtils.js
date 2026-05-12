import DietItem from "../models/DietItem";
import Product from "../models/Product";
import NutritionProgress from "../models/NutritionProgress";

export const initializeDietItems = (dietItems) => {
  return dietItems.map((item) => {
    const multiplier = item.grams / 100;

    const adjustedProduct = new Product(
      item.product.id,
      item.product.name,
      100,
      item.product.calories * multiplier, // Keep full precision
      item.product.proteins * multiplier,
      item.product.fats * multiplier,
      item.product.carbs * multiplier
    );

    return new DietItem(
      adjustedProduct,
      new Date(`1970-01-01T${item.time || "00:00"}:00`), // Fallback for null time
      item.id,
      item.grams
    );
  });
};
export const calculateNutritionProgress = (summedValues, user, t) => {
  return [
    new NutritionProgress(
      t(`diet.progressBars.calories`),
      summedValues.Calories, // Keep full precision
      user.selectedCalorieLimit || 2500,
      "calories"
    ),
    new NutritionProgress(
      t(`diet.progressBars.protein`),
      summedValues.Protein,
      user.dailyProteinLimit || 100,
      "protein"
    ),
    new NutritionProgress(
      t(`diet.progressBars.fat`),
      summedValues.Fat,
      user.dailyFatLimit || 70,
      "fat"
    ),
    new NutritionProgress(
      t(`diet.progressBars.carbs`),
      summedValues.Carbs,
      user.dailyCarbsLimit || 300,
      "carbs"
    ),
  ];
};