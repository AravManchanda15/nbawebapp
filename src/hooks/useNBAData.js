// src/hooks/useNBAData.js
import { useState, useEffect } from "react";

function useNBAData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/data/nba_teams.json")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load data!");
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export default useNBAData;
