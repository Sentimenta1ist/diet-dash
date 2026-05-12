import { duplicateRation as duplicateRationApi } from "../../services/rationService";

export const duplicateRation =
  (profileId, sourceDate, targetDates) => async (dispatch) => {
    dispatch({ type: "DUPLICATE_RATION_REQUEST" });
    try {
      const duplicatedRation = await duplicateRationApi(
        profileId,
        sourceDate,
        targetDates
      );
      dispatch({ type: "DUPLICATE_RATION_SUCCESS", payload: duplicatedRation });
    } catch (error) {
      dispatch({ type: "DUPLICATE_RATION_FAILURE", payload: error.message });
    }
  };
