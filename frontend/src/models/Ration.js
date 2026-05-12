import DietItem from "./DietItem"; // Adjust the import path if necessary

class Ration {
  constructor(date, dietItems = []) {
    if (!(date instanceof Date)) {
      throw new Error("date must be an instance of Date");
    }
    this.date = date;
    this.dietItems = [];
    this.addDietItems(dietItems); // Initialize and sort items
  }

  // Method to add a DietItem to the list
  addDietItem(dietItem) {
    if (!(dietItem instanceof DietItem)) {
      throw new Error("dietItem must be an instance of DietItem");
    }
    this.dietItems.push(dietItem);
    this.sortDietItems(); // Ensure items are sorted after adding
  }

  // Method to add multiple DietItems and sort them
  addDietItems(dietItems) {
    dietItems.forEach((item) => this.addDietItem(item));
  }

  // Method to sort diet items by time
  sortDietItems() {
    this.dietItems.sort((a, b) => new Date(a.time) - new Date(b.time));
  }

  // Method to get the total calories for the day
  getTotalCalories() {
    return this.dietItems.reduce((total, item) => total + item.calories, 0);
  }

  // Method to get the total protein for the day
  getTotalProtein() {
    return this.dietItems.reduce((total, item) => total + item.protein, 0);
  }

  // Method to get the total fat for the day
  getTotalFat() {
    return this.dietItems.reduce((total, item) => total + item.fat, 0);
  }

  // Method to get the total carbs for the day
  getTotalCarbs() {
    return this.dietItems.reduce((total, item) => total + item.carbs, 0);
  }
}

export default Ration;
