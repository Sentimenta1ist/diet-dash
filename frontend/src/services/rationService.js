import authorizedAxios from "../utils/authorizedAxios";

export const duplicateRation = async (profileId, sourceDate, targetDates) => {
  try {
    const response = await authorizedAxios.post(
      `/ration/duplicate/${profileId}`, // URL with profileId in the path
      { targetDates }, // Send targetDates in the request body
      {
        params: {
          sourceDate, // Adding sourceDate as a query parameter
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error duplicating ration:", error);
    throw error;
  }
};
