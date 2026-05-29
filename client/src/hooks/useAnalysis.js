import { useState } from "react";
import axios from "axios";

// Custom hook — this separates the API logic from the UI components
// Any component can call useAnalysis() to get the analyzeRepo function + state
export function useAnalysis() {
  const [data, setData] = useState(null);       // the full analysis result
  const [loading, setLoading] = useState(false); // true while API call is running
  const [error, setError] = useState(null);      // error message string or null

  async function analyzeRepo(repoUrl) {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await axios.post("/api/analyze", { repoUrl });
      setData(response.data);
      return response.data;
    } catch (err) {
      // axios wraps API error responses in err.response.data
      const message =
        err.response?.data?.error ||
        "Something went wrong. Is the server running?";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { analyzeRepo, data, loading, error };
}
