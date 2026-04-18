import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Patient } from "../types";

interface WHODASProfileChartProps {
  patient: Patient;
}

export function WHODASProfileChart({ patient }: WHODASProfileChartProps) {
  // Transform domain scores into chart data
  const chartData = patient.domainScores
    ? [
        {
          domain: "Познание и коммуникация",
          current: patient.domainScores.cognition,
        },
        { domain: "Мобильность", current: patient.domainScores.mobility },
        { domain: "Самообслуживание", current: patient.domainScores.self_care },
        {
          domain: "Межличностные взаимодействия",
          current: patient.domainScores.interaction,
        },
        {
          domain: "Повседневная деятельность",
          current: patient.domainScores.life_activities,
        },
        {
          domain: "Жизнь в обществе",
          current: patient.domainScores.participation,
        },
      ]
    : [];

  return (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        padding: 20,
        border: "1px solid #e2e8f0",
      }}
    >
      <h3
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: "#374151",
          margin: "0 0 16px",
        }}
      >
        Профиль по доменам WHODAS 2.0
      </h3>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart
            data={chartData}
            margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
          >
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="domain"
              tick={{ fontSize: 11, fill: "#6b7280" }}
            />
            <PolarRadiusAxis
              domain={[0, 5]}
              tick={{ fontSize: 9, fill: "#9ca3af" }}
              tickCount={4}
            />
            <Radar
              name="Текущее состояние"
              dataKey="current"
              stroke="#2563eb"
              fill="#2563eb"
              fillOpacity={0.45}
            />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            <Tooltip
              formatter={(v) => {
                if (v === undefined || v === null) return ["", ""];
                const val = typeof v === "number" ? v.toFixed(1) : String(v);
                return [val, "Индекс"];
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      ) : (
        <div
          style={{
            height: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            fontSize: 14,
          }}
        >
          Нет данных опроса
        </div>
      )}
    </div>
  );
}
