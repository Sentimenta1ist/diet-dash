import Product from "./Product"; // Adjust the import path if necessary

class DietItem {
  constructor(product, time, id, grams) {
    if (!(product instanceof Product)) {
      throw new Error("product must be an instance of Product");
    }
    this.product = product;
    this.time = time;
    this.id = id;
    this.grams = grams;
  }
}

export default DietItem;
