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
    height: 100,  // Set your AppBar height here! (change to 72 if you want even taller)
    px: { xs: 2, md: 6 },
    background: "linear-gradient(90deg, #17408B 0%, #FDB927 50%, #C9082A 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 2
  }}
>
  <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
    <img
      src={process.env.PUBLIC_URL + "/nba.png"}
      alt="NBA"n
      style={{
        height: "120%",   // Logo fills the AppBar vertically!
        marginRight: 33,
        display: "block"
      }}
    />
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
