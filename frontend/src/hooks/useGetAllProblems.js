import { BASE_URL } from "../contants/constant";
import { useEffect, useState } from "react";

const useGetAllProblems = () => {
  const [problems, setProblems] = useState([]);
  const getAllProblems = async () => {
    try {
      const response = await fetch(`${BASE_URL}problems`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setProblems(data);
    } catch (error) {
      console.error("Error fetching problems:", error);
      toast.error(`Error: ${error.message || "Failed to load problems"}`);
    }
  };
  useEffect(() => {
    getAllProblems();
  }, []);
  return problems;
};

export default useGetAllProblems;
