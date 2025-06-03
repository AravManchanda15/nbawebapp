import React, { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  Label,
  LabelList,
} from "recharts";
import getTeamLogo from "../data/getTeamLogo";
import statLabels from "../data/statLabels";

const PTS_STAT = "PTS";
const STL_STAT = "STL";
const BLK_STAT = "BLK";

function TeamQuadrantPlot({ data, year, seasonType }) {
  const processedData = useMemo(() => {
    if (!data || !year || !seasonType) return { teams: [], avgPTS: 0, avgDefensiveActivity: 0 };

    const filtered = data.filter(
      (d) =>
        String(d.Year) === String(year) &&
        d.season_type.toLowerCase() === seasonType.toLowerCase() &&
        d[PTS_STAT] !== undefined &&
        d[PTS_STAT] !== null &&
        d[STL_STAT] !== undefined &&
        d[STL_STAT] !== null &&
        d[BLK_STAT] !== undefined &&
        d[BLK_STAT] !== null
    );

    let totalPTS = 0;
    let totalDefensiveActivity = 0;

    const teams = filtered.map((d) => {
      const pts = Number(d[PTS_STAT]);
      const stl = Number(d[STL_STAT]);
      const blk = Number(d[BLK_STAT]);

      if (isNaN(pts) || isNaN(stl) || isNaN(blk)) {
        return null;
      }
      
      const defensiveActivity = stl + blk;

      totalPTS += pts;
      totalDefensiveActivity += defensiveActivity;

      return {
        teamName: d.Team.replace(/\*$/, ""),
        [PTS_STAT]: pts,
        DefensiveActivity: defensiveActivity,
      };
    }).filter(Boolean);

    const numTeams = teams.length;
    const avgPTS = numTeams > 0 ? totalPTS / numTeams : 0;
    const avgDefensiveActivity = numTeams > 0 ? totalDefensiveActivity / numTeams : 0;

    return { teams, avgPTS, avgDefensiveActivity };
  }, [data, year, seasonType]);

  const { teams, avgPTS, avgDefensiveActivity } = processedData;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      if (!d) return null;
      return (
        <div style={{ background: "#f3f4f6", border: "1px solid #ddd", padding: 12, borderRadius: 10 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.teamName}</div>
          <div style={{ color: "#2563eb", fontWeight: 600 }}>
            {statLabels[PTS_STAT] || PTS_STAT}: {d[PTS_STAT].toFixed(1)}
          </div>
          <div style={{ color: "#ef4444", fontWeight: 600 }}>
            Defensive Activity (STL+BLK): {d.DefensiveActivity.toFixed(1)}
          </div>
        </div>
      );
    }
    return null;
  };

  const LOGO_SIZE = 30;
  const renderLogoLabel = (props) => {
    const { x, y, value } = props;
    if (x === undefined || y === undefined || value === undefined) {
      return null;
    }
    const logoSrc = getTeamLogo(value);
    return (
      <image
        href={logoSrc}
        x={x - LOGO_SIZE / 2}
        y={y - LOGO_SIZE / 2}
        width={LOGO_SIZE}
        height={LOGO_SIZE}
        style={{ pointerEvents: "none" }}
      />
    );
  };

  if (!teams || teams.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: 50, fontSize: 18, color: '#555' }}>
        No data available for the selected criteria.
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0px 0 20px" }}>
        Offensive Output vs. Defensive Activity – {year} ({seasonType})
      </h2>
      <ResponsiveContainer width="100%" height={550}>
        <ScatterChart
          margin={{
            top: 20,
            right: 30,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis
            type="number"
            dataKey={PTS_STAT}
            name={statLabels[PTS_STAT] || PTS_STAT}
            stroke="#444"
            tickFormatter={(tick) => tick.toFixed(1)}
            label={{
              value: statLabels[PTS_STAT] || PTS_STAT,
              position: "insideBottom",
              offset: -15,
              style: { textAnchor: "middle", fontWeight: 600, fontSize: 18, fill: "#444" }
            }}
            tick={{ fontSize: 13, fill: "#444" }}
            domain={['dataMin - 2', 'dataMax + 2']}
          />
          <YAxis
            type="number"
            dataKey="DefensiveActivity"
            name="Defensive Activity (STL + BLK)"
            stroke="#444"
            tickFormatter={(tick) => tick.toFixed(1)}
            width={100}
            label={{
              value: "Defensive Activity (STL+BLK)",
              angle: -90,
              position: "insideLeft",
              offset: -10,
              style: { textAnchor: "middle", fontWeight: 600, fontSize: 18, fill: "#444" }
            }}
            tick={{ fontSize: 13, fill: "#444" }}
            domain={['dataMin - 1', 'dataMax + 1']}
          />
          <ZAxis type="category" dataKey="teamName" name="Team" />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<CustomTooltip />} />
          
          <ReferenceLine x={avgPTS} stroke="#888" strokeDasharray="3 3">
            <Label value="Avg PTS" position="top" fill="#555" fontSize={12} />
          </ReferenceLine>
          <ReferenceLine y={avgDefensiveActivity} stroke="#888" strokeDasharray="3 3">
             <Label value="Avg STL+BLK" position="right" fill="#555" fontSize={12} angle={-90} dy={-15} />
          </ReferenceLine>
          
          {/* *** The FIX: Increased radius 'r' for a larger, easier hover target *** */}
          <Scatter name="Teams" data={teams} fill="rgba(100, 100, 255, 0.0)" r={25}>
            <LabelList dataKey="teamName" content={renderLogoLabel} />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
       <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px', flexWrap: 'wrap' }}>
        <div style={{ margin: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', textAlign: 'center', backgroundColor: '#e0f2fe' }}>
          <h4 style={{margin: '0 0 5px 0', fontSize: '14px'}}>High Offense, High Defense</h4>
          <p style={{margin: 0, fontSize: '12px', color: '#555'}}>(Top Right)</p>
        </div>
        <div style={{ margin: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', textAlign: 'center', backgroundColor: '#fef9c3' }}>
          <h4 style={{margin: '0 0 5px 0', fontSize: '14px'}}>Low Offense, High Defense</h4>
          <p style={{margin: 0, fontSize: '12px', color: '#555'}}>(Top Left)</p>
        </div>
        <div style={{ margin: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', textAlign: 'center', backgroundColor: '#fee2e2' }}>
          <h4 style={{margin: '0 0 5px 0', fontSize: '14px'}}>High Offense, Low Defense</h4>
          <p style={{margin: 0, fontSize: '12px', color: '#555'}}>(Bottom Right)</p>
        </div>
        <div style={{ margin: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', textAlign: 'center', backgroundColor: '#f3e8ff' }}>
          <h4 style={{margin: '0 0 5px 0', fontSize: '14px'}}>Low Offense, Low Defense</h4>
          <p style={{margin: 0, fontSize: '12px', color: '#555'}}>(Bottom Left)</p>
        </div>
      </div>
    </div>
  );
}





export default TeamQuadrantPlot;