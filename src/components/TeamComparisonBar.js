import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import getTeamLogo from "../data/getTeamLogo";
import teamAbbrMap from "../data/teamAbbrMap";
import statLabels from "../data/statLabels";

// Get abbreviation from the logo filename (e.g. 'gol.png' => 'GOL')
const getAbbr = (teamFullName) => {
  const fileName = teamAbbrMap[teamFullName];
  if (!fileName) return "";
  return fileName.split(".")[0].slice(0, 3).toUpperCase();
};

const renderCustomAxisTick = ({ x, y, payload }) => {
  const teamFullName = payload.value;
  const abbr = getAbbr(teamFullName);
  const logoSrc = getTeamLogo(teamFullName);
  return (
    <g transform={`translate(${x},${y + 10})`}>
      <image href={logoSrc} x={-15} y={0} height={28} width={28} />
      <text x={0} y={40} textAnchor="middle" fill="#444" fontSize={13} fontWeight="bold">
        {abbr}
      </text>
    </g>
  );
};

function TeamComparisonBar({ data, stat, year, seasonType }) {
  const filtered = useMemo(
    () =>
      data.filter(
        (d) =>
          String(d.Year) === String(year) &&
          d.season_type.toLowerCase() === seasonType.toLowerCase() &&
          d[stat] !== undefined &&
          d[stat] !== null
      ),
    [data, stat, year, seasonType]
  );

  const sorted = useMemo(() => {
    // For playoff Rk: sort ascending (rank 1 leftmost)
    if (seasonType === "playoff" && stat === "Rk") {
      return [...filtered].sort((a, b) => Number(a[stat]) - Number(b[stat]));
    }
    // All others: descending (highest stat leftmost)
    return [...filtered].sort((a, b) => Number(b[stat]) - Number(a[stat]));
  }, [filtered, stat, seasonType]);

  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: 16, width: "100%" }}>
      <h2 style={{ color: "#222", marginBottom: 20, fontWeight: 700, fontSize: "2rem" }}>
        {statLabels[stat] || stat} among NBA – {year}
      </h2>
      <ResponsiveContainer width="100%" height={420}>
        <BarChart
          data={sorted}
          margin={{ left: 56, right: 24, top: 32, bottom: 48 }}
        >
          <XAxis
            dataKey="Team"
            interval={0}
            height={72}
            tick={renderCustomAxisTick}
            stroke="#444"
          />
          <YAxis
            stroke="#444"
            width={90}
            label={{
              value: statLabels[stat] || stat,
              angle: -90,
              position: "insideLeft",
              offset: 16,
              style: { textAnchor: "middle", fontWeight: 600, fontSize: 16 }
            }}
            tick={{ fontSize: 15, fill: "#444" }}
          />
          <Tooltip
            contentStyle={{ background: "#f7f8fa", color: "#222", borderRadius: 8 }}
            labelStyle={{ color: "#222" }}
          />
          <Bar dataKey={stat} fill="#3b82f6" radius={6} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TeamComparisonBar;
