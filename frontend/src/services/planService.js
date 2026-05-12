// services/planService.js
import authorizedAxios from "../utils/authorizedAxios";

const getUserPlan = async () => {
  try {
    const response = await authorizedAxios.get('users/plan');
    return response.data; // Adjust according to your API response structure
  } catch (error) {
    console.error("Error fetching user plan:", error);
    throw error; // Optionally return a default value if needed
  }
};

export default { getUserPlan };
