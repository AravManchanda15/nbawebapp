// src/components/BestWorstSeasons.js

import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import teamAbbrMap from "../data/teamAbbrMap";
import statLabels from "../data/statLabels";
import getTeamLogo from "../data/getTeamLogo";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

// Utility
function isPercentStat(stat) {
  const label = statLabels[stat] || stat;
  return /percent(age)?/i.test(label);
}
const perGameStats = [
  "PTS", "TRB", "AST", "STL", "BLK", "ORB", "DRB", "TOV", "PF",
  "FG", "FGA", "3P", "3PA", "2P", "2PA", "FT", "FTA", "MP"
];

function BestWorstSeasons({ data, stat, setStat, statKeys }) {
  // Always define memoized data
  const filtered = useMemo(
    () =>
      stat
        ? data.filter((d) => d[stat] !== null && d[stat] !== undefined)
        : [],
    [data, stat]
  );
  const best = useMemo(
    () =>
      stat
        ? [...filtered].sort((a, b) => b[stat] - a[stat]).slice(0, 10)
        : [],
    [filtered, stat]
  );
  const worst = useMemo(
    () =>
      stat
        ? [...filtered].sort((a, b) => a[stat] - b[stat]).slice(0, 10)
        : [],
    [filtered, stat]
  );

  // Logo above bar, just like in TeamComparisonBar.js
  const LOGO_SIZE = 42;
  const renderLogoLabel = (props) => {
    const { x, y, width, value } = props;
    const logoSrc = getTeamLogo(value);
    return (
      logoSrc && (
        <image
          href={logoSrc}
          x={x + width / 2 - LOGO_SIZE / 2}
          y={y - LOGO_SIZE - 2}
          width={LOGO_SIZE}
          height={LOGO_SIZE}
          style={{ pointerEvents: "none" }}
        />
      )
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload[0]) return null;
    const d = payload[0].payload;
    const cleanTeam = d.Team.replace(/\*$/, "");
    let value = d[stat];
    if (typeof value === "number" && isPercentStat(stat)) {
      value = (value * 100).toFixed(1) + "%";
    }
    return (
      <div style={{ background: "#fff", border: "1px solid #ddd", padding: 12, borderRadius: 10 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{cleanTeam} ({d.Year})</div>
        <div style={{ color: "#2563eb", fontWeight: 600 }}>
          {statLabels[stat] || stat}: {value}
        </div>
      </div>
    );
  };

  // Chart label for X axis
  function abbr(teamName) {
    // Use same logic as TeamComparisonBar.js
    return teamAbbrMap[teamName]?.split(".")[0].toUpperCase().slice(0, 3) || "";
  }

  // Render a chart
  function renderBarChart(dataArr, barColor, title) {
    return (
      <Box flex={1}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }} color={barColor === "#22c55e" ? "success.main" : "error.main"}>
          {title}
        </Typography>
        <ResponsiveContainer width="105%" height={412}>
          <BarChart
            data={dataArr}
            margin={{ left: 10, right: 24, top: 28, bottom: 40 }}
             barCategoryGap="15%"
          >
            <XAxis
              dataKey="Team"
              interval={0}
              height={32}
              tick={({ x, y, payload }) => {
                const teamFullName = payload.value;
                return (
                  <g transform={`translate(${x},${y + 16})`}>
                    <text x={0} y={0} textAnchor="middle" fill="#444" fontSize={14} fontWeight="bold">
                      {abbr(teamFullName)}
                    </text>
                  </g>
                );
              }}
              stroke="#444"
            />
            <YAxis
              stroke="#444"
              width={108}
              tick={{ fontSize: 13, fill: "#444" }}
              label={{
                value: `${statLabels[stat] || stat}${isPercentStat(stat) ? " (%)" : ""}${perGameStats.includes(stat) ? " per game" : ""}`,
                angle: -90,
                position: "insideLeft",
                offset: 32,
                style: { textAnchor: "middle", fontWeight: 600, fontSize: 18 }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={stat} fill={barColor} radius={8}>
              <LabelList dataKey="Team" content={renderLogoLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  }

  // Placeholder if no stat selected
  if (!stat) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h5" color="text.secondary">
          Choose a stat to view the all-time best & worst NBA team seasons!
        </Typography>
        <Stack alignItems="center" mt={5}>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Stat</InputLabel>
            <Select
  value={stat}
  label="Stat"
  onChange={e => setStat(e.target.value)}
  displayEmpty
>
  <MenuItem value="" disabled>
    Select a stat
  </MenuItem>
  {statKeys.map(s => (
    <MenuItem key={s} value={s}>{statLabels[s] || s}</MenuItem>
  ))}
</Select>

          </FormControl>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        All-Time Best & Worst NBA Team Seasons – {statLabels[stat] || stat}
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={3} mb={4}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Stat</InputLabel>
          <Select
            value={stat}
            label="Stat"
            onChange={e => setStat(e.target.value)}
          >
            {statKeys.map(s => (
              <MenuItem key={s} value={s}>{statLabels[s] || s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <Stack direction={{ xs: "column", md: "row" }} spacing={6}>
        {renderBarChart(best, "#22c55e", `Best ${statLabels[stat] || stat}`)}
        {renderBarChart(worst, "#ef4444", `Worst ${statLabels[stat] || stat}`)}
      </Stack>
    </Box>
  );
}

export default BestWorstSeasons;
