import teamAbbrMap from "./teamAbbrMap";

function getTeamLogo(teamFullName) {
  // Returns logo path for a given full NBA team name
  const fileName = teamAbbrMap[teamFullName];
  if (!fileName) return process.env.PUBLIC_URL + "/logos/placeholder.png"; // fallback for missing
  return process.env.PUBLIC_URL + "/logos/" + fileName;
}
export default getTeamLogo;
