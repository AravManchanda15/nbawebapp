// src/data/getTeamLogo.js
import teamAbbrMap from "./teamAbbrMap";

function getTeamLogo(teamFullName) {
  // Returns logo path for a given full NBA team name
  const fileName = teamAbbrMap[teamFullName];
  if (!fileName) return "/logos/placeholder.png"; // fallback for missing
  return `/logos/${fileName}`;
}
export default getTeamLogo;
