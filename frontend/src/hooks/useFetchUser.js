import { useDispatch } from "react-redux";
import authorizedAxios from "../utils/authorizedAxios";
import { setUser } from "../redux/slices/profileSlice";
import { useEffect, useState } from "react";
import { useProfile } from "../ProfileContext";
import { calculateIdealBodyWeight } from "../utils/healthCalculations"; 

const useFetchUser = (onInitialUserSet = () => { }, onUserStateSet = () => { }) => {
  const { selectedProfile } = useProfile();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedProfile) {
        onInitialUserSet();
        return;
      }

      try {
        setLoading(true);
        onUserStateSet(false);

        const response = await authorizedAxios.get(
          `/profile/${selectedProfile.id}`,
        );

        const data = response.data;
        const profileData = {
          name: data.name || "name",
          age: data.age || 0,
          gender: data.gender || 0,
          weight: data.weight || 0,
          height: data.height || 0,
          waist: data.waist || 0,
          hips: data.hips || 0,
          goalWeight: data.goalWeight || 0,
          activity: {
            id: data.activity?.id || 0,
            description: data.activity?.description || "",
            multiplier: data.activity?.multiplier || 1,
          },
          bodyMassIndex: data.bodyMassIndex || 0,
          idealBodyWeight: calculateIdealBodyWeight({
            height: data.height,
            gender: data.gender
          }),
          dailyCalorieNorm: data.dailyCalorieNorm || 0,
          selectedCalorieLimit: data.selectedCalorieLimit || 0,
          dailyProteinLimit: data.dailyProteinLimit || 0,
          dailyFatLimit: data.dailyFatLimit || 0,
          dailyCarbsLimit: data.dailyCarbsLimit || 0,
          dailyProteinPercentage: data.dailyProteinPercentage || 0,
          dailyCarbsPercentage: data.dailyCarbsPercentage || 0,
          dailyFatPercentage: data.dailyFatPercentage || 0,
        };
        dispatch(setUser(profileData));
        onInitialUserSet(profileData);
        onUserStateSet();
      } catch (error) {
        console.error("Error fetching profile data:", error);
        onInitialUserSet();
      } finally {
        onUserStateSet(true);
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedProfile, dispatch]);

  return { loading };
};

export default useFetchUser;