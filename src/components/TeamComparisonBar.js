import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList
} from "recharts";
import getTeamLogo from "../data/getTeamLogo";
import teamAbbrMap from "../data/teamAbbrMap";
import statLabels from "../data/statLabels";

const perGameStats = [
  "PTS", "TRB", "AST", "STL", "BLK", "ORB", "DRB", "TOV", "PF",
  "FG", "FGA", "3P", "3PA", "2P", "2PA", "FT", "FTA", "MP"
];

const ascendingStats = ["Rk", "Rank", "Seed"]; // add more if needed

function TeamComparisonBar({ data, stat, year, seasonType }) {
  function isPercentStat(stat) {
    const label = statLabels[stat] || stat;
    return /percent(age)?/i.test(label);
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

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload[0]) return null;
    const d = payload[0].payload;
    const cleanTeam = d.Team.replace(/\*$/, "");
    const statLabel = statLabels[payload[0].dataKey] || payload[0].dataKey;
    let value = d[payload[0].dataKey];

    if (typeof value === "number" && /percent(age)?/i.test(statLabel)) {
      value = (value * 100).toFixed(1) + "%";
    }

    return (
      <div style={{ background: "#f3f4f6", border: "1px solid #ddd", padding: 12, borderRadius: 10 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{cleanTeam}</div>
        <div style={{ color: "#2563eb", fontWeight: 600 }}>
          {statLabel} : {value}
        </div>
      </div>
    );
  };

  
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
    if (ascendingStats.includes(stat)) {
      return [...filtered].sort((a, b) => Number(a[stat]) - Number(b[stat]));
    }
    return [...filtered].sort((a, b) => Number(b[stat]) - Number(a[stat]));
  }, [filtered, stat]);

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

  if (!stat) {
    return null;
  }

  return (
  <div> 
      <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0px 0 0" }}>
        {statLabels[stat] || stat}
        {isPercentStat(stat) ? " (%)" : ""}
        {perGameStats.includes(stat) ? " per game" : ""} among NBA – {year}
      </h2>

      <ResponsiveContainer width="100%" height={550}>
        <BarChart
          data={sorted}
          margin={{ left: 10, right: 24, top: 28, bottom: 40 }}
        >
          <XAxis
            dataKey="Team"
            interval={0}
            height={32}
            tick={({ x, y, payload }) => {
              const teamFullName = payload.value;
              const abbr = teamAbbrMap[teamFullName]?.split(".")[0].toUpperCase().slice(0, 3) || "";
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
            stroke="#444"
            width={108}
            tickFormatter={formatTick}
            label={{
              value: `${statLabels[stat] || stat}${isPercentStat(stat) ? " (%)" : ""}`,
              angle: -90,
              position: "insideLeft",
              offset: 32,
              style: { textAnchor: "middle", fontWeight: 600, fontSize: 18 }
            }}
            tick={{ fontSize: 13, fill: "#444" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={stat} fill="#3b82f6" radius={8}>
            <LabelList dataKey="Team" content={renderLogoLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


export default TeamComparisonBar;

