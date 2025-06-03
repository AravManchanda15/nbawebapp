import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import teamAbbrMap from "../data/teamAbbrMap";
import statLabels from "../data/statLabels";
import getTeamLogo from "../data/getTeamLogo"; // <-- ADD this import!

const perGameStats = [
  "PTS", "TRB", "AST", "STL", "BLK", "ORB", "DRB", "TOV", "PF",
  "FG", "FGA", "3P", "3PA", "2P", "2PA", "FT", "FTA", "MP"
];

function isPercentStat(stat) {
  const label = statLabels[stat] || stat;
  return /percent(age)?/i.test(label);
}

function cleanTeam(team) {
  return team.replace(/\*$/, "").trim();
}

const CustomTooltip = ({ active, payload, year1, year2, stat }) => {
  if (!active || !payload || !payload[0]) return null;
  const { Team, delta, value1, value2 } = payload[0].payload;
  let v1 = value1;
  let v2 = value2;
  let deltav = delta;

  if (
    typeof v1 === "number" &&
    isPercentStat(stat)
  ) {
    v1 = (v1 * 100).toFixed(1) + "%";
    v2 = (v2 * 100).toFixed(1) + "%";
    deltav = (deltav * 100).toFixed(2) + "%";
  } else {
    deltav = deltav > 0 ? "+" + deltav.toFixed(2) : deltav.toFixed(2);
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #ddd", padding: 10, borderRadius: 8 }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{cleanTeam(Team)}</div>
      <div>
        {year2}: <b>{v2}</b><br />
        {year1}: <b>{v1}</b><br />
        Change: <b style={{ color: delta > 0 ? "#22c55e" : delta < 0 ? "#ef4444" : "#a3a3a3" }}>{deltav}</b>
      </div>
    </div>
  );
};

function StatDeltaBar({ data, stat, year1, year2 }) {
  const year1Teams = data.filter(d => d.Year === year1);
  const year2Teams = data.filter(d => d.Year === year2);

  const deltas = useMemo(() => {
    const y1Map = Object.fromEntries(year1Teams.map(d => [cleanTeam(d.Team), d]));
    const y2Map = Object.fromEntries(year2Teams.map(d => [cleanTeam(d.Team), d]));
    return Object.keys(y1Map)
      .filter(team => team !== "League Average" && y2Map[team])
      .map(team => ({
        Team: team,
        delta: y2Map[team][stat] - y1Map[team][stat],
        value1: y1Map[team][stat],
        value2: y2Map[team][stat],
        year1,
        year2,
      }))
      .sort((a, b) => b.delta - a.delta);
  }, [year1Teams, year2Teams, stat, year1, year2]);

  function getColor(delta) {
    if (delta > 0) return "#22c55e";
    if (delta < 0) return "#ef4444";
    return "#a3a3a3";
  }

  function formatTick(value) {
    if (
      typeof value === "number" &&
      isPercentStat(stat)
    ) {
      return (value * 100).toFixed(1) + "%";
    }
    return value;
  }

  // === LOGO ABOVE BAR ===
  const LOGO_SIZE = 42;
  const renderLogoLabel = (props) => {
    const { x, y, width, value } = props;
    const logoSrc = getTeamLogo(value);
    return (
      <image
        href={logoSrc}
        x={x + width / 2 - LOGO_SIZE / 2}
        y={y - LOGO_SIZE - 2}
        width={LOGO_SIZE}
        height={LOGO_SIZE}
        style={{ pointerEvents: "none" }}
      />
    );
  };

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, margin: "24px 0 0" }}>
        Year-over-Year Change in {statLabels[stat] || stat}
        {isPercentStat(stat) ? " (%)" : ""}
        {perGameStats.includes(stat) ? " per game" : ""}
      </h2>
      <ResponsiveContainer width="100%" height={550}>
        <BarChart data={deltas} margin={{ left: 10, right: 24, top: 32, bottom: 48 }}>
          <XAxis
            dataKey="Team"
            interval={0}
            height={32}
            tick={({ x, y, payload }) => {
              // 3-letter abbr from map for consistency
              const abbr = teamAbbrMap[payload.value]?.split(".")[0].toUpperCase().slice(0, 3) || "";
              return (
                <g transform={`translate(${x},${y + 16})`}>
                  <text x={0} y={0} textAnchor="middle" fill="#444" fontSize={14} fontWeight="bold">
                    {abbr}
                  </text>
                </g>
              );
            }}
            stroke="#444"
          />
          <YAxis
            width={108}
            tickFormatter={formatTick}
            tick={{ fontSize: 13, fill: "#444" }}
            label={{
              value: `Change in ${statLabels[stat] || stat}${isPercentStat(stat) ? " (%)" : ""}${perGameStats.includes(stat) ? " per game" : ""}`,
              angle: -90,
              position: "insideLeft",
              offset: 18,
              style: { textAnchor: "middle", fontWeight: 600, fontSize: 18 }
            }}
          />
          <Tooltip content={<CustomTooltip year1={year1} year2={year2} stat={stat} />} />
          <Bar dataKey="delta" radius={[6, 6, 0, 0]}>
            {deltas.map((entry) => (
              <Cell key={entry.Team} fill={getColor(entry.delta)} />
            ))}
            <LabelList dataKey="Team" content={renderLogoLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StatDeltaBar;
