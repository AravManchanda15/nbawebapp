import React, { useState, useEffect, useMemo } from "react";
import useNBAData from "./hooks/useNBAData";
import TeamComparisonBar from "./components/TeamComparisonBar";
import StatDeltaBar from "./components/StatDeltaBar";
import statLabels from "./data/statLabels";

// Material UI imports
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';

function getStatKeys(data) {
  if (!data.length) return [];
  return Object.keys(data[0]).filter(
    key =>
      !["Year", "Team", "season_type"].includes(key) &&
      typeof data[0][key] === "number"
  );
}

function Dashboard() {
  const { data, loading, error } = useNBAData();

  // Only regular season data
  const regularData = useMemo(
    () => data.filter(d => d.season_type === "regular"),
    [data]
  );

  const years = useMemo(
    () =>
      Array.from(new Set(regularData.map(d => Number(d.Year))))
        .filter(y => !isNaN(y))
        .sort((a, b) => b - a),
    [regularData]
  );

  const statKeys = useMemo(() => getStatKeys(regularData), [regularData]);
  const [year, setYear] = useState(() => years[0] || 2023);
  const [stat, setStat] = useState(() => statKeys[0] || "");
  const [year1, setYear1] = useState(() => years[1] || years[0] || 2022);
  const [year2, setYear2] = useState(() => years[0] || 2023);
  const [viz, setViz] = useState("team-comparison");

  useEffect(() => {
    if (!years.includes(year)) setYear(years[0]);
    if (!years.includes(year1)) setYear1(years[1] || years[0]);
    if (!years.includes(year2)) setYear2(years[0]);
  }, [years, year, year1, year2]);

  useEffect(() => {
    if (!statKeys.includes(stat) && statKeys.length > 0) {
      setStat(statKeys[0]);
    }
  }, [statKeys, stat]);

  if (loading) return <Typography>Loading data…</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
   <Box
  sx={{
    maxWidth: { xs: "100vw", md: 1380 },
    width: { xs: "98vw", md: "90vw" },
    mx: "auto",
    mt: 5,
    p: { xs: 2, sm: 4 },
    bgcolor: "#fff",
    borderRadius: 4,
    boxShadow: 6,
    minHeight: "75vh",
    mb: 5,
  }}
>

      {/* Viz Switcher */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant={viz === "team-comparison" ? "contained" : "outlined"}
          color="primary"
          onClick={() => setViz("team-comparison")}
        >
          Team Comparison
        </Button>
        <Button
          variant={viz === "stat-delta" ? "contained" : "outlined"}
          color="primary"
          onClick={() => setViz("stat-delta")}
        >
          Stat Delta (Year-Over-Year)
        </Button>
      </Stack>

      {/* Controls */}
      {viz === "team-comparison" ? (
        <Box sx={{ mb: 4 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Year</InputLabel>
              <Select
                value={year}
                label="Year"
                onChange={e => setYear(Number(e.target.value))}
              >
                {years.map(y => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
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
        </Box>
      ) : (
        <Box sx={{ mb: 4 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel>Year 1</InputLabel>
              <Select
                value={year1}
                label="Year 1"
                onChange={e => setYear1(Number(e.target.value))}
              >
                {years.map(y => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel>Year 2</InputLabel>
              <Select
                value={year2}
                label="Year 2"
                onChange={e => setYear2(Number(e.target.value))}
              >
                {years.map(y => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
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
        </Box>
      )}

      {/* Visualization */}
      {viz === "team-comparison" ? (
        <TeamComparisonBar data={regularData} stat={stat} year={year} seasonType="regular" />
      ) : (
        <StatDeltaBar data={regularData} stat={stat} year1={year1} year2={year2} />
      )}
    </Box>
  );
}

export default Dashboard;
