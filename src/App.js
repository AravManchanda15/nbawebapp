import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dashboard from "./Dashboard";

function App() {
  return (
    <>
      {/* NBA Gradient Header */}
      <Box
        sx={{
          width: "100%",
          py: 3,
          px: { xs: 2, md: 6 },
          background: "linear-gradient(90deg, #17408B 0%, #FDB927 50%, #C9082A 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <img src={process.env.PUBLIC_URL + "/nba.png"} alt="NBA" style={{ height: 55, marginRight: 33 }} />
          <Typography variant="h4" color="#fff" fontWeight={800} sx={{ letterSpacing: 1 }}>
            NBA Team Stats Dashboard (2000–2023)
          </Typography>
        </Box>
        {/* Author credit */}
        <Typography
          variant="caption"
          color="#fff"
          sx={{
            opacity: 0.82,
            fontWeight: 500,
            fontSize: { xs: "0.85rem", md: "0.95rem" },
            letterSpacing: 0.8,
            mr: 2
          }}
        >
          by Arav Manchanda
        </Typography>
      </Box>

      <Dashboard />
    </>
  );
}

export default App;
