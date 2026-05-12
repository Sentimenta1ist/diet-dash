import { initializeDietItems } from "../../../utils/dietItemUtils";
import { createSelector } from "reselect";

export const selectDietItems = (state) => state.ration.dietItems;

export const initializeDietItemsSelector = createSelector(
  [selectDietItems],
  (dietItems) => initializeDietItems(dietItems)
);
