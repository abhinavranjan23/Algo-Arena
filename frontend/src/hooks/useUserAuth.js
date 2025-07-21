import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { BASE_URL } from "../contants/constant";
import { setUser, clearUser } from "../redux/userSlice";
const useUserAuth = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const [user, setUserDetail] = useState(null);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${BASE_URL}user`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Not authenticated");
      }
      const data = await response.json();
      dispatch(setUser(data.data));
      console.log("Data from checkAuth:", data.data);
      setUserDetail(data.data);
    } catch (error) {
      // toast.error(
      //   `Error: ${error.message || "Failed to check authentication"}`
      // );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return { isLoggedIn, user, loading };
};

export default useUserAuth;
