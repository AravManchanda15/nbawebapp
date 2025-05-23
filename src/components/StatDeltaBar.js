import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import teamAbbrMap from "../data/teamAbbrMap";
import statLabels from "../data/statLabels";

function StatDeltaBar({ data, stat, year1, year2 }) {
  // Build delta dataset: for teams present in BOTH years
  const year1Teams = data.filter(d => d.Year === year1);
  const year2Teams = data.filter(d => d.Year === year2);

  // Use team name as key (remove * if present)
  function cleanTeam(team) {
    return team.replace(/\*$/, "").trim();
  }

  const deltas = useMemo(() => {
    const y1Map = Object.fromEntries(year1Teams.map(d => [cleanTeam(d.Team), d]));
    const y2Map = Object.fromEntries(year2Teams.map(d => [cleanTeam(d.Team), d]));
    // Only teams that exist in both years (skip "League Average")
    return Object.keys(y1Map)
      .filter(team => team !== "League Average" && y2Map[team])
      .map(team => ({
        Team: team,
        delta: y2Map[team][stat] - y1Map[team][stat],
        value1: y1Map[team][stat],
        value2: y2Map[team][stat],
      }))
      .sort((a, b) => b.delta - a.delta);
  }, [year1Teams, year2Teams, stat]);

  // Choose bar color: green if delta > 0, red if < 0, gray if 0
  function getColor(delta) {
    if (delta > 0) return "#22c55e";
    if (delta < 0) return "#ef4444";
    return "#a3a3a3";
  }

  // Tooltip shows both values
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload[0]) return null;
    const { Team, delta, value1, value2 } = payload[0].payload;
    return (
      <div style={{ background: "#fff", border: "1px solid #ddd", padding: 10, borderRadius: 8 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{Team}</div>
        <div>
          {year2}: <b>{value2}</b><br />
          {year1}: <b>{value1}</b><br />
          Change: <b style={{ color: getColor(delta) }}>{delta > 0 ? "+" : ""}{delta.toFixed(2)}</b>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, margin: "24px 0 0" }}>
        Year-over-Year Change in {statLabels[stat] || stat}
      </h2>
      <ResponsiveContainer width="100%" height={420}>
        <BarChart data={deltas} margin={{ left: 28, right: 24, top: 32, bottom: 48 }}>
          <XAxis
            dataKey="Team"
            tick={({ x, y, payload }) => {
              // Logo and abbr below each bar
              const abbr = Object.keys(teamAbbrMap).find(
                key => key.replace(/\*$/, "").trim() === payload.value
              );
              const imgSrc = abbr ? "/logos/" + teamAbbrMap[abbr] : "";
              return (
                <g transform={`translate(${x},${y + 12})`}>
                  {imgSrc ? (
                    <image
                      href={imgSrc}
                      width={28}
                      height={28}
                      x={-14}
                      y={6}
                      style={{ shapeRendering: "crispEdges" }}
                    />
                  ) : null}
                  <text x={0} y={38} textAnchor="middle" fontSize={11}>
                    {payload.value.split(" ").map(w => w[0]).join("")}
                  </text>
                </g>
              );
            }}
            interval={0}
            height={60}
            tickLine={false}
          />
          <YAxis
            label={{
              value: `Change in ${statLabels[stat] || stat}`,
              angle: -90,
              position: "insideLeft",
              offset: 18,
              style: { textAnchor: "middle", fontWeight: 600, fontSize: 14 }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="delta" radius={[6, 6, 0, 0]}>
            {deltas.map((entry, idx) => (
              <Cell key={entry.Team} fill={getColor(entry.delta)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StatDeltaBar;
