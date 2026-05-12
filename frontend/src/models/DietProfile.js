import Activity from "./Activity"; // Adjust the import path if necessary

class DietProfile {
  // Properties with default values
  name = "";
  age = null;
  gender = "";
  weight = null; // in kg
  height = null; // in cm
  waist = null; // in cm
  hips = null; // in cm
  goalWeight = null; // in kg
  activity = new Activity(); // Default empty Activity
  bodyMassIndex = null;
  idealBodyWeight = null; // Added idealBodyWeight
  dailyCalorieNorm = null;
  selectedCalorieLimit = null;
  dailyProteinLimit = null;
  dailyFatLimit = null;
  dailyCarbsLimit = null;
  proteinPercentage = null;  // Changed from dailyProteinPercentage
  carbsPercentage = null;    // Changed from dailyCarbsPercentage
  fatPercentage = null;      // Changed from dailyFatPercentage
}

export default DietProfile;