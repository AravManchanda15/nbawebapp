import React, { useState, useEffect, useMemo } from "react";
import useNBAData from "./hooks/useNBAData";
import TeamComparisonBar from "./components/TeamComparisonBar";
import StatDeltaBar from "./components/StatDeltaBar";
import BestWorstSeasons from "./components/BestWorstSeasons";
import TeamQuadrantPlot from "./components/TeamQuadrantPlot";
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
      !["Year", "Team", "season_type", "unnamed: 0", "Unnamed: 0"].includes(key) &&
      typeof data[0][key] === "number"
  );
}

function Dashboard() {
  const { data, loading, error } = useNBAData();

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

  const [stat, setStat] = useState("");
  const [year, setYear] = useState(() => years[0] || 2023);
  const [year1, setYear1] = useState(() => years[1] || years[0] || 2022);
  const [year2, setYear2] = useState(() => years[0] || 2023);
  const [viz, setViz] = useState("team-comparison");

  useEffect(() => {
    if (years.length > 0) {
      if (!years.includes(year)) setYear(years[0]);
      if (!years.includes(year1)) setYear1(years[1] || years[0]);
      if (!years.includes(year2)) setYear2(years[0]);
    }
  }, [years, year, year1, year2]);

  useEffect(() => {
    if (stat && statKeys.length > 0 && !statKeys.includes(stat)) {
      setStat("");
    }
  }, [statKeys, stat]);

  if (loading) return <Typography>Loading data…</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", px: 2, py: 4 }}>
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
        <Button
          variant={viz === "best-worst" ? "contained" : "outlined"}
          color="primary"
          onClick={() => setViz("best-worst")}
        >
          Best/Worst Seasons
        </Button>
        <Button
          variant={viz === "quadrant-plot" ? "contained" : "outlined"}
          color="primary"
          onClick={() => setViz("quadrant-plot")}
        >
          Offensive vs. Defensive Plot
        </Button>
      </Stack>

      {/* Controls */}
      {viz === "team-comparison" ? (
        <>
          <Box sx={{ mb: 4 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl size="small" sx={{ minWidth: 300 }}>
                <InputLabel id="year-select-label">Year</InputLabel>
                <Select
                  labelId="year-select-label"
                  value={year}
                  label="Year"
                  onChange={e => setYear(Number(e.target.value))}
                >
                  {years.map(y => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                {stat ? (
                  <>
                    <InputLabel id="stat-select-label">Stat</InputLabel>
                    <Select
                      labelId="stat-select-label"
                      value={stat}
                      label="Stat"
                      onChange={e => setStat(e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        <span style={{ color: "#bbb" }}>Select a stat</span>
                      </MenuItem>
                      {statKeys.map(s => (
                        <MenuItem key={s} value={s}>{statLabels[s] || s}</MenuItem>
                      ))}
                    </Select>
                  </>
                ) : (
                  <Select
                    value=""
                    displayEmpty
                    onChange={e => setStat(e.target.value)}
                    sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                  >
                    <MenuItem value="" disabled>
                      <span style={{ color: "#bbb" }}>Select a stat</span>
                    </MenuItem>
                    {statKeys.map(s => (
                      <MenuItem key={s} value={s}>{statLabels[s] || s}</MenuItem>
                    ))}
                  </Select>
                )}
              </FormControl>
            </Stack>
          </Box>
          {!stat && (
            <Typography
              variant="h4"
              sx={{
                textAlign: "center",
                color: "#184189",
                mt: 8,
                mb: 4,
                fontWeight: 500,
                fontSize: { xs: 28, md: 36 }
              }}
            >
              Choose a stat to view NBA team comparisons!
            </Typography>
          )}
        </>
      ) : viz === "stat-delta" ? (
        <>
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
              <FormControl size="small" sx={{ minWidth: 180 }}>
                {stat ? (
                  <>
                    <InputLabel id="stat-select-label-delta">Stat</InputLabel>
                    <Select
                      labelId="stat-select-label-delta"
                      value={stat}
                      label="Stat"
                      onChange={e => setStat(e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        <span style={{ color: "#bbb" }}>Select a stat</span>
                      </MenuItem>
                      {statKeys.map(s => (
                        <MenuItem key={s} value={s}>{statLabels[s] || s}</MenuItem>
                      ))}
                    </Select>
                  </>
                ) : (
                  <Select
                    value=""
                    displayEmpty
                    onChange={e => setStat(e.target.value)}
                    sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                  >
                    <MenuItem value="" disabled>
                      <span style={{ color: "#bbb" }}>Select a stat</span>
                    </MenuItem>
                    {statKeys.map(s => (
                      <MenuItem key={s} value={s}>{statLabels[s] || s}</MenuItem>
                    ))}
                  </Select>
                )}
              </FormControl>
            </Stack>
          </Box>
          {!stat && (
            <Typography
              variant="h4"
              sx={{
                textAlign: "center",
                color: "#184189",
                mt: 8,
                mb: 4,
                fontWeight: 500,
                fontSize: { xs: 28, md: 36 }
              }}
            >
              Choose a stat to view year-over-year NBA stat changes!
            </Typography>
          )}
        </>
      ) : viz === "quadrant-plot" ? (
        <>
          <Box sx={{ mb: 4 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl size="small" sx={{ minWidth: 300 }}>
                <InputLabel id="year-select-quadrant-label">Year</InputLabel>
                <Select
                  labelId="year-select-quadrant-label"
                  value={year}
                  label="Year"
                  onChange={e => setYear(Number(e.target.value))}
                >
                  {years.map(y => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>
          {(!year && years.length > 0) && (
            <Typography
              variant="h4"
              sx={{
                textAlign: "center",
                color: "#184189",
                mt: 8,
                mb: 4,
                fontWeight: 500,
                fontSize: { xs: 28, md: 36 }
              }}
            >
              Choose a year to view the Offensive vs. Defensive Plot!
            </Typography>
          )}
        </>
      ) : (
        <BestWorstSeasons
          data={regularData}
          stat={stat}
          setStat={setStat}
          statKeys={statKeys}
          years={years}
          year={year}
          setYear={setYear}
          loading={loading}
        />
      )}

      {/* Visualization */}
      {viz === "team-comparison" && stat && years.length > 0 && (
        <TeamComparisonBar data={regularData} stat={stat} year={year} seasonType="regular" />
      )}
      {viz === "stat-delta" && stat && years.length > 0 && (
        <StatDeltaBar data={regularData} stat={stat} year1={year1} year2={year2} />
      )}
      {viz === "quadrant-plot" && year && years.length > 0 && (
        <TeamQuadrantPlot data={regularData} year={year} seasonType="regular" />
      )}
    </Box>
  );
}

export default Dashboard;
