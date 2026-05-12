class NutritionProgress {
  constructor(name, current, total, idName = 'calories') {
    this.idName = idName;
    this.name = name;
    this.current = current;
    this.total = total;
  }
}

export default NutritionProgress;
