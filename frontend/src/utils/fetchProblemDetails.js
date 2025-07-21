import { BASE_URL } from "../contants/constant";
export async function fetchProblemDetails(problemId) {
  if (!problemId) throw new Error("Problem ID is required");

  try {
    const res = await fetch(`${BASE_URL}problem/${problemId}`, {
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch problem details");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
}
